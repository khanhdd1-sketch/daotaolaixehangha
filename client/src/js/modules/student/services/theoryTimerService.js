import { getTheoryState, patchTheoryState } from "../state/theoryState.js";

/**
 * Bắt đầu đếm ngược thời gian làm bài lý thuyết.
 * @param {number} durationMinutes - Số phút làm bài
 * @param {() => void} onExpire - Callback khi hết giờ (thường auto submit)
 * @sideeffects Tạo setInterval, cập nhật badge timer trên DOM
 */
export function startTheoryTimer(durationMinutes, onExpire) {
  stopTheoryTimer();
  const endsAt = Date.now() + durationMinutes * 60 * 1000;
  patchTheoryState({
    theoryTimer: {
      endsAt,
      intervalId: globalThis.setInterval(() => updateTheoryTimerBadge(onExpire), 1000)
    }
  });
  updateTheoryTimerBadge(onExpire);
}

/**
 * Dừng timer lý thuyết.
 * @sideeffects clearInterval nếu đang chạy
 */
export function stopTheoryTimer() {
  const { theoryTimer } = getTheoryState();
  if (theoryTimer?.intervalId) {
    globalThis.clearInterval(theoryTimer.intervalId);
  }
  patchTheoryState({ theoryTimer: { intervalId: null, endsAt: 0 } });
}

/**
 * Cập nhật badge thời gian còn lại.
 * @param {() => void} onExpire - Gọi khi hết giờ
 * @sideeffects Ghi text vào #theoryTimerBadge, có thể trigger submit
 */
function updateTheoryTimerBadge(onExpire) {
  const badge = document.getElementById("theoryTimerBadge");
  const { theoryTimer } = getTheoryState();
  const remaining = Math.max(0, (theoryTimer?.endsAt || 0) - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  if (badge) badge.textContent = `${minutes}:${seconds}`;
  if (remaining <= 0) {
    stopTheoryTimer();
    onExpire?.();
  }
}
