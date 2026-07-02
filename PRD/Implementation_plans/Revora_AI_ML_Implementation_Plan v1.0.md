> **Superseded for sequencing/positioning by `docs/implementation-plan-to-play.md` (coach-first, 2026-06-30).** Retained for reference; camera/CGM/BAI work is deferred.

<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# Revora AI/ML Implementation Plan v1.1

**Document:** Revora AI/ML Implementation Plan v1.1  
**Date:** 2026-03-15  
**Phase:** Pre-development  
**Status:** ACTIVE  
**Owner:** Person A (Backend/AI/DevOps)  
**Parent Document:** Revora Master Implementation Plan v1.1  
**Next review:** 2026-03-20

### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Fixed: CONFLICT-4 — Replaced discrete A1C algorithm with exact Spec §4.2.5 continuous daily-change formula
- Fixed: CONFLICT-5 — Changed complexity categories MODERATE→COMPLEX_B, COMPLEX→COMPLEX_C throughout
- Fixed: CONFLICT-6 — Changed GL range from ±3/±5 to ±20%/±35% per Spec §4.2.4
- Fixed: CONFLICT-3 — Reduced safety floor categories from 8 to 6 per PRD §6.2, corrected GL values
- Updated: AMBIGUITY-1 — Complexity classification uses visual-characteristics definitions per Spec §4.2.2
- Updated: AMBIGUITY-5 — A1C endpoint path corrected to POST /api/v1/a1c
- Removed: SCOPE-1 — Potatoes and Candy safety floor categories (not in PRD, moved to V1.1 backlog)

---

## DOMAIN MISSION

**What This Domain Owns:**
- OpenAI GPT-4o integration and prompt engineering
- Meal complexity classification (SIMPLE/COMPLEX_B/COMPLEX_C per Spec §4.2.2)
- Safety floor overrides (6 food categories with minimum GL values per PRD §6.2)
- Conservative bias correction (MEDIUM: ×1.10, LOW: ×1.20)
- Confidence scoring logic (HIGH/MEDIUM/LOW)
- Glycemic load estimation accuracy validation (VAL-001: ≥85% spike risk accuracy)
- AI cost optimization (target: ≤$0.05/scan blended, CON-001)

**Why It Matters:**
- **User Safety:** Underestimating GL on high-risk foods (white rice, pasta, bread) can cause dangerous [REVIEW NEEDED: Replace restriction-framing with permission-first language] blood sugar spikes. Safety floors + conservative bias provide protective guardrails.
- **Medical Credibility:** ≥85% accuracy threshold (VAL-001) establishes trust. Confidence scoring signals uncertainty transparently.
- **Unit Economics:** AI cost is the primary variable expense. Optimizing prompts + caching determines long-term profitability.
- **Launch Gate:** Week 14 accuracy validation is a non-negotiable GO/NO-GO gate. Failure blocks App Store submission.

---

## PHASE-BY-PHASE TASKS

### Phase 0: Foundation (Weeks 1-2)

#### Week 1: OpenAI DPA + Prerequisites
**Primary Deliverable:** OpenAI Data Processing Agreement executed (BLK-002 resolved)

**Tasks:**
- **AI-001:** OpenAI DPA execution (LEGAL BLOCKER — 30 min)
  - Navigate to OpenAI console → Settings → Data Processing Agreement
  - Sign DPA (GDPR Article 28 compliance for EU users)
  - Screenshot confirmation, store in `docs/legal/OpenAI_DPA_2026-03-07.png`
  - **Blocker resolution:** BLK-002 DONE — can now send user photos to OpenAI API
  
- **AI-002:** OpenAI API key generation + environment setup (1 hour)
  - Create production API key in OpenAI console (rate limit: Tier 2 minimum for reliability)
  - Store in Railway.app secrets: `OPENAI_API_KEY`
  - Document key rotation policy: 90-day rotation, stored in 1Password vault
  
- **AI-003:** Cost tracking infrastructure (2 hours)
  - PostHog custom event: `ai_scan_cost` (fields: `cost_usd`, `model`, `tokens_input`, `tokens_output`, `cache_hit`)
  - Dashboard query: Daily blended $/scan average (last 7 days rolling)
  - Alert: Slack notification if daily cost >$0.08/scan (circuit breaker threshold per RSK-004)

**Acceptance Criteria:**
- OpenAI DPA screenshot stored in repo
- API key environment variable live in Railway staging
- PostHog cost event firing on test API call (dummy scan)

**Dependencies Produced:**
- **DEP-008:** OpenAI DPA executed → Backend can begin OpenAI API integration Week 2

---

#### Week 2: OpenAI Integration + Master Prompt v1
**Primary Deliverable:** OpenAI API integration complete + master prompt v1 producing structured JSON (DEP-002 partial)

**Tasks:**
- **AI-004:** OpenAI Rust SDK integration (4 hours)
  - Add `async-openai` crate to `backend/Cargo.toml`
  - Create `services/openai_client.rs` with retry logic (3 retries, exponential backoff)
  - Handle API errors: rate limits (429), server errors (5xx), model unavailable
  - Log all API calls with request ID for debugging
  
- **AI-005:** Master Prompt v1 structure (6 hours)
  - **System role:** "You are a glycemic load estimation assistant for prediabetic users..."
  - **Output format:** Strict JSON schema (食品項目 array, totalGL, complexity, confidence)
  - **Few-shot examples:** 3 examples (simple meal, moderate meal, complex meal with uncertainty)
  - **Safety instructions:** "When uncertain, overestimate GL. Never underestimate high-carb foods."
  - Document in `docs/prompts/MASTER_PROMPT_v1.md` with version control
  
