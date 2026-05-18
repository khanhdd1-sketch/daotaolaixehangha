
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */
const { isAllowedOrigin, isProduction } = require("../config/security");

function corsOptionsDelegate(req, callback) {
  const requestOrigin = req.header("Origin");

  if (!isAllowedOrigin(requestOrigin)) {
    return callback(null, {
      origin: false,
      credentials: false
    });
  }

  return callback(null, {
    origin: requestOrigin || false,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204
  });
}

function securityHeaders(req, res, next) {
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.removeHeader("X-Powered-By");

  if (isProduction()) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  next();
}

function requestSizeGuard(maxLength) {
  return (req, res, next) => {
    const contentLength = Number(req.headers["content-length"] || 0);
    if (contentLength && contentLength > maxLength) {
      return res.status(413).json({ success: false, message: "Payload too large" });
    }

    return next();
  };
}

module.exports = {
  corsOptionsDelegate,
  requestSizeGuard,
  securityHeaders
};
