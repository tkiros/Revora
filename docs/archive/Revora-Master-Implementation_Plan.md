# GlucoSnap Master Implementation Plan v1.1

**Document:** GlucoSnap Master Implementation Plan v1.1  
**Date:** 2026-03-07  
**Phase:** Pre-development  
**Status:** ACTIVE  
**Owner:** Founder/PM  
**Next review:** 2026-03-13  
**Changes from v1.0:** Corrected annual pricing to $99.99, added Product/Design domain coordination

---

## EXECUTIVE SUMMARY

This is the **single source of truth** for daily execution. Every team member reads this document daily. Maximum length: 5 pages. Domain-specific details live in domain plans (Backend, Frontend, AI/ML, Security/Compliance, DevOps, Monetization, Product/Design).

**Team Configuration:**
- **Team Size:** 2 people (Person A: Backend/AI/DevOps, Person B: Frontend/UX)
- **Working Hours:** 8 focused hours/day
- **Sprint Length:** 1 week
- **Buffer:** 15% added to all estimates
- **Timeline:** 15 weeks to App Store submission (per PRD §12.1)

**Critical Constraint:** Person A cannot work on backend AND frontend simultaneously. Cross-domain dependencies must be explicitly sequenced.

**Pricing (Locked Week 1 — BLK-009):** $12.99/month, $99.99/year, $249.99 lifetime

---

## SECTION 1: ONE-PAGE TIMELINE

| Week | Phase | Person A (Backend/DevOps/AI) | Person B (Frontend/UX) | Shared / Blocked | Gate / Milestone |
|------|-------|------------------------------|------------------------|------------------|------------------|
| 1    | P0    | Rust/Axum scaffold + PostgreSQL schema + auth setup + Redis | Expo SDK 52 init + TypeScript config + Zustand setup + **Design system definition** (tokens, colors, typography) | OpenAI DPA execution (BLOCKER) + **Pricing locked: $12.99/$99.99/$249.99** | ✓ |
| 2    | P0    | OpenAI integration + master prompt + safety floors + complexity classifier | **SPIKE:** Expo camera overlay test (2-day timebox) + **Figma mockups complete** (8 screens, light/dark mode) | **GATE:** Camera overlay viable? Bare vs Managed workflow decision | **GO/NO-GO: Camera Architecture** |
| 3    | P1    | Scan API scaffold + pHash caching + image upload + R2 integration | Onboarding flow (6 screens) + auth screens + age gate + GDPR consent + **Component library start** (button, card) | API field naming locked (camelCase) | ✓ |
| 4    | P1    | Scan pipeline (classifier → GPT-4o → safety floor → confidence scoring) | Camera screen + plate overlay + scan mode toggle + **Component library complete** (input, badge) | Conservative bias + GL range logic | ✓ |
| 5    | P1    | Food sequencing logic + swap generation + dietary restriction filtering | Scan results UI + GL banner + food breakdown + editable portions + **Onboarding design QA** | Scan API response schema finalized | ✓ |
| 6    | P1    | Daily GL dashboard API + streak calculation + midnight reset cron | Dashboard screen + GL gauge + meal timeline + streak counter + **Scan flow UX optimization** | Daily GL endpoints live | ✓ |
| 7    | P1    | A1C estimation algorithm + encryption + manual A1C logging | Scan results advice cards (sequencing, swaps, post-meal) + **Paywall UI** (3 tiers, correct pricing) | Scan results connected to live API | ✓ |
| 8    | P1    | Post-meal walk API + push notification scheduler (5-min delay) | A1C progress screen + chart + manual A1C form + disclaimer + **Usability testing** (5 beta testers, SUS ≥70) | **GATE:** First end-to-end scan working in staging | **GO/NO-GO to Phase 2** |
| 9    | P2    | GDPR export endpoint + query optimization | Walk timer screen + notification handler + completion tracking + **Design iteration** (usability fixes) | GDPR endpoints spec complete | ✓ |
| 10   | P2    | GDPR deletion (soft-delete + 30-day purge job) + photo cleanup job | Meal history screen + search + filter + 7-day free tier gate | Rate limiting implemented | ✓ |
| 11   | P2    | RLS policies on all tables + SQL injection audit | Weekly insights screen + pattern cards (Premium) + educational content + **Accessibility audit** (WCAG AA) | RLS applied to all user-data tables | ✓ |
| 12   | P2    | Educational articles API + seed data (20 articles, RD-reviewed) | Profile screen + settings + dietary profile editor | Article library endpoints live | ✓ |
| 13   | P3    | RevenueCat webhook + subscription entitlement verification + grace period | RevenueCat SDK integration + paywall modal (3 tiers) + feature gating + **Design QA gate** (all screens match Figma) | RevenueCat products configured: **$12.99/month, $99.99/year, $249.99 lifetime** | **Week 13 Gate** |
| 14   | P3    | k6 load test execution + query optimization + penetration test coordination | Beta testing (100 users) + App Store submission prep + polish | **GATE:** VAL-001 accuracy ≥85% on 100-meal set + Pentest Critical/High resolved | **GO/NO-GO to Submission** |
| 15   | P4    | Production deploy + monitoring setup + hotfix readiness | App Store submission + landing page launch + community announcement | **GATE:** App Store pre-submission checklist complete | **LAUNCH ✓** |

---

## SECTION 2: CRITICAL PATH

**Any slip on this path delays launch. Monitor daily.**

