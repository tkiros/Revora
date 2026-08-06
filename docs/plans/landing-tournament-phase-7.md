# Revora Landing Tournament — Phase 7

**Sections 11 and 12 of 18.** Continues `docs/plans/landing-tournament-phase-6.md`.
Phases 0–6 (Sections 1–10) are complete and are not re-derived here.

**Status:** Three contenders killed. Three organs extracted and assigned. The research
disclosure ruled on. **Synthesis (Phase 8) has not begun.**

**Date:** 2026-08-04 · **Branch:** `fix/landing-followups` · **Files changed:** this one and
the handoff. No code touched. `npm test` still not run.

**Two Phase 6 findings are corrected below before the kill round opens.** Both are arithmetic
or inventory errors in a document whose numbers are otherwise sound, and both change what
Phase 8 inherits, so they are stated rather than quietly fixed.

---

# SECTION 11 — The Kill Round

## 11.0 Two corrections, and what the ranking is actually tracking

### Correction 1 — C3 wins under the as-written weights too

Phase 6 §5.1 states: *"Under the as-written weights C3 finishes around fourth. The rebalance
did not tilt a close race; it selected a different winner."* That is wrong. Recomputing every
contender against the as-written weights, using Phase 6's own per-dimension means:

| Contender | As-written | Rank | Rebalanced | Rank | Δ rank |
|---|---|---|---|---|---|
| **C3 — One Card Back** | **70.72** | **1** | **71.83** | **1** | — |
| C1 — The Six-Month Gap | 68.89 | 2 | 68.00 | 2 | — |
| C2 — Is This One Okay? | 66.93 | 3 | 66.83 | 3 | — |
| C5 — Within Reach | 64.92 | 4 | 62.20 | 5 | **−1** |
| C4 — Built for One Number | 64.27 | 5 | 61.43 | 6 | **−1** |
| C6 — Tonight | 64.20 | 6 | 65.37 | 4 | **+2** |
| C7 — It Asks First | 58.79 | 7 | 59.00 | 7 | — |

*(As-written weights: Cat 12 · Belief 14 · Honesty 12 · Voice 10 · Legib 12 · Craft 12 ·
IA 8 · Emo 10 · Impl 6 · Dur 4. Method verified against the rebalanced totals: recomputing
C3 gives 71.85 against the reported 71.83 and C1 gives 67.99 against 68.00 — rounding on the
means, nothing else.)*

**The owner's rebalance did not choose the winner. It chose which of C5 and C6 died.**

C3 leads under both weightings. What the rebalance moved is the margin — C3's lead over C1
widens from 1.83 to 3.83 — and the middle of the table, where C6 climbs two places past C5
and C4. Under the as-written weights the bottom three would have been **C4 (64.27),
C6 (64.20) and C7 (58.79)**, and this section would be killing C6 instead of C5.

Two consequences Phase 8 must carry:

1. **C3's mandate is broader than Phase 6 believed, not narrower.** The instruction to warn
   Phase 8 off "a broader mandate than the numbers support" is discharged in the opposite
   direction: the numbers support C3 under both constitutions. It still wins on one dimension
   (Craft) and is runner-up on two (Honesty, Emotional fit), and it still beats nothing else.
   But it is not a weight artifact.
2. **C5 and C6 were separated by 0.72 points before the rebalance** — inside the resolution
   of a 1–10 scale marked by six people. That boundary is not a real distinction under either
   constitution. **C5 is therefore a corpse of a decision rather than a corpse of a
   judgment**, and its organ gets more care than a normal corpse's. See §11.5.1.

### Correction 2 — the comparative-confidence claim is in all seven contenders, not five

Phase 6 §7 records the claim as present in C2, C3, C4, C5 and C7. It is in C1 and C6 as well.
The full inventory, which is what Phase 9 actually has to rule on, is in §11.7.2. More
usefully, the instances form an **escalation ladder from a hedged quantifier to a universal
one**, which Phase 6 did not surface and which is a one-word fix rather than a structural one.

### What the ranking is actually tracking

Two computations that were not run in Phase 6 and that reframe the whole kill round.

**Every page with an Emotional-fit mean below 5.0 died. Every page above it lived. Nothing
sits in between.**

| C4 | C7 | C5 | — | C1 | C2 | C3 | C6 |
|---|---|---|---|---|---|---|---|
| 2.83 | 3.83 | 4.17 | **void: 2.83 points** | 7.00 | 7.00 | 7.67 | 8.83 |

That 2.83-point void is **the largest gap in any dimension's distribution on the board**
(next largest: Honesty, 2.17, between C6's 5.33 and the pack at 7.50). Emotional fit is the
only one of the ten dimensions that separates the living from the dead cleanly. Part of that
is mechanical — it carries a weight of 14 — but the *void* is not: no contender chose to sit
between 4.17 and 7.00, which means the seven personas did not treat warmth as a dial. They
treated it as a decision that was either taken or refused.

**Second: the tournament punished troughs, it did not reward peaks.** Counting dimension
means below 5.0:

| | C1 | C2 | C3 | C4 | C5 | C6 | C7 |
|---|---|---|---|---|---|---|---|
| sub-5 dimension means | 1 | **0** | **0** | 2 | 2 | 4 | 4 |
| best dimension | 7.83 | 8.83 | 8.67 | **9.17** | **9.33** | 8.83 | 8.00 |

There are thirteen sub-5 dimension means on the board. **The three dead pages hold eight of
them. The winner holds none, and neither does C2 in third.** The two highest single-dimension
scores in the tournament, C5's Legibility 9.33 and C4's Honesty 9.17, both belong to corpses.
C6 is the exception that proves the rule and it survives only on the owner's weights (§11.0,
Correction 1); it holds four of the five sub-5 means among the living.

This is the frame for everything below. **The three contenders being killed are not weak
pages and they are not incomplete pages. They are pages that bought a peak with a floor.**

---

## 11.1 KILL — C5, *Within Reach* · 62.20 · rank 5

