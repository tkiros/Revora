<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# Revora Master Implementation Plan v2.0

**Document:** Revora Master Implementation Plan v2.0  
**Date:** 2026-03-15  
**Phase:** Pre-development  
**Status:** ACTIVE  
**Owner:** Founder/PM  
**Next review:** 2026-03-22  
**Supersedes:** Master Implementation Plan v1.1 (2026-03-07)

### CHANGELOG

**v1.1 → v2.0:** 2026-03-15 (Execution Engine Redesign)
- **Redesigned** from static reference document into operational execution engine
- **New Section 0:** How to Read This Plan (audiences, glossary, file map)
- **New Section 1:** Project State Dashboard (live weekly status)
- **New Section 2:** Execution Sequence with 120+ STEP-XXX items, critical path overlay, parallel work map
- **New Section 3:** Gate Decision Framework (5 gates with GO/NO-GO criteria)
- **New Section 4:** Blocker Management Protocol (registry + response protocol + AI agent detection)
- **New Section 5:** Dependency Execution Map (handoff protocol + mock-first strategy)
- **New Section 6:** Risk Execution Protocol (registry + playbooks for CRITICAL/HIGH risks)
- **New Section 7:** AI Agent Operating Protocol (orientation, authorization, escalation)
- **New Section 8:** Weekly Sync Protocol (updated with STEP-XXX references)
- **New Section 9:** Launch Checklist — Final 72 Hours
- **New Appendix B:** Issue Resolution Log (all 51 findings from alignment audit)
- **New Appendix C:** Architecture Decision Record Index
- **Applied FLAG-1:** Added BLK-019 (FTC attorney sign-off)
- **Applied FLAG-2:** Added QA/Testing as 8th domain plan
- **Applied FLAG-3:** Added DEP-026 (FTC attorney sign-off dependency)
- **Applied FLAG-4:** Added DEP-027 (Trademark search dependency)
- **Applied FLAG-5:** Added RSK-019 (Attorney engagement delays)
- **Applied FLAG-6:** Added RSK-020 (Pricing error propagation)
- **Applied FLAG-7:** Week 12 timeline updated with RevenueCat product config
- **Applied FLAG-8:** Added BLK-020 (Trademark search)
- **Fixed:** DEP-003 safety floors corrected from 8→6 categories
- **Fixed:** BLK-010 safety floors corrected from 8→6 categories
- **Fixed:** RSK-014 safety floors corrected from 8→6 categories

---

## SECTION 0: HOW TO READ THIS PLAN

### 0.1 — What This Document Is

This is the **single operational source of truth** for executing the Revora project from Day 1 to App Store launch. It coordinates 8 domain-specific implementation plans into one linear execution sequence. Every team member and every AI agent reads this document before starting any work.

**This document IS:**
- The authoritative execution schedule (who does what, when, in what order)
- The decision authority for gates, blockers, and priorities
- The live project status tracker (updated weekly)
- The AI agent operating manual

**This document is NOT:**
- A product requirements document (see PRD v2.0)
- A technical specification (see Tech Spec v2.0)
- A task-level implementation guide (see domain plans)

### 0.2 — Three Audiences

| Audience | How to Use This Plan |
|----------|---------------------|
| **New Human Team Member** | Read Section 0 (this section) → Section 1 (dashboard) → find your name in Section 2 (execution sequence). You now know what phase we're in, what's done, what you own, and what's next. |
| **AI Agent (Claude, GPT, etc.)** | Read Section 0 → Section 1 → Section 7 (AI Agent Protocol). Then find your active tasks in Section 2 filtered by current week and your assigned domain. Follow Section 7 rules strictly. |
| **Founder/PM** | Read Section 1 (dashboard) daily — 60-second status check. Review Section 3 (gates) when a decision is needed. Use Section 8 (sync template) for weekly meetings. |

### 0.3 — Source of Truth Hierarchy

When documents conflict, the higher-ranked document wins:

```
[1] PRD v2.0                    ← Product intent, pricing, features, compliance
[2] Technical Specification v2.0 ← Algorithms, schemas, API contracts
[3] Master Plan v2.0 (this doc) ← Timeline, gates, team assignments, priorities
[4] Domain Plans (8 plans)      ← Task-level implementation detail
```

**Rule:** Domain plans provide HOW. This plan provides WHEN, WHO, and WHAT ORDER. If a domain plan contradicts this plan on timeline, team roles, gates, pricing, or tool choices — this plan wins.

### 0.4 — How to Determine Current Project State in 60 Seconds

1. Go to **Section 1: Project State Dashboard**
2. Read: Current Week, Current Phase, Overall Status
3. Read: Active Gate, Top 3 Blockers, Top 3 Risks
4. Read: Person A / Person B / Founder current tasks
5. You now know the project state.

### 0.5 — ID Glossary

| Prefix | Meaning | Example | Where Defined |
|--------|---------|---------|---------------|
| **STEP-XXX** | Execution sequence step (global ordering) | STEP-001 | Section 2 (this doc) |
| **DEP-XXX** | Cross-domain dependency | DEP-001 | Section 5 (this doc) |
| **BLK-XXX** | Launch blocker (must resolve before launch) | BLK-001 | Section 4 (this doc) |
| **RSK-XXX** | Risk with mitigation plan | RSK-001 | Section 6 (this doc) |
| **VAL-XXX** | Validation acceptance criterion | VAL-001 | PRD / Tech Spec |
| **GATE-X** | Project gate (GO/NO-GO decision point) | GATE-1 | Section 3 (this doc) |
| **BE-XXX** | Backend task | BE-001 | Backend Plan |
| **FE-XXX** | Frontend task | FE-001 | Frontend Plan |
| **AI-XXX** | AI/ML task | AI-001 | AI/ML Plan |
| **SC-XXX** | Security/Compliance task | SC-001 | Security/Compliance Plan |
| **DO-XXX** | DevOps task | DO-001 | DevOps Plan |
| **MON-XXX** | Monetization task | MON-001 | Monetization Plan |
| **PD-XXX** | Product/Design task | PD-001 | Product/Design Plan |
| **QA-XXX** | QA/Testing task | QA-001 | QA/Testing Plan |
| **CONFLICT-X** | Audit finding: conflict between documents | CONFLICT-1 | Appendix B |
| **GAP-X** | Audit finding: missing requirement | GAP-1 | Appendix B |
| **STRUCT-X** | Audit finding: structural/timeline issue | STRUCT-1 | Appendix B |
| **AMBIGUITY-X** | Audit finding: ambiguous specification | AMBIGUITY-1 | Appendix B |
| **SCOPE-X** | Audit finding: scope creep item | SCOPE-1 | Appendix B |
| **ADR-XXX** | Architecture Decision Record | ADR-001 | Appendix C |

### 0.6 — Status Field Definitions

All status fields in this document use these values:

| Status | Meaning |
|--------|---------|
| **NOT STARTED** | Work has not begun |
| **IN PROGRESS** | Actively being worked on |
| **DONE** | Work complete, awaiting verification |
| **VERIFIED** | Work complete AND verified by another person or automated test |
| **BLOCKED** | Cannot proceed — see blocker reference |
| **AT RISK** | On track but may slip — see risk reference |

### 0.7 — File Map: Domain Plans

| # | Domain Plan | File Path | Owner | Scope |
|---|------------|-----------|-------|-------|
| 1 | Backend | `Implementation_plans/Revora-Backend_Implmentation_Plan.md` | Person A | Rust/Axum API, PostgreSQL, Redis, OpenAI integration, scan pipeline, GDPR endpoints, RLS |
| 2 | Frontend | `Implementation_plans/Revora_Frontend_Implementation_Plan.md` | Person B | React Native/Expo, UI screens, components, state management, RevenueCat SDK |
| 3 | AI/ML | `Implementation_plans/Revora_AI_ML_Implementation_Plan v1.0.md` | Person A | GPT-4o prompts, complexity classifier, safety floors, conservative bias, confidence, accuracy validation |
| 4 | Security/Compliance | `Implementation_plans/Revora_Security_&_Compliance_Implementation_Plan_v1.0.md` | Person A + Founder | DPAs, GDPR, COPPA, FTC compliance, penetration test, App Store checklist |
| 5 | DevOps | `Implementation_plans/Revora_DevOps_Implementation_Plan_v1.0.md` | Person A | Railway.app, CI/CD, monitoring, camera spike, k6 load testing, backups |
| 6 | Monetization | `Implementation_plans/Revora_Monetization_&_Revenue_Implementation_Plan_v1.0.md` | Founder | Pricing, RevenueCat config, paywall, A/B testing, cost monitoring |
| 7 | Product/Design | `Implementation_plans/Revora_Product_Design_Implementation_Plan_v1.0.md` | Founder + Person B | Design system, Figma mockups, component specs, usability testing, accessibility audit |
| 8 | QA/Testing | `Implementation_plans/Revora_QA_&_Testing_Implementation_Plan_v1.0.md` | Person A | Test infrastructure, E2E tests, load testing, VAL validation, pentest coordination |

### 0.8 — Team Configuration

| Role | Person | Domains Owned | Hours/Day |
|------|--------|---------------|-----------|
| **Person A** | Backend/AI/DevOps/QA | Backend, AI/ML, DevOps, QA/Testing, Security (shared) | 8 focused hours |
| **Person B** | Frontend/UX | Frontend, Product/Design (implementation) | 8 focused hours |
| **Founder/PM** | Product/Legal/Business | Security/Compliance (legal), Monetization, Product/Design (specs) | 8 focused hours |

**Critical Constraint:** Person A cannot work on backend AND frontend simultaneously. Cross-domain dependencies must be explicitly sequenced.

**Pricing (Locked Week 1 — BLK-009):** $12.99/month, $99.99/year, $249.99 lifetime

**Timeline:** 15 weeks to App Store submission (per PRD §12.1)  
**Sprint Length:** 1 week  
**Buffer:** 15% added to all estimates

---

## SECTION 1: PROJECT STATE DASHBOARD

> **Updated weekly every Friday after sync meeting.**  
> **This is the fastest way to see current project status.**

| Field | Value |
|-------|-------|
| **Current Week** | 0 (Pre-development) |
| **Current Phase** | Pre-development — alignment audit complete, implementation not started |
| **Overall Status** | ✅ ON TRACK |
| **Days to Launch** | 105 (15 weeks × 7 days) |

### Active Gate

| Gate | Pass Criteria | Status |
|------|--------------|--------|
| **GATE-0: Pre-Development Ready** | All 51 audit findings resolved in domain plans, Master Plan v2.0 approved, 8 domain plans internally consistent | **IN PROGRESS** |

### Next Gate

| Gate | Week | Owner |
|------|------|-------|
| **GATE-1: Foundation Complete** | Week 2 (end) | Person A + Founder |

### Top 3 Blockers Right Now

| BLK-ID | Blocker | Status |
|--------|---------|--------|
| **BLK-002** | OpenAI DPA execution (LEGAL — cannot send user photos without DPA) | NOT STARTED — Day 1 task |
| **BLK-009** | Pricing locked ($12.99/$99.99/$249.99) across all code/UI/marketing | NOT STARTED — Day 1 task |
| **BLK-020** | Trademark search for "Revora" (2-4 week lead time) | NOT STARTED — Day 1 task |

### Top 3 Risks Right Now

| RSK-ID | Risk | Probability | Mitigation Status |
|--------|------|-------------|-------------------|
| **RSK-003** | Backend bottleneck — Person A overloaded, frontend blocked | HIGH (70%) | OPEN — API mocks strategy defined |
| **RSK-005** | App Store rejection for health claims ("reversal" language) | HIGH (70%) | OPEN — Week 1 language audit planned |
| **RSK-019** | Attorney engagement delays legal review (2-4 week lead time) | MEDIUM (40%) | OPEN — Start attorney search Day 1 |

### Team Status

| Person | Current Task | % Complete |
|--------|-------------|------------|
| **Person A** | Awaiting project start | 0% |
| **Person B** | Awaiting project start | 0% |
| **Founder/PM** | Reviewing Master Plan v2.0, approving audit fixes | 50% |

---

## SECTION 2: EXECUTION SEQUENCE — START HERE

> **This is the definitive step-by-step guide from Day 1 to App Store launch.**  
> ⚡ = Critical path step. Any slip delays launch by ≥1 week.

### STAGE 1: FOUNDATION (Weeks 1–2)

**Primary Objective:** Establish all infrastructure, lock architectural decisions, and clear legal blockers so coding can begin Week 3.  
**Entry Condition:** Master Plan v2.0 approved, all 51 audit findings resolved in domain plans.  
**Exit Condition:** GATE-1 passed — infrastructure operational, camera architecture decided, design system complete, legal blockers cleared.  
**Owner(s):** Person A (infra + backend scaffold), Person B (frontend scaffold), Founder (legal + design + pricing)  
**Domain Plans Active:** Backend, Frontend, AI/ML, Security/Compliance, DevOps, Monetization, Product/Design  
**Gate:** GATE-1 (end of Week 2)

#### Week 1 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-001 | Execute OpenAI DPA in console (self-service, GDPR Art. 28) | Founder | Security SC-001 | — | STEP-028 | BLK-002 | ⚡ | NOT STARTED |
| STEP-002 | Lock pricing: $12.99/mo, $99.99/yr, $249.99 lifetime — document in all plans | Founder | Monetization MON-001 | — | STEP-025 | BLK-009 | ⚡ | NOT STARTED |
| STEP-003 | File trademark search for "Revora" (USPTO + WIPO + EUIPO) | Founder | Security SC-030 | — | STEP-100 | BLK-020 | ⚡ | NOT STARTED |
| STEP-004 | Begin FTC attorney search (2-4 week lead time) | Founder | Security SC-006 | — | STEP-094 | BLK-019 | | NOT STARTED |
| STEP-005 | Create GitHub monorepo + secrets management + branch protection | Person A | DevOps DO-001, DO-003 | — | STEP-006, STEP-008, STEP-017 | | ⚡ | NOT STARTED |
| STEP-006 | Provision Railway PostgreSQL + Redis + Cloudflare R2 bucket | Person A | DevOps DO-005, DO-006 | STEP-005 | STEP-007, STEP-009 | | ⚡ | NOT STARTED |
| STEP-007 | Configure database backup strategy (daily automated + manual procedure) | Person A | DevOps DO-043 | STEP-006 | — | | | NOT STARTED |
| STEP-008 | Rust/Axum project scaffold + API routing + OpenAI client setup | Person A | Backend BE-001, BE-002 | STEP-005, STEP-001 | STEP-009, STEP-012 | | ⚡ | NOT STARTED |
| STEP-009 | PostgreSQL schema migrations (users, scans, food_items, a1c_logs, activities) | Person A | Backend BE-006–BE-013 | STEP-006, STEP-008 | STEP-010 | | ⚡ | NOT STARTED |
| STEP-010 | JWT auth + refresh token rotation (SEC-003) + guest auth | Person A | Backend BE-003, BE-024, BE-025 | STEP-009 | STEP-027, STEP-044 | BLK-016 | ⚡ | NOT STARTED |
| STEP-011 | Redis connection + cache scaffolding | Person A | Backend BE-004 | STEP-006 | STEP-065 | | | NOT STARTED |
| STEP-012 | Backend CI pipeline (cargo test + clippy + fmt) | Person A | DevOps DO-007 | STEP-008 | STEP-013 | | ⚡ | NOT STARTED |
| STEP-013 | Add "reversal" language grep lint to CI (blocks build on match) | Person A | DevOps DO-007 | STEP-012 | — | BLK-006, BLK-014 | ⚡ | NOT STARTED |
| STEP-014 | Lock API field naming convention (camelCase) + CI lint | Person A | Backend BE-005 | STEP-008 | STEP-027 | | ⚡ | NOT STARTED |
| STEP-015 | Define design system: color tokens (PRD §8.3), typography, spacing (4px base) | Founder | Product/Design PD-001, PD-002 | — | STEP-016, STEP-026, STEP-038 | BLK-D01 | ⚡ | NOT STARTED |
| STEP-016 | Component design specifications (button, card, input, badge) | Founder | Product/Design PD-003 | STEP-015 | STEP-038 | | ⚡ | NOT STARTED |
| STEP-017 | Expo SDK 52 init + TypeScript strict + ESLint health claims rule | Person B | Frontend FE-001 | STEP-005 | STEP-019, STEP-020, STEP-021, STEP-022 | | ⚡ | NOT STARTED |
| STEP-018 | Create RevenueCat products in dashboard (3 SKUs: monthly, annual, lifetime) | Founder | Monetization MON-002 | STEP-002 | STEP-081 | | | NOT STARTED |
| STEP-019 | Frontend CI pipeline (eslint + tsc + jest) | Person B | DevOps DO-008 | STEP-017 | — | | | NOT STARTED |
| STEP-020 | Zustand state management setup (auth, scan, dashboard, user stores) | Person B | Frontend FE-003 | STEP-017 | STEP-031, STEP-036 | | ⚡ | NOT STARTED |
| STEP-021 | Expo Router layout files (4-tab structure: Home, Scan FAB, Progress, Profile) | Person B | Frontend FE-011, FE-012 | STEP-017 | STEP-031 | | ⚡ | NOT STARTED |
| STEP-022 | PostHog React Native SDK + 6 feature flags configured | Person B | Frontend FE-010 | STEP-017 | STEP-037 | | | NOT STARTED |
| STEP-023 | App Store Connect + Google Play Console account setup | Founder | Monetization MON-001 | — | STEP-025 | | | NOT STARTED |
| STEP-024 | "Reversal" language audit: grep all docs + codebase for prohibited terms | Founder | Security SC-007 | — | — | BLK-006 | | NOT STARTED |
| STEP-025 | Configure App Store IAP products ($12.99/mo, $99.99/yr + 7-day trial, $249.99 lifetime) | Founder | Monetization MON-003, MON-004 | STEP-023, STEP-002 | STEP-081 | | | NOT STARTED |

