# Revora Landing Tournament — Phase 6

**Sections 9 and 10 of 18.** Continues `docs/plans/landing-tournament-phases-4-5.md`.
Phases 0–5 (Sections 1–8) are complete and are not re-derived here.

**Status:** 42 cross-scorecards written. Full 7×7 matrix computed. Every 3-point
disagreement surfaced and ruled. **The kill round (Phase 7) has not begun.**

**Date:** 2026-08-04 · **Branch:** `fix/landing-followups` · **Files changed:** this one only.
No code touched. `npm test` still not run.

---

## The weights — owner decision, taken before any card was written

The owner was asked once, before scoring, and chose the **Craft 16 + Emotional fit 14**
rebalance over the weights as written. That is the tournament's constitution from here on.

| # | Dimension | Weight | Δ from the as-written weights |
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
| | | **100** | |

**Scoring scale.** 1–10 per dimension. Weighted total = Σ(score × weight) ÷ 10, which puts
every card on a 0–100 scale where a page scoring a flat 7 across all ten dimensions lands on
70.0. A 7 is a good page. A 9 is rare and is marked as such in the justification. A 10 must
be argued for — exactly one was awarded in 420 dimension scores.

**Verdict bands.** STRONG ≥ 71.0 · CONDITIONAL 62.0–70.9 · WEAK 55.0–61.9 · KILL < 55.0.
A judge may override the band upward or downward when it is registering a *disqualifying
defect* rather than a low total; one card does so and it is flagged.

**Method.** Seven personas × six contenders, no self-scoring, 42 cards, 420 dimension
scores, one concrete one-line justification each. The seven binding skills — `impeccable`,
`iui-ux-pro-max`, `taste-skill`, `apple-design`, `emil-design-eng`, `icopywriting`, `icro` —
were loaded and held before the first card. Where a contender violates the standard of the
skill its own author is built on, the score says so.

---

# SECTION 9 — The 42 Cross-Scorecards

Grouped by judge, because scoring in character means holding one worldview across six pages
rather than six worldviews across one.

---

## P1 — The Conversion Surgeon scores

*Skills held: `icopywriting`, `icro`. `icro` ranks value-proposition clarity as the
highest-impact dimension on any marketing page; that shows up in every D1 below.*

### P1 → C2 · **69.4** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 6 | `Is this one okay?` is the visitor's own sentence and it names no product; the category answer waits for the sub's second clause, which is one 5-second window too late. |
| Belief 12 | 6 | The five moves are in the right order, but the mechanism block ends with no action, so the page's strongest moment converts nobody. |
| Honesty 12 | 8 | The price paragraph states day 1, the trial, the day-5 email and the annual equivalent in one honest run with no tile doing persuasion work. |
| Voice 10 | 8 | One register from the H1 to the close, and the register is the reader's. |
| Legib 10 | 9 | The only contender whose primary action is fully visible at 375×667; 7.8 screens is the shortest page on the board. |
| Craft 16 | 6 | Two em dashes and one typeface are real decisions; an empty visual half is not a decision, and I do not award craft for absence. |
| IA 8 | 6 | Five blocks in a defensible order, but with the FAQ dissolved every objection is answered exactly once, in passing, with no fallback. |
| Emo 14 | 7 | Putting the visitor's own sentence in 3.6rem type is the most direct act of recognition in the tournament. |
| Impl 6 | 7 | Six Tier B retirements and two test files, on the smallest page here — the work is bounded even if it is broad. |
| Dur 2 | 6 | Nothing here dates, but nothing here defends a position either. |

### P1 → C3 · **71.0** · STRONG

| D | S | Why |
|---|---|---|
| Cat 10 | 6 | `This is the whole screen.` spends the headline on the object; the eyebrow is carrying the entire category load at 13px. |
| Belief 12 | 6 | It shows rather than argues, and a reader who does not already want this is not moved by a card being well made. |
| Honesty 12 | 9 | Rare. Every card renders in the live `.result-card` classes and the demo is pinned to real precheck output, so the page structurally cannot show what the product would not do. |
| Voice 10 | 7 | Consistent, but the deictic headline is a designer's sentence rather than a buyer's. |
| Legib 10 | 6 | 2,580px with no exit, sitting immediately after the block that convinces. |
| Craft 16 | 9 | Rare. 1.5px border on a device-pixel argument, 12px radius, 120ms press on pointer-down — this is the only contender that specified rather than gestured. |
| IA 8 | 6 | Six blocks in a clean order, undone by a mechanism block that deliberately refuses the reader an exit. |
| Emo 14 | 7 | A meal the reader is allowed to have is the first thing on the screen, and the caption names the absence of a correction. |
| Impl 6 | 6 | A radius change across the layer, a new `.landing .result-disclaimer` declaration, and an IntersectionObserver where there was none. |
| Dur 2 | 7 | A page made of the product's own component survives every copy change that does not touch the component. |

### P1 → C4 · **67.2** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 9 | Rare. Twelve words carry the category and the scope, and `icro`'s five-second test is passed before the sub loads. |
| Belief 12 | 7 | The four refusals are a genuine belief mechanism — a claim the reader can break is the strongest proof a testimonial-free product has — but the page never opens a gap for them to fill. |
| Honesty 12 | 10 | The only 10 in 420 scores, and it is argued: the boundary is the architecture rather than the fine print, the sources block survives when six contenders cut it, and `Revora cannot attach one` states a constraint instead of promising a behaviour. |
| Voice 10 | 6 | Declining the landing voice licence buys consistency and costs every warm sentence on the page. |
| Legib 10 | 7 | 1,820px worst desert and five exits, but blocks 2 and 3 are the most demanding prose in the tournament by their author's own admission. |
| Craft 16 | 6 | Three card families to say one thing, and the hero's central object is a three-row table. |
| IA 8 | 8 | Seven blocks, every one of which has a job, and the order is defensible from the first sentence. |
| Emo 14 | 3 | The pains list — the best prose in the repository — does not appear anywhere on this page, and a frightened reader is handed three educational definitions instead. |
| Impl 6 | 5 | Seven new ledger rows before this can ship. |
| Dur 2 | 8 | A page built on a claims boundary ages at the speed of the boundary, which is to say slowly. |

### P1 → C5 · **69.4** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 8 | Eyebrow, `What can I eat tonight?`, and the A1C range in the sub's first clause — nothing is ambiguous. |
| Belief 12 | 7 | The argument is the incumbent's, reordered and with the ranking finally rendered; better than what ships, not new. |
| Honesty 12 | 8 | Keeps every claim, retires the fewest pins, and adds coverage rather than editing it. |
| Voice 10 | 8 | The incumbent's voice, held, which is a compliment I do not extend to the incumbent's structure. |
| Legib 10 | 10 | Argued. 0px desert by construction, 48px targets with a 12px floor between them, specified landscape, tabular numerals, and it is the only contender that schedules a test for the rails it claims to pass. |
| Craft 16 | 4 | Nine blocks, four card families, an FAQ accordion, three price tiles, eight em dashes. The delta table's own answer to five of nine rows is "unchanged." |
| IA 8 | 8 | Nine blocks is more than I would ship, but the sequence is right and no screenful is a dead end. |
| Emo 14 | 5 | A bar that follows this reader for 7,900 pixels is structurally the page never letting the subject drop. |
| Impl 6 | 7 | Two Tier B retirements, most copy retained, two new tests. The cheapest contender to build. |
| Dur 2 | 7 | The reachability fix scales with any future page length, which is more than the copy can say. |

### P1 → C6 · **66.2** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 5 | A reader who bounces on `It's six o'clock, and you're looking at the plate.` learns nothing, and the only thing standing between them and confusion is a 13px eyebrow. |
| Belief 12 | 8 | The fourth objection is real, no research surfaces it, and this is the only page on the board that answers it. |
| Honesty 12 | 6 | Nothing over-claims and two candidate headlines were killed by their own author, but the page offers a cautious reader nothing to check. |
| Voice 10 | 9 | Rare. Second person held across 70% prose for 6,200px without slipping once into a marketing register. |
| Legib 10 | 8 | CTA at 620px, 62ch, 1.7 leading, paragraphs capped at four lines and 55 words. Somebody thought about the eyes. |
| Craft 16 | 6 | One plane, two cards, unchanged radius — the craft here is in the writing, and the writing is not what this dimension measures. |
| IA 8 | 3 | A visitor who arrives ready to buy has one nav link doing the work of an entire information architecture, and 4,300px of prose between them and a price. |
| Emo 14 | 9 | Rare. `We know why you are reading this paragraph carefully.` is the single best sentence any contender wrote and it is placed at the exact objection it defuses. |
| Impl 6 | 3 | Roughly ten new ledger rows, five Tier B retirements, and an entirely new voice to walk past the claims audit. |
| Dur 2 | 5 | Narrative pages date faster than argument pages because the narrative is a fashion and the argument is a fact. |

