import type { Metadata } from "next";
import Link from "next/link";

import { DemoCheckCard } from "../components/demo-check-card";
import { IconAlert, IconArrowRight, IconLeaf } from "../components/icons";
import { TASTER_LIMIT } from "../lib/client/taster-store";
import { FREE_DAILY_CHECKS } from "../lib/free-tier";
import { longitudinalInsightsEnabled } from "../lib/longitudinal-insights-flag";
import { photoInputEnabled } from "../lib/photo-input-flag";
import { RISK_LABELS } from "../lib/revora/labels";
import { storeWaitlistUrl } from "../lib/waitlist";

export const metadata: Metadata = {
  title: "Revora — A cautious educational read on your meal",
  description:
    "For adults using a prediabetes-range A1C. Describe a meal and get general meal-composition information, cautious labels, and practical alternatives."
};

// Marketing landing (DESIGN.md §Marketing landing). The app lives at /check;
// this page's one job is credibility + the first check. No fabricated social
// proof — the trust section carries the honest proof points instead. All copy
// here is scanned by the claims-boundary audit.
//
// Two hard rules this file must keep (F-04 / F-07, 2026-07-11 claims
// reconciliation):
//  - The adjustment and the swap are CONDITIONAL. A SAFE ("Clear") result is
//    structurally forbidden either one (lib/revora/postprocess.ts
//    assertNoUnsafeSafeFields throws), so no surface may promise them
//    unconditionally. Always hedge: "when there's one".
//  - The free tier is TASTER_LIMIT checks on day one only, device-local. The
//    number is interpolated from lib/client/taster-store.ts — never retyped —
//    so the store listing, the landing page, and the meter can't drift apart.
//    (Importing the constant is safe from a server component: taster-store
//    touches `window` only inside function bodies.)
//
// Verdict words come from lib/revora/labels.ts (RISK_LABELS) — never retyped.
export default function LandingPage() {
  const androidWaitlist = storeWaitlistUrl("android");
  const iosWaitlist = storeWaitlistUrl("ios");
  const photoEnabled = photoInputEnabled();
  const insightsEnabled = longitudinalInsightsEnabled();
  return (
    <main className="landing">
      {/* ── Dark band: nav + hero ─────────────────────────────── */}
      <div className="landing-dark">
        <div className="landing-frame">
          <nav className="landing-nav" aria-label="Main">
            <Link className="landing-wordmark" href="/">
              Revora
            </Link>
            <div className="landing-nav-links">
              <a href="#how-it-works">How it works</a>
              <a href="#pricing">Pricing</a>
              <Link href="/pantry">Pantry Review</Link>
              <Link className="landing-cta-ghost" href="/check">
                Try it free
              </Link>
            </div>
          </nav>

          <section className="landing-hero">
            <div className="landing-hero-copy">
              <p className="landing-eyebrow">
                Built for the prediabetes A1C range (5.7%–6.4%)
              </p>
              <h1 className="landing-h1">
                Check a meal. Understand its balance in seconds.
              </h1>
              <p className="landing-sub">
                {photoEnabled
                  ? "Snap a photo of the meal, say it, or type it. "
                  : "Say what is in the meal or type it. "}
                Revora gives you one cautious educational label —{" "}
                {RISK_LABELS.SAFE}, {RISK_LABELS.MODERATE}, or {RISK_LABELS.HIGH}
                — with one reason and, when appropriate, an adjustment and one
                practical alternative. The labels describe general meal
                patterns, not your individual glucose response.
              </p>
              <div className="landing-cta-row">
                <Link className="landing-cta" href="/check">
                  Check your first meal — free
                </Link>
              </div>
              <p className="landing-cta-hint">
                No login. No card. {TASTER_LIMIT} free checks on your first
                day.
              </p>
              <div className="landing-store-row">
                {androidWaitlist ? (
                  <a className="landing-cta-ghost" href={androidWaitlist}>
                    Google Play — coming soon
                  </a>
                ) : (
                  <span className="landing-cta-ghost">
                    Google Play — coming soon
                  </span>
                )}
                {iosWaitlist ? (
                  <a className="landing-cta-ghost" href={iosWaitlist}>
                    App Store — coming soon
                  </a>
                ) : (
                  <span className="landing-cta-ghost">
                    App Store — coming soon
                  </span>
                )}
              </div>
            </div>

            {/* Phone mockup: the real result-card markup, pixel-true. */}
            <div className="landing-phone" aria-hidden="true">
              <div className="landing-phone-inner">
                <p className="status-eyebrow">You enter: oatmeal</p>
                <div className="result-card" data-risk="MODERATE">
                  <p className="result-eyebrow">Revora result</p>
                  <p className="result-title verdict-title" data-risk="MODERATE">
                    <IconAlert size={26} />
                    {RISK_LABELS.MODERATE}
                  </p>
                  <p className="result-copy">
                    Oatmeal on its own leans heavily on carbohydrates and has
                    less protein or nonstarchy-vegetable balance than a mixed
                    meal.
                  </p>
                  <div className="result-list">
                    <p className="result-row">
                      <IconLeaf size={16} />
                      <span>
                        <strong>Adjustment:</strong> add protein — Greek
                        yogurt, nuts, or eggs on the side.
                      </span>
                    </p>
                    <p className="result-row">
                      <IconArrowRight size={16} />
                      <span>
                        <strong>Swap:</strong> steel-cut oats hold up steadier
                        than instant packets.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── How it works ──────────────────────────────────────── */}
      <div className="landing-frame">
        <section className="landing-section" id="how-it-works">
          <div className="landing-section-head">
            <h2 className="landing-h2">Three ways in. One calm answer out.</h2>
            <p className="landing-section-lede">
              Revora is built for the moment of the meal — when you&apos;re
              standing in the kitchen or staring at a menu and want a clearer
              description of its overall balance.
            </p>
          </div>
          <div className="landing-grid-3">
            <div className="landing-step">
              <p className="landing-step-num">Step 1</p>
              <h3>Show Revora the meal</h3>
              <p>
                {photoEnabled
                  ? "Snap a photo, dictate it, or type it. "
                  : "Dictate it or type it. "}
                You review the text before anything is checked — you stay in
                control.
              </p>
            </div>
            <div className="landing-step">
              <p className="landing-step-num">Step 2</p>
              <h3>Get one cautious label</h3>
              <p>
                {RISK_LABELS.SAFE}, {RISK_LABELS.MODERATE}, or{" "}
                {RISK_LABELS.HIGH} — using broad A1C-range context only to
                avoid over-reassurance, with one reason and, when appropriate,
                an adjustment and one practical alternative. It is not an
                individual-response prediction.
              </p>
            </div>
            <div className="landing-step">
              <p className="landing-step-num">Step 3</p>
              <h3>Keep the habit</h3>
              <p>
                Your checks become a saved history and week view
                {insightsEnabled ? ", with a weekly pattern when one stands out" : ""}.
                One optional daily reminder keeps the habit going.
              </p>
            </div>
          </div>
        </section>

        {/* ── Live example ────────────────────────────────────── */}
        <section className="landing-section" id="live-example">
          <div className="landing-section-head">
            <h2 className="landing-h2">This is the actual answer you get</h2>
            <p className="landing-section-lede">
              No dashboard, no numbers to decode — one card, in plain words.
            </p>
          </div>
          <div className="landing-example">
            <DemoCheckCard />
          </div>
        </section>

        {/* ── Why trust it ────────────────────────────────────── */}
        <section className="landing-section">
          <div className="landing-section-head">
            <h2 className="landing-h2">Calm, and honest about its limits</h2>
            <p className="landing-section-lede">
              No miracle promises. Revora earns trust the slow way — by
              telling you exactly what it measures and where it stops.
            </p>
          </div>
          {/* Evidence boundary: sources support educational statements, not a
              product outcome claim. */}
          <div className="landing-proof-band">
            <p className="landing-proof-stat">Sources</p>
            <div>
              <p>
                Revora&apos;s general meal-planning principles are mapped to
                public-health guidance and cited nutrition research. Those
                sources support narrow educational statements; they are not
                evidence that Revora produces a particular health result.
              </p>
              <p className="landing-proof-note">
                <Link className="inline-link" href="/how-it-works">
                  Read the evidence and limitations
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="landing-proof">
            <div className="landing-proof-item">
              <h3>When we&apos;re unsure, we say so</h3>
              <p>
                If a food is ambiguous, Revora asks one clarifying question
                instead of guessing — and errs on the careful side.
              </p>
            </div>
            <div className="landing-proof-item">
              <h3>Grounded in published research</h3>
              <p>
                The weekly progress score is behavioral — it counts what you
                did, never a lab prediction.{" "}
                <Link className="inline-link" href="/how-it-works">
                  Read exactly what it measures and its honest limits
                </Link>
                .
              </p>
            </div>
            <div className="landing-proof-item">
              <h3>Your health data stays yours</h3>
              <p>
                Your A1C and meal text are encrypted at rest, stored only with
                your explicit consent, and deleted — all of it — in one tap.
              </p>
            </div>
            <div className="landing-proof-item">
              <h3>Not medical advice</h3>
              <p>
                Revora is informational only. Talk with a doctor or registered
                dietitian for guidance that is specific to you.
              </p>
            </div>
          </div>
        </section>

        {/* ── Pantry Review ───────────────────────────────────── */}
        <section className="landing-section">
          <div className="landing-section-head">
            <h2 className="landing-h2">
              Or check the whole kitchen, once
            </h2>
            <p className="landing-section-lede">
              The Pantry Review sorts everything you own into enjoy freely,
              worth a tweak, and handle with care — one calm, printable
              report. $49, one payment.{" "}
              <strong>Nothing renews.</strong>{" "}
              <Link className="inline-link" href="/pantry">
                See a sample report
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────────── */}
        <section className="landing-section" id="pricing">
          <div className="landing-section-head">
            <h2 className="landing-h2">Try it before you pay a cent</h2>
            <p className="landing-section-lede">
              The funnel is the promise: {TASTER_LIMIT} free checks on day one,
              a free week, and a cancel button that lives on your account page
              — not behind an email.
            </p>
          </div>
          <div className="landing-price-tiles">
            <div className="landing-price-tile">
              <p className="landing-price-day">Day 1</p>
              <p className="landing-price-what">
                {TASTER_LIMIT} free checks
              </p>
              <p>
                Check up to {TASTER_LIMIT} meals on your first day — no login,
                no card. See how the answers feel at your own table.
              </p>
            </div>
            <div className="landing-price-tile">
              <p className="landing-price-day">Days 2–8</p>
              <p className="landing-price-what">7 days free</p>
              <p>
                Card required, nothing charged. Two days before the trial
                ends, we email you the exact date and amount.
              </p>
            </div>
            <div className="landing-price-tile">
              <p className="landing-price-day">After</p>
              <p className="landing-price-what">$12.99/month</p>
              <p>
                Unlimited checks, your history on every device, progress you
                can see, and one gentle reminder. Cancel in one tap. Not
                ready? A free account still includes {FREE_DAILY_CHECKS} free
                checks a day.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────── */}
        <section className="landing-section" id="faq">
          <div className="landing-section-head">
            <h2 className="landing-h2">Fair questions</h2>
          </div>
          <div className="landing-faq">
            <details>
              <summary>Is Revora medical advice?</summary>
              <p>
                No. Revora is informational only and is not medical advice.
                Its labels describe general meal patterns. Broad A1C-range
                context only makes the presentation more cautious; it does not
                predict your response or decide whether a meal is medically
                appropriate. Talk with a doctor or registered dietitian for
                guidance specific to you.
              </p>
            </details>
            <details>
              <summary>Who is Revora for?</summary>
              <p>
                People in the prediabetes A1C range of 5.7% to 6.4%. If your
                number falls outside that range, Revora says so plainly and
                points you to a clinician instead of pretending.
              </p>
            </details>
            <details>
              <summary>Do I need an account or a card to try it?</summary>
              <p>
                No. Your first {TASTER_LIMIT} checks, on your first day, need
                no login and no card — they live on this device only. The 7-day
                free trial needs a card but charges nothing for a week — and we
                email you before any charge. Without Premium, a free account
                includes {FREE_DAILY_CHECKS} free checks a day.
              </p>
            </details>
            {photoEnabled ? (
              <details>
                <summary>How does the photo check work?</summary>
                <p>
                  Your photo becomes a draft list of what&apos;s on the plate.
                  You review and confirm the words before anything is checked —
                  the photo never skips your judgment. Photos are not kept.
                </p>
              </details>
            ) : null}
            <details>
              <summary>How do I cancel?</summary>
              <p>
                One tap, on your account page — effective at the end of the
                paid period. No retention screens, no email hoops. Deleting
                your account removes your data with it.
              </p>
            </details>
          </div>
        </section>
      </div>

      {/* ── Final CTA (dark) ──────────────────────────────────── */}
      <div className="landing-dark">
        <div className="landing-frame">
          <section className="landing-final">
            <h2 className="landing-h2">Your next meal is the start.</h2>
            <p className="landing-sub">
              Describe the meal and see the general pattern Revora notices. It
              takes about ten seconds.
            </p>
            <Link className="landing-cta" href="/check">
              Check your first meal — free
            </Link>
          </section>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="landing-frame">
        <footer className="landing-footer">
          <div className="landing-footer-cols">
            <div className="landing-footer-col">
              <h3>Product</h3>
              <Link href="/check">Check a meal</Link>
              <Link href="/pantry">Pantry Review</Link>
              <Link href="/get-the-app">Get the app</Link>
              <Link href="/subscribe">Premium</Link>
            </div>
            <div className="landing-footer-col">
              <h3>Learn</h3>
              <Link href="/how-it-works">How the progress score works</Link>
              <a href="#live-example">See a live example</a>
            </div>
            <div className="landing-footer-col">
              <h3>Legal</h3>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
          <p className="result-disclaimer">
            Revora is informational only and is not medical advice. Talk with
            a doctor or registered dietitian for guidance that is specific to
            you.
          </p>
        </footer>
      </div>
    </main>
  );
}
