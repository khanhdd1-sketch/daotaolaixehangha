
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hiếu Khánh)
 *
 * All rights reserved.
 */
const express = require("express");
const sheetsService = require("../services/sheetsService");
const { createRateLimiter, getRequestIp } = require("../middleware/rateLimitMiddleware");
const { clampString } = require("../utils/validators");

const router = express.Router();
const trackingRateLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 60,
  keyGenerator: (req) => getRequestIp(req),
  message: "Too many tracking requests. Please try again later."
});

router.post("/visit", trackingRateLimit, async (req, res, next) => {
  try {
    const response = await sheetsService.trackVisit({
      ip: req.ip,
      page: clampString(req.body.page, 200) || "/",
      lang: clampString(req.body.lang, 10) || "vi"
    });
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
