let workspace = { links: {}, attempts: [], student: null };
let proofPreviewUrl = "";
const studentCharts = { progress: null, status: null };

const DEFAULT_EXAM_TYPE = "theory";
const MAX_PROOF_DATA_URL_LENGTH = 45000;

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
  renderStudentCharts();
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
            <p class="text-muted mb-3">Nền tảng: ${window.DriveSchoolCommon.escapeHtml(item.platform_name || "-")}</p>
            <a class="btn btn-outline-primary" href="${window.DriveSchoolCommon.escapeHtml(item.url || "#")}" target="_blank" rel="noopener noreferrer">
              Mở bài thi
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
  const proofImageInput = document.getElementById("proofImage");

  examTypeSelect.addEventListener("change", syncExamTypeMeta);
  proofImageInput.addEventListener("change", handleProofImageChange);
  form.addEventListener("submit", handleSubmitResult);
}

function syncExamTypeMeta() {
  const examTypeSelect = document.getElementById("examType");
  const availableExamTypes = Object.keys(workspace.links || {});

  if (availableExamTypes.length && !(workspace.links || {})[examTypeSelect.value]) {
    examTypeSelect.value = availableExamTypes.includes(DEFAULT_EXAM_TYPE) ? DEFAULT_EXAM_TYPE : availableExamTypes[0];
  }

  const examType = examTypeSelect.value;
  const item = (workspace.links || {})[examType] || {};

  document.getElementById("platformName").value = item.platform_name || "";
  document.getElementById("examUrl").value = item.url || "";
}

function handleProofImageChange(event) {
  const file = event.target.files && event.target.files[0];

  if (!file) {
    clearProofPreview();
    return;
  }

  if (!String(file.type || "").startsWith("image/")) {
    event.target.value = "";
    clearProofPreview();
    window.DriveSchoolCommon.showToast("Vui lòng chọn file ảnh minh chứng.", "warning");
    return;
  }

  renderProofPreview(file);
}

async function handleSubmitResult(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type='submit']");
  const formData = new FormData(form);
  const payload = {
    exam_type: String(formData.get("exam_type") || "").trim(),
    score: String(formData.get("score") || "").trim(),
    passed: formData.get("passed"),
    note: String(formData.get("note") || "").trim(),
    platform_name: document.getElementById("platformName").value.trim(),
    exam_url: document.getElementById("examUrl").value.trim(),
    proof_url: ""
  };
  const proofFile = document.getElementById("proofImage").files[0];
  const scoreValue = Number(payload.score);

  if (!payload.exam_type || !payload.platform_name || !payload.exam_url || payload.score === "" || !Number.isFinite(scoreValue)) {
    window.DriveSchoolCommon.showToast("Vui long chon loai thi va nhap diem.", "warning");
    return;
  }

  submitButton.disabled = true;
  try {
    if (proofFile) {
      payload.proof_url = await buildProofDataUrl(proofFile);
    }

    await window.DriveSchoolCommon.apiFetch("/api/third-party/submit", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    window.DriveSchoolCommon.showToast("Da gui ket qua cho admin.", "success");
    form.reset();
    clearProofPreview();
    document.getElementById("examType").value = DEFAULT_EXAM_TYPE;
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

function renderStudentCharts() {
  const attempts = workspace.attempts || [];
  renderProgressChart(attempts);
  renderStatusChart(attempts);
}

function renderProgressChart(attempts) {
  const orderedAttempts = [...attempts].reverse();
  const labels = orderedAttempts.map((item, index) => `Lan ${index + 1}`);
  const scores = orderedAttempts.map((item) => Number(item.score || 0));
  const hasData = orderedAttempts.length > 0;

  document.getElementById("studentProgressBadge").textContent = `${orderedAttempts.length} lan gui`;
  setStudentChartEmptyState("studentProgressChart", "studentProgressChartEmpty", hasData);
  if (!hasData) {
    destroyStudentChart("progress");
    return;
  }

  upsertStudentChart("progress", "studentProgressChart", {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Diem",
          data: scores,
          borderColor: "#0d47a1",
          backgroundColor: "rgba(13, 71, 161, 0.15)",
          pointBackgroundColor: orderedAttempts.map((item) => (item.passed ? "#2e7d32" : "#c62828")),
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5,
          tension: 0.28,
          fill: true
        }
      ]
    },
    options: buildStudentChartOptions({
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            afterLabel(context) {
              const item = orderedAttempts[context.dataIndex] || {};
              return [
                `Loai thi: ${item.exam_type || "-"}`,
                `Trang thai: ${item.passed ? "Dat" : "Chua dat"}`
              ];
            }
          }
        }
      }
    })
  });
}

