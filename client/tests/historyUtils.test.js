import { buildHistoryRows, filterHistoryRows } from "../src/js/modules/shared/historyUtils.js";

describe("historyUtils", () => {
  const rows = buildHistoryRows(
    {
      theoryResults: [{ id: "r1", exam_id: "e1", score: 80, passed: true, submitted_at: "2026-01-02" }],
      simulationAttempts: [],
      thirdPartyAttempts: []
    },
    { findTheoryTitle: () => "De A" }
  );

  it("buildHistoryRows gan nhan nguon theory", () => {
    expect(rows[0].source_type).toBe("theory");
    expect(rows[0].display_name).toBe("De A");
  });

  it("filterHistoryRows loc theo trang thai", () => {
    const filtered = filterHistoryRows(rows, { searchTerm: "", typeFilter: "", statusFilter: "passed" });
    expect(filtered).toHaveLength(1);
  });
});
