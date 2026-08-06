# Landing copy v2 — full page, in reading order

**Status:** ✅ APPROVED AND IMPLEMENTED (owner, 2026-08-06). Shipped on branch
`landing/w1-w4` — see `feat(landing): implement Revora Landing.dc.html`. This file is
now a RECORD of the approved copy, not a proposal. Where it disagrees with
`app/page.tsx`, the page wins and this file is stale; where it disagrees with
`docs/safety/copy-ledger.md`, the ledger wins. Three things here were deliberately
NOT shipped — the design file's drawn phone, its "It does not diagnose anything" FAQ
answer, and its uppercase stage labels; the implementing commit records why.
**Date:** 2026-08-06
**Source material:** `docs/prompts/landing_page_copy_compile.md` (both halves)
**Governed by:** `docs/product-marketing.md` · `docs/safety/claims-boundary.md` ·
`docs/safety/copy-ledger.md` (worktree copy)

---

## 0. The one belief

Every section below moves the reader toward exactly one belief:

> **This was built for my situation specifically, and it will answer the question I
> actually have — about this plate, tonight — without turning me into an accountant.**

Anything that does not move the reader toward that belief is cut. Three sections
from the old copy are cut on that test alone; see §12.

### The journey, stated once

| | |
|---|---|
| **Where they are** | An A1C between 5.7% and 6.4%. Two words of advice. An appointment six months out. A plate in front of them tonight they have to guess about — and then worry about for an hour. |
| **Where they want to be** | Knowing where tonight's meal lands, before they sit down, without weighing anything. |
| **What blocks them** | Everything available is either too general (articles, "eat better") or too much work (logging apps). Nothing addresses one meal, once, right now. |

---

## 1. Hero

**Job:** Reader arrives cold. Leaves knowing this is for *them* specifically, that an
answer takes seconds, and that trying costs nothing.

**Why it's here:** It is the only section that must work alone — most readers judge
the entire product on it.

### Copy

**H1**
> A meal checker built only for prediabetes.

**Subhead**
> Describe the plate in front of you. One card back: where it lands, why, and a change
> worth making when there is one. For an A1C of 5.7% to 6.4%. Nothing to log.

**Trust ticks**
> - No login for your first checks.
> - When we're unsure, we say so.
> - If you ever subscribe, cancel is one tap — not an email.

**CTA**
> Check your first meal — free

**Fineprint**
> 10 free checks on your first day, then you decide.

**Beside it — the illustrated result card** (unchanged from the current build)

> AN ILLUSTRATED EXAMPLE
> **MEAL** — Grilled chicken, brown rice, and a side salad
> **SIGNAL** — ✓ Clear
> **WHY** — This looks like a reasonable fit. The meal already has protein and
> vegetables, so it looks more balanced than a fast-carb-heavy option.
>
> *Revora is informational only and is not medical advice. Talk with a doctor or
> registered dietitian for guidance that is specific to you.* **Privacy**

**Caption under the card**
> This is the whole screen. No score, no dashboard, no change to make: this meal
> already looks balanced, so that is the whole answer.

### Note

Kept structurally intact per your instruction. The reason it works is worth naming so
it doesn't get edited away later: **the page shows the product's actual output next to
the promise, so the promise is verifiable before the reader clicks anything.** The
caption is doing more work than it looks — it pre-empts *"where's the rest of it?"*,
which is the first objection a minimal interface raises.

---

## 2. Revora at a glance  ⬅ RESTORED

**Job:** Compress the entire value proposition into four facts for the reader who
scrolls before reading.

**Why it's here:** It is the scanner's version of the hero, and it front-loads the two
qualifying facts (the A1C range, the zero-cost trial) before the reader invests any
attention in the problem section.

### Copy

| **Seconds, not sessions** | **5.7–6.4%** | **10 free checks** | **Nothing to log** |
|---|---|---|---|
| from describing the meal to the answer | if your A1C is here, this was built for you | on day one, no login and no card | no weighing, no calories, no macros, ever |

### Note

Restored from the old copy. Placed directly under the hero because its second stat is
the qualifier — a reader outside 5.7–6.4% should find that out in the first screenful,
not four sections down.

**✅ RESOLVED — "10 seconds" is gone.** The old copy's `10 seconds` was the page's only
performance claim and it was unsubstantiated. Replaced with **`Seconds, not sessions`**,
which makes the same competitive point (against logging apps) without asserting a
number nobody has measured. Upgrade to a measured figure later if p50 time-to-answer
is ever instrumented; do not block the page on it.

