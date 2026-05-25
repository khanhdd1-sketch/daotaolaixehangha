const studentState = {
  currentUser: null,
  theoryWorkspace: { student: null, exams: [], results: [] },
  activeTheoryExam: null,
  learningWorkspace: { lessons: [], completed_count: 0, total_count: 0 },
  simulationWorkspace: { exam: null, clips: [], attempts: [] },
  simulationAnswers: {},
  simulationClipIndex: 0,
  thirdPartyWorkspace: { links: {}, attempts: [], student: null },
  charts: {
    progress: null,
    status: null
  },
  theoryTimer: {
    intervalId: null,
    endsAt: 0
  }
};

let proofPreviewUrl = "";

document.addEventListener("DOMContentLoaded", async () => {
  await globalThis.DriveSchoolI18n.loadTranslations();
  globalThis.DriveSchoolCommon.initZaloBubble();
  globalThis.DriveSchoolCommon.trackVisit();

  const currentUser = await globalThis.DriveSchoolCommon.getCurrentUser();
  if (!currentUser) {
    globalThis.DriveSchoolCommon.redirectWithLang("/login.html");
    return;
  }
  if (currentUser.role !== "student") {
    globalThis.DriveSchoolCommon.redirectWithLang("/admin.html");
    return;
  }

  studentState.currentUser = currentUser;
  bindStudentEvents();
  await refreshStudentApp();
});

function bindStudentEvents() {
  document.getElementById("studentLogoutButton").onclick = () => globalThis.DriveSchoolCommon.logoutAndRedirect();
  document.getElementById("cancelTheoryButton").onclick = closeTheoryRunner;
  document.getElementById("theoryExamGrid").addEventListener("click", handleTheoryGridClick);
  document.getElementById("theoryExamForm").addEventListener("submit", handleTheorySubmit);
  document.getElementById("thirdPartyResultForm").addEventListener("submit", handleThirdPartySubmit);
  document.getElementById("proofImage").addEventListener("change", handleProofImageChange);
  document.getElementById("examType").addEventListener("change", syncThirdPartyMeta);
  document.getElementById("simulationWorkspace").addEventListener("click", handleSimulationClick);

  ["historySearchInput"].forEach((id) => document.getElementById(id).addEventListener("input", renderHistoryTable));
  ["historyTypeFilter", "historyStatusFilter"].forEach((id) => {
    document.getElementById(id).addEventListener("change", renderHistoryTable);
  });
}

async function refreshStudentApp() {
  const [theoryResponse, learningResponse, simulationResponse, thirdPartyResponse] = await Promise.all([
    globalThis.DriveSchoolCommon.apiFetch("/api/exams/workspace"),
    globalThis.DriveSchoolCommon.apiFetch("/api/learning/workspace"),
    globalThis.DriveSchoolCommon.apiFetch("/api/simulation/workspace"),
    globalThis.DriveSchoolCommon.apiFetch("/api/third-party/workspace")
  ]);

  studentState.theoryWorkspace = theoryResponse.data || { student: null, exams: [], results: [] };
  studentState.learningWorkspace = learningResponse.data || { lessons: [] };
  studentState.simulationWorkspace = simulationResponse.data || { exam: null, clips: [], attempts: [] };
  studentState.thirdPartyWorkspace = thirdPartyResponse.data || { links: {}, attempts: [], student: null };
  studentState.simulationAnswers = {};
  studentState.simulationClipIndex = 0;

  const student = studentState.theoryWorkspace.student || studentState.thirdPartyWorkspace.student || studentState.currentUser;
  document.getElementById("welcomeStudent").textContent = student.name || "Hoc vien";
  document.getElementById("studentCourseBadge").textContent = student.course_type || "-";
  document.getElementById("studentCourseType").textContent = student.course_type || "-";

  renderOverviewStats();
  renderTheoryExamGrid();
  renderLessonList();
  renderSimulationWorkspace();
  renderThirdPartyLinks();
  syncThirdPartyMeta();
  renderHistoryTable();
  renderStudentCharts();
}

