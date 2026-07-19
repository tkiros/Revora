import { describe, expect, it } from "vitest";

import { GET } from "../../../app/api/paywall/route";
import { PaywallConfigSchema } from "../../../lib/client/paywall-config";

// Contract test (Task 7): the /api/paywall body must satisfy the exact zod
// schema the client validates against. If the route ever drops a field or
// changes a shape, the client would fall back to its pending/retry state — so
// this test is the tripwire that keeps the server contract and the client
// parser in lockstep.
describe("GET /api/paywall — server commercial contract", () => {
  it("returns a body that passes the client's zod schema", async () => {
    const response = await GET();
    const body = await response.json();
    const parsed = PaywallConfigSchema.safeParse(body);
    expect(parsed.success).toBe(true);
  });

  it("emits a valid mode and a price display, never a bare/partial body", async () => {
    const body = await (await GET()).json();
    expect(["legacy", "trial"]).toContain(body.mode);
    expect(["999", "1299", "1999"]).toContain(body.variant);
    expect(typeof body.priceDisplay).toBe("string");
    expect(body.priceDisplay.startsWith("$")).toBe(true);
    // Annual is present-or-null; both are valid, but the key must exist so the
    // client can distinguish "no annual" from "malformed".
    expect(body).toHaveProperty("annualDisplay");
    expect(body).toHaveProperty("annualMonthlyEquivalent");
  });

  it("defaults to trial mode when PAYWALL_MODE is unset (behavior unchanged)", async () => {
    const priorMode = process.env.PAYWALL_MODE;
    delete process.env.PAYWALL_MODE;
    try {
      const body = await (await GET()).json();
      expect(body.mode).toBe("trial");
    } finally {
      if (priorMode !== undefined) {
        process.env.PAYWALL_MODE = priorMode;
      }
    }
  });
});
