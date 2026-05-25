const adminState = {
  dashboard: null,
  students: [],
  registrations: [],
  exams: [],
  questions: [],
  simulationExams: [],
  simulationClips: [],
  examResults: [],
  simulationAttempts: [],
  thirdPartyAttempts: [],
  charts: {
    overview: null,
    channels: null
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  await globalThis.DriveSchoolI18n.loadTranslations();
  globalThis.DriveSchoolCommon.initZaloBubble();
  globalThis.DriveSchoolCommon.trackVisit();

  const currentUser = await globalThis.DriveSchoolCommon.getCurrentUser();
  if (!currentUser) {
    globalThis.DriveSchoolCommon.redirectWithLang("/login.html");
    return;
  }
  if (currentUser.role !== "admin") {
    globalThis.DriveSchoolCommon.redirectWithLang("/exam.html");
    return;
  }

  document.getElementById("adminName").textContent = currentUser.name;
  bindAdminEvents();
  await refreshAdminApp();
});

function bindAdminEvents() {
  document.getElementById("logoutButton").onclick = () => globalThis.DriveSchoolCommon.logoutAndRedirect();
  document.getElementById("filterButton").onclick = refreshAdminApp;
  document.getElementById("createStudentForm").addEventListener("submit", handleStudentSubmit);
  document.getElementById("examForm").addEventListener("submit", handleExamSubmit);
  document.getElementById("questionForm").addEventListener("submit", handleQuestionSubmit);
  document.getElementById("questionImageFile").addEventListener("change", handleQuestionImageChange);
  document.getElementById("simulationExamForm").addEventListener("submit", handleSimulationExamSubmit);
  document.getElementById("simulationClipForm").addEventListener("submit", handleSimulationClipSubmit);

  document.getElementById("resetExamFormButton").onclick = resetExamForm;
  document.getElementById("resetQuestionFormButton").onclick = resetQuestionForm;
  document.getElementById("resetSimulationExamFormButton").onclick = resetSimulationExamForm;
  document.getElementById("resetSimulationClipFormButton").onclick = resetSimulationClipForm;

  [
    "studentSearchInput",
    "registrationSearchInput",
    "resultSearchInput"
  ].forEach((id) => document.getElementById(id).addEventListener("input", renderAllTables));

  [
    "studentCourseFilterLocal",
    "registrationCourseFilterLocal",
    "resultCourseFilter",
    "resultTypeFilter",
    "resultStatusFilter",
    "questionExamId",
    "simulationClipExamId"
  ].forEach((id) => document.getElementById(id).addEventListener("change", renderAllTables));

  document.getElementById("examList").addEventListener("click", handleExamListClick);
  document.getElementById("questionTable").addEventListener("click", handleQuestionTableClick);
  document.getElementById("simulationExamList").addEventListener("click", handleSimulationExamListClick);
  document.getElementById("simulationClipTable").addEventListener("click", handleSimulationClipTableClick);
}

async function refreshAdminApp() {
  const params = new URLSearchParams();
  const from = document.getElementById("filterDate").value;
  const course = document.getElementById("filterCourse").value;
  if (from) params.set("from", from);
  if (course) params.set("course", course);

  const [dashboardResponse, questionsResponse, simulationExamsResponse] = await Promise.all([
    globalThis.DriveSchoolCommon.apiFetch(`/api/admin/dashboard?${params.toString()}`),
    globalThis.DriveSchoolCommon.apiFetch("/api/admin/questions"),
    globalThis.DriveSchoolCommon.apiFetch("/api/admin/simulation-exams")
  ]);

  const simulationExams = simulationExamsResponse.data || [];
  const clipResponses = await Promise.all(
    simulationExams.map((exam) => globalThis.DriveSchoolCommon.apiFetch(`/api/admin/simulation-clips?exam_id=${encodeURIComponent(exam.id)}`))
  );

  adminState.dashboard = dashboardResponse.data || {};
  adminState.students = adminState.dashboard.students || [];
  adminState.registrations = adminState.dashboard.stats?.registrations || [];
  adminState.exams = adminState.dashboard.exams || [];
  adminState.questions = questionsResponse.data || [];
  adminState.simulationExams = simulationExams;
  adminState.simulationClips = clipResponses.flatMap((response) => response.data || []);
  adminState.examResults = adminState.dashboard.exam_results || [];
  adminState.simulationAttempts = adminState.dashboard.simulation_attempts || [];
  adminState.thirdPartyAttempts = adminState.dashboard.third_party_attempts || [];

  renderDashboardStats();
  syncExamAndClipSelects();
  renderAllTables();
  renderCharts();
}

