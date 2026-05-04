# Pitfalls Research

**Domain:** Permission-first prediabetes AI food checker MVP
**Researched:** 2026-05-04
**Confidence:** MEDIUM

This document focuses on mistakes that are specific to Revora's wedge: a public, text-only, patient-facing food guidance tool for people with A1C in the prediabetes range. The phase mapping below is an inference from current FDA/FTC/HHS/CDC/NIDDK guidance plus Revora's approved MVP scope.

## Suggested Roadmap Phases Referenced Below

- **Phase 1 - Claims Boundary, Evidence Pack, and Safety Spec:** Lock allowed claims, banned claims, evidence sources, tone rules, and escalation behavior before coding.
- **Phase 2 - Guardrailed MVP Logic and Eval Harness:** Build the result rubric, deterministic output schema, edge-case handling, and red-team eval suite.
- **Phase 3 - Privacy-Minimal Telemetry and Incident Readiness:** Decide what data is never stored, what is redacted, and how deletion, consent, and shutdown work.
- **Phase 4 - Boring Public Delivery, Not Platform Building:** Ship the one-page MVP with simple rate limits and latency/cost controls; defer scanner/auth/db/payments.
- **Phase 5 - Community Launch and Founder Review Loop:** Launch carefully, monitor outputs manually, and respond to community trust issues with evidence and transparency.

## Critical Pitfalls

### Pitfall 1: Medical-Claim Drift Turns a Food Checker into a Quasi-Clinical Tool

**What goes wrong:**
Revora starts as an informational food checker, then drifts into patient-specific treatment language: "this will lower your A1C," "this food is safe for your condition," "follow this plan to reverse prediabetes," or "Revora helps prevent diabetes." That creates regulatory exposure, deceptive-claims risk, and immediate trust loss if users or communities read it as diagnosis or treatment advice.

**Why it happens:**
Health-adjacent AI products get pulled toward more dramatic marketing and more confident outputs because confidence sounds useful. Patient-facing software also lacks the clinician-review buffer that FDA's non-device CDS framework is built around.

**How to avoid:**
- Define an allowed-claims vocabulary before implementation: qualitative glycemic-impact language only.
- Ban specific claim classes in product copy and prompts: diagnosis, treatment, prevention, cure, reversal, exact glucose prediction, and exact A1C improvement claims.
- Require every output to stay inside Revora's stated scope: informational guidance for prediabetes food decisions, not medical advice.
- Keep every result grounded in peer-reviewed or government-backed evidence categories already approved in the product context.
- Review landing-page copy, app UI copy, prompt text, and launch posts together. The copy risk is not just in the model output.

**Warning signs:**
- Outputs use directive clinical phrasing such as "you should treat," "this will reverse," or "this is medically safe."
- Marketing copy implies FDA review, clinical validation, or prevention/treatment outcomes that Revora has not earned.
- The disclaimer is present but contradicted by confident body copy.
- Team members start describing Revora as "personalized medical guidance."

**Tests / manual checks:**
- Red-team prompts for diagnosis/treatment bait: symptoms, meds, pregnancy, A1C 6.5+, urgent symptoms, "what should I do medically?"
- Static copy review against a banned-claims checklist before every public launch.
- Screenshot audit: verify the disclaimer is visible on mobile without scrolling past the result.

**Phase to address:**
Phase 1, then verify continuously in Phase 2 and Phase 5.

---

### Pitfall 2: Unsafe SAFE Classifications from Hallucinated Meal Assumptions

**What goes wrong:**
The model labels a food SAFE because it invents missing context, assumes a smaller portion, imagines healthier ingredients, or over-trusts vague inputs. In Revora's domain, a harmful false SAFE matters more than an overly conservative MODERATE.

**Why it happens:**
General-purpose LLMs are optimized to answer fluently, not to admit uncertainty at the right moments. If the prompt does not force ambiguity handling, the model will often fill gaps instead of asking or escalating.

**How to avoid:**
- Treat uncertainty as a first-class state, not a prompt footnote.
- Add rule-based prechecks for non-food inputs, ambiguous restaurant items, and out-of-range A1C before the model generates coaching.
- Force a structured output contract with explicit reasoning slots and limited action types.
- Use conservative escalation rules: ambiguous mixed meals should not quietly collapse into SAFE.
- Create a "harmful SAFE" review set and make it the gating eval, not generic accuracy.
- Add an emergency kill switch for the public endpoint and a rapid prompt rollback path.

