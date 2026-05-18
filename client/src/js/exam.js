
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */
let workspace = { links: {}, attempts: [], student: null };
let proofPreviewUrl = "";
const studentCharts = { progress: null, status: null };

const DEFAULT_EXAM_TYPE = "theory";
const DEFAULT_PROOF_IMAGE_HELP = "Có thể chọn ảnh chụp màn hình từ điện thoại hoặc máy tính. Ảnh sẽ được upload lên cloud và lưu bằng URL.";

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

  const logoutButton = document.getElementById("studentLogoutButton");
  if (logoutButton) {
    logoutButton.onclick = () => globalThis.DriveSchoolCommon.logoutAndRedirect();
  }

  await loadWorkspace();
  initResultForm();
});

async function loadWorkspace() {
  const response = await globalThis.DriveSchoolCommon.apiFetch("/api/third-party/workspace");
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
    container.innerHTML = '<div class="text-muted">Chưa có link thi cho khóa học này.</div>';
    return;
  }

  container.innerHTML = entries
    .map(
      ([examType, item]) => `
        <div class="col-md-4">
          <article class="question-card h-100">
            <h3 class="h5 mb-2">${globalThis.DriveSchoolCommon.escapeHtml(item.label || examType)}</h3>
            <p class="text-muted mb-3">Nền tảng: ${globalThis.DriveSchoolCommon.escapeHtml(item.platform_name || "-")}</p>
            <a class="btn btn-outline-primary" href="${globalThis.DriveSchoolCommon.escapeHtml(item.url || "#")}" target="_blank" rel="noopener noreferrer">
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

  if (
    availableExamTypes.length &&
    !workspace?.links?.[examTypeSelect?.value]
  ) {
    examTypeSelect.value = availableExamTypes.includes(DEFAULT_EXAM_TYPE)
      ? DEFAULT_EXAM_TYPE
      : availableExamTypes[0];
  }
  const examType = examTypeSelect.value;
  const item = workspace?.links?.[examType] ?? {};

  document.getElementById("platformName").value = item.platform_name || "";
  document.getElementById("examUrl").value = item.url || "";
}

function handleProofImageChange(event) {
  const file = event?.target?.files?.[0];

  if (!file) {
    clearProofPreview();
    return;
  }

  if (!String(file.type || "").startsWith("image/")) {
    event.target.value = "";
    clearProofPreview();
    globalThis.DriveSchoolCommon.showToast("Vui lòng chọn file ảnh minh chứng.", "warning");
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
    globalThis.DriveSchoolCommon.showToast("Vui long chon loai thi va nhap diem.", "warning");
    return;
  }

  submitButton.disabled = true;
  try {
    if (proofFile) {
      document.getElementById("proofImageHelp").textContent = "Đang tải ảnh minh chứng lên cloud...";
      payload.proof_url = await uploadProofImage(proofFile);
    }

    await globalThis.DriveSchoolCommon.apiFetch("/api/third-party/submit", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    globalThis.DriveSchoolCommon.showToast("Da gui ket qua cho admin.", "success");
    form.reset();
    clearProofPreview();
    document.getElementById("examType").value = DEFAULT_EXAM_TYPE;
    syncExamTypeMeta();
    await loadWorkspace();
  } catch (error) {
    globalThis.DriveSchoolCommon.showToast(error.message, "danger");
  } finally {
    submitButton.disabled = false;
  }
}

function renderHistory() {
  const attempts = workspace.attempts || [];
  const historyTable = document.getElementById("historyTable");

  document.getElementById("attemptCount").textContent = String(attempts.length);
  document.getElementById("historyBadge").textContent = `${attempts.length} lần`;
  const latest = attempts[0];
  let status = "-";

  if (latest) {
    status = latest.passed ? "Đạt" : "Chưa đạt";
  }

  document.getElementById("latestStatus").textContent = status;


  historyTable.innerHTML = attempts.length
    ? attempts
      .map(
        (item) => `
          <tr>
            <td>${globalThis.DriveSchoolCommon.escapeHtml(item.exam_type || "-")}</td>
            <td>${globalThis.DriveSchoolCommon.escapeHtml(item.platform_name || "-")}</td>
            <td>${globalThis.DriveSchoolCommon.escapeHtml(String(item.score || 0))}</td>
            <td>${item.passed ? '<span class="badge text-bg-success">Dat</span>' : '<span class="badge text-bg-danger">Chua dat</span>'}</td>
            <td>${globalThis.DriveSchoolCommon.formatDateTime(item.submitted_at)}</td>
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

  document.getElementById("studentProgressBadge").textContent = `${orderedAttempts.length} lần gửi`;
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
          label: "Điểm",
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
                `Loại thi: ${item.exam_type || "-"}`,
                `Trạng thái: ${item.passed ? "Đạt" : "Chưa đạt"}`
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
      labels: ["Đạt", "Chưa đạt"],
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
  previewHelp.textContent = `Đã chọn: ${file.name}. Ảnh sẽ được upload lên cloud khi bấm Gửi kết quả.`;
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
  previewHelp.textContent = DEFAULT_PROOF_IMAGE_HELP;
}

async function uploadProofImage(file) {
  if (!String(file.type || "").startsWith("image/")) {
    throw new Error("Vui lòng chọn file ảnh minh chứng.");
  }

  const configResponse = await globalThis.DriveSchoolCommon.apiFetch("/api/third-party/proof-upload-config");
  const uploadConfig = configResponse.data || {};

  if (!uploadConfig.uploadUrl || !uploadConfig.apiKey || !uploadConfig.timestamp || !uploadConfig.signature || !uploadConfig.publicId) {
    throw new Error("Chưa nhận được cấu hình upload ảnh minh chứng.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", String(uploadConfig.apiKey));
  formData.append("timestamp", String(uploadConfig.timestamp));
  formData.append("signature", String(uploadConfig.signature));
  formData.append("folder", String(uploadConfig.folder || ""));
  formData.append("public_id", String(uploadConfig.publicId));

  const response = await fetch(uploadConfig.uploadUrl, {
    method: "POST",
    body: formData
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || "Không thể tải ảnh minh chứng lên cloud.");
  }

  const secureUrl = String(data.secure_url || "").trim();
  if (!/^https:\/\//i.test(secureUrl)) {
    throw new Error("Không nhận được URL ảnh minh chứng hợp lệ.");
  }

  return secureUrl;
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
  if (!globalThis.Chart) {
    return;
  }

  destroyStudentChart(chartKey);
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  studentCharts[chartKey] = new globalThis.Chart(canvas, config);
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
