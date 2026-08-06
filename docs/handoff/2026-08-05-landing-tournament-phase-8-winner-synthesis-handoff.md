# SESSION HANDOFF — Revora landing tournament, Phase 8 (the winner) complete

**Date:** 2026-08-05
**Branch:** `fix/landing-followups` (HEAD `8c4c0e9`, unchanged since the tournament began)
**Scope:** the marketing landing `/` only — `app/page.tsx`, the `.landing-*` layer of
`app/globals.css`, `components/demo-check-card.tsx`, and `DESIGN.md` (on trial).
**This session:** Phase 8 / Section 13 — synthesised ONE winner from the seven contenders.
**Status:** **8 of 10 phases done. 13 of 18 sections written. Phase 9 (red-team) is next.**
**Code changed: none. Commits: none. `npm test`: not run for five sessions.**

---

## 0. Read order for the next session

| Read | File | Why |
|---|---|---|
| **1st** | `docs/handoff/2026-08-05-landing-tournament-phase-8-winner-synthesis-handoff.md` | **This file.** The state of play. |
| **2nd** | `docs/plans/landing-tournament-phase-8.md` | **The winner, in full.** 831 lines. Verbatim copy deck, 12-part spec, five code findings, thirteen rejected ideas. **Supersedes the master handoff wherever they disagree.** |
| 3rd | `docs/handoff/2026-08-05-landing-tournament-master-handoff.md` | Consolidated Phases 0–7: the Brief, the constraint ledger, the live fact table, the pin ruling, the scoring, the traps. |
| as needed | `docs/plans/landing-tournament-phase-7.md` | Kill rulings, organ assignments, the banned list, 27 convergences. |
| as needed | `docs/plans/landing-tournament-phases-4-5.md` | The seven contenders in full. Open only for a specific graft detail. |
| rarely | `docs/plans/landing-tournament-phase-6.md` | The 42 scorecards. Open only for a specific justification. |

**Do not** re-score, rebuild contenders, re-run the kill round, re-derive the convergences,
re-open the two settled no-convergence items, or re-synthesise the winner.

---

## 1. What this session did

Held all seven binding skills (`impeccable`, `iui-ux-pro-max`, `taste-skill:taste-skill`,
`apple-design`, `emil-design-eng`, `icopywriting`, `icro`), read the tournament record, then
**read the four repository files the winner's spine actually depends on** — `app/globals.css`,
`app/fonts.ts`, `components/demo-check-card.tsx`, `components/disclaimer-line.tsx` — because
the tournament had run entirely on paper by design (trap 11) and no contender's specification
had ever been checked against the code it described.

That check changed four decisions. Output: `docs/plans/landing-tournament-phase-8.md`,
Section 13, in the mandatory 12-part contender structure, at ship quality, with a verbatim
paste-ready copy deck.

---

## 2. The winner — `W — One Card Back`

**Spine: C3 (P3, The Design Engineer).** Name inherited deliberately: roughly 90% of the page
is C3 unchanged, and renaming would imply a synthesis that did not happen.

**Thesis.** The page's unit of composition is the product's own artifact — the result card,
rendered in the live classes at three moments of doubt — with whitespace doing the sectioning,
**the headline saying who it is for**, and one earned piece of motion carrying the only idea on
the page that is temporal.

The one clause that changed from C3 is *the headline says who it is for*. Everything the
tournament did to C3 is contained in that clause and in one text link.

### 2.1 Section map

| # | Block | Purpose | 375px height | Exit at y ≈ |
|---|---|---|---|---|
| 1 | Nav + hero | Who it is for, and the artifact at its calmest | ~1,020px | 720 (filled) |
| 2 | The gap | Why you are here | ~1,120px | 2,080 (filled) |
| 3 | **The pause** | `<DemoCheckCard />`, the one motion, the dare | ~1,400px | 3,470 (**text link**) |
| 4 | Three answers | The card at three verdicts, then where the reasoning comes from | ~1,520px | 4,820 (filled) |
| 5 | The offer | Price, funnel, cancel, four remaining claims | ~1,270px | 6,270 (filled) |
| 6 | Close + Fair questions | Final exit, then the FAQ | ~740px | 6,520 (filled) |
| — | Footer | Nav + disclaimer | ~130px | — |

