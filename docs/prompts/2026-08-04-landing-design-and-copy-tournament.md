# Revora Landing Tournament — Master Prompt

**Purpose.** Run a competitive, adversarial tournament over the design and copy of
Revora's landing page (`/`) and produce two artifacts that become the permanent
source of truth: a build-ready landing spec, and a rewritten `DESIGN.md`.

**How to use.** Paste everything inside the fenced block below into a fresh
Claude Code session opened at the repo root (`/home/tefera/Desktop/Revora`).
Nothing needs to be attached — the prompt tells the model which files to read.
See "Operator notes" at the bottom before you run it.

---

```text
You are running a competitive design-and-copy tournament for Revora's landing
page. This is not a critique session and not a brainstorm. It is an elimination
process: seven personas each build a complete contender, every persona scores
every other contender, the weak ones are killed with stated reasons, and the
survivors' best organs are transplanted into ONE winner.

The output of this tournament becomes the SOURCE OF TRUTH for all future Revora
design and copy work. Treat it with that weight. `DESIGN.md` is not the referee
here — it is a defendant. Every rule in it must be re-derived from first
principles or killed.

════════════════════════════════════════════════════════════
SKILLS — INVOKE THESE, DO NOT IMPROVISE
════════════════════════════════════════════════════════════

Before Phase 0, invoke these skills and hold them for the whole run. They carry
the craft standards this tournament is judged against:

- `impeccable`          — interface design, hierarchy, cognitive load, anti-slop
- `iui-ux-pro-max`      — UX systems, accessibility, interaction quality
- `taste-skill:taste-skill` — visual taste, restraint, what "expensive" looks like
- `apple-design`        — Apple's foundations: deference, optical typography, restraint
- `emil-design-eng`     — design-engineering craft, the invisible details, earned motion
- `icopywriting`        — direct-response structure: belief, mechanism, proof, offer, risk reversal
- `icro`                — conversion reasoning

Skills bind the personas. A persona whose contender violates the standard of the
skill it is built on is scored down by every judge, including itself.

════════════════════════════════════════════════════════════
SCOPE
════════════════════════════════════════════════════════════

IN SCOPE — the landing page as a whole system:
- `app/page.tsx` (~929 lines, 11 sections) — structure, copy, component assembly
- the `.landing-*` layer of `app/globals.css` (~3,473 lines total; landing rules
  are a subsection — locate them, do not read the whole file blind)
- `components/demo-check-card.tsx` — the phone-mockup proof unit in the hero
- `DESIGN.md` — the whole file, but especially §Marketing landing, §Voice,
  §Type, §Shape & space, §Motion, §Icons, §App-UI guardrails
- the landing's role as the entry point to `/check`, `/how-it-works`, `/guides`,
  `/pantry`

OUT OF SCOPE — do not redesign these; you may only note where the landing
mis-sets expectations for them:
- the `(app)` shell and its routes (`app/(app)/**`)
- `/guides/*` article pages, `/pantry`, `/welcome`
- backend, coach engine, pricing mechanics, auth

════════════════════════════════════════════════════════════
PRODUCT CONTEXT — READ THESE FILES FIRST, DO NOT ASSUME
════════════════════════════════════════════════════════════

You must read these before writing a single word of a contender. Quote from
them; do not paraphrase from memory.

| File | What it gives you |
|---|---|
| `PRODUCT.md` | register, users, product purpose, brand personality, anti-references, design principles, and one REJECTED claim you must never resurrect |
| `docs/ICP.md` | who the visitor actually is |
| `docs/product-marketing.md` | the ONLY approved source for active positioning and offer language |
| `docs/safety/claims-boundary.md` | intended use, verdict semantics, Allowed Claim Classes, Banned Claim Families, the reusable disclaimer |
| `docs/safety/copy-ledger.md` | approved copy rows, with status (Approved / Active / Rejected) |
| `docs/safety/evidence-pack.md` | what the narrow educational statements are actually supported by |
| `docs/safety/tone-uncertainty-policy.md` | how Revora is allowed to express uncertainty |
| `DESIGN.md` | the incumbent design system (a defendant, see Phase 3) |
| `app/page.tsx` | the incumbent landing page |
| `docs/handoff/2026-07-28-landing-page-conversion-rebuild-handoff.md` | why the current page is shaped the way it is |
| `docs/handoff/2026-07-28-landing-design-review-fixes-and-ship-session-handoff.md` | the most recent design decisions and their reasons |

`Revora_Brand_Positioning_v2.md` is a tombstone — it is superseded and its
former contents are OUT OF BOUNDS. Do not mine it. `docs/archive/` is likewise
not an approved source for any copy.

THE VISITOR — hold this person in your head for the entire tournament:

A US adult, 40–60, most likely 54. Three months ago a doctor said their A1C is
6.1% — prediabetic — and told them to "eat better, come back in six months."
They are anxious and slightly ashamed. They have already tried MyFitnessPal and
quit because it turned eating into accounting. They have read six contradictory
articles. They are on a phone, possibly one-handed, possibly in a grocery aisle
or already sitting at dinner. Their eyesight is not what it was. They are not
going to take on a project. They want to know whether they can eat the thing in
front of them, and they want to be told it in a way that does not make them feel
worse.

They are not a growth-hacker persona. They are a scared person, and the page's
first job is to lower their heart rate, not to raise their intent score.

════════════════════════════════════════════════════════════
HARD RAILS — VIOLATION IS INSTANT DISQUALIFICATION
════════════════════════════════════════════════════════════

These are not stylistic preferences. A contender that breaches any of them is
killed on contact, regardless of score, and cannot be revived in synthesis.

LEGAL / SAFETY (immutable — no persona may argue these away):
1. Revora is NEVER the agent of a health outcome. Only the user is. Any sentence
   that makes Revora, or the use of Revora, the thing that achieves an outcome
   is out of bounds, whatever verb it uses. See `docs/safety/claims-boundary.md`
   §Banned Claim Families for the enumerated vocabulary.
2. No fabricated ratings, user counts, testimonials, or illustrative data
   presented as real. Unlabeled example data on a health surface is banned.
   Credibility here is honesty, not decoration.
3. The raw risk-class words (SAFE / MODERATE / HIGH) never render as user copy.
   Labels come from `lib/revora/labels.ts` only.
4. A Clear verdict carries NO adjustment and NO swap. This is enforced in code.
   No surface may promise either one unconditionally.
5. The disclaimer and the load-bearing boundary copy stay visible, never behind
   a disclosure.
6. Any statistic or research reference must trace to `docs/safety/evidence-pack.md`
   and be hedged and attributed. The trial citation lives on `/how-it-works`
   only; it is pinned by `tests/unit/revora/claims-boundary-copy.test.ts`.
7. The `.landing-proof-band` left column is a LABEL, not a statistic. A number
   there would read as Revora's own result and is out of bounds.

ACCESSIBILITY (immutable):
8. WCAG AA contrast on all text. Health information never in low-contrast hint
   styles (`--text-soft` is hints ONLY).
9. 44px minimum touch targets.
10. Nothing below 16px on this surface except tracked uppercase labels. This
    audience's eyesight is a design constraint, not an edge case.
11. Verdict color is never the sole information channel — shape or text always
    carries the signal too.
12. `prefers-reduced-motion: reduce` zeroes all motion. Mandatory, never removed.
13. Focus visible everywhere. Never remove outlines.

OWNER DECISIONS (immutable this round):
14. The landing surface reads LIGHT. The two deep-green `.landing-dark` bands
    and the `--landing-band` color token were removed on owner instruction
    2026-07-27 because the page must read light, simple, and easy to navigate.
    Do not reintroduce dark bands. (You MAY argue for other ways to create
    depth; you may not argue for the dark bands back.)
15. The landing is a marketing surface. The app lives at `/check`. The landing
    never becomes a second check surface.

Everything else — every other rule in `DESIGN.md`, every headline, every
section, every card, the entire visual system — IS IN QUESTION.

════════════════════════════════════════════════════════════
PHASE 0 — INGEST
════════════════════════════════════════════════════════════

Read every file in the context table. Then produce:

A. **Incumbent inventory.** The current landing page, section by section, in
   source order. For each of the 11 sections:
   - section id / anchor and line range in `app/page.tsx`
   - the job it is trying to do
   - its actual copy (verbatim headline + lede)
   - its visual treatment (which plane: `.landing-sheet` / `.landing-band` /
     default `--page-bg`)
   - what a visitor gains by reading it
   - what a visitor loses by scrolling past it

B. **Constraint ledger.** Every hard rail above, mapped to the file and test
   that enforces it. Note which rails are enforced by a passing test and which
   exist only as prose — the prose-only ones are the ones that will silently
   break.

C. **Fact extraction.** Extract the live values, do not hardcode them from
   memory: `TASTER_LIMIT`, `FREE_DAILY_CHECKS`, the trial length, the price,
   the verdict labels, and whether `photoEnabled` is on. Every contender must
   use the live values.

════════════════════════════════════════════════════════════
PHASE 1 — FORENSIC TEARDOWN OF THE INCUMBENT
════════════════════════════════════════════════════════════

Be brutal. This page was built by people doing their best and it is still
probably wrong in ways nobody has said out loud.

For each of the 11 sections, answer:
1. Is this section load-bearing, or is it here because someone thought a landing
   page should have one?
2. What does it cost in scroll, attention, and doubt?
3. If it were deleted tomorrow, what would actually get worse?
4. Which section is it secretly duplicating?
5. Does its copy sound like Revora, or like a landing page?

Then answer the page-level questions:
- How long does it take a 54-year-old to learn the category? Count the words
  they must read before they can answer "what is this?"
- Where does the page ask them to think when it should be telling them?
- Where does it hedge so hard the promise disappears?
- Where does it promise so hard it brushes the claims boundary?
- Which parts would appear, near-verbatim, on 500 other 2026 SaaS landing pages?
- Where is the page performing calm rather than being calm?
- What is the single worst thing on this page?

Produce a ranked **Teardown Table**: section · verdict (LOAD-BEARING / WEAK /
DEAD WEIGHT / ACTIVELY HARMFUL) · one-line reason.

════════════════════════════════════════════════════════════
PHASE 2 — THE JOB THE PAGE IS ACTUALLY HIRED FOR
════════════════════════════════════════════════════════════

Before anyone designs anything, state the brief in your own words:

1. The ONE belief the visitor must hold by the end of the page.
2. The ONE action, and what must be true for them to take it.
3. The three objections that kill the conversion, in order of frequency:
   - what they are
   - where in the scroll they arise
   - what actually answers them (not what sounds like it answers them)
4. The emotional arc: what the visitor feels at the fold, at the midpoint, at
   the CTA. Name the feelings.
5. The one thing this page can say that no competitor can honestly say.

This brief binds all seven contenders. A contender that solves a different
problem is off-brief and scored accordingly.

════════════════════════════════════════════════════════════
PHASE 3 — PUT DESIGN.md ON TRIAL
════════════════════════════════════════════════════════════

`DESIGN.md` is 361 lines of accumulated decisions. Some are principles. Some
are scar tissue from a specific incident. Some are neither — they are just what
happened to get written down.

Go through it rule by rule and classify each into exactly one bucket:

- **PRINCIPLE** — derivable from the product and the user; keep, and state the
  derivation in one sentence.
- **SCAR TISSUE** — exists because something broke once (e.g. the Times New
  Roman incident, the duplicated `font-size` declarations, the five hand-built
  CTAs). Keep the constraint if the failure mode is still live, but rewrite it
  as a rule rather than an incident report. Note which ones are really tests
  wearing a document's clothing.
- **ACCIDENT** — no derivation, no incident, just inertia. Kill it or replace it.
- **CONTESTED** — a real design decision that a competent designer could
  reasonably reverse. Flag it and let the tournament settle it.

Pay specific attention to:
- the two-font pairing (Plus Jakarta Sans display + Source Sans 3 reading face,
  landing-only) — principle or accident?
- the single-shadow rule
- the 24px card radius applied to all eight landing card families
- the three-plane light rhythm and the 1px hairline
- "one filled pill per viewport"
- the three breakpoints (640 / 720 / 880)
- the icon vocabulary and "icons always sit next to text"
- the anti-slop guardrails — are they producing restraint, or producing blandness?
- §Voice: does "permission-first" as written produce copy that converts, or copy
  that apologizes?

Output the **DESIGN.md Verdict Table**: rule · bucket · reasoning · proposed
disposition. Nothing gets to survive because it is already written down.

════════════════════════════════════════════════════════════
PHASE 4 — THE SEVEN PERSONAS
════════════════════════════════════════════════════════════

Instantiate seven personas. Each has a genuinely different worldview, a
different theory of why this page fails, and a different definition of a win.
They are NOT seven flavors of the same designer. If two contenders come out
looking similar, at least one persona was written too weakly — go back and
sharpen its worldview until it disagrees.

Each persona both COMPETES and JUDGES. It builds one contender, and it scores
the other six. It is recused from scoring its own.

──────────────────────────────────────────
P1 — THE CONVERSION SURGEON
Skills: icopywriting, icro
Worldview: A landing page has one job and everything that does not serve it is
theft. Structure is belief → mechanism → proof → offer → risk reversal. Calm is
fine; vague is death. The visitor is not browsing, they are deciding.
Values: a single dominant belief, a named mechanism, specificity over adjectives,
one unmissable action, friction removed at the exact moment of doubt.
Distrusts: hedging that dissolves the promise, "learn more", pages that explain
before they hook, anything that requires the visitor to assemble the argument.
Kills a contender for: no clear belief, buried offer, more than one competing CTA
weight, proof that proves nothing.

──────────────────────────────────────────
P2 — THE RESTRAINT ARCHITECT
Skills: apple-design, impeccable
Worldview: The page is too loud and too long. Deference: the interface recedes,
the content leads. Most sections are there to reassure the team, not the user.
Typography and space do the work that decoration is currently attempting.
Values: optical typography (real tracking, real leading, size for reading not
for hierarchy theater), fewer elements at larger scale, one idea per viewport,
whitespace as structure, an honest visual hierarchy that survives squint-testing.
Distrusts: card mosaics, section proliferation, borders doing a job spacing
should do, feature grids, anything three-up because three-up fills a row.
Kills a contender for: more than one idea competing per viewport, decoration
without function, or a page that cannot be read at arm's length.

──────────────────────────────────────────
P3 — THE DESIGN ENGINEER
Skills: emil-design-eng, taste-skill
Worldview: Quality lives in details nobody consciously notices. Whether this
page feels expensive or feels generated is decided by twenty invisible choices:
the exact border weight, whether the hairline lands on a pixel, how the CTA
responds to a press, whether the phone mockup reads as real product or as a
stock frame, whether the transitions are timed to the hand or to a default.
Values: motion that earns its place and is interruptible, real pressed states,
optical alignment over mathematical alignment, components with one implementation,
the feel of the first 200ms.
Distrusts: default easing, `transition: all`, animation as garnish, mockups that
lie about the product, systems that look right in Figma and wrong in a browser.
Kills a contender for: craft that stops at the spec, unspecified interaction
states, or motion added because the page felt static.

──────────────────────────────────────────
P4 — THE CLINICAL TRUST OFFICER
Sources: docs/safety/claims-boundary.md, tone-uncertainty-policy.md, evidence-pack.md
Worldview: This audience has been burned by health apps that over-claimed. For
them, honesty is not a compliance tax — it IS the conversion mechanism. The
page's competitive advantage is that it says "we're unsure" when it is unsure,
and every competitor is structurally unable to say that. The claims boundary is
not a cage; it is the product's sharpest edge, and the page is currently
under-using it.
Values: precise scope ("prediabetes only, A1C 5.7–6.4%" as a feature, not a
disclaimer), stated limits shown early rather than buried, uncertainty expressed
as competence, proof that is checkable.
Distrusts: outcome language, implied personalization, "clinically" anything,
numbers without provenance, warmth used to smuggle a claim past the reader.
Kills a contender for: any hard-rail breach, any claim that cannot be traced to
the evidence pack, or a page that treats honesty as fine print.

──────────────────────────────────────────
P5 — THE LEGIBILITY REALIST
Skills: iui-ux-pro-max
Worldview: Every other persona is designing for a 27-inch display and a 32-year-
old retina. The real session is a 54-year-old, one-handed, on a 375px phone,
possibly in bright light, possibly with reading glasses somewhere else in the
house. Anything that fails there fails, full stop.
Values: the 16px floor and generous line-height, thumb-reachable actions, tap
targets with real spacing between them, contrast measured not assumed, a reading
level that does not require re-reading, structure that survives screen-reader
linearization, headings that are navigable, lists that are real lists.
Distrusts: fluid type that collapses at the small end, two-column layouts that
reflow into nonsense, hover-dependent affordances, thin weights, low-contrast
"elegance", copy written at a graduate reading level.
Kills a contender for: anything unusable at 375px, any AA failure, any
information conveyed by color or hover alone, or a scroll depth that buries the
action past a realistic attention budget.

──────────────────────────────────────────
P6 — THE ANXIOUS PATIENT
Source: docs/ICP.md, PRODUCT.md §Users
Worldview: I am not analyzing your page. I am reacting to it. I was told three
months ago that my body is going wrong and nobody explained what to do. I do not
want a system. I do not want to become a person who tracks things. I want to know
if I can eat the pasta.
Values: being told what I CAN eat before what I can't. Being spoken to like an
adult who is scared, not a patient or a user. Small commitments. The sense that
this was built for exactly my situation and not for dieters. Permission.
Distrusts: anything that smells like a diet app, anything that implies I failed,
enthusiasm, exclamation marks, before/after energy, "journey" language that
implies work, and any page that makes me feel worse at the end than the start.
Kills a contender for: restriction-first framing, shame, hype, jargon, or asking
for effort before giving relief. This persona does not score on craft — it scores
on how it feels to be this person reading this page.

──────────────────────────────────────────
P7 — THE ADVERSARIAL KILLER
Worldview: Assume every contender is mediocre until it survives attack. Most
"design work" is pattern-matching to what other products did, dressed up as
principle. The default outcome of this tournament is seven variations of the
same generated-looking page, and my job is to make that impossible.
Values: ideas that could only exist for THIS product, structural risk that pays
off, arguments that survive being pushed on.
Distrusts: everything. Especially: eyebrow-headline-subhead-CTA stacks,
three-up feature grids, "How it works" in three numbered steps, icon-in-circle
rows, gradient anything, FAQ accordions used as a landfill, phone mockups in
bezels, testimonial-shaped holes, and any section whose headline could be moved
to a different company's site without editing.
Kills a contender for: genericness, unearned complexity, borrowed structure,
hidden assumptions, or being safe. This persona is required to kill at least one
contender outright and to name the single weakest idea in every surviving one.
──────────────────────────────────────────

For each persona, before it builds, state in its own voice: its theory of why
the current page fails, and the one bet it is making.

════════════════════════════════════════════════════════════
PHASE 5 — BUILD SEVEN CONTENDERS
════════════════════════════════════════════════════════════

Each persona produces ONE complete contender. Not a critique of the incumbent —
a full alternative page. Contenders must be genuinely different from each other
in structure, not just in wording.

Each contender must be delivered in this exact structure:

1. **Name and one-sentence thesis.**
2. **The bet.** What this contender is wagering, and what it sacrifices to make
   that wager.
3. **Section map.** Ordered list of sections, each with: purpose, plane
   (`.landing-sheet` / tint band / page background / something new you are
   proposing), and approximate viewport share. State the total: how many
   sections, and how many screens of scroll on a 375px phone.
4. **Full copy deck.** Verbatim, ship-ready. Every headline, lede, body line,
   list item, button label, caption, microcopy string, and FAQ entry. Not
   "a headline about honesty" — the actual headline. Placeholder copy is a
   forfeit.
5. **Hero specification.** Eyebrow (or the argument for not having one), H1,
   sub, CTA label, CTA caption, trust strip, and what occupies the visual half.
   Justify the phone mockup's presence or replace it.
6. **The proof strategy.** Given that fabricated proof is banned and this
   product has no testimonials, what makes this page believable? Name the
   mechanism.
7. **Visual system deltas.** Every departure from current `DESIGN.md`: type
   scale, weights, color usage, radius, borders, shadow, spacing rhythm,
   planes. Each delta needs a one-line justification. "No delta" is a legitimate
   and defensible answer — say so explicitly if that is the position.
8. **Motion specification.** What moves, when, for how long, with what easing,
   and why it earns its place. `prefers-reduced-motion` behavior stated. "Nothing
   moves" is a legitimate answer if defended.
9. **The 375px story.** How this reads on the real device: what is above the
   fold, what the thumb can reach, the total scroll to the primary action.
10. **Hard-rail self-audit.** Walk all 15 rails and state compliance for each.
    A contender that skips this is disqualified before scoring.
11. **What this contender steals from the incumbent, and why that part is good.**
12. **Primary failure mode.** The most likely way this page fails in the real
    world, stated by its own author.

════════════════════════════════════════════════════════════
PHASE 6 — CROSS-SCORING
════════════════════════════════════════════════════════════

Every persona scores every contender except its own. That is 7 × 6 = 42
scorecards. Do not skip any; do not average them away.

Score each of these ten dimensions 1–10, with a one-line concrete justification
per dimension. Weights in brackets sum to 100.

 1. **Category clarity [12]** — can the visitor answer "what is this and is it
    for me" within five seconds and without scrolling?
 2. **Belief shift [14]** — does it move the visitor from "I should probably eat
    better" to "this specific thing answers my specific problem"?
 3. **Honesty and claim safety [12]** — every claim traceable, limits stated
    early, uncertainty used as strength, zero rail pressure.
 4. **Voice fidelity [10]** — permission-first, calm, candid, steady. Sounds
    like Revora and like a person, not like a landing page.
 5. **Legibility and accessibility [12]** — real usability for a 54-year-old on
    a 375px phone. AA, 16px floor, 44px targets, one-handed reach.
 6. **Craft and non-genericness [12]** — could this page exist only for this
    product? Would a designer notice the details? Anti-slop.
 7. **Information architecture [8]** — scroll economy, sequence logic, nothing
    duplicated, each section earning its viewport.
 8. **Emotional fit [10]** — does an anxious person feel better at the end than
    at the start, without being lied to?
 9. **Implementation realism [6]** — buildable against the existing token system
    and component vocabulary without a rewrite of `globals.css`.
10. **Durability as source of truth [4]** — will this still be right in six
    months, and does it generalize to the next surface?

Rules for scoring:
- Do NOT be nice. A 7 is a good page. A 9 is rare. A 10 must be argued for.
- Disagreement between personas is the point. Where two personas differ by 3+
  points on the same dimension, surface the conflict explicitly and state which
  one is right and why.
- Each persona must score IN CHARACTER. The Anxious Patient does not suddenly
  care about token systems. The Adversarial Killer does not hand out 8s.
- No self-scoring. No reciprocal inflation.

Verdict per scorecard: STRONG / CONDITIONAL / WEAK / KILL.

Deliver: a full 7×7 matrix of weighted totals (diagonal blank), plus the 42
justifications in a readable form.

════════════════════════════════════════════════════════════
PHASE 7 — THE KILL ROUND
════════════════════════════════════════════════════════════

1. Rank all seven contenders by weighted mean score.
2. Kill the bottom three explicitly. For each: name it, state the score, and
   give the specific reason it lost — not "it was weaker" but the exact
   structural or copy decision that ended it.
3. Name the common failure traits shared by the dead. These become anti-patterns
   in the final `DESIGN.md`.
4. From each dead contender, extract its ONE best organ — the single idea worth
   transplanting — and say which surviving contender should receive it.
5. Name every idea that appeared independently in three or more contenders.
   Convergence across seven different worldviews is the strongest signal in this
   whole process. Treat those ideas as near-certainly correct and say so.
6. Name every idea that exactly one persona proposed but that scored highly with
   the others. Those are the non-obvious wins.

════════════════════════════════════════════════════════════
PHASE 8 — SYNTHESIS
════════════════════════════════════════════════════════════

Build ONE winning page. Not a compromise, not an average — a page with a spine,
built on the strongest contender's structure, with the best organs of the others
grafted in where they genuinely improve it.

State plainly:
- which contender is the spine and why
- every graft: what came from where, and what it displaced
- every idea deliberately rejected in synthesis despite scoring well, with the
  reason

Then deliver the winner in the full Phase 5 twelve-part structure, at ship
quality. The copy deck must be verbatim, complete, and ready to paste. Every
number must come from the live values extracted in Phase 0C.

════════════════════════════════════════════════════════════
PHASE 9 — RED-TEAM THE WINNER
════════════════════════════════════════════════════════════

The Adversarial Killer (P7), the Clinical Trust Officer (P4), and the Anxious
Patient (P6) attack the synthesized page. They are not permitted to approve it
easily.

- P7: what is the most generic thing that survived synthesis? What is the
  weakest section? If this page were on Product Hunt tomorrow, what would the
  top comment be?
- P4: walk all 15 hard rails line by line against the final copy deck. Any
  pressure at all — name it. Then check every claim against
  `docs/safety/evidence-pack.md` and every string against
  `docs/safety/copy-ledger.md`. Flag anything that needs a new ledger row.
- P6: read the page as the visitor. Where do I feel judged? Where do I feel
  managed? Where do I stop reading? Do I feel better or worse than when I
  arrived?

Fix what they find, in place, and show the fixes. If a finding cannot be fixed
without breaking the page, say so and record it as a known trade-off.

════════════════════════════════════════════════════════════
PHASE 10 — DELIVERABLES
════════════════════════════════════════════════════════════

Produce these three artifacts. Write them as files.

**A. `docs/plans/landing-tournament-winner-spec.md`**
The build-ready spec: the winning page in full, section by section, with the
verbatim copy deck, the visual specification, the motion specification, the
375px behavior, and the interaction states. Specific enough that an engineer
implements it without asking a question. Ban vague phrases — "generous
spacing", "clean layout", "strong hierarchy", "modern feel" are forfeits. Say
`padding: clamp(52px, 7vw, 104px)`, say `17px / 1.65`, say which token.

**B. `DESIGN.md` (rewritten)**
Not amended — rewritten, carrying forward the Phase 3 verdicts. Requirements:
- every surviving rule states its derivation in one sentence; a rule that cannot
  justify itself does not survive
- scar-tissue rules are rewritten as rules, not incident reports; where the real
  enforcement is a test, say so and name the test file instead of retelling the
  incident
- accidents are gone
- the anti-patterns from Phase 7.3 become an explicit banned list
- the file must be shorter and more load-bearing than the 361-line original;
  report the before/after line count and what was cut
- it must still be a design SYSTEM, not just landing rules — the app shell,
  tokens, motion, icons, and voice sections carry forward, re-derived

**C. `docs/plans/landing-tournament-implementation-plan.md`**
The path from here to shipped:
- a section-by-section diff plan against the current `app/page.tsx`, with line
  ranges
- the `.landing-*` CSS changes required in `app/globals.css`
- which existing tests will break and why: `landing-wiring-pins.test.ts`,
  `landing-paywall-copy.test.ts`, `claims-boundary-copy.test.ts`,
  `copy-pins.test.ts`, `disclaimer-presence.test.ts`, `forbidden-claims.test.ts`
- which new copy strings need `docs/safety/copy-ledger.md` rows before they ship
- ordered work items, smallest shippable first, each independently revertible
- what must NOT change, and the test that will catch it if someone tries

════════════════════════════════════════════════════════════
OUTPUT ORDER
════════════════════════════════════════════════════════════

SECTION 1  — Incumbent Inventory (11 sections)
SECTION 2  — Constraint Ledger
SECTION 3  — Live Fact Extraction
SECTION 4  — Forensic Teardown + Teardown Table
SECTION 5  — The Brief (the job the page is hired for)
SECTION 6  — DESIGN.md Verdict Table
SECTION 7  — The Seven Personas (worldview + theory + bet)
SECTION 8  — Seven Contenders, in full
SECTION 9  — Cross-Scoring Matrix + 42 Scorecards
SECTION 10 — Conflicts Between Personas, Resolved
SECTION 11 — Kill Round: the dead, why, and their transplanted organs
SECTION 12 — Convergence Findings (ideas 3+ personas reached independently)
SECTION 13 — The Synthesized Winner, in full
SECTION 14 — Red-Team Findings and Fixes
SECTION 15 — Deliverable A: Winner Spec
SECTION 16 — Deliverable B: Rewritten DESIGN.md
SECTION 17 — Deliverable C: Implementation Plan
SECTION 18 — Decision Memo

REQUIRED TABLES:
1. Teardown Table (11 sections, ranked)
2. DESIGN.md Verdict Table (every rule)
3. Contender Summary Table (7 contenders, thesis, bet, section count, scroll depth)
4. Full 7×7 Cross-Scoring Matrix
5. Per-dimension Winner Table (which contender won each of the 10 dimensions)
6. Final Ranked Scoreboard with verdicts

════════════════════════════════════════════════════════════
DECISION MEMO — SECTION 18
════════════════════════════════════════════════════════════

Close with a memo the owner can act on:
- Which contender won, and the one sentence that explains why.
- What the tournament proved that was NOT obvious beforehand.
- What the tournament proved that the current page already had right — be
  specific and generous here; a process that finds everything wrong is a process
  that flatters itself.
- The three highest-leverage changes, ranked by impact-per-hour.
- What in `DESIGN.md` was scar tissue and should never have been a design rule.
- The single biggest risk in shipping the winner.
- What you would need to learn from real visitors to settle the questions this
  tournament could NOT settle from first principles. Be honest about which
  disagreements are genuinely empirical.

════════════════════════════════════════════════════════════
BEHAVIOR REQUIREMENTS
════════════════════════════════════════════════════════════

- Be brutally honest. Comparative, not descriptive.
- Read the files. Quote them. Never assert what the code says from memory.
- Write real copy. Every placeholder is a forfeit.
- Kill aggressively. Fewer strong ideas beat many weak ones.
- Do not force diversity in the winner. If one contender dominates, say so and
  graft sparingly.
- If most of the current page is actually fine, say that directly. A tournament
  that manufactures change to justify itself is worse than no tournament.
- If a hard rail makes a genuinely better page impossible, do not breach it —
  document the trade-off in the memo and let the owner decide.
- Never fabricate proof, ratings, users, or outcomes. This is a health product
  for frightened people. The honesty is the product.
```

---

## Operator notes

**Before you run it**

- Run it on a clean branch. The tournament writes three files and rewrites
  `DESIGN.md`; you want a trivial revert.
- `DESIGN.md` gets replaced, not patched. Keep the current version reachable
  (`git show HEAD:DESIGN.md`) so you can diff the rewrite against it.
- Have `npm test` green first, so Phase 10C's "which tests break" is a real
  prediction rather than noise.

**Scope choices baked in, and how to change them**

- Landing `/` only. To widen, extend the SCOPE block — but seven personas across
  five surfaces produces seven shallow opinions instead of seven deep ones.
- Paper contenders, not coded ones. If you want live variants, replace Phase 5's
  deliverable with "ship each contender as a real route under `/lab/v1..v7` in a
  git worktree" and let judges score screenshots. Much slower, much more honest.
- `DESIGN.md` is a defendant (Phase 3). If you'd rather it stay authoritative,
  delete Phase 3 and move the design system into the hard rails — but then the
  tournament can only rearrange the existing page, which is a smaller question
  than the one you asked.

**The two levers most worth tuning**

- *Rail 14* (light surface, no dark bands) is currently immutable because it was
  an owner instruction. If you want the tournament to genuinely re-litigate the
  page's visual identity, move it into Phase 3's CONTESTED bucket instead. That
  is the single change that most widens the design space.
- *The scoring weights.* As written, Belief shift [14] + Category clarity [12]
  make this a conversion tournament with a craft floor. Swap to Craft [16] +
  Emotional fit [14] and you will get a different winner. Decide which one you
  actually want before running, not after seeing the result.

**Interpretation flagged for you**

You asked for "claude design" as a skill. The closest matches installed here are
`.claude/skills/apple-design` and `.claude/skills/emil-design-eng` (plus the
animation set), so the prompt names those explicitly rather than a skill by that
name. If you meant something else, edit the SKILLS block.

**If the run is too long for one session**

Split at the phase boundaries: Phases 0–3 in one session (write the output to
`docs/plans/landing-tournament-phase-0-3.md`), Phases 4–7 in a second seeded
with that file, Phases 8–10 in a third. The contenders are the expensive part;
everything before them is reusable across re-runs.
