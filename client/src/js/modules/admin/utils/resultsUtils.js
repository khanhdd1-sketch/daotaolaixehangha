import { matchesSearch, normalizeText } from "../../shared/textUtils.js";

/**
 * Gộp kết quả lý thuyết, mô phỏng và 3rd-party thành một danh sách thống nhất.
 * @param {object} params - Nguồn dữ liệu và metadata đề thi
 * @param {Array} params.examResults - Kết quả thi lý thuyết
 * @param {Array} params.simulationAttempts - Lượt thi mô phỏng
 * @param {Array} params.thirdPartyAttempts - Kết quả 3rd-party
 * @param {Array} params.exams - Danh sách đề lý thuyết (tra course_type)
 * @param {Array} params.simulationExams - Danh sách đề mô phỏng
 * @returns {Array<object>} Danh sách đã gắn nhãn nguồn
 */
export function mergeResultRows({
  examResults = [],
  simulationAttempts = [],
  thirdPartyAttempts = [],
  exams = [],
  simulationExams = []
}) {
  const resolveCourseByExam = (examId) =>
    exams.find((item) => item.id === examId)?.course_type || "";
  const resolveCourseBySim = (examId) =>
    simulationExams.find((item) => item.id === examId)?.course_type || "";

  return [
    ...examResults.map((item) => ({
      ...item,
      source_type: "theory",
      source_label: "Lý thuyết nội bộ",
      display_name: item.exam_title || item.exam_id,
      course_type: resolveCourseByExam(item.exam_id)
    })),
    ...simulationAttempts.map((item) => ({
      ...item,
      source_type: "simulation",
      source_label: "Mô phỏng",
      display_name: item.exam_title || item.exam_id,
      course_type: resolveCourseBySim(item.exam_id)
    })),
    ...thirdPartyAttempts.map((item) => ({
      ...item,
      source_type: "third_party",
      source_label: "3rd-party",
      display_name: `${item.exam_type || "-"} | ${item.platform_name || "-"}`,
      attempt_no: item.attempt_no || 1
    }))
  ];
}

/**
 * Lọc danh sách kết quả theo từ khóa, loại bằng, kênh và trạng thái.
 * @param {Array<object>} rows - Hàng đã merge
 * @param {object} filters - Bộ lọc UI
 * @param {string} filters.search - Từ khóa (chưa normalize)
 * @param {string} filters.course - Loại bằng
 * @param {string} filters.type - theory | simulation | third_party
 * @param {string} filters.status - passed | failed
 * @returns {Array<object>} Đã sắp xếp mới nhất trước
 */
export function filterResultRows(rows, { search = "", course = "", type = "", status = "" }) {
  const normalizedSearch = normalizeText(search);
  return rows
    .filter((item) => {
      const matchesCourse = !course || String(item.course_type || "") === course;
      const matchesType = !type || item.source_type === type;
      const matchesStatus = !status || (item.passed ? "passed" : "failed") === status;
      const matchesKeyword = matchesSearch(
        [item.student_name, item.display_name, item.platform_name, item.exam_type, item.course_type],
        normalizedSearch
      );
      return matchesCourse && matchesType && matchesStatus && matchesKeyword;
    })
    .sort((left, right) => new Date(right.submitted_at || 0) - new Date(left.submitted_at || 0));
}