⚠️ **Implementation note:** `10 free checks` must interpolate `TASTER_LIMIT`
(`lib/client/taster-store.ts:2`), not hardcode `10`. Every other surface interpolates
it precisely so it cannot drift.

---

## 3. Six months is a long time to guess.

**Job:** Reader recognises their own situation in specific detail, and the villain is
named — not their willpower, but the gap they were left in.

**Why it's here:** Nobody buys a solution until they believe the problem is understood
better by the seller than by themselves.

### Copy

**H2**
> Six months is a long time to guess.

**Lede**
> Nobody handed you a plan. You were handed a number, two words of advice, and an
> appointment half a year away. Everything in between is supposed to be your job to
> figure out.

**The four pains**

> **The advice was two words long.**
> "Eat better." Better than what? Is oatmeal fine? Is the sandwich at lunch a problem?
> Nobody said, and the appointment is in six months.
>
> **Every article contradicts the last one.**
> Fruit is fine, fruit is sugar. Rice is out, brown rice is in. You have read all of it
> and you still do not know about the plate in front of you tonight.
>
> **The apps want you to become an accountant.**
> Weigh it, log it, scan the barcode, hit your macros. You did not ask for a second
> job. You asked what to do about dinner.
>
> **So you guess, and then you worry.**
> You eat the thing, and spend the next hour wondering whether it was a mistake. That
> loop is the actual cost of being told nothing.

### Note

Unchanged — this is the strongest copy on the page and it is already ledgered
(`landing-audience-pains`). The four pains are ordered deliberately: two about
*information*, one about *effort*, one about *emotion*. The fourth is the one that
actually sells, because it names a cost the reader feels nightly and has never seen
written down.

---

## 4. Built for one range, and honest about the edges

**Job:** Convert the scope limit from a disclaimer into a reason to trust.

**Why it's here:** A tool that admits who it is *not* for is the only kind a cautious
reader believes about who it *is* for.

### Copy

> Revora exists for that gap and nothing else. If your A1C sits outside 5.7% to 6.4%,
> it says so plainly and points you to a clinician instead of pretending.

**Beside it — the real `/check` screen** (unchanged from the current build)

**Alt text**
> The Revora check screen on a phone: one box to describe the meal, one field for your
> latest A1C, and a button to check it.

**CTA**
> Check your first meal — free

**Under the CTA**
> No login, no card, nothing to install.

### Note

This is the page's first risk reversal and it is doing double duty — it removes the
signup objection *and* demonstrates the honesty claim from tick #2 in the same breath.

---

## 5. It asks before it guesses

**Job:** Reveal the mechanism. This is the only section that explains *why* the answers
can be trusted more than an article's.

**Why it's here:** Every competitor guesses confidently; asking one question instead is
the single most defensible difference this product has.

### Copy

**H2**
> It asks before it guesses

**Lede**
> Type "oatmeal" and Revora asks whether it is plain or sweetened, because the honest
> answer depends on it.

**The exchange**

> AN ILLUSTRATED EXAMPLE
>
> **You type:** oatmeal
>
> **Need one more detail** — Is this plain or sweetened?
>
> **You answer:** plain oatmeal
>
> **Revora result — Be careful**
> Oatmeal on its own is a carb-heavy start, so it can have a higher blood-sugar impact
> than its healthy reputation suggests.
>
> **Adjustment:** If practical, add protein — Greek yogurt, nuts, or eggs on the side —
> to make it easier to handle.
>
> **Swap:** Steel-cut oats hold up steadier than instant packets.
>
> *Revora is informational only and is not medical advice. Talk with a doctor or
> registered dietitian for guidance that is specific to you.* **Privacy**

**Closing line**
> Without that one question, Revora would have been guessing.

**Dare link**
> Type "oatmeal" and see what it asks you.

### Note

The oatmeal example is well chosen and should not be swapped: oatmeal is *believed
healthy*, so the "Be careful" answer surprises the reader and proves the tool is not
just flattering them. A boring example would prove nothing.

⚠️ The old copy's version of this line ended *"Most apps would just pick one and sound
confident."* It left the page when its block did, not by a ruling. **Recommend leaving
it out** — it is a swipe at unnamed competitors and the section is stronger making the
positive claim alone.

