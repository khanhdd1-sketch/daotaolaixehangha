import { getAdminState, patchAdminState } from "../state/adminState.js";
import { bootstrapAdminPage } from "./adminPageBootstrap.js";
import {
  bindOverviewEvents,
  bindResultsPageEvents,
  bindStudentsEvents,
  bindTheoryEvents,
  bindSimulationEvents,
  bindLessonsEvents,
  refreshAdminOverview,
  refreshAdminResultsPage,
  refreshAdminStudents,
  refreshAdminTheory,
  refreshAdminSimulation,
  refreshAdminLessons,
  setupProofPreviewModal
} from "./adminController.js";

/**
 * Khởi tạo hub tổng quan admin.
 * @returns {Promise<void>}
 */
export async function initAdminOverviewPage() {
  const user = await bootstrapAdminPage("overview");
  if (!user) return;
  patchAdminState({ currentUser: user, activePageId: "overview" });
  setupProofPreviewModal();
  bindOverviewEvents();
  await refreshAdminOverview();
}

/**
 * Trang quản lý học viên.
 * @returns {Promise<void>}
 */
export async function initAdminStudentsPage() {
  const user = await bootstrapAdminPage("students");
  if (!user) return;
  patchAdminState({ currentUser: user, activePageId: "students" });
  bindStudentsEvents();
  await refreshAdminStudents();
}

/**
 * Trang lý thuyết.
 * @returns {Promise<void>}
 */
export async function initAdminTheoryPage() {
  const user = await bootstrapAdminPage("theory");
  if (!user) return;
  patchAdminState({ currentUser: user, activePageId: "theory" });
  bindTheoryEvents();
  await refreshAdminTheory();
}

/**
 * Trang mô phỏng.
 * @returns {Promise<void>}
 */
export async function initAdminSimulationPage() {
  const user = await bootstrapAdminPage("simulation");
  if (!user) return;
  patchAdminState({ currentUser: user, activePageId: "simulation" });
  bindSimulationEvents();
  await refreshAdminSimulation();
}

/**
 * Trang bài học.
 * @returns {Promise<void>}
 */
export async function initAdminLessonsPage() {
  const user = await bootstrapAdminPage("lessons");
  if (!user) return;
  patchAdminState({ currentUser: user, activePageId: "lessons" });
  bindLessonsEvents();
  await refreshAdminLessons();
}

/**
 * Trang kết quả (phân trang server).
 * @returns {Promise<void>}
 */
export async function initAdminResultsPage() {
  const user = await bootstrapAdminPage("results");
  if (!user) return;
  patchAdminState({ currentUser: user, activePageId: "results" });
  setupProofPreviewModal();
  bindResultsPageEvents();
  await refreshAdminResultsPage();
}

/** @deprecated Dùng initAdminOverviewPage */
export async function initAdminDashboard() {
  return initAdminOverviewPage();
}