**6 blocks + footer · ~7,200px · 10.8 screens · six exits · longest desert 1,450px.**

### 2.2 Headline numbers against the incumbent

| | Incumbent | Winner |
|---|---|---|
| Content blocks | 13 | **6** |
| 375px length | 12,942px · 19.4 screens | **~7,200px · 10.8 screens** |
| Longest CTA desert | 5,090px | **1,450px** |
| Card families | 8 | **2** |
| Eyebrows | 4 | **0** |
| Background planes | 3 + hairline | **1** |
| Rendered em dashes | 42 | **4 strings, all unstrippable** |
| Rails with tests | 8 of 15 | **10 of 15** (targets + reduced-motion adopted) |

---

## 3. The six mandated items, and how each was answered

1. **C3 wins under both weightings.** 71.83 rebalanced, 70.72 as-written. Stated plainly. The
   rebalance widened its lead over C1 and decided which of C5 and C6 died. It did not choose
   the winner.

2. **The 2,580px desert is resolved: 1,450px.** The 3/7 refusal to put a button under the
   clarifying-question block is **honoured, not overruled** — the refusal convicts a *pill*,
   not an *exit*. Block 3 gets a text link carrying the falsifiable dare
   `Type "oatmeal" and see what it asks you.` (C1's and C7's line). It does not say *press this
   instead of thinking*; it says *go falsify what I just told you*, which continues the block's
   argument rather than contradicting it, and it is free and checkable in ten seconds.

3. **Scope moves into the H1 without breaking the deictic pointer.**
   **H1: `A meal checker built only for prediabetes.`** — the eyebrow's own seven words, at
   headline size, already-shipped copy, zero new claim exposure. `only` does C4's
   market-shrinking (Category 8.67) **without** the second sentence that killed C4 (Emo 2.83).
   **`This is the whole screen.` survives verbatim** and moves to the caption directly beneath
   the card it points at — a shorter pointer, not a broken one. The eyebrow is then deleted
   because its content is stated once, larger. **This is de-duplication, not C7's
   delete-on-principle**, and the distinction is recorded so this page is not read as
   vindicating C7's unanimous Category 3.00. Deleting it buys ~40px, which pulls the caption's
   first line to the fold.

4. **C7's comparison is REJECTED**, on three reasons in order of force:
   - the ruled tiebreak (§11.5.3) — C5's organ has precedence, and the comparison pushes the
     desert past 3,000px;
   - **spine incompatibility**, which the tiebreak did not need to say: C3's organising rule is
     *every claim is attached to a rendered object*, and the comparison's left column has **no
     object** by its own non-severable refusal. On this spine that is a one-line claim by
     construction — and the one line already exists in block 3's caption;
   - Phase 9 has not ruled on the claim family, and building a heading-level block on an
     uncleared claim is the wrong order of operations.

   **What IS taken from C7:** the `border-top`-on-the-block-not-an-`<hr>` rider, the 2px focus
   offset, and the dare. If Phase 9 clears the claim family, the comparison becomes a candidate
   for a **separate later work item, not a retrofit** — reason 2 does not depend on the claim
   question.

5. **The sources paragraphs land in block 4**, attached to the three verdict cards. **One
   deviation from §11.6's letter, argued:** they sit *after* the block's CTA. Two reasons — it
   is the 180px that keeps the worst stretch at 1,450px instead of 1,530px, and provenance
   placed immediately *before* a CTA is the same credential-adjacency §11.6 was avoiding when
   it kept them out of the offer block. C4's copy, verbatim, unchanged.

