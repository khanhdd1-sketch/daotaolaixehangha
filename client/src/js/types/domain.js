/**
 * Kiểu miền dùng chung (JSDoc) — Driving School Platform.
 * @module types/domain
 */

/**
 * Học viên / tài khoản người dùng.
 * @typedef {object} Student
 * @property {string} id - Mã học viên
 * @property {string} name - Họ tên
 * @property {string} email - Email đăng nhập
 * @property {string} [course_type] - Loại bằng (A1, B2, …)
 * @property {string} role - Vai trò (`student` | `admin`)
 */

/**
 * Đề thi lý thuyết hoặc mô phỏng.
 * @typedef {object} Exam
 * @property {string} id - Mã đề
 * @property {string} title - Tiêu đề
 * @property {number} [pass_score] - Điểm đạt
 * @property {number} [duration_minutes] - Thời gian làm bài (phút)
 * @property {boolean} [active] - Đề đang mở
 */

/**
 * Câu hỏi trắc nghiệm.
 * @typedef {object} Question
 * @property {string} id - Mã câu
 * @property {string} text - Nội dung
 * @property {string[]} options - Các đáp án
 * @property {string} [image_url] - Ảnh minh họa
 * @property {boolean} [is_critical] - Câu điểm liệt
 */

/**
 * Bài học lý thuyết (học trước khi thi).
 * @typedef {object} Lesson
 * @property {string} id - Mã bài
 * @property {string} title - Tiêu đề
 * @property {string} [content] - Nội dung HTML/text
 * @property {number} [order] - Thứ tự hiển thị
 * @property {boolean} [active] - Bài đang hiển thị
 */

/**
 * Kết quả một lần thi.
 * @typedef {object} ExamResult
 * @property {string} id - Mã kết quả
 * @property {boolean} passed - Đạt / không đạt
 * @property {number} score - Điểm đạt được
 * @property {number} attempt_no - Lần thi thứ mấy
 * @property {boolean} [failed_due_critical] - Trượt vì câu liệt
 * @property {Student} [user] - Học viên
 * @property {Exam} [exam] - Đề thi
 * @property {Question[]} [questions] - Chi tiết câu (khi xem lại)
 */

/**
 * Clip mô phỏng tình huống giao thông.
 * @typedef {object} SimulationClip
 * @property {string} id - Mã clip
 * @property {string} exam_id - Thuộc đề nào
 * @property {string} video_url - URL video
 * @property {number} [correct_timestamp_ms] - Thời điểm bấm đúng (ms)
 */

/**
 * Phản hồi API chuẩn từ Express.
 * @typedef {object} ApiResponse
 * @property {boolean} success - Thành công hay không
 * @property {string} [message] - Thông báo lỗi / info
 * @property {*} [data] - Payload nghiệp vụ
 */

export {};
