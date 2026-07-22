"use client";

import { useEffect, useState } from "react";

import { historyStore, type StoredCheck } from "../lib/client/history-store";
import {
  computeStreak,
  dayKeyLocal,
  showFirstWin,
  weekView
} from "../lib/coach/days";
import { nextAction } from "../lib/coach/next-action";
import type { PlanBoxData } from "../lib/server/plan-box";
import { DashboardView, type DashboardData } from "./dashboard-view";

/**
 * Guest dashboard (eng amendment #1): same <DashboardView> tree, fed from
 * the on-device store instead of the server. Renders the layout instantly
 * and fills in after mount — localStorage isn't available during prerender.
 * C7 restructure: guests get the same decluttered composition as signed-in
 * users (hero, next action, Today); week strip / insight / progress moved to
 * /journey, where guests see the sign-in state.
 */

const GUEST_PLAN_BOX: PlanBoxData = {
  planName: "Free plan",
  meta: "The daily check is free.",
  isFree: true,
  signedIn: false,
  attention: false
};

function buildData(checks: StoredCheck[]): DashboardData {
  const now = new Date();
  const todayKey = dayKeyLocal(now);
  const todayChecks = checks.filter(
    (check) => dayKeyLocal(new Date(check.createdAt)) === todayKey
  );
  const streak = computeStreak(
    checks.map((check) => check.createdAt),
    dayKeyLocal,
    now
  );
  // Same "this week" as the signed-in Home (last seven calendar-day keys),
  // so a guest and a signed-in user with identical checks read the same count.
  const weekKeys = new Set(weekView([], dayKeyLocal, now).map((day) => day.key));
  const weekCount = checks.filter((check) =>
    weekKeys.has(dayKeyLocal(new Date(check.createdAt)))
  ).length;

  return {
    todayLabel: now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    }),
    weekSummary:
      weekCount === 0
        ? "No meals checked yet."
        : weekCount === 1
          ? "1 meal checked this week."
          : `${weekCount} meals checked this week.`,
    showFirstWin: showFirstWin(streak, todayChecks.length),
    todayChecks,
    nextAction: nextAction({
      checkedToday: todayChecks.length > 0,
      undoneActionToday: todayChecks.some(
        (check) => check.risk !== "SAFE" && !check.actionDoneAt
      )
    }),
    planBox: GUEST_PLAN_BOX,
    planBoxAttention: false,
    isDay0: checks.length === 0
  };
}

export function GuestDashboard() {
  const [checks, setChecks] = useState<StoredCheck[]>([]);

  useEffect(() => {
    setChecks(historyStore.all());
  }, []);

  return <DashboardView data={buildData(checks)} />;
}