Week 1: [Backend] PostgreSQL schema migrations (users, scans, food_items, a1c_logs, activities)
  └→ Week 1: [Backend] User auth endpoints (register, login, guest) — JWT + refresh token rotation
    └→ Week 1: [Backend] OpenAI DPA execution (LEGAL BLOCKER — pre-launch required)
      └→ Week 1: [Product/Design] Pricing locked ($12.99/$99.99/$249.99) — BLK-009
        └→ Week 1: [Product/Design] Design system defined (tokens, colors, typography) — BLK-D01
          └→ Week 2: [Backend] OpenAI API integration + master prompt v1 + complexity classifier
            └→ Week 2: [Frontend] Expo camera overlay spike (2-day decision gate)
              └→ Week 2: [Product/Design] Figma mockups complete (8 screens) — BLK-D02
                └→ Week 3: [Backend] Scan API endpoint scaffold (POST /api/v1/scan)
                  └→ Week 4: [Backend] Safety floor implementation + confidence scoring + conservative bias
                    └→ Week 4: [Frontend] Component library complete (button, card, input, badge) — BLK-D03
                      └→ Week 5: [Backend] Food sequencing + swap generation (dietary restriction filtering)
                        └→ Week 6: [Frontend] Scan results UI connected to live API
                          └→ Week 7: [Backend] A1C estimation algorithm (14-day rolling avg, adherence tiers)
                            └→ Week 8: [Frontend] A1C progress tracker with ±0.2 bounds + disclaimer
                              └→ Week 8: [Product/Design] Usability testing complete (SUS ≥70)
                                └→ Week 11: [Backend] RLS policies applied to all user-data tables
                                  └→ Week 11: [Product/Design] Accessibility audit passed (WCAG AA) — BLK-D04
                                    └→ Week 13: [Backend/Frontend] RevenueCat integration (webhook + SDK)
                                      └→ Week 13: [Product/Design] Design QA gate passed — BLK-D05
                                        └→ Week 14: [QA] VAL-001: ≥85% spike risk accuracy on 100-meal validation set
                                          └→ Week 14: [Security] Penetration test — all Critical/High findings resolved
                                            └→ Week 15: [Compliance] App Store pre-submission checklist complete
                                              └→ Week 15: **LAUNCH — App Store submission**

**Critical Path Owners:**
- Backend API stability: Person A
- Camera architecture decision (Week 2): Person A (spike)
- Design system + Figma mockups (Weeks 1-2): Founder + Person B
- Component library (Weeks 3-4): Person B
- RevenueCat integration: Both (Person A webhook, Person B SDK)
- Usability testing (Week 8): Founder (facilitation), Person B (design iteration)
- Accessibility audit (Week 11): Person B
- Design QA gate (Week 13): Founder (review), Person B (fixes)
- Accuracy validation (Week 14): Person A (AI prompt iteration)
- Compliance checklist: Founder/PM

---

## SECTION 3: CROSS-DOMAIN DEPENDENCY REGISTER

**The most fragile handoffs. Monitor weekly in sync.**

