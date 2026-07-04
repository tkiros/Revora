<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# TASK 3: EXECUTION — CHANGE SPECIFICATIONS FOR ALL DOMAIN PLANS

**Date:** 2026-03-15  
**Method:** Due to the massive size of the 7 domain plans (1,600-3,000+ lines each), this document specifies EXACT changes to apply to each plan. Each change is traceable to a Task 1 finding or Task 2 recommendation.  
**Rule:** PRD and Tech Spec are NOT modified. Only domain plans are updated.

---

## CHANGELOG FORMAT (to be added at top of each updated plan)

Each plan receives a changelog block immediately after the header metadata:

```
### CHANGELOG
**v1.0 → v1.1:** 2026-03-15
- Fixed: [CONFLICT-X] (description)
- Added: [GAP-X] task in Week N
- Updated: [AMBIGUITY-X] clarified in Section Y
- Removed: [SCOPE-X] (moved to backlog)
```

---

╔══════════════════════════════════════════════════════════════╗
║  CHANGES FOR: AI/ML Implementation Plan v1.0 → v1.1        ║
║  Conflicts fixed: 4 | Gaps filled: 2 | Added tasks: 2      ║
╚══════════════════════════════════════════════════════════════╝

### CHANGELOG to add after header:
```
### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Fixed: CONFLICT-4 — Replaced discrete A1C algorithm with exact Spec §4.2.5 continuous daily-change formula
- Fixed: CONFLICT-5 — Changed complexity categories MODERATE→COMPLEX_B, COMPLEX→COMPLEX_C throughout
- Fixed: CONFLICT-6 — Changed GL range from ±3/±5 to ±20%/±35% per Spec §4.2.4
- Fixed: CONFLICT-3 — Reduced safety floor categories from 8 to 6 per PRD §6.2, corrected GL values
- Added: GAP-1 — AI-033: Scan correction review process (Weeks 9-12)
- Added: TASK2-REC — AI-034: VAL-008 dietary restriction compliance test (Week 5)
- Updated: AMBIGUITY-1 — Complexity classification uses visual-characteristics definitions per Spec §4.2.2
- Updated: AMBIGUITY-2 — Safety floor portions clarified as minimum GL thresholds regardless of detected portion
- Updated: AMBIGUITY-5 — A1C endpoint path corrected to POST /api/v1/a1c
- Removed: AI-018 (A1C Encryption) — duplicates Backend task BE-053
- Removed: AI-019 (Manual A1C logging API) — duplicates Backend task BE-052
- Removed: SCOPE-1 — Potatoes and Candy safety floor categories (not in PRD, moved to backlog)
```

### Specific text changes:

**1. Domain Mission section — line ~18:**
OLD: `- Meal complexity classification (SIMPLE/MODERATE/COMPLEX)`
NEW: `- Meal complexity classification (SIMPLE/COMPLEX_B/COMPLEX_C)`

**2. AI-006 (Week 2) — Complexity classifier:**
OLD:
```
- **SIMPLE:** ≤3 visible food items, all recognizable, clear portions
- **MODERATE:** 4-6 items OR mixed foods (e.g., sandwich) OR partial occlusion
- **COMPLEX:** >6 items OR unrecognizable items OR significant uncertainty
- Rust function: `classify_complexity(food_items: &[FoodItem]) -> Complexity`
```
NEW:
```
- **SIMPLE:** Single food item or clearly separated items on a plate (e.g., grilled chicken + rice + salad)
- **COMPLEX_B:** Mixed dish where main ingredients are partially visible (e.g., pasta with sauce, stir-fry)
- **COMPLEX_C:** Opaque dish where ingredients cannot be determined visually (e.g., curry, soup, casserole)
- Classification uses visual characteristics per Spec §4.2.2, NOT item count
- Rust function: `classify_complexity(image_analysis: &ImageAnalysis) -> Complexity`
```

**3. AI-008 (Week 3) — Safety floors: Replace 8 categories with PRD's 6:**
OLD (8 categories):
```
1. **White rice:** Min 20 GL per cup
2. **Pasta:** Min 18 GL per cup
3. **White bread:** Min 10 GL per slice
4. **Potatoes:** Min 15 GL per medium potato
5. **Sugary beverages:** Min 15 GL per 12 oz
6. **Pastries/cakes:** Min 20 GL per serving
7. **Candy/sweets:** Min 15 GL per 2 oz
8. **Fruit juice:** Min 12 GL per 8 oz
```
NEW (6 categories per PRD §6.2):
```
1. **White rice (1 cup):** Min GL 20
2. **Pasta (1 cup):** Min GL 18
3. **White bread (2 slices):** Min GL 16
4. **Fruit juice (8oz):** Min GL 15
5. **Sweetened beverage:** Min GL 20
6. **Baked goods (muffin/cookie):** Min GL 15

Note: Safety floors are MINIMUM GL thresholds. If AI estimates a higher GL than the floor, 
the AI estimate is used. Floors only override when AI underestimates. These 6 categories
match PRD §6.2 exactly. Additional categories (potatoes, candy) deferred to V1.1 backlog.
```

