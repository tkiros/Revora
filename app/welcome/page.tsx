"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { track } from "../../lib/client/analytics";
import { historyStore } from "../../lib/client/history-store";
import { profileStore } from "../../lib/client/profile-store";
import { tasterStore } from "../../lib/client/taster-store";

/**
 * First-sign-in profile completion (plan 4A): the GDPR Art. 9 consent
 * checkbox blocks profile creation; A1C prefills from onboarding. Nothing is
 * stored server-side until consent is given here.
 */
export default function WelcomePage() {
  const router = useRouter();
  const [state, setState] = useState<
    "loading" | "signed_out" | "ready" | "submitting" | "done"
  >("loading");
  const [hasProfile, setHasProfile] = useState(false);
  const [a1cText, setA1cText] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/profile");
        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          setState("signed_out");
          return;
        }

        const body = (await response.json()) as { hasProfile?: boolean };
        setHasProfile(Boolean(body.hasProfile));
        setState("ready");

        const profile = profileStore.get();
        if (profile) {
          setA1cText(profile.a1c.toFixed(1));
        }
      } catch {
        if (!cancelled) {
          setState("signed_out");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit() {
    const a1c = Number.parseFloat(a1cText);
    if (!Number.isFinite(a1c)) {
      setError("Enter your latest A1C with one decimal, like 6.1.");
      return;
    }
    if (!consent) {
      setError("Storing your A1C needs your explicit consent.");
      return;
    }

    setState("submitting");
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          a1c,
          consent,
          timezone:
            Intl.DateTimeFormat().resolvedOptions().timeZone ??
            "America/New_York"
        })
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? "Something went wrong — please try again.");
        setState("ready");
        return;
      }

      // Bring the device history along (idempotent; 4B route).
      const local = historyStore.all();
      if (local.length > 0) {
        await fetch("/api/history/migrate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ checks: local })
        }).catch(() => {
          // best-effort: history sync also runs on later visits
        });
      }

      // Signed in: entitlement is server-truth, so drop the device taster.
      tasterStore.clear();

      setState("done");
      track({ name: "signin_completed" });
      router.push("/check");
    } catch {
      setError("Something went wrong — please try again.");
      setState("ready");
    }
  }

  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="surface-card hero-card">
          {state === "loading" ? (
            <p className="page-copy">Loading…</p>
          ) : state === "signed_out" ? (
            <>
              <p className="hero-eyebrow">Almost there</p>
              <h1 className="page-title">Sign in to continue</h1>
              <p className="page-copy">
                This step links your history to your account. Use the
                sign-in link from your email first.
              </p>
              <Link className="primary-button link-button" href="/signin">
                Go to sign-in
              </Link>
            </>
          ) : hasProfile ? (
            <>
              <p className="hero-eyebrow">All set</p>
              <h1 className="page-title">Your account is ready</h1>
              <p className="page-copy">
                Your history and coach follow you across devices now.
              </p>
              <Link className="primary-button link-button" href="/check">
                Back to your day
              </Link>
            </>
          ) : (
            <>
              <p className="hero-eyebrow">One-time setup</p>
              <h1 className="page-title">Save your profile</h1>
              <p className="page-copy">
                Revora stores your A1C and your meal checks so your history
                and coach work across devices. Your A1C and meal text are
                encrypted at rest.
              </p>
              <div className="field-stack">
                <label htmlFor="welcome-a1c" className="field-label">
                  Latest A1C
                </label>
                <input
                  id="welcome-a1c"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={a1cText}
                  onChange={(event) => {
                    setA1cText(event.target.value);
                    setError(null);
                  }}
                  placeholder="6.1"
                  className="text-input"
                />
              </div>
              <div className="consent-row">
                <input
                  id="welcome-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => {
                    setConsent(event.target.checked);
                    setError(null);
                  }}
                />
                {/* COUNSEL-DRAFT (Track B Q6): Art. 9 explicit-consent wording
                    pending counsel sign-off; structure (unchecked-by-default,
                    blocking, revocable) is final. */}
                <label htmlFor="welcome-consent" className="consent-label">
                  I consent to Revora storing my A1C value and meal checks —
                  health information — to power my history, insights, and
                  progress. I can delete my account and all of this data at
                  any time.
                </label>
              </div>
              {error ? <p className="field-error">{error}</p> : null}
              <button
                type="button"
                className="primary-button"
                disabled={state === "submitting" || !consent}
                data-testid="welcome-save"
                onClick={handleSubmit}
              >
                {state === "submitting" ? "Saving…" : "Save my profile"}
              </button>
            </>
          )}
        </section>

        <footer className="page-footer">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </footer>
      </div>
    </main>
  );
}
