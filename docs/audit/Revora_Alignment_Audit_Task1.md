<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# TASK 1 REPORT: AUDIT FINDINGS

**Date:** 2026-03-15  
**Auditor:** Senior Technical Program Manager / Principal Engineer  
**Scope:** All 10 Revora documents (PRD v2.0, Tech Spec v2.0, Master Plan v1.1, 7 Domain Plans + QA Plan)  
**Source of Truth Hierarchy:** [1] PRD → [2] Tech Spec → [3] Master Plan → [4-10] Domain Plans

---

## SUMMARY DASHBOARD

| Category          | Count | Critical | High | Medium | Low |
|-------------------|-------|----------|------|--------|-----|
| Conflicts         | 14    | 4        | 6    | 3      | 1   |
| Gaps              | 11    | 3        | 5    | 3      | 0   |
| Ambiguities       | 8     | 0        | 4    | 3      | 1   |
| Structural Issues | 12    | 2        | 5    | 4      | 1   |
| Scope Creep       | 6     | 0        | 1    | 3      | 2   |
| **TOTAL**         | **51**| **9**    | **21**| **16** | **5**|

---

## SECTION 1.1 — CONFLICTS

---

### CONFLICT-1 | Severity: CRITICAL
**Files:** Monetization Plan vs PRD §9.2 / Tech Spec §5.2 / Master Plan §1  
**Topic:** Pricing — Monthly and Annual prices wrong in Monetization Plan  
**Monetization Plan says:** "$9.99/month" and "$79.99/year" (MON-003, MON-004, MON-005, SC-010 §5)  
**PRD §9.2 says:** "$12.99/month" and "$99.99/year"  
**Tech Spec §5.2 says:** "$12.99/month" and "$99.99/year"  
**Master Plan says:** "$12.99/month, $99.99/year, $249.99 lifetime" (BLK-009)  
**Source of Truth (PRD) says:** "$12.99/month, $99.99/year, $249.99 lifetime"  
**FIX REQUIRED IN:** Monetization Plan — MON-003, MON-004, MON-005, SC-010 §5, every pricing reference  
**Fix:** Replace all instances of "$9.99/month" with "$12.99/month" and "$79.99/year" with "$99.99/year". Add lifetime tier "$249.99" which is completely missing from Monetization Plan. Update the revenue model line in the plan header from "$9.99/month Premium unlimited" to "$12.99/month Premium". Update all revenue projections and pricing rationale sections accordingly. Update discount percentage from "33%" to "36%" (annual vs monthly).

---

### CONFLICT-2 | Severity: CRITICAL
**Files:** Monetization Plan vs PRD §9.2  
**Topic:** Lifetime tier completely missing from Monetization Plan  
**Monetization Plan says:** Only 2 tiers — Monthly ($9.99) and Annual ($79.99). No lifetime tier mentioned anywhere.  
**PRD §9.2 says:** 3 tiers — Monthly ($12.99), Annual ($99.99), Lifetime ($249.99)  
**Tech Spec §5.2 says:** 3 products including `revora_lifetime` at $249.99  
**Master Plan says:** "$12.99/$99.99/$249.99" (BLK-009)  
**Source of Truth (PRD) says:** "$249.99 one-time" lifetime tier exists  
**FIX REQUIRED IN:** Monetization Plan — MON-003, MON-004, MON-007, IAP-001, IAP-002  
**Fix:** Add lifetime product configuration for both App Store Connect (MON-003) and Google Play Console (MON-004). Add `revora_lifetime` product to RevenueCat configuration (MON-007). Update purchase flow (IAP-001) to handle one-time purchase (non-auto-renewing). Update restore flow (IAP-002) to handle lifetime purchases.

---

### CONFLICT-3 | Severity: CRITICAL
**Files:** AI/ML Plan vs PRD §6.2 / Tech Spec §4.2.3  
**Topic:** Safety floor categories — count and values mismatch  
**AI/ML Plan says:** 8 categories with different values — White bread: 10 GL/slice, Potatoes: 15 GL, Sugary beverages: 15 GL/12oz, Pastries/cakes: 20 GL, Candy/sweets: 15 GL, Fruit juice: 12 GL/8oz  
**PRD §6.2 says:** 6 categories — White rice (20), Pasta (18), White bread (16), Fruit juice (15), Sweetened beverage (20), Baked goods (15)  
**Tech Spec §4.2.3 says:** 6 categories — white_rice (20), pasta (18), white_bread (16), fruit_juice (15), sweetened_beverage (20), baked_goods (15)  
**Backend Plan (BE-038) says:** 8 categories with yet different values — white_bread (16), potato (18), candy (20)  
**Source of Truth (PRD) says:** 6 categories with the values listed in §6.2  
**FIX REQUIRED IN:** AI/ML Plan (AI-008), Backend Plan (BE-038)  
**Fix:** Align to PRD's 6 categories and exact GL floor values. The AI/ML Plan's "Potatoes" and "Candy/sweets" categories are NOT in the PRD or Spec — they are scope creep (flag as SCOPE-1 below). White bread must be 16 GL (not 10). Fruit juice must be 15 GL (not 12). Remove potato and candy from MVP safety floors. If the team wants to add them, they require PRD sign-off first.

---

