> **STATUS: AMENDED — superseded on positioning (2026-06-30).** Revora's locked direction is now an **honest, prediabetes-only daily coach**; the camera/photo-scan, CGM, and reversal-score (BAI) features below are **deferred to later/optional**, not hero features. Source of truth for positioning is `docs/product-marketing.md`; every conflict + resolution is logged in `docs/audit/Revora_Alignment_Audit_CoachPivot_20260630.md`. The pre-pivot original is preserved at `docs/archive/Glucosnap_prd_v2-pre-coach-pivot-20260630.md`. Wrong facts, where present, were corrected inline (115.2M prevalence; "first-mover" removed; unverifiable TAM removed; Cal AI figure corrected). Body below is otherwise unchanged.

<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# Revora — Product Requirements Document v2.0

**Version:** 2.0  
**Date:** 2026-03-15  
**Document Owner:** Product and Engineering Team  
**Classification:** Internal — Confidential  
**Previous Version:** 1.0 (Feb 26, 2026)  
**Change Summary:** Comprehensive revision resolving 60 audit issues + 34 improvement recommendations from Deep Audit Report v1.0 and Five-Dimension Feasibility Analysis v1.0.

---

## 1. Executive Summary

### 1.1 The Problem

115.2 million American adults have prediabetes—a condition where blood sugar levels are elevated but not yet in the diabetic range (A1C 5.7–6.4%). Of these, 80% are undiagnosed, and those who are diagnosed receive minimal guidance beyond "eat better and come back in 6 months." This creates a crisis of nutritional paralysis: patients know their health is at risk but have no practical tools to make informed food decisions in real time.

### 1.2 The Solution

**Revora** is a mobile-first blood sugar wellness companion that uses AI-powered meal photo scanning to provide instant Glycemic Load (GL) analysis, personalized food sequencing advice, and safer swap recommendations—all tailored for people managing prediabetes.

**How it works:**
1. **Snap** a photo of any meal
2. **See** instant GL score, spike risk classification (SAFE/MODERATE/HIGH), and food breakdown
3. **Act** on personalized sequencing advice, safer swaps, and post-meal action recommendations
4. **Track** daily GL budget, streaks, and A1C progress over time

### 1.3 Core Differentiators

1. **Prediabetes-specific:** Built exclusively for the 5.7–6.4% A1C population
2. **Glycemic Load focus:** Uses GL (not calories) as the primary metric
3. **Clinically-grounded food sequencing:** Based on Shukla et al. 2019, Imai et al. 2023 showing 30% spike reduction
4. **Photo-first, zero friction:** No manual food logging required
5. **Conservative safety bias:** All AI estimates err toward overestimation of GL

### 1.4 Market Opportunity

- **Market:** 115.2M US adults have prediabetes (CDC 2026); <1% engage the proven free DPP — a large, structurally underserved market (specific $ TAM unverified).
- **SAM:** ~1.5 million diagnosed, smartphone-owning, health-app-using US prediabetics
- **Year 1 Target:** 25,000 downloads, 2,500 premium subscribers, $32,500 MRR

### 1.5 12-Month Success Metrics

| Metric | MVP (Month 3) | Month 6 | Month 12 |
|--------|--------------|---------|----------|
| Total Downloads | 2,000 | 8,000 | 25,000 |
| Weekly Active Scanners | 300 | 2,400 | 7,500 |
| Premium Subscribers | 120 | 800 | 2,500 |
| MRR | $1,560 | $10,400 | $32,500 |
| Day 7 Retention | 35% | 40% | 45% |
| Day 30 Retention | 20% | 25% | 30% |
| DAU/MAU Ratio | 25% | 30% | 35% |
| Avg Scans/Active User/Day | 2.5 | 3.0 | 3.5 |

> **Note on retention targets:** Industry-average health app retention is 15–20% DAU/MAU. Targets above reflect top-quartile aspirations. Conservative financial modeling uses 30% DAU/MAU as base case.

> **Note on A1C improvement:** A1C metrics are self-reported observational data, not clinical claims. Individual results vary. See §10 for regulatory language.

---

## 2. Document Information

### 2.1 Purpose and Scope

This PRD defines product requirements, UX, business model, and go-to-market strategy for Revora. It is the authoritative product-level reference. Implementation details (API contracts, database schema, AI prompts, acceptance criteria) are in the Technical Specification v2.0.

### 2.2 Intended Audience

| Audience | Relevant Sections |
|----------|------------------|
| Product Manager | All sections |
| Engineering Team | §6, §7, §12 |
| Design Team | §6, §8 |
| Marketing | §3, §9, §11 |
| Legal/Compliance | §10, §14 |
| Executive/Board | §1, §9, §13 |

### 2.3 Related Documents

| Document | Version | Relationship |
|----------|---------|-------------|
| Revora Technical Specification | v2.0 | Authoritative for API, schema, AI prompts, acceptance criteria |
| Revora Traceability Matrix | v1.0 | Maps pain points → goals → features → requirements → ACs |
| Revora Deep Audit Report | v1.0 | Source of issues/recommendations addressed in this revision |
| Revora Feasibility Analysis | v1.0 | Source of blockers/risks informing this revision |

### 2.4 Document Maintenance

- PRD and SPEC stored in same Git repo with semantic versioning
- PRD changes affecting SPEC require linked SPEC update in same sprint
- Cross-document references use stable IDs (requirement IDs, issue IDs), not section numbers
- Weekly 30-minute sync review ensures no PRD feature lacks SPEC coverage
- CHANGELOG.md tracks all changes with cross-references

---

## 3. Market Context and Competitive Analysis

### 3.1 The Prediabetes Crisis

**By the Numbers:**
- **115.2 million** US adults have prediabetes (CDC 2026)[1]
- **80.2%** are unaware of their condition[1]
- **5–10%** progress to Type 2 diabetes annually without intervention[10]

**The Guidance Gap:**
- 55% of newly diagnosed receive no specific dietary guidance beyond "eat better"
- 60% of r/prediabetes posts express nutritional paralysis[3]

**The Opportunity:**
- GL-based interventions reduce A1C by 0.2–0.4 points over 90 days in clinical settings[4]
- Food sequencing reduces spikes by up to 30%[6][7]
- No existing app combines photo-based GL analysis with prediabetes-specific coaching

### 3.2 User Research and Pain Points

| ID 	| Pain Point 							| Frequency | Severity 	|
|-------|---------------------------------------------------------------|-----------|-----------|
| PP-01 | **Nutritional Paralysis:** "I don't know what to eat" 	| 60% 	    | Critical 	|
| PP-02 | **Fear of Progression:** "Will I get diabetes?" 		| 45% 	    | Critical 	|
| PP-03 | **Inadequate Guidance:** "Doctor said eat better, that's it" 	| 55%  	    | High     	|
| PP-04 | **Information Overload:** "Every website contradicts the last"| 40% 	    | High 	|
| PP-05 | **Loss of Food Enjoyment:** "I'm afraid to eat anything" 	| 35  	    | High 	|
| PP-06 | **Plateau Frustration:** "I hit a wall" 			| 25% 	    | Medium 	|
| PP-07 | **A1C Discouragement:** "My number barely moved" 		| 20% 	    | High 	|
| PP-08 | **Isolation:** "No one understands this condition" 		| 30% 	    | Medium 	|

### 3.3 Competitive Landscape

| Competitor | Strength | Weakness | Revora Advantage |
|-----------|----------|----------|-------------------|
| **Cal AI** ($2M MRR) | Proven photo-first model | General calorie tracker, no GL | Prediabetes-specific GL + sequencing |
| **mySugr** | Established brand | Type 1/2 focused, manual entry | Photo-first + prediabetes-specific |
| **MyFitnessPal** | Massive user base | Not glucose-specific, manual | Zero-friction photo scanning + GL |
| **Noom** | Clinical evidence | $60/month, time-intensive | 5× cheaper, instant results |

**Emerging Threat — CGM-App Convergence:**
Consumer CGMs entering prediabetes market at ~$99/month. Revora defense: 8× cheaper, no hardware, complementary (CGM = what happened; Revora = what to do). CGM integration planned for V1.3.

---

## 4. User Personas

### 4.1 Primary: Sarah (The Newly Diagnosed)
- Female, 42, A1C 6.1, diagnosed 3 weeks ago
- Pain Points: PP-01, PP-02, PP-03, PP-05
- JTBD: Know immediately if a meal is safe; feel confident about progress
- Motivation to Pay: Very high

