# Session handoff — Landing design & copy tournament, Phase 6 complete

**Date:** 2026-08-04
**Branch:** `fix/landing-followups` (HEAD `8c4c0e9`, unchanged)
**Scope:** the marketing landing `/` only — `app/page.tsx`, the `.landing-*` layer of
`app/globals.css`, `components/demo-check-card.tsx`, and `DESIGN.md` (on trial).
**Status:** **Seven contenders scored. Winner identified on the numbers. Nothing killed yet.**
**Files written this session:** `docs/plans/landing-tournament-phase-6.md` and this handoff.
No code changed. No commits. `npm test` not run.

**This session's output, in full:** `docs/plans/landing-tournament-phase-6.md`
**Prior handoffs** (read only if you need a fact this one does not carry):
- `docs/handoff/2026-08-04-landing-design-copy-tournament-phases-4-5-handoff.md` — the seven
  personas, the seven contenders, the two-tier pin ruling, the live-fact table.
- `docs/handoff/2026-08-04-landing-design-copy-tournament-phases-0-3-handoff.md` — the
  incumbent inventory, the constraint ledger, the Brief.

**The contenders in full:** `docs/plans/landing-tournament-phases-4-5.md`
**Master prompt:** `docs/prompts/2026-08-04-landing-design-and-copy-tournament.md`

---

## 0. Where the tournament stands

Ten phases, eighteen output sections.

| Phase | Sections | State |
|---|---|---|
| 0–3 | 1–6 | Done. `…phases-0-3-handoff.md`. |
| 4–5 | 7–8 | Done. `docs/plans/landing-tournament-phases-4-5.md`. |
| **6** | **9–10** | **Done this session.** `docs/plans/landing-tournament-phase-6.md`. |
| 7 | 11–12 | Not started. **Next.** |
| 8 | 13 | Not started. |
| 9 | 14 | Not started. |
| 10A/B/C | 15–17 | Not started. |
| — | 18 | Not started. |

**Required tables now delivered:** Teardown Table · `DESIGN.md` Verdict Table · Contender
Summary Table · **full 7×7 cross-scoring matrix · per-dimension winner table (10 rows) ·
ranked scoreboard.** Nothing further is owed in table form until Phase 7's kill round.

---

## 1. Repo state — read this first

Nothing modified except the two markdown files named above. **`npm test` was not run this
session, and has not been run for three sessions.** The last recorded green full suite is
**2,165 passed / 0 failed / 2 skipped at `bf714e9`**.

This is now the **oldest open item on the board** and it blocks Phase 10C, which has to
predict which tests break and why. A prediction written against an unverified baseline is
noise. Run it before Phase 10 starts, ideally before Phase 8:

```
pkill -9 -f "next-server"   # concurrent dev servers cause false createTestDb 120s timeouts
npm test                    # ~26 minutes, needs an IDLE machine
```

Before Phase 10B rewrites `DESIGN.md`, keep the current version reachable:

```
git show HEAD:DESIGN.md > /tmp/design-before.md
```

---

## 2. The one decision the owner made this session

**The scoring weights were put to the owner before any card was written, and the owner chose
the `Craft 16 + Emotional fit 14` rebalance over the weights as written.** That is the
tournament's constitution from here on and it is not reopened.

| # | Dimension | Weight | Δ from as-written |
|---|---|---|---|
| D1 | Category clarity | 10 | −2 |
| D2 | Belief shift | 12 | −2 |
| D3 | Honesty & claim safety | 12 | — |
| D4 | Voice fidelity | 10 | — |
| D5 | Legibility & accessibility | 10 | −2 |
| D6 | **Craft & non-genericness** | **16** | **+4** |
| D7 | Information architecture | 8 | — |
| D8 | **Emotional fit** | **14** | **+4** |
| D9 | Implementation realism | 6 | — |
| D10 | Durability | 2 | −2 |

Scale 1–10 per dimension. Weighted total = Σ(score × weight) ÷ 10, so a flat-7 page scores
70.0. Verdict bands: STRONG ≥ 71.0 · CONDITIONAL 62.0–70.9 · WEAK 55.0–61.9 · KILL < 55.0.

