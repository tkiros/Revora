import { and, desc, eq, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

import { computeCoachView } from "../../../lib/coach/compute";
import { getDb, schema, type Db } from "../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../lib/server/session";

export const runtime = "nodejs";

type CoachRouteDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  now?: () => Date;
};

export function createCoachRouteHandler(deps: CoachRouteDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const now = deps.now ?? (() => new Date());

  return async function GET() {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    const [profile] = await db()
      .select({ timezone: schema.profiles.timezone })
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, session.userId));

    const timezone = profile?.timezone ?? "America/New_York";

    const since = new Date(now().getTime() - 35 * 24 * 60 * 60 * 1000);
    const rows = await db()
      .select({
        createdAt: schema.checks.createdAt,
        risk: schema.checks.risk,
        actionDoneAt: schema.checks.actionDoneAt
      })
      .from(schema.checks)
      .where(
        and(
          eq(schema.checks.userId, session.userId),
          gte(schema.checks.createdAt, since)
        )
      )
      .orderBy(desc(schema.checks.createdAt))
      .limit(500);

    const view = computeCoachView(rows, timezone, now());

    const [latestBai] = await db()
      .select()
      .from(schema.baiWeekly)
      .where(eq(schema.baiWeekly.userId, session.userId))
      .orderBy(desc(schema.baiWeekly.weekStart))
      .limit(1);

    return NextResponse.json({
      ...view,
      latestBai: latestBai
        ? {
            weekStart: latestBai.weekStart,
            score: latestBai.score,
            adherence: latestBai.adherence,
            consistency: latestBai.consistency,
            action: latestBai.action
          }
        : null
    });
  };
}

export const GET = createCoachRouteHandler();