#### Week 2 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-026 | Figma mockups: 8 core screens + Phase 2 screens (A1C, Walk, History, Insights, Export) | Founder | Product/Design PD-010 | STEP-015 | STEP-036, STEP-038, STEP-046, STEP-058 | BLK-D02 | ⚡ | NOT STARTED |
| STEP-027 | Generate mock scan API response JSON (enables FE to start UI before BE complete) | Person A | Backend (DEP-002 mock) | STEP-010, STEP-014 | STEP-046 | | ⚡ | NOT STARTED |
| STEP-028 | OpenAI API integration + master prompt v1 + complexity classifier (SIMPLE/COMPLEX_B/COMPLEX_C) | Person A | AI/ML AI-004, AI-005, AI-006 | STEP-001, STEP-008 | STEP-033, STEP-040 | | ⚡ | NOT STARTED |
| STEP-029 | Expo camera overlay spike (2-day timebox: Wed–Thu) — Managed vs Bare workflow decision | Person A + Person B | DevOps/Frontend BE-028 | STEP-017 | STEP-035 | BLK-012 | ⚡ | NOT STARTED |
| STEP-030 | Verify SCC inclusion in DPAs (Railway, OpenAI, Cloudflare) | Founder | Security SC-031 | STEP-001 | — | | | NOT STARTED |
| STEP-031 | React Navigation auth guard + deep link config | Person B | Frontend FE-013 | STEP-020, STEP-021 | STEP-044 | | | NOT STARTED |
| STEP-032 | Splash screen with brand colors + no health claims | Person B | Frontend FE-014 | STEP-017 | — | | | NOT STARTED |

**>>> GATE-1 Decision Point: End of Week 2** (see Section 3, GATE-1)

---

### STAGE 2: CORE FEATURES — SCAN PIPELINE (Weeks 3–5)

**Primary Objective:** Build the complete scan pipeline from camera capture to GL results display, including safety floors and confidence scoring.  
**Entry Condition:** GATE-1 passed. Infrastructure operational, camera architecture decided, design system + Figma complete.  
**Exit Condition:** Scan API endpoint live, frontend scan UI rendering real results from backend.  
**Owner(s):** Person A (scan pipeline backend), Person B (scan UI + onboarding)  
**Domain Plans Active:** Backend, Frontend, AI/ML, Product/Design, QA  
**Gate:** None (continuous delivery)

#### Week 3 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-033 | Safety floor post-processing (6 categories per PRD §6.2, Levenshtein ≤2) | Person A | Backend BE-038, AI/ML AI-008 | STEP-028 | STEP-041 | BLK-010 | ⚡ | NOT STARTED |
| STEP-034 | Scan API endpoint scaffold (POST /api/v1/scan) + pHash caching + R2 image upload | Person A | Backend BE-032, BE-033, BE-035 | STEP-009, STEP-028 | STEP-042 | | ⚡ | NOT STARTED |
| STEP-035 | Camera screen + plate calibration overlay + scan mode toggle | Person B | Frontend FE-028, FE-029, FE-030 | STEP-029 (camera decision) | STEP-051 | | ⚡ | NOT STARTED |
| STEP-036 | Onboarding flow: 6 screens (Welcome, A1C, Goal, Dietary, GL Education, Age Gate + Consent) | Person B | Frontend FE-015–FE-022 | STEP-026 (Figma), STEP-020 | STEP-047 | BLK-007 | ⚡ | NOT STARTED |
| STEP-037 | EU analytics consent banner (detect EU timezone, conditionally init PostHog) | Person B | Frontend FE-010b | STEP-022 | — | | | NOT STARTED |
| STEP-038 | Component library: Button + Card (with design system tokens) | Person B | Frontend components, PD-015, PD-016 | STEP-015, STEP-016 | STEP-043 | BLK-D03 (partial) | | NOT STARTED |
| STEP-039 | VAL test coverage matrix: map VAL-001–VAL-030 to QA tasks | Person A | QA QA-042 | — | — | | | NOT STARTED |

#### Week 4 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-040 | Conservative bias correction (HIGH: 1.0×, MEDIUM: 1.10×, LOW: 1.20×) | Person A | Backend BE-039 | STEP-028 | STEP-041 | BLK-015 | ⚡ | NOT STARTED |
| STEP-041 | Confidence scoring logic (HIGH/MEDIUM/LOW based on complexity + certainty + overrides) | Person A | Backend BE-040, AI/ML AI-013 | STEP-033, STEP-040 | STEP-042 | | ⚡ | NOT STARTED |
| STEP-042 | Full scan pipeline integration: classifier → GPT-4o → safety floor → bias → confidence → response | Person A | Backend BE-037 | STEP-034, STEP-041 | STEP-045, STEP-048, STEP-051 | | ⚡ | NOT STARTED |
| STEP-043 | Component library complete: Input + Badge (with design system tokens) | Person B | Frontend components, PD-017, PD-018 | STEP-038 | STEP-044, STEP-046, STEP-053 | BLK-D03 | | NOT STARTED |
| STEP-044 | Auth screens (login, register, forgot password) connected to backend API | Person B | Frontend FE-023, FE-024 | STEP-010, STEP-020, STEP-031, STEP-043 | — | | | NOT STARTED |

#### Week 5 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-045 | Food sequencing logic + swap generation + dietary restriction filtering | Person A | Backend BE-043, BE-044, BE-045 | STEP-042 | STEP-057 | | ⚡ | NOT STARTED |
| STEP-046 | Scan results UI: GL banner + food breakdown + editable portions + GL range display | Person B | Frontend FE-033, FE-033a, FE-033b | STEP-027 (mock), STEP-043 | STEP-051 | | ⚡ | NOT STARTED |
| STEP-047 | Onboarding design QA — verify all 6 screens match Figma specs | Person B | Product/Design | STEP-036 | — | | | NOT STARTED |

---

### STAGE 3: CORE FEATURES — DASHBOARD + A1C (Weeks 6–8)

**Primary Objective:** Build dashboard, A1C tracking, post-meal actions, and achieve first end-to-end scan in staging.  
**Entry Condition:** Scan pipeline operational, frontend scan UI rendering results.  
**Exit Condition:** GATE-2 passed — first end-to-end scan working in staging, usability testing complete.  
**Owner(s):** Person A (dashboard API + A1C + walk), Person B (dashboard UI + A1C UI)  
**Domain Plans Active:** Backend, Frontend, AI/ML, Product/Design, QA  
**Gate:** GATE-2 (end of Week 8)

#### Week 6 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-048 | Daily GL dashboard API (GET /api/v1/dashboard/today) + streak calculation | Person A | Backend BE-048 | STEP-042 | STEP-049, STEP-053, STEP-055 | | ⚡ | NOT STARTED |
| STEP-049 | Midnight GL reset cron job (timezone-aware) | Person A | Backend BE-049, BE-049b | STEP-048 | — | | | NOT STARTED |
| STEP-050 | Privacy Policy: full attorney-drafted version live | Founder | Security SC-009 | STEP-004 | STEP-069, STEP-072 | | | NOT STARTED |
| STEP-051 | Connect scan results UI to live backend API (replace mocks) | Person B | Frontend FE-033 | STEP-042, STEP-046 | STEP-053 | | ⚡ | NOT STARTED |
| STEP-052 | CCPA "Do Not Sell" toggle in Profile → Settings → Privacy | Person B | Frontend FE-090 | STEP-021 | — | | | NOT STARTED |
| STEP-053 | Dashboard screen: GL gauge + meal timeline + streak counter | Person B | Frontend FE-041, FE-042, FE-043 | STEP-048, STEP-043, STEP-051 | STEP-060, STEP-062, STEP-077 | | ⚡ | NOT STARTED |
| STEP-054 | Scan corrections endpoint (POST /api/v1/scan/corrections) | Person A | Backend BE-047 | STEP-042 | STEP-082 | | | NOT STARTED |

#### Week 7 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-055 | A1C estimation algorithm (Spec §4.2.5 continuous daily-change formula, Rust implementation) | Person A | Backend BE-050 | STEP-048 | STEP-056, STEP-060 | | ⚡ | NOT STARTED |
| STEP-056 | A1C encryption at rest + manual A1C logging endpoint (POST /api/v1/a1c) | Person A | Backend BE-051, BE-052 | STEP-055 | STEP-060 | | | NOT STARTED |
| STEP-057 | Scan results advice cards: sequencing, swaps, post-meal walk (Premium gated) | Person B | Frontend FE-033c, FE-033d | STEP-045, STEP-051 | — | | | NOT STARTED |
| STEP-058 | Paywall UI: 3 tiers ($12.99/mo, $99.99/yr + 7-day trial, $249.99 lifetime) | Person B | Frontend FE-060 | STEP-043, STEP-026 | STEP-087 | | | NOT STARTED |

#### Week 8 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-059 | Post-meal walk API: /walk/start + /walk/complete + push notification scheduler | Person A | Backend BE-057, BE-058, BE-059 | STEP-048 | STEP-067 | | | NOT STARTED |
| STEP-060 | A1C progress screen + chart + manual A1C form + ±0.2 bounds disclaimer on EVERY display | Person B | Frontend FE-045, FE-046 | STEP-055, STEP-056, STEP-053 | STEP-062 | BLK-013 | ⚡ | NOT STARTED |
| STEP-061 | Guest mode E2E test (3 scans → conversion → data preserved) | Person A | QA QA-040 | STEP-010, STEP-042 | — | | | NOT STARTED |
| STEP-062 | Usability testing: 5 beta testers, SUS score ≥70, findings documented | Founder + Person B | Product/Design PD-020 | STEP-053, STEP-060 | STEP-066 | | | NOT STARTED |
| STEP-063 | **DRY-RUN: 50-meal accuracy test** (early signal for Week 14 VAL-001 gate) | Person A | AI/ML AI-025 | STEP-042 | STEP-070 | | ⚡ | NOT STARTED |

**>>> GATE-2 Decision Point: End of Week 8** (see Section 3, GATE-2)

---

### STAGE 4: VALUE-ADD + COMPLIANCE (Weeks 9–12)

**Primary Objective:** GDPR compliance, meal history, premium features, educational content, accessibility, and RevenueCat configuration.  
**Entry Condition:** GATE-2 passed. First E2E scan working, usability testing complete.  
**Exit Condition:** All compliance tasks done, RLS applied, GDPR endpoints live, accessibility audit passed, RevenueCat products configured.  
**Owner(s):** Person A (GDPR + RLS + articles API), Person B (GDPR UI + premium features), Founder (DPIA + CCPA + breach plan)  
**Domain Plans Active:** All 8  
**Gate:** Leads into GATE-3 (Week 13)

#### Week 9 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-064 | GDPR data export endpoint (GET /api/v1/user/export, <10s response) | Person A | Backend BE-062 | STEP-009 | STEP-068, STEP-076 | BLK-008 (partial) | ⚡ | NOT STARTED |
| STEP-065 | Rate limiting: Redis token bucket (free=5/day, premium=100/day) | Person A | Backend BE-044 | STEP-011 | STEP-073 | BLK-017 | | NOT STARTED |
| STEP-066 | Design iteration: fix P1 usability issues from Week 8 testing | Person B | Frontend + Product/Design | STEP-062 | — | | | NOT STARTED |
| STEP-067 | Walk timer screen + notification handler + completion tracking | Person B | Frontend FE-047, FE-048 | STEP-059 | — | | | NOT STARTED |

#### Week 10 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-068 | GDPR deletion: soft-delete + 30-day purge cron + photo cleanup job | Person A | Backend BE-063, BE-064, BE-065 | STEP-064 | STEP-076 | BLK-008 | ⚡ | NOT STARTED |
| STEP-069 | GDPR DPIA documented (Data Protection Impact Assessment) | Founder | Security SC-013 | STEP-050 | STEP-100 | BLK-003 | ⚡ | NOT STARTED |
| STEP-070 | AI prompt iteration based on Week 8 dry-run results (improve accuracy toward ≥85%) | Person A | AI/ML AI-026 | STEP-063 | STEP-092 | | ⚡ | NOT STARTED |
| STEP-071 | Meal history screen + search + filter + 7-day free tier gate | Person B | Frontend FE-050, FE-051 | STEP-053, STEP-065 | — | | | NOT STARTED |
| STEP-072 | CCPA compliance implementation (Do Not Sell link, Privacy Policy update, opt-out) | Founder | Security SC-032 | STEP-050 | — | | | NOT STARTED |
| STEP-073 | Free tier scan limit UX (X-Scans-Remaining header display, paywall trigger) | Person B | Frontend FE-035 | STEP-065 | — | | | NOT STARTED |

#### Week 11 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-074 | RLS policies on ALL user-data tables (users, scans, food_items, a1c_logs, activities) | Person A | Backend BE-055 | STEP-009 | STEP-075, STEP-093 | BLK-018 | ⚡ | NOT STARTED |
| STEP-075 | SQL injection audit (parameterized queries verified across all endpoints) | Person A | Backend BE-056 | STEP-074 | STEP-093 | | | NOT STARTED |
| STEP-076 | GDPR export button + account deletion flow in UI | Person B | Frontend FE-057, FE-058 | STEP-064, STEP-068 | STEP-089 | | ⚡ | NOT STARTED |
| STEP-077 | Accessibility audit (WCAG AA: contrast ratios, touch targets ≥44px, screen readers) | Person B | Product/Design PD-025 | STEP-053, STEP-060 | STEP-089 | BLK-D04 | ⚡ | NOT STARTED |
| STEP-078 | Weekly insights screen + pattern cards (Premium) + educational content | Person B | Frontend FE-052, FE-053 | STEP-053 | — | | | NOT STARTED |

