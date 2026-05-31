
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */
const express = require("express");
const sheetsService = require("../services/sheetsService");
const { hashPassword } = require("../services/authService");
const cloudinaryService = require("../services/cloudinaryService");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { ROLES } = require("../constants/roles");
const { requireCsrfToken } = require("../middleware/csrfMiddleware");
const { normalizeCourseType, sanitizeEmail } = require("../utils/helpers");
const { clampString, isSafeHttpUrl, isStrongPassword, isValidCourseType, isValidEmail } = require("../utils/validators");
const { parsePaginationQuery, paginateArray } = require("../utils/pagination");
const { mergeResultRows, filterResultRows } = require("../utils/adminResultsUtils");

const router = express.Router();
const DEFAULT_RESULT_PAGE_LIMIT = 20;

router.use(requireAuth, requireRole(ROLES.ADMIN));
router.use(requireCsrfToken);

function sanitizeQuestionImageUrl(value) {
  const imageUrl = String(value || "").trim();
  if (!imageUrl) {
    return "";
  }

  if (!/^https?:\/\//i.test(imageUrl) || !isSafeHttpUrl(imageUrl)) {
    return null;
  }

  if (cloudinaryService.isConfigured() && !cloudinaryService.isOwnedAssetUrl(imageUrl)) {
    return null;
  }

  return imageUrl;
}

/**
 * Trả lỗi validate chuẩn cho API admin.
 * @param {import('express').Response} res - Response Express.
 * @param {string} message - Thông báo lỗi dành cho client.
 * @returns {import('express').Response} Response JSON 400.
 * @edgecase Dùng chung để tránh mỗi route tự tạo envelope lỗi khác nhau.
 */
function sendBadRequest(res, message) {
  return res.status(400).json({ success: false, message });
}

/**
 * Kiểm tra một giá trị có phải số dương hoặc bằng 0 hay không.
 * @param {unknown} value - Giá trị từ form/body.
 * @returns {boolean} `true` khi giá trị chuyển thành số hữu hạn và không âm.
 * @edgecase Chuỗi rỗng và `NaN` bị xem là không hợp lệ.
 */
function isNonNegativeNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0;
}

/**
 * Validate payload đề thi lý thuyết trước khi lưu.
 * @param {object} payload - Body request từ admin.
 * @returns {string} Chuỗi rỗng nếu hợp lệ, ngược lại là thông báo lỗi.
 * @edgecase `id` được phép thiếu khi tạo mới nhưng các trường nghiệp vụ bắt buộc phải có.
 */
function validateTheoryExamPayload(payload) {
  const courseType = normalizeCourseType(payload.course_type || "");
  if (!courseType || !isValidCourseType(courseType)) return "Invalid course type";
  if (!clampString(payload.title, 180)) return "Exam title is required";
  if (!isNonNegativeNumber(payload.pass_score) || Number(payload.pass_score) <= 0) return "Pass score must be greater than 0";
  if (!isNonNegativeNumber(payload.total_questions) || Number(payload.total_questions) <= 0) return "Total questions must be greater than 0";
  if (!isNonNegativeNumber(payload.duration_minutes) || Number(payload.duration_minutes) <= 0) return "Duration must be greater than 0";
  return "";
}

/**
 * Validate payload câu hỏi trắc nghiệm trước khi lưu.
 * @param {object} payload - Body request từ admin.
 * @returns {string} Chuỗi rỗng nếu hợp lệ, ngược lại là thông báo lỗi.
 * @edgecase Chỉ chấp nhận đáp án A-D để tránh dữ liệu không thể chấm điểm.
 */
function validateQuestionPayload(payload) {
  if (!clampString(payload.exam_id, 120)) return "Exam is required";
  if (!clampString(payload.question, 1000)) return "Question text is required";
  if (!["A", "B", "C", "D"].includes(String(payload.correct_answer || "").trim().toUpperCase())) {
    return "Correct answer must be A, B, C or D";
  }
  const missingOption = ["option_a", "option_b", "option_c", "option_d"].find((field) => !clampString(payload[field], 1000));
  return missingOption ? "All answer options are required" : "";
}