**Won:** Legibility & accessibility (9.33, the highest single-dimension mean in the
tournament) and Implementation realism (7.83, tied). **Received one KILL card** (P7,
mandated). **Unanimity against it:** Craft 2–4 from all six judges, nobody above 4.

### The exact decision that ended it

**C5 kept nine of the incumbent's thirteen blocks and then bolted a fixed element to the
bottom of the viewport to make nine blocks reachable.**

The bar is `position: fixed; bottom: 0`, 76px including safe-area inset, present from
y ≈ 900 to the footer — **7,900 of the page's 8,600 pixels**. It is the mechanism that
produces C5's 0px desert, which is the measurement C5 exists to fix, and it is simultaneously:

- the Craft 3.33 — P7's 2, P3's 3, P2's 3, and the only score in 420 where a judge wrote
  that the object was *the most generic thing anyone proposed*;
- the Emotional fit 4.17 — P6: *"Every app that ever took money out of my account did that…
  it is still sitting there while I am reading the paragraph about how to cancel"*;
- the half of the Durability split P7 was right about (Disagreement 5).

The bar is not the mistake. **The mistake is what the bar made unnecessary.** C5 measured the
5,090px desert precisely, correctly identified it as the page's largest defect, and then
solved it with an element instead of with a page. Its own visual-system delta table answers
"unchanged. No delta." for radius, shadow and type pairing. It renamed the `Step N` eyebrows
and kept the section. It is the only contender that increased the page length — 12.9 screens
against the incumbent's 19.4, but longer than every other contender by 2.7 screens.

`emil-design-eng`'s first question is *how often will the user see this animation*. For the
bar's entrance the answer is **once**, which makes it the animation on the board with the
weakest claim to existing — and P3 scored it exactly that way. `apple-design`'s deference
principle and `impeccable`'s spacing-as-sectioning both point at the same conclusion from the
other side: a fixed element asserting itself continuously for 7,900px on a page whose product
promise is calm is the interface refusing to recede.

**Secondary, and the reason the kill is not close:** four card families, an FAQ accordion,
three price tiles, a numbered 1–6 list and eight rendered em dashes. `impeccable` bans
numbered section markers as default scaffolding; `taste-skill` §9.C bans three-column equal
cards; §4.9 bans the long-list-with-hairlines shape. C5 ships all three. Its rebuttal — that
it keeps more content so it keeps more containers — is the argument for the incumbent, made
by the contender that was supposed to replace it.

### What C5 was right about, on the record

The measurement discipline is real and nobody else did it: 48px minimum targets with a 12px
floor between them, tabular numerals on the price column, the bar last in DOM order so tab
reaches the footer first, landscape specified, the observer threshold reasoned. It is the
only contender that scheduled tests for rails it claims to pass. Disagreement 4 already ruled
that its IA 8 from P1 was correct and that its structural contribution was being
triple-counted as a negative. **That contribution is extracted in §11.5.1 and its two tests
survive it (§11.7.4).**

---

## 11.2 KILL — C4, *Built for One Number* · 61.43 · rank 6

**Won three dimensions:** Category clarity (8.67), Honesty & claim safety (9.17, and the only
10 awarded in 420 scores) and Durability (8.00) — 24 points of weight. **Received one KILL
card** (P6, band override). **Unanimity against it:** Emotional fit 2–3 from all six judges.

### The exact decision that ended it

**C4 dropped `landing-audience-pains` from the page entirely and put three educational
definition rows in the recognition slot.**

It is the only contender of seven that does not carry the pains list in any form. Phase 1
found that list to be the best prose in the repository; six contenders keep it, and the four
that reformat it (C2, C3, C6, C7) keep the words and change only the container. C4 replaces
it with `Three labels, and what each one means` — a lede, three label/meaning/never-means
rows, and a closing line about what Revora cannot attach.

That single substitution is the Emotional fit 2.83. P6's card is the evidence and it is worth
quoting because it is the mechanism, not the reaction: *"The first sentence tells me this
might not be for me. The second screen defines three categories I did not ask about. The
third is a list of four things it will not do. I have spent three months being told what
nobody can tell me and being handed ranges I do not understand, and this page is another
appointment."*

**The second decision, and the one that makes it unfixable:** the H1's second sentence.
`Built for one number. If yours isn't in it, this isn't for you.` The first sentence is
C4's organ and it is the best twelve words in the tournament (§11.5.2). The second sentence
is the corpse. C4 knew: its own part 2 records *"it knows P6 will score that at a 3."*
P6 gave it a 2.

There is no smaller fix and C4 says so in part 12: *"you cannot warm up block 1 without
losing the bet."* That is correct, and it is why this is a kill rather than a revision.
`icro` ranks value-proposition clarity as the highest-impact dimension on any marketing
page and C4 wins it outright — but `icro`'s five-second test asks whether a visitor
understands *why they should care*, and C4's first screen answers a different question:
whether they are eligible. Eligibility is not desire.

### What C4 was right about, on the record

The honesty architecture is not a tone, it is a structure, and it is the strongest single
piece of thinking any persona produced. Four items survive it:

- **The `Sources` block**, kept when six contenders cut it. Ruled on separately in §11.6 —
  **it survives C4.**
- **`--text-soft` banned by block rather than by review** in blocks 1, 2, 3 and 5, so rail 8
  is enforced structurally instead of by judgment. Nobody else made a rail structural.
  Carried in §12.5.
- **Scope in the headline** (§11.5.2, the organ).
- **`Revora cannot attach one`** — a constraint stated instead of a behaviour promised. The
  strongest sentence in the tournament for rail 4, and it survives into C6's block 3 already.

---

## 11.3 KILL — C7, *It Asks First* · 59.00 · rank 7

**Won:** Belief shift (8.00, the highest mean on the board) and tied second on Craft (8.00).
**Received one KILL card** (P6, natural band, 52.6 — the lowest card in the tournament).
**Unanimity against it:** Category clarity **3.00 from all six judges, the only unanimous
score in 420.**

### The exact decision that ended it

**C7 deleted the eyebrow on principle, which left a headline about a competitor's product as
the only thing above the fold.**

