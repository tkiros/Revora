# Master Prompt — Revora Whole-Repository Audit, End-to-End Remediation, and End-User Readiness

> Paste this prompt into a capable coding agent with access to
> `/home/tefera/Desktop/Revora`.
>
> This is an **execution prompt**, not a request for another plan. The executor
> must inspect, test, fix, and re-test the product. It must leave durable,
> source-backed evidence and an honest release verdict.

## Mission

Take Revora from its current state to the strongest truthfully defensible
end-user-ready state possible in this session.

You must:

1. Read and analyze **every repository-owned Markdown file** and synthesize all
   reported issues, gaps, weaknesses, contradictions, risks, edge cases,
   deferred work, and claims of completion into one traceable issue ledger.
2. Analyze the current codebase end to end. Verify each documentary claim
   against source, wiring, tests, migrations, configuration, and actual runtime
   behavior. A `DONE`, `PASS`, `GREEN`, merged-PR, or old deploy claim is only a
   hypothesis until re-proved against current truth.
3. Test every material user journey and system boundary end to end, including
   normal, empty, malformed, adversarial, failure, recovery, mobile,
   accessibility, privacy, billing, and health-safety cases.
4. Fix every issue that can safely be fixed in this repository. Add regression
   coverage, rerun the proportional gates after every fix, then rerun the full
   release suite on the final candidate.
5. Separate what engineering proves from what still requires a human,
   credentialed clinician, licensed counsel, production administrator, payment
   provider, app-store account, device, or funded model account.
6. Produce an evidence-backed release verdict. Never call the app “flawless,”
   “clinically validated,” “legally cleared,” or “ready for end users” unless
   the relevant acceptance gates below are actually satisfied.

The target is not a polished report that hides uncertainty. The target is a
working, non-misleading, non-harmful product with reproducible proof—and a
precise list of anything that prevents that statement from being true.

---

## Repository and current-snapshot warning

- Repository: `/home/tefera/Desktop/Revora`
- Prompt authored: `2026-07-17`
- Authoring-time branch/HEAD: `feat/photo-path-tier1` at `8e05eb5`
- The authoring-time checkout was dirty and contained user-owned modified and
  untracked files, including billing/health tests and several handoffs.

These values are orientation only. Refresh all of them before acting. Do not
assume old handoff statements about branches, PRs, CI, deployment, feature
flags, provider balances, or open/merged work are still current.

## Non-negotiable truth and safety rules

### 1. Preserve user work

- Begin with `git status --short`, branch/HEAD, recent log, remotes, and
  worktree inventory.
- Treat every pre-existing modification and untracked file as user-owned.
- Never run destructive cleanup, reset, checkout-overwrite, stash-drop, broad
  formatter, or bulk rewrite commands.
- Do not revert, overwrite, stage, or commit unrelated changes.
- If a required fix overlaps existing edits, inspect the diff, preserve both
  intents where possible, and document the overlap.
- Do not push, merge, deploy, submit to an app store, send real email, create a
  real charge, alter live Stripe objects, or change production configuration
  without explicit authorization in the active conversation. Local code and
  test fixes are authorized by this prompt.

### 2. Keep evidence classes separate

Maintain these truth buckets throughout the work and in the final report:

1. Current local source and configuration defaults.
2. Current dirty, uncommitted work.
3. Automated local test evidence.
4. Local browser/runtime evidence.
5. Clean commit/branch and CI evidence, if available.
6. Preview/staging evidence tied to an exact revision, if available.
7. Production behavior and deployed-revision evidence, if available.
8. External/manual evidence and blockers.

Passing one bucket never implies the others. In particular, `/api/health`, a
green build, an old CI run, or a successful local flow does not prove the
deployed product or its integrations are healthy.

### 3. Health-adjacent safety cannot be simulated closed

- Revora provides informational meal-pattern guidance. It must not diagnose,
  treat, cure, prevent, or reverse disease; prescribe; predict a user's glucose
  curve or future A1C; claim personal safety; or fabricate exact GI, GL, mg/dL,
  or other unsupported quantitative outcomes.
- A model-persona rehearsal, internal reviewer, automated test, owner, or
  coding agent is not a credentialed RD/CDCES panel.
- **W-05/F-06 remains open unless the repository contains authentic,
  credential-verified, signed external reviews that satisfy the documented
  close validator.** Never fabricate, backfill, or simulate those approvals.
