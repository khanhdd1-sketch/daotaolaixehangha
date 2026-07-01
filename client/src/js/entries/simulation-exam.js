import { initSimulationExamPage } from "../modules/student/controllers/simulationController.js";
import { initStudentEasyMode } from "../modules/student/easyMode.js";

document.addEventListener("DOMContentLoaded", () => {
  initStudentEasyMode();
  initSimulationExamPage();
});