### 4.2 Secondary: Marcus (The Optimizer)
- Male, 55, A1C 5.9, on Metformin, data-driven
- Pain Points: PP-04, PP-06, PP-07
- JTBD: Quantify every meal's impact; see trends; generate doctor reports
- Motivation to Pay: High

### 4.3 Secondary: Priya (The Vegetarian Challenge)
- Female, 38, A1C 5.8, lifelong vegetarian, Indian cuisine
- Pain Points: PP-01, PP-04, PP-05
- JTBD: Find vegetarian-safe meals; get culturally-aware advice
- GL Budget: 100 GL/day (plant-based proteins carry more carbs; 80 GL unsustainably restrictive)
- Motivation to Pay: Moderate

### 4.4 Supporting: Linda (The Menopausal Metabolic Shift)
- Female, 52, A1C 6.3, perimenopause, nurse
- Pain Points: PP-02, PP-06, PP-07, PP-08
- JTBD: Understand hormonal effects on blood sugar; share with friends
- Motivation to Pay: High

### 4.5 Supporting: David (The CGM Enthusiast)
- Male, 47, A1C 6.0, uses Dexcom Stelo CGM
- Pain Points: PP-04, PP-06
- JTBD: Correlate meals with CGM readings; get proactive pre-meal advice
- Motivation to Pay: Very high

---

## 5. Product Vision and Goals

### 5.1 Vision Statement

Every person with prediabetes should have instant, affordable, personalized food guidance at every meal—delivered in under 5 seconds, grounded in science, and framed with hope.

### 5.2 Mission

Make prediabetes dietary management as simple as taking a photo. Replace fear and confusion with clarity and confidence through AI-powered GL analysis, clinically-validated food sequencing, and personalized coaching.

### 5.3 Product Goals

| #  | Goal 						| Addresses 	| Success Metric 				|
|--- |--------------------------------------------------|---------------|-----------------------------------------------|
| G1 | Eliminate food paralysis within 5 seconds 	| PP-01 	| 95% scan success rate, <5s P95 response 	|
| G2 | Replace fear with measurable daily progress 	| PP-02, PP-07 	| 80% of users check GL budget ≥5 days/week 	|
| G3 | Fill the doctor guidance gap 			| PP-03 	| User confidence score >7/10 at Day 30 	|
| G4 | Be the single trusted source 			| PP-04 	| 50% reduction in external nutrition searches 	|
| G5 | Make food enjoyable again		 	| PP-05 	| 70% report reduced food anxiety at Day 30 	|
| G6 | Sustain engagement beyond 90 days 		| PP-06, PP-08 	| 20%+ Day 90 retention 			|
| G7 | Generate sustainable recurring revenue 		| Business 	| $32,500 MRR by Month 12 			|

> **Measurement Note:** Metrics like "user confidence," "food anxiety reduction," and "external search reduction" require in-app micro-survey infrastructure. See Technical Specification §4.1 for the survey API endpoint. Metrics not reliably measurable by Month 12 are tracked qualitatively via user interviews.

### 5.4 Success Metrics by Phase

**MVP (Month 1–3):** 2,000 downloads, 300 weekly active scanners, 35% Day 7 retention, 6% conversion, 120 premium subscribers, $1,560 MRR, ≥85% spike risk classification accuracy on 100-meal validation set, scan P95 ≤5s.

**Growth (Month 4–6):** 8,000 downloads, 2,400 weekly active scanners, 40% Day 7 retention, 8% conversion, 800 subscribers, $10,400 MRR.

**Scale (Month 7–12):** 25,000 downloads, 7,500 weekly active scanners, 45% Day 7 / 30% Day 30 retention, 10% conversion, 2,500 subscribers, $32,500 MRR, App Store 4.6+.

### 5.5 Product Principles

1. **Clarity Over Completeness:** Every screen answers ONE question. Progressive disclosure by default.
2. **Hope, Not Fear:** Every concerning score paired with a solution. Never blame users.
3. **Speed Above All:** Scan to result in <5 seconds. Meaningful content in <2 taps.
4. **Food Is Not the Enemy:** Warm, appetizing food imagery. Food is manageable, not threatening.
5. **One Clear Next Action:** Every screen ends with exactly one primary CTA.
6. **Conservative Safety Bias:** When in doubt, overestimate GL. A false HIGH triggers a harmless walk; a false SAFE causes an unmitigated spike.

---

## 6. Feature Specifications

### 6.1 Onboarding Flow

**Priority:** P0 (MVP) | **Addresses:** PP-01, PP-02, PP-03 | **Goal:** First scan within 90 seconds

**Screen 1: Welcome + Emotional Acknowledgment**
- Headline: "Just diagnosed? We've got you."
- Subtext: "Revora helps you understand exactly what to eat—one photo at a time."
- CTA: "Let's get started" | Skip: Available

**Screen 2: A1C Entry**
- "What's your most recent A1C?" → Slider or number input (4.0–14.0)
- Skip: "I don't know yet" → default 5.7–6.0
- Guest mode: Users can scan before creating an account

**Screen 3: Goal Setting**
- Auto-populated goal based on baseline (e.g., 6.1 → goal 5.6)
- Validation: goal ≥ baseline - 0.6 AND ≤ baseline - 0.1 AND ≥ 4.0 (client + server enforced)
- Motivational context: "Research shows consistent GL management can support healthy blood sugar levels over time. Individual results vary based on diet, activity, and other factors."

**Screen 4: Dietary Profile**
- Multi-select: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Halal, Kosher, Nut-Free, None
- GL budget auto-adjustment: Standard 80 GL/day; Vegetarian/Vegan 100 GL/day
- Rationale on tap: "Plant-based proteins carry more carbohydrates. Your budget is adjusted accordingly."

**Screen 5: GL Budget Education**
- Visual gauge showing daily GL budget
- Explanation of SAFE/MODERATE/HIGH categories

**Screen 6: Age Confirmation + Consent**
- Age gate: "By continuing, you confirm you are 13 years of age or older." (COPPA)
- Under 13: Block account creation, collect no data
- Health data consent (GDPR Art. 9): "I consent to Revora processing my health data (A1C values, dietary information, meal logs) to provide personalized guidance."
- Links to Privacy Policy and Terms of Service

**CTA: "Scan your first meal"** → Camera launches immediately

**Acceptance Criteria:** 80% onboarding completion, 70% first scan within 3 minutes

### 6.2 Core Scan Feature

**Priority:** P0 (MVP) | **Addresses:** PP-01, PP-05 | **Effort:** 3 weeks

**Scan Modes:**
- **"Already ate"** (default): Scans and logs meal to daily GL budget
- **"Planning to eat"** (pre-meal): Same pipeline, suppresses logging

**User Flow:**
1. Tap scan button (persistent FAB) or select mode toggle
2. Camera opens with plate calibration overlay (25cm ghost circle)
3. Photograph meal
4. Image compressed to 1024×1024px on-device, uploaded via `multipart/form-data`
5. Loading: "Analyzing your meal..."
6. Results in <5 seconds (P95, single-pass)

**Results Screen:**

**A. GL Score Banner:** Large GL number (or range for MEDIUM/LOW confidence), spike risk badge SAFE/MODERATE/HIGH, confidence indicator, remaining daily GL budget.

**B. Food Breakdown:** Per-item GL, portion estimate, spike risk. Editable portions via slider (half fist → 80g, tennis ball → 150g, two fists → 250g).

**C. Advice Cards (Premium):**
- Sequencing Card: Optimal eating order with citation (Shukla et al. 2019)
- Swap Card: 1–3 alternatives respecting dietary restrictions, GL savings, taste tips
- Post-Meal Action Card: Walk recommendation for MODERATE/HIGH meals
- Free tier: GL + spike risk only. Advice cards blurred with "Unlock with Pro"

**D. Action Bar:** "Log This Meal" / "Done" (planning mode); "Report Inaccurate Result"

**Inline Disclaimer:** "Estimate based on visual analysis — not medical advice" on every result screen.

**Safety Floor Override:**

| Food Category | Safety Floor GL |
|--------------|----------------|
| White rice (1 cup) | 20 |
| Pasta (1 cup) | 18 |
| White bread (2 slices) | 16 |
| Fruit juice (8oz) | 15 |
| Sweetened beverage | 20 |
| Baked goods (muffin/cookie) | 15 |

```
IF ai_estimated_gl < safety_floor[food_category] THEN
  override_gl = safety_floor[food_category]
  flag_confidence = LOW
```

**API Format:** `multipart/form-data` with `camelCase` field naming. See Technical Specification §4.1.

