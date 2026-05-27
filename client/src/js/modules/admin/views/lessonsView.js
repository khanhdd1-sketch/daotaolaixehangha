import { getAdminState } from "../state/adminState.js";
import { buildEmptyRow } from "../utils/adminFormUtils.js";
import { escapeHtml, matchesSearch, normalizeText } from "../../shared/textUtils.js";

/**
 * Tìm tiêu đề bài học theo id.
 * @param {string} lessonId - ID bài học
 * @returns {string}
 */
function findLessonTitle(lessonId) {
  const { lessons } = getAdminState();
  return lessons.find((item) => item.id === lessonId)?.title || lessonId;
}

/**
 * Đồng bộ select bài học cho form câu hỏi và bộ lọc.
 */
export function syncLessonSelects() {
  const { lessons } = getAdminState();
  const lessonSelect = document.getElementById("lessonQuestionLessonId");
  const lessonFilter = document.getElementById("lessonQuestionLessonFilter");
  if (!lessonSelect) return;

  const previousLesson = lessonSelect.value;
  const previousQuestionFilter = lessonFilter?.value || "";

  const optionsHtml = lessons.map((item) => `
    <option value="${escapeHtml(item.id)}">${escapeHtml(item.course_type || "-")} - ${escapeHtml(item.title)}</option>
  `).join("");

  lessonSelect.innerHTML = optionsHtml;
  if (lessonFilter) {
    lessonFilter.innerHTML = `<option value="">Tất cả bài</option>${optionsHtml}`;
    if (lessons.some((item) => item.id === previousQuestionFilter)) {
      lessonFilter.value = previousQuestionFilter;
    }
  }
  if (lessons.some((item) => item.id === previousLesson)) {
    lessonSelect.value = previousLesson;
  }
}

/**
 * Đọc bộ lọc danh sách bài học.
 * @returns {{ course: string, search: string }}
 */
export function getLessonListFilters() {
  return {
    course: document.getElementById("lessonListCourseFilter")?.value || "",
    search: document.getElementById("lessonSearchInput")?.value || ""
  };
}

/**
 * Render danh sách bài học (sidebar).
 */
export function renderLessonList() {
  const { lessons } = getAdminState();
  const { course, search } = getLessonListFilters();
  const searchTerm = normalizeText(search);
  const filtered = lessons.filter((item) => {
    return (!course || item.course_type === course) &&
      matchesSearch([item.title, item.description, item.course_type], searchTerm);
  });

  document.getElementById("lessonCountBadge").textContent = `${filtered.length} bài`;
  document.getElementById("lessonList").innerHTML = filtered.length
    ? filtered.map((lesson) => `
      <div class="admin-list-item d-flex align-items-center justify-content-between gap-2">
        <button class="btn btn-link text-start flex-grow-1 p-0 text-decoration-none text-body" type="button" data-lesson-id="${escapeHtml(lesson.id)}" data-action="edit-lesson">
          <div class="fw-semibold">${escapeHtml(lesson.title)}</div>
          <div class="small text-muted">${escapeHtml(lesson.course_type || "-")} | Thứ tự ${lesson.order_no} | Đạt ${lesson.pass_score} câu</div>
        </button>
        <div class="d-flex flex-column align-items-end gap-1">
          <span class="badge ${lesson.active ? "text-bg-success" : "text-bg-secondary"}">${lesson.active ? "Đang mở" : "Tạm ẩn"}</span>
          <button class="btn btn-sm btn-outline-danger" type="button" data-lesson-id="${escapeHtml(lesson.id)}" data-action="delete-lesson">Xóa</button>
        </div>
        <button 
          class="btn btn-sm btn-outline-primary"
          onclick="${lesson.unlocked ? `window.location.href='/lesson.html?id=${lesson.id}'` : ''}"
        >
          Học thử
        </button>
      </div>
    `).join("")
    : '<div class="text-muted">Chưa có bài học phù hợp.</div>';
}

/**
 * Đọc bộ lọc bảng câu hỏi quiz bài học.
 * @returns {{ lessonId: string, search: string }}
 */
