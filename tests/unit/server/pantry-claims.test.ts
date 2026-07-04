import { describe, expect, it } from "vitest";

import {
  generateClaimToken,
  hashClaimToken
} from "../../../lib/server/pantry/claims";

describe("pantry claim tokens", () => {
  it("generates a 32-byte base64url token whose hash round-trips", () => {
    const { token, tokenHash } = generateClaimToken();
    expect(Buffer.from(token, "base64url").length).toBe(32);
    expect(tokenHash).toBe(hashClaimToken(token));
    expect(tokenHash).not.toContain(token);
    expect(/^[a-f0-9]{64}$/.test(tokenHash)).toBe(true);
  });

  it("is unique per call", () => {
    const seen = new Set(
      Array.from({ length: 50 }, () => generateClaimToken().token)
    );
    expect(seen.size).toBe(50);
  });

  it("hashing is deterministic and input-sensitive", () => {
    expect(hashClaimToken("abc")).toBe(hashClaimToken("abc"));
    expect(hashClaimToken("abc")).not.toBe(hashClaimToken("abd"));
  });
});