6. **Grafted sparingly.** Two organs grafted, **one returned unused**, plus two C6 paragraphs
   and four separable ideas. Everything else is C3.

---

## 4. Five findings read out of the code — the substance of this session

The tournament ran on paper. These are what the code actually says.

### Finding 1 — C3's radius/border delta was measured against the wrong card ⚠ CHANGES A DECISION

```
.surface-card { border: 2px solid var(--border-soft);   border-radius: 24px;
                box-shadow: 0 18px 40px rgba(15,23,42,0.08); }   /* globals.css L115–120 */
.result-card  { border: 2px solid var(--border-strong); border-radius: 22px; }  /* L626–632 */
```

C3 proposed **radius 24 → 12px** and **border 2px `--border-soft` → 1.5px**, arguing that 24px
on "a card containing four stacked typographic rows" reads as a consumer-app tile. But that
card is `.result-card`, and it is **22px with a `--border-strong` edge**. The 24px/`--border-soft`
recipe belongs to `.surface-card` and to the seven `.landing-*` families C3 was deleting.
**C3 measured the families it was cutting and applied the number to the card it was keeping.**

This collides with C3's own spine: *every card renders in the live classes, so if the product's
card drifts the landing drifts with it.* Changing the radius on the landing requires
`.landing .result-card { border-radius: 12px }` — at which point the landing is showing a
landing card wearing the product's class names.

**Ruling: the landing stops choosing radii.** Contested #2 settles at *the product's recipe,
unchanged.* The shape rule, stated once so it can be checked: **outer surfaces 24px, result
cards 22px, the CTA pill 999px, and the landing chooses none of them.** C3's craft instinct is
redirected, not discarded: if 24px is wrong it is wrong in `/check` too, where the card is seen
daily rather than once — **recommend a product-level radius work item and let the landing
inherit it.**

### Finding 2 — the demo card is a nested card, and the fix is out of scope

`components/demo-check-card.tsx` renders `<section className="surface-card hero-card">`
containing two `<div className="result-card">`. A 24px card containing two 22px cards.
`DESIGN.md` §App-UI guardrails bans nested cards, `impeccable` says nested cards are always
wrong, and `globals.css` L1858 carries a comment claiming the nesting went with the phone bezel
— it did not.

On the incumbent this sits mid-page. **On the winner it is block 3, full width.**

`DemoCheckCard` is imported by **three** routes (`app/page.tsx`, `app/(app)/check/page.tsx`,
`app/(app)/demo/page.tsx`), so removing the wrapper is a **product** change, not a landing one.
**Named, not fixed. Handed to Phase 10C as its own revertible work item.**

### Finding 3 — one of the two one-family proposals was audited against the wrong pin ⚠ CHANGES A DECISION

`app/fonts.ts` documents *why* the second family exists, and it is not taste: *"Plus Jakarta
Sans … is a geometric sans, and geometric sans at 14–15px is the wrong tool for paragraphs read
by 40–60-year-olds on a phone. Source Sans 3 has a larger x-height and open apertures … the
pairing is deliberate contrast (geometric display + humanist text), not two fonts doing the same
job."*

Three consequences:
- **`reading` IS Source Sans 3**, and `reading.className` on the landing root is a **Tier A
  pin** (FINDING-030). C2 and C7 both recorded *"Tier A: all nine pass"* without addressing it.
  A one-family page keeps the pin only by aliasing `reading` to Jakarta, which preserves the
  letter and empties it. Neither said so.
- **`impeccable`'s pairing rule supports this pairing.** It bans *similar-but-not-identical*
  pairs and prescribes pairing *on a contrast axis*. Geometric display + humanist text is that
  axis.
- `reading` is imported only by `app/page.tsx`, so C2's perf claim is accurate: one
  `@font-face`, one preload, one route.

**Ruling: Contested #1 settles at KEEP.** C2's *separable* win is taken in full: **one body
size, 17px / 1.65**, replacing the inherited 16.5–17px range (5/7 convergence).

