import { defineConfig, devices } from "@playwright/test";
import { randomBytes } from "node:crypto";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  reporter: "list",
  outputDir: ".data/playwright-results",
  use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
    env: { NODE_OPTIONS: "--max-old-space-size=512", AUTH_SECRET: process.env.AUTH_SECRET || randomBytes(32).toString("hex"), APP_URL: "http://localhost:3000", DEV_RESET_LINK_LOG: "true" },
  },
});
