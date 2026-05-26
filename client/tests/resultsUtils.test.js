import { filterResultRows, mergeResultRows } from "../src/js/modules/admin/utils/resultsUtils.js";

describe("mergeResultRows", () => {
  it("gan nhan nguon cho ly thuyet va mo phong", () => {
    const merged = mergeResultRows({
      examResults: [{ exam_id: "e1", exam_title: "De A", student_name: "An", score: 20, passed: true }],
      simulationAttempts: [{ exam_id: "s1", exam_title: "Sim A", student_name: "Binh", score: 10, passed: false }],
      thirdPartyAttempts: [{ exam_type: "LT", platform_name: "Web", student_name: "Chi", passed: true }],
      exams: [{ id: "e1", course_type: "B2" }],
      simulationExams: [{ id: "s1", course_type: "B2" }]
    });

    expect(merged).toHaveLength(3);
    expect(merged[0].source_type).toBe("theory");
    expect(merged[0].course_type).toBe("B2");
    expect(merged[1].source_type).toBe("simulation");
    expect(merged[2].source_type).toBe("third_party");
  });
});

describe("filterResultRows", () => {
  const rows = [
    { student_name: "An", course_type: "B2", source_type: "theory", passed: true, submitted_at: "2026-01-02" },
    { student_name: "Binh", course_type: "A1", source_type: "simulation", passed: false, submitted_at: "2026-01-03" }
  ];

  it("loc theo trang thai dat", () => {
    const filtered = filterResultRows(rows, { status: "passed" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].student_name).toBe("An");
  });

  it("sap xep moi nhat truoc", () => {
    const filtered = filterResultRows(rows, {});
    expect(filtered[0].student_name).toBe("Binh");
  });
});
