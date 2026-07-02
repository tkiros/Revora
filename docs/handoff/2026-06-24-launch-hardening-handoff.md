# Session Handoff — Revora Launch Hardening (Phases 0–3 complete)

**Date:** 2026-06-24
**Branch:** `launch-hardening` (10 commits ahead of `main`, HEAD `da9f39a`)
**Plan:** `docs/superpowers/plans/2026-06-21-revora-launch-hardening.md`
**Status:** Phases 0–3 **engineering complete, tested, reviewed, committed**. NOT merged, NOT deployed. Phases 4–9 open.

---

## How to use this document

This is a resume prompt for a **new session**. Read the plan file above for full task detail. The execution contract from the original session (carry it forward verbatim):

> For **each task**: 1) Implement → 2) Test & verify → 3) Run `/code-review` skill on the changes → 4) Fix all findings, re-review until clean → 5) Proceed. At the **end of each phase (tier)**: test, verify, `/code-review`, then commit. Do **not** use Superpower Code/Spec reviews — use `/code-review`. One review pass per tier (not two finders). Run the check (`npm run typecheck` + `npm test`) once at the end of a task rather than a strict red/green TDD cycle. No task is committed until it passes both test verification and `/code-review`. Fix all review findings before moving on.

Owner legend: **eng** = codeable here · **ops** = external dashboard/infra (cannot be done from the repo) · **domain** = clinical reviewer · **legal** = counsel.

---

## What was done (Phases 0–3)

### Phase 0 — Pre-flight
- **0.4 ✅** `.env.example` (all server-only names, no `NEXT_PUBLIC_`) + "Secrets & Environment Variables" section in `docs/ops/launch-controls.md` (§7).
- **0.5 ✅** Branch `launch-hardening` created.
- **0.1 / 0.2 / 0.3 ⛔ ops** — OpenAI hard spend cap, production domain+HTTPS, Upstash provisioning + Vercel env vars. **Not done — external dashboards.** Flagged in the runbook.

### Phase 1 — Inbound abuse + cost controls (HARD BLOCKER B1) ✅
- **1.1** `lib/revora/rate-limit.ts` — `evaluateRateLimit` (pure: per-IP → daily cap; IP-blocked requests never bump the global counter; fail-OPEN on store error), `getClientIp`, `createRateLimitDeps` (Upstash sliding window 20/h + pipelined daily INCR/EXPIRE; null when env absent). Tests: `tests/unit/revora/rate-limit.test.ts`.
- **1.2** `lib/revora/telemetry.ts` — added `"daily_cap"` reason code. Test updated.
- **1.3** `middleware.ts` — order: pause gate → per-IP → daily cap. **Review fix applied:** fails CLOSED (503) on *any* public Vercel deploy (preview **or** production) when Upstash env is missing; only local dev/test skip limiting (`isPublicDeploy()`). Tests: `tests/unit/middleware.test.ts`.

