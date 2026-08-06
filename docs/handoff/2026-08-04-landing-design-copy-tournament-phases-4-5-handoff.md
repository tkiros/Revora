# Session handoff — Landing design & copy tournament, Phases 4–5 complete

**Date:** 2026-08-04
**Branch:** `fix/landing-followups` (HEAD `8c4c0e9`, unchanged)
**Scope:** the marketing landing `/` only — `app/page.tsx`, the `.landing-*` layer of
`app/globals.css`, `components/demo-check-card.tsx`, and `DESIGN.md` (on trial).
**Status:** **Personas instantiated. Seven contenders built. Nothing scored.**
**Files written this session:** `docs/plans/landing-tournament-phases-4-5.md` and this handoff. No code changed.

**Prior handoff (read only if you need Phases 0–3):**
`docs/handoff/2026-08-04-landing-design-copy-tournament-phases-0-3-handoff.md`
**Master prompt:** `docs/prompts/2026-08-04-landing-design-and-copy-tournament.md`
**This session's output, in full:** `docs/plans/landing-tournament-phases-4-5.md`

---

## 0. Where the tournament stands

Ten phases, eighteen output sections.

| Phase | Sections | State |
|---|---|---|
| 0–3 | 1–6 | **Done.** Recorded in the 2026-08-04 phases-0-3 handoff. |
| **4–5** | **7–8** | **Done this session.** Recorded in `docs/plans/landing-tournament-phases-4-5.md`. |
| 6 | 9–10 | Not started. **Next.** |
| 7 | 11–12 | Not started. |
| 8 | 13 | Not started. |
| 9 | 14 | Not started. |
| 10A/B/C | 15–17 | Not started. |
| — | 18 | Not started. |

**Required tables still owed:** full 7×7 cross-scoring matrix · per-dimension winner table
(10 rows) · final ranked scoreboard with verdicts. (Teardown Table, DESIGN.md Verdict Table
and Contender Summary Table are done — the last one is at the top of Section 8.)

---

## 1. Repo state — read this first

Nothing was modified except the two markdown files named above. `npm test` was **not** run
this session either. The last recorded green full suite is still **2,165 passed / 0 failed /
2 skipped at `bf714e9`**.

**This is now the single most time-sensitive item in the tournament.** Phase 10C has to
predict which tests break and why; a prediction written against an unverified baseline is
noise. Run it before Phase 10 starts, ideally before Phase 8:

```
npm test          # ~26 minutes, needs an IDLE machine
```

Concurrent dev servers cause false `createTestDb` 120s hook timeouts — see the 2026-07-28
handoff §6.3. Kill any `next dev` first.

Before Phase 10B rewrites `DESIGN.md`, keep the current version reachable:

```
git show HEAD:DESIGN.md > /tmp/design-before.md
```

---

## 2. What this session produced

### 2.1 Section 7 — the seven personas

Each has a genuinely different worldview, theory of failure, and one bet. Compressed:

| | Persona | Theory of why the incumbent fails | The one bet |
|---|---|---|---|
| P1 | **Conversion Surgeon** (`icopywriting`, `icro`) | It is not a page, it is thirteen pages stacked. The mechanism (`It asks before it guesses`) is ranked feature #1 of 9, in a grid, at y≈5,500px. | Fewer sections in the right order beat better sections. |
| P2 | **Restraint Architect** (`apple-design`, `impeccable`) | Five separate systems all saying "new section here" when space alone would have said it. Stripes where breathing should be. | Subtraction, not rearrangement. |
| P3 | **Design Engineer** (`emil-design-eng`, `taste-skill`) | It describes the product nine ways and shows it once — inside a container called `.landing-phone` that has held no phone since 2026-07-27. | The artifact is the page; the only temporal idea deserves the only motion. |
| P4 | **Clinical Trust Officer** (safety docs) | It treats its best asset as fine print, and the trust section has a card whose heading and body describe different things. | Open by telling most readers to leave. |
| P5 | **Legibility Realist** (`iui-ux-pro-max`) | The argument is fine and the page is 12,942px with a 5,090px stretch containing no way to act. | The conversion problem is physical, not rhetorical. |
| P6 | **Anxious Patient** (ICP, PRODUCT §Users) | The first thing it shows a frightened person is a food they thought was fine being taken away. Then it says "calm" three times. | Tone is structure; the fourth objection is the killer. |
| P7 | **Adversarial Killer** | Six of thirteen blocks would work unedited on a project-management company's site. 42 em dashes. And the shipped section-4 headline is "Two ways in," which sells typing and talking as the mechanism. | Only a non-portable object survives. |

