"use client";

import { useEffect, useState } from "react";

import { historyStore, type StoredCheck } from "../lib/client/history-store";
import { computeStreak, dayKeyLocal, showFirstWin } from "../lib/coach/days";
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
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const weekCount = checks.filter(
    (check) => new Date(check.createdAt).getTime() >= weekAgo
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
