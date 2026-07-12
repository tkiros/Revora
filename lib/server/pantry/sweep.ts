import { and, eq, gte, inArray, isNull, lt, or } from "drizzle-orm";

import { reapOrphanBlobs, reapPantryBlobs, type BlobLister } from "../blob";
import { schema } from "../db";
import { generateClaimToken } from "./claims";
import { intakeEmailText } from "./emails";
import {
  deliverReport,
  processPantryOrder,
  type ProcessDeps
} from "./process";

/**
 * Self-healing pass (locked decision 9). Runs hourly; every action is
 * idempotent, so overlapping runs are merely wasteful, never wrong.
 * Founder alerting uses a window check (2h..3h stuck) instead of an
 * alerted_at column — with an hourly cron each order alerts exactly once.
 * ponytail: window-based alert-once; add an alerted_at column if the cron
 * cadence ever changes.
 */

const EXTRACT_DEAD_MS = 15 * 60 * 1000;
const STUCK_MS = 2 * 60 * 60 * 1000;
const ALERT_WINDOW_MS = 60 * 60 * 1000; // one cron interval
const RESUME_BUDGET_MS = 240_000;

export type SweepDeps = ProcessDeps & {
  processOrder?: typeof processPantryOrder;
  /** Injectable so tests never hit the Blob store. Absent → the real lister. */
  listBlobs?: BlobLister;
};

export async function runPantrySweep(deps: SweepDeps): Promise<{
  intakeResent: number;
  resumed: number;
  redelivered: number;
  blobsReaped: number;
  orphansReaped: number;
  alerted: number;
}> {
  const now = deps.now();
  const processOrder = deps.processOrder ?? processPantryOrder;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let intakeResent = 0;
  let resumed = 0;
  let redelivered = 0;
  let alerted = 0;

  // 1. Intake emails that never went out. The raw token only ever existed in
  // the original email attempt — mint a new one (the old hash dies with it).
  const unsent = await deps.db
    .select()
    .from(schema.pantryOrders)
    .where(
      and(
        eq(schema.pantryOrders.status, "paid"),
        isNull(schema.pantryOrders.intakeEmailSentAt)
      )
    );
  for (const order of unsent) {
    const { token, tokenHash } = generateClaimToken();
    await deps.db
      .update(schema.pantryOrders)
      .set({ claimToken: tokenHash, updatedAt: now })
      .where(eq(schema.pantryOrders.id, order.id));
    const message = intakeEmailText(appUrl, token);
    const result = await deps.email.send({ to: order.email, ...message });
    if (result.ok) {
      await deps.db
        .update(schema.pantryOrders)
        .set({ intakeEmailSentAt: now, updatedAt: now })
        .where(eq(schema.pantryOrders.id, order.id));
      intakeResent += 1;
    }
  }

  // 2. Resume processing orders with an expired (or absent) lease.
  const resumable = await deps.db
    .select({ id: schema.pantryOrders.id })
    .from(schema.pantryOrders)
    .where(
      and(
        eq(schema.pantryOrders.status, "processing"),
        or(
          isNull(schema.pantryOrders.processingLeaseUntil),
          lt(schema.pantryOrders.processingLeaseUntil, now)
        )
      )
    );
  for (const order of resumable) {
    await processOrder(deps, order.id, RESUME_BUDGET_MS);
    resumed += 1;
  }

  // 3. A submit request that died mid-extraction leaves "extracting" behind.
  await deps.db
    .update(schema.pantryOrders)
    .set({ status: "needs_manual", updatedAt: now })
    .where(
      and(
        eq(schema.pantryOrders.status, "extracting"),
        lt(schema.pantryOrders.updatedAt, new Date(now.getTime() - EXTRACT_DEAD_MS))
      )
    );

  // 4. Ready but never delivered (email failed at process time).
  const undelivered = await deps.db
    .select()
    .from(schema.pantryOrders)
    .where(
      and(
        eq(schema.pantryOrders.status, "ready"),
        isNull(schema.pantryOrders.deliveredAt)
      )
    );
  for (const order of undelivered) {
    const ok = await deliverReport(deps, { id: order.id, email: order.email });
    if (ok) redelivered += 1;
  }

  // 5. GC: photos whose order is done with them (delivered/canceled/manual) or
  // that are simply older than the retention ceiling — the abandoned orders no
  // terminal state ever covers. Runs AFTER phases 3 and 4 so orders that just
  // became terminal (or just got delivered) are reaped in the same pass, and it
  // doubles as the retry for anything a Blob-API outage left behind: on failure
  // deleteOrderBlobs leaves the rows unmarked, so they match again next hour.
  const blobsReaped = await reapPantryBlobs(deps.db, now, deps.deleteBlobs);

  // 5b. ORPHAN GC: objects the database cannot account for at all. Every phase
  // above starts from `pantry_photos`; an orphan is the object whose row is
  // already gone — the exact thing `DELETE users` used to leave behind, and the
  // exact thing no query over that table can ever find. This walks the store
  // instead, which is why it reclaims the pre-fix orphans nothing else can see.
  // Runs last so the rows the phases above just deleted are already accounted
  // for and never race this pass.
  const orphansReaped = await reapOrphanBlobs(
    deps.db,
    now,
    deps.listBlobs,
    deps.deleteBlobs
  );

  // 6. Founder alert for anything stuck >2h (once, via the window check).
  const stuck = await deps.db
    .select()
    .from(schema.pantryOrders)
    .where(
      and(
        inArray(schema.pantryOrders.status, [
          "submitted",
          "extracting",
          "processing",
          "awaiting_confirm"
        ]),
        lt(schema.pantryOrders.updatedAt, new Date(now.getTime() - STUCK_MS)),
        gte(
          schema.pantryOrders.updatedAt,
          new Date(now.getTime() - STUCK_MS - ALERT_WINDOW_MS)
        )
      )
    );
  if (stuck.length > 0) {
    await deps.email.send({
      to: process.env.SUPPORT_EMAIL ?? "support@revora.bio",
      subject: `Pantry orders stuck >2h: ${stuck.length}`,
      text: stuck
        .map((order) => `${order.id} — ${order.status} since ${order.updatedAt.toISOString()}`)
        .join("\n") + "\n\nHandle via /admin/pantry."
    });
    alerted = stuck.length;
  }

  // 7. Liveness heartbeat for /api/health.
  await deps.db
    .insert(schema.cronHeartbeat)
    .values({ name: "pantry-sweep", lastRunAt: now })
    .onConflictDoUpdate({
      target: schema.cronHeartbeat.name,
      set: { lastRunAt: now }
    });

  return {
    intakeResent,
    resumed,
    redelivered,
    blobsReaped,
    orphansReaped,
    alerted
  };
}
