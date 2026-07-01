import { initStudentDashboard } from "../modules/student/controllers/dashboardController.js";
import { initStudentEasyMode } from "../modules/student/easyMode.js";

document.addEventListener("DOMContentLoaded", () => {
  initStudentEasyMode();
  initStudentDashboard();
});
