import { escapeHtml } from "../../shared/textUtils.js";
import { buildHistoryRows, buildUnifiedChartHistory, filterHistoryRows } from "../../shared/historyUtils.js";
import { resolveNextAction } from "../pipelineUtils.js";
import { getDashboardState } from "../state/dashboardState.js";

/**
 * Hiển thị hoặc ẩn skeleton loading toàn trang dashboard.
 * @param {boolean} isLoading - true khi đang tải API
 * @sideeffects Thay đổi class trên #dashboardLoadingShell
 */
export function setDashboardLoading(isLoading) {
  const shell = document.getElementById("dashboardLoadingShell");
  const content = document.getElementById("dashboardContentShell");
  if (!shell || !content) return;
  shell.classList.toggle("d-none", !isLoading);
  content.classList.toggle("d-none", isLoading);
}

/**
 * Render header và thông tin học viên.
 * @param {object} student - Hồ sơ học viên
 * @sideeffects Ghi nội dung DOM header
 */
export function renderDashboardHeader(student) {
  const welcome = document.getElementById("welcomeStudent");
  const courseBadge = document.getElementById("studentCourseBadge");
  const lessonBadge = document.getElementById("lessonProgressBadge");
  const state = getDashboardState();

  if (welcome) welcome.textContent = student.name || "Học viên";
  if (courseBadge) courseBadge.textContent = student.course_type || "-";
  if (lessonBadge) {
    lessonBadge.textContent = `${state.learningWorkspace.completed_count || 0}/${state.learningWorkspace.total_count || 0} bài học`;
  }
}

/**
 * Render khối Next Action (CTA pipeline).
 * @sideeffects Ghi HTML vào #nextActionCard
 */
export function renderNextAction() {
  const container = document.getElementById("nextActionCard");
  if (!container) return;

  const state = getDashboardState();
  const exams = state.theoryWorkspace.exams || [];
  const theoryPassedCount = exams.filter((item) => item.passed).length;
  const action = resolveNextAction({
    completedLessons: state.learningWorkspace.completed_count || 0,
    totalLessons: state.learningWorkspace.total_count || 0,
    theoryPassedCount,
    theoryExamCount: exams.length,
    simulationAttempts: (state.simulationWorkspace.attempts || []).length,
    hasSimulation: Boolean(state.simulationWorkspace.exam && (state.simulationWorkspace.clips || []).length)
  });

  const href = action.ctaHref.startsWith("#")
    ? action.ctaHref
    : globalThis.DriveSchoolCommon.withLangUrl(action.ctaHref);

  container.innerHTML = `
    <div class="next-action-card">
      <div class="next-action-icon"><i class="fa-solid ${escapeHtml(action.icon)}"></i></div>
      <div class="flex-grow-1">
        <span class="section-badge mb-2">Bước tiếp theo · ${escapeHtml(action.stage)}</span>
        <h2 class="h4 mb-2">${escapeHtml(action.title)}</h2>
        <p class="text-muted mb-3">${escapeHtml(action.description)}</p>
        <a class="btn btn-primary btn-lg" href="${escapeHtml(href)}">${escapeHtml(action.ctaLabel)}</a>
      </div>
    </div>
  `;
}

/**
 * Render thống kê tổng quan (Progress).
 * @sideeffects Cập nhật các phần tử stat-value
 */
export function renderProgressStats() {
  const state = getDashboardState();
  const theoryPassedCount = (state.theoryWorkspace.exams || []).filter((item) => item.passed).length;
  const simulationAttemptCount = (state.simulationWorkspace.attempts || []).length;
  const submissionCount =
    (state.theoryWorkspace.results || []).length +
    simulationAttemptCount +
    (state.thirdPartyWorkspace.attempts || []).length;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  };

  const student = state.theoryWorkspace.student || state.thirdPartyWorkspace.student;
  setText("studentCourseType", student?.course_type || "-");
  setText("theoryPassedCount", theoryPassedCount);
  setText("simulationAttemptCount", simulationAttemptCount);
  setText("submissionCount", submissionCount);
}

/**
 * Render danh sách bài học (Learn).
 * @sideeffects Ghi #lessonList
 */
export function renderLessonList() {
  const container = document.getElementById("lessonList");
  if (!container) return;

  const lessons = getDashboardState().learningWorkspace.lessons || [];
  container.innerHTML = lessons.length
    ? lessons
        .map(
          (lesson) => `
      <div class="admin-list-item ${lesson.unlocked ? "" : "is-disabled"}">
        <div>
          <div class="fw-semibold">${escapeHtml(lesson.title)}</div>
          <div class="small text-muted">${escapeHtml(lesson.description || "")}</div>
        </div>
        <div class="d-flex flex-column align-items-end gap-2">
          <span class="badge ${lesson.completed ? "text-bg-success" : lesson.watched ? "text-bg-info" : lesson.unlocked ? "text-bg-warning" : "text-bg-secondary"}">
            ${lesson.completed ? "Đã xong" : lesson.watched ? "Đã xem" : lesson.unlocked ? "Đang học" : "Đang khóa"}
          </span>
          <button 
            class="btn btn-sm btn-outline-primary ${lesson.unlocked ? "" : "is-disabled"}"
            onclick="DriveSchoolCommon.previewLesson('${lesson.id}')"
          >
            Học ngay
          </button>
        </div>
      </div>
    `
        )
        .join("")
    : `<div class="empty-state"><i class="fa-solid fa-book-open"></i><p>Chưa có bài học nào cho khóa của bạn.</p></div>`;
}

