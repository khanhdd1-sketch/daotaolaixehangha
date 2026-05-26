import { API_PATHS } from "../src/js/constants/apiPaths.js";
import { ROLES } from "../src/js/constants/roles.js";
import { PAGE_ROUTES } from "../src/js/constants/routes.js";

describe("apiPaths constants", () => {
  it("builds encoded exam question URL", () => {
    expect(API_PATHS.EXAM_QUESTIONS("exam/1")).toBe("/api/exams/exam%2F1/questions");
  });

  it("builds simulation submit URL", () => {
    expect(API_PATHS.SIMULATION_SUBMIT("sim-9")).toBe("/api/simulation/sim-9/submit");
  });

  it("exposes stable auth paths", () => {
    expect(API_PATHS.AUTH_LOGIN).toBe("/api/auth/login");
    expect(API_PATHS.AUTH_ME).toBe("/api/auth/me");
  });
});

describe("roles and routes constants", () => {
  it("defines admin and student roles", () => {
    expect(ROLES.ADMIN).toBe("admin");
    expect(ROLES.STUDENT).toBe("student");
  });

  it("defines exam dashboard route", () => {
    expect(PAGE_ROUTES.EXAM_DASHBOARD).toBe("/exam.html");
  });
});
