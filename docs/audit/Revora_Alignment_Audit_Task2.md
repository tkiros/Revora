<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# TASK 2 REPORT: OPTIMIZATION RECOMMENDATIONS

**Date:** 2026-03-15  
**Scope:** All 7 Domain Plans + QA Plan evaluated against 6 dimensions  
**Evaluation Scale:** 1 (poor) – 5 (excellent)

---

## 1. BACKEND IMPLEMENTATION PLAN — Optimization Report

| Dimension            | Rating (1-5) | Key Gaps Found |
|----------------------|--------------|----------------|
| Completeness         | 4            | Missing walk/complete endpoint, survey endpoint, monthly report endpoint |
| Execution Clarity    | 5            | Excellent — hour estimates, code samples, acceptance criteria on every task |
| Dependency Coverage  | 4            | DEP references solid; missing explicit handoff notes for some |
| Risk Coverage        | 4            | Good — covers API cost, accuracy; missing DB migration rollback risk |
| Testing/Validation   | 3            | VAL references present but no explicit test task per endpoint |

**MUST ADD (Critical):**
- **Walk completion endpoint (BE-058b):** POST /api/v1/walk/complete per Spec §4.1.7. Week 8, Post-Meal Walk section. ~4 hours.
- **Survey endpoint (BE-xxx):** POST /api/v1/user/survey per Spec §4.1.12. Week 12, with educational content. ~3 hours.
- **Midnight GL reset cron job:** Referenced in Master Plan DEP-013 but no explicit task in Backend Plan. Add BE-049b for timezone-aware daily GL reset. Week 6. ~4 hours.

**SHOULD ADD (High Value):**
- **Database migration rollback testing:** Add explicit rollback test for each migration (run `sqlx migrate revert` after `sqlx migrate run`). Week 1, 2 hours.
- **API versioning middleware:** Spec §CON-004 requires no breaking changes without major version bump. Add URL versioning middleware (/api/v1/) with version header. Week 1, 2 hours.
- **Health check expanded:** BE-001 health check should verify DB + Redis connectivity (not just HTTP 200). Catches infrastructure issues before they cascade. Week 1, 1 hour.
- **Structured error codes document:** Create `docs/ERROR-CODES.md` mapping all AppError variants to HTTP status codes and user-facing messages. Week 2, 2 hours.

**REMOVE OR DEFER:**
- **BE-028 (Expo Camera Spike):** This is a Frontend/DevOps task, not Backend. Move to DevOps Plan or make it explicitly cross-domain. Person A participates but it's not a Backend deliverable.
- **BE-012 (Dish GL Database):** Lookup table is useful but not MVP-critical. All GL estimation comes from OpenAI. Defer seeding to V1.1 when dish name shortcut is implemented. Keep schema creation (minimal cost).

**HOURS ESTIMATION AUDIT:**
- **Over-estimated:** BE-007 (Users Table migration, 5h) — standard schema creation is 2-3h including tests. Adjusted: 3h.
- **Under-estimated:** BE-037 (OpenAI Vision single-pass, 12h) — prompt engineering + JSON parsing + error handling + testing is realistically 16-20h. Adjusted: 18h.
- **Under-estimated:** BE-015 (RLS Policies, 8h) — RLS across 6+ tables with testing and middleware is 12-16h. Adjusted: 14h.
- **Missing:** No time allocated for database seed data (GL reference tables, initial articles). Add 4h Week 12.

**CROSS-DOMAIN GAPS FOR THIS PLAN:**
- Backend produces scan API response but no documented contract review with Frontend (DEP-002 handoff meeting).
- No explicit task for RevenueCat webhook signature validation secret rotation.

---

## 2. FRONTEND IMPLEMENTATION PLAN — Optimization Report

| Dimension            | Rating (1-5) | Key Gaps Found |
|----------------------|--------------|----------------|
| Completeness         | 4            | Missing CCPA toggle, EU consent banner, some V1.1 stubs |
| Execution Clarity    | 5            | Exceptional — code samples, acceptance criteria, VAL references on every task |
| Dependency Coverage  | 4            | Good DEP references; missing DEP-021/022 explicit wait conditions |
| Risk Coverage        | 3            | No frontend-specific risk register (e.g., Expo SDK breaking changes) |
| Testing/Validation   | 3            | Jest tests referenced but no snapshot testing strategy for UI regression |

