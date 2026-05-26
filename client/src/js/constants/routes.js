/**
 * Đường dẫn trang HTML (SPA tĩnh).
 * @readonly
 */
export const PAGE_ROUTES = Object.freeze({
  HOME: "/",
  LOGIN: "/login.html",
  EXAM_DASHBOARD: "/exam.html",
  THEORY_EXAM: "/theory-exam.html",
  SIMULATION_EXAM: "/simulation-exam.html",
  ADMIN: "/admin.html",
  RESULT: "/result.html"
});

/**
 * Trang yêu cầu đăng nhập — redirect về login khi 401.
 * @readonly
 */
export const PROTECTED_PAGE_ROUTES = Object.freeze([
  PAGE_ROUTES.ADMIN,
  PAGE_ROUTES.EXAM_DASHBOARD,
  PAGE_ROUTES.THEORY_EXAM,
  PAGE_ROUTES.SIMULATION_EXAM,
  PAGE_ROUTES.RESULT
]);