function renderDashboardStats() {
  const stats = adminState.dashboard.stats || {};
  document.getElementById("statVisits").textContent = stats.totalVisits || 0;
  document.getElementById("statRegistrations").textContent = stats.totalRegistrations || 0;
  document.getElementById("statStudents").textContent = stats.totalStudents || 0;
  document.getElementById("statPassed").textContent = stats.passedCount || 0;
  document.getElementById("statFailed").textContent = stats.failedCount || 0;
  document.getElementById("dashboardFilterBadge").textContent = buildFilterBadge();
}

function renderAllTables() {
  renderStudents();
  renderRegistrations();
  renderExamList();
  renderQuestionTable();
  renderSimulationExamList();
  renderSimulationClipTable();
  renderResultTable();
}

function renderStudents() {
  const searchTerm = normalizeText(document.getElementById("studentSearchInput").value);
  const courseFilter = document.getElementById("studentCourseFilterLocal").value;
  const filtered = adminState.students.filter((item) => {
    return (!courseFilter || item.course_type === courseFilter)
      && matchesSearch([item.name, item.email, item.course_type], searchTerm);
  });

  document.getElementById("studentCountBadge").textContent = `${filtered.length} hoc vien`;
  document.getElementById("studentTable").innerHTML = filtered.length
    ? filtered.map((item) => `
      <tr>
        <td>${escape(item.name)}</td>
        <td>${escape(item.email)}</td>
        <td>${escape(item.course_type || "-")}</td>
        <td>${globalThis.DriveSchoolCommon.formatDateTime(item.created_at)}</td>
      </tr>
    `).join("")
    : buildEmptyRow(4, "Chua co hoc vien phu hop.");
}

function renderRegistrations() {
  const searchTerm = normalizeText(document.getElementById("registrationSearchInput").value);
  const courseFilter = document.getElementById("registrationCourseFilterLocal").value;
  const filtered = adminState.registrations.filter((item) => {
    return (!courseFilter || item.course_type === courseFilter)
      && matchesSearch([item.name, item.phone, item.email, item.note, item.course_type], searchTerm);
  });

  document.getElementById("registrationCountBadge").textContent = `${filtered.length} lead`;
  document.getElementById("registrationTable").innerHTML = filtered.length
    ? filtered.map((item) => `
      <tr>
        <td>${escape(item.name || "")}</td>
        <td>${escape(item.phone || "")}</td>
        <td>${escape(item.email || "")}</td>
        <td>${escape(item.course_type || "-")}</td>
        <td>${globalThis.DriveSchoolCommon.formatDateTime(item.created_at)}</td>
        <td>${escape(item.note || "")}</td>
      </tr>
    `).join("")
    : buildEmptyRow(6, "Chua co lead phu hop.");
}

function renderExamList() {
  document.getElementById("examCountBadge").textContent = `${adminState.exams.length} de`;
  document.getElementById("examList").innerHTML = adminState.exams.length
    ? adminState.exams.map((exam) => `
      <button class="admin-list-item" type="button" data-exam-id="${escape(exam.id)}" data-action="edit-exam">
        <div>
          <div class="fw-semibold">${escape(exam.title)}</div>
          <div class="small text-muted">${escape(exam.course_type || "-")} | ${exam.pass_score}/${exam.total_questions} | ${exam.duration_minutes} phut</div>
        </div>
        <span class="badge ${exam.active ? "text-bg-success" : "text-bg-secondary"}">${exam.active ? "Dang mo" : "Tam an"}</span>
      </button>
    `).join("")
    : '<div class="text-muted">Chua co de ly thuyet.</div>';
}