**MUST ADD (Critical):**
- **EU Analytics Consent Banner:** GDPR requires consent before PostHog loads for EU users. Add FE-010b: detect EU timezone → show consent → conditionally init PostHog. Week 3, 6 hours.
- **CCPA "Do Not Sell" Toggle:** PRD §10.3 requires this in Settings. Add task in Profile section. Week 10, 3 hours.
- **Fix tab count to 4:** Remove Learn tab (FE-012). Educational content goes under Progress or Profile for MVP. Week 1, 1 hour.
- **Fix onboarding schedule:** Move FE-015–FE-021 from Week 1 to Week 3 per Master Plan.

**SHOULD ADD (High Value):**
- **Skeleton loading screens:** Add shimmer/skeleton loaders for dashboard, scan results, meal history. Improves perceived performance. Week 6, 4 hours.
- **Error boundary component:** Wrap each tab in React error boundary to prevent full app crash from a single screen error. Week 2, 3 hours.
- **Accessibility test automation:** Add `jest-axe` for automated accessibility checks on components. Week 4, 3 hours.
- **Deep link testing plan:** PRD mentions deep links (`revora://scan/:id`, `revora://walk?scanId=UUID`) but no test coverage. Week 8, 4 hours.

**REMOVE OR DEFER:**
- **FE-010 price feature flags (`paywall-annual-price`):** Remove price feature flags per SCOPE-5. Hardcode PRD prices.
- **FE-054/FE-055/FE-056 (Learn Tab articles):** P1 V1.1 feature. Defer to post-launch. Keep API hook stub only.

**HOURS ESTIMATION AUDIT:**
- **Over-estimated:** FE-033 (Scan Results Sheet, 20h split into sub-tasks totaling 26h) — sub-task total exceeds parent estimate. Use sub-task total: 26h.
- **Under-estimated:** FE-020 (Age Gate + Consent, 8h) — GDPR consent + COPPA logic + EU detection is realistically 10-12h. Adjusted: 11h.
- **Missing:** No time for dark mode implementation across all screens. PD-001 defines dark mode tokens but no FE task implements dark mode toggle. Add 8h Week 10.

**CROSS-DOMAIN GAPS FOR THIS PLAN:**
- No explicit task for implementing the `X-Scans-Remaining` response header parsing (referenced in FE-035 but header must come from Backend — verify BE-044 sends it).
- No task for handling RevenueCat webhook-triggered state changes (server pushes subscription change → app must reflect it).

---

## 3. AI/ML IMPLEMENTATION PLAN — Optimization Report

| Dimension            | Rating (1-5) | Key Gaps Found |
|----------------------|--------------|----------------|
| Completeness         | 3            | A1C algorithm wrong, complexity names wrong, safety floors wrong, missing correction review |
| Execution Clarity    | 4            | Clear weekly breakdown; but Week 6 has 0 hours (unclear if Person A is doing Backend-only) |
| Dependency Coverage  | 4            | Good dependency tracking; DEP-002 ownership ambiguity |
| Risk Coverage        | 5            | Excellent — dry-run Week 8, circuit breaker, daily cost monitoring |
| Testing/Validation   | 4            | VAL-001, VAL-009, VAL-020 well-defined; missing VAL-008 (dietary restriction) test |

**MUST ADD (Critical):**
- **Fix A1C algorithm (AI-017):** Replace discrete tier formula with Spec §4.2.5 continuous daily-change formula. This is safety-critical — wrong algorithm produces wrong A1C estimates. Week 7, 0 additional hours (replace existing).
- **Fix complexity classification names:** MODERATE → COMPLEX_B, COMPLEX → COMPLEX_C throughout. Week 2, 1 hour.
- **Fix safety floor categories:** Reduce from 8 to 6 per PRD. Remove Potatoes and Candy. Fix GL values (white bread: 10→16, fruit juice: 12→15). Week 3, 2 hours.
- **Fix GL range calculation:** ±3/±5 → ±20%/±35% per Spec §4.2.4. Week 4, 1 hour.

