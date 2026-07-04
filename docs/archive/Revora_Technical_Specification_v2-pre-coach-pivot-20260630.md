<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# Revora — Technical Specification v2.0

**Version:** 2.0  
**Date:** 2026-03-15  
**Document Owner:** Engineering Team  
**Classification:** Internal — Confidential  
**Previous Version:** 1.0  
**Change Summary:** Comprehensive revision resolving 60 audit issues + 34 recommendations. Adds 9 new API endpoints, normalized food_items table, safety floor logic, A1C estimation algorithm, GDPR endpoints, guest auth, rate limiting details, RevenueCat entitlement map, and acceptance criteria for all 11 previously unspecced PRD features.

---

## 1. Introduction

### 1.1 Purpose

This document defines the complete technical implementation specification for Revora. It is the authoritative source for API contracts, database schema, AI prompt templates, acceptance criteria, component architecture, and infrastructure configuration. The PRD v2.0 provides product-level context; this document provides implementation-level detail.

### 1.2 Scope

- REST API endpoint specifications (request/response contracts)
- PostgreSQL database schema with indexes and RLS policies
- OpenAI GPT-4o Vision integration and prompt engineering
- Redis cache schema and strategies
- Mobile app navigation and component architecture
- Performance, security, and compliance requirements
- CI/CD pipeline and testing strategy
- Acceptance criteria and validation methodology

### 1.3 Intended Audience

| Audience | Sections |
|----------|----------|
| Backend Engineers | §3, §4.1–4.4, §5, §8, §10 |
| Frontend Engineers | §4.1 (API contracts), §6, §7, §9 |
| DevOps | §5, §8 |
| QA | §10, §11 |
| Product Manager | §10, §11 |

### 1.4 Glossary

| Term | Definition |
|------|-----------|
| GL | Glycemic Load = (GI × net_carbs) / 100 |
| GI | Glycemic Index (0–100 scale) |
| Spike Risk | SAFE (GL ≤10), MODERATE (GL 11–19), HIGH (GL ≥20) |
| pHash | Perceptual hash — 64-bit DCT image fingerprint via `image_hasher` crate |
| RLS | Row-Level Security — PostgreSQL row-level access control |
| DPA | Data Processing Agreement (GDPR) |
| DPIA | Data Protection Impact Assessment (GDPR) |
| FAB | Floating Action Button |

---

## 2. Technical Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| REQ-001 | Analyze meal photos using OpenAI GPT-4o Vision API and return GL estimate | P0 |
| REQ-002 | Classify spike risk as SAFE (≤10), MODERATE (11–19), HIGH (≥20) | P0 |
| REQ-003 | Calculate GL using formula: GL = (GI × net_carbs) / 100 | P0 |
| REQ-004 | Track daily GL budget with configurable per-user target (default 80, vegetarian/vegan 100) | P0 |
| REQ-005 | Generate food sequencing advice based on scan results | P0 |
| REQ-006 | Generate safer swap suggestions respecting dietary restrictions | P0 |
| REQ-007 | Estimate A1C trajectory from GL adherence using specified algorithm | P0 |
| REQ-008 | Display ±0.2 error bounds on every A1C estimate | P0 |
| REQ-009 | Display medical disclaimer on every A1C estimate display | P0 |
| REQ-010 | Enforce free tier scan limit (5/day) server-side | P0 |
| REQ-011 | Support guest mode (scan before account creation) | P0 |
| REQ-012 | Apply safety floor overrides for known high-GL food categories | P0 |
| REQ-013 | Apply conservative bias correction (overestimate GL when uncertain) | P0 |
| REQ-014 | Generate confidence scores (HIGH/MEDIUM/LOW) for all scans | P0 |
| REQ-015 | COPPA age gate — block account creation for users under 13 | P0 |
| REQ-016 | GDPR health data consent — separate checkbox during onboarding | P0 |
| REQ-017 | GDPR data export — full user data in JSON | P0 |
| REQ-018 | GDPR account deletion — soft-delete with 30-day purge | P0 |
| REQ-019 | Cross-platform: iOS 15+ / Android 11+ | P0 |
| REQ-020 | Post-meal walk notification 5 min after MODERATE/HIGH meal logging | P0 |
| REQ-021 | Streak tracking based on user's configured GL budget | P0 |
| REQ-022 | Editable portion sizes on scan results with GL recalculation | P0 |

### 2.2 Security Requirements

| ID | Requirement |
|----|------------|
| SEC-001 | All API communication over TLS 1.3 minimum |
| SEC-002 | JWT authentication on all endpoints (except guest auth) |
| SEC-003 | Refresh tokens: one-time-use rotation; stored in iOS Keychain / Android EncryptedSharedPreferences |
| SEC-004 | All refresh tokens revoked on password change |
| SEC-005 | Meal photos stored in private R2 bucket with signed URLs (1-hour expiry) |
| SEC-006 | Rate limiting via Redis token bucket: Free 5 scans/day, Premium 100/day, Global 100 req/min/user |
| SEC-007 | A1C values encrypted with application-layer encryption (defense-in-depth beyond database encryption) |
| SEC-008 | PostgreSQL Row-Level Security (RLS) on all user-data tables |
| SEC-009 | API keys (OpenAI, RevenueCat) stored server-side only, never in mobile app |
| SEC-010 | Pre-launch penetration test required (API endpoints, auth, data export, image upload, payments) |
| SEC-011 | OpenAI DPA executed as pre-launch blocker |
| SEC-012 | pHash cache: exact match only (Hamming distance = 0) |

### 2.3 Performance Requirements

| ID | Requirement | Target |
|----|------------|--------|
| PER-001 | Scan API response time (single-pass) | P95 ≤ 5 seconds |
| PER-002 | Scan API response time (two-pass, V1.1) | P95 ≤ 8 seconds |
| PER-003 | App cold start time | < 2 seconds |
| PER-004 | Dashboard load time | < 1 second |
| PER-005 | GDPR data export | < 10 seconds |
| PER-006 | Concurrent scan support (MVP) | 100 simultaneous |
| PER-007 | Concurrent scan support (V1.1) | 500 simultaneous |
| PER-008 | API availability | 99.5% uptime |
| PER-009 | Crash-free session rate | ≥ 99.5% |
| PER-010 | Redis cache hit rate | ≥ 40% |

### 2.4 Data Retention

| Data Type | Retention | Notes |
|-----------|----------|-------|
| Meal photos (full resolution) | 90 days | Auto-deleted via scheduled job |
| Meal photos (thumbnails, 256×256) | Indefinite | For meal history display |
| Nutrition data (GL scores, food items) | Indefinite | Core product value |
| A1C logs | Indefinite | User-entered medical data |
| User accounts (soft-deleted) | 30-day purge | GDPR compliance |
| Redis scan cache | 7-day TTL | Cost optimization |
| Analytics events | 12 months | PostHog retention |

### 2.5 Constraints

| ID | Constraint |
|----|-----------|
| CON-001 | OpenAI API cost per scan ≤ $0.05 (single-pass), ≤ $0.15 (two-pass) |
| CON-002 | Monthly infrastructure cost < $500 at 5K MAU |
| CON-003 | App bundle size ≤ 50MB |
| CON-004 | Minimum API version: v1 (no breaking changes without major version bump) |
| CON-005 | App Store review: budget 3 weeks (health app scrutiny) |

