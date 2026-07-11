# 03 — Release Scorecard (QA round 2026-07-10/11)

| Domain | Status | P0 | P1 | P2 | Evidence | Release decision |
|---|---|---:|---:|---:|---|---|
| Core functionality | PASS | 0 | 0 | 1 (A11Y-01 CTA fold) | 814 unit tests, 105 E2E passed; 1 E2E fail = the P2 | GO |
| Food analysis accuracy/usefulness | FAIL (quality) | 0 | 1 (REL-02 retry rate) | 0 | bake-off runs: delivered rate 58–70% on model-reaching cases | Fix prompt-contract mismatch, rerun evals |
| AI safety and uncertainty | PASS | 0 | 0 | 0 | 0 harmful-SAFE across mock corpus + 2 live runs; adversarial/injection handled deterministically; fail-closed verified | GO (keep live gate as blocker) |
| Model selection | PASS | 0 | 0 | 0 | report 06: mini primary, nano fallback — CONDITIONAL on REL-02 fix | CONDITIONAL GO |
| Paywall and entitlements | PASS | 0 | 0 | 0 | unit + E2E both modes; server-side wall before spend; live store flows MANUAL | GO (with manual store checklist) |
| Privacy | PASS | 0 | 0 | 1 (PRIV-01 no export) | encryption-at-rest, telemetry-minimalism, deletion tests green | GO; counsel confirms export position |
| Security | FAIL | 0 | 3 (SEC-01/02/03) | 2 (SEC-04/05) | report 07 | NO-GO until key rotations + Next upgrade |
| Accessibility | PASS (automated) | 0 | 0 | 1 (A11Y-01) | axe suites green; screen-reader pass BLOCKED→manual | GO + manual checklist |
| Reliability | PASS | 0 | 1 (REL-02, shared w/ accuracy) | 2 (REL-01/03) | fail-closed verified live + unit fault injection | GO with monitoring |
| Performance / cost | PASS | 0 | 0 | 0 | p50 ~1.7–2.0s, p95 ≤5.1s vs 12s budget; ~$0.001/check | GO |
| Analytics / telemetry | PASS | 0 | 0 | 0 | no-PII + dedupe tests green | GO |
| Claims / copy boundaries | PASS | 0 | 0 | 0 | report 10; ledger-enforced; grep sweep clean | GO |

**Overall: CONDITIONAL GO.**
Zero unresolved P0s. Release requires, per policy:

1. SEC-01 + SEC-02 key rotations (human, ~30 min) — before any deploy.
2. SEC-03 `next` patch upgrade + suite rerun (eng, ~1 h).
3. REL-02 prompt/postprocess alignment as reviewed safety patch + eval rerun (eng + review, ~half day) —
   this is a quality blocker, not a safety blocker; shipping without it means a high
   retry rate, not unsafe output.
4. Manual store/billing + screen-reader checklists before public launch.

`BLOCKED ≠ PASS`: items in `05-known-risks-and-blockers.md` §Blocked remain unverified.
