# Master Prompt — Revora End-to-End, Promise-Delivery, and Paid-Retention Validation

> Paste this prompt into a capable coding agent with access to
> `/home/tefera/Desktop/Revora`.
>
> This is an **execution prompt**, not a request for another plan or a report-only
> review. The executor must discover the complete product, map it, test it,
> diagnose failures to root cause, fix every safely fixable issue, retest the
> final candidate end to end, and leave durable evidence plus an honest verdict.

## Mission

Establish, with current and reproducible evidence, whether Revora:

1. works end to end across every material feature, function, role, state, and
   dependency;
2. delivers the promises it actually makes to its intended users;
3. is safe, truthful, understandable, reliable, private, accessible, and fair
   enough for real use;
4. gives paying users sufficient recurring value to plausibly retain them for
   90, 180, and 365 days; and
5. has measured evidence of that paid retention—or merely an untested product
   hypothesis.

Do not stop at finding issues. For every confirmed issue that is safe and
authorized to fix locally, reproduce it, identify the root cause, add a
regression test, implement the complete fix at the shared enforcement point,
and retest the affected journey. Then run a clean final verification pass.

The goal is the strongest truthfully defensible end-user-ready state, not the
appearance of perfection. Never call Revora “flawless,” “validated,” “ready,”
“clinically approved,” “legally cleared,” or capable of long-term paid
retention unless the relevant evidence gates in this prompt are truly green.

---

## Authoring-time orientation — refresh before use

These facts are orientation only and may already be stale:

- Repository: `/home/tefera/Desktop/Revora`
- Prompt date: `2026-07-20`
- Authoring-time branch: `feat/value-retention-plan-2026-07-18`
- Authoring-time HEAD: `abfa05800efa0213ef6b0a374e9fde4ab82322db`
- The checkout was dirty. At authoring time,
  `docs/handoff/2026-07-18-revora-product-value-retention-virality-distribution-forensic-master-prompt.md`
  contained user-owned edits. Preserve them.
- The current branch contains recently merged work for cross-device history,
  result-linked feedback, billing reconciliation, Personal Meal Memory, a
  90-day Learning Journey, weekly learning, journey-aware nudges, and
  graduation/maintenance states.
- The latest handoff said Meal Memory and Learning Journey were flag-gated off,
  human validation gates were pending, and the prior implementation effort had
  not run Playwright E2E. Re-prove all three statements; do not repeat them as
  current facts without verification.
- At authoring time, `tests/smoke` contained 16 Playwright spec files with about
  80 top-level tests across Mobile Chrome and Mobile Safari. That is an existing
  test suite, not proof of complete feature coverage or current runtime health.

Old handoffs, plans, release indexes, PR descriptions, `DONE` labels, green
tests, and deployment notes are leads—not truth. Current source, current
configuration, actual runtime behavior, and evidence tied to an exact revision
win every conflict.

---

## Non-negotiable rules

### 1. Preserve the repository and the owner’s work

- Start by recording branch, HEAD, worktrees, status, staged/unstaged/untracked
  files, recent commits, remotes, and relevant open PR state.
- Treat every pre-existing modification and untracked file as user-owned.
- Never use destructive cleanup, hard reset, checkout-overwrite, stash-drop,
  broad reformatting, or indiscriminate staging.
- Do not revert, overwrite, stage, or commit unrelated work.
- Stage explicit paths only if the active user has authorized a commit.
- Do not push, merge, deploy, mutate production configuration, send real email,
  create real charges, alter live Stripe objects, or enable production flags
  without explicit authorization in the active conversation.
- Local diagnosis, tests, test data, and code/documentation fixes required by
  this prompt are in scope. External side effects are not implicitly authorized.

### 2. Maintain separate truth buckets

Keep these evidence classes separate in working notes and the final report:

1. current committed local source;
2. dirty or uncommitted local work;
3. local static and automated-test evidence;
4. local browser/runtime evidence;
5. clean branch/commit and CI evidence;
6. preview/staging evidence tied to an exact revision;
7. production behavior and deployed-revision evidence;
8. real user, payment, cohort, support, and cancellation evidence;
9. external/manual approval evidence.

Passing one bucket never proves another. A green build does not prove a live
payment flow. A live health endpoint does not prove a user journey. A polished
retention loop does not prove anyone will keep paying. A simulated panel does
not provide clinical or legal sign-off.

### 3. Re-prove prior completion claims

- Every prior `PASS`, `DONE`, `GREEN`, fixed issue, merged PR, deployed route,
  enabled flag, and closed gate must be checked against current truth.
- When documents conflict, identify the conflict, establish the winner with
  evidence, and mark the stale source superseded rather than silently choosing.
- Do not inherit “ignore this issue” lists from older prompts unless the active
  user explicitly renews that exclusion for this audit.
- Absence of evidence is `UNVERIFIED`, not `PASS`.
- A skipped test is not a pass. A mocked integration is not live proof.

### 4. Health-adjacent safety cannot be engineered or simulated closed

Revora’s active narrow intended use is a cautious, plain-language educational
read on a meal’s overall composition for adults using a prediabetes-range A1C,
plus practical ways to make the meal more balanced.

The app must not diagnose, treat, cure, prevent, or reverse disease; prescribe;
claim personal safety; predict individual glucose response or future A1C; or
fabricate exact GI, GL, mg/dL, timing, or other unsupported outcomes.

