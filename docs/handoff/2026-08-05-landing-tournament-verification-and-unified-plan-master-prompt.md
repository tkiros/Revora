# MASTER PROMPT — Verify the Revora landing tournament, then produce one unified implementation plan

**Created:** 2026-08-05 · **For:** a fresh session with no prior context
**Repo:** `/home/tefera/Desktop/Revora` · **Base commit:** `8c4c0e9` on `fix/landing-followups`

> **How to use this file.** Paste the whole file, or say:
> *"Read `docs/handoff/2026-08-05-landing-tournament-verification-and-unified-plan-master-prompt.md`
> and execute it."* Everything needed is here. Do not start reading source until §5.

---

## 1. Mission

The Revora landing design & copy tournament ran across eleven phases and produced **20 documents,
14,166 lines.** They contradict each other in known and unknown places, several were written from
premises later proved false, and **four work items have already shipped**, which has invalidated line
numbers throughout the newest plan. Three tasks, in order:

1. **READ** every tournament artifact — the master prompt, all plan documents, all handoffs,
   `DESIGN.md`, and the decision memo.
2. **VERIFY** every load-bearing claim against live source, the test suites, and the browser. Produce
   a claim register with a verdict per claim. **An unverified claim is not a true claim, and the
   register must say so rather than omit it.**
3. **UNIFY** the result into a single structured implementation plan that supersedes every prior
   plan document — one file a developer can execute top to bottom without opening anything else.

**The tournament's own defining lesson, and the standard for this work:** *every phase that read
source falsified a phase that had not.* Phase 8 read four files and found five discrepancies, four of
which changed a decision. Phase 9 read seven more and found three false premises **in the governance
documents themselves.** Phase 10A measured in a browser and falsified the winner's page metrics. 10B
found a `DESIGN.md` rule enforced nowhere. 10C found a delete list no phase had. **Not one of those
was found by thinking harder about a document.** Assume every file listed in §3 is as unverified as
the code turned out to be — including the safety documents, including the handoffs, and including
this prompt.

---

## 2. Current state — this section supersedes every handoff it contradicts

### 2.1 What has shipped

**Work items W1–W4 are committed** in a git worktree, branched from `8c4c0e9`. Every handoff in §3
predates this and says "code changed: none." **That is now false.**

```
worktree:  /home/tefera/Desktop/Revora/.claude/worktrees/landing-w1-w4
branch:    landing/w1-w4      (4 commits off 8c4c0e9, working tree clean)

5c30246  test(landing): five design guards that pass on today's tree           ← W4
4ff5576  docs(css): comment the source-order dependency on the 16px disclaimer ← W3
f6afb1a  refactor(landing): rename .landing-phone to .landing-hero-proof       ← W2
f73eeaa  feat(motion): one system ease, and a named press duration             ← W1
```

| Item | What landed |
|---|---|
| W1 | `--ease` → `cubic-bezier(0.23, 1, 0.32, 1)`; added `--dur-press: 120ms` |
| W2 | `.landing-phone` + `.landing-phone-inner` → **one** element, `.landing-hero-proof` |
| W3 | Source-order warning amended onto `.landing .result-disclaimer`; stale parenthetical generalised |
| W4 | `tests/unit/revora/landing-design-guards.test.ts` — 5 guards, 8 assertions, mutation-tested (7 injected violations → 7 reds) |

### 2.2 Gate results — both suites, measured this session

| Gate | Result | Note |
|---|---|---|
| `npm test` | **2,192 passed / 0 failed / 2 skipped**, 187 files, 172s | +8 over the 2,184 baseline = exactly W4's assertions |
| `npm run e2e` | **231 passed / 0 failed / 21 skipped**, 5.3m | ⚠️ **First run in the entire tournament.** Green. W9's predicted breakage is the only one |
| `npm run contract` | **not run** | Gates every ledger edit. Neither suite above touches it |

### 2.3 ⚠️ Three traps created by the current state

**A. The implementation plan's line numbers are now stale.** W1–W4 changed both files it indexes:

```
app/page.tsx      929 → 927 lines   (−2, at the hero, ~:264)
app/globals.css  3473 → 3482 lines  (+3 at :31, −2 at ~:1860, +8 at ~:2276)
```