**Warning signs:**
- The same ambiguous input returns SAFE in one run and MODERATE in another.
- Restaurant foods get judged without portion or ingredient clarification.
- Swaps are generic filler ("just eat salad") or clearly mismatched to the original meal.
- Founder review finds even one obviously harmful SAFE on a common carb-heavy meal.

**Tests / manual checks:**
- Golden regression suite covering plain rice, sugary drinks, pastries, fast-food combos, ambiguous chain-menu items, and non-food text.
- Repeated-run consistency test on the same input set.
- Daily founder/manual review of sampled SAFE outputs during public beta.
- Manual incident drill: disable endpoint, patch prompt/rules, rerun suite, relaunch.

**Phase to address:**
Phase 2, with ongoing monitoring in Phase 5.

---

### Pitfall 3: Treating A1C as a Complete Personalization Layer

**What goes wrong:**
Revora acts as if "food description + A1C" is enough to determine whether a meal is safe. That creates false precision. In reality, A1C is only one signal, prediabetes can be identified by different tests, and blood sugar response depends on meal composition, portion, and what the carb is eaten with.

**Why it happens:**
The MVP needs simple inputs, and "A1C-personalized" sounds differentiated. That makes it tempting to oversell the meaning of a single lab value and ignore uncertainty created by missing context.

**How to avoid:**
- Use A1C only as a coarse risk band, not as a full personalization engine.
- Keep result language qualitative; do not generate glycemic-load numbers, exact spike estimates, or predicted A1C changes.
- Ask one clarifying question when the meal description is too vague to classify safely.
- Explicitly handle A1C outside 5.7-6.4 and avoid pretending Revora applies equally well there.
- Keep the result focused on meal sequencing, portion awareness, and practical swaps instead of pseudo-clinical precision.

**Warning signs:**
- Outputs present exact glucose or A1C forecasts.
- The same food is treated as universally SAFE or HIGH based only on a narrow A1C delta.
- Users ask "how does it know?" and the honest answer is "it doesn't; it guessed."
- Prompt logic assumes A1C is a diagnosis-quality proxy in every case.

**Tests / manual checks:**
- Edge-case suite for A1C 5.6, 5.7, 6.4, 6.5, and clearly malformed inputs.
- Ambiguity suite comparing "banana," "banana with Greek yogurt," and "banana smoothie."
- Lint-style prompt review to ban exact-number outputs and unsupported causal language.

**Phase to address:**
Phase 1 for scope/spec, Phase 2 for implementation.

---

### Pitfall 4: Privacy Theater Around Health-Adjacent Data

**What goes wrong:**
The team says "we don't store PHI" or "we're not HIPAA, so we're fine," while raw A1C values, food text, IP-linked prompts, analytics events, traces, and screenshots still leak into logs, vendors, or internal review channels. That is exactly how a low-scope MVP creates a high-trust failure.

**Why it happens:**
Web stacks log by default. Analytics and observability tools are easy to add. Teams also confuse "not a HIPAA covered entity" with "low privacy obligation," even though FTC rules and state consumer-health-data laws can still apply.

**How to avoid:**
- Default to stateless handling for the MVP: do not store raw food text or raw A1C unless a later phase explicitly justifies it.
- Turn off request-body logging anywhere prompts or A1C may appear.
- Redact or hash identifiers used for rate limiting and abuse control.
- Do not install session replay or broad analytics on the result surface until a privacy review is done.
- If any health-adjacent data is retained later, design to Washington My Health My Data standards from day one: clear notice, consent, access/deletion workflow, and minimal sharing.
- Keep the privacy policy exact and narrow. Do not use vague "share with trusted partners" language.

**Warning signs:**
- Vercel/server logs visibly contain food descriptions or A1C values.
- Someone proposes Hotjar/session replay/full-event analytics on the result page.
- The privacy policy is broader than the real MVP need.
- Team members say "HIPAA doesn't apply" as the end of the analysis.

**Tests / manual checks:**
- Data-flow inventory showing where food text, A1C, IP, and output can appear.
- Manual inspection of application logs after live test queries.
- Vendor review for analytics, error tracking, hosting, and AI gateway services.
- Deletion/consent tabletop exercise before enabling any telemetry beyond basic operational metrics.

**Phase to address:**
Phase 3 before public launch, with Phase 4 inheriting the constraints.

---