function renderOverviewStats() {
  const theoryPassedCount = (studentState.theoryWorkspace.exams || []).filter((item) => item.passed).length;
  const simulationAttemptCount = (studentState.simulationWorkspace.attempts || []).length;
  const submissionCount =
    (studentState.theoryWorkspace.results || []).length +
    (studentState.simulationWorkspace.attempts || []).length +
    (studentState.thirdPartyWorkspace.attempts || []).length;

  document.getElementById("theoryPassedCount").textContent = String(theoryPassedCount);
  document.getElementById("simulationAttemptCount").textContent = String(simulationAttemptCount);
  document.getElementById("submissionCount").textContent = String(submissionCount);
  document.getElementById("lessonProgressBadge").textContent = `${studentState.learningWorkspace.completed_count || 0}/${studentState.learningWorkspace.total_count || 0} bai hoc`;
}

function renderTheoryExamGrid() {
  const exams = studentState.theoryWorkspace.exams || [];
  document.getElementById("theoryExamBadge").textContent = `${exams.length} de`;
  document.getElementById("theoryExamGrid").innerHTML = exams.length
    ? exams.map((exam) => `
      <div class="col-lg-4 col-md-6">
        <article class="question-card h-100">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
            <div>
              <div class="section-badge mb-2">${escape(exam.course_type || "-")}</div>
              <h3 class="h5 mb-1">${escape(exam.title)}</h3>
              <p class="text-muted mb-0">${exam.total_questions} cau | Dat ${exam.pass_score} | ${exam.duration_minutes} phut</p>
            </div>
            ${exam.passed ? '<span class="badge text-bg-success">Da dat</span>' : '<span class="badge text-bg-light">Chua dat</span>'}
          </div>
          <div class="small text-muted mb-3">
            Lan thi: ${escape(String(exam.attempt_count || 0))}<br>
            Diem cao nhat: ${escape(String(exam.best_score || 0))}
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-primary" type="button" data-action="start-theory" data-exam-id="${escape(exam.id)}">Lam de ngay</button>
            ${exam.latest_attempt ? `<a class="btn btn-outline-secondary" href="${globalThis.DriveSchoolCommon.withLangUrl(`/result.html?id=${exam.latest_attempt.id}`)}">Xem lan gan nhat</a>` : ""}
          </div>
        </article>
      </div>
    `).join("")
    : '<div class="col-12 text-muted">Chua co de thi noi bo cho loai bang nay.</div>';
}

function renderLessonList() {
  const lessons = studentState.learningWorkspace.lessons || [];
  document.getElementById("lessonList").innerHTML = lessons.length
    ? lessons.map((lesson) => `
      <div class="admin-list-item ${lesson.unlocked ? "" : "is-disabled"}">
        <div>
          <div class="fw-semibold">${escape(lesson.title)}</div>
          <div class="small text-muted">${escape(lesson.description || "")}</div>
        </div>
        <span class="badge ${lesson.completed ? "text-bg-success" : lesson.unlocked ? "text-bg-warning" : "text-bg-secondary"}">
          ${lesson.completed ? "Da xong" : lesson.unlocked ? "Dang hoc" : "Dang khoa"}
        </span>
      </div>
    `).join("")
    : '<div class="text-muted">Chua co bai hoc nao.</div>';
}