function renderStatusChart(attempts) {
  const passedCount = attempts.filter((item) => item.passed).length;
  const failedCount = attempts.length - passedCount;
  const hasData = attempts.length > 0;

  document.getElementById("studentStatusBadge").textContent = `${attempts.length} ket qua`;
  setStudentChartEmptyState("studentStatusChart", "studentStatusChartEmpty", hasData);
  if (!hasData) {
    destroyStudentChart("status");
    return;
  }

  upsertStudentChart("status", "studentStatusChart", {
    type: "doughnut",
    data: {
      labels: ["Dat", "Chua dat"],
      datasets: [
        {
          data: [passedCount, failedCount],
          backgroundColor: ["#2e7d32", "#c62828"],
          hoverOffset: 8
        }
      ]
    },
    options: buildStudentChartOptions({
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            boxWidth: 10
          }
        }
      }
    })
  });
}

function renderProofPreview(file) {
  const previewContainer = document.getElementById("proofPreviewContainer");
  const previewImage = document.getElementById("proofPreviewImage");
  const previewHelp = document.getElementById("proofImageHelp");

  if (proofPreviewUrl) {
    URL.revokeObjectURL(proofPreviewUrl);
  }

  proofPreviewUrl = URL.createObjectURL(file);
  previewImage.src = proofPreviewUrl;
  previewContainer.classList.remove("d-none");
  previewHelp.textContent = `Da chon: ${file.name}`;
}

function clearProofPreview() {
  const previewContainer = document.getElementById("proofPreviewContainer");
  const previewImage = document.getElementById("proofPreviewImage");
  const previewHelp = document.getElementById("proofImageHelp");

  if (proofPreviewUrl) {
    URL.revokeObjectURL(proofPreviewUrl);
    proofPreviewUrl = "";
  }

  previewImage.removeAttribute("src");
  previewContainer.classList.add("d-none");
  previewHelp.textContent = "Co the chon anh chup man hinh tu dien thoai hoac may tinh. He thong se tu nen truoc khi gui.";
}

async function buildProofDataUrl(file) {
  if (!String(file.type || "").startsWith("image/")) {
    throw new Error("Vui long chon file anh minh chung.");
  }

  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl).catch(() => null);

  if (!image) {
    if (sourceDataUrl.length <= MAX_PROOF_DATA_URL_LENGTH) {
      return sourceDataUrl;
    }
    throw new Error("Anh minh chung chua duoc ho tro. Vui long doi sang PNG hoac JPG.");
  }

  const compressionSteps = [
    { maxDimension: 1440, type: "image/webp", quality: 0.82 },
    { maxDimension: 1280, type: "image/jpeg", quality: 0.8 },
    { maxDimension: 1080, type: "image/jpeg", quality: 0.72 },
    { maxDimension: 960, type: "image/jpeg", quality: 0.62 },
    { maxDimension: 820, type: "image/jpeg", quality: 0.55 }
  ];

  for (const step of compressionSteps) {
    const candidate = serializeImage(image, step);
    if (candidate && candidate.length <= MAX_PROOF_DATA_URL_LENGTH) {
      return candidate;
    }
  }

  throw new Error("Anh minh chung hoi lon. Vui long chup gon phan diem hoac cat anh truoc khi gui.");
}

function serializeImage(image, { maxDimension, type, quality }) {
  const naturalWidth = image.naturalWidth || image.width || 1;
  const naturalHeight = image.naturalHeight || image.height || 1;
  const scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return "";
  }

  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const dataUrl = canvas.toDataURL(type, quality);
  if (type === "image/webp" && !dataUrl.startsWith("data:image/webp")) {
    return "";
  }
  return dataUrl;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Khong the doc anh minh chung."));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Khong the tai anh minh chung."));
    image.src = dataUrl;
  });
}

function buildStudentChartOptions(overrides = {}) {
  const { plugins: overridePlugins = {}, ...restOverrides } = overrides;
  const baseLegend = {
    position: "bottom"
  };
  const baseTooltip = {
    intersect: false,
    mode: "index"
  };

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 450
    },
    plugins: {
      legend: {
        ...baseLegend,
        ...(overridePlugins.legend || {})
      },
      tooltip: {
        ...baseTooltip,
        ...(overridePlugins.tooltip || {})
      }
    },
    ...restOverrides
  };
}

function upsertStudentChart(chartKey, canvasId, config) {
  if (!window.Chart) {
    return;
  }

  destroyStudentChart(chartKey);
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  studentCharts[chartKey] = new window.Chart(canvas, config);
}

function destroyStudentChart(chartKey) {
  if (studentCharts[chartKey]) {
    studentCharts[chartKey].destroy();
    studentCharts[chartKey] = null;
  }
}

function setStudentChartEmptyState(canvasId, emptyId, hasData) {
  const canvas = document.getElementById(canvasId);
  const empty = document.getElementById(emptyId);

  if (canvas) {
    canvas.classList.toggle("d-none", !hasData);
  }

  if (empty) {
    empty.classList.toggle("d-none", hasData);
  }
}
