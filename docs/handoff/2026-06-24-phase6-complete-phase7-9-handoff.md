# Session Handoff — Revora Launch Hardening (Phases 0–6 complete; 7–9 open)

**Date:** 2026-06-24
**Branch:** `launch-hardening` (14 commits ahead of `main`, HEAD `142bdd0`)
**Plan:** `docs/superpowers/plans/2026-06-21-revora-launch-hardening.md`
**Status:** Phases **0–6 engineering complete, tested, reviewed, committed.** NOT merged, NOT deployed. Phases 7–9 open, plus the Phase 0/2/3/4/6 ops·domain·legal·deploy gates.

---

## How to use this document

This is a resume prompt for a **new session**. Read the plan file above for full task detail. Carry the execution contract forward **verbatim**:

> For **each task**: 1) Implement → 2) Test & verify → 3) Run `/code-review` on the changes → 4) Fix all findings, re-review until clean → 5) Proceed. At the **end of each phase (tier)**: test, verify, `/code-review`, then commit. Do **not** use Superpower Code/Spec reviews — use `/code-review`. Run the check (`npm run typecheck` + `npm test`) once at the end of a task rather than a strict red/green TDD cycle. No task is committed until it passes both test verification and `/code-review`. Fix all review findings before moving on.

**Review pragmatics (apply going forward).** `/code-review` (high or `ultra`) runs as a background multi-agent workflow (~15–25 min, 30–50+ agents, ~800k–1M tokens). Run **one pass per tier**, scoped to the diff, reserved for tiers with real logic. For test-only / doc-only changes a careful self-review is proportionate (ponytail). **Triage findings — do not apply verdicts blindly.** This session the high pass produced 9 reported / 10 refuted; two CONFIRMED findings were genuine safety holes (fixed) and several CONFIRMED ones were pre-existing or cleanup-only (deferred with rationale). Verify before fixing; a second full pass after small surgical fixes is disproportionate — a final `advisor()` pass + re-run of the gate is enough.

Owner legend: **eng** = codeable here · **ops** = external dashboard/infra · **domain** = clinical reviewer · **legal** = counsel.

---

## What was done

### Phases 0–3 (earlier sessions) — see `docs/handoff/2026-06-24-launch-hardening-handoff.md`
- **Phase 0** (eng parts): `.env.example`, secrets section in `docs/ops/launch-controls.md`, branch created. Ops parts 0.1/0.2/0.3 still open.
- **Phase 1** (HARD BLOCKER B1 ✅): `lib/revora/rate-limit.ts` (per-IP + daily cap, fail-open on store error), telemetry `daily_cap` code, `middleware.ts` wiring that **fails CLOSED (503) on any public deploy when Upstash env is missing**.
- **Phase 2** ✅: `openai-client.ts` (`timeout: 10_000, maxRetries: 0`), `service.ts` `MAX_MODEL_ATTEMPTS = 1`, route `maxDuration = 15` (ops must verify vs Vercel plan).
- **Phase 3** ✅ (eng portion): eval-case gold-label schema fields (optional), `adversarial` category (8 cases), `lib/revora/eval-rubric.ts` + graded live eval. Gold labels are a **domain** deliverable (3.1, still open).

### Phases 4–5 (prior session) — see `docs/handoff/2026-06-24-phases-4-5-complete-phase-6-9-handoff.md`
- **Phase 4** ✅: public `/privacy` page (static), disclaimer-presence + claims-boundary copy audits, counsel brief (`docs/legal/counsel-brief.md`, **OPEN** — awaiting external opinion; launch proceeds informational-only per stakeholder B5).
- **Phase 5** ✅: HTTP 503 → calm retry payload (fail-closed `paused` branch), synchronous offline guard, `@axe-core/playwright` a11y gate (0 critical/serious WCAG A/AA). Manual a11y gates (Lighthouse ≥95, screen-reader, 200% zoom) **deferred into Phase 8.1**.

### Phase 6 — Observability + incident response ✅ (THIS session) — commit `142bdd0`
Per-task workflow followed end to end: implement → verify → workflow `/code-review` (high, 36 agents) → fix findings → re-verify → commit.