function renderQuestionTable() {
  const examFilter = document.getElementById("questionExamId").value;
  const questions = adminState.questions.filter((item) => !examFilter || item.exam_id === examFilter);
  document.getElementById("questionCountBadge").textContent = `${questions.length} cau`;
  document.getElementById("questionTable").innerHTML = questions.length
    ? questions.map((item) => `
      <tr>
        <td>${escape(item.exam_title || findExamTitle(item.exam_id))}</td>
        <td>
          <div class="fw-semibold">${escape(item.question)}</div>
          <div class="small text-muted mt-1">${escape(item.explanation || "")}</div>
        </td>
        <td>${item.image_url ? `<button class="btn btn-sm btn-outline-secondary" type="button" data-action="preview-question-image" data-image-url="${escape(item.image_url)}">Xem anh</button>` : '<span class="text-muted">Khong co</span>'}</td>
        <td>${escape(item.correct_answer || "-")}</td>
        <td>${item.is_critical ? '<span class="badge text-bg-danger">Diem liet</span>' : '<span class="badge text-bg-light">Thuong</span>'}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary" type="button" data-question-id="${escape(item.id)}" data-action="edit-question">Sua</button>
          <button class="btn btn-sm btn-outline-danger" type="button" data-question-id="${escape(item.id)}" data-action="delete-question">Xoa</button>
        </td>
      </tr>
    `).join("")
    : buildEmptyRow(6, "Chua co cau hoi.");
}

function renderSimulationExamList() {
  document.getElementById("simulationExamCountBadge").textContent = `${adminState.simulationExams.length} de`;
  document.getElementById("simulationExamList").innerHTML = adminState.simulationExams.length
    ? adminState.simulationExams.map((exam) => `
      <button class="admin-list-item" type="button" data-simulation-exam-id="${escape(exam.id)}" data-action="edit-simulation-exam">
        <div>
          <div class="fw-semibold">${escape(exam.title)}</div>
          <div class="small text-muted">${escape(exam.course_type || "-")} | Dat ${exam.pass_score} diem | ${exam.total_clips} clip</div>
        </div>
        <span class="badge ${exam.active ? "text-bg-success" : "text-bg-secondary"}">${exam.active ? "Dang mo" : "Tam an"}</span>
      </button>
    `).join("")
    : '<div class="text-muted">Chua co bai mo phong.</div>';
}

function renderSimulationClipTable() {
  const examFilter = document.getElementById("simulationClipExamId").value;
  const clips = adminState.simulationClips.filter((item) => !examFilter || item.exam_id === examFilter);
  document.getElementById("simulationClipCountBadge").textContent = `${clips.length} clip`;
  document.getElementById("simulationClipTable").innerHTML = clips.length
    ? clips.map((item) => `
      <tr>
        <td>${escape(findSimulationExamTitle(item.exam_id))}</td>
        <td>
          <div class="fw-semibold">${escape(item.title)}</div>
          <div class="small text-muted">${escape(item.video_url)}</div>
        </td>
        <td>${item.trigger_start_sec}s - ${item.trigger_end_sec}s</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary" type="button" data-simulation-clip-id="${escape(item.id)}" data-action="edit-simulation-clip">Sua</button>
          <button class="btn btn-sm btn-outline-danger" type="button" data-simulation-clip-id="${escape(item.id)}" data-action="delete-simulation-clip">Xoa</button>
        </td>
      </tr>
    `).join("")
    : buildEmptyRow(4, "Chua co clip mo phong.");
}

