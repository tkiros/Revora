# Session handoff — Landing design & copy tournament, Phases 0–3 complete

**Date:** 2026-08-04
**Branch:** `fix/landing-followups` (HEAD `8c4c0e9`)
**Scope:** the marketing landing `/` only — `app/page.tsx`, the `.landing-*` layer of
`app/globals.css`, `components/demo-check-card.tsx`, and `DESIGN.md` (on trial).
**Status:** **Analysis phases done. No code changed. No files written except this one.**
**Source prompt:** `docs/prompts/2026-08-04-landing-design-and-copy-tournament.md` (untracked)

---

## 0. What this is

A competitive elimination tournament to settle the landing page's design and copy from
first principles. Seven personas each build a complete contender, cross-score each other,
the weak ones are killed, and the survivors' best parts are grafted into one winner. The
output is intended to become the source of truth for future Revora design work.

`DESIGN.md` is a **defendant** in this process, not the referee. Every rule in it has to
re-derive itself or die.

**Ten phases, eighteen output sections.** Phases 0–3 (Sections 1–6) are complete and are
recorded below in full. Phases 4–10 (Sections 7–18) have not been started.

---

## 1. Repo state — read this first

Nothing was modified. `npm test` was **not** run this session; the last recorded green
full suite is 2165 passed / 0 failed / 2 skipped at `bf714e9`
(`docs/handoff/2026-07-28-landing-design-review-fixes-and-ship-session-handoff.md`).

Before Phase 5 produces contenders that will later be implemented, get `npm test` green so
Phase 10C's "which tests break" is a prediction rather than noise. It takes ~26 minutes and
needs an **idle** machine (concurrent dev servers cause false `createTestDb` 120s hook
timeouts — see the 2026-07-28 handoff §6.3).

`DESIGN.md` will be **rewritten, not patched**, in Phase 10B. Keep the current version
reachable: `git show HEAD:DESIGN.md > /tmp/design-before.md` before that phase starts.

---

## 2. Live facts — extracted from source, do not re-derive, do not retype

Every contender must interpolate these, never hardcode them.

| Fact | Live value | Source |
|---|---|---|
| `TASTER_LIMIT` | **10** | `lib/client/taster-store.ts:2` |
| `FREE_DAILY_CHECKS` | **5** — legacy funnel only; trial mode hard-walls free accounts at zero | `lib/free-tier.ts` |
| `FREE_HISTORY_DAYS` | 7 | `lib/free-tier.ts` |
| Trial | **7 days**, card required, $0 charged, pre-charge email at day 5 | `lib/server/pricing.ts`, ledger `precharge-email` |
| `paywallMode()` | **`"trial"`** by default | `lib/server/pricing.ts` |
| Monthly price | **$12.99** (`TRIAL_PRICE_VARIANT` unset → `"1299"`); ladder is $9.99 / $12.99 / $19.99 | `lib/server/pricing.ts` |
| Annual | $99.99/yr, $8.33/mo equivalent | `ANNUAL_PRICE` |
| Pantry Review | $49, one-time, non-renewing | ledger `pantry-landing-cta` |
| `RISK_LABELS` | **Clear · Be careful · Hold off** | `lib/revora/labels.ts` |
| `BOUNDARY_DISCLAIMER` | `Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you.` | `lib/revora/boundary-copy.ts` |
| `photoInputEnabled()` | **FALSE** — unset in `.env`, `.env.local`, `.env.example` | `lib/photo-input-flag.ts` |
| `learningJourneyUiEnabled()` | **FALSE** | `.env.example` blank |
| `longitudinalInsightsEnabled()` | **FALSE** | unset |
| A1C scope | 5.7%–6.4% | `docs/safety/claims-boundary.md` |

> **Consequence nobody had written down:** with the photo flag off, the shipped headline of
> section 4 is **"Two ways in. One calm answer out."** — and "two ways in" is *typing* and
> *talking*. Roughly 900px of page sells the two most ordinary input methods in software as
> the mechanism. Both prior handoffs discuss that section as if it renders "Three."