/**
 * Validate payload bài học trước khi lưu.
 * @param {object} payload - Body request từ admin.
 * @returns {string} Chuỗi rỗng nếu hợp lệ, ngược lại là thông báo lỗi.
 * @edgecase `video_url` có thể là đường dẫn nội bộ hoặc URL ngoài nên chỉ bắt buộc không rỗng.
 */
function validateLessonPayload(payload) {
  const courseType = normalizeCourseType(payload.course_type || "");
  if (!courseType || !isValidCourseType(courseType)) return "Invalid course type";
  if (!clampString(payload.title, 180)) return "Lesson title is required";
  if (!isNonNegativeNumber(payload.order_no) || Number(payload.order_no) <= 0) return "Lesson order must be greater than 0";
  if (!clampString(payload.video_url, 1000)) return "Lesson video URL is required";
  if (!isNonNegativeNumber(payload.pass_score)) return "Pass score must be a non-negative number";
  return "";
}

/**
 * Validate payload đề thi mô phỏng trước khi lưu.
 * @param {object} payload - Body request từ admin.
 * @returns {string} Chuỗi rỗng nếu hợp lệ, ngược lại là thông báo lỗi.
 * @edgecase `total_clips` có thể được tính lại từ clip nhưng vẫn cần là số hợp lệ nếu gửi lên.
 */
function validateSimulationExamPayload(payload) {
  const courseType = normalizeCourseType(payload.course_type || "");
  if (!courseType || !isValidCourseType(courseType)) return "Invalid course type";
  if (!clampString(payload.title, 180)) return "Simulation exam title is required";
  if (!isNonNegativeNumber(payload.pass_score) || Number(payload.pass_score) <= 0) return "Pass score must be greater than 0";
  if (!isNonNegativeNumber(payload.total_clips)) return "Total clips must be a non-negative number";
  return "";
}

/**
 * Validate payload clip mô phỏng trước khi lưu.
 * @param {object} payload - Body request từ admin.
 * @returns {string} Chuỗi rỗng nếu hợp lệ, ngược lại là thông báo lỗi.
 * @edgecase Cửa sổ chấm điểm phải có điểm kết thúc lớn hơn hoặc bằng điểm bắt đầu.
 */
function validateSimulationClipPayload(payload) {
  if (!clampString(payload.exam_id, 120)) return "Simulation exam is required";
  if (!clampString(payload.title, 180)) return "Simulation clip title is required";
  if (!clampString(payload.video_url, 1000)) return "Simulation clip video URL is required";
  if (!isNonNegativeNumber(payload.order_no) || Number(payload.order_no) <= 0) return "Clip order must be greater than 0";
  if (!isNonNegativeNumber(payload.trigger_start_sec) || !isNonNegativeNumber(payload.trigger_end_sec)) {
    return "Trigger window must be valid seconds";
  }
  if (Number(payload.trigger_end_sec) < Number(payload.trigger_start_sec)) {
    return "Trigger end must be greater than or equal to trigger start";
  }
  return "";
}

router.get("/question-image-upload-config", (req, res) => {
  const uploadConfig = cloudinaryService.buildQuestionImageUploadConfig({
    userId: req.user.sub,
    examId: String(req.query.exam_id || "")
  });

  if (!uploadConfig) {
    return res.status(503).json({
      success: false,
      message: "Cloudinary chua duoc cau hinh cho anh cau hoi."
    });
  }

  return res.json({ success: true, data: uploadConfig });
});

router.get("/lesson-question-image-upload-config", (req, res) => {
  const uploadConfig = cloudinaryService.buildLessonQuestionImageUploadConfig({
    userId: req.user.sub,
    lessonId: String(req.query.lesson_id || "")
  });

  if (!uploadConfig) {
    return res.status(503).json({
      success: false,
      message: "Cloudinary chưa được cấu hình cho ảnh câu hỏi."
    });
  }

  return res.json({ success: true, data: uploadConfig });
});