function renderResultTable() {
  const searchTerm = normalizeText(document.getElementById("resultSearchInput").value);
  const courseFilter = document.getElementById("resultCourseFilter").value;
  const typeFilter = document.getElementById("resultTypeFilter").value;
  const statusFilter = document.getElementById("resultStatusFilter").value;
  const merged = [
    ...adminState.examResults.map((item) => ({
      ...item,
      source_type: "theory",
      source_label: "Ly thuyet noi bo",
      display_name: item.exam_title || item.exam_id,
      course_type: resolveCourseTypeByExam(item.exam_id)
    })),
    ...adminState.simulationAttempts.map((item) => ({
      ...item,
      source_type: "simulation",
      source_label: "Mo phong",
      display_name: item.exam_title || item.exam_id,
      course_type: resolveCourseTypeBySimulationExam(item.exam_id)
    })),
    ...adminState.thirdPartyAttempts.map((item) => ({
      ...item,
      source_type: "third_party",
      source_label: "3rd-party",
      display_name: `${item.exam_type || "-"} | ${item.platform_name || "-"}`,
      attempt_no: item.attempt_no || 1
    }))
  ];

  const filtered = merged.filter((item) => {
    const matchesCourse = !courseFilter || String(item.course_type || "") === courseFilter;
    const matchesType = !typeFilter || item.source_type === typeFilter;
    const matchesStatus = !statusFilter || (item.passed ? "passed" : "failed") === statusFilter;
    const matchesKeyword = matchesSearch([
      item.student_name,
      item.display_name,
      item.platform_name,
      item.exam_type,
      item.course_type
    ], searchTerm);
    return matchesCourse && matchesType && matchesStatus && matchesKeyword;
  }).sort((left, right) => new Date(right.submitted_at || 0) - new Date(left.submitted_at || 0));

  document.getElementById("resultCountBadge").textContent = `${filtered.length} ket qua`;
  document.getElementById("resultTable").innerHTML = filtered.length
    ? filtered.map((item) => `
      <tr>
        <td>${escape(item.student_name || item.user_id)}</td>
        <td>${escape(item.course_type || "-")}</td>
        <td>${escape(item.source_label)}</td>
        <td>${escape(item.display_name || "-")}</td>
        <td>#${escape(String(item.attempt_no || 1))}</td>
        <td>${escape(String(item.score || 0))}</td>
        <td>${item.passed ? '<span class="badge text-bg-success">Dat</span>' : '<span class="badge text-bg-danger">Chua dat</span>'}</td>
        <td>${globalThis.DriveSchoolCommon.formatDateTime(item.submitted_at)}</td>
      </tr>
    `).join("")
    : buildEmptyRow(8, "Chua co ket qua phu hop.");
}

function renderCharts() {
  const stats = adminState.dashboard.stats || {};
  upsertChart("overview", "adminOverviewChart", {
    type: "bar",
    data: {
      labels: ["Luot truy cap", "Lead", "Hoc vien", "Dat", "Chua dat"],
      datasets: [
        {
          label: "So luong",
          data: [
            Number(stats.totalVisits || 0),
            Number(stats.totalRegistrations || 0),
            Number(stats.totalStudents || 0),
            Number(stats.passedCount || 0),
            Number(stats.failedCount || 0)
          ],
          backgroundColor: ["#0d47a1", "#ef6c00", "#039be5", "#2e7d32", "#c62828"],
          borderRadius: 12,
          maxBarThickness: 52
        }
      ]
    },
    options: buildChartOptions({ plugins: { legend: { display: false } } })
  });

  upsertChart("channels", "adminChannelChart", {
    type: "doughnut",
    data: {
      labels: ["Ly thuyet noi bo", "Mo phong", "3rd-party"],
      datasets: [
        {
          data: [
            adminState.examResults.length,
            adminState.simulationAttempts.length,
            adminState.thirdPartyAttempts.length
          ],
          backgroundColor: ["#0d47a1", "#ef6c00", "#00897b"],
          hoverOffset: 8
        }
      ]
    },
    options: buildChartOptions()
  });
}

async function handleStudentSubmit(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  await globalThis.DriveSchoolCommon.apiFetch("/api/admin/users", {
    method: "POST",
    body: JSON.stringify({ ...payload, role: "student" })
  });
  event.currentTarget.reset();
  document.getElementById("studentPassword").value = "Student@123";
  globalThis.DriveSchoolCommon.showToast("Da tao hoc vien.", "success");
  await refreshAdminApp();
}

async function handleExamSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = serializeForm(form);
  const examId = payload.id;
  const url = examId ? `/api/admin/exams/${encodeURIComponent(examId)}` : "/api/admin/exams";
  const method = examId ? "PUT" : "POST";
  await globalThis.DriveSchoolCommon.apiFetch(url, {
    method,
    body: JSON.stringify(payload)
  });
  resetExamForm();
  globalThis.DriveSchoolCommon.showToast("Da luu de ly thuyet.", "success");
  await refreshAdminApp();
}

