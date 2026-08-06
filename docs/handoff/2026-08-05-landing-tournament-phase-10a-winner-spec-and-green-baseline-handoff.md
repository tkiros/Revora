# SESSION HANDOFF — Revora landing tournament, Phase 10A complete + green test baseline

**Date:** 2026-08-05 · **Branch:** `fix/landing-followups` (HEAD `8c4c0e9`, unchanged)
**This session:** Phase 10A / Section 15 — the build spec, written against a browser measurement.
Plus the six-session `npm test` debt, cleared.
**Status:** **15 of 18 sections written. Phase 10B is next.**
**Code changed: none. Commits: none. `git diff` is empty. Markdown only.**

---

## 0. Read order

| Read | File | Why |
|---|---|---|
| **1st** | this file | State of play, and the three rulings 10B owes |
| **2nd** | **`docs/plans/landing-tournament-winner-spec.md`** | **Section 15, the build spec. 1,150 lines. It supersedes Phase 8 §13.4 and the winner's estimated page metrics** |
| 3rd | `docs/handoff/2026-08-05-landing-tournament-phases-0-9-consolidated-handoff.md` | Phases 0–9, the Brief, the constraint ledger, the live fact table, the rulings, the traps. Status block updated this session |
| as needed | `docs/plans/landing-tournament-phase-9.md` | The red-team. Supersedes Phase 8 where they disagree |
| as needed | `docs/plans/landing-tournament-phase-8.md` | The winner in full, amended in eleven places by Phase 9 |
| rarely | `…phase-7.md` · `…phases-4-5.md` · `…phase-6.md` | Kill rulings · contenders · scorecards |

**Do NOT** re-score, rebuild contenders, re-run the kill round, re-derive the convergences, re-open
the two settled no-convergence items, re-synthesise the winner, or re-open the
comparative-confidence ruling. All closed.

---

## 1. What this session did

### 1.1 Wrote Section 15 — `docs/plans/landing-tournament-winner-spec.md`

Build-ready, no vague phrases. Delivers everything §13 of the consolidated handoff asked for:
the H1 clamp `clamp(1.9rem, 5.6vw, 2.9rem)` · body `17px / 1.65` · measure `62ch` · section padding
`clamp(72px, 10vw, 128px)` · press `translateY(1px) scale(0.98)` at 120ms
`cubic-bezier(0.23, 1, 0.32, 1)` on pointer-down with `transition-property` named, never `all` ·
the 2px focus offset · `text-wrap: balance` on h1–h3 and `pretty` on prose · **the corrected full
shape rule** · **the Finding 4 source-order comment written ON the `.landing .result-disclaimer`
rule** · **the hero card's label sourced from `demoExampleEyebrow(null)`** · block-by-block build ·
a CSS add / change / delete / rename list.

### 1.2 Spent C5's measurement discipline — and it changed the answer

Built a Playwright harness against the **real** `/` route so `next/font`'s self-hosted Plus Jakarta
Sans and Source Sans 3 did the layout, replaced `<main>` with the winner's markup, injected the spec
CSS, lifted the **real** `<DemoCheckCard />` out of the live DOM into block 3, and read
`getBoundingClientRect()` at 375×667.

**Validated the harness against the untouched incumbent first:** it returns **13,346px / 7 CTAs /
5,228px longest desert** against the tournament's recorded **12,942 / 7 / 5,090**. Within 3% on both
pixel figures, exact on the CTA count. The winner numbers are therefore trustworthy.

### 1.3 Cleared the blocking debt — `npm test` is GREEN

```
Test Files  186 passed | 1 skipped (187)
Tests       2184 passed | 2 skipped (2186)
Duration    164.48s
EXIT_CODE=0
```

**Baseline: 2,184 passed / 0 failed / 2 skipped at `8c4c0e9`, 2026-08-05.** Previous recorded green
was 2,165 at `bf714e9`; the +19 are from the SEO/JSON-LD/guides commits.

⚠️ **The suite takes 2.7 minutes, not the "~26 minutes on an idle machine" the handoffs have claimed
for five sessions.** That stale figure was deterring a three-minute run. **Correct it wherever it
appears.**

---

## 2. The headline finding — the winner's own metrics were wrong

