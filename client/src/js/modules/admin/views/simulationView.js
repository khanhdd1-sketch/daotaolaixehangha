import { getAdminState } from "../state/adminState.js";
import { buildEmptyRow } from "../utils/adminFormUtils.js";
import { escapeHtml, matchesSearch, normalizeText } from "../../shared/textUtils.js";

/**
 * Tìm tiêu đề đề mô phỏng theo id.
 * @param {string} examId - ID đề
 * @returns {string}
 */
function findSimulationExamTitle(examId) {
  const { simulationExams } = getAdminState();
  return simulationExams.find((item) => item.id === examId)?.title || examId;
}

/**
 * Render danh sách đề mô phỏng.
 */
export function renderSimulationExamList() {
  const { simulationExams } = getAdminState();
  document.getElementById("simulationExamCountBadge").textContent = `${simulationExams.length} đề`;
  document.getElementById("simulationExamList").innerHTML = simulationExams.length
    ? simulationExams.map((exam) => `
      <button class="admin-list-item" type="button" data-simulation-exam-id="${escapeHtml(exam.id)}" data-action="edit-simulation-exam">
        <div>
          <div class="fw-semibold">${escapeHtml(exam.title)}</div>
          <div class="small text-muted">${escapeHtml(exam.course_type || "-")} | Đạt ${exam.pass_score} điểm | ${exam.total_clips} clip</div>
        </div>
        <span class="badge ${exam.active ? "text-bg-success" : "text-bg-secondary"}">${exam.active ? "Đang mở" : "Tạm ẩn"}</span>
      </button>
    `).join("")
    : '<div class="text-muted">Chưa có bài mô phỏng.</div>';
}

/**
 * Đồng bộ select đề cho form clip và bộ lọc.
 */
export function syncSimulationExamSelects() {
  const { simulationExams } = getAdminState();
  const clipExamSelect = document.getElementById("simulationClipExamId");
  const clipFilterSelect = document.getElementById("simulationClipExamFilter");
  if (!clipExamSelect) return;

  const previousClipExam = clipExamSelect.value;
  const previousFilter = clipFilterSelect?.value || "";

  const optionsHtml = simulationExams.map((item) => `
    <option value="${escapeHtml(item.id)}">${escapeHtml(item.course_type || "-")} - ${escapeHtml(item.title)}</option>
  `).join("");

  clipExamSelect.innerHTML = optionsHtml;
  if (clipFilterSelect) {
    clipFilterSelect.innerHTML = `<option value="">Tất cả bài</option>${optionsHtml}`;
    if (simulationExams.some((item) => item.id === previousFilter)) {
      clipFilterSelect.value = previousFilter;
    }
  }
  if (simulationExams.some((item) => item.id === previousClipExam)) {
    clipExamSelect.value = previousClipExam;
  }
}

/**
 * Đọc bộ lọc bảng clip mô phỏng.
 * @returns {{ examId: string, search: string }}
 */
export function getSimulationClipFilters() {
  return {
    examId: document.getElementById("simulationClipExamFilter")?.value || "",
    search: document.getElementById("simulationClipSearchInput")?.value || ""
  };
}

/**
 * Render bảng clip mô phỏng.
 */
export function renderSimulationClipTable() {
  const { simulationClips } = getAdminState();
  const { examId, search } = getSimulationClipFilters();
  const searchTerm = normalizeText(search);
  const filtered = simulationClips.filter((item) => {
    const matchesExam = !examId || item.exam_id === examId;
    const matchesKeyword = matchesSearch(
      [item.title, item.video_url, findSimulationExamTitle(item.exam_id)],
      searchTerm
    );
    return matchesExam && matchesKeyword;
  });

  document.getElementById("simulationClipCountBadge").textContent = `${filtered.length} clip`;
  document.getElementById("simulationClipTable").innerHTML = filtered.length
    ? filtered.map((item) => `
      <tr>
        <td>${escapeHtml(findSimulationExamTitle(item.exam_id))}</td>
        <td>
          <div class="fw-semibold">${escapeHtml(item.title)}</div>
          <div class="small text-muted">${escapeHtml(item.video_url)}</div>
        </td>
        <td>${item.trigger_start_sec}s - ${item.trigger_end_sec}s</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary" type="button" data-simulation-clip-id="${escapeHtml(item.id)}" data-action="edit-simulation-clip">Sửa</button>
          <button class="btn btn-sm btn-outline-danger" type="button" data-simulation-clip-id="${escapeHtml(item.id)}" data-action="delete-simulation-clip">Xóa</button>
        </td>
      </tr>
    `).join("")
    : buildEmptyRow(4, "Chưa có clip phù hợp.");
}

/**
 * Điền form đề mô phỏng.
 * @param {object} item - Bản ghi đề
 */
export function fillSimulationExamForm(item) {
  document.getElementById("simulationExamId").value = item.id || "";
  document.getElementById("simulationExamCourseType").value = item.course_type || "B2";
  document.getElementById("simulationExamTitle").value = item.title || "";
  document.getElementById("simulationExamDescription").value = item.description || "";
  document.getElementById("simulationExamPassScore").value = item.pass_score || "";
  document.getElementById("simulationExamTotalClips").value = item.total_clips || "";
  document.getElementById("simulationExamActive").checked = item.active !== false;
}

/**
 * Reset form đề mô phỏng.
 */
export function resetSimulationExamForm() {
  document.getElementById("simulationExamForm").reset();
  document.getElementById("simulationExamId").value = "";
  document.getElementById("simulationExamCourseType").value = "B2";
  document.getElementById("simulationExamActive").checked = true;
}

/**
 * Điền form clip mô phỏng.
 * @param {object} item - Bản ghi clip
 */
export function fillSimulationClipForm(item) {
  document.getElementById("simulationClipId").value = item.id || "";
  document.getElementById("simulationClipExamId").value = item.exam_id || "";
  document.getElementById("simulationClipTitle").value = item.title || "";
  document.getElementById("simulationClipVideoUrl").value = item.video_url || "";
  document.getElementById("simulationClipOrderNo").value = item.order_no || "";
  document.getElementById("simulationClipTriggerStart").value = item.trigger_start_sec || "";
  document.getElementById("simulationClipTriggerEnd").value = item.trigger_end_sec || "";
  document.getElementById("simulationClipActive").checked = item.active !== false;
}

/**
 * Reset form clip mô phỏng.
 */
export function resetSimulationClipForm() {
  const { simulationExams } = getAdminState();
  document.getElementById("simulationClipForm").reset();
  document.getElementById("simulationClipId").value = "";
  if (simulationExams[0]) {
    document.getElementById("simulationClipExamId").value = simulationExams[0].id;
  }
  document.getElementById("simulationClipActive").checked = true;
}

/**
 * Render section mô phỏng.
 */
export function renderSimulationSection() {
  syncSimulationExamSelects();
  renderSimulationExamList();
  renderSimulationClipTable();
}