**SHOULD ADD (High Value):**
- **Scan correction review process (AI-033):** Weekly review of user-submitted corrections. Feed into prompt iteration and validation set expansion. Weeks 9-12, 2h/week = 8h total.
- **VAL-008 test (dietary restriction compliance):** Add explicit test that swap suggestions never violate dietary restrictions. Week 5, 4 hours.
- **Prompt version A/B testing framework:** Infrastructure to test prompt variants on a percentage of traffic. Week 12, 6 hours.
- **Cultural cuisine coverage analysis:** PRD §7.8 notes Western food bias. Add task to test 10 non-Western meals in dry-run (Week 8). Week 8, 2 hours.

**REMOVE OR DEFER:**
- **AI-018 (A1C Encryption):** This duplicates Backend task BE-053. A1C encryption is a Backend concern. Remove from AI/ML Plan to avoid double-counting.
- **AI-019 (Manual A1C logging API):** This is a Backend endpoint task (BE-052 in Backend Plan). Remove from AI/ML Plan.

**HOURS ESTIMATION AUDIT:**
- **Under-estimated:** AI-005 (Master Prompt v1, 6h) — prompt engineering with few-shot examples, testing, and documentation is realistically 10-12h. Adjusted: 11h.
- **Over-estimated:** AI-002 (API key setup, 1h) — this is 15 minutes of console work. Adjusted: 0.5h.
- **Missing:** No hours for AI-033 (correction review process). Add 8h across Weeks 9-12.

**CROSS-DOMAIN GAPS FOR THIS PLAN:**
- No coordination with Frontend on how confidence levels map to UI display (point estimate vs range).
- No task for documenting the prompt template version that ships at launch (which version of master prompt is "production").

---

## 4. SECURITY & COMPLIANCE IMPLEMENTATION PLAN — Optimization Report

| Dimension            | Rating (1-5) | Key Gaps Found |
|----------------------|--------------|----------------|
| Completeness         | 3            | BAA/HIPAA error, missing trademark, CCPA, SCCs, analytics consent |
| Execution Clarity    | 4            | Very detailed for legal tasks; but attorney timelines are optimistic |
| Dependency Coverage  | 3            | Missing cross-references to Master Plan BLK IDs for some tasks |
| Risk Coverage        | 3            | Missing risk for attorney availability, DPA negotiation delays |
| Testing/Validation   | 2            | No compliance validation test suite; relies on manual checks |

**MUST ADD (Critical):**
- **Fix all BAA→DPA references:** Revora is not HIPAA-covered. Replace SC-001 BAA with DPA. Replace all HIPAA language with GDPR. SC-001 effort: 30 minutes (self-service), not 6 hours.
- **Add SC-030: Trademark search for "Revora":** Week 1, $500-$1K, 2-4 week lead time per PRD §10.6.
- **Add SCC verification task (SC-031):** Verify Standard Contractual Clauses in DPAs with US-based processors (Railway, OpenAI, Cloudflare). Week 2, 2 hours.
- **Add CCPA compliance task (SC-032):** "Do Not Sell" disclosure + opt-out mechanism per PRD §10.3. Week 6, 4 hours.

**SHOULD ADD (High Value):**
- **Compliance testing automation:** Add CI checks for disclaimer presence (grep for required disclaimer strings on all scan result and A1C screens). Week 6, 4 hours.
- **Data breach response plan:** PRD §10.3 mentions "72-hour notification, incident response plan." No task creates this plan. Add SC-033. Week 10, 4 hours.
- **Risk: Attorney availability:** Add risk that FTC attorney engagement may take 2-4 weeks. Start search Day 1.
- **Privacy policy localization assessment:** Determine if separate EU/US policies needed or one unified policy.

**REMOVE OR DEFER:**
- **SC-005 (Entity Formation):** If entity exists, remove entirely. If not, flag as pre-project prerequisite outside plan scope.
- **SC-011 (Cookie Banner):** Already correctly marked as deferred. No change needed.
- **SC-012 (GDPR Representative):** Correctly deferred until first EU user. No change needed.

