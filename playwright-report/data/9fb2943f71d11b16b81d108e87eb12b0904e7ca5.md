# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase1-auth-onboarding.spec.ts >> Phase 1: Authentication & Onboarding Flow >> should complete full signup, login, and onboarding flow
- Location: e2e/phase1-auth-onboarding.spec.ts:7:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="email"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "Sign Up" [level=1] [ref=e4]
    - paragraph [ref=e5]: Create an account to get started with personalized waist loss coaching
    - generic [ref=e6]:
      - generic [ref=e7]:
        - text: Email
        - textbox "Email" [ref=e8]:
          - /placeholder: you@example.com
      - generic [ref=e9]:
        - text: Password
        - textbox "Password" [ref=e10]:
          - /placeholder: At least 8 characters
      - generic [ref=e11]:
        - text: Confirm Password
        - textbox "Confirm Password" [ref=e12]:
          - /placeholder: Confirm your password
      - button "Sign Up" [ref=e13]
    - paragraph [ref=e14]:
      - text: Already have an account?
      - link "Log in" [ref=e15]:
        - /url: /login
  - alert [ref=e16]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Phase 1: Authentication & Onboarding Flow", () => {
  4   |   const testEmail = `test-${Date.now()}@example.com`;
  5   |   const testPassword = "TestPassword123!";
  6   | 
  7   |   test("should complete full signup, login, and onboarding flow", async ({
  8   |     page,
  9   |   }) => {
  10  |     // 1. Signup
  11  |     await page.goto("http://localhost:3000/signup");
  12  |     await expect(page.locator("h1")).toContainText("Sign Up");
  13  | 
> 14  |     await page.fill('input[name="email"]', testEmail);
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  15  |     await page.fill('input[name="password"]', testPassword);
  16  |     await page.fill('input[name="confirmPassword"]', testPassword);
  17  | 
  18  |     await page.click('button:has-text("Create Account")');
  19  |     await page.waitForURL("**/login?signup=success");
  20  | 
  21  |     // Verify success message appears
  22  |     await expect(page.locator("text=Account created successfully")).toBeVisible();
  23  | 
  24  |     // 2. Login
  25  |     await page.fill('input[name="email"]', testEmail);
  26  |     await page.fill('input[name="password"]', testPassword);
  27  |     await page.click('button:has-text("Log In")');
  28  | 
  29  |     // Should redirect to onboarding/step-1
  30  |     await page.waitForURL("**/onboarding/step-1");
  31  | 
  32  |     // 3. Onboarding Step 1 - Personal Info
  33  |     await expect(page.locator("h1")).toContainText("Personal Info");
  34  |     await page.fill('input[name="firstName"]', "John");
  35  |     await page.fill('input[name="lastName"]', "Doe");
  36  |     await page.selectOption('select[name="sex"]', "M");
  37  |     await page.click('button:has-text("Next")');
  38  | 
  39  |     // 4. Onboarding Step 2 - Measurements
  40  |     await page.waitForURL("**/onboarding/step-2");
  41  |     await expect(page.locator("h1")).toContainText("Measurements");
  42  |     await page.fill('input[name="heightCm"]', "175");
  43  |     await page.fill('input[name="weightKg"]', "85");
  44  |     await page.fill('input[name="waistCm"]', "95");
  45  |     await page.fill('input[name="ageYears"]', "35");
  46  |     await page.click('button:has-text("Next")');
  47  | 
  48  |     // 5. Onboarding Step 3 - Lifestyle
  49  |     await page.waitForURL("**/onboarding/step-3");
  50  |     await expect(page.locator("h1")).toContainText("Lifestyle");
  51  |     await page.selectOption('select[name="activityLevel"]', "moderate");
  52  |     await page.selectOption('select[name="dietaryStyle"]', "omnivore");
  53  |     await page.click('button:has-text("Next")');
  54  | 
  55  |     // 6. Onboarding Step 4 - Goals
  56  |     await page.waitForURL("**/onboarding/step-4");
  57  |     await expect(page.locator("h1")).toContainText("Goals");
  58  |     await page.fill('input[name="waistLossGoalCm"]', "10");
  59  |     await page.fill('input[name="timelineDays"]', "90");
  60  |     await page.click('button:has-text("Next")');
  61  | 
  62  |     // 7. Onboarding Step 5 - Preferences
  63  |     await page.waitForURL("**/onboarding/step-5");
  64  |     await expect(page.locator("h1")).toContainText("Preferences");
  65  |     await page.fill('input[name="preferredCheckInTime"]', "08:00");
  66  |     await page.click('input[name="enableNotifications"]'); // toggle on
  67  |     await page.click('button:has-text("Complete Onboarding")');
  68  | 
  69  |     // 8. Should redirect to dashboard
  70  |     await page.waitForURL("**/dashboard");
  71  |     await expect(page.locator("h1")).toContainText("Welcome back, John");
  72  | 
  73  |     // Verify dashboard content loads
  74  |     await expect(page.locator("text=Calories")).toBeVisible();
  75  |     await expect(page.locator("text=Protein")).toBeVisible();
  76  |     await expect(page.locator("text=Steps")).toBeVisible();
  77  |   });
  78  | 
  79  |   test("should validate form inputs on each step", async ({ page }) => {
  80  |     await page.goto("http://localhost:3000/signup");
  81  | 
  82  |     // Try to submit without filling form
  83  |     await page.click('button:has-text("Create Account")');
  84  | 
  85  |     // Should show validation errors
  86  |     await expect(
  87  |       page.locator("text=Email must be a valid email address")
  88  |     ).toBeVisible();
  89  |   });
  90  | 
  91  |   test("should prevent duplicate signup", async ({ page }) => {
  92  |     const email = `duplicate-${Date.now()}@example.com`;
  93  | 
  94  |     // First signup
  95  |     await page.goto("http://localhost:3000/signup");
  96  |     await page.fill('input[name="email"]', email);
  97  |     await page.fill('input[name="password"]', "TestPassword123!");
  98  |     await page.fill('input[name="confirmPassword"]', "TestPassword123!");
  99  |     await page.click('button:has-text("Create Account")');
  100 |     await page.waitForURL("**/login?signup=success");
  101 | 
  102 |     // Try to signup again with same email
  103 |     await page.goto("http://localhost:3000/signup");
  104 |     await page.fill('input[name="email"]', email);
  105 |     await page.fill('input[name="password"]', "TestPassword123!");
  106 |     await page.fill('input[name="confirmPassword"]', "TestPassword123!");
  107 |     await page.click('button:has-text("Create Account")');
  108 | 
  109 |     // Should show error
  110 |     await expect(page.locator("text=Email already registered")).toBeVisible();
  111 |   });
  112 | });
  113 | 
```