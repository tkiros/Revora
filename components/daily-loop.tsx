"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { historyStore, type StoredCheck } from "../lib/client/history-store";
import { deriveInsight, type CoachInsight } from "../lib/coach/insights";
import { InsightCard } from "./insight-card";
import { StreakChip } from "./streak-chip";
import { TodayList } from "./today-list";

/**
 * The home daily loop (plan P3): today's checks, the streak, one insight.
 * Reads on-device history after hydration; renders nothing for brand-new
 * visitors so the one-shot check stays front and center.
 */
export function DailyLoop() {
  const [today, setToday] = useState<StoredCheck[]>([]);
  const [streak, setStreak] = useState(0);
  const [insight, setInsight] = useState<CoachInsight | null>(null);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    const all = historyStore.all();
    setHasHistory(all.length > 0);
    setToday(historyStore.today());
    setStreak(historyStore.streak());
    setInsight(deriveInsight(historyStore.recent(7)));
  }, []);

  if (!hasHistory) {
    return (
      <section className="surface-card daily-loop-card" data-testid="daily-loop-empty">
        <p className="page-copy">
          New here?{" "}
          <Link href="/onboarding" className="inline-link">
            Take the one-minute tour
          </Link>{" "}
          — or just check your first meal below.
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
      <p className="page-copy">
        <Link href="/history" className="inline-link">
          See your week
        </Link>
      </p>
    </section>
  );
}
