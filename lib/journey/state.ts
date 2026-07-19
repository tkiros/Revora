/**
 * 90-day Learning Journey — the pure state machine (plan §P4.1, §8 entity
 * `learning_journeys`: "Explicit state machine; no hidden reset").
 *
 * This module is DELIBERATELY db-free and IO-free: it is the single source of
 * truth for what transitions are legal and how the current stage/day are
 * derived. The API route (app/api/journey) loads the persisted row, hands the
 * plain shape to `applyAction`, and writes the result back — every rule about
 * what may follow what lives here and nowhere else.
 *
 * Two design commitments from the plan:
 *
 *  - No hidden reset. The state only ever advances through an explicit user
 *    action (start/pause/resume/graduate/maintenance). Nothing here resets a
 *    day count or a stage as a side effect of time passing.
 *
 *  - Pause FREEZES the day count. Day N is elapsed *active* (non-paused) time,
 *    not wall-clock time since start. A pause accumulates into
 *    `accumulatedPauseMs` on resume, and time spent currently paused is
 *    subtracted live — so a journey paused on day 10 for a month is still on
 *    day 10 when it resumes.
 *
 * Nothing in this module touches the meal-balance card or any check input
 * (global constraint §1): a journey is a longitudinal frame around the product,
 * never an input to a verdict.
 */

/** DB-persisted states (a row exists) plus the `not_started` sentinel (no row). */
export type JourneyState =
  | "not_started"
  | "active"
  | "paused"
  | "graduated"
  | "maintenance";

/** The user-initiated transitions. Deletion is a row delete, not an action. */
export type JourneyAction =
  | "start"
  | "pause"
  | "resume"
  | "graduate"
  | "maintenance";

/**
 * The plain, db-free journey shape. The persisted row maps 1:1 onto this (minus
 * id/userId/timestamps the route owns). `not_started` is represented by
 * `NOT_STARTED` below — the route uses it when the user has no row yet.
 */
export type Journey = {
  state: JourneyState;
  /** When the journey first started; null only for `not_started`. */
  startedAt: Date | null;
  /** Set while `paused`; the instant the current pause began. Null otherwise. */
  pausedAt: Date | null;
  /** Frozen paused time from all COMPLETED (resumed) pauses, in ms. */
  accumulatedPauseMs: number;
  /** When the user graduated; null until then. */
  graduatedAt: Date | null;
  /** When the user chose maintenance; null until then. */
  maintenanceAt: Date | null;
};

/** The sentinel a user has before they ever start (no DB row). */
export const NOT_STARTED: Journey = Object.freeze({
  state: "not_started",
  startedAt: null,
  pausedAt: null,
  accumulatedPauseMs: 0,
  graduatedAt: null,
  maintenanceAt: null
});

const DAY_MS = 24 * 60 * 60 * 1000;

/** The last active day of the journey — completion is offered at day 90. */
export const JOURNEY_LENGTH_DAYS = 90;

/**
 * Stage day ranges (plan §P4.1). Inclusive on both ends. Stage 5 nominally ends
 * at day 90, but the day counter is not capped — a user who keeps going past
 * day 90 without graduating simply stays in stage 5.
 */
export const STAGE_RANGES = [
  { stage: 1, startDay: 1, endDay: 7 },
  { stage: 2, startDay: 8, endDay: 21 },
  { stage: 3, startDay: 22, endDay: 45 },
  { stage: 4, startDay: 46, endDay: 75 },
  { stage: 5, startDay: 76, endDay: 90 }
] as const;

export type Stage = 1 | 2 | 3 | 4 | 5;

/** Thrown when a caller attempts a transition the state machine forbids. */
export class JourneyTransitionError extends Error {
  readonly from: JourneyState;
  readonly action: JourneyAction;

  constructor(from: JourneyState, action: JourneyAction) {
    super(`Illegal journey transition: cannot "${action}" from "${from}".`);
    this.name = "JourneyTransitionError";
    this.from = from;
    this.action = action;
  }
}

/**
 * Apply a user action to a journey, returning the NEXT journey shape. Throws
 * `JourneyTransitionError` for any illegal transition — the route turns that
 * into a 409, so an illegal action is never silently absorbed and never resets
 * anything.
 *
 * Legal transitions (everything else throws):
 *   not_started → active        (start)
 *   active      → paused         (pause)      — freezes the day count
 *   paused      → active         (resume)     — banks the paused span
 *   active      → graduated      (graduate)   — user choice, any day ≥ 1
 *   graduated   → maintenance    (maintenance)
 *
 * Notably NOT legal: graduate/pause from `paused` (must resume first);
 * active → maintenance directly (must graduate first — the day-90 "switch to
 * maintenance" flow is graduate followed by maintenance); anything from a
 * terminal `maintenance`; re-starting an existing journey.
 */
