> ## ⛔ SUPERSEDED — 2026-08-05
> **Read `docs/handoff/2026-08-05-landing-tournament-phases-0-9-consolidated-handoff.md` instead.**
> It carries everything below, corrected through Phase 9. This file retains three premises Phase 9
> falsified against the repository (see the Phase 9 update note directly below the status block).
> Kept for the record only.

# MASTER HANDOFF — Revora landing design & copy tournament, Phases 0–7 complete

**Date:** 2026-08-05
**Branch:** `fix/landing-followups` (HEAD `8c4c0e9`, unchanged since the tournament began)
**Scope:** the marketing landing `/` only — `app/page.tsx`, the `.landing-*` layer of
`app/globals.css`, `components/demo-check-card.tsx`, and `DESIGN.md` (on trial).
> **Phase 9 update (2026-08-05).** The red-team is in `docs/plans/landing-tournament-phase-9.md`.
> It **falsifies three premises this document carries**: (1) §9.11 and §4.2's claim that
> `Most apps would just pick one and sound confident.` is an approved ledger row — it is
> unledgered shipped source at `app/page.tsx:523`; (2) that `copy-ledger.md`'s `landing-*` rows
> hold strings — they record section intent and never matched the shipped hero; (3) that anything
> connects the ledger to the source — `validate-safety-contract.mjs` reads no `.tsx` file.
> The comparative-confidence family is **ruled unavailable at any scale** because
> `claims-boundary.md` has no claim class a statement about a third party can be filed under.
> Ten fixes applied, four trade-offs recorded. The winner survives; nothing structural changed.
> **Where this document and Phase 9 disagree, Phase 9 wins.**

**Status:** **9 of 10 phases done. 14 of 18 sections written. Winner synthesised on the C3
spine with a verbatim copy deck. Red-team (Phase 9) is next.**
**Code changed: none. Commits: none. `npm test`: not run for five sessions.**

> **Phase 8 update (2026-08-05).** Section 13 is in
> `docs/plans/landing-tournament-phase-8.md`. It answers all six mandated items, grafts C4's
> and C5's organs, **rejects C7's comparison** with three reasons, settles the two
> no-convergence items (**second typeface: keep · card radius: inherited, the landing chooses
> none**), and adds **five findings read out of the code** that change the winner — chiefly
> that C3's 12px/1.5px card delta was measured against the landing families it was deleting,
> not against `.result-card` (22px / 2px `--border-strong`), so applying it would have required
> a landing-scoped override of the very component the spine exists to render unmodified.
> Desert **2,580px → 1,450px** with the 3/7 no-button-under-the-pause refusal honoured.
> Where this document and the Phase 8 plan disagree, **the Phase 8 plan wins.**

---

## 0. How to use this document

This is a **consolidated** handoff. It replaces the need to read the four phase-scoped
handoffs for anything except deep detail, and it is written so a session that reads only this
file can continue the work correctly.

**Read this file, then the one plan file for the phase you are executing.** Everything else is
reference.

| If you need… | Go to |
|---|---|
| The whole state of play | this file |
| The 42 scorecards with justifications | `docs/plans/landing-tournament-phase-6.md` |
| The seven contenders in full (copy decks, specs, self-audits) | `docs/plans/landing-tournament-phases-4-5.md` |
| The kill rulings, organ assignments, convergences | `docs/plans/landing-tournament-phase-7.md` |
| The original brief and rules of the tournament | `docs/prompts/2026-08-04-landing-design-and-copy-tournament.md` |
| Phase-scoped detail this file compresses | the four `2026-08-04-landing-design-copy-tournament-*-handoff.md` files |

**What this is.** A competitive elimination tournament to settle the landing page's design and
copy from first principles. Seven personas each build a complete contender, cross-score each
other, the weak ones are killed, and the survivors' best parts are grafted into one winner.
The output becomes the source of truth for future Revora design work. **`DESIGN.md` is a
defendant in this process, not the referee** — every rule in it has to re-derive itself or die.

---

## 1. Repo state and the one outstanding debt

Nothing has been modified except markdown. No commits. No `DESIGN.md` edits. The tournament
has been entirely on paper by design (see trap 11).

**`npm test` has not been run for four sessions.** Last recorded green full suite:
**2,165 passed / 0 failed / 2 skipped at `bf714e9`**. This is the oldest open item on the
board and it blocks Phase 10C, which must predict which tests break and why — a prediction
written against an unverified baseline is noise.

```
pkill -9 -f "next-server"   # concurrent dev servers cause false createTestDb 120s timeouts
npm test                    # ~26 minutes, needs an IDLE machine
```

Before Phase 10B rewrites `DESIGN.md`, keep the current version reachable:

```
git show HEAD:DESIGN.md > /tmp/design-before.md
```

---

## 2. The map — where the tournament is

Ten phases, eighteen output sections.

| Phase | Sections | State | Output |
|---|---|---|---|
| 0–3 | 1–6 | **Done** | Inventory · constraint ledger · teardown · Brief · `DESIGN.md` verdict |
| 4–5 | 7–8 | **Done** | `docs/plans/landing-tournament-phases-4-5.md` |
| 6 | 9–10 | **Done** | `docs/plans/landing-tournament-phase-6.md` |
| 7 | 11–12 | **Done** | `docs/plans/landing-tournament-phase-7.md` |
| 8 | 13 | **Done** | `docs/plans/landing-tournament-phase-8.md` |
| 9 | 14 | **Done** | `docs/plans/landing-tournament-phase-9.md` |
| **10A** | **15** | **NEXT** | `landing-tournament-winner-spec.md` |
| 10B | 16 | Not started | Rewrite `DESIGN.md` |
| 10C | 17 | Not started | `landing-tournament-implementation-plan.md` |
| — | 18 | Not started | Decision memo |

**Every required table has been delivered:** Teardown Table · `DESIGN.md` Verdict Table ·
Contender Summary Table · full 7×7 cross-scoring matrix · per-dimension winner table ·
ranked scoreboard. Nothing further is owed in table form.

---

## 3. The subject — what the incumbent page is, and what is wrong with it

### 3.1 Inventory

`app/page.tsx` has **11 `<section>` elements but 13 content blocks** (the at-a-glance strip is
a bare `<ul>`; the footer is a `<footer>`). The prompt's "11 sections" is a tag count.

1. Nav + hero `.landing-sheet` (190–271) · 2. At a glance `.landing-sheet` (277–312) ·
3. The six-month wait `.landing-band` (315–366) · 4. How it works `--page-bg` (370–417) ·
5. Three answers `.landing-sheet` (421–502) · 6. Everything you get `--page-bg` (506–619) ·
7. What actually changes `--page-bg` (622–665) · 8. Calm, honest about its limits `--page-bg`
(668–732) · 9. Pricing `--page-bg` (735–809) · 10. Pantry Review `.landing-band` (813–848) ·
11. FAQ `--page-bg` (852–864) · 12. Final CTA `.landing-band` (868–881) ·
13. Footer `--page-bg` (884–925).

**Baseline metrics:** 13 blocks · 12,942px · 19.4 screens at 667px · 7 CTAs ·
**5,090px longest CTA desert** · 42 rendered em dashes · 8 card families · 4 eyebrows ·
3 light planes + hairline.

### 3.2 The single worst thing on the page

**The hero's visual half proves the product by showing a food you thought was fine being
flagged.** `DemoCheckCard` renders *You type: oatmeal* → *Need one more detail* → *You answer:*
→ **Be careful**. It is scrupulously honest, pinned to the real precheck by
`promise-registry.test.ts`, and it is the sharpest hook in `docs/ICP.md` §10.

