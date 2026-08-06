# CONSOLIDATED HANDOFF — Revora landing design & copy tournament, Phases 0–9

**Date:** 2026-08-05
**Branch:** `fix/landing-followups` (HEAD `8c4c0e9`, unchanged since the tournament began)
**Scope:** the marketing landing `/` only — `app/page.tsx`, the `.landing-*` layer of
`app/globals.css`, `components/demo-check-card.tsx`, and `DESIGN.md` (on trial).
**Status:** **Phase 10A is DONE. 15 of 18 sections written. Phase 10B is next.**
**Code changed: none. Commits: none.**
**✅ `npm test` is GREEN at `8c4c0e9` (2026-08-05): 2,184 passed / 0 failed / 2 skipped, 186 files,
164s.** The six-session debt is cleared. ⚠️ **The suite takes ~2.7 minutes, NOT the "~26 minutes"
this document and four earlier handoffs claimed** — that figure was stale and was deterring a
three-minute run. `npm test` is `vitest run` over `tests/**/*.test.ts` only; the Playwright smoke
suite (`npm run e2e`) is separate and holds landing breakage of its own.

> ## ⚠️ 2026-08-05 — Phase 10A measured the winner in a browser, and it falsifies §10's metrics
> `docs/plans/landing-tournament-winner-spec.md` is Section 15 and it **supersedes the estimated
> page metrics in §10.1 and the desert map in §10.1's note.** Measured at 375px with the real fonts:
> **8,621px / 12.9 screens** (estimate: ~6,865px / 10.3), **longest desert 2,224px** (estimate:
> 1,450px), and **three of five deserts breach the 1,460px budget.**
> **C5's reachability rule — the organ grafted specifically to fix the desert problem — is not
> satisfied by the winner, and no arrangement of its six exits satisfies it.** The spec's §11 puts
> that ruling to the owner with four measured arrangements rather than restating the number.
> The harness was validated against the incumbent first (13,346px vs the recorded 12,942px, 7 CTAs
> exact, 5,228px vs the recorded 5,090px longest desert), so the numbers are trustworthy.
> Fix 5 is **confirmed correct**: the 33-word hero sub renders 4 lines and the whole hero argument,
> including the entire trust strip, clears the fold.
>
> **Second finding, computed not estimated:** C4's `--text-soft` graft was scoped as a taste rule
> (banned in blocks 1/2/3/5, permitted in block 4) and is actually an **accessibility** one. On the
> winner's single `--page-bg` plane the token measures **4.40:1 — below WCAG AA**. The ban is
> page-wide and the block-4 exemption is withdrawn. `DESIGN.md:32`'s *"AA at 16px on white"* is true
> on white and misleading everywhere the product renders; 10B must correct the annotation and audit
> the two app-surface uses at `globals.css:2673` and `:3148`, which 10A did not check.

> **This file supersedes every earlier handoff.** It is written so a session that reads only this
> document plus the one plan file for the phase it is executing can continue the work correctly.
> Where it disagrees with `2026-08-05-landing-tournament-master-handoff.md` or the Phase 8 handoff,
> **this file wins** — those two carry premises that Phase 9 falsified against the repository.

---

## 0. Read order, and what to open only when you need it

| Read | File | Why |
|---|---|---|
| **1st** | **this file** | The whole state of play, Phases 0–9 |
| **2nd** | `docs/plans/landing-tournament-phase-9.md` | **The red-team.** The rulings, the eleven fixes, the four trade-offs, the corrected rail and pin ledgers. Supersedes Phase 8 |
| **3rd** | `docs/plans/landing-tournament-phase-8.md` | **The winner, in full.** 831 lines, the 12-part spec. Still the spec — Phase 9 amends it in eleven places |
| as needed | `docs/plans/landing-tournament-phase-7.md` | Kill rulings, organ assignments, the banned list, 27 convergences |
| as needed | `docs/plans/landing-tournament-phases-4-5.md` | The seven contenders in full. Open only for a specific graft detail |
| rarely | `docs/plans/landing-tournament-phase-6.md` | The 42 scorecards. Open only for a specific justification. **Two of its narrative conclusions are known-wrong** (§10, trap 15) |
| superseded | `…master-handoff.md` · `…phase-8-winner-synthesis-handoff.md` · `…phase-9-red-team-handoff.md` · the four `2026-08-04-*` handoffs | Kept for the record. Everything they carry is in this file, corrected |

**Do NOT** re-score, rebuild the contenders, re-run the kill round, re-derive the convergences,
re-open the two settled no-convergence items, re-synthesise the winner, or re-open the
comparative-confidence ruling. All six are closed.

---

## 1. What this project is, in one page

A **competitive elimination tournament** to settle the Revora landing page's design and copy from
first principles. Seven personas each built a complete contender; they cross-scored each other on
ten weighted dimensions; the weak three were killed; the survivors' best parts were grafted into
one winner; the winner was then red-teamed by three of the personas. The output becomes the source
of truth for future Revora design work.

**`DESIGN.md` is a defendant in this process, not the referee.** Every rule in it had to re-derive
itself or die (§7).

**The tournament ran on paper by design** (trap 11) — no contender was ever built as code. That
choice has cost twice, and both costs are now paid:

- **Phase 8** read the four repository files the winner's spine depends on and found **five
  discrepancies** between the contenders' specifications and the code (§9.2). Four changed a
  decision.
- **Phase 9** read seven more — the three safety documents, the contract validator, two pin test
  suites, and the regions of `app/page.tsx` the winner keeps — and found **three false premises**
  the tournament had been running on since Phase 6 (§9.1), plus twelve further findings.

**The standing lesson, now a trap:** assume every document in this repository is as unverified as
the code was, including the governance documents.

---

## 2. Repo state, and the debt that is now CLEARED

Nothing has been modified except markdown. No commits. No `DESIGN.md` edits.

✅ **`npm test` is GREEN at `8c4c0e9`, 2026-08-05: 2,184 passed / 0 failed / 2 skipped, 186 files
(1 skipped), 164.48s.** Previous recorded green was 2,165 at `bf714e9`; the +19 are from the
SEO/JSON-LD/guides commits. **The oldest open item on the board is closed, and 10C's breakage
predictions are now worth writing.**

```bash
pkill -9 -f "next-server"   # concurrent dev servers cause false createTestDb 120s timeouts
npm test                    # ~2.7 minutes. The "~26 minutes" this file used to claim was WRONG
npm run e2e                 # SEPARATE Playwright suite — npm test does NOT cover tests/smoke/
```

⚠️ **`npm test` is not the whole gate.** `vitest.config.ts` includes only `tests/**/*.test.ts`.
`tests/smoke/*.spec.ts` is Playwright (`playwright.config.ts testDir: "./tests/smoke"`). **A green
`npm test` does not clear the landing** — `tests/smoke/landing-a11y.spec.ts:69-76` pins the
at-a-glance strip that the winner deletes.

**Phase 10A has already located the full breakage set** — six assertions, four broken `it` blocks in
`npm test` plus one in `npm run e2e`, **and Tier B turns out to have a fifth string** no phase had
listed. See the Phase 10A handoff §3.2.

Before Phase 10B rewrites `DESIGN.md`, keep the current version reachable:

```bash
git show HEAD:DESIGN.md > /tmp/design-before.md
```

Only ever run **one** `next dev`. Multiple servers over one `.next` cause `ChunkLoadError` reload
loops: `pkill -9 -f "next-server"; rm -rf .next; npm run dev`.

---

## 3. The phase map

| Phase | Sections | State | Output |
|---|---|---|---|
| 0–3 | 1–6 | **Done** | Inventory · constraint ledger · teardown · Brief · `DESIGN.md` verdict |
| 4–5 | 7–8 | **Done** | `docs/plans/landing-tournament-phases-4-5.md` |
| 6 | 9–10 | **Done** | `docs/plans/landing-tournament-phase-6.md` |
| 7 | 11–12 | **Done** | `docs/plans/landing-tournament-phase-7.md` |
| 8 | 13 | **Done** | `docs/plans/landing-tournament-phase-8.md` — the winner |
| 9 | 14 | **Done** | `docs/plans/landing-tournament-phase-9.md` — the red-team |
| 10A | 15 | **Done** | `docs/plans/landing-tournament-winner-spec.md` — the build spec + the browser measurement |
| **10B** | **16** | **NEXT** | Rewrite `DESIGN.md` |
| 10C | 17 | Not started | `docs/plans/landing-tournament-implementation-plan.md` |
| — | 18 | Not started | Decision memo |

**Every required table has been delivered.** Teardown Table · `DESIGN.md` Verdict Table · Contender
Summary Table · full 7×7 cross-scoring matrix · per-dimension winner table · ranked scoreboard.
Nothing further is owed in table form.

---

## 4. The subject — the incumbent page, and what is wrong with it

### 4.1 Inventory

`app/page.tsx` has **11 `<section>` elements but 13 content blocks** (the at-a-glance strip is a
bare `<ul>`; the footer is a `<footer>`). The prompt's "11 sections" is a tag count.

Nav+hero · at a glance · the six-month wait · how it works · three answers · everything you get ·
what actually changes · calm/honest about limits · pricing · Pantry Review · FAQ · final CTA ·
footer.

**Baseline:** 13 blocks · 12,942px · 19.4 screens at 667px · 7 CTAs · **5,090px longest CTA
desert** · 42 rendered em dashes · 8 card families · 4 eyebrows · 3 light planes + hairline.

### 4.2 The single worst thing on the page