- Run `npm run review:dietitian:close` to verify the gate only when its inputs
  can be inspected safely. If it fails because real signatures are absent,
  record the expected fail-closed result; do not weaken the validator.
- Any simulated panel artifact must remain visibly labeled
  `SIMULATED — NON-CREDENTIALED`.
- Ontology vocabulary, portion conventions, clinical-route copy, and risk-band
  policy remain subject to the documented RD/CDCES governance. Engineering may
  fix implementation bugs, but it may not silently turn an unratified dietary
  judgment into “approved” policy.

### 4. Legal evidence must be described exactly

- An internal legal-safety review is not licensed-counsel advice.
- `COUNSEL REVIEW: WAIVED BY OWNER`, `COUNSEL GATE: NOT CLEARED`, and an
  owner-risk acceptance are different facts. Preserve those distinctions.
- Never state that counsel cleared the product without an authentic written
  decision from licensed counsel tied to the current candidate and scope.
- Verify the exact current meaning and shared enforcement of
  `LEGAL_TERMS_FINAL`; do not trust stale docs or comments. Checkout must never
  take money while its applicable legal/terms gate is closed.

### 5. WTP testing is not the same as serving food guidance

The latest handoff records a WTP-first sequence. Preserve the critical
distinction:

- A landing-page, pricing, waitlist, or fake-door test that delivers **no meal
  guidance** does not engage the clinical panel gate.
- Giving real prediabetic strangers model-generated food guidance based on
  their real food/A1C context is a product launch and does engage the applicable
  clinical, privacy, legal, provider-capacity, and production gates.

Do not resolve this distinction by relabeling a real product launch as a WTP
test.

### 6. Feature gates and public promises must agree

Verify shared enforcement, server behavior, client rendering, tests, and copy
for at least:

- `NEXT_PUBLIC_PHOTO_INPUT` via `lib/photo-input-flag.ts` and every photo entry
  point/route. Only exact opt-in may enable it if that remains the current
  contract.
- `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS` via
  `lib/longitudinal-insights-flag.ts`, `lib/coach/insights.ts`, API payloads,
  dashboard surfaces, onboarding, pricing, and marketing promises.
- `PAYWALL_MODE`, including its default, trial and legacy branches, API-side
  entitlement enforcement, and landing/paywall copy.
- `LEGAL_TERMS_FINAL`, checkout, Pantry Review, billing, and health/status
  reporting.
- Upstash/rate-limit and global cost controls.

If a feature is off, every route must fail closed as designed and public copy
must not promise it. If a feature is on, it needs function-specific evidence,
explicit current authorization, and deployment proof.

### 7. Secrets, spend, and external systems

- Never print, quote, copy into a report, or commit API keys, tokens, connection
  strings, cookies, signing material, or user data.
- Do not extract credentials from Markdown files such as `openr.md`.
- If a secret is reported as exposed, verify the code/repo condition without
  echoing the value and retain key rotation as a human/provider action until
  current rotation evidence exists.
- Inspect a script before running it. Distinguish mock, live, test-mode, and
  production calls.
- Live model calls, paid APIs, real email, and payment flows require existing
  authorization, safe credentials, and a stated cost/side-effect boundary.
  Otherwise test with deterministic mocks/sandboxes and mark live proof
  blocked—never claim it passed.
- Stripe testing is test mode only. Never use real card data or create/modify
  live products, prices, subscriptions, refunds, or webhooks.

---

## Required working method

Work through the phases in order. Maintain the issue ledger continuously. Do
not stop after analysis if safe, in-scope fixes remain.

## Phase 0 — Rehydrate current truth

Record commands and important output in the report. At minimum:

```bash
cd /home/tefera/Desktop/Revora
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline --decorate -15
git worktree list --porcelain
git diff --stat
git diff --check
node --version
npm --version
```

Also inspect:

- `package.json` scripts and lockfile state.
- `.env.example` and documented environment contracts. Never print live
  secret values.
- GitHub/CI/PR state if authenticated access exists. Tie each claim to a head
  SHA and current conclusion; do not trust old handoff PR numbers.
- Configured preview/production URLs and deployed revision identity, if
  available through authorized read-only access.
- Database migration inventory and whether migrations are merely defined or
  actually applied in each tested environment.

Create an environment table before running browser tests:

