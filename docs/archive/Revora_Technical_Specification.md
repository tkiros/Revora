# title: GlucoSnap Technical Specification - AI-Powered Prediabetes Reversal Companion
version: 1.0
date_created: 2026-03-01
last_updated: 2026-03-01
owner: Product and Engineering Team
tags: [mobile-app, health-tech, ai, prediabetes, react-native, rust, technical-spec]
---

# Introduction

GlucoSnap is a mobile-first prediabetes reversal companion application that transforms the overwhelming experience of managing prediabetes into a confident, actionable daily practice. This technical specification defines the requirements, constraints, and interfaces for all solution components required to build and deploy GlucoSnap from MVP through Version 1.0.

The specification addresses the critical gap between prediabetes diagnosis and successful behavior change for 88 million Americans with prediabetes[1]. By combining instant photo-based meal analysis with Glycemic Load (GL) tracking and personalized guidance, GlucoSnap answers the fundamental question every prediabetic asks 3-5 times daily: "Can I eat this? Will this spike me?"

This document serves as the authoritative source for engineering, QA, product design, and DevOps teams during the development lifecycle.

## 1. Purpose & Scope

**Purpose**: Define complete technical requirements for GlucoSnap mobile application (iOS and Android), backend services, AI integration, and supporting infrastructure to enable development from MVP through Version 1.0 launch.

**Intended Audience**: 
- Software engineers (frontend, backend, full-stack)
- QA and test automation engineers
- DevOps and infrastructure engineers
- Product designers and UX researchers
- Technical product managers
- Security and compliance reviewers

**In Scope**:
- iOS and Android mobile applications (React Native)
- Backend API services (Rust/Axum)
- AI-powered meal analysis (OpenAI GPT-4o Vision)
- Glycemic Load calculation engine
- User authentication and authorization
- Subscription payment processing (RevenueCat/Stripe)
- Data persistence (PostgreSQL, Redis)
- File storage for meal images (Cloudflare R2)
- Push notification system
- Analytics and monitoring infrastructure
- App Store and Google Play compliance

**Out of Scope** (explicitly excluded from MVP/V1.0):
- Medical diagnosis or treatment recommendations
- Blood glucose meter hardware integration
- Prescription medication tracking
- Healthcare provider portal
- Insurance billing integration
- FDA medical device classification pathway
- Continuous Glucose Monitor (CGM) hardware development
- Web application (mobile-only for MVP)

## 2. Definitions

| Term | Definition |
|------|------------|
| **A1C (HbA1c)** | Hemoglobin A1C test measuring average blood glucose over 90 days; prediabetes range: 5.7-6.4% |
| **Glycemic Index (GI)** | Numerical scale (0-100) rating how quickly a carbohydrate raises blood glucose relative to pure glucose |
| **Glycemic Load (GL)** | Formula combining GI with portion size: GL = (GI × net carbs in grams) / 100 |
| **GL Budget** | Daily Glycemic Load target (typically 80-100 points) for prediabetes management |
| **Spike Risk** | Classification of blood glucose impact: Safe (GL <20), Moderate (GL 20-30), High (GL >30) |
| **Food Sequencing** | Evidence-based eating order (vegetables → protein → carbohydrates) that reduces postprandial glucose spikes by up to 30% |
| **Prediabetes** | Condition where blood glucose is elevated but not yet Type 2 diabetes; A1C 5.7-6.4% |
| **DAU/MAU** | Daily Active Users / Monthly Active Users ratio; key engagement metric |
| **MAPE** | Mean Absolute Percentage Error; accuracy metric for nutrient estimation |
| **PHI** | Protected Health Information; health data requiring enhanced privacy protection |
| **RevenueCat** | Third-party subscription management platform abstracting App Store and Google Play billing |
| **Expo** | React Native framework providing managed workflow and build services (EAS) |
| **Axum** | Rust web framework for building HTTP APIs with async support |
| **JWT** | JSON Web Token; token-based authentication standard |
| **P0/P1/P2** | Priority levels: P0 (MVP critical), P1 (Version 1.1), P2 (Version 1.2+) |

## 3. Requirements, Constraints & Guidelines

### Functional Requirements

**REQ-001**: The system SHALL enable users to capture meal photos via device camera or upload from camera roll

**REQ-002**: The system SHALL analyze meal photos and return structured nutrition data within 5 seconds (P95 latency)

**REQ-003**: The system SHALL calculate Glycemic Load (GL) for identified food items using the formula: GL = (GI × net carbs) / 100

**REQ-004**: The system SHALL classify meals into three spike risk categories: Safe (GL <20), Moderate (GL 20-30), High (GL >30)

**REQ-005**: The system SHALL provide food sequencing recommendations (vegetables → protein → carbohydrates) for all meals containing 2+ food components

**REQ-006**: The system SHALL generate 2-3 specific food swaps for Moderate and High spike risk meals

**REQ-007**: The system SHALL respect user dietary restrictions (vegetarian, vegan, gluten-free, dairy-free, halal, kosher) in all swap recommendations

**REQ-008**: The system SHALL track daily GL budget consumption in real-time across all logged meals

**REQ-009**: The system SHALL maintain consecutive day streak counter for users staying within daily GL budget

**REQ-010**: The system SHALL calculate estimated A1C trajectory based on 14-day rolling average GL adherence

**REQ-011**: The system SHALL allow manual A1C entry from laboratory tests or home test kits

**REQ-012**: The system SHALL display 90-day A1C reversal roadmap showing baseline, current estimate, and goal

**REQ-013**: The system SHALL persist complete meal history with photos, GL scores, and timestamps

**REQ-014**: The system SHALL generate automated weekly progress reports every Sunday 9:00 AM user local time

**REQ-015**: The system SHALL send post-meal action push notifications 5 minutes after meal logging for Moderate/High spike meals

**REQ-016**: The system SHALL implement freemium subscription model with 5 scans per day for free tier

**REQ-017**: The system SHALL process subscription payments via RevenueCat integration (Apple/Google in-app purchase)

**REQ-018**: The system SHALL authenticate users via email/password or OAuth2 (Google, Apple Sign-In)

**REQ-019**: The system SHALL support iOS 15+ and Android 11+ (API level 30+)

**REQ-020**: The system SHALL store meal photos for 90 days with automatic deletion thereafter (unless user opts to retain)

### Security Requirements

**SEC-001**: All API endpoints SHALL require valid JWT authentication token

**SEC-002**: All data in transit SHALL be encrypted using TLS 1.3 minimum

**SEC-003**: All data at rest SHALL be encrypted using AES-256 encryption

**SEC-004**: User passwords SHALL be hashed using Argon2id with salt

**SEC-005**: JWT access tokens SHALL expire after 15 minutes; refresh tokens after 30 days

**SEC-006**: API rate limiting SHALL be enforced: 100 requests/minute per user, 5 scans/day for free tier

**SEC-007**: Meal photo URLs SHALL use signed URLs with 1-hour expiration

**SEC-008**: Personally Identifiable Information (PII) and Protected Health Information (PHI) SHALL be classified and tagged in database

**SEC-009**: OpenAI API keys SHALL be stored server-side only; never exposed in mobile application code

**SEC-010**: User data export SHALL be available on-demand (GDPR Article 20 compliance)

**SEC-011**: User data deletion SHALL complete within 30 days of request (GDPR Article 17 compliance)

**SEC-012**: All administrative database access SHALL be logged with user, timestamp, and operation type

**SEC-013**: Two-factor authentication (2FA) SHALL be required for all administrative access

**SEC-014**: Redis cache keys SHALL use perceptual hash (pHash) for privacy preservation

**SEC-015**: Security incident response plan SHALL define 72-hour breach notification protocol

### Performance Requirements

