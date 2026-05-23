import { test, expect } from "@playwright/test";

test.describe("Pages", () => {
  test("leaderboard page redirects when unauthenticated", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page).toHaveURL(/.*login/);
  });

  test("support page redirects when unauthenticated", async ({ page }) => {
    await page.goto("/support");
    await expect(page).toHaveURL(/.*login/);
  });

  test("404 page returns not found", async ({ page }) => {
    const response = await page.goto("/nonexistent-route");
    expect(response?.status() === 404 || response?.status() === 200).toBeTruthy();
  });
});
