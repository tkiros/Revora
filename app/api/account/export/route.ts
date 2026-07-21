import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { safeDecrypt } from "../../../../lib/server/crypto";
import { getDb, schema, type Db } from "../../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

export const runtime = "nodejs";

/**
 * PR-5: full account export. Erasure was verified complete (all 9 health
 * tables), but export wasn't — /api/history/export and /api/memory/export
 * covered checks and meal memories while omitting the exact A1C, the weekly
 * reflections, and the entire pantry corpus. Data-rights export must return
 * everything we hold, so this bundles the missing three (the existing two
 * endpoints stay for their in-page download buttons).
 */
type Deps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  now?: () => Date;
};

export function createAccountExportHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const now = deps.now ?? (() => new Date());

  return async function GET() {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    const [profile] = await db()
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, session.userId));

    const reflections = await db()
      .select()
      .from(schema.weeklyReflections)
      .where(eq(schema.weeklyReflections.userId, session.userId))
      .orderBy(desc(schema.weeklyReflections.weekStart));

    const pantryOrders = await db()
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.userId, session.userId))
      .orderBy(desc(schema.pantryOrders.createdAt));

    const exported = {
      exportedAt: now().toISOString(),
      profile: profile
        ? {
            a1c: safeDecrypt(profile.a1cCiphertext),
            a1cBand: profile.a1cBand,
            timezone: profile.timezone,
            nudgeOptIn: profile.nudgeOptIn,
            consentedAt: profile.consentedAt
          }
        : null,
      weeklyReflections: reflections.map((row) => ({
        weekStart: row.weekStart,
        version: row.version,
        artifact: safeDecrypt(row.artifactCiphertext),
        createdAt: row.createdAt
      })),
      pantryOrders: pantryOrders.map((row) => ({
        status: row.status,
        createdAt: row.createdAt,
        a1cBand: row.a1cBand,
        a1c: row.a1cCiphertext ? safeDecrypt(row.a1cCiphertext) : null,
        notes: row.notesCiphertext ? safeDecrypt(row.notesCiphertext) : null,
        report: row.reportCiphertext ? safeDecrypt(row.reportCiphertext) : null,
        deliveredAt: row.deliveredAt
      })),
      // The other two data sets have dedicated export endpoints; point at
      // them rather than duplicating their (large) payloads here.
      alsoExport: ["/api/history/export", "/api/memory/export"]
    };

    const today = now().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(exported, null, 2), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="revora-account-${today}.json"`
      }
    });
  };
}

export const GET = createAccountExportHandler();