### CONFLICT-4 | Severity: CRITICAL
**Files:** AI/ML Plan vs Tech Spec §4.2.5  
**Topic:** A1C estimation algorithm — completely different formula  
**AI/ML Plan (AI-017) says:** Adherence calculated as `days_under_budget / 14 × 100` with tiers: ≥85% → Baseline - 0.3%, 70-84% → Baseline - 0.1%, 50-69% → no change, <50% → Baseline + 0.2%  
**Tech Spec §4.2.5 says:** Adherence = `avg_14d / gl_budget` with daily_change tiers: ≤0.75 → -0.00444/day, ≤1.0 → -0.00444×0.6/day, ≤1.25 → 0.0/day, >1.25 → +0.00444×0.3/day. Result = `(baseline + daily_change × days).clamp(4.0, 14.0)`  
**PRD §6.4 says:** Identical Rust code to Tech Spec §4.2.5  
**Source of Truth (PRD/Spec) says:** The continuous daily-change formula from Spec §4.2.5  
**FIX REQUIRED IN:** AI/ML Plan — AI-017  
**Fix:** Replace the tier-based discrete formula in AI-017 with the exact continuous daily-change formula from Spec §4.2.5. The AI/ML Plan's formula is a fundamentally different algorithm that would produce different A1C estimates. This is a safety-critical change.

---

### CONFLICT-5 | Severity: HIGH
**Files:** AI/ML Plan vs Tech Spec §4.2.2  
**Topic:** Complexity classification categories  
**AI/ML Plan (AI-006) says:** SIMPLE / MODERATE / COMPLEX  
**Tech Spec §4.2.2 says:** SIMPLE / COMPLEX_B / COMPLEX_C  
**PRD §7.5 says:** SIMPLE / COMPLEX_B / COMPLEX_C  
**Source of Truth (Spec) says:** SIMPLE / COMPLEX_B / COMPLEX_C  
**FIX REQUIRED IN:** AI/ML Plan — AI-006, AI-012, and all references to "MODERATE" and "COMPLEX"  
**Fix:** Replace "MODERATE" with "COMPLEX_B" and "COMPLEX" with "COMPLEX_C" throughout the AI/ML Plan. Update the classification criteria to match Spec §4.2.2 definitions.

---

### CONFLICT-6 | Severity: HIGH
**Files:** AI/ML Plan vs Tech Spec §4.2.4  
**Topic:** GL range calculation — ±3/±5 vs ±20%/±35%  
**AI/ML Plan (AI-013) says:** MEDIUM → ±3 GL range, LOW → ±5 GL range  
**Tech Spec §4.2.4 says:** MEDIUM → GL range ±20%, LOW → GL range ±35%  
**Backend Plan (BE-041) says:** MEDIUM → ±20%, LOW → ±35% (matches Spec)  
**Source of Truth (Spec) says:** ±20% and ±35% (percentage-based)  
**FIX REQUIRED IN:** AI/ML Plan — AI-013  
**Fix:** Replace ±3/±5 absolute GL range with ±20%/±35% percentage-based range to match Spec §4.2.4 and Backend Plan BE-041.

---

### CONFLICT-7 | Severity: HIGH
**Files:** Security/Compliance Plan vs PRD §10 / Tech Spec §SEC-011  
**Topic:** OpenAI agreement type — BAA vs DPA  
**Security/Compliance Plan (SC-001) says:** "OpenAI Business Associate Agreement (BAA)" — references HIPAA throughout, describes BAA request process via Enterprise sales team  
**PRD §7.7 / §10.3 says:** "OpenAI DPA execution: pre-launch blocker" — Data Processing Agreement (GDPR Art. 28)  
**Tech Spec §SEC-011 says:** "OpenAI DPA executed as pre-launch blocker"  
**Master Plan (BLK-002) says:** "OpenAI DPA executed (Data Processing Agreement signed)"  
**Source of Truth (PRD) says:** DPA (Data Processing Agreement) for GDPR compliance  
**FIX REQUIRED IN:** Security/Compliance Plan — SC-001  
**Fix:** Rename SC-001 from "BAA Execution" to "DPA Execution". Revora is explicitly NOT a HIPAA-covered entity (PRD §10.3 states this clearly). A BAA is unnecessary and legally inaccurate. The correct agreement is a DPA under GDPR Art. 28. Replace all HIPAA/BAA language with GDPR/DPA language. Update the request process from "Enterprise sales team" to "self-service in OpenAI console" (per Master Plan). Change estimated effort from 6 hours to 30 minutes (per Master Plan).

---

### CONFLICT-8 | Severity: HIGH
**Files:** Security/Compliance Plan vs PRD §10.3  
**Topic:** HIPAA classification — Plan treats Revora as HIPAA-covered  
**Security/Compliance Plan says:** Extensive HIPAA references, "PHI" terminology throughout, BAA requirements for all vendors  
**PRD §10.3 says:** "Revora is NOT a HIPAA-covered entity (not healthcare provider/plan/clearinghouse). However, A1C values and meal logs are treated as PHI-equivalent with voluntary HIPAA-grade protections."  
**Source of Truth (PRD) says:** Not HIPAA-covered; voluntary PHI-equivalent protections  
**FIX REQUIRED IN:** Security/Compliance Plan — SC-001 through SC-004, SC-013  
**Fix:** Remove mandatory HIPAA/BAA requirements. Replace with GDPR DPA requirements (which are actually legally required). Rename all "BAA" references to "DPA". Keep voluntary PHI-grade protections as best practice but clarify they are voluntary, not legally mandated under HIPAA.