### 2.2 Section 8 — the seven contenders

All seven delivered in the mandatory 12-part structure with **verbatim ship-ready copy
decks** (no placeholders), 15-rail self-audits, motion specs, 375px stories, and per-contender
Tier B pin ledgers.

| # | Persona | Name | Structural claim | Blocks | 375px | Longest CTA desert |
|---|---|---|---|---|---|---|
| C1 | P1 | **The Six-Month Gap** | DR chassis; objections as named blocks; oatmeal demo moved out of the hero to the mechanism block | 8 | 11.1 screens | 1,460px |
| C2 | P2 | **Is This One Okay?** | Five statements, one plane, **no hero visual at all**, FAQ dissolved into prose | 5 | 7.8 screens | 2,140px |
| C3 | P3 | **One Card Back** | Result card is the composition unit; white becomes card-only material; one 520ms pause | 6 | 10.2 screens | 2,580px |
| C4 | P4 | **Built for One Number** | Hero H1 disqualifies the reader; a scope table replaces the result card in the hero | 7 | 10.5 screens | 1,820px |
| C5 | P5 | **Within Reach** | Persistent thumb-zone action bar; ranked feature list with the ranking rendered | 9 | 12.9 screens | **0px by construction** |
| C6 | P6 | **Tonight** | One evening, second person, product inside the narrative; no marketing sections | 6 | 9.3 screens | 2,120px |
| C7 | P7 | **It Asks First** | The page is one comparison; no eyebrow, no steps, no grid, no accordion; radius 0 | 5 | 8.7 screens | 2,180px |

Incumbent baseline for comparison: 13 blocks, 12,942px, 19.4 screens, 7 CTAs,
**5,090px CTA desert**, 42 rendered em dashes.

---

## 3. The pin ruling — a new session MUST know this

The phases-0-3 handoff says a contender breaking any §3.2 source-text pin **forfeits**.
Taken literally that ends the tournament: `landing-wiring-pins.test.ts` pins the literal
strings `Two ways in.`, `Dictate it or type it.`, `A weekly recap in sentences` and
`A record you can actually show someone` — which is the exact copy of the sections Phase 1
found weakest.

**Ruling made this session, and it binds Phases 6–10:** the pins bind in two tiers.

**Tier A — semantic pins. Inviolable. Breaking one forfeits.**
`TASTER_LIMIT` interpolated never retyped · `{monthlyPrice}` from `resolvePriceVariant()`
with no literal `$9.99|$12.99|$19.99` in source · `paywallMode() === "trial"` with **both**
branches present · `RISK_LABELS` interpolated · `<DemoCheckCard />` rendered and the three
interaction strings never retyped · `reading.className` on the landing root · no `.landing*`
selector declaring `font-size` twice · banned source phrases stay banned · trial mode never
renders a daily free-check claim and legacy mode must.

**Tier B — string pins. Changeable, with cost.**
`Check up to {TASTER_LIMIT} meals on your first day` · `{TASTER_LIMIT} free checks on day one` ·
`Your first ${TASTER_LIMIT} checks, on your first day` · `7 days free` · `Days 2–8` ·
`A free account` · `still no card` · `Two ways in.` / `Three ways in.` ·
`Dictate it or type it.` · `A weekly recap in sentences` ·
`A record you can actually show someone` · `It asks before it guesses` ·
`Add to home screen — works today`.

A contender may retire a Tier B pin **only if it names the pin, gives the reason, and
schedules the test edit in the same work item.** Silent drops forfeit. Every contender
carries its ledger in part 10 of its entry.

**Tier B retirements by contender** (Phase 10C inherits this directly):

