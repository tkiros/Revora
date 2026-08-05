import type { Metadata } from "next";
import Link from "next/link";

import { DemoCheckCard } from "../components/demo-check-card";
import { ExampleResultCard } from "../components/example-result-card";
import { LandingPause } from "../components/landing-pause";
import { TASTER_LIMIT } from "../lib/client/taster-store";
import { FREE_DAILY_CHECKS } from "../lib/free-tier";
import { photoInputEnabled } from "../lib/photo-input-flag";
import { BOUNDARY_DISCLAIMER } from "../lib/revora/boundary-copy";
import { RISK_LABELS } from "../lib/revora/labels";
import { paywallMode } from "../lib/server/pricing";
import { storeWaitlistUrl } from "../lib/waitlist";
import { reading } from "./fonts";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// One description string for the <meta> tag and the SoftwareApplication
// JSON-LD below, so the two can't drift apart. (Kept under ~160 chars so
// search snippets don't truncate it.)
const LANDING_DESCRIPTION =
  "A meal checker built only for prediabetes. Describe a meal and get cautious labels, reasons, and practical alternatives for the 5.7% to 6.4% A1C range.";

export const metadata: Metadata = {
  title: "Prediabetes Meal Checker — What You Can Eat | Revora",
  description: LANDING_DESCRIPTION
};

// Marketing landing (DESIGN.md §Marketing landing). The app lives at /check;
// this page's one job is credibility + the first check. No fabricated social
// proof — the page shows the product's own card instead. All copy here is
// scanned by the claims-boundary audit.
//
// Two hard rules this file must keep (F-04 / F-07, 2026-07-11 claims
// reconciliation):
//  - The adjustment and the swap are CONDITIONAL. A SAFE ("Clear") result is
//    structurally forbidden either one (lib/revora/postprocess.ts
//    assertNoUnsafeSafeFields throws), so no surface may promise them
//    unconditionally. Always hedge: "when there's one". The Clear example
//    card below demonstrates this rather than asserting it — it carries no
//    adjustment and no swap, because the engine cannot produce them there.
//  - The free tier is TASTER_LIMIT checks on day one only, device-local. The
//    number is interpolated from lib/client/taster-store.ts — never retyped —
//    so the store listing, the landing page, and the meter can't drift apart.
//    (Importing the constant is safe from a server component: taster-store
//    touches `window` only inside function bodies.)
//
// Verdict words come from lib/revora/labels.ts (RISK_LABELS) — never retyped.
//
// Surface treatment: this page is ONE plane (DESIGN.md §11). The deep-green
// `.landing-dark` bands went on owner instruction 2026-07-27; the white sheets
// and `--accent-tint` bands that replaced them went 2026-08-05, because white
// is card material here and a white region that is not a card is a bug.
// Rhythm is now air plus a hairline on the block itself.
// The primary CTA, assembled once. Every instance on this page is the same
// button with the same destination and the same optional caption underneath;
// hand-building it per section is how the five copies drifted into four
// different shapes. `spaced` adds the top margin sections need when the CTA
// follows a block of content rather than sitting in a gap-managed grid.
function LandingPrimaryCta({
  hint,
  spaced = false
}: {
  hint?: string;
  spaced?: boolean;
}) {
  return (
    <div
      className={`landing-cta-stack${spaced ? " landing-cta-stack--spaced" : ""}`}
    >
      <Link className="landing-cta" href="/check">
        Check your first meal — free
      </Link>
      {hint ? <p className="landing-cta-hint">{hint}</p> : null}
    </div>
  );
}

