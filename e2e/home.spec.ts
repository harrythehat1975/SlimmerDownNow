import { test, expect } from "@playwright/test";

test("Landing page loads", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await expect(page).toHaveTitle(/Slim Down Now/);
  await expect(page.locator("h1")).toContainText("Slim Down Now");
});

test("Can navigate to signup", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.click('a:has-text("Get Started Free")');
  // Should redirect to signup (uncomment when signup page is built)
  // await expect(page).toHaveURL(/\/signup/);
});

test("Can navigate to login", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.click('a:has-text("Sign In")');
  // Should redirect to login (uncomment when login page is built)
  // await expect(page).toHaveURL(/\/login/);
});