| Contender | Tier B pins retired |
|---|---|
| C4, C5 | **2** — `Two ways in.` / `Three ways in.`, `Dictate it or type it.` |
| C1, C3 | 3 |
| C7 | 4 — including `It asks before it guesses`, retired as a literal string while being promoted to the page's entire architecture |
| C6 | 5 |
| C2 | **6** — the most; `copy-pins.test.ts` and `landing-wiring-pins.test.ts` both need edits |

Every contender retires `Two ways in.` / `Three ways in.` and `Dictate it or type it.`
**7 of 7.** With `photoInputEnabled()` false that section sells typing and talking as the
mechanism; nobody defended it.

---

## 4. Findings that are new this session

Things not in the phases-0-3 handoff. Carry these forward.

**4.1 The DPP statistic is denied to all seven.** The <1%-enrolment number from `ICP.md` is
the most persuasive statistic available to this page, three personas wanted it, and rail 6
plus `claims-boundary-copy.test.ts` family `study-association` confines the trial citation
to `/how-it-works`. Recorded so it does not get re-litigated in Phase 8.

**4.2 Six of seven contenders delete the research disclosure** (`.landing-proof-band`).
Only **C4** keeps it, and keeps the `Sources` label so rail 7 has something to bind to.
This is either a convergence finding or six personas making the same easy cut.
**Phase 7 must rule on it explicitly** — it is the largest single evidential exposure on the
board.

**4.3 Two H1s were killed for rail breaches, by their own author.** C6 (the Anxious
Patient) recorded both rather than shipping them:
- `You can probably eat it.` — implies a safety finding about the user's meal.
  `claims-boundary.md` §Verdict Semantics: `Clear` must never imply "safe for the user". Rail 1.
- `Most meals come back Clear.` — an unverifiable claim about output distribution.
  Fabricated proof. Rail 2.

**Do not resurrect either.** They are the most natural permission-first headlines in the
brief and both are out of bounds.

**4.4 C7 gave up the stronger version of its own central object to hold rail 2.** Its
comparison block contains **no invented competitor output** — no fake card, no fake glycemic
number, no named competitor. The comparison is made at the level of *behaviour*. A fabricated
competing card would have been fabricated data on a health surface, the div-based
fake-screenshot tell, and a defamation-adjacent asset.

**4.5 C7's `You type: oatmeal` line must not be an `<input>`.** It looks like one. Rail 15
(the landing never becomes a second check surface) plus the fake-screenshot ban: it must be
static text, non-focusable, no caret.

**4.6 Ledger debt is unevenly distributed and large.**

| Contender | New `copy-ledger.md` rows required before ship |
|---|---|
| C6 | **~10** — the entire block-2 narrative, block-3/5 bodies, both prose price branches, the cancel paragraph |
| C4 | **7** — hero H1+sub, three scope-card rows, four refusals, three label definitions, sources paragraphs, the fifth FAQ entry |
| C7 | 8 — the six comparison strings, H1+sub, and `A confident wrong answer is worse than a question here` (the most competitor-adjacent sentence any contender wrote; needs a second read) |
| C2 | 2 — the prose price paragraph, both branches |
| C1, C3, C5 | 0–2 — these three stayed closest to already-approved rows |

**4.7 Em dashes: incumbent 42 → contenders 2 to 8.** C2 renders 2 (one is the approved
CTA), C6 renders 3, C7 renders 4, C4 renders 5, C1 renders 6, C3 renders 7 (three are inside
already-approved ledger result copy and cannot be stripped), C5 renders 8.

**4.8 C5 is the only contender that schedules the missing tests.** Two rails are unasserted
for every contender including itself: 44px touch targets (axe does not check target size at
AA) and `prefers-reduced-motion` (four `@media` blocks, no coverage). C5's implementation
plan carries a Playwright assertion for each. Phase 10C should adopt both regardless of who
wins.