### P1 → C7 · **61.2** · WEAK

| D | S | Why |
|---|---|---|
| Cat 10 | 3 | The H1 is a sentence about somebody else's product, the eyebrow that would have fixed it in seven words was deleted on principle, and `icro` puts this at the top of the impact order for a reason. |
| Belief 12 | 9 | Rare. `Type "oatmeal" and see.` is a dare, and a dare costs the reader nothing and the claimant everything if it is false — that is the strongest proof available to a product with no testimonials. |
| Honesty 12 | 8 | It gave up the more persuasive version of its own central object rather than invent a competitor's output. |
| Voice 10 | 5 | The house register is permission-first and this page's register is argumentative. |
| Legib 10 | 5 | The page's one non-portable object is entirely below the fold on the device most of this traffic lands on. |
| Craft 16 | 8 | Radius 0, one card family, one typeface, rules instead of cards — a committed position rather than a subtraction. |
| IA 8 | 7 | Five blocks, clean order, and the only unsupported cut is the FAQ, which its author concedes. |
| Emo 14 | 4 | A page about what everyone else gets wrong, aimed at a reader whose stated need is to have their heart rate lowered. |
| Impl 6 | 4 | Eight new ledger rows, radius 0 across the `.landing-*` layer, and it retires `It asks before it guesses` as a literal string. |
| Dur 2 | 7 | The comparison is the only structure here that could not be regenerated from a template. |

---

## P2 — The Restraint Architect scores

*Skills held: `apple-design`, `impeccable`. `impeccable`'s absolute bans (identical card
grids, eyebrow-per-section, cards as the lazy answer) and `apple-design`'s deference
principle set the floor for every D6 below.*

### P2 → C1 · **69.4** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 8 | Eyebrow plus a two-clause headline that names the situation before it names the product. |
| Belief 12 | 7 | Five moves, six exits, and the mechanism finally has a block of its own instead of a cell in a grid. |
| Honesty 12 | 8 | Fifteen rails pass and it flags the proof-band deletion against itself rather than burying it. |
| Voice 10 | 7 | Steady, except where the offer block slips into sales register. |
| Legib 10 | 7 | 11.1 screens is a large improvement on 19.4 and still a large page. |
| Craft 16 | 5 | Its own delta table answers "unchanged" for radius, shadow, type pairing and padding, and the author writes that C1 is not a craft contender — a page that declines to decide is not restrained, it is unfinished. |
| IA 8 | 7 | The ordering is C1's real contribution and it is a genuine one. |
| Emo 14 | 7 | Moving the oatmeal card out of the hero and putting a permitted meal there is the best structural decision anyone made, and C1 made it first. |
| Impl 6 | 8 | Two Tier B retirements, near-zero ledger debt, and no new CSS system. |
| Dur 2 | 6 | The direct-response chassis will still work in three years and will still look like a chassis. |

### P2 → C3 · **77.6** · STRONG

| D | S | Why |
|---|---|---|
| Cat 10 | 7 | The headline points at the object rather than describing the page, which is deference doing the work an explanation usually does. |
| Belief 12 | 7 | Showing the artifact three times at three moments of doubt is a stronger argument than describing it nine ways, and it is still an argument made quietly. |
| Honesty 12 | 9 | Rare. The claim and the evidence are the same object: the card on the page is the card the product ships, in the same classes, in the same commit. |
| Voice 10 | 8 | The copy gets out of the way, which on this page is the point. |
| Legib 10 | 7 | 10.2 screens, one plane, one measure, and the card at 375px is 210px instead of 640px. |
| Craft 16 | 9 | Rare. White stops being a background and becomes a material that means "product"; 12px radius, 1.5px border and a 120ms pointer-down press are decisions with reasons attached, not preferences with adjectives attached. |
| IA 8 | 7 | Six blocks with whitespace doing the sectioning, exactly as `impeccable` says space should. |
| Emo 14 | 8 | The calmest fold in the tournament, and calm here is achieved rather than announced — the word does not appear once. |
| Impl 6 | 6 | The radius change touches the whole card layer and the disclaimer override sits one declaration from the 2026-07-29 incident. |
| Dur 2 | 8 | A page whose composition unit is a shipped component inherits the component's lifespan. |

### P2 → C4 · **61.4** · WEAK

| D | S | Why |
|---|---|---|
| Cat 10 | 9 | Rare. It shrinks its own market in the first sentence, which is the most confident thing any contender does. |
| Belief 12 | 6 | The refusals are persuasive and they arrive before the page has given the reader a reason to care what it refuses. |
| Honesty 12 | 9 | Rare. It keeps the block six others cut, and keeps the `Sources` label so the rail has something to bind to. |
| Voice 10 | 5 | Declining the voice licence is not restraint, it is abstention — the page is written in compliance register throughout. |
| Legib 10 | 7 | Definition rows single-column at every width is correct; 17px/1.7 in the demanding blocks is correct; the prose is still the densest here. |
| Craft 16 | 5 | Three card families, a 14/24px radius split, and a hero whose central object is a table. A system with two answers to one question is not a system. |
| IA 8 | 7 | Seven blocks, each with a job, but the order is argued from the product's needs rather than the reader's. |
| Emo 14 | 3 | Nothing in the first 3,300 pixels acknowledges that the reader is having a hard time. |
| Impl 6 | 5 | Seven new ledger rows. |
| Dur 2 | 8 | The most durable position on the board, and the least inviting one. |

### P2 → C5 · **61.0** · WEAK

| D | S | Why |
|---|---|---|
| Cat 10 | 8 | Clear, conventional, and it works. |
| Belief 12 | 6 | The incumbent's argument with the ranking rendered — an improvement, not a reframing. |
| Honesty 12 | 8 | Every claim kept and two rails finally given tests. |
| Voice 10 | 7 | Unchanged from the incumbent, which is the right call and not a contribution. |
| Legib 10 | 9 | Rare. It is the only contender that measured what it claims and the only one that specifies landscape. |
| Craft 16 | 3 | A fixed element occupying the bottom of the viewport for 7,900 pixels is the interface asserting itself continuously on a page whose product promise is calm — that is the opposite of deference, and four card families and nine blocks are the incumbent's disease treated with a splint. |
| IA 8 | 5 | Nine blocks is more page than this argument needs and the ranked list is a feature grid with numbers on it. |
| Emo 14 | 4 | The bar is present in the viewport while the reader is reading the cancellation paragraph. |
| Impl 6 | 8 | The cheapest and least disruptive contender to build. |
| Dur 2 | 5 | Sticky conversion furniture dates faster than anything else on a marketing page. |

### P2 → C6 · **69.6** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 5 | A scene-setting headline gives the reader no way to classify the page, and the eyebrow it pays for that with is 13px. |
| Belief 12 | 7 | Answering an objection nobody types into a search bar is a real insight and the page is built entirely on it. |
| Honesty 12 | 6 | Careful throughout, and it offers a sceptic nothing to verify. |
| Voice 10 | 9 | Rare. The register does not break once across six blocks, which is harder than any layout decision on this board. |
| Legib 10 | 8 | 62ch at 17/1.7 with capped paragraph lengths — the typography is doing the hierarchy exactly as it should. |
| Craft 16 | 7 | One plane, one scene, `clamp(72px, 10vw, 128px)` for prose that needs more air than card grids do. The restraint is real; it is also partly inherited from the format rather than designed into it. |
| IA 8 | 6 | Six moments rather than six sections is a coherent structure, and it has no entry point for a reader who is not reading. |
| Emo 14 | 9 | Rare. This is what deference is for: the interface recedes so completely that the reader is left alone with the content, and the content is kind. |
| Impl 6 | 4 | Ten new ledger rows and a voice the audit has never seen. |
| Dur 2 | 5 | Second person is a fashion cycle. |

### P2 → C7 · **61.0** · WEAK

| D | S | Why |
|---|---|---|
| Cat 10 | 3 | A setup headline that a bouncing reader never completes, with no eyebrow to catch them. |
| Belief 12 | 8 | The comparison is the sharpest single device in the tournament and it is made entirely of type. |
| Honesty 12 | 8 | Refusing to draw the competitor's card cost it the better version of its own argument, and it paid. |
| Voice 10 | 5 | Argumentative where the brand is permission-first. |
| Legib 10 | 6 | Radius 0 means every focus ring on the page now depends on a 2px offset holding against a 1px rule. |
| Craft 16 | 8 | The most committed visual position here — and it is a position rather than a subtraction, which is why it scores above my own instinct and below C3. |
| IA 8 | 7 | Five blocks, and the comparison genuinely is the page rather than a section of it. |
| Emo 14 | 4 | It argues at somebody who came here frightened. |
| Impl 6 | 4 | Eight ledger rows, radius 0 across the layer, a font removal, and the most ironic pin retirement in the tournament. |
| Dur 2 | 7 | Non-portable by construction, which is the whole bet. |

