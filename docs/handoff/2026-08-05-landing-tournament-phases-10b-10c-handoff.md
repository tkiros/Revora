# HANDOFF — Revora landing tournament, Phases 10B & 10C complete

**Date:** 2026-08-05
**Branch:** `fix/landing-followups` (HEAD `8c4c0e9`, unchanged)
**Status:** **17 of 18 sections written. Only Section 18, the decision memo, remains.**
**Code changed: none. Commits: none.**

✅ **`npm test` re-run and GREEN this session, with 10B's `DESIGN.md` rewrite in the working tree:**
**2,184 passed / 0 failed / 2 skipped · 186 files (1 skipped) · 155.34s.** Identical to the recorded
baseline, and no test or script in the repo reads `DESIGN.md` (`grep -rn "DESIGN\.md" tests/ scripts/`
→ nothing), so the rewrite broke nothing.

> **This file covers Phases 10B and 10C only.** For Phases 0–9 read
> `docs/handoff/2026-08-05-landing-tournament-phases-0-9-consolidated-handoff.md`, which remains
> accurate for everything it describes. Where the two disagree about `DESIGN.md`, the rails, the
> reachability budget, the motion curve, or the ledger work, **this file and the two documents it
> produced win.**

---

## 0. Read order

| Read | File | Why |
|---|---|---|
| **1st** | **this file** | State of play after 10B and 10C |
| **2nd** | **`DESIGN.md`** | **Rewritten. It is now the authority on rules and carries four rulings** |
| **3rd** | **`docs/plans/landing-tournament-implementation-plan.md`** | Section 17. The 13 work items, the verified breakage set, the ledger work |
| 4th | `docs/plans/landing-tournament-winner-spec.md` | Section 15. The build spec and the browser measurement |
| context | `…phases-0-9-consolidated-handoff.md` | The tournament itself: contenders, scoring, kills, organs |
| as needed | `docs/plans/landing-tournament-phase-9.md` · `-phase-8.md` | The red-team and the winner spec in full |
| snapshot | `/tmp/design-before.md` | The pre-rewrite `DESIGN.md`. ⚠️ **Ephemeral — regenerate with `git show HEAD:DESIGN.md`** |

**Do NOT** re-score, rebuild contenders, re-run the kill round, re-derive convergences, re-synthesise
the winner, re-open the comparative-confidence ruling, or re-litigate the four rulings in §2 below.

---

## 1. Repo state

```
 M DESIGN.md                                              ← 10B, uncommitted
?? docs/plans/landing-tournament-implementation-plan.md   ← 10C, untracked
?? docs/handoff/2026-08-05-…-phases-10b-10c-handoff.md    ← this file
```

Nothing else changed. No `app/` or `components/` file has been touched in the entire tournament.

```bash
pkill -9 -f "[n]ext-server"   # ⚠️ the [n] MATTERS — see trap 1
npm test                      # vitest, tests/**/*.test.ts only. ~2.6 min
npm run e2e                   # Playwright, testDir ./tests/smoke. SEPARATE GATE
npm run contract              # validate-safety-contract, 9 validators. Gates ledger edits
```

---

## 2. Phase 10B — the `DESIGN.md` rewrite

**361 lines → 360.** Word count **3,309 → 4,657**, and the file says so: it is **denser, not
lighter.** The line target was met at the margin; the honest measure is that the file gained ~120
lines of net-new mandated content (16 rails, 8 banned items, 5 scar rows, 4 rulings) and paid for it
by cutting carried-forward prose.

### 2.1 The four rulings it now carries

**⚖️ 1 — The reachability budget, restated in screenfuls and labelled a rule change.**
C5's 1,460px rule was derived from a *different* contender's page and transplanted onto an 8,621px
one without ever being checked. Measured, the winner fails it in three places, worst by 764px, and no
arrangement of its six exits satisfies it. New rule: **no stretch between exits may exceed three
screenfuls, 2,001px at 375×667.** Measured worst on the best free arrangement: 1,941px; incumbent:
5,228px (7.8 screenfuls). **The half with teeth is the measurement clause, not the number:** *every
marketing layout change reports its measured page length, exit count and desert map at 375px, in the
browser, with the real fonts loaded. An unmeasured desert claim does not count.*

