import { test, expect } from "@playwright/test";
import { E2E_STUDENT } from "./fixtures/credentials.js";
import { loginViaUi } from "./helpers/auth.js";

test.describe("Student smoke flow", () => {
  test("login → dashboard → theory exam page", async ({ page }) => {
    await loginViaUi(page, E2E_STUDENT);
    await page.waitForURL(/exam\.html/);
    await expect(page.locator("#dashboardContentShell")).toBeVisible({ timeout: 15_000 });

    await page.goto("/theory-exam.html");
    await expect(page.locator("main")).toBeVisible();

    const startButton = page.getByRole("button", { name: /bắt đầu|thi|làm bài/i }).first();
    if (await startButton.isVisible().catch(() => false)) {
      await startButton.click();
    }

    await expect(page).toHaveURL(/theory-exam\.html/);
  });
});
