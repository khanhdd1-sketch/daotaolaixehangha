import { getAdminState, patchAdminState } from "../state/adminState.js";
import {
  createStudent,
  deleteLesson,
  deleteLessonQuestion,
  deleteSimulationClip,
  deleteTheoryQuestion,
  fetchAdminDashboard,
  fetchAllLessonQuestions,
  fetchLessons,
  fetchLessonQuestionImageUploadConfig,
  fetchPaginatedResultRows,
  fetchQuestionImageUploadConfig,
  fetchSimulationClipsForExams,
  fetchSimulationExams,
  fetchTheoryQuestions,
  saveLesson,
  saveLessonQuestion,
  saveSimulationClip,
  saveSimulationExam,
  saveTheoryExam,
  saveTheoryQuestion,
  uploadQuestionImageToCloudinary,
  uploadLessonQuestionImageToCloudinary
} from "../services/adminApiService.js";
import { serializeForm } from "../utils/adminFormUtils.js";
import { confirmDestructive } from "../../shared/views/confirmModalView.js";
import { renderDashboardStats, renderAdminCharts } from "../views/dashboardOverviewView.js";
import { renderStudentsSection } from "../views/studentsView.js";
import {
  fillTheoryExamForm,
  fillTheoryQuestionForm,
  renderTheorySection,
  resetTheoryExamForm,
  resetTheoryQuestionForm
} from "../views/theoryView.js";
import {
  fillSimulationClipForm,
  fillSimulationExamForm,
  renderSimulationSection,
  resetSimulationClipForm,
  resetSimulationExamForm
} from "../views/simulationView.js";
import {
  fillLessonForm,
  fillLessonQuestionForm,
  renderLessonsSection,
  resetLessonForm,
  resetLessonQuestionForm
} from "../views/lessonsView.js";
import {
  getResultTableFilters,
  openProofPreview,
  renderPaginatedResultsTable,
  resetProofPreviewModal
} from "../views/resultsView.js";

/**
 * Khởi tạo modal xem minh chứng (trang có #proofPreviewModal).
 */
export function setupProofPreviewModal() {
  const modalEl = document.getElementById("proofPreviewModal");
  if (!modalEl) return;
  patchAdminState({
    proofPreviewModal: new bootstrap.Modal(modalEl)
  });
  modalEl.addEventListener("hidden.bs.modal", resetProofPreviewModal);
}

/**
 * Tải dữ liệu hub tổng quan.
 * @returns {Promise<void>}
 */
export async function refreshAdminOverview() {
  const from = document.getElementById("filterDate")?.value || "";
  const course = document.getElementById("filterCourse")?.value || "";
  const dashboard = await fetchAdminDashboard({ from, course });

  patchAdminState({
    dashboard,
    students: dashboard.students || [],
    registrations: dashboard.stats?.registrations || [],
    examResults: dashboard.exam_results || [],
    simulationAttempts: dashboard.simulation_attempts || [],
    thirdPartyAttempts: dashboard.third_party_attempts || []
  });

  renderDashboardStats(from, course);
  renderAdminCharts();
}

/**
 * Tải trang học viên.
 * @returns {Promise<void>}
 */
export async function refreshAdminStudents() {
  const dashboard = await fetchAdminDashboard({});
  patchAdminState({
    students: dashboard.students || [],
    registrations: dashboard.stats?.registrations || []
  });
  renderStudentsSection();
}

/**
 * Tải trang lý thuyết.
 * @returns {Promise<void>}
 */
export async function refreshAdminTheory() {
  const [dashboard, questions] = await Promise.all([fetchAdminDashboard({}), fetchTheoryQuestions()]);
  patchAdminState({
    exams: dashboard.exams || [],
    questions
  });
  renderTheorySection(setQuestionImagePreview);
}

/**
 * Tải trang mô phỏng.
 * @returns {Promise<void>}
 */