---

## 3. Constraint ledger — what actually holds the page

### 3.1 The fifteen hard rails, and which are real

| # | Rail | Enforced by | Real? |
|---|---|---|---|
| 1 | Revora never the agent of a health outcome | `claims-boundary-copy.test.ts` families `reverse/cure/treat/prevent/diagnose/future-claim`, glob over all `.tsx` in `app/` + `components/` | **TEST** |
| 2 | No fabricated ratings / users / testimonials | `claims-boundary-copy.test.ts` family `social-proof` | **TEST** (the "Illustrated examples" label itself is unpinned) |
| 3 | SAFE/MODERATE/HIGH never render as copy | `copy-pins.test.ts` RISK_LABELS walk, shrinking-only ALLOWLIST of 1 | **TEST** |
| 4 | Clear carries no adjustment and no swap | `postprocess.ts assertNoUnsafeSafeFields` (throws) + `claims-boundary-copy.test.ts` family `unconditional-swap` | **TEST + RUNTIME** |
| 5 | Disclaimer + boundary copy visible, never behind a disclosure | `disclaimer-presence.test.ts` covers **engine responses only** — the landing footer's `{BOUNDARY_DISCLAIMER}` is unpinned | **PROSE-ONLY on the landing** |
| 6 | Statistics trace to evidence-pack; trial citation only on `/how-it-works` | `claims-boundary-copy.test.ts` family `study-association` + exemption guard | **TEST** |
| 7 | `.landing-proof-band` left column is a LABEL, not a statistic | nothing — a CSS comment and a DESIGN.md paragraph | **PROSE-ONLY** |
| 8 | WCAG AA everywhere; health info never in `--text-soft` | `tests/smoke/landing-a11y.spec.ts` (axe, critical+serious = 0). The `--text-soft` rule: prose-only | **TEST (partial)** |
| 9 | 44px touch targets | CSS only; axe does not check target size at AA | **NOT ASSERTED** |
| 10 | Nothing below 16px except tracked uppercase | nothing — two "never lower this" CSS comments | **PROSE-ONLY** |
| 11 | Verdict colour never the sole channel | icons ship, not asserted | **PROSE-ONLY** |
| 12 | `prefers-reduced-motion` zeroes motion | four `@media` blocks (`globals.css:36, 1745, 2136, 3469`), not asserted | **NOT ASSERTED** |
| 13 | Focus visible everywhere | `:focus-visible` + axe | **CSS + TEST (partial)** |
| 14 | Landing reads light; no dark bands; `--landing-band` gone | nothing — owner instruction in prose | **PROSE-ONLY** |
| 15 | Landing is marketing; the app lives at `/check` | nothing structural | **PROSE-ONLY** |

**Seven prose-only rails.** Ranked by likelihood a redesign silently breaks one:
16px floor → proof-band-is-a-label → reduced-motion coverage → 44px targets →
health-info-never-`--text-soft`. Phase 10C must schedule tests for these.

### 3.2 Hard source-text pins — a contender that breaks one of these forfeits

`copy-pins.test.ts` requires these **literal strings in `app/page.tsx` source**:

```
{TASTER_LIMIT} free checks on your first
{TASTER_LIMIT} free checks on day one
Check up to {TASTER_LIMIT} meals on your first day
Your first ${TASTER_LIMIT} checks, on your first day
A free account still includes {FREE_DAILY_CHECKS} free checks a day   (legacy branch)
a free account includes ${FREE_DAILY_CHECKS} free checks a day        (legacy FAQ branch)
```

Banned in source: `/free taste/i`, `/your first day of checks is free/i`,
`/check your meals all day/i`, and any literal `$9.99|$12.99|$19.99`.
Rendered-output guard: **trial mode must never render a daily free-check claim; legacy mode must.**