### Phase 2 — Provider hardening ✅
- **2.1** `lib/revora/openai-client.ts` — SDK client built with `timeout: 10_000, maxRetries: 0`; injectable `openAiCtor` for testing.
- **2.2** `lib/revora/service.ts` — `MAX_MODEL_ATTEMPTS` 2 → 1 (one ~10s attempt stays under the client's 12s abort). Two existing service tests updated to single-attempt semantics.
- **2.3** `app/api/check/route.ts` — `export const maxDuration = 15`. ⚠️ **ops must verify** 15 is ≤ the active Vercel plan's function-duration limit and ≥ the 12s client abort (plan A1/B7).

### Phase 3 — Output quality gate (BLOCKER B3) ✅ (eng portion)
- **3.1 (schema only)** `tests/support/revora-test-model.ts` — added **optional** `acceptableRisks` + `labelSource` to the eval-case schema. **Clinical labels deliberately NOT authored** (domain deliverable; plan forbids eng-invented labels). The scorer measures risk-accuracy only over labeled cases, so the gate degrades gracefully until domain fills them.
- **3.2** `tests/fixtures/revora-eval-cases.json` — new `adversarial` category, 8 cases across all three guard paths: precheck→`not_food` (injection/exfiltration), `carbs_only` high-risk floor→HIGH (coax-sweet), and the raw model path (coax energy-drink/frappuccino) for live-model resistance. `adversarial` added to `REQUIRED_CATEGORIES`.
- **3.3** `lib/revora/eval-rubric.ts` — pure `scoreRun` (hard-fail harmful-SAFE; risk accuracy over labeled cases; usefulness = non-SAFE results carry actionable adjustment+swap; adversarial = no harmful-SAFE / no instruction leakage across **every** user-facing field). **Review fix:** leak scan now includes `not_food.message`. Wired into `tests/evals/revora-graded-eval.test.ts` + `scripts/run-graded-evals.mjs` (`npm run eval:revora:live`, SETUP_BLOCKs without `OPENAI_API_KEY` — no spend). Tests: `tests/unit/revora/eval-rubric.test.ts`, `tests/unit/revora/graded-eval-runner.test.ts`.

### Commits on `launch-hardening` (oldest → newest)
```
90b4c2f chore(phase-0): add .env.example + secrets runbook section, install upstash deps
808530e feat(rate-limit): per-IP + daily-cap decision module with fail-open
16a1708 feat(telemetry): add daily_cap reason code
1607452 feat(middleware): enforce per-IP + daily cost limits before model spend
055af61 feat(openai): bound client timeout to 10s, disable SDK retries
44f98be fix(service): single live model attempt to stay under client abort budget
bd76e2c feat(route): bound function maxDuration to 15s (ops must verify vs Vercel plan)
dff3eaa feat(eval): add adversarial category (8 cases) + optional gold-label schema fields
162f31a feat(eval): live graded quality gate (accuracy/usefulness/adversarial)
da9f39a test(config): raise testTimeout to 20s so bare `npm test` is reliably green
```

### Verification (all green at handoff)
- `npm run typecheck` — clean
- `npm test` — 133/133 (bare default; `testTimeout` raised to 20s in `vitest.config.ts`)
- `npm run eval:revora` — 8/8 (mock routing)
- `npm run eval:revora:live` — correctly SETUP_BLOCKs without a key (no spend)

---

## 🚧 Blocking gates before ANY production deploy/merge

1. **Upstash env is the merge gate (highest priority).** The middleware now fails **closed** on any public deploy when `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are absent. If `launch-hardening` merges to `main` and Vercel auto-deploys **before Task 0.3 is done, every `/api/check` returns 503** in production. No test catches this (tests run `NODE_ENV=test`, the pass-through branch). **Order: do ops Task 0.3 first.**
2. **The app is not launch-ready** — Phases 4–9 (privacy page, a11y, observability, PWA, QA, go-live) are still open on this branch.
3. **Decision already made this session:** keep work on `launch-hardening` (do NOT merge to `main` yet).

---

## Exact next actions to reach "true done"

### A. Ops/domain/legal gates to schedule in parallel (not code)
1. **0.1 (ops)** Set a **hard** monthly OpenAI spend cap + ~50% alert. Screenshot into `docs/ops/`.
2. **0.2 (ops)** Point production domain at Vercel, confirm auto-HTTPS. Verify `https://<domain>/api/health` → `{ ok: true, launch: "ready" }`.
3. **0.3 (ops)** Provision Upstash Redis; set `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `REVORA_DAILY_CHECK_CAP=2000` in Vercel (Production + Preview, not client-exposed). **This unblocks the merge.**
4. **2.3 verify (ops)** Confirm Vercel plan's max function duration ≥ 15s (upgrade to Pro if Hobby caps lower).
5. **3.1 (domain)** Author `acceptableRisks` + `labelSource` per case in `tests/fixtures/revora-eval-cases.json`, derived from `docs/safety/a1c-band-rubric.md` + `docs/safety/evidence-pack.md`, second-reviewer signed off. Then run `OPENAI_API_KEY=… npm run eval:revora:live` and record the result in the go-live checklist.
6. **4.4 / 9.1 / 9.2 (legal/ops)** Counsel engagement + (later) Play account/Data-Safety. Non-code; parallel.

### B. Phase 4 — Public legal surface (eng — START HERE for code work)
- **4.1** Create `app/privacy/page.tsx` from `docs/privacy/data-flow.md` (meal text + A1C → OpenAI Responses API, `store:false`, no Revora retention, provider-side abuse-log caveat). Link from `app/page.tsx` footer + each result's disclaimer area.
- **4.2** `tests/unit/revora/disclaimer-presence.test.ts` — assert every response kind (`result|clarify|not_food|out_of_scope|retry`) carries `loadSafetyContract().copy.disclaimer`. Fill any gap in `fallback.ts`/`postprocess.ts`.
- **4.3** `tests/unit/revora/claims-boundary-copy.test.ts` — scan all user-facing copy for banned families (`reverse|cure|treat|prevent|diagnose|FDA|guarantee|will (lower|prevent)`) from `docs/safety/claims-boundary.md`; fail on any match outside the disclaimer.

### C. Phase 5 — UX states + a11y (eng)
- **5.1** `lib/client/check.ts` — map HTTP **503** to the server-provided `retry` payload (calm pause copy) instead of the generic `server` error. Unit-test the 503 branch. *(Note: a pre-existing client quirk — `out_of_scope` normalizer reads `response.message` but assigns to `reason` — was spotted during review; verify/clean here.)*
- **5.2** `components/food-check-form.tsx` — short-circuit to `network` copy when `navigator.onLine === false`.
- **5.3** A11y audit + fixes: keyboard-only completion, focus-to-result, `aria-live`, label/`aria-describedby` wiring, risk-color contrast ≥ AA in `app/globals.css`, 200% zoom. Target: axe 0 critical/serious, Lighthouse a11y ≥ 95.

### D. Phase 6 — Observability + incident response (eng/ops)
- **6.1** Error monitoring (recommended Sentry free tier; scrub so no `food`/`a1c`/prompt/output leaves the box) OR document the logs-only minimum.
- **6.2** Alerting on `check_failed` spikes + `reasonCode=daily_cap`.
- **6.3** Extend `docs/ops/launch-controls.md` pause runbook; optionally add Upstash reachability to `app/api/health/route.ts`. Timed pause drill < 60s.

### E. Phase 7 — Mobile PWA (eng)
- **7.1** `public/manifest.webmanifest` + real PNG icons (192/512 + maskable).
- **7.2** Manifest + theme/viewport metadata in `app/layout.tsx`.
- **7.3** `public/sw.js` (precache offline page, network-first navigations, **never** cache `/api/check`) + `public/offline.html` + `components/sw-register.tsx`, rendered from `app/layout.tsx`.

### F. Phase 8 — QA + go-live + rollback (eng/ops)
- **8.1** Cross-device QA matrix + `npx playwright test` green.
- **8.2** Release gates: `npm run typecheck`, `npm test`, `npm run eval:revora`, recorded `npm run eval:revora:live` all green on the release commit.
- **8.3** Go-live + rollback runbook; rehearse Edge Config pause (< 60s) and Vercel rollback (< 5 min). Publish link last.

### G. Phase 9 — GATED follow-up: Google Play (TWA)
Do not start until PWA is live/stable and counsel (B5) has weighed in. Mostly non-code: Play account, Data Safety form, `public/.well-known/assetlinks.json` (Play App Signing SHA-256), store listing inside the claims boundary.

---

## Known issues / notes for the next session
- **Flaky cold-import test:** `tests/unit/revora/launch-controls.test.ts` health-route case can exceed the old 5s default on a loaded box; mitigated by `testTimeout: 20_000` in `vitest.config.ts`. If it still flakes, it's environmental (cold module import), not a logic regression — re-run isolated.
- **Pre-existing untracked files** in the working tree (`.vscode/`, `PRD/`, `agent/`, `docs/archive/…`, etc.) are not part of this work — leave them.
- **Do not** prefix any secret with `NEXT_PUBLIC_`. The OpenAI client already throws client-side — keep that.
- **Privacy invariant:** `store:false` on every model call; never log raw `food`/`a1c`/prompt/output; telemetry stays PII-free.

## First command for the resuming session
```bash
cd /home/tefera/Desktop/Revora && git checkout launch-hardening && git log --oneline main..HEAD && npm run typecheck && npm test
```
Then begin **Phase 4, Task 4.1** (privacy page) following the per-task workflow above.