**The hero's visual half proves the product by showing a food you thought was fine being flagged.**
`DemoCheckCard` renders *You type: oatmeal* → *Need one more detail* → *You answer:* → **Be
careful**. It is scrupulously honest, pinned to the real precheck by `promise-registry.test.ts`,
and it is the sharpest hook in `docs/ICP.md` §10.

It is also the wrong first handshake. `PRODUCT.md` §Design Principles 1: *"Lead with what the user
CAN do/eat."* The first thing Revora is shown doing to a frightened person is taking away breakfast,
and the page then spends four blocks apologising with the word "calm." **The betrayal hook should
stay on the page. It should not be the opening move.** All seven contenders agreed.

### 4.3 The structural fault, and the duplication census

Block 3 (the problem) and block 7 (what changes) are **the same section written twice** — four
items each, same four moments, same order, one pair near-verbatim. ~1,400px of mobile scroll for
one idea, inside the page's only 5,090px CTA desert.

| Claim | Times stated |
|---|---|
| "one clear answer / label + reason" | **7** |
| `10 free checks` | **7** |
| prediabetes-only scope | **5** |
| the three verdict words rendered | **4** |
| "encrypted at rest, one-tap delete" | 2, near-verbatim |
| "weekly recap, never a grade" | 2, near-verbatim |
| Pantry Review | 2 |

### 4.4 The rest of the diagnosis

- **42 rendered em dashes** (51 including comments). Not a house voice — a cadence, and the most
  reliable machine-text tell in 2026.
- **"calm" appears three times** in headings and ledes. A page that has to say it is calm is not.
- **Six of thirteen blocks are stock furniture:** three-step how-it-works with `Step 1/2/3`
  eyebrows, four-stat glance strip, 3-up pricing tiles, FAQ accordion, 2×2 before/after grid,
  9-item feature grid.
- **`landing-glance-fact` renders "10 seconds"** unhedged while the hero says "about ten seconds."
  No test family catches it — it is a latency claim, not a health claim.
- **Trust card #2** heads "Grounded in published research" over a body about the weekly recap being
  behavioural. Heading and body describe different things.
- **The feature grid's ranking exists only in a code comment.** A scanner sees nine undifferentiated
  cells.
- **`.landing-phone` contains no phone.** The bezel was removed 2026-07-27; the class name has been
  lying since.
- **With `photoInputEnabled()` false, section 4's shipped headline is "Two ways in."** — and the two
  ways are *typing* and *talking*. ~900px selling the two most ordinary input methods in software as
  the mechanism. All seven contenders retired it.

---

## 5. The constraint ledger — what actually holds the page

### 5.1 The fifteen hard rails, plus the sixteenth Phase 9 found

| # | Rail | Enforced by | Real? |
|---|---|---|---|
| 1 | Revora never the agent of a health outcome | `claims-boundary-copy.test.ts` | **TEST** |
| 2 | No fabricated ratings / users / testimonials | family `social-proof` | **TEST** |
| 3 | SAFE/MODERATE/HIGH never render as copy | `copy-pins.test.ts` RISK_LABELS walk | **TEST** |
| 4 | Clear carries no adjustment and no swap | `postprocess.ts assertNoUnsafeSafeFields` (throws) + family `unconditional-swap` | **TEST + RUNTIME** |
| 5 | Disclaimer visible, never behind a disclosure | `disclaimer-presence.test.ts` covers **engine responses only** | **PROSE-ONLY on the landing** |
| 6 | Statistics trace to evidence-pack; trial citation only on `/how-it-works` | family `study-association` + exemption guard | **TEST** |
| 7 | `.landing-proof-band` left column is a LABEL, not a statistic | a CSS comment and a `DESIGN.md` paragraph | **PROSE-ONLY** |
| 8 | WCAG AA; health info never in `--text-soft` | `tests/smoke/landing-a11y.spec.ts` (axe); the `--text-soft` rule is prose | **TEST (partial)** |
| 9 | 44px touch targets | CSS only; axe does not check target size at AA | **NOT ASSERTED** → C5's test adopted |
| 10 | Nothing below 16px except tracked uppercase | two "never lower this" CSS comments | **PROSE-ONLY** |
| 11 | Verdict colour never the sole channel | icons ship, not asserted | **PROSE-ONLY** |
| 12 | `prefers-reduced-motion` zeroes motion | four `@media` blocks, no coverage | **NOT ASSERTED** → C5's test adopted |
| 13 | Focus visible everywhere | `:focus-visible` + axe | **CSS + TEST (partial)** |
| 14 | Landing reads light; no dark bands | owner instruction, immutable this round | **PROSE-ONLY** |
| 15 | Landing is marketing; the app lives at `/check` | nothing structural | **PROSE-ONLY** |
| **16** | **Every user-facing sentence must be fileable under a claim class in `claims-boundary.md`** | **nothing — Phase 9 found the gap** | **NEW. Phase 10B writes it** |

Rail 16 exists because the tournament discovered a shipped sentence that is neither approved nor
banned but simply **outside the schema** (§9.1 C, §6.3). *A sentence that is neither approved nor
banned is not therefore permitted.*

