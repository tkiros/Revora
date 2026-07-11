# Revora Release Scorecard — regenerated 2026-07-11 (validation round)

Supersedes `03-release-scorecard.md` (2026-07-10), which is stale in both directions: it still lists Security as NO-GO (SEC-03/04/05 since fixed) and misses the P0-severity findings confirmed by `sol_deep_analysis_validation.md`. Finding IDs (F-xx/N-xx/W-xx) refer to that validation doc and `revora_unconditional_go_implementation_plan.md`.

**Evidence base:** fresh full test run 2026-07-11 (819 passed / 0 failed / 107 files) · live bakeoff artifacts · E2E-06 Stripe lifecycle proof · six-domain code validation with file:line evidence · git/origin state checks.

| Domain | Current status | P0 open | P1 open | Evidence | Required action | Release decision |
|---|---|---:|---:|---|---|---|
| Core functionality | PASS (code) / PARTIAL (evidence) | 0 | 1 | 819 unit/eval tests green; smoke suite green last run; **but** delivered-result-rate fix not re-validated live (N-02) | W-07 live re-run with credentials | GO after W-07 artifact |
| Food and nutrition analysis | FAIL (no accuracy evidence) | 1 (F-06 gate) | 1 (F-12) | Risk-accuracy gate never evaluated (0 labeled cases); no dietitian review; advice hardcoded (F-12) | Phase 0.5 labels; W-05 expert validation; W-17 variation | NO-GO for broad paid launch until W-05 gates pass |
| AI safety and uncertainty | PARTIAL | 2 (F-09/F-10, F-13) | 2 (N-01, F-31) | Strong verified scaffolding (floors, fail-closed retry, photo confirm, A1C code gate) **but** zero clinical-risk routing; "steady choice" praises HIGH meals; claims regexes unenforced at runtime | W-01, W-03, W-06 | NO-GO until W-01/W-03 land |
| Model selection | PARTIAL | 1 (F-21) | 1 (N-19/N-02) | Bakeoff favors mini (100% schema-valid) and scoped nano to outage-only — yet code routes **paying users** to nano from check #11; post-fix re-run failed on credentials; thresholds unratified; provider mismatch (OpenRouter bench vs OpenAI prod) | W-02 remove tiering; W-07 re-run + ratify | NO-GO until W-02; then CONDITIONAL on W-07 |
| Payments and entitlement | PASS (core) / PARTIAL (edges) | 0 | 3 (N-04, N-06, N-05) | Server-side entitlement tamper-resistant (verified); Stripe sig verified fail-closed; E2E-06 12/12; **unproven:** trial→active vs real Stripe (needs test clocks); open: trial/start abuse, refund-ordering, repeat trials | W-11, W-12, W-16; Phase 0.3 test-clock run | GO with conditions (fixes are XS–S) |
| Privacy and consent | FAIL | 1 (N-23) | 2 (N-24, PRIV-01) | AES-256-GCM at rest verified; `store:false` on all 3 call sites; meal-check photos genuinely unretained; Sentry scrubber + PII-free telemetry verified; consent enforced server-side; **no cross-account access path found**; **but pantry photos are public-read and survive account deletion** — two published privacy promises false today (`privacy/page.tsx:95-97,126`); no export (counsel) | W-33 blob lifecycle; W-25 export per counsel; W-34 key versioning (P2) | NO-GO until W-33 |
| Security | PARTIAL | 1 (F-26 ⚖) | 2 (SEC-01/02, N-04) | CSP ✔, Next patched ✔, no client secrets ✔, webhooks fail closed ✔; **but** Terms render placeholder brackets (blocks taking money); 5 keys in git history still un-rotated (owner); trial/start abuse vector | W-04, W-14, W-11 | NO-GO for paid launch until W-04 + W-14 |
| Accessibility | PASS (automated) / PARTIAL (manual) | 0 | 0 | Icons+labels+color (never color-only) verified; axe suites green; reduced-motion global; skip link; **gaps:** no VoiceOver/TalkBack/Dynamic-Type pass, axe not in CI, no desktop Playwright project | Manual device checklist; axe into CI (W-08) | GO + manual checklist before launch |
| Reliability and resilience | PASS | 0 | 0 (2 P2) | Fail-closed verified end-to-end (timeout 10s, single-paid-attempt, connection retry, retry card verdict-free, kill switch); P2s: SW never E2E'd, rate limiter fails open (accepted) | W-23 (P2) | GO |
| Performance and cost | PASS (measured) / PARTIAL (SLO) | 0 | 0 (1 P2) | p50 ~1.7–2.0s, p95 ≤5.1s measured; ~$0.001/check; image downscaling client-side; **but** proposed p95 SLO unmeasurable from bucketed telemetry (N-13), and mini's p95 already touches the 5s target | W-13 duration telemetry; set SLO from W-07 data | GO with SLO caveat |
| Analytics and observability | FAIL | 0 | 2 (N-12, N-03) | No feedback/helpful event, no activation funnel, no churn events — the product cannot measure its own top risks; CI not on origin/main; alerting prose-only; no client Sentry | W-10, W-08, W-22 | NO-GO for launch-scale operation until W-10/W-08 |
| Claims and communication | PARTIAL | 1 (with F-26) | 3 (F-04, F-07, F-14) | Disciplined on banned-verb families (verified negative result); **but** universal swap promise vs SAFE-null contract, three inconsistent free-tier numbers incl. Play listing "five a day, every day", BAI DPP association; hero overstatement (P1/P2) | W-09 reconciliation PR + ⚖ review | NO-GO for store submission until W-09 |

## Overall verdict: **NO-GO** (for broad public paid launch, as of 2026-07-11)

Per the decision rubric — one or more unresolved P0 issues → NO-GO. The six P0-class blockers:

1. **F-09/F-10** — no clinical-risk routing; clinical eval categories absent and schema-locked out (W-01, effort M).
2. **F-21** — paying users silently downgraded to the model that failed the project's own quality gate, while sold "unlimited everything" (W-02, effort XS).
3. **F-13** — repeated HIGH-risk meals praised as "a steady choice" (W-03, effort XS).
4. **F-26** — Terms of Service renders placeholder brackets (no entity, no governing law); cannot take subscription money (W-04, counsel + XS eng).
5. **F-06** — no clinical/expert validation evidence for the verdict system; automated accuracy gate has never run (W-05 + Phase 0.5 labels).
6. **N-23** — pantry photos in public-read blob storage survive account deletion (orphaned forever); published deletion promise is false (W-33, effort S).

**What NO-GO does not mean:** development, private beta, and store-prep work continue safely — the fail-closed architecture, entitlement enforcement, privacy posture, and billing core are verified strong. This is a *launch* gate, not a product-viability verdict.

**Path back:**
- After Phase 1 (≈2 eng-weeks + counsel): expected **CONDITIONAL GO** — zero P0s, named P1 conditions (W-06…W-17) with owners.
- After Phase 2 + W-05 validation gates + W-14 rotations attested: eligible for **UNCONDITIONAL GO**, provided every criterion in the validation doc's Unconditional-Go table carries passing evidence — not assertions.

**Standing rule reaffirmed:** `BLOCKED ≠ PASS`. Items unverifiable in this environment (key rotations, live Stripe webhook registration, Play Console products, manual screen-reader passes, expert validation) stay open until evidenced.
