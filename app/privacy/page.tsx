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
          <h1 className="page-title">How Revora handles your input</h1>
          <p className="page-copy">
            Revora keeps your information inside a single request. Here is
            exactly what happens when you run a check.
          </p>
        </section>

        <section className="surface-card legal-card">
          <h2>What you enter</h2>
          <p>
            A food or meal description and your latest A1C number. That is the
            only information Revora asks for — no name, no email, and no account.
          </p>

          <h2>Where it goes</h2>
          <p>
            To answer, Revora sends your food description and A1C to
            OpenAI&apos;s Responses API, which generates the response. Every call
            sets <code>store: false</code>, which asks OpenAI not to keep the
            request in its default storage.
          </p>

          <h2>What Revora keeps</h2>
          <p>Nothing is saved. There is:</p>
          <ul>
            <li>no account or login,</li>
            <li>no database,</li>
            <li>no saved history of your checks.</li>
          </ul>
          <p>
            Your food text and A1C are held in memory only long enough to build
            the request and return your answer, then dropped.
          </p>

          <h2>What Revora records</h2>
          <p>
            Only coarse, non-identifying operational signals — for example
            whether a check succeeded, the risk class returned, and a rough
            latency bucket. Revora never records your food text, your A1C, the
            prompt it builds, or the model&apos;s full answer.
          </p>

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