/**
 * Render lưới luyện tập (Practice) — preview đề + link 3rd-party.
 * @sideeffects Ghi #practiceExamPreview và #thirdPartyLinks
 */
export function renderPracticeSection() {
  const preview = document.getElementById("practiceExamPreview");
  const linksContainer = document.getElementById("thirdPartyLinks");
  const state = getDashboardState();
  const exams = (state.theoryWorkspace.exams || []).slice(0, 3);

  if (preview) {
    preview.classList.add("row", "g-3");
    preview.innerHTML = exams.length
      ? exams
          .map(
            (exam) => `
        <div class="col-md-4">
        <article class="question-card h-100">
          <div class="section-badge mb-2">${escapeHtml(exam.course_type || "-")}</div>
          <h3 class="h6 mb-1">${escapeHtml(exam.title)}</h3>
          <p class="small text-muted mb-2">${exam.total_questions} câu · Đạt ${exam.pass_score}</p>
          ${exam.passed ? '<span class="badge text-bg-success">Đã đạt</span>' : '<span class="badge text-bg-light">Chưa đạt</span>'}
        </article>
        </div>
      `
          )
          .join("")
      : `<div class="col-12 empty-state"><i class="fa-solid fa-file-circle-question"></i><p>Chưa có đề luyện tập.</p></div>`;
  }

  if (linksContainer) {
    const entries = Object.entries(state.thirdPartyWorkspace.links || {});
    linksContainer.innerHTML = entries.length
      ? entries
          .map(
            ([examType, item]) => `
        <div class="col-md-4">
          <article class="question-card h-100">
            <h3 class="h6 mb-2">${escapeHtml(item.label || examType)}</h3>
            <p class="small text-muted mb-3">${escapeHtml(item.platform_name || "-")}</p>
            <a class="btn btn-outline-primary btn-sm" href="${escapeHtml(item.url || "#")}" target="_blank" rel="noopener noreferrer">Mở bài thi</a>
          </article>
        </div>
      `
          )
          .join("")
      : `<div class="col-12 empty-state"><p>Chưa có link thi bên thứ 3.</p></div>`;
  }
}

/**
 * Render khu vực Test (CTA tới trang thi riêng).
 * @sideeffects Ghi #testSectionCards
 */
export function renderTestSection() {
  const container = document.getElementById("testSectionCards");
  if (!container) return;

  const state = getDashboardState();
  const theoryCount = (state.theoryWorkspace.exams || []).length;
  const simClips = (state.simulationWorkspace.clips || []).length;

  container.innerHTML = `
    <div class="col-md-6">
      <article class="test-cta-card">
        <div class="test-cta-icon accent-blue"><i class="fa-solid fa-file-circle-check"></i></div>
        <h3 class="h5">Thi lý thuyết</h3>
        <p class="text-muted">${theoryCount} đề nội bộ · Làm bài có giải thích sau khi nộp</p>
        <a class="btn btn-primary" href="${globalThis.DriveSchoolCommon.withLangUrl("/theory-exam.html")}">Vào thi lý thuyết</a>
      </article>
    </div>
    <div class="col-md-6">
      <article class="test-cta-card">
        <div class="test-cta-icon accent-orange"><i class="fa-solid fa-road"></i></div>
        <h3 class="h5">Thi mô phỏng</h3>
        <p class="text-muted">${simClips ? `${simClips} clip video` : "Chưa có bài"} · Ghi nhận thời điểm nguy hiểm</p>
        <a class="btn btn-primary ${simClips ? "" : "disabled"}" href="${globalThis.DriveSchoolCommon.withLangUrl("/simulation-exam.html")}">Vào thi mô phỏng</a>
      </article>
    </div>
  `;
}

/**
 * Render bảng lịch sử (History).
 * @sideeffects Ghi #historyTable, #historyBadge
 */