---

### CONFLICT-9 | Severity: HIGH
**Files:** Product/Design Plan vs PRD §8.3  
**Topic:** Color palette mismatch  
**Product/Design Plan (PD-001) says:** Primary: `#20B2AA` (teal), Success: `#22C55E`, Warning: `#EAB308`, Error: `#EF4444`, Background: `#F9FAFB`, Text: `#1F2937`  
**PRD §8.3 says:** Primary: `#0D7377` (Deep Teal), Safe Green: `#4CAF50`, Moderate Yellow: `#FF9800`, High Red: `#F44336`, Background: `#FAFAFA`, Text: `#333333`  
**Source of Truth (PRD) says:** The colors in PRD §8.3  
**FIX REQUIRED IN:** Product/Design Plan — PD-001, DESIGN-TOKENS.md  
**Fix:** Align all color tokens to PRD §8.3 values. Primary must be `#0D7377`, Safe/Success must be `#4CAF50`, Warning must be `#FF9800`, Error/High must be `#F44336`. Note: Frontend Plan (FE-012, FE-033a) also references `#4CAF50` and `#FF9800` (PRD values), confirming PRD as authoritative. The Product/Design Plan's Tailwind-style palette deviates from the PRD's specified brand colors.

---

### CONFLICT-10 | Severity: HIGH
**Files:** Frontend Plan (FE-012) vs PRD §8.2  
**Topic:** Tab count — 5 tabs vs 4 tabs  
**Frontend Plan (FE-012) says:** 5 tabs — Today, Scan (FAB), Progress, Learn, Profile  
**PRD §8.2 says:** 4 tabs — Home (Dashboard), Scan (Camera FAB), Progress, Profile  
**Tech Spec §6.1 says:** 4 tabs — index (Home/Dashboard), scan (Camera/FAB), progress (A1C+History), profile (Settings)  
**Source of Truth (PRD) says:** 4 tabs  
**FIX REQUIRED IN:** Frontend Plan — FE-012  
**Fix:** Remove "Learn" as a separate tab. Educational content (PRD §6.9) is P1 V1.1 and should be accessible via the Progress tab or Profile, not its own tab in MVP. Align to PRD's 4-tab structure.

---

### CONFLICT-11 | Severity: MEDIUM
**Files:** Security/Compliance Plan (SC-013) vs Master Plan (BLK-003)  
**Topic:** DPIA timeline  
**Security/Compliance Plan (SC-013) says:** DPIA scheduled for Week 3  
**Master Plan (BLK-003) says:** DPIA target Week 10  
**Source of Truth (Master Plan) says:** Week 10  
**FIX REQUIRED IN:** Security/Compliance Plan — SC-013  
**Fix:** Move DPIA from Week 3 to Week 10 to align with Master Plan. Week 3 is too early (DPAs may not all be signed yet). Week 10 provides sufficient time before launch while allowing beta-informed risk assessment.

---

### CONFLICT-12 | Severity: MEDIUM
**Files:** QA Plan (QA-002) vs Tech Spec §7  
**Topic:** Backend testing framework — pytest vs cargo test  
**QA Plan (QA-002) says:** Uses "pytest + httpx" for backend testing, Python test wrapper  
**Tech Spec §7.1 says:** `cargo test --all-features` for backend testing  
**Backend Plan says:** Rust `cargo test` throughout  
**Source of Truth (Spec) says:** cargo test (Rust-native)  
**FIX REQUIRED IN:** QA Plan — QA-002  
**Fix:** Primary backend testing must use `cargo test` (Rust-native). Python/pytest may be used as a supplementary integration test layer for HTTP-level API testing, but it should not be presented as the primary backend test framework. Clarify the dual approach: Rust unit tests (cargo test) + optional Python integration tests (pytest/httpx).

---

### CONFLICT-13 | Severity: MEDIUM
**Files:** Product/Design Plan (PD-010) vs PRD §6.1 / Master Plan  
**Topic:** Onboarding screen count in Figma  
**Product/Design Plan (PD-010) says:** Screen 1 is "Onboarding (3 slides + CTA)" — a carousel-style design  
**PRD §6.1 says:** 6 distinct onboarding screens (Welcome, A1C Entry, Goal, Dietary Profile, GL Education, Age/Consent)  
**Master Plan says:** "Onboarding flow (6 screens)"  
**Source of Truth (PRD) says:** 6 screens  
**FIX REQUIRED IN:** Product/Design Plan — PD-010  
**Fix:** Replace "3 slides + CTA" onboarding with 6 distinct screens matching PRD §6.1. The Figma file must include all 6: Welcome, A1C Entry, Goal Setting, Dietary Profile, GL Budget Education, Age Gate + Consent.

---