**⚖️ 2 — The motion-curve split is closed. One ease.**
`--ease` becomes `cubic-bezier(0.23, 1, 0.32, 1)` (easeOutQuint); `cubic-bezier(0.22, 0.61, 0.36, 1)`
(easeOutCubic) is retired. Both `emil-design-eng` and `impeccable` prescribe the stronger curve, and
120ms sits inside the 100–160ms press window Apple and Emil give independently. Added
`--dur-press: 120ms`. **This is a one-line change** — all 24 consumers read `var(--ease)` and none
hardcodes the curve.

**⚖️ 3 — Block 5's CTA position: the copy wins.**
The cancel paragraph keeps its adjacency to the price. The CTA moves to the first position that does
not break it — immediately **after** the cancel paragraph, before the claims. That variant is
unmeasured; 10C's W13 measures it. If it misses the budget, the measured arrangement is the fallback
and the adjacency is the recorded cost.

**⚖️ 4 (not requested, but owed) — `DemoCheckCard`'s wrapper is not a card.**
The radius reconciliation. `components/demo-check-card.tsx:38` renders `.surface-card` (24px) around
two `.result-card`s (22px), where the documented nested value is 14px. **The wrapper drops
`surface-card`** and becomes an unbordered labeled region (`aria-label="Example check"`), on this
file's own rule that *cards earn existence*. The two `.result-card`s stay untouched. ⛔ Do **not**
re-radius the inner cards — that would make them render differently on the landing than on `/check`
and break the page's central claim.

### 2.2 Also written into `DESIGN.md`

- **Rail 7 rewritten** — discharged *structurally* (no big-number affordance exists) rather than by a
  CSS comment asking nobody to use one.
- **Rail 16, new** — *every user-facing sentence must be fileable under a claim class in
  `claims-boundary.md`; a sentence that is neither approved nor banned is not therefore permitted.*
- **The corrected radius scale in full:** outer 24px · inputs 18px · nested 14px · **result cards
  22px** · pills 999px. `22px` is a scale member, not an exception.
- **Banned-list item 7** — *a ledger row that records a section's intent is not a pin.*
- **The 16-rail table** with an enforcement column, and the ranking of which rail a redesign breaks
  most quietly: **10 → 7 → 12 → 9 → 8.**

### 2.3 What 10B verified against source, and what it found false

| Claim | Verdict |
|---|---|
| `--text-soft` "AA at 16px on white" | **MISLEADING.** It is 4.76:1 on `--surface`, 4.55:1 on `--surface-muted`, **4.40:1 on `--page-bg` (FAIL)** and **4.15:1 on `--accent-tint` (FAIL)**. Now plane-restricted |
| The two app-surface `--text-soft` uses 10A did not audit | **AUDITED. All four in-repo uses pass, none with margin.** `:198` and `:3148` are placeholders on an input's own `--surface`; `:2673` `.chip-remove` on `--surface-muted`; `:2546` is a decorative `background`, not text |
| "One filled pill per viewport — now enforced in code" | **FALSE.** No such assertion exists anywhere. Recorded as unenforced |
| §Type's base `16px / 1.5` "now actually in force" | **TRUE.** `body` is out of the `font: inherit` reset at `globals.css:83-87` |
| §Class vocabulary is an accurate index | **FALSE.** It listed `request-status`, which has **zero** rules in `globals.css`, and named 8 of the 41 files in `components/`. Cut |

### 2.4 Cut as accidents

§Class vocabulary · "CSS only, no animation libraries" (a dependency policy dressed as a design rule)
· the 480px `.page-frame` legacy note · **the scope clause "for content pages"** in §App-UI guardrails
— the clause that let marketing become a card mosaic while a rule banning card mosaics sat in the same
file · three separate retellings of one font incident, folded into the scar-tissue table.

---

## 3. Phase 10C — the implementation plan

`docs/plans/landing-tournament-implementation-plan.md`, 440 lines. Section-by-section diff with real
line ranges, the CSS delta, the verified breakage set, the ledger work, 13 ordered work items.

### 3.1 The ordering principle

**Guards and coverage first, deletions late.** W4's five guard tests and W6's flag coverage all pass
on the *current* tree, so they land green and standalone, and are then doing their job during the
risky commits.

