/**
 * Vai trò người dùng trên nền tảng (khớp JWT / backend).
 * @readonly
 */
export const ROLES = Object.freeze({
  /** Quản trị viên — truy cập admin.html */
  ADMIN: "admin",
  /** Học viên — thi, học bài, nộp kết quả */
  STUDENT: "student"
});