export function renderHistoryTable() {
  const state = getDashboardState();
  const searchInput = document.getElementById("historySearchInput");
  const typeFilter = document.getElementById("historyTypeFilter");
  const statusFilter = document.getElementById("historyStatusFilter");
  const tbody = document.getElementById("historyTable");
  const badge = document.getElementById("historyBadge");
  if (!tbody) return;

  const findTheoryTitle = (examId) =>
    state.theoryWorkspace.exams.find((item) => item.id === examId)?.title || examId;

  const rows = buildHistoryRows(
    {
      theoryResults: state.theoryWorkspace.results || [],
      simulationAttempts: state.simulationWorkspace.attempts || [],
      thirdPartyAttempts: state.thirdPartyWorkspace.attempts || []
    },
    {
      findTheoryTitle,
      simulationExamTitle: state.simulationWorkspace.exam?.title
    }
  );

  const filtered = filterHistoryRows(rows, {
    searchTerm: searchInput?.value || "",
    typeFilter: typeFilter?.value || "",
    statusFilter: statusFilter?.value || ""
  });

  if (badge) badge.textContent = `${filtered.length} kết quả`;
  tbody.innerHTML = filtered.length
    ? filtered
        .map(
          (item) => `
      <tr>
        <td>${escapeHtml(item.source_label)}</td>
        <td>${escapeHtml(item.display_name || "-")}</td>
        <td>#${escapeHtml(String(item.attempt_no || 1))}</td>
        <td>${escapeHtml(String(item.score || 0))}</td>
        <td>${item.passed ? '<span class="badge text-bg-success">Đạt</span>' : '<span class="badge text-bg-danger">Chưa đạt</span>'}</td>
        <td>${globalThis.DriveSchoolCommon.formatDateTime(item.submitted_at)}</td>
        <td>${item.action_url ? `<a class="btn btn-sm btn-outline-primary" href="${item.action_url}">Chi tiết</a>` : '<span class="text-muted">-</span>'}</td>
      </tr>
    `
        )
        .join("")
    : `<tr><td colspan="7" class="text-center text-muted py-4">Chưa có kết quả phù hợp.</td></tr>`;
}

/**
 * Đồng bộ meta form 3rd-party theo loại thi đã chọn.
 * @sideeffects Ghi giá trị input platformName, examUrl
 */
export function syncThirdPartyMeta() {
  const examTypeEl = document.getElementById("examType");
  if (!examTypeEl) return;
  const item = getDashboardState().thirdPartyWorkspace.links?.[examTypeEl.value] || {};
  const platform = document.getElementById("platformName");
  const url = document.getElementById("examUrl");
  if (platform) platform.value = item.platform_name || "";
  if (url) url.value = item.url || "";
}

/**
 * Vẽ biểu đồ tiến độ học viên.
 * @sideeffects Tạo/hủy Chart.js instances
 */
export function renderStudentCharts() {
  if (!globalThis.Chart) return;
  const state = getDashboardState();
  const history = buildUnifiedChartHistory({
    theoryResults: state.theoryWorkspace.results || [],
    simulationAttempts: state.simulationWorkspace.attempts || [],
    thirdPartyAttempts: state.thirdPartyWorkspace.attempts || []
  });

  const labels = history.map((item, index) => `${item.source_label} ${index + 1}`);
  const scores = history.map((item) => Number(item.score || 0));
  const passedCount = history.filter((item) => item.passed).length;
  const failedCount = history.length - passedCount;

  const progressBadge = document.getElementById("studentProgressBadge");
  const statusBadge = document.getElementById("studentStatusBadge");
  if (progressBadge) progressBadge.textContent = `${history.length} lần nộp`;
  if (statusBadge) statusBadge.textContent = `${history.length} kết quả`;

  upsertChart("progress", "studentProgressChart", {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Điểm",
          data: scores,
          borderColor: "#0d47a1",
          backgroundColor: "rgba(13, 71, 161, 0.12)",
          fill: true,
          tension: 0.3,
          pointBackgroundColor: history.map((item) => (item.passed ? "#2e7d32" : "#c62828"))
        }
      ]
    },
    options: chartOptions({
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    })
  });

  upsertChart("status", "studentStatusChart", {
    type: "doughnut",
    data: {
      labels: ["Đạt", "Chưa đạt"],
      datasets: [{ data: [passedCount, failedCount], backgroundColor: ["#2e7d32", "#c62828"] }]
    },
    options: chartOptions()
  });
}

/**
 * Tạo hoặc cập nhật một biểu đồ Chart.js trên dashboard.
 * @param {"progress"|"status"} chartKey - Khóa trong state.charts
 * @param {string} canvasId - ID canvas
 * @param {object} config - Cấu hình Chart.js
 * @sideeffects destroy chart cũ nếu có
 */
function upsertChart(chartKey, canvasId, config) {
  const state = getDashboardState();
  if (state.charts[chartKey]) {
    state.charts[chartKey].destroy();
  }
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  state.charts[chartKey] = new globalThis.Chart(canvas, config);
}

/**
 * Tùy chọn mặc định cho biểu đồ học viên.
 * @param {object} overrides - Ghi đè options
 * @returns {object}
 */
function chartOptions(overrides = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 10 } }
    },
    ...overrides
  };
}

/**
 * Render toàn bộ dashboard sau khi có dữ liệu.
 * @sideeffects Gọi nhiều hàm render con
 */
export function renderFullDashboard() {
  const student = getDashboardState().theoryWorkspace.student ||
    getDashboardState().thirdPartyWorkspace.student ||
    getDashboardState().currentUser ||
    {};
  renderDashboardHeader(student);
  renderNextAction();
  renderProgressStats();
  renderLessonList();
  renderPracticeSection();
  renderTestSection();
  syncThirdPartyMeta();
  renderHistoryTable();
  renderStudentCharts();
}
