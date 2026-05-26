
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */
const express = require("express");
const sheetsService = require("../services/sheetsService");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { ROLES } = require("../constants/roles");
const { normalizeChoice, normalizeCourseType } = require("../utils/helpers");

const router = express.Router();
const REQUIRED_CRITICAL_QUESTIONS = 5;

function shuffle(items) {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }
  return cloned;
}

function buildExamQuestionSet(exam, allQuestions) {
  const totalQuestions = Math.max(1, Number(exam?.total_questions || allQuestions.length || 0));
  const criticalTarget = Math.min(REQUIRED_CRITICAL_QUESTIONS, totalQuestions);
  const criticalQuestions = shuffle(allQuestions.filter((item) => item.is_critical));
  const normalQuestions = shuffle(allQuestions.filter((item) => !item.is_critical));

  const selectedCritical = criticalQuestions.slice(0, criticalTarget);
  const selectedIds = new Set(selectedCritical.map((item) => item.id));
  const remainingPool = [
    ...criticalQuestions.filter((item) => !selectedIds.has(item.id)),
    ...normalQuestions
  ];

  const selected = [
    ...selectedCritical,
    ...remainingPool.slice(0, Math.max(0, totalQuestions - selectedCritical.length))
  ];

  return shuffle(selected).slice(0, Math.min(totalQuestions, allQuestions.length));
}

router.get("/", async (req, res, next) => {
  try {
    const response = await sheetsService.getExams({
      course_type: normalizeCourseType(req.query.course_type || "")
    });
    const activeExams = (response.data || []).filter((item) => item.active !== false);
    res.json({ success: true, data: activeExams });
  } catch (error) {
    next(error);
  }
});

router.get("/workspace", requireAuth, requireRole(ROLES.STUDENT), async (req, res, next) => {
  try {
    const [usersResponse, examsResponse, resultsResponse] = await Promise.all([
      sheetsService.getUsers(),
      sheetsService.getExams(),
      sheetsService.getResults()
    ]);

    const currentUser = (usersResponse.data || []).find((item) => item.id === req.user.sub);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const courseType = normalizeCourseType(currentUser.course_type || "");
    const exams = (examsResponse.data || [])
      .filter((item) => item.active !== false)
      .filter((item) => item.course_type === courseType);
    const allResults = (resultsResponse.data || []).filter((item) => item.user_id === req.user.sub);

    const items = exams.map((exam) => {
      const attempts = allResults
        .filter((item) => item.exam_id === exam.id)
        .sort((left, right) => new Date(right.submitted_at || 0) - new Date(left.submitted_at || 0));
      const bestScore = attempts.reduce((max, item) => Math.max(max, Number(item.score || 0)), 0);

      return {
        ...exam,
        attempt_count: attempts.length,
        best_score: bestScore,
        latest_attempt: attempts[0] || null,
        passed: attempts.some((item) => item.passed)
      };
    });

    return res.json({
      success: true,
      data: {
        student: {
          id: currentUser.id,
          name: currentUser.name,
          course_type: courseType
        },
        exams: items,
        results: allResults
          .sort((left, right) => new Date(right.submitted_at || 0) - new Date(left.submitted_at || 0))
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/questions", requireAuth, requireRole(ROLES.STUDENT), async (req, res, next) => {
  try {
    const [examResponse, questionResponse, resultResponse] = await Promise.all([
      sheetsService.getExamById(req.params.id),
      sheetsService.getQuestionsByExam(req.params.id),
      sheetsService.getResults()
    ]);

    if (!examResponse.data) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    const attempts = (resultResponse.data || []).filter(
      (item) => item.exam_id === req.params.id && item.user_id === req.user.sub
    );
    const latestAttempt =
      attempts.sort((left, right) => new Date(right.submitted_at || 0) - new Date(left.submitted_at || 0))[0] || null;

    const selectedQuestions = buildExamQuestionSet(examResponse.data, questionResponse.data || []);

    return res.json({
      success: true,
      data: {
        exam: examResponse.data,
        questions: selectedQuestions.map(({ correct_answer, ...question }) => question),
        attempt_count: attempts.length,
        latest_attempt: latestAttempt,
        critical_count: selectedQuestions.filter((item) => item.is_critical).length
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/submit", requireAuth, requireRole(ROLES.STUDENT), async (req, res, next) => {
  try {
    const examId = req.params.id;
    const answers = req.body.answers || {};
    const questionIds = Array.isArray(req.body.question_ids) ? req.body.question_ids.map((item) => String(item || "").trim()) : [];

    const [examResponse, questionResponse, resultResponse] = await Promise.all([
      sheetsService.getExamById(examId),
      sheetsService.getQuestionsByExam(examId),
      sheetsService.getResults()
    ]);

    const exam = examResponse.data;
    const questionMap = new Map((questionResponse.data || []).map((item) => [item.id, item]));

    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    if (!questionIds.length) {
      return res.status(400).json({ success: false, message: "Question set is required" });
    }

    const questions = questionIds
      .map((questionId) => questionMap.get(questionId))
      .filter(Boolean);

    if (!questions.length) {
      return res.status(400).json({ success: false, message: "No valid questions were submitted" });
    }

    const attempts = (resultResponse.data || []).filter(
      (item) => item.exam_id === examId && item.user_id === req.user.sub
    );
    const nextAttempt = attempts.length + 1;

    let score = 0;
    let failedDueCritical = false;

    questions.forEach((question) => {
      const answer = normalizeChoice(answers[question.id]);
      const correct = answer === normalizeChoice(question.correct_answer);
      if (correct) {
        score += 1;
      }
      if (question.is_critical && !correct) {
        failedDueCritical = true;
      }
    });

    const passed = !failedDueCritical && score >= Number(exam.pass_score || 0);
    const saveResponse = await sheetsService.saveExamResult({
      user_id: req.user.sub,
      exam_id: examId,
      attempt_no: nextAttempt,
      score,
      passed,
      failed_due_critical: failedDueCritical,
      answers: questions.reduce((accumulator, question) => {
        accumulator[question.id] = normalizeChoice(answers[question.id]);
        return accumulator;
      }, {})
    });

    return res.status(201).json({
      success: true,
      data: {
        result_id: saveResponse.data.id,
        attempt_no: nextAttempt,
        score,
        passed,
        failed_due_critical: failedDueCritical,
        pass_score: Number(exam.pass_score || 0)
      }
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