async function handleQuestionSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const imageFile = document.getElementById("questionImageFile").files[0];
  const payload = serializeForm(form);
  const submitButton = form.querySelector("button[type='submit']");
  const questionId = payload.id;
  const url = questionId ? `/api/admin/questions/${encodeURIComponent(questionId)}` : "/api/admin/questions";
  const method = questionId ? "PUT" : "POST";

  submitButton.disabled = true;
  try {
    if (imageFile) {
      payload.image_url = await uploadQuestionImage(imageFile, payload.exam_id);
    }
    await globalThis.DriveSchoolCommon.apiFetch(url, {
      method,
      body: JSON.stringify(payload)
    });
    resetQuestionForm();
    globalThis.DriveSchoolCommon.showToast("Da luu cau hoi.", "success");
    await refreshAdminApp();
  } finally {
    submitButton.disabled = false;
  }
}

async function handleSimulationExamSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = serializeForm(form);
  const examId = payload.id;
  const url = examId
    ? `/api/admin/simulation-exams/${encodeURIComponent(examId)}`
    : "/api/admin/simulation-exams";
  const method = examId ? "PUT" : "POST";
  await globalThis.DriveSchoolCommon.apiFetch(url, {
    method,
    body: JSON.stringify(payload)
  });
  resetSimulationExamForm();
  globalThis.DriveSchoolCommon.showToast("Da luu de mo phong.", "success");
  await refreshAdminApp();
}

async function handleSimulationClipSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = serializeForm(form);
  const clipId = payload.id;
  const url = clipId
    ? `/api/admin/simulation-clips/${encodeURIComponent(clipId)}`
    : "/api/admin/simulation-clips";
  const method = clipId ? "PUT" : "POST";
  await globalThis.DriveSchoolCommon.apiFetch(url, {
    method,
    body: JSON.stringify(payload)
  });
  resetSimulationClipForm();
  globalThis.DriveSchoolCommon.showToast("Da luu clip mo phong.", "success");
  await refreshAdminApp();
}

async function handleExamListClick(event) {
  const button = event.target.closest("[data-action='edit-exam']");
  if (!button) return;
  const exam = adminState.exams.find((item) => item.id === button.dataset.examId);
  if (!exam) return;
  fillExamForm(exam);
}

async function handleQuestionTableClick(event) {
  const previewButton = event.target.closest("[data-action='preview-question-image']");
  if (previewButton) {
    setQuestionImagePreview(previewButton.dataset.imageUrl || "");
    return;
  }

  const editButton = event.target.closest("[data-action='edit-question']");
  if (editButton) {
    const item = adminState.questions.find((question) => question.id === editButton.dataset.questionId);
    if (item) fillQuestionForm(item);
    return;
  }

  const deleteButton = event.target.closest("[data-action='delete-question']");
  if (!deleteButton) return;
  await globalThis.DriveSchoolCommon.apiFetch(`/api/admin/questions/${encodeURIComponent(deleteButton.dataset.questionId)}`, {
    method: "DELETE"
  });
  globalThis.DriveSchoolCommon.showToast("Da xoa cau hoi.", "success");
  await refreshAdminApp();
}

async function handleSimulationExamListClick(event) {
  const button = event.target.closest("[data-action='edit-simulation-exam']");
  if (!button) return;
  const exam = adminState.simulationExams.find((item) => item.id === button.dataset.simulationExamId);
  if (!exam) return;
  fillSimulationExamForm(exam);
}

async function handleSimulationClipTableClick(event) {
  const editButton = event.target.closest("[data-action='edit-simulation-clip']");
  if (editButton) {
    const item = adminState.simulationClips.find((clip) => clip.id === editButton.dataset.simulationClipId);
    if (item) fillSimulationClipForm(item);
    return;
  }

  const deleteButton = event.target.closest("[data-action='delete-simulation-clip']");
  if (!deleteButton) return;
  await globalThis.DriveSchoolCommon.apiFetch(`/api/admin/simulation-clips/${encodeURIComponent(deleteButton.dataset.simulationClipId)}`, {
    method: "DELETE"
  });
  globalThis.DriveSchoolCommon.showToast("Da xoa clip mo phong.", "success");
  await refreshAdminApp();
}

