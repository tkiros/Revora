import { createHash, randomBytes } from "node:crypto";

/**
 * Order binding is by POSSESSION of the emailed claim token — the same trust
 * model as the magic link itself — never by email equality (aliases, relays,
 * and typos break equality; design doc locked decision 4). The DB stores only
 * sha256(token): a leaked table cannot mint claim links, and lookups hash the
 * presented token before the indexed comparison, so no secret-dependent
 * branching happens on attacker-controlled input.
 */

export function hashClaimToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateClaimToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashClaimToken(token) };
}
