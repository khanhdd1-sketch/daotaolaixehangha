/**
 * Gắn hằng số lên globalThis cho script classic (common.js, auth.js, …).
 * Tải trước common.js trên các trang chính.
 * @sideeffects Ghi `globalThis.DriveSchoolConstants`
 */
(function attachLegacyConstants() {
  const ROLES = Object.freeze({ ADMIN: "admin", STUDENT: "student" });
  const HTTP_STATUS = Object.freeze({ OK: 200, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404 });
  const SAFE_HTTP_METHODS = ["GET", "HEAD", "OPTIONS"];
  const CSRF_HEADER = "X-CSRF-Token";
  const CSRF_COOKIE = "csrf_token";
  const PAGE_ROUTES = Object.freeze({
    HOME: "/",
    LOGIN: "/login.html",
    EXAM_DASHBOARD: "/exam.html",
    THEORY_EXAM: "/theory-exam.html",
    SIMULATION_EXAM: "/simulation-exam.html",
    ADMIN: "/admin.html",
    RESULT: "/result.html"
  });
  const PROTECTED_PAGE_ROUTES = [
    PAGE_ROUTES.ADMIN,
    PAGE_ROUTES.EXAM_DASHBOARD,
    PAGE_ROUTES.THEORY_EXAM,
    PAGE_ROUTES.SIMULATION_EXAM,
    PAGE_ROUTES.RESULT
  ];
  const API_PATHS = Object.freeze({
    AUTH_LOGIN: "/api/auth/login",
    AUTH_LOGOUT: "/api/auth/logout",
    AUTH_ME: "/api/auth/me",
    TRACKING_VISIT: "/api/tracking/visit",
    EXAMS_WORKSPACE: "/api/exams/workspace",
    RESULTS: "/api/results",
    resultById: (id) => `/api/results/${encodeURIComponent(id)}`
  });

  globalThis.DriveSchoolConstants = Object.freeze({
    ROLES,
    HTTP_STATUS,
    SAFE_HTTP_METHODS,
    CSRF_HEADER,
    CSRF_COOKIE,
    PAGE_ROUTES,
    PROTECTED_PAGE_ROUTES,
    API_PATHS
  });
})();