function syncExamAndClipSelects() {
  const questionExamSelect = document.getElementById("questionExamId");
  const clipExamSelect = document.getElementById("simulationClipExamId");

  const previousQuestionExam = questionExamSelect.value;
  const previousClipExam = clipExamSelect.value;

  questionExamSelect.innerHTML = adminState.exams.map((item) => `
    <option value="${escape(item.id)}">${escape(item.course_type || "-")} - ${escape(item.title)}</option>
  `).join("");

  clipExamSelect.innerHTML = adminState.simulationExams.map((item) => `
    <option value="${escape(item.id)}">${escape(item.course_type || "-")} - ${escape(item.title)}</option>
  `).join("");

  if (adminState.exams.some((item) => item.id === previousQuestionExam)) {
    questionExamSelect.value = previousQuestionExam;
  }
  if (adminState.simulationExams.some((item) => item.id === previousClipExam)) {
    clipExamSelect.value = previousClipExam;
  }
}

function fillExamForm(exam) {
  document.getElementById("examId").value = exam.id || "";
  document.getElementById("examCourseType").value = exam.course_type || "B2";
  document.getElementById("examTitle").value = exam.title || "";
  document.getElementById("examPassScore").value = exam.pass_score || "";
  document.getElementById("examTotalQuestions").value = exam.total_questions || "";
  document.getElementById("examDurationMinutes").value = exam.duration_minutes || 20;
  document.getElementById("examActive").checked = exam.active !== false;
}

function fillQuestionForm(item) {
  document.getElementById("questionId").value = item.id || "";
  document.getElementById("questionExamId").value = item.exam_id || "";
  document.getElementById("questionText").value = item.question || "";
  document.getElementById("optionA").value = item.option_a || "";
  document.getElementById("optionB").value = item.option_b || "";
  document.getElementById("optionC").value = item.option_c || "";
  document.getElementById("optionD").value = item.option_d || "";
  document.getElementById("questionCorrectAnswer").value = item.correct_answer || "A";
  document.getElementById("questionCritical").checked = Boolean(item.is_critical);
  document.getElementById("questionExplanation").value = item.explanation || "";
  document.getElementById("questionImageUrl").value = item.image_url || "";
  setQuestionImagePreview(item.image_url || "");
}

function fillSimulationExamForm(item) {
  document.getElementById("simulationExamId").value = item.id || "";
  document.getElementById("simulationExamCourseType").value = item.course_type || "B2";
  document.getElementById("simulationExamTitle").value = item.title || "";
  document.getElementById("simulationExamDescription").value = item.description || "";
  document.getElementById("simulationExamPassScore").value = item.pass_score || "";
  document.getElementById("simulationExamTotalClips").value = item.total_clips || "";
  document.getElementById("simulationExamActive").checked = item.active !== false;
}

function fillSimulationClipForm(item) {
  document.getElementById("simulationClipId").value = item.id || "";
  document.getElementById("simulationClipExamId").value = item.exam_id || "";
  document.getElementById("simulationClipTitle").value = item.title || "";
  document.getElementById("simulationClipVideoUrl").value = item.video_url || "";
  document.getElementById("simulationClipOrderNo").value = item.order_no || "";
  document.getElementById("simulationClipTriggerStart").value = item.trigger_start_sec || "";
  document.getElementById("simulationClipTriggerEnd").value = item.trigger_end_sec || "";
  document.getElementById("simulationClipActive").checked = item.active !== false;
}

function resetExamForm() {
  document.getElementById("examForm").reset();
  document.getElementById("examId").value = "";
  document.getElementById("examCourseType").value = "B2";
  document.getElementById("examDurationMinutes").value = 20;
  document.getElementById("examActive").checked = true;
}

function resetQuestionForm() {
  document.getElementById("questionForm").reset();
  document.getElementById("questionId").value = "";
  if (adminState.exams[0]) {
    document.getElementById("questionExamId").value = adminState.exams[0].id;
  }
  document.getElementById("questionCorrectAnswer").value = "A";
  document.getElementById("questionImageUrl").value = "";
  setQuestionImagePreview("");
}

function resetSimulationExamForm() {
  document.getElementById("simulationExamForm").reset();
  document.getElementById("simulationExamId").value = "";
  document.getElementById("simulationExamCourseType").value = "B2";
  document.getElementById("simulationExamActive").checked = true;
}

function resetSimulationClipForm() {
  document.getElementById("simulationClipForm").reset();
  document.getElementById("simulationClipId").value = "";
  if (adminState.simulationExams[0]) {
    document.getElementById("simulationClipExamId").value = adminState.simulationExams[0].id;
  }
  document.getElementById("simulationClipActive").checked = true;
}