**HOURS ESTIMATION AUDIT:**
- **Over-estimated:** SC-001 (OpenAI DPA, 6h) — self-service DPA in console takes 30 minutes per Master Plan. Adjusted: 1h (including documentation).
- **Under-estimated:** SC-006 (FTC Attorney, 6h) — finding, vetting, and engaging a specialized attorney takes 10-15h including initial consultation. Adjusted: 12h.
- **Missing:** No hours for trademark search. Add 3h for filing + monitoring.

**CROSS-DOMAIN GAPS FOR THIS PLAN:**
- No coordination with Frontend on GDPR consent flow implementation (FE-020 depends on SC-008/SC-009).
- No task for creating the Privacy Policy URL placeholder for dev/staging environments.

---

## 5. DEVOPS IMPLEMENTATION PLAN — Optimization Report

| Dimension            | Rating (1-5) | Key Gaps Found |
|----------------------|--------------|----------------|
| Completeness         | 4            | Solid infrastructure coverage; missing production deploy runbook |
| Execution Clarity    | 5            | Exceptional — CLI commands, config files, verification steps on every task |
| Dependency Coverage  | 4            | Good; missing explicit dependency on Security Plan for DPA completion before secrets |
| Risk Coverage        | 3            | Missing: Railway outage fallback, GitHub Actions rate limiting |
| Testing/Validation   | 3            | OWASP scan good; missing infrastructure validation tests |

**MUST ADD (Critical):**
- **Production deployment runbook:** No task for creating a step-by-step production deploy process. Add DO-035: create `docs/runbooks/PRODUCTION_DEPLOY.md` including rollback procedure. Week 14, 4 hours.
- **Database backup strategy:** No backup task. Railway PostgreSQL needs backup configuration. Add DO-036: configure automated daily backups + verify restore procedure. Week 3, 4 hours.

**SHOULD ADD (High Value):**
- **Staging environment smoke test:** After each deploy to staging, run basic health checks (auth, scan mock, dashboard). Add as post-deploy step in CI. Week 3, 3 hours.
- **Log aggregation setup:** Structured logs configured in BE-003 but no log aggregation tool (Railway logs are ephemeral). Consider Grafana Cloud free tier or Axiom. Week 6, 4 hours.
- **SSL certificate monitoring:** Verify TLS 1.3 minimum on custom domains. Add automated check. Week 3, 1 hour.
- **Resource alerting:** Railway CPU/memory alerts before hitting scaling limits. Week 6, 2 hours.

**REMOVE OR DEFER:**
- No tasks need removal. Plan is well-scoped.

**HOURS ESTIMATION AUDIT:**
- **Under-estimated:** DO-005 (Railway setup, 5h) — two environments + PostgreSQL + Redis + custom domains + env vars realistically takes 6-8h. Adjusted: 7h.
- **Missing:** No hours for production environment setup (separate from staging). Add 4h Week 14.

**CROSS-DOMAIN GAPS FOR THIS PLAN:**
- No explicit handoff when staging environment is ready for Frontend to test against.
- Missing coordination with QA Plan for load testing infrastructure (k6 needs specific Railway configuration).

---

## 6. MONETIZATION & REVENUE IMPLEMENTATION PLAN — Optimization Report

| Dimension            | Rating (1-5) | Key Gaps Found |
|----------------------|--------------|----------------|
| Completeness         | 2            | Wrong prices, missing lifetime tier, wrong timeline, missing trial |
| Execution Clarity    | 4            | Good step-by-step for App Store/Play Store setup; broken by wrong values |
| Dependency Coverage  | 3            | Missing DEP-004 explicit reference to Master Plan |
| Risk Coverage        | 3            | Revenue projections good; missing risk for App Store IAP review rejection |
| Testing/Validation   | 2            | No sandbox testing plan, no VAL-027 test procedure |