---

## 6. The same card, three times.

**Job:** Prove the output is consistent and that "Clear" is a real answer, not a
withheld one.

**Why it's here:** It answers the objection the hero raises — *"is that really all I
get?"* — by showing the same minimal layout succeeding across all three outcomes.

### Copy

**H2**
> The same card, three times.

**Lede**
> One layout, whatever the answer is. Here is the card from the top of this page, next
> to the two you have not seen. Notice the Clear card carries no change to make: when a
> meal already looks balanced, Revora says so and stops. It does not invent a correction
> to look useful.

**Card 1**
> **MEAL** Grilled chicken, brown rice, and a side salad
> **SIGNAL** Clear
> **WHY** This looks like a reasonable fit. The meal already has protein and
> vegetables, so it looks more balanced than a fast-carb-heavy option.

**Card 2**
> **MEAL** A bagel with jam and a glass of orange juice
> **SIGNAL** Be careful
> **WHY** This may have a higher blood-sugar impact than a more balanced meal because
> it leans heavily on refined carbs.
> **TRY** Adjustment: If practical, add protein or nonstarchy vegetables to make it
> easier to handle.

**Card 3**
> **MEAL** A large soda with fries on the side
> **SIGNAL** Hold off
> **WHY** This is likely a higher-impact choice in its current form because it is
> mostly sugary or refined carbs.
> **TRY** Swap: A smaller portion with protein or nonstarchy vegetables would be a
> steadier fit here.

**Footnote**
> Illustrated examples. Every card ends with the same line: Revora is informational only
> and is not medical advice.

**CTA**
> Check your first meal — free

### Note

*"It does not invent a correction to look useful"* is the most persuasive sentence in
this section and possibly on the page. It is a restraint claim, and restraint is the
one thing a reader burned by nutrition apps is actively scanning for.

---

## 7. What actually changes  ⬅ RESTORED

**Job:** Land the transformation. Reader sees their own week, four specific moments,
before and after.

**Why it's here:** This is the section that literally executes your brief — *from where
they are to where they want to be* — and the current build has no equivalent. Without
it the page argues the product is good but never says what the reader's life looks like
once they have it.

### Copy

**H2**
> What actually changes

**Lede**
> Not a transformation. Four specific moments in your week that stop being hard.

| Now | After |
|---|---|
| Tonight you stand at the counter and guess. | You describe the plate and know where it lands before you sit down. |
| You read three articles at 11pm and they disagree. | You ask about the one meal in front of you and stop reading. |
| Eating out means ordering and then quietly worrying. | You check the menu item at the table and order on purpose. |
| Six months of meals, and nothing to show your doctor. | A saved history of what you actually ate, in your own words. |

### Note

⭐ **This is my strongest recommendation in the whole document.** It exists in the old
copy and was dropped. It is the only place the page describes the reader's *life*
rather than the product's *behaviour*, and the "Not a transformation" opener is what
keeps it inside the claims boundary — it explicitly declines the health-outcome promise
the format usually invites.

The fourth pair is also the only argument on the page for creating an account, which
is otherwise unmotivated.

⚠️ **Its ledger row must state explicitly why the fourth pair is not a gated claim.**
*"A saved history of what you actually ate"* is `encrypted history` — advertisable per
`product-marketing.md`. It is **not** a longitudinal insight, which is the gated thing:
history is the record the user already created, an insight is a pattern Revora surfaces
across it. Write that distinction into the row's notes rather than leaving the claims
audit to infer it, because the two read similarly and the wrong inference fails the
launch gate.

---

## 8. Calm, and honest about its limits

**Job:** Absorb the skeptical reader's remaining doubt by volunteering the limits
before they have to ask.

**Why it's here:** Proof before pressure. This is the last thing between the reader and
the final CTA, and for a health-adjacent product it has to be limits, not hype.

### Copy

**H2**
> Calm, and honest about its limits

**Lede**
> No miracle promises. Revora earns trust the slow way — by telling you exactly what it
> measures and where it stops.

**Sources**
> Revora's general meal-planning principles map to public-health guidance and cited
> nutrition research — that carbs raise blood sugar, that pairing them with protein,
> fibre or nonstarchy vegetables can slow the rise, and that less-refined carbs
> generally land more gently than highly refined ones.
>
> Those sources support narrow educational statements about food. They are not evidence
> that Revora produces a particular health result, and nothing on this page claims
> otherwise.
>
> **Read the sources and the limits.**

