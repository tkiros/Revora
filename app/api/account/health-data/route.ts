import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb, schema, type Db } from "../../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

export const runtime = "nodejs";

type HealthDataDeleteDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
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

  return async function DELETE() {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    await db()
      .delete(schema.pantryOrders)
      .where(eq(schema.pantryOrders.userId, session.userId));
    await db()
      .delete(schema.pushSubscriptions)
      .where(eq(schema.pushSubscriptions.userId, session.userId));
    await db()
      .delete(schema.baiWeekly)
      .where(eq(schema.baiWeekly.userId, session.userId));
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
