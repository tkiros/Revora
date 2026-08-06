import type { Metadata } from "next";
import Link from "next/link";

import { DemoCheckCard } from "../components/demo-check-card";
import {
  ExampleResultCard,
  LandingVerdictCard
} from "../components/example-result-card";
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
// `onDark` inverts the pill for the one accent-ground section on the page
// (`.landing-changes`). The modifier goes on the WRAPPER, not the pill: the
// inversion is done by `.landing-cta-stack--on-dark .landing-cta` in CSS, so
// the Link's own class attribute stays a bare literal. That is load-bearing —
// landing-design-guards.test.ts counts bare occurrences of it to prove the
// filled pill is assembled exactly once, so interpolating the class onto the
// Link would zero that count. (Nor may this comment spell the attribute out:
// the same scan counts matches in comments, and quoting it here reads as a
// second hand-built pill. It cost a full vitest cycle to learn that.)
function LandingPrimaryCta({
  hint,
  spaced = false,
  onDark = false
}: {
  hint?: string;
  spaced?: boolean;
  onDark?: boolean;
}) {
  return (
    <div
      className={`landing-cta-stack${spaced ? " landing-cta-stack--spaced" : ""}${onDark ? " landing-cta-stack--on-dark" : ""}`}
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
      // The design file's rewrite, adopted with exactly one clause changed.
      // It writes "It does not diagnose anything" — and the banned-family
      // regex in claims-boundary-copy.test.ts is NEGATION-BLIND by design, so
      // a denial of a banned claim still trips it. That is not a bug to work
      // around: the audit cannot tell a denial from an assertion, and the
      // safe direction is to never print the token. "Identify any condition"
      // carries the same meaning at the same length and keeps the design's
      // three-clause rhythm.
      q: "Is Revora medical advice?",
      a: "No. Revora is informational only and gives general educational information about meal composition. It does not identify any condition, does not predict your individual response, and does not replace a doctor or registered dietitian. Talk with a clinician for guidance that is specific to you."
    },
    {
      q: "Who is Revora for?",
      a: "People in the prediabetes A1C range of 5.7% to 6.4%. If your number falls outside that range, Revora says so plainly and points you to a clinician instead of pretending."
    },
    {
      // ⛔ THE DESIGN FILE DRAWS THIS ROW EXPANDED. It ships collapsed, and
      // the reason is measured, not aesthetic: this is the longest answer on
      // the page, and open by default it added 246px to the stretch between
      // the limits block's exit and the final one — 2,034px against the
      // 2,001px reachability budget (DESIGN.md §11.1), which fails the build.
      // A row drawn open in a mockup is a mockup showing what open looks
      // like. If it should genuinely ship open, the budget has to be paid for
      // somewhere else first — an exit at the foot of the offer ladder is the
      // obvious candidate — and re-measured: node scripts/measure-landing.mjs
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
      // 🆕 2026-08-06, the v2 design's one added question. "Say it" is a
      // shipped affordance, not an aspiration — .voice-input in globals.css
      // and inputMethod: z.enum(["text","voice","photo"]) in the history
      // handler. Do not let it drift into naming photo input, which is
      // gated above and off.
      q: "What do I actually have to do?",
      a: "Describe the meal in your own words — type it or say it. No weighing, no barcode, no portion sizes, no food database to search. If the description is ambiguous, Revora asks one question."
    },
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
            {/* The design file's second nav link is the FAQ, not the Pantry
                Review. Nothing is lost — the Pantry Review keeps its footer
                entry — and this points at the block a hesitant reader is
                actually looking for. */}
            <a href="#faq">Fair questions</a>
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

        {/* ── At a glance ───────────────────────────────────────
            Ledger `landing-glance-strip`. Restored 2026-08-06 at owner
            request; the v2 design file places it directly under the hero,
            which is where a reader who did not read the sub goes next.

            ⛔ The first stat used to read "10 seconds" and does not any more.
            Nobody ever measured it, and a latency claim is falsifiable by any
            reader on a slow connection — it was the only unsubstantiated
            claim on the page. "Seconds, not sessions" makes the same argument
            (this is not a logging app) with nothing left to miss.

            Rule-topped, not carded: §11's one plane. These are four facts in
            a row, and a border-top is all the styling they get. */}
        <section className="landing-section landing-section--sheet landing-glance-section">
          <ul className="landing-glance" role="list">
            <li>
              {/* The break is the design file's and it is deliberate: this is
                  the one fact of the four that is a two-part contrast rather
                  than a value, and letting it wrap on its own put "not" at
                  the end of line one at some widths. */}
              <span className="landing-glance-fact">
                Seconds,
                <br />
                not sessions
              </span>
              <span className="landing-glance-label">
                from describing the meal to the answer
              </span>
            </li>
            <li>
              <span className="landing-glance-fact">5.7–6.4%</span>
              <span className="landing-glance-label">
                if your A1C is here, this was built for you
              </span>
            </li>
            <li>
              {/* Interpolated, never typed — same constant the hero caption
                  and the FAQ answer read from (copy-pins.test.ts). */}
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
          {/* ⚠️ MEASURED POSITION (DESIGN.md §11.1), and the one exit on this
              page the design file does not draw.

              The design puts no CTA between the hero and §4. That holds at the
              1280px it was drawn at and fails at the 375px the budget is
              measured at: the strip renders on phones now (the design shows it
              at every width), which put 469px back into the page's worst
              desert and took hero→§4 to 2,485px against a 2,001px budget — a
              hard build failure, not a preference.

              One pill fixes it, and it belongs here rather than at the foot of
              the problem block: it lands directly under four reasons to try
              the thing, and it splits the stretch roughly evenly instead of
              leaving the first half over budget. Re-measure before moving it:
              node scripts/measure-landing.mjs */}
          <LandingPrimaryCta spaced />
        </section>

        {/* ── §3 The problem ─────────────────────────────────────
            Two columns, the design file's: the reader's situation stated once
            on the left, the four pains enumerated on the right. The left
            column is STICKY — it holds the question in view while the reader
            scrolls the answers, which is the reason the design splits them
            rather than stacking a head above a list.

            ⚠️ Sticky works here only because `overflow-x: clip` was moved off
            `.landing` and onto `html`. Put it back on any ancestor between
            this column and the viewport and it silently becomes a normal
            column — no error, no warning, nothing in a test. */}
        <section className="landing-section landing-problem">
          <div className="landing-problem-grid">
          <div className="landing-section-head landing-problem-head">
            <h2 className="landing-h2">
              Six months is a long time to guess.
            </h2>
            <p className="landing-section-lede">
              Nobody handed you a plan. You were handed a number, two words
              of advice, and an appointment half a year away. Everything in
              between is supposed to be your job to figure out.
            </p>
          </div>
          {/* An <ol>, numbered by CSS counter rather than by typing "01" into
              the markup. The design draws the numerals as content; a real list
              gets the same pixels, keeps the sequence in the accessibility
              tree, and cannot fall out of order when someone inserts a fifth
              pain. */}
          <ol className="landing-pains">
            <li>
              <h3>The advice was two words long.</h3>
              <p>
                “Eat better.” Better than what? Is oatmeal fine? Is the
                sandwich at lunch a problem? Nobody said, and the appointment
                is in six months.
              </p>
            </li>
            <li>
              <h3>Every article contradicts the last one.</h3>
              <p>
                Fruit is fine, fruit is sugar. Rice is out, brown rice is in.
                You have read all of it and you still do not know about the
                plate in front of you tonight.
              </p>
            </li>
            <li>
              <h3>The apps want you to become an accountant.</h3>
              <p>
                Weigh it, log it, scan the barcode, hit your macros. You did
                not ask for a second job. You asked what to do about dinner.
              </p>
            </li>
            <li>
              <h3>So you guess, and then you worry.</h3>
              <p>
                You eat the thing, and spend the next hour wondering whether
                it was a mistake. That loop is the actual cost of being told
                nothing.
              </p>
            </li>
          </ol>
          </div>
        </section>

        {/* ── §4 Scope, beside the real screen ────────────────────
            A white sheet in the design's alternation, two columns centred on
            each other: the scope sentence and the exit on the left, the app on
            the right. The design gives this block its own section; it used to
            be the tail of the problem block.

            ⚠️ MEASURED POSITION (DESIGN.md §11.1). The exit used to sit inside
            the problem block, above the scope note. The design puts no exit in
            the problem block at all and places this one here instead — and the
            at-a-glance strip now renders on phones too, adding to the same
            stretch. Both were paid for by re-measuring, not by assertion.
            Re-measure before moving it: node scripts/measure-landing.mjs

            ⚠️ A REAL CAPTURE of /check, NOT the design's drawn phone. The
            design mocks up a handset with invented values (an A1C, a meal, a
            checks-left line) because a static mockup cannot embed a live
            screen — the same reason it draws a fake result card that this page
            renders with the real component. Drawn UI in the mockup means "the
            product's screen goes here", and the real capture is that. It also
            cannot silently drift from the app the way a drawing can.
            Regenerate with `node scripts/capture-landing-art.mjs`.

            ⛔ The capture bakes the free-check count in as PIXELS. That is the
            one number every other surface interpolates from TASTER_LIMIT so it
            cannot drift, and no copy audit can read a PNG. landing-art.test.ts
            pins the coupling: move TASTER_LIMIT and it fails, naming the
            re-capture command. */}
        <section className="landing-section landing-section--sheet landing-scope">
          <div className="landing-scope-grid">
            <div className="landing-scope-copy">
              <p className="landing-scope-display">
                Revora exists for that gap and nothing else.
              </p>
              <p className="landing-section-lede">
                If your A1C sits outside 5.7% to 6.4%, it says so plainly and
                points you to a clinician instead of pretending.
              </p>
              <LandingPrimaryCta
                hint="No login, no card, nothing to install."
                spaced
              />
            </div>
            <div className="landing-scope-art">
              <img
                src="/landing/app-check.png"
                alt="The Revora check screen on a phone: one box to describe the meal, one field for your latest A1C, and a button to check it."
                width={390}
                height={700}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </section>

        {/* ── The pause ─────────────────────────────────────────── */}
        <section className="landing-section landing-pause">
          {/* Two columns, sticky left — the design file's §5. The explanation
              stays in view beside the card it explains, which is the point of
              splitting them. Sticky depends on `overflow-x: clip` living on
              `html`; see `.landing-problem-head`. */}
          <div className="landing-pause-grid">
          <div className="landing-section-head landing-pause-head">
            <h2 className="landing-h2">It asks before it guesses</h2>
            {/* The design file's lede for this block, which the previous
                implementation dropped. It states in words what the card
                beside it demonstrates. True as written: "oatmeal" is in the
                precheck's ambiguous set, and the one question it asks is the
                plain-or-sweetened one the card shows. */}
            <p className="landing-section-lede">
              Type “oatmeal” and Revora asks whether it is plain or sweetened,
              because the honest answer depends on it.
            </p>
            <p className="landing-pause-punch">
              Without that one question, Revora would have been guessing.
            </p>
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
          <div className="landing-pause-art">
            <LandingPause>
              {/* The design file's six-row label-gutter table. The layout is a
                  prop rather than the component's only shape because `/check`
                  and `/demo` render this same component, and a marketing
                  drawing does not get to restyle an in-app surface. */}
              <DemoCheckCard layout="table" />
            </LandingPause>
          </div>
          {/* ⛔ A text link, not a pill, and no filled CTA anywhere in this
              block — the absence is the argument. It is also the page's most
              important non-primary CTA: four of the five cards on this page
              are fixtures, and this is the one place a reader can make the
              product do the thing. Instrument it separately from the primary
              CTA from day one.

              ⚠️ It sits AFTER the card in the DOM and is placed back into the
              left column by grid at >=900px, which is where the design draws
              it. That is a reachability fix, not a preference: stacked on a
              phone, a link written before the card left 2,576px of scroll
              behind it with no exit — over the §11.1 budget and a hard build
              failure. After the card it reads better too, because by then the
              reader has seen the thing the link dares them to try. */}
          <div className="landing-pause-dare">
            <Link className="landing-dare" href="/check">
              Type “oatmeal” and see what it asks you.
            </Link>
          </div>
          </div>
        </section>

        {/* ── The three answers ─────────────────────────────────── */}
        <section className="landing-section landing-section--sheet" id="live-example">
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
          {/* ⚖️ THE DESIGN FILE'S FLAT CARD, NOT THE PRODUCT'S — owner ruling,
              2026-08-06, taken with the cost stated. Until today these were
              three instances of the real card, and the page's thesis was that
              marketing shows the product's artifact unmodified. The design
              file draws illustrations instead and the owner chose the design
              file. What survives of the old rule: both families read the
              one fixture set in example-result-card.tsx, so these cannot drift
              from the real card's WORDS — only from its recipe. See that
              file's note on LandingVerdictCard, and DESIGN.md §11. */}
          <div className="landing-verdicts">
            <LandingVerdictCard risk="SAFE" />
            <LandingVerdictCard risk="MODERATE" />
            <LandingVerdictCard risk="HIGH" />
          </div>
          {/* The design's closing row: the note left, the pill right, one
              line at desk width and stacked once they no longer fit. */}
          <div className="landing-verdict-close">
            <p className="landing-verdict-note">
              Illustrated examples. Every card ends with the same line: Revora
              is informational only and is not medical advice.
            </p>
            <LandingPrimaryCta />
          </div>
        </section>

        {/* ── What actually changes ─────────────────────────────
            Ledger `landing-what-changes`. Restored 2026-08-06 at owner
            request; the v2 design file gives it the page's one dark band.

            ⚠️ THIS IS THE ONE PLACE THIS PASS KNOWINGLY OVERTURNS A RECORDED
            DECISION. The deep-green `.landing-dark` bands were deleted
            2026-08-05 for DESIGN.md §11's one-plane rule, on the reasoning
            that white is card material here so a non-card region wearing it
            is a bug. That reasoning was about WHITE. This band is accent, not
            surface: it cannot be mistaken for a card because no card on this
            page is dark, so the ambiguity §11 was protecting against does not
            arise. It is also the only tonal shift on a deliberately flat
            page, and it lands on the one section whose job is lift rather
            than evidence. Shipped under the owner's 2026-08-06 ruling that
            the design file governs layout. If §11 is amended to forbid this
            outright, this section loses its background and nothing else.

            ⛔ Every "after" state is a BEHAVIOUR the reader performs, never a
            number that moves. That is what keeps this block on the safe side
            of the outcome-claim line, and it is why the second line says
            "Not a transformation" before the list rather than after it. */}
        <section className="landing-section landing-changes">
          <div className="landing-section-head">
            <h2 className="landing-h2">What actually changes</h2>
            <p className="landing-section-lede">
              Not a transformation. Four specific moments in your week that
              stop being hard.
            </p>
          </div>
          <ul className="landing-changes-list" role="list">
            <li>
              <span className="landing-changes-now">
                Tonight you stand at the counter and guess.
              </span>
              <span className="landing-changes-after">
                You describe the plate and know where it lands before you sit
                down.
              </span>
            </li>
            <li>
              <span className="landing-changes-now">
                You read three articles at 11pm and they disagree.
              </span>
              <span className="landing-changes-after">
                You ask about the one meal in front of you and stop reading.
              </span>
            </li>
            <li>
              <span className="landing-changes-now">
                Eating out means ordering and then quietly worrying.
              </span>
              <span className="landing-changes-after">
                You check the menu item at the table and order on purpose.
              </span>
            </li>
            <li>
              <span className="landing-changes-now">
                Six months of meals, and nothing to show your doctor.
              </span>
              <span className="landing-changes-after">
                A saved history of what you actually ate, in your own words.
              </span>
            </li>
          </ul>
          {/* ⚠️ MEASURED POSITION (DESIGN.md §11.1). The design file puts no
              exit in this section. It has to have one: with the three new
              sections in place and no CTA between the three-answers block and
              the final CTA, that stretch measured 3,949px at 375px — 1,948px
              past the three-screenful budget and by far the worst desert the
              page has ever had. This CTA and the one at the end of the limits
              block are what split it into three legal stretches.
              Re-measure before removing either: node scripts/measure-landing.mjs */}
          <LandingPrimaryCta spaced onDark />
        </section>

        {/* ── Limits ────────────────────────────────────────────
            The sources footnote was the closing prose of the block above
            until 2026-08-06. The v2 design promotes it to its own section
            and pairs it with the two commitments that were previously only
            implied — which is a better home for it: a research disclosure
            read as one block's footnote is read as that block's fine print,
            and this one is load-bearing for the whole page.

            Ledger `landing-limits-trio` covers the two cards on the right;
            the third is BOUNDARY_DISCLAIMER, which renders from its constant
            in the footer and is ledgered with it. */}
        <section className="landing-section">
          <div className="landing-section-head">
            <h2 className="landing-h2">Calm, and honest about its limits</h2>
            <p className="landing-section-lede">
              No miracle promises. Revora earns trust the slow way — by
              telling you exactly what it measures and where it stops.
            </p>
          </div>
          <div className="landing-limits">
            {/* The sources, ledger `landing-sources-note`. The proof band that used to carry them
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
            <h3>Sources</h3>
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
            {/* Ledger `landing-limits-trio`. Both of these are falsifiable
                against shipped behaviour rather than being assertions — which
                is the only reason they are allowed to sit under a heading
                about honesty. The clarify claim is the one DemoCheckCard
                renders from the promise registry two blocks up; the consent
                clause was checked against schema.ts (`consentedAt`, notNull)
                and /privacy, which lists storing health data without explicit
                consent among the things Revora does not do. */}
            <div className="landing-limits-trio">
              <div>
                <h3>When we&apos;re unsure, we say so</h3>
                <p>
                  If a food is ambiguous, Revora asks one clarifying question
                  instead of guessing — and errs on the careful side.
                </p>
              </div>
              <div>
                <h3>Your health data stays yours</h3>
                <p>
                  Your A1C and meal text are encrypted at rest, stored only
                  with your explicit consent, and deleted — all of it — in one
                  tap.
                </p>
              </div>
              <div>
                <h3>Not medical advice</h3>
                {/* The constant, not a retyped copy — the footer renders the
                    same string from the same import. */}
                <p>{BOUNDARY_DISCLAIMER}</p>
              </div>
            </div>
          </div>
          {/* ⚠️ MEASURED POSITION (§11.1) — the second half of the split
              described in the block above. */}
          <LandingPrimaryCta spaced />
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

            ⚠️ UPDATED 2026-08-06. An offer block is back — see below — but a
            PRICE is not, and the distinction is the whole point. The section
            beneath the FAQ names the three stages and promises the reader
            learns the exact cost before anything charges them; it names no
            amount, so every pin above still asserts an absence and none of
            them had to be inverted back.

            Of the two rows this comment used to call unrendered:
            `landing-what-you-get` is REACTIVATED (amended down to the one
            line stage 3 renders), and `landing-cancel-promise` deliberately
            is NOT — the v2 page restores a cancel promise but not that
            paragraph's words, and a row is keyed to its exact copy. */}

        {/* ── FAQ ─────────────────────────────────────────────── */}
        <section
          className="landing-section landing-section--sheet landing-faq-section"
          id="faq"
        >
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

        {/* ── The offer ─────────────────────────────────────────
            Ledger `landing-offer-stages` (+ `landing-what-you-get` for stage
            3's body). NEW 2026-08-06 — the copy review's "Option B", chosen
            over both leaving the page with no close at all and restoring the
            price the owner deleted.

            ⛔ NO AMOUNT, EVER. This block exists precisely because deleting
            every price left the reader learning a card was involved at the
            trial wall, which is the bait-and-switch the honesty positioning
            exists to rule out. It fixes that by disclosing the SHAPE of the
            ladder and promising the figure arrives before any charge — not by
            putting the figure back. Adding one here re-breaks §0.2 #4 and
            fails landing-paywall-copy.test.ts on the spot.

            Stage 2 branches off the same live flag the FAQ does, for the same
            reason: "what happens after day one" has a different true answer
            per mode, and copy-pins asserts on RENDERED output that trial
            never claims a daily allowance while legacy always does. */}
        <section className="landing-section">
          <div className="landing-section-head">
            <h2 className="landing-h2">Try it before you pay a cent</h2>
            <p className="landing-section-lede">
              Three stages, and you find out the exact cost before any of them
              charges you.
            </p>
          </div>
          <ol className="landing-offer">
            <li>
              <span className="landing-offer-when">Day one</span>
              <span className="landing-offer-what">
                {TASTER_LIMIT} free checks
              </span>
              <p>
                No login, no card. See how the answers feel at your own table.
              </p>
            </li>
            <li>
              <span className="landing-offer-when">
                {trialMode ? "Your free week" : "After day one"}
              </span>
              <span className="landing-offer-what">
                {trialMode
                  ? "Seven days free"
                  : `${FREE_DAILY_CHECKS} free checks a day`}
              </span>
              <p>
                {trialMode
                  ? "A card is required and nothing is charged. Before it ends, we email you the exact date and amount."
                  : "A free account, still no card. Keep checking at your own pace and see whether it earns a place in your week."}
              </p>
            </li>
            <li>
              <span className="landing-offer-when">After that</span>
              <span className="landing-offer-what">You decide</span>
              <p>
                Unlimited checks, your history on every device, and one
                optional reminder. Cancel in one tap from your account page —
                not an email.
              </p>
            </li>
          </ol>
          <p className="landing-offer-note">
            Nothing here renews without telling you first.
          </p>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────── */}
        <section className="landing-final landing-section--sheet">
          {/* The H2 and sub are BACK, deleted 2026-08-05 and restored
              2026-08-06 under the design ruling. The deletion's reasoning was
              that they restated the hero with "no object on screen to make
              the restatement mean anything" — which was true of the page as
              it then stood, where this block followed the FAQ directly. It is
              not true now: the block above it is the offer, so the closing
              line is answering "so what do I do", not repeating the opening.

              `finalHeadline` is the hero's own former H1. It reads as a
              close here in a way it could not as an opener, because by this
              point the reader has seen the card that stops the guessing. */}
          <h2 className="landing-h2">Start with tonight’s dinner.</h2>
          <p className="landing-section-lede">
            One meal, described in your own words, and an answer before you
            sit down.
          </p>
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