**Acceptance Criteria:**
- GL analysis within 5 seconds P95 (single-pass)
- ≥85% correct spike risk classification on 100-meal set (VAL-001)
- Food identification ≥65% at MVP, ≥74% by Month 3
- All swaps respect dietary restrictions (100%)
- Safety floors fire correctly for all listed categories
- Free tier: GL + spike risk only, no advice cards
- "Report Inaccurate Result" visible on every result

### 6.3 Daily GL Budget Tracker

**Priority:** P0 (MVP) | **Addresses:** PP-01, PP-06

**A. GL Gauge:** Circular gauge, GL consumed vs. budget. Green (0–75%) → Yellow (75–100%) → Red (>100%). Grades: A (<75%), B (75–100%), C (100–125%), D (>125%).

**B. Meal Timeline:** Chronological list of today's meals with per-meal GL bars.

**C. Real-Time Update:** Updates immediately after logging. Polling at 30s (MVP). GL resets at midnight in user's timezone. WebSocket deferred to V1.2.

**D. Streak Counter:** "Days under GL budget." Threshold: GL ≤ user's configured `glBudget` (not hardcoded). Celebrations at 7, 14, 30, 60, 90 days.

**Daily Score:** Percentage-based relative to individual GL budget (fair across dietary profiles).

> Score algorithm in Technical Specification §4.2. Widget deferred to V1.1.

**Acceptance Criteria:** Gauge updates within 2s of logging; streak uses configured budget; midnight reset in local timezone; celebration modals at milestones.

### 6.4 A1C Progress Tracker

**Priority:** P0 (MVP) | **Addresses:** PP-02, PP-07

**A. Progress Visualization:** Line chart (baseline → estimate → goal). Clear markers for lab-tested vs. estimated.

**B. A1C Estimation Algorithm** (Rust backend):

```rust
fn estimate_a1c(baseline: f64, daily_gl_avgs: &[f64], gl_budget: f64) -> f64 {
    let avg_14d = daily_gl_avgs.iter().sum::<f64>() / daily_gl_avgs.len() as f64;
    let adherence = avg_14d / gl_budget;
    let daily_change = match adherence {
        a if a <= 0.75 => -0.00444,
        a if a <= 1.0  => -0.00444 * 0.6,
        a if a <= 1.25 => 0.0,
        _              => 0.00444 * 0.3,
    };
    (baseline + daily_change * daily_gl_avgs.len() as f64).clamp(4.0, 14.0)
}
```

- **Error bounds:** ±0.2 A1C points on every estimate
- **Mandatory disclaimer on every A1C display:** "Estimate only — verify with laboratory A1C test. This is not a medical measurement."
- **Divergence warning:** If |estimated - lab| > 0.3: "Your lab results differ significantly from our estimate. Please consult your doctor."

**C. Manual A1C Logging:** Lab values with date. Override estimates on chart.

**D. Weekly Progress Report:** Auto-generated (GL adherence, top spikes, improvements). Push notification (respects quiet hours). Premium: full; Free: summary.

**E. Milestone Celebrations:** "Progress" language only. Never "reversal" or clinical claims.

**F. Shareable Social Cards (V1.1):** Server-side SVG→PNG (1080×1080). No A1C on cards. Endpoint: `GET /api/v1/share/weekly-card`.

> A1C algorithm also in Technical Specification §4.2 (identical formula).

**Acceptance Criteria:** Daily estimation from 14-day rolling average; ±0.2 bounds on every estimate; disclaimer adjacent to every A1C display; lab values override; divergence warning at >0.3 delta.

### 6.5 Food Sequencing Coach

**Priority:** P0 (MVP, Premium) | **Addresses:** PP-01, PP-03

Optimal eating order based on Shukla et al. 2019[6], Imai et al. 2023[7]: vegetables → protein → carbs last, reducing spikes up to 30%.

- Numbered step cards specific to current scan
- Scientific citation on every card
- Visual timeline of estimated spike reduction

**Acceptance Criteria:** Sequencing for every multi-component meal; citation displayed; order: vegetables → protein → fat → carbs.

### 6.6 Safer Swap Engine

**Priority:** P0 (MVP, Premium) | **Addresses:** PP-01, PP-05

**Format:** Replace [Current] (GL: X) → With [Swap] (GL: Y) → GL Saved: Z → Taste Tip

**Rules:** MUST respect all dietary restrictions (100%, zero tolerance); practical, widely available; max 3 per scan ordered by GL savings; no swaps for SAFE items.

**Acceptance Criteria:** 100% dietary restriction compliance (VAL-008); taste tips included; GL savings accurate.

### 6.7 Meal History and Pattern Analysis

**Priority:** P1 (V1.1) | **Addresses:** PP-06, PP-07

- Timeline View with GL scores and badges
- Pattern Detection after 14+ days ("Your breakfasts cause 60% of GL spend")
- Top 5 Spike Foods from normalized `food_items` table
- Search/Filter by date, spike risk, meal type
- Free: 7-day history (server-enforced); Premium: unlimited

**Monthly PDF Report (V1.1, Premium):** Auto-generated 1st of month at 9AM local. Server-side rendering. Push notification when ready.

**Acceptance Criteria:** History loads <1s; pattern detection after 14 days; PDF within 30s.

### 6.8 Post-Meal Action System

**Priority:** P0 (MVP) | **Addresses:** PP-01

- Walk reminder 5 min after logging MODERATE/HIGH meal
- Walk timer with start/stop, logged to `activities` table
- Quiet hours: 10 PM – 7 AM default (configurable)

**Acceptance Criteria:** Notification at 5 min for MODERATE/HIGH; timer accurate; quiet hours respected; walk linked to meal ID.

### 6.9 Educational Content Library

**Priority:** P1 (V1.1) | **Addresses:** PP-03, PP-04

20+ curated articles reviewed by RD. Free: 5 articles; Premium: full access. Personalized from scan history.

### 6.10 CGM Integration

**Priority:** P2 (V1.3, Month 7+) | **Effort:** 4–6 weeks

> Deferred from V1.1 to V1.3. OAuth + medical device data normalization + glucose overlay + privacy consent = 4–6 weeks minimum.

Dexcom G7, Abbott Libre 3 via Terra API. Premium-only. Cost: $0.20–$0.50/active CGM user/month.

### 6.11 Barcode Scanner

**Priority:** P1 (V1.1) | **Effort:** 3 days

Packaged food scanning via Open Food Facts (3M+ products). Toggle on camera screen.

### 6.12 Social Community Features

**Priority:** P3 (V2.0, Month 12+)

> Deferred to V2.0 per REC-013. UGC requires moderation, COPPA review, health data sharing legal analysis.

**V1.2 Interim:** Curated team-written success stories (anonymized, read-only). Disclaimer: "Individual results vary."

**V2.0:** Success stories feed, meal sharing, accountability buddies (±0.3 A1C match, expand ±0.5 after 7 days). Moderation: keyword filter + AI classification, 3-flag auto-hide, 24hr human review.

### 6.13 Meal Templates / Favorites (V1.1)

**Priority:** P1 | **Effort:** 3–5 days

"Save as Favorite" on scan results. One-tap re-log—no photo, no AI call (~$0.02/scan saved).

---

## 7. Technical Architecture

> **Authoritative Source:** The Technical Specification v2.0 is authoritative for all implementation details including API contracts, database schema, AI prompt templates, acceptance criteria, and component architecture. This section provides a product-level overview.

### 7.1 Technology Stack

**Mobile Frontend:** React Native (Expo SDK 52), Expo Router, Zustand, TanStack Query v5, Victory Native XL, RevenueCat SDK, Expo Camera + Image Picker.

**Backend:** Rust + Axum, PostgreSQL 16, Redis 7, Cloudflare R2, OpenAI GPT-4o Vision API, USDA FoodData Central API, JWT auth with one-time-use refresh token rotation, OAuth2 (Google/Apple). Deployment: Railway.app (MVP); migration path to Fly.io at >5K MAU or AWS ECS at >25K MAU.

**Infrastructure:** GitHub Actions (CI/CD), Expo EAS Build, Sentry (errors), PostHog (analytics + feature flags), RevenueCat (payments).

### 7.2 System Architecture

