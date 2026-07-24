# Revora E2E readiness — ALL workstreams (WS-0…WS-7) shipped and deployed: session handoff + continuation master prompt

> **Session date:** 2026-07-24 (second session of the day; continues `2026-07-24-revora-ws0-4-safety-candidate-shipped-continuation-handoff.md`)
> **Production SHA:** `eb4eb63cb2ae53f4c26bbc1a088c031515268ed7` (main, deployed via Vercel, all canaries green)
> **Source plan:** `docs/handoff/2026-07-24-revora-e2e-readiness-implementation-plan.md` (read it first; this handoff assumes it)
> **State:** WS-0 through WS-7 are ALL implemented, tested, merged to main, and deployed. The final release gate is green at the deployed SHA. What remains is **owner actions only** (plus one env-file mirror and the flag-activation rollout).

---

## 1. What this session shipped (all merged + deployed)

Four PRs, in order, each CI-green (typecheck/lint/contract/build, unit+mock evals, full Playwright e2e, CodeQL, secret scan) before merge:

| PR | Branch | Merge SHA | Content |
|---|---|---|---|
| **#48** | `fix/ws0-4-safety-candidate` | `930b195` | WS-0…WS-4 (previous session's six commits: AUD-015/024/025 P0s, engine edges, OpenRouter policy) |
| **#50** | `fix/ws6-truth-reconciliation` | `75e3abd` | WS-6 — billing/marketing/data-rights truth (AUD-007/008/009/010/011/012/013/022) |
| **#51** | `fix/ws5-retention-contract` | (merged) | WS-5 — retention config contract (AUD-002/005/019/020) |
| **#52** | `fix/ws7-pantry-hygiene` | `eb4eb63` | WS-7 — Pantry atomicity + hygiene (AUD-021 narrowed, AUD-001/003/004/018, NEW-002) |

### WS-6 detail (PR #50)
- **AUD-022** — `/api/check/photo-draft` entitlement wall fails CLOSED (503 retry, zero vision spend) with the text route's split stances (session read still fails open to the guest path). Tests: entitlement-throw → 503 + zero vision calls; session-throw → guest path.
- **AUD-009** — `GET /api/paywall` resolves `entitled` server-side (strict zod contract extended in `lib/client/paywall-config.ts`); `components/food-check-form.tsx` skips the device taster gate/meter and hides the free-checks counter for entitled sessions. `shouldGateSubmit(mode, status, entitled)`. Browser regression on the :3101 trial e2e server (spent store + entitled:true → `/api/check` reached, nothing metered).
- **AUD-011** — `/api/trial/start` answers a prior subscriber with `{ineligibleTrial, priceDisplay, cadence}` (no Stripe session, no magic link) unless resubmitted with `acknowledgeImmediate: true`; `components/trial-wall.tsx` renders the immediate-charge disclosure ("charged today", price-on-button) and requires the acknowledged resubmit. Acknowledgment never forfeits an eligible user's trial (pinned). Email change clears the disclosure.
- **AUD-010** — new `lib/server/pantry-price.ts`: resolves the configured Stripe Price (must be active + one-time + USD, else null; 5-min TTL cache incl. failures; `PANTRY_PRICE_STUB=1` test seam, never active in production — pinned). `/pantry` is `force-dynamic`, renders the resolved amount or a fail-closed unavailable state; landing dropped its hard-coded `$49`; `createPantryCheckoutSessionHandler` charges the same verified Price object. **Live production render now shows the Stripe-verified `$49` — the audit's "deployed binding unverified" caveat is retired.**
- **AUD-007** — landing + `/how-it-works` describe the real non-scored weekly recap (plain sentences, no bands/percentages; internal BAI disclosed as never-shown). New claims-boundary family **`score-artifact`** (with KNOWN_BAD controls) blocks any "progress/weekly score" claim from returning while no score is rendered. **This unblocks Journey activation.**
- **AUD-008** — `demoExampleEyebrow(lastLiveCaptureAt)`: "An illustrated example" while null, "A real check, captured <date>" only once a capture exists; landing heading is now "This is the kind of answer you get". Evidence-state pinned by test.
- **AUD-012** — `/api/account/export` is ONE complete file: + identity, checks (via exported `toResponseCheck`), meal memories (via exported `mapMemoryRow`/`memorySelectColumns`), check feedback, subscriptions, learning journey, plus a documented `exclusions` schedule (sign-in artifacts, push endpoints, email logs, internal BAI, pantry photos/worksheets, provider-side billing). **Schema-derived denominator test**: any new user-scoped table fails the suite until inlined or excluded with a reason. Cross-user leakage asserted against a seeded second user.
- **AUD-013** — `/account/delete` + account page state the two real boundaries (Play subscription must be cancelled in Play first → handler 409s; a hashed deletion-log row + provider-side billing records remain) replacing "no retention window … immediate and complete". Smoke test asserts the boundaries render and the old absolute claim is gone.

