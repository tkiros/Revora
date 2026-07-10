"use client";

import { useEffect, useState } from "react";

import { track } from "../lib/client/analytics";

export function PantryBuyButton({
  source,
  trackView = true
}: {
  source: "landing" | "wall_decline" | "result_card";
  // The pantry landing renders two buy buttons (hero + after the sample
  // report); only one may emit pantry_viewed or the funnel double-counts.
  trackView?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackView) track({ name: "pantry_viewed", props: { source } });
  }, [source, trackView]);

  async function buy() {
    setBusy(true);
    setError(null);
    track({ name: "pantry_checkout_started" });
    try {
      const response = await fetch("/api/billing/stripe/pantry-checkout", { method: "POST" });
      const body = (await response.json()) as { url?: string; error?: string };
      if (body.url) window.location.assign(body.url);
      else setError(body.error ?? "Checkout isn't available right now.");
    } catch {
      setError("Something went wrong — you have not been charged.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field-stack">
      <button type="button" className="primary-button" disabled={busy} onClick={buy} data-testid="pantry-buy">
        {busy ? "Opening…" : "Get your Pantry Review — one payment, nothing renews"}
      </button>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
