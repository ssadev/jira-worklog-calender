const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.cjs",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html"], ["list"]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },

  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
    {
      name: "mobile",
      use: {
        browserName: "chromium",
        viewport: { width: 375, height: 812 },
      },
    },
  ],
});