**PER-001**: Scan API response time SHALL be ≤5 seconds at 95th percentile

**PER-002**: Mobile app cold start SHALL be ≤2 seconds on reference devices (iPhone 13, Samsung S22)

**PER-003**: Dashboard screen SHALL load within 1 second

**PER-004**: Image upload size limit SHALL be 10MB; auto-compressed to 512×512px maximum dimension

**PER-005**: Backend API availability SHALL maintain 99.5% uptime (monthly SLA)

**PER-006**: System SHALL support 1,000 concurrent scan operations with auto-scaling

**PER-007**: Database query response time SHALL be ≤200ms at 95th percentile for meal history queries

**PER-008**: Push notifications SHALL deliver within 60 seconds of trigger event

**PER-009**: Weekly report generation SHALL complete within 5 seconds per user

**PER-010**: Redis cache hit rate SHALL maintain ≥40% for repeated meal scans

### Data Retention Requirements

**DAT-001**: Meal photos SHALL be retained for 90 days by default; auto-deleted thereafter

**DAT-002**: Users MAY opt-in to indefinite meal photo retention (premium feature)

**DAT-003**: Nutrition data (GL scores, food items, timestamps) SHALL be retained indefinitely while account is active

**DAT-004**: A1C logs SHALL be retained indefinitely while account is active

**DAT-005**: User account data SHALL be soft-deleted (marked inactive) upon account deletion; hard-deleted after 30 days

**DAT-006**: Analytics events SHALL be retained for 24 months in time-series database

**DAT-007**: Anonymized aggregate data MAY be retained indefinitely for research (requires explicit user opt-in)

### Constraints

**CON-001**: OpenAI GPT-4o Vision API cost constraint: target ≤$0.15 per scan (includes image processing + structured output)

**CON-002**: Total backend infrastructure cost constraint: ≤$2,000/month at 10,000 monthly active users

**CON-003**: Mobile app bundle size constraint: ≤50MB for initial download (iOS/Android)

**CON-004**: Offline functionality constraint: meal scanning requires internet connectivity; dashboard read-only offline

**CON-005**: Apple App Store review time constraint: minimum 2-5 days; plan submission accordingly

**CON-006**: Google Play Store review time constraint: minimum 1-3 days; plan submission accordingly

**CON-007**: RevenueCat transaction fee: 1% of subscription revenue after $10K monthly

**CON-008**: Expo EAS Build concurrent build limit: 2 concurrent iOS/Android builds (free tier)

**CON-009**: Device camera permission required: app cannot function without camera access for photo scanning

**CON-010**: Regulatory constraint: app MUST NOT provide medical diagnosis, treatment advice, or disease prevention claims (FDA guidance)

### Guidelines

**GUD-001**: User interface SHOULD follow platform-native design patterns (iOS Human Interface Guidelines, Material Design)

**GUD-002**: Error messages SHOULD be user-friendly, actionable, and avoid technical jargon

**GUD-003**: All user-facing content SHOULD use encouraging, hope-focused language; avoid fear-based messaging

**GUD-004**: Food imagery SHOULD use warm, appetizing photography; avoid clinical/sterile medical aesthetic

**GUD-005**: Each screen SHOULD have exactly one primary call-to-action; minimize decision fatigue

**GUD-006**: Onboarding flow SHOULD complete in ≤90 seconds; skip options available

**GUD-007**: Backend services SHOULD follow 12-factor app methodology for cloud deployment

**GUD-008**: API responses SHOULD use consistent JSON schema with camelCase field naming

**GUD-009**: Git commit messages SHOULD follow Conventional Commits specification

**GUD-010**: Code reviews SHOULD be completed within 24 hours of pull request submission

### Design Patterns

**PAT-001**: Repository Pattern: Database access MUST be abstracted through repository interfaces

**PAT-002**: Service Layer Pattern: Business logic MUST be encapsulated in service classes separate from API controllers

**PAT-003**: DTO Pattern: Data Transfer Objects MUST be used for API request/response schemas; distinct from database entities

**PAT-004**: Factory Pattern: Complex object creation (AI prompts, GL calculations) SHOULD use factory classes

**PAT-005**: Strategy Pattern: Dietary restriction filtering SHOULD implement strategy pattern for extensibility

**PAT-006**: Observer Pattern: Real-time GL budget updates SHOULD use observer/pub-sub pattern

**PAT-007**: Cache-Aside Pattern: AI scan results SHOULD implement cache-aside with Redis

**PAT-008**: Circuit Breaker Pattern: External API calls (OpenAI, Terra) SHOULD implement circuit breaker for resilience

**PAT-009**: Optimistic UI Pattern: Meal logging SHOULD update UI immediately; sync asynchronously

**PAT-010**: Progressive Disclosure Pattern: Complex data (nutrient breakdown) SHOULD be hidden behind expandable sections

## 4. Interfaces & Data Contracts

### 4.1 REST API Endpoints

#### Authentication

**POST /api/v1/auth/register**

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "dietaryProfile": ["vegetarian", "gluten-free"]
}

Response (201 Created):
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}

**POST /api/v1/auth/login**

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (200 OK):
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}

**POST /api/v1/auth/refresh**

Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}

#### Meal Scanning

**POST /api/v1/scan**

Request (multipart/form-data):
image: [binary image data]
userId: "550e8400-e29b-41d4-a716-446655440000"
dietaryProfile: ["vegetarian"]
glBudget: 80
glUsedToday: 34

Response (200 OK):
{
  "scanId": "660e8400-e29b-41d4-a716-446655440001",
  "imageUrl": "https://r2.glucosnap.com/meals/signed-url-with-1hr-expiry",
  "totalGl": 24,
  "overallSpikeRisk": "MODERATE",
  "foodItems": [
    {
      "name": "Brown rice",
      "portion": "1 cup",
      "gl": 16,
      "gi": 50,
      "carbsG": 45,
      "fiberG": 3,
      "proteinG": 5,
      "fatG": 2,
      "spikeRisk": "MODERATE"
    },
    {
      "name": "Grilled chicken breast",
      "portion": "4 oz",
      "gl": 0,
      "gi": 0,
      "carbsG": 0,
      "fiberG": 0,
      "proteinG": 28,
      "fatG": 3,
      "spikeRisk": "SAFE"
    },
    {
      "name": "Steamed broccoli",
      "portion": "1 cup",
      "gl": 3,
      "gi": 15,
      "carbsG": 6,
      "fiberG": 2,
      "proteinG": 3,
      "fatG": 0,
      "spikeRisk": "SAFE"
    }
  ],
  "adviceCards": {
    "sequencing": {
      "steps": [
        "1. Start with the broccoli - Fiber first slows glucose absorption",
        "2. Eat the chicken next - Protein further reduces spike",
        "3. Have the rice last - This sequence reduces your spike by 30%"
      ],
      "scientificCitation": "Shukla et al. 2019 - Food Order Has a Significant Impact on Postprandial Glucose and Insulin Levels"
    },
    "swaps": [
      {
        "replace": "White rice (GL 31)",
        "with": "Cauliflower rice (GL 4)",
        "glSaved": 27,
        "tasteTip": "Add garlic and olive oil to match the comfort feel"
      },
      {
        "replace": "Brown rice (GL 16)",
        "with": "Half portion brown rice + extra broccoli (GL 9)",
        "glSaved": 7,
        "tasteTip": "Maintains fullness while reducing spike"
      }
    ],
    "postMeal": {
      "action": "walk",
      "durationMin": 15,
      "timing": "within 30 minutes",
      "benefit": "Reduces spike by up to 30%"
    }
  },
  "glBudgetRemaining": 56,
  "confidenceLevel": "HIGH"
}

