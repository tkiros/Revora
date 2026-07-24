# Revora end-to-end promise and paid-retention audit

| Decision | Verdict | Confidence | Strongest evidence | Largest remaining gap | Exact next action |
|---|---|---:|---|---|---|
| Engineering E2E | **FAIL** | 99% | Exact deployed source reproduced three P0 blockers; the 71-method API matrix has 12 failed rows; 225 browser cases passing does not cancel the failures | Provider-backed Pantry/photo/Play/email flows, service-worker behavior, manual accessibility, and a clean production-browser crawl remain unverified | Produce one candidate that closes AUD-015, AUD-024, and AUD-025, then rerun the exact P0 regressions and full release denominator |
| Core promise delivery | **FAILED** | 98% | The real route loses deterministic safety routing when model configuration is absent; two acknowledged harmful-SAFE fixtures ship `Clear`; pediatric context can receive an adult result | No authorized live-model quality corpus and no representative real-user comprehension/value evidence | Close the deterministic promise failures before running a privacy-safe live-model and user-comprehension study |
| Health/claims safety | **FAIL** | 99% | A real Mobile Chrome card gives a food dose/timing instruction on broad symptoms; pediatric routing is absent; five forbidden personal-safety/prediction paraphrases pass the runtime gate | Live stochastic model behavior was not exercised | Remove the three engineering safety failures from the release candidate and rerun the immutable adversarial corpus; outsider opinions do not decide this verdict |
| Long-term paid retention | **INSUFFICIENT EVIDENCE** | 99% | Live-mode Stripe has zero Revora subscriptions; all three Revora Checkout Sessions are expired/unpaid; canonical production data has zero checks, subscriptions, memories, journeys, or weekly artifacts | There is no paid activated cohort and the study protocols are not execution-ready | After P0/P1 safety and commercial-truth closure, run the corrected three-week intent-to-treat paid concierge experiment described below |
| Production readiness | **NO-GO** | 99% | Production is reachable, healthy, and tied to exact SHA `24d88ec…`, but that deployed source contains three open P0 blockers and a reachable critical passwordless-auth advisory | Signed-in cross-user production journeys and live provider lifecycles were not safely exercised | Do not represent the current deployment as end-user-ready; close and retest every P0 before reconsidering launch |

> Audit type: report-only execution. No product source, production
> configuration, feature flag, payment object, user row, email, deployment, or
> provider state was changed. Suggested fixes in the ledger are recommendations,
> not applied remediation.
>
> Verdict independence: counsel, dietitian, simulated reviewer, and other
> outsider materials were inventoried only as an evidence class. None influenced
> severity, confidence, or any verdict in this report.

## Bottom line

Revora is deployed and has a large, generally disciplined deterministic test
suite. It is not end-user-ready on the evidence available today.

The decisive facts are engineering facts:

1. the active broad-symptom route prescribes about 15 grams of named fast
   carbohydrate and a 15-minute recheck;
2. a missing model credential causes clinical, A1C-boundary, and invalid-input
   routing to collapse into an unrelated “simpler food description” retry;