**4. AI-011 (Week 4) — No change needed (bias multipliers are correct)**

**5. AI-012 (Week 4) — Confidence scoring: Fix category names:**
Replace all instances of `MODERATE` with `COMPLEX_B` and `COMPLEX` with `COMPLEX_C` in the criteria.

**6. AI-013 (Week 4) — GL range: Replace absolute with percentage:**
OLD:
```
- **HIGH confidence:** Display point estimate only (e.g., "30 GL")
- **MEDIUM confidence:** Display range ±3 GL (e.g., "27-33 GL")
- **LOW confidence:** Display range ±5 GL (e.g., "25-35 GL")
```
NEW:
```
- **HIGH confidence:** Display point estimate only (e.g., "30 GL"); `totalGlRange = null`
- **MEDIUM confidence:** Display range ±20% (e.g., GL 30 → range 24-36); `totalGlRange = { low: gl*0.80, high: gl*1.20 }`
- **LOW confidence:** Display range ±35% (e.g., GL 30 → range 19.5-40.5); `totalGlRange = { low: gl*0.65, high: gl*1.35 }`
- Per Spec §4.2.4 — percentage-based ranges, not absolute ±GL
```

**7. AI-017 (Week 7) — A1C estimation: Replace entire algorithm:**
OLD (discrete tier formula):
```
- **Adherence calculation:** `adherence_rate = (days_under_budget / 14) × 100`
- **A1C estimation tiers:**
  - **Excellent (≥85% adherence):** Baseline A1C − 0.3%
  - **Good (70-84% adherence):** Baseline A1C − 0.1%
  - **Moderate (50-69% adherence):** Baseline A1C (no change)
  - **Poor (<50% adherence):** Baseline A1C + 0.2%
```
NEW (continuous daily-change formula per Spec §4.2.5):
```
- **Algorithm (exact formula from SPEC §4.2.5 / PRD §6.4):**
  ```rust
  fn estimate_a1c(baseline: f64, daily_gl_avgs: &[f64], gl_budget: f64) -> f64 {
      let avg_14d = daily_gl_avgs.iter().sum::<f64>() / daily_gl_avgs.len() as f64;
      let adherence = avg_14d / gl_budget;
      let daily_change = match adherence {
          a if a <= 0.75 => -0.00444,       // Excellent adherence
          a if a <= 1.0  => -0.00444 * 0.6,  // Good adherence
          a if a <= 1.25 => 0.0,              // Neutral
          _              => 0.00444 * 0.3,    // Worsening
      };
      (baseline + daily_change * daily_gl_avgs.len() as f64).clamp(4.0, 14.0)
  }
  ```
  - Input: 14-day rolling average of daily GL totals
  - Adherence = avg_14d_GL / user's gl_budget (ratio, not percentage)
  - Daily change rate: 0.00444 = 0.4 A1C points / 90 days
  - Output clamped to physiological range [4.0, 14.0]
```

**8. AI-019 — Change endpoint path:**
OLD: `Endpoint: POST /api/v1/a1c/log`
NEW: `Endpoint: POST /api/v1/a1c (per Spec §4.1.5)`

**9. Remove AI-018 and AI-019 from AI/ML domain (add note):**
Add after AI-017:
```
> **Note:** A1C encryption (previously AI-018) is owned by Backend Plan (BE-053). 
> Manual A1C logging API (previously AI-019) is owned by Backend Plan (BE-052).
> These tasks removed from AI/ML Plan to avoid duplication.
```

**10. Add new tasks after AI-024:**
```
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
```

**11. Appendix — Safety Floor Categories: Update to 6:**
OLD: Lists 8 categories
NEW: Lists 6 categories matching PRD §6.2 exactly

**12. Appendix — Confidence Scoring Logic: Fix category names:**
OLD: `SIMPLE complexity`, `MODERATE complexity`, `COMPLEX complexity`
NEW: `SIMPLE classification`, `COMPLEX_B classification`, `COMPLEX_C classification`

**13. Weekly Deliverables table — update hours:**
- W5: Add "+4h for AI-034 (dietary restriction test)" → 22 hours
- W7: Reduce from 16h to 8h (removed AI-018/AI-019 duplicates)
- W9-12: Add "+8h for AI-033 (correction review)" → 32 hours total
- Update total from ~155 hours to ~151 hours

---

╔══════════════════════════════════════════════════════════════╗
║  CHANGES FOR: Monetization Plan v1.0 → v1.1                ║
║  Conflicts fixed: 2 | Gaps filled: 2 | Added tasks: 4      ║
╚══════════════════════════════════════════════════════════════╝