It is also the wrong first handshake. `PRODUCT.md` §Design Principles 1: *"Lead with what the
user CAN do/eat."* The first thing Revora is shown doing to a frightened person is taking away
breakfast, and the page then spends four blocks apologising with the word "calm." At 375px the
card is ~15 stacked lines ending in a legal disclaimer, so the visitor's first scroll after the
CTA is a second wall of text. **The betrayal hook should stay on the page. It should not be
the opening move.** All seven contenders agreed (§9.1, convergence 7).

### 3.3 The structural fault

**Block 3 (the problem) and Block 7 (what changes) are the same section written twice** — four
items each, same four moments, same order, one pair near-verbatim. Cost: ~1,400px of mobile
scroll for one idea, sitting inside the page's only 5,090px CTA desert.

### 3.4 The duplication census

| Claim | Times stated |
|---|---|
| "one clear answer / label + reason" | **7** |
| `10 free checks` | **7** |
| prediabetes-only scope | **5** |
| the three verdict words rendered | **4** |
| "encrypted at rest, one-tap delete" | 2, near-verbatim |
| "weekly recap, never a grade" | 2, near-verbatim |
| Pantry Review | 2 |

### 3.5 Other diagnostic findings

- **42 rendered em dashes** (51 including comments). Not a house voice — a cadence, and the
  most reliable machine-text tell in 2026.
- **The word "calm" appears three times** in headings and ledes. A page that has to say it is
  calm is not calm.
- **Six of thirteen blocks are stock furniture:** three-step how-it-works with `Step 1/2/3`
  eyebrows, four-stat glance strip, 3-up pricing tiles, FAQ accordion, 2×2 before/after grid,
  9-item feature grid.
- **`landing-glance-fact` renders "10 seconds"** in accent type as an unhedged promise while
  the hero says "about ten seconds." No test family catches it — it is a latency claim, not a
  health claim.
- **Trust card #2** has the heading "Grounded in published research" over a body about the
  weekly recap being behavioural. Heading and body describe different things.
- **The feature grid's ranking exists only in a code comment.** A scanner sees nine
  undifferentiated cells.
- **`.landing-phone` contains no phone.** The bezel was removed 2026-07-27; the class name was
  left behind and has been lying since.
- **With `photoInputEnabled()` false, section 4's shipped headline is "Two ways in."** — and
  the two ways are *typing* and *talking*. ~900px of page sells the two most ordinary input
  methods in software as the mechanism. All seven contenders retired it.

---

## 4. The constraint ledger — what actually holds the page

### 4.1 The fifteen hard rails, and which are real

| # | Rail | Enforced by | Real? |
|---|---|---|---|
| 1 | Revora never the agent of a health outcome | `claims-boundary-copy.test.ts` (reverse/cure/treat/prevent/diagnose/future-claim) | **TEST** |
| 2 | No fabricated ratings / users / testimonials | family `social-proof` | **TEST** (the "Illustrated examples" label itself is unpinned) |
| 3 | SAFE/MODERATE/HIGH never render as copy | `copy-pins.test.ts` RISK_LABELS walk | **TEST** |
| 4 | Clear carries no adjustment and no swap | `postprocess.ts assertNoUnsafeSafeFields` (throws) + family `unconditional-swap` | **TEST + RUNTIME** |
| 5 | Disclaimer visible, never behind a disclosure | `disclaimer-presence.test.ts` covers **engine responses only**; the landing footer's `{BOUNDARY_DISCLAIMER}` is unpinned | **PROSE-ONLY on the landing** |
| 6 | Statistics trace to evidence-pack; trial citation only on `/how-it-works` | family `study-association` + exemption guard | **TEST** |
| 7 | `.landing-proof-band` left column is a LABEL, not a statistic | a CSS comment and a `DESIGN.md` paragraph | **PROSE-ONLY** |
| 8 | WCAG AA; health info never in `--text-soft` | `tests/smoke/landing-a11y.spec.ts` (axe). The `--text-soft` rule: prose-only | **TEST (partial)** |
| 9 | 44px touch targets | CSS only; axe does not check target size at AA | **NOT ASSERTED** |
| 10 | Nothing below 16px except tracked uppercase | two "never lower this" CSS comments | **PROSE-ONLY** |
| 11 | Verdict colour never the sole channel | icons ship, not asserted | **PROSE-ONLY** |
| 12 | `prefers-reduced-motion` zeroes motion | four `@media` blocks, no coverage | **NOT ASSERTED** |
| 13 | Focus visible everywhere | `:focus-visible` + axe | **CSS + TEST (partial)** |
| 14 | Landing reads light; no dark bands | owner instruction in prose | **PROSE-ONLY** |
| 15 | Landing is marketing; the app lives at `/check` | nothing structural | **PROSE-ONLY** |

**Seven prose-only rails.** Ranked by likelihood a redesign silently breaks one: 16px floor →
proof-band-is-a-label → reduced-motion → 44px targets → health-info-never-`--text-soft`.
**Phase 10C must schedule tests for these**; two are already committed (§10.5).

### 4.2 The pin ruling — two tiers, binding through Phase 10

**Tier A — semantic pins. Inviolable. Breaking one forfeits.**
`TASTER_LIMIT` interpolated never retyped · `{monthlyPrice}` from `resolvePriceVariant()` with
no literal `$9.99|$12.99|$19.99` in source · `paywallMode() === "trial"` with **both** branches
present · `RISK_LABELS` interpolated · `<DemoCheckCard />` rendered and the three interaction
strings never retyped · `reading.className` on the landing root · no `.landing*` selector
declaring `font-size` twice · banned source phrases stay banned (`/free taste/i`,
`/your first day of checks is free/i`, `/check your meals all day/i`) · trial mode never
renders a daily free-check claim and legacy mode must.

**Tier B — string pins. Changeable only by naming the pin, giving the reason, and scheduling
the test edit in the same work item. Silent drops forfeit.**
`Check up to {TASTER_LIMIT} meals on your first day` · `{TASTER_LIMIT} free checks on day one`
· `Your first ${TASTER_LIMIT} checks, on your first day` · `7 days free` · `Days 2–8` ·
`A free account` · `still no card` · `Two ways in.` / `Three ways in.` ·
`Dictate it or type it.` · `A weekly recap in sentences` ·
`A record you can actually show someone` · `It asks before it guesses` ·
`Add to home screen — works today`.

**The winner's inherited retirement schedule** (C3's list, subject to Phase 8 grafts):
`Two ways in.` / `Three ways in.` · `Dictate it or type it.` ·
`{TASTER_LIMIT} free checks on day one`. **Three pins.**

### 4.3 Live facts — do not re-derive, do not retype

| Fact | Live value | Source |
|---|---|---|
| `TASTER_LIMIT` | **10** | `lib/client/taster-store.ts:2` |
| `FREE_DAILY_CHECKS` | **5** — legacy funnel only | `lib/free-tier.ts` |
| `FREE_HISTORY_DAYS` | 7 | `lib/free-tier.ts` |
| Trial | **7 days**, card required, $0 charged, pre-charge email at day 5 | `lib/server/pricing.ts`, ledger `precharge-email` |
| `paywallMode()` | **`"trial"`** by default | `lib/server/pricing.ts` |
| Monthly price | **$12.99** (`TRIAL_PRICE_VARIANT` unset → `"1299"`); ladder $9.99 / $12.99 / $19.99 | `lib/server/pricing.ts` |
| Annual | $99.99/yr, $8.33/mo equivalent | `ANNUAL_PRICE` |
| Pantry Review | $49, one-time, non-renewing | ledger `pantry-landing-cta` |
| `RISK_LABELS` | **Clear · Be careful · Hold off** | `lib/revora/labels.ts` |
| `BOUNDARY_DISCLAIMER` | `Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you.` | `lib/revora/boundary-copy.ts` |
| `photoInputEnabled()` | **FALSE** | `lib/photo-input-flag.ts` |
| `learningJourneyUiEnabled()` | **FALSE** | `.env.example` blank |
| `longitudinalInsightsEnabled()` | **FALSE** | unset |
| A1C scope | 5.7%–6.4% | `docs/safety/claims-boundary.md` |