### Finding 4 — the 16px fineprint floor holds by source order, not specificity

```
.result-disclaimer                   { font-size: 14px; }   /* L209–214 */
.result-fineprint .result-disclaimer { font-size: 13px; }   /* L778–780 */
```

C3's `.landing .result-disclaimer { font-size: 16px }` has **identical specificity** (0,2,0) to
the L778 rule. It wins only because it is later in the file. Correct, fragile, and the same
class of hazard as the 2026-07-29 override-block incident. The Tier A duplicate-`font-size` pin
does not catch it. **Phase 10A must comment the ordering dependency; Phase 10C must not move
the block.**

### Finding 5 — the block-3 caption would duplicate a label the component computes

`demoExampleEyebrow()` (AUD-008) renders `An illustrated example` **inside** the demo card and
swaps it to `A real check, captured <date>` the moment a live capture is authorised. C3's
block-3 caption opened with the same words in hand-typed prose, which **cannot track AUD-008**.
**The caption drops the label.** Block 4's `Illustrated examples.` note stays — those cards are
ledger fixtures and nothing computes a label for them.

---

## 5. The grafts, and what each displaced

| From | Organ | Verdict | Displaced |
|---|---|---|---|
| **C4** | Scope in the H1 at headline size | **GRAFTED** | C3's H1 (relocated verbatim to the card caption) **and the eyebrow** |
| **C5** | The reachability rule, without the bar | **GRAFTED**, restated | nothing — block 3 gains an exit it did not have |
| **C7** | The two-column behaviour comparison | **REJECTED** | — |
| **C7** | `border-top` on the block, not `<hr>`; 2px focus offset | **GRAFTED** (rider) | the `<hr>` |
| **C7 / C1** | `Type "oatmeal" and see what it asks you.` | **GRAFTED** | nothing — it is the desert fix |
| **C6** | `Blank days are just blank.` | **GRAFTED** | half of C3's fourth offer claim |
| **C6** | The cancel paragraph at equal weight to the price | **GRAFTED** | nothing (+90px) |
| **C4** | `--text-soft` banned by block | **GRAFTED** | review-time judgment |
| **C2** | One body size, 17px / 1.65 | **GRAFTED** | C3's 16.5–17px range |
| **C5** | 44/48px target test · `prefers-reduced-motion` test | **ADOPTED** | two prose-only rails |

### C5's rule could not be taken literally — and why that matters

*No stretch longer than one viewport (667px) may lack a reachable primary action* means
**eleven exits** on a 7,200px page, and there is exactly one way to get eleven exits without
eleven CTAs: a fixed element. **C5's rule entails C5's bar** — the object six judges convicted.

Restated at the level it holds, with the threshold taken from the tournament's own data:

> **No stretch may exceed 1,460px at 375px — the shortest longest-desert any contender achieved
> without a fixed element (C1, the IA winner). Deserts are measured in pixels, at 375px, and
> reported in the spec.**

The measurement discipline — the half of C5's organ that costs nothing and that nobody else did
— carries in full.

**Desert map:** 1,360 · 1,390 · 1,350 · **1,450** · 250. Ten pixels of margin on the worst
stretch. **If Phase 10A's browser measurement pushes it over, the remedy is to move block 4's
sources paragraphs below the CTA (recovers 180px) — NOT to delete them and NOT to add a second
filled CTA to block 4.** Recorded so it is not re-litigated at implementation time.

---

## 6. The two no-convergence items, settled

| Item | Prior state | Settled | On what |
|---|---|---|---|
| **Contested #1 — second typeface** | 5 keep / 2 kill, "a real trade" | **KEEP** | Finding 3, not the vote. Documented ICP legibility rationale in code; the contrast axis `impeccable` prescribes; a Tier A pin neither killer audited. C2's separable win (one body size) taken. |
| **Contested #2 — card radius** | no convergence; winner was a mover with no mandate | **INHERITED — the landing chooses none** | Finding 1. C3's 12px and C7's 0px both rejected; 24/22/999 is the product's rule, followed everywhere, which satisfies `taste-skill`'s Shape Consistency Lock. |