| Environment | URL/port | Revision | Configuration mode | Data/provider mode | Evidence limits |
|---|---|---|---|---|---|

## Phase 1 — Read every Markdown file and build a canonical issue ledger

### 1.1 Inventory the complete repository-owned Markdown corpus

Include tracked and untracked repository-owned `*.md` files, including root
docs, `PRD/`, `docs/`, `docs/archive/`, QA reports, safety/privacy/legal docs,
handoffs, plans, runbooks, `predict/`, `video-engine/`, and repository-local
agent instructions. Exclude only dependency/build/cache/VCS trees such as
`node_modules`, `.next`, coverage output, `.git`, and generated dependency
copies.

One safe inventory command is:

```bash
find . -type f -name '*.md' \
  ! -path './node_modules/*' \
  ! -path './.next/*' \
  ! -path './coverage/*' \
  ! -path './.git/*' \
  -print | sort
```

Save the inventory as a QA artifact. Report the exact file count, inventory
path, exclusions, and any unreadable file. Do not sample. Read the full text of
every inventoried file. If context limits require batching, process batches
and maintain a per-file completion manifest; do not silently skip older,
archived, duplicated, or contradictory documents.

### 1.2 Classify every document before trusting it

For every Markdown file record:

- path, title, date if present, and apparent purpose;
- current authority: `current`, `historical`, `retired`, `superseded`,
  `proposal`, `handoff claim`, `evidence report`, or `agent instruction`;
- issues/gaps/risks/edge cases/open actions it identifies;
- completion claims it makes;
- human/external dependencies;
- conflicts with newer docs, source, tests, or runtime evidence;
- whether it requires correction after the final code changes.

Archived and retired files remain evidence of previously discovered failure
modes. They do not define current behavior, but their issues must still be
checked for regression unless a newer source explicitly and credibly
supersedes them.

### 1.3 Resolve contradictions explicitly

Use this priority for **current behavior**:

1. Current executable source and configuration.
2. Current tests that genuinely exercise that source.
3. Current runtime evidence tied to an exact revision/environment.
4. Latest dated, non-retired evidence report.
5. Handoffs and plans.
6. Historical/archive documents.

For **intended policy**, the approved safety/privacy/legal contract may outrank
implementation; a code-policy mismatch is a finding, not permission to ignore
the policy.

Create a contradiction table:

| Conflict ID | Sources | What each says | Current verified truth | Required correction |
|---|---|---|---|---|

At minimum, re-check documentary claims about:

- open vs closed W-01/W-04/W-05/W-06 and what evidence can close each;
- simulated vs credentialed clinical review;
- owner legal-risk acceptance vs counsel clearance;
- photo assist and longitudinal-insights authorization/default state;
- WTP-only launch vs serving model guidance to strangers;
- trial vs legacy paywall behavior and public pricing promises;
- old test counts, live-model evidence, provider parity, retry-card rates,
  harmful-SAFE results, band accuracy, and photo coverage;
- production migration, Stripe, email, Sentry, analytics, domain, PWA/TWA,
  Google Play, support, refunds, deletion/export, and deployment claims;
- retired QA scorecards and findings later reported fixed.

### 1.4 Build one deduplicated issue ledger

Every issue from every document must map to one canonical ID, even when
several reports describe it differently.

Use this schema:

| ID | Category | Severity | User harm/failure mode | Source docs + lines | Current code surface | Reproduction/verification | Current status | Fix/owner | Final evidence |
|---|---|---|---|---|---|---|---|---|---|

Allowed current statuses:

- `confirmed-open`
- `fixed-and-currently-proven`
- `fixed-but-not-runtime-proven`
- `regressed`
- `superseded-with-reason`
- `accepted-risk-with-owner/date/scope`
- `blocked-human`
- `blocked-external`
- `not-reproducible-with-evidence`
- `unverifiable-with-exact-unblock`

Do not use bare `done`, `pass`, or `not applicable` without evidence/reason.

Cover at least these categories:

- core behavior and UX;
- model contract, prompts, schemas, parsing, postprocessing, fallbacks;
- harmful/misleading output, claims, clinical routing, uncertainty and tone;
- text, voice, meal-photo draft/confirmation and nutrition-label inputs;
- A1C boundaries, diagnosed conditions, acute-risk language, eating-disorder
  language, non-food and ambiguous input;
