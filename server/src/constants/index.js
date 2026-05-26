/**
 * Barrel export hằng số backend.
 */
const { ROLES } = require("./roles");
const { HTTP_STATUS } = require("./httpStatus");
const { API_MESSAGES } = require("./messages");
const { VALID_COURSE_TYPES } = require("./courseTypes");
const {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  CSRF_SAFE_METHODS,
  CSRF_MAX_AGE_MS
} = require("./csrf");

module.exports = {
  ROLES,
  HTTP_STATUS,
  API_MESSAGES,
  VALID_COURSE_TYPES,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  CSRF_SAFE_METHODS,
  CSRF_MAX_AGE_MS
};
