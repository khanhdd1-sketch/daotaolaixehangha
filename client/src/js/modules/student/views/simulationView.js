import { escapeHtml } from "../../shared/textUtils.js";
import { getSimulationState } from "../state/simulationState.js";

/**
 * Hiển thị loading trang mô phỏng.
 * @param {boolean} isLoading
 */
export function setSimulationLoading(isLoading) {
  const loading = document.getElementById("simulationLoadingShell");
  const content = document.getElementById("simulationContentShell");
  if (loading) loading.classList.toggle("d-none", !isLoading);
  if (content) content.classList.toggle("d-none", isLoading);
}

/**
 * Render workspace thi mô phỏng (video + clip list).
 * @sideeffects Ghi #simulationWorkspace
 */
export function renderSimulationWorkspace() {
  const container = document.getElementById("simulationWorkspace");
  if (!container) return;

  const state = getSimulationState();
  const exam = state.simulationWorkspace.exam;
  const clips = state.simulationWorkspace.clips || [];
  const clip = clips[state.simulationClipIndex] || null;

  if (!exam || !clips.length) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-road"></i><p>Chưa có bài mô phỏng cho loại bằng này.</p><a class="btn btn-outline-primary" href="${globalThis.DriveSchoolCommon.withLangUrl("/exam.html")}">Về dashboard</a></div>`;
    return;
  }

  const badge = document.getElementById("simulationBadge");
  if (badge) badge.textContent = `${clips.length} clip`;

  container.innerHTML = `
    <div class="simulation-player-shell">
      <div class="simulation-player-main">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h3 class="h5 mb-1">${escapeHtml(exam.title)}</h3>
            <p class="text-muted mb-0">${escapeHtml(exam.description || "")}</p>
          </div>
          <span class="compact-badge">Clip ${state.simulationClipIndex + 1}/${clips.length}</span>
        </div>
        <video id="simulationVideo" class="w-100 rounded border mb-3" controls preload="metadata" src="${escapeHtml(clip.video_url)}"></video>
        <div class="d-flex gap-2 flex-wrap mb-3">
          <button class="btn btn-outline-secondary" type="button" data-action="prev-simulation" ${state.simulationClipIndex === 0 ? "disabled" : ""}>Clip trước</button>
          <button class="btn btn-primary" type="button" data-action="capture-simulation">Ghi nhận nguy hiểm</button>
          <button class="btn btn-outline-secondary" type="button" data-action="next-simulation" ${state.simulationClipIndex === clips.length - 1 ? "disabled" : ""}>Clip tiếp</button>
          <button class="btn btn-success" type="button" data-action="submit-simulation">Nộp bài mô phỏng</button>
        </div>
        <div class="small text-muted">
          Cửa sổ tính điểm: ${clip.trigger_start_sec}s - ${clip.trigger_end_sec}s<br>
          Đã ghi nhận: ${state.simulationAnswers[clip.id] ?? "Chưa bấm"}
        </div>
      </div>
      <div class="simulation-player-side">
        ${clips
          .map(
            (item, index) => `
          <button class="simulation-clip-item ${index === state.simulationClipIndex ? "is-active" : ""}" type="button" data-action="jump-simulation" data-clip-index="${index}">
            <div class="fw-semibold">${escapeHtml(item.title)}</div>
            <div class="small text-muted">Bấm từ ${item.trigger_start_sec}s đến ${item.trigger_end_sec}s</div>
            <div class="small mt-1">${state.simulationAnswers[item.id] !== undefined ? `Đã bấm: ${state.simulationAnswers[item.id]}s` : "Chưa bấm"}</div>
          </button>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}