function renderSimulationWorkspace() {
  const container = document.getElementById("simulationWorkspace");
  const exam = studentState.simulationWorkspace.exam;
  const clips = studentState.simulationWorkspace.clips || [];
  const clip = clips[studentState.simulationClipIndex] || null;

  if (!exam || !clips.length) {
    container.innerHTML = '<div class="text-muted">Chua co bai mo phong cho loai bang nay.</div>';
    return;
  }

  document.getElementById("simulationBadge").textContent = `${clips.length} clip`;
  container.innerHTML = `
    <div class="simulation-player-shell">
      <div class="simulation-player-main">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h3 class="h5 mb-1">${escape(exam.title)}</h3>
            <p class="text-muted mb-0">${escape(exam.description || "")}</p>
          </div>
          <span class="compact-badge">Clip ${studentState.simulationClipIndex + 1}/${clips.length}</span>
        </div>
        <video id="simulationVideo" class="w-100 rounded border mb-3" controls preload="metadata" src="${escape(clip.video_url)}"></video>
        <div class="d-flex gap-2 flex-wrap mb-3">
          <button class="btn btn-outline-secondary" type="button" data-action="prev-simulation" ${studentState.simulationClipIndex === 0 ? "disabled" : ""}>Clip truoc</button>
          <button class="btn btn-primary" type="button" data-action="capture-simulation">Ghi nhan nguy hiem</button>
          <button class="btn btn-outline-secondary" type="button" data-action="next-simulation" ${studentState.simulationClipIndex === clips.length - 1 ? "disabled" : ""}>Clip tiep</button>
          <button class="btn btn-success" type="button" data-action="submit-simulation">Nop bai mo phong</button>
        </div>
        <div class="small text-muted">
          Cua so tinh diem: ${clip.trigger_start_sec}s - ${clip.trigger_end_sec}s<br>
          Da ghi nhan: ${studentState.simulationAnswers[clip.id] ?? "Chua bam"}
        </div>
      </div>
      <div class="simulation-player-side">
        ${clips.map((item, index) => `
          <button class="simulation-clip-item ${index === studentState.simulationClipIndex ? "is-active" : ""}" type="button" data-action="jump-simulation" data-clip-index="${index}">
            <div class="fw-semibold">${escape(item.title)}</div>
            <div class="small text-muted">Bam tu ${item.trigger_start_sec}s den ${item.trigger_end_sec}s</div>
            <div class="small mt-1">${studentState.simulationAnswers[item.id] !== undefined ? `Da bam: ${studentState.simulationAnswers[item.id]}s` : "Chua bam"}</div>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderThirdPartyLinks() {
  const entries = Object.entries(studentState.thirdPartyWorkspace.links || {});
  const container = document.getElementById("thirdPartyLinks");
  container.innerHTML = entries.length
    ? entries.map(([examType, item]) => `
      <div class="col-md-4">
        <article class="question-card h-100">
          <h3 class="h5 mb-2">${escape(item.label || examType)}</h3>
          <p class="text-muted mb-3">Nen tang: ${escape(item.platform_name || "-")}</p>
          <a class="btn btn-outline-primary" href="${escape(item.url || "#")}" target="_blank" rel="noopener noreferrer">Mo bai thi</a>
        </article>
      </div>
    `).join("")
    : '<div class="col-12 text-muted">Chua co link 3rd-party.</div>';
}

function renderHistoryTable() {
  const searchTerm = normalizeText(document.getElementById("historySearchInput").value);
  const typeFilter = document.getElementById("historyTypeFilter").value;
  const statusFilter = document.getElementById("historyStatusFilter").value;

  const theoryRows = (studentState.theoryWorkspace.results || []).map((item) => ({
    ...item,
    source_type: "theory",
    source_label: "Ly thuyet noi bo",
    display_name: findTheoryExamTitle(item.exam_id),
    action_url: globalThis.DriveSchoolCommon.withLangUrl(`/result.html?id=${item.id}`)
  }));
  const simulationRows = (studentState.simulationWorkspace.attempts || []).map((item) => ({
    ...item,
    source_type: "simulation",
    source_label: "Mo phong",
    display_name: studentState.simulationWorkspace.exam?.title || item.exam_id
  }));
  const thirdPartyRows = (studentState.thirdPartyWorkspace.attempts || []).map((item) => ({
    ...item,
    source_type: "third_party",
    source_label: "3rd-party",
    display_name: `${item.exam_type || "-"} | ${item.platform_name || "-"}`
  }));

  const merged = [...theoryRows, ...simulationRows, ...thirdPartyRows]
    .filter((item) => {
      const matchesType = !typeFilter || item.source_type === typeFilter;
      const matchesStatus = !statusFilter || (item.passed ? "passed" : "failed") === statusFilter;
      const matchesKeyword = matchesSearch([item.display_name, item.note, item.platform_name, item.exam_type], searchTerm);
      return matchesType && matchesStatus && matchesKeyword;
    })
    .sort((left, right) => new Date(right.submitted_at || 0) - new Date(left.submitted_at || 0));

  document.getElementById("historyBadge").textContent = `${merged.length} ket qua`;
  document.getElementById("historyTable").innerHTML = merged.length
    ? merged.map((item) => `
      <tr>
        <td>${escape(item.source_label)}</td>
        <td>${escape(item.display_name || "-")}</td>
        <td>#${escape(String(item.attempt_no || 1))}</td>
        <td>${escape(String(item.score || 0))}</td>
        <td>${item.passed ? '<span class="badge text-bg-success">Dat</span>' : '<span class="badge text-bg-danger">Chua dat</span>'}</td>
        <td>${globalThis.DriveSchoolCommon.formatDateTime(item.submitted_at)}</td>
        <td>${item.action_url ? `<a class="btn btn-sm btn-outline-primary" href="${item.action_url}">Xem chi tiet</a>` : '<span class="text-muted">-</span>'}</td>
      </tr>
    `).join("")
    : '<tr><td colspan="7" class="text-center text-muted py-4">Chua co ket qua phu hop.</td></tr>';
}

function renderStudentCharts() {
  const history = buildUnifiedHistory();
  const labels = history.map((item, index) => `${item.source_label} ${index + 1}`);
  const scores = history.map((item) => Number(item.score || 0));
  const passedCount = history.filter((item) => item.passed).length;
  const failedCount = history.length - passedCount;

  document.getElementById("studentProgressBadge").textContent = `${history.length} lan nop`;
  document.getElementById("studentStatusBadge").textContent = `${history.length} ket qua`;

  upsertStudentChart("progress", "studentProgressChart", {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Diem",
          data: scores,
          borderColor: "#0d47a1",
          backgroundColor: "rgba(13, 71, 161, 0.12)",
          fill: true,
          tension: 0.3,
          pointBackgroundColor: history.map((item) => item.passed ? "#2e7d32" : "#c62828")
        }
      ]
    },
    options: buildStudentChartOptions({
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    })
  });

  upsertStudentChart("status", "studentStatusChart", {
    type: "doughnut",
    data: {
      labels: ["Dat", "Chua dat"],
      datasets: [
        {
          data: [passedCount, failedCount],
          backgroundColor: ["#2e7d32", "#c62828"]
        }
      ]
    },
    options: buildStudentChartOptions()
  });
}

