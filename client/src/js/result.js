
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * Trang xem kết quả thi và lịch sử các lần thi.
 */
const C = globalThis.DriveSchoolConstants || {};
const PAGE_ROUTES = C.PAGE_ROUTES || {
  LOGIN: "/login.html",
  EXAM_DASHBOARD: "/exam.html",
  RESULT: "/result.html"
};
const API_PATHS = C.API_PATHS || {
  RESULTS: "/api/results",
  resultById: (id) => `/api/results/${encodeURIComponent(id)}`
};

document.addEventListener("DOMContentLoaded", async () => {
  await globalThis.DriveSchoolI18n.loadTranslations();
  globalThis.DriveSchoolCommon.initZaloBubble();
  globalThis.DriveSchoolCommon.trackVisit();

  const currentUser = await globalThis.DriveSchoolCommon.getCurrentUser();
  if (!currentUser) {
    globalThis.DriveSchoolCommon.redirectWithLang(PAGE_ROUTES.LOGIN);
    return;
  }

  const logoutButton = document.getElementById("studentLogoutButton");
  if (logoutButton) {
    logoutButton.onclick = () => globalThis.DriveSchoolCommon.logoutAndRedirect();
  }

  const params = new URLSearchParams(globalThis.location.search);
  const resultId = params.get("id");
  if (!resultId) {
    globalThis.DriveSchoolCommon.redirectWithLang(PAGE_ROUTES.EXAM_DASHBOARD);
    return;
  }

  const resultUrl = typeof API_PATHS.resultById === "function"
    ? API_PATHS.resultById(resultId)
    : `/api/results/${encodeURIComponent(resultId)}`;

  const [resultResponse, historyResponse] = await Promise.all([
    globalThis.DriveSchoolCommon.apiFetch(resultUrl),
    globalThis.DriveSchoolCommon.apiFetch(API_PATHS.RESULTS)
  ]);

  renderResult(resultResponse.data);
  renderHistory(historyResponse.data, resultId);
  renderAnswerReview(resultResponse.data);
});

/**
 * Dịch khóa i18n.
 * @param {string} key
 * @param {string} [fallback]
 * @returns {string}
 */
function t(key, fallback = "") {
  return globalThis.DriveSchoolI18n.t(key, fallback);
}

/**
 * Hiển thị tóm tắt kết quả một lần thi.
 * @param {import('./types/domain.js').ExamResult} result
 * @returns {void}
 */
function renderResult(result) {
  const stateEl = document.getElementById("resultState");
  stateEl.textContent = result.passed ? t("result.pass", "PASSED") : t("result.fail", "FAILED");
  stateEl.classList.add(result.passed ? "pass" : "fail");
  document.getElementById("resultSummary").textContent = `${result.user?.name || ""} - ${result.exam?.title || ""}`;
  document.getElementById("attemptText").textContent = `${t("exam.attemptLabel", "Attempt")} #${result.attempt_no || 1}`;
  document.getElementById("scoreText").textContent = `${result.score}/${result.questions.length} - ${t("result.passScore", "Pass score")} ${result.exam?.pass_score || 0}`;
  document.getElementById("criticalText").textContent = result.failed_due_critical
    ? t("result.criticalFail", "Failed because of a critical question.")
    : t("result.noCriticalFail", "No critical-question failure detected.");
}

/**
 * Bảng lịch sử các lần thi.
 * @param {import('./types/domain.js').ExamResult[]} results
 * @param {string} activeResultId
 * @returns {void}
 */
function renderHistory(results, activeResultId) {
  document.getElementById("historyCountBadge").textContent = `${results.length} ${t("result.historyCount", "attempts")}`;
  document.getElementById("historyTable").innerHTML = results.length
    ? results
      .map(
        (item) => `
          <tr class="${item.id === activeResultId ? "table-active" : ""}">
            <td>#${item.attempt_no || 1}</td>
            <td>${globalThis.DriveSchoolCommon.escapeHtml(item.exam_title || item.exam_id)}</td>
            <td>${globalThis.DriveSchoolCommon.escapeHtml(String(item.score))}</td>
            <td>${item.passed ? `<span class="badge text-bg-success">${t("result.pass", "PASSED")}</span>` : `<span class="badge text-bg-danger">${t("result.fail", "FAILED")}</span>`}</td>
            <td>${globalThis.DriveSchoolCommon.formatDateTime(item.submitted_at)}</td>
            <td><a class="btn btn-sm btn-outline-primary" href="${globalThis.DriveSchoolCommon.withLangUrl(`${PAGE_ROUTES.RESULT}?id=${item.id}`)}">${t("result.historyView", "View")}</a></td>
          </tr>
        `
      )
      .join("")
    : `<tr><td colspan="6" class="text-center text-muted py-4">${t("result.historyEmpty", "No attempts yet.")}</td></tr>`;
}

/**
 * Bảng xem lại từng câu trả lời.
 * @param {import('./types/domain.js').ExamResult} result
 * @returns {void}
 */
function renderAnswerReview(result) {
  const reviewRows = (result.questions || []).map((question, index) => {
    const selectedAnswer = String(result.answers?.[question.id] || "").trim().toUpperCase();
    const correctAnswer = String(question.correct_answer || "").trim().toUpperCase();
    const isCorrect = selectedAnswer === correctAnswer;

    return `
      <tr>
        <td>
          <div class="fw-semibold">${index + 1}. ${globalThis.DriveSchoolCommon.escapeHtml(question.question)}</div>
          ${question.image_url ? `<div class="mt-2"><img class="img-fluid rounded border" style="max-height:220px;" src="${globalThis.DriveSchoolCommon.escapeHtml(question.image_url)}" alt="Anh cau hoi ${index + 1}" loading="lazy"></div>` : ""}
          ${question.is_critical ? `<div class="small text-danger mt-1">${t("admin.onlyCritical", "Critical")}</div>` : ""}
        </td>
        <td>${globalThis.DriveSchoolCommon.escapeHtml(selectedAnswer || "-")}</td>
        <td>${globalThis.DriveSchoolCommon.escapeHtml(correctAnswer || "-")}</td>
        <td>${isCorrect ? `<span class="badge text-bg-success">${t("result.answerCorrect", "Correct")}</span>` : `<span class="badge text-bg-danger">${t("result.answerWrong", "Wrong")}</span>`}</td>
        <td>${globalThis.DriveSchoolCommon.escapeHtml(question.explanation || t("result.noExplanation", "No explanation available."))}</td>
      </tr>
    `;
  });

  document.getElementById("answerReviewTable").innerHTML = reviewRows.join("");
}