### Pitfall 5: Community Launch that Reads as Promotion or Misinformation

**What goes wrong:**
Revora gets posted into r/prediabetes as a product drop, not a support-minded experiment. The post is read as self-promotion, unsupported medical guidance, or anxiety-inducing misinformation. Moderators remove it, early users distrust it, and Revora burns its first distribution channel.

**Why it happens:**
Founders often assume utility excuses promotion. In health-adjacent communities, the opposite is true: trust is earned through accuracy, transparency, restraint, and responsiveness.

**How to avoid:**
- Treat the community launch as trust work, not growth hacking.
- Check current subreddit rules before posting. Build the launch plan around them, not around generic startup playbooks.
- Lead with transparency: who built it, what it does, what it does not do, and what feedback is being requested.
- Include credible source links if any clinical or nutritional claim is mentioned.
- Ask moderators first if the format is borderline promotional.
- Prepare a plain-language evidence note and FAQ so the first skeptical comment gets a substantive answer, not marketing copy.

**Warning signs:**
- The launch post includes a hard CTA, pricing bait, or "reversal" language.
- No source links are ready for claims about sequencing, swaps, or glycemic impact.
- The team plans a link-only post instead of participating in the discussion.
- Early comments challenge credibility and there is no evidence packet ready.

**Tests / manual checks:**
- Pre-launch checklist against the current r/prediabetes rules: no promotional framing, no medical advice, accurate info only, source-ready claims.
- Moderator outreach or at minimum a rules/readme review before posting.
- Dry-run launch copy review by someone uninvolved in writing it.

**Phase to address:**
Phase 5.

---

### Pitfall 6: Permission-First Positioning that Still Increases Food Anxiety

**What goes wrong:**
Revora intends to reduce restriction, but the UI and copy still make users feel judged, scared, or dependent on repetitive reassurance checks. The product becomes a food morality engine instead of a practical decision aid.

**Why it happens:**
Risk labels are emotionally loaded. General wellness products often use green/red shorthand and moralized language because it is easy to design and easy to share, even when it is wrong for anxious users.

**How to avoid:**
- Define tone as a safety requirement, not a marketing preference.
- SAFE responses should reassure without implying unlimited safety; MODERATE/HIGH should give one practical next step without shame.
- Ban moral language such as "bad," "cheat," "clean," or "dangerous."
- Keep the result short enough for real-world use and avoid lecture-style outputs that feel clinical or scolding.
- Validate tone with actual people in the target cohort, not just internal reviewers.

**Warning signs:**
- Users say the app makes them feel worse, more confused, or more avoidant.
- Results use color and language that imply virtue/failure.
- SAFE cards still include unnecessary warnings or swaps.
- Founder notices repeat behavior that looks like reassurance-seeking rather than decision support.

**Tests / manual checks:**
- Tone review across 20-30 common food scenarios.
- Lead-user walkthroughs focused on emotional response, not just accuracy.
- Screenshot review for mobile readability and emotional load.

**Phase to address:**
Phase 1 for tone rules, Phase 2 for implementation, Phase 5 for real-world validation.

---

### Pitfall 7: Overbuilding Infrastructure Before Revora Earns the Right

**What goes wrong:**
The roadmap starts filling with scanner pipelines, auth, profiles, databases, payments, fine-tuning, and mobile packaging before Revora has validated the core question: do people trust and want prediabetes-specific permission guidance enough to use, share, and pay for it?

**Why it happens:**
Health AI founders often mistake sophistication for credibility. In practice, premature infrastructure delays the one thing Revora needs now: fast evidence on usefulness, trust, and harmful SAFE rate.

**How to avoid:**
- Keep the roadmap tied to explicit learning gates: first-week queries, shares, paid-interest signals, manual safety review, latency, and cost.
- Require every non-MVP infrastructure task to state which blocked learning objective it unlocks.
- Defer scanner/auth/db/payments unless the current MVP can no longer answer the demand question.
- Prefer reversible boring infrastructure over "future-proof" architecture.

**Warning signs:**
- Tickets appear for image ingestion, user accounts, Stripe, or long-term profiles before launch review is complete.
- Engineering discussions focus on scale the MVP is nowhere near.
- There is no eval harness, but there is already a plan for fine-tuning or multi-model routing.

**Tests / manual checks:**
- Roadmap review: every phase must map to a learning milestone or safety requirement.
- Scope audit before each sprint: reject work that does not improve safety, trust, launch readiness, or first-week signal quality.
- Cost/latency benchmark on the boring stack before discussing system expansion.

