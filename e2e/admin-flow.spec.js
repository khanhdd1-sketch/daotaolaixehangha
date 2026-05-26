import { test, expect } from "@playwright/test";
import { E2E_ADMIN } from "./fixtures/credentials.js";
import { loginViaUi } from "./helpers/auth.js";

test.describe("Admin smoke flow", () => {
  test("login → create student → create theory question → view results", async ({ page }) => {
    await loginViaUi(page, E2E_ADMIN);
    await page.waitForURL(/admin\.html/);

    await page.goto("/admin-students.html");
    await expect(page.locator("#createStudentForm")).toBeVisible();

    const unique = Date.now();
    await page.fill("#studentName", `HV E2E ${unique}`);
    await page.fill("#studentEmail", `e2e.${unique}@test.local`);
    await page.fill("#studentPassword", "Student@12345!");
    await page.selectOption("#studentCourseType", "B2");
    await page.click("#createStudentForm button[type='submit']");

    await expect(page.locator("#studentTable")).toContainText(`e2e.${unique}@test.local`, {
      timeout: 15_000
    });

    await page.goto("/admin-theory.html");
    await expect(page.locator("#questionForm")).toBeVisible();

    const examSelect = page.locator("#questionExamId");
    await expect(examSelect).toBeVisible();
    const firstExamValue = await examSelect.locator("option").nth(1).getAttribute("value");
    if (!firstExamValue) {
      test.skip(true, "Chưa có đề lý thuyết trong mock data");
    }
    await examSelect.selectOption(firstExamValue);

    await page.fill("#questionText", `Câu E2E ${unique}?`);
    await page.fill("#questionOptionA", "Đáp án A");
    await page.fill("#questionOptionB", "Đáp án B");
    await page.fill("#questionOptionC", "Đáp án C");
    await page.fill("#questionOptionD", "Đáp án D");
    await page.selectOption("#questionCorrectAnswer", "A");
    await page.click("#questionForm button[type='submit']");

    await expect(page.locator("#questionTable")).toContainText(`Câu E2E ${unique}`, {
      timeout: 15_000
    });

    await page.goto("/admin-results.html");
    await expect(page.locator("#resultTable")).toBeVisible();
    await expect(page.locator("#resultPaginationBar")).toBeVisible();
  });
});