---

## P3 — The Design Engineer scores

*Skills held: `emil-design-eng`, `taste-skill`. Mechanical checks applied to every card:
em-dash count (`taste-skill` §9.G), eyebrow ratio (≤ ⌈sections ÷ 3⌉), hero stack ≤ 4 text
elements (§4.7), the div-based fake-screenshot ban (§4.8), and the animation-decision
framework (how often will the user see it, what is its purpose, what easing, how fast).*

### P3 → C1 · **68.6** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 8 | Seven words above the headline answer "what is this," and one eyebrow across eight sections is well inside the ratio. |
| Belief 12 | 7 | The mechanism gets a block, which is the fix, and the block is made entirely of paragraphs. |
| Honesty 12 | 8 | The Clear card demonstrates the constraint rather than asserting it, twice. |
| Voice 10 | 7 | Consistent. |
| Legib 10 | 7 | 1,460px worst desert, 52px targets, 8px minimum separation. |
| Craft 16 | 4 | "Unchanged. No delta." appears five times in its own visual-system table, the hero carries six text elements against `taste-skill`'s cap of four, and six em dashes survive. A contender that writes "C1 is not a craft contender" has told me what to score. |
| IA 8 | 8 | The ordering is right and I will say so plainly: this is the contribution and it is real. |
| Emo 14 | 7 | Permission before caution in the first screen. |
| Impl 6 | 8 | Almost nothing new to build. |
| Dur 2 | 6 | The chassis outlives the copy, for better and worse. |

### P3 → C2 · **65.6** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 6 | Four words that classify nothing until the sub arrives. |
| Belief 12 | 6 | The argument is intact and the page has no object to hang it on. |
| Honesty 12 | 8 | No boundary copy behind a `<details>` anywhere, which is stronger than what ships. |
| Voice 10 | 8 | One family, one size, one register. |
| Legib 10 | 9 | Rare. 17px/1.65 at 62ch with no text below 16px and no tracked-uppercase exception to police — the cleanest typographic system on the board. |
| Craft 16 | 4 | Two em dashes and killing the second family are real wins, and then `taste-skill` §4.8 is explicit that a pure-text page is not minimalism but incomplete work: C2's fold is the one place in this tournament where the product could have been shown and deliberately was not. "The visual half is empty, and that is the specification" is the sentence you write when you have nothing to put there. |
| IA 8 | 6 | Five blocks, and every objection answered exactly once. |
| Emo 14 | 7 | The H1 is the reader's sentence, and then the reader is handed a white screen. |
| Impl 6 | 6 | Six pins, two test files, a font and a preload removed, and a JSON-LD block that now asserts answers the page does not render. |
| Dur 2 | 6 | Nothing to date; nothing to defend. |

### P3 → C4 · **60.6** · WEAK

| D | S | Why |
|---|---|---|
| Cat 10 | 9 | Rare. Category and scope in one headline, zero eyebrows on the page. |
| Belief 12 | 6 | The refusals work; the order they arrive in does not. |
| Honesty 12 | 9 | Rare. The demo caption tells the reader the example is machine-verified against production, which is true and is a stronger trust move than any badge. |
| Voice 10 | 5 | Compliance register throughout. |
| Legib 10 | 7 | 17px/1.7 in the dense blocks and single-column definition rows at every width. |
| Craft 16 | 4 | A 14/24px radius split "because 14 is already on the scale" is a system giving two answers to one question, five em dashes survive, and the hero's central object is a three-row spec table — the exact shape `taste-skill` §4.9 names as the default reach. |
| IA 8 | 8 | Every block earns its place and the deserts are the second-shortest here. |
| Emo 14 | 3 | Nothing on this page is warm and nothing on this page is trying to be. |
| Impl 6 | 5 | Seven ledger rows. |
| Dur 2 | 8 | It will read the same in 2030. |

### P3 → C5 · **62.0** · WEAK

| D | S | Why |
|---|---|---|
| Cat 10 | 8 | Unambiguous. |
| Belief 12 | 6 | Rendering the ranking is genuinely smart and the list underneath it is still a list. |
| Honesty 12 | 8 | It adds tests where every other contender edits them. |
| Voice 10 | 7 | The incumbent's, held. |
| Legib 10 | 10 | Argued. Landscape specified, tabular numerals for the price column, the bar last in DOM order so tab reaches the footer first, the observer threshold reasoned, and the two unasserted rails finally scheduled. Nobody else measured anything. |
| Craft 16 | 3 | Eight em dashes, nine blocks, four card families, an FAQ accordion, three price tiles, and a numbered 1–6 list which is `impeccable`'s numbered-marker scaffold with the serial numbers filed off. Its one animation is a fixed bar sliding up, and by `emil-design-eng`'s first question — how often will the user see this — the answer is once, so it is the animation on this board with the weakest claim to existing. |
| IA 8 | 5 | The incumbent's shape with a splint on it. |
| Emo 14 | 4 | A persistent buy button is the pattern this audience learned to distrust. |
| Impl 6 | 8 | Cheapest to build by a distance. |
| Dur 2 | 5 | Conversion furniture dates. |

### P3 → C6 · **67.2** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 5 | The eyebrow is load-bearing at 13px, which is a structural problem dressed as a type choice. |
| Belief 12 | 7 | The objection is real and the page is built on it end to end. |
| Honesty 12 | 6 | Careful, and unverifiable. |
| Voice 10 | 9 | Rare. Six blocks of second person with no register break is a harder craft problem than any of the layout decisions I am scoring. |
| Legib 10 | 8 | 62ch, 1.7, `text-wrap: pretty`, paragraphs capped at four lines on mobile and 55 words anywhere. These are real typographic decisions and they are the right ones. |
| Craft 16 | 6 | Three em dashes and a genuine measure discipline, against one visual idea and 4,300px of prose around it. `taste-skill` §4.8 applies here as much as it does to C2, and C6 pays it down with two cards rather than zero. |
| IA 8 | 5 | Six moments is a structure; it is not a structure a scanner can enter. |
| Emo 14 | 9 | Rare. `Blank days are just blank.` was already the best sentence on the incumbent page and it was cell nine of nine; here it is a paragraph. |
| Impl 6 | 4 | Ten ledger rows. |
| Dur 2 | 5 | A format with a fashion cycle. |

### P3 → C7 · **63.8** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 3 | Zero eyebrows is the correct ratio and the wrong page to prove it on. |
| Belief 12 | 8 | The comparison is a device I have not seen on a health page and could not generate by default. |
| Honesty 12 | 9 | Rare. Refusing to draw the competitor's output is the div-based fake-screenshot ban applied before anyone invoked it, on the one asset where breaking it would have been most persuasive. It cost C7 the better version of its own object and it paid without being asked. |
| Voice 10 | 5 | Argumentative. |
| Legib 10 | 6 | The comparison stacks with the Revora column second at 375px, which the contender flags and does not solve. |
| Craft 16 | 9 | Rare. `border-top` on the block rather than an `<hr>` so the hairline snaps to the device grid, and a 2px focus offset because radius 0 changes what a ring has to clear — that pair is exactly the class of invisible correctness this dimension exists to measure, and no other contender produced one. Zero eyebrows, one card family, one typeface, four em dashes. |
| IA 8 | 7 | Five blocks and the central object is the page. |
| Emo 14 | 4 | Cold. |
| Impl 6 | 4 | Eight ledger rows and radius 0 across the layer. |
| Dur 2 | 7 | Non-portable, which is durability's only real form. |

---

## P4 — The Clinical Trust Officer scores

*Sources held: `claims-boundary.md`, `tone-uncertainty-policy.md`, `evidence-pack.md`,
`copy-ledger.md`. Every D3 below is scored against the rendered copy, not the intent, and
ledger debt is counted as a claim-safety cost rather than a scheduling one.*

### P4 → C1 · **68.4** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 8 | Scope in the sub's first clause and again in the FAQ; the reader learns the range twice before the offer. |
| Belief 12 | 7 | The mechanism block is the honest differentiator given the space it deserves. |
| Honesty 12 | 7 | Fifteen rails pass, and the research disclosure leaves the page while the fullest statement of the boundary sits inside a `<details>` in block 7. |
| Voice 10 | 7 | Steady. |
| Legib 10 | 7 | Adequate, and it declines to claim a pass it cannot assert on the 44px rail — I score honesty about coverage, not coverage. |
| Craft 16 | 5 | Nothing decided visually. |
| IA 8 | 8 | The boundary appears in three places at three depths, which is how a boundary should be distributed. |
| Emo 14 | 7 | Permission first. |
| Impl 6 | 7 | Zero to two new ledger rows — the second-lowest documentation debt on the board. |
| Dur 2 | 6 | Fine. |