**Phase to address:**
Phase 4, with scope discipline starting in Phase 1.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Logging raw prompts and raw A1C for "debugging" | Easier debugging on day 1 | Privacy exposure, deletion burden, trust damage | Never in public MVP; only with synthetic test data locally |
| Free-form model output with no schema | Faster first implementation | Harder evals, unstable tone, hidden safety regressions | Only for private prototyping before eval harness exists |
| Adding auth/database before demand signal | Easier future feature expansion | Slower launch, more privacy burden, worse conversion | Not acceptable for this MVP |
| Fine-tuning before building a regression suite | Feels more "serious" than prompt design | Locks in unknown failure modes and raises iteration cost | Not acceptable until Phase 2 evals are stable |
| Session replay or broad product analytics on results | Faster UX insights | Captures health-adjacent data and violates user expectations | Not acceptable until Phase 3 privacy review is complete |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| OpenAI API | Sending unrestricted user text directly through loose prompts and accepting prose output as-is | Use a narrow system contract, structured output, explicit edge-case handling, and post-generation validation |
| Hosting/logging platform | Assuming default logs are safe for health-adjacent prompts | Audit log sinks, disable body logging, and redact anything tied to A1C or meal text |
| Analytics/observability vendors | Installing SDKs before deciding what user health data is allowed to leave the app | Start with minimal operational metrics only; add vendors only after Phase 3 review |
| Reddit/community launch | Posting like a startup launch thread instead of a support-minded request for feedback | Follow subreddit rules, lead with transparency, and be ready with evidence links and responses |
| Rate limiting | Storing raw IPs indefinitely or blocking shared networks too aggressively | Use minimal retention, short windows, and document the tradeoff between abuse control and false positives |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Prompt bloat with long evidence dumps | Slow responses, rising cost, inconsistent under-5-second UX | Keep evidence distilled into a compact rubric instead of stuffing papers into every call | Usually noticeable by a few hundred public queries if users are on mobile networks |
| Multi-pass model chains for one simple answer | Higher latency and more points of failure | Use one guarded classification/generation pass for MVP | Breaks the under-5-second goal quickly under modest public traffic |
| Manual review with no triage strategy | Founder review queue piles up and safety issues hide in the backlog | Sample by risk class, prioritize SAFE outputs, and maintain a known-issues list | Around dozens of daily queries if every output is reviewed equally |
| Premature retrieval/citation plumbing | More moving parts than insight, launch delays | Keep citations in the evidence pack and community FAQ before building live retrieval | Breaks the 72-hour shipping constraint immediately |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Health-adjacent prompts leaking into logs, traces, screenshots, or support channels | Privacy incident, breach-notification exposure, user trust collapse | Minimize storage, redact aggressively, and restrict reviewer access |
| Prompt injection steering the model into medical advice or policy bypass | Unsafe outputs that users can screenshot and share publicly | Validate inputs, keep a strict output schema, and regression-test jailbreak-style prompts |
| No emergency shutdown path for the public endpoint | Harmful outputs remain live while the team debates the fix | Add a kill switch and rollback procedure before launch |
| Shared internal review docs containing raw user meals/A1C | Informal privacy leak outside the app itself | Use redacted review artifacts or synthetic examples wherever possible |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Red/green morality framing | Increases shame and restriction | Use calm permission-first copy with practical next steps |
| Asking for too much context upfront | Users standing in kitchens/restaurants abandon the flow | Keep input minimal and ask one clarifying question only when necessary |
| Clarifying questions with no graceful fallback | Users get stuck on ambiguous foods | Offer examples and a fast retry path |
| Tiny disclaimer or hidden medical boundary | Users over-trust the output | Make the boundary visible in the result card itself |

## "Looks Done But Isn't" Checklist

