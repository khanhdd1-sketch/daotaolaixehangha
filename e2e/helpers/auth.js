/**
 * Đăng nhập qua UI login.html.
 * @param {import('@playwright/test').Page} page
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<void>}
 */
export async function loginViaUi(page, credentials) {
  await page.goto("/login.html");
  await page.fill("#email", credentials.email);
  await page.fill("#password", credentials.password);
  await page.click("button[type='submit']");
  await page.waitForURL(/exam\.html|admin\.html/);
}