### P4 → C2 · **65.0** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 5 | For an audience deciding whether a health tool is legitimate, a page that does not name its category above the fold is asking for a benefit of the doubt this audience does not extend. |
| Belief 12 | 6 | Honest and thin. |
| Honesty 12 | 7 | No boundary copy inside a disclosure anywhere is genuinely stronger than what ships; against it, the research disclosure is gone, the encryption and deletion promises are gone, and the FAQPage JSON-LD now asserts a visible-answer structure the page does not render — a schema honesty problem, not only an SEO one. |
| Voice 10 | 8 | One register. |
| Legib 10 | 9 | Rare. Nothing below 16px anywhere, one family, one measure. |
| Craft 16 | 6 | The subtraction is coherent even where I think it went one block too far. |
| IA 8 | 5 | Objections answered once each, in passing, with the accordion that used to catch them deleted. |
| Emo 14 | 7 | The reader's own sentence, said back. |
| Impl 6 | 5 | Six Tier B retirements across two test files, plus a new prose price row in both branches. |
| Dur 2 | 5 | A page with no evidence surface has nothing to update and nothing to point at. |

### P4 → C3 · **73.2** · STRONG

| D | S | Why |
|---|---|---|
| Cat 10 | 6 | The eyebrow carries it and the headline does not help. |
| Belief 12 | 7 | The artifact is the argument, which is the honest version of an argument. |
| Honesty 12 | 9 | Rare. The hero card is a real `.result-card`, so it inherits `DisclaimerLine` and carries the full boundary at the fold — no other contender gets the disclaimer that high without hand-writing it, and a disclaimer rendered by the component cannot drift out of sync with the product. |
| Voice 10 | 7 | Quiet and consistent. |
| Legib 10 | 7 | The `.landing .result-disclaimer` rule lifts the card's fineprint to 16px rather than letting the app's 14px leak onto a marketing surface, which is the right instinct correctly executed. |
| Craft 16 | 8 | Specified to a standard the rest of the board does not reach. |
| IA 8 | 6 | Six blocks, and the boundary appears twice rather than three times. |
| Emo 14 | 8 | Permission-first at the fold, and the caption names the absence rather than leaving the reader to notice it. |
| Impl 6 | 6 | One new `font-size` declaration is one declaration from the 2026-07-29 override-block incident and must be named in the plan, not discovered in review. |
| Dur 2 | 8 | Claims that render from the component cannot rot separately from it. |

### P4 → C5 · **63.8** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 8 | Scope stated early and repeated. |
| Belief 12 | 6 | Nothing new; nothing lost. |
| Honesty 12 | 8 | It keeps every claim, retires two pins, and is the only contender that schedules coverage for two rails that are currently held up by prose. Unasserted rails are how a claims boundary actually fails, and this is the only page that treats that as its problem. |
| Voice 10 | 7 | Unchanged. |
| Legib 10 | 9 | Rare. |
| Craft 16 | 4 | Nine blocks and four card families is more surface than this boundary needs to be restated across. |
| IA 8 | 6 | Correct order, too many stops. |
| Emo 14 | 4 | A persistent buy button on a page for people whose stated grievance is subscription apps. |
| Impl 6 | 8 | The lowest ledger debt on the board and the only contender that adds tests instead of editing them. |
| Dur 2 | 7 | Test coverage is the most durable thing anyone proposed. |

### P4 → C6 · **59.6** · WEAK

| D | S | Why |
|---|---|---|
| Cat 10 | 4 | A reader cannot tell what this is without reading a paragraph, and this audience has been trained not to. |
| Belief 12 | 6 | Sympathy moves people and it is not a reason to believe. |
| Honesty 12 | 3 | No evidence framing, no sources, no research disclosure, no `Hold off` demonstrated anywhere, and roughly ten new rows of voice copy walking into an audit fence. Two candidate headlines breached rails and were caught by their own author — good practice, and also a measure of how close this register runs to the line. This page is not dishonest; it is a page with nothing for an auditor to check. |
| Voice 10 | 8 | Excellent, and it is not the dimension that saves this. |
| Legib 10 | 8 | Well set. |
| Craft 16 | 6 | Restrained. |
| IA 8 | 5 | No entry point for a sceptic. |
| Emo 14 | 9 | Rare, and I am scoring it honestly against my own instincts. |
| Impl 6 | 3 | Ten ledger rows of new voice copy is the largest audit exposure any contender created. |
| Dur 2 | 4 | Unverifiable warmth has a short shelf life in this category. |

### P4 → C7 · **57.4** · WEAK

| D | S | Why |
|---|---|---|
| Cat 10 | 3 | The first thing this page establishes is a fact about somebody else. |
| Belief 12 | 8 | The dare is the strongest belief device on the board. |
| Honesty 12 | 6 | Rail 2 held under real pressure, which is worth a lot. Against it: an entire block headed `What every other food app does` asserting that competitors return confident answers they cannot support, plus `A confident wrong answer is worse than a question here`, is a comparative accuracy claim about unnamed third parties made on a health surface with no evidence behind it. It clears `claims-boundary-copy.test.ts` because that suite checks disease-outcome claims. Counsel is a different fence and this has not been past it. |
| Voice 10 | 5 | Argumentative. |
| Legib 10 | 6 | Adequate. |
| Craft 16 | 8 | Committed. |
| IA 8 | 6 | The FAQ deletion removes the page's last place to answer a question in full. |
| Emo 14 | 4 | Cold. |
| Impl 6 | 4 | Eight ledger rows, one of which needs a second read before it is written. |
| Dur 2 | 5 | A page built on a competitor comparison ages the day a competitor ships a clarifying question. |

---

## P5 — The Legibility Realist scores

*Skill held: `iui-ux-pro-max`. Priority order applied as written: accessibility, then touch
and interaction, then performance, then everything else. Every D5 below is scored at 375×667
one-handed, not at 1440.*

### P5 → C1 · **71.2** · STRONG

| D | S | Why |
|---|---|---|
| Cat 10 | 8 | Clear at a glance and clear at 200% zoom. |
| Belief 12 | 7 | The argument survives being skimmed, which is how it will be read. |
| Honesty 12 | 8 | Solid. |
| Voice 10 | 7 | Steady. |
| Legib 10 | 8 | 1,460px worst desert against the incumbent's 5,090, 52px CTAs with 24px of clear space, no two targets within 8px, and — the reason this is an 8 and not a 6 — it declines to claim a pass on the 44px rail and names the missing test instead of pretending it is covered. |
| Craft 16 | 5 | Nothing decided. |
| IA 8 | 8 | Eight blocks with an exit in almost every one. |
| Emo 14 | 7 | Permission first. |
| Impl 6 | 8 | Cheap. |
| Dur 2 | 6 | Fine. |

### P5 → C2 · **70.4** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 6 | Four words that need the sub to mean anything. |
| Belief 12 | 6 | Thin, and reachable. |
| Honesty 12 | 8 | Nothing behind a disclosure. |
| Voice 10 | 8 | One register. |
| Legib 10 | 9 | Rare. The only contender whose primary action is fully visible on a 375×667 device, 7.8 screens end to end, one typeface at 17/1.65, and no tracked-uppercase carve-out to police because there are no eyebrows. Held off 10 only by the deliberate 2,140px desert. |
| Craft 16 | 7 | Killing the second family and fixing the size instead is the correct diagnosis of a real problem — the variable that was wrong was size — and it removes a `@font-face` and a preload from the route, which is the only performance win any contender delivered. |
| IA 8 | 6 | Five blocks, one dead stretch. |
| Emo 14 | 7 | The reader's sentence. |
| Impl 6 | 6 | Two test files. |
| Dur 2 | 6 | Fine. |

### P5 → C3 · **69.2** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 6 | Eyebrow-dependent. |
| Belief 12 | 7 | Shown rather than told, which survives skimming. |
| Honesty 12 | 9 | Rare. Real component, real classes, real disclaimer. |
| Voice 10 | 7 | Quiet. |
| Legib 10 | 4 | 2,580px is the longest desert on this board, it sits immediately after the block that does the convincing, and the contender's own mitigation — dropping the observer threshold to 0.4 "otherwise on a small phone the sequence fires while the top of the card is already scrolled past" — is an admission that its centrepiece is taller than the phone it will be read on. This is the same defect as the incumbent's 5,090px, at half the size, introduced deliberately. |
| Craft 16 | 8 | The verdict `<article>` semantics and the 2px focus offset for the 12px radius are accessibility work, not decoration, and I score them here because they are craft that happens to be a11y. |
| IA 8 | 5 | One block is a dead end by design. |
| Emo 14 | 8 | Calm at the fold. |
| Impl 6 | 6 | A radius change and an observer. |
| Dur 2 | 7 | Component-bound. |