```
┌─────────────────────────────────────────────────────┐
│              Mobile App (React Native)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Camera  │  │Dashboard │  │ A1C      │         │
│  │  Scan    │  │  GL      │  │ Progress │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS / JWT Auth
                     ▼
┌─────────────────────────────────────────────────────┐
│           Backend API (Rust + Axum)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Scan    │  │Dashboard │  │Analytics │         │
│  │ Endpoint │  │ Endpoint │  │ Service  │         │
│  └─────┬────┘  └──────────┘  └──────────┘         │
└────────┼───────────────────────────────────────────┘
         │
    ┌────┴────┬─────────────┬─────────────┐
    ▼         ▼             ▼             ▼
┌────────┐ ┌──────┐   ┌─────────┐   ┌────────┐
│OpenAI  │ │Redis │   │Postgres │   │ R2     │
│GPT-4o  │ │Cache │   │Database │   │Storage │
│Vision  │ │      │   │         │   │        │
└────────┘ └──────┘   └─────────┘   └────────┘
```

### 7.3 Core API Endpoints (Overview)

> Complete request/response specifications in Technical Specification §4.1.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | User registration |
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/auth/guest` | POST | Guest mode auth |
| `/api/v1/auth/guest/convert` | POST | Convert guest → full account |
| `/api/v1/auth/refresh` | POST | Token refresh (one-time-use) |
| `/api/v1/onboarding` | POST | Save onboarding data |
| `/api/v1/scan` | POST | Meal photo analysis |
| `/api/v1/dashboard/today` | GET | Today's meals, GL, budget, streak |
| `/api/v1/a1c` | POST | Log A1C value |
| `/api/v1/a1c/estimate` | GET | Get estimated A1C |
| `/api/v1/insights/weekly` | GET | Weekly GL trends |
| `/api/v1/walk/start` | POST | Start post-meal walk |
| `/api/v1/learn/articles` | GET | Article queue |
| `/api/v1/user/export` | GET | GDPR data export |
| `/api/v1/user/account` | DELETE | GDPR account deletion |
| `/api/v1/share/weekly-card` | GET | Shareable card (V1.1) |
| `/api/v1/reports/monthly` | GET | Monthly PDF (V1.1) |
| `/api/v1/user/survey` | POST | In-app micro-survey |

### 7.4 Database Schema

> **Single Source of Truth:** Complete schema including all tables, indexes, and Row-Level Security policies is maintained exclusively in Technical Specification §4.3. This section is intentionally a pointer, not a duplicate.

**Tables:** `users`, `scans`, `meals`, `food_items` (normalized), `a1c_logs`, `streaks`, `activities`, `push_tokens`, `analytics_events`, `scan_corrections`, `saved_meals`, `dish_gl_database`

### 7.5 AI Architecture Overview

**MVP (Single-Pass):**
1. Image → pHash → Redis cache check
2. Cache miss → GPT-4o Vision with master prompt
3. Response parsed → Safety floor check → Conservative bias correction
4. Confidence scoring → GL range or point estimate
5. Results with advice cards (premium) or basic (free)

**V1.1 (Two-Pass for Complex Foods):**
1. Complexity classifier (GPT-4o Mini): SIMPLE / COMPLEX_B / COMPLEX_C
2. SIMPLE → single-pass; COMPLEX_B → enhanced single-pass with GL range; COMPLEX_C → user input modal
3. Two-pass (Pass 1: identification, Pass 2: GL calculation) for COMPLEX_B/C

**Tiered AI Cost Strategy:**

| Tier | Method | Cost | Target Rate |
|------|--------|------|-------------|
| 1 | Redis pHash cache hit | $0 | 40%+ |
| 2 | Saved meal re-log (V1.1) | $0 | 15% |
| 3 | GPT-4o Mini classifier | ~$0.005 | 100% non-cached |
| 4 | GPT-4o single-pass | ~$0.05 | 85% of classified |
| 5 | GPT-4o two-pass (V1.1) | ~$0.12 | 15% of classified |

**Critical milestone:** At 50K cumulative scans, begin fine-tuning custom model ($0.005/scan target). Existential for unit economics at scale.

> Full AI prompts, safety floor implementation, confidence scoring in Technical Specification §4.2.

### 7.6 Performance Requirements

| Metric | Requirement |
|--------|-------------|
| Scan API P95 (single-pass) | <5 seconds |
| Scan API P95 (two-pass, V1.1) | <8 seconds |
| App cold start | <2 seconds |
| Dashboard load | <1 second |
| Image upload limit | 10MB (auto-compressed) |
| API availability | 99.5% uptime |
| Meal photo retention (full) | 90 days |
| Meal photo retention (thumbnail) | Indefinite |
| Nutrition data retention | Indefinite |
| Redis cache hit rate | ≥40% |

### 7.7 Security Requirements

- JWT auth on all endpoints (except guest auth)
- Refresh tokens: one-time-use rotation, stored in iOS Keychain / Android EncryptedSharedPreferences, all revoked on password change
- Meal photos: private R2 bucket, signed URLs (1-hour expiry)
- A1C values: application-layer encryption (defense-in-depth)
- No health data sold to third parties
- GDPR: data export and deletion endpoints
- TLS 1.3 minimum
- API keys server-side only
- Rate limiting (Redis token bucket): Free 5 scans/day (429 at 6+ with `retryAfterSeconds` + `scansRemaining`), Premium 100/day, Global 100 req/min/user
- Cache: pHash exact match only (Hamming distance=0, 64-bit DCT, `image_hasher` crate)
- PostgreSQL RLS on all user-data tables
- Pre-launch penetration test required
- **OpenAI DPA execution: pre-launch blocker**

### 7.8 AI Accuracy and Limitations

> **ANNOTATION (2026-07-02, Track B5 correction):** the accuracy/MAPE figures
> below (74%/59%/85%, 15–20% carb MAPE, etc.) are from an early internal
> baseline study, are **unverified/aspirational**, and predate the coach
> pivot's shipped, text/voice-only, non-numeric engine
> (`docs/product-marketing.md`; `docs/audit/Revora_Alignment_Audit_CoachPivot_20260630.md`).
> They **must not be used in any external material** — Play listing, ToS,
> marketing site, investor deck, or support copy — citing an accuracy
> percentage is exactly the "no accuracy percentages" claims-boundary
> violation (`docs/safety/claims-boundary.md` Banned Claim Families;
> enforced in shipped copy by `tests/unit/revora/claims-boundary-copy.test.ts`).
> Kept below for historical/internal reference only.

**Baseline (Diabot-GPT-4o Study, 714 images, 57 users):**

| Configuration | Accuracy |
|---------------|----------|
| Custom GPT-4o (photo only) | 74% |
| Standard GPT-4o (photo only) | 59% |
| Custom + Food Name | 85% |

**Carbohydrate MAPE:** 15–20% with custom config vs. 47.9% raw (Gothenburg study). A 50g carb meal may range 40–60g. For GL classification (SAFE vs. MODERATE), directional accuracy matters more than precision; boundary cases (GL 18 vs. 22) produce misclassifications mitigated by conservative bias + safety floors.

**Known Limitations:**
- Portion size estimation: ±20–30% for unfamiliar plate sizes
- Hidden ingredients: Sauces, oils, marinades invisible in photos
- Mixed dishes: Multi-component dishes harder to decompose
- Cultural cuisines: Training data biased toward Western foods

**Mitigation Architecture:**
1. Complexity classifier (routes to appropriate pipeline)
2. Master prompt (forced visual estimation, no serving size assumptions)
3. Conservative GL fallback (safety net for unidentified foods)
4. Plate calibration overlay (camera UI reference)
5. Systematic bias correction (large portion adjustment)
6. Confidence scoring (LOW/MEDIUM/HIGH with ranges)
7. Dish name shortcut (one-tap confirmation for complex dishes)
8. Editable portion confirmation (human-in-the-loop)
9. Two-pass architecture (V1.1, for COMPLEX_B/C)

---

## 8. User Experience Design

### 8.1 Design Principles

1. **Clarity:** One question per screen, progressive disclosure
2. **Hope:** Warm, encouraging tone; never punitive
3. **Speed:** Instant results feel magical; every second matters
4. **Food Is Not the Enemy:** Appetizing imagery, not clinical
5. **One Clear Next Action:** Single primary CTA per screen

### 8.2 Navigation Structure

```
Tab Bar (4 tabs):
├── Home (Dashboard)
│   ├── GL Gauge + Daily Score
│   ├── Today's Meals Timeline
│   └── Streak Counter
├── Scan (Camera) — Center FAB
│   ├── Photo Mode
│   ├── Barcode Mode (V1.1)
│   └── Mode Toggle (Already Ate / Planning)
├── Progress
│   ├── A1C Chart
│   ├── Weekly Report
│   └── Meal History
└── Profile
    ├── Settings
    ├── Dietary Profile
    ├── Subscription
    ├── Data Export
    └── Account Deletion