| | Estimated (Phase 8, carried through Phase 9) | **Measured** | Error |
|---|---|---|---|
| Page length at 375px | ~6,865px | **8,621px** | estimate **20% low** |
| Screens at 667px | ~10.3 | **12.9** | |
| Longest CTA desert | 1,450px | **2,224px** | estimate **35% low** |
| Deserts over the 1,460px budget | 0 of 5 | **3 of 5** | |

**Measured:** 1,941 · 1,246 · 1,581 · 2,224 · 672.
**Estimated:** 1,300 · 1,390 · 1,380 · 1,450 · 490.

Not one estimate was within 200px of its measurement.

### 2.1 C5's reachability rule is not satisfied, and cannot be

The rule — *no stretch may exceed 1,460px at 375px* — is the one organ the tournament took from a
killed contender **specifically to fix the desert problem**. Four arrangements measured:

| Arrangement | Page | cta1→cta2 | →dare | →cta4 | →cta5 | →cta6 | Longest |
|---|---|---|---|---|---|---|---|
| **Winner as specified** | 8,621px | **1,941** | 1,246 | **1,581** | **2,224** | 672 | **2,224** ✗ |
| A · block-4 CTA above the cards | 8,589px | **1,941** | 1,246 | 454 | **3,319** | 672 | **3,319** ✗ |
| B · block-3 dare becomes a pill | 8,697px | **1,941** | 1,262 | **1,581** | **2,224** | 673 | **2,224** ✗ |
| **C · block-4 CTA before the note + block-5 CTA after the tiles** | 8,621px | **1,941** | 1,246 | **1,475** | **1,563** | 1,439 | **1,941** ✗ |
| D · C + a text-link exit under the hero caption | 8,694px | 796 / 1,161 | 1,246 | **1,475** | **1,563** | 1,440 | **1,563** ✗ |

**Nothing clears 1,460px.** The best arrangement still misses by 15px in one gap and 103px in
another. Arrangement A makes the worst gap **49% worse**. Arrangement B buys **0px** on any failing
gap while costing block 3 the absence that is its whole argument.

**Why it cannot be arranged away:** six exits over 8,621px is one per 1,437px average — at the budget
before spacing — and each exit sits where its *argument* ends, not on a pixel grid. The two grafted
rules are in direct tension: **C5's reachability rule wants more exits; the restated pill rule
("one filled pill per screenful") caps how many you can add.** Phase 9 found this collision at the
page's foot (P7-2) and treated it as local. It is global. The 1,460px figure was derived from C1's
page and transplanted onto a page that measures 8,621px, and the transplant was never checked,
because the tournament ran on paper.

⚠️ **The handoff's prescribed remedy is not the lever.** §13 said *"move block 4's sources paragraphs
below the CTA (recovers 180px)."* They were **already below the CTA** in the measured baseline, and
the binding gap is 764px over.

**Phase 10A deliberately did NOT restate the budget.** Moving a number because the page missed it is
banned-list item 2. → §4, ruling 1.

### 2.2 What the measurement confirms

- ✅ **Fix 5 is correct and sufficient.** The 33-word hero sub renders **4 lines** (y 199–311). Phase
  8's 44-word version renders **6**. Exactly as Phase 9 predicted.
- ✅ **Phase 8's fold claim was false, in the reader's favour.** The CTA caption's first line lands at
  **y = 399**, not the y ≈ 705 Phase 9 computed for the 40-word sub — **212px above** the fold.
- ✅ **The whole hero argument clears the fold**, which nothing in the tournament claimed: H1
  (117–181) · sub (199–311) · CTA (329–389) · caption (399–455) · **entire trust strip (477–605)** ·
  and **the top 30px of the result card (637+)** breaking the fold line as a scroll cue. Verified in
  screenshot.
- ✅ **The pill rule holds and Phase 9's estimate was pessimistic.** P7-2 expected fix 2 to widen the
  two closing pills to ~490px. Measured **672px** — it clears the 667px screenful **by 5px**.
  Knife-edge, not solved. Arrangement C widens it to 1,439px, which is its strongest argument.

### 2.3 What is true regardless of the ruling

| | Incumbent (measured today) | Winner (measured) |
|---|---|---|
| Content blocks | 13 | **6** |
| 375px length | 13,346px · 20.0 screens | **8,621px · 12.9 screens** |
| Longest CTA desert | 5,228px | **2,224px** (spec) / **1,941px** (C) |
| Card families | 8 | **2** |
| Eyebrows | 4 | **0** |
| Background planes | 3 + hairline | **1** |