### P5 → C4 · **63.2** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 9 | Rare. Unmissable at any zoom level and it reads correctly out of context in a headings list. |
| Belief 12 | 6 | The refusals persuade a reader who got that far. |
| Honesty 12 | 9 | Rare. |
| Voice 10 | 5 | Cold. |
| Legib 10 | 8 | "Three rows of label/meaning/never-means side by side would be a table at 375px and C4 will not ship one" is the correct instinct stated correctly, and 17px/1.7 in the two demanding blocks is the right response to dense prose for this age band. It loses points for being the densest reading load here. |
| Craft 16 | 5 | Two radii. |
| IA 8 | 8 | 1,820px worst desert and five exits. |
| Emo 14 | 3 | Cold. |
| Impl 6 | 5 | Seven ledger rows. |
| Dur 2 | 8 | Durable. |

### P5 → C6 · **66.2** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 5 | Eyebrow-dependent at 13px, which is the one element on the page below the floor. |
| Belief 12 | 7 | It answers the question the reader actually has. |
| Honesty 12 | 6 | Careful. |
| Voice 10 | 8 | Excellent. |
| Legib 10 | 8 | CTA at 620px, 62ch, 1.7 leading, paragraphs capped at four lines and 55 words. That is somebody designing for the eyes I described. It stops at 8 because 4,300px of unbroken single-column prose is the heaviest reading load on this board for a 54-year-old standing in a kitchen. |
| Craft 16 | 6 | The typography is the craft here and it is genuinely good. |
| IA 8 | 5 | Nowhere to enter. |
| Emo 14 | 9 | Rare. |
| Impl 6 | 4 | Ten rows. |
| Dur 2 | 5 | Fashion. |

### P5 → C7 · **58.0** · WEAK

| D | S | Why |
|---|---|---|
| Cat 10 | 3 | Four lines of headline about another product, and nothing else, above the fold. |
| Belief 12 | 8 | Strong once you reach it. |
| Honesty 12 | 8 | Disciplined. |
| Voice 10 | 5 | Argumentative. |
| Legib 10 | 4 | The page's one non-portable object is entirely below the fold at 375px, the two columns stack with the Revora column second — which the contender flags as an unresolved conflict and does not resolve — and radius 0 puts every focus ring on the page one 2px offset away from disappearing into a 1px rule. Three separate 375px failures, one of them acknowledged. |
| Craft 16 | 8 | Committed and specified. |
| IA 8 | 6 | Clean, minus the FAQ. |
| Emo 14 | 4 | Cold. |
| Impl 6 | 4 | Eight rows and a layer-wide radius change. |
| Dur 2 | 6 | Non-portable. |

---

## P6 — The Anxious Patient scores

*Sources held: `docs/ICP.md`, `PRODUCT.md` §Users. Not analysing. Reacting.*

### P6 → C1 · **69.6** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 8 | I know what this is before I know what it costs. |
| Belief 12 | 7 | It says the thing about six months and I felt caught out, in the good way. |
| Honesty 12 | 7 | It tells me it will say when it is unsure, and then the trust line says it again. |
| Voice 10 | 7 | `You were told to eat better` is exactly right. `Try it before you pay a cent` is a sales page and I hear the difference. |
| Legib 10 | 7 | Long, but I never lost my place. |
| Craft 16 | 5 | It looks like a good version of a page I have seen before. |
| IA 8 | 7 | I could find things. |
| Emo 14 | 8 | It took the oatmeal out of my first screen and put a meal I am allowed to have there instead. That is the whole thing I came to say, and this page did it without me saying it. |
| Impl 6 | 8 | Not my department, and nothing here looks fragile. |
| Dur 2 | 6 | Fine. |

### P6 → C2 · **70.2** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 6 | I had to read a paragraph to be sure this was not a diet app. |
| Belief 12 | 7 | Four words of my own sentence did more than four paragraphs would have. |
| Honesty 12 | 7 | The price is written like a person telling me the price. |
| Voice 10 | 8 | It talks to me like an adult. |
| Legib 10 | 9 | Rare. I could read every word of this without my glasses and the button was already on the screen. |
| Craft 16 | 6 | Plain, which I like, up to the point where it becomes empty. |
| IA 8 | 6 | Short enough that I did not need to find anything. |
| Emo 14 | 8 | `Is this one okay?` is the sentence in my head at six o'clock and nobody has ever put it on a page. It loses a point because after asking my question the page shows me a white screen and a button, and I have been burned enough to want to see the thing before I press it. |
| Impl 6 | 6 | Fine. |
| Dur 2 | 6 | Fine. |

### P6 → C3 · **71.8** · STRONG

| D | S | Why |
|---|---|---|
| Cat 10 | 6 | The small line above the headline is doing all the work and it is very small. |
| Belief 12 | 7 | Showing me one card three times told me more than nine descriptions would. |
| Honesty 12 | 8 | The card has the disclaimer on it, on the card, not at the bottom of the page where you put things you hope I skip. |
| Voice 10 | 7 | It does not perform at me. |
| Legib 10 | 7 | Fine, and the long stretch in the middle made me wonder if I had reached the end. |
| Craft 16 | 8 | It feels made rather than assembled, and I cannot tell you why, which I think is the point. |
| IA 8 | 6 | Simple enough to hold in my head. |
| Emo 14 | 8 | The first thing on the screen is a meal I can have and a line telling me there is nothing else on the card. That is the sentence I needed. What I am unsure about is the half-second pause, because a delay is what my body reads as bad news — every time a screen has waited before answering me this year it was because the answer was not good. |
| Impl 6 | 6 | Not mine. |
| Dur 2 | 7 | Fine. |

### P6 → C4 · **55.8** · KILL *(band says WEAK; overridden by the judge)*

| D | S | Why |
|---|---|---|
| Cat 10 | 8 | I know exactly what this is and exactly who it is not for. |
| Belief 12 | 5 | I believe it. I do not want it. |
| Honesty 12 | 9 | Rare. This is the most honest page here and I want that on the record before the rest of this. |
| Voice 10 | 3 | This is not a voice. It is a form I have been handed. Every sentence is written by somebody protecting the company from me. |
| Legib 10 | 7 | Readable, and heavy. |
| Craft 16 | 5 | It looks like a policy. |
| IA 8 | 7 | Well organised, the way a leaflet is. |
| Emo 14 | 2 | The first sentence tells me this might not be for me. The second screen defines three categories I did not ask about. The third is a list of four things it will not do. I have spent three months being told what nobody can tell me and being handed ranges I do not understand, and this page is another appointment. I would close it before the refusals, and you would never know why. |
| Impl 6 | 5 | Not mine. |
| Dur 2 | 8 | It will be exactly this cold in five years. |

**Why KILL and not WEAK:** the total is inside the WEAK band, and the defect is not a
low total. This is the only page here that loses the reader in the first sentence, and there
is no smaller fix — warming block 1 is losing the bet. A page that fails at the fold fails
completely and silently, and the metric that would catch it does not exist.

### P6 → C5 · **62.2** · WEAK

| D | S | Why |
|---|---|---|
| Cat 10 | 8 | `What can I eat tonight?` is my question. |
| Belief 12 | 6 | It told me things I already believed. |
| Honesty 12 | 7 | Everything is stated, including the dates, which I did check. |
| Voice 10 | 7 | Fine. |
| Legib 10 | 9 | Rare. I never had to hunt for anything and everything was big enough. |
| Craft 16 | 4 | It looks like an app store page. |
| IA 8 | 6 | Long, and I could find things in it. |
| Emo 14 | 4 | The button follows me for the whole page. Every app that ever took money out of my account did that. The little line under it saying no card does not undo the fact that it is still sitting there while I am reading the paragraph about how to cancel. |
| Impl 6 | 8 | Not mine. |
| Dur 2 | 5 | Fine. |

### P6 → C7 · **52.6** · KILL

| D | S | Why |
|---|---|---|
| Cat 10 | 3 | I read four lines and learned something about an app I do not use. |
| Belief 12 | 7 | When I got to the question part I understood it immediately and I did think that was clever. |
| Honesty 12 | 7 | It did not make up a fake screenshot of the other app, which I noticed and respected. |
| Voice 10 | 4 | It is arguing with somebody and it is not me. |
| Legib 10 | 5 | The good part is on the second screen. |
| Craft 16 | 7 | It looks like nothing else, and that is not always a comfort. |
| IA 8 | 6 | Short. |
| Emo 14 | 3 | The first thing this page tells me is what a different app does wrong. I do not have a position in a fight between food apps. I have a plate, and it is getting cold, and this page wants me to care about somebody else's product first. |
| Impl 6 | 4 | Not mine. |
| Dur 2 | 6 | Fine. |

---

## P7 — The Adversarial Killer scores

*No skill; a standard. Every card asks one question first: change the logo, and does this
still work for a company that sells project management software? I am required to kill one
contender outright and I do.*

