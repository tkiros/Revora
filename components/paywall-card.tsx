"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { track } from "../lib/client/analytics";
import {
  isPlayBillingAvailable,
  listPlayPurchases,
  listPlaySkus,
  purchasePlaySku,
  PLAY_SKUS
} from "../lib/client/digital-goods";
import { FREE_DAILY_CHECKS } from "../lib/free-tier";
import { TERMS_VERSION } from "../lib/legal/terms";
import { longitudinalInsightsEnabled } from "../lib/longitudinal-insights-flag";
import { playBillingEnabled } from "../lib/play-billing-flag";

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
  const [monthlyDisplay, setMonthlyDisplay] = useState<string | null>(null);
  const [annualDisplay, setAnnualDisplay] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    track({ name: "paywall_viewed" });

    // Monthly display price comes from the paywall config (the variant the
    // checkout will actually charge) — never a second hard-coded ladder.
    fetch("/api/paywall")
      .then((r) => r.json())
      .then((cfg: { priceDisplay?: unknown; annualDisplay?: unknown }) => {
        if (typeof cfg.priceDisplay === "string") {
          setMonthlyDisplay(cfg.priceDisplay);
        }
        if (typeof cfg.annualDisplay === "string") {
          setAnnualDisplay(cfg.annualDisplay);
        }
      })
      .catch(() => {
        // keep the fallback label
      });

    if (playBillingEnabled() && isPlayBillingAvailable()) {
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
    track({ name: "subscribe_started" });
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
          body: JSON.stringify({
            purchaseToken,
            termsAccepted,
            termsVersion: TERMS_VERSION
          })
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
        body: JSON.stringify({
          plan,
          termsAccepted,
          termsVersion: TERMS_VERSION
        })
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

  // N-08: explicit restore for a reinstall / new device. Each token is
  // re-verified server-side — the client list alone never grants anything.
  async function restorePurchases() {
    setBusy("restore");
    setError(null);

    try {
      const purchases = await listPlayPurchases();
      if (purchases.length === 0) {
        setError("No previous purchase was found on this Google account.");
        return;
      }

      for (const purchase of purchases) {
        const verify = await fetch("/api/billing/play/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            purchaseToken: purchase.purchaseToken,
            termsAccepted,
            termsVersion: TERMS_VERSION
          })
        });
        if (verify.ok) {
          window.location.assign("/account?restored=1");
          return;
        }
      }

      setError(
        "We couldn't confirm the purchase yet. It will be re-checked automatically — nothing is lost."
      );
    } catch {
      setError("Something went wrong. Your purchase is not affected.");
    } finally {
      setBusy(null);
    }
  }

  // Play prices win in the TWA; otherwise the paywall config's monthly
  // variant; the literal only as the offline fallback.
  const monthlyLabel =
    playPrices[PLAY_SKUS.monthly] ?? `${monthlyDisplay ?? "$12.99"}/mo`;
  // Annual price comes from the paywall config (single source in
  // lib/server/pricing.ts); the literal only as the offline fallback.
  const annualLabel =
    playPrices[PLAY_SKUS.annual] ?? `${annualDisplay ?? "$99.99"}/yr`;
  // Savings vs 12 months of the live monthly variant; hidden when the math
  // doesn't hold (cheap variants, Play-priced currencies).
  const monthlyNumber = Number.parseFloat(
    (monthlyDisplay ?? "$12.99").replace(/[^0-9.]/g, "")
  );
  const annualNumber = Number.parseFloat(
    (annualDisplay ?? "$99.99").replace(/[^0-9.]/g, "")
  );
  const annualSavingsPct =
    Number.isFinite(monthlyNumber) &&
    monthlyNumber > 0 &&
    Number.isFinite(annualNumber) &&
    annualNumber > 0
      ? Math.round((1 - annualNumber / (monthlyNumber * 12)) * 100)
      : 0;
  const annualNote =
    !playPrices[PLAY_SKUS.annual] && annualSavingsPct >= 10
      ? ` /year — save about ${annualSavingsPct}% vs monthly`
      : " /year";

  return (
    <div className="paywall-card" data-testid="paywall-card">
      <ul className="page-copy expectation-list">
        <li>Unlimited daily checks</li>
        <li>Your full history, on every device</li>
        {longitudinalInsightsEnabled() ? (
          <li>Weekly insights from your own meals</li>
        ) : null}
        <li>The progress view</li>
        <li>One gentle daily reminder (optional)</li>
      </ul>
      {/* F-24: this card used to carry a popularity flag claiming it was the
          most-chosen plan. Revora has not launched and has zero subscribers, so
          that was fabricated social proof — a claim about other users we cannot
          make (PRODUCT.md §Design Principles 4, "No fabricated data").
          `data-recommended` still drives the visual emphasis; it just no longer
          lies about why. The annual card's "Best value" flag stays: it is
          computed from the live prices (annualSavingsPct above), not asserted
          about a user base. Enforced by the "social-proof" family in
          claims-boundary-copy.test.ts — which is why this comment describes the
          old flag rather than quoting it. */}
      <label className="consent-row">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(event) => setTermsAccepted(event.target.checked)}
          data-testid="paid-terms-consent"
        />
        <span className="consent-label">
          I agree to the <Link href="/terms">Terms</Link> and acknowledge the{" "}
          <Link href="/privacy">Privacy Notice</Link>, including automatic
          renewal and the refund policy.
        </span>
      </label>
      <div className="plan-card" data-recommended="">
        <p className="plan-card-price">
          {monthlyDisplay ?? "$12.99"}
          <span> /month</span>
        </p>
        <button
          type="button"
          className="primary-button"
          disabled={busy !== null || !termsAccepted}
          data-testid="subscribe-monthly"
          onClick={() => subscribe("monthly")}
        >
          {busy === "monthly" ? "Opening…" : `Monthly — ${monthlyLabel}`}
        </button>
      </div>
      <div className="plan-card">
        <p className="plan-card-flag">Best value</p>
        <p className="plan-card-price">
          $99.99
          <span>{annualNote}</span>
        </p>
        <button
          type="button"
          className="secondary-button"
          disabled={busy !== null || !termsAccepted}
          data-testid="subscribe-annual"
          onClick={() => subscribe("annual")}
        >
          {busy === "annual" ? "Opening…" : `Annual — ${annualLabel}`}
        </button>
      </div>
      {usesPlay ? (
        <button
          type="button"
          className="link-button"
          disabled={busy !== null || !termsAccepted}
          data-testid="restore-purchases"
          onClick={() => restorePurchases()}
        >
          {busy === "restore" ? "Checking…" : "Restore a previous purchase"}
        </button>
      ) : null}
      <p className="field-hint">
        Free keeps working: {FREE_DAILY_CHECKS} checks a day and your today
        view. Cancel anytime — the cancel button lives on your account page,
        not behind an email.
      </p>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