### 4.4 The claims guards are the authority, not caution

The most useful operating fact in the repo: the 2026-07-28 rebuild's bolder copy tripped
**zero** guards. `claims-boundary-copy.test.ts` bans *disease-outcome claims*, not vivid
writing about the reader's problem. Run `npx vitest run tests/unit/revora/` (~80s) before
assuming any copy is a compliance problem.

---

## 5. The Brief — this binds everything downstream

**The one belief:** *There is a tool built for exactly my situation that will answer the plate
in front of me right now, and it will tell me when it isn't sure.* Three parts — built for me ·
answers now · admits doubt. Drop one and the page is selling a generic nutrition app to
someone who already quit one.

**The one action:** tap `Check your first meal — free` and describe a meal. Requires no
account, no card, nothing to install, **and no fear of judgment on the other side.** The
incumbent states the first three well and never addresses the fourth.

**The three objections, in frequency order:**

| # | Objection | What answers it | What only sounds like it does |
|---|---|---|---|
| 1 | "Another food app I'll quit in a week" | showing **one answer card and nothing else** | saying "not a calorie counter" — every calorie counter says that. `ICP.md` §8: MyFitnessPal-is-free is the **#1 deal-killer** |
| 2 | "Is it accurate, or is it AI guessing?" | **the clarifying question** — free, checkable in 10s, unfakeable | "Grounded in published research" — this audience is specifically burned by AI food apps |
| 3 | "Will it charge me or trap me?" | 10 checks, no login, no card; day-5 pre-charge email; one-tap cancel, as mechanics | the word "free" — the category is poisoned (Klinio 1.2/5) |

**The fourth objection, unspoken:** *"Will this make me feel worse?"* Never typed into a
search bar, so no research surfaces it. Kills silently at the fold. Persona P6 exists to hold
it, and Phase 7 proved it is the dimension that decides the tournament (§8.2).

**Emotional arc:** fold = **recognised, then relieved**. Midpoint = **steadied; smaller than
feared**. CTA = **safe to try** — absence of risk, not presence of desire. Urgency is the
wrong instrument; it reads as the thing the scam apps did.

**The one thing no competitor can honestly say:** **It asks a question instead of guessing.**
Every alternative in `ICP.md` §9 returns a confident number for any input and their complaint
threads are *about* that confidence. The incumbent owns this and ranks it feature #1 of nine,
in a grid, at y≈5,500px on mobile.

---

## 6. `DESIGN.md` on trial — the Phase 3 verdicts

Every rule classified PRINCIPLE / SCAR TISSUE / ACCIDENT / CONTESTED.

**ACCIDENTS to kill:** §Class vocabulary (an index, half stale) · "CSS only, no animation
libraries" (a dependency policy dressed as a design rule) · the 480px `.page-frame` legacy
note · **the scope clause "for content pages" in §App-UI guardrails** — that clause is exactly
what let the landing become a card mosaic while a rule banning card mosaics sat in the same
file.

**SCAR TISSUE that is really a test** — all five should name their test file and stop
retelling their incident: FINDING-030 font wiring · `reading.className` placement ·
one-`font-size`-per-selector · CTA single-assembly · DPP citation confinement.

**Documented-but-false:** §Type claims base `16px/1.5` is "now actually in force." It is not —
`body` is still inside the `font: inherit` reset. **The design system documents a value that
does not compute.**

**Best rules in the file, keep near-verbatim:** the single card shadow · risk colours are
semantic-only · credibility is honesty · §Progress surfaces, especially *"Checking less as you
get more confident is how this is meant to work."*

**The seven CONTESTED items, and how the tournament settled them:**

| # | Contested item | Vote | Status after Phase 7 |
|---|---|---|---|
| 1 | Two-font pairing (Jakarta + Source Sans 3) | 5 keep / 2 kill | **UNRESOLVED.** A real trade: C2's one-family 17/1.65 is the only perf win any contender delivered; C3's defence is that the pairing does real work inside the card. Phase 8 decides. |
| 2 | 24px radius on all 8 card families | 4 keep 24 / C3 12px / C7 0px / C4 split | **NO CONVERGENCE.** The winner is a mover with no mandate behind it. Phase 8 decides. |
| 3 | Three planes + hairline | **7/7 collapse it** (4 to one plane, 3 to two) | **SETTLED.** Nobody defended it. |
| 4 | "One filled pill per viewport" | 5/7 per screenful | **SETTLED** as per-screenful. Nobody proposed a filled nav CTA. |
| 5 | Eight card families | **7/7 cut to ≤4**, 6/7 to ≤3 | **SETTLED.** Nobody defended eight. |
| 6 | Landing voice licence | 6/7 take it; C4 declines | **SETTLED** — and C4 died with Voice 4.83 / Emo 2.83. |
| 7 | "Icons never alone" | **7/7 restate** | **SETTLED.** The file already contradicts itself in §Progress surfaces. Restatement: an icon never carries meaning alone *unless* it is a redundant channel for text in the accessible name. |

---

## 7. The seven personas and the seven contenders

| | Persona | Theory of failure | The one bet |
|---|---|---|---|
| P1 | **Conversion Surgeon** (`icopywriting`, `icro`) | Not a page — thirteen pages stacked. The mechanism is feature #1 of 9, in a grid, at y≈5,500px. | Fewer sections in the right order beat better sections. |
| P2 | **Restraint Architect** (`apple-design`, `impeccable`) | Five systems all saying "new section here" when space alone would have said it. | Subtraction, not rearrangement. |
| P3 | **Design Engineer** (`emil-design-eng`, `taste-skill`) | Describes the product nine ways and shows it once, inside a `.landing-phone` that has held no phone since 2026-07-27. | The artifact is the page. |
| P4 | **Clinical Trust Officer** (safety docs) | Treats its best asset as fine print. | Open by telling most readers to leave. |
| P5 | **Legibility Realist** (`iui-ux-pro-max`) | The argument is fine; the page is 12,942px with a 5,090px stretch containing no way to act. | The conversion problem is physical. |
| P6 | **Anxious Patient** (ICP, `PRODUCT.md` §Users) | Shows a frightened person a food they thought was fine being taken away, then says "calm" three times. | Tone is structure. |
| P7 | **Adversarial Killer** | Six of thirteen blocks would work unedited on a project-management site. | Only a non-portable object survives. |

| # | Name | Structural claim | Blocks | 375px | Desert |
|---|---|---|---|---|---|
| **C1** | The Six-Month Gap | DR chassis; objections as named blocks; oatmeal demo out of the hero | 8 | 11.1 scr | 1,460px |
| **C2** | Is This One Okay? | Five statements, one plane, **no hero visual at all**, FAQ dissolved | 5 | 7.8 scr | 2,140px |
| **C3** | One Card Back | Result card is the composition unit; white becomes card-only material; one 520ms pause | 6 | 10.2 scr | 2,580px |
| **C4** | Built for One Number | H1 disqualifies the reader; scope table replaces the result card in the hero | 7 | 10.5 scr | 1,820px |
| **C5** | Within Reach | Persistent thumb-zone bar; ranked list with the ranking rendered | 9 | 12.9 scr | **0px** |
| **C6** | Tonight | One evening, second person, product inside the narrative | 6 | 9.3 scr | 2,120px |
| **C7** | It Asks First | The page is one comparison; no eyebrow, no grid, no accordion; radius 0 | 5 | 8.7 scr | 2,180px |

