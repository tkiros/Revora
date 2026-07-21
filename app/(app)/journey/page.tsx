"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DisclaimerLine } from "../../../components/disclaimer-line";
import { JourneyCard } from "../../../components/journey-card";
import { LearningSummary } from "../../../components/learning-summary";
import { BAI_BAND_COPY, bandOf, type BaiBand } from "../../../lib/coach/bai";
import { learningJourneyUiEnabled } from "../../../lib/learning-journey-flag";
import {
  resolveProgressState,
  shouldShowBai,
  type LatestBai,
  type ProgressState
} from "../../../lib/coach/progress-state";
import { SUPPORT_EMAIL } from "../../../lib/revora/contact";

// The support path used across the app (privacy/terms/account) — a plain
// mailto so an outage surface never dead-ends the user.

/**
 * Progress / BAI view (plan P6). Fetches the already-premium-gated
 * `/api/coach` response — no new API surface. `latestBai` only ever holds
 * the single most recent computed week (app/api/coach/route.ts), so there is
 * no week-over-week trend to show without adding a history endpoint; per the
 * plan this page renders the latest week only.
 *
 * Behavioral, never predictive: the three components are shown as labelled
 * qualitative bars, not a numeric line chart, and the band message is the
 * single audited source in lib/coach/bai.ts (BAI_BAND_COPY).
 */

const QUALITATIVE_LABELS: Array<{ min: number; label: string }> = [
  { min: 80, label: "Strong" },
  { min: 60, label: "Good" },
  { min: 40, label: "Building" },
  { min: 0, label: "Just starting" }
];

function qualitativeLabel(percent: number): string {
  return (
    QUALITATIVE_LABELS.find((entry) => percent >= entry.min)?.label ??
    "Just starting"
  );
}