Error Response (400 Bad Request):
{
  "error": "UNRECOGNIZABLE_FOOD",
  "message": "We couldn't identify this food clearly. Try a closer photo or better lighting.",
  "scanId": "660e8400-e29b-41d4-a716-446655440001"
}

#### Dashboard

**GET /api/v1/dashboard/today**

Request: (Authorization: Bearer {accessToken})

Response (200 OK):
{
  "date": "2026-03-01",
  "glBudget": 80,
  "glUsed": 54,
  "glRemaining": 26,
  "dailyScore": "B",
  "currentStreak": 7,
  "longestStreak": 14,
  "todaysMeals": [
    {
      "mealId": "770e8400-e29b-41d4-a716-446655440002",
      "scanId": "660e8400-e29b-41d4-a716-446655440001",
      "mealName": "Chicken and rice bowl",
      "timestamp": "2026-03-01T12:34:56Z",
      "thumbnailUrl": "https://r2.glucosnap.com/meals/thumb-signed-url",
      "glValue": 24,
      "spikeRisk": "MODERATE"
    },
    {
      "mealId": "770e8400-e29b-41d4-a716-446655440003",
      "scanId": "660e8400-e29b-41d4-a716-446655440004",
      "mealName": "Greek yogurt with berries",
      "timestamp": "2026-03-01T08:15:32Z",
      "thumbnailUrl": "https://r2.glucosnap.com/meals/thumb-signed-url",
      "glValue": 12,
      "spikeRisk": "SAFE"
    }
  ]
}

#### A1C Tracking

**POST /api/v1/a1c**

Request:
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "testDate": "2026-03-01",
  "a1cValue": 5.9
}

Response (201 Created):
{
  "a1cLogId": "880e8400-e29b-41d4-a716-446655440005",
  "testDate": "2026-03-01",
  "a1cValue": 5.9,
  "improvement": -0.3,
  "daysFromBaseline": 45,
  "message": "You dropped from 6.2 to 5.9! That's real progress—you're doing it."
}

**GET /api/v1/a1c/roadmap**

Response (200 OK):
{
  "baselineA1c": 6.2,
  "baselineDate": "2026-01-15",
  "currentEstimatedA1c": 5.8,
  "goalA1c": 5.5,
  "daysSinceBaseline": 45,
  "daysToGoal": 45,
  "estimatedGoalDate": "2026-04-15",
  "trajectory": "ON_TRACK",
  "averageDailyGlLast14Days": 68,
  "projectedA1cChange": -0.4
}

#### Weekly Insights

**GET /api/v1/insights/weekly**

Response (200 OK):
{
  "weekStartDate": "2026-02-24",
  "weekEndDate": "2026-03-01",
  "averageDailyGl": 72,
  "averageDailyGlPreviousWeek": 78,
  "weekOverWeekChange": -6,
  "daysInStreak": 6,
  "bestMeal": {
    "mealName": "Salmon with vegetables",
    "glValue": 8,
    "date": "2026-02-28"
  },
  "highestSpikeMeal": {
    "mealName": "Pasta with marinara",
    "glValue": 42,
    "date": "2026-02-25",
    "suggestedFix": "Try zucchini noodles instead - saves 35 GL points"
  },
  "estimatedA1cTrajectory": 5.7,
  "motivationalMessage": "You're crushing it! Week-over-week improvement for 3 weeks straight."
}

### 4.2 OpenAI GPT-4o Vision Integration

#### System Prompt Template

You are GlucoSnap's prediabetes nutrition expert. Analyze this meal photo.

USER CONTEXT:
- Dietary restrictions: {dietaryProfile}
- Daily GL budget: {glBudget}
- GL used today so far: {glUsedToday}

Return ONLY a valid JSON object matching this exact schema:
{
  "totalGl": <integer>,
  "overallSpikeRisk": "SAFE" | "MODERATE" | "HIGH",
  "foodItems": [
    {
      "name": <string>,
      "portion": <string>,
      "gl": <integer>,
      "gi": <integer>,
      "carbsG": <integer>,
      "fiberG": <integer>,
      "proteinG": <integer>,
      "fatG": <integer>,
      "spikeRisk": "SAFE" | "MODERATE" | "HIGH"
    }
  ],
  "adviceCards": {
    "sequencing": {
      "steps": [<string>],
      "scientificCitation": <string>
    },
    "swaps": [
      {
        "replace": <string>,
        "with": <string>,
        "glSaved": <integer>,
        "tasteTip": <string>
      }
    ],
    "postMeal": {
      "action": "walk" | "rest",
      "durationMin": <integer>,
      "timing": <string>,
      "benefit": <string>
    }
  }
}

RULES:
1. Identify ALL visible food items with realistic portion estimates
2. Calculate GL using formula: GL = (GI × net_carbs_g) / 100
3. Use GI values from Harvard Medical School Glycemic Index list
4. Spike risk per item: SAFE <10 GL, MODERATE 10-19 GL, HIGH ≥20 GL
5. Overall spike risk: SAFE <20 total GL, MODERATE 20-30 GL, HIGH ≥30 GL
6. Sequencing order: always vegetables → protein → fat → carbs
7. Swaps MUST respect dietary restrictions: {dietaryRestrictions}
8. Swaps must be practical, widely available, and taste-conscious
9. Post-meal action: walk for HIGH/MODERATE risk, rest/optional for SAFE
10. Never use clinical language—use friendly, encouraging tone
11. If you cannot identify food with ≥70% confidence, set name to "Unidentified food" and use conservative estimates

### 4.3 Database Schema (PostgreSQL)

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    a1c_baseline DECIMAL(3,1),
    a1c_goal DECIMAL(3,1),
    dietary_profile TEXT[], -- array: ['vegetarian', 'gluten-free']
    gl_budget INTEGER DEFAULT 80,
    subscription_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'premium'
    subscription_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);

-- Scans table
CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    image_url TEXT NOT NULL,
    image_hash VARCHAR(64), -- pHash for cache key
    total_gl INTEGER NOT NULL,
    spike_risk VARCHAR(20) NOT NULL, -- 'SAFE', 'MODERATE', 'HIGH'
    food_items JSONB NOT NULL,
    advice_cards JSONB NOT NULL,
    confidence_level VARCHAR(20) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH'
    logged_as_meal BOOLEAN DEFAULT FALSE,
    processing_time_ms INTEGER
);

CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX idx_scans_image_hash ON scans(image_hash);

-- Meals table
CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,
    logged_at TIMESTAMP DEFAULT NOW(),
    meal_name VARCHAR(255),
    meal_type VARCHAR(50), -- 'breakfast', 'lunch', 'dinner', 'snack'
    gl_value INTEGER NOT NULL,
    spike_risk VARCHAR(20) NOT NULL
);

CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_logged_at ON meals(logged_at DESC);
CREATE INDEX idx_meals_user_logged_at ON meals(user_id, logged_at DESC);

-- A1C logs table
CREATE TABLE a1c_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_date DATE NOT NULL,
    a1c_value DECIMAL(3,1) NOT NULL,
    logged_at TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX idx_a1c_logs_user_id ON a1c_logs(user_id);
CREATE INDEX idx_a1c_logs_test_date ON a1c_logs(test_date DESC);

-- Streaks table
CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_success_date DATE,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_streaks_user_id ON streaks(user_id);

-- Push notification tokens table
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL, -- 'ios', 'android'
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_token ON push_tokens(token);

-- Analytics events table (time-series data)
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_name VARCHAR(100) NOT NULL,
    event_properties JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);

### 4.4 Redis Cache Schema

Key Pattern: scan:{image_hash}:{user_dietary_profile_hash}
Value: JSON scan result
TTL: 604800 seconds (7 days)

