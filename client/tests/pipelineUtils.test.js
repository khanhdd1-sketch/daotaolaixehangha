import { resolveNextAction } from "../src/js/modules/student/pipelineUtils.js";

describe("resolveNextAction", () => {
  it("uu tien hoc bai khi con bai chua xong", () => {
    const action = resolveNextAction({
      completedLessons: 1,
      totalLessons: 5,
      theoryPassedCount: 0,
      theoryExamCount: 3
    });
    expect(action.stage).toBe("learn");
    expect(action.ctaHref).toBe("#section-learn");
  });

  it("huong luyen ly thuyet khi da hoc xong nhung chua dat de", () => {
    const action = resolveNextAction({
      completedLessons: 5,
      totalLessons: 5,
      theoryPassedCount: 0,
      theoryExamCount: 2
    });
    expect(action.stage).toBe("practice");
    expect(action.ctaHref).toBe("/theory-exam.html");
  });

  it("huong thi mo phong khi da dat ly thuyet nhung chua thi MP", () => {
    const action = resolveNextAction({
      completedLessons: 5,
      totalLessons: 5,
      theoryPassedCount: 1,
      theoryExamCount: 2,
      simulationAttempts: 0,
      hasSimulation: true
    });
    expect(action.stage).toBe("test");
    expect(action.ctaHref).toBe("/simulation-exam.html");
  });
});
