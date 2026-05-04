# Feature Research

**Domain:** Permission-first prediabetes AI food checker (text-only public MVP)
**Researched:** 2026-05-04
**Confidence:** MEDIUM

## Thesis

Current AI food-checker products consistently compete on fast input, a single easy-to-read verdict, plain-English explanation, and healthier alternatives. They then expand into diaries, streaks, device sync, and broader health tracking. For Revora's Permission MVP, the correct move is to keep the first group and deliberately reject the second. The wedge is not "more tracking." It is "Can I eat this?" answered quickly, safely, and in a way that reduces pre-meal anxiety for people with prediabetes.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist for a public, mobile-first AI food checker. Missing these makes the product feel broken or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Instant no-login food + A1C check on one screen | Public food-checkers are expected to provide value immediately, especially when shared from Reddit, text, or search | LOW | Text field for meal description plus numeric A1C input. No signup wall before first result. |
| Simple verdict in plain English | Competing products present a single score, risk, or grade first; users do not want to parse nutrition tables under time pressure | MEDIUM | Revora should use SAFE / MODERATE / HIGH with a one-sentence reason. Requires schema-constrained output. |
| Trust-building explanation for the verdict | Current products explain why a food scored well or poorly; opaque answers feel like guesses | MEDIUM | Explanation must reference meal composition and blood sugar impact qualitatively, not made-up GI/GL precision. |
| One practical next action for borderline results | Competitors increasingly pair analysis with swaps or "what to do instead"; a warning alone feels incomplete | MEDIUM | For MODERATE/HIGH, give exactly one doable adjustment: sequencing tip, add protein/veg, or a realistic swap. |
| Mobile-first loading, error, and retry states | Food-checkers are used in kitchens, grocery aisles, and restaurants on bad networks | LOW | Large tap targets, readable result card, visible "Checking..." state, and graceful failure copy are required. |
| Edge-case handling for ambiguous and invalid inputs | In a health-adjacent checker, users expect the system to fail safely rather than bluff | MEDIUM | Must handle non-food inputs, ambiguous meals, carbs-only meals, and A1C outside 5.7-6.4. Ask one clarifying question at most. |
| Explicit medical and privacy boundaries | Health apps commonly surface safety notes and privacy expectations; silence here reduces trust | LOW | Every result must say informational only, advise doctor/RD consultation, and avoid implying diagnosis or treatment. |

### Differentiators (Competitive Advantage)

These are the features that make Revora distinct rather than merely "another food score app."

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Prediabetes-only A1C-calibrated risk rubric | Most products are broad diabetes or general wellness tools; Revora can feel purpose-built for A1C 5.7-6.4 | MEDIUM | Risk thresholds should tighten as A1C approaches 6.4. Out-of-range users should be redirected, not quietly supported as if in-scope. |
| Permission-first SAFE result framing | Current products often feel score-heavy or corrective. Revora can differentiate by making SAFE answers feel relieving and enabling | MEDIUM | This is product behavior, not just copy. SAFE outputs should not include unnecessary swap suggestions. |
| Evidence-grounded sequencing and swap guidance | Competitors often stop at scoring; Revora can turn the answer into a practical next meal decision | MEDIUM | Tips should stay inside validated patterns such as vegetables/protein before carbs or adding protein/fiber to carb-heavy meals. |
| "Can I eat this?" answer design instead of dashboard design | Newly diagnosed users need a decision tool first, not a behavior-management suite | LOW | Keep output narrow: verdict, reason, one next action, one swap. No charts, diaries, or education maze in v1. |
| Privacy-minimizing public experience | Many comparables push accounts, histories, and linked health data. Revora can win trust by asking for less | LOW | Stateless by default. If telemetry is added, log category-level safety data without raw A1C or verbatim meal text. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that will sound attractive because competitors have them, but should be deliberately excluded from this MVP.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Photo scan, barcode scan, or nutrition-label OCR | Competitors market camera-driven convenience and it feels "AI-native" | It turns the MVP into a scanner product, slows launch, and tests the wrong thing. The moat hypothesis is permission framing, not image recognition. | Keep text-only input for v1. Add scanner only after WTP and repeated demand are proven. |
| Accounts, profiles, and full meal history | Users associate health apps with saved data and personalization | Adds friction before first value and creates immediate privacy/compliance questions around A1C and meal history | Stay stateless. If needed, add anonymized aggregate telemetry first. |
| Exact GI/GL numbers, blood sugar curves, or future A1C prediction | Numeric precision looks scientific and is common in competitors | For Revora's LLM-first MVP, false precision is a trust and safety risk. Future A1C prediction is specifically unsupported by project context. | Use qualitative risk bands plus a short rationale and practical adjustment. |
| Open-ended AI nutrition coach chat | Feels engaging and flexible | Broad chat invites medical-boundary drift, inconsistent answers, and longer response times | Keep the output format constrained. Allow only one clarifying question when the meal is too ambiguous. |
| CGM sync, glucometer sync, clinician dashboard, or doctor-ready reports | These are common in mature diabetes platforms | They move the product into device integration and clinical workflow territory before PMF exists | Use a consult-your-doctor footer now. Revisit clinician workflows after demand validation. |
| Multi-condition support (type 2, gestational, weight loss, allergies, PCOS, general wellness) | Broader TAM feels safer on paper | Dilutes the wedge, complicates risk logic, and weakens acquisition messaging in prediabetes communities | Stay tightly scoped to prediabetes, A1C 5.7-6.4, and the "Can I eat this?" job. |

