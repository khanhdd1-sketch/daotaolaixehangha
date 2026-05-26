import { getDashboardState, patchDashboardState } from "../state/dashboardState.js";
import {
  fetchDashboardWorkspaces,
  fetchProofUploadConfig,
  markLessonWatched,
  submitThirdPartyResult,
  uploadProofImage
} from "../services/studentApiService.js";
import {
  renderFullDashboard,
  renderHistoryTable,
  setDashboardLoading,
  syncThirdPartyMeta
} from "../views/dashboardView.js";

let proofPreviewUrl = "";

/**
 * Khởi tạo dashboard học viên: auth, events, tải dữ liệu.
 * @returns {Promise<void>}
 * @sideeffects Redirect nếu chưa đăng nhập hoặc không phải student
 */
export async function initStudentDashboard() {
  await globalThis.DriveSchoolI18n.loadTranslations();
  globalThis.DriveSchoolCommon.initZaloBubble();
  globalThis.DriveSchoolCommon.trackVisit();

  const currentUser = await globalThis.DriveSchoolCommon.getCurrentUser();
  if (!currentUser) {
    globalThis.DriveSchoolCommon.redirectWithLang("/login.html");
    return;
  }
  if (currentUser.role !== "student") {
    globalThis.DriveSchoolCommon.redirectWithLang("/admin.html");
    return;
  }

  patchDashboardState({ currentUser });
  bindDashboardEvents();
  await refreshDashboard();
}

/**
 * Gắn sự kiện DOM cho dashboard.
 * @sideeffects addEventListener trên các control
 */
function bindDashboardEvents() {
  document.getElementById("studentLogoutButton")?.addEventListener("click", () =>
    globalThis.DriveSchoolCommon.logoutAndRedirect()
  );
  document.getElementById("thirdPartyResultForm")?.addEventListener("submit", handleThirdPartySubmit);
  document.getElementById("proofImage")?.addEventListener("change", handleProofImageChange);
  document.getElementById("examType")?.addEventListener("change", syncThirdPartyMeta);
  document.getElementById("historySearchInput")?.addEventListener("input", renderHistoryTable);
  document.getElementById("historyTypeFilter")?.addEventListener("change", renderHistoryTable);
  document.getElementById("historyStatusFilter")?.addEventListener("change", renderHistoryTable);
  document.getElementById("lessonList")?.addEventListener("click", handleLessonListClick);
}

/**
 * Xử lý đánh dấu đã xem bài học.
 * @param {MouseEvent} event
 * @returns {Promise<void>}
 */
async function handleLessonListClick(event) {
  const button = event.target.closest("[data-lesson-action='mark-watched']");
  if (!button || button.disabled) return;

  const lessonId = button.dataset.lessonId;
  if (!lessonId) return;

  button.disabled = true;
  try {
    await markLessonWatched(lessonId);
    globalThis.DriveSchoolCommon.showToast("Đã đánh dấu bài học đã xem.", "success");
    await refreshDashboard();
  } catch (error) {
    globalThis.DriveSchoolCommon.showToast(error.message, "danger");
    button.disabled = false;
  }
}

/**
 * Tải lại toàn bộ workspace và render UI.
 * @returns {Promise<void>}
 */
export async function refreshDashboard() {
  setDashboardLoading(true);
  try {
    const workspaces = await fetchDashboardWorkspaces();
    patchDashboardState({
      loading: false,
      error: null,
      theoryWorkspace: workspaces.theory,
      learningWorkspace: workspaces.learning,
      simulationWorkspace: workspaces.simulation,
      thirdPartyWorkspace: workspaces.thirdParty
    });
    renderFullDashboard();
  } catch (error) {
    patchDashboardState({ loading: false, error: error.message });
    globalThis.DriveSchoolCommon.showToast(error.message, "danger");
  } finally {
    setDashboardLoading(false);
  }
}

/**
 * Xử lý submit form kết quả 3rd-party.
 * @param {SubmitEvent} event
 * @returns {Promise<void>}
 */
async function handleThirdPartySubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type='submit']");
  const payload = Object.fromEntries(new FormData(form).entries());
  const proofFile = document.getElementById("proofImage")?.files?.[0];

  submitButton.disabled = true;
  try {
    if (proofFile) {
      const config = await fetchProofUploadConfig();
      payload.proof_url = await uploadProofImage(proofFile, config);
    }
    await submitThirdPartyResult(payload);
    globalThis.DriveSchoolCommon.showToast("Đã gửi kết quả 3rd-party.", "success");
    form.reset();
    clearProofPreview();
    syncThirdPartyMeta();
    await refreshDashboard();
  } catch (error) {
    globalThis.DriveSchoolCommon.showToast(error.message, "danger");
  } finally {
    submitButton.disabled = false;
  }
}

/**
 * Xem trước ảnh minh chứng trước khi gửi.
 * @param {Event} event
 */
function handleProofImageChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    clearProofPreview();
    return;
  }
  if (!String(file.type || "").startsWith("image/")) {
    event.target.value = "";
    clearProofPreview();
    globalThis.DriveSchoolCommon.showToast("Vui lòng chọn file ảnh.", "warning");
    return;
  }
  if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
  proofPreviewUrl = URL.createObjectURL(file);
  const img = document.getElementById("proofPreviewImage");
  const container = document.getElementById("proofPreviewContainer");
  const help = document.getElementById("proofImageHelp");
  if (img) img.src = proofPreviewUrl;
  container?.classList.remove("d-none");
  if (help) help.textContent = `Đã chọn: ${file.name}`;
}

/**
 * Xóa preview ảnh minh chứng.
 */
function clearProofPreview() {
  if (proofPreviewUrl) {
    URL.revokeObjectURL(proofPreviewUrl);
    proofPreviewUrl = "";
  }
  document.getElementById("proofPreviewImage")?.removeAttribute("src");
  document.getElementById("proofPreviewContainer")?.classList.add("d-none");
  const help = document.getElementById("proofImageHelp");
  if (help) {
    help.textContent =
      "Có thể chụp màn hình kết quả thi trên iPhone, Android hoặc máy tính rồi gửi về hệ thống.";
  }
}
