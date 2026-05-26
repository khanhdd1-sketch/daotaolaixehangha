import { getAdminState } from "../state/adminState.js";
import { buildChartOptions, buildFilterBadge, upsertChart } from "../utils/adminFormUtils.js";

/**
 * Render thống kê tổng quan và badge bộ lọc.
 * @param {string} fromDate - Giá trị input filterDate
 * @param {string} course - Giá trị filterCourse
 */
export function renderDashboardStats(fromDate, course) {
  const { dashboard } = getAdminState();
  const stats = dashboard?.stats || {};
  document.getElementById("statVisits").textContent = stats.totalVisits || 0;
  document.getElementById("statRegistrations").textContent = stats.totalRegistrations || 0;
  document.getElementById("statStudents").textContent = stats.totalStudents || 0;
  document.getElementById("statPassed").textContent = stats.passedCount || 0;
  document.getElementById("statFailed").textContent = stats.failedCount || 0;
  document.getElementById("dashboardFilterBadge").textContent = buildFilterBadge(fromDate, course);
}

/**
 * Vẽ biểu đồ tổng quan và kênh kết quả.
 */
export function renderAdminCharts() {
  const adminState = getAdminState();
  const stats = adminState.dashboard?.stats || {};

  upsertChart("overview", "adminOverviewChart", {
    type: "bar",
    data: {
      labels: ["Lượt truy cập", "Lead", "Học viên", "Đạt", "Chưa đạt"],
      datasets: [
        {
          label: "Số lượng",
          data: [
            Number(stats.totalVisits || 0),
            Number(stats.totalRegistrations || 0),
            Number(stats.totalStudents || 0),
            Number(stats.passedCount || 0),
            Number(stats.failedCount || 0)
          ],
          backgroundColor: ["#0d47a1", "#ef6c00", "#039be5", "#2e7d32", "#c62828"],
          borderRadius: 12,
          maxBarThickness: 52
        }
      ]
    },
    options: buildChartOptions({ plugins: { legend: { display: false } } })
  });

  upsertChart("channels", "adminChannelChart", {
    type: "doughnut",
    data: {
      labels: ["Lý thuyết nội bộ", "Mô phỏng", "3rd-party"],
      datasets: [
        {
          data: [
            adminState.examResults.length,
            adminState.simulationAttempts.length,
            adminState.thirdPartyAttempts.length
          ],
          backgroundColor: ["#0d47a1", "#ef6c00", "#00897b"],
          hoverOffset: 8
        }
      ]
    },
    options: buildChartOptions()
  });
}
