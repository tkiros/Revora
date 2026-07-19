"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { learningJourneyUiEnabled } from "../lib/learning-journey-flag";

/**
 * 90-day Learning Journey card (plan §P4.1). The smallest consistent surface:
 * one card on the progress page (the app's existing longitudinal home), showing
 * the journey state, the current stage name + day, and start / pause / resume.
 *
 * Graduation and maintenance are Task 20 (with pause reasons), so this card
 * exposes only start/pause/resume — even though the server state machine already
 * supports the full set. A journey that has reached `graduated`/`maintenance` (or
 * completed day 90) renders a read-only status line rather than an action it
 * cannot yet drive.
 *
 * Ships behind the CLIENT build flag (`NEXT_PUBLIC_LEARNING_JOURNEY`): a build
 * with the flag off renders nothing at all (returns null), so the surface simply
 * does not exist until an approved rollout (global constraint §10). Error-truth
 * (global constraint §7): a backend fault is an explicit retry state, never a
 * paywall/"locked".
 */

type ViewStatus =
  | "loading"
  | "guest"
  | "unavailable"
  | "error"
  | "ready";

type StageDescriptor = {
  stage: number;
  startDay: number;
  endDay: number;
  name: string;
  focus: string;
};

type JourneyView = {
  state: "not_started" | "active" | "paused" | "graduated" | "maintenance";
  day: number;
  stage: number | null;
  isComplete: boolean;
};

type JourneyPayload = {
  journey: JourneyView;
  currentStage: StageDescriptor | null;
};

function isPayload(value: unknown): value is JourneyPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { journey?: unknown }).journey === "object" &&
    (value as { journey: { state?: unknown } }).journey !== null
  );
}

export function JourneyCard() {
  const enabled = learningJourneyUiEnabled();
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [payload, setPayload] = useState<JourneyPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/journey", { cache: "no-store" });
      if (response.status === 401) {
        setStatus("guest");
        return;
      }
      // 403 (not premium) or 404 (server flag off) → the card simply isn't
      // available; render nothing rather than a paywall (global constraint §7).
      if (response.status === 403 || response.status === 404) {
        setStatus("unavailable");
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
    if (!enabled) {
      return;
    }
    void load();
  }, [enabled, load]);

  const act = useCallback(
    async (action: "start" | "pause" | "resume") => {
      setBusy(true);
      setActionError(false);
      try {
        const response = await fetch("/api/journey", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action })
        });
        if (!response.ok) {
          // Includes a 409 if the state drifted under us — surface a retry, then
          // reload the true state so the buttons re-sync.
          setActionError(true);
          await load();
          return;
        }
        const body: unknown = await response.json();
        if (isPayload(body)) {
          setPayload(body);
          setStatus("ready");
        } else {
          await load();
        }
      } catch {
        setActionError(true);
      } finally {
        setBusy(false);
      }
    },
    [load]
  );

  // Flag off → the surface does not exist.
  if (!enabled) {
    return null;
  }

  // Non-premium / flag-off-server → render nothing; the page's own gating owns
  // the premium messaging, and the journey must never appear as a paywall here.
  if (status === "unavailable") {
    return null;
  }

  if (status === "loading") {
    return (
      <section className="surface-card hero-card" data-testid="journey-card">
        <p className="hero-eyebrow">Learning journey</p>
        <p className="page-copy">Loading your journey…</p>
      </section>
    );
  }

  if (status === "guest") {
    return (
      <section
        className="surface-card hero-card"
        data-testid="journey-card"
      >
        <p className="hero-eyebrow">Learning journey</p>
        <p className="page-copy">
          <Link className="inline-link" href="/signin">
            Sign in
          </Link>{" "}
          to start your 90-day learning journey.
        </p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section
        className="surface-card hero-card"
        data-testid="journey-card"
        aria-live="polite"
      >
        <p className="hero-eyebrow">Learning journey</p>
        <h2 className="section-title">Journey is temporarily unavailable</h2>
        <p className="page-copy">
          We couldn&apos;t load your journey just now. This is on our side —
          nothing you did.
        </p>
        <button
          type="button"
          className="primary-button"
          data-testid="journey-retry"
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

  const journey = payload?.journey;
  const stage = payload?.currentStage ?? null;
  if (!journey) {
    return null;
  }

  return (
    <section
      className="surface-card hero-card"
      data-testid="journey-card"
      data-journey-state={journey.state}
    >
      <p className="hero-eyebrow">Learning journey</p>

      {journey.state === "not_started" ? (
        <>
          <h2 className="section-title">Your 90-day learning journey</h2>
          <p className="page-copy">
            A calm, staged way to get comfortable reading the card and building
            choices that fit your life. Start whenever you like — you can pause
            any time, and it never changes how a meal is checked.
          </p>
          <button
            type="button"
            className="primary-button"
            data-testid="journey-start"
            disabled={busy}
            onClick={() => void act("start")}
          >
            {busy ? "Starting…" : "Start the journey"}
          </button>
        </>
      ) : null}

      {journey.state === "active" || journey.state === "paused" ? (
        <>
          <h2 className="section-title" data-testid="journey-stage-name">
            {stage ? `Stage ${stage.stage}: ${stage.name}` : "Your journey"}
          </h2>
          <p className="page-copy" data-testid="journey-day">
            Day {journey.day}
            {journey.state === "paused" ? " · Paused" : ""}
          </p>
          {stage ? <p className="page-copy">{stage.focus}</p> : null}

          {journey.state === "active" ? (
            <button
              type="button"
              className="recheck-button"
              data-testid="journey-pause"
              disabled={busy}
              onClick={() => void act("pause")}
            >
              {busy ? "…" : "Pause"}
            </button>
          ) : (
            <button
              type="button"
              className="primary-button"
              data-testid="journey-resume"
              disabled={busy}
              onClick={() => void act("resume")}
            >
              {busy ? "…" : "Resume"}
            </button>
          )}
        </>
      ) : null}

      {journey.state === "graduated" || journey.state === "maintenance" ? (
        <>
          <h2 className="section-title">
            {journey.state === "graduated"
              ? "You finished your journey"
              : "Maintenance mode"}
          </h2>
          <p className="page-copy">
            Nice work reaching this point. More options for what comes next are
            on the way.
          </p>
        </>
      ) : null}

      {actionError ? (
        <p className="field-hint" data-testid="journey-action-error">
          That didn&apos;t go through. Please try again.
        </p>
      ) : null}
    </section>
  );
}