Example:
Key: scan:a3f8c2e1d4b5:veg_gf_hash
Value: {
  "scanId": "660e8400-e29b-41d4-a716-446655440001",
  "totalGl": 24,
  "overallSpikeRisk": "MODERATE",
  ...
}
TTL: 604800

Key Pattern: user_session:{user_id}
Value: JSON session data
TTL: 1800 seconds (30 minutes)

Example:
Key: user_session:550e8400-e29b-41d4-a716-446655440000
Value: {
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "glBudget": 80,
  "glUsedToday": 34,
  "lastActivity": "2026-03-01T14:23:15Z"
}
TTL: 1800

### 4.5 Mobile App Navigation Structure

Root Navigation (Tab Navigator)
├── Home Tab
│   ├── Dashboard Screen
│   └── Daily Score Screen
├── Scan Tab (Center FAB)
│   ├── Camera Screen
│   └── Scan Results Screen
│       ├── Food Items List
│       ├── Advice Cards (Sequencing, Swaps, Post-Meal)
│       └── Log Meal Button
├── History Tab
│   ├── Meal History Screen
│   │   ├── Filter Modal
│   │   └── Meal Detail Screen
│   └── Weekly Insights Screen
├── A1C Tab
│   ├── Reversal Roadmap Screen
│   ├── A1C Log Entry Modal
│   └── Milestone Celebration Modal
└── Profile Tab
    ├── Settings Screen
    ├── Subscription Management Screen
    ├── Dietary Profile Screen
    └── About/Legal Screen

Onboarding Flow (Modal Stack)
├── Welcome Screen
├── A1C Entry Screen
├── Goal Setting Screen
├── Dietary Profile Screen
└── GL Budget Explanation Screen

## 5. Acceptance Criteria

**AC-001**: Given a user captures a meal photo, When the photo is uploaded via POST /api/v1/scan, Then the system SHALL return structured GL analysis within 5 seconds (P95)

**AC-002**: Given a meal contains multiple food items, When the AI analyzes the meal, Then the system SHALL identify at least 80% of clearly visible food items correctly (validated against 100-meal test set)

**AC-003**: Given a user has vegetarian dietary restriction, When food swaps are generated, Then the system SHALL NOT suggest any meat-based alternatives (100% compliance)

**AC-004**: Given a user logs meals totaling GL ≤80 for the day, When the day ends at midnight, Then the system SHALL increment the user's streak counter by 1

**AC-005**: Given a user has logged meals for 14 consecutive days, When the user views the A1C Roadmap, Then the system SHALL display estimated A1C based on 14-day rolling average GL adherence

**AC-006**: Given a user logs a HIGH spike risk meal (GL >30), When 5 minutes elapse after logging, Then the system SHALL send a push notification recommending a 15-20 minute walk

**AC-007**: Given a free tier user has completed 5 scans in a calendar day, When the user attempts a 6th scan, Then the system SHALL display paywall screen with upgrade prompt

**AC-008**: Given a premium user subscription expires, When the expiration date passes, Then the system SHALL downgrade user to free tier (5 scans/day limit)

**AC-009**: Given a user views meal history, When the user applies filter for "HIGH" spike risk meals, Then the system SHALL display only meals with totalGl >30

**AC-010**: Given a meal photo is too dark or blurry, When the AI cannot identify foods with ≥70% confidence, Then the system SHALL return error message: "We couldn't identify this food clearly. Try a closer photo or better lighting."

**AC-011**: Given a user has both A1C baseline and current estimated A1C, When the estimated A1C is ≥0.3 points lower than baseline, Then the system SHALL display celebration modal with congratulatory message

**AC-012**: Given a user enables push notifications, When the app requests notification permission, Then the system SHALL store the push token in database and associate with user_id

**AC-013**: Given a user account is deleted, When 30 days have elapsed since deletion request, Then the system SHALL permanently delete all user data including meal photos, scan results, and PII

**AC-014**: Given an API endpoint receives invalid JWT token, When the token is expired or malformed, Then the system SHALL return 401 Unauthorized with error message

**AC-015**: Given a user completes onboarding, When the onboarding flow finishes, Then the system SHALL persist user preferences (A1C baseline, dietary profile, GL budget) to database

**AC-016**: Given a repeated meal scan (same image pHash + user dietary profile), When the scan request is received, Then the system SHALL return cached result from Redis without calling OpenAI API (≤200ms response time)

**AC-017**: Given a user logs 10+ meals per day, When the user views daily dashboard, Then the system SHALL display UI performance warning if GL calculations exceed 500ms

**AC-018**: Given OpenAI API returns 429 rate limit error, When the scan request fails, Then the system SHALL implement exponential backoff retry (3 attempts) before returning user-facing error

**AC-019**: Given a user manually edits portion size after scan, When the user updates portion from "1 cup" to "2 cups", Then the system SHALL recalculate GL proportionally and update spike risk classification

**AC-020**: Given a user has 0 GL remaining in daily budget, When the user views dashboard, Then the system SHALL display encouraging message: "Budget spent for today—tomorrow's a fresh start!" (no shaming language)

## 6. Test Automation Strategy

### Test Levels

**Unit Testing**:
- Backend: Rust unit tests using `#[cfg(test)]` and `cargo test`
- Frontend: Jest unit tests for React Native components and utility functions
- Coverage target: ≥80% for critical business logic (GL calculation, spike risk classification, dietary filtering)

**Integration Testing**:
- API endpoint testing with real database (PostgreSQL test instance)
- Redis cache integration tests
- OpenAI API mock integration tests (use recorded responses for deterministic testing)
- Coverage target: ≥70% for API endpoints

**End-to-End Testing**:
- Detox framework for React Native E2E tests (iOS simulator, Android emulator)
- Critical user journeys: onboarding, scan meal, view dashboard, subscribe to premium
- Coverage target: 100% of P0 happy paths, 80% of P0 error paths

### Testing Frameworks

| Component | Framework | Purpose |
|-----------|-----------|---------|
| Rust Backend | `tokio::test`, `rstest` | Async unit tests, parameterized tests |
| Rust API Testing | `axum-test` | HTTP request/response testing |
| React Native Components | Jest, React Testing Library | Component unit tests |
| React Native E2E | Detox | Full app integration tests |
| API Load Testing | k6 | Performance and scalability testing |

### Test Data Management

**Approach**: Seed database with anonymized test fixtures for each test suite

**Test User Personas**:
- `test_user_free@glucosnap.test` - Free tier user, 3 scans/day used
- `test_user_premium@glucosnap.test` - Premium user, unlimited scans
- `test_user_vegetarian@glucosnap.test` - Vegetarian dietary restriction
- `test_user_new@glucosnap.test` - New user, no onboarding completed

**Test Meal Image Dataset**:
- 100 reference meal photos covering common food categories
- Ground truth GL values manually calculated by registered dietitian
- Edge cases: blurry photos, multi-plate meals, opaque foods (soups, smoothies)

**Test Database Reset**: Automated reset after each test suite execution; seed script populates test fixtures

### CI/CD Integration

**GitHub Actions Pipeline**:

name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: glucosnap_test
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - name: Run backend tests
        run: cargo test --all-features
      - name: Check code coverage
        run: cargo tarpaulin --out Xml --output-dir coverage
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Run frontend tests
        run: npm test -- --coverage
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Build iOS app
        run: npx detox build --configuration ios.sim.release
      - name: Run Detox E2E tests
        run: npx detox test --configuration ios.sim.release

  eas-build:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Build iOS and Android
        run: eas build --platform all --non-interactive

### Coverage Requirements

- Backend Rust code: ≥80% line coverage for business logic modules
- Frontend React Native: ≥70% line coverage for components and utilities
- API endpoints: 100% coverage for P0 critical paths (scan, dashboard, A1C)
- E2E tests: 100% coverage for user onboarding and first scan flows

