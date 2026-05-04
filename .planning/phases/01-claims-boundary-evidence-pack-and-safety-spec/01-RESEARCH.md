# Phase 1: Claims Boundary, Evidence Pack, and Safety Spec - Research

**Researched:** 2026-05-04
**Domain:** Health-adjacent product claims, prediabetes A1C routing, qualitative food guidance safety contract
**Confidence:** HIGH for A1C ranges and source-backed nutrition basics; MEDIUM for regulatory interpretation and rubric calibration

## User Constraints

No phase `CONTEXT.md` exists. The user selected "Continue without context", so the locked scope comes from `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, and project-level research.

### Locked Scope From Roadmap And Requirements

- Revora is prediabetes-only for the Permission MVP.
- Phase 1 must lock the safety contract before model and UI behavior expand.
- Product, prompt, result, and launch copy must stay inside one approved informational-only claims boundary.
- Copy must exclude diagnosis, treatment, prevention, cure, reversal, and future-A1C or glucose-curve prediction claims.
- Explicit A1C bands are required: `5.7-5.9`, `6.0-6.2`, and `6.3-6.4`.
- A1C below `5.7` and `6.5+` must route to safe out-of-scope guidance.
- Guidance must be qualitative, evidence-grounded, and conservative for uncertain or borderline cases.

### Local Document Conflict To Resolve

Older brand and PRD artifacts still contain reversal-oriented language and full-product scanner assumptions. For this phase, the roadmap and requirements are stricter and newer: the MVP claims boundary must ban reversal copy entirely, including softer app-agent phrasing such as "Revora helps reverse prediabetes."

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CLAIM-01 | Product copy, prompt copy, result copy, and launch copy use an approved claims boundary that defines allowed informational guidance and banned medical claims. | FDA 2026 general wellness guidance and FTC health claims guidance require claims to match intended use and be substantiated; use a copy ledger plus banned-claims lint. |
| CLAIM-02 | The product never claims to diagnose, treat, prevent, cure, or reverse diabetes or prediabetes. | FDA's software exclusion and general wellness guidance hinge on avoiding diagnosis, cure, mitigation, prevention, or treatment intended use; FTC warns disclaimers do not fix contradictory disease claims. |
| CLAIM-03 | The product never predicts a user's future A1C or blood glucose curve. | CDC and NIDDK frame A1C as a clinical test and note limits/confirmation needs; Phase 1 should ban exact future values and curves because the MVP has no validated prediction model. |
| CLAIM-04 | Sequencing, swap, and blood-sugar-impact guidance is grounded in documented evidence sources or kept qualitative when evidence is insufficient. | CDC supports qualitative carb/protein/fiber/plate-method guidance; Shukla and Imai support food-order guidance but with limits, so product copy should not overstate magnitude or clinical outcomes. |
| INPUT-04 | The app handles A1C values below 5.7 by explaining that Revora is designed for the prediabetes range. | CDC and NIDDK define normal A1C as below 5.7%; use an out-of-scope route, not a SAFE/MODERATE/HIGH classification. |
| INPUT-05 | The app handles A1C values of 6.5 or above by explaining that the value is in the Type 2 diabetes range and directing the user to clinician guidance. | CDC/NIDDK define diabetes range as 6.5% or above and NIDDK notes diagnosis requires confirmation; use clinician/RD guidance and avoid saying "you have diabetes." |
| GUIDE-02 | The risk rubric calibrates guidance across A1C bands 5.7-5.9, 6.0-6.2, and 6.3-6.4. | NIDDK states higher A1C within 5.7-6.4 carries greater diabetes risk; use increasing conservatism across bands without pretending A1C is complete personalization. |
| GUIDE-07 | Results use qualitative glycemic-impact language and never invent exact GI, GL, or glucose-spike numbers. | CDC sources support qualitative concepts; exact GI/GL/glucose predictions require validated food, portion, and response data that the MVP does not have. |
| GUARD-04 | The prompt and policy layer classify uncertain or borderline cases conservatively rather than returning unsafe reassurance. | Health-adjacent LLM risk is harmful SAFE output; Phase 1 should define conservative floors and uncertainty states before implementation. |

</phase_requirements>

## Summary

Phase 1 should produce a contract that later code is forced to follow, not just prose for a prompt. The core artifacts should be an approved claims boundary, an evidence pack with allowed-use language, an A1C band/out-of-range policy, a conservative uncertainty policy, and a copy ledger covering product, prompt, result, and launch text. This lets Phase 2 implement server-side guardrails against a stable source of truth rather than rediscovering safety rules inside model prompts.

The strongest verified facts are the A1C ranges and the qualitative food guidance foundations. CDC and NIDDK consistently define normal as below `5.7%`, prediabetes as `5.7% to 6.4%`, and diabetes as `6.5% or above`; NIDDK also states that higher A1C inside the prediabetes range means greater risk. CDC meal-planning guidance supports qualitative advice about carbs, refined grains, fiber, protein, nonstarchy vegetables, and plate balance. Food-order research supports sequencing as a practical behavior, but the evidence is not strong enough to justify universal exact spike-reduction claims in Revora result copy.

**Primary recommendation:** Build Phase 1 as a versioned safety specification plus source-backed copy controls, and prohibit model/UI/launch work from using any claim not listed there.

## Standard Stack

### Core

| Library / Artifact | Version | Purpose | Why Standard |
|--------------------|---------|---------|--------------|
| Markdown safety contract | GFM in repo | Human-reviewed source of truth for claims, A1C routing, and tone | Phase 1 is policy/spec work; markdown is reviewable, diffable, and easy for later code tasks to consume. |
| Evidence registry table | Versioned in repo | Maps each permitted guidance rule to source, allowed copy, banned overclaim, and confidence | Prevents citations from becoming broad permission to make stronger clinical claims. |
| Copy ledger | Versioned in repo | Tracks prompt copy, result copy, launch copy, and product copy against allowed/banned claims | Claims risk appears across the whole user journey, not only in model output. |
| A1C routing table | TypeScript-compatible spec | Defines below-range, three in-range bands, and high-range routing | Later code can implement deterministic policy from the same table. |
| Static claims lint | Node.js built-ins plus `rg` | Fails on banned phrases and unsupported exact-number language in active copy files | Prevents regressions when prompt/UI/launch copy changes. |

### Supporting

| Library / Artifact | Version | Purpose | When to Use |
|--------------------|---------|---------|-------------|
| TypeScript constants | Future app stack | Convert A1C bands, disclaimers, and forbidden claim tokens into code | Phase 2, when server policy is implemented. |
| Zod | Future app stack | Validate request and structured model output against the safety contract | Phase 2, not Phase 1. |
| Playwright/Vitest | Future app stack | Verify rendered disclaimers, out-of-range routes, and no banned claims in UI | Phase 2/3 after app scaffolding exists. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Markdown safety contract | Prompt-only rules | Prompt-only policy is easy to drift and hard to review across product/launch copy. |
| Evidence registry | Inline citations in result text | Inline citations can imply stronger clinical proof than exists and add UI clutter. Keep source mapping in the evidence pack first. |
| Static lint | Manual copy review only | Manual review is necessary but not enough; banned terms should be mechanically caught. |
| Qualitative rubric | Exact GI/GL/glucose estimates | Exact numbers require validated food databases, portion details, and clinical response modeling. That is out of MVP scope. |

**Installation:**

```bash
# No runtime package install is required for Phase 1.
# Use repo markdown plus a small Node.js validation script in Wave 0.
```

## Architecture Patterns

### Recommended Project Structure

```text
docs/
`-- safety/
    |-- claims-boundary.md          # Allowed claims, banned claims, disclaimer, escalation language
    |-- evidence-pack.md            # Source registry and allowed-use statements
    |-- a1c-band-rubric.md          # A1C bands, out-of-scope routes, conservative floors
    |-- tone-uncertainty-policy.md  # Permission-first tone and borderline/uncertain handling
    `-- copy-ledger.md              # Product/prompt/result/launch copy inventory and approval status