- Engineering tests can prove deterministic routing and enforcement behavior.
- They cannot prove clinical correctness for real users.
- A coding agent, model persona, simulated reviewer, or owner waiver is not an
  authentic credentialed RD/CDCES review.
- A legal issue-spotting exercise is not licensed-counsel clearance.
- Run the repository validators honestly. Never weaken a safety, claims,
  dietitian, counsel, privacy, billing, or authorization gate to get green.
- Keep every human/external gate open until authentic evidence for the exact
  current candidate and function is present.

### 5. Long-term retention is an empirical outcome

Do not infer paid retention from:

- code completeness;
- feature count;
- good design;
- daily reminders or streaks;
- a small number of positive comments;
- free-user engagement;
- historical studies of different products or populations;
- a forecast, synthetic panel, or persona walkthrough; or
- the existence of Meal Memory or the Learning Journey.

Technical tests may prove that retention mechanisms work. Only correctly
defined real paid cohorts can prove that users keep paying. If Revora lacks
adequate cohort data, the verdict must remain `UNPROVEN`, accompanied by the
smallest ethical experiment that can resolve it.

### 6. No secrets, unsafe spend, or production data leakage

- Never print or copy credentials, tokens, cookies, connection strings,
  signing material, private health data, meal text, photos, emails, or user
  identifiers into reports or logs.
- Inspect scripts before running them and classify each as local-only, mock,
  sandbox, live-paid, or production-mutating.
- Never extract credentials from repository prose or shell history.
- Live model calls require explicit authorization, a stated budget, safe test
  inputs, and a known provider route. Otherwise use deterministic fixtures.
- Payment tests use provider test mode and documented fixtures only.
- Production evidence gathering must be read-only unless the user separately
  authorizes a mutation.

### 7. “Flawless” means zero known in-scope defects after a complete test denominator

No finite audit proves mathematical perfection. For this mission, the strongest
defensible result is:

- every discovered material surface is in the inventory;
- every inventory row has test evidence or an explicit blocker;
- every required user journey has been exercised in its meaningful states;
- no known safely fixable P0 or P1 issue remains;
- the final full verification suite passes on the exact reported candidate;
- supported mobile and desktop flows have no relevant unhandled console,
  network, server, hydration, accessibility, or data-integrity errors; and
- every residual risk or external dependency is disclosed precisely.

---

## Required execution method

Work through the phases in order. Maintain one canonical issue ledger from the
first finding onward. Do not stop after analysis while safe in-scope remediation
remains.

## Phase 0 — Rehydrate current truth

Record commands, timestamps, exit codes, important output, and the exact
revision under test. At minimum begin with:

```bash
cd /home/tefera/Desktop/Revora
git status --short --branch
git branch --show-current
git rev-parse HEAD
git log --oneline --decorate -20
git worktree list --porcelain
git diff --stat
git diff --check
node --version
npm --version
```

Then inspect:

- all applicable `AGENTS.md` or repository instructions;
- `package.json`, the lockfile, Next/Vitest/Playwright/TypeScript/ESLint config,
  middleware/proxy, PWA configuration, security headers, and CI workflows;
- `.env.example` and `docs/ops/env-reference.md`, comparing names and defaults
  without exposing live values;
- current branches, PRs, CI runs, worktrees, preview deployments, production
  URLs, and deployed revision identity where authenticated read-only access is
  available;
- database schema, every migration, migration journal state, and which
  environments actually applied them;
- current feature flags and kill switches at client, server, preview, and
  production layers;
- the newest release truth index and handoffs, treating their status prose as
  claims to verify.

Create an environment evidence table before testing:

| Environment | URL/process | Revision | Data store | Flags | External services | Allowed side effects | Evidence status |
|---|---|---|---|---|---|---|---|

If a configured environment cannot be safely inspected, record the exact
blocker. Do not substitute a different environment silently.

## Phase 1 — Establish the product contract and promise denominator

### 1.1 Inventory and classify the complete documentation corpus

Enumerate every repository-owned Markdown file while excluding generated or
vendored directories. Classify each as one of:

- active product/safety/legal/operations source of truth;
- current execution plan or current handoff;
- historical evidence;
- superseded/archive;
- research/hypothesis;
- test/runbook/reference;
- unknown/conflicting.

Do not read only titles or recent handoffs. Search every document for promises,
known issues, gaps, deferrals, residual risks, unsupported claims, manual steps,
feature flags, test claims, production claims, pricing promises, data-rights
promises, and retention hypotheses. Deduplicate them into the issue ledger.

### 1.2 Build a promise-to-proof matrix

Start with the active claim boundary, product marketing, rendered copy, terms,
privacy disclosures, paywall, onboarding, account, store/listing copy, support
material, email, and campaign/video content. Verify which source is truly active.

For every current promise, create a row:

| Promise ID | Exact promise or faithful paraphrase | Surface | Intended user | Required behavior | Enforcement source | Required evidence | Current evidence | Verdict | Finding IDs |
|---|---|---|---|---|---|---|---|---|---|

At minimum test these contract families:

- first meal check is fast, understandable, cautious, and actionable;
- text and voice converge on the same reviewed trusted path;
- photo, when enabled, produces an editable draft rather than an unquestioned
  medical judgment;
- `Clear`, `Be careful`, and `Hold off` mean only the documented general
  meal-pattern categories;
- the reason matches the food described and any adjustment/swap matches the
  verdict contract;