- **AI-006:** Complexity classifier implementation (4 hours)
  - **SIMPLE:** Single food item or clearly separated items on a plate (e.g., grilled chicken + rice + salad)
  - **COMPLEX_B:** Mixed dish where main ingredients are partially visible (e.g., pasta with sauce, stir-fry)
  - **COMPLEX_C:** Opaque dish where ingredients cannot be determined visually (e.g., curry, soup, casserole)
  - Classification uses visual characteristics per Spec §4.2.2, NOT item count
  - Rust function: `classify_complexity(image_analysis: &ImageAnalysis) -> Complexity`
  - Unit tests: 10 test cases covering edge cases
  
- **AI-007:** GPT-4o API call implementation (4 hours)
  - Model: `gpt-4o` (vision-capable, as of 2024 most accurate for food recognition)
  - Temperature: 0.3 (balance between creativity and consistency)
  - Max tokens: 1500 (sufficient for 10-item meal JSON response)
  - Image encoding: Base64 JPEG (resize to 1024px max dimension, quality 85%)
  - Parse JSON response with error handling (fallback to COMPLEX_C + LOW confidence if parse fails)

**Mock API Response (for Frontend — DEP-002):**
{
  "scanId": "scan_abc123",
  "timestamp": "2026-03-07T12:00:00Z",
  "foods": [
    {
      "name": "White rice",
      "portionSize": "1.5 cups",
      "glycemicLoad": 30,
      "confidence": "HIGH",
      "category": "grains"
    },
    {
      "name": "Grilled chicken breast",
      "portionSize": "6 oz",
      "glycemicLoad": 0,
      "confidence": "HIGH",
      "category": "protein"
    }
  ],
  "totalGL": 30,
  "complexity": "SIMPLE",
  "overallConfidence": "HIGH",
  "fromCache": false
}

**Acceptance Criteria:**
- OpenAI API call succeeds with test image (returns valid JSON)
- Complexity classifier correctly categorizes 10 test meals
- Mock API response JSON delivered to Person B (enables Week 5 frontend UI work)
- Cost per test scan logged in PostHog (<$0.10 for Week 2 testing, will optimize Week 3+)

**Dependencies Produced:**
- **DEP-002 (partial):** Mock scan API response schema → Frontend can build UI Week 5

**Risks Monitored:**
- **RSK-002:** If initial accuracy appears low (<70% on informal testing), flag immediately for prompt iteration

---

### Phase 1: Core Features (Weeks 3-8)

#### Week 3: Safety Floors + Response Validation
**Primary Deliverable:** Safety floor overrides implemented for 6 food categories per PRD §6.2 (BLK-010 progress, DEP-003 partial)

**Tasks:**
- **AI-008:** Safety floor override system (8 hours)
  - **6 Protected Categories (per PRD §6.2 — exact values):**
    1. **White rice (1 cup):** Min GL 20 (high glycemic index, commonly underestimated)
    2. **Pasta (1 cup):** Min GL 18 (refined carbs, sticky texture confuses AI)
    3. **White bread (2 slices):** Min GL 16 (processed wheat, rapid absorption)
    4. **Fruit juice (8oz):** Min GL 15 (fructose concentration, no pulp)
    5. **Sweetened beverage:** Min GL 20 (liquid carbs, instant spike)
    6. **Baked goods (muffin/cookie):** Min GL 15 (sugar + refined flour combo)
  
  > **Note:** Safety floors are MINIMUM GL thresholds regardless of detected portion size.
  > If AI estimates higher GL than floor, AI estimate is used. Floors only override underestimates.
  > Potatoes and Candy categories deferred to V1.1 backlog (not in PRD §6.2).
  
  - **Matching Algorithm:** Levenshtein distance ≤2 (handles typos like "wite rice" → "white rice")
  - **Override Logic:** If AI estimate < safety floor → use floor value, downgrade confidence to LOW
  - **Logging:** Every override logged for accuracy analysis (PostHog event: `safety_floor_applied`)
  
- **AI-009:** Response validation layer (4 hours)
  - Validate all JSON fields present (`foods`, `totalGL`, `complexity`, `confidence`)
  - Validate `totalGL` = sum of individual food GLs (±2 GL tolerance for rounding)
  - Validate confidence values in `["HIGH", "MEDIUM", "LOW"]`
  - If validation fails → return error to user: "Unable to analyze meal, please retake photo"
  
- **AI-010:** Error handling + fallback logic (4 hours)
  - **OpenAI API failure:** Retry 3× with exponential backoff (1s, 2s, 4s)
  - **Persistent failure:** Return user-friendly error + Sentry alert for investigation
  - **Unparseable response:** Flag as COMPLEX_C + LOW confidence, log raw response for debugging
  - **Rate limit (429):** Queue request for retry after rate limit window (track in Redis)

**Acceptance Criteria:**
- 100 test scans with known high-GL foods → safety floors trigger correctly (VAL-009 partial — 6/6 categories tested)
- Response validation catches malformed JSON (test with 10 intentionally broken responses)
- Fallback logic tested: simulated API failure → user sees graceful error message

**Dependencies Produced:**
- **DEP-003 (partial):** Safety floors implemented → Week 14 VAL-001 accuracy validation can proceed

**Risks Monitored:**
- **RSK-014:** If safety floors trigger >50% of time → AI is systematically underestimating, requires prompt refinement

---

#### Week 4: Conservative Bias + Confidence Scoring
**Primary Deliverable:** Conservative bias correction + confidence scoring implemented (BLK-015 resolved, DEP-012 + DEP-015 resolved)

