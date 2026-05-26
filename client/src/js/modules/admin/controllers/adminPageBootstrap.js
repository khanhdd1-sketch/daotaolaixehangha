import { ADMIN_PAGES } from "../constants/adminPages.js";
import { renderAdminShell } from "../views/adminShellView.js";

/**
 * Xác thực admin và dựng shell chung cho trang con.
 * @param {string} pageId - ID trang (students, theory, …)
 * @returns {Promise<object|null>} currentUser hoặc null nếu đã redirect
 */
export async function bootstrapAdminPage(pageId) {
  await globalThis.DriveSchoolI18n.loadTranslations();
  globalThis.DriveSchoolCommon.initZaloBubble();
  globalThis.DriveSchoolCommon.trackVisit();

  const currentUser = await globalThis.DriveSchoolCommon.getCurrentUser();
  if (!currentUser) {
    globalThis.DriveSchoolCommon.redirectWithLang("/login.html");
    return null;
  }
  if (currentUser.role !== "admin") {
    globalThis.DriveSchoolCommon.redirectWithLang("/exam.html");
    return null;
  }

  renderAdminShell(pageId);
  const nameEl = document.getElementById("adminName");
  if (nameEl) nameEl.textContent = currentUser.name;

  document.getElementById("logoutButton")?.addEventListener("click", () =>
    globalThis.DriveSchoolCommon.logoutAndRedirect()
  );

  const activeMeta = Object.values(ADMIN_PAGES).find((page) => page.id === pageId);
  if (activeMeta) {
    document.title = `Trung tâm dạy lái xe | Admin — ${activeMeta.label}`;
  }

  return currentUser;
}
