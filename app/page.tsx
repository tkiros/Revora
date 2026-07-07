import Link from "next/link";

import { DailyLoop } from "../components/daily-loop";
import { DemoCheckCard } from "../components/demo-check-card";
import { FirstRunGate } from "../components/first-run-gate";
import { FoodCheckForm } from "../components/food-check-form";
import { storeWaitlistUrl } from "../lib/waitlist";

export default function HomePage() {
  const androidWaitlist = storeWaitlistUrl("android");
  const iosWaitlist = storeWaitlistUrl("ios");
  return (
    <main className="page-shell">
      <div className="page-frame">
        <FirstRunGate />
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Revora</p>
          <h1 className="page-title">Should I eat this?</h1>
          <p className="page-copy">
            With prediabetes, that question can hang over every plate. Revora
            answers it in seconds — one calm verdict, one reason, one safer
            swap — so you can decide and get back to your meal. Type it, say
            it, or snap a photo. No login for your first checks.
          </p>
        </section>

        <section className="surface-card form-card">
          <FoodCheckForm />
        </section>

        <DailyLoop />

        <DemoCheckCard />

        <ul className="page-copy expectation-list" data-testid="trust-strip">
          <li>No login for your first checks.</li>
          <li>When we&apos;re unsure, we say so.</li>
          <li>If you ever subscribe, cancel is one tap — not an email.</li>
        </ul>

        <section className="surface-card hero-card" data-testid="store-waitlist">
          <p className="hero-eyebrow">Coming to the app stores</p>
          <h2 className="section-title">
            Google Play and the App Store — coming soon
          </h2>
          <p className="page-copy">
            Revora already works on your phone from the browser —{" "}
            <Link className="inline-link" href="/get-the-app">
              install it in two taps
            </Link>
            . Want the store version the day it lands? Join your platform&apos;s
            waitlist and we&apos;ll email you once. Nothing else, ever.
          </p>
          <div className="field-stack">
            {androidWaitlist ? (
              <a
                className="recheck-button link-button"
                href={androidWaitlist}
                data-testid="waitlist-android"
              >
                Google Play — join the Android waitlist
              </a>
            ) : (
              <p className="field-hint">Google Play — coming soon.</p>
            )}
            {iosWaitlist ? (
              <a
                className="recheck-button link-button"
                href={iosWaitlist}
                data-testid="waitlist-ios"
              >
                App Store — join the iPhone waitlist
              </a>
            ) : (
              <p className="field-hint">App Store — coming soon.</p>
            )}
          </div>
        </section>

        <footer className="page-footer">
          <Link href="/history">Your week</Link>
          <Link href="/progress">Progress</Link>
          <Link href="/get-the-app">Get the app</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </footer>
      </div>
    </main>
  );
}
