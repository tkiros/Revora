import { describe, expect, it } from "vitest";
import {
  createRateLimitDeps,
  evaluateRateLimit,
  getClientIp,
  isRateLimitConfigured,
  rateLimitConfigState,
  type RateLimitDeps
} from "../../../lib/revora/rate-limit";

function deps(over: Partial<RateLimitDeps> = {}): RateLimitDeps {
  return {
    limitIp: async () => ({ success: true, resetMs: Date.now() + 1_000 }),
    incrDailyCount: async () => 1,
    dailyCap: 2_000,
    ...over
  };
}

describe("evaluateRateLimit", () => {
  it("allows a normal request", async () => {
    expect(await evaluateRateLimit("1.1.1.1", deps())).toEqual({ ok: true });
  });

  it("blocks per-IP and does NOT touch the daily counter", async () => {
    let dailyCalls = 0;
    const decision = await evaluateRateLimit(
      "1.1.1.1",
      deps({
        limitIp: async () => ({ success: false, resetMs: Date.now() + 30_000 }),
        incrDailyCount: async () => {
          dailyCalls += 1;
          return 1;
        }
      })
    );
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.reason).toBe("per_ip");
    expect(dailyCalls).toBe(0); // IP-blocked requests must not bump the global cap
  });

  it("blocks when the daily cap is exceeded", async () => {
    const decision = await evaluateRateLimit(
      "1.1.1.1",
      deps({ incrDailyCount: async () => 2_001, dailyCap: 2_000 })
    );
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.reason).toBe("daily_cap");
  });

  it("fails OPEN on a transient store error", async () => {
    const decision = await evaluateRateLimit(
      "1.1.1.1",
      deps({
        limitIp: async () => {
          throw new Error("redis down");
        }
      })
    );
    expect(decision).toEqual({ ok: true });
  });

  it("extracts the first x-forwarded-for IP", () => {
    const h = new Headers({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" });
    expect(getClientIp(h)).toBe("9.9.9.9");
  });

  it("falls back to 'unknown' with no IP header", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

describe("rateLimitConfigState (BUG-01/07 hardening)", () => {
  const REST_URL = "https://fake.upstash.io";
  const TCP_URL = "rediss://default:pass@fake.upstash.io:6379";
  const env = (vars: Record<string, string>) =>
    vars as unknown as NodeJS.ProcessEnv;

  it("is unconfigured when either var is absent", () => {
    expect(rateLimitConfigState(env({}))).toBe("unconfigured");
    expect(
      rateLimitConfigState(env({ UPSTASH_REDIS_REST_URL: REST_URL }))
    ).toBe("unconfigured");
  });

  it("is configured for the https:// REST URL", () => {
    const configured = env({
      UPSTASH_REDIS_REST_URL: REST_URL,
      UPSTASH_REDIS_REST_TOKEN: "tok"
    });
    expect(rateLimitConfigState(configured)).toBe("configured");
    expect(isRateLimitConfigured(configured)).toBe(true);
  });

  it("is invalid for the rediss:// TCP URL — the misconfig that 500'd prod", () => {
    const invalid = env({
      UPSTASH_REDIS_REST_URL: TCP_URL,
      UPSTASH_REDIS_REST_TOKEN: "tok"
    });
    expect(rateLimitConfigState(invalid)).toBe("invalid");
    expect(isRateLimitConfigured(invalid)).toBe(false);
  });

  it("createRateLimitDeps returns null (never throws) on an invalid URL", () => {
    expect(
      createRateLimitDeps(
        env({
          UPSTASH_REDIS_REST_URL: TCP_URL,
          UPSTASH_REDIS_REST_TOKEN: "tok"
        })
      )
    ).toBeNull();
  });
});
