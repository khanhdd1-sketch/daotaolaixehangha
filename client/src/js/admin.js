const adminState = {
  studentModal: null,
  proofPreviewModal: null,
  stats: null,
  students: [],
  registrations: [],
  thirdPartyAttempts: [],
  filteredThirdPartyAttempts: [],
  charts: {
    overview: null,
    thirdParty: null
  }
};

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
  adminState.proofPreviewModal = new window.bootstrap.Modal(document.getElementById("proofPreviewModal"));
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

  bindFilterControls(["studentSearchInput"], "input", applyStudentFilters);
  bindFilterControls(["studentCourseFilterLocal"], "change", applyStudentFilters);

  bindFilterControls(["registrationSearchInput"], "input", applyRegistrationFilters);
  bindFilterControls(["registrationCourseFilterLocal"], "change", applyRegistrationFilters);

  bindFilterControls(["thirdPartySearchInput"], "input", applyThirdPartyFilters);
  bindFilterControls(["thirdPartyCourseFilterLocal", "thirdPartyStatusFilter"], "change", applyThirdPartyFilters);
  document.getElementById("thirdPartyTable").addEventListener("click", handleThirdPartyTableClick);

  document.getElementById("studentModal").addEventListener("hidden.bs.modal", () => {
    document.getElementById("createStudentForm").reset();
  });
  document.getElementById("proofPreviewModal").addEventListener("hidden.bs.modal", resetProofPreviewModal);
}

function bindFilterControls(ids, eventName, handler) {
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener(eventName, handler);
    }
  });
}

async function refreshDashboard() {
  await Promise.all([loadUsers(), loadRegistrations(), loadStats(), loadThirdPartyAttempts()]);
}

async function loadUsers() {
  const response = await window.DriveSchoolCommon.apiFetch("/api/admin/users");
  adminState.students = (response.data || []).filter((item) => item.role === "student");
  applyStudentFilters();
}

async function loadRegistrations() {
  const response = await window.DriveSchoolCommon.apiFetch("/api/admin/stats");
  adminState.registrations = response.data?.registrations || [];
  applyRegistrationFilters();
}

async function loadStats() {
  const query = new URLSearchParams();
  const from = document.getElementById("filterDate").value;
  const course = document.getElementById("filterCourse").value;

  if (from) query.set("from", from);
  if (course) query.set("course", course);

  const response = await window.DriveSchoolCommon.apiFetch(`/api/admin/stats?${query.toString()}`);
  const stats = response.data || {};
  adminState.stats = stats;

  document.getElementById("statVisits").textContent = stats.totalVisits || 0;
  document.getElementById("statRegistrations").textContent = stats.totalRegistrations || 0;
  document.getElementById("statStudents").textContent = stats.totalStudents || 0;
  document.getElementById("statPassed").textContent = stats.passedCount || 0;
  document.getElementById("statFailed").textContent = stats.failedCount || 0;

  document.getElementById("overviewChartBadge").textContent = buildOverviewBadgeText(from, course);
  renderOverviewChart(stats);
}

async function loadThirdPartyAttempts() {
  const response = await window.DriveSchoolCommon.apiFetch("/api/admin/third-party-attempts");
  adminState.thirdPartyAttempts = response.data || [];
  applyThirdPartyFilters();
}

function applyStudentFilters() {
  const searchTerm = normalizeText(document.getElementById("studentSearchInput").value);
  const courseFilter = document.getElementById("studentCourseFilterLocal").value;
  const filtered = adminState.students.filter((item) => {
    const matchesCourse = !courseFilter || String(item.course_type || "") === courseFilter;
    const matchesSearch = !searchTerm || matchesTextSearch(
      [item.name, item.email, item.course_type, item.note],
      searchTerm
    );
    return matchesCourse && matchesSearch;
  });

  document.getElementById("studentCountBadge").textContent = `${filtered.length} học viên`;
  document.getElementById("studentTable").innerHTML = filtered.length
    ? filtered
      .map(
        (item) => `
          <tr>
            <td>${window.DriveSchoolCommon.escapeHtml(item.name)}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.email)}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.course_type || "")}</td>
            <td>${window.DriveSchoolCommon.formatDateTime(item.created_at)}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.note || "")}</td>
          </tr>
        `
      )
      .join("")
    : '<tr><td colspan="5" class="text-center text-muted py-4">Không tìm thấy học viên phù hợp.</td></tr>';
}