**4.9 Two contenders independently killed the second typeface.** C2 and C7 both retire the
Plus Jakarta Sans + Source Sans 3 pairing for one family at 17px/1.65, by different routes
(C2: the variable that was wrong was size; C7: a page that removed every borrowed structure
should not carry a borrowed typographic solution). The other five keep it, and C6 argues it
carries more weight on its page than anywhere else because it is 70% prose.

---

## 5. How the contenders voted on the seven CONTESTED `DESIGN.md` items

Phase 3 left seven design decisions for the tournament to settle. Phase 8 inherits a tally,
not an argument.

| Contested item | C1 | C2 | C3 | C4 | C5 | C6 | C7 |
|---|---|---|---|---|---|---|---|
| 1. Two-font pairing | keep | **kill** | keep | keep | keep | keep | **kill** |
| 2. 24px radius on all 8 card families | keep | n/a | **12px** | 24/**14** split | keep | keep | **0px** |
| 3. Three light planes + 1px hairline | 2 planes | **1** | **1** | 2 (semantic) | 2 | **1** | **1 + rules** |
| 4. "One filled pill per viewport" | per screenful | per page | per screenful | per page | **per screenful (sticky bar)** | per screenful | per screenful |
| 5. Eight landing card families | 3 | **2→1** | **2** | 3 | 4 | **2→1** | **1** |
| 6. Landing voice licence | licence | licence | licence | **no licence** | licence | licence | licence |
| 7. "Icons never alone" | restate | restate | restate | restate | restate | restate | restate |

**Convergence already visible, before any scoring:**
- **7/7** want rule 7 restated. `DESIGN.md` already contradicts it in §Progress surfaces.
- **7/7** cut card families from eight to four or fewer. **Nobody defended eight.**
- **6/7** collapse the plane system to one or two planes. **Nobody defended
  three-planes-plus-hairline as shipped.**
- **7/7** delete the `Step 1 / Step 2 / Step 3` eyebrows.
- **5/7** move "one filled pill" from per-viewport to per-screenful.

Those five look settled. Phase 7.5 should say so plainly rather than re-deriving them.

---

## 6. Decisions that belong to the owner, not to the tournament

### 6.1 The scoring weights — decide BEFORE Phase 6, not after

Current: `Category clarity 12 · Belief shift 14 · Honesty & claim safety 12 ·
Voice fidelity 10 · Legibility & accessibility 12 · Craft & non-genericness 12 ·
Information architecture 8 · Emotional fit 10 · Implementation realism 6 · Durability 4`.

As written this is a **conversion tournament with a craft floor**. On these weights
**C1, C5 and C7 start ahead.** Swap to `Craft 16 + Emotional fit 14` and **C3 and C6 start
ahead instead.** The master prompt's own operator notes say to decide this before seeing the
result rather than after. It is still before. If the weights are not changed, Phase 6 runs
on the numbers above.

### 6.2 Rail 14 is still immutable this round

Light surface, no dark bands, owner instruction 2026-07-27. No contender argued against it;
several proposed other ways to create depth (rules, planes-as-semantics, space). If you want
the tournament to genuinely re-litigate the visual identity, that is the one lever that most
widens the design space — and it would require re-running Phase 5, not just Phase 6.

---

## 7. What remains — Phases 6 to 10

| Phase | Section | Work |
|---|---|---|
| **6** | **9–10** | **42 cross-scorecards** (7 personas × 6 contenders, no self-scoring). Ten weighted dimensions, one-line concrete justification per dimension, verdict per card (STRONG / CONDITIONAL / WEAK / KILL). Full 7×7 matrix of weighted totals, diagonal blank. Then Section 10: every dimension where two personas differ by **3+ points**, surfaced explicitly, with a ruling on which one is right and why. Score **in character** — the Anxious Patient does not care about token systems; the Adversarial Killer does not hand out 8s; a 9 is rare and a 10 must be argued for. |
| **7** | **11–12** | Rank by weighted mean. **Kill the bottom three** with the exact structural or copy decision that ended each — not "it was weaker". Name the failure traits the dead share (these become the banned list in the rewritten `DESIGN.md`). Extract **one organ** from each corpse and name its recipient. Then Section 12: every idea that appeared independently in **3+ contenders** (see §5 above — much of this is already collected), and every idea exactly one persona proposed that scored highly with the others. |
| **8** | **13** | Synthesise ONE winner. Pick a spine, name every graft and what it displaced, name every high-scoring idea deliberately rejected and why. Deliver in the full 12-part structure at ship quality with a verbatim, paste-ready copy deck. Do not force diversity — if one contender dominates, say so and graft sparingly. |
| **9** | **14** | Red-team. P7: what is the most generic thing that survived, what is the weakest section, what would the top Product Hunt comment be. P4: walk all 15 rails line by line against the final copy deck, then check every claim against `evidence-pack.md` and **every string against `copy-ledger.md`** — flag every row that needs writing (see §4.6 for the debt each contender brings). P6: where do I feel judged, where do I feel managed, where do I stop reading, do I feel better or worse than when I arrived. Fix in place, show the fixes, record unfixable findings as trade-offs. |
| **10A** | **15** | `docs/plans/landing-tournament-winner-spec.md` — build-ready. Ban vague phrases: say `padding: clamp(52px, 7vw, 104px)`, say `17px / 1.65`, name the token. |
| **10B** | **16** | Rewrite `DESIGN.md` carrying the Phase 3 verdicts **and the §5 votes above**. Every surviving rule states its derivation in one sentence. Scar tissue names its test file instead of retelling its incident. Accidents gone. Phase 7.3 anti-patterns become an explicit banned list. Must be **shorter and more load-bearing** than 361 lines; report before/after and what was cut. Still a design SYSTEM — app shell, tokens, motion, icons, voice carry forward, re-derived. |
| **10C** | **17** | `docs/plans/landing-tournament-implementation-plan.md` — section-by-section diff against `app/page.tsx` with line ranges, the `.landing-*` CSS changes, which tests break and why, which strings need `copy-ledger.md` rows, ordered smallest-shippable-first work items each independently revertible, and what must NOT change plus the test that catches it. **Adopt C5's two missing-test items (44px targets, reduced-motion) regardless of who wins.** |
| — | **18** | Decision memo. Winner + the one sentence why · what the tournament proved that was NOT obvious · what the current page already had right (be specific and generous) · the three highest-leverage changes by impact-per-hour · what in `DESIGN.md` was scar tissue and never should have been a design rule · the single biggest shipping risk · what only real visitors can settle, being honest about which disagreements are genuinely empirical. |

---

## 8. Traps and gotchas

Carried forward from the phases-0-3 handoff, plus new ones from this session.

1. **Skills bind the personas.** Invoke and hold before scoring: `impeccable`,
   `iui-ux-pro-max`, `taste-skill:taste-skill`, `apple-design`, `emil-design-eng`,
   `icopywriting`, `icro`. A contender that violates the standard of the skill it is built
   on is scored down by every judge including itself.
2. **`taste-skill` bans em dashes outright; Revora's approved CTA contains one**
   (`Check your first meal — free`). Resolution from Phase 3 stands: the em dash stays
   because it is approved ledger copy, but 42 on one page is a cadence. Every contender
   capped itself between 2 and 8. Do not silently strip them — that breaks `copy-pins` and
   the approved CTA.
3. **Rail 14 (light surface, no dark bands) is immutable this round.**
4. **Do not "fix" the Clear card** by giving it an adjustment. `assertNoUnsafeSafeFields`
   throws on it in the engine. All seven contenders demonstrate the absence rather than
   asserting it; three of them make it the hero.
5. **`Revora_Brand_Positioning_v2.md` is a tombstone** and `docs/archive/` is not an approved
   source. `docs/product-marketing.md` is the only active positioning source.
6. **The rejected claim in `PRODUCT.md` §Rejected claims must never be resurrected** — it sits
   deliberately outside the audit fence, is recorded as Rejected in the ledger row
   `onboarding-reversal-line`, and is pending counsel Q8.
7. **NEW — the two rejected C6 headlines in §4.3 must not be resurrected either.** They are
   the most natural permission-first headlines available and both breach a hard rail.
8. **NEW — the DPP statistic stays off the landing** (§4.1). It is confined to
   `/how-it-works` by rail 6 and a test.
9. **Contenders are paper, not code**, by the prompt's scope choice. If live variants are ever
   wanted, ship each as a route under `/lab/v1..v7` in a git worktree and score screenshots.
   Much slower, much more honest.
10. **Only ever run one `next dev`.** Multiple servers over one `.next` cause
    `ChunkLoadError` reload loops. `pkill -9 -f "next-server"; rm -rf .next; npm run dev`.
11. **`~/.claude/skills/gstack/` does not exist on this machine.** All gstack helper commands
    silently no-op. Use Playwright from the repo's own `node_modules`.
12. **The claims guards are the authority, not caution.** The 2026-07-28 rebuild's bolder copy
    tripped zero guards. `claims-boundary-copy.test.ts` bans *disease-outcome claims*, not
    vivid writing about the reader's problem. Run `npx vitest run tests/unit/revora/` (~80s)
    before assuming any copy is a compliance problem.

---

## 9. Live facts — do not re-derive, do not retype

Unchanged from the phases-0-3 handoff. Every contender interpolates these.

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

---

## 10. Next session prompt — paste this

> Continue the Revora landing design & copy tournament. Read
> `docs/handoff/2026-08-04-landing-design-copy-tournament-phases-4-5-handoff.md` first, then
> `docs/plans/landing-tournament-phases-4-5.md` for the seven contenders in full. The
> earlier `docs/handoff/2026-08-04-landing-design-copy-tournament-phases-0-3-handoff.md`
> carries the incumbent inventory, the constraint ledger and the Brief — read it only if you
> need a fact the phases-4-5 handoff does not already carry.
>
> **State:** Phases 0–5 are complete. Section 7 (seven personas) and Section 8 (seven
> complete contenders in the 12-part structure, with verbatim ship-ready copy decks, 15-rail
> self-audits and Tier B pin ledgers) are written to
> `docs/plans/landing-tournament-phases-4-5.md`. **Do not rebuild the contenders, do not
> re-derive Phases 0–3, and do not re-read the whole codebase.** The handoff carries the live
> constants, the two-tier pin ruling, the contested-item vote tally, and the convergence
> already visible.
>
> **Do next, in order:** Phase 6 — Section 9 (42 cross-scorecards: 7 personas × 6 contenders,
> no self-scoring, ten weighted dimensions, one concrete one-line justification per dimension,
> a verdict per card, plus the full 7×7 matrix of weighted totals with the diagonal blank),
> then Section 10 (every dimension where two personas differ by 3+ points, surfaced
> explicitly and resolved with a ruling). Score in character. Do not be nice: a 7 is a good
> page, a 9 is rare, a 10 must be argued for. Stop after Section 10 and checkpoint before the
> kill round.
>
> **Before you start scoring, confirm the weights with me.** Current weights make this a
> conversion tournament with a craft floor and start C1/C5/C7 ahead; `Craft 16 + Emotional
> fit 14` would start C3/C6 ahead. Ask once, then proceed with whatever I say (default: the
> weights as written).
>
> Invoke and hold these skills before starting: `impeccable`, `iui-ux-pro-max`,
> `taste-skill:taste-skill`, `apple-design`, `emil-design-eng`, `icopywriting`, `icro`.
>
> Rails: light surface only, no dark bands (owner instruction). Every number comes from the
> live fact table in the handoff. Tier A pins are inviolable; Tier B pins may be retired only
> with a named reason and a scheduled test edit. Do not give the Clear card an adjustment. Do
> not resurrect the two rejected C6 headlines or the DPP statistic. Do not use workflows or
> dynamic subagent orchestration.

---

## 11. Files touched this session

| File | Change |
|---|---|
| `docs/plans/landing-tournament-phases-4-5.md` | **New.** Sections 7 and 8 in full: the pin ruling, the Contender Summary Table, the contested-item vote table, the seven personas, and the seven contenders in the 12-part structure. |
| `docs/handoff/2026-08-04-landing-design-copy-tournament-phases-4-5-handoff.md` | **New.** This file. |

No code changed. No commits. No `DESIGN.md` edits. `npm test` not run.
