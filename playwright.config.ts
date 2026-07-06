import { defineConfig, devices } from "@playwright/test";

// The PAYWALL_MODE=trial server on :3101 is only needed when the trial-wall spec
// is actually in the run. Booting it also rewrites the tracked tsconfig.json /
// next-env.d.ts to the e2e-trial distDir (healed by tests/smoke/global-teardown.ts),
// so we keep its blast radius to runs that need it: skip it when a file filter is
// given that does NOT name trial-wall, and always include it for an unfiltered
// (whole-suite) run. Detection is conservative — anything that looks like a spec
// path filter counts; flags like --project="Mobile Chrome" (and its bare value)
// do not, so a filter-less run still boots it.
const specFilters = process.argv
  .slice(2)
  .filter(
    (a) =>
      !a.startsWith("-") &&
      (a.endsWith(".ts") || a.includes(".spec") || a.includes("tests/"))
  );
const runsTrialSpec =
  specFilters.length === 0 || specFilters.some((a) => a.includes("trial-wall"));

const trialWebServer = {
  // Second server on :3101 running PAYWALL_MODE=trial for
  // tests/smoke/trial-wall.spec.ts. Paywall mode is resolved server-side
  // (app/subscribe/page.tsx → lib/server/pricing.paywallMode()), so the
  // trial wall can only be exercised by a genuinely trial-mode server; the
  // :3100 server stays on the `legacy` default that billing-pages.spec
  // expects. One server cannot serve both modes at once.
  command: "npx next dev --hostname 127.0.0.1 --port 3101",
  url: "http://127.0.0.1:3101",
  reuseExistingServer: false,
  stdout: "pipe" as const,
  stderr: "pipe" as const,
  timeout: 120000,
  env: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY:
      "BDd3_hVL9fZi9Ybo2UUmA0mNzLFmwEsuJdyxdCLVQV-XFotN0jkNqp7GQ96_2enX0mUeXBIvBqXAiCveKuMhGJ0",
    PAYWALL_MODE: "trial",
    AUTH_EMAIL_STUB_DIR: "/tmp/revora-trial-smoke-stub",
    // Isolate this server's build dir + dev lock from the :3100 server so
    // both `next dev` instances coexist (see next.config.ts distDir gate).
    // Under .next/, so it inherits the .next/ gitignore — nothing new to track.
    // Its price is the tsconfig.json / next-env.d.ts rewrite that
    // global-teardown.ts reverts (keeping the run self-contained).
    NEXT_DIST_DIR: ".next/e2e-trial"
  }
};

export default defineConfig({
  testDir: "./tests/smoke",
  // Revert the trial server's tsconfig.json / next-env.d.ts distDir rewrite so a
  // smoke run never leaves the working tree dirty (self-contained).
  globalTeardown: "./tests/smoke/global-teardown.ts",
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
  webServer: [
    {
      command: "npx next dev --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 120000,
      env: {
        // A syntactically-valid VAPID public key so the nudge opt-in flow can
        // run end-to-end against mocked push APIs (never used to send).
        NEXT_PUBLIC_VAPID_PUBLIC_KEY:
          "BDd3_hVL9fZi9Ybo2UUmA0mNzLFmwEsuJdyxdCLVQV-XFotN0jkNqp7GQ96_2enX0mUeXBIvBqXAiCveKuMhGJ0"
      }
    },
    ...(runsTrialSpec ? [trialWebServer] : [])
  ],
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