All seven delivered in the mandatory 12-part structure with verbatim ship-ready copy decks,
15-rail self-audits, motion specs, 375px stories and Tier B pin ledgers.

---

## 8. The scoring

### 8.1 The weights — the owner's one decision, not reopened

Asked before any card was written. The owner chose the **`Craft 16 + Emotional fit 14`**
rebalance over the weights as written.

| D1 Cat | D2 Belief | D3 Honesty | D4 Voice | D5 Legib | D6 **Craft** | D7 IA | D8 **Emo** | D9 Impl | D10 Dur |
|---|---|---|---|---|---|---|---|---|---|
| 10 | 12 | 12 | 10 | 10 | **16** | 8 | **14** | 6 | 2 |

Scale 1–10. Weighted total = Σ(score × weight) ÷ 10, so a flat-7 page scores 70.0.
Bands: STRONG ≥ 71.0 · CONDITIONAL 62.0–70.9 · WEAK 55.0–61.9 · KILL < 55.0.
Method: 7 personas × 6 contenders, no self-scoring, 42 cards, 420 dimension scores, one
concrete justification each. All seven binding skills held before the first card.

### 8.2 The scoreboard, and the correction Phase 7 made to it

| Rank | Contender | **Rebalanced** | As-written | Dims won | STRONG | KILL |
|---|---|---|---|---|---|---|
| **1** | **C3 — One Card Back** | **71.83** | **70.72 (1st)** | 1 · Craft | 4 of 6 | 0 |
| 2 | C1 — The Six-Month Gap | 68.00 | 68.89 (2nd) | 2 · IA, Impl½ | 1 of 6 | 0 |
| 3 | C2 — Is This One Okay? | 66.83 | 66.93 (3rd) | 0 | 0 | 0 |
| 4 | C6 — Tonight | 65.37 | 64.20 (**6th**) | 2 · Voice, Emo | 0 | 0 |
| 5 | **C5 — Within Reach** ☠ | 62.20 | 64.92 (**4th**) | 2 · Legib, Impl½ | 0 | 1 |
| 6 | **C4 — Built for One Number** ☠ | 61.43 | 64.27 (5th) | 3 · Cat, Honesty, Dur | 0 | 1 |
| 7 | **C7 — It Asks First** ☠ | 59.00 | 58.79 (7th) | 1 · Belief | 0 | 1 |

**⚠ Phase 6 claimed C3 would have finished ~4th under the as-written weights and that the
rebalance "selected a different winner." That was wrong.** Phase 7 recomputed and verified it
(the method reproduces the reported rebalanced totals to ±0.02, which is rounding on the
means). **C3 wins under both constitutions.** What the rebalance actually decided is **which
of C5 and C6 died** — under the as-written weights the bottom three would have been C4,
**C6** and C7, and C5/C6 were 0.72 points apart, inside the resolution of the scale.

### 8.3 Per-dimension winners

| # | Dimension | W | C1 | C2 | C3 | C4 | C5 | C6 | C7 | Winner |
|---|---|---|---|---|---|---|---|---|---|---|
| D1 | Category clarity | 10 | 7.83 | 5.67 | 6.17 | **8.67** | 7.83 | 4.67 | 3.00 | C4 |
| D2 | Belief shift | 12 | 6.83 | 6.00 | 6.67 | 6.00 | 6.00 | 7.00 | **8.00** | C7 |
| D3 | Honesty & claim safety | 12 | 7.50 | 7.50 | 8.67 | **9.17** | 7.67 | 5.33 | 7.67 | C4 |
| D4 | Voice fidelity | 10 | 6.83 | 7.83 | 7.17 | 4.83 | 7.00 | **8.50** | 4.83 | C6 |
| D5 | Legibility & a11y | 10 | 7.17 | 8.83 | 6.17 | 7.17 | **9.33** | 8.00 | 5.33 | C5 |
| D6 | **Craft** | **16** | 4.50 | 5.83 | **8.33** | 5.00 | 3.33 | 6.33 | 8.00 | **C3** |
| D7 | Information architecture | 8 | **7.67** | 5.67 | 6.00 | 7.50 | 5.83 | 4.67 | 6.50 | C1 |
| D8 | **Emotional fit** | **14** | 7.00 | 7.00 | 7.67 | 2.83 | 4.17 | **8.83** | 3.83 | C6 |
| D9 | Implementation realism | 6 | **7.83** | 5.83 | 6.00 | 5.00 | **7.83** | 3.67 | 4.00 | C1 / C5 |
| D10 | Durability | 2 | 5.67 | 5.67 | 7.33 | **8.00** | 5.50 | 4.83 | 6.33 | C4 |

Highest card: **P2 → C3, 77.6.** Lowest: **P6 → C7, 52.6.** Exactly **one 10** in 420 scores
(P1 → C4, Honesty). Only 5 of 42 cards cleared STRONG, four of them C3. No judge mean sits
more than 6.1 points from any other, so the spread between contenders is signal.

---

## 9. Everything the tournament found that was not obvious

This is the substance. Ordered by how much it should change what gets built.

### 9.1 The kill line is Emotional fit, and it is a cliff, not a slope

**Every page with an Emotional-fit mean below 5.0 died. Every page above it lived. Nothing
sits in between.**

`C4 2.83 · C7 3.83 · C5 4.17 —— void of 2.83 points —— C1 7.00 · C2 7.00 · C3 7.67 · C6 8.83`

That void is **the largest gap in any dimension's distribution on the board** (verified
against all ten; next largest is Honesty at 2.17). Emotional fit is the only dimension that
separates the living from the dead cleanly. Part of that is the weight of 14 — but the *void*
is not: no contender chose to sit between 4.17 and 7.00. Seven personas did not treat warmth
as a dial. They treated it as a decision that was either taken or refused.

### 9.2 The tournament punished troughs; it did not reward peaks

There are **13 sub-5.0 dimension means** on the board. **The three dead pages hold 8 of them.
The winner holds zero, and so does C2 in third.** The two highest single-dimension scores in
the entire tournament — C5's Legibility 9.33 and C4's Honesty 9.17 — both belong to corpses.

### 9.3 In every dead page, the winning organ and the killing defect are the same object

| Contender | The organ | The same object, scored as the defect |
|---|---|---|
| C5 | fixed bar → 0px desert → **Legibility 9.33** | fixed bar → **Craft 3.33, Emo 4.17** |
| C4 | boundary as architecture → **Honesty 9.17** | boundary as architecture → **Voice 4.83, Emo 2.83** |
| C7 | competitor comparison → **Belief 8.00** | competitor headline → **Category 3.00** |

**No survivor has this property.** This is the tournament's single most useful structural
finding, and it is why organ extraction is load-bearing rather than a courtesy: each organ has
to be separated from its cost before it can be used.

### 9.4 Honesty and warmth are not separable on this page

C4 wins three dimensions worth 24 points of weight — Category clarity, Honesty and
Durability — holds the only 10 awarded in 420 scores, and finishes sixth because it scores
**2.83 on a 14-weight dimension with six independent judges landing on 2 or 3.** The most
honest page in the tournament is also the one nobody wants to read, and the two facts have the
same cause.

