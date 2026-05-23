import { test, expect } from "@playwright/test";

const PROTECTED_PAGES = [
  "/dashboard",
  "/habits",
  "/analytics",
  "/ai-chat",
  "/pomodoro",
  "/settings",
  "/templates",
  "/achievements",
  "/billing",
  "/profile",
  "/admin",
];

const PUBLIC_PAGES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
];

test.describe("Navigation Guards", () => {
  PROTECTED_PAGES.forEach((path) => {
    test(`redirects unauthenticated users from ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/.*login/);
    });
  });

  PUBLIC_PAGES.forEach((path) => {
    test(`allows unauthenticated access to ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain(path);
    });
  });
});

test.describe("Landing Page", () => {
  test("renders hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).not.toBeEmpty();
  });

  test("has login link", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
  });

  test("has register link or CTA", async ({ page }) => {
    await page.goto("/");
    const registerLink = page.locator('a[href="/register"]');
    await expect(registerLink).toBeVisible();
  });
});

test.describe("Auth Pages", () => {
  test("login page has all form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("register page has name, email, password fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("forgot password page has email field", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe("API Health", () => {
  test("health endpoint works", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
  });

  test("unauthenticated API calls return 401", async ({ request }) => {
    const response = await request.get("/api/habits");
    expect(response.status()).toBe(401);
  });
});

test.describe("Public Pages", () => {
  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("terms page loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("h1")).toBeVisible();
  });
});
