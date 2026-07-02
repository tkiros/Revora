import { and, desc, eq, gte, inArray } from "drizzle-orm";

import { dayKeyInTimezone } from "../coach/days";
import { schema, type Db } from "./db";

/**
 * Unified entitlement (plan 4D / docs/adr/billing.md). One read path over
 * the one `subscriptions` table — the rest of the app never knows which
 * provider granted premium. Verify-on-read heals stale Play rows when RTDN
 * was missed; the webhook is an optimization, not a correctness dependency.
 */

export const FREE_DAILY_CHECKS = 5;

export type Entitlement = {
  tier: "free" | "premium";
  source: "play" | "stripe" | null;
};

export type PlayRefreshResult = {
  status: "active" | "canceled" | "grace" | "expired" | "refunded";
  currentPeriodEnd: Date;
};

export type EntitlementDeps = {
  now?: () => Date;
  // Injected Play Developer API lookup (lib/server/play-api.ts in prod).
  refreshPlaySubscription?: (
    purchaseToken: string
  ) => Promise<PlayRefreshResult>;
};

// 'canceled' still counts until the paid-through date; grace is honored.
const PREMIUM_STATUSES = ["active", "grace", "canceled"] as const;

export async function getEntitlement(
  db: Db,
  userId: string,
  deps: EntitlementDeps = {}
): Promise<Entitlement> {
  const now = deps.now?.() ?? new Date();

  const rows = await db
    .select()
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.userId, userId),
        inArray(schema.subscriptions.status, [...PREMIUM_STATUSES])
      )
    )
    .orderBy(desc(schema.subscriptions.currentPeriodEnd));

  for (const row of rows) {
    if (row.currentPeriodEnd > now) {
      return { tier: "premium", source: row.provider };
    }

    // Stale Play row: RTDN may have been missed — verify on read and heal.
    if (row.provider === "play" && deps.refreshPlaySubscription) {
      try {
        const fresh = await deps.refreshPlaySubscription(row.providerRef);
        await db
          .update(schema.subscriptions)
          .set({
            status: fresh.status,
            currentPeriodEnd: fresh.currentPeriodEnd,
            updatedAt: now
          })
          .where(eq(schema.subscriptions.id, row.id));

        if (
          (PREMIUM_STATUSES as readonly string[]).includes(fresh.status) &&
          fresh.currentPeriodEnd > now
        ) {
          return { tier: "premium", source: "play" };
        }
      } catch {
        // Play API unreachable: fail toward free — never grant on a guess.
      }
    }
  }

  return { tier: "free", source: null };
}

/** Server-side free-tier metering: result-checks stored today (profile tz). */
export async function countChecksToday(
  db: Db,
  userId: string,
  timezone: string,
  now: Date = new Date()
): Promise<number> {
  const dayKey = dayKeyInTimezone(timezone);
  const todayKey = dayKey(now);

  // Fetch the last 48h and bucket precisely in the user's timezone — cheaper
  // than shipping tz math into SQL and exact at day boundaries.
  const since = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const rows = await db
    .select({ createdAt: schema.checks.createdAt })
    .from(schema.checks)
    .where(
      and(
        eq(schema.checks.userId, userId),
        gte(schema.checks.createdAt, since)
      )
    );

  return rows.filter((row) => dayKey(row.createdAt) === todayKey).length;
}
