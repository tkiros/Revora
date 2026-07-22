"use client";

import Link from "next/link";

/**
 * Dashboard error boundary (eng amendment: a data hiccup must never block
 * checking a meal — the check CTA always renders). Calm, next-step-first
 * copy per DESIGN.md §Voice.
 */
export default function HomeError({ reset }: { reset: () => void }) {
  return (
    <div className="dash-card" data-testid="dash-error" aria-live="polite">
      <p className="dash-sect-title">Connection</p>
      <h1 className="section-title" style={{ marginTop: 0 }}>
        Your day is safe — we just can&apos;t show it right now
      </h1>
      <p className="page-copy">
        We couldn&apos;t load your week. Your checks are stored and nothing is
        lost. You can try again, or just check your next meal — that always
        works.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
        <Link className="dash-cta-button" href="/check" data-testid="dash-check-cta">
          Check a meal
        </Link>
        <button type="button" className="secondary-button" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}