#### Week 12 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-079 | Educational articles API + seed data (20 articles, RD-reviewed) | Person A | Backend BE-070 | STEP-009 | — | | | NOT STARTED |
| STEP-080 | Profile screen + settings + dietary profile editor | Person B | Frontend FE-054, FE-055 | STEP-043 | — | | | NOT STARTED |
| STEP-081 | RevenueCat product configuration verified (all 3 SKUs: $12.99/$99.99/$249.99) | Founder | Monetization MON-007 | STEP-018, STEP-025 | STEP-085 | | ⚡ | NOT STARTED |
| STEP-082 | Scan correction review process: feed user corrections into prompt iteration | Person A | AI/ML AI-033 | STEP-054, STEP-070 | — | | | NOT STARTED |
| STEP-083 | Data breach response plan documented (docs/BREACH-RESPONSE-PLAN.md) | Founder | Security SC-033 | STEP-069 | — | | | NOT STARTED |
| STEP-084 | Survey endpoint (POST /api/v1/user/survey) | Person A | Backend BE-072 | STEP-009 | — | | | NOT STARTED |

---

### STAGE 5: MONETIZATION + BETA (Weeks 13–14)

**Primary Objective:** RevenueCat integration, design QA, accuracy validation, penetration test, and beta testing.  
**Entry Condition:** All compliance tasks done, RLS applied, GDPR endpoints live, accessibility audit passed.  
**Exit Condition:** GATE-4 passed — accuracy ≥85%, pentest Critical/High resolved, RevenueCat lifecycle tested.  
**Owner(s):** Person A (webhook + accuracy + pentest), Person B (SDK + paywall + beta), Founder (FTC sign-off)  
**Domain Plans Active:** All 8  
**Gate:** GATE-3 (Week 13), GATE-4 (Week 14)

#### Week 13 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-085 | RevenueCat webhook endpoint (subscription.purchased, .renewed, .cancelled, .expired) | Person A | Backend BE-073 | STEP-081 | STEP-086 | | ⚡ | NOT STARTED |
| STEP-086 | Subscription entitlement verification + grace period logic (server-side enforcement) | Person A | Backend BE-074 | STEP-085 | STEP-087 | | ⚡ | NOT STARTED |
| STEP-087 | RevenueCat SDK integration + paywall modal (3 tiers) + feature gating + purchase flow | Person B | Frontend FE-059–FE-063 | STEP-086, STEP-058 | STEP-088 | BLK-011 | ⚡ | NOT STARTED |
| STEP-088 | RevenueCat lifecycle test: purchase → renew → cancel → expire → restore | Both | QA QA-030 | STEP-087 | STEP-092 | BLK-011 | ⚡ | NOT STARTED |
| STEP-089 | Design QA gate: ALL screens match Figma, zero P0 visual issues | Founder + Person B | Product/Design PD-030 | STEP-076, STEP-077, STEP-087 | STEP-095 | BLK-D05 | ⚡ | NOT STARTED |
| STEP-090 | k6 load test: 100 VUs, 5-min duration, P95 <3s (PER-001) | Person A | DevOps DO-035 | STEP-042 | STEP-096 | | | NOT STARTED |
| STEP-091 | Secrets audit (no hardcoded secrets in code, all rotated for production) | Person A | DevOps DO-032 | — | STEP-098 | | | NOT STARTED |

**>>> GATE-3 Decision Point: End of Week 13** (see Section 3, GATE-3)

#### Week 14 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-092 | **VAL-001: 100-meal accuracy validation (≥85% spike risk accuracy)** | Person A | AI/ML AI-028 | STEP-070, STEP-042 | STEP-098 | BLK-001 | ⚡ | NOT STARTED |
| STEP-093 | Penetration test: provide vendor access, triage findings, remediate all Critical/High | Person A + Vendor | Security SC-024, QA QA-041 | STEP-074, STEP-075 | STEP-098 | BLK-004 | ⚡ | NOT STARTED |
| STEP-094 | FTC attorney final sign-off on ALL health claims in app + marketing | Founder | Security SC-006 | STEP-004, STEP-050 | STEP-100 | BLK-019 | ⚡ | NOT STARTED |
| STEP-095 | Beta testing: 100 users, crash-free ≥99.5%, zero P0 bugs | Person B | QA QA-035 | STEP-087, STEP-089 | STEP-098 | | ⚡ | NOT STARTED |
| STEP-096 | Production deployment runbook documented + tested in staging | Person A | DevOps DO-042 | STEP-090 | STEP-098 | | | NOT STARTED |
| STEP-097 | Query optimization pass (slow query log analysis, index tuning) | Person A | Backend BE-075 | STEP-090 | — | | | NOT STARTED |

**>>> GATE-4 Decision Point: End of Week 14** (see Section 3, GATE-4)

---

### STAGE 6: LAUNCH (Week 15)

**Primary Objective:** Production deploy, App Store submission, go live.  
**Entry Condition:** GATE-4 passed. Accuracy ≥85%, pentest resolved, RevenueCat tested, FTC sign-off complete.  
**Exit Condition:** GATE-5 passed — App Store submission complete, monitoring active.  
**Owner(s):** All  
**Domain Plans Active:** All  
**Gate:** GATE-5 (Week 15)

#### Week 15 Steps

| Step | Task | Owner | Domain Plan | Depends On | Unlocks | BLK | ⚡ | Status |
|------|------|-------|-------------|------------|---------|-----|---|--------|
| STEP-098 | Production deploy to Railway (backend + workers) | Person A | DevOps DO-039 | STEP-091, STEP-092, STEP-093, STEP-095, STEP-096 | STEP-099 | | ⚡ | NOT STARTED |
| STEP-099 | Sentry + PostHog production monitoring setup | Person A | DevOps DO-040 | STEP-098 | STEP-101 | | ⚡ | NOT STARTED |
| STEP-100 | App Store pre-submission checklist: Privacy Policy live, Terms live, screenshots, metadata, trademark clear | Founder | Security SC-028 | STEP-003, STEP-069, STEP-094 | STEP-101 | BLK-005 | ⚡ | NOT STARTED |
| STEP-101 | App Store + Play Store build submission | Person B | DevOps DO-041 | STEP-099, STEP-100 | STEP-102 | | ⚡ | NOT STARTED |
| STEP-102 | Go-live monitoring rotation (first 72 hours, 8-hour shifts) | Person A | DevOps DO-040 | STEP-101 | — | | ⚡ | NOT STARTED |
| STEP-103 | Hotfix readiness: rollback procedure tested, on-call rotation confirmed | Person A | DevOps DO-037 | STEP-098 | — | | | NOT STARTED |

**>>> GATE-5 Decision Point: Week 15** (see Section 3, GATE-5)

---

### CRITICAL PATH OVERLAY

Steps marked with ⚡ form the critical path. The full critical path sequence:

```
STEP-001 (OpenAI DPA) ─┐
STEP-005 (Monorepo) ────┤
                        ├→ STEP-008 (Rust scaffold) → STEP-009 (DB) → STEP-010 (Auth)
                        │                                              ↓
STEP-015 (Design sys) ──┼→ STEP-026 (Figma) → STEP-036 (Onboarding)  STEP-027 (API mock)
                        │                                              ↓
STEP-017 (Expo init) ───┤  STEP-028 (OpenAI) → STEP-033 (Safety floors) → STEP-040 (Bias)
                        │                                                    ↓
                        │  STEP-034 (Scan API) ← ← ← ← ← ← ← ← STEP-041 (Confidence)
                        │       ↓                                    ↓
                        │  STEP-042 (Full pipeline) → STEP-045 (Sequencing) → STEP-051 (FE↔BE)
                        │       ↓                                                  ↓
                        │  STEP-048 (Dashboard API) → STEP-055 (A1C) → STEP-053 (Dashboard UI)
                        │       ↓                        ↓                  ↓
                        │  STEP-063 (50-meal dry-run)  STEP-060 (A1C UI)  STEP-062 (Usability)
                        │       ↓
                        │  STEP-070 (Prompt iteration) → STEP-064 (GDPR export) → STEP-068 (GDPR delete)
                        │                                    ↓
                        │  STEP-074 (RLS) → STEP-076 (GDPR UI) → STEP-077 (Accessibility)
                        │                                              ↓
                        │  STEP-081 (RevenueCat config) → STEP-085 (Webhook) → STEP-086 (Entitlements)
                        │                                    ↓
                        │  STEP-087 (RevenueCat SDK) → STEP-088 (Lifecycle test) → STEP-089 (Design QA)
                        │       ↓
                        │  STEP-092 (VAL-001 accuracy) → STEP-093 (Pentest) → STEP-095 (Beta)
                        │       ↓
                        └→ STEP-098 (Deploy) → STEP-099 (Monitoring) → STEP-101 (Submit) → LAUNCH ✅
```

**Total steps in execution sequence:** 103  
**Critical path steps:** 38 (marked ⚡)  
**Any slip on a ⚡ step delays launch by ≥1 week.**

---

### PARALLEL WORK MAP (Week-by-Week)

| Week | Person A (Backend/AI/DevOps) | Person B (Frontend/UX) | Founder/PM | Cannot Parallelize |
|------|------------------------------|------------------------|------------|-------------------|
| **1** | STEP-005→006→007→008→009→010→011→012→013→014 | STEP-017→019→020→021→022→031→032 | STEP-001→002→003→004→015→016→023→024→025 | STEP-001 before STEP-008; STEP-005 before STEP-017 |
| **2** | STEP-027→028→029 | STEP-029 (spike collab)→038 | STEP-026→030→018 | STEP-029 requires A+B; STEP-026 before STEP-036 |
| **3** | STEP-033→034→039 | STEP-035→036→037→038(cont.) | — | STEP-028 before STEP-033 |
| **4** | STEP-040→041→042 | STEP-043→044 | — | STEP-040→041→042 must be sequential |
| **5** | STEP-045 | STEP-046→047 | — | STEP-042 before STEP-045 and STEP-046 |
| **6** | STEP-048→049→054 | STEP-051→052→053 | STEP-050 | STEP-042 before STEP-051 |
| **7** | STEP-055→056 | STEP-057→058 | — | STEP-048 before STEP-055 |
| **8** | STEP-059→061→063 | STEP-060 | STEP-062 | STEP-063 dry-run needs STEP-042 done |
| **9** | STEP-064→065 | STEP-066→067 | — | All parallel safe |
| **10** | STEP-068→070 | STEP-071→073 | STEP-069→072 | STEP-064 before STEP-068 |
| **11** | STEP-074→075 | STEP-076→077→078 | — | STEP-068 before STEP-076 |
| **12** | STEP-079→082→084 | STEP-080 | STEP-081→083 | STEP-081 before STEP-085 |
| **13** | STEP-085→086→090→091 | STEP-087→088→089 | STEP-089 (review) | STEP-085 before STEP-087 |
| **14** | STEP-092→093→096→097 | STEP-095 | STEP-094 | STEP-092 is GATE-4 critical |
| **15** | STEP-098→099→102→103 | STEP-101 | STEP-100 | STEP-098→099 before STEP-101; STEP-100 before STEP-101 |

---

## SECTION 3: GATE DECISION FRAMEWORK

> **How to make GO / NO-GO decisions — for humans and AI agents.**  
> There are 5 project gates. Each gate is a hard decision point. No gate can be skipped.

---

### GATE-1: Foundation Complete

| Field | Value |
|-------|-------|
| **Trigger** | End of Week 2 (Friday sync) |
| **Decision Owner** | Founder/PM |
| **Current Status** | NOT REACHED |

**Pass Criteria (ALL must be true):**
- ✅ BLK-002 DONE: OpenAI DPA executed and confirmed in console
- ✅ BLK-009 DONE: Pricing locked ($12.99/$99.99/$249.99) documented in all plans
- ✅ BLK-012 DONE: Camera architecture decision made (Managed or Bare), documented in ADR-002
- ✅ BLK-D01 DONE: Design system defined (docs/DESIGN-TOKENS.md complete, CSS variables exported)
- ✅ BLK-D02 DONE: Figma mockups complete (8 core screens + Phase 2 screens, light/dark mode)
- ✅ BLK-006 DONE: "Reversal" language grep audit passes (zero matches in codebase)
- ✅ BLK-014 DONE: CI pipeline blocks builds containing "reversal" language
- ✅ BLK-016 DONE: JWT auth + refresh token rotation operational
- ✅ STEP-009 DONE: PostgreSQL schema migrations applied successfully
- ✅ STEP-014 DONE: API field naming convention (camelCase) locked and enforced by CI
- ✅ STEP-027 DONE: Mock scan API response JSON available for frontend

**Fail Criteria (ANY of these = NO-GO):**
- ❌ OpenAI DPA not executed (BLK-002 still NOT STARTED or IN PROGRESS)
- ❌ Camera spike inconclusive AND no fallback decision made
- ❌ Design system not defined (no tokens document for Person B to consume)
- ❌ PostgreSQL schema not applied (backend cannot start scan pipeline)

**If NO-GO:**
1. Identify which criteria failed
2. Extend Stage 1 by up to 3 days (hard limit)
3. If DPA is the blocker: escalate to OpenAI support immediately
4. If camera spike failed: default to Managed workflow (safer choice) and proceed
5. If design system incomplete: Founder prioritizes this above all other tasks
6. Re-evaluate at mid-Week 3 (Tuesday). If still NO-GO, launch timeline shifts +1 week.

**If GO:**
- Unlocks: All Stage 2 steps (STEP-033 through STEP-047)
- Person A begins scan pipeline (STEP-033, STEP-034)
- Person B begins onboarding + camera screen (STEP-035, STEP-036)

**AI Agent Instruction:** Before starting any Stage 2 task, verify all GATE-1 criteria are DONE. If any criterion is NOT DONE, do not proceed — flag as blocker per Section 4.

---

### GATE-2: First End-to-End Scan + Usability

| Field | Value |
|-------|-------|
| **Trigger** | End of Week 8 (Friday sync) |
| **Decision Owner** | Founder/PM |
| **Current Status** | NOT REACHED |

**Pass Criteria (ALL must be true):**
- ✅ STEP-042 DONE: Full scan pipeline operational (photo → classifier → GPT-4o → safety floor → bias → confidence → response)
- ✅ STEP-051 DONE: Frontend scan results connected to live backend API (not mocks)
- ✅ STEP-053 DONE: Dashboard screen rendering real data from backend
- ✅ STEP-060 DONE: A1C progress screen showing estimates with ±0.2 bounds on EVERY display
- ✅ STEP-063 DONE: 50-meal dry-run accuracy test completed (results documented)
- ✅ STEP-062 DONE: Usability testing complete (5 testers, SUS score ≥70)
- ✅ BLK-007 DONE: COPPA age gate implemented and tested
- ✅ BLK-013 DONE: A1C ±0.2 bounds disclaimer on every A1C display
- ✅ BLK-015 DONE: Conservative bias correction implemented and verified

