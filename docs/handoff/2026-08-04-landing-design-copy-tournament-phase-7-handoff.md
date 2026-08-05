# Session handoff — Landing design & copy tournament, Phase 7 complete

**Date:** 2026-08-04
**Branch:** `fix/landing-followups` (HEAD `8c4c0e9`, unchanged)
**Scope:** the marketing landing `/` only — `app/page.tsx`, the `.landing-*` layer of
`app/globals.css`, `components/demo-check-card.tsx`, and `DESIGN.md` (on trial).
**Status:** **Three contenders killed. Three organs extracted and assigned. The research
disclosure ruled on. Synthesis has not begun.**
**Files written this session:** `docs/plans/landing-tournament-phase-7.md` and this handoff.
No code changed. No commits. `npm test` not run.

**This session's output, in full:** `docs/plans/landing-tournament-phase-7.md`
**Prior handoffs** (read only for a fact this one does not carry):
- `docs/handoff/2026-08-04-landing-design-copy-tournament-phase-6-handoff.md` — the 42
  scorecards, the 7×7 matrix, the eight disagreement rulings.
- `…phases-4-5-handoff.md` — the personas, the pin ruling, the live-fact table.
- `…phases-0-3-handoff.md` — the incumbent inventory, the constraint ledger, the Brief.

**The contenders in full:** `docs/plans/landing-tournament-phases-4-5.md`
**Master prompt:** `docs/prompts/2026-08-04-landing-design-and-copy-tournament.md`

---

## 0. Where the tournament stands

| Phase | Sections | State |
|---|---|---|
| 0–3 | 1–6 | Done. |
| 4–5 | 7–8 | Done. |
| 6 | 9–10 | Done. |
| **7** | **11–12** | **Done this session.** `docs/plans/landing-tournament-phase-7.md`. |
| 8 | 13 | Not started. **Next.** |
| 9 | 14 | Not started. |
| 10A/B/C | 15–17 | Not started. |
| — | 18 | Not started. |

---

## 1. Two Phase 6 findings were wrong. Both are corrected and both change Phase 8.

### 1.1 C3 wins under the as-written weights too — the rebalance did not pick the winner

Phase 6 §5.1 said *"Under the as-written weights C3 finishes around fourth… the rebalance
selected a different winner."* Recomputed against Phase 6's own per-dimension means and
independently verified (the method reproduces the reported rebalanced totals to within 0.02,
which is rounding on the means):

| Contender | As-written | Rank | Rebalanced | Rank | Δ |
|---|---|---|---|---|---|
| **C3** | **70.72** | **1** | **71.83** | **1** | — |
| C1 | 68.89 | 2 | 68.00 | 2 | — |
| C2 | 66.93 | 3 | 66.83 | 3 | — |
| C5 | 64.92 | 4 | 62.20 | 5 | −1 |
| C4 | 64.27 | 5 | 61.43 | 6 | −1 |
| C6 | 64.20 | 6 | 65.37 | 4 | **+2** |
| C7 | 58.79 | 7 | 59.00 | 7 | — |

**The owner's rebalance chose which of C5 and C6 died, not who won.** Under the as-written
weights the bottom three would have been C4, **C6** and C7. Two consequences:

- **C3's mandate is broader than Phase 6 thought, not narrower.** The Phase 6 instruction to
  warn Phase 8 off an inflated mandate is discharged in the opposite direction.
- **C5 and C6 were 0.72 points apart before the rebalance** — inside the resolution of the
  scale. That boundary is a decision, not a judgment, which is why C5's organ gets extra care.

### 1.2 The comparative-confidence claim is in all seven contenders, not five

C1 and C6 carry it too. Full inventory in the plan §11.7.2. More importantly it forms an
escalation ladder that Phase 6 missed: the **approved** ledger row says `Most apps…`, and
**four contenders silently escalate `Most` to `Every`** (C1, C4, C6, C7). That is a second
question for Phase 9, separate from the scale question, and unlike the scale question it is a
one-word fix.

---

## 2. What the ranking is actually tracking — the two computations Phase 6 didn't run