## Safety and Medical Boundaries

- Revora must identify itself as informational guidance only, not diagnosis or treatment.
- A1C outside 5.7-6.4 cannot be handled as normal flow. Below-range users should be told the tool is outside its target population; 6.5+ users should be directed to work with a clinician.
- The model must not invent exact GI/GL values, blood sugar curves, or predicted future A1C values for the Permission MVP.
- When the food description is unclear, the system should ask one clarifying question or classify conservatively higher. It should not improvise specifics.
- SAFE outputs should not moralize food or add unnecessary restrictions. MODERATE/HIGH outputs should be direct without sounding alarmist.
- Raw A1C and raw meal text should not be stored unless the privacy posture is intentionally designed. If telemetry is introduced, use category-level or redacted analytics.

## Feature Dependencies

```text
[No-login mobile form]
    |-requires-> [Food description input]
    `-requires-> [A1C validation]

[SAFE / MODERATE / HIGH verdict]
    |-requires-> [Food parsing]
    |-requires-> [A1C-calibrated rubric]
    `-requires-> [Schema-constrained output]

[Reason + next action + swap]
    |-requires-> [SAFE / MODERATE / HIGH verdict]
    `-requires-> [Meal composition inference]

[Edge-case safety handling]
    |-requires-> [Food description input]
    |-requires-> [A1C validation]
    `-enhances-> [SAFE / MODERATE / HIGH verdict]

[Permission-first SAFE tone]
    `-enhances-> [Reason + next action + swap]

[Accounts/history]
    `-conflicts-> [Privacy-minimizing public experience]

[Photo/barcode scanning]
    `-conflicts-> [72-hour text-only MVP scope]
