const { test, expect } = require("@playwright/test");
const { mockJiraAPIs } = require("./fixtures/test-helpers.cjs");
const { FAKE_CREDS } = require("./fixtures/mock-data.cjs");

test.describe("LocalStorage Persistence", () => {
  test("stores credentials after successful login", async ({ page }) => {
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

    await expect(page.locator("text=QA Tester")).toBeVisible();

    const storedCreds = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("jira-worklog-creds"))
    );
    expect(storedCreds.domain).toBe("testcompany");
    expect(storedCreds.accountId).toBe(FAKE_CREDS.accountId);
    expect(storedCreds.displayName).toBe("QA Tester");
  });

  test("persists across page reload", async ({ page }) => {
    await page.addInitScript((creds) => {
      window.localStorage.setItem("jira-worklog-creds", JSON.stringify(creds));
    }, FAKE_CREDS);
    await mockJiraAPIs(page);

    await page.goto("/");
    await expect(page.locator("text=QA Tester")).toBeVisible();

    // Reload
    await page.reload();
    await expect(page.locator("text=QA Tester")).toBeVisible();
  });

  test("logout clears creds but preserves last session", async ({ page }) => {
    await page.addInitScript((creds) => {
      window.localStorage.setItem("jira-worklog-creds", JSON.stringify(creds));
      window.localStorage.setItem(
        "jira-worklog-last-session",
        JSON.stringify(creds)
      );
    }, FAKE_CREDS);
    await mockJiraAPIs(page);

    await page.goto("/");
    await page.locator('button:has-text("logout")').click();

    const creds = await page.evaluate(() =>
      localStorage.getItem("jira-worklog-creds")
    );
    expect(creds).toBeNull();

    const lastSession = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("jira-worklog-last-session"))
    );
    expect(lastSession.displayName).toBe("QA Tester");
  });

  test("last session saved after successful login", async ({ page }) => {
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

    await expect(page.locator("text=QA Tester")).toBeVisible();

    const lastSession = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("jira-worklog-last-session"))
    );
    expect(lastSession.displayName).toBe("QA Tester");
    expect(lastSession.accountId).toBe(FAKE_CREDS.accountId);
  });
});