scripts/
`-- validate-safety-contract.mjs    # Static checks for banned claims and missing required docs
tests/
`-- fixtures/
    `-- safety-contract.json        # Band and claim fixtures consumed by later eval work
```

### Pattern 1: Claims Boundary As Source Of Truth

**What:** One document defines Revora's allowed informational claims and banned medical claims. Every prompt, result, product, and launch string must be approved against that list.

**When to use:** Immediately, before Phase 2 prompt or route work.

**Example:**

```markdown
| Claim Class | Allowed | Banned |
|-------------|---------|--------|
| Product role | "Informational food guidance for people using the prediabetes A1C range." | "Diagnoses, treats, prevents, cures, or reverses prediabetes." |
| Result language | "This meal may have higher blood-sugar impact because it is mostly refined carbs." | "This will spike your glucose by 45 mg/dL" or "This will lower your A1C." |
| Out-of-scope | "This value is outside Revora's prediabetes-only range; work with a clinician or RD." | "You have diabetes" or "Your result is normal." |
```

### Pattern 2: Evidence Registry With Allowed-Use Limits

**What:** Each evidence source gets a narrow allowed-use statement and an explicit "do not claim" field.

**When to use:** Any time guidance copy references carbs, fiber, sequencing, swaps, A1C range, or risk.