**The page gets 35% shorter and its worst dead stretch 58–63% shorter.** That survives either ruling.
What does not survive is the claim that the winner *satisfies* C5's rule. It does not.

---

## 3. The other findings, all verified against source

### 3.1 `--text-soft` fails WCAG AA on this page — C4's graft is an a11y rule, not a taste rule

Computed (sRGB, WCAG 2.x):

| `--text-soft` `#64748b` on | Ratio | AA (4.5:1) |
|---|---|---|
| `--surface` `#ffffff` | 4.76:1 | pass |
| **`--page-bg` `#f2f7f6`** | **4.40:1** | **FAIL** |
| `--accent-tint` `#e6f2ef` | 4.15:1 | FAIL |

`DESIGN.md:32` annotates the token *"AA at 16px on white"* — true, and misleading: **the landing's
plane is `--page-bg`, not white**, and the winner collapses to that single plane. C4 grafted a
per-block ban (1/2/3/5) with a block-4 exemption; both the scope and the exemption are incoherent
once the page has one plane. **The ban is page-wide and the block-4 exemption is withdrawn.**

The incumbent escapes the bug only by accident — it uses `--text-soft` once on the landing, as a
decorative `background` (`globals.css:2546`), in a block the winner deletes.
⚠️ **`globals.css:2673` and `:3148` set it as a text colour on app surfaces. 10A did not audit those.**

Also computed: `--text-muted` on `--page-bg` is **7.00:1 — the AAA threshold to the second decimal**,
with no margin. It carries the CTA captions, the block-4 note and the footer disclaimer. The
`globals.css:1663` comment's 7.2:1 for the CTA pair is **confirmed** (7.19:1).

### 3.2 The exact test breakage set — and Tier B has a fifth string

Located against the green baseline:

| # | Assertion | Site | Fate |
|---|---|---|---|
| 1 | `Two ways in.` / `Three ways in.` | `landing-wiring-pins.test.ts:134,135,141,142` | **fails** |
| 2 | `Dictate it or type it.` | `:136` | **fails** |
| **3** | **`Snap a photo, dictate it, or type it.`** | **`:143`** | **fails. NOT on any Tier B list.** |
| 4 | `{TASTER_LIMIT} free checks on day one` | `copy-pins.test.ts:84` | **fails** |
| 5 | `A 90-day journey…` + `not.toContain("A weekly recap in sentences")` | `landing-wiring-pins.test.ts:158,159` | **flag-ON test fails both** |
| 6 | `Revora at a glance` heading + `ul.landing-glance` role | `tests/smoke/landing-a11y.spec.ts:69-76` | **fails, in the e2e suite** |

**Four broken `it` blocks in `npm test`, plus one in `npm run e2e`.**

- ✅ **The `journey-flag` flag-OFF test passes unchanged.** The winner renders `A weekly recap in
  sentences`, omits the 90-day string, and keeps both counted phrases at exactly 1.
- ✅ **Phase 9's fix 7 is verified sufficient**, not just directionally right: the amended deck's
  legacy tile and legacy FAQ match `copy-pins.test.ts:105` and `:111` character-for-character.
  `copy-pins.test.ts:83, 85, 88` all pass.

⚠️ **`npm test` is not the whole gate.** `vitest.config.ts` includes only `tests/**/*.test.ts`.
`tests/smoke/*.spec.ts` is Playwright (`playwright.config.ts testDir: "./tests/smoke"`), run by
`npm run e2e`. **A green `npm test` does not clear the landing.** 10C must run both.

### 3.3 Confirmed true against live source

| Claim | Evidence |
|---|---|
| `Most apps would just pick one and sound confident.` ships today, unledgered | `app/page.tsx:523-524` |
| Finding 4's source-order dependency is real | `globals.css:778` (13px) vs `:2281` (16px), identical specificity (0,2,0) |
| The hero label duplicates a computed string | `demo-check-card.tsx:24-33` returns `An illustrated example` character-for-character |
| `DemoCheckCard` nests `.result-card` (22px) in `.surface-card` (24px); documented nested is 14px | `demo-check-card.tsx:38-96` · `globals.css:115-120`, `625-632` |
| **`DESIGN.md` does NOT ban nested cards** | `:96` gives them 14px; `:216` uses it; `:357` bans card *mosaics*. Phase 8's Finding 2 misread it; Phase 9 withdrew it |
| The `faqs` array has one declaration, two consumers | `app/page.tsx:104`, `:161`, `:857` — the JSON-LD mismatch is impossible by construction |
| `DESIGN.md`'s base `16px/1.5` claim is **now true** | `body` is out of the `font: inherit` reset (`globals.css:83-87`) |