- ambiguity produces honest clarification rather than fabricated certainty;
- accounts, encrypted history, progress, reminders, and cross-device claims
  match reality;
- Premium capability, trial, price, renewal, cancellation, refund, and access
  promises match live server authority;
- Pantry Review’s separate one-time scope and report lifecycle are truthful;
- Meal Memory, weekly learning, journey stages, nudges, graduation, and
  maintenance are promised only when their gates and evidence permit them;
- privacy, deletion, export, consent, photo handling, analytics, and support
  disclosures match actual data flows; and
- no public or internal launch surface reintroduces banned outcome, personal
  safety, regulatory-status, accuracy, or disease claims.

Use `lib/revora/promise-registry.ts` as an implementation anchor, not as the
complete promise denominator. A registry entry passes only if the actual
rendered flow and real engine path reproduce it on the final candidate.

## Phase 2 — Map every function, feature, route, state, and dependency

### 2.1 Prove inventory completeness

Derive the inventory from current source rather than from this prompt. Enumerate:

- every page, layout, error boundary, route handler, route method, server
  action, redirect, cron, webhook, admin route, asset route, and health route;
- every first-party component and interactive control;
- every exported first-party function, plus non-exported business-critical
  functions reached by a route or journey;
- client storage, server persistence, caches, queues, analytics, error capture,
  service worker, and background behavior;
- database tables, constraints, indexes, migrations, encryption boundaries,
  and deletion/export paths;
- all third-party dependencies and external services that participate in user
  behavior;
- all flags, roles, tiers, entitlement states, launch controls, and environment
  modes; and
- every unit, integration, eval, contract, smoke, browser, and manual test.

Publish denominator counts: number of pages, API endpoints/methods, components,
first-party modules/functions, migrations/tables, flags, crons/webhooks,
external dependencies, test files, and discovered journeys. Explain exclusions.
Do not claim complete coverage without a denominator.

### 2.2 Build the canonical feature/function map

Use one row per independently testable capability:

| Feature/function ID | User/role | Entry point | Preconditions and flags | Client path | API/method | Server/business functions | Data/migration | External dependency | Promise | Existing tests | New tests/evidence | Status | Finding IDs |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

Every discovered function must map to a feature, infrastructure concern, test
helper, or dead/unused code classification. Flag unreachable, duplicated, stale,
or untested code. Trace the call path rather than assuming a file is wired.

### 2.3 Current feature anchors — expand, correct, and reclassify

The current source appears to include at least these surfaces. This is a seed,
not the final inventory:

1. Public acquisition: landing, honest demo, welcome, how-it-works,
   get-the-app, legal/privacy, metadata, robots, sitemap, attribution.
2. First use and identity: first-run gate, onboarding, A1C band handling,
   consent, intent/attribution, sign-in, magic-link states, reviewer sign-in,
   session expiration, guest-to-account migration.
3. Core meal check: text, speech-to-reviewed-text, photo-to-editable-draft,
   validation, A1C routing, clinical pre-route, ambiguity/clarification,
   model call, schema validation, postprocess, safety fallback, result card,
   feedback, persistence, analytics, rate/cost controls.
4. Dashboard and continuity: home, today list, daily loop, history, pagination,
   POST-body search, filters, input-method fidelity, actions, per-item delete,
   export, progress, insights, streak/reassurance states, outage truth.
5. Personal Meal Memory: save, immutable source snapshot, recall, re-check,
   search, edit, favorite/labels/notes, delete one/all, export, feature and
   entitlement enforcement, engine non-interference.
6. Learning Journey: derived stage state, pause/resume, weekly learning,
   reflection invalidation, nudges, cadence, quiet hours, open tracking,
   graduation, maintenance, cancellation independence.
7. Billing and access: guest taster, legacy and trial paywalls, prices from
   server authority, Stripe checkout/portal/webhook/cancel/refund/reconcile,
   Google Play verification/RTDN/restore, entitlement self-healing, annual and
   monthly access, precharge communication, lapsed/syncing states.
8. Pantry Review: public offer, claim/intake, one-time purchase, upload,
   extraction, confirmation, submission, capacity control, processing, sweep,
   report access, email, support/refund behavior, admin queue.
9. Account and data rights: profile, reminder settings, health-data withdrawal,
   history/memory export, health-data deletion, full account deletion,
   subscription cancellation, legal/support links.
10. Operations and internal tools: admin feedback, admin Pantry, reviewer mode,
    crons, launch control, health/heartbeat, Redis limits, Sentry, analytics,
    email, database, blob, model providers, video-engine dashboard and its
    asset/spec/hook/render/approve/commit/run/state lifecycle.
11. Installability and resilience: PWA manifest/assets/service worker, offline
    launch behavior, cache boundaries, update behavior, network recovery,
    mobile browser differences.

### 2.4 Build the state and flag matrices

At minimum cover:

- anonymous first visit, returning guest, signed-in free, trialing, Premium
  monthly, Premium annual, lapsed, canceled-but-entitled, refunded/expired,
  admin, reviewer, and unauthorized user;
- no profile, valid low/mid/high prediabetes-range A1C, below-range,
  diabetes-range, malformed/missing A1C, withdrawn consent, deleted account;
- empty, one-row, large/paginated, partially corrupted, and cross-device data;
- every feature flag off, client-on/server-off, client-off/server-on where
  possible, authorized fully-on, and kill-switch/paused states;
