const express = require("express");
const sheetsService = require("../services/sheetsService");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { normalizeCourseType, parseBoolean } = require("../utils/helpers");

const router = express.Router();

const THIRD_PARTY_LINKS = {
  A1: {
    theory: { label: "Thi lý thuyết", platform_name: "ThiThuLaiXe", url: "https://thithulaixe.com/" },
    theory_600: { label: "Thi 600 câu", platform_name: "ThiThuLaiXeVN", url: "https://thithulaixe.vn/" },
    simulation: { label: "Thi mô phỏng", platform_name: "MoPhong120", url: "https://mophong120.com/" }
  },
  A2: {
    theory: { label: "Thi lý thuyết", platform_name: "ThiThuLaiXe", url: "https://thithulaixe.com/" },
    theory_600: { label: "Thi 600 câu", platform_name: "ThiThuLaiXeVN", url: "https://thithulaixe.vn/" },
    simulation: { label: "Thi mô phỏng", platform_name: "MoPhong120", url: "https://mophong120.com/" }
  },
  B1: {
    theory: { label: "Thi lý thuyết", platform_name: "ThiThuLaiXe", url: "https://thithulaixe.com/" },
    theory_600: { label: "Thi 600 câu", platform_name: "ThiThuLaiXeVN", url: "https://thithulaixe.vn/" },
    simulation: { label: "Thi mô phỏng", platform_name: "MoPhong120", url: "https://mophong120.com/" }
  },
  B2: {
    theory: { label: "Thi lý thuyết", platform_name: "ThiThuLaiXe", url: "https://thithulaixe.com/" },
    theory_600: { label: "Thi 600 câu", platform_name: "ThiThuLaiXeVN", url: "https://thithulaixe.vn/" },
    simulation: { label: "Thi mô phỏng", platform_name: "MoPhong120", url: "https://mophong120.com/" }
  },
  C1: {
    theory: { label: "Thi lý thuyết", platform_name: "ThiThuLaiXe", url: "https://thithulaixe.com/" },
    theory_600: { label: "Thi 600 câu", platform_name: "ThiThuLaiXeVN", url: "https://thithulaixe.vn/" },
    simulation: { label: "Thi mô phỏng", platform_name: "MoPhong120", url: "https://mophong120.com/" }
  }
};

const THIRD_PARTY_EXAM_ALIASES = {
  theory: "theory",
  thi_thu_ly_thuyet: "theory",
  thi_ly_thuyet: "theory",
  theory_600: "theory_600",
  thi_600_cau: "theory_600",
  thi_ly_thuyet_600_cau: "theory_600",
  simulation: "simulation",
  thi_mo_phong: "simulation"
};

function normalizeThirdPartyExamToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function resolveThirdPartyExam(courseType, rawExamType) {
  const links = THIRD_PARTY_LINKS[courseType] || THIRD_PARTY_LINKS.B2;
  const examType = String(rawExamType || "").trim();
  const normalizedExamType = normalizeThirdPartyExamToken(examType);
  const aliasKey = THIRD_PARTY_EXAM_ALIASES[normalizedExamType];

  if (links[examType]) {
    return { key: examType, item: links[examType] };
  }

  if (aliasKey && links[aliasKey]) {
    return { key: aliasKey, item: links[aliasKey] };
  }

  const matchedKey = Object.keys(links).find((key) => normalizeThirdPartyExamToken(links[key].label) === normalizedExamType);
  return {
    key: matchedKey || "",
    item: matchedKey ? links[matchedKey] : null
  };
}

function sanitizeProofUrl(value) {
  const proofUrl = String(value || "").trim();

  if (!proofUrl) {
    return "";
  }

  if (proofUrl.length > 50000) {
    return null;
  }

  if (/^https?:\/\//i.test(proofUrl) || /^data:image\/[a-z0-9.+-]+;base64,/i.test(proofUrl)) {
    return proofUrl;
  }

  return null;
}

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

    const courseType = normalizeCourseType(student.course_type || "") || "B2";
    const examMeta = resolveThirdPartyExam(courseType, req.body.exam_type);
    const score = Number(req.body.score);
    const proofUrl = sanitizeProofUrl(req.body.proof_url);

    if (!examMeta.item || !Number.isFinite(score)) {
      return res.status(400).json({ success: false, message: "Loai thi hoac diem khong hop le." });
    }

    if (proofUrl === null) {
      return res.status(400).json({
        success: false,
        message: "Anh minh chung khong hop le hoac qua lon. Vui long cat gon anh roi gui lai."
      });
    }

    const saveResponse = await sheetsService.saveThirdPartyAttempt({
      user_id: req.user.sub,
      course_type: courseType,
      exam_type: examMeta.item.label || examMeta.key,
      platform_name: examMeta.item.platform_name || "",
      exam_url: examMeta.item.url || "",
      score,
      passed: parseBoolean(req.body.passed),
      note: String(req.body.note || ""),
      proof_url: proofUrl
    });

    return res.status(201).json({ success: true, data: saveResponse.data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
