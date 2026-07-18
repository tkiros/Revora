import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb, schema, type Db } from "../../../../lib/server/db";
import {
  defaultProcessDeps,
  processPantryOrder,
  type ProcessDeps
} from "../../../../lib/server/pantry/process";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";
import { isAuthorizedCron } from "../../../../lib/server/timing-safe";

export const runtime = "nodejs";
// Judging ≤40 items sequentially needs the plan's 300s ceiling (Vercel Pro).
export const maxDuration = 300;

const BodySchema = z.object({ orderId: z.string().uuid() }).strict();

type Deps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  makeProcessDeps?: (db: Db) => ProcessDeps;
};

export function createPantryProcessHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const makeProcessDeps = deps.makeProcessDeps ?? defaultProcessDeps;

  return async function POST(request: Request) {
    // Same timing-safe doorway as every app/api/cron/* route (unset secret ⇒
    // never cron; a plain === compare here was the one non-constant-time
    // secret check in the tree).
    const isCron = isAuthorizedCron(request.headers.get("authorization"));

    let parsed;
    try {
      parsed = BodySchema.safeParse(await request.json());
    } catch {
      parsed = BodySchema.safeParse(null);
    }
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (!isCron) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Sign in first." }, { status: 401 });
      }
      const [order] = await db()
        .select({ id: schema.pantryOrders.id })
        .from(schema.pantryOrders)
        .where(
          and(
            eq(schema.pantryOrders.id, parsed.data.orderId),
            eq(schema.pantryOrders.userId, session.userId)
          )
        );
      if (!order) {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }
    }

    const result = await processPantryOrder(
      makeProcessDeps(db()),
      parsed.data.orderId
    );
    return NextResponse.json(result, { status: 202 });
  };
}

export const POST = createPantryProcessHandler();