### 3.4 Corrections Phase 10A makes to the tournament record

1. The winner's page metrics were **20% low**, its desert map **35% low**.
2. **C5's reachability rule is not satisfied by the winner.** Every phase from 7 onward implied it was.
3. **Block 4's three cards do not each carry the disclaimer** — the deck states it once, in the note.
   (My own first measurement assumed they did and inflated block 4 by 645px. Caught and re-measured.)
4. **The H1's letter-spacing needed retuning with its clamp:** `-0.03em` → **`-0.02em`**. It was
   carried through unchanged from a ceiling 24% larger, and at the new 30.4px floor it compresses
   word spaces ~11%.
5. **The handoff's prescribed desert remedy was already applied and is not the lever.**
6. **C4's `--text-soft` graft is an accessibility rule.** §3.1.
7. **Tier B has a fifth string** (`Snap a photo, dictate it, or type it.`) and breakage spans **two
   suites**, not one. §3.2.

⚠️ **Process note worth carrying:** I made the estimate-instead-of-measure mistake myself, mid-task —
hand-adjusted two rows of the desert table after fixing a harness bug instead of re-running. Two of
four numbers were wrong. Re-measured and corrected. **The failure mode this phase exists to catch is
easy to commit while catching it.**

---

## 4. What Phase 10B owes — Section 16, the `DESIGN.md` rewrite

Snapshot first:

```bash
git show HEAD:DESIGN.md > /tmp/design-before.md
```

### 4.1 The three ⚖️ rulings 10A deliberately would not take alone

1. **⚖️ THE REACHABILITY BUDGET.** §2.1. C5's 1,460px rule is unachievable; four measured
   arrangements are in the spec's §11.2. Three options, all measured:

   | Option | Cost | Buys |
   |---|---|---|
   | **1 · Ship arrangement C, restate the budget to a derived number** | Restating a rule the page failed. **Must be named as such** | Max desert **1,941px**, pill gap 1,439px, no new copy, no new ledger row. **63% better than the incumbent** |
   | 2 · Ship arrangement D | One new sentence → one ledger row + one claim-class filing + a second exit inside the hero | Max desert **1,563px** |
   | 3 · Hold 1,460px literally | Cut ~1,000px of copy, or add a 7th filled pill that breaks the pill rule | The rule as written |

   **10A recommends option 1**, with the budget restated to a *derived* figure and the derivation
   shown — **no desert may exceed 3 screenfuls (2,001px) at 375px** — plus arrangement C's reorder.
   ⚠️ **Record it as a rule change, not a measurement result.**
   ⚠️ **Option 1's reorder has a copy cost:** it puts the CTA between the price tiles and C6's cancel
   paragraph, whose power is its **adjacency to the price** ("at the same weight as the price" is how
   the graft was specified). Pixel win 661px; cost one graft's adjacency. **Owner's call.**

2. **⚖️ THE MOTION-CURVE SPLIT.** The landing press is 120ms `cubic-bezier(0.23, 1, 0.32, 1)`; the
   sanctioned app layer (`DESIGN.md` §Motion) is 150ms `cubic-bezier(0.22, 0.61, 0.36, 1)`. Adopt one
   system-wide or document the split.

3. **⚖️ BLOCK 5's CTA POSITION**, if option 1 is taken. Folded into ruling 1 above.

### 4.2 The rest of 10B's list

- Carry the Phase 3 verdicts **and** the contested-item settlements.
- **Write rail 16:** *every user-facing sentence must be fileable under a claim class in
  `claims-boundary.md`; a sentence that is neither approved nor banned is not therefore permitted.*
- **Write the corrected shape rule:** *Outer surfaces 24px · inputs 18px · nested cards 14px ·
  result cards 22px · pills 999px. The landing chooses none of them.*
