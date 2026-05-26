import { getAdminState } from "../state/adminState.js";
import { buildEmptyRow } from "../utils/adminFormUtils.js";
import { escapeHtml, matchesSearch, normalizeText } from "../../shared/textUtils.js";

/**
 * Tìm tiêu đề đề lý thuyết theo id.
 * @param {string} examId - ID đề
 * @returns {string}
 */
function findExamTitle(examId) {
  const { exams } = getAdminState();
  return exams.find((item) => item.id === examId)?.title || examId;
}

/**
 * Render danh sách đề lý thuyết (sidebar list).
 */
export function renderTheoryExamList() {
  const { exams } = getAdminState();
  document.getElementById("examCountBadge").textContent = `${exams.length} đề`;
  document.getElementById("examList").innerHTML = exams.length
    ? exams.map((exam) => `
      <button class="admin-list-item" type="button" data-exam-id="${escapeHtml(exam.id)}" data-action="edit-exam">
        <div>
          <div class="fw-semibold">${escapeHtml(exam.title)}</div>
          <div class="small text-muted">${escapeHtml(exam.course_type || "-")} | ${exam.pass_score}/${exam.total_questions} | ${exam.duration_minutes} phút</div>
        </div>
        <span class="badge ${exam.active ? "text-bg-success" : "text-bg-secondary"}">${exam.active ? "Đang mở" : "Tạm ẩn"}</span>
      </button>
    `).join("")
    : '<div class="text-muted">Chưa có đề lý thuyết.</div>';
}

/**
 * Đồng bộ select đề cho form câu hỏi và bộ lọc bảng.
 */
export function syncTheoryExamSelects() {
  const { exams } = getAdminState();
  const questionExamSelect = document.getElementById("questionExamId");
  const questionFilterSelect = document.getElementById("questionExamFilter");
  if (!questionExamSelect) return;

  const previousQuestionExam = questionExamSelect.value;
  const previousFilter = questionFilterSelect?.value || "";

  const optionsHtml = exams.map((item) => `
    <option value="${escapeHtml(item.id)}">${escapeHtml(item.course_type || "-")} - ${escapeHtml(item.title)}</option>
  `).join("");

  questionExamSelect.innerHTML = optionsHtml;
  if (questionFilterSelect) {
    questionFilterSelect.innerHTML = `<option value="">Tất cả đề</option>${optionsHtml}`;
    if (exams.some((item) => item.id === previousFilter)) {
      questionFilterSelect.value = previousFilter;
    }
  }
  if (exams.some((item) => item.id === previousQuestionExam)) {
    questionExamSelect.value = previousQuestionExam;
  }
}

/**
 * Đọc bộ lọc bảng câu hỏi lý thuyết.
 * @returns {{ examId: string, search: string }}
 */
export function getQuestionTableFilters() {
  return {
    examId: document.getElementById("questionExamFilter")?.value || document.getElementById("questionExamId")?.value || "",
    search: document.getElementById("questionSearchInput")?.value || ""
  };
}

/**
 * Render bảng ngân hàng câu hỏi lý thuyết.
 */