The counter-proof is C6: **unanimous 8–9 on Emotional fit from all six judges, including P4,
which scored the same page a 3 on honesty in the same card and gave it a 9 here anyway.**
Warmth is not a matter of taste on this page. It is also not enough on its own — C6 finished
fourth on Craft 6.33.

### 9.5 The clarifying question was buried, and all seven found it independently

**7/7 promote `It asks before it guesses` from feature-grid cell #1 of 9 to a first-class
block.** C7 makes it the entire page. This is the strongest convergence in the tournament and
it had never been written down. Seven personas with incompatible worldviews independently
concluded that the single most defensible thing this product owns was sitting in a grid,
5,500px down.

### 9.6 Three contenders refuse a CTA under the clarifying-question block, and that refusal
produces the tournament's most common defect

C2, C3 and C6 independently give the same reason: the block's argument is *wait a second
before you answer*, and a button under it contradicts the argument. Those three post deserts
of **2,580 / 2,140 / 2,120px** — the first, third and fourth longest on the board. A shared
principle producing a shared defect. **The winner's version is the worst of the three.**

### 9.7 C7 posts the highest Belief mean on the board and finishes last on one unanimous number

8.00 Belief, 8.00 Craft, and **3.00 on Category clarity from six judges who never conferred —
the only unanimous score in 420.** It deleted the eyebrow on principle, which left a headline
about a competitor's product as the only thing above the fold. Its author predicted it in
part 12.

### 9.8 C1 produced zero disagreements of 3+ points across all ten dimensions

The only contender that did. Seven incompatible worldviews converged: correct ordering (IA
7.67, highest on the board), cheap to build (Impl 7.83, tied highest), nothing decided
visually (Craft 4.50, second-lowest). **It finishes second by being the page nobody objects to
and nobody argues for.**

### 9.9 A rail passed by deletion is a rail with no subject

**Six of seven contenders wrote "PASS by deletion" against rail 7.** That is a pass in the same
sense that deleting a form passes form validation. This produced the research-disclosure
ruling (§10.4) and becomes a general rule in the rewritten `DESIGN.md`.

### 9.10 All three dead contenders predicted their killing score in writing and shipped anyway

C4: *"it knows P6 will score that at a 3."* P6 gave it a 2. C7: *"The eyebrow that would have
fixed this in seven words was deleted on principle."* Six judges gave it a 3, unanimously.
C5: *"It might not, and the failure would be invisible in an A/B test."* Six judges scored the
bar 2–4 on Craft. **Naming a defect is a discipline. It is not a fix.**

### 9.11 The comparative-confidence claim is in all seven contenders, and four escalate it

Descended from the already-approved ledger row `Most apps would just pick one and sound
confident.` **Four contenders silently escalate the hedged `Most` to a universal `Every`**
(C1, C4, C6, C7), and C7 scales it further into a structural block with the heading
`What every other food app does`. A universal accuracy claim about unnamed third parties on a
health surface is a materially different exposure from a hedged one. **It clears
`claims-boundary-copy.test.ts` because that suite checks disease-outcome claims. Counsel is a
different fence.** Full inventory in `landing-tournament-phase-7.md` §11.7.2. **Phase 9 rules
on this; nobody before Phase 9 may treat "the guards pass" as clearance.**

### 9.12 Smaller findings worth carrying

- **The single card shadow is the only `DESIGN.md` rule with an unqualified 7/7 endorsement.**
  Seven contenders changed radius, borders, planes, families and type; not one changed the
  shadow.
- **The pains list is right and its container is wrong.** 6/7 keep the words; 4 of those change
  the format away from bullet + bold lead-in + card. The incumbent uses three emphasis systems
  on writing that needed none.
- **Nobody proposed scroll reveals anywhere.** 4/7 ship zero motion; 7/7 ship at most one
  animation. Against `emil-design-eng`'s frequency test — a landing page is seen once — that is
  the correct answer.
- **All three contenders that delete the FAQ block hit the same wall independently:** they keep
  the `faqs` array for FAQPage JSON-LD while not rendering the answers, and all three flag it
  as a schema-honesty risk, not only an SEO one.
- **Two H1s were killed for rail breaches by their own author** (C6): `You can probably eat
  it.` (implies a safety finding — rail 1) and `Most meals come back Clear.` (unverifiable
  output-distribution claim — rail 2). They are the most natural permission-first headlines in
  the brief and both are out of bounds.
- **The DPP statistic is denied to all seven.** Three personas wanted it; rail 6 confines it to
  `/how-it-works`.
- **Em dashes: incumbent 42 → contenders 2 to 8.** C2 renders 2, C6 3, C7 4, C4 5, C1 6, C3 7,
  C5 8.

---

## 10. The standing rulings — everything already decided, in one place

Do not reopen any of these without a reason that is new.

### 10.1 The eight 3+ point disagreements (Phase 6, Section 10)

| # | Contender · Dimension | Ruling |
|---|---|---|
| 1 | C2 · Craft (P5 7 / P3 4) | **P3 right on the page; P5 found something P3 missed.** They score different objects — P5 the type system, P3 the page, where a pure-text hero is incomplete work (`taste-skill` §4.8). Honest number 5–6. **Carry the type decision forward as extractable regardless of C2's fate.** |
| 2 | C3 · Legibility (P2 7 / P5 4) | **P5 right. This is the winner's largest unresolved defect.** The 0.4 observer threshold is the contender admitting its centrepiece is taller than the phone. |
| 3 | C4 · Voice (P1 6 / P6 3) | **P1 right on the dimension.** Voice measures register consistency and C4 is perfectly consistent — in a register P6 finds intolerable. Honest number 5. The finding already lives in Emotional fit at 2. |
| 4 | C5 · IA (P1 8 / P2,P3,P7 5) | **P1 right.** IA measures order and reachability. What the others object to is quantity and genericness, which already has a home in Craft. **C5's 0px-desert organ should not be discarded with the page.** |
| 5 | C5 · Durability (P1,P4 7 / P7 4) | **Both right, measuring opposite halves.** The two scheduled tests are the most durable artifact any contender produced; the sticky bar has a visible expiry. |
| 6 | C6 · Honesty (four judges 6 / P4 3) | **P4 right.** The four measure absence of falsehood; P4 measures presence of verifiability, and the rails govern what a claim is *grounded in*. **This is the number that dropped C6 from third to fourth.** |
| 7 | C6 · IA (P2 6 / P1 3) | **P1 right.** Coherence is not the test, reachability is. **The tournament resolves IA in favour of reachability in both directions: C5's 8 stands and C6's 3 stands.** |
| 8 | C7 · Honesty (P3 9 / P4 6) | **Both right.** P4's 6 stands for C7 specifically because C7 alone scales the claim from a sentence to a structural block. See §9.11 — the family question goes to Phase 9. |

### 10.2 The three kills (Phase 7, Section 11)

**These are specialists, not weak pages.** C5 won two dimensions, C4 won three, C7 won one.

