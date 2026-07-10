import Link from "next/link";

export const metadata = {
  title: "Delete your account & data — Revora",
  description:
    "How to permanently delete your Revora account and all stored data."
};

/**
 * Public data-deletion page (plan 4E) — reachable signed-out; this URL is
 * declared in Google Play's Data-deletion field.
 */
export default function DeleteAccountPage() {
  return (
    <div className="app-content--narrow">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Your data, your call</p>
          <h1 className="page-title">Delete your account &amp; data</h1>
          <p className="page-copy">
            Deleting your Revora account permanently removes everything we
            store about you:
          </p>
          <ul className="page-copy expectation-list">
            <li>your profile and A1C value,</li>
            <li>your entire meal-check history,</li>
            <li>reminder (push) registrations,</li>
            <li>subscription records,</li>
            <li>your sign-in sessions and email.</li>
          </ul>
          <p className="page-copy">
            There is no retention window and no recovery — deletion is
            immediate and complete. Subscriptions are cancelled with the store
            where possible; you can also cancel directly in Google Play
            (Menu → Payments &amp; subscriptions) or the billing portal.
          </p>
          <h2 className="section-title">How to delete</h2>
          <ol className="page-copy expectation-list">
            <li>
              Sign in, open{" "}
              <Link className="inline-link" href="/account">
                your account page
              </Link>
              ,
            </li>
            <li>tap “Delete account &amp; data”, and confirm.</li>
          </ol>
          <p className="field-hint">
            Lost access to your email? Contact support from the address you
            signed up with and we&apos;ll complete the deletion manually.
          </p>
          <Link className="primary-button link-button" href="/account">
            Go to my account
          </Link>
        </section>

        <footer className="page-footer">
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </footer>
    </div>
  );
}