- **Reconcile the radius scale with `DemoCheckCard`** in one direction or the other.
  ⛔ **Do NOT restate a nested-card ban — there is none.** §3.3.
- **Rewrite rail 7:** its purpose is discharged **structurally** now (no stat-strip affordance
  exists), not by deletion.
- **Correct the `--text-soft` token annotation** (§3.1) and audit `globals.css:2673`, `:3148`.
- **Add banned-list item 7:** *a ledger row that records a section's intent is not a pin.*
- Every surviving rule states its derivation in one sentence. Scar tissue names its test file instead
  of retelling its incident. Accidents gone — including the "for content pages" scope clause.
- Fix `DESIGN.md` §Marketing landing's "body 16.5–17px, ledes 18.5px" — the winner is one body value.
  (The §Type `16px/1.5` claim is **now true**; do not "fix" it.)
- **Shorter and more load-bearing than 361 lines.** Report before/after and what was cut.

**Stop after Section 16 and checkpoint.**

---

## 5. What Phase 10C owes — Section 17, the implementation plan

**Baseline is green now (§1.3), so the predictions are worth writing.**

- **The breakage set in §3.2**, all six, with the journey-branch coverage **MOVED, not deleted** —
  deleting the copy *and* its test discharges the flag's only coverage by deletion (banned-list item
  6). The test builds the flag-on state via `renderLanding({ NEXT_PUBLIC_LEARNING_JOURNEY: "1" })`,
  so the branch must survive somewhere renderable.
- **Run `npm test` AND `npm run e2e`.** §3.2.
- **Two new ledger rows, not four:** the hero card caption, and the block-3 caption + dare link. (The
  two sources paragraphs need their own row.) **Every card *body* on the winner is already-approved
  `result-*` copy — the winner invents no new card body copy at all.**
- **Extract `<ExampleResultCard>`.** Load-bearing, not a nicety: it is the only thing stopping the
  hero's hand-typed `An illustrated example` from silently becoming a **false claim** the day a live
  capture is authorised and `demoExampleEyebrow` starts returning `A real check, captured <date>`.
- **Guard test: no `.landing*` selector may declare `border-radius` or `border` on `.result-card` or
  `.surface-card`.** The page's central claim — *the landing shows the product's card, unmodified* —
  has no test.
- **Pin the `faqs` shared-consumer invariant.** Cheap, high value, currently a code comment.
- **Adopt C5's two tests:** 44/48px targets, `prefers-reduced-motion`.
- **Instrument the block-3 dare link separately** as the page's most important non-primary CTA. Four
  of five cards are fixtures; this link is the only place the reader can make the product perform.
  If it converts, the fixture objection is answered by the product rather than by more copy.
- **Separate product-level work item:** un-nest or re-radius `DemoCheckCard` (three routes).
- ⛔ **Do not move the `.landing .result-disclaimer` block above `globals.css:778`.**
- Delete `.landing-proof-band`; rename `.landing-phone` → `.landing-hero-proof`.
- **Governance item, independent of ship/no-ship:** route `app/page.tsx:523-524` to counsel. The
  winner deletes the block it lives in, so shipping the winner *incidentally* fixes it — **and not
  shipping the winner leaves it in place.**

---

## 6. Standing rulings — do not reopen

- **The comparative-confidence family: unavailable at any scale.** `claims-boundary.md` defines nine
  claim classes and **every one is about Revora**; there is no class under which a statement about
  another company's product can be filed, and `validate-safety-contract --claims-boundary` rejects a
  row whose class does not resolve. It is **outside the schema**, neither approved nor banned. Cite
  the reason, never a vote. Creating a class is a counsel decision.
- **The three kills** (C5 Craft 3.33 · C4 Emo 2.83 · C7 Category 3.00) and **the organ assignments**.
- **Contested #1: keep the second typeface.** **Contested #2: inherit the card radius.**
- **The research disclosure:** content survives as ~180px of prose in block 4; `.landing-proof-band`
  does not.
- **The FAQ JSON-LD mismatch is confirmed absent by construction** (§3.3), which is what makes fix
  2's FAQ move free.
- **Rail 14 (light surface, no dark bands) is immutable this round.**

### 6.1 Traps

1. **Skills bind.** Invoke and hold before any spec or editing work: `impeccable`, `iui-ux-pro-max`,
   `taste-skill:taste-skill`, `apple-design`, `emil-design-eng`, `icopywriting`, `icro`.