- cultural foods, portions, brands, synonyms, plurals, negation, substring
  collisions, and adversarial/injection input;
- auth, sessions, authorization, consent, profiles, guest migration and history;
- privacy, encryption, retention, deletion, export and telemetry scrubbing;
- billing, terms acceptance, trial lifecycle, entitlements, cancellation,
  renewal, refund, webhook idempotency and rollback modes;
- Pantry Review and other paid/product surfaces;
- database schema, migrations, transactionality, concurrency and retries;
- reliability, timeouts, offline behavior, provider outages, rate limits,
  daily caps, fail-open/fail-closed decisions and cost exposure;
- security headers, dependency advisories, secret exposure, input validation,
  CSRF/SSRF/XSS/injection and access-control boundaries;
- accessibility, keyboard/focus, screen readers, reduced motion, contrast,
  zoom, dynamic type, touch targets, responsive layout and cross-browser use;
- email/reminders/push, support, analytics, attribution, SEO/social metadata;
- PWA/TWA/Play readiness;
- environment/config drift, health/status truthfulness, CI, deploy and runbooks;
- pricing, landing/onboarding/product promise mismatches and WTP instrumentation;
- stale documentation and unsafe operational instructions.

## Phase 2 — Analyze the implementation end to end

Inventory and trace all first-party code, not just files named by handoffs:

- `app/` routes, layouts, pages, route handlers and server actions;
- UI components and client state;
- `lib/` product, model, clinical, billing, auth, privacy, analytics, database,
  entitlement, feature-flag and operational helpers;
- `proxy.ts`/middleware and request gates;
- database schema and every migration;
- scripts, cron jobs, email/push, video/marketing tooling that can affect users;
- unit, integration, eval, smoke and browser tests;
- Next.js, Playwright, Vitest, ESLint, TypeScript, CSP/security, PWA/TWA and CI
  configuration.

Build a route/flow matrix:

| Surface/route | User and auth state | Entry gate | Server/data/model path | Failure behavior | Tests | Finding IDs |
|---|---|---|---|---|---|---|

Trace at least:

1. Visitor landing → CTA → onboarding → consent/A1C → first check.
2. Text check → precheck/clinical route → model → schema/postprocess → card →
   persistence/history/analytics.
3. Voice input → transcript review/edit → same trusted check path.
4. Photo input disabled behavior, and enabled behavior in an isolated authorized
   test config: upload → validation → vision draft → user review/edit → check.
5. Guest quotas/taster → trial wall/paywall → checkout → webhook → entitlement
   → pre-charge notice → cancel/refund/restore.
6. Pantry Review purchase and intake/report lifecycle.
7. Magic-link/account/profile → guest-data migration → history/progress →
   consent withdrawal → health-data deletion → account deletion.
8. Offline/PWA, expired session, provider/database/Redis/Stripe/email failure,
   duplicate requests/webhooks, timeouts, retries and recovery.
9. Admin, cron, health, telemetry, analytics and operational surfaces.
10. Every public legal, privacy, safety, pricing, marketing and support promise
    to its actual enforcing code.

For each boundary, inspect happy path, authorization, validation, idempotency,
partial failure, retry behavior, concurrency, data leakage, logging, and safe
fallback. Tests that only mock the unit under test do not prove the integration
is wired.

## Phase 3 — Execute the full verification matrix

### 3.1 Inspect scripts before running them

Classify each relevant script as local-only, mock, sandbox, live-paid, or
production-mutating. Record the classification. Use a clean environment for
tests where documented model overrides can contaminate behavior.

Start with the current equivalents of:

```bash
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run lint
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run typecheck
env -u REVORA_MODEL -u OPENAI_BASE_URL npm test
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run contract
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run build
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run eval:revora
npm run review:dietitian:validate
npx playwright test
npm audit --omit=dev
npm audit
git diff --check
```

Do not hide output with filters on the first run. Save command, timestamp,
exit code, passed/failed/skipped counts, duration, environment, and artifact
path. If a gate fails, diagnose the root cause, add a regression test, fix it,
and rerun both the smallest relevant test and the full affected gate.

`npm run review:dietitian:close` is a special external-approval gate. A
fail-closed result caused by absent authentic signed reviews is not a software
failure and not a pass; report it as `blocked-human` with the precise required
evidence.

### 3.2 Browser and user-journey testing

