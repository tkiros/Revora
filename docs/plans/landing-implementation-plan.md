# Landing implementation plan · `W — One Card Back`

**Date:** 2026-08-05 · **Supersedes** `docs/plans/landing-tournament-implementation-plan.md` (marked
superseded at its head) **and every earlier plan or handoff where they disagree.**

This is the unified, verified plan. Every load-bearing claim in it was checked against live source,
the three test gates, or the corpus on 2026-08-05, and carries a verdict in §2. **A claim marked
🔲 UNCHECKED or ⚠️ INHERITED is exactly that** — the register says so instead of hiding it.

> **How to execute this document.** Source lives in the worktree
> `/home/tefera/Desktop/Revora/.claude/worktrees/landing-w1-w4` (branch `landing/w1-w4`, HEAD
> **`5c30246`**). **Every line number in this file is valid at `5c30246`** — re-derive after any
> commit. Documents (this file, `DESIGN.md`, the tournament corpus) live in the **main checkout**
> `/home/tefera/Desktop/Revora`; the worktree's `DESIGN.md` is the old pre-rewrite version — never
> read rules from a worktree path. Rules authority: `DESIGN.md` (main checkout). Build detail
> beyond this file: `docs/plans/landing-tournament-winner-spec.md` (its §9 copy deck and §§2–8 CSS
> are current; its page metrics are ⚠️ inherited, §2.6 below).

---

## 1. Status

### 1.1 Where things stand

| | |
|---|---|
| Base commit | `8c4c0e9` on `fix/landing-followups` |
| Shipped | **W1–W4**, as four commits on `landing/w1-w4` (worktree above): `f73eeaa` W1 motion tokens · `f6afb1a` W2 rename · `4ff5576` W3 source-order comment · `5c30246` W4 five guard tests. All four verified to do what they claim (§2.1). Working tree clean. |
| Not shipped | **W5–W13** (§4), the product items (§8), the governance items (§9) |
| Uncommitted | In the **main checkout**: the rewritten `DESIGN.md` (modified) and the entire tournament corpus — 8 plan docs, 10 handoffs, the prompt, this file (untracked). **A stray `git checkout`/`git clean` in the main checkout destroys the tournament.** ⚠️ **Recommended first action: commit the documents.** (Recommendation only — not done unasked.) |

### 1.2 The three gates — all run and green, 2026-08-05, worktree @ `5c30246`

| Gate | Result | Note |
|---|---|---|
| `npm test` | ✅ **2,192 passed / 0 failed / 2 skipped** · 187 files (+1 skipped) · 180.7s | +8 over the 2,184 pre-W4 baseline = exactly W4's 8 assertions |
| `npm run e2e` | ✅ **231 passed / 0 failed / 21 skipped** · 5.7m | Playwright over `tests/smoke/`. Separate gate; holds breakage row 6 |
| `npm run contract` | ✅ **passes all 9 validators** | **First run in the entire tournament.** Gates every ledger edit (§6) |

```bash
pkill -9 -f "[n]ext-server"   # the [n] MATTERS — without it, pkill kills its own shell's job
npm test                      # vitest, tests/**/*.test.ts only.  ~3 min
npm run e2e                   # Playwright, tests/smoke/.         ~6 min.  SEPARATE GATE
npm run contract              # validate-safety-contract, 9 validators. Gates ledger edits
```

---

## 2. The claim register

Verdicts: ✅ VERIFIED (command/evidence given) · ❌ FALSE (with correction) ·
⚠️ INHERITED/UNVERIFIABLE (why) · 🔲 UNCHECKED (why not). All commands run in the worktree at
`5c30246` unless noted.

### 2.1 W1–W4 themselves (the newest, least-reviewed work)

| Claim | Verdict | Evidence |
|---|---|---|
| W1: `--ease` → `cubic-bezier(0.23, 1, 0.32, 1)`, `--dur-press: 120ms` added | ✅ | `git show f73eeaa` — one token edited, one added, `app/globals.css:29-34` |
| "All 24 consumers read `var(--ease)`; none hardcodes the curve" | ✅ | `grep -c "var(--ease)" app/globals.css` → 24; `grep -n cubic-bezier` → 1 hit, the token itself (`:34`) |
| W2: `.landing-phone`/`-inner` → one `.landing-hero-proof` element; no test reads the old name | ✅ | `git show f6afb1a`; test grep clean. **Bonus, previously unrecorded:** W2 also deleted the false *"nested cards are banned (DESIGN.md §App-UI guardrails)"* claim from the `globals.css` comment — the last source-level carrier of Phase 8's misreading is gone |
| W3: source-order warning amended (not replaced) onto the disclaimer comment; stale "demo card and the footer" parenthetical generalised | ✅ | `git show 4ff5576`; comment now at `globals.css:2276-2289`, rule at `:2290-2292`, and it correctly cites the app rule's **drifted** position `L781` |
| W4: 5 guards, 8 assertions, all passing on today's tree | ✅ | `tests/unit/revora/landing-design-guards.test.ts` (170 lines); suite green at 2,192 |
| W4's guards are non-vacuous | ✅ | Re-ran two mutations this session: `.landing .result-card { border-radius: 12px }` appended to `globals.css` + a second `Check your first meal — free` in `page.tsx` → **2 failed / 6 passed**; worktree restored clean |
| W4's Guard 1 covers the page's central claim | ✅ **with a named scope** | It forbids any `.landing*` selector declaring `border`, `border-radius` **or `box-shadow`** on `.result-card`/`.surface-card` — the rule exactly as `DESIGN.md` §11 states it, plus shadow. It does **not** catch other property overrides (background, padding); typography under `.landing .result-*` is explicitly sanctioned. The claim "shows the product's card, unmodified" is fenced on its shape properties, not on every property. Deliberate; recorded |
| W4's Guard 5 also fences the CTA em dash | ✅ | It asserts the string `Check your first meal — free` (with the em dash) occurs exactly once in `page.tsx` — stripping the dash now goes red. Previously prose-only (trap 7) |

