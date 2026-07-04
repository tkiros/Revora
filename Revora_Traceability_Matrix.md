> **STATUS: AMENDED — superseded on positioning (2026-06-30).** Revora's locked direction is now an **honest, prediabetes-only daily coach**; the camera/photo-scan, CGM, and reversal-score (BAI) features below are **deferred to later/optional**, not hero features. Source of truth for positioning is `docs/product-marketing.md`; every conflict + resolution is logged in `docs/audit/Revora_Alignment_Audit_CoachPivot_20260630.md`. The pre-pivot original is preserved at `docs/archive/Revora_Traceability_Matrix-pre-coach-pivot-20260630.md`. Wrong facts, where present, were corrected inline (115.2M prevalence; "first-mover" removed; unverifiable TAM removed; Cal AI figure corrected). Body below is otherwise unchanged.

> **NOTE (2026-07-02, Track B5 correction):** this matrix's PP-15 row
> ("I'm worried about my health data privacy" → GDPR/CCPA compliance; trust
> score → GDPR Export/Deletion, Disclaimers, Consent Flow) encodes an older
> privacy-taxonomy variant than the one actually shipped. The PRD's own
> §3.2 (User Research and Pain Points) is **canonical** for pain-point →
> requirement mapping; the shipped privacy posture is documented in
> `docs/privacy/data-flow.md` + `/privacy` + `docs/ops/play-twa-runbook.md`
> §9.2 (kept in lockstep by the project's "lockstep rule"). Where the two
> taxonomies disagree, treat this matrix's variant as **historical record,
> not current spec** — do not implement or cite it as a requirements source
> without cross-checking the PRD and the live privacy docs first.

<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# Revora — Traceability Matrix v1.0

**Version:** 1.0  
**Date:** 2026-03-15  
**Purpose:** End-to-end traceability from user pain points → product goals → features → technical requirements → acceptance criteria. Ensures every user need is addressed and every feature is testable.

---

## 1. Pain Point → Goal → Feature Traceability

| ID | User Pain Point | Product Goal (PRD §5) | Feature (PRD §6) | Priority |
|----|----------------|----------------------|-------------------|----------|
| PP-01 | "I don't know what foods spike my blood sugar" | Reduce food anxiety by 50% (Day 30 survey) | Core Scan (§6.2), GL Budget Tracker (§6.3) | P0 |
| PP-02 | "Glycemic Index is confusing — portion size matters" | Provide accurate, actionable GL-based guidance | Core Scan with GL formula (§6.2), Confidence Scoring (§6.2) | P0 |
| PP-03 | "I don't know what order to eat my food in" | Increase food sequencing adoption to 30% | Food Sequencing Coach (§6.5) | P0 |
| PP-04 | "I want to know what to eat instead, not just what to avoid" | Swap acceptance rate ≥25% | Safer Swap Engine (§6.6) | P0 |
| PP-05 | "I can't track my A1C progress day-to-day" | 40% of premium users log ≥2 A1C values in 90 days | A1C Progress Tracker (§6.4) | P0 |
| PP-06 | "I don't know what to do after eating a high-GL meal" | 30% walk completion rate for MODERATE/HIGH meals | Post-Meal Actions (§6.8) | P0 |
| PP-07 | "Apps make me feel guilty about food choices" | Hope-based design; food is not the enemy | UX Design Principles (§8.1), Warm tone in all copy | P0 |
| PP-08 | "I want to see if my efforts are working over time" | Weekly Active Scanners ≥7,500 at Month 12 | Weekly Insights (§6.7), A1C Progress Tracker (§6.4) | P0 |
| PP-09 | "I eat the same meals frequently and re-scanning is tedious" | Reduce repeat scan cost to $0 | Meal Templates/Favorites (§6.13), pHash Cache | P1 |
| PP-10 | "I want to learn why GL matters, not just see numbers" | Educational engagement (Premium feature) | Educational Content Library (§6.9) | P1 |
| PP-11 | "Packaged food — I just want to scan the barcode" | Barcode scan for packaged foods | Barcode Scanner (§6.11) | P1 |
| PP-12 | "I want to share my progress with others" | Community engagement (V2.0) | Social Features (§6.12), Shareable Cards | P2/P3 |
| PP-13 | "My CGM data should integrate with meal data" | CGM-connected user engagement | CGM Integration (§6.10) | P2 |
| PP-14 | "I need to try the app before committing to pay" | 6–10% free-to-paid conversion | Guest Mode, Free Tier (5 scans/day), 7-day Trial | P0 |
| PP-15 | "I'm worried about my health data privacy" | GDPR/CCPA compliance; trust score | GDPR Export/Deletion, Disclaimers, Consent Flow | P0 |

---

## 2. Feature → Technical Requirement → Acceptance Criteria Traceability

### 2.1 Onboarding (PRD §6.1)

| Requirement ID | Technical Requirement | SPEC Section | Acceptance Criteria |
|---------------|----------------------|-------------|-------------------|
| REQ-015 | COPPA age gate — block under 13 | §4.1.2 | VAL-014: No data collected for under-13 |
| REQ-016 | GDPR health data consent — separate checkbox | §4.1.2 | VAL-015: Consent recorded in database |
| REQ-004 | GL budget auto-set based on dietary profile | §4.1.2 | Validation rules: 80 standard, 100 vegetarian/vegan |
| — | Onboarding completion rate | §6.1 | VAL-002: ≥80% completion, first scan within 90s |

### 2.2 Core Scan (PRD §6.2)

| Requirement ID | Technical Requirement | SPEC Section | Acceptance Criteria |
|---------------|----------------------|-------------|-------------------|
| REQ-001 | Analyze meal photos via GPT-4o Vision | §4.1.3, §4.2.1 | VAL-001: ≥85% spike risk accuracy |
| REQ-002 | Classify spike risk: SAFE/MODERATE/HIGH | §4.1.3 | VAL-001: Correct classification |
| REQ-003 | GL = (GI × net_carbs) / 100 | §4.2.1 | Formula in master prompt |
| REQ-012 | Safety floor overrides | §4.2.3 | VAL-009: 100% coverage for specified categories |
| REQ-013 | Conservative bias correction | §4.2.6 | VAL-020: +10% MEDIUM, +20% LOW |
| REQ-014 | Confidence scoring (HIGH/MEDIUM/LOW) | §4.2.4 | VAL-019: Matches spec rules |
| REQ-022 | Editable portion sizes | §4.1.3 | VAL-025: GL recalculation within 500ms |
| — | Scan response time | §4.1.3 | VAL-003: P95 ≤ 5s (single-pass) |
| — | Scan disclaimer | §4.1.3 | VAL-017: Visible on every result |
| — | Scan corrections | §4.1.13 | VAL-026: Button on every scan, correction saved |

### 2.3 Daily GL Budget Tracker (PRD §6.3)

| Requirement ID | Technical Requirement | SPEC Section | Acceptance Criteria |
|---------------|----------------------|-------------|-------------------|
| REQ-004 | Configurable GL budget per user | §4.1.2, §4.1.4 | Budget in dashboard response |
| REQ-021 | Streak tracking | §4.3.6 | VAL-006: 100% correct streak logic |
| — | GL gauge real-time update | §4.1.4, §4.4.4 | VAL-005: Within 2s, ±0.1 GL |
| — | Midnight reset in user timezone | §4.4.4 | VAL-024: Correct timezone handling |

### 2.4 A1C Progress Tracker (PRD §6.4)

| Requirement ID | Technical Requirement | SPEC Section | Acceptance Criteria |
|---------------|----------------------|-------------|-------------------|
| REQ-007 | A1C estimation from GL adherence | §4.2.5 | VAL-007: Algorithm matches spec |
| REQ-008 | ±0.2 error bounds displayed | §4.2.5 | VAL-016: Bounds on every estimate |
| REQ-009 | Medical disclaimer on every A1C display | §4.1.5 | VAL-016: "Estimate only — verify with laboratory A1C test" |
| — | Divergence warning | §4.1.5 | VAL-018: Triggers when |est - lab| > 0.3 |

### 2.5 Food Sequencing Coach (PRD §6.5)

| Requirement ID | Technical Requirement | SPEC Section | Acceptance Criteria |
|---------------|----------------------|-------------|-------------------|
| — | Sequencing advice in scan response | §4.1.3, §4.2.1 | Vegetables → protein → carbs order |
| — | Citation: Shukla et al. 2019 | §4.2.1 | Citation in response JSON |
| — | Premium-only gating | §5.1 | VAL-023: Free users see null |

### 2.6 Safer Swap Engine (PRD §6.6)

| Requirement ID | Technical Requirement | SPEC Section | Acceptance Criteria |
|---------------|----------------------|-------------|-------------------|
| REQ-006 | Swap suggestions respecting dietary restrictions | §4.1.3, §4.2.1 | VAL-008: 100% dietary compliance |
| — | GL savings displayed | §4.1.3 | `glSaved` field in response |
| — | Taste tips included | §4.1.3 | `tasteTip` field in response |

### 2.7 Meal History & Pattern Analysis (PRD §6.7)

| Requirement ID | Technical Requirement | SPEC Section | Acceptance Criteria |
|---------------|----------------------|-------------|-------------------|
| — | Weekly insights generation | §4.1.6 | Insights array in response (Premium) |
| — | Free tier: 7-day history | §5.1 | VAL-023: Server-enforced |
| — | Top spike food identification | §4.1.6, §4.3.4 | Normalized food_items enables query |

### 2.8 Post-Meal Actions (PRD §6.8)

| Requirement ID | Technical Requirement | SPEC Section | Acceptance Criteria |
|---------------|----------------------|-------------|-------------------|
| REQ-020 | Push notification 5 min after MODERATE/HIGH | §4.1.7 | VAL-021: ±30s timing |
| — | Walk timer with duration tracking | §4.1.7 | VAL-022: ±5s accuracy |
| — | Walk linked to specific meal | §4.1.7, §4.3.7 | `scan_id` FK in activities table |

### 2.9 Educational Content (PRD §6.9)

| Requirement ID | Technical Requirement | SPEC Section | Acceptance Criteria |
|---------------|----------------------|-------------|-------------------|
| — | Paginated article list | §4.1.8 | Pagination in response |
| — | Free: 5 articles; Premium: full library | §5.1 | VAL-023: `isPremium` flag enforced |
| — | Relevance scoring | §4.1.8 | `relevanceScore` in response |

### 2.10 Guest Mode

| Requirement ID | Technical Requirement | SPEC Section | Acceptance Criteria |
|---------------|----------------------|-------------|-------------------|
| REQ-011 | Guest auth (no email/password) | §4.1.1 | VAL-013: 3 scans, data preserved |
| — | Guest → full account conversion | §4.1.1 | `scansPreserved` in response |
| — | Auto-purge unconverted guests (30 days) | §4.1.1 | Scheduled purge job |

### 2.11 GDPR Compliance

| Requirement ID | Technical Requirement | SPEC Section | Acceptance Criteria |
|---------------|----------------------|-------------|-------------------|
| REQ-017 | Data export (JSON) | §4.1.9 | VAL-010: <10 seconds |
| REQ-018 | Account deletion (soft-delete + 30-day purge) | §4.1.9 | VAL-011: 100% data removal |
| — | Health data consent | §4.1.2 | VAL-015: Separate checkbox |
| — | COPPA age gate | §4.1.2 | VAL-014: Under-13 blocked |

### 2.12 Rate Limiting & Monetization

| Requirement ID | Technical Requirement | SPEC Section | Acceptance Criteria |
|---------------|----------------------|-------------|-------------------|
| REQ-010 | Free tier: 5 scans/day server-enforced | §4.4.2 | VAL-012: 429 at 6th scan |
| — | Premium: 100 scans/day | §4.4.2 | Rate limit key check |
| — | RevenueCat subscription management | §5 | VAL-027: Tier update within 60s |
| — | Paywall triggers | §5.3 | Free → paywall on limit/feature |

---

## 3. Audit Issue → Resolution Location Traceability

| Audit Issue # | Issue Summary | Resolved In | Section |
|--------------|---------------|-------------|---------|
| ISS-001 | "Reversal" language in feature name | PRD v2.0 | §6.4 (renamed to "A1C Progress Tracker") |
| ISS-002 | Missing A1C estimation algorithm | SPEC v2.0 | §4.2.5 (full Rust implementation) |
| ISS-003 | No ±0.2 error bounds specified | SPEC v2.0 | §4.2.5, §4.1.5 (mandatory display) |
| ISS-004 | Missing GDPR data export endpoint | SPEC v2.0 | §4.1.9 (GET /user/export) |
| ISS-005 | Missing GDPR account deletion endpoint | SPEC v2.0 | §4.1.9 (DELETE /user/account) |
| ISS-006 | No COPPA age gate | SPEC v2.0 | §4.1.2 (ageConfirmed validation) |
| ISS-007 | No health data consent (GDPR Art. 9) | SPEC v2.0 | §4.1.2 (healthDataConsent) |
| ISS-008 | App Store age rating inconsistency | PRD v2.0 | §10.4 (standardized to 12+) |
| ISS-009 | Missing safety floor logic | SPEC v2.0 | §4.2.3 (Rust implementation) |
| ISS-010 | No confidence scoring | SPEC v2.0 | §4.2.4 (HIGH/MEDIUM/LOW rules) |
| ISS-011 | No conservative bias correction | SPEC v2.0 | §4.2.6 (Rust implementation) |
| ISS-012 | Pricing inconsistency ($9.99 vs $12.99) | PRD v2.0 | §9.2 (canonical: $12.99/$99.99/$249.99) |
| ISS-013 | Missing App Store commission in COGS | PRD v2.0 | §9.5 (30% Year 1, 15% Year 2+) |
| ISS-014 | API format unspecified (JSON vs multipart) | SPEC v2.0 | §4.1.3 (multipart/form-data for scan) |
| ISS-015 | camelCase vs snake_case inconsistency | SPEC v2.0 | §4.1 (standardized: camelCase JSON) |
| ISS-016 | No guest mode endpoint | SPEC v2.0 | §4.1.1 (POST /auth/guest + /guest/convert) |
| ISS-017 | Rate limit 429 response missing headers | SPEC v2.0 | §4.1.3 (retryAfterSeconds, scansRemaining) |
| ISS-018 | No scan corrections endpoint | SPEC v2.0 | §4.1.13 (POST /scan/corrections) |
| ISS-019 | Food items stored as JSONB (not normalized) | SPEC v2.0 | §4.3.4 (normalized food_items table) |
| ISS-020 | Timeline too aggressive (8 weeks → 11-13 weeks) | PRD v2.0 | §12.1 (15 weeks total with testing) |
| ISS-021 | No OpenAI DPA mentioned | PRD v2.0 | §10.3 (pre-launch blocker) |
| ISS-022 | No DPIA documented | PRD v2.0 | §10.3 (pre-launch blocker) |
| ISS-023 | Missing FTC health claims review | PRD v2.0 | §10.2 (mandatory pre-launch) |
| ISS-024 | No trademark search | PRD v2.0 | §10.6, §14 Risk 11 |
| ISS-025 | Unsubstantiated efficacy claims | PRD v2.0 | §10.1, §10.2 (wellness language) |
| ISS-026 | No complexity classifier specified | SPEC v2.0 | §4.2.2 (SIMPLE/COMPLEX_B/COMPLEX_C) |
| ISS-027 | Two-pass architecture undefined | SPEC v2.0 | §4.2.2 (routing logic, V1.1) |
| ISS-028 | No dish name shortcut | SPEC v2.0 | §4.2.2, §4.3.11 (dish_gl_database) |
| ISS-029 | No editable portion endpoint | SPEC v2.0 | §4.1.3 (VAL-025) |
| ISS-030 | RevenueCat entitlement map missing | SPEC v2.0 | §5.1 (full entitlement table) |
| ISS-031 | No server-side verification for subscriptions | SPEC v2.0 | §5.4 (webhook flow) |
| ISS-032 | Missing acceptance criteria for 11 features | SPEC v2.0 | §10.1 (30 VAL criteria) |
| ISS-033 | No PRD→SPEC coverage matrix | SPEC v2.0 | §10.2 (full matrix) |
| ISS-034 | Walk endpoint missing completion | SPEC v2.0 | §4.1.7 (POST /walk/complete) |
| ISS-035 | No survey endpoint | SPEC v2.0 | §4.1.12 (POST /user/survey) |
| ISS-036 | Missing shareable card endpoint | SPEC v2.0 | §4.1.10 (GET /share/weekly-card) |
| ISS-037 | Missing monthly report endpoint | SPEC v2.0 | §4.1.11 (GET /reports/monthly) |
| ISS-038 | No refresh token rotation specified | SPEC v2.0 | §4.1.1 (one-time-use, theft detection) |
| ISS-039 | Refresh token storage unspecified | SPEC v2.0 | §4.4.3 (Redis with TTL) |
| ISS-040 | No pHash implementation details | SPEC v2.0 | §4.4.1 (64-bit DCT, image_hasher) |
| ISS-041 | Hamming distance threshold unspecified | SPEC v2.0 | §4.4.1 (exact match, distance=0) |
| ISS-042 | Missing daily GL Redis cache | SPEC v2.0 | §4.4.4 (daily_gl key with TTL) |
| ISS-043 | No scan mode (already ate vs planning) | SPEC v2.0 | §4.1.3 (scanMode field) |
| ISS-044 | Planning mode GL not logged to budget | SPEC v2.0 | §4.1.3 ("logged": false) |
| ISS-045 | No daily score grading defined | SPEC v2.0 | §4.1.4 (A/B/C/D grading) |
| ISS-046 | Free user cost burden unmodeled | PRD v2.0 | §9.5 (circuit breaker: 5→3 scans) |
| ISS-047 | No CGM cost in financial model | PRD v2.0 | §9.5 note (excluded from MVP COGS) |
| ISS-048 | Churn rate optimistic (5%) | PRD v2.0 | §13.2 (<7% realistic, <5% target) |
| ISS-049 | No penetration test mentioned | SPEC v2.0 | §11.3 (pre-launch required) |
| ISS-050 | No OWASP scanning | SPEC v2.0 | §11.3 (ZAP/Burp monthly) |
| ISS-051 | K6 scenarios incomplete | SPEC v2.0 | §7.2 (5 scenarios with targets) |
| ISS-052 | No "reversal" language CI check | SPEC v2.0 | §11.4 (grep in CI pipeline) |
| ISS-053 | Missing disclaimer validation in CI | SPEC v2.0 | §11.4 (UI automated test) |
| ISS-054 | No RLS verification tests | SPEC v2.0 | §11.3 (SQL test suite in CI) |
| ISS-055 | Missing analytics consent for EU | PRD v2.0 | §10.3 (conditional PostHog load) |
| ISS-056 | No cross-border transfer mechanisms | PRD v2.0 | §10.3 (SCCs with providers) |
| ISS-057 | No breach notification protocol | PRD v2.0 | §10.3 (72-hour notification) |
| ISS-058 | No liability insurance mentioned | PRD v2.0 | §10.6, §14 Risk 15 |
| ISS-059 | Scaling migration path undefined | SPEC v2.0 | §9.1 (Railway→Fly.io→AWS ECS) |
| ISS-060 | No secondary AI provider evaluation | PRD v2.0 | §14 Risk 2 (Anthropic Claude eval) |

---

## 4. Feasibility Blocker → Resolution Traceability

| Blocker # | Feasibility Blocker | Resolution | Document | Section |
|-----------|-------------------|------------|----------|---------|
| BLK-01 | A1C estimation algorithm unspecified | Full Rust algorithm with error bounds | SPEC v2.0 | §4.2.5 |
| BLK-02 | "Reversal" language throughout documents | All instances replaced with wellness language | PRD v2.0 + SPEC v2.0 | §10.1, all feature names |
| BLK-03 | Missing GDPR endpoints (export, deletion) | Both endpoints fully specified | SPEC v2.0 | §4.1.9 |
| BLK-04 | No DPIA planned | DPIA listed as pre-launch blocker | PRD v2.0 | §10.3, §10.6 |
| BLK-05 | No OpenAI DPA | DPA listed as pre-launch blocker | PRD v2.0 | §10.3, §10.6 |
| BLK-06 | App Store commission omitted from COGS | Included with Year 1 (30%) and Year 2+ (15%) rates | PRD v2.0 | §9.5 |
| BLK-07 | Pricing inconsistency ($9.99 vs $12.99) | Canonical prices: $12.99/$99.99/$249.99 | PRD v2.0 | §9.2 |
| BLK-08 | No FTC health claims attorney review | Listed as pre-launch blocker ($3-5K) | PRD v2.0 | §10.2, §10.6 |

---

## 5. Cross-Document Consistency Checkpoints

| Checkpoint | PRD v2.0 Value | SPEC v2.0 Value | Status |
|-----------|---------------|-----------------|--------|
| Monthly price | $12.99 | $12.99 (§5.2) | ✅ Consistent |
| Annual price | $99.99 | $99.99 (§5.2) | ✅ Consistent |
| Lifetime price | $249.99 | $249.99 (§5.2) | ✅ Consistent |
| Free scan limit | 5/day | 5/day (§4.4.2) | ✅ Consistent |
| Premium scan limit | 100/day | 100/day (§4.4.2) | ✅ Consistent |
| Spike risk enum | SAFE/MODERATE/HIGH | SAFE/MODERATE/HIGH | ✅ Consistent |
| GL thresholds | ≤10/11-19/≥20 | ≤10/11-19/≥20 | ✅ Consistent |
| GL formula | (GI × net_carbs) / 100 | (GI × net_carbs) / 100 | ✅ Consistent |
| A1C error bounds | ±0.2 | ±0.2 | ✅ Consistent |
| API naming | camelCase | camelCase (§4.1) | ✅ Consistent |
| Scan format | multipart/form-data | multipart/form-data (§4.1.3) | ✅ Consistent |
| Cache strategy | pHash exact match | Hamming distance = 0 (§4.4.1) | ✅ Consistent |
| App age rating | 12+ | N/A (PRD-owned) | ✅ No conflict |
| "Reversal" usage | Zero occurrences | Zero occurrences | ✅ Consistent |
| Feature name | A1C Progress Tracker | A1C Tracking (§4.1.5) | ✅ Consistent |
| Default GL budget | 80 (100 vegetarian) | 80 (100 vegetarian) (§4.1.2) | ✅ Consistent |
| Guest scan limit | 3 total | 3 total (§4.1.1) | ✅ Consistent |
| Photo retention | 90 days full, indefinite thumb | 90 days full, indefinite thumb (§2.4) | ✅ Consistent |
| Scan P95 target | <5s single-pass | ≤5s (§PER-001) | ✅ Consistent |
| GDPR export target | <10s | <10s (§PER-005) | ✅ Consistent |

---

**END OF DOCUMENT — Revora Traceability Matrix v1.0**

*Document Version 1.0 | Last Updated: 2026-03-15*