---

## 3. Platform & Infrastructure

### 3.1 Platform Requirements

| ID | Requirement |
|----|------------|
| PLT-001 | React Native with Expo SDK 52 (managed workflow) |
| PLT-002 | iOS 15+ minimum deployment target |
| PLT-003 | Android 11+ (API level 30) minimum |
| PLT-004 | Rust 1.75+ with Axum 0.7+ web framework |
| PLT-005 | PostgreSQL 16 |
| PLT-006 | Redis 7 |

### 3.2 Infrastructure

| ID | Service | Provider | Cost (MVP) |
|----|---------|----------|------------|
| INF-001 | Backend hosting | Railway.app | $20/month base, auto-scaling |
| INF-002 | Database | Railway PostgreSQL | Included (up to 16GB RAM / 4 vCPU at 10K MAU) |
| INF-003 | Cache | Railway Redis | Included |
| INF-004 | File storage | Cloudflare R2 | $0.015/GB/month (no egress fees) |
| INF-005 | CI/CD | GitHub Actions | Free tier (2,000 min/month) |
| INF-006 | App builds | Expo EAS Build | $29/month |
| INF-007 | Error tracking | Sentry | Free tier |
| INF-008 | Analytics | PostHog | Free tier (1M events/month) |

### 3.3 External Services

| ID | Service | Purpose | Cost |
|----|---------|---------|------|
| SVC-001 | OpenAI GPT-4o Vision API | Meal photo analysis | ~$0.02/scan blended |
| SVC-002 | RevenueCat | Subscription management | 1% of revenue |
| SVC-003 | Cloudflare R2 | Meal photo storage | $0.015/GB/month |
| SVC-004 | USDA FoodData Central | Food nutrition database | Free |
| SVC-005 | Expo Push Notifications | Push delivery | Free tier |
| SVC-006 | Terra API (V1.3) | CGM data integration | $0.20–$0.50/active user/month |

### 3.4 Data Sources

| ID | Source | Usage |
|----|--------|-------|
| DAT-001 | Harvard Medical School GI Database (1,300+ foods) | GI reference values |
| DAT-002 | USDA FoodData Central (300K+ foods) | Nutritional composition |
| DAT-003 | Open Food Facts (3M+ products, V1.1) | Barcode → nutrition lookup |
| DAT-004 | Revora scan corrections (user-submitted) | ML training pipeline |

---

## 4. Core Implementation

### 4.1 REST API Endpoints

All endpoints use `camelCase` field naming in JSON request/response bodies. All endpoints require `Authorization: Bearer <jwt>` header unless noted. API versioned at `/api/v1/`.

#### 4.1.1 Authentication

**POST `/api/v1/auth/register`**

```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "name": "Sarah Johnson"
}
// Response 201
{
  "userId": "uuid",
  "accessToken": "jwt",
  "refreshToken": "opaque-token",
  "expiresIn": 900
}
// Error 409: { "error": "EMAIL_EXISTS" }
// Error 422: { "error": "VALIDATION_ERROR", "details": [...] }
```

**POST `/api/v1/auth/login`**

```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
// Response 200: same as register response
// Error 401: { "error": "INVALID_CREDENTIALS" }
```

**POST `/api/v1/auth/guest`** (No auth required)

```json
// Request: empty body
// Response 201
{
  "userId": "uuid",
  "accessToken": "jwt",
  "refreshToken": "opaque-token",
  "expiresIn": 900,
  "isGuest": true
}
```

Guest accounts: limited to 3 scans total (no daily reset). Data preserved on conversion. Auto-purged after 30 days if unconverted.

**POST `/api/v1/auth/guest/convert`**

```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "name": "Sarah Johnson"
}
// Response 200
{
  "userId": "uuid (same)",
  "accessToken": "jwt (new)",
  "refreshToken": "opaque-token (new)",
  "isGuest": false,
  "scansPreserved": 2
}
```

**POST `/api/v1/auth/refresh`**

```json
// Request
{
  "refreshToken": "opaque-token"
}
// Response 200
{
  "accessToken": "jwt (new)",
  "refreshToken": "opaque-token (new, one-time-use rotation)",
  "expiresIn": 900
}
// Error 401: { "error": "INVALID_REFRESH_TOKEN" }
```

Refresh token rotation: each token is single-use. Using a previously-used token revokes ALL tokens for that user (theft detection).

#### 4.1.2 Onboarding

**POST `/api/v1/onboarding`**

```json
// Request
{
  "a1cBaseline": 6.1,
  "a1cGoal": 5.6,
  "dietaryProfile": ["vegetarian"],
  "glBudget": 100,
  "ageConfirmed": true,
  "healthDataConsent": true,
  "timezone": "America/New_York"
}
// Response 200
{
  "userId": "uuid",
  "profileComplete": true,
  "glBudget": 100,
  "dietaryProfile": ["vegetarian"]
}
```

Validation rules:
- `a1cBaseline`: 4.0–14.0 (float, required)
- `a1cGoal`: must be ≥ baseline - 0.6 AND ≤ baseline - 0.1 AND ≥ 4.0
- `dietaryProfile`: array of enum values
- `glBudget`: auto-set based on dietary profile (80 standard, 100 vegetarian/vegan); user-overridable
- `ageConfirmed`: must be true (COPPA). If false → 403 with `{ "error": "AGE_REQUIREMENT_NOT_MET" }`
- `healthDataConsent`: must be true for EU users (GDPR Art. 9). If false → limited functionality

#### 4.1.3 Meal Scanning

**POST `/api/v1/scan`** — `multipart/form-data`

```
Fields:
  image: File (JPEG/PNG, max 10MB, auto-compressed to 1024×1024 on client)
  scanMode: "already_ate" | "planning" (default: "already_ate")
```

```json
// Response 200
{
  "scanId": "uuid",
  "totalGl": 34,
  "totalGlRange": null,
  "spikeRisk": "MODERATE",
  "confidence": "HIGH",
  "foods": [
    {
      "name": "Grilled chicken breast",
      "portionGrams": 150,
      "gl": 0,
      "gi": 0,
      "netCarbs": 0,
      "spikeRisk": "SAFE",
      "category": "protein"
    },
    {
      "name": "White rice",
      "portionGrams": 200,
      "gl": 29,
      "gi": 73,
      "netCarbs": 40,
      "spikeRisk": "HIGH",
      "category": "grain",
      "safetyFloorApplied": false
    },
    {
      "name": "Steamed broccoli",
      "portionGrams": 100,
      "gl": 5,
      "gi": 15,
      "netCarbs": 7,
      "spikeRisk": "SAFE",
      "category": "vegetable"
    }
  ],
  "sequencingAdvice": {
    "steps": [
      { "order": 1, "action": "Start with steamed broccoli", "reason": "Fiber slows glucose absorption" },
      { "order": 2, "action": "Eat grilled chicken next", "reason": "Protein before carbs reduces spike" },
      { "order": 3, "action": "Finish with white rice", "reason": "Carbs last minimizes glucose spike" }
    ],
    "citation": "Shukla et al. 2019, Diabetes Care",
    "estimatedSpikeReduction": "up to 30%"
  },
  "swapSuggestions": [
    {
      "original": "White rice",
      "originalGl": 29,
      "swap": "Cauliflower rice",
      "swapGl": 3,
      "glSaved": 26,
      "tasteTip": "Sauté with garlic and sesame oil for flavor"
    }
  ],
  "postMealAction": {
    "type": "walk",
    "message": "A 15-minute walk now can reduce your glucose spike by up to 30%",
    "notifyInMinutes": 5
  },
  "dailyBudget": {
    "glBudget": 80,
    "glConsumed": 52,
    "glRemaining": 28,
    "mealsLogged": 2
  },
  "disclaimer": "Estimate based on visual analysis — not medical advice",
  "imageUrl": "https://r2.revora.com/scans/uuid.jpg?token=...",
  "cachedResult": false,
  "isPremium": true
}
// Free tier response: sequencingAdvice, swapSuggestions, postMealAction = null
// Error 429: { "error": "SCAN_LIMIT_REACHED", "retryAfterSeconds": 43200, "scansRemaining": 0, "limit": 5 }
// Error 422: { "error": "INVALID_IMAGE", "details": "Image must be JPEG or PNG" }
```