**Every page with Emotional fit below 5.0 died. Every page above it lived. Nothing sits in
between.**

`C4 2.83 · C7 3.83 · C5 4.17 —— void 2.83 —— C1 7.00 · C2 7.00 · C3 7.67 · C6 8.83`

That 2.83-point void is the **largest gap in any dimension's distribution on the board**
(next: Honesty, 2.17). Verified against all ten distributions. Emotional fit is the only
dimension that separates the living from the dead cleanly.

**The tournament punished troughs, it did not reward peaks.** There are 13 sub-5 dimension
means on the board. **The three dead pages hold 8 of them; C3 and C2 hold zero between them
and finish 1st and 3rd.** The two highest single-dimension scores in the tournament —
C5's Legibility 9.33 and C4's Honesty 9.17 — both belong to corpses.

---

## 3. The three kills, each with the exact decision that ended it

**These are specialists, not weak pages.** C5 won two dimensions, C4 won three, C7 won one.

| | The exact decision | The dimension it killed |
|---|---|---|
| **C5 — Within Reach** (62.20) | Kept **nine of thirteen** incumbent blocks and bolted a `position: fixed; bottom: 0` bar across 7,900 of 8,600px to make nine blocks reachable. Solved the desert with an element instead of with a page; its own delta table says "unchanged" for radius, shadow and type pairing. | Craft **3.33** (2–4 from all six judges, nobody above 4), Emo 4.17 |
| **C4 — Built for One Number** (61.43) | Dropped `landing-audience-pains` from the page **entirely** — the only contender of seven that does — and put three educational definition rows in the recognition slot. Plus the H1's second sentence, `If yours isn't in it, this isn't for you.` | Emo **2.83** (2–3 from all six judges) |
| **C7 — It Asks First** (59.00) | Deleted the eyebrow on principle, leaving a headline about a competitor's product as the only thing above the fold. Applied the eyebrow-per-section ban to the case `impeccable` explicitly exempts. Secondary: the comparison is entirely below the fold at 375px. | Category **3.00** — the only unanimous score in 420 |

---

## 4. The banned list for the rewritten `DESIGN.md` — seven rules from what the dead share

1. **The winning organ and the killing defect must not be the same object.** In all three
   corpses they are: C5's bar is both Legibility 9.33 and Craft 3.33; C4's boundary
   architecture is both Honesty 9.17 and Emo 2.83; C7's comparison is both Belief 8.00 and
   Category 3.00. **No survivor has this property.** This is the tournament's single most
   useful finding and it is why organ extraction is load-bearing.
2. **A named defect is not a mitigated defect.** All three predicted their killing score in
   writing in part 12 and shipped anyway. C4 wrote *"it knows P6 will score that at a 3."*
   P6 gave it a 2.
3. **No dimension below 5.** A page is scored on its floor, not its peak (§2 above).
4. **Emotional fit below 5 is fatal, independent of everything else.** Honesty and warmth are
   not separable on this page; C4 is the proof.
5. **A diagnostic is not a design brief.** C5 built from a pixel measurement, C4 from the rail
   table, C7 from a portability test. Each passes its own instrument and loses the reader.
6. **A rail passed by deletion is a rail with no subject.** 6/7 wrote "PASS by deletion" on
   rail 7. See §5 for what that produces.
