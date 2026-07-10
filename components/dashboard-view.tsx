import Link from "next/link";
import type { ReactNode } from "react";

import type { VerdictWeekDay } from "../lib/coach/days";
import type { StoredCheck } from "../lib/client/history-store";
import type { PlanBoxData } from "../lib/server/plan-box";
import { IconAlert, IconCheck, IconPause } from "./icons";
import { PlanBox } from "./plan-box";
import { TodayList } from "./today-list";

/**
 * The dashboard's one presentational tree (eng amendment: one prop-driven
 * <DashboardView>, two data sources) — rendered by the server page for
 * signed-in users and by <GuestDashboard> from localStorage. No hooks, no
 * data fetching; everything arrives as props.
 *
 * Reassurance rules (design doc premise 2): additive copy only, unchecked
 * days are neutral, nothing here can "break".
 */

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
] as const;

const RISK_WORD = {
  SAFE: "clear",
  MODERATE: "be careful",
  HIGH: "hold off"
} as const;

export type ProgressBar = { label: string; caption: string; percent: number };

export type ProgressSection =
  | { kind: "real"; bars: ProgressBar[] }
  | { kind: "example" }
  | { kind: "hidden" };

export type DashboardData = {
  todayLabel: string;
  weekSummary: string;
  showFirstWin: boolean;
  week: VerdictWeekDay[];
  todayChecks: StoredCheck[];
  progress: ProgressSection;
  planBox: PlanBoxData;
  isDay0: boolean;
};

const EXAMPLE_BARS: ProgressBar[] = [
  { label: "Check-in days", caption: "Example", percent: 60 },
  { label: "Rhythm", caption: "Example", percent: 50 },
  { label: "Follow-through", caption: "Example", percent: 72 }
];

function DayMark({ day }: { day: VerdictWeekDay }) {
  if (!day.risk) {
    return (
      <span aria-hidden="true" className="dash-daymark">
        <span className="dash-day-dot" />
      </span>
    );
  }
  const Icon =
    day.risk === "SAFE" ? IconCheck : day.risk === "MODERATE" ? IconAlert : IconPause;
  return (
    <span aria-hidden="true" className="dash-daymark" data-risk={day.risk}>
      <Icon size={15} />
    </span>
  );
}

function WeekStrip({ week, isDay0 }: { week: VerdictWeekDay[]; isDay0: boolean }) {
  const todayKey = week[week.length - 1]?.key;

  return (
    <section className="dash-card" aria-label="This week">
      <h3 className="dash-sect-title">This week</h3>
      <ol className="dash-week" data-testid="dash-week">
        {week.map((day) => {
          const date = new Date(`${day.key}T00:00:00`);
          const dayName = DAY_NAMES[date.getDay()];
          const srText = day.risk
            ? `${dayName} — checked, most careful verdict ${RISK_WORD[day.risk]}`
            : `${dayName} — no meals checked`;
          return (
            <li
              key={day.key}
              className="dash-day"
              data-today={day.key === todayKey || undefined}
            >
              <span aria-hidden="true" className="dash-day-dow">
                {DAY_LETTERS[date.getDay()]}
              </span>
              <DayMark day={day} />
              <span className="sr-only">{srText}</span>
            </li>
          );
        })}
      </ol>
      {isDay0 ? (
        <p className="dash-preview-note" data-testid="dash-day0-note">
          Your week fills in here as you check meals. Each day shows its most
          careful verdict — quiet on days you don&apos;t check, never marked
          against you.
        </p>
      ) : (
        <div className="dash-week-legend" aria-hidden="true">
          <span className="dash-legend-item">
            <span className="dash-legend-mark" data-risk="SAFE">
              <IconCheck size={11} />
            </span>
            Clear
          </span>
          <span className="dash-legend-item">
            <span className="dash-legend-mark" data-risk="MODERATE">
              <IconAlert size={11} />
            </span>
            Be careful
          </span>
          <span className="dash-legend-item">
            <span className="dash-legend-mark" data-risk="HIGH">
              <IconPause size={11} />
            </span>
            Hold off
          </span>
          <span className="dash-legend-item">
            <span className="dash-legend-mark" data-none="">
              <span className="dash-day-dot" />
            </span>
            No check
          </span>
        </div>
      )}
    </section>
  );
}

function ProgressCard({ progress }: { progress: ProgressSection }) {
  if (progress.kind === "hidden") {
    return null;
  }
  const bars = progress.kind === "real" ? progress.bars : EXAMPLE_BARS;

  return (
    <section
      className="dash-card"
      aria-label="This week's progress"
      data-testid="dash-progress"
    >
      <h3 className="dash-sect-title">This week&apos;s progress</h3>
      {progress.kind === "example" ? (
        <div className="dash-example-tag" data-testid="dash-progress-example">
          Example — this is how it looks
        </div>
      ) : null}
      {bars.map((bar) => (
        <div className="dash-bai-row" key={bar.label}>
          <div className="dash-bai-top">
            <span className="dash-bai-label">{bar.label}</span>
            <span className="dash-bai-qual">{bar.caption}</span>
          </div>
          <div className="dash-bai-track">
            <div
              className="dash-bai-fill"
              data-example={progress.kind === "example" ? "" : undefined}
              style={{ width: `${bar.percent}%` }}
            />
          </div>
        </div>
      ))}
      {progress.kind === "example" ? (
        <p className="dash-upgrade-line">
          <Link href="/subscribe">Upgrade to see your own progress</Link>
        </p>
      ) : null}
    </section>
  );
}

export function DashboardView({
  data,
  insightSlot
}: {
  data: DashboardData;
  /** Insight card element (server: hydrating card; guest: plain card). */
  insightSlot: ReactNode;
}) {
  return (
    <div data-testid="dashboard">
      {data.showFirstWin ? (
        <div className="first-win" style={{ marginBottom: 16 }}>
          <p className="status-eyebrow">Day 1</p>
          <p className="page-copy">
            That&apos;s Day 1. One honest check a day is the whole habit —
            nothing to keep up, just a place to look back.
          </p>
        </div>
      ) : null}

      <div className="dash-greet">
        <p className="dash-greet-date">{data.todayLabel}</p>
        <p className="dash-greet-sum" data-testid="dash-summary">
          {data.weekSummary}
        </p>
      </div>

      <div className="dash-grid">
        <div className="dash-col">
          <div className="dash-cta">
            <p className="dash-cta-eyebrow">The one thing to do</p>
            <h2>Should I eat this?</h2>
            <p>
              Describe what you&apos;re about to eat. You&apos;ll get a calm
              verdict, one reason, one thing to do, and a safer swap.
            </p>
            <Link className="dash-cta-button" href="/check" data-testid="dash-check-cta">
              Check a meal
            </Link>
          </div>

          <WeekStrip week={data.week} isDay0={data.isDay0} />

          <section className="dash-card" aria-label="Today">
            <h3 className="dash-sect-title">Today</h3>
            <TodayList checks={data.todayChecks} />
          </section>
        </div>

        <div className="dash-col">
          <PlanBox data={data.planBox} />
          {insightSlot}
          <ProgressCard progress={data.progress} />
        </div>
      </div>
    </div>
  );
}