When `confidence` is `MEDIUM` or `LOW`, `totalGlRange` is returned instead of `null`:
```json
{
  "totalGl": 34,
  "totalGlRange": { "low": 28, "high": 42 },
  "confidence": "MEDIUM"
}
```

When `scanMode` is `"planning"`, the meal is NOT logged to daily budget. Response includes `"logged": false`.

#### 4.1.4 Dashboard

**GET `/api/v1/dashboard/today`**

```json
// Response 200
{
  "date": "2026-03-15",
  "glBudget": 80,
  "glConsumed": 52,
  "glRemaining": 28,
  "dailyScore": "B",
  "dailyScorePercentage": 65,
  "meals": [
    {
      "scanId": "uuid",
      "time": "2026-03-15T08:30:00Z",
      "totalGl": 18,
      "spikeRisk": "MODERATE",
      "thumbnailUrl": "https://...",
      "primaryFood": "Oatmeal with berries"
    }
  ],
  "streak": {
    "currentDays": 12,
    "longestDays": 15,
    "nextMilestone": 14,
    "thresholdGl": 80
  }
}
```

Daily score grading (percentage = glConsumed / glBudget × 100):
- A: < 75%
- B: 75–100%
- C: 100–125%
- D: > 125%

#### 4.1.5 A1C Tracking

**POST `/api/v1/a1c`**

```json
// Request
{
  "value": 5.9,
  "testDate": "2026-03-10",
  "source": "lab"
}
// Response 201
{
  "id": "uuid",
  "value": 5.9,
  "testDate": "2026-03-10",
  "source": "lab",
  "previousValue": 6.1,
  "change": -0.2,
  "disclaimer": "Consult your healthcare provider about your A1C results."
}
```

**GET `/api/v1/a1c/estimate`**

```json
// Response 200
{
  "estimatedA1c": 5.85,
  "errorBound": 0.2,
  "range": { "low": 5.65, "high": 6.05 },
  "basedOnDays": 14,
  "lastLabValue": 6.1,
  "lastLabDate": "2026-01-15",
  "divergenceWarning": false,
  "disclaimer": "Estimate only — verify with laboratory A1C test. This is not a medical measurement."
}
```

When `|estimatedA1c - lastLabValue| > 0.3`, `divergenceWarning` = `true` and additional message: "Your lab results differ significantly from our estimate. Please consult your doctor."

#### 4.1.6 Weekly Insights

**GET `/api/v1/insights/weekly`**

```json
// Response 200
{
  "weekStart": "2026-03-09",
  "weekEnd": "2026-03-15",
  "summary": {
    "totalScans": 21,
    "averageDailyGl": 72,
    "daysUnderBudget": 5,
    "topSpikeFood": "White rice",
    "bestMeal": "Grilled salmon with quinoa",
    "streakDays": 12
  },
  "trends": {
    "glTrend": "improving",
    "glChangePercent": -8.5
  },
  "insights": [
    "Your breakfasts contribute 45% of your daily GL — consider lower-GL breakfast options.",
    "Food sequencing reduced your average dinner GL by 15% this week."
  ],
  "isPremium": true
}
// Free: summary only, insights = []
```

#### 4.1.7 Post-Meal Actions

**POST `/api/v1/walk/start`**

```json
// Request
{
  "scanId": "uuid",
  "startedAt": "2026-03-15T12:35:00Z"
}
// Response 200
{
  "walkId": "uuid",
  "scanId": "uuid",
  "startedAt": "2026-03-15T12:35:00Z",
  "targetMinutes": 15
}
```

**POST `/api/v1/walk/complete`**

```json
// Request
{
  "walkId": "uuid",
  "completedAt": "2026-03-15T12:50:00Z",
  "durationMinutes": 15
}
// Response 200
{
  "walkId": "uuid",
  "durationMinutes": 15,
  "message": "Great job! A 15-minute walk can reduce your glucose spike significantly."
}
```

#### 4.1.8 Educational Content

**GET `/api/v1/learn/articles?page=1&limit=10`**

```json
// Response 200
{
  "articles": [
    {
      "id": "uuid",
      "title": "Understanding Glycemic Load",
      "category": "fundamentals",
      "readTimeMinutes": 5,
      "isPremium": false,
      "thumbnailUrl": "https://...",
      "relevanceScore": 0.95
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 22 }
}
// Free: only articles where isPremium = false
```

#### 4.1.9 User Data (GDPR)

**GET `/api/v1/user/export`**

Returns complete user data as JSON. Performance target: < 10 seconds.

```json
// Response 200
{
  "exportDate": "2026-03-15T14:00:00Z",
  "user": { "email": "...", "name": "...", "createdAt": "...", "dietaryProfile": [...] },
  "a1cLogs": [...],
  "scans": [...],
  "meals": [...],
  "activities": [...],
  "streaks": {...}
}
```

**DELETE `/api/v1/user/account`**

```json
// Request
{
  "confirmEmail": "user@example.com",
  "reason": "optional feedback"
}
// Response 200
{
  "status": "scheduled",
  "softDeletedAt": "2026-03-15T14:00:00Z",
  "permanentDeletionAt": "2026-04-14T14:00:00Z",
  "message": "Your account has been scheduled for deletion. You have 30 days to reactivate."
}
```

Soft-delete: sets `deleted_at` timestamp, user cannot log in. 30-day purge job permanently deletes all data including R2 images.

#### 4.1.10 Shareable Cards (V1.1)

**GET `/api/v1/share/weekly-card`**

```json
// Response 200
{
  "cardUrl": "https://r2.revora.com/cards/uuid.png",
  "format": "png",
  "dimensions": { "width": 1080, "height": 1080 },
  "content": {
    "streakDays": 12,
    "avgDailyGl": 72,
    "daysUnderBudget": 5
  }
}
```

No A1C values on shared cards (privacy). Server-side SVG→PNG rendering.

#### 4.1.11 Monthly Report (V1.1)

**GET `/api/v1/reports/monthly?month=2026-03`**