7. **Confirmed anti-patterns, with vote counts:** eight card families (0/7 defend) · three
   planes + hairline (**7/7 collapse it** — Phase 6 §11's "6/7" was wrong) · `Step N` eyebrows
   (7/7 delete) · an eyebrow above every section (7/7 cut to ≤1) · a how-it-works block
   selling typing and talking while `photoInputEnabled()` is false (7/7 retire) · a fixed
   conversion element held across a whole page · deleting the category answer to avoid a
   trope · replacing the recognition moment with definitions.

**Explicitly NOT banned** (Phase 10B will be tempted): three price tiles (4/7 keep them) and
the 24px card radius (no convergence at all — 4 keep 24, and the two movers go to 12 and 0).

---

## 5. Ruling — the research disclosure survives; the proof band does not

6/7 deleted it, only C4 kept it, and Phase 6 handed it forward unruled. **Ruled: the content
survives, the component does not.**

The six deletions are arguments against a four-column stat strip, not against provenance —
and C4 had to neuter the component's left column to keep the content, rendering the literal
string `Sources` *"because a number there would read as Revora's own result."* **A component
whose primary affordance must be disabled for the content to be safe is the wrong
component.** Counting C4's neutering, the vote against the band *as a band* is 7/7.

What ships: **C4's two sentences plus the `Read the sources and the limits` link, as plain
prose** — ~180px instead of ~700px — placed in **C3's block 4, under the `Illustrated
examples.` note.** Not the offer block; provenance inside a pricing section reads as a sales
credential. Block 4 is where the verdict cards render, and C3's own rule is that every claim
attaches to a rendered object.

Binding reasons: Disagreement 6 already ruled that honesty on this board means *presence of
verifiability* and dropped C6 a place for having nothing checkable — that ruling cannot bind
C6 and not the winner. Rail 6 confines the DPP statistic to `/how-it-works`, so these
paragraphs are the landing's only provenance surface. And `55e2ea6` / `6e1980e` just added
machine-readable provenance; removing the human-readable kind in the same quarter is
incoherent.

**Phase 10B owes a rail-7 rewrite.** Its purpose is now discharged *structurally* (no
stat-strip affordance exists to put a number in) rather than by deletion. **Phase 10C owes**
two ledger rows and the deletion of the `.landing-proof-band` selector block.

---

## 6. The three organs, their recipients, and the collision

Spine is **C3**. Each organ is separated from the cost that killed its owner.

| From | The organ | Recipient | Why |
|---|---|---|---|
| **C5** | **The reachability rule without the bar** — no stretch longer than one viewport (667px) may lack a reachable primary action, restated as *one exit per screenful*, plus the pixel-measurement discipline. | **C3, the block 3 → 4 boundary** | Repairs C3's 2,580px desert — the winner's largest unresolved defect, convicted in Disagreement 2. |
| **C4** | **Scope in the headline, without the disqualification.** Take the first sentence and the move; leave `If yours isn't in it, this isn't for you.` | **C3's H1** | C3 scores Cat 6.17 and five of six judges give the same reason: the eyebrow is carrying a 10-weight dimension at 13px. Highest-leverage single graft on the board. |
| **C7** | **The comparison at behaviour level, with the fabricated-output refusal attached as non-severable.** | **C3's block 3** | Belief 8.00 and Craft 8.00. **Grafting the object without the constraint is grafting what rail 2 and `taste-skill` §4.8/§9.E ban.** |

**⚠ C5's and C7's organs collide.** Both land on C3's block 3 and pull opposite ways: C5's
demands an exit within a screenful, C7's adds ~450px to a 1,380px block and pushes the desert
past 3,000px. **Tiebreak ruled so Phase 8 need not relitigate: C5's organ has precedence.**
It repairs a defect the tournament convicted; C7's introduces a claim the tournament has
explicitly not cleared. If both cannot fit, C7's organ goes to the rejected list with that
reason.

**Constraint on the C5 graft:** C2, C3 and C6 all independently refuse a button under the
clarifying-question block, for the same stated reason, and those three post deserts of 2,580
/ 2,140 / 2,120px — a 3/7 shared principle producing the tournament's most common structural
defect. Phase 8 must honour the refusal or overrule it explicitly. One option offered without
prejudice: a text link in the block's caption is an exit and is not "a button under the pause."

**Rider, unconditional, not part of any organ:** C7's `border-top` on the block rather than an
`<hr>` (so the hairline snaps to the device grid at fractional DPR) and the 2px focus offset.
P3 scored the pair a 9 as *"invisible correctness no other contender produced."* C3 needs the
focus offset for its 12px radius anyway.

**What Phase 8 should notice:** all three organs land in C3's first 2,400 pixels. **The spine
does not have room for all three at natural size. The graft is a triage against a pixel
budget.**

---

## 7. Section 12 in one screen — the convergences that were not already recorded

**New 7/7 findings** (Phase 6 §11 had four; these are additional):

- **The clarifying question is promoted to a first-class block by all seven.** The strongest
  convergence in the tournament and it was never written down. It currently ships as ranked
  feature #1 of nine, in a grid, 5,500px down.
- **The oatmeal card leaves the hero.** No contender keeps the incumbent's 15-line demo card
  in the first screen.
- **The single card shadow is untouched by all seven.** The only `DESIGN.md` rule with an
  unqualified unanimous endorsement. Carry C3's sentence with it.
- Also 7/7: the Clear card as the demonstrated proof object · the scope sentence near-verbatim
  · billing as dates and amounts · zero social proof and no DPP statistic · every surviving
  icon sits beside its label.

**5–6/7:** the pains list is right and its container is wrong (6/7 keep the words, 4 of those
change the format) · body type resolves to a single 17px value (5/7) · the nav CTA is never
filled (0/7) · one filled pill restated as per-screenful (5/7).

**3–4/7:** the CTA-under-the-pause refusal and the deserts it produces (see §6) · space
replaces colour as the sectioning instrument (4/7) · the offer block stops being a sales line
(4/7 — and the two keeping `Try it before you pay a cent` were both marked down for it by P6)
· at most one animation, 4/7 ship none, nobody proposed scroll reveals · the FAQ JSON-LD
visible-answer mismatch flagged independently by all three deleters.

**Eleven lone ideas that scored high** are tabulated in the plan §12.5, including two nobody
has flagged before: **C4's `--text-soft` banned by block rather than by review** (the only
structurally-enforced rail in the tournament, costs nothing, one line in Phase 10A) and
**C3's pointer-down 120ms press feedback** (the one motion decision `emil-design-eng` endorses
outright — note its `scale(0.985)` is subtler than the recommended 0.95–0.98 floor).

**One lone idea the room may have rejected wrongly:** P5's visible ranking was scored down as
`impeccable`'s numbered-marker scaffold, but that ban has an explicit carve-out for real
ordered information. **Ruled: the ordering principle survives, the rendered numerals do not.**

---

## 8. Next session prompt — paste this

> Continue the Revora landing design & copy tournament. Read
> `docs/handoff/2026-08-04-landing-design-copy-tournament-phase-7-handoff.md` first, then
> `docs/plans/landing-tournament-phase-7.md` for the kill rulings, the organ assignments and
> the twenty-seven convergences in full. The contenders are in
> `docs/plans/landing-tournament-phases-4-5.md`; the 42 scorecards are in
> `docs/plans/landing-tournament-phase-6.md`. Read a contender's entry only when you need its
> detail for a graft.
>
> **State:** Phases 0–7 are complete. **Do not re-score, do not rebuild the contenders, do not
> re-run the kill round, and do not re-derive the convergences.** C5, C4 and C7 are dead and
> their organs are already extracted and assigned. The research disclosure is already ruled on.
>
> **Do next: Phase 8 — Section 13.** Synthesise ONE winner on the C3 spine. Deliver the full
> 12-part structure at ship quality with a verbatim, paste-ready copy deck. Name every graft
> and what it displaced; name every high-scoring idea deliberately rejected and why (the
> rejected list already contains C5's bar, C4's disqualification sentence, C6's page
> structure, and the ranked-list numerals).
>
> **Six things Phase 8 must handle explicitly, not skip:**
> 1. **C3 wins under both weightings** (handoff §1.1). Phase 6's claim that the rebalance
>    selected the winner is corrected; the rebalance chose which of C5 and C6 died.
> 2. **Resolve the 2,580px desert.** Honour or explicitly overrule the 3/7 refusal to put a
>    button under the clarifying-question block. Do not leave it silently.
> 3. **Move scope into the H1** without breaking C3's deictic pointer — `This is the whole
>    screen.` only works because the thing it points at is genuinely the product.
> 4. **C7's comparison is deferred behind C5's reachability rule** if both cannot fit in
>    block 3. If it does fit, the no-fabricated-competitor-output refusal is non-severable.
> 5. **The sources paragraphs land in C3's block 4**, under the `Illustrated examples.` note.
> 6. **Graft sparingly.** C3 wins on floors, not peaks — it holds zero sub-5 dimension means.
>    All three organs land in its first 2,400px and it does not have room for all three at
>    natural size. This is a triage, not a transplant list.
>
> Invoke and hold these skills before starting: `impeccable`, `iui-ux-pro-max`,
> `taste-skill:taste-skill`, `apple-design`, `emil-design-eng`, `icopywriting`, `icro`.
>
> Rails: light surface only, no dark bands (owner instruction). Every number comes from the
> live fact table in the phase-6 handoff §14. Tier A pins are inviolable; Tier B pins may be
> retired only with a named reason and a scheduled test edit. Do not give the Clear card an
> adjustment. Do not resurrect the two rejected C6 headlines or the DPP statistic. Do not rule
> on the comparative-confidence family — that is Phase 9's. Do not use workflows or dynamic
> subagent orchestration.
>
> **Separately, and before Phase 10:** `npm test` has not been run for four sessions. Last
> green suite is 2,165 passed / 0 failed / 2 skipped at `bf714e9`. Kill any `next dev` first
> (`pkill -9 -f "next-server"`), then run it — Phase 10C's breakage predictions are worthless
> against an unverified baseline. ~26 minutes on an idle machine.

---

## 9. Traps and gotchas — carried forward, plus what Phase 7 added

All twelve from the phase-6 handoff §12 still stand unchanged. In particular: the seven
binding skills · `taste-skill`'s em-dash ban vs the approved CTA's em dash · rail 14 immutable
· do not give the Clear card an adjustment · `Revora_Brand_Positioning_v2.md` is a tombstone ·
the `PRODUCT.md` rejected claim stays rejected · the two rejected C6 headlines stay dead · the
DPP statistic stays off the landing · C7's `You type: oatmeal` must never be an `<input>` ·
contenders are paper · only one `next dev` · `~/.claude/skills/gstack/` does not exist ·
the claims guards are the authority, not caution.

**Added by Phase 7:**

13. **Phase 6's per-dimension means are sound; two of its narrative conclusions were not.**
    The arithmetic in the 7×7 matrix and the winner table reproduces exactly. The as-written
    weights claim (§1.1) and the comparative-confidence inventory (§1.2) did not. Treat other
    unchecked narrative inferences in phase-6.md with the same care.
14. **"PASS by deletion" is not a pass.** Six contenders used it on rail 7. Any future
    self-audit that discharges a rail by removing its subject must say what now serves the
    rail's purpose, or record that nothing does.
15. **C7's comparison organ carries an uncleared compliance question into the winner.** If
    Phase 8 grafts it, Phase 9 inherits a live claim question inside the shipped page rather
    than in a corpse. That is acceptable and it must be flagged in Section 13, not discovered
    in Section 14.
16. **C6 survives on the owner's weights.** It holds four of the five sub-5 dimension means
    among the living and the board's lowest Honesty at 5.33. Treat it as a source of two
    paragraphs, not of structure.

---

## 10. The pin ruling and the live facts — unchanged, still binding

Both carry forward verbatim from the phase-6 handoff, §13 and §14. Nothing in Phase 7 touched
a pin or a live value. The Tier B retirement counts per contender are unchanged; with C4, C5
and C7 dead, the retirement schedule Phase 10C inherits now depends on C3's list (3 pins:
`Two ways in.` / `Three ways in.`, `Dictate it or type it.`, and
`{TASTER_LIMIT} free checks on day one`) plus whatever the Phase 8 grafts change.

---

## 11. Files touched this session

| File | Change |
|---|---|
| `docs/plans/landing-tournament-phase-7.md` | **New.** Sections 11 and 12 in full: two corrections to Phase 6, the Emotional-fit separator and trough analysis, three kills with the deciding decision named, seven banned-list rules, three organs with recipients and a ruled collision tiebreak, the research-disclosure ruling, twenty-seven convergences, eleven lone ideas, and what the incumbent already had right. |
| `docs/handoff/2026-08-04-landing-design-copy-tournament-phase-7-handoff.md` | **New.** This file. |

No code changed. No commits. No `DESIGN.md` edits. `npm test` not run.
