const { test, expect } = require("@playwright/test");
const {
  setupAuthenticatedPage,
  injectCredentials,
  mockJiraAPIs,
} = require("./fixtures/test-helpers.cjs");

test.describe("Console Error Monitoring", () => {
  test("no console errors on settings page", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });

  test("no console errors on calendar page", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await setupAuthenticatedPage(page, "/?month=2026-04");
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });

  test("no console errors on daily worklog page", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await injectCredentials(page);
    await mockJiraAPIs(page);
    await page.goto("/daily-worklog?day=2026-04-01");
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });

  test("no unhandled promise rejections", async ({ page }) => {
    const rejections = [];
    page.on("pageerror", (err) => rejections.push(err.message));

    await setupAuthenticatedPage(page, "/?month=2026-04");
    await page.waitForLoadState("networkidle");

    expect(rejections).toEqual([]);
  });

  test("no console errors during full navigation flow", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await setupAuthenticatedPage(page, "/?month=2026-04");

    // Navigate months
    await page.locator('button:has-text("←")').click();
    await page.waitForLoadState("networkidle");
    await page.locator('button:has-text("→")').click();
    await page.waitForLoadState("networkidle");

    // Click a day
    const dayCell = page.locator(".dc").first();
    await dayCell.click();

    // Double-click to go to daily worklog
    await dayCell.dblclick();
    await page.waitForLoadState("networkidle");

    // Navigate back
    await page.locator("text=← Calendar").click();
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });
});