router.get("/results", async (req, res, next) => {
  try {
    const response = await sheetsService.getResults();
    const rows = response.data || [];
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;

    if (!hasPagination) {
      return res.json({ success: true, data: rows });
    }

    const pagination = parsePaginationQuery(req.query, { defaultLimit: DEFAULT_RESULT_PAGE_LIMIT });
    const envelope = paginateArray(rows, pagination);
    return res.json({ success: true, ...envelope });
  } catch (error) {
    next(error);
  }
});

/**
 * Kết quả thi gộp (lý thuyết + mô phỏng + 3rd-party) có phân trang và lọc.
 * Query: page, limit, search, course, type, status
 * Response: { success, data, total, page, limit, totalPages }
 */
router.get("/result-rows", async (req, res, next) => {
  try {
    const pagination = parsePaginationQuery(req.query, { defaultLimit: DEFAULT_RESULT_PAGE_LIMIT });
    const filters = {
      search: String(req.query.search || ""),
      course: normalizeCourseType(req.query.course || ""),
      type: String(req.query.type || ""),
      status: String(req.query.status || "")
    };

    const [usersResponse, examsResponse, resultsResponse, simulationExamsResponse, simulationAttemptsResponse, thirdPartyAttemptsResponse] =
      await Promise.all([
        sheetsService.getUsers(),
        sheetsService.getExams(),
        sheetsService.getResults(),
        sheetsService.getSimulationExams({ include_inactive: true }),
        sheetsService.getSimulationAttempts(),
        sheetsService.getThirdPartyAttempts()
      ]);

    const users = usersResponse.data || [];
    const exams = examsResponse.data || [];
    const simulationExams = simulationExamsResponse.data || [];

    const examResults = (resultsResponse.data || []).map((item) => ({
      ...item,
      exam_title: exams.find((exam) => exam.id === item.exam_id)?.title ?? item.exam_id,
      student_name: users.find((user) => user.id === item.user_id)?.name ?? item.user_id
    }));

    const simulationAttempts = (simulationAttemptsResponse.data || []).map((item) => ({
      ...item,
      exam_title: simulationExams.find((exam) => exam.id === item.exam_id)?.title ?? item.exam_id,
      student_name: users.find((user) => user.id === item.user_id)?.name ?? item.user_id
    }));

    const thirdPartyAttempts = (thirdPartyAttemptsResponse.data || []).map((item) => ({
      ...item,
      student_name: users.find((user) => user.id === item.user_id)?.name ?? item.user_id
    }));

    const merged = mergeResultRows({
      examResults,
      simulationAttempts,
      thirdPartyAttempts,
      exams,
      simulationExams
    });
    const filtered = filterResultRows(merged, filters);
    const envelope = paginateArray(filtered, pagination);

    return res.json({ success: true, ...envelope });
  } catch (error) {
    return next(error);
  }
});

