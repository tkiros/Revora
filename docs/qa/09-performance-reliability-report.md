# 09 — Performance & Reliability Report (2026-07-10)

## Measured this round (EXECUTED)

**Live model latency** (OpenRouter, 2 bake-off runs, successful calls, ms):

| Model | p50 | p95 | p99 |
|---|---:|---:|---:|
| gpt-5.4-nano | 1660–1827 | 2325–2572 | 2439–2962 |
| gpt-5.4-mini | 1772–2038 | 3529–5075 | 4178–6177 |

Against the app's budget chain (10s SDK timeout → 12s client abort → 15s route
`maxDuration`): both models fit comfortably; mini's p99 tail (~6s) still leaves headroom.
Telemetry buckets (`<2s / 2–5s / 5–12s / >12s`) will place most checks in `<2s`–`2–5s`.

**Cost per successful analysis** (provider-reported): nano median ≈ $0.00028,
mini ≈ $0.00097. At mini pricing, 1,000 checks/day ≈ **$1/day** — cost is not a
constraint at MVP volume; safety/quality should dominate model choice.

**Suite timing**: full vitest 316s (814 tests), Playwright smoke 12.8m (both servers,
2 device profiles).

## Reliability behaviors verified (EXECUTED via unit suite + bake-off observation)

- **Fail-closed AI path**: provider error, invalid JSON, schema mismatch, and postprocess
  contract violations all return the calm-retry response, never a fabricated verdict —
  verified in unit tests (`service.test.ts`, `openai-client.test.ts`, `postprocess.test.ts`)
  AND observed live 26× across bake-off runs (every failure landed as `retry`).
- **Fault injection exists and passes** for: model timeout/error (mocked transport), rate
  limit 429 (`rate-limit.test.ts`, proxy 429 with Retry-After), kill-switch pause 503
  (`launch-controls.*`), DB failure during persistence (fail-soft: check still returned,
  `check-persistence.test.ts`), payment webhook errors (`billing-routes.test.ts`,
  `pantry-webhook.test.ts`), push send failure (`nudge.test.ts`).
- **Offline / duplicate-submit** (E2E, passed): offline submit short-circuits before any
  network call; double-tap yields one request (`mobile-check.spec.ts`); server-side
  `clientId` + `onConflictDoNothing` dedupes history entries.
- **Cost-abuse gates**: per-IP + global daily caps before model spend (`proxy.ts`),
  entitlement wall before model spend (`app/api/check/route.ts`), single model attempt,
  `maxRetries:0`.

## Findings

- **REL-01 (P1, environment-sensitive)**: The production client makes **one** attempt with
  `maxRetries:0`; any transient connection error becomes a user-facing retry card. In this
  test environment, first-calls-of-a-burst failed with `APIConnectionError` in both bake-off
  runs (4/48 and 12/48 live calls). The single-attempt design is a deliberate, documented
  cost/latency tradeoff — but there is **no telemetry distinction** between "provider down"
  and "connection blip" beyond `provider_error`, and no small connection-warmup retry.
  Recommendation: keep single *paid* attempt, but consider one fast retry on
  *connection-level* errors only (never on HTTP responses), and monitor
  `check_failed/provider_error` rate in production. PENDING ENGINEERING DECISION.
- **REL-02 (P1, product-quality)**: Postprocess contract failures send ~30–40% of
  model-reaching checks to the retry card (see bake-off report §"dominant finding").
  Deterministic prompt fix already specified; each failure is also a *paid* wasted call.
- **REL-03 (P2)**: `maxDuration=15` on `/api/check` carries a code comment requiring OPS
  to verify the Vercel plan limit — still unverified. MANUAL ACTION REQUIRED.

## Proposed SLOs (PENDING HUMAN APPROVAL — no SLOs exist today)

| Metric | Proposed target |
|---|---|
| Successful usable analysis rate (delivered ÷ model-reaching) | ≥ 95% |
| p95 end-to-end check time | ≤ 5s |
| `check_failed` provider_error rate | ≤ 2% daily |
| Harmful-SAFE events | 0 (hard) |
| Cost per completed check | ≤ $0.002 |
| Duplicate history entries | 0 (constraint-enforced) |

## Not executed

- Cold-start, battery/memory profiling, concurrent-scan load tests, queue backlog, DB
  failover drills: NOT EXECUTED — no production-like environment provisioned. Unblock: run
  k6/artillery against a preview deploy with Upstash + PG staging config.