export async function refreshAdminSimulation() {
  const simulationExams = await fetchSimulationExams();
  const simulationClips = await fetchSimulationClipsForExams(simulationExams);
  patchAdminState({ simulationExams, simulationClips });
  renderSimulationSection();
}

/**
 * Tải trang bài học.
 * @returns {Promise<void>}
 */
export async function refreshAdminLessons() {
  const lessons = await fetchLessons();
  const lessonQuestions = await fetchAllLessonQuestions(lessons);
  patchAdminState({ lessons, lessonQuestions });
  renderLessonsSection();
}

/**
 * Tải bảng kết quả phân trang.
 * @param {number} [page]
 * @param {number} [limit]
 * @returns {Promise<void>}
 */
export async function refreshAdminResultsPage(page, limit) {
  const state = getAdminState();
  const pagination = state.resultsPagination;
  const nextPage = page ?? pagination.page;
  const nextLimit = limit ?? pagination.limit;
  const filters = getResultTableFilters();

  const response = await fetchPaginatedResultRows({
    page: nextPage,
    limit: nextLimit,
    ...filters
  });

  const nextPagination = {
    page: response.page,
    limit: response.limit,
    total: response.total,
    totalPages: response.totalPages
  };
  patchAdminState({ resultsPagination: nextPagination });

  renderPaginatedResultsTable(response.data, nextPagination, (newPage, newLimit) => {
    void refreshAdminResultsPage(newPage, newLimit);
  });
}

async function reloadCurrentPage() {
  const { activePageId } = getAdminState();
  switch (activePageId) {
    case "students":
      return refreshAdminStudents();
    case "theory":
      return refreshAdminTheory();
    case "simulation":
      return refreshAdminSimulation();
    case "lessons":
      return refreshAdminLessons();
    case "results":
      return refreshAdminResultsPage();
    default:
      return refreshAdminOverview();
  }
}

export function bindOverviewEvents() {
  document.getElementById("filterButton")?.addEventListener("click", refreshAdminOverview);
}

export function bindStudentsEvents() {
  document.getElementById("createStudentForm")?.addEventListener("submit", handleStudentSubmit);
  const rerender = () => renderStudentsSection();
  ["studentSearchInput", "registrationSearchInput"].forEach((id) =>
    document.getElementById(id)?.addEventListener("input", rerender)
  );
  ["studentCourseFilterLocal", "registrationCourseFilterLocal"].forEach((id) =>
    document.getElementById(id)?.addEventListener("change", rerender)
  );
}

export function bindTheoryEvents() {
  document.getElementById("examForm")?.addEventListener("submit", handleExamSubmit);
  document.getElementById("questionForm")?.addEventListener("submit", handleQuestionSubmit);
  document.getElementById("questionImageFile")?.addEventListener("change", handleQuestionImageChange);
  document.getElementById("resetExamFormButton")?.addEventListener("click", resetTheoryExamForm);
  document.getElementById("resetQuestionFormButton")?.addEventListener("click", () =>
    resetTheoryQuestionForm(setQuestionImagePreview)
  );
  document.getElementById("questionSearchInput")?.addEventListener("input", () =>
    renderTheorySection(setQuestionImagePreview)
  );
  ["questionExamId", "questionExamFilter"].forEach((id) =>
    document.getElementById(id)?.addEventListener("change", () => renderTheorySection(setQuestionImagePreview))
  );
  document.getElementById("examList")?.addEventListener("click", handleExamListClick);
  document.getElementById("questionTable")?.addEventListener("click", handleQuestionTableClick);
}