```json
// Response 200
{
  "reportUrl": "https://r2.revora.com/reports/uuid.pdf",
  "month": "2026-03",
  "generatedAt": "2026-04-01T09:00:00Z",
  "summary": {
    "totalScans": 85,
    "avgDailyGl": 68,
    "daysUnderBudget": 22,
    "topSpikeFood": "White rice",
    "a1cEstimate": 5.85
  }
}
// Error 404 if not enough data for the month
```

#### 4.1.12 In-App Survey

**POST `/api/v1/user/survey`**

```json
// Request
{
  "surveyType": "day30_confidence",
  "responses": {
    "foodConfidence": 8,
    "foodAnxietyReduction": 7,
    "externalSearchReduction": 6,
    "nps": 9
  }
}
// Response 201
{
  "surveyId": "uuid",
  "thanksMessage": "Thank you for your feedback!"
}
```

#### 4.1.13 Scan Corrections

**POST `/api/v1/scan/corrections`**

```json
// Request
{
  "scanId": "uuid",
  "correctionType": "wrong_food",
  "details": "This was dal makhani, not lentil soup",
  "correctedFoods": [
    { "name": "Dal Makhani", "portionGrams": 200 }
  ]
}
// Response 201
{
  "correctionId": "uuid",
  "status": "received",
  "message": "Thanks! Your feedback helps improve our accuracy."
}
```

### 4.2 OpenAI GPT-4o Vision Integration

#### 4.2.1 System Prompt Template (Master Prompt)

```
You are Revora, an AI nutritionist specialized in glycemic load analysis for prediabetes management.

TASK: Analyze the provided meal photo and return a structured JSON response.

CRITICAL RULES:
1. ESTIMATE portions visually from the photo. NEVER assume standard serving sizes.
2. Use the plate/bowl as size reference. Average dinner plate = 25cm diameter.
3. For EACH food item, provide: name, estimated portion in grams, GI value, net carbs in grams, and calculated GL.
4. GL formula: GL = (GI × net_carbs_grams) / 100
5. Spike risk classification: SAFE (GL ≤10), MODERATE (GL 11-19), HIGH (GL ≥20)
6. When uncertain about a food item, OVERESTIMATE the GL (conservative safety bias).
7. For mixed/complex dishes where ingredients are not visible, state confidence as LOW and provide a GL RANGE.
8. Food sequencing advice: Always recommend vegetables first, then protein, then carbs last. Cite "Shukla et al. 2019" for the sequencing recommendation.
9. Swap suggestions: Provide 1-3 lower-GL alternatives. MUST respect the user's dietary restrictions: {dietary_restrictions}.
10. NEVER provide medical advice. Frame all output as educational nutritional information.
11. Include a post-meal action recommendation for MODERATE or HIGH risk meals.

USER CONTEXT:
- Dietary restrictions: {dietary_restrictions}
- Daily GL budget: {gl_budget}
- GL consumed today: {gl_consumed_today}

RESPONSE FORMAT (strict JSON):
{
  "foods": [
    {
      "name": "string",
      "portionGrams": number,
      "gi": number,
      "netCarbs": number,
      "gl": number,
      "spikeRisk": "SAFE" | "MODERATE" | "HIGH",
      "category": "protein" | "grain" | "vegetable" | "fruit" | "dairy" | "fat" | "beverage" | "mixed" | "other"
    }
  ],
  "totalGl": number,
  "totalGlRange": { "low": number, "high": number } | null,
  "spikeRisk": "SAFE" | "MODERATE" | "HIGH",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "sequencingAdvice": {
    "steps": [{ "order": number, "action": "string", "reason": "string" }],
    "citation": "Shukla et al. 2019, Diabetes Care"
  },
  "swapSuggestions": [
    {
      "original": "string",
      "originalGl": number,
      "swap": "string",
      "swapGl": number,
      "glSaved": number,
      "tasteTip": "string"
    }
  ],
  "postMealAction": {
    "type": "walk" | "none",
    "message": "string"
  }
}
```

#### 4.2.2 Complexity Classifier (GPT-4o Mini)

Pre-scan classifier to route images to the appropriate analysis pipeline.

**Prompt:**
```
Classify this food image into one category:
- SIMPLE: Single food item or clearly separated items on a plate (e.g., grilled chicken + rice + salad)
- COMPLEX_B: Mixed dish where main ingredients are partially visible (e.g., pasta with sauce, stir-fry)
- COMPLEX_C: Opaque dish where ingredients cannot be determined visually (e.g., curry, soup, casserole)

Respond with ONLY the category name: SIMPLE, COMPLEX_B, or COMPLEX_C
```

**Routing Logic:**
- SIMPLE → Single-pass GPT-4o analysis (§4.2.1 prompt)
- COMPLEX_B → Single-pass with conservative GL range + confidence = MEDIUM
- COMPLEX_C → User input modal ("What dish is this?") → dish name shortcut lookup → if not found, ingredient declaration mode → GL calculation from declared ingredients

#### 4.2.3 Safety Floor Implementation

```rust
use std::collections::HashMap;

fn apply_safety_floor(food_name: &str, ai_gl: f64) -> (f64, bool) {
    let floors: HashMap<&str, f64> = HashMap::from([
        ("white_rice", 20.0),
        ("pasta", 18.0),
        ("white_bread", 16.0),
        ("fruit_juice", 15.0),
        ("sweetened_beverage", 20.0),
        ("baked_goods", 15.0),
    ]);
    
    let category = categorize_food(food_name);
    if let Some(&floor) = floors.get(category.as_str()) {
        if ai_gl < floor {
            return (floor, true); // (overridden GL, safety_floor_applied)
        }
    }
    (ai_gl, false)
}
```

#### 4.2.4 Confidence Scoring

| Confidence | Condition | GL Display |
|-----------|-----------|-----------|
| HIGH | SIMPLE classification, all foods identified with >80% certainty | Point estimate |
| MEDIUM | COMPLEX_B, or any food with 50–80% certainty | GL range (±20%) |
| LOW | COMPLEX_C, or any food with <50% certainty, or safety floor applied | Wide GL range (±35%) + disclaimer |

#### 4.2.5 A1C Estimation Algorithm