**Example:**

```markdown
| Source | Supports | Allowed Use | Do Not Claim | Confidence |
|--------|----------|-------------|--------------|------------|
| CDC Diabetes Meal Planning | Carbs raise blood sugar; protein/fat/fiber can slow rise; plate method | "Adding protein, vegetables, or fiber can lower the blood-sugar impact of a carb-heavy meal." | Exact spike size, treatment plan, personalized carb target | HIGH |
| Shukla et al. 2023 | Protein/nonstarchy vegetables before carbs is feasible in adults with prediabetes | "If practical, eat protein or nonstarchy vegetables before concentrated carbs." | Guaranteed A1C reduction or universal spike reduction | MEDIUM |
```

### Pattern 3: Deterministic A1C Routing Before Model Guidance

**What:** A1C controls scope and conservative calibration before the model classifies food.

**When to use:** Always. Later code should not ask the model to decide whether `6.5` is in scope.

**Example:**

```typescript
type A1CBand =
  | "below_prediabetes_range"
  | "prediabetes_57_59"
  | "prediabetes_60_62"
  | "prediabetes_63_64"
  | "diabetes_range_out_of_scope";

export function getA1CBand(a1c: number): A1CBand {
  if (a1c < 5.7) return "below_prediabetes_range";
  if (a1c < 6.0) return "prediabetes_57_59";
  if (a1c < 6.3) return "prediabetes_60_62";
  if (a1c < 6.5) return "prediabetes_63_64";
  return "diabetes_range_out_of_scope";
}
```

### Pattern 4: Conservative Floors For Uncertainty

**What:** The safety spec defines minimum result floors before generation: uncertain or borderline cases cannot return SAFE.

**When to use:** Ambiguous foods, restaurant combos with missing details, carb-heavy items, mixed meals with unclear portions, and upper-band A1C.

**Example:**

```markdown
| Scenario | Minimum Classification | Required Behavior |
|----------|------------------------|-------------------|
| Non-food input | None | Refuse classification and show concrete food examples. |
| Ambiguous food | Clarify or MODERATE | Ask at most one clarifying question; do not invent details. |
| Carb-only meal | MODERATE | Recommend adding protein or nonstarchy vegetables; no impossible sequencing. |
| A1C 6.3-6.4 plus uncertain carb-containing meal | MODERATE | Do not return SAFE unless the food is clearly low-impact. |
| Sugary drink or refined dessert | HIGH | Qualitative reason, one adjustment, one swap. |
```

### Anti-Patterns To Avoid

