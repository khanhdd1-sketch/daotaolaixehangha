import { getAdminState } from "../state/adminState.js";

/**
 * Serialize form HTML thành object payload (gồm checkbox).
 * @param {HTMLFormElement} form - Form cần đọc
 * @returns {object} Payload gửi API
 */
export function serializeForm(form) {
  const payload = {};
  new FormData(form).forEach((value, key) => {
    payload[key] = typeof value === "string" ? value.trim() : value;
  });
  form.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    payload[checkbox.name] = checkbox.checked;
  });
  return payload;
}

/**
 * Tạo một hàng trống cho bảng admin.
 * @param {number} colspan - Số cột gộp
 * @param {string} message - Thông báo hiển thị
 * @returns {string} HTML hàng `<tr>`
 */
export function buildEmptyRow(colspan, message) {
  return `<tr><td colspan="${colspan}" class="text-center text-muted py-4">${message}</td></tr>`;
}

/**
 * Cấu hình mặc định cho biểu đồ Chart.js.
 * @param {object} [overrides] - Ghi đè tùy chọn
 * @returns {object} Chart options
 */
export function buildChartOptions(overrides = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, boxWidth: 10 }
      }
    },
    ...overrides
  };
}

/**
 * Tạo hoặc thay thế biểu đồ Chart.js trên canvas.
 * @param {"overview"|"channels"} chartKey - Khóa chart trong state
 * @param {string} canvasId - id phần tử canvas
 * @param {object} config - Cấu hình Chart.js
 * @sideeffects destroy chart cũ nếu có
 */
export function upsertChart(chartKey, canvasId, config) {
  if (!globalThis.Chart) return;
  const adminState = getAdminState();
  if (adminState.charts[chartKey]) {
    adminState.charts[chartKey].destroy();
  }
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  adminState.charts[chartKey] = new globalThis.Chart(canvas, config);
}

/**
 * Kiểm tra URL an toàn (http/https hoặc data:image base64).
 * @param {unknown} value - Chuỗi URL
 * @param {{ allowDataImage?: boolean }} [options] - Cho phép data URI ảnh
 * @returns {string} URL an toàn hoặc rỗng
 */
export function getSafeLink(value, { allowDataImage = false } = {}) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (allowDataImage && /^data:image\/[a-z0-9.+-]+;base64,/i.test(url)) return url;
  return "";
}

/**
 * Tạo badge mô tả bộ lọc dashboard đang áp dụng.
 * @param {string} fromDate - Ngày bắt đầu (input date)
 * @param {string} course - Loại bằng
 * @returns {string} Nhãn hiển thị
 */
export function buildFilterBadge(fromDate, course) {
  if (!fromDate && !course) return "Toàn bộ dữ liệu";
  return [fromDate ? `Từ ${fromDate}` : "", course ? `Bằng ${course}` : ""].filter(Boolean).join(" | ");
}