function BaiBar({ label, percent }: { label: string; percent: number }) {
  const qualitative = qualitativeLabel(percent);
  // Fill animates from 0 on mount (width transition in globals.css);
  // prefers-reduced-motion zeroes the transition so it just appears.
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(percent));
    return () => cancelAnimationFrame(frame);
  }, [percent]);
  return (
    <div className="bai-bar-row">
      <span className="bai-bar-label">{label}</span>
      <div
        className="bai-bar-track"
        role="img"
        aria-label={`${label}: ${qualitative}`}
      >
        <div className="bai-bar-fill" style={{ width: `${width}%` }} />
      </div>
      <span className="bai-bar-qual">{qualitative}</span>
    </div>
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

export default function ProgressPage() {
  // When the Learning Journey build flag is on, the plainly-named weekly
  // "Your learning summary" (plan §P4.2) REPLACES the BAI band block below; with
  // the flag off, the BAI behavior is unchanged. The BAI cron still runs and
  // /api/coach still returns it — this only swaps the SURFACE.
  const learningEnabled = learningJourneyUiEnabled();
  const [state, setState] = useState<ProgressState>("loading");
  const [latestBai, setLatestBai] = useState<LatestBai | null>(null);
  // Whether the learning summary actually rendered a surface. Defaults true so
  // BAI stays hidden while the summary loads (no flash); it flips false only if
  // the summary self-nulls (guest / not-premium / flag-off), at which point BAI
  // becomes the honest fallback rather than a blank page (U10).
  const [learningShown, setLearningShown] = useState(true);
  const handleLearningResolved = useCallback((shown: boolean) => {
    setLearningShown(shown);
  }, []);
  // Bumped by the Retry button — bounded, manual retry only (no auto-retry
  // storms against an already-struggling backend).
  const [reloadNonce, setReloadNonce] = useState(0);

  const retry = useCallback(() => {
    setState("loading");
    setReloadNonce((nonce) => nonce + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/coach", { cache: "no-store" });
        if (cancelled) {
          return;
        }

        // Parse defensively: a 2xx with malformed JSON is an outage, not data.
        let body: unknown = null;
        try {
          body = await response.json();
        } catch {
          body = null;
        }
        if (cancelled) {
          return;
        }

        const resolved = resolveProgressState({
          outcome: "response",
          ok: response.ok,
          status: response.status,
          body
        });
        setLatestBai(resolved.latestBai);
        setState(resolved.state);
      } catch {
        if (!cancelled) {
          // fetch threw (offline / DNS / abort) → unavailable, never locked.
          setState(resolveProgressState({ outcome: "network" }).state);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadNonce]);

  const band: BaiBand | null = latestBai ? bandOf(latestBai.score) : null;
  const bandCopy = band ? BAI_BAND_COPY[band] : null;
  // Show BAI when the flag is off, OR when the learning summary rendered nothing.
  const showBai = shouldShowBai(learningEnabled, learningShown);

  return (
    <div className="app-content--narrow">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Progress</p>
          <h1 className="page-title">Your weekly progress</h1>
          <p className="page-copy">
            A behavioral view of your week — what you checked in on and
            followed through with, never a prediction about a lab result.
          </p>
        </section>

        {/* Learning journey (Task 17). Self-gating: renders nothing unless the
            build flag is on AND the caller is an entitled premium user, so it is
            invisible for free users and pre-rollout builds. */}
        <JourneyCard />

        {/* Premium weekly value (plan §P4.2). Self-gating + error-truthful; when
            the flag is on it renders in place of the BAI band block below (which
            is suppressed while `learningEnabled`). For guest / non-premium it
            renders nothing — the BAI states below still own that messaging. */}
        {learningEnabled ? (
          <LearningSummary onResolved={handleLearningResolved} />
        ) : null}

        {state === "loading" ? (
          <section className="surface-card hero-card">
            <p className="page-copy">Loading your week…</p>
          </section>
        ) : null}

        {state === "unauthenticated" ? (
          <section
            className="surface-card hero-card"
            data-testid="progress-unauthenticated"
          >
            <h2 className="section-title">Sign in to see your progress</h2>
            <p className="page-copy">
              Your weekly progress lives with your account. Sign in and it
              syncs back — nothing is lost.
            </p>
            <Link
              className="primary-button link-button"
              href="/signin"
              data-testid="progress-signin-link"
            >
              Sign in
            </Link>
          </section>
        ) : null}

        {state === "free" ? (
          <section className="surface-card hero-card" data-testid="progress-locked">
            <h2 className="section-title">Progress is part of Premium</h2>
            <p className="page-copy">
              The weekly progress view — your check-in consistency and
              follow-through, computed every Monday — is one of the things
              Premium keeps around, so a good week is something you can see,
              not just remember.
            </p>
            <Link
              className="primary-button link-button"
              href="/subscribe"
              data-testid="progress-subscribe-link"
            >
              See what Premium includes
            </Link>
          </section>
        ) : null}

        {state === "unavailable" ? (
          <section
            className="surface-card hero-card"
            data-testid="progress-unavailable"
            aria-live="polite"
          >
            <h2 className="section-title">Progress is temporarily unavailable</h2>
            <p className="page-copy">
              We couldn&apos;t load your weekly progress just now. Your checks
              are safe — this is on our side, not yours.
            </p>
            <button
              type="button"
              className="primary-button"
              data-testid="progress-retry"
              onClick={retry}
            >
              Try again
            </button>
            <p className="field-hint">
              Still stuck? Email{" "}
              <a className="inline-link" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        ) : null}

        {state === "empty" && showBai ? (
          <section className="surface-card hero-card" data-testid="progress-empty">
            <h2 className="section-title">Building your first week</h2>
            <p className="page-copy">
              Your first weekly progress appears after your first full week
              of checking in, computed Monday morning. Check your next meal
              to get started.
            </p>
            <Link className="recheck-button link-button" href="/check">
              Check a meal
            </Link>
          </section>
        ) : null}

        {state === "ready" && latestBai && bandCopy && showBai ? (
          <section className="surface-card hero-card" data-testid="progress-bands">
            <p className="hero-eyebrow">
              Week of {formatWeekStart(latestBai.weekStart)}
            </p>
            <div className="bai-band-badge" data-band={band}>
              {bandCopy.label}
            </div>
            <p className="page-copy">{bandCopy.message}</p>

            <div className="bai-bar-list">
              <BaiBar label="Check-in days" percent={latestBai.adherence} />
              <BaiBar label="Check-in rhythm" percent={latestBai.consistency} />
              {latestBai.prompted > 0 ? (
                <BaiBar label="Follow-through" percent={latestBai.action} />
              ) : (
                <div
                  className="bai-bar-row bai-bar-row-note"
                  data-testid="bai-no-prompts"
                >
                  <span className="bai-bar-label">Follow-through</span>
                  <span className="bai-bar-note">
                    No follow-up prompts this week — nothing you needed to
                    act on.
                  </span>
                </div>
              )}
            </div>
          </section>
        ) : null}

        <section className="surface-card hero-card">
          <p className="page-copy">
            Curious how this is computed, and what it is not?{" "}
            <Link className="inline-link" href="/how-it-works">
              How this works
            </Link>
            .
          </p>
        </section>

        <DisclaimerLine />

        <footer className="page-footer">
          <Link href="/">Home</Link>
          <Link href="/history">History</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </footer>
    </div>
  );
}
