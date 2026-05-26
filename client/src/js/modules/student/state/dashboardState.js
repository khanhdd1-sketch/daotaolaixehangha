/**
 * Tạo trạng thái ban đầu cho dashboard học viên.
 * @returns {object} State object
 */
function createInitialState() {
  return {
    currentUser: null,
    loading: true,
    error: null,
    theoryWorkspace: { student: null, exams: [], results: [] },
    learningWorkspace: { lessons: [], completed_count: 0, total_count: 0 },
    simulationWorkspace: { exam: null, clips: [], attempts: [] },
    thirdPartyWorkspace: { links: {}, attempts: [], student: null },
    charts: { progress: null, status: null }
  };
}

let state = createInitialState();

/**
 * Lấy state dashboard hiện tại (singleton trong phiên trang).
 * @returns {object} State dashboard
 */
export function getDashboardState() {
  return state;
}

/**
 * Ghi đè một phần state dashboard.
 * @param {object} partial - Các trường cần cập nhật
 * @returns {object} State sau khi patch
 * @sideeffects Cập nhật state trong bộ nhớ
 */
export function patchDashboardState(partial) {
  state = { ...state, ...partial };
  return state;
}

/**
 * Reset state khi đăng xuất hoặc tải lại trang.
 * @returns {object} State mới
 * @sideeffects Thay thế toàn bộ state
 */
export function resetDashboardState() {
  state = createInitialState();
  return state;
}

/**
 * Lấy thông tin học viên từ workspace đã tải.
 * @returns {object} Hồ sơ học viên
 */
export function getStudentProfile() {
  const { theoryWorkspace, thirdPartyWorkspace, currentUser } = state;
  return theoryWorkspace.student || thirdPartyWorkspace.student || currentUser || {};
}