- normal, slow, timed-out, unavailable, rate-limited, capped, duplicate,
  out-of-order, and recovered dependencies.

For each combination record expected UI, HTTP status, server behavior, data
mutation, analytics, and test evidence.

## Phase 3 — Baseline automated verification

Inspect every script before execution. Use the current equivalents of the
following, adjusting only when source proves a command has changed:

```bash
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run lint
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run typecheck
env -u REVORA_MODEL -u OPENAI_BASE_URL npm test
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run contract
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run build
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run eval:revora
npm run eval:pantry-extract
npm run eval:meal-photo
npm run review:dietitian:validate
npm run e2e
npm audit --omit=dev
npm audit
git diff --check
```

Rules:

- On the first run, do not hide failures with output filters.
- Record command, start time, duration, environment, revision, exit code,
  passed/failed/skipped counts, retries, and artifact path.
- Distinguish deterministic, mocked, sandbox, live-provider, browser, and
  production evidence.
- Investigate every failure, retry, skip, warning, console error, unhandled
  rejection, leaked act warning, flaky timeout, and test-created dirty file.
- A retry that passes still creates a flake finding until root cause is known.
- If a test runner cannot start, diagnose the startup failure; do not mark the
  underlying feature passed.
- Use `review:dietitian:close` only as the special external-evidence validator.
  Missing authentic signatures are `BLOCKED-HUMAN`, not a software failure and
  not a pass. Never fabricate or weaken the evidence.
- Live evals, paid APIs, real email, and real payment calls remain separately
  authorized. Record them as unverified when authorization or safe credentials
  are absent.

Measure source/test coverage to locate blind spots if practical, but do not use
a percentage as a substitute for behavioral coverage. Add tests for every
material untested branch found in the feature/function map.

## Phase 4 — API, data, integration, and failure-path testing

For every API method and background entry point, test:

- valid request and response contract;
- missing, malformed, oversized, adversarial, Unicode, and boundary input;
- unauthenticated, wrong-role, wrong-tier, wrong-owner, and cross-user access;
- feature-off and launch-paused behavior;
- duplicate submission, idempotency, concurrency, replay, reordering, and
  partial commit;
- dependency timeout, provider error, database error, Redis error, blob/email
  error, retry, compensation, and recovery;
- caching and stale-state behavior;
- data creation, read, update, delete, tombstone, export, migration, encryption,
  retention, and audit behavior;
- log, Sentry, analytics, URL, browser-storage, and response-body privacy; and
- response status, user-safe message, retry affordance, and no false upsell.

Build an API contract table:

| Endpoint/method | Caller | Authz/tier/flag | Valid case | Invalid case | Failure/recovery | Data effect | Privacy evidence | Test IDs | Verdict |
|---|---|---|---|---|---|---|---|---|---|

Pay special attention to:

- server authorization versus client visibility;
- check quotas and global caps occurring before paid calls;
- immutable check snapshots and history/memory ownership;
- POST-body search so health/meal text never enters URLs;
- billing inbox ordering, terminal-state guards, webhook signature and replay,
  verify-on-read, reconciliation, cancellation, refund, and entitlement recovery;
- journey compare-and-set transitions and weekly-artifact invalidation;
- push subscription, cadence, quiet hours, inactivity/paused/graduated stop rules;
- consent-before-persistence and complete health-data/account erasure;
- upload type/size/content validation and no unintended photo persistence;
- cron authentication, duplicate runs, backlog recovery, and observable failure;
  and
- internal video/admin routes being inaccessible to ordinary users.

## Phase 5 — Browser and real user-journey E2E testing

Derive the complete page list from code. Visit every reachable page and material
state. Test supported mobile and desktop projects, including Mobile Chrome and
Mobile Safari. Add desktop Chromium and other supported browsers where current
configuration or product claims require them.

Capture screenshots or traces for key states. Inspect console, network,
hydration, server logs, focus behavior, redirects, cookies/storage, and data
changes. A visible assertion passing while the page logs a relevant unhandled
error is not a pass.

### 5.1 Required end-to-end journeys

1. **First promise:** clean visitor → landing promise/demo → CTA → onboarding →
   consent/A1C → first meal → clarification if needed → result → explanation →
   practical next action → persistence/feedback. Prove the promoted example
   through the real current engine path.
2. **Text check:** each verdict, clarification, not-food, insufficient detail,
   clinical/out-of-scope route, safe retry card, provider timeout, rate limit,
   daily cap, paused launch, rapid double submit, reload, back/forward.
3. **Voice:** unsupported browser, denied permission, silence, partial/wrong
   transcript, user correction, submission, history method fidelity, privacy.
4. **Photo:** disabled UI/API; authorized enabled configuration; invalid type,
   too-large image, unreadable photo, confidently wrong draft, user edit,
   discard, reshoot, submission, history method fidelity, and no raw-photo
   persistence beyond the documented boundary.
5. **Identity:** sign-in request, delivery in a safe test system, resend,
   expired/reused/bad link, session expiry, sign-out, return path, duplicate
   identity, reviewer mode, guest-data migration, cross-device access.
6. **History:** empty state, local/remote merge, pagination, search, date/filter
   behavior, action updates, per-item delete, full export, stale/error/retry,
   large account, cross-user denial, consistency after refresh/device change.
7. **Feedback and safety queue:** result-linked helpful/not-helpful, duplicate
   feedback, auth/ownership, network failure, admin ordering, remediation state,
   no health text in analytics.