`landing-paywall-copy.test.ts` requires: `paywallMode() === "trial"`, `resolvePriceVariant`,
`{monthlyPrice}/month`, and the literals `7 days free`, `Days 2–8`, `A free account`, `still no card`.

`landing-wiring-pins.test.ts` requires: `reading.className` on the landing `<main>`;
`Two ways in.` / `Three ways in.`; `Dictate it or type it.` / `Snap a photo, dictate it, or type it.`;
`A weekly recap in sentences` / `A 90-day journey, recapped weekly`;
`A record you can actually show someone` and `It asks before it guesses` **exactly once each**;
`Add to home screen — works today`; and **no `.landing*` selector may declare `font-size` twice.**

`promise-registry.test.ts`: `app/page.tsx` must render `<DemoCheckCard />` and must **not**
contain the three interaction-flow strings.

### 3.3 The claims guards are the authority, not caution

Confirmed again this session, and it is the most useful operating fact in the repo: the
2026-07-28 rebuild's bolder copy tripped **zero** guards. `claims-boundary-copy.test.ts`
bans *disease-outcome claims*, not vivid writing about the reader's problem. Run
`npx vitest run tests/unit/revora/` (~80s) before assuming any copy is a compliance problem.

---

## 4. What was found — Sections 1–6, compressed

### 4.1 Inventory (Section 1)

`app/page.tsx` has **11 `<section>` elements but 13 content blocks** — the at-a-glance strip
is a bare `<ul>` in a `.landing-sheet`, and the footer is a `<footer>`. The tournament
prompt's "11 sections" is the tag count. Inventory all 13.

Order · plane · lines:
1. Nav + hero — `.landing-sheet` — 190–271
2. At a glance — `.landing-sheet` — 277–312
3. The six-month wait — `.landing-band` — 315–366
4. How it works — `--page-bg` — 370–417
5. Three answers — `.landing-sheet` — 421–502
6. Everything you get — `--page-bg` — 506–619
7. What actually changes — `--page-bg` — 622–665
8. Calm, honest about its limits — `--page-bg` — 668–732
9. Pricing — `--page-bg` — 735–809
10. Pantry Review — `.landing-band` — 813–848
11. FAQ — `--page-bg` — 852–864
12. Final CTA — `.landing-band` — 868–881
13. Footer — `--page-bg` — 884–925

### 4.2 The duplication census (Section 4)

| Claim | Times stated | Where |
|---|---|---|
| "one clear answer / label + reason" | **7** | eyebrow, hero sub, glance, how-it-works S2, three-answers lede, feature grid, trust |
| the three verdict words rendered | **4** | hero sub, how-it-works S2, verdict cards, feature grid |
| `10 free checks` | **7** | hero hint, glance, pricing lede, 2 tiles, FAQ, final CTA |
| "encrypted at rest, one-tap delete" | **2**, near-verbatim | feature grid + trust |
| "weekly recap, never a grade, never a lab prediction" | **2**, near-verbatim | feature grid + trust |
| prediabetes-only scope | **5** | eyebrow, glance, pains-note, trust, FAQ |
| Pantry Review | **2** | feature grid + full band |

### 4.3 The structural fault

**Block 3 (the problem) and Block 7 (what changes) are the same section written twice.**
Four items each, same four moments, same order. One pair is near-verbatim:
"Every article contradicts the last one" vs "You read three articles at 11pm and they
disagree." Cost: ~1,400px of mobile scroll for one idea, sitting inside the page's only
5,090px CTA desert (mobile CTAs measured at y = 18 · 491 · 2973 · 5498 · 10588 · 11002 ·
11950 on a 12,942px page).

### 4.4 The single worst thing on the page

**The hero's visual half proves the product by showing a food you thought was fine being flagged.**