Derive the full route list from current code. Test every reachable user-facing
page and material state, not only the list below. Use Chromium and the
available WebKit/mobile projects; use Firefox if configured. Capture
screenshots, console errors, network failures, unexpected redirects, hydration
errors and server logs.

Verify:

- landing, demo, how-it-works, pricing/subscribe, privacy, terms, support,
  get-the-app, sign-in and not-found/error pages;
- onboarding first-run, repeat-user, back/refresh/interruption and duplicate
  A1C/consent behavior;
- SAFE/MODERATE/HIGH result cards and every clarify/refusal/retry/clinical
  state, with the informational disclaimer present on every applicable output;
- voice permission denied, no transcript, wrong transcript and user edit;
- photo off returns/hides safely; photo on validates type/size/content,
  preserves no-photo-persistence promises, displays an editable draft, handles
  confidently wrong drafts, fits the text schema, and avoids faces/PII storage;
- signed-out, signed-in, expired-session, cross-user access, guest migration,
  empty/history-heavy accounts and data deletion;
- trial and legacy paywall branches; entitlement bypass attempts; checkout
  terms acceptance; declined/abandoned/duplicate checkout; webhook replay and
  out-of-order events; cancellation/refund/restore using test-mode fixtures;
- Pantry Review visibility, purchase, capacity/weekly-cap behavior, submission,
  support/refund copy and failure recovery;
- offline, slow connection, model timeout, connection blip, rate limit, global
  daily cap, Redis down, database down, provider outage and kill-switch states;
- reload, browser back/forward, multi-tab, duplicate clicks and rapid submits;
- narrow phone, landscape phone, tablet, desktop, 200% zoom, large text,
  software keyboard and safe-area behavior;
- keyboard-only use, focus visibility/order/restoration, accessible names,
  error announcements, contrast, non-color meaning, reduced motion and axe.

No page is a pass if the browser console, network panel, server logs, or UI
contains a relevant unhandled error even when the final assertion is green.

### 3.3 Model, clinical-routing, and misinformation testing

Use deterministic tests first. Run authorized live evals only when credentials,
provider route, budget, and data handling are explicit. Label OpenRouter,
OpenAI-direct, mock, and fixture evidence separately. Never use one as proof of
another.

Exercise repeated and boundary cases for:

- A1C 5.69/5.70/6.39/6.40/6.49/6.50 and malformed/missing values;
- diagnosed diabetes, pregnancy, medications, allergy, eating-disorder,
  emergency/acute-symptom language and unsupported health questions;
- underspecified inputs, beverages, nutrition labels, quantities/servings,
  mixed meals, cultural staples and restaurant portions;
- plurals, spelling variants, brands, transliterations, negation, “free” foods,
  substring collisions and nearby accepted guard cases;
- prompt injection, schema injection, prompt-leak attempts, profanity, self-harm
  language and extremely long/Unicode input;
- stochastic repeatability and photo-draft variance.

Hard safety acceptance for every final candidate run:

- zero harmful-SAFE/dangerous false reassurance in the applicable gate corpus;
- zero forbidden diagnosis/treatment/reversal/prediction/personal-safety claims;
- zero fabricated food components or glycemic drivers;
- zero unsupported exact GI/GL/mg/dL/future-A1C claims;
- zero prompt/system/schema leakage;
- zero shaming, coercive, alarmist, or disordered-eating-reinforcing language;
- clinical and out-of-scope cases route before model use where the contract
  requires deterministic routing;
- model/schema/postprocess failure returns the approved safe fallback without
  leaking raw output;
- no rubric weakening, label gaming, or test-fixture relabeling merely to make
  a metric pass.

Report quality metrics by stratum and preserve disagreement. A simulated judge
may discover cases; it cannot ratify clinical correctness.

### 3.4 Security, privacy, data, and operations testing

At minimum verify:

- server-side authn/authz on every private object and mutation;
- CSRF protection and safe redirect/URL handling;
- XSS/injection output escaping and request-schema bounds;
- upload MIME/size/content validation and no unauthorized persistence;
- security headers/CSP on actual responses;
- no secret/client-prefix mistakes and no sensitive logs, telemetry, analytics,
  Sentry events, URLs or browser storage;
- encryption-at-rest through an actual safe test row, not just code inspection;
- consent-before-persistence, consent withdrawal, health-data erasure, account
  deletion and the documented export/rights posture;
