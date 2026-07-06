/**
 * Unit tests for launch-control contracts, thresholds, and middleware gate (Plan 04-02)
 *
 * Coverage:
 *  - 04-01 artifact dependency gate
 *  - getLaunchControls() defaults (normal mode, checks enabled, empty incident message)
 *  - evaluateLaunchMode() pause path (public_checks_enabled false)
 *  - shouldPauseForOps() threshold helper (harmful-guidance, provider-failure, 2,000 checks/24h)
 *  - Missing / absent Edge Config values fail closed to safe defaults
 *  - /api/health reports launchMode from launch-control seam
 *  - Middleware pause gate: normal mode passthrough, paused mode 503 with friendly copy
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ----- Dependency gate (Test 1) -----
describe("04-01 artifact dependency gate", () => {
  it("stops if docs/privacy/data-flow.md is missing", async () => {
    const { existsSync } = await import("node:fs");
    expect(existsSync("docs/privacy/data-flow.md")).toBe(true);
  });

  it("stops if lib/revora/openai-client.ts is missing", async () => {
    const { existsSync } = await import("node:fs");
    expect(existsSync("lib/revora/openai-client.ts")).toBe(true);
  });

  it("stops if lib/revora/telemetry.ts is missing", async () => {
    const { existsSync } = await import("node:fs");
    expect(existsSync("lib/revora/telemetry.ts")).toBe(true);
  });

  it("stops if lib/revora/env.ts is missing", async () => {
    const { existsSync } = await import("node:fs");
    expect(existsSync("lib/revora/env.ts")).toBe(true);
  });

  it("stops if app/api/check/route.ts is missing", async () => {
    const { existsSync } = await import("node:fs");
    expect(existsSync("app/api/check/route.ts")).toBe(true);
  });

  it("stops if app/api/health/route.ts is missing", async () => {
    const { existsSync } = await import("node:fs");
    expect(existsSync("app/api/health/route.ts")).toBe(true);
  });

  it("stops if tests/unit/revora/privacy-minimal.test.ts is missing", async () => {
    const { existsSync } = await import("node:fs");
    expect(existsSync("tests/unit/revora/privacy-minimal.test.ts")).toBe(true);
  });

  it("stops if tests/unit/revora/openai-client.test.ts is missing", async () => {
    const { existsSync } = await import("node:fs");
    expect(existsSync("tests/unit/revora/openai-client.test.ts")).toBe(true);
  });

  it("stops if tests/unit/revora/telemetry.test.ts is missing", async () => {
    const { existsSync } = await import("node:fs");
    expect(existsSync("tests/unit/revora/telemetry.test.ts")).toBe(true);
  });

  it("stops if tests/unit/revora/env.test.ts is missing", async () => {
    const { existsSync } = await import("node:fs");
    expect(existsSync("tests/unit/revora/env.test.ts")).toBe(true);
  });
});

// ----- getLaunchControls() default mode (Test 2) -----
describe("getLaunchControls() default mode", () => {
  beforeEach(() => {
    // No EDGE_CONFIG, no override — defaults
    delete process.env.EDGE_CONFIG;
    delete process.env.REVORA_LAUNCH_MODE_OVERRIDE;
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("defaults to normal mode with public checks enabled when no configuration is present", async () => {
    const { getLaunchControls } = await import(
      "../../../lib/revora/launch-controls"
    );
    const controls = await getLaunchControls();

    expect(controls.launchMode).toBe("normal");
    expect(controls.publicChecksEnabled).toBe(true);
    expect(typeof controls.incidentMessage).toBe("string");
  });

  it("respects REVORA_LAUNCH_MODE_OVERRIDE=paused in non-production environments", async () => {
    process.env.REVORA_LAUNCH_MODE_OVERRIDE = "paused";

    const { getLaunchControls } = await import(
      "../../../lib/revora/launch-controls"
    );
    const controls = await getLaunchControls();

    expect(controls.launchMode).toBe("paused");
    expect(controls.publicChecksEnabled).toBe(false);
  });
});

// ----- evaluateLaunchMode() pause path (Test 3) -----
describe("evaluateLaunchMode() pause path", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    delete process.env.REVORA_LAUNCH_MODE_OVERRIDE;
  });

  it("returns a friendly 503 paused response when public_checks_enabled is false", async () => {
    process.env.REVORA_LAUNCH_MODE_OVERRIDE = "paused";

    const { evaluateLaunchMode } = await import(
      "../../../lib/revora/launch-controls"
    );
    const result = await evaluateLaunchMode();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(503);
      expect(typeof result.message).toBe("string");
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.controls.launchMode).toBe("paused");
      expect(result.controls.publicChecksEnabled).toBe(false);
    }
  });

  it("returns ok:true in normal mode", async () => {
    delete process.env.REVORA_LAUNCH_MODE_OVERRIDE;

    const { evaluateLaunchMode } = await import(
      "../../../lib/revora/launch-controls"
    );
    const result = await evaluateLaunchMode();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.controls.launchMode).toBe("normal");
    }
  });

  it("never leaks raw errors or provider stack traces in the pause message", async () => {
    process.env.REVORA_LAUNCH_MODE_OVERRIDE = "paused";

    const { evaluateLaunchMode } = await import(
      "../../../lib/revora/launch-controls"
    );
    const result = await evaluateLaunchMode();

    if (!result.ok) {
      expect(result.message).not.toMatch(/Error:|stack|at Object|node_modules/i);
    }
  });
});

// ----- shouldPauseForOps() threshold helper (Test 4) -----
describe("shouldPauseForOps() threshold helper", () => {
  it("returns true for harmful-guidance incidents", async () => {
    const { shouldPauseForOps } = await import(
      "../../../lib/revora/launch-controls"
    );
    expect(
      shouldPauseForOps({
        checksLast24h: 100,
        harmfulGuidanceIncident: true,
        providerFailureSpike: false
      })
    ).toBe(true);
  });

  it("returns true for provider-failure spikes", async () => {
    const { shouldPauseForOps } = await import(
      "../../../lib/revora/launch-controls"
    );
    expect(
      shouldPauseForOps({
        checksLast24h: 100,
        harmfulGuidanceIncident: false,
        providerFailureSpike: true
      })
    ).toBe(true);
  });

  it("returns true when checksLast24h reaches 2,000", async () => {
    const { shouldPauseForOps } = await import(
      "../../../lib/revora/launch-controls"
    );
    expect(
      shouldPauseForOps({
        checksLast24h: 2000,
        harmfulGuidanceIncident: false,
        providerFailureSpike: false
      })
    ).toBe(true);
  });

  it("returns true when checksLast24h exceeds 2,000", async () => {
    const { shouldPauseForOps } = await import(
      "../../../lib/revora/launch-controls"
    );
    expect(
      shouldPauseForOps({
        checksLast24h: 2001,
        harmfulGuidanceIncident: false,
        providerFailureSpike: false
      })
    ).toBe(true);
  });

  it("returns false when under threshold and no incidents", async () => {
    const { shouldPauseForOps } = await import(
      "../../../lib/revora/launch-controls"
    );
    expect(
      shouldPauseForOps({
        checksLast24h: 1999,
        harmfulGuidanceIncident: false,
        providerFailureSpike: false
      })
    ).toBe(false);
  });
});

// ----- Missing Edge Config values fail closed (Test 5) -----
describe("missing Edge Config values fail closed to safe defaults", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    delete process.env.EDGE_CONFIG;
    delete process.env.REVORA_LAUNCH_MODE_OVERRIDE;
  });

  it("falls back to normal mode when EDGE_CONFIG is absent (no SDK invocation)", async () => {
    delete process.env.EDGE_CONFIG;
    delete process.env.REVORA_LAUNCH_MODE_OVERRIDE;

    const { getLaunchControls } = await import(
      "../../../lib/revora/launch-controls"
    );
    const controls = await getLaunchControls();

    // Must not throw; defaults to safe (normal / enabled)
    expect(controls.launchMode).toBe("normal");
    expect(controls.publicChecksEnabled).toBe(true);
  });

  it("gracefully handles a missing Edge Config key without throwing raw provider errors", async () => {
    // Simulate EDGE_CONFIG present but `get()` returning null/undefined.
    // The launch-controls module catches all SDK errors internally; providing
    // a fake connection string triggers the SDK path, and the catch block
    // returns safe defaults instead of throwing.
    process.env.EDGE_CONFIG = "ecfg_fake_for_test";

    const { getLaunchControls } = await import(
      "../../../lib/revora/launch-controls"
    );
    // SDK will fail on a fake connection string; module must return safe defaults
    const controls = await getLaunchControls();

    expect(controls.launchMode).toBe("normal");
    expect(controls.publicChecksEnabled).toBe(true);
    expect(typeof controls.incidentMessage).toBe("string");
  });

  it("handles a provider error from Edge Config without propagating raw stack traces", async () => {
    // Identical to the previous test: a fake EDGE_CONFIG triggers the SDK
    // path; the catch block must return safe defaults, not throw.
    process.env.EDGE_CONFIG = "ecfg_another_fake";

    const { getLaunchControls } = await import(
      "../../../lib/revora/launch-controls"
    );

    // Must not throw — should fail closed to safe defaults
    await expect(getLaunchControls()).resolves.toMatchObject({
      launchMode: "normal",
      publicChecksEnabled: true
    });
  });
});

// ----- /api/health reports launch state (Task 1, Test 4) -----
describe("/api/health reports launchMode from launch-control seam", () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("includes launchMode:normal in the success response", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      OPENAI_API_KEY: "sk-preview-test"
    };
    delete process.env.EDGE_CONFIG;
    delete process.env.REVORA_LAUNCH_MODE_OVERRIDE;

    const { GET } = await import("../../../app/api/health/route");
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.launchMode).toBe("normal");
  });

  it("reports upstash:unconfigured when Upstash env is absent (merge-gate signal)", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      OPENAI_API_KEY: "sk-preview-test"
    };
    delete process.env.EDGE_CONFIG;
    delete process.env.REVORA_LAUNCH_MODE_OVERRIDE;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const { GET } = await import("../../../app/api/health/route");
    const payload = await (await GET()).json();

    expect(payload.upstash).toBe("unconfigured");
  });

  it("reports upstash:configured when Upstash env is present", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      OPENAI_API_KEY: "sk-preview-test",
      UPSTASH_REDIS_REST_URL: "https://fake.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "fake-token"
    };
    delete process.env.EDGE_CONFIG;
    delete process.env.REVORA_LAUNCH_MODE_OVERRIDE;

    const { GET } = await import("../../../app/api/health/route");
    const payload = await (await GET()).json();

    expect(payload.upstash).toBe("configured");
  });

  it("reports upstash:invalid when the URL is the rediss:// TCP form (BUG-01/07)", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      OPENAI_API_KEY: "sk-preview-test",
      UPSTASH_REDIS_REST_URL: "rediss://default:pass@fake.upstash.io:6379",
      UPSTASH_REDIS_REST_TOKEN: "fake-token"
    };
    delete process.env.EDGE_CONFIG;
    delete process.env.REVORA_LAUNCH_MODE_OVERRIDE;

    const { GET } = await import("../../../app/api/health/route");
    const payload = await (await GET()).json();

    expect(payload.upstash).toBe("invalid");
  });

  it("includes launchMode:paused when the override is active", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "development",
      OPENAI_API_KEY: "sk-dev-test",
      REVORA_LAUNCH_MODE_OVERRIDE: "paused"
    };
    delete process.env.EDGE_CONFIG;

    const { GET } = await import("../../../app/api/health/route");
    const response = await GET();
    const payload = await response.json();

    // Health still returns 200 (the probe is always accessible);
    // only the launch field reflects the paused state
    expect(payload.launchMode).toBe("paused");
    expect(payload.launch).toBe("paused");
  });

  it("never exposes secrets in the health response", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      OPENAI_API_KEY: "sk-secret-key-value",
      EDGE_CONFIG: "ecfg_secret_connection"
    };
    delete process.env.REVORA_LAUNCH_MODE_OVERRIDE;

    const { GET } = await import("../../../app/api/health/route");
    const response = await GET();
    const body = JSON.stringify(await response.json());

    expect(body).not.toContain("sk-secret-key-value");
    expect(body).not.toContain("ecfg_secret_connection");
  });
});

// ----- Middleware pause gate (Task 1, Tests 1-3) -----
describe("middleware pause gate (evaluateLaunchMode integration)", () => {
  afterEach(() => {
    vi.resetModules();
    delete process.env.REVORA_LAUNCH_MODE_OVERRIDE;
  });

  it("returns ok:true in normal mode so the public path can continue", async () => {
    delete process.env.REVORA_LAUNCH_MODE_OVERRIDE;

    const { evaluateLaunchMode } = await import(
      "../../../lib/revora/launch-controls"
    );
    const result = await evaluateLaunchMode();

    expect(result.ok).toBe(true);
  });

  it("returns ok:false with 503 and friendly copy in paused mode (pre-model gate)", async () => {
    process.env.REVORA_LAUNCH_MODE_OVERRIDE = "paused";

    const { evaluateLaunchMode } = await import(
      "../../../lib/revora/launch-controls"
    );
    const result = await evaluateLaunchMode();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(503);
      // Must never contain raw errors, stack traces, food text, or prompt text
      expect(result.message).not.toMatch(
        /Error:|TypeError|stack|node_modules|OpenAI|prompt/i
      );
      expect(result.message.length).toBeGreaterThan(10);
    }
  });

  it("pause response never leaks raw food text or prompt text", async () => {
    process.env.REVORA_LAUNCH_MODE_OVERRIDE = "paused";

    const { evaluateLaunchMode } = await import(
      "../../../lib/revora/launch-controls"
    );
    const result = await evaluateLaunchMode();

    if (!result.ok) {
      const safeFields = JSON.stringify(result);
      expect(safeFields).not.toMatch(/food:|a1c:|prompt|model output/i);
    }
  });
});
