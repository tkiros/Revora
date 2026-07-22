import { defineConfig, devices } from "@playwright/test";

// The PAYWALL_MODE=trial server on :3101 is only needed when the trial-wall spec
// is actually in the run. Booting it also rewrites the tracked tsconfig.json /
// next-env.d.ts to the e2e-trial distDir (healed by tests/smoke/global-teardown.ts),
// so we keep its blast radius to runs that provably don't need it.
//
// SUPPRESSION RULE: only a set of CONCRETE spec-file filters (each arg
// endsWith(".spec.ts")) that omit trial-wall suppresses :3101. Everything else
// boots it — a whole-suite run, an explicit trial-wall filter, AND any
// directory-style/ambiguous filter (e.g. `tests/smoke/`, `tests/`), because a
// directory can contain trial-wall.spec.ts and we cannot prove otherwise from
// the arg alone. Booting when unsure is safe: global-teardown.ts reverts the
// dev-artifact rewrite so the tree stays clean.
//
// specFilters picks out path-like positional args only — the leading `test`
// subcommand and flags/values like --project="Mobile Chrome" don't look like a
// spec path, so a filter-less run still boots :3101.
const specFilters = process.argv
  .slice(2)
  .filter(
    (a) =>
      !a.startsWith("-") &&
      (a.endsWith(".ts") || a.includes(".spec") || a.includes("tests/"))
  );
const concreteSpecFilters = specFilters.filter((a) => a.endsWith(".spec.ts"));
const runsTrialSpec =
  // No path filter → whole-suite run → boot.
  specFilters.length === 0 ||
  // Any non-concrete path filter (a directory or anything ambiguous) is present
  // → boot, since it may resolve to trial-wall.
  concreteSpecFilters.length !== specFilters.length ||
  // Every filter is a concrete .spec.ts: boot only if one of them is trial-wall.
  concreteSpecFilters.some((a) => a.includes("trial-wall"));

const trialWebServer = {
  // Second server on :3101 running PAYWALL_MODE=trial for
  // tests/smoke/trial-wall.spec.ts. Paywall mode is resolved server-side
  // (app/subscribe/page.tsx → lib/server/pricing.paywallMode()), so the
  // trial wall can only be exercised by a genuinely trial-mode server; the
  // :3100 server is pinned to PAYWALL_MODE=legacy (trial is the code
  // default now) for billing-pages.spec. One server cannot serve both
  // modes at once.
  command: "npx next dev --hostname 127.0.0.1 --port 3101",
  url: "http://127.0.0.1:3101",
  reuseExistingServer: false,
  stdout: "pipe" as const,
  stderr: "pipe" as const,
  // 240s: a cold .next cache on a slow disk exceeded the 120s default and
  // zero tests ran (2026-07-06 launch audit BUG-15). Warm boots are unaffected.
  timeout: 240_000,
  env: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY:
      "BDd3_hVL9fZi9Ybo2UUmA0mNzLFmwEsuJdyxdCLVQV-XFotN0jkNqp7GQ96_2enX0mUeXBIvBqXAiCveKuMhGJ0",
    // Test-only secret so Auth.js stops logging MissingSecret in smoke runs
    // (2026-07-09 E2E-05). Never a production value.
    AUTH_SECRET: "revora-e2e-smoke-only-secret-0000000000000000",
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
  // Axe scans and cold route compilation can exceed Playwright's 30s default
  // on the documented slow-filesystem CI/worktree path. Product assertions
  // still use Playwright's short expect timeout; this only prevents the whole
  // test budget from expiring while several accessibility scans complete.
  timeout: 90_000,
  // Revert the trial server's tsconfig.json / next-env.d.ts distDir rewrite so a
  // smoke run never leaves the working tree dirty (self-contained).
  globalTeardown: "./tests/smoke/global-teardown.ts",
  fullyParallel: true,
  // One retry absorbs transient WebKit-under-parallel-load timeouts (the heavy WebKit
  // engine occasionally fails to paint within 5s on a loaded box); a real failure still
  // fails twice. Keeps full parallelism.
  retries: 1,
  // ci.yml uploads playwright-report/ on failure, but nothing ever wrote that
  // folder — the default reporter has no file output, so every red CI run threw
  // its evidence away and had to be re-diagnosed locally against a dev box with
  // very different timing (2026-07-22). The html reporter fills the folder the
  // workflow already asks for, and the trace makes a failure replayable.
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    trace: "retain-on-failure",
    baseURL: "http://127.0.0.1:3100",
    // Block service workers in E2E: WebKit's automation driver hangs on SW-controlled
    // navigations (a Playwright-WebKit limitation), and tests should never run against a
    // cached SW. The SW itself is covered by tests/unit/revora/pwa-assets.test.ts (file
    // contract) and the Phase 8.1 manual offline-launch matrix.
    serviceWorkers: "block",
    // The 2026-07-07 revamp added a small CSS motion layer (transitions +
    // result-card entrance). WebKit-under-parallel-load stalls its
    // element-stability checks on animated layouts; tests assert content, not
    // motion, and the app's prefers-reduced-motion block makes this a real
    // user path too.
    contextOptions: { reducedMotion: "reduce" as const }
  },
  webServer: [
    {
      command: "npx next dev --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      stdout: "pipe",
      stderr: "pipe",
      // 240s: see the trialWebServer note (BUG-15 cold-boot timeout).
      timeout: 240_000,
      env: {
        // Trial is now the code default (lib/server/pricing.ts), so the
        // legacy-mode assertions (billing-pages.spec, trial-wall's legacy
        // guard) need this server pinned to legacy explicitly.
        PAYWALL_MODE: "legacy",
        // Task 7 (P2.1): the paywall card now shows the annual plan ONLY when
        // GET /api/paywall returns an annual price — which the route gates on
        // this env being set (annual.priceId). Production configures it; the
        // e2e server must too, or the annual card is (correctly) hidden and
        // billing-pages.spec's annual assertion has nothing to match. A dummy
        // id is fine — annual checkout is never exercised here (no Stripe).
        STRIPE_PRICE_ANNUAL: "price_e2e_annual_smoke_only",
        // Test-only secret so Auth.js stops logging MissingSecret in smoke
        // runs (2026-07-09 E2E-05). Never a production value.
        AUTH_SECRET: "revora-e2e-smoke-only-secret-0000000000000000",
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
    },
    // AA-10: the app ships a desktop sidebar layout that no project ever
    // exercised — desktop-only regressions (sidebar nav, wide-viewport CSS)
    // were invisible to CI.
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ]
});
