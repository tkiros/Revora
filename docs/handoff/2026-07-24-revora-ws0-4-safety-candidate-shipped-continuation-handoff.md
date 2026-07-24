# Revora E2E readiness — WS-0…WS-4 shipped: session handoff + continuation master prompt

> **Session date:** 2026-07-24
> **Branch:** `fix/ws0-4-safety-candidate` (cut from `origin/main` @ `24d88ec` — the deployed production SHA; deliberately NOT from the `docs/b1-b2-final-closeout` docs branch)
> **Source plan:** `docs/handoff/2026-07-24-revora-e2e-readiness-implementation-plan.md` (the validated root-cause synthesis; read it first — this handoff assumes it)
> **State:** WS-0, WS-1, WS-2, WS-3, WS-4 implemented, tested, verified, committed locally. NOT pushed, no PR, not deployed. WS-5, WS-6, WS-7, rollout, and owner actions remain.

---

## 1. What was done this session (complete, verified, committed)

Six commits on `fix/ws0-4-safety-candidate` (41 files, +3491/−141):

| Commit | Workstream | Summary |
|---|---|---|
| `2ed5549` | **WS-0** | Deterministic routing made provider- and limiter-independent (AUD-025 P0, NEW-003) |
| `9943711` | **WS-1** | Safety-scope contradiction closed, claims gate widened (AUD-015 P0, AUD-023, AUD-031, AUD-016, AUD-017) |
| `d49b24a` | **WS-2** | OpenRouter production provider policy across all three transports (NEW-001) |
| `3e4bd43` | **WS-3** | Auth.js advisory patched + identifier canonicalization + schema fix (AUD-024 P0, AUD-006) |
| `72791d9` | **WS-4** | Engine edge holes closed: clarify cap, pediatric class, harmful-SAFE exemptions (AUD-014, AUD-029, AUD-030) |
| `0d63bde` | — | Final-gate cleanups (pediatric result-card eyebrow, lint directive, test env typing) |

### WS-0 — provider/limiter independence (AUD-025, NEW-003)
- `lib/revora/service.ts`: `checkFood` accepts `model: RevoraModelClient | (() => RevoraModelClient)`; the factory resolves only at the model-attempt step, inside the try (a throwing factory falls to the calm retry via `onModelError`). Every deterministic branch (invalid, clinical, out-of-scope, not_food, clarify) returns first.
- `app/api/check/route.ts:~326`: passes `model: () => modelFactory(undefined)` (lazy) instead of the eager `modelFactory(undefined)`.
- `proxy.ts`: the fail-closed check 503 (limiter unconfigured on a public deploy) now appends an urgent-care boundary line (`CHECK_UNAVAILABLE_COPY`). Abuse gate NOT weakened — copy only.
- Photo-draft route needed no change (its vision client was already constructed inside the request try).
- Tests: **new** `tests/unit/revora/route-provider-independence.test.ts` (zero factory calls across missing-key / invalid-key / unreachable-URL / OpenRouter-misconfig × clinical / out-of-scope / malformed, at service AND route layer); `tests/unit/proxy.test.ts` asserts the urgent-care line in the 503 body.

### WS-1 — safety copy + widened claims gate (AUD-015/023/031/016/017)
- `docs/safety/copy-ledger.md` row `clinical-possible-hypoglycemia`: 15g/15min first-aid instruction REPLACED with a treatment-free urgent-human-care route ("follow the low-blood-sugar plan from your care team … contact your doctor or local emergency number"). No food, dose, grams, timing. Notes record the AUD-015 rationale and forbid future ledger exceptions.
- `tests/fixtures/safety-contract.json` `qualitativeOnly.forbiddenPatterns`: +6 classes — exact carb grams, timed recheck instruction, first-aid treatment instruction, personal safety assurance ("safe for you", "won't spike you"), personal suitability ("fit your range", "work better for you"), individual outcome prediction ("bring your levels down", "lower your levels", "keep your blood sugar stable"). These run in production `assertNoForbiddenClaims` AND the contract validator scans every approved+active ledger row against them (the contract-consistency rule — a future exception fails the gate).
- `app/report/[id]/page.tsx`: "fit your range as they are" → "look like steady picks as they are"; "work better for you" → "easier to handle".
- `app/(app)/onboarding/page.tsx` + ledger row `onboarding-first-check` + `tests/smoke/onboarding.spec.ts`: "These three surprise almost everyone" → "Three everyday breakfast staples to start with".
- `lib/revora/safety-contract.ts`: `CONTRACT_VERSION = "2026-07-24.1"`.
- Tests: **new** `tests/unit/revora/clinical-copy-no-treatment.test.ts` (every clinical route copy checked against treatment/dose/timing families + the retired 15g/15min string must throw); `tests/unit/revora/forbidden-claims.test.ts` extended with all 5 AUD-031 paraphrases + 2 AUD-016 phrases + 3 treatment classes, each asserting fail-closed; `tests/unit/revora/privacy-minimal.test.ts` updated for the lazy model thunk.

