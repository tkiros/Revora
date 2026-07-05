import { describe, expect, it, vi } from "vitest";
import { emitBillingEvent } from "../../../lib/server/billing/telemetry";

describe("emitBillingEvent", () => {
  it("logs schema-valid JSON to console.info", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    emitBillingEvent({ name: "trial_converted", priceVariant: "1299" });
    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged).toMatchObject({ name: "trial_converted", priceVariant: "1299" });
    expect(logged.environment).toBeDefined();
    spy.mockRestore();
  });

  it("rejects unknown event names", () => {
    expect(() =>
      emitBillingEvent({ name: "made_up" } as never)
    ).toThrow();
  });
});
