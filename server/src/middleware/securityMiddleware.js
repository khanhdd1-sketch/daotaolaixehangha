
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hiếu Khánh)
 *
 * All rights reserved.
 */
const { isAllowedOrigin, isProduction } = require("../config/security");

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://app.preny.ai",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://app.preny.ai https://api.cloudinary.com https://res.cloudinary.com",
  "frame-src 'self' https://www.googletagmanager.com https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com",
  "form-action 'self' https://api.cloudinary.com",
  "media-src 'self' blob: https:"
].join("; ");

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
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
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
  res.setHeader("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  res.removeHeader("X-Powered-By");

  if (isProduction()) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.setHeader("Upgrade-Insecure-Requests", "1");
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