**When we're unsure, we say so**
> If a food is ambiguous, Revora asks one clarifying question instead of guessing — and
> errs on the careful side.

**Your health data stays yours**
> Your A1C and meal text are encrypted at rest, stored only with your explicit consent,
> and deleted — all of it — in one tap.

**Not medical advice**
> Revora is informational only. Talk with a doctor or registered dietitian for guidance
> that is specific to you.

### Note

*"Nothing on this page claims otherwise"* is unusual and worth keeping — it audits the
page from inside the page. Readers who have been burned by health marketing notice it.

⚠️ The old copy's fourth item here — *"Grounded in published research"*, describing the
weekly recap — is **cut**. See §12.

---

## 9. Fair questions

**Job:** Clear the last mechanical objections without making the reader hunt.

**Why it's here:** These five are the actual pre-click questions; anything else belongs
in support, not on the page.

### Copy

**H2**
> Fair questions

> **Is Revora medical advice?**
> No. Revora is informational only and gives general educational information about meal
> composition. It does not diagnose anything, does not predict your individual response,
> and does not replace a doctor or registered dietitian. Talk with a clinician for
> guidance that is specific to you.
>
> **Who is Revora for?**
> Adults with an A1C between 5.7% and 6.4% who want a plainer read on the meal in front
> of them. If your A1C sits outside that range, Revora says so and points you to a
> clinician rather than giving you a label it cannot stand behind.
>
> **Do I need an account or a card to try it?**
>
> *(trial mode)* No. Your first `{TASTER_LIMIT}` checks, on your first day, need no
> login and no card. They live on this device only. The 7-day free trial needs a card
> but charges nothing for a week, and we email you before any charge.
>
> *(legacy mode)* No. Your first `{TASTER_LIMIT}` checks, on your first day, need no
> login and no card. They live on this device only. After that, a free account includes
> `{FREE_DAILY_CHECKS}` free checks a day, still no card. Premium is optional, and
> cancels in one tap.
>
> **What do I actually have to do?**
> Describe the meal in your own words — type it or say it. No weighing, no barcode, no
> portion sizes, no food database to search. If the description is ambiguous, Revora
> asks one question.
>
> **How do I cancel?**
> One tap, on your account page, effective at the end of the paid period. No retention
> screens, no email hoops. Deleting your account removes your data with it.

### Note

⛔ **CORRECTED — my first draft weakened this section, and the review was right to
catch it.** I had replaced the account/card answer with *"Describe a meal and you get
an answer"*, which is **strictly less disclosure than the page ships today**. The
current build (`app/page.tsx:108–112`) is variant-aware and states the post-day-one
requirement outright: the card-required trial under `trialMode`, or the
`FREE_DAILY_CHECKS`-a-day free account under legacy. Dropping that, **while also
removing every price from the page**, means the reader would first learn a card is
involved at the trial wall. That is precisely the bait-and-switch feeling this page's
honesty positioning exists to prevent. Restored in full.

Same correction on cancel: *"effective at the end of the paid period"* and *"Deleting
your account removes your data with it"* are billing-transparency substance, not
filler. Both restored.

⚠️ **These answers must stay interpolated and variant-aware in code** — `{TASTER_LIMIT}`
and `{FREE_DAILY_CHECKS}` are constants (`lib/client/taster-store.ts:2`,
`lib/free-tier.ts:11`) and the branch is `paywallMode() === "trial"`. Do not flatten
them into the static strings shown above; the braces here are placeholders, not copy.

**Added:** *"What do I actually have to do?"* — the effort objection is the one the
pains section raises hardest ("the apps want you to become an accountant") and the page
never answers it directly.

**Not added:** *"How does the photo check work?"* — already correctly gated behind
`photoEnabled` (`app/page.tsx:113`). It renders only when the flag is on, which is the
right mechanism. See §12.1.

---

## 10. Try it before you pay a cent → Final CTA  ⬅ OPTION B, NOW INCLUDED

**Job:** Set the cost expectation honestly, in shape rather than in numbers, then ask.

**Why it's here:** Without it the page has no close and no expectation-setting anywhere
— and §9's FAQ becomes the only place a card is ever mentioned, which is too late and
too quiet. This is **Option B from §12.3, now the approved direction.**

