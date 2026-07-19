import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { learningJourneyServerEnabled } from "../../../lib/learning-journey-flag";
import {
  applyAction,
  completedStages,
  currentDay,
  currentStage,
  isComplete,
  JourneyTransitionError,
  NOT_STARTED,
  type Journey,
  type JourneyAction
} from "../../../lib/journey/state";
import { STAGE_DESCRIPTORS, stageDescriptor } from "../../../lib/journey/stages";
import { captureServerError } from "../../../lib/revora/sentry-capture";
import { capabilitiesFor } from "../../../lib/server/capabilities";
import { getDb, schema, type Db } from "../../../lib/server/db";
import {
  getEntitlement,
  type Entitlement
} from "../../../lib/server/entitlement";
import { getSessionInfo, type SessionInfo } from "../../../lib/server/session";

/**
 * Learning Journey API (plan §P4.1, §8 entity `learning_journeys`).
 *
 * GET returns the caller's current journey with the DERIVED stage + day (never a
 * stored stage — lib/journey/state.ts is the single source), plus the stage
 * descriptor copy. POST applies one explicit action (start/pause/resume/
 * graduate/maintenance) through the same pure state machine, server-side.
 *
 * The UI exposes only start/pause/resume today (Task 20 wires graduate/
 * maintenance + pause reasons), but the endpoint accepts the full action set so
 * the state machine is complete and testable end to end.
 *
 * Gate order is identical to every other Phase 3/4 route (flag 404 → 401 → 403):
 *   1. server flag OFF  → 404  (feature not in this build; endpoint inert until
 *      an approved rollout — global constraint §10)
 *   2. no session       → 401
 *   3. not entitled     → 403  (the journey is premium — `weeklyLearning` in the
 *      single capability matrix, lib/server/capabilities.ts; UI renders from this,
 *      never UI-only gating — global constraint §6)
 *
 * Illegal transitions are a 409 (not a 400): the request was well-formed, the
 * state just didn't allow it — "no hidden reset" means an out-of-order action is
 * refused, never silently absorbed.
 */

export type JourneyRouteDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  entitlementOf?: (db: Db, userId: string) => Promise<Entitlement>;
  now?: () => Date;
  env?: { LEARNING_JOURNEY_ENABLED?: string };
};

export const JOURNEY_ACTIONS = [
  "start",
  "pause",
  "resume",
  "graduate",
  "maintenance"
] as const satisfies readonly JourneyAction[];

const JourneyActionSchema = z
  .object({ action: z.enum(JOURNEY_ACTIONS) })
  .strict();

function unauthorized() {
  return NextResponse.json({ error: "Sign in first." }, { status: 401 });
}

function notFound() {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden." }, { status: 403 });
}

async function serverError(error: unknown) {
  await captureServerError(error, "route");
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 }
  );
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function resolveDeps(deps: JourneyRouteDeps) {
  return {
    db: deps.db ?? getDb,
    getSession: deps.getSession ?? getSessionInfo,
    entitlementOf:
      deps.entitlementOf ??
      ((d: Db, userId: string) => getEntitlement(d, userId)),
    now: deps.now ?? (() => new Date()),
    env:
      deps.env ??
      (process.env as unknown as { LEARNING_JOURNEY_ENABLED?: string })
  };
}

type ResolvedDeps = ReturnType<typeof resolveDeps>;

async function gate(
  ctx: ResolvedDeps
): Promise<
  | { ok: true; session: NonNullable<SessionInfo> }
  | { ok: false; response: NextResponse }
> {
  if (!learningJourneyServerEnabled(ctx.env)) {
    return { ok: false, response: notFound() };
  }
  const session = await ctx.getSession();
  if (!session) {
    return { ok: false, response: unauthorized() };
  }
  const entitlement = await ctx.entitlementOf(ctx.db(), session.userId);
  if (!capabilitiesFor(entitlement, ctx.env).weeklyLearning) {
    return { ok: false, response: forbidden() };
  }
  return { ok: true, session };
}

type JourneyRow = {
  state: "active" | "paused" | "graduated" | "maintenance";
  startedAt: Date;
  pausedAt: Date | null;
  accumulatedPauseMs: number;
  graduatedAt: Date | null;
  maintenanceAt: Date | null;
};

