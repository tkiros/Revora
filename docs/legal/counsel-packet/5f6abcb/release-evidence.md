# Release evidence — code candidate `5f6abcb`

## Identity

- Full SHA: `5f6abcb31c175fdc6840b74c2c602dc5b3fc7ad8`
- Branch: `feat/counsel-gate-candidate`
- Integrated base: `eb28ef743749173f3ebb415d7ec4b7febb65d399`
- Legal-package source commit: `9bc5cf312494491ab467b5537a29ea60958bd33f`
- Integration commit: `4d23ca3`; lifecycle assertion correction: `3293942`;
  root graded-eval empty-set gates integrated from `deebd07` as `5f6abcb`
- Migrations added: `0003_hesitant_frog_thor.sql`,
  `0004_aspiring_jocasta.sql`

## Local verification observed on 2026-07-12 EDT

| Command | Result |
| --- | --- |
| `npm run typecheck` | PASS, no TypeScript diagnostics |
| `npm test` | PASS: 114 files passed, 1 skipped; 1111 tests passed, 2 skipped; duration 319.11s |
| `npm run eval:revora` | PASS: 1 file, 9 tests; mock/code regression evidence only |
| `npx vitest run tests/evals/revora-graded-eval.test.ts --reporter=verbose` | PASS in mock mode: total 88, modelCalls 24, modelFailures 0, harmfulSafe 0, labeledCount 24, riskCorrect 24, riskAccuracy 1, usefulnessFailures 0, adversarialFailures 0, passed true; not a live-model result |
| `npm run build` | PASS with lockfile-pinned local install; 67 routes generated, including health-data deletion, photo-draft, coach, billing and Pantry APIs |
| `git diff --check` | PASS |
| focused claims/privacy/billing/consent/deletion/feature-gate tests | PASS after merge reconciliation |
| Mobile Chrome billing/onboarding/dashboard/photo/daily-loop, one worker | Completed: 18 passed and 1 flaky test passed on retry; the retry was signed-out account-page cold compilation, not represented as a clean first-attempt pass |

The first build attempt is excluded as proof: before `npm ci`, Turbopack
resolved a home-level Next install and failed workspace-root discovery without
compiling the candidate. After the lockfile-pinned install, the candidate build
compiled successfully. `npm ci` reported four existing moderate dependency
vulnerabilities; no automatic breaking upgrade was applied.

## Launch flag table

| Variable | Candidate requirement |
| --- | --- |
| `NEXT_PUBLIC_PHOTO_INPUT` | unset; only exact `1` enables; candidate smoke proved hidden control and route `404` |
| `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS` | unset; only exact `1` enables; candidate API/unit/browser tests proved no output/promise when off |
| `LEGAL_TERMS_FINAL` | owner authorized `1` for limited real Stripe WTP after no-placeholder/legal-assent live proof; otherwise all paid entry points return `503` |

## Explicitly not tested/proved

- No preview or production deployment of this SHA.
- No application of migrations `0003`/`0004` to preview or production.
- No authenticated production database, consent withdrawal, erasure, account,
  email, reminder, Stripe, Play, Pantry processing, cancel, or refund proof.
- No verification of real `LEGAL_ENTITY_NAME`, `SUPPORT_EMAIL`, jurisdiction,
  prices, provider contracts, transfers, retention, backups, or incident plan.
- No live-model safety run, RD/CDCES validation, or clinical correctness proof.
- No licensed-counsel written opinion. The owner accepted the documented
  residual risk on 2026-07-12; this is not legal clearance.

Therefore this evidence establishes a locally verified integrated code
candidate only. It does not establish deployed-runtime truth or legal
compliance. Professional review was waived; the separate owner-risk decision
controls the operational launch prerequisite.