| Dep ID | Producing Task | Domain | Week | Consuming Task | Domain | Risk if Late |
|--------|---------------|--------|------|----------------|--------|--------------|
| DEP-001 | Auth endpoints complete (register, login, guest, refresh) | Backend | W1 | Onboarding screens connected to API | Frontend | W3 blocked — onboarding cannot save user data |
| DEP-002 | Scan API response schema finalized (camelCase JSON, all fields documented) | Backend | W2 | Scan results UI components | Frontend | W5 blocked — UI cannot render response |
| DEP-003 | Safety floors implemented (8 food categories, Levenshtein distance ≤2) | Backend/AI | W3 | VAL-001 accuracy test (100-meal validation) | AI/ML | W14 gate blocked — accuracy validation fails |
| DEP-004 | RevenueCat products configured in dashboard ($12.99/$99.99/$249.99) | Monetization | W12 | Free/premium feature gating in UI | Frontend | W13 blocked — paywall cannot display pricing |
| DEP-005 | GDPR export + deletion endpoints live (GET /api/v1/user/export, DELETE /api/v1/user/account) | Backend | W9-10 | App Store pre-submission checklist (Privacy Policy links functional) | Compliance | W14 blocked — cannot submit without GDPR compliance |
| DEP-006 | Rate limiting implemented (Redis token bucket, free=5/day, premium=100/day) | Backend | W9 | Free tier scan limit UX (X-Scans-Remaining header display, paywall trigger) | Frontend | W10 blocked — cannot gate free users |
| DEP-007 | RLS policies applied to all user-data tables (users, scans, food_items, a1c_logs, activities) | Backend | W11 | Penetration test scope complete (security vendor can begin testing) | Security | W14 blocked — pentest cannot validate RLS without implementation |
| DEP-008 | OpenAI DPA executed (Data Processing Agreement for GDPR Art. 28) | Compliance | W1 | First production scan with real user data | Backend | **LEGAL BLOCKER — cannot send photos to OpenAI without DPA** |
| DEP-009 | API field naming finalized (camelCase convention locked in backend code) | Backend | W1 | All frontend API calls (auth, onboarding, scan, dashboard, a1c) | Frontend | W3–W14 cascade — changing convention breaks all existing frontend code |
| DEP-010 | PostHog SDK integrated (analytics events firing) | Frontend | W9 | A/B test infrastructure for paywall experiments | Monetization | W12 blocked — cannot run paywall variant tests |
| DEP-011 | Scan API returns `fromCache: true` when pHash match found | Backend | W3 | UI badge display ("⚡ Instant result") | Frontend | W6 — minor UX feature, not blocking |
| DEP-012 | Conservative bias correction implemented (MEDIUM: ×1.10, LOW: ×1.20) | Backend/AI | W4 | VAL-020 acceptance criteria (bias calculation verification) | QA | W14 gate — validation must confirm correct bias application |
| DEP-013 | Daily GL midnight reset cron job (timezone-aware using user.timezone column) | Backend | W6 | Streak calculation correctness (VAL-006 — streak increments only when GL ≤ budget) | Backend | W14 gate — incorrect timezone handling breaks streaks |
| DEP-014 | A1C estimation algorithm Rust implementation (exact formula from SPEC §4.2.5) | Backend | W7 | A1C progress screen with ±0.2 bounds display | Frontend | W8 blocked — cannot show estimates without backend logic |
| DEP-015 | Confidence scoring logic (HIGH/MEDIUM/LOW based on complexity + certainty) | Backend/AI | W4 | GL range display (show range for MEDIUM/LOW, point estimate for HIGH) | Frontend | W5 blocked — UI cannot decide when to show range |
| DEP-016 | `sequencingAdvice` and `swapSuggestions` in scan API response | Backend/AI | W5 | Advice cards UI (SequencingCard, SwapCard — Premium feature) | Frontend | W7 blocked — cannot render premium content |
| DEP-017 | RevenueCat webhook endpoint live (handles subscription.purchased, .renewed, .cancelled, .expired) | Backend | W13 | Subscription lifecycle handling (update user.subscription_tier within 60s) | Backend | W14 gate — VAL-027 requires webhook validation |
| DEP-018 | One-time-use refresh token rotation (SEC-003 — replay detection revokes all tokens) | Backend | W1 | Frontend token refresh flow (auto-refresh on 401, logout on failure) | Frontend | W3 blocked — auth breaks without rotation support |
| DEP-019 | `advice_cards` entitlement check server-side (never trust client-only) | Backend | W13 | Free tier response filtering (null advice cards for free users) | Backend | W14 gate — server must enforce entitlements |
| DEP-020 | Expo camera overlay architecture decision (Managed vs Bare workflow) | DevOps | W2 | All camera-related frontend work (camera screen, plate overlay, image capture) | Frontend | W3–W6 blocked — cannot start camera UI without architecture locked |
| **DEP-021** | **Design system defined (color tokens, typography, spacing)** | **Product/Design** | **W1** | **Component library implementation (button, card, input, badge)** | **Frontend** | **W3-4 blocked — components cannot use design tokens** |
| **DEP-022** | **Figma mockups complete (8 screens: onboarding, login, scan, result, dashboard, advice, paywall, settings)** | **Product/Design** | **W2** | **All UI implementation (onboarding, scan, dashboard, paywall)** | **Frontend** | **W3-13 blocked — frontend cannot implement without specs** |
| **DEP-023** | **Component library complete (button, card, input, badge with design system)** | **Frontend** | **W4** | **All screen implementations (scan, dashboard, paywall, settings)** | **Frontend** | **W5-13 — screens cannot reuse components, code duplication** |
| **DEP-024** | **Usability testing complete (5 testers, findings documented)** | **Product/Design** | **W8** | **Design iteration (P1 issues fixed)** | **Frontend** | **W9 — usability issues persist to launch** |
| **DEP-025** | **Accessibility audit passed (WCAG AA compliance verified)** | **Product/Design** | **W11** | **App Store submission (accessibility compliance required)** | **Compliance** | **W15 blocked — cannot submit without accessibility** |

**High-Risk Dependencies (≥3 downstream tasks blocked):**
- DEP-002 (Scan API schema) — blocks W5, W6, W7 frontend work
- DEP-009 (API naming) — cascade effect across entire frontend
- DEP-020 (Camera architecture) — blocks all camera features
- **DEP-021 (Design system)** — blocks all component + UI work
- **DEP-022 (Figma mockups)** — blocks all frontend implementation

**Mitigation Strategy:**
- DEP-002: Mock API responses generated Week 2 (before backend complete) so frontend can start UI
- DEP-009: Lock naming convention Day 1, add CI lint rule to prevent drift
- DEP-020: 2-day spike timebox Week 2, decision documented in Architecture Decision Record (ADR)
- **DEP-021: Design system documented Week 1 (Day 1-2), CSS variables exported for immediate use**
- **DEP-022: Figma mockups prioritized Week 2 (Founder focused), interactive prototype for handoff to Person B**

---

## SECTION 4: LAUNCH BLOCKERS TRACKER

**Live status updated weekly in Monday sync. "NOT STARTED" → "IN PROGRESS" → "DONE" → "VERIFIED"**