**MUST ADD (Critical):**
- **Fix all pricing:** $9.99→$12.99 monthly, $79.99→$99.99 annual, add $249.99 lifetime. Every pricing reference in the plan.
- **Add lifetime tier:** MON-003 (App Store non-consumable product), MON-004 (Google Play one-time purchase), MON-007 (RevenueCat lifetime entitlement).
- **Add 7-day free trial implementation:** PRD §9.3 defines this. Configure in App Store Connect and Google Play. Add trial expiration handling in webhook.
- **Align timeline to Master Plan:** Move RevenueCat SDK integration from Week 3 to Week 12. Paywall implementation from Week 4-5 to Week 13. Keep account setup (MON-001/002) in Week 1-2.

**SHOULD ADD (High Value):**
- **Sandbox testing plan (MON-020):** Define explicit test matrix: purchase monthly, purchase annual, purchase lifetime, cancel, restore, grace period, billing failure. Week 13, 6 hours.
- **VAL-027 test procedure:** Define step-by-step validation that subscription lifecycle works end-to-end (purchase → webhook → DB update → UI change within 60s). Week 13, 4 hours.
- **Promotional pricing configuration:** PRD §9.2 defines launch pricing (50% off first month). Configure in App Store Connect promotional offers. Week 14, 3 hours.
- **Revenue dashboard:** Create RevenueCat + PostHog dashboard showing MRR, conversion rate, churn. Week 13, 4 hours.
- **App Store IAP review risk:** Add risk that App Store may reject IAP setup for health apps (requires additional documentation). Mitigation: prepare health app declaration early.

**REMOVE OR DEFER:**
- **MON-005 revenue projections:** Keep but update with correct pricing. Projections at $9.99 are invalid — recalculate at $12.99.
- Remove all references to "$9.99" and "$79.99" — these values appear dozens of times.

**HOURS ESTIMATION AUDIT:**
- **Under-estimated:** IAP-001 (Purchase flow, 10h) — with lifetime tier + trial handling + error cases, realistically 14-16h. Adjusted: 15h.
- **Missing:** No hours for lifetime purchase implementation (different flow from subscriptions). Add 6h.
- **Missing:** No hours for promotional pricing setup. Add 3h.

**CROSS-DOMAIN GAPS FOR THIS PLAN:**
- No coordination with Backend Plan on RevenueCat webhook endpoint (BE task, not Monetization task).
- No coordination with Frontend Plan on paywall UI design (depends on Product/Design mockup).

---

## 7. PRODUCT/DESIGN IMPLEMENTATION PLAN — Optimization Report

| Dimension            | Rating (1-5) | Key Gaps Found |
|----------------------|--------------|----------------|
| Completeness         | 3            | Wrong colors, wrong onboarding, wrong owner assignments, missing screens |
| Execution Clarity    | 4            | Component specs are excellent; Figma screen specs need PRD alignment |
| Dependency Coverage  | 4            | Good DEP-021/022/023 tracking |
| Risk Coverage        | 3            | Missing risk for Figma tool access/licensing, design review bottleneck |
| Testing/Validation   | 3            | Usability testing planned (Week 8); missing accessibility testing tools |

**MUST ADD (Critical):**
- **Fix color palette:** Align to PRD §8.3 — Primary: `#0D7377`, Safe: `#4CAF50`, Warning: `#FF9800`, High: `#F44336`.
- **Fix onboarding screen spec:** Replace 3-slide carousel with 6 screens per PRD §6.1.
- **Fix task ownership:** PD-015 through PD-018 should be Person B, not Person A.
- **Add Phase 2 screen designs:** A1C Progress, Walk Timer, Meal History, Weekly Insights, Data Export. Schedule Week 6-8. ~16 hours.

**SHOULD ADD (High Value):**
- **Accessibility color checker:** Run automated WCAG contrast check on updated PRD colors (some PRD colors may fail WCAG AA). Week 1, 2 hours.
- **Design QA checklist template:** Create reusable checklist for Week 13 Design QA gate (BLK-D05). Week 8, 2 hours.
- **Empty state designs:** PRD mentions empty states for dashboard and meal history. Design these in Figma. Week 4, 4 hours.
- **Error state designs:** Design error screens (network, timeout, invalid image) for consistent error UX. Week 4, 3 hours.

