# Master Prompt — Revora Product Value, Paid Retention, Virality, and First-5,000-User Forensic Audit

> **Created:** 2026-07-18  
> **Repository:** `/home/tefera/Desktop/Revora`  
> **Mode:** deep, source-first product diagnosis; read-only unless the owner later authorizes implementation  
> **Primary deliverable:** `docs/handoff/2026-07-18-revora-product-value-retention-virality-distribution-forensic-report.md`

---

## Your role

Act as a combined:

- skeptical prediabetes consumer advocate;
- senior consumer-health product strategist;
- retention and subscription-economics analyst;
- behavioral-product researcher;
- growth-loop and distribution strategist;
- direct-response and short-form video analyst;
- health-claims and evidence-boundary reviewer; and
- forensic software/product auditor who verifies what is actually implemented.

You are not here to defend the product, reward the amount of code written, or produce a founder-friendly pitch. You are here to determine what is true.

Treat every prior product claim, strategy, ICP, handoff, feature list, market estimate, and recommendation as a hypothesis until current evidence supports it. AI, meal scanning, a polished interface, passing tests, and a large feature count do **not** prove user value, retention, differentiation, willingness to pay, or distribution potential.

Be candid enough to conclude any of the following if the evidence warrants it:

- Revora does not yet deliver its promise.
- Revora is useful but not subscription-worthy.
- Revora may retain only a narrow customer segment or only for a short diagnosis window.
- The product needs a different value loop, offer, or category.
- No missing feature is likely to create durable retention.
- No current product surface has strong organic virality.
- The fastest credible path to 5,000 users is not product-led virality.
- The 5,000-user target is not achievable on the proposed time or resource assumptions.

Do not manufacture a positive answer because the owner asked for “the one feature” or “the one thing.” If none clears the evidence bar, say **none**, explain why, and name the experiment that would change the conclusion.

---

## Mission

Conduct a deep and forensic analysis of the current Revora product and answer five questions decisively:

1. **Promise and real-life value:** Does the app actually deliver its stated promise, and does it add meaningful value to the day-to-day life of an adult with a prediabetes-range A1C?
2. **Durable paid retention:** Does the app currently have enough recurring value to keep paying customers for a long time? For whom, for how long, and why would they continue paying after the anxiety and novelty of diagnosis decline?
3. **Pain-point and feature completeness:** Which important user pains remain unresolved? Which features, if any, are missing or incomplete? What **single feature** would most improve user value, product superiority, and consistent use? If no feature can do that, say so.
4. **Viral product moments:** What are the five most viral or video-marketable parts of the product today, including small or secondary moments? Score and rank them for short-form video marketing and distribution without pretending that “demoable” means inherently viral.
5. **Fastest path to the first 5,000 users:** What is the **one primary distribution mechanism, loop, or wedge** Revora should focus on to acquire its first 5,000 users as quickly as credibly possible? Show the funnel math, resource requirements, constraints, risks, and kill criteria.

The final report must answer each question directly before expanding into supporting detail.

---

## Non-negotiable truth rules

### 1. Preserve the repository and the owner’s work

This is an analysis task, not an implementation task.

- Begin with `git status --short`, `git branch --show-current`, `git log -15 --oneline --decorate`, `git worktree list --porcelain`, and `git diff --stat`.
- Do not clean, reset, discard, stash, merge, commit, push, deploy, change feature flags, spend money, contact users, post publicly, or edit product code.
- Do not expose secrets or print environment-variable values.
- The only expected write is the audit report and any clearly named supporting research artifact under `docs/handoff/` or `artifacts/research/`.
- Preserve unrelated dirty work exactly as found.

### 2. Current product truth outranks stale documents

The repository contains dated and potentially contradictory plans. Resolve current truth using this priority order:

1. current source and configuration;
2. current deployed behavior, when safely accessible;
3. current tests and generated proof artifacts;
4. the newest dated handoff or decision record;
5. active product, safety, and marketing sources of truth;
6. older PRDs, strategies, archived docs, and prior audit conclusions.

In particular:

- `docs/Revora_90-Day_Distribution_Strategy.md` is useful but dated and may describe a product or live configuration that no longer exists.
- `docs/ICP.md` contains hypotheses, research, and older positioning that must be independently checked.
- `docs/handoff/2026-07-17-wtp-first-reprioritization-handoff.md` contains an explicit dated correction; never quote an earlier section without reading its correction.
- Old claims about photo-assist, longitudinal insights, pricing mode, checkout gates, custom domains, deployment state, or launch readiness may be stale.
- A passing local test does not prove a feature is enabled, usable, valuable, safe, live, or paid for in production.

Create a contradiction ledger rather than silently choosing the source you prefer.