### WS-5 detail (PR #51)
- **AUD-002** — `next.config.ts` production twin guard extended to `NEXT_PUBLIC_MEAL_MEMORY`/`MEAL_MEMORY_ENABLED` and `NEXT_PUBLIC_LEARNING_JOURNEY`/`LEARNING_JOURNEY_ENABLED` (the V016 gap). **V016 replay satisfied: all four client-on/server-off pairs REJECTED in production mode** — proven by `tests/unit/next-config-twin-guard.test.ts` (imports the real config) and the gate script.
- **AUD-005** — new CI step `npm run config:production-check` (`scripts/check-production-config.ts`): loads the real `next.config.ts` per-case in child processes with synthetic values; asserts every twin guard fires, every agreeing pair loads, all-off loads, and a non-guard load failure can never masquerade as a rejection. Wired into the `static` CI job.
- **AUD-019** — `lib/server/nudge.ts`: paused/graduated journey stop-state honored BEFORE the flag gate — a `LEARNING_JOURNEY_ENABLED` rollback can never silently resume reminders. `nudge.test.ts` flag-off tests flipped `sent===1` → `sent===0` (+ graduated case + no-journey generic path pinned).
- **AUD-020** — `app/api/journey/handlers.ts` start uses `onConflictDoNothing` on UNIQUE(user_id) → raced double-start = one 200 + one 409 (never 500). True `Promise.all` test against Postgres.
- `scripts/e2e-runtime-env.ts` blanks all four retention flags + the two previously-missed server twins. `docs/ops/env-reference.md` documents all four with the rollout order.

### WS-7 detail (PR #52)
- **Pantry submit** (`app/api/pantry/submit/route.ts`): CAS lease transition (claimed/submitted → extracting) — concurrent double-submit = one 200 + one 409 with zero duplicate vision spend; stale lease (updatedAt > 10 min) reclaimable with idempotent clean-slate restart (crash leftovers dropped); item insert + `awaiting_confirm` transition in ONE transaction. Fault-injection test proves a mid-flow crash leaves a RECOVERABLE order.
- **Pantry confirm** (`app/api/pantry/confirm/route.ts`): transition + draft delete + confirmed insert in ONE transaction — mid-confirm fault rolls everything back (order stays `awaiting_confirm`, drafts intact). Concurrent + fault-injection tests.
- **Hygiene**: `eval:meal-photo` arms only with explicit `EVAL_MEAL_PHOTO_LIVE=1` (npm script supplies it; pinned). Playwright per-suite `retries:2` overrides removed from `dashboard.spec`/`legal-placeholders.spec` + config test rejects future overrides (the whole e2e gate now runs retries:0 and passed clean). New **static env contract** (`tests/unit/env-contract.test.ts`): every runtime `process.env` reference documented in `docs/ops/env-reference.md` or reasoned-exempt; rows added for `ADMIN_EMAIL`, `PHOTO_INPUT_ENABLED`, `LONGITUDINAL_INSIGHTS_ENABLED`, `REVORA_ENFORCE_COMPONENT_MENTION`; **`PAYWALL_MODE` default corrected to `trial`** (code treats anything but exact `legacy` as trial — the old doc row was wrong). `docs/runbooks/database-governance.md` gains a "Store inventory" section documenting `Postgres-FOMu` as retired read-only pending OA-4. `docs/retention_flow.md:77` trailing whitespace fixed **in the working tree only** (the file rides the uncommitted docs-branch corpus — do not commit it onto a code branch).

## 2. Final release gate — GREEN at deployed SHA `eb4eb63`

All observable pass criteria from the plan's "Final release gate" met:

