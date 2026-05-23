import { test, expect } from "@playwright/test";

test.describe("Habits", () => {
  test("habits page redirects when unauthenticated", async ({ page }) => {
    await page.goto("/habits");
    await expect(page).toHaveURL(/.*login/);
  });

  test("dashboard page redirects when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*login/);
  });
});