| # | Item | Gate |
|---|---|---|
| W1 | Motion tokens: `--ease` value + `--dur-press` | `npm test` |
| W2 | Rename `.landing-phone` → `.landing-hero-proof` | `npm test` |
| W3 | Source-order comment amended onto `.landing .result-disclaimer` | none |
| W4 | Five guard tests, all passing today | `npm test` + `e2e` |
| W5 | Extract `<ExampleResultCard>`, identical rendered markup | `npm test` |
| W6 | **Move journey-flag coverage to `journey-card.tsx`** | `npm test` |
| W7 | Ledger: 4 amendments + 4 new rows | **`npm run contract`** |
| W8 | One-plane visual pass (largest CSS diff, lowest copy risk) | `npm test` + `e2e` |
| **W9** | **Delete the six retired blocks + dead selectors + dead imports, with 5 of the 6 breakage fixes in the same commit** | `npm test` + **`e2e`** |
| W10 | The new copy deck + the pricing-lede deletion with its fix | `npm test` + `contract` |
| W11 | Block 3, the pause, and the one animation | `npm test` + `e2e` |
| W12 | FAQ move, em-dash strip, block 6 trim | `npm test` |
| W13 | **Measure and report** the desert map | — |

⚠️ **W9 is the only commit that can leave the tree red alone.** Its test edits are part of the same
commit or the revert is not clean. ⛔ **W6 must precede W9** and **W7 must precede W10.**

### 3.2 The four things 10C found that prior phases had wrong or missing

**A. A delete list nobody had.** `globals.css:1551-1566` is a shared `font-family` group of fourteen
selectors, and **seven belong to blocks the winner deletes**: `.landing-eyebrow`, `.landing-step h3`,
`.landing-step-num`, `.landing-feature h3`, `.landing-proof-item h3`, `.landing-glance-fact`,
`.landing-verdict-meal`. Deleting each block's own rule leaves them as dead selectors inside a live
declaration — the same rot that left `.landing-phone` naming a bezel removed in July.

**B. The source-order comment 10A asked for is half-written already.** `globals.css:2275-2280` exists
but explains only *why* 16px, never that the rule wins by file position — and its parenthetical
("the demo result card and the footer") **goes stale** the moment the hero card becomes the first
instance. W3 **amends** it; it does not write it from scratch.

**C. The journey-flag move target is real, and better than what exists.**
`learningJourneyUiEnabled()` has **three** consumers — `app/page.tsx:94` (deleted by W9),
`app/(app)/journey/page.tsx:51`, `components/journey-card.tsx:171` — and exactly **one** behavioural
test, the landing one. (`next-config-twin-guard.test.ts` matches the env name but only asserts it is
declared in both Next configs.) So today the flag's only rendered-output coverage sits on the surface
being deleted, while its two shipping consumers are untested. **Moving coverage to `journey-card.tsx`
raises net coverage.**

**D. "Two new ledger rows" undercounts. It is four amendments and four new rows.**
Only four `landing-*` rows exist. The two the spec missed: **the cancel paragraph** (new landing copy
whose only existing coverage — `cancel-page`, `account-cancel-button` — is for *app* surfaces) and
**block 5's claims list**. Separately: ⚠️ **the FAQ is entirely unledgered today** — grepping the
ledger for `Is Revora medical advice`, `Fair questions`, `How do I cancel` returns **zero**. Five
answers ship under no row. Pre-existing, not caused by this rebuild, and **rail 16's first real
subject.**

### 3.3 The breakage set — six assertions, verified against the green baseline

| # | Assertion | Site | Fix |
|---|---|---|---|
| 1 | `Two ways in.` / `Three ways in.` | `landing-wiring-pins.test.ts:134-135` | delete the `photo-flag branches` describe |
| 2 | `Dictate it or type it.` | `:136` | same describe |
| 3 | **`Snap a photo, dictate it, or type it.`** | **`:143`** | same describe. **Was on no prior Tier B list** |
| 4 | `{TASTER_LIMIT} free checks on day one` | `copy-pins.test.ts:84` | drop that one `expect` |
| 5 | `A 90-day journey, recapped weekly` + `not.toContain(...)` | `landing-wiring-pins.test.ts:158-159` | ⚠️ **MOVE, §3.2 C** |
| 6 | `Revora at a glance` + `ul.landing-glance` role | `tests/smoke/landing-a11y.spec.ts:69-76` | ⚠️ **RETARGET to `ul.landing-trust-strip`. In `npm run e2e` only** |

✅ **Verified to still pass, no fix owed:** `copy-pins.test.ts:83, 85, 88` (the three surviving
`TASTER_LIMIT` phrases), `:105` and `:111` (both `FREE_DAILY_CHECKS` sites, character-for-character),
and the `journey-flag` **flag-OFF** test at `:148-154`.