**Tasks:**
- **AI-011:** Conservative bias multipliers (6 hours)
  - **Bias Application:**
    - **HIGH confidence:** No adjustment (1.0× — AI is certain, trust estimate)
    - **MEDIUM confidence:** 1.10× multiplier (10% overestimation buffer)
    - **LOW confidence:** 1.20× multiplier (20% overestimation buffer)
  
  - **Implementation:** Apply multiplier AFTER safety floor check, BEFORE totalGL calculation
  - **Example:** AI estimates rice at 18 GL (MEDIUM confidence) → 18 × 1.10 = 19.8 → round to 20 GL
  
  - **Rationale:** Overestimation is safer than underestimation for prediabetic users (avoids dangerous [REVIEW NEEDED: Replace restriction-framing with permission-first language] spikes)
  
- **AI-012:** Confidence scoring algorithm (6 hours)
  - **HIGH confidence criteria (all must be true):**
    - Complexity = SIMPLE (≤3 items, all recognizable)
    - No safety floor overrides triggered
    - AI certainty score >0.85 (OpenAI internal confidence metric if available, else heuristic)
  
  - **MEDIUM confidence criteria:**
    - Complexity = COMPLEX_B (mixed dish, main ingredients partially visible)
    - 0-1 safety floor overrides
    - AI certainty 0.60-0.85
  
  - **LOW confidence criteria (any triggers LOW):**
    - Complexity = COMPLEX_C (opaque dish, ingredients not visually determinable)
    - ≥2 safety floor overrides triggered
    - AI certainty <0.60
    - Unusual food combinations (AI flags as uncertain)
  
  - **Rust implementation:** `calculate_confidence(foods: &[Food], complexity: Complexity, overrides: u8) -> Confidence`
  
- **AI-013:** GL range calculation for MEDIUM/LOW (4 hours) — per Spec §4.2.4
  - **HIGH confidence:** Display point estimate only (e.g., "30 GL"); `totalGlRange = null`
  - **MEDIUM confidence:** Display range ±20% (e.g., GL 30 → range 24-36); `totalGlRange = { low: gl*0.80, high: gl*1.20 }`
  - **LOW confidence:** Display range ±35% (e.g., GL 30 → range 19.5-40.5); `totalGlRange = { low: gl*0.65, high: gl*1.35 }`
  - **Implementation:** Add `totalGlRange: { low: number, high: number } | null` to API response
  - **Frontend handoff:** Person B uses this field to conditionally render range vs point estimate

**Acceptance Criteria:**
- 50 test scans with varying complexity → bias applied correctly (VAL-020 verification)
- Confidence scoring matches expected distribution: ~40% HIGH, ~35% MEDIUM, ~25% LOW (validate on test set)
- GL range calculation tested: HIGH returns null range, MEDIUM returns ±20% range, LOW returns ±35% range

**Dependencies Produced:**
- **DEP-012:** Conservative bias implemented → VAL-020 acceptance test can validate bias calculation Week 14
- **DEP-015:** Confidence scoring logic complete → Frontend can display GL ranges correctly Week 5

**Blockers Resolved:**
- **BLK-015:** Conservative bias correction implemented and tested

---

#### Week 5: Food Sequencing + Swap Generation
**Primary Deliverable:** Sequencing advice + swap suggestions generated (DEP-016 resolved)

**Tasks:**
- **AI-014:** Food sequencing logic (6 hours)
  - **Sequencing Rules (fiber-first strategy):**
    1. **Vegetables first** (fiber slows glucose absorption)
    2. **Protein + fats second** (further slows digestion)
    3. **Carbohydrates last** (minimizes spike when eaten after fiber/protein buffer)
  
  - **Implementation:**
    - Categorize each food: `category: "vegetable" | "protein" | "fat" | "carb" | "mixed"`
    - Generate advice: "Eat [vegetables] first, then [protein], then [carbs] to reduce spike"
    - Only show if meal contains ≥2 categories (otherwise sequencing irrelevant)
  
  - **Example Output:**
    "sequencingAdvice": {
      "recommended": ["Salad", "Chicken breast", "Rice"],
      "reasoning": "Eating vegetables first adds fiber buffer, slowing rice absorption"
    }
  
- **AI-015:** Swap suggestion generation (8 hours)
  - **Swap Rules:**
    - **High-GL carbs:** Suggest lower-GL alternatives
      - White rice (30 GL) → Brown rice (20 GL) or Cauliflower rice (3 GL)
      - White bread (10 GL) → Whole grain bread (7 GL)
      - Pasta (25 GL) → Zucchini noodles (3 GL) or Whole wheat pasta (18 GL)
    - **Sugary items:** Suggest unsweetened versions
      - Sweetened yogurt (15 GL) → Plain Greek yogurt (5 GL) + berries
      - Fruit juice (12 GL) → Whole fruit (8 GL) with fiber intact
  
  - **Filtering:** Respect dietary restrictions (user profile: vegetarian, vegan, gluten-free, etc.)
  - **Limit:** Max 3 swaps per scan (avoid overwhelming user)
  
  - **Example Output:**
    "swapSuggestions": [
      {
        "original": "White rice (30 GL)",
        "alternative": "Brown rice (20 GL)",
        "glReduction": 10,
        "reasoning": "More fiber, slower digestion"
      }
    ]
  
- **AI-016:** Dietary restriction filtering (4 hours)
  - Load user dietary profile from database (`user.dietary_restrictions: string[]`)
  - Filter swaps: vegetarian excludes meat, vegan excludes all animal products, gluten-free excludes wheat
  - **Edge case:** If no valid swaps after filtering → return empty array (frontend shows "No swaps available for your dietary needs")