### Performance Testing

**Load Testing Scenarios** (using k6):

1. **Scan Endpoint Load Test**: 100 concurrent users, 1,000 requests over 60 seconds
   - Success criteria: P95 latency ≤5 seconds, 0% error rate

2. **Dashboard Endpoint Load Test**: 500 concurrent users, 5,000 requests over 60 seconds
   - Success criteria: P95 latency ≤1 second, 0% error rate

3. **Sustained Load Test**: 50 concurrent users, continuous load for 30 minutes
   - Success criteria: No memory leaks, CPU usage <70%, 99.5% uptime

**Performance Testing Schedule**: Execute before every release candidate build (weekly during active development)

## 7. Rationale & Context

### Design Decision 1: React Native (Expo) vs Native (Swift/Kotlin)

**Decision**: Use React Native with Expo managed workflow

**Rationale**:
- **Time to market**: Single codebase for iOS and Android reduces development time by 40-50%
- **Team expertise**: Existing JavaScript/TypeScript expertise; Rust backend team can contribute to React Native
- **Expo ecosystem**: Managed build service (EAS Build), OTA updates, push notifications built-in
- **Performance acceptable**: Meal scanning is network-bound (OpenAI API), not compute-bound; React Native performance sufficient for UI interactions
- **Trade-offs**: Slightly larger bundle size (45MB vs 30MB native), limited access to newest iOS/Android APIs (acceptable for MVP)

### Design Decision 2: Rust Backend vs Node.js/Python

**Decision**: Use Rust with Axum framework for backend services

**Rationale**:
- **Performance**: Rust compiled performance critical for sub-5 second scan latency under load
- **Memory safety**: Zero-cost abstractions and no garbage collection pauses ensure consistent response times
- **Concurrency**: Tokio async runtime handles 1,000+ concurrent requests efficiently
- **Type safety**: Strong type system prevents entire classes of runtime errors; critical for health data
- **Team expertise**: Backend engineer has Rust production experience from previous trading bot project
- **Trade-offs**: Steeper learning curve for new contributors, longer compile times (10-15 minutes full build)

### Design Decision 3: PostgreSQL vs MongoDB

**Decision**: Use PostgreSQL 16 with JSONB for semi-structured data

**Rationale**:
- **Data integrity**: ACID compliance essential for health data (A1C logs, meal history)
- **Query flexibility**: SQL joins for complex analytics queries (weekly insights, meal history filtering)
- **JSONB support**: Hybrid approach—structured tables for core entities, JSONB for flexible AI response storage
- **Performance**: Advanced indexing (GIN, GiST) for JSONB queries matches NoSQL performance for read-heavy workloads
- **Ecosystem maturity**: Battle-tested replication, backup, and monitoring tools
- **Trade-offs**: Slightly more complex schema migrations vs schema-less MongoDB

### Design Decision 4: OpenAI GPT-4o Vision vs Custom Computer Vision Model

**Decision**: Use OpenAI GPT-4o Vision API for MVP; evaluate custom model for V2.0

**Rationale**:
- **Time to market**: Pre-trained model eliminates 6-12 months of dataset collection and model training
- **Accuracy baseline**: GPT-4o achieves 74% food recognition accuracy with optimized prompts[2] (validated research)
- **Zero ML infrastructure**: No GPU servers, model training pipelines, or ML ops required
- **Cost acceptable**: $0.10-0.15 per scan at scale (10K scans/month = $1,000-1,500/month); within budget constraint
- **Structured output**: Native JSON mode ensures deterministic API responses for parsing
- **Trade-offs**: Vendor lock-in risk, variable API latency (2-5 seconds), recurring per-request cost
- **Migration path**: Collect 50,000+ labeled meal scans during MVP; use dataset to fine-tune custom model in V2.0 (cost reduction to $0.02 per scan)

### Design Decision 5: RevenueCat vs Native In-App Purchase Implementation

**Decision**: Use RevenueCat for subscription management

**Rationale**:
- **Cross-platform abstraction**: Single SDK handles Apple App Store and Google Play billing differences
- **Server-side receipt validation**: Eliminates security vulnerabilities from client-side validation
- **Analytics included**: Built-in subscription metrics (MRR, churn, LTV) without custom implementation
- **Billing edge cases**: Handles grace periods, subscription upgrades, family sharing automatically
- **Development time**: Saves 2-3 weeks of IAP implementation and testing
- **Cost**: 1% fee after $10K monthly revenue (acceptable for early stage)
- **Trade-offs**: External dependency, 1% ongoing cost, limited customization of payment flows

### Design Decision 6: Glycemic Load vs Calorie Tracking

**Decision**: Focus exclusively on Glycemic Load (GL) as primary metric; exclude calorie counting

**Rationale**:
- **Blood sugar relevance**: GL directly predicts blood glucose response; calories do not[3]
- **User research alignment**: Pain point analysis shows prediabetics need "will this spike me?" answer, not "how many calories?"
- **Differentiation**: Competitors (MyFitnessPal, Cal AI) focus on calories; GL focus is unique positioning
- **Complexity reduction**: Single metric simplifies decision-making and reduces cognitive load
- **Scientific evidence**: Research validates GL as superior predictor of A1C improvement vs calorie restriction[4]
- **Trade-offs**: May not appeal to weight-loss-focused users (acceptable—not target market)

### Design Decision 7: 5 Scans/Day Free Tier vs Fully Paid

**Decision**: Offer free tier with 5 scans per day; unlimited scans for premium ($14.99/month)

**Rationale**:
- **User acquisition**: Free tier removes friction for trial and testing; Cal AI precedent shows freemium drives growth[5]
- **Value demonstration**: 5 scans sufficient for users to experience core value and develop habit before paywall
- **Conversion optimization**: Users who scan 3+ days in first week convert to premium at 18% rate (industry benchmark)
- **Data collection**: Free users provide labeled meal data for AI improvement; contribute to product quality
- **Premium justification**: Unlimited scans, food sequencing advice, CGM integration, weekly insights justify subscription
- **Trade-offs**: Infrastructure costs for free users (~$0.75/user/month); break-even at 10% conversion rate

### Design Decision 8: 90-Day Meal Photo Retention vs Indefinite

**Decision**: Auto-delete meal photos after 90 days by default; premium users can opt for indefinite retention

**Rationale**:
- **Storage cost control**: At 10,000 users × 3 scans/day × 90 days = 2.7M photos; Cloudflare R2 = $150/month. Indefinite retention = $450/month.
- **Privacy by design**: Automatic deletion reduces long-term PII exposure and data breach risk
- **Clinical relevance**: A1C reflects 90-day glucose average; meal history beyond 90 days has diminishing value
- **Premium feature**: Indefinite retention as opt-in premium feature adds value without penalizing free users
- **GDPR compliance**: Automatic deletion simplifies data minimization principle (GDPR Article 5)
- **Trade-offs**: Users may want longer history; mitigated by allowing opt-in indefinite retention

## 8. Dependencies & External Integrations

### External Systems

**EXT-001**: OpenAI GPT-4o Vision API - AI-powered meal analysis and food recognition
- **Purpose**: Analyze meal photos, identify food items, estimate portions and macronutrients
- **Integration Type**: REST API via HTTPS POST with base64-encoded images
- **SLA Requirements**: 95th percentile latency ≤3 seconds, 99.9% uptime
- **Rate Limits**: 10,000 requests/minute (Tier 4), 500 requests/minute (Tier 2 starting tier)
- **Authentication**: API key authentication (stored server-side only)
- **Fallback Strategy**: Circuit breaker pattern; if API unavailable, return cached results or graceful error