`Type "oatmeal" into a food app and it will give you a number.` Twelve words, and the only
H1 in the tournament that is incomplete without its sub. A reader who bounces on the headline
alone — which is most of them — learns that some food app somewhere returns a number, and
learns nothing about Revora, the category, or their own A1C. The seven words that would have
fixed it (`A meal checker built only for prediabetes`) were deleted because a tracked
uppercase label above a section is AI grammar.

The reasoning is not wrong. `impeccable`'s absolute bans and `taste-skill` §4.7 both convict
the eyebrow-per-section trope, and C7's zero is the only ratio on the board with no carve-out
to police for rail 10. **But the incumbent renders four eyebrows and every contender cut to
one or zero.** Deleting the fourth eyebrow is the trope. Deleting the first one is deleting
the page's category answer, and `impeccable`'s own rule says *one named kicker as a
deliberate brand system is voice; an eyebrow on every section is AI grammar.* C7 applied the
ban to the case the ban exempts.

**Secondary, and independently disqualifying:** the comparison object is entirely below the
fold at 375px. On the device most of this traffic lands on, the page's one non-portable
object does not exist until the second screen, and above it sits a four-line headline about
somebody else's product. C7 flags the two columns stacking with the Revora column second as
an unresolved conflict and does not resolve it. Three separate 375px failures, one
acknowledged — against `iui-ux-pro-max`'s priority order, where touch and interaction sit
second only to accessibility.

### What C7 was right about, on the record

C7 is the only contender that gave up the stronger version of its own central object to hold
a rail, unprompted, and wrote down what it cost. It would not draw a fake competitor card
with a fake glycemic number in it, and P3 scored that a 9 with the note that it is *the
div-based fake-screenshot ban applied before anyone invoked it, on the one asset where
breaking it would have been most persuasive.* That refusal is a process finding as much as a
page finding and it becomes a `DESIGN.md` rule in §11.4.6.

Three further items survive: the comparison itself (§11.5.3, the organ), the
`border-top`-on-the-block-not-an-`<hr>` detail and the 2px focus offset (§11.5.3, rider), and
`Type "oatmeal" and see.` as a falsifiable dare — which C1 also carries, so it is not solely
C7's, but C7 is the one that made it the close.

---

## 11.4 The traits the dead share — the banned list for the rewritten `DESIGN.md`

Six rules. Each is derived from all three corpses, not from one, and each states its
derivation in a sentence so Phase 10B can carry it verbatim.

### 11.4.1 The winning organ and the killing defect must not be the same object

In every one of the three dead pages, the distinguishing move and the worst score are the
same decision:

| Contender | The organ | The same object, scored as the defect |
|---|---|---|
| C5 | the fixed bar → 0px desert → **Legibility 9.33** | the fixed bar → **Craft 3.33, Emo 4.17** |
| C4 | the boundary as architecture → **Honesty 9.17** | the boundary as architecture → **Voice 4.83, Emo 2.83** |
| C7 | the competitor comparison → **Belief 8.00** | the competitor headline → **Category 3.00** |

None of the four survivors has this property. **A page whose distinguishing move is also its
worst score is unshippable in that form** — the move has to be separated from its cost before
it can be used, which is exactly what §11.5 does. This is the single most useful thing the
tournament produced and it is the reason organ extraction is load-bearing rather than a
courtesy.

### 11.4.2 A named defect is not a mitigated defect

All three dead contenders predicted, in writing, in part 12, the exact score that killed them
— and shipped the defect anyway.

- **C4:** *"it knows P6 will score that at a 3."* P6 gave it a 2.
- **C7:** *"The eyebrow that would have fixed this in seven words was deleted on principle."*
  Six judges gave it a 3, unanimously.
- **C5:** *"It might not, and the failure would be invisible in an A/B test that measures
  clicks rather than the people who closed the tab."* Six judges scored the bar 2–4 on Craft.

Naming a defect is a discipline and all three deserve credit for it. It is not a fix.
**A self-audit that identifies a disqualifying defect and does not change the design has
documented the failure, not addressed it.**

### 11.4.3 No dimension below 5

The dead hold eight of the board's thirteen sub-5 dimension means. C3 and C2 hold zero
between them and finish first and third. **A page is scored on its floor, not its peak** —
and the two highest single-dimension scores in the tournament both belong to corpses.

### 11.4.4 Emotional fit below 5 is fatal, independent of everything else

The only clean separator on the board (§11.0), with the largest distribution void of any
dimension. The most honest page in the tournament, holding the only 10 awarded in 420 scores,
is killed by one number on one dimension. **Honesty and warmth are not separable on this
page**; C4 is the proof and C6's unanimous 8–9 from six judges including P4 is the
counter-proof.

### 11.4.5 A diagnostic is not a design brief

C5 built its page from a pixel measurement, C4 from the fifteen-rail table, C7 from a
portability test. Each page passes its own instrument and loses the reader:

- C5 scores 9.33 on the thing it measured and 3.33 on Craft.
- C4 scores 9.17 on the rails and 2.83 on the reader.
- C7 fails the change-the-logo test better than anything on the board and cannot say what it is.

The four survivors are each built around something the reader does or feels. **A measurement
tells you what is broken; it does not tell you what to build.**

### 11.4.6 A rail passed by deletion is a rail with no subject

Six of seven contenders wrote **"PASS by deletion"** against rail 7. That is a pass in the
same sense that deleting a form passes form validation. See §11.6 for the ruling this
produces, and note the general form: **when a self-audit's status for a rail is "the thing
the rail governs is no longer on the page", the audit has to say what now discharges the
rail's purpose, or record that nothing does.**

### 11.4.7 Anti-patterns confirmed by the corpses (for the banned list, with vote counts)

Convicted, no defenders:

- **Eight landing card families.** 0/7 keep eight; 6/7 go to ≤3.
- **Three light planes + 1px hairline.** **7/7 collapse it** — 4/7 to a single plane, 3/7 to
  two. *(Phase 6 §11 records 6/7; the contested-items table shows all seven. Corrected.)*
