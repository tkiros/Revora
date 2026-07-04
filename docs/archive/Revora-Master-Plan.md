# GlucoSnap Master Implementation Plan v1.0

**Document:** GlucoSnap Master Implementation Plan v1.0  
**Date:** 2026-03-06  
**Phase:** Pre-development  
**Status:** ACTIVE  
**Owner:** Founder/PM  
**Next review:** 2026-03-13  

---

## EXECUTIVE SUMMARY

This is the **single source of truth** for daily execution. Every team member reads this document daily. Maximum length: 4 pages. Domain-specific details live in domain plans (Backend, Frontend, AI/ML, Security/Compliance, DevOps, Monetization).

**Team Configuration:**
- **Team Size:** 2 people (Person A: Backend/AI/DevOps, Person B: Frontend/UX)
- **Working Hours:** 8 focused hours/day
- **Sprint Length:** 1 week
- **Buffer:** 15% added to all estimates
- **Timeline:** 15 weeks to App Store submission (per PRD §12.1)

**Critical Constraint:** Person A cannot work on backend AND frontend simultaneously. Cross-domain dependencies must be explicitly sequenced.

---

## SECTION 1: ONE-PAGE TIMELINE

| Week | Phase | Person A (Backend/DevOps/AI) | Person B (Frontend) | Shared / Blocked | Gate / Milestone |
|------|-------|------------------------------|---------------------|------------------|------------------|
| 1    | P0    | Rust/Axum scaffold + PostgreSQL schema + auth setup + Redis | Expo SDK 52 init + TypeScript config + Zustand setup | OpenAI DPA execution (BLOCKER) | ✓ |
| 2    | P0    | OpenAI integration + master prompt + safety floors + complexity classifier | **SPIKE:** Expo camera overlay test (2-day timebox) | **GATE:** Camera overlay viable? Bare vs Managed workflow decision | **GO/NO-GO: Camera Architecture** |
| 3    | P1    | Scan API scaffold + pHash caching + image upload + R2 integration | Onboarding flow (6 screens) + auth screens + age gate + GDPR consent | API field naming locked (camelCase) | ✓ |
| 4    | P1    | Scan pipeline (classifier → GPT-4o → safety floor → confidence scoring) | Camera screen + plate overlay + scan mode toggle | Conservative bias + GL range logic | ✓ |
| 5    | P1    | Food sequencing logic + swap generation + dietary restriction filtering | Scan results UI + GL banner + food breakdown + editable portions | Scan API response schema finalized | ✓ |
| 6    | P1    | Daily GL dashboard API + streak calculation + midnight reset cron | Dashboard screen + GL gauge + meal timeline + streak counter | Daily GL endpoints live | ✓ |
| 7    | P1    | A1C estimation algorithm + encryption + manual A1C logging | Scan results advice cards (sequencing, swaps, post-meal) | Scan results connected to live API | ✓ |
| 8    | P1    | Post-meal walk API + push notification scheduler (5-min delay) | A1C progress screen + chart + manual A1C form + disclaimer | **GATE:** First end-to-end scan working in staging | **GO/NO-GO to Phase 2** |
| 9    | P2    | GDPR export endpoint + query optimization | Walk timer screen + notification handler + completion tracking | GDPR endpoints spec complete | ✓ |
| 10   | P2    | GDPR deletion (soft-delete + 30-day purge job) + photo cleanup job | Meal history screen + search + filter + 7-day free tier gate | Rate limiting implemented | ✓ |
| 11   | P2    | RLS policies on all tables + SQL injection audit | Weekly insights screen + pattern cards (Premium) + educational content | RLS applied to all user-data tables | ✓ |
| 12   | P2    | Educational articles API + seed data (20 articles, RD-reviewed) | Profile screen + settings + dietary profile editor | Article library endpoints live | ✓ |
| 13   | P3    | RevenueCat webhook + subscription entitlement verification + grace period | RevenueCat SDK integration + paywall modal (3 tiers) + feature gating | RevenueCat products configured in console | ✓ |
| 14   | P3    | k6 load test execution + query optimization + penetration test coordination | Beta testing (100 users) + App Store submission prep + polish | **GATE:** VAL-001 accuracy ≥85% on 100-meal set + Pentest Critical/High resolved | **GO/NO-GO to Submission** |
| 15   | P4    | Production deploy + monitoring setup + hotfix readiness | App Store submission + landing page launch + community announcement | **GATE:** App Store pre-submission checklist complete | **LAUNCH ✓** |

---

## SECTION 2: CRITICAL PATH

**Any slip on this path delays launch. Monitor daily.**

