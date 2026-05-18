
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */
const express = require("express");
const sheetsService = require("../services/sheetsService");
const { comparePassword, signToken } = require("../services/authService");
const { requireAuth } = require("../middleware/authMiddleware");
const { sanitizeEmail } = require("../utils/helpers");
const { createRateLimiter, getRequestIp } = require("../middleware/rateLimitMiddleware");
const { isProduction } = require("../config/security");
const { isValidEmail } = require("../utils/validators");
const { clearCsrfCookie, ensureCsrfCookie, issueCsrfCookie, requireCsrfToken } = require("../middleware/csrfMiddleware");

const router = express.Router();
const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyGenerator: (req) => `${getRequestIp(req)}:${sanitizeEmail(req.body.email)}`,
  message: "Too many login attempts. Please try again later."
});

router.post("/login", loginRateLimit, async (req, res, next) => {
  try {
    const email = sanitizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const usersResponse = await sheetsService.getUsers();
    const user = (usersResponse.data || []).find((item) => sanitizeEmail(item.email) === email);

    if (!user || !comparePassword(password, user.password_hash)) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signToken(user);
    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction() || req.secure,
      path: "/",
      maxAge: 8 * 60 * 60 * 1000
    });
    issueCsrfCookie(req, res);

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          course_type: user.course_type || ""
        }
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", requireAuth, requireCsrfToken, (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction() || req.secure,
    path: "/"
  });
  clearCsrfCookie(req, res);
  res.json({ success: true, message: "Logged out" });
});

router.get("/me", requireAuth, ensureCsrfCookie, async (req, res, next) => {
  try {
    const usersResponse = await sheetsService.getUsers();
    const user = (usersResponse.data || []).find((item) => item.id === req.user.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        course_type: user.course_type || ""
      }
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