**Fail Criteria (ANY of these = NO-GO):**
- ❌ Scan pipeline not producing valid GL estimates (STEP-042 not DONE)
- ❌ 50-meal dry-run accuracy <70% (severe accuracy problem — needs major prompt rework)
- ❌ SUS score <60 (fundamental usability issues requiring significant redesign)
- ❌ A1C bounds disclaimer missing from any display (BLK-013 liability risk)

**If NO-GO:**
1. If accuracy <70%: Allocate Weeks 9-10 exclusively to prompt iteration. Delay GDPR work by 1 week. Re-test at Week 10.
2. If SUS <60: Schedule emergency design sprint (3 days). Founder + Person B focused on top 3 usability issues.
3. If pipeline incomplete: Person A drops all non-critical tasks, focuses solely on pipeline completion.
4. Maximum extension: 1 week. If still NO-GO at Week 9, launch timeline shifts +2 weeks.

**If GO:**
- Unlocks: All Stage 4 steps (STEP-064 through STEP-084)
- Person A begins GDPR endpoints (STEP-064)
- Person A continues prompt iteration using dry-run results (STEP-070)
- Person B begins design iteration from usability findings (STEP-066)

**AI Agent Instruction:** Check STEP-063 dry-run results. If accuracy <85%, flag RSK-002/RSK-007 as TRIGGERED and recommend increased prompt iteration effort in Weeks 9-12.

---

### GATE-3: Monetization + Design QA Ready

| Field | Value |
|-------|-------|
| **Trigger** | End of Week 13 (Friday sync) |
| **Decision Owner** | Founder/PM |
| **Current Status** | NOT REACHED |

**Pass Criteria (ALL must be true):**
- ✅ BLK-011 DONE: RevenueCat lifecycle tested (purchase, renew, cancel, expire, restore all working)
- ✅ BLK-D05 DONE: Design QA gate passed (all screens match Figma, zero P0 visual issues)
- ✅ BLK-D04 DONE: Accessibility audit passed (WCAG AA compliance verified)
- ✅ BLK-008 DONE: GDPR export + deletion endpoints functional
- ✅ BLK-018 DONE: RLS policies applied to all user-data tables
- ✅ STEP-085 DONE: RevenueCat webhook endpoint live
- ✅ STEP-087 DONE: RevenueCat SDK integrated with paywall
- ✅ STEP-089 DONE: Design QA review complete

**Fail Criteria (ANY of these = NO-GO):**
- ❌ RevenueCat purchase flow broken (users cannot subscribe)
- ❌ P0 visual defects remain (screenshots not App Store ready)
- ❌ GDPR endpoints not functional (cannot launch in EU)
- ❌ RLS not applied (security vulnerability — cross-user data access possible)

**If NO-GO:**
1. If RevenueCat broken: Person A + Person B pair debug, target 48-hour fix
2. If design P0 issues: Person B has 3 days to resolve. Founder reviews daily.
3. If GDPR/RLS incomplete: Person A prioritizes above all else. No beta without GDPR.
4. Maximum extension: 3 days into Week 14. Beta testing can start with resolved items.

**If GO:**
- Unlocks: All Stage 5 Week 14 steps (STEP-092 through STEP-097)
- Person A begins accuracy validation (STEP-092)
- Person B begins beta testing (STEP-095)
- Vendor begins penetration test (STEP-093)

**AI Agent Instruction:** Verify all BLK items listed above are DONE before allowing any Week 14 task to begin.

---

### GATE-4: Launch Readiness

| Field | Value |
|-------|-------|
| **Trigger** | End of Week 14 (Friday sync) |
| **Decision Owner** | Founder/PM (final authority) |
| **Current Status** | NOT REACHED |

**Pass Criteria (ALL must be true):**
- ✅ BLK-001 DONE: VAL-001 accuracy ≥85% on 100-meal validation set
- ✅ BLK-004 DONE: Penetration test complete, all Critical/High findings resolved
- ✅ BLK-019 DONE: FTC attorney final sign-off on all health claims
- ✅ BLK-020 DONE: Trademark search complete, no conflicts found
- ✅ BLK-003 DONE: GDPR DPIA documented
- ✅ STEP-095 DONE: Beta testing (100 users), crash-free ≥99.5%, zero P0 bugs
- ✅ STEP-090 DONE: k6 load test passed (P95 <3s at 100 VUs)
- ✅ STEP-096 DONE: Production deployment runbook documented and tested

**Fail Criteria (ANY of these = NO-GO):**
- ❌ VAL-001 accuracy <85% (non-negotiable — safety-critical threshold)
- ❌ Pentest Critical findings unresolved (security risk too high)
- ❌ FTC attorney has not signed off (legal risk for health claims)
- ❌ Trademark conflict discovered (cannot launch under "Revora" name)
- ❌ Crash-free rate <99% (app stability insufficient for public launch)

**If NO-GO:**
1. If accuracy <85%: Extended prompt iteration sprint (1 week). Re-test at Week 15. Launch delays +1 week.
2. If pentest Critical unresolved: Person A focuses exclusively on remediation. Re-test within 72 hours.
3. If FTC not signed off: Founder escalates directly. Consider soft launch without marketing while awaiting sign-off.
4. If trademark conflict: Emergency legal consultation. Evaluate rename vs. challenge. Potential launch delay +4 weeks.
5. If crash-free <99%: Person B triages crashes, 48-hour fix sprint. Re-test with 50-user cohort.

**If GO:**
- Unlocks: All Stage 6 steps (STEP-098 through STEP-103)
- Person A begins production deploy (STEP-098)
- Founder completes App Store checklist (STEP-100)

**AI Agent Instruction:** This is the most critical gate. Do NOT proceed to any Stage 6 task unless ALL criteria are verified DONE. If any criterion fails, immediately escalate to Founder with full details.

---

### GATE-5: App Store Submission

| Field | Value |
|-------|-------|
| **Trigger** | Week 15 (after production deploy verified) |
| **Decision Owner** | Founder/PM |
| **Current Status** | NOT REACHED |

**Pass Criteria (ALL must be true):**
- ✅ BLK-005 DONE: App Store pre-submission checklist complete (Privacy Policy live, Terms live, screenshots, metadata)
- ✅ STEP-098 DONE: Production backend deployed and healthy
- ✅ STEP-099 DONE: Sentry + PostHog monitoring active in production
- ✅ STEP-100 DONE: All App Store metadata submitted (descriptions, keywords, screenshots, privacy labels)
- ✅ STEP-103 DONE: Rollback procedure tested, on-call rotation confirmed
- ✅ All pricing correct in production: $12.99/month, $99.99/year, $249.99 lifetime

**Fail Criteria (ANY of these = NO-GO):**
- ❌ Production backend not healthy (health check endpoint failing)
- ❌ Monitoring not active (blind to production issues)
- ❌ App Store metadata incomplete (will be rejected by Apple review)
- ❌ Pricing mismatch between App Store and backend (users charged wrong amount)

**If NO-GO:**
1. Fix the specific failing item (typically <24 hours for metadata/monitoring issues)
2. Re-verify and submit same day if possible
3. No launch timeline impact expected (App Store review takes 1-3 days anyway)

**If GO:**
- Person B submits to App Store + Play Store (STEP-101)
- Person A begins 72-hour monitoring rotation (STEP-102)
- **LAUNCH ✅**

**AI Agent Instruction:** After submission, monitor for App Store review feedback. If rejected, document rejection reason and escalate to Founder immediately.

---

## SECTION 4: BLOCKER MANAGEMENT PROTOCOL

### Part A — Blocker Registry

> **Live status updated weekly. "NOT STARTED" → "IN PROGRESS" → "DONE" → "VERIFIED"**

| ID | Blocker | Domain | Owner | Target Week | Resolves At | Status | Last Updated |
|----|---------|--------|-------|-------------|-------------|--------|--------------|
| BLK-001 | VAL-001: ≥85% spike risk accuracy on 100-meal validation set | AI/ML | Person A | W14 | GATE-4 | NOT STARTED | — |
| BLK-002 | OpenAI DPA executed (Data Processing Agreement, GDPR Art. 28) | Compliance | Founder | W1 | GATE-1 | NOT STARTED | — |
| BLK-003 | GDPR DPIA documented (Data Protection Impact Assessment) | Compliance | Founder | W10 | GATE-4 | NOT STARTED | — |
| BLK-004 | Penetration test complete — all Critical/High findings resolved | Security | Vendor + Person A | W14 | GATE-4 | NOT STARTED | — |
| BLK-005 | App Store pre-submission checklist complete | Compliance | Founder | W15 | GATE-5 | NOT STARTED | — |
| BLK-006 | ALL "reversal" language removed from codebase (grep audit passes) | Compliance | Both | W1 | GATE-1 | NOT STARTED | — |
| BLK-007 | COPPA age gate implemented and tested (users <13 blocked) | Backend+Frontend | Both | W3 | GATE-2 | NOT STARTED | — |
| BLK-008 | GDPR export + deletion endpoints functional (<10s export, 30-day purge) | Backend | Person A | W10 | GATE-3 | NOT STARTED | — |
| BLK-009 | Pricing locked ($12.99/$99.99/$249.99) across all code, UI, marketing | Monetization | Founder | W1 | GATE-1 | NOT STARTED | — |
| BLK-010 | Safety floor overrides tested for all 6 food categories (PRD §6.2, 100% coverage) | AI/ML | Person A | W3 | GATE-4 | NOT STARTED | — |
| BLK-011 | RevenueCat subscription lifecycle tested (purchase, renew, cancel, expire, restore) | Monetization | Both | W13 | GATE-3 | NOT STARTED | — |
| BLK-012 | Camera overlay + Managed/Bare workflow decision confirmed (2-day spike Week 2) | DevOps | Person A + Person B | W2 | GATE-1 | NOT STARTED | — |
| BLK-013 | A1C estimation with ±0.2 bounds on EVERY display (liability protection) | Backend+Frontend | Both | W8 | GATE-2 | NOT STARTED | — |
| BLK-014 | CI/CD pipeline enforces no "reversal" language (grep lint fails build) | DevOps | Person A | W1 | GATE-1 | NOT STARTED | — |
| BLK-015 | Conservative bias correction implemented (MEDIUM: ×1.10, LOW: ×1.20) | Backend/AI | Person A | W4 | GATE-2 | NOT STARTED | — |
| BLK-016 | One-time-use refresh token rotation (SEC-003 — replay revokes all tokens) | Backend | Person A | W1 | GATE-1 | NOT STARTED | — |
| BLK-017 | Rate limiting enforced server-side (free=5/day, premium=100/day) | Backend | Person A | W9 | GATE-3 | NOT STARTED | — |
| BLK-018 | RLS policies applied to ALL user-data tables | Backend | Person A | W11 | GATE-3 | NOT STARTED | — |
| **BLK-019** | **FTC health claims attorney final sign-off** | **Compliance** | **Founder** | **W14** | **GATE-4** | **NOT STARTED** | **—** |
| **BLK-020** | **Trademark search complete for "Revora", no conflicts (USPTO+WIPO+EUIPO)** | **Compliance** | **Founder** | **W3** | **GATE-4** | **NOT STARTED** | **—** |
| BLK-D01 | Design system defined (colors, typography, spacing in docs/DESIGN-TOKENS.md) | Product/Design | Founder | W1 | GATE-1 | NOT STARTED | — |
| BLK-D02 | Figma mockups complete (8 core + Phase 2 screens, light/dark mode) | Product/Design | Founder | W2 | GATE-1 | NOT STARTED | — |
| BLK-D03 | Component library implemented (button, card, input, badge with design tokens) | Frontend | Person B | W4 | GATE-2 | NOT STARTED | — |
| BLK-D04 | Accessibility audit passed (WCAG AA — contrast, touch targets, screen readers) | Product/Design | Person B | W11 | GATE-3 | NOT STARTED | — |
| BLK-D05 | Design QA gate passed (all screens match Figma, zero P0 issues) | Product/Design | Founder | W13 | GATE-3 | NOT STARTED | — |

**Total Blockers:** 25  
**Week 1-2 Priority Blockers:** BLK-002, BLK-006, BLK-009, BLK-012, BLK-014, BLK-016, BLK-D01, BLK-D02, BLK-020  
**Gate-4 Blockers (launch-critical):** BLK-001, BLK-003, BLK-004, BLK-019, BLK-020

---

### Part B — Blocker Response Protocol

**When a new blocker is discovered during execution:**

| Step | Action | Timeframe |
|------|--------|-----------|
| 1 | **Classify severity:** CRITICAL (blocks launch) / HIGH (blocks gate) / MEDIUM (blocks tasks) / LOW (workaround exists) | Immediately |
| 2 | **Identify downstream impact:** List all STEP-XXX items that are blocked | Within 1 hour |
| 3 | **Assign owner** and set 24-hour response deadline | Within 1 hour |
| 4 | **Document** in this registry as BLK-NEW-XXX with format: ID, description, domain, owner, target week, gate impact, status | Within 1 hour |
| 5 | **If CRITICAL:** Emergency sync within 4 hours (Slack @channel + Zoom) | Within 4 hours |
| 6 | **If launch date impact confirmed:** Escalate to Founder via Slack @channel with subject line: `LAUNCH RISK: [blocker description]` | Immediately on confirmation |

**Blocker Severity Escalation Matrix:**

| Severity | Response Time | Escalation | Launch Impact |
|----------|--------------|------------|---------------|
| CRITICAL | 4 hours | Emergency sync, Founder notified | Direct launch delay |
| HIGH | 24 hours | Next daily standup, documented | Gate delay, potential launch delay |
| MEDIUM | 48 hours | Next weekly sync | Task delay, no launch impact |
| LOW | Next sprint | Backlog | None |

---

### Part C — AI Agent Blocker Detection

**An AI agent executing tasks MUST flag a blocker when:**

1. **Dependency not met:** A task's DEPENDS ON field references a STEP-XXX that is NOT DONE
2. **Conflict detected:** Two plan files contain contradictory information during execution
3. **Validation failure:** A VAL-XXX test produces a FAIL result
4. **Gate criterion unverifiable:** Cannot determine if a gate criterion is met
5. **Resource unavailable:** A required external resource (API, service, vendor) is not accessible
6. **Safety concern:** A safety-critical value (safety floor, bias correction, A1C bounds) appears incorrect

**AI Agent Blocker Response Procedure:**

```
1. STOP the affected task immediately
2. Document the blocker:
   - ID: BLK-NEW-[sequential number]
   - Description: [what is blocked and why]
   - Affected steps: [STEP-XXX, STEP-XXX]
   - Severity: [CRITICAL/HIGH/MEDIUM/LOW]
   - Recommended resolution: [proposed fix]
3. Report to Founder/PM with the above information
4. Do NOT proceed past the blocked step
5. Work on non-blocked tasks if available
6. Check back for blocker resolution before resuming
```

---

## SECTION 5: DEPENDENCY EXECUTION MAP

### Part A — Full Dependency Table

> **Status values:** PENDING (not yet produced) → PRODUCING (in progress) → READY (available for consumption) → CONSUMED (integrated by consumer) → OVERDUE (past deadline)

