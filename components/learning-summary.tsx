"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { track } from "../lib/client/analytics";

/**
 * "Your learning summary" (plan §P4.2). The Premium weekly value: a deterministic,
 * plainly-named projection of what the user explored, saved, and is still
 * checking on — REPLACING the BAI block on the progress page when the Learning
 * Journey build flag is on (the progress page owns the swap). It is a learning
 * SUMMARY, never a score: no band, no aggregate percentage, no prediction.
 *
 * Self-gating + error-truth (global constraints §6, §7): it fetches the
 * already-server-gated /api/journey/weekly and, for guest (401) or
 * not-available (403/404), renders NOTHING — the page's own states own the
 * sign-in / premium messaging, and a summary must never appear as a paywall. A
 * real backend fault (5xx / network) is an explicit retry state, never "locked".
 *
 * `weekly_learning_viewed {stage}` fires once when a summary with an active
 * journey stage renders (§10.1). The stage is the only prop — the artifact text
 * (which echoes the user's own meals) never reaches analytics.
 */

type ContextLabel =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "restaurant"
  | "travel"
  | "family_meal"
  | "other";

type Artifact = {
  version: string;
  weekStart: string;
  mealsExplored: number;
  savedChoices: number;
  contextsCovered: ContextLabel[];
  repeatedUncertainty: string[];
  incompleteSteps: string[];
  nextExploration: string;
};

type WeeklyPayload = {
  version: string;
  stage: number | null;
  current: Artifact;
  history: Artifact[];
};

type ViewStatus = "loading" | "hidden" | "error" | "ready";

const LABEL_DISPLAY: Record<ContextLabel, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  restaurant: "Restaurant",
  travel: "Travel",
  family_meal: "Family meal",
  other: "Other"
};

function isArtifact(value: unknown): value is Artifact {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const a = value as Record<string, unknown>;
  return (
    typeof a.weekStart === "string" &&
    typeof a.mealsExplored === "number" &&
    typeof a.savedChoices === "number" &&
    Array.isArray(a.contextsCovered) &&
    Array.isArray(a.repeatedUncertainty) &&
    Array.isArray(a.incompleteSteps) &&
    typeof a.nextExploration === "string"
  );
}

function isPayload(value: unknown): value is WeeklyPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const p = value as Record<string, unknown>;
  return (
    isArtifact(p.current) &&
    Array.isArray(p.history) &&
    p.history.every(isArtifact)
  );
}

function formatWeekStart(weekStart: string): string {
  const date = new Date(`${weekStart}T00:00:00.000Z`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
}

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function LearningSummary({
  onResolved
}: {
  /**
   * Reports up whether this summary is occupying the progress surface (U10).
   * `false` means it rendered NOTHING (guest / not-premium / flag-off self-null),
   * so the page must fall back to its BAI blocks rather than leave a blank page.
   */
  onResolved?: (shown: boolean) => void;
} = {}) {
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [payload, setPayload] = useState<WeeklyPayload | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/journey/weekly", { cache: "no-store" });
      // Guest (401) or not-available (403 not premium / 404 flag off): the page
      // owns that messaging — render nothing here, never a paywall.
      if (
        response.status === 401 ||
        response.status === 403 ||
        response.status === 404
      ) {
        setStatus("hidden");
        return;
      }
      if (!response.ok) {
        setStatus("error");
        return;
      }
      const body: unknown = await response.json();
      if (!isPayload(body)) {
        setStatus("error");
        return;
      }
      setPayload(body);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Fire the view event once per successful render that has an active stage.
  useEffect(() => {
    if (status !== "ready" || !payload || payload.stage == null) {
      return;
    }
    const stage = payload.stage;
    if (stage >= 1 && stage <= 5) {
      track({
        name: "weekly_learning_viewed",
        props: { stage: String(stage) as "1" | "2" | "3" | "4" | "5" }
      });
    }
  }, [status, payload]);

  // Whether we render any surface at all. We render NOTHING only when hidden
  // (guest / not-premium / flag-off) or when a "ready" payload has no current
  // artifact — in both cases the progress page must show BAI instead (U10). A
  // loading/error card DOES occupy the surface, so BAI stays suppressed then.
  const rendersSurface =
    status === "loading" ||
    status === "error" ||
    (status === "ready" && payload?.current != null);

  useEffect(() => {
    onResolved?.(rendersSurface);
  }, [rendersSurface, onResolved]);

  if (status === "hidden") {
    return null;
  }

  if (status === "loading") {
    return (
      <section className="surface-card hero-card" data-testid="learning-summary">
        <p className="hero-eyebrow">Your learning summary</p>
        <p className="page-copy">Loading your summary…</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section
        className="surface-card hero-card"
        data-testid="learning-summary"
        aria-live="polite"
      >
        <p className="hero-eyebrow">Your learning summary</p>
        <h2 className="section-title">Your summary is temporarily unavailable</h2>
        <p className="page-copy">
          We couldn&apos;t load your learning summary just now. Your checks are
          safe — this is on our side, not yours.
        </p>
        <button
          type="button"
          className="primary-button"
          data-testid="learning-summary-retry"
          onClick={() => {
            setStatus("loading");
            void load();
          }}
        >
          Try again
        </button>
      </section>
    );
  }

  const current = payload?.current;
  if (!current) {
    return null;
  }

  const hasActivity =
    current.mealsExplored > 0 ||
    current.savedChoices > 0 ||
    current.repeatedUncertainty.length > 0;

  return (
    <section
      className="surface-card hero-card"
      data-testid="learning-summary"
      data-stage={payload?.stage ?? ""}
    >
      <p className="hero-eyebrow">Your learning summary</p>
      <h2 className="section-title">Week of {formatWeekStart(current.weekStart)}</h2>

      {hasActivity ? (
        <p className="page-copy" data-testid="learning-summary-counts">
          {count(current.mealsExplored, "meal explored", "meals explored")} ·{" "}
          {count(current.savedChoices, "choice saved", "choices saved")}
        </p>
      ) : (
        <p className="page-copy" data-testid="learning-summary-empty">
          No checks yet this week. Check a meal and your summary fills in — it is
          built only from what you do, never a prediction.
        </p>
      )}

      {current.contextsCovered.length > 0 ? (
        <div className="memory-chip-row" data-testid="learning-summary-contexts">
          {current.contextsCovered.map((label) => (
            <span key={label} className="memory-chip">
              {LABEL_DISPLAY[label]}
            </span>
          ))}
        </div>
      ) : null}

      {current.repeatedUncertainty.length > 0 ? (
        <div data-testid="learning-summary-uncertainty">
          <p className="field-hint">Still checking on</p>
          <ul className="plain-list">
            {current.repeatedUncertainty.map((food) => (
              <li key={food}>{food}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {current.incompleteSteps.length > 0 ? (
        <div data-testid="learning-summary-steps">
          <p className="field-hint">Still to explore</p>
          <ul className="plain-list">
            {current.incompleteSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="page-copy" data-testid="learning-summary-next">
        <strong>Next:</strong> {current.nextExploration}
      </p>

      {payload && payload.history.length > 0 ? (
        <details className="learning-summary-history" data-testid="learning-summary-history">
          <summary>Earlier weeks</summary>
          <ul className="plain-list">
            {payload.history.map((week) => (
              <li key={week.weekStart}>
                Week of {formatWeekStart(week.weekStart)} —{" "}
                {count(week.mealsExplored, "meal", "meals")},{" "}
                {count(week.savedChoices, "choice", "choices")}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
