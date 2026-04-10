const { test, expect } = require("@playwright/test");
const {
  setupAuthenticatedPage,
  injectCredentials,
  mockJiraAPIs,
} = require("./fixtures/test-helpers.cjs");

test.describe("Responsive Design", () => {
  test("calendar at desktop shows side-by-side layout", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await setupAuthenticatedPage(page, "/?month=2026-04");

    // Detail panel and calendar should both be visible
    await expect(page.locator(".detail-panel")).toBeVisible();
    await expect(page.locator(".main-layout")).toBeVisible();
  });

  test("calendar at mobile stacks vertically", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await setupAuthenticatedPage(page, "/?month=2026-04");

    // Calendar grid and detail panel should both be visible
    await expect(page.locator(".detail-panel")).toBeVisible();
    // Main layout switches to column at 920px breakpoint
    await expect(page.locator(".main-layout")).toBeVisible();
  });

  test("settings panel is accessible on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(
      page.locator('button:has-text("Connect & Load Calendar")')
    ).toBeVisible();
    await expect(
      page.locator('input[placeholder*="your-company"]')
    ).toBeVisible();
  });

  test("daily worklog renders at desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await injectCredentials(page);
    await mockJiraAPIs(page);
    await page.goto("/daily-worklog?day=2026-04-01");

    // Clock and worklog list should be visible
    await expect(page.locator(".recharts-wrapper")).toBeVisible();
    await expect(page.locator("text=PROJ-101")).toBeVisible();
  });

  test("daily worklog renders at mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await injectCredentials(page);
    await mockJiraAPIs(page);
    await page.goto("/daily-worklog?day=2026-04-01");

    // Clock and entries should be visible in stacked layout
    await expect(page.locator(".recharts-wrapper")).toBeVisible();
    await expect(page.locator("text=PROJ-101")).toBeVisible();
  });

  test("navigation controls visible at all sizes", async ({ page }) => {
    await setupAuthenticatedPage(page, "/?month=2026-04");

    // Desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('button:has-text("←")')).toBeVisible();
    await expect(page.locator('button:has-text("→")')).toBeVisible();

    // Mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('button:has-text("←")')).toBeVisible();
    await expect(page.locator('button:has-text("→")')).toBeVisible();
  });
});
