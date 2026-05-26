import { API_PATHS } from "../../../constants/apiPaths.js";
import { ROLES } from "../../../constants/roles.js";

/**
 * Gọi API admin dashboard (stats, học viên, kết quả).
 * @param {{ from?: string, course?: string }} filters - Bộ lọc ngày / loại bằng
 * @returns {Promise<object>} Payload `data` từ server
 */
export async function fetchAdminDashboard(filters = {}) {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.course) params.set("course", filters.course);
  const query = params.toString();
  const url = query ? `${API_PATHS.ADMIN_DASHBOARD}?${query}` : API_PATHS.ADMIN_DASHBOARD;
  const response = await globalThis.DriveSchoolCommon.apiFetch(url);
  return response.data || {};
}

/**
 * Lấy toàn bộ câu hỏi lý thuyết.
 * @returns {Promise<Array>}
 */
export async function fetchTheoryQuestions() {
  const response = await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.ADMIN_QUESTIONS);
  return response.data || [];
}

/**
 * Lấy danh sách đề mô phỏng.
 * @returns {Promise<Array>}
 */
export async function fetchSimulationExams() {
  const response = await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.ADMIN_SIMULATION_EXAMS);
  return response.data || [];
}

/**
 * Lấy clip theo từng đề mô phỏng.
 * @param {Array<{ id: string }>} exams - Danh sách đề
 * @returns {Promise<Array>}
 */
export async function fetchSimulationClipsForExams(exams) {
  const clipResponses = await Promise.all(
    exams.map((exam) =>
      globalThis.DriveSchoolCommon.apiFetch(API_PATHS.ADMIN_SIMULATION_CLIPS_QUERY(exam.id))
    )
  );
  return clipResponses.flatMap((response) => response.data || []);
}

/**
 * Lấy danh sách bài học (gồm inactive).
 * @returns {Promise<Array>}
 */
export async function fetchLessons() {
  const response = await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.ADMIN_LESSONS);
  return response.data || [];
}

/**
 * Lấy câu hỏi quiz của một bài học.
 * @param {string} lessonId - ID bài học
 * @returns {Promise<Array>}
 */
export async function fetchLessonQuestions(lessonId) {
  const response = await globalThis.DriveSchoolCommon.apiFetch(
    API_PATHS.ADMIN_LESSON_QUESTIONS_QUERY(lessonId)
  );
  return response.data || [];
}

/**
 * Tải câu hỏi quiz cho tất cả bài học đang có.
 * @param {Array<{ id: string }>} lessons - Danh sách bài học
 * @returns {Promise<Array>}
 */
export async function fetchAllLessonQuestions(lessons) {
  if (!lessons.length) return [];
  const responses = await Promise.all(lessons.map((lesson) => fetchLessonQuestions(lesson.id)));
  return responses.flat();
}

/**
 * Tạo học viên mới.
 * @param {object} payload - name, email, password, course_type
 * @returns {Promise<void>}
 */
export async function createStudent(payload) {
  await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.ADMIN_USERS, {
    method: "POST",
    body: JSON.stringify({ ...payload, role: ROLES.STUDENT })
  });
}

/**
 * Lưu đề lý thuyết (POST hoặc PUT).
 * @param {object} payload - Dữ liệu form
 * @returns {Promise<void>}
 */