```
Week 1: [Backend] PostgreSQL schema migrations (users, scans, food_items, a1c_logs, activities)
  └→ Week 1: [Backend] User auth endpoints (register, login, guest) — JWT + refresh token rotation
    └→ Week 1: [Backend] OpenAI DPA execution (LEGAL BLOCKER — pre-launch required)
      └→ Week 2: [Backend] OpenAI API integration + master prompt v1 + complexity classifier
        └→ Week 2: [Frontend] Expo camera overlay spike (2-day decision gate)
          └→ Week 3: [Backend] Scan API endpoint scaffold (POST /api/v1/scan)
            └→ Week 4: [Backend] Safety floor implementation + confidence scoring + conservative bias
              └→ Week 5: [Backend] Food sequencing + swap generation (dietary restriction filtering)
                └→ Week 6: [Frontend] Scan results UI connected to live API
                  └→ Week 7: [Backend] A1C estimation algorithm (14-day rolling avg, adherence tiers)
                    └→ Week 8: [Frontend] A1C progress tracker with ±0.2 bounds + disclaimer
                      └→ Week 11: [Backend] RLS policies applied to all user-data tables
                        └→ Week 13: [Backend/Frontend] RevenueCat integration (webhook + SDK)
                          └→ Week 14: [QA] VAL-001: ≥85% spike risk accuracy on 100-meal validation set
                            └→ Week 14: [Security] Penetration test — all Critical/High findings resolved
                              └→ Week 15: [Compliance] App Store pre-submission checklist complete
                                └→ Week 15: **LAUNCH — App Store submission**
```

**Critical Path Owners:**
- Backend API stability: Person A
- Camera architecture decision (Week 2): Person A (spike)
- RevenueCat integration: Both (Person A webhook, Person B SDK)
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
| DEP-004 | RevenueCat products configured in dashboard ($12.99/$79.99/$249.99) | Monetization | W12 | Free/premium feature gating in UI | Frontend | W13 blocked — paywall cannot display pricing |
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

**High-Risk Dependencies (≥3 downstream tasks blocked):**
- DEP-002 (Scan API schema) — blocks W5, W6, W7 frontend work
- DEP-009 (API naming) — cascade effect across entire frontend
- DEP-020 (Camera architecture) — blocks all camera features

**Mitigation Strategy:**
- DEP-002: Mock API responses generated Week 2 (before backend complete) so frontend can start UI
- DEP-009: Lock naming convention Day 1, add CI lint rule to prevent drift
- DEP-020: 2-day spike timebox Week 2, decision documented in Architecture Decision Record (ADR)

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
| BLK-009 | Pricing locked ($12.99/$79.99/$249.99) across all code, UI copy, and marketing materials | Monetization | Founder | W1 | NOT STARTED | - | **CONSISTENCY BLOCKER — prevents RevenueCat config** |
| BLK-010 | Safety floor overrides tested for all 8 food categories (VAL-009 — 100% coverage) | AI/ML | Person A | W14 | NOT STARTED | - | **SAFETY CRITICAL — prevents underestimation of high-GL foods** |
| BLK-011 | RevenueCat subscription lifecycle tested (purchase, renew, cancel, expire, restore) | Monetization | Both | W13 | NOT STARTED | - | **MONETIZATION GATE — VAL-027 acceptance criteria** |
| BLK-012 | Expo camera overlay + bare workflow decision confirmed (2-day spike Week 2) | DevOps | Person A | W2 | NOT STARTED | - | **ARCHITECTURE DECISION — blocks all camera work** |
| BLK-013 | A1C estimation algorithm with ±0.2 bounds on EVERY display (VAL-007, VAL-016) | Backend+Frontend | Both | W12 | NOT STARTED | - | **MEDICAL DISCLAIMER CRITICAL — liability risk if omitted** |
| BLK-014 | CI/CD pipeline enforces no "reversal" language (grep lint fails build on match) | DevOps | Person A | W3 | NOT STARTED | - | **AUTOMATED COMPLIANCE CHECK** |
| BLK-015 | Conservative bias correction implemented (MEDIUM: ×1.10, LOW: ×1.20 — VAL-020) | Backend/AI | Person A | W4 | NOT STARTED | - | **SAFETY CRITICAL — ensures overestimation when uncertain** |
| BLK-016 | One-time-use refresh token rotation (SEC-003 — replay revokes all tokens) | Backend | Person A | W1 | NOT STARTED | - | **SECURITY CRITICAL — theft detection mechanism** |
| BLK-017 | Rate limiting enforced server-side (free=5/day, premium=100/day — VAL-012) | Backend | Person A | W9 | NOT STARTED | - | **COST PROTECTION — prevents free tier abuse** |
| BLK-018 | RLS policies applied to ALL user-data tables (SEC-008 — users, scans, food_items, a1c_logs, activities) | Backend | Person A | W11 | NOT STARTED | - | **SECURITY CRITICAL — prevents cross-user data access** |

**High-Priority Blockers (Week 1-2):**
- BLK-002 (OpenAI DPA) — **Day 1 task**, cannot delay
- BLK-006 ("reversal" language audit) — **Week 1-2**, prevents downstream compliance issues
- BLK-009 (Pricing locked) — **Week 1**, blocks RevenueCat configuration Week 12
- BLK-012 (Camera architecture decision) — **Week 2 spike**, blocks all camera work Week 3+

**Gate Blockers (Week 14):**
- BLK-001 (VAL-001 accuracy) — **Non-negotiable launch gate**
- BLK-004 (Penetration test) — **Security gate**
- BLK-005 (App Store checklist) — **Submission blocker**

---

