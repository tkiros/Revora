# Revora Landing Tournament — Phases 4 & 5

**Sections 7 and 8 of 18.** Continues
`docs/handoff/2026-08-04-landing-design-copy-tournament-phases-0-3-handoff.md`.
Phases 0–3 (Sections 1–6) are complete and are not re-derived here.

**Status:** Personas instantiated. Seven contenders built. **Nothing scored yet.**
Stop point is the end of this file; Phase 6 (cross-scoring) has not begun.

**Date:** 2026-08-04 · **Branch:** `fix/landing-followups` · **Files changed:** this one only.

---

## Ruling before Section 8 — how the pins bind

The handoff states that a contender breaking any hard source-text pin in §3.2 forfeits.
Taken literally that ends the tournament before it starts: `landing-wiring-pins.test.ts`
pins the literal strings `Two ways in.`, `Dictate it or type it.`,
`A weekly recap in sentences` and `A record you can actually show someone` — which are
the exact copy of the sections Phase 1 found weakest, including the ~900px block whose
shipped headline sells typing and talking as the mechanism.

Those tests exist to stop **silent** drift, not to stop deliberate redesign. So the pins
bind in two tiers, and every contender is audited against both:

**Tier A — semantic pins. Inviolable. Breaking one forfeits.**
These encode a live-config truth or an audit guarantee, not a wording:

| Pin | What it protects |
|---|---|
| `TASTER_LIMIT` interpolated, never retyped | store listing / landing / meter can't drift |
| `{monthlyPrice}` from `resolvePriceVariant()`; no literal `$9.99\|$12.99\|$19.99` in source | the funnel structurally cannot lie |
| `paywallMode() === "trial"` branch, **both** branches present in source | the legacy funnel stays renderable |
| `RISK_LABELS` interpolated; `SAFE`/`MODERATE`/`HIGH` never render | rail 3 |
| `<DemoCheckCard />` rendered; the three interaction strings never retyped in `page.tsx` | rail: the demo can't drift from the real precheck |
| `reading.className` on the landing root | FINDING-030 |
| No `.landing*` selector declares `font-size` twice | the 2026-07-29 override-block incident |
| Banned source phrases stay banned (`/free taste/i`, `/your first day of checks is free/i`, `/check your meals all day/i`) | rejected copy stays rejected |
| Trial mode never renders a daily free-check claim; legacy mode must | rendered-output guard |

**Tier B — string pins. Changeable, with cost.**
`Check up to {TASTER_LIMIT} meals on your first day` · `{TASTER_LIMIT} free checks on day one` ·
`Your first ${TASTER_LIMIT} checks, on your first day` · `7 days free` · `Days 2–8` ·
`A free account` · `still no card` · `Two ways in.` / `Three ways in.` ·
`Dictate it or type it.` · `A weekly recap in sentences` ·
`A record you can actually show someone` · `It asks before it guesses` ·
`Add to home screen — works today`.

A contender may retire a Tier B pin **only if it names the pin, gives the reason, and
schedules the test edit in the same work item.** Dropping one silently forfeits. Every
contender below carries a Tier B ledger in part 10.

**Live values used throughout, interpolated never retyped:** `TASTER_LIMIT` = 10 ·
`FREE_DAILY_CHECKS` = 5 (legacy branch only) · trial = 7 days, card required, $0 charged,
pre-charge email at day 5 · `paywallMode()` = `"trial"` · `{monthlyPrice}` renders $12.99 ·
annual $99.99/yr ($8.33/mo equivalent) · Pantry Review $49 one-time · `RISK_LABELS` =
Clear · Be careful · Hold off · `photoInputEnabled()` = **false** (so no contender may
sell photo input) · A1C scope 5.7%–6.4%.

**One evidence ruling that constrains all seven:** the DPP enrolment statistic (<1% of
prediabetics get structured support) is the most persuasive number available and **no
contender may use it.** Rail 6 confines the trial citation to `/how-it-works` and
`claims-boundary-copy.test.ts` family `study-association` enforces it. Three personas
wanted it. All seven are denied it.

---

# SECTION 7 — The Seven Personas

Each states, in its own voice: its worldview, its theory of why the incumbent fails, and
the one bet it is making. Each competes once and judges the other six.

---

## P1 — The Conversion Surgeon
*Skills: `icopywriting`, `icro`*

**Worldview.** A landing page is an argument, and an argument has an order. Belief,
mechanism, proof, offer, risk reversal. Anything that is not one of those five things is
furniture, and furniture on a landing page is theft — it costs scroll, it costs attention,
and it costs the reader's willingness to keep going. Calm is a register, not a strategy.
Vague is what kills.

**Why the incumbent fails.** *It is not a page. It is thirteen pages stacked.* The
argument is in there — I can point to every piece of it — but it has been shuffled and
then padded. The single most valuable sentence Revora owns, *"It asks before it guesses,"*
is ranked feature #1 of nine, inside a grid, at y≈5,500px on a phone. That is the
mechanism. In a direct-response chassis the mechanism gets a section with its own headline
and its own proof unit, and it goes above the offer, not 5,500px below the fold in a cell
that looks exactly like the eight cells around it. Meanwhile the page states "one clear
answer" seven times and "10 free checks" seven times, which is what a page does when
nobody decided what the argument was, so every section made its own.

And there is a 5,090px stretch with no way to act in it. The recognition moment — *"that
is my last six months"* — is the highest-intent point on the page before pricing, and the
page's response to a reader who has just been seen is to show them nine feature cards.

**The one bet.** That this visitor is deciding, not browsing, and that the fix is not
better sections but *fewer sections in the right order, each ending in the same action.*
I am wagering the entire feature inventory, the glance strip and the before/after grid on
the proposition that a reader who believes the mechanism does not need a list of nine
things, and a reader who does not believe it will not be rescued by one.

---

## P2 — The Restraint Architect
*Skills: `apple-design`, `impeccable`*

**Worldview.** Deference. The interface recedes and the content leads. Most sections on
most pages exist to reassure the team that the page is thorough, not to help the person
reading it. Typography and space do the work that decoration is currently attempting.
One idea per viewport, and the idea should be able to survive being read at arm's length
by someone who is not wearing their glasses.

**Why the incumbent fails.** *It is loud in a way that has nothing to do with volume.*
There is no dark band, no gradient, no animation — and it still shouts, because there are
eight card families, thirteen blocks, three background planes alternating down the page,
and a 1px hairline drawn between them in case the colour change was too subtle. That is
five separate systems all trying to say "new section starts here" when space alone would
have said it. Stripes where breathing should be.

And the word "calm" appears three times in headings and ledes. A page that has to tell you
it is calm is not calm; it is a page that knows it isn't and is hoping you won't check.
The pains list is the best writing in the repository and it is set at the same weight as
the nine feature cards that follow it.

**The one bet.** That the problem is quantity, and that subtraction — not rearrangement —
is the cure. Five blocks. Type does the hierarchy; there are no cards on the page except
the three that carry verdicts, because those are the only things on the page that are
semantically bounded. If five statements cannot carry this product, thirteen were never
going to.

---

## P3 — The Design Engineer
*Skills: `emil-design-eng`, `taste-skill`*

**Worldview.** Whether this page feels expensive or feels generated is decided by twenty
choices nobody consciously notices: the exact border weight, whether the hairline lands on
a device pixel, how the CTA answers a press, whether the transitions are timed to a hand or
to a default. Quality is the aggregate of invisible correctness.

**Why the incumbent fails.** *It describes the product nine different ways and shows it
once.* The one artifact Revora actually ships — a card with a label, a reason and one
practical change — is the most persuasive object available, and the page renders it once,
in a container called `.landing-phone` that has not contained a phone since the bezel was
removed on 2026-07-27. A class name lying about its contents is exactly the class of
detail I am describing. Nobody sees it. It is still wrong, and it is wrong in the same way
the rest of the page is wrong.

Then there is the first handshake. The hero's proof unit shows a frightened person a food
they thought was fine being taken away from them, and the page spends the next four blocks
apologising with the word "calm." That is not a copy problem. That is the order of the
frames.

**The one bet.** That the result card *is* the page — that the composition unit is the
artifact, repeated at three different moments of doubt, with the whitespace between them
doing the sectioning. And that the clarify-then-answer sequence, which is currently a
static stack of fifteen lines, should be the one thing on this page that moves, because it
is the one thing whose meaning is temporal: the product waits before it answers.

---

## P4 — The Clinical Trust Officer
*Sources: `docs/safety/claims-boundary.md`, `tone-uncertainty-policy.md`, `evidence-pack.md`*

**Worldview.** This audience has been burned by health apps that over-claimed. For them,
honesty is not a compliance tax — it is the conversion mechanism. The claims boundary is
not a cage around the product. It is the product's sharpest edge, and this page is
under-using it by roughly the whole page.

**Why the incumbent fails.** *It treats its best asset as fine print.* The boundary is
the differentiator. Every alternative in the research returns a confident number for any
input, and their complaint threads are about that confidence. Revora structurally refuses
to be confident when it can't be. The page's response to owning the only honest thing in
the category is to put it in a feature cell and then title the trust section *"Calm, and
honest about its limits"* — which announces honesty as a personality trait rather than
demonstrating it as a mechanism.

Worse, the section that exists to establish credibility contains a card headed *"Grounded
in published research"* whose body is about the weekly recap being behavioural. The heading
and the body describe different things. On a page whose entire pitch is *we say what we
actually know*, the trust section has a claim that does not match its evidence. And the
"10 seconds" glance fact renders as an unhedged promise in 800-weight accent type while the
hero says "about ten seconds" — the same rhetorical move rail 7 exists to stop, escaping
only because it is a latency claim and not a health claim.

**The one bet.** That the fastest way to be believed by someone who has been lied to is to
open by telling them to leave. The scope statement becomes the hero. The page disqualifies
the reader in its first sentence, and everything after that is credible because of it.

---

## P5 — The Legibility Realist
*Skills: `iui-ux-pro-max`*

**Worldview.** Everybody else in this room is designing for a 27-inch display and a
32-year-old retina. The actual session is a 54-year-old, one-handed, on a 375px phone,
possibly in a supermarket under fluorescent light, with their reading glasses on the
kitchen table. Anything that fails there fails. Full stop.

**Why the incumbent fails.** *Because it is 12,942 pixels long and the argument is fine.*
That is my whole finding, and I am aware it is the least glamorous one in this tournament.
On a 667px viewport that is 19.4 screens. The CTAs sit at y = 18 · 491 · 2,973 · 5,498 ·
10,588 · 11,002 · 11,950. Between 491 and 5,498 there is nothing to press for **five
thousand pixels**, and that desert contains the problem section, how-it-works, the verdict
row and the nine-cell feature grid — which is to say it contains the entire persuasive
middle of the page. The reader is convinced somewhere in there and then has to scroll
seven and a half more screens to act on it.

Three more things nobody has measured. The 44px touch rule is CSS-only; axe does not check
target size at AA, so it is not asserted anywhere. The reduced-motion blocks are four
`@media` rules with no test. And the 16px floor is held up by two CSS comments that say
"never lower this." Seven of the fifteen rails on this page are prose. The five most likely
to break silently are exactly the ones a redesign touches first.

**The one bet.** That the conversion problem here is physical, not rhetorical — and that
the right instrument is a persistent thumb-zone action bar, which means retiring "one
filled pill per viewport" as written and restating it as **one filled pill per screenful.**
I am betting the tournament's craft judges hate this and the users don't.

---

## P6 — The Anxious Patient
*Sources: `docs/ICP.md`, `PRODUCT.md` §Users*

**Worldview.** I'm not analysing your page. I'm reacting to it. Three months ago someone
told me my body is going wrong and then didn't explain what to do, and every night since
then I have looked at a plate and not known. I don't want a system. I don't want to become
a person who tracks things. I want to know if I can eat the pasta.

**Why the incumbent fails.** *The first thing it shows me is a food I thought was fine
being taken away.* Oatmeal. I eat oatmeal. That is the first thing this page does to me,
in the first screen, before it has told me a single thing I can have. I know the writing
underneath it is careful — I can feel that someone tried — but by the time I get to the
careful part I have already learned that this app's job is to find things wrong with what I
eat, which is the exact thing I was afraid of, and it took eleven seconds.

Then it says "calm" three times, which is what people say when they know they've upset you.
And there's a line about wanting "a clearer description of its overall balance." I'm
standing in a kitchen at six o'clock. I don't want that. Nobody has ever wanted that.

There's a fourth question that isn't in your research, because nobody types it into a
search bar: **will this make me feel worse?** I ask it at the fold, silently, and if the
answer looks like yes I close the tab and you never learn why.

**The one bet.** That tone is structure, not decoration — that a page which answers the
fourth objection wins, and the only way to answer it is to lead with something I can have,
in a voice that talks to me like an adult who is scared rather than a patient or a user.
Second person, one evening, start to finish. The product appears inside my night, not in a
section about itself.

---

## P7 — The Adversarial Killer

**Worldview.** Assume every contender is mediocre until it survives attack. Most "design
work" is pattern-matching to what other products did, dressed up as principle. The default
outcome of this tournament is seven variations of the same generated-looking page, and my
job is to make that impossible.

**Why the incumbent fails.** *Because six of its thirteen blocks would work, unedited, on
a company that sells project management software.* Three-step how-it-works with Step 1 /
Step 2 / Step 3 eyebrows. A four-stat glance strip. Three-up pricing tiles. An FAQ
accordion. A 2×2 before/after grid. A nine-item feature grid whose ranking exists **only in
a code comment**, so a scanner sees nine undifferentiated cells and the ranked order that
someone thought hard about is invisible to every human who will ever visit.

There are forty-two rendered em dashes on this page. That is not a house voice, it's a
cadence, and in 2026 it is the single most reliable machine-text tell in existence. One of
them is the approved CTA and earns its place. The other forty-one are a signature.

And the headline of section four, as shipped today with the photo flag off, is **"Two ways
in. One calm answer out."** Two ways in are *typing* and *talking*. Nine hundred pixels of
this page sell the two most ordinary input methods in software as though they were the
mechanism. Both prior handoffs discuss that section as if it renders "Three." Nobody looked.

**The one bet.** That the only defensible page is one whose central object could not exist
for another company — and that Revora has exactly one such object: **the question it asks
before it answers.** I am building the page around a comparison of two responses to the
same four-letter input, and I am deleting the eyebrow, the three-step, the glance strip,
the feature grid and the accordion. If that page loses, at least it loses as itself. I am
required to kill one contender outright and I intend to.

---

# SECTION 8 — The Seven Contenders

## Contender Summary Table

| # | Persona | Name | One-line thesis | The bet, in a clause | Blocks | 375px scroll |
|---|---|---|---|---|---|---|
| C1 | P1 | **The Six-Month Gap** | One argument, five moves, six exits. | fewer sections in the right order beat better sections | 8 + footer | ~7,400px · 11.1 screens |
| C2 | P2 | **Is This One Okay?** | Say the visitor's own sentence back to them, then stop talking. | subtraction, not rearrangement | 5 + footer | ~5,200px · 7.8 screens |
| C3 | P3 | **One Card Back** | The artifact is the page; whitespace is the sectioning. | showing beats describing, nine times over | 6 + footer | ~6,800px · 10.2 screens |
| C4 | P4 | **Built for One Number** | Open by disqualifying the reader; earn everything after. | honesty as mechanism, not as tone | 7 + footer | ~7,000px · 10.5 screens |
| C5 | P5 | **Within Reach** | A 375px document with a persistent thumb-zone action. | the conversion problem is physical | 9 + footer | ~8,600px · 12.9 screens |
| C6 | P6 | **Tonight** | One evening, second person, product inside the narrative. | tone is structure | 6 + footer | ~6,200px · 9.3 screens |
| C7 | P7 | **It Asks First** | The page is one comparison: a number, or a question. | only a non-portable object survives | 5 + footer | ~5,800px · 8.7 screens |

Incumbent baseline: 13 blocks, 12,942px, 19.4 screens, 7 CTAs, 5,090px CTA desert,
42 rendered em dashes.

## How each contender votes on the seven CONTESTED `DESIGN.md` items

Phase 3 left seven design decisions for the tournament to settle. Recording the votes here
means Phase 8 inherits a tally rather than an argument.

| Contested item | C1 | C2 | C3 | C4 | C5 | C6 | C7 |
|---|---|---|---|---|---|---|---|
| 1. Two-font pairing (Jakarta + Source Sans 3) | keep | **kill** (one family, 17/1.65) | keep | keep | keep | keep | **kill** (one family) |
| 2. 24px radius on all 8 card families | keep | n/a (2 families) | **12px** | keep | keep | keep | **0px, rules not cards** |
| 3. Three light planes + 1px hairline | 2 planes | **1 plane** | **1 plane** | 2 planes | 2 planes | **1 plane** | **1 plane + rules** |
| 4. "One filled pill per viewport" | per screenful | per page | per screenful | per page | **per screenful (sticky)** | per screenful | per screenful |
| 5. Eight landing card families | 3 | **2** | **2** | 3 | 4 | **2** | **1** |
| 6. Landing voice licence (§Voice scoped app-only) | licence | licence | licence | **no licence** | licence | licence | licence |
| 7. "Icons never alone" | restate | restate | restate | restate | restate | restate | restate |

**Convergence visible already, before any scoring:** 7/7 want rule 7 restated (the file
already contradicts it in §Progress surfaces). 6/7 collapse the plane system to one or two.
7/7 cut the card families from eight to four or fewer. 0/7 defend eight card families and
0/7 defend the three-plane-plus-hairline rhythm as shipped. Those are not close calls.

---
---

# C1 — THE SIX-MONTH GAP
### by P1, The Conversion Surgeon

### 1. Name and one-sentence thesis

**The Six-Month Gap.** The page is a single direct-response argument — you were handed a
number and no plan, here is the mechanism that fills the gap, here is what it costs to try
— with the three killing objections answered as named blocks in frequency order and the
same action at the end of every one.

### 2. The bet

That this visitor is deciding, not browsing, and that the incumbent's disease is not weak
sections but *good sections in no order, padded with furniture.*

**What it wagers:** the entire nine-item feature grid (compressed to four lines inside the
offer block), the four-stat at-a-glance strip, the 2×2 before/after grid, and the
three-step how-it-works section. Four of thirteen blocks deleted outright.

**What it sacrifices to make the wager:** breadth. A reader who wants to audit the feature
inventory before deciding cannot do it on this page; they get four lines and a link to
`/how-it-works`. C1 accepts that trade because ICP §8 says the #1 deal-killer is
"MyFitnessPal is free," and no feature list has ever beaten a free incumbent — only a
mechanism has.

### 3. Section map