- **6.1 Server-only Sentry error capture.** Library **`@sentry/node`** (not `@sentry/nextjs`) — explicit-capture-only, no client/edge SDK to audit, no `next.config` change, server-only by construction.
  - `instrumentation.ts` (root): `register()` imports the Sentry config **only** when `process.env.NEXT_RUNTIME === "nodejs"` → never loads on the Edge middleware or browser. **Guarded** in try/catch so a Sentry init failure can never crash server bootstrap.
  - `sentry.server.config.ts` (root): `Sentry.init` with **`defaultIntegrations: false`** (allowlist — the dangerous integrations LocalVariables/RequestData/Console/Http **never load**), only `dedupe` + `linkedErrors` added back, `tracesSampleRate: 0`, `sendDefaultPii: false`, `beforeSend: scrubSentryEvent`.
  - `lib/revora/sentry-scrub.ts`: pure, unit-tested `scrubSentryEvent` — defense-in-depth that deletes `request` / `user` / `server_name` / `extra` / `contexts` / `message` / `breadcrumbs`, deletes every stack-frame `vars` (the `prompt` local = food + a1c), and redacts every exception `value` (a ZodError can echo `output_text`).
  - `lib/revora/sentry-capture.ts`: single capture seam `captureServerError(error, stage)` — **async, guarded (never throws/rejects), awaits `flush(1000)`**. Tags only (`stage` / `errorClass` / `httpStatus`) — PII-free by construction. Inert without `SENTRY_DSN`.
  - Capture sites: `lib/revora/service.ts` model catch (the **invisible** provider-error path — it returns retry, not `check_failed`) and `app/api/check/route.ts` route catch (schema/infra throws). Both `await captureServerError(...)`; all existing behavior (calm retry + safe telemetry) preserved.
- **6.2 Alerting** (mostly docs): `launch-controls.md` **§9 Observability & Alerting** — Sentry-vs-logs signal split (provider failures surface in **Sentry**, not the `check_failed` log stream, because `service.ts` swallows them; `daily_cap`/`rate_limited` are Edge-middleware **log** signals). Documented Sentry alert rule + Vercel log-drain query.
- **6.3 Incident runbook + readiness probe**: `launch-controls.md` **§10 Incident Response** (pause drill < 60s, `/api/health` state table, who-to-notify, harmful-guidance procedure). `app/api/health/route.ts` now reports `upstash: "configured" | "unconfigured"` via a **no-throw, no-alloc presence check** (`isRateLimitConfigured()` in `rate-limit.ts`) on **both** the `ok` and `missing_config` (503) paths — surfaces the merge-gate dependency.
- **Tests:** `tests/unit/revora/sentry-scrub.test.ts` (PII strip across **all** vectors incl. contexts/message/empty-string), `tests/unit/revora/sentry-capture.test.ts` (pins the "never throws" safety invariant via a mocked SDK that throws), + health-field assertions in `env.test.ts` / `launch-controls.test.ts`.

**Code-review outcome (9 reported / 10 refuted).** Fixed both CONFIRMED safety holes — (1) unguarded capture could break the calm-retry contract → the seam is now guarded + pinned by a test; (2) the health route 500'd on a malformed Upstash URL → replaced `createRateLimitDeps() !== null` with the no-throw `isRateLimitConfigured()`. Plus: instrumentation guard, `contexts`/`message`/empty-string scrub hardening, `delete event.message`, and `flush(1000)` (deliberately tuned vs the 10s timeout / 12s client abort / 15s `maxDuration` budget). **Deferred:** `detectEnvironment` triplication (`env.ts` private + the two route copies) — all three **predate** this diff; refactoring untouched code would bloat a focused observability commit. (Pre-existing; noted for a future DRY pass.)

### Commits added this session (oldest → newest)
```
142bdd0 feat(phase-6): server-only Sentry capture + incident runbook + health upstash probe
```
Full branch (14 ahead of `main`): the 13 Phase 0–5 commits `90b4c2f … d988de4`, then `142bdd0`.

### Verification at Phase 6 commit
- `npm run typecheck` — clean
- `npm test` — **177/177** unit (`testTimeout: 20s` in `vitest.config.ts`)
- `npm run build` — clean; `/privacy` prerenders `○`; **Sentry stays out of the Edge/Proxy bundle** (build would fail on Node APIs in edge if it leaked)
- **Smoke suite (`npx playwright test tests/smoke/`) NOT re-run this session** — Phase 6 is server-side only (no UI change). Confirm green before merge / as part of Phase 8.1.

### New dependencies (all server/dev-only, none `NEXT_PUBLIC_`)
`@upstash/ratelimit`, `@upstash/redis` (P1), `@axe-core/playwright` (P5, dev), **`@sentry/node` (P6, v10.60.0)**.

---

## 🚧 Blocking gates before ANY production deploy/merge