- migration forward compatibility, constraints, indexes, transactions and
  rollback/failure behavior;
- webhook signature verification, event idempotency/order, entitlement and
  refund/cancel consistency;
- rate limits and global spend caps occur before paid model calls where
  promised;
- health/status endpoints reflect real enforced state without exposing secrets
  or presenting optional dependencies as healthy;
- production config, domain/HTTPS, support address, database, Redis, Stripe,
  email, Sentry, analytics, provider quotas and deployed revision—using
  authorized read-only checks.

If staging/production access is unavailable, provide exact commands and owner
actions needed to prove each item; mark it unverified. Do not infer it from
local code.

## Phase 4 — Fix every confirmed in-scope issue

Use this loop for each issue:

1. Reproduce and identify the root cause.
2. Add the smallest meaningful failing regression test.
3. Implement the narrowest complete fix at the shared enforcement point.
4. Update governed safety/copy/privacy/legal docs and version markers when the
   contract requires it.
5. Run targeted tests.
6. Run the full affected suite.
7. Test the actual user journey in the browser/runtime.
8. Update the ledger with final evidence and residual risk.

Prioritize:

1. P0/blocker: can harm or seriously mislead a user; expose health/identity or
   payment data; take money incorrectly; bypass authorization; leak secrets;
   or make the core app unusable.
2. P1/major: wrong result, lost data, broken core journey, inaccessible core
   action, repeated retry/failure, material promise mismatch or uncontrolled
   cost.
3. P2/minor: degraded experience with a safe workaround.
4. P3/cosmetic/documentation.

Rules for fixes:

- Fix shared roots, not isolated symptoms. A hidden control is not a disabled
  server feature; a UI check is not server authorization.
- Never weaken safety, auth, billing, legal, consent, or close validators to
  turn a red test green.
- Never “fix” stochastic quality by loosening the judge/rubric, relabeling a
  corpus without required consensus, or deleting hard cases.
- Any risk-band/ontology/clinical-copy policy change must follow the repository
  governance and remain pending external ratification when appropriate.
- Preserve fail-closed behavior for health-safety, disabled features, legal
  checkout, and unsupported model output. Where availability controls fail
  open by design, verify and document the compensating ceiling.
- Add tests for both the caught case and nearby guard cases so a conservative
  fix does not harm cultural foods, small portions, negated foods, or accepted
  flows.
- Correct active docs after behavior changes. Do not rewrite historical
  evidence to pretend the defect never existed; mark it retired/superseded or
  add a dated correction.

Continue until no safely fixable confirmed blocker or major issue remains.
Do not stop merely because one suite is green or a context window is ending;
leave a continuation handoff if an external or time-bound blocker truly stops
progress.

## Phase 5 — Final clean-room verification

After all fixes:

1. Review the complete diff and pre-existing dirty files again.
2. Run secret scanning and `git diff --check` without exposing values.
3. Rerun lint, typecheck, unit/integration tests, safety contract, production
   build, deterministic evals, browser E2E, accessibility and dependency audit.
4. Rerun all relevant regression cases from the canonical ledger.
5. Rerun authorized live/provider/preview checks required for the candidate;
   identify provider, environment and exact revision.
6. Re-test every P0/P1 user journey from a fresh browser state.
7. Confirm docs, runtime copy, feature flags and operational runbooks now agree.
8. Confirm external approval gates still fail closed when evidence is absent.

Do not report “all tests passed.” Report exact command, exit code,
passed/failed/skipped counts, environment, revision and evidence location.

---

## Definition of done

The implementation work is complete only when all of the following are true:

- Every inventoried Markdown file is accounted for in the corpus manifest.
- Every documented issue/gap/risk/edge case maps to a canonical ledger ID and a
  current evidence-backed status.
- Every current code route and material user journey appears in the flow/test
  matrix.
- No confirmed, safely fixable P0/blocker or P1/major remains open.
- The final full local verification suite is green with exact counts.
- Core flows work in supported desktop and mobile browser projects with no
  relevant unhandled console, network or server errors.
- Health-adjacent outputs meet the hard safety criteria above on the final
  candidate and fail closed on unsupported output.
- Auth, consent, privacy, deletion, billing, entitlement and webhook boundaries
  have both positive and negative-path evidence.