```rust
/// Estimates projected A1C based on GL adherence patterns.
/// 
/// # Arguments
/// * `baseline` - Most recent lab A1C value
/// * `daily_gl_avgs` - Rolling 14-day average daily GL values
/// * `gl_budget` - User's configured GL budget
/// 
/// # Returns
/// Estimated A1C value clamped to [4.0, 14.0]
/// 
/// # Error Bounds
/// ±0.2 A1C points (displayed on every estimate)
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

**Mandatory display requirements:**
- Error bounds (±0.2) shown on every estimate
- Disclaimer: "Estimate only — verify with laboratory A1C test. This is not a medical measurement."
- Divergence warning when |estimated - lab| > 0.3

#### 4.2.6 Conservative Bias Correction

```rust
fn apply_conservative_bias(gl: f64, confidence: Confidence) -> f64 {
    match confidence {
        Confidence::High => gl,
        Confidence::Medium => gl * 1.10,  // +10% bias
        Confidence::Low => gl * 1.20,     // +20% bias
    }
}
```

#### 4.2.7 Tiered AI Cost Strategy

| Tier | Method | Cost/Scan | Target Hit Rate |
|------|--------|-----------|----------------|
| 1 | Redis pHash cache (7-day TTL) | $0 | 40%+ |
| 2 | Saved meal re-log (V1.1) | $0 | 15% |
| 3 | GPT-4o Mini classifier | ~$0.005 | 100% non-cached |
| 4 | GPT-4o single-pass | ~$0.05 | 85% of classified |
| 5 | GPT-4o two-pass (V1.1) | ~$0.12 | 15% of classified |

Blended cost target: $0.02/scan at 40% cache hit rate.

### 4.3 Database Schema (PostgreSQL 16)

#### 4.3.1 Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(100),
    a1c_baseline FLOAT,
    a1c_goal FLOAT,
    dietary_profile TEXT[] DEFAULT '{}',
    gl_budget INTEGER DEFAULT 80,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_guest BOOLEAN DEFAULT FALSE,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    health_data_consent BOOLEAN DEFAULT FALSE,
    age_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_subscription ON users(subscription_tier) WHERE deleted_at IS NULL;

-- RLS Policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_isolation ON users
    USING (id = current_setting('app.current_user_id')::UUID);
```

#### 4.3.2 Scans Table

```sql
CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url VARCHAR(512),
    thumbnail_url VARCHAR(512),
    image_phash BIGINT,
    total_gl FLOAT NOT NULL,
    total_gl_low FLOAT,
    total_gl_high FLOAT,
    spike_risk VARCHAR(10) NOT NULL CHECK (spike_risk IN ('SAFE', 'MODERATE', 'HIGH')),
    confidence VARCHAR(10) NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')),
    scan_mode VARCHAR(20) DEFAULT 'already_ate' CHECK (scan_mode IN ('already_ate', 'planning')),
    complexity VARCHAR(15) CHECK (complexity IN ('SIMPLE', 'COMPLEX_B', 'COMPLEX_C')),
    cached_result BOOLEAN DEFAULT FALSE,
    safety_floor_applied BOOLEAN DEFAULT FALSE,
    ai_model VARCHAR(50) DEFAULT 'gpt-4o',
    ai_cost_usd FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scans_user_date ON scans(user_id, created_at DESC);
CREATE INDEX idx_scans_phash ON scans(image_phash) WHERE image_phash IS NOT NULL;
CREATE INDEX idx_scans_user_mode ON scans(user_id, scan_mode, created_at DESC);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY scans_isolation ON scans
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

#### 4.3.3 Meals Table (Logged Scans Only)

```sql
CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    total_gl FLOAT NOT NULL,
    spike_risk VARCHAR(10) NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    meal_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_meals_user_date ON meals(user_id, meal_date DESC);
CREATE INDEX idx_meals_user_logged ON meals(user_id, logged_at DESC);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY meals_isolation ON meals
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

#### 4.3.4 Food Items Table (Normalized)

```sql
CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    portion_grams FLOAT NOT NULL,
    gi FLOAT NOT NULL,
    net_carbs FLOAT NOT NULL,
    gl FLOAT NOT NULL,
    spike_risk VARCHAR(10) NOT NULL,
    category VARCHAR(20),
    safety_floor_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_items_scan ON food_items(scan_id);
CREATE INDEX idx_food_items_user ON food_items(user_id, name);
CREATE INDEX idx_food_items_spike ON food_items(user_id, spike_risk) WHERE spike_risk = 'HIGH';

ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY food_items_isolation ON food_items
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

#### 4.3.5 A1C Logs Table

```sql
CREATE TABLE a1c_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value FLOAT NOT NULL CHECK (value >= 4.0 AND value <= 14.0),
    value_encrypted BYTEA,
    test_date DATE NOT NULL,
    source VARCHAR(20) NOT NULL CHECK (source IN ('lab', 'estimate')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_a1c_user_date ON a1c_logs(user_id, test_date DESC);

ALTER TABLE a1c_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY a1c_isolation ON a1c_logs
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

#### 4.3.6 Streaks Table

```sql
CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_streak_date DATE,
    threshold_gl INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_streaks_user ON streaks(user_id);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY streaks_isolation ON streaks
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

#### 4.3.7 Activities Table

```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES scans(id),
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('walk', 'exercise')),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_user ON activities(user_id, created_at DESC);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY activities_isolation ON activities
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

#### 4.3.8 Push Tokens Table

```sql
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(512) NOT NULL,
    platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_push_user ON push_tokens(user_id);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY push_isolation ON push_tokens
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

#### 4.3.9 Scan Corrections Table

```sql
CREATE TABLE scan_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    correction_type VARCHAR(30) NOT NULL,
    details TEXT,
    corrected_foods JSONB,
    status VARCHAR(20) DEFAULT 'received',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_corrections_status ON scan_corrections(status) WHERE status = 'received';

ALTER TABLE scan_corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY corrections_isolation ON scan_corrections
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

#### 4.3.10 Saved Meals Table (V1.1)

```sql
CREATE TABLE saved_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    food_items JSONB NOT NULL,
    total_gl FLOAT NOT NULL,
    spike_risk VARCHAR(10) NOT NULL,
    times_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_meals_user ON saved_meals(user_id);

ALTER TABLE saved_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY saved_meals_isolation ON saved_meals
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

#### 4.3.11 Dish GL Database (Lookup Table)

```sql
CREATE TABLE dish_gl_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dish_name VARCHAR(255) NOT NULL,
    cuisine VARCHAR(50),
    avg_gl FLOAT NOT NULL,
    gl_range_low FLOAT,
    gl_range_high FLOAT,
    typical_portion_grams FLOAT,
    source VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dish_gl_name ON dish_gl_database USING gin(to_tsvector('english', dish_name));
```

#### 4.3.12 Analytics Events Table

```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_name VARCHAR(100) NOT NULL,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_event ON analytics_events(event_name, created_at DESC);
CREATE INDEX idx_analytics_user ON analytics_events(user_id, created_at DESC);
```

#### 4.3.13 Surveys Table

```sql
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    survey_type VARCHAR(50) NOT NULL,
    responses JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_surveys_user ON surveys(user_id);

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY surveys_isolation ON surveys
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

### 4.4 Redis Cache Schema

#### 4.4.1 Scan Result Cache

```
Key:    scan:phash:{64-bit-phash-hex}
Value:  JSON scan result (compressed)
TTL:    7 days
Match:  Exact match only (Hamming distance = 0)
Hash:   64-bit DCT pHash via `image_hasher` crate
```

#### 4.4.2 Rate Limiting

```
Key:    ratelimit:scan:{user_id}:{date}
Value:  Integer (scan count today)
TTL:    24 hours (aligned to midnight user timezone)
Limit:  Free = 5, Premium = 100
```

```
Key:    ratelimit:global:{user_id}:{minute}
Value:  Integer (request count this minute)
TTL:    60 seconds
Limit:  100 requests/minute
```

#### 4.4.3 Session / Token Storage

```
Key:    refresh:{token_hash}
Value:  { "userId": "uuid", "createdAt": timestamp }
TTL:    30 days
Note:   One-time-use; deleted after consumption; all keys for user revoked on theft detection
```

