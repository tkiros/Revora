# Revora E2E, promise, and paid-retention continuation handoff

> Report-only audit continuation. No product fix, commit, deployment,
> production mutation, real charge, real email, or flag change was performed.
> Counsel, dietitian, and other outsider views do not decide any item below.

## Current decision

- Engineering E2E: `FAIL`
- Core promise: `FAILED`
- Health/claims safety: `FAIL`
- Paid retention: `INSUFFICIENT EVIDENCE`
- Production: `NO-GO`

Canonical report:
[2026-07-23-revora-e2e-promise-retention-audit-report.md](./2026-07-23-revora-e2e-promise-retention-audit-report.md).

## Exact candidates

- Opening local branch: `docs/b1-b2-final-closeout`
- Opening local SHA: `b5c03f4666ea793923482b08fd53c45c037467e7`
- Deployed/tested production SHA:
  `24d88ec85ba52162544e0336a189db340c18616d`
- Production deployment: `dpl_xSxcn7uzGoBF8XmSjD2bFS4VDtvm`
- Production URL: `https://revora.plus`

## Stop-the-line items

| Finding | Status | Owner action | Closure command/evidence | Next decision |
|---|---|---|---|---|
| AUD-015 — broad symptom route gives 15-gram/15-minute treatment instruction | OPEN P0 | Engineering/product safety changes runtime copy while preserving deterministic no-model routing | Re-run R018/R020 plus immutable broad-trigger corpus; no food dose/timing/treatment phrase may render | Health axis may be reconsidered only after exact-candidate zero violations |
| AUD-024 — reachable Auth.js Unicode email-normalization advisory | OPEN P0 | Security/identity updates to fixed chain or adds canonicalize-before-validate enforcement and invalidates outstanding tokens as appropriate | `npm audit --omit=dev`; Unicode-separator request/delivery corpus; authenticated cross-account denial | Sign-in may be reconsidered only when advisory is absent or unreachable by proven mitigation |
| AUD-025 — missing model config preempts clinical/A1C/schema routes | OPEN P0 | Engineering makes provider construction lazy behind deterministic routes | Re-run R017/R020 with missing, invalid, and unreachable provider; assert correct route and zero provider construction/calls | Reliability/health may be reconsidered only when every deterministic case survives |

Nineteen P1, five P2, and four P3 items remain in the
[canonical ledger](./2026-07-23-revora-e2e-issue-ledger.csv). A release decision
also requires every P1 to be closed, explicitly deferred with user-safe
containment, or removed from the active product promise.

## Exact full-gate commands

Run from a clean worktree at the proposed release SHA with disposable loopback
Postgres and no inherited provider routes:

```bash
env -u REVORA_MODEL -u OPENAI_BASE_URL npm ci
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run lint
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run typecheck
env -u REVORA_MODEL -u OPENAI_BASE_URL npm test
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run contract
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run build
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run eval:revora
env -u REVORA_MODEL -u OPENAI_BASE_URL -u OPENAI_API_KEY -u REVORA_LIVE_EVAL npm run eval:pantry-extract
env -u REVORA_MODEL -u OPENAI_BASE_URL -u OPENAI_API_KEY npm run eval:meal-photo
npm run e2e
npm audit --omit=dev
npm audit
git diff --check
```

Do not count the Pantry or meal-photo live-provider skip as a pass. Do not run
either live without an explicit budget, reviewed non-user fixtures, known
provider route, and active authorization.

## External or time-bound blockers

| Blocker | Current status | Owner/action | Decision unlocked |
|---|---|---|---|
| Normal live-model meal quality | Not authorized/tested | Owner supplies explicit budget, provider route, and privacy-safe immutable corpus after P0 closure | Whether representative ordinary meals meet grounding/actionability promises |
| Photo/Pantry model and private Blob composition | Safe default skipped | Provider/engineering owner supplies sandbox fixtures and credentials after atomicity/entitlement fixes | Whether enabled photo and paid Pantry work end to end |
| Google Play purchase/RTDN/restore | No licensed-device sandbox run | Mobile/billing owner performs sandbox device lifecycle | Whether Play access is operationally ready |
| Real email delivery | No audit email sent | Operations supplies a safe mailbox and authorizes non-user sandbox delivery | Delivery/retry/suppression proof |
| Production signed-in cross-user journey | Not mutated | Security owner supplies disposable production-like accounts or equivalent isolated staging | Object-level authorization in deployed composition |
| Production browser console/hydration crawl | Audit-host Chromium suffered `ERR_NETWORK_CHANGED` | Re-run from a stable independent host against exact deployed SHA | Clean production browser evidence |
| Real-user value | No study | Research owner runs representative comprehension/actionability study after engineering closure | Promise can move beyond technical demonstration |
| Paid retention | Zero paid/activated cohort; maximum measured period 0 days | Founder/research runs corrected preregistered paid experiments | D30/D90/D180/D365 conclusions as cohorts mature |

## Retention decision sequence

1. Keep Meal Memory and Learning Journey off.
2. Close P0/P1 safety, privacy, billing, and availability findings.
3. Correct and freeze the concierge protocol before enrollment.
4. Run the three-week intent-to-treat paid concierge with at least eight
   enrollees, one real disclosed price commitment, unprompted behavior,
   counterfactual/substitute evidence, and precommitted safety stop.
5. Only a pass may justify a powered 90-day paid cohort.
6. D180 and D365 remain unavailable until those exact periods mature.

## Preserved evidence

- Full run table:
  [2026-07-23-revora-e2e-run-evidence.csv](./2026-07-23-revora-e2e-run-evidence.csv)
- Local Playwright report:
  `artifacts/qa/2026-07-23-e2e-production-sha-24d88ec/playwright-report.html`
- Critical cards:
  `artifacts/qa/2026-07-23-critical-runtime/`
- Production crawl blocker evidence:
  `artifacts/qa/2026-07-23-production-route-crawl/`

The next executor must refresh branch, SHA, dirty state, production deployment,
flags, provider state, and cohorts before inheriting any status from this
handoff.

## Canonical artifact SHA-256

| Artifact | SHA-256 |
|---|---|
| Canonical report | `5702a4372cae30d97d2ea584d05e5cad3cdec3d9a0e4c504eaf12fa4a6297ff9` |
| API matrix | `0b0d987281feadfc9aa7a0be1bf34898ff9f992f2c702f7d31514d56c000631c` |
| Feature/function matrix | `fd1666c49f4414a5a61512111977f10a99711327bc2c85a09ea21895d569ce22` |
| Flag/role/state matrix | `bb59e04f0c4196dc3d559b052f35b162c3b6c6dea7046d6757aa692773f68d90` |
| Issue ledger | `0da95dcfdc4859de70eb03733c19640831e4617827e664767f350d65bd55377a` |
| Promise matrix | `6a839180260e648e92b9b43f2b5eb878f947a026628be24b3838b867d5998be0` |
| Source inventory | `5b1faaec92d2bc256343069caed48b7766d70ae2242fa7ea27118b3184f7dac8` |
| Test inventory | `c966a3e3cb5a16d948b2d89c911f7439eb749d8683fbf06114521973e422b633` |
| Test-case inventory | `51a1dece8ac7c1eaa25a13862cbc87c9d42a9cbe658bfca4eb1103ae538e59ea` |
| Document corpus | `ac9fbb35082ac4742d9d35cf691b6b2e199a04c77586f4e0afdaa02048e54bb7` |