One plane change only: white sheet for the hero and the proof, page background for
everything else. No tint band, no hairlines. Rhythm comes from `clamp(52px, 7vw, 104px)`
section padding and nothing else.

| # | Block | Purpose | Plane | 375px height | Share |
|---|---|---|---|---|---|
| 1 | Nav + hero | Belief + first exit | `.landing-sheet` | ~880px | 12% |
| 2 | The gap | Villain: six months of nothing. Recognition. | `--page-bg` | ~1,180px | 16% |
| 3 | **The question it asks** | **The mechanism.** `<DemoCheckCard />` lives here. | `.landing-sheet` | ~1,150px | 16% |
| 4 | Three answers | Proof. Clear card carries nothing. | `--page-bg` | ~1,240px | 17% |
| 5 | "Another app I'll quit" | Objection 1 | `--page-bg` | ~620px | 8% |
| 6 | The offer | Objection 3 + price + funnel mechanics | `--page-bg` | ~1,260px | 17% |
| 7 | Fair questions | 4 questions, open `<details>` on first | `--page-bg` | ~560px | 8% |
| 8 | Close | Final exit | `.landing-sheet` | ~380px | 5% |
| — | Footer | Nav + disclaimer | `--page-bg` | ~130px | 2% |

**Totals: 8 blocks + footer. ~7,400px ≈ 11.1 screens at 667px.**
**CTAs at y ≈ 18 · 700 · 1,940 · 3,220 · 4,680 · 5,700 · 7,120. Longest CTA desert:
1,460px** (incumbent: 5,090px).

### 4. Full copy deck

**Nav**
- Wordmark: `Revora`
- Links: `How it works` · `Pricing` · `Pantry Review`
- Nav CTA (ghost pill, persistent): `Check a meal`

**Block 1 — Hero**
- Eyebrow: `A meal checker built only for prediabetes`
- H1: `You were told to eat better. Nobody told you about tonight.`
- Sub: `Your A1C came back between 5.7% and 6.4%, and the next appointment is six months out. Describe the plate in front of you and Revora gives you one answer — Clear, Be careful, or Hold off — with the reason behind it, in about ten seconds.`
- CTA: `Check your first meal — free`
- CTA caption: `10 free checks on your first day, then you decide.`
- Trust strip (3 items, ledger row `home-trust-strip`, verbatim):
  - `No login for your first checks.`
  - `When we're unsure, we say so.`
  - `If you ever subscribe, cancel is one tap — not an email.`
- Visual half — one Clear card, permission-first:
  - Caption above: `An illustrated example`
  - Meal line: `Grilled chicken, brown rice, and a side salad`
  - Verdict: `Clear`
  - Reason: `This looks like a reasonable fit. The meal already has protein and vegetables, so it looks more balanced than a fast-carb-heavy option.`
  - Note below card: `No change to make. When a meal already looks balanced, that is the whole answer.`

**Block 2 — The gap**
- H2: `The six-month wait is the problem`
- Lede: `Nobody handed you a plan. You were handed a number, two words of advice, and an appointment half a year away. Everything in between is supposed to be your job to figure out.`
- Four items (kept near-verbatim from the incumbent; Phase 1 called this the best prose in the repo and C1 does not improve on it):
  - `The advice was two words long.` `"Eat better." Better than what? Is oatmeal fine? Is the sandwich at lunch a problem? Nobody said, and the appointment is in six months.`
  - `Every article contradicts the last one.` `Fruit is fine, fruit is sugar. Rice is out, brown rice is in. You have read all of it and you still do not know about the plate in front of you tonight.`
  - `The apps want you to become an accountant.` `Weigh it, log it, scan the barcode, hit your macros. You did not ask for a second job. You asked what to do about dinner.`
  - `So you guess, and then you worry.` `You eat the thing, and spend the next hour wondering whether it was a mistake. That loop is the actual cost of being told nothing.`
- Scope note: `Revora exists for that gap and nothing else. Not a general nutrition app, not a calorie counter, not built for everyone. If your A1C sits outside 5.7% to 6.4%, it says so plainly and points you to a clinician instead of pretending.`
- CTA: `Check your first meal — free`
- CTA caption: `No login, no card, nothing to install.`

**Block 3 — The mechanism**
- H2: `It asks before it guesses`
- Lede: `Every other food app answers instantly, because answering instantly is what makes an app feel smart. Revora asks one question when the honest answer depends on it. That is the whole difference, and you can check it for yourself in about ten seconds.`
- `<DemoCheckCard />` renders here, full width on mobile, right column at 880px.
- Under the card: `You typed four letters. Plain oatmeal and sweetened oatmeal are not the same meal, so Revora asked instead of picking one. Most apps pick one and sound confident.`
- CTA: `Check your first meal — free`
- CTA caption: `Type "oatmeal" and see what it asks you.`

**Block 4 — Three answers**
- H2: `Three meals. Three different answers.`
- Lede: `No dashboard, no numbers to decode. Notice that the Clear card carries no change to make: when a meal already looks balanced, Revora says so and stops. It does not invent a correction to look useful.`
- Card 1 — meal `Grilled chicken, brown rice, and a side salad` · verdict `Clear` · reason `This looks like a reasonable fit. The meal already has protein and vegetables, so it looks more balanced than a fast-carb-heavy option.` (no adjustment, no swap)
- Card 2 — meal `A bagel with jam and a glass of orange juice` · verdict `Be careful` · reason `This may have a higher blood-sugar impact than a more balanced meal because it leans heavily on refined carbs.` · `Adjustment:` `If practical, add protein or nonstarchy vegetables to make it easier to handle.`
- Card 3 — meal `A large soda with fries on the side` · verdict `Hold off` · reason `This is likely a higher-impact choice in its current form because it is mostly sugary or refined carbs.` · `Swap:` `A smaller portion with protein or nonstarchy vegetables would be a steadier fit here.`
- Note: `Illustrated examples. Every card ends with the same line: Revora is informational only and is not medical advice.`
- CTA: `Check your first meal — free`

**Block 5 — Objection 1**
- H2: `"Another food app I'll quit in a week"`
- Body: `Probably fair. You already downloaded one that turned eating into accounting, and you stopped, and it is still on your phone somewhere. Here is what is different, stated flatly rather than promised: there is nothing to log. No weighing, no barcode, no macros, no daily total to hit and feel bad about missing. You describe one meal when you want an answer about one meal, and then you close it. Skip four days and nothing turns red, nothing breaks, and nothing counts it against you. Blank days are just blank.`
- Closing line: `A record you can actually show someone builds up anyway, in your own words, whether or not you check every day.`
- CTA: `Check your first meal — free`
- CTA caption: `10 free checks on your first day, then you decide.`

**Block 6 — The offer**
- H2: `Try it before you pay a cent`
- Lede (trial branch): `The funnel is the promise: 10 free checks on day one, a free week, and a cancel button that lives on your account page — not behind an email.`
- Lede (legacy branch): `The funnel is the promise: 10 free checks on day one, a free account every day after, and a cancel button that lives on your account page — not behind an email.`
- Tile 1 — day `Day 1` · what `10 free checks` · body `Check up to 10 meals on your first day, no login and no card. See how the answers feel at your own table.`
- Tile 2 (trial) — day `Days 2–8` · what `7 days free` · body `Card required, nothing charged. On day 5 we email you the exact date and the exact amount, with a one-tap cancel link in the email.`
- Tile 3 (trial) — day `After your free week` · what `{monthlyPrice}/month` · body `Unlimited checks, your history on every device, a plain weekly recap, and one optional reminder. Cancel in one tap, effective at the end of the period.`
- Tile 2 (legacy) — day `Every day` · what `A free account` · body `No card. A free account still includes 5 free checks a day, still no card, with your history saved to your account.`
- Tile 3 (legacy) — day `Premium` · what `{monthlyPrice}/month` · body `Unlimited checks, your history on every device, a plain weekly recap, and one optional reminder. Cancel in one tap.`
- What premium includes, four lines under the tiles:
  - `Unlimited checks, and your history on every device.`
  - `A weekly recap in sentences — what you did, never a grade and never a lab prediction.`
  - `One optional daily reminder, off by default.`
  - `Your A1C and meal text encrypted at rest, deleted in one tap, account included.`
- Pantry line: `Not ready for a subscription? The Pantry Review is a separate one-time report that sorts the food already in your kitchen. $49, one payment, nothing renews.` Link: `See a sample report`
- CTA: `Check your first meal — free`

**Block 7 — Fair questions** (4 entries, first one open by default)
- `Is Revora medical advice?` → `No. Revora is informational only and is not medical advice. Its labels describe general meal patterns. Broad A1C-range context only makes the presentation more cautious; it does not predict your response or decide whether a meal is medically appropriate. Talk with a doctor or registered dietitian for guidance specific to you.`
- `Who is Revora for?` → `People in the prediabetes A1C range of 5.7% to 6.4%. If your number falls outside that range, Revora says so plainly and points you to a clinician instead of pretending.`
- `Do I need an account or a card to try it?` → (trial) `No. Your first 10 checks, on your first day, need no login and no card — they live on this device only. The 7-day free trial needs a card but charges nothing for a week, and we email you before any charge.` / (legacy) `No. Your first 10 checks, on your first day, need no login and no card — they live on this device only. After that, a free account includes 5 free checks a day — still no card. Premium is optional, and cancels in one tap.`
- `How do I cancel?` → `One tap, on your account page, effective at the end of the paid period. No retention screens, no email hoops. Deleting your account removes your data with it.`

**Block 8 — Close**
- H2: `Your next meal is the one to try it on.`
- Sub: `Describe what is in front of you. Revora tells you where it lands and why, in about ten seconds.`
- CTA: `Check your first meal — free`
- CTA caption: `No login. No card. 10 free checks on your first day.`

**Footer** — unchanged from the incumbent: four columns (Product / Learn / Legal / Apps),
`Add to home screen — works today`, and `{BOUNDARY_DISCLAIMER}` rendered in full.

### 5. Hero specification

- **Eyebrow: kept.** Phase 1 found it answers "what is this" in 7 words before the
  headline and almost no health-tech landing page does that. Deleting it to avoid the
  eyebrow trope would cost more than the trope costs. It is the **only** eyebrow on the
  page (impeccable's ceiling is one per three sections; C1 has one per eight).
- **H1:** `You were told to eat better. Nobody told you about tonight.` Two clauses,
  villain then gap. Retires `Stop guessing at dinner.` — which is better *writing* but is
  command-voice at a person who is already anxious, and does not name the situation.
- **Sub:** 44 words. Carries scope (5.7–6.4%), the villain (six months), the mechanism
  shape (describe → one answer), the three labels, and the latency, hedged.
- **CTA:** `Check your first meal — free` (ledger-approved, unchanged). Caption carries
  Tier B pin `{TASTER_LIMIT} free checks on your first`.
- **Trust strip:** the ledger row, verbatim, three items.
- **Visual half: the Clear card, not the oatmeal card.** This is C1's single biggest
  structural claim. The betrayal hook is the sharpest thing in ICP §10 and it stays on the
  page — it moves to block 3, where the clarifying question is the point and the hook lands
  as *proof of the mechanism* rather than as the brand's opening move. The hero shows a
  meal being permitted, which is `PRODUCT.md` §Design Principles 1, and it is 5 lines
  rather than 15.
- `.landing-phone` is renamed `.landing-hero-proof`. It has not contained a phone since
  2026-07-27.

### 6. The proof strategy

Four mechanisms, none of them social:

1. **The clarifying question is checkable in ten seconds, free, without an account.** No
   competitor can copy it without conceding their numbers were never that certain. This is
   the load-bearing proof and it gets its own block.
2. **The Clear card carries nothing.** Demonstrating restraint beats asserting it, and it
   is the one thing on the page that a cynic can verify by looking.
3. **The funnel is rendered from the flags checkout enforces.** Price, trial length and
   the day-5 email are the same objects the server runs. Nothing on this page can promise a
   funnel the config doesn't execute.
4. **Billing mechanics stated as mechanics, not adjectives.** Day 5, exact date, exact
   amount, one-tap cancel link in the email. The category is poisoned (Klinio 1.2/5);
   "cancel any time" is what the scam apps say, and a date is not.

Explicitly **not** used: ratings, user counts, testimonials, "clinically" anything, and the
DPP statistic.

### 7. Visual system deltas

| Delta | From | To | Why |
|---|---|---|---|
| Planes | 3 (`sheet` / `band` / `page-bg`) + 1px hairline | 2 (`sheet` / `page-bg`), no hairline | Contested #3. Two planes across 8 blocks reads as emphasis; three across 13 reads as stripes. |
| Card families | 8 | 3 (verdict card · price tile · FAQ row) | Contested #5. |
| Radius | 24px everywhere | unchanged, 24px | No delta. The radius is not what makes this page read generic; the count of cards is. |
| Shadow | one card shadow | unchanged | No delta. It is the best rule in the file. |
| Type pairing | Jakarta + Source Sans 3 | unchanged | No delta. C1 has no evidence the pairing hurts conversion and declines to spend a font decision it can't defend. |
| Nav CTA | ghost | ghost, **persistent on scroll** at ≥880px | Contested #4, restated as one filled pill per *screenful*; the nav pill stays ghost so the hero owns the only filled pill above the fold. |
| Section padding | `clamp(52px, 7vw, 104px)` | unchanged | No delta. |
| Eyebrows | 4 rendered (`landing-eyebrow` + 3× `Step N`) | 1 | The `Step 1/2/3` eyebrows die with the how-it-works block. |

### 8. Motion specification

Deliberately minimal; C1 is not a craft contender and says so.

- CTA press: `transform: translateY(1px)`, `--dur-fast` (150ms), `--ease`. Existing token,
  no change.
- `revora-rise` (6px fade-up, 200ms, plays once) on the three verdict cards as they enter
  the viewport, staggered 60ms. Purpose: *sequence* — the reader should read Clear before
  Be careful before Hold off, and permission before caution is the brand's whole order.
- **Nothing else moves.** No scroll parallax, no counters, no reveal gating. Content is
  visible by default; the animation enhances an already-rendered state, so a headless
  render or a hidden tab ships the full page.
- `prefers-reduced-motion: reduce` → the existing global block zeroes both. The stagger
  becomes simultaneous and the cards are simply present. Nothing is lost, because the
  reading order is DOM order.

### 9. The 375px story

- **Above the fold (667px):** ghost nav CTA · eyebrow · H1 (2 lines at
  `clamp(2rem, 7vw, 2.6rem)`) · first 2 lines of sub. The filled CTA sits at y ≈ 700 —
  **just below the fold, deliberately.** C1's position is that a CTA above a sub the reader
  hasn't finished is a CTA pressed by nobody; the caption and trust strip pull it into view
  within one thumb-flick.
- **Thumb reach:** every CTA is full-width `min-height: 52px`, centred, with 24px of clear
  space above and below. No two tappable targets within 8px of each other anywhere.
- **Scroll to primary action:** 700px, ~1.05 screens.
- **Worst stretch:** block 4 → block 5, 1,460px with no exit.
- **Two-column collapse:** the hero goes single-column below 880px, proof card under the
  copy. The verdict row is 1-up below 720px, 3-up at 880px. Price tiles 1-up below 720px.

### 10. Hard-rail self-audit

| # | Rail | Status |
|---|---|---|
| 1 | Revora never the agent of a health outcome | **PASS.** Every promised outcome is a *decision* ("one answer", "where it lands"). No sentence makes Revora or its use the thing that achieves a health result. |
| 2 | No fabricated ratings / users / testimonials | **PASS.** Zero social proof of any kind. Both example blocks carry `An illustrated example` / `Illustrated examples`. |
| 3 | SAFE / MODERATE / HIGH never render | **PASS.** All three labels interpolate `RISK_LABELS`. |
| 4 | Clear carries no adjustment and no swap | **PASS**, twice, and one of them is load-bearing: the hero card exists *to* demonstrate it. |
| 5 | Disclaimer visible, never behind a disclosure | **PASS.** `{BOUNDARY_DISCLAIMER}` in the footer, plus the verdict note. The FAQ `<details>` carries no boundary copy that isn't also outside it. |
| 6 | Statistics trace to evidence-pack; trial citation on `/how-it-works` only | **PASS.** No statistic on the page. C1 wanted the DPP number and is denied it. |
| 7 | `.landing-proof-band` left column is a LABEL | **PASS by deletion** — the proof band block is gone; the research disclosure moves to a single link in block 6's FAQ and lives in full on `/how-it-works`. **Flagged:** this removes the page's only research disclosure, which P4 will attack. |
| 8 | WCAG AA; health info never in `--text-soft` | **PASS.** All body copy `--text-body`. `--text-soft` used only for the CTA caption and the illustrated-example label, neither of which is health information. |
| 9 | 44px touch targets | **PASS.** CTAs 52px; nav links 44px; FAQ summaries 48px. **Not asserted by any test** — C1 inherits the gap and does not fix it. |
| 10 | Nothing below 16px except tracked uppercase | **PASS.** Body 17px, ledes 18.5px, captions 16px, only the eyebrow at 13px tracked uppercase. |
| 11 | Verdict colour never the sole channel | **PASS.** Every verdict carries icon + text label. |
| 12 | `prefers-reduced-motion` zeroes motion | **PASS**, via the existing global block. Two animations, both covered. |
| 13 | Focus visible everywhere | **PASS.** No outline removal; `:focus-visible` inherited. |
| 14 | Light surface, no dark bands | **PASS.** Two light planes, no `--landing-band` token, no inverted colour. |
| 15 | Landing is marketing; app lives at `/check` | **PASS.** No input field on the page; every CTA is a `<Link href="/check">`. |

**Tier B pin ledger.**
- **Kept:** `{TASTER_LIMIT} free checks on your first` · `{TASTER_LIMIT} free checks on day one` ·
  `Check up to {TASTER_LIMIT} meals on your first day` · `Your first ${TASTER_LIMIT} checks, on your first day` ·
  `7 days free` · `Days 2–8` · `A free account` · `still no card` ·
  `A weekly recap in sentences` · `A record you can actually show someone` ·
  `It asks before it guesses` (once, as a section H2) · `Add to home screen — works today`.
- **Retired, with reason:** `Two ways in.` / `Three ways in.` and `Dictate it or type it.`
  — the how-it-works block is deleted; with `photoInputEnabled()` false the section sells
  typing and talking as the mechanism. `landing-wiring-pins.test.ts` loses two assertions;
  the mechanism assertion that replaces them is `It asks before it guesses` appearing
  exactly once.
- **Tier A:** all nine pass. Both paywall branches render; `{monthlyPrice}` interpolated;
  `<DemoCheckCard />` present in block 3; no interaction strings retyped.

**Em dashes rendered: 6** (down from 42). One is the approved CTA.

### 11. What this steals from the incumbent, and why that part is good

- **The pains list, four items, near-verbatim.** It is the best prose in the repository and
  C1 did not improve on it. Rewriting it to prove the tournament did something would have
  been vandalism.
- **The eyebrow.** Seven words that answer "what is this" before the headline. Almost
  nothing in this category does that.
- **The Clear card carrying nothing.** F-04 demonstrated, not asserted. C1 promotes it from
  the middle of the page to the hero because it is the single most persuasive object
  available and it was being used as a footnote.
- **Pricing rendered from live flags.** Structurally, the funnel cannot lie. This is rarer
  than it sounds and C1 protects it unchanged.
- **`When we're unsure, we say so.`** The sharpest line on the page. Kept verbatim in the
  trust strip and echoed as the block-3 thesis.

### 12. Primary failure mode

**The mechanism block asks a reader to admire a question, and admiration is not desire.**
Block 3 is C1's centre of gravity: it spends 1,150px and the page's second CTA on the
proposition that *not answering* is a feature. That reasoning is correct and it is also
one level of abstraction above where this reader lives. A frightened person at 6pm wants an
answer; C1's biggest block is about the moment before the answer. If it fails, it fails
because the visitor reads block 3, thinks "so it's slower," and leaves — and the page has
deleted the feature grid that would otherwise have caught them.

Secondary: cutting the proof band removes the page's only research disclosure. C1 believes
`/how-it-works` is the right home for it. P4 will not agree.

---
---

# C2 — IS THIS ONE OKAY?
### by P2, The Restraint Architect

### 1. Name and one-sentence thesis

**Is This One Okay?** The page says the visitor's own sentence back to them in the first
screen and then says only four more things, each at a size and spacing that assumes the
reader is fifty-four and standing up.

### 2. The bet

That the incumbent's problem is quantity, and that the correct instrument is subtraction
rather than rearrangement. Every other contender in this tournament reorganises thirteen
blocks. C2 deletes eight of them and does not replace them.

**What it wagers:** the glance strip, how-it-works, the feature grid, the before/after
grid, the trust section, the Pantry band, the FAQ accordion, and the separate final CTA.
The page ends on the offer.

**What it sacrifices:** every objection this page does not have room to answer explicitly.
C2's position is that objections answered *in passing, inside a sentence the reader was
already reading* land harder than objections answered in a section headed with the
objection. It is betting the tournament that a shorter page converts a scared person better
than a complete one, and it knows that is the least testable claim on the board.

### 3. Section map

**One plane.** The page is `--surface` (white) from the nav to the footer. No sheet, no
band, no hairline, no alternation. Sectioning is done by space: `clamp(96px, 14vw, 176px)`
between blocks, roughly double the incumbent's fluid padding. Contested #3 settled by
deletion.

| # | Block | Purpose | Plane | 375px height | Share |
|---|---|---|---|---|---|
| 1 | Nav + hero | Recognition, then the action | `--surface` | ~940px | 18% |
| 2 | The six months | Why nobody answered this for you | `--surface` | ~1,080px | 21% |
| 3 | What it does | `<DemoCheckCard />`, one caption | `--surface` | ~1,060px | 20% |
| 4 | Three answers | The only cards on the page | `--surface` | ~1,300px | 25% |
| 5 | What it costs | Offer, funnel mechanics, close | `--surface` | ~700px | 13% |
| — | Footer | Nav + disclaimer | `--surface` | ~130px | 3% |

**Totals: 5 blocks + footer. ~5,200px ≈ 7.8 screens at 667px.** Shortest contender.
**CTAs at y ≈ 640 · 1,880 · 4,020 · 4,900. Longest CTA desert: 2,140px.**

### 4. Full copy deck

**Nav**
- Wordmark: `Revora`
- Links: `How it works` · `Pricing`
- Nav CTA: **none.** Contested #4 settled the other way from C5: one filled pill per
  *page*, and it is the hero's. The nav carries two text links and the wordmark. On a
  five-block page the reader is never more than one flick from a CTA.

**Block 1 — Hero**
- Eyebrow: **none.** C2 argues the H1 does the eyebrow's job better, and that an eyebrow
  above a four-word question is scaffolding on scaffolding.
- H1: `Is this one okay?`
- Sub: `That is the question, every night, and nobody answered it for you. Revora is a meal checker built for one situation: an A1C between 5.7% and 6.4%. Describe what is in front of you and it tells you where the meal lands and why, in about ten seconds.`
- CTA: `Check your first meal — free`
- CTA caption: `10 free checks on your first day, then you decide. No login, no card.`
- Trust strip: **none in the hero.** The three ledger lines move to block 5 where they
  answer the billing objection at the moment it arises. (Hero stack discipline: eyebrow
  count 0, text elements 3.)
- Visual half: **none.** The hero is type and one button on white. This is C2's second
  structural claim and its most exposed one.

**Block 2 — The six months**
- H2: `You were handed a number and an appointment six months out.`
- Body, four paragraphs, no bullets, no cards, 17px/1.65 at 62ch:
  - `The advice was two words long. Eat better. Better than what? Is oatmeal fine? Is the sandwich at lunch a problem? Nobody said, and the appointment is in six months.`
  - `Every article contradicts the last one. Fruit is fine, fruit is sugar. Rice is out, brown rice is in. You have read all of it and you still do not know about the plate in front of you tonight.`
  - `The apps want you to become an accountant. Weigh it, log it, scan the barcode, hit your macros. You did not ask for a second job. You asked what to do about dinner.`
  - `So you guess, and then you worry. You eat the thing and spend the next hour wondering whether it was a mistake. That loop is the actual cost of being told nothing.`
- Closing line, set larger (22px, 600): `Revora exists for that gap and nothing else.`
- Scope sentence: `Not a general nutrition app, not a calorie counter, not built for everyone. If your A1C sits outside 5.7% to 6.4%, it says so plainly and points you to a clinician instead of pretending.`
- CTA: `Check your first meal — free`

**Block 3 — What it does**
- H2: `It asks before it guesses.`
- Lede: `Type "oatmeal" and Revora asks whether it is plain or sweetened, because the honest answer depends on it. Most apps pick one and sound confident.`
- `<DemoCheckCard />`
- Caption under the card: `An illustrated example. Every answer ends with the same line: Revora is informational only and is not medical advice.`
- No CTA. **Deliberate.** This is the page's one block without an exit, because the block's
  argument is *wait a second before you answer*, and putting a button under it contradicts
  it. C2 accepts a 2,140px desert here and expects P1 to score it down.

**Block 4 — Three answers**
- H2: `Three meals. Three answers.`
- Lede: `No dashboard, no numbers to decode. The Clear card carries no change to make: when a meal already looks balanced, Revora says so and stops.`
- Three cards, identical copy to C1's block 4 (all three bodies render verbatim from the
  already-approved ledger rows `result-safe-example` / `result-moderate-example` /
  `result-high-example`; meal names from `landing-three-answers`).