---

## 7. Thirteen high-scoring ideas rejected, on the record

Full table with scores and reasons in `landing-tournament-phase-8.md` §13.5. Summary:

1. C7's comparison (Belief 8.00, Craft 8.00) — three reasons, §13.2.
2. C5's fixed bar (Legibility 9.33) — convicted 6/6 on Craft.
3. C4's `If yours isn't in it, this isn't for you.` (part of Honesty 9.17) — Emo 2.83, fatal.
4. C4's scope card as the hero visual (Category 8.67) — displaces the result card, the spine.
5. C4's `Four things Revora will not do` block — four claims with no rendered object; the best
   one survives as block 4's lede.
6. C6's narrative structure (Voice 8.50, Emo 8.83) — §11.7.3; two paragraphs grafted, not the
   page.
7. C6's dropping the `Hold off` card — block 4's demonstration is *the same card, three times*.
8. C2's one-family type system (Legibility 8.83, the only perf win) — Finding 3.
9. C5's rendered ranking numerals — §12.5 standing ruling; the ordering survives.
10. C7's radius 0 — Finding 1.
11. C7's eyebrow deletion *as a principle* — the eyebrow is deleted here for the opposite
    reason; recorded so this page is not read as vindicating it.
12. C2's `clamp(96px, 14vw, 176px)` padding — correct for a type-only page; taken at C6's
    `clamp(72px, 10vw, 128px)`.
13. **C3's own 12px radius and 1.5px border** — rejected on the spine's own logic.

---

## 8. The winner's own failure modes, as written

- **~3,000px of informational surface is gone** with the feature grid and how-it-works block. If
  visitors were converting off feature #7 of nine, this page will never report a loss that
  specific.
- **The 520ms pause is still misreadable as slowness.** The dare link answers C7's *rhetorical*
  objection (re-enactment vs evidence); it does not answer the perceptual one.
- **NEW, and this synthesis's own:** the winner's strongest claim is now *the landing shows the
  product's card, unmodified* — and that is true only while nobody adds a landing-scoped
  override. `promise-registry.test.ts` pins the demo's **strings**; nothing pins its **recipe**.
  **Phase 10C should consider a test that fails when a `.landing*` selector declares
  `border-radius` or `border` on `.result-card` or `.surface-card`** — the same shape as the
  existing duplicate-`font-size` guard, on the property the page's honesty now rests on.

---

## 9. What Phase 9 owes (Section 14 — the red-team)

**Two items inherited from Phase 7, four added by Phase 8** (full text in §13.6).

Inherited:
- **The comparative-confidence family — two questions**: the scale question (does an approved
  *sentence* license a *section*?) and the `Most` → `Every` quantifier escalation (a one-word
  fix). **The winner has NOT ruled on it** — it takes the most conservative rung available (the
  approved row's own hedged quantifier, at sentence scale, once, in a block-3 caption). If
  Phase 9 rules the family unavailable at any scale, **that one caption is the only string that
  changes.**
- **The FAQ JSON-LD / visible-answer mismatch. The winner does not have the defect** — the four
  `<details>` render their answers below the last CTA, so schema and page agree. Confirm rather
  than assume, and note that the FAQ *placement* is what discharged it.

Added by Phase 8:
1. **P7's question, pre-answered where possible.** The most generic surviving structure is the
   three price tiles (contested 4/7, not banned). They survive because live-flag pricing is the
   page's strongest structural honesty guarantee and tiles are the shape it renders in.
   **Decide whether that is a reason or an excuse.**
2. **P6's question, at one specific place.** Block 2 is 1,120px of what is wrong with the
   reader's life. The answer to *will this make me feel worse* is above it (the hero Clear card,
   `This is the whole screen.`) and below it (block 3's *it would rather ask than guess*).
   **Read block 2 cold and say whether the sandwich holds.**
3. **Four of the five cards on the page are copy, not output.** Only the demo is pinned by
   `promise-registry.test.ts`; the hero Clear card and block 4's three cards are ledger rows
   labelled `Illustrated example`. **P4 should walk them against `copy-ledger.md` string by
   string.**
4. **Finding 2 is a live `DESIGN.md` contradiction.** Phase 9 need not solve it; **Phase 10B
   must not restate a nested-card ban the product's most-photographed component breaks.**

Phase 9's standard scope also stands: P7 (most generic thing, weakest section, top Product Hunt
comment), P4 (all 15 rails line by line against the copy deck, every claim against
`evidence-pack.md`, **every string against `copy-ledger.md`**), P6 (where judged, where managed,
where I stop reading, better or worse than when I arrived). Fix in place, show the fixes, record
unfixable findings as trade-offs.