export function bindSimulationEvents() {
  document.getElementById("simulationExamForm")?.addEventListener("submit", handleSimulationExamSubmit);
  document.getElementById("simulationClipForm")?.addEventListener("submit", handleSimulationClipSubmit);
  document.getElementById("resetSimulationExamFormButton")?.addEventListener("click", resetSimulationExamForm);
  document.getElementById("resetSimulationClipFormButton")?.addEventListener("click", resetSimulationClipForm);
  document.getElementById("simulationClipSearchInput")?.addEventListener("input", renderSimulationSection);
  ["simulationClipExamId", "simulationClipExamFilter"].forEach((id) =>
    document.getElementById(id)?.addEventListener("change", renderSimulationSection)
  );
  document.getElementById("simulationExamList")?.addEventListener("click", handleSimulationExamListClick);
  document.getElementById("simulationClipTable")?.addEventListener("click", handleSimulationClipTableClick);
}

export function bindLessonsEvents() {
  document.getElementById("lessonForm")?.addEventListener("submit", handleLessonSubmit);
  document.getElementById("lessonQuestionForm")?.addEventListener("submit", handleLessonQuestionSubmit);
  document.getElementById("resetLessonFormButton")?.addEventListener("click", resetLessonForm);
  document.getElementById("resetLessonQuestionFormButton")?.addEventListener("click", resetLessonQuestionForm);
  ["lessonSearchInput", "lessonQuestionSearchInput"].forEach((id) =>
    document.getElementById(id)?.addEventListener("input", renderLessonsSection)
  );
  ["lessonListCourseFilter", "lessonQuestionLessonFilter", "lessonQuestionLessonId"].forEach((id) =>
    document.getElementById(id)?.addEventListener("change", renderLessonsSection)
  );
  document.getElementById("lessonList")?.addEventListener("click", handleLessonListClick);
  document.getElementById("lessonQuestionTable")?.addEventListener("click", handleLessonQuestionTableClick);
}

export function bindResultsPageEvents() {
  const reloadFiltered = () => {
    patchAdminState({ resultsPagination: { ...getAdminState().resultsPagination, page: 1 } });
    void refreshAdminResultsPage(1);
  };
  ["resultSearchInput"].forEach((id) => document.getElementById(id)?.addEventListener("input", reloadFiltered));
  ["resultCourseFilter", "resultTypeFilter", "resultStatusFilter"].forEach((id) =>
    document.getElementById(id)?.addEventListener("change", reloadFiltered)
  );
  document.getElementById("resultTable")?.addEventListener("click", handleResultTableClick);
}

async function handleStudentSubmit(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  await createStudent(payload);
  event.currentTarget.reset();
  document.getElementById("studentPassword").value = "Student@123";
  globalThis.DriveSchoolCommon.showToast("Đã tạo học viên.", "success");
  await reloadCurrentPage();
}

async function handleExamSubmit(event) {
  event.preventDefault();
  const payload = serializeForm(event.currentTarget);
  await saveTheoryExam(payload);
  resetTheoryExamForm();
  globalThis.DriveSchoolCommon.showToast("Đã lưu đề lý thuyết.", "success");
  await reloadCurrentPage();
}

async function handleQuestionSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const imageFile = document.getElementById("questionImageFile").files[0];
  const payload = serializeForm(form);
  const submitButton = form.querySelector("button[type='submit']");
  const urlField = document.getElementById("questionImageUrl");

  submitButton.disabled = true;
  try {
    if (imageFile) {
      const uploadConfig = await fetchQuestionImageUploadConfig(payload.exam_id);
      payload.image_url = await uploadQuestionImageToCloudinary(imageFile, uploadConfig);
      urlField.value = payload.image_url;
      document.getElementById("questionImageHelp").textContent = "Ảnh câu hỏi đã được upload.";
    }
    await saveTheoryQuestion(payload);
    resetTheoryQuestionForm(setQuestionImagePreview);
    globalThis.DriveSchoolCommon.showToast("Đã lưu câu hỏi.", "success");
    await reloadCurrentPage();
  } finally {
    submitButton.disabled = false;
  }
}

