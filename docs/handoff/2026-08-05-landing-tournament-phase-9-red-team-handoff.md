> ## ⛔ SUPERSEDED — 2026-08-05
> **Read `docs/handoff/2026-08-05-landing-tournament-phases-0-9-consolidated-handoff.md` instead.**
> It carries everything below plus the full Phases 0–8 state. This file predates the eleventh fix
> (P7-6, the broken-grammar offer claim). Kept for the record only.

# SESSION HANDOFF — Revora landing tournament, Phase 9 (the red-team) complete

**Date:** 2026-08-05 · **Branch:** `fix/landing-followups` (HEAD `8c4c0e9`, unchanged)
**This session:** Phase 9 / Section 14 — P7, P4 and P6 run against the Phase 8 copy deck.
**Status:** **9 of 10 phases done. 14 of 18 sections written. Phase 10A is next.**
**Code changed: none. Commits: none. `npm test`: not run for five sessions.**

---

## 0. Read order

| Read | File | Why |
|---|---|---|
| **1st** | this file | State of play |
| **2nd** | `docs/plans/landing-tournament-phase-9.md` | **The red-team in full.** Supersedes Phase 8 and the master handoff wherever they disagree |
| 3rd | `docs/plans/landing-tournament-phase-8.md` | The winner. Still the spec; Phase 9 amends ten things in it |
| as needed | `docs/handoff/2026-08-05-landing-tournament-master-handoff.md` | Brief, constraint ledger, live fact table, pin ruling, traps |

**Do not** re-score, rebuild contenders, re-run the kill round, re-open the settled
no-convergence items, or re-synthesise the winner. **Phase 9 changed nothing structural.**

---

## 1. The three premises Phase 9 falsified

The tournament ran on paper (trap 11); Phase 8 checked four files; Phase 9 checked seven more.

1. **`Most apps would just pick one and sound confident.` was never an approved ledger row.**
   `grep -c "Most apps" docs/safety/copy-ledger.md` → `0`. It is unledgered shipped source at
   `app/page.tsx:523-524`. Phases 6, 7 and 8 all cite it as approved; §11.7.2's seven-instance
   escalation ladder has **no bottom rung**.
2. **`copy-ledger.md` has two genres of row and the tournament treated them as one.** `result-*`
   rows are verbatim and test-pinned. `landing-*` rows record a section's *intent*:
   `landing-hero-moment` describes a hero (`"Dinner is on the table…"`) that `git log -S` shows
   never existed in `app/page.tsx`, written in the same commit (`5cdb5d9`) that shipped the hero
   it supposedly covers. "Walk every string against the ledger" is not executable for the landing
   as the ledger is written.
3. **Nothing connects the ledger to the source, in either direction.**
   `scripts/validate-safety-contract.mjs` is nine checks over 490 lines and **reads no `.tsx`
   file**. The only source-scanning fence, `claims-boundary-copy.test.ts`, checks banned families,
   not ledger membership. That is how (1) survived four phases: nothing could go red.

---

## 2. The ruling — comparative confidence, both questions

**Unavailable at any scale.** Not because the scale question was answered, but because
`docs/safety/claims-boundary.md` defines **nine** allowed claim classes and **every one is about
Revora**. There is no class a statement about another company's product can be filed under, and
`validate-safety-contract --claims-boundary` rejects a row whose class does not resolve. The
sentence is neither approved nor banned; it is **outside the schema**. Creating a class is a
counsel decision, not a copy decision.

`Most` → `Every` is separately out on `FTC-HEALTH-COMPLIANCE` substantiation grounds, independent
of the ledger question.

**Winner's cost: one caption**, exactly as Phase 8 predicted.
`Most apps take the same four letters and return a confident number.` →
**`Without that one question, Revora would have been guessing.`**
No third party · fileable under `product-role` · grounded in the approved
`prompt-conservative-floor-snippet` · nine words · P6 independently flagged the old line as the
one place the page *manages* the reader, so compliance and emotional read converge on one string.

**Repository cost, outside tournament scope and flagged to counsel:** `app/page.tsx:523-524` ships
the same family today. The winner deletes the block it lives in, so shipping the winner
incidentally fixes it — **and not shipping the winner leaves it in place.** Do not let a redesign
silently discharge it.

---

## 3. The ten fixes