- **Disclaimer-as-shield:** A disclaimer does not make disease treatment, reversal, diagnosis, or prediction language safe.
- **Prompt-only policy:** If the rule exists only in the prompt, UI and launch copy will drift.
- **App-agent reversal:** "Revora helps reverse prediabetes" still implies the product is a disease outcome mechanism; ban it for the MVP.
- **Exact pseudo-science:** Do not generate exact GI, GL, mg/dL spike, or future A1C numbers from text-only user input.
- **Diagnosing out-of-range users:** For `6.5+`, say the value is in the range used for diabetes and direct to clinician guidance; do not say the user has Type 2 diabetes.
- **Over-reassuring SAFE:** SAFE should feel permission-first, but uncertainty or upper-band A1C should move borderline cases to MODERATE.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| A1C diagnostic ranges | Custom thresholds or "normal-ish" language | CDC/NIDDK/ADA-aligned bands | Thresholds are clinical reference ranges and must stay current. |
| Claims policy | Ad hoc wording by task | Approved claims boundary and copy ledger | Regulatory risk comes from total net impression across copy. |
| Evidence interpretation | Broad claims from isolated studies | Evidence registry with allowed-use limits | Small studies can support qualitative guidance without supporting clinical outcome promises. |
| GI/GL scoring | LLM-invented exact GI/GL numbers | Qualitative glycemic-impact rubric | Exact scoring needs portion and validated database infrastructure outside MVP scope. |
| Borderline handling | Model "common sense" | Deterministic conservative floors | Harmful SAFE classifications are the launch-blocking risk. |
| Copy QA | Memory and manual review only | Static banned-claim checker plus manual approval | Banned terms should fail before launch artifacts are posted. |

**Key insight:** The hard part is not writing a friendly disclaimer. The hard part is making every future prompt, card, CTA, FAQ, and launch post inherit the same allowed-claims boundary.

## Common Pitfalls

### Pitfall 1: The Disclaimer Contradicts The Body Copy

**What goes wrong:** The footer says informational-only, while the main result says the food will prevent diabetes, reverse prediabetes, lower A1C, or is medically safe.

**Why it happens:** Product copy tends to optimize for confidence and conversion; health-adjacent copy then drifts beyond evidence.

**How to avoid:** Put banned claims in a lintable list and require every active copy string to appear in `docs/safety/copy-ledger.md` with approval status.

**Warning signs:** "Revora reverses", "will lower", "safe for your condition", "personalized treatment", "clinically proven", "doctor recommended."

### Pitfall 2: Out-Of-Range A1C Becomes A Normal Result

**What goes wrong:** `5.6` or `6.5` receives SAFE/MODERATE/HIGH, making Revora look broader than the prediabetes-only wedge.

**Why it happens:** A1C validation is treated as UI polish instead of product scope.

**How to avoid:** Define out-of-range as a separate response kind. The model should not classify food for those values.

**Warning signs:** Tests or prompts ask the model to "adjust advice" for `6.5+` instead of short-circuiting.

### Pitfall 3: A1C Bands Imply Precision The Product Does Not Have

**What goes wrong:** The system treats `6.1` vs `6.2` as a precise personalized physiology model.

**Why it happens:** A1C is easy to quantify, but meal response depends on portion, context, medications, activity, sleep, and individual variation.

**How to avoid:** Use only three broad bands and qualitative changes in conservatism. Never forecast exact glucose or A1C.

**Warning signs:** The rubric says "6.4 adds 15 mg/dL" or "your A1C will drop to 5.8."

### Pitfall 4: Evidence Sources Become Overclaim Fuel

**What goes wrong:** A sequencing study becomes "this reduces your spike by 30%" on every result, or CDC DPP becomes "Revora helps reverse prediabetes."

**Why it happens:** Teams collapse population-level or small-study findings into product-specific guarantees.

**How to avoid:** Each source needs an "Allowed Use" and "Do Not Claim" row. Prefer "may help reduce blood-sugar impact" over exact universal claims.

**Warning signs:** Result copy includes precise percentages or clinical outcome claims without matching Revora-specific data.

### Pitfall 5: SAFE Tone Still Creates Food Anxiety

**What goes wrong:** SAFE cards include warnings and swaps, making users feel every food needs correction.

**Why it happens:** Risk rubrics over-optimize caution and forget the permission-first product job.

**How to avoid:** SAFE copy should lead with reassurance, include one reason, include the disclaimer, and omit swaps unless the user asked for alternatives.

**Warning signs:** SAFE results say "but avoid this often", "try swapping anyway", or use moralized labels like bad, cheat, clean, dangerous, or guilt-free.

## Code Examples

Verified patterns from official and project sources:

### Claims Boundary Lint Seed