**Seven prose-only rails**, ranked by likelihood a redesign silently breaks one: 16px floor →
proof-band-is-a-label → reduced-motion → 44px targets → health-info-never-`--text-soft`. Two now
have scheduled tests (C5's, adopted regardless of winner).

### 5.2 The three fences, and why they are not the same fence

**This is the single most misused fact in the tournament.** "It passes the guards" was treated as
clearance for four phases. There are three independent fences and only one reads source:

| Fence | What it reads | What it proves |
|---|---|---|
| `claims-boundary-copy.test.ts` | **every `.tsx` under `app/` and `components/`** (glob, minus a reasoned deny list) | No **banned family** appears — disease outcome, social proof, unconditional swap, study association |
| `scripts/validate-safety-contract.mjs` | **only `docs/safety/*.md` + a JSON fixture. No source file, ever** | The ledger is internally consistent: required rows exist, approved rows dodge the forbidden regexes, claim classes and evidence IDs resolve |
| `copy-pins.test.ts` · `landing-wiring-pins.test.ts` · `promise-registry.test.ts` | named strings and rendered output | Specific pins hold |

**Nothing connects the ledger to the source in either direction.** A new landing sentence is opted
*into* the banned-word scan automatically and opted *out* of the ledger entirely, and nothing goes
red. "It passes the guards" ≠ "it is ledgered" ≠ "it is fileable."

### 5.3 The pin ruling — CORRECTED by Phase 9

**Tier A — ten semantic pins. Inviolable. Breaking one forfeits.**

1. `TASTER_LIMIT` interpolated, never retyped
2. `{monthlyPrice}` from `resolvePriceVariant()`, no literal `$9.99|$12.99|$19.99` in source
3. `paywallMode() === "trial"` with **both** branches present
4. `RISK_LABELS` interpolated
5. `<DemoCheckCard />` rendered and the three interaction strings never retyped
6. `reading.className` on the landing root (FINDING-030)
7. No `.landing*` selector declares `font-size` twice
8. Banned source phrases stay banned (`/free taste/i`, `/your first day of checks is free/i`,
   `/check your meals all day/i`)
9. Trial mode never renders a daily free-check claim; legacy mode must
10. **NEW — `FREE_DAILY_CHECKS` interpolated, never retyped, in BOTH the legacy pricing tile and
    the legacy FAQ answer.** `copy-pins.test.ts:97-113` asserts both, and no phase before 9 listed
    this constant. The winner's copy deck typed the numeral `5`. Fixed.

**Tier B — string pins. Changeable only by naming the pin, giving the reason, and scheduling the
test edit in the same work item. Silent drops forfeit.**

*Retired by the winner — **four**, not three:*

| # | Pin | Reason | Test edit |
|---|---|---|---|
| 1 | `Two ways in.` / `Three ways in.` | how-it-works block deleted (7/7 convergence) | `landing-wiring-pins.test.ts` |
| 2 | `Dictate it or type it.` | same block, same reason | `landing-wiring-pins.test.ts` |
| 3 | `{TASTER_LIMIT} free checks on day one` | no pricing lede; the H2 carries the number | `copy-pins.test.ts` |
| **4** | **`A 90-day journey, recapped weekly`** | **feature grid deleted; the winner states the weekly recap once, unconditionally. `learningJourneyUiEnabled()` is FALSE** | **`landing-wiring-pins.test.ts`, `journey-flag branches`. Its flag-on case asserts `toContain("A 90-day journey…")` AND `not.toContain("A weekly recap in sentences")` — the winner fails both. Phase 8 missed it.** |

⚠️ **Pin 4's test edit must MOVE the branch assertion to whichever surface still renders it**, not
delete it. Deleting the copy *and* its test discharges the flag's only coverage by deletion — §8.2
banned-list rule 6.

*Kept:* `Check up to {TASTER_LIMIT} meals on your first day` ·
`Your first ${TASTER_LIMIT} checks, on your first day` · `7 days free` · `Days 2–8` ·
`A free account` · `still no card` · `A weekly recap in sentences` ·
`A record you can actually show someone` · `It asks before it guesses` ·
`Add to home screen — works today`.

### 5.4 Live facts — do not re-derive, do not retype

| Fact | Live value | Source |
|---|---|---|
| `TASTER_LIMIT` | **10** | `lib/client/taster-store.ts:2` |
| `FREE_DAILY_CHECKS` | **5** — legacy funnel only | `lib/free-tier.ts` |
| `FREE_HISTORY_DAYS` | 7 | `lib/free-tier.ts` |
| Trial | **7 days**, card required, $0 charged, pre-charge email at day 5 | `lib/server/pricing.ts` |
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

### 5.5 The claims guards are the authority, not caution

The 2026-07-28 rebuild's bolder copy tripped **zero** guards. `claims-boundary-copy.test.ts` bans
*disease-outcome claims*, not vivid writing about the reader's problem. Run
`npx vitest run tests/unit/revora/` (~80s) before assuming any copy is a compliance problem.

**But read §5.2 first.** Passing that suite is a narrow fact, not clearance.

---

## 6. The Brief — this binds everything downstream

**The one belief:** *There is a tool built for exactly my situation that will answer the plate in
front of me right now, and it will tell me when it isn't sure.* Three parts — **built for me ·
answers now · admits doubt.** Drop one and the page is selling a generic nutrition app to someone
who already quit one.

**The one action:** tap `Check your first meal — free` and describe a meal. Requires no account, no
card, nothing to install, **and no fear of judgment on the other side.** The incumbent states the
first three well and never addresses the fourth.

### 6.1 The three objections, in frequency order

| # | Objection | What answers it | What only sounds like it does |
|---|---|---|---|
| 1 | "Another food app I'll quit in a week" | showing **one answer card and nothing else** | saying "not a calorie counter" — every calorie counter says that. `ICP.md` §8: MyFitnessPal-is-free is the **#1 deal-killer** |
| 2 | "Is it accurate, or is it AI guessing?" | **the clarifying question** — free, checkable in 10s, unfakeable | "Grounded in published research" — this audience is specifically burned by AI food apps |
| 3 | "Will it charge me or trap me?" | 10 checks, no login, no card; day-5 pre-charge email; one-tap cancel, **as mechanics** | the word "free" — the category is poisoned (Klinio 1.2/5) |

**The fourth objection, unspoken:** *"Will this make me feel worse?"* Never typed into a search bar,
so no research surfaces it. Kills silently at the fold. Phase 7 proved it is the dimension that
decides the tournament (§8.2).

> ⚠️ Phase 9 found the winner shipping the objection-1 row's **right-hand column** verbatim
> (`Not a general nutrition app, not a calorie counter, not built for everyone.`) 1,000px after the
> hero had already won the argument the correct way. Deleted. **Check new copy against this table's
> right-hand column, not only its left.**

**Emotional arc:** fold = **recognised, then relieved**. Midpoint = **steadied; smaller than
feared**. CTA = **safe to try** — absence of risk, not presence of desire. Urgency is the wrong
instrument; it reads as the thing the scam apps did.

**The one thing no competitor can honestly say:** **It asks a question instead of guessing.** Every
alternative in `ICP.md` §9 returns a confident number for any input and their complaint threads are
*about* that confidence. The incumbent owns this and ranks it feature #1 of nine, in a grid, at
y≈5,500px on mobile.

---

## 7. `DESIGN.md` on trial — the Phase 3 verdicts, corrected by Phase 9

**ACCIDENTS to kill:** §Class vocabulary (an index, half stale) · "CSS only, no animation
libraries" (a dependency policy dressed as a design rule) · the 480px `.page-frame` legacy note ·
**the scope clause "for content pages" in §App-UI guardrails** — that clause is exactly what let the
landing become a card mosaic while a rule banning card mosaics sat in the same file.

**SCAR TISSUE that is really a test** — all five should name their test file and stop retelling
their incident: FINDING-030 font wiring · `reading.className` placement ·
one-`font-size`-per-selector · CTA single-assembly · DPP citation confinement.

**Documented-but-false:** §Type claims base `16px/1.5` is "now actually in force." It is not —
`body` is still inside the `font: inherit` reset. **The design system documents a value that does
not compute.**

**Best rules in the file, keep near-verbatim:** the single card shadow · risk colours are
semantic-only · credibility is honesty · §Progress surfaces, especially *"Checking less as you get
more confident is how this is meant to work."*

### 7.1 The seven contested items — all settled

| # | Contested item | How it settled | On what |
|---|---|---|---|
| 1 | Two-font pairing (Jakarta + Source Sans 3) | **KEEP** | Phase 8 Finding 3, not the 5/2 vote. `app/fonts.ts` documents the pairing as an ICP legibility decision; it is the contrast-axis pairing `impeccable` prescribes; and both proposals to kill it recorded a clean Tier A audit without addressing `reading.className`, the pin the change lands on. **C2's separable win taken: one body size, 17px / 1.65** |
| 2 | Card radius | **INHERITED — the landing chooses none** | Phase 8 Finding 1: C3's 12px delta was measured against the `.landing-*` families it was deleting (24px `--border-soft`), not against `.result-card` (22px, `--border-strong`). Applying it needs a landing override of the very component the spine exists to render unmodified |
| 3 | Three planes + hairline | **COLLAPSED to one** | 7/7. Nobody defended it |
| 4 | "One filled pill per viewport" | **per screenful** | 5/7. ⚠️ **Phase 9 found the winner breaks its own restated rule once** (§9.3 P7-2) |
| 5 | Eight card families | **cut to ≤4** (winner ships 2) | 7/7; 6/7 to ≤3 |
| 6 | Landing voice licence | **taken** | 6/7; C4 declined and died at Voice 4.83 / Emo 2.83 |
| 7 | "Icons never alone" | **RESTATED** | 7/7. The file already contradicts itself in §Progress surfaces. Restatement: an icon never carries meaning alone *unless* it is a redundant channel for text in the accessible name |

### 7.2 ⚠️ Contested #2's rule was stated incompletely, and Phase 9 corrected it

Phase 8 §13.4 states the shape rule as *"Outer surfaces 24px. Result cards 22px. The CTA pill 999px.
The landing chooses none of them."* and calls it *"a documented rule followed everywhere."*

`DESIGN.md:96` actually reads:

> Radius scale: **24px** cards (`surface-card`) · **18px** inputs · **14px** nested cards ·
> **999px** buttons/pills/chips. Pick from the scale, never invent.

**Phase 8's Finding 2 also misreads this file.** It claims *"`DESIGN.md` §App-UI guardrails bans
nested cards."* It does not — line 96 gives nested cards a radius and line 216 uses it. (Line 357
bans *card mosaics on content pages*, a different rule. `impeccable` bans nested cards; `DESIGN.md`
does not.)

**The real defect is the shape, not the nesting:** `DemoCheckCard` renders `.result-card` at **22px**
inside `.surface-card` at **24px**, where the documented nested scale is **14px**. A 2px delta is
the worst available answer — too different to read as one surface, too similar to read as two.

**Corrected rule, for Phase 10A and 10B:**

> **Outer surfaces 24px · inputs 18px · nested cards 14px · result cards 22px · pills 999px.
> The landing chooses none of them. `.result-card` nested inside `.surface-card` is the one place
> the product already violates its own scale, and the landing inherits the violation rather than
> papering over it.**

**Phase 8 §13.6 item 4 is withdrawn.** Phase 10B's obligation is not "do not restate a nested-card
ban" — there is none. It is to **reconcile the documented radius scale with `DemoCheckCard`**, in
one direction or the other.

---

## 8. The tournament result — contenders, scoring, kills, organs

### 8.1 The seven personas and contenders

| | Persona | Theory of failure |
|---|---|---|
| P1 | **Conversion Surgeon** (`icopywriting`, `icro`) | Not a page — thirteen pages stacked. The mechanism is feature #1 of 9, in a grid, at y≈5,500px |
| P2 | **Restraint Architect** (`apple-design`, `impeccable`) | Five systems all saying "new section here" when space alone would have said it |
| P3 | **Design Engineer** (`emil-design-eng`, `taste-skill`) | Describes the product nine ways and shows it once, inside a `.landing-phone` that has held no phone since 2026-07-27 |
| P4 | **Clinical Trust Officer** (safety docs) | Treats its best asset as fine print |
| P5 | **Legibility Realist** (`iui-ux-pro-max`) | The argument is fine; the page is 12,942px with a 5,090px stretch containing no way to act |
| P6 | **Anxious Patient** (ICP, `PRODUCT.md` §Users) | Shows a frightened person a food they thought was fine being taken away, then says "calm" three times |
| P7 | **Adversarial Killer** | Six of thirteen blocks would work unedited on a project-management site |

### 8.2 The weights and the scoreboard

The owner chose the **`Craft 16 + Emotional fit 14`** rebalance before any card was written.

| D1 Cat | D2 Belief | D3 Honesty | D4 Voice | D5 Legib | D6 **Craft** | D7 IA | D8 **Emo** | D9 Impl | D10 Dur |
|---|---|---|---|---|---|---|---|---|---|
| 10 | 12 | 12 | 10 | 10 | **16** | 8 | **14** | 6 | 2 |

Scale 1–10. Weighted total = Σ(score × weight) ÷ 10, so a flat-7 page scores 70.0.
Bands: STRONG ≥ 71.0 · CONDITIONAL 62.0–70.9 · WEAK 55.0–61.9 · KILL < 55.0.
7 personas × 6 contenders, no self-scoring: 42 cards, 420 dimension scores.

| Rank | Contender | Rebalanced | As-written | Dims won |
|---|---|---|---|---|
| **1** | **C3 — One Card Back** | **71.83** | **70.72 (1st)** | Craft |
| 2 | C1 — The Six-Month Gap | 68.00 | 68.89 | IA, Impl½ |
| 3 | C2 — Is This One Okay? | 66.83 | 66.93 | — |
| 4 | C6 — Tonight | 65.37 | 64.20 | Voice, Emo |
| 5 | C5 — Within Reach ☠ | 62.20 | 64.92 | Legib, Impl½ |
| 6 | C4 — Built for One Number ☠ | 61.43 | 64.27 | Cat, Honesty, Dur |
| 7 | C7 — It Asks First ☠ | 59.00 | 58.79 | Belief |

