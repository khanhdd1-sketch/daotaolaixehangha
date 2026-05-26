/**
 * Thông báo API thống nhất (i18n có thể bọc sau).
 * @readonly
 */
const API_MESSAGES = Object.freeze({
  AUTH_REQUIRED: "Authentication required",
  ACCESS_DENIED: "Access denied",
  INVALID_TOKEN: "Invalid or expired token",
  API_NOT_FOUND: "API route not found",
  CSRF_FAILED: "CSRF validation failed",
  INTERNAL_ERROR: "Internal server error"
});

module.exports = { API_MESSAGES };