**Acceptance Criteria:**
- 30 test scans with diverse meals → sequencing advice generated correctly (only when ≥2 food categories)
- Swap suggestions generated for high-GL meals → verified ≥1 swap per high-GL food
- Dietary restriction filtering tested: vegetarian user sees no meat swaps, gluten-free user sees no wheat swaps

**Dependencies Produced:**
- **DEP-016:** `sequencingAdvice` and `swapSuggestions` in API response → Frontend renders advice cards Week 7

---

#### Week 6-7: A1C Estimation Algorithm
**Primary Deliverable:** A1C estimation algorithm implemented (DEP-014 resolved)

**Tasks:**
- **AI-017:** A1C estimation formula implementation (8 hours — Week 7)
  - **Algorithm (EXACT formula from SPEC §4.2.5 / PRD §6.4 — SAFETY-CRITICAL):**
    ```rust
    fn estimate_a1c(baseline: f64, daily_gl_avgs: &[f64], gl_budget: f64) -> f64 {
        let avg_14d = daily_gl_avgs.iter().sum::<f64>() / daily_gl_avgs.len() as f64;
        let adherence = avg_14d / gl_budget;
        // 0.4 A1C points / 90 days = 0.00444/day at perfect adherence
        let daily_change = match adherence {
            a if a <= 0.75 => -0.00444,       // Excellent adherence
            a if a <= 1.0  => -0.00444 * 0.6,  // Good adherence
            a if a <= 1.25 => 0.0,              // Neutral
            _              => 0.00444 * 0.3,    // Worsening
        };
        (baseline + daily_change * daily_gl_avgs.len() as f64).clamp(4.0, 14.0)
    }
    ```
    - **Input:** Rolling 14-day average of daily GL totals + user's GL budget
    - **Adherence:** Ratio of avg daily GL to budget (NOT percentage of days under budget)
    - **Daily change rate:** 0.00444 = 0.4 A1C points / 90 days (continuous, not discrete tiers)
    - **Output clamped:** Physiological range [4.0, 14.0]
    - **Baseline A1C:** User's last manual A1C entry from `a1c_logs` table
  
  - **Rust implementation:** `estimate_a1c(baseline: f64, daily_gl_avgs: &[f64], gl_budget: f64) -> f64`
  - **API Output:** `{ estimatedA1c: f64, errorBound: 0.2, range: { low: f64, high: f64 }, basedOnDays: u8 }`
  - **Bounds:** ±0.2 A1C points on EVERY estimate — displayed on ALL UI screens per BLK-013
  
  > **Note:** A1C encryption (previously AI-018) is owned by Backend Plan (BE-053).
  > Manual A1C logging API (previously AI-019) is owned by Backend Plan (BE-052).
  > These tasks removed from AI/ML Plan to avoid duplication.

**Acceptance Criteria:**
- A1C estimation tested with 20 simulated user profiles (varying adherence rates) → estimates within expected ranges
- Manual A1C logging tested: valid entries accepted, out-of-range entries rejected (e.g., 15.0% returns 400 error)
- Encryption verified: raw database query shows encrypted A1C values (not plaintext)

**Dependencies Produced:**
- **DEP-014:** A1C estimation algorithm implemented → Frontend displays A1C progress Week 8

**Blockers Monitored:**
- **BLK-013:** A1C ±0.2 bounds displayed on ALL UI screens (shared responsibility with Frontend)

---

#### Week 8: Dry-Run Accuracy Test (Early Warning Signal)
**Primary Deliverable:** Dry-run accuracy test on 50-meal sample (RSK-002 / RSK-007 mitigation)

**Tasks:**
- **AI-020:** 50-meal validation set creation (4 hours)
  - Collect 50 diverse meal photos:
    - 20 simple meals (1-3 items, clear portions)
    - 20 COMPLEX_B meals (mixed dishes, partially visible ingredients)
    - 10 COMPLEX_C meals (opaque dishes, challenging recognition)
  - **Ground truth:** Manually calculate GL for each meal using USDA database
  - **Diversity:** Include 6 safety floor categories per PRD §6.2 (white rice, pasta, white bread, fruit juice, sweetened beverage, baked goods)
  
- **AI-021:** Accuracy test execution (6 hours)
  - Run 50 scans through production pipeline (OpenAI API + safety floors + bias correction)
  - Compare AI estimates vs ground truth:
    - **SAFE classification accuracy:** % of meals correctly classified as SAFE/CAUTION/HIGH
    - **GL estimation error:** Mean Absolute Error (MAE) in GL units
    - **Safety floor trigger rate:** % of scans where override applied
  
  - **Target (dry-run):** ≥75% SAFE classification accuracy (lower than final 85% gate, early signal only)
  
- **AI-022:** Results analysis + iteration plan (4 hours)
  - Document findings in `docs/accuracy/DRY_RUN_Week8_Results.md`
  - Identify failure modes: Which food types most often misclassified?
  - **If <75% accuracy:** Flag to Founder immediately, begin prompt iteration Weeks 9-12
  - **If ≥75% accuracy:** Continue as planned, minor prompt refinement Weeks 9-12

**Acceptance Criteria:**
- 50-meal test set documented with ground truth GL values
- Dry-run accuracy ≥75% SAFE classification (provides 6-week buffer to Week 14 final gate)
- Failure mode analysis completed: know which foods need prompt improvement

**Risks Mitigated:**
- **RSK-002 / RSK-007:** Dry-run provides early signal. If accuracy low, 6 weeks remain for prompt iteration before Week 14 gate.

---

### Phase 2: Value-Add (Weeks 9-12)