```javascript
// Source: FTC Health Products Compliance Guidance and FDA General Wellness guidance.
// Phase 1 should tune this list against the approved copy ledger before launch.
const bannedPatterns = [
  /\bdiagnos(e|is|tic)\b/i,
  /\btreat(s|ment|ing)?\b/i,
  /\bprevent(s|ion|ing)?\b/i,
  /\bcure(s|d|ing)?\b/i,
  /\brevers(e|es|ed|ing|al)\b/i,
  /\bwill lower your A1C\b/i,
  /\bfuture A1C\b/i,
  /\bglucose curve\b/i,
  /\b\d+(\.\d+)?\s*(mg\/dL|GI|GL)\b/i,
  /\bclinically proven\b/i,
  /\bFDA[- ]?(approved|cleared)\b/i,
];
```

### A1C Routing Contract

```typescript
// Source: CDC and NIDDK A1C ranges. These are scope routes, not diagnoses.
export const a1cBandPolicy = [
  {
    id: "below_prediabetes_range",
    min: Number.NEGATIVE_INFINITY,
    maxExclusive: 5.7,
    responseKind: "out_of_scope_below",
    copy:
      "Revora is designed for people using the prediabetes A1C range of 5.7% to 6.4%. This value is below that range, so we should not classify this meal for prediabetes guidance.",
  },
  {
    id: "prediabetes_57_59",
    min: 5.7,
    maxExclusive: 6.0,
    responseKind: "in_scope",
    conservativeLevel: "standard",
  },
  {
    id: "prediabetes_60_62",
    min: 6.0,
    maxExclusive: 6.3,
    responseKind: "in_scope",
    conservativeLevel: "elevated",
  },
  {
    id: "prediabetes_63_64",
    min: 6.3,
    maxExclusive: 6.5,
    responseKind: "in_scope",
    conservativeLevel: "high",
  },
  {
    id: "diabetes_range_out_of_scope",
    min: 6.5,
    maxExclusive: Number.POSITIVE_INFINITY,
    responseKind: "out_of_scope_high",
    copy:
      "This A1C value is in the range clinicians use for diabetes. Revora is prediabetes-only, so please work with a doctor or registered dietitian for guidance.",
  },
] as const;
```

### Evidence Registry Entry

```json
{
  "id": "cdc-meal-planning-2024",
  "source": "CDC Diabetes Meal Planning",
  "supports": [
    "carbohydrates raise blood sugar",
    "protein, fat, and fiber can slow how quickly blood sugar rises",
    "plate method balances nonstarchy vegetables, lean protein, and carb foods"
  ],
  "allowedCopy": "Adding protein, nonstarchy vegetables, or fiber can lower the blood-sugar impact of a carb-heavy meal.",
  "doNotClaim": [
    "exact glucose spike reduction",
    "personalized treatment plan",
    "guaranteed A1C improvement"
  ],
  "confidence": "HIGH"
}
```

## State Of The Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Treat the system prompt as the product logic | Treat the safety contract as the source of truth, then generate prompt/code from it | Current project roadmap, 2026-05-04 | Prevents prompt, UI, and launch copy from diverging. |
| "Revora gives clarity to reverse prediabetes" brand language | MVP copy excludes reversal entirely | Phase 1 requirements, 2026-05-04 | Resolve conflict with older brand docs before launch copy exists. |
| GPT-4o prompt draft in design doc | Future stack research recommends OpenAI Responses API with structured outputs and `gpt-5.4-mini` | Project research, 2026-05-04 | Phase 1 should specify model-agnostic policy; Phase 2 chooses model implementation. |
| Vercel KV assumptions for rate limiting | Vercel Marketplace/Upstash-backed storage if needed | Project stack/architecture research, 2026-05-04 | Not Phase 1 work, but avoid writing launch copy or docs that assume old KV behavior. |
| Exact A1C or glucose prediction | Qualitative banding and source-backed guidance | PRD amendments and Phase 1 requirements | Future-A1C and glucose-curve predictions are banned. |

**Deprecated/outdated:**

- Full-product scanner, auth, database, payment, CGM, and clinical report assumptions are not MVP planning inputs for this phase.
- Any active copy that says or implies Revora reverses, treats, prevents, cures, diagnoses, predicts A1C, predicts glucose curves, or gives medical advice must be removed from the MVP copy set.

