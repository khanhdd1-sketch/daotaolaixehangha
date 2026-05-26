/**
 * Tài khoản thử nghiệm E2E (mock store mặc định).
 * @readonly
 */
export const E2E_ADMIN = Object.freeze({
  email: process.env.E2E_ADMIN_EMAIL || "admin@drivingschool.vn",
  password: process.env.E2E_ADMIN_PASSWORD || "Admin@123"
});

export const E2E_STUDENT = Object.freeze({
  email: process.env.E2E_STUDENT_EMAIL || "student@drivingschool.vn",
  password: process.env.E2E_STUDENT_PASSWORD || "Student@123"
});