- `npm test` → **0 failed** (2112 tests on the WS-7 tree locally; 2121 incl. WS-6 suites; CI unit job green at the merge SHA). All WS-0…7 regression files present in the run.
- `npm run lint` / `npm run typecheck` → clean.
- `npm run contract` → **9 gates green** (incl. the WS-1 widened fixture and the new `score-artifact` family).
- `npm run config:production-check` → all 9 cases green (V016: four pairs rejected).
- `npm run build` (clean env) → success.
- `npm run eval:revora` → green — the two AUD-029 fixtures routed non-SAFE under the unexempted hard gate.
- `npm run e2e` → **green in CI at the merged SHA with retries:0 everywhere** (incl. the new AUD-009 entitled-session, AUD-013 delete-copy, and pantry-stub-price cases).
- `npm audit --omit=dev` → **exit 0**.
- `git diff --check` → **exit 0** (AUD-001 fixed).
- **Live production canaries at `eb4eb63`:** `/api/health` 200 healthy; `POST /api/check` "feeling shaky and clammy after lunch" → `clinical/possible_hypoglycemia` with the treatment-free copy (no grams/timing); "mac and cheese for my 10 year old" → `route=pediatric`; `/api/paywall` serves the new contract with `entitled:false` for guests; `/pantry` renders the Stripe-verified `$49, one payment`; landing has zero "actual answer"/"progress score" strings.

## 3. What is NOT done — the exact path to true DONE

Everything engineering could do alone is done. The remainder is owner/operator actions plus two small follow-ups.

