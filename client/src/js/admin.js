let usersCache = [];
const adminState = { studentModal: null };

document.addEventListener("DOMContentLoaded", async () => {
  await window.DriveSchoolI18n.loadTranslations();
  window.DriveSchoolCommon.initZaloBubble();
  window.DriveSchoolCommon.trackVisit();

  const currentUser = await window.DriveSchoolCommon.getCurrentUser();
  if (!currentUser) {
    window.DriveSchoolCommon.redirectWithLang("/login.html");
    return;
  }
  if (currentUser.role !== "admin") {
    window.DriveSchoolCommon.redirectWithLang("/exam.html");
    return;
  }

  adminState.studentModal = new window.bootstrap.Modal(document.getElementById("studentModal"));
  document.getElementById("adminName").textContent = currentUser.name;

  initControls();
  await refreshDashboard();
});

function initControls() {
  document.getElementById("filterButton").onclick = loadStats;
  document.getElementById("openStudentModalButton").onclick = () => adminState.studentModal.show();
  document.getElementById("createStudentForm").addEventListener("submit", handleStudentSubmit);
  document.getElementById("logoutButton").onclick = async () => {
    await window.DriveSchoolCommon.logoutAndRedirect();
  };

  document.getElementById("studentModal").addEventListener("hidden.bs.modal", () => {
    document.getElementById("createStudentForm").reset();
  });
}

async function refreshDashboard() {
  await Promise.all([loadUsers(), loadStats(), loadThirdPartyAttempts()]);
}

async function loadUsers() {
  const response = await window.DriveSchoolCommon.apiFetch("/api/admin/users");
  usersCache = response.data || [];

  const students = usersCache.filter((item) => item.role === "student");
  document.getElementById("studentTable").innerHTML = students.length
    ? students
      .map(
        (item) => `
          <tr>
            <td>${window.DriveSchoolCommon.escapeHtml(item.name)}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.email)}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.course_type || "")}</td>
            <td>${window.DriveSchoolCommon.formatDateTime(item.created_at)}</td>
          </tr>
        `
      )
      .join("")
    : '<tr><td colspan="4" class="text-center text-muted py-4">Chua co hoc vien.</td></tr>';
}

async function loadStats() {
  const query = new URLSearchParams();
  const from = document.getElementById("filterDate").value;
  const course = document.getElementById("filterCourse").value;
  if (from) query.set("from", from);
  if (course) query.set("course", course);

  const response = await window.DriveSchoolCommon.apiFetch(`/api/admin/stats?${query.toString()}`);
  const stats = response.data || {};

  document.getElementById("statVisits").textContent = stats.totalVisits || 0;
  document.getElementById("statRegistrations").textContent = stats.totalRegistrations || 0;
  document.getElementById("statStudents").textContent = stats.totalStudents || 0;
  document.getElementById("statPassed").textContent = stats.passedCount || 0;
  document.getElementById("statFailed").textContent = stats.failedCount || 0;

  const registrations = stats.registrations || [];
  document.getElementById("registrationCountBadge").textContent = `${registrations.length} lead`;
  document.getElementById("registrationTable").innerHTML = registrations.length
    ? registrations
      .map(
        (item) => `
          <tr>
            <td>${window.DriveSchoolCommon.escapeHtml(item.name || "")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.phone || "")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.email || "")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.course_type || "")}</td>
            <td>${window.DriveSchoolCommon.formatDateTime(item.created_at)}</td>
          </tr>
        `
      )
      .join("")
    : '<tr><td colspan="5" class="text-center text-muted py-4">Chua co form dang ky.</td></tr>';
}

async function loadThirdPartyAttempts() {
  const response = await window.DriveSchoolCommon.apiFetch("/api/admin/third-party-attempts");
  const attempts = response.data || [];

  document.getElementById("thirdPartyCountBadge").textContent = `${attempts.length} ket qua`;
  document.getElementById("thirdPartyTable").innerHTML = attempts.length
    ? attempts
      .map(
        (item) => `
          <tr>
            <td>${window.DriveSchoolCommon.escapeHtml(item.student_name || item.user_id)}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.course_type || "")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.exam_type || "")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.platform_name || "")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(String(item.score || 0))}</td>
            <td>${item.passed ? '<span class="badge text-bg-success">Dat</span>' : '<span class="badge text-bg-danger">Chua dat</span>'}</td>
            <td>${window.DriveSchoolCommon.formatDateTime(item.submitted_at)}</td>
            <td><a href="${window.DriveSchoolCommon.escapeHtml(item.proof_url)}" target="_blank">Xem chi tiết</a></td>
          </tr>
        `
      )
      .join("")
    : '<tr><td colspan="7" class="text-center text-muted py-4">Chua co ket qua nao.</td></tr>';
}

async function handleStudentSubmit(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

  try {
    await window.DriveSchoolCommon.apiFetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({ ...payload, role: "student" })
    });
    adminState.studentModal.hide();
    window.DriveSchoolCommon.showToast("Da tao tai khoan hoc vien.", "success");
    await refreshDashboard();
  } catch (error) {
    window.DriveSchoolCommon.showToast(error.message, "danger");
  }
}