| # | Where | Change |
|---|---|---|
| 1 | Block 3 caption | → `Without that one question, Revora would have been guessing.` |
| 2 | Block 6 | Delete the H2 + sub (the page's most generic block); move the FAQ **above** the final CTA |
| 3 | Block 2 scope note | Delete `Not a general nutrition app, not a calorie counter, not built for everyone.` |
| 4 | Block 4 lede | Add `The first card is the one from the top of this page, next to the two you have not seen.` |
| 5 | Hero sub | 40 words → 33; drop the duplicated latency claim |
| 6 | FAQ, both branches | Strip two uncounted em dashes |
| 7 | Legacy tile + legacy FAQ | `5` → `{FREE_DAILY_CHECKS}` / `${FREE_DAILY_CHECKS}` |
| 8 | Hero card label | Render from `demoExampleEyebrow(null)`, not hand-typed prose |
| 9 | Pin ledger | Tier A **10** pins; Tier B **4** retirements |
| 10 | Shape rule | Restate to the full documented scale; name the 22px-in-24px violation |

**Why each fix exists, one line:**

- **1** — the family has no claim class (P4-1) **and** the old line tells the reader the moral of a
  scene they just watched (P6-3). Two personas, one string.
- **2** — block 6 restates the hero and proves nothing, **and** it puts two filled pills 250px
  apart, breaking the winner's own restated "one filled pill per screenful." The reachability rule
  (≤1,460px) and the pill rule (≥667px) collide at the page's foot and nobody noticed.
- **3** — the deleted sentence is listed **in the Brief's own objection table** under *"What only
  sounds like it does."* The hero already answered objection 1 by showing one card.
- **4** — the hero card and block 4's card 1 are **byte-identical** (`result-safe-example`, same
  meal). Block 4's H2 is `The same card, three times.` The lede converts the duplicate into
  evidence for free; a fourth meal fixture would cost two ledger rows.
- **5** — 40 words is **2× `taste-skill` §4.7's hard 20-word ceiling**, and at 375px it is 5–6
  lines, not the 4 the winner's fold story assumes. The caption's first line lands at y ≈ 705,
  below the fold — so Phase 8's "deleting the eyebrow pulls the caption to the fold" is probably
  false as specified. 33 words fixes it; `the plate in front of you` is preserved (see §4).
- **6** — the winner's headline metric "4 strings, 5 characters, all unstrippable" is wrong: the
  FAQ answers carry two more, neither pinned, and the winner already stripped a third from the
  adjacent answer — so it is an oversight, not a policy. After the fix the metric is **true**.
- **7** — `copy-pins.test.ts:105` requires `{FREE_DAILY_CHECKS}` interpolated; the copy deck types
  `5`. The Tier A list never named this constant, in any phase.
- **8** — the hero's `An illustrated example` is character-for-character
  `demoExampleEyebrow(null)`. This is **exactly the hazard Phase 8's Finding 5 caught in block 3
  and then reproduced in block 1.** Makes the `<ExampleResultCard>` recommendation load-bearing.
- **9** — see §5.
- **10** — see §6.

---

## 4. The two P6 constraints Phase 10A must not trade away

1. **`the plate in front of you` is load-bearing.** The H1 `A meal checker built only for
   prediabetes.` reads *categorised*, not *recognised* — `only` is C4's move, and C4 died at Emo
   2.83. What rescues it is the second-person present-tense object in the next line. Any pixel
   optimisation that cuts those five words makes the fold colder and the H1 cannot absorb it.
   **The H1 stands, conditionally, and the condition is now written down.**
2. **The block-2 sandwich does not hold on mobile.** §13.6 item 2, answered: the top slice (hero
   card) is off-screen before block 2's H2, and the bottom slice (block 3's demo) is ~1,400px —
   two full screens — below. The sandwich exists in the section map, not in the viewport. Fix 3
   takes the fixable half; the rest is **an unfixable trade-off**, because the only remedy is a
   rendered card inside block 2 and that breaks the spine.

---

## 5. Pin ledger, corrected

**Tier A — ten pins.** The nine from Phase 8, plus:
> **10.** `FREE_DAILY_CHECKS` interpolated, never retyped, in **both** the legacy pricing tile and
> the legacy FAQ answer (`copy-pins.test.ts:97-113` asserts both).

**Tier B — four retirements**, each with reason + scheduled test edit. The three from Phase 8, plus:
> **4.** `A 90-day journey, recapped weekly` — the feature grid is deleted and the winner states
> the weekly recap once, unconditionally. `learningJourneyUiEnabled()` is FALSE.
> → `landing-wiring-pins.test.ts`, `journey-flag branches` describe block. **Its flag-on test
> asserts `toContain("A 90-day journey…")` and `not.toContain("A weekly recap in sentences")` —
> the winner fails both.** Phase 8 did not list it.
> **Move the branch assertion to whichever surface still renders it** — deleting the copy *and*
> its test would discharge the flag's coverage by deletion (§10.3 banned-list rule 6).

