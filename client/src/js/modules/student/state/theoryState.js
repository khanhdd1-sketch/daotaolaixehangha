/**
 * Tạo state ban đầu cho trang thi lý thuyết.
 * @returns {object}
 */
function createInitialState() {
  return {
    currentUser: null,
    loading: true,
    theoryWorkspace: { student: null, exams: [], results: [] },
    activeTheoryExam: null,
    theoryTimer: { intervalId: null, endsAt: 0 }
  };
}

let state = createInitialState();

/**
 * Lấy state trang thi lý thuyết.
 * @returns {object}
 */
export function getTheoryState() {
  return state;
}

/**
 * Cập nhật một phần state lý thuyết.
 * @param {object} partial - Trường cần ghi
 * @returns {object}
 * @sideeffects Cập nhật state trong bộ nhớ
 */
export function patchTheoryState(partial) {
  state = { ...state, ...partial };
  return state;
}

/**
 * Reset state lý thuyết.
 * @returns {object}
 */
export function resetTheoryState() {
  state = createInitialState();
  return state;
}