**REMOVE OR DEFER:**
- No tasks need removal. Plan is appropriately scoped for design domain.

**HOURS ESTIMATION AUDIT:**
- **Under-estimated:** PD-010 (Figma mockups 8 screens, 12h) — 8 high-fidelity screens in light+dark mode with interactive prototype is realistically 20-24h. Adjusted: 22h.
- **Missing:** No hours for Phase 2 screen designs. Add 16h Weeks 6-8.
- **Missing:** No hours for design iteration after usability testing (Week 9). Add 8h.

**CROSS-DOMAIN GAPS FOR THIS PLAN:**
- No coordination protocol for design review handoff to Frontend (Figma Dev Mode access, CSS extraction process).
- No task for creating app icon and App Store screenshots (needed for Week 14-15 submission).

---

## 8. QA/TESTING IMPLEMENTATION PLAN — Optimization Report

| Dimension            | Rating (1-5) | Key Gaps Found |
|----------------------|--------------|----------------|
| Completeness         | 2            | Wrong test framework (pytest for Rust), wrong DB schema, missing many VAL tests |
| Execution Clarity    | 3            | Good structure but incorrect implementation details undermine usability |
| Dependency Coverage  | 2            | Not tracked in Master Plan; no DEP/BLK references |
| Risk Coverage        | 2            | No risk for test environment instability, flaky tests, CI timeout |
| Testing/Validation   | 3            | Good test case structure; but coverage of VAL-001 through VAL-030 is incomplete |

**MUST ADD (Critical):**
- **Add to Master Plan domain coordination:** QA Plan is orphaned — needs DEP/BLK/RSK tracking.
- **Fix backend testing approach:** Primary framework is `cargo test` (Rust), not pytest. Python integration tests are supplementary only.
- **Fix seed data schema:** Rewrite QA-004 seed.sql to match Spec §4.3 tables (scans, food_items, etc. — not meals.food_description).
- **Add VAL-001 through VAL-030 test mapping:** Create matrix showing which QA task covers which VAL criterion.

**SHOULD ADD (High Value):**
- **Guest mode E2E test:** 3 scans → conversion → data preserved (VAL-013). Week 8, 4 hours.
- **GDPR E2E test:** Export → verify completeness → Delete → verify purge. Week 10, 4 hours.
- **Compliance regression tests:** Automated checks for disclaimer presence, reversal language absence, A1C bounds display. Run in CI. Week 6, 6 hours.
- **Performance regression baseline:** Establish P95 latency baselines early (Week 6) so regression is detectable. Week 6, 3 hours.
- **Penetration test coordination:** Cross-reference SC-024, provide QA support for remediation. Week 13-14, 8 hours.

**REMOVE OR DEFER:**
- **QA-002 pytest framework as primary:** Downgrade to supplementary. Keep for HTTP-level smoke tests only.

**HOURS ESTIMATION AUDIT:**
- **Under-estimated:** QA-003 (Detox E2E setup, 8h) — Detox with Expo is notoriously complex (native build required, CI configuration challenging). Realistically 12-16h. Adjusted: 14h.
- **Missing:** No hours for VAL-001 test support (Person A runs accuracy test, but QA should independently verify). Add 6h Week 14.
- **Missing:** No hours for penetration test support. Add 8h Week 13-14.

**CROSS-DOMAIN GAPS FOR THIS PLAN:**
- No dependency on Backend for test environment provisioning.
- No coordination with AI/ML for accuracy test dataset creation (shared resource).
- No CI pipeline integration documented (references DO-009 but no explicit dependency).

---

## CROSS-CUTTING RECOMMENDATIONS

(Issues that affect multiple domain plans simultaneously)

1. **Pricing Consistency Enforcement [D6, D4, D7, D2]:** Create a single `docs/PRICING.md` constants file that all plans reference. Any pricing change requires updating this file first. Add CI check that validates pricing constants across codebase.

2. **Safety Floor Source of Truth [D3, D1]:** Create `docs/SAFETY-FLOORS.md` with the 6 PRD-defined categories, exact GL values, and portion references. Both AI/ML and Backend plans reference this file instead of independently defining values.

