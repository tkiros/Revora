<!-- Revora Product Marketing Context. Coach-first. Source: docs/ICP.md, predict/260629-revora-viability/overview.md, docs/build-vs-recommendation.md, docs/coach-mvp.md. -->

> **Single source of truth for Revora positioning & GTM (coach-first, 2026-06-30).** This supersedes the positioning in `Revora_Brand_Positioning_v2.md` and `PRD/Glucosnap_prd_v2.md` (now amended + archived — see `docs/audit/Revora_Alignment_Audit_CoachPivot_20260630.md`). Where they disagree, **this document wins** on positioning, facts, and pricing posture. All claims language defers to `docs/safety/claims-boundary.md`.
>
> **Evidence basis (read before quoting anything):** the *pain, buyer, competitors, and market facts* below are backed by real cited sources (see `docs/ICP.md`). **Willingness-to-pay, conversion, and which hook wins are hypothesis-grade — Revora is pre-launch with zero paying users.** Do not read "validated buyer" as "validated business." Confidence labels: **[H]** lead with it · **[M]** use but validate · **[L]** a bet to test.

# Product Marketing Context — Revora

**What Revora is, in one line:** a **daily prediabetes companion** that answers *"should I eat this, now?"* — giving you glycemic clarity at the moment of the meal, not a calorie count, and **one concrete action**, not a verdict to dread — so you stay in control of your own reversal.

**The legal North Star (must appear verbatim in onboarding + any store listing):** *"Reversal is achieved through your dietary choices — Revora gives you the clarity to make them."* The user is always the agent of reversal; Revora is never the agent.

---

## ⚠️ Open decisions / cleanup needed

Read this before building copy or a campaign on top of this doc.

1. **Pricing is a hypothesis, not a fact. [L]** $12.99/mo is *proposed*, not locked. It is the **most expensive** price in the photo→glycemic-load field and Revora has **zero paying users**. The price-ladder smoke test (§ Goals) must run before any launch price is committed. The old "$12.99 locked (BLK-009)" decision is demoted to a bet.
2. **Camera, CGM, and reversal-score (BAI) are deferred.** They are *later/optional*, not hero features, and **none are built**. The shipped product is text-in. Do not market a photo scanner or a "reversal score." Mechanism is not the pitch — the daily relationship is.
3. **"First-mover" is dead.** Revora is **not** first to photo→glycemic-load for prediabetes (Glycemic Snap, LOGI, SNAQ, January AI got there first). Never imply category creation. The edge is focus + honesty + the daily relationship, not novelty.
4. **Accuracy claims are off-limits.** Every competitor that promised photo accuracy got caught; the audience is already burned. We say "the safer estimate, and we tell you when we're unsure" — never "precise" or "guaranteed."
5. **Conversion and CAC are untested. [L]** No funnel data exists. Treat every conversion/retention number as a target to validate, not a projection to bank.

---

## Product Overview

**One-liner:** see top. **Category:** the prediabetes-exclusive **daily decision coach** — not a tracker, not a diabetes app, not a calorie counter.

**The output primitive (what a user actually gets).** You tell Revora what you're about to eat (today by **text**; a photo is a *later, optional convenience* — not the point). In ~5 seconds it returns one calm **decision card**:
- a plain verdict — **Clear / Be careful / Hold off** (internally SAFE/MODERATE/HIGH),
- **why**, in one sentence (glycemic load, not calories),
- **one thing to do** — e.g. "eat your vegetables first,"
- a **safer swap**, and
- a quiet medical disclaimer.

That card is the wedge. The **moat** is what happens across days: Revora *remembers*, notices patterns ("most of your 'be careful' meals are breakfast"), nudges once a day, and stays in your corner — the thing a one-shot tool and a $89 sensor can't be.

**Category ladder:** *wedge* = "should I eat this, now?" (the meal-moment decision) → *moat* = an honest daily relationship + a prediabetes-only brand identity nobody else owns cleanly.