| ID   | Blocker | Domain | Owner | Target Week | Status | Last Updated | Notes |
|------|---------|--------|-------|-------------|--------|--------------|-------|
| BLK-001 | VAL-001: ≥85% spike risk accuracy on 100-meal validation set | AI/ML | Person A | W14 | NOT STARTED | - | **CRITICAL GATE — blocks App Store submission** |
| BLK-002 | OpenAI DPA executed (Data Processing Agreement signed in OpenAI console) | Compliance | Founder | W1 | NOT STARTED | - | **LEGAL BLOCKER — cannot send user photos to OpenAI without DPA** |
| BLK-003 | GDPR DPIA documented (Data Protection Impact Assessment for health data processing) | Compliance | Founder | W10 | NOT STARTED | - | **EU LEGAL REQUIREMENT — required for health data at scale** |
| BLK-004 | Penetration test complete — all Critical/High findings resolved | Security | Vendor + Person A | W14 | NOT STARTED | - | **SECURITY GATE — blocks launch** |
| BLK-005 | App Store pre-submission checklist complete (Privacy Policy, Terms, Screenshots, Metadata) | Compliance | Founder | W14 | NOT STARTED | - | **APP STORE BLOCKER — cannot submit without complete listing** |
| BLK-006 | ALL "reversal" language removed from codebase (grep audit passes in CI) | Compliance | Both | W2 | NOT STARTED | - | **FTC COMPLIANCE — automated CI check enforced** |
| BLK-007 | COPPA age gate implemented and tested (VAL-014 — users <13 blocked) | Backend+Frontend | Both | W6 | NOT STARTED | - | **COPPA LEGAL REQUIREMENT** |
| BLK-008 | GDPR export + deletion endpoints functional (VAL-010, VAL-011 — <10s export, 30-day purge) | Backend | Person A | W11 | NOT STARTED | - | **GDPR COMPLIANCE — required for EU users** |
| BLK-009 | Pricing locked ($12.99/$99.99/$249.99) across all code, UI copy, and marketing materials | Monetization | Founder | W1 | NOT STARTED | - | **CONSISTENCY BLOCKER — prevents RevenueCat config** |
| BLK-010 | Safety floor overrides tested for all 8 food categories (VAL-009 — 100% coverage) | AI/ML | Person A | W14 | NOT STARTED | - | **SAFETY CRITICAL — prevents underestimation of high-GL foods** |
| BLK-011 | RevenueCat subscription lifecycle tested (purchase, renew, cancel, expire, restore) | Monetization | Both | W13 | NOT STARTED | - | **MONETIZATION GATE — VAL-027 acceptance criteria** |
| BLK-012 | Expo camera overlay + bare workflow decision confirmed (2-day spike Week 2) | DevOps | Person A | W2 | NOT STARTED | - | **ARCHITECTURE DECISION — blocks all camera work** |
| BLK-013 | A1C estimation algorithm with ±0.2 bounds on EVERY display (VAL-007, VAL-016) | Backend+Frontend | Both | W12 | NOT STARTED | - | **MEDICAL DISCLAIMER CRITICAL — liability risk if omitted** |
| BLK-014 | CI/CD pipeline enforces no "reversal" language (grep lint fails build on match) | DevOps | Person A | W3 | NOT STARTED | - | **AUTOMATED COMPLIANCE CHECK** |
| BLK-015 | Conservative bias correction implemented (MEDIUM: ×1.10, LOW: ×1.20 — VAL-020) | Backend/AI | Person A | W4 | NOT STARTED | - | **SAFETY CRITICAL — ensures overestimation when uncertain** |
| BLK-016 | One-time-use refresh token rotation (SEC-003 — replay revokes all tokens) | Backend | Person A | W1 | NOT STARTED | - | **SECURITY CRITICAL — theft detection mechanism** |
| BLK-017 | Rate limiting enforced server-side (free=5/day, premium=100/day — VAL-012) | Backend | Person A | W9 | NOT STARTED | - | **COST PROTECTION — prevents free tier abuse** |
| BLK-018 | RLS policies applied to ALL user-data tables (SEC-008 — users, scans, food_items, a1c_logs, activities) | Backend | Person A | W11 | NOT STARTED | - | **SECURITY CRITICAL — prevents cross-user data access** |
| **BLK-D01** | **Design system defined (colors, typography, spacing documented in docs/DESIGN-TOKENS.md)** | **Product/Design** | **Founder** | **W1** | **NOT STARTED** | **-** | **DESIGN FOUNDATION — blocks all UI implementation** |
| **BLK-D02** | **Figma mockups complete (all 8 screens: onboarding, login, scan, result, dashboard, advice, paywall, settings)** | **Product/Design** | **Founder** | **W2** | **NOT STARTED** | **-** | **DESIGN SPECS — blocks frontend implementation** |
| **BLK-D03** | **Component library implemented (button, card, input, badge with design system)** | **Frontend** | **Person B** | **W4** | **NOT STARTED** | **-** | **COMPONENT FOUNDATION — enables consistent UI** |
| **BLK-D04** | **Accessibility audit passed (WCAG AA — contrast, touch targets, screen readers)** | **Product/Design** | **Person B** | **W11** | **NOT STARTED** | **-** | **ACCESSIBILITY GATE — required for App Store** |
| **BLK-D05** | **Design QA gate passed (all screens match Figma, zero P0 issues)** | **Product/Design** | **Founder** | **W13** | **NOT STARTED** | **-** | **DESIGN VALIDATION — ensures UI quality** |

**High-Priority Blockers (Week 1-2):**
- BLK-002 (OpenAI DPA) — **Day 1 task**, cannot delay
- BLK-006 ("reversal" language audit) — **Week 1-2**, prevents downstream compliance issues
- BLK-009 (Pricing locked) — **Week 1**, blocks RevenueCat configuration Week 12
- BLK-012 (Camera architecture decision) — **Week 2 spike**, blocks all camera work Week 3+
- **BLK-D01 (Design system defined) — Week 1 (Day 1-2), blocks all UI component work**
- **BLK-D02 (Figma mockups complete) — Week 2 (full week), blocks all frontend implementation**