### Copy

**H2**
> Try it before you pay a cent

**Lede**
> Three stages, and you find out the exact cost before any of them charges you.

**Stage 1 — Day one**
> **`{TASTER_LIMIT}` free checks.** No login, no card. See how the answers feel at your
> own table.

**Stage 2 — Your free week**
> **Seven days free.** A card is required and nothing is charged. Two days before it
> ends, we email you the exact date and amount.

**Stage 3 — After that**
> **You decide.** Unlimited checks, your history on every device, and one optional
> reminder. Cancel in one tap from your account page — not an email.

**Closing line**
> Nothing here renews without telling you first.

---

**H2 (final CTA)**
> Start with tonight's dinner.

**Lede**
> One meal, described in your own words, and an answer before you sit down.

**CTA**
> Check your first meal — free

**Fineprint**
> `{TASTER_LIMIT}` free checks on your first day, then you decide.

### Note

⚠️ **This block names no amount, and that is load-bearing, not stylistic.** *"The exact
date and amount"* and *"You decide"* set the expectation that money is coming without
stating a figure. `tests/unit/revora/landing-paywall-copy.test.ts`, `trial-wall.spec.ts`
and `billing-pages.spec.ts` all assert the page renders no amount on both mode-pinned
servers. **Whoever implements this must run the full e2e gate, not just vitest** — two
of those three pins live only in Playwright.

⚠️ **Stage 2 is trial-mode-specific.** Under legacy mode there is no 7-day trial; there
is a `{FREE_DAILY_CHECKS}`-a-day free account. This block must be variant-aware the same
way §9's FAQ is, or it will state something false on one of the two deploys.

### Final CTA alternatives

| # | H2 | Note |
|---|---|---|
| A | Start with tonight's dinner. | Recommended. Concrete, immediate, single meal — matches the product's actual unit. |
| B | Stop guessing at dinner. | From the old copy. Stronger verb, but leads with the negative at the moment of action. |
| C | You have a plate in front of you right now. | Highest tension, riskiest — presumes context that may be false at 11am. |

---

## 11. Claim / proof checklist

Statements on this page that require evidence or a decision before it ships.

| # | Claim | Status | Needed |
|---|---|---|---|
| 1 | ~~"10 seconds"~~ → **"Seconds, not sessions"** (§2) | ✅ **RESOLVED** | Claim removed rather than substantiated. No measurement needed, nothing blocks on it. |
| 2 | "10 free checks" (§1, §2, §9, §10) | ✅ Verifiable in code | `TASTER_LIMIT = 10` (`lib/client/taster-store.ts:2`). **Must interpolate, never hardcode.** Also baked into the hero screenshot as pixels — `tests/unit/revora/landing-art.test.ts` guards that coupling, because no copy audit can read a PNG. |
| 3 | "5.7% to 6.4%" scope (throughout) | ✅ Approved | `product-home-hero` (ledger line 22), evidence rows `CDC-A1C-RANGES`, `NIDDK-A1C-INTERPRETATION`. |
| 4 | "encrypted at rest… deleted in one tap" (§8) | ⚠️ Verify | Confirm the one-tap deletion path still deletes the account with no retention interstitial. Copy asserts *no retention screen*. |
| 5a | Trust tick "cancel is one tap — not an email" (§1) | ✅ **Approved & Active** | `home-trust-strip` (worktree ledger line 70) carries the three ticks **verbatim**, Active = Yes. No action. *The review was right that this needs no reactivation.* |
| 5b | FAQ cancel answer, "effective at the end of the paid period…" (§9) | ⚠️ **Needs reactivation** | Maps to `landing-cancel-promise` (worktree ledger **line 102**) — Approved, **Active = No**, deactivated when the pricing block was deleted. Its copy is a *different, longer* promise than the trust tick. Restoring the full FAQ answer means flipping it back to Active + `npm run contract`. |
| 6 | The three sample cards (§6) | ✅ Approved | `landing-three-answers` (line 97). Labelled "Illustrated examples" — must stay labelled. |
| 7 | Sources paragraph (§8) | ✅ **Approved & Active** | `landing-sources-note` — worktree ledger **line 101**, Active = Yes. Confirmed present, not asserted. |
| 8 | "What actually changes" pairs (§7) | 🆕 **NEEDS A LEDGER ROW** | Not currently ledgered in any form. Behavioural claims only, no health outcome — should pass, but must be filed before it ships. |
| 9 | "Revora at a glance" strip (§2) | 🆕 **NEEDS A LEDGER ROW** | Same. |
| 10 | New FAQ answers (§9) | 🆕 **NEEDS LEDGER ROWS** | The FAQ ships entirely unledgered today. Adding written answers is the moment to fix that. |
| 11 | Offer block (§10) | 🆕 **NEEDS A LEDGER ROW** | Option B. States trial *shape* with no amount. The row's notes must record that omitting the figure is deliberate, so a later editor does not "helpfully" add one back. |

