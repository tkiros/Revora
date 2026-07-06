"use client";

import Link from "next/link";
import { useEffect } from "react";

import { track } from "../../../lib/client/analytics";
import type { PriceVariant } from "../../../lib/client/analytics";

export default function TrialStartedPage() {
  useEffect(() => {
    fetch("/api/paywall")
      .then((r) => r.json())
      .then((cfg: { variant: PriceVariant }) =>
        track({ name: "trial_started", props: { variant: cfg.variant } })
      )
      .catch(() => {});
  }, []);

  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Your free week</p>
          <h1 className="page-title">Your free week is active</h1>
          <p className="page-copy">
            We emailed you a sign-in link — tap it to unlock unlimited checks
            on this and every device.
          </p>
          <p className="page-copy">
            Two days before your trial ends, we&apos;ll email you a reminder
            with the exact date and amount — and a one-tap cancel link. Cancel
            any time from your account page, too. On your phone, Revora installs
            straight to your home screen —{" "}
            <Link className="inline-link" href="/get-the-app">
              see how
            </Link>
            .
          </p>
          <p className="field-hint">
            No email after a minute? Check spam, or{" "}
            <Link className="inline-link" href="/signin">
              request a fresh link
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
