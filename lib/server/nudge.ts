import { eq } from "drizzle-orm";

import { dayKeyInTimezone, hourInTimezone } from "../coach/days";
import { getEntitlement } from "./entitlement";
import { schema, type Db } from "./db";

/**
 * The daily nudge (plan P5): one gentle push per user per local day, only
 * for opted-in premium users at their chosen hour who haven't checked yet.
 * The hourly cron calls runNudgeCron; sending is injected (web-push in prod).
 */

// Rotated calm variants — covered by the banned-phrase audit in nudge.test.ts.
export const NUDGE_COPY_BANK = [
  "Ready for today? Check your first meal.",
  "One calm check before you eat — that's the whole habit.",
  "What's on your plate today? Revora is ready when you are.",
  "A quick check before your next meal keeps the day easy."
] as const;

export type PushSendResult = "ok" | "gone" | "error";

export type NudgeDeps = {
  now?: () => Date;
  send: (
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: string
  ) => Promise<PushSendResult>;
};

export async function runNudgeCron(
  db: Db,
  deps: NudgeDeps
): Promise<{ sent: number; pruned: number; skipped: number }> {
  const now = deps.now?.() ?? new Date();
  let sent = 0;
  let pruned = 0;
  let skipped = 0;

  const candidates = await db
    .select({
      userId: schema.profiles.userId,
      timezone: schema.profiles.timezone,
      nudgeHour: schema.profiles.nudgeHour
    })
    .from(schema.profiles)
    .where(eq(schema.profiles.nudgeOptIn, true));

  for (const candidate of candidates) {
    const localHour = hourInTimezone(candidate.timezone)(now);
    if (localHour !== candidate.nudgeHour) {
      skipped += 1;
      continue;
    }

    const dayKey = dayKeyInTimezone(candidate.timezone);
    const todayKey = dayKey(now);

    const subscriptions = await db
      .select()
      .from(schema.pushSubscriptions)
      .where(eq(schema.pushSubscriptions.userId, candidate.userId));

    const due = subscriptions.filter(
      (subscription) => subscription.lastNudgeDate !== todayKey
    );
    if (due.length === 0) {
      skipped += 1;
      continue;
    }

    // Checked today already? The nudge's whole job is done.
    const recent = await db
      .select({ createdAt: schema.checks.createdAt })
      .from(schema.checks)
      .where(eq(schema.checks.userId, candidate.userId));
    if (recent.some((row) => dayKey(row.createdAt) === todayKey)) {
      skipped += 1;
      continue;
    }

    const entitlement = await getEntitlement(db, candidate.userId, {
      now: () => now
    });
    if (entitlement.tier !== "premium") {
      skipped += 1;
      continue;
    }

    // Deterministic rotation by day so all of a user's devices say the same
    // thing (and tests stay stable).
    const dayNumber = Number(todayKey.replace(/-/g, ""));
    const body = NUDGE_COPY_BANK[dayNumber % NUDGE_COPY_BANK.length];
    const payload = JSON.stringify({ title: "Revora", body });

    for (const subscription of due) {
      const result = await deps.send(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth }
        },
        payload
      );

      if (result === "gone") {
        await db
          .delete(schema.pushSubscriptions)
          .where(eq(schema.pushSubscriptions.id, subscription.id));
        pruned += 1;
        continue;
      }

      // Stamp even on transient errors: skip, never risk a double-send on
      // the next hourly tick (incident-runbook stance).
      await db
        .update(schema.pushSubscriptions)
        .set({ lastNudgeDate: todayKey })
        .where(eq(schema.pushSubscriptions.id, subscription.id));

      if (result === "ok") {
        sent += 1;
      }
    }
  }

  return { sent, pruned, skipped };
}
