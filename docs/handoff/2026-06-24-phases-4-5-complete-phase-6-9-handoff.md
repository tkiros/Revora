# Session Handoff — Revora Launch Hardening (Phases 0–5 complete; 6–9 open)

**Date:** 2026-06-24
**Branch:** `launch-hardening` (13 commits ahead of `main`, HEAD `d988de4`)
**Plan:** `docs/superpowers/plans/2026-06-21-revora-launch-hardening.md`
**Status:** Phases **0–5 engineering complete, tested, reviewed, committed**. NOT merged, NOT deployed. Phases 6–9 open, plus the Phase 0/2/3/4 ops·domain·legal gates.

---

## How to use this document

This is a resume prompt for a **new session**. Read the plan file above for full task detail. Carry the execution contract forward **verbatim**:

> For **each task**: 1) Implement → 2) Test & verify → 3) Run `/code-review` skill on the changes → 4) Fix all findings, re-review until clean → 5) Proceed. At the **end of each phase (tier)**: test, verify, `/code-review`, then commit. Do **not** use Superpower Code/Spec reviews — use `/code-review`. Run the check (`npm run typecheck` + `npm test`) once at the end of a task rather than a strict red/green TDD cycle. No task is committed until it passes both test verification and `/code-review`. Fix all review findings before moving on.

**Review pragmatics learned this session (apply going forward):** `/code-review` runs as a background **xhigh multi-agent workflow** (~25 min, 50+ agents, ~1M tokens). Run **one pass per tier**, scoped to the diff, and reserve it for tiers with real logic. For test-only / doc-only changes, a careful self-review is proportionate (ponytail). **Triage findings — do not apply verdicts blindly:** this session, two CONFIRMED findings were false positives (a "smoke test will fail" claim disproved by actually running the test; a "contrast 4.48:1" claim disproved by computing 7.57:1). Verify before fixing; fix real findings (the xhigh pass caught a genuine fail-closed 503 safety hole).

Owner legend: **eng** = codeable here · **ops** = external dashboard/infra · **domain** = clinical reviewer · **legal** = counsel.

---

## What was done

### Phases 0–3 (prior session) — see `docs/handoff/2026-06-24-launch-hardening-handoff.md`
- **Phase 0** (eng parts): `.env.example`, secrets section in `docs/ops/launch-controls.md`, branch created. Ops parts 0.1/0.2/0.3 still open.
- **Phase 1** (HARD BLOCKER B1 ✅): `lib/revora/rate-limit.ts` (per-IP + daily cap, fail-open on store error), telemetry `daily_cap` code, `middleware.ts` wiring that **fails CLOSED (503) on any public deploy when Upstash env is missing**.
- **Phase 2** ✅: `openai-client.ts` (`timeout: 10_000, maxRetries: 0`), `service.ts` `MAX_MODEL_ATTEMPTS = 1`, route `maxDuration = 15` (ops must verify vs Vercel plan).
- **Phase 3** ✅ (eng portion): eval-case gold-label schema fields (optional), `adversarial` category (8 cases), `lib/revora/eval-rubric.ts` + graded live eval (`npm run eval:revora:live`, SETUP_BLOCKs without `OPENAI_API_KEY`). Gold labels are a **domain** deliverable (3.1, still open).

### Phase 4 — Public legal surface ✅ (this session)
- **4.1** `feat(privacy)` `d367a49` — `app/privacy/page.tsx` (static, prerendered `○`): states meal text + A1C → OpenAI Responses API, `store:false`, no Revora retention, honest provider-abuse-log caveat. Disclaimer pulled from `loadSafetyContract().copy.disclaimer`. Linked from the home footer (`app/page.tsx`) and from **every** result's disclaimer area (`components/result-card.tsx`, both branches → all 5 kinds). Internal links use Next `<Link>`. CSS in `app/globals.css` (`.legal-card`/`.page-footer`/`.result-disclaimer-link`).
- **4.2** `test(phase-4)` `3ea57b5` — `tests/unit/revora/disclaimer-presence.test.ts`: locks `contract.copy.disclaimer` onto every response construction point (all `fallback.ts` builders + `postprocessModelOutput`); asserts all 5 kinds covered. Green with **no product change** — every builder already sets it.
- **4.3** (same commit) — `tests/unit/revora/claims-boundary-copy.test.ts`: scans user-facing copy (`app/page.tsx`, `app/privacy/page.tsx`, `components/*`, `lib/revora/fallback.ts`, `lib/client/ui-state.ts`, and user-facing `contract.copy.*` excluding the disclaimer and prompt-internal snippets) for banned families. **Stems catch inflections incl. `reversal`/`reversing`** (top-risk prediabetes term); per-family known-bad control fails loudly on any pattern typo.
- **4.4** (same commit, NON-CODE GATE) — `docs/legal/counsel-brief.md`: packages SaMD/FTC/disclaimer/parallel-launch questions + homework pointers for counsel. **OPEN, awaiting external opinion**; launch proceeds informational-only per stakeholder (B5).

