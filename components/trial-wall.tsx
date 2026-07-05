"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { track, type PriceVariant } from "../lib/client/analytics";

type Config = { variant: PriceVariant; priceDisplay: string };
type Step = "value" | "proof" | "start";

export function TrialWall({ declined = false }: { declined?: boolean }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [step, setStep] = useState<Step>("value");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="surface-card" data-testid="trial-wall">
      {step === "value" ? (
        <>
          <p className="hero-eyebrow">Day 2 with Revora</p>
          <h1 className="page-title">Yesterday was the free taste</h1>
          <p className="page-copy">
            From here, Revora is a paid companion: unlimited checks, your full
            history on every device, weekly patterns from your own meals, and
            one gentle daily reminder.
          </p>
          <button type="button" className="primary-button" onClick={() => setStep("proof")}>
            See how the trial works
          </button>
        </>
      ) : step === "proof" ? (
        <>
          <p className="hero-eyebrow">How the trial works</p>
          <h1 className="page-title">Seven days free, and we remind you before any charge</h1>
          <ul className="page-copy expectation-list">
            <li>Start today with a card — nothing is charged for 7 days.</li>
            <li>Two days before the trial ends, we email you the exact date and amount.</li>
            <li>Cancel in one tap — from that email or your account page. No retention screens.</li>
          </ul>
          <button type="button" className="primary-button" onClick={() => setStep("start")}>
            Start my free week
          </button>
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
            {busy ? "Opening…" : "Continue to secure checkout"}
          </button>
          {error ? <p className="field-error">{error}</p> : null}
        </form>
      )}
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