router.get("/learning-attempts", async (req, res, next) => {
  try {
    const [attemptsResponse, usersResponse, lessonsResponse] = await Promise.all([
      sheetsService.getLessonAttempts(),
      sheetsService.getUsers(),
      sheetsService.getLessons()
    ]);

    const users = usersResponse.data || [];
    const lessons = lessonsResponse.data || [];
    const data = (attemptsResponse.data || []).map((item) => ({
      ...item,
      student_name: users.find((user) => user.id === item.user_id)?.name ?? item.user_id,
      lesson_title: lessons.find((lesson) => lesson.id === item.lesson_id)?.title ?? item.lesson_id
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const filters = {
      from: String(req.query.from || ""),
      course: normalizeCourseType(req.query.course || "")
    };
    const response = await sheetsService.getStats(filters);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/dashboard", async (req, res, next) => {
  try {
    const filters = {
      from: String(req.query.from || ""),
      course: normalizeCourseType(req.query.course || "")
    };

    const [
      statsResponse,
      usersResponse,
      examsResponse,
      resultsResponse,
      simulationExamsResponse,
      simulationAttemptsResponse,
      thirdPartyAttemptsResponse
    ] = await Promise.all([
      sheetsService.getStats(filters),
      sheetsService.getUsers(),
      sheetsService.getExams(),
      sheetsService.getResults(),
      sheetsService.getSimulationExams({ include_inactive: true }),
      sheetsService.getSimulationAttempts(),
      sheetsService.getThirdPartyAttempts()
    ]);

    const stats = statsResponse.data || {};
    const users = usersResponse.data || [];
    const students = users.filter((item) => item.role === ROLES.STUDENT);
    const exams = examsResponse.data || [];
    const examResults = (resultsResponse.data || []).map((item) => ({
      ...item,
      exam_title: exams.find((exam) => exam.id === item.exam_id)?.title ?? item.exam_id,
      student_name: users.find((user) => user.id === item.user_id)?.name ?? item.user_id
    }));
    const simulationExams = simulationExamsResponse.data || [];
    const simulationAttempts = (simulationAttemptsResponse.data || []).map((item) => ({
      ...item,
      exam_title: simulationExams.find((exam) => exam.id === item.exam_id)?.title ?? item.exam_id,
      student_name: users.find((user) => user.id === item.user_id)?.name ?? item.user_id
    }));
    const thirdPartyAttempts = (thirdPartyAttemptsResponse.data || []).map((item) => ({
      ...item,
      student_name: users.find((user) => user.id === item.user_id)?.name ?? item.user_id
    }));

    res.json({
      success: true,
      data: {
        stats,
        students,
        exams,
        exam_results: examResults,
        simulation_exams: simulationExams,
        simulation_attempts: simulationAttempts,
        third_party_attempts: thirdPartyAttempts
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const response = await sheetsService.getUsers();
    res.json({ success: true, data: response.data || [] });
  } catch (error) {
    next(error);
  }
});

router.post("/users", async (req, res, next) => {
  try {
    const payload = {
      name: clampString(req.body.name, 120),
      email: sanitizeEmail(req.body.email),
      password: String(req.body.password || ""),
      role: String(req.body.role || "student"),
      course_type: normalizeCourseType(req.body.course_type || "")
    };

    if (!payload.name || !payload.email || !payload.password) {
      return res.status(400).json({ success: false, message: "Missing required user fields" });
    }

    if (!isValidEmail(payload.email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (!isStrongPassword(payload.password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 10 characters and include uppercase, lowercase, number and symbol"
      });
    }

    if (payload.course_type && !isValidCourseType(payload.course_type)) {
      return res.status(400).json({ success: false, message: "Invalid course type" });
    }

    const usersResponse = await sheetsService.getUsers();
    const existingUser = (usersResponse.data || []).find((item) => sanitizeEmail(item.email) === payload.email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const response = await sheetsService.createUser({
      ...payload,
      password_hash: hashPassword(payload.password)
    });

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/exams", async (req, res, next) => {
  try {
    const response = await sheetsService.getExams();
    res.json({ success: true, data: response.data || [] });
  } catch (error) {
    next(error);
  }
});

router.get("/questions", async (req, res, next) => {
  try {
    const examId = String(req.query.exam_id || "");
    if (examId) {
      const response = await sheetsService.getQuestionsByExam(examId);
      return res.json({ success: true, data: response.data || [] });
    }

    const examsResponse = await sheetsService.getExams();
    const exams = examsResponse.data || [];
    const questionGroups = await Promise.all(
      exams.map(async (exam) => {
        const response = await sheetsService.getQuestionsByExam(exam.id);
        return (response.data || []).map((question) => ({
          ...question,
          exam_title: exam.title
        }));
      })
    );

    return res.json({ success: true, data: questionGroups.flat() });
  } catch (error) {
    next(error);
  }
});

router.post("/exams", async (req, res, next) => {
  try {
    const validationError = validateTheoryExamPayload(req.body);
    if (validationError) {
      return sendBadRequest(res, validationError);
    }
    const response = await sheetsService.upsertExam(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.put("/exams/:id", async (req, res, next) => {
  try {
    const validationError = validateTheoryExamPayload(req.body);
    if (validationError) {
      return sendBadRequest(res, validationError);
    }
    const response = await sheetsService.upsertExam({ ...req.body, id: req.params.id });
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.delete("/exams/:id", async (req, res, next) => {
  try {
    const response = await sheetsService.deleteExam(req.params.id);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.post("/questions", async (req, res, next) => {
  try {
    const validationError = validateQuestionPayload(req.body);
    if (validationError) {
      return sendBadRequest(res, validationError);
    }
    const imageUrl = sanitizeQuestionImageUrl(req.body.image_url);
    if (imageUrl === null) {
      return res.status(400).json({ success: false, message: "Anh cau hoi khong hop le." });
    }
    const response = await sheetsService.upsertQuestion({ ...req.body, image_url: imageUrl });
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.put("/questions/:id", async (req, res, next) => {
  try {
    const validationError = validateQuestionPayload(req.body);
    if (validationError) {
      return sendBadRequest(res, validationError);
    }
    const imageUrl = sanitizeQuestionImageUrl(req.body.image_url);
    if (imageUrl === null) {
      return res.status(400).json({ success: false, message: "Anh cau hoi khong hop le." });
    }
    const response = await sheetsService.upsertQuestion({ ...req.body, id: req.params.id, image_url: imageUrl });
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.delete("/questions/:id", async (req, res, next) => {
  try {
    const response = await sheetsService.deleteQuestion(req.params.id);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/lessons", async (req, res, next) => {
  try {
    const response = await sheetsService.getLessons({
      course_type: normalizeCourseType(req.query.course_type || ""),
      include_inactive: true
    });
    res.json({ success: true, data: response.data || [] });
  } catch (error) {
    next(error);
  }
});

router.post("/lessons", async (req, res, next) => {
  try {
    const validationError = validateLessonPayload(req.body);
    if (validationError) {
      return sendBadRequest(res, validationError);
    }
    const response = await sheetsService.upsertLesson(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.put("/lessons/:id", async (req, res, next) => {
  try {
    const validationError = validateLessonPayload(req.body);
    if (validationError) {
      return sendBadRequest(res, validationError);
    }
    const response = await sheetsService.upsertLesson({ ...req.body, id: req.params.id });
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.delete("/lessons/:id", async (req, res, next) => {
  try {
    const response = await sheetsService.deleteLesson(req.params.id);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/lesson-questions", async (req, res, next) => {
  try {
    const lessonId = String(req.query.lesson_id || "");
    if (!lessonId) {
      return res.status(400).json({ success: false, message: "lesson_id is required" });
    }
    const response = await sheetsService.getLessonQuestions(lessonId);
    return res.json({ success: true, data: response.data || [] });
  } catch (error) {
    return next(error);
  }
});

router.post("/lesson-questions", async (req, res, next) => {
  try {
    const validationError = validateQuestionPayload({ ...req.body, exam_id: req.body.lesson_id });
    if (validationError) {
      return sendBadRequest(res, validationError.replace("Exam", "Lesson"));
    }
    const imageUrl = sanitizeQuestionImageUrl(req.body.image_url);
    if (imageUrl === null) {
      return res.status(400).json({ success: false, message: "Anh cau hoi bai hoc khong hop le." });
    }

    const response = await sheetsService.upsertLessonQuestion({
      ...req.body,
      image_url: imageUrl
    });

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.put("/lesson-questions/:id", async (req, res, next) => {
  try {
    const validationError = validateQuestionPayload({ ...req.body, exam_id: req.body.lesson_id });
    if (validationError) {
      return sendBadRequest(res, validationError.replace("Exam", "Lesson"));
    }
    const imageUrl = sanitizeQuestionImageUrl(req.body.image_url);
    if (imageUrl === null) {
      return res.status(400).json({ success: false, message: "Anh cau hoi bai hoc khong hop le." });
    }

    const response = await sheetsService.upsertLessonQuestion({
      ...req.body,
      id: req.params.id,
      image_url: imageUrl
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.delete("/lesson-questions/:id", async (req, res, next) => {
  try {
    const response = await sheetsService.deleteLessonQuestion(req.params.id);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/simulation-exams", async (req, res, next) => {
  try {
    const response = await sheetsService.getSimulationExams({
      course_type: normalizeCourseType(req.query.course_type || ""),
      include_inactive: true
    });
    res.json({ success: true, data: response.data || [] });
  } catch (error) {
    next(error);
  }
});

router.post("/simulation-exams", async (req, res, next) => {
  try {
    const validationError = validateSimulationExamPayload(req.body);
    if (validationError) {
      return sendBadRequest(res, validationError);
    }
    const response = await sheetsService.upsertSimulationExam(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.put("/simulation-exams/:id", async (req, res, next) => {
  try {
    const validationError = validateSimulationExamPayload(req.body);
    if (validationError) {
      return sendBadRequest(res, validationError);
    }
    const response = await sheetsService.upsertSimulationExam({ ...req.body, id: req.params.id });
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.delete("/simulation-exams/:id", async (req, res, next) => {
  try {
    const response = await sheetsService.deleteSimulationExam(req.params.id);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/simulation-clips", async (req, res, next) => {
  try {
    const examId = String(req.query.exam_id || "");
    if (!examId) {
      return res.status(400).json({ success: false, message: "exam_id is required" });
    }
    const response = await sheetsService.getSimulationClips(examId, true);
    return res.json({ success: true, data: response.data || [] });
  } catch (error) {
    return next(error);
  }
});

router.post("/simulation-clips", async (req, res, next) => {
  try {
    const validationError = validateSimulationClipPayload(req.body);
    if (validationError) {
      return sendBadRequest(res, validationError);
    }
    const response = await sheetsService.upsertSimulationClip(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.put("/simulation-clips/:id", async (req, res, next) => {
  try {
    const validationError = validateSimulationClipPayload(req.body);
    if (validationError) {
      return sendBadRequest(res, validationError);
    }
    const response = await sheetsService.upsertSimulationClip({ ...req.body, id: req.params.id });
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.delete("/simulation-clips/:id", async (req, res, next) => {
  try {
    const response = await sheetsService.deleteSimulationClip(req.params.id);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/simulation-attempts", async (req, res, next) => {
  try {
    const [attemptsResponse, usersResponse, examsResponse] = await Promise.all([
      sheetsService.getSimulationAttempts(),
      sheetsService.getUsers(),
      sheetsService.getSimulationExams({ include_inactive: true })
    ]);
    const users = usersResponse.data || [];
    const exams = examsResponse.data || [];
    const data = (attemptsResponse.data || []).map((item) => ({
      ...item,
      student_name: users.find((user) => user.id === item.user_id)?.name ?? item.user_id,
      exam_title: exams.find((exam) => exam.id === item.exam_id)?.title ?? item.exam_id
    }));

    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    if (!hasPagination) {
      return res.json({ success: true, data });
    }

    const pagination = parsePaginationQuery(req.query, { defaultLimit: DEFAULT_RESULT_PAGE_LIMIT });
    const envelope = paginateArray(data, pagination);
    return res.json({ success: true, ...envelope });
  } catch (error) {
    next(error);
  }
});

router.get("/third-party-attempts", async (req, res, next) => {
  try {
    const [attemptsResponse, usersResponse] = await Promise.all([
      sheetsService.getThirdPartyAttempts(),
      sheetsService.getUsers()
    ]);
    const users = usersResponse.data || [];
    const data = (attemptsResponse.data || []).map((item) => ({
      ...item,
      student_name: users.find((user) => user.id === item.user_id)?.name ?? item.user_id
    }));

    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    if (!hasPagination) {
      return res.json({ success: true, data });
    }

    const pagination = parsePaginationQuery(req.query, { defaultLimit: DEFAULT_RESULT_PAGE_LIMIT });
    const envelope = paginateArray(data, pagination);
    return res.json({ success: true, ...envelope });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
