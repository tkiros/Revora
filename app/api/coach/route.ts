import { and, desc, eq, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

import { computeCoachView } from "../../../lib/coach/compute";
import { dayKeyInTimezone, verdictWeekView } from "../../../lib/coach/days";
import { longitudinalInsightsServerEnabled } from "../../../lib/longitudinal-insights-flag";
import { capabilitiesFor } from "../../../lib/server/capabilities";
import { getDb, schema, type Db } from "../../../lib/server/db";
import { getEntitlement } from "../../../lib/server/entitlement";
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
    // Server twin (incident control): derived pattern output can be killed by
    // an env change + redeploy. deriveInsight already honors the build flag;
    // this runtime gate is the one that works without a rebuild.
    if (!longitudinalInsightsServerEnabled()) {
      view.insight = null;
    }

    // Progress/BAI is a premium surface (plan 4D entitlement split). The gate is
    // the single capability matrix (`progress`), not a re-derived tier check, so
    // this route can never fork from lib/server/capabilities (T10 addendum).
    const entitlement = await getEntitlement(db(), session.userId, { now });
    let latestBai = null;
    if (capabilitiesFor(entitlement).progress) {
      const [row] = await db()
        .select()
        .from(schema.baiWeekly)
        .where(eq(schema.baiWeekly.userId, session.userId))
        .orderBy(desc(schema.baiWeekly.weekStart))
        .limit(1);
      if (row) {
        latestBai = {
          weekStart: row.weekStart,
          score: row.score,
          adherence: row.adherence,
          consistency: row.consistency,
          action: row.action,
          prompted: row.prompted
        };
      }
    }

    // C7 (additive): the verdict week strip moved to /journey, which renders
    // from THIS response — the same server-side derivation Home used. Free-
    // computable, so free users get real week facts instead of a page-lock.
    const verdictWeek = verdictWeekView(
      rows,
      dayKeyInTimezone(timezone),
      now()
    );

    return NextResponse.json({
      ...view,
      tier: entitlement.tier,
      latestBai,
      verdictWeek
    });
  };
}

export const GET = createCoachRouteHandler();