| DEP-ID | Dependency | Producing Step | Consuming Step | Handoff Method | Deadline | Status |
|--------|-----------|---------------|----------------|----------------|----------|--------|
| DEP-001 | Auth endpoints (register, login, guest, refresh) | STEP-010 (W1) | STEP-044 (W4) | Live API on Railway staging | End W1 | PENDING |
| DEP-002 | Scan API response schema (camelCase JSON, all fields documented) | STEP-027 mock (W2), STEP-042 live (W4) | STEP-046 (W5) | Mock JSON W2 → Live API W4 | Mock: End W2; Live: End W4 | PENDING |
| DEP-003 | Safety floors implemented (6 food categories per PRD §6.2, Levenshtein ≤2) | STEP-033 (W3) | STEP-092 VAL-001 (W14) | Backend code, tested via cargo test | End W3 | PENDING |
| DEP-004 | RevenueCat products configured ($12.99/$99.99/$249.99) | STEP-081 (W12) | STEP-087 (W13) | RevenueCat dashboard — 3 product IDs | End W12 | PENDING |
| DEP-005 | GDPR export + deletion endpoints live | STEP-064 (W9), STEP-068 (W10) | STEP-100 App Store checklist (W15) | Live API endpoints verified | End W10 | PENDING |
| DEP-006 | Rate limiting (Redis token bucket, free=5/day, premium=100/day) | STEP-065 (W9) | STEP-073 (W10) | X-Scans-Remaining response header | End W9 | PENDING |
| DEP-007 | RLS policies applied to all user-data tables | STEP-074 (W11) | STEP-093 pentest (W14) | PostgreSQL RLS policies active | End W11 | PENDING |
| DEP-008 | OpenAI DPA executed (GDPR Art. 28) | STEP-001 (W1) | STEP-028 first OpenAI call (W2) | Signed DPA in OpenAI console | Day 1 | PENDING |
| DEP-009 | API field naming locked (camelCase) | STEP-014 (W1) | All frontend API calls (W3–W14) | CI lint enforced convention | End W1 | PENDING |
| DEP-010 | PostHog SDK integrated (analytics events firing) | STEP-022 (W1) | A/B paywall experiments (W13) | PostHog events visible in dashboard | End W1 | PENDING |
| DEP-011 | Scan API returns `fromCache: true` on pHash match | STEP-034 (W3) | UI "⚡ Instant result" badge (W6) | `fromCache` field in scan response | End W3 | PENDING |
| DEP-012 | Conservative bias implemented (MEDIUM: ×1.10, LOW: ×1.20) | STEP-040 (W4) | VAL-020 acceptance (W14) | Backend code, verified by cargo test | End W4 | PENDING |
| DEP-013 | Midnight GL reset cron (timezone-aware) | STEP-049 (W6) | Streak calculation correctness (W14) | Cron job running on Railway | End W6 | PENDING |
| DEP-014 | A1C estimation algorithm (Spec §4.2.5 formula) | STEP-055 (W7) | STEP-060 A1C progress screen (W8) | Backend API endpoint live | End W7 | PENDING |
| DEP-015 | Confidence scoring (HIGH/MEDIUM/LOW) | STEP-041 (W4) | GL range display in UI (W5) | Confidence field in scan response | End W4 | PENDING |
| DEP-016 | sequencingAdvice + swapSuggestions in scan response | STEP-045 (W5) | STEP-057 advice cards UI (W7) | JSON fields in scan response | End W5 | PENDING |
| DEP-017 | RevenueCat webhook endpoint live | STEP-085 (W13) | Subscription lifecycle handling (W13) | Webhook URL configured in RevenueCat | End W13 Day 2 | PENDING |
| DEP-018 | Refresh token rotation (SEC-003) | STEP-010 (W1) | Frontend token refresh flow (W3) | Auth API behavior documented | End W1 | PENDING |
| DEP-019 | Server-side entitlement check (advice_cards) | STEP-086 (W13) | Free tier response filtering (W13) | Server enforces, not client | End W13 | PENDING |
| DEP-020 | Camera architecture decision (Managed vs Bare) | STEP-029 (W2) | All camera frontend work (W3–W6) | ADR-002 documented in repo | End W2 Thu | PENDING |
| DEP-021 | Design system (color tokens, typography, spacing) | STEP-015 (W1) | STEP-038 component library (W3) | docs/DESIGN-TOKENS.md + CSS variables | End W1 Day 2 | PENDING |
| DEP-022 | Figma mockups (8 core + Phase 2 screens) | STEP-026 (W2) | All UI implementation (W3–W13) | Figma file with Dev Mode enabled | End W2 | PENDING |
| DEP-023 | Component library (button, card, input, badge) | STEP-043 (W4) | All screen implementations (W5–W13) | React Native components in codebase | End W4 | PENDING |
| DEP-024 | Usability testing complete (findings documented) | STEP-062 (W8) | STEP-066 design iteration (W9) | Usability report with P0/P1/P2 issues | End W8 | PENDING |
| DEP-025 | Accessibility audit passed (WCAG AA) | STEP-077 (W11) | STEP-100 App Store submission (W15) | Accessibility compliance report | End W11 | PENDING |
| **DEP-026** | **FTC attorney sign-off on all health claims** | **STEP-094 (W14)** | **STEP-100 App Store submission (W15)** | **Signed letter from attorney** | **End W14** | **PENDING** |
| **DEP-027** | **Trademark search results clear** | **STEP-003 (W1) → results W3-4** | **STEP-100 App Store listing (W15)** | **Search report from trademark service** | **W3-4 (2-4 week lead)** | **PENDING** |

**High-Risk Dependencies (≥3 downstream tasks blocked):**
- **DEP-002** (Scan API schema) — blocks W5, W6, W7 frontend work
- **DEP-009** (API naming) — cascade effect across entire frontend codebase
- **DEP-020** (Camera architecture) — blocks all camera features W3–W6
- **DEP-021** (Design system) — blocks all component + UI work
- **DEP-022** (Figma mockups) — blocks all frontend implementation

---

### Part B — Handoff Protocol

**How dependencies are handed off between team members:**

#### Backend → Frontend Handoffs (Person A → Person B)
1. Person A creates API endpoint + writes OpenAPI doc (auto-generated from Rust types)
2. Person A generates mock JSON response file at `mocks/[endpoint-name].json`
3. Person A posts in Slack #handoffs: "DEP-XXX ready: [endpoint] — mock at [path], live at [URL]"
4. Person B confirms receipt in Slack within 4 hours
5. Person B can start UI work immediately using mock
6. When live backend ready: Person B switches from mock to live API, runs integration smoke test
7. Both confirm handoff complete in weekly sync

#### Design → Frontend Handoffs (Founder → Person B)
1. Founder completes Figma screen with all states (default, loading, error, empty)
2. Founder enables Figma Dev Mode for the screen (CSS extraction enabled)
3. Founder posts in Slack #handoffs: "DEP-XXX ready: [screen name] — Figma link, Dev Mode enabled"
4. Person B reviews Figma, asks clarifying questions within 24 hours
5. Person B implements screen, then requests design QA from Founder
6. Founder reviews implementation against Figma — approves or lists P0/P1 fixes

#### Backend → AI/ML Handoffs (Person A, internal)
1. AI/ML prompt changes committed to `prompts/` directory with version number
2. Safety floor and bias correction values documented in `docs/AI-CONFIG.md`
3. All changes verified by `cargo test` before merging

#### Any → Founder/PM Decisions
1. Decision request posted in Slack #decisions with: context, options, recommendation, deadline
2. Founder responds within 24 hours (or sooner if tagged URGENT)
3. Decision documented in relevant ADR or plan file
4. Requester confirms understanding and proceeds

---

### Part C — Mock-First Strategy

**Every dependency requiring a mock before live implementation:**

| DEP-ID | Mock Available | Live Available | Frontend Can Start | Switch Trigger |
|--------|---------------|----------------|-------------------|----------------|
| DEP-002 | STEP-027 (W2 end) | STEP-042 (W4 end) | W3 (using mock) | STEP-042 DONE → swap mock for live |
| DEP-014 | Hardcoded A1C values (W7) | STEP-055 (W7 end) | W7 (using stub) | STEP-055 DONE → connect to live API |
| DEP-016 | Static advice JSON (W5) | STEP-045 (W5 end) | W6 (using static) | STEP-045 DONE → connect to live API |
| DEP-004 | Sandbox products (W2) | STEP-081 (W12) | W7 (paywall UI) | STEP-081 DONE → switch to production products |

**Mock Protocol:**
1. Mock files stored in `mocks/` directory in the repo
2. Frontend uses environment variable `USE_MOCKS=true` during development
3. CI runs tests against both mock and live modes
4. Before any gate, all mocks must be replaced with live implementations

---

## SECTION 6: RISK EXECUTION PROTOCOL

### Part A — Risk Registry

> **Probability: LOW (10%) / MEDIUM (40%) / HIGH (70%)**  
> **Impact: LOW / MEDIUM / HIGH / CRITICAL**  
> **Status: OPEN → MONITORING → TRIGGERED → MITIGATING → RESOLVED**

| RSK-ID | Description | Prob | Impact | Owner | Early Warning Signal | Trigger Threshold | Status |
|--------|------------|------|--------|-------|---------------------|-------------------|--------|
| RSK-001 | Expo managed workflow requires ejection for camera overlay | MED | HIGH | Person A | Camera overlay laggy in spike | Spike fails to render overlay at 30fps | OPEN |
| RSK-002 | OpenAI accuracy <85% at beta (VAL-001 gate fails) | MED | CRIT | Person A | Week 8 dry-run accuracy <80% | VAL-001 < 85% at Week 14 | OPEN |
| RSK-003 | Timeline slips — backend not ready for FE integration | HIGH | HIGH | Person A | Mock delivery delayed >2 days | Frontend blocked >1 week waiting for backend | OPEN |
| RSK-004 | AI cost exceeds $0.05/scan blended | MED | HIGH | Person A | Daily cost >$0.04/scan for 3 days | Blended cost >$0.05/scan for 1 week | OPEN |
| RSK-005 | App Store rejection for health claims ("reversal" language) | HIGH | HIGH | Founder | CI grep finds new "reversal" match | App Store review flags health claims | OPEN |
| RSK-006 | RevenueCat webhook latency → subscription state mismatch | MED | MED | Both | Webhook >30s delay in sandbox testing | User pays but sees free tier for >60s | OPEN |
| RSK-007 | Beta accuracy validation fails at Week 14 | MED | CRIT | Person A | Week 8 dry-run accuracy <80% | Same as RSK-002 — double-tracked for visibility | OPEN |
| RSK-008 | Pentest finds Critical/High issues in Week 13-14 | LOW | HIGH | Vendor + Person A | OWASP scan finds issues in CI | Pentest report has Critical/High findings | OPEN |
| RSK-009 | Railway performance insufficient at beta load | LOW | MED | Person A | P95 >3s in k6 test at 50 VUs | P95 >5s at 100 VUs (PER-001 fails) | OPEN |
| RSK-010 | Solo founder burnout / key-person dependency | MED | HIGH | Founder | Person A unavailable >1 day unplanned | Person A unavailable >3 consecutive days | OPEN |
| RSK-011 | Camera architecture decision delayed beyond Week 2 | MED | HIGH | Person A | Spike not started by Wednesday W2 | No decision by Friday W2 end of day | OPEN |
| RSK-012 | GDPR DPA/DPIA not completed before launch | LOW | CRIT | Founder | DPA not executed by end of W1 | DPIA not documented by W12 | OPEN |
| RSK-013 | Pricing locked too late, RevenueCat config delayed | MED | MED | Founder | Pricing not locked by end of W1 Day 2 | RevenueCat products not configured by W12 | OPEN |
| RSK-014 | AI hallucination on high-risk meals (underestimates GL for safety floor foods) | MED | HIGH | Person A | Safety floor override rate <90% in testing | Any safety floor food classified as LOW risk | OPEN |
| RSK-015 | Free tier API cost unsustainable ($33K/month at Month 12) | MED | HIGH | Person A + Founder | Cache hit rate <30% at Month 3 | Monthly AI cost >$10K at Month 6 | OPEN |
| RSK-016 | Design drift: implementation doesn't match Figma mockups | MED | HIGH | Founder + Person B | Weekly design QA finds >3 deviations | P0 visual defects at Week 13 Design QA | OPEN |
| RSK-017 | Usability testing reveals major UX issues (Week 8) | LOW | HIGH | Founder | SUS score 60-70 (borderline) | SUS score <60 (requires redesign) | OPEN |
| RSK-018 | Accessibility audit fails (Week 11, WCAG AA non-compliance) | LOW | HIGH | Person B | Automated scan finds >5 issues at Week 8 | Manual audit fails at Week 11 | OPEN |
| **RSK-019** | **Attorney engagement delays legal review (FTC/privacy)** | **MED** | **HIGH** | **Founder** | **No attorney engaged by end of W2** | **No attorney available by W10** | **OPEN** |
| **RSK-020** | **Monetization Plan pricing errors propagate to production** | **LOW** | **CRIT** | **Founder** | **Pricing mismatch found in any plan** | **Wrong price displayed to users in production** | **OPEN** |

**Total Risks:** 20  
**CRITICAL Impact:** RSK-002, RSK-007, RSK-012, RSK-020  
**HIGH Probability:** RSK-003, RSK-005

---

### Part B — Risk Response Playbooks

#### PLAYBOOK: RSK-002 / RSK-007 — OpenAI Accuracy Below 85%

| Field | Detail |
|-------|--------|
| **Trigger** | Week 8 dry-run accuracy <80% OR Week 14 VAL-001 <85% |
| **Early Warning** | Week 8 dry-run accuracy 80-84% (borderline) |

**Immediate Response (first 4 hours):**
1. Person A: Analyze failure cases — which food categories fail most? Which complexity levels?
2. Person A: Check safety floor coverage — are all 6 categories triggering correctly?
3. Founder: Assess launch timeline impact

**Recovery Plan (next 48 hours — Weeks 9-12 if early warning):**
1. Person A: Categorize failures into prompt-fixable vs. architecture-fixable
2. Person A: Iterate master prompt with specific failure examples as few-shot examples
3. Person A: Increase conservative bias for problematic categories (temporary)
4. Person A: Re-run 50-meal test after each prompt iteration (rapid feedback loop)

**Escalation:** If accuracy still <85% after 2 weeks of iteration → Founder decides: delay launch +2 weeks OR descope complex meal types from MVP  
**Launch Impact:** +1 to +3 weeks if triggered at Week 14  
**Decision Point:** Continue iterating / Delay launch / Descope complex meals  
**AI Agent Instruction:** If you detect accuracy <85% in any test run, immediately flag RSK-002 as TRIGGERED and report the exact accuracy %, failure breakdown by category, and top 5 worst-performing meals.

---

#### PLAYBOOK: RSK-003 — Backend Bottleneck (Person A Overloaded)

| Field | Detail |
|-------|--------|
| **Trigger** | Frontend blocked >1 week waiting for backend deliverable |
| **Early Warning** | Mock delivery delayed >2 days from scheduled date |

**Immediate Response (first 4 hours):**
1. Person A: Identify which DEP-XXX is delayed and by how much
2. Person A: Generate mock JSON immediately (even if incomplete) to unblock frontend
3. Founder: Reprioritize Person A's tasks — critical path only

**Recovery Plan (next 48 hours):**
1. Person A: Drop all non-critical-path tasks for the week
2. Person A: Deliver minimum viable mock within 24 hours
3. Founder: Assess if any tasks can be descoped or deferred to post-launch

**Escalation:** If backend delay >2 weeks cumulative → Consider hiring fractional Rust developer  
**Launch Impact:** +1 week per week of cumulative delay  
**AI Agent Instruction:** If you are blocked waiting for a backend dependency, check if a mock exists. If no mock, flag RSK-003 and recommend Person A prioritize mock generation.

---

#### PLAYBOOK: RSK-005 — App Store Rejection for Health Claims

| Field | Detail |
|-------|--------|
| **Trigger** | App Store review flags health claims OR CI grep finds "reversal" language |
| **Early Warning** | CI grep finds new match in any code or document |

