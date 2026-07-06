import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless one-tap cancel link auth. The token's ONLY power is
// cancel-at-period-end on one subscription row — it can never charge, read,
// or extend anything. ponytail: worst-case misuse cancels a trial early;
// acceptable, no column or table needed.
function secretOrThrow(secret?: string): string {
  const value = secret ?? process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set.");
  return value;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createCancelToken(
  subRowId: string,
  expiresAtMs: number,
  secret?: string
): string {
  const payload = `${subRowId}.${expiresAtMs}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload, secretOrThrow(secret))}`;
}

export function verifyCancelToken(
  token: string,
  now: number = Date.now(),
  secret?: string
): { subRowId: string } | null {
  const [encoded, mac] = token.split(".");
  if (!encoded || !mac) return null;
  const payload = Buffer.from(encoded, "base64url").toString("utf8");
  const expected = sign(payload, secretOrThrow(secret));
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const dot = payload.lastIndexOf(".");
  const subRowId = payload.slice(0, dot);
  const expiresAt = Number(payload.slice(dot + 1));
  if (!subRowId || !Number.isFinite(expiresAt) || expiresAt < now) return null;
  return { subRowId };
}