---

## 10. What Phase 10 owes (unchanged, plus this session's additions)

**10A — `docs/plans/landing-tournament-winner-spec.md`.** Build-ready, no vague phrases. Must
include: the H1 clamp `clamp(1.9rem, 5.6vw, 2.9rem)` · body `17px / 1.65` · measure `62ch` ·
section padding `clamp(72px, 10vw, 128px)` · press `translateY(1px) scale(0.98)` at 120ms
`cubic-bezier(0.23, 1, 0.32, 1)` on pointer-down · the 2px focus offset · `--text-soft` banned
by block in 1/2/3/5 · **the Finding 4 source-order comment on the `.landing .result-disclaimer`
rule** · `text-wrap: balance` on h1–h3, `pretty` on prose.

**10B — rewrite `DESIGN.md`.** Snapshot first: `git show HEAD:DESIGN.md > /tmp/design-before.md`.
Carry the Phase 3 verdicts and the contested-item votes. **Rewrite rail 7** — its purpose is now
discharged *structurally* (no stat-strip affordance exists to put a number in), not by deletion.
The §10.3 banned list becomes explicit. Must be shorter and more load-bearing than 361 lines;
report before/after and what was cut. **Do not restate the nested-card ban without addressing
Finding 2.**

**10C — `docs/plans/landing-tournament-implementation-plan.md`.** Section-by-section diff
against `app/page.tsx` with line ranges, the `.landing-*` CSS changes, which tests break and
why, which strings need `copy-ledger.md` rows, ordered smallest-shippable-first, each
independently revertible. **Requires a green `npm test` baseline first.** New items from this
session:
- delete the `.landing-proof-band` selector block; two ledger rows for the sources paragraphs;
- rename `.landing-phone` → `.landing-hero-proof`;
- retire three Tier B pins with test edits in the same work item (see §11 below);
- **adopt C5's two tests** (44/48px targets, `prefers-reduced-motion`);
- **consider the card-recipe-override guard test** (§8);
- **separate product-level work item:** un-nest `DemoCheckCard` (Finding 2, three routes);
- **separate product-level work item (recommendation only):** the `.result-card` radius.
- consider extracting an `<ExampleResultCard>` presentational component so the landing's four
  example cards cannot drift from `.result-card`'s anatomy by hand-editing.

**Section 18 — decision memo.** Winner + the one sentence why · what the tournament proved that
was not obvious · what the incumbent already had right · the three highest-leverage changes by
impact-per-hour · what in `DESIGN.md` was scar tissue · the single biggest shipping risk · what
only real visitors can settle.

---

## 11. Pin ledger for the winner (binding)

**Tier A — all nine pass.** `TASTER_LIMIT` interpolated · `{monthlyPrice}` from
`resolvePriceVariant()` · both `paywallMode()` branches present · `RISK_LABELS` interpolated ·
`<DemoCheckCard />` rendered and the three interaction strings never retyped ·
**`reading.className` on the landing root — Contested #1 was settled partly to keep this
honest** · no `.landing*` selector declares `font-size` twice · banned source phrases stay
banned · trial mode renders no daily free-check claim and legacy mode does.