`DemoCheckCard` renders: *You type: oatmeal* → *Need one more detail* → *You answer:* →
**Be careful** → "Oatmeal on its own is a carb-heavy start…". It is scrupulously honest,
pinned to the real precheck by `promise-registry.test.ts`, and it is the sharpest hook in
`docs/ICP.md` §10 (the "healthy food betrayal").

It is also the wrong first handshake for this brand. `PRODUCT.md` §Design Principles 1:
*"Lead with what the user CAN do/eat. Every screen grants calm permission…"* The hero's proof
unit does the opposite — the first thing Revora is shown doing to a frightened person is
taking away breakfast. The page then spends four blocks apologising with the word "calm."

Secondary cost: at 375px that card is ~15 stacked lines ending in a legal disclaimer, so the
visitor's first scroll after the CTA is a second wall of text. Also, `.landing-phone` contains
no phone — the bezel was removed 2026-07-27 (nested cards are banned) and the class name was
left behind.

**The betrayal hook should stay on the page. It should not be the opening move.**

### 4.5 Other findings worth carrying forward

- **42 rendered em dashes** on one page (51 including comments). Not a house voice, a cadence,
  and the most reliable machine-text tell in 2026. The approved CTA
  (`Check your first meal — free`) earns one; the other 41 do not all.
- **The word "calm" appears three times** in headings and ledes. A page that has to say it is
  calm is not calm.
- **Six of thirteen blocks are stock furniture**: three-step how-it-works with Step 1/2/3
  eyebrows, four-stat glance strip, 3-up pricing tiles, FAQ accordion, 2×2 before/after grid,
  9-item feature grid.
- **`landing-glance-fact` renders "10 seconds"** in `clamp(1.35rem, 2.4vw, 1.6rem)/800` accent
  type as an unhedged promise, while the hero says "about ten seconds." Same rhetorical move
  rail 7 exists to stop; no family catches it because it is a latency claim, not a health claim.
- **Trust card #2** has the heading "Grounded in published research" over a body about the
  weekly recap being behavioral. Heading and body describe different things.
- **The feature grid's ranking exists only in a code comment.** A scanner sees nine
  undifferentiated cells.
- **The hedge that eats its own promise:** *"…want a clearer description of its overall
  balance."* A person standing in a kitchen does not want that. Also the final CTA's *"see the
  general pattern Revora notices"* — the flattest verb on the page, at the highest-intent moment.

### 4.6 What the incumbent gets RIGHT — be generous here, it is earned

- **The eyebrow answers "what is this" in 7 words before the headline.** `A meal checker built
  only for prediabetes`. Almost no health-tech landing page does this.
- **"Stop guessing at dinner."** Four words, names the moment and the emotion, zero jargon.
- **The Clear card carries no adjustment and no swap** — F-04 demonstrated rather than
  asserted. Genuine craft. Do not "fix" it.
- **Pricing renders from the same server flags checkout enforces.** The funnel structurally
  cannot lie. Rare, and worth protecting through any redesign.
- **"When we're unsure, we say so."** The sharpest line on the page.
- **The 16px floor and the reading-face pairing** are correct instincts for a 40–60 audience,
  whatever the tournament decides about the second typeface.
- **The pains list is the best prose in the repo.**

### 4.7 The Brief (Section 5) — this binds all seven contenders

**The one belief:** *There is a tool built for exactly my situation that will answer the plate
in front of me right now, and it will tell me when it isn't sure.* Three parts — built for me ·
answers now · admits doubt. Drop any one and the page is selling a generic nutrition app to
someone who already quit one.

**The one action:** tap `Check your first meal — free` and describe a meal. Requires: no
account, no card, nothing to install, **and no fear of judgment on the other side.** The page
states the first three well and never addresses the fourth.

**The three objections, in frequency order:**