2. **`taste-skill` bans em dashes; the approved CTA has one** (`Check your first meal — free`). It
   stays — it is ledger copy pinned by `copy-pins`. After fix 6 the page's count is **a true 4
   strings, all unstrippable**. Any new em dash is a bug.
3. **Do not give the Clear card an adjustment.** `assertNoUnsafeSafeFields` throws in the engine.
4. **Do not resurrect** the two rejected C6 headlines (`You can probably eat it.` /
   `Most meals come back Clear.`) or the DPP statistic.
5. **"It passes the guards" is not clearance.** Three separate fences, only one reads source:
   `claims-boundary-copy.test.ts` (every `.tsx`, banned families) ·
   `validate-safety-contract.mjs` (**only `docs/safety/*.md`, no source file ever**) · the pin suites.
   **Nothing connects the ledger to the source in either direction.**
6. **Only ever run one `next dev`.** `pkill -9 -f "next-server"; rm -rf .next; npm run dev`.
7. **`~/.claude/skills/gstack/` does not exist on this machine** — gstack helpers silently no-op. Use
   Playwright from the repo's own `node_modules` (`node_modules/playwright/index.mjs`, absolute
   import — a bare `import "playwright"` from outside the repo fails).
8. **Assume every document here is as unverified as the code was.** Phase 8 found five code
   discrepancies, Phase 9 found three false premises in the governance docs, **Phase 10A found the
   winner's own headline metrics wrong by 20–35%.** Check before citing.

---

## 7. Reproducing the measurement

The harness lives in the session scratchpad, not the repo. To rebuild it: launch one `next dev`
(`pkill -9 -f "next-server"` first), load `/` at 375×667 in Chromium from
`node_modules/playwright/index.mjs`, `await document.fonts.ready`, lift
`[data-testid="demo-check-card"]` out of the live DOM, replace `main.landing`'s contents with the
winner markup, inject the spec's §§2–9 CSS, and read `getBoundingClientRect()`.

⚠️ **Validate against the incumbent first.** It must return ~13,3xx px, 7 CTAs, ~5,2xx px longest
desert. If it does not, the harness is wrong, not the page.

⚠️ **Two harness traps, both hit this session:** `.result-row` is a `20px 1fr` grid expecting an icon
as its first child — omit it and the adjustment text wraps into a 20px column and inflates cards by
~300px each. And **block 4's cards carry no fineprint**; only the hero card's spec lists one.

---

## 8. Next session prompt — paste this

