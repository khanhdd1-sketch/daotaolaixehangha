/**
 * @deprecated Dùng module ES: /src/js/entries/student-dashboard.js
 * Giữ file để tương thích nếu HTML cũ vẫn trỏ exam.js.
 */
import { initStudentDashboard } from "./modules/student/controllers/dashboardController.js";

document.addEventListener("DOMContentLoaded", () => {
  initStudentDashboard();
});