export function applyAction(
  journey: Journey,
  action: JourneyAction,
  now: Date
): Journey {
  switch (action) {
    case "start":
      if (journey.state !== "not_started") {
        throw new JourneyTransitionError(journey.state, action);
      }
      return {
        state: "active",
        startedAt: now,
        pausedAt: null,
        accumulatedPauseMs: 0,
        graduatedAt: null,
        maintenanceAt: null
      };

    case "pause":
      if (journey.state !== "active") {
        throw new JourneyTransitionError(journey.state, action);
      }
      return { ...journey, state: "paused", pausedAt: now };

    case "resume": {
      if (journey.state !== "paused" || !journey.pausedAt) {
        throw new JourneyTransitionError(journey.state, action);
      }
      // Bank the span just spent paused so the day count stays frozen across it.
      // Clamp at 0 so a clock skew (now < pausedAt) can never credit active time.
      const pausedSpan = Math.max(0, now.getTime() - journey.pausedAt.getTime());
      return {
        ...journey,
        state: "active",
        pausedAt: null,
        accumulatedPauseMs: journey.accumulatedPauseMs + pausedSpan
      };
    }

    case "graduate":
      // Graduation is a user choice available any day from `active` (plan treats
      // "finish early" as legitimate) — but only from active: a paused journey
      // must resume first, so the recorded completed-stage count is honest.
      if (journey.state !== "active") {
        throw new JourneyTransitionError(journey.state, action);
      }
      return { ...journey, state: "graduated", graduatedAt: now };

    case "maintenance":
      if (journey.state !== "graduated") {
        throw new JourneyTransitionError(journey.state, action);
      }
      return { ...journey, state: "maintenance", maintenanceAt: now };

    default: {
      // Exhaustiveness guard — a new action must handle its own transition.
      const never: never = action;
      throw new JourneyTransitionError(journey.state, never);
    }
  }
}

/**
 * Elapsed ACTIVE (non-paused) milliseconds since start. This is the quantity the
 * day count is built on. Subtracts banked pause time and, if currently paused,
 * the live span of the ongoing pause. Never negative.
 */
export function activeElapsedMs(journey: Journey, now: Date): number {
  if (!journey.startedAt) {
    return 0;
  }
  let elapsed = now.getTime() - journey.startedAt.getTime();
  elapsed -= journey.accumulatedPauseMs;
  if (journey.state === "paused" && journey.pausedAt) {
    elapsed -= now.getTime() - journey.pausedAt.getTime();
  }
  return Math.max(0, elapsed);
}

/**
 * The current day of the journey, 1-indexed. Day 1 is the first active day
 * (0..<24h of active time). Returns 0 for a not-started journey. Not capped at
 * 90 — the day keeps counting for a journey left active past completion.
 *
 * Boundary intuition (used by the tests): at *exactly* 7 active days elapsed the
 * day rolls to 8 (stage 2); at 6.99 days it is still day 7 (stage 1).
 */
export function currentDay(journey: Journey, now: Date): number {
  if (journey.state === "not_started" || !journey.startedAt) {
    return 0;
  }
  return Math.floor(activeElapsedMs(journey, now) / DAY_MS) + 1;
}

/**
 * The current stage number (1–5), or null for a not-started journey. Derived
 * purely from the current day — the SINGLE source of the stage, so there is no
 * stored stage column that could drift from the day count.
 */
export function currentStage(journey: Journey, now: Date): Stage | null {
  const day = currentDay(journey, now);
  if (day < 1) {
    return null;
  }
  const match = STAGE_RANGES.find((range) => day <= range.endDay);
  return (match ? match.stage : 5) as Stage;
}

/**
 * How many stages the user has fully finished — i.e. stages whose last day is
 * behind the current day. This is the "completed stage count" carried by the
 * `journey_graduated` event (plan §10.1). On day 8 that is 1 (stage 1 done); a
 * graduation on day 90+ counts all 5.
 */
export function completedStages(journey: Journey, now: Date): number {
  const day = currentDay(journey, now);
  return STAGE_RANGES.filter((range) => range.endDay < day).length;
}

/** Whether the journey has reached its nominal 90-day completion. */
export function isComplete(journey: Journey, now: Date): boolean {
  return currentDay(journey, now) >= JOURNEY_LENGTH_DAYS;
}
