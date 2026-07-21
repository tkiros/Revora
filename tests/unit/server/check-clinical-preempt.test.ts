import { describe, expect, it, vi } from "vitest";

import { createCheckRouteHandler } from "../../../app/api/check/route";

/**
 * HS-1 regression.
 *
 * Under PAYWALL_MODE=trial (the production default) a signed-in user without an
 * active entitlement is hard-walled with a 402 upsell BEFORE checkFood runs —
 * which means before the deterministic clinical-risk router. A user describing
 * acute symptoms must reach the "see a person" clinical card, never a subscribe
 * prompt. The route now runs classifyClinicalRisk before the wall and lets a
 * clinical match skip it. A clinical match yields only the clinical card (never
 * a meal verdict), so this costs nothing and grants no free check.
 */
function checkRequest(body: unknown): Request {
  return new Request("http://localhost/api/check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("clinical routing preempts the paywall (HS-1)", () => {
  it("returns the clinical card for a signed-in non-premium user in trial mode — no 402, no entitlement query, no model spend", async () => {
    const generate = vi.fn();
    const POST = createCheckRouteHandler({
      getSession: async () => ({ userId: "u1", email: "u@example.com" }),
      paywallMode: () => "trial",
      // A clinical input must never reach the entitlement query...
      db: () => {
        throw new Error("db must not be queried on the clinical preempt path");
      },
      // ...nor the paid model.
      modelFactory: () => ({ generate }) as never,
      emitEvent: () => {}
    });

    const res = await POST(
      checkRequest({
        food: "shaky, sweating and confused, should i eat this donut?",
        a1c: 6
      })
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as { kind: string };
    expect(json.kind).toBe("clinical");
    expect(generate).not.toHaveBeenCalled();
  });
});
