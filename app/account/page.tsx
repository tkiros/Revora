"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

import { historyStore } from "../../lib/client/history-store";
import { profileStore } from "../../lib/client/profile-store";

type EntitlementInfo = {
  tier: "free" | "premium";
  source: "play" | "stripe" | null;
  checksToday: number;
  freeDailyLimit: number;
};

export default function AccountPage() {
  const [state, setState] = useState<"loading" | "signed_out" | "ready">(
    "loading"
  );
  const [entitlement, setEntitlement] = useState<EntitlementInfo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/entitlement", { cache: "no-store" });
        if (cancelled) {
          return;
        }
        if (response.status === 401) {
          setState("signed_out");
          return;
        }
        setEntitlement((await response.json()) as EntitlementInfo);
        setState("ready");
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

  async function manageStripe() {
    setError(null);
    const response = await fetch("/api/billing/stripe/portal", {
      method: "POST"
    });
    const body = (await response.json()) as { url?: string; error?: string };
    if (body.url) {
      window.location.assign(body.url);
    } else {
      setError(body.error ?? "Couldn't open the billing portal.");
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/account/delete", { method: "POST" });
      if (!response.ok) {
        setError("Deletion didn't complete — please try again.");
        setDeleting(false);
        return;
      }

      // Local copies go too — deletion means deletion.
      historyStore.clear();
      profileStore.clear();
      window.location.assign("/?deleted=1");
    } catch {
      setError("Deletion didn't complete — please try again.");
      setDeleting(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Account</p>
          <h1 className="page-title">Your Revora account</h1>

          {state === "loading" ? (
            <p className="page-copy">Loading…</p>
          ) : state === "signed_out" ? (
            <>
              <p className="page-copy">
                You&apos;re not signed in. An account keeps your history and
                coach in sync across devices.
              </p>
              <Link className="primary-button link-button" href="/signin">
                Sign in
              </Link>
            </>
          ) : (
            <>
              <div className="account-section" data-testid="account-plan">
                <h2 className="section-title">Plan</h2>
                {entitlement?.tier === "premium" ? (
                  <>
                    <p className="page-copy">
                      <strong>Premium</strong> — unlimited checks, full
                      history, insights, progress, and the daily reminder.
                    </p>
                    {entitlement.source === "play" ? (
                      <a
                        className="recheck-button link-button"
                        href="https://play.google.com/store/account/subscriptions"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Manage or cancel in Google Play
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="recheck-button"
                        onClick={manageStripe}
                      >
                        Manage or cancel billing
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="page-copy">
                      <strong>Free</strong> — {entitlement?.checksToday ?? 0} of{" "}
                      {entitlement?.freeDailyLimit ?? 5} checks used today.
                    </p>
                    <Link className="recheck-button link-button" href="/subscribe">
                      See what Premium includes
                    </Link>
                  </>
                )}
              </div>

              <div className="account-section">
                <h2 className="section-title">Session</h2>
                <button
                  type="button"
                  className="recheck-button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign out
                </button>
              </div>

              <div className="account-section" data-testid="account-delete">
                <h2 className="section-title">Delete account &amp; data</h2>
                <p className="page-copy">
                  Deletes your profile, A1C, meal history, reminders, and
                  subscription records — permanently. Active subscriptions are
                  cancelled with the store where possible; you can also cancel
                  them directly in Google Play or the billing portal.
                </p>
                {confirmDelete ? (
                  <div className="delete-confirm">
                    <p className="field-error">
                      This can&apos;t be undone. Delete everything?
                    </p>
                    <button
                      type="button"
                      className="danger-button"
                      disabled={deleting}
                      data-testid="confirm-delete"
                      onClick={deleteAccount}
                    >
                      {deleting ? "Deleting…" : "Yes, delete everything"}
                    </button>
                    <button
                      type="button"
                      className="recheck-button"
                      disabled={deleting}
                      onClick={() => setConfirmDelete(false)}
                    >
                      Keep my account
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="recheck-button"
                    data-testid="delete-account"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete account &amp; data
                  </button>
                )}
              </div>

              {error ? <p className="field-error">{error}</p> : null}
            </>
          )}
        </section>

        <footer className="page-footer">
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </main>
  );
}