### A. ⚠️ BLOCKING — run production migration 0018 (OA-3)
Migrations do NOT run at deploy (`build` is plain `next build`; only CI's e2e DB migrates). The WS-3 schema change and the verification-token wipe are **live in code but not yet applied to the production database**. The operator with the migration credential must run:

```
REVORA_DB_ENV=production DATABASE_URL=<runtime-url> DATABASE_MIGRATION_URL=<owner-url> npm run db:migrate:production
```

This applies `drizzle/0018_accounts-expires-at-integer.sql` (accounts.expires_at smallint→integer + `DELETE FROM verification_tokens` = OA-3 complete). Until it runs, outstanding pre-upgrade sign-in tokens remain valid. Verify afterwards: sign-in flow works; `SELECT count(*) FROM verification_tokens` → 0 at migration time. (Env files are permission-blocked in this Claude harness — a human must run this.)

### B. Owner actions (unchanged from the plan, statuses updated)
- **OA-1 (blocks the OpenRouter switch going live):** provision OpenRouter credential + spend budget; confirm data-retention posture; update privacy copy if it differs from the current `store:false` direct-OpenAI statement. Then in **preview first**: `OPENAI_BASE_URL=https://openrouter.ai/api/v1`, `REVORA_MODEL=openai/gpt-5.4-mini`, `REVORA_VISION_MODEL=openai/gpt-5.4-mini`. Code enforcement is already live (WS-2). Rollback = unset base URL + drop prefixes.
- **OA-2 (blocks any model-quality claim):** authorize the non-user live corpus + budget; re-baseline `eval:revora` / `eval:pantry-extract` / `eval:meal-photo` on OpenRouter (note: `eval:meal-photo` now additionally needs `EVAL_MEAL_PHOTO_LIVE=1` — the npm script supplies it); record cost/latency. Only then flip production env.
- **W-05:** dietitian/CDCES sign-off now covers: revised `clinical-possible-hypoglycemia` copy, the `clinical-pediatric` route/row, AUD-029 ontology additions (bbq/curry/leftover), and (new this session) the recap descriptions on landing//how-it-works. All marked PENDING RD/CDCES in-file.
- **OA-4 (non-blocking):** decide `Postgres-FOMu` — migrate its 7 billing-inbox rows or decommission. Now documented in `docs/runbooks/database-governance.md` §Store inventory.
- OA-5…OA-10: unchanged from the plan (non-blocking).

### C. Retention-feature activation (the WS-5 "all-features-on" flip — owner-coordinated env change, no code needed)
The contract is complete and the AUD-007 gate is now LIVE, so Journey is unblocked. Flip in Vercel env in this exact order, with a signed-in browser walk between each step:
1. `MEAL_MEMORY_ENABLED=1` (server twin) → verify `/api/memory` routes serve.
2. `NEXT_PUBLIC_MEAL_MEMORY=1` (client, needs redeploy/rebuild) → verify save affordance + /meals Saved section; twin guard will refuse the build if step 1 was skipped.
3. `LEARNING_JOURNEY_ENABLED=1` → verify `/api/journey` serves; journey nudges become authoritative (pause/graduate stop-state survives rollback — AUD-019).
4. `NEXT_PUBLIC_LEARNING_JOURNEY=1` (rebuild) → verify /journey surfaces.
Rollback at any step = unset the server twin (runtime kill switch, no rebuild).

### D. Small follow-ups (engineering, non-blocking)
- **`.env.example`** is permission-blocked in this harness. Mirror there when editable: `OPENAI_BASE_URL`, `REVORA_MODEL`, `REVORA_VISION_MODEL`, the four retention flags, `PANTRY_PRICE_STUB` (dev/test), `EVAL_MEAL_PHOTO_LIVE` (dev/test). `docs/ops/env-reference.md` is the current source of truth.
- **Docs corpus:** the whole 2026-07-22/23/24 handoff corpus (incl. this file) + `docs/prompts/` + the modified `docs/retention_flow.md` (whitespace fix) + `2026-07-21-c7…` sit uncommitted in the working tree. They belong on a docs branch/PR, never on a code branch.
- **Deferred (deliberate):** the AUD-009 e2e uses a stubbed `/api/paywall` (entitled:true) rather than a real seeded Premium session — a full magic-link + seeded-subscription Premium journey (checks 1→11 against the real server wall) remains a nice-to-have on top of the unit coverage of both halves. The plan's optional AUD-011 "UI disclosure == Stripe payload" e2e is likewise covered at the unit layer only.

## 4. Gotchas for the next session (additions to the previous handoff's list — those all still hold)

- `/api/paywall` now resolves session+entitlement per request; its client schema is `strictObject` — adding a field means updating `PaywallConfigSchema`, the route, and three test files together.
- `resolvePantryPrice` has a module-level 5-min TTL cache — tests must call `clearPantryPriceCache()`; the checkout stub needs `prices.retrieve`.
- The claims-boundary `score-artifact` family bans "progress/weekly score" on ALL user-facing copy — if a user-visible score ever ships again, delete the family in the same PR that renders it.
- The env contract test scans runtime code (`app/ lib/ middleware proxy auth next.config`) — any new `process.env.X` needs an env-reference row or a reasoned exemption in `tests/unit/env-contract.test.ts` (scripts/ is out of scope).
- The account-export denominator test derives user-scoped tables from the drizzle schema — a new table with `userId` fails the suite until mapped in its COVERAGE record.
- Playwright is retries:0 EVERYWHERE now (config test enforces it) — a flaky e2e shows as a real failure; fix the flake, don't re-add retries.
- Trial-start's first prior-subscriber response is the disclosure (no checkout); tests that expect a session on call one must send `acknowledgeImmediate: true`.
- Pantry submit/confirm route tests use the throwing-`now()` fault-injection pattern — `now()` call counts are load-bearing there.

## 5. Suggested kickoff prompt for the next session

> Read `docs/handoff/2026-07-24-revora-ws0-7-all-shipped-final-gate-green-handoff.md` and `docs/handoff/2026-07-24-revora-e2e-readiness-implementation-plan.md`. All workstreams WS-0…WS-7 are merged and deployed at `eb4eb63`; the final release gate is green. Remaining work, in order: (1) confirm the owner ran production migration 0018 (`npm run db:migrate:production` with the owner DATABASE_MIGRATION_URL) and verify sign-in + a zeroed verification_tokens count; (2) if OA-1 is cleared, set the OpenRouter env in PREVIEW (`OPENAI_BASE_URL=https://openrouter.ai/api/v1`, `REVORA_MODEL=openai/gpt-5.4-mini`, `REVORA_VISION_MODEL=openai/gpt-5.4-mini`), canary the preview, then under OA-2 re-baseline `eval:revora`/`eval:pantry-extract`/`eval:meal-photo` (needs `EVAL_MEAL_PHOTO_LIVE=1`) and record cost/latency before any production flip; (3) execute the retention-feature activation in the documented order (server twin → client, Memory → Journey) with a signed-in browser walk between steps; (4) mirror the env docs into `.env.example` if the harness permits, and raise the docs-branch PR for the uncommitted handoff corpus; (5) track W-05 (RD/CDCES sign-off) and OA-4 (Postgres-FOMu) to closure. Nothing else is open.
