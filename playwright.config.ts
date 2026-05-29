import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3100"
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