function serializeForm(form) {
  const payload = {};
  new FormData(form).forEach((value, key) => {
    payload[key] = typeof value === "string" ? value.trim() : value;
  });

  form.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    payload[checkbox.name] = checkbox.checked;
  });

  return payload;
}

function upsertChart(chartKey, canvasId, config) {
  if (!globalThis.Chart) return;
  if (adminState.charts[chartKey]) {
    adminState.charts[chartKey].destroy();
  }
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  adminState.charts[chartKey] = new globalThis.Chart(canvas, config);
}

function buildChartOptions(overrides = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 10
        }
      }
    },
    ...overrides
  };
}

function resolveCourseTypeByExam(examId) {
  return adminState.exams.find((item) => item.id === examId)?.course_type || "";
}

function resolveCourseTypeBySimulationExam(examId) {
  return adminState.simulationExams.find((item) => item.id === examId)?.course_type || "";
}

function findExamTitle(examId) {
  return adminState.exams.find((item) => item.id === examId)?.title || examId;
}

function findSimulationExamTitle(examId) {
  return adminState.simulationExams.find((item) => item.id === examId)?.title || examId;
}

function buildFilterBadge() {
  const from = document.getElementById("filterDate").value;
  const course = document.getElementById("filterCourse").value;
  if (!from && !course) return "Toan bo du lieu";
  return [from ? `Tu ${from}` : "", course ? `Bang ${course}` : ""].filter(Boolean).join(" | ");
}

function matchesSearch(values, normalizedSearch) {
  if (!normalizedSearch) return true;
  return values.some((value) => normalizeText(value).includes(normalizedSearch));
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .trim();
}

function escape(value) {
  return globalThis.DriveSchoolCommon.escapeHtml(value);
}

function buildEmptyRow(colspan, message) {
  return `<tr><td colspan="${colspan}" class="text-center text-muted py-4">${message}</td></tr>`;
}

function handleQuestionImageChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    const currentUrl = document.getElementById("questionImageUrl").value.trim();
    setQuestionImagePreview(currentUrl);
    return;
  }

  if (!String(file.type || "").startsWith("image/")) {
    event.target.value = "";
    globalThis.DriveSchoolCommon.showToast("Vui long chon file anh hop le.", "warning");
    return;
  }

  const previewUrl = URL.createObjectURL(file);
  setQuestionImagePreview(previewUrl, true);
  document.getElementById("questionImageHelp").textContent = `Se upload anh: ${file.name}`;
}

async function uploadQuestionImage(file, examId) {
  const configResponse = await globalThis.DriveSchoolCommon.apiFetch(`/api/admin/question-image-upload-config?exam_id=${encodeURIComponent(examId || "")}`);
  const uploadConfig = configResponse.data || {};
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", String(uploadConfig.apiKey || ""));
  formData.append("timestamp", String(uploadConfig.timestamp || ""));
  formData.append("signature", String(uploadConfig.signature || ""));
  formData.append("folder", String(uploadConfig.folder || ""));
  formData.append("public_id", String(uploadConfig.publicId || ""));

  const response = await fetch(uploadConfig.uploadUrl, {
    method: "POST",
    body: formData
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || "Khong the tai anh cau hoi.");
  }

  const secureUrl = String(data.secure_url || "").trim();
  document.getElementById("questionImageUrl").value = secureUrl;
  document.getElementById("questionImageHelp").textContent = "Anh cau hoi da duoc upload.";
  return secureUrl;
}

let questionImageObjectUrl = "";

function setQuestionImagePreview(url, isObjectUrl = false) {
  const wrap = document.getElementById("questionImagePreviewWrap");
  const image = document.getElementById("questionImagePreview");
  const help = document.getElementById("questionImageHelp");

  if (questionImageObjectUrl) {
    URL.revokeObjectURL(questionImageObjectUrl);
    questionImageObjectUrl = "";
  }

  if (!url) {
    image.removeAttribute("src");
    wrap.classList.add("d-none");
    help.textContent = "Anh se duoc upload len folder Cloudinary rieng cho cau hoi.";
    return;
  }

  if (isObjectUrl) {
    questionImageObjectUrl = url;
  }

  image.src = url;
  wrap.classList.remove("d-none");
}