⚠️ **Row 6's fix is a retarget, not a delete.** That test exists to prove `list-style: none` strips
list semantics in Safari/VoiceOver, so landing lists carry an explicit `role="list"`. The glance strip
was merely its example; `.landing-trust-strip` and `.landing-pains` both survive with `role="list"`.
Deleting the assertion would be banned-list item 6.

---

## 4. What is left: Section 18, the decision memo

The last deliverable. Required content, from the master prompt:

1. **The winner, and the one sentence why.**
2. **What the tournament proved that was NOT obvious.**
3. **What the current page already had right** — specifically and generously.
4. **The three highest-leverage changes by impact-per-hour.**
5. **What in `DESIGN.md` was scar tissue and never should have been a design rule.**
6. **The single biggest shipping risk.**
7. **What only real visitors can settle.**

### 4.1 Material Phase 9 supplied

- *Not obvious:* a four-phase escalation ladder was built on **a ledger row that does not exist**, and
  **no test in the repository could have caught it**, because nothing connects the ledger to the
  source in either direction.
- *What the incumbent had right:* the `faqs` shared array — schema honesty **by construction**, which
  three contenders independently failed to notice they were about to break — and that **every card
  body on the winner is already-approved copy.**
- *Biggest shipping risk:* the page's central claim is *the landing shows the product's card,
  unmodified*; it has no test; **and the product's card already violates the product's own radius
  scale**, so "unmodified" currently means "inheriting a documented inconsistency."

### 4.2 Material 10B and 10C add

- *Not obvious:* **the reachability budget was unachievable and nobody knew, because the tournament
  ran on paper.** The fix was to change the rule's **unit** (pixels → screenfuls), not to move its
  number — and the durable half of the organ turned out to be the *measurement discipline*, not the
  threshold.
- *Not obvious:* **the FAQ has shipped entirely unledgered** (§3.2 D). Rail 16 did not invent a
  problem; it named one that was already in production.
- *Not obvious:* estimates in this tournament ran **20% low on page length and 35% low on the worst
  desert**, and not one of five estimated gaps landed within 200px of its measurement.
- *Scar tissue that was never a design rule:* the class-vocabulary index (an index that drifts is
  worse than none) · "CSS only, no animation libraries" (a dependency policy) · **the "for content
  pages" scope clause**, which is the single clearest example — a rule banning card mosaics sat in the
  same file as the clause exempting the page that became one.
- *Impact-per-hour candidates, already ordered:* **W2** (rename a lying class, minutes) · **W3**
  (a comment that protects rail 10, minutes) · **W1** (one token, app-wide motion improvement) ·
  **W4** (five guard tests that land green and then protect every risky commit after them).
- *Biggest shipping risk, updated:* still the untested central claim — but W4 now schedules the guard
  test, so the memo can state the risk **and** its remedy in the same breath.
- *What only real visitors can settle:* whether **the block-3 dare link converts.** Four of the
  winner's five cards are fixtures, and the strongest criticism the page will get is *"three example
  cards is not a demo."* The dare link is the one place a reader can make the product do the thing.
  If it converts, the fixture objection is answered by the product instead of by more copy. Also
  unsettleable on paper: whether removing ~3,000px of informational surface costs conversions that
  were happening off feature #7 of nine.

---

## 5. Next-session prompt — paste this

> Continue the Revora landing design & copy tournament. **Only Section 18, the decision memo,
> remains.**
>
> Read `docs/handoff/2026-08-05-landing-tournament-phases-10b-10c-handoff.md` first. Then read
> `DESIGN.md` (rewritten by Phase 10B — it is now the authority on rules and carries four rulings) and
> `docs/plans/landing-tournament-implementation-plan.md` (Section 17). Open
> `docs/plans/landing-tournament-winner-spec.md` for the browser measurement and
> `docs/handoff/2026-08-05-landing-tournament-phases-0-9-consolidated-handoff.md` for the tournament
> itself — contenders, scoring, kills, organs.
>
> **State:** Phases 0–10C are complete. 17 of 18 sections written. The winner is `W — One Card Back`.
> `DESIGN.md` is rewritten (361 → 360 lines, and it reports honestly that word count went 3,309 →
> 4,657 — denser, not lighter). The implementation plan has 13 ordered work items, W1–W13. **No code
> has changed and nothing is committed.**
>
> **Do next: Section 18, the decision memo.** §4 of the handoff lists the seven required parts and the
> material Phases 9, 10B and 10C supply for each. Write it to
> `docs/plans/landing-tournament-decision-memo.md`.
>
> **Do not** re-score, rebuild contenders, re-run the kill round, re-derive convergences,
> re-synthesise the winner, re-open the comparative-confidence ruling (unavailable at any scale —
> `claims-boundary.md` has no claim class for a statement about a third party), or re-litigate the
> four rulings in handoff §2.1. They are settled and written into `DESIGN.md`.
>
> **The memo is a judgement document, not a summary.** It should be short, opinionated, and honest
> about what the tournament got wrong about itself — three false premises in the governance documents,
> a reachability rule that was unachievable, page metrics 20% low and desert estimates 35% low.
> Be specific and generous about what the incumbent page already had right.
>
> ✅ `npm test` is green: 2,184 passed / 0 failed / 2 skipped, 186 files, 155s, verified this session
> **with the `DESIGN.md` rewrite in the tree.** ⚠️ `npm run e2e` has NOT been run and holds one known
> breakage for W9. ⚠️ Use `pkill -9 -f "[n]ext-server"` — the `[n]` matters, see handoff trap 1.
>
> Rails: light surface only, no dark bands (owner instruction). Every number from the live fact table.
> Do not give the Clear card an adjustment. Do not resurrect the two rejected C6 headlines or the DPP
> statistic. **Do not use workflows or dynamic subagent orchestration.**
>
> After Section 18, the tournament is complete and the next decision is the owner's: ship W1–W13, or
> not.

