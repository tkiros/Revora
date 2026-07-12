import { createHash } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import {
  deleteBlobUrls,
  deleteUserBlobs,
  type BlobDeleter
} from "../../../../lib/server/blob";
import { getDb, schema, type Db } from "../../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

export const runtime = "nodejs";

/**
 * Account + data deletion (plan 4E). Cancels provider subscriptions
 * best-effort, deletes the user's pantry photos from Blob, deletes the user
 * row (every user-linked table cascades), writes an identity-free audit row,
 * and ends the session (DB sessions cascade with the user). Declared publicly
 * at /account/delete.
 */

type DeleteDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  cancelStripeSubscription?: (subscriptionId: string) => Promise<void>;
  deleteBlobs?: BlobDeleter;
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
  const deleteBlobs = deps.deleteBlobs ?? deleteBlobUrls;
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

    // MUST precede the cascade (N-23): pantry_photos.blob_url is the only
    // pointer to a live Blob object, and `DELETE users` cascades those rows
    // away — after that the photos are unreachable and undeletable forever,
    // which is exactly the "we keep nothing" promise this route exists to keep.
    // Failure is captured, never thrown: the user asked to be deleted and a
    // Blob outage must not block that.
    await deleteUserBlobs(db(), session.userId, deleteBlobs);

    // One delete; profiles/checks/subscriptions/push/sessions/pantry cascade.
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
