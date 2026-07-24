# Revora E2E readiness — validated root-cause synthesis and implementation plan

> Validation pass over the 2026-07-23 report-only audit corpus. This document
> re-verified every finding against the live repository and live production, then
> turned the surviving findings into one sequenced plan. It applies **no** code
> fixes. Counsel, dietitian, and every other outsider voice were inventoried as
> an evidence class only and decided nothing here — every verdict rests on code,
> tests, or runtime output cited by `file:line`, command, or artifact.

## Bottom line

Revora is **closer to end-user-ready than the prior audit's tone implies, but not
by enough to ship** — and the prior audit's engineering verdicts were essentially
correct. I reproduced all three P0s and all 28 lower findings; none was refuted,
one (AUD-021) is narrower than written, and I added three new findings. The single
thing standing in the way is **one architectural fact that fans out into most of
the safety failures: safety-critical deterministic routing is not independent of
provider/dependency configuration.** The same broad-symptom input returns the
correct clinical card in healthy production (confirmed live on `revora.plus`) but
collapses to an unrelated retry the moment the model credential is missing
(AUD-025) — and I found a *second* dependency, the abuse limiter, that preempts
the clinical route the same way (NEW-003). Fix that independence, fix the two
copy-level safety contradictions (the 15g/15min instruction AUD-015 and the
narrow claims gate AUD-023/031), patch the reachable auth advisory (AUD-024), and
the app moves from NO-GO to a defensible conditional GO. The features the owner
wants activated (Meal Memory, Learning Journey) are blocked first by a config-
contract defect (AUD-002) that is small and mechanical. Paid retention (AUD-028)
is an evidence gap engineering cannot close — it stays honestly unproven.

---

## Phase 1 — Refreshed ground truth (what moved since the corpus)

