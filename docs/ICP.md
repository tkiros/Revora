> **Coach-pivot note (2026-06-30):** Revora's locked direction is now an honest, prediabetes-only **daily coach**. The **photo/camera** input and the **$12.99 price** referenced below are **deferred / unvalidated — not locked**. Positioning source of truth: `docs/product-marketing.md`; resolutions in `docs/audit/Revora_Alignment_Audit_CoachPivot_20260630.md`. The market facts, VOC, personas, and validation plan in this doc remain valid; only the camera-first framing and the "locked" price are superseded (photo → later/optional; price → hypothesis pending WTP).

# Ideal Customer Profile — Revora (Prediabetes Meal-Clarity App)

> **Working product name:** Revora. Working category: **prediabetes daily decision coach** (a meal you describe (photo later/optional) → glycemic-load clarity + food-sequencing tip + safer swap, in ~5s).
> **Status:** v1 — **partly evidence-backed, partly hypothesis-grade.** Pain, segment, competitor and market facts are backed by real retrieved sources (cited inline). Willingness-to-pay and conversion are **hypothesis-grade** — see the evidence basis below. Companion docs: `Revora_Brand_Positioning_v2.md`, `PRD/Glucosnap_prd_v2.md`, raw research in `scratchpad/*-findings.md`.
> **Last updated:** 2026-06-28
> **Owner:** Product & Brand (terrykiros@gmail.com)

---

## ⚠️ Read this first: evidence basis

This ICP separates two things the phrase "validated data" tends to blur:

- **What IS validated against real sources:** the *pains*, the *buyer segment*, the *competitive landscape*, the *triggers*, and the *market facts*. Every quote below is verbatim from a real retrieved web source (URL attributed). The Reddit voice-of-customer quotes were independently spot-checked: 4 of 10 source threads were re-crawled and 7/7 distinctive phrases confirmed verbatim before inclusion. Load-bearing competitor pricing was also spot-checked: LOGI's $6.99/mo and the CDC 115.2M figure were re-verified directly.
- **What is NOT and CANNOT be validated yet:** willingness-to-pay for Revora, free-to-paid conversion, and which hook converts. **Revora is pre-launch with zero real users.** No one has been asked to pay for *this* product. Those claims are inference from competitor pricing and category behavior, labelled `[M]`/`[L]`, and listed as bets in §12. Do not read "real validated data on the buyer" as "validated business model." The first is done; the second needs the validation plan in §12.

| Label | Meaning |
|---|---|
| **[H]** | Structurally near-certain, or appears across 3+ independent retrieved sources. Safe to lead with. |
| **[M]** | Plausible; 2 sources, one strong source, or sound inference. Use, but validate. |
| **[L]** | Single source or pure inference. A bet to test, not a fact. |

**Carried-forward context — but note: the photo/camera input and the $12.99 price below are now DEFERRED / a HYPOTHESIS pending WTP, NOT locked (see coach-pivot note at top):** prediabetes-exclusive (A1C 5.7–6.4%); the per-meal decision (verdict + one action + swap) is the output primitive (text-in today; photo later/optional); proposed pricing $12.99/mo · $99.99/yr · $249.99 lifetime (5 free scans/day); user is always the agent of reversal (legal/brand North Star); US-first.