```

### Dependency Notes

- **SAFE / MODERATE / HIGH verdict requires food parsing and an A1C-calibrated rubric:** without both, the answer becomes generic wellness copy rather than prediabetes-specific guidance.
- **Reason + next action + swap requires meal composition inference:** the system needs enough understanding of the meal to suggest sequence, add-on, or swap that feels realistic.
- **Edge-case safety handling enhances the verdict:** health-adjacent trust is lost fastest when the tool confidently answers nonsense or out-of-scope cases.
- **Permission-first SAFE tone enhances the explanation layer:** it is the main emotional differentiator and should be treated as product logic, not marketing polish.
- **Accounts/history conflicts with a privacy-minimizing public MVP:** saved history is valuable later, but it directly increases friction and health-data handling risk now.
- **Photo/barcode scanning conflicts with the MVP scope:** those features change the validation question from "does permission-first guidance resonate?" to "can we ship a scanner?"

## MVP Definition

### Launch With (v1)

- [ ] No-login mobile form for food description + A1C - required for public sharing and immediate first value
- [ ] SAFE / MODERATE / HIGH answer with one-sentence rationale - core "Can I eat this?" outcome
- [ ] One practical sequencing tip or add-protein/veg adjustment for MODERATE/HIGH - converts a warning into a usable next step
- [ ] One lower-glycemic swap for MODERATE/HIGH and no swap for SAFE - preserves permission-first framing
- [ ] Edge-case handling + informational-only footer + mobile loading/error states - required to be safely shareable

### Add After Validation (v1.x)

- [ ] Anonymized telemetry by category/result class - add only if founder needs better safety review and demand data
- [ ] Suggested query examples or restaurant/meal presets - add if users struggle to phrase meal descriptions
- [ ] Lightweight result sharing affordance - add if organic sharing is strong but manual copying creates friction
- [ ] Spanish or other language support - add only if acquisition data shows clear demand

### Future Consideration (v2+)

- [ ] Photo scanning and barcode scanning - only after text MVP proves the permission wedge
- [ ] Saved history, favorites, streaks, and daily budgets - useful for retention, not for first validation
- [ ] CGM/meter integrations and clinician reports - only once Revora becomes a broader management platform
- [ ] Payments, accounts, and recurring personalization - introduce after WTP is proven and privacy posture is intentional

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| No-login food + A1C form | HIGH | LOW | P1 |
| SAFE / MODERATE / HIGH verdict | HIGH | MEDIUM | P1 |
| Plain-English rationale | HIGH | MEDIUM | P1 |
| One next action + one swap | HIGH | MEDIUM | P1 |
| Edge-case safety handling | HIGH | MEDIUM | P1 |
| Mobile loading/error states | HIGH | LOW | P1 |
| Prediabetes-only A1C calibration | HIGH | MEDIUM | P1 |
| Permission-first SAFE framing | HIGH | MEDIUM | P1 |
| Anonymized telemetry | MEDIUM | LOW | P2 |
| Result sharing affordance | MEDIUM | LOW | P2 |
| Suggested query examples | MEDIUM | LOW | P2 |
| Photo/barcode scanning | MEDIUM | HIGH | P3 |
| Saved history and streaks | MEDIUM | MEDIUM | P3 |
| Device sync / clinician reports | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Glycemic Snap | GluKee | Our Approach |
|---------|---------------|--------|--------------|
| Input modes | Photo, voice, text, recipe import, barcode/label scan | Photo meal scan inside a broader tracking app | Text-only meal description to maximize speed and isolate the permission hypothesis |
| First result shape | GI/GL, glucose curve, score, swaps | Glycemic insights inside a dashboard and logging flow | SAFE / MODERATE / HIGH with one sentence, one action, one swap |
| Ongoing tracking | Daily diary, targets, streaks, favorites, AI pattern insights | Glucose, BP, weight, meds, carb budget, reports, reminders | Not in MVP. Tracking is deferred until validation. |
| Scope | Broad diabetes, prediabetes, weight and energy optimization | Broad metabolic tracking, not prediabetes-only | Prediabetes-only, A1C 5.7-6.4, no condition sprawl |
| Safety posture | "Not medical advice" footer, but still markets predictive curves | Added sources and safety notes for carb budget features | Informational-only footer plus explicit out-of-scope handling and no unsupported numeric predictions |
| Privacy/data posture | App store listing shows analytics/tracking disclosures | Account-linked health data and cloud functionality | Stateless public tool by default; telemetry only in minimized form |

## Recommendation

Revora's MVP should not try to match the full feature surface of scanner and tracker apps. It should beat them on one job: a newly diagnosed prediabetic can type a meal, enter an A1C, and get a fast answer that feels trustworthy, specific, and calming. That means the launch surface should stay brutally small: input, verdict, reason, one action, one swap, and strong boundaries. Every feature that turns the product into a diary, scanner platform, or quasi-clinical dashboard should wait.

## Sources

- HIGH: Local project context - `.planning/PROJECT.md`
- HIGH: Approved design source - `docs/revora-design-20260404-070350.md`
- HIGH: Glycemic Snap about page - https://glycemicsnap.com/about
- HIGH: Glycemic Snap App Store listing - https://apps.apple.com/us/app/glycemic-snap-gi-scanner/id1522964184
- HIGH: GluKee App Store listing - https://apps.apple.com/ie/app/glukee-blood-sugar-tracker/id6758737585
- HIGH: ZOE app page - https://zoe.com/en-us/app
- MEDIUM: Lumo AI product page - https://lumoai.app/
- MEDIUM: Blume product page - https://getblume.app/
- HIGH: Review of prediabetes apps in the DACH region (mHealth, 2025) - https://mhealth.amegroups.org/article/view/133506/html
- HIGH: CDC prediabetes guidance - https://www.cdc.gov/diabetes/prevention-type-2/prediabetes-prevent-type-2.html
- HIGH: NIDDK insulin resistance and prediabetes overview - https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/prediabetes-insulin-resistance
- HIGH: Imai et al. meal sequencing study - https://pubmed.ncbi.nlm.nih.gov/36904173/
- HIGH: Shukla et al. food order intervention in prediabetes - https://pmc.ncbi.nlm.nih.gov/articles/PMC10610476/

---
*Feature research for: Revora Permission MVP*
*Researched: 2026-05-04*