1. **Upstash env is the merge gate (highest priority, unchanged).** `middleware.ts` fails **closed (503)** on any public Vercel deploy (preview or production) when `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are absent. If `launch-hardening` merges and Vercel auto-deploys **before ops Task 0.3, every `/api/check` returns 503**. No test catches this (tests run `NODE_ENV=test`, the pass-through branch). **Do ops Task 0.3 first.** The new `/api/health` `upstash` field now makes this misconfiguration visible post-deploy.
2. **The app is not launch-ready** — Phases 7–9 (PWA, QA, go-live, Play) are still open.
3. **Decision still standing:** keep work on `launch-hardening`; do NOT merge to `main` yet.

---

## Exact next actions to reach "true done"

### A. Ops / domain / legal gates — schedule in parallel (not code)
1. **0.1 (ops)** Hard monthly OpenAI spend cap + ~50% alert. Screenshot into `docs/ops/`.
2. **0.2 (ops)** Production domain → Vercel, auto-HTTPS. Verify `https://<domain>/api/health` → `{ ok: true, launch: "ready", upstash: "configured" }`.
3. **0.3 (ops)** Provision Upstash; set `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `REVORA_DAILY_CHECK_CAP=2000` in Vercel (Production + Preview, not client-exposed). **This unblocks the merge.** Confirm `/api/health` flips `upstash` to `"configured"`.
4. **2.3 verify (ops)** Confirm Vercel plan max function duration ≥ 15s (Pro if Hobby caps lower).
5. **3.1 (domain)** Author `acceptableRisks` + `labelSource` per case in `tests/fixtures/revora-eval-cases.json`, derived from `docs/safety/a1c-band-rubric.md` + `evidence-pack.md`, second-reviewer signed off. Then run `OPENAI_API_KEY=… npm run eval:revora:live` and record the result in the go-live checklist.
6. **4.4 (legal)** Engage counsel using `docs/legal/counsel-brief.md`. Record the written opinion. Non-code; parallel.
7. **6.1 deploy-time gate (ops/eng) — NEW, owed from this session.** Set a throwaway `SENTRY_DSN` on a preview deploy, **force a provider error** (e.g. bad model id / revoked key) and a Zod model-output error, then inspect the actual Sentry event: confirm **zero** `food`/`a1c`/prompt/`output_text`/IP and that the event **lands** (the awaited `flush(1000)` should deliver it before the serverless freeze). This is the real acceptance gate for 6.1 beyond the unit test.
8. **6.2 alerting (ops) — NEW.** Create the Sentry alert rule (exception-volume spike, filter `stage:model`) and the Vercel log-drain alert (`reasonCode=daily_cap` + `check_failed` rate spike) per `launch-controls.md` §9.
9. **`.env.example` append (manual) — NEW.** Add `SENTRY_DSN=` to `.env.example`. The agent's file tools are **hard-denied** on env files (env-file guard), so this is a manual one-liner. `launch-controls.md` §7 already lists `SENTRY_DSN` authoritatively.

### B. Phase 7 — Mobile PWA (eng — START HERE for code work)
- **7.1** `public/manifest.webmanifest` (name "Revora", `short_name`, `start_url:"/"`, `display:"standalone"`, `theme_color:"#0f172a"`, `background_color:"#f3f7fb"`) + **real PNG icons** `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`. Verify: DevTools → Application → Manifest, no errors, install prompt available.
- **7.2** Manifest + theme/viewport metadata in `app/layout.tsx` (`metadata.manifest`, `appleWebApp`, `viewport.themeColor`/`width`/`initialScale`). Verify: `<link rel="manifest">` + theme-color in rendered `<head>`. (Code stub in plan §7.2.)
- **7.3** `public/sw.js` (precache `public/offline.html`; **network-first navigations** with offline fallback; **never cache `/api/check`** — GET-only fetch handler) + `public/offline.html` (calm, on-brand, includes the disclaimer) + `components/sw-register.tsx` (client, `navigator.serviceWorker.register("/sw.js")`), rendered from `app/layout.tsx`. Verify: install PWA → offline → launch shows `offline.html`; `/api/check` never from cache; Lighthouse PWA "installable" passes. (Code stubs in plan §7.3.)
- **Advisor note (in plan):** Chrome A2HS criteria have shifted manifest-centric — **verify current requirements**; the SW here is primarily offline UX, not the install gate.

### C. Phase 8 — Full QA + go-live + rollback (eng/ops)
- **8.1** Cross-device QA matrix (real Android Chrome + iOS Safari + desktop): happy SAFE/MODERATE/HIGH, clarify, not-food, out-of-scope, invalid, slow (>5s), timeout, **offline, rate-limited (429), paused (503)**, install + offline launch. Run `npx playwright test` green (incl. the smoke suite not re-run since Phase 5). **Fold in the deferred 5.3 manual gates:** Lighthouse a11y ≥ 95, manual keyboard + VoiceOver/TalkBack, 200% zoom.
- **8.2** Release gates on the release commit: `npm run typecheck`, `npm test`, `npm run eval:revora`, and a recorded `npm run eval:revora:live` (needs domain 3.1) all green. Attach output to the release PR.
- **8.3** Go-live + rollback runbook in `docs/ops/launch-controls.md`: deploy with `launch_mode=normal`; smoke `/api/health`; controlled burst to confirm rate-limit + cap; **rehearse** Edge Config pause (< 60s, runbook §10) and Vercel instant rollback (< 5 min, runbook §5). Publish the link **only after both drills pass**.

### D. Phase 9 — GATED follow-up: Google Play (TWA)
Do **not** start until the PWA is live/stable and counsel (4.4) has weighed in. Mostly non-code.
- **9.1 (ops, non-code)** Play Console account ($25); **verify current Play requirements** (closed-testing cohort for personal accounts; D-U-N-S for org); health-app declarations + content rating.
- **9.2 (ops/legal, non-code)** Play **Data Safety form**: meal text + A1C → OpenAI third party, `store:false`, no Revora storage, provider abuse logs may exist — consistent with `/privacy` and `data-flow.md`.
- **9.3 (eng/ops)** Generate `.aab` + `assetlinks.json` (Bubblewrap/PWABuilder); **host `public/.well-known/assetlinks.json`** with the **Play App Signing** key SHA-256. Verify with Google's Statement List Tester; installed TWA launches **without** a URL bar. (Asset links — not the SW — are what make a TWA "trusted".)
- **9.4 (ops/design)** Store assets + listing copy **inside the claims boundary** (no reverse/cure); privacy URL = `/privacy`. Submit. Audit copy against `docs/safety/claims-boundary.md`.

---

## Known issues / notes for the next session

- **Phase 6 `.env.example` append is a manual step** (above, A.9) — env-file permission guard blocks the agent from reading/editing `.env.example`. Not load-bearing (`SENTRY_DSN` is optional; the SDK is inert without it).
- **Phase 6 flush is server-only without the Next SDK's lifecycle wrapping.** `captureServerError` awaits `Sentry.flush(1000)` to deliver before a Vercel serverless freeze. The deploy-time gate (A.7) is the empirical confirmation that events actually land; if they don't, raise the flush ceiling, but it is already budget-bounded (10s + 1s < 12s abort).
- **`daily_cap` fires on the Edge middleware**, which is intentionally **not** Sentry-instrumented — so it is a **log** signal, not a Sentry event. The §9 alerting split reflects this; don't try to alert on `daily_cap` from Sentry.
- **Provider errors are invisible in `check_failed` telemetry** — `service.ts` swallows them and returns retry (`check_completed` + `responseKind:"retry"`). **Sentry** is the only place a provider outage surfaces. Keep this in mind for any future alerting.
- **`detectEnvironment` triplication (deferred, pre-existing):** `lib/revora/env.ts` (private), `app/api/health/route.ts`, and `app/api/check/route.ts` (`getEnvironment`) hold byte-identical VERCEL_ENV/NODE_ENV logic. A future DRY pass should export it from `env.ts` and import it in both routes. Out of Phase-6 scope (my diff added none of the three).
- **Phase 5.3 manual a11y gates are NOT done** — automated axe gate (0 critical/serious) passes; Lighthouse ≥ 95, screen-reader, 200% zoom are folded into Phase 8.1.
- **Middleware pause disclaimer divergence (pre-existing, flagged):** middleware 503/429 responses carry the short `"Not medical advice."` rather than the full contract disclaimer (Edge runtime can't `fs`-read the contract). Noted in `docs/legal/counsel-brief.md`; defensible tradeoff — do not rabbit-hole into build-time injection.
- **Pre-existing client/Zod schema duplication (deferred, out of scope):** `lib/client/check.ts` + `lib/client/ui-state.ts` re-implement validation rather than importing `lib/revora/schemas.ts`. Intentional view-model projection; no runtime bug.
- **`@axe-core/playwright` only runs in the Playwright suite**, not `npm test`.
- **Flaky cold-import test:** `tests/unit/revora/launch-controls.test.ts` health-route case can exceed the old 5s default on a loaded box; mitigated by `testTimeout: 20_000`. Re-run isolated if it flakes.
- **Pre-existing untracked / modified files** in the working tree (`.vscode/`, `PRD/`, `agent/`, `docs/archive/…`, and `M next-env.d.ts` / `M tsconfig.json`) are **not** part of this work — leave them; stage only the files you change.
- **Privacy invariants (non-negotiable):** `store:false` on every model call; never log raw `food`/`a1c`/prompt/output; telemetry PII-free; no `NEXT_PUBLIC_` secret prefix; the OpenAI client throws client-side; **and now — no raw food/a1c/prompt/output/IP may leave the box via a Sentry event** (allowlist init + `scrubSentryEvent`).

## First command for the resuming session
```bash
cd /home/tefera/Desktop/Revora && git checkout launch-hardening && git log --oneline main..HEAD && npm run typecheck && npm test && npx playwright test tests/smoke/
```
Then begin **Phase 7, Task 7.1** (PWA manifest + icons) following the per-task workflow above — or run the ops gates (esp. **0.3 Upstash**, the merge gate, and **6.1** the deploy-time PII proof) in parallel first.
