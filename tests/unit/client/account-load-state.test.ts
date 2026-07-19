import { describe, expect, it } from "vitest";

import { resolveAccountLoadState } from "../../../lib/client/account-load-state";

/**
 * Error-state truth for the Account page (plan §7 / global constraint 7). A
 * backend outage must not masquerade as "signed out" or drop the user to
 * free/trial plan copy — both are lies during an outage.
 */
describe("resolveAccountLoadState", () => {
  it("maps a network throw to unavailable, not signed_out", () => {
    expect(resolveAccountLoadState({ outcome: "network" })).toBe("unavailable");
  });

  it("maps a 401 to signed_out", () => {
    expect(
      resolveAccountLoadState({ outcome: "response", ok: false, status: 401 })
    ).toBe("signed_out");
  });

  it("maps a 500 to unavailable, not ready (which would show free/trial copy)", () => {
    expect(
      resolveAccountLoadState({ outcome: "response", ok: false, status: 500 })
    ).toBe("unavailable");
  });

  it("maps a 403 to unavailable", () => {
    expect(
      resolveAccountLoadState({ outcome: "response", ok: false, status: 403 })
    ).toBe("unavailable");
  });

  it("maps a 200 to ready", () => {
    expect(
      resolveAccountLoadState({ outcome: "response", ok: true, status: 200 })
    ).toBe("ready");
  });
});
