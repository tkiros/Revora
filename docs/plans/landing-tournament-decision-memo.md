# Section 18 — Decision memo

**The Revora landing design & copy tournament, Phases 0–10C.** Written 2026-08-05 on branch
`fix/landing-followups` at `8c4c0e9`. **No code has changed and nothing is committed.**

This is a judgement document, not a summary. The record is in the eight plan and handoff files
indexed at the end. What follows is what the record means, including where it indicts itself.

---

## 1. The winner, and the one sentence why

**`W — One Card Back`** — C3's spine (P3, the Design Engineer), plus C4's scope-in-the-H1, C5's
reachability discipline, C7's `border-top` sectioning and dare line, and two C6 paragraphs.

> **It won because it is the only contender whose unit of composition is the thing being sold —
> the product's own result card, rendered in the live classes — so every claim on the page is
> attached to a rendered object instead of to an adjective.**

Two facts about the win are worth more than the margin. It won **under both weight constitutions**
(71.83 rebalanced, 70.72 as-written), so the owner's `Craft 16 + Emotional fit 14` rebalance decided
which of C5 and C6 died but did not choose the winner. And it won **on its floor, not its peak**: the
board holds thirteen sub-5.0 dimension means, the three dead pages hold eight of them, and the winner
holds **zero**. The two highest single-dimension scores in 420 — C5's Legibility 9.33 and C4's
Honesty 9.17 — both belong to corpses.

---

## 2. What the tournament proved that was not obvious

**A. The product's best idea was buried, and nobody had ever written it down.**
*It asks before it guesses* — the clarifying question — is the one thing no competitor in `ICP.md` §9
can honestly say, and every alternative's complaint threads are about the confidence it declines to
fake. The incumbent ranks it **feature #1 of nine, in a grid, at y≈5,500px on mobile.** All seven
personas promoted it to a first-class block independently. **7/7 is the strongest convergence in the
tournament**, and it arrived at a fact that existed nowhere in the repository's documentation.

**B. A four-phase escalation ladder was built on a ledger row that does not exist.**

```
$ grep -c "Most apps" docs/safety/copy-ledger.md   →  0
$ grep -rn "Most apps" app/ components/            →  app/page.tsx:523
```

Phase 6 called it *"a ledger row that has passed the audit."* Phase 7 built a seven-instance
escalation ladder on *"the **approved** ledger row."* Phase 8 took *"the most conservative rung."*
There is no rung. It is unledgered shipped source, and it is **outside the schema entirely** —
`claims-boundary.md` defines nine claim classes and all nine are about Revora, so no class exists
under which a statement about another company's product can be filed.

**The part that matters is not the error. It is that no test in this repository could have caught
it.** There are three fences and only one reads source: the boundary scan proves no *banned family*
appears, the contract validator reads **only `docs/safety/*.md` and never a source file**, and the pin
suites prove named strings. A new sentence is opted *into* the banned-word scan automatically and
*out of* the ledger entirely, and nothing goes red. Four review phases could not have gone red.

**C. Emotional fit is a cliff, not a dial — and honesty does not substitute for it.**
`C4 2.83 · C7 3.83 · C5 4.17 —— a 2.83-point void —— C1 7.00 · C2 7.00 · C3 7.67 · C6 8.83`.
The largest gap in any dimension's distribution on the board. Seven judges did not treat warmth as a
scale; they treated it as a decision taken or refused. C4 wins three dimensions worth 24 weight,
holds **the only 10 in 420 scores**, and finishes sixth. The counter-proof is C6, which P4 scored a
**3 on honesty and a 9 on emotional fit in the same card.** On this page the two are not separable
and neither one buys the other.

**D. The reachability budget was unachievable, and nobody knew, because the tournament ran on paper.**
C5's *no stretch may exceed 1,460px* was derived from **C1's page** and transplanted unchecked onto a
page that measures 8,621px. Measured in a browser, the winner fails it in three places, worst by
764px, and **no arrangement of its six exits satisfies it** — the best still misses by 15px and 103px.

The fix was to change the rule's **unit**, not to move its number: no stretch between exits may exceed
**three screenfuls, 2,001px at 375×667**. Worst measured on the best free arrangement: 1,941px. On the
incumbent: 5,228px, or 7.8 screenfuls. The rule still bites and is no longer impossible. **And the
durable half of C5's organ turned out to be the measurement discipline, not the threshold** — *an
unmeasured desert claim does not count* is the clause with teeth, and it is now `DESIGN.md` §11.1.

**E. Estimation is worthless at this granularity, and it was trusted for four phases.**
Estimated page length ran **20% low**; the worst desert ran **35% low**; **not one of five estimated
gaps landed within 200px of its measurement.** The harness was validated against the untouched
incumbent first (13,346px measured vs 12,942px recorded, 7 CTAs exact), so the error is the
estimates', not the instrument's.