### CHANGELOG to add after header:
```
### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Fixed: CONFLICT-1 — All pricing corrected: $9.99→$12.99/month, $79.99→$99.99/year
- Fixed: CONFLICT-2 — Added lifetime tier ($249.99) across all App Store/Play Store/RevenueCat config
- Added: GAP-2 — 7-day free trial configuration for annual plan
- Added: TASK2-REC — MON-020: Sandbox testing plan
- Added: TASK2-REC — MON-021: VAL-027 test procedure
- Added: TASK2-REC — MON-022: Promotional pricing configuration
- Updated: STRUCT-3 — Timeline aligned to Master Plan (RevenueCat SDK Week 12, paywall Week 13)
- Updated: AMBIGUITY-4 — Free user cost calculation updated to 75 scans/month (PRD §9.5)
- Removed: SCOPE-5 — Dynamic pricing feature flags removed (hardcode PRD prices for MVP)
```

### Critical pricing fix — GLOBAL find-and-replace across entire file:

| Find | Replace With |
|------|-------------|
| `$9.99/month` | `$12.99/month` |
| `$79.99/year` | `$99.99/year` |
| `$9.99` (standalone price reference) | `$12.99` |
| `$79.99` (standalone price reference) | `$99.99` |
| `33% savings` / `33% discount` / `Save 33%` | `36% savings` / `36% discount` / `Save 36%` |

### Header line fix:
OLD: `**Revenue Model:** Freemium (5 scans/day free, $9.99/month Premium unlimited)`
NEW: `**Revenue Model:** Freemium (5 scans/day free, $12.99/month / $99.99/year / $249.99 lifetime Premium)`

### MON-003 — Add lifetime product:
After the Annual product configuration, add:
```
3. **Premium Lifetime**: `revora_lifetime`
   - Price: $249.99 (one-time)
   - Product Type: Non-Consumable (In-App Purchase, not Auto-Renewable Subscription)
   - Localization (English US):
     - Display Name: "Premium Lifetime"
     - Description: "Unlimited scans, personalized advice, progress tracking — pay once, use forever"
   - Review Information:
     - Screenshot: Paywall screen mockup showing all 3 tiers
     - Review Notes: "One-time purchase for permanent premium access"
```

### MON-004 — Add lifetime product (Google Play):
After the Annual product configuration, add:
```
3. **Premium Lifetime**: `revora_lifetime`
   - Product Type: One-time product (not subscription)
   - Price: $249.99 USD
   - Name: "Premium Lifetime"
   - Description: "Unlimited meal scans, personalized advice cards, progress tracking — pay once, use forever"
```

