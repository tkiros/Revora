import { describe, expect, it, vi } from "vitest";

import { createCheckRouteHandler } from "../../../app/api/check/route";

/**
 * RE-01 regression.
 *
 * The entitlement/quota gate used to be ONE fail-open try/catch: any DB error
 * bypassed the trial wall (a paid boundary) straight into paid model spend.
 * The stances are now split — the trial wall fails CLOSED (retry card, no
 * model call), while the legacy courtesy cap keeps failing open (availability
 * first for a free courtesy).
 */
function checkRequest(): Request {
  return new Request("http://localhost/api/check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ food: "greek yogurt with walnuts", a1c: 6 })
  });
}

const throwingDb = () => {
  throw new Error("db down");
};

describe("trial wall failure stance (RE-01)", () => {
  it("fails CLOSED in trial mode: DB error → 503 retry card, zero model spend", async () => {
    const generate = vi.fn();
    const checkFoodImpl = vi.fn();
    const POST = createCheckRouteHandler({
      getSession: async () => ({ userId: "u1", email: "u@example.com" }),
      paywallMode: () => "trial",
      db: throwingDb,
      modelFactory: () => ({ generate }) as never,
      checkFoodImpl: checkFoodImpl as never,
      emitEvent: () => {}
    });

    const res = await POST(checkRequest());

    expect(res.status).toBe(503);
    const json = (await res.json()) as { kind: string };
    expect(json.kind).toBe("retry");
    expect(checkFoodImpl).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
  });

  it("fails OPEN in legacy mode: DB error on the courtesy cap still serves the check", async () => {
    const checkFoodImpl = vi.fn().mockResolvedValue({
      kind: "not_food",
      message: "That's not a meal.",
      disclaimer: "Not medical advice."
    });
    const POST = createCheckRouteHandler({
      getSession: async () => ({ userId: "u1", email: "u@example.com" }),
      paywallMode: () => "legacy",
      db: throwingDb,
      modelFactory: () => ({}) as never,
      checkFoodImpl: checkFoodImpl as never,
      emitEvent: () => {}
    });

    const res = await POST(checkRequest());

    expect(res.status).toBe(200);
    expect(checkFoodImpl).toHaveBeenCalled();
  });
});