- Note: `Illustrated examples.`
- CTA: `Check your first meal — free`
- CTA caption: `10 free checks on your first day, then you decide.`

**Block 5 — What it costs**
- H2: `What it costs`
- Trial branch body, as prose rather than tiles: `Your first day is 10 free checks on day one, with no login and no card. Check up to 10 meals on your first day and see how the answers feel at your own table. After that, 7 days free — a card is required and nothing is charged. On day 5 we email you the exact date and the exact amount, with a one-tap cancel link in it. Then {monthlyPrice}/month, or $99.99 a year, which works out at $8.33 a month.`
- Legacy branch body: `Your first day is 10 free checks on day one, with no login and no card. Check up to 10 meals on your first day and see how the answers feel at your own table. After that, A free account includes 5 free checks a day, still no card, with your history saved. Premium is {monthlyPrice}/month, or $99.99 a year, which works out at $8.33 a month.`
- Three lines, ledger row `home-trust-strip`, verbatim:
  - `No login for your first checks.`
  - `When we're unsure, we say so.`
  - `If you ever subscribe, cancel is one tap — not an email.`
- Pantry line: `There is also a one-time option. The Pantry Review sorts the food already in your kitchen into one report. $49, one payment, nothing renews.` Link: `See a sample report`
- CTA: `Check your first meal — free`
- CTA caption: `No login. No card. 10 free checks on your first day.`
- Closing line under the CTA, 17px: `Your next meal is a fine one to start with.`

**Footer** — two columns below 640px, four above: Product / Learn / Legal / Apps, including
`Add to home screen — works today`, then `{BOUNDARY_DISCLAIMER}`.

**FAQ:** deleted as a block. The four questions are answered inside the prose above — scope
in block 2, mechanism in block 3, account/card and cancellation in block 5, "is this
medical advice" by the footer disclaimer plus the block-4 note. **The FAQPage JSON-LD is
retained** and its `mainEntity` is built from the same four strings, which now live in a
`faqs` array used only by the schema. C2 accepts that this weakens the schema's
"visible answer" guarantee and flags it as its own SEO risk.

### 5. Hero specification

- **Eyebrow: argued away.** `Is this one okay?` is four words and self-classifying in
  context with the sub. Adding `A meal checker built only for prediabetes` above it would
  put a 13px tracked label above a 42px question, which is the 2023 kicker reflex.
  The category answer moves into the sub's second clause, one line down, at 18.5px instead
  of 13px — **larger, not smaller, than where the incumbent puts it.**
- **H1:** `Is this one okay?` at `clamp(2.4rem, 9vw, 3.6rem)`, weight 700, tracking
  `-0.03em`, `text-wrap: balance`. This is the visitor's sentence, not the brand's.
- **Sub:** 46 words, 18.5px/1.6, max 34ch on mobile.
- **CTA + caption.** Caption carries the Tier B pin.
- **The visual half is empty, and that is the specification.** C2's argument: the incumbent
  spends its most valuable 900px showing a card the reader cannot yet interpret, ending in
  a legal disclaimer, so the visitor's first scroll after the CTA is a second wall of text.
  Removing it lets the H1 run at 3.6rem and puts the CTA at y≈640 instead of y≈700. The
  demo is not deleted — it is deferred to block 3, where the reader has been told what it
  is for.
- **Risk, stated by its author:** a hero with no visual is the hardest thing to sell in
  this tournament and P3 and P7 will both attack it.

### 6. The proof strategy

C2 has the least proof surface of any contender and treats that as the point. Three
mechanisms:

1. **The clarifying question**, shown once, in full, uninterrupted by a CTA.
2. **The Clear card carrying nothing** — restraint demonstrated at the moment the reader is
   deciding whether this app is going to be another one that finds fault.
3. **Price and funnel as flat prose.** No tiles, no "most popular" badge, no comparison
   table. C2's claim is that a pricing *layout* is itself a persuasion device and that a
   page which describes its price in a paragraph is read as a page not trying to route you.

