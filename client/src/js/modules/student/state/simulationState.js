/**
 * Tạo state ban đầu cho trang thi mô phỏng.
 * @returns {object}
 */
function createInitialState() {
  return {
    currentUser: null,
    loading: true,
    simulationWorkspace: { exam: null, clips: [], attempts: [] },
    simulationAnswers: {},
    simulationClipIndex: 0
  };
}

let state = createInitialState();

/**
 * Lấy state trang mô phỏng.
 * @returns {object}
 */
export function getSimulationState() {
  return state;
}

/**
 * Cập nhật một phần state mô phỏng.
 * @param {object} partial - Trường cần ghi
 * @returns {object}
 * @sideeffects Cập nhật state trong bộ nhớ
 */
export function patchSimulationState(partial) {
  state = { ...state, ...partial };
  return state;
}

/**
 * Reset state mô phỏng.
 * @returns {object}
 */
export function resetSimulationState() {
  state = createInitialState();
  return state;
}