**C3 wins under both constitutions.** The rebalance widened its lead over C1 from 1.83 to 3.83 and
decided which of C5 and C6 died. It did not choose the winner.

### 8.3 The three kills — specialists, not weak pages

| Killed | The exact decision that ended it | Convicted on |
|---|---|---|
| **C5 — Within Reach** | Kept **nine of thirteen** incumbent blocks and bolted a `position: fixed; bottom: 0` bar across 7,900 of 8,600px to make nine blocks reachable. Solved the desert with an element instead of a page | Craft **3.33** (2–4 from all six) |
| **C4 — Built for One Number** | Dropped `landing-audience-pains` entirely — the only contender that does — and put three educational definition rows in the recognition slot. Plus the H1's second sentence, `If yours isn't in it, this isn't for you.` | Emo **2.83** (2–3 from all six) |
| **C7 — It Asks First** | Deleted the eyebrow on principle, leaving a headline about a competitor as the only thing above the fold | Category **3.00** — the only unanimous score in 420 |

### 8.4 The organs, and where each landed

| From | Organ | Verdict | Displaced |
|---|---|---|---|
| **C4** | Scope in the H1 at headline size | **GRAFTED** | C3's H1 (relocated verbatim to the card caption) **and the eyebrow** |
| **C5** | The reachability rule, without the bar | **GRAFTED**, restated | nothing — block 3 gains an exit |
| **C7** | The two-column behaviour comparison | **REJECTED**, three reasons | — |
| **C7** | `border-top` on the block not `<hr>`; 2px focus offset | **GRAFTED** (rider) | the `<hr>` |
| **C7 / C1** | `Type "oatmeal" and see what it asks you.` | **GRAFTED** | nothing — it is the desert fix |
| **C6** | `Blank days are just blank.` (promoted out of grid cell nine) | **GRAFTED** | half of C3's fourth offer claim |
| **C6** | The cancel paragraph at equal weight to the price | **GRAFTED** | nothing (+90px) |
| **C4** | `--text-soft` banned by block | **GRAFTED** | review-time judgment |
| **C2** | One body size, 17px / 1.65 | **GRAFTED** | C3's 16.5–17px range |
| **C5** | 44/48px target test · `prefers-reduced-motion` test | **ADOPTED** | two prose-only rails |

**C5's rule could not be taken literally.** *No stretch longer than 667px may lack a reachable
primary action* means **eleven exits** on a 7,200px page, and there is one way to get eleven exits
without eleven CTAs: a fixed element. **C5's rule entails C5's bar.** Restated at the level it holds:

> **No stretch may exceed 1,460px at 375px — the shortest longest-desert any contender achieved
> without a fixed element (C1, the IA winner). Deserts are measured in pixels, at 375px, and
> reported in the spec.**

**Why C7's comparison was rejected, three reasons in order of force:** the ruled tiebreak (C5's
organ has precedence, and the comparison pushes the desert past 3,000px) · **spine incompatibility**
(C3's rule is *every claim is attached to a rendered object*, and the comparison's left column has
no object by its own non-severable refusal) · the claim family was uncleared. **Phase 9 has now
ruled the family unavailable at any scale (§9.1 C), so reason 3 hardens into a bar** — but reason 2
was always independent of it.

---

## 9. Everything that was found — the substance

Three tiers, in the order they should change what gets built.

### 9.1 Phase 9's three falsified premises — the governance layer

**A. `Most apps would just pick one and sound confident.` was never an approved ledger row.**

```
$ grep -c "Most apps" docs/safety/copy-ledger.md   →  0
$ grep -rn "Most apps" app/ components/            →  app/page.tsx:523-524
```

Phase 6 calls it *"a ledger row that has passed the audit."* Phase 7 §11.7.2 builds a seven-instance
escalation ladder on *"the **approved** ledger row."* Phase 8 takes *"the most conservative rung."*
It is unledgered shipped source. **There is no rung.**

**B. `copy-ledger.md` has two genres of row, and the tournament treated them as one.**
`result-*` rows are verbatim and test-pinned (`disclaimer-line.test.ts` pins `result-footer`
character-for-character). `landing-*` rows record a section's **intent**: `landing-hero-moment`'s
Copy column describes a hero (*"Dinner is on the table…"*) that `git log -S` shows never existed in
`app/page.tsx` — and the row was written in the same commit (`5cdb5d9`) that shipped the hero it
supposedly covers. "Walk every string against the ledger" is not executable for the landing.

**C. Nothing connects the ledger to the source, in either direction.** §5.2. That is how (A)
survived four phases: nothing could go red.

### 9.2 Phase 8's five code findings — the implementation layer

1. **C3's radius/border delta was measured against the wrong card.** Settled Contested #2 (§7.1).
2. **The demo card is a nested card** — `.surface-card` wrapping two `.result-card`s, imported by
   three routes. Named, not fixed; a product change. ⚠️ **Phase 9 corrected the reason** (§7.2).
3. **The one-family proposals were audited against the wrong pin.** Settled Contested #1 (§7.1).
4. **The 16px fineprint floor holds by source order, not specificity.**
   `.landing .result-disclaimer` and `.result-fineprint .result-disclaimer` have identical
   specificity (0,2,0); the landing wins only by being later in the file. Correct, fragile, and
   invisible to the duplicate-`font-size` pin. **Phase 10A must comment the ordering dependency
   ON THE RULE; Phase 10C must not move the block.**
5. **A hand-typed caption would duplicate a label the component computes.** `demoExampleEyebrow()`
   (AUD-008) renders `An illustrated example` and swaps to `A real check, captured <date>` when a
   live capture is authorised. Block 3's caption dropped the label. ⚠️ **Phase 9 found the winner
   reproduced the same hazard in the hero card** (§9.3 P4-2).

### 9.3 Phase 9's fifteen red-team findings — the copy and craft layer

**P7 — the Adversarial Killer**

- **P7-1 · The most generic surviving structure is block 6's close, not the price tiles.** Four
  elements, every one a restatement of the hero, no object, proves nothing. *On the tiles: reason,
  not excuse* — they render from `paywallMode()` / `resolvePriceVariant()` and the middle tile
  carries the least portable sentence on the page (`Day 5, we email you the exact date and the exact
  amount…`). **The falsifiable test: if that sentence ever leaves the tile, the tiles become the
  generic thing and should go.**
- **P7-2 · The winner breaks its own restated "one filled pill per screenful."** Blocks 5 and 6 put
  two filled pills **250px apart** at 375px — simultaneously visible. The reachability rule (≤1,460px)
  and the pill rule (≥667px) collide at the page's foot and nobody noticed.
- **P7-3 · Block 2 ships the exact sentence the Brief lists under "What only sounds like it does"**
  (§6.1). Three negations in a row, four lines above the highest-intent pre-pricing exit.
- **P7-4 · The em-dash metric is wrong.** "4 strings, 5 characters, all unstrippable" omits two in
  the FAQ answers, neither pinned — and the winner already stripped a third from the adjacent
  answer, so it is an oversight, not a policy.
- **P7-5 · The hero card and block 4's card 1 are byte-identical** — same meal, same
  `result-safe-example` — under an H2 reading `The same card, three times.` The page whose central
  diagnosis was a duplication census reintroduced a verbatim duplicate of its own centrepiece.
- **P7-6 · A Tier B pin is preserved at the cost of grammar.**
  `Unlimited checks, and A record you can actually show someone: …` — a capital `A` mid-clause,
  because lowercasing it would fail `landing-wiring-pins.test.ts`'s count assertion.
- **P7-7 · The top Product Hunt comment.** Upvoted: *"The clarifying question is the whole product
  and I did not expect to care."* **Critical, and correct and currently unanswerable:** *"Three
  example cards is not a demo. $12.99/mo after ten checks is a lot of trust to extend to a page
  where every card is labelled 'illustrated example'."*

**P4 — the Clinical Trust Officer**

- **P4-1 · THE RULING (§9.1 C above and §6.3 below).**
- **P4-2 · The card walk clears, and the result is better than Phase 8 feared.** Every card *body*
  on the page is already-approved verbatim `result-*` copy — hero Clear card, all three block-4
  cards, the demo, and the disclaimer. **The winner invents no new card body copy at all.** The one
  exception is the hero card's hand-typed label `An illustrated example`, character-for-character
  `demoExampleEyebrow(null)` — Finding 5's hazard, reproduced. **This makes the `<ExampleResultCard>`
  recommendation load-bearing rather than nice-to-have.**
- **P4-3 · The copy deck breaks a Tier A guarantee the pin ruling never listed.** `5` typed where
  `copy-pins.test.ts:105` requires `{FREE_DAILY_CHECKS}`. Tier A gains a tenth pin.
- **P4-4 · The winner silently drops a flag branch that a test pins in both directions.** Tier B
  gains a fourth retirement (§5.3).
- **P4-5 · Rails walked.** Rail 2 passes on rows that **already exist**, which is stronger than
  Phase 8 claimed. Rail 5 survives the FAQ move (it never rested on the FAQ). **Rail 16 is new.**
- **P4-6 · Phase 8's Finding 2 misreads `DESIGN.md`** (§7.2).

**P6 — the Anxious Patient**

- **P6-1 · Where I feel judged: the first seven words, and the sub is what saves them.** `only` is
  C4's market-shrinking, and C4 died at Emo 2.83. What rescues the H1 is five words of the next
  line — **`the plate in front of you`**. Second person, present tense, concrete object. **This is
  load-bearing: any pixel optimisation that cuts those five words makes the fold colder and the H1
  cannot absorb it.**
- **P6-2 · The block-2 sandwich does not hold on mobile.** The top slice (hero card) is off-screen
  before block 2's H2; the bottom slice (block 3's demo) is ~1,400px — two full screens — below. The
  sandwich exists in the section map, not in the viewport.