#### Weeks 9-12: Prompt Iteration + Cost Optimization
**Primary Deliverable:** Optimized master prompt v2-v4 + cost reduced to ≤$0.05/scan (CON-001 target)

**Tasks:**
- **AI-023:** Prompt iteration based on Week 8 findings (16 hours across Weeks 9-12)
  - **Iteration log:** Daily log in `docs/prompts/ITERATION_LOG.md` tracking:
    - Prompt version
    - Changes made (added examples, refined instructions, adjusted temperature)
    - Test set accuracy (50-meal set re-run after each change)
    - Cost per scan (track if changes increase token usage)
  
  - **Iteration strategy:**
    - Add few-shot examples for failure modes (e.g., if pasta consistently underestimated → add pasta examples)
    - Refine portion size estimation instructions (if portions wrong → add visual references like "fist-sized")
    - Adjust safety floor matching (if overrides miss edge cases → expand Levenshtein distance or add synonyms)
  
  - **Target:** Incremental improvement from 75% (Week 8) → 85%+ (Week 14) through systematic refinement
  
- **AI-024:** Cost optimization strategies (8 hours across Weeks 9-12)
  - **Strategy 1: Image compression**
    - Test JPEG quality levels: 85% → 75% → 65% (measure accuracy impact vs cost savings)
    - Test resize thresholds: 1024px → 768px (smaller images = fewer tokens)
    - **Target:** Reduce image tokens by 20-30% without accuracy loss
  
  - **Strategy 2: Prompt compression**
    - Remove redundant instructions (every word = tokens = cost)
    - Consolidate few-shot examples (3 examples may suffice instead of 5)
    - **Target:** Reduce prompt tokens by 10-15%
  
  - **Strategy 3: Cache optimization**
    - Monitor Redis cache hit rate (current Week 3-8, target ≥40% by Week 12)
    - Improve pHash matching: test perceptual hash distance thresholds (tighter = fewer false matches, looser = more cache hits)
    - **Target:** Increase cache hit rate from initial ~20% → 40%+ (per RSK-004 mitigation)
  
  - **Cost tracking:** Daily dashboard monitoring (PostHog query: 7-day rolling average $/scan)
  - **Circuit breaker:** If cost >$0.08/scan for 3 consecutive days → pause free tier signups, investigate immediately

**Acceptance Criteria:**
- Master prompt v2-v4 documented with iteration log (all changes tracked)
- Cost per scan reduced: Week 8 baseline (~$0.06-0.08) → Week 12 target (≤$0.05)
- Cache hit rate improved: Week 8 (~20%) → Week 12 (≥40%)

**Risks Monitored:**
- **RSK-004:** AI cost exceeds target → circuit breaker activated, free tier paused until optimized

---

#### AI-033: Scan Correction Review Process (Weeks 9-12)
**Primary Deliverable:** Weekly review of user-submitted corrections feeds into prompt iteration

**Tasks:**
- Review `scan_corrections` table entries weekly (every Monday)
- Categorize corrections: wrong_food, wrong_portion, missing_item, gl_too_high, gl_too_low
- For validated corrections:
  - Add to validation set (expand from 100 to 200+ meals by Month 2)
  - Identify prompt failure patterns (which food types most often misclassified)
  - Update safety floor matching if needed (expand Levenshtein distance or add synonyms)
- Document findings in `docs/prompts/CORRECTION_LOG.md`

**Acceptance Criteria:**
- Weekly correction review logged in CORRECTION_LOG.md
- Top 5 failure patterns identified by Week 12
- Validation set expanded with 20+ real user corrections by Week 14

**Hours:** 2h/week × 4 weeks = 8 hours total
**Dependencies Consumed:** BE-047 (corrections endpoint) must be live
**Dependencies Produced:** Improved validation set → higher Week 14 VAL-001 accuracy

---

#### AI-034: VAL-008 Dietary Restriction Compliance Test (Week 5)
**Primary Deliverable:** Verify 100% dietary restriction compliance in swap suggestions

**Tasks:**
- Create test set: 20 meals with dietary restrictions (5 vegetarian, 5 vegan, 5 gluten-free, 5 nut-free)
- Run each meal through swap generation pipeline with restrictions applied
- Verify: ZERO swaps violate dietary restrictions
- Document edge cases in `docs/accuracy/VAL-008_Results.md`

**Acceptance Criteria:**
- 100% compliance across all 20 test meals (zero tolerance per PRD §6.6)
- Edge cases documented (e.g., hidden dairy in processed foods)

**Hours:** 4 hours
**Blocks:** VAL-008 acceptance criterion

---

### Phase 3: Monetization + Beta (Weeks 13-14)

#### Week 13: Premium Feature Gating
**Primary Deliverable:** Server-side entitlement checks for advice cards (DEP-019 resolved)

**Tasks:**
- **AI-025:** Advice card entitlement enforcement (4 hours)
  - Check user subscription tier before generating advice cards
  - **Free tier:** Return `null` for `sequencingAdvice` and `swapSuggestions` in API response
  - **Premium tier:** Generate full advice cards (sequencing + swaps + post-meal walk suggestions)
  - **Implementation:** `if user.subscription_tier == "free" { advice_cards = None } else { /* generate advice */ }`
  - **Security:** Never trust client-side entitlement checks (SEC-009 — server enforces truth)
  
- **AI-026:** RevenueCat entitlement verification (2 hours)
  - Call RevenueCat API to verify subscription status before scan processing
  - Cache entitlements for 60 seconds (reduce API calls, balance freshness)
  - Handle edge cases: grace period (brief window after payment failure), restore purchases

