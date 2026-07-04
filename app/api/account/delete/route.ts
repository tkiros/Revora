import { createHash } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getDb, schema, type Db } from "../../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

export const runtime = "nodejs";

/**
 * Account + data deletion (plan 4E). Cancels provider subscriptions
 * best-effort, deletes the user row (every user-linked table cascades),
 * writes an identity-free audit row, and ends the session (DB sessions
 * cascade with the user). Declared publicly at /account/delete.
 */

type DeleteDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  cancelStripeSubscription?: (subscriptionId: string) => Promise<void>;
  now?: () => Date;
};

async function defaultCancelStripe(subscriptionId: string): Promise<void> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return;
  }
  await new Stripe(key).subscriptions.cancel(subscriptionId);
}

export function createAccountDeleteHandler(deps: DeleteDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const cancelStripe = deps.cancelStripeSubscription ?? defaultCancelStripe;
  const now = deps.now ?? (() => new Date());

  return async function POST() {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    const requestedAt = now();

    // Best-effort provider cancellation — deletion must not depend on a
    // provider being reachable. (Play subscriptions cancel via the Play app;
    // the store owns that relationship.)
    const subscriptions = await db()
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, session.userId));

    for (const subscription of subscriptions) {
      if (subscription.provider === "stripe") {
        try {
          await cancelStripe(subscription.providerRef);
        } catch {
          // best-effort only
        }
      }
    }

    // One delete; profiles/checks/subscriptions/push/sessions cascade.
    await db().delete(schema.users).where(eq(schema.users.id, session.userId));

    await db()
      .insert(schema.deletionLog)
      .values({
        userIdHash: createHash("sha256").update(session.userId).digest("hex"),
        requestedAt,
        completedAt: now()
      });

    return NextResponse.json({ ok: true });
  };
}

export const POST = createAccountDeleteHandler();
