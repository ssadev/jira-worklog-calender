const { test, expect } = require("@playwright/test");
const { injectCredentials } = require("./fixtures/test-helpers.cjs");
const {
  FAKE_CREDS,
  FAKE_WORKLOGS,
  FAKE_MYSELF_RESPONSE,
} = require("./fixtures/mock-data.cjs");

test.describe("API Validation", () => {
  test("login sends correct payload to /api/jira/myself", async ({ page }) => {
    let capturedPayload = null;
    await page.route("**/api/jira/myself", async (route) => {
      capturedPayload = JSON.parse(route.request().postData());
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_MYSELF_RESPONSE),
      });
    });
    await page.route("**/api/jira/worklogs", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_WORKLOGS),
      });
    });

    await page.goto("/");
    await page
      .locator('input[placeholder*="your-company"]')
      .fill("mycompany");
    await page
      .locator('input[placeholder*="you@company.com"]')
      .fill("dev@mycompany.com");
    await page.locator('input[placeholder*="API token"]').fill("secret-token");
    await page.locator('button:has-text("Connect & Load Calendar")').click();

    await page.waitForResponse("**/api/jira/myself");

    expect(capturedPayload.domain).toBe("mycompany");
    expect(capturedPayload.email).toBe("dev@mycompany.com");
    expect(capturedPayload.token).toBe("secret-token");
  });

  test("worklogs request includes correct month/year", async ({ page }) => {
    let capturedWorklogPayload = null;
    await injectCredentials(page);

    await page.route("**/api/jira/worklogs", async (route) => {
      capturedWorklogPayload = JSON.parse(route.request().postData());
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_WORKLOGS),
      });
    });

    const responsePromise = page.waitForResponse("**/api/jira/worklogs");
    await page.goto("/?month=2026-04");
    await responsePromise;

    expect(capturedWorklogPayload.year).toBe(2026);
    expect(capturedWorklogPayload.month).toBe(3); // zero-based
    expect(capturedWorklogPayload.accountId).toBe(FAKE_CREDS.accountId);
  });

  test("month navigation triggers new API call", async ({ page }) => {
    let apiCallCount = 0;
    await injectCredentials(page);

    await page.route("**/api/jira/worklogs", async (route) => {
      apiCallCount++;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    const firstResponsePromise = page.waitForResponse("**/api/jira/worklogs");
    await page.goto("/");
    await firstResponsePromise;
    const initialCount = apiCallCount;

    const secondResponsePromise = page.waitForResponse("**/api/jira/worklogs");
    await page.locator('button:has-text("←")').click();
    await secondResponsePromise;

    expect(apiCallCount).toBe(initialCount + 1);
  });
});
