import type { Metadata } from "next";
import Link from "next/link";

import { DemoCheckCard } from "../components/demo-check-card";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconHeart,
  IconPause
} from "../components/icons";
import { TASTER_LIMIT } from "../lib/client/taster-store";
import { FREE_DAILY_CHECKS } from "../lib/free-tier";
import { longitudinalInsightsEnabled } from "../lib/longitudinal-insights-flag";
import { photoInputEnabled } from "../lib/photo-input-flag";
import { BOUNDARY_DISCLAIMER } from "../lib/revora/boundary-copy";
import { RISK_LABELS } from "../lib/revora/labels";
import { paywallMode, resolvePriceVariant } from "../lib/server/pricing";
import { storeWaitlistUrl } from "../lib/waitlist";
import { reading } from "./fonts";

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
//    unconditionally. Always hedge: "when there's one". The verdict row below
//    demonstrates this rather than asserting it — the Clear card carries no
//    adjustment and no swap, because the engine cannot produce them there.
//  - The free tier is TASTER_LIMIT checks on day one only, device-local. The
//    number is interpolated from lib/client/taster-store.ts — never retyped —
//    so the store listing, the landing page, and the meter can't drift apart.
//    (Importing the constant is safe from a server component: taster-store
//    touches `window` only inside function bodies.)
//
// Verdict words come from lib/revora/labels.ts (RISK_LABELS) — never retyped.
//
// Surface treatment (2026-07-27): this page is light throughout. The former
// deep-green `.landing-dark` bands on the hero and closing CTA were removed on
// owner instruction — rhythm now comes from white sheets and `--accent-tint`
// bands over the page background, not from inverted colour. DESIGN.md
// §Marketing landing is the binding record of that change.
export default function LandingPage() {
  const androidWaitlist = storeWaitlistUrl("android");
  const iosWaitlist = storeWaitlistUrl("ios");
  const photoEnabled = photoInputEnabled();
  const insightsEnabled = longitudinalInsightsEnabled();
  // §0.2 #4 — the pricing section renders from the SAME server flags checkout
  // enforces (paywallMode + resolvePriceVariant), so the landing can never
  // promise a funnel or a price the live config doesn't run. Mismatch here is
  // the one unforced error this audience never forgives.
  const trialFunnel = paywallMode() === "trial";
  const monthlyPrice = resolvePriceVariant().display;
  return (
    // reading.className: var-free source of the landing body family (app/fonts.ts, FINDING-030)
    <main className={`landing ${reading.className}`}>
      {/* ── Nav + hero (white sheet) ──────────────────────────── */}
      <div className="landing-sheet">
        <div className="landing-frame">
          <nav className="landing-nav" aria-label="Main">
            <Link className="landing-wordmark" href="/">
              Revora
            </Link>
            {/* ponytail: below 640px the link row collapses to the wordmark +
                the one CTA. It used to wrap to a 136px two-row block with the
                wordmark floating between the rows. Every hidden link is still
                reachable by scrolling and is repeated in the footer, so this
                costs no navigation. */}
            <div className="landing-nav-links">
              <a href="#how-it-works">How it works</a>
              <a href="#pricing">Pricing</a>
              <Link href="/pantry">Pantry Review</Link>
            </div>
            {/* Ghost, not filled: one filled pill per viewport (DESIGN.md
                §Marketing landing) — the hero CTA is the filled one. */}
            <Link className="landing-cta landing-cta--sm landing-cta--ghost" href="/check">
              Check a meal
            </Link>
          </nav>

          <section className="landing-hero">
            <div className="landing-hero-copy">
              {/* The "what is this" answer, before the headline. A visitor
                  should not have to read a paragraph to learn the category. */}
              <p className="landing-eyebrow">
                A meal checker built only for prediabetes
              </p>
              <h1 className="landing-h1">Stop guessing at dinner.</h1>
              <p className="landing-sub">
                You got an A1C between <strong>5.7% and 6.4%</strong> and one
                line of advice: eat better. Revora is the part nobody
                explained.
                {photoEnabled
                  ? " Snap the meal, say it, or type it"
                  : " Say the meal out loud, or type it"}{" "}
                — you get one clear answer in about ten seconds:{" "}
                <strong>{RISK_LABELS.SAFE}</strong>,{" "}
                <strong>{RISK_LABELS.MODERATE}</strong>, or{" "}
                <strong>{RISK_LABELS.HIGH}</strong>, the reason behind it, and
                what to change.
              </p>
              <div className="landing-cta-row">
                <Link className="landing-cta" href="/check">
                  Check your first meal — free
                </Link>
              </div>
              <p className="landing-cta-hint">
                {TASTER_LIMIT} free checks on your first day, then you decide.
              </p>
              {/* `home-trust-strip` (copy-ledger.md, Approved + Active). The
                  ledger has recorded this row as living on app/page.tsx since
                  launch, but no version of the page rendered it — found during
                  the 2026-07-27 landing audit. Restored verbatim. */}
              <ul className="landing-trust-strip">
                <li>No login for your first checks.</li>
                <li>When we&apos;re unsure, we say so.</li>
                <li>
                  If you ever subscribe, cancel is one tap — not an email.
                </li>
              </ul>
            </div>

            {/* Phone mockup: the HONEST two-step oatmeal flow (§P1.1 / K1),
                real result-card markup, pixel-true. Typing "oatmeal" is
                genuinely ambiguous, so Revora asks one question before it
                answers — the demo shows that sequence rather than manufacturing
                an immediate card. The strings come from the promise registry
                via DemoCheckCard, so promise-registry.test pins them to the
                real precheck output.

                Until 2026-07-27 this bezel held a hand-copied duplicate of the
                DemoCheckCard markup, and the "kind of answer you get" section
                below rendered the SAME oatmeal verdict a second time. The
                duplicate is gone; the component is the single source. */}
            <div className="landing-phone">
              <div className="landing-phone-inner">
                <DemoCheckCard />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── At a glance ───────────────────────────────────────
          The offer in four facts, directly under the fold. A visitor who reads
          nothing else on the page should still be able to answer "what is it,
          who is it for, how fast, what does it cost me to try". */}
      <div className="landing-sheet">
        <div className="landing-frame">
          <ul className="landing-glance">
            <li>
              <span className="landing-glance-fact">10 seconds</span>
              <span className="landing-glance-label">
                from describing the meal to the answer
              </span>
            </li>
            <li>
              <span className="landing-glance-fact">5.7–6.4%</span>
              <span className="landing-glance-label">
                the only A1C range Revora is built for
              </span>
            </li>
            <li>
              <span className="landing-glance-fact">
                {TASTER_LIMIT} free checks
              </span>
              <span className="landing-glance-label">
                on day one, no login and no card
              </span>
            </li>
            <li>
              <span className="landing-glance-fact">Nothing to log</span>
              <span className="landing-glance-label">
                no weighing, no calories, no macros, ever
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── The problem (tint band) ───────────────────────────── */}
      <div className="landing-band">
        <div className="landing-frame">
          <section className="landing-section landing-section--tight">
            <div className="landing-section-head">
              <h2 className="landing-h2">
                The six-month wait is the problem
              </h2>
              <p className="landing-section-lede">
                Nobody handed you a plan. You were handed a number, two words
                of advice, and an appointment half a year away. Everything in
                between is supposed to be your job to figure out.
              </p>
            </div>
            <ul className="landing-pains">
              <li>
                <strong>The advice was two words long.</strong> “Eat better.”
                Better than what? Is oatmeal fine? Is the sandwich at lunch a
                problem? Nobody said, and the appointment is in six months.
              </li>
              <li>
                <strong>Every article contradicts the last one.</strong> Fruit
                is fine, fruit is sugar. Rice is out, brown rice is in. You
                have read all of it and you still do not know about the plate
                in front of you tonight.
              </li>
              <li>
                <strong>The apps want you to become an accountant.</strong>
                Weigh it, log it, scan the barcode, hit your macros. You did
                not ask for a second job. You asked what to do about dinner.
              </li>
              <li>
                <strong>So you guess, and then you worry.</strong> You eat the
                thing, and spend the next hour wondering whether it was a
                mistake. That loop is the actual cost of being told nothing.
              </li>
            </ul>
            <p className="landing-pains-note">
              Revora exists for that gap and nothing else. It is not a general
              nutrition app, not a calorie counter, and not built for everyone
              — if your A1C sits outside 5.7% to 6.4%, it says so plainly and
              points you to a clinician instead of pretending.
            </p>
            {/* The recognition moment — "that is my last six months" — is the
                highest-intent point on the page before pricing. It used to be
                3,800px of mobile scroll from the nearest way to act. */}
            <div className="landing-cta-row landing-cta-row--centered">
              <Link className="landing-cta" href="/check">
                Check your first meal — free
              </Link>
              <p className="landing-cta-hint">
                No login, no card, nothing to install.
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className="landing-frame">
        {/* ── How it works ────────────────────────────────────── */}
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
      </div>

      {/* ── The three answers (white sheet) ───────────────────── */}
      <div className="landing-sheet">
        <div className="landing-frame">
          <section className="landing-section" id="live-example">
            <div className="landing-section-head">
              {/* AUD-008: "the kind of answer", not "the actual answer" — the
                  cards below are illustrations until a live capture exists. */}
              <h2 className="landing-h2">
                Three meals. Three different answers.
              </h2>
              <p className="landing-section-lede">
                No dashboard, no numbers to decode. Notice that the{" "}
                {RISK_LABELS.SAFE} card carries no change to make: when a meal
                already looks balanced, Revora says so and stops. It does not
                invent a correction to look useful.
              </p>
            </div>
            <div className="landing-verdicts">
              <article className="landing-verdict" data-risk="SAFE">
                <p className="landing-verdict-meal">
                  Grilled chicken, brown rice, and a side salad
                </p>
                <p className="result-title verdict-title" data-risk="SAFE">
                  <IconCheck size={22} />
                  {RISK_LABELS.SAFE}
                </p>
                <p className="landing-verdict-reason">
                  This looks like a reasonable fit. The meal already has protein
                  and vegetables, so it looks more balanced than a
                  fast-carb-heavy option.
                </p>
              </article>

              <article className="landing-verdict" data-risk="MODERATE">
                <p className="landing-verdict-meal">
                  A bagel with jam and a glass of orange juice
                </p>
                <p className="result-title verdict-title" data-risk="MODERATE">
                  <IconAlert size={22} />
                  {RISK_LABELS.MODERATE}
                </p>
                <p className="landing-verdict-reason">
                  This may have a higher blood-sugar impact than a more balanced
                  meal because it leans heavily on refined carbs.
                </p>
                <p className="landing-verdict-row">
                  <IconHeart size={16} />
                  <span>
                    <strong>Adjustment:</strong> If practical, add protein or
                    nonstarchy vegetables to make it easier to handle.
                  </span>
                </p>
              </article>

              <article className="landing-verdict" data-risk="HIGH">
                <p className="landing-verdict-meal">
                  A large soda with fries on the side
                </p>
                <p className="result-title verdict-title" data-risk="HIGH">
                  <IconPause size={22} />
                  {RISK_LABELS.HIGH}
                </p>
                <p className="landing-verdict-reason">
                  This is likely a higher-impact choice in its current form
                  because it is mostly sugary or refined carbs.
                </p>
                <p className="landing-verdict-row">
                  <IconArrowRight size={16} />
                  <span>
                    <strong>Swap:</strong> A smaller portion with protein or
                    nonstarchy vegetables would be a steadier fit here.
                  </span>
                </p>
              </article>
            </div>
            <p className="landing-verdict-note">
              Illustrated examples. Every card ends with the same line: Revora
              is informational only and is not medical advice.
            </p>
            <div className="landing-cta-row landing-cta-row--centered">
              <Link className="landing-cta" href="/check">
                Check your first meal — free
              </Link>
            </div>
          </section>
        </div>
      </div>

      <div className="landing-frame">
        {/* ── What you get ────────────────────────────────────── */}
        <section className="landing-section">
          <div className="landing-section-head">
            <h2 className="landing-h2">Everything you get</h2>
            <p className="landing-section-lede">
              The whole product, listed plainly. Nothing on this list is coming
              soon, in beta, or behind a waitlist.
            </p>
          </div>
          <div className="landing-features">
            <div className="landing-feature">
              <h3>Describe a meal in your own words</h3>
              <p>
                {photoEnabled
                  ? "Snap it, say it, or type it. "
                  : "Say it out loud or type it. "}
                “Leftover lasagna and a glass of red” is a valid input. No
                database to search, no barcode to scan, no portion to weigh.
              </p>
            </div>
            <div className="landing-feature">
              <h3>One answer, not a dashboard</h3>
              <p>
                {RISK_LABELS.SAFE}, {RISK_LABELS.MODERATE}, or{" "}
                {RISK_LABELS.HIGH} — plus the reason in one sentence, and, when
                there is one, a change worth making and a swap. That is the
                whole screen.
              </p>
            </div>
            <div className="landing-feature">
              <h3>It asks before it guesses</h3>
              <p>
                Type “oatmeal” and Revora asks whether it is plain or
                sweetened, because the honest answer depends on it. Most apps
                would just pick one and sound confident.
              </p>
            </div>
            <div className="landing-feature">
              <h3>Answers in the aisle and at the table</h3>
              <p>
                It runs in the browser on your phone, so it is there in the
                supermarket and at the restaurant. Add it to your home screen
                if you want; there is nothing to install.
              </p>
            </div>
            <div className="landing-feature">
              <h3>A record you can actually show someone</h3>
              <p>
                Every check is saved to your account and visible on every
                device. Six months from now you can open it at your appointment
                instead of trying to remember.
              </p>
            </div>
            <div className="landing-feature">
              <h3>A weekly recap in sentences</h3>
              <p>
                Plain lines about what you did, like days checked in and steps
                followed through. Never a grade, never a streak to break,
                never a lab prediction.
              </p>
            </div>
            <div className="landing-feature">
              <h3>One reminder, if you want it</h3>
              <p>
                A single nudge a day, off by default. Skip a day and nothing
                breaks, nothing turns red, nothing guilt-trips you. Blank days
                are just blank.
              </p>
            </div>
            <div className="landing-feature">
              <h3>Your data, deleted on demand</h3>
              <p>
                Your A1C and meal text are encrypted at rest and stored only
                with your say-so. One tap deletes all of it, account included,
                with no retention screen in the way.
              </p>
            </div>
            <div className="landing-feature">
              <h3>The Pantry Review, separately</h3>
              <p>
                A one-time report that sorts the food already in your kitchen
                into three groups. One payment, nothing renews, no
                subscription attached.
              </p>
            </div>
          </div>
        </section>

        {/* ── What changes ────────────────────────────────────── */}
        <section className="landing-section">
          <div className="landing-section-head">
            <h2 className="landing-h2">What actually changes</h2>
            <p className="landing-section-lede">
              Not a transformation. Four specific moments in your week that
              stop being hard.
            </p>
          </div>
          <div className="landing-outcomes">
            <div className="landing-outcome">
              <p className="landing-outcome-before">
                Tonight you stand at the counter and guess.
              </p>
              <p className="landing-outcome-after">
                You describe the plate and know where it lands before you sit
                down.
              </p>
            </div>
            <div className="landing-outcome">
              <p className="landing-outcome-before">
                You read three articles at 11pm and they disagree.
              </p>
              <p className="landing-outcome-after">
                You ask about the one meal in front of you and stop reading.
              </p>
            </div>
            <div className="landing-outcome">
              <p className="landing-outcome-before">
                Eating out means ordering and then quietly worrying.
              </p>
              <p className="landing-outcome-after">
                You check the menu item at the table and order on purpose.
              </p>
            </div>
            <div className="landing-outcome">
              <p className="landing-outcome-before">
                Six months of meals, and nothing to show your doctor.
              </p>
              <p className="landing-outcome-after">
                A saved history of what you actually ate, in your own words.
              </p>
            </div>
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
                {/* AUD-007: describe the artifact the journey actually renders
                    — a non-scored weekly recap — never a score it doesn't. */}
                Your weekly recap is behavioral — plain sentences about what
                you did, like days checked in and steps followed through.
                Never a grade, or a lab prediction.{" "}
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

        {/* ── Pricing ─────────────────────────────────────────── */}
        <section className="landing-section" id="pricing">
          <div className="landing-section-head">
            <h2 className="landing-h2">Try it before you pay a cent</h2>
            <p className="landing-section-lede">
              {trialFunnel ? (
                <>
                  The funnel is the promise:{" "}
                  {TASTER_LIMIT} free checks on day one, a free week, and a
                  cancel button that lives on your account page — not behind
                  an email.
                </>
              ) : (
                <>
                  The funnel is the promise:{" "}
                  {TASTER_LIMIT} free checks on day one, a free account every
                  day after, and a cancel button that lives on your account
                  page — not behind an email.
                </>
              )}
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
            {trialFunnel ? (
              <>
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
                  <p className="landing-price-what">{monthlyPrice}/month</p>
                  <p>
                    Unlimited checks, your history on every device, progress
                    you can see, and one gentle reminder. Cancel in one tap.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="landing-price-tile">
                  <p className="landing-price-day">Every day</p>
                  <p className="landing-price-what">A free account</p>
                  <p>
                    No card. A free account still
                    includes {FREE_DAILY_CHECKS} free checks a day, with
                    your history saved to your account.
                  </p>
                </div>
                <div className="landing-price-tile">
                  <p className="landing-price-day">Premium</p>
                  <p className="landing-price-what">{monthlyPrice}/month</p>
                  <p>
                    Unlimited checks, your history on every device, progress
                    you can see, and one gentle reminder. Cancel in one tap.
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="landing-cta-row landing-cta-row--centered">
            <Link className="landing-cta" href="/check">
              Check your first meal — free
            </Link>
          </div>
        </section>
      </div>

      {/* ── Pantry Review (tint band) ─────────────────────────── */}
      <div className="landing-band">
        <div className="landing-frame">
          <section className="landing-section landing-section--tight landing-pantry">
            <div className="landing-pantry-copy">
              <h2 className="landing-h2">Or check the whole kitchen, once</h2>
              <p className="landing-section-lede">
                The Pantry Review sorts everything you already own into enjoy
                freely, worth a tweak, and handle with care. One calm,
                printable report, built from photos of your own shelves.
              </p>
              <p className="landing-pantry-terms">
                One payment. <strong>Nothing renews.</strong>
              </p>
              <div className="landing-cta-row">
                <Link className="landing-cta landing-cta--ghost" href="/pantry">
                  See a sample report
                </Link>
              </div>
            </div>
            <ul className="landing-pantry-buckets">
              <li data-risk="SAFE">
                <IconCheck size={18} />
                <span>Enjoy freely</span>
              </li>
              <li data-risk="MODERATE">
                <IconAlert size={18} />
                <span>Worth a tweak</span>
              </li>
              <li data-risk="HIGH">
                <IconPause size={18} />
                <span>Handle with care</span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <div className="landing-frame">
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
              {trialFunnel ? (
                <p>
                  No. Your first {TASTER_LIMIT} checks, on your first day, need
                  no login and no card — they live on this device only. The
                  7-day free trial needs a card but charges nothing for a week
                  — and we email you before any charge.
                </p>
              ) : (
                <p>
                  No. Your first {TASTER_LIMIT} checks, on your first day, need
                  no login and no card — they live on this device only. After
                  that, a free account includes {FREE_DAILY_CHECKS} free checks
                  a day — still no card. Premium is optional, and cancels in
                  one tap.
                </p>
              )}
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

      {/* ── Final CTA (tint band) ─────────────────────────────── */}
      <div className="landing-band">
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
            <p className="landing-cta-hint">
              No login. No card. {TASTER_LIMIT} free checks on your first day.
            </p>
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
              <Link href="/how-it-works">How the weekly recap works</Link>
              <a href="#live-example">See a live example</a>
            </div>
            <div className="landing-footer-col">
              <h3>Legal</h3>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
            <div className="landing-footer-col">
              <h3>Apps</h3>
              {/* Waitlist entries, not store listings — they render as plain
                  text when no waitlist URL is configured, so nothing on this
                  page ever looks tappable without being tappable. They sat
                  directly under the hero CTA until 2026-07-27, where two inert
                  pills split attention with the one real action. */}
              {androidWaitlist ? (
                <a href={androidWaitlist}>Google Play — join the waitlist</a>
              ) : (
                <span className="landing-footer-muted">
                  Google Play — coming soon
                </span>
              )}
              {iosWaitlist ? (
                <a href={iosWaitlist}>App Store — join the waitlist</a>
              ) : (
                <span className="landing-footer-muted">
                  App Store — coming soon
                </span>
              )}
            </div>
          </div>
          <p className="result-disclaimer">{BOUNDARY_DISCLAIMER}</p>
        </footer>
      </div>
    </main>
  );
}