| # | Objection | Arises | What answers it | What only sounds like it does |
|---|---|---|---|---|
| 1 | "Another food app I'll quit in a week" | at the fold, on sight of any grid | showing **one answer card and nothing else** | saying "not a calorie counter" — every calorie counter says that. `ICP.md` §8: MyFitnessPal-is-free is the **#1 deal-killer** |
| 2 | "Is it accurate, or is it AI guessing?" | at the demo, again at the price | **the clarifying question** — free, checkable in 10s, unfakeable | "Grounded in published research" — this audience is specifically burned by AI food apps |
| 3 | "Will it charge me or trap me?" | at pricing | 10 checks, no login, no card; day-5 pre-charge email; one-tap cancel, stated as mechanics | the word "free" — the category is poisoned (Klinio 1.2/5) |

**The fourth objection, unspoken:** *"Will this make me feel worse?"* Never typed into a search
bar, so no research surfaces it. Kills silently at the fold. Persona P6 exists to hold it.

**Emotional arc:** fold = **recognised, then relieved** (the feeling of a stranger saying the
sentence you were about to say). Midpoint = **steadied; smaller than feared**. CTA = **safe to
try** — absence of risk, not presence of desire. Urgency is the wrong instrument here; it reads
as the thing the scam apps did.

**The one thing no competitor can honestly say:**
> **It asks a question instead of guessing.**

Every alternative in `ICP.md` §9 returns a confident number for any input, and their complaint
threads are *about* that confidence. Revora's clarify route is a structural refusal to be
confident when it can't be. No competitor can copy it without conceding their numbers were
never that certain. **The incumbent owns this and ranks it feature #1 of nine, in a grid, at
y≈5,500px on mobile.**

### 4.8 DESIGN.md verdict (Section 6) — headline results

Every rule was classified PRINCIPLE / SCAR TISSUE / ACCIDENT / CONTESTED. Full table is in the
prior session's transcript; these are the load-bearing outcomes.

**CONTESTED — the tournament must settle these seven:**
1. The two-font pairing (Plus Jakarta Sans + Source Sans 3, landing-only). The *reason* is
   sound; the fix was one variable — size — and the response was a second typeface. 17px Plus
   Jakarta Sans at 1.65 solves the stated problem with zero families added.
2. The 24px radius applied to all eight landing card families. Largest single contributor to
   the page's soft-consumer-SaaS read.
3. The three-plane light rhythm + 1px hairline. Solves post-dark-band flatness with the most
   literal instrument; three planes across 13 blocks produces stripes where space should work.
4. "One filled pill per viewport." Right instinct, wrong unit — stated per viewport, enforced
   per page, which is why the nav CTA went ghost. Proposed restatement: **one filled pill per
   screenful**, which permits a persistent nav CTA.
5. Eight landing card families. The DESIGN.md sentence contains the finding: consistency across
   eight families is a consolation prize; eight families is the problem.
6. The landing's voice licence. §Voice is written universally, scoped "app surfaces," applied
   to the landing anyway. The pains list is the best copy on the page precisely because it
   broke the rule.
7. "Icons always sit next to text, never alone." The file **already contradicts this** in
   §Progress surfaces, where the verdict icon sits *inside* the day mark so shape carries the
   signal for colourblind users. Proposed restatement: an icon never carries meaning alone
   *unless* it is a redundant channel for text in the accessible name.

**ACCIDENTS to kill:** §Class vocabulary (an index, half already stale) · "CSS only, no
animation libraries" (a dependency policy dressed as a design rule; the keyframe whitelist
already does the work) · the 480px `.page-frame` legacy note (a migration record) · the scope
clause "**for content pages**" in §App-UI guardrails — that clause is exactly what let the
landing become a card mosaic while a rule banning card mosaics sat in the same file.

**SCAR TISSUE that is really a test:** FINDING-030 font wiring · `reading.className`
placement · one-`font-size`-per-selector · CTA single-assembly · DPP citation confinement.
All five should name their test file and stop retelling their incident.

