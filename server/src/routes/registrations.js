
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hiếu Khánh)
 *
 * All rights reserved.
 */
const express = require("express");
const sheetsService = require("../services/sheetsService");
const { sanitizeEmail } = require("../utils/helpers");
const { createRateLimiter, getRequestIp } = require("../middleware/rateLimitMiddleware");
const { clampString, isValidCourseType, isValidEmail } = require("../utils/validators");

const router = express.Router();
const registrationRateLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  keyGenerator: (req) => getRequestIp(req),
  message: "Too many registration attempts. Please try again later."
});

router.post("/", registrationRateLimit, async (req, res, next) => {
  try {
    const payload = {
      name: clampString(req.body.name, 120),
      phone: clampString(req.body.phone, 30),
      email: sanitizeEmail(req.body.email),
      course_type: String(req.body.course_type || "").trim(),
      note: clampString(req.body.note, 500)
    };

    if (!payload.name || !payload.phone || !payload.email || !payload.course_type) {
      return res.status(400).json({ success: false, message: "Missing required registration fields" });
    }

    if (!isValidEmail(payload.email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (!isValidCourseType(payload.course_type)) {
      return res.status(400).json({ success: false, message: "Invalid course type" });
    }

    const response = await sheetsService.createRegistration(payload);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