3. the production passwordless sign-in chain uses the affected Auth.js email
   normalizer from the critical
   [GHSA-7rqj-j65f-68wh advisory](https://github.com/advisories/GHSA-7rqj-j65f-68wh);
4. two release-corpus cases explicitly marked harmful if `Clear` are exempted
   from the hard gate and reproduce as `Clear`;
5. pediatric context is not deterministically excluded; and
6. indirect personal-safety and outcome-prediction phrases pass the runtime
   claims gate.

Revora also has no paid-retention evidence. The maximum period supported by a
real paid cohort is **zero days**. D30, D90, D180, and D365 are unmeasured.

## 1. Snapshot and revision truth

### Audit window

- Opening timestamp: `2026-07-23T21:36:42Z`.
- Current local date: `2026-07-23` in `America/New_York`; command evidence
  continued into `2026-07-24` UTC.
- Repository: `/home/tefera/Desktop/Revora`.
- Opening branch: `docs/b1-b2-final-closeout`.
- Opening local HEAD: `b5c03f4666ea793923482b08fd53c45c037467e7`.
- Production HEAD: `24d88ec85ba52162544e0336a189db340c18616d`.
- Relationship: local HEAD is zero commits ahead and ten behind production.
- Production deployment:
  `dpl_xSxcn7uzGoBF8XmSjD2bFS4VDtvm`, `READY`, target `production`,
  public aliases `revora.plus` and `www.revora.plus`.
- Production CI:
  [CI run 30045405756](https://github.com/tkiros/Revora/actions/runs/30045405756)
  and
  [CodeQL run 30045404709](https://github.com/tkiros/Revora/actions/runs/30045404709)
  both succeeded on exact SHA `24d88ec…`.
- Branch PR:
  [PR 35](https://github.com/tkiros/Revora/pull/35) merged local SHA
  `b5c03f4…` through merge commit `795d1a3…`.

The ten commits between local and production change eight paths: one closeout
report, two closeout status artifacts, CSP configuration, a Stripe test
lifecycle script, two Playwright specs, and one CSP unit test. The application,
meal engine, API handlers, data model, billing handlers, and product-copy paths
underlying the substantive findings are unchanged. All direct release tests
were therefore rerun from an isolated detached worktree at the production SHA.

### Opening dirty state

Opening user-owned tracked modifications:

- `docs/handoff/2026-07-21-c7-shipped-pr24-deploy-and-residuals-handoff.md`
- `docs/retention_flow.md`

Opening user-owned untracked files:

- `docs/handoff/2026-07-22-pr25-ci-unblock-merge-deploy-umami-csp-handoff.md`
- `docs/handoff/2026-07-22-revora-service-integrations-deep-audit-master-prompt.md`
- `docs/handoff/2026-07-22-revora-service-integrations-deep-audit-report.md`
- `docs/handoff/2026-07-22-stripe-webhook-verified-c7-closeout-handoff.md`
- `docs/handoff/2026-07-23-revora-service-integrations-autoresearch-fix-continuation-handoff.md`
- `docs/handoff/2026-07-23-revora-service-integrations-go-closeout-master-prompt.md`

`git diff --check` failed at opening on pre-existing trailing whitespace in
`docs/retention_flow.md:77`. No opening file was overwritten, staged, or
committed. An audit-side Playwright package-version change was detected and
restored exactly; `package.json` and `package-lock.json` have no final diff.

### Environment evidence table

| Environment | URL/process | Revision | Data store | Flags | External services | Allowed side effects | Evidence status |
|---|---|---|---|---|---|---|---|
| Root checkout | No retained app process | `b5c03f4…`, dirty docs | None selected | Source/default only | None invoked | Audit documents only | Source and opening state proven |
| Clean audit candidate | Optimized `next start` on loopback; stopped after tests | exact production `24d88ec…` | Disposable Postgres on `127.0.0.1:55433`; 18 migrations, 22 tables | Explicit isolated flags; model key blank or loopback-only by case | No external provider call | Local fixtures and rows only | Static, API, migration, and browser evidence proven |
| GitHub CI | GitHub Actions | exact production `24d88ec…` | CI fixtures | Workflow configuration | GitHub/CodeQL | CI artifacts only | CI and CodeQL green; production-only build branches incomplete |
| Vercel preview | deployment `dpl_6A5k4G7aywuMVSbe7UZmfUCfugFG` | local `b5c03f4…` | Configured preview store not read | Exact preview values not printed | Vercel | Read-only inspection | Deployment `READY`; functional preview journeys not established |
| Vercel production | `https://revora.plus` | exact `24d88ec…` | Canonical Railway `Postgres`; 18/18 migrations, 22 tables | Photo on; longitudinal off; Meal Memory/Journey absent/off; reviewer/Play absent/off | OpenAI, Upstash, Stripe, Resend, Blob, Sentry, Umami, Edge Config | Read-only HTTP/config/provider aggregates | Reachability/health/revision proven; composed private/provider journeys partial |
| Railway production | `Postgres`, `Postgres-FOMu`, `hourly-crons` | DB image state; scheduler source not cryptographically tied to Git | Two PostgreSQL services | N/A | Railway scheduler | Count-only queries/log inspection | Both DB schemas current; five recent scheduler runs reported all four invoked endpoints successful |
| Stripe production | Stripe CLI with explicit `--live` | Provider state, not Git | Stripe live objects | Four active recurring Revora prices; one Pantry price | Stripe | List/read only | Catalog, zero-subscription denominator, and unpaid-session aggregate proven |
| Production browser crawl | Audit-host Chromium against `revora.plus` | production `24d88ec…` | Read only | Production | Vercel/Umami/Sentry asset requests | Navigation only | Blocked by host `ERR_NETWORK_CHANGED`; not used to allege a product browser defect |

The Stripe CLI defaults to test mode. An initial catalog inspection was
therefore treated as sandbox evidence only. Every commercial/cohort conclusion
in this report comes from a separate command with explicit `--live`.

## 2. Complete denominators and durable evidence

### Product/source denominator

| Surface | Count |
|---|---:|
| Pages | 27 |
| Layouts | 4 |
| Route error boundaries | 1 |
| Route-handler files | 61 |
| Exported HTTP methods | 71: GET 26, POST 37, DELETE 5, PATCH 3 |
| Redirects | 3 |
| Inline server actions | 1 |
| Crons | 5 |
| Provider webhooks | 3 |
| Shared component modules | 41 |
| Component-bearing runtime TSX modules | 77 |
| Tracked first-party/test TS/TSX modules | 482 |
| Runtime/product TS/TSX modules | 272 |
| Exported callable values | 524 |
| Private callable definitions | 380 |
| Exported non-callable values | 267 |
| Type-only exports | 216 |
| Migrations / journal snapshots / tables | 18 / 18 / 22 |
| Direct behavioral integrations | 11 |
| Hosting/scheduling dependencies | 2 |
| Unit/eval/Playwright files | 175 / 4 / 17 |
| Discovered feature/capability rows | 30 |
| Role/profile/data/flag/dependency state rows | 53 |
| Promise rows | 30 |

Every callable is assigned by exhaustive path/call-path rules to user
interaction, API/authz/data mutation, meal/safety, identity/billing,
history/memory/journey, Pantry, privacy/security, installability, video
infrastructure, operations/test support, test-only, or dormant code. This is a
complete static classification, not a claim that all 904 callable definitions
have independent behavioral tests. Two dormant candidates were found:
`components/dashboard-insight.tsx` and `video-engine/music.ts`.

### Documentation denominator

The repository-owned Markdown corpus is 320 files: 313 tracked and seven
nonignored untracked. Generated, vendored, ignored, build, artifact, and other
worktree trees were excluded.

| Classification | Files |
|---|---:|
| Active product/safety/legal/operations truth | 19 |
| Current plan/handoff | 11 |
| Historical evidence | 149 |
| Superseded/archive | 44 |
| Research/hypothesis | 23 |
| Test/runbook/reference | 65 |
| Unknown/conflicting | 9 |

Material conflicts include stale text-only `.planning` claims, an obsolete
photo-deferred ADR, an “active” marketing file that the release index marks
superseded, old unconditional-GO prose, four foreign BCB handoffs, and a dirty
retention hypothesis that conflicts with the current annual offer. The
classification and conflict winners are recorded in the corpus artifact.

### Canonical durable artifacts

- [Issue ledger](./2026-07-23-revora-e2e-issue-ledger.csv)
- [Feature/function/route/test matrix](./2026-07-23-revora-e2e-feature-function-route-test-matrix.csv)
- [71-method API contract matrix](./2026-07-23-revora-e2e-api-contract-matrix.csv)
- [Promise-to-proof matrix](./2026-07-23-revora-e2e-promise-to-proof-matrix.csv)
- [Flag/role/state/dependency matrix](./2026-07-23-revora-e2e-flag-role-state-matrix.csv)
- [Source/function denominator](./2026-07-23-revora-e2e-source-inventory.md)
- [Test denominator and coverage gaps](./2026-07-23-revora-e2e-test-inventory.md)
- [Repository document corpus](./2026-07-23-revora-e2e-document-corpus.md)
- [Machine-readable test-case inventory](./2026-07-23-revora-e2e-test-cases.json)
- [Machine-readable run evidence](./2026-07-23-revora-e2e-run-evidence.csv)
- [Continuation handoff](./2026-07-23-revora-e2e-promise-retention-continuation-handoff.md)

The 30-feature matrix results are 12 `FAILED`, 16 `PARTIAL`, and 2
`UNVERIFIED`. The 71 API methods are 4 `PROVEN`, 12 `FAILED`, 53 `PARTIAL`,
and 2 `UNVERIFIED`. The 30 promise rows are 13 `FAILED`, 14 `PARTIAL`, and
3 `UNVERIFIED`. No promise row is `PROVEN`.

## 3. Evidence buckets

| Bucket | Current evidence | What it does not prove |
|---|---|---|
| 1. Current committed local source | Complete source/doc/function/route map at `b5c03f4…` | Production runtime |
| 2. Dirty local work | Opening owner paths frozen; audit artifacts added only under `docs/handoff` and ignored `artifacts/qa` | A clean candidate |
| 3. Local static/automated | Lint, typecheck, 1,988 tests, contract, build, evals, audit, migrations | Live model/provider/user behavior |
| 4. Local browser/runtime | Exact production SHA, optimized server, 225 passing project cases, direct failure-path screenshots | Production network/provider bindings |
| 5. Clean branch/CI | Detached production SHA clean; exact main CI and CodeQL green | Correctness beyond gate scope |
| 6. Preview/staging | Exact local-SHA preview `READY` | Preview private journeys or exact provider values |
| 7. Production | Exact deployed revision, health, all public pages, headers, flags, DB shape/counts, live Stripe aggregates | Clean browser console, signed-in ownership, live model/photo/email/Play/Pantry lifecycle |
| 8. Real user/payment/cohort | Zero paid Revora subscriptions and zero persisted activation/retention events | User value, willingness to pay, any retention period |
| 9. External/manual | Inventoried only | No verdict, severity, or closure in this audit |

## 4. Automated and browser execution

The full command-level record, timestamps, durations, counts, and artifact paths
are in the run-evidence CSV. The first run of each baseline command was
unfiltered.

| Run | Command/evidence | Exit | Result |
|---|---|---:|---|
| R002 | `env -u REVORA_MODEL -u OPENAI_BASE_URL npm run lint` | 0 | Clean; 21 s |
| R003 | `env -u REVORA_MODEL -u OPENAI_BASE_URL npm run typecheck` | 0 | Clean; 20 s |
| R004 | `env -u REVORA_MODEL -u OPENAI_BASE_URL npm test` | 0 | 1,988 passed, 2 skipped; 178 files passed, 1 skipped; 459 s |
| R005 | `npm run contract` with model route unset | 0 | 9 gates passed, but the gate is blind to AUD-015 |
| R006 | `npm run build` | 0 | 89 build entries; 114 s; generic build did not enter production-only guards |
| R007 | Production flag-twin import matrix | 0 command | Photo/longitudinal mismatches rejected; Memory/Journey mismatches incorrectly accepted |
| R008 | `npm run eval:revora` | 0 | 11 deterministic fixture tests passed; not a live-model eval |
| R009 | `npm run eval:pantry-extract` | 0 | Setup test passed; live quality test skipped |
| R010 | `npm run eval:meal-photo` | 0 | Entire live-provider file skipped |
| R011 | `npm run review:dietitian:validate` | 0 | Packet structure passed; explicitly excluded from verdicts |
| R012 | `npm audit --omit=dev` | 1 | 1 high and 2 critical Auth.js-chain advisories |
| R013 | `npm audit` | 1 | Same three production advisories |
| R014 | `npx drizzle-kit migrate` on disposable DB | 0 | 18 migrations applied; 22 tables |
| R015 | `git diff --check` in clean production worktree | 0 | Clean |
| R016 | `npm run e2e` on exact production SHA | 0 | 225 passed, 12 skipped, 0 retries; 1,135 s |
| R017 | Missing-model HTTP matrix | 0 process | 12/12 behavioral failures |
| R018 | Configured loopback deterministic HTTP matrix | 0 | 8 paths reproduced; two render the 15/15 instruction |
| R019 | Direct A1C boundary matrix | 0 | 5.69, 5.70, 6.39, 6.40, 6.49, 6.50, NaN behavior recorded |
| R020 | Mobile Chrome critical card | 0 | Two visible reproductions; routine guest history 401 console error |
| R021 | Harmful-SAFE known-gap replay | 0 process | 2/2 returned `SAFE`; counted as failures |
| R022 | Pediatric replay | 0 process | 2/2 failed adult-only routing |
| R023 | Claims-paraphrase gate | 0 process | 5/5 forbidden phrases were not blocked |
| R024 | Production page crawl via HTTP | 0 | 28/28 expected public/auth/404 states |
| R025 | Production anonymous API state probe | 0 | 15/15 expected status states |
| R026 | Production security headers | 0 | Five core pages carry the configured policy |
| R027–R030 | Live Stripe and production DB count-only evidence | 0 | Zero Revora subscriptions and zero persisted activation |
| R031 | Production Chromium crawl | 0 scripts | Two contaminated attempts; result unusable as product evidence |

### Browser denominator and exclusions

Playwright contains 79 logical tests across Mobile Chrome, Mobile Safari, and
Desktop Chrome: 237 project cases. The exact production candidate passed 225,
skipped 12, and retried zero.

The 12 skips are four private/provider-backed Pantry cases in each project.
They require private Blob/model evidence and were not armed. Skipped tests are
not passes. The suite also blocks service workers, so offline launch, private
cache boundaries, update, and reconnect remain unverified. Seven logical tests
silently have per-spec `retries=2` even though no retry occurred in this run.

Selected axe checks passed where executed. Complete keyboard/screen-reader
behavior, focus restoration, 200% zoom, large text, real touch targets,
service-worker states, and representative target-user usability were not
manually validated.

### Critical browser and visual evidence

- `artifacts/qa/2026-07-23-e2e-production-sha-24d88ec/playwright-report.html`
- `artifacts/qa/2026-07-23-critical-runtime/clinical-15-15-mobile.png`
- `artifacts/qa/2026-07-23-critical-runtime/clinical-15-15-card.png`
- `artifacts/qa/2026-07-23-critical-runtime/clinical-provider-config-missing-retry-card.png`
- `artifacts/qa/2026-07-23-production-route-crawl/landing-desktop.png`
- `artifacts/qa/2026-07-23-production-route-crawl/stable-pantry-desktop.png`
- `artifacts/qa/2026-07-23-production-route-crawl/route-crawl.json`
- `artifacts/qa/2026-07-23-production-route-crawl/route-crawl-rerun.json`

Both complete production-browser crawls suffered pervasive Chromium
`net::ERR_NETWORK_CHANGED` while direct HTTP and the same local build were
healthy. A React hydration signal on `/home` occurred only inside those
contaminated crawls and did not reproduce locally. It is therefore an audit
blocker, not a confirmed Revora defect.

## 5. Canonical issue ledger

All 31 findings remain `OPEN`. No product fix or post-fix retest was authorized.
The ledger contains exact reproduction, expected/actual behavior, root cause,
risk, proposed fix, regression test, retest state, and owner.

| ID | Severity | Surface | Status | Owner/blocker |
|---|---|---|---|---|
| AUD-001 | P3 | Repository hygiene | OPEN | Repository owner |
| AUD-002 | P1 | Memory/Journey configuration contract | OPEN | Engineering |
| AUD-003 | P1 | Meal-photo eval safety and spend | OPEN | Engineering/privacy |
| AUD-004 | P2 | Environment/paywall operations docs | OPEN | Engineering/operations |
| AUD-005 | P2 | Production-only build gates | OPEN | Engineering/CI |
| AUD-006 | P2 | Auth provider-account schema | OPEN | Engineering before OAuth |
| AUD-007 | P1 | Public progress promise | OPEN | Product/engineering |
| AUD-008 | P1 | Promoted meal-check example | OPEN | Product/model evidence |
| AUD-009 | P1 | Premium unlimited checks | OPEN | Engineering/billing |
| AUD-010 | P1 | Pantry price authority | OPEN | Engineering/billing |
| AUD-011 | P1 | Seven-day trial eligibility | OPEN | Engineering/billing/product |
| AUD-012 | P1 | Account export promise | OPEN | Engineering/privacy |
| AUD-013 | P1 | Account deletion promise | OPEN | Product/privacy/billing |
| AUD-014 | P1 | One-clarification contract | OPEN | Engineering/model contract |
| AUD-015 | **P0** | Clinical route versus no-prescribing boundary | OPEN | Product safety |
| AUD-016 | P1 | Pantry personal-suitability claims | OPEN | Product/engineering |
| AUD-017 | P3 | Onboarding substantiation | OPEN | Product |
| AUD-018 | P2 | Hidden Playwright retries | OPEN | Engineering/CI |
| AUD-019 | P1 | Journey pause versus rollback | OPEN | Engineering/product/privacy |
| AUD-020 | P2 | Journey initial-start concurrency | OPEN | Engineering |
| AUD-021 | P1 | Pantry atomicity/idempotency | OPEN | Engineering/billing/operations |
| AUD-022 | P1 | Photo entitlement failure stance | OPEN | Engineering/billing |
| AUD-023 | P1 | Safety validator false green | OPEN | Engineering/product safety |
| AUD-024 | **P0** | Passwordless identity normalization | OPEN | Security/identity |
| AUD-025 | **P0** | Deterministic routing under model misconfiguration | OPEN | Engineering/operations |
| AUD-026 | P3 | Guest check console/network hygiene | OPEN | Frontend/observability |
| AUD-027 | P3 | Malformed check HTTP contract | OPEN | API engineering |
| AUD-028 | P1 | Paid-retention evidence/instrumentation | OPEN | Founder/product analytics/billing |
| AUD-029 | P1 | Release-corpus harmful `Clear` exceptions | OPEN | Meal engine/release |
| AUD-030 | P1 | Pediatric intended-use routing | OPEN | Product safety/meal engine |
| AUD-031 | P1 | Personal-safety/prediction enforcement | OPEN | Product safety/model enforcement |

Severity totals: **3 P0, 19 P1, 5 P2, 4 P3**.

### P0 root causes

**AUD-015 — quantitative treatment instruction.** The active copy ledger is
loaded directly into the deterministic `possible_hypoglycemia` result. Broad
tokens including “shaky” and “dizzy” route to an instruction to consume about
15 grams of specified fast carbohydrate and recheck in 15 minutes. The
exception conflicts with Revora's declared narrow qualitative educational
scope. This is a product-contract and runtime fact; no external opinion is
needed to classify it.

**AUD-024 — reachable passwordless account-takeover advisory.** Revora uses
affected `@auth/core 0.41.2` / `next-auth beta.31`, the email provider, and no
application normalizer override. The default validates before Unicode
normalization and passes the identifier to Resend. The fixed chain begins at
`@auth/core 0.41.3` / `next-auth beta.32`. The other two audit advisories were
reviewed as not currently reachable: Revora does not call `getToken`, and it
configures no OAuth providers.

**AUD-025 — eager model construction.** `/api/check` evaluates
`modelFactory(undefined)` while constructing the argument passed to
`checkFood`. Missing configuration throws before schema validation, clinical
routing, or A1C routing. Twelve synthetic boundary cases therefore returned an
HTTP 200 generic provider retry. A placeholder key with loopback-only base URL
restored the deterministic routes, isolating the cause without external spend.

## 6. API, data, integration, and failure paths

The API matrix has one row for every exported HTTP method and covers caller,
auth/tier/flag, valid/invalid case, failure/recovery, data effect, privacy,
tests, and verdict.

Major API/data failures:

- client-side taster gating blocks an entitled Premium user before the
  server-authoritative unlimited check path;
- photo entitlement-read errors fail open to a vision call while text fails
  closed;
- the check route's eager model construction disables deterministic safety
  during configuration incidents;
- malformed check requests use HTTP 200 retry semantics;
- a second model-authored clarification bypasses the one-question cap;
- Journey initial start is not concurrency-safe, and flag rollback can override
  a paused user's notification choice;
- Pantry submit/confirm spans nontransactional, non-idempotent writes around
  provider work;
- account export omits checks/memories and other data while claiming one file;
- deletion copy conflicts with Play cancellation blocking and retained
  provider/hashed records.

Positive but bounded evidence:

- private handlers generally enforce server session and object ownership in
  unit/PGlite tests;
- history search uses POST bodies, keeping meal text out of URLs;
- Stripe webhook code has signature, inbox, replay, ordering, and terminal
  guards under mocked tests;
- health-data writes are encrypted and consent-gated in source/tests;
- production anonymous requests receive 401/404 on owner/flag/internal routes;
- production video/admin pages are concealed from ordinary signed-out users.

This does not establish signed-in cross-user production denial, restricted
runtime DB grants, a real encryption row under the production role, provider
refund/restore, or full erasure from backups/provider retention.

## 7. Promise delivery

### Promise matrix result

No material promise is proven end to end. Thirteen are failed, fourteen partial,
and three unverified.

The product does demonstrate selected pieces:

- exact A1C boundaries route correctly when model construction succeeds;
- result schemas constrain card shape;
- many known meal floors fail conservative;
- text/voice/photo converge on confirmed text in source;
- local history, encryption, entitlement, billing reducers, and journey
  mechanisms have substantial deterministic tests.

It fails the full first-session contract:

- the marketed “actual answer” is a static fixture with no live-capture
  timestamp;
- two known harmful-if-`Clear` cases are intentionally excluded from the gate;
- broad symptoms yield a treatment instruction;
- pediatric inputs are not routed out of scope;
- indirect “safe for you” and “bring your levels down” claims pass enforcement;
- missing model configuration hides safety/boundary responses behind an
  unrelated retry;
- there is no authorized live-model corpus or real-user usefulness evidence.

### Full value-chain diagnosis

| Step | Technical evidence | User-value evidence | Verdict |
|---|---|---|---|
| Intent to submission | Onboarding/check UI passes mocked mobile/desktop flows | No real-user timing sample | PARTIAL |
| Understand or clarify | Deterministic ambiguity works; model second-clarify cap is broken | No comprehension observation | FAILED |
| Cautious label | Schema/floors strong; two harmful-SAFE exceptions remain | No live-model/user review | FAILED |
| Meal-specific reason | Grounding fallbacks exist | Marketed example is static; quality unmeasured | UNVERIFIED |
| Feasible next action | Card shape enforces one action | Cultural/affordability/availability not observed with users | UNVERIFIED |
| Limits/uncertainty | Disclaimer and scope copy render | Treatment/personal-safety/pediatric gaps create false confidence | FAILED |
| Persistence/refresh/export | Mocked/local history works | Production has zero checks; export promise is false | FAILED |
| Low-shame usability | Tone contracts and selected axe checks pass | No representative user study | UNVERIFIED |
| Better than substitutes | No comparative study | No evidence against search, generic chatbot, label, or doing nothing | UNVERIFIED |

### Direct answer

**Does Revora deliver its core first-session promise today? No.** It can produce
the intended card through mocked and selected deterministic paths for an adult
with an in-range A1C. It does not reliably preserve its own safety/scope
contract across broad symptoms, pediatric context, provider configuration
failure, acknowledged hard cases, or indirect claims. Normal live-model quality
and real-user usefulness are also unverified.

## 8. Paid retention and recurring value

### Definitions applied

- Paying user: settled live charge, not immediately refunded; staff, reviewers,
  comps, tests, and duplicates excluded.
- Activated: completed a pre-registered first-value event.
- Retained: remains entitled and performs the pre-registered recurring-value
  event; annual prepayment alone is insufficient.
- Periods: D30, D90, D180, and D365 are separate.

### Live denominator

Explicit live-mode Stripe evidence:

- four active recurring Revora Premium prices: annual `$99.99`, monthly
  `$19.99`, `$12.99`, and `$9.99`;
- zero subscriptions in every state for every recurring price;
- three Revora Checkout Sessions: one subscription and two Pantry;
- all three are expired and unpaid.

Privacy-safe production database aggregates:

- canonical `Postgres`: 2 user rows, 4 support cases, and zero profiles,
  checks, feedback, memories, journeys, weekly reflections, push
  subscriptions, subscriptions, billing inbox events, Pantry orders, or
  deletion records;
- `Postgres-FOMu`: 7 billing inbox events and zero users, profiles, checks,
  subscriptions, retention artifacts, Pantry orders, or support cases.

No identifiers, email, meal text, photos, A1C values, event payloads, or user
rows were selected. The two users and four support cases were not classified
as real or synthetic. Guest local-storage behavior and Umami traffic could
exist, but neither can create a paid cohort.

Therefore:

- paid denominator: `0`;
- activated paid denominator: `0`;
- maximum supported paid-retention period: `0 days`;
- D1/D7/D30/D90/D180/D365: all `UNMEASURED`;
- cancellations/refunds/churn/reactivation: no Revora paid denominator;
- gross logo/revenue retention: undefined, not 0% and not 100%.

### Recurring-value loop

| Loop step | Technical availability | Evidence of repeat value | Verdict |
|---|---|---|---|
| Uncertain meal decision | Check UI deployed | No paid/user observation | PARTIAL |
| Quick trustworthy check | Core route deployed | P0/P1 trust failures | FAILED |
| Useful action | Card fields exist | No observed actionability | UNVERIFIED |
| User-owned memory | Production flags off | No rows/users | INTENTIONAL OFF / UNPROVEN |
| Recall/re-check later | Handler tests only | No rows/users | UNVERIFIED |
| Honest weekly learning | Journey flags off | No rows/users | INTENTIONAL OFF / UNPROVEN |
| Timed nudge | Cron healthy; unit logic exists | Pause can be overridden after flag rollback | FAILED |
| Visible learning/progress | Non-scored recap in source | Landing falsely promises a score | FAILED |
| Graduation/maintenance | State machine tests only | No cohort and no willingness-to-pay evidence | UNVERIFIED |

The technical retention mechanisms are **not ready for production enablement**:
Memory/Journey twin guards and environment docs are incomplete, initial Journey
start can 500 under concurrency, paused users can receive a generic nudge after
rollback, and no fully-on browser composition was run. Memory and Journey
should remain off.

Potential new value over time is limited to user-owned repeat-meal recall and
genuinely novel weekly learning. Reminders, streak-like return pressure, and
annual prepayment are not new value. The current repository contains no
evidence that users would miss either capability enough to pay any live price.

### Protocol audit

The existing
`docs/research/meal-memory-concierge-protocol.md` is pending and unexecuted.
Its main weaknesses are:

- its pass rule can use completing participants rather than the full enrolled
  intent-to-treat denominator;
- “choose to continue” is stated intent, not a settled ethical price
  commitment;
- manual concierge work can measure researcher labor/Hawthorne effects rather
  than scalable product value;
- compensation, explicit safety escalation, instrumentation reconciliation,
  and a substitute/counterfactual are incomplete.

The existing
`docs/research/retention-cohort-preregistration.md` is not registered or
executable. Segment, price, primary event, period definitions, exclusions,
power inputs, and success/iterate/stop thresholds remain blank. It also needs:

- an exact paying-user and activation definition;
- D1 and time-to-value;
- app-event to settled-charge denominator reconciliation;
- product graduation separated from paid logo/revenue churn;
- a powered maintenance sample;
- small-cell suppression for A1C strata;
- unprompted-return measurement;
- cancellation/refund/support interviews;
- safety stop/rollback rules and feature-flag order.

### Smallest ethical experiment

Only after P0/P1 safety, privacy, billing, and availability gates close:

1. recruit at least eight eligible adults and count every enrollee
   intent-to-treat;
2. disclose one price identically and use a real, reversible price commitment
   rather than a hypothetical “yes”;
3. define first value as a completed useful check and recurring value as two
   unprompted repeat-meal recalls plus a useful later learning event;
4. include a declared substitute/counterfactual and record unprompted versus
   reminder-driven returns;
5. pre-register pass/fail/stop-safety rules, compensation, privacy retention,
   instrumentation reconciliation, cancellation/refund interviews, and
   escalation;
6. pass only if at least 5 of all 8 enrolled participants meet both recurring
   behavior and price-commitment criteria without a safety stop.

That three-week result may justify a properly powered 90-day paid cohort. It
cannot prove D90, D180, or D365 itself.

### Required retention verdict

**INSUFFICIENT EVIDENCE.**

- Technical readiness of mechanisms: failed for enablement.
- Recurring user value: unobserved.
- Commercial evidence at current price: no settled Revora payer.
- Maximum supported period: zero days.
- Measured churn drivers: none; there is no cohort.
- Principal prospective trust/churn risks: unsafe/misleading guidance, static
  proof, Premium meter mismatch, trial ineligibility surprise, weak export/
  deletion truth, and disabled/unvalidated recurring-value features.
- Features with plausible new value: Meal Memory and weekly learning, still
  hypotheses.
- Features that should remain off: Meal Memory and Learning Journey; enabled
  photo quality/provider/privacy should not be treated as validated.
- Single next experiment: the corrected intent-to-treat paid concierge above,
  after engineering blockers close.

## 9. Cross-cutting readiness

### Security and privacy — FAIL

- P0 reachable passwordless identity-normalization advisory.
- Production dependency audit exits 1 with two critical and one high advisory.
- Object-level authorization has substantial local tests but no complete
  signed-in cross-user production exercise.
- Encryption, tamper capture, consent-before-persistence, query-string
  avoidance, analytics unions, and Sentry scrubbing are strong local evidence.
- Account export and deletion promises are materially inaccurate.
- A production-role encryption row, DB grant restriction, backup deletion, and
  deployed provider payload inspection remain unverified.
- Production headers are present, but `script-src` and `style-src` retain
  `unsafe-inline`; HSTS does not include `preload`.

### Billing and commercial truth — FAIL

- Subscription paywall output is server-authoritative and production returns
  `$12.99/month`, `$99.99/year`, and `$8.33` annual equivalent.
- The live catalog contains those price classes, but the encrypted deployed
  binding was not printed.
- Pantry public copy hard-codes `$49` separately from the configured Stripe
  price.
- The trial wall promises seven days to every starter, while any prior
  subscription row removes the provider trial.
- Premium client metering can block entitled users before server authority.
- No live checkout, charge, refund, cancellation, email, Play purchase, or
  entitlement mutation was created in this audit.

### Accessibility and inclusive UX — PARTIAL

- Selected axe critical/serious checks ran across three projects.
- Copy contracts discourage shame, coercion, countdown pressure, and
  loss-aversion framing.
- Complete WCAG 2.2 AA, screen-reader output, keyboard/focus restoration,
  non-color semantics, contrast, large text, 200% zoom, landscape/tablet,
  on-screen keyboard, reduced motion, and target-user usability remain
  incomplete.

### Performance and resilience — FAIL

- Production HTTP pages responded in approximately 0.8–2.5 seconds from this
  audit host; this is not a Web Vitals or load result.
- Local optimized E2E completes core mocked paths.
- No live-model latency/variance, bundle budget, load/concurrency, or slow
  network study was completed.
- Core deterministic safety fails under model misconfiguration.
- Pantry concurrency/partial commit and Journey start races remain open.
- Service-worker offline/update recovery was disabled in the browser suite.

### Operations and observability — PARTIAL

- Production `/api/health` is HTTP 200 `healthy`, environment `production`,
  launch `ready/normal`, DB `ok`, all five crons `ok`, with Upstash, email,
  billing webhook, and checkout gate configured/open.
- `/api/health/live` is HTTP 200.
- `revora.plus` returns 200; `www` redirects to the apex; TLS/HSTS are active.
- Railway hourly-cron deployments and recent successful endpoint aggregates
  exist, but scheduler source is not tied to a Git SHA.
- Sentry/Umami provider receipts, alert delivery, email receipt, Blob state,
  model-provider live behavior, support SLA, and stop-the-line drills were not
  inspected end to end.
- The guest check page creates a routine `/api/history` 401 console error.

## 10. Production truth

Production reachability is green:

- all 27 pages and the Pantry claim route returned the expected 200,
  authentication redirect, or intentional 404 state;
- health and liveness are green;
- private anonymous reads return 401;
- Meal Memory/Journey APIs return 404/off while Memory export remains
  owner-authenticated;
- video engine and signed-out admin pages return 404;
- core security headers are deployed.

Production readiness is still **NO-GO** because reachability is not correctness.
The exact deployed source contains all three P0s, 19 P1s, and the failed promise
rows. A healthy endpoint and green CI do not supersede those direct
reproductions.

No production mutation was used to test launch pause, rate caps, checkout,
webhooks, provider email, model/photo, Play, Blob, entitlement, deletion, or
refund. Those remain separate `UNVERIFIED` evidence, not passes.

## 11. External/manual evidence

External/manual artifacts remain a separate bucket. Their presence, absence,
or opinion did not alter this report's findings or verdicts.

The audit independently leaves the following evidence unverified: complete
clinical correctness, licensed legal clearance, DPIA/privacy approval,
representative accessibility/usability, provider operational ownership,
production on-call/refund handling, and long-term real-user outcomes. Local
tests cannot prove those facts, but none is needed to justify the present
engineering `FAIL` and `NO-GO`.

## 12. Final verification and repository integrity

Final verification criteria:

- exact production source used for full static/build/browser runs;
- opening user work preserved;
- audit-created package metadata pollution restored;
- no product source changed;
- no tracked runtime/test configuration left dirty by tests;
- audit process and disposable container/worktree removed after evidence
  capture;
- root `git diff --check` still fails only on the opening user-owned whitespace;
- clean production worktree `git diff --check` passes;
- audit artifacts scanned for likely secrets and user data before handoff.

The final integrity results and artifact hashes are recorded in the continuation
handoff and final run-evidence rows.

## 13. Final self-audit

| Question | Answer |
|---|---|
| Refreshed source, branch, flags, environments, and deployed truth? | Yes |
| Preserved pre-existing work and avoided unauthorized side effects? | Yes |
| Published documentation, route, function, flag, state, dependency, and test denominators? | Yes |
| Mapped every HTTP method and every callable by exhaustive classification? | Yes; behavioral proof is explicitly incomplete |
| Ran real browser journeys? | Yes locally on exact production source; production Chromium was audit-host blocked |
| Inspected failures, skips, retries, console/network/server output, and test pollution? | Yes |
| Covered boundary/adversarial/failure/concurrency/privacy/billing/mobile/accessibility states? | Partially; every unexercised state is explicit |
| Verified every public promise against source/runtime evidence? | Yes; no row is proven |
| Kept engineering, user value, retention, production, and external evidence separate? | Yes |
| Avoided inferring retention from feature existence or annual prepayment? | Yes |
| Gave explicit negative verdicts? | Yes |
| Saved durable artifacts without secrets or user data? | Yes, subject to final scan results |

## 14. Direct final answers

**Does Revora deliver its promise?** No. Selected mocked and deterministic adult
meal paths work, but the current release violates its safety, reliability,
scope, truthfulness, Premium, export/deletion, and evidence promises. Live-model
quality and real-user usefulness are additionally unverified.

**Can Revora keep paying users for 90, 180, or 365 days?** There is no evidence
that it can or cannot. There are zero live Revora subscribers and zero activated
paid cohort events. D90, D180, and D365 are all unmeasured. The only defensible
verdict is `INSUFFICIENT EVIDENCE`.

### Proven, inferred, forecast, unknown

- Proven: exact source/revision, route/function/test denominators, local
  deterministic/browser results, the three P0 reproductions, production
  reachability/health/headers, live zero-subscription denominator, and
  production count-only activation absence.
- Inferred: no paid recurring-value behavior exists because there is no paid
  cohort; guest/local traffic may still exist.
- Forecast: none. No retention probability or revenue outcome is asserted.
- Unknown: live-model quality/variance, actual user comprehension/actionability,
  photo/Pantry/Play/email provider composition, signed-in production ownership,
  accessibility with representative users, and D30/D90/D180/D365 outcomes.

### Prioritized next action

Create a single release candidate that closes **AUD-015, AUD-024, and AUD-025**
without weakening any gate, then rerun the Auth Unicode corpus, missing-model
clinical/A1C matrix, visible symptom card, full deterministic corpus, dependency
audit, and all 237 browser cases on that exact candidate. Do not start a paid
retention study or enable Memory/Journey before that gate is green.

## Final recommendation

**NO-GO.**

Exact production revision tested:
`24d88ec85ba52162544e0336a189db340c18616d`, clean detached candidate.
Opening local revision:
`b5c03f4666ea793923482b08fd53c45c037467e7`, dirty with preserved user-owned
documentation work. The audit makes no “flawless,” “validated,” “ready,”
clinical, legal, or retention claim.