**New ledger rows required: two, not four.** Phase 8 listed four; P4-2's walk found every card
body on the page is already-approved verbatim `result-*` copy. Remaining: the hero card caption,
and the block-3 caption + dare link. (The two sources paragraphs still need their own row.)

---

## 6. Phase 8's Finding 2 is a misreading — and the real defect is sharper

Finding 2 says *"`DESIGN.md` §App-UI guardrails bans nested cards."* It does not:

```
DESIGN.md:96  Radius scale: 24px cards (surface-card) · 18px inputs ·
              14px nested cards · 999px buttons/pills/chips. Pick from the scale, never invent.
DESIGN.md:216 Uses --surface-muted inset (14px radius, nested-card scale) inside the …
```

`DESIGN.md` **gives nested cards a radius and uses it.** Line 357 bans *card mosaics* on content
pages, a different rule. `impeccable` bans nested cards; `DESIGN.md` does not.

The real defect is the **shape**: `DemoCheckCard` renders `.result-card` at **22px** inside
`.surface-card` at **24px**, where the documented nested scale is **14px**. A 2px delta is the
worst available answer — too different to read as one surface, too similar to read as two.

**Two consequences:**
- **The winner's shape rule is incomplete and contradicts the documented one.** §13.4's
  *"Outer surfaces 24px. Result cards 22px. The CTA pill 999px."* omits 18px inputs and 14px
  nested cards, and the 22px-in-24px case **is** the documented nested case at the wrong value.
- **§13.6 item 4 is withdrawn.** Phase 10B's obligation is not "do not restate a nested-card ban"
  (there is none) — it is to **reconcile the documented radius scale with `DemoCheckCard`**, in one
  direction or the other.

---

## 7. The two inherited items, discharged

- **Comparative-confidence family** — ruled. §2 above.
- **FAQ JSON-LD mismatch** — **confirmed absent, and Phase 8's reason is wrong.** Placement is
  irrelevant: `app/page.tsx:104` declares `faqs` once and **both** consumers map the same array
  (visible `<details>` at :857, `mainEntity` at :161). The mismatch is impossible by construction,
  **in the incumbent, today**. The three contenders flagged a defect they would have *introduced*.
  This is why fix 2's FAQ move is free — Phase 8's stated reason would have made it look risky.
  **Phase 10C: pin the shared-array invariant. It is currently guaranteed by a code comment.**

---

## 8. What Phase 10 owes, updated

Everything in the Phase 8 handoff §10 stands, plus:

**10A** — corrected shape rule · hero sub at 33 words **with a required browser measurement of line
count and fold position at 375px** (this is the first place C5's measurement discipline has to be
spent) · hero card label from `demoExampleEyebrow` · the Finding 4 source-order comment **on the
rule itself**, not only in the spec.

**10B** — **new rail 16:** *every user-facing sentence must be fileable under a claim class in
`claims-boundary.md`; a sentence that is neither approved nor banned is not therefore permitted.*
· §13.6 item 4 replaced per §6 above · **add to the §10.3 banned list:** *a ledger row that records
a section's intent is not a pin — the two genres must not be cited interchangeably.*

**10C** — four Tier B retirements, with the journey-branch coverage **moved, not deleted** · two
new ledger rows, not four · **pin the `faqs` shared-consumer invariant** · **route
`app/page.tsx:523-524` to counsel independently of ship/no-ship** · standing: C5's two tests, the
card-recipe-override guard, un-nest or re-radius `DemoCheckCard`.

**Section 18 — decision memo**, three additions:
- *Not obvious:* a four-phase escalation ladder was built on a ledger row that does not exist, and
  **no test in the repository could have caught it**, because nothing connects the ledger to the
  source in either direction.
- *What the incumbent had right:* the `faqs` shared array (schema honesty by construction, which
  three contenders independently failed to notice they were breaking), and that every card body on
  the winner is already-approved copy.
- *Biggest shipping risk:* unchanged in kind, sharper in form — the page's central claim is *the
  landing shows the product's card, unmodified*, it has no test, **and the product's card already
  violates the product's own radius scale**, so "unmodified" currently means "inheriting a
  documented inconsistency."

---

## 9. P7's top Product Hunt comment — the one that should shape Phase 10

> "Three example cards is not a demo. I can read that you ask a clarifying question; I cannot see
> it happen to my food. $12.99/mo after ten checks is a lot of trust to extend to a page where
> every card is labelled 'illustrated example'."

Correct and currently unanswerable — four of five cards are fixtures. The only real answer already
on the page is block 3's dare link, `Type "oatmeal" and see what it asks you.`, and it is a text
link in the one block with no pill. **Phase 10C should instrument it separately as the page's most
important non-primary CTA**: if it converts, the fixture objection is answered by the product
rather than by more copy.