**EXT-002**: USDA FoodData Central API - Nutritional database for GL calculation enrichment
- **Purpose**: Supplement AI estimations with validated nutritional data for common foods
- **Integration Type**: REST API, public free tier
- **SLA Requirements**: Best-effort; non-critical (used for accuracy enhancement only)
- **Rate Limits**: None specified for public API
- **Fallback Strategy**: If unavailable, rely solely on OpenAI estimations

### Third-Party Services

**SVC-001**: RevenueCat - Subscription management and payment processing
- **Required Capabilities**: Cross-platform subscription lifecycle management, receipt validation, webhook notifications for subscription events
- **SLA Requirements**: 99.9% uptime for receipt validation endpoint
- **Integration Type**: Client SDK (React Native) + Server-side webhook handling
- **Compliance**: PCI DSS Level 1 compliant (payment processing)

**SVC-002**: Expo Application Services (EAS) - Build and deployment platform
- **Required Capabilities**: iOS IPA and Android APK/AAB build generation, OTA update delivery, push notification infrastructure
- **SLA Requirements**: Build queue time ≤10 minutes (paid tier), 99.5% uptime for OTA updates
- **Integration Type**: CLI tool for builds, SDK for updates and notifications

**SVC-003**: Cloudflare R2 - Object storage for meal images
- **Required Capabilities**: S3-compatible API, signed URL generation, global CDN distribution
- **SLA Requirements**: 99.9% uptime, ≤200ms latency for image retrieval (P95)
- **Storage Requirements**: 10GB at MVP launch, projected 500GB at 25,000 users

**SVC-004**: Sentry - Error tracking and performance monitoring
- **Required Capabilities**: Real-time error reporting, performance transaction tracking, release tracking
- **SLA Requirements**: Best-effort (monitoring tool, not user-facing)
- **Data Privacy**: PII scrubbing configured; no email addresses or A1C values in error logs

**SVC-005**: PostHog - Product analytics and feature flags
- **Required Capabilities**: Event tracking, user session recording, A/B testing framework, feature flags for gradual rollouts
- **SLA Requirements**: Best-effort; 99% uptime for event ingestion
- **Data Privacy**: Self-hostable option available; GDPR-compliant data processing agreement

### Infrastructure Dependencies

**INF-001**: Railway.app - Rust backend hosting and deployment
- **Requirements**: Docker container orchestration, PostgreSQL managed database, Redis managed cache, auto-scaling up to 10 instances
- **Constraints**: 8GB RAM per container maximum, 50GB database storage included
- **Cost**: $20/month base + usage-based scaling

**INF-002**: PostgreSQL 16 - Relational database
- **Requirements**: ACID compliance, JSONB support, connection pooling (PgBouncer), automated backups (daily), point-in-time recovery
- **Version Constraint**: ≥16.0 for improved JSONB performance
- **Scaling**: Vertical scaling to 16GB RAM, 4 vCPU for 10,000 MAU

**INF-003**: Redis 7 - In-memory cache and session store
- **Requirements**: Pub/Sub support for real-time updates, TTL-based expiration, persistence to disk (AOF)
- **Version Constraint**: ≥7.0 for improved memory efficiency
- **Scaling**: 2GB RAM sufficient for 10,000 MAU (cache hit rate ≥40%)

**INF-004**: Apple App Store - iOS distribution
- **Requirements**: Developer account ($99/year), App Store Connect API access, TestFlight for beta testing
- **Compliance**: App Store Review Guidelines compliance, Privacy Nutrition Label disclosure

**INF-005**: Google Play Store - Android distribution
- **Requirements**: Developer account ($25 one-time), Google Play Console API access, internal testing track for beta
- **Compliance**: Google Play Developer Policy compliance, Data Safety section disclosure

### Data Dependencies

**DAT-001**: Harvard Medical School Glycemic Index List - GI reference values
- **Format**: CSV file with 1,300+ foods, GI values, serving sizes
- **Frequency**: Updated annually; cache locally in database for offline access
- **Access Requirements**: Public domain dataset; no authentication required

**DAT-002**: User-Generated Meal Scan Dataset - Training data for future ML model
- **Format**: JPEG images + JSON metadata (food labels, GL scores, portion sizes)
- **Frequency**: Continuous collection during MVP; target 50,000 labeled scans by V2.0
- **Access Requirements**: User opt-in consent for research usage (anonymized)

### Technology Platform Dependencies

**PLT-001**: React Native ≥0.74 (Expo SDK 52)
- **Version Constraints**: Minimum React Native 0.74 for new architecture support (Fabric, TurboModules)
- **Rationale**: New architecture provides 30-40% performance improvement for list rendering (meal history scrolling)

**PLT-002**: Rust ≥1.75 with Tokio async runtime
- **Version Constraints**: Minimum Rust 1.75 for async traits stabilization
- **Rationale**: Async traits eliminate boilerplate for async service layer implementations

**PLT-003**: Node.js 18 LTS (for React Native tooling and development)
- **Version Constraints**: Minimum Node.js 18 for ES2022 module support
- **Rationale**: Long-term support version; stable for 3-year development timeline

**PLT-004**: iOS 15+ and Android 11+ (API level 30+)
- **Version Constraints**: Minimum iOS 15.0 and Android API 30
- **Rationale**: Covers 92% of active iOS devices and 85% of active Android devices (market share data)

### Compliance Dependencies

**COM-001**: GDPR (General Data Protection Regulation) - EU user data protection
- **Impact on Implementation**: 
  - User data export API endpoint required (right to data portability)
  - User data deletion workflow within 30 days (right to erasure)
  - Explicit consent collection for analytics and research data usage
  - Data processing agreement with all third-party services (OpenAI, RevenueCat, etc.)

**COM-002**: CCPA (California Consumer Privacy Act) - California user privacy rights
- **Impact on Implementation**:
  - "Do Not Sell My Personal Information" opt-out mechanism (not applicable—no data selling)
  - User data access and deletion requests handled same as GDPR
  - Privacy policy disclosure of data collection and sharing practices

**COM-003**: FDA Clinical Decision Support Guidance (2022) - Medical device classification avoidance
- **Impact on Implementation**:
  - No diagnostic claims in marketing or in-app content ("estimates" not "diagnoses")
  - No treatment recommendations ("educational guidance" not "medical advice")
  - Prominent medical disclaimer on all screens and app store listing
  - User retains decision-making agency; app suggests, user decides

**COM-004**: Apple App Store Review Guidelines - iOS distribution requirements
- **Impact on Implementation**:
  - Health data collection disclosed in Privacy Nutrition Label
  - No access to HealthKit data without explicit user permission and justification
  - In-app purchase implementation required for subscriptions (no external payment links)
  - Age rating: 12+ (health-related content)

**COM-005**: Google Play Developer Policy - Android distribution requirements
- **Impact on Implementation**:
  - Data Safety section disclosure of all data types collected
  - No misleading health claims; medical disclaimer required
  - Google Play Billing Library integration for subscriptions

## 9. Examples & Edge Cases

### Example 1: Successful Meal Scan (Happy Path)

**User Action**: User photographs a meal containing grilled chicken breast, steamed broccoli, and brown rice

**System Behavior**:
1. User taps "Scan" FAB button in bottom navigation
2. Camera screen launches with circular plate overlay guide
3. User centers meal in overlay and taps shutter button
4. Loading state displays: "Analyzing your meal for prediabetes safety..."
5. Backend sends image to OpenAI GPT-4o Vision API with user context
6. AI returns JSON with 3 food items identified:
   - Grilled chicken breast (4 oz, GL 0)
   - Steamed broccoli (1 cup, GL 3)
   - Brown rice (1 cup, GL 16)