`docs/plans/landing-tournament-implementation-plan.md` cites exact line ranges throughout §2 and §3.
**Every range after the first edit point is wrong by 2–9 lines.** Do not transcribe them. Re-derive
every line reference against the live worktree, and state in the unified plan which commit the new
numbers are valid at.

**B. The worktree does NOT contain the tournament documents or the rewritten `DESIGN.md`.**
It was branched from `8c4c0e9`, and all of it — the rewritten `DESIGN.md`, every plan file, every
handoff — is **uncommitted or untracked in the main checkout only.** Inside the worktree,
`DESIGN.md` is the **old, pre-10B version**, which contains rules 10B proved false. Read documents
from `/home/tefera/Desktop/Revora/`; read and edit *source* in the worktree. Never cite `DESIGN.md`
from a worktree path.

**C. Nothing is committed except W1–W4.** `DESIGN.md`'s rewrite, all eight plan documents and all ten
handoffs are untracked/modified in the main checkout. A stray `git checkout` or `git clean` destroys
the entire tournament. **Recommend committing the documents before doing anything else**, and say so
to the user rather than doing it unasked.

---

## 3. The corpus — 20 files, 14,166 lines

**Tier 1 — current authorities. Each owns a domain; cite the owner, not a summary.**

| File | Lines | Authoritative for |
|---|---|---|
| `DESIGN.md` *(main checkout, modified/uncommitted)* | 360 | **Rules.** 16 rails, banned list, scar tissue, 4 rulings |
| `docs/plans/landing-tournament-implementation-plan.md` | 440 | **Work items W1–W13**, breakage set, ledger work ⚠️ stale line numbers |
| `docs/plans/landing-tournament-winner-spec.md` | 1,171 | **Build spec + the browser measurements** |
| `docs/handoff/…phases-0-9-consolidated-handoff.md` | 1,125 | **The tournament** — contenders, scoring, kills, organs, the Brief, live fact table |
| `docs/handoff/…phases-10b-10c-handoff.md` | 347 | State after 10B/10C |
| `docs/plans/landing-tournament-decision-memo.md` | 311 | **Judgement, not new facts.** Section 18 |

**Tier 2 — evidence. Open for a specific fact; do not re-derive their conclusions.**

| File | Lines | Holds |
|---|---|---|
| `docs/prompts/2026-08-04-landing-design-and-copy-tournament.md` | 692 | **The original master prompt.** The 18-section contract. Read it to find what was asked and never delivered |
| `docs/plans/landing-tournament-phase-9.md` | 789 | The red-team: 3 falsified premises, 15 findings, 11 fixes |
| `docs/plans/landing-tournament-phase-8.md` | 831 | The winner in full. **Amended in 11 places by Phase 9** |
| `docs/plans/landing-tournament-phase-7.md` | 802 | Kill rulings, organs, banned list, 27 convergences |
| `docs/plans/landing-tournament-phase-6.md` | 1,096 | 42 scorecards. ⚠️ **Two narrative conclusions known-wrong** |
| `docs/plans/landing-tournament-phases-4-5.md` | 2,383 | The seven contenders, verbatim copy decks |

**Tier 3 — superseded. Read only to find a claim that leaked forward into Tier 1.**

`…master-handoff.md` (908) · `…phase-10a-winner-spec-and-green-baseline-handoff.md` (468) ·
`…phase-8-winner-synthesis-handoff.md` (529) · `…phase-9-red-team-handoff.md` (310) · the four
`2026-08-04-*` handoffs (480 + 406 + 385 + 333).

⚠️ **These carry premises later falsified.** Their value is negative if quoted and positive if
audited: several Tier 1 statements originate here and were never re-checked.

### 3.1 Precedence when documents disagree

1. **Live source and a green test run** beat every document, always.
2. **§2 of this file** beats every handoff on current state.
3. Within Tier 1, the domain owner in the table above wins.
4. **Phase 9 beats Phase 8.** **10A beats Phase 8's estimated metrics.** **10B beats every earlier
   statement about `DESIGN.md`.** **10C beats the winner spec on breakage and ledger counts.**
5. Tier 3 loses to everything.
6. **A disagreement you cannot resolve is a finding, not a blocker.** Record both readings, name the
   evidence each rests on, and route it to §7's open-questions list.