**Acceptance Criteria:**
- Free tier users receive scan results WITHOUT advice cards (verified with test account)
- Premium users receive full advice cards (verified with test premium account)
- RevenueCat entitlement check integrated (tested with sandbox subscription)

**Dependencies Produced:**
- **DEP-019:** Server-side entitlement check → VAL-027 acceptance test validates premium feature gating Week 14

---

#### Week 14: Final Accuracy Validation (LAUNCH GATE)
**Primary Deliverable:** VAL-001 accuracy ≥85% on 100-meal validation set (BLK-001 resolved — GO/NO-GO to submission)

**Tasks:**
- **AI-027:** 100-meal final validation set (6 hours)
  - Expand Week 8 dry-run set: 50 existing + 50 new meals = 100 total
  - **Diversity requirements:**
    - 30 simple, 40 COMPLEX_B, 30 COMPLEX_C meals
    - All 6 safety floor categories represented (≥5 scans per category)
    - Include edge cases: large portions, mixed cuisines, challenging lighting
  - **Ground truth:** Double-checked GL calculations (Person A + Founder verification)
  
- **AI-028:** VAL-001 accuracy test execution (8 hours)
  - Run 100 scans through production pipeline (final master prompt version)
  - **Metrics:**
    - **Primary (GATE):** SAFE classification accuracy ≥85% (% of meals correctly categorized as SAFE/CAUTION/HIGH)
    - **Secondary:** GL estimation MAE ≤8 GL units (mean absolute error)
    - **Safety:** Zero false SAFE classifications for HIGH-GL meals (no dangerous [REVIEW NEEDED: Replace restriction-framing with permission-first language] underestimations)
  
  - **Results documentation:** `docs/accuracy/VAL-001_Final_Results.md` with:
    - Overall accuracy percentage
    - Breakdown by complexity (SIMPLE/COMPLEX_B/COMPLEX_C accuracy)
    - Breakdown by safety floor category (6 categories)
    - Failure case analysis (document all misclassifications)
  
- **AI-029:** GO/NO-GO decision (2 hours)
  - **GO criteria (all must pass):**
    - ✅ SAFE classification accuracy ≥85%
    - ✅ Zero false SAFE on HIGH-GL meals (safety critical)
    - ✅ Cost per scan ≤$0.05 (CON-001 target met)
    - ✅ BLK-010 resolved (100% safety floor coverage across 6 categories)
  
  - **NO-GO criteria (any triggers NO-GO):**
    - ❌ Accuracy <85% → **BLOCK LAUNCH**, iterate prompts Week 15-16, retest
    - ❌ False SAFE on HIGH-GL meals → **SAFETY BLOCKER**, refine safety floors immediately
    - ❌ Cost >$0.08/scan sustained → **UNIT ECONOMICS FAIL**, cannot scale profitably
  
  - **Decision:** Document in `docs/gates/Week14_GO_NO_GO_Decision.md`, escalate to Founder if NO-GO

**Acceptance Criteria:**
- 100-meal validation set complete with verified ground truth
- **VAL-001 GATE PASSED:** ≥85% SAFE classification accuracy (primary launch gate)
- Zero false SAFE classifications (safety validation)
- Cost per scan ≤$0.05 (economic validation)

**Blockers Resolved:**
- **BLK-001:** VAL-001 accuracy gate passed — App Store submission unblocked
- **BLK-010:** Safety floor coverage 100% validated across 6 categories

**Gate Status:**
- **CRITICAL GO/NO-GO GATE:** If VAL-001 fails → launch delayed, prompt iteration continues

---

### Phase 4: Launch (Week 15)

#### Week 15: Production Monitoring + Hotfix Readiness
**Primary Deliverable:** AI production monitoring dashboard live + hotfix protocol documented

**Tasks:**
- **AI-030:** Production AI monitoring (4 hours)
  - **Real-time dashboards (PostHog + Sentry):**
    - AI scan cost per hour (alert if >$10/hour spike)
    - Cache hit rate (alert if <30% for 6 hours)
    - API error rate (alert if >5% errors)
    - Safety floor trigger rate (alert if >60% — indicates systematic underestimation)
  
  - **Daily reports:** Slack bot posts daily AI metrics summary (cost, cache, errors, accuracy trends)
  
- **AI-031:** Hotfix protocol for accuracy issues (2 hours)
  - **Scenario:** User reports dangerously low GL estimate for high-carb meal
  - **Protocol:**
    1. User provides scan photo + reported foods
    2. Person A manually calculates ground truth GL
    3. If underestimation confirmed → add to safety floor category immediately (hotfix deploy <1 hour)
    4. Post-mortem: Why did safety floor miss? Update matching logic or add new category
  
  - **Escalation:** Critical safety issues (false SAFE on HIGH-GL meal) → emergency Slack alert to team
  
- **AI-032:** Post-launch prompt iteration plan (2 hours)
  - **Continuous improvement:** Weekly prompt review based on production data
  - **Feedback loop:** User-reported inaccuracies feed into validation set (expand from 100 → 200 meals by Month 2)
  - **A/B testing:** Test prompt variations on 10% traffic (e.g., different few-shot examples)

**Acceptance Criteria:**
- Production monitoring dashboard live in PostHog (all alerts configured)
- Hotfix protocol documented in `docs/runbooks/AI_Hotfix_Protocol.md`
- Post-launch iteration plan documented (weekly review cadence)

---

## CROSS-DOMAIN DEPENDENCIES

**Dependencies This Domain Produces:**

