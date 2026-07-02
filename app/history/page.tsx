"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { StoredCheck } from "../../lib/client/history-store";
import { loadHistory } from "../../lib/client/remote-history";
import { dayKeyLocal as localDayKey } from "../../lib/coach/days";

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

  const checkedDays = new Set(
    recent.map((check) => localDayKey(new Date(check.createdAt)))
  );

  const weekStrip = Array.from({ length: 7 }, (_, offset) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - offset));
    return {
      key: localDayKey(day),
      label: DAY_LABELS[day.getDay()],
      checked: checkedDays.has(localDayKey(day))
    };
  });

  function recheck(food: string) {
    try {
      window.sessionStorage.setItem("revora.recheck", food);
    } catch {
      // best-effort prefill only
    }
    router.push("/");
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
                />
                <span className="sr-only">
                  {day.checked ? "checked in" : "no checks"}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="surface-card">
          <h2 className="section-title">Recent checks</h2>
          {!hydrated ? (
            <p className="page-copy">Loading your week…</p>
          ) : recent.length === 0 ? (
            <p className="page-copy" data-testid="history-empty">
              Nothing here yet. Check your next meal and it will show up on
              this page.
            </p>
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
                    <span className="today-risk">
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

        <footer className="page-footer">
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </main>
  );
}