- **P6-3 · Where I feel managed: block 3's caption.** Being told the moral of a scene you just
  watched. **P4 and P6 converge on the same string for unrelated reasons** — the strongest signal in
  the section that the change is right.
- **P6-4 · Better than when I arrived**, and the mechanism is nameable: the first artifact is a card
  that says something you ate is **fine**, then a caption saying that is the whole answer, then
  nothing happens. Nothing is scored. Nothing is logged. No number is assigned to you. That is what
  the incumbent could not do.

### 9.4 The structural findings from Phases 6–7 that still matter

- **The kill line is Emotional fit, and it is a cliff, not a slope.**
  `C4 2.83 · C7 3.83 · C5 4.17 —— void of 2.83 points —— C1 7.00 · C2 7.00 · C3 7.67 · C6 8.83`
  The largest gap in any dimension's distribution on the board. Seven personas did not treat warmth
  as a dial; they treated it as a decision either taken or refused.
- **The tournament punished troughs; it did not reward peaks.** 13 sub-5.0 dimension means exist;
  the three dead pages hold 8 of them and the winner holds zero. The two highest single-dimension
  scores in the tournament — C5's Legibility 9.33 and C4's Honesty 9.17 — both belong to corpses.
- **In every dead page, the winning organ and the killing defect are the same object.** No survivor
  has this property. It is why organ extraction was load-bearing rather than a courtesy.
- **Honesty and warmth are not separable on this page.** C4 wins three dimensions worth 24 weight,
  holds the only 10 in 420 scores, and finishes sixth on Emo 2.83. The counter-proof is C6: P4
  scored it a **3 on honesty and a 9 on emotional fit in the same card.**
- **The clarifying question was buried, and all seven found it independently.** 7/7 promote
  `It asks before it guesses` from grid cell #1 of 9 to a first-class block. The strongest
  convergence in the tournament, and it had never been written down.
- **All three dead contenders predicted their killing score in writing and shipped anyway.**
  **Naming a defect is a discipline. It is not a fix.**
- **The research disclosure — ruled.** The content survives, the component does not. 6/7 deleted
  `.landing-proof-band`; C4 kept it only by neutering the left column. **A component whose primary
  affordance must be disabled for the content to be safe is the wrong component.** C4's two
  sentences plus the `Read the sources and the limits` link ship as ~180px of prose in block 4.
- **Smaller, still true:** the single card shadow is the only `DESIGN.md` rule with an unqualified
  7/7 endorsement · the pains list is right and its container is wrong (6/7 keep the words, 4 change
  the format) · nobody proposed scroll reveals anywhere (4/7 ship zero motion) · two C6 headlines
  were killed for rail breaches **by their own author** and must not be resurrected · the DPP
  statistic is denied to all seven by rail 6.

---

## 10. The winner — `W — One Card Back`, with all eleven Phase 9 fixes applied

**Spine: C3 (P3, The Design Engineer).** The name is inherited deliberately: roughly 90% of the page
is C3 unchanged.

**Thesis.** The page's unit of composition is the product's own artifact — the result card, rendered
in the live classes at three moments of doubt — with whitespace doing the sectioning, **the headline
saying who it is for**, and one earned piece of motion carrying the only idea on the page that is
temporal.

### 10.1 Section map, post-Phase-9

| # | Block | Purpose | Exit at y ≈ |
|---|---|---|---|
| 1 | Nav + hero | Who it is for, and the artifact at its calmest | ~665 (filled) |
| 2 | The gap | Why you are here | ~1,965 (filled) |
| 3 | **The pause** | `<DemoCheckCard />`, the one motion, the dare | ~3,355 (**text link**) |
| 4 | Three answers | The card at three verdicts, then where the reasoning comes from | ~4,735 (filled) |
| 5 | The offer | Price, funnel, cancel, four remaining claims | ~6,185 (filled) |
| — | **Fair questions** | Four `<details>` — **moved above the final CTA** | — |
| 6 | Close | Final exit only — H2 and sub deleted | ~6,675 (filled) |
| — | Footer | Nav + disclaimer | — |

**~6,865px · ~10.3 screens · six exits · longest desert 1,450px.**

**Desert map:** 1,300 · 1,390 · 1,380 · **1,450** · 490. All under the 1,460px budget.

⚠️ **These are estimates carried forward with deltas. Phase 10A owes a browser measurement** — that
is the half of C5's organ the winner adopted, and §10.4 is the first place it has to be spent.

| | Incumbent | Winner |
|---|---|---|
| Content blocks | 13 | **6** |
| 375px length | 12,942px · 19.4 screens | **~6,865px · 10.3 screens** |
| Longest CTA desert | 5,090px | **1,450px** |
| Card families | 8 | **2** |
| Eyebrows | 4 | **0** |
| Background planes | 3 + hairline | **1** |
| Rendered em dashes | 42 | **4 strings, all unstrippable** (true after fix 6) |
| Rails with tests | 8 of 15 | **10 of 16** |

### 10.2 The eleven Phase 9 fixes

| # | Where | Change | From |
|---|---|---|---|
| 1 | Block 3 caption | `Most apps take the same four letters and return a confident number.` → **`Without that one question, Revora would have been guessing.`** | P4-1 + P6-3 |
| 2 | Block 6 | **Delete the H2 and sub.** Move the FAQ between block 5's CTA and the final CTA | P7-1 + P7-2 |
| 3 | Block 2 scope note | **Delete** `Not a general nutrition app, not a calorie counter, not built for everyone.` | P7-3 + P6-2 |
| 4 | Block 4 lede | Add `The first card is the one from the top of this page, next to the two you have not seen.` | P7-5 |
| 5 | Hero sub | 40 words → **33**; drop the duplicated latency claim | `taste-skill` §4.7 |
| 6 | FAQ, both branches | Strip two uncounted em dashes | P7-4 |
| 7 | Legacy tile + legacy FAQ | `5` → `{FREE_DAILY_CHECKS}` / `${FREE_DAILY_CHECKS}` | P4-3 |
| 8 | Hero card label | Render from `demoExampleEyebrow(null)`, not hand-typed prose | P4-2 |
| 9 | Pin ledger | Tier A **10** pins; Tier B **4** retirements | P4-3, P4-4 |
| 10 | Shape rule | Restate to the full documented scale; name the 22px-in-24px violation | P4-6 |
| 11 | Block 5, first offer claim | Lead with the pin instead of embedding it | P7-6 |

### 10.3 The amended copy deck

Verbatim and paste-ready. `{TASTER_LIMIT}`, `{monthlyPrice}` and `{FREE_DAILY_CHECKS}` are
interpolated, never typed. Strings marked *(ledger)* are approved rows and must not be edited.
**Changes from Phase 8 §4 are marked ⟵.**

**Nav** — Wordmark `Revora` · links `How it works` · `Pricing` · `Pantry Review` · nav CTA (ghost,
persistent ≥ 880px) `Check a meal`

**Block 1 — Hero**
- Eyebrow: **none.** Its seven words are the H1.
- H1: `A meal checker built only for prediabetes.`
- Sub ⟵: `Describe the plate in front of you. One card back: where it lands, why, and a change worth making when there is one. For an A1C of 5.7% to 6.4%. Nothing to log.`
- CTA: `Check your first meal — free` *(ledger)*
- CTA caption: `{TASTER_LIMIT} free checks on your first day, then you decide.`
- Visual half — a real result card at Clear, in the live classes:
  - Label ⟵: rendered from `demoExampleEyebrow(null)`, **not typed** → `An illustrated example`
  - Meal: `Grilled chicken, brown rice, and a side salad` *(ledger, `landing-three-answers`)*
  - Verdict: `Clear` (icon + label, the only tinted row)
  - Why: `This looks like a reasonable fit. The meal already has protein and vegetables, so it looks more balanced than a fast-carb-heavy option.` *(ledger, `result-safe-example`)*
  - Fineprint: `{BOUNDARY_DISCLAIMER}` *(rendered by `<DisclaimerLine />`, never retyped)*
- Caption under the card, outside it: `This is the whole screen. No score, no dashboard, no change to make: this meal already looks balanced, so that is the whole answer.`
- Trust strip *(ledger `home-trust-strip`, verbatim)*: `No login for your first checks.` · `When we're unsure, we say so.` · `If you ever subscribe, cancel is one tap — not an email.`

**Block 2 — The gap**
- H2: `Six months is a long time to guess.`
- Lede: `You were handed a number, two words of advice, and an appointment half a year away. Everything in between is supposed to be your job to figure out.`
- Four items, a plain `<ul>` with bold lead-ins — no card, no border, 28px row gap:
  - `The advice was two words long.` `"Eat better." Better than what? Is oatmeal fine? Is the sandwich at lunch a problem? Nobody said, and the appointment is in six months.`
  - `Every article contradicts the last one.` `Fruit is fine, fruit is sugar. Rice is out, brown rice is in. You have read all of it and you still do not know about the plate in front of you tonight.`
  - `The apps want you to become an accountant.` `Weigh it, log it, scan the barcode, hit your macros. You did not ask for a second job. You asked what to do about dinner.`
  - `So you guess, and then you worry.` `You eat the thing, and spend the next hour wondering whether it was a mistake. That loop is the actual cost of being told nothing.`
- Scope note ⟵: `Revora exists for that gap and nothing else. If your A1C sits outside 5.7% to 6.4%, it says so plainly and points you to a clinician instead of pretending.`
- CTA: `Check your first meal — free` · caption: `No login, no card, nothing to install.`