---

## 10. Traps

All sixteen from the master handoff §11 stand. Sharpened or changed by this session:

- **Trap 9 is resolved, not open.** The comparative-confidence family is ruled. Do not reopen it;
  do cite the *reason* (no claim class), not the vote.
- **Trap 15 gains a fourth class of caution:** Phase 6 got two narrative conclusions wrong; Phase 8
  found five code discrepancies; **Phase 9 found three false premises in the governance documents
  themselves.** Assume the safety docs are as unverified as the code was.
- **Trap 14 is now precise.** "The claims guards are the authority" is true of
  `claims-boundary-copy.test.ts` (banned families, source-scanning). It is **not** true of the
  ledger, which no source check reads. "It passes the guards" ≠ "it is ledgered" ≠ "it is
  fileable." Three different fences.
- Trap 2 (`taste-skill` bans em dashes; the approved CTA has one) unchanged — but the winner's
  count was wrong and is now corrected to a true 4.

---

## 11. Next session prompt — paste this

> Continue the Revora landing design & copy tournament. Read
> `docs/handoff/2026-08-05-landing-tournament-phase-9-red-team-handoff.md` first, then
> **`docs/plans/landing-tournament-phase-9.md` in full — it is the red-team and it supersedes
> Phase 8 and the master handoff wherever they disagree.** Then read
> `docs/plans/landing-tournament-phase-8.md` (the winner, still the spec, amended in ten places by
> Phase 9) and `docs/handoff/2026-08-05-landing-tournament-master-handoff.md` for the Brief, the
> constraint ledger and the live fact table.
>
> **State:** Phases 0–9 are complete. The winner is `W — One Card Back` and it survived the
> red-team: nothing structural changed. Ten fixes applied in place, four trade-offs recorded.
> The comparative-confidence family is **ruled unavailable at any scale** — `claims-boundary.md`
> has no claim class for a statement about a third party. **Do not re-score, do not rebuild the
> contenders, do not re-run the kill round, do not re-open the settled no-convergence items, do
> not re-synthesise the winner, and do not reopen the comparative-confidence ruling.**
>
> **Do next: Phase 10A — Section 15, `docs/plans/landing-tournament-winner-spec.md`.**
> Build-ready, no vague phrases: say `padding: clamp(72px, 10vw, 128px)`, say `17px / 1.65`, name
> the token. Must include: the H1 clamp `clamp(1.9rem, 5.6vw, 2.9rem)` · body `17px / 1.65` ·
> measure `62ch` · press `translateY(1px) scale(0.98)` at 120ms `cubic-bezier(0.23, 1, 0.32, 1)`
> on pointer-down · the 2px focus offset · `--text-soft` banned by block in 1/2/3/5 ·
> `text-wrap: balance` on h1–h3 and `pretty` on prose · **the corrected full shape rule** (24px
> surfaces / 18px inputs / 14px nested / 22px result cards / 999px pills, the landing chooses none)
> · **the Finding 4 source-order comment written on the `.landing .result-disclaimer` rule itself**
> · **the hero card's label sourced from `demoExampleEyebrow(null)`, not prose** · **the hero sub
> at 33 words with a required 375px browser measurement of line count and fold position** — that
> is C5's measurement discipline and this is the first place it has to be spent.
>
> Invoke and hold before starting: `impeccable`, `iui-ux-pro-max`, `taste-skill:taste-skill`,
> `apple-design`, `emil-design-eng`, `icopywriting`, `icro`.
>
> Rails: light surface only, no dark bands. Every number from the live fact table (master handoff
> §4.3). **Tier A is ten pins now, Tier B is four retirements** — see the Phase 9 handoff §5. Do
> not give the Clear card an adjustment. Do not resurrect the two rejected C6 headlines or the DPP
> statistic. Do not use workflows or dynamic subagent orchestration. Do not treat "the guards pass"
> as claim clearance — there are three separate fences and only one of them reads source.
>
> Stop after Section 15 and checkpoint.
>
> **Separately, and it now blocks more than it did:** `npm test` has not been run for five
> sessions. Last green suite is 2,165 passed / 0 failed / 2 skipped at `bf714e9`. Phase 10C must
> predict four Tier B test edits and a fourth broken test (`landing-wiring-pins.test.ts`'s
> journey-flag-on case), and those predictions are worthless against an unverified baseline.
> `pkill -9 -f "next-server"` first, then `npm test` — ~26 minutes on an idle machine.

---

**Session ends here.** No code changed. No commits. No `DESIGN.md` edits. `npm test` not run.
Files written: `docs/plans/landing-tournament-phase-9.md` (new), this handoff (new), and the
master handoff's status block, phase table and document index (edited).
