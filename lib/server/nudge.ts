import { and, eq, gte } from "drizzle-orm";

import { dayKeyInTimezone, hourInTimezone } from "../coach/days";
import { learningJourneyServerEnabled } from "../learning-journey-flag";
import {
  cadenceAllowsSend,
  isQuietHour,
  nudgeBody,
  selectJourneyNudge,
  type JourneyNudgeSignals,
  type NudgeCadence,
  type NudgeSelection
} from "../journey/nudge";
import {
  NOT_STARTED,
  currentStage,
  type Journey,
  type JourneyState
} from "../journey/state";
import {
  currentStageIntentMet,
  weeklySignalsFrom,
  type WeeklyCheckInput,
  type WeeklyMemoryInput
} from "../journey/weekly-learning";
import { capabilitiesFor } from "./capabilities";
import { safeDecrypt } from "./crypto";
import { getEntitlement } from "./entitlement";
import { schema, type Db } from "./db";
import { recordHeartbeat } from "./heartbeat";

/**
 * The daily nudge (plan §P5, §P4.3): one gentle push per user per local day,
 * only for opted-in premium users whose cadence + quiet hours allow it and who
 * haven't checked yet. When the Learning Journey flag is on and the user has a
 * journey, the trigger class + copy become journey-aware (lib/journey/nudge.ts);
 * otherwise behavior is unchanged (a plain rotating generic reminder). The
 * hourly cron calls runNudgeCron; sending is injected (web-push in prod).
 */

// Re-exported so existing callers/tests keep importing the generic bank from
// here; the single source now lives in the pure lib/journey/nudge module.
export { GENERIC_NUDGE_COPY as NUDGE_COPY_BANK } from "../journey/nudge";

export type PushSendResult = "ok" | "gone" | "error";

export type NudgeDeps = {
  now?: () => Date;
  env?: { LEARNING_JOURNEY_ENABLED?: string };
  send: (
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: string
  ) => Promise<PushSendResult>;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type ProfileCandidate = {
  userId: string;
  timezone: string;
  nudgeHour: number;
  nudgeCadence: NudgeCadence;
  nudgeQuietStart: number | null;
  nudgeQuietEnd: number | null;
};

/** The caller's stored journey, or the not-started sentinel when there is no row. */
async function loadJourney(db: Db, userId: string): Promise<Journey> {
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
    return NOT_STARTED;
  }
  return {
    state: row.state as JourneyState,
    startedAt: row.startedAt,
    pausedAt: row.pausedAt,
    accumulatedPauseMs: row.accumulatedPauseMs,
    graduatedAt: row.graduatedAt,
    maintenanceAt: row.maintenanceAt
  };
}

/**
 * Whether a completed-week artifact exists that postdates the user's last nudge.
 *
 * SIGNAL CHOICE (documented, Task 19): the honest, no-new-column read of "a new
 * completed-week artifact is available" is: a persisted `weekly_reflections` row
 * whose generation day (createdAt, in the user's timezone) is strictly LATER
 * than the most recent day we last nudged this user (max `lastNudgeDate` across
 * their push subscriptions). A never-nudged user with any reflection qualifies.
 *
 * CAVEAT (gap): Task 18 persists reflections lazily on first view, so in
 * practice this marks "an artifact generated since we last reminded you", not a
 * guaranteed-unseen one. A dedicated viewed-at timestamp would make "unviewed"
 * exact; that is a noted follow-up, not built here.
 */
async function weeklyArtifactFresh(
  db: Db,
  userId: string,
  tzDayKey: (d: Date) => string,
  lastNudgeDate: string | null
): Promise<boolean> {
  const rows = await db
    .select({ createdAt: schema.weeklyReflections.createdAt })
    .from(schema.weeklyReflections)
    .where(eq(schema.weeklyReflections.userId, userId));
  if (rows.length === 0) {
    return false;
  }
  const latest = rows.reduce(
    (max, row) => (row.createdAt > max ? row.createdAt : max),
    rows[0].createdAt
  );
  if (!lastNudgeDate) {
    return true;
  }
  // Both are YYYY-MM-DD keys — lexicographic compare is chronological.
  return tzDayKey(latest) > lastNudgeDate;
}