export function renderTheoryQuestionTable() {
  const { questions } = getAdminState();
  const { examId, search } = getQuestionTableFilters();
  const searchTerm = normalizeText(search);
  const filtered = questions.filter((item) => {
    const matchesExam = !examId || item.exam_id === examId;
    const matchesKeyword = matchesSearch(
      [item.question, item.explanation, item.correct_answer, findExamTitle(item.exam_id)],
      searchTerm
    );
    return matchesExam && matchesKeyword;
  });

  document.getElementById("questionCountBadge").textContent = `${filtered.length} câu`;
  document.getElementById("questionTable").innerHTML = filtered.length
    ? filtered.map((item) => `
      <tr>
        <td>${escapeHtml(item.exam_title || findExamTitle(item.exam_id))}</td>
        <td>
          <div class="fw-semibold">${escapeHtml(item.question)}</div>
          <div class="small text-muted mt-1">${escapeHtml(item.explanation || "")}</div>
        </td>
        <td>${item.image_url ? `<button class="btn btn-sm btn-outline-secondary" type="button" data-action="preview-question-image" data-image-url="${escapeHtml(item.image_url)}">Xem ảnh</button>` : '<span class="text-muted">Không có</span>'}</td>
        <td>${escapeHtml(item.correct_answer || "-")}</td>
        <td>${item.is_critical ? '<span class="badge text-bg-danger">Điểm liệt</span>' : '<span class="badge text-bg-light">Thường</span>'}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary" type="button" data-question-id="${escapeHtml(item.id)}" data-action="edit-question">Sửa</button>
          <button class="btn btn-sm btn-outline-danger" type="button" data-question-id="${escapeHtml(item.id)}" data-action="delete-question">Xóa</button>
        </td>
      </tr>
    `).join("")
    : buildEmptyRow(6, "Chưa có câu hỏi phù hợp.");
}

/**
 * Điền form đề lý thuyết khi sửa.
 * @param {object} exam - Bản ghi đề
 */
export function fillTheoryExamForm(exam) {
  document.getElementById("examId").value = exam.id || "";
  document.getElementById("examCourseType").value = exam.course_type || "B2";
  document.getElementById("examTitle").value = exam.title || "";
  document.getElementById("examPassScore").value = exam.pass_score || "";
  document.getElementById("examTotalQuestions").value = exam.total_questions || "";
  document.getElementById("examDurationMinutes").value = exam.duration_minutes || 20;
  document.getElementById("examActive").checked = exam.active !== false;
}

/**
 * Reset form đề lý thuyết.
 */
export function resetTheoryExamForm() {
  document.getElementById("examForm").reset();
  document.getElementById("examId").value = "";
  document.getElementById("examCourseType").value = "B2";
  document.getElementById("examDurationMinutes").value = 20;
  document.getElementById("examActive").checked = true;
}

/**
 * Điền form câu hỏi lý thuyết.
 * @param {object} item - Bản ghi câu hỏi
 * @param {(url: string, isObjectUrl?: boolean) => void} setImagePreview - Callback preview ảnh
 */
export function fillTheoryQuestionForm(item, setImagePreview) {
  document.getElementById("questionId").value = item.id || "";
  document.getElementById("questionExamId").value = item.exam_id || "";
  document.getElementById("questionText").value = item.question || "";
  document.getElementById("optionA").value = item.option_a || "";
  document.getElementById("optionB").value = item.option_b || "";
  document.getElementById("optionC").value = item.option_c || "";
  document.getElementById("optionD").value = item.option_d || "";
  document.getElementById("questionCorrectAnswer").value = item.correct_answer || "A";
  document.getElementById("questionCritical").checked = Boolean(item.is_critical);
  document.getElementById("questionExplanation").value = item.explanation || "";
  document.getElementById("questionImageUrl").value = item.image_url || "";
  setImagePreview(item.image_url || "");
}

/**
 * Reset form câu hỏi lý thuyết.
 * @param {(url: string) => void} setImagePreview - Callback preview ảnh
 */
export function resetTheoryQuestionForm(setImagePreview) {
  const { exams } = getAdminState();
  document.getElementById("questionForm").reset();
  document.getElementById("questionId").value = "";
  if (exams[0]) {
    document.getElementById("questionExamId").value = exams[0].id;
  }
  document.getElementById("questionCorrectAnswer").value = "A";
  document.getElementById("questionImageUrl").value = "";
  setImagePreview("");
}

/**
 * Render toàn bộ section lý thuyết.
 * @param {(url: string, isObjectUrl?: boolean) => void} setImagePreview - Callback preview ảnh (optional noop)
 */
export function renderTheorySection(setImagePreview = () => {}) {
  syncTheoryExamSelects();
  renderTheoryExamList();
  renderTheoryQuestionTable();
  void setImagePreview;
}