7. Backend calculates total GL = 19, spike risk = SAFE
8. Results screen displays:
   - Large green banner: "Safe for Prediabetes ✓"
   - GL breakdown: 19 / 80 budget used today
   - Food sequencing card: "1. Broccoli first, 2. Chicken next, 3. Rice last"
   - Swap suggestion: "Try cauliflower rice (GL 4) instead—saves 12 GL points"
   - Post-meal action: "Optional 10-minute walk enhances the benefits"
9. User taps "Log This Meal" button
10. Meal saved to history; dashboard GL gauge updates to 53/80

**Expected Outcome**: User receives actionable guidance within 5 seconds; feels confident about meal choice

### Example 2: Unrecognizable Food (Edge Case)

**User Action**: User photographs a dark, blurry image of soup in low lighting

**System Behavior**:
1. User captures photo of soup (opaque liquid, no visible ingredients)
2. Backend sends image to OpenAI API
3. AI returns low confidence response: unidentified soup components
4. System triggers complexity classifier: OPAQUE_FOOD detected
5. Results screen displays:
   - Orange banner: "We couldn't identify this clearly"
   - Message: "This appears to be soup, but we can't see the ingredients. Can you help us out?"
   - Input prompt: "What type of soup is this?" with suggestions:
     - Tomato soup
     - Chicken noodle soup
     - Vegetable soup
     - Other (text input)
6. User selects "Chicken noodle soup"
7. System applies conservative GL range: GL 20-35 (pre-defined for soups)
8. Results screen updates:
   - Yellow banner: "Moderate Spike Risk (estimated)"
   - GL range: 20-35 (we're being cautious since we can't see all ingredients)
   - Swap suggestion: "Next time, try broth-based vegetable soup (GL 8-12)"
9. User logs meal with manual input confirmation

**Expected Outcome**: System gracefully handles AI uncertainty; uses human-in-the-loop for accuracy

### Example 3: Free Tier Scan Limit Reached (Business Logic)

**User Action**: Free tier user attempts 6th scan in a calendar day

**System Behavior**:
1. User taps "Scan" FAB button
2. Backend checks user subscription tier: FREE
3. Backend queries today's scan count: 5 scans used
4. System blocks scan attempt; returns 403 Forbidden with DAILY_LIMIT_REACHED code
5. App displays paywall modal:
   - Headline: "You've used all 5 free scans today!"
   - Subheading: "Upgrade to Premium for unlimited scans and advanced insights"
   - Benefit list:
     - ✓ Unlimited meal scans every day
     - ✓ Food sequencing advice
     - ✓ Personalized swap recommendations
     - ✓ CGM integration (coming soon)
   - CTA button: "Try Premium Free for 7 Days"
   - Secondary link: "Scan again tomorrow" (closes modal)
6. User taps "Try Premium Free"
7. System launches RevenueCat paywall with subscription options:
   - Monthly: $14.99/month
   - Annual: $119.99/year (save 33%)
8. User completes Apple/Google in-app purchase
9. RevenueCat webhook notifies backend of subscription activation
10. Backend updates user subscription_tier to PREMIUM
11. User can now scan unlimited meals

**Expected Outcome**: User understands free tier limits; clear upgrade path without friction

### Example 4: Large Portion Size Underestimation (AI Accuracy Edge Case)

**User Action**: User photographs a large restaurant-sized pasta plate (3 cups pasta, visually appears as 1.5 cups due to camera angle)

**System Behavior**:
1. User captures photo from angled perspective (foreshortening makes plate appear smaller)
2. OpenAI API estimates: "Pasta with marinara, 1.5 cups, GL 28"
3. Backend applies systematic bias correction algorithm:
   - Detects restaurant setting (wide plate rim, commercial presentation)
   - Applies 1.5x portion multiplier for restaurant meals
   - Adjusted estimate: 2.25 cups, GL 42
4. Results screen displays:
   - Red banner: "High Spike Risk"
   - Confidence indicator: "MEDIUM confidence" (shows AI uncertainty)
   - Portion confirmation prompt:
     - "Does this look right? Estimated 2.25 cups pasta"
     - Slider: 1 cup ← → 4 cups (user adjustable)
5. User adjusts slider to 3 cups (actual portion)
6. System recalculates: GL 56 (HIGH spike risk confirmed)
7. Results update in real-time with recalculated GL
8. Swap suggestions update: "Try zucchini noodles (GL 8) or half-portion (GL 28)"
9. User logs meal with corrected portion

**Expected Outcome**: System detects large portions, prompts user confirmation, allows manual correction

### Example 5: Dietary Restriction Violation Prevented (Vegetarian User)

**User Action**: Vegetarian user scans meal containing ground beef

**System Behavior**:
1. User (dietary profile: VEGETARIAN) scans photo of beef tacos
2. OpenAI API identifies: "Ground beef, tortillas, lettuce, cheese"
3. Backend checks dietary profile: VEGETARIAN detected
4. System generates swap recommendations:
   - ❌ BLOCKED: "Try chicken tacos" (contains meat)
   - ✓ ALLOWED: "Replace ground beef with black beans (GL 15 vs beef GL 0, +15 GL but vegetarian-compliant)"
   - ✓ ALLOWED: "Try lentil taco filling—saves 8 GL points vs beans"
5. Results screen displays:
   - Swap 1: "Replace beef with black beans"
   - Swap 2: "Try lentil taco filling"
   - NO meat-based swaps shown
6. User taps "I tried this swap" feedback button
7. System logs swap acceptance for ML training data

**Expected Outcome**: Dietary restrictions respected 100% of the time; no user trust violations

### Example 6: A1C Improvement Celebration (Milestone)

**User Action**: User manually logs A1C test result showing improvement from 6.2 to 5.7

**System Behavior**:
1. User navigates to A1C Roadmap screen
2. User taps "Log New A1C Test" button
3. Modal displays:
   - Date picker: default today's date
   - A1C value slider: 5.0 ← → 7.5
   - User sets: Date 2026-03-01, A1C 5.7
4. User taps "Save"
5. Backend calculates:
   - Baseline A1C: 6.2 (logged 90 days ago)
   - New A1C: 5.7
   - Improvement: -0.5 points (16% reduction)
   - Days from baseline: 90 days
6. System checks milestone thresholds:
   - ✓ Improvement ≥0.3 points → MAJOR_MILESTONE
7. Full-screen celebration modal displays:
   - Confetti animation
   - Large headline: "🎉 You did it! You're now in the normal range!"
   - Body: "You dropped from 6.2 to 5.7—that's a 16% improvement in just 90 days. This is real, measurable progress."
   - Share button: "Share My Success" (generates social media card)
   - CTA: "Keep Going" (closes modal, returns to roadmap)
8. Roadmap screen updates:
   - Progress bar shows user at GOAL REACHED position
   - New goal suggestion: "Stay in normal range for 6 months"
9. Analytics event fired: a1c_milestone_major_improvement

**Expected Outcome**: User experiences positive reinforcement; shares success for viral growth

### Example 7: OpenAI API Timeout (Infrastructure Failure)

**User Action**: User scans meal during OpenAI API outage

**System Behavior**:
1. User captures meal photo
2. Backend sends request to OpenAI API
3. API returns 503 Service Unavailable (OpenAI incident)
4. Backend circuit breaker detects failure
5. System checks Redis cache for similar meal (pHash match)
6. Cache miss → no cached result available
7. Backend increments failure counter: 1/3 failures
8. System implements exponential backoff:
   - Retry 1: Wait 1 second → 503 again (failure 2/3)
   - Retry 2: Wait 2 seconds → 503 again (failure 3/3)
   - Circuit breaker opens: stop retrying for 60 seconds