export async function saveTheoryExam(payload) {
  const examId = payload.id;
  const url = examId ? API_PATHS.ADMIN_EXAM(examId) : API_PATHS.ADMIN_EXAMS;
  await globalThis.DriveSchoolCommon.apiFetch(url, {
    method: examId ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Lưu câu hỏi lý thuyết.
 * @param {object} payload - Dữ liệu câu hỏi
 * @returns {Promise<void>}
 */
export async function saveTheoryQuestion(payload) {
  const questionId = payload.id;
  const url = questionId ? API_PATHS.ADMIN_QUESTION(questionId) : API_PATHS.ADMIN_QUESTIONS;
  await globalThis.DriveSchoolCommon.apiFetch(url, {
    method: questionId ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Xóa câu hỏi lý thuyết.
 * @param {string} questionId - ID câu hỏi
 * @returns {Promise<void>}
 */
export async function deleteTheoryQuestion(questionId) {
  await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.ADMIN_QUESTION(questionId), {
    method: "DELETE"
  });
}

/**
 * Lấy cấu hình upload ảnh Cloudinary cho câu hỏi.
 * @param {string} examId - ID đề thi
 * @returns {Promise<object>}
 */
export async function fetchQuestionImageUploadConfig(examId) {
  const response = await globalThis.DriveSchoolCommon.apiFetch(
    API_PATHS.ADMIN_QUESTION_IMAGE_UPLOAD(examId)
  );
  return response.data || {};
}

/**
 * Upload ảnh câu hỏi lên Cloudinary.
 * @param {File} file - File ảnh
 * @param {object} uploadConfig - apiKey, signature, ...
 * @returns {Promise<string>} secure_url
 * @throws {Error} Khi Cloudinary trả lỗi
 */
export async function uploadQuestionImageToCloudinary(file, uploadConfig) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", String(uploadConfig.apiKey || ""));
  formData.append("timestamp", String(uploadConfig.timestamp || ""));
  formData.append("signature", String(uploadConfig.signature || ""));
  formData.append("folder", String(uploadConfig.folder || ""));
  formData.append("public_id", String(uploadConfig.publicId || ""));

  const response = await fetch(uploadConfig.uploadUrl, { method: "POST", body: formData });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || "Không thể tải ảnh câu hỏi.");
  }
  return String(data.secure_url || "").trim();
}

/**
 * Lưu đề mô phỏng.
 * @param {object} payload - Dữ liệu đề
 * @returns {Promise<void>}
 */
export async function saveSimulationExam(payload) {
  const examId = payload.id;
  const url = examId ? API_PATHS.ADMIN_SIMULATION_EXAM(examId) : API_PATHS.ADMIN_SIMULATION_EXAMS;
  await globalThis.DriveSchoolCommon.apiFetch(url, {
    method: examId ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Lưu clip mô phỏng.
 * @param {object} payload - Dữ liệu clip
 * @returns {Promise<void>}
 */
export async function saveSimulationClip(payload) {
  const clipId = payload.id;
  const url = clipId ? API_PATHS.ADMIN_SIMULATION_CLIP(clipId) : API_PATHS.ADMIN_SIMULATION_CLIPS;
  await globalThis.DriveSchoolCommon.apiFetch(url, {
    method: clipId ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Xóa clip mô phỏng.
 * @param {string} clipId - ID clip
 * @returns {Promise<void>}
 */
export async function deleteSimulationClip(clipId) {
  await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.ADMIN_SIMULATION_CLIP(clipId), {
    method: "DELETE"
  });
}

/**
 * Lưu bài học.
 * @param {object} payload - Dữ liệu bài học
 * @returns {Promise<void>}
 */
export async function saveLesson(payload) {
  const lessonId = payload.id;
  const url = lessonId ? API_PATHS.ADMIN_LESSON(lessonId) : API_PATHS.ADMIN_LESSONS;
  await globalThis.DriveSchoolCommon.apiFetch(url, {
    method: lessonId ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Xóa bài học.
 * @param {string} lessonId - ID bài học
 * @returns {Promise<void>}
 */
export async function deleteLesson(lessonId) {
  await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.ADMIN_LESSON(lessonId), {
    method: "DELETE"
  });
}

/**
 * Lưu câu hỏi quiz bài học.
 * @param {object} payload - Dữ liệu câu hỏi
 * @returns {Promise<void>}
 */
export async function saveLessonQuestion(payload) {
  const questionId = payload.id;
  const url = questionId
    ? API_PATHS.ADMIN_LESSON_QUESTION(questionId)
    : API_PATHS.ADMIN_LESSON_QUESTIONS;
  await globalThis.DriveSchoolCommon.apiFetch(url, {
    method: questionId ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Xóa câu hỏi quiz bài học.
 * @param {string} questionId - ID câu hỏi
 * @returns {Promise<void>}
 */
export async function deleteLessonQuestion(questionId) {
  await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.ADMIN_LESSON_QUESTION(questionId), {
    method: "DELETE"
  });
}

/**
 * Lấy bảng kết quả gộp có phân trang từ server.
 * @param {object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @param {string} [params.search]
 * @param {string} [params.course]
 * @param {string} [params.type] - theory | simulation | third_party
 * @param {string} [params.status] - passed | failed
 * @returns {Promise<{ data: Array, total: number, page: number, limit: number, totalPages: number }>}
 */
export async function fetchPaginatedResultRows({
  page = 1,
  limit = 20,
  search = "",
  course = "",
  type = "",
  status = ""
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (search) params.set("search", search);
  if (course) params.set("course", course);
  if (type) params.set("type", type);
  if (status) params.set("status", status);

  const response = await globalThis.DriveSchoolCommon.apiFetch(
    `${API_PATHS.ADMIN_RESULT_ROWS}?${params.toString()}`
  );

  return {
    data: response.data || [],
    total: Number(response.total || 0),
    page: Number(response.page || page),
    limit: Number(response.limit || limit),
    totalPages: Number(response.totalPages || 1)
  };
}