**Documented-but-false:** §Type claims base `16px/1.5` is "now actually in force." It is not.
`body` is still inside the `font: inherit` reset; the one-token fix is deferred in TODOS. The
design system documents a value that does not compute. State the rule; delete the claim that
it is in force until it is.

**Best rules in the file, keep near-verbatim:** the single card shadow · risk colours are
semantic-only · credibility is honesty · §Progress surfaces, especially *"Checking less as you
get more confident is how this is meant to work."*

---

## 5. What remains — Phases 4–10 / Sections 7–18

Nothing below has been started.

| Phase | Output section | Work |
|---|---|---|
| **4** | SECTION 7 | Instantiate the seven personas. For each: worldview, theory of why the current page fails, and the one bet it is making, in its own voice. |
| **5** | SECTION 8 | Seven complete contenders, each in the mandatory 12-part structure (name/thesis · the bet · section map with planes and viewport share · **full verbatim copy deck** · hero spec · proof strategy · visual-system deltas · motion spec · the 375px story · 15-rail self-audit · what it steals from the incumbent · primary failure mode). Placeholder copy is a forfeit. |
| **6** | SECTIONS 9–10 | 42 cross-scorecards (7×6, no self-scoring), 10 weighted dimensions, verdict per card. Full 7×7 matrix of weighted totals. Surface every 3+ point disagreement and resolve it. |
| **7** | SECTIONS 11–12 | Kill the bottom three with named structural reasons. Extract one organ from each corpse and assign it a recipient. Name the convergent ideas (3+ personas independently) and the non-obvious single-persona wins. |
| **8** | SECTION 13 | Synthesise one winner: pick a spine, name every graft and what it displaced, name every high-scoring idea deliberately rejected. Deliver in the full 12-part structure at ship quality. |
| **9** | SECTION 14 | P7, P4 and P6 attack the winner. P4 walks all 15 rails line by line against the final copy deck and checks every string against `copy-ledger.md`. Fix in place; record unfixable findings as trade-offs. |
| **10A** | SECTION 15 | Write `docs/plans/landing-tournament-winner-spec.md` — build-ready, no vague phrases. Say `padding: clamp(52px, 7vw, 104px)`, say `17px / 1.65`, name the token. |
| **10B** | SECTION 16 | Rewrite `DESIGN.md` carrying the Phase 3 verdicts. Every surviving rule states its derivation in one sentence. Scar tissue becomes rules that name their test. Accidents gone. Phase 7.3 anti-patterns become an explicit banned list. Must be **shorter and more load-bearing** than 361 lines; report before/after and what was cut. Still a design SYSTEM — app shell, tokens, motion, icons and voice carry forward, re-derived. |
| **10C** | SECTION 17 | Write `docs/plans/landing-tournament-implementation-plan.md` — section-by-section diff against `app/page.tsx` with line ranges, the `.landing-*` CSS changes, which tests break and why, which new strings need `copy-ledger.md` rows, ordered smallest-shippable-first work items, and what must NOT change plus the test that catches it. |
| — | SECTION 18 | Decision memo: winner + the one sentence why · what the tournament proved that was not obvious · what the current page already had right (be specific and generous) · three highest-leverage changes by impact-per-hour · what in DESIGN.md was scar tissue and never should have been a design rule · the single biggest shipping risk · what only real visitors can settle. |

**Required tables still owed:** Contender Summary (7 rows) · full 7×7 cross-scoring matrix ·
per-dimension winner table (10 rows) · final ranked scoreboard with verdicts. (Teardown Table
and DESIGN.md Verdict Table are done.)

**Scoring weights, for reference:** Category clarity 12 · Belief shift 14 · Honesty & claim
safety 12 · Voice fidelity 10 · Legibility & accessibility 12 · Craft & non-genericness 12 ·
Information architecture 8 · Emotional fit 10 · Implementation realism 6 · Durability 4.
As weighted, this is a **conversion tournament with a craft floor**. If a different winner is
wanted, change the weights *before* Phase 6, not after seeing the result.

