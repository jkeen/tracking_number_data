import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: { baseURL: "http://localhost:4173", trace: "on-first-retry" },
  // Against the built site, served the way Pages serves it: what the prerender wrote is
  // what the tests read, and an address with no file behind it falls back the same way.
  webServer: {
    command: "npm run build && node e2e/pages-server.mjs build 4173",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: devices["Desktop Chrome"] },
    { name: "mobile", use: devices["iPhone 12"] },
  ],
})