**Method:** 7 personas × 6 contenders, no self-scoring, 42 cards, 420 dimension scores, one
concrete one-line justification each. All seven binding skills (`impeccable`,
`iui-ux-pro-max`, `taste-skill`, `apple-design`, `emil-design-eng`, `icopywriting`, `icro`)
were loaded and held before the first card. **All arithmetic was independently recomputed
and verified** — 42 card totals, 7 contender means, 7 judge means, 70 per-dimension means,
10 dimension winners, and an exhaustive 3+ gap scan that found exactly the eight
disagreements surfaced, no more and no fewer.

---

## 3. The full 7×7 matrix

Weighted totals, 0–100. Diagonal blank.

| Judge ↓ / Contender → | C1 | C2 | C3 | C4 | C5 | C6 | C7 | judge mean |
|---|---|---|---|---|---|---|---|---|
| **P1** Conversion Surgeon | — | 69.4 | 71.0 | 67.2 | 69.4 | 66.2 | 61.2 | 67.40 |
| **P2** Restraint Architect | 69.4 | — | **77.6** | 61.4 | 61.0 | 69.6 | 61.0 | 66.67 |
| **P3** Design Engineer | 68.6 | 65.6 | — | 60.6 | 62.0 | 67.2 | 63.8 | 64.63 |
| **P4** Clinical Trust Officer | 68.4 | 65.0 | 73.2 | — | 63.8 | 59.6 | 57.4 | 64.57 |
| **P5** Legibility Realist | 71.2 | 70.4 | 69.2 | 63.2 | — | 66.2 | 58.0 | 66.37 |
| **P6** Anxious Patient | 69.6 | 70.2 | 71.8 | 55.8 | 62.2 | — | **52.6** | 63.70 |
| **P7** Adversarial Killer | 60.8 | 60.4 | 68.2 | 60.4 | 54.8 | 63.4 | — | 61.33 |
| **contender mean** | **68.00** | **66.83** | **71.83** | **61.43** | **62.20** | **65.37** | **59.00** | |

Highest card: **P2 → C3, 77.6.** Lowest: **P6 → C7, 52.6.** Only 5 of 42 cards cleared
STRONG and four of the five are C3. No judge mean sits more than 6.1 points from any other,
so the spread between contenders is signal, not an artifact of who scored whom.

**Three KILL cards were recorded:**
- **P7 → C5 (54.8)** — P7's mandated kill. "The only contender that took thirteen generic
  blocks, kept nine of them, and called the result a redesign."
- **P6 → C4 (55.8)** — band says WEAK, judge overrode. "A page that fails at the fold fails
  completely and silently, and the metric that would catch it does not exist."
- **P6 → C7 (52.6)** — natural band.

---

## 4. Ranked scoreboard and per-dimension winners

| Rank | Contender | Mean | Dimensions won | STRONG | KILL |
|---|---|---|---|---|---|
| **1** | **C3 — One Card Back** | **71.83** | 1 · Craft (w16) | 4 of 6 | 0 |
| 2 | C1 — The Six-Month Gap | 68.00 | 2 · IA, Impl½ | 1 of 6 | 0 |
| 3 | C2 — Is This One Okay? | 66.83 | 0 | 0 of 6 | 0 |
| 4 | C6 — Tonight | 65.37 | 2 · Voice, Emotional fit (w14) | 0 of 6 | 0 |
| 5 | C5 — Within Reach | 62.20 | 2 · Legibility, Impl½ | 0 of 6 | 1 |
| 6 | C4 — Built for One Number | 61.43 | 3 · Category, Honesty, Durability | 0 of 6 | 1 |
| 7 | C7 — It Asks First | 59.00 | 1 · Belief shift (w12) | 0 of 6 | 1 |

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

Exactly **one 10** was awarded in 420 scores: P1 → C4, Honesty.

---

## 5. The four findings that are not obvious from the ranking