### CONFLICT-14 | Severity: LOW
**Files:** Backend Plan (BE-039) vs Tech Spec §4.2.6  
**Topic:** Conservative bias — extra "Unknown" confidence level  
**Backend Plan (BE-039) says:** Adds `Confidence::Unknown => gl * 1.30` (30% bias for unknown confidence)  
**Tech Spec §4.2.6 says:** Only 3 levels — High (1.0×), Medium (1.10×), Low (1.20×)  
**Source of Truth (Spec) says:** 3 levels only  
**FIX REQUIRED IN:** Backend Plan — BE-039  
**Fix:** Remove `Confidence::Unknown` variant. Map any unknown/unparseable confidence to `Low` (1.20×) as a safe default. The Spec does not define a 4th confidence tier.

---

## SECTION 1.2 — GAPS

---

### GAP-1 | Severity: CRITICAL
**Source:** PRD §6.2, Tech Spec §4.1.13  
**Requirement:** Scan Corrections endpoint — "Report Inaccurate Result" button and POST /api/v1/scan/corrections  
**Missing From:** AI/ML Plan has no task for processing/reviewing corrections; QA Plan has no validation test for corrections flow  
**Risk if Unaddressed:** User feedback loop broken — corrections collected but never reviewed, never used to improve prompts, VAL-026 partially untestable  
**FIX REQUIRED IN:** AI/ML Plan, QA Plan  
**Fix:** Add task in AI/ML Plan (Weeks 9-12) for reviewing scan corrections and feeding them into prompt iteration. Add VAL-026 test case in QA Plan.

---

### GAP-2 | Severity: CRITICAL
**Source:** PRD §9.3  
**Requirement:** 7-day free trial on annual plan — "No credit card required to start"  
**Missing From:** Monetization Plan has no trial implementation task. MON-003/MON-004 mention trial as "optional" but no concrete implementation task exists.  
**Risk if Unaddressed:** Key conversion strategy missing from launch — PRD explicitly defines this as part of conversion strategy  
**FIX REQUIRED IN:** Monetization Plan  
**Fix:** Add explicit task for configuring 7-day free trial in App Store Connect (MON-003) and Google Play Console (MON-004). Add trial handling in purchase flow (IAP-001). Add trial expiration webhook handling.

---

### GAP-3 | Severity: CRITICAL
**Source:** PRD §10.6  
**Requirement:** FTC health claims attorney review — listed as pre-launch blocker in PRD  
**Missing From:** Master Plan BLK register does not include FTC attorney review as a blocker. Security/Compliance Plan has SC-006 but it's not tracked as a Master Plan BLK.  
**Risk if Unaddressed:** App Store rejection for health claims, FTC enforcement action  
**FIX REQUIRED IN:** Master Plan (FLAG — cannot modify, recommend to Founder)  
**Fix:** Add BLK-019 to Master Plan: "FTC health claims attorney final sign-off complete" — target Week 14.

---

### GAP-4 | Severity: HIGH
**Source:** PRD §10.6  
**Requirement:** Trademark search for "Revora" — listed as required, 2-4 week lead time  
**Missing From:** No domain plan has a task for trademark search. Not in Security/Compliance Plan.  
**Risk if Unaddressed:** Trademark conflict discovered post-launch forces rename — catastrophic brand damage  
**FIX REQUIRED IN:** Security/Compliance Plan  
**Fix:** Add task SC-030: "Revora trademark search" — Week 1 (due to 2-4 week lead time). Cost: $500-$1K per PRD §14.

---

### GAP-5 | Severity: HIGH
**Source:** PRD §10.3  
**Requirement:** CCPA compliance — "Do Not Sell My Personal Information" link in settings  
**Missing From:** Frontend Plan has no task for CCPA "Do Not Sell" link. Security/Compliance Plan mentions CCPA only in GDPR context.  
**Risk if Unaddressed:** CCPA violation for California users  
**FIX REQUIRED IN:** Frontend Plan (Profile/Settings section), Security/Compliance Plan  
**Fix:** Add task in Frontend Plan for CCPA "Do Not Sell" toggle in Profile settings. Add CCPA section in Privacy Policy (SC-009).

---

### GAP-6 | Severity: HIGH
**Source:** PRD §10.3  
**Requirement:** Analytics consent banner for EU users — "conditionally load PostHog"  
**Missing From:** Frontend Plan has no EU analytics consent implementation. PostHog loads unconditionally.  
**Risk if Unaddressed:** GDPR violation — processing analytics data without consent for EU users  
**FIX REQUIRED IN:** Frontend Plan  
**Fix:** Add task: EU user detection (by timezone) → show analytics consent banner → conditionally initialize PostHog only after consent. Add to Week 3 (with onboarding).

---

### GAP-7 | Severity: HIGH
**Source:** PRD §10.3  
**Requirement:** Cross-border transfer SCCs with Railway.app, OpenAI, Cloudflare  
**Missing From:** Security/Compliance Plan does not mention Standard Contractual Clauses (SCCs) for cross-border data transfers  
**Risk if Unaddressed:** GDPR Art. 46 violation for data transfers to US-based processors  
**FIX REQUIRED IN:** Security/Compliance Plan  
**Fix:** Add task for verifying SCCs are included in DPAs with Railway.app, OpenAI, and Cloudflare. Most cloud providers include SCCs in their standard DPAs — verify and document.

---

### GAP-8 | Severity: HIGH
**Source:** Tech Spec §4.1.7  
**Requirement:** POST /api/v1/walk/complete endpoint  
**Missing From:** Backend Plan has BE-057 (walk start) and BE-058 (push notification) but no explicit task for walk completion endpoint  
**Risk if Unaddressed:** Walk timer cannot record completion — VAL-022 fails  
**FIX REQUIRED IN:** Backend Plan  
**Fix:** Add BE-058b: "POST /api/v1/walk/complete endpoint" — stores walkId, completedAt, durationMinutes in activities table.