### ⚠️ Read the ledger from the worktree, not the main checkout

The two rows the review flagged as phantom — `landing-cancel-promise` and
`landing-sources-note` — **exist**, at worktree lines 102 and 101. They are absent from
`/home/tefera/Desktop/Revora/docs/safety/copy-ledger.md` because **that copy is stale**:
126 lines against the worktree's 130.

The authoritative file is
`/home/tefera/Desktop/Revora/.claude/worktrees/landing-w1-w4/docs/safety/copy-ledger.md`.

This is a live trap, not a one-off — it has now produced a wrong reading twice. Any
ledger claim made against the main checkout is unreliable until the branch merges.
`npm run contract` runs against the worktree, so the *tests* have always been right;
only human and agent reads have been wrong.

---

## 12. What I cut, and why

Three sections from the old copy are deliberately **not** restored. Two are judgement
calls you can overrule. **One is not.**

### ⛔ 12.1 Every mention of photo input — this one is not a judgement call

The old copy sells photo input in four places: *"Snap the meal"*, *"Snap a photo,
dictate it, or type it"*, *"Snap it, say it, or type it"*, and the FAQ question *"How
does the photo check work?"*.

`docs/product-marketing.md` is explicit in two places:

> Meal photo-assist exists behind a fail-closed owner/evidence gate and **is not an
> advertised launch feature**.

> Launch gate #4: meal photo-assist and longitudinal insights **remain unadvertised and
> fail-closed** unless each production flag, evidence review, and explicit written owner
> approval are green.

The current build correctly dropped it. **Restoring old sections wholesale would put a
gated feature back into acquisition copy.** All input references in this draft say
*type it or say it*. If the gate has since been opened, tell me and I will rewrite §1,
§4 and §9 to include it — but I will not assume it.

### 12.2 "A 90-day journey, recapped weekly" — cut, recommend keeping it cut