```

### 8.3 Visual Design System

**Color Palette:**
- Primary: Deep Teal (#0D7377) — trust, health, calm
- Safe Green: #4CAF50
- Moderate Yellow: #FF9800
- High Red: #F44336
- Background: Warm White (#FAFAFA)
- Text: Charcoal (#333333)

**Typography:** System fonts (SF Pro on iOS, Roboto on Android) for performance. Body: 16sp, Headers: 20–24sp, GL Score: 48sp bold.

**Components:** Rounded corners (12px), soft shadows, card-based layout. Food imagery uses warm filters. No clinical/sterile aesthetic.

### 8.4 Accessibility

- WCAG 2.1 AA compliance
- Dynamic font sizes (up to 200% scaling)
- VoiceOver / TalkBack support for all interactive elements
- Minimum touch targets: 44×44pt
- Color-blind safe: Spike risk uses color + icon + text label (not color alone)
- Reduced motion option

### 8.5 Onboarding UX Flow

```
Welcome → A1C Entry → Goal → Dietary Profile → GL Education → Age/Consent → First Scan
```

**Success Criteria:**
- 80% completion rate
- First scan within 90 seconds (VAL-002)
- Skip rate tracked per screen (analytics)

---

## 9. Monetization Strategy

### 9.1 Freemium Model

**Free Tier:**
- 5 scans/day (server-enforced rate limit)
- Basic results: GL score + spike risk classification
- 7-day meal history (server-enforced)
- Daily GL budget tracker
- Streak counter

**Premium Tier:**
- Unlimited scans (100/day hard cap for abuse prevention)
- Full advice cards (sequencing, swaps, post-meal actions)
- Unlimited meal history + pattern analysis
- A1C progress tracker with estimation
- Weekly/monthly reports
- Educational library (full access)
- Priority AI response (sub-3 second target)

### 9.2 Pricing Tiers

| Tier | Price | Value Proposition |
|------|-------|------------------|
| Monthly | $12.99/month | Full access, cancel anytime |
| Annual | $99.99/year ($8.33/month) | Save 36%, encourages 90-day commitment |
| Lifetime | $249.99 one-time | Pay once, use forever |

> **Pricing rationale:** Below CGMs ($100+/month) and Noom ($60/month). Monthly accessible for newly diagnosed testing effectiveness. Annual incentive aligns with clinical improvement timeline (90 days). Lifetime targets highly motivated users, provides upfront capital.

**Promotional Pricing (First 6 Months):**
- Launch: 50% off first month ($6.49)
- Black Friday/Cyber Monday: 60% off annual ($39.99)
- Referral: Give $5, Get $5 credit

### 9.3 Conversion Strategy

**Paywall Triggers:**
- After 5th scan of the day: "You've reached your daily limit. Upgrade for unlimited scans."
- Viewing sequencing advice (free): Blurred card + "Unlock with Pro"
- After 7 days: "You've scanned 25 meals. See full patterns with Pro."
- Viewing A1C tracker: "Track your 90-day progress with Pro"

**Trial Strategy:** 7-day free trial on annual plan. No credit card required to start.

**Target Conversion Rates:** Month 1: 6%, Month 6: 8%, Month 12: 10% (conversion unvalidated; Cal AI reports ~20–25% trial conversion, a different metric).

### 9.4 Revenue Projections

**Assumptions:** Subscription mix 70% monthly, 25% annual, 5% lifetime. Blended ARPU: $13/month.

**Scenario A — Conservative:**

| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Downloads | 2,000 | 5,000 | 10,000 |
| Conversion | 6% | 7% | 8% |
| Premium Subs | 120 | 350 | 800 |
| MRR | $1,560 | $4,550 | $10,400 |

**Scenario B — Moderate (Primary Plan):**

| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Downloads | 2,000 | 8,000 | 25,000 |
| Conversion | 6% | 8% | 10% |
| Premium Subs | 120 | 800 | 2,500 |
| MRR | $1,560 | $10,400 | $32,500 |

### 9.5 Cost Structure

**Variable Costs per Premium User/Month:**

| Cost Category | Amount | Notes |
|-------------|--------|-------|
| OpenAI API | $2.00 | 100 scans × $0.02/scan (blended simple/complex) |
| App Store commission (Year 1) | $3.90 | 30% of $12.99 (15% after Year 1 via Small Business Program) |
| RevenueCat | $0.13 | 1% of subscription |
| Cloudflare R2 | $0.10 | Image storage |
| Backend hosting | $0.50 | Railway per-user allocation |
| **Total COGS (Year 1)** | **$6.63** | |
| **Gross Margin (Year 1)** | **49%** | |
| **Total COGS (Year 2+, 15%)** | **$4.68** | |
| **Gross Margin (Year 2+)** | **64%** | |

> **Note:** Year 1 gross margin is lower due to 30% App Store commission. After qualifying for Small Business Program (<$1M revenue), commission drops to 15%. Annual subscribers ($99.99/year = $8.33/month) improve blended margin. CGM integration cost ($0.20–$0.50/user) applies only to V1.3+ CGM-connected users and is excluded from MVP COGS.

**Fixed Costs (Monthly):**
- Expo EAS: $29
- Domain + SSL: $5
- Sentry: $0 (free tier)
- PostHog: $0 (free tier)
- Content creation: $500
- Customer support (part-time, Month 4+): $800
- **Total Fixed:** $1,334/month

**Breakeven:** 217 premium users ($1,334 / $6.16 contribution margin at Year 1 rates). Expected: Month 3–4 post-launch.

**Free User Cost Burden:**
At Month 12: 22,500 free users × 75 scans/month × $0.02 = ~$33,750/month before caching. With 40% cache hit rate: ~$20,250/month. Circuit breaker: reduce free tier from 5 → 3 scans/day if conversion stays below 5% for 60 days (saves ~40% of free user API costs).

### 9.6 Alternative Revenue Streams (Post-Launch)

**Stream 1: B2B2C Insurance Partnerships (P2)**
- Partner with CDC DPP providers
- Insurance-subsidized access: $10–15/user/month from insurer
- Note: May trigger HIPAA Business Associate requirements

**Stream 2: White-Label Licensing**
- License to diabetes prevention programs, corporate wellness, telehealth
- $5,000–$20,000/month per enterprise client

**Stream 3: Anonymized Data Licensing (Ethical Framework)**
- Explicit user opt-in only (not default)
- True anonymization (HIPAA de-identification standards)
- User receives benefit (free premium or donation to research)

**Stream 4: Affiliate Partnerships**
- CGM devices (5–10% commission), whole food delivery, kitchen tools
- Revenue: $2–5/user/year (modest, maintains trust)

---

## 10. Regulatory and Compliance

### 10.1 Regulatory Classification

**FDA Classification: General Wellness Tool (Non-Device)**

Revora avoids FDA medical device classification under the 2016 General Wellness guidance:
- Claims limited to general wellness (nutritional guidance, food education)
- Does NOT make disease-specific diagnosis, treatment, or prevention claims
- User retains decision-making agency

**Critical Language Boundaries:**

| Avoid (Medical Claims) | Use (Wellness Language) |
|----------------------|------------------------|
| "Treats prediabetes" | "Supports healthy blood sugar management" |
| "Prevents diabetes" | "Helps you work toward your A1C goal" |
| "Diagnoses glucose spikes" | "Estimates glycemic impact" |
| "Reverses prediabetes" | "Supports your blood sugar wellness journey" |
| "Medical advice" | "Educational guidance" |
| "Clinical tool" | "Wellness companion" |

> **Language Policy:** The word "reversal" must NOT appear in any user-facing copy, marketing material, App Store listing, feature name, or UI string in either document. Internal references to the clinical concept use "A1C improvement" or "blood sugar management." Feature previously named "A1C Reversal Roadmap" is renamed to "A1C Progress Tracker."

### 10.2 FTC Health Claims Compliance

**Mandatory Pre-Launch Actions:**
1. Remove all unsubstantiated efficacy claims from marketing, App Store listing, and in-app copy
2. Add "Results may vary" disclaimer to all testimonials and success references
3. Never quantify health outcomes (A1C reduction) in marketing without completed clinical study
4. Cite primary research for every scientific claim
5. Engage FTC health claims attorney for review ($3,000–$5,000)

**Onboarding Disclaimer (FTC-Compliant):**
"Revora provides educational information about food and blood sugar management. It is not a medical device and does not diagnose, treat, cure, or prevent any disease. Always consult your healthcare provider before making changes to your diet or health plan. Individual results vary."

### 10.3 Privacy and Data Protection

**Data Classification:**

| Data Type | Classification | Regulatory Regime |
|-----------|---------------|------------------|
| A1C values | Health data / PHI-equivalent | GDPR Art. 9, CCPA sensitive |
| Meal photos | Personal data + health inference | GDPR, CCPA |
| Dietary restrictions | Health data | GDPR Art. 9 |
| GL scores / meal logs | Health data | GDPR Art. 9 |
| Email / auth tokens | Personal data | GDPR, CCPA |

**HIPAA:** Revora is NOT a HIPAA-covered entity (not healthcare provider/plan/clearinghouse). However, A1C values and meal logs are treated as PHI-equivalent with voluntary HIPAA-grade protections.

**Data Protection Measures:**
- Encryption: AES-256 at rest, TLS 1.3 in transit
- A1C values: application-layer encryption (additional defense-in-depth)
- Access control: RBAC, 2FA for admin
- Data minimization: collect only essential data
- Retention: meal photos auto-deleted after 90 days (thumbnails retained indefinitely)
- Audit logging: all data access logged
- Breach protocol: 72-hour notification, incident response plan

**GDPR Compliance:**
- Lawful basis: explicit consent for health data (Art. 9)
- Health data consent: separate checkbox during onboarding
- Right to access/export: JSON format via `GET /api/v1/user/export`
- Right to deletion: soft-delete with 30-day purge via `DELETE /api/v1/user/account`
- DPIA: conducted and documented pre-launch (required for health data at scale)
- DPA with OpenAI: executed pre-launch (meal photos sent to OpenAI for processing)
- Cross-border transfers: SCCs with Railway.app, OpenAI, Cloudflare
- Analytics consent banner for EU users (conditionally load PostHog)

**CCPA Compliance:**
- Right to know, delete, and opt-out of sale covered
- "Do Not Sell My Personal Information" link in settings
- Privacy policy disclosure

**User Data Rights:**
- Export: all data in JSON within 10 seconds (Spec §VAL-010)
- Deletion: complete account + data deletion, soft-delete with 30-day purge cycle
- Correction: users can edit all logged data
- Opt-out: email, analytics, data licensing (each independent)

**Third-Party Data Processing Disclosure:**
Privacy policy must include: "Your meal photos are processed by OpenAI's AI services to provide nutritional analysis. Photos are transmitted securely and are not used by OpenAI for model training per our Data Processing Agreement."

### 10.4 App Store Compliance

**Apple App Store:**
- Category: Health & Fitness
- Age Rating: **12+** (health app content appropriate for teens managing prediabetes)
- Medical disclaimer: prominent in listing AND in-app before first use
- Privacy Nutrition Label: accurately completed (health data, camera, identifiers)
- HealthKit integration: optional (V1.2)

**Google Play Store:**
- Category: Health & Fitness
- Health Apps Policy form: completed
- Data safety section: accurately discloses all data collection and sharing (including OpenAI)
- Content Rating: PEGI 12 / Everyone 10+

**App Store Submission Strategy:**
- Submit with conservative wellness language (no "reversal," no disease claims)
- Budget 3 weeks for approval (expect 1–2 rejection rounds for health app scrutiny)
- Have medical reviewer contacts ready
- Prepare appeal documentation with clinical citations

### 10.5 Terms of Service Key Provisions

**Medical Disclaimer (Prominent Display — onboarding, settings, App Store, website):**

"Revora is a nutritional information and wellness tool. It is NOT a medical device, does not diagnose, treat, cure, or prevent any disease, and is not a substitute for professional medical advice. Always consult your healthcare provider before making changes to your diet or treatment plan. Glycemic Load estimates are educational approximations and may not reflect your individual glucose response."

**Liability Limitations:**
- App provides estimates, not medical-grade measurements
- User assumes responsibility for dietary decisions
- Revora not liable for adverse health outcomes
- Users agree to waive claims related to AI estimation errors

**Content Ownership:**
- Users retain ownership of uploaded meal photos
- Revora retains license for service delivery and AI training (opt-in only)
- Anonymized aggregate data for research (opt-in only)

### 10.6 Pre-Launch Legal Checklist

| Item | Status | Blocker? |
|------|--------|----------|
| OpenAI DPA execution | Required | **Yes — pre-launch blocker** |
| GDPR DPIA documentation | Required | **Yes — pre-launch blocker** |
| FTC health claims attorney review | Required | **Yes — pre-launch blocker** |
| Trademark search for "Revora" | Required | Yes (2–4 weeks) |
| Privacy policy draft | Required | Yes |
| Terms of Service draft | Required | Yes |
| "Reversal" language audit (all docs + code) | Required | Yes |
| COPPA age gate implementation | Required | Yes |
| App Store pre-submission checklist | Required | Yes |
| Professional liability (E&O) insurance | Recommended | No |
| General liability insurance ($1M) | Recommended | No |
| Cyber/data breach insurance ($1M) | Required | No (PRD §14 Risk 7) |

---

## 11. Launch Strategy

### 11.1 Pre-Launch Phase (Weeks 13–15 of Development)

**Week 13: Alpha Testing (Internal)**
- Team + close friends (15 testers)
- Focus: Critical bugs, onboarding flow, scan accuracy
- Tools: TestFlight (iOS), Google Play Internal Testing (Android)
- Success criteria: Zero crashes, <5s scan time, 90% onboarding completion

**Week 14: Beta Testing (Closed)**
- 100 beta testers from YouTube audience, r/prediabetes, Facebook groups
- Incentive: Free lifetime Pro access for feedback
- Focus: Real-world accuracy validation, feature prioritization
- Success criteria: 40%+ Day 7 retention, 4.5+ star feedback, <10 critical bugs

**Week 15: Launch Preparation**
- App Store submission (budget 3-week review window)
- Landing page live (revora.com) with email waitlist
- Press kit prepared
- Social media accounts created
- Payment system tested end-to-end
- Customer support configured

### 11.2 Launch Sequence

**Soft Launch (Week 1 post-approval):**
- Apps live, no promotion
- Announce to beta testers + email list
- Monitor: server performance, API costs, crash rates
- Goal: 100 downloads, validate infrastructure

**Community Launch (Week 2):**
- YouTube video: "I built a tool to help manage prediabetes"
- Reddit r/prediabetes: educational post (not promotional)
- Product Hunt (health category)
- Goal: 500 downloads, 50 premium conversions

**Press Outreach (Week 3–4):**
- Health tech blogs: TechCrunch Health, MobiHealthNews
- Diabetes podcasts (guest appearances)
- Diabetes advocacy organizations
- Goal: 1 press mention, 1,500 downloads, $1,500 MRR

### 11.3 Growth Channels

**Channel 1: YouTube (Primary, Organic)**
- Existing prediabetes audience (established trust)
- Content: "I scanned everything I ate for 7 days" series
- CTA in every video: "Download Revora (link in description)"
- Goal: 200 downloads/month at 10K views (2% CTR)

**Channel 2: Reddit (r/prediabetes, Organic)**
- Authentic community engagement (not spammy)
- Weekly participation with helpful comments
- Monthly value posts: "GL guide for beginners"
- Goal: 50–100 downloads/month

**Channel 3: ASO (App Store Optimization)**
- Title: "Revora: Smart Meal Scanner"
- Subtitle: "Track Glycemic Load, Manage Blood Sugar"
- Keywords: prediabetes, blood sugar, glycemic load, A1C, meal scanner
- Category: Health & Fitness

**Channel 4: Referral Program**
- Give $5 credit, Get $5 credit
- Shareable weekly progress cards (no A1C values for privacy)

**Channel 5: Paid Acquisition (Month 6+)**
- Facebook/Instagram: Interest targeting (diabetes awareness, healthy eating), age 35–65, lookalike audiences
- Google Search: branded + high-intent keywords
- CAC target: <$30 (LTV $156 at 5% churn = 5:1 ratio)
- Budget: $30–50K for Month 6–12

### 11.4 Launch Success Metrics

| Metric | Week 4 Target | Month 6 Target |
|--------|--------------|----------------|
| Total downloads | 2,000 | 10,000 |
| Active users (DAU) | 700 | 4,000 |
| Premium subscribers | 120 | 800 |
| MRR | $1,560 | $10,400 |
| Day 7 retention | 35% | 40% |
| App Store rating | 4.3+ | 4.5+ |

---

## 12. Development Roadmap

### 12.1 MVP Development (15 Weeks)

**Phase 0: Foundation (Weeks 1–2)**
- Rust backend API scaffold + PostgreSQL schema + auth + Redis cache
- OpenAI Vision API integration with master prompt + complexity classifier
- React Native/Expo project setup + camera + plate overlay
- CI/CD pipeline (GitHub Actions + EAS Build)
- Day-1 accuracy features: complexity classifier, master prompt, conservative GL fallback

**Phase 1: Core Features (Weeks 3–8)**
- Week 3–4: Onboarding flow (6 screens including age gate + consent), user auth (email + OAuth), dietary profile, A1C entry
- Week 5–7: Camera integration, scan results UI, GL score + spike risk + food breakdown, confidence scoring, editable portions, dish name shortcut, bias correction
- Week 8: Daily GL dashboard, meal timeline, streak counter, daily score

**Phase 2: Value-Add Features (Weeks 9–12)**
- Week 9–10: Food sequencing cards, safer swap engine, post-meal walk system
- Week 11–12: A1C progress tracker with estimation algorithm, manual A1C logging, weekly reports

**Phase 3: Monetization + Polish (Weeks 13–14)**
- RevenueCat subscription integration + paywall implementation
- Free vs. Premium feature gating
- Beta testing with 100 users
- App Store submission prep
- Penetration testing

**Phase 4: Launch (Week 15)**
- App Store release
- Landing page launch
- Community announcement
- Monitoring and hotfix readiness

**MVP Feature Prioritization:**

| Feature | Priority | Phase |
|---------|----------|-------|
| Complexity classifier + master prompt + conservative fallback | P0 | 0 (Day 1) |
| Onboarding with age gate + health consent | P0 | 1 |
| Core scan (photo → GL → spike risk) | P0 | 1 |
| Plate calibration overlay + confidence scoring | P0 | 1 |
| Editable portions + dish name shortcut + bias correction | P0 | 1 |
| Daily GL budget tracker + streaks | P0 | 1 |
| Food sequencing coach | P0 | 2 |
| Safer swap engine | P0 | 2 |
| Post-meal walk system | P0 | 2 |
| A1C progress tracker + estimation | P0 | 2 |
| RevenueCat + paywall | P0 | 3 |
| GDPR export + deletion endpoints | P0 | 3 |

### 12.2 Post-Launch Roadmap

**Version 1.1 (Month 2–3):**
- Meal history + search
- Weekly insights auto-generation
- Barcode scanner
- Educational content library (20 articles)
- Meal templates / favorites
- Shareable social cards
- Monthly PDF reports (Premium)
- Home screen widget (iOS WidgetKit + Android Glance)
- Two-pass AI architecture for complex foods

**Version 1.2 (Month 4–6):**
- Restaurant mode (location-based suggestions)
- Meal planning feature (7-day plans)
- Voice logging ("I just ate X")
- Curated success stories (read-only social proof)
- Smart notification timing (learned from behavior)

**Version 1.3 (Month 7–9):**
- CGM integration (Dexcom G7, Abbott Libre 3 via Terra API)
- Advanced analytics dashboard
- Vegetarian-specific expanded swap library
- AI chat assistant (RAG-based, Premium)

**Version 2.0 (Month 12+):**
- Community features (success stories, meal sharing, accountability buddies)
- Apple Watch + Wear OS companion
- Siri/Google Assistant shortcuts
- Menopause mode (targeted advice track)

### 12.3 Technical Debt and Optimization

**Month 3:** AI response caching optimization (reduce API costs by 40%), database query optimization, image CDN integration.

**Month 6:** Migrate from GPT-4o to fine-tuned model (60% cost reduction target), edge caching (Cloudflare Workers), A/B testing framework (PostHog experiments).

**Month 12:** Multi-region deployment (US-East + US-West + EU), custom CV model for food recognition, advanced ML personalized GL prediction from CGM data.

---

## 13. Success Metrics and Analytics

### 13.1 North Star Metric

**Weekly Active Scanners:** Unique users completing ≥3 scans in a 7-day period.

**Rationale:** Measures actual usage (not vanity downloads), correlates with A1C improvement and premium conversion.

**Targets:** Month 1: 300 | Month 6: 2,400 | Month 12: 7,500

### 13.2 Key Performance Indicators

**Acquisition:** App Store impressions, install conversion (target 15%+), onboarding completion (80%+), time to first scan (<5 min for 70%).

**Engagement:** DAU/MAU (target 30–35%), scans per active user/day (3.5), session length (3–5 min), feature adoption rates.

**Retention:** Day 1: 60%, Day 7: 35–45%, Day 30: 20–30%, Day 90: 15–20%.

**Monetization:** Free-to-paid conversion (6–10%), ARPU ($1.50 blended), ARPPU ($13), MRR ($32,500 at M12), churn (<7% monthly realistic, <5% target), LTV ($156 gross), CAC (<$30).

**Health Outcomes (Self-Reported, Observational):** Average GL adherence, streak achievement rates, A1C improvement at 90-day cohort level. Disclaimer: "Self-reported data, not clinical claims."

**Product Quality:** App Store rating (4.6+), NPS (50+), scan success rate (95%), P95 scan speed (<5s), crash-free rate (99.5%+).

### 13.3 Analytics Implementation

**Tool Stack:** PostHog (analytics + A/B testing), Sentry (errors), RevenueCat (subscription analytics), App Store Connect + Google Play Console.

**Critical Events:**
- Acquisition: `app_opened_first_time`, `onboarding_started`, `onboarding_completed`, `onboarding_skipped`, `first_scan_completed`
- Engagement: `scan_initiated`, `scan_completed` (gl_score, spike_risk, confidence), `scan_failed` (error), `meal_logged`, `advice_card_viewed`, `swap_accepted`, `post_meal_walk_started`, `a1c_logged`, `weekly_report_viewed`
- Monetization: `paywall_viewed` (trigger_context), `subscription_started` (plan), `subscription_cancelled`, `subscription_renewed`
- Retention: `session_start`, `session_end` (duration), `user_returned_day_N`

**User Properties:** `a1cBaseline`, `a1cGoal`, `dietaryProfile`, `subscriptionTier`, `daysSinceSignup`, `totalScans`, `currentStreak`, `avgDailyGl`

### 13.4 A/B Testing Framework

**Experiment 1: Onboarding Length**
- A: 6-screen (control) vs. B: 4-screen (skip dietary profile, infer later)
- Primary: onboarding completion; Secondary: Day 7 retention

**Experiment 2: Paywall Trigger**
- A: After 5 scans/day (control) vs. B: After 7-day streak
- Primary: free-to-paid conversion

**Experiment 3: Swap Presentation**
- A: List format vs. B: Swipe cards (gamified)
- Primary: swap acceptance rate

**Experiment 4: Push Notification Timing**
- A: 5 min after logging vs. B: Smart timing (learned from behavior)
- Primary: walk completion rate

---

## 14. Risk Management

### 14.1 Technical Risks

**Risk 1: AI Inaccuracy Causes Health Harm**
- Probability: Medium | Impact: Critical
- Scenario: AI underestimates GL, user skips walk, experiences spike
- Mitigation: Conservative bias correction, confidence scoring, safety floor overrides, prominent disclaimer, beta accuracy validation, continuous monitoring (flag <70% confidence for review)

**Risk 2: OpenAI API Outage**
- Probability: Low | Impact: High
- Mitigation: Cached results for repeat meals (7-day window), scan queue during outage, secondary provider eval (Anthropic Claude), SLA monitoring (alert at >10s latency or >5% error rate)

**Risk 3: Scaling Costs Exceed Revenue**
- Probability: Medium | Impact: High
- Mitigation: Aggressive caching (40%+ hit rate), fine-tuned model migration (Month 6), growth circuit breaker (pause paid acquisition if LTV:CAC < 3:1), free tier reduction (5 → 3 scans/day) if unit economics deteriorate

**Risk 4: OpenAI Model Deprecation**
- Probability: Medium | Impact: Medium
- Mitigation: Abstract AI provider behind interface, maintain prompt version registry, test new models within 2 weeks of release, fine-tuned model reduces dependency

### 14.2 Market Risks

**Risk 5: Low Conversion (Free → Paid)**
- Probability: Medium | Impact: Critical
- Mitigation: A/B test paywall triggers, 7-day free trial, add premium value (CGM, planning, reports), reduce free tier if needed, focus retention before monetization

**Risk 6: Competitive Pressure**
- Probability: Medium | Impact: Medium
- Mitigation: Prediabetes-exclusive brand + honest daily coaching as the moat (photo→GL is already commoditized — Glycemic Snap, LOGI, SNAQ, January AI), community moat (YouTube, Reddit), switching costs (meal history, streaks), speed advantage over enterprises

**Risk 7: App Store Rejection for Health Claims**
- Probability: Medium | Impact: Medium
- Mitigation: Conservative wellness language, no "reversal" in listing, budget 3 weeks for approval, medical reviewer contacts, appeal documentation ready

### 14.3 Regulatory Risks

**Risk 8: FDA Reclassifies as Medical Device**
- Probability: Low | Impact: Critical
- Mitigation: Strict wellness positioning in ALL language, never claim diagnose/treat/prevent, continuous legal review of features, FDA consultant relationship, contingency: pivot to B2B white-label for DPP providers

**Risk 9: FTC Challenge on Health Claims**
- Probability: Low–Medium | Impact: High
- Mitigation: Pre-launch FTC attorney review ($3–5K), remove all unsubstantiated outcome claims, "results may vary" on all testimonials, cite primary research

**Risk 10: Privacy Breach / Data Leak**
- Probability: Low | Impact: Critical
- Mitigation: Pre-launch penetration test, AES-256 + TLS 1.3, application-layer encryption for A1C, minimal retention (90-day photo purge), cyber insurance ($1M), 72-hour breach notification, bug bounty (post-launch)

**Risk 11: "Revora" Trademark Conflict**
- Probability: Medium | Impact: Medium
- Mitigation: Conduct trademark search immediately ($500–$1K), have backup name ready, file USPTO ($250–$350/class)

### 14.4 Operational Risks

**Risk 12: Solo Founder Burnout / Key Person Risk**
- Probability: Medium | Impact: High
- Mitigation: Comprehensive documentation from Day 1, hire fractional support (customer support Month 2, contract designer Month 3, fractional RN developer Month 6), automate (CI/CD, AI chatbot support), 18 months financial runway

**Risk 13: Poor Retention Kills Growth**
- Probability: Medium | Impact: High
- Mitigation: Obsess retention before acquisition, implement streaks/notifications/reports early, interview churned users, reactivation campaigns at Day 60, cohort analysis by acquisition channel

**Risk 14: AI Hallucination on High-Risk Meals**
- Probability: Medium | Impact: High
- Mitigation: Safety floor overrides for known high-GL categories, confidence scoring with ranges, "Report Inaccurate Result" feedback loop, conservative bias (always overestimate)

**Risk 15: Clinical Outcome Liability**
- Probability: Low | Impact: Critical
- Mitigation: Prominent medical disclaimer on every A1C display and scan result, never claim specific outcomes, E&O insurance recommended, Terms of Service liability limitations

### 14.5 Risk Register Summary

| # | Risk | Prob | Impact | Category |
|---|------|------|--------|----------|
| 1 | AI inaccuracy causes health harm | Med | Critical | Technical |
| 2 | OpenAI API outage | Low | High | Technical |
| 3 | Scaling costs exceed revenue | Med | High | Technical |
| 4 | OpenAI model deprecation | Med | Med | Technical |
| 5 | Low conversion rate | Med | Critical | Market |
| 6 | Competitive pressure | Med | Med | Market |
| 7 | App Store rejection | Med | Med | Market |
| 8 | FDA reclassification | Low | Critical | Regulatory |
| 9 | FTC health claims challenge | Low–Med | High | Regulatory |
| 10 | Privacy breach | Low | Critical | Regulatory |
| 11 | Trademark conflict | Med | Med | Regulatory |
| 12 | Solo founder burnout | Med | High | Operational |
| 13 | Poor retention | Med | High | Operational |
| 14 | AI hallucination on high-risk meals | Med | High | Technical |
| 15 | Clinical outcome liability | Low | Critical | Regulatory |

---

## 15. Glossary

| Term | Definition |
|------|-----------|
| A1C (HbA1c) | Glycated hemoglobin; measures average blood sugar over 2–3 months. Normal <5.7%, prediabetes 5.7–6.4%, diabetes ≥6.5% |
| GL (Glycemic Load) | Measure of a food's blood sugar impact: GL = (GI × net carbs) / 100. Low ≤10, Medium 11–19, High ≥20 |
| GI (Glycemic Index) | Scale 0–100 rating how quickly a food raises blood sugar vs. pure glucose |
| Spike Risk | Revora classification: SAFE (GL ≤10), MODERATE (GL 11–19), HIGH (GL ≥20) |
| pHash | Perceptual hash; image fingerprint for cache matching |
| DPA | Data Processing Agreement (GDPR requirement for third-party processors) |
| DPIA | Data Protection Impact Assessment (GDPR requirement for health data processing) |
| RLS | Row-Level Security; PostgreSQL feature ensuring users can only access their own data |
| CDS | Clinical Decision Support; FDA classification framework |
| DPP | Diabetes Prevention Program (CDC) |

---

## References

[1] Centers for Disease Control and Prevention. (2024). National Diabetes Statistics Report.

[2] Grand View Research. (2025). Prediabetes Market Size, Share & Trends Analysis Report 2025-2032.

[3] Reddit r/prediabetes Community. (2023-2024). User posts and sentiment analysis from 47,000+ member community.

[4] Harvard Medical School. (2023). Glycemic Index and Glycemic Load for 100+ Foods. Harvard Health Publishing.

[5] Atkinson, F.S., et al. (2021). International tables of glycemic index and glycemic load values 2021. *American Journal of Clinical Nutrition*, 114(5), 1625-1632.

[6] Shukla, A.P., et al. (2019). Food order has a significant impact on postprandial glucose and insulin levels. *Diabetes Care*, 42(7), e98-e99.

[7] Imai, S., et al. (2023). Eating vegetables before carbohydrates improves postprandial glucose excursions. *Journal of Clinical Biochemistry and Nutrition*, 73(2), 115-121.

[8] Fortune Business Insights. (2024). Digital Diabetes Management Market Size, Growth & Forecast 2024-2030.

[9] Cal AI. (2024). Company metrics and user testimonials.

[10] American Diabetes Association. (2024). Standards of Care in Diabetes—2024. *Diabetes Care*, 47(Supplement_1).

[11] Reynolds, A.N., et al. (2024). Cooling and reheating: Effects on resistant starch and glycemic response. *Nutrition Research Reviews*, 37(1), 23-34.

[12] Kuwata, H., et al. (2023). Meal sequence and cardiometabolic health: A systematic review. *Advances in Nutrition*, 14(4), 851-862.

[13] RevenueCat. (2024). React Native SDK Documentation.

[14] Atkinson, F.S., et al. (2021). International tables of glycemic index and glycemic load values 2021: a systematic review. *AJCN*, 114(5), 1625-1632.

[15] Harvard T.H. Chan School of Public Health. (2023). Glycemic Index and Glycemic Load.

[16] Chi, O., et al. (2025). Accuracy of large language models in meal tracking with photos. *Digital Health*, 11.

[17] Ji, Y., et al. (2024). Accuracy of ChatGPT generated diagnosis from patient's medical history. *Neuroradiology*, 66(3), 393-405.

[18] Silva-Cardoso, G., et al. (2025). LLM-powered nutrition assessment from food images. *Nutrients*, 17(2), Article 195.

[19] Lu, L., et al. (2024). Pitfalls of using AI image recognition in clinical nutrition. *Clinical Nutrition ESPEN*, 64, 13-18.

[20] Stumbo, P.J. (2013). Considerations for selecting a dietary assessment system. *JFCA*, 31(2), 199-204.

[21] Martin, C.K., et al. (2014). Validity and reliability of wear-mounted eButton for food intake assessment. *Obesity*, 22(4), 1238-1245.

[22] Pouladzadeh, P., et al. (2016). Measuring calorie and nutrition from food image. *IEEE T-IM*, 63(8), 1947-1956.

[23] Dhital, S., et al. (2024). Mechanisms of starch digestion by α-amylase. *Biomacromolecules*, 25(1), 27-44.

[24] Wei, J., et al. (2023). Chain-of-thought prompting elicits reasoning in large language models. *NeurIPS*, 35, 24824-24837.

[25] Baumel, T., et al. (2019). How we failed: Five key lessons from a decade of digital health AI research. *npj Digital Medicine*, 2(1), Article 124.

[26] U.S. Food and Drug Administration. (2022). Clinical Decision Support Software: Guidance for Industry and FDA Staff.

---

**END OF DOCUMENT — Revora PRD v2.0**

*Document Version 2.0 | Last Updated: 2026-03-15*