---

### GAP-9 | Severity: MEDIUM
**Source:** PRD §13.3  
**Requirement:** Critical analytics events (scan_initiated, scan_completed, paywall_viewed, etc.)  
**Missing From:** No domain plan has a comprehensive analytics event implementation task. PostHog SDK is initialized but events are ad-hoc.  
**Risk if Unaddressed:** Cannot measure KPIs, A/B testing infrastructure incomplete  
**FIX REQUIRED IN:** Frontend Plan, Backend Plan  
**Fix:** Add task for implementing all critical analytics events listed in PRD §13.3. Track in both frontend (user actions) and backend (server events).

---

### GAP-10 | Severity: MEDIUM
**Source:** PRD §6.1  
**Requirement:** Guest mode — "Users can scan before creating an account"  
**Missing From:** QA Plan has no E2E test for guest flow (3 scans → conversion → data preserved)  
**Risk if Unaddressed:** Guest-to-user conversion may break silently — VAL-013 not validated in E2E  
**FIX REQUIRED IN:** QA Plan  
**Fix:** Add E2E test case: Guest scan (3 times) → upgrade prompt → register → verify all 3 scans preserved.

---

### GAP-11 | Severity: MEDIUM
**Source:** PRD §7.7, Tech Spec §SEC-010  
**Requirement:** Pre-launch penetration test  
**Missing From:** QA Plan has no penetration test coordination task. Security/Compliance Plan has SC-024 but it's not cross-referenced.  
**Risk if Unaddressed:** Pentest not coordinated with QA timeline  
**FIX REQUIRED IN:** QA Plan  
**Fix:** Add cross-reference to SC-024 (pentest) and schedule QA support for pentest remediation in Week 13-14.

---

## SECTION 1.3 — AMBIGUITIES

---

### AMBIGUITY-1 | Severity: HIGH
**Location:** AI/ML Plan — AI-006  
**Ambiguous Statement:** "SIMPLE: ≤3 visible food items" / "MODERATE: 4-6 items" / "COMPLEX: >6 items"  
**Problem:** Item-count-based classification conflicts with Spec's visual-complexity-based classification. A simple plate of 4 vegetables is "MODERATE" by item count but "SIMPLE" by visual complexity.  
**PRD/Spec Clarification:** Spec §4.2.2 defines by visual characteristics: "Single food item or clearly separated items" (SIMPLE), "Mixed dish where main ingredients are partially visible" (COMPLEX_B), "Opaque dish where ingredients cannot be determined visually" (COMPLEX_C)  
**Recommended Resolution:** Use Spec §4.2.2 visual-characteristics definitions, not item counts. The classifier prompt already matches Spec — the AI/ML Plan's text description contradicts its own prompt.  
**FIX REQUIRED IN:** AI/ML Plan — AI-006 description

---

### AMBIGUITY-2 | Severity: HIGH
**Location:** AI/ML Plan — AI-008  
**Ambiguous Statement:** Safety floors use "per cup", "per slice", "per 12 oz" etc. as portion references  
**Problem:** PRD §6.2 safety floor table uses "1 cup", "2 slices", "8oz" — different portion sizes than AI/ML Plan. Unclear which portion reference applies when AI detects a different portion size.  
**PRD/Spec Clarification:** PRD §6.2 has specific portions: White rice = 1 cup/20GL, White bread = 2 slices/16GL, Fruit juice = 8oz/15GL  
**Recommended Resolution:** Safety floors should be minimum GL thresholds regardless of detected portion. If AI estimates portion is smaller, the floor still applies. If portion is larger, AI estimate (which would be higher) applies. Document this logic explicitly.  
**FIX REQUIRED IN:** AI/ML Plan — AI-008, Backend Plan — BE-038

---

### AMBIGUITY-3 | Severity: HIGH
**Location:** Product/Design Plan — PD-010  
**Ambiguous Statement:** "8 core screens" listed as Onboarding, Login/Signup, Scan, GL Result, Dashboard, Advice Detail, Paywall, Settings  
**Problem:** Missing screens that exist in PRD: A1C Progress, Walk Timer, Meal History, Weekly Insights, Data Export. The "8 screens" is a subset, but it's presented as the complete set.  
**PRD/Spec Clarification:** PRD defines many more screens across features  
**Recommended Resolution:** Label these as "8 Phase 0-1 priority screens" and add a Phase 2 screen list: A1C Progress, Walk Timer, Meal History, Weekly Insights, Profile (expanded), Data Export.  
**FIX REQUIRED IN:** Product/Design Plan — PD-010

---

### AMBIGUITY-4 | Severity: HIGH
**Location:** Monetization Plan — MON-005  
**Ambiguous Statement:** "Free Tier: 5 scans/day" cost calculation: "150 scans/month × $0.02 = $3/user/month"  
**Problem:** 5 scans/day × 30 days = 150 scans, but most free users won't scan 5× daily every day. The cost model assumes 100% utilization which overstates free user burden. PRD §9.5 uses 75 scans/month (more realistic).  
**PRD/Spec Clarification:** PRD §9.5: "22,500 free users × 75 scans/month × $0.02"  
**Recommended Resolution:** Use PRD's 75 scans/month (50% utilization) as the planning assumption. Document both worst-case (150) and expected (75) scenarios.  
**FIX REQUIRED IN:** Monetization Plan — MON-005