| Dep ID | What This Domain Delivers | Consuming Domain | Week | Why Critical |
|--------|---------------------------|------------------|------|--------------|
| **DEP-002** | Scan API response schema (camelCase JSON, all fields documented) | Frontend | W2 | Frontend cannot build UI without knowing response structure. Mock delivered Week 2, live backend Week 4. |
| **DEP-003** | Safety floors implemented (6 food categories per PRD §6.2, Levenshtein ≤2) | AI/ML (self) | W3 | Week 14 VAL-001 accuracy test depends on safety floors working correctly. |
| **DEP-008** | OpenAI DPA executed | Backend | W1 | **LEGAL BLOCKER** — cannot send user photos to OpenAI without DPA signed. |
| **DEP-012** | Conservative bias correction (MEDIUM: ×1.10, LOW: ×1.20) | QA | W4 | Week 14 VAL-020 acceptance test verifies bias calculation. Must be correct. |
| **DEP-015** | Confidence scoring logic (HIGH/MEDIUM/LOW) | Frontend | W4 | Frontend displays GL ranges based on confidence. Logic must be final Week 4. |
| **DEP-016** | `sequencingAdvice` + `swapSuggestions` in API response | Frontend | W5 | Frontend renders advice cards Week 7. API must include these fields. |
| **DEP-019** | Server-side entitlement check for advice cards | Backend | W13 | Free tier must NOT receive advice cards. Security-critical enforcement. |

**Dependencies This Domain Consumes:**

| Dep ID | What This Domain Needs | Producing Domain | Week | Blocker Impact |
|--------|------------------------|------------------|------|----------------|
| **DEP-001** | Auth endpoints live (JWT + refresh token) | Backend | W1 | AI can't associate scans with users without auth. Week 3+ blocked. |
| **DEP-009** | API field naming finalized (camelCase) | Backend | W1 | If naming changes Week 4+ → all AI response fields must be refactored. Lock early. |
| **DEP-020** | Camera architecture decision | DevOps | W2 | Doesn't directly block AI work, but camera must work for end-to-end testing Week 8. |

---

## DOMAIN-SPECIFIC BLOCKERS

**Blockers Owned by AI/ML Domain:**

| ID | Blocker | Target Week | Status | Notes |
|----|---------|-------------|--------|-------|
| **BLK-001** | VAL-001: ≥85% spike risk accuracy on 100-meal validation set | W14 | NOT STARTED | **CRITICAL GATE** — Launch blocker. If fail → delay App Store submission. |
| **BLK-002** | OpenAI DPA executed (Data Processing Agreement signed) | W1 | NOT STARTED | **LEGAL BLOCKER** — 30-min task, must complete Day 1. |
| **BLK-010** | Safety floor overrides tested for all 6 food categories (100% coverage) | W14 | NOT STARTED | **SAFETY CRITICAL** — Prevents underestimation of high-GL foods. |
| **BLK-015** | Conservative bias correction implemented (MEDIUM: ×1.10, LOW: ×1.20) | W4 | NOT STARTED | **SAFETY CRITICAL** — Ensures overestimation when uncertain. |

**Mitigation Status:**
- **BLK-001:** Week 8 dry-run provides 6-week early warning
- **BLK-002:** Scheduled Day 1, no dependencies
- **BLK-010:** Testing integrated into VAL-001 (Week 14)
- **BLK-015:** Implementation straightforward, unit tests cover edge cases

---

## DOMAIN-SPECIFIC RISKS

**Risks Owned by AI/ML Domain:**

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| **RSK-002** | OpenAI accuracy <85% at beta (VAL-001 gate fails) | MEDIUM | CRITICAL | **Week 8 dry-run** (50 meals, 75% target) provides early signal. 6 weeks to iterate prompts before Week 14 gate. |
| **RSK-004** | AI cost exceeds $0.05/scan blended (unit economics fail) | MEDIUM | HIGH | **Daily cost dashboard** tracks $/scan. **Circuit breaker at $0.08/scan:** pause free signups until optimized. Cache hit rate ≥40% target. |
| **RSK-007** | Beta accuracy validation fails Week 14 (<85%) | MEDIUM | CRITICAL | **Same as RSK-002** — dry-run Week 8 provides warning. Fallback: safety floors + bias ensure SAFE/HIGH boundary protected. |
| **RSK-014** | AI hallucination underestimates GL for white rice (false SAFE) | MEDIUM | HIGH | **Safety floor override:** White rice min 20 GL. Confidence downgrades to LOW when override applied. VAL-009 tests 100% coverage. |
| **RSK-015** | Free tier API cost unsustainable at scale (22.5K users × 75 scans/month × $0.02 = $33K/month) | MEDIUM | HIGH | **40% cache hit rate** reduces to ~$20K/month. **Circuit breaker:** If conversion <5% after 60 days → reduce free tier 5→3 scans/day (saves 40%). |

**Risk Monitoring:**
- **Daily:** Cost dashboard (alert if >$0.08/scan)
- **Weekly:** Cache hit rate trend (target ≥40% by Week 12)
- **Week 8:** Dry-run accuracy test (early warning for RSK-002/RSK-007)
- **Week 14:** Final VAL-001 gate (GO/NO-GO decision point)

---

## WEEKLY DELIVERABLES