**Corrections to inherited PRD numbers (verified this round — fix before any external use):**
- "98 million prediabetics" → **CDC now states 115.2 million** ("more than 2 in 5"), 8 in 10 unaware. Source: [CDC Diabetes Statistics, updated Feb 2026](https://www.cdc.gov/diabetes/communication-resources/diabetes-statistics.html) [H].
- "$8.81B → $15.1B prediabetes market" → **UNVERIFIED.** No retrieved source produces these figures; published estimates range from ~$600M (drug-only) to ~$9.5B→$16.7B (Coherent MI, different years) to broader. Stop citing the specific pair. [L]
- "Cal AI converts at 8–12%" → **not found in any source**; founder-reported figure is **20–25% trial conversion** ([Latka, 2025](https://getlatka.com/blog/how-cal-ai-achieved-35-million-revenue-in-just-one-year/)) [M].
- **"First app to do photo→glycemic-load for prediabetes" → REFUTED [H].** Glycemic Snap, LOGI, SNAQ and January AI already exist (see §9). This is the single most important correction in this document.

**One-line product definition:** For a recently-diagnosed prediabetic who was sent home with "eat better" and no plan, Revora turns any meal you describe (photo later/optional) into instant glycemic-load clarity, one action, and a safer swap — so they can act at the moment of the meal instead of guessing.

---

## 1. ICP summary

**Primary ICP (commit to one):** **The recently-diagnosed, "trying hard but flying blind" prediabetic** — a US adult, sweet spot **40–60**, who got an **A1C of 5.7–6.4% in the last ~6 months**, was handed vague "eat better, come back in six months" advice, and is now **actively searching for what to actually eat at each meal.**

`Concretely:` A1C 5.7–6.4%; US-based; owns a smartphone; has a *fresh diagnosis trigger*; is already self-educating — joined r/prediabetes, googled "prediabetes what to eat," and/or bought or is considering an OTC CGM (Stelo/Lingo). Often carries a comorbidity (high BP/cholesterol) or a women's-metabolic signal (PCOS, gestational-diabetes history, perimenopause). Has a parent or grandparent with Type 2 diabetes. Willing to *do the work* — the gap is direction, not motivation.

**To them, Revora is:** the specific, non-judgmental answer to "what do I do at *this* meal" that their doctor didn't give them — without a $89/month sensor or another calorie tracker.

**Why this buyer and not the tempting alternatives.** The urgent version of the pain clusters here and nowhere else:
- **Not the 80% undiagnosed** (the bulk of the 115.2M). No A1C number, no trigger, no search intent — enormous but inert and unreachable. You cannot sell meal clarity to someone who doesn't know they have a glucose problem.
- **Not diagnosed Type 2 diabetics.** Different product, different regulatory frame, and the brand *explicitly* excludes them. They're served by mySugr/Klinio and a care team. Revora's emotional payload ("you can still reverse this") doesn't fit someone past the window.
- **Not general-wellness biohackers / Levels users.** Their driver is optimization, not the fear of a real diagnosis. They already bought the CGM and don't need "permission-first clarity." They'll churn when the novelty fades.
- **Not the already-engaged "optimizer"** (the PRD's "Marcus"). Real, but smaller and lower-urgency — they've already built a system. Secondary, below.

The recently-diagnosed searcher is the only segment where **acute pain + a fresh episodic trigger + active search behavior + a price that fits a self-serve app** all co-occur — and where the differentiator (prediabetes-specific meal clarity) is legible without education, because the doctor already created the problem statement.

**Secondary ICPs (clearly subordinate):**
1. **The OTC-CGM "reveal-moment" early adopter** — just put on a Stelo/Lingo, watched a "healthy" smoothie spike to 160, wants to know what to do about it. *Good for:* highest willingness-to-pay signal (already spent $89), evangelism. *Weak for:* small volume (~5–10% of the segment). [M]
2. **Women 35–55 in the PCOS / gestational-diabetes / perimenopause cluster** — underserved, highly motivated, biologically triggered. *Good for:* targeted acquisition, emotional resonance, content. *Weak for:* needs segment-specific copy to land. [M]
3. **The "I did everything right" thin/active diagnosed** — normal BMI, runs, eats well, blindsided by the diagnosis. *Good for:* viral organic copy (they post about it). *Weak for:* may disengage once reassured it's genetic, not their fault. [M]

**Influencer / referrer roles (not economic buyers):** the primary-care physician (the trigger event, and 88% of older adults would welcome a doctor's app recommendation — [AARP 2024](https://www.aarp.org/pri/topics/health/prevention-wellness/health-app-users/) [H]); the adult child who watched a parent get Type 2 and pushes a parent to act.

**Who this is for:** newly-diagnosed prediabetics, A1C 5.7–6.4%, US, smartphone-comfortable, fear-or-frustration-driven, actively seeking meal-level guidance, willing to act.

**Who this is NOT for:** Type 1 / Type 2 diabetics (A1C ≥6.5%); anyone on insulin; undiagnosed/"just curious"; people whose primary goal is weight loss or calorie counting; non-US; anyone wanting a medical device or clinical treatment. (Hard disqualifiers in §11.)

**Why this ICP matters most:** <1% of prediabetics enroll in the free, proven DPP program and <1% take metformin ([PMC8804550](https://pmc.ncbi.nlm.nih.gov/articles/PMC8804550/) [H]) — meaning ~98% of a 115M-person population gets *zero structured support* after diagnosis. The recently-diagnosed searcher is that gap with a credit card and a Google search already open.

---

## 2. Company profile *(individual-consumer analog — "fit profile" of the person, not a company)*

| Dimension | Strong-fit profile | Why it matters |
|---|---|---|
| Diagnosis status | A1C 5.7–6.4%, diagnosed in last ~6 months | Floor: undiagnosed = no trigger/urgency. Ceiling: ≥6.5% = wrong product (diabetes), brand-excluded. |
| Age | 40–60 sweet spot (viable 30–65) | 45–64 is the largest prevalence slice (37.5M, [NIDDK](https://www.niddk.nih.gov/health-information/health-statistics/diabetes-statistics)); under-40 diagnoses are the most emotionally activated. [H] |
| Tech comfort | Owns smartphone, uses health apps | 71% of 50+ own a smartphone but only 20% use apps for chronic conditions ([AARP 2024](https://www.aarp.org/pri/topics/health/prevention-wellness/health-app-users/)) — adoption is the constraint, not access. [H] |
| Motivation state | "Trying hard, flying blind" | The segment that *acts* — already lost weight, already googling — converts; the resigned "do nothing" majority does not. [H] |
| Comorbidity / biology signal | High BP/cholesterol, OR PCOS/GDM/perimenopause | Stacking conditions escalate fear ("this felt different"); women's-metabolic cluster is underserved. [M] |
| Family history | Parent/grandparent with Type 2 | The #1 stated fear driver in the community; primes urgency. [H] |

**Environmental signals of strong fit (use as targeting filters):**
- Active in **r/prediabetes** (45k+ members), r/diabetes_t2 "just diagnosed" threads, prediabetes Facebook groups.
- Searching **"prediabetes what to eat," "is oatmeal bad for prediabetes," "lower A1C," "glycemic load app."**
- **Recently bought an OTC CGM** (Stelo/Lingo) as a non-diabetic — explicit metabolic-curiosity + spend signal.
- Engaging with **GLP-1 / "metabolic health" content** (1 in 8 US adults have tried a GLP-1 — [GoodRx 2026](https://www.goodrx.com/classes/glp-1-agonists/glp-1-trends) [M]).
- **Q4–Q1 timing:** annual bloodwork season (employer wellness checks, insurance year-end) concentrates new diagnoses Oct–Jan — time acquisition to it.

---

## 3. Buyer and user map

**Defining economic fact:** at $12.99/month the economic buyer, the operational buyer, and the user are **the same person**. That collapse is why a self-serve app motion works and why no committee, procurement, or clinician sign-off stands between trigger and purchase.

| Role | Who | Notes |
|---|---|---|
| Economic buyer = user | The diagnosed individual | Pays with their own card, in the app, on impulse near the trigger. |
| Champion | Same person, OR an adult child / spouse | "I saw what happened to my dad" is a common referral narrative. |
| Influencer | Primary-care physician | Creates the trigger; 88% would welcome a doctor's app rec ([AARP](https://www.aarp.org/pri/topics/health/prevention-wellness/health-app-users/)) — but only ~10% ever get one. Huge untapped channel. |
| Blocker | The doctor's dismissiveness; the free-tier "good enough"; spousal skepticism about "another subscription" | The most common blocker is **inertia + the free version of MyFitnessPal feeling sufficient** (see §9). |

**Internal decision path (click-to-purchase story):** A1C result → fear/confusion → Google or r/prediabetes → discovers Revora (organic post, ad, or store search) → downloads free → scans 1–3 meals → hits the "healthy food betrayal" aha (the oatmeal/banana moment) → hits the 5-scan/day wall during a high-anxiety logging spree → converts.

**Who feels pain vs. who approves spend:** identical. This is the easiest possible buyer structure — and it means the *product's first session* is the entire sales process. There is no human to re-sell later.

---

## 4. Current situation and workflow

**What happens today, and where it breaks:**

1. **The diagnosis (trigger).** A routine blood test returns A1C 5.7–6.4%. The clinical encounter is brief and frequently dismissive: *"It seemed like a vague non-issue, lumped into the rote advice at every physical — more veggies, moderate exercise, healthy weight."* (u/leslsu, [r/prediabetes](https://www.reddit.com/r/prediabetes/comments/1o4409a/what_i_wish_i_knew_4_years_ago/)). Some patients aren't even told their numbers: *"I have no idea what my lab values are… They didn't reveal any numbers or A1C."* ([thread](https://www.reddit.com/r/prediabetes/comments/1jpb5p1/my_doctors_did_not_tell_me_that_i_was_still/)).

2. **The information vacuum → self-education.** Sent home with a pamphlet, they go online. *"We're handed a diagnosis, maybe a pamphlet, and told to 'eat healthy' without anyone explaining that healthy eating for diabetics means something different than typical healthy eating."* (u/BubblyElderberry3984).

3. **The crux gap — "healthy food betrayal."** They try to eat "healthy" and discover conventional-healthy foods spike them. *"I tried a CGM for awhile and am now scared to eat oatmeal… and we are taught that oatmeal is very healthy for us."* (u/tttwee-in00). *"A banana by itself sends me past 180. Same banana with two tablespoons of almond butter and I barely move."* (u/BubblyElderberry3984). **This is the moment Revora is built for** — meal-level, combination-aware clarity that generic advice and calorie apps cannot give.

4. **The manual reality.** They cobble together MyFitnessPal (calorie counting, no glycemic data), Google, finger-pricks, or an OTC CGM — none of which tells them *what to do at the next meal*. *"A meal of chicken with white rice, broccoli, and olive oil has a very different glycemic impact than white rice alone, and only meal-level analysis captures this"* ([GlycemicSnap blog, 2026](https://glycemicsnap.com/blog/best-glycemic-index-app)).

5. **Where hidden burden lives.** The execution gap, not the knowledge gap: *"My problem was never knowing what to do… My problem was that I'd never had anyone in my corner every single day."* (u/One-Expression6854).

---

## 5. Pain points

Layered across six dimensions. Every quote is verbatim and attributed; spot-checked quotes marked ✓.

### 5.1 Functional — the job can't be done well
- **No meal-level glycemic feedback.** *What it is:* they cannot tell what a given plate will do to their blood sugar. *Why it matters:* it's the literal daily decision. *Causes:* paralysis, trial-and-error, fear. *Urgency:* daily, every meal. **[H]** — *"None of us are taught any of this… How would we know we can't have bananas for breakfast, lunch, and dinner without something with them."* (u/tttwee-in00, ✓ thread verified)
- **"Healthy" foods betray them.** Oatmeal, granola, bananas, smoothies, brown rice spike. **[H]** — *"eating 'healthy' is not always healthy for pre-diabetics. Most granola has oats and dried fruit, both can be problematic."* (u/myorangeOlinMarkIV)

### 5.2 Workflow — friction, scatter, scale
- **Manual logging is "another chore."** *Causes:* abandonment. *Urgency:* builds over weeks. **[H]** — MyFitnessPal's own blog: *"it's easy to fall off the food tracking wagon… tracking can feel like another chore."* ([MFP blog](https://blog.myfitnesspal.com/make-food-logging-effortless/))
- **Dining out breaks every system.** **[M]** — a food-sequencing RCT found dining out the hardest context (70% rated it hard/neutral, [PMC10610476](https://pmc.ncbi.nlm.nih.gov/articles/PMC10610476/)).

### 5.3 Emotional — fear, dread, anxiety
- **Fear of progression / genetic fatalism.** **[H]** — *"I feel destined to fail because of my genetics and I'd like to live long enough to see my kids turn 30."* (u/not-a-real-shark, ✓ thread verified). *"It scared the crap out of me… this just felt different."* (u/One-Expression6854, ✓ thread verified).
- **"I was doing everything right" rage/shame.** **[H]** — *"I have lost 35 lbs… strength train 3 times a week… WHAT AM I DOING WRONG?!?!?!"* (u/EntrepreneurGal727). *"I have an underweight BMI and always have. Still prediabetic."* (u/USC2018).
- **Food grief / identity loss.** **[M]** — *"I was so sad at first about how much I had to change my eating."* (u/ColdCauliflower3191); *"only have rice once a day. and I have to stop that now."* (u/Unlucky-Librarian-60, South Indian).

### 5.4 Financial
- **Caught between "free but useless" and "$89/mo CGM."** *What it causes:* either no real tool, or sensor spend that stings. **[M]** — Stelo $89/mo, ~$1,000/yr; the segment tolerates ~$5–15/mo for apps (research inference, see §12). Insurance gap is a live grievance: *"even with a diagnosis of diabetes my insurance won't cover a cgm… So I'm paying out of pocket for a stelo."* (u/leslsu).

### 5.5 Trust / risk
- **Medical-system mistrust after being dismissed.** **[H]** — *"I feel like I'm being heavily mistreated because they're hiding a lot of information from me."* ([thread](https://www.reddit.com/r/prediabetes/comments/1jpb5p1/my_doctors_did_not_tell_me_that_i_was_still/)). *Implication for Revora:* this audience is primed to distrust authority but hungry for a credible, citing, non-judgmental guide — and equally quick to abandon a tool that feels like false precision or a scam (see Klinio billing complaints, §9).

### 5.6 Political / internal *(consumer analog: social/self-image)*
- **Not wanting to look like they "did this to themselves."** **[H]** — the stigma is internalized then violently rejected (quotes in 5.3). Copy that blames or restricts ("avoid," "you shouldn't") will actively repel this audience — which aligns with the brand's existing forbidden-word list.
- **Wanting to feel in control / agentic**, not managed. **[M]** — *"check the arrow first, number second… Now I look at where it's going before I react."* (u/BubblyElderberry3984) — they want mastery, not verdicts.

---

## 6. Hidden desires and emotional drivers

- **Explicit desires (said out loud):** "Just tell me what I can eat." "Is oatmeal okay for me?" "How do I get my A1C back to normal?"
- **Implicit desires (true but unstated):** to be reassured *it's not entirely their fault* (genetics, hormones, meds) without being let off the hook; to feel **someone is in their corner daily** without the cost/shame of a coach; to keep their cultural/comfort foods (rice, pasta) rather than be told to give them up.
- **Emotional jobs:** replace the dread of "am I going to become diabetic" with the calm of a concrete next action; replace meal-time panic with a 5-second answer.
- **Identity/status jobs:** be **the person who caught it early and acted** ("earlier than most — that's the advantage"), not the cautionary tale of the parent who ignored it for nine years ([ADA: Roger Hare](https://diabetes.org/blog/sharing-my-story-roger-hare)).

---

## 7. Buying triggers

| Trigger | Strength | Evidence |
|---|---|---|
| **Just got an A1C result in range** | **Strongest / freshest** | The single most proximate event; <1% get structured support after it ([PMC8804550](https://pmc.ncbi.nlm.nih.gov/articles/PMC8804550/)). [H] |
| **Put on a first OTC CGM, saw a spike** | High (low volume) | Stelo/Lingo went OTC Aug–Sep 2024 ([Dexcom IR](https://investors.dexcom.com/news/news-details/2024/Stelo-by-Dexcom-the-First-Over-the-Counter-Glucose-Biosensor-in-the-U.S.-Is-Now-Available/default.aspx)); the "reveal moment" reframes every meal. [H] |
| **A1C crept higher at the next test** | High | "My doctor said it's getting worse" — the failure-of-status-quo switch. [M] |
| **Doctor offers metformin / GLP-1** | Medium-High | A shock event signaling urgency; drives "let me try lifestyle first" intent. [M] |
| **Family member diagnosed with Type 2** | Medium | Fear-of-heredity; the #1 stated fear in-community. [M] |
| **Women's biological trigger** (PCOS dx, postpartum after GDM, perimenopause) | Medium-High (sub-segment) | >50% of PCOS patients develop T2D before 40 ([UCLA Health](https://www.uclahealth.org/news/article/prediabetes-women-why-warning-signs-can-get-missed)). [M] |
| **Annual bloodwork season (Q4–Q1)** | Medium (timing lever) | Concentrated diagnosis wave; a CAC-reduction window. [M] |

*GTM implication:* triggers are episodic and individual — there is no "buying season" for a given person beyond their lab date. Win by being **present at the moment of search** (organic r/prediabetes presence, SEO on "prediabetes what to eat," store ASO) so you're there when *their* trigger fires.

---

## 8. Trust barriers and objections

| Objection | Why it arises | How to neutralize |
|---|---|---|
| **"Why pay when MyFitnessPal is free?"** (#1 deal-killer) | MFP is the default; free tier feels sufficient | Lead with what MFP *structurally can't* do: meal-level glycemic load + sequencing, not calories. *"Calories don't predict your blood sugar. Glycemic load does."* |
| **"Is this just guessing from a photo?"** | Every photo→GL competitor has documented accuracy complaints (§9) | Show the conservative/uncertainty badge; cite the science; never over-claim precision. Honesty *is* the wedge here. |
| **"$12.99 is more than the other GL apps"** | True — LOGI $6.99, SNAQ $3.75/mo, January AI $4.99–9.99 | Justify with prediabetes-exclusive design + sequencing-as-hero + "in your corner daily." If unprovable, this is a real pricing risk (§12). |
| **"Another subscription that'll scam me on cancellation"** | Category is poisoned by billing complaints (Klinio 1.2/5, mass unauthorized-charge reviews) | Frictionless visible cancellation; transparent billing; no dark patterns. Make it a selling point. |
| **"I'll just buy a CGM and see for real"** | OTC CGMs now available | Position as complement: *"A CGM shows you the spike after. Revora shows you how to eat so it doesn't spike — for a fraction of the cost."* |

**Claims that may backfire (avoid):** "reverses prediabetes" (app as agent — FTC risk + brand violation); "AI-powered" as the lead (the audience is burned by inaccurate AI calorie apps — a candy bar logged at *"27 million calories"*, Cal AI review); "guaranteed"; anything restrictive ("avoid," "you shouldn't").

**What lowers perceived risk (lean on these):** cited science (CDC DPP, Shukla, Imai); visible uncertainty/conservative estimates; permission framing ("here's what to do instead"); transparent, easy cancellation; "built only for prediabetes, A1C 5.7–6.4%."

---

## 9. Alternatives and current workarounds

| What they use now | Why it's insufficient for *this* job |
|---|---|
| **Do nothing / Google low-carb** *(the real #1)* | No meal-level feedback; 17–59% natural reversion ([PMC11237237](https://pmc.ncbi.nlm.nih.gov/articles/PMC11237237/)) gives rational cover for inaction. [H] |
| **MyFitnessPal** (free/$19.99 Premium) *(the #1 active alt)* | Calorie/macro, **no glycemic load, no sequencing**; "retrofitting GI data is not their strength" ([source](https://glycemicsnap.com/blog/best-glycemic-index-app)); high abandonment. [H] |
| **Glycemic Snap** (~$9.99/mo) | **Already does photo→GL for prediabetes.** Complaint: ignores portion size; missing GL values (verbatim App Store reviews). Revora's opening = accuracy + focus. [H] |
| **LOGI** ($6.99/mo ✓ price re-verified) | Photo→GI/GL; lists food sequencing among its features (per App Store listing) — closest competitor. Complaint: same meal → different GL on different days [M]. Markets on "insulin resistance," not prediabetes-exclusive. |
| **SNAQ** ($45/yr) & **January AI** ($4.99–9.99/mo) | SNAQ: "prediabetic window" copy but CGM-diabetic core; independently panned on carb accuracy. January AI: photo→glucose-prediction, but population-average ≠ individual ("actual readings differed significantly"). [H] |
| **OTC CGM** (Stelo/Lingo, ~$89/mo) | Shows glucose *after*, no food-context intelligence; accuracy gripes (±46 mg/dL); ~$1,000/yr. Complement, not competitor. [M] |
| **Finger-prick glucometer** | A number with no cause, no next action; painful; spot data not patterns. [M] |
| **Dietitian (1–2 visits, $100–250)** | Generic advice common; most don't return after 1–2 visits. [M] |
| **DPP** (free if covered) | Proven (58% risk reduction, [Knowler NEJM 2002](https://www.nejm.org/doi/full/10.1056/NEJM200105033441801)) but <1% enroll; only 36% of enrollees hit weight goal; rarely referred. [H] |

**The white space (where to plant the flag):** not "first to photo→GL" (refuted), but **(1) demonstrably more accurate GL scoring**, **(2) prediabetes-*exclusive* identity** (no one owns the A1C 5.7–6.4% window cleanly), and **(3) food-sequencing as the hero UX** (LOGI buries it; no one leads with "eat this first"). All three are defensible only if the product delivers — they are positioning bets, not moats.

---

## 10. Messaging implications

**Strongest pain-led angles:**
- Lead/mirror line: **"Your doctor said 'eat better' and sent you home. Here's what that actually means — one meal at a time."**
- The betrayal hook: **"Oatmeal spikes you. A banana alone spikes you. With almond butter, it doesn't. Revora tells you which is which — before you eat."**
- The execution-gap hook: **"You already know what to do. You've just never had anyone in your corner at every meal."**

**Strongest trust-led angles:** "Built only for prediabetes — A1C 5.7 to 6.4%. Not a calorie counter. Not a diabetes app." · "We show you the safer estimate, and tell you when we're unsure."

**Urgency framing (tied to triggers):** "You caught it early. That's the advantage most people never get." · For CGM owners: "Your Stelo shows the spike. Revora shows you how to avoid it."

**The single sharpest angle:** the **"healthy food betrayal"** — it's the most-repeated, most concrete, most emotionally charged, and most uniquely solvable pain in the research. Make the oatmeal/banana revelation the first-session aha.

**Language to mirror (verbatim from real prediabetics):**
- "scared to eat oatmeal" · "blood sugar naps" · "what am I doing wrong" · "destined to fail because of my genetics" · "nobody in my corner" · "eating healthy isn't healthy for us" · "check the arrow, then the number" · "it felt different this time" · "vague non-issue"

**Phrases to avoid:** "avoid / forbidden / you shouldn't" (restriction — repels) · "AI-powered" as lead (burned by inaccurate apps) · "manage your condition" (implies permanence) · "reverses prediabetes" with the app as subject (FTC + brand) · "guaranteed / results."

**Objection one-liners (keep-ready):**
- *MFP is free* → "MyFitnessPal counts calories. Calories don't predict your blood sugar — glycemic load does."
- *Just guessing from a photo?* → "We give you the safer estimate and flag when we're unsure. No false precision."
- *Why not a CGM?* → "A CGM shows the spike after. We show you how to eat so it doesn't spike — for a fraction of the cost."
- *More expensive than other GL apps* → "Because it's built only for prediabetes, and it tells you what to do next — not just a number."

**Positioning implications:** lead with **clarity at the meal**, not reversal (earn that after 14 days, per brand doc). Position as **complement to a CGM**, replacement for **the calorie tracker**. One-sentence competitive wedge: *"The only meal-photo app built exclusively for the prediabetes window — that tells you what to eat next, not just what you ate."*

---

## 11. Strong-fit vs weak-fit criteria

**Strong fit (pursue) — the more true, the better:**
- A1C 5.7–6.4%, diagnosed within ~6 months · actively searching/posting about prediabetes · owns smartphone, US · has a fresh trigger (lab result, new CGM, doctor mentioned metformin) · family history of T2D · women's-metabolic signal (PCOS/GDM/perimenopause) · already tried-and-abandoned MFP or low-carb.

**Weak fit (deprioritize):**
- Diagnosed years ago, stable, disengaged · general-wellness/biohacker with no diagnosis · primarily wants weight loss · resigned "do nothing" with no trigger · prefers human coaching over an app.

**Hard disqualifiers (do not pursue):**
- Type 1 or Type 2 diabetes (A1C ≥6.5%) · on insulin · no A1C number / undiagnosed · non-US (DPP, OTC-CGM, pricing context all US) · wants a medical device / clinical diagnosis / treatment · minors without context.

---

## 12. Open assumptions and unknowns + validation plan

**Meta-assumption:** the *pain and segment* in this doc are backed by real cited sources and spot-checked. The *business model* (WTP, conversion, which hook wins) is **inferred and untested** — Revora has zero real users. Treat everything in this section as bets to test, not facts.

**Untested assumptions (ranked by how much they'd hurt if wrong):**
1. **Willingness to pay $12.99/mo. [L — biggest risk].** Research shows the segment tolerates ~$5–15/mo for apps, but *every* photo→GL competitor is cheaper (LOGI $6.99 ✓ re-verified, SNAQ ~$3.75/mo-equiv, January AI $4.99–9.99). Revora would be the **most expensive photo→GL app while no longer being first.** Unvalidated.
2. **Free-to-paid conversion ≥5%. [L].** PRD targets 5–7.5%. No basis in Revora data; Cal AI's 20–25% is a *trial* rate for a broader market. The 5-scan/day wall as the conversion lever is untested.
3. **The "healthy food betrayal" is the sharpest hook. [M].** Strongest in research, but not A/B-tested against the "in your corner" or "doctor sent you home" angles.
4. **Recently-diagnosed (not CGM-owner) is the right *primary*. [M].** CGM owners show stronger spend signal but smaller volume — the primary/secondary split is a bet.
5. **Accuracy can actually beat incumbents. [L].** The core differentiator assumes Revora's GL estimate is demonstrably better. Unproven; requires clinical/reference validation.
6. **Organic r/prediabetes + SEO can acquire at viable CAC. [L].** Channel assumption from the PRD, untested.

**Validation plan:**

*A. 5–10 discovery calls* (recruit from r/prediabetes, prediabetes FB groups, or a screener ad targeting "diagnosed prediabetic, last 6 months"). Actual questions:
1. "Walk me through the day you found out your A1C was in the prediabetes range. What did the doctor actually say?"
2. "What did you do in the first week after? What did you search for?"
3. "What are you using right now to figure out what to eat? Walk me through your last confusing meal."
4. "Have you ever been surprised that a food you thought was healthy spiked your blood sugar? Tell me about it."
5. "Have you paid for anything to help — an app, a CGM, a dietitian? What made you pay, or not?"
6. "If something told you the glycemic load of any meal from a photo in 5 seconds, plus one thing to do — what would that be worth to you per month?" *(Then stay silent. Note the first number.)*
7. "What would make you NOT trust an app like that?"
8. "Show me the last health app you stopped using. Why did you stop?"

*B. Smoke test (before/alongside build):* one landing page, three hero variants A/B/C — "healthy food betrayal" vs "doctor sent you home" vs "in your corner daily" — driving to a $12.99/mo waitlist/pre-order. Measure click→email→pre-pay. The variant that wins email *and* pre-pay is the hook; pre-pay rate is the first real WTP signal. Run a **price-ladder test** alongside: show $6.99 / $9.99 / $12.99 to matched cohorts on the pre-order page. If $12.99 craters vs $9.99, revisit before launch.

*C. First-paid-pilot capture:* instrument the free→paywall funnel from day one (scans-to-paywall, paywall-shown→convert, which scan triggered the upgrade). 

*D. Maintenance:* replace `[L]`/`[M]` inferences in §1, §5.4, §10 with primary VOC and funnel data as it arrives. **Re-pull market/competitor facts quarterly** — this category is moving fast (OTC CGM launched <2 years ago; Cal AI was acquired by MyFitnessPal in Dec 2025).

---

*Sources: raw research with full URL+quote tuples in `scratchpad/{voc,competitor,triggers,alternatives}-findings.md`. Primary external sources include CDC Diabetes Statistics (2026), NIDDK, NEJM (Knowler 2002), AARP Public Policy Institute (2024), Dexcom/Abbott investor releases (2024), App Store / PissedConsumer reviews, and 10 r/prediabetes threads (VOC, crawl4ai-retrieved, 4 spot-checked verbatim 2026-06-28). Product context: `Revora_Brand_Positioning_v2.md`, `PRD/Glucosnap_prd_v2.md`. Evidence basis: pain/segment/competitor/market = real cited data; WTP/conversion = hypothesis-grade, pre-launch.*
