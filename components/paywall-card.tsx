"use client";

import { useEffect, useState } from "react";

import {
  isPlayBillingAvailable,
  listPlaySkus,
  purchasePlaySku,
  PLAY_SKUS
} from "../lib/client/digital-goods";

/**
 * Soft paywall (plan 4D): after value, never at the first-session aha. In the
 * TWA it runs Play Billing; in the browser it redirects to Stripe Checkout.
 * All copy claims-audited: capability framing only, no outcome promises.
 */
export function PaywallCard() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playPrices, setPlayPrices] = useState<Record<string, string>>({});
  const [usesPlay, setUsesPlay] = useState(false);

  useEffect(() => {
    if (isPlayBillingAvailable()) {
      setUsesPlay(true);
      listPlaySkus()
        .then((skus) => {
          setPlayPrices(
            Object.fromEntries(skus.map((sku) => [sku.itemId, sku.priceLabel]))
          );
        })
        .catch(() => {
          // fall back to the default labels
        });
    }
  }, []);

  async function subscribe(plan: "monthly" | "annual") {
    setBusy(plan);
    setError(null);

    try {
      if (usesPlay) {
        const purchaseToken = await purchasePlaySku(PLAY_SKUS[plan]);
        if (!purchaseToken) {
          setError("The purchase didn't complete. Nothing was charged.");
          return;
        }

        const verify = await fetch("/api/billing/play/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ purchaseToken })
        });

        if (verify.ok) {
          window.location.assign("/account?subscribed=1");
        } else {
          setError(
            "We couldn't confirm the purchase yet. It will be re-checked automatically — nothing is lost."
          );
        }
        return;
      }

      const response = await fetch("/api/billing/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan })
      });

      if (response.status === 401) {
        window.location.assign("/signin");
        return;
      }

      const body = (await response.json()) as { url?: string; error?: string };
      if (body.url) {
        window.location.assign(body.url);
      } else {
        setError(body.error ?? "Billing isn't available right now.");
      }
    } catch {
      setError("Something went wrong — you have not been charged.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="paywall-card" data-testid="paywall-card">
      <ul className="page-copy expectation-list">
        <li>Unlimited daily checks</li>
        <li>Your full history, on every device</li>
        <li>Weekly insights from your own meals</li>
        <li>The progress view</li>
        <li>One gentle daily reminder (optional)</li>
      </ul>
      <p className="field-hint">
        Free keeps working: five checks a day and your today view. Cancel
        anytime — the cancel button lives on your account page, not behind an
        email.
      </p>
      <div className="paywall-actions">
        <button
          type="button"
          className="primary-button"
          disabled={busy !== null}
          data-testid="subscribe-monthly"
          onClick={() => subscribe("monthly")}
        >
          {busy === "monthly"
            ? "Opening…"
            : `Monthly — ${playPrices[PLAY_SKUS.monthly] ?? "$12.99/mo"}`}
        </button>
        <button
          type="button"
          className="primary-button"
          disabled={busy !== null}
          data-testid="subscribe-annual"
          onClick={() => subscribe("annual")}
        >
          {busy === "annual"
            ? "Opening…"
            : `Annual — ${playPrices[PLAY_SKUS.annual] ?? "$99.99/yr"}`}
        </button>
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