### Phase 5 — UX states + accessibility ✅ (this session)
- **5.1** `feat(phase-5)` `d988de4` — `lib/client/check.ts` maps **HTTP 503 → the server's calm retry payload** (renders `ResultCard` kind `retry`) instead of a generic `server` error. **Hardened to fail closed after review** (real safety hole found): only a well-formed `kind:"retry"` body renders; a 503 carrying a risk result, non-JSON (CDN maintenance HTML), or a payload missing fields falls back to a new **`"paused"` failure code** (calm copy via `RequestStatus`) and **never leaks a classification or raw error**. `lib/client/ui-state.ts` gained the `paused` code + copy. New `tests/unit/client/check.test.ts` covers 200/429/500/503-valid + the 503 fail-closed branches. The `out_of_scope` "quirk" (server `message` → client `reason`) was verified **intentional** — left as-is.
- **5.2** (same commit) — `components/food-check-form.tsx` short-circuits to the network copy when `navigator.onLine === false`. Smoke test (`tests/smoke/mobile-check.spec.ts`) proves the **synchronous** guard runs before any `/api/check` fetch (`apiCalls === 0`).
- **5.3** (same commit) — added `@axe-core/playwright` (devDep). `tests/smoke/a11y.spec.ts` asserts **0 critical/serious WCAG A/AA** violations on home, `/privacy`, a result state, and the `RequestStatus` error/status surface. **Decision:** kept the `/privacy` link inside the `aria-live` result region (benign; the home footer is the stable non-live path). Did **not** add focus-to-result (aria-live already announces). Updated the maintenance-mode smoke (`tests/smoke/launch-controls.spec.ts`) to the new 503-as-retry UX + a food-leak assertion.

### Commits added this session (oldest → newest)
```
d367a49 feat(privacy): public /privacy page + footer/result links
3ea57b5 test(phase-4): disclaimer-presence + claims-boundary copy audits; counsel brief
d988de4 feat(phase-5): 503-as-retry, offline guard, a11y gate; fail-closed 503 hardening
```
Full branch (13 ahead of `main`): the 10 Phase 0–3 commits `90b4c2f … da9f39a`, then the 3 above.

### Verification (all green at handoff)
- `npm run typecheck` — clean
- `npm test` — **169/169** unit (`testTimeout: 20s` in `vitest.config.ts`)
- `npx playwright test tests/smoke/` — **38/38** smoke (incl. offline guard + axe a11y gate)
- `npm run build` — clean; `/privacy` prerenders as `○ (Static)`
- `npm run eval:revora` — 8/8 (mock routing); `npm run eval:revora:live` — SETUP_BLOCKs without a key (no spend)

### New dependencies introduced (all server/dev-only, none `NEXT_PUBLIC_`)
`@upstash/ratelimit`, `@upstash/redis` (Phase 1), `@axe-core/playwright` (Phase 5, devDep).

---

## 🚧 Blocking gates before ANY production deploy/merge