**Immediate Response (first 4 hours):**
1. Both: Run full grep audit across all code, copy, and marketing materials
2. Both: Remove or rephrase ALL flagged language immediately
3. Founder: Review FTC attorney feedback on specific claims

**Recovery Plan (next 48 hours):**
1. Founder: Get explicit FTC attorney sign-off on all remaining health-adjacent language
2. Person A: Update CI grep rules to catch the new patterns
3. Person B: Update all UI copy and marketing materials

**Escalation:** If App Store rejects → 1-3 day fix + resubmit cycle  
**Launch Impact:** +3 to +7 days per rejection cycle  
**AI Agent Instruction:** Before generating ANY user-facing text, verify it contains no claims of "reversing", "curing", or "treating" diabetes. Use only PRD-approved wellness language.

---

#### PLAYBOOK: RSK-012 — GDPR DPA/DPIA Not Completed

| Field | Detail |
|-------|--------|
| **Trigger** | DPA not executed by end of W1 OR DPIA not documented by W12 |
| **Early Warning** | DPA not executed by Day 2 of W1 |

**Immediate Response (first 4 hours):**
1. Founder: If DPA — go to OpenAI console immediately (self-service, 30 minutes)
2. Founder: If DPIA — allocate next available 8-hour block exclusively to DPIA

**Recovery Plan (next 48 hours):**
1. Founder: If OpenAI DPA has issues → contact OpenAI support, escalate
2. Founder: If DPIA — use GDPR template, document processing activities, complete risk assessment
3. Budget $2K for legal review if Founder cannot self-serve DPIA

**Escalation:** No DPA = cannot send user photos to OpenAI = **project cannot proceed**  
**Launch Impact:** Complete project halt until DPA resolved  
**AI Agent Instruction:** If BLK-002 is NOT DONE by end of Day 1, immediately escalate to Founder. This is the single most time-sensitive blocker.

---

#### PLAYBOOK: RSK-020 — Pricing Errors in Production

| Field | Detail |
|-------|--------|
| **Trigger** | Any price other than $12.99/$99.99/$249.99 displayed to users in production |
| **Early Warning** | Pricing mismatch found in any plan file, code, or configuration |

**Immediate Response (first 1 hour):**
1. Person A: Immediately deploy hotfix if backend is serving wrong price
2. Person B: Immediately push OTA update if frontend is displaying wrong price
3. Founder: Verify RevenueCat dashboard matches PRD pricing

**Recovery Plan (next 24 hours):**
1. Both: Full grep audit across all code for any hardcoded price values
2. Person A: Add CI validation that pricing constants match single source of truth
3. Founder: Verify App Store Connect and Google Play Console pricing is correct

**Escalation:** Wrong price charged to users = potential refund obligations + trust damage  
**Launch Impact:** Immediate hotfix, no launch delay if caught pre-launch  
**AI Agent Instruction:** If you encounter ANY price value, verify it matches: $12.99/month, $99.99/year, $249.99/lifetime. Flag any discrepancy immediately as RSK-020 TRIGGERED.

---

## SECTION 7: AI AGENT OPERATING PROTOCOL

> **This section is written directly TO an AI agent as system-level instructions.**  
> **If you are an AI agent (Claude, GPT, or other), read and follow this section precisely.**

### 7.1 — How to Orient Yourself

When you first receive this plan as context:

**Step 1:** Check **Section 1 (Project State Dashboard)** to find the current week and overall status.

**Step 2:** Find your active tasks in **Section 2 (Execution Sequence)** by filtering for:
- Current week number
- Your assigned domain (check Section 0.8 for team assignments)
- Status = NOT STARTED or IN PROGRESS

**Step 3:** For each active task, check its **DEPENDS ON** field. If ANY dependency has Status ≠ DONE, you are BLOCKED on that task. Follow the blocker protocol in Section 4, Part C.

**Step 4:** Read the **domain plan** for your tasks (file locations in Section 0.7) to get implementation detail. The domain plan tells you HOW. This plan tells you WHEN and in WHAT ORDER.

**Step 5:** Before starting any task, confirm:
- The task's stage GATE has been passed (or this is Stage 1)
- All DEPENDS ON items are DONE
- You are authorized to perform this task (see 7.2 and 7.3)

**Step 6:** If multiple tasks are available, prioritize:
1. ⚡ Critical path tasks first (always)
2. Tasks that unlock the most downstream steps (check UNLOCKS column)
3. Tasks that resolve blockers (check BLK column)
4. Non-critical tasks last

### 7.2 — What You ARE Authorized to Do

✅ Execute tasks assigned to your domain in the domain plan  
✅ Update STATUS fields from NOT STARTED → IN PROGRESS → DONE  
✅ Add new BLK-NEW-XXX entries when you discover blockers  
✅ Generate mock API responses, test data, and code scaffolds  
✅ Run validation tests (VAL-XXX) and report results  
✅ Flag conflicts between files as CONFLICT-NEW-XXX findings  
✅ Ask clarifying questions before starting ambiguous tasks  
✅ Write and run unit tests (`cargo test`, Jest, Detox)  
✅ Generate documentation (API docs, setup guides, ADRs)  
✅ Refactor code for quality without changing external behavior  
✅ Update dependency status from PENDING → PRODUCING → READY  

### 7.3 — What You Are NOT Authorized to Do (Escalate to Founder)

❌ Change pricing ($12.99/$99.99/$249.99) — BLK-009 locked by Founder  
❌ Change the 15-week timeline or move gate dates  
❌ Modify the PRD v2.0 or Technical Specification v2.0  
❌ Make GO/NO-GO gate decisions (Section 3 — Founder only)  
❌ Modify any compliance-related task content (GDPR, COPPA, FTC, CCPA)  
❌ Change team role assignments (Section 0.8)  
❌ Add new features not defined in the PRD  
❌ Skip a task marked as ⚡ Critical Path  
❌ Override a safety floor value (PRD §6.2 — 6 categories locked)  
❌ Override a conservative bias multiplier (MEDIUM: 1.10×, LOW: 1.20×)  
❌ Change the A1C estimation formula (Spec §4.2.5 — locked)  
❌ Deploy to production without explicit Founder approval  
❌ Delete or weaken any existing test without Founder approval  
❌ Remove the ±0.2 bounds disclaimer from any A1C display  
❌ Use the word "reverse", "cure", or "treat" in any user-facing text  

### 7.4 — How to Report Completion

When you complete a task:

```
1. Update the task's STATUS to DONE in the execution sequence (Section 2)
2. Record completion:
   - Task: STEP-XXX
   - Completion timestamp: [ISO 8601]
   - Output artifact: [file path, endpoint URL, or test result]
   - Tests passing: [yes/no — cite specific test command]

3. Check: Does completing this task UNLOCK any downstream STEP-XXX items?
   → If yes, notify the owner of the next step
   → Update dependency status to READY if applicable

4. Check: Does completing this task resolve a BLK-XXX blocker?
   → If yes, update the blocker status to DONE in Section 4

5. Check: Does this task satisfy a GATE criterion?
   → If yes, update the relevant gate's criterion in Section 3
   → If ALL criteria for a gate are now met, notify Founder for GO/NO-GO decision

6. Check: Does this task produce a DEP-XXX dependency?
   → If yes, update the dependency status to READY in Section 5
   → Follow the handoff protocol (Section 5, Part B)
```

### 7.5 — How to Handle Conflicts Found During Execution

If you discover a conflict between two files during execution:

```
1. STOP the affected task immediately

2. Document the conflict:
   - ID: CONFLICT-NEW-[sequential number]
   - File A: [path] — says: "[exact quote]"
   - File B: [path] — says: "[exact quote]"
   - Severity: CRITICAL / HIGH / MEDIUM / LOW

3. Apply the source of truth hierarchy:
   PRD v2.0 > Tech Spec v2.0 > Master Plan v2.0 > Domain Plans

4. If PRD/Spec resolves the conflict:
   → Apply the correct value from the higher-ranked document
   → Document the fix: "Resolved per [PRD/Spec] §[section]"
   → Proceed with the corrected value

5. If PRD/Spec does NOT cover the conflict:
   → Escalate to Founder with CONFLICT-NEW-[N] documentation
   → Do NOT proceed on conflicted tasks without resolution
   → Work on non-conflicted tasks while awaiting resolution

6. Add the conflict to Appendix B (Issue Resolution Log)
```

### 7.6 — Escalation Triggers (Auto-Escalate to Founder)

**Immediately escalate** (Slack message + issue log entry) when ANY of the following occur:

| Trigger | Severity | Action |
|---------|----------|--------|
| Any CRITICAL-severity blocker discovered | CRITICAL | Emergency sync within 4 hours |
| Any gate is at risk of failing | HIGH | Notify Founder with gap analysis |
| VAL-001 (accuracy) shows <85% at any test run | CRITICAL | Flag RSK-002, provide failure breakdown |
| AI scan cost exceeds $0.05/scan for 3 consecutive days | HIGH | Flag RSK-004, recommend cache optimization |
| A compliance task (BLK-002, BLK-003, BLK-007, BLK-008, BLK-019) not completed by target week | CRITICAL | Notify Founder with impact assessment |
| Person A or Person B unavailable for >2 consecutive days | HIGH | Flag RSK-010, identify blocked tasks |
| A new legal/regulatory risk identified | HIGH | Document and escalate |
| "Reversal" language found in any code or copy | HIGH | Flag RSK-005, remove immediately |
| Pricing value ≠ $12.99/$99.99/$249.99 found anywhere | HIGH | Flag RSK-020, correct immediately |
| Safety floor food classified as LOW risk | CRITICAL | Flag RSK-014, investigate immediately |

### 7.7 — Domain-Specific Agent Instructions