### 3. Keep evidence classes separate

Every material claim in the report must be tagged or clearly attributable to one of these evidence classes:

| Class | Meaning |
|---|---|
| `IMPLEMENTED` | Proven in current source with file/line evidence. |
| `TESTED` | Proven by a current test or artifact, with scope and limitations stated. |
| `OBSERVED-LIVE` | Personally observed in the current deployed product during this audit. |
| `MEASURED-USERS` | Supported by real Revora analytics, payments, cohorts, interviews, or behavior. |
| `EXTERNAL-EVIDENCE` | Supported by current external research or user evidence with a direct citation. |
| `DOCUMENTED-CLAIM` | Stated in a Revora document but not independently proven. |
| `INFERENCE` | Reasoned conclusion from evidence; explain the reasoning. |
| `HYPOTHESIS` | Plausible but unvalidated; specify how to test it. |
| `UNKNOWN` | Evidence is absent, inaccessible, contradictory, or too weak. |

Never turn `IMPLEMENTED` into `MEASURED-USERS`. Never turn competitor marketing copy into product proof. Never turn simulated panels, synthetic personas, or unit tests into real willingness-to-pay or retention evidence.

### 4. Separate the six truth buckets

Maintain distinct conclusions for:

1. software correctness;
2. meal-guidance usefulness and comprehensibility;
3. health and clinical appropriateness;
4. legal and claims defensibility;
5. commercial value and willingness to pay; and
6. retention and distribution performance.

Engineering proof is not clinical sign-off. Simulated clinical review is not external reviewer approval. A counsel packet is not counsel clearance. Demand for “prediabetes help” is not demand for Revora. Acquisition is not activation. Activation is not retention. Retention is not health outcome proof.

### 5. Health-adjacent claims stay inside the evidence boundary

Read and obey the active claim boundary before proposing copy, viral videos, distribution tactics, social proof, progress features, or new product functionality:

- `docs/safety/claims-boundary.md`
- `docs/safety/copy-ledger.md`
- `docs/safety/evidence-pack.md`
- `docs/product-marketing.md`
- current legal/counsel gate documents

Do not recommend disease reversal, prevention, personal glucose prediction, guaranteed outcomes, “safe for your blood sugar,” fabricated clinical precision, clinician endorsement, or any result Revora has not measured and is not permitted to claim.

A disclaimer does not rescue an otherwise prohibited claim. User-generated testimonials and creator scripts require the same scrutiny as landing-page copy. Do not optimize distribution by making the product sound more certain or more personalized than it is.

### 6. Engagement is not automatically value

Do not reward streak pressure, fear, guilt, restriction, compulsive checking, false personalization, or anxiety loops merely because they might increase daily active use. For this audience, calm permission, reduced uncertainty, and durable self-efficacy may be more valuable than maximum session frequency.

Any retention recommendation must answer:

- Does it improve a real user outcome or decision?
- Does it create honest new value as the user learns?
- Does it respect blank days and declining need?
- Could it worsen food anxiety or disordered behavior?
- Is continued subscription genuinely better for the user than graduating from the app?

The possibility that a good product should intentionally help some users need it less over time must be analyzed, not treated as failure.

### 7. Define “user,” “long time,” and “viral” before scoring

Do not hide ambiguity behind attractive numbers.

- Define whether “5,000 users” means visitors, email leads, installs, accounts, completed first checks, 7-day retained users, or paying customers.
- Use **5,000 activated users who complete a real first check** as the default acquisition target unless strong reasoning supports a different definition. Also translate the plan into registered and paid-user implications.
- Define “long-term paid retention” across at least 30, 90, 180, and 365 days.
- Separate a **viral marketing asset** from an **organic product growth loop**. A satisfying result-card reveal may make a strong video without causing users to invite anyone.
- Separate reach, click-through, activation, sharing, referral, and paid conversion.

### 8. Absence of data is a finding

If Revora lacks production users, events, cohort data, payment data, cancellation reasons, interview evidence, referral telemetry, or content-performance data, state that plainly. Do not estimate existing retention or virality from UI design. In that case, produce a falsifiable forecast and an instrumentation/experiment plan, clearly marked as such.




