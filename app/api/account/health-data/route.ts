import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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

type HealthDataDeleteDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  deleteBlobs?: BlobDeleter;
};

/**
 * Withdraw stored-health-data consent without deleting the login or billing
 * relationship. The order matters: dependent health rows go first, then the
 * consent-bearing profile. Pantry rows cascade to their photos and items.
 */
export function createHealthDataDeleteHandler(
  deps: HealthDataDeleteDeps = {}
) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const deleteBlobs = deps.deleteBlobs ?? deleteBlobUrls;

  return async function DELETE() {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    // This must precede the order cascade: `pantry_photos.blob_url` is the
    // only pointer to each live object. A Blob failure is best-effort and does
    // not block consent withdrawal, matching full-account deletion behavior.
    await deleteUserBlobs(db(), session.userId, deleteBlobs);
    await db()
      .delete(schema.pantryOrders)
      .where(eq(schema.pantryOrders.userId, session.userId));
    await db()
      .delete(schema.pushSubscriptions)
      .where(eq(schema.pushSubscriptions.userId, session.userId));
    await db()
      .delete(schema.baiWeekly)
      .where(eq(schema.baiWeekly.userId, session.userId));
    // Weekly learning artifacts embed the user's own meal text (encrypted). Like
    // meal memories below, the check cascade would remove them via no FK — this
    // table references only users — so delete them EXPLICITLY on withdrawal.
    await db()
      .delete(schema.weeklyReflections)
      .where(eq(schema.weeklyReflections.userId, session.userId));
    // Meal memories are health-adjacent (encrypted choice/note). The check
    // cascade below already removes them via the memory→check FK, but withdrawal
    // deletes health rows EXPLICITLY rather than relying on FK ordering — the
    // table postdates this handler, so name it here so intent can't silently drift.
    await db()
      .delete(schema.mealMemories)
      .where(eq(schema.mealMemories.userId, session.userId));
    await db()
      .delete(schema.checks)
      .where(eq(schema.checks.userId, session.userId));
    await db()
      .delete(schema.profiles)
      .where(eq(schema.profiles.userId, session.userId));

    return NextResponse.json({ ok: true });
  };
}

export const DELETE = createHealthDataDeleteHandler();