| Killed | The exact decision that ended it | Convicted on |
|---|---|---|
| **C5 — Within Reach** | Kept **nine of thirteen** incumbent blocks and bolted a `position: fixed; bottom: 0` bar across 7,900 of 8,600px to make nine blocks reachable. Solved the desert with an element instead of with a page; its own delta table says "unchanged" for radius, shadow and type pairing. | Craft **3.33** (2–4 from all six, nobody above 4) |
| **C4 — Built for One Number** | Dropped `landing-audience-pains` from the page **entirely** — the only contender that does — and put three educational definition rows in the recognition slot. Plus the H1's second sentence, `If yours isn't in it, this isn't for you.` | Emo **2.83** (2–3 from all six) |
| **C7 — It Asks First** | Deleted the eyebrow on principle, leaving a headline about a competitor as the only thing above the fold. Applied the eyebrow-per-section ban to the case `impeccable` explicitly exempts. Secondary: the comparison is entirely below the fold at 375px. | Category **3.00** — the only unanimous score in 420 |

### 10.3 The banned list for the rewritten `DESIGN.md` (Phase 10B inherits verbatim)

1. **The winning organ and the killing defect must not be the same object** (§9.3).
2. **A named defect is not a mitigated defect** (§9.10).
3. **No dimension below 5** — a page is scored on its floor, not its peak (§9.2).
4. **Emotional fit below 5 is fatal, independent of everything else** (§9.1).
5. **A diagnostic is not a design brief.** C5 built from a pixel measurement, C4 from the rail
   table, C7 from a portability test. Each passes its own instrument and loses the reader.
6. **A rail passed by deletion is a rail with no subject** (§9.9).
7. **Confirmed anti-patterns, with vote counts:** eight card families (0/7 defend) · three
   planes + hairline (**7/7 collapse**) · `Step N` eyebrows (7/7 delete) · an eyebrow above
   every section (7/7 cut to ≤1) · a how-it-works block selling typing and talking while
   `photoInputEnabled()` is false (7/7 retire) · a fixed conversion element held across a whole
   page · deleting the category answer to avoid a trope · replacing the recognition moment with
   definitions.

**Explicitly NOT banned — Phase 10B will be tempted:** three price tiles (4/7 keep them) and
the 24px card radius (no convergence at all).

### 10.4 The research disclosure — ruled

**The content survives. The component does not.**

6/7 deleted `.landing-proof-band`; only C4 kept it, and C4 had to neuter the left column
(rendering the literal string `Sources`) because a number there would read as Revora's own
result. **A component whose primary affordance must be disabled for the content to be safe is
the wrong component.** Counting C4's neutering, the vote against the band *as a band* is 7/7.

Binding reasons: Disagreement 6 already ruled that honesty here means *presence of
verifiability* and dropped C6 a place for having nothing checkable — that cannot bind C6 and
not the winner. Rail 6 confines the DPP statistic to `/how-it-works`, so these paragraphs are
the landing's only provenance surface. And `55e2ea6` / `6e1980e` just added machine-readable
provenance; removing the human-readable kind in the same quarter is incoherent.

**What ships:** C4's two sentences plus the `Read the sources and the limits` link, as plain
prose, ~180px instead of ~700px, placed in **C3's block 4 under the `Illustrated examples.`
note** — not the offer block, where provenance reads as a sales credential.

**Phase 10B owes a rail-7 rewrite** (its purpose is now discharged *structurally* — no
stat-strip affordance exists to put a number in — rather than by deletion).
**Phase 10C owes** two ledger rows and deletion of the `.landing-proof-band` selector block.

### 10.5 The three organs and their recipients

Spine is **C3**. Each organ is separated from the cost that killed its owner.

| From | The organ | Recipient | Why |
|---|---|---|---|
| **C5** | **The reachability rule without the bar** — no stretch longer than one viewport (667px) may lack a reachable primary action; *one exit per screenful*, plus the pixel-measurement discipline | **C3, the block 3 → 4 boundary** | Repairs C3's 2,580px desert, convicted in Disagreement 2 |
| **C4** | **Scope in the headline, without the disqualification** — take the first sentence and the move, leave `If yours isn't in it, this isn't for you.` | **C3's H1** | C3 scores Cat 6.17 and five of six judges give the same reason: the eyebrow is carrying a 10-weight dimension at 13px |
| **C7** | **The comparison at behaviour level, with the fabricated-output refusal non-severable** | **C3's block 3** | Belief 8.00 and Craft 8.00. Grafting the object without the constraint is grafting what rail 2 and `taste-skill` §4.8/§9.E ban |

**⚠ C5's and C7's organs collide.** Both land on C3's block 3 and pull opposite ways.
**Tiebreak already ruled: C5's has precedence** — it repairs a convicted defect; C7's
introduces a claim the tournament has explicitly not cleared. If both cannot fit, C7's goes to
the rejected list with that reason.

**Rider, unconditional, not part of any organ:** C7's `border-top` on the block rather than an
`<hr>` (so the hairline snaps to the device grid at fractional DPR) and the 2px focus offset.
P3 scored the pair a 9. C3 needs the focus offset for its 12px radius anyway.

**Also standing:** C5's **two scheduled tests are adopted regardless of the winner** — a
44/48px target assertion and a `prefers-reduced-motion` assertion. Both rails are currently
unasserted for the whole page.

### 10.6 Convergence — what is settled and must not be re-derived

**7/7, no defenders on the other side:** rule 7 restated · card families cut to ≤4 ·
`Step N` eyebrows deleted · `Two ways in.` / `Dictate it or type it.` retired · **the
clarifying question promoted to a first-class block** · the Clear card as the demonstrated
proof object · **the oatmeal card leaves the hero** · the scope sentence near-verbatim ·
billing as dates and amounts · zero social proof and no DPP statistic · **the single card
shadow untouched** · three planes + hairline collapsed · every surviving icon sits beside its
label.

**5–6/7:** the pains list is right and its container is wrong · body type resolves to a single
17px value · the nav CTA is never filled · one filled pill restated as per-screenful · live-flag
pricing protected · the research disclosure leaves the page *as a band*.

**3–4/7:** the CTA-under-the-pause refusal (§9.6) · space replaces colour as the sectioning
instrument · the offer block stops being a sales line (and the two keeping
`Try it before you pay a cent` were both marked down for it by P6) · at most one animation ·
`text-wrap: pretty`/`balance` · 62ch measure.

**No convergence — do not invent one:** card radius · three price tiles · the second typeface ·
the single eyebrow.

**Eleven lone ideas that scored high** are tabulated in `landing-tournament-phase-7.md` §12.5.
The two nobody had flagged before: **C4's `--text-soft` banned by block rather than by review**
(the only structurally-enforced rail in the tournament, costs nothing, one line in Phase 10A)
and **C3's pointer-down 120ms press feedback** (the one motion decision `emil-design-eng`
endorses outright — note its `scale(0.985)` is subtler than the recommended 0.95–0.98 floor).

**One lone idea the room may have rejected wrongly:** P5's visible ranking was scored down as
`impeccable`'s numbered-marker scaffold, but that ban has an explicit carve-out for real
ordered information. **Ruled: the ordering principle survives, the rendered numerals do not.**

---

## 11. Traps and gotchas — all sixteen

1. **Skills bind the personas.** Invoke and hold before any judging or synthesis: `impeccable`,
   `iui-ux-pro-max`, `taste-skill:taste-skill`, `apple-design`, `emil-design-eng`,
   `icopywriting`, `icro`. A contender that violates the standard of the skill it is built on
   is scored down by every judge including itself.
2. **`taste-skill` bans em dashes outright; Revora's approved CTA contains one**
   (`Check your first meal — free`). The em dash stays because it is approved ledger copy. Do
   not silently strip them — that breaks `copy-pins` and the approved CTA.
3. **Rail 14 (light surface, no dark bands) is immutable this round.** Owner instruction
   2026-07-27. No contender argued against it. It is the one lever that would most widen the
   design space, and pulling it would require re-running Phase 5, not just Phase 6.
