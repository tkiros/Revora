import { and, desc, eq, gte } from "drizzle-orm";

import { DashboardInsight } from "../../../components/dashboard-insight";
import {
  DashboardView,
  type DashboardData,
  type ProgressSection
} from "../../../components/dashboard-view";
import { FirstRunGate } from "../../../components/first-run-gate";
import { GuestDashboard } from "../../../components/guest-dashboard";
import type { StoredCheck } from "../../../lib/client/history-store";
import { computeCoachView } from "../../../lib/coach/compute";
import {
  dayKeyInTimezone,
  showFirstWin,
  verdictWeekView
} from "../../../lib/coach/days";
import {
  MIN_CHECKS_FOR_INSIGHT,
  type CoachInsight
} from "../../../lib/coach/insights";
import { safeDecrypt } from "../../../lib/server/crypto";
import { getDb, schema } from "../../../lib/server/db";
import { getPlanBox } from "../../../lib/server/plan-box";
import { getSessionInfo } from "../../../lib/server/session";

export const metadata = { title: "Home — Revora" };

/**
 * The dashboard — the app's home and (after #15) its start URL. Hybrid per
 * eng amendment #1: signed-in renders server-side from one bounded query;
 * guests get <GuestDashboard> fed from localStorage. Brand-new visitors are
 * routed to /onboarding by FirstRunGate (guest branch only — a signed-in
 * user on a fresh device already onboarded via /welcome, amendment #1).
 *
 * The query window is 35 days / limit 500 — the same contract
 * app/api/coach/route.ts feeds computeCoachView; a shorter window silently
 * caps streaks (eng amendment #2). The 7-day strip derives in JS.
 */

function qualitative(percent: number): string {
  if (percent >= 80) return "Strong";
  if (percent >= 60) return "Good";
  if (percent >= 40) return "Building";
  return "Just starting";
}

const INSIGHT_FALLBACK: CoachInsight = {
  id: "daypart",
  text: "No single pattern stands out this week — steady checking is doing its job."
};

export default async function HomePage() {
  const session = await getSessionInfo();

  if (!session) {
    return (
      <>
        <FirstRunGate />
        <GuestDashboard />
      </>
    );
  }

  const db = getDb();
  const now = new Date();

  const [profile] = await db
    .select({ timezone: schema.profiles.timezone })
    .from(schema.profiles)
    .where(eq(schema.profiles.userId, session.userId));
  const timezone = profile?.timezone ?? "America/New_York";
  const dayKey = dayKeyInTimezone(timezone);

  const since = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      id: schema.checks.id,
      clientId: schema.checks.clientId,
      createdAt: schema.checks.createdAt,
      risk: schema.checks.risk,
      actionDoneAt: schema.checks.actionDoneAt,
      foodCiphertext: schema.checks.foodCiphertext,
      a1cBand: schema.checks.a1cBand,
      inputMethod: schema.checks.inputMethod
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

  const coach = computeCoachView(rows, timezone, now);
  const week = verdictWeekView(rows, dayKey, now);

  const todayKey = dayKey(now);
  const todayChecks: StoredCheck[] = rows
    .filter((row) => dayKey(row.createdAt) === todayKey)
    .map((row) => ({
      clientId: row.clientId ?? row.id,
      food: safeDecrypt(row.foodCiphertext),
      risk: row.risk,
      a1cBand: row.a1cBand,
      inputMethod: row.inputMethod === "voice" ? "voice" : "text",
      createdAt: row.createdAt.toISOString(),
      actionDoneAt: row.actionDoneAt?.toISOString()
    }));

  const weekKeys = new Set(week.map((day) => day.key));
  const weekCount = rows.filter((row) =>
    weekKeys.has(dayKey(row.createdAt))
  ).length;

  const planBox = await getPlanBox();

  let progress: ProgressSection = { kind: "hidden" };
  if (rows.length >= MIN_CHECKS_FOR_INSIGHT) {
    if (planBox.isFree) {
      progress = { kind: "example" };
    } else {
      const [bai] = await db
        .select()
        .from(schema.baiWeekly)
        .where(eq(schema.baiWeekly.userId, session.userId))
        .orderBy(desc(schema.baiWeekly.weekStart))
        .limit(1);
      if (bai) {
        progress = {
          kind: "real",
          bars: [
            {
              label: "Check-in days",
              caption: qualitative(bai.adherence),
              percent: bai.adherence
            },
            {
              label: "Rhythm",
              caption: qualitative(bai.consistency),
              percent: bai.consistency
            },
            {
              label: "Follow-through",
              caption: qualitative(bai.action),
              percent: bai.action
            }
          ]
        };
      }
    }
  }

  const insight =
    coach.insight ??
    (rows.length >= MIN_CHECKS_FOR_INSIGHT ? INSIGHT_FALLBACK : null);

  const data: DashboardData = {
    todayLabel: now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: timezone
    }),
    weekSummary:
      weekCount === 0
        ? "No meals checked yet."
        : weekCount === 1
          ? "1 meal checked this week."
          : `${weekCount} meals checked this week.`,
    showFirstWin: showFirstWin(coach.streak, todayChecks.length),
    week,
    todayChecks,
    progress,
    planBox,
    isDay0: rows.length === 0
  };

  return (
    <DashboardView
      data={data}
      insightSlot={<DashboardInsight initial={insight} canUpgrade />}
    />
  );
}