Same launch gate: *longitudinal insights* are unadvertised and fail-closed. The old
copy's *"a weekly pattern when one stands out"* reads as exactly that. `progress based
only on in-app behavior` is advertisable; a pattern surfaced across time is the thing
the gate names.

The 90-day block is also the page's longest feature description for its least
load-bearing feature, and it sits inside the reader's decision path rather than after
it.

### 12.3 The offer block, including "$12.99/month" — cut, and it forces a decision

The old copy's *"Try it before you pay a cent"* section carries the three-stage trial
and the monthly price. You deleted the pricing section by instruction, and the test
suite now asserts on both mode-pinned servers that the page renders no amount.

**The consequence is worth stating plainly:** a conversion page normally closes with an
offer and a risk reversal, and this page now has neither. I have distributed the risk
reversal across the trust ticks (§1), the no-login line (§4), and the cancel and
free-check answers (§9) — but that is a mitigation, not an equivalent.

**✅ DECIDED — Option B.** Now drafted as §10.

| Option | Consequence | |
|---|---|---|
| A. Keep it priceless | Honest, but no close and no expectation-setting anywhere. | ❌ |
| **B. No-amount offer block** | States the trial *shape* — free checks → free week → you decide — without a figure. Keeps the price deletion intact. | ✅ **chosen** |
| C. Restore the price | Strongest close, but reverses your deletion and re-opens §0.2 #4's honesty pins. | ❌ |

The deciding argument was not close strength; it was **disclosure**. Under A, combined
with my first draft's shortened FAQ, the only mention of a card anywhere on the page
had been deleted — so the first time a reader learned money was involved would have
been the trial wall. B fixes that at the top of the funnel of the reader's attention,
where it belongs.

⚠️ B does **not** re-invert the deletion pins. It names no amount, so
`landing-paywall-copy.test.ts`, `trial-wall.spec.ts` and `billing-pages.spec.ts` should
all still pass unchanged — but that must be *verified by running them*, not assumed,
and two of the three are Playwright-only.

---

## 13. SEO

⚠️ Metadata was set deliberately in `55e2ea6 feat(seo): keyword-targeted metadata and
landing JSON-LD`. **Do not overwrite it on the strength of this draft** — these are
proposals to diff against what is already there.

**Title (58 chars)**
> Revora — A Meal Checker Built Only for Prediabetes

**Meta description (154 chars)**
> Got an A1C of 5.7–6.4%? Describe any meal and get one clear answer in seconds — where
> it lands, why, and what to change. 10 free checks, no login, nothing to log.

---

## 14. Layout follow-up — recorded, not actioned

**257px of vertical whitespace** between the last line of one section and the first
line of the next, measured at 1280px, uniform across every block boundary.

Cause: `DESIGN.md` §11 mandates `padding: clamp(72px, 10vw, 128px) 0`, which pins at
its 128px ceiling from 1280px up, and adjacent sections stack their padding
(128 + 129 = 257).

**This is a §11 amendment, not a CSS tweak.** Not actioned in this task.

⚠️ Note for whoever does action it: this draft **adds two sections** (§2 and §7). Both
add page length, and §11.1's reachability budget is measured at 375px where the worst
desert currently has 124px of headroom. **The copy and the spacing fix have to be
measured together**, not sequentially — tightening the gaps may be what pays for the
new sections.

---

## 15. Open items

### ✅ Closed by the review

| | |
|---|---|
| Offer decision | **Option B** — no-amount offer block, now §10 |
| "10 seconds" | **Softened** to `Seconds, not sessions`; claim removed, not deferred |
| Photo gate | **Verified closed** — `photoInputEnabled()` gates the FAQ at `app/page.tsx:82,113`; `product-marketing.md` lines 24 and 152 unchanged |
| §7 "What actually changes" | **In** |
| FAQ disclosure | **Restored in full**, variant-aware and interpolated |
| Checklist rows 5 and 7 | **Corrected** — both rows exist in the *worktree* ledger; see §11's boxed note |

### ⚖️ The one thing still needing your ruling

**The H1 names a condition where every approved ledger row names a range.**

> A meal checker built only for **prediabetes**.

Every Approved row is careful to say the *range*: `product-home-hero` — "people using a
prediabetes-**range** A1C"; the FAQ — "People in the prediabetes A1C **range** of 5.7%
to 6.4%". The H1 alone edges toward addressing a diagnosis, which is the boundary
`claims-boundary.md` draws hardest ("Diagnosis or screening claims" is the first banned
family).

The subhead's `For an A1C of 5.7% to 6.4%` partially covers it, and the H1 is the part
of the page you explicitly said you liked — so I am **not** changing it unasked.

| Option | |
|---|---|
| **Leave it** | Defensible: it names who the tool is *built for*, not what the reader *has*. Record the reasoning in the ledger row so the audit does not relitigate it. |
| **Amend** | e.g. *"A meal checker built only for the prediabetes range."* One word, keeps the rhythm, removes the ambiguity entirely. |

I lean **amend** — one word buys the argument outright — but the H1 is yours.

### Note on the reviewer's own record

Two of the review's factual corrections were themselves wrong, both from reading the
stale main-checkout ledger. That is not a knock on the review — its instinct was
explicitly right (*"either it lives only in another worktree's ledger copy"*) — but the
correction should not propagate. §11's boxed note records the trap so the next reader
does not make it a third time.

---

## 16. On approval, the implementation task

Nothing here is implemented. In order:

1. File the **five** new ledger rows (§2 strip, §7 changes, §9 FAQ answers, §10 offer,
   plus reactivate `landing-cancel-promise`) in the **worktree** ledger.
2. `npm run contract` — the only gate on ledger edits.
3. Write the copy, interpolating `TASTER_LIMIT` / `FREE_DAILY_CHECKS` and branching on
   `paywallMode()`. No hardcoded numbers, no flattened variants.
4. **All four gates**, including `node scripts/measure-landing.mjs` — this draft adds
   three sections (§2, §7, §10) and the worst desert has 124px of headroom at 375px.
   The §14 spacing fix and this copy must be measured **together**; tightening the
   257px gaps is likely what pays for the new sections.