4. **Do not "fix" the Clear card** by giving it an adjustment. `assertNoUnsafeSafeFields`
   throws on it in the engine. All seven contenders demonstrate the absence rather than
   asserting it; three make it the hero.
5. **`Revora_Brand_Positioning_v2.md` is a tombstone** and `docs/archive/` is not an approved
   source. `docs/product-marketing.md` is the only active positioning source.
6. **The rejected claim in `PRODUCT.md` §Rejected claims must never be resurrected** — recorded
   as Rejected in ledger row `onboarding-reversal-line`, pending counsel Q8.
7. **The two rejected C6 headlines must not be resurrected** (§9.12).
8. **The DPP statistic stays off the landing.** Rail 6 and family `study-association`.
9. **The comparative-confidence family is an open compliance question, not a settled one**
   (§9.11). Do not treat "the guards pass" as clearance.
10. **C7's `You type: oatmeal` line must not be an `<input>`.** It looks like one. Rail 15 plus
    the fake-screenshot ban: static text, non-focusable, no caret. Survives even though C7 is
    dead, because its comparison is a candidate organ.
11. **Contenders are paper, not code**, by the prompt's scope choice. If live variants are ever
    wanted, ship each as a route under `/lab/v1..v7` in a git worktree and score screenshots.
    Much slower, much more honest.
12. **Only ever run one `next dev`.** Multiple servers over one `.next` cause `ChunkLoadError`
    reload loops. `pkill -9 -f "next-server"; rm -rf .next; npm run dev`.
13. **`~/.claude/skills/gstack/` does not exist on this machine.** All gstack helper commands
    silently no-op. Use Playwright from the repo's own `node_modules`.
14. **The claims guards are the authority, not caution** (§4.4).
15. **Phase 6's per-dimension means are sound; two of its narrative conclusions were not.** The
    7×7 matrix and winner table reproduce exactly; the as-written weights claim and the
    comparative-confidence inventory did not. Treat other unchecked narrative inferences in
    `phase-6.md` with the same care.
16. **C6 survives on the owner's weights.** It holds four of the five sub-5 dimension means
    among the living and the board's lowest Honesty at 5.33. **Treat it as a source of two
    paragraphs, not of structure** — `Blank days are just blank.` promoted out of grid cell
    nine, and the cancel paragraph at equal weight to the price ending *"We know why you are
    reading this paragraph carefully."*

---

## 12. What must be done next

### Phase 8 — Section 13 · Synthesise ONE winner **(the next task)**

Pick a spine — **the numbers say C3, and say why it won.** Name every graft and what it
displaced. Name every high-scoring idea deliberately rejected and why. Deliver in the full
12-part structure at ship quality with a **verbatim, paste-ready copy deck**. Do not force
diversity: C3 dominates on floors rather than peaks, so graft sparingly.

**Six things Phase 8 must handle explicitly, not skip:**

1. **C3 wins under both weightings** (§8.2). The rebalance chose which of C5 and C6 died.
2. **Resolve the 2,580px desert.** Honour or explicitly overrule the 3/7 refusal to put a
   button under the clarifying-question block (§9.6). Do not leave it silently.