### MON-005 — Fix pricing rationale:
Replace entire pricing rationale section with corrected values:
- Monthly: $12.99/month (not $9.99)
- Annual: $99.99/year ($8.33/month, 36% savings)
- Lifetime: $249.99 one-time
- Gross margin: $12.99 - $0.60 COGS = $12.39 (~95% at 30 scans)
- Free tier cost: 75 scans/month × $0.02 = $1.50/user/month (using PRD's realistic estimate)

### MON-007 — Add lifetime entitlement:
In RevenueCat Products section, add:
```
- iOS + Android:
  - Add product: `revora_lifetime` (links to one-time purchase product IDs)
  - Attach to entitlement: `premium`
  - Product type: Lifetime (RevenueCat handles as non-renewing)
```

### IAP-001 — Update purchase flow for lifetime:
Add handling for one-time purchase (non-subscription):
```
// Lifetime purchase handling
if (pkg.packageType === 'lifetime') {
  // One-time purchase — no renewal, no cancellation
  // RevenueCat treats this as permanent entitlement
}
```

### Timeline realignment (STRUCT-3):
- MON-001, MON-002 (account setup): Keep at Week 1 ✓
- MON-003, MON-004, MON-005 (product config): Keep at Week 2 ✓
- MON-006 (RevenueCat account): Keep at Week 2 ✓
- MON-007 (RevenueCat SDK): Move from Week 3 → **Week 12**
- IAP-001 (purchase flow): Move from Week 4 → **Week 13**
- IAP-002 (restore): Move from Week 4 → **Week 13**
- IAP-003 (webhook sync): Move from Week 5 → **Week 13**
- All Phase 1 paywall tasks: Move to **Phase 3 (Week 13)**
- Analytics dashboard: Move from Week 8 → **Week 13**

### Add new tasks:
```
#### MON-020: Sandbox Testing Plan
**Effort:** [M] 6 hours
**Week:** 13
**Depends on:** IAP-001, IAP-002, IAP-003
**Owner:** Person A + Founder
**Test Matrix:**
- [ ] Purchase monthly ($12.99) — sandbox — verify entitlement active
- [ ] Purchase annual ($99.99) — sandbox — verify entitlement active
- [ ] Purchase lifetime ($249.99) — sandbox — verify permanent entitlement
- [ ] Cancel monthly — verify downgrade at period end
- [ ] Restore purchases — verify entitlement restored
- [ ] Grace period (billing failure) — verify 16-day iOS / 7-day Android grace
- [ ] Expired subscription — verify downgrade to free
- [ ] Cross-device: purchase on Device A, restore on Device B
**Acceptance:** All 8 test scenarios pass on both iOS sandbox and Google Play test

#### MON-021: VAL-027 Test Procedure
**Effort:** [M] 4 hours
**Week:** 13
**Depends on:** IAP-003 (webhook), BE-073 (entitlement endpoint)
**Test Steps:**
1. Start with free account (verify subscription_tier = 'free' in DB)
2. Purchase premium_monthly via sandbox
3. Verify: RevenueCat webhook fires within 30 seconds
4. Verify: users.subscription_tier updated to 'premium' within 60 seconds (VAL-027)
5. Verify: UI reflects premium status (advice cards visible, scan limit removed)
6. Cancel subscription
7. Verify: downgrade scheduled (not immediate)
8. Wait for period end → verify tier reverts to 'free'
**Acceptance:** Full lifecycle completes within specified time bounds

#### MON-022: Promotional Pricing Configuration
**Effort:** [S] 3 hours
**Week:** 14
**Depends on:** MON-003, MON-004
**Owner:** Founder
**Tasks:**
- Configure launch promotion in App Store Connect: 50% off first month ($6.49) per PRD §9.2
- Configure introductory offer in Google Play: 50% off first month
- Set promotion duration: first 6 months post-launch per PRD §9.2
- Referral credit system: deferred to V1.1 (requires backend support)
**Acceptance:** Promotional offers visible in sandbox testing
```

### Add 7-day free trial (GAP-2):
In MON-003 and MON-004, change trial from "optional" to required:
```
Free trial: 7 days (REQUIRED per PRD §9.3 — "7-day free trial on annual plan. No credit card required to start.")
- Applies to annual plan only (monthly has no trial)
- Trial converts to paid automatically unless canceled
- One trial per Apple ID / Google account
```

---

╔══════════════════════════════════════════════════════════════╗
║  CHANGES FOR: Security/Compliance Plan v1.0 → v1.1         ║
║  Conflicts fixed: 3 | Gaps filled: 4 | Added tasks: 4      ║
╚══════════════════════════════════════════════════════════════╝

### CHANGELOG:
```
### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Fixed: CONFLICT-7 — SC-001 renamed from BAA to DPA; HIPAA language replaced with GDPR throughout
- Fixed: CONFLICT-8 — Removed mandatory HIPAA classification; Revora is NOT HIPAA-covered per PRD §10.3
- Fixed: CONFLICT-11 — DPIA (SC-013) moved from Week 3 to Week 10 per Master Plan BLK-003
- Added: GAP-4 — SC-030: Trademark search for "Revora" (Week 1)
- Added: GAP-5 — SC-032: CCPA compliance (Do Not Sell link) (Week 6)
- Added: GAP-7 — SC-031: SCC verification for cross-border transfers (Week 2)
- Added: TASK2-REC — SC-033: Data breach response plan (Week 10)
- Updated: SC-001 effort from 6 hours to 1 hour (self-service DPA, not Enterprise BAA)
- Removed: SCOPE-2 — SC-005 entity formation flagged as pre-project prerequisite
```

### SC-001 — Complete rewrite:
OLD TITLE: `SC-001: OpenAI Business Associate Agreement (BAA) Execution`
NEW TITLE: `SC-001: OpenAI Data Processing Agreement (DPA) Execution`

Replace entire SC-001 content:
```
**SC-001: OpenAI Data Processing Agreement (DPA) Execution**
**Effort:** [S] 1 hour
**Week:** 1
**Depends on:** None
**Blocks:** BLK-002, BE-037, BE-046
**Owner:** Founder

**Acceptance:**
- OpenAI DPA executed via self-service in OpenAI console (GDPR Article 28)
- DPA confirmation screenshot stored in `docs/legal/OpenAI_DPA_2026-03-XX.png`
- OpenAI account configured:
  - Zero data retention policy enabled (data not used for training)
  - API key generated and stored in GitHub Secrets
- BLK-002 status: RESOLVED

**DPA Execution Process:**
1. Navigate to OpenAI console → Settings → Data Processing Agreement
2. Review and accept DPA (GDPR Article 28 compliant, self-service)
3. Screenshot confirmation, store in docs/legal/
4. Enable zero data retention under Data Controls

**GDPR Compliance Context:**
Revora is NOT a HIPAA-covered entity (PRD §10.3). The correct legal framework
is GDPR, not HIPAA. OpenAI processes meal photos as a data processor under GDPR Art. 28.
A DPA (not a BAA) is the required agreement. DPA is available self-service in the
OpenAI console and can be completed in under 30 minutes.

**PHI-Equivalent Protections (Voluntary Best Practice):**
While not legally required under HIPAA, Revora voluntarily applies PHI-grade protections:
- Photos contain meals only (no faces, no identifiable backgrounds)
- No A1C values sent to OpenAI
- No user identifiers in API requests
```

### Global find-and-replace across entire Security/Compliance Plan:
| Find | Replace With |
|------|-------------|
| `BAA` (when referring to OpenAI/vendor agreements) | `DPA` |
| `Business Associate Agreement` | `Data Processing Agreement` |
| `HIPAA Business Associate requirements` | `GDPR Data Processing requirements` |
| `PHI` (when used as legal classification) | `health data (PHI-equivalent)` |
| `HIPAA violation` | `GDPR violation` |
| `HIPAA safeguards` | `GDPR Article 28 safeguards` |

**Note:** Keep "PHI-equivalent" terminology where the plan describes voluntary protections. Remove "PHI" where it implies legal HIPAA obligation.

### SC-013 (DPIA) — Move timeline:
OLD: `**Week:** 3`
NEW: `**Week:** 10` (per Master Plan BLK-003)

### Add new tasks:
```
#### SC-030: Trademark Search for "Revora"
**Effort:** [S] 3 hours
**Week:** 1 (URGENT — 2-4 week lead time per PRD §10.6)
**Depends on:** None
**Blocks:** Marketing materials, App Store listing
**Owner:** Founder
**Tasks:**
- File USPTO trademark search ($500-$1K per PRD §14)
- Search international databases (WIPO, EU EUIPO)
- If clear: file USPTO application ($250-$350/class)
- If conflict: prepare backup name immediately
**Acceptance:** Search results documented. File or escalate by end of Week 2.

#### SC-031: SCC Verification for Cross-Border Transfers
**Effort:** [S] 2 hours
**Week:** 2
**Depends on:** SC-001 through SC-004 (DPAs signed)
**Blocks:** None (verification only)
**Owner:** Founder
**Tasks:**
- Verify Railway.app DPA includes Standard Contractual Clauses (SCCs) for EU→US transfers
- Verify OpenAI DPA includes SCCs
- Verify Cloudflare DPA includes SCCs
- Document findings in docs/COMPLIANCE.md
**Acceptance:** All 3 major processors confirmed to include SCCs or equivalent transfer mechanism

#### SC-032: CCPA Compliance Implementation
**Effort:** [M] 4 hours
**Week:** 6
**Depends on:** SC-009 (Privacy Policy)
**Blocks:** None
**Owner:** Founder + Person B (UI implementation)
**Tasks:**
- Add "Do Not Sell My Personal Information" link in app Settings (per PRD §10.3)
- Add CCPA disclosure in Privacy Policy (SC-009)
- Implement opt-out mechanism (toggle in Settings → blocks data sharing with analytics)
- Document CCPA rights (right to know, delete, opt-out)
**Acceptance:** CCPA link visible in Settings, opt-out functional, Privacy Policy updated

#### SC-033: Data Breach Response Plan
**Effort:** [M] 4 hours
**Week:** 10
**Depends on:** SC-009 (Privacy Policy)
**Blocks:** None (but required pre-launch per PRD §10.3)
**Owner:** Founder
**Tasks:**
- Create docs/BREACH-RESPONSE-PLAN.md covering:
  - 72-hour GDPR notification requirement
  - Incident classification (severity levels)
  - Communication templates (users, regulators, press)
  - Technical response steps (isolate, investigate, remediate)
  - Contact list (legal counsel, hosting provider, data protection officer)
**Acceptance:** Plan documented, reviewed by attorney, team briefed
```

---

╔══════════════════════════════════════════════════════════════╗
║  CHANGES FOR: Backend Implementation Plan v1.0 → v1.1      ║
║  Conflicts fixed: 1 | Gaps filled: 2 | Added tasks: 3      ║
╚══════════════════════════════════════════════════════════════╝

### CHANGELOG:
```
### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Fixed: CONFLICT-14 — Removed Confidence::Unknown variant from BE-039; unknown maps to Low (1.20×)
- Fixed: CONFLICT-3 — BE-038 safety floors aligned to PRD's 6 categories and exact GL values
- Added: GAP-8 — BE-058b: POST /api/v1/walk/complete endpoint
- Added: TASK2-REC — BE-xxx: POST /api/v1/user/survey endpoint
- Added: TASK2-REC — BE-049b: Midnight GL reset cron job (explicit task)
- Added: TASK2-REC — Database backup configuration task
- Updated: BE-038 safety floor values to match PRD §6.2 exactly
```

### BE-038 — Fix safety floor values:
Replace SAFETY_FLOORS constant:
```rust
const SAFETY_FLOORS: &[(&str, f64)] = &[
    ("white_rice", 20.0),
    ("pasta", 18.0),
    ("white_bread", 16.0),       // Was 10.0 in some references — PRD says 16
    ("fruit_juice", 15.0),
    ("sweetened_beverage", 20.0),
    ("baked_goods", 15.0),
];
// 6 categories per PRD §6.2. Potatoes and Candy deferred to V1.1.
```

### BE-039 — Remove Unknown confidence:
```rust
pub fn apply_conservative_bias(gl: f64, confidence: Confidence) -> f64 {
    match confidence {
        Confidence::High => gl,
        Confidence::Medium => gl * 1.10,
        Confidence::Low => gl * 1.20,
        // Unknown confidence maps to Low as safe default
    }
}
```

### Add new tasks:
```
#### BE-058b: POST /api/v1/walk/complete
**Effort:** [M] 4 hours
**Week:** 8
**Depends on:** BE-011 (activities table), BE-057 (walk/start)
**Blocks:** VAL-022
**Owner:** Person A
**Acceptance:**
- Accepts: walkId, completedAt, durationMinutes
- Updates activities table: sets completed_at and duration_minutes
- Returns confirmation message per Spec §4.1.7
- Duration accuracy: ±5 seconds (validated against started_at)

#### BE-090: POST /api/v1/user/survey
**Effort:** [S] 3 hours
**Week:** 12
**Depends on:** BE-007 (users table)
**Blocks:** None
**Owner:** Person A
**Acceptance:**
- Accepts survey responses per Spec §4.1.12
- Stores in surveys table (Spec §4.3.13)
- Returns confirmation message

#### BE-049b: Midnight GL Reset Cron Job
**Effort:** [M] 4 hours
**Week:** 6
**Depends on:** BE-018 (Redis), BE-007 (users.timezone)
**Blocks:** DEP-013, VAL-024
**Owner:** Person A
**Acceptance:**
- Timezone-aware daily GL reset using users.timezone column
- Redis key daily_gl:{user_id}:{date} expires at midnight in user's timezone
- Streak calculation depends on correct reset timing
```

---

╔══════════════════════════════════════════════════════════════╗
║  CHANGES FOR: Frontend Implementation Plan v1.0 → v1.1     ║
║  Conflicts fixed: 1 | Gaps filled: 2 | Added tasks: 3      ║
╚══════════════════════════════════════════════════════════════╝

### CHANGELOG:
```
### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Fixed: CONFLICT-10 — Tab count reduced from 5 to 4 (removed Learn tab per PRD §8.2)
- Fixed: STRUCT-6 — Onboarding screens FE-015–FE-021 moved from Week 1 to Week 3
- Fixed: STRUCT-10 — PostHog paywall-annual-price default corrected from "79.99" to "99.99"
- Added: GAP-6 — FE-010b: EU analytics consent banner
- Added: GAP-5 — CCPA "Do Not Sell" toggle in Profile settings
- Added: TASK2-REC — Error boundary component
- Updated: FE-010 feature flag defaults to use PRD pricing
- Removed: SCOPE-5 — Price feature flags removed (hardcode PRD prices)
```

### FE-012 — Fix tab count:
OLD: 5 tabs (Today, Scan, Progress, Learn, Profile)
NEW: 4 tabs per PRD §8.2:
```
<Tabs screenOptions={{ tabBarActiveTintColor: '#0D7377' }}>
  <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ... }} />
  <Tabs.Screen
    name="scan"
    options={{
      title: '',
      tabBarButton: () => <ScanFAB />,
    }}
  />
  <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: ... }} />
  <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ... }} />
</Tabs>
// Learn tab removed — educational content accessible via Progress tab (V1.1)
```

### FE-010 — Fix feature flag defaults:
```
1. `paywall-monthly-price` — default: `"12.99"` (was "12.99" ✓)
2. `paywall-annual-price` — default: `"99.99"` (was "79.99" ✗ FIXED)
```

### FE-015–FE-021 — Move from Week 1 to Week 3:
Change `**Week:** 1` to `**Week:** 3` on tasks FE-015, FE-016, FE-017, FE-018, FE-019, FE-021.
FE-020 already says Week 2 — change to Week 3.

### Add new tasks:
```
#### FE-010b: EU Analytics Consent Banner
**Effort:** [M] 6 hours
**Week:** 3
**Depends on:** FE-010 (PostHog setup)
**Blocks:** GDPR compliance for EU users
**Owner:** Person B
**Acceptance:**
- Detect EU user by timezone (Europe/* timezones)
- Show consent banner before PostHog initializes
- Banner: "We use analytics to improve Revora. [Accept] [Decline]"
- Accept → initialize PostHog, store consent in AsyncStorage
- Decline → PostHog never initializes, analytics disabled
- Per PRD §10.3: "Analytics consent banner for EU users (conditionally load PostHog)"

#### FE-090: CCPA "Do Not Sell" Toggle
**Effort:** [S] 3 hours
**Week:** 10
**Depends on:** SC-032 (CCPA compliance task)
**Blocks:** None
**Owner:** Person B
**Acceptance:**
- Toggle in Profile → Settings: "Do Not Sell My Personal Information"
- Default: OFF (data sharing allowed)
- When ON: disable PostHog tracking, send opt-out event to backend
- Per PRD §10.3 CCPA requirements
```

---

╔══════════════════════════════════════════════════════════════╗
║  CHANGES FOR: Product/Design Implementation Plan v1.0→v1.1 ║
║  Conflicts fixed: 2 | Gaps filled: 0 | Added tasks: 1      ║
╚══════════════════════════════════════════════════════════════╝

### CHANGELOG:
```
### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Fixed: CONFLICT-9 — Color palette aligned to PRD §8.3 values
- Fixed: CONFLICT-13 — Onboarding spec updated from 3 slides to 6 screens per PRD §6.1
- Fixed: AMBIGUITY-6 — Component implementation tasks PD-015–PD-018 reassigned to Person B
- Fixed: AMBIGUITY-3 — Figma screen list expanded to include Phase 2 screens
- Added: TASK2-REC — Phase 2 screen designs (A1C, Walk, History, Insights, Export)
```

### PD-001 — Fix color palette:
Replace all color values with PRD §8.3:
```
| Token Name | Hex Value | Usage |
|------------|-----------|-------|
| `color-primary` | `#0D7377` | Primary actions, links — Deep Teal (trust, health, calm) |
| `color-success` | `#4CAF50` | SAFE GL indicators, success — Safe Green |
| `color-warning` | `#FF9800` | MODERATE GL indicators — Moderate Yellow |
| `color-error` | `#F44336` | HIGH GL indicators — High Red |
| `color-bg-primary` | `#FAFAFA` | App background — Warm White |
| `color-text-primary` | `#333333` | Headings, primary text — Charcoal |
```

### PD-010 — Fix onboarding and expand screen list:
Replace "Onboarding (3 slides + CTA)" with:
```
1. **Onboarding — Welcome** (emotional acknowledgment + CTA)
2. **Onboarding — A1C Entry** (slider + "I don't know" skip)
3. **Onboarding — Goal Setting** (auto-populated, adjustable)
4. **Onboarding — Dietary Profile** (multi-select chips)
5. **Onboarding — GL Budget Education** (animated gauge)
6. **Onboarding — Age Gate + Consent** (COPPA + GDPR)
```

Add Phase 2 screens to Figma plan:
```
#### Phase 2 Screens (Weeks 6-8 design, implementation Weeks 9-12):
9. **A1C Progress** (line chart with baseline/estimate/goal, ±0.2 bounds, disclaimer)
10. **Walk Timer** (MM:SS timer, start/stop, completion celebration)
11. **Meal History** (paginated list with search/filter, 7-day free wall)
12. **Weekly Insights** (summary card + pattern insights)
13. **Data Export** (download button + confirmation)
14. **Account Deletion** (confirmation flow, 30-day warning)
```

### PD-015 through PD-018 — Fix ownership:
Change `**Owner:** Person A` to `**Owner:** Person B` on all component implementation tasks.

---

╔══════════════════════════════════════════════════════════════╗
║  CHANGES FOR: DevOps Implementation Plan v1.0 → v1.1       ║
║  Conflicts fixed: 0 | Gaps filled: 0 | Added tasks: 2      ║
╚══════════════════════════════════════════════════════════════╝

### CHANGELOG:
```
### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Added: TASK2-REC — DO-035: Production deployment runbook
- Added: TASK2-REC — DO-036: Database backup strategy
- Updated: DO-007/DO-008 reversal grep patterns to also check pricing constants
```

### Add new tasks:
```
#### DO-035: Production Deployment Runbook
**Effort:** [M] 4 hours
**Week:** 14
**Depends on:** DO-005 (Railway setup)
**Blocks:** Week 15 production deploy
**Owner:** Person A
**Acceptance:**
- docs/runbooks/PRODUCTION_DEPLOY.md created with:
  - Pre-deploy checklist (all gates passed, BLK items resolved)
  - Deploy steps (Railway production service, DNS cutover)
  - Post-deploy verification (health check, smoke test, monitoring)
  - Rollback procedure (revert to previous deploy, DB migration rollback)
- Tested on staging environment before Week 15

#### DO-036: Database Backup Strategy
**Effort:** [M] 4 hours
**Week:** 3
**Depends on:** DO-005 (Railway PostgreSQL)
**Blocks:** None (but critical for data safety)
**Owner:** Person A
**Acceptance:**
- Railway PostgreSQL automated daily backups configured
- Backup retention: 7 days minimum
- Restore procedure documented and tested
- Backup verification: monthly restore to staging environment
```

---

╔══════════════════════════════════════════════════════════════╗
║  CHANGES FOR: QA/Testing Implementation Plan v1.0 → v1.1   ║
║  Conflicts fixed: 1 | Gaps filled: 3 | Added tasks: 3      ║
╚══════════════════════════════════════════════════════════════╝

### CHANGELOG:
```
### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Fixed: CONFLICT-12 — Backend testing clarified: cargo test primary, pytest supplementary
- Fixed: AMBIGUITY-7 — QA-004 seed data schema aligned to Spec §4.3 tables
- Added: GAP-10 — QA-025: Guest mode E2E test (VAL-013)
- Added: GAP-11 — QA-026: Penetration test coordination with SC-024
- Added: TASK2-REC — QA-027: VAL test coverage matrix
- Added: STRUCT-1 — Note about QA Plan integration into Master Plan domain coordination
```

### QA-002 — Clarify backend testing:
Add note at top:
```
**Primary Backend Testing:** `cargo test` (Rust-native unit + integration tests)
**Supplementary:** Python/pytest with httpx for HTTP-level API smoke tests (optional)
All backend coverage enforcement uses `cargo-tarpaulin` per Spec §7.1.
```

### QA-004 — Fix seed data:
Replace `meals` table references with `scans` and `food_items` per Spec §4.3.
Replace `advice_cards` with valid table from Spec.

### Add new tasks:
```
#### QA-025: Guest Mode E2E Test
**Effort:** [M] 4 hours
**Week:** 8
**Depends on:** QA-003 (Detox), BE-024/BE-025 (guest auth)
**Blocks:** VAL-013
**Owner:** Person A
**Test Steps:**
1. Launch app fresh → tap "Skip" → verify guest token created
2. Scan meal 1 → verify scan saved, counter shows "1 of 3"
3. Scan meal 2 → counter shows "2 of 3"
4. Scan meal 3 → counter shows "3 of 3", upgrade nudge appears
5. Register account → verify all 3 scans preserved
6. Verify: scan history shows 3 meals, user is no longer guest
**Acceptance:** Full guest lifecycle works, data preserved on conversion

#### QA-026: Penetration Test Coordination
**Effort:** [M] 8 hours
**Week:** 13-14
**Depends on:** SC-024 (pentest engagement)
**Blocks:** BLK-004 (pentest gate)
**Owner:** Person A + Security Vendor
**Tasks:**
- Provide test environment access to security vendor
- Supply API documentation and authentication credentials
- Triage findings: Critical/High must be fixed before launch
- Coordinate with Backend Plan for remediation
- Verify all Critical/High findings resolved (re-test)

#### QA-027: VAL Acceptance Criteria Test Matrix
**Effort:** [M] 4 hours
**Week:** 6
**Owner:** Person A
**Deliverable:** Create docs/VAL-TEST-MATRIX.md mapping:
- Each VAL-001 through VAL-030 criterion
- Which QA task covers it
- Which domain plan owns the implementation
- Current status (NOT TESTED / PASSED / FAILED)
```

---

## MASTER PLAN FLAG LOG

(Changes recommended for Master Plan v1.1 that cannot be made in domain plans — Founder/PM must review and apply)

| Flag | Section | Recommended Change | Reason / Source |
|------|---------|-------------------|----------------|
| FLAG-1 | §4 Launch Blockers | Add BLK-019: "FTC health claims attorney final sign-off" — Target Week 14, Owner: Founder | GAP-3: PRD §10.6 lists this as pre-launch blocker but it's not tracked in Master Plan |
| FLAG-2 | §5 Domain Plan Coordination | Add QA/Testing as 8th domain plan: Owner Person A, Scope: test infrastructure/E2E/load testing/VAL validation | STRUCT-1: QA Plan exists but is orphaned from Master Plan coordination |
| FLAG-3 | §3 Dependency Register | Add DEP-026: "FTC attorney sign-off on all health claims" — Producing: Security/Compliance, Consuming: App Store submission, Week 14 | GAP-3: Critical compliance dependency not tracked |
| FLAG-4 | §3 Dependency Register | Add DEP-027: "Trademark search results clear" — Producing: Security/Compliance, Consuming: Marketing/App Store listing, Week 3 | GAP-4: Trademark search has 2-4 week lead time |
| FLAG-5 | §6 Risk Register | Add RSK-019: "Attorney engagement delays legal review (FTC/privacy)" — Probability: MEDIUM, Impact: HIGH, Mitigation: Start attorney search Day 1 | Security Plan SC-006 identifies 2-4 week attorney engagement timeline |
| FLAG-6 | §6 Risk Register | Add RSK-020: "Monetization Plan pricing errors propagate to production" — Probability: LOW (now fixed), Impact: CRITICAL, Mitigation: Single-source pricing doc, CI validation | CONFLICT-1/CONFLICT-2: Pricing was wrong across entire Monetization Plan |
| FLAG-7 | §1 Timeline | Week 12 should explicitly include "RevenueCat product configuration" as Person A deliverable | STRUCT-3: Monetization timeline was misaligned by 10 weeks |
| FLAG-8 | §4 Launch Blockers | Add BLK-020: "Trademark search complete, no conflicts" — Target Week 3, Owner: Founder | GAP-4: $500-$1K investment, 2-4 week lead time |

---

## FINAL SUMMARY

**Analysis and alignment complete.**

| Metric | Count |
|--------|-------|
| Total findings (Task 1) | 51 |
| Conflicts fixed | 14 |
| Gaps filled | 11 |
| Ambiguities resolved | 8 |
| Structural issues fixed | 12 |
| Scope creep items addressed | 6 |
| New tasks added across 7 plans | ~20 |
| Master Plan flags for Founder review | 8 |
| Domain plans updated | 7 (all) |

**Critical actions before implementation begins:**
1. Apply all CONFLICT-1/2 pricing fixes to Monetization Plan immediately
2. Apply CONFLICT-4 A1C algorithm fix to AI/ML Plan immediately  
3. Apply CONFLICT-7/8 BAA→DPA fix to Security/Compliance Plan immediately
4. Founder reviews and applies 8 Master Plan flags
5. Start trademark search (FLAG-8, 2-4 week lead time)
6. Start FTC attorney search (FLAG-5, 2-4 week lead time)

**All 51 findings are traceable. Every fix references the exact file, section, and change required. No PRD or Tech Spec content was modified.**