- **`Step 1 / Step 2 / Step 3` eyebrows.** 7/7 delete. `impeccable` bans numbered section
  markers as default scaffolding; `taste-skill` §9.F bans generic step labels by name.
- **An eyebrow above every section.** Incumbent renders 4; 7/7 cut to ≤1, 3/7 to zero.
- **A how-it-works section that sells typing and talking as the mechanism** while
  `photoInputEnabled()` is false. 7/7 retire it.
- **A fixed conversion element held across a whole page** (C5, convicted 6/6 on Craft).
- **Deleting the category answer to avoid a trope** (C7, convicted 6/6 on Category).
- **Replacing the recognition moment with definitions** (C4, convicted 6/6 on Emotional fit).

**Not convicted — do not put these on the banned list:** three price tiles (4/7 keep them;
see §12.4) and the 24px card radius (no convergence at all; see §12.4).

---

## 11.5 The three organs, their recipients, and the collision

The spine is C3 (§11.0). Each organ below names what it is, what it cost its owner, how the
graft avoids paying that cost, and where it lands.

### 11.5.1 From C5 — the reachability rule, without the bar

**The organ.** *No stretch of the page longer than one viewport (667px at 375px) may lack a
reachable primary action* — restated from "one filled pill per viewport" to **one exit per
screenful**, plus the measurement discipline that produced it (deserts measured in pixels, at
375px, and reported).

**What it cost C5.** The bar. The rule and the bar are not the same thing: the rule is a
constraint, the bar is one satisfying implementation of it, and it is the implementation six
judges convicted.

**Recipient: C3, the block 3 → block 4 boundary.** This discharges Phase 6's item 3 and
Disagreement 2's ruling. C3's 2,580px desert is the longest on the board, sits immediately
after the block that does the convincing, and its 0.4 observer threshold is the contender
conceding that its centrepiece is taller than the phone. **It is the incumbent's 5,090px
defect reproduced at half scale by choice, on the winning page.**

**The constraint the graft must satisfy.** C2, C3 and C6 all independently refuse to put a
button under the clarifying-question block, and all three give the same reason: the block's
argument is *wait a second before you answer*, and a button under it contradicts the
argument. Those three contenders post the deserts of 2,580px, 2,140px and 2,120px — the
first, third and fourth longest on the board. **The refusal is a 3/7 convergence that
produces the tournament's most common structural defect.** The graft must honour the refusal
or overrule it explicitly.

Phase 8 owns the mechanism. One option that satisfies both, offered without prejudice: an
exit that is not a filled pill — a text link in the block's caption — is not "a button under
the pause" and does not read as *press this instead of thinking*. **Phase 8 must resolve the
desert; it is not free to leave it at 2,580px silently.**

### 11.5.2 From C4 — scope in the headline, without the disqualification

**The organ.** The category and the scope carried by the H1 itself, at headline size, rather
than by a 13px eyebrow or by the sub's second clause.

**What it cost C4.** The second sentence, `If yours isn't in it, this isn't for you.` The
organ is the first sentence and the move; the cost is the disqualification. They are
separable in a way C5's and C7's are not, which makes this the cheapest high-value graft
available.

**Recipient: C3's H1 (block 1).** C3 scores 6.17 on Category clarity against C4's 8.67, and
five of six judges give the same reason in different words: **the eyebrow is carrying the
entire category load at 13px.** P4: *"the eyebrow carries it and the headline does not
help."* P6: *"The small line above the headline is doing all the work and it is very small."*
P1: *"`This is the whole screen.` spends the headline on the object."*

This is not an eyebrow-trope problem — C3 renders one eyebrow across six sections, inside
both `impeccable`'s and `taste-skill`'s ratios. It is a **load** problem: a 10-weight
dimension is resting on the page's only sub-16px element, which is also the one element
exposed to rail 10's carve-out. Moving scope into the headline lets the eyebrow stop being
load-bearing, and it is the single change with the largest expected movement on the winner's
weakest heavy dimension.

**Constraint:** C3's H1 is deictic — `This is the whole screen.` only works because the thing
it points at is genuinely the product, which is C3's whole thesis. A replacement headline
that carries scope must not break the pointer, or the hero card loses its caption.

### 11.5.3 From C7 — the comparison at the level of behaviour, with its refusal attached

**The organ.** A two-column comparison built of type and one rule — *what every other app
does* against *what Revora does* — made entirely at the level of **behaviour**, with **no
invented competitor output**: no fake number, no fake card, no drawn screenshot. Belief
shift 8.00 and Craft 8.00, the two highest scores C7 posted.

**What it cost C7.** The eyebrow and the fold. Neither is intrinsic to the object: the
comparison did not require deleting the category answer, and it did not require sitting
below the fold. C7 chose both.

**The refusal is not severable from the organ.** The comparison is only honest because the
left column contains no fabricated output. Grafting the object without the constraint is
grafting the thing `taste-skill` §4.8 and §9.E ban outright and that rail 2 prohibits.
Phase 8 inherits both or neither.

**Recipient: C3's block 3 (the pause).** C3's block 3 currently makes the same claim in one
caption sentence: `Most apps take the same four letters and return a confident number.`
C7's organ is that sentence rendered as an object.

**⚠ This organ collides with §11.5.1.** Both land on C3's block 3, and they pull in opposite
directions: C5's organ says the block needs an exit within a screenful; C7's organ adds
roughly 450px at 375px to a block that is already 1,380px, pushing the desert past 3,000px.
**The tiebreak, ruled here so Phase 8 does not have to relitigate it: C5's organ has
precedence.** It repairs a defect the tournament already convicted (Disagreement 2, P5's 4
stands). C7's adds a claim the tournament has explicitly *not* cleared (§11.7.2). A graft
that worsens a convicted defect in order to introduce an uncleared claim is the wrong order
of operations. If both cannot fit, C7's organ is deferred to Phase 8's rejected-ideas list
with this reason attached.