function applyRegistrationFilters() {
  const searchTerm = normalizeText(document.getElementById("registrationSearchInput").value);
  const courseFilter = document.getElementById("registrationCourseFilterLocal").value;
  const filtered = adminState.registrations.filter((item) => {
    const matchesCourse = !courseFilter || String(item.course_type || "") === courseFilter;
    const matchesSearch = !searchTerm || matchesTextSearch(
      [item.name, item.phone, item.email, item.course_type, item.note],
      searchTerm
    );
    return matchesCourse && matchesSearch;
  });

  document.getElementById("registrationCountBadge").textContent = `${filtered.length} lead`;
  document.getElementById("registrationTable").innerHTML = filtered.length
    ? filtered
      .map(
        (item) => `
          <tr>
            <td>${window.DriveSchoolCommon.escapeHtml(item.name || "")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.phone || "")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.email || "")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.course_type || "")}</td>
            <td>${window.DriveSchoolCommon.formatDateTime(item.created_at)}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.note || "")}</td>
          </tr>
        `
      )
      .join("")
    : '<tr><td colspan="6" class="text-center text-muted py-4">Không tìm thấy lead phù hợp.</td></tr>';
}

function applyThirdPartyFilters() {
  const searchTerm = normalizeText(document.getElementById("thirdPartySearchInput").value);
  const courseFilter = document.getElementById("thirdPartyCourseFilterLocal").value;
  const statusFilter = document.getElementById("thirdPartyStatusFilter").value;

  const filtered = adminState.thirdPartyAttempts.filter((item) => {
    const statusValue = item.passed ? "passed" : "failed";
    const matchesCourse = !courseFilter || String(item.course_type || "") === courseFilter;
    const matchesStatus = !statusFilter || statusValue === statusFilter;
    const matchesSearch = !searchTerm || matchesTextSearch(
      [item.student_name, item.user_id, item.exam_type, item.platform_name, item.course_type],
      searchTerm
    );
    return matchesCourse && matchesStatus && matchesSearch;
  });

  adminState.filteredThirdPartyAttempts = filtered;
  document.getElementById("thirdPartyCountBadge").textContent = `${filtered.length} kết quả`;
  renderThirdPartyTable(filtered);
  renderThirdPartyChart(filtered);
}

function renderThirdPartyTable(attempts) {
  document.getElementById("thirdPartyTable").innerHTML = attempts.length
    ? attempts
      .map(
        (item, index) => `
          <tr>
            <td>${window.DriveSchoolCommon.escapeHtml(item.student_name || item.user_id)}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.course_type || "")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.exam_type || "")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(item.platform_name || "")}</td>
            <td>${window.DriveSchoolCommon.escapeHtml(String(item.score || 0))}</td>
            <td>${item.passed ? '<span class="badge text-bg-success">Đạt</span>' : '<span class="badge text-bg-danger">Chưa đạt</span>'}</td>
            <td>${window.DriveSchoolCommon.formatDateTime(item.submitted_at)}</td>
            <td>${renderThirdPartyLinkCell(item.exam_url, "Mở bài thi")}</td>
            <td>${renderProofCell(item.proof_url, index)}</td>
          </tr>
        `
      )
      .join("")
    : '<tr><td colspan="9" class="text-center text-muted py-4">Không tìm thấy kết quả phù hợp.</td></tr>';
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
    window.DriveSchoolCommon.showToast("Đã tạo tài khoản học viên.", "success");
    await refreshDashboard();
  } catch (error) {
    window.DriveSchoolCommon.showToast(error.message, "danger");
  }
}

