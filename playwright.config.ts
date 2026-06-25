import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: true,
  // One retry absorbs transient WebKit-under-parallel-load timeouts (the heavy WebKit
  // engine occasionally fails to paint within 5s on a loaded box); a real failure still
  // fails twice. Keeps full parallelism.
  retries: 1,
  use: {
    baseURL: "http://127.0.0.1:3100",
    // Block service workers in E2E: WebKit's automation driver hangs on SW-controlled
    // navigations (a Playwright-WebKit limitation), and tests should never run against a
    // cached SW. The SW itself is covered by tests/unit/revora/pwa-assets.test.ts (file
    // contract) and the Phase 8.1 manual offline-launch matrix.
    serviceWorkers: "block"
  },
  webServer: {
    command: "npx next dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120000
  },
  projects: [
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"]
      }
    },
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"]
      }
    }
  ]
});
