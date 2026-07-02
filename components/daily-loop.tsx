"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { historyStore, type StoredCheck } from "../lib/client/history-store";
import { loadHistory, syncLocalHistory } from "../lib/client/remote-history";
import { computeStreak, dayKeyLocal } from "../lib/coach/days";
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
  const [insight, setInsight] = useState<CoachInsight | null>(null);
  const [hasHistory, setHasHistory] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Local first for instant paint, then the server view when available.
      const local = historyStore.all();
      if (!cancelled && local.length > 0) {
        applyChecks(historyStore.recent(7));
      }

      const { source, checks } = await loadHistory(7);
      if (cancelled) {
        return;
      }

      if (source === "server") {
        // Bring any device-only checks along, then trust the server view.
        void syncLocalHistory();
        applyChecks(checks);
      } else if (local.length === 0) {
        setHasHistory(false);
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
      setInsight(deriveInsight(checks));
      setHasHistory(checks.length > 0);
    }

    return () => {
      cancelled = true;
    };
  }, []);

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
        <StreakChip streak={streak} />
      </div>
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