- [ ] **Result logic:** Out-of-range A1C inputs are handled explicitly and safely, not silently classified.
- [ ] **Safety:** There is a harmful-SAFE regression suite, not just a happy-path demo.
- [ ] **Privacy:** Live logs have been inspected after real test queries and do not contain raw food text or raw A1C.
- [ ] **Community launch:** Launch copy has been checked against current subreddit rules and backed by source-ready claims.
- [ ] **Mobile UX:** Results remain readable, fast, and visible while using a phone keyboard on a small screen.
- [ ] **Incident response:** The team can disable the endpoint and roll back prompt/rules without a code scramble.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Harmful SAFE output reaches users | HIGH | Disable endpoint, archive the failing prompt/output pair, add a regression test, patch logic, rerun suite, then relaunch with a short changelog |
| Privacy leak through logs or vendor tooling | HIGH | Stop affected logging/tooling, assess scope, delete retained data where possible, rotate keys, determine notification obligations, and narrow collection permanently |
| Community backlash over claims or tone | MEDIUM | Pause promotion, respond transparently with scope correction and sources, revise copy, and relaunch only after moderator/community feedback is incorporated |
| Roadmap drift into overbuild | MEDIUM | Freeze nonessential infra work, restate learning goals, cut backlog to MVP-critical items, and re-baseline phases around safety/trust/demand evidence |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Medical-claim drift | Phase 1 | Banned-claims checklist passes for prompt, UI copy, and launch copy |
| Unsafe SAFE classifications | Phase 2 | Harmful-SAFE regression suite passes and sampled SAFE outputs are manually reviewed |
| A1C over-personalization | Phase 1 and Phase 2 | Edge-case suite passes for ambiguous meals and out-of-range A1C |
| Privacy theater / casual data retention | Phase 3 | Data-flow audit and live-log inspection show no raw health-adjacent payload retention |
| Community launch as promotion | Phase 5 | Launch artifact passes subreddit-rule review and source-readiness check |
| Anxiety-amplifying tone | Phase 1, then Phase 5 | Lead-user tone review shows reassurance without shame or false certainty |
| Overbuilt infrastructure | Phase 4 | Every roadmap item can justify itself via a safety or learning milestone |

## Sources

- [HIGH] FDA, "General Wellness: Policy for Low Risk Devices" (January 2026): https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices
- [HIGH] FDA, "Step 6: Is the Software Function Intended to Provide Clinical Decision Support?": https://www.fda.gov/medical-devices/digital-health-center-excellence/step-6-software-function-intended-provide-clinical-decision-support
- [HIGH] FTC, "Health Products Compliance Guidance": https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance
- [HIGH] FTC, "Health Breach Notification Rule: The Basics for Business": https://www.ftc.gov/business-guidance/resources/health-breach-notification-rule-basics-business
- [HIGH] FTC, "Mobile Health App Interactive Tool": https://www.ftc.gov/business-guidance/resources/mobile-health-apps-interactive-tool
- [HIGH] FTC, "Collecting, Using, or Sharing Consumer Health Information? Look to HIPAA, the FTC Act, and the Health Breach Notification Rule": https://www.ftc.gov/business-guidance/resources/collecting-using-or-sharing-consumer-health-information-look-hipaa-ftc-act-health-breach
- [HIGH] HHS OCR, "Resources for Mobile Health Apps Developers": https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html
- [HIGH] Washington State Legislature, "Washington My Health My Data Act" and implementing sections 19.373.020-.050: https://app.leg.wa.gov/RCW/default.aspx?cite=19.373
- [HIGH] NIDDK, "Recommended Tests for Identifying Prediabetes": https://www.niddk.nih.gov/health-information/professionals/clinical-tools-patient-management/diabetes/game-plan-preventing-type-2-diabetes/prediabetes-screening-how-why/recommended-tests-identifying-prediabetes
- [HIGH] NIDDK, "Insulin Resistance & Prediabetes": https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/prediabetes-insulin-resistance
- [HIGH] CDC, "Diabetes Meal Planning": https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html
- [MEDIUM] Bedi et al., "Testing and Evaluation of Health Care Applications of Large Language Models: A Systematic Review," JAMA (2025): https://pubmed.ncbi.nlm.nih.gov/39405325/
- [MEDIUM] Wang et al., "Applications and Concerns of ChatGPT and Other Conversational Large Language Models in Health Care: Systematic Review," JMIR (2024): https://pubmed.ncbi.nlm.nih.gov/39509695/
- [MEDIUM] "Mitigating the risk of health inequity exacerbated by large language models" (2025): https://pubmed.ncbi.nlm.nih.gov/40319154/
- [HIGH] r/prediabetes current rules JSON endpoint, including accurate-information, no-medical-advice, source-citing, and no-promotional-content rules: https://www.reddit.com/r/prediabetes/about/rules.json

---
*Pitfalls research for: Revora*
*Researched: 2026-05-04*
