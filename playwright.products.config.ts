import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test/products-browser",
  use: { baseURL: "http://127.0.0.1:4176", channel: "chrome", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: { command: "node test/products-browser/server.mjs", url: "http://127.0.0.1:4176", reuseExistingServer: false },
});