## SECTION 5: RISK REGISTER (LIVE)

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
| RSK-013 | Pricing locked too late, RevenueCat config delayed (blocks Week 13 integration testing) | MEDIUM | MEDIUM | Founder | **Pricing decision Week 1** (lock $12.99/$79.99/$249.99 based on PRD §9.2 analysis). RevenueCat products configured **by end of Week 12** (BLK-009). | OPEN |
| RSK-014 | AI hallucination on high-risk meals (underestimates GL for white rice, triggers false SAFE classification) | MEDIUM | HIGH | Person A | **Safety floor overrides for 8 known categories** (white rice floor: 20 GL — SPEC §4.2.3). Confidence scoring downgrades to LOW when override applied. **VAL-009 tests 100% coverage.** | OPEN |
| RSK-015 | Free tier API cost burden unsustainable (22,500 free users × 75 scans/month × $0.02 = $33K/month at Month 12) | MEDIUM | HIGH | Person A + Founder | **40% cache hit rate reduces to ~$20K/month.** **Circuit breaker:** If conversion <5% for 60 days, reduce free tier from 5→3 scans/day (saves ~40% API cost). **Monitor daily** via cost dashboard. | OPEN |

**Critical Risks (Impact = CRITICAL):**
- RSK-002 (OpenAI accuracy <85%) — **Mitigate:** Week 8 dry-run provides 6-week warning
- RSK-007 (Beta accuracy fail) — **Same as RSK-002**, double-listed for visibility
- RSK-012 (GDPR blockers) — **Mitigate:** Week 1 OpenAI DPA, Week 10 DPIA

**High-Probability Risks (≥70%):**
- RSK-003 (Backend bottleneck) — **Mitigate:** API mocks enable parallel frontend work
- RSK-005 (App Store rejection) — **Mitigate:** Week 1 language audit + CI lint enforcement

---

## SECTION 6: WEEKLY SYNC AGENDA (TEMPLATE)

**Duration:** 30 minutes maximum (Fridays, 4:00 PM)  
**Participants:** Person A, Person B, Founder/PM  
**Format:** Standing agenda, timeboxed

```
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
- Any DEP-XXX items at risk of slipping?
  - [Dependency ID] — [Original week] → [New week] — [Impact assessment]

### 4. NEXT WEEK PREVIEW (5 min)
- Person A primary deliverable next week: [Task]
- Person B primary deliverable next week: [Task]
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
```

**Example — Week 2 Sync:**
```
## Weekly Sync — Week 2 — 2026-03-29

### 1. GATE CHECK
- ✅ Camera overlay spike COMPLETE (Wed-Thu)
- Decision: **Managed workflow VIABLE** (plate overlay works as RN View, Terra SDK imports successfully)
- ADR-002 documented: "Expo Managed Workflow Confirmed"
- Gate: **PASSED — architecture locked, camera work unblocked**

### 2. BLOCKER STATUS
- BLK-002 (OpenAI DPA): ✅ DONE (executed Monday, confirmed in console)
- BLK-006 ("reversal" audit): ✅ DONE (grep CI rule added, zero matches in codebase)
- BLK-009 (Pricing locked): ✅ DONE ($12.99/$79.99/$249.99 confirmed, documented in PRD + codebase constants)

### 3. DEPENDENCY HANDOFFS
- DEP-002 (Scan API schema): ⚠️ IN PROGRESS
  - Mock response JSON delivered to Person B (Monday) — frontend can start UI
  - Live backend Week 4 (on track)

### 4. NEXT WEEK PREVIEW
- Person A: Scan API scaffold + pHash caching + R2 upload integration (Week 3)
- Person B: Onboarding flow (6 screens) + auth screens + age gate (Week 3)
- Cross-domain prep: Lock API base URL in frontend config (Person A provides Railway staging URL Monday)

### 5. STANDING METRICS
- AI scan cost: **$0.048/scan** (target ≤$0.05, within budget)
- Crash-free rate: **N/A** (no production users yet)
- "Reversal" language: ✅ NO (CI passing)
- Redis cache hit rate: **N/A** (cache not live yet)

### 6. RISKS & DECISIONS
- RSK-011 (Camera decision delay): ✅ CLOSED (decision made Week 2 as planned)
- New risk: None
```

---

## APPENDIX A: QUICK REFERENCE

### Phase Definitions
- **Phase 0 (Weeks 1-2):** Foundation — Backend scaffold, auth, database, camera architecture decision
- **Phase 1 (Weeks 3-8):** Core Features — Scan pipeline, dashboard, A1C tracking
- **Phase 2 (Weeks 9-12):** Value-Add — GDPR, history, insights, educational content
- **Phase 3 (Weeks 13-14):** Monetization + Beta — RevenueCat, testing, polish
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
- **Dependency Register (live):** Google Sheet (linked in Slack)
- **Blocker Tracker (live):** GitHub Project Board
- **Risk Register (live):** Google Sheet (linked in Slack)

---

**END OF MASTER PLAN — GlucoSnap v1.0**

*Last Updated: 2026-03-06 | Next Review: 2026-03-13 | Owner: Founder/PM*