/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tam dao tao lai xe Hang Ha)
 *
 * All rights reserved.
 */
const crypto = require("node:crypto");
const { isProduction } = require("../config/security");

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function buildCookieOptions(req) {
  return {
    httpOnly: false,
    sameSite: "strict",
    secure: isProduction() || req.secure,
    path: "/",
    maxAge: 8 * 60 * 60 * 1000
  };
}

function createCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

function issueCsrfCookie(req, res) {
  const token = createCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, token, buildCookieOptions(req));
  return token;
}

function ensureCsrfCookie(req, res, next) {
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    issueCsrfCookie(req, res);
  }

  return next();
}

function clearCsrfCookie(req, res) {
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    sameSite: "strict",
    secure: isProduction() || req.secure,
    path: "/"
  });
}

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
    return res.status(403).json({
      success: false,
      message: "CSRF validation failed"
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
