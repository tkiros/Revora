"use client";

import { useEffect, useState } from "react";

import { historyStore, type StoredCheck } from "../lib/client/history-store";
import {
  computeStreak,
  dayKeyLocal,
  showFirstWin,
  verdictWeekView
} from "../lib/coach/days";
import { deriveInsight } from "../lib/coach/insights";
import type { PlanBoxData } from "../lib/server/plan-box";
import { DashboardView, type DashboardData } from "./dashboard-view";
import { InsightCard } from "./insight-card";

/**
 * Guest dashboard (eng amendment #1): same <DashboardView> tree, fed from
 * the on-device store instead of the server. Renders the layout instantly
 * (hollow dots) and fills in after mount — localStorage isn't available
 * during prerender. Guests get the full deriveInsight (their store has food
 * text), so repeat_meal works here natively.
 */

const GUEST_PLAN_BOX: PlanBoxData = {
  planName: "Free plan",
  meta: "The daily check is free.",
  isFree: true,
  signedIn: false
};

function buildData(checks: StoredCheck[]): DashboardData {
  const now = new Date();
  const week = verdictWeekView(checks, dayKeyLocal, now);
  const todayKey = dayKeyLocal(now);
  const todayChecks = checks.filter(
    (check) => dayKeyLocal(new Date(check.createdAt)) === todayKey
  );
  const streak = computeStreak(
    checks.map((check) => check.createdAt),
    dayKeyLocal,
    now
  );
  const weekCount = checks.filter((check) => {
    const key = dayKeyLocal(new Date(check.createdAt));
    return week.some((day) => day.key === key);
  }).length;

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
    week,
    todayChecks,
    progress: checks.length >= 5 ? { kind: "example" } : { kind: "hidden" },
    planBox: GUEST_PLAN_BOX,
    isDay0: checks.length === 0
  };
}

export function GuestDashboard() {
  const [checks, setChecks] = useState<StoredCheck[]>([]);

  useEffect(() => {
    setChecks(historyStore.all());
  }, []);

  const data = buildData(checks);
  const insight = deriveInsight(checks);

  return (
    <DashboardView
      data={data}
      insightSlot={
        insight ? (
          <div className="dash-card" data-testid="dash-insight">
            <InsightCard insight={insight} />
          </div>
        ) : null
      }
    />
  );
}