---

### AMBIGUITY-5 | Severity: MEDIUM
**Location:** AI/ML Plan — AI-019  
**Ambiguous Statement:** Endpoint listed as "POST /api/v1/a1c/log"  
**Problem:** Tech Spec §4.1.5 defines the endpoint as "POST /api/v1/a1c" (not /a1c/log)  
**PRD/Spec Clarification:** Spec §4.1.5: POST /api/v1/a1c  
**Recommended Resolution:** Use Spec endpoint path: POST /api/v1/a1c  
**FIX REQUIRED IN:** AI/ML Plan — AI-019

---

### AMBIGUITY-6 | Severity: MEDIUM
**Location:** Product/Design Plan — PD-015, PD-016, PD-017  
**Ambiguous Statement:** Owner listed as "Person A" for component implementation  
**Problem:** Master Plan assigns Person B as Frontend/UX owner. Component library is frontend work. Having Person A (Backend/AI/DevOps) implement UI components contradicts role assignments.  
**PRD/Spec Clarification:** Master Plan: "Person B: Frontend/UX"  
**Recommended Resolution:** Change owner to Person B for all component implementation tasks (PD-015 through PD-018).  
**FIX REQUIRED IN:** Product/Design Plan — PD-015, PD-016, PD-017, PD-018

---

### AMBIGUITY-7 | Severity: MEDIUM
**Location:** QA Plan — QA-002, QA-004  
**Ambiguous Statement:** References "pytest" and "seed.sql" with non-existent table schemas (e.g., `meals` table with `food_description` column, `advice_cards` table)  
**Problem:** These tables and column names don't match Tech Spec §4.3. The Spec has `scans` and `food_items` tables, not a `meals.food_description` column or `advice_cards` table.  
**PRD/Spec Clarification:** Spec §4.3 defines the authoritative schema  
**Recommended Resolution:** Rewrite seed.sql to use Spec §4.3 schema tables and column names.  
**FIX REQUIRED IN:** QA Plan — QA-004

---

### AMBIGUITY-8 | Severity: LOW
**Location:** Frontend Plan — FE-014  
**Ambiguous Statement:** "Splash screen shows brand colors (#4CAF50 green on white)"  
**Problem:** FE-014 uses PRD's green (#4CAF50) while Product/Design Plan uses #22C55E. Which green?  
**PRD/Spec Clarification:** PRD §8.3: Safe Green #4CAF50  
**Recommended Resolution:** Use PRD's #4CAF50  
**FIX REQUIRED IN:** Product/Design Plan (align to PRD colors per CONFLICT-9)

---

## SECTION 1.4 — STRUCTURAL ISSUES

---

### STRUCT-1 | Type: STRUCTURAL
**Location:** Implementation_plans directory  
**Issue:** 8 files exist but Master Plan §5 references only 7 domain plans. The QA/Testing Implementation Plan is not listed in the Master Plan's domain coordination table.  
**Impact:** QA Plan is orphaned — no cross-domain dependencies tracked, no owner assignment in Master Plan, no gate alignment  
**Fix:** Either (a) add QA/Testing as an 8th domain plan in Master Plan §5, or (b) merge QA tasks into the relevant domain plans (Backend, Frontend, DevOps). Recommendation: Add as 8th domain plan with Person A as owner.

---

### STRUCT-2 | Type: TIMELINE
**Location:** Security/Compliance Plan — SC-005  
**Issue:** "Company Entity Formation" scheduled Week 1, effort 8 hours. This may already be done. If not, it blocks attorney engagement (SC-006) and DPA signing. Master Plan assumes DPA done in 30 minutes Day 1.  
**Impact:** If entity not formed, DPA execution (BLK-002) is blocked — cascading delay to all OpenAI integration  
**Fix:** Verify entity status. If formed, mark SC-005 as DONE. If not, escalate as critical blocker — entity formation can take 1-4 weeks (Stripe Atlas is 1 week).

---

### STRUCT-3 | Type: TIMELINE
**Location:** Monetization Plan  
**Issue:** Plan schedules RevenueCat SDK integration (MON-007) at Week 3, paywall at Week 4-5, analytics at Week 8. Master Plan schedules RevenueCat integration at Week 13.  
**Impact:** 10-week discrepancy. If Monetization follows its own timeline, Person A is overloaded Weeks 3-5 with both core scan pipeline AND RevenueCat work.  
**Fix:** Align Monetization Plan to Master Plan timeline: RevenueCat SDK integration Week 12, paywall Week 13, analytics Week 13. Early setup (account creation, product config) can remain Weeks 1-2.

---

### STRUCT-4 | Type: DEPENDENCY
**Location:** AI/ML Plan  
**Issue:** DEP-002 listed as "partially" produced by AI/ML domain, but DEP-002 is owned by Backend in Master Plan. AI/ML Plan claims to produce DEP-002 (mock scan API response) but this is a Backend task.  
**Impact:** Confusion about who owns DEP-002 delivery  
**Fix:** Clarify: Backend owns DEP-002 (API schema finalization). AI/ML contributes the response content (food analysis JSON structure). Add explicit handoff: AI/ML produces mock JSON content → Backend wraps in API response schema.