3. **Design Token Alignment [D7, D2]:** Product/Design Plan must fix colors to PRD §8.3 BEFORE any Frontend implementation begins. Create a blocking dependency: PD-001 (corrected) → FE component implementation.

4. **A1C Algorithm Single Source [D3, D1]:** The A1C estimation algorithm exists in PRD §6.4, Spec §4.2.5, AI/ML Plan AI-017, and Backend Plan BE-052. Create `docs/A1C-ALGORITHM.md` as single reference. All plans point to Spec §4.2.5. Eliminate duplicate (potentially conflicting) definitions.

5. **GDPR Consent Flow Coordination [D4, D2, D1]:** EU analytics consent requires coordination across Security (legal requirements), Frontend (UI implementation), and Backend (conditional data processing). Add a cross-domain task owned by Founder.

6. **Master Plan QA Integration [All domains]:** QA/Testing Plan must be formally added to Master Plan §5 with DEP/BLK tracking. Without this, QA tasks have no visibility in weekly syncs.

7. **Compliance CI Enforcement [D5, D4, D2, D1]:** Extend the reversal language grep to also check for: incorrect pricing values, missing disclaimer strings, PHI in analytics events. One CI job, multiple compliance checks.

---

## TOP 10 HIGHEST-IMPACT RECOMMENDATIONS (ranked by launch risk reduction)

1. **Fix Monetization Plan Pricing** — Monetization Plan — Wrong pricing ($9.99/$79.99 vs $12.99/$99.99/$249.99) propagates to App Store/Play Store configuration, RevenueCat products, paywall UI, and revenue projections. If shipped with wrong prices, either revenue is 23% below plan or a post-launch price change alienates early adopters.

2. **Fix A1C Algorithm in AI/ML Plan** — AI/ML Plan — Safety-critical: the discrete tier formula in AI-017 produces materially different A1C estimates than the continuous formula in Spec §4.2.5. Wrong A1C estimates could lead to incorrect health decisions by users.

3. **Fix Security Plan BAA→DPA** — Security/Compliance Plan — Pursuing a HIPAA BAA instead of a GDPR DPA wastes 2-4 weeks (BAA requires enterprise sales; DPA is self-service in 30 minutes) and misidentifies the legal framework, risking non-compliance with actual GDPR requirements.

4. **Fix Safety Floor Categories and Values** — AI/ML + Backend Plans — Mismatched safety floors between plans mean the 8 food categories tested in AI/ML won't match the 6 categories implemented in Backend. VAL-009 will test wrong categories. Safety-critical for user health.

5. **Add Lifetime Tier to Monetization** — Monetization Plan — Missing $249.99 lifetime tier means 5% of projected subscribers (per PRD §9.4) have no purchase path. Requires PRD-defined product configuration in both app stores and RevenueCat.

6. **Align Monetization Timeline to Master Plan** — Monetization Plan — 10-week discrepancy (Week 3 vs Week 12-13) overloads Person A during critical scan pipeline development and creates schedule conflict with Backend core features.

7. **Fix Color Palette in Product/Design** — Product/Design Plan — Design tokens drive ALL UI implementation. Wrong colors propagate to every screen. Frontend Plan already references PRD colors in some tasks, creating inconsistency with Product/Design tokens.

8. **Add QA Plan to Master Plan** — QA Plan — Orphaned QA plan means quality assurance has no visibility in weekly syncs, no DEP/BLK tracking, and no gate alignment. QA gaps discovered late cascade into launch delays.

9. **Fix Complexity Classification Names** — AI/ML Plan — Using SIMPLE/MODERATE/COMPLEX instead of SIMPLE/COMPLEX_B/COMPLEX_C creates API contract mismatch between Backend (correct names) and AI/ML Plan (wrong names). Frontend UI display logic depends on exact enum values.

10. **Add FTC Attorney as Master Plan Blocker** — Security/Compliance Plan → Master Plan — PRD §10.6 lists FTC attorney review as a pre-launch blocker, but it's not in the Master Plan BLK register. Without tracking, this $5K-$21K, multi-week dependency could slip unnoticed.

---

**END OF TASK 2 REPORT**