async function handleTheoryGridClick(event) {
  const button = event.target.closest("[data-action='start-theory']");
  if (!button) return;

  const examId = button.dataset.examId;
  const response = await globalThis.DriveSchoolCommon.apiFetch(`/api/exams/${encodeURIComponent(examId)}/questions`);
  studentState.activeTheoryExam = response.data || null;
  openTheoryRunner();
}

function openTheoryRunner() {
  const section = document.getElementById("theoryRunnerSection");
  const detail = studentState.activeTheoryExam;
  if (!detail) return;

  section.classList.remove("d-none");
  document.getElementById("theoryRunnerTitle").textContent = detail.exam.title || "Lam de";
  document.getElementById("theoryRunnerMeta").textContent = `${detail.exam.total_questions} cau | Dat ${detail.exam.pass_score} | ${detail.exam.duration_minutes} phut`;
  document.getElementById("theoryQuestionList").innerHTML = (detail.questions || []).map((question, index) => `
    <article class="question-card mb-3">
      <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
        <div class="fw-semibold">${index + 1}. ${escape(question.question)}</div>
        ${question.is_critical ? '<span class="badge text-bg-danger">Diem liet</span>' : ""}
      </div>
      ${["A", "B", "C", "D"].map((option) => `
        <label class="answer-option">
          <input type="radio" name="question_${escape(question.id)}" value="${option}">
          <span><strong>${option}.</strong> ${escape(question[`option_${option.toLowerCase()}`] || "")}</span>
        </label>
      `).join("")}
    </article>
  `).join("");

  startTheoryTimer(Number(detail.exam.duration_minutes || 20));
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeTheoryRunner() {
  stopTheoryTimer();
  studentState.activeTheoryExam = null;
  document.getElementById("theoryRunnerSection").classList.add("d-none");
  document.getElementById("theoryQuestionList").innerHTML = "";
}

async function handleTheorySubmit(event) {
  event.preventDefault();
  const detail = studentState.activeTheoryExam;
  if (!detail?.exam?.id) return;

  const answers = {};
  (detail.questions || []).forEach((question) => {
    const selected = document.querySelector(`input[name="question_${question.id}"]:checked`);
    if (selected) {
      answers[question.id] = selected.value;
    }
  });

  const response = await globalThis.DriveSchoolCommon.apiFetch(`/api/exams/${encodeURIComponent(detail.exam.id)}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers })
  });
  globalThis.DriveSchoolCommon.showToast("Da nop bai ly thuyet.", "success");
  closeTheoryRunner();
  await refreshStudentApp();
  globalThis.location.href = globalThis.DriveSchoolCommon.withLangUrl(`/result.html?id=${response.data.result_id}`);
}

function handleSimulationClick(event) {
  const actionNode = event.target.closest("[data-action]");
  if (!actionNode) return;

  const clips = studentState.simulationWorkspace.clips || [];
  switch (actionNode.dataset.action) {
    case "prev-simulation":
      studentState.simulationClipIndex = Math.max(0, studentState.simulationClipIndex - 1);
      renderSimulationWorkspace();
      break;
    case "next-simulation":
      studentState.simulationClipIndex = Math.min(clips.length - 1, studentState.simulationClipIndex + 1);
      renderSimulationWorkspace();
      break;
    case "jump-simulation":
      studentState.simulationClipIndex = Number(actionNode.dataset.clipIndex || 0);
      renderSimulationWorkspace();
      break;
    case "capture-simulation":
      captureSimulationMoment();
      break;
    case "submit-simulation":
      submitSimulationAttempt();
      break;
    default:
      break;
  }
}

function captureSimulationMoment() {
  const video = document.getElementById("simulationVideo");
  const clip = (studentState.simulationWorkspace.clips || [])[studentState.simulationClipIndex];
  if (!video || !clip) return;
  studentState.simulationAnswers[clip.id] = Number(video.currentTime || 0).toFixed(1);
  renderSimulationWorkspace();
  globalThis.DriveSchoolCommon.showToast(`Da ghi nhan ${studentState.simulationAnswers[clip.id]}s`, "success");
}

async function submitSimulationAttempt() {
  const exam = studentState.simulationWorkspace.exam;
  if (!exam?.id) return;
  const response = await globalThis.DriveSchoolCommon.apiFetch(`/api/simulation/${encodeURIComponent(exam.id)}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers: studentState.simulationAnswers })
  });
  globalThis.DriveSchoolCommon.showToast(`Da nop bai mo phong. Diem: ${response.data.score}`, "success");
  await refreshStudentApp();
}