---

### STRUCT-5 | Type: OWNERSHIP
**Location:** Product/Design Plan  
**Issue:** Component implementation tasks (PD-015 through PD-018) assign "Person A" as owner, but Person A is Backend/AI/DevOps per Master Plan. UI component implementation is Person B's domain.  
**Impact:** Person A overloaded, Person B's ownership undermined  
**Fix:** Reassign PD-015, PD-016, PD-017, PD-018 to Person B.

---

### STRUCT-6 | Type: TIMELINE
**Location:** Frontend Plan — FE-015 through FE-021  
**Issue:** Onboarding screens (6 screens) scheduled in Week 1, but Master Plan schedules onboarding for Week 3. Week 1 is project setup only.  
**Impact:** Frontend Plan attempts to build UI before design system (DEP-021) and Figma mockups (DEP-022) are ready  
**Fix:** Move FE-015 through FE-021 to Week 3 (aligning with Master Plan). Keep FE-001 through FE-014 (setup tasks) in Week 1-2.

---

### STRUCT-7 | Type: DEPENDENCY
**Location:** Security/Compliance Plan — SC-009 (Privacy Policy)  
**Issue:** Privacy Policy scheduled Week 6, but Master Plan BLK-005 (App Store checklist) needs it by Week 14. However, FE onboarding links to Privacy Policy (FE-020, Week 2). If Privacy Policy isn't live until Week 6, onboarding consent screen has a broken link Weeks 2-6.  
**Impact:** Broken Privacy Policy link during development — acceptable for dev, but must be live before any real user data (Week 8 alpha testing)  
**Fix:** Add placeholder Privacy Policy URL (Week 2) pointing to a "Coming Soon" page. Full attorney-drafted policy by Week 6 as planned. Document this sequencing.

---

### STRUCT-8 | Type: TIMELINE
**Location:** Security/Compliance Plan — SC-006  
**Issue:** FTC attorney engagement estimated at $11K-$21K total cost. No budget approval tracked in any plan. This is a significant expense for a 2-person startup.  
**Impact:** If budget not approved, attorney engagement delays compliance review  
**Fix:** Add budget approval step in Week 1. Flag to Founder for financial decision.

---

### STRUCT-9 | Type: ORPHAN
**Location:** Backend Plan  
**Issue:** Tasks BE-057, BE-058 referenced for walk system but the Backend Plan visible portion doesn't include complete walk API implementation matching Spec §4.1.7 (start + complete endpoints)  
**Impact:** Walk completion endpoint may be missed  
**Fix:** Verify BE-057/BE-058 include both /walk/start and /walk/complete per Spec §4.1.7.

---

### STRUCT-10 | Type: DEPENDENCY
**Location:** Frontend Plan — FE-010 (PostHog)  
**Issue:** Feature flag `paywall-annual-price` default is "79.99" — wrong price. Should be "99.99" per PRD.  
**Impact:** If PostHog flag defaults fire, users see wrong annual price  
**Fix:** Change default from "79.99" to "99.99".

---

### STRUCT-11 | Type: TIMELINE
**Location:** Security/Compliance Plan  
**Issue:** Plan lists "Week 13: Penetration Test Complete" in mission statement but SC-024 (penetration test) tasks are not visible in the loaded portion. Master Plan says Week 14 for pentest.  
**Impact:** 1-week discrepancy between plan's stated goal and Master Plan  
**Fix:** Align to Master Plan — pentest completion target Week 14.

---

### STRUCT-12 | Type: OTHER
**Location:** All Domain Plans  
**Issue:** No plan includes a task for the Expo camera overlay spike (BE-028) — it's in Backend Plan but is really a cross-domain Frontend+DevOps task. Person B should be involved.  
**Impact:** Camera spike decision affects all frontend camera work but Frontend Plan just says "Depends on BE-028"  
**Fix:** Add collaborative note: Week 2 spike involves both Person A (technical validation) and Person B (UX validation of overlay). Both should participate.

---

## SECTION 1.5 — SCOPE CREEP

---

### SCOPE-1 | Recommendation: DEFER
**Location:** AI/ML Plan — AI-008 (Safety Floor categories)  
**Item:** "Potatoes" and "Candy/sweets" safety floor categories  
**Not in PRD/Spec Because:** PRD §6.2 defines exactly 6 safety floor categories. Potatoes and Candy are not listed.  
**Decision:** Remove from MVP scope. Add to backlog for V1.1 safety floor expansion. If team wants to include, require PRD sign-off first. Flag as REQUIRES PRD SIGN-OFF.

---

### SCOPE-2 | Recommendation: DEFER
**Location:** Security/Compliance Plan — SC-005  
**Item:** Company Entity Formation (Delaware C-Corp)  
**Not in PRD/Spec Because:** PRD assumes entity already exists. This is a business operations task, not a product implementation task.  
**Decision:** If entity exists, mark DONE. If not, handle outside implementation plan scope (pre-project prerequisite). Do not include as Week 1 implementation task.

---