3. **Move scope into the H1** without breaking C3's deictic pointer — `This is the whole
   screen.` only works because the thing it points at is genuinely the product.
4. **C7's comparison is deferred behind C5's reachability rule** if both cannot fit in block 3.
   If it does fit, the no-fabricated-competitor-output refusal is non-severable.
5. **The sources paragraphs land in C3's block 4**, under the `Illustrated examples.` note.
6. **All three organs land in C3's first 2,400px and it does not have room for all three at
   natural size.** This is a triage, not a transplant list.

Also outstanding for Phase 8 to settle: **the second typeface** (5 keep / 2 kill, a real trade)
and **the card radius** (no convergence; the winner is a mover with no mandate).

### Phase 9 — Section 14 · Red-team

P7: what is the most generic thing that survived, what is the weakest section, what would the
top Product Hunt comment be. P4: walk all 15 rails line by line against the final copy deck,
check every claim against `evidence-pack.md` and **every string against `copy-ledger.md`**, and
**rule on the comparative-confidence family** — two questions, not one: the scale question
(does an approved sentence license a section?) and the quantifier escalation (`Most` → `Every`,
a one-word fix). P6: where do I feel judged, where do I feel managed, where do I stop reading,
do I feel better or worse than when I arrived. Fix in place, show the fixes, record unfixable
findings as trade-offs.

Also for Phase 9: **the FAQ JSON-LD / visible-answer mismatch**, flagged independently by all
three contenders that deleted the accordion.

### Phase 10A — Section 15 · `docs/plans/landing-tournament-winner-spec.md`

Build-ready. Ban vague phrases: say `padding: clamp(52px, 7vw, 104px)`, say `17px / 1.65`, name
the token. Include C4's `--text-soft`-banned-by-block rule and C3's press-feedback spec.

### Phase 10B — Section 16 · Rewrite `DESIGN.md`

Carry the Phase 3 verdicts **and** the contested-item votes (§6). Every surviving rule states
its derivation in one sentence. Scar tissue names its test file instead of retelling its
incident. Accidents gone — including the "for content pages" scope clause. The §10.3 banned
list becomes explicit. **Rewrite rail 7** (§10.4). Must be **shorter and more load-bearing**
than 361 lines; report before/after and what was cut. Still a design SYSTEM — app shell,
tokens, motion, icons, voice carry forward, re-derived. Snapshot the old version first.

### Phase 10C — Section 17 · `docs/plans/landing-tournament-implementation-plan.md`

Section-by-section diff against `app/page.tsx` with line ranges · the `.landing-*` CSS changes
· which tests break and why · which strings need `copy-ledger.md` rows · ordered
smallest-shippable-first work items, each independently revertible · what must NOT change plus
the test that catches it. **Adopt C5's two missing-test items regardless of who wins.**
**Requires a green `npm test` baseline first** (§1).

### Section 18 · Decision memo

Winner + the one sentence why · what the tournament proved that was NOT obvious (§9 is the raw
material) · what the current page already had right, specifically and generously · the three
highest-leverage changes by impact-per-hour · what in `DESIGN.md` was scar tissue and never
should have been a design rule · the single biggest shipping risk · what only real visitors can
settle, being honest about which disagreements are genuinely empirical.

---

## 13. Next session prompt

**Superseded.** Phase 9 is complete. The current prompt is §11 of
`docs/handoff/2026-08-05-landing-tournament-phase-9-red-team-handoff.md` and it starts Phase 10A.
The Phase 9 prompt below is kept for the record only — note that its instruction to "rule on the
comparative-confidence family" is **discharged**, and that its premise (an approved ledger row at
the bottom of the escalation ladder) was **false**.

### Superseded — the Phase 9 prompt, kept for the record

> Continue the Revora landing design & copy tournament. Read
> `docs/handoff/2026-08-05-landing-tournament-master-handoff.md` first, then
> **`docs/plans/landing-tournament-phase-8.md` in full — it is the winner and it supersedes
> this handoff wherever they disagree.** Open `docs/plans/landing-tournament-phase-7.md` for
> the kill rulings and `docs/plans/landing-tournament-phases-4-5.md` only for a specific
> contender detail.
>
> **State:** Phases 0–8 are complete. The winner is C3's spine plus C4's scope-in-the-H1 and
> C5's reachability rule; C7's comparison is rejected; the second typeface is kept; the card
> radius is inherited from the product, not chosen by the landing. **Do not re-score, do not
> rebuild the contenders, do not re-run the kill round, do not re-open the two settled
> no-convergence items, and do not re-synthesise the winner.**
>
> **Do next: Phase 9 — Section 14, the red-team.** P7: the most generic surviving thing, the
> weakest section, the top Product Hunt comment. P4: all 15 rails line by line against the
> Phase 8 copy deck, every claim against `evidence-pack.md`, **every string against
> `copy-ledger.md`**, and **rule on the comparative-confidence family — two questions, the
> scale question and the `Most` → `Every` quantifier escalation.** P6: where do I feel judged,
> where managed, where do I stop reading, do I feel better or worse than when I arrived. Fix in
> place, show the fixes, record unfixable findings as trade-offs. **Phase 8 §13.6 lists six
> specific things Phase 9 owes — start there.** Note that the FAQ JSON-LD mismatch does not
> exist on the winner; confirm rather than assume.
>
> Invoke and hold before starting: `impeccable`, `iui-ux-pro-max`, `taste-skill:taste-skill`,
> `apple-design`, `emil-design-eng`, `icopywriting`, `icro`. Rails: light surface only, no dark
> bands. Every number from the live fact table in §4.3. Tier A pins inviolable. Do not give the
> Clear card an adjustment. Do not resurrect the two rejected C6 headlines or the DPP
> statistic. Do not use workflows or dynamic subagent orchestration.
>
> **Separately, and before Phase 10:** `npm test` has not been run for five sessions
> (`pkill -9 -f "next-server"` first; ~26 minutes).

---

### Superseded — the Phase 8 prompt, kept for the record

> Continue the Revora landing design & copy tournament. Read
> `docs/handoff/2026-08-05-landing-tournament-master-handoff.md` first — it is the
> consolidated state of Phases 0–7 and it carries everything you need. Then read
> `docs/plans/landing-tournament-phase-7.md` for the kill rulings and organ assignments in
> full, and `docs/plans/landing-tournament-phases-4-5.md` for C3's complete entry (the spine)
> plus any contender whose detail you need for a graft. `docs/plans/landing-tournament-phase-6.md`
> has the 42 scorecards; open it only for a specific justification.
>
> **State:** Phases 0–7 are complete. C5, C4 and C7 are dead, their organs are extracted and
> assigned, the research disclosure is ruled on, and twenty-seven convergences are recorded.
> **Do not re-score, do not rebuild the contenders, do not re-run the kill round, do not
> re-derive the convergences, and do not re-read the whole codebase.**
>
> **Ranking:** C3 71.83 · C1 68.00 · C2 66.83 · C6 65.37 · C5 62.20 ☠ · C4 61.43 ☠ ·
> C7 59.00 ☠. C3 also wins under the as-written weights (70.72); the owner's rebalance chose
> which of C5 and C6 died, not who won.
>
> **Do next: Phase 8 — Section 13.** Synthesise ONE winner on the C3 spine, in the full
> 12-part structure, at ship quality, with a verbatim paste-ready copy deck. Name every graft
> and what it displaced; name every high-scoring idea deliberately rejected and why. Stop
> after Section 13 and checkpoint before the red-team.
>
> **Six things Phase 8 must handle explicitly:**
> 1. Say plainly that C3 wins under both weightings.
> 2. **Resolve C3's 2,580px CTA desert.** Honour or explicitly overrule the 3/7 refusal to put
>    a button under the clarifying-question block. Do not leave it silently.
> 3. **Move scope into the H1** (C4's organ) without breaking C3's deictic pointer.
> 4. **C7's comparison is deferred behind C5's reachability rule** if both cannot fit in block
>    3; if it does fit, the no-fabricated-competitor-output refusal is non-severable.
> 5. **The sources paragraphs land in block 4**, under the `Illustrated examples.` note.
> 6. **Graft sparingly.** All three organs land in C3's first 2,400px and it does not have
>    room for all three at natural size. This is a triage.
>
> Also settle the two items with no convergence behind them: the second typeface (5 keep / 2
> kill) and the card radius (C3 proposes 12px with no mandate).
>
> Invoke and hold these skills before starting: `impeccable`, `iui-ux-pro-max`,
> `taste-skill:taste-skill`, `apple-design`, `emil-design-eng`, `icopywriting`, `icro`.
>
> Rails: light surface only, no dark bands (owner instruction). Every number comes from the
> live fact table in the master handoff §4.3. Tier A pins are inviolable; Tier B pins may be
> retired only with a named reason and a scheduled test edit. Do not give the Clear card an
> adjustment. Do not resurrect the two rejected C6 headlines or the DPP statistic. **Do not
> rule on the comparative-confidence family — that is Phase 9's.** Do not use workflows or
> dynamic subagent orchestration.
>
> **Separately, and before Phase 10:** `npm test` has not been run for four sessions. Last
> green suite is 2,165 passed / 0 failed / 2 skipped at `bf714e9`. Kill any `next dev` first
> (`pkill -9 -f "next-server"`), then run it — Phase 10C's breakage predictions are worthless
> against an unverified baseline. ~26 minutes on an idle machine.

---

## 14. Document index

| File | What it holds |
|---|---|
| `docs/handoff/2026-08-05-landing-tournament-master-handoff.md` | **This file.** Consolidated state of Phases 0–7. |
| `docs/handoff/2026-08-05-landing-tournament-phase-8-winner-synthesis-handoff.md` | **Session handoff for Phase 8.** The winner, the five code findings, the graft table, the settled items, what Phase 9 and Phase 10 owe, and the paste-ready Phase 9 prompt. **Read this before this file.** |
| `docs/plans/landing-tournament-phases-4-5.md` | Sections 7–8: the pin ruling, the seven personas, the seven contenders in the 12-part structure with verbatim copy decks. 2,383 lines. |
| `docs/plans/landing-tournament-phase-6.md` | Sections 9–10: 42 cross-scorecards, the 7×7 matrix, the per-dimension winner table, the ranked scoreboard, eight disagreement rulings, five unanimities. 1,096 lines. |
| `docs/plans/landing-tournament-phase-7.md` | Sections 11–12: two corrections to Phase 6, the kill round, the banned list, the three organs, the research-disclosure ruling, twenty-seven convergences, eleven lone ideas. |
| `docs/plans/landing-tournament-phase-8.md` | **Section 13: the winner.** Five code findings, the graft table, C7's comparison rejected, the two no-convergence items settled, the 12-part spec with a verbatim copy deck, thirteen rejected ideas, six items for Phase 9. |
| `docs/plans/landing-tournament-phase-9.md` | **Section 14: the red-team.** Three falsified premises, the comparative-confidence ruling, ten fixes, four trade-offs, the corrected rail and pin ledgers, what Phase 10 inherits. **Supersedes Phase 8 and this file where they disagree.** |
| `docs/handoff/2026-08-05-landing-tournament-phase-9-red-team-handoff.md` | **Session handoff for Phase 9.** The state of play and the paste-ready Phase 10A prompt. **Read before this file.** |
| `docs/prompts/2026-08-04-landing-design-and-copy-tournament.md` | The master prompt. |
| `…phases-0-3-handoff.md` · `…phases-4-5-handoff.md` · `…phase-6-handoff.md` · `…phase-7-handoff.md` | Phase-scoped handoffs, superseded by this file for everything but deep detail. |

**Not yet written:** `docs/plans/landing-tournament-winner-spec.md` (10A) ·
`docs/plans/landing-tournament-implementation-plan.md` (10C) · the `DESIGN.md` rewrite (10B).

---

**Session ends here.** No code changed. No commits. No `DESIGN.md` edits. `npm test` not run.
