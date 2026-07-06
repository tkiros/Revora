"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DisclaimerLine } from "../../components/disclaimer-line";
import { BAI_BAND_COPY, bandOf, type BaiBand } from "../../lib/coach/bai";

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

type LatestBai = {
  weekStart: string;
  score: number;
  adherence: number;
  consistency: number;
  action: number;
  prompted: number;
};

type CoachResponse = {
  tier: "free" | "premium";
  latestBai: LatestBai | null;
};

type PageState = "loading" | "locked" | "empty" | "ready";

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
  return (
    <div className="bai-bar-row">
      <span className="bai-bar-label">{label}</span>
      <div
        className="bai-bar-track"
        role="img"
        aria-label={`${label}: ${qualitative}`}
      >
        <div className="bai-bar-fill" style={{ width: `${percent}%` }} />
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
  const [state, setState] = useState<PageState>("loading");
  const [latestBai, setLatestBai] = useState<LatestBai | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/coach", { cache: "no-store" });
        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          setState("locked");
          return;
        }

        const body = (await response.json()) as CoachResponse;
        if (body.tier !== "premium") {
          setState("locked");
          return;
        }

        if (!body.latestBai) {
          setState("empty");
          return;
        }

        setLatestBai(body.latestBai);
        setState("ready");
      } catch {
        setState("locked");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const band: BaiBand | null = latestBai ? bandOf(latestBai.score) : null;
  const bandCopy = band ? BAI_BAND_COPY[band] : null;

  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Progress</p>
          <h1 className="page-title">Your weekly progress</h1>
          <p className="page-copy">
            A behavioral view of your week — what you checked in on and
            followed through with, never a prediction about a lab result.
          </p>
        </section>

        {state === "loading" ? (
          <section className="surface-card">
            <p className="page-copy">Loading your week…</p>
          </section>
        ) : null}

        {state === "locked" ? (
          <section className="surface-card" data-testid="progress-locked">
            <h2 className="section-title">Progress is part of Premium</h2>
            <p className="page-copy">
              The weekly progress view — your check-in consistency and
              follow-through, computed every Monday — is one of the things
              Premium keeps around. The check itself stays free, every day.
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

        {state === "empty" ? (
          <section className="surface-card" data-testid="progress-empty">
            <h2 className="section-title">Building your first week</h2>
            <p className="page-copy">
              Your first weekly progress appears after your first full week
              of checking in, computed Monday morning. Check your next meal
              to get started.
            </p>
            <Link className="recheck-button link-button" href="/">
              Check a meal
            </Link>
          </section>
        ) : null}

        {state === "ready" && latestBai && bandCopy ? (
          <section className="surface-card" data-testid="progress-bands">
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

        <section className="surface-card">
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
    </main>
  );
}
