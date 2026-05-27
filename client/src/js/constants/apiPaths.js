/**
 * Đường dẫn API REST (prefix `/api`).
 * Giữ khớp contract Express backend.
 * @readonly
 */
export const API_PATHS = Object.freeze({
  AUTH_LOGIN: "/api/auth/login",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_ME: "/api/auth/me",
  TRACKING_VISIT: "/api/tracking/visit",
  EXAMS_WORKSPACE: "/api/exams/workspace",
  EXAM_QUESTIONS: (examId) => `/api/exams/${encodeURIComponent(examId)}/questions`,
  EXAM_SUBMIT: (examId) => `/api/exams/${encodeURIComponent(examId)}/submit`,
  LEARNING_WORKSPACE: "/api/learning/workspace",
  SIMULATION_WORKSPACE: "/api/simulation/workspace",
  SIMULATION_SUBMIT: (examId) => `/api/simulation/${encodeURIComponent(examId)}/submit`,
  THIRD_PARTY_WORKSPACE: "/api/third-party/workspace",
  THIRD_PARTY_PROOF_UPLOAD: "/api/third-party/proof-upload-config",
  THIRD_PARTY_SUBMIT: "/api/third-party/submit",
  RESULTS: "/api/results",
  RESULT_BY_ID: (resultId) => `/api/results/${encodeURIComponent(resultId)}`,
  ADMIN_DASHBOARD: "/api/admin/dashboard",
  /** Kết quả gộp có phân trang: ?page&limit&search&course&type&status */
  ADMIN_RESULT_ROWS: "/api/admin/result-rows",
  LEARNING_LESSON_WATCHED: (lessonId) =>
    `/api/learning/lessons/${encodeURIComponent(lessonId)}/watched`,
  ADMIN_QUESTIONS: "/api/admin/questions",
  ADMIN_QUESTION: (id) => `/api/admin/questions/${encodeURIComponent(id)}`,
  ADMIN_EXAMS: "/api/admin/exams",
  ADMIN_EXAM: (id) => `/api/admin/exams/${encodeURIComponent(id)}`,
  ADMIN_USERS: "/api/admin/users",
  ADMIN_SIMULATION_EXAMS: "/api/admin/simulation-exams",
  ADMIN_SIMULATION_EXAM: (id) => `/api/admin/simulation-exams/${encodeURIComponent(id)}`,
  ADMIN_SIMULATION_CLIPS: "/api/admin/simulation-clips",
  ADMIN_SIMULATION_CLIP: (id) => `/api/admin/simulation-clips/${encodeURIComponent(id)}`,
  ADMIN_SIMULATION_CLIPS_QUERY: (examId) =>
    `/api/admin/simulation-clips?exam_id=${encodeURIComponent(examId)}`,
  ADMIN_LESSONS: "/api/admin/lessons",
  ADMIN_LESSON: (id) => `/api/admin/lessons/${encodeURIComponent(id)}`,
  ADMIN_LESSON_QUESTIONS: "/api/admin/lesson-questions",
  ADMIN_LESSON_QUESTION: (id) => `/api/admin/lesson-questions/${encodeURIComponent(id)}`,
  ADMIN_LESSON_QUESTIONS_QUERY: (lessonId) =>
    `/api/admin/lesson-questions?lesson_id=${encodeURIComponent(lessonId)}`,
  ADMIN_QUESTION_IMAGE_UPLOAD: (examId) =>
    `/api/admin/question-image-upload-config?exam_id=${encodeURIComponent(examId || "")}`,
  SUBMIT_LESSON: (lessonId) =>
    `/api/learning/lessons/${encodeURIComponent(lessonId)}/submit`
});