> Continue the Revora landing design & copy tournament. Read
> `docs/handoff/2026-08-05-landing-tournament-phase-10a-winner-spec-and-green-baseline-handoff.md`
> first, then **`docs/plans/landing-tournament-winner-spec.md` (Section 15, the build spec) — it
> supersedes Phase 8 §13.4 and the winner's estimated page metrics.** Then
> `docs/handoff/2026-08-05-landing-tournament-phases-0-9-consolidated-handoff.md` for Phases 0–9,
> the Brief, the constraint ledger and the live fact table.
>
> **State:** Phases 0–10A complete, 15 of 18 sections written. The winner is `W — One Card Back`.
> `npm test` is **GREEN at `8c4c0e9`: 2,184 passed / 0 failed / 2 skipped, 186 files, 164s** — the
> six-session debt is cleared, and the suite takes under 3 minutes, not the ~26 older handoffs claim.
>
> **Phase 10A measured the winner in a browser and it falsifies the carried-forward metrics:**
> 8,621px / 12.9 screens (estimate ~6,865 / 10.3), longest desert 2,224px (estimate 1,450px), and
> **three of five deserts breach the 1,460px budget. C5's reachability rule is not satisfied and no
> arrangement of the winner's six exits satisfies it** — four arrangements are measured in the spec's
> §11.2. Do not re-derive any of these numbers from the plan documents.
>
> **Do not** re-score, rebuild contenders, re-run the kill round, re-derive the convergences, re-open
> the two settled no-convergence items, re-synthesise the winner, or **re-open the
> comparative-confidence ruling** (unavailable at any scale — `claims-boundary.md` has no claim class
> for a statement about a third party).
>
> **Do next: Phase 10B — Section 16, the `DESIGN.md` rewrite.**
> Snapshot first: `git show HEAD:DESIGN.md > /tmp/design-before.md`.
>
> **Take the three ⚖️ rulings 10A deliberately would not take alone** (§4.1 of the handoff):
> 1. **The reachability budget.** Restate to a derived figure **and record it as a rule change**, or
>    hold the rule and cut copy. 10A recommends arrangement C plus a derived "no desert may exceed 3
>    screenfuls (2,001px) at 375px". Restating a number because the page missed it is banned-list
>    item 2 — name it, do not slip it in. Weigh the copy cost: the reorder puts the CTA between the
>    price tiles and C6's cancel paragraph, whose power is adjacency to the price.
> 2. **The motion-curve split** — landing 120ms `cubic-bezier(0.23, 1, 0.32, 1)` vs app 150ms
>    `cubic-bezier(0.22, 0.61, 0.36, 1)`. Adopt one or document both.
> 3. **Block 5's CTA position**, folded into ruling 1.
>
> Then: write rail 16 · write the corrected shape rule (24px surfaces / 18px inputs / 14px nested /
> 22px result cards / 999px pills, the landing chooses none) · **reconcile the radius scale with
> `DemoCheckCard`, and do NOT restate a nested-card ban — `DESIGN.md:96` gives nested cards a radius
> and `:216` uses it; Phase 8's Finding 2 misread the file** · rewrite rail 7 (discharged
> structurally now, not by deletion) · **correct the `--text-soft` annotation — it is 4.40:1 on
> `--page-bg` and FAILS AA, and `globals.css:2673`/`:3148` use it as a text colour on app surfaces
> that 10A did not audit** · add banned-list item 7 · fix §Marketing landing's "body 16.5–17px"
> (the winner is one body value; the §Type `16px/1.5` claim is now TRUE, do not "fix" it) · be
> shorter and more load-bearing than 361 lines and report before/after and what was cut.
>
> Invoke and hold before starting: `impeccable`, `iui-ux-pro-max`, `taste-skill:taste-skill`,
> `apple-design`, `emil-design-eng`, `icopywriting`, `icro`.
>
> Rails: light surface only, no dark bands. Every number from the live fact table. Tier A is ten
> pins; **Tier B is five strings now, not four — `Snap a photo, dictate it, or type it.`
> (`landing-wiring-pins.test.ts:143`) is on no prior list.** Do not give the Clear card an
> adjustment. Do not resurrect the two rejected C6 headlines or the DPP statistic. Do not use
> workflows or dynamic subagent orchestration. Do not treat "the guards pass" as claim clearance —
> three separate fences, only one reads source.
>
> Stop after Section 16 and checkpoint.

---

## 9. Files written this session

| File | Change |
|---|---|
| `docs/plans/landing-tournament-winner-spec.md` | **NEW** — Section 15, the build spec (~1,150 lines) |
| `docs/handoff/2026-08-05-landing-tournament-phases-0-9-consolidated-handoff.md` | Status block, phase table, document index, §14 next-session prompt |
| **this file** | **NEW** |

**No code changed. No commits. `git diff` empty. `DESIGN.md` untouched.**

---

## 10. Section ledger

| Phase | Sections | State |
|---|---|---|
| 0–9 | 1–14 | Done |
| **10A** | **15** | **Done — `landing-tournament-winner-spec.md`** |
| **10B** | **16** | **NEXT — rewrite `DESIGN.md`** |
| 10C | 17 | Not started — `landing-tournament-implementation-plan.md` |
| — | 18 | Not started — decision memo |

**Section 18's three Phase 9 additions still stand, plus one from 10A:**
- *Not obvious:* a four-phase escalation ladder was built on a ledger row that does not exist, and no
  test in the repository could have caught it.
- *What the incumbent had right:* the `faqs` shared array, and that every card body on the winner is
  already-approved copy.
- *Biggest shipping risk:* the page's central claim is *the landing shows the product's card,
  unmodified*; it has no test; and the product's card already violates the product's own radius scale.
- **NEW from 10A:** *the tournament's most confident numbers were its least verified.* The winner's
  page length and desert map were carried through three phases and two red-team passes, cited as
  settled fact, and were wrong by 20–35% the first time anyone opened a browser.

---

**Session ends here.** `npm test` green at 2,184/0/2. No code changed. No commits.
