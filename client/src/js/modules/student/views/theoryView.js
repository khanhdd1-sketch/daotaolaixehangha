import { escapeHtml } from "../../shared/textUtils.js";
import { getTheoryState } from "../state/theoryState.js";

/**
 * Hiển thị trạng thái loading trang lý thuyết.
 * @param {boolean} isLoading
 * @sideeffects Toggle class trên shell loading/content
 */
export function setTheoryLoading(isLoading) {
  const loading = document.getElementById("theoryLoadingShell");
  const content = document.getElementById("theoryContentShell");
  if (loading) loading.classList.toggle("d-none", !isLoading);
  if (content) content.classList.toggle("d-none", isLoading);
}

/**
 * Render lưới chọn đề thi.
 * @sideeffects Ghi #theoryExamGrid
 */
export function renderTheoryExamGrid() {
  const grid = document.getElementById("theoryExamGrid");
  const badge = document.getElementById("theoryExamBadge");
  const exams = getTheoryState().theoryWorkspace.exams || [];
  if (badge) badge.textContent = `${exams.length} đề`;
  if (!grid) return;

  grid.innerHTML = exams.length
    ? exams
        .map(
          (exam) => `
      <div class="col-lg-4 col-md-6">
        <article class="question-card h-100">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
            <div>
              <div class="section-badge mb-2">${escapeHtml(exam.course_type || "-")}</div>
              <h3 class="h5 mb-1">${escapeHtml(exam.title)}</h3>
              <p class="text-muted mb-0">${exam.total_questions} câu | Đạt ${exam.pass_score} | ${exam.duration_minutes} phút</p>
            </div>
            ${exam.passed ? '<span class="badge text-bg-success">Đã đạt</span>' : '<span class="badge text-bg-light">Chưa đạt</span>'}
          </div>
          <div class="small text-muted mb-3">
            Lần thi: ${escapeHtml(String(exam.attempt_count || 0))}<br>
            Điểm cao nhất: ${escapeHtml(String(exam.best_score || 0))}
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-primary" type="button" data-action="start-theory" data-exam-id="${escapeHtml(exam.id)}">Làm đề ngay</button>
            ${
              exam.latest_attempt
                ? `<a class="btn btn-outline-secondary" href="${globalThis.DriveSchoolCommon.withLangUrl(`/result.html?id=${exam.latest_attempt.id}`)}">Xem lần gần nhất</a>`
                : ""
            }
          </div>
        </article>
      </div>
    `
        )
        .join("")
    : `<div class="col-12 empty-state"><i class="fa-solid fa-file-circle-question"></i><p>Chưa có đề thi nội bộ cho loại bằng này.</p><a class="btn btn-outline-primary" href="${globalThis.DriveSchoolCommon.withLangUrl("/exam.html")}">Về dashboard</a></div>`;
}

/**
 * Mở form làm bài lý thuyết.
 * @sideeffects Hiện #theoryRunnerSection, render câu hỏi
 */
export function openTheoryRunner() {
  const section = document.getElementById("theoryRunnerSection");
  const detail = getTheoryState().activeTheoryExam;
  if (!section || !detail) return;

  section.classList.remove("d-none");
  const title = document.getElementById("theoryRunnerTitle");
  const meta = document.getElementById("theoryRunnerMeta");
  const list = document.getElementById("theoryQuestionList");

  if (title) title.textContent = detail.exam.title || "Làm đề";
  if (meta) {
    meta.textContent = `${detail.questions.length} câu | ${detail.critical_count || 0} câu điểm liệt | Đạt ${detail.exam.pass_score} | ${detail.exam.duration_minutes} phút`;
  }
  if (list) {
    list.innerHTML = (detail.questions || [])
      .map(
        (question, index) => `
      <article class="question-card mb-3">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
          <div class="fw-semibold">${index + 1}. ${escapeHtml(question.question)}</div>
          ${question.is_critical ? '<span class="badge text-bg-danger">Điểm liệt</span>' : ""}
        </div>
        ${question.image_url ? `<div class="mb-3"><img class="img-fluid rounded border" style="max-height:280px;" src="${escapeHtml(question.image_url)}" alt="Ảnh câu ${index + 1}" loading="lazy"></div>` : ""}
        ${["A", "B", "C", "D"]
          .map(
            (option) => `
          <label class="answer-option">
            <input type="radio" name="question_${escapeHtml(question.id)}" value="${option}">
            <span><strong>${option}.</strong> ${escapeHtml(question[`option_${option.toLowerCase()}`] || "")}</span>
          </label>
        `
          )
          .join("")}
      </article>
    `
      )
      .join("");
  }
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Đóng form làm bài.
 * @sideeffects Ẩn runner, xóa danh sách câu
 */
export function closeTheoryRunner() {
  const section = document.getElementById("theoryRunnerSection");
  const list = document.getElementById("theoryQuestionList");
  if (section) section.classList.add("d-none");
  if (list) list.innerHTML = "";
}