**Rider, unconditional and not part of the organ:** `border-top: 1px solid` on the block
rather than an `<hr>`, so the hairline snaps to the device grid at fractional DPR, and a 2px
focus-ring offset. P3 scored this pair a 9 and called it *"exactly the class of invisible
correctness this dimension exists to measure, and no other contender produced one."* C3
independently needs the focus offset for its 12px radius, so half of it is already in the
spine. It carries regardless of what happens to the comparison.

### 11.5.4 What Phase 8 should notice about the three assignments

All three organs land in C3's first 2,400 pixels: two in block 3 and one in the H1. **C3's
spine does not have room for all three at their natural size.** Phase 8's job on the grafts
is a triage against a pixel budget, not a transplant list. Say what was displaced.

---

## 11.6 Ruling — the research disclosure survives; the proof band does not

Phase 6 handed this forward unruled: 6/7 delete `.landing-proof-band`, only C4 keeps it, and
C4's 9.17 honesty score is partly built on keeping it.

**Ruling: the content survives. The component does not.**

**Why the content survives.** Four reasons, in order of force:

1. **Disagreement 6 already settled what this dimension means.** The tournament ruled that
   honesty is *presence of verifiability*, not *absence of falsehood*, and dropped C6 a place
   for having nothing an auditor can check. Deleting the page's only provenance surface is
   the same defect at a larger scale. A ruling cannot bind C6 and not bind the winner.
2. **"PASS by deletion" is not a pass** (§11.4.6). Rail 7 governs what may appear in the
   proof band's left column. Removing the band does not satisfy the rail; it removes the
   rail's subject.
3. **Rail 6 confines the DPP statistic to `/how-it-works`.** With that fence in place, the
   `Sources` paragraphs are the *only* mechanism by which the landing says anything about
   where its meal rules come from. Delete them and the page's answer to *why should I believe
   your reasoning* is nothing at all — on a health surface, for an audience ICP §9 describes
   as having been burned.
4. **The repo has been moving the other way.** `55e2ea6` added landing JSON-LD and `6e1980e`
   added `llms.txt` — machine-readable provenance. Removing the only human-readable
   provenance in the same quarter is incoherent.

**Why the component does not survive.** The six deletions are not arguments against
provenance. They are arguments against a four-column stat strip, which is the shape the
content currently wears, and `impeccable`'s hero-metric-template ban and `taste-skill`
§9.F's scoring-bar ban both convict that shape independently. C4 itself had to neuter the
component to keep the content — its left column renders the literal string `Sources`,
*"because a number there would read as Revora's own result."* **A component whose primary
affordance must be disabled for the content to be safe is the wrong component.** Counting
C4's neutering, the vote against the band as a band is effectively 7/7.

**What ships.** Two sentences plus the `Read the sources and the limits` link, as plain
prose. Roughly 180px instead of ~700px. C4's copy, which already states the do-not-claim
limit in the same paragraph as the claim:

> `Revora's general meal-planning principles map to public-health guidance and cited
> nutrition research — that carbs raise blood sugar, that pairing them with protein, fibre or
> nonstarchy vegetables can slow the rise, and that less-refined carbs generally land more
> gently than highly refined ones.`
>
> `Those sources support narrow educational statements about food. They are not evidence that
> Revora produces a particular health result, and nothing on this page claims otherwise.`

**Placement: C3's block 4, under the `Illustrated examples.` note.** Not the offer block —
provenance inside a pricing section reads as a sales credential. Block 4 is where the three
verdict cards render, and C3's own organising rule is that *every claim is attached to a
rendered object*. The sources paragraph explains what the reasoning behind those cards is
grounded in; it belongs to them.

**Handed to Phase 10B:** rail 7 must be rewritten. Its current form governs a component that
will not exist. Its purpose — no number may appear where it would read as Revora's own
result — is now discharged **structurally**, by there being no stat-strip affordance to put a
number in, rather than by deletion. That distinction is the whole point of §11.4.6 and the
rewritten rule must state it.

