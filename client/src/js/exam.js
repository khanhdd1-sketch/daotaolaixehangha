let workspace = { links: {}, attempts: [], student: null };

document.addEventListener("DOMContentLoaded", async () => {
  await window.DriveSchoolI18n.loadTranslations();
  window.DriveSchoolCommon.initZaloBubble();
  window.DriveSchoolCommon.trackVisit();

  const currentUser = await window.DriveSchoolCommon.getCurrentUser();
  if (!currentUser) {
    window.DriveSchoolCommon.redirectWithLang("/login.html");
    return;
  }
  if (currentUser.role !== "student") {
    window.DriveSchoolCommon.redirectWithLang("/admin.html");
    return;
  }

  const logoutButton = document.getElementById("studentLogoutButton");
  if (logoutButton) {
    logoutButton.onclick = () => window.DriveSchoolCommon.logoutAndRedirect();
  }

  await loadWorkspace();
  initResultForm();
});

async function loadWorkspace() {
  const response = await window.DriveSchoolCommon.apiFetch("/api/third-party/workspace");
  workspace = response.data || { links: {}, attempts: [], student: null };

  const student = workspace.student || {};
  document.getElementById("welcomeStudent").textContent = student.name || "Hoc vien";
  document.getElementById("studentCourseBadge").textContent = student.course_type || "-";
  document.getElementById("studentCourseType").textContent = student.course_type || "-";

  renderThirdPartyLinks();
  syncExamTypeMeta();
  renderHistory();
}

function renderThirdPartyLinks() {
  const container = document.getElementById("thirdPartyLinks");
  const entries = Object.entries(workspace.links || {});

  if (!entries.length) {
    container.innerHTML = '<div class="text-muted">Chua co link thi cho khoa hoc nay.</div>';
    return;
  }

  container.innerHTML = entries
    .map(
      ([examType, item]) => `
        <div class="col-md-4">
          <article class="question-card h-100">
            <h3 class="h5 mb-2">${window.DriveSchoolCommon.escapeHtml(item.label || examType)}</h3>
            <p class="text-muted mb-3">Nen tang: ${window.DriveSchoolCommon.escapeHtml(item.platform_name || "-")}</p>
            <a class="btn btn-outline-primary" href="${window.DriveSchoolCommon.escapeHtml(item.url || "#")}" target="_blank" rel="noopener noreferrer">
              Mo bai thi
            </a>
          </article>
        </div>
      `
    )
    .join("");
}

function initResultForm() {
  const form = document.getElementById("thirdPartyResultForm");
  const examTypeSelect = document.getElementById("examType");

  examTypeSelect.addEventListener("change", syncExamTypeMeta);
  form.addEventListener("submit", handleSubmitResult);
}

function syncExamTypeMeta() {
  const examType = document.getElementById("examType").value;
  const item = (workspace.links || {})[examType] || {};

  document.getElementById("platformName").value = item.platform_name || "";
  document.getElementById("examUrl").value = item.url || "";
}

async function handleSubmitResult(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  const submitButton = form.querySelector("button[type='submit']");

  if (!payload.exam_type || !payload.platform_name || !payload.exam_url || !payload.score) {
    window.DriveSchoolCommon.showToast("Vui long chon loai thi va nhap diem.", "warning");
    return;
  }

  submitButton.disabled = true;
  try {
    await window.DriveSchoolCommon.apiFetch("/api/third-party/submit", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    window.DriveSchoolCommon.showToast("Da gui ket qua cho admin.", "success");
    form.reset();
    document.getElementById("examType").value = "theory";
    syncExamTypeMeta();
    await loadWorkspace();
  } catch (error) {
    window.DriveSchoolCommon.showToast(error.message, "danger");
  } finally {
    submitButton.disabled = false;
  }
}

function renderHistory() {
  const attempts = workspace.attempts || [];
  const historyTable = document.getElementById("historyTable");

  document.getElementById("attemptCount").textContent = String(attempts.length);
  document.getElementById("historyBadge").textContent = `${attempts.length} lan`;
  document.getElementById("latestStatus").textContent = attempts[0]
    ? attempts[0].passed
      ? "Dat"
      : "Chua dat"
    : "-";

  historyTable.innerHTML = attempts.length
    ? attempts
      .map(
        (item) => `
          <tr>
            <td>${window.DriveSchoolCommon.escapeHtml(item.exam_type || "-")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.platform_name || "-")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(String(item.score || 0))}</td>
            <td>${item.passed ? '<span class="badge text-bg-success">Dat</span>' : '<span class="badge text-bg-danger">Chua dat</span>'}</td>
            <td>${window.DriveSchoolCommon.formatDateTime(item.submitted_at)}</td>
          </tr>
        `
      )
      .join("")
    : '<tr><td colspan="5" class="text-center text-muted py-4">Chua co ket qua nao.</td></tr>';
}