**F. The FAQ has been shipping entirely unledgered.**
`grep` the ledger for `Is Revora medical advice`, `Fair questions`, `How do I cancel` → **zero**. Five
answers ship today under no row. Rail 16 did not invent a problem; it named one already in production.

**G. In every dead page, the winning organ and the killing defect were the same object.**
C5's reachability rule *entails* C5's fixed bar. C4's scope discipline *is* its market-shrinking. C7's
portability test *is* the deleted eyebrow. No survivor has this property, which is why organ
extraction was load-bearing rather than a courtesy. And all three dead contenders **predicted their
killing score in writing and shipped anyway.** Naming a defect is a discipline; it is not a fix.

---

## 3. What the current page already had right

The incumbent's failure is **compositional** — thirteen blocks, 12,942px, a 5,090px stretch with no
way to act, eight card families, four eyebrows, three planes, 42 rendered em dashes. Its failure is
**not** one of integrity, and on several counts it is better engineered than three of the seven pages
built to replace it.

**The `faqs` array is schema honesty by construction, and three contenders missed it.**
`app/page.tsx:104` declares `faqs` once; both consumers map that same array — `mainEntity` at `:161`
and the visible `<details>` at `:857`. **A visible/JSON-LD mismatch is impossible, today, at any
position in the document.** Three contenders flagged that mismatch as a defect to fix — a defect they
would each have *introduced* by hand-authoring one of the two. The incumbent solved structurally what
three redesigns proposed to solve with discipline. It is also what makes the FAQ move free.

**The winner invents no new card body copy at all.** Every card *body* on the new page — the hero
Clear card, all three block-4 cards, the demo, the disclaimer — is already-approved verbatim `result-*`
ledger copy. A complete redesign of the page needs **four new ledger rows**, not forty. That is the
incumbent's copy discipline paying out to its own replacement.

**`demoExampleEyebrow()` is a claim that maintains itself.** It computes the illustrative-data label
from the evidence state and swaps to `A real check, captured <date>` the day a live capture is
authorised. Two separate phases of this tournament proposed hand-typing that label, and both were
wrong. Most repositories do not have a single example of a compliance label that cannot go stale.

**No literal price exists in the source.** `paywallMode()`, `resolvePriceVariant()`, `TASTER_LIMIT`,
`FREE_DAILY_CHECKS`, `RISK_LABELS`, `BOUNDARY_DISCLAIMER` — all interpolated, all pinned. This is a
marketing page that **cannot lie about its own price or its own verdict words by editing marketing
copy.** Ten Tier A pins exist and the winner breaks none of them.

**The betrayal hook is right, and the tournament's verdict was about position, not quality.**
`DemoCheckCard` renders *You type: oatmeal* → *Need one more detail* → *You answer:* → **Be careful**.
It is scrupulously honest, pinned to the real precheck by `promise-registry.test.ts`, and the sharpest
hook in `ICP.md` §10. All seven contenders **kept it**. They moved it. Showing a frightened person a
food they thought was fine being taken away is the wrong first handshake, not the wrong scene.

**The incumbent's best writing survives untouched.** 6/7 kept the four pains items' words (4/7 changed
the container); the winner keeps all four **verbatim**. The trust strip ships verbatim from
`home-trust-strip`. `LandingPrimaryCta` already assembles the CTA once, after five hand-built copies
had drifted into four shapes — a fix the incumbent made before the tournament started.

---

## 4. The three highest-leverage changes, by impact-per-hour

**1 · W3 — the source-order comment.** Minutes. `.landing .result-disclaimer` (16px, `:2281`) and
`.result-fineprint .result-disclaimer` (13px, `:778`) have **identical specificity (0,2,0)**; the
landing wins only by being later in the file. Move either block and the marketing compliance line
silently drops to 13px, breaking rail 10 — and **the duplicate-`font-size` pin structurally cannot
catch it**, because it counts declarations per selector and sees exactly one on each. Five lines of
comment against a silent compliance regression is the best ratio on the board. (A comment already
exists at `:2275–2280`; it explains the 16px and says nothing about the ordering. W3 amends it.)

**2 · W1 — one token.** `--ease` goes from `cubic-bezier(0.22, 0.61, 0.36, 1)` to
`cubic-bezier(0.23, 1, 0.32, 1)`, plus a new `--dur-press: 120ms`. All 24 consumers read `var(--ease)`
and none hardcodes the curve, so it is **one line for an app-wide improvement in feel**, instantly
revertible. Two independent skill sources prescribe the stronger curve and two more put 120ms inside
the press window. It is the only item here that touches surfaces outside the landing's scope, which is
why §11 of the implementation plan puts "ship with the landing or split the PR" to the owner.

