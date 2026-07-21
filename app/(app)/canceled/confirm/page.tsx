"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

/**
 * Cancel confirmation (BC-1/SA-8). The email link's GET lands here without
 * mutating anything — mail safe-link scanners follow GETs at delivery time and
 * used to silently cancel trials. The actual cancel is the POST below, which
 * only a human pressing the button triggers.
 */
function ConfirmCancel() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(body?.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      router.replace("/canceled");
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="app-content--narrow">
      <section className="surface-card hero-card">
        <p className="hero-eyebrow">Billing</p>
        <h1 className="page-title">Cancel your subscription?</h1>
        <p className="page-copy">
          One tap and your card will not be charged. Anything left of your paid
          time keeps working until it ends, and you can restart whenever you
          like.
        </p>
        <button
          type="button"
          className="primary-button"
          disabled={busy || !token}
          data-testid="confirm-cancel"
          onClick={confirm}
        >
          {busy ? "Canceling…" : "Yes, cancel — no charge"}
        </button>
        {error ? (
          <p className="field-hint" role="alert">
            {error}
          </p>
        ) : null}
        <a className="recheck-button link-button" href="/account">
          Keep my subscription
        </a>
      </section>

      <footer className="page-footer">
        <Link href="/check">Check a meal</Link>
        <Link href="/">Home</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </footer>
    </div>
  );
}

export default function ConfirmCancelPage() {
  return (
    <Suspense>
      <ConfirmCancel />
    </Suspense>
  );
}
