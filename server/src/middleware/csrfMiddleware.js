/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hiếu Khánh)
 *
 * All rights reserved.
 */
const crypto = require("node:crypto");
const { isProduction } = require("../config/security");
const {
  HTTP_STATUS,
  API_MESSAGES,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  CSRF_SAFE_METHODS,
  CSRF_MAX_AGE_MS
} = require("../constants");

/**
 * Tùy chọn cookie CSRF theo môi trường.
 * @param {import('express').Request} req
 * @returns {object}
 */
function buildCookieOptions(req) {
  return {
    httpOnly: false,
    sameSite: "strict",
    secure: isProduction() || req.secure,
    path: "/",
    maxAge: CSRF_MAX_AGE_MS
  };
}

/**
 * Sinh token CSRF ngẫu nhiên.
 * @returns {string}
 */
function createCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Ghi cookie CSRF mới.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {string} Token vừa tạo
 */
function issueCsrfCookie(req, res) {
  const token = createCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, token, buildCookieOptions(req));
  return token;
}

/**
 * Đảm bảo mọi phiên cookie-auth có CSRF token.
 * @type {import('express').RequestHandler}
 */
function ensureCsrfCookie(req, res, next) {
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    issueCsrfCookie(req, res);
  }

  return next();
}

/**
 * Xóa cookie CSRF khi đăng xuất.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function clearCsrfCookie(req, res) {
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    sameSite: "strict",
    secure: isProduction() || req.secure,
    path: "/"
  });
}

/**
 * Bắt buộc header CSRF khớp cookie (chỉ auth qua cookie).
 * @type {import('express').RequestHandler}
 */
function requireCsrfToken(req, res, next) {
  if (CSRF_SAFE_METHODS.has(req.method)) {
    return next();
  }

  if (req.authSource && req.authSource !== "cookie") {
    return next();
  }

  const cookieToken = req.cookies ? String(req.cookies[CSRF_COOKIE_NAME] || "") : "";
  const headerToken = String(req.header(CSRF_HEADER_NAME) || "");

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: API_MESSAGES.CSRF_FAILED
    });
  }

  return next();
}

module.exports = {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  clearCsrfCookie,
  ensureCsrfCookie,
  issueCsrfCookie,
  requireCsrfToken
};
