import Link from "next/link";

import { DailyLoop } from "../../../components/daily-loop";
import { DemoCheckCard } from "../../../components/demo-check-card";
import { FirstRunGate } from "../../../components/first-run-gate";
import { FoodCheckForm } from "../../../components/food-check-form";
import {
  IconArrowRight,
  IconCheck,
  IconHeart,
  IconLock
} from "../../../components/icons";

export const metadata = { title: "Check a meal — Revora" };

// The app's daily surface (moved here from `/` when the marketing landing
// took over the root, 2026-07-07; into the (app) shell for M2). Stays a
// focused page (decision #8) — the shell provides nav, the backbar returns
// to the dashboard.
export default function CheckPage() {
  return (
    <div className="app-content--narrow">
      <FirstRunGate />
      <div className="backbar">
        <Link className="backlink" href="/home">
          <IconArrowRight size={17} />
          Home
        </Link>
      </div>
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Revora</p>
          <h1 className="page-title">Should I eat this?</h1>
          <p className="page-copy">
            One calm answer at the moment you&apos;re deciding — the reason
            behind it, and one easy swap. Type it, say it, or snap a photo.
          </p>
        </section>

        <section className="surface-card form-card">
          <FoodCheckForm />
        </section>

        <DailyLoop />

        <ul className="trust-row" data-testid="trust-strip">
          <li>
            <IconLock size={20} />
            <span>No login for your first checks.</span>
          </li>
          <li>
            <IconHeart size={20} />
            <span>When we&apos;re unsure, we say so.</span>
          </li>
          <li>
            <IconCheck size={20} />
            <span>If you ever subscribe, cancel is one tap — not an email.</span>
          </li>
        </ul>

        <DemoCheckCard />

        <footer className="page-footer">
          <Link href="/history">Your week</Link>
          <Link href="/progress">Progress</Link>
          <Link href="/get-the-app">Get the app</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </footer>
    </div>
  );
}
