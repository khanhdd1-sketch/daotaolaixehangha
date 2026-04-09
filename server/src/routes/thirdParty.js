const express = require("express");
const sheetsService = require("../services/sheetsService");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { normalizeCourseType, parseBoolean } = require("../utils/helpers");

const router = express.Router();

const THIRD_PARTY_LINKS = {
  A1: {
    theory: { label: "Thi th? lý thuy?t", platform_name: "ThiThuLaiXe", url: "https://thithulaixe.com/" },
    theory_600: { label: "Thi 600 câu", platform_name: "ThiThuLaiXeVN", url: "https://thithulaixe.vn/" },
    simulation: { label: "Thi mô ph?ng", platform_name: "MoPhong120", url: "https://mophong120.com/" }
  },
  A2: {
    theory: { label: "Thi th? lý thuy?t", platform_name: "ThiThuLaiXe", url: "https://thithulaixe.com/" },
    theory_600: { label: "Thi 600 câu", platform_name: "ThiThuLaiXeVN", url: "https://thithulaixe.vn/" },
    simulation: { label: "Thi mô ph?ng", platform_name: "MoPhong120", url: "https://mophong120.com/" }
  },
  B1: {
    theory: { label: "Thi th? lý thuy?t", platform_name: "ThiThuLaiXe", url: "https://thithulaixe.com/" },
    theory_600: { label: "Thi 600 câu", platform_name: "ThiThuLaiXeVN", url: "https://thithulaixe.vn/" },
    simulation: { label: "Thi mô ph?ng", platform_name: "MoPhong120", url: "https://mophong120.com/" }
  },
  B2: {
    theory: { label: "Thi th? lý thuy?t", platform_name: "ThiThuLaiXe", url: "https://thithulaixe.com/" },
    theory_600: { label: "Thi 600 câu", platform_name: "ThiThuLaiXeVN", url: "https://thithulaixe.vn/" },
    simulation: { label: "Thi mô ph?ng", platform_name: "MoPhong120", url: "https://mophong120.com/" }
  }
};

router.use(requireAuth, requireRole("student"));

async function getStudent(userId) {
  const usersResponse = await sheetsService.getUsers();
  return (usersResponse.data || []).find((item) => item.id === userId) || null;
}

router.get("/workspace", async (req, res, next) => {
  try {
    const student = await getStudent(req.user.sub);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const courseType = normalizeCourseType(student.course_type || "") || "B2";
    const links = THIRD_PARTY_LINKS[courseType] || THIRD_PARTY_LINKS.B2;
    const attemptsResponse = await sheetsService.getThirdPartyAttempts({ user_id: req.user.sub });

    return res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          course_type: courseType
        },
        links,
        attempts: attemptsResponse.data || []
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/submit", async (req, res, next) => {
  try {
    const student = await getStudent(req.user.sub);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const examType = String(req.body.exam_type || "").trim();
    const platformName = String(req.body.platform_name || "").trim();
    const examUrl = String(req.body.exam_url || "").trim();
    const score = Number(req.body.score);

    if (!examType || !platformName || !examUrl || !Number.isFinite(score)) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const saveResponse = await sheetsService.saveThirdPartyAttempt({
      user_id: req.user.sub,
      course_type: normalizeCourseType(student.course_type || ""),
      exam_type: examType,
      platform_name: platformName,
      exam_url: examUrl,
      score,
      passed: parseBoolean(req.body.passed),
      note: String(req.body.note || ""),
      proof_url: String(req.body.proof_url || "")
    });

    return res.status(201).json({ success: true, data: saveResponse.data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
