import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb, schema, type Db } from "../../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

export const runtime = "nodejs";

const SubscribeSchema = z
  .object({
    endpoint: z.string().url().max(1024),
    keys: z
      .object({
        p256dh: z.string().min(1).max(256),
        auth: z.string().min(1).max(256)
      })
      .strict()
  })
  .strict();

const UnsubscribeSchema = z
  .object({ endpoint: z.string().url().max(1024) })
  .strict();

type Deps = { db?: () => Db; getSession?: () => Promise<SessionInfo> };

export function createPushSubscribeHandlers(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;

  return {
    async POST(request: Request) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Sign in first." }, { status: 401 });
      }

      let body: unknown = null;
      try {
        body = await request.json();
      } catch {
        body = null;
      }

      const parsed = SubscribeSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
      }

      await db()
        .insert(schema.pushSubscriptions)
        .values({
          userId: session.userId,
          endpoint: parsed.data.endpoint,
          p256dh: parsed.data.keys.p256dh,
          auth: parsed.data.keys.auth
        })
        .onConflictDoUpdate({
          target: schema.pushSubscriptions.endpoint,
          set: {
            userId: session.userId,
            p256dh: parsed.data.keys.p256dh,
            auth: parsed.data.keys.auth,
            // A refreshed browser subscription supersedes any attempt owned by
            // the old key material. Preserve confirmed daily success, but
            // cancel retry/lease state — unless a send is in flight RIGHT NOW
            // (live lease): wiping its token would turn a delivered `ok` into
            // a recorded failure and allow a duplicate. Same lease predicate
            // as the cron's own clears; key material always updates.
            nudgeAttemptDate: sql`CASE WHEN ${schema.pushSubscriptions.nudgeLeaseUntil} IS NULL OR ${schema.pushSubscriptions.nudgeLeaseUntil} <= now() THEN NULL ELSE ${schema.pushSubscriptions.nudgeAttemptDate} END`,
            nudgeAttemptCount: sql`CASE WHEN ${schema.pushSubscriptions.nudgeLeaseUntil} IS NULL OR ${schema.pushSubscriptions.nudgeLeaseUntil} <= now() THEN 0 ELSE ${schema.pushSubscriptions.nudgeAttemptCount} END`,
            nudgeRetryAfter: sql`CASE WHEN ${schema.pushSubscriptions.nudgeLeaseUntil} IS NULL OR ${schema.pushSubscriptions.nudgeLeaseUntil} <= now() THEN NULL ELSE ${schema.pushSubscriptions.nudgeRetryAfter} END`,
            nudgeLeaseToken: sql`CASE WHEN ${schema.pushSubscriptions.nudgeLeaseUntil} IS NULL OR ${schema.pushSubscriptions.nudgeLeaseUntil} <= now() THEN NULL ELSE ${schema.pushSubscriptions.nudgeLeaseToken} END`,
            nudgeLeaseUntil: sql`CASE WHEN ${schema.pushSubscriptions.nudgeLeaseUntil} IS NULL OR ${schema.pushSubscriptions.nudgeLeaseUntil} <= now() THEN NULL ELSE ${schema.pushSubscriptions.nudgeLeaseUntil} END`
          }
        });

      // Subscribing implies opting in.
      await db()
        .update(schema.profiles)
        .set({ nudgeOptIn: true })
        .where(eq(schema.profiles.userId, session.userId));

      return NextResponse.json({ ok: true });
    },

    async DELETE(request: Request) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Sign in first." }, { status: 401 });
      }

      let body: unknown = null;
      try {
        body = await request.json();
      } catch {
        body = null;
      }

      const parsed = UnsubscribeSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
      }

      await db()
        .delete(schema.pushSubscriptions)
        .where(
          and(
            eq(schema.pushSubscriptions.userId, session.userId),
            eq(schema.pushSubscriptions.endpoint, parsed.data.endpoint)
          )
        );

      await db()
        .update(schema.profiles)
        .set({ nudgeOptIn: false })
        .where(eq(schema.profiles.userId, session.userId));

      return NextResponse.json({ ok: true });
    }
  };
}

const handlers = createPushSubscribeHandlers();
export const POST = handlers.POST;
export const DELETE = handlers.DELETE;