### 2.2 The live fact table — every value re-read from its source module

| Fact | Value | Source (verified) |
|---|---|---|
| `TASTER_LIMIT` | **10** | `lib/client/taster-store.ts:2` ✅ |
| `FREE_DAILY_CHECKS` / `FREE_HISTORY_DAYS` | **5** (legacy only) / **7** | `lib/free-tier.ts:11,22` ✅ |
| `paywallMode()` default | **`"trial"`** (`PAYWALL_MODE=legacy` is the escape hatch) | `lib/server/pricing.ts:47-49` ✅ |
| Monthly price | **$12.99** (`TRIAL_PRICE_VARIANT` unset → `"1299"`); ladder $9.99/$12.99/$19.99 | `lib/server/pricing.ts:2-4,15-16` ✅ |
| Annual | **$99.99/yr, $8.33/mo** | `ANNUAL_PRICE`, `lib/server/pricing.ts:27-31` ✅ |
| Trial | 7 days, card required, $0 charged; pre-charge email (ledger `precharge-email`) | `pricing.ts:43-45` comment + ledger row ✅ (the "day 5" timing itself: 🔲 not traced into the email scheduler — carried from the approved ledger row) |
| `RISK_LABELS` | Clear · Be careful · Hold off | `lib/revora/labels.ts:12-16` ✅ |
| `BOUNDARY_DISCLAIMER` | verbatim as documented | `lib/revora/boundary-copy.ts:38-40` ✅ |
| `photoInputEnabled()` / `learningJourneyUiEnabled()` / `longitudinalInsightsEnabled()` | **all FALSE** (env vars unset; `.env.example` blank) | flag modules + env grep ✅ |
| A1C scope | 5.7%–6.4% | `docs/safety/claims-boundary.md:13` ✅ |
| Nine claim classes, all about Revora | ✅ | `claims-boundary.md:50-59` — `product-role`, `prompt-scope`, `prompt-policy`, `result-qualitative-impact`, `result-adjustment`, `clarification-route`, `refusal-route`, `out-of-scope-routing`, `disclaimer-footer`. No class for a statement about a third party → the comparative-confidence ruling stands on its stated reason |
| The contract validator reads no source file | ✅ | `scripts/validate-safety-contract.mjs` — all `readFileSync` sites read `docs/safety/*` + the JSON fixture; zero `.tsx` references |
| Pantry Review $49 one-time | ✅ | ledger `pantry-landing-cta` (:75) |

### 2.3 The breakage set — every assertion opened at its line

| # | Assertion | Verified site @ `5c30246` | Suite |
|---|---|---|---|
| 1 | `Two ways in.` / `not Three ways in.` / flag-on inverse | `landing-wiring-pins.test.ts:134,135,141,142` ✅ exact | `npm test` |
| 2 | `Dictate it or type it.` | `:136` ✅ exact | `npm test` |
| 3 | `Snap a photo, dictate it, or type it.` (flag-ON branch) | `:143` ✅ exact | `npm test` |
| 4 | `{TASTER_LIMIT} free checks on day one` | `copy-pins.test.ts:84` ✅ exact; its subject (the pricing lede) at `page.tsx:736-752`, both branches | `npm test` |
| 5 | journey flag-ON: `A 90-day journey…` + `not.toContain("A weekly recap in sentences")` | `:158,159` ✅ exact (describe `:147-162`; flag-OFF case `:148-154` **passes on the winner unchanged**) | `npm test` |
| 6 | `Revora at a glance` heading + `ul.landing-glance[role=list]` | `tests/smoke/landing-a11y.spec.ts:62-77` (heading `:70-72`, role `:73-76`) ✅ | **`npm run e2e` only** |
| — | Survivors needing no fix: `copy-pins.test.ts:83,85,88` (three TASTER phrases) and the two `FREE_DAILY_CHECKS` expects (`:106-108`, `:112-114`, inside the `:97+` it-block) | ✅ read; all match the amended deck character-for-character | |