**Gate Blockers (Week 14):**
- BLK-001 (VAL-001 accuracy) — **Non-negotiable launch gate**
- BLK-004 (Penetration test) — **Security gate**
- BLK-005 (App Store checklist) — **Submission blocker**
- **BLK-D04 (Accessibility audit) — Accessibility compliance gate**
- **BLK-D05 (Design QA gate) — UI quality gate**

---

## SECTION 5: DOMAIN PLAN COORDINATION

**The Master Plan coordinates 7 domain-specific implementation plans. Each domain plan provides task-level detail but MUST NOT contradict Master Plan on: timeline, team roles, gates, pricing, or tool choices.**

### Domain Plan Structure

**Each domain plan contains:**
1. **Domain Mission** — What this domain owns, why it matters
2. **Phase-by-Phase Tasks** — Week-by-week execution details (Phases 0-4)
3. **Cross-Domain Dependencies** — What this domain produces/consumes (references DEP-XXX from Master Plan)
4. **Domain-Specific Blockers** — Launch blockers owned by this domain (references BLK-XXX from Master Plan)
5. **Domain-Specific Risks** — Risks owned by this domain (references RSK-XXX from Master Plan)
6. **Weekly Deliverables** — Primary deliverable per week, milestone/gate alignment with Master Plan

### Domain Plan List

| Domain Plan | Owner | Scope | Master Plan Alignment |
|------------|-------|-------|---------------------|
| **Backend Implementation Plan** | Person A | Rust/Axum API, PostgreSQL, Redis, OpenAI integration, scan pipeline, GDPR endpoints, RLS policies | Weeks 1-15 timeline, DEP-001/002/003/008/009/012/013/014/015/016/017/018/019, BLK-001/002/008/015/016/017/018 |
| **Frontend Implementation Plan** | Person B | React Native/Expo, UI screens, component library, state management, RevenueCat SDK | Weeks 1-15 timeline, DEP-001/002/006/009/010/011/014/015/016/023, BLK-007/013 (shared with Backend) |
| **AI/ML Implementation Plan** | Person A | OpenAI GPT-4o prompts, complexity classifier, safety floors, conservative bias, confidence scoring, accuracy validation | Weeks 2-14, DEP-003/012/015/016, BLK-001/010/015 |
| **Security/Compliance Plan** | Person A + Founder | Authentication, RLS policies, GDPR (DPA/DPIA/export/deletion), COPPA age gate, penetration test, FTC compliance, App Store checklist | Weeks 1-15, DEP-005/007/008, BLK-002/003/004/005/006/007/008/014/016/018 |
| **DevOps Implementation Plan** | Person A | Railway.app deployment, CI/CD pipeline, monitoring (Sentry, PostHog), camera architecture spike, k6 load testing | Weeks 1-15, DEP-020, BLK-012/014 |
| **Monetization Implementation Plan** | Founder | Pricing strategy, RevenueCat integration (products config, webhook, SDK), paywall design, A/B testing, cost monitoring | Weeks 1-13, DEP-004/010/017, BLK-009/011 |
| **Product/Design Implementation Plan** | Founder + Person B | Design system (tokens, colors, typography), Figma mockups, component library (specs + implementation), usability testing, accessibility audit, design QA | Weeks 1-13, DEP-021/022/023/024/025, BLK-D01/D02/D03/D04/D05 |

### Master Plan → Domain Plan Flow

**Week 1 Example:**

**Master Plan says:**
- Person A: Rust/Axum scaffold + PostgreSQL schema + auth setup + Redis
- Person B: Expo SDK 52 init + TypeScript config + Zustand setup + **Design system definition**
- Shared: OpenAI DPA execution (BLOCKER) + **Pricing locked: $12.99/$99.99/$249.99**

**Domain Plans elaborate:**

**Backend Plan (Person A):**
- Task BE-001: PostgreSQL schema migrations (users, scans, food_items, a1c_logs, activities) — 8 hours
- Task BE-002: Rust/Axum project scaffold + API routing structure — 6 hours
- Task BE-003: JWT authentication + refresh token rotation (SEC-003) — 10 hours
- Task BE-004: Redis connection setup + cache scaffolding — 4 hours
- Deliverable: Auth endpoints live (register, login, guest, refresh) — DEP-001 unblocks Frontend W3

**Frontend Plan (Person B):**
- Task FE-001: Expo SDK 52 project initialization + TypeScript config — 4 hours
- Task FE-002: Zustand state management setup (auth, scan, dashboard stores) — 6 hours
- Task FE-003: React Navigation v6 routing structure (stack + tab navigators) — 6 hours
- Deliverable: Expo project ready for UI implementation — Week 3 onboarding can start

**Product/Design Plan (Founder + Person B):**
- Task PD-001: Design system color palette + tokens (light/dark mode, WCAG AA contrast) — 6 hours (Founder)
- Task PD-002: Typography + spacing system (4px base unit, font scale) — 3 hours (Founder)
- Task PD-003: Component design specifications (button, card, input, badge) — 5 hours (Founder)
- Deliverable: docs/DESIGN-TOKENS.md complete — DEP-021 unblocks Component library W3

**Monetization Plan (Founder):**
- Task MON-001: Pricing finalized and documented ($12.99/$99.99/$249.99) — 2 hours
- Task MON-002: RevenueCat products created in dashboard (3 SKUs) — 2 hours
- Deliverable: BLK-009 resolved (pricing locked across all documents)

