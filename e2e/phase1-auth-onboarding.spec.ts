import { test, expect } from "@playwright/test";

test.describe("Phase 1: Authentication & Onboarding Flow", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";

  test("should complete full signup, login, and onboarding flow", async ({
    page,
  }) => {
    // 1. Signup
    await page.goto("http://localhost:3000/signup");
    await expect(page.locator("h1")).toContainText("Sign Up");

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);

    await page.click('button:has-text("Create Account")');
    await page.waitForURL("**/login?signup=success");

    // Verify success message appears
    await expect(page.locator("text=Account created successfully")).toBeVisible();

    // 2. Login
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button:has-text("Log In")');

    // Should redirect to onboarding/step-1
    await page.waitForURL("**/onboarding/step-1");

    // 3. Onboarding Step 1 - Personal Info
    await expect(page.locator("h1")).toContainText("Personal Info");
    await page.fill('input[name="firstName"]', "John");
    await page.fill('input[name="lastName"]', "Doe");
    await page.selectOption('select[name="sex"]', "M");
    await page.click('button:has-text("Next")');

    // 4. Onboarding Step 2 - Measurements
    await page.waitForURL("**/onboarding/step-2");
    await expect(page.locator("h1")).toContainText("Measurements");
    await page.fill('input[name="heightCm"]', "175");
    await page.fill('input[name="weightKg"]', "85");
    await page.fill('input[name="waistCm"]', "95");
    await page.fill('input[name="ageYears"]', "35");
    await page.click('button:has-text("Next")');

    // 5. Onboarding Step 3 - Lifestyle
    await page.waitForURL("**/onboarding/step-3");
    await expect(page.locator("h1")).toContainText("Lifestyle");
    await page.selectOption('select[name="activityLevel"]', "moderate");
    await page.selectOption('select[name="dietaryStyle"]', "omnivore");
    await page.click('button:has-text("Next")');

    // 6. Onboarding Step 4 - Goals
    await page.waitForURL("**/onboarding/step-4");
    await expect(page.locator("h1")).toContainText("Goals");
    await page.fill('input[name="waistLossGoalCm"]', "10");
    await page.fill('input[name="timelineDays"]', "90");
    await page.click('button:has-text("Next")');

    // 7. Onboarding Step 5 - Preferences
    await page.waitForURL("**/onboarding/step-5");
    await expect(page.locator("h1")).toContainText("Preferences");
    await page.fill('input[name="preferredCheckInTime"]', "08:00");
    await page.click('input[name="enableNotifications"]'); // toggle on
    await page.click('button:has-text("Complete Onboarding")');

    // 8. Should redirect to dashboard
    await page.waitForURL("**/dashboard");
    await expect(page.locator("h1")).toContainText("Welcome back, John");

    // Verify dashboard content loads
    await expect(page.locator("text=Calories")).toBeVisible();
    await expect(page.locator("text=Protein")).toBeVisible();
    await expect(page.locator("text=Steps")).toBeVisible();
  });

  test("should validate form inputs on each step", async ({ page }) => {
    await page.goto("http://localhost:3000/signup");

    // Try to submit without filling form
    await page.click('button:has-text("Create Account")');

    // Should show validation errors
    await expect(
      page.locator("text=Email must be a valid email address")
    ).toBeVisible();
  });

  test("should prevent duplicate signup", async ({ page }) => {
    const email = `duplicate-${Date.now()}@example.com`;

    // First signup
    await page.goto("http://localhost:3000/signup");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.fill('input[name="confirmPassword"]', "TestPassword123!");
    await page.click('button:has-text("Create Account")');
    await page.waitForURL("**/login?signup=success");

    // Try to signup again with same email
    await page.goto("http://localhost:3000/signup");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.fill('input[name="confirmPassword"]', "TestPassword123!");
    await page.click('button:has-text("Create Account")');

    // Should show error
    await expect(page.locator("text=Email already registered")).toBeVisible();
  });
});