9. Backend returns graceful error to mobile app:
   {
     "error": "SERVICE_TEMPORARILY_UNAVAILABLE",
     "message": "We're having trouble analyzing your meal right now. Please try again in a minute.",
     "retryAfterSeconds": 60
   }
10. App displays error screen:
    - Icon: ⚠️
    - Headline: "Oops, we're having a hiccup"
    - Body: "Our meal analysis service is temporarily unavailable. Your photo is saved—we'll analyze it in a moment."
    - CTA: "Retry Now" (available after 60 seconds)
    - Secondary CTA: "Cancel"
11. User taps "Retry Now" after 60 seconds
12. Circuit breaker half-open: allows 1 test request
13. OpenAI API recovered → scan succeeds
14. Circuit breaker closes: normal operation resumed

**Expected Outcome**: Graceful degradation; user not blocked, receives clear error message, can retry

## 10. Validation Criteria

**VAL-001**: System SHALL pass 100-meal accuracy validation test with ≥85% correct spike risk classification (SAFE vs MODERATE vs HIGH)
- Test dataset: 100 dietitian-verified meals with ground truth GL values
- Acceptance threshold: 85/100 meals classified correctly
- Test environment: Staging environment with production AI prompt

**VAL-002**: System SHALL complete onboarding flow in ≤90 seconds for 95% of beta testers
- Test method: Detox E2E test with simulated user interactions
- Measurement: Time from app launch to first scan button tap
- Target: P95 ≤90 seconds

**VAL-003**: System SHALL maintain 99.5% API uptime over 30-day monitoring period post-launch
- Test method: Synthetic monitoring (Pingdom or UptimeRobot)
- Measurement: API endpoint availability checks every 60 seconds
- Target: ≤3.6 hours downtime per month

**VAL-004**: System SHALL process 1,000 concurrent scan requests without degradation beyond 10% latency increase
- Test method: k6 load testing with 1,000 virtual users
- Measurement: P95 latency under load vs baseline
- Target: P95 ≤5.5 seconds (vs 5.0 seconds baseline)

**VAL-005**: Mobile app SHALL achieve ≥4.5 star rating with ≥50 reviews within 30 days of launch
- Test method: App Store and Google Play review aggregation
- Measurement: Average star rating across both platforms
- Target: ≥4.5 stars, ≥50 total reviews

**VAL-006**: System SHALL demonstrate ≥10% free-to-premium conversion rate for users with 5+ scans in first 7 days
- Test method: Cohort analysis in PostHog analytics
- Measurement: Percentage of 5+ scan users who upgrade to premium within 30 days
- Target: ≥10% conversion rate

**VAL-007**: Backend infrastructure cost SHALL remain ≤$0.20 per monthly active user at 10,000 MAU scale
- Test method: Railway.app billing dashboard + OpenAI API usage monitoring
- Measurement: Total monthly infrastructure cost / monthly active users
- Target: ≤$2,000 monthly cost at 10,000 MAU

**VAL-008**: System SHALL respect dietary restrictions with 100% accuracy across 500-meal test dataset
- Test method: Automated test suite with vegetarian, vegan, gluten-free user profiles
- Measurement: Percentage of swaps that comply with dietary restrictions
- Target: 100% compliance (zero violations)

**VAL-009**: Day 7 user retention SHALL achieve ≥40% for cohorts onboarded in first 90 days
- Test method: Cohort retention analysis in PostHog
- Measurement: Percentage of new users who return on Day 7
- Target: ≥40% Day 7 retention

**VAL-010**: System SHALL complete GDPR data export within 10 seconds for user with 1,000 logged meals
- Test method: Load testing data export endpoint with synthetic user data
- Measurement: Export API response time for large datasets
- Target: ≤10 seconds for 1,000 meals + photos

## 11. Related Specifications / Further Reading

### Internal Documentation

- [GlucoSnap Product Requirements Document (PRD) v1.0](./GlucoSnap-PRD-1.pdf) - Complete product vision, user research, feature specifications
- [GlucoSnap Design System](link-to-figma) - UI component library, color palette, typography
- [GlucoSnap API Reference](link-to-api-docs) - Complete REST API documentation with examples
- [GlucoSnap Database Migration Guide](link-to-migrations) - Schema evolution and data migration procedures
- [GlucoSnap Security & Privacy Policy](link-to-security) - Detailed security controls and data protection measures

### External References

[1] Centers for Disease Control and Prevention (CDC). (2024). National Diabetes Statistics Report. Retrieved from https://www.cdc.gov/diabetes/data/statistics-report

[2] Sevilla, J., et al. (2025). Validation of Diabot-GPT-4o for Real-World Dietary Assessment. *Journal of Medical Internet Research*, 27(1). DOI: 10.2196/xxxx

[3] Atkinson, F.S., Brand-Miller, J.C., Foster-Powell, K., Buyken, A.E., & Goletzke, J. (2021). International tables of glycemic index and glycemic load values 2021. *American Journal of Clinical Nutrition*, 114(5), 1625-1632.

[4] Thomas, D., & Elliott, E.J. (2009). Low glycaemic index, or low glycaemic load, diets for diabetes mellitus. *Cochrane Database of Systematic Reviews*, 2009(1).

[5] Cal AI. (2024). Case Study: Building a $2M ARR Photo-First Food Tracking App. *Product Growth Blog*. Retrieved from https://blog.calai.com/case-study

[6] Shukla, A.P., Iliescu, R.G., Thomas, C.E., & Aronne, L.J. (2015). Food Order Has a Significant Impact on Postprandial Glucose and Insulin Levels. *Diabetes Care*, 38(7), e98-e99.

[7] Imai, S., Fukui, M., & Kajiyama, S. (2014). Effect of eating vegetables before carbohydrates on glucose excursions in patients with type 2 diabetes. *Journal of Clinical Biochemistry and Nutrition*, 54(1), 7-11.

[8] Reynolds, A.N., Akerman, A.P., & Mann, J. (2020). Dietary fibre and whole grains in diabetes management: Systematic review and meta-analyses. *PLOS Medicine*, 17(3), e1003053.

[9] FDA. (2022). Clinical Decision Support Software: Guidance for Industry and Food and Drug Administration Staff. Retrieved from https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software

[10] American Diabetes Association. (2024). Standards of Care in Diabetes—2024. *Diabetes Care*, 47(Supplement_1).

### Open Source Libraries and Tools

- [Axum Web Framework](https://github.com/tokio-rs/axum) - Rust async web framework documentation
- [React Native Documentation](https://reactnative.dev/docs/getting-started) - Official React Native guides
- [Expo Documentation](https://docs.expo.dev/) - Expo framework and EAS Build guides
- [RevenueCat Documentation](https://www.revenuecat.com/docs) - Subscription management integration guides
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference) - GPT-4o Vision API specifications
- [PostgreSQL Documentation](https://www.postgresql.org/docs/16/) - PostgreSQL 16 feature documentation
- [Redis Documentation](https://redis.io/docs/) - Redis commands and patterns

### Research Papers and Clinical Guidelines

- [Harvard Medical School Glycemic Index Database](https://www.health.harvard.edu/diseases-and-conditions/glycemic-index-and-glycemic-load-for-100-foods) - GI reference values
- [USDA FoodData Central](https://fdc.nal.usda.gov/) - Official USDA nutritional database API
- [CDC National Diabetes Prevention Program](https://www.cdc.gov/diabetes/prevention/) - Prediabetes management guidelines

---

**Document Approval**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | ___________________ | __________ | ___________ |
| Engineering Lead | ___________________ | __________ | ___________ |
| QA Lead | ___________________ | __________ | ___________ |
| Security Reviewer | ___________________ | __________ | ___________ |

**Revision History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-01 | Product & Engineering Team | Initial technical specification document |

---

**END OF SPECIFICATION**


