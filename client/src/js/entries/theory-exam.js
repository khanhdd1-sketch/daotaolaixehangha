import { initTheoryExamPage } from "../modules/student/controllers/theoryController.js";
import { initStudentEasyMode } from "../modules/student/easyMode.js";

document.addEventListener("DOMContentLoaded", () => {
  initStudentEasyMode();
  initTheoryExamPage();
});
