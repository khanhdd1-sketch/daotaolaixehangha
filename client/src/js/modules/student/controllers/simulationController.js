import { getSimulationState, patchSimulationState } from "../state/simulationState.js";
import { fetchSimulationWorkspace, submitSimulationExam } from "../services/studentApiService.js";
import { renderSimulationWorkspace, setSimulationLoading } from "../views/simulationView.js";

/**
 * Khởi tạo trang thi mô phỏng.
 * @returns {Promise<void>}
 */
export async function initSimulationExamPage() {
  await globalThis.DriveSchoolI18n.loadTranslations();
  globalThis.DriveSchoolCommon.initZaloBubble();

  const currentUser = await globalThis.DriveSchoolCommon.getCurrentUser();
  if (!currentUser) {
    globalThis.DriveSchoolCommon.redirectWithLang("/login.html");
    return;
  }
  if (currentUser.role !== "student") {
    globalThis.DriveSchoolCommon.redirectWithLang("/admin.html");
    return;
  }

  patchSimulationState({ currentUser, simulationAnswers: {}, simulationClipIndex: 0 });
  bindSimulationEvents();
  await refreshSimulationPage();
}

/**
 * Gắn sự kiện mô phỏng.
 */
function bindSimulationEvents() {
  document.getElementById("studentLogoutButton")?.addEventListener("click", () =>
    globalThis.DriveSchoolCommon.logoutAndRedirect()
  );
  document.getElementById("simulationWorkspace")?.addEventListener("click", handleSimulationClick);
}

/**
 * Tải workspace mô phỏng.
 * @returns {Promise<void>}
 */
export async function refreshSimulationPage() {
  setSimulationLoading(true);
  try {
    const workspace = await fetchSimulationWorkspace();
    patchSimulationState({ simulationWorkspace: workspace, loading: false });
    const student = workspace.student || getSimulationState().currentUser;
    const welcome = document.getElementById("welcomeStudent");
    if (welcome) welcome.textContent = student?.name || "Học viên";
    renderSimulationWorkspace();
  } catch (error) {
    globalThis.DriveSchoolCommon.showToast(error.message, "danger");
  } finally {
    setSimulationLoading(false);
  }
}

/**
 * Xử lý click trên workspace (clip, capture, submit).
 * @param {MouseEvent} event
 */
function handleSimulationClick(event) {
  const actionNode = event.target.closest("[data-action]");
  if (!actionNode) return;

  const state = getSimulationState();
  const clips = state.simulationWorkspace.clips || [];

  switch (actionNode.dataset.action) {
    case "prev-simulation":
      patchSimulationState({
        simulationClipIndex: Math.max(0, state.simulationClipIndex - 1)
      });
      renderSimulationWorkspace();
      break;
    case "next-simulation":
      patchSimulationState({
        simulationClipIndex: Math.min(clips.length - 1, state.simulationClipIndex + 1)
      });
      renderSimulationWorkspace();
      break;
    case "jump-simulation":
      patchSimulationState({
        simulationClipIndex: Number(actionNode.dataset.clipIndex || 0)
      });
      renderSimulationWorkspace();
      break;
    case "capture-simulation":
      captureSimulationMoment();
      break;
    case "submit-simulation":
      submitSimulationAttempt();
      break;
    default:
      break;
  }
}

/**
 * Ghi nhận thời điểm bấm trên video hiện tại.
 */
function captureSimulationMoment() {
  const state = getSimulationState();
  const video = document.getElementById("simulationVideo");
  const clip = (state.simulationWorkspace.clips || [])[state.simulationClipIndex];
  if (!video || !clip) return;
  const answers = { ...state.simulationAnswers, [clip.id]: Number(video.currentTime || 0).toFixed(1) };
  patchSimulationState({ simulationAnswers: answers });
  renderSimulationWorkspace();
  globalThis.DriveSchoolCommon.showToast(`Đã ghi nhận ${answers[clip.id]}s`, "success");
}

/**
 * Nộp bài mô phỏng lên API.
 * @returns {Promise<void>}
 */
async function submitSimulationAttempt() {
  const state = getSimulationState();
  const exam = state.simulationWorkspace.exam;
  if (!exam?.id) return;
  const data = await submitSimulationExam(exam.id, state.simulationAnswers);
  globalThis.DriveSchoolCommon.showToast(`Đã nộp bài mô phỏng. Điểm: ${data.score}`, "success");
  patchSimulationState({ simulationAnswers: {}, simulationClipIndex: 0 });
  await refreshSimulationPage();
}
