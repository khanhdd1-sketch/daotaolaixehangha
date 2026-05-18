
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */
const { normalizeCourseType, sanitizeEmail } = require("./helpers");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clampString(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function isValidEmail(email) {
  return EMAIL_PATTERN.test(sanitizeEmail(email));
}

function isStrongPassword(password) {
  const value = String(password || "");
  return value.length >= 10
    && /[a-z]/.test(value)
    && /[A-Z]/.test(value)
    && /\d/.test(value)
    && /[^A-Za-z0-9]/.test(value);
}

function isValidCourseType(value) {
  const normalized = normalizeCourseType(value);
  return ["A1", "A2", "B1", "B2", "C1"].includes(normalized);
}

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