### WS-2 — OpenRouter provider switch (NEW-001)
- **New** `lib/model-transport.ts` — single shared policy: `resolveTransportBaseUrl()` (production base URLs allowed ONLY for host allowlist `openrouter.ai`; HTTPS + no-credentials enforced everywhere; unset ⇒ direct OpenAI), `assertModelIdMatchesTransport()` (provider prefix required on OpenRouter, forbidden on direct OpenAI), `RevoraModelConfigurationError` (re-exported from openai-client for existing importers).
- `lib/revora/openai-client.ts`: `resolveModelTransportConfig` delegates to the shared policy (blanket production rejection REMOVED).
- `lib/meal/photo-extract.ts` + `lib/pantry/extract.ts`: both vision transports now pass the resolved `baseURL` into `new OpenAI(...)` and validate model-id/transport pairing before any paid call (they import the neutral module — the "no lib/revora imports" isolation holds).
- `docs/ops/env-reference.md`: rewritten `OPENAI_BASE_URL` row + new `REVORA_MODEL` / `REVORA_VISION_MODEL` rows (lockstep prefix rules, rollback = unset). **`.env.example` could NOT be edited (permission-blocked in this harness) — still needs the same three entries.**
- `scripts/e2e-runtime-env.ts`: blanks `REVORA_MODEL` + `REVORA_VISION_MODEL` (OPENAI_BASE_URL was already blanked).
- Fallback policy (stated, documented in commit): on OpenRouter failure → existing single-attempt → calm fail-closed retry; NO cross-provider auto-failover; direct OpenAI kept as escape hatch (unset env, drop prefixes, no redeploy).
- Tests: **new** `tests/unit/revora/openrouter-transport.test.ts` (allowlist, suffix-spoof host rejected, credentials/HTTPS guards, prefix rules, vision transports' constructed baseURL via openai-SDK constructor mock); the two `c004b08` pinned tests in `openai-client.test.ts` REWRITTEN (OpenRouter allowed in production under both VERCEL_ENV and NODE_ENV classification; other hosts rejected); `env.test.ts` health-config test rewritten likewise.

### WS-3 — auth patch + canonicalization + schema (AUD-024, AUD-006)
- `package.json`/lock: `next-auth@5.0.0-beta.32`, `@auth/core@0.41.3`, `@auth/drizzle-adapter@1.11.3`. **`npm audit --omit=dev` → exit 0** (GHSA-7rqj-j65f-68wh gone; the adapter bump was required — 1.11.2 still pinned @auth/core 0.41.2).
- **New** `lib/server/auth-identifier.ts` — `normalizeSigninIdentifier`: NFKC first, lowercase, trim, reject whitespace/control chars, require exactly one ASCII `@`, non-empty local part, dotted ASCII domain. Wired as `normalizeIdentifier` on the Resend provider in `auth.ts` (defense in depth beyond the upgrade).
- `lib/server/db/schema.ts`: `accounts.expires_at` `smallint` → `integer`.
- **New migration** `drizzle/0018_accounts-expires-at-integer.sql`: the ALTER + `DELETE FROM "verification_tokens"` (the mechanical half of OA-3 — outstanding sign-in tokens invalidated at the deploy that ships this).
- Tests: **new** `tests/unit/server/auth-identifier-normalization.test.ts` (homoglyph/fullwidth-@/double-@/control-char/Cyrillic corpus + pglite round-trip of a 10-digit epoch through the migrations).

### WS-4 — engine edge holes (AUD-014, AUD-029, AUD-030)
- AUD-014: `lib/revora/service.ts` `mapModelOutput` now receives `clarified`; a MODEL-authored `kind=clarify` on a clarified follow-up resolves to the calm retry (never a second question). First-question path unchanged.
- AUD-030: **new clinical route `pediatric`** — `lib/revora/clinical-risk.ts` `CLINICAL_ROUTES` (now 9) + child-context patterns (my/our N-year-old, N-year-old son/daughter/kid…, my kids/toddler/teenager, school lunch for…). Deliberately does NOT fire on "5 year old cheddar", "10 year old scotch", bare "my daughter". `lib/revora/safety-contract.ts` maps `clinical-pediatric`; new approved ledger row (adult-only scope, ask their pediatrician); `components/result-card.tsx` eyebrow added.
- AUD-029: exemption killed three ways — (1) `lib/revora/eval-rubric.ts` `scoreRun` checks harmful-SAFE BEFORE the knownGap skip; (2) `tests/evals/revora-safety-eval.test.ts` hard gate no longer excludes knownGap, `classifyOutcome` no longer downgrades to "known_gap", and a **new corpus guard** forbids `harmfulIfSafe && knownGap` coexisting; (3) the holes themselves closed in `lib/revora/input-precheck.ts` — `bbq sauce`/`barbecue sauce`/`bbq ribs` → `CARBS_ONLY_PATTERNS` (honey/agave/syrup condiment precedent), `curry` → `CARB_FORWARD_TOKENS` (congee precedent), singular `leftover` → `AMBIGUOUS_UNDERSPECIFIED`. Both fixtures updated (knownGap removed, notes rewritten); they now floor to MODERATE deterministically. `CARB_FORWARD_POLICY_VERSION = "2026-07-24.1"`.
- Tests: `service.test.ts` +2 (clarified suppression / unclarified passthrough), `clinical-risk.test.ts` pediatric corpus (8 positive, 5 negative, zero-model-call end-to-end), route-count pin 8→9, `check-persistence.test.ts` model-selection tests adapted to the lazy thunk (intent preserved).

### Verification evidence (all run this session, clean env `env -u REVORA_MODEL -u OPENAI_BASE_URL`)
- `npm test` → **182 files passed, 2090 tests, 0 failed** (all new regression files in the run)
- `npm run lint` → 0 errors; `npm run typecheck` → clean
- `npm run contract` → all 9 gates green (with the widened fixture + new pediatric ledger row)
- `npm run eval:revora` → green — meaning the two AUD-029 fixtures were routed non-SAFE under the now-unexempted hard gate
- `npm audit --omit=dev` → **exit 0**
- `npm run build` (clean env) → success; `VERCEL_ENV=production` + OpenRouter env (`OPENAI_BASE_URL=https://openrouter.ai/api/v1`, prefixed model ids, `REVORA_ALLOW_NO_MEASUREMENT=1`) → builds with **no config throw** (WS-2 verify)
- **Live V018/V017 replay:** booted the built server with `OPENAI_API_KEY` UNSET → "feeling shaky and clammy after lunch" returned `kind=clinical route=possible_hypoglycemia` with the NEW copy (no grams/timing); a1c 6.5 → `out_of_scope`; malformed body → invalid-request retry. Zero provider dependency on the deterministic paths, proven end to end.
- `git diff --check` on all committed work → clean. (The ONLY hit is the pre-existing **uncommitted** `docs/retention_flow.md:77` trailing whitespace in the working tree — AUD-001, WS-7 scope, deliberately untouched.)

### Working-tree state left behind (deliberate, not part of the branch)
- Modified but uncommitted (pre-existing from the docs branch): `docs/handoff/2026-07-21-c7-shipped-pr24-deploy-and-residuals-handoff.md`, `docs/retention_flow.md`.
- Untracked: the whole 2026-07-22/23/24 handoff corpus + `docs/prompts/`. Do not commit these onto the safety candidate; they belong to the docs branch.

---

## 2. What is NOT done — the exact path to true DONE

The definition of done is the checklist in the implementation plan ("Definition of done — flips NO-GO → GO"). Current status:

| Item | Status |
|---|---|
| AUD-015/023/031 code + copy | ✅ done on branch; ⬜ live re-probe on deployed candidate pending; ⬜ W-05 dietitian/CDCES sign-off pending (owner) |
| AUD-025 + NEW-003 | ✅ done on branch; ⬜ production canary pending |
| AUD-024 | ✅ audit exit 0 + normalizer + token-wipe migration; ⬜ migration must actually RUN against prod DB at deploy |
| AUD-029/030/014 | ✅ done on branch |
| AUD-009/011/007/012/013 (billing/marketing/data-rights truth) | ⬜ **WS-6 — not started** |
| WS-2 OpenRouter live end-to-end + eval re-baseline | ✅ code done; ⬜ blocked on OA-1/OA-2 (credential, budget, retention posture, re-baseline runs) |
| AUD-002 + WS-5 (config contract + activation) | ⬜ **WS-5 — not started** |
| Final gate green at candidate SHA | ✅ this session's gate green locally; ⬜ re-run after WS-5/6/7 land |

### Step-by-step next actions (in order)

**A. Ship the safety candidate (rollout step 1 from the plan)**
1. Push the branch: `git push -u origin fix/ws0-4-safety-candidate`.
2. Open a PR to `main` titled "Safety candidate: WS-0…WS-4 (AUD-015/024/025 P0s + engine edges + OpenRouter policy)". Body should cite the plan doc and this handoff. Wait for CI green (CI runs the same suite; no new env needed — transports default to direct OpenAI).
3. Merge, deploy to production (auto via Vercel on main).
4. **Run the production migration** (owner/operator — needs the migration URL): `REVORA_DB_ENV=production DATABASE_URL=<runtime> DATABASE_MIGRATION_URL=<owner> npm run db:migrate:production` → applies 0018 (expires_at widening + verification-token wipe = OA-3 complete).
5. Canary (plan step 1): `POST https://revora.plus/api/check` with `{"food":"feeling shaky and clammy after lunch","a1c":6}` → expect `kind=clinical`, copy with NO grams/timing; `/api/health` 200 healthy; `npm audit --omit=dev` exit 0 on the deployed SHA. Also probe `{"food":"mac and cheese for my 10 year old","a1c":6.2}` → expect `kind=clinical route=pediatric`.
6. **Rollback if needed:** revert the PR; production returns to `24d88ec` (`vercel rollback` to `dpl_xSxcn7uzGoBF8XmSjD2bFS4VDtvm`).

**B. WS-6 — client/server billing + marketing/data-rights truth (blocks GO; AUD-007 gates WS-5's Journey activation)**
Not started. Follow the plan's WS-6 section verbatim. Files: `components/food-check-form.tsx:297` (entitlement-aware client gate — never mark an authenticated Premium result `anonymousTaster=true`, AUD-009); `components/trial-wall.tsx` + `app/api/billing/handlers.ts:1574` (authoritative trial eligibility + real charge date/amount for prior subscribers, AUD-011); `app/pantry/page.tsx:13` + `handlers.ts:533` (server-resolved Pantry price, fail closed, AUD-010); `app/api/check/photo-draft/route.ts:92-118` (fail CLOSED on entitlement-read error — currently fail-open — zero vision spend, AUD-022); `app/page.tsx:270` (weekly-score promise → actual non-scored recap, AUD-007); `app/page.tsx:221` + `components/demo-check-card.tsx` (label demo an illustration, AUD-008); `app/api/account/export/route.ts` (include checks + meal memories or document exclusions, AUD-012); `app/(app)/account/page.tsx:703` + `account/delete/page.tsx:20-32` (qualify "one file"/deletion copy with Play-cancellation + retained-log boundaries, AUD-013). Each with the regression tests the plan names. Effort L (breadth).

**C. WS-5 — retention-feature config contract, then all-features-on activation (the owner's decision)**
Not started. Follow the plan's WS-5 section. Order matters: contract first, then activation. Files: `docs/ops/env-reference.md` (+ `.env.example` if permissions allow) — document all four `NEXT_PUBLIC_MEAL_MEMORY`/`MEAL_MEMORY_ENABLED`/`NEXT_PUBLIC_LEARNING_JOURNEY`/`LEARNING_JOURNEY_ENABLED`; `next.config.ts:38-45` — extend the production twin guard to BOTH new pairs (the V016-proven gap, AUD-002); `scripts/e2e-runtime-env.ts:81-96` — blank all four; `lib/server/nudge.ts:373,457-500` — durable pause/graduate stop-state across flag-off rollback (AUD-019; flip the `sent===1` assertion at nudge.test.ts:748-759 to `sent===0`); `app/api/journey/handlers.ts:286-301` — UNIQUE(user_id) start race → idempotent 409/success not 500 (AUD-020, true `Promise.all` test against Postgres); `.github/workflows/ci.yml` — production-mode config job exercising the twin guards (AUD-005). Then the coordinated all-on journey per the plan (single save affordance, one surface per fact, journey nudges authoritative). Verify: re-run V016 → all four pairs REJECTED in production mode. **Flag flips happen only after WS-6's AUD-007 fix is live** (landing must not advertise a score the journey doesn't render): server twin first, then client; Memory first, then Journey; canary a signed-in browser walk between each.

**D. WS-7 — Pantry atomicity + hygiene (can land after launch; Pantry stays gated)**
Not started. Plan's WS-7 section: pantry submit idempotency-key+lease+transaction; confirm route delete+reinsert in ONE transaction (`app/api/pantry/confirm/route.ts:94-106`, the narrowed AUD-021); `tests/evals/meal-photo-eval.test.ts:17` explicit live opt-in flag; env-doc scope pass + PAYWALL_MODE default correction; remove/report the Playwright `retries:2` overrides; `docs/retention_flow.md:77` trailing whitespace (AUD-001 — the one thing still failing `git diff --check` in the working tree); ops runbook for `Postgres-FOMu` (NEW-002/OA-4).

**E. Owner actions still open (engineering cannot close these)**
- **OA-1 (blocking WS-2 live):** provision OpenRouter credential + spend budget; confirm data-retention posture; update privacy copy if it differs from the current `store:false` direct-OpenAI statement. Then set in **preview first**: `OPENAI_BASE_URL=https://openrouter.ai/api/v1`, `REVORA_MODEL=openai/gpt-5.4-mini`, `REVORA_VISION_MODEL=openai/gpt-5.4-mini` (prefix rules enforced in code).
- **OA-2 (blocking any quality claim):** authorize the non-user live-model corpus + budget; re-baseline `eval:revora` / `eval:pantry-extract` / `eval:meal-photo` on OpenRouter; record cost/latency numbers. Only then production env flip. Rollback = unset the base URL (+ drop prefixes).
- **OA-3:** ✅ mechanically satisfied by migration 0018 — just ensure the production migration actually runs at the WS-3 deploy (step A4).
- **W-05:** dietitian/CDCES sign-off now additionally covers the revised `clinical-possible-hypoglycemia` copy, the new `clinical-pediatric` row, and the AUD-029 ontology additions (all marked PENDING RD/CDCES in-file).
- OA-4…OA-10: unchanged from the plan (non-blocking).

**F. Final release gate (run again from a clean worktree at the merged candidate SHA once WS-5/6 land)**
```
env -u REVORA_MODEL -u OPENAI_BASE_URL npm ci
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run lint
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run typecheck
env -u REVORA_MODEL -u OPENAI_BASE_URL npm test
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run contract
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run build
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run eval:revora
npm run e2e
npm audit --omit=dev        # must exit 0
git diff --check            # must exit 0 (after AUD-001 fix in WS-7)
```
Pass criteria are observable outputs, not adjectives — see the plan's "Final release gate" section. This session's run: everything above green except `npm run e2e` (not run — no local e2e env this session; CI covers it) and the retention_flow whitespace (WS-7).

---

## 3. Gotchas the next session should know

- **`.env.example` is permission-blocked** in this harness config; the WS-2/WS-5 env documentation went to `docs/ops/env-reference.md` only. If a future session can write it, mirror the three model-transport entries + four retention flags there.
- The **lazy model thunk** changed `checkFood`'s deps contract; three test files already adapted (`privacy-minimal`, `check-persistence`, plus new independence tests). Any NEW test asserting `modelFactory` calls at the route layer must invoke the thunk passed to `checkFoodImpl` first.
- Adding a qualitativeOnly pattern now gates **model output AND every approved+active ledger row** — check both for collisions before adding (this session verified: no active row matches the six new classes).
- Adding a clinical route requires, in lockstep: `CLINICAL_ROUTES` entry, patterns, `CLINICAL_COPY_IDS` mapping, an approved+active ledger row, a result-card eyebrow, the `probe` record in `clinical-risk.test.ts`, and the route-count pin (currently 9).
- `CONTRACT_VERSION` (2026-07-24.1) and `CARB_FORWARD_POLICY_VERSION` (2026-07-24.1) were both bumped — bump again on any further contract/ontology change.
- The eval corpus **forbids `harmfulIfSafe && knownGap`** — a new gap case must either be protected by the engine or not be marked harmful; there is no exemption class anymore.
- The `fix/ws0-4-safety-candidate` branch does NOT contain the uncommitted docs-branch material sitting in the working tree; keep them separate when committing.

## 4. Suggested kickoff prompt for the next session

> Read `docs/handoff/2026-07-24-revora-ws0-4-safety-candidate-shipped-continuation-handoff.md` and `docs/handoff/2026-07-24-revora-e2e-readiness-implementation-plan.md`. WS-0…WS-4 are committed on `fix/ws0-4-safety-candidate`. Continue the plan: (1) push the branch, open the PR, and take it through CI/merge/deploy + the step-1 canary and production migration; (2) implement WS-6 (billing/marketing/data-rights truth) with its regression tests; (3) implement WS-5 (retention config contract, then coordinated activation — flags flip only after AUD-007 is live); (4) WS-7 hygiene. Review, test, verify, and commit each workstream, then re-run the final release gate.