**Security/Compliance Plan (Founder):**
- Task SEC-001: OpenAI DPA executed in console (self-service, GDPR Art. 28) — 30 minutes
- Deliverable: BLK-002 resolved (legal blocker cleared, can send photos to OpenAI)

### Coordination Checkpoints

**Daily (Slack Async):**
- Each person posts: "Yesterday / Today / Blockers" by 9 AM
- Cross-domain blockers flagged immediately

**Weekly (Friday Sync — 30 min):**
- Gate check: Is this week's gate met?
- Blocker status: Review BLK-XXX items due this/next week
- Dependency handoffs: What's Person A handing to Person B? Vice versa?
- Next week preview: Primary deliverables for each person

**Milestone Reviews:**
- Week 2 Gate: Camera architecture decision (GO/NO-GO) — Architecture locked before Week 3 camera work starts
- Week 8 Gate: First E2E scan working (GO/NO-GO to Phase 2) — Technical validation before usability testing
- Week 13 Gate: Design QA + RevenueCat integration complete — Ready for beta testing Week 14
- Week 14 Gate: Accuracy ≥85% + Pentest resolved (GO/NO-GO to Submission) — Final validation before launch
- Week 15 Gate: App Store pre-submission checklist complete — Ready for LAUNCH

---

## SECTION 6: RISK REGISTER (LIVE)

**Probability: LOW (10%) / MEDIUM (40%) / HIGH (70%) | Impact: LOW / MEDIUM / HIGH / CRITICAL**

| Risk ID | Description | Probability | Impact | Owner | Mitigation | Status |
|---------|-------------|-------------|--------|-------|------------|--------|
| RSK-001 | Expo managed workflow requires ejection for camera overlay (breaks DevOps simplicity) | MEDIUM | HIGH | Person A | **Week 2 spike:** 2-day proto validates camera overlay + Terra SDK in managed workflow. Decision documented in ADR before committing architecture. | OPEN |
| RSK-002 | OpenAI accuracy <85% at beta (VAL-001 gate fails, blocks launch) | MEDIUM | CRITICAL | Person A | **Daily prompt iteration log** from Week 2. Fallback: conservative bias + safety floors protect SAFE/HIGH boundary. **Dry-run accuracy test Week 8** (50 meals) provides early signal. | OPEN |
| RSK-003 | Timeline slips — backend not ready for frontend integration (Person A bottleneck) | HIGH | HIGH | Person A | **API mocks delivered 1 week before live backend** (e.g., Week 2 mock scan response enables Week 5 frontend UI work). Parallel work maximized. | OPEN |
| RSK-004 | AI cost exceeds $0.05/scan blended (CON-001 violated, unit economics break) | MEDIUM | HIGH | Person A | **Cost dashboard from Day 1** (PostHog custom event tracking AI spend). Redis cache hit rate tracked daily (target ≥40%). **Circuit breaker at $0.08/scan:** pause free signups until prompt optimized. | OPEN |
| RSK-005 | App Store rejection for health claims ("reversal" language slips through) | HIGH | HIGH | Founder | **Language audit Week 1** (grep all docs + code). **Legal review Week 10** (FTC attorney $3-5K). **CI grep lint** blocks "reversal" in CI pipeline (BLK-014). | OPEN |
| RSK-006 | RevenueCat webhook latency causes subscription state mismatch (user pays but still sees free tier) | MEDIUM | MEDIUM | Both | **Grace period logic** (brief window before hard downgrade). **Local entitlement cache** on device (fallback if webhook delayed). **Manual override endpoint** for customer support edge cases. | OPEN |
| RSK-007 | Beta accuracy validation fails at Week 14 (VAL-001 gate, <85%) | MEDIUM | CRITICAL | Person A | **Dry-run accuracy test Week 8** (50-meal sample) provides 6-week warning. Iterate prompts Weeks 9-12 **before** final gate. Safety floors + conservative bias provide floor on risk. | OPEN |
| RSK-008 | Penetration test finds Critical/High issues in Week 13-14 (no time to fix before launch) | LOW | HIGH | Vendor + Person A | **OWASP automated scan in CI from Week 3** (catches low-hanging fruit early). **RLS applied Week 11** (2-week buffer before pentest). **Auth review Week 8** (self-assessment before vendor engagement). | OPEN |
| RSK-009 | Railway.app performance insufficient at beta load (100 concurrent scans, P95 >5s) | LOW | MEDIUM | Person A | **k6 load test Week 13** (100 VUs, 5-min duration — PER-001 target). **Migration plan pre-documented:** Fly.io at >5K MAU, AWS ECS at >25K MAU. Railway→Fly.io migration: ~2-day effort. | OPEN |
| RSK-010 | Solo founder burnout / key-person dependency on Rust backend (Person A unavailable) | MEDIUM | HIGH | Founder | **Architecture decisions documented from Day 1** (ADRs in repo). **README updated weekly** (setup instructions current). **API docs auto-generated** (OpenAPI spec). Hire fractional Rust dev Month 6 if needed. | OPEN |
| RSK-011 | Camera architecture decision delayed beyond Week 2 (cascade delay to all camera features) | MEDIUM | HIGH | Person A | **Hard 2-day timebox Week 2** (Wed-Thu). Decision **must** be made Friday Week 2 regardless of spike outcome. Fallback: choose Managed workflow (safer default) if spike inconclusive. | OPEN |
| RSK-012 | GDPR DPA/DPIA not completed before launch (legal blocker, cannot launch in EU) | LOW | CRITICAL | Founder | **OpenAI DPA:** Week 1 (self-service in console, 30-min task). **GDPR DPIA:** Week 10 (template-driven, 4-8 hours). Budget $2K for legal review if needed. | OPEN |
| RSK-013 | Pricing locked too late, RevenueCat config delayed (blocks Week 13 integration testing) | MEDIUM | MEDIUM | Founder | **Pricing decision Week 1** (lock $12.99/$99.99/$249.99 based on PRD §9.2 analysis). RevenueCat products configured **by end of Week 12** (BLK-009). | OPEN |
| RSK-014 | AI hallucination on high-risk meals (underestimates GL for white rice, triggers false SAFE classification) | MEDIUM | HIGH | Person A | **Safety floor overrides for 8 known categories** (white rice floor: 20 GL — SPEC §4.2.3). Confidence scoring downgrades to LOW when override applied. **VAL-009 tests 100% coverage.** | OPEN |
| RSK-015 | Free tier API cost burden unsustainable (22,500 free users × 75 scans/month × $0.02 = $33K/month at Month 12) | MEDIUM | HIGH | Person A + Founder | **40% cache hit rate reduces to ~$20K/month.** **Circuit breaker:** If conversion <5% for 60 days, reduce free tier from 5→3 scans/day (saves ~40% API cost). **Monitor daily** via cost dashboard. | OPEN |
| **RSK-016** | **Design drift: implementation doesn't match Figma mockups (inconsistent UI, poor UX)** | **MEDIUM** | **HIGH** | **Founder + Person B** | **Weekly design QA reviews** (Weeks 5, 6, 8, 9, 11). **Figma Dev Mode** for precise specs (CSS extraction). **Week 13 Design QA gate** (BLK-D05) catches issues before launch. | **OPEN** |
| **RSK-017** | **Usability testing reveals major UX issues (Week 8, requires significant redesign)** | **LOW** | **HIGH** | **Founder** | **Early prototype testing Week 6** (informal). **Recruit 5 diverse testers** (prediabetic, various ages/tech comfort). **Week 9 design iteration** budgeted for P1 fixes. | **OPEN** |
| **RSK-018** | **Accessibility audit fails (Week 11, WCAG AA non-compliance blocks App Store)** | **LOW** | **HIGH** | **Person B** | **Design with accessibility from Week 1** (contrast ratios, touch targets in design system). **Automated tools** (Xcode Accessibility Inspector) used early. **Week 11 audit** has 2-week buffer before Week 13 gate. | **OPEN** |

