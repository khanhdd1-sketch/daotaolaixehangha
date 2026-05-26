import { getAdminState, patchAdminState } from "../state/adminState.js";
import { buildEmptyRow, getSafeLink } from "../utils/adminFormUtils.js";
import { escapeHtml } from "../../shared/textUtils.js";
import { filterResultRows, mergeResultRows } from "../utils/resultsUtils.js";
import { renderResultsPagination } from "./resultsPaginationView.js";

/**
 * Đọc bộ lọc bảng kết quả từ DOM.
 * @returns {{ search: string, course: string, type: string, status: string }}
 */
export function getResultTableFilters() {
  return {
    search: document.getElementById("resultSearchInput")?.value || "",
    course: document.getElementById("resultCourseFilter")?.value || "",
    type: document.getElementById("resultTypeFilter")?.value || "",
    status: document.getElementById("resultStatusFilter")?.value || ""
  };
}

/**
 * Tạo ô nút xem minh chứng 3rd-party.
 * @param {string} proofUrl - URL ảnh
 * @param {number} index - Chỉ số trong filteredResults
 * @returns {string} HTML ô bảng
 */
function renderProofCell(proofUrl, index) {
  const safeUrl = getSafeLink(proofUrl, { allowDataImage: true });
  if (!safeUrl) {
    return '<span class="text-muted">Không có</span>';
  }
  return `<button class="btn btn-outline-primary btn-sm" type="button" data-proof-index="${index}">Xem ảnh</button>`;
}

/**
 * Render bảng kết quả từ dữ liệu phân trang server (trang admin-results).
 * @param {Array<object>} rows - Hàng trang hiện tại
 * @param {object} pagination - Meta phân trang
 * @param {(page: number, limit?: number) => void} onPageChange
 */
export function renderPaginatedResultsTable(rows, pagination, onPageChange) {
  patchAdminState({ filteredResults: rows, paginatedResults: rows });
  document.getElementById("resultCountBadge").textContent = `${pagination.total} kết quả`;
  document.getElementById("resultTable").innerHTML = rows.length
    ? rows.map((item, index) => renderResultRow(item, index)).join("")
    : buildEmptyRow(8, "Chưa có kết quả phù hợp.");
  renderResultsPagination(pagination, onPageChange);
}

/**
 * Render bảng kết quả thi (merge client — dashboard / tương thích cũ).
 */
export function renderResultsTable() {
  const adminState = getAdminState();
  const merged = mergeResultRows({
    examResults: adminState.examResults,
    simulationAttempts: adminState.simulationAttempts,
    thirdPartyAttempts: adminState.thirdPartyAttempts,
    exams: adminState.exams,
    simulationExams: adminState.simulationExams
  });
  const filtered = filterResultRows(merged, getResultTableFilters());
  patchAdminState({ filteredResults: filtered });

  document.getElementById("resultCountBadge").textContent = `${filtered.length} kết quả`;
  document.getElementById("resultTable").innerHTML = filtered.length
    ? filtered.map((item, index) => renderResultRow(item, index)).join("")
    : buildEmptyRow(8, "Chưa có kết quả phù hợp.");
}

/**
 * @param {object} item
 * @param {number} index
 * @returns {string}
 */
function renderResultRow(item, index) {
  return `
      <tr>
        <td>${escapeHtml(item.student_name || item.user_id)}</td>
        <td>${escapeHtml(item.course_type || "-")}</td>
        <td>${escapeHtml(item.source_label)}</td>
        <td>${escapeHtml(item.display_name || "-")}</td>
        <td>#${escapeHtml(String(item.attempt_no || 1))}</td>
        <td>${escapeHtml(String(item.score || 0))}</td>
        <td>${item.passed ? '<span class="badge text-bg-success">Đạt</span>' : '<span class="badge text-bg-danger">Chưa đạt</span>'}</td>
        <td>${globalThis.DriveSchoolCommon.formatDateTime(item.submitted_at)}</td>
        <td>${renderProofCell(item.proof_url, index)}</td>
      </tr>
    `;
}

/**
 * Reset nội dung modal xem minh chứng.
 */
export function resetProofPreviewModal() {
  const previewImage = document.getElementById("proofPreviewImage");
  const previewFallback = document.getElementById("proofPreviewFallback");
  const previewMeta = document.getElementById("proofPreviewMeta");
  const previewUrlGroup = document.getElementById("proofPreviewUrlGroup");
  const previewUrlInput = document.getElementById("proofPreviewUrl");
  const externalLink = document.getElementById("proofPreviewExternalLink");

  previewImage.classList.add("d-none");
  previewImage.removeAttribute("src");
  previewFallback.classList.remove("d-none");
  previewFallback.textContent = "Ảnh minh chứng sẽ hiển thị tại đây.";
  previewMeta.textContent = "Xem nhanh ảnh học viên gửi cho admin.";
  previewUrlGroup.classList.add("d-none");
  previewUrlInput.value = "";
  externalLink.classList.add("d-none");
  externalLink.removeAttribute("href");
}

/**
 * Mở modal xem ảnh minh chứng theo chỉ số hàng đã lọc.
 * @param {number} index - Chỉ số trong filteredResults
 */
export function openProofPreview(index) {
  const { filteredResults, proofPreviewModal } = getAdminState();
  const item = filteredResults[index];
  const proofUrl = item ? getSafeLink(item.proof_url, { allowDataImage: true }) : "";
  const previewImage = document.getElementById("proofPreviewImage");
  const previewFallback = document.getElementById("proofPreviewFallback");
  const previewMeta = document.getElementById("proofPreviewMeta");
  const previewUrlGroup = document.getElementById("proofPreviewUrlGroup");
  const previewUrlInput = document.getElementById("proofPreviewUrl");
  const externalLink = document.getElementById("proofPreviewExternalLink");

  if (!proofUrl) {
    globalThis.DriveSchoolCommon.showToast("Không có ảnh minh chứng để xem.", "warning");
    return;
  }

  previewMeta.textContent = `${item.student_name || item.user_id} | ${item.exam_type || "Minh chứng"}`;
  previewImage.classList.add("d-none");
  previewImage.removeAttribute("src");
  previewFallback.classList.remove("d-none");
  previewFallback.textContent = "Đang tải ảnh minh chứng...";

  if (/^https?:\/\//i.test(proofUrl)) {
    previewUrlInput.value = proofUrl;
    previewUrlGroup.classList.remove("d-none");
  } else {
    previewUrlInput.value = "";
    previewUrlGroup.classList.add("d-none");
  }

  externalLink.href = proofUrl;
  externalLink.classList.remove("d-none");

  previewImage.onload = () => {
    previewFallback.classList.add("d-none");
    previewImage.classList.remove("d-none");
  };
  previewImage.onerror = () => {
    previewImage.classList.add("d-none");
    previewFallback.classList.remove("d-none");
    previewFallback.textContent = "Không thể hiển thị trực tiếp. Bạn có thể mở trong tab mới.";
  };

  previewImage.src = proofUrl;
  proofPreviewModal?.show();
}
