"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { historyStore, type StoredCheck } from "../lib/client/history-store";
import { loadHistory, syncLocalHistory } from "../lib/client/remote-history";
import {
  computeStreak,
  dayKeyLocal,
  showFirstWin,
  weekView
} from "../lib/coach/days";
import { deriveInsight, type CoachInsight } from "../lib/coach/insights";
import { InsightCard } from "./insight-card";
import { NudgeOptIn } from "./nudge-opt-in";
import { StreakChip } from "./streak-chip";
import { TodayList } from "./today-list";

/**
 * The home daily loop (plan P3/4B): today's checks, the streak, one insight.
 * Server-backed when signed in (cross-device), on-device for guests. Renders
 * nothing extra for brand-new visitors so the one-shot check stays front and
 * center.
 */
export function DailyLoop() {
  const [today, setToday] = useState<StoredCheck[]>([]);
  const [streak, setStreak] = useState(0);
  const [daysThisWeek, setDaysThisWeek] = useState(0);
  const [insight, setInsight] = useState<CoachInsight | null>(null);
  const [hasHistory, setHasHistory] = useState<boolean | null>(null);
  // Distinct from "no checks yet": the server read failed and we have no local
  // view to show, so we render an explicit retry affordance rather than lying
  // with an empty "New here?" card during an outage (plan §7).
  const [unavailable, setUnavailable] = useState(false);
  // Bumped by the Retry button — bounded, manual retry only.
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Local first for instant paint, then the server view when available.
      const local = historyStore.all();
      if (!cancelled && local.length > 0) {
        applyChecks(historyStore.recent(7));
      }

      const result = await loadHistory(7);
      if (cancelled) {
        return;
      }

      if (result.source === "server") {
        // Bring any device-only checks along, then trust the server view.
        void syncLocalHistory();
        applyChecks(result.checks);
      } else if (local.length === 0) {
        // No local view to fall back on: an outage is unavailable+retry, a
        // genuine signed-out/new visitor is the empty "New here?" card.
        if (result.unavailable) {
          setUnavailable(true);
        } else {
          setHasHistory(false);
        }
      }
    })();

    function applyChecks(checks: StoredCheck[]) {
      const todayKey = dayKeyLocal(new Date());
      setToday(
        checks.filter(
          (check) => dayKeyLocal(new Date(check.createdAt)) === todayKey
        )
      );
      setStreak(computeStreak(checks.map((c) => c.createdAt), dayKeyLocal));
      setDaysThisWeek(
        weekView(checks.map((c) => c.createdAt), dayKeyLocal).filter(
          (day) => day.checked
        ).length
      );
      setInsight(deriveInsight(checks));
      setHasHistory(checks.length > 0);
    }

    return () => {
      cancelled = true;
    };
  }, [reloadNonce]);

  if (unavailable) {
    return (
      <section
        className="surface-card daily-loop-card"
        data-testid="daily-loop-unavailable"
        aria-live="polite"
      >
        <p className="page-copy">
          Couldn&apos;t load your recent checks — your history is safe.{" "}
          <button
            type="button"
            className="inline-link link-button"
            data-testid="daily-loop-retry"
            onClick={() => {
              setUnavailable(false);
              setReloadNonce((nonce) => nonce + 1);
            }}
          >
            Retry
          </button>
        </p>
      </section>
    );
  }

  if (hasHistory === null) {
    return null;
  }

  if (!hasHistory) {
    return (
      <section className="surface-card daily-loop-card" data-testid="daily-loop-empty">
        <p className="page-copy">
          New here?{" "}
          <Link href="/onboarding" className="inline-link">
            Take the one-minute tour
          </Link>{" "}
          — or just check your first meal above.
        </p>
      </section>
    );
  }

  return (
    <section className="surface-card daily-loop-card" data-testid="daily-loop">
      <div className="daily-loop-header">
        <h2 className="section-title">Today</h2>
        <StreakChip daysThisWeek={daysThisWeek} />
      </div>
      {showFirstWin(streak, today.length) ? (
        <div className="first-win" data-testid="first-win">
          <p className="status-eyebrow">Day 1</p>
          <p className="page-copy">
            That&apos;s Day 1. One honest check a day is the whole habit.
          </p>
        </div>
      ) : null}
      <TodayList checks={today} />
      {insight ? <InsightCard insight={insight} /> : null}
      <NudgeOptIn />
      <p className="page-copy">
        <Link href="/history" className="inline-link">
          See your week
        </Link>
      </p>
    </section>
  );
}