async function handleSimulationExamSubmit(event) {
  event.preventDefault();
  const payload = serializeForm(event.currentTarget);
  await saveSimulationExam(payload);
  resetSimulationExamForm();
  globalThis.DriveSchoolCommon.showToast("Đã lưu đề mô phỏng.", "success");
  await reloadCurrentPage();
}

async function handleSimulationClipSubmit(event) {
  event.preventDefault();
  const payload = serializeForm(event.currentTarget);
  await saveSimulationClip(payload);
  resetSimulationClipForm();
  globalThis.DriveSchoolCommon.showToast("Đã lưu clip mô phỏng.", "success");
  await reloadCurrentPage();
}

async function handleLessonSubmit(event) {
  event.preventDefault();
  const payload = serializeForm(event.currentTarget);
  await saveLesson(payload);
  resetLessonForm();
  globalThis.DriveSchoolCommon.showToast("Đã lưu bài học.", "success");
  await reloadCurrentPage();
}


async function handleLessonQuestionSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const imageFile = document.getElementById("lessonQuestionImageFile").files[0];
  const payload = serializeForm(form);
  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;

  try {
    if (imageFile) {
      // ✅ Lấy config từ BE
      const uploadConfig = await fetchLessonQuestionImageUploadConfig(payload.lesson_id);

      // ✅ Upload Cloudinary
      payload.image_url = await uploadLessonQuestionImageToCloudinary(
        imageFile,
        uploadConfig
      );
    }

    await saveLessonQuestion(payload);
    resetLessonQuestionForm();

    globalThis.DriveSchoolCommon.showToast(
      "Đã lưu câu hỏi bài học.",
      "success"
    );

    await reloadCurrentPage();
  } finally {
    submitButton.disabled = false;
  }
}

function handleExamListClick(event) {
  const button = event.target.closest("[data-action='edit-exam']");
  if (!button) return;
  const exam = getAdminState().exams.find((item) => item.id === button.dataset.examId);
  if (exam) fillTheoryExamForm(exam);
}

async function handleQuestionTableClick(event) {
  const previewButton = event.target.closest("[data-action='preview-question-image']");
  if (previewButton) {
    setQuestionImagePreview(previewButton.dataset.imageUrl || "");
    return;
  }

  const editButton = event.target.closest("[data-action='edit-question']");
  if (editButton) {
    const item = getAdminState().questions.find((q) => q.id === editButton.dataset.questionId);
    if (item) fillTheoryQuestionForm(item, setQuestionImagePreview);
    return;
  }

  const deleteButton = event.target.closest("[data-action='delete-question']");
  if (!deleteButton) return;
  const confirmed = await confirmDestructive({
    title: "Xóa câu hỏi",
    message: "Bạn có chắc muốn xóa câu hỏi lý thuyết này? Hành động không thể hoàn tác.",
    confirmLabel: "Xóa câu hỏi"
  });
  if (!confirmed) return;
  await deleteTheoryQuestion(deleteButton.dataset.questionId);
  globalThis.DriveSchoolCommon.showToast("Đã xóa câu hỏi.", "success");
  await reloadCurrentPage();
}

function handleSimulationExamListClick(event) {
  const button = event.target.closest("[data-action='edit-simulation-exam']");
  if (!button) return;
  const exam = getAdminState().simulationExams.find((item) => item.id === button.dataset.simulationExamId);
  if (exam) fillSimulationExamForm(exam);
}

async function handleSimulationClipTableClick(event) {
  const editButton = event.target.closest("[data-action='edit-simulation-clip']");
  if (editButton) {
    const item = getAdminState().simulationClips.find((clip) => clip.id === editButton.dataset.simulationClipId);
    if (item) fillSimulationClipForm(item);
    return;
  }

  const deleteButton = event.target.closest("[data-action='delete-simulation-clip']");
  if (!deleteButton) return;
  const confirmed = await confirmDestructive({
    title: "Xóa clip mô phỏng",
    message: "Bạn có chắc muốn xóa clip này?",
    confirmLabel: "Xóa clip"
  });
  if (!confirmed) return;
  await deleteSimulationClip(deleteButton.dataset.simulationClipId);
  globalThis.DriveSchoolCommon.showToast("Đã xóa clip mô phỏng.", "success");
  await reloadCurrentPage();
}