/** The caller's stored journey, or the not-started sentinel when there is no row. */
async function loadJourney(
  db: Db,
  userId: string
): Promise<{ journey: Journey; exists: boolean }> {
  const [row] = await db
    .select({
      state: schema.learningJourneys.state,
      startedAt: schema.learningJourneys.startedAt,
      pausedAt: schema.learningJourneys.pausedAt,
      accumulatedPauseMs: schema.learningJourneys.accumulatedPauseMs,
      graduatedAt: schema.learningJourneys.graduatedAt,
      maintenanceAt: schema.learningJourneys.maintenanceAt
    })
    .from(schema.learningJourneys)
    .where(eq(schema.learningJourneys.userId, userId));

  if (!row) {
    return { journey: NOT_STARTED, exists: false };
  }
  const typed = row as JourneyRow;
  return {
    journey: {
      state: typed.state,
      startedAt: typed.startedAt,
      pausedAt: typed.pausedAt,
      accumulatedPauseMs: typed.accumulatedPauseMs,
      graduatedAt: typed.graduatedAt,
      maintenanceAt: typed.maintenanceAt
    },
    exists: true
  };
}

/** The wire shape both GET and POST return — derived stage/day + descriptors. */
function serializeJourney(journey: Journey, now: Date) {
  const stage = currentStage(journey, now);
  return {
    journey: {
      state: journey.state,
      day: currentDay(journey, now),
      stage,
      isComplete: isComplete(journey, now),
      completedStages: completedStages(journey, now),
      startedAt: journey.startedAt ? journey.startedAt.toISOString() : null,
      pausedAt: journey.pausedAt ? journey.pausedAt.toISOString() : null,
      graduatedAt: journey.graduatedAt
        ? journey.graduatedAt.toISOString()
        : null,
      maintenanceAt: journey.maintenanceAt
        ? journey.maintenanceAt.toISOString()
        : null
    },
    currentStage: stageDescriptor(stage),
    stages: STAGE_DESCRIPTORS
  };
}

export function createJourneyGetHandler(deps: JourneyRouteDeps = {}) {
  const ctx = resolveDeps(deps);

  return async function GET() {
    const g = await gate(ctx);
    if (!g.ok) {
      return g.response;
    }
    try {
      const { journey } = await loadJourney(ctx.db(), g.session.userId);
      return NextResponse.json(serializeJourney(journey, ctx.now()));
    } catch (error) {
      return serverError(error);
    }
  };
}

export function createJourneyPostHandler(deps: JourneyRouteDeps = {}) {
  const ctx = resolveDeps(deps);

  return async function POST(request: Request) {
    const g = await gate(ctx);
    if (!g.ok) {
      return g.response;
    }

    const parsed = JourneyActionSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { action } = parsed.data;
    const now = ctx.now();

    try {
      const { journey, exists } = await loadJourney(ctx.db(), g.session.userId);

      let next: Journey;
      try {
        next = applyAction(journey, action, now);
      } catch (error) {
        if (error instanceof JourneyTransitionError) {
          // Well-formed request, wrong state → 409. No hidden reset.
          return NextResponse.json(
            { error: `Cannot ${action} from ${journey.state}.` },
            { status: 409 }
          );
        }
        throw error;
      }

      if (!exists) {
        // Only `start` reaches here (every other action from not_started throws
        // above). Insert the singleton row; the UNIQUE(user_id) makes a racing
        // double-start a constraint error, caught as a 500 rather than two rows.
        await ctx.db().insert(schema.learningJourneys).values({
          userId: g.session.userId,
          state: next.state as JourneyRow["state"],
          startedAt: next.startedAt as Date,
          pausedAt: next.pausedAt,
          accumulatedPauseMs: next.accumulatedPauseMs,
          graduatedAt: next.graduatedAt,
          maintenanceAt: next.maintenanceAt,
          createdAt: now,
          updatedAt: now
        });
      } else {
        await ctx
          .db()
          .update(schema.learningJourneys)
          .set({
            state: next.state as JourneyRow["state"],
            pausedAt: next.pausedAt,
            accumulatedPauseMs: next.accumulatedPauseMs,
            graduatedAt: next.graduatedAt,
            maintenanceAt: next.maintenanceAt,
            updatedAt: now
          })
          .where(eq(schema.learningJourneys.userId, g.session.userId));
      }

      return NextResponse.json(serializeJourney(next, now));
    } catch (error) {
      return serverError(error);
    }
  };
}
