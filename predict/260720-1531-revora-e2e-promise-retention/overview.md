# Predict Swarm — Revora E2E / Promise / Paid-Retention

**Date:** 2026-07-20 · **Commit:** abfa058 · **Depth:** Deep (8 personas) · **Chain:** debug → fix (executed inline)

## Run shape
- **Reconnaissance:** 6 parallel Explore agents (routes, lib, data-ops, tests, docs, client) → denominators + hypothesis seeds.
- **8 personas** (independent analysis, each verifying seeds against source): security, health-safety, billing, privacy, reliability, retention, architecture+a11y, devil's-advocate.
- **Debate/consensus (synthesizer role):** cross-persona dedup + severity arbitration weighing each specialist against the devil's advocate and the real Vercel+Railway topology; the synthesizer independently re-verified the top items (openr.md git history, `check/route.ts` fail-open, `postprocess` componentMention, `input-precheck` sugary buffer, auth-email path).
- **Debug chain:** every persona output classified CONFIRMED / REFUTED / NEEDS-RUNTIME against current source. **14 plausible alarms refuted.**
- **Fix chain:** 4 safe-direction / pure-improvement defects fixed with regression tests (HS-1 clinical-before-paywall, PR-3 decrypt tamper-alerting, SA-12 upload 400, AA-9 checkout a11y); one attempted fix (HS-2 sugary floor) implemented, validated against the safety eval as an oracle, and **reverted** when a unit test proved the behavior was intentional design.

## Anti-herd note
The devil's advocate materially moved consensus: it downgraded/refuted the fail-open cluster (guest-tier self-limiting; kill-switch is an ops gap not a security vuln), struck the video-engine "prod RCE" (double-locked), and surfaced the dominant non-code blocker (sign-in likely impossible in prod). Minority/refuted findings are preserved in the report, not discarded.

## Deliverable
Full findings, ledger, promise-to-proof matrix, retention analysis, applied fixes, and verdicts:
**`docs/handoff/2026-07-20-revora-e2e-promise-retention-audit-report.md`**

Knowledge artifacts: `knowledge-base.md`, `component-clusters.md` (this directory).

## Top-line verdicts
| Decision | Verdict |
|---|---|
| Engineering E2E | PARTIAL (1775 tests green; defects specified; e2e not run) |
| Core promise | TECHNICALLY DEMONSTRATED (no real-user evidence) |
| Health/claims safety | PASS-ENGINEERING / BLOCKED-HUMAN (RD never run) |
| Paid retention | INSUFFICIENT EVIDENCE (trending unlikely at current framing) |
| Production readiness | NO-GO (sign-in likely broken; counsel + RD gates open) |