#### 4.4.4 Daily GL Tracking

```
Key:    daily_gl:{user_id}:{date}
Value:  { "consumed": float, "budget": int, "mealsLogged": int }
TTL:    48 hours
```

---

## 5. RevenueCat Integration

### 5.1 Entitlement Map

| Entitlement | Free | Premium |
|------------|------|---------|
| `scan_limit` | 5/day | 100/day |
| `advice_cards` | false | true |
| `meal_history` | 7 days | unlimited |
| `a1c_tracker` | false | true |
| `weekly_reports` | summary | full |
| `monthly_pdf` | false | true |
| `educational_content` | 5 articles | full library |
| `priority_ai` | false | true |

### 5.2 Product Configuration

| Product ID 		| Platform 	| Price 	| Duration 		|
|-----------		|----------	|-------	|----------		|
| `revora_monthly` 	| iOS + Android | $12.99/month 	| Monthly auto-renew 	|
| `revora_annual` 	| iOS + Android | $99.99/year 	| Annual auto-renew 	|
| `revora_lifetime` 	| iOS + Android | $249.99 	| One-time purchase 	|

### 5.3 Subscription Lifecycle

```
Free User → Paywall Trigger → Trial Start (7-day, annual only)
  → Trial End → Convert to Paid / Revert to Free
Paid → Renewal / Cancellation / Grace Period (16 days iOS, 7 days Android)
Lifetime → Permanent premium access
```

### 5.4 Server-Side Verification

All premium feature checks verified server-side via RevenueCat webhook:
- `POST /webhooks/revenuecat` — receives subscription events
- Backend updates `users.subscription_tier` on purchase/renewal/cancellation/expiration
- Client caches entitlement status locally but server is authoritative

---

## 6. Mobile App Architecture

### 6.1 Navigation Structure (Expo Router)

```
app/
├── (auth)/
│   ├── login.tsx
│   ├── register.tsx
│   └── guest.tsx
├── (onboarding)/
│   ├── welcome.tsx
│   ├── a1c-entry.tsx
│   ├── goal.tsx
│   ├── dietary-profile.tsx
│   ├── gl-education.tsx
│   └── age-consent.tsx
├── (tabs)/
│   ├── index.tsx          (Home / Dashboard)
│   ├── scan.tsx           (Camera / FAB)
│   ├── progress.tsx       (A1C + History)
│   └── profile.tsx        (Settings)
├── scan/
│   └── [id].tsx           (Scan Results)
├── meal/
│   └── [id].tsx           (Meal Detail)
├── paywall.tsx
├── export.tsx
└── _layout.tsx
```

### 6.2 State Management (Zustand)

```typescript
// stores/userStore.ts
interface UserState {
  userId: string | null;
  isGuest: boolean;
  a1cBaseline: number | null;
  a1cGoal: number | null;
  dietaryProfile: string[];
  glBudget: number;
  subscriptionTier: 'free' | 'premium' | 'lifetime';
  timezone: string;
}

// stores/dashboardStore.ts
interface DashboardState {
  glConsumed: number;
  glBudget: number;
  meals: MealSummary[];
  streak: StreakInfo;
  dailyScore: 'A' | 'B' | 'C' | 'D';
}

// stores/scanStore.ts
interface ScanState {
  isScanning: boolean;
  currentScan: ScanResult | null;
  scanMode: 'already_ate' | 'planning';
  scanHistory: ScanResult[];
}
```

### 6.3 API Layer (TanStack Query)

```typescript
// hooks/useScan.ts
const useScan = () => useMutation({
  mutationFn: (formData: FormData) => api.post('/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  }
});

// hooks/useDashboard.ts
const useDashboard = () => useQuery({
  queryKey: ['dashboard', 'today'],
  queryFn: () => api.get('/dashboard/today'),
  refetchInterval: 30_000, // 30s polling
  staleTime: 10_000,
});

// hooks/useA1cEstimate.ts
const useA1cEstimate = () => useQuery({
  queryKey: ['a1c', 'estimate'],
  queryFn: () => api.get('/a1c/estimate'),
  staleTime: 60 * 60 * 1000, // 1 hour
});
```

### 6.4 Key Component Tree

```
App
├── AuthProvider
│   ├── OnboardingFlow (if !profileComplete)
│   └── TabNavigator
│       ├── HomeScreen
│       │   ├── GLGauge
│       │   ├── MealTimeline
│       │   │   └── MealCard (×N)
│       │   └── StreakBanner
│       ├── ScanScreen
│       │   ├── CameraView
│       │   │   ├── PlateOverlay
│       │   │   └── ModeToggle
│       │   └── ScanResultSheet
│       │       ├── GLScoreBanner
│       │       ├── FoodBreakdown
│       │       │   └── EditablePortionSlider
│       │       ├── AdviceCards (Premium)
│       │       │   ├── SequencingCard
│       │       │   ├── SwapCard
│       │       │   └── PostMealActionCard
│       │       ├── DisclaimerText
│       │       └── ActionBar
│       ├── ProgressScreen
│       │   ├── A1CChart
│       │   │   └── EstimateDisclaimer
│       │   ├── WeeklyReport
│       │   └── MealHistory
│       └── ProfileScreen
│           ├── DietaryProfileEditor
│           ├── SubscriptionManager
│           ├── DataExportButton
│           └── AccountDeletionButton
└── PaywallModal
```

---

## 7. CI/CD and Testing

### 7.1 GitHub Actions Pipelines

**Backend CI (`backend-ci.yml`):**
```yaml
triggers: push to main, PR to main
steps:
  - cargo fmt --check
  - cargo clippy -- -D warnings
  - cargo test --all-features
  - cargo build --release
coverage: ≥80% (enforced via cargo-tarpaulin)
```

**Frontend CI (`frontend-ci.yml`):**
```yaml
triggers: push to main, PR to main
steps:
  - npx eslint .
  - npx tsc --noEmit
  - npx jest --coverage
  - npx expo export (build validation)
coverage: ≥70% (enforced via jest --coverageThreshold)
```

**E2E Tests (`e2e-ci.yml`):**
```yaml
triggers: PR to main (required for merge)
steps:
  - Start backend in test mode
  - Run Detox (iOS simulator) or Maestro tests
  - Screenshot comparison for UI regression
```

### 7.2 Performance Testing

**k6 Load Test Scenarios:**

| Scenario | VUs | Duration | Target |
|----------|-----|----------|--------|
| Scan endpoint stress | 100 | 5 min | P95 < 5s, 0% errors |
| Dashboard load | 200 | 5 min | P95 < 1s |
| Auth flow | 50 | 3 min | P95 < 500ms |
| GDPR export | 20 | 3 min | P95 < 10s |
| Concurrent scans (V1.1) | 500 | 10 min | P95 < 8s |

### 7.3 Test Coverage Requirements

| Component | Minimum Coverage | Tools |
|-----------|-----------------|-------|
| Backend (Rust) | 80% | cargo-tarpaulin |
| Frontend (React Native) | 70% | Jest + React Testing Library |
| E2E | Critical paths | Detox / Maestro |
| API Integration | All endpoints | Postman / Newman |

---

## 8. Design Decisions and Rationale