8. **Dashboard/progress:** empty/new/returning/heavy-use users, daily loop,
   progress, insight/streak/reassurance, locked versus unavailable versus retry,
   flag combinations, date/timezone/week boundaries.
9. **Meal Memory:** off-state fail closure; authorized on-state save, recall,
   exact-match behavior, re-check, edit, favorite/labels/notes, search/pagination,
   delete one/all, export after flag-off, health-data withdrawal, cross-user
   denial, and proof that memory never influences the meal-check engine.
10. **Learning Journey:** off-state fail closure; authorized on-state stage
    derivation, transitions, duplicate/concurrent transition, pause/resume,
    weekly learning creation/caching/invalidation, nudge triggers/cadence/quiet
    hours/open tracking, graduation choices, maintenance, inactivity stop, and
    cancellation independence.
11. **Trial and paywall:** first-day meter, trial wall, legacy mode, server price
    authority, monthly/annual display, no stale/fabricated price, terms acceptance,
    checkout return, abandoned/declined/duplicate purchase, syncing/recovery,
    canceled/lapsed/refunded states, and no entitlement bypass.
12. **Stripe and Play:** use sandbox/test fixtures only; checkout/webhook/portal,
    replay/out-of-order events, reconciliation, precharge, cancel, refund,
    restore, Play verification/RTDN, platform-specific UI, and cross-provider
    consistency.
13. **Pantry Review:** public offer → one-time purchase/claim → intake → upload →
    extraction → user confirmation → submit → capacity state → process/sweep →
    report access → email/support/refund; also duplicate, unauthorized, expired,
    full-capacity, malformed-photo, provider-error, and cross-user cases.
14. **Account/data rights:** profile, reminder cadence/quiet hours, subscription
    management, support/refund path, history/memory export, consent withdrawal,
    health-data deletion, full account deletion, re-login/recreation, and proof
    of what remains for billing/legal obligations.
15. **Install/offline/recovery:** installability, icons/manifest/service worker,
    offline launch, offline check behavior, stale-cache boundaries, update,
    reconnect, slow network, database/Redis/model/email/blob/Sentry outage,
    recovery without false data loss or false paywall.
16. **Admin/internal:** ordinary-user denial, reviewer authorization, feedback
    and Pantry queues, crons, health, and video-engine asset/spec/hook/render/
    approve/commit/run/state workflow with sandbox fixtures and no accidental
    public or production mutation.

### 5.2 Interaction and device stress

For every core journey test:

- fresh and returning browser state;
- refresh, back/forward, interrupted navigation, multi-tab, rapid repeat click,
  duplicate form submit, and session expiry;
- narrow phone, landscape phone, tablet, desktop, 200% zoom, large text,
  on-screen keyboard, safe areas, reduced motion, and dark/light system settings
  where supported;
- keyboard-only navigation, logical focus order/restoration, visible focus,
  accessible names, status/error announcements, non-color meaning, contrast,
  touch targets, and automated axe plus manual checks.

No core task may depend on hover, color alone, perfect network timing, or
undisclosed browser support.

## Phase 6 — Deep meal-check and safety diagnosis

Use deterministic coverage first. Use authorized live-provider testing only as
a separately labeled evidence class.

Exercise repeated and boundary cases across:

- A1C `5.69`, `5.70`, `6.39`, `6.40`, `6.49`, `6.50`, missing, malformed,
  stale, and contradictory values;
- diagnosed diabetes, pregnancy, medication, allergy, eating-disorder,
  emergency/acute symptom, self-harm, pediatric, and unsupported questions;
- underspecified foods, full meals, beverages, sauces/condiments, leftovers,
  nutrition labels, quantities, portions, mixed dishes, brands, restaurants,
  cultural staples, transliterations, spelling variants, negation, and
  substring collisions;
- long/Unicode input, prompt injection, schema injection, prompt-leak requests,
  profanity, hidden instructions, non-food images, and PII in photos/text;
- model/schema/postprocess failure, stochastic repeatability, and photo-draft
  variance.

The final candidate requires:

- zero dangerous false reassurance in the release corpus;
- zero forbidden diagnosis, treatment, reversal, prediction, personal-safety,
  accuracy, or unsupported quantitative claims;
- no invented meal components or rationale disconnected from the input;
- no prompt/system/schema leakage;
- no shaming, coercion, alarmism, or disordered-eating reinforcement;
- deterministic clinical/out-of-scope routing before model use where required;
- safe fail-closed behavior for invalid model output;
- one honest clarification when needed, without an endless loop or suppression
  of clinical/floor routing;
- result card, persisted snapshot, history, feedback, memory, and analytics
  agreeing about the same check; and
- no rubric weakening, fixture relabeling, judge shopping, or deletion of hard
  cases merely to make a score pass.

Report results by meaningful strata, not only as an aggregate. Preserve known
gaps and reviewer disagreement. Engineering evidence is not credentialed
clinical validation.

## Phase 7 — Diagnose whether Revora actually delivers its promise

### 7.1 Test the full value chain

For representative intended users and realistic contexts—home, grocery aisle,
restaurant, takeout, cultural mixed dish, repeat meal, uncertain description—
measure:

1. time and friction from intent to submitted meal;
2. whether the app understands enough or asks the right clarification;
3. whether the label is internally consistent and cautious;
4. whether the reason teaches something specific to the described meal;
5. whether the next action is feasible, culturally respectful, affordable,
   available, and meaningfully different from generic advice;
