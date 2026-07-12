import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Constant-time secret comparison for every shared-secret door in the app
 * (cron bearer tokens, the Play RTDN token, the reviewer-signin secret).
 *
 * Both sides are SHA-256'd first so the buffers `timingSafeEqual` compares are
 * always the same fixed length (32 bytes) regardless of the raw secret's
 * length — `timingSafeEqual` itself throws on a length mismatch, and a plain
 * `!==` on the raw strings would leak the correct secret's length and matching
 * prefix through response timing (N-29).
 *
 * Node-only (`node:crypto`): every caller is a `runtime = "nodejs"` route. The
 * Edge proxy must never import this.
 */
export function timingSafeEqualSecret(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  // A missing expected secret can never match — checked before hashing so an
  // unset env var is a hard "no", never an empty-string-equals-empty-string yes.
  if (!a || !b) {
    return false;
  }
  const hashA = createHash("sha256").update(a, "utf8").digest();
  const hashB = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(hashA, hashB);
}

/**
 * The cron doorway: every `app/api/cron/*` route authenticates the Vercel Cron
 * invoker with `Authorization: Bearer $CRON_SECRET`. Returns false when
 * CRON_SECRET is unset, so an unconfigured deploy cannot be swept by anyone.
 */
export function isAuthorizedCron(
  authorization: string | null,
  secret: string | undefined = process.env.CRON_SECRET
): boolean {
  if (!secret || !authorization?.startsWith("Bearer ")) {
    return false;
  }
  return timingSafeEqualSecret(authorization.slice("Bearer ".length), secret);
}
