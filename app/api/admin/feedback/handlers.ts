import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdmin } from "../../../../lib/server/admin";
import { getDb, schema, type Db } from "../../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

/**
 * Founder-only safety queue action (plan §P1.6). Marks a queued feedback row
 * reviewed. Admin-gated exactly like the pantry ops surface — a non-admin
 * session gets 404 (the surface does not exist for them), never 403.
 */

export type AdminFeedbackDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  now?: () => Date;
};

const ActionSchema = z
  .object({
    feedbackId: z.string().uuid(),
    action: z.enum(["mark_reviewed"])
  })
  .strict();

export function createAdminFeedbackHandler(deps: AdminFeedbackDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const now = deps.now ?? (() => new Date());

  return async function POST(request: Request) {
    const session = await getSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    let parsed;
    try {
      parsed = ActionSchema.safeParse(await request.json());
    } catch {
      parsed = ActionSchema.safeParse(null);
    }
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const updated = await db()
      .update(schema.checkFeedback)
      .set({ reviewStatus: "reviewed", reviewedAt: now() })
      .where(eq(schema.checkFeedback.id, parsed.data.feedbackId))
      .returning({ id: schema.checkFeedback.id });

    if (updated.length === 0) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  };
}