6. whether uncertainty and limits are obvious without destroying usefulness;
7. whether the result survives refresh/history/export accurately;
8. whether the user can act without confusion or shame; and
9. whether the experience is better enough than a free search, generic chatbot,
   nutrition label, or doing nothing to justify returning and paying.

Do not award product value merely because the software returns a valid card.

### 7.2 Use an evidence-graded promise verdict

For each promise assign exactly one:

- `PROVEN`: reproduced through the real current path with adequate evidence;
- `PARTIAL`: some conditions or users pass, but material gaps remain;
- `FAILED`: current behavior contradicts the promise;
- `UNVERIFIED`: the necessary environment, external dependency, user evidence,
  or approval is unavailable;
- `NOT APPLICABLE`: only with a written reason.

Then answer directly:

- Does Revora deliver its core first-session promise today?
- For which intended users, meals, environments, and states?
- Where does it overpromise, underdeliver, or create false confidence?
- What is the smallest complete fix for each mismatch?
- After remediation, what remains an engineering fact versus a user-outcome or
  human-approval hypothesis?

### 7.3 Validate with real users when evidence exists

Inspect current research, support, feedback, analytics, interviews, usability
sessions, and experiment results only through privacy-safe authorized access.
Separate:

- what users said;
- what users did;
- what the product logged;
- what was paid;
- what was refunded or canceled; and
- what the auditor infers.

Do not convert a usability walkthrough into an efficacy claim. If no adequate
real-user evidence exists, state that promise delivery is technically
demonstrated but user value remains unvalidated, then specify the exact study
needed.

## Phase 8 — Diagnose whether paying users can stay for the long term

### 8.1 Define the question before answering

Use these definitions unless current product decisions provide stricter ones:

- **Paying user:** a real non-test customer whose first charge settled and was
  not immediately refunded, excluding staff, reviewers, comps, and duplicates.
- **Activated:** completed the agreed first-value event, not merely signed up or
  paid.
- **Retained:** remains entitled and demonstrates the pre-registered recurring
  value behavior for the period; passive annual prepayment alone is not proof
  of value.
- **Long term:** report D30, D90, D180, and D365 separately. Do not collapse
  them into “long-term retention.”

### 8.2 Map the recurring-value loop

Trace and test whether this sequence works and stays truthful:

```text
uncertain meal decision
  -> quick trustworthy check
  -> useful action
  -> optional user-owned memory
  -> recall/re-check at a later decision
  -> honest weekly learning
  -> appropriately timed nudge
  -> visible learning/progress
  -> graduation or maintenance without dependency or dark patterns
```

For each step record technical availability, friction, user value, safety risk,
entitlement/flag state, measurement, and evidence of repeat use. Identify loops
that are merely notifications, streak pressure, or artificial lock-in rather
than new value.

### 8.3 Analyze real cohort evidence if it exists

Use cohort start dates and denominators that include churned users. Segment
only on pre-registered, adequately sized, non-sensitive dimensions. Report at
minimum:

- visitor → first check → account → trial → paid conversion;
- time to first meaningful value;
- D1, D7, D30, D90, D180, and D365 product and paid retention where mature;
- weekly active paid users and meaningful checks per retained payer;
- repeat-meal recall, weekly-learning use, and return triggered without a push;
- trial cancellation, paid cancellation, failed payment, refund, involuntary
  churn, voluntary churn, and reactivation;
- monthly versus annual cohorts without mistaking annual lock-in for engagement;
- gross logo and revenue retention using clearly stated formulas;
- cancellation/support reasons and qualitative evidence;
- safety complaints, harmful confusion, and trust loss; and
- missing events, instrumentation changes, flag changes, pricing changes, and
  survivor bias.

Never publish small-cell health segments or expose user-level data. Do not
manufacture targets after seeing outcomes.

### 8.4 Run the counterfactual subscription test

Ask and substantiate:

- After users learn their common meals, what new value appears next month?
- Can the product help without requiring more and more logging?
- Does the value survive novelty loss?
- Does graduation create a healthy maintenance relationship or eliminate the
  reason to subscribe?
- Would users miss Revora enough to pay the current monthly or annual price?
- Is the paid plan materially better than the free product and substitutes?
- Are reminders helping a chosen goal or manufacturing anxiety/dependence?
- Does retention come from value, or from annual prepayment, cancellation
  friction, sunk cost, or fear?

### 8.5 If cohort evidence is missing, produce a falsifiable validation path

Use and critically re-check the current repository protocols, including the
meal-memory concierge study and retention-cohort preregistration. Improve them
where necessary without changing precommitted thresholds after results exist.

At minimum define:

- target participant and exclusion criteria;
- sample and recruitment source;
- disclosed price and treatment of discounts/comps;
- the exact first-value and recurring-value events;
- D7/D30/D90/D180/D365 measurement windows;
- success, fail, stop-safety, and no-build thresholds chosen in advance;
- cancellation/refund/support interviews;
- privacy, consent, compensation, and clinical escalation procedures;
- instrumentation QA and denominator reconciliation;
- feature-flag rollout order and rollback triggers; and
- the decision each result permits.

Do not enable Meal Memory or Learning Journey in production merely because the
code works. Honor their current discovery, clinical, privacy, legal,
accessibility, and rollout gates unless authentic current evidence changes them.

### 8.6 Required paid-retention verdict

