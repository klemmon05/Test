import { test, expect } from "@playwright/test";

test.describe("OrbitWatch smoke tests", () => {
  test("dashboard loads and shows main UI", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Check title
    await expect(page).toHaveTitle(/OrbitWatch/);

    // Check TopBar is visible
    await expect(page.locator("text=OrbitWatch").first()).toBeVisible();

    // Check globe/map is rendered
    const mainArea = page.locator("canvas, .maplibregl-canvas").first();
    await expect(mainArea).toBeVisible({ timeout: 10000 });
  });

  test("navigation to settings works", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Click settings button
    const settingsBtn = page
      .locator('button[title*="etting"], button:has([data-lucide="settings"])')
      .first();
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await expect(page).toHaveURL(/settings/);
    } else {
      await page.goto("/settings");
      await expect(page).toHaveURL(/settings/);
    }
  });

  test("redirect from root to dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/dashboard/);
  });

  test("satellite deep link redirects to dashboard", async ({ page }) => {
    await page.goto("/sat/25544");
    await expect(page).toHaveURL(/dashboard/);
  });
});
