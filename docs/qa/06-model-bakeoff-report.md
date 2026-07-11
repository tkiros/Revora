# 06 — Model Bake-off: `openai/gpt-5.4-nano` vs `openai/gpt-5.4-mini` (OpenRouter)

Date: 2026-07-10/11 · Harness: `scripts/model-bakeoff.ts`
(`npm run eval:model-bakeoff[:mock|:live]`) · Status: **EXECUTED (live, 2 runs)**

## Setup and parity proof

- **Corpus (frozen)**: `tests/fixtures/revora-eval-cases.json`, version at commit of this
  branch — 48 cases across 9 required categories (clearly_safe, borderline, high_risk,
  non_food, ambiguous, carbs_only, out_of_range_a1c, prompt_injection, adversarial).
  24/48 cases short-circuit deterministically **before any model call** (precheck,
  A1C routing) — identically for both models, by construction.
- **Parity is structural, not procedural**: both models run through the production
  pipeline — `checkFood()` → `buildRevoraPrompt` (same instructions + safety contract) →
  Responses API with the same strict `json_schema`, `store:false`, no temperature, no
  reasoning-effort override → `RevoraModelOutputSchema` → `postprocess` floors →
  fail-closed retry. The only knobs that differ are the model IDs.
- **Documented deviation from production call** (applied to BOTH models):
  `max_output_tokens: 512` — without it OpenRouter rejects gpt-5.4-mini by pricing the
  worst-case output window (2026-07-09 benchmark finding, still unfixed in prod code).
- **Blind labels**: per-run A/B assignment randomized; mapping in `unblind.json`.
- **Budget rails**: $0.50 USD cap + 200k token cap per run; neither tripped.
  Actual spend: run 1 $0.0281 (30,513 tokens), run 2 $0.0180 (24,892 tokens).
- **Artifacts** (gitignored): `artifacts/qa/2026-07-11T03-46-51-156Z/` (run 1),
  `artifacts/qa/2026-07-11T03-51-41-256Z/` (run 2) — sanitized per-case JSONL, summary
  JSON, unblind mapping. No secrets or user data in artifacts.

## Environment caveat (read first)

Both runs hit bursts of `APIConnectionError` at the network layer (run 1: 4 calls; run 2:
12 calls), **always concentrated on whichever model ran first** — run 1 hit nano, run 2
hit mini. These are test-box network artifacts, **not model behavior**, and are excluded
from model-attributable quality metrics below. They do, however, expose a real product
sensitivity: the production client is single-attempt (`maxRetries:0`), so any transient
connection blip becomes a user-facing "retry" card (fail-closed — safe, but lossy). See
`09-performance-reliability-report.md`.

## Results (model-attributable, connection errors excluded)

| Metric | gpt-5.4-nano | gpt-5.4-mini |
|---|---|---|
| Model-reaching calls (2 runs) | 43 | 36 |
| **Harmful-SAFE (P0 gate)** | **0** | **0** |
| Disallowed-risk hits | 0 | 0 |
| Rubric (harmful-SAFE/usefulness/adversarial) | PASS | PASS |
| Schema-valid rate | ~95% (2 strict-schema rejects) | **100%** |
| Postprocess-contract failures (→ user sees retry) | 5/20, 9/23 per run | 9/24, 0/12 per run |
| Latency p50 / p95 (ms), successful calls | ~1660–1827 / 2325–2572 | ~1772–2038 / 3529–5075 |
| Median reported cost / call | ~$0.00028 | ~$0.00097 (≈3.5×) |
| Prior 5-case benchmark semantic quality (2026-07-09 handoff) | weaker: misclassified unsafe-phrasing food as `not_food` | strongest guidance + safest phrasing |

Adversarial behavior (both models, both runs): injection/exfiltration attempts were
stopped **deterministically before the model** (precheck → `not_food`); coax-to-SAFE
attempts that reached the model returned HIGH or failed closed. Zero instruction leaks
detected by the rubric's leak patterns.

## The dominant finding is not the model choice

**Both** models fail the local postprocess contract at high rates (SAFE answers not
opening with the permission-first phrases, multi-sentence reasons) because the prompt
never states those exact rules. Every such failure returns the calm-retry card to a real
user. Delivered-result rate on model-reaching cases was only ~58–70% for both models.
The exact fix (prompt additions + schema minLength + `max_output_tokens`) was already
specified in `docs/handoff/2026-07-09-openrouter-model-benchmark.md` §"Exact Engineering
Fix" and remains unimplemented. **P1 — this dwarfs the nano/mini delta.**

## Decision

Thresholds used (proposed conservative values — **PENDING HUMAN APPROVAL**):
safety-critical failures = 0 required; schema-valid ≥ 98%; delivered-rate regression vs
current prod not worse; then cost decides within a 5-point quality margin.

1. Safety gate: **both models pass** (0 harmful-SAFE, 0 adversarial failures, 0 dosing/
   diagnosis language observed in sampled outputs).
2. Schema validity: mini 100% ✔ / nano ~95% ✘ (below threshold — each miss is a wasted
   paid call and a user-facing retry).
3. Semantic quality (prior benchmark + sampled raw outputs this run): mini stronger,
   especially on unsafe-phrasing handling.

**Recommendation: CONDITIONAL GO — `openai/gpt-5.4-mini` as the primary check-route model**
(consistent with the current code default `gpt-5.4-mini`), with `openai/gpt-5.4-nano` as
an acceptable cheap fallback for provider-outage degradation only (its ~5% strict-schema
misses fail closed, never unsafely). Conditions:

- C1 (P1): implement the prompt/postprocess contract alignment + `max_output_tokens: 512`
  + schema `minLength` fixes from the 2026-07-09 handoff, then **rerun this bake-off**
  (`npm run eval:model-bakeoff:live`) and `npm run eval:revora:live` — treat as a
  safety-engine patch with review.
- C2: keep the zero-harmful-SAFE live gate as a release blocker.
- C3: sample-size caveat — 48-case corpus, 2 runs; risk-accuracy scoring is inactive until
  domain labels (`acceptableRisks`) are authored (rubric measured it as null). Do not read
  fine-grained quality deltas from this sample; the schema-reliability and safety gates are
  the statistically meaningful signals at this n.

## Repeat-run variability

Contract-failure counts swung between runs (mini: 9 → 0; nano: 5 → 9) — partly coverage
(connection errors landed on different cases), partly genuine output variance at default
sampling settings. Conclusion: contract compliance is **not stable run-to-run** for either
model until the prompt states the contract explicitly (C1).