**3 · W4 — five guard tests that pass on today's tree.** Card-recipe override · `faqs`
single-declaration · 44/48px targets · `prefers-reduced-motion` · single-CTA assembly. They land green
and standalone **before** anything is deleted, and are then doing their job during every risky commit
that follows. Two of the five discharge rails that have been prose-only since the file was written,
and one is the only defence the winner's central claim will ever have (§6).

> **Notice what these three have in common: none of them is a redesign.** The highest-impact-per-hour
> work the tournament produced is available **without shipping the winner at all**, and it protects
> the page whether or not the winner ships. If the answer to the ship question is "not yet," W1–W4
> should still land. W2 (rename `.landing-phone`, which has named a bezel removed in July since
> 2026-07-27) is the honourable mention and costs the same minutes.

---

## 5. What in `DESIGN.md` was scar tissue, and what was never a design rule at all

The two must be separated, because the file confused them and that is how it lost authority.

**Real scar tissue, correctly kept:** the font-wiring rules. FINDING-030 (the `font: inherit` control
reset once included `body` and killed the elemental font rules at equal specificity),
`reading.className` on the landing root rather than `<body>`, and one-`font-size`-per-selector. These
are correct rules born of real incidents and each is held by a real test. **The scar was the
retelling, not the rule** — one incident was narrated three times in three sections. It is now one
table row naming its test file.

**Never a design rule:**

- **The scope clause "for content pages"** in §App-UI guardrails. The clearest example in the file: a
  rule banning card mosaics sat in the **same document** as the clause exempting the page that became
  one. A rule that carries its own exemption is not a rule; it is a licence with a rule's formatting.
- **§Class vocabulary.** An index, not a rule. It listed `request-status`, which has **zero** rules in
  `globals.css`, and named 8 of the 41 files in `components/`. An index that drifts is worse than no
  index, because people cite it.
- **"CSS only, no animation libraries."** A dependency policy in a design rule's clothes. It answers
  *what may we install*, not *what should this look like*.
- **The 480px `.page-frame` legacy note.** Migration status. That is the roadmap's business.

**And two rules were simply false while being cited as true**, which is worse than either category
above, because a false rule retires the question it appears to answer:

| Claimed | Actual |
|---|---|
| `--text-soft` is "AA at 16px on white" | True on white. **4.40:1 on `--page-bg` and 4.15:1 on `--accent-tint` — both fail AA**, and those are planes the product renders on. Now plane-restricted, and the landing escaped the bug only because its one use was never text |
| "One filled pill per viewport — now enforced in code" | **No such assertion exists anywhere.** Recorded as unenforced; the winner's two closing pills clear a screenful by 5px |

**The standard the rewrite adopted:** every rule states its derivation in one clause or names its
test. Five could do neither and were cut. The honest report on the result is that the file went 361 →
360 lines but **3,309 → 4,657 words** — it is denser, not lighter, and it says so on its own last page.

---

## 6. The single biggest shipping risk

**The page's central claim has no test, and the claim is already softer than it sounds.**

The winner's thesis is *the landing shows the product's card, unmodified.* Everything the page argues
rests on it. `promise-registry.test.ts` pins the demo's **strings**; **nothing pins its recipe.** One
`.landing-*` selector declaring `border-radius` or `border` on `.result-card` makes the claim false
**while appearing to improve the page** — and `npm test`, `npm run e2e` and `npm run contract` all stay
green. That is the exact failure shape of every other defect this tournament found: invisible to every
gate, and therefore survivable across reviews.

And "unmodified" is doing quiet work today. `components/demo-check-card.tsx:38` wraps two 22px
`.result-card`s in a 24px `.surface-card`, where the documented nested value is 14px — a 2px delta,
the worst available answer, too different to read as one surface and too similar to read as two. **So
"unmodified" currently means "inheriting a documented inconsistency."**

**Both halves have a scheduled remedy, and that is the point of the ordering.** W4 adds the
card-recipe override guard on the current tree, before a single block is deleted. `DESIGN.md` §5 rules
that the wrapper is not a card — it becomes an unbordered `aria-label="Example check"` region and the
two inner cards stay untouched at 22px, as a **separate product PR across three routes**. ⛔ The inner
cards must not be re-radiused: that would make them render differently on the landing than on `/check`
and break the claim in the act of defending it.

**The runner-up risk, named:** **W9 is the only work item that can leave the tree red if run alone.**
It deletes six blocks, seven dead selectors inside a live `font-family` group, and four imports, and
carries five of the six breakage fixes in the same commit — its test edits are not follow-ups or the
revert is not clean. Its sixth breakage lives **only in `npm run e2e`**, which has not been run in this
tournament. Run it before W9, not after.

