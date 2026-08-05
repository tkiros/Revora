# Revora Landing Tournament — Phase 8

**Section 13 of 18.** Continues `docs/plans/landing-tournament-phase-7.md`.
Phases 0–7 (Sections 1–12) are complete and are not re-derived here.

**Status:** One winner synthesised, in the mandatory 12-part structure, with a verbatim
paste-ready copy deck. Every graft named with what it displaced. Every high-scoring idea
deliberately rejected named with why. The two items with no convergence behind them settled.
**Phase 9 (the red-team) has not begun.**

**Date:** 2026-08-05 · **Branch:** `fix/landing-followups` · **Files changed:** this one and
the handoff. No code touched. `npm test` still not run.

---

## 13.0 Before the winner — the six mandated items, answered in order

### 1. C3 wins under both weightings

Stated plainly, as instructed. C3 finishes first under the owner's rebalance (**71.83**) and
first under the weights as written (**70.72**). The rebalance widened its lead over C1 from
1.83 to 3.83 and it decided which of C5 and C6 died. **It did not choose the winner.** The
spine below is C3's because C3 won, not because of how the dimensions were weighted.

### 2. The 2,580px desert is resolved, and the 3/7 refusal is honoured rather than overruled

**Longest CTA desert: 2,580px → 1,450px.** No filled pill appears under the clarifying-question
block. See §13.1 finding 5 and part 9.

### 3. Scope moves into the H1, and the deictic pointer is relocated, not broken

The H1 becomes `A meal checker built only for prediabetes.` — the eyebrow's seven words at
headline size. `This is the whole screen.` survives **verbatim** and moves to the caption
directly beneath the card it points at, where it is more deictic than it was in the headline.
The eyebrow is deleted because its content is now stated once, larger. See part 5.

### 4. C7's comparison is rejected as a block

The tiebreak ruled in §11.5.3 stands and a third reason is added in §13.2. The
fabricated-output refusal is moot because the object is not grafted. What *is* taken from C7:
the `border-top`-not-`<hr>` rider, the 2px focus offset, and the falsifiable dare
`Type "oatmeal" and see what it asks you.` — which is the mechanism that fixes the desert.

### 5. The sources paragraphs land in block 4

In block 4, attached to the three verdict cards, not in the offer block. **One deviation from
§11.6's letter, argued in §13.3:** they sit after the block's CTA rather than before it.

### 6. Graft sparingly — and one graft was returned unused

Three organs were assigned. **Two are grafted, one is rejected.** Two paragraphs of C6 and
four separable ideas from the dead and the living are taken. Everything else is C3.

---

## 13.1 Five findings from the code that change the winner

The tournament ran on paper by design (trap 11). Before writing the synthesis I read the four
files the spine actually depends on. Five things are true in the repository that were not true
in any contender's specification, and four of them change a decision.

### Finding 1 — C3's radius and border delta was written against the wrong card

`app/globals.css`:

```
.surface-card  { border: 2px solid var(--border-soft);   border-radius: 24px;
                 box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08); }   /* L115–120 */
.result-card   { border: 2px solid var(--border-strong); border-radius: 22px; }  /* L626–632 */
```

C3's delta table proposes **"card radius 24px → 12px"** and **"card border 2px `--border-soft`
→ 1.5px"**, and says the reason is that *"24px on a card containing four stacked typographic
rows"* reads as a consumer-app tile. But the card containing four stacked typographic rows is
`.result-card`, and it is **22px with a `--border-strong` edge**. The 24px/`--border-soft`
recipe belongs to `.surface-card` and to the seven `.landing-*` card families C3 is deleting.

C3 measured the families it was cutting and applied the number to the card it was keeping.

**This matters because the two halves of C3's own thesis collide.** The spine is *every card
renders in the live classes, so if the product's card drifts the landing drifts with it, in
the same commit.* Changing the radius on the landing requires `.landing .result-card {
border-radius: 12px }` — a landing-scoped override of the shared component. At that point the
landing is no longer showing the product's card. It is showing a landing card wearing the
product's class names, which is a weaker claim wearing a stronger one's clothes.

**Ruling: the landing stops choosing radii.** Contested #2 settles at *the product's recipe,
unchanged.* See part 7 and §13.4.

### Finding 2 — the demo card is a nested card, and the fix is out of scope

`components/demo-check-card.tsx` renders `<section className="surface-card hero-card">`
containing two `<div className="result-card">`. That is a 24px card inside which two 22px
cards sit. `DESIGN.md` §App-UI guardrails bans nested cards; `impeccable` says *"nested cards
are always wrong"*; and `app/globals.css` L1858 carries a comment claiming the nesting was
removed with the phone bezel — *"DemoCheckCard is already a `.surface-card`, so this is a
positioning wrapper only — the old phone bezel wrapped a card in a card, and nested cards are
banned."* The bezel was one nesting. It was not the only one.

On the incumbent this object sits inside a 900px block halfway down the page. **On the winner
it is block 3, full width, and it is the most-looked-at thing on the page after the hero.**

`DemoCheckCard` is imported by three routes: `app/page.tsx`, `app/(app)/check/page.tsx` and
`app/(app)/demo/page.tsx`. Dropping the outer wrapper is therefore a **product** change, not a
landing change, and this tournament's scope is the landing. **Named, not fixed. Handed to
Phase 10C as a separate, independently revertible work item** with the note that it is the
kind of change that must be made in the component, once, rather than overridden on one route.

### Finding 3 — one of the two one-family proposals was audited against the wrong pin

`app/fonts.ts` documents why the second family exists, and it is not a taste argument:

> *Plus Jakarta Sans was carrying headlines AND body copy; it is a geometric sans, and
> geometric sans at 14–15px is the wrong tool for paragraphs read by 40–60-year-olds on a
> phone. Source Sans 3 has a larger x-height and open apertures, so it stays legible small and
> at low contrast … the pairing is deliberate contrast (geometric display + humanist text),
> not two fonts doing the same job.*

Three consequences:

1. **`reading` *is* Source Sans 3**, and `reading.className` on the landing root is a **Tier A
   pin** (FINDING-030). Both one-family contenders recorded *"Tier A: all nine pass"* without
   addressing it. The pin survives a one-family page only by aliasing `reading` to
   Plus Jakarta Sans, which keeps the letter of the pin and empties it: the pin exists to
   guarantee a literal, var-free source of the landing body family, and an alias makes the
   variable's name a lie. Neither contender said so.
2. **`impeccable`'s pairing rule supports this pairing, it does not convict it.** The rule
   bans *similar but not identical* pairs — two geometric sans, two humanist sans — and
   prescribes pairing *on a contrast axis*. Geometric display plus humanist text is the axis
   it names.
3. `reading` is imported **only** by `app/page.tsx`, so C2's performance claim is accurate:
   one `@font-face` and one preload, on one route.

**Ruling: Contested #1 settles at keep.** One `@font-face` on one marketing route, against a
documented legibility decision for a 54-year-old reading 17px on a 375px phone —
`iui-ux-pro-max` ranks accessibility first and performance third. C2's **separable** win is
taken in full: one body size, `17px / 1.65`. See §13.4.