Choose exactly one and defend it:

- `PROVEN FOR THE MEASURED PERIOD`;
- `PROMISING BUT UNPROVEN`;
- `UNLIKELY WITHOUT MATERIAL CHANGE`;
- `FAILED IN CURRENT COHORTS`;
- `INSUFFICIENT EVIDENCE`.

State separately:

- technical readiness of the retention mechanisms;
- strength of recurring user value;
- commercial evidence at the current price;
- maximum duration the available cohort can support;
- top churn drivers and trust risks;
- which features genuinely create new value over time;
- which features should remain off or be removed; and
- the single next experiment most likely to change the verdict.

## Phase 9 — Security, privacy, billing, accessibility, performance, and operations

Run a deep cross-cutting audit. At minimum verify:

### Security and privacy

- server-side authentication and object-level authorization on every private
  read and mutation;
- CSRF, open redirect, injection, XSS, request-size, upload, webhook, cron,
  admin, and reviewer boundaries;
- sensitive-data exclusion from analytics, Sentry, logs, query strings,
  previews, caches, and browser storage;
- consent, encryption through an actual safe test row, key/error behavior,
  export, erasure, account deletion, backups/retention disclosures, and data
  minimization;
- dependency vulnerabilities prioritized by reachability and exploitability.

### Billing and commercial truth

- prices and plan capabilities come from server authority;
- checkout displays price, cadence, renewal, trial, charge date, cancellation,
  and refund terms before affirmative acceptance;
- duplicate/replayed/out-of-order events cannot grant, resurrect, revoke, or
  double-charge incorrectly;
- entitlement recovers from webhook and provider timing failures;
- cancellation is direct and cancellation does not erase earned access;
- refunds, Play, Stripe, Pantry, and account copy agree with actual operations;
- outage is never misrepresented as a paywall or free-tier state.

### Accessibility and inclusive UX

- WCAG 2.2 AA expectations on core and billing flows;
- keyboard, screen-reader semantics, focus, live regions, contrast, zoom, large
  text, reduced motion, touch targets, readable health information;
- no shame, coercion, countdown pressure, broken-streak loss aversion, or
  inaccessible reliance on color;
- representative target-user usability remains a human evidence gate.

### Performance and resilience

- measure core route and interaction timings under realistic cold/warm and slow
  conditions;
- avoid duplicate model, database, entitlement, and analytics work;
- verify timeouts, cancellation, retries, idempotency, backpressure, caps,
  degraded modes, cache correctness, and recovery;
- verify client bundles/images/fonts and server/database query behavior where
  material;
- never trade away safety, correctness, privacy, or accessibility for a metric.

### Operations and observability

- health and heartbeat reflect enforced dependencies without leaking secrets;
- errors are actionable but contain no health data;
- alerts, reconciliation crons, queues, support/refund process, email delivery,
  analytics completeness, and stop-the-line controls are actually wired;
- production domain/TLS, public access, database, Redis, Stripe, email, blob,
  model provider, Sentry, analytics, scheduler, and deployed revision are
  verified through authorized evidence or marked unverified;
- distinguish configured, reachable, exercised, and monitored.

## Phase 10 — Canonical issue ledger and remediation loop

Create the ledger immediately and update it throughout:

| ID | Severity | Surface | Evidence bucket | Reproduction | Expected | Actual | Root cause | User/business risk | Fix | Regression test | Retest | Status | Owner/blocker |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

Severity:

- `P0 BLOCKER`: plausible harm or serious misleading health guidance;
  authorization/privacy/payment breach; destructive data loss; taking money
  incorrectly; exposed secret; or unusable core journey.
- `P1 MAJOR`: wrong result, broken core flow, material promise mismatch,
  inaccessible core action, repeated failure, entitlement error, lost data,
  or uncontrolled cost with no safe workaround.
- `P2 MODERATE`: meaningful degradation with a safe workaround.
- `P3 MINOR`: cosmetic, low-impact, documentation, or maintainability issue.

For every confirmed safe in-scope issue:

1. reproduce it deterministically;
2. identify the root cause and all affected paths;
3. add the smallest meaningful failing regression test;
4. implement the narrowest complete shared fix;
5. update active governed docs/contracts when behavior changes;
6. run the targeted test;
7. run the full affected suite;
8. exercise the real browser/API journey;
9. inspect logs, network, persistence, and adjacent guard cases;
10. update the ledger with exact evidence and residual risk.

Fix shared roots, not screenshots or isolated symptoms. Client hiding is not
server authorization. A test double is not integration wiring. Never relax a
contract, delete a hard case, relabel a fixture, suppress a warning, or broaden
a catch block merely to turn red into green.

Continue until no safely fixable P0 or P1 remains. External and human blockers
must be specific, evidenced, and assigned an exact closure action; they do not
justify leaving unrelated engineering work unfinished.

## Phase 11 — Final clean-room verification

After remediation:

1. review the complete diff and compare it to the opening dirty-worktree record;
2. run secret scanning without exposing discovered values;
3. run `git diff --check`;
4. rerun lint, typecheck, unit/integration, claims/safety contract, build,
   deterministic evals, browser E2E, accessibility, and dependency gates;
5. rerun every new regression and every P0/P1 journey from clean browser and
   test-data state;
6. run both fail-closed flag states and every authorized fully-on flag state;
7. verify no test left tracked or generated configuration dirty;
8. confirm active docs, pricing, flags, capability matrix, runtime copy, terms,
   privacy, support, and actual behavior agree;