### P7 → C1 · **60.8** · WEAK

| D | S | Why |
|---|---|---|
| Cat 10 | 7 | The eyebrow is good and it is the incumbent's eyebrow. |
| Belief 12 | 6 | The argument is correct and I have read it four hundred times. |
| Honesty 12 | 7 | Clean. |
| Voice 10 | 6 | Slips into offer register at exactly the block where every page slips into offer register. |
| Legib 10 | 7 | Fine. |
| Craft 16 | 3 | This is the direct-response chassis, which is the most portable structure that has ever existed. Villain block, mechanism block, an objection block with the objection in quote marks as the headline, a three-tile offer, a four-row FAQ, a close. Change the logo and it sells a CRM tomorrow. Its own delta table says "unchanged" five times out of eight. |
| IA 8 | 8 | The ordering is right and I will say it once and not again. |
| Emo 14 | 6 | Warm enough, in a way that a template can be warm. |
| Impl 6 | 8 | Cheap, because it is the thing that already exists. |
| Dur 2 | 4 | Chassis pages are replaced by the next chassis. |

### P7 → C2 · **60.4** · WEAK

| D | S | Why |
|---|---|---|
| Cat 10 | 5 | Four words that could head a page about anything. |
| Belief 12 | 5 | Nothing here would survive contact with a competitor who tried. |
| Honesty 12 | 7 | Clean. |
| Voice 10 | 7 | Consistent. |
| Legib 10 | 8 | Short and readable. |
| Craft 16 | 6 | Killing the second typeface and landing on two em dashes are decisions and I credit both. An empty hero is not a decision; "the visual half is empty, and that is the specification" is what you write when there is nothing to put there. And five blocks of type on white is the single most reproducible page in this tournament — I can generate it, which is the whole test. |
| IA 8 | 5 | Five blocks, three objections answered once each. |
| Emo 14 | 6 | The headline is the reader's, and it is the only line here that is. |
| Impl 6 | 5 | Six pins across two files. |
| Dur 2 | 5 | Nothing to date and nothing to defend. |

### P7 → C3 · **68.2** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 6 | The headline is a designer's sentence. |
| Belief 12 | 6 | Showing beats describing and it is still not arguing. |
| Honesty 12 | 8 | Everything shown is the thing. |
| Voice 10 | 7 | Quiet. |
| Legib 10 | 6 | The long stretch is real. |
| Craft 16 | 8 | The composition unit is Revora's own artifact rendered in Revora's own classes, which means you cannot lift this page — the thing it is made of does not exist anywhere else. It is the only contender besides mine whose central object fails the change-the-logo test. I take a point back for the 520ms pause, which animates the claim instead of letting the reader test it: a scripted delay is a re-enactment, and a re-enactment is not evidence. |
| IA 8 | 6 | Six blocks, one of them a dead end. |
| Emo 14 | 7 | Calm without saying calm, which the incumbent could not manage in three attempts. |
| Impl 6 | 6 | A radius change and an observer. |
| Dur 2 | 7 | Bound to a component, which is the only durable binding on this board. |

### P7 → C4 · **60.4** · WEAK

| D | S | Why |
|---|---|---|
| Cat 10 | 8 | The headline shrinks the market, which is rare and which I will credit. |
| Belief 12 | 6 | The refusals are good and they are the third screen. |
| Honesty 12 | 9 | Rare. It kept the block six people cut because cutting it was easy. |
| Voice 10 | 5 | Compliance register. |
| Legib 10 | 7 | Fine. |
| Craft 16 | 5 | `Built for one number. If yours isn't in it, this isn't for you.` cannot be moved to another company and I have to give that. Everything under it can: definition rows, three price tiles, a five-row accordion, a sources block. The one non-portable thing on this page is the headline, and a headline is not a page. |
| IA 8 | 7 | Sound. |
| Emo 14 | 3 | Cold, and it knows. |
| Impl 6 | 5 | Seven rows. |
| Dur 2 | 8 | The most durable page here. |

### P7 → C5 · **54.8** · KILL

| D | S | Why |
|---|---|---|
| Cat 10 | 7 | Clear. |
| Belief 12 | 5 | It believes the incumbent's argument was fine, which is a position, and it is the position of not having one. |
| Honesty 12 | 7 | Clean, and the two new tests are the best thing on it. |
| Voice 10 | 6 | Unchanged. |
| Legib 10 | 9 | Rare, and it is measuring the one thing I am not scoring. |
| Craft 16 | 2 | Nine blocks, four card families, an FAQ accordion, three price tiles, a numbered 1–6 list, eight rendered em dashes, and a sticky mobile buy bar. Every structure on this page ships on a project-management site today, including the bar — especially the bar. It renamed the `Step N` eyebrows and kept the section. Its delta table's own entries are "unchanged," "unchanged," "unchanged," and a line-height bump. This is the incumbent with a conversion widget bolted to the bottom of the viewport, and the widget is the most generic object anyone proposed. |
| IA 8 | 5 | Nine blocks. |
| Emo 14 | 4 | The bar. |
| Impl 6 | 8 | Cheap, because there is almost nothing here. |
| Dur 2 | 4 | Sticky CTAs are a 2019 artifact having a long afternoon. |

**This is my mandated kill.** Not because it is the lowest total on my card — C7 would be if
I could score it — but because it is the only contender that took thirteen generic blocks,
kept nine of them, and called the result a redesign. Every other loser here lost by
attempting something. C5 measured the incumbent precisely and then declined to change it.

### P7 → C6 · **63.4** · CONDITIONAL

| D | S | Why |
|---|---|---|
| Cat 10 | 4 | A reader who bounces learns nothing, and the fix was seven words it declined to enlarge. |
| Belief 12 | 7 | The fourth objection is a real finding and nobody else in this room found it. |
| Honesty 12 | 5 | Nothing to check. |
| Voice 10 | 8 | It does not sound like a landing page, which is the highest compliment available from me. |
| Legib 10 | 8 | Well set. |
| Craft 16 | 7 | A page with no marketing sections at all is genuinely rare and I cannot name another product shipping one. What holds it at 7 is that the format is portable even though the content is not: "one evening, second person, start to finish" is a template, and I have read it on a mattress company's site and a therapy app's. |
| IA 8 | 4 | There is no way into this page except the top. |
| Emo 14 | 8 | It earns the register, and the register is the only thing here a competitor could not copy by Friday. |
| Impl 6 | 4 | Ten rows. |
| Dur 2 | 5 | Second person is a cycle. |

---

# The full 7×7 cross-scoring matrix

Weighted totals, 0–100. Diagonal blank (no self-scoring).

| Judge ↓ / Contender → | **C1** | **C2** | **C3** | **C4** | **C5** | **C6** | **C7** | judge mean |
|---|---|---|---|---|---|---|---|---|
| **P1** Conversion Surgeon | — | 69.4 | 71.0 | 67.2 | 69.4 | 66.2 | 61.2 | **67.40** |
| **P2** Restraint Architect | 69.4 | — | **77.6** | 61.4 | 61.0 | 69.6 | 61.0 | **66.67** |
| **P3** Design Engineer | 68.6 | 65.6 | — | 60.6 | 62.0 | 67.2 | 63.8 | **64.63** |
| **P4** Clinical Trust Officer | 68.4 | 65.0 | 73.2 | — | 63.8 | 59.6 | 57.4 | **64.57** |
| **P5** Legibility Realist | 71.2 | 70.4 | 69.2 | 63.2 | — | 66.2 | 58.0 | **66.37** |
| **P6** Anxious Patient | 69.6 | 70.2 | 71.8 | 55.8 | 62.2 | — | **52.6** | **63.70** |
| **P7** Adversarial Killer | 60.8 | 60.4 | 68.2 | 60.4 | 54.8 | 63.4 | — | **61.33** |
| **contender mean** | **68.00** | **66.83** | **71.83** | **61.43** | **62.20** | **65.37** | **59.00** | |

**Reading the margins.** P7 is the harshest judge at 61.33 and P1 the most generous at
67.40, both in character. P6 is second-harshest at 63.70 — not because the Anxious Patient
is severe in general, but because two of its six cards are kills. No judge's mean sits more
than 6.1 points from any other, which means the spread between contenders is a real signal
rather than an artifact of who happened to score whom.

**Extremes.** Highest card in the tournament: **P2 → C3, 77.6.** Lowest: **P6 → C7, 52.6.**
Only five cards out of 42 cleared STRONG, and four of the five are C3.

---

# Per-dimension winner table

Mean score across each contender's six judges. Winner in bold.

