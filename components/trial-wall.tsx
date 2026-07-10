"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { track, type PriceVariant } from "../lib/client/analytics";
import { historyStore } from "../lib/client/history-store";

type Config = { variant: PriceVariant; priceDisplay: string };
// Two steps (was three): the offer, the trial mechanics, and the price all
// live on the first screen — "7 days free" is never hidden behind a click.
type Step = "value" | "start";

export function TrialWall({ declined = false }: { declined?: boolean }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [step, setStep] = useState<Step>("value");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Endowment nudge for the declined state: name what's already theirs. Local
  // history only — the declined visitor is a guest; read in an effect so the
  // server render (0) never mismatches hydration.
  const [savedChecks, setSavedChecks] = useState(0);

  useEffect(() => {
    setSavedChecks(historyStore.all().length);
  }, []);

  useEffect(() => {
    fetch("/api/paywall")
      .then((r) => r.json())
      .then((cfg: Config & { mode: string }) => {
        setConfig(cfg);
        track({ name: "wall_viewed", props: { variant: cfg.variant } });
      })
      .catch(() => setConfig({ variant: "1299", priceDisplay: "$12.99" }));
  }, []);

  async function startTrial(event: React.FormEvent) {
    event.preventDefault();
    if (!config) return;
    setBusy(true);
    setError(null);
    track({ name: "trial_checkout_started", props: { variant: config.variant } });
    try {
      const response = await fetch("/api/trial/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email })
      });
      const body = (await response.json()) as { url?: string; error?: string };
      if (body.url) {
        window.location.assign(body.url);
      } else {
        setError(body.error ?? "Something went wrong — you have not been charged.");
      }
    } catch {
      setError("Something went wrong — you have not been charged.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface-card hero-card" data-testid="trial-wall">
      {step === "value" ? (
        <>
          <p className="hero-eyebrow">Your free week with Revora</p>
          <h1 className="page-title">Keep your calm answers — 7 days free</h1>
          <p className="page-copy">
            Ask &quot;should I eat this?&quot; and get a straight answer
            instead of a guess. Your free week keeps that
            going at every meal: unlimited checks, your history on every
            device, weekly patterns from your own meals, and one gentle daily
            reminder.
          </p>
          {/* The same three facts as the old trust bullets, told as the
              timeline the week actually follows (Today → Day 5 → Day 7). */}
          <ol className="trial-timeline" data-testid="trial-timeline">
            <li>
              <span className="trial-timeline-day">Today</span>
              <span>
                Start with a card — everything unlocks, nothing is charged.
              </span>
            </li>
            <li>
              <span className="trial-timeline-day">Day 5</span>
              <span>
                We email you the exact date and amount before any charge.
              </span>
            </li>
            <li>
              <span className="trial-timeline-day">Day 7</span>
              <span>
                Your first charge — cancel any time before, in one tap, from
                that email or your account page. No retention screens.
              </span>
            </li>
          </ol>
          <div className="plan-card" data-recommended="">
            <p className="plan-card-flag">7 days free</p>
            <p className="plan-card-price">
              {config?.priceDisplay ?? "$12.99"}
              <span> /month after your free week — cancel anytime</span>
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={() => setStep("start")}
            >
              Start my free week
            </button>
          </div>
          <p className="field-hint">
            Grounded in published research —{" "}
            <Link className="inline-link" href="/how-it-works">
              see how Revora works
            </Link>
            .
          </p>
        </>
      ) : (
        <form onSubmit={startTrial} className="field-stack">
          <p className="hero-eyebrow">Start your free week</p>
          <h1 className="page-title">{config?.priceDisplay ?? "$12.99"}/month after 7 free days</h1>
          <p className="page-copy">
            Card required to start. We email you before it is ever charged, and
            cancel is one tap.
          </p>
          <label className="field-label" htmlFor="trial-email">Your email</label>
          <input
            id="trial-email"
            className="text-input"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="primary-button" disabled={busy}>
            {busy ? "Opening…" : "Continue to checkout — $0 due today"}
          </button>
          {error ? <p className="field-error">{error}</p> : null}
        </form>
      )}
      {declined && savedChecks > 0 ? (
        <p className="field-hint" data-testid="saved-checks-note">
          The {savedChecks} {savedChecks === 1 ? "check" : "checks"} you&apos;ve
          already made stay saved on this device — your history is here
          whenever you come back.
        </p>
      ) : null}
      {declined ? (
        <p className="field-hint" data-testid="pantry-catch">
          Not ready for a subscription? There&apos;s a one-time option:{" "}
          <Link className="inline-link" href="/pantry">
            the Pantry Review
          </Link>
          . One payment, nothing renews.
        </p>
      ) : null}
    </div>
  );
}
