"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DisclaimerLine } from "../../components/disclaimer-line";
import type { StoredCheck } from "../../lib/client/history-store";
import { loadHistory } from "../../lib/client/remote-history";
import { dayKeyLocal as localDayKey, verdictWeekView } from "../../lib/coach/days";

const RISK_LABELS = {
  SAFE: "Clear",
  MODERATE: "Be careful",
  HIGH: "Hold off"
} as const;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HistoryPage() {
  const router = useRouter();
  const [recent, setRecent] = useState<StoredCheck[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { checks } = await loadHistory(7);
      if (!cancelled) {
        setRecent(checks);
        setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Verdict-colored dots: shared worst-of-day rule (lib/coach/days.ts) so the
  // dashboard and this strip can never disagree.
  const weekStrip = verdictWeekView(recent, localDayKey).map((day) => ({
    ...day,
    label: DAY_LABELS[new Date(`${day.key}T00:00:00`).getDay()]
  }));

  function recheck(food: string) {
    try {
      window.sessionStorage.setItem("revora.recheck", food);
    } catch {
      // best-effort prefill only
    }
    router.push("/check");
  }

  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Your week</p>
          <h1 className="page-title">Meal memory</h1>
          <p className="page-copy">
            The last seven days of checks on this device. A dot means you
            checked in that day.
          </p>
          <ol className="week-strip" data-testid="week-strip">
            {weekStrip.map((day) => (
              <li
                key={day.key}
                className="week-day"
                data-checked={day.checked || undefined}
              >
                <span className="week-day-label">{day.label}</span>
                <span
                  aria-hidden="true"
                  className={day.checked ? "week-dot week-dot-on" : "week-dot"}
                  data-risk={day.risk}
                />
                <span className="sr-only">
                  {day.checked ? "checked in" : "no checks"}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="surface-card hero-card">
          <h2 className="section-title">Recent checks</h2>
          {!hydrated ? (
            <p className="page-copy">Loading your week…</p>
          ) : recent.length === 0 ? (
            <div className="empty-state" data-testid="history-empty">
              <p>
                Nothing here yet. Check your next meal and it will show up on
                this page.
              </p>
              <Link className="recheck-button link-button" href="/check">
                Check a meal
              </Link>
            </div>
          ) : (
            <ul className="history-list" data-testid="history-list">
              {recent.map((check) => (
                <li
                  key={check.clientId}
                  className="history-item"
                  data-risk={check.risk}
                >
                  <div className="history-item-main">
                    <span className="today-food">{check.food}</span>
                    <span className="today-risk" data-risk={check.risk}>
                      {RISK_LABELS[check.risk]}
                    </span>
                  </div>
                  <div className="history-item-meta">
                    <span className="history-time">
                      {new Date(check.createdAt).toLocaleDateString(undefined, {
                        weekday: "short",
                        hour: "numeric",
                        minute: "2-digit"
                      })}
                    </span>
                    <button
                      type="button"
                      className="recheck-button"
                      data-testid="recheck-button"
                      onClick={() => recheck(check.food)}
                    >
                      Check again
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <DisclaimerLine />

        <footer className="page-footer">
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </footer>
      </div>
    </main>
  );
}
