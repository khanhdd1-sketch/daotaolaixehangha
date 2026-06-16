
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hiếu Khánh)
 *
 * All rights reserved.
 */
const { verifyToken } = require("../services/authService");
const { HTTP_STATUS } = require("../constants/httpStatus");
const { API_MESSAGES } = require("../constants/messages");

/**
 * Lấy JWT từ cookie hoặc header Authorization.
 * @param {import('express').Request} req
 * @returns {{ token: string, source: 'cookie'|'bearer' }|null}
 */
function extractToken(req) {
  if (req.cookies?.auth_token) {
    return { token: req.cookies.auth_token, source: "cookie" };
  }

  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return { token: authHeader.slice(7), source: "bearer" };
  }

  return null;
}

/**
 * Bắt buộc đăng nhập — gắn `req.user` từ JWT.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
function requireAuth(req, res, next) {
  try {
    const auth = extractToken(req);
    if (!auth?.token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: API_MESSAGES.AUTH_REQUIRED
      });
    }

    req.user = verifyToken(auth.token);
    req.authSource = auth.source;
    return next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: API_MESSAGES.INVALID_TOKEN
    });
  }
}

/**
 * Factory middleware — chỉ cho phép một vai trò.
 * @param {string} role - Ví dụ `admin` hoặc `student`
 * @returns {import('express').RequestHandler}
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: API_MESSAGES.ACCESS_DENIED
      });
    }
    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
