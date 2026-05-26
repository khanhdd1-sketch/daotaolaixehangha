import { patchTheoryState, getTheoryState } from "../state/theoryState.js";
import {
  fetchTheoryWorkspace,
  fetchTheoryExamQuestions,
  submitTheoryExam
} from "../services/studentApiService.js";
import { startTheoryTimer, stopTheoryTimer } from "../services/theoryTimerService.js";
import {
  closeTheoryRunner,
  openTheoryRunner,
  renderTheoryExamGrid,
  setTheoryLoading
} from "../views/theoryView.js";

/**
 * Khởi tạo trang thi lý thuyết.
 * @returns {Promise<void>}
 */
export async function initTheoryExamPage() {
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

  patchTheoryState({ currentUser });
  bindTheoryEvents();
  await refreshTheoryPage();
}

/**
 * Gắn sự kiện trang lý thuyết.
 */
function bindTheoryEvents() {
  document.getElementById("studentLogoutButton")?.addEventListener("click", () =>
    globalThis.DriveSchoolCommon.logoutAndRedirect()
  );
  document.getElementById("theoryExamGrid")?.addEventListener("click", handleTheoryGridClick);
  document.getElementById("theoryExamForm")?.addEventListener("submit", handleTheorySubmit);
  document.getElementById("cancelTheoryButton")?.addEventListener("click", handleCloseTheory);
}

/**
 * Tải workspace và render lưới đề.
 * @returns {Promise<void>}
 */
export async function refreshTheoryPage() {
  setTheoryLoading(true);
  try {
    const workspace = await fetchTheoryWorkspace();
    patchTheoryState({ theoryWorkspace: workspace, loading: false });
    const student = workspace.student || getTheoryState().currentUser;
    const welcome = document.getElementById("welcomeStudent");
    if (welcome) welcome.textContent = student?.name || "Học viên";
    renderTheoryExamGrid();
  } catch (error) {
    globalThis.DriveSchoolCommon.showToast(error.message, "danger");
  } finally {
    setTheoryLoading(false);
  }
}

/**
 * Bắt đầu làm đề khi bấm "Làm đề ngay".
 * @param {MouseEvent} event
 */
async function handleTheoryGridClick(event) {
  const button = event.target.closest("[data-action='start-theory']");
  if (!button) return;
  const examId = button.dataset.examId;
  const detail = await fetchTheoryExamQuestions(examId);
  patchTheoryState({ activeTheoryExam: detail });
  openTheoryRunner();
  const minutes = Number(detail?.exam?.duration_minutes || 20);
  startTheoryTimer(minutes, () => document.getElementById("theoryExamForm")?.requestSubmit());
}

/**
 * Đóng runner và dừng timer.
 */
function handleCloseTheory() {
  stopTheoryTimer();
  patchTheoryState({ activeTheoryExam: null });
  closeTheoryRunner();
}

/**
 * Nộp bài lý thuyết.
 * @param {SubmitEvent} event
 */
async function handleTheorySubmit(event) {
  event.preventDefault();
  const detail = getTheoryState().activeTheoryExam;
  if (!detail?.exam?.id) return;

  const answers = {};
  (detail.questions || []).forEach((question) => {
    const selected = document.querySelector(`input[name="question_${question.id}"]:checked`);
    answers[question.id] = selected ? selected.value : "";
  });

  const data = await submitTheoryExam(detail.exam.id, {
    answers,
    question_ids: (detail.questions || []).map((q) => q.id)
  });
  globalThis.DriveSchoolCommon.showToast("Đã nộp bài lý thuyết.", "success");
  handleCloseTheory();
  globalThis.location.href = globalThis.DriveSchoolCommon.withLangUrl(`/result.html?id=${data.result_id}`);
}
