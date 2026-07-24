/**
 * Sign-in identifier canonicalization (AUD-024, defense in depth).
 *
 * GHSA-7rqj-j65f-68wh: @auth/core's defaultNormalizer split the identifier on
 * the first ASCII "@" BEFORE any Unicode normalization, so an address carrying
 * a Unicode look-alike separator could normalize into a different mailbox than
 * the one the token was stored against. The dependency is upgraded to the
 * patched release; this normalizer stays wired anyway so the guarantee is
 * ours, not the dependency's.
 *
 * Rules: NFKC-normalize first (collapses fullwidth/compatibility forms —
 * including "＠" → "@"), lowercase, trim, then require exactly one ASCII "@"
 * with a non-empty local part and a dotted domain, and no whitespace or
 * control characters anywhere. Anything else throws — Auth.js surfaces its
 * error page and no token is created or emailed.
 */
export function normalizeSigninIdentifier(identifier: string): string {
  const normalized = identifier.normalize("NFKC").trim().toLowerCase();

  // eslint-disable-next-line no-control-regex
  if (/[\s\u0000-\u001f\u007f]/.test(normalized)) {
    throw new Error("Invalid sign-in email address.");
  }

  const parts = normalized.split("@");
  if (parts.length !== 2) {
    throw new Error("Invalid sign-in email address.");
  }

  const [local, domain] = parts;
  if (!local || !domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    throw new Error("Invalid sign-in email address.");
  }

  return `${local}@${domain}`;
}