9. tie CI/preview/production evidence to exact revisions where available;
10. confirm external approval gates remain honestly open or fail closed when
    evidence is absent.

Do not summarize this as “all tests passed.” Report exact commands, revision,
environment, exit code, counts, skips, retries, duration, and evidence paths.

---

## Definition of done

### Engineering end-to-end complete

This may be `PASS` only when:

- the documentation, route, feature/function, state, flag, dependency, and test
  denominators are published;
- every material inventory row has direct evidence or an explicit blocker;
- every current page/API/background function and material state maps to a test;
- all required end-to-end journeys pass in supported environments;
- no known safely fixable P0 or P1 issue remains;
- final automated and browser suites pass with no unexplained skips, retries,
  warnings, console/network/server errors, or test pollution;
- safety, privacy, billing, authorization, data rights, accessibility, and
  failure recovery meet the acceptance rules above;
- active promises match final behavior and flags; and
- the result is tied to an exact clean candidate revision or clearly labeled
  dirty local candidate.

### Promise delivery validated

This may be `PROVEN` only when the core promise reproduces across representative
realistic inputs and the real current path, every material promise-to-proof row
passes, there is no material claim drift, and adequate real-user evidence shows
the result is understandable and useful. Software behavior without user-value
evidence supports `TECHNICALLY DEMONSTRATED`, not full validation.

### Long-term paid retention validated

This may be `PROVEN FOR THE MEASURED PERIOD` only with mature, correctly defined
real paid cohorts and evidence that users repeatedly receive new value. D90
cannot prove D180 or D365. Annual prepayment cannot substitute for meaningful
engagement. If mature evidence is absent, the honest result is unproven plus a
pre-registered experiment—not a confident forecast.

### External readiness complete

Clinical, counsel, privacy/DPIA, accessibility/usability, production operations,
provider, and owner gates close only with authentic current evidence. Local
tests, simulated review, deployment success, or risk acceptance cannot close
them.

---

## Required durable deliverables

Save evidence in the repository without overwriting unrelated artifacts.
At minimum produce:

1. `docs/handoff/YYYY-MM-DD-revora-e2e-promise-retention-audit-report.md`
   containing the snapshot, methods, denominators, evidence, issue ledger,
   remediation, retests, and verdicts.
2. A complete feature/function/route/test matrix in Markdown or CSV, linked
   from the report.
3. A promise-to-proof matrix and a flag/role/state matrix.
4. Machine-readable test/run evidence where practical, with secrets and user
   data excluded.
5. Screenshots/traces for the critical journeys and failures, using the repo’s
   existing ignored artifact convention.
6. A concise continuation handoff only if genuine external/time-bound work
   remains, listing exact commands, status, owner action, blocker, and next
   decision. Do not use a handoff to avoid safe in-scope work.

The report must open with this decision table:

| Decision | Verdict | Confidence | Strongest evidence | Largest remaining gap | Exact next action |
|---|---|---:|---|---|---|
| Engineering E2E | PASS / PARTIAL / FAIL / BLOCKED | 0–100% | | | |
| Core promise delivery | PROVEN / PARTIAL / FAILED / UNVERIFIED | 0–100% | | | |
| Health/claims safety | PASS-ENGINEERING / BLOCKED-HUMAN / FAIL | 0–100% | | | |
| Long-term paid retention | PROVEN FOR PERIOD / PROMISING BUT UNPROVEN / UNLIKELY / FAILED / INSUFFICIENT EVIDENCE | 0–100% | | | |
| Production readiness | GO / CONDITIONAL GO / NO-GO / UNVERIFIED | 0–100% | | | |

End with:

- the exact revision and dirty/clean state tested;
- feature/function denominator and coverage summary;
- fixed issues by severity;
- remaining issues and blockers by severity/owner;
- exact test commands and results;
- direct answers to “Does Revora deliver its promise?” and “Can it keep paying
  users for 90/180/365 days?”;
- what is proven, inferred, forecast, and unknown;
- one prioritized next action that most increases justified confidence; and
- a final `GO`, `CONDITIONAL GO`, `NO-GO`, or `UNVERIFIED` recommendation with
  no optimistic language beyond the evidence.

---

## Final self-audit before stopping

Confirm every answer is `yes`, or document the gap:

- Did I refresh current source, branch, flags, environments, and deployed truth?
- Did I preserve pre-existing work and avoid unauthorized side effects?
- Did I publish complete denominators rather than test only obvious pages?
- Did I map every page, API, background job, business function, flag, role,
  state, dependency, and test to evidence?
- Did I run real user journeys, not only unit tests?
- Did I inspect failures, retries, skips, console/network/server logs, and test
  pollution?
- Did I test normal, boundary, adversarial, failure, recovery, concurrency,
  privacy, billing, mobile, and accessibility states?
- Did I reproduce, fix, regression-test, and retest every safe in-scope P0/P1?
- Did I verify every public promise against current rendered behavior and
  enforcement?
- Did I keep technical correctness, real user value, paid retention, production
  proof, and external approvals separate?
- Did I avoid inferring retention from feature existence or annual prepayment?
- Did I give an explicit evidence-backed verdict even if the answer is negative?
- Are all durable artifacts saved and free of secrets or user data?

If any required item is incomplete, do not disguise it as success. Continue the
work when safe; otherwise record the precise blocker and closure action.
