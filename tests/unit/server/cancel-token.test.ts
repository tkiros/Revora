import { describe, expect, it } from "vitest";
import { createCancelToken, verifyCancelToken } from "../../../lib/server/billing/cancel-token";

const SECRET = "test-secret";

describe("cancel token", () => {
  it("round-trips", () => {
    const t = createCancelToken("row-1", Date.now() + 60_000, SECRET);
    expect(verifyCancelToken(t, Date.now(), SECRET)).toEqual({ subRowId: "row-1" });
  });
  it("rejects expiry, tamper, and wrong secret", () => {
    const t = createCancelToken("row-1", Date.now() - 1, SECRET);
    expect(verifyCancelToken(t, Date.now(), SECRET)).toBeNull();
    const good = createCancelToken("row-1", Date.now() + 60_000, SECRET);
    expect(verifyCancelToken(good.slice(0, -2) + "xx", Date.now(), SECRET)).toBeNull();
    expect(verifyCancelToken(good, Date.now(), "other")).toBeNull();
  });
});
