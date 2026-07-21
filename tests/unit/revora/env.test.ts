import { afterEach, describe, expect, it } from "vitest";

import { GET } from "../../../app/api/health/route";
import { getRevoraEnv } from "../../../lib/revora/env";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("getRevoraEnv", () => {
  it("distinguishes Preview, Production, Development, and Test", () => {
    expect(
      getRevoraEnv({
        NODE_ENV: "production",
        VERCEL_ENV: "preview",
        OPENAI_API_KEY: "sk-preview"
      })
    ).toMatchObject({ environment: "preview", openAiApiKey: "sk-preview" });

    expect(
      getRevoraEnv({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        OPENAI_API_KEY: "sk-production"
      })
    ).toMatchObject({
      environment: "production",
      openAiApiKey: "sk-production"
    });

    expect(
      getRevoraEnv({
        NODE_ENV: "development",
        OPENAI_API_KEY: "sk-development"
      })
    ).toMatchObject({
      environment: "development",
      openAiApiKey: "sk-development"
    });

    expect(
      getRevoraEnv({
        NODE_ENV: "test",
        OPENAI_API_KEY: "sk-test"
      })
    ).toMatchObject({ environment: "test", openAiApiKey: "sk-test" });
  });

  it("requires OPENAI_API_KEY and keeps EDGE_CONFIG optional", () => {
    expect(() =>
      getRevoraEnv({
        NODE_ENV: "production",
        VERCEL_ENV: "production"
      })
    ).toThrow("OPENAI_API_KEY");

    expect(
      getRevoraEnv({
        NODE_ENV: "production",
        VERCEL_ENV: "preview",
        OPENAI_API_KEY: "sk-preview",
        EDGE_CONFIG: "ecfg_connection_string"
      })
    ).toEqual({
      environment: "preview",
      openAiApiKey: "sk-preview",
      edgeConfigConnectionString: "ecfg_connection_string"
    });
  });
});

describe("GET /api/health", () => {
  it("returns minimal launch metadata without exposing secrets", async () => {
    // No EDGE_CONFIG here: RE-02 makes a configured-but-unreadable store fail
    // CLOSED (paused), and a fake connection string is exactly that. This
    // test is about metadata shape, so leave the kill switch unconfigured.
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      OPENAI_API_KEY: "sk-preview"
    };
    delete process.env.EDGE_CONFIG;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    // Hermetic against a local shell exporting the kill switch.
    delete process.env.LEGAL_TERMS_FINAL;

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      environment: "preview",
      launch: "ready",
      launchMode: "normal",
      upstash: "unconfigured",
      // G8: boolean-only W-04 gate state; open unless LEGAL_TERMS_FINAL="0"
      // (owner WTP decision 2026-07-17, commit 8c30265 — kill switch inverted)
      checkoutGate: "open",
      db: "unconfigured",
      crons: {
        nudge: "unknown",
        baiWeekly: "unknown",
        trialPrecharge: "unknown",
        pantrySweep: "unknown",
        stripeReconcile: "unknown"
      }
    });
    expect(JSON.stringify(payload)).not.toContain("sk-preview");
    expect(JSON.stringify(payload)).not.toContain("ecfg_connection_string");
  });

  it("returns missing_config when required env is absent", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "development",
      VERCEL_ENV: "development"
    };
    delete process.env.OPENAI_API_KEY;
    delete process.env.EDGE_CONFIG;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toEqual({
      ok: false,
      environment: "development",
      launch: "missing_config",
      launchMode: "normal",
      upstash: "unconfigured",
      db: "unconfigured",
      crons: {
        nudge: "unknown",
        baiWeekly: "unknown",
        trialPrecharge: "unknown",
        pantrySweep: "unknown",
        stripeReconcile: "unknown"
      }
    });
  });
});
