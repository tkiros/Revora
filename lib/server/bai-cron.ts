import { and, eq, gte } from "drizzle-orm";

import { computeBai } from "../coach/bai";
import { dayKeyInTimezone } from "../coach/days";
import { getEntitlement } from "./entitlement";
import { schema, type Db } from "./db";
import { recordHeartbeat } from "./heartbeat";

/**
 * Weekly BAI compute (plan P6). Monday cron (vercel.json "30 4 * * 1"):
 * for every premium user, compute the PRIOR Mon–Sun week's Behavioral
 * Adherence Index in the user's profile timezone and upsert it into
 * `bai_weekly`. Mirrors the nudge cron's shape (lib/server/nudge.ts) —
 * enumerate profiles, gate on entitlement, fail-soft per user.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
// Wide enough to always contain the prior 7-day week for any IANA timezone
// offset (max UTC+14/-12) plus slack, without needing tz-aware instant math.
const LOOKBACK_DAYS = 21;

function keyToUtcMidnight(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

function addDaysToKey(key: string, days: number): string {
  const date = keyToUtcMidnight(key);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * The Monday..Sunday key range of the most recently COMPLETED local week,
 * relative to `now` in `timezone`. Pure calendar-day arithmetic on the
 * "YYYY-MM-DD" keys dayKeyInTimezone already produces — no tz-aware Date
 * instants are constructed, so this works for any IANA timezone.
 */
export function priorWeekRange(
  now: Date,
  timezone: string
): { weekStart: string; weekEnd: string } {
  const todayKey = dayKeyInTimezone(timezone)(now);
  // Calendar weekday of a UTC-midnight Date built from the key is accurate
  // for that calendar date regardless of the real timezone (0=Sun..6=Sat).
  const weekdayUtc = keyToUtcMidnight(todayKey).getUTCDay();
  const daysSinceMonday = (weekdayUtc + 6) % 7;

  const weekStart = addDaysToKey(todayKey, -(daysSinceMonday + 7));
  const weekEnd = addDaysToKey(weekStart, 6);

  return { weekStart, weekEnd };
}

export type BaiCronDeps = {
  now?: () => Date;
};

export async function runBaiWeeklyCron(
  db: Db,
  deps: BaiCronDeps = {}
): Promise<{ computed: number; skipped: number }> {
  const now = deps.now?.() ?? new Date();
  let computed = 0;
  let skipped = 0;

  const profiles = await db
    .select({
      userId: schema.profiles.userId,
      timezone: schema.profiles.timezone
    })
    .from(schema.profiles);

  for (const profile of profiles) {
    const entitlement = await getEntitlement(db, profile.userId, {
      now: () => now
    });
    if (entitlement.tier !== "premium") {
      skipped += 1;
      continue;
    }

    const { weekStart, weekEnd } = priorWeekRange(now, profile.timezone);
    const dayKey = dayKeyInTimezone(profile.timezone);

    const since = new Date(now.getTime() - LOOKBACK_DAYS * MS_PER_DAY);
    const rows = await db
      .select({
        createdAt: schema.checks.createdAt,
        risk: schema.checks.risk,
        actionDoneAt: schema.checks.actionDoneAt
      })
      .from(schema.checks)
      .where(
        and(eq(schema.checks.userId, profile.userId), gte(schema.checks.createdAt, since))
      );

    const weekChecks = rows.filter((row) => {
      const key = dayKey(row.createdAt);
      return key >= weekStart && key <= weekEnd;
    });

    const result = computeBai(weekChecks, profile.timezone);

    await db
      .insert(schema.baiWeekly)
      .values({
        userId: profile.userId,
        weekStart,
        score: result.score,
        adherence: result.adherence,
        consistency: result.consistency,
        action: result.action,
        prompted: result.promptedCount,
        computedAt: now
      })
      .onConflictDoUpdate({
        target: [schema.baiWeekly.userId, schema.baiWeekly.weekStart],
        set: {
          score: result.score,
          adherence: result.adherence,
          consistency: result.consistency,
          action: result.action,
          prompted: result.promptedCount,
          computedAt: now
        }
      });

    computed += 1;
  }

  await recordHeartbeat(db, "bai-weekly", now);

  return { computed, skipped };
}
