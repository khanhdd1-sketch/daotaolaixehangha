import { API_PATHS } from "../../../constants/apiPaths.js";

/**
 * Gọi API workspace cho dashboard học viên (song song).
 * @returns {Promise<{ theory: object, learning: object, simulation: object, thirdParty: object }>}
 * @sideeffects Gửi HTTP tới backend Express
 */
export async function fetchDashboardWorkspaces() {
  const [theoryResponse, learningResponse, simulationResponse, thirdPartyResponse] = await Promise.all([
    globalThis.DriveSchoolCommon.apiFetch(API_PATHS.EXAMS_WORKSPACE),
    globalThis.DriveSchoolCommon.apiFetch(API_PATHS.LEARNING_WORKSPACE),
    globalThis.DriveSchoolCommon.apiFetch(API_PATHS.SIMULATION_WORKSPACE),
    globalThis.DriveSchoolCommon.apiFetch(API_PATHS.THIRD_PARTY_WORKSPACE)
  ]);

  return {
    theory: theoryResponse.data || { student: null, exams: [], results: [] },
    learning: learningResponse.data || { lessons: [], completed_count: 0, total_count: 0 },
    simulation: simulationResponse.data || { exam: null, clips: [], attempts: [] },
    thirdParty: thirdPartyResponse.data || { links: {}, attempts: [], student: null }
  };
}

/**
 * Lấy workspace lý thuyết.
 * @returns {Promise<object>}
 */
export async function fetchTheoryWorkspace() {
  const response = await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.EXAMS_WORKSPACE);
  return response.data || { student: null, exams: [], results: [] };
}

/**
 * Lấy câu hỏi của một đề thi.
 * @param {string} examId - ID đề thi
 * @returns {Promise<object>}
 */
export async function fetchTheoryExamQuestions(examId) {
  const response = await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.EXAM_QUESTIONS(examId));
  return response.data || null;
}

/**
 * Nộp bài thi lý thuyết.
 * @param {string} examId - ID đề
 * @param {object} payload - answers, question_ids
 * @returns {Promise<object>} Phản hồi API (có result_id)
 */
export async function submitTheoryExam(examId, payload) {
  const response = await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.EXAM_SUBMIT(examId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return response.data;
}

/**
 * Lấy workspace mô phỏng.
 * @returns {Promise<object>}
 */
export async function fetchSimulationWorkspace() {
  const response = await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.SIMULATION_WORKSPACE);
  return response.data || { exam: null, clips: [], attempts: [] };
}

/**
 * Nộp bài mô phỏng.
 * @param {string} examId - ID đề mô phỏng
 * @param {object} answers - Map clipId -> thời điểm bấm
 * @returns {Promise<object>}
 */
export async function submitSimulationExam(examId, answers) {
  const response = await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.SIMULATION_SUBMIT(examId), {
    method: "POST",
    body: JSON.stringify({ answers })
  });
  return response.data;
}

/**
 * Lấy cấu hình upload minh chứng Cloudinary.
 * @returns {Promise<object>}
 */
export async function fetchProofUploadConfig() {
  const response = await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.THIRD_PARTY_PROOF_UPLOAD);
  return response.data || {};
}

/**
 * Upload ảnh minh chứng lên Cloudinary.
 * @param {File} file - File ảnh
 * @param {object} uploadConfig - Cấu hình ký từ server
 * @returns {Promise<string>} secure_url
 */
export async function uploadProofImage(file, uploadConfig) {
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
    throw new Error(data.error?.message || "Không thể tải ảnh minh chứng.");
  }
  return String(data.secure_url || "").trim();
}

/**
 * Đánh dấu học viên đã xem video bài học.
 * @param {string} lessonId - ID bài học
 * @returns {Promise<object>}
 */
export async function markLessonWatched(lessonId) {
  const response = await globalThis.DriveSchoolCommon.apiFetch(
    API_PATHS.LEARNING_LESSON_WATCHED(lessonId),
    { method: "POST", body: JSON.stringify({}) }
  );
  return response.data || {};
}

/**
 * Gửi kết quả thi bên thứ ba.
 * @param {object} payload - Dữ liệu nộp
 * @returns {Promise<object>}
 */
export async function submitThirdPartyResult(payload) {
  const response = await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.THIRD_PARTY_SUBMIT, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return response.data;
}
