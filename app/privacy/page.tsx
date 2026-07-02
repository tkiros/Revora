import type { Metadata } from "next";
import Link from "next/link";

import { loadSafetyContract } from "../../lib/revora/safety-contract";

export const metadata: Metadata = {
  title: "Privacy · Revora",
  description: "What Revora collects, where it goes, and what it keeps."
};

export default function PrivacyPage() {
  const { copy } = loadSafetyContract();

  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Privacy</p>
          <h1 className="page-title">How Revora handles your data</h1>
          <p className="page-copy">
            You can use Revora two ways: as a guest with nothing saved on our
            side, or with an account that stores your history — encrypted,
            deletable, and only with your explicit consent. Here is exactly
            what happens in each case.
          </p>
        </section>

        <section className="surface-card legal-card">
          <h2>What you enter</h2>
          <p>
            A food or meal description and your latest A1C number. With an
            account, also your email address. That is everything Revora asks
            for.
          </p>

          <h2>Where a check goes</h2>
          <p>
            To answer, Revora sends your food description and A1C to
            OpenAI&apos;s Responses API, which generates the response. Every call
            sets <code>store: false</code>, which asks OpenAI not to keep the
            request in its default storage.
          </p>

          <h2>As a guest</h2>
          <p>
            Nothing is saved on Revora&apos;s side — no account, no server-side
            history. On the server, your food text and A1C are held in memory
            only long enough to build the request and return your answer, then
            dropped. Your recent checks, streak, and onboarding A1C live only
            in this browser&apos;s local storage, and you can wipe them any
            time by clearing this site&apos;s data.
          </p>

          <h2>With an account</h2>
          <p>
            If you sign in and give explicit consent, Revora stores — so your
            history and coach work across devices:
          </p>
          <ul>
            <li>your email address (for sign-in links only),</li>
            <li>
              your A1C value — <strong>encrypted at rest</strong> (AES-256-GCM),
            </li>
            <li>
              each checked meal&apos;s text — <strong>encrypted at rest</strong> —
              with its result class and time,
            </li>
            <li>
              if you turn on the daily reminder, a push subscription for this
              device,
            </li>
            <li>if you subscribe, your subscription status (handled by Google
              Play or Stripe — Revora never sees card numbers).</li>
          </ul>
          <p>
            Consent is asked once, before anything is stored, and you can
            withdraw it by deleting your account — which removes your profile,
            history, subscriptions, and push registrations. The deletion page
            is at{" "}
            <Link className="inline-link" href="/account/delete">
              /account/delete
            </Link>
            .
          </p>

          <h2>Voice input</h2>
          <p>
            If you use the microphone, your speech is transcribed by your
            browser or device&apos;s own speech service — Revora only ever
            receives the final text you review and submit. No audio reaches
            Revora&apos;s servers.
          </p>

          <h2>What Revora records about usage</h2>
          <p>
            Only coarse, non-identifying operational signals — for example
            whether a check succeeded, the risk class returned, and a rough
            latency bucket. Revora never records your food text, your A1C, the
            prompt it builds, or the model&apos;s full answer in logs, error
            reports, or analytics.
          </p>

          <h2>What Revora never does</h2>
          <ul>
            <li>sell or share your personal data,</li>
            <li>show ads,</li>
            <li>store your health data without your explicit consent,</li>
            <li>keep anything after you delete your account.</li>
          </ul>

          <h2>An honest caveat</h2>
          <p>
            <code>store: false</code> asks OpenAI not to retain the request, but
            OpenAI may still keep its own abuse-monitoring logs. That is
            OpenAI&apos;s system, not Revora&apos;s, and outside Revora&apos;s
            control. Revora does not claim zero retention by third parties.
          </p>

          <p className="result-disclaimer">{copy.disclaimer}</p>
        </section>

        <footer className="page-footer">
          <Link href="/">Back to Revora</Link>
        </footer>
      </div>
    </main>
  );
}
