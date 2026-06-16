
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hiếu Khánh)
 *
 * All rights reserved.
 */
/**
 * Gộp và lọc kết quả thi cho admin (đồng bộ logic client resultsUtils).
 */

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .trim();
}

function matchesSearch(values, normalizedSearch) {
  if (!normalizedSearch) return true;
  return values.some((value) => normalizeText(value).includes(normalizedSearch));
}

/**
 * @param {object} params
 * @returns {Array<object>}
 */
function mergeResultRows({
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
 * @param {Array<object>} rows
 * @param {object} filters
 * @returns {Array<object>}
 */
function filterResultRows(rows, { search = "", course = "", type = "", status = "" }) {
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

module.exports = {
  mergeResultRows,
  filterResultRows
};