**Critical Risks (Impact = CRITICAL):**
- RSK-002 (OpenAI accuracy <85%) — **Mitigate:** Week 8 dry-run provides 6-week warning
- RSK-007 (Beta accuracy fail) — **Same as RSK-002**, double-listed for visibility
- RSK-012 (GDPR blockers) — **Mitigate:** Week 1 OpenAI DPA, Week 10 DPIA

**High-Probability Risks (≥70%):**
- RSK-003 (Backend bottleneck) — **Mitigate:** API mocks enable parallel frontend work
- RSK-005 (App Store rejection) — **Mitigate:** Week 1 language audit + CI lint enforcement

---

## SECTION 7: WEEKLY SYNC AGENDA (TEMPLATE)

**Duration:** 30 minutes maximum (Fridays, 4:00 PM)  
**Participants:** Person A, Person B, Founder/PM  
**Format:** Standing agenda, timeboxed

## Weekly Sync — Week [N] — [Date YYYY-MM-DD]

### 1. GATE CHECK (5 min)
- Is this week's gate met? ✅ YES / ❌ NO / ⚠️ AT RISK
- If NO or AT RISK: What is the recovery plan?
  - [ ] Action item 1 (owner, due date)
  - [ ] Action item 2 (owner, due date)

### 2. BLOCKER STATUS (10 min)
- Review BLK-XXX items due this week or next week:
  - BLK-XXX: [Status] — [Update] — [Concerns?]
  - BLK-XXX: [Status] — [Update] — [Concerns?]
- Any new blockers to add to register?

### 3. DEPENDENCY HANDOFFS (10 min)
- What is Person A handing to Person B this week?
  - DEP-XXX: [Task name] — [Status] — [Frontend can start using Monday]
- What is Person B handing to Person A this week?
  - [Feedback on backend API] — [UI blockers resolved?]
- What is Founder handing to Person B (design/product)?
  - DEP-XXX: [Design deliverable] — [Status] — [Implementation can start Monday]
- Any DEP-XXX items at risk of slipping?
  - [Dependency ID] — [Original week] → [New week] — [Impact assessment]

### 4. NEXT WEEK PREVIEW (5 min)
- Person A primary deliverable next week: [Task]
- Person B primary deliverable next week: [Task]
- Founder primary deliverable next week: [Task]
- Any cross-domain prep needed before Monday?
  - [ ] Action item (owner)

### 5. STANDING METRICS (Reported, not discussed unless anomaly)
- AI scan cost (daily blended $/scan) — Person A: **$0.XXX** (target ≤$0.02)
- Crash-free rate (Sentry) — Person B: **99.X%** (target ≥99.5%)
- Any "reversal" language found in new code this week? — Both confirm: ✅ NO / ❌ YES (if yes, removed before merge)
- Redis cache hit rate (this week) — Person A: **XX%** (target ≥40%)

