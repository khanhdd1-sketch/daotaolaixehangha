
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */
const { verifyToken } = require("../services/authService");

function extractToken(req) {
  if (req.cookies && req.cookies.auth_token) {
    return { token: req.cookies.auth_token, source: "cookie" };
  }

  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return { token: authHeader.slice(7), source: "bearer" };
  }

  return null;
}

function requireAuth(req, res, next) {
  try {
    const auth = extractToken(req);
    if (!auth || !auth.token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    req.user = verifyToken(auth.token);
    req.authSource = auth.source;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