### 8.1 Technology Choices

| Decision | Choice | Rationale | Alternatives Considered |
|----------|--------|-----------|----------------------|
| Mobile framework | React Native (Expo) | Cross-platform, large ecosystem, Expo managed workflow reduces DevOps | Flutter (smaller ecosystem), Swift+Kotlin (2× dev cost) |
| Backend language | Rust (Axum) | Performance, safety, low memory footprint, good for cost-sensitive API | Node.js (faster dev, lower performance), Go (good but less type safety) |
| Database | PostgreSQL 16 | JSONB support, RLS, mature ecosystem, Railway integration | MySQL (weaker JSONB), MongoDB (no ACID) |
| AI provider | OpenAI GPT-4o Vision | Best multimodal accuracy, JSON mode, proven in food analysis studies | Anthropic Claude (limited vision), Google Gemini (less proven for food) |
| Subscriptions | RevenueCat | Handles Apple/Google IAP complexity, webhook support, analytics | Custom implementation (6+ weeks, App Store compliance risk) |
| GL over calories | Glycemic Load | Most relevant metric for prediabetes; directly predicts glucose response | Calories (not glucose-specific), GI alone (ignores portion size) |
| Cache strategy | pHash + Redis | Exact perceptual match avoids serving stale results for different meals | MD5/SHA (too strict, rotation breaks match), fuzzy match (safety risk) |

### 8.2 Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API convention | camelCase JSON | Standard for JavaScript/TypeScript clients; matches React Native conventions |
| Spike risk enum | SAFE / MODERATE / HIGH | Three-tier is sufficient for user action; matches GL thresholds (≤10, 11-19, ≥20) |
| Deletion strategy | Soft-delete (30-day purge) | GDPR compliance; allows account recovery; scheduled purge job |
| Photo retention | 90-day full, indefinite thumbnail | Balance cost vs. history value; thumbnails sufficient for UI |
| Auth token strategy | JWT + one-time-use refresh | Security best practice; theft detection via replay |
| Rate limiting | Server-side Redis token bucket | Prevents free tier abuse; client-side limits easily bypassed |
| Food items storage | Normalized table (not JSONB in scans) | Enables per-food queries (top spike foods, pattern analysis) without JSON parsing |
| A1C storage | Application-layer encryption + DB encryption | Defense-in-depth for most sensitive health data |

---

## 9. Dependencies

### 9.1 External System Dependencies

| System | Criticality | Fallback |
|--------|-----------|----------|
| OpenAI API | Critical | Redis cache for repeat meals; scan queue during outage; secondary provider eval |
| USDA FoodData Central | Low | Local cache of common foods; OpenAI provides nutrition data in prompt response |
| RevenueCat | High | Grace period for subscriptions; local entitlement cache |
| Cloudflare R2 | Medium | Scans work without photo storage (results still returned); photo upload retried |
| Railway.app | Critical | Migration path: Fly.io (>5K MAU), AWS ECS (>25K MAU) |

### 9.2 Compliance Dependencies

| Requirement | Status | Blocker |
|------------|--------|---------|
| GDPR data export endpoint | Specified (§4.1.9) | MVP |
| GDPR deletion endpoint | Specified (§4.1.9) | MVP |
| GDPR DPIA | Pre-launch task | Yes |
| OpenAI DPA | Pre-launch task | Yes |
| COPPA age gate | Specified (§4.1.2) | MVP |
| Health data consent | Specified (§4.1.2) | MVP |
| App Store health declaration | Pre-submission | Yes |
| Penetration test | Pre-launch | Yes |

---

## 10. Acceptance Criteria

### 10.1 Core Feature Acceptance Criteria

| ID | Feature | Criterion | Target |
|----|---------|-----------|--------|
| VAL-001 | Spike risk classification | Correct classification (SAFE/MODERATE/HIGH) on 100-meal validation set | ≥85% accuracy |
| VAL-002 | Onboarding completion | Users complete onboarding and reach first scan | ≥80% completion, first scan within 90 seconds |
| VAL-003 | Scan response time (single-pass) | P95 latency from image upload to result display | ≤5 seconds |
| VAL-004 | Scan response time (two-pass, V1.1) | P95 latency including complexity classifier + two-pass analysis | ≤8 seconds |
| VAL-005 | Daily GL budget accuracy | GL gauge updates correctly after meal logging | Within 2 seconds, accurate to ±0.1 GL |
| VAL-006 | Streak calculation | Streak increments only when daily GL ≤ user's configured budget | 100% correctness |
| VAL-007 | A1C estimation | Estimation updates daily based on rolling 14-day GL average with ±0.2 bounds | Algorithm output matches spec formula |
| VAL-008 | Dietary restriction compliance | All swap suggestions respect user's dietary restrictions | 100% accuracy (zero tolerance) |
| VAL-009 | Safety floor overrides | Safety floor fires for all specified food categories when AI GL is below threshold | 100% coverage |
| VAL-010 | GDPR data export | Complete user data exported as JSON | <10 seconds |
| VAL-011 | GDPR account deletion | Soft-delete with 30-day purge; all data permanently removed after purge | 100% data removal verified |
| VAL-012 | Rate limiting (free tier) | 6th scan attempt returns 429 with correct headers | `retryAfterSeconds` + `scansRemaining: 0` |
| VAL-013 | Guest mode | Guest can scan up to 3 meals without account | Scans work, data preserved on conversion |
| VAL-014 | COPPA age gate | Users under 13 blocked from account creation | No data collected for under-13 |
| VAL-015 | Health data consent | Separate consent checkbox during onboarding for EU users | Consent recorded in database |
| VAL-016 | A1C disclaimer | Disclaimer text visible adjacent to every A1C estimate display | "Estimate only — verify with laboratory A1C test" |
| VAL-017 | Scan disclaimer | Disclaimer visible on every scan result screen | "Estimate based on visual analysis — not medical advice" |
| VAL-018 | Divergence warning | Warning displayed when |estimated A1C - lab A1C| > 0.3 | Correct trigger and message |
| VAL-019 | Confidence scoring | Confidence level correctly assigned based on complexity classification | HIGH/MEDIUM/LOW matches spec rules |
| VAL-020 | Conservative bias | GL overestimated by correct percentage for MEDIUM (+10%) and LOW (+20%) confidence | Calculation matches spec formula |
| VAL-021 | Post-meal notification | Push notification sent 5 minutes after logging MODERATE/HIGH meal | Timing ±30 seconds; quiet hours respected |
| VAL-022 | Walk timer | Walk timer tracks duration accurately and links to meal ID | Duration within ±5 seconds |
| VAL-023 | Free tier gating | Free users see GL + spike risk only; advice cards, A1C tracker, extended history locked | Server-enforced, not client-only |
| VAL-024 | Midnight GL reset | Daily GL budget resets at midnight in user's configured timezone | Correct timezone handling |
| VAL-025 | Editable portions | User can adjust portion sizes; GL recalculated correctly | GL recalculation within 500ms |
| VAL-026 | Scan corrections | "Report Inaccurate Result" button visible on every scan; correction saved | Correction stored in `scan_corrections` table |
| VAL-027 | RevenueCat integration | Subscription purchase, renewal, cancellation, expiration handled correctly | Server-side tier updated within 60 seconds |
| VAL-028 | Refresh token rotation | Each refresh token single-use; replay revokes all user tokens | Theft detection works correctly |
| VAL-029 | App cold start | Time from app launch to interactive home screen | <2 seconds |
| VAL-030 | Crash-free rate | Percentage of sessions without crash | ≥99.5% |