**Handed to Phase 10C:** two ledger rows for these paragraphs (nearest existing row is the
incumbent's proof-band copy, which is unledgered), and the `.landing-proof-band` selector
block is deleted from `app/globals.css`.

---

## 11.7 What Phase 8 and Phase 9 inherit directly from Section 11

### 11.7.1 C3's 2,580px desert is the winner's largest unresolved defect

Convicted in Disagreement 2 and now assigned a repair (§11.5.1). **Phase 8 must fix it or
accept it in writing with a reason.** The 0.4 observer threshold is not a mitigation; it is
the admission.

### 11.7.2 The comparative-confidence claim — full inventory, for Phase 9 only

**Not ruled here, as instructed.** Phase 6 recorded five contenders; it is in all seven. The
inventory Phase 9 needs, ordered by how far each escalates the approved ledger row
`Most apps would just pick one and sound confident.`:

| Contender | String | Quantifier | Scale |
|---|---|---|---|
| C2 · block 3 lede | `Most apps pick one and sound confident.` | **Most** (approved) | sentence |
| C5 · block 4 lede | `Most apps pick one and sound confident.` | **Most** (approved) | sentence |
| C3 · block 3 caption | `Most apps take the same four letters and return a confident number.` | **Most** | sentence |
| C1 · block 3 | `Every other food app answers instantly, because answering instantly is what makes an app feel smart.` + `Most apps pick one and sound confident.` | **Every other** | sentence ×2 |
| C6 · block 4 caption | `Every other app you've tried would have taken those four letters and given you a confident number.` | **Every other … you've tried** | sentence |
| C4 · block 4 lede | `Every alternative you have tried would have picked one and sounded certain.` | **Every alternative you have tried** | sentence |
| C7 · block 1 + block 2 | `What every other food app does` (heading) · `Returns an answer immediately. A glycemic number, a score, a colour.` · `The answer is confident. It is confident about a meal it does not have enough information to describe.` · `A confident wrong answer is worse than a question here.` | **every other** | **structural block with a heading** |

**Two questions for Phase 9, not one.** Phase 6 identified the scale question — whether an
approved *sentence* licenses an entire *section* built on the same proposition. There is a
second and sharper one: **four contenders silently escalate the approved row's hedged
quantifier `Most` to a universal `Every`.** A universal claim about the accuracy of unnamed
third parties on a health surface is a materially different exposure from a hedged one, and
unlike the scale question it is a one-word fix. P4's 6 for C7 stands.

### 11.7.3 C6's warmth is grafted; C6's page is not

C6 survives the kill round only because of the owner's weights (§11.0) and holds four of the
five sub-5 dimension means among the living: Category 4.67, IA 4.67, Implementation 3.67 and
Durability 4.83, plus the board's lowest Honesty at 5.33. Phase 8 should treat C6 as a source
of copy, not of structure. The two items already identified — `Blank days are just blank.`
promoted out of grid cell nine, and the cancel paragraph at equal weight to the price ending
`We know why you are reading this paragraph carefully.` — are the highest-scoring single
sentences in the tournament (§12.5). **C6's page is not being grafted. Two of its paragraphs
are.**

### 11.7.4 Already-standing rulings, restated so Phase 10C does not lose them

- **C5's two scheduled tests are adopted regardless of the winner**: a 44/48px target
  assertion and a `prefers-reduced-motion` assertion. Both rails are currently unasserted for
  the whole page. Ruled in the phases-4-5 handoff, confirmed by Disagreement 5, unchanged.
- **C2's one-family type system is extractable independently of C2's fate** (Disagreement 1):
  Plus Jakarta Sans only, body 17px/1.65, removing a `@font-face` and a preload from the
  landing route. C2 is alive and third, so this is not an organ extraction — but the decision
  is separable from C2's empty hero and does not travel with it automatically.

---

# SECTION 12 — Convergence

Every idea that appeared independently in three or more contenders, then every idea exactly
one persona proposed that scored highly with the others. Phase 6 §11 collected the first
pass; this adds to it rather than re-deriving it, and corrects two counts.

## 12.1 Unanimous — 7 of 7, no defenders on the other side

**Already recorded in Phase 6 §11:**

1. `DESIGN.md` rule 7 ("Icons never alone") restated — the file contradicts itself in
   §Progress surfaces.
2. Eight landing card families cut to four or fewer. Nobody defended eight.
3. `Step 1 / Step 2 / Step 3` eyebrows deleted.
4. Tier B pins `Two ways in.` / `Three ways in.` and `Dictate it or type it.` retired.

**New, and not previously recorded:**

5. **The clarifying question is promoted from feature-grid cell #1 to a first-class block.**
   C1 block 3, C2 block 3, C3 block 3, C4 block 4, C5 block 4, C6 block 4, and C7 makes it
   the entire page. **This is the strongest convergence in the tournament and it was never
   written down.** Seven personas with incompatible worldviews independently concluded that
   the single most defensible thing this product owns was ranked feature #1 of nine, inside a
   grid, 5,500px down the page.
6. **The Clear card carrying nothing is the page's central proof object, demonstrated rather
   than asserted.** Every contender's proof strategy names it; four make it the hero visual.
   Nobody asserts F-04 in prose without also showing it.
7. **The oatmeal card leaves the hero.** No contender keeps the incumbent's 15-line demo card
   in the first screen. Four replace it with a Clear card, one with a scope card, one with a
   comparison, one with nothing.
8. **The scope sentence survives near-verbatim**: *"If your A1C sits outside 5.7% to 6.4%, it
   says so plainly and points you to a clinician instead of pretending."* Six carry it in
   body copy; C4 promotes it to the headline.
9. **Billing stated as dates and amounts** — day 5, the exact amount, a one-tap cancel link
   in the email. In all seven proof strategies. `icopywriting`'s risk-reversal rule and the
   Klinio 1.2/5 finding in ICP §9 point at the same conclusion: *"cancel any time"* is what
   the scam apps say, and a date is not.
10. **Zero social proof of any kind**, and the DPP statistic declined. Seven for seven,
    including three personas who wanted the statistic and were denied it by rail 6.
11. **The single card shadow is untouched.** `0 18px 40px rgba(15,23,42,0.08)`. Seven
    contenders changed radius, borders, planes, families and type; not one changed the
    shadow, and C3 says why: *"one shadow across a whole system is the rule most responsible
    for the page not looking assembled."* **This is the only rule in `DESIGN.md` with an
    unqualified unanimous endorsement.** Phase 10B should carry it forward with that
    sentence attached.
12. **Three light planes + a hairline collapse.** 4/7 to one plane, 3/7 to two. *(Phase 6 §11
    records 6/7; the contested-items table in the phases-4-5 plan shows all seven. Corrected.)*
13. **Every icon that survives sits next to its label inside a verdict row.** Decorative icon
    rows and icon-in-circle strips are gone from all seven. This is the empirical backing for
    convergence 1.

## 12.2 Strong — 5 or 6 of 7

14. **The pains list is right and its container is wrong.** 6/7 keep the four pains
    near-verbatim; C4 alone drops them and dies for it (§11.2). Of the six, **four change the
    format**: C2 to four plain paragraphs, C6 dissolved into five, C3 to a plain `<ul>` with
    bold lead-ins and no card, C7 compressed to prose. C6 states the reason best: *"a list of
    four things that are wrong with your life reads as an indictment when it is bulleted and
    as sympathy when it is written out."* The incumbent renders bold lead-ins **plus** bullets
    **plus** a card — three emphasis systems on writing that needed none.
15. **Body type resolves to a single value.** 5/7 set 17px flat, replacing the incumbent's
    16.5–17px range (C2 and C7 at 1.65, C4/C5/C6 at 1.7). Only C1 and C3 leave the range
    alone, and neither defends it. **Nobody argued for two body sizes.**
16. **`A record you can actually show someone` survives** (6/7) and **`Blank days are just
    blank.` survives** (4/7, and both contenders that promote it out of the nine-cell grid
    score 8+ on Emotional fit).
17. **The research disclosure leaves the page as a band.** 6/7 delete it outright, C4 neuters
    its left column. Ruled in §11.6: the content survives, the component does not.
18. **The nav CTA is never filled.** 4/7 remove it entirely, 3/7 keep it ghost and persistent
    at ≥880px. Nobody proposed a filled pill in the nav, and nobody proposed two persistent
    filled actions.
19. **"One filled pill per viewport" is restated as per-screenful.** 5/7. The two exceptions
    (C2, C4) argue per *page* on the grounds of page length, not against the principle.
20. **Live-flag pricing is protected unchanged.** 7/7 keep the mechanism; 5/7 name it in
    their proof strategy as a structural honesty guarantee. C2 changes the presentation from
    tiles to prose and explicitly keeps the render path.

## 12.3 Real — 3 or 4 of 7

21. **Three contenders refuse a CTA under the clarifying-question block, for the same
    reason** — C2, C3, C6 — and they post three of the four longest deserts on the board
    (2,580 / 2,140 / 2,120px). **A shared principle producing a shared defect.** See §11.5.1;
    this is the single most consequential convergence for Phase 8.
22. **Space replaces colour as the sectioning instrument.** C2 `clamp(96px, 14vw, 176px)`,
    C6 `clamp(72px, 10vw, 128px)`, C7 `clamp(72px, 10vw, 120px)`, C3 whitespace with no
    plane change at all. 4/7, and `impeccable`'s spacing-as-sectioning rule and
    `apple-design`'s deference principle both point the same way.
23. **The offer block stops being a sales line.** 4/7 head it with a plain construction —
    `What it costs` (C2, C7), `What it costs, and exactly when` (C4), `What it costs, and how
    you stop` (C6), plus C3's `Ten free checks, then a week, then a decision.` The two that
    keep the incumbent's `Try it before you pay a cent` (C1, C5) were both marked down for it
    by P6 in the same words: *"a sales page and I hear the difference."*
24. **Motion is at most one animation, and 4/7 ship none.** C2, C4, C6, C7 ship nothing but
    press feedback; C1 ships one 6px staggered fade-up, C5 one bar entrance, C3 one 520ms
    pause. **Nobody proposed scroll reveals anywhere.** Against `emil-design-eng`'s frequency
    question — a landing page is seen once — that is the correct answer, and it is worth
    recording as a positive finding rather than an absence.
25. **The FAQ accordion is contested 4–3, and all three deleters hit the same wall.** C2, C6
    and C7 independently keep the `faqs` array for FAQPage JSON-LD while not rendering the
    answers, and all three independently flag it as a schema-honesty risk, not only an SEO
    one. **Three personas arriving at the same unresolved problem is a finding about the
    problem.** Phase 9 should look at it; Phase 10C should note that whichever way this goes,
    the JSON-LD and the rendered page must agree.
26. **`text-wrap: pretty` on prose and `balance` on headings.** 3/7 specify it, 0/7 argue
    against, and it is free.
27. **62ch measure on prose.** 3/7 specify (C2, C5, C6); the incumbent specifies nothing.
    `impeccable` caps at 65–75ch and `iui-ux-pro-max` at 60–75 desktop; 62ch at 17px is
    inside both and the three that chose it all cite the same audience reason.

## 12.4 Where there is **no** convergence — do not invent one

Phase 10B will be tempted to record these as settled. They are not.

- **Card radius.** C1 24 unchanged · C2 24 (one family) · C3 **12** · C4 24 with a 14px split
  · C5 24 unchanged · C6 24 unchanged · C7 **0** except the pill and the verdict cards. Four
  keep 24, and the two that move go in opposite directions. The winner is one of the movers,
  so Phase 8 inherits a change with no mandate behind it.
- **Three price tiles.** 4/7 keep tiles (C1, C3, C4, C5), 2/7 go to prose (C2, C6), 1/7 to
  rule-separated rows (C7). `impeccable` bans identical card grids and `taste-skill` §9.C
  bans three-column equal cards; the tournament did not convict them. **Contested, not
  banned.**
- **The second typeface.** 2/7 kill it (C2, C7, by different routes), 5/7 keep it. C3's
  defence is specific and is the winner's: the pairing is display-vs-text and it does real
  work inside the card, where the verdict is Jakarta 700 and the reason is Source Sans 3 400.
  Against that, C2's version is the only performance win any contender delivered.
  **Unresolved, and it is a real trade rather than a tie.**
- **The single eyebrow.** 4/7 keep one, 3/7 keep none. §11.5.2 changes the terms of this
  argument — if scope moves into the headline the eyebrow stops being load-bearing, and the
  question becomes cheap rather than structural.

## 12.5 Lone ideas that scored high

Ideas exactly one persona proposed, with the score the other six gave them.

| # | Idea | Author | How it scored with the others |
|---|---|---|---|
| 1 | **Every card rendered in the live `.result-card` classes, so the landing structurally cannot show what the product would not do** | P3 (C3) | Honesty **8.67**, second on the board, and the reason four of six judges gave C3 STRONG. P4: a disclaimer rendered by the component cannot drift out of sync with the product. **This is the spine.** |
| 2 | **Scope carried by the headline rather than the eyebrow** | P4 (C4) | Category clarity **8.67**, highest on the board, with 9s from P1, P2, P3 and P5. P7, who credits nothing: *"it shrinks the market, which is rare and which I will credit."* **Organ, §11.5.2.** |
| 3 | **The `Sources` block kept, with the do-not-claim limit in the same paragraph as the claim** | P4 (C4) | Honesty **9.17** and the only 10 in 420 scores. Six contenders cut it. **Ruled surviving, §11.6.** |
| 4 | **The comparison held at behaviour level with no invented competitor output** | P7 (C7) | Belief shift **8.00** (highest mean on the board) and Craft **8.00**. P3 scored the refusal a 9. **Organ, §11.5.3, with an open claim question attached.** |
| 5 | **The cancel paragraph at equal weight to the price, ending `We know why you are reading this paragraph carefully.`** | P6 (C6) | Emotional fit **8.83**, unanimous 8–9 from six judges including P4, which scored the same page a 3 on honesty in the same card. P1: *"the single best sentence any contender wrote."* |
| 6 | **Two scheduled tests for rails currently held up by prose** (44/48px targets, `prefers-reduced-motion`) | P5 (C5) | P4 gave Honesty 8 explicitly for it; P3 gave Legibility 10 partly for it; P1 and P4 both gave Durability 7. **The only contender that adds tests instead of editing them. Already adopted.** |
| 7 | **One family at 17px/1.65, removing a `@font-face` and a preload from the route** | P2 (C2) | Legibility **8.83** and P5's note that it is the only performance win any contender delivered. Disagreement 1 ruled it extractable regardless of C2's fate. |
| 8 | **`--text-soft` banned by block rather than by review**, in every block carrying health-scope information | P4 (C4) | Never scored explicitly, because it is invisible when it works. It is the only place in the tournament where a rail is enforced structurally rather than by judgment, it costs nothing, and it is a one-line addition to Phase 10A's spec. **The quiet one.** |
| 9 | **`.landing .result-disclaimer { font-size: 16px }`** — one declaration lifting the app's 14px card fineprint to the landing's 16px floor | P3 (C3) | P4 gave Legibility 7 specifically for it: *"the right instinct correctly executed."* Also the one declaration sitting closest to the 2026-07-29 override-block incident; it must be named in the plan, not discovered in review. |
| 10 | **`border-top` on the block rather than an `<hr>`**, so the hairline snaps to the device grid at fractional DPR | P7 (C7) | Craft **9** from P3, who called it the class of invisible correctness the dimension exists to measure and noted no other contender produced one. **Rider, §11.5.3, carries unconditionally.** |
| 11 | **Press feedback on pointer-*down* at 120ms with `scale(0.985)`**, rather than 150ms on release | P3 (C3) | Not separately scored, but it is the one motion decision on the board that `emil-design-eng` endorses outright: feedback on press, inside the 100–160ms band. Note for Phase 10A — the recommended scale floor is 0.95–0.98, and 0.985 is subtler than the floor. Phase 8 may want 0.98. |

**One lone idea the room rejected, possibly on the wrong grounds.** P5's **visible ranking**
(C5 block 6, six items numbered 1–6, the ranking rendered rather than left in a code comment)
was scored down by P2 as *"a feature grid with numbers on it"* and counted against C5's Craft
by P3 and P7 as `impeccable`'s numbered-marker scaffold. But `impeccable`'s ban has an
explicit carve-out: *numbers earn their place when the section actually IS a sequence and the
order carries information the reader needs.* A ranking by usefulness is ordered information,
and P5's argument — *a ranking the reader can see is itself a credibility signal, because it
means somebody decided* — is not answered by the ban. **The tournament's ruling: the ordering
principle survives, the rendered numerals do not.** Whatever list Phase 8 ships is ordered
deliberately and the order is defensible; it does not need `1.` `2.` `3.` in front of it to
prove that.

## 12.6 What the incumbent already had right

Owed formally in Section 18, collected here while the evidence is fresh. All of it is
convergence 12.1 and 12.2 read from the other side.

- **The pains list.** The best prose in the repository. Six contenders keep it and the one
  that dropped it is dead. Nobody improved a sentence of it.
- **The single card shadow.** The only `DESIGN.md` rule with an unqualified 7/7 endorsement.
- **Pricing rendered from the flags checkout enforces.** Structurally unable to lie. Every
  contender protects it; five name it as proof.
- **`When we're unsure, we say so.`** Kept verbatim by five contenders and used as a block
  thesis by two.
- **The eyebrow's seven words.** `A meal checker built only for prediabetes` answers *what is
  this* before the headline, which almost nothing in this category does. The contender that
  deleted it on principle finished last with a unanimous 3.
- **Rendering real result-card markup rather than a screenshot.** Already true in the
  incumbent, already genuine craft, and the winning contender's entire contribution is
  noticing it and making it the organising principle instead of a detail inside one component.
- **`promise-registry.test.ts` pinning the demo to the real precheck output.** The reason
  C3's central claim is honest rather than aspirational.
- **`Illustrated examples` labelling.** Unglamorous, unpinned by any test, and correct.
- **No testimonials, no ratings, no user counts, no fake screenshots, on a landing page, in
  2026.** P7, whose job is to find the generic: *"That is a real and unusual discipline and it
  is the reason C7's comparison could be built honestly at all."*

---

# Where this stops

Sections 11 and 12 are complete. **Three contenders killed with the exact decision that ended
each, seven banned-list rules derived from what they share, three organs extracted and
assigned with a ruled tiebreak, the research disclosure ruled on, twenty-seven convergences
recorded and eleven lone ideas carried forward.**

**Checkpoint before synthesis, as instructed. Phase 8 (Section 13) has not begun.**

**Six items Phase 8 inherits directly:**

1. **The spine is C3, and it wins under both weightings** (§11.0). The rebalance chose which
   of C5 and C6 died, not who won.
2. **The 2,580px desert must be resolved**, honouring or explicitly overruling the 3/7
   refusal to put a button under the clarifying-question block (§11.5.1, §12.3 item 21).
3. **Scope moves into the H1** without breaking C3's deictic pointer (§11.5.2).
4. **C7's comparison is deferred behind C5's reachability rule** if both cannot fit, with the
   fabricated-output refusal non-severable if it does (§11.5.3).
5. **The sources paragraphs land in block 4** under the `Illustrated examples.` note (§11.6).
6. **Do not force diversity.** C3 dominates on floors rather than peaks; graft sparingly, and
   name every high-scoring idea deliberately rejected — the ranked-list numerals, C5's bar,
   C4's disqualification sentence and C6's page structure are all already on that list.

**Two items Phase 9 inherits:**

- **The comparative-confidence family, with two questions rather than one** (§11.7.2): the
  scale question Phase 6 identified, and the `Most` → `Every` quantifier escalation it did
  not.
- **The FAQ JSON-LD / visible-answer mismatch**, flagged independently by three contenders
  (§12.3 item 25).

**Still not done:** `npm test` has not been run for four sessions. Last recorded green suite
is 2,165 passed / 0 failed / 2 skipped at `bf714e9`. Phase 10C's breakage predictions are
worth nothing against an unverified baseline, and the run takes ~26 minutes on an idle
machine with no `next dev` running.
