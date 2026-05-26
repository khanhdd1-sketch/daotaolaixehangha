/**

 * Tạo trạng thái ban đầu cho dashboard admin.

 * @returns {object} State object

 */

function createInitialState() {

  return {

    currentUser: null,

    dashboard: null,

    students: [],

    registrations: [],

    exams: [],

    questions: [],

    simulationExams: [],

    simulationClips: [],

    lessons: [],

    lessonQuestions: [],

    examResults: [],

    simulationAttempts: [],

    thirdPartyAttempts: [],

    filteredResults: [],
    paginatedResults: [],
    resultsPagination: { page: 1, limit: 20, total: 0, totalPages: 1 },

    activeSection: "overview",
    activePageId: "overview",

    charts: { overview: null, channels: null },

    proofPreviewModal: null,

    questionImageObjectUrl: ""

  };

}



let state = createInitialState();



/**

 * Lấy state admin hiện tại (singleton trong phiên trang).

 * @returns {object} State admin

 */

export function getAdminState() {

  return state;

}



/**

 * Ghi đè một phần state admin.

 * @param {object} partial - Các trường cần cập nhật

 * @returns {object} State sau khi patch

 * @sideeffects Cập nhật state trong bộ nhớ

 */

export function patchAdminState(partial) {

  state = { ...state, ...partial };

  return state;

}



/**

 * Reset state admin.

 * @returns {object} State mới

 * @sideeffects Thay thế toàn bộ state

 */

export function resetAdminState() {

  state = createInitialState();

  return state;

}