## 9. The residual list — These are known issues - completely ingnore these for now

  1. DNS (biggest lever): revora.bio has no nameservers at all right now. At your registrar, point them to ns1.vercel-dns.com / ns2.vercel-dns.com — that single change
  lights up the domain, the Resend records I pre-staged, OG link previews, and Stripe return URLs (all URLs already point at https://revora.bio; link cards and post-checkout  redirects are broken until this is done).
  2. Resend: after DNS, press Verify on revora.bio in Resend and set AUTH_EMAIL_FROM to a @revora.bio address. Resend currently has zero verified domains — customer  magic-link email cannot deliver until this.
  3. Stripe dashboard (~15 min, live key is sealed in Vercel so I couldn't): add the live webhook endpoint /api/billing/stripe/webhook with the six handled events, pin API  version 2025-03-31.basil+, put the signing secret into STRIPE_WEBHOOK_SECRET, and save a default live-mode portal config. Without the webhook, a live payment succeeds but  entitlement never flips — do this before announcing.
  4. Umami: no instance exists anywhere; deploy the Umami template from the Railway dashboard (CLI needs a TTY), then set the two NEXT_PUBLIC_UMAMI_* vars. Funnel is blind  until then.
  5. Hygiene: rotate the exposed keys (openr.md OpenRouter key — now also the prod model key — plus the ones in history 213ab8a), and consider deleting the stray duplicate  Vercel project revora-irj3 (it rebuilds every push with no prod env; I don't delete infrastructure unasked).



---

## Required working method

Work in the following order. Do not jump to feature brainstorming or growth advice before establishing current product truth.

## Phase 0 — Rehydrate current truth

### 0.1 Establish the repository snapshot

Record:

- date, branch, HEAD SHA, worktrees, and dirty state;
- recent merges and product-changing commits;
- which deploy, domain, and revision are current, if safely discoverable;
- current feature flags and their defaults without revealing secret values;
- current pricing/paywall mode as implemented and as observed live;
- accessible analytics, payment, support, feedback, and research artifacts;
- external gates that limit what can be tested with real users.

Recommended initial commands:

```bash
cd /home/tefera/Desktop/Revora
git status --short
git branch --show-current
git rev-parse HEAD
git log -15 --oneline --decorate
git worktree list --porcelain
git diff --stat
rg --files docs/handoff | sort | tail -40
```

Do not assume the newest filename is the newest truth; inspect timestamps, corrections, source changes, and merge state.

### 0.2 Build a current feature inventory

Map every user-visible capability to current source, availability, user, price, and evidence:

| Feature or surface | Current implementation | Guest/free/paid/one-time | Enabled live? | User problem addressed | Evidence | Important limitation |
|---|---|---|---|---|---|---|

At minimum inspect:

- landing and acquisition flow;
- welcome and onboarding;
- text meal entry;
- voice-to-reviewed-text entry;
- photo-to-editable-draft flow and all gates;
- A1C range handling and clinical-risk routing;
- result card, verdict, reasoning, adjustment, alternatives, general tips, feedback, and next action;
- guest use, account creation, history migration, history, and today/week views;
- daily loop, reminders, progress, plan box, behavioral scoring, and insights;
- subscription, trial/legacy wall, entitlement, pricing variants, cancellation, refund, and account deletion;
- Pantry Review and report flow;
- share, referral, invite, export, print, or public-report surfaces, including their absence;
- attribution and funnel telemetry;
- PWA/install and store/waitlist surfaces;
- trust, evidence, privacy, terms, limitations, and support surfaces.

Useful code areas include, but are not limited to:

```text
app/page.tsx
app/(app)/**
app/check/**
app/welcome/**
app/pantry/**
app/report/**
app/api/**
components/food-check-form.tsx
components/result-card.tsx
components/dashboard-view.tsx
components/daily-loop.tsx
components/dashboard-insight.tsx
components/insight-card.tsx
components/paywall-card.tsx
components/trial-wall.tsx
components/result-feedback.tsx
lib/revora/**
lib/coach/**
lib/client/**
lib/server/pricing.ts
lib/server/entitlement.ts
lib/server/pantry/**
lib/longitudinal-insights-flag.ts
```

Use `rg` and current imports/routes to discover renamed or additional files. The list above is a map, not a substitute for repository inspection.

### 0.3 Read the most relevant product records

Read these as inputs, not verdicts:

1. `docs/product-marketing.md`
2. `PRODUCT.md`
3. `docs/safety/claims-boundary.md`
4. `docs/safety/copy-ledger.md`
5. `docs/safety/evidence-pack.md`
6. `docs/ICP.md`
7. `docs/Revora_90-Day_Distribution_Strategy.md`
8. `docs/handoff/2026-07-17-wtp-first-reprioritization-handoff.md`
9. `docs/handoff/2026-07-17-revora-true-done-audit-remediation-report.md`
10. `docs/handoff/2026-07-17-owner-risk-full-launch-session-handoff.md`
11. the latest product/readiness/launch handoffs and current ops/legal gate records
12. analytics, feedback, WTP, price-test, live-eval, and QA artifacts actually present in the current checkout

Create a short contradiction table for product promise, enabled features, pricing, launch mode, user evidence, and distribution assumptions.

---

## Phase 1 — Experience the product like a real user

Perform a safe, read-only end-to-end walkthrough against the current local app and, when authorized and accessible, the current production app. Prefer existing Playwright/browser tooling and real rendered behavior over reading components alone.

Do not use a model-backed live path if doing so violates a current gate, sends sensitive data, or incurs unapproved spend. If a path cannot be exercised, label it `UNVERIFIED-LIVE` and use the strongest safe evidence available.

### 1.1 Required user journeys

Test or rigorously trace at least these journeys:

1. newly diagnosed, anxious, A1C 5.7, simple familiar meal;
2. high end of product range, A1C 6.4, restaurant or takeout meal;
3. culturally specific mixed meal with uncertain portion;
4. apparently “healthy” meal that may create a surprising result;
5. incomplete or ambiguous meal that should trigger clarification;
6. low digital-confidence user, age roughly 55–65, using a phone and voice entry;
7. user outside the supported A1C range;
8. user entering an urgent, medication, allergy, pregnancy, eating-disorder, or diagnosed-diabetes concern;
9. guest who checks several meals, returns later, and considers creating an account;
10. paid user returning on Day 2, Day 7, Day 30, and after the initial diagnosis anxiety has faded;
11. user who has learned the basic patterns and asks, “Why do I still need this?”;
12. user who wants to share a useful or surprising result with a spouse, friend, clinician, or social audience.

For each journey record:

- trigger and job-to-be-done;
- steps, friction, dead ends, and time-to-value;
- what the result teaches that the user did not already know;
- whether the action is concrete and feasible;
- whether the experience reduces or increases uncertainty and anxiety;
- whether the output is meal-specific or generic;
- what would make the user return;
- what would make the user pay;
- what would make the user churn;
- what, if anything, the user would naturally share;
- evidence and confidence.

### 1.2 First-session “aha” test

Identify the exact activation moment. Do not assume it is merely “a completed check.” Test whether the moment produces one of these:

- a genuinely surprising but credible insight;
- calm permission to eat something the user feared;
- one specific adjustment that preserves the meal;
- a useful clarification that prevents overconfidence;
- visible proof that the app remembers and becomes more useful;
- or no meaningful new knowledge at all.

Measure or estimate time-to-first-value and list everything that occurs before it. Distinguish a polished reveal from actual learning.

---

## Phase 2 — External evidence and market reality

Browse the current web. The report must use current direct links and dates for claims that can change, including competitor features/pricing, platform policies, market/channel sizes, and distribution mechanics.

### 2.1 User pain and behavior research

Collect fresh evidence from adults dealing with prediabetes meal decisions. Cover, at minimum:

- the first weeks after an A1C result;
- “my doctor only said eat better” confusion;
- meal-specific uncertainty;
- fear and food anxiety;
- cultural foods and dining out;
- logging fatigue and tracker abandonment;
- what people repeatedly ask after the first month;
- what paid help they currently use;
- why they cancel nutrition or health apps;
- what they naturally send to family or post publicly;
- privacy and trust barriers;
- whether the need persists, changes, or disappears over 6–12 months.

Use a mix of:

- current public community discussions;
- current App Store/Google Play reviews of direct and adjacent competitors;
- credible user research and peer-reviewed adherence/retention studies;
- real Revora feedback, interviews, analytics, and payment data, if they exist.

Do not overgeneralize from a few dramatic posts. Preserve source dates, context, contradictory evidence, and selection bias. Keep quotations short and compliant; paraphrase when possible.

### 2.2 Competitor and substitute audit

Audit at least 8 serious alternatives across these categories:

- direct AI meal or glycemic apps;
- calorie/macro trackers;
- diabetes or prediabetes coaching apps;
- CGMs and their companion experiences;
- human dietitians/DPPs;
- free search, communities, and general AI assistants;
- spreadsheets, notes, or doing nothing.

For each, verify current pricing and capabilities from primary product/store sources where possible and examine critical reviews. Build this table:

| Alternative | Core job | Current price | First-session value | Recurring value | Personalization/memory | Trust/evidence | Retention mechanism | Shareable moment | Why a user chooses it over Revora | Why Revora might win |
|---|---|---:|---|---|---|---|---|---|---|---|

Do not claim a moat because competitors use different words. Identify what can be copied quickly, what depends on proprietary data or distribution, and what is only positioning.

### 2.3 Distribution-environment audit

Verify current official rules and real channel conditions for Reddit, TikTok, Instagram, YouTube Shorts, Facebook Groups, search, email, referrals, creators, and relevant health-content advertising restrictions.

Do not reuse old follower counts, subreddit sizes, algorithm advice, platform policy, or benchmark rates without a current check. Separate official policy from third-party tactical opinion.

Audit the existing 90-day strategy against current evidence. Keep, modify, or reject each major assumption rather than accepting the plan wholesale.

---

## Phase 3 — Question 1: Does Revora deliver its promise and add real value?

### 3.1 Build a promise-to-proof matrix

Extract every major active promise from the landing page, onboarding, checkout, product-marketing source, app UI, and store/waitlist copy. Then test it:

| Promise | User expectation created | What the product actually does | Source/live proof | Gap | Harm if unmet | Verdict |
|---|---|---|---|---|---|---|

Use verdicts:

- `DELIVERED`
- `PARTIALLY DELIVERED`
- `NOT DELIVERED`
- `MISLEADING OR OVERSTATED`
- `UNVERIFIED`

### 3.2 Score real user value

Score the current product out of 100 using this fixed rubric:

| Dimension | Weight | Required question |
|---|---:|---|
| Pain severity and frequency | 12 | Is the problem painful and recurrent enough to matter? |
| Time to first meaningful value | 12 | Does value arrive quickly and with low friction? |
| Incremental insight | 15 | Does Revora add knowledge beyond common sense, Google, or general AI? |
| Actionability and meal specificity | 15 | Can the user act on the output immediately without abandoning the meal? |
| Trust, honesty, and comprehensibility | 15 | Is the answer credible, appropriately uncertain, calm, and clear? |
| Coverage of real contexts | 10 | Does it help with mixed meals, portions, restaurants, cultural foods, and ambiguity? |
| Emotional value | 8 | Does it reduce confusion or shame without creating dependence or fear? |
| Repeat value and learning | 8 | Does the app become more useful after repeated use? |
| Friction, reliability, and accessibility | 5 | Is it dependable and easy enough in the meal moment? |
| **Total** | **100** | |

For every score, provide evidence, counterevidence, confidence, and the single biggest reason it is not higher.

### 3.3 Required direct verdict

Conclude with exactly one:

- `YES — delivers meaningful value now`
- `PARTIAL — useful but the promise/value gap is material`
- `NO — does not yet deliver meaningful differentiated value`

State:

- who receives the value;
- the concrete moment in which value occurs;
- what changes in that person’s life or decision;
- what Revora does not solve;
- confidence from 0–100%; and
- what evidence would most likely falsify the verdict.

---

## Phase 4 — Question 2: Can Revora retain paying customers for a long time?

### 4.1 Map the natural need curve

Analyze the user’s need and willingness to pay at:

- diagnosis day;
- week 1;
- day 30;
- day 90;
- day 180;
- one year;
- after the user learns common meal patterns;
- after the next A1C test;
- after starting a CGM, medication, DPP, or dietitian relationship.

For each stage, identify the new question Revora answers. If the same static verdict is the only reason to return, say so.

### 4.2 Identify current retention loops

Map each existing loop:

```text
Trigger → action → immediate value → stored/compounding value → reason to return → paid value
```

Evaluate meal checks, history, weekly view, progress, reminders, insights, action completion, Pantry Review, feedback, and any other current loop. For each, determine whether it is:

- a genuine compounding-value loop;
- a temporary diagnosis-support loop;
- a utility used only when uncertain;
- an engagement decoration;
- a paywall mechanism; or
- non-functional/disabled in current production.

### 4.3 Run the counterfactual subscription test

Ask:

- If meal checks were free forever, which paid features would still justify a subscription?
- If a user learns the ten most common patterns in 30 days, what value remains?
- If general AI can give a similar answer, why use Revora?
- If a user only checks two unfamiliar meals per week, does the subscription still feel fair?
- Would the product be stronger as a short paid program, annual seasonal tool, one-time report, bundle, or membership rather than an indefinite subscription?
- Does the product help the user graduate, and if so, what is the honest business model around that?

### 4.4 Paid-retention score

Score out of 100:

| Dimension | Weight |
|---|---:|
| Frequency of recurring need | 15 |
| New value after the first month | 20 |
| Compounding personalization or memory | 15 |
| Demonstrable progress without false clinical claims | 15 |
| Differentiation and switching resistance | 10 |
| Price-to-frequency fit | 10 |
| Trust and reliability over time | 10 |
| Ethical, non-anxiety-based habit strength | 5 |
| **Total** | **100** |

Give separate scores for the strongest plausible segment and the median target user.

### 4.5 Required direct verdict

Choose one:

- `YES — durable paid retention is plausible with the current product`
- `CONDITIONAL — useful subscription, but only for a narrow segment or limited duration`
- `NO — current value is episodic and unlikely to support long-term payment`
- `UNKNOWN — no honest conclusion without real cohort data`

Forecast expected retention qualitatively at 30/90/180/365 days, label all forecasts as hypotheses, and specify the minimum cohort experiment needed to validate them.

---

## Phase 5 — Question 3: Missing pains, missing features, and the single highest-leverage feature

### 5.1 Build a pain-point coverage matrix

Include functional, emotional, social, workflow, trust, access, and post-diagnosis pains:

| User pain/job | Severity | Frequency | Current workaround | Revora coverage | Evidence | Gap | Consequence | Feature needed, behavior change needed, or no product solution? |
|---|---:|---:|---|---|---|---|---|---|

Do not force every pain into a software feature. Some gaps may require clearer positioning, more reliable output, a different offer, human service, distribution, clinical evidence, or no action.

### 5.2 Generate serious candidates

Consider, but do not assume, candidates such as:

- stronger longitudinal learning or pattern recognition;
- a personalized “what consistently works for me” memory layer;
- meal planning, grocery, restaurant, or cultural-food workflows;
- portion clarification and iterative follow-up;
- behavior experiments and outcome feedback;
- clinician/dietitian collaboration;
- CGM or lab integration;
- family/caregiver sharing;
- progress or learning summaries;
- community or accountability;
- an improved one-time Pantry Review;
- a time-bounded program instead of another feature;
- removing or simplifying features that dilute the core value.

These are candidate categories only. Verify need, safety, feasibility, differentiation, and demand before recommending any of them.

### 5.3 Score every top candidate

Score the leading 5–10 candidates with this fixed rubric:

| Dimension | Weight |
|---|---:|
| Depth of unresolved pain addressed | 20 |
| Expected increase in recurring user value | 20 |
| Expected paid-retention impact | 15 |
| Evidence that users want it | 15 |
| Differentiation and defensibility | 10 |
| Fit with Revora’s core meal-moment job | 5 |
| Safety, privacy, and claims feasibility | 5 |
| Speed/cost/risk to validate before building | 5 |
| Simplicity and usability for the ICP | 5 |
| **Total** | **100** |

Apply vetoes for:

- requiring a prohibited or clinically unsupported claim;
- high likelihood of increasing food anxiety or disordered behavior;
- needing data Revora cannot lawfully or reliably obtain;
- being a generic parity feature with weak evidence of retention lift;
- depending on a feature gate that cannot currently be opened;
- requiring a major build before a cheaper demand test.

### 5.4 Select exactly one — or none

Recommend a single highest-leverage feature only if it:

- scores at least 75/100;
- materially improves both real user value and repeat paid value;
- is more important than fixing reliability, positioning, pricing, or distribution first;
- can be tested with a cheaper prototype or concierge experiment;
- remains useful after novelty fades; and
- fits the health/claims boundary.

For the winner provide:

- one-sentence product definition;
- exact user pain and trigger;
- why it beats the other candidates;
- the new recurring loop it creates;
- what makes it hard to replace;
- smallest demand test before implementation;
- leading indicator, retention indicator, and kill threshold;
- safety/privacy/legal dependencies;
- rough effort and sequencing, without writing an implementation plan unless requested.

If no candidate clears the bar, write:

> **Single feature recommendation: NONE.**

Then state the non-feature constraint that matters more.

---

## Phase 6 — Question 4: Rank the five most viral parts of Revora

### 6.1 Keep three concepts distinct

For every candidate, label it as one or more of:

- `CONTENT-VIRAL`: makes a strong, repeatable video or post;
- `SHARE-VIRAL`: users naturally want to send or post the artifact;
- `PRODUCT-LOOP`: sharing brings another user into a trackable activation loop.

Do not call a feature “viral” merely because it looks attractive on camera. A product with zero referral mechanics can still have marketable moments but no viral coefficient.

### 6.2 Candidate inventory

Inspect the entire current product, including small details:

- the input moment;
- voice or photo draft confirmation;
- verdict reveal;
- surprising meal composition explanation;
- “keep most of the meal” adjustment;
- swap or alternative;
- calm permission/anti-shame moment;
- honesty/uncertainty or clarify moment;
- week/history/progress visualization;
- action completion;
- Pantry Review categorization/report;
- clinical boundary or “this needs a person” trust moment;
- printable/shareable/reportable artifacts;
- any currently gated, missing, or hypothetical surface.

Only current enabled capabilities may rank as current viral parts. Gated or proposed capabilities must be clearly separated as future opportunities.

### 6.3 Score candidates out of 100

| Dimension | Weight |
|---|---:|
| Stops the scroll in the first 1–3 seconds | 15 |
| Clear without explanation or prior brand knowledge | 10 |
| Surprise, tension, or curiosity | 15 |
| Visually or emotionally satisfying reveal | 10 |
| Direct relevance to the ICP’s urgent pain | 15 |
| Repeatable across many meals/stories | 10 |
| Naturally shareable or discussable | 10 |
| Demonstrates the product truthfully | 10 |
| Converts attention into a first check | 5 |
| **Total** | **100** |

Compliance, privacy, and product truth are pass/fail gates, not bonus points. A high-performing but misleading or prohibited concept is disqualified.

### 6.4 Required top-five table

| Rank | Current product part | Viral type | Score /100 | Evidence | Why it works | Why it may fail | Best video format | Compliant hook | CTA | Test metric |
|---:|---|---|---:|---|---|---|---|---|---|---|

For each top-five item, include:

- one 15–30 second video concept;
- the opening visual or first three seconds;
- the tension and reveal;
- compliant on-screen wording;
- the path from view to activated first check;
- five variants or a reason the format lacks repeatability;
- the metric and sample size required to call it promising.

Also report:

- the strongest **current** organic share loop, if any;
- the missing product plumbing that prevents content attention from compounding;
- whether Revora has genuine product virality today, or only content-marketing potential.

---

## Phase 7 — Question 5: Choose one distribution engine for the first 5,000 activated users

### 7.1 Diagnose the bottleneck before choosing a channel

Determine whether the primary constraint is:

- insufficient demand;
- weak positioning or hook;
- low trust;
- poor first-session activation;
- lack of product availability/reliability;
- lack of repeat paid value;
- low content reach;
- missing referral/share plumbing;
- founder capacity;
- legal/clinical/claims gating;
- inability to measure attribution; or
- a target that exceeds plausible organic throughput.

The recommendation must attack the dominant bottleneck. “Post more videos” is not a strategy unless it is embedded in a repeatable content-to-activation engine with proven format and math.

### 7.2 Compare serious distribution candidates

At minimum compare:

- founder-led short-form demo engine;
- Reddit/community answer engine;
- Facebook-group/community engine;
- diagnosis-moment SEO/content;
- referral or family-sharing loop;
- creator partnerships;
- clinician/lab/pharmacy referral;
- Pantry Review as acquisition wedge;
- free diagnostic/lead magnet or challenge;
- paid acquisition, if economics and policy permit;
- partnerships with DPPs, dietitians, employers, or metabolic-health products.

Score each:

| Dimension | Weight |
|---|---:|
| Speed to first 100 activated users | 10 |
| Plausible throughput to 5,000 | 15 |
| ICP intent and fit | 15 |
| Trust created | 10 |
| Conversion to first check | 10 |
| Founder execution fit and capacity | 10 |
| Cost and cash efficiency | 10 |
| Repeatability/compounding | 10 |
| Platform/policy/claims resilience | 5 |
| Measurability and learning speed | 5 |
| **Total** | **100** |

Use current evidence and do not assume the existing 90-day strategy chose correctly.

### 7.3 Select one primary mechanism

Choose one mechanism, not a list of channels. Other channels may support it, but name the one engine that receives most founder attention for the next validation cycle.

The recommendation must include:

- precise audience and diagnosis trigger;
- the repeatable asset, action, or offer;
- why it earns trust;
- why someone clicks now;
- the activation event;
- the feedback loop that makes the next asset better;
- any user-to-user sharing loop;
- founder hours/week;
- tools and approximate budget;
- platform, clinical, legal, and operational constraints;
- the prerequisite that must be fixed before traffic begins;
- the reason this is faster than the second-best option.

### 7.4 Show the 5,000-user math

Use a transparent equation such as:

```text
qualified impressions
× profile/link click-through rate
× landing-to-start rate
× start-to-completed-first-check rate
× channel/asset volume
= activated first-check users
```

Then model:

- conservative case;
- base case;
- upside case;
- weekly cumulative ramp;
- expected registered accounts;
- expected Day-7 retained users;
- expected payers, with the conversion assumption exposed;
- time to 100, 500, 1,000, and 5,000 activated users;
- sensitivity to the two most fragile assumptions.

Use Revora’s real measured funnel rates when available. If unavailable, use sourced benchmarks only as planning ranges, never as Revora performance. Show what must be measured in the first 14 days to replace the assumptions.

If the math requires implausible posting volume, hidden paid reach, unaffordable CAC, policy-violating tactics, or conversion rates unsupported by evidence, reject the plan.

### 7.5 Give a falsifiable 14-day proof test

Before presenting a 90-day scale plan, specify a small test with:

- hypothesis;
- exact audience and channel;
- number of assets/interactions;
- asset templates or formats;
- UTMs and event instrumentation;
- activation denominator and numerator;
- success, iterate, and kill thresholds written in advance;
- maximum time and spend;
- what happens on Day 15 for each result.

The test must distinguish a good topic from a good format, a good format from product demand, and product demand from willingness to pay.

---

## Required report structure

Save the final report to:

`/home/tefera/Desktop/Revora/docs/handoff/2026-07-18-revora-product-value-retention-virality-distribution-forensic-report.md`

Use this exact top-level structure:

1. **Executive verdict — the five direct answers**
2. **Snapshot and evidence quality**
3. **Contradiction ledger and current feature truth**
4. **Real-user journey findings**
5. **Q1 — Promise delivery and real-life value**
6. **Q2 — Durable paid retention**
7. **Q3 — Pain coverage, missing features, and the one-feature decision**
8. **Q4 — Ranked top five viral product moments**
9. **Q5 — The one first-5,000-user distribution engine**
10. **14-day validation plan and 5,000-user funnel math**
11. **What not to build or do**
12. **Top five decisions/actions, in priority order**
13. **Unknowns, counterevidence, and falsification tests**
14. **Sources and evidence index**

### Required opening decision table

The report must begin with this table, completed in direct language:

| Question | Direct verdict | Score/confidence | Decisive evidence | Biggest unknown | Next decision |
|---|---|---:|---|---|---|
| Does Revora deliver its promise and meaningful value? | | | | | |
| Can it retain paying users long-term? | | | | | |
| What one feature most upgrades it? | Feature name or `NONE` | | | | |
| What are the five strongest viral parts? | Short ranked list | | | | |
| What one engine gets the first 5,000 activated users fastest? | | | | | |

### Required conclusion

End with:

- `PRODUCT VALUE: STRONG / CONDITIONAL / WEAK / UNKNOWN`
- `PAID RETENTION: STRONG / CONDITIONAL / WEAK / UNKNOWN`
- `ONE FEATURE: <name> / NONE`
- `CURRENT PRODUCT VIRALITY: GENUINE LOOP / CONTENT POTENTIAL ONLY / WEAK / UNKNOWN`
- `FIRST-5,000 ENGINE: <one mechanism>`
- `OVERALL COMMERCIAL VERDICT: PROCEED / PROCEED WITH A NARROW TEST / REPOSITION / STOP`

Then give the five actions that matter most, each with owner, evidence required, and pass/fail threshold.

---

## Quality bar

The work is not complete until all of the following are true:

- Current branch, HEAD, dirty state, feature availability, and pricing mode are recorded.
- Current source and rendered product were inspected; old docs were not treated as current by default.
- Every major product promise is mapped to source/live proof.
- The core journey and return journey were examined from a real user’s perspective.
- Real Revora analytics and payment evidence were used if available; absence was stated if not.
- External user pain, competitor, substitute, pricing, channel, and policy claims have direct current citations.
- Evidence, inference, hypothesis, and unknown are visibly separated.
- The value and retention rubrics are scored with reasons and counterevidence.
- The pain-point matrix includes emotional, trust, cultural-food, workflow, and post-learning needs, not only feature requests.
- Exactly one highest-leverage feature is selected, or `NONE` is stated honestly.
- Five **current** viral parts are ranked; future/gated ideas are kept separate.
- Content virality and product virality are not conflated.
- Exactly one primary first-5,000 distribution engine is selected.
- The 5,000-user recommendation includes conservative/base/upside funnel math and capacity constraints.
- The first 14-day test has precommitted success and kill thresholds.
- No health outcome, personalization, accuracy, traction, or endorsement claim exceeds its evidence.
- Engineering readiness, clinical review, counsel clearance, WTP, retention, and distribution are never collapsed into one “ready” verdict.
- The final report is saved on disk and re-opened for a final contradiction and citation check.

---

## Final self-audit before stopping

Ask yourself:

1. Did I test whether the product changes a real meal decision, or did I merely describe features?
2. Did I confuse “people have this problem” with “people want Revora’s solution”?
3. Did I confuse a completed check with an aha moment?
4. Did I confuse repeated checking with healthy, durable value?
5. Did I explain why someone would still pay after learning the basics?
6. Did I make “personalization” do rhetorical work that the implementation or data cannot support?
7. Did I recommend a feature because it sounds impressive rather than because evidence predicts retention?
8. Did I rank a gated or hypothetical capability as if users have it now?
9. Did I call a video-friendly reveal an organic viral loop?
10. Did I show enough funnel math to make 5,000 users credible?
11. Did I choose one distribution engine, or hide indecision inside a channel list?
12. Did I preserve counterevidence and give the product a real chance to fail the audit?
13. Did I remain inside health, privacy, platform, and claims boundaries?
14. Would a skeptical founder know exactly what to do next, what not to build, and what evidence would change the decision?

If any answer is no, continue the analysis before reporting completion.