/**
 * The week's journey signals (last 7 days): distinct meals explored (needs the
 * encrypted food text, decrypted here exactly as the weekly route does) plus the
 * plaintext memory fields. Used only to decide whether the current stage's
 * headline intent is already met — never to alter a card (constraint §1).
 */
async function loadStageIntentMet(
  db: Db,
  userId: string,
  stage: NonNullable<ReturnType<typeof currentStage>>,
  windowStart: Date
): Promise<boolean> {
  const checkRows = await db
    .select({
      foodCiphertext: schema.checks.foodCiphertext,
      risk: schema.checks.risk,
      wasClarified: schema.checks.wasClarified
    })
    .from(schema.checks)
    .where(
      and(
        eq(schema.checks.userId, userId),
        gte(schema.checks.createdAt, windowStart)
      )
    );
  const memoryRows = await db
    .select({
      label: schema.mealMemories.label,
      favorite: schema.mealMemories.favorite
    })
    .from(schema.mealMemories)
    .where(
      and(
        eq(schema.mealMemories.userId, userId),
        gte(schema.mealMemories.createdAt, windowStart)
      )
    );

  const checks: WeeklyCheckInput[] = checkRows.map((row) => ({
    food: safeDecrypt(row.foodCiphertext),
    risk: row.risk,
    wasClarified: row.wasClarified
  }));
  const memories: WeeklyMemoryInput[] = memoryRows.map((row) => ({
    label: row.label,
    favorite: row.favorite
  }));

  return currentStageIntentMet(stage, weeklySignalsFrom(checks, memories));
}

