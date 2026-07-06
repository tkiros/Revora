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

export type RateLimitConfigState = "configured" | "invalid" | "unconfigured";

/**
 * Config-state probe for the health endpoint and the deps factory. Cheap — no
 * allocation, no network, cannot throw. Three states:
 *   - "unconfigured": either env var absent (middleware fails CLOSED on public
 *     deploys — the merge-gate signal).
 *   - "invalid": both present but the URL is not the https:// REST endpoint
 *     (classic mistake: pasting the rediss:// TCP URL — this took prod down
 *     once, with health reading green; see 2026-07-06 launch audit BUG-01/07).
 *   - "configured": present and plausibly a REST URL.
 */
export function rateLimitConfigState(
  env: NodeJS.ProcessEnv = process.env
): RateLimitConfigState {
  const url = env.UPSTASH_REDIS_REST_URL?.trim();
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return "unconfigured";
  return url.startsWith("https://") ? "configured" : "invalid";
}

/**
 * True only when the Upstash config is present AND the URL scheme is valid.
 * (Reachability is still a separate concern the limiter fails open on.)
 */
export function isRateLimitConfigured(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return rateLimitConfigState(env) === "configured";
}

/**
 * Build the live Upstash-backed deps. Returns null — NEVER throws — when the
 * Upstash env is absent, invalid, or client construction fails, so the caller
 * can decide (dev: skip limiting; public deploy: fail closed with the designed
 * 503). This runs at middleware module scope: a throw here becomes a platform
 * MIDDLEWARE_INVOCATION_FAILED 500 on every matched request (launch audit
 * BUG-01), which is exactly what the null contract prevents.
 */
export function createRateLimitDeps(
  env: NodeJS.ProcessEnv = process.env
): RateLimitDeps | null {
  if (rateLimitConfigState(env) !== "configured") return null;
  const url = env.UPSTASH_REDIS_REST_URL!.trim();
  const token = env.UPSTASH_REDIS_REST_TOKEN!.trim();

  try {
    const redis = new Redis({ url, token });
    const ipLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      prefix: "revora:ip",
      analytics: false
    });

    const parsedCap = Number(env.REVORA_DAILY_CHECK_CAP);
    const dailyCap =
      Number.isFinite(parsedCap) && parsedCap > 0
        ? parsedCap
        : DEFAULT_DAILY_CAP;

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
  } catch {
    return null;
  }
}