function handleLessonListClick(event) {
  const editButton = event.target.closest("[data-action='edit-lesson']");
  if (editButton) {
    const lesson = getAdminState().lessons.find((item) => item.id === editButton.dataset.lessonId);
    if (lesson) fillLessonForm(lesson);
    return;
  }

  const deleteButton = event.target.closest("[data-action='delete-lesson']");
  if (!deleteButton) return;
  void deleteLessonAndRefresh(deleteButton.dataset.lessonId);
}

async function deleteLessonAndRefresh(lessonId) {
  const confirmed = await confirmDestructive({
    title: "Xóa bài học",
    message: "Xóa bài học này? Câu hỏi quiz liên quan có thể cần xóa thủ công.",
    confirmLabel: "Xóa bài học"
  });
  if (!confirmed) return;
  await deleteLesson(lessonId);
  globalThis.DriveSchoolCommon.showToast("Đã xóa bài học.", "success");
  await reloadCurrentPage();
}

async function handleLessonQuestionTableClick(event) {
  const editButton = event.target.closest("[data-action='edit-lesson-question']");
  if (editButton) {
    const item = getAdminState().lessonQuestions.find((q) => q.id === editButton.dataset.lessonQuestionId);
    if (item) fillLessonQuestionForm(item);
    return;
  }

  const deleteButton = event.target.closest("[data-action='delete-lesson-question']");
  if (!deleteButton) return;
  const confirmed = await confirmDestructive({
    title: "Xóa câu hỏi bài học",
    message: "Bạn có chắc muốn xóa câu hỏi quiz này?",
    confirmLabel: "Xóa câu hỏi"
  });
  if (!confirmed) return;
  await deleteLessonQuestion(deleteButton.dataset.lessonQuestionId);
  globalThis.DriveSchoolCommon.showToast("Đã xóa câu hỏi bài học.", "success");
  await reloadCurrentPage();
}

function handleResultTableClick(event) {
  const previewButton = event.target.closest("[data-proof-index]");
  if (!previewButton) return;
  const index = Number(previewButton.dataset.proofIndex);
  if (!Number.isInteger(index) || index < 0) return;
  openProofPreview(index);
}

function handleQuestionImageChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    const currentUrl = document.getElementById("questionImageUrl").value.trim();
    setQuestionImagePreview(currentUrl);
    return;
  }

  if (!String(file.type || "").startsWith("image/")) {
    event.target.value = "";
    globalThis.DriveSchoolCommon.showToast("Vui lòng chọn file ảnh hợp lệ.", "warning");
    return;
  }

  const previewUrl = URL.createObjectURL(file);
  setQuestionImagePreview(previewUrl, true);
  document.getElementById("questionImageHelp").textContent = `Sẽ upload ảnh: ${file.name}`;
}

function setQuestionImagePreview(url, isObjectUrl = false) {
  const adminState = getAdminState();
  const wrap = document.getElementById("questionImagePreviewWrap");
  const image = document.getElementById("questionImagePreview");
  const help = document.getElementById("questionImageHelp");
  if (!wrap || !image || !help) return;

  if (adminState.questionImageObjectUrl) {
    URL.revokeObjectURL(adminState.questionImageObjectUrl);
    patchAdminState({ questionImageObjectUrl: "" });
  }

  if (!url) {
    image.removeAttribute("src");
    wrap.classList.add("d-none");
    help.textContent = "Ảnh sẽ được upload lên folder Cloudinary riêng cho câu hỏi.";
    return;
  }

  if (isObjectUrl) {
    patchAdminState({ questionImageObjectUrl: url });
  }

  image.src = url;
  wrap.classList.remove("d-none");
}