function syncThirdPartyMeta() {
  const examType = document.getElementById("examType").value;
  const item = studentState.thirdPartyWorkspace.links?.[examType] || {};
  document.getElementById("platformName").value = item.platform_name || "";
  document.getElementById("examUrl").value = item.url || "";
}

async function handleThirdPartySubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type='submit']");
  const payload = Object.fromEntries(new FormData(form).entries());
  const proofFile = document.getElementById("proofImage").files[0];

  submitButton.disabled = true;
  try {
    if (proofFile) {
      payload.proof_url = await uploadProofImage(proofFile);
    }
    await globalThis.DriveSchoolCommon.apiFetch("/api/third-party/submit", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    globalThis.DriveSchoolCommon.showToast("Da gui ket qua 3rd-party.", "success");
    form.reset();
    clearProofPreview();
    syncThirdPartyMeta();
    await refreshStudentApp();
  } catch (error) {
    globalThis.DriveSchoolCommon.showToast(error.message, "danger");
  } finally {
    submitButton.disabled = false;
  }
}

function handleProofImageChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    clearProofPreview();
    return;
  }

  if (!String(file.type || "").startsWith("image/")) {
    event.target.value = "";
    clearProofPreview();
    globalThis.DriveSchoolCommon.showToast("Vui long chon file anh.", "warning");
    return;
  }

  if (proofPreviewUrl) {
    URL.revokeObjectURL(proofPreviewUrl);
  }
  proofPreviewUrl = URL.createObjectURL(file);
  document.getElementById("proofPreviewImage").src = proofPreviewUrl;
  document.getElementById("proofPreviewContainer").classList.remove("d-none");
  document.getElementById("proofImageHelp").textContent = `Da chon: ${file.name}`;
}

