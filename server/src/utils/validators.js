
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hiếu Khánh)
 *
 * All rights reserved.
 */
const { normalizeCourseType, sanitizeEmail } = require("./helpers");
const { VALID_COURSE_TYPES } = require("../constants/courseTypes");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 10;

/**
 * Cắt chuỗi và giới hạn độ dài.
 * @param {unknown} value
 * @param {number} maxLength
 * @returns {string}
 */
function clampString(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

/**
 * Kiểm tra email hợp lệ.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return EMAIL_PATTERN.test(sanitizeEmail(email));
}

/**
 * Mật khẩu mạnh: đủ dài, hoa/thường/số/ký tự đặc biệt.
 * @param {string} password
 * @returns {boolean}
 */
function isStrongPassword(password) {
  const value = String(password || "");
  return value.length >= MIN_PASSWORD_LENGTH
    && /[a-z]/.test(value)
    && /[A-Z]/.test(value)
    && /\d/.test(value)
    && /[^A-Za-z0-9]/.test(value);
}

/**
 * Loại bằng thuộc danh sách cho phép.
 * @param {string} value
 * @returns {boolean}
 */
function isValidCourseType(value) {
  const normalized = normalizeCourseType(value);
  return VALID_COURSE_TYPES.includes(normalized);
}

/**
 * URL http(s) an toàn cho redirect / ảnh.
 * @param {string} value
 * @returns {boolean}
 */
function isSafeHttpUrl(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

module.exports = {
  clampString,
  isSafeHttpUrl,
  isStrongPassword,
  isValidCourseType,
  isValidEmail
};