## Open Questions

1. **Should a legal/compliance reviewer approve the Phase 1 claims boundary before public launch?**
   - What we know: FDA/FTC guidance makes claim wording material, and older local docs contain risky reversal language.
   - What's unclear: Whether the founder wants outside review before the first community post or only before broader launch.
   - Recommendation: Plan Phase 1 so an outside reviewer can review one compact `claims-boundary.md` and `copy-ledger.md` without reading the whole repo.

2. **How literal should the `6.5+` copy be about Type 2 diabetes?**
   - What we know: Requirements say "Type 2 diabetes range"; CDC/NIDDK official pages say "diabetes: 6.5% or above" and NIDDK says diagnosis requires confirmation.
   - What's unclear: Whether to say "Type 2 diabetes range" or softer "range clinicians use for diabetes."
   - Recommendation: Use "range clinicians use for diabetes" in user-facing copy unless the founder explicitly approves "Type 2 diabetes range"; never say "you have diabetes."

3. **Should exact percentages from sequencing studies appear in results?**
   - What we know: Shukla/Imai support food-order guidance but include small samples, specific meals, and/or limited populations.
   - What's unclear: Whether launch copy needs a source note that mentions approximate study findings.
   - Recommendation: Result copy should stay qualitative. Put study details in evidence notes or FAQ, not in per-result claims.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected yet. Use a Wave 0 Node.js static validation script with no runtime dependencies. |
| Config file | none - see Wave 0 |
| Quick run command | `node scripts/validate-safety-contract.mjs` |
| Full suite command | `node scripts/validate-safety-contract.mjs` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| CLAIM-01 | Active product, prompt, result, and launch copy appears in the copy ledger and maps to an allowed claim class. | static contract | `node scripts/validate-safety-contract.mjs --require-copy-ledger` | No - Wave 0 |
| CLAIM-02 | Banned diagnosis/treatment/prevention/cure/reversal language is absent from active MVP copy. | static lint | `node scripts/validate-safety-contract.mjs --forbidden-claims` | No - Wave 0 |
| CLAIM-03 | Future A1C, glucose curve, exact spike, and exact prediction language is absent from active MVP copy. | static lint | `node scripts/validate-safety-contract.mjs --forbidden-predictions` | No - Wave 0 |
| CLAIM-04 | Evidence-backed guidance entries include source, allowed use, do-not-claim, and confidence. | schema/static | `node scripts/validate-safety-contract.mjs --evidence-pack` | No - Wave 0 |
| INPUT-04 | Below-5.7 A1C route exists and is out-of-scope, not SAFE/MODERATE/HIGH. | fixture/static | `node scripts/validate-safety-contract.mjs --a1c-routes` | No - Wave 0 |
| INPUT-05 | 6.5+ A1C route exists and directs to clinician/RD guidance without diagnosing. | fixture/static | `node scripts/validate-safety-contract.mjs --a1c-routes` | No - Wave 0 |
| GUIDE-02 | Required bands `5.7-5.9`, `6.0-6.2`, `6.3-6.4` are present with increasing conservative levels. | fixture/static | `node scripts/validate-safety-contract.mjs --a1c-routes` | No - Wave 0 |
| GUIDE-07 | Active result copy uses qualitative glycemic-impact language and no exact GI/GL/glucose numbers. | static lint | `node scripts/validate-safety-contract.mjs --qualitative-only` | No - Wave 0 |
| GUARD-04 | Uncertain and borderline fixtures have conservative minimum behavior. | fixture/static | `node scripts/validate-safety-contract.mjs --uncertainty-policy` | No - Wave 0 |

### Sampling Rate

- **Per task commit:** `node scripts/validate-safety-contract.mjs`
- **Per wave merge:** `node scripts/validate-safety-contract.mjs`
- **Phase gate:** Safety contract docs exist, static validation passes, and manual review confirms all active MVP copy is approved.

### Wave 0 Gaps

