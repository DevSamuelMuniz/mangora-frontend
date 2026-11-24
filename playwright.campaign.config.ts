import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./test/campaign-browser", workers: 1,
  use: { baseURL: "http://127.0.0.1:4182", channel: "chrome", trace: "retain-on-failure" },
  webServer: { command: "node test/billing-browser/landing-server.mjs", url: "http://127.0.0.1:4182", reuseExistingServer: false },
});
