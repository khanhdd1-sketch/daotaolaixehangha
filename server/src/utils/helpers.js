
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */
const crypto = require("node:crypto");

function createId(prefix) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

function nowIso() {
  return new Date().toISOString();
}

function parseBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1" || value === "on";
}

function sanitizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeCourseType(courseType) {
  return String(courseType || "").trim().toUpperCase();
}

function parseJsonSafe(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeChoice(value) {
  return String(value || "").trim().toUpperCase();
}

module.exports = {
  createId,
  nowIso,
  parseBoolean,
  sanitizeEmail,
  normalizeCourseType,
  parseJsonSafe,
  normalizeChoice
};
