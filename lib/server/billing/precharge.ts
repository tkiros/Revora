import { and, eq, gt, isNull, lte } from "drizzle-orm";

import { schema, type Db } from "../db";
import type { SendEmailResult } from "../email";
import { createCancelToken } from "./cancel-token";
import { prechargeEmailText } from "./emails";
import { emitBillingEvent, type BillingTelemetryEvent } from "./telemetry";

/**
 * Task 3.3 — 2-day pre-charge sweep. Runs hourly (45 * * * *), so the
 * "about 2 days before" window is honored to ±1h. Every action is idempotent:
 * a row is emailed once, then stamped, so overlapping runs never double-send.
 * The heartbeat mirrors the pantry-sweep shape (name "trial-precharge") for
 * /api/health liveness.
 */

const WINDOW_MS = 48 * 60 * 60 * 1000;
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Transparency: the exact monthly amount for each price-test variant. Fallback
// mirrors the default $12.99 variant if a row somehow lacks one.
const AMOUNT_DISPLAY: Record<number, string> = {
  999: "$9.99",
  1299: "$12.99",
  1999: "$19.99"
};

export type PrechargeDeps = {
  db: () => Db;
  email: {
    send: (input: {
      to: string;
      subject: string;
      text: string;
    }) => Promise<SendEmailResult>;
  };
  now: () => Date;
  secret?: string;
};

export async function runPrechargeSweep(
  deps: PrechargeDeps
): Promise<{ sent: number }> {
  const db = deps.db();
  const now = deps.now();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let sent = 0;

  // Trialing rows whose free week ends within the next 48h and that have not
  // yet had the pre-charge email stamped. current_period_end > now excludes
  // already-lapsed rows; <= now+48h excludes far-future ones.
  const due = await db
    .select({ sub: schema.subscriptions, email: schema.users.email })
    .from(schema.subscriptions)
    .innerJoin(schema.users, eq(schema.subscriptions.userId, schema.users.id))
    .where(
      and(
        eq(schema.subscriptions.status, "trialing"),
        isNull(schema.subscriptions.preChargeEmailSentAt),
        gt(schema.subscriptions.currentPeriodEnd, now),
        lte(
          schema.subscriptions.currentPeriodEnd,
          new Date(now.getTime() + WINDOW_MS)
        )
      )
    );

  for (const { sub, email } of due) {
    const amountDisplay =
      AMOUNT_DISPLAY[Number(sub.priceVariant)] ?? "$12.99";
    const chargeDateText = sub.currentPeriodEnd.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric"
    });
    const cancelToken = createCancelToken(
      sub.id,
      sub.currentPeriodEnd.getTime() + TOKEN_TTL_MS,
      deps.secret
    );
    const message = prechargeEmailText(
      appUrl,
      amountDisplay,
      chargeDateText,
      cancelToken
    );

    const result = await deps.email.send({ to: email, ...message });
    if (result.ok) {
      // Stamp only on a confirmed send — a failure leaves the row untouched so
      // the next hourly pass retries it.
      await db
        .update(schema.subscriptions)
        .set({ preChargeEmailSentAt: now, updatedAt: now })
        .where(eq(schema.subscriptions.id, sub.id));
      emitBillingEvent({
        name: "precharge_email_sent",
        priceVariant:
          (sub.priceVariant as BillingTelemetryEvent["priceVariant"]) ??
          undefined
      });
      sent += 1;
    }
  }

  // Liveness heartbeat for /api/health (same shape as the pantry sweep).
  await db
    .insert(schema.cronHeartbeat)
    .values({ name: "trial-precharge", lastRunAt: now })
    .onConflictDoUpdate({
      target: schema.cronHeartbeat.name,
      set: { lastRunAt: now }
    });

  return { sent };
}