function handleThirdPartyTableClick(event) {
  const previewButton = event.target.closest("[data-proof-index]");
  if (!previewButton) {
    return;
  }

  const index = Number(previewButton.getAttribute("data-proof-index"));
  if (!Number.isInteger(index) || index < 0) {
    return;
  }

  openProofPreview(index);
}

function openProofPreview(index) {
  const item = adminState.filteredThirdPartyAttempts[index];
  const proofUrl = item ? getSafeLink(item.proof_url, { allowDataImage: true }) : "";
  const previewImage = document.getElementById("proofPreviewImage");
  const previewFallback = document.getElementById("proofPreviewFallback");
  const previewMeta = document.getElementById("proofPreviewMeta");
  const externalLink = document.getElementById("proofPreviewExternalLink");

  if (!proofUrl) {
    window.DriveSchoolCommon.showToast("Không có ảnh minh chứng để xem.", "warning");
    return;
  }

  previewMeta.textContent = `${item.student_name || item.user_id} | ${item.exam_type || "Minh chứng"}`;
  previewImage.classList.add("d-none");
  previewImage.removeAttribute("src");
  previewFallback.classList.remove("d-none");
  previewFallback.textContent = "Đang tải ảnh minh chứng...";

  externalLink.href = proofUrl;
  externalLink.classList.remove("d-none");

  previewImage.onload = () => {
    previewFallback.classList.add("d-none");
    previewImage.classList.remove("d-none");
  };

  previewImage.onerror = () => {
    previewImage.classList.add("d-none");
    previewFallback.classList.remove("d-none");
    previewFallback.textContent = "Không thể hiển thị trực tiếp. Bạn có thể mở trong tab mới.";
  };

  previewImage.src = proofUrl;
  adminState.proofPreviewModal.show();
}

function resetProofPreviewModal() {
  const previewImage = document.getElementById("proofPreviewImage");
  const previewFallback = document.getElementById("proofPreviewFallback");
  const previewMeta = document.getElementById("proofPreviewMeta");
  const externalLink = document.getElementById("proofPreviewExternalLink");

  previewImage.classList.add("d-none");
  previewImage.removeAttribute("src");
  previewFallback.classList.remove("d-none");
  previewFallback.textContent = "Ảnh minh chứng sẽ hiển thị tại đây.";
  previewMeta.textContent = "Xem nhanh ảnh học viên gửi cho admin.";
  externalLink.classList.add("d-none");
  externalLink.removeAttribute("href");
}

function renderOverviewChart(stats) {
  const labels = ["Lượt truy cập", "Đăng ký", "Học viên", "Đạt", "Chưa đạt"];
  const values = [
    Number(stats.totalVisits || 0),
    Number(stats.totalRegistrations || 0),
    Number(stats.totalStudents || 0),
    Number(stats.passedCount || 0),
    Number(stats.failedCount || 0)
  ];
  const hasData = values.some((value) => value > 0);

  setChartEmptyState("adminOverviewChart", "adminOverviewChartEmpty", hasData);
  if (!hasData) {
    destroyChart("overview");
    return;
  }

  upsertChart("overview", "adminOverviewChart", {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Số lượng",
          data: values,
          backgroundColor: ["#0d47a1", "#ef6c00", "#0288d1", "#2e7d32", "#c62828"],
          borderRadius: 12,
          maxBarThickness: 48
        }
      ]
    },
    options: buildChartOptions({
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    })
  });
}