**Business model:** self-serve consumer subscription, freemium (free daily checks → paid for memory + daily coach + history). **Proposed** pricing $12.99/mo · $99.99/yr · $249.99 lifetime — **[L], to be validated** (see Open Decisions #1).

**What's built today (be honest internally):** a stateless, anonymous, text-in single-shot checker powered by a heavily safety-hardened answer engine (`lib/revora/`: A1C-band routing, conservative bias, uncertainty flagging, fail-closed retry, PII scrubbing). The coach layer (memory → nudge → insight → pay) is the roadmap, not yet shipped. The reusable safe engine is the credibility asset; the coach is the product.

---

## Target Audience

**Primary ICP (commit to one):** **the recently-diagnosed, "trying hard but flying blind" prediabetic.** US adult, sweet spot **40–60**, **A1C 5.7–6.4% in the last ~6 months**, handed vague "eat better, come back in six months" advice, now **actively searching for what to actually eat at each meal.** [H]

**Concretely:** has a *fresh diagnosis trigger*; already self-educating (joined r/prediabetes, googled "prediabetes what to eat," maybe bought an OTC CGM); often a comorbidity (high BP/cholesterol) or women's-metabolic signal (PCOS, gestational-diabetes history, perimenopause); a parent/grandparent with Type 2. **Willing to do the work — the gap is direction, not motivation.**

**Why this buyer, not the tempting alternatives:**
- **Not the ~80% undiagnosed** (bulk of the 115.2M [H]) — no number, no trigger, no search intent. Enormous but inert.
- **Not diagnosed Type 2** — different product, different regulatory frame, brand-excluded; the "you can still reverse this" payload doesn't fit.
- **Not biohackers / Levels users** — driven by optimization, not the fear of a real diagnosis; they churn when novelty fades.

**Primary use case / job:** "Tell me what to do at *this* meal, right now, without a $89 sensor or another calorie app." **The product's first session is the entire sales process** — economic buyer, operational buyer, and user are the same person; no committee, no clinician sign-off between trigger and purchase.

**Decision-maker / influencer roles (not buyers):** the primary-care physician creates the trigger (and **88% of older adults would welcome a doctor's app recommendation [H]** — but ~10% ever get one: a huge untapped channel); the adult child who watched a parent get Type 2.

**Anti-personas (do not chase):** Type 1 / Type 2 (A1C ≥6.5%), anyone on insulin, undiagnosed/"just curious," primary goal weight-loss or calorie-counting, non-US, anyone wanting a medical device or clinical treatment.

---

## Personas

| Persona | Who | Why they convert | Watch-out |
|---|---|---|---|
| **The Blindsided Searcher** (PRIMARY) | 40–60, A1C 5.7–6.4 within 6 mo, "what am I doing wrong" | Acute pain + fresh trigger + active search + self-serve price all co-occur here | The whole funnel rests on this one — don't dilute it |
| **The Reveal-Moment CGM Owner** | Just put on a Stelo/Lingo, watched a "healthy" smoothie spike | Highest WTP signal (already spent $89), evangelist | Small volume (~5–10% of segment) [M] |
| **The Women's-Metabolic Cluster** | 35–55, PCOS / post-GDM / perimenopause | Underserved, biologically triggered, content-resonant | Needs segment-specific copy to land [M] |
| **The "I Did Everything Right"** | Thin, active, blindsided by the diagnosis | Posts about it → viral organic copy | May disengage once reassured it's genetic [M] |

**Three deal-killing blockers:** (1) the doctor's dismissiveness leaves them without a number to act on; (2) the free tier of MyFitnessPal *feels* sufficient; (3) "another subscription that'll scam me on cancellation."

---

## Problems & Pain Points

**Core problem — the execution gap, not the knowledge gap.** *"My problem was never knowing what to do… My problem was that I'd never had anyone in my corner every single day."* (u/One-Expression6854)

**Lead with the "healthy-food betrayal"** — the most repeated, most concrete, most emotionally charged, most uniquely solvable pain in the research. Conventional "healthy" foods spike prediabetics specifically:
- *"I tried a CGM for awhile and am now scared to eat oatmeal… and we are taught that oatmeal is very healthy for us."* (u/tttwee-in00, verified)
- *"A banana by itself sends me past 180. Same banana with two tablespoons of almond butter and I barely move."* (u/BubblyElderberry3984)

**The other layers (use as needed):**
- **The dismissive diagnosis.** *"It seemed like a vague non-issue, lumped into the rote advice at every physical."* (u/leslsu) Some aren't even told their numbers.
- **Genetic fatalism / fear of progression.** *"I feel destined to fail because of my genetics and I'd like to live long enough to see my kids turn 30."* (u/not-a-real-shark, verified)
- **"I was doing everything right" rage.** *"I have lost 35 lbs… strength train 3 times a week… WHAT AM I DOING WRONG?!?!?!"* (u/EntrepreneurGal727)
- **Caught between "free but useless" and "$89/mo CGM."** The segment tolerates ~$5–15/mo for an app; the sensor stings.
- **Mistrust after being dismissed** — primed to distrust authority, hungry for a credible, citing, non-judgmental guide, and **quick to abandon anything that feels like false precision or a scam.**

**Emotional job:** replace the dread of "am I going to become diabetic" with the calm of a concrete next action; replace meal-time panic with a 5-second answer. **Identity job:** be *the person who caught it early and acted* — not the cautionary tale.

---

## Competitive Landscape

**The honest truth: Revora is not first, and would be the most expensive photo→GL app.** The edge has to be earned on focus, honesty, and the daily relationship — not features.

| Alternative | Price | Why it's insufficient for *this* job |
|---|---|---|
| **Do nothing / Google low-carb** *(the real #1)* | $0 | No meal-level feedback; natural-reversion stats give cover for inaction [H] |
| **MyFitnessPal** *(#1 active alt)* | Free / $19.99 Premium | Calories/macros, **no glycemic load, no sequencing**; high abandonment; *"tracking can feel like another chore"* (their own blog) [H] |
| **Glycemic Snap** | ~$9.99/mo | Already does photo→GL for prediabetes; complaint: ignores portion size, missing GL values [H] |
| **LOGI** | ~$6.99/mo ✓ | Closest competitor — photo→GI/GL + lists sequencing; same meal → different GL on different days; not prediabetes-exclusive [M] |
| **SNAQ** | ~$45/yr (~$3.75/mo) | "Prediabetic window" copy but CGM-diabetic core; panned on carb accuracy [H] |
| **January AI** | $4.99–9.99/mo | Photo→glucose prediction, no CGM; population-average ≠ individual [H] |
| **OTC CGM (Stelo/Lingo)** | ~$89/mo | Shows the spike *after*; no food-context intelligence. **Complement, not competitor** [M] |
| **Dietitian (1–2 visits)** | $100–250/session | Generic advice; most don't return after 1–2 visits [M] |
| **DPP** | Free if covered | Proven (58% risk reduction [H]) but **<1% enroll**; rarely referred |
| **Revora (proposed)** | **$12.99/mo · $99.99/yr · $249.99 lifetime [L]** | Prediabetes-exclusive; decision-not-log; in-your-corner daily — **premium price is unvalidated** |

**Positioning statement:** *Revora is the calm daily coach for the prediabetes window — it tells you what to do at the next meal and remembers you, where calorie apps only count and CGMs only report.*

---

## Differentiation

Five differentiators, in priority order:
1. **Prediabetes-exclusive identity** — built only for A1C 5.7–6.4%. Nobody owns this window cleanly.
2. **Decision, not log** — answers "should I eat *this*, now?" not "track your day."
3. **Glucose, not calories** — glycemic load is the metric that predicts blood sugar; calories never appear.
4. **A daily relationship** — memory, one nudge, one insight, a streak. The retention layer competitors don't have.
5. **Honesty as a feature** — "the safer estimate, and we tell you when we're unsure." Trust is the moat in a category poisoned by overclaiming.

**Competitive wedge (one line for outreach):** *"The only prediabetes-exclusive coach that tells you what to eat next — not just what you ate."*

### What keeps Revora from becoming a generic tracker (the 4 guardrails — never cross)

1. **No calories** — ever. Revora measures glycemic load, not energy.
2. **No general / weight-loss / everyone audience** — A1C 5.7–6.4% prediabetes window only.
3. **No neutral-number / verdict copy** — calm, permission-first, action-ending voice; every result ends in one concrete action, not a number or a "danger."
4. **Stay "should I eat this, now?"** (decision at the meal) — not "log your day" (retrospective tracker).

Cross any one of these and Revora becomes a worse, more expensive MyFitnessPal.

---

## Objections & Anti-Personas

| Objection | Why it arises | How to neutralize |
|---|---|---|
| **"Why pay when MyFitnessPal is free?"** *(#1 deal-killer)* | MFP is the default | *"MyFitnessPal counts calories. Calories don't predict your blood sugar — glycemic load does."* |
| **"Is this just guessing from a photo?"** | Every photo→GL app has accuracy complaints | *"We give you the safer estimate and flag when we're unsure. No false precision."* Honesty is the wedge. |
| **"$12.99 is more than the other GL apps"** | True | *"Because it's built only for prediabetes, and it tells you what to do next — not just a number."* If unprovable, this is a real pricing risk. |
| **"Another subscription that'll scam me on cancellation"** | Category poisoned (Klinio 1.2★, mass unauthorized-charge reviews) | **Frictionless, visible cancellation as a selling point.** No dark patterns. |
| **"I'll just buy a CGM and see for real"** | OTC CGMs available | *"A CGM shows the spike after. Revora shows you how to eat so it doesn't — for a fraction of the cost."* |

**Hard disqualifiers:** Type 1/2 (A1C ≥6.5%), on insulin, undiagnosed, weight-loss-primary, non-US, wants a medical device.

---

## Switching Dynamics (JTBD Four Forces)

- **Push (away from today):** a fresh A1C in range; a dismissive doctor; the healthy-food betrayal; fear of becoming diabetic.
- **Pull (toward Revora):** a calm 5-second answer; "someone in my corner daily"; built only for *me* (prediabetes); keep my comfort foods instead of being told to quit them.
- **Habit (holding them back):** MyFitnessPal already installed; "do nothing / Google it" is free and easy.
- **Anxiety (holding them back):** "another subscription," fear of false precision, fear of a cancellation scam. **Neutralize anxiety up front** — honesty + frictionless cancellation — or the pull never wins.

---

## Customer Language

**Mirror these (verbatim from real prediabetics):**
"scared to eat oatmeal" · "blood sugar naps" · "what am I doing wrong" · "destined to fail because of my genetics" · "nobody in my corner" · "eating healthy isn't healthy for us" · "check the arrow, then the number" · "it felt different this time" · "vague non-issue."

**Avoid these (they repel this audience or carry legal risk):**
- "avoid / forbidden / you shouldn't" — restriction framing repels.
- "AI-powered" as the lead — the audience is burned by inaccurate AI apps (a candy bar logged at *"27 million calories,"* Cal AI review).
- "manage your condition" — implies permanence.
- **"Revora reverses prediabetes"** (app as the agent) — FTC/FDA risk + brand violation. Always user-as-agent.
- "guaranteed / results."
- "reversal" before day-14 — earn it with clarity first.

**Glossary (use precisely):** *glycemic load* (the metric, not calories) · *the betrayal* (healthy food that spikes) · *the window* (A1C 5.7–6.4) · *in your corner* (the daily relationship) · *clear / be careful / hold off* (the verdict, never "danger").

---

## Brand Voice

A **knowledgeable friend who cites sources**, not a clinical system delivering judgments. Tone: **calm, permission-first, action-ending.** Three principles: (1) every answer ends in one concrete *do*, not a *don't*; (2) name uncertainty out loud — it builds trust; (3) the user is the agent, always. Five adjectives: *calm, honest, focused, warm, credible.* Never alarmist, never restrictive, never "AI" as the hero.

---

## Proof Points

**Honest pre-revenue stance:** Revora has **no paying users yet.** Lead with the validated *problem* and the *discipline of the build*, not invented traction.
- **The pain is real and cited** — 10 r/prediabetes threads (spot-checked verbatim), CDC/NIDDK/NEJM/AARP sources (`docs/ICP.md`).
- **The structural gap is real** — 115.2M have prediabetes [H]; **<1% engage the proven free DPP** [H] → ~98% get zero structured support.
- **Safety is engineered, not claimed** — A1C-band routing, conservative/uncertainty-flagging answers, fail-closed retry, PII scrubbing, an eval rubric and safety-eval suite already exist. In a category caught overclaiming, "we built it to be careful and to admit doubt" is the credibility story.
- **Risk-reversal:** frictionless cancellation, transparent billing, no dark patterns — the anti-Klinio.

---

## Offer and Pricing

- **Free:** a few daily meal-decision checks — enough to hit the "betrayal aha" in the first session.
- **Paid (proposed, [L]):** $12.99/mo · $99.99/yr · $249.99 lifetime — unlocks **memory + the daily coach + history**, i.e. the relationship, not just more checks.
- **The upgrade moment:** after value is *felt* (~day 5–7 or after a burst of checks), a soft paywall: *"Keep your history and your daily coach."* Never a hard wall at the betrayal aha.
- **Pricing is a test, not a decision.** Run the price-ladder ($6.99 / $9.99 / $12.99) before committing (§ Goals). If $12.99 craters vs $9.99, reprice.
- **Cancellation is a feature.** Make it one-tap and visible — it's a trust differentiator in a poisoned category.

---

## Goals and Validation Threshold

**Business goal:** prove a prediabetes-exclusive daily coach can **retain and get paid** before heavy build. **Key conversion action:** a recently-diagnosed prediabetic returns day after day and then pays.

**The kill / continue gates (cheapest first):**
1. **WTP smoke test (do this first, [L] → real signal).** One landing page, three hero variants — *healthy-food betrayal* / *doctor sent you home* / *in your corner daily* — driving to a pre-order. Run a **price-ladder** ($6.99/$9.99/$12.99) to matched cohorts. **The variant that wins email AND pre-pay is the hook; pre-pay rate is the first real WTP number.** No pre-pay signal → stop.
2. **D1/D7 return** (on-device memory). No return → the coaching thesis is dead.
3. **Nudge lifts D7** — if one daily nudge can't pull people back, retention won't hold.
4. **Insight cohort retains longer** than the no-insight cohort.
5. **Pre-pay / subscribe rate at price** — the number that decides venture- vs lifestyle-scale.

**Current metrics:** none. Zero users, zero revenue. Everything above is unproven.

---

## GTM and Funnel

**Motion:** self-serve, **trigger-timed.** There is no buying season for a person beyond their lab date — so **be present at the moment of search.**
- **Channels:** organic presence in r/prediabetes (45k+), SEO on "prediabetes what to eat / is oatmeal bad for prediabetes / glycemic load app," App/Play store ASO, the untapped **doctor-recommendation** channel, and Q4–Q1 bloodwork season as a timing lever.
- **Funnel:** A1C result → fear/confusion → Google or r/prediabetes → discover Revora → free → first meal check → **healthy-food-betrayal aha (the oatmeal/banana moment)** → daily return → soft paywall after value → pay.
- **Highest-leverage lever:** the **first-session betrayal aha.** If the first check doesn't produce a "huh, I didn't know that" moment, nothing downstream fires. Engineer onboarding around it.

**Three cold hooks to A/B (smoke test):**
1. **Betrayal:** *"Oatmeal spikes you. A banana alone spikes you. With almond butter, it doesn't. Revora tells you which is which — before you eat."*
2. **Doctor dismissal:** *"Your doctor said 'eat better' and sent you home. Here's what that actually means — one meal at a time."*
3. **In your corner:** *"You already know what to do. You've just never had anyone in your corner at every meal."*

**Strongest single line (lead candidate):** the betrayal hook (#1) — sharpest, most concrete, most uniquely solvable.

---

## Open Gates and Next Actions

| Item | Status | Action required before launch |
|---|---|---|
| Willingness-to-pay at $12.99 | **Unvalidated [L]** | Run the price-ladder smoke test — the #1 action |
| Which hook converts | Hypothesis [M] | 3-variant landing test (betrayal / doctor / corner) |
| Free→paid conversion | Untested [L] | Instrument the funnel from day one |
| Retention (D1/D7, nudge, insight) | Unbuilt → untested | Ship coach Steps 1–3 (on-device), measure gates |
| Accuracy vs incumbents | Unproven [L] | Never claim precision; flag uncertainty; reference science |
| CAC via organic + SEO | Untested [L] | Pilot r/prediabetes + SEO before paid spend |
| Camera / CGM / BAI | Deferred | Do **not** market or build first |
| Claims/legal | Open | Counsel sign-off on store copy + disclaimer (`docs/legal/counsel-brief.md`) |

*Sources: `docs/ICP.md` (cited VOC + market facts), `predict/260629-revora-viability/overview.md` (investor red-team), `docs/build-vs-recommendation.md` (what's built), `docs/coach-mvp.md` (the coach loop + kill-gates). Evidence basis: pain/segment/competitor/market = real cited data; WTP/conversion/hook = hypothesis-grade, pre-launch.*