### Finding 4 — the 16px floor holds by source order, not by specificity

C3's rail-10 fix is `.landing .result-disclaimer { font-size: 16px }`, one declaration, no
override block. But `app/globals.css` already contains:

```
.result-disclaimer { font-size: 14px; }                       /* L209–214 */
.result-fineprint .result-disclaimer { font-size: 13px; }     /* L778–780 */
```

`.landing .result-disclaimer` and `.result-fineprint .result-disclaimer` have **identical
specificity** (0,2,0). The landing's 16px wins only because it is later in the file. That is
correct and it is fragile, and it is the same class of thing as the 2026-07-29 override-block
incident. **Phase 10A must specify the ordering dependency as a comment on the rule; Phase 10C
must not move the block.** The Tier A pin ("no `.landing*` selector declares `font-size`
twice") is satisfied — this is one declaration on a new selector — but the pin does not catch
this hazard, so a human note has to.

### Finding 5 — the block-3 caption would duplicate a label the component computes

`demoExampleEyebrow()` (AUD-008) renders `An illustrated example` **inside** the demo card,
and swaps it to `A real check, captured <date>` the moment a live capture is authorised on the
registry entry. C3's block-3 caption opens `An illustrated example.` in hand-typed prose.

That is the label twice, and the hand-typed one **cannot track AUD-008**. If the evidence
state ever changes, the component tells the truth and the caption keeps saying "illustrated."
**The caption drops the label.** Block 4's `Illustrated examples.` note stays, because those
three cards are ledger fixtures and nothing computes a label for them.

---

## 13.2 The grafts, and what each one displaced

| From | The organ | Verdict | What it displaced |
|---|---|---|---|
| **C4** | Scope carried by the H1 at headline size | **GRAFTED** | C3's H1 `This is the whole screen.` (relocated verbatim to the card caption) **and the eyebrow**, which would otherwise state the claim twice |
| **C5** | The reachability rule, without the bar | **GRAFTED**, restated | C3's silence in block 3: the block gains a text exit it did not have. Nothing was removed |
| **C7** | The two-column behaviour comparison | **REJECTED** — see below | — |
| **C7** | `border-top` on the block, not an `<hr>`; 2px focus offset | **GRAFTED** (unconditional rider) | the `<hr>` |
| **C7** | `Type "oatmeal" and see what it asks you.` (also C1's) | **GRAFTED** | nothing — it is the desert fix |
| **C6** | `Blank days are just blank.` | **GRAFTED** | half of C3's fourth offer claim |
| **C6** | The cancel paragraph, at equal weight to the price | **GRAFTED** | nothing; block 5 gains ~90px |
| **C4** | `--text-soft` banned by block | **GRAFTED** | review-time judgment |
| **C2** | One body size, `17px / 1.65` | **GRAFTED** | C3's inherited 16.5–17px range |
| **C5** | 44/48px target test · `prefers-reduced-motion` test | **ADOPTED** (already standing) | two prose-only rails |

### Why C7's comparison is rejected — three reasons, in order of force

1. **The ruled tiebreak (§11.5.3).** C5's organ has precedence. Both land on block 3 and pull
   opposite ways: the comparison adds ~450px to a block that is already the page's worst
   stretch. With the comparison in, the desert goes from 2,580px to roughly 3,000px, and the
   graft that repairs a convicted defect would be paying for the graft that introduces an
   uncleared claim.
2. **It is spine-incompatible, which the tiebreak did not need to say.** C3's organising rule
   is *every claim is attached to a rendered object*, and claims with no object get one line
   and no more. The comparison's left column, by its own non-severable refusal, has **no
   object** — no fake card, no fake number, correctly. It is a description of a behaviour
   nobody can see. On this spine that is a one-line claim by construction, and the one line
   already exists: `Most apps take the same four letters and return a confident number.`
   Building it into a block with a heading is the one thing this page is organised not to do.
3. **Phase 9 has not ruled on the claim family.** §11.7.2 records seven instances on an
   escalation ladder and two open questions. The winner takes the **most conservative rung on
   the ladder**: the hedged quantifier `Most`, at sentence scale, which is the approved ledger
   row `Most apps would just pick one and sound confident.` at its own quantifier and its own
   scale. **This is not a ruling and must not be read as one.** It is the option that stays
   inside what is already approved while Phase 9 decides whether more is available.

**If Phase 9 clears the family**, the comparison becomes a candidate for a later, separate work
item — not a retrofit into this page, because reason 2 does not depend on the claim question.

---

## 13.3 The sources paragraphs — one deviation from §11.6, argued

§11.6 ships C4's two paragraphs plus the `Read the sources and the limits` link, as plain
prose, in **block 4, under the `Illustrated examples.` note** — explicitly not in the offer
block, because *"provenance inside a pricing section reads as a sales credential."*

The winner honours block 4 and the attachment to the cards. It places the paragraphs **after
block 4's CTA** rather than between the note and the CTA. Two reasons:

1. **Reachability.** With the paragraphs before the CTA, block 4's exit lands at y ≈ 5,000 and
   the worst stretch on the page is 1,530px. After the CTA, the exit lands at y ≈ 4,820 and the
   worst stretch is **1,450px** — inside the threshold set in part 9. This is the whole margin.
2. **It is more faithful to the ruling's reasoning, not less.** §11.6's argument for keeping
   provenance out of the offer block is that provenance next to a sales moment reads as a
   credential. A hedging paragraph placed immediately *before* a CTA is the same adjacency at
   smaller scale. Placed after it, it is what it actually is: a footnote to the three cards
   above, explaining what the reasoning behind them is grounded in, and stating in the same
   breath what it does not prove.

The paragraphs are C4's, verbatim, unchanged.

---

## 13.4 The two items with no convergence, settled

### Contested #1 — the second typeface. **KEEP.** (5 keep / 2 kill, and the 2 were mis-audited)

Settled on Finding 3, not on the vote. The pairing is a documented legibility decision for this
exact ICP, recorded in `app/fonts.ts`; it is the contrast-axis pairing `impeccable` prescribes
rather than the similar-pair it bans; and the two proposals to kill it both recorded a clean
Tier A audit without addressing `reading.className`, which is the pin the change lands on.

**What is taken instead:** the part of C2's proposal that was never about the family. Body type
resolves to **one value, `17px / 1.65`**, replacing the inherited 16.5–17px range. That is the
5/7 convergence (§12.2 item 15) and nobody argued for two body sizes. The performance cost that
remains is one `@font-face` and one preload, on one route, and it buys open apertures at 17px
for a reader whose glasses are on the kitchen table.

### Contested #2 — the card radius. **INHERITED, not chosen.** (C3 proposed 12px with no mandate)

Settled on Finding 1. The landing renders the product's cards; the product's cards are
`.surface-card` at 24px and `.result-card` at 22px; the landing changes neither, and does not
introduce a third. The shape rule for the page, stated once so it can be checked:

> **Outer surfaces 24px. Result cards 22px. The CTA pill 999px. The landing chooses none of
> them.**

That is a documented rule followed everywhere, which is what `taste-skill`'s Shape Consistency
Lock asks for. The one landing-owned family that remains — the price tile — takes the
`.surface-card` recipe rather than a fourth number.

**C3's craft instinct is not discarded; it is redirected.** If 24px is the wrong radius for a
four-row typographic document, it is wrong in `/check` too, where the card is looked at every
day rather than once. **Recommendation to Phase 10B/10C: raise it as a product-level radius
change in its own work item, and let the landing inherit whatever the product decides.** A
landing that overrides the shared card to look better than the product is the beginning of the
drift the spine exists to prevent.

---
---

# W — ONE CARD BACK

### C3's spine (P3, The Design Engineer), with two organs, one rider, four separable ideas and five code corrections

The name is inherited deliberately. Roughly ninety percent of this page is C3 unchanged, and
renaming it would suggest a synthesis that did not happen.

---

### 1. Name and one-sentence thesis

**One Card Back.** The page's unit of composition is the product's own artifact — the result
card, rendered in the live classes at three moments of doubt — with whitespace doing the
sectioning, the headline saying who it is for, and one earned piece of motion carrying the only
idea on the page that is temporal.

The one sentence that changed from C3: *the headline says who it is for.* Everything the
tournament did to C3 is contained in that clause and in one text link.

### 2. The bet

That describing this product nine ways is strictly worse than showing it three times; that the
difference between a page that feels expensive and a page that feels generated lives in about
twenty details nobody consciously notices; and — the part C3 did not bet and the tournament
added — that a page built on showing the real artifact must not modify the artifact to look
better, because the moment it does, it is showing a picture again.

**What it wagers:** the feature grid, the glance strip, the before/after grid, the how-it-works
block, the trust section as a section, the three-plane rhythm, the hairline, six of eight card
families, and the eyebrow.

**What it sacrifices:** verbal completeness, and the two-column comparison that posted the
highest Belief mean in the tournament. Every claim it makes is attached to a rendered object,
so claims with no object get one line each in the offer block and no more.

### 3. Section map

**One plane** (`--page-bg`). White is not a background; it is the material a card is made of,
so the only white on the page is a card, and white therefore means *this is the product.*
Sectioning is `clamp(72px, 10vw, 128px)` of air and a `border-top` hairline on the block, never
an `<hr>`.

| # | Block | Purpose | 375px height | Exit at y ≈ | Share |
|---|---|---|---|---|---|
| 1 | Nav + hero | Who it is for, and the artifact at its calmest | ~1,020px | **720** (filled) | 14% |
| 2 | The gap | Why you are here | ~1,120px | **2,080** (filled) | 16% |
| 3 | **The pause** | `<DemoCheckCard />`, the one motion, and the dare | ~1,400px | **3,470** (link) | 19% |
| 4 | Three answers | The card at three verdicts, then where the reasoning comes from | ~1,520px | **4,820** (filled) | 21% |
| 5 | The offer | Price, funnel, cancel, four remaining claims | ~1,270px | **6,270** (filled) | 18% |
| 6 | Close + Fair questions | Final exit, then the FAQ | ~740px | **6,520** (filled) | 10% |
| — | Footer | Nav + disclaimer | ~130px | — | 2% |

**Totals: 6 blocks + footer. ~7,200px ≈ 10.8 screens at 667px.**
**Six exits. Longest CTA desert: 1,450px** (block 4's CTA → block 5's CTA).

Against C3: +400px, because the sources paragraphs (+180), C6's cancel paragraph (+90), the
dare link (+20) and the larger section padding all cost height and none of them is optional.
Against the incumbent: **−5,742px, −8.6 screens, and a desert 3,640px shorter.**

Heights are C3's own 375px estimates carried forward with the deltas added. **Phase 10A
re-measures in the browser**; part 9 states what to do if a stretch comes back over budget.

---

### 4. Full copy deck

Verbatim and paste-ready. `{TASTER_LIMIT}` and `{monthlyPrice}` are interpolated, never typed.
Strings marked *(ledger)* are existing approved rows and must not be edited.

**Nav**
- Wordmark: `Revora`
- Links: `How it works` · `Pricing` · `Pantry Review`
- Nav CTA (ghost, persistent ≥ 880px): `Check a meal`

---

**Block 1 — Hero**

- Eyebrow: **none.** Its seven words are the H1.
- H1: `A meal checker built only for prediabetes.`
- Sub: `Describe the plate in front of you and Revora gives you one card: where it lands, why, and one change worth making when there is one. For an A1C between 5.7% and 6.4%. About ten seconds, and nothing to log.`
- CTA: `Check your first meal — free` *(ledger)*
- CTA caption: `{TASTER_LIMIT} free checks on your first day, then you decide.`
- Visual half — **a real result card at Clear, rendered in the live classes, not a mockup:**
  - Label: `An illustrated example`
  - Meal row: `Grilled chicken, brown rice, and a side salad`
  - Verdict row: `Clear` (icon + label, the only tinted row)
  - Why row: `This looks like a reasonable fit. The meal already has protein and vegetables, so it looks more balanced than a fast-carb-heavy option.`
  - Fineprint: `{BOUNDARY_DISCLAIMER}` *(rendered by `<DisclaimerLine />`, never retyped)*
- Caption under the card, outside it: `This is the whole screen. No score, no dashboard, no change to make: this meal already looks balanced, so that is the whole answer.`
- Trust strip *(ledger row, verbatim, three items)*: `No login for your first checks.` ·
  `When we're unsure, we say so.` · `If you ever subscribe, cancel is one tap — not an email.`

---

**Block 2 — The gap**

- H2: `Six months is a long time to guess.`
- Lede: `You were handed a number, two words of advice, and an appointment half a year away. Everything in between is supposed to be your job to figure out.`
- Four items, a plain `<ul>` with bold lead-ins — no card, no border, 28px row gap:
  - `The advice was two words long.` `"Eat better." Better than what? Is oatmeal fine? Is the sandwich at lunch a problem? Nobody said, and the appointment is in six months.`
  - `Every article contradicts the last one.` `Fruit is fine, fruit is sugar. Rice is out, brown rice is in. You have read all of it and you still do not know about the plate in front of you tonight.`
  - `The apps want you to become an accountant.` `Weigh it, log it, scan the barcode, hit your macros. You did not ask for a second job. You asked what to do about dinner.`
  - `So you guess, and then you worry.` `You eat the thing, and spend the next hour wondering whether it was a mistake. That loop is the actual cost of being told nothing.`
- Scope note: `Revora exists for that gap and nothing else. Not a general nutrition app, not a calorie counter, not built for everyone. If your A1C sits outside 5.7% to 6.4%, it says so plainly and points you to a clinician instead of pretending.`
- CTA: `Check your first meal — free`
- CTA caption: `No login, no card, nothing to install.`

---

**Block 3 — The pause**

- H2: `It asks before it guesses` *(Tier B pin, kept)*
- Lede: `Four letters is not enough to answer honestly, so Revora does not answer yet. Plain oatmeal and sweetened oatmeal are different meals. Watch what happens.`
- `<DemoCheckCard />`, full width, with the motion in part 8. **The component renders its own
  `An illustrated example` label (AUD-008); nothing here repeats it.**
- Caption: `Most apps take the same four letters and return a confident number.`
- Exit, as a text link on its own line, not a pill: `Type "oatmeal" and see what it asks you.` → `/check`
- **No filled CTA. No button under the pause.**

---

**Block 4 — Three answers**

- H2: `The same card, three times.`
- Lede: `One layout, whatever the answer is. The Clear card carries no change to make, because when a meal already looks balanced Revora says so and stops. It does not invent a correction to look useful.`
- Card 1 — meal `Grilled chicken, brown rice, and a side salad` · verdict `Clear` · reason `This looks like a reasonable fit. The meal already has protein and vegetables, so it looks more balanced than a fast-carb-heavy option.` — **no adjustment, no swap.**
- Card 2 — meal `A bagel with jam and a glass of orange juice` · verdict `Be careful` · reason `This may have a higher blood-sugar impact than a more balanced meal because it leans heavily on refined carbs.` · `Adjustment:` `If practical, add protein or nonstarchy vegetables to make it easier to handle.`
- Card 3 — meal `A large soda with fries on the side` · verdict `Hold off` · reason `This is likely a higher-impact choice in its current form because it is mostly sugary or refined carbs.` · `Swap:` `A smaller portion with protein or nonstarchy vegetables would be a steadier fit here.`
- Note: `Illustrated examples. Every card ends with the same line: Revora is informational only and is not medical advice.`
- CTA: `Check your first meal — free`
- **Then, as the block's closing footnote** *(C4's copy, verbatim)*:
  - `Revora's general meal-planning principles map to public-health guidance and cited nutrition research — that carbs raise blood sugar, that pairing them with protein, fibre or nonstarchy vegetables can slow the rise, and that less-refined carbs generally land more gently than highly refined ones.`
  - `Those sources support narrow educational statements about food. They are not evidence that Revora produces a particular health result, and nothing on this page claims otherwise.`
  - Link: `Read the sources and the limits` → `/how-it-works`

---

**Block 5 — The offer**

- H2: `Ten free checks, then a week, then a decision.`
- Trial tiles:
  - `Day 1` · `{TASTER_LIMIT} free checks` · `Check up to {TASTER_LIMIT} meals on your first day, no login and no card. They live on this device.`
  - `Days 2–8` · `7 days free` · `Card required, nothing charged. Day 5, we email you the exact date and the exact amount, with a one-tap cancel link in it.`
  - `After your free week` · `{monthlyPrice}/month` · `Or $99.99 a year, which is $8.33 a month. Cancel in one tap, effective at the end of the period.`
- Legacy tiles: `Day 1` · `{TASTER_LIMIT} free checks` (same body) · `Every day` · `A free account` · `No card. A free account still includes 5 free checks a day, still no card, with your history saved to your account.` · `Premium` · `{monthlyPrice}/month` · (same body as trial tile 3)
- **Cancel paragraph, at the same weight as the price** *(C6, verbatim)*: `Stopping is one tap on your account page, effective at the end of the period. No retention screen, no "are you sure", no email you have to write. We know why you are reading this paragraph carefully.`
- Four remaining claims, one line each, in deliberate order — most-asked first, no numerals:
  - `Unlimited checks, and A record you can actually show someone: every check saved, on every device.`
  - `A weekly recap in sentences. Never a grade, never a lab prediction.`
  - `One optional reminder a day, off by default. Skip a day and nothing turns red. Blank days are just blank.`
  - `Your A1C and meal text encrypted at rest, deleted in one tap, account included.`
- Pantry: `Or check the whole kitchen, once. The Pantry Review sorts what you already own into one printable report. $49, one payment, nothing renews.` Link: `See a sample report`
- CTA: `Check your first meal — free`

---

**Block 6 — Close, then Fair questions**

- H2: `Try it on the meal in front of you.`
- Sub: `Describe it. Revora tells you where it lands and why, in about ten seconds.`
- CTA: `Check your first meal — free`
- CTA caption: `No login. No card. {TASTER_LIMIT} free checks on your first day.`
- **Fair questions** — four `<details>` rows *below the last CTA*, headed `Fair questions`:
  - `Is Revora medical advice?` → `No. Revora is informational only and is not medical advice. Its labels describe general meal patterns. Broad A1C-range context only makes the presentation more cautious; it does not predict your response or decide whether a meal is medically appropriate. Talk with a doctor or registered dietitian for guidance specific to you.`
  - `Who is Revora for?` → `People in the prediabetes A1C range of 5.7% to 6.4%. If your number falls outside that range, Revora says so plainly and points you to a clinician instead of pretending.`
  - `Do I need an account or a card to try it?` → *(trial)* `No. Your first ${TASTER_LIMIT} checks, on your first day, need no login and no card — they live on this device only. The 7-day free trial needs a card but charges nothing for a week, and we email you before any charge.` / *(legacy)* `No. Your first ${TASTER_LIMIT} checks, on your first day, need no login and no card — they live on this device only. After that, a free account includes 5 free checks a day — still no card. Premium is optional, and cancels in one tap.`
  - `How do I cancel?` → `One tap, on your account page, effective at the end of the paid period. No retention screens, no email hoops. Deleting your account removes your data with it.`

**Footer** — as incumbent: four columns (Product / Learn / Legal / Apps),
`Add to home screen — works today`, and `{BOUNDARY_DISCLAIMER}` rendered in full.

---

### 5. Hero specification

**The eyebrow is deleted, and this is not C7's deletion.** C7 removed the eyebrow *on
principle* and left a headline about a competitor's product as the page's only category answer,
and six judges scored it a 3, unanimously. Here the eyebrow's seven words are **promoted, not
removed** — the same string, at headline size, where a 10-weight dimension is not resting on
the page's smallest element. Deleting it afterwards is not a principle; it is the removal of a
duplicate. The distinction is the whole difference between the organ and the corpse.

- **H1:** `A meal checker built only for prediabetes.`
  - Seven words. Category noun (`meal checker`) and scope (`only for prediabetes`) at headline
    size. `only` does the market-shrinking that scored C4 an 8.67 on Category clarity; it does
    it **without the second sentence that killed C4**, because "this is built for one group" is
    an invitation to that group and "if yours isn't in it, this isn't for you" is a door
    closing on everyone else.
  - It is **already-shipped copy**, which means zero new claim exposure. §12.6 records it as
    one of the things the incumbent had right: *"answers what is this in seven words before the
    headline, which almost nothing in this category does."* It is now answered before anything
    else at all.
  - Set at `clamp(1.9rem, 5.6vw, 2.9rem)`, two lines at 375px, `text-wrap: balance`.
    **Not** the incumbent's `clamp(2.4rem, 6vw, 3.8rem)` — a seven-word headline at 3.8rem is
    the font-size error `taste-skill` §4.7 names, and the hero has a card to fit beside it.
- **Sub:** 40 words, down from C3's 38-word version plus a 7-word eyebrow. Carries the
  mechanism (`describe → one card`), the range, the restraint (`one change worth making when
  there is one`), the latency hedged, and `nothing to log` — objection 1, at the fold.
- **`This is the whole screen.` moves to the card caption, verbatim.** §11.5.2's constraint was
  that a scope-carrying headline must not break C3's deictic pointer. It does not break it; it
  **shortens** it. In C3 the pointer sat in the headline and referred across a two-column gap to
  an object below it on mobile. Here it sits directly beneath the object, one line away, and the
  sentence after it names the absence the object demonstrates. A pointer that touches the thing
  it points at is a better pointer than one that gestures at it from the other column.
- **What deleting the eyebrow buys, in pixels:** ~40px, which pulls the caption's first line
  from below the 667px fold to the fold. At 375px the reader now sees, without scrolling: the
  headline saying who it is for, three of four sub lines, the card, the `Clear` verdict row,
  and the first line of `This is the whole screen.`
- **Visual half — a real `.result-card`**, same classes, same anatomy rows, not a facsimile.
  If the product's card changes, this changes.
  - **Radius, border and shadow: unchanged from the product.** 24px outer surface, 22px result
    card, `2px --border-strong` on the card, the one shadow `0 18px 40px rgba(15,23,42,0.08)`.
    See Finding 1 and §13.4. C3 proposed 12px/1.5px; both are rejected, and the reason is C3's
    own thesis.
  - Verdict row is the only tinted row (`--safe-bg` fill, `--safe-text` text, both AA).
  - **The card is not in a bezel.** `.landing-phone` — a positioning wrapper whose name has
    been lying since 2026-07-27 — is renamed `.landing-hero-proof`.
- **CTA press state:** `transform: translateY(1px) scale(0.98)`, 120ms,
  `cubic-bezier(0.23, 1, 0.32, 1)`, on `:active`, feedback on pointer-**down**.
  `transition-property: transform, background-color`, never `all`.
  **0.98, not C3's 0.985** — §12.5 item 11 flags 0.985 as subtler than `emil-design-eng`'s
  0.95–0.98 floor. Taken at the floor, where it is still the quietest press on the board.
- **Focus:** existing ring `rgba(13, 95, 87, 0.45)`, **2px offset** on cards *(C7's rider)*.

### 6. The proof strategy

Five mechanisms. None is social, and each is checkable by the reader or by a test.

1. **Every card on this page renders in the live `.result-card` / `.result-anatomy` classes** —
   not a screenshot, not a mockup, not a div arrangement that resembles the product — **and the
   landing does not override them.** C3's version of this claim was weakened by its own radius
   and border deltas; this one is not. If the product's card drifts, the landing drifts with it,
   in the same commit, which is the only way this claim is worth making.
2. **The demo's three interaction strings come from the promise registry**, pinned by
   `promise-registry.test.ts` to the real precheck output. The page cannot show a conversation
   the engine would not have. The card's evidence label is computed by AUD-008, so the page
   cannot describe its own evidence state incorrectly either.
3. **The Clear card carries nothing**, three times — hero card, hero caption, block-4 lede —
   and each time the absence is named rather than asserted.
4. **The reasoning has a stated provenance and a stated limit, in the same breath**, attached to
   the cards it explains rather than to the price *(C4's paragraphs, §13.3)*.
5. **The funnel renders from the flags checkout enforces**, and billing is stated as dates and
   amounts: day 5, exact date, exact amount, one-tap cancel link in the email.

**Explicitly not used:** ratings, user counts, testimonials, trust badges, "clinically"
anything, the DPP statistic, and any accuracy claim about a third party beyond the approved
hedged sentence.

**The falsifiable dare** — `Type "oatmeal" and see what it asks you.` — is the sixth, and it is
listed separately because it is not a claim. It is an invitation to break one, free, in ten
seconds, without an account. It also answers C7's sharpest objection to this spine: that the
520ms pause performs the page's own thesis and is therefore a re-enactment rather than
evidence. The block now carries both. The re-enactment explains what to look for; the link is
where you go to check it.

### 7. Visual system deltas

| Delta | From | To | Why |
|---|---|---|---|
| **Planes** | 3 + hairline | **1** (`--page-bg`); white is card-only | White stops being a background and becomes the material that means "product". |
| **Card radius** | 24px on 8 landing families | **inherited**: 24px outer surface, 22px result card, unchanged | Finding 1 / §13.4. The landing renders the product's cards; a landing-scoped override would make the spine's central claim false. |
| **Card border** | 2px `--border-soft` × 8 | **inherited**, unchanged | Same reason. C3's 1.5px was measured against the families being deleted. |
| Card families | 8 | **2** (result card · price tile, the tile on the `.surface-card` recipe) | Contested #5, 7/7. |
| Shadow | one card shadow | **unchanged** | The only `DESIGN.md` rule with an unqualified 7/7 endorsement. Nobody changed it; neither does this. |
| Type pairing | Jakarta + Source Sans 3 | **unchanged** | Contested #1, settled on Finding 3, not on the vote. |
| **Body type** | 16.5–17px range | **17px / 1.65, one value** | 5/7 (§12.2 item 15). C2's separable win. Nobody argued for two body sizes. |
| Measure | unspecified | `62ch` on prose; `text-wrap: pretty` on prose, `balance` on h1–h3 | 3/7 specify, 0/7 against, free. |
| Eyebrows | 4 | **0** | The seven words are the H1. Not a principle — a de-duplication. |
| Sectioning | plane change + 1px `<hr>` | `clamp(72px, 10vw, 128px)` air + `border-top` **on the block** | Space as the instrument (4/7). `border-top` not `<hr>` so the hairline snaps to the device grid at fractional DPR *(C7's rider, P3 scored it 9)*. |
| Nav CTA | ghost | ghost, persistent ≥ 880px | Contested #4, per screenful. Nobody proposed a filled nav pill. |
| CTA transition | `--dur` 200ms hover/active | 120ms `:active`, custom curve, pointer-down, `scale(0.98)` | Press feedback under 160ms is where a button feels connected to the finger. |
| Focus ring | `rgba(13, 95, 87, 0.45)` | unchanged, **2px offset on cards** | An inset ring clips on a rounded card edge *(C7's rider)*. |
| Card fineprint | 14px (13px inside `.result-fineprint`) | **16px on the landing**, one declaration | Rail 10. Ordering dependency, Finding 4 — the rule must sit after `app/globals.css` L780 and say so in a comment. |
| `--text-soft` | used by review | **banned by block** in 1, 2, 3, 5; permitted in 4 only on the `Illustrated examples.` note | *(C4's quiet idea, §12.5 item 8.)* The only rail on this page enforced structurally rather than by judgment. |
| `.landing-phone` | a class that contains no phone | **`.landing-hero-proof`** | It has been lying since 2026-07-27. |
| `.landing-proof-band` | 4-column stat strip, ~700px | **deleted**; content survives as ~180px of prose in block 4 | §11.6. |

### 8. Motion specification

**One animation on the page**, and it is the only idea here that is temporal. Unchanged from
C3 except the press scale.

**The pause (block 3).** When the demo card enters the viewport, the sequence renders in three
beats:

| Beat | Element | Property | Timing |
|---|---|---|---|
| 0ms | `You type: oatmeal` | already visible | — |
| 0ms | clarify block | `opacity 0 → 1`, `translateY(6px) → 0` | 220ms, `cubic-bezier(0.23, 1, 0.32, 1)` |
| **+520ms** | `You answer:` + result card | `opacity 0 → 1`, `translateY(6px) → 0` | 240ms, same curve |

The 520ms gap is the point: the product's willingness to wait, made visible. It is not a
loading simulation and not a typewriter effect; nothing pretends to be computing.

**Non-negotiable implementation constraints:**

- **The animation enhances an already-visible default.** The result card ships in the DOM,
  rendered, `opacity: 1`; the animation is applied by an `IntersectionObserver` adding a class.
  A headless render, a hidden tab or a JS failure ships the complete card. No content is ever
  gated on a transition firing.
- **`transform` and `opacity` only.** No `height`, no `width`, no `top`.
- Runs **once** (`{ once: true }`, `amount: 0.4` — the card is ~600px tall at 375px, taller than
  half the viewport, so 0.5 would fire with the top already scrolled past).
- **`prefers-reduced-motion: reduce` → the class is never added.** Not a shortened animation,
  not a crossfade: the card is simply present from the start, which is its default state anyway.
  The global CSS block covers it and the observer is additionally gated in JS, so no work
  happens at all.
- Everything else is static. **Two CSS transitions exist site-wide: CTA press and link colour.**
  No scroll reveals anywhere — 0/7 contenders proposed one, and against
  `emil-design-eng`'s frequency question (a landing page is seen once) that is the right answer.

### 9. The 375px story

- **Above the fold (667px):** ghost nav CTA · H1 on two lines at `clamp(1.9rem, 5.6vw, 2.9rem)`
  · 3 of 4 sub lines · the card from y ≈ 430 · **the `Clear` verdict row at y ≈ 560** · the
  first line of `This is the whole screen.` at y ≈ 650. The reader sees who the product is for
  and what its answer looks like before scrolling.
- **First CTA at y ≈ 720**, one flick down.
- **Card at 375px:** 335px wide, 20px internal padding, 22px radius, five rows / ~210px —
  against the incumbent's 15-line demo card ending in a legal line.
- **Thumb reach:** all filled CTAs full-width, 52px tall, 32px clearance. The block-3 exit is a
  text link with a 44px target box.
- **Scroll to primary action:** 720px, ~1.08 screens.

#### The reachability rule, restated — and why C5's rule could not be taken literally

C5's organ, as extracted in §11.5.1, reads: *no stretch longer than one viewport (667px) may
lack a reachable primary action.* Taken literally on a 7,200px page that is **eleven exits**,
and there is exactly one way to get eleven exits onto a page without eleven CTAs: a fixed
element. **C5's rule entails C5's bar.** That is why C5 built the bar, and the bar is what six
judges convicted on Craft.

So the rule is restated at the level it can hold without the object that killed its author, and
the threshold is taken from the tournament's own data rather than invented:

> **No stretch of the page may exceed 1,460px at 375px — the shortest longest-desert any
> contender achieved without a fixed element (C1, the IA winner). Deserts are measured in
> pixels, at 375px, and reported in the spec.**

The measurement discipline is the half of C5's organ that costs nothing and that nobody else
did. It carries in full.

**The desert map:**

| Stretch | From → to | Distance | Under budget |
|---|---|---|---|
| Hero → gap | 720 → 2,080 | 1,360px | ✅ |
| Gap → pause | 2,080 → 3,470 | 1,390px | ✅ |
| Pause → three answers | 3,470 → 4,820 | 1,350px | ✅ |
| Three answers → offer | 4,820 → 6,270 | **1,450px** | ✅ (10px of margin) |
| Offer → close | 6,270 → 6,520 | 250px | ✅ |

**2,580px → 1,450px, and the 3/7 refusal is honoured.** No filled pill appears under the
clarifying-question block. C2, C3 and C6 refused one because the block's argument is *wait a
second before you answer* and a button under it contradicts the argument. That reasoning is
correct and it convicts a **pill**, not an **exit**. What sits there instead is a text link
carrying a dare: `Type "oatmeal" and see what it asks you.` It does not say *press this instead
of thinking.* It says *go and falsify what I just told you*, which is the block's argument
continued rather than interrupted — and it is free, checkable in ten seconds, and needs no
account.

**If Phase 10A's browser measurement pushes the 1,450px stretch over budget**, the remedy is to
move block 4's sources paragraphs below the CTA — which recovers 180px — **not** to delete
them and not to add a second filled CTA to block 4. Recorded here so the fix is not
re-litigated at implementation time.

- **Collapse:** hero single-column below 880px, card below copy. Verdicts 1-up below 720px,
  3-up at 880px. Price tiles 1-up below 720px, 3-up at 880px.
- **Landscape:** the hero's two-column rule is width-driven, so a 667×375 landscape phone gets
  the two-column hero at a height where the card would be cropped. Below 480px of **height**,
  the hero stays single-column. *(C5's item; no other contender specified landscape.)*

### 10. Hard-rail self-audit

| # | Rail | Status |
|---|---|---|
| 1 | Never the agent of a health outcome | **PASS.** The strongest promise on the page is `tells you where it lands and why`. |
| 2 | No fabricated proof | **PASS**, structurally. Every card is either the registry-pinned demo or an `Illustrated example`-labelled ledger row. **No invented competitor output anywhere** — the comparison block that would have carried the risk is not on the page (§13.2). |
| 3 | Raw class words never render | **PASS.** `RISK_LABELS` interpolated; `SAFE`/`MODERATE`/`HIGH` never rendered. |
| 4 | Clear carries no adjustment or swap | **PASS**, three times, and each time the absence is named. |
| 5 | Disclaimer visible, never behind a disclosure | **PASS**, and stronger than C3's: the hero card carries the full fineprint via `<DisclaimerLine />`, block 4's note repeats the boundary in plain sight, the footer renders `{BOUNDARY_DISCLAIMER}` in full, and **no boundary copy sits inside a `<details>`** — the FAQ's medical-advice answer is a restatement, not the only instance. |
| 6 | Statistics trace to evidence-pack; trial citation confined to `/how-it-works` | **PASS.** No statistic renders. The sources paragraphs describe the class of evidence and link out; they quote no number. |
| 7 | Proof band left column is a LABEL | **PASS structurally, not by deletion.** §11.4.6 rules that a rail passed by deletion is a rail with no subject. The rail's purpose — that no number may appear where it would read as Revora's own result — is discharged here by there being **no stat-strip affordance on the page to put a number in**, while the content the rail was protecting survives as prose (§11.6). This is the distinction Phase 10B must write into the rewritten rail. |
| 8 | AA; health info never `--text-soft` | **PASS**, and structurally: `--text-soft` is **banned by block** in 1, 2, 3 and 5, and permitted in block 4 only on the `Illustrated examples.` note *(C4's idea)*. Reason rows are `--text-body`. |
| 9 | 44px touch targets | **PASS**, and **asserted** for the first time: C5's target test is adopted. The block-3 text link gets a 44px target box, which is the one target on the page a review would miss. |
| 10 | 16px floor, nothing smaller except tracked uppercase | **PASS, with one honest caveat.** The landing's own markup now contains **no sub-16px element at all** — the eyebrow was its only tracked-uppercase carve-out and it is gone. The shared `DemoCheckCard` still renders `.status-eyebrow` and `.result-eyebrow` at app sizes; those are product classes on a product component and are out of this scope. `.landing .result-disclaimer` is raised to 16px by one declaration whose **source-order dependency is Finding 4** and must be commented. |
| 11 | Colour never the sole channel | **PASS.** Verdict row is icon + label + tint, in that order; the tint is third. |
| 12 | `prefers-reduced-motion` | **PASS**, doubly — the global CSS block plus a JS gate on the observer — and **asserted** for the first time: C5's test is adopted. This page is the only one that adds motion, so it carries the burden of proving it. |
| 13 | Focus visible everywhere | **PASS**, with the 2px offset for the rounded card edge *(C7's rider)*. |
| 14 | Light surface, no dark bands | **PASS.** One light plane, `--page-bg`. |
| 15 | Marketing only; the app lives at `/check` | **PASS.** Every exit points at `/check`, including the block-3 link. |

**Tier A pins — all nine pass.**
`TASTER_LIMIT` interpolated · `{monthlyPrice}` from `resolvePriceVariant()`, no literal price in
source · both `paywallMode()` branches present · `RISK_LABELS` interpolated · `<DemoCheckCard />`
rendered and the three interaction strings never retyped · **`reading.className` on the landing
root, unchanged — and Contested #1 was settled partly to keep it honest (Finding 3)** · no
`.landing*` selector declares `font-size` twice · banned source phrases stay banned · trial mode
renders no daily free-check claim and legacy mode does.

**Tier B pin ledger.**
- **Kept:** `Check up to {TASTER_LIMIT} meals on your first day` ·
  `Your first ${TASTER_LIMIT} checks, on your first day` (FAQ) · `7 days free` · `Days 2–8` ·
  `A free account` · `still no card` · `A weekly recap in sentences` ·
  `A record you can actually show someone` · `It asks before it guesses` ·
  `Add to home screen — works today`.
- **Retired — three, each with a reason and a scheduled test edit:**
  1. `Two ways in.` / `Three ways in.` — the how-it-works block is deleted (7/7). Edit
     `landing-wiring-pins.test.ts` in the same work item.
  2. `Dictate it or type it.` — same block, same reason, same edit.
  3. `{TASTER_LIMIT} free checks on day one` — there is no pricing lede; the H2
     `Ten free checks, then a week, then a decision.` carries the number. Edit `copy-pins.test.ts`.
- **New ledger rows required** *(flagged, not assumed)*: the hero Clear card's four rows; the
  hero card caption; the block-3 caption and the dare link; the two sources paragraphs
  (nearest existing row is the incumbent's proof-band copy, which is unledgered).

**Em dashes rendered: 4 strings, 5 characters — and all four are unstrippable.**
`Check your first meal — free` (approved CTA) · `If you ever subscribe, cancel is one tap —
not an email.` (ledger trust strip) · `Add to home screen — works today` (Tier B pin) ·
the demo card's `add protein — Greek yogurt, nuts, or eggs on the side —` (ledger result copy,
inside the component). Incumbent: 42. C3: 7. Every one this page renders is copy that already
passed the claims audit; there is no house cadence left to strip.

### 11. What this steals from the incumbent, and why that part is good

- **Rendering real result-card markup rather than a screenshot.** The incumbent already does
  this and it is genuine craft. The winner's contribution is to notice it, make it the
  organising principle instead of a detail inside one component, **and then refuse to modify
  the card to suit the landing** — which is the part C3 got wrong and the part that makes the
  claim true.
- **The eyebrow's seven words.** Not deleted. Promoted.
- **The pains list.** The best prose in the repository, in the container it always needed: a
  plain list, one emphasis system instead of three.
- **The Clear card carrying nothing.**
- **The single card shadow**, untouched. The only `DESIGN.md` rule with an unqualified 7/7
  endorsement, and the rule most responsible for the page not looking assembled.
- **`promise-registry.test.ts` pinning the demo to the real precheck**, and **AUD-008's
  computed evidence label**, which is why the page's central claim is honest rather than
  aspirational and why no caption is allowed to describe the evidence state by hand.
- **Pricing rendered from the flags checkout enforces.** Structurally unable to lie.
- **`When we're unsure, we say so.`** Kept verbatim, as five contenders did.
- **No testimonials, no ratings, no user counts, no fake screenshots, on a landing page, in
  2026.**

### 12. Primary failure mode

**The same one C3 named, minus one of its two halves, plus a new one.**

C3 feared it would lose by optimising twenty invisible things while deleting three visible ones
— the feature grid, the trust section, the how-it-works block. Half of that is now moot: the
trust section's content is back on the page as 180px of prose in block 4, and the invisible
optimisations that had the worst cost-benefit (a 12px radius, a 1.5px border) were rejected on
the spine's own logic. What remains of the fear is real: **the feature grid and the
how-it-works block are gone, and roughly 3,000px of informational surface goes with them.** If
a meaningful share of visitors were converting off feature #7 of nine, this page will never
know, because nothing on it will report a loss that specific.

**The 520ms pause is still the only thing on the page a visitor can misread as slowness.** The
dare link answers the *rhetorical* objection C7 raised — re-enactment versus evidence — but it
does not answer the perceptual one. A reader who does not read the headline sees an app take
half a second longer than every app they have ever used, and half a second is exactly long
enough to notice and not long enough to mean anything.

**And the new one, which is this synthesis's own:** the winner's strongest claim is now *the
landing shows the product's card, unmodified.* That claim is only true while nobody adds a
landing-scoped override. There is no test that catches the first one. `promise-registry.test.ts`
pins the demo's *strings*; nothing pins its *recipe*. The first person who thinks the card
looks slightly better at 12px on the marketing page, and writes one declaration to make it so,
turns the page's central proof into decoration and will not be told. **Phase 10C should
consider a test that fails when a `.landing*` selector declares `border-radius` or `border` on
`.result-card` or `.surface-card`** — the same shape as the existing duplicate-`font-size`
guard, on the property this page's honesty now rests on.

---
---

## 13.5 High-scoring ideas deliberately rejected

Required by the phase brief. Each names the score it earned and the reason it is not here.

| # | Idea | Author | What it scored | Why it is rejected |
|---|---|---|---|---|
| 1 | **The two-column behaviour comparison** | C7 | Belief **8.00** (highest on the board), Craft **8.00** | Three reasons, §13.2: the ruled tiebreak, spine incompatibility (a claim with no rendered object), and an uncleared claim family. **Revisitable only if Phase 9 clears the family, and then as its own work item — reason 2 does not depend on the claim question.** |
| 2 | **The persistent thumb-zone bar** | C5 | Legibility **9.33** (highest single-dimension mean in the tournament) | Convicted 6/6 on Craft, 2–4 from every judge. The rule it produced is grafted; the object is not. |
| 3 | **`If yours isn't in it, this isn't for you.`** | C4 | part of Honesty **9.17** and the only 10 in 420 scores | Emotional fit **2.83**, 2–3 from all six judges. §11.4.4: Emotional fit below 5 is fatal independent of everything else. The first sentence is grafted; this one is the corpse. |
| 4 | **The scope card as the hero visual** | C4 | Category clarity **8.67** | It displaces the result card, which is the spine. Two-thirds of the hero surface saying *no* is an argument for a different page, and that page finished sixth. |
| 5 | **`Four things Revora will not do`** as a block | C4 | inside Honesty **9.17** | Four claims with no rendered object, which this spine gives one line each. It is also the block P6 read as *"a list of four things it will not do … another appointment."* The best of the four survives as block 4's lede: `It does not invent a correction to look useful.` |
| 6 | **The one-evening narrative structure** | C6 | Voice **8.50**, Emotional fit **8.83** (both highest) | §11.7.3: C6 holds four of the five sub-5 dimension means among the living and the board's lowest Honesty at 5.33. Treated as a source of copy, not of structure. **Two paragraphs grafted; the page is not.** |
| 7 | **Dropping the `Hold off` card** | C6 | part of the same Emotional fit **8.83** | Block 4's entire demonstration is *the same card, three times*. Showing two of three verdicts hides the most cautious label from the audience most entitled to see how cautious it gets, and C6 flagged it as a real cost itself. |
| 8 | **One type family, Jakarta only** | C2 | Legibility **8.83**; the only performance win any contender delivered | Finding 3 and §13.4. Documented ICP legibility rationale in `app/fonts.ts`; the contrast axis `impeccable` prescribes; and a Tier A pin neither proposal audited. **The separable half — one body size, 17px/1.65 — is taken.** |
| 9 | **The visible ranking, numerals rendered** | C5 | argued from `impeccable`'s own carve-out | §12.5's standing ruling: the ordering principle survives, the rendered numerals do not. Block 5's four claims are ordered most-asked-first and the order is defensible without `1. 2. 3.` in front of it. |
| 10 | **Radius 0, rules not cards** | C7 | inside Craft **8.00** | Finding 1 / §13.4. The landing does not choose radii; a page built on rendering the product's card cannot restyle it, in either direction. |
| 11 | **Deleting the eyebrow on principle** | C7 | — (Category **3.00**, the only unanimous score in 420) | The eyebrow *is* deleted here, for the opposite reason: its content moved up, not away. Recorded so this page is not read as vindicating the deletion. **The distinction — de-duplication versus principle — is the difference between the graft and the corpse.** |
| 12 | **`clamp(96px, 14vw, 176px)` section padding** | C2 | inside Legibility **8.83** | Correct for a five-block page made only of type. This page has cards in it, and 176px between a card and the next headline reads as an unfinished section rather than a deliberate one. Taken at C6's `clamp(72px, 10vw, 128px)`, where three of the four space-sectioners cluster. |
| 13 | **The 12px radius and 1.5px border** | C3 (the winner's own) | inside Craft **8.33** | Finding 1. Rejected on the spine's own logic, and redirected: **if 24px is wrong, it is wrong in `/check` too, and the change belongs in the product.** |

---

## 13.6 What Phase 9 inherits

**Two items already assigned, plus four this section adds.**

Already assigned:

- **The comparative-confidence family, two questions** (§11.7.2): the scale question and the
  `Most` → `Every` quantifier escalation. **This page has not ruled on it and must not be read
  as ruling on it.** It takes the most conservative rung available — the approved row's own
  hedged quantifier, at the approved row's own sentence scale, once, in a block-3 caption. If
  Phase 9 rules the family unavailable at any scale, the caption is the only string that
  changes and the page survives it.
- **The FAQ JSON-LD / visible-answer mismatch.** **This page does not have the defect.** The
  four `<details>` render their answers, below the last CTA, so the schema and the page agree.
  Phase 9 should confirm that rather than assume it, and note that the winner's FAQ placement
  is what discharged it.

Added here:

1. **P7's question, pre-answered where possible.** The most generic thing that survives is the
   three price tiles (§12.4: contested 4/7, not banned). They are the one structure on this page
   that would work unedited on a project-management site. They survive because live-flag pricing
   is the page's strongest structural honesty guarantee and tiles are the shape it currently
   renders in. **Phase 9 should decide whether that is a reason or an excuse.**
2. **P6's question, at one specific place.** Block 2 is 1,120px of what is wrong with the
   reader's life, and the CTA that follows it is the highest-intent exit on the page before
   pricing. The page's answer to *will this make me feel worse* is above it (the hero's Clear
   card and `This is the whole screen.`) and below it (block 3's *it would rather ask than
   guess*). **Phase 9 should read block 2 cold and say whether the sandwich holds.**
3. **The hero card is a new fixture with no test behind it.** The demo card is pinned by
   `promise-registry.test.ts`; the hero Clear card and block 4's three cards are ledger rows
   labelled `Illustrated example`. That is honest and it is what C3 claimed, but it means **four
   of the five cards on the page are copy, not output.** P4 should walk them against
   `copy-ledger.md` string by string.
4. **Finding 2 is a live `DESIGN.md` contradiction, not a landing question.** The shared demo
   component nests cards, on three routes, against a rule in the file Phase 10B is rewriting.
   Phase 9 does not have to solve it; Phase 10B has to stop the rewritten file from restating a
   rule the product breaks in its most-photographed component.

---

## Where this stops

**Section 13 is complete.** One winner, on the C3 spine, in the mandatory 12-part structure,
with a verbatim paste-ready copy deck. Six mandated items answered. Two organs grafted, one
rejected with three reasons, one rider carried unconditionally. Two paragraphs of C6 and four
separable ideas taken. Thirteen high-scoring ideas rejected on the record. The two
no-convergence items settled on evidence rather than on vote counts. Five code findings that
change what the winner is.

**The headline numbers against the incumbent:** 13 blocks → 6 · 12,942px → ~7,200px ·
19.4 screens → 10.8 · 5,090px desert → 1,450px · 8 card families → 2 · 4 eyebrows → 0 ·
3 planes + hairline → 1 plane · 42 em dashes → 4 unstrippable strings · and two rails that were
prose for the whole life of the page get tests.

**Checkpoint before the red-team, as instructed. Phase 9 (Section 14) has not begun.**

**Still not done:** `npm test` has not been run for five sessions. Last recorded green suite is
2,165 passed / 0 failed / 2 skipped at `bf714e9`. Phase 10C's breakage predictions are worth
nothing against an unverified baseline. Kill any `next dev` first (`pkill -9 -f "next-server"`),
then run it — ~26 minutes on an idle machine.