export function getLessonQuestionFilters() {
  return {
    lessonId: document.getElementById("lessonQuestionLessonFilter")?.value || "",
    search: document.getElementById("lessonQuestionSearchInput")?.value || ""
  };
}

/**
 * Render bảng câu hỏi quiz bài học.
 */
export function renderLessonQuestionTable() {
  const { lessonQuestions } = getAdminState();
  const { lessonId, search } = getLessonQuestionFilters();
  const searchTerm = normalizeText(search);
  const filtered = lessonQuestions.filter((item) => {
    const matchesLesson = !lessonId || item.lesson_id === lessonId;
    const matchesKeyword = matchesSearch(
      [item.question, item.explanation, item.correct_answer, findLessonTitle(item.lesson_id)],
      searchTerm
    );
    return matchesLesson && matchesKeyword;
  });

  document.getElementById("lessonQuestionCountBadge").textContent = `${filtered.length} câu`;
  document.getElementById("lessonQuestionTable").innerHTML = filtered.length
    ? filtered.map((item) => `
      <tr>
        <td>${escapeHtml(findLessonTitle(item.lesson_id))}</td>
        <td>
          <div class="fw-semibold">${escapeHtml(item.question)}</div>
          <div class="small text-muted mt-1">${escapeHtml(item.explanation || "")}</div>
        </td>
        <td>${escapeHtml(item.correct_answer || "-")}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary" type="button" data-lesson-question-id="${escapeHtml(item.id)}" data-action="edit-lesson-question">Sửa</button>
          <button class="btn btn-sm btn-outline-danger" type="button" data-lesson-question-id="${escapeHtml(item.id)}" data-action="delete-lesson-question">Xóa</button>
        </td>
      </tr>
    `).join("")
    : buildEmptyRow(4, "Chưa có câu hỏi phù hợp.");
}

/**
 * Điền form bài học.
 * @param {object} lesson - Bản ghi bài học
 */
export function fillLessonForm(lesson) {
  document.getElementById("lessonId").value = lesson.id || "";
  document.getElementById("lessonCourseType").value = lesson.course_type || "B2";
  document.getElementById("lessonTitle").value = lesson.title || "";
  document.getElementById("lessonDescription").value = lesson.description || "";
  document.getElementById("lessonOrderNo").value = lesson.order_no || "";
  document.getElementById("lessonVideoUrl").value = lesson.video_url || "";
  document.getElementById("lessonPassScore").value = lesson.pass_score || "";
  document.getElementById("lessonActive").checked = lesson.active !== false;
}

/**
 * Reset form bài học.
 */
export function resetLessonForm() {
  document.getElementById("lessonForm").reset();
  document.getElementById("lessonId").value = "";
  document.getElementById("lessonCourseType").value = "B2";
  document.getElementById("lessonActive").checked = true;
}

/**
 * Điền form câu hỏi quiz bài học.
 * @param {object} item - Bản ghi câu hỏi
 */
export function fillLessonQuestionForm(item) {
  document.getElementById("lessonQuestionId").value = item.id || "";
  document.getElementById("lessonQuestionLessonId").value = item.lesson_id || "";
  document.getElementById("lessonQuestionText").value = item.question || "";
  document.getElementById("lessonOptionA").value = item.option_a || "";
  document.getElementById("lessonOptionB").value = item.option_b || "";
  document.getElementById("lessonOptionC").value = item.option_c || "";
  document.getElementById("lessonOptionD").value = item.option_d || "";
  document.getElementById("lessonQuestionCorrectAnswer").value = item.correct_answer || "A";
  document.getElementById("lessonQuestionExplanation").value = item.explanation || "";
}

/**
 * Reset form câu hỏi quiz bài học.
 */
export function resetLessonQuestionForm() {
  const { lessons } = getAdminState();
  document.getElementById("lessonQuestionForm").reset();
  document.getElementById("lessonQuestionId").value = "";
  if (lessons[0]) {
    document.getElementById("lessonQuestionLessonId").value = lessons[0].id;
  }
  document.getElementById("lessonQuestionCorrectAnswer").value = "A";
}

/**
 * Render section bài học.
 */
export function renderLessonsSection() {
  syncLessonSelects();
  renderLessonList();
  renderLessonQuestionTable();
}