---

## 7. What only real visitors can settle

**1 · Whether the block-3 dare link converts.** This is the one that matters. Four of the winner's
five cards are fixtures, and the sharpest criticism the page will get is the one the red-team wrote
for it: *"Three example cards is not a demo. $12.99/mo after ten checks is a lot of trust to extend to
a page where every card is labelled 'illustrated example'."* **The dare link — `Type "oatmeal" and see
what it asks you.` — is the single place on the page where a reader can make the product do the
thing.** If it converts, the fixture objection is answered by the product instead of by more copy; if
it does not, the objection is real and the answer is a live widget, not another paragraph. **It needs
its own instrumentation from day one**, separately from the primary CTA, or the tournament's most
important open question stays open after the page ships.

**2 · Whether the deleted surface was earning anything.** ~3,000px of informational surface goes with
the feature grid and the how-it-works block. If visitors were converting off feature #7 of nine, **this
page will never report a loss that specific.** The tournament's judgement is that six of thirteen
blocks were stock furniture; that judgement is unfalsifiable on paper in exactly one direction.

**3 · Whether the 520ms pause reads as care or as latency.** The dare link answers the *rhetorical*
objection to the pause. Nothing answers the *perceptual* one, and no amount of specification will.

**4 · Whether `built only for prediabetes` qualifies the reader or shrinks the market.** The scope-in-
the-H1 is C4's organ, grafted out of the contender that **died at Emo 2.83 for market-shrinking.** The
red-team's judgement is that the five words `the plate in front of you` in the next line are what
rescue it, and that any pixel optimisation cutting those five words makes the fold colder. That is a
paper verdict about the first seven words a frightened person reads, and paper is worst at exactly
that.

---

## 8. The decision, and what is not part of it

**The tournament is complete. Eighteen sections, nothing owed.** The next move is the owner's: ship
W1–W13, or not.

Three things do not belong inside that decision:

1. **Governance item 1 is independent.** `app/page.tsx:523` ships an unledgered comparative-confidence
   claim that is outside the claim schema. **W9 deletes the block it lives in, so shipping the winner
   fixes it incidentally — and not shipping the winner leaves it in place.** Route it to counsel
   either way. Do not let a redesign silently discharge a governance item, and do not let a no-ship
   silently retain one.
2. **The FAQ needs ledger rows** whether or not the page changes (§2 F). Rail 16's first real subject.
3. **W1–W4 are worth landing on their own merits** (§4), and they make the rest safer if it comes.

**Ready to run:** ✅ `npm test` green at `8c4c0e9` with the `DESIGN.md` rewrite in tree — 2,184 passed
/ 0 failed / 2 skipped, 186 files, 155s. ⚠️ `npm run e2e` **not run**; it holds one known breakage for
W9. ⚠️ `npm run contract` gates every ledger edit and neither of the other two gates touches it.

---

## 9. The one habit to keep

The single most reliable pattern in this record: **every phase that read source falsified a phase that
had not.** Phase 8 read four files and found five discrepancies, four of which changed a decision.
Phase 9 read seven more and found three false premises in the **governance documents themselves**.
Phase 10A measured in a browser and falsified the winner's own page metrics. Phase 10B found a
`DESIGN.md` rule enforced nowhere. Phase 10C found a delete list and a ledger gap no prior phase had.

Not one of those was found by thinking harder about a document. **Assume every document in this
repository is as unverified as the code was — including `DESIGN.md`, including the safety documents,
and including this memo.** Check before citing.

---

## 10. Document index

| File | Holds |
|---|---|
| **this file** | **Section 18. The decision memo** |
| `DESIGN.md` | Rewritten by 10B. 16 rails, the banned list, scar tissue, four rulings. **The authority on rules** |
| `docs/plans/landing-tournament-implementation-plan.md` | Section 17. 13 work items W1–W13, the breakage set, the ledger work, the product and governance items |
| `docs/plans/landing-tournament-winner-spec.md` | Section 15. The build spec and the browser measurement |
| `docs/handoff/2026-08-05-landing-tournament-phases-10b-10c-handoff.md` | Phases 10B and 10C |
| `docs/handoff/2026-08-05-landing-tournament-phases-0-9-consolidated-handoff.md` | Phases 0–9. Contenders, 42 scorecards, kills, organs, the Brief |
| `docs/plans/landing-tournament-phase-9.md` · `-phase-8.md` · `-phase-7.md` · `-phase-6.md` · `-phases-4-5.md` | The red-team · the winner · kill rulings · scorecards · the seven contenders |

**Sections 1–18 complete. No code changed. No commits.**
