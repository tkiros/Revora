import { describe, expect, it } from "vitest";

import {
  resolveProgressState,
  shouldShowBai,
  type CoachFetchResult
} from "../../../lib/coach/progress-state";

/**
 * Error-state truth for the Progress page (plan §P2.5 / global constraint 7).
 * A backend failure must never render as the Premium upsell. Only a successful,
 * well-formed response may produce free/empty/ready.
 */

const premiumBai = {
  weekStart: "2026-06-29",
  score: 72,
  adherence: 71,
  consistency: 60,
  action: 100,
  prompted: 5
};

function response(
  status: number,
  body: unknown,
  ok = status >= 200 && status < 300
): CoachFetchResult {
  return { outcome: "response", ok, status, body };
}

describe("resolveProgressState", () => {
  it("maps a network throw to unavailable, not the upsell", () => {
    expect(resolveProgressState({ outcome: "network" })).toEqual({
      state: "unavailable",
      latestBai: null,
      verdictWeek: null,
      insight: null
    });
  });

  it("maps a 500 to unavailable, not the upsell", () => {
    expect(resolveProgressState(response(500, { error: "boom" }))).toEqual({
      state: "unavailable",
      latestBai: null,
      verdictWeek: null,
      insight: null
    });
  });

  it("maps other non-2xx (403/404) to unavailable, never free/locked", () => {
    expect(resolveProgressState(response(403, null)).state).toBe("unavailable");
    expect(resolveProgressState(response(404, null)).state).toBe("unavailable");
  });

  it("maps malformed JSON on a 200 to unavailable, not ready/free", () => {
    // body === null models `await response.json()` having thrown.
    expect(resolveProgressState(response(200, null)).state).toBe("unavailable");
    expect(resolveProgressState(response(200, "not-an-object")).state).toBe(
      "unavailable"
    );
  });

  it("maps 401 to unauthenticated (sign-in), not the upsell", () => {
    expect(resolveProgressState(response(401, { error: "Sign in first." }))).toEqual(
      { state: "unauthenticated", latestBai: null, verdictWeek: null, insight: null }
    );
  });

  it("maps a 200 free tier to the free upsell", () => {
    expect(
      resolveProgressState(response(200, { tier: "free", latestBai: null }))
    ).toEqual({ state: "free", latestBai: null, verdictWeek: null, insight: null });
  });

  it("maps a 200 premium with no computed week to empty", () => {
    expect(
      resolveProgressState(response(200, { tier: "premium", latestBai: null }))
    ).toEqual({ state: "empty", latestBai: null, verdictWeek: null, insight: null });
  });

  it("maps a 200 premium with a computed week to ready and carries the BAI", () => {
    expect(
      resolveProgressState(
        response(200, { tier: "premium", latestBai: premiumBai })
      )
    ).toEqual({
      state: "ready",
      latestBai: premiumBai,
      verdictWeek: null,
      insight: null
    });
  });

  it("treats a premium response with a malformed BAI shape as empty, not a crash", () => {
    expect(
      resolveProgressState(
        response(200, { tier: "premium", latestBai: { weekStart: "x" } })
      ).state
    ).toBe("empty");
  });

  // C7: week facts + insight are free-computable and ride every well-formed
  // success — the free /journey shows real content, never a full-page lock.
  const verdictWeek = [
    { key: "2026-07-13", checked: true, risk: "SAFE" },
    { key: "2026-07-14", checked: false, risk: null }
  ];
  const insight = { id: "i1", text: "Lunches carry your salt." };

  it("carries verdictWeek and insight on a free-tier 200", () => {
    expect(
      resolveProgressState(
        response(200, { tier: "free", latestBai: null, verdictWeek, insight })
      )
    ).toEqual({ state: "free", latestBai: null, verdictWeek, insight });
  });

  it("carries verdictWeek and insight on a premium 200", () => {
    expect(
      resolveProgressState(
        response(200, { tier: "premium", latestBai: premiumBai, verdictWeek, insight })
      )
    ).toEqual({ state: "ready", latestBai: premiumBai, verdictWeek, insight });
  });

  it("normalizes malformed verdictWeek/insight to null instead of crashing", () => {
    const resolved = resolveProgressState(
      response(200, {
        tier: "free",
        latestBai: null,
        verdictWeek: [{ checked: true }], // missing key
        insight: { id: "i1" } // missing text
      })
    );
    expect(resolved.verdictWeek).toBeNull();
    expect(resolved.insight).toBeNull();
  });

  it("normalizes an unknown risk value to null within an otherwise valid week", () => {
    const resolved = resolveProgressState(
      response(200, {
        tier: "free",
        latestBai: null,
        verdictWeek: [{ key: "2026-07-13", checked: true, risk: "BANANAS" }]
      })
    );
    expect(resolved.verdictWeek).toEqual([
      { key: "2026-07-13", checked: true, risk: null }
    ]);
  });
});

describe("shouldShowBai — BAI fallback vs learning summary (U10)", () => {
  it("shows BAI whenever the learning flag is off, regardless of summary state", () => {
    expect(shouldShowBai(false, true)).toBe(true);
    expect(shouldShowBai(false, false)).toBe(true);
  });

  it("suppresses BAI when the flag is on AND the summary actually rendered", () => {
    expect(shouldShowBai(true, true)).toBe(false);
  });

  it("falls back to BAI when the flag is on but the summary rendered nothing (guest/not-premium/flag-off self-null)", () => {
    expect(shouldShowBai(true, false)).toBe(true);
  });
});