**Tier B — three retired, each with reason and scheduled test edit:**
1. `Two ways in.` / `Three ways in.` — how-it-works block deleted (7/7).
   → `landing-wiring-pins.test.ts`.
2. `Dictate it or type it.` — same block, same reason. → `landing-wiring-pins.test.ts`.
3. `{TASTER_LIMIT} free checks on day one` — no pricing lede; the H2 carries the number.
   → `copy-pins.test.ts`.

**Kept:** `Check up to {TASTER_LIMIT} meals on your first day` ·
`Your first ${TASTER_LIMIT} checks, on your first day` · `7 days free` · `Days 2–8` ·
`A free account` · `still no card` · `A weekly recap in sentences` ·
`A record you can actually show someone` · `It asks before it guesses` ·
`Add to home screen — works today`.

**New ledger rows required (flagged, not assumed):** the hero Clear card's four rows · the hero
card caption · the block-3 caption and the dare link · the two sources paragraphs.

**Em dashes rendered: 4 strings, 5 characters, all four unstrippable** — the approved CTA, the
ledger trust-strip line, the `Add to home screen` pin, and the demo card's ledger result copy.

---

## 12. Traps that still apply

All sixteen from the master handoff §11 stand. The ones this session touched or sharpened:

1. **Skills bind.** Invoke and hold all seven before judging or editing the winner.
2. **`taste-skill` bans em dashes; the approved CTA contains one.** Do not strip it — that
   breaks `copy-pins` and the approved CTA.
3. **Rail 14 (light surface, no dark bands) is immutable this round.** Owner instruction.
4. **Do not give the Clear card an adjustment.** `assertNoUnsafeSafeFields` throws.
9. **The comparative-confidence family is OPEN.** Phase 9 rules. **The winner did not rule on
   it and must not be cited as having done so.** "The guards pass" is not clearance —
   `claims-boundary-copy.test.ts` checks disease-outcome claims, not third-party accuracy
   claims.
10. **C7's `You type: oatmeal` line must never be an `<input>`.** Static text, non-focusable, no
    caret — still true, since the demo card renders that line.
14. **The claims guards are the authority, not caution.** `npx vitest run tests/unit/revora/`
    (~80s) before assuming any copy is a compliance problem.
15. **Phase 6's per-dimension means are sound; two of its narrative conclusions were not.**
    Phase 8 adds a third class of caution: **the contenders' own specifications were never
    checked against the code.** Five discrepancies were found in the four files the winner
    depends on. Assume more exist in the files it does not.
16. **C6 survives on the owner's weights only.** Source of two paragraphs, not of structure.

Plus, new to this session: **only ever run one `next dev`** (`pkill -9 -f "next-server"`), and
`~/.claude/skills/gstack/` does not exist on this machine — use Playwright from the repo's own
`node_modules`.

---

## 13. Repo state

Nothing modified except markdown. No commits. No `DESIGN.md` edits.

Files written or changed this session:
- **new:** `docs/plans/landing-tournament-phase-8.md` (831 lines)
- **new:** `docs/handoff/2026-08-05-landing-tournament-phase-8-winner-synthesis-handoff.md`
  (this file)
- **edited:** `docs/handoff/2026-08-05-landing-tournament-master-handoff.md` — status block,
  phase table, document index, and a Phase 9 next-session prompt (the Phase 8 prompt is kept
  below it, marked superseded)

**`npm test` has not been run for five sessions.** Last recorded green suite:
**2,165 passed / 0 failed / 2 skipped at `bf714e9`**. This is the oldest open item on the board
and it blocks Phase 10C, whose breakage predictions are worthless against an unverified
baseline.

```
pkill -9 -f "next-server"   # concurrent dev servers cause false createTestDb 120s timeouts
npm test                    # ~26 minutes, needs an IDLE machine
```

