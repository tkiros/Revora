import Link from "next/link";

import { DailyLoop } from "../components/daily-loop";
import { DemoCheckCard } from "../components/demo-check-card";
import { FirstRunGate } from "../components/first-run-gate";
import { FoodCheckForm } from "../components/food-check-form";

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="page-frame">
        <FirstRunGate />
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Revora</p>
          <h1 className="page-title">Should I eat this?</h1>
          <p className="page-copy">
            Describe the food, add your latest A1C, and stay on one page while
            Revora prepares a calm answer. No login is required, and your
            browser checks the form before anything is sent.
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