### 6. RISKS & DECISIONS
- Any risks escalated this week? (add to RSK register)
- Any architecture decisions made? (document in ADR)

**Example — Week 2 Sync:**
## Weekly Sync — Week 2 — 2026-03-13

### 1. GATE CHECK
- ✅ Camera overlay spike COMPLETE (Wed-Thu)
- Decision: **Managed workflow VIABLE** (plate overlay works as RN View, Terra SDK imports successfully)
- ADR-002 documented: "Expo Managed Workflow Confirmed"
- ✅ Figma mockups COMPLETE (8 screens, light + dark mode, interactive prototype)
- Gate: **PASSED — architecture locked, camera work unblocked + frontend has design specs**

### 2. BLOCKER STATUS
- BLK-002 (OpenAI DPA): ✅ DONE (executed Monday, confirmed in console)
- BLK-006 ("reversal" audit): ✅ DONE (grep CI rule added, zero matches in codebase)
- BLK-009 (Pricing locked): ✅ DONE ($12.99/$99.99/$249.99 confirmed, documented in PRD + codebase constants)
- BLK-D01 (Design system defined): ✅ DONE (docs/DESIGN-TOKENS.md complete, CSS variables exported)
- BLK-D02 (Figma mockups): ✅ DONE (all 8 screens, Figma Dev Mode enabled for handoff)

### 3. DEPENDENCY HANDOFFS
- DEP-002 (Scan API schema): ⚠️ IN PROGRESS
  - Mock response JSON delivered to Person B (Monday) — frontend can start UI
  - Live backend Week 4 (on track)
- DEP-021 (Design system): ✅ DONE
  - Founder → Person B: docs/DESIGN-TOKENS.md + mobile/styles/tokens.css complete
  - Person B can start component library Monday (Week 3)
- DEP-022 (Figma mockups): ✅ DONE
  - Founder → Person B: Figma file "GlucoSnap Mobile App v1.0" + interactive prototype
  - Person B can start onboarding screens Monday (Week 3)

### 4. NEXT WEEK PREVIEW
- Person A: Scan API scaffold + pHash caching + R2 upload integration (Week 3)
- Person B: Onboarding flow (6 screens) + auth screens + age gate + Button/Card components (Week 3)
- Founder: Usability test recruitment planning (Week 8 prep) + RevenueCat product config review
- Cross-domain prep: Lock API base URL in frontend config (Person A provides Railway staging URL Monday)

### 5. STANDING METRICS
- AI scan cost: **$0.048/scan** (target ≤$0.05, within budget)
- Crash-free rate: **N/A** (no production users yet)
- "Reversal" language: ✅ NO (CI passing)
- Redis cache hit rate: **N/A** (cache not live yet)

### 6. RISKS & DECISIONS
- RSK-011 (Camera decision delay): ✅ CLOSED (decision made Week 2 as planned)
- New risk: None
- Decision: ADR-002 "Expo Managed Workflow Confirmed" documented in repo

---

## APPENDIX A: QUICK REFERENCE

### Phase Definitions
- **Phase 0 (Weeks 1-2):** Foundation — Backend scaffold, auth, database, camera architecture decision, design system, Figma mockups
- **Phase 1 (Weeks 3-8):** Core Features — Scan pipeline, component library, dashboard, A1C tracking, usability testing
- **Phase 2 (Weeks 9-12):** Value-Add — GDPR, history, insights, educational content, accessibility audit
- **Phase 3 (Weeks 13-14):** Monetization + Beta — RevenueCat, design QA gate, testing, polish
- **Phase 4 (Week 15):** Launch — Production deploy, App Store submission

### Communication Channels
- **Daily Standup:** Slack (async, 9 AM) — Yesterday / Today / Blockers
- **Weekly Sync:** Zoom (Fridays, 30 min) — Gates, Blockers, Handoffs
- **Urgent Blockers:** Slack @channel (use sparingly)
- **Documentation:** GitHub Wiki (ADRs, setup guides, API docs)

### Escalation Path
- **Technical blocker (>2 hours stuck):** Slack @person — pair debug session
- **Cross-domain blocker:** Add to DEP register, discuss in weekly sync
- **Gate at risk:** Escalate to Founder immediately (email + Slack)
- **Launch blocker discovered:** Emergency sync within 24 hours

### Tool URLs
- **Master Plan (this doc):** `docs/GlucoSnap_Master_Plan.md`
- **Backend Plan:** `docs/GlucoSnap_Backend_Plan.md`
- **Frontend Plan:** `docs/GlucoSnap_Frontend_Plan.md`
- **AI/ML Plan:** `docs/GlucoSnap_AI_ML_Plan.md`
- **Security/Compliance Plan:** `docs/GlucoSnap_Security_Compliance_Plan.md`
- **DevOps Plan:** `docs/GlucoSnap_DevOps_Plan.md`
- **Monetization Plan:** `docs/GlucoSnap_Monetization_Plan.md`
- **Product/Design Plan:** `docs/GlucoSnap_Product_Design_Plan.md`
- **Dependency Register (live):** Google Sheet (linked in Slack)
- **Blocker Tracker (live):** GitHub Project Board
- **Risk Register (live):** Google Sheet (linked in Slack)

---

**END OF MASTER PLAN — GlucoSnap v1.1**

*Last Updated: 2026-03-07 | Next Review: 2026-03-13 | Owner: Founder/PM*