**5.1 The winner leads exactly one dimension, and wins because of the weight on it.**
C3 tops only Craft (8.33 × 16). It is runner-up in Honesty (8.67 to C4's 9.17) and runner-up
in Emotional fit (7.67 to C6's 8.83), and beats nothing else. **Under the as-written weights
C3 finishes around fourth.** The rebalance did not tilt a close race; it selected a different
winner. Phase 7 must state this plainly rather than letting Phase 8 imply a broader mandate
than the numbers support.

**5.2 C4 wins three dimensions and finishes sixth.** Category clarity, Honesty and
Durability — 24 points of weight — all go to C4, and it loses because it scores **2.83 on a
14-weight dimension**, with six independent judges landing on 2 or 3. The most honest page in
the tournament is sunk by one number. This is the clearest evidence produced that honesty and
warmth are being treated as separable on this page, and they are not.

**5.3 C6 wins both dimensions the owner just made heavier and still finishes fourth.**
Voice (10) and Emotional fit (14) both go to C6 — 24 points of weight — and it lands 4th
because Category clarity 4.67, IA 4.67 and Implementation realism 3.67 are the three lowest
scores any contender posted outside C7's headline. The rebalance moved C6 from near-last to
fourth, not to first. **Craft 6.33 is the number that stopped it**, and that is a finding
about C6, not about the weights: a page that wins on warmth still has to be built.

**5.4 C7 posts the highest Belief-shift mean on the board and finishes last** — 8.00 Belief,
8.00 Craft, and **3.00 on Category clarity from six judges who never conferred.** It is the
only unanimous score in 420. Its author predicted it in the contender's own part 12.

---

## 6. The eight 3+ point disagreements and their rulings

Each ruling names which judge is right *about the thing that dimension measures*, which is
not the same as which judge is right about the page. Full argument in
`docs/plans/landing-tournament-phase-6.md` §Section 10.

| # | Contender · Dimension | Split | Ruling |
|---|---|---|---|
| 1 | **C2 · Craft** | P5 **7** vs P3 **4** | **P3 right on the page, P5 found something P3 missed.** They score different objects: P5 scores the *type system* (one family, 17/1.65, a `@font-face` and preload removed — the only perf win any contender delivered), P3 scores the *page*, where `taste-skill` §4.8 holds that a pure-text hero is incomplete work. Honest number 5–6. **Carry the type decision forward as an extractable organ regardless of C2's fate** — it is separable from the empty hero. |
| 2 | **C3 · Legibility** | P2 **7** vs P5 **4** | **P5 right. This is the winner's largest unresolved defect.** 2,580px with no exit, immediately after the block that convinces. The 0.4 observer threshold is the contender admitting its centrepiece is taller than the phone — the incumbent's 5,090px defect reproduced at half scale by choice. **Phase 8 must fix it or accept it explicitly.** |
| 3 | **C4 · Voice** | P1 **6** vs P6 **3** | **P1 right on the dimension; P6 right about the page and scoring the wrong box.** Voice fidelity measures register consistency and C4 is perfectly consistent — coherent in a register P6 finds intolerable. Honest number 5. P6's finding already lives in Emotional fit at 2, where the heavy weight is; double-counting inflates a defect already fully priced. |
| 4 | **C5 · IA** | P1 **8** vs P2/P3/P7 **5** | **P1 right.** IA measures order and reachability; C5's order is correct and it has the only 0px desert on the board. What P2/P3/P7 object to is *quantity and genericness*, which already has a home in Craft where all three scored C5 2–4. **C5's structural contribution is being triple-counted as a negative; the 0px-desert organ should not be discarded with the page.** |
| 5 | **C5 · Durability** | P1/P4 **7** vs P7 **4** | **Both right, measuring opposite halves.** The **two scheduled tests** (44/48px targets, `prefers-reduced-motion`) are the most durable artifact any contender produced. The **sticky bar** has a visible expiry and P7 is right about it. Weight 2, so it changes nothing in the ranking — surfaced because it identifies the one thing that must survive C5's likely elimination. |
| 6 | **C6 · Honesty** | four judges **6** vs P4 **3** | **P4 right.** The four measure absence of falsehood; P4 measures presence of verifiability, and the rails (6, 7, `study-association`) govern what a claim is *grounded in*, not merely whether it is false. **This is the number that dropped C6 from third to fourth.** Two carry-forwards: C6 never demonstrates `Hold off` (a permission-first page declining to show where permission is withheld), and ten new ledger rows of *voice* copy is a materially different exposure from C4's seven rows of *scope* copy, because scope copy derives from approved sources and voice copy does not. |
| 7 | **C6 · IA** | P2 **6** vs P1 **3** | **P1 right.** Coherence is not the test, reachability is — the same test P2 applies when scoring C5's nine blocks down. Note the symmetry with #4: P1 and P2 are each self-consistent and mutually contradictory, so this is a genuine methodological split about what IA measures. **The tournament resolves it in favour of reachability in both directions: C5's 8 stands and C6's 3 stands.** |
| 8 | **C7 · Honesty** | P3 **9** vs P4 **6** | **Both right, and this is the most consequential unresolved item in Phase 6.** See §7 below — it does not fit in a table row. |

---

## 7. The comparative-confidence problem — the item Phase 9 must rule on

Disagreement 8 opened something larger than C7.

**P3's position:** refusing to draw the competitor's output is the div-based fake-screenshot
ban applied before anyone invoked it, on the one asset where breaking it would have been most
persuasive. C7 gave up the stronger version of its own central object, unprompted, to hold
rail 2.

**P4's position:** an entire block headed `What every other food app does`, asserting that
competitors return confident answers they cannot support, is a **comparative accuracy claim
about unnamed third parties, on a health surface, with no evidence behind it.** It clears
`claims-boundary-copy.test.ts` because that suite checks *disease-outcome* claims. Counsel is
a different fence and this has not been past it.

**The strings needing a decision before this ships — in C7 or in any graft of C7's organ:**

- `What every other food app does` (block heading)
- `Returns an answer immediately. A glycemic number, a score, a colour.`
- `The answer is confident. It is confident about a meal it does not have enough information to describe.`
- `A confident wrong answer is worse than a question here.`
- **`Every alternative you have tried would have picked one and sounded certain.`** — this one
  is **C4's**, in its block-4 lede. The contender that scored 9.17 on honesty. Nobody noticed
  until this ruling.

**The finding:** the comparative-confidence claim is not a C7 problem. It appears in some form
in **C2, C3, C4, C5 and C7**, all descended from the incumbent's already-approved ledger line
`Most apps would just pick one and sound confident.` The open question is whether an approved
*sentence* licenses an entire *section* built on the same proposition. **P4's 6 stands for C7
specifically**, because C7 is the only contender that scales the claim from a sentence to a
structural block with a heading; the others keep it at sentence scale and inside the approved
row's shadow.

---

## 8. What the judges did NOT disagree about

Five unanimities, worth more than the disagreements because nobody coordinated.

1. **C7 · Category clarity · 3, from all six judges.** The only unanimous score in 420.
   Phase 7 does not need to re-argue this.
2. **C4 · Emotional fit · 2–3, from all six judges.** Six worldviews, one number.
3. **C6 · Emotional fit · 8–9, from all six judges** — including P4, which scored the same
   page a 3 on honesty in the same card and gave it a 9 here anyway. C6's warmth is not a
   matter of taste, and it is not enough on its own.
4. **C5 · Craft · 2–4, nobody above 4** — including P1, which otherwise gave C5 its
   second-highest total. The contender that measured the incumbent most precisely is the one
   the room agreed changed it least.
5. **C1 produced zero disagreements of 3+ points across all ten dimensions** — the only
   contender that did. Seven incompatible worldviews converged: correct ordering (IA 7.67,
   highest on the board), cheap to build (Impl 7.83, tied highest), nothing decided visually
   (Craft 4.50, second-lowest). **It finishes second by being the page nobody objects to and
   nobody argues for.**

---

## 9. What Phase 7 inherits directly

1. **The bottom three by weighted mean are C5 (62.20), C4 (61.43) and C7 (59.00)** — and all
   three won at least one dimension. C4 won three. Killing them is not killing weak pages, it
   is killing **specialists**, which makes the organ extraction in Section 11 the most
   load-bearing part of Phase 7 rather than a courtesy.
2. **C3 wins on one dimension carried by a weight the owner set.** Say so in Section 11.
3. **C3's 2,580px desert is the winner's largest unresolved defect.** Phase 8 fixes it or
   accepts it explicitly.
4. **The comparative-confidence claim is not confined to C7** (§7) and needs a ruling that
   covers C4's block-4 lede before Phase 9 walks the rails.
5. **C5's two scheduled tests survive C5.** Already ruled in the phases-4-5 handoff and
   independently confirmed by Disagreement 5. Phase 10C adopts both regardless of the winner.
6. **Candidate organs already identified** (Phase 7 will name recipients formally):
   C2's one-family/17px-1.65 type system with the `@font-face` and preload removed ·
   C5's 0px-desert reachability principle and its two tests · C4's `Sources` block and the
   scope-in-the-headline move · C7's behaviour-level comparison held without fabricated
   competitor output · C6's `Blank days are just blank.` promotion and the cancel paragraph.

---

## 10. What remains — Phases 7 to 10

| Phase | Section | Work |
|---|---|---|
| **7** | **11–12** | Rank (done — §4 above). **Kill the bottom three** with the exact structural or copy decision that ended each, not "it was weaker". Name the failure traits the dead share — these become the banned list in the rewritten `DESIGN.md`. Extract **one organ** from each corpse and name its recipient (§9.6 is the shortlist). Then Section 12: every idea that appeared independently in **3+ contenders** (much of it already collected in the phases-4-5 handoff §5) and every idea exactly one persona proposed that scored highly with the others. |
| **8** | **13** | Synthesise ONE winner. Pick a spine — **the numbers say C3, and say why it won** — name every graft and what it displaced, name every high-scoring idea deliberately rejected and why. Deliver in the full 12-part structure at ship quality with a verbatim, paste-ready copy deck. Do not force diversity: if C3 dominates, graft sparingly. **Must resolve the 2,580px desert.** |
| **9** | **14** | Red-team. P7: what is the most generic thing that survived, what is the weakest section, what would the top Product Hunt comment be. P4: walk all 15 rails line by line against the final copy deck, check every claim against `evidence-pack.md` and **every string against `copy-ledger.md`**, and **rule on the comparative-confidence family (§7)**. P6: where do I feel judged, where do I feel managed, where do I stop reading, do I feel better or worse than when I arrived. Fix in place, show the fixes, record unfixable findings as trade-offs. |
| **10A** | **15** | `docs/plans/landing-tournament-winner-spec.md` — build-ready. Ban vague phrases: say `padding: clamp(52px, 7vw, 104px)`, say `17px / 1.65`, name the token. |
| **10B** | **16** | Rewrite `DESIGN.md` carrying the Phase 3 verdicts **and the contested-item votes** (phases-4-5 handoff §5). Every surviving rule states its derivation in one sentence. Scar tissue names its test file instead of retelling its incident. Phase 7.3 anti-patterns become an explicit banned list. Must be **shorter and more load-bearing** than 361 lines; report before/after and what was cut. Still a design SYSTEM — app shell, tokens, motion, icons, voice carry forward, re-derived. |
| **10C** | **17** | `docs/plans/landing-tournament-implementation-plan.md` — section-by-section diff against `app/page.tsx` with line ranges, `.landing-*` CSS changes, which tests break and why, which strings need `copy-ledger.md` rows, ordered smallest-shippable-first work items each independently revertible, and what must NOT change plus the test that catches it. **Adopt C5's two missing-test items (44/48px targets, reduced-motion) regardless of who wins.** |
| — | **18** | Decision memo. Winner + the one sentence why · what the tournament proved that was NOT obvious (§5 is the raw material) · what the current page already had right, specifically and generously · the three highest-leverage changes by impact-per-hour · what in `DESIGN.md` was scar tissue and never should have been a design rule · the single biggest shipping risk · what only real visitors can settle, being honest about which disagreements are genuinely empirical. |

---

## 11. The convergence already settled — do not re-derive

From the phases-4-5 handoff §5, unchanged and now backed by scores:

- **7/7** want `DESIGN.md` rule 7 ("Icons never alone") restated — the file already
  contradicts it in §Progress surfaces.
- **7/7** cut the eight landing card families to four or fewer. **Nobody defended eight.**
- **6/7** collapse the three-plane + hairline system to one or two planes. **Nobody defended
  three-planes-plus-hairline as shipped.**
- **7/7** delete the `Step 1 / Step 2 / Step 3` eyebrows.
- **7/7** retire the Tier B pins `Two ways in.` / `Three ways in.` and `Dictate it or type
  it.` With `photoInputEnabled()` false that section sells typing and talking as the
  mechanism; nobody defended it.
- **5/7** move "one filled pill" from per-viewport to per-screenful.
- **6/7** delete the research disclosure (`.landing-proof-band`); only C4 keeps it. Phase 7
  still owes an explicit ruling — it is the largest single evidential exposure on the board,
  and C4's 9.17 honesty score is partly built on keeping it.
- **2/7** kill the second typeface (C2, C7, by different routes). Scoring added a new fact:
  C2's type system is the only performance win any contender delivered (§6 Disagreement 1).

---

## 12. Traps and gotchas

Carried forward, plus what Phase 6 added.

1. **Skills bind the personas.** Invoke and hold before Phase 7: `impeccable`,
   `iui-ux-pro-max`, `taste-skill:taste-skill`, `apple-design`, `emil-design-eng`,
   `icopywriting`, `icro`. A contender that violates the standard of the skill it is built on
   is scored down by every judge including itself. This held in Phase 6 and produced real
   findings (C2 vs `taste-skill` §4.8; C5's animation vs `emil-design-eng`'s frequency test).
2. **`taste-skill` bans em dashes outright; Revora's approved CTA contains one**
   (`Check your first meal — free`). The em dash stays because it is approved ledger copy.
   Incumbent renders 42; contenders capped themselves between 2 and 8. Do not silently strip
   them — that breaks `copy-pins` and the approved CTA.
3. **Rail 14 (light surface, no dark bands) is immutable this round.** Owner instruction
   2026-07-27. No contender argued against it.
4. **Do not "fix" the Clear card** by giving it an adjustment. `assertNoUnsafeSafeFields`
   throws on it in the engine. All seven contenders demonstrate the absence rather than
   asserting it; three make it the hero.
5. **`Revora_Brand_Positioning_v2.md` is a tombstone** and `docs/archive/` is not an approved
   source. `docs/product-marketing.md` is the only active positioning source.
6. **The rejected claim in `PRODUCT.md` §Rejected claims must never be resurrected** — it sits
   deliberately outside the audit fence, recorded as Rejected in ledger row
   `onboarding-reversal-line`, pending counsel Q8.
7. **The two rejected C6 headlines must not be resurrected.** `You can probably eat it.`
   (implies a safety finding — rail 1, `claims-boundary.md` §Verdict Semantics) and
   `Most meals come back Clear.` (unverifiable output-distribution claim — rail 2). They are
   the most natural permission-first headlines in the brief and both are out of bounds.
8. **The DPP statistic stays off the landing.** Rail 6 and `claims-boundary-copy.test.ts`
   family `study-association` confine it to `/how-it-works`. Three personas wanted it; all
   seven were denied it.
9. **NEW — the comparative-confidence family (§7) is an open compliance question, not a
   settled one.** Do not treat "the guards pass" as clearance.
10. **NEW — C7's `You type: oatmeal` line must not be an `<input>`.** It looks like one.
    Rail 15 plus the fake-screenshot ban: static text, non-focusable, no caret. This survives
    even if C7 dies, because its comparison is a candidate organ.
11. **Contenders are paper, not code**, by the prompt's scope choice. If live variants are ever
    wanted, ship each as a route under `/lab/v1..v7` in a git worktree and score screenshots.
    Much slower, much more honest.
12. **Only ever run one `next dev`.** Multiple servers over one `.next` cause `ChunkLoadError`
    reload loops. `pkill -9 -f "next-server"; rm -rf .next; npm run dev`.
13. **`~/.claude/skills/gstack/` does not exist on this machine.** All gstack helper commands
    silently no-op. Use Playwright from the repo's own `node_modules`.
14. **The claims guards are the authority, not caution.** The 2026-07-28 rebuild's bolder copy
    tripped zero guards. `claims-boundary-copy.test.ts` bans *disease-outcome claims*, not
    vivid writing about the reader's problem. Run `npx vitest run tests/unit/revora/` (~80s)
    before assuming any copy is a compliance problem.

---

## 13. The pin ruling — unchanged, still binding

**Tier A — semantic pins. Inviolable. Breaking one forfeits.**
`TASTER_LIMIT` interpolated never retyped · `{monthlyPrice}` from `resolvePriceVariant()`
with no literal `$9.99|$12.99|$19.99` in source · `paywallMode() === "trial"` with **both**
branches present · `RISK_LABELS` interpolated · `<DemoCheckCard />` rendered and the three
interaction strings never retyped · `reading.className` on the landing root · no `.landing*`
selector declaring `font-size` twice · banned source phrases stay banned · trial mode never
renders a daily free-check claim and legacy mode must.

**Tier B — string pins. Changeable only by naming the pin, giving the reason, and scheduling
the test edit in the same work item.** Silent drops forfeit.

**Tier B retirements by contender**, which Phase 10C inherits directly:

| Contender | Tier B pins retired |
|---|---|
| C4, C5 | **2** — `Two ways in.` / `Three ways in.`, `Dictate it or type it.` |
| C1, C3 | 3 |
| C7 | 4 — including `It asks before it guesses`, retired as a literal string while being promoted to the page's entire architecture |
| C6 | 5 |
| C2 | **6** — the most; `copy-pins.test.ts` and `landing-wiring-pins.test.ts` both need edits |

**Ledger debt by contender:** C6 ~10 new rows (voice) · C4 7 (scope) · C7 8 · C2 2 ·
C1/C3/C5 0–2. Phase 6 added the finding that voice rows and scope rows are different audit
exposures (§6 Disagreement 6).

---

## 14. Live facts — do not re-derive, do not retype

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

Incumbent baseline: 13 blocks, 12,942px, 19.4 screens at 667px, 7 CTAs, **5,090px CTA
desert**, 42 rendered em dashes.

---

## 15. Next session prompt — paste this

> Continue the Revora landing design & copy tournament. Read
> `docs/handoff/2026-08-04-landing-design-copy-tournament-phase-6-handoff.md` first, then
> `docs/plans/landing-tournament-phase-6.md` for the 42 scorecards in full. The contenders
> themselves are in `docs/plans/landing-tournament-phases-4-5.md` — read a contender's entry
> only when you need its detail for a kill or a graft. The two earlier handoffs
> (`…phases-4-5…`, `…phases-0-3…`) carry the personas, the pin ruling, the incumbent
> inventory and the Brief; read them only for a fact the phase-6 handoff does not already
> carry.
>
> **State:** Phases 0–6 are complete. The weights are settled (owner chose `Craft 16 +
> Emotional fit 14`; do not reopen). The 7×7 matrix, the per-dimension winner table and the
> ranked scoreboard are all computed and independently verified. **Do not re-score, do not
> rebuild the contenders, do not re-derive Phases 0–5, and do not re-read the whole
> codebase.**
>
> **The ranking:** C3 71.83 · C1 68.00 · C2 66.83 · C6 65.37 · C5 62.20 · C4 61.43 ·
> C7 59.00.
>
> **Do next, in order: Phase 7 — Section 11**, then **Section 12**.
> Section 11: kill the bottom three (C5, C4, C7) with the exact structural or copy decision
> that ended each — not "it was weaker" — noting that all three won at least one dimension
> and C4 won three, so these are specialists being killed, not weak pages. Name the failure
> traits the dead share; these become the banned list in the rewritten `DESIGN.md`. Extract
> **one organ** from each corpse and name its recipient (§9.6 of the handoff is the
> shortlist). Section 12: every idea that appeared independently in 3+ contenders — much of
> it is already collected in the phase-6 handoff §11, so add to it rather than re-deriving
> it — and every idea exactly one persona proposed that scored highly with the others.
> **Stop after Section 12 and checkpoint before synthesis.**
>
> **Four things Phase 7 must handle explicitly, not skip:**
> 1. C3 wins on one dimension carried by a weight the owner set. Say so; do not let Phase 8
>    inherit a broader mandate than the numbers support.
> 2. C3's 2,580px CTA desert is the winner's largest unresolved defect. Flag it forward.
> 3. Rule on whether the research disclosure (`.landing-proof-band`) survives. 6/7 cut it;
>    only C4 kept it, and C4's 9.17 honesty score is partly built on keeping it.
> 4. The comparative-confidence claim is not confined to C7 — it is in C4's block-4 lede too.
>    Note it forward to Phase 9; do not rule on it yourself.
>
> Invoke and hold these skills before starting: `impeccable`, `iui-ux-pro-max`,
> `taste-skill:taste-skill`, `apple-design`, `emil-design-eng`, `icopywriting`, `icro`.
>
> Rails: light surface only, no dark bands (owner instruction). Every number comes from the
> live fact table in the handoff. Tier A pins are inviolable; Tier B pins may be retired only
> with a named reason and a scheduled test edit. Do not give the Clear card an adjustment. Do
> not resurrect the two rejected C6 headlines or the DPP statistic. Do not use workflows or
> dynamic subagent orchestration.
>
> **Separately, and before Phase 10:** `npm test` has not been run for three sessions. Last
> green suite is 2,165 passed / 0 failed / 2 skipped at `bf714e9`. Kill any `next dev` first,
> then run it — Phase 10C's breakage predictions are worthless against an unverified baseline.

---

## 16. Files touched this session

| File | Change |
|---|---|
| `docs/plans/landing-tournament-phase-6.md` | **New.** Sections 9 and 10 in full: the weights decision, 42 cross-scorecards with 420 justified dimension scores, the 7×7 matrix, the per-dimension winner table, the ranked scoreboard, the eight disagreement rulings, and the five unanimities. |
| `docs/handoff/2026-08-04-landing-design-copy-tournament-phase-6-handoff.md` | **New.** This file. |

No code changed. No commits. No `DESIGN.md` edits. `npm test` not run.
