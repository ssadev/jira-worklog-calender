const { test, expect } = require("@playwright/test");
const { mockJiraAPIs, mockMyselfError } = require("./fixtures/test-helpers.cjs");
const { FAKE_CREDS } = require("./fixtures/mock-data.cjs");

test.describe("Settings Panel", () => {
  test("renders login form when no credentials stored", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=worklog")).toBeVisible();
    await expect(page.locator("text=calendar").first()).toBeVisible();
    await expect(
      page.locator("text=Connect your Jira account to get started")
    ).toBeVisible();
    await expect(
      page.locator('input[placeholder*="your-company"]')
    ).toBeVisible();
    await expect(
      page.locator('input[placeholder*="you@company.com"]')
    ).toBeVisible();
    await expect(
      page.locator('input[placeholder*="API token"]')
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Connect & Load Calendar")')
    ).toBeVisible();
  });

  test("shows error when submitting empty form", async ({ page }) => {
    await page.goto("/");
    // Clear any default domain value
    const domainInput = page.locator('input[placeholder*="your-company"]');
    await domainInput.fill("");
    await page.locator('button:has-text("Connect & Load Calendar")').click();
    await expect(
      page.locator("text=All fields are required.")
    ).toBeVisible();
  });

  test("shows connection error for invalid credentials", async ({ page }) => {
    await mockMyselfError(page, 400, "401 Unauthorized");
    await page.goto("/");

    await page.locator('input[placeholder*="your-company"]').fill("fake-company");
    await page.locator('input[placeholder*="you@company.com"]').fill("test@example.com");
    await page.locator('input[placeholder*="API token"]').fill("bad-token");

    await page.locator('button:has-text("Connect & Load Calendar")').click();

    // Button should show connecting state
    await expect(page.locator('button:has-text("Connecting")')).toBeVisible();

    // Error should appear
    await expect(page.locator("text=Connection failed")).toBeVisible();

    // Button returns to normal
    await expect(
      page.locator('button:has-text("Connect & Load Calendar")')
    ).toBeVisible();
  });

  test("successful connection transitions to calendar", async ({ page }) => {
    await mockJiraAPIs(page);
    await page.goto("/");

    await page
      .locator('input[placeholder*="your-company"]')
      .fill(FAKE_CREDS.domain);
    await page
      .locator('input[placeholder*="you@company.com"]')
      .fill(FAKE_CREDS.email);
    await page
      .locator('input[placeholder*="API token"]')
      .fill(FAKE_CREDS.token);
    await page.locator('button:has-text("Connect & Load Calendar")').click();

    // Should transition to calendar
    await expect(page.locator("text=QA Tester")).toBeVisible();
    await expect(page.locator('button:has-text("logout")')).toBeVisible();
  });

  test("API token help accordion toggles", async ({ page }) => {
    await page.goto("/");
    const helpBtn = page.locator(
      "text=Need help generating a Jira API token?"
    );
    await helpBtn.click();
    await expect(page.locator("text=id.atlassian.com")).toBeVisible();
    // Click again to close
    await helpBtn.click();
    await expect(page.locator("text=id.atlassian.com")).not.toBeVisible();
  });

  test("last session shortcut appears and works", async ({ page }) => {
    // Inject only last-session (not current creds)
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "jira-worklog-last-session",
        JSON.stringify({
          domain: "mycompany",
          email: "me@co.com",
          token: "tok",
          accountId: "acc1",
          displayName: "Previous User",
        })
      );
    });
    await mockJiraAPIs(page);
    await page.goto("/");

    await expect(page.locator("text=LAST CONNECTION")).toBeVisible();
    await expect(page.locator("text=Previous User")).toBeVisible();
    await expect(page.locator("text=Connect →")).toBeVisible();
  });
});