function renderThirdPartyChart(attempts) {
  const grouped = attempts.reduce((accumulator, item) => {
    const label = String(item.exam_type || "Khac");
    if (!accumulator[label]) {
      accumulator[label] = { passed: 0, failed: 0 };
    }

    if (item.passed) {
      accumulator[label].passed += 1;
    } else {
      accumulator[label].failed += 1;
    }
    return accumulator;
  }, {});

  const labels = Object.keys(grouped);
  const hasData = labels.length > 0;

  document.getElementById("thirdPartyChartBadge").textContent = `${attempts.length} kết quả`;
  setChartEmptyState("adminThirdPartyChart", "adminThirdPartyChartEmpty", hasData);
  if (!hasData) {
    destroyChart("thirdParty");
    return;
  }

  upsertChart("thirdParty", "adminThirdPartyChart", {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Đạt",
          data: labels.map((label) => grouped[label].passed),
          backgroundColor: "#2e7d32",
          borderRadius: 10
        },
        {
          label: "Chưa đạt",
          data: labels.map((label) => grouped[label].failed),
          backgroundColor: "#c62828",
          borderRadius: 10
        }
      ]
    },
    options: buildChartOptions({
      indexAxis: "y",
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0 }
        },
        y: {
          ticks: {
            autoSkip: false
          }
        }
      }
    })
  });
}

function buildChartOptions(overrides = {}) {
  const { plugins: overridePlugins = {}, ...restOverrides } = overrides;
  const baseLegend = {
    position: "bottom",
    labels: {
      usePointStyle: true,
      boxWidth: 10
    }
  };
  const baseTooltip = {
    intersect: false,
    mode: "index"
  };
  const mergedPlugins = {
    legend: {
      ...baseLegend,
      ...(overridePlugins.legend || {}),
      labels: {
        ...baseLegend.labels,
        ...(overridePlugins.legend?.labels || {})
      }
    },
    tooltip: {
      ...baseTooltip,
      ...(overridePlugins.tooltip || {})
    }
  };

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 450
    },
    plugins: mergedPlugins,
    ...restOverrides
  };
}

function upsertChart(chartKey, canvasId, config) {
  if (!window.Chart) {
    return;
  }

  destroyChart(chartKey);
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  adminState.charts[chartKey] = new window.Chart(canvas, config);
}

function destroyChart(chartKey) {
  if (adminState.charts[chartKey]) {
    adminState.charts[chartKey].destroy();
    adminState.charts[chartKey] = null;
  }
}

function setChartEmptyState(canvasId, emptyId, hasData) {
  const canvas = document.getElementById(canvasId);
  const empty = document.getElementById(emptyId);

  if (canvas) {
    canvas.classList.toggle("d-none", !hasData);
  }

  if (empty) {
    empty.classList.toggle("d-none", hasData);
  }
}

function buildOverviewBadgeText(from, course) {
  if (!from && !course) {
    return "Toàn bộ dữ liệu";
  }

  const tokens = [];
  if (from) {
    tokens.push(`Từ ${from}`);
  }
  if (course) {
    tokens.push(`Khóa ${course}`);
  }
  return tokens.join(" | ");
}

function matchesTextSearch(values, normalizedSearchTerm) {
  return values.some((value) => normalizeText(value).includes(normalizedSearchTerm));
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .trim();
}

function renderThirdPartyLinkCell(value, label) {
  const safeUrl = getSafeLink(value);
  if (!safeUrl) {
    return '<span class="text-muted">Không có</span>';
  }

  return `<a href="${window.DriveSchoolCommon.escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function renderProofCell(value, index) {
  const safeUrl = getSafeLink(value, { allowDataImage: true });
  if (!safeUrl) {
    return '<span class="text-muted">Không có</span>';
  }

  return `<button class="btn btn-outline-primary btn-sm" type="button" data-proof-index="${index}">Xem ảnh</button>`;
}

function getSafeLink(value, { allowDataImage = false } = {}) {
  const url = String(value || "").trim();

  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (allowDataImage && /^data:image\/[a-z0-9.+-]+;base64,/i.test(url)) {
    return url;
  }

  return "";
}