**Three test files the original tournament prompt named that no prior plan cleared — now cleared:**
`landing-paywall-copy.test.ts` pins only strings the winner keeps (`paywallMode() === "trial"`,
`{monthlyPrice}/month`, `7 days free`, `Days 2–8`, `A free account`, `still no card`) → ✅ **no
breakage expected**. `forbidden-claims.test.ts` and `disclaimer-presence.test.ts` never read the
landing (engine/contract only) → ✅ **no breakage possible**.

### 2.4 Source facts under the work items

| Claim | Verdict | Evidence |
|---|---|---|
| `app/page.tsx` 927 lines · `app/globals.css` 3,482 lines | ✅ | `wc -l` |
| `faqs` declared once, two consumers | ✅ | decl `:104`, `mainEntity` `:161`, visible `<details>` `:855` — and W4's Guard 2 now pins it |
| `Most apps would just pick one and sound confident.` ships unledgered | ✅ | `page.tsx:521-522` (drifted −2), inside the feature grid (`:504-618`, the block W9 deletes); `grep -c "Most apps" docs/safety/copy-ledger.md` → 0 |
| Ledger: 77 data rows, exactly **4** `landing-*` rows | ✅ | awk row count → 77; `landing-hero-moment`/`-audience-pains`/`-three-answers`/`-what-you-get` at `:95-98`. ⚠️ A naive `landing-` grep returns 10 — six are the tails of `pantry-landing-*` IDs. Use an anchored pattern |
| The FAQ is entirely unledgered | ✅ | `grep -c "Is Revora medical advice\|Fair questions\|How do I cancel" copy-ledger.md` → 0 |
| `landing-hero-moment`'s Copy describes a hero that never shipped | ✅ | row `:95` reads *"Dinner is on the table…"*; the shipped H1 is `Stop guessing at dinner.` (banned-list item 7's exhibit) |
| journey flag: 3 consumers, 1 behavioural test | ✅ | `page.tsx:94` · `app/(app)/journey/page.tsx:51` · `components/journey-card.tsx:171`; `NEXT_PUBLIC_LEARNING_JOURNEY` appears in tests only in `next-config-twin-guard.test.ts` (config declaration, no render) and `landing-wiring-pins.test.ts` |
| `DemoCheckCard`: 3 render routes; wrapper is `.surface-card` | ✅ | `page.tsx:265` · `app/(app)/check/page.tsx:68` · `app/(app)/demo/page.tsx:88`; wrapper `<section className="surface-card hero-card" aria-label="Example check">` at `demo-check-card.tsx:38-42` |
| `demoExampleEyebrow(null)` → `An illustrated example`; else `A real check, captured <date>` | ✅ | `demo-check-card.tsx:24-33` — the `<ExampleResultCard>` extraction (W5) stays load-bearing |
| Source-order dependency: app 13px rule vs landing 16px rule, identical specificity (0,2,0) | ✅ | `.result-fineprint .result-disclaimer` `:781-783` · `.landing .result-disclaimer` `:2290-2292`; W3's comment sits on the rule and cites **L781** |
| Card recipes: `.surface-card` 24px/`--border-soft`/the one shadow; `.result-card` 22px/`--border-strong` | ✅ | `globals.css:118-123` · `:629-635` (grouped with `.placeholder-card`) + `:664-667` |
| `.landing-cta` still uses the 3-property `transition` shorthand on `--dur-fast` | ✅ | read at the selector — W8's longhand change is still owed, and **should now be written as `var(--dur-press)`/`var(--ease)`, not literals** (W1 made the tokens equal the spec values) |
| Shared landing `font-family` group | ❌ **count corrected** | `globals.css:1554-1569` lists **15** selectors, not the 14 the old plan claimed. The **seven dead** subset is unchanged: `.landing-eyebrow`, `.landing-step h3`, `.landing-step-num`, `.landing-feature h3`, `.landing-proof-item h3`, `.landing-glance-fact`, `.landing-verdict-meal` |
| Contrast: `--text-soft` 4.76 / 4.55 / **4.40 FAIL** / **4.15 FAIL** on surface / surface-muted / page-bg / accent-tint; `--text-muted` on page-bg **7.00**; CTA pair **7.19**; `--text-strong` 16.50 | ✅ | recomputed independently (sRGB/WCAG 2.x, node) — every figure reproduces to the second decimal |
| `--text-soft` uses: 4, all on passing planes | ✅ | `:201` (placeholder on `--surface`) · `:2555` (decorative `background`) · `:2682` (`.chip-remove` on `--surface-muted`) · `:3157` (placeholder on `--surface`) — drifted from the documented `:198/:2546/:2673/:3148` |
| Rail-related CSS: reduce block `:39-47` · `font: inherit` reset excludes `body` `:86-92` · 44px floor `:93-97` · `.landing .result-title` cap `:1731-1734` | ✅ | read. ⚠️ **`DESIGN.md`'s own `globals.css` line citations are now stale by +3** (they predate W1). Substance verified; a micro-edit to `DESIGN.md` is owed (§9.4) |
| Banned source phrases still pinned | ✅ | `copy-pins.test.ts:119-121` |