---

## 6. Traps

1. ⚠️ **`pkill -9 -f "next-server"` matches its own shell's command line and kills the job it is
   part of.** It silently killed this session's first test run: exit 1, empty output, no error. Use
   `pkill -9 -f "[n]ext-server"`.
2. **`npm test` is not the whole gate.** Three gates: `npm test` (vitest, `tests/**/*.test.ts`),
   `npm run e2e` (Playwright, `tests/smoke/`), `npm run contract` (ledger). Breakage #6 lives only in
   the second; ledger edits are gated by neither of the first two.
3. **The suite takes ~2.6 minutes, not the "~26 minutes" five earlier handoffs claimed.** That figure
   was stale and deterred the run for six sessions.
4. **"It passes the guards" is not claim clearance.** Three fences, and only one reads source. Nothing
   connects the ledger to the source in either direction.
5. **`/tmp/design-before.md` is ephemeral.** Regenerate with `git show HEAD:DESIGN.md > /tmp/design-before.md`.
6. **Assume every document in this repo is as unverified as the code was**, including the governance
   documents and including these handoffs. Phase 9 found three false premises in the safety docs;
   10A falsified the winner's page metrics; 10B found a `DESIGN.md` claim that was enforced nowhere;
   10C found a delete list and a ledger gap no phase had. **Check before citing.**
7. **`taste-skill` bans em dashes; Revora's approved CTA contains one** (`Check your first meal — free`).
   It is ledger copy pinned by `copy-pins.test.ts`. Do not strip it. The winner's true count is 4
   strings, all unstrippable.
8. **Only ever run one `next dev`.** Concurrent servers over one `.next` cause `ChunkLoadError` reload
   loops: `pkill -9 -f "[n]ext-server"; rm -rf .next; npm run dev`.

---

## 7. Document index

| File | Holds |
|---|---|
| **this file** | **Phases 10B and 10C. Read first** |
| **`DESIGN.md`** | **Rewritten. 16 rails, the banned list, scar tissue, four rulings. The authority on rules** |
| **`docs/plans/landing-tournament-implementation-plan.md`** | **Section 17. 13 work items, the breakage set, the ledger work, the product and governance items** |
| `docs/plans/landing-tournament-winner-spec.md` | Section 15. Build spec + the browser measurement that falsified §10's metrics |
| `docs/handoff/…phases-0-9-consolidated-handoff.md` | Phases 0–9. The tournament: contenders, 42 scorecards, kills, organs, the Brief |
| `docs/plans/landing-tournament-phase-9.md` | Section 14. The red-team: three falsified premises, 15 findings, 11 fixes |
| `docs/plans/landing-tournament-phase-8.md` | Section 13. The winner in full. Amended in 11 places by Phase 9 |
| `docs/plans/landing-tournament-phase-7.md` · `-phase-6.md` · `-phases-4-5.md` | Kill rulings · 42 scorecards · the seven contenders |

**Not yet written:** `docs/plans/landing-tournament-decision-memo.md` (Section 18).

---

**Session ends here.** `DESIGN.md` rewritten and uncommitted. Implementation plan written and
untracked. No `app/` or `components/` file touched. `npm test` run and green.
