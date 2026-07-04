import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitReason = "per_ip" | "daily_cap";

export type RateLimitDecision =
  | { ok: true }
  | { ok: false; reason: RateLimitReason; retryAfterSeconds: number };

export type RateLimitDeps = {
  limitIp(ip: string): Promise<{ success: boolean; resetMs: number }>;
  incrDailyCount(): Promise<number>;
  dailyCap: number;
};

const DEFAULT_DAILY_CAP = 2_000;

/**
 * Pure decision logic — no network. Order: per-IP first; only IP-allowed
 * requests touch the global daily counter (so an IP-blocked flood cannot trip
 * the global pause for everyone). Fails OPEN on any store error — the OpenAI
 * dashboard hard cap is the true cost ceiling.
 * ponytail: fail-open trades a small abuse window for availability; tighten to
 * fail-closed here only if logs show the open path is being exploited.
 */
export async function evaluateRateLimit(
  ip: string,
  deps: RateLimitDeps
): Promise<RateLimitDecision> {
  try {
    const ipResult = await deps.limitIp(ip);
    if (!ipResult.success) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((ipResult.resetMs - Date.now()) / 1_000)
      );
      return { ok: false, reason: "per_ip", retryAfterSeconds };
    }

    const dailyCount = await deps.incrDailyCount();
    if (dailyCount > deps.dailyCap) {
      return { ok: false, reason: "daily_cap", retryAfterSeconds: 3_600 };
    }

    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * True when the Upstash store is configured (both env vars present). Cheap —
 * no allocation, no network, cannot throw — so it is safe on hot paths like the
 * health probe. This is the merge-gate signal: the middleware fails CLOSED on a
 * public deploy only when these are ABSENT. (URL *validity* is a separate
 * concern the limiter fails open on; presence is what we report.)
 */
export function isRateLimitConfigured(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return Boolean(
    env.UPSTASH_REDIS_REST_URL?.trim() && env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}

/**
 * Build the live Upstash-backed deps. Returns null when Upstash env is absent
 * so the caller can decide (dev: skip limiting; prod: fail closed).
 */
export function createRateLimitDeps(
  env: NodeJS.ProcessEnv = process.env
): RateLimitDeps | null {
  const url = env.UPSTASH_REDIS_REST_URL?.trim();
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  const ipLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    prefix: "revora:ip",
    analytics: false
  });

  const parsedCap = Number(env.REVORA_DAILY_CHECK_CAP);
  const dailyCap =
    Number.isFinite(parsedCap) && parsedCap > 0 ? parsedCap : DEFAULT_DAILY_CAP;

  return {
    async limitIp(ip) {
      const result = await ipLimiter.limit(ip);
      return { success: result.success, resetMs: result.reset };
    },
    async incrDailyCount() {
      const day = new Date().toISOString().slice(0, 10);
      const key = `revora:daily:${day}`;
      const pipeline = redis.pipeline();
      pipeline.incr(key);
      pipeline.expire(key, 172_800); // 48h — survives timezone edges
      const [count] = (await pipeline.exec()) as [number, number];
      return count;
    },
    dailyCap
  };
}