---

## 4. Non-negotiable constraints

- **Do not use workflows, dynamic subagent orchestration, or parallel agent fan-out.** Read and
  verify directly.
- **Do not re-run the tournament.** No re-scoring, no rebuilding contenders, no re-running the kill
  round, no re-deriving convergences, no re-synthesising the winner. The winner is
  **`W — One Card Back`** and it is settled.
- **Do not reopen the settled rulings** listed in §7.
- **Rail 14 is immutable:** marketing surfaces read light, no dark bands. Owner instruction 2026-07-27.
- **Every number comes from the live fact table** (consolidated handoff §5.4), re-verified per §5.
- **Do not give the Clear card an adjustment** (`assertNoUnsafeSafeFields` throws).
- **Do not resurrect** the two rejected C6 headlines or the DPP statistic.
- **Do not strip the em dash** from `Check your first meal — free`. It is approved ledger copy pinned
  by `copy-pins.test.ts`.
- **Write no application code.** This task produces one document. W5 onward is a separate decision.

---

## 5. Task 2 — the verification protocol

Reading is §1's first task and needs no protocol beyond §3. **This section is the substance of the
job.** Do not treat it as a checklist to tick; treat it as an attempt to falsify the plan you are
about to write.

### 5.1 The rule

> **Every claim that changes what gets built must carry a verdict and the command that produced it.**
> Verdicts: ✅ **VERIFIED** (command + output) · ❌ **FALSE** (with the correction) ·
> ⚠️ **UNVERIFIABLE** (say why, and what it would cost to check) · 🔲 **UNCHECKED** (say why not).
> **🔲 is an acceptable verdict. Silence is not.** A claim omitted from the register reads as verified
> and that is how this tournament produced four phases of work on a ledger row that does not exist.

### 5.2 What to verify, at minimum

**Source facts.** Every line number, file length, selector, class name, import, and flag state cited
by any Tier 1 document — against the worktree at `landing/w1-w4`. Expect drift from §2.3 A.

**The live fact table.** `TASTER_LIMIT`, `FREE_DAILY_CHECKS`, `FREE_HISTORY_DAYS`, trial length,
`paywallMode()`, monthly and annual price, Pantry price, `RISK_LABELS`, `BOUNDARY_DISCLAIMER`,
`photoInputEnabled()`, `learningJourneyUiEnabled()`, `longitudinalInsightsEnabled()`, the A1C range.
Read each from its source module, not from a document.

**The breakage set.** Six assertions, `docs/plans/…implementation-plan.md` §5. Open each test file at
the cited line and confirm the assertion is still there and still says what the plan claims. **Row 6
lives only in `npm run e2e`.**

**The three gates.** Re-run `npm test` and `npm run e2e` in the worktree. **Run `npm run contract`,
which no session has run.** Record all three.

**The ledger.** Row counts, which rows are `landing-*`, which strings are ledgered and which are not.
The claim that the FAQ ships entirely unledgered is a governance finding and must be confirmed or
refuted by grep, not repeated.

**The measurements.** The winner spec's browser numbers were produced by a harness that was validated
against the incumbent first. Either re-run it or record the numbers as ⚠️ inherited-unrepeated. **Do
not silently promote a measured number to a verified one because a document printed it in bold.**

**W1–W4 themselves.** They are the newest and least reviewed work in the repository. Verify the four
commits do what §2.1 claims, that the five guards are non-vacuous (re-run at least two mutations), and
that nothing in them contradicts a Tier 1 document.

### 5.3 Claims already proved false — do not re-trust them, and check whether they leaked forward

Each was believed by at least one phase and repeated downstream. Confirm each correction still holds,
then **grep the corpus for the false version** and record every document still carrying it.