| Week | Primary Deliverable | Gate/Milestone Alignment | Hours Estimated |
|------|---------------------|--------------------------|-----------------|
| **W1** | OpenAI DPA executed + cost tracking setup | BLK-002 resolved (legal blocker cleared) | 3.5 hours |
| **W2** | OpenAI API integration + master prompt v1 + complexity classifier | DEP-002 mock response delivered to Frontend | 18 hours |
| **W3** | Safety floor overrides (6 categories) + response validation | DEP-003 partial (enables Week 14 VAL-001) | 16 hours |
| **W4** | Conservative bias + confidence scoring + GL ranges | BLK-015 resolved, DEP-012 + DEP-015 resolved | 16 hours |
| **W5** | Food sequencing + swap generation + dietary filtering + AI-034 (dietary restriction test) | DEP-016 resolved (Frontend renders advice Week 7) | 22 hours |
| **W6** | *(Backend focus: Daily GL dashboard API)* | AI work continues prompt refinement | 0 hours (AI) |
| **W7** | A1C estimation algorithm (AI-018/AI-019 removed — owned by Backend) | DEP-014 resolved (Frontend shows A1C Week 8) | 8 hours |
| **W8** | Dry-run accuracy test (50 meals, ≥75% target) | **GATE:** Early accuracy signal (RSK-002/007 mitigation) | 14 hours |
| **W9-12** | Prompt iteration v2-v4 + cost optimization + AI-033 (correction review) | Cache hit rate ≥40%, cost target met (CON-001) | 32 hours across 4 weeks |
| **W13** | Premium advice card entitlement enforcement | DEP-019 resolved (server-side gating live) | 6 hours |
| **W14** | VAL-001 final accuracy test (100 meals, ≥85%) | **CRITICAL GATE:** BLK-001 resolved (GO/NO-GO to submission) | 16 hours |
| **W15** | Production monitoring + hotfix protocol | Launch readiness (monitoring live) | 8 hours |

**Total Estimated Hours:** ~151 hours across 15 weeks (~10 hours/week average, fits within Person A's 8-hour/day allocation alongside backend work)

---

## VALIDATION ACCEPTANCE CRITERIA

**VAL-001: Spike Risk Accuracy (Week 14 GATE)**
- **Criteria:** ≥85% SAFE classification accuracy on 100-meal validation set
- **Test Set:** 30 simple, 40 COMPLEX_B, 30 COMPLEX_C meals (all 6 safety floor categories represented)
- **Pass/Fail:** ≥85% → PASS (launch unblocked), <85% → FAIL (launch delayed, prompt iteration continues)
- **Safety Check:** Zero false SAFE classifications for HIGH-GL meals (no dangerous [REVIEW NEEDED: Replace restriction-framing with permission-first language] underestimations)

**VAL-009: Safety Floor Coverage (Week 14)**
- **Criteria:** 100% coverage across 6 food categories per PRD §6.2 (white rice, pasta, white bread, fruit juice, sweetened beverage, baked goods)
- **Test:** 5 scans per category (30 total) → verify override triggers correctly when AI underestimates
- **Pass/Fail:** All 6 categories trigger correctly → PASS

**VAL-020: Conservative Bias Verification (Week 14)**
- **Criteria:** Bias multipliers applied correctly (MEDIUM: ×1.10, LOW: ×1.20)
- **Test:** 20 scans with known confidence levels → verify multiplier applied to final GL estimate
- **Pass/Fail:** 100% correct multiplier application → PASS

**CON-001: AI Cost Target (Weeks 9-14)**
- **Criteria:** Blended cost per scan ≤$0.05 (7-day rolling average)
- **Monitoring:** Daily PostHog dashboard (alert if >$0.08 for 3 consecutive days)
- **Pass/Fail:** Week 14 cost ≤$0.05 → PASS (sustainable unit economics)

---

## APPENDIX: AI/ML QUICK REFERENCE

### Master Prompt Version Control
- **v1.0 (Week 2):** Initial prompt with 3 few-shot examples
- **v2.0-v4.0 (Weeks 9-12):** Iterative refinements based on Week 8 dry-run findings
- **Location:** `docs/prompts/MASTER_PROMPT_vX.md` (version-controlled in Git)
- **Iteration Log:** `docs/prompts/ITERATION_LOG.md` (daily changes tracked)

### Safety Floor Categories (Week 3+) — 6 per PRD §6.2
1. White rice (1 cup): Min GL 20
2. Pasta (1 cup): Min GL 18
3. White bread (2 slices): Min GL 16
4. Fruit juice (8oz): Min GL 15
5. Sweetened beverage: Min GL 20
6. Baked goods (muffin/cookie): Min GL 15
> Potatoes and Candy deferred to V1.1 backlog (not in PRD §6.2).

### Confidence Scoring Logic (Week 4+)
- **HIGH:** SIMPLE classification + no overrides + AI certainty >0.85 → Point estimate only
- **MEDIUM:** COMPLEX_B classification + 0-1 overrides + certainty 0.60-0.85 → ±20% GL range
- **LOW:** COMPLEX_C classification OR ≥2 overrides OR certainty <0.60 → ±35% GL range

### Conservative Bias Multipliers (Week 4+)
- **HIGH confidence:** 1.0× (no adjustment)
- **MEDIUM confidence:** 1.10× (10% overestimation buffer)
- **LOW confidence:** 1.20× (20% overestimation buffer)

### Cost Optimization Targets
- **Week 2-8:** Baseline cost ~$0.06-0.08/scan (unoptimized)
- **Week 12:** Target ≤$0.05/scan (cache hit rate ≥40%)
- **Circuit breaker:** >$0.08/scan for 3 days → pause free tier, investigate

### Accuracy Test Milestones
- **Week 8 Dry-Run:** 50 meals, ≥75% target (early warning signal)
- **Week 14 Final Gate:** 100 meals, ≥85% target (launch blocker if fail)

---

**END OF AI/ML IMPLEMENTATION PLAN — Revora v1.0**

*Last Updated: 2026-03-07 | Next Review: 2026-03-13 | Owner: Person A*

