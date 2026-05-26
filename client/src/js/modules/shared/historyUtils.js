import { matchesSearch, normalizeText } from "./textUtils.js";

/**
 * @typedef {object} HistorySourceRow
 * @property {string} [id]
 * @property {string} [exam_id]
 * @property {string} [exam_type]
 * @property {string} [platform_name]
 * @property {string} [note]
 * @property {boolean} [passed]
 * @property {string} [submitted_at]
 */

/**
 * @typedef {object} HistorySources
 * @property {HistorySourceRow[]} [theoryResults]
 * @property {HistorySourceRow[]} [simulationAttempts]
 * @property {HistorySourceRow[]} [thirdPartyAttempts]
 */

/**
 * @typedef {object} HistoryMeta
 * @property {(examId: string) => string} [findTheoryTitle]
 * @property {string} [simulationExamTitle]
 */

/**
 * @typedef {HistorySourceRow & { source_type?: string, source_label?: string, display_name?: string, action_url?: string }} UnifiedHistoryRow
 */

/**
 * @typedef {object} HistoryFilters
 * @property {string} [searchTerm]
 * @property {string} [typeFilter]
 * @property {string} [statusFilter]
 */

/**
 * Gộp lịch sử từ nhiều nguồn (lý thuyết, mô phỏng, 3rd-party).
 * @param {HistorySources} sources - Đối tượng chứa theoryResults, simulationAttempts, thirdPartyAttempts
 * @param {HistoryMeta} [meta] - Thông tin bổ sung
 * @returns {UnifiedHistoryRow[]} Danh sách hàng lịch sử thống nhất
 */
export function buildHistoryRows(sources, meta = {}) {
  const { theoryResults = [], simulationAttempts = [], thirdPartyAttempts = [] } = sources;
  const { findTheoryTitle = (/** @type {string} */ id) => id, simulationExamTitle = "" } = meta;

  const theoryRows = theoryResults.map((/** @type {HistorySourceRow} */ item) => ({
    ...item,
    source_type: "theory",
    source_label: "Lý thuyết nội bộ",
    display_name: findTheoryTitle(String(item.exam_id || "")),
    action_url: globalThis.DriveSchoolCommon?.withLangUrl(`/result.html?id=${item.id}`)
  }));

  const simulationRows = simulationAttempts.map((/** @type {HistorySourceRow} */ item) => ({
    ...item,
    source_type: "simulation",
    source_label: "Mô phỏng",
    display_name: simulationExamTitle || item.exam_id
  }));

  const thirdPartyRows = thirdPartyAttempts.map((/** @type {HistorySourceRow} */ item) => ({
    ...item,
    source_type: "third_party",
    source_label: "3rd-party",
    display_name: `${item.exam_type || "-"} | ${item.platform_name || "-"}`
  }));

  return [...theoryRows, ...simulationRows, ...thirdPartyRows];
}

/**
 * Lọc và sắp xếp lịch sử theo bộ lọc UI.
 * @param {UnifiedHistoryRow[]} rows - Hàng lịch sử đã gộp
 * @param {HistoryFilters} filters - searchTerm, typeFilter, statusFilter
 * @returns {UnifiedHistoryRow[]} Danh sách đã lọc, mới nhất trước
 */
export function filterHistoryRows(rows, filters) {
  const searchTerm = normalizeText(filters.searchTerm);
  const { typeFilter = "", statusFilter = "" } = filters;

  return rows
    .filter((item) => {
      const matchesType = !typeFilter || item.source_type === typeFilter;
      const matchesStatus = !statusFilter || (item.passed ? "passed" : "failed") === statusFilter;
      const matchesKeyword = matchesSearch(
        [item.display_name, item.note, item.platform_name, item.exam_type],
        searchTerm
      );
      return matchesType && matchesStatus && matchesKeyword;
    })
    .sort(
      (left, right) =>
        new Date(String(right.submitted_at || 0)).getTime() -
        new Date(String(left.submitted_at || 0)).getTime()
    );
}

/**
 * Xây dựng chuỗi lịch sử thống nhất cho biểu đồ tiến độ.
 * @param {HistorySources} sources
 * @returns {UnifiedHistoryRow[]}
 */
export function buildUnifiedChartHistory(sources) {
  const { theoryResults = [], simulationAttempts = [], thirdPartyAttempts = [] } = sources;
  return [
    ...theoryResults.map((/** @type {HistorySourceRow} */ item) => ({ ...item, source_label: "LT" })),
    ...simulationAttempts.map((/** @type {HistorySourceRow} */ item) => ({ ...item, source_label: "MP" })),
    ...thirdPartyAttempts.map((/** @type {HistorySourceRow} */ item) => ({ ...item, source_label: "TP" }))
  ].sort(
    (left, right) =>
      new Date(String(left.submitted_at || 0)).getTime() -
      new Date(String(right.submitted_at || 0)).getTime()
  );
}