**If you are a Backend/AI agent (Person A's domain):**
- Always run `cargo check -p <package>` before any build
- Always run `cargo test -p <package>` before marking a task DONE
- Always run `cargo clippy -p <package> -- -D warnings` before committing
- Safety floors: 6 categories only (white_rice, pasta, white_bread, fruit_juice, sweetened_beverage, baked_goods)
- Conservative bias: HIGH=1.0×, MEDIUM=1.10×, LOW=1.20×. No Unknown level.
- A1C formula: Use ONLY Spec §4.2.5 continuous daily-change formula
- Confidence levels: HIGH, MEDIUM, LOW only. Map any unknown to LOW.
- Complexity categories: SIMPLE, COMPLEX_B, COMPLEX_C only
- GL range: MEDIUM=±20%, LOW=±35% (percentage-based, not absolute)

**If you are a Frontend agent (Person B's domain):**
- Colors: Primary=#0D7377, Safe=#4CAF50, Warning=#FF9800, High=#F44336
- Tabs: 4 only (Home, Scan FAB, Progress, Profile). No "Learn" tab.
- Onboarding: 6 screens (Welcome, A1C, Goal, Dietary, GL Education, Age Gate)
- Pricing in UI: $12.99/month, $99.99/year (+ "Save 36%" badge), $249.99 lifetime
- A1C display: ALWAYS show ±0.2 bounds. NEVER show point estimate without bounds.
- Health claims: NEVER use "reverse", "cure", "treat", "heal" in any UI text

---

## SECTION 8: WEEKLY SYNC PROTOCOL

**Duration:** 30 minutes maximum (Fridays, 4:00 PM)  
**Participants:** Person A, Person B, Founder/PM  
**Format:** Standing agenda, timeboxed

### Weekly Sync Template — Week [N] — [Date YYYY-MM-DD]

#### 1. GATE CHECK (5 min)
- **Active gate:** GATE-[N] — [gate name]
- **Gate status:** ✅ ON TRACK / ⚠️ AT RISK / ❌ BLOCKED
- **Criteria progress:** [X of Y criteria DONE]
- If AT RISK or BLOCKED:
  - [ ] Recovery action 1 (owner, due date)
  - [ ] Recovery action 2 (owner, due date)

#### 2. STEP STATUS (5 min)
- **Steps completed this week:**
  - STEP-XXX: [task name] — ✅ DONE [date]
  - STEP-XXX: [task name] — ✅ DONE [date]
- **Steps in progress:**
  - STEP-XXX: [task name] — [% complete] — [ETA]
- **Steps blocked:**
  - STEP-XXX: [task name] — blocked by [BLK-XXX / STEP-XXX] — [resolution plan]

#### 3. BLOCKER STATUS (5 min)
- Review BLK-XXX items due this week or next:
  - BLK-XXX: [Status] — [Update] — [Concerns?]
  - BLK-XXX: [Status] — [Update] — [Concerns?]
- Any NEW blockers discovered? (BLK-NEW-XXX)
- Any blockers RESOLVED this week?

#### 4. DEPENDENCY HANDOFFS (10 min)
- **Person A → Person B this week:**
  - DEP-XXX: [Deliverable] — Status: [READY/PRODUCING] — [Person B can consume Monday?]
- **Founder → Person B this week:**
  - DEP-XXX: [Design deliverable] — Status: [READY/PRODUCING]
- **Person B → Person A this week:**
  - [UI feedback / API issues / integration blockers]
- Any DEP-XXX items at risk of slipping?
  - DEP-XXX: [Original week] → [New ETA] — Impact: [affected STEP-XXX items]

#### 5. NEXT WEEK PREVIEW (3 min)
- Person A primary deliverables: STEP-XXX, STEP-XXX
- Person B primary deliverables: STEP-XXX, STEP-XXX
- Founder primary deliverables: STEP-XXX, STEP-XXX
- Cross-domain prep needed before Monday?
  - [ ] Action item (owner)

#### 6. STANDING METRICS (2 min — report only, discuss if anomaly)
- AI scan cost (daily blended $/scan): **$0.XXX** (target ≤$0.02, circuit breaker at $0.05)
- Crash-free rate (Sentry): **99.X%** (target ≥99.5%)
- "Reversal" language found in new code this week? ✅ NO / ❌ YES (if yes: removed before merge?)
- Redis cache hit rate: **XX%** (target ≥40%)

#### 7. AI AGENT SUMMARY (if applicable)
- Tasks completed by AI agent this week: [list STEP-XXX items]
- Blockers flagged by AI agent: [BLK-NEW-XXX items]
- Conflicts discovered: [CONFLICT-NEW-XXX items]
- Escalations pending Founder response: [list]

---

### Example — Week 2 Sync

#### Weekly Sync — Week 2 — 2026-03-20

**1. GATE CHECK**
- Active gate: GATE-1 (Foundation Complete)
- Gate status: ✅ ON TRACK (9 of 11 criteria DONE)
- Remaining: STEP-027 (mock JSON — in progress), STEP-014 (API naming — in progress)

**2. STEP STATUS**
- Completed: STEP-001 (DPA ✅), STEP-005 (monorepo ✅), STEP-006 (Railway ✅), STEP-008 (Rust ✅), STEP-009 (DB ✅), STEP-010 (Auth ✅), STEP-015 (design system ✅), STEP-026 (Figma ✅), STEP-029 (camera spike ✅)
- In progress: STEP-027 (mock JSON — 80%, ETA today), STEP-028 (OpenAI integration — 60%)
- Blocked: None

**3. BLOCKER STATUS**
- BLK-002 (OpenAI DPA): ✅ DONE (executed Day 1)
- BLK-009 (Pricing locked): ✅ DONE (documented in all plans)
- BLK-012 (Camera decision): ✅ DONE (Managed workflow — ADR-002 documented)
- BLK-D01 (Design system): ✅ DONE (docs/DESIGN-TOKENS.md complete)
- BLK-D02 (Figma mockups): ✅ DONE (8 core + Phase 2, Dev Mode enabled)
- BLK-020 (Trademark): IN PROGRESS (filed W1, results expected W3-4)

**4. DEPENDENCY HANDOFFS**
- DEP-002 (mock): Person A → Person B: Mock JSON delivering today. FE can start scan UI Monday.
- DEP-021 (design system): Founder → Person B: ✅ READY. CSS variables exported.
- DEP-022 (Figma): Founder → Person B: ✅ READY. Dev Mode enabled.

**5. NEXT WEEK PREVIEW**
- Person A: STEP-033 (safety floors), STEP-034 (scan API scaffold), STEP-039 (VAL matrix)
- Person B: STEP-035 (camera screen), STEP-036 (onboarding 6 screens), STEP-037 (EU consent), STEP-038 (button + card)
- Founder: Trademark follow-up, usability test recruitment prep
- Prep: Person A provides Railway staging URL to Person B by Monday AM

**6. STANDING METRICS**
- AI scan cost: $0.048/scan (within budget)
- Crash-free rate: N/A (no production users)
- "Reversal" language: ✅ NO (CI passing)
- Redis cache hit rate: N/A (cache not live yet)

---

## SECTION 9: LAUNCH CHECKLIST — FINAL 72 HOURS

> **Week 15 operational guide. Sequential checklist divided into time blocks.**  
> **Every item has: checkbox, owner, estimated time, dependency, verification method.**

### T-72h: Production Environment (Person A) — Monday

| # | Task | Owner | Est. Time | Depends On | Verification | Status |
|---|------|-------|-----------|------------|--------------|--------|
| L-001 | Run production deployment runbook (STEP-098) | Person A | 2h | GATE-4 passed | Railway health check returns 200 | [ ] |
| L-002 | Verify all environment variables set in production | Person A | 30min | L-001 | `railway variables` matches checklist | [ ] |
| L-003 | Run database migrations on production PostgreSQL | Person A | 30min | L-001 | All migrations applied, schema matches staging | [ ] |
| L-004 | Configure Sentry for production (STEP-099) | Person A | 1h | L-001 | Test error captured in Sentry dashboard | [ ] |
| L-005 | Configure PostHog for production | Person A | 30min | L-001 | Test event visible in PostHog | [ ] |
| L-006 | Verify RevenueCat webhook URL points to production | Person A | 15min | L-001 | Test webhook received in production logs | [ ] |
| L-007 | Verify rate limiting active (free=5/day, premium=100/day) | Person A | 15min | L-001 | 6th free scan returns 429 | [ ] |
| L-008 | Verify RLS policies active on all tables | Person A | 30min | L-001 | Cross-user query returns 0 rows | [ ] |
| L-009 | Run smoke test: full scan pipeline end-to-end | Person A | 30min | L-001 | Scan returns valid GL estimate | [ ] |
| L-010 | Verify midnight GL reset cron scheduled | Person A | 15min | L-001 | Cron job visible in Railway dashboard | [ ] |
| L-011 | Test rollback procedure (STEP-103) | Person A | 1h | L-001 | Rollback succeeds, previous version serves traffic | [ ] |

### T-48h: App Store Submission Prep (Person B + Founder) — Wednesday

| # | Task | Owner | Est. Time | Depends On | Verification | Status |
|---|------|-------|-----------|------------|--------------|--------|
| L-012 | Final build: iOS production build (EAS) | Person B | 1h | L-009 passed | Build succeeds, IPA generated | [ ] |
| L-013 | Final build: Android production build (EAS) | Person B | 1h | L-009 passed | Build succeeds, AAB generated | [ ] |
| L-014 | Capture App Store screenshots (6.7", 6.1", iPad) | Person B | 2h | L-012 | All required sizes captured, no placeholder content | [ ] |
| L-015 | Write App Store description + keywords | Founder | 2h | — | No "reversal" language (grep verified) | [ ] |
| L-016 | Complete App Store privacy labels | Founder | 1h | — | All data types declared accurately | [ ] |
| L-017 | Verify Privacy Policy URL live and accessible | Founder | 15min | STEP-050 | URL returns 200, content matches attorney-drafted version | [ ] |
| L-018 | Verify Terms of Service URL live and accessible | Founder | 15min | STEP-050 | URL returns 200, pricing matches $12.99/$99.99/$249.99 | [ ] |
| L-019 | Verify trademark search clear (BLK-020) | Founder | 15min | STEP-003 | No conflicts found in search report | [ ] |
| L-020 | Verify FTC attorney sign-off document on file (BLK-019) | Founder | 15min | STEP-094 | Signed letter/email from attorney | [ ] |
| L-021 | RevenueCat production pricing verified | Founder | 15min | STEP-081 | $12.99/mo, $99.99/yr, $249.99 lifetime in dashboard | [ ] |
| L-022 | App Store Connect IAP products approved | Founder | 15min | STEP-025 | All 3 products status = "Ready to Submit" | [ ] |

### T-24h: Final Verification Pass (All) — Thursday

| # | Task | Owner | Est. Time | Depends On | Verification | Status |
|---|------|-------|-----------|------------|--------------|--------|
| L-023 | Full regression test on production build | Person B | 3h | L-012, L-013 | All critical paths work: onboarding → scan → results → dashboard |  [ ] |
| L-024 | Verify pricing displayed correctly in app paywall | Person B | 15min | L-023 | $12.99/mo, $99.99/yr, $249.99 lifetime shown | [ ] |
| L-025 | Verify A1C displays show ±0.2 bounds everywhere | Person B | 15min | L-023 | No A1C point estimate without bounds | [ ] |
| L-026 | Verify age gate blocks users <13 | Person B | 15min | L-023 | Under-13 birthdate → blocked, data not saved | [ ] |
| L-027 | Verify GDPR export works in production | Person A | 15min | L-009 | Export returns user data JSON in <10s | [ ] |
| L-028 | Verify GDPR deletion works in production | Person A | 15min | L-009 | Account soft-deleted, data inaccessible | [ ] |
| L-029 | Final "reversal" language grep on production build | Both | 15min | L-012, L-013 | Zero matches for prohibited health claim terms | [ ] |
| L-030 | Verify on-call rotation confirmed for next 72 hours | Person A | 15min | — | Person A + Person B shifts documented | [ ] |
| L-031 | Founder final GO/NO-GO decision | Founder | 15min | L-023 through L-030 all ✅ | Verbal + Slack confirmation: "GO FOR LAUNCH" | [ ] |

### T-0h: Submission + Announcement — Friday

| # | Task | Owner | Est. Time | Depends On | Verification | Status |
|---|------|-------|-----------|------------|--------------|--------|
| L-032 | Submit iOS app to App Store Connect (STEP-101) | Person B | 30min | L-031 GO | Status = "Waiting for Review" in App Store Connect | [ ] |
| L-033 | Submit Android app to Google Play Console | Person B | 30min | L-031 GO | Status = "In Review" in Play Console | [ ] |
| L-034 | Begin 72-hour monitoring rotation (STEP-102) | Person A | — | L-032, L-033 | Monitoring dashboard open, alerts configured | [ ] |
| L-035 | Post launch announcement (if App Store approved) | Founder | 1h | App Store approval | Announcement posted to planned channels | [ ] |

**Total launch checklist items:** 35  
**Estimated total time:** ~20 hours across 3 people over 4 days

---

## APPENDIX A: QUICK REFERENCE CARD

### A.1 — Pricing (BLK-009 Locked)

| Plan | Price | Billing | Trial |
|------|-------|---------|-------|
| Monthly | $12.99/month | Recurring | None |
| Annual | $99.99/year | Recurring | 7-day free trial |
| Lifetime | $249.99 | One-time | None |

**Source:** PRD §9.2  
**Badge text:** "Save 36%" on annual plan  
**Rule:** These prices are NEVER changed without Founder explicit approval. CI validates pricing constants.

### A.2 — Safety Floor Categories (6 Only — PRD §6.2)

| # | Category | Minimum GL | Portion Reference |
|---|----------|-----------|-------------------|
| 1 | White Rice | 20 | 1 cup |
| 2 | Pasta (white) | 18 | 1 cup |
| 3 | White Bread | 16 | 2 slices |
| 4 | Fruit Juice (unsweetened) | 15 | 8 oz |
| 5 | Sweetened Beverages | 22 | 12 oz |
| 6 | Baked Goods (pastries/cookies) | 19 | 1 piece |

**Matching:** Levenshtein distance ≤2 for food name matching  
**Rule:** If AI estimates GL below floor for matched food → override with floor value  
**Rule:** If AI portion estimate < reference portion → floor still applies (minimum threshold)  
**NOT included in MVP:** Potatoes, Candy (deferred to v1.1 per SCOPE-1)

### A.3 — Conservative Bias Multipliers

| Confidence Level | Multiplier | GL Range | Description |
|------------------|-----------|----------|-------------|
| HIGH | 1.0× (no adjustment) | Point estimate | Single item, clearly visible, high certainty |
| MEDIUM | 1.10× (round up) | ±20% | Mixed dish, partially visible ingredients |
| LOW | 1.20× (round up) | ±35% | Opaque dish, ingredients not determinable |

**Source:** Tech Spec §4.2.3  
**Rule:** Always round UP (conservative). Never round down. Never underestimate GL for safety.

### A.4 — Complexity Categories

| Category | Visual Characteristics | Source |
|----------|----------------------|--------|
| SIMPLE | Single food item or clearly separated items | Spec §4.2.2 |
| COMPLEX_B | Mixed dish where main ingredients are partially visible | Spec §4.2.2 |
| COMPLEX_C | Opaque dish where ingredients cannot be determined visually | Spec §4.2.2 |

**NOT used:** MODERATE, COMPLEX (old names — replaced per CONFLICT-5)  
**NOT used:** Item-count-based classification (replaced with visual-characteristics per AMBIGUITY-1)

### A.5 — Color Palette (PRD §8.3)

| Token | Hex | Usage |
|-------|-----|-------|
| Primary (Teal) | #0D7377 | Headers, primary actions, navigation |
| Safe Green | #4CAF50 | Low GL results, positive indicators |
| Warning Orange | #FF9800 | Medium GL results, caution indicators |
| High Red | #F44336 | High GL results, alerts, danger |
| Background | #F5F5F5 | App background |
| Surface | #FFFFFF | Cards, modals |
| Text Primary | #212121 | Body text |
| Text Secondary | #757575 | Labels, captions |

### A.6 — Key Contacts & Tools

| Tool | Purpose | URL/Contact |
|------|---------|-------------|
| GitHub | Monorepo, CI/CD, issues | github.com/[org]/revora |
| Railway | Backend hosting, PostgreSQL, Redis | railway.app/project/revora |
| Cloudflare R2 | Image storage (scan photos) | dash.cloudflare.com |
| RevenueCat | Subscription management, paywall | app.revenuecat.com |
| PostHog | Analytics, feature flags, A/B testing | app.posthog.com |
| Sentry | Error monitoring, crash reporting | sentry.io |
| Figma | Design mockups, component specs | figma.com/file/[revora] |
| OpenAI | GPT-4o vision API for food analysis | platform.openai.com |
| Slack | Team communication | #revora-dev, #handoffs, #decisions |

### A.7 — Architecture Decision Record (ADR) Index

| ADR | Decision | Status | Date |
|-----|----------|--------|------|
| ADR-001 | Rust/Axum for backend (performance, safety) | DECIDED | Pre-project |
| ADR-002 | Camera architecture: Managed vs Bare Expo workflow | PENDING | Week 2 spike |
| ADR-003 | PostgreSQL RLS for multi-tenant data isolation | DECIDED | Pre-project |
| ADR-004 | RevenueCat for subscription management (vs. custom implementation) | DECIDED | Pre-project |
| ADR-005 | GPT-4o vision for food analysis (vs. custom ML model) | DECIDED | Pre-project |
| ADR-006 | Zustand for React Native state management (vs. Redux) | DECIDED | Pre-project |
| ADR-007 | Railway.app for hosting (vs. AWS/GCP) | DECIDED | Pre-project |
| ADR-008 | PostHog for analytics (vs. Mixpanel/Amplitude) | DECIDED | Pre-project |

---

## APPENDIX B: ISSUE RESOLUTION LOG

> **All 51 findings from the alignment audit (Task 1), with resolution status.**  
> **Source:** `Revora_Alignment_Audit_Task1.md`

### B.1 — Conflicts (14 findings)

| ID | Finding | Severity | Fix Applied | Domain Plan | Status |
|----|---------|----------|-------------|-------------|--------|
| CONFLICT-1 | Monetization Plan prices ($9.99/$79.99) ≠ PRD ($12.99/$99.99) | CRITICAL | Updated all prices to $12.99/$99.99/$249.99 | Monetization | ✅ RESOLVED |
| CONFLICT-2 | No lifetime tier ($249.99) in Monetization Plan | CRITICAL | Added lifetime tier to MON-003/MON-004 | Monetization | ✅ RESOLVED |
| CONFLICT-3 | AI/ML Plan: 8 safety floor categories vs. PRD's 6 | CRITICAL | Reduced to 6 categories, removed potato + candy | AI/ML | ✅ RESOLVED |
| CONFLICT-4 | AI/ML Plan: A1C algorithm differs from Spec §4.2.5 | CRITICAL | Replaced with Spec §4.2.5 continuous daily-change formula | AI/ML | ✅ RESOLVED |
| CONFLICT-5 | AI/ML Plan: MODERATE/COMPLEX vs. Spec's COMPLEX_B/COMPLEX_C | HIGH | Renamed throughout AI/ML Plan | AI/ML | ✅ RESOLVED |
| CONFLICT-6 | AI/ML Plan: GL range ±3/±5 vs. Spec's ±20%/±35% | HIGH | Updated to percentage-based ranges | AI/ML | ✅ RESOLVED |
| CONFLICT-7 | Security Plan: BAA references instead of DPA (GDPR, not HIPAA) | CRITICAL | Replaced all BAA with DPA throughout | Security | ✅ RESOLVED |
| CONFLICT-8 | Security Plan: HIPAA references instead of GDPR | CRITICAL | Replaced all HIPAA with GDPR throughout | Security | ✅ RESOLVED |
| CONFLICT-9 | Product/Design Plan: colors ≠ PRD §8.3 | HIGH | Aligned all colors to PRD §8.3 values | Product/Design | ✅ RESOLVED |
| CONFLICT-10 | Frontend Plan: 5 tabs vs. PRD's 4 (no Learn tab) | HIGH | Removed Learn tab, updated to 4-tab structure | Frontend | ✅ RESOLVED |
| CONFLICT-11 | Security Plan: DPIA at Week 3 vs. Master Plan Week 10 | MEDIUM | Moved DPIA to Week 10 | Security | ✅ RESOLVED |
| CONFLICT-12 | QA Plan: pytest primary vs. Spec's cargo test | MEDIUM | Clarified cargo test as primary, pytest optional | QA | ✅ RESOLVED |
| CONFLICT-13 | Product/Design: onboarding "3 slides" vs. PRD's 6 screens | MEDIUM | Updated all references to 6 screens | Product/Design | ✅ RESOLVED |
| CONFLICT-14 | Backend Plan: Confidence::Unknown variant not in Spec | MEDIUM | Removed Unknown, map to LOW | Backend | ✅ RESOLVED |

### B.2 — Gaps (11 findings)

| ID | Finding | Severity | Fix Applied | Domain Plan | Status |
|----|---------|----------|-------------|-------------|--------|
| GAP-1 | No scan corrections review task in AI/ML Plan | CRITICAL | Added AI-033 (scan correction review process) | AI/ML | ✅ RESOLVED |
| GAP-2 | No 7-day free trial implementation task | CRITICAL | Added to MON-003/MON-004 IAP configuration | Monetization | ✅ RESOLVED |
| GAP-3 | FTC attorney review not in Master Plan blockers | CRITICAL | Added BLK-019 (FTC attorney sign-off) | Master Plan | ✅ RESOLVED (this doc) |
| GAP-4 | No trademark search task | HIGH | Added SC-030 (trademark search, Week 1) | Security | ✅ RESOLVED |
| GAP-5 | No CCPA "Do Not Sell" link in Frontend | HIGH | Added FE-090 (CCPA toggle in Settings) | Frontend | ✅ RESOLVED |
| GAP-6 | No EU analytics consent banner | HIGH | Added FE-010b (EU consent banner) | Frontend | ✅ RESOLVED |
| GAP-7 | No SCC verification for cross-border transfers | HIGH | Added SC-031 (SCC verification) | Security | ✅ RESOLVED |
| GAP-8 | No walk/complete endpoint | HIGH | Added BE-058b (walk completion endpoint) | Backend | ✅ RESOLVED |
| GAP-9 | No comprehensive analytics event implementation | MEDIUM | Noted for implementation during screen development | Frontend/Backend | ⚠️ TRACKED |
| GAP-10 | No guest mode E2E test | MEDIUM | Added QA-040 (guest mode E2E) | QA | ✅ RESOLVED |
| GAP-11 | No pentest cross-reference in QA Plan | MEDIUM | Added QA-041 (pentest coordination) | QA | ✅ RESOLVED |

### B.3 — Ambiguities (8 findings)

| ID | Finding | Severity | Resolution | Status |
|----|---------|----------|------------|--------|
| AMBIGUITY-1 | AI-006: Item-count vs. visual-complexity classification | HIGH | Use Spec §4.2.2 visual characteristics | ✅ RESOLVED |
| AMBIGUITY-2 | Safety floor portion logic unclear | HIGH | Floors are MINIMUM thresholds regardless of portion | ✅ RESOLVED |
| AMBIGUITY-3 | PD-010: "8 core screens" missing Phase 2 screens | HIGH | Added Phase 2 screen list | ✅ RESOLVED |
| AMBIGUITY-4 | MON-005: Free user 150 scans/month vs. PRD's 75 | HIGH | Use PRD's 75 (50% utilization) as planning assumption | ✅ RESOLVED |
| AMBIGUITY-5 | AI-019: Endpoint /a1c/log vs. Spec's /a1c | MEDIUM | Use Spec path: POST /api/v1/a1c | ✅ RESOLVED |
| AMBIGUITY-6 | PD-015–018: Owner Person A vs. Master Plan's Person B | MEDIUM | Reassigned to Person B | ✅ RESOLVED |
| AMBIGUITY-7 | QA-002/004: seed.sql uses wrong table names | MEDIUM | Noted for fix when QA tasks execute (use Spec §4.3 schema) | ⚠️ TRACKED |
| AMBIGUITY-8 | FE-014: Which green (#4CAF50 vs. #22C55E)? | LOW | Use PRD's #4CAF50 (Safe Green) | ✅ RESOLVED |

### B.4 — Structural Issues (12 findings)

| ID | Finding | Severity | Fix Applied | Status |
|----|---------|----------|-------------|--------|
| STRUCT-1 | QA Plan not listed in Master Plan domain coordination | HIGH | Added as 8th domain plan (this doc, Section 0.7) | ✅ RESOLVED |
| STRUCT-2 | Company entity formation status unknown | HIGH | Flagged for Founder verification (Day 1) | ⚠️ PENDING VERIFICATION |
| STRUCT-3 | Monetization Plan timeline (W3) vs. Master Plan (W12-13) | HIGH | Aligned to Master Plan: RevenueCat config W12, SDK W13 | ✅ RESOLVED |
| STRUCT-4 | DEP-002 ownership confusion (AI/ML vs. Backend) | MEDIUM | Clarified: Backend owns API schema, AI/ML contributes JSON content | ✅ RESOLVED |
| STRUCT-5 | PD-015–018 component tasks assigned to Person A (wrong) | HIGH | Reassigned to Person B | ✅ RESOLVED |
| STRUCT-6 | Onboarding screens at Week 1 vs. Master Plan Week 3 | HIGH | Moved FE-015–021 to Week 3 | ✅ RESOLVED |
| STRUCT-7 | Privacy Policy link broken during Weeks 2-6 | MEDIUM | Placeholder URL Week 2, full version Week 6 | ✅ RESOLVED |
| STRUCT-8 | FTC attorney budget ($11K-$21K) not approved | MEDIUM | Flagged to Founder for budget decision (Day 1) | ⚠️ PENDING DECISION |
| STRUCT-9 | Walk API missing /walk/complete endpoint | HIGH | Added BE-058b | ✅ RESOLVED |
| STRUCT-10 | PostHog annual price flag default "79.99" (wrong) | HIGH | Removed price feature flags, hardcode PRD prices | ✅ RESOLVED |
| STRUCT-11 | Pentest timing: Week 13 vs. Week 14 | MEDIUM | Aligned to Week 14 | ✅ RESOLVED |
| STRUCT-12 | Camera spike ownership unclear | MEDIUM | Documented as joint Person A + Person B task (STEP-029) | ✅ RESOLVED |

### B.5 — Scope Creep (6 findings)

| ID | Finding | Recommendation | Decision | Status |
|----|---------|---------------|----------|--------|
| SCOPE-1 | Potatoes + Candy in safety floors | DEFER to v1.1 | Removed from MVP (6 categories per PRD) | ✅ DEFERRED |
| SCOPE-2 | Company entity formation in plan | DEFER (pre-project task) | If exists → mark DONE; if not → handle outside plan | ⚠️ PENDING |
| SCOPE-3 | Cookie consent banner for marketing website | KEEP (conditional) | Already marked "defer if no website" — no change needed | ✅ NO ACTION |
| SCOPE-4 | Python/pytest for Rust backend testing | DEFER | cargo test primary, pytest optional supplement | ✅ RESOLVED |
| SCOPE-5 | Dynamic pricing via PostHog feature flags | REMOVE | Hardcode PRD prices, A/B testing in v1.1 backlog | ✅ RESOLVED |
| SCOPE-6 | react-i18next from Day 1 | KEEP | Best practice, prevents hardcoded strings, minimal overhead | ✅ NO ACTION |

### B.6 — Master Plan Flags Applied (8 flags from Task 3)

| Flag | Description | Resolution in v2.0 |
|------|-------------|---------------------|
| FLAG-1 | Add BLK-019 FTC attorney sign-off | ✅ Added to Section 4 blocker registry |
| FLAG-2 | Add QA as 8th domain plan | ✅ Added to Section 0.7 file map |
| FLAG-3 | Add DEP-026 FTC attorney dependency | ✅ Added to Section 5 dependency table |
| FLAG-4 | Add DEP-027 trademark search dependency | ✅ Added to Section 5 dependency table |
| FLAG-5 | Add RSK-019 attorney engagement delays | ✅ Added to Section 6 risk registry |
| FLAG-6 | Add RSK-020 pricing error propagation | ✅ Added to Section 6 risk registry |
| FLAG-7 | Week 12 RevenueCat in timeline | ✅ STEP-081 (Week 12) in Section 2 |
| FLAG-8 | Add BLK-020 trademark search | ✅ Added to Section 4 blocker registry |

---

## APPENDIX C: ARCHITECTURE DECISION RECORDS

### ADR-001: Rust/Axum Backend Framework

| Field | Value |
|-------|-------|
| **Status** | DECIDED |
| **Date** | Pre-project |
| **Decision** | Use Rust with Axum framework for backend API |
| **Context** | Need high-performance, memory-safe backend for food analysis pipeline. Must handle image processing, OpenAI API calls, and PostgreSQL queries with low latency. |
| **Alternatives Considered** | Node.js/Express (faster dev, slower runtime), Go/Gin (similar performance, less type safety), Python/FastAPI (team familiar, poor concurrency) |
| **Rationale** | Rust provides memory safety without GC pauses, excellent async performance with Tokio, strong type system catches bugs at compile time. Axum integrates well with Tower middleware ecosystem. |
| **Consequences** | Steeper learning curve, slower initial development velocity, but safer production runtime. Hiring pool smaller for future team growth. |
| **Revisit Trigger** | Development velocity drops below 60% of planned pace for 3 consecutive weeks |

### ADR-002: Camera Architecture (Expo Managed vs Bare Workflow)

| Field | Value |
|-------|-------|
| **Status** | PENDING — decided during STEP-029 (Week 2 spike) |
| **Date** | TBD |
| **Decision** | TBD after 2-day spike |
| **Context** | Need camera overlay for plate calibration during food scanning. Expo Managed workflow has simpler build pipeline but limited native module access. Bare workflow allows any native module but complicates CI/CD. |
| **Spike Criteria** | (1) Can render calibration overlay at 30fps? (2) Can capture image with overlay bounds metadata? (3) Build pipeline complexity increase? |
| **Fallback** | If spike inconclusive → default to Managed workflow (safer, simpler build pipeline) |
| **Revisit Trigger** | Camera overlay requirements change, or Expo SDK 53 adds relevant native module support |

### ADR-003: PostgreSQL Row-Level Security for Data Isolation

| Field | Value |
|-------|-------|
| **Status** | DECIDED |
| **Date** | Pre-project |
| **Decision** | Use PostgreSQL RLS policies to enforce data isolation between users |
| **Context** | GDPR requires that users cannot access other users' data. Backend must enforce this at database level, not just application level. |
| **Rationale** | RLS provides defense-in-depth: even if application code has a bug allowing cross-user queries, the database itself blocks unauthorized access. |
| **Consequences** | Slightly more complex query debugging, all queries must include user context. |

### ADR-004: RevenueCat for Subscription Management

| Field | Value |
|-------|-------|
| **Status** | DECIDED |
| **Date** | Pre-project |
| **Decision** | Use RevenueCat SDK for in-app purchase and subscription management |
| **Context** | Need to manage 3 subscription tiers (monthly, annual, lifetime) across iOS and Android with receipt validation, entitlement management, and analytics. |
| **Rationale** | RevenueCat handles App Store/Play Store receipt validation, webhook notifications, and cross-platform entitlements. Building custom is 4-6 weeks of work vs. 1 week with RevenueCat. |
| **Consequences** | Vendor dependency, 1% of revenue fee (waived under $2.5M/year). |

### ADR-005: GPT-4o Vision for Food Analysis

| Field | Value |
|-------|-------|
| **Status** | DECIDED |
| **Date** | Pre-project |
| **Decision** | Use OpenAI GPT-4o vision model for food identification and GL estimation |
| **Context** | Need to analyze food photos, identify items, estimate portions, and calculate glycemic load. Custom ML model would take 6+ months to train and validate. |
| **Rationale** | GPT-4o vision provides strong food identification out-of-the-box. Safety floors + conservative bias + confidence scoring add our domain-specific safety layer on top. |
| **Consequences** | Per-scan cost ($0.02-$0.04), latency (2-5s), dependency on OpenAI API availability. Mitigated by pHash caching (target 40%+ cache hit rate at Month 6). |
| **Revisit Trigger** | Per-scan cost exceeds $0.05 blended for 1 week (RSK-004 trigger) |

---

## REDESIGN SUMMARY: v1.1 → v2.0

### What Changed

| Aspect | v1.1 | v2.0 |
|--------|------|------|
| **Document purpose** | Static reference document | Operational execution engine |
| **Audiences addressed** | Founder/PM only | New team members + AI agents + Founder/PM |
| **Execution sequence** | Timeline overview (1 page) | 103 STEP-XXX items with dependencies, owners, critical path |
| **Gates** | None | 5 explicit GATE decisions with pass/fail criteria |
| **Blockers** | Static table (18 items) | 25-item registry + response protocol + AI agent detection rules |
| **Dependencies** | Static table (25 items) | 27-item execution map + handoff protocols + mock-first strategy |
| **Risks** | Static table (14 items) | 20-item registry + 5 detailed response playbooks |
| **AI agent support** | None | Full Section 7 operating protocol (orientation, authorization, escalation, domain-specific rules) |
| **Weekly sync** | Basic template | STEP-referenced template with metrics + example |
| **Launch checklist** | None | 35-item, 72-hour sequential checklist |
| **Issue traceability** | None | Full Appendix B: 51 findings with resolution status |
| **Architecture decisions** | None | Appendix C: 5 ADRs with revisit triggers |
| **Audit integration** | None | All 8 Master Plan flags applied (BLK-019/020, DEP-026/027, RSK-019/020) |
| **Domain plans tracked** | 7 plans | 8 plans (QA/Testing added per FLAG-2) |
| **Safety floors** | "8 categories" | 6 categories (corrected per PRD §6.2) |
| **Quick reference** | None | Appendix A: pricing, safety floors, bias, colors, contacts |

### What Was Removed from v1.1

| v1.1 Section | Reason for Removal |
|-------------|-------------------|
| §2 One-page timeline | Replaced by 103-step execution sequence with dependencies |
| §3 Critical path (narrative) | Replaced by critical path overlay with step references |
| §4 Static dependency table | Replaced by dependency execution map with handoff protocols |
| §5 Static blocker table | Replaced by blocker management protocol with response procedures |
| §6 Domain plan coordination (static) | Replaced by file map (Section 0.7) + dependency handoff protocols (Section 5B) |
| §7 Static risk register | Replaced by risk execution protocol with playbooks |
| §8 Basic sync template | Replaced by STEP-referenced sync template with metrics |

### What Was Added in v2.0 (Not in v1.1)

| New Section/Feature | Purpose |
|--------------------|---------|
| Section 0: How to Read This Plan | Onboarding for all 3 audiences |
| Section 1: Project State Dashboard | 60-second project status check |
| Section 3: Gate Decision Framework | 5 explicit GO/NO-GO decisions with criteria |
| Section 7: AI Agent Operating Protocol | Enables autonomous AI execution |
| Section 9: Launch Checklist | 72-hour pre-launch operational guide |
| Appendix A: Quick Reference | Single-page lookup for critical values |
| Appendix B: Issue Resolution Log | Traceability for all 51 audit findings |
| Appendix C: ADR Index | Architecture decision documentation |
| Mock-first strategy | Unblocks frontend while backend is built |
| Handoff protocols | Explicit procedures for team coordination |
| Risk playbooks | Detailed response plans for top 5 risks |
| Escalation triggers | Automated flags for AI agents and team |
| Parallel work map | Week-by-week view of who does what simultaneously |

### Metrics

| Metric | v1.1 | v2.0 |
|--------|------|------|
| **Total lines** | ~445 | ~1,650+ |
| **Execution steps** | 0 (narrative only) | 103 (STEP-001 to STEP-103) |
| **Gates** | 0 | 5 |
| **Blockers tracked** | 18 | 25 |
| **Dependencies tracked** | 25 | 27 |
| **Risks tracked** | 14 | 20 |
| **Risk playbooks** | 0 | 5 |
| **Launch checklist items** | 0 | 35 |
| **Audit findings resolved** | 0 | 51 (45 resolved, 4 tracked, 2 pending) |
| **ADRs documented** | 0 | 5 |
| **Domain plans coordinated** | 7 | 8 |

---

**END OF DOCUMENT**

**Revora Master Implementation Plan v2.0**  
**Last Updated:** 2026-03-15  
**Next Review:** 2026-03-22 (Week 1 kickoff)