function clearProofPreview() {
  if (proofPreviewUrl) {
    URL.revokeObjectURL(proofPreviewUrl);
    proofPreviewUrl = "";
  }
  document.getElementById("proofPreviewImage").removeAttribute("src");
  document.getElementById("proofPreviewContainer").classList.add("d-none");
  document.getElementById("proofImageHelp").textContent = "Co the chup man hinh ket qua thi tren iPhone, Android hoac may tinh roi gui ve he thong.";
}

async function uploadProofImage(file) {
  const configResponse = await globalThis.DriveSchoolCommon.apiFetch("/api/third-party/proof-upload-config");
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
    throw new Error(data.error?.message || "Khong the tai anh minh chung.");
  }
  return String(data.secure_url || "").trim();
}

function buildUnifiedHistory() {
  return [
    ...(studentState.theoryWorkspace.results || []).map((item) => ({ ...item, source_label: "LT" })),
    ...(studentState.simulationWorkspace.attempts || []).map((item) => ({ ...item, source_label: "MP" })),
    ...(studentState.thirdPartyWorkspace.attempts || []).map((item) => ({ ...item, source_label: "TP" }))
  ].sort((left, right) => new Date(left.submitted_at || 0) - new Date(right.submitted_at || 0));
}

function startTheoryTimer(durationMinutes) {
  stopTheoryTimer();
  studentState.theoryTimer.endsAt = Date.now() + durationMinutes * 60 * 1000;
  updateTheoryTimer();
  studentState.theoryTimer.intervalId = globalThis.setInterval(updateTheoryTimer, 1000);
}

function stopTheoryTimer() {
  if (studentState.theoryTimer.intervalId) {
    globalThis.clearInterval(studentState.theoryTimer.intervalId);
    studentState.theoryTimer.intervalId = null;
  }
}

function updateTheoryTimer() {
  const remaining = Math.max(0, studentState.theoryTimer.endsAt - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  document.getElementById("theoryTimerBadge").textContent = `${minutes}:${seconds}`;
  if (remaining <= 0) {
    stopTheoryTimer();
    document.getElementById("theoryExamForm").requestSubmit();
  }
}

function upsertStudentChart(chartKey, canvasId, config) {
  if (!globalThis.Chart) return;
  if (studentState.charts[chartKey]) {
    studentState.charts[chartKey].destroy();
  }
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  studentState.charts[chartKey] = new globalThis.Chart(canvas, config);
}

function buildStudentChartOptions(overrides = {}) {
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

function findTheoryExamTitle(examId) {
  return studentState.theoryWorkspace.exams.find((item) => item.id === examId)?.title || examId;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .trim();
}

function matchesSearch(values, normalizedSearch) {
  if (!normalizedSearch) return true;
  return values.some((value) => normalizeText(value).includes(normalizedSearch));
}

function escape(value) {
  return globalThis.DriveSchoolCommon.escapeHtml(value);
}
