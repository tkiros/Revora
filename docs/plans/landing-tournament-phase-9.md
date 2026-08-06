# Revora Landing Tournament — Phase 9

**Section 14 of 18. The red-team.** Continues `docs/plans/landing-tournament-phase-8.md`.
Phases 0–8 (Sections 1–13) are complete and are not re-derived, re-scored, or re-litigated here.

**Status:** P7, P4 and P6 run against the Phase 8 copy deck. **Fifteen findings, eleven fixed in
place, four recorded as trade-offs.** The comparative-confidence family is **ruled on**, and the
ruling is not the one the ladder in §11.7.2 was built to produce. Both inherited items are
discharged, one of them for a different reason than Phase 8 gave.

**Date:** 2026-08-05 · **Branch:** `fix/landing-followups` · **Files changed:** this one and the
handoff. No code touched. `npm test` still not run.

> **Where this and Phase 8 disagree, this document wins**, on the same basis Phase 8 won over the
> master handoff: it was checked against the repository. Phase 8 read four files. This section
> read seven more — `docs/safety/copy-ledger.md`, `docs/safety/claims-boundary.md`,
> `docs/safety/evidence-pack.md`, `scripts/validate-safety-contract.mjs`,
> `tests/unit/revora/copy-pins.test.ts`, `tests/unit/revora/landing-wiring-pins.test.ts`, and
> `app/page.tsx` in the regions the winner keeps.

---

## 14.0 The headline: three assumptions the tournament ran on for four phases are false

Before the persona passes, three load-bearing premises have to be corrected. Each was asserted in
Phase 6, repeated in Phase 7, and inherited unexamined by Phase 8.

### A. `Most apps would just pick one and sound confident.` is not an approved ledger row

