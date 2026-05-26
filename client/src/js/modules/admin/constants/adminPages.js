/**
 * Cấu hình trang admin con và hub.
 * @readonly
 */
export const ADMIN_PAGES = Object.freeze({
  OVERVIEW: {
    id: "overview",
    path: "/admin.html",
    label: "Tổng quan",
    entry: "/src/js/entries/admin-dashboard.js"
  },
  STUDENTS: {
    id: "students",
    path: "/admin-students.html",
    label: "Học viên",
    entry: "/src/js/entries/admin-students.js"
  },
  THEORY: {
    id: "theory",
    path: "/admin-theory.html",
    label: "Lý thuyết",
    entry: "/src/js/entries/admin-theory.js"
  },
  SIMULATION: {
    id: "simulation",
    path: "/admin-simulation.html",
    label: "Mô phỏng",
    entry: "/src/js/entries/admin-simulation.js"
  },
  LESSONS: {
    id: "lessons",
    path: "/admin-lessons.html",
    label: "Bài học",
    entry: "/src/js/entries/admin-lessons.js"
  },
  RESULTS: {
    id: "results",
    path: "/admin-results.html",
    label: "Kết quả",
    entry: "/src/js/entries/admin-results.js"
  }
});

/** @type {ReadonlyArray<typeof ADMIN_PAGES[keyof typeof ADMIN_PAGES]>} */
export const ADMIN_NAV_PAGES = Object.freeze([
  ADMIN_PAGES.OVERVIEW,
  ADMIN_PAGES.STUDENTS,
  ADMIN_PAGES.THEORY,
  ADMIN_PAGES.SIMULATION,
  ADMIN_PAGES.LESSONS,
  ADMIN_PAGES.RESULTS
]);