**Block 3 — The pause**
- H2: `It asks before it guesses` *(Tier B pin, kept)*
- Lede: `Four letters is not enough to answer honestly, so Revora does not answer yet. Plain oatmeal and sweetened oatmeal are different meals. Watch what happens.`
- `<DemoCheckCard />`, full width, with the motion in §10.5. **The component renders its own `An illustrated example` label (AUD-008); nothing here repeats it.**
- Caption ⟵: `Without that one question, Revora would have been guessing.`
- Exit, as a text link on its own line, not a pill: `Type "oatmeal" and see what it asks you.` → `/check`
- **No filled CTA. No button under the pause.**

**Block 4 — Three answers**
- H2: `The same card, three times.`
- Lede ⟵: `One layout, whatever the answer is. The first card is the one from the top of this page, next to the two you have not seen. The Clear card carries no change to make, because when a meal already looks balanced Revora says so and stops. It does not invent a correction to look useful.`
- Card 1 — `Grilled chicken, brown rice, and a side salad` · `Clear` · `This looks like a reasonable fit. The meal already has protein and vegetables, so it looks more balanced than a fast-carb-heavy option.` — **no adjustment, no swap**
- Card 2 — `A bagel with jam and a glass of orange juice` · `Be careful` · `This may have a higher blood-sugar impact than a more balanced meal because it leans heavily on refined carbs.` · `Adjustment:` `If practical, add protein or nonstarchy vegetables to make it easier to handle.`
- Card 3 — `A large soda with fries on the side` · `Hold off` · `This is likely a higher-impact choice in its current form because it is mostly sugary or refined carbs.` · `Swap:` `A smaller portion with protein or nonstarchy vegetables would be a steadier fit here.`
- Note: `Illustrated examples. Every card ends with the same line: Revora is informational only and is not medical advice.`
- CTA: `Check your first meal — free`
- **Then, as the block's closing footnote** *(C4's copy, verbatim)*:
  - `Revora's general meal-planning principles map to public-health guidance and cited nutrition research — that carbs raise blood sugar, that pairing them with protein, fibre or nonstarchy vegetables can slow the rise, and that less-refined carbs generally land more gently than highly refined ones.`
  - `Those sources support narrow educational statements about food. They are not evidence that Revora produces a particular health result, and nothing on this page claims otherwise.`
  - Link: `Read the sources and the limits` → `/how-it-works`

**Block 5 — The offer**
- H2: `Ten free checks, then a week, then a decision.`
- Trial tiles:
  - `Day 1` · `{TASTER_LIMIT} free checks` · `Check up to {TASTER_LIMIT} meals on your first day, no login and no card. They live on this device.`
  - `Days 2–8` · `7 days free` · `Card required, nothing charged. Day 5, we email you the exact date and the exact amount, with a one-tap cancel link in it.`
  - `After your free week` · `{monthlyPrice}/month` · `Or $99.99 a year, which is $8.33 a month. Cancel in one tap, effective at the end of the period.`
- Legacy tiles ⟵: `Day 1` · `{TASTER_LIMIT} free checks` (same body) · `Every day` · `A free account` · `No card. A free account still includes {FREE_DAILY_CHECKS} free checks a day, still no card, with your history saved to your account.` · `Premium` · `{monthlyPrice}/month` (same body as trial tile 3)
- **Cancel paragraph, at the same weight as the price** *(C6, verbatim)*: `Stopping is one tap on your account page, effective at the end of the period. No retention screen, no "are you sure", no email you have to write. We know why you are reading this paragraph carefully.`
- Four remaining claims, one line each, most-asked first, no numerals:
  - ⟵ `A record you can actually show someone: unlimited checks, every one saved, on every device.`
  - `A weekly recap in sentences. Never a grade, never a lab prediction.`
  - `One optional reminder a day, off by default. Skip a day and nothing turns red. Blank days are just blank.`
  - `Your A1C and meal text encrypted at rest, deleted in one tap, account included.`
- Pantry: `Or check the whole kitchen, once. The Pantry Review sorts what you already own into one printable report. $49, one payment, nothing renews.` Link: `See a sample report`
- CTA: `Check your first meal — free`

**Fair questions** ⟵ *moved above the final CTA* — four `<details>` rows headed `Fair questions`:
- `Is Revora medical advice?` → `No. Revora is informational only and is not medical advice. Its labels describe general meal patterns. Broad A1C-range context only makes the presentation more cautious; it does not predict your response or decide whether a meal is medically appropriate. Talk with a doctor or registered dietitian for guidance specific to you.`
- `Who is Revora for?` → `People in the prediabetes A1C range of 5.7% to 6.4%. If your number falls outside that range, Revora says so plainly and points you to a clinician instead of pretending.`
- `Do I need an account or a card to try it?` ⟵ → *(trial)* `No. Your first ${TASTER_LIMIT} checks, on your first day, need no login and no card. They live on this device only. The 7-day free trial needs a card but charges nothing for a week, and we email you before any charge.` / *(legacy)* `No. Your first ${TASTER_LIMIT} checks, on your first day, need no login and no card. They live on this device only. After that, a free account includes ${FREE_DAILY_CHECKS} free checks a day, still no card. Premium is optional, and cancels in one tap.`
- `How do I cancel?` → `One tap, on your account page, effective at the end of the paid period. No retention screens, no email hoops. Deleting your account removes your data with it.`

**Block 6 — Close** ⟵ *H2 and sub deleted*
- CTA: `Check your first meal — free`
- CTA caption: `No login. No card. {TASTER_LIMIT} free checks on your first day.`

**Footer** — as incumbent: four columns (Product / Learn / Legal / Apps),
`Add to home screen — works today`, and `{BOUNDARY_DISCLAIMER}` rendered in full.

### 10.4 Visual system deltas