| # | Dimension | W | C1 | C2 | C3 | C4 | C5 | C6 | C7 | Winner |
|---|---|---|---|---|---|---|---|---|---|---|
| D1 | Category clarity | 10 | 7.83 | 5.67 | 6.17 | **8.67** | 7.83 | 4.67 | 3.00 | **C4** |
| D2 | Belief shift | 12 | 6.83 | 6.00 | 6.67 | 6.00 | 6.00 | 7.00 | **8.00** | **C7** |
| D3 | Honesty & claim safety | 12 | 7.50 | 7.50 | 8.67 | **9.17** | 7.67 | 5.33 | 7.67 | **C4** |
| D4 | Voice fidelity | 10 | 6.83 | 7.83 | 7.17 | 4.83 | 7.00 | **8.50** | 4.83 | **C6** |
| D5 | Legibility & a11y | 10 | 7.17 | 8.83 | 6.17 | 7.17 | **9.33** | 8.00 | 5.33 | **C5** |
| D6 | **Craft & non-genericness** | **16** | 4.50 | 5.83 | **8.33** | 5.00 | 3.33 | 6.33 | 8.00 | **C3** |
| D7 | Information architecture | 8 | **7.67** | 5.67 | 6.00 | 7.50 | 5.83 | 4.67 | 6.50 | **C1** |
| D8 | **Emotional fit** | **14** | 7.00 | 7.00 | 7.67 | 2.83 | 4.17 | **8.83** | 3.83 | **C6** |
| D9 | Implementation realism | 6 | **7.83** | 5.83 | 6.00 | 5.00 | **7.83** | 3.67 | 4.00 | **C1 / C5** |
| D10 | Durability | 2 | 5.67 | 5.67 | 7.33 | **8.00** | 5.50 | 4.83 | 6.33 | **C4** |

## Ranked scoreboard

| Rank | Contender | Weighted mean | Dimensions won | STRONG cards | KILL cards |
|---|---|---|---|---|---|
| **1** | **C3 — One Card Back** | **71.83** | 1 (Craft, w16) | **4 of 6** | 0 |
| 2 | C1 — The Six-Month Gap | 68.00 | 2 (IA, Impl½) | 1 of 6 | 0 |
| 3 | C2 — Is This One Okay? | 66.83 | 0 | 0 of 6 | 0 |
| 4 | C6 — Tonight | 65.37 | 2 (Voice, Emotional fit w14) | 0 of 6 | 0 |
| 5 | C5 — Within Reach | 62.20 | 2 (Legibility, Impl½) | 0 of 6 | 1 (P7) |
| 6 | C4 — Built for One Number | 61.43 | 3 (Category, Honesty, Durability) | 0 of 6 | 1 (P6) |
| 7 | C7 — It Asks First | 59.00 | 1 (Belief shift, w12) | 0 of 6 | 1 (P6) |

**Verdicts on this table are provisional.** Phase 7 owns the kill round; the ranking above is
the input to it, not the output of it.

### Four results that are not obvious from the ranking

