import { PAGE_ROUTES } from "../../constants/routes.js";

/**
 * Xác định hành động tiếp theo trong pipeline học → luyện → thi → kết quả.
 * @param {object} ctx - Ngữ cảnh tiến độ học viên
 * @param {number} ctx.completedLessons - Số bài đã hoàn thành
 * @param {number} ctx.totalLessons - Tổng số bài
 * @param {number} ctx.theoryPassedCount - Số đề lý thuyết đã đạt
 * @param {number} ctx.theoryExamCount - Tổng đề lý thuyết khả dụng
 * @param {number} ctx.simulationAttempts - Số lần thi mô phỏng
 * @param {boolean} ctx.hasSimulation - Có bài mô phỏng hay không
 * @returns {{ stage: string, title: string, description: string, ctaLabel: string, ctaHref: string, icon: string }}
 */
export function resolveNextAction(ctx) {
  const {
    completedLessons = 0,
    totalLessons = 0,
    theoryPassedCount = 0,
    theoryExamCount = 0,
    simulationAttempts = 0,
    hasSimulation = false
  } = ctx;

  const lessonsRemaining = Math.max(0, totalLessons - completedLessons);
  const hasLessons = totalLessons > 0;

  if (hasLessons && lessonsRemaining > 0) {
    return {
      stage: "learn",
      title: "Hoàn thành bài học trước",
      description: `Bạn còn ${lessonsRemaining} bài cần ôn trước khi thi sát hạch. Ưu tiên nắm kiến thức nền tảng.`,
      ctaLabel: "Xem bài học",
      ctaHref: "#section-learn",
      icon: "fa-book-open"
    };
  }

  if (theoryExamCount > 0 && theoryPassedCount < 1) {
    return {
      stage: "practice",
      title: "Luyện đề lý thuyết",
      description: "Làm ít nhất một đề thi thử nội bộ để quen format và biết điểm yếu.",
      ctaLabel: "Vào thi lý thuyết",
      ctaHref: PAGE_ROUTES.THEORY_EXAM,
      icon: "fa-file-circle-check"
    };
  }

  if (hasSimulation && simulationAttempts < 1) {
    return {
      stage: "test",
      title: "Thi thử mô phỏng",
      description: "Ghi nhận thời điểm nguy hiểm trên video để luyện phản xạ trước khi thi thật.",
      ctaLabel: "Vào thi mô phỏng",
      ctaHref: PAGE_ROUTES.SIMULATION_EXAM,
      icon: "fa-road"
    };
  }

  return {
    stage: "results",
    title: "Xem lại kết quả",
    description: "Tiếp tục luyện tập hoặc xem lịch sử điểm để cải thiện từng lần thi.",
    ctaLabel: "Xem lịch sử",
    ctaHref: "#section-history",
    icon: "fa-chart-line"
  };
}