| Believed | Actual |
|---|---|
| `Most apps would just pick one…` is an approved ledger row | **0 hits** in `copy-ledger.md`; ships unledgered in `app/page.tsx`. A four-phase escalation ladder was built on it |
| Reachability budget: no stretch over 1,460px | **Unachievable.** Derived from a different contender's page. Superseded: 3 screenfuls / 2,001px at 375×667 |
| Winner is ~6,865px, longest desert 1,450px | **Falsified by browser measurement.** 8,621px, longest desert 2,224px. Estimates ran 20% and 35% low |
| `--text-soft` is "AA at 16px on white" | Fails AA on `--page-bg` (4.40:1) and `--accent-tint` (4.15:1) — planes the product renders on |
| "One filled pill per viewport — enforced in code" | **No such assertion exists anywhere** |
| `DESIGN.md` bans nested cards (Phase 8 Finding 2) | **It does not.** It gave nested cards a radius and used it |
| `DESIGN.md` §Class vocabulary is an accurate index | Listed a selector with zero rules; named 8 of 41 component files |
| The suite takes ~26 minutes | **~2.6 minutes.** The stale figure deterred the run for six sessions |
| Tier B has three retirements | **Four**, plus a fifth string at `landing-wiring-pins.test.ts:143` no list carried |
| "Two new ledger rows" | **Four amendments and four new rows** |
| "It passes the guards" = claim clearance | Three independent fences; **only one reads source** |

### 5.4 Never verified by anyone — these are the highest-value checks

- **The winner's central claim has no test**: *the landing shows the product's card, unmodified.*
  W4 added the override guard; confirm it actually covers the claim.
- **`DemoCheckCard`'s wrapper** renders `.surface-card` (24px) around two `.result-card`s (22px)
  where the documented nested value is 14px. Three routes import it. Confirm all three.
- **`npm run contract`** — never run in this tournament.
- **The winner spec's per-block measured geometry** — inherited from one 10A run, never repeated.
- **Whether the original master prompt asked for anything never delivered.** Read all 692 lines of
  `docs/prompts/2026-08-04-…md` against the 18 sections and report gaps. **No phase has done this.**
- **Whether any Tier 3 handoff carries a claim that reached Tier 1 unaudited.**

---

## 6. Task 3 — the unified implementation plan

**Write to:** `docs/plans/landing-implementation-plan.md` *(new name, deliberately — it supersedes
`landing-tournament-implementation-plan.md`, which should then be marked superseded at its head
rather than deleted).*

### 6.1 The standard

> **A developer with no tournament context executes it top to bottom, opening no other file.**

That is the acceptance test. Every line number valid at a named commit. Every command runnable.
Every string paste-ready. Every claim carrying its §5 verdict or a pointer to the register row.
**Prose that does not change what someone does gets cut.**

### 6.2 Required structure

1. **Status header** — base commit, which items have shipped, all three gate results with dates,
   what is uncommitted and where.
2. **The claim register** (§5) — every verified claim, its command, its verdict. This is the
   document's spine, not an appendix. Corrections called out.
3. **What changed since the last plan** — W1–W4's effects, the line-number drift, anything §5
   falsified. A reader who knows the old plan needs this first.
4. **The work items, W5–W13, renumbered or kept** — say which and why. Per item: what changes, exact
   files and re-derived line ranges, the gate, the risk, the dependency, and the revert story.
   Preserve the ordering principle: **guards and coverage first, deletions late.** Preserve the hard
   constraints **W6 before W9** and **W7 before W10**, or prove them obsolete.
5. **The breakage set** — re-verified, with the fix per row and which gate catches it.
6. **The ledger work** — amendments and new rows, gated by `npm run contract`.
7. **What must not change, and the test that catches it** — including the rows where the answer is
   ⛔ *nothing*.
8. **Product items** — separate PRs. The `DemoCheckCard` un-carding across three routes; `--dur-press`
   consumers in the app layer; instrumenting the block-3 dare link.
9. **Governance items** — independent of ship/no-ship. `app/page.tsx`'s unledgered comparative claim
   (⚠️ shipping the winner fixes it *incidentally*, and not shipping leaves it in place — it must be
   routed either way); ledgering the FAQ; the ledger/source gap.
10. **Open questions for the owner** — decisions that are genuinely not yours.
11. **Traps** — the current, verified set. Kill any that verification retired.

### 6.3 What the unified plan must not do

- **Must not launder an estimate into a fact.** Measured, estimated and inherited are three different
  words. This tournament's estimates ran 20–35% low.
- **Must not restate a rule because the page failed it** without labelling it a rule change. That is
  banned-list item 2, and the reachability budget is the precedent for doing it correctly.
- **Must not discharge a rail by deleting its subject.** Banned-list item 6. Coverage moves; it does
  not evaporate.
