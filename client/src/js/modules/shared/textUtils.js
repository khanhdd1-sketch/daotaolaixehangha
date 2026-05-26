/**
 * @typedef {string|number|undefined|null} SearchableValue
 */

/**
 * Chuẩn hóa chuỗi để so khớp tìm kiếm (bỏ dấu, chữ thường).
 * @param {SearchableValue} value - Chuỗi đầu vào
 * @returns {string} Chuỗi đã chuẩn hóa
 */
export function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .trim();
}

/**
 * Kiểm tra danh sách giá trị có chứa từ khóa tìm kiếm hay không.
 * @param {SearchableValue[]} values - Các trường cần quét
 * @param {string} normalizedSearch - Từ khóa đã chuẩn hóa
 * @returns {boolean} true nếu khớp hoặc không có từ khóa
 */
export function matchesSearch(values, normalizedSearch) {
  if (!normalizedSearch) return true;
  return values.some((value) => normalizeText(value).includes(normalizedSearch));
}

/**
 * Escape HTML để chống XSS khi render chuỗi từ API.
 * @param {unknown} value - Giá trị cần escape
 * @returns {string} Chuỗi an toàn cho innerHTML
 */
export function escapeHtml(value) {
  return globalThis.DriveSchoolCommon?.escapeHtml(value) ?? String(value ?? "");
}