export async function runNudgeCron(
  db: Db,
  deps: NudgeDeps
): Promise<{ sent: number; pruned: number; skipped: number }> {
  const now = deps.now?.() ?? new Date();
  const journeyEnabled = learningJourneyServerEnabled(
    deps.env ??
      (process.env as unknown as { LEARNING_JOURNEY_ENABLED?: string })
  );
  let sent = 0;
  let pruned = 0;
  let skipped = 0;

  const candidates = (await db
    .select({
      userId: schema.profiles.userId,
      timezone: schema.profiles.timezone,
      nudgeHour: schema.profiles.nudgeHour,
      nudgeCadence: schema.profiles.nudgeCadence,
      nudgeQuietStart: schema.profiles.nudgeQuietStart,
      nudgeQuietEnd: schema.profiles.nudgeQuietEnd
    })
    .from(schema.profiles)
    .where(eq(schema.profiles.nudgeOptIn, true))) as ProfileCandidate[];

  for (const candidate of candidates) {
    const localHour = hourInTimezone(candidate.timezone)(now);
    if (localHour !== candidate.nudgeHour) {
      skipped += 1;
      continue;
    }

    // Quiet hours: even at the chosen hour, honor an explicit quiet window.
    if (
      isQuietHour(localHour, candidate.nudgeQuietStart, candidate.nudgeQuietEnd)
    ) {
      skipped += 1;
      continue;
    }

    const dayKey = dayKeyInTimezone(candidate.timezone);
    const todayKey = dayKey(now);

    const subscriptions = await db
      .select()
      .from(schema.pushSubscriptions)
      .where(eq(schema.pushSubscriptions.userId, candidate.userId));

    // Cadence spacing per subscription (daily = one/local-day, unchanged).
    const due = subscriptions.filter((subscription) =>
      cadenceAllowsSend(
        candidate.nudgeCadence,
        todayKey,
        subscription.lastNudgeDate
      )
    );
    if (due.length === 0) {
      skipped += 1;
      continue;
    }

    // Checked today already? The nudge's whole job is done. Also compute the
    // most recent check date for the inactivity wind-down.
    const recent = await db
      .select({ createdAt: schema.checks.createdAt })
      .from(schema.checks)
      .where(eq(schema.checks.userId, candidate.userId));
    if (recent.some((row) => dayKey(row.createdAt) === todayKey)) {
      skipped += 1;
      continue;
    }

    const entitlement = await getEntitlement(db, candidate.userId, {
      now: () => now
    });
    // The nudge is a paid capability — gate on the matrix, not an inline tier
    // check, so "who gets a reminder" has exactly one definition (T10).
    if (!capabilitiesFor(entitlement).nudges) {
      skipped += 1;
      continue;
    }

    // Journey-aware trigger selection (flag-gated). When the flag is off, the
    // class is always generic and there are no journey stop rules — behavior is
    // unchanged from the pre-journey cron.
    let selection: NudgeSelection = { class: "generic", stage: null };
    if (journeyEnabled) {
      const journey = await loadJourney(db, candidate.userId);
      const stage = currentStage(journey, now);

      const daysSinceLastCheck = mostRecentCheckAgeDays(recent, now);

      const lastNudgeDate = subscriptions.reduce<string | null>(
        (max, sub) =>
          sub.lastNudgeDate && (!max || sub.lastNudgeDate > max)
            ? sub.lastNudgeDate
            : max,
        null
      );

      const signals: JourneyNudgeSignals = {
        journeyState: journey.state,
        stage,
        daysSinceLastCheck,
        // Only "active" journeys can produce a journey_step; skip the extra
        // reads otherwise (maintenance/not_started never use stageIntentMet).
        stageIntentMet:
          journey.state === "active" && stage !== null
            ? await loadStageIntentMet(
                db,
                candidate.userId,
                stage,
                new Date(now.getTime() - WEEK_MS)
              )
            : true,
        weeklyArtifactFresh:
          (journey.state === "active" || journey.state === "maintenance") &&
          stage !== null
            ? await weeklyArtifactFresh(
                db,
                candidate.userId,
                dayKey,
                lastNudgeDate
              )
            : false
      };

      const chosen = selectJourneyNudge(signals);
      if (!chosen) {
        // A stop rule fired (paused / graduated / 14-day inactivity).
        skipped += 1;
        continue;
      }
      selection = chosen;
    }

    // Deterministic generic rotation by day so all of a user's devices say the
    // same thing (and tests stay stable).
    const dayNumber = Number(todayKey.replace(/-/g, ""));
    const body = nudgeBody(selection, dayNumber);
    const payload = JSON.stringify({
      title: "Revora",
      body,
      // Bounded routing metadata only — no health text. The SW opens
      // /check?nudge=<class>&stage=<stage>; the client emits nudge_opened.
      class: selection.class,
      stage: selection.stage === null ? "none" : String(selection.stage)
    });

    for (const subscription of due) {
      const result = await deps.send(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth }
        },
        payload
      );

      if (result === "gone") {
        await db
          .delete(schema.pushSubscriptions)
          .where(eq(schema.pushSubscriptions.id, subscription.id));
        pruned += 1;
        continue;
      }

      // Stamp even on transient errors: skip, never risk a double-send on
      // the next hourly tick (incident-runbook stance).
      await db
        .update(schema.pushSubscriptions)
        .set({ lastNudgeDate: todayKey })
        .where(eq(schema.pushSubscriptions.id, subscription.id));

      if (result === "ok") {
        sent += 1;
      }
    }
  }

  await recordHeartbeat(db, "nudge", now);

  return { sent, pruned, skipped };
}

/**
 * Whole days since the user's most recent check, or null if they have never
 * checked (a new user is not "inactive" — see INACTIVITY_STOP_DAYS).
 */
function mostRecentCheckAgeDays(
  checks: Array<{ createdAt: Date }>,
  now: Date
): number | null {
  if (checks.length === 0) {
    return null;
  }
  const latest = checks.reduce(
    (max, row) => (row.createdAt > max ? row.createdAt : max),
    checks[0].createdAt
  );
  return Math.floor((now.getTime() - latest.getTime()) / (24 * 60 * 60 * 1000));
}