- **Must not delete a test whose subject survives elsewhere** — retarget it.
- **Must not exceed what verification supports.** A gap you found and could not close is a section of
  the plan, not an omission from it.

---

## 7. Settled — do not reopen

- **The winner** and its spine. **The three kills** and **the organ assignments.**
- **The comparative-confidence ruling.** Unavailable at any scale: `claims-boundary.md` defines nine
  claim classes and all nine are about Revora, so no class exists for a statement about a third
  party. Cite the reason, never a vote.
- **The four `DESIGN.md` rulings from 10B:** the reachability budget in screenfuls plus its
  measurement clause · one system ease · block 5's CTA position (copy over pixels) · the
  `DemoCheckCard` wrapper un-carded.
- **Contested #1** (keep the second typeface) and **#2** (inherit the card radius).
- **The research disclosure**: the content survives as prose, the band does not.
- **Rail 14**, light surfaces, immutable this round.

**Reopening one of these requires a genuinely new fact, named as such.** Disagreeing with the
reasoning is not a new fact.

---

## 8. Commands, gates and traps

```bash
# Documents live in the main checkout. Source lives in the worktree.
DOCS=/home/tefera/Desktop/Revora
SRC=/home/tefera/Desktop/Revora/.claude/worktrees/landing-w1-w4

pkill -9 -f "[n]ext-server"   # the [n] MATTERS — see trap 1
npm test                      # vitest, tests/**/*.test.ts only.  ~2.9 min
npm run e2e                   # Playwright, tests/smoke/.         ~5.3 min. SEPARATE GATE
npm run contract              # validate-safety-contract.         Gates every ledger edit
```

1. ⚠️ **`pkill -9 -f "next-server"` matches its own shell's command line and kills the job it is part
   of.** It has silently killed a test run in this repo: exit 1, empty output, no error. Always
   `[n]ext-server`.
2. **Three gates, not one.** `vitest.config.ts` includes only `tests/**/*.test.ts`. A green
   `npm test` does not clear the landing.
3. **Only ever run one `next dev`.** Concurrent servers over one `.next` cause `ChunkLoadError`
   loops: `pkill -9 -f "[n]ext-server"; rm -rf .next; npm run dev`.
4. **`~/.claude/skills/gstack/` does not exist on this machine.** gstack helpers silently no-op. Use
   Playwright from the repo's own `node_modules`.
5. **The git stash stack is shared across worktrees.** Never bare `git stash` / `git stash pop`.
6. **A fresh worktree has no `node_modules`.** `npm ci` first, ~2 min.
7. **`taste-skill` bans em dashes; the approved CTA contains one.** Do not strip it.
8. **`docs/archive/` is not an approved source**, and `Revora_Brand_Positioning_v2.md` is a tombstone.
   `docs/product-marketing.md` is the only active positioning source.

---

## 9. Acceptance criteria

Done when all of the following are true:

- [ ] All 20 files in §3 have been read. Files not read are named, with the reason.
- [ ] The claim register exists, and every claim carries ✅ / ❌ / ⚠️ / 🔲 plus its command.
- [ ] All three gates re-run and recorded — **including `npm run contract`, which no session has run.**
- [ ] Every line number in the unified plan re-derived against a named commit, not transcribed.
- [ ] The original master prompt audited against the 18 delivered sections; gaps reported.
- [ ] Every §5.3 correction confirmed still true, and every document still carrying the false version
      named.
- [ ] `docs/plans/landing-implementation-plan.md` written, and the old plan marked superseded at its
      head.
- [ ] The plan passes §6.1: executable with no other file open.
- [ ] **No application code changed.** This task produces one document.
- [ ] A short closing report: what verification changed, what it could not settle, and the single
      thing most likely still wrong.

---

## 10. Closing instruction

**The plan you write will be trusted more than any document it replaces, because it will be the only
one anybody reads.** Every phase of this tournament inherited a claim it did not check and passed it
downstream in bolder type. **Be the phase that stops.**

Where you are confident, say so plainly and show the command. Where you are not, say that instead —
in the document, not only in the chat. A unified plan that is honest about three unresolved gaps is
worth more than one that reads clean and hides them, and this repository has already paid for that
lesson four times.