1. **Upstash env is the merge gate (highest priority, unchanged).** `middleware.ts` fails **closed (503)** on any public Vercel deploy (preview or production) when `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are absent. If `launch-hardening` merges and Vercel auto-deploys **before ops Task 0.3, every `/api/check` returns 503** in production. No test catches this (tests run `NODE_ENV=test`, the pass-through branch). **Do ops Task 0.3 first.**
2. **The app is not launch-ready** — Phases 6–9 (observability, PWA, QA, go-live, Play) are still open.
3. **Decision still standing:** keep work on `launch-hardening`; do NOT merge to `main` yet.

---

## Exact next actions to reach "true done"

### A. Ops / domain / legal gates — schedule in parallel (not code)
1. **0.1 (ops)** Hard monthly OpenAI spend cap + ~50% alert. Screenshot into `docs/ops/`.
2. **0.2 (ops)** Production domain → Vercel, auto-HTTPS. Verify `https://<domain>/api/health` → `{ ok: true, launch: "ready" }`.
3. **0.3 (ops)** Provision Upstash; set `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `REVORA_DAILY_CHECK_CAP=2000` in Vercel (Production + Preview, not client-exposed). **This unblocks the merge.**
4. **2.3 verify (ops)** Confirm Vercel plan max function duration ≥ 15s (Pro if Hobby caps lower).
5. **3.1 (domain)** Author `acceptableRisks` + `labelSource` per case in `tests/fixtures/revora-eval-cases.json`, derived from `docs/safety/a1c-band-rubric.md` + `evidence-pack.md`, second-reviewer signed off. Then run `OPENAI_API_KEY=… npm run eval:revora:live` and record the result in the go-live checklist.
6. **4.4 (legal)** Engage counsel using `docs/legal/counsel-brief.md`. Record the written opinion. Non-code; parallel.

### B. Phase 6 — Observability + incident response (eng/ops — START HERE for code work)
- **6.1** Error monitoring. **Recommended:** Sentry free tier (~10 lines: `sentry.server.config.ts`, `instrumentation.ts`, env `SENTRY_DSN`) capturing **server exceptions only**, with scrubbing so **no `food`/`a1c`/prompt/`output_text`** ever leaves the box. **Lazy minimum (if Sentry is declined):** document the Vercel-logs + `emitSafeEvent` + daily-check procedure. Verify: a forced server error appears with **no** raw user input.
- **6.2** Alerting on `check_failed` spikes + `reasonCode=daily_cap` (Sentry alert rule, Vercel log-drain query, or scheduled telemetry check). Verify: a simulated failure burst triggers a notification.
- **6.3** Extend `docs/ops/launch-controls.md` pause runbook (exact Edge Config steps, expected `/api/health` output, who to notify, harmful-guidance response). Optionally extend `app/api/health/route.ts` to report Upstash reachability. Verify: a **timed pause drill < 60s** following only the runbook; `/api/health` flips to `paused`.

### C. Phase 7 — Mobile PWA (eng)
- **7.1** `public/manifest.webmanifest` (name "Revora", `short_name`, `start_url:"/"`, `display:"standalone"`, `theme_color:"#0f172a"`, `background_color:"#f3f7fb"`) + **real PNG icons** `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`. Verify: DevTools → Application → Manifest shows no errors, install prompt available.
- **7.2** Manifest + theme/viewport metadata in `app/layout.tsx` (`metadata.manifest`, `appleWebApp`, `viewport.themeColor`/`width`/`initialScale`). Verify: `<link rel="manifest">` + theme-color in rendered `<head>`.
- **7.3** `public/sw.js` (precache `public/offline.html`; **network-first navigations** with offline fallback; **never cache `/api/check`** — GET-only fetch handler) + `public/offline.html` (calm, on-brand, includes the disclaimer) + `components/sw-register.tsx` (client, `navigator.serviceWorker.register("/sw.js")`), rendered from `app/layout.tsx`. Verify: install PWA, go offline, launch shows `offline.html`; `/api/check` never served from cache; Lighthouse PWA "installable" passes. (Plan code stubs are in the plan file §7.3.)

### D. Phase 8 — Full QA + go-live + rollback (eng/ops)
- **8.1** Cross-device QA matrix (real Android Chrome + iOS Safari + desktop): happy SAFE/MODERATE/HIGH, clarify, not-food, out-of-scope, invalid, slow (>5s), timeout, **offline, rate-limited (429), paused (503)**, install + offline launch. Run `npx playwright test` green. **Fold in the deferred 5.3 manual gates here** (see Known Issues): Lighthouse a11y ≥ 95, manual keyboard + VoiceOver/TalkBack, 200% zoom.
- **8.2** Release gates on the release commit: `npm run typecheck`, `npm test`, `npm run eval:revora`, and a recorded `npm run eval:revora:live` (needs domain 3.1) all green. Attach output to the release PR.
- **8.3** Go-live + rollback runbook in `docs/ops/launch-controls.md`: deploy with `launch_mode=normal`; smoke `/api/health`; controlled burst to confirm rate-limit + cap; **rehearse** Edge Config pause (< 60s) and Vercel instant rollback (< 5 min). Publish the link **only after both drills pass**.

### E. Phase 9 — GATED follow-up: Google Play (TWA)
Do **not** start until the PWA is live/stable and counsel (4.4) has weighed in. Mostly non-code.
- **9.1 (ops, non-code)** Play Console account ($25); **verify current Play requirements** (closed-testing cohort for personal accounts; D-U-N-S for org); health-app declarations + content rating.
- **9.2 (ops/legal, non-code)** Play **Data Safety form**: meal text + A1C → OpenAI third party, `store:false`, no Revora storage, provider abuse logs may exist — consistent with `/privacy` and `data-flow.md`.
- **9.3 (eng/ops)** Generate `.aab` + `assetlinks.json` (Bubblewrap/PWABuilder); **host `public/.well-known/assetlinks.json`** with the **Play App Signing** key SHA-256. Verify with Google's Statement List Tester; installed TWA launches **without** a URL bar.
- **9.4 (ops/design)** Store assets + listing copy **inside the claims boundary** (no reverse/cure); privacy URL = `/privacy`. Submit. Audit copy against `docs/safety/claims-boundary.md`.

---

## Known issues / notes for the next session

- **Phase 5.3 manual a11y gates are NOT done** — the automated axe gate (0 critical/serious) passes, but **Lighthouse a11y ≥ 95, manual screen-reader (VoiceOver/TalkBack), and 200%-zoom** require a real device/QA pass. They are folded into **Phase 8.1**. Do not record 5.3 as fully verified until those run.
- **Middleware pause disclaimer divergence (pre-existing, flagged):** middleware 503/429 responses carry the short `"Not medical advice."` (`DEFAULT_PAUSE_DISCLAIMER`) rather than the full contract disclaimer, because middleware runs on the **Edge runtime** and cannot `fs`-read the contract (`loadSafetyContract` uses `node:fs`). 5.1 made this user-visible (503 now renders the payload). Noted in `docs/legal/counsel-brief.md`. Do **not** rabbit-hole into build-time injection; it's a defensible tradeoff.
- **Pre-existing client/Zod schema duplication (deferred, out of scope):** `lib/client/check.ts` `normalizeResponse` + `lib/client/ui-state.ts` re-implement validation rather than importing `lib/revora/schemas.ts`. The client intentionally projects server payloads into a view-model (dropping unrendered fields) — no runtime bug, but a future cleanup candidate. The xhigh review flagged it; left as-is by design for a UX phase.
- **429/503 handling is asymmetric (benign):** 429 throws `rate_limited` (client copy) while 503 returns the server message. The middleware 429 and client copy are byte-identical, so zero user impact. Optional future unification.
- **`@axe-core/playwright` only runs in the Playwright suite**, not `npm test`. It's a smoke-suite gate.
- **Flaky cold-import test:** `tests/unit/revora/launch-controls.test.ts` health-route case can exceed the old 5s default on a loaded box; mitigated by `testTimeout: 20_000`. If it flakes, it's environmental — re-run isolated.
- **Pre-existing untracked files** in the working tree (`.vscode/`, `PRD/`, `agent/`, `docs/archive/…`, `next-env.d.ts`/`tsconfig.json` showing `M`) are **not** part of this work — leave them; stage only the files you change.
- **Privacy invariants (non-negotiable):** `store:false` on every model call; never log raw `food`/`a1c`/prompt/output; telemetry PII-free; no `NEXT_PUBLIC_` secret prefix; the OpenAI client throws client-side — keep that.

## First command for the resuming session
```bash
cd /home/tefera/Desktop/Revora && git checkout launch-hardening && git log --oneline main..HEAD && npm run typecheck && npm test && npx playwright test tests/smoke/
```
Then begin **Phase 6, Task 6.1** (error monitoring) following the per-task workflow above — or do the ops gates (esp. **0.3 Upstash**, the merge gate) in parallel first.
