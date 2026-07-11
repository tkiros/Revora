# 04 — Executed Test Report (QA round 2026-07-10/11)

## 1. Executive recommendation

**CONDITIONAL GO.** No P0 found. Four P1s gate release: rotate two sets of exposed keys
(SEC-01/02), patch-upgrade Next.js (SEC-03), and fix the prompt/postprocess contract
mismatch that sends ~30–40% of model-reaching checks to the retry card (REL-02). Details
and owners: `03-release-scorecard.md`, `05-known-risks-and-blockers.md`.

## 2. What was executed (commands + environment)

Environment: local Linux dev box (Node + npm per lockfile), branch
`feat/video-engine-renderer`. Live model calls via OpenRouter with an authorized test key
read from env at invocation (never persisted to artifacts/logs).

| Command | Result |
|---|---|
| `npm run typecheck` (×2: baseline + after harness added) | PASS |
| `npm run test` (full vitest incl. mock safety evals) | **814 passed, 2 skipped, 0 failed** (107 files, 316s) |
| `npx playwright test` (2 dev servers, Pixel 5 + iPhone 12) | **105 passed, 1 failed, 24 flaky-passed-on-retry, 12 skipped** (12.8m) |
| `npm run eval:model-bakeoff:mock` | PASS (48 cases, harness validation) |
| `npm run eval:model-bakeoff:live` ×2 | Spend $0.046 total vs $1.00 caps; 0 harmful-SAFE |
| `npm audit` / `npm audit --omit=dev` | 7 vulns full / 2 prod (see SEC-03/05) |
| Secret-pattern scans (repo, client bundle `.next/static`, `public/`) | bundle clean; `openr.md` finding (SEC-01) |

Flaky note: 24 retry-passes are consistent with the config's documented
WebKit-under-parallel-load behavior, amplified because live model evals ran concurrently
on the same box. The 1 hard failure is deterministic (failed retry too).

## 3. Not executed and why

Live store billing (Stripe/Play devices), trial expiry over real time, screen readers,
Dynamic Type, load/failover testing, production-deploy security checks, live vision-photo
evals — all BLOCKED on environment/devices/labels; unblock steps in report 05.

## 4. Totals

- Automated tests: **919 passed** (814 unit + 105 E2E), 1 failed (P2 A11Y-01),
  14 skipped, 24 flaky-passed.
- Live model eval calls: 96 (2 runs × 2 models × 24 model-reaching cases), $0.046 total.

## 5–6. Findings (P0/P1/P2) and top risks

P0: none. P1: SEC-01, SEC-02, SEC-03, REL-02. P2: A11Y-01, SEC-04, SEC-05, PRIV-01,
REL-01, REL-03, QA-01, QA-02. Full table + evidence: reports 05/07/08/09.
Top risk overall: **REL-02** — users on real models frequently see "try again" because the
prompt never states the postprocessor's exact rules; deterministic fix already written up
in `docs/handoff/2026-07-09-openrouter-model-benchmark.md`.

## 7. E2E journeys verified (all on both mobile engines unless noted)

Onboarding walk (welcome→segment→A1C→expectations→guided first check); invalid + out-of-range
A1C boundaries (no verdict); check→result readability + single-screen flow; offline
short-circuit; friendly retry states; duplicate-submit protection; guest dashboard from
on-device history; new-visitor routing to onboarding; trial wall (value→start→checkout
POST) and taster metering; billing pages signed-out behavior; nudge opt-in suppression
for fresh users; voice input (speech→textarea→submit, announced listening state,
unsupported-browser fallback); pantry intake redirect; a11y (axe) on core surfaces.

## 8. Model bake-off

Winner: **`openai/gpt-5.4-mini` primary** (100% schema-valid, stronger guidance, ~$0.001/check),
`openai/gpt-5.4-nano` fallback-only (~95% schema-valid, cheaper/faster, weaker on unsafe
phrasing per prior benchmark). Both: zero safety failures. Limitations: 48-case corpus,
risk-accuracy labels sparse, test-box connection noise excluded. Full report: 06.

## 9. Required AI guardrails (all verified present; keep as blockers)

Zero-harmful-SAFE live gate; fail-closed retry on any model/schema failure; deterministic
precheck for non-food/injection; out-of-scope A1C routing before spend; server-added
disclaimer; entitlement + IP/global rate caps before spend; `store:false`; single paid
attempt. Add (recommended): connection-level-only retry + provider-blip telemetry (REL-01).

## 10–13. Domain findings

Security/privacy → report 07. Accessibility → report 08. Performance/cost → report 09.
Claims → report 10 (clean; one internal-wording flag for counsel).

## 14. Changes made this round (complete changelog)

| Change | File(s) |
|---|---|
| New model bake-off harness (dry-run/mock/live, budget rails, blind A/B artifacts) | `scripts/model-bakeoff.ts` |
| npm scripts `eval:model-bakeoff{,:mock,:live}` | `package.json` |
| Gitignore hardening (`artifacts/`, `openr.md`) | `.gitignore` |
| QA reports 00–10 + manifest (this doc set) | `docs/qa/*.md` |
| Generated artifacts (gitignored) | `artifacts/qa/2026-07-11T03-46-51-156Z/`, `…T03-51-41-256Z/` |

No app/product code, prompts, thresholds, or copy were modified. One environmental action:
a leftover `next dev` process (PID 3897999, ~1.3h old) was stopped to free the dev lock
for the E2E suite.

## 15. Remediation plan

**Immediate (before launch):** rotate keys (SEC-01/02); upgrade Next ≥16.2.10 + rerun
suites (SEC-03); implement REL-02 prompt/schema fix as reviewed safety patch; rerun
`eval:revora:live` + `eval:model-bakeoff:live`; manual store-billing + screen-reader
checklists; verify Vercel maxDuration plan limit (REL-03).
**Next release:** WebKit CTA fold fix (A11Y-01); CSP headers (SEC-04); connection-retry
decision (REL-01); CI workflow running typecheck+test+smoke (QA-01).
**Backlog:** data-export flow decision (PRIV-01); domain `acceptableRisks` labels to
activate the risk-accuracy gate; labeled photo eval corpus; zoom/reflow a11y spec; lint.

## 16. Decisions requiring human approval

| Decision | Approver |
|---|---|
| Proposed SLOs (report 09) and bake-off thresholds (report 06) | Product owner + eng owner |
| REL-02 prompt changes touching the safety engine | Clinical/dietitian + eng review |
| "Legal North Star" reversal wording stays internal-only | Legal + product |
| Data-export (CCPA) position | Privacy/legal |
| Ship-without-REL-02-fix tradeoff (quality, not safety) | Product owner |