---

## 6. Traps and gotchas for the next session

1. **Skills bind the personas.** Invoke and hold: `impeccable`, `iui-ux-pro-max`,
   `taste-skill:taste-skill`, `apple-design`, `emil-design-eng`, `icopywriting`, `icro`.
   A contender that violates the standard of the skill it is built on is scored down by every
   judge including itself.
2. **`taste-skill` bans em dashes outright; Revora's approved copy uses them** (the ledger CTA
   is `Check your first meal — free`). Resolution reached in Phase 3: the em dash stays,
   because it is in approved ledger copy and is legitimate in this voice — but 42 on one page
   is a cadence, and the rewrite should cap it. Do not silently strip them; that breaks
   `copy-pins` and the approved CTA.
3. **Rail 14 (light surface, no dark bands) is immutable this round** by owner instruction
   2026-07-27. Personas may argue for other ways to create depth; not for the dark bands back.
4. **Do not "fix" the Clear card** by giving it an adjustment. That absence is the F-04 rule
   made visible and `assertNoUnsafeSafeFields` throws on it in the engine.
5. **`Revora_Brand_Positioning_v2.md` is a tombstone** and `docs/archive/` is not an approved
   source. Do not mine either. `docs/product-marketing.md` is the only active positioning source.
6. **The rejected claim in `PRODUCT.md` §Rejected claims must never be resurrected** — it sits
   deliberately outside the audit fence and is pending counsel Q8.
7. **Contenders are paper, not code**, by the prompt's scope choice. If live variants are ever
   wanted, ship each as a route under `/lab/v1..v7` in a git worktree and score screenshots.
   Much slower, much more honest.
8. **Only ever run one `next dev`.** Multiple servers over one `.next` cause `ChunkLoadError`
   reload loops. `pkill -9 -f "next-server"; rm -rf .next; npm run dev`.
9. **`~/.claude/skills/gstack/` does not exist on this machine.** All gstack helper commands
   silently no-op. Use Playwright from the repo's own `node_modules`.

---

## 7. Next session prompt — paste this

> Continue the Revora landing design & copy tournament. Read
> `docs/handoff/2026-08-04-landing-design-copy-tournament-phases-0-3-handoff.md` first, then
> `docs/prompts/2026-08-04-landing-design-and-copy-tournament.md` for the full brief.
>
> **State:** Phases 0–3 are complete and recorded in the handoff — the incumbent inventory
> (13 blocks, not 11), the constraint ledger with all hard test pins, the live fact table, the
> forensic teardown with its Teardown Table, the Brief that binds all contenders, and the
> DESIGN.md verdict with seven CONTESTED items the tournament must settle. **Do not re-derive
> any of it and do not re-read the whole codebase.** The handoff carries the live constants,
> the literal source-text pins, and the seven prose-only rails.
>
> **Do next, in order:** Phase 4 (SECTION 7 — the seven personas, each with worldview, theory
> of failure, and its one bet), then Phase 5 (SECTION 8 — seven complete contenders in the
> mandatory 12-part structure with verbatim ship-ready copy decks; placeholder copy is a
> forfeit; contenders must differ in structure, not just wording). Stop after Section 8 and
> checkpoint before cross-scoring.
>
> Invoke and hold these skills before starting: `impeccable`, `iui-ux-pro-max`,
> `taste-skill:taste-skill`, `apple-design`, `emil-design-eng`, `icopywriting`, `icro`.
>
> Rails: light surface only (no dark bands, owner instruction). Every number comes from the
> handoff's live fact table. Do not break the literal source-text pins in §3.2. Do not give
> the Clear card an adjustment. Do not use workflows or dynamic subagent orchestration.

---

## 8. Files touched this session

None, except this handoff. No commits, no code changes, no `DESIGN.md` edits.