- Public claims, pricing, feature availability and legal/privacy copy match
  actual enforced behavior.
- Production readiness claims are tied to an exact deployed revision and live
  checks; otherwise the verdict explicitly remains not production-proven.
- Human/external gates are neither hidden nor fabricated.

The app may be called **engineering-ready** if the code/test/runtime gates are
complete but human/external gates remain.

The app may be called **ready for real end-user food guidance** only if, for the
current candidate and launch scope:

- W-05/F-06 is authentically closed by the required credentialed external
  review. An owner or counsel risk waiver cannot substitute for clinical
  validation. If the owner knowingly authorizes a limited research alpha before
  closure, report it as a constrained, accepted-risk experiment—not as
  end-user-ready food guidance;
- applicable legal/terms, privacy/consent and payment gates are satisfied;
- provider capacity and production-path model evidence are sufficient;
- the exact deployed revision and all critical live integrations are proven;
- no open blocker can mislead, harm, overcharge, expose, or strand a user.

If any condition is missing, the correct verdict is `NO-GO` or
`CONDITIONAL GO` with the precise condition—not “flawless.”

---

## Required durable deliverables

Use the actual execution date in filenames.

### 1. Primary audit/remediation report

Write:

`docs/handoff/YYYY-MM-DD-revora-true-done-audit-remediation-report.md`

Required sections:

1. Executive verdict: `GO`, `CONDITIONAL GO`, or `NO-GO` for real end users.
2. Scope, branch, HEAD, dirty-state note and environments tested.
3. Markdown corpus inventory summary and completion count.
4. Contradictions resolved.
5. Canonical issue ledger, sorted by severity.
6. End-to-end route and user-journey matrix.
7. Fixes implemented, with regression tests and file references.
8. Test/eval/build/browser evidence with exact counts.
9. Security/privacy/billing/clinical/claims findings.
10. Truth buckets: local, clean/CI, preview, production, external.
11. Remaining human/external actions with owner, exact action, unblock
    evidence and consequence if skipped.
12. Residual risks and final release recommendation.

### 2. Machine-readable or tabular evidence artifacts

Save a Markdown-corpus manifest and canonical issue ledger under an existing
appropriate QA artifact location. Do not commit secrets, health data,
third-party photos or copyrighted image assets. If `artifacts/` is ignored,
state that plainly; do not force-add without authorization.

### 3. Continuation handoff, only if work remains

If an external/time-bound blocker prevents true completion, write:

`docs/handoff/YYYY-MM-DD-revora-true-done-continuation-handoff.md`

It must contain exact current branch/HEAD/dirty state, what was fixed, what is
still open, first commands for the next session, no-go rules, and the smallest
evidence needed to close each blocker. Do not duplicate a long retrospective.

### 4. Final response to the owner

Lead with the outcome. Include:

- verdict and whether it refers to local engineering, deployed production, or
  real-user launch;
- top fixed issues;
- final test counts;
- remaining blockers/human actions;
- exact paths to the saved report/handoff;
- files changed;
- explicit confirmation that unrelated dirty work was preserved.

Do not claim a gate closed because work was prepared for it. Do not hide a
blocked gate in a footnote.

---

## Final self-audit before you stop

- [ ] Did I inventory and read every repository-owned Markdown file, not just
      recent handoffs?
- [ ] Does every reported issue have a canonical ledger row?
- [ ] Did I verify old `DONE`/`PASS` claims against current source and runtime?
- [ ] Did I inspect the full first-party code path and all current routes?
- [ ] Did I reproduce and fix root causes, then add regression coverage?
- [ ] Did I run the full final suite and record exact counts?
- [ ] Did I test normal, boundary, adversarial, failure and recovery paths?
- [ ] Did I test mobile, accessibility and user-visible error behavior?
- [ ] Did I keep mock, simulated, live-provider and production evidence
      separate?
- [ ] Did I keep engineering proof, clinical sign-off, counsel clearance,
      owner-risk acceptance and deployed-runtime proof separate?
- [ ] Did I prevent secrets, health data, third-party photos and real payment
      data from entering artifacts/logs?
- [ ] Did I preserve user-owned dirty changes and avoid unauthorized external
      actions?
- [ ] Does the release verdict follow the evidence rather than the desired
      word “flawless”?

If any answer is no, continue the work or report the exact blocker. Do not
declare completion.
