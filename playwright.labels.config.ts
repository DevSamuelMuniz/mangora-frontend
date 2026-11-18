import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./test/labels-browser", testMatch: "*.spec.ts", fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:4176", channel: "chrome", screenshot: "only-on-failure", trace: "retain-on-failure" },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"] } }, { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }],
  webServer: { command: "node test/labels-browser/server.mjs", url: "http://127.0.0.1:4176", reuseExistingServer: false },
});