Phase 6 §"the open question" calls it *"a ledger row that has passed the audit."* Phase 7 §11.7.2
builds a seven-instance escalation ladder on *"the **approved** ledger row."* Phase 8 §13.2 takes
*"the most conservative rung on the ladder … the approved ledger row `Most apps would just pick
one and sound confident.` at its own quantifier and its own scale."*

```
$ grep -c "Most apps" docs/safety/copy-ledger.md
0
$ grep -rn "Most apps" app/ components/
app/page.tsx:523:                sweetened, because the honest answer depends on it. Most apps
app/page.tsx:524:                would just pick one and sound confident.
```

It is **unledgered shipped source**. It has never been through the claims audit as a string.
There is no approved rung on the ladder, so "the most conservative rung available" is not
available. See §14.2 finding P4-1 for the ruling this forces.

### B. The `landing-*` ledger rows are section-intent records, not string pins — by design, from birth

The winner's Phase 9 mandate is to walk *"every string against `copy-ledger.md`."* For the landing
that instruction cannot be executed as written, because landing rows do not hold the strings.

`landing-hero-moment`'s Copy column reads *"Dinner is on the table. One calm answer in about ten
seconds…"*. The hero that shipped in the **same commit that wrote the row** (`5cdb5d9`) reads
*"A meal checker built only for prediabetes / Stop guessing at dinner. / You got an A1C between
5.7% and 6.4%…"*. Not one sentence matches. This is not drift: `git log -S` shows the ledgered
string never existed in `app/page.tsx`. The row records what the hero is *for*; the Notes column
says so explicitly (*"Names the audience and the decision moment"*).

The `result-*` rows are the opposite — verbatim, and `tests/unit/components/disclaimer-line.test.ts`
pins `result-footer` character-for-character.

**So the ledger has two genres of row and the tournament treated them as one.** What P4 can
actually verify is stated in §14.2 finding P4-2, and the answer is better than Phase 8 feared.

### C. Nothing connects the ledger to the source in either direction

`scripts/validate-safety-contract.mjs` is nine checks over 490 lines. Every one of them reads
`docs/safety/*.md` and `tests/fixtures/safety-contract.json`. **Not one reads a `.tsx` file.**
It verifies that required rows exist, that approved+active rows do not match the forbidden-claim
regexes, that claim classes resolve against `claims-boundary.md`, and that evidence IDs resolve
against `evidence-pack.md`. It never asks whether a shipped string is in the ledger, or whether a
ledgered string still ships.

The only fence that reads source is `claims-boundary-copy.test.ts`, and it scans for **banned
families**, not for ledger membership. A new landing sentence is opted into the banned-word scan
automatically (the 2026-07-11 glob rewrite) and opted out of the ledger entirely.

**Consequence:** "unledgered" is a governance fact, not a test failure. Nothing goes red. That is
exactly how (A) survived four phases, and it is why §14.4's remediation is a documentation and
test item, not a copy item.

---

## 14.1 P7 — the Adversarial Killer

### P7-1 · The most generic surviving structure is **not** the price tiles. It is block 6's close.

Phase 8 §13.6 item 1 pre-answered "the three price tiles" and asked Phase 9 to decide whether
live-flag honesty is a reason or an excuse.

**On the tiles: reason, and the reason is checkable.** The tiles render from `paywallMode()` and
`resolvePriceVariant()`, which `landing-paywall-copy.test.ts` pins and which checkout enforces —
they are structurally unable to lie about price. And the middle tile carries the least portable
sentence on the page: `Day 5, we email you the exact date and the exact amount, with a one-tap
cancel link in it.` No project-management site's pricing tile says that. The tiles carry their own
antidote.
**The test that keeps it a reason:** if that sentence ever leaves the middle tile, the tiles become
the generic thing and should be replaced. Recorded so the judgement is falsifiable rather than
permanent.

**The actually-generic block is 6's close:**

```
H2:  Try it on the meal in front of you.
Sub: Describe it. Revora tells you where it lands and why, in about ten seconds.
CTA: Check your first meal — free
Cap: No login. No card. {TASTER_LIMIT} free checks on your first day.
```

Four elements, and every one of them is a restatement. The H2 restates the hero's deictic pointer.
The sub restates the hero sub's mechanism *and* re-renders the latency claim the winner already
hedges once. The caption restates the hero's CTA caption almost word for word. **It introduces no
object, proves nothing, and would work unedited on any product on earth.** It is the only block on
the page with that property.

It also causes P7-2.

### P7-2 · The winner breaks its own restated "one filled pill per screenful" rule, once

Contested #4 was settled 5/7 as *per screenful*, and `app/page.tsx:206` records the shipped reading
of it: *"one filled pill per viewport … the hero CTA is the filled one."* The rule is about two
filled pills being **simultaneously visible**.

The winner's own desert map, row 5:

| Stretch | From → to | Distance |
|---|---|---|
| Offer → close | 6,270 → 6,520 | **250px** |

Two filled pills, 250px apart, at 375px. **Both are in the same viewport for ~400px of scroll.**
The winner measured this number, printed it in a table as a reachability success, and never checked
it against the pill rule. The reachability rule wants exits ≤1,460px apart; the pill rule wants
them ≥667px apart. At the bottom of the page the two rules collide and nobody noticed.

**FIX (P7-1 and P7-2 together): delete block 6's H2 and sub. Move the FAQ up so it sits between
block 5's CTA and the final CTA.**

```
Block 5 — The offer ……………………… CTA at y ≈ 6,270
Fair questions (four <details>) …… ~490px
Final exit ………………………………… CTA at y ≈ 6,760
Footer
```

- The most generic block on the page is gone (−250px, page → ~6,950px).
- The final CTA now follows the four objections instead of preceding them, which is where
  `icro` puts a closing CTA and where it actually earns the click.
- The `Fair questions` heading becomes the page's last section heading, which is a better last
  impression than a restated hero.

**Residual, named:** the two filled pills are now ~490px apart, still inside one 667px viewport.
This is an **accepted deviation**, not a fix, and the reason is that the alternative — no exit
after the objections — strands the reader whose last act was reading four answers about money.
Per §10.3 banned-list rule 2, naming a defect is not mitigating it, so the mitigation is stated
too: block 5's pill sits at the *top* of a 1,270px block and block 6's at the bottom of the FAQ,
so a reader travelling downward sees them together only while the FAQ is collapsed. If Phase 10A's
browser measurement shows both pills rendered simultaneously with the `<details>` closed, the
remedy is to make **block 6's** exit a text link on block 3's pattern — the page has already
established that not every exit is a pill.

### P7-3 · The weakest section is block 2, and its weakest sentence is one the Brief already ruled ineffective

Block 2's scope note ends:

> `Revora exists for that gap and nothing else. `**`Not a general nutrition app, not a calorie
> counter, not built for everyone.`**` If your A1C sits outside 5.7% to 6.4%, it says so plainly
> and points you to a clinician instead of pretending.`

The Brief's objection table (master handoff §5) lists objection 1 — *"another food app I'll quit in
a week"* — with two columns. The right column, **"What only sounds like it does"**, reads:

> *saying "not a calorie counter" — every calorie counter says that.*

The winner ships that sentence, 1,000px after the hero has already answered the objection the way
the Brief says it must be answered: by showing one answer card and nothing else. The page wins the
argument visually in block 1 and then re-argues it verbally, in the losing register, in block 2.

It is also three negations in a row inside a block that is already 1,120px of negative space, and
it sits four lines above the page's highest-intent pre-pricing exit.

**FIX: delete the middle sentence.** The scope note becomes:

> `Revora exists for that gap and nothing else. If your A1C sits outside 5.7% to 6.4%, it says so
> plainly and points you to a clinician instead of pretending.`

−60px, one fewer negation triple, and block 2 now ends on honesty-as-care rather than on a list of
things Revora is not. Ledger cost: zero — the deleted sentence is a compression of
`landing-audience-pains`, which stays approved and stays covered by the two surviving sentences.

### P7-4 · The winner's em-dash count is wrong, and two of the uncounted ones are strippable

Phase 8 §10 and all three handoffs print **"4 strings, 5 characters — and all four are
unstrippable"** as a headline metric.

The FAQ answers the winner keeps verbatim carry em dashes it did not count:

| String | Mode | Em dashes | Counted? | Strippable? |
|---|---|---|---|---|
| `…need no login and no card — they live on this device only.` | both | 1 | **no** | **yes** |
| `…a free account includes 5 free checks a day — still no card.` | legacy | 1 | **no** | **yes** |

Neither is pinned. `copy-pins.test.ts:88` pins only the fragment `Your first ${TASTER_LIMIT}
checks, on your first day`, which stops well before the dash. And the winner **already stripped one
em dash from the adjacent FAQ answer** (`One tap, on your account page, effective at the end…`,
where the shipped page has `page — effective`), which proves the omission is an oversight rather
than a policy.

**FIX: strip both.** `…need no login and no card. They live on this device only.` ·
`…a free account includes {FREE_DAILY_CHECKS} free checks a day, still no card.`
**Corrected metric: 4 strings, 5 characters, all four unstrippable** — which is now true rather
than asserted. Incumbent 42 → winner 4 stands.

### P7-5 · The hero card and block 4's card 1 are byte-identical

Both render `result-safe-example` on the meal `Grilled chicken, brown rice, and a side salad`.
They are ~4,000px apart, and block 4's H2 is `The same card, three times.`

For a reader scrolling, the demonstration in block 4 delivers **two** new verdicts, not three; the
first card is one they have already seen at full size in the hero. The page whose central diagnosis
was a duplication census (§3.4: the same claim stated seven times) reintroduces a verbatim
duplicate of its own centrepiece.

**FIX: turn the repetition into the demonstration.** Change block 4's lede so the repeat is the
point rather than an accident:

> `One layout, whatever the answer is. The first card is the one from the top of this page, next to
> the two you have not seen. The Clear card carries no change to make, because when a meal already
> looks balanced Revora says so and stops. It does not invent a correction to look useful.`

Cost: +14 words, ~30px. Gain: the identity becomes evidence for the block's thesis instead of
evidence against it, and no new card fixture or ledger row is required. **Rejected alternative:**
giving the hero a different meal — that needs a fourth ledgered meal name and a fourth reason
string, for a repetition the lede can convert for free.

### P7-6 · A Tier B pin is preserved at the cost of grammar

Block 5's first offer claim:

> `Unlimited checks, and `**`A`**` record you can actually show someone: every check saved, on
> every device.`

A capital `A` in the middle of a clause. The Tier B pin `A record you can actually show someone`
currently ships as an `<h3>`, where a capitalised noun phrase is correct. Jammed mid-sentence to
satisfy `landing-wiring-pins.test.ts`'s `count(…) === 1` assertion, it produces a string that
`taste-skill` §4.9's mandatory copy self-audit bans outright — *"flag any string that is
grammatically broken."* Lowercasing the `a` would render the pin absent and fail the test, so the
pin is what forces the error.

**FIX: lead the claim with the pin instead of embedding it.**

> `A record you can actually show someone: unlimited checks, every one saved, on every device.`

Pin intact, count still 1, grammatical, and it now matches the shape of the other three claims in
the block — all of which are a noun-phrase label followed by its elaboration
(`A weekly recap in sentences. Never a grade…` · `One optional reminder a day, off by default.` ·
`Your A1C and meal text encrypted at rest…`). The pin becomes the label it always was.

### P7-7 · The top Product Hunt comment

**Top upvoted, and it is about the mechanism:**

> "The clarifying question is the whole product and I did not expect to care about it. Every
> nutrition app I have tried would have told me oatmeal was fine and moved on. Ten checks with no
> login is the most confident thing on this page — you do not get to hide behind a signup wall if
> the answer is bad."

**Top critical, and this is the one that should shape Phase 10:**

> "Three example cards is not a demo. I can read that you ask a clarifying question; I cannot see
> it happen to my food. $12.99/mo after ten checks is a lot of trust to extend to a page where
> every card is labelled 'illustrated example'."

That comment is **correct and currently unanswerable**, and it is the winner's structural cost:
four of the five cards on the page are fixtures. The single highest-leverage answer is the one
already on the page — the dare link in block 3 — and it is currently a text link inside the one
block with no pill. Phase 10C should treat `Type "oatmeal" and see what it asks you.` as the
page's most important non-primary CTA and instrument it separately, because if it converts, the
fixture objection is answered by the product rather than by more copy.

---

## 14.2 P4 — the Clinical Trust Officer

### P4-1 · RULING: the comparative-confidence family — both questions, and neither has the answer the ladder expected

**Question 1 — the scale question (does an approved sentence license a section?).**

**Moot as posed. There is no approved sentence.** §14.0 A. The premise of the question is false, so
the answer is not "yes at sentence scale, no at section scale" — it is that the family has never
been approved at **any** scale, and the shipped instance in `app/page.tsx:523` is an unaudited
string that predates the tournament.

**Question 2 — the quantifier escalation (`Most` → `Every`).**

`Every` is **out**, and on grounds that do not depend on the ledger at all. A universal factual
assertion about the behaviour of unnamed third-party products is a comparative advertising claim
requiring substantiation. `FTC-HEALTH-COMPLIANCE` (evidence-pack) states the standard Revora
already operates under: *"Health claims need substantiation, and disclaimers do not repair
stronger contradictory claims,"* with the allowed use *"Keep product and launch copy narrower than
the available evidence."* A universal claim about every competitor is not narrower than the
evidence; there is no evidence. `Most` is weaker but is still an unsubstantiated empirical claim
about a market — it is merely one that nobody would bother to contest.

**The finding that settles it, which neither question anticipated:**

`docs/safety/claims-boundary.md` defines **nine** allowed claim classes. Every one of them is about
Revora — `product-role`, `prompt-scope`, `prompt-policy`, `result-qualitative-impact`,
`result-adjustment`, `clarification-route`, `refusal-route`, `out-of-scope-routing`,
`disclaimer-footer`.

**There is no claim class under which a statement about another company's product can be filed.**
The sentence is not approved and not banned; it is **outside the schema**. `validate-safety-contract
--claims-boundary` would reject a ledger row for it outright:

```js
// scripts/validate-safety-contract.mjs:230-236
for (const row of approvedRows) {
  if (!claimClasses.has(row["Allowed Claim Class"])) {
    failures.push(`copy ledger references unknown claim class: …`);
  }
}
```

**Ruling: the family is unavailable at any scale until a claim class exists for it, and creating a
claim class is a governance decision for counsel, not a copy decision for this tournament.**

Phase 8 predicted that if the family were ruled unavailable, *"block 3's caption is the only string
that changes."* That prediction is correct for the winner. It is **not** correct for the repository:
`app/page.tsx:523-524` ships the same family today and is not part of this tournament's scope.

**FIX (winner): replace block 3's caption.**

| | |
|---|---|
| Was | `Most apps take the same four letters and return a confident number.` |
| Now | `Without that one question, Revora would have been guessing.` |

Why this one clears every fence the old one did not:
- **No third party.** Nothing is asserted about anyone else's product.
- **Fileable.** `product-role` — it describes Revora's own behaviour and its own alternative.
- **Grounded.** It is the user-facing form of the approved `prompt-conservative-floor-snippet`
  (*"If the food description is unclear, ask at most one clarifying question or use the more
  conservative allowed classification"*), evidence `FDA-GENERAL-WELLNESS`, `FTC-HEALTH-COMPLIANCE`.
- **It keeps the rhetorical force and gives it away.** The reader supplies "…unlike every app I
  have used" themselves, which is the version they believe. The page asserting it is the version
  they discount.
- Nine words, no em dash, no repeat of `oatmeal` (which the demo and the dare link already carry
  twice in the same block).

**FIX (repository, out of tournament scope, flagged): `app/page.tsx:523-524` is the same family and
must be routed to counsel with this ruling.** It is not the winner's problem, and it is shipping.

### P4-2 · What a `copy-ledger.md` walk can and cannot establish — and the walk's result

§13.6 item 3 asks P4 to walk the five cards *"string by string."* Given §14.0 B that is only
possible for the genres of row that hold strings. Both were walked.

**Verbatim rows — all five cards clear:**

| Card | String | Ledger row | Verdict |
|---|---|---|---|
| Hero, Clear | `This looks like a reasonable fit. The meal already has protein and vegetables…` | `result-safe-example` | **verbatim ✓** |
| Hero, fineprint | `{BOUNDARY_DISCLAIMER}` via `<DisclaimerLine />` | `result-footer` | **verbatim, test-pinned ✓** |
| Block 4, card 1 | same as hero | `result-safe-example` | **verbatim ✓** |
| Block 4, card 2 | reason + `Adjustment:` | `result-moderate-example` (split at the sentence boundary) | **verbatim ✓** |
| Block 4, card 3 | reason + `Swap:` | `result-high-example` (split at the sentence boundary) | **verbatim ✓** |
| Block 3, demo | three interaction strings + reason/adjustment/swap | registry + `demo-check-reason` / `-adjustment` / `-swap` | **verbatim, test-pinned ✓** |
| Block 4, meal names | all three | `landing-three-answers` | **verbatim ✓** |

**Phase 8 §13.6 item 3 is therefore softer than it reads.** "Four of five cards are copy, not
output" is true as a category statement, but every body string on all five is already-approved,
already-audited `result-*` copy. The winner invents **no new card body copy at all.** That should
be stated in the decision memo as a strength, because it is one.

**The one exception, and it is the defect Phase 8's own Finding 5 identified:**

The hero card's label is hand-typed `An illustrated example` — which is character-for-character the
return value of `demoExampleEyebrow(null)` in `components/demo-check-card.tsx:26`. Finding 5 caught
exactly this hazard in block 3's caption and dropped the label there. **The hero reproduces it.**

Truth is not at risk (the hero card is a separate fixture with no registry entry, so it is
genuinely illustrated regardless of AUD-008's state). Consistency is: if AUD-008's wording ever
changes, block 3's label moves and the hero's does not.

**FIX: the hero card's label renders from the same helper, not from prose.** Either call
`demoExampleEyebrow(null)`, or extract the string to the constant both read. Phase 10A specifies
which; Phase 10C wires it. **This also folds into the existing `<ExampleResultCard>` recommendation
in the Phase 8 handoff §10 — that component is now load-bearing rather than nice-to-have.**

### P4-3 · The winner's copy deck breaks a Tier A guarantee the pin ruling never listed

Block 5's legacy tile and legacy FAQ answer both write the free-tier number as a literal:

> `A free account still includes `**`5`**` free checks a day, still no card…`

`tests/unit/revora/copy-pins.test.ts:97-113` requires the source to contain, with whitespace
collapsed:

```js
expect(flat).toContain("A free account still includes {FREE_DAILY_CHECKS} free checks a day");
expect(flat).toContain("a free account includes ${FREE_DAILY_CHECKS} free checks a day");
```

The winner's copy deck preamble says *"`{TASTER_LIMIT}` and `{monthlyPrice}` are interpolated,
never typed"* and names no third constant. The Tier A list in the master handoff §4.2 and in the
Phase 8 pin ledger names neither `FREE_DAILY_CHECKS` nor these two assertions.

**This is a gap in the pin ruling, not only in the copy deck.** The number 5 written by hand is
precisely the failure mode `copy-pins.test.ts` was built for — its own header comment says the free
tier *"had drifted into three different answers."*

**FIX, two parts:**
1. Copy deck: `{FREE_DAILY_CHECKS} free checks a day` in the legacy tile and
   `${FREE_DAILY_CHECKS} free checks a day` in the legacy FAQ branch.
2. **Tier A gains a tenth pin:** *`FREE_DAILY_CHECKS` interpolated, never retyped, in both the
   legacy tile and the legacy FAQ answer.* Phase 8's "all nine pass" becomes **all ten pass**, and
   passes honestly.

### P4-4 · The winner silently drops a flag branch that a test pins in both directions

`landing-wiring-pins.test.ts` has four assertions on the journey flag:

```js
it("flag on: the journey card replaces the recap, no card duplicated", async () => {
  const t = text(await renderLanding({ NEXT_PUBLIC_LEARNING_JOURNEY: "1" }));
  expect(t).toContain("A 90-day journey, recapped weekly");
  expect(t).not.toContain("A weekly recap in sentences");
  …
});
```

The winner deletes the feature grid, which is where both branches live, and keeps
`A weekly recap in sentences` as an unconditional offer claim in block 5. With the flag on, the
winner renders the recap line and never renders the journey line — **`toContain` fails and
`not.toContain` fails, in one test.**

Phase 8's Tier B ledger retires three pins (`Two ways in.` / `Three ways in.`,
`Dictate it or type it.`, `{TASTER_LIMIT} free checks on day one`) and schedules their test edits.
**The journey branch is not on that list.** `learningJourneyUiEnabled()` is FALSE today, so nothing
is user-visible — but the test renders the flag-on branch explicitly, which is the entire reason
that test family exists (its header: *"the shipped branch of every conditional was never rendered
by any test"*).

**FIX: a fourth Tier B retirement, with the same discipline as the other three.**

> **4.** `A 90-day journey, recapped weekly` — the feature grid is deleted, and the winner states
> the weekly recap once, unconditionally, as an offer claim. `learningJourneyUiEnabled()` is FALSE
> and the winner does not advertise a flag-gated feature. → Edit `landing-wiring-pins.test.ts`
> (`journey-flag branches` describe block) in the same work item, and **move the journey/recap
> branch assertion to whichever surface still renders it**, so deleting the landing's copy does not
> delete the flag's only coverage.

The last clause matters: §10.3 banned-list rule 6 — *a rail passed by deletion is a rail with no
subject.* Deleting the branch **and** its test would discharge the flag's coverage by deletion.

### P4-5 · Rails 1–15, walked against the Phase 8 copy deck

Only the rows where this pass disagrees with Phase 8's self-audit, or where the pass is contingent,
are shown. The other ten stand as written in §13's part 10.

| # | Rail | Phase 8 | This pass |
|---|---|---|---|
| 2 | No fabricated proof | PASS structurally | **PASS, and stronger than claimed.** Phase 8 rests it on *"`Illustrated example`-labelled ledger rows"* while §13.6 item 3 flags four rows as *"required, flagged, not assumed."* P4-2 shows every card body is already-approved verbatim `result-*` copy, so the rail passes on rows that **already exist**. Only the hero card's *label* is new, and P4-2 removes it. |
| 5 | Disclaimer visible, never behind a disclosure | PASS | **PASS, with one placement change.** The P7-1 fix moves the FAQ **above** the final CTA. The medical-advice answer therefore now sits inside a `<details>` that is above the page's last exit rather than below it. The rail holds because it never rested on the FAQ: the hero card renders the full fineprint via `<DisclaimerLine />`, block 4's note repeats the boundary in plain sight, and the footer renders `{BOUNDARY_DISCLAIMER}` in full. **Confirmed, not assumed.** |
| 6 | Statistics trace to evidence-pack | PASS | **PASS.** No statistic renders. The sources paragraphs quote no number, and `5.7%`/`6.4%` are the scope range, traced to `CDC-A1C-RANGES`, not statistics. |
| 10 | 16px floor | PASS with one caveat | **PASS with the caveat re-stated more sharply.** Finding 4's source-order dependency stands. Adding: `.landing .result-disclaimer` is the *only* landing rule whose correctness depends on file position, and it is the one rule Phase 10C is most likely to move while re-ordering a rewritten `.landing-*` layer. Phase 10A must comment it **at the rule**, not only in the spec. |
| — | Claim-class coverage | not audited | **NEW FAILURE, ruled in P4-1.** One string on the page had no allowed claim class. Fixed. **This check did not exist in the rail table and should be rail 16 in the rewritten `DESIGN.md`:** *every user-facing sentence must be fileable under a claim class in `claims-boundary.md`; a sentence that is neither approved nor banned is not therefore permitted.* |

**Tier A: ten pins, all pass** after P4-3. **Tier B: four retirements, each with a reason and a
scheduled test edit** after P4-4.

### P4-6 · Phase 8's Finding 2 misreads `DESIGN.md`, and the real defect is sharper

Finding 2 states: *"`DESIGN.md` §App-UI guardrails bans nested cards."*

```
DESIGN.md:96 — Radius scale: 24px cards (surface-card) · 18px inputs ·
               14px nested cards · 999px buttons/pills/chips. Pick from the scale, never invent.
DESIGN.md:216 — Uses --surface-muted inset (14px radius, nested-card scale) inside the …
```

**`DESIGN.md` does not ban nested cards. It gives them a radius and uses it.** What line 357 bans
is *card mosaics* on content pages, which is a different rule. `impeccable` bans nested cards;
`DESIGN.md` does not.

The real defect is therefore not the nesting — it is the shape:

> `DemoCheckCard` renders `.result-card` at **22px** inside `.surface-card` at **24px**.
> `DESIGN.md`'s own scale says a nested card is **14px**.

A 2px delta between an outer and an inner card is the worst available answer: too different to read
as one surface, too similar to read as two. It is the case `taste-skill`'s Shape Consistency Lock
and `impeccable`'s pairing logic both name.

**This changes two things:**

1. **The winner's shape rule is incomplete and contradicts the documented one.** §13.4 settles
   Contested #2 as *"Outer surfaces 24px. Result cards 22px. The CTA pill 999px. The landing chooses
   none of them,"* and calls that *"a documented rule followed everywhere."* It omits `DESIGN.md`'s
   18px inputs and 14px nested cards, and the 22px-inside-24px case **is** the documented
   nested-card case, at the wrong value. The rule as stated is not the documented rule.
   **Restated, correctly and completely:**
   > **Outer surfaces 24px · inputs 18px · nested cards 14px · result cards 22px · pills 999px.
   > The landing chooses none of them. `.result-card` nested inside `.surface-card` is the one
   > place the product already violates its own scale, and the landing inherits the violation
   > rather than papering over it.**
2. **§13.6 item 4 is rewritten.** Phase 8 tells Phase 10B *"do not restate the nested-card ban."*
   There is no nested-card ban to restate. **Phase 10B's actual obligation:** either bring
   `DemoCheckCard`'s inner cards to the 14px nested scale (a product change on three routes,
   already Phase 8's separate work item), or amend the radius scale to admit a 22px result card
   nested in a 24px surface and say why. **Documenting the scale and shipping a component that
   ignores it is the contradiction — not a ban that does not exist.**

---

## 14.3 P6 — the Anxious Patient

Read cold, at 375px, in the order the page presents itself.

### P6-1 · Where I feel judged: the first seven words, and the sub is what saves them

The H1 is `A meal checker built only for prediabetes.` The word `only` is C4's market-shrinking,
and C4 died at Emotional fit **2.83** for closing a door.

Reading it cold: the very first thing a frightened person sees is a **boundary**. The Brief says the
fold should deliver *recognised, then relieved.* `Built only for prediabetes` delivers
**categorised**. It is milder than `If yours isn't in it, this isn't for you.` because it is an
invitation to a group rather than an expulsion of everyone else — Phase 8's argument is right — but
it is not warm on its own.

**What rescues it is the very next line**, and specifically five words of it: `the plate in front of
you`. Second person, present tense, concrete object. That is the sentence that turns a category into
a person.

**This is load-bearing and it constrains the P6-2 fix below.** Any shortening of the hero sub that
loses `the plate in front of you` makes the fold colder, and the H1 cannot absorb that. Recorded so
Phase 10A does not trade it away for pixels.

**No fix. Verdict: the H1 stands, conditionally, and the condition is written down.**

### P6-2 · Where I stop reading: block 2 — and the sandwich does **not** hold on mobile

§13.6 item 2 asks whether the emotional sandwich holds around block 2. It does not, and the reason
is measurable rather than aesthetic.

The two slices are the hero's Clear card (above) and block 3's *it would rather ask than guess*
(below). At 375px:

- The hero card's last row is at y ≈ 700. Block 2 runs 960 → 2,080.
- Block 3's demo card does not begin until y ≈ 2,400.

**The bottom slice is ~1,400px — more than two full screens — below the point where block 2 starts
telling me what is wrong with my life.** The top slice has been off-screen since before block 2's
H2. For the entire 1,120px of block 2, there is no reassurance on screen, above it, or within two
flicks below it. The sandwich exists in the section map and not in the viewport.

**FIX: nothing structural — the fix is P7-3, and it is enough.** Deleting `Not a general nutrition
app, not a calorie counter, not built for everyone.` removes the only sentence in block 2 that is
*about the reader's options being narrowed* rather than about the reader's situation being
understood. The four pain items are recognition, and recognition does not feel like judgement. The
scope note's surviving second sentence — `it says so plainly and points you to a clinician instead
of pretending` — is warmth in the form of honesty, and it is now the last thing before the CTA.

**Residual, named:** block 2 remains 1,060px of problem with no reassuring object on screen. That is
the structural cost of putting the recognition block second, and every surviving contender paid some
version of it. **The unfixable half:** the only real remedy is a rendered object inside block 2, and
the only object available is a card — which would break the spine's rule that white means *this is
the product* and would put a verdict card next to a description of the reader's failures. **Rejected.
Recorded as a trade-off, not solved.**

### P6-3 · Where I feel managed: block 3's caption — and P4 already fixed it

Independently of the claims question, the old caption `Most apps take the same four letters and
return a confident number.` is the page telling me the moral of a scene I just watched.

I watched the card ask a question. Then a line of text explained to me what I was supposed to
conclude about *other companies*. Being told what to think about something I just saw with my own
eyes is the definition of being managed, and it is a small betrayal of the block's own argument
(*wait a second before you answer*).

**Two personas, two independent routes, one string.** P4-1's replacement —
`Without that one question, Revora would have been guessing.` — fixes both, because it stops
narrating the market and starts admitting something about itself. Admission reads as trustworthy;
comparison reads as sales.

**No additional fix required. Convergence recorded** because it is the strongest signal in this
section that the change is right: the compliance ruling and the emotional read land on the same
sentence for unrelated reasons.

### P6-4 · Do I feel better or worse than when I arrived?

**Better**, and the mechanism is nameable: the first artifact I see is a card that tells me
something I ate is **fine**, and then a caption that says that is the whole answer, and then nothing
else happens. Nothing is scored. Nothing is logged. No number is assigned to me.

That is the thing the incumbent could not do, because the incumbent's first artifact takes away
breakfast (§3.2). It is the winner's real achievement and the decision memo should say so plainly.

**The one place it goes backwards** is block 2, and P6-2 has taken the fixable half.

---

## 14.4 The two inherited items, discharged

### Inherited 1 — the comparative-confidence family

**RULED.** §14.2 P4-1. Not available at any scale; the escalation ladder rested on a row that does
not exist; the family has no claim class; the winner's one instance is replaced. `app/page.tsx:523`
ships the same family today and is referred to counsel as a repository item, outside this
tournament's scope.

### Inherited 2 — the FAQ JSON-LD / visible-answer mismatch

**CONFIRMED ABSENT — and Phase 8's reason is wrong.**

Phase 8 §13.6: *"the four `<details>` render their answers, below the last CTA, so the schema and
the page agree … note that the winner's FAQ placement is what discharged it."*

Placement has nothing to do with it. `app/page.tsx:104-131` declares `faqs` once, and **both**
consumers map the same array:

```js
{faqs.map(({ q, a }) => ( … visible <details> … ))}          // app/page.tsx:857
mainEntity: faqs.map(({ q, a }) => ({ … acceptedAnswer … })) // app/page.tsx:161
```

The mismatch is impossible **by construction, in the incumbent, today**. The three contenders that
flagged it were flagging a defect they would have *introduced* by deleting the visible list while
keeping the array — a real hazard for them, never a property of this page.

**The winner inherits the shared array and is therefore safe regardless of where the FAQ sits** —
which is what makes the P7-1 fix (moving the FAQ above the final CTA) free. Phase 8's stated reason
would have made that move look risky. It is not.

**One instruction for Phase 10C:** the shared-array invariant is currently guaranteed by a code
comment (`app/page.tsx:101-103`), not a test. It is cheap to pin and it is the thing that makes both
of the above true.

---

## 14.5 The fix list, consolidated

Eleven fixes, applied in place to the Phase 8 copy deck and spec.

| # | Where | Change | Source |
|---|---|---|---|
| 1 | Block 3 caption | `Most apps take the same four letters and return a confident number.` → **`Without that one question, Revora would have been guessing.`** | P4-1 + P6-3 |
| 2 | Block 6 | **Delete the H2 and sub.** Move the FAQ between block 5's CTA and the final CTA | P7-1 + P7-2 |
| 3 | Block 2 scope note | **Delete** `Not a general nutrition app, not a calorie counter, not built for everyone.` | P7-3 + P6-2 |
| 4 | Block 4 lede | Add `The first card is the one from the top of this page, next to the two you have not seen.` | P7-5 |
| 5 | Hero sub | Cut 40 words → 33; drop the duplicated latency claim (see below) | P7 / `taste-skill` §4.7 |
| 6 | FAQ, both branches | Strip two uncounted em dashes | P7-4 |
| 7 | Block 5 legacy tile + legacy FAQ | `5` → `{FREE_DAILY_CHECKS}` / `${FREE_DAILY_CHECKS}` | P4-3 |
| 8 | Hero card label | Render from `demoExampleEyebrow(null)`, not hand-typed prose | P4-2 |
| 9 | Pin ledger | Tier A gains a tenth pin; Tier B gains a fourth retirement | P4-3, P4-4 |
| 10 | Shape rule | Restate to the full documented scale, and name the 22px-in-24px violation | P4-6 |
| 11 | Block 5, first offer claim | `Unlimited checks, and A record you can actually show someone: …` → **`A record you can actually show someone: unlimited checks, every one saved, on every device.`** | P7-6 |

### Fix 5 in full — the hero sub is 2× a hard rule of a binding skill

`taste-skill` §4.7 and its Pre-Flight Check: *"subtext max 20 words AND max 3-4 lines."* And:
*"If you cannot describe the value-prop in 20 words of subtext, the value-prop is unclear, not the
rule too tight."*

The winner's sub is **40 words**, and Phase 8 §5 prints the number without flagging it.

At 375px this is not merely a rule breach, it is a measurement error. ~220 characters at 17px in a
~343px content column is **5–6 lines**, not the 4 the winner's 375px story assumes. That pushes the
card start from y ≈ 430 to ≈ 480, the `Clear` verdict row from 560 to ≈ 615, and the caption's first
line from 650 to **≈ 705 — below the 667px fold.** The claim that deleting the eyebrow *"pulls the
caption's first line to the fold"* is probably false as specified.

| | |
|---|---|
| Was (40 words) | `Describe the plate in front of you and Revora gives you one card: where it lands, why, and one change worth making when there is one. For an A1C between 5.7% and 6.4%. About ten seconds, and nothing to log.` |
| Now (33 words) | `Describe the plate in front of you. One card back: where it lands, why, and a change worth making when there is one. For an A1C of 5.7% to 6.4%. Nothing to log.` |

- `the plate in front of you` is **preserved**, per P6-1's constraint.
- `One card back` replaces `Revora gives you one card` — three words shorter, and it is the page's
  own name doing work.
- **`About ten seconds` is deleted, and this is a gain rather than a cut.** §3.5 found the
  incumbent's one unhedged/hedged inconsistency in the latency claim (`landing-glance-fact` renders
  `10 seconds` bare while the hero hedges). The winner deletes the glance strip, and with the hero
  instance gone the claim renders **exactly once on the page**, hedged, in block 6's sub — which
  survives fix 2. One hedged instance is better hygiene than two.
- 33 words ≈ 3.5 lines rather than 5.5. Combined with the eyebrow's ~40px, the caption's first line
  reaches the fold as Phase 8 intended.

**Residual, named: 33 words still exceeds 20, and this is an accepted deviation, not a fix.** The
two clauses that cannot be cut are the scope range (C4's Category **8.67** came from putting scope
at the fold, and it is the graft the tournament chose) and `a change worth making when there is one`
(the in-words form of rail 4, the page's most-repeated honesty). Cutting either to satisfy a
20-word ceiling would trade a load-bearing element for a line of type. **Phase 10A must re-measure
in the browser and report the actual line count and fold position rather than inheriting an
estimate** — that is the half of C5's organ the winner adopted, and this is the first place it has
to be spent.

---

## 14.6 Unfixable findings, recorded as trade-offs

Four. Each was attempted and each attempt was rejected for a stated reason.

1. **Block 2 has no reassuring object on screen for 1,060px.** The only remedy is a rendered card,
   and the only cards available are verdict cards — which would break the spine's white-means-product
   rule and would place a verdict next to a description of the reader's failures. **Rejected.** The
   fixable half (the narrowing sentence) is taken in fix 3. P6-2.
2. **Two filled pills remain inside one 667px viewport at the page's foot.** Fix 2 widens the gap
   from 250px to ~490px and reorders the FAQ so the final pill earns its place, but no arrangement
   both keeps an exit after the objections and separates the pills by a full screenful. **Named,
   with the fallback specified** (make block 6's exit a text link). P7-2.
3. **The hero sub is 33 words against a 20-word hard rule.** Both clauses that would close the gap
   are load-bearing. **Accepted deviation with the reason recorded, and a browser measurement owed.**
   Fix 5.
4. **`app/page.tsx:523-524` ships the comparative-confidence family today.** The ruling in P4-1
   applies to it, and remediating it is outside the landing tournament's scope because the winner
   deletes the block it lives in — meaning the winner *incidentally* fixes it, and any decision to
   **not** ship the winner leaves it in place. **Flagged to counsel independently of this
   tournament's outcome**, so it is not silently discharged by a redesign that may not ship. P4-1.

---

## 14.7 What Phase 10 inherits, updated

Everything in the Phase 8 handoff §10 stands, plus:

**10A — the winner spec.**
- The corrected shape rule (P4-6), stated as the full scale.
- The hero sub at 33 words, **with a required browser measurement of line count and fold position
  at 375px** (fix 5).
- The hero card's label sourced from `demoExampleEyebrow`, not prose (fix 8).
- The Finding 4 source-order comment **on the rule itself**, not only in the spec (P4-5).

**10B — the `DESIGN.md` rewrite.**
- **Rail 16, new:** every user-facing sentence must be fileable under a claim class in
  `claims-boundary.md`. A sentence that is neither approved nor banned is not therefore permitted
  (P4-1).
- §13.6 item 4 is **withdrawn and replaced** by P4-6: there is no nested-card ban. The obligation is
  to reconcile the documented radius scale with `DemoCheckCard`, in one direction or the other.
- Add to the §10.3 banned list: **a ledger row that records a section's intent is not a pin.** Two
  genres of row must not be cited interchangeably (§14.0 B).

**10C — the implementation plan.**
- **Four** Tier B retirements, not three, and the journey-branch coverage must move rather than
  vanish (P4-4).
- Copy-ledger work: **the four "new rows required" in Phase 8 §11 reduce to two** — the hero card
  caption, and the block-3 caption + dare link. The hero Clear card's four rows are already-approved
  `result-*` copy (P4-2), and the two sources paragraphs are C4's verbatim from `landing-three-answers`'
  neighbourhood but still need their own row.
- **New test, cheap, high value:** pin the `faqs`-array shared-consumer invariant (§14.4). It is
  currently guaranteed by a comment.
- **New governance item, independent of ship/no-ship:** route `app/page.tsx:523-524` to counsel.
- Standing: adopt C5's two tests, consider the card-recipe-override guard, un-nest or re-radius
  `DemoCheckCard`.

**Section 18 — decision memo.** Three additions:
- **What the tournament proved that was not obvious** gains its sharpest item: a four-phase
  escalation ladder was built on a ledger row that does not exist, and no test in the repository
  could have caught it, because nothing connects the ledger to the source in either direction.
- **What the incumbent already had right** gains: the `faqs` shared array (a schema-honesty
  guarantee by construction, which three contenders independently failed to notice they were
  breaking), and the fact that every card body on the winner is already-approved copy.
- **The single biggest shipping risk** is unchanged in kind but sharper in form: the page's central
  claim is *the landing shows the product's card, unmodified*, and the property it rests on has no
  test. P4-6 adds that the product's card already violates the product's own radius scale, so
  "unmodified" currently means "inheriting a documented inconsistency."

---

## Where this stops

**Section 14 is complete.** Three personas run against the Phase 8 copy deck. Fifteen findings:
eleven fixed in place, four recorded as trade-offs with the rejected remedies named. The
comparative-confidence family is ruled on, on grounds no phase anticipated. Both inherited items are
discharged, one of them for a corrected reason. Three premises the tournament ran on since Phase 6
are falsified against the repository.

**The winner survives.** No finding is structural: the spine, the six blocks, the two grafts, the
rejected comparison and the two settled no-convergence items all stand. What changed is one caption,
one deleted sentence, one deleted restatement, one reordered FAQ, one reordered claim, fourteen
words of a lede, seven words of a sub, two em dashes, one interpolation, one label, and two lines
of the pin ledger.

**Checkpoint before Phase 10, as instructed. Phase 10A (Section 15) has not begun.**

**Still not done:** `npm test` has not been run for five sessions. Last recorded green suite is
2,165 passed / 0 failed / 2 skipped at `bf714e9`. Phase 10C's breakage predictions — now including
four Tier B retirements and a fourth broken test — are worth nothing against an unverified baseline.
Kill any `next dev` first (`pkill -9 -f "next-server"`), then run it: ~26 minutes on an idle machine.