### 10.2 PRD Feature → SPEC Coverage Matrix

Every PRD feature has corresponding SPEC acceptance criteria:

| PRD Feature (§) | SPEC Coverage | Acceptance Criteria |
|-----------------|--------------|-------------------|
| §6.1 Onboarding | §4.1.2, §6.1 | VAL-002, VAL-014, VAL-015 |
| §6.2 Core Scan | §4.1.3, §4.2 | VAL-001, VAL-003, VAL-009, VAL-017, VAL-019, VAL-020, VAL-025, VAL-026 |
| §6.3 GL Budget Tracker | §4.1.4 | VAL-005, VAL-006, VAL-024 |
| §6.4 A1C Progress Tracker | §4.1.5, §4.2.5 | VAL-007, VAL-016, VAL-018 |
| §6.5 Food Sequencing Coach | §4.1.3 (response) | VAL-001 (sequencing in response) |
| §6.6 Safer Swap Engine | §4.1.3 (response) | VAL-008 |
| §6.7 Meal History | §4.1.4, §4.1.6 | VAL-023 (7-day free tier) |
| §6.8 Post-Meal Actions | §4.1.7 | VAL-021, VAL-022 |
| §6.9 Educational Content | §4.1.8 | VAL-023 (5 free articles) |
| §6.10 CGM Integration | Deferred V1.3 | N/A (acceptance criteria defined at implementation) |
| §6.11 Barcode Scanner | Deferred V1.1 | N/A (acceptance criteria defined at implementation) |
| §6.12 Social Features | Deferred V2.0 | N/A |
| §6.13 Meal Templates | Deferred V1.1 | N/A |
| Guest Mode | §4.1.1 | VAL-013 |
| GDPR Export | §4.1.9 | VAL-010 |
| GDPR Deletion | §4.1.9 | VAL-011 |
| Rate Limiting | §4.4.2 | VAL-012 |

---

## 11. Validation Methodology

### 11.1 AI Accuracy Validation

**Pre-Launch (MVP Gate):**
1. Curate 100-meal validation dataset (diverse cuisines, portion sizes, complexities)
2. Run each meal through scan pipeline
3. Compare AI spike risk classification against dietitian-reviewed ground truth
4. **Gate: ≥85% spike risk accuracy required for launch** (VAL-001)
5. Document failure cases for prompt refinement

**Ongoing (Post-Launch):**
- Track `scan_corrections` submissions weekly
- Monthly accuracy re-validation on 50-meal sample
- Alert if accuracy drops below 80% on any weekly sample
- Prompt refinement cycle: monthly review of worst-performing food categories

### 11.2 Performance Validation

| Test | Method | Frequency |
|------|--------|-----------|
| Scan P95 latency | k6 load test (100 VUs) | Pre-launch + weekly |
| Dashboard load | k6 (200 VUs) | Pre-launch + weekly |
| GDPR export speed | Integration test | Pre-launch + monthly |
| Cache hit rate | Redis monitoring | Daily dashboard |
| API availability | Uptime monitoring (Railway) | Continuous |

### 11.3 Security Validation

| Test | Method | Timing |
|------|--------|--------|
| Penetration test | External security firm | Pre-launch (required) |
| OWASP Top 10 scan | Automated (ZAP/Burp) | Pre-launch + monthly |
| Auth flow review | Manual + automated | Pre-launch |
| RLS policy verification | SQL test suite | CI pipeline |
| Rate limit bypass attempts | Automated fuzzing | Pre-launch |
| Token rotation verification | Integration test | CI pipeline |

### 11.4 Compliance Validation

| Check | Method | Timing |
|-------|--------|--------|
| GDPR export completeness | Compare exported JSON against DB | Pre-launch |
| GDPR deletion completeness | Verify zero rows after purge | Pre-launch |
| COPPA age gate | Attempt under-13 registration | Pre-launch |
| Health data consent flow | E2E test (EU user flow) | Pre-launch |
| Disclaimer presence | UI automated test (every A1C + scan screen) | CI pipeline |
| "Reversal" language audit | `grep -r "revers" src/` | CI pipeline (fail on match) |

### 11.5 Infrastructure Cost Validation

| Metric | Target | Monitoring |
|--------|--------|-----------|
| Cost per scan (blended) | ≤$0.02 | Weekly calculation |
| Monthly infra cost (5K MAU) | <$500 | Monthly review |
| Free user API cost burden | Track separately | Weekly dashboard |
| Cache hit rate | ≥40% | Daily metric |

---

## 12. Related Documentation

### 12.1 Internal Documents

| Document | Purpose |
|----------|---------|
| Revora PRD v2.0 | Product requirements, business model, go-to-market |
| Revora Traceability Matrix v1.0 | Pain point → goal → feature → requirement → AC mapping |
| Revora Deep Audit Report v1.0 | Source of 60 issues addressed in this revision |
| Revora Feasibility Analysis v1.0 | Source of 8 blockers and 25 risks |

### 12.2 External References

| Resource | Usage |
|----------|-------|
| OpenAI API Documentation | GPT-4o Vision integration |
| RevenueCat React Native SDK | Subscription management |
| Expo SDK 52 Documentation | Mobile app framework |
| Axum Documentation | Rust web framework |
| PostgreSQL 16 Documentation | Database features (RLS, JSONB) |
| USDA FoodData Central API | Nutrition data |
| Shukla et al. 2019, Diabetes Care | Food sequencing citation |
| Chi et al. 2025, Digital Health | AI food recognition accuracy benchmarks |
| FDA General Wellness Guidance (2016) | Regulatory classification |
| GDPR Articles 9, 17, 20 | Health data processing, deletion, portability |

### 12.3 Open Source Libraries

| Library | Version | License | Purpose |
|---------|---------|---------|---------|
| axum | 0.7+ | MIT | Web framework |
| sqlx | 0.7+ | MIT/Apache-2.0 | Database driver |
| image_hasher | 2.0+ | MIT | pHash computation |
| serde_json | 1.0+ | MIT/Apache-2.0 | JSON serialization |
| react-native | 0.73+ | MIT | Mobile framework |
| expo | SDK 52 | MIT | Development platform |
| zustand | 4.5+ | MIT | State management |
| @tanstack/react-query | 5.0+ | MIT | API layer |
| victory-native | 41+ | MIT | Charts |
| react-native-purchases | 8.0+ | MIT | RevenueCat SDK |

---

## 13. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-26 | Engineering | Initial specification |
| 2.0 | 2026-03-15 | Engineering | Comprehensive revision: 9 new endpoints, normalized food_items table, safety floors, A1C algorithm, GDPR endpoints, guest auth, rate limiting, RevenueCat entitlements, 30 acceptance criteria, PRD→SPEC coverage matrix |

---

**END OF DOCUMENT — Revora Technical Specification v2.0**

*Document Version 2.0 | Last Updated: 2026-03-15*
