/**
 * Mã trạng thái HTTP thường dùng ở frontend.
 * @readonly
 */
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404
});

/**
 * Phương thức HTTP an toàn (không gửi CSRF).
 * @readonly
 */
export const SAFE_HTTP_METHODS = Object.freeze(["GET", "HEAD", "OPTIONS"]);

/**
 * Header CSRF cho cookie-auth.
 * @readonly
 */
export const CSRF_HEADER = "X-CSRF-Token";

/**
 * Tên cookie CSRF từ server.
 * @readonly
 */
export const CSRF_COOKIE = "csrf_token";
