/**
 * Hằng số Service Worker (cache offline).
 * @readonly
 */
export const SW_CACHE_NAME = "drive-school-v5";

/**
 * Danh sách tài nguyên precache (app shell).
 * @readonly
 */
export const SW_APP_SHELL = Object.freeze([
  "/",
  "/index.html",
  "/login.html",
  "/exam.html",
  "/theory-exam.html",
  "/simulation-exam.html",
  "/admin.html",
  "/admin-students.html",
  "/admin-theory.html",
  "/admin-simulation.html",
  "/admin-lessons.html",
  "/admin-results.html",
  "/sw-module-manifest.json",
  "/manifest.webmanifest",
  "/src/css/main.css",
  "/src/js/common.js",
  "/src/js/constants/legacyGlobals.js",
  "/src/js/auth.js",
  "/src/js/entries/student-dashboard.js",
  "/src/js/entries/theory-exam.js",
  "/src/js/entries/simulation-exam.js",
  "/src/js/admin.js",
  "/src/js/entries/admin-dashboard.js",
  "/assets/bootstrap/css/bootstrap.min.css",
  "/assets/bootstrap/js/bootstrap.bundle.min.js",
  "/assets/vendor/chartjs/chart.umd.min.js",
  "/assets/vendor/fontawesome/css/all.min.css",
  "/favicon.ico"
]);

/**
 * Trang fallback khi offline (điều hướng).
 * @readonly
 */
export const SW_OFFLINE_FALLBACK = "/exam.html";