**1. The winner leads exactly one dimension, and wins because of the weight on it.**
C3 tops only Craft. It is runner-up in Honesty (8.67 to C4's 9.17) and runner-up in
Emotional fit (7.67 to C6's 8.83), and beats nothing else. Under the as-written weights
C3 would have finished around fourth. The owner's rebalance did not tilt a close race; it
selected a different winner. That should be stated plainly in Phase 7 rather than discovered
in Phase 8.

**2. C4 wins three dimensions and finishes sixth.** Category clarity, Honesty and
Durability — 24 points of weight — all go to C4, and it still loses, because it scores
**2.83 on a 14-weight dimension**. The most honest page in the tournament is sunk by a
single number. That is the clearest evidence the tournament produced that honesty and
warmth are being treated as separable on this page, and they are not.

**3. C6 wins the two dimensions the owner just made heavier and still finishes fourth.**
Voice (10) and Emotional fit (14) both go to C6, worth 24 points of weight, and it lands
4th because Category clarity 4.67, IA 4.67 and Implementation realism 3.67 are the three
lowest scores any contender posted outside C7's headline. The rebalance was supposed to
favour C6 and it did — it moved C6 from last-ish to fourth, not to first. **Craft 6.33 is
the number that stopped it**, and that is a finding about C6, not about the weights: a page
that wins on warmth still has to be built.

**4. C7 posts the highest single-dimension mean in the belief category and finishes last.**
8.00 on Belief shift, 8.00 on Craft, and **3.00 on Category clarity from six independent
judges who never conferred.** No other dimension score in this tournament is unanimous.

---

# SECTION 10 — Where the judges disagreed by 3 or more

Eight dimension scores drew a spread of 3+ points across the six judges of one contender.
Each is surfaced with a ruling. The ruling names which judge is right *about the thing that
dimension measures*, which is not the same as which judge is right about the page.

---

## Disagreement 1 — C2 · Craft · **P5 gives 7, P3 gives 4**

**P5:** "Killing the second family and fixing the size instead is the correct diagnosis of a
real problem, and it removes a `@font-face` and a preload from the route — the only
performance win any contender delivered."

**P3:** "`taste-skill` §4.8 is explicit that a pure-text page is not minimalism but
incomplete work, and C2's fold is the one place in this tournament where the product could
have been shown and deliberately was not."

**Ruling: P3 is right, and P5 has found something P3's rule does not cover.**
The two are not scoring the same object. P5 is scoring the *type system* — one family at
17px/1.65, no `@font-face`, no preload, no sub-16px text and no tracked-uppercase exception
to police. That is a genuine craft achievement and it is the best typographic decision any
contender made; P3's card does not mention it once, which is an omission. P3 is scoring the
*page*, and on the page the §4.8 finding holds: a hero with no visual is an absence, and the
contender's own defence — "the visual half is empty, and that is the specification" — is
the sentence that gives it away. **A 4 is too harsh and a 7 is too kind; the honest number
is 5–6, which is where the other four judges landed.** Phase 7 should carry the type
decision forward as an extractable organ regardless of what happens to C2, because it is
separable from the empty hero and nobody else proposed it except C7.

---

## Disagreement 2 — C3 · Legibility · **P2 gives 7, P5 gives 4**

**P2:** "10.2 screens, one plane, one measure, and the card at 375px is 210px instead of
640px."

**P5:** "2,580px is the longest desert on this board, it sits immediately after the block
that does the convincing, and the 0.4 observer threshold is an admission that the
centrepiece is taller than the phone."

**Ruling: P5 is right, and this is the winner's largest unresolved defect.**
P2 is scoring the reading experience, which is genuinely good. P5 is scoring the *action*
experience, which is the dimension's actual job — `iui-ux-pro-max` puts touch and
interaction second only to accessibility, above typography. The observer-threshold detail is
the decisive evidence: a contender does not have to drop a threshold from 0.5 to 0.4 unless
its block exceeds the viewport, and a block that exceeds the viewport with no exit in it is
the incumbent's 5,090px defect reproduced at half scale by choice. **P5's 4 stands.**
Phase 8 must resolve this before C3's spine ships: either the pause block earns an exit, or
the page carries a 2,580px stretch that the tournament's own diagnosis condemned.

---

## Disagreement 3 — C4 · Voice fidelity · **P1 gives 6, P6 gives 3**

**P1:** "Declining the landing voice licence buys consistency and costs every warm sentence
on the page."

**P6:** "This is not a voice. It is a form I have been handed. Every sentence is written by
somebody protecting the company from me."

**Ruling: P1 is right about the dimension; P6 is right about the page, and is scoring the
wrong box.** Voice fidelity measures whether the page holds a register consistent with the
product's documented voice. C4 does — it holds `claims-boundary.md`'s register with total
consistency, and it declared the licence refusal in advance rather than drifting into it. A
3 is a score for *incoherence*, and C4 is not incoherent; it is coherent in a register P6
finds intolerable. **The honest number is 5**, which is where P2, P3, P5 and P7 all landed.
P6's finding is real and belongs in Emotional fit, where P6 already scored it a 2 and where
the tournament's heaviest content weight sits. Double-counting it in Voice inflates a defect
that is already fully priced.

---

## Disagreement 4 — C5 · Information architecture · **P1 gives 8, P2/P3/P7 give 5**

**P1:** "Nine blocks is more than I would ship, but the sequence is right and no screenful
is a dead end."

**P2:** "Nine blocks is more page than this argument needs and the ranked list is a feature
grid with numbers on it."

**Ruling: P1 is right, and this is the cleanest case in the tournament of a defect being
scored in the wrong dimension.** Information architecture measures whether the page's
content is ordered and reachable. C5's order is correct — it is the only contender with a
0px desert, and reachability is the entire definition of good IA on a page this long. What
P2, P3 and P7 are objecting to is *quantity and genericness*, and both already have homes:
quantity in Craft, where all three scored C5 at 2–4, and genericness in Craft again, where
P7 gave it a 2. **P1's 8 is correct on the dimension as defined.** The consequence matters
for Phase 7: C5's structural contribution is being triple-counted as a negative, and its
one genuine organ — the 0px desert — should not be discarded with the page.

---

## Disagreement 5 — C5 · Durability · **P1/P4 give 7, P7 gives 4**

**P1/P4:** "The reachability fix scales with any future page length" · "Test coverage is
the most durable thing anyone proposed."

**P7:** "Sticky CTAs are a 2019 artifact having a long afternoon."

**Ruling: P4 is right and P7 is scoring a different object.** There are two durable things
in C5 and they have opposite lifespans. The **two scheduled tests** (44/48px targets,
`prefers-reduced-motion`) are the single most durable artifact any contender produced,
because a test outlives every design decision it protects — this is why the phases-4-5
handoff already ruled that Phase 10C adopts both regardless of who wins, and that ruling is
now independently confirmed by the scoring. The **sticky bar** is a pattern with a
visible expiry, and P7 is right about it. Because Durability carries a weight of 2, the
disagreement changes nothing in the ranking; it is surfaced because it identifies the one
thing that must survive C5's likely elimination. **Both numbers stand; they are measuring
different halves of the same contender.**

---

## Disagreement 6 — C6 · Honesty & claim safety · **P1/P2/P3/P5 give 6, P4 gives 3**

**Four judges:** "Nothing over-claims and two candidate headlines were killed by their own
author."

**P4:** "No evidence framing, no sources, no research disclosure, no `Hold off` demonstrated
anywhere, and roughly ten new rows of voice copy walking into an audit fence."

**Ruling: P4 is right, and the four are measuring absence of falsehood while P4 is measuring
presence of verifiability.** Both are legitimate readings of "honesty," and the rails
decide which one this dimension means. Rail 6 (statistics trace to the evidence pack), rail 7
(the proof band's left column is a label) and the `study-association` test family all exist
to govern *what a claim is grounded in*, not merely whether it is false. On that reading a
page with no evidence surface at all does not score a 6 for having nothing to disprove.
**P4's 3 stands, and it is the number that dropped C6 from third to fourth.** Two further
points Phase 7 must carry: C6 is the only contender that never demonstrates the most
cautious label, which is a permission-first page declining to show the case where permission
is withheld; and ten new ledger rows of *voice* copy is a materially different audit
exposure from C4's seven rows of *scope* copy, because scope copy is derived from approved
sources and voice copy is not.

---

## Disagreement 7 — C6 · Information architecture · **P2 gives 6, P1 gives 3**

**P2:** "Six moments rather than six sections is a coherent structure."

**P1:** "A visitor who arrives ready to buy has one nav link doing the work of an entire
information architecture, and 4,300px of prose between them and a price."

**Ruling: P1 is right.** Coherence is not the test; reachability is, and it is the test P2
itself applies when scoring C5's nine blocks down. A structure that can only be entered at
the top and traversed linearly is not an information architecture, it is a document. C6's
own entry concedes the point — "a visitor who arrives ready to buy and wants to find the
price will scroll past prose to get there" — and then declines to fix it on the argument
that the ready-to-buy visitor is not the one this page loses. That argument is about *who to
optimise for*, which is a legitimate bet, and it is not a defence against the IA score.
**P1's 3 stands.** Note the symmetry with Disagreement 4: P1 and P2 are consistent with
themselves across both cards and inconsistent with each other, which means this is a real
methodological split about what IA measures, not a scoring slip. The tournament resolves it
in favour of reachability, in both directions: C5's 8 stands and C6's 3 stands.

---

## Disagreement 8 — C7 · Honesty & claim safety · **P3 gives 9, P4 gives 6**

**P3:** "Refusing to draw the competitor's output is the div-based fake-screenshot ban
applied before anyone invoked it, on the one asset where breaking it would have been most
persuasive. It cost C7 the better version of its own object and it paid without being
asked."

**P4:** "An entire block headed `What every other food app does` asserting that competitors
return confident answers they cannot support is a comparative accuracy claim about unnamed
third parties on a health surface with no evidence behind it. It clears
`claims-boundary-copy.test.ts` because that suite checks disease-outcome claims. Counsel is
a different fence."

**Ruling: both are right, and this is the most consequential unresolved item in Phase 6.**
P3 is correct that the *refusal* is exceptional: C7 is the only contender that gave up the
stronger version of its own central object to hold a rail, and it did so unprompted. P4 is
correct that the *rest of the block* makes an unevidenced comparative claim, and that the
guards not catching it is not evidence that it is safe — the phases-0-3 handoff's own trap 12
says the claims guards are the authority on *disease-outcome* claims, which is precisely the
boundary this sentence sits outside.

The specific strings needing a decision before any of this ships, in either C7 or in a graft
of C7's organ into another contender:

- `What every other food app does` (block heading)
- `Returns an answer immediately. A glycemic number, a score, a colour.`
- `The answer is confident. It is confident about a meal it does not have enough information to describe.`
- `A confident wrong answer is worse than a question here.`
- `Every alternative you have tried would have picked one and sounded certain.` *(this one is
  C4's, in its block 4 lede — the same claim, made by the contender that scored 9.17 on
  honesty, which nobody noticed until this ruling)*

**The last item is the finding.** The comparative-confidence claim is not a C7 problem. It is
present in C4, C2, C3, C5 and C7 in some form, descended from the incumbent's already-approved
`Most apps would just pick one and sound confident.` — a ledger row that has passed the audit.
The question Phase 9 must answer is whether an approved *sentence* licenses an entire
*section* built on the same proposition. **P4's 6 stands for C7 specifically**, because C7 is
the only contender that scales the claim from one sentence to a structural block with a
heading. The four others keep it at sentence scale and inside the approved row's shadow.

---

## What the judges did NOT disagree about

Four unanimities, each worth more than the disagreements because nobody coordinated.

**C7 · Category clarity · 3, from all six judges.** No other dimension score in this
tournament is unanimous. The Adversarial Killer's own contender was convicted by the whole
room on the one thing its author explicitly chose — deleting the eyebrow on principle — and
the author had already predicted it in part 12. Phase 7 does not need to re-argue this.

**C4 · Emotional fit · 2–3, from all six judges.** Six worldviews, one number. The most
honest page in the tournament is also the one nobody wants to read, and the two facts have
the same cause.

**C6 · Emotional fit · 8–9, from all six judges** — including P4, which scored the page a 3
on honesty in the same card and gave it a 9 here anyway. That is the cleanest signal on the
board: C6's warmth is not a matter of taste, and it is not enough on its own.

**C5 · Craft · 2–4, from all six judges. Nobody scored it above 4.** Including P1, which
otherwise gave C5 its second-highest total. The contender that measured the incumbent most
precisely is the contender the room agreed changed it least.

**And one near-unanimity that matters for Phase 7:** **C1 produced zero disagreements of 3+
points across all ten dimensions** — the only contender that did. Seven personas with
incompatible worldviews converged on the same reading of it: correct ordering (IA 7.67, the
highest on the board), cheap to build (Impl 7.83, tied highest), and nothing decided
visually (Craft 4.50, second-lowest). It finishes second by being the page nobody objects to
and nobody argues for.

---

# Where this stops

Sections 9 and 10 are complete. **42 cards written, 420 dimension scores, one 10 awarded,
eight disagreements ruled, three kills recorded.**

Phase 7 (Sections 11–12) is next: rank, kill the bottom three with the exact structural or
copy decision that ended each, name the failure traits the dead share, extract one organ
from each corpse and name its recipient, then collect every idea that appeared independently
in 3+ contenders and every idea exactly one persona proposed that scored highly with the
others.

**Five items Phase 7 inherits directly from this phase:**

1. **The bottom three by weighted mean are C5 (62.20), C4 (61.43) and C7 (59.00)** — and
   all three won at least one dimension. C4 won three. Killing them is not killing weak
   pages; it is killing specialists, which makes the organ extraction in Section 11 the most
   load-bearing part of Phase 7 rather than a courtesy.
2. **C3 wins on one dimension carried by a weight the owner set.** Say so in Section 11
   rather than letting Section 13 imply a broader mandate than the numbers support.
3. **C3's 2,580px desert (Disagreement 2) is the winner's largest unresolved defect** and
   Phase 8 must fix it or accept it explicitly.
4. **The comparative-confidence claim (Disagreement 8) is not confined to C7** and needs a
   ruling that covers C4's block-4 lede too, before Phase 9 walks the rails.
5. **C5's two scheduled tests survive C5.** Already ruled in the phases-4-5 handoff;
   independently confirmed by Disagreement 5. Phase 10C adopts both regardless of the winner.

**Still not done:** `npm test` has not been run this session. Last recorded green suite is
2,165 passed / 0 failed / 2 skipped at `bf714e9`. Phase 10C's breakage predictions are worth
nothing against an unverified baseline, and the run takes ~26 minutes on an idle machine with
no `next dev` running.
