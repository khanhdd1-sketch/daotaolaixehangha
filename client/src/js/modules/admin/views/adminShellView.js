import { ADMIN_NAV_PAGES } from "../constants/adminPages.js";
import { mountConfirmModal } from "../../shared/views/confirmModalView.js";

/**
 * Render hero và thanh điều hướng admin dùng chung.
 * @param {string} activePageId - overview | students | theory | ...
 * @sideeffects Ghi DOM #adminShellHero, #adminShellNav
 */
export function renderAdminShell(activePageId) {
  const heroHost = document.getElementById("adminShellHero");
  const navHost = document.getElementById("adminShellNav");
  if (!heroHost || !navHost) return;

  heroHost.innerHTML = `
    <section class="admin-hero mb-4">
      <div class="admin-hero-content">
        <div>
          <span class="section-badge mb-3 text-dark bg-white">Trung tâm điều hành admin</span>
          <h1 class="admin-hero-title">Xin chào, <span id="adminName"></span></h1>
          <p class="admin-hero-copy mb-0">Quản lý học viên, đề thi nội bộ, bài thi mô phỏng, kết quả và thống kê cho trung tâm dạy lái xe.</p>
        </div>
        <div class="admin-hero-actions">
          <a class="btn btn-outline-light" href="/index.html">Trang chủ</a>
          <button class="btn btn-light" id="logoutButton" type="button">Đăng xuất</button>
        </div>
      </div>
    </section>
  `;

  navHost.innerHTML = `
    <nav class="admin-nav-pills student-nav-pills mb-4" aria-label="Điều hướng quản trị">
      ${ADMIN_NAV_PAGES.map(
        (page) => `
        <a
          class="nav-link ${page.id === activePageId ? "active" : ""}"
          href="${page.path}"
          ${page.id === activePageId ? 'aria-current="page"' : ""}
        >${page.label}</a>
      `
      ).join("")}
    </nav>
  `;

  mountConfirmModal();
}