export default function LandingPage() {
  const androidWaitlist = storeWaitlistUrl("android");
  const iosWaitlist = storeWaitlistUrl("ios");
  const photoEnabled = photoInputEnabled();
  // §0.2 #4 — this page names NO amount, anywhere. The pricing section was
  // deleted on owner instruction 2026-08-05 ("the price should not be
  // mentioned, only focus on free check"), which satisfies the rule the
  // strongest way available: a page with no price on it cannot show a price
  // checkout won't charge.
  //
  // What survives is the one place the page still describes what happens
  // after the free checks — the FAQ answer below. It stays branch-aware off
  // the same server flag checkout enforces, because "do I need a card?" has a
  // different true answer in each mode, and answering it wrong is the one
  // unforced error this audience never forgives.
  const trialMode = paywallMode() === "trial";
  // FAQ copy as data: the visible <details> list and the FAQPage JSON-LD
  // render from these same strings, so the schema can never drift from the
  // page. Scanned by the claims-boundary audit like every string here.
  const faqs: Array<{ q: string; a: string }> = [
    {
      q: "Is Revora medical advice?",
      a: "No. Revora is informational only and is not medical advice. Its labels describe general meal patterns. Broad A1C-range context only makes the presentation more cautious; it does not predict your response or decide whether a meal is medically appropriate. Talk with a doctor or registered dietitian for guidance specific to you."
    },
    {
      q: "Who is Revora for?",
      a: "People in the prediabetes A1C range of 5.7% to 6.4%. If your number falls outside that range, Revora says so plainly and points you to a clinician instead of pretending."
    },
    {
      q: "Do I need an account or a card to try it?",
      a: trialMode
        ? `No. Your first ${TASTER_LIMIT} checks, on your first day, need no login and no card. They live on this device only. The 7-day free trial needs a card but charges nothing for a week, and we email you before any charge.`
        : `No. Your first ${TASTER_LIMIT} checks, on your first day, need no login and no card. They live on this device only. After that, a free account includes ${FREE_DAILY_CHECKS} free checks a day, still no card. Premium is optional, and cancels in one tap.`
    },
    ...(photoEnabled
      ? [
          {
            q: "How does the photo check work?",
            a: "Your photo becomes a draft list of what's on the plate. You review and confirm the words before anything is checked. The photo never skips your judgment. Photos are not kept."
          }
        ]
      : []),
    {
      q: "How do I cancel?",
      a: "One tap, on your account page, effective at the end of the paid period. No retention screens, no email hoops. Deleting your account removes your data with it."
    }
  ];
  // Machine-readable summary for Google rich results and AI answer engines.
  // Every string is either shared with the visible page (LANDING_DESCRIPTION,
  // faqs) or an interpolated constant — nothing is claimed here that the page
  // doesn't already say.
  // No `offers` node on purpose: this page names no amount at all (§0.2 #4),
  // and a schema.org price would put one back — invisible to the reader, and
  // still a hardcoded claim outside the live server flags.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${APP_URL}/#app`,
        name: "Revora",
        url: APP_URL,
        description: LANDING_DESCRIPTION,
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        publisher: {
          "@type": "Organization",
          name: "Revora",
          url: APP_URL,
          logo: `${APP_URL}/icon-512.png`
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${APP_URL}/#faq`,
        url: APP_URL,
        mainEntity: faqs.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a }
        }))
      }
    ]
  };
  return (
    <>
      <script
        type="application/ld+json"
        // <-escape so no string could ever terminate the script block.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      {/* Same skip affordance the app shell has (DESIGN.md §App shell), and
          like the shell it lives OUTSIDE <main> — a skip link inside the
          landmark it skips within is announced as main content. Being outside
          also keeps <main>'s first child the one page frame. */}
      <a href="#landing-hero" className="app-skip">
        Skip to content
      </a>
      {/* reading.className: the load-bearing source of the landing body
          family (app/fonts.ts). */}
      <main className={`landing ${reading.className}`}>
      <div className="landing-frame">
        {/* ── Nav + hero ────────────────────────────────────────── */}
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
            {/* Routes, not in-page anchors: the how-it-works block is gone,
                and /how-it-works is where the footer already points. The
                "Pricing" link went with the pricing section (owner, 2026-08-05)
                — a nav link to a deleted #pricing is a dead fragment, and no
                test on this repo catches one. */}
            <Link href="/how-it-works">How it works</Link>
            <Link href="/pantry">Pantry Review</Link>
          </div>
          {/* Ghost, not filled: one filled pill per viewport (DESIGN.md
              §Marketing landing) — the hero CTA is the filled one. */}
          <Link className="landing-cta landing-cta--sm landing-cta--ghost" href="/check">
            Check a meal
          </Link>
        </nav>

        {/* tabIndex={-1}: the skip link must MOVE FOCUS here, not just
            scroll — same as the app shell's #app-content target. */}
        <section className="landing-hero" id="landing-hero" tabIndex={-1}>
          <div className="landing-hero-copy">
            {/* The category answer IS the headline now — it used to be an
                eyebrow above a headline that said the same thing twice
                (ledger `landing-hero-moment`). */}
            <h1 className="landing-h1">
              A meal checker built only for prediabetes.
            </h1>
            {/* `the plate in front of you` is load-bearing and may not be cut
                for pixels: the H1 reads categorised, not recognised, and this
                is the only second-person, present-tense, concrete object above
                the fold. 33 words is a recorded, measured deviation from the
                20-word ceiling. */}
            <p className="landing-sub">
              Describe the plate in front of you. One card back: where it
              lands, why, and a change worth making when there is one. For an
              A1C of 5.7% to 6.4%. Nothing to log.
            </p>
            {/* `home-trust-strip` (copy-ledger.md, Approved + Active). The
                ledger has recorded this row as living on app/page.tsx since
                launch, but no version of the page rendered it — found during
                the 2026-07-27 landing audit. Restored verbatim.

                ⚠️ MEASURED POSITION (DESIGN.md §11.1), above the CTA rather
                than below it. Raising the body to 18px lengthened the page by
                294px and pushed the hero→block-2 stretch to 2,034px, 33px past
                the three-screenful budget. Every other lever measured worse:
                block 2's CTA is already at its ruled position and moving it
                above the pains list just relocates the overage downstream
                (1,267px → ~2,040px), and dropping that CTA's 32px `--spaced`
                margin lands on 2,002px — one pixel over. Moving these three
                lines above the button costs no copy, does not change the page
                length at all, and measures 1,877px. `.landing-hero-copy` keeps
                its exact height, so the proof card does not move and the
                button stays above the fold (top 493px of 667). Re-measure
                before moving it back: node scripts/measure-landing.mjs */}
            <ul className="landing-trust-strip" role="list">
              <li>No login for your first checks.</li>
              <li>When we&apos;re unsure, we say so.</li>
              <li>
                If you ever subscribe, cancel is one tap — not an email.
              </li>
            </ul>
            <LandingPrimaryCta
              hint={`${TASTER_LIMIT} free checks on your first day, then you decide.`}
            />
          </div>

          {/* The product's own card, above the fold, at Clear. It is the same
              component block 4's first card renders and the same fixture, so
              the two are byte-identical by construction — which is exactly
              what block 4's lede tells the reader.

              ⛔ The label renders from demoExampleEyebrow(null) inside the
              component, never typed here: the day an authorised live capture
              lands, that function returns "A real check, captured <date>" and
              a hand-written "An illustrated example" becomes a false claim.

              The oatmeal clarify flow that used to sit here moved to block 3,
              where the pause it demonstrates is the argument. */}
          <div className="landing-hero-proof">
            <ExampleResultCard risk="SAFE" labelled withFineprint />
            <p className="landing-card-caption">
              This is the whole screen. No score, no dashboard, no change to
              make: this meal already looks balanced, so that is the whole
              answer.
            </p>
          </div>
        </section>

        {/* ── The problem ───────────────────────────────────────── */}
        <section className="landing-section">
          <div className="landing-section-head">
            <h2 className="landing-h2">
              Six months is a long time to guess.
            </h2>
            <p className="landing-section-lede">
              Nobody handed you a plan. You were handed a number, two words
              of advice, and an appointment half a year away. Everything in
              between is supposed to be your job to figure out.
            </p>
          </div>
          <ul className="landing-pains" role="list">
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
              <strong>The apps want you to become an accountant.</strong>{" "}
              Weigh it, log it, scan the barcode, hit your macros. You did
              not ask for a second job. You asked what to do about dinner.
            </li>
            <li>
              <strong>So you guess, and then you worry.</strong> You eat the
              thing, and spend the next hour wondering whether it was a
              mistake. That loop is the actual cost of being told nothing.
            </li>
          </ul>
          {/* The recognition moment — "that is my last six months" — is the
              highest-intent point on the page, so the exit sits directly on
              it. (It used to be qualified "before pricing"; there is no
              pricing section any more, which makes it the highest-intent
              point full stop.)

              ⚠️ MEASURED POSITION (DESIGN.md §11.1). With the CTA below the
              scope note, the hero-to-here stretch measures 2,053px — 52px past
              the three-screenful budget, and the only over-budget desert left
              on the page. Above the note it measures 1,913px and the whole
              page is inside the rule. Moving a button 140px is the cheapest
              thing on the page that buys that, and it costs no copy: the note
              is a qualifier, not a lead-in. Re-measure before moving it back:
              node scripts/measure-landing.mjs */}
          <LandingPrimaryCta
            hint="No login, no card, nothing to install."
            spaced
          />
          {/* The three-negation sentence ("not a general nutrition app, not a
              calorie counter, not built for everyone") is deleted: it is in
              the Brief's own "what only sounds like it does" table — every
              calorie counter says it is not a calorie counter — and it sat
              four lines above the highest-intent pre-pricing exit. The hero
              answers that objection the correct way, by showing one card. */}
          <p className="landing-scope-note">
            Revora exists for that gap and nothing else. If your A1C sits
            outside 5.7% to 6.4%, it says so plainly and points you to a
            clinician instead of pretending.
          </p>
        </section>

        {/* ── The pause ─────────────────────────────────────────── */}
        <section className="landing-section landing-pause">
          <div className="landing-section-head">
            <h2 className="landing-h2">It asks before it guesses</h2>
          </div>
          {/* The HONEST two-step oatmeal flow (§P1.1 / K1) in real result-card
              markup: "oatmeal" is genuinely ambiguous, so Revora asks one
              question instead of guessing, and only then answers. The three
              interaction strings come from the promise registry via
              DemoCheckCard — promise-registry.test pins them to the precheck's
              real output, so this scene cannot drift from the product.

              ⛔ The card's first line — the one showing what the reader
              entered — is STATIC TEXT. It looks like a form field and must
              never become one: no input element, not focusable, no caret.
              (Quoting that line here verbatim goes red, and should: the pin
              at promise-registry.test.ts strips only comment-LEADING lines,
              so a JSX comment is scanned like rendered markup.) */}
          <LandingPause>
            <DemoCheckCard />
          </LandingPause>
          <p className="landing-card-caption">
            Without that one question, Revora would have been guessing.
          </p>
          {/* ⛔ A text link, not a pill, and no filled CTA anywhere in this
              block — the absence is the argument. It is also the page's most
              important non-primary CTA: four of the five cards on this page
              are fixtures, and this is the one place a reader can make the
              product do the thing. Instrument it separately from the primary
              CTA from day one. */}
          <Link className="landing-dare" href="/check">
            Type “oatmeal” and see what it asks you.
          </Link>
        </section>

        {/* ── The three answers ─────────────────────────────────── */}
        <section className="landing-section" id="live-example">
          <div className="landing-section-head">
            {/* AUD-008: "the kind of answer", not "the actual answer" — the
                cards below are illustrations until a live capture exists. */}
            <h2 className="landing-h2">The same card, three times.</h2>
            {/* Sentence 2 exists because the hero's card and card 1 below are
                byte-identical — same meal, same result-safe-example row —
                under an H2 that says "three times". Naming the duplicate
                converts it into the block's evidence; a fourth meal fixture
                would cost two ledger rows to say less. */}
            <p className="landing-section-lede">
              One layout, whatever the answer is. The first card is the one
              from the top of this page, next to the two you have not seen.
              The {RISK_LABELS.SAFE} card carries no change to make, because
              when a meal already looks balanced Revora says so and stops. It
              does not invent a correction to look useful.
            </p>
          </div>
          {/* Three instances of the product's card, not three lookalikes.
              The fixtures live in the component so the hero's card and the
              first card here cannot drift apart. */}
          <div className="landing-verdicts">
            <ExampleResultCard risk="SAFE" />
            <ExampleResultCard risk="MODERATE" />
            <ExampleResultCard risk="HIGH" />
          </div>
          <p className="landing-verdict-note">
            Illustrated examples. Every card ends with the same line: Revora
            is informational only and is not medical advice.
          </p>
          <LandingPrimaryCta spaced />
          {/* The sources, as this block's closing footnote (ledger
              `landing-sources-note`). The proof band that used to carry them
              is gone: a component whose primary affordance — a stat slot —
              has to be neutered for the content to be safe is the wrong
              component. Rail 7 is now discharged structurally, because no
              number-shaped slot exists to put a number into, rather than by a
              CSS comment asking nobody to. The one cited-trial statistic in
              the corpus stays off this page — family `study-association`,
              exempt only on /how-it-works. (Naming that trial here, even in
              a comment, goes red: claims-boundary-copy.test.ts strips only
              comment-LEADING lines, so a JSX comment is audited exactly like
              rendered copy. It caught two drafts of this very note.) */}
          <div className="landing-sources">
            <p>
              Revora&apos;s general meal-planning principles map to
              public-health guidance and cited nutrition research — that carbs
              raise blood sugar, that pairing them with protein, fibre or
              nonstarchy vegetables can slow the rise, and that less-refined
              carbs generally land more gently than highly refined ones.
            </p>
            <p>
              Those sources support narrow educational statements about food.
              They are not evidence that Revora produces a particular health
              result, and nothing on this page claims otherwise.
            </p>
            <p>
              <Link className="inline-link" href="/how-it-works">
                Read the sources and the limits
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ── The pricing section stood here ────────────────────
            Deleted 2026-08-05 on owner instruction: "the price should not be
            mentioned, only focus on free check." Three price tiles, the
            branch-aware "…then a decision." H2, the cancel promise, a CTA,
            the four subscription claims and the Pantry Review paragraph all
            went with it — every one of them described what happens after you
            pay, which is the thing this page is no longer about.

            Deleting the section is what discharges §0.2 #4 now, and it
            discharges it harder than the old mechanism did: a page carrying
            no amount cannot show an amount checkout won't charge. The pins
            moved with it — landing-paywall-copy.test.ts now asserts the
            ABSENCE, and both mode-pinned e2e servers assert no #pricing
            section exists under either paywall mode. Restoring any of this
            copy means restoring those pins in their presence-asserting form.

            Ledger rows `landing-cancel-promise` and `landing-what-you-get`
            are now unrendered. They stay Approved in copy-ledger.md — the
            strings are still true and still ship in the app — but nothing on
            this page renders them. */}

        {/* ── FAQ ─────────────────────────────────────────────── */}
        <section className="landing-section" id="faq">
          <div className="landing-section-head">
            <h2 className="landing-h2">Fair questions</h2>
          </div>
          <div className="landing-faq">
            {faqs.map(({ q, a }) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────── */}
        <section className="landing-final">
          {/* H2 and sub deleted: four elements, every one of them a
              restatement of the hero, with no object on screen to make the
              restatement mean anything. The CTA and its caption are the whole
              block. */}
          <LandingPrimaryCta
            hint={`No login. No card. ${TASTER_LIMIT} free checks on your first day.`}
          />
        </section>

        {/* ── Footer ────────────────────────────────────────────── */}
        <footer className="landing-footer">
          {/* The nav collapses to wordmark+CTA below 640px and relies on the
              footer as the fallback — so the footer must BE navigation to
              assistive tech, not four bare divs. */}
          <nav className="landing-footer-cols" aria-label="Footer">
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
              <Link href="/guides">Prediabetes guides</Link>
              <a href="#live-example">See a live example</a>
            </div>
            <div className="landing-footer-col">
              <h3>Legal</h3>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
            <div className="landing-footer-col">
              <h3>Apps</h3>
              {/* The true today-story leads; store waitlists render only when
                  configured. No "coming soon" placeholders — this page promises
                  "nothing on this list is coming soon", and the footer is the
                  last thing a scanner reads. */}
              <Link href="/get-the-app">Add to home screen — works today</Link>
              {androidWaitlist ? (
                <a href={androidWaitlist}>Google Play — join the waitlist</a>
              ) : null}
              {iosWaitlist ? (
                <a href={iosWaitlist}>App Store — join the waitlist</a>
              ) : null}
            </div>
          </nav>
          <p className="result-disclaimer">{BOUNDARY_DISCLAIMER}</p>
        </footer>
      </div>
      </main>
    </>
  );
}
