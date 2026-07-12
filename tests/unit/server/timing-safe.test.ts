import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isAuthorizedCron,
  timingSafeEqualSecret
} from "../../../lib/server/timing-safe";
import { createBaiCronHandler } from "../../../app/api/cron/bai-weekly/route";
import { createNudgeCronHandler } from "../../../app/api/cron/nudge/route";
import { createPantrySweepHandler } from "../../../app/api/cron/pantry-sweep/route";
import { createPrechargeSweepHandler } from "../../../app/api/cron/trial-precharge/route";

/**
 * W-36 / N-29 — every shared-secret door in the app compares in constant time.
 * The four crons used a plain `!==` on the bearer token, which leaks the
 * secret's length and matching prefix through response timing.
 */

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("timingSafeEqualSecret", () => {
  it("matches identical secrets", () => {
    expect(timingSafeEqualSecret("s3cret", "s3cret")).toBe(true);
  });

  it("rejects a mismatch", () => {
    expect(timingSafeEqualSecret("s3cret", "s3crey")).toBe(false);
  });

  it("rejects secrets of DIFFERENT lengths instead of throwing", () => {
    // timingSafeEqual itself throws on a length mismatch — hashing both sides
    // first is what makes an unequal-length compare safe rather than a 500.
    expect(() => timingSafeEqualSecret("short", "a-much-longer-secret")).not.toThrow();
    expect(timingSafeEqualSecret("short", "a-much-longer-secret")).toBe(false);
  });

  it("an absent expected secret can NEVER match — not even an empty string", () => {
    expect(timingSafeEqualSecret("", undefined)).toBe(false);
    expect(timingSafeEqualSecret("", "")).toBe(false);
    expect(timingSafeEqualSecret(null, null)).toBe(false);
    expect(timingSafeEqualSecret("anything", undefined)).toBe(false);
  });
});

describe("isAuthorizedCron", () => {
  it("accepts the correct bearer token", () => {
    expect(isAuthorizedCron("Bearer right", "right")).toBe(true);
  });

  it("rejects a wrong token, a bare token, and a missing header", () => {
    expect(isAuthorizedCron("Bearer wrong", "right")).toBe(false);
    expect(isAuthorizedCron("right", "right")).toBe(false); // no Bearer prefix
    expect(isAuthorizedCron(null, "right")).toBe(false);
  });

  it("rejects everything when CRON_SECRET is unset — an unconfigured deploy is not sweepable", () => {
    expect(isAuthorizedCron("Bearer anything", undefined)).toBe(false);
    expect(isAuthorizedCron("Bearer ", undefined)).toBe(false);
  });
});

describe("cron routes reject unauthorized callers (W-36)", () => {
  const handlers = {
    "bai-weekly": createBaiCronHandler({ db: () => unreachableDb() }),
    nudge: createNudgeCronHandler({ db: () => unreachableDb() }),
    "pantry-sweep": createPantrySweepHandler({ db: () => unreachableDb() }),
    "trial-precharge": createPrechargeSweepHandler({ db: () => unreachableDb() })
  };

  // The guard must return BEFORE anything touches the database.
  function unreachableDb(): never {
    throw new Error("db() must not be called on an unauthorized cron request");
  }

  function request(authorization?: string) {
    return new Request("http://t/api/cron/x", {
      headers: authorization ? { authorization } : {}
    });
  }

  for (const [name, handler] of Object.entries(handlers)) {
    it(`${name}: 401s a wrong bearer token`, async () => {
      vi.stubEnv("CRON_SECRET", "the-real-secret");
      const response = await handler(request("Bearer not-the-secret"));
      expect(response.status).toBe(401);
    });

    it(`${name}: 401s when CRON_SECRET is unset`, async () => {
      vi.stubEnv("CRON_SECRET", "");
      const response = await handler(request("Bearer anything"));
      expect(response.status).toBe(401);
    });
  }
});