- [ ] `docs/safety/claims-boundary.md` - covers CLAIM-01, CLAIM-02, CLAIM-03.
- [ ] `docs/safety/evidence-pack.md` - covers CLAIM-04 and GUIDE-07.
- [ ] `docs/safety/a1c-band-rubric.md` - covers INPUT-04, INPUT-05, GUIDE-02.
- [ ] `docs/safety/tone-uncertainty-policy.md` - covers GUARD-04 and permission-first tone.
- [ ] `docs/safety/copy-ledger.md` - active copy inventory for product, prompt, result, and launch text.
- [ ] `tests/fixtures/safety-contract.json` - machine-readable examples for A1C routes, banned copy, and uncertainty floors.
- [ ] `scripts/validate-safety-contract.mjs` - dependency-free static validator.
- [ ] Framework install: none for Phase 1; use Node.js built-ins and `rg`.

## Sources

### Primary (HIGH confidence)

- Local project: `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/PROJECT.md` - current Phase 1 scope, requirements, and MVP constraints.
- Local project research: `.planning/research/SUMMARY.md`, `ARCHITECTURE.md`, `FEATURES.md`, `PITFALLS.md`, `STACK.md` - existing stack and safety-risk context.
- FDA, General Wellness: Policy for Low Risk Devices, issued January 6, 2026 - checked software/general wellness boundary and diagnosis/treatment/prevention/cure language: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices and https://www.fda.gov/media/90652/download
- FTC, Health Products Compliance Guidance, December 2022 - checked substantiation expectations and disclaimer limitations for health claims: https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance
- CDC, A1C Test for Diabetes and Prediabetes, May 15, 2024 - checked A1C ranges and clinician-goal framing: https://www.cdc.gov/diabetes/diabetes-testing/prediabetes-a1c-test.html
- NIDDK, The A1C Test & Diabetes - checked confirmation caveat, A1C range table, and greater risk at higher A1C within prediabetes range: https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test
- CDC, Diabetes Meal Planning, May 15, 2024 - checked carb/protein/fat/fiber and plate-method guidance: https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html
- CDC, Choosing Healthy Carbs, May 15, 2024 - checked simple/refined/complex carb framing and protein pairing guidance: https://www.cdc.gov/diabetes/healthy-eating/choosing-healthy-carbs.html
- CDC, Fiber: The Carb That Helps You Manage Diabetes, May 15, 2024 - checked qualitative fiber/blood-sugar support: https://www.cdc.gov/diabetes/healthy-eating/fiber-helps-diabetes.html

### Secondary (MEDIUM confidence)

- ADA, Standards of Care in Diabetes - 2026 press release, December 8, 2025 - verified 2026 Standards are current but article access was restricted via Diabetes Journals: https://diabetes.org/newsroom/press-releases/american-diabetes-association-releases-standards-care-diabetes-2026
- Shukla et al., "A Randomized Controlled Pilot Study of the Food Order Behavioral Intervention in Prediabetes," Nutrients 2023 - supports carbohydrate-last food-order feasibility in adults with prediabetes, but not strong A1C outcome claims: https://www.mdpi.com/2072-6643/15/20/4452
- Imai et al., "Eating Vegetables First Regardless of Eating Speed...," Nutrients 2023 - supports vegetables-first/carbohydrate-last reducing postprandial glucose/insulin in a controlled small study, but not universal exact claims: https://www.mdpi.com/2072-6643/15/5/1174

### Tertiary (LOW confidence)

- None used as authoritative support. Reddit and competitor claims were not used for Phase 1 safety policy.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Phase is a docs/spec contract with no app code present; local repo and GSD research strongly support this.
- Architecture: HIGH - Safety-contract-first pattern directly addresses roadmap ordering and known claims-drift risks.
- A1C routing: HIGH - CDC and NIDDK align on ranges; three sub-bands are product-specific but grounded in required scope.
- Claims/regulatory interpretation: MEDIUM - Official FDA/FTC sources are clear on risk categories, but this is not legal advice and should be reviewable by counsel if launch scope grows.
- Nutrition/evidence guidance: MEDIUM - CDC basics are high confidence; food-order evidence is promising but limited, so result copy must stay qualitative.

**Research date:** 2026-05-04
**Valid until:** 2026-06-03 for claims/regulatory assumptions; A1C range and nutrition basics should be rechecked before public launch if launch slips materially.