---

## 14. Next session prompt — paste this

> Continue the Revora landing design & copy tournament. Read
> `docs/handoff/2026-08-05-landing-tournament-phase-8-winner-synthesis-handoff.md` first, then
> **`docs/plans/landing-tournament-phase-8.md` in full — it is the winner and it supersedes the
> master handoff wherever they disagree.** Read
> `docs/handoff/2026-08-05-landing-tournament-master-handoff.md` for the Brief, the constraint
> ledger, the live fact table and the pin ruling. Open
> `docs/plans/landing-tournament-phase-7.md` for the kill rulings and
> `docs/plans/landing-tournament-phases-4-5.md` only for a specific contender detail.
>
> **State:** Phases 0–8 are complete. The winner is `W — One Card Back`: C3's spine, plus C4's
> scope-in-the-H1 and C5's reachability rule, plus C7's `border-top`/focus-offset rider and its
> dare line, plus two C6 paragraphs and four separable ideas. **C7's comparison is rejected.
> The second typeface is kept. The card radius is inherited from the product, not chosen by the
> landing.** Longest desert 2,580px → 1,450px with the 3/7 no-button-under-the-pause refusal
> honoured. **Do not re-score, do not rebuild the contenders, do not re-run the kill round, do
> not re-derive the convergences, do not re-open the two settled no-convergence items, and do
> not re-synthesise the winner.**
>
> **Do next: Phase 9 — Section 14, the red-team.**
> **P7:** what is the most generic thing that survived, what is the weakest section, what would
> the top Product Hunt comment be.
> **P4:** walk all 15 rails line by line against the Phase 8 copy deck, check every claim
> against `evidence-pack.md` and **every string against `copy-ledger.md`**, and **rule on the
> comparative-confidence family — two questions, not one: the scale question (does an approved
> sentence license a section?) and the `Most` → `Every` quantifier escalation (a one-word
> fix).** The winner takes the most conservative rung and did NOT rule on it; if the family is
> unavailable at any scale, block 3's caption is the only string that changes.
> **P6:** where do I feel judged, where do I feel managed, where do I stop reading, do I feel
> better or worse than when I arrived.
> Fix in place, show the fixes, record unfixable findings as trade-offs.
>
> **Start from Phase 8 §13.6 — it lists six specific things Phase 9 owes**, including: the
> price tiles are the most generic surviving structure (decide whether live-flag honesty is a
> reason or an excuse); read block 2 cold and say whether the emotional sandwich holds; four of
> the five cards on the page are ledger copy rather than pinned output and need a string-by-string
> `copy-ledger.md` walk; and the FAQ JSON-LD mismatch **does not exist on the winner** — confirm
> that rather than assume it.
>
> Invoke and hold these skills before starting: `impeccable`, `iui-ux-pro-max`,
> `taste-skill:taste-skill`, `apple-design`, `emil-design-eng`, `icopywriting`, `icro`.
>
> Rails: light surface only, no dark bands (owner instruction). Every number comes from the live
> fact table in the master handoff §4.3. Tier A pins are inviolable; Tier B pins may be retired
> only with a named reason and a scheduled test edit. Do not give the Clear card an adjustment.
> Do not resurrect the two rejected C6 headlines or the DPP statistic. Do not use workflows or
> dynamic subagent orchestration. Do not treat "the guards pass" as claim clearance.
>
> Stop after Section 14 and checkpoint before Phase 10.
>
> **Separately, and before Phase 10:** `npm test` has not been run for five sessions. Last green
> suite is 2,165 passed / 0 failed / 2 skipped at `bf714e9`. Kill any `next dev` first
> (`pkill -9 -f "next-server"`), then run it — Phase 10C's breakage predictions are worthless
> against an unverified baseline. ~26 minutes on an idle machine.

---

**Session ends here.** No code changed. No commits. No `DESIGN.md` edits. `npm test` not run.