| Delta | From | To |
|---|---|---|
| Planes | 3 + hairline | **1** (`--page-bg`); white is card-only material |
| Card radius / border / shadow | 8 landing families at 24px | **inherited, unchanged.** See §7.2 for the full scale |
| Card families | 8 | **2** (result card · price tile on the `.surface-card` recipe) |
| Type pairing | Jakarta + Source Sans 3 | **unchanged** (Contested #1) |
| Body type | 16.5–17px range | **17px / 1.65, one value** |
| Measure | unspecified | `62ch` on prose; `text-wrap: pretty` on prose, `balance` on h1–h3 |
| Eyebrows | 4 | **0** — de-duplication, **not C7's delete-on-principle** |
| Sectioning | plane change + 1px `<hr>` | `clamp(72px, 10vw, 128px)` air + `border-top` **on the block** *(C7's rider)* |
| H1 scale | `clamp(2.4rem, 6vw, 3.8rem)` | `clamp(1.9rem, 5.6vw, 2.9rem)` |
| Nav CTA | ghost | ghost, persistent ≥ 880px |
| CTA press | `--dur` 200ms hover/active | `translateY(1px) scale(0.98)`, 120ms `cubic-bezier(0.23, 1, 0.32, 1)`, on pointer-**down**; `transition-property: transform, background-color`, never `all` |
| Focus ring | `rgba(13, 95, 87, 0.45)` | unchanged, **2px offset on cards** *(C7's rider)* |
| Card fineprint | 14px (13px inside `.result-fineprint`) | **16px on the landing**, one declaration ⚠️ **source-order dependency, Finding 4** |
| `--text-soft` | used by review | **banned by block** in 1, 2, 3, 5; permitted in 4 only on the `Illustrated examples.` note |
| `.landing-phone` | a class that contains no phone | **`.landing-hero-proof`** |
| `.landing-proof-band` | 4-column stat strip, ~700px | **deleted**; content survives as ~180px of prose in block 4 |

### 10.5 Motion — one animation on the page

**The pause (block 3).** When the demo card enters the viewport:

| Beat | Element | Property | Timing |
|---|---|---|---|
| 0ms | `You type: oatmeal` | already visible | — |
| 0ms | clarify block | `opacity 0 → 1`, `translateY(6px) → 0` | 220ms, `cubic-bezier(0.23, 1, 0.32, 1)` |
| **+520ms** | `You answer:` + result card | `opacity 0 → 1`, `translateY(6px) → 0` | 240ms, same curve |

The 520ms gap is the point: the product's willingness to wait, made visible. Not a loading
simulation, not a typewriter effect; nothing pretends to be computing.

**Non-negotiable constraints:** the animation **enhances an already-visible default** (the card
ships rendered at `opacity: 1`; an `IntersectionObserver` adds a class — a headless render, hidden
tab or JS failure ships the complete card) · **`transform` and `opacity` only** · runs **once**
(`{ once: true }`, `amount: 0.4` — the card is ~600px tall at 375px) ·
**`prefers-reduced-motion: reduce` → the class is never added**, gated in both CSS and JS · **two
CSS transitions exist site-wide: CTA press and link colour.** No scroll reveals anywhere.

### 10.6 The winner's own failure modes

- **~3,000px of informational surface is gone** with the feature grid and how-it-works block. If
  visitors were converting off feature #7 of nine, this page will never report a loss that specific.
- **The 520ms pause is still misreadable as slowness.** The dare link answers C7's *rhetorical*
  objection; it does not answer the perceptual one.
- **The page's strongest claim is now *the landing shows the product's card, unmodified*** — true
  only while nobody adds a landing-scoped override. `promise-registry.test.ts` pins the demo's
  **strings**; nothing pins its **recipe**. **Phase 10C should consider a test that fails when a
  `.landing*` selector declares `border-radius` or `border` on `.result-card` or `.surface-card`.**
  ⚠️ Phase 9 sharpens this: **the product's card already violates the product's own radius scale**
  (§7.2), so "unmodified" currently means "inheriting a documented inconsistency."
- **Four of five cards are fixtures**, and P7-7's critical comment is the honest consequence.

### 10.7 The four trade-offs — attempted, rejected, recorded

1. **Block 2 has no reassuring object on screen for 1,060px.** The only remedy is a rendered card,
   and the only cards available are verdict cards — which would break the spine's
   white-means-product rule and put a verdict next to a description of the reader's failures.
   **Rejected.** The fixable half (the narrowing sentence) is taken in fix 3.
2. **Two filled pills remain inside one 667px viewport at the page's foot.** Fix 2 widens the gap
   from 250px to ~490px and reorders the FAQ so the final pill earns its place, but no arrangement
   both keeps an exit after the objections and separates the pills by a full screenful. **Fallback
   specified:** make block 6's exit a text link on block 3's pattern.
3. **The hero sub is 33 words against `taste-skill` §4.7's 20-word hard rule.** Both clauses that
   would close the gap are load-bearing — the scope range is C4's graft (Category 8.67) and
   `a change worth making when there is one` is rail 4 in words. **Accepted deviation, browser
   measurement owed.**
4. **`app/page.tsx:523-524` ships the comparative-confidence family today.** The winner deletes the
   block it lives in, so shipping the winner *incidentally* fixes it — **and not shipping the winner
   leaves it in place.** Flagged to counsel independently of ship/no-ship.

---

## 11. Standing rulings — do not reopen without a genuinely new reason

### 11.1 The comparative-confidence ruling (Phase 9, binding)

**Unavailable at any scale.** `docs/safety/claims-boundary.md` defines **nine** allowed claim classes
and **every one is about Revora** — `product-role`, `prompt-scope`, `prompt-policy`,
`result-qualitative-impact`, `result-adjustment`, `clarification-route`, `refusal-route`,
`out-of-scope-routing`, `disclaimer-footer`. **There is no class under which a statement about
another company's product can be filed**, and `validate-safety-contract --claims-boundary` rejects a
row whose class does not resolve. The sentence is neither approved nor banned; it is **outside the
schema**. Creating a class is a governance decision for counsel, not a copy decision.

The **scale question** is moot as posed — there is no approved sentence to reason from (§9.1 A).
`Most` → `Every` is separately out on `FTC-HEALTH-COMPLIANCE` substantiation grounds, independent of
the ledger question.

### 11.2 The other closed questions

- **The three kills** (§8.3) and **the organ assignments** (§8.4).
- **The research disclosure** — content survives as prose in block 4, the band does not (§9.4).
- **Contested #1 (keep the second typeface) and #2 (inherit the radius)** (§7.1), with #2's rule
  corrected in §7.2.
- **The FAQ JSON-LD mismatch — CONFIRMED ABSENT, and Phase 8's reason was wrong.** Placement is
  irrelevant: `app/page.tsx:104` declares `faqs` once and **both** consumers map the same array
  (visible `<details>` at :857, `mainEntity` at :161). The mismatch is impossible **by construction,
  in the incumbent, today.** The three contenders flagged a defect they would have *introduced*.
  This is what makes fix 2's FAQ move free. **Phase 10C: pin the shared-array invariant — it is
  currently guaranteed by a code comment.**
- **P5's visible ranking:** the ordering principle survives, the rendered numerals do not.

### 11.3 The banned list Phase 10B inherits verbatim

1. **The winning organ and the killing defect must not be the same object.**
2. **A named defect is not a mitigated defect.**
3. **No dimension below 5** — a page is scored on its floor, not its peak.
4. **Emotional fit below 5 is fatal, independent of everything else.**
5. **A diagnostic is not a design brief.** C5 built from a pixel measurement, C4 from the rail table,
   C7 from a portability test. Each passes its own instrument and loses the reader.
6. **A rail passed by deletion is a rail with no subject.**
7. **NEW (Phase 9): a ledger row that records a section's intent is not a pin.** The two genres of
   row must not be cited interchangeably (§9.1 B).
8. **Confirmed anti-patterns, with vote counts:** eight card families (0/7 defend) · three planes +
   hairline (7/7 collapse) · `Step N` eyebrows (7/7 delete) · an eyebrow above every section (7/7
   cut to ≤1) · a how-it-works block selling typing and talking while `photoInputEnabled()` is false
   (7/7 retire) · a fixed conversion element held across a whole page · deleting the category answer
   to avoid a trope · replacing the recognition moment with definitions.

**Explicitly NOT banned — Phase 10B will be tempted:** three price tiles (4/7 keep, and Phase 9
ruled them a reason not an excuse, with a falsifiable test) and the 24px card radius (no
convergence; settled as inherited).

---

## 12. Traps and gotchas

1. **Skills bind.** Invoke and hold before any judging, spec or editing work: `impeccable`,
   `iui-ux-pro-max`, `taste-skill:taste-skill`, `apple-design`, `emil-design-eng`, `icopywriting`,
   `icro`. A contender that violates the standard of the skill it is built on is scored down by
   every judge including itself.
2. **`taste-skill` bans em dashes outright; Revora's approved CTA contains one**
   (`Check your first meal — free`). The em dash stays because it is approved ledger copy. Do not
   silently strip them — that breaks `copy-pins` and the approved CTA. **The winner's count is now
   a true 4 after Phase 9's fix 6.**
3. **Rail 14 (light surface, no dark bands) is immutable this round.** Owner instruction 2026-07-27.
   Pulling it would require re-running Phase 5, not just Phase 6.
4. **Do not "fix" the Clear card** by giving it an adjustment. `assertNoUnsafeSafeFields` throws on
   it in the engine.
5. **`Revora_Brand_Positioning_v2.md` is a tombstone** and `docs/archive/` is not an approved
   source. `docs/product-marketing.md` is the only active positioning source.
6. **The rejected claim in `PRODUCT.md` §Rejected claims must never be resurrected** — ledger row
   `onboarding-reversal-line`, Rejected, pending counsel Q8.
7. **The two rejected C6 headlines must not be resurrected:** `You can probably eat it.` (implies a
   safety finding — rail 1) and `Most meals come back Clear.` (unverifiable output-distribution
   claim — rail 2). Both were killed by their own author.
8. **The DPP statistic stays off the landing.** Rail 6 and family `study-association`.
9. **The comparative-confidence family is RULED, not open** (§11.1). Cite the reason (no claim
   class), not a vote. **Do not reopen.**
10. **C7's `You type: oatmeal` line must never be an `<input>`.** It looks like one. Static text,
    non-focusable, no caret. Still live, since the demo card renders that line.
11. **Contenders were paper, not code.** If live variants are ever wanted, ship each as a route
    under `/lab/v1..v7` in a git worktree and score screenshots.
12. **Only ever run one `next dev`.** §2.
13. **`~/.claude/skills/gstack/` does not exist on this machine.** All gstack helper commands
    silently no-op. Use Playwright from the repo's own `node_modules`.
14. **"It passes the guards" is not clearance.** There are **three separate fences** and only one
    reads source (§5.2).
15. **Four classes of caution about this tournament's own record:**
    - Phase 6's per-dimension means are sound; **two of its narrative conclusions were not.**
    - Phase 8 found **five discrepancies** between contender specs and the code in four files.
      Assume more exist in the files it did not read.
    - Phase 9 found **three false premises in the governance documents themselves**, plus a
      misreading of `DESIGN.md` in Phase 8's own findings.
    - **Assume every document here is as unverified as the code was.** Check before citing.
16. **C6 survives on the owner's weights only.** It holds four of the five sub-5 dimension means
    among the living and the board's lowest Honesty at 5.33. **A source of two paragraphs, not of
    structure.**

---

## 13. What must be done next

### Phase 10A — Section 15 · `docs/plans/landing-tournament-winner-spec.md` **(NEXT)**

Build-ready. **Ban vague phrases:** say `padding: clamp(72px, 10vw, 128px)`, say `17px / 1.65`, name
the token. Must include:

- H1 clamp `clamp(1.9rem, 5.6vw, 2.9rem)` · body `17px / 1.65` · measure `62ch` · section padding
  `clamp(72px, 10vw, 128px)` · `text-wrap: balance` on h1–h3, `pretty` on prose
- Press `translateY(1px) scale(0.98)` at 120ms `cubic-bezier(0.23, 1, 0.32, 1)` on pointer-down;
  `transition-property: transform, background-color`, never `all`
- The 2px focus offset · `--text-soft` banned by block in 1/2/3/5
- **The corrected full shape rule** (§7.2)
- **The Finding 4 source-order comment written ON the `.landing .result-disclaimer` rule**, not only
  in the spec
- **The hero card's label sourced from `demoExampleEyebrow(null)`**, not prose
- **The hero sub at 33 words with a required 375px browser measurement of line count and fold
  position.** This is C5's measurement discipline and it is the first place it has to be spent.
  Phase 8's claim that deleting the eyebrow *"pulls the caption's first line to the fold"* is
  probably false as originally specified.
- Report the re-measured desert map. **If the 1,450px stretch comes back over budget, the remedy is
  to move block 4's sources paragraphs below the CTA (recovers 180px) — NOT to delete them and NOT
  to add a second filled CTA to block 4.**

### Phase 10B — Section 16 · Rewrite `DESIGN.md`

Snapshot first: `git show HEAD:DESIGN.md > /tmp/design-before.md`.

- Carry the Phase 3 verdicts **and** the contested-item settlements (§7).
- Every surviving rule states its derivation in one sentence. Scar tissue names its test file
  instead of retelling its incident. Accidents gone — including the "for content pages" scope clause.
- **The §11.3 banned list becomes explicit, including new item 7.**
- **Write rail 7's rewrite:** its purpose is now discharged *structurally* (no stat-strip affordance
  exists to put a number in), not by deletion.
- **Write new rail 16** (§5.1).
- **Reconcile the radius scale with `DemoCheckCard`** (§7.2). Do not restate a nested-card ban —
  there is none.
- Fix the documented-but-false §Type claim (`body` is still inside the `font: inherit` reset).
- Must be **shorter and more load-bearing** than 361 lines; report before/after and what was cut.
  Still a design SYSTEM — app shell, tokens, motion, icons, voice carry forward, re-derived.

### Phase 10C — Section 17 · `docs/plans/landing-tournament-implementation-plan.md`

**Requires a green `npm test` baseline first** (§2).

Section-by-section diff against `app/page.tsx` with line ranges · the `.landing-*` CSS changes ·
which tests break and why · which strings need `copy-ledger.md` rows · ordered
smallest-shippable-first work items, each independently revertible · what must NOT change plus the
test that catches it. Specifically:

- **Four Tier B retirements**, with the **journey-branch coverage MOVED, not deleted** (§5.3)
- **Two new ledger rows, not four** — the hero card caption, and the block-3 caption + dare link.
  (The two sources paragraphs also need a row. Every card *body* is already-approved `result-*` copy.)
- Delete the `.landing-proof-band` selector block
- Rename `.landing-phone` → `.landing-hero-proof`
- **Adopt C5's two tests** (44/48px targets, `prefers-reduced-motion`)
- **Pin the `faqs` shared-consumer invariant** — cheap, high value, currently a code comment
- **Consider the card-recipe-override guard test** (§10.6)
- **Separate product-level work item:** un-nest or re-radius `DemoCheckCard` (three routes)
- **Consider extracting `<ExampleResultCard>`** so the landing's example cards cannot drift from
  `.result-card`'s anatomy by hand-editing. **Phase 9 makes this load-bearing** (§9.3 P4-2)
- **Instrument the block-3 dare link separately** as the page's most important non-primary CTA
  (§9.3 P7-7)
- **Governance item, independent of ship/no-ship: route `app/page.tsx:523-524` to counsel**

### Section 18 — Decision memo

Winner + the one sentence why · what the tournament proved that was NOT obvious · what the current
page already had right, specifically and generously · the three highest-leverage changes by
impact-per-hour · what in `DESIGN.md` was scar tissue and never should have been a design rule · the
single biggest shipping risk · what only real visitors can settle.

**Three items Phase 9 adds:**
- *Not obvious:* a four-phase escalation ladder was built on a ledger row that does not exist, and
  **no test in the repository could have caught it**, because nothing connects the ledger to the
  source in either direction.
- *What the incumbent had right:* the `faqs` shared array (schema honesty **by construction**, which
  three contenders independently failed to notice they were breaking), and that **every card body on
  the winner is already-approved copy.**
- *Biggest shipping risk:* the page's central claim is *the landing shows the product's card,
  unmodified*; it has no test; **and the product's card already violates the product's own radius
  scale**, so "unmodified" currently means "inheriting a documented inconsistency."

---

## 14. Next session prompt — paste this

> Continue the Revora landing design & copy tournament. Read
> `docs/handoff/2026-08-05-landing-tournament-phases-0-9-consolidated-handoff.md` first — it is the
> consolidated state of Phases 0–9 and it supersedes every earlier handoff. Then read
> `docs/plans/landing-tournament-phase-9.md` (the red-team, which supersedes Phase 8 where they
> disagree) and `docs/plans/landing-tournament-phase-8.md` (the winner, still the spec, amended in
> eleven places by Phase 9). Open `docs/plans/landing-tournament-phase-7.md` for the kill rulings
> and `docs/plans/landing-tournament-phases-4-5.md` only for a specific contender detail.
>
> **State:** Phases 0–9 are complete. The winner is `W — One Card Back`: C3's spine, plus C4's
> scope-in-the-H1 and C5's reachability rule, plus C7's `border-top`/focus-offset rider and its dare
> line, plus two C6 paragraphs and four separable ideas. C7's comparison is rejected. The second
> typeface is kept. The card radius is inherited. The winner survived the red-team with eleven fixes
> and four recorded trade-offs; nothing structural changed.
>
> **Do not** re-score, rebuild the contenders, re-run the kill round, re-derive the convergences,
> re-open the two settled no-convergence items, re-synthesise the winner, or **re-open the
> comparative-confidence ruling** (it is unavailable at any scale because `claims-boundary.md` has
> no claim class for a statement about a third party).
>
> **Phase 10A is done.** Read `docs/plans/landing-tournament-winner-spec.md` (Section 15) as the
> build spec. It measured the winner in a browser and **falsifies §10's page metrics**: 8,621px /
> 12.9 screens, longest desert 2,224px, three of five deserts over budget. Do not re-derive those
> numbers from the plan documents.
>
> **Do next: Phase 10B — Section 16, the `DESIGN.md` rewrite.**
> Snapshot first: `git show HEAD:DESIGN.md > /tmp/design-before.md`.
> §13 of the consolidated handoff lists what 10B owes. **The spec's §13 adds three ⚖️ rulings 10B
> must take and 10A deliberately would not take alone:**
> 1. **The reachability budget.** C5's 1,460px rule is unachievable on this page; four measured
>    arrangements are in the spec's §11.2. Restate to a derived figure *and record it as a rule
>    change*, or hold the rule and cut copy. Restating a number because the page missed it is
>    banned-list item 2 — name it, do not slip it in.
> 2. **The motion-curve split.** The landing press is 120ms `cubic-bezier(0.23, 1, 0.32, 1)`; the
>    sanctioned app layer is 150ms `cubic-bezier(0.22, 0.61, 0.36, 1)`. Adopt one or document both.
> 3. **Block 5's CTA position**, if the reorder is taken: 661px of desert against C6's cancel
>    paragraph losing its adjacency to the price.
>
> Also: write rail 16 · write the corrected shape rule · **reconcile the radius scale with
> `DemoCheckCard`, and do NOT restate a nested-card ban — there is none** · rewrite rail 7 (its
> purpose is discharged structurally now) · add banned-list item 7 · be shorter and more load-bearing
> than 361 lines, and report before/after and what was cut.
>
> Invoke and hold before starting: `impeccable`, `iui-ux-pro-max`, `taste-skill:taste-skill`,
> `apple-design`, `emil-design-eng`, `icopywriting`, `icro`.
>
> Rails: light surface only, no dark bands (owner instruction). Every number from the live fact
> table (consolidated handoff §5.4). **Tier A is ten pins now; Tier B is four retirements** (§5.3).
> Do not give the Clear card an adjustment. Do not resurrect the two rejected C6 headlines or the
> DPP statistic. Do not use workflows or dynamic subagent orchestration. **Do not treat "the guards
> pass" as claim clearance — there are three separate fences and only one of them reads source
> (§5.2).**
>
> Stop after Section 16 and checkpoint.
>
> **The test debt is CLEARED.** `npm test` is green at `8c4c0e9`: **2,184 passed / 0 failed / 2
> skipped, 186 files, 164s** — under 3 minutes, not the ~26 this file used to claim. Phase 10A has
> already located the full breakage set against that baseline (six assertions; four broken `it`
> blocks in `npm test` plus one in `npm run e2e`), and **Tier B has a fifth string** —
> `Snap a photo, dictate it, or type it.` at `landing-wiring-pins.test.ts:143`, on no prior list.
> ⚠️ **`npm test` does not cover `tests/smoke/`** — that is Playwright, via `npm run e2e`. Run both.

---

## 15. Document index

| File | What it holds |
|---|---|
| **this file** | **Consolidated state of Phases 0–9. Supersedes every earlier handoff.** |
| **`docs/plans/landing-tournament-winner-spec.md`** | **Section 15: the build spec.** Tokens, type, the corrected shape rule, rhythm, CTA, motion, a11y, the block-by-block build, the CSS add/change/delete list, **and the browser measurement that falsifies §10's page metrics and desert map.** Carries three ⚖️ items 10B must rule on |
| `docs/plans/landing-tournament-phase-9.md` | **Section 14: the red-team.** Three falsified premises, the comparative-confidence ruling, fifteen findings, eleven fixes, four trade-offs, corrected rail and pin ledgers |
| `docs/plans/landing-tournament-phase-8.md` | **Section 13: the winner.** Five code findings, the graft table, the 12-part spec, thirteen rejected ideas. 831 lines |
| `docs/plans/landing-tournament-phase-7.md` | Sections 11–12: two corrections to Phase 6, the kill round, the banned list, the three organs, the research-disclosure ruling, 27 convergences, eleven lone ideas |
| `docs/plans/landing-tournament-phase-6.md` | Sections 9–10: 42 cross-scorecards, the 7×7 matrix, per-dimension winners, ranked scoreboard, eight disagreement rulings. 1,096 lines. ⚠️ Two narrative conclusions known-wrong |
| `docs/plans/landing-tournament-phases-4-5.md` | Sections 7–8: the pin ruling, the seven personas, the seven contenders with verbatim copy decks. 2,383 lines |
| `docs/prompts/2026-08-04-landing-design-and-copy-tournament.md` | The master prompt |
| `…master-handoff.md` · `…phase-8-winner-synthesis-handoff.md` · `…phase-9-red-team-handoff.md` · four `2026-08-04-*` handoffs | **Superseded by this file.** Kept for the record |

**Not yet written:** the `DESIGN.md` rewrite (10B) ·
`docs/plans/landing-tournament-implementation-plan.md` (10C) · the decision memo (Section 18).

---

**Session ends here.** No code changed. No commits. No `DESIGN.md` edits. `npm test` not run.
