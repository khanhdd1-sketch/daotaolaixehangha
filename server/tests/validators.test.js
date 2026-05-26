
/**
 * Unit tests cho validators backend.
 */
const {
  isValidEmail,
  isStrongPassword,
  isValidCourseType,
  clampString
} = require("../src/utils/validators");

describe("validators", () => {
  it("validates email format", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
  });

  it("requires strong password rules", () => {
    expect(isStrongPassword("Weak1!")).toBe(false);
    expect(isStrongPassword("Str0ng!Pass")).toBe(true);
  });

  it("accepts known course types", () => {
    expect(isValidCourseType("b2")).toBe(true);
    expect(isValidCourseType("INVALID")).toBe(false);
  });

  it("clamps string length", () => {
    expect(clampString("  hello world  ", 5)).toBe("hello");
  });
});
