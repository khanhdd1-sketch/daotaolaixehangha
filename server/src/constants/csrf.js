/**
 * Hằng số CSRF (cookie + header).
 * @readonly
 */
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_MAX_AGE_MS = 8 * 60 * 60 * 1000;

module.exports = {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  CSRF_SAFE_METHODS,
  CSRF_MAX_AGE_MS
};