**Not used:** the research disclosure (moved entirely to `/how-it-works`), the encryption
and delete promises (they live in the footer's Privacy link), and the feature inventory.
C2 concedes these are real losses and argues they are objections for people who are already
converting.

### 7. Visual system deltas

| Delta | From | To | Why |
|---|---|---|---|
| **Planes** | 3 + hairline | **1** (`--surface` throughout) | Contested #3. Space sections a page; colour bands announce sections. Doubling the gap does the same job with one system instead of five. |
| **Type pairing** | Jakarta + Source Sans 3 | **Plus Jakarta Sans only, body at 17px/1.65** | Contested #1. The stated problem was 14–15px geometric sans for 40–60-year-olds. The variable that was wrong was **size**. C2 fixes the size and removes a font family, a `@font-face`, and a preload from the landing route. |
| Body size | 16.5–17px | **17px flat, 1.65** | One value, one line-height, everywhere below heading level. |
| Card families | 8 | **2** (verdict card, FAQ row → FAQ row also deleted, so effectively **1**) | Contested #5. |
| Radius | 24px × 8 families | 24px × 1 family | Nothing to reconcile when there is one card. |
| Section padding | `clamp(52px, 7vw, 104px)` | `clamp(96px, 14vw, 176px)` | The only sectioning instrument on the page has to be strong enough to be one. |
| Nav CTA | ghost pill | **removed** | Contested #4, per page. |
| Hairline | 1px `--border-soft` between planes | **removed** | No planes to separate. |
| Eyebrows | 4 | **0** | |
| Measure | not specified | `max-width: 62ch` on all prose | 65–75ch is the desktop rule; 62ch reads better at 17px on this content. |

### 8. Motion specification

**Nothing moves, and this is defended rather than defaulted.**

- CTA press keeps `translateY(1px)` at 150ms. That is feedback, not animation, and removing
  it would make the button feel dead.
- No entrance animations, no scroll reveals, no stagger. C2's argument: on a page whose
  entire thesis is deference, motion is the interface asserting itself. `emil-design-eng`'s
  first question is "how often will the user see this animation" — a landing page is seen
  once, so a reveal is pure decoration for the returning visitor and pure delay for the
  scroller.
- **What this buys:** the page renders complete in a headless browser, in a hidden tab, and
  with JavaScript disabled. No reveal can fail to fire because there is no reveal.
- `prefers-reduced-motion: reduce` → nothing to zero. The global block stays because the
  app shell needs it.

### 9. The 375px story

- **Above the fold (667px):** wordmark + 2 nav links · H1 on two lines at 3.6rem
  (`Is this one` / `okay?`) · the full 4-line sub · the CTA at y ≈ 640, **fully visible on a
  375×667 device**, with the caption just below the fold. C2 is the only contender whose
  primary action is above the fold on the smallest supported viewport.
- **Thumb reach:** CTA is full-width less 20px gutters, 52px tall, and always the lowest
  interactive element in its block by ≥ 32px.
- **Scroll to primary action: 0 screens.**
- **Worst stretch:** block 3 → block 4, 2,140px, and it is deliberate.
- **Collapse:** there is almost nothing to collapse. The verdict row is the page's only
  multi-column element: 1-up below 720px, 3-up at 880px. Everything else is a single column
  at every width, capped at 62ch and centred inside `.landing-frame`.
- **Reading-glasses test:** at 17px/1.65 with 62ch measure and one typeface, the page has
  no text smaller than the body except the footer's legal line, which is also 16px.

### 10. Hard-rail self-audit

| # | Rail | Status |
|---|---|---|
| 1 | Never the agent of a health outcome | **PASS.** The promise is "tells you where the meal lands and why". |
| 2 | No fabricated proof | **PASS.** `An illustrated example` / `Illustrated examples` on both example surfaces. |
| 3 | Raw class words never render | **PASS.** `RISK_LABELS` interpolated. |
| 4 | Clear carries no adjustment or swap | **PASS**, and the lede names the absence. |
| 5 | Disclaimer visible, never behind a disclosure | **PASS**, and stronger than the incumbent: with the FAQ accordion deleted, **no boundary copy on this page sits inside a `<details>` at all.** |
| 6 | Statistics trace to evidence-pack | **PASS.** No statistic renders. |
| 7 | Proof band is a LABEL | **PASS by deletion.** Same exposure as C1: the research disclosure leaves the page entirely. |
| 8 | AA; health info never `--text-soft` | **PASS.** `--text-soft` is used for exactly one string on the page (the illustrated-example caption). |
| 9 | 44px targets | **PASS.** Fewer targets than any contender: 4 CTAs, 2 nav links, 3 footer columns. |
| 10 | 16px floor | **PASS**, and exceeded — the page's smallest rendered text is 16px and there is no tracked uppercase anywhere, because there are no eyebrows. |
| 11 | Colour never the sole channel | **PASS.** Icon + label on every verdict. |
| 12 | Reduced motion | **PASS trivially.** No motion to reduce. |
| 13 | Focus visible | **PASS.** |
| 14 | Light surface | **PASS.** One light plane. |
| 15 | Marketing only | **PASS.** |

**Tier B pin ledger.**
- **Kept:** `{TASTER_LIMIT} free checks on your first` · `{TASTER_LIMIT} free checks on day one` ·
  `Check up to {TASTER_LIMIT} meals on your first day` · `7 days free` · `A free account` ·
  `still no card` · `It asks before it guesses` (once) · `Add to home screen — works today`.
- **Retired, with reason:** `Two ways in.` / `Three ways in.` and `Dictate it or type it.`
  (how-it-works deleted) · `A weekly recap in sentences` and
  `A record you can actually show someone` (feature grid deleted; both claims survive only
  on `/subscribe` and `/how-it-works`) · `Days 2–8` (the trial is described in prose, not
  tiles) · `Your first ${TASTER_LIMIT} checks, on your first day` (FAQ deleted).
  **Six Tier B pins retired — the most of any contender.** `landing-wiring-pins.test.ts`
  and `copy-pins.test.ts` both need edits in the same commit.
- **Tier A:** all nine pass. Both branches present, `{monthlyPrice}` interpolated,
  `<DemoCheckCard />` in block 3.
- **New ledger rows required:** the block-5 prose price paragraph is not any existing row
  and needs one (both branches). C2 flags this rather than assuming the existing
  `landing-what-you-get` row covers it. It does not.

**Em dashes rendered: 2.** One is the approved CTA; one is the ledger trust-strip line.

### 11. What this steals from the incumbent, and why that part is good

- **The pains list**, converted from a bulleted card list to four paragraphs. The words are
  the incumbent's; the format is the only thing C2 changed, because bold lead-ins plus
  bullets plus a card is three emphasis systems on writing that needed none.
- **The Clear card's emptiness**, and the lede that points at it.
- **`When we're unsure, we say so.`**
- **The 16px floor and the reading-face instinct.** C2 keeps the instinct and rejects the
  implementation: the owner was right that the body copy was too small and the fix was one
  variable, which was size.
- **The live-flag pricing render**, unchanged in mechanism even though the presentation
  changes from tiles to prose.

### 12. Primary failure mode

**A hero with no image reads as unfinished to a visitor arriving cold, and this audience is
already suspicious.** C2's fold is a question, a paragraph and a button on white. That is
either the most confident thing in the tournament or it looks like a page that failed to
load, and there is no way to know which from first principles. Every competitor in ICP §9
has a product screenshot above the fold. C2 has deliberately given up the one asset that
says *this is a real, finished thing.*

Secondary: with the FAQ, the feature grid and the trust section gone, three of the four
objections are answered *once each, in passing.* If P1 is right that objections need their
own named blocks, C2 has no fallback anywhere on the page.

---
---

# C3 — ONE CARD BACK
### by P3, The Design Engineer

### 1. Name and one-sentence thesis

**One Card Back.** The page's unit of composition is the product's own artifact — the
result card — rendered at three different moments of doubt, with whitespace doing the
sectioning and one earned piece of motion carrying the only idea on the page that is
temporal.

### 2. The bet

That describing this product nine ways is strictly worse than showing it three times, and
that the difference between a page that feels expensive and a page that feels generated
lives in about twenty details nobody consciously notices — which means the page has to be
specified at the level of border weight, device pixel, and press timing, or the
specification is decorative.

**What it wagers:** the feature grid, the glance strip, the before/after grid, the trust
section as a section (its four claims become captions attached to the cards they belong
to), and the how-it-works block.

**What it sacrifices:** verbal completeness. C3 says almost nothing in the abstract. Every
claim it makes is attached to a rendered object, which means claims with no object — "your
data is encrypted at rest", "one optional reminder" — get one line each in the offer block
and no more.

### 3. Section map

**One plane** (`--page-bg`), with white cards floating on it. Contested #3 settled by
deletion, same as C2, arrived at from the opposite direction: C2 removed the bands and kept
white; C3 removes white as a *plane* and keeps it as the card material, so the only white
on the page is a card and white therefore means "this is the product."

| # | Block | Purpose | Plane | 375px height | Share |
|---|---|---|---|---|---|
| 1 | Nav + hero | The artifact, at its calmest | `--page-bg` | ~1,020px | 15% |
| 2 | The gap | Why you're here | `--page-bg` | ~1,120px | 16% |
| 3 | **The pause** | `<DemoCheckCard />` + the one motion | `--page-bg` | ~1,380px | 20% |
| 4 | Three answers | The card at three verdicts | `--page-bg` | ~1,340px | 20% |
| 5 | The offer | Price, funnel, four remaining claims | `--page-bg` | ~1,180px | 17% |
| 6 | Close | Final exit | `--page-bg` | ~630px | 9% |
| — | Footer | Nav + disclaimer | `--page-bg` | ~130px | 2% |

**Totals: 6 blocks + footer. ~6,800px ≈ 10.2 screens.**
**CTAs at y ≈ 760 · 2,020 · 4,600 · 5,700 · 6,240. Longest desert: 2,580px** (block 3 → 4;
C3, like C2, refuses to put a button under the pause).

### 4. Full copy deck

**Nav**
- Wordmark: `Revora`
- Links: `How it works` · `Pricing` · `Pantry Review`
- Nav CTA (ghost, persistent ≥880px): `Check a meal`

**Block 1 — Hero**
- Eyebrow: `A meal checker built only for prediabetes`
- H1: `This is the whole screen.`
- Sub: `Describe a meal and Revora gives you one card: where it lands, why, and — when there is one — a change worth making. Built for an A1C between 5.7% and 6.4%. About ten seconds, and nothing to log.`
- CTA: `Check your first meal — free`
- CTA caption: `10 free checks on your first day, then you decide.`
- Visual half — **a real result card at Clear, rendered in the live `.result-card` classes,
  not a mockup:**
  - Eyebrow: `An illustrated example`
  - Meal row: `Grilled chicken, brown rice, and a side salad`
  - Verdict row: `Clear` (icon + label, the only tinted row)
  - Why row: `This looks like a reasonable fit. The meal already has protein and vegetables, so it looks more balanced than a fast-carb-heavy option.`
  - Fineprint: `Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you.`
  - Caption under the card, outside it: `Nothing else. No score, no dashboard, no change to make — this meal already looks balanced, so that is the whole answer.`
- Trust strip (ledger row, verbatim): `No login for your first checks.` ·
  `When we're unsure, we say so.` · `If you ever subscribe, cancel is one tap — not an email.`

**Block 2 — The gap**
- H2: `Six months is a long time to guess.`
- Lede: `You were handed a number, two words of advice, and an appointment half a year away. Everything in between is supposed to be your job to figure out.`
- Four items, as a plain `<ul>` with bold lead-ins (no card, no border, 28px row gap): the
  incumbent's four pains, verbatim as in C1 block 2.
- Scope note: `Revora exists for that gap and nothing else. Not a general nutrition app, not a calorie counter, not built for everyone. If your A1C sits outside 5.7% to 6.4%, it says so plainly and points you to a clinician instead of pretending.`
- CTA: `Check your first meal — free`
- CTA caption: `No login, no card, nothing to install.`

**Block 3 — The pause**
- H2: `It asks before it guesses.`
- Lede: `Four letters is not enough to answer honestly, so Revora does not answer yet. Plain oatmeal and sweetened oatmeal are different meals. Watch what happens.`
- `<DemoCheckCard />`, full width, with the motion described in part 8.
- Caption: `An illustrated example. Most apps take the same four letters and return a confident number.`
- No CTA.

**Block 4 — Three answers**
- H2: `The same card, three times.`
- Lede: `One layout, whatever the answer is. The Clear card carries no change to make, because when a meal already looks balanced Revora says so and stops. It does not invent a correction to look useful.`
- Three cards (copy identical to C1 block 4, rendered in live result-card classes).
- Note: `Illustrated examples.`
- CTA: `Check your first meal — free`

**Block 5 — The offer**
- H2: `Ten free checks, then a week, then a decision.`
- Trial tiles:
  - `Day 1` · `10 free checks` · `Check up to 10 meals on your first day, no login and no card. They live on this device.`
  - `Days 2–8` · `7 days free` · `Card required, nothing charged. Day 5, we email you the exact date and the exact amount, with a one-tap cancel link in it.`
  - `After your free week` · `{monthlyPrice}/month` · `Or $99.99 a year, which is $8.33 a month. Cancel in one tap, effective at the end of the period.`
- Legacy tiles: `Day 1` / `10 free checks` (same body) · `Every day` · `A free account` ·
  `No card. A free account still includes 5 free checks a day, still no card, with your history saved to your account.` · `Premium` · `{monthlyPrice}/month` · (same body)
- Four remaining claims, one line each, under the tiles:
  - `Unlimited checks, and A record you can actually show someone — every check saved, on every device.`
  - `A weekly recap in sentences. Never a grade, never a lab prediction.`
  - `One optional reminder a day, off by default. Skip a day and nothing turns red.`
  - `Your A1C and meal text encrypted at rest, deleted in one tap, account included.`
- Pantry: `Or check the whole kitchen, once. The Pantry Review sorts what you already own into one printable report. $49, one payment, nothing renews.` Link: `See a sample report`
- CTA: `Check your first meal — free`

**Block 6 — Close**
- H2: `Try it on the meal in front of you.`
- Sub: `Describe it. Revora tells you where it lands and why, in about ten seconds.`
- CTA: `Check your first meal — free`
- CTA caption: `No login. No card. 10 free checks on your first day.`
- FAQ: four `<details>` rows below the close, same four Q&A as C1 block 7, headed
  `Fair questions`. C3 keeps them because the FAQPage JSON-LD needs visible answers, and
  argues the accordion belongs *after* the last CTA, not before it.

**Footer** — as incumbent, plus `{BOUNDARY_DISCLAIMER}`.

### 5. Hero specification

- **Eyebrow: kept**, and it is the page's only one.
- **H1:** `This is the whole screen.` Four words that describe the object beside them. It
  is a deictic headline — it only works if the thing it points at is genuinely the product,
  which is exactly the constraint C3 wants on itself.
- **Sub:** 38 words.
- **Visual half — specified to the pixel, because that is this contender's whole argument:**
  - It is a **real `.result-card`**, same classes, same anatomy rows (Meal · Signal · Why ·
    fineprint), not a hand-built facsimile. If the product's card changes, this changes.
  - **Border: 1.5px, not 2px.** At `devicePixelRatio: 2` a 2px border on a 24px radius reads
    heavy at card scale; 1.5px lands on 3 device pixels and holds the corner without
    thickening it. The landing's 2px `--border-soft` recipe was chosen for eight card
    families; C3 has two.
  - **Radius 12px, not 24px.** Contested #2. 24px on a card containing four stacked
    typographic rows is the single largest contributor to the page's soft-consumer-SaaS
    read. 12px keeps it a document.
  - **Shadow: unchanged** — `0 18px 40px rgba(15,23,42,0.08)`, the one shadow.
  - Verdict row is the only tinted row (`--safe-bg` fill, `--safe-text` text, both AA).
  - The card is **not** in a bezel. `.landing-phone` is deleted; the class name has been
    lying since 2026-07-27.
- **CTA press state, specified:** `transform: translateY(1px) scale(0.985)`, 120ms,
  `cubic-bezier(0.23, 1, 0.32, 1)`, on `:active` — feedback on pointer-**down**, not on
  release. `transition-property: transform, background-color`, never `all`.

### 6. The proof strategy

C3's proof is that **everything shown is the real thing**, and it makes that checkable:

1. **Every card on this page renders in the live `.result-card` / `.result-anatomy`
   classes.** Not a screenshot, not a mockup, not a div arrangement that resembles the
   product. If the product's card drifts, the landing drifts with it, in the same commit.
2. **The demo's three interaction strings come from the promise registry**, pinned by
   `promise-registry.test.ts` to the real precheck output. The page cannot show a
   conversation the engine would not have.
3. **The Clear card carries nothing**, and the caption under it names the absence.
4. **The funnel renders from the flags checkout enforces.**

C3 explicitly rejects "trust badges", a research section, and any claim it cannot attach to
a rendered object. Its argument: on a page whose thesis is *this is the real screen*, a
trust section is a second, weaker kind of evidence that dilutes the first.

### 7. Visual system deltas

| Delta | From | To | Why |
|---|---|---|---|
| **Planes** | 3 + hairline | **1** (`--page-bg`); white is card-only | White stops being a background and becomes a material that means "product". |
| **Card radius** | 24px, all 8 families | **12px** | Contested #2. A 24px radius on a four-row typographic document reads as a consumer app tile. |
| **Card border** | 2px `--border-soft` | **1.5px** `--border-soft` | Lands on 3 device pixels at DPR 2; 2px at 24px radius visually thickens the corner arc. |
| Card families | 8 | **2** (result card · price tile) | Contested #5. |
| Shadow | one card shadow | unchanged | No delta. Best rule in the file. |
| Type pairing | Jakarta + Source Sans 3 | unchanged | No delta. The pairing is display-vs-text and it is doing real work in the card, where the verdict is Jakarta 700 and the reason is Source Sans 3 400. |
| Nav CTA | ghost | ghost, persistent ≥880px | Contested #4, per screenful. |
| CTA transition | `--dur` 200ms on hover/active | 120ms `:active`, custom cubic-bezier, pointer-down | Press feedback under 160ms is the threshold where a button feels connected to the finger. |
| Focus ring | `rgba(13, 95, 87, 0.45)` | unchanged, but 2px offset on cards | An inset ring on a 12px radius clips visually; 2px offset clears it. |
| Eyebrows | 4 | **1** | |

### 8. Motion specification

**One animation on the page, and it is the only idea here that is temporal.**

**The pause (block 3).** When the demo card enters the viewport, the sequence renders in
three beats:

| Beat | Element | Property | Timing |
|---|---|---|---|
| 0ms | `You type: oatmeal` | already visible | — |
| 0ms | clarify block | `opacity 0 → 1`, `translateY(6px) → 0` | 220ms, `cubic-bezier(0.23, 1, 0.32, 1)` |
| **+520ms** | `You answer:` + result card | `opacity 0 → 1`, `translateY(6px) → 0` | 240ms, same curve |

The 520ms gap is the entire point: it is the product's willingness to wait, made visible.
It is not a loading simulation and it is not a typewriter effect — nothing pretends to be
computing.

**Non-negotiable implementation constraints:**
- **The animation enhances an already-visible default.** The result card ships in the DOM,
  rendered, `opacity: 1`, and the animation is applied by an `IntersectionObserver` adding
  a class. A headless render, a hidden tab, or a JS failure ships the complete card. No
  content is ever gated on a transition firing.
- **`transform` and `opacity` only.** No `height`, no `width`, no `top`.
- Runs **once** (`{ once: true }`, `amount: 0.4`). Nothing loops anywhere on this page.
- **`prefers-reduced-motion: reduce` → the class is never added.** Not a shortened
  animation, not a crossfade: the card is simply present from the start, which is its
  default state anyway. The global block covers it, and C3 additionally gates the observer
  in JS so no work happens at all.
- Everything else on the page is static. Two CSS transitions exist site-wide: CTA press
  and link colour.

### 9. The 375px story

- **Above the fold (667px):** ghost nav CTA · eyebrow · H1 on one line at
  `clamp(2rem, 7vw, 2.6rem)` · 3 of 4 sub lines. The result card begins at y ≈ 470 and its
  verdict row (`Clear`, green, icon + text) is **visible above the fold at y ≈ 600** — the
  reader sees the product's answer state before scrolling.
- **CTA at y ≈ 760**, one flick down.
- **Card at 375px:** 335px wide, 20px internal padding, four rows, 12px radius. The Clear
  hero card is 5 rows / ~210px, versus the incumbent's 15-line demo card.
- **Thumb reach:** all CTAs full-width, 52px, 32px clearance.
- **Scroll to primary action:** 760px, ~1.14 screens.
- **Worst stretch:** 2,580px (block 3 → 4).
- **Collapse:** hero single-column below 880px, card below copy. Verdicts 1-up below 720px,
  3-up at 880px. Price tiles 1-up below 720px, 3-up at 880px.
- **The motion at 375px:** the demo card is ~600px tall on mobile, taller than half the
  viewport, so the observer threshold is 0.4 rather than 0.5 — otherwise on a small phone
  the sequence fires while the top of the card is already scrolled past.

### 10. Hard-rail self-audit

| # | Rail | Status |
|---|---|---|
| 1 | Never the agent of a health outcome | **PASS.** |
| 2 | No fabricated proof | **PASS**, and structurally: every card is either the pinned demo or an `Illustrated example`-labelled ledger row. |
| 3 | Raw class words never render | **PASS.** |
| 4 | Clear carries no adjustment or swap | **PASS**, three times: hero card, block-4 Clear card, and both captions name the absence. |
| 5 | Disclaimer visible | **PASS.** The hero card carries the full fineprint inside it (it is a real result card, so it inherits `DisclaimerLine`), plus the footer. |
| 6 | Statistics trace to evidence-pack | **PASS.** None render. |
| 7 | Proof band is a LABEL | **PASS by deletion.** Same exposure as C1 and C2. |
| 8 | AA; health info never `--text-soft` | **PASS.** Reason rows are `--text-body`; `--text-soft` only on captions and the illustrated-example eyebrow. |
| 9 | 44px targets | **PASS.** |
| 10 | 16px floor | **PASS.** The card's fineprint is the risk here — in the app it is 14px. On the landing C3 sets `.landing .result-disclaimer { font-size: 16px }`, one declaration, no override block. |
| 11 | Colour never sole channel | **PASS.** Verdict row is icon + label + tint; the tint is third. |
| 12 | Reduced motion | **PASS**, doubly — CSS global block plus a JS gate on the observer. C3 is the only contender that adds motion, so it carries the burden of specifying this properly. |
| 13 | Focus visible | **PASS**, with a 2px offset fix for the 12px radius. |
| 14 | Light surface | **PASS.** One light plane. |
| 15 | Marketing only | **PASS.** |

**Tier B pin ledger.**
- **Kept:** `{TASTER_LIMIT} free checks on your first` · `Check up to {TASTER_LIMIT} meals on your first day` ·
  `7 days free` · `Days 2–8` · `A free account` · `still no card` ·
  `A weekly recap in sentences` · `A record you can actually show someone` (once) ·
  `It asks before it guesses` (once) · `Your first ${TASTER_LIMIT} checks, on your first day` (FAQ) ·
  `Add to home screen — works today`.
- **Retired:** `Two ways in.` / `Three ways in.` · `Dictate it or type it.` ·
  `{TASTER_LIMIT} free checks on day one` (no pricing lede — the H2 carries the number).
- **Tier A:** all nine pass.
- **New CSS rule required:** `.landing .result-disclaimer` font-size override, which must
  not create a second `font-size` declaration on an existing `.landing*` selector.

**Em dashes rendered: 7.** One is the approved CTA; three are inside already-approved
ledger result copy and cannot be stripped.

### 11. What this steals from the incumbent, and why that part is good

- **The decision to render real result-card markup rather than a screenshot.** The
  incumbent already does this and it is genuine craft. C3's contribution is to notice it and
  make it the organising principle instead of a detail inside one component.
- **The Clear card carrying nothing.**
- **The pains list.**
- **The eyebrow.**
- **The single card shadow.** C3 changes the radius and the border weight and does not touch
  the shadow, because one shadow across a whole system is the rule most responsible for the
  page not looking assembled.
- **`promise-registry.test.ts` pinning the demo to the real precheck.** That test is the
  reason C3's central claim is honest rather than aspirational.

### 12. Primary failure mode

**Craft that the visitor cannot see, spent on a visitor who is not looking.** C3 changes a
border from 2px to 1.5px, a radius from 24 to 12, and a press from 200ms to 120ms, and none
of those will move a conversion rate on their own. Meanwhile it has cut the feature grid,
the trust section and the how-it-works block — real informational surface — in exchange for
a 520ms pause. If C3 loses, it loses because it optimised the twenty things nobody notices
while deleting the three things somebody did.

Secondary and more concrete: **the 520ms pause is the only thing on the page a visitor can
misread as slowness.** The block's headline says "it asks before it guesses", but a reader
who does not read the headline sees an app take half a second longer than every app they
have ever used, and half a second is exactly long enough to notice and not long enough to
mean anything.

---
---

# C4 — BUILT FOR ONE NUMBER
### by P4, The Clinical Trust Officer

### 1. Name and one-sentence thesis

**Built for One Number.** The page opens by telling most of its readers to leave, and every
sentence after that is credible because of it.

### 2. The bet

That in a category where every competitor returns a confident number for any input and
every complaint thread is *about* that confidence, the fastest route to belief is to
disqualify the reader in the first screen — and that the claims boundary, currently
distributed as fine print across four blocks, is the strongest single asset on the page and
should be its architecture.

**What it wagers:** the emotional hook. C4 leads with scope, not with the six-month wait,
which means it gives up the recognition moment as an opening move and trusts that a reader
who is in-scope will feel *found* rather than *screened*.

**What it sacrifices:** warmth at the fold. C4 is the only contender whose first screen
contains a sentence telling the visitor this product may not be for them, and it knows P6
will score that at a 3.

### 3. Section map

Two planes: `.landing-sheet` for the two blocks that carry evidence, `--page-bg` for
everything else. The tint band is retired. C4 uses plane change as an *evidential* signal,
not a rhythmic one: white means "this block is making a checkable claim."

| # | Block | Purpose | Plane | 375px height | Share |
|---|---|---|---|---|---|
| 1 | Nav + hero | Scope. The disqualification. | `.landing-sheet` | ~960px | 14% |
| 2 | What it does | The three labels, defined | `--page-bg` | ~1,180px | 17% |
| 3 | **What it refuses to do** | The four refusals, as features | `.landing-sheet` | ~1,240px | 18% |
| 4 | The question | `<DemoCheckCard />` | `--page-bg` | ~1,120px | 16% |
| 5 | Where the guidance comes from | Sources, hedged, attributed | `--page-bg` | ~700px | 10% |
| 6 | What it costs and when | Offer as billing mechanics | `--page-bg` | ~1,180px | 17% |
| 7 | Fair questions + close | FAQ, then the last exit | `--page-bg` | ~620px | 9% |
| — | Footer | Nav + disclaimer | `--page-bg` | ~130px | 2% |

**Totals: 7 blocks + footer. ~7,000px ≈ 10.5 screens.**
**CTAs at y ≈ 720 · 2,020 · 3,300 · 5,120 · 6,600. Longest desert: 1,820px.**

### 4. Full copy deck

**Nav**
- Wordmark: `Revora`
- Links: `How it works` · `Pricing` · `Pantry Review`
- Nav CTA: **none.** Contested #4 settled per page — C4 argues that a persistent sell
  button contradicts a page whose first move is to send people away.

**Block 1 — Hero**
- Eyebrow: **none.** The H1 is the scope statement, so an eyebrow that also states scope
  would be the claim twice.
- H1: `Built for one number. If yours isn't in it, this isn't for you.`
- Sub: `Revora is a meal checker for adults whose A1C came back between 5.7% and 6.4%. Not a calorie counter, not a diabetes app, not a general nutrition app. Enter a number outside that range and it says so plainly and points you to a clinician instead of answering.`
- CTA: `Check your first meal — free`
- CTA caption: `10 free checks on your first day, then you decide. No login, no card.`
- Trust strip (ledger row, verbatim, three items).
- Visual half — **the scope card**, a plain bordered block, not a result card:
  - Label: `What Revora answers`
  - Row 1: `Your A1C is 5.7% to 6.4%` → `Revora gives you an educational read on the meal.`
  - Row 2: `Your A1C is below 5.7%` → `Out of scope. Revora says so and points you to a clinician.`
  - Row 3: `Your A1C is 6.5% or above` → `Out of scope. That range is used when evaluating Type 2 diabetes, and Revora's prediabetes bands do not apply there.`
  - Footnote: `Revora is informational only and is not medical advice.`

**Block 2 — What it does**
- H2: `Three labels, and what each one means`
- Lede: `The labels describe general meal patterns. They are educational categories, not measurements of you. Your A1C range only makes the presentation more cautious; it does not predict your response or decide whether a meal is medically appropriate for you.`
- Three definition rows (label · meaning · what it never means):
  - `Clear` · `The meal you described looks generally balanced under Revora's documented meal-composition rules.` · `It does not mean the meal is safe for you, and it does not predict how you will respond.`
  - `Be careful` · `The description leans toward a concentrated or less-balanced pattern, where a practical adjustment may help.` · `It is not a measured glucose response and not a risk finding about you.`
  - `Hold off` · `The description is unusually concentrated or materially incomplete, so Revora gives its most cautious educational presentation.` · `It is not a medical prohibition and not an emergency warning.`
- Closing line: `A Clear result carries no change to make. Revora cannot attach one, and no screen anywhere in the product promises one.`
- CTA: `Check your first meal — free`

**Block 3 — What it refuses to do**
- H2: `Four things Revora will not do`
- Lede: `Most of what makes this product trustworthy is what it declines to produce. These are not disclaimers. They are the design.`
- Four items:
  - `It will not give you a number.` `No glycemic index, no glycemic load, no predicted spike, no milligrams per decilitre. Those numbers would be more satisfying and Revora does not have them about you.`
  - `It will not predict your next test.` `Nothing in Revora forecasts an A1C, a lab result, or what happens over six months. It reads the meal in front of you and stops there.`
  - `It will not invent a correction to look useful.` `When a meal already looks balanced, the answer is the label and the reason, and there is nothing else on the card.`
  - `It will not pretend to be sure.` `When a description is genuinely ambiguous, Revora asks one question rather than picking the likelier reading and sounding confident.`
- Closing line: `Everything above is checkable in your first ten checks, before you have given anyone a card.`
- CTA: `Check your first meal — free`
- CTA caption: `10 free checks on your first day, then you decide.`

**Block 4 — The question**
- H2: `It asks before it guesses`
- Lede: `Type "oatmeal" and Revora asks whether it is plain or sweetened, because the honest answer depends on it. Every alternative you have tried would have picked one and sounded certain.`
- `<DemoCheckCard />`
- Caption: `An illustrated example. The question shown is the one the product actually asks — it is pinned to the live behaviour by a test, not written for this page.`
- CTA: `Check your first meal — free`

**Block 5 — Where the guidance comes from**
- H2: `Where the guidance comes from, and what it does not prove`
- Body: `Revora's general meal-planning principles map to public-health guidance and cited nutrition research — that carbs raise blood sugar, that pairing them with protein, fibre or nonstarchy vegetables can slow the rise, and that less-refined carbs generally land more gently than highly refined ones.`
- Second paragraph: `Those sources support narrow educational statements about food. They are not evidence that Revora produces a particular health result, and nothing on this page claims otherwise.`
- Link: `Read the sources and the limits`
- **Proof band left column: the label `Sources`.** A number there would read as Revora's own
  result and is out of bounds (rail 7). C4 is the only contender that keeps this block, and
  it keeps it precisely so the rail has something to bind to.

**Block 6 — What it costs and when**
- H2: `What it costs, and exactly when`
- Lede (trial): `The funnel is the promise: 10 free checks on day one, a free week, and a cancel button that lives on your account page — not behind an email.`
- Lede (legacy): `The funnel is the promise: 10 free checks on day one, a free account every day after, and a cancel button that lives on your account page — not behind an email.`
- Trial tiles:
  - `Day 1` · `10 free checks` · `Check up to 10 meals on your first day, no login and no card. They live on this device only.`
  - `Days 2–8` · `7 days free` · `A card is required and $0 is charged. On day 5 we email you the exact charge date and the exact amount, with a one-tap cancel link in that email.`
  - `After your free week` · `{monthlyPrice}/month` · `Or $99.99 a year, which works out at $8.33 a month. Cancel in one tap from your account page, effective at the end of the paid period. No retention screens.`
- Legacy tiles: `Day 1` / `10 free checks` (same) · `Every day` · `A free account` ·
  `No card. A free account still includes 5 free checks a day, still no card, with your history saved to your account.` · `Premium` · `{monthlyPrice}/month` · (same as trial tile 3)
- What a paid account adds, four lines:
  - `Unlimited checks, and A record you can actually show someone at your next appointment.`
  - `A weekly recap in sentences about what you did. Never a grade, never a lab prediction.`
  - `One optional daily reminder, off by default.`
  - `Your A1C and meal text encrypted at rest, stored only with your consent, deleted in one tap.`
- Pantry: `A separate one-time option: the Pantry Review sorts the food already in your kitchen into one printable report. $49, one payment, nothing renews.` Link: `See a sample report`
- CTA: `Check your first meal — free`

**Block 7 — Fair questions + close**
- FAQ, five entries (C1's four plus one C4 adds):
  - `Is Revora medical advice?` → (as C1)
  - `Who is Revora for?` → (as C1)
  - `Do I need an account or a card to try it?` → (as C1, both branches)
  - `How do I cancel?` → (as C1)
  - `What happens if I describe something that isn't food?` → `Revora says it can only classify foods or meals, and gives you an example of what a valid entry looks like. It does not turn the input into a judgment.`
- Close H2: `Try it on the meal in front of you.`
- Sub: `Describe it. Revora tells you where it lands and why, in about ten seconds — and tells you when it isn't sure.`
- CTA: `Check your first meal — free`
- CTA caption: `No login. No card. 10 free checks on your first day.`

**Footer** — as incumbent, plus `{BOUNDARY_DISCLAIMER}`.

### 5. Hero specification

- **Eyebrow: argued away**, because the H1 *is* the category-plus-scope statement and an
  eyebrow would state it twice at a smaller size.
- **H1:** `Built for one number. If yours isn't in it, this isn't for you.` Twelve words,
  two sentences, and the second one is the differentiator. No other page in this category
  opens by shrinking its own market.
- **Sub:** 47 words, and every clause is a scope claim traceable to
  `claims-boundary.md` §Current Product Boundary and the approved `below-range-route` /
  `high-range-route` behaviours.
- **CTA:** unchanged, ledger-approved.
- **Visual half: the scope card, not a result card.** C4's deliberate departure from every
  other contender. Its argument: the hero's job on this page is not to show the output but
  to show the *boundary*, and the boundary is a three-row table with an honest out-of-scope
  answer in two of the three rows. Two-thirds of the hero's visual surface is Revora saying
  no. That is the page's entire thesis rendered as an object.
- **What C4 gives up by doing this:** the product's actual output does not appear until
  block 2's definitions and does not appear *as a card* until block 4. C4 accepts it.

### 6. The proof strategy

Five mechanisms, ranked by how checkable they are:

1. **The refusals are verifiable in the free tier, before a card is given.** Every claim in
   block 3 can be falsified by the visitor in ten checks. That is the strongest form of
   proof available to a product with no testimonials: *a claim the reader can break.*
2. **The clarifying question, and the fact that it is pinned to live behaviour by a test.**
   C4 is the only contender that says this out loud on the page. Its argument: telling a
   burned audience that the example is machine-verified against production is a stronger
   trust move than any badge, and it is true.
3. **The out-of-scope routes, quoted in the hero.** A product that will not answer for
   two-thirds of the A1C spectrum is making a costly, checkable commitment.
4. **The sources block, hedged and attributed**, with the do-not-claim limit stated in the
   same paragraph as the claim.
5. **Billing as dates and amounts.** Day 5. Exact amount. One-tap link in the email.

**Not used:** ratings, counts, testimonials, "clinically" anything, the DPP statistic, and
any accuracy claim whatsoever.

### 7. Visual system deltas

| Delta | From | To | Why |
|---|---|---|---|
| Planes | 3 + hairline | **2**, and semantic: `.landing-sheet` marks evidence-bearing blocks | Contested #3. The plane carries meaning rather than rhythm. |
| Tint band | `.landing-band` on 3 blocks | **retired** | Its only job was rhythm, and rhythm is now `clamp` padding. |
| Card families | 8 | **3** (scope card · definition row · price tile) | Contested #5. |
| Radius | 24px all | 24px kept, **except** the scope card and definition rows at **14px** | Contested #2, split: a table-shaped object at 24px reads as a widget. 14px is already on the scale (nested cards). |
| Type pairing | Jakarta + Source Sans 3 | unchanged | No delta. |
| Body size | 16.5–17px | 17px flat | One value. |
| Eyebrows | 4 | **0** | |
| `--text-soft` usage | hints | **restricted further:** never used inside blocks 1, 2, 3 or 5 | Those four blocks are entirely health-scope information, and rail 8 says health info never renders in hint styles. C4 enforces it by block, not by judgment. |
| Voice licence | §Voice applied to landing | **not taken** | Contested #6. C4 is the only contender that declines the licence: it holds the landing to the same permission-first, no-mood-copy rule as app surfaces, on the grounds that a page about honesty cannot use a looser register than the product. |

### 8. Motion specification

**Nothing moves except press feedback.** CTA `translateY(1px)`, 150ms, existing token.

C4's argument: motion on this page would be the one decorative element on a surface whose
entire claim is that nothing here is decoration. `prefers-reduced-motion` has nothing to
zero; the global block stays for the app shell.

**One exception considered and rejected:** animating the scope card's three rows in
sequence. Rejected because the row that matters most to two-thirds of visitors is the
out-of-scope row, and sequencing it last would be the page choosing to reveal the
disqualification slowly. If the page's thesis is that the boundary is stated up front, the
boundary renders up front.

### 9. The 375px story

- **Above the fold (667px):** wordmark + 3 nav links · H1 on three lines · 2 of 4 sub
  lines. **The disqualification sentence is fully visible above the fold on a 375×667
  device.** That is the design.
- **CTA at y ≈ 720.** Scope card begins at y ≈ 900.
- **Scope card at 375px:** three rows stacked, each `condition` above `answer` (not
  side-by-side), 14px radius, 1px `--border-strong`, 16px row padding, hairline between
  rows only. ~290px tall.
- **Thumb reach:** all CTAs 52px, full width.
- **Scroll to primary action:** 720px, ~1.08 screens.
- **Worst stretch:** 1,820px (block 4 → 6, since block 5 has no CTA).
- **Collapse:** definition rows are single-column at every width — three rows of
  label/meaning/never-means side by side would be a table at 375px and C4 will not ship one.
  Price tiles 1-up below 720px.
- **Reading level:** blocks 2 and 3 are the most demanding prose on the board. C4 caps
  sentences at 24 words in those blocks and sets them at 17px/1.7 rather than 1.65.

### 10. Hard-rail self-audit

C4 is the persona that owns this section, so it walks all fifteen against the rendered copy
rather than the intent.

| # | Rail | Status |
|---|---|---|
| 1 | Never the agent of a health outcome | **PASS.** Zero outcome verbs. The strongest promise on the page is `gives you an educational read on the meal`. |
| 2 | No fabricated proof | **PASS.** `An illustrated example` on the demo; the scope card is not example data, it is product behaviour. |
| 3 | Raw class words never render | **PASS.** Block 2's definitions use `RISK_LABELS`; the internal class names appear nowhere. |
| 4 | Clear carries no adjustment or swap | **PASS**, and block 2's closing line states the constraint explicitly rather than hedging it: `Revora cannot attach one`. |
| 5 | Disclaimer visible, never behind a disclosure | **PASS.** The hero scope card carries the boundary line at the fold — earlier than any other contender puts it — plus the footer. |
| 6 | Statistics trace to evidence-pack; trial citation on `/how-it-works` only | **PASS**, and this is the rail C4 exists to protect. Block 5 states the sources qualitatively (CDC-MEAL-PLANNING, CDC-HEALTHY-CARBS, CDC-FIBER-GUIDANCE), names no study, quotes no percentage, and links out. The Shukla trial citation stays on `/how-it-works`. |
| 7 | Proof band left column is a LABEL | **PASS**, and C4 is the only contender that keeps the block at all. Left column renders the string `Sources`. |
| 8 | AA; health info never `--text-soft` | **PASS**, enforced structurally: `--text-soft` is banned from blocks 1, 2, 3 and 5 by rule, not by review. |
| 9 | 44px targets | **PASS.** |
| 10 | 16px floor | **PASS.** No tracked uppercase anywhere (no eyebrows), so the floor is simply 16px with no exception in play. |
| 11 | Colour never sole channel | **PASS.** Block 2's definitions carry no verdict colour at all; the labels are text. The demo card carries icon + label. |
| 12 | Reduced motion | **PASS.** No motion. |
| 13 | Focus visible | **PASS.** |
| 14 | Light surface | **PASS.** |
| 15 | Marketing only | **PASS.** |

**Ledger check — the discipline P4 will apply to every contender in Phase 9, applied here first.**
Strings on this page that are **not** covered by an existing `copy-ledger.md` row and
**need one before ship**:
- The hero H1 and sub (new scope framing; nearest existing row is `landing-audience-pains`,
  which is a body block, not a headline).
- The three scope-card rows (derived from approved `below-range-route`,
  `high-range-route` and `product-home-hero`, but recombined and shortened — a derived row
  is still a new row).
- All four block-3 refusal items.
- Block 2's three label definitions (derived from `claims-boundary.md` §Verdict Semantics
  and `product-marketing.md` §Verdict language, neither of which is a ledger row).
- The block-5 sources paragraphs (nearest is the incumbent's proof-band copy, unledgered).
- The fifth FAQ entry, which paraphrases `result-non-food-refusal`.

**Seven new ledger rows.** C4 has the largest ledger debt of any contender and says so
rather than being caught by it in Phase 9.

**Tier B pin ledger.**
- **Kept:** `{TASTER_LIMIT} free checks on your first` · `{TASTER_LIMIT} free checks on day one` ·
  `Check up to {TASTER_LIMIT} meals on your first day` · `Your first ${TASTER_LIMIT} checks, on your first day` ·
  `7 days free` · `Days 2–8` · `A free account` · `still no card` ·
  `A weekly recap in sentences` · `A record you can actually show someone` ·
  `It asks before it guesses` · `Add to home screen — works today`. **All twelve retained.**
- **Retired:** `Two ways in.` / `Three ways in.` and `Dictate it or type it.` only.
  **C4 retires the fewest Tier B pins of any contender.**
- **Tier A:** all nine pass.

**Em dashes rendered: 5.**

### 11. What this steals from the incumbent, and why that part is good

- **`When we're unsure, we say so.`** The sharpest line on the page, and C4 builds an entire
  block on the mechanism behind it.
- **The proof band, kept intact including the `Sources` label.** C4 is the only contender
  that does. The incumbent's instinct — hedge the sources, state the do-not-claim limit in
  the same breath, link out for detail — is exactly right and the tournament nearly deleted
  it three times.
- **The scope sentence** from `landing-audience-pains`: *"if your A1C sits outside that
  range, Revora says so plainly and points you to a clinician instead of pretending."* C4
  promotes it from a paragraph's last clause to the page's headline.
- **The Clear card carrying nothing.**
- **Live-flag pricing.** The single best structural honesty guarantee in the codebase.
- **The FAQ, kept and extended.** Every other contender treats the accordion as a landfill;
  C4's position is that it is landfill only when the answers are marketing. Five real
  answers to five real questions is a good use of 620px.

### 12. Primary failure mode

**The page is admirable and cold, and the visitor is frightened.** C4's first screen tells
a scared person that this may not be for them, its second screen defines three educational
categories, and its third screen is a list of four things the product will not do. Nowhere
in the first 3,300 pixels does anyone acknowledge that the reader is having a hard time.
The incumbent's best asset — the pains list, the best prose in the repository — does not
appear on this page at all, because C4 replaced the emotional opening with an evidential
one.

If C4 fails, it fails at the fold, silently, to exactly the fourth objection P6 named: the
visitor does not think *this page is dishonest*, they think *this page is not talking to
me*, and they leave without a reason they could articulate. And because C4's whole
architecture is the boundary, there is no smaller fix — you cannot warm up block 1 without
losing the bet.

---
---

# C5 — WITHIN REACH
### by P5, The Legibility Realist

### 1. Name and one-sentence thesis

**Within Reach.** The page is authored as a 375px document with a persistent thumb-zone
action, and the desktop layout is that document widened — because the measured failure on
this page is not the argument, it is five thousand pixels between being convinced and being
able to act.

### 2. The bet

That the conversion problem here is physical. The incumbent's argument is broadly sound and
its copy is better than most of this tournament will admit; what it has is a 12,942px page
with a 5,090px stretch containing no way to act, a 44px touch rule that no test asserts, a
16px floor held up by two CSS comments, and four `prefers-reduced-motion` blocks nobody
checks.

**What it wagers:** the persistent bottom action bar. This requires retiring "one filled
pill per viewport" as written, and it puts a fixed element on the page for the whole
session — which P2 and P3 will both call an intrusion.

**What it sacrifices:** brevity. C5 is the **longest** contender at 12.9 screens. It
explicitly refuses to buy scroll reduction with information loss, on the grounds that this
audience reads, re-reads, and abandons pages that feel like they are hiding something. It
buys reachability instead.

### 3. Section map

Two planes, alternated only three times across nine blocks — enough to signal a change of
subject, not enough to stripe.

| # | Block | Purpose | Plane | 375px height | Share |
|---|---|---|---|---|---|
| 1 | Nav + hero | Category, scope, action | `.landing-sheet` | ~900px | 10% |
| 2 | The six months | Recognition | `--page-bg` | ~1,180px | 14% |
| 3 | How a check goes | Three real steps, no `Step N` eyebrows | `.landing-sheet` | ~980px | 11% |
| 4 | The question | `<DemoCheckCard />` | `--page-bg` | ~1,150px | 13% |
| 5 | Three answers | Proof | `.landing-sheet` | ~1,300px | 15% |
| 6 | What you get | Six items, ranked, ranking **visible** | `--page-bg` | ~1,240px | 14% |
| 7 | What it costs | Offer + billing mechanics | `--page-bg` | ~1,200px | 14% |
| 8 | Fair questions | FAQ, 4 entries | `--page-bg` | ~560px | 7% |
| 9 | Close | Final exit | `--page-bg` | ~360px | 4% |
| — | Footer | Nav + disclaimer | `--page-bg` | ~130px | 2% |

**Totals: 9 blocks + footer. ~8,600px ≈ 12.9 screens.**
**Persistent bottom action bar from y > 900 to the footer, so the primary action is
reachable at every scroll position on the page after the hero. In-flow CTAs at
y ≈ 700 · 2,080 · 4,240 · 5,540 · 6,780 · 8,120. Longest desert: 0px by construction.**

### 4. Full copy deck

**Nav**
- Wordmark: `Revora`
- Links: `How it works` · `Pricing` · `Pantry Review`
- Nav CTA: **removed.** The sticky bar replaces it and two persistent CTAs is one too many.

**Persistent bottom action bar** (appears once the hero CTA scrolls out of view)
- Button: `Check your first meal — free`
- Bar caption, 16px: `10 free checks. No login, no card.`
- Dismiss: none. It is 76px tall including safe-area inset and it never covers content,
  because the page reserves `padding-bottom: 76px` for it.

**Block 1 — Hero**
- Eyebrow: `A meal checker built only for prediabetes`
- H1: `What can I eat tonight?`
- Sub: `If your A1C came back between 5.7% and 6.4%, that question has been following you around for months. Describe the meal in front of you and Revora tells you where it lands — Clear, Be careful, or Hold off — with the reason, in about ten seconds.`
- CTA: `Check your first meal — free`
- CTA caption: `10 free checks on your first day, then you decide.`
- Trust strip (ledger row, verbatim, three items).
- Visual half — one Clear card (as C1's hero card, same copy, same
  `An illustrated example` label and the same `No change to make.` caption).

**Block 2 — The six months**
- H2: `The six-month wait is the problem`
- Lede: `Nobody handed you a plan. You were handed a number, two words of advice, and an appointment half a year away.`
- The four pains, verbatim as in C1 block 2.
- Scope note, verbatim as in C1 block 2.
- CTA: `Check your first meal — free` · caption `No login, no card, nothing to install.`

**Block 3 — How a check goes**
- H2: `How a check goes`
- Lede: `Three things happen, and the whole sequence takes about ten seconds.`
- Three items — **no `Step 1 / Step 2 / Step 3` eyebrows.** The verb is the label:
  - `Say it or type it.` `Speak the meal out loud or type it in your own words. "Leftover lasagna and a glass of red" is a valid entry. You see the text and can fix it before anything is checked.`
  - `Read the answer.` `One card: Clear, Be careful, or Hold off, the reason in a sentence, and — when there is one — a change worth making and an alternative. Broad A1C-range context makes the presentation more cautious. It is not a prediction of your response.`
  - `Close the app.` `That is the end of it. Nothing to log, no total to hit, no streak to keep. The check is saved to your history and you get on with dinner.`
- CTA: `Check your first meal — free`

**Block 4 — The question**
- H2: `It asks before it guesses`
- Lede: `Type "oatmeal" and Revora asks whether it is plain or sweetened, because the honest answer depends on it. Most apps pick one and sound confident.`
- `<DemoCheckCard />`
- Caption: `An illustrated example.`
- No in-flow CTA (the sticky bar is present).

**Block 5 — Three answers**
- H2: `Three meals. Three different answers.`
- Lede: as C1 block 4.
- Three cards, copy as C1 block 4.
- Note: `Illustrated examples. Every card ends with the same line: Revora is informational only and is not medical advice.`
- CTA: `Check your first meal — free`

**Block 6 — What you get**
- H2: `What you get, most useful first`
- Lede: `Six things, in the order they will matter to you. Nothing on this list is coming soon, in beta, or behind a waitlist.`
- **The ranking is rendered, not hidden in a code comment.** Numbered 1–6, and the numbers
  are the section's one legitimate use of sequence.
  1. `It asks before it guesses` — `Type "oatmeal" and Revora asks whether it is plain or sweetened, because the honest answer depends on it.`
  2. `A record you can actually show someone` — `Every check saved to your account and visible on every device. Six months from now you can open it at your appointment instead of trying to remember.`
  3. `Your data, deleted on demand` — `Your A1C and meal text are encrypted at rest and stored only with your say-so. One tap deletes all of it, account included, with no retention screen in the way.`
  4. `One answer, not a dashboard` — `Clear, Be careful, or Hold off, plus the reason in one sentence, and, when there is one, a change worth making and a swap. That is the whole screen.`
  5. `A weekly recap in sentences` — `Plain lines about what you did, like days checked in and steps followed through. Never a grade, never a streak to break, never a lab prediction.`
  6. `One reminder, if you want it` — `A single nudge a day, off by default. Skip a day and nothing breaks, nothing turns red, nothing guilt-trips you. Blank days are just blank.`
- Pantry line: `Separately, there is the Pantry Review: a one-time report that sorts the food already in your kitchen. $49, one payment, nothing renews.` Link: `See a sample report`

**Block 7 — What it costs**
- H2: `Try it before you pay a cent`
- Lede (trial): `The funnel is the promise: 10 free checks on day one, a free week, and a cancel button that lives on your account page — not behind an email.`
- Lede (legacy): as C1.
- Tiles: identical to C4's block 6 tiles, both branches.
- CTA: `Check your first meal — free`

**Block 8 — Fair questions**
- Four `<details>`, as C1 block 7, both paywall branches. First entry open by default.

**Block 9 — Close**
- H2: `Your next meal is the one to try it on.`
- Sub: `Describe it. Revora tells you where it lands and why, in about ten seconds.`
- CTA: `Check your first meal — free` · caption `No login. No card. 10 free checks on your first day.`

**Footer** — as incumbent, plus `{BOUNDARY_DISCLAIMER}`, plus `padding-bottom` clearance
so the sticky bar never overlaps the disclaimer.

### 5. Hero specification

- **Eyebrow: kept**, and it is the page's only tracked-uppercase element — which is the
  page's only text below 16px, at 13px. Every other label on C5's page is 16px sentence case.
- **H1:** `What can I eat tonight?` Six words, the visitor's own sentence, and — critically
  for this persona — **it is the shortest possible H1 that survives a screen reader reading
  it out of context in a headings list.**
- **Sub:** 44 words at 18.5px/1.6.
- **Visual half:** the Clear card. Permission-first, five lines, and — the measurable
  reason C5 picks it over the oatmeal card — it is **210px tall at 375px instead of 640px**,
  which is what moves the first CTA from y ≈ 1,340 (incumbent) to y ≈ 700.
- **Semantics, specified because this persona is the one that will be asked:** `<h1>` once,
  `<h2>` per block, `<h3>` inside blocks 3, 5, 6. No level skipped. The trust strip is a
  real `<ul role="list">`. The verdict cards are `<article>`s with an `aria-label` naming
  the meal and the label, so a screen reader announces "Clear: grilled chicken, brown rice,
  and a side salad" rather than reading a colour.

### 6. The proof strategy

C5 uses the same four honest mechanisms as C1 and adds one this persona is uniquely placed
to notice:

1. **The clarifying question**, checkable in ten seconds.
2. **The Clear card carrying nothing.**
3. **Live-flag pricing.**
4. **Billing stated as dates and amounts.**
5. **The visible ranking in block 6.** The incumbent ranked its nine features deliberately
   and recorded the ranking in a code comment, so a scanner saw nine identical cells. C5's
   position: *a ranking the reader can see is itself a credibility signal*, because it means
   somebody decided. Six numbered items, the three no competitor can claim at the top.

### 7. Visual system deltas

| Delta | From | To | Why |
|---|---|---|---|
| **Persistent action bar** | none | `position: fixed; bottom: 0`, 76px incl. `env(safe-area-inset-bottom)`, appears when the hero CTA leaves the viewport | Contested #4, restated as **one filled pill per screenful.** The measured 5,090px desert is the page's largest single defect and this is the only fix that scales with page length. |
| Nav CTA | ghost pill | **removed** | Two persistent CTAs is one too many; the bar is the persistent one. |
| Planes | 3 + hairline | **2**, alternated 3× across 9 blocks | Contested #3. |
| Card families | 8 | **4** (verdict · price tile · ranked item · FAQ row) | Contested #5. Most of any contender, and defended: C5 keeps more content, so it keeps more containers. |
| Radius | 24px all | unchanged | No delta. |
| Type pairing | Jakarta + Source Sans 3 | unchanged | No delta. The reading face at 17px is the right call for this audience and C5 is the persona that would know. |
| Body size | 16.5–17px | **17px flat / 1.7** | 1.65 → 1.7 for a 40–60 audience at 62ch. |
| Tap targets | 44px min | **48px min**, 12px minimum gap between adjacent targets | 44px is the floor, not the target; the FAQ summaries and footer links are the two places the incumbent sits exactly at the floor. |
| Eyebrows | 4 | **1** | The `Step N` eyebrows die; the verb becomes the label. |
| Numerals | proportional | `font-variant-numeric: tabular-nums` on price tiles and the ranked list | Prevents the 1px reflow that makes a price column look misaligned. |

### 8. Motion specification

- CTA press: `translateY(1px)`, 150ms.
- **The action bar's entrance:** `opacity 0 → 1` and `translateY(100%) → 0`, 200ms,
  `cubic-bezier(0.23, 1, 0.32, 1)`, triggered by an `IntersectionObserver` on the hero CTA.
  Purpose: *state transition* — the bar appearing is the page telling you the action moved,
  and a bar that simply materialises reads as a rendering bug.
- Exit: the reverse, 140ms (exit at ~70% of enter).
- **Nothing else.** No scroll reveals: C5's position is that reveal-on-scroll on a 12.9-screen
  page is thirty-odd animations a reader has to sit through to read a document.
- `prefers-reduced-motion: reduce` → **the bar appears and disappears instantly, and it
  still appears.** This is the important distinction: reduced motion removes the movement,
  not the affordance. A reduced-motion user who lost the persistent CTA would lose the
  contender's entire mechanism.

### 9. The 375px story

This is the section C5 exists for.

- **Above the fold (667px):** wordmark + nav links · eyebrow · H1 on one line · full sub ·
  CTA at **y ≈ 700**, so the caption is at the fold edge and the button is one short flick
  away. From y ≈ 900 onward the sticky bar means the action is **always** at the bottom of
  the screen.
- **Thumb zone:** on a 375×667 device held one-handed, the comfortable arc for a right
  thumb is roughly the bottom 45% of the screen and the lower-left is the hardest reach. The
  bar's button is full-width less 16px gutters and 52px tall, centred, entirely inside that
  arc.
- **Scroll to primary action: 700px once; 0px thereafter for the remaining 7,900px.**
- **Longest desert: 0px** by construction. This is the measurable claim C5 is making and
  the one thing it will be judged on.
- **Content clearance:** `main { padding-bottom: 76px }` so the bar never overlays the
  footer disclaimer or the last CTA. The in-flow close CTA and the bar are never both in the
  viewport — the bar hides when the block-9 CTA enters view, so there is never a moment with
  two identical filled pills on screen.
- **Landscape at 375×667 → 667×375:** the bar is 60px in landscape and the page's
  `padding-bottom` follows. C5 is the only contender that specifies landscape.
- **Collapse:** hero single-column below 880px. Ranked list single-column at every width
  (a numbered list in three columns is not a list). Verdicts 1-up below 720px, 3-up at
  880px. Price tiles 1-up below 720px.
- **Text:** nothing below 16px except the 13px tracked eyebrow. Body 17px/1.7 at 62ch.
  `text-wrap: pretty` on prose, `balance` on h1–h3.

### 10. Hard-rail self-audit

| # | Rail | Status |
|---|---|---|
| 1 | Never the agent of a health outcome | **PASS.** |
| 2 | No fabricated proof | **PASS.** |
| 3 | Raw class words never render | **PASS.** |
| 4 | Clear carries no adjustment or swap | **PASS**, hero and block 5. |
| 5 | Disclaimer visible | **PASS.** Footer + block-5 note. **The sticky bar must not cover it** — specified in part 9. |
| 6 | Statistics trace to evidence-pack | **PASS.** None render. |
| 7 | Proof band is a LABEL | **PASS by deletion**, with the same exposure as C1/C2/C3: the research disclosure leaves the page. |
| 8 | AA; health info never `--text-soft` | **PASS.** The bar's caption is `--text-body` on `--surface`, not `--text-soft`. |
| 9 | 44px targets | **PASS and exceeded** — 48px minimum, 12px minimum gap. C5 is the persona that will also demand the missing test: axe does not check target size at AA, so this rail is unasserted for every contender including this one. **C5's implementation plan carries a Playwright assertion for it.** |
| 10 | 16px floor | **PASS.** One 13px element on the page: the hero eyebrow, tracked uppercase. |
| 11 | Colour never sole channel | **PASS.** Icon + label, plus `aria-label` on each verdict `<article>`. |
| 12 | Reduced motion | **PASS**, and this is the rail C5 handles most carefully: the bar's *movement* is removed, the bar itself is not. **This rail is currently unasserted by any test** — four `@media` blocks and no coverage. C5's plan schedules one. |
| 13 | Focus visible | **PASS.** Additional requirement: the sticky bar must not trap or steal focus, and it sits **last in DOM order** so tab order reaches the footer before it. |
| 14 | Light surface | **PASS.** Bar is `--surface` with a top hairline, not an inverted band. |
| 15 | Marketing only | **PASS.** The bar is a link to `/check`, never an input. |

**Tier B pin ledger.**
- **Kept:** all twelve except the two below.
- **Retired:** `Two ways in.` / `Three ways in.` and `Dictate it or type it.` — block 3
  replaces the how-it-works section with verb-labelled steps. **C5 ties C4 for fewest
  retirements.**
- **Tier A:** all nine pass.
- **New rail coverage this contender owns:** a 44/48px target assertion and a
  reduced-motion assertion, both currently unasserted for the whole page.

**Em dashes rendered: 8.**

### 11. What this steals from the incumbent, and why that part is good

- **Almost all of the copy.** C5 is the contender that says most plainly: the writing on
  this page is better than the tournament wants to admit. The pains list, the scope note,
  the feature bodies, the FAQ answers and the trust strip are kept close to verbatim. What
  changed is the order, the count, and where the button is.
- **The eyebrow.**
- **The nine-item grid's ranked order** — which was correct, and invisible. C5 keeps the
  ranking, cuts nine to six, and renders the numbers.
- **The 16px floor and the reading face.** This persona endorses both and raises the floor's
  companion values instead of arguing about the family.
- **Live-flag pricing.**
- **The four `prefers-reduced-motion` blocks.** They are correct and untested; C5 keeps them
  and adds the test.

### 12. Primary failure mode

**The sticky bar is a conversion instrument that this specific audience may read as a
pressure instrument.** Every subscription app that ever burned this reader had a persistent
buy button. The Brief says the CTA feeling should be *safe to try* — absence of risk, not
presence of desire — and a bar that follows you down 7,900 pixels is, structurally, the
page never letting the subject drop. C5 believes the caption (`10 free checks. No login, no
card.`) defuses it. It might not, and the failure would be invisible in an A/B test that
measures clicks rather than the people who closed the tab.

Secondary: at 12.9 screens C5 is the longest contender by a wide margin, and it has bet
that reachability beats brevity on a page whose reader is anxious and tired. If both P2 and
P6 are right, C5 has solved the wrong measurement precisely.

---
---

# C6 — TONIGHT
### by P6, The Anxious Patient

### 1. Name and one-sentence thesis

**Tonight.** The page is one evening told in the second person, start to finish, and the
product appears inside it rather than in sections about itself.

### 2. The bet

That the fourth objection — *will this make me feel worse?* — is the one that kills
silently at the fold, that no research surfaces it because nobody types it into a search
bar, and that the only instrument that answers it is tone. And that tone is structural: you
cannot warm up a page made of feature grids by rewriting the headings.

**What it wagers:** the entire marketing-section vocabulary. There is no how-it-works
block, no feature grid, no trust section, no before/after grid and no glance strip, because
none of those are things that happen in an evening. The page has six moments instead.

**What it sacrifices:** scannability. A visitor who arrives ready to buy and wants to find
the price will scroll past prose to get there. C6 gives them a `Pricing` nav link and
otherwise accepts the cost, on the argument that the ready-to-buy visitor is not the one
this page loses.

### 3. Section map

**One plane** (`.landing-sheet`, white, throughout). Contested #3 settled by deletion for
the third time. C6's reason is different from C2's and C3's: a plane change mid-narrative
is a scene change, and there is only one scene.

| # | Moment | What happens | Plane | 375px height | Share |
|---|---|---|---|---|---|
| 1 | Six o'clock | The plate. The question. The action. | `--surface` | ~940px | 15% |
| 2 | Why nobody told you | The six months, in the second person | `--surface` | ~1,120px | 18% |
| 3 | **What it says first** | A Clear answer. Permission before caution. | `--surface` | ~980px | 16% |
| 4 | When it isn't sure | `<DemoCheckCard />`, framed as care not caution | `--surface` | ~1,140px | 18% |
| 5 | Tomorrow, and the day you skip | The habit, and the permission not to have one | `--surface` | ~980px | 16% |
| 6 | What it costs, and how you stop | Offer + cancel, in the same breath | `--surface` | ~910px | 15% |
| — | Footer | Nav + disclaimer | `--surface` | ~130px | 2% |

**Totals: 6 blocks + footer. ~6,200px ≈ 9.3 screens.**
**CTAs at y ≈ 620 · 1,900 · 3,020 · 5,140 · 5,980. Longest desert: 2,120px** (block 4 → 6).

### 4. Full copy deck

**Nav**
- Wordmark: `Revora`
- Links: `How it works` · `Pricing`
- Nav CTA: **none.**

**Block 1 — Six o'clock**
- Eyebrow: `A meal checker built only for prediabetes`
- H1: `It's six o'clock, and you're looking at the plate.`
- Sub: `Three months ago someone told you your A1C is in the 5.7% to 6.4% range and to eat better, and then the appointment ended. Nobody said what that means about this. Describe what's in front of you and Revora tells you where it lands and why, in about ten seconds. It leads with what you can have.`
- CTA: `Check your first meal — free`
- CTA caption: `10 free checks on your first day, then you decide. Nobody asks who you are.`
- Trust strip (ledger row, verbatim, three items).
- Visual half — a Clear card, and the caption is the block's real payload:
  - Label: `An illustrated example`
  - Meal: `Grilled chicken, brown rice, and a side salad`
  - Verdict: `Clear`
  - Reason: `This looks like a reasonable fit. The meal already has protein and vegetables, so it looks more balanced than a fast-carb-heavy option.`
  - Caption below the card: `There is nothing else on the card. No score, no correction, no "but". When a meal already looks balanced, that is the entire answer.`

**Block 2 — Why nobody told you**
- H2: `Nobody was being unkind. They just ran out of time.`
- Body, five short paragraphs:
  - `The appointment was fifteen minutes and most of it was the number. Eat better, come back in six months. You nodded, because what else do you do.`
  - `Then you went home and looked it up, and every article contradicted the last one. Fruit is fine, fruit is sugar. Rice is out, brown rice is in. You read all of it and you still didn't know about the plate in front of you that night.`
  - `You tried an app. It wanted you to weigh things, scan barcodes and hit a daily total, and you stopped, because you didn't ask for a second job. You asked what to do about dinner.`
  - `So most nights you guess, and then you spend an hour wondering if it was a mistake. That hour is the actual cost of being told nothing.`
  - `Revora is for that hour. Not a general nutrition app, not a calorie counter, not built for everyone. If your A1C sits outside 5.7% to 6.4%, it says so plainly and points you to a clinician instead of pretending.`
- CTA: `Check your first meal — free`
- CTA caption: `No login, no card, nothing to install.`

**Block 3 — What it says first**
- H2: `Most of the time, it tells you what you can have.`
- Body: `The three answers are Clear, Be careful, and Hold off. When a meal already looks balanced, Revora says Clear and stops there — no correction, no "but", nothing added to make the app look useful. It cannot attach a change to a Clear answer even if it wanted to; that is built into the product, not into the copy.`
- Second paragraph: `And when a meal does lean heavy, the answer is not "don't." It is one practical thing — add protein, add nonstarchy vegetables, take a smaller portion now and set the rest aside. You keep the food. Nothing gets confiscated.`
- Two cards side by side at 880px, stacked below:
  - Card A — meal `Grilled chicken, brown rice, and a side salad` · `Clear` · reason as above · nothing else.
  - Card B — meal `A bagel with jam and a glass of orange juice` · `Be careful` · reason `This may have a higher blood-sugar impact than a more balanced meal because it leans heavily on refined carbs.` · `Adjustment:` `If practical, add protein or nonstarchy vegetables to make it easier to handle.`
- Note: `Illustrated examples. Every answer ends with the same line: Revora is informational only and is not medical advice.`
- CTA: `Check your first meal — free`

**Block 4 — When it isn't sure**
- H2: `Sometimes it asks you something first.`
- Lede: `You'll type "oatmeal" one morning and it won't answer. It'll ask whether it's plain or sweetened, because the honest answer depends on it and it would rather ask you than guess about you.`
- `<DemoCheckCard />`
- Caption: `An illustrated example. Every other app you've tried would have taken those four letters and given you a confident number. This one asks. That is not the app being slow; it is the app not making something up about your breakfast.`
- No CTA. (C6, like C2 and C3, will not put a button under the pause.)

**Block 5 — Tomorrow, and the day you skip**
- H2: `And the days you don't open it`
- Body: `Nothing happens. Nothing turns red, nothing breaks, nothing counts it against you. There is no streak to lose and no chart that goes down. Blank days are just blank.`
- Second paragraph: `If you want one gentle reminder a day you can have one, and it is off unless you ask. Checking less as you get more confident is how this is meant to work.`
- Third paragraph: `What does build up, quietly, is A record you can actually show someone. Every check saved in your own words, on every device, so six months from now you can open it at the appointment instead of trying to remember. And A weekly recap in sentences about what you did — days checked in, steps followed through. Never a grade. Never a lab prediction.`
- Fourth paragraph: `Your A1C and what you typed are encrypted at rest and stored only if you say so. One tap deletes all of it, account included, with no retention screen in the way.`
- CTA: `Check your first meal — free`

**Block 6 — What it costs, and how you stop**
- H2: `What it costs, and how you stop`
- Trial branch: `Tonight and the rest of today: 10 free checks on day one, no login and no card. Check up to 10 meals on your first day and see how the answers feel at your own table. After that, 7 days free — a card is required, nothing is charged, and on day 5 we email you the exact date and the exact amount with a one-tap cancel link in it. Then it is {monthlyPrice}/month, or $99.99 a year, which is $8.33 a month.`
- Legacy branch: `Tonight and the rest of today: 10 free checks on day one, no login and no card. Check up to 10 meals on your first day and see how the answers feel at your own table. After that, A free account includes 5 free checks a day, still no card, with your history saved. Premium is {monthlyPrice}/month, or $99.99 a year, which is $8.33 a month.`
- Cancel paragraph, given equal weight to the price: `Stopping is one tap on your account page, effective at the end of the period. No retention screen, no "are you sure", no email you have to write. We know why you are reading this paragraph carefully.`
- Pantry: `There is also a one-time option, if a subscription is not what you want: the Pantry Review sorts the food already in your kitchen into one printable report. $49, one payment, nothing renews.` Link: `See a sample report`
- Close H2: `You can start with the plate in front of you.`
- CTA: `Check your first meal — free`
- CTA caption: `No login. No card. 10 free checks on your first day.`

**Footer** — as incumbent, plus `{BOUNDARY_DISCLAIMER}`.

**FAQ:** no accordion. Same treatment as C2 — the four answers live in the prose (scope in
block 2, mechanism in block 4, account/card and cancellation in block 6, medical-advice
boundary in the footer plus the block-3 note), and the FAQPage JSON-LD renders from a
`faqs` array retained for schema only. Same SEO risk, same disclosure.

### 5. Hero specification

- **Eyebrow: kept.** C6 keeps it for one reason and it is not the usual one: a narrative
  headline gives the visitor no category, and a reader who cannot classify a page in two
  seconds does not stay to read a story. The eyebrow is the price C6 pays for a scene-setting
  H1.
- **H1:** `It's six o'clock, and you're looking at the plate.` Ten words, second person,
  present tense, no product name, no verb aimed at the reader. It is the only H1 in the
  tournament that does not tell the visitor to do something.
- **Sub:** 57 words — the longest sub on the board, and C6 accepts the hit. The final clause,
  `It leads with what you can have`, is the page's answer to the fourth objection and it
  appears above the fold.
- **CTA caption:** `10 free checks on your first day, then you decide. Nobody asks who you
  are.` The second sentence is C6's addition: the fourth objection has a privacy dimension
  that "no login" states as a feature and this states as a relief.
- **Visual half: a Clear card, and the caption is doing more work than the card.**
  `There is nothing else on the card. No score, no correction, no "but".` This is the page
  telling the visitor, in the first screen, that it is not going to find things wrong with
  them. The incumbent's hero says the opposite in its first screen and C6's whole existence
  is that observation.
- **Rejected H1s, recorded because the rail matters:** `You can probably eat it.` and
  `Most meals come back Clear.` Both were C6's instinct and both are killed. The first
  implies a safety finding about the user's meal (rail 1 and `claims-boundary.md` §Verdict
  Semantics: `Clear` must never imply "safe for the user"). The second is an unverifiable
  claim about output distribution — fabricated proof, rail 2. C6 records them as the two
  places its own bet nearly breached a rail.

### 6. The proof strategy

C6 argues that for its reader, *proof* and *reassurance* are the same channel, and that
every proof point should be delivered as a relief rather than as a credential:

1. **The Clear card carrying nothing**, named three times, and framed as *nothing gets
   confiscated* rather than as *F-04 compliance*.
2. **The clarifying question**, framed as `it would rather ask you than guess about you` —
   the same mechanism every other contender uses, pointed at the person instead of at the
   competition.
3. **Blank days are just blank.** The anti-gamification promise is a proof point for this
   audience specifically, because the thing they quit last time had a streak in it.
4. **The cancel paragraph, at the same weight as the price.** `We know why you are reading
   this paragraph carefully.` Naming the reader's suspicion is a stronger trust move than
   answering it.
5. **`Nobody asks who you are.`**

**Not used:** any credential, any source, any research framing. C6 is the only contender
that does not mention evidence at all, and it will be scored down for it by P4.

### 7. Visual system deltas

| Delta | From | To | Why |
|---|---|---|---|
| **Planes** | 3 + hairline | **1** (`--surface`) | Contested #3. One scene, one plane. |
| Card families | 8 | **2** (verdict card, price → prose, so effectively **1**) | Contested #5. |
| Radius | 24px all | unchanged | No delta. On a two-card page 24px reads soft, and soft is the register. |
| Type pairing | Jakarta + Source Sans 3 | unchanged, and the reading face carries more weight than anywhere else | This page is 70% prose. Source Sans 3 at 17px/1.7 across 62ch is the single most consequential typographic decision on it. |
| Body size | 16.5–17px | **17px / 1.7** | |
| Prose measure | unspecified | `62ch`, `text-wrap: pretty` | |
| Eyebrows | 4 | **1** | |
| Nav CTA | ghost | **removed** | A sell button in the corner of a page written as a letter is the letter admitting it is an ad. |
| Section padding | `clamp(52px, 7vw, 104px)` | `clamp(72px, 10vw, 128px)` | Paragraph blocks need more air between them than card grids do. |
| Verdict card order | Clear · Be careful · Hold off | **Clear · Be careful only** in block 3; `Hold off` is defined in prose and never shown as a card | Deliberate. Showing a `Hold off` card on a page for a frightened person, with no context, is the incumbent's hero mistake at a smaller scale. **Flagged as a real cost:** the page never demonstrates the most cautious label. |

### 8. Motion specification

**Nothing moves except press feedback.** CTA `translateY(1px)`, 150ms.

C6's reasoning is register, not performance: motion is enthusiasm, and this persona's list
of things it distrusts begins with enthusiasm. A page written as a quiet letter that
animates on scroll is a quiet letter with a marketing department attached.

`prefers-reduced-motion` → nothing to zero.

### 9. The 375px story

- **Above the fold (667px):** wordmark + 2 links · eyebrow · H1 on three lines · 4 of 6 sub
  lines. **The clause `It leads with what you can have` is at y ≈ 560, above the fold on a
  375×667 device.** That placement is the contender.
- **CTA at y ≈ 620.** Clear card begins at y ≈ 860; its `Clear` verdict row is the first
  thing the reader sees on their first scroll.
- **Thumb reach:** CTAs full-width, 52px, 32px clearance.
- **Scroll to primary action:** 620px, ~0.93 screens — **above the fold**, tied with C2 as
  the shortest on the board.
- **Worst stretch:** 2,120px (block 4 → 6).
- **Reading load:** C6 is the most prose-dense contender, which at 375px means long
  single-column runs. Mitigations, specified: paragraphs capped at 4 lines on mobile,
  `62ch` measure, 1.7 line-height, 24px paragraph gap, and no paragraph longer than 55
  words anywhere on the page.
- **Collapse:** hero single-column below 880px. Block 3's two cards stack below 880px, Clear
  first, always. Nothing else is multi-column at any width.

### 10. Hard-rail self-audit

| # | Rail | Status |
|---|---|---|
| 1 | Never the agent of a health outcome | **PASS**, and it was close. Two candidate H1s were killed for it (part 5). The shipped copy's strongest promise is `tells you where it lands and why`. |
| 2 | No fabricated proof | **PASS.** `An illustrated example` on all three card surfaces. The rejected `Most meals come back Clear.` is recorded as the attempt that would have breached it. |
| 3 | Raw class words never render | **PASS.** |
| 4 | Clear carries no adjustment or swap | **PASS**, and it is the page's most-repeated claim — hero caption, block 3 body, block 3 card A. |
| 5 | Disclaimer visible | **PASS.** Block 3 note plus the footer. **No boundary copy on this page sits inside a `<details>`**, because there is no accordion. |
| 6 | Statistics trace to evidence-pack | **PASS.** No statistic and no research reference of any kind. |
| 7 | Proof band is a LABEL | **PASS by deletion.** C6 removes the research disclosure entirely and does not replace it — the largest evidential gap of any contender, and its author acknowledges it. |
| 8 | AA; health info never `--text-soft` | **PASS.** `--text-soft` used only for the illustrated-example labels. |
| 9 | 44px targets | **PASS.** Very few targets: 5 CTAs, 2 nav links, footer. |
| 10 | 16px floor | **PASS.** One 13px element: the eyebrow. |
| 11 | Colour never sole channel | **PASS.** |
| 12 | Reduced motion | **PASS.** No motion. |
| 13 | Focus visible | **PASS.** |
| 14 | Light surface | **PASS.** |
| 15 | Marketing only | **PASS.** |

**Tier B pin ledger.**
- **Kept:** `{TASTER_LIMIT} free checks on your first` · `{TASTER_LIMIT} free checks on day one`
  (block 6 prose) · `Check up to {TASTER_LIMIT} meals on your first day` · `7 days free` ·
  `A free account` · `still no card` · `A weekly recap in sentences` ·
  `A record you can actually show someone` · `Add to home screen — works today`.
- **Retired:** `Two ways in.` / `Three ways in.` · `Dictate it or type it.` ·
  `Days 2–8` (prose, not tiles) · `Your first ${TASTER_LIMIT} checks, on your first day`
  (no FAQ) · `It asks before it guesses` (block 4's H2 is
  `Sometimes it asks you something first.` — C6 deliberately declines the sharper phrasing
  because "guesses" points at competitors and this page's register does not).
- **Tier A:** all nine pass. Note that retiring `It asks before it guesses` also retires the
  `exactly once` assertion, which must be edited rather than deleted.
- **New ledger rows required:** the block-2 narrative (five paragraphs, all new), the block-3
  and block-5 bodies, the block-6 prose price paragraphs (both branches), and the cancel
  paragraph. **Roughly ten new rows** — comparable to C4's debt, and for the opposite reason:
  C4's new copy is scope language, C6's is voice.

**Em dashes rendered: 3.**

### 11. What this steals from the incumbent, and why that part is good

- **The pains list, dissolved back into prose.** Its content is the best writing in the
  repository. C6's only change is removing the bullets, bold lead-ins and card, because a
  list of four things that are wrong with your life reads as an indictment when it is
  bulleted and as sympathy when it is written out.
- **The Clear card carrying nothing** — which C6 argues is not a compliance artifact at all
  but the single most emotionally important object in the entire product.
- **`Blank days are just blank.`** Verbatim. It is the best sentence on the incumbent page
  for this reader and it is currently the ninth of nine cells in a grid.
- **`When we're unsure, we say so.`**
- **`Checking less as you get more confident is how this is meant to work.`** Lifted from
  `DESIGN.md` §Progress surfaces, where it is standing copy for the app, and brought to the
  landing — where its promise (you are allowed to need this less) is exactly what the
  fourth objection is asking about.
- **The eyebrow.**

### 12. Primary failure mode

**A visitor who is not in the mood to be understood.** C6 is 70% prose in the second person,
and second person is the highest-variance register in copywriting: when it lands the reader
feels seen, and when it misses they feel handled. This audience is specifically primed to
detect being handled — they have just come from a fifteen-minute appointment where somebody
performed empathy at them and then left. If C6 misses by even a little, its warmth reads as
technique, and technique from a health app is worse than coldness.

Secondary and more measurable: C6 has no research disclosure, no evidence framing, no
sources link on the page, and never shows the `Hold off` label as a card. A cautious reader
looking for reasons to believe finds sympathy, and sympathy is not evidence. P4 will score
this a 4 and P4 will be right about the thing it is measuring.

---
---

# C7 — IT ASKS FIRST
### by P7, The Adversarial Killer

### 1. Name and one-sentence thesis

**It Asks First.** The page is one comparison, held for its entire length: the same four
letters typed into every other food app, and typed into this one.

### 2. The bet

That the only defensible page is one whose central object could not exist for another
company — and that Revora owns exactly one such object, the question it asks before it
answers. Everything else on the incumbent page is portable: change the logo and the
three-step, the glance strip, the feature grid, the before/after grid and the accordion
work unedited for a project management tool.

**What it wagers:** every stock structure at once. No eyebrow. No `Step 1 / Step 2 / Step 3`.
No four-stat strip. No three-up feature grid. No 2×2 before/after. No FAQ accordion. No
icon-in-circle row. No card mosaic. If a structure would survive being moved to another
company's site, C7 does not use it.

**What it sacrifices:** familiarity, and the safety that comes with it. A page that shares
no structure with any page the visitor has seen is a page the visitor has to learn, and this
visitor is fifty-four, anxious, and did not come here to learn a page.

### 3. Section map

**One plane** (`--page-bg`) with **rules, not cards.** The page's sectioning device is a 1px
`--border-soft` horizontal rule with 88px of air above and below — the same hairline the
incumbent uses to separate planes, promoted from a seam between backgrounds to the page's
only structural mark. Contested #2 settled hard: **radius 0**, because there is nothing on
the page with a corner except the CTA pill and the four verdict cards.

| # | Block | Purpose | Plane | 375px height | Share |
|---|---|---|---|---|---|
| 1 | Nav + the comparison | The whole thesis, above and just below the fold | `--page-bg` | ~1,320px | 23% |
| 2 | Why that matters here | Scope + the six months, compressed | `--page-bg` | ~1,180px | 20% |
| 3 | What comes back | `<DemoCheckCard />` + the three verdicts, in one run | `--page-bg` | ~1,560px | 27% |
| 4 | What it costs | Offer, funnel, cancel | `--page-bg` | ~1,180px | 20% |
| 5 | Close | Final exit | `--page-bg` | ~430px | 7% |
| — | Footer | Nav + disclaimer | `--page-bg` | ~130px | 2% |

**Totals: 5 blocks + footer. ~5,800px ≈ 8.7 screens.**
**CTAs at y ≈ 660 · 1,420 · 2,520 · 4,700 · 5,540. Longest desert: 2,180px.**

### 4. Full copy deck

**Nav**
- Wordmark: `Revora`
- Links: `How it works` · `Pricing`
- Nav CTA (ghost, persistent ≥880px): `Check a meal`

**Block 1 — The comparison**
- Eyebrow: **none.** C7 deletes it on principle and pays for it in the H1, which has to
  carry the category itself.
- H1: `Type "oatmeal" into a food app and it will give you a number.`
- Sub: `Revora asks whether it's plain or sweetened, because the honest answer depends on it. That question is the entire product. It's a meal checker for adults with an A1C between 5.7% and 6.4%, and it would rather ask you one thing than make something up.`
- **The comparison object** — the page's centre, rendered full-width on mobile, two columns
  at 720px, no cards, separated by a single vertical rule at 720px+ and a horizontal rule
  below:
  - Shared input line, above both columns, monospaced-adjacent and unmistakable:
    `You type:` `oatmeal`
  - Left column heading: `What every other food app does`
    - Body: `Returns an answer immediately. A glycemic number, a score, a colour. It picks one interpretation of four letters and does not tell you it picked.`
    - Closing line: `The answer is confident. It is confident about a meal it does not have enough information to describe.`
  - Right column heading: `What Revora does`
    - Body: `Asks one question. Plain or sweetened? Those are different meals, and the honest answer depends on which one you ate.`
    - Closing line: `Then it answers, and the answer is about the meal you actually had.`
  - **No competitor is named**, no logo appears, and no number is invented for the left
    column. C7 records this as a self-imposed limit: a fabricated competing output would be
    fabricated data on a health surface (rail 2), and the comparison is made with the
    *shape* of the two responses, never with example content on the left side.
- CTA: `Check your first meal — free`
- CTA caption: `10 free checks on your first day, then you decide. Type "oatmeal" and see.`
- Trust strip (ledger row, verbatim, three items).

**Block 2 — Why that matters here**
- H2: `Because you have been guessing for six months.`
- Body, four paragraphs:
  - `Your A1C came back between 5.7% and 6.4%. You were told to eat better and given an appointment half a year out. That is the whole plan you were issued.`
  - `Since then every article has contradicted the last one, and the apps you tried wanted you to weigh things and hit a daily total. None of that answers the plate in front of you tonight, which is the only question you have ever actually had.`
  - `A confident wrong answer is worse than a question here. You are not optimising a workout. You are trying to work out whether the thing on the table is a problem, and an app that guesses and sounds sure will teach you the wrong lesson about your own breakfast, every day, until you stop trusting it.`
  - `Revora is built for that range and nothing else. Not a general nutrition app, not a calorie counter. If your A1C sits outside 5.7% to 6.4%, it says so plainly and points you to a clinician instead of pretending.`
- CTA: `Check your first meal — free`

**Block 3 — What comes back**
- H2: `What comes back`
- Lede: `One card. The label, the reason in a sentence, and — when there is one — a change worth making. Nothing else, and nothing to log.`
- `<DemoCheckCard />` first, under a line reading: `The full sequence, as it happens:`
- Horizontal rule.
- Second line: `And the three answers it can land on:`
- Three verdict cards (copy as C1 block 4; the Clear card carries nothing and the lede below
  names it).
- Note under the run: `Illustrated examples. Notice the Clear card carries no change to make. When a meal already looks balanced, Revora says so and stops. It does not invent a correction to look useful. Every card ends with the same line: Revora is informational only and is not medical advice.`
- Four one-line claims below the run, as a plain rule-separated list, no cards, no icons:
  - `A record you can actually show someone. Every check saved, in your own words, on every device.`
  - `A weekly recap in sentences. Never a grade, never a lab prediction.`
  - `Blank days are just blank. Nothing turns red, nothing breaks.`
  - `Encrypted at rest, deleted in one tap, account included.`
- CTA: `Check your first meal — free`

**Block 4 — What it costs**
- H2: `What it costs`
- Lede (trial): `The funnel is the promise: 10 free checks on day one, a free week, and a cancel button that lives on your account page — not behind an email.`
- Lede (legacy): as C1.
- Three rule-separated rows, **not tiles, not cards** (trial):
  - `Day 1` · `10 free checks` · `Check up to 10 meals on your first day, no login and no card. They live on this device.`
  - `Days 2–8` · `7 days free` · `Card required, $0 charged. Day 5 we email you the exact date and the exact amount, with a one-tap cancel link in it.`
  - `After your free week` · `{monthlyPrice}/month` · `Or $99.99 a year, which is $8.33 a month. Cancel in one tap, effective at the end of the period. No retention screens.`
- Legacy rows: `Day 1` / `10 free checks` (same) · `Every day` · `A free account` ·
  `No card. A free account still includes 5 free checks a day, still no card, with your history saved to your account.` · `Premium` · `{monthlyPrice}/month` · (same as trial row 3)
- Pantry line: `Separately: the Pantry Review, a one-time report that sorts what is already in your kitchen. $49, one payment, nothing renews.` Link: `See a sample report`
- CTA: `Check your first meal — free`

**Block 5 — Close**
- H2: `Type four letters and see what it asks you.`
- Sub: `That is the whole demonstration, it takes about ten seconds, and it costs nothing.`
- CTA: `Check your first meal — free`
- CTA caption: `No login. No card. 10 free checks on your first day.`

**Footer** — as incumbent, plus `{BOUNDARY_DISCLAIMER}`.

**FAQ:** deleted, including the block. Same schema handling as C2 and C6 — `faqs` array
retained for JSON-LD only, four entries, answers not rendered visibly. C7's position: an
accordion below a landing page's last CTA is where teams put the things they could not fit
into an argument, and if a question matters it goes in the argument. It concedes this is the
weakest-supported of its five deletions.

### 5. Hero specification

- **Eyebrow: deleted on principle**, and C7 is honest that this costs real money. The
  incumbent's eyebrow answers "what is this" in seven words before the headline, which is
  genuinely rare and genuinely good. C7's argument is that a tiny tracked uppercase label
  above every section is AI grammar, and that a page which uses exactly one is still
  teaching the reader that this is a page built from the standard kit. It buys the category
  answer back in the sub's third sentence at 18.5px, one line later and 5.5px larger.
- **H1:** `Type "oatmeal" into a food app and it will give you a number.` Twelve words, and
  it is a *setup* — the only H1 in the tournament that is incomplete without its sub. High
  risk: a reader who bounces on the headline alone leaves with no idea what this is.
- **Sub:** 51 words. Carries the mechanism, the category and the scope in that order.
- **The visual half is the comparison, not a card.** Two columns of text with a rule between
  them and a shared input line above. This is the object C7 is betting on, and it is
  deliberately made of type and one rule rather than of two cards, because two cards would
  turn a comparison into a pricing table.
- **What is NOT in the left column:** any invented output. C7 will not draw a fake
  competitor card with a fake glycemic number in it. That would be fabricated data on a
  health surface, it would be the div-based fake-screenshot tell, and it would hand any
  competitor a defamation-adjacent screenshot. The comparison is made at the level of
  behaviour, and it is weaker for it, and C7 accepts that trade rather than breach rail 2.

### 6. The proof strategy

One mechanism, used four times, plus the funnel:

1. **The clarifying question, as the page's entire architecture.** The Brief named it as the
   one thing no competitor can honestly say. Every other contender puts it in a block; C7
   puts it in the H1, the comparison object, block 3's demo and the close. It is the only
   contender that treats it as the page rather than as a section of the page.
2. **The reader can falsify it in ten seconds for free.** `Type "oatmeal" and see.` is a
   dare, and a dare is the strongest proof available to a product with no testimonials,
   because it costs the reader nothing and it costs the claimant everything if it is false.
3. **The Clear card carrying nothing.**
4. **Live-flag pricing and stated billing mechanics.**

**Not used:** any research framing (C7 argues that on a page whose thesis is "we don't
over-claim", a sources block is the page reaching for a credential), and every form of
social proof.

### 7. Visual system deltas

C7 has the largest delta set of any contender, and states plainly that this is the risk of
its position rather than the merit of it.

| Delta | From | To | Why |
|---|---|---|---|
| **Planes** | 3 + hairline | **1** (`--page-bg`) + horizontal rules as the sectioning device | Contested #3. The hairline stops being a seam between backgrounds and becomes the page's only structural mark. |
| **Radius** | 24px, 8 families | **0px** on everything except the CTA pill (999px) and the four verdict cards (24px, unchanged) | Contested #2. Nothing on this page is a card except the things that are genuinely bounded objects, so nothing else needs a corner. |
| Card families | 8 | **1** (the verdict card) | Contested #5, the hardest cut on the board. |
| **Type pairing** | Jakarta + Source Sans 3 | **Plus Jakarta Sans only, 17px / 1.65 body** | Contested #1, same conclusion as C2 by a different route: the second family was added to fix a size problem, and a page that has removed every other borrowed structure should not be carrying a borrowed typographic solution. Removes a family, a `@font-face` and a preload from the landing route. |
| Eyebrows | 4 | **0** | |
| Nav CTA | ghost | ghost, persistent ≥880px | Contested #4, per screenful. |
| Section padding | `clamp(52px, 7vw, 104px)` | `clamp(72px, 10vw, 120px)`, with an 88px rule gap | |
| Icons | verdict icons + 3 decorative rows | **verdict icons only** | Every icon on the page sits inside a verdict row, next to its label. The list items in block 3 have no icons; a bullet glyph next to a sentence is decoration. |
| Shadow | one card shadow | **verdict cards only** | With one card family, the one shadow has exactly one place to appear. |

### 8. Motion specification

**Nothing moves except press feedback**, and C7 wants this on the record as a position
rather than an omission.

- CTA press: `translateY(1px)`, 150ms, existing token.
- C7's argument against C3's 520ms pause, since the two contenders disagree most sharply
  here: the pause animates *the thing the page is claiming*, which means the page is
  performing its own thesis. A visitor who reads "it asks before it guesses" and then
  watches a scripted delay has been shown a re-enactment, not evidence. The dare
  (`Type "oatmeal" and see.`) is the same claim delivered as something the reader can
  falsify, which is strictly stronger and costs zero bytes.
- `prefers-reduced-motion` → nothing to zero.

### 9. The 375px story

- **Above the fold (667px):** wordmark + 2 links + ghost CTA · H1 on four lines at
  `clamp(2rem, 7vw, 2.6rem)` · 2 of 5 sub lines. **The comparison object is entirely below
  the fold**, which is C7's largest 375px liability: on a small phone the page's central
  device does not exist until the second screen, and the four-line setup headline is all the
  reader gets.
- **CTA at y ≈ 660.** Comparison begins at y ≈ 840 and runs to y ≈ 1,290.
- **Comparison at 375px:** the two columns stack, right column (`What Revora does`) **second**
  — which C7 notes is the wrong order for a permission-first brand and the right order for a
  comparison, and flags as an unresolved conflict rather than pretending it isn't one. The
  shared `You type: oatmeal` line stays at the top of the stack and is repeated above the
  second column at 375px so the comparison still reads.
- **Thumb reach:** CTAs full-width, 52px.
- **Scroll to primary action:** 660px, ~0.99 screens.
- **Worst stretch:** 2,180px.
- **Collapse:** comparison 1-col below 720px, 2-col above. Verdicts 1-up below 720px, 3-up at
  880px. Price rows are single-column at every width (they are rows, not tiles, so they never
  need to be).
- **Rules at 375px:** `1px solid var(--border-soft)`, full bleed to the frame's gutters, 88px
  air above and below, and — because a hairline on a fractional DPR can vanish —
  `border-top: 1px solid` on the block rather than an `<hr>`, so it snaps to the device grid.

### 10. Hard-rail self-audit

| # | Rail | Status |
|---|---|---|
| 1 | Never the agent of a health outcome | **PASS.** The strongest promise is `the answer is about the meal you actually had`. |
| 2 | No fabricated ratings / users / testimonials / unlabelled example data | **PASS**, and this rail directly shaped the design: the comparison's left column contains **no invented competitor output**, no fake number, no fake card. It describes behaviour. C7 gave up the more persuasive version of its own central object to hold this rail. |
| 3 | Raw class words never render | **PASS.** |
| 4 | Clear carries no adjustment or swap | **PASS**, named in block 3's note. |
| 5 | Disclaimer visible | **PASS.** Block 3 note + footer. No accordion, so no boundary copy behind a disclosure. |
| 6 | Statistics trace to evidence-pack | **PASS.** No statistic, no research reference. C7 also declines the DPP number it wanted. |
| 7 | Proof band is a LABEL | **PASS by deletion.** Same evidential gap as C1/C2/C3/C5/C6. |
| 8 | AA; health info never `--text-soft` | **PASS.** `--text-soft` on the illustrated-example label only. |
| 9 | 44px targets | **PASS.** |
| 10 | 16px floor | **PASS**, and structurally: **there is no tracked uppercase anywhere on this page**, because there are no eyebrows, so the floor is a flat 16px with no exception in play. C7 is one of two contenders (with C2) where the rail has no carve-out to police. |
| 11 | Colour never sole channel | **PASS.** |
| 12 | Reduced motion | **PASS.** No motion. |
| 13 | Focus visible | **PASS.** With radius 0 on most elements the focus ring needs a 2px offset to stay visible against the rules; specified. |
| 14 | Light surface | **PASS.** One light plane. |
| 15 | Marketing only | **PASS.** The `You type: oatmeal` line is static text, **not an input**. C7 flags that it looks like one and specifies it must not be `<input>`, must not be focusable, and must not carry a caret — a fake input on a marketing page is both the fake-screenshot tell and a rail 15 problem. |

**Tier B pin ledger.**
- **Kept:** `{TASTER_LIMIT} free checks on your first` · `{TASTER_LIMIT} free checks on day one` ·
  `Check up to {TASTER_LIMIT} meals on your first day` · `7 days free` · `Days 2–8` ·
  `A free account` · `still no card` · `A weekly recap in sentences` ·
  `A record you can actually show someone` · `Add to home screen — works today`.
- **Retired:** `Two ways in.` / `Three ways in.` · `Dictate it or type it.` ·
  `Your first ${TASTER_LIMIT} checks, on your first day` (no FAQ) ·
  `It asks before it guesses` — **retired as a literal string while being promoted to the
  page's entire architecture.** C7 uses `It asks first` and `asks one question`; the exact
  pinned phrase does not appear. The `exactly once` assertion must be rewritten rather than
  deleted, and C7 notes this is the single most ironic line item in the tournament.
- **Tier A:** all nine pass.
- **New ledger rows required:** the comparison object's six strings (both column headings,
  both bodies, both closing lines), the H1 and sub, and block 2's third paragraph
  (`A confident wrong answer is worse than a question here`) — which is the most
  competitor-adjacent sentence any contender wrote and needs a row and a second read.

**Em dashes rendered: 4.**

### 11. What this steals from the incumbent, and why that part is good

C7 is required to be generous here and finds it easier than expected:

- **`It asks before it guesses` as a claim.** The incumbent found the single most defensible
  thing this product owns and wrote one perfect sentence about it. C7's entire contribution
  is noticing that the sentence was ranked feature #1 of nine, in a grid, 5,500px down.
- **`Most apps would just pick one and sound confident.`** Already on the incumbent page,
  already passing the audit, and already the sharpest competitive line Revora has. C7
  promotes it from a feature card's third sentence to the page's thesis.
- **The Clear card carrying nothing.**
- **The refusal to fabricate.** The incumbent has no testimonials, no ratings, no user counts
  and no fake screenshots, on a landing page, in 2026. That is a real and unusual discipline
  and it is the reason C7's comparison could be built honestly at all.
- **Live-flag pricing.** Structurally unable to lie.
- **The `Illustrated examples` labelling.** Unglamorous, unpinned by any test, and correct.

### 12. Primary failure mode

**A setup headline that a bouncing reader never completes.** C7's H1 is a sentence about
what *other* apps do. A visitor who reads only the headline — which is most of them —
learns that some food app somewhere returns a number, and learns nothing about Revora, the
category, or their own A1C. The eyebrow that would have fixed this in seven words was
deleted on principle. C7 traded the incumbent's single best conversion asset for structural
purity, and if it loses, that is the trade that lost it.

Secondary: the comparison is entirely below the fold at 375px, which means on the device
where most of this traffic lands, the page's one non-portable object does not exist until
the second screen — and above it sits a four-line headline about somebody else's product.

Tertiary, and C7 raises it against itself: a page built on *what everyone else gets wrong*
is a page whose emotional register is argumentative, aimed at a reader whose stated need is
to have their heart rate lowered. C7 is the most differentiated page in the tournament and
possibly the least kind one, and it is not certain those are separable.

---
---

## Where this stops

Sections 7 and 8 are complete. **Nothing has been scored.**

Phase 6 (Sections 9–10) is next: 42 cross-scorecards, seven personas × six contenders,
ten weighted dimensions, no self-scoring, with every 3-or-more-point disagreement surfaced
and resolved.

**Before Phase 6 begins, one decision belongs to the owner and not to the tournament:**
the weights are `Category clarity 12 · Belief shift 14 · Honesty & claim safety 12 · Voice
fidelity 10 · Legibility & accessibility 12 · Craft & non-genericness 12 · Information
architecture 8 · Emotional fit 10 · Implementation realism 6 · Durability 4`. As written
that is a **conversion tournament with a craft floor**, and on those weights C1, C5 and C7
start ahead. Swap to `Craft 16 + Emotional fit 14` and C3 and C6 start ahead instead. The
prompt's own operator notes say to decide this *before* seeing the result rather than after.
It is still before.

**Two open items carried into Phase 6:**

1. **Six of seven contenders delete the research disclosure** (the `.landing-proof-band`).
   Only C4 keeps it. That is either a convergence finding worth acting on or six personas
   making the same mistake because the block is easy to cut, and Phase 7 has to decide which.
2. **`npm test` has not been run this session.** The last recorded green suite is
   2,165 passed / 0 failed / 2 skipped at `bf714e9`. Phase 10C's breakage predictions are
   only worth writing against a green baseline, and the run takes ~26 minutes on an idle
   machine.