### SCOPE-3 | Recommendation: KEEP WITH JUSTIFICATION
**Location:** Security/Compliance Plan — SC-011  
**Item:** Cookie Consent Banner for marketing website  
**Not in PRD/Spec Because:** PRD does not define a marketing website for MVP. Mobile apps don't use cookies.  
**Decision:** Keep as deferred/conditional task (already marked "defer if no website"). No change needed.

---

### SCOPE-4 | Recommendation: DEFER
**Location:** QA Plan — QA-002  
**Item:** Python/pytest integration test framework for Rust backend  
**Not in PRD/Spec Because:** Tech Spec §7 specifies `cargo test` for backend testing. A Python test wrapper is an additional, unspecified testing layer.  
**Decision:** Defer Python integration tests. Use `cargo test` + Rust HTTP client tests (e.g., `reqwest` in test mode) for API integration testing. If team prefers pytest, keep as optional supplement.

---

### SCOPE-5 | Recommendation: REMOVE
**Location:** Frontend Plan — FE-010  
**Item:** Feature flag `paywall-annual-price` default "79.99" — implies dynamic pricing via feature flags  
**Not in PRD/Spec Because:** PRD §9.2 locks pricing. Dynamic pricing via feature flags is a post-launch optimization experiment, not MVP.  
**Decision:** Remove price-value feature flags. Hardcode PRD prices ($12.99/$99.99/$249.99) in RevenueCat configuration. Add A/B price testing to V1.1 backlog.

---

### SCOPE-6 | Recommendation: KEEP WITH JUSTIFICATION
**Location:** Frontend Plan — FE-006  
**Item:** react-i18next internationalization setup from Day 1  
**Not in PRD/Spec Because:** PRD only specifies English (US) for MVP. i18n is not a stated requirement.  
**Decision:** Keep — i18n setup is a best practice that prevents hard-coded strings (which also helps with compliance language auditing). Minimal overhead, high future value.

---

## TASK 1 SUMMARY

### CRITICAL fixes (must be done before any implementation starts):

1. **CONFLICT-1 + CONFLICT-2:** Fix all pricing in Monetization Plan ($12.99/$99.99/$249.99), add lifetime tier
2. **CONFLICT-3:** Align safety floor categories to PRD's 6 categories and exact GL values
3. **CONFLICT-4:** Replace AI/ML Plan's A1C algorithm with exact Spec §4.2.5 formula
4. **CONFLICT-7 + CONFLICT-8:** Fix Security/Compliance Plan — replace all BAA/HIPAA language with DPA/GDPR
5. **GAP-3:** Flag FTC attorney review as Master Plan blocker (BLK-019)
6. **STRUCT-1:** Add QA/Testing Plan to Master Plan domain coordination or merge tasks
7. **STRUCT-2:** Verify company entity formation status immediately
8. **CONFLICT-9:** Align Product/Design color palette to PRD §8.3 values
9. **GAP-2:** Add 7-day free trial implementation to Monetization Plan

### HIGH fixes (must be done before the relevant week's work begins):

1. **CONFLICT-5:** Fix complexity classification names (MODERATE→COMPLEX_B, COMPLEX→COMPLEX_C)
2. **CONFLICT-6:** Fix GL range calculation (±3/±5 → ±20%/±35%)
3. **CONFLICT-10:** Fix tab count (5→4, remove Learn tab)
4. **GAP-1:** Add scan corrections review task to AI/ML Plan
5. **GAP-4:** Add trademark search task to Security/Compliance Plan (Week 1)
6. **GAP-5:** Add CCPA "Do Not Sell" implementation
7. **GAP-6:** Add EU analytics consent banner
8. **GAP-7:** Add SCC verification task
9. **GAP-8:** Add walk/complete endpoint task
10. **STRUCT-3:** Align Monetization Plan timeline to Master Plan (Week 12-13)
11. **STRUCT-5:** Reassign component implementation tasks to Person B
12. **STRUCT-6:** Move onboarding screens from Week 1 to Week 3
13. **STRUCT-10:** Fix PostHog annual price flag default ("79.99" → "99.99")
14. **AMBIGUITY-1:** Fix complexity classification criteria
15. **AMBIGUITY-2:** Clarify safety floor portion logic
16. **AMBIGUITY-3:** Expand Figma screen list
17. **AMBIGUITY-6:** Fix component task ownership

### MEDIUM/LOW fixes (can be done in parallel with implementation):

1. **CONFLICT-11:** Move DPIA from Week 3 to Week 10
2. **CONFLICT-12:** Clarify QA backend testing approach (cargo test primary)
3. **CONFLICT-13:** Fix onboarding screen count in Figma spec
4. **CONFLICT-14:** Remove Unknown confidence level
5. **GAP-9:** Add analytics event implementation tasks
6. **GAP-10:** Add guest mode E2E test
7. **GAP-11:** Add pentest cross-reference in QA Plan
8. **AMBIGUITY-4:** Fix free user cost assumptions
9. **AMBIGUITY-5:** Fix A1C endpoint path
10. **AMBIGUITY-7:** Fix QA seed data schema
11. **STRUCT-7:** Add placeholder Privacy Policy URL
12. **STRUCT-8:** Add budget approval for legal costs
13. **SCOPE-1:** Remove Potatoes/Candy from MVP safety floors
14. **SCOPE-5:** Remove price feature flags, hardcode PRD prices

---

**END OF TASK 1 REPORT**
