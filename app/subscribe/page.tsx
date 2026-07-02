import Link from "next/link";

import { PaywallCard } from "../../components/paywall-card";

export const metadata = { title: "Premium — Revora" };

export default function SubscribePage() {
  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Revora Premium</p>
          <h1 className="page-title">
            Keep your history and your daily coach
          </h1>
          <p className="page-copy">
            The check stays free, every day. Premium is the memory around it —
            your history everywhere, the weekly patterns, and progress you can
            see.
          </p>
          <PaywallCard />
        </section>

        <footer className="page-footer">
          <Link href="/">Home</Link>
          <Link href="/account">Account</Link>
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </main>
  );
}