### 2.5 The §5.3 corrections — all confirmed still true; remaining carriers named

Each false claim below stays false; the corpus files still carrying it are listed so nobody quotes
them. (Tier 3 files are expected carriers; the two **Tier 1** carriers are the ones that matter.)

| False claim | Still-carrying files (main checkout) |
|---|---|
| `Most apps…` is an approved ledger row | phases-4-5 `:2327` (origin, C7 part 11) · phase-6 `:1028` · phase-7 `:540-543` · phase-8 `:197-204` · master-handoff (banner-corrected) |
| Reachability = 1,460px, achievable | phase-7 `:608-610` · phase-8 `:608-637` (both superseded by `DESIGN.md` §11.1's 3-screenful rule) |
| Winner ≈ 6,865px / desert 1,450px | phase-8, phase-9, consolidated §10 (superseded banner present in consolidated §10's own note) |
| `--text-soft` "AA at 16px on white" | none current — `DESIGN.md` §3.1 corrected it |
| "One filled pill per viewport — enforced in code" | none current — `DESIGN.md` §11 corrected it; verified no such assertion exists in any test |
| `DESIGN.md` bans nested cards | phases-0-3 handoff `:196` · phase-8 `:94` and phase-8-winner handoff `:169-171` — **and the `globals.css` comment carrier was deleted by W2** |
| Suite takes ~26 minutes | phase-6 `:1095` · phase-7 `:801` · phase-8 `:831` · phase-9 `:789` · phases-4-5 `:2382` · the four 2026-08-04 handoffs (measured: **~3 minutes**) |
| Unescaped `pkill -9 -f "next-server"` | consolidated handoff `:96` · winner-spec `:1148` · phase-8 `:830` · phase-9 `:789` + earlier handoffs. **Always `[n]ext-server`** |
| Tier B "three retirements" | phase-8 `:679-687` · phase-8-winner handoff `:397` (actual: **four**, plus the fifth breakage string at `landing-wiring-pins.test.ts:143`) |
| "Two new ledger rows" | ⚠️ **Tier 1 carriers:** winner-spec `:1128` and consolidated handoff `:1007` still say two. **Actual: 4 amendments + 4 new rows** (§6) |
| "It passes the guards" = clearance | corrected everywhere current; three fences, one reads source (`DESIGN.md` §1.1) |

Two further internal contradictions, recorded: winner-spec `:1155` (test green) vs `:1171` ("npm
test not run") and consolidated handoff `:9` vs `:1125` — status footers written before late
addenda. Trust the dated result blocks, and §1.2 above supersedes both.

### 2.6 Inherited and unchecked — say it plainly

| Item | Verdict | Why |
|---|---|---|
| The winner's browser metrics (8,621px · 12.9 screens · deserts 1,941/1,246/1,581/2,224/672 · arrangements A–D · hero fold geometry · per-block heights) | ⚠️ **INHERITED-UNREPEATED** | One 10A run, harness validated against the incumbent first (13,346px vs 12,942 recorded, CTA count exact). Not re-run this session — reproducing it costs a dev server + a Playwright harness rebuild (~30–60 min). **W13 exists to re-measure**; treat every pixel figure as *measured-once*, not settled |
| Incumbent baseline (12,942px / 7 CTAs / 5,090px desert; 13,346/5,228 at 10A) | ⚠️ INHERITED | Same harness; internally consistent across two sessions |
| Em-dash census (incumbent 42; winner "4 strings") | 🔲 UNCHECKED | Not load-bearing for W5–W13 — fix 6 is already in the amended deck, and W4's Guard 5 fences the one that matters |
| The 42 scorecards' arithmetic | 🔲 UNCHECKED (deliberately) | Re-scoring is banned; Phase 7 re-verified the totals to ±0.02 and the winner is settled |
| "Day 5" pre-charge timing in the scheduler | 🔲 UNCHECKED | Copy comes from the approved `precharge-email` ledger row; tracing the cron is out of landing scope |

### 2.7 The original master prompt, audited against the 18 delivered sections (no phase did this)

All 18 sections exist and all six required tables were produced. **Three genuine gaps:**

1. **Sections 1–6 were never persisted in full.** The Teardown Table and the complete `DESIGN.md`
   Verdict Table exist only compressed in the phases-0-3 handoff, which itself says (`:273-274`)
   *"Full table is in the prior session's transcript."* The transcript is gone. Consequence: the
   per-rule verdict record behind the `DESIGN.md` rewrite cannot be re-audited row by row. Accepted
   loss; recorded.
2. **The prompt's Phase 10C contract named six test files to clear.** The delivered plan cleared
   three; this verification cleared the rest (§2.3): `landing-paywall-copy` — no breakage;
   `forbidden-claims`, `disclaimer-presence` — never read the landing. Gap closed.
3. **"Shorter and more load-bearing than 361 lines"** was met in lines (360) and missed in words
   (3,309 → 4,657). `DESIGN.md` §15 declares this itself. Delivered-with-named-deviation.

Minor: six of eight Tier-3 handoffs carry no ⛔ SUPERSEDED banner (only the master handoff and the
phase-9 handoff do). Cosmetic governance item, §9.5.

---

## 3. What changed since `landing-tournament-implementation-plan.md`

1. **W1–W4 shipped** (§1.1) and all three gates are green **including `npm run e2e` and
   `npm run contract`, neither of which the tournament had ever run.** W9's predicted e2e breakage
   is now the only known red anywhere.
2. **Every line number in the old plan is stale.** `page.tsx` 929 → **927** (−2 at the hero,
   W2); `globals.css` 3,473 → **3,482** (+3 tokens region, −2 rename, +8 comment). §4 and §5 cite
   re-derived positions at `5c30246`; the old plan's §2/§3 tables must not be transcribed.
3. **Corrections this verification adds to the record:** the shared font group has **15** selectors
   (not 14) — the seven-dead subset stands (§2.4). `landing-paywall-copy`/`forbidden-claims`/
   `disclaimer-presence` confirmed non-breaking (§2.3). W2 removed the last source carrier of the
   nested-card-ban misreading (§2.1). `DESIGN.md`'s own `globals.css` citations drifted +3 (§9.4).
4. **`DESIGN.md` §15's "owed" list is now mostly discharged:** the `--ease` commit (W1), the
   card-recipe override guard, rails 9/12 tests, the single-CTA-assembly test, the `faqs`
   invariant pin (all W4), and the source-order comment (W3) have landed. Still owed: the
   `DemoCheckCard` wrapper change (§8.1).
5. **W8's motion values are now tokens.** The spec's literal `120ms` / `cubic-bezier(0.23, 1,
   0.32, 1)` are exactly `var(--dur-press)` / `var(--ease)` after W1. Write the tokens.

---

## 4. The work items — W5–W13, numbering kept

Numbering is kept so every corpus cross-reference stays valid; W1–W4 are shipped history.
Ordering principle preserved: **guards and coverage first, deletions late.** Hard constraints
preserved and re-verified: **W6 before W9** (the journey flag's only behavioural coverage today is
the landing test W9 breaks — banned-list item 6) and **W7 before W10** (ledger rows exist before
the copy that cites them ships). Each item names its files, gate, risk, and revert story.

> Where a change is listed **by selector, not line**, execute it by searching the selector — CSS
> line numbers below are anchors verified at `5c30246`, but selectors are the durable address.

| # | Item | Files (anchors @ `5c30246`) | Gate | Risk / revert |
|---|---|---|---|---|
| **W5** | **Extract `<ExampleResultCard>`** and refactor block 4's three `.landing-verdict` articles (`page.tsx:435-495`) onto it with **identical rendered markup**. Label renders from `demoExampleEyebrow(null)` — never typed (`demo-check-card.tsx:24-33`). The incumbent's verdict articles are deliberately *not* `.result-card` (`globals.css:2202-2206` comment) — W5 is the moment they become the real component | new `components/example-result-card.tsx`, `page.tsx:435-495` | `npm test` | Markup-equivalence refactor; screenshot-diff it. Revert: drop the component, restore the articles |
| **W6** | **Move journey-flag coverage** to `components/journey-card.tsx` (`:171` is its flag read): add flag-on/flag-off branch tests that pass on today's tree | new test in `tests/unit/` | `npm test` | None; adds coverage. ⛔ **Must precede W9** |
| **W7** | **Ledger: 4 amendments + 4 new rows** (§6) | `docs/safety/copy-ledger.md` | **`npm run contract`** | Docs only. ⛔ **Must precede W10** |
| **W8** | **One-plane visual pass.** Delete `.landing-sheet` (`globals.css:1572`), `.landing-band` (`:1576`), the hairline-seam group (`:1581+`); unwrap the three `.landing-sheet` divs (`page.tsx:190, 275, 419`); section padding → `clamp(72px, 10vw, 128px)` + `border-top` with `:first-of-type` reset; type scale per winner-spec §2.3; `62ch`; focus offsets; `.landing-cta` transition shorthand → named longhand at **`var(--dur-press)` / `var(--ease)`**; `:active` gains `scale(0.98)`. ⛔ Every change edits the selector's **existing base rule** — appending a block fails the duplicate-`font-size` pin (`landing-wiring-pins.test.ts:98`) | `globals.css`, `page.tsx` wrappers | `npm test` + `npm run e2e` | Largest CSS diff, lowest copy risk — no block deleted, no string changed |
| **W9** | **Delete the six retired blocks** — at-a-glance (`page.tsx:275-312`), how-it-works (`:368-416`), feature grid (`:504-618`, takes `Most apps…` at `:521-522` with it), what-changes (`:620-664`), why-trust (`:666-731`; its `:681-692` sources content survives into block 4), Pantry section (`:813-848` → block-5 prose) — plus their CSS blocks (by selector: `.landing-eyebrow`, `.landing-glance*`, `.landing-grid-3`/`.landing-step*`, `.landing-features`/`.landing-feature*`, `.landing-outcomes*`, `.landing-proof*`, `.landing-proof-band*`, `.landing-pantry*`, `.landing-section--tight`, `.landing-pains-note`, `.landing-verdict*`), plus the **seven dead selectors inside the 15-selector font group** (`globals.css:1554-1569`, §2.4), plus dead imports (`page.tsx:6-11` icons as they fall out of use, `:14` journey flag, `:15` longitudinal flag). **Breakage fixes for rows 1, 2, 3, 5, 6 land in the same commit** (§5) | `page.tsx`, `globals.css`, `landing-wiring-pins.test.ts`, `tests/smoke/landing-a11y.spec.ts` | `npm test` + **`npm run e2e`** | **The breaking commit.** Everything before it exists to make it safe. Its test edits are part of the commit or the revert is not clean |
| **W10** | **The new copy deck** (winner-spec §9, amended-deck-verbatim): H1, 33-word sub, captions, block-2 scope note, block-4 lede + sources prose, block-5 H2/tiles/cancel/claims/Pantry prose — **and the pricing-lede deletion (`page.tsx:736-752`) with breakage fix 4 in the same commit** | `page.tsx`, `copy-pins.test.ts` | `npm test` + `npm run contract` | Needs W7's rows. `{TASTER_LIMIT}`/`{FREE_DAILY_CHECKS}`/`{monthlyPrice}` interpolated, never typed |
| **W11** | **Block 3, the pause.** Move `<DemoCheckCard/>` (from `page.tsx:265`) into the new block 3; caption `Without that one question, Revora would have been guessing.`; the dare link; the one `IntersectionObserver` animation per §4.1 below | `page.tsx`, `globals.css`, one small client component | `npm test` + `npm run e2e` | The only new JS on the page |
| **W12** | **FAQ move above the final CTA** (`page.tsx:850-863` → before `:868`), strip the two unpinned em dashes in both FAQ branches (`faqs` array `:104-131`), delete block 6's H2 + sub | `page.tsx:104-131, 850-879` | `npm test` | Low. Guard 2 (W4) holds the JSON-LD invariant through the move |
| **W13** | **Measure and report** — page length, exit count, desert map at 375×667, real fonts, in the browser — including the **CTA-after-cancel-paragraph variant** `DESIGN.md` §11.1 ruled for on copy grounds, which **no session has measured**. Budget: no desert > 3 screenfuls (2,001px). If the variant misses, the measured arrangement C is the fallback and the cancel paragraph's price adjacency is the recorded cost | none (a measurement) | — | §4.2. This is `DESIGN.md` §11.1's measurement clause, exercised for the first time on real code |

### 4.1 W11's non-negotiables (verified against `DESIGN.md` §6 and the spec)

Card ships rendered at `opacity: 1`; the observer **replays** the entrance (`{ once: true }`,
`amount: 0.4`). A headless render, hidden tab, or JS failure ships the complete card.
`transform`/`opacity` only. `prefers-reduced-motion` gated in **both** CSS and JS — the global
reduce block (`globals.css:39-47`, now pinned by W4 Guard 4) only shortens what already ran.
Beats: clarify block 220ms at 0ms; `You answer:` + card 240ms at +520ms; both on `var(--ease)`.
⛔ `You type: oatmeal` is static text — never an `<input>`, never focusable, no caret.

### 4.2 W13 is a gate, not a report

*"An unmeasured desert claim does not count"* (`DESIGN.md` §11.1). Do not estimate: the
tournament's estimates ran 20% low on page length, 35% low on the worst desert, and not one of
five estimated gaps landed within 200px of its measurement. Harness: one `next dev`
(`pkill -9 -f "[n]ext-server"` first), Chromium from the repo's own `node_modules/playwright`,
375×667, `await document.fonts.ready`, `getBoundingClientRect()`. **Validate against the incumbent
first** (~13,3xx px · 7 CTAs · ~5,2xx px worst desert — ⚠️ inherited figures, §2.6). Two harness
traps from 10A: `.result-row` is a `20px 1fr` grid that needs its icon child, and block 4's cards
carry no fineprint.

---

## 5. The breakage set — fixes, verified sites, and which gate catches each

| # | Site (verified) | Fix | Gate |
|---|---|---|---|
| 1–3 | `landing-wiring-pins.test.ts:131-145` (the whole `photo-flag branches` describe) | **Delete the describe** — both its `it`s pin copy of the deleted how-it-works block, including the flag-ON `Snap a photo…` string at `:143` that was on no early list | `npm test` |
| 4 | `copy-pins.test.ts:84` | Drop that one `expect`; `:83`, `:85`, `:88` stay | `npm test` |
| 5 | `landing-wiring-pins.test.ts:156-161` (journey flag-ON case) | **Move, do not delete** — W6 has already put branch coverage on `journey-card.tsx` by the time W9 lands, so the landing case is deleted *after* its replacement exists. The flag-OFF case `:148-154` passes on the winner unchanged. Net coverage rises: the flag's two shipping consumers gain tests, the deleted surface loses one | `npm test` |
| 6 | `tests/smoke/landing-a11y.spec.ts:62-77` | **Retarget, do not delete** — the test exists to prove `role="list"` survives `list-style: none` in Safari/VoiceOver. Point it at `ul.landing-trust-strip`; drop only the `Revora at a glance` heading assertion, whose subject is genuinely gone. The nav/footer landmark assertions stay | **`npm run e2e`** |

W9 carries fixes 1, 2, 3, 5, 6 in its own commit; W10 carries fix 4.

---

## 6. The ledger work — gated by `npm run contract` (green baseline confirmed, §1.2)

Rows verified at `copy-ledger.md:95-98`; 77 data rows total.

| Row | Action | Why (verified) |
|---|---|---|
| `landing-hero-moment` (`:95`) | **AMEND** | Its Copy column is fiction — describes a hero `git log -S` shows never shipped (§2.4). The winner replaces the real hero anyway |
| `landing-audience-pains` (`:96`) | **AMEND** | Drop the three-negation sentence fix 3 deletes; the four pain items stay verbatim |
| `landing-three-answers` (`:97`) | **AMEND** | Meal names and `Illustrated examples.` survive; the lede gains fix 4's sentence |
| `landing-what-you-get` (`:98`) | **AMEND or RETIRE + new row** (owner call, §10.3) | The feature grid is deleted; four claims survive rewritten into block 5 |
| ➕ NEW | hero card caption (`This is the whole screen…`) | new landing copy, no row |
| ➕ NEW | block 3: caption + dare link | new landing copy, no row |
| ➕ NEW | block 4's two sources paragraphs | C4's copy; nearest prior surface (the proof band) was itself unledgered |
| ➕ NEW | block 5's cancel paragraph + claims list | existing `cancel-page`/`account-cancel-button` rows are **app** surfaces, not landing |

**Not caused by this rebuild but adjacent:** the FAQ ships entirely unledgered today (§2.4) —
routed as governance item §9.2, not smuggled into W7.

**Every card *body* on the winner is already-approved `result-*` copy** — re-verified against
`result-safe-example` / `result-moderate-example` / `result-high-example` (`copy-ledger.md:26-28`)
and the `demo-check-*` rows (`:67-69`). The winner invents no card body copy.

---

## 7. What must not change, and the fence that catches it

| Invariant | Fence (verified) |
|---|---|
| `reading.className` on the landing root (`page.tsx:188`), never `<body>` | `landing-wiring-pins.test.ts:59-76` |
| No `.landing*` selector declares `font-size` twice | `:98` |
| `.landing .result-title` capped 22px/700 | `:78` |
| `<DemoCheckCard/>` rendered; flow strings never retyped | `promise-registry.test.ts:181-199` |
| `TASTER_LIMIT` / `FREE_DAILY_CHECKS` / `RISK_LABELS` / `{monthlyPrice}` interpolated; no literal price; both `paywallMode()` branches; banned phrases stay banned | `copy-pins.test.ts` + `landing-paywall-copy.test.ts` |
| No banned claim family in any `.tsx` | `claims-boundary-copy.test.ts` |
| Footer apps column renders no inert promise | `landing-wiring-pins.test.ts:164+` |
| A Clear card never carries an adjustment/swap | `assertNoUnsafeSafeFields` throws (runtime) + family `unconditional-swap` |
| `.landing*` never declares border/radius/shadow on `.result-card`/`.surface-card` | **W4 Guard 1** (was uncovered) |
| One `faqs` declaration, both consumers map it | **W4 Guard 2** (was a code comment) |
| 44px floor + 52px CTA · global reduced-motion block · single CTA assembly · the CTA's em dash | **W4 Guards 3–5** (were prose) |
| `.landing .result-disclaimer` (`:2290-2292`) stays **below** `:781` | ⛔ **still nothing but W3's comment.** No pin can catch it (it counts declarations per selector). Do not move the block |
| ⛔ Nothing: rail 14 (light surfaces) · rail 16 (fileable sentences) · the 3-screenful budget | prose + this plan. The budget's fence is W13's measurement discipline |

---

## 8. Product items — separate PRs, not part of the landing ship decision

1. **Un-card `DemoCheckCard`'s wrapper** (`DESIGN.md` §5 ruling). `components/demo-check-card.tsx:38-42`
   renders `.surface-card hero-card` (24px) around two `.result-card`s (22px); documented nested
   value is 14px. The wrapper drops `surface-card` and becomes an unbordered labeled region
   (`aria-label="Example check"` already present). **Three verified render routes need a visual
   check:** `app/page.tsx:265`, `app/(app)/check/page.tsx:68`, `app/(app)/demo/page.tsx:88`.
   ⛔ Do **not** re-radius the inner `.result-card`s — W4's Guard 1 will (correctly) go red if the
   fix is attempted as a landing override instead of in the component.
2. **`--dur-press` consumers in the app layer.** W1 shipped the token; the app's press states
   still run `--dur-fast`. One behaviour system-wide, or the landing stays the exception.
3. **Instrument the block-3 dare link** separately from the primary CTA, from day one. It is the
   only answer to *"three example cards is not a demo"* — if it converts, the fixture objection is
   answered by the product.

---

## 9. Governance items — independent of ship / no-ship

1. **Route `page.tsx:521-522` to counsel.** `Most apps would just pick one and sound confident.`
   is unledgered (§2.4) and **outside the claim schema** — all nine classes are about Revora
   (§2.2), so it can be neither approved nor banned as written. W9 deletes its block, so shipping
   fixes it *incidentally* — and not shipping leaves it in production. Route it either way; do not
   let a redesign silently discharge it or a no-ship silently retain it.
2. **Ledger the FAQ.** Five answers ship under no row today (§2.4). Rail 16's first real subject.
3. **Close the ledger/source gap or accept it explicitly.** Nothing connects `copy-ledger.md` to
   source in either direction (validator verified source-blind, §2.2). A row-id-to-source check is
   cheap and would have caught item 1 four reviews ago.
4. **Micro-edit `DESIGN.md`'s stale `globals.css` line citations** (+3 drift since W1: `:16-27`→
   `:19-30`, `:36-44`→`:39-47`, `:83-87`→`:86-92`, `:89-93`→`:93-97`, `:1728-1731`→`:1731-1734`,
   the four `--text-soft` cites → `:201/:2555/:2682/:3157`) — or restate them as selector-addressed.
   Also: `DESIGN.md` §15's "owed" list is mostly discharged (§3.4); update it when next edited.
5. **Cosmetic:** add ⛔ SUPERSEDED banners to the six Tier-3 handoffs that lack them, and correct
   the two Tier-1 "two new ledger rows" carriers (winner-spec `:1128`, consolidated `:1007`) —
   or rely on this plan's precedence, which §2.5 establishes.

---

## 10. Open for the owner

1. **W1 already shipped app-wide motion feel on one token** (it was the only W-item touching
   surfaces beyond the landing). Decision now: keep it in the `landing/w1-w4` branch's PR, or
   cherry-pick it into its own PR for an isolated revert story.
2. **W13's outcome may cost the cancel paragraph its price adjacency** (§4.2). `DESIGN.md` §11.1
   ranks the copy above the pixels; W13 is where that ruling meets a real number.
3. **`landing-what-you-get`: amend or retire + fresh row** (§6). No ledger precedent for a row
   whose section was deleted. Either is defensible.
4. **Commit the tournament corpus** (§1.1). Everything that decided this plan is uncommitted in
   the main checkout.

---

## 11. Traps — current, verified set

1. ⚠️ **`pkill -9 -f "next-server"` kills its own shell's job** (exit 1, empty output, no error —
   it has done so in this repo). Always `pkill -9 -f "[n]ext-server"`.
2. **Three gates, not one.** `vitest.config.ts` covers `tests/**/*.test.ts` only; breakage row 6
   lives only in `npm run e2e`; ledger edits are gated only by `npm run contract`. All three green
   at `5c30246` (§1.2).
3. **Docs in the main checkout, source in the worktree.** The worktree's `DESIGN.md` is the old
   version; never cite it. The main checkout's corpus is uncommitted; no `git clean`/`checkout`
   there.
4. **The git stash stack is shared across worktrees** — never bare `git stash`/`git stash pop`.
5. **Only one `next dev`** — concurrent servers over one `.next` cause `ChunkLoadError` loops
   (`pkill -9 -f "[n]ext-server"; rm -rf .next; npm run dev`).
6. **`~/.claude/skills/gstack/` does not exist here** — gstack helpers silently no-op. Use
   Playwright from the repo's own `node_modules`.
7. **The approved CTA's em dash stays** — now test-enforced (W4 Guard 5), no longer just policy.
8. **`docs/archive/` and `Revora_Brand_Positioning_v2.md` are not sources**;
   `docs/product-marketing.md` is the only active positioning source.
9. **Do not give the Clear card an adjustment** (`assertNoUnsafeSafeFields` throws) · do not
   resurrect the two rejected C6 headlines or the DPP statistic · the comparative-confidence
   family is ruled unavailable at any scale — cite the reason (no claim class, §2.2), never a vote.
10. **A naive `landing-` grep on the ledger returns 10 hits; only 4 are landing rows** (§2.4).
11. **The suite takes ~3 minutes.** Any document claiming ~26 is stale (§2.5).

---

## 12. Retired traps

- ~~"npm run e2e has never been run"~~ — run twice now, green both times (§1.2).
- ~~"npm run contract has never been run"~~ — run, passes all 9 validators (§1.2).
- ~~"the globals.css comment claims nested cards are banned"~~ — W2 deleted it (§2.1).
- ~~"the faqs invariant is only a code comment"~~ — W4 Guard 2 pins it.
- ~~"stripping the CTA em dash breaks only policy"~~ — W4 Guard 5 makes it a test failure.
