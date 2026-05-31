
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000"
];

/**
 * Kiểm tra server có đang chạy ở môi trường production hay không.
 * @returns {boolean} `true` khi `NODE_ENV=production`, ngược lại là `false`.
 * @edgecase Nếu biến môi trường chưa được đặt, hàm trả về `false` để giữ trải nghiệm dev an toàn.
 */
function isProduction() {
  return process.env.NODE_ENV === "production";
}

/**
 * Chuẩn hóa origin để so sánh CORS nhất quán.
 * @param {unknown} value - Origin từ cấu hình hoặc header request.
 * @returns {string} Origin đã trim và bỏ dấu `/` cuối chuỗi.
 * @edgecase Giá trị rỗng/không hợp lệ được chuyển thành chuỗi rỗng.
 */
function normalizeOrigin(value) {
  return String(value || "")
    .trim()
    .replace(/\/+$/g, "");
}

/**
 * Lấy danh sách origin được phép gọi API.
 * @returns {string[]} Danh sách origin duy nhất đã chuẩn hóa.
 * @edgecase Nếu `ALLOWED_ORIGINS` chưa cấu hình, dùng danh sách localhost mặc định cho dev/test.
 */
function getAllowedOrigins() {
  const configuredOrigins = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  const origins = configuredOrigins.length ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS;
  return Array.from(new Set(origins));
}

/**
 * Kiểm tra origin của request có nằm trong allowlist hay không.
 * @param {string|undefined} origin - Header `Origin` từ trình duyệt.
 * @returns {boolean} `true` nếu request same-origin/server-side hoặc origin hợp lệ.
 * @edgecase Request không có `Origin` được cho phép để hỗ trợ health check/server-to-server.
 */
function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  return getAllowedOrigins().includes(normalizeOrigin(origin));
}

/**
 * Lấy JWT secret dùng để ký/xác minh token.
 * @returns {string} Secret đã cấu hình hoặc secret dev-only.
 * @throws {Error} Khi production thiếu `JWT_SECRET`.
 * @edgecase Dev/test được cấp fallback để chạy local nhưng không được dùng cho production.
 */
function getJwtSecret() {
  const secret = String(process.env.JWT_SECRET || "").trim();

  if (secret) {
    return secret;
  }

  if (isProduction()) {
    throw new Error("JWT_SECRET must be configured in production");
  }

  return "dev-only-insecure-secret-change-me";
}

/**
 * Kiểm tra ứng dụng có dùng dữ liệu mock hay không.
 * @returns {boolean} `true` khi `USE_MOCK_DATA` khác `false`.
 * @edgecase Mặc định bật mock để onboarding local nhanh, nhưng production bị chặn trong runtime assertion.
 */
function isMockModeEnabled() {
  return String(process.env.USE_MOCK_DATA || "true").toLowerCase() === "true";
}

/**
 * Xác thực cấu hình runtime trước khi app phục vụ request.
 * @returns {void}
 * @throws {Error} Khi thiếu secret hoặc bật mock trong production.
 * @edgecase Hàm chạy sớm ở boot để fail-fast thay vì lỗi âm thầm khi có traffic thật.
 */
function assertSecureRuntimeConfig() {
  getJwtSecret();

  if (isProduction() && isMockModeEnabled()) {
    throw new Error("USE_MOCK_DATA must be disabled in production");
  }
}

module.exports = {
  assertSecureRuntimeConfig,
  getAllowedOrigins,
  getJwtSecret,
  isAllowedOrigin,
  isMockModeEnabled,
  isProduction
};