| Fact | Corpus (2026-07-23) | Now (2026-07-24) | Change |
|---|---|---|---|
| Local branch / HEAD | `docs/b1-b2-final-closeout` / `b5c03f4` | same | none |
| HEAD vs `origin/main` | 0 ahead / 10 behind | 0 ahead / 10 behind | none |
| Production SHA (deployment `dpl_xSxcn7uzGoBF8XmSjD2bFS4VDtvm`) | `24d88ec` | `24d88ec`, `READY`, `githubCommitSha=24d88ec`, branch `main` | none |
| Local HEAD relationship to prod | ancestor (PR #35 merged) | confirmed ancestor; the 10 commits are 8 docs + 2 additive code (CSP allowlist, e2e harness) | none |
| CI / CodeQL on `24d88ec` | green | green (`gh run 30045405756`, `30045404709`) | none |
| Production health | healthy | `/api/health` 200 `healthy` `environment=production` `launch=ready`, all 5 crons `ok`, `billingWebhook=configured` | none |
| Paywall | `trial` `$12.99`/`$99.99` | identical | none |
| Live Stripe Revora prices | 4 recurring + 1 Pantry | annual `$99.99`, monthly `$19.99`/`$12.99`/`$9.99`, Pantry `$49.00` one-time (V007) | none |
| Live Revora subscriptions | 0 all states | **0** all four prices (V008) | none |
| Live Revora checkout sessions | 3 expired/unpaid | 13 sessions all expired/unpaid; Revora-era = 1 `$0` sub + 2 `$49` Pantry (V012) | none |
| Canonical prod DB | 2 users, 4 support, else 0 | **2 users, 4 support, else 0** (V013) | none |
| `Postgres-FOMu` | 7 billing inbox, else 0 | **7 billing inbox, else 0** (V013) | none |
| Provider env (Vercel prod) | OpenAI direct; no base URL | `OPENAI_API_KEY` present; **no `OPENAI_BASE_URL`, no `REVORA_MODEL`** | confirms NEW-001 |
| Auth chain | `@auth/core 0.41.2` affected | `0.41.2` affected; patched `0.41.3`/`beta.32` now published on npm | fix now available |

**Nothing material changed.** The deployed source underlying every finding is
byte-identical to the corpus baseline (the 10-commit delta touches only docs, a
CSP allowlist entry, and the e2e Stripe harness — none in the meal engine, API
handlers, data model, billing, auth, or product copy). **No finding is STALE.**
The artifact SHA-256 table in continuation-handoff file 3 verified: all 10 listed
hashes match on disk. Corpus is trusted input.

---

## Phase 2 — Validation result (all 34 rows)

Full evidence is in `2026-07-24-revora-e2e-validated-issue-ledger.csv` and
`2026-07-24-revora-e2e-validation-run-evidence.csv`. Summary:

| Verdict | Count | IDs |
|---|---|---|
| CONFIRMED | 30 | all AUD except 021 |
| CONFIRMED (narrowed) | 1 | AUD-021 (confirm-route CAS guard exists; only the delete+reinsert stranding survives) |
| REFUTED | 0 | — |
| STALE | 0 | — |
| NEW | 3 | NEW-001 (OpenRouter policy is hard-blocked in prod), NEW-002 (split DB stores), NEW-003 (abuse door preempts clinical route) |

**The three P0s, tested as hypotheses, all hold:**

- **AUD-015 — CONFIRMED, escalated to live.** Not just source: an anonymous
  `POST https://revora.plus/api/check` with `feeling shaky and clammy after lunch`
  returned HTTP 200 `kind=clinical route=possible_hypoglycemia` with *"about 15
  grams of fast-acting carbs … recheck in 15 minutes"* (V017). This is shipping to
  real users right now. Source: `docs/safety/copy-ledger.md:40` (documented owner
  exception) loaded verbatim by `lib/revora/safety-contract.ts:54`; triggered by
  bare `shaky|dizzy|sweaty|clammy` at `lib/revora/clinical-risk.ts:95-118`. It
  contradicts `docs/safety/claims-boundary.md:14-16` ("informational-only",
  "qualitative", no numbers/treatment).

- **AUD-024 — CONFIRMED.** Installed `node_modules/@auth/core/lib/actions/signin/
  send-token.js:74-98` is the vulnerable `defaultNormalizer` (splits on ASCII `@`
  before any Unicode normalization); `auth.ts:37-101` wires the Resend provider
  with no `normalizeIdentifier` override and passes `params.identifier` straight
  to `sendEmail`. `npm audit --omit=dev` exits 1 on GHSA-7rqj-j65f-68wh (V014).
  The other two chain advisories are unreachable (no first-party `getToken`; email
  provider only) — I verified both.

- **AUD-025 — CONFIRMED.** `app/api/check/route.ts:326` eagerly evaluates
  `model: modelFactory(undefined)` while *constructing the argument* to
  `checkFood`; `getModelClient → createOpenAIRevoraModelClient → createTransport`
  throws on a missing key (`lib/revora/openai-client.ts:345`) before any
  deterministic route runs. Reproduced on the harness-built exact-SHA server
  (V018). **New adjacent fact (NEW-003):** on a public-shape build with the abuse
  limiter unconfigured, `proxy.ts:126-136` returns a 503 load-shedding card for
  *all* check traffic including clinical symptoms — a second dependency with the
  same failure mode.

The two honesty claims also hold: the harmful-if-`Clear` fixtures reproduce as
`SAFE` (V019: both `stratum-sauce-bbq-ribs` and `stratum-underdesc-leftover-curry`),
and pediatric context is not excluded (V020: 10-year-old → adult MODERATE card).

**Disagreement with the prior audit, stated plainly:**

1. **AUD-021 is narrower than written.** The confirm route *does* compare-and-set
   `awaiting_confirm → processing` (`app/api/pantry/confirm/route.ts:73-80`), so
   concurrent confirms are already safe. The real remaining defect is only the
   non-transactional `delete`+`insert` of items (:94-106), which can strand
   `status=processing` with missing items and reject the retry. The submit-route
   half is fully confirmed. Severity stays P1; scope corrected.
2. **The corpus's "keep Memory/Journey off" retention sequence is superseded** by
   the owner's all-features-on decision. I re-derive the plan around activation,
   not deferral (Workstream 5). The underlying config defect (AUD-002) is real
   either way and must be fixed *first*.
3. **NEW-001 makes the OpenRouter switch a first-class blocker, not a key swap.**
   Production *actively rejects* any `OPENAI_BASE_URL` (`openai-client.ts:97-105`,
   pinned by test `c004b08`) and provider-prefixed model ids; the two vision call
   sites (`lib/meal/photo-extract.ts:152`, `lib/pantry/extract.ts:148`) build
   `new OpenAI({apiKey})` with **no** baseURL at all. The decided architecture
   cannot deploy without a deliberate, tested policy change across every call site.

---

## Phase 3 — Root-cause synthesis

Eleven groups explain all 34 findings. Ordered by user-facing risk, then by
unblocking power (what must be true before other work can even be tested).

### G1 — Safety scope is contradicted by its own copy, and the claims gate is too narrow to catch it
**Findings:** AUD-015 (P0), AUD-023, AUD-031, AUD-016, AUD-017.
The product declares an informational-only, qualitative, no-treatment boundary
(`claims-boundary.md`) but ships a quantitative 15g/15min first-aid instruction
(AUD-015), personal-suitability Pantry copy (AUD-016), and a prevalence claim
(AUD-017). The machine gate that is supposed to prevent exactly this
(`assertNoForbiddenClaims`, `safety-contract.json qualitativeOnly`) only matches
four numeric patterns and zero treatment/dose/personal-safety phrase classes, so
it passes green while the violations ship (AUD-023) and lets five "safe for
you"-class paraphrases through (AUD-031). One cause: **the enforceable boundary is
narrower than the declared boundary.**

### G2 — Deterministic engine has coverage holes at the input edges
**Findings:** AUD-014 (second model clarify), AUD-029 (harmful-SAFE exemptions),
AUD-030 (pediatric). The deterministic spine is strong in the middle but three
edges leak: a model-authored clarify bypasses the one-question cap because
`clarified` is only checked pre-model; two fixtures are exempted from the hard
harmful-SAFE gate; and there is no pediatric/age class at all. Cause: **routing
and gates were built for the common path and never extended to these edges.**

### G3 — Safety routing is coupled to provider and dependency availability
**Findings:** AUD-025 (P0), NEW-003, NEW-001, AUD-027, AUD-026.
Deterministic clinical/A1C/invalid routing is supposed to run before any provider
is needed, but eager model construction (AUD-025) and the fail-closed abuse door
(NEW-003) both preempt it under dependency failure. NEW-001 is the same coupling
seen from the provider side: the transport is hard-wired to direct OpenAI.
AUD-027 (200-for-invalid) and AUD-026 (guest 401 noise) are lower-severity
symptoms of imprecise failure-path semantics. Cause: **safety and correctness
routing is not isolated from provider/dependency construction.** *This is the
highest-unblocking-power group: most safety claims can't even be tested honestly
until routing is provably provider-independent.*

### G4 — Auth dependency + identity chain carry a reachable advisory and a latent schema bug
**Findings:** AUD-024 (P0), AUD-006. The only production sign-in path uses a
vulnerable Auth.js normalizer (AUD-024); the accounts table's `expires_at` is
`smallint` and will overflow if OAuth is ever enabled (AUD-006, latent). Cause:
**the identity chain has an unpatched dependency and a too-small column.**

### G5 — Retention-feature config contract never extended to the new features
**Findings:** AUD-002, AUD-019, AUD-020, AUD-005.
Memory/Journey landed after the env-doc, twin-guard, and E2E-isolation allowlists
were written, so all four variables are undocumented, unguarded against
client-on/server-off production activation (V016), and uncleared in isolated E2E;
the same late-arrival explains journey pause-vs-rollback (AUD-019) and start-race
(AUD-020) gaps, and the CI-never-builds-production gate (AUD-005) that would have
caught the guard hole. Cause: **the config/guard/test contract was not extended
to the retention features.** *This is the gate for the all-features-on decision.*

### G6 — Client-side gates contradict server-authoritative billing/entitlement
**Findings:** AUD-009 (Premium metered as anonymous), AUD-011 (trial eligibility),
AUD-010 (Pantry price), AUD-022 (photo fail-open). Four places where a client
constant or a copy string is the user-visible source of truth while the server
holds the real one, and they disagree. Cause: **display/gating authority is
duplicated on the client instead of derived from the server.**

### G7 — Data-rights promises overstate the handlers
**Findings:** AUD-012 (export omits checks/memories but says "one file"),
AUD-013 (deletion says "immediate/complete" but 409s on active Play and retains a
hashed log). Cause: **public copy was not reconciled to fail-closed handler
behavior.**

### G8 — Marketing/product truth drift
**Findings:** AUD-007 (landing promises a weekly score the journey deliberately
removed), AUD-008 (static fixture labeled "the actual answer"). Cause: **acquisition
copy was not reconciled to shipped product decisions.**

### G9 — Ops/docs/test hygiene
**Findings:** AUD-001, AUD-003, AUD-004, AUD-018. Whitespace, an eval that arms
paid calls from ambient key+file, drifted env docs, hidden Playwright retries.
Cause: **incremental drift in operator-facing surfaces.**

### G10 — Paid-workflow atomicity/idempotency
**Findings:** AUD-021 (narrowed). Pantry submit (and the confirm delete+reinsert)
lack idempotency keys/transactions around external work. Cause: **multi-step paid
workflow uses autocommit statements around provider calls.**

### G11 — Paid-cohort evidence and instrumentation (not an engineering defect)
**Findings:** AUD-028, NEW-002. Zero paying users, zero activation events, split
billing stores. Cause: **no acquired paid cohort and no reconciled denominator.**
Engineering cannot close this; it is contained by keeping retention claims off.

### The true launch-blocking set

Blockers (must be green before any end-user launch):
**G1** (AUD-015, AUD-023, AUD-031), **G3** (AUD-025, NEW-003), **G4** (AUD-024),
**G2** (AUD-029, AUD-030, AUD-014), and the honesty rows in **G6/G7/G8** that are
user-visibly false while the product is live (AUD-009, AUD-011, AUD-007, AUD-012,
AUD-013). **G5** (AUD-002) is a blocker *for the all-features-on decision*
specifically. NEW-001 is a blocker *for the decided OpenRouter architecture*.

Not blocking — can ship after, with containment:
AUD-016/AUD-017 (Pantry/onboarding copy — fix in the same G1 sweep, low reach),
AUD-010 (price coincides today; bind server-side next), AUD-022 (photo fail-open —
fix with the entitlement unification), AUD-021 (Pantry is a separate paid product,
can stay gated), AUD-006 (latent until OAuth), AUD-018/AUD-003/AUD-004/AUD-001
(hygiene), NEW-002 (ops archive), AUD-026/AUD-027 (low-severity semantics),
AUD-028 (evidence, never a code gate).

---

## Phase 4 — Implementation plan

Sequenced workstreams. Each names the root cause it closes, the finding IDs, exact
files, approach, dependencies, effort, a regression test that fails before and
passes after, and exact verification with observable pass criteria. **No fix lands
without its test.**

Standing decisions honored throughout: (1) production provider is **OpenRouter** —
covered end to end in WS-2; (2) all features ship **activated** — WS-5 makes that
safe and coherent; (3) outsider voices decide nothing.

### WS-0 — Isolate deterministic routing from provider/dependency construction *(do first; unblocks honest testing of everything else)*
- **Root cause:** G3. **Findings:** AUD-025 (P0), NEW-003.
- **Files:** `app/api/check/route.ts` (defer `modelFactory` — pass a lazy
  `() => RevoraModelClient` thunk into `checkFood` instead of an eager client, or
  move construction to the first line after all deterministic branches in
  `lib/revora/service.ts`); `lib/revora/service.ts` (accept the lazy factory;
  never call it on clinical/out-of-scope/clarify/not_food/invalid paths);
  `app/api/check/photo-draft/route.ts` (same lazy stance); `proxy.ts` (give the
  check-route fail-closed 503 copy an urgent-care boundary line so a clinical
  symptom during a limiter outage still points to human care).
- **Approach:** Make the model client construct lazily on first `generate()`; every
  deterministic branch returns before that. For NEW-003, do not weaken the abuse
  gate — change the copy path only, or add an edge-cheap clinical-symptom screen if
  feasible, and document the decision.
- **Dependencies:** none. Everything else in G1/G2 depends on this being true so
  their tests aren't masked by provider/limiter errors.
- **Effort:** M (routing change is small; test matrix is the work).
- **Regression test:** `tests/unit/revora/route-provider-independence.test.ts` —
  new. Assert that for missing key, invalid key, and unreachable base URL, a
  `shaky/clammy` input returns `kind=clinical`, a `6.50` A1C returns out-of-scope,
  and a malformed request returns the invalid response, **with the model factory
  spy asserted `toHaveBeenCalledTimes(0)`** on every deterministic case. Add
  `tests/unit/server/proxy.test.ts` case: limiter `store_error`/unconfigured on the
  check route → response body contains the urgent-care line.
- **Verify:** `npm test -- route-provider-independence proxy` → both files pass;
  spy call count 0 on all deterministic cases. Then rebuild the harness server with
  the key empty and re-run the V018 matrix → clinical/out-of-scope/invalid cards
  (not a 503 or generic retry) for the deterministic inputs.

### WS-1 — Close the safety-scope contradiction and widen the claims gate to match the declared boundary
- **Root cause:** G1. **Findings:** AUD-015 (P0), AUD-023, AUD-031, AUD-016, AUD-017.
- **Files:** `docs/safety/copy-ledger.md:40` (replace the 15g/15min treatment
  instruction in `clinical-possible-hypoglycemia` with a bounded urgent-human-care
  route carrying no food/dose/grams/timing); `tests/fixtures/safety-contract.json`
  (add `qualitativeOnly` phrase classes: grams, "recheck in N minutes",
  treatment/first-aid verbs, and personal-safety/"safe for you"/"bring your levels
  down" families); `lib/revora/postprocess.ts` `assertNoForbiddenClaims` (extend to
  the personal-safety/outcome-prediction classes); `app/report/[id]/page.tsx:110,123`
  (general-pattern language, no "fit your range"/"work better for you");
  `app/(app)/onboarding/page.tsx:442` (neutral example framing, drop "surprise
  almost everyone"); add a contract-consistency rule that every active clinical
  ledger row is checked against the banned families.
- **Approach:** Keep the deterministic no-model clinical route; only its *words*
  change. The claims gate change is additive — no existing control weakened.
- **Dependencies:** WS-0 (so the clinical route is provably reachable to test).
- **Effort:** M.
- **Regression test:** `tests/unit/revora/clinical-copy-no-treatment.test.ts` —
  negative fixture asserting no clinical route contains grams/mg/timing/treatment
  strings; `assertNoForbiddenClaims` unit adds the five AUD-031 paraphrases and the
  two AUD-016 Pantry phrases, each asserting `blocked=true`. All must fail on the
  current tree and pass after.
- **Verify:** `npm run contract` → still 9 gates green **and** the new negative
  fixture is included; `npm test -- clinical-copy-no-treatment postprocess` passes;
  re-run V017 against a redeployed candidate → the clinical card contains no
  grams/timing.

### WS-2 — Switch the production model provider to OpenRouter across every call site *(the decided architecture)*
- **Root cause:** G3 / NEW-001.
- **Files:** `lib/revora/openai-client.ts` (`resolveModelTransportConfig`,
  `isProductionModelEnvironment`, `createTransport` — replace the blanket
  production base-URL rejection with an **OpenRouter-host allowlist** in production;
  keep HTTPS/no-credential guards; map model-id naming and auth headers for
  OpenRouter); `lib/meal/photo-extract.ts:152` and `lib/pantry/extract.ts:148`
  (route the two `new OpenAI(...)` vision transports through the same config so
  photo/Pantry also hit OpenRouter, not direct OpenAI); `.env.example`,
  `docs/ops/env-reference.md`, `next.config.ts`, `scripts/e2e-runtime-env.ts`, CI,
  and Vercel production/preview envs (add/reference `OPENAI_BASE_URL`/`REVORA_MODEL`
  or the OpenRouter equivalents **in lockstep**); the pinned test from commit
  `c004b08` (rewrite to assert OpenRouter-allowed-in-production, other hosts
  rejected).
- **Approach:** Provider policy change, not a key swap. State the fallback policy
  explicitly: on OpenRouter timeout/rate-limit/model-unavailable, do the existing
  single-attempt → calm fail-closed retry (no silent second paid attempt); no
  cross-provider auto-failover at launch (document as a residual). Re-baseline
  `eval:revora`, `eval:pantry-extract`, `eval:meal-photo` on the OpenRouter route
  **before any quality claim**; record cost/latency deltas. Confirm and state the
  OpenRouter data-retention posture; update user-facing privacy copy if it differs
  from the current `store:false` direct-OpenAI statement.
- **Dependencies:** WS-0 (lazy construction) so the AUD-025 regression test can add
  the OpenRouter missing/invalid/unreachable cases and prove deterministic routes
  still never construct a client. Owner action OA-1 (OpenRouter credential/budget).
- **Effort:** L.
- **Regression test:** extend `route-provider-independence.test.ts` (WS-0) with
  OpenRouter host cases; new `tests/unit/revora/openrouter-transport.test.ts`
  asserting production allows the OpenRouter host, rejects a non-allowlisted host,
  and rejects credentials-in-URL; a vision-transport test asserting photo/Pantry
  use the configured base URL.
- **Verify:** `npm test -- openrouter-transport route-provider-independence` green;
  `npm run build` with `VERCEL_ENV=production` + the OpenRouter env set → no config
  throw; live eval re-baseline runs (owner-authorized, non-user fixtures) recorded
  with pass/fail thresholds as observable numbers, not adjectives.

### WS-3 — Patch the reachable auth advisory and canonicalize sign-in identifiers
- **Root cause:** G4. **Findings:** AUD-024 (P0), AUD-006 (latent).
- **Files:** `package.json`/`package-lock.json` (`@auth/core` → `0.41.3`,
  `next-auth` → `5.0.0-beta.32`); `auth.ts` (add a `normalizeIdentifier` that NFKC-
  normalizes then requires exactly one ASCII `@` before validation, as defense in
  depth even after the upgrade; invalidate outstanding `verification_tokens` on
  deploy); `lib/server/db/schema.ts:49` (`expires_at` `smallint` → `integer`, with
  a migration) — do this now even though email-only doesn't write it, to unblock
  future OAuth without a surprise.
- **Approach:** Upgrade + application-level canonicalization + token invalidation.
- **Dependencies:** none.
- **Effort:** S (upgrade) + S (schema migration).
- **Regression test:** `tests/unit/server/auth-identifier-normalization.test.ts` —
  a Unicode-separator/homoglyph corpus through the sign-in identifier path asserting
  rejection or canonicalization to a single mailbox form; a schema round-trip test
  inserting a realistic 10-digit `expires_at` and reading it back unchanged.
- **Verify:** `npm audit --omit=dev` → **exit 0** (was exit 1 with GHSA-7rqj-j65f-
  68wh); `npm test -- auth-identifier-normalization` passes; `npx drizzle-kit
  migrate` applies the new migration on the disposable DB.

### WS-4 — Close the deterministic engine edge holes
- **Root cause:** G2. **Findings:** AUD-014, AUD-029, AUD-030.
- **Files:** `lib/revora/service.ts:159-177` (when `clarified` is true, reject or
  conservatively resolve a model-authored `clarify` instead of returning a second
  question); `lib/revora/clinical-risk.ts` (add a pediatric/age class:
  child/minor/kid/son/daughter/"N year old" → out-of-scope before A1C/food/model);
  add an out-of-scope result kind for age in the schema; `tests/fixtures/revora-
  eval-cases.json` + the eval harness (stop exempting `harmfulIfSafe && knownGap`
  from the hard gate; route those two inputs to a clarification or conservative
  non-SAFE; add a guard that `harmfulIfSafe && knownGap` cannot coexist in a
  release corpus).
- **Approach:** Three independent, deterministic, no-model additions.
- **Dependencies:** WS-0 (reachability), WS-1 (the pediatric route needs safe
  neutral copy consistent with the widened boundary).
- **Effort:** M.
- **Regression test:** `service.test.ts` add `clarified=true` + model `kind=clarify`
  asserting no second question; `clinical-risk.test.ts` add the pediatric corpus
  asserting out-of-scope and **zero model calls**; the two AUD-029 fixtures must
  now **fail** the release command whenever the returned risk is `SAFE`.
- **Verify:** `npm run eval:revora` → the two fixtures now hard-fail on `SAFE`;
  `npm test -- service clinical-risk` passes; V019/V020 replays now return
  non-SAFE / out-of-scope.

### WS-5 — Make the retention-feature config contract complete, then activate all features coherently *(the all-features-on decision)*
- **Root cause:** G5. **Findings:** AUD-002, AUD-019, AUD-020, AUD-005.
- **Files:** `.env.example`, `docs/ops/env-reference.md` (document all four
  `NEXT_PUBLIC_MEAL_MEMORY`/`MEAL_MEMORY_ENABLED`/`NEXT_PUBLIC_LEARNING_JOURNEY`/
  `LEARNING_JOURNEY_ENABLED`); `next.config.ts:38-45` (extend the production twin
  guard to both new pairs — the exact gap proven in V016); `scripts/e2e-runtime-
  env.ts:81-96` (blank all four in isolated E2E so runs stop inheriting ambient
  flags); `lib/server/nudge.ts:373,457-500` (make pause/graduate stop-state durable
  across a flag-off rollback, or clear the underlying nudge preference on pause so
  rollback fails quiet); `app/api/journey/handlers.ts:286-301` (translate the
  UNIQUE(user_id) violation on initial start to an idempotent 409/success instead
  of a 500); `.github/workflows/ci.yml` (add a production-mode config job that
  exercises the twin guards with synthetic non-secret values).
- **Approach:** Fix the contract first (guard + docs + E2E isolation), then design
  the coordinated activated journey (below), then flip flags in the WS order in
  Rollout.
- **Coordinated all-on journey (friction/confusion deliverable):**
  - **First run:** anonymous guest gets the device-local taster check → result card
    → single CTA to save (sign-in), never a Memory/Journey prompt (they have no
    data yet). Empty states: `/meals` shows "your checks will appear here" not a
    broken list; `/journey` shows sections 3–4 (generic experiment + week facts,
    free-computable) with one labeled locked section, never a full-page paywall.
  - **Check → history:** a completed signed-in check persists once (encrypted) and
    appears in `/meals`; history is the single source of truth for past checks.
  - **History → Memory:** Memory is an explicit save-from-a-check action, not an
    automatic duplicate of history; recall is exact-match and never feeds the meal
    engine (non-interference already tested).
  - **Memory → Journey:** Journey reads checks for its weekly recap; it must not
    re-render Memory items or the history list — one surface per fact.
  - **Contradiction points to resolve in the plan:** (a) landing's weekly-score copy
    vs the journey's no-score recap — fixed in WS-6 (AUD-007), must land before
    Journey is advertised; (b) duplicate "save your meal" prompts between history
    and Memory — resolve to one save affordance on the result card; (c) two nudge
    systems (generic vs journey) — the AUD-019 fix makes the journey stop-state
    authoritative when the flag is on and quiet when off.
- **Dependencies:** WS-6 (AUD-007) must land before Journey is user-visible.
- **Effort:** L.
- **Regression test:** `next.config` twin-guard test asserting client-on/server-off
  is rejected for **both** Memory and Journey (currently V016 shows it imports);
  an ambient-env E2E isolation test asserting the four variables are blank in the
  harness; `nudge.test.ts` replace the current `sent===1` assertion (line 748-759)
  with `sent===0` after a paused→flag-off rollback; a true `Promise.all` double-
  start journey test against Postgres asserting one 409/success, no 500.
- **Verify:** re-run V016 → all four pairs now **REJECTED** in production mode;
  `npm test -- nudge journey next-config` green; the new CI production-config job
  passes.

### WS-6 — Reconcile client/server billing and marketing/data-rights truth
- **Root cause:** G6, G7, G8. **Findings:** AUD-009, AUD-011, AUD-010, AUD-022,
  AUD-007, AUD-008, AUD-012, AUD-013.
- **Files:** `components/food-check-form.tsx:297` (make the client gate entitlement-
  aware — resolve session/entitlement before metering, never mark an authenticated
  Premium result `anonymousTaster=true`); `components/trial-wall.tsx` +
  `app/api/billing/handlers.ts:1574` (return authoritative eligibility before
  rendering; show the real immediate-charge date/amount to prior subscribers);
  `app/pantry/page.tsx:13` + `app/api/billing/handlers.ts:533` (resolve and render
  the configured Pantry price server-side; fail closed without a verified amount);
  `app/api/check/photo-draft/route.ts:92-118` (fail closed on entitlement-read
  error with a neutral retry and zero vision spend — share one gate with the text
  route); `app/page.tsx:270` (replace the weekly-score promise with the actual non-
  scored recap); `app/page.tsx:221` + `components/demo-check-card.tsx` (label the
  demo an illustration until an authorized live capture exists, then set
  `lastLiveCaptureAt`); `app/api/account/export/route.ts` (include checks + meal
  memories or return one complete file with a documented exclusion schedule);
  `app/(app)/account/page.tsx:703` + `app/(app)/account/delete/page.tsx:20-32`
  (qualify "one file" and the deletion copy with the Play-cancellation and retained-
  log boundaries).
- **Approach:** In every case, make the server the single authority and the copy
  match it.
- **Dependencies:** none hard; AUD-007 gates Journey activation (WS-5).
- **Effort:** L (breadth).
- **Regression test:** signed-in Premium Playwright journey checks 1→11 in trial
  mode asserting no `/subscribe` redirect (AUD-009); prior-subscriber trial test
  asserting UI disclosure == Stripe payload (AUD-011); a contract test binding
  rendered Pantry amount to the configured Price (AUD-010); photo route test with
  `getEntitlement` rejection asserting 503 + zero vision calls (AUD-022); a browser
  assertion tying landing progress copy to the rendered journey (AUD-007); export
  test seeding every user-owned table and asserting presence-or-documented-exclusion
  (AUD-012); Play-active deletion 409 UI test (AUD-013).
- **Verify:** `npm run e2e` includes the new Premium/trial/photo cases and they pass
  first-attempt; `npm test -- account-export account-delete pantry-checkout` green.

### WS-7 — Pantry paid-workflow atomicity + ops/hygiene cleanup
- **Root cause:** G10, G9. **Findings:** AUD-021 (narrowed), AUD-001, AUD-003,
  AUD-004, AUD-018, NEW-002.
- **Files:** `app/api/pantry/submit/route.ts` (idempotency key + lease + transaction
  around the photo/extract/item writes) and `app/api/pantry/confirm/route.ts:94-106`
  (wrap delete+reinsert in one transaction so a failure can't strand `processing`);
  `tests/evals/meal-photo-eval.test.ts:17` (require an explicit live opt-in flag,
  not ambient key+file); `.env.example`/`docs/ops/env-reference.md` (per-variable
  scope; correct the PAYWALL_MODE default to `trial`); `playwright.config.ts` +
  `tests/smoke/dashboard.spec.ts:9`/`legal-placeholders.spec.ts:27` (remove the
  `retries:2` overrides or report them explicitly); `docs/retention_flow.md:77`
  (strip trailing whitespace); ops runbook (document `Postgres-FOMu` as retired
  read-only or migrate its 7 inbox rows — NEW-002, owner action OA-4).
- **Dependencies:** none. Lowest priority; can ship after launch since Pantry is a
  separately gated paid product.
- **Effort:** M.
- **Regression test:** concurrent `Promise.all` submit + fault-injection-after-each-
  write test asserting single extraction and recoverable state; a confirm fault-
  injection test asserting no `processing`-with-missing-items; a config test that a
  key+labels alone do not arm `eval:meal-photo`; a static env-contract test comparing
  referenced/documented/default names; a Playwright config test rejecting per-suite
  retry overrides.
- **Verify:** `git diff --check` → **exit 0**; `npm test -- pantry-submit pantry-
  confirm env-contract` green; `npm run eval:meal-photo` stays skipped without the
  new explicit flag.

### Final release gate (run from a clean worktree at the candidate SHA, disposable loopback Postgres, no inherited provider routes)

```
env -u REVORA_MODEL -u OPENAI_BASE_URL npm ci
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run lint
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run typecheck
env -u REVORA_MODEL -u OPENAI_BASE_URL npm test
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run contract
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run build
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run eval:revora
npm run e2e
npm audit --omit=dev
git diff --check
```

Pass criteria as observable output (not adjectives):
- `npm test` → `0 failed`, and the WS-0/1/3/4/5/6 regression tests are present in
  the run (grep the report for their file names).
- `npm run contract` → 9 gates green **and** the WS-1 negative treatment fixture is
  in the fixture set.
- `npm run eval:revora` → the two AUD-029 fixtures **fail on SAFE** (i.e. the gate
  now rejects them) — a green run must mean they were routed non-SAFE.
- `npm audit --omit=dev` → **exit 0** (GHSA-7rqj-j65f-68wh gone).
- `git diff --check` → **exit 0**.
- Live re-probe of `POST /api/check` `feeling shaky and clammy` on the candidate →
  clinical card with **no grams/timing**; missing-key harness matrix → clinical/
  out-of-scope/invalid cards with **zero** model-factory calls.

---

## Owner-action items (blocked on a human)

| ID | Action | Unlocks | Blocking? |
|---|---|---|---|
| OA-1 | Provision OpenRouter credential + spend budget + confirm data-retention posture | WS-2 provider switch and any live-model quality claim | Yes (decided architecture) |
| OA-2 | Authorize a privacy-safe, non-user immutable live-model corpus + budget | Re-baseline `eval:revora`/`eval:pantry-extract`/`eval:meal-photo` on OpenRouter; first honest meal-quality claim | Yes (before quality claims) |
| OA-3 | Rotate/invalidate outstanding sign-in `verification_tokens` at the WS-3 deploy | Completes AUD-024 remediation | Yes |
| OA-4 | Confirm the deployed `DATABASE_URL` binding and retire/migrate `Postgres-FOMu` | NEW-002 store consolidation; AUD-028 denominator reconciliation | No |
| OA-5 | Supply a private Blob token + sandbox Pantry fixtures | WS-7 provider-backed Pantry lifecycle proof (12 skipped E2E cases) | No (Pantry gated) |
| OA-6 | Licensed Play sandbox device | Play purchase/RTDN/restore lifecycle (F18/A014-A015 UNVERIFIED) | No (Play off) |
| OA-7 | Safe mailbox + authorization for one non-user email delivery | Real magic-link delivery/retry/suppression proof | No |
| OA-8 | Disposable production-like signed-in accounts or isolated staging | Cross-user object-level authorization in deployed composition | No |
| OA-9 | Stable independent host for a production browser crawl | Clean console/hydration evidence (audit host hit `ERR_NETWORK_CHANGED`) | No |
| OA-10 | Run the corrected preregistered paid concierge study | AUD-028 paid-retention evidence (D30+) | No (never a code gate) |

---

## Rollout and rollback

Flag/deploy order (each step verified before the next):
1. **WS-0 + WS-1 + WS-3 + WS-4** as one safety candidate → run the final gate → deploy
   → canary: re-probe `POST /api/check` `shaky/clammy` on production (expect clinical,
   no grams), confirm `/api/health` green, `npm audit` exit 0 on the deployed SHA.
   **Rollback:** revert the candidate PR; production returns to `24d88ec`
   (`vercel rollback` to `dpl_xSxcn7uzGoBF8XmSjD2bFS4VDtvm`).
2. **WS-2** OpenRouter switch → set `OPENAI_BASE_URL`/model env in **preview first**,
   run eval re-baseline, then production → canary: one synthetic non-user check
   confirms a real card via OpenRouter, latency/cost within the recorded budget.
   **Rollback:** unset the OpenRouter env → the transport falls back to direct
   OpenAI (kept as the escape hatch); no redeploy needed.
3. **WS-6** truth/billing reconciliation → deploy → canary: Premium 1→11 check
   journey passes on production-like account; landing copy matches journey.
   **Rollback:** revert PR.
4. **WS-5** activation → flip flags **server twin first, then client** for Memory,
   then Journey, one feature at a time, each behind the now-enforced twin guard →
   canary each: signed-in browser walk of the coordinated journey shows no broken/
   duplicate empty states. **Rollback:** the AUD-019 fix guarantees flag-off is
   quiet, so removing a flag is safe; remove client twin first, then server.
5. **WS-7** hygiene/Pantry → deploy anytime after step 1.

### Definition of done — "ready for end users" (flips NO-GO → GO)

Must be closed:
- [ ] AUD-015/023/031 — no clinical/result surface emits treatment/dose/timing or a
  personal-safety paraphrase; live re-probe clean; claims gate covers the classes.
- [ ] AUD-025 + NEW-003 — deterministic routing proven provider- and limiter-
  independent (spy call count 0; harness missing-key matrix returns clinical/out-of-
  scope/invalid).
- [ ] AUD-024 — `npm audit --omit=dev` exit 0; identifier canonicalization test green;
  tokens rotated (OA-3).
- [ ] AUD-029/030/014 — harmful-SAFE fixtures hard-fail on SAFE; pediatric routes
  out-of-scope with zero model calls; second model clarify suppressed.
- [ ] AUD-009/011/007/012/013 — user-visible billing/marketing/data-rights copy
  matches server truth (the currently-false-while-live rows).
- [ ] WS-2 — OpenRouter live end to end across check/photo/Pantry with eval re-
  baseline recorded; fallback policy documented.
- [ ] AUD-002 + WS-5 — twin guard rejects all four asymmetric pairs; features
  activated in order with the coordinated-journey walk clean.
- [ ] Final gate green with the exact observable criteria above.

May be consciously deferred with user-safe containment:
- Live-model meal-quality claim → **deferred** until OA-2 corpus runs; contained by
  labeling the demo an illustration (AUD-008) and making no quality claim.
- Photo/Pantry provider composition (12 skipped E2E) → **deferred**; contained by
  keeping Pantry gated and photo entitlement failing closed (AUD-022 fix).
- Play billing lifecycle → **deferred**; contained by `NEXT_PUBLIC_PLAY_BILLING` off.
- Real email delivery, cross-user production journeys, production browser crawl,
  full WCAG 2.2 AA, service-worker offline → **deferred** (OA-7/8/9); contained by
  server-side auth tests, unit SW inspection, and axe critical/serious scans.

### Honest residuals at launch

- **Live-model quality and real-user usefulness remain unproven** until OA-2; the
  product makes no quality claim and the demo is labeled illustrative.
- **Paid retention (AUD-028) is zero-days-measured** and cannot be closed by
  engineering; retention *claims* stay off, retention *features* ship as product
  capability without any retention assertion.
- **OpenRouter is newly introduced** (NEW-001); its reliability/latency/cost are
  observed only from the re-baseline, not from production traffic history — the
  direct-OpenAI fallback is retained as the containment.
- **Accessibility, service worker, Play, email delivery, cross-user production
  authorization** stay UNVERIFIED behind the owner actions above.
