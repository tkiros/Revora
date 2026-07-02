# Revora — Production Implementation Plan (Full Build)

**Date:** 2026-07-01 · **Status:** EXECUTION-READY · **Branch base:** `launch-hardening` (commit `d4eb073`) → work on `feat/full-build`
**Supersedes for scope:** `docs/implementation-plan-to-play.md` (kill-gated, coach-first) and `docs/handoff/2026-06-30-execute-full-implementation-plan-handoff.md`. Their stack defaults, store/legal phases, and human-action inventory are absorbed below; their kill-gates and camera-fully-deferred posture are **not** carried forward.

> **For agentic workers:** execute phases top-to-bottom (Track A) with the parallel tracks (B: legal/store, C: human/admin) started immediately. Every phase lists exact files, "done when", env, tests-first, and the human-only actions it surfaces. Use TDD; keep vitest + Playwright + axe green at every commit; commit per task with conventional messages. Do not push to production, spend money, or submit to Play — those are human actions (§10).

---

## 1. Executive summary and target definition

**The product in two sentences.** Revora is the prediabetes-exclusive daily decision coach: at the moment of a meal it answers *"should I eat this, now?"* with one calm decision card — Clear / Be careful / Hold off, one qualitative reason, one adjustment, one safer swap, and a sequencing tip — never a calorie, never a number. Across days it remembers you: history, a streak, one gentle daily nudge, one rule-based insight from your own meals, and a compliant behavioral-adherence progress view — the relationship a one-shot tool and an $89 sensor can't be.

**The bar.** Fully-fledged, production-ready, on Google Play: real people rely on it and it is a real business — accounts, server history, billing with enforced entitlements, store listing, support, monitoring, incident response, and counsel-signed compliance.

**The scope decision (made by the owner; not re-litigated here).** Build and ship the **entire product now**. No feature is staged behind retention/adoption/willingness-to-pay gates; the former kill-gates are ordinary build milestones. *One-line consequence, stated once: this trades market validation for completeness and speed — the full paid backend and store release are built before any proof that users will pay; that is the owner's accepted risk.* Exactly **one feature is deferred: Photo-assist (D5)** — fully specified in §6.3, explicitly **not built or launched** in this release. **CGM correlation is excluded** from launch scope entirely and specified as post-launch increment 1 (§13) — it is not an input method and not part of this build.

**What ships in this release:** Text input · Voice input · extended decision card (verdict + reason + adjustment + swap + sequencing tip + post-meal action) · onboarding · meal memory/history (server-backed) · daily loop + one push nudge · streaks + week view · rule-based insights · compliant progress/adherence view (BAI) · magic-link accounts · Neon Postgres with encrypted A1C · subscription billing end-to-end (Play Billing in the TWA + Stripe web fallback, server receipt verification, enforced free-vs-paid entitlement) · account + data deletion with a declared URL · production deploy on the real domain · PWA→TWA signed `.aab` · Play listing, Data Safety, health declarations, privacy/ToS/disclaimer · Sentry + privacy-safe analytics + monitoring + support + incident response.

---

## 2. Current-state baseline (verified 2026-07-01 against the working tree)

A **stateless, anonymous, text-in, single-shot food-risk checker** with a strong safety core. Nothing beyond this exists (grep-verified: no image/camera/vision code; no DB client; no auth library).

- **Stack:** Next.js 16.2.4, React 19.2.5, `openai` 6.36.0, `zod` 4.4.3, `@upstash/ratelimit` + `@upstash/redis` (rate-limit only), `@sentry/node` 10.60.0, `@vercel/edge-config`. Test tooling: `vitest` 4.1.5, `@playwright/test`, `@axe-core/playwright`. Scripts: `typecheck` / `build` / `test` / `test:revora` / `eval:revora` / `eval:revora:live`.
- **Flow:** `app/page.tsx` → `components/food-check-form.tsx` → `POST /api/check` (`app/api/check/route.ts`, `runtime="nodejs"`, `maxDuration=15`) → `lib/revora/service.ts:checkFood()` → one OpenAI Responses call (`store:false`) → one decision card.
- **Input contract** (`lib/revora/schemas.ts`): `CheckRequestSchema = { food: string ≤160, a1c: number 0–20 }.strict()`. **Response contract:** `RevoraUserResponseSchema` — discriminated union on `kind`: `result` (risk SAFE/MODERATE/HIGH + reason + adjustment + swap + disclaimer) | `clarify` | `not_food` | `out_of_scope` | `retry`.
- **Reuse unchanged — `lib/revora/` (16 modules):** `a1c.ts` (band routing), `input-precheck.ts`, `safety-contract.ts`, `prompt.ts`, `postprocess.ts` (conservative floors), `fallback.ts` (fail-closed), `sentry-scrub.ts`, `sentry-capture.ts`, `eval-rubric.ts`, `rate-limit.ts` (Upstash sliding window 20 req/hr), `launch-controls.ts`, `openai-client.ts`, `schemas.ts`, `service.ts`, `telemetry.ts`, `env.ts`. This is the one safety-hardened brain every input method feeds. Its floors: ambiguous → MODERATE minimum; upper-band + uncertain carbs → never SAFE; ≤1 clarifying question; carbs-only → add protein/veg; sugary drink/dessert → HIGH.
- **PWA:** `public/manifest.webmanifest` (standalone), `public/sw.js` (offline navigation fallback only — no push handler yet), `public/offline.html`, icons 192/512/maskable-512, `components/sw-register.tsx`.
- **Privacy (true today):** `app/privacy/page.tsx` — "no account, no database, no saved history." This promise changes at Phase 4B and **only** with the lockstep doc updates in the same PR.
- **Tests:** `tests/unit/revora/` (~21 files incl. `claims-boundary-copy.test.ts`, `disclaimer-presence.test.ts`, `privacy-minimal.test.ts`), `tests/evals/` (safety + graded), `tests/smoke/` Playwright (`a11y`, `launch-controls`, `mobile-check`, `pwa-assets`).
- **Play gap:** `public/.well-known/assetlinks.json` **missing** (template in `docs/ops/play-twa-runbook.md`); runbook blocked pending prod + counsel.
- **Working-tree note:** the coach-pivot doc set is uncommitted on `launch-hardening`, and `next-env.d.ts`/`tsconfig.json` carry local modifications — Phase 0 commits or reverts these to a clean baseline before branching.

---

## 3. Target architecture

### 3.1 The convergence principle (why more input methods ≠ more safety risk)

All three input methods produce the **same artifact — a user-owned text description + A1C** — and submit it to the **one safety-hardened engine** (`lib/revora/service.ts:checkFood()`), which is never bypassed and never modified. Text is typed; Voice is transcribed on-device/in-browser and reviewed by the user in the same textarea before submit; Photo-assist (deferred) drafts a description the user must confirm before submit. The verdict's provenance is always the user's own (typed, spoken-and-reviewed, or confirmed) words, so the engine's conservative floors, ≤1-clarify contract, claims boundary, and disclaimer govern every path identically. Adding an input method adds UI, not a second brain.

### 3.2 Component / data-flow diagram

```
                      INPUT METHODS (converge on one engine)
  ┌────────────┐   ┌─────────────────┐   ┌──────────────────────────────┐
  │ 1. TEXT    │   │ 2. VOICE        │   │ 3. PHOTO-ASSIST (D5)         │
  │ "Type your │   │ "Say your meal" │   │ "Snap → confirm → answer"    │
  │  meal."    │   │ Web Speech API  │   │ ██ DEFERRED — NOT BUILT ██   │
  └─────┬──────┘   │ → transcript in │   │ vision draft → user confirms │
        │          │   the textarea  │   │ → text description           │
        │          └────────┬────────┘   └──────────────┬───────────────┘
        │                   │ (user reviews/edits)      │ (future)
        ▼                   ▼                           ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │ components/food-check-form.tsx  →  POST /api/check                │
  │            { food: string ≤160, a1c: number }                     │
  └───────────────────────────────┬───────────────────────────────────┘
                                  ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │ lib/revora/ — THE ONE ENGINE (unchanged; regression-guarded)      │
  │ a1c routing → precheck → prompt → OpenAI (store:false) →          │
  │ postprocess floors → RevoraUserResponse (+ disclaimer)            │
  └──────────────┬────────────────────────────────────────────────────┘
                 ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │ lib/revora/coach-outputs.ts (NEW, rule-based, deterministic)      │
  │ derives sequencingTip + postMealAction from response kind + risk  │
  └──────────────┬────────────────────────────────────────────────────┘
                 ▼
        Decision card (verdict · reason · adjustment · swap ·
        sequencing tip · post-meal action · disclaimer)
                 │
                 ▼ (after result, signed-in + entitled)
  ┌──────────────────────────── STATEFUL LAYER (NEW) ─────────────────┐
  │ Auth.js v5 magic-link (Resend) ──► Neon Postgres (Drizzle)        │
  │   users/sessions · profiles(a1c encrypted) · checks(encrypted)    │
  │   push_subscriptions · subscriptions/entitlements · bai_weekly    │
  │ Guest mode: localStorage history (lib/client/history-store.ts);   │
  │   migrates to server on first sign-in                             │
  │ Coach compute: streak · week view · insights · BAI (cron)         │
  │ Nudge: web-push (VAPID) ◄── /api/cron/nudge (hourly)              │
  │ Billing: Play Billing (Digital Goods API in TWA) + Stripe web     │
  │   fallback ──► server receipt verification ──► entitlements       │
  └───────────────────────────────────────────────────────────────────┘
                 │
                 ▼
  Vercel production (real domain) ──► TWA signed .aab + assetlinks.json
                 ──► Google Play (health-app review) ──► real users
  Observability: Sentry (scrubbed) · Plausible (no PII) · /api/health
```

### 3.3 Database schema (Neon Postgres via Drizzle; migrations in `drizzle/`)

Column-level encryption (AES-256-GCM, `lib/server/crypto.ts`, key = `HEALTH_DATA_KEY`) for exact A1C and food text — the special-category/health-adjacent fields. Coarse, query-needed fields (risk class, A1C *band*, timestamps) stay plaintext so coach compute never needs decryption.

```sql
-- Auth.js standard tables via @auth/drizzle-adapter:
-- users(id, email, email_verified, created_at), accounts, sessions, verification_tokens

CREATE TABLE profiles (
  user_id      uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  a1c_ciphertext text NOT NULL,          -- AES-256-GCM(exact a1c)
  a1c_band     text NOT NULL,            -- 'prediabetes_57_59'|'prediabetes_60_62'|'prediabetes_63_64'
  timezone     text NOT NULL DEFAULT 'America/New_York',
  nudge_opt_in boolean NOT NULL DEFAULT false,
  nudge_hour   smallint NOT NULL DEFAULT 11,   -- local hour for the single daily nudge
  onboarded_at timestamptz,
  consented_at timestamptz NOT NULL             -- GDPR Art. 9 explicit health-data consent
);

CREATE TABLE checks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_ciphertext text NOT NULL,        -- AES-256-GCM(food description)
  risk          text NOT NULL CHECK (risk IN ('SAFE','MODERATE','HIGH')),
  response_kind text NOT NULL,          -- 'result' (only results are persisted)
  a1c_band      text NOT NULL,
  input_method  text NOT NULL DEFAULT 'text' CHECK (input_method IN ('text','voice','photo')),
  client_id     text,                   -- dedupe key for localStorage→server migration
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX checks_user_day ON checks (user_id, created_at DESC);
CREATE UNIQUE INDEX checks_migration_dedupe ON checks (user_id, client_id) WHERE client_id IS NOT NULL;

CREATE TABLE push_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint   text NOT NULL UNIQUE,
  p256dh     text NOT NULL,
  auth       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider           text NOT NULL CHECK (provider IN ('play','stripe')),
  provider_ref       text NOT NULL UNIQUE,  -- Play purchase token / Stripe subscription id
  product_id         text NOT NULL,         -- e.g. 'premium_monthly' | 'premium_annual'
  status             text NOT NULL,         -- 'active'|'canceled'|'grace'|'expired'|'refunded'
  current_period_end timestamptz NOT NULL,
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX subscriptions_user ON subscriptions (user_id, status);

CREATE TABLE bai_weekly (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start  date NOT NULL,               -- Monday, user-timezone week
  score       smallint NOT NULL,           -- 0–100
  adherence   smallint NOT NULL,           -- component: days with ≥1 pre-meal check /7
  consistency smallint NOT NULL,           -- component: checks/day vs target 3
  action      smallint NOT NULL,           -- component: post-meal actions acknowledged
  computed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, week_start)
);

CREATE TABLE deletion_log (                -- audit trail that retains no identity
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_hash text NOT NULL,              -- sha256(user_id)
  requested_at timestamptz NOT NULL,
  completed_at timestamptz NOT NULL
);
```

**Post-meal action acknowledgement** is one extra column on `checks`: `action_done_at timestamptz` (set when the user taps "did it" on the post-meal card) — feeds the BAI `action` component.

### 3.4 New dependencies (all pre-decided; deviations need an ADR in `docs/adr/`)

`drizzle-orm` + `drizzle-kit` + `@neondatabase/serverless` (DB) · `next-auth@5` + `@auth/drizzle-adapter` (auth) · `stripe` (web billing fallback) · `web-push` (VAPID nudge) · Play Developer API via plain `fetch` + RS256 JWT signed with `node:crypto` (no `googleapis` dependency). Plausible is a `<script>`, not a dependency. Nothing else.

### 3.5 Where D5 slots in later without rework

D5 adds exactly two components in front of the existing form: `POST /api/draft-meal` (photo → draft description JSON) and a confirm-chips UI that writes the confirmed text into the same `food` field, then submits the same `POST /api/check`. `checks.input_method='photo'` already exists in the schema. Nothing in the engine, history, coach, billing, or store layers changes. Full spec: §6.3.

---

## 4. Complete feature inventory (nothing here may be silently dropped)

| # | Feature | Status | Phase | Spec |
|---|---|---|---|---|
| **Input & decisioning** |||||
| F1 | Text input → engine → decision card | **SHIP** (exists; card extended) | 0, 1 | §6.1 |
| F2 | Voice input → transcription → same text path | **SHIP** (new) | 2 | §6.2 |
| F3 | Photo-assist, confirm-before-verdict (D5) | **DEFERRED — specified, not built** | — | §6.3 |
| F4 | Decision card: risk + one reason + one adjustment + one swap | **SHIP** (exists) | 0 | §6.1 |
| F5 | Food-sequencing coach (first-class output, PP-03) | **SHIP** (new) | 1 | §5 P1 |
| F6 | Post-meal actions (one calm next step, PP-06) | **SHIP** (new) | 1 | §5 P1 |
| **Coaching & relationship** |||||
| F7 | Onboarding (A1C entry, scoping, expectations, honest framing) | **SHIP** (new) | 3 | §5 P3 |
| F8 | Meal memory / history (server-backed, cross-device) | **SHIP** (new) | 3 (guest/local) + 4B (server) | §5 |
| F9 | Daily loop + one gentle push nudge | **SHIP** (new) | 3 (loop) + 5 (nudge) | §5 P5 |
| F10 | Streaks + simple week view | **SHIP** (new) | 3 (local) + 4C (server) | §5 |
| F11 | Rule-based insights (forward-permission framing) | **SHIP** (new) | 3 (local) + 4C (server) | §5 |
| F12 | Progress/adherence view — compliant BAI, never predicted A1C | **SHIP** (new) | 6 | §5 P6 |
| **Accounts, data, money** |||||
| F13 | Magic-link identity/auth | **SHIP** (new) | 4A | §5 |
| F14 | Neon Postgres + schema + migrations + backups; A1C encrypted/scrubbed | **SHIP** (new) | 4A/4B | §3.3 |
| F15 | Subscription billing end-to-end + enforced entitlement + paywall | **SHIP** (new) | 4D (+8 device QA) | §5 P4D |
| F16 | Account + data deletion with declared URL | **SHIP** (new) | 4E | §5 P4E |
| **Platform, store, ops, compliance** |||||
| F17 | Production deploy, real domain, env wired, maxDuration verified | **SHIP** | 7 | §5 P7 |
| F18 | PWA→TWA signed `.aab` + assetlinks + real-device QA | **SHIP** | 8 | §5 P8 |
| F19 | Play listing, Data Safety, health declarations, rating, privacy/ToS/disclaimer | **SHIP** | 9 + Track B | §7 |
| F20 | Sentry + PII scrub, privacy-safe analytics, monitoring, support, incident response | **SHIP** | 7, 10 | §9 |
| **Out of this release** |||||
| F21 | CGM correlation (premium) | **EXCLUDED — post-launch increment 1** (specified, not built; not an input method) | — | §13 |

F3 and F21 are distinct categories: **D5 is the single deferred input method** (roadmap, built in a later release once §6.3's gates pass); **CGM is excluded from launch scope** and planned as the first post-launch increment.

---

## 5. Dependency-ordered phases

**Ordering rule:** phases are sequenced by technical dependency only (identity before server history before billing before store submission; prod build before TWA before device QA before review). Where the old plan said "measure, then decide," this plan says "build, verify, move on."

```
TRACK A (code, sequential unless noted):
P0 baseline/regression ─► P1 card-v2 ─► P2 voice ─┐
                                        P3 onboarding+guest-coach ─► P4 backend push (4A→4B→4C→4D→4E)
                                                                      ─► P5 nudge ─► P6 progress
                                                                      ─► P7 prod hardening ▶ GATE 1
P7 ─► P8 TWA + device QA ─► P9 Play submission ─► P10 launch/support ▶ GATE 2
   (P2 ∥ P3 may run in parallel; P5/P6 depend on 4A–4C; P9 needs Track B complete)

TRACK B (legal/store, parallel, start day 1): counsel engagement · privacy/ToS drafts ·
   Data Safety + health declarations mapping · store listing copy · internal-doc corrections (§7.4 fixes)
TRACK C (human/admin, parallel, start day 1): accounts, secrets, domain, Play Console,
   keystore, device — the §10 inventory
```

---

### Phase 0 — Clean baseline, regression guard, ADRs

**Goal:** a provably-green starting point and a tripwire that proves `lib/revora/` behavior never changes during this build.
**Steps:**
1. Commit the uncommitted doc set on `launch-hardening`; revert or commit the stray `next-env.d.ts`/`tsconfig.json` modifications; branch `feat/full-build`.
2. Run all suites (`npm run typecheck && npm run test && npm run eval:revora` + Playwright smoke) — record green.
3. **Engine regression guard:** new `tests/unit/revora/engine-regression.test.ts` — a golden-fixture suite that drives `checkFood()` with a scripted `RevoraModelClient` across the floor scenarios (`ambiguous_food`, `carbs_only_meal`, `upper_band_borderline`, `sugary_drink_or_dessert`, `non_food_input`, out-of-scope both directions) and asserts the exact `RevoraUserResponse` for each. Any behavioral drift in `lib/revora/` fails CI.
4. **Consistency-check harness:** `scripts/consistency-check.mjs` — submits one identical meal description N=50 times against a target URL (`/api/check`), reports class distribution and flip rate (the validation doc measured ~15% instability on retests; the shipped engine must be *measured*). Run against preview in P7; record the number in `docs/ops/launch-controls.md`.
5. **ADRs** (one page each in `docs/adr/`): `billing.md` (Play Billing via Digital Goods API in the TWA + Stripe web fallback + server receipt verification + unified entitlement), `stack.md` (Neon+Drizzle, Auth.js v5+Resend, web-push, Plausible, AES-256-GCM via `node:crypto`), `launch-scope.md` (US-only launch, 18+ target audience, SKUs pending owner).
**Done when:** suites green on the new branch; regression test + consistency script committed; 3 ADRs committed.
**Env:** none new. **Tests:** the regression suite itself. **Human actions surfaced:** none.

### Phase 1 — Decision card v2: sequencing tip + post-meal action

**Goal:** make food sequencing (PP-03) and the post-meal action (PP-06) first-class card outputs **without touching engine behavior** — derived deterministically, not by new model behavior.
**Steps:**
1. New `lib/revora/coach-outputs.ts`:
   ```ts
   export type CoachOutputs = { sequencingTip: string | null; postMealAction: string | null };
   export function deriveCoachOutputs(response: RevoraUserResponse): CoachOutputs
   ```
   Rule-based from `kind`/`risk` with a fixed phrase bank (claims-audited): `result` + MODERATE/HIGH → one sequencing tip ("If practical, start with the vegetables or protein on your plate and save the carb-heavy part for last.") and one post-meal action ("A short 10–15 minute walk after this meal is a calm next step."). SAFE → both null (no piling on — tone policy). Non-`result` kinds → both null. Copy lives in the phrase bank and is covered by `claims-boundary-copy.test.ts`; the *evidence grounding* (Imai 2023, Shukla 2019, CDC DPP) is cited on the `/how-it-works` page (P6), never as numbers on the card.
2. `app/api/check/route.ts`: after `checkFood()` returns, wrap: `{ ...engineResponse, ...deriveCoachOutputs(engineResponse) }`. New `CheckApiResponseSchema` (in `lib/revora/coach-outputs.ts`) = engine union extended with the two nullable fields — the engine's own schemas stay untouched.
3. `components/result-card.tsx`: render the two new blocks ("Eat it in this order" / "After this meal") when present; disclaimer unchanged.
**Done when:** card shows sequencing + post-meal blocks for MODERATE/HIGH results and nothing extra for SAFE; engine-regression suite still green (proof the engine is unchanged).
**Env:** none. **Tests first:** `tests/unit/revora/coach-outputs.test.ts` (exhaustive over kinds × risks; copy passes the claims audit), extend `tests/unit/client/` result-card render tests, extend `claims-boundary-copy.test.ts` scope to the new phrase bank. **Human actions:** none.

### Phase 2 — Voice input ("Say your meal") — full spec in §6.2

**Goal:** speech becomes text in the same textarea; the user reviews, edits, submits — the identical text path and engine.
**Steps:**
1. New `lib/client/speech.ts`: feature detection (`window.SpeechRecognition || window.webkitSpeechRecognition`), a thin `startDictation({ onTranscript, onEnd, onError })` wrapper (`lang` from `navigator.language`, `interimResults: true`, single utterance).
2. New `components/voice-input-button.tsx`: mic button inside the food field (rendered only when supported); tap → listening state (aria-live announced) → transcript streams into the textarea via the existing `handleChange("food", …)`; tap again or silence ends dictation. Keyboard-dictation hint copy when unsupported (iOS Safari): "You can also use your keyboard's mic to dictate."
3. Wire into `components/food-check-form.tsx`; label the three input affordances per §6 ("Type your meal." / "Say your meal.").
4. Analytics event `check_input_method` (`text`|`voice`) — no transcript content ever.
**Done when:** on a supporting browser, a spoken meal lands in the textarea, is editable, and submits through the unchanged `/api/check`; unsupported browsers show the hint and lose nothing; axe passes on the listening state.
**Env:** none (browser API; audio is processed by the browser/OS speech service, never by Revora servers — noted in the privacy rewrite, P4B).
**Tests first:** `tests/unit/client/speech.test.ts` (detection + wrapper contract with a fake recognizer), Playwright `tests/smoke/voice-input.spec.ts` (inject a fake `SpeechRecognition`, assert transcript→textarea→submit; assert hidden-button fallback). **Human actions:** none.

### Phase 3 — Onboarding + the guest coach shell (on-device)

**Goal:** the daily-loop product surface, working for anonymous users with on-device state — so the coach exists before (and independent of) the backend, and the current privacy promise stays true until 4B.
**Steps:**
1. **History store:** new `lib/client/history-store.ts` — one interface, localStorage implementation now, server sync in 4B:
   ```ts
   export type StoredCheck = { clientId: string; food: string; risk: RevoraRisk; a1cBand: string;
     inputMethod: "text"|"voice"; createdAt: string; actionDoneAt?: string };
   export const historyStore: { add(c: StoredCheck): void; today(): StoredCheck[]; recent(days: number): StoredCheck[];
     streak(): number; markActionDone(clientId: string): void; all(): StoredCheck[]; clear(): void };
   ```
   `food-check-form.tsx` writes a `StoredCheck` after each successful `result`. `ponytail: localStorage now, server is the durable copy after 4B; the interface is the seam.`
2. **Onboarding:** new `app/onboarding/page.tsx` (4 client-side steps, state in localStorage): (1) welcome + honest framing — the North Star line verbatim: *"Reversal is achieved through your dietary choices — Revora gives you the clarity to make them."*; (2) A1C entry reusing the band routing semantics — out-of-range values get the approved boundary copy from `docs/safety/a1c-band-rubric.md`, never a verdict, and onboarding for them ends at boundary guidance; (3) expectation-setting ("qualitative guidance; we tell you when we're unsure; not medical advice" + disclaimer); (4) the daily loop intro + the three labeled input methods (photo shown as "coming later" only if the fake-door copy passes Track B counsel review — else omit). **No goal-setting, no target A1C, no predicted anything** (PRD Amendment 2/1 corrections honored).
3. **Home = daily loop:** extend `app/page.tsx`: today's checks, streak chip ("Day 3 of checking in"), the check form, insight slot. New `components/today-list.tsx`, `components/streak-chip.tsx`.
4. **Week view:** new `app/history/page.tsx` — 7-day list + simple week strip (days with checks), from `historyStore` (guest) — re-pointed at the server API in 4B.
5. **Insights:** new `lib/coach/insights.ts` — pure rules over `StoredCheck[]` (≥5 checks): most-frequent daypart for MODERATE/HIGH ("Most of your 'be careful' meals are breakfast — that's where one swap helps most this week."), repeat-meal recognition. **Forward-permission framing only; never backward-judgment** ("you failed" family is banned; add these to the banned-phrase test). Rendered in the home insight slot via `components/insight-card.tsx`.
6. **Post-meal action acknowledgment:** "I did it" tap on the post-meal block → `markActionDone` (feeds BAI later).
**Done when:** a brand-new anonymous user completes onboarding, runs checks by text or voice, sees today/streak/week/insight — all device-local; privacy page still literally true; axe green on all new pages.
**Env:** none. **Tests first:** `tests/unit/client/history-store.test.ts` (incl. streak edge cases: gap days, timezone), `tests/unit/coach/insights.test.ts` (rule table + banned-phrase audit on generated copy), Playwright `tests/smoke/onboarding.spec.ts` + `tests/smoke/daily-loop.spec.ts`, axe on `/onboarding` `/history`. **Human actions:** none.

### Phase 4 — The backend push (one coherent phase; sub-steps in strict order)

> Accounts + server history + coach compute + billing + deletion ship as **one push** — not four staged gates. Sub-order is dependency-driven. Everything runs against a dev/preview Neon branch and sandbox billing until P7.

#### 4A — Identity + database foundation
**Steps:** add deps (§3.4); `lib/server/db.ts` (Neon serverless driver + Drizzle); `drizzle/` migrations for §3.3 schema; `lib/server/crypto.ts`:
```ts
export function encryptField(plain: string): string   // AES-256-GCM, key=HEALTH_DATA_KEY (32B base64), iv||tag||ct base64
export function decryptField(cipher: string): string
```
`ponytail: env-key AES-GCM via node:crypto; upgrade path = KMS/managed keys if compliance posture demands.`
Auth.js v5: `auth.ts` (root config: Drizzle adapter, email provider via Resend, session strategy "database"), `app/api/auth/[...nextauth]/route.ts`, `middleware.ts` extension for signed-in detection (careful: keep existing launch-controls middleware behavior intact — compose, don't replace). Sign-in UI: `app/signin/page.tsx` (email → magic link; calm copy). `profiles` row created on first sign-in with **explicit GDPR Art. 9 consent checkbox** (wording from Track B counsel; blocking sign-up until checked) + A1C from onboarding (encrypted) + timezone from `Intl.DateTimeFormat().resolvedOptions().timeZone`.
**Done when:** magic-link round-trip works locally (Resend dev key) + sessions persist in Neon dev branch; migrations reproducible (`drizzle-kit`); consent stored with timestamp.
**Env:** `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `HEALTH_DATA_KEY`. **Tests first:** `tests/unit/server/crypto.test.ts` (round-trip, tamper fails), `tests/unit/server/db-schema.test.ts` (constraints: risk check, dedupe index), Playwright `tests/smoke/auth.spec.ts` (magic-link flow with a mailbox stub). **Human actions:** Neon project + branches; Resend account + domain DNS; generate & store `AUTH_SECRET`/`HEALTH_DATA_KEY`.

#### 4B — Server history + sync + privacy lockstep (⚠ the promise-change PR)
**Steps:** `POST` persistence inside `app/api/check/route.ts` (signed-in only: encrypt food, store risk/band/method; guests unchanged); `GET /api/history` (`app/api/history/route.ts`, paginated, decrypts food server-side for the owner only); `POST /api/history/migrate` (bulk import of localStorage `StoredCheck[]`, deduped on `client_id`) invoked once after first sign-in by `lib/client/history-store.ts` (which now becomes: server-backed when signed in, localStorage for guests, local cache for offline reads); extend `lib/revora/sentry-scrub.ts` + capture sites so `email`, `food_ciphertext`, decrypted food, and exact a1c can never reach Sentry (the existing scrubber already deletes request/user/extra/contexts — add a unit test asserting the new fields are covered by those deletions); extend the telemetry allowlist test to the new routes.
**Privacy lockstep — same PR, non-negotiable:** rewrite `app/privacy/page.tsx` (what's stored, encryption at rest, deletion rights + URL, provider caveat unchanged, voice = browser-processed); update `docs/privacy/data-flow.md` (new allowlist replacing the no-storage boundary, per its own amendment clause); update the Data Safety table in `docs/ops/play-twa-runbook.md` (collected AND stored: health info + food descriptions + email; encrypted in transit and at rest; deletion supported + URL); update `docs/legal/counsel-brief.md` (posture change + new questions, per Track B).
**Done when:** signed-in checks persist and render from the server across two browsers; guest flow untouched; migration idempotent; the four lockstep docs updated in the same PR; `privacy-minimal.test.ts` superseded by a new `privacy-stateful.test.ts` asserting the new allowlist (no raw food/a1c/prompt in logs/telemetry/Sentry).
**Env:** as 4A. **Tests first:** route tests for history/migrate (authz: no cross-user reads — assert 401/403), crypto-at-rest test (DB row never contains plaintext food/a1c), scrub extension test, Playwright cross-device history. **Human actions:** none new.

#### 4C — Coach compute, server-side
**Steps:** `GET /api/coach` (`app/api/coach/route.ts`) returning `{ streak, weekView, insight, latestBai }` computed by new `lib/coach/compute.ts` from `checks` (plaintext risk/band/timestamps only — no decryption needed); `insights.ts` rules reused verbatim (same module, fed server rows); home/history/progress pages read from `/api/coach` when signed in, `historyStore` when guest.
**Done when:** streak/week/insight identical for the same data whether guest or signed-in (shared rule modules, unit-tested for parity).
**Tests first:** `tests/unit/coach/compute.test.ts` (streak across timezones, week bucketing), parity test local-vs-server rules. **Human actions:** none.

#### 4D — Billing + entitlement + paywall
**Steps:**
1. `lib/server/entitlement.ts`: `getEntitlement(userId) → { tier: 'free'|'premium', source: 'play'|'stripe'|null }` (active subscription with `current_period_end > now()`, grace honored). `GET /api/entitlement` for the client.
2. **Free tier enforcement, server-side:** free/guest = **5 result-checks/day** (owner may re-price; default recorded in ADR): signed-in counted from `checks`, guests best-effort client-side + the existing Upstash IP limit as abuse backstop. Over limit → calm upsell copy, never a scary wall, and never at the first-session aha.
3. **Play Billing (primary, in-TWA):** `lib/client/digital-goods.ts` (feature-detect `window.getDigitalGoodsService('https://play.google.com/billing')`; list SKUs `premium_monthly`/`premium_annual`; purchase → `purchaseToken`); `POST /api/billing/play/verify` — verifies the token server-side against the Play Developer API (`purchases.subscriptionsv2.get`) using a Google service account (RS256 JWT via `node:crypto`, plain `fetch`; helper `lib/server/play-api.ts`), upserts `subscriptions`; `POST /api/billing/play/rtdn` — Pub/Sub push endpoint for renewals/cancellations/refunds (shared-token query-param auth), plus verify-on-read fallback when `current_period_end` is stale.
4. **Stripe web fallback (browser-PWA users):** `POST /api/billing/stripe/checkout` (Checkout Session, monthly/annual prices), `POST /api/billing/stripe/webhook` (subscription lifecycle → `subscriptions` upsert), Stripe Billing Portal link for cancel/manage. **Frictionless, visible cancellation** — `app/account/page.tsx` shows plan + a one-tap cancel/manage path (Play → Play subscriptions deep-link; Stripe → portal). The anti-Klinio stance is a feature.
5. **Paywall:** `app/subscribe/page.tsx` + `components/paywall-card.tsx` — soft, after value: "Keep your history and your daily coach." Premium = history beyond 7 days + insights + progress + nudges + unlimited checks; free keeps daily checks + today view. All copy through the claims audit; no outcome promises.
**Done when:** end-to-end in sandbox: subscribe → entitlement flips → renew/cancel/refund events update state → entitlement enforced on history/insight/progress/nudge routes; restore works (re-verify on sign-in); Stripe test-mode full lifecycle green. (Real-device Play purchase closes in P8.)
**Env:** `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (or split key/email vars), `PLAY_PACKAGE_NAME`, `RTDN_SHARED_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`/`_ANNUAL`, `NEXT_PUBLIC_APP_URL`. **Tests first:** entitlement unit matrix (statuses × periods), verify-route tests with recorded Play/Stripe fixtures, webhook signature tests, free-tier-limit route test, Playwright paywall flow (Stripe test mode). **Human actions:** Play Console subscription products + base plans + prices; Google Cloud service account + Play API access + RTDN topic; Stripe account + prices; **owner decision: final SKUs/prices** (default $12.99/mo · $99.99/yr; lifetime dropped at launch — one-time products complicate Play review; revisit post-launch).

#### 4E — Account + data deletion
**Steps:** `POST /api/account/delete` — cancels provider subscriptions best-effort, deletes the user row (cascades wipe profile/checks/subscriptions/push), writes `deletion_log` (hashed id), signs out; `app/account/page.tsx` "Delete account & data" with confirm step; **public deletion URL** `app/account/delete/page.tsx` (reachable signed-out; explains the flow and links sign-in → account) — this URL is declared in Play's Data-deletion field.
**Done when:** deletion removes every user-linked row (test proves zero residual rows), works from the public URL path, and the declared URL is live on the prod domain by P9.
**Tests first:** deletion cascade test, Playwright delete-flow. **Human actions:** none new.

### Phase 5 — The daily nudge (Web Push)

**Goal:** one gentle daily push — never guilt copy — opt-in, timezone-correct.
**Steps:** extend `public/sw.js` with `push` + `notificationclick` handlers (open `/`); `components/nudge-opt-in.tsx` (offered on the home loop after the user has ≥1 check on a prior day — not during onboarding; two-step permission pattern); `POST/DELETE /api/push/subscribe` storing `push_subscriptions`; time picker (default 11:30 local) on `app/account/page.tsx`; `GET /api/cron/nudge` (hourly Vercel cron, `Authorization: Bearer CRON_SECRET`) — selects opted-in premium users whose local `nudge_hour` matches and who have no check today, sends **one** notification via `web-push` from a copy bank ("Ready for today? Check your first meal." — rotate 3–4 calm variants; the banned-phrase test covers them), prunes dead endpoints (410).
**Cron config:** `vercel.json` `{"crons":[{"path":"/api/cron/nudge","schedule":"0 * * * *"},{"path":"/api/cron/bai-weekly","schedule":"30 4 * * 1"}]}` — hourly crons require the Vercel Pro decision (§10).
**Done when:** opt-in → subscription stored; cron dry-run in preview sends to a test subscription; at most one nudge/day/user enforced (dedupe by date guard); opt-out works and deletes the subscription.
**Env:** `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` (session generates, human stores), `CRON_SECRET`. **Tests first:** cron selection-logic unit tests (timezone matrix, already-checked-today, opt-out, one-per-day), sw push-handler test in `tests/unit/client/`, Playwright opt-in flow (permission mocked). **Human actions:** Vercel Pro (hourly crons), store VAPID keys.

### Phase 6 — Progress / adherence view (the compliant BAI)

**Goal:** the motivation layer, compliant-by-construction: a **behavioral** adherence index with CDC-DPP-cited copy — **never a predicted A1C value** (PRD Amendment 1's fabricated-formula correction is binding).
**Steps:** `lib/coach/bai.ts`:
```ts
export function computeBai(weekChecks: {createdAt: Date; risk: RevoraRisk; actionDoneAt?: Date}[], tz: string):
  { score: number; adherence: number; consistency: number; action: number; band: 'excellent'|'on_track'|'building'|'getting_started' }
```
Components (adapted to what this product actually measures — no GL numbers exist to "budget"): adherence 50% = days with ≥1 check / 7; consistency 30% = min(1, avg checks/day ÷ 3); action 20% = post-meal actions acknowledged ÷ prompted (no prompts that week → weight redistributes to the other two). Band copy verbatim from Amendment 1's table (CDC-DPP-cited, qualitative). `GET /api/cron/bai-weekly` (Monday cron) computes per user into `bai_weekly`. `app/progress/page.tsx`: current band + label, week-over-week trend shown as bands (not a line chart of numbers), the three components as qualitative bars, and the methodology link. `app/how-it-works/page.tsx`: BAI methodology disclosure + the citation foundation (CDC DPP 58%; Jenkins 2008; Imai 2023 — as *evidence for the approach*, never as a promise of the user's outcome) + the honest-uncertainty statement.
**Hard rules (tested):** no predicted/future A1C anywhere; no "on track to reach X by day Y"; progress copy qualitative; clinical interpretation deferred to a clinician; the approved replacement framing ("matching the consistency profile of participants who…") is the ceiling.
**Done when:** weekly BAI computes for seeded fixtures; progress page renders bands with compliant copy; claims + banned-phrase audits cover every progress string; axe green.
**Env:** none new. **Tests first:** `tests/unit/coach/bai.test.ts` (component math, redistribution, band edges), copy audit extension, Playwright progress page. **Human actions:** none.

### Phase 7 — Production hardening + observability → **GATE 1 (Heavy-Build DoD, §11)**

**Goal:** production-grade and fully instrumented on the real domain.
**Steps:** provision all env in Vercel (preview + production; list in §10 §2); **verify `maxDuration=15`** in `app/api/check/route.ts` against the plan (current Vercel default ceiling is 300s on all plans — 15 is safe, but confirm the plan's function limits and the Pro decision for hourly crons); extend `GET /api/health` with `db` (SELECT 1) and `cron-heartbeat` probes (no secrets); prod Sentry DSN + **verify the scrub on real traffic** (throw a canary in preview; inspect the event); Plausible live (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`) with the typed event allowlist `lib/client/analytics.ts` (events: `check_completed{risk,kind,input_method}`, `onboarding_completed`, `signin_completed`, `nudge_sent/opened`, `paywall_viewed`, `subscribe_started/completed`, `deletion_completed` — **no PII, no A1C, no food strings**; enforced by a unit test on the event-payload types); run `scripts/consistency-check.mjs` N=50 against preview and record the flip rate (target ≥95% modal class; if worse, remediate via `openai-client.ts` determinism settings — an engine-adjacent change that itself requires the regression suite + eval rerun to stay green); backups confirmed on Neon prod branch; custom domain + DNS; **all suites green** including every new stateful test.
**Done when:** preview fully green + instrumented; production deploy executed by the human on the real domain; Gate-1 checklist (§11) fully checked.
**Env:** everything in §10 §2. **Human actions:** Vercel Pro decision, prod env provisioning, domain + DNS, the production deploy approval, Upstash/Sentry/Edge-Config prod values.

### Phase 8 — TWA packaging + real-device QA

**Goal:** a signed `.aab` wrapping the live PWA, verified on hardware — including the real Play purchase path.
**Steps:** follow `docs/ops/play-twa-runbook.md` §9.3: Bubblewrap init against the live manifest (package id e.g. `app.revora.twa`), build; first Play upload (internal track) → copy the **App Signing key SHA-256** → fill and commit `public/.well-known/assetlinks.json` (template already in the runbook; never a placeholder fingerprint) → deploy → Statement List Tester passes → TWA launches without URL bar. Manifest additions: `screenshots` array + maskable checks. **Device QA checklist** (produce as `docs/ops/device-qa-checklist.md`): install from internal track · offline behavior (`offline.html`) · onboarding · text + voice check · sign-in (magic link on device mail) · history sync · nudge (subscribe, receive at the set hour) · **purchase premium via Play Billing with a license tester → entitlement flips → cancel → restore** · account deletion.
**Done when:** every checklist item verified on a physical Android device; assetlinks verified; `.aab` on the internal track.
**Env:** Play App Signing (human-held). **Human actions:** Play account, keystore/signing, the upload, a physical device + license-tester account.

### Phase 9 — Play Console submission (Track B merges here)

**Goal:** pass review, including health-app scrutiny.
**Steps:** finalize from Track B drafts: store listing (`docs/ops/play-listing.md` — coach-first positioning, the user-as-agent line, zero banned claims, no "AI-powered" lead, no accuracy claims); Data Safety form exactly per the 4B-updated mapping; health-apps declaration (informational only — no diagnosis/treatment); content rating; **target audience: adults (18+)**; ads = none; app-access → reviewer test login (the app has auth now — provide a seeded test account + magic-link-bypass test credential path on a preview-only flag); **account-deletion URL** declared (`https://<domain>/account/delete`); privacy policy URL (`/privacy`) + ToS (`/terms`, new page from Track B) live; **counsel sign-off recorded** (claims, privacy, disclaimer, consent wording, the 3 "reversal" lines). Submit internal → closed → production per current Play testing requirements.
**Done when:** app approved on production track with health-app policies passed; counsel sign-off on file.
**Human actions:** the submission itself, review responses, counsel engagement fees, tester cohort if Play requires one.

### Phase 10 — Launch, support, incident response → **GATE 2 (Fully-Fledged-App DoD, §11)**

**Goal:** real users find → install → onboard → return → pay; and you can support them.
**Steps:** launch checklist (`docs/ops/launch-checklist.md`); acquisition per `docs/product-marketing.md` GTM (r/prediabetes organic, SEO on "prediabetes what to eat", ASO, doctor channel) — the betrayal hook leads; support: `support@<domain>` inbox + response macros (refunds per policy, deletion, billing) in `docs/ops/support-playbook.md`; monitoring: Sentry alerts + uptime check on `/api/health` + Play vitals; extend the existing incident runbook with stateful-layer scenarios (DB down → engine still answers guests: history routes fail-soft with calm copy; billing webhook outage → verify-on-read covers; push failure → silent skip, never double-send); watch week-1 metrics (installs, D1/D7, conversion) as *instrumentation*, not gates; re-verify the 4 guardrails against the shipped surfaces.
**Done when:** Gate-2 checklist (§11) fully satisfied.
**Human actions:** acquisition execution, support ownership, on-call, refund handling.

---

## 6. The three input methods — full specifications

Presented in-product as three labeled ways to log a meal, each with its one-line description. All converge on `POST /api/check` → `lib/revora/` (§3.1).

### 6.1 Text (D1) — "Type your meal." — SHIPS

The existing flow, extended (P1). Contract: `{ food ≤160 chars, a1c 0–20 }` → A1C band routing (out-of-scope → boundary guidance, never a verdict) → precheck (non-food → refusal with examples; vague → one clarifying question max) → prompt with band-calibrated conservatism → floors (`postprocess.ts`) → one card: risk (Clear / Be careful / Hold off ↔ SAFE/MODERATE/HIGH) + one qualitative reason + one adjustment + one swap + sequencing tip + post-meal action (MODERATE/HIGH only) + disclaimer. Qualitative-only: no GI/GL numbers, no carb grams, no mg/dL, ever. Repeat-meal cheapening: once history exists, "same as yesterday's breakfast" re-check from `app/history/page.tsx` (one tap pre-fills the form). Failure modes: model error → fail-closed `retry` copy; rate-limited/paused → middleware 429/503 with short disclaimer (counsel Q3 covers the short form).

### 6.2 Voice (D1) — "Say your meal." — SHIPS

An input convenience, not a separate brain. Browser Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`) streams the transcript **into the same textarea**; the user sees, edits, and submits their own words — so the epistemic frame is identical to typing ("based on what you told me"), and transcription errors are handled by (a) review-before-submit and (b) the engine's existing ≤1-clarify contract for residual garble. Where the API is unavailable (iOS Safari), the mic button is hidden and hint copy points to keyboard dictation — same path, zero build. Audio is processed by the browser/OS speech service; Revora servers only ever receive final text (declared in privacy + Data Safety). No always-on listening; recognition runs only while the button is active. Files/tests: Phase 2. Never marketed as "AI that understands you" — it's the fast way to fill in the form.

### 6.3 Photo-assist, confirm-before-verdict (D5) — "Snap your meal, confirm the details, get your answer."

> ## ██ DEFERRED — DO NOT BUILD OR LAUNCH IN THIS RELEASE ██
> This section is a complete specification so a later release can build it with zero rework. No vision code, no camera UI, no photo marketing ships now. Ship gates: **all** of (1) counsel answers counsel-brief Q1 (SaMD) **for an imaging input**, (2) the §6.3.4 pre-ship eval passes on the production model, (3) the owner green-lights the build. (The original retention-gate precondition is void under this plan's no-gates scope decision; the counsel and eval gates are safety/legal gates and stand.)

**6.3.1 Design (from `docs/direction-validation-2026-07-01.md` §4.2, binding).** The photo **writes the description; the user confirms; the engine judges.** Why: photo-only glycemic estimation has a physics problem (invisible sweeteners/sauces, lookalike swaps — cauliflower crust read as wheat at 9.4× true carbs; portion depth), real-world carb error 30–44%, and an honesty-compatible doubt gate fires on ~71% of meals — so the vision model is a good *reporter* and a bad *judge* (dish-family ID 29/31 in the spike). The verdict never rests on unconfirmed perception.

**Flow:** (1) user snaps a photo → vision model returns a **draft description, never a verdict**: dish name, ingredients, portion in household measures, each as an editable chip, with the model's own doubt list pre-converted into highlighted chips to check. (2) **Confirmation is unconditional — no confidence threshold ever skips it.** One tap accepts an undisputed draft; but any chip the model flagged **class-critical** (sweetened-or-not, which-noodle, portion on a carb-dense dish) must be explicitly resolved — it cannot ride through on the accept-all tap (anti-rubber-stamp: otherwise a hungry user's tap silently converts bad perception into "the user's confirmed statement"). (3) The confirmed description is submitted to the **existing text engine unchanged** (`/api/check`); every result can truthfully say "based on what you confirmed." (4) **Portions are never silently guessed** — the portion chip is always present; unconfirmable portion keeps the ambiguity flag → the MODERATE floor governs, exactly as vague text does today. (5) **No numeric output surfaces** — the draft's internal numbers are for the engine's context only. (6) Copy: "the fast way to fill in the form," never "AI that reads your meal"; no accuracy claims.

**6.3.2 Data contract (future `POST /api/draft-meal`):**
```jsonc
// request: multipart image (re-encoded ≤1024px client-side, EXIF-stripped) — processed transiently, never stored
// response:
{
  "dish": "oatmeal with strawberries",
  "chips": [
    { "id": "base",    "label": "rolled oats, cooked",  "kind": "ingredient", "classCritical": false },
    { "id": "sweet",   "label": "sweetened?",           "kind": "doubt",      "classCritical": true,
      "options": ["unsweetened", "sweetened", "not sure"] },
    { "id": "portion", "label": "about 1 cup",          "kind": "portion",    "classCritical": true }
  ],
  "doubtNotes": ["can't tell if the oatmeal is sweetened"]
}
// UI invariant: every chips[kind=portion] always present; every classCritical chip requires an explicit
// resolution event before submit is enabled; "not sure" resolutions keep the ambiguity wording in the
// composed description so the engine's MODERATE floor governs.
```
Composed output = a plain-text description assembled from confirmed chips → the same `{food, a1c}` request. New files when built: `app/api/draft-meal/route.ts`, `lib/vision/draft.ts` (+ prompt with humility rubric), `components/photo-capture.tsx`, `components/draft-confirm.tsx`. `checks.input_method='photo'` already exists.

**6.3.3 Privacy/compliance (when built):** image processed in-request only, `store:false`-equivalent on the vision call, no image retention, no image logging; Data Safety + `/privacy` + `data-flow.md` + counsel brief updated in lockstep **before** launch of the feature; no camera marketing before counsel's imaging answer.

**6.3.4 Pre-ship eval (binding, from validation doc §6.2):** a **100-meal blind eval on user-grade phone photos** (not recipe photography), production vision model + production prompt, dietitian-graded reference. Ship requires **all**: (a) **zero under-warned confirmed verdicts** after the confirm flow; (b) **draft accepted-without-edit ≥60%**; (c) **median portion error after confirmation ≤25%**; (d) **dish-family ID ≥90%**. Plus the **silent-error-passthrough test**: moderated sessions with deliberately-wrong drafts; ship bar = passthrough on class-critical chips **≈ 0** (the forced-resolution UI exists to make this structurally true — verify with real, impatient users). Fail any → don't ship; re-run quarterly (models drift).

**6.3.5 Post-ship kill criteria (§6.3 of the validation doc):** ≥2% of confirmed verdicts class-wrong vs dietitian grading, **or** draft-accept <40% (users fighting drafts = anchoring risk) → pull behind the flag, return to text. Same-confirmed-description re-checks must be class-stable (watch the draft layer; the engine is already guarded).

---

## 7. Compliance, legal, and store-launch workstream (Track B — starts day 1, merges at P9)

Long-lead items first. Owner of record for every artifact: `docs/safety/copy-ledger.md` remains the approved-copy source of truth; every new user-facing string flows through it and the automated claims audit.

| # | Item | Depends on | Lands by |
|---|---|---|---|
| B1 | **Counsel engagement** (start immediately — longest lead). Questions: the four in `docs/legal/counsel-brief.md` **plus** (new): (Q5) SaMD posture of **longitudinal insights** over tracked meal history (the adversarial pass rated it closer to the device line than the one-shot check); (Q6) GDPR Art. 9 **consent wording** for A1C storage; (Q7) refund-policy adequacy; (Q8) the 3 flagged **"reversal" lines** (`Revora_Brand_Positioning_v2.md` L240/287/295) — rewrite or kill; (Q9) *forward-looking only:* what pushes an **imaging input** across the SaMD line (D5's gate — no build until answered). | — | before P9 submission; Q5 before insights ship broadly is the counsel's call — surface, don't self-clear |
| B2 | **Privacy policy rewrite + ToS.** New `app/terms/page.tsx`; `/privacy` rewrite lands in the 4B lockstep PR; both live on prod domain before submission. | 4B | P7 |
| B3 | **Data Safety + health declarations mapping** — updated table in `docs/ops/play-twa-runbook.md` (stored: health info/A1C, food text, email; encrypted at rest; deletion URL; voice processed by browser vendor; analytics = no PII). Every answer traces to a line in `data-flow.md`. | 4B | P9 |
| B4 | **Store listing copy** — `docs/ops/play-listing.md`: title, short/full description, feature list, screenshots plan. Positioning per `docs/product-marketing.md`; banned-claim checklist from the runbook applied line-by-line; the user-as-agent line present; no "AI-powered" lead, no accuracy claims, no "first" claims. | — | P9 |
| B5 | **Internal-doc corrections** (validation doc §7.4 — fix before anything external quotes them): reconcile the two PP taxonomies (Traceability Matrix PP-01..15 vs PRD §3.2 PP-01..08 — add a banner to the Matrix declaring PRD §3.2 canonical); purge remaining "96M" → 115.2M (Brand Positioning §14, Amendment 8); mark PRD §7.8 accuracy figures unverified; resolve the 3 reversal lines per B1-Q8. | — | before any external copy |
| B6 | **Regulatory posture notes:** informational-only, qualitative-only per `claims-boundary.md` (LOCKED); FDA General Wellness guidance framing; FTC substantiation — no accuracy/outcome claims anywhere, and the disclaimer never licenses a stronger claim; GDPR: OpenAI DPA executed, Art. 9 explicit consent at sign-up, encryption at rest, deletion rights; **US-only launch default** (defers DPIA/consent-banner/SCCs — revisit before any EU rollout); CCPA: no sale/share of personal data — state it. | B1 | P9 |

---

## 8. Testing & quality strategy

**Invariant:** vitest + evals + Playwright + axe green at every commit; every new stateful flow gets tests **before** implementation.

1. **Engine regression proof** (P0): golden-fixture suite over `checkFood()` floors + the untouched existing ~21 unit files + both eval suites. Any `lib/revora/` diff must keep all three green; the only sanctioned engine-adjacent change (determinism settings in `openai-client.ts`, if the consistency number demands it) reruns `eval:revora:live` before merge.
2. **Engine consistency check** (P0 harness, P7 measurement): `scripts/consistency-check.mjs`, N=50 identical descriptions against preview; record flip rate; target ≥95% modal class.
3. **Claims/tone enforcement as tests:** extend `claims-boundary-copy.test.ts` to every new surface (coach-outputs phrase bank, insights templates, BAI bands, paywall, onboarding, nudge copy bank, store-listing draft in `docs/ops/play-listing.md`); add the forward-permission ban list ("you failed", "you should have", backward-judgment family) to the banned-phrase audit.
4. **Unit:** `coach-outputs` · `speech` · `history-store` · `insights` · `compute` · `bai` · `crypto` · `entitlement` · `play-api`/`stripe` webhook fixtures · cron selection logic · analytics payload allowlist · scrub extension.
5. **Route/integration:** history/migrate authz (cross-user 403), persistence encryption-at-rest (no plaintext in rows), free-tier limit, billing verify/webhooks, deletion cascade (zero residual rows), health probe.
6. **Playwright:** onboarding · daily loop · voice (fake recognizer) · magic-link auth (mailbox stub) · cross-device history · paywall (Stripe test mode) · nudge opt-in · progress page · deletion · plus the existing smoke set.
7. **a11y bar:** axe on every new page/state (`/onboarding`, `/history`, `/progress`, `/account`, `/subscribe`, `/signin`, `/terms`, listening state, paywall) — zero violations, same bar as the existing gate.
8. **Manual/device:** the P8 device-QA checklist (install/offline/push/purchase/restore/deletion on hardware).

---

## 9. Ops, observability, and support

- **Sentry:** server-only capture as today; scrub extended (4B) so email/food/a1c can never leave — verified against a real preview event in P7; alert rules on error-rate and `stage:model` spikes.
- **Analytics (Plausible):** typed event allowlist only (§5 P7); no PII/A1C/food strings — enforced by a unit test on the payload types and re-checked in the Data Safety mapping.
- **Health/monitoring:** `/api/health` extended (db + cron heartbeat); external uptime ping; Neon backups verified; Play vitals watched post-launch.
- **Cost watch:** one OpenAI call per check is the dominant marginal cost; the free-tier daily cap + existing Upstash IP limit bound abuse; log a weekly cost line in ops review.
- **Support:** `support@<domain>`; `docs/ops/support-playbook.md` macros: refunds (Play refund path + Stripe refund + the policy stance from §10), deletion requests (point to the in-app/public URL; manual fallback), billing confusion (restore path), medical questions (never answer — the disclaimer script: talk to a doctor/RD).
- **Incident response:** extend the existing incident runbook: engine outage (fail-closed retry copy already ships), DB outage (guest checks keep working; history/coach fail soft with calm copy — this degradation mode is a test), billing webhook gap (verify-on-read backstop), push misfire (skip, never double-send), kill-switch via `launch-controls.ts` stays armed.

---

## 10. Human-action inventory (exhaustive — everything needing a person, money, credential, hardware, or counsel)

> The build mocks/dev-paths everything below and never silently assumes a step is done. Front-load §0; the truly un-mockable cluster is Play + legal + device.

**§0 Before/at start:** confirm branch/commit/preview-deploy permission (Vercel authed) · decide & record: **final domain** · **Play account type** (individual vs business; ID verification takes days — start now) · **launch SKUs/prices** (default $12.99/mo · $99.99/yr; lifetime deferred) · **free-tier daily check count** (default 5) · **support email** · **refund policy stance** · **US-only vs EU launch** (default US-only) · approve app name/icon/brand as final.
**§1 Accounts:** Neon (dev/preview/prod branches, backups on) · Resend (+ verified sending domain) · Upstash prod · Sentry prod · Vercel Edge Config · Plausible · **Google Play Developer ($25)** · **Google Cloud project** (Play Developer API on, service-account JSON, RTDN Pub/Sub topic) · **Vercel Pro** (hourly crons + function limits) · OpenAI prod key/quota (exists) · domain registrar · **Stripe** (web-fallback billing: account, verification, bank).
**§2 Secrets in Vercel (preview + prod; ⚙ = session generates, human stores):** `OPENAI_API_KEY` · `UPSTASH_REDIS_REST_URL/_TOKEN` · `SENTRY_DSN` · Edge Config · `DATABASE_URL` (pooled + direct) · ⚙`AUTH_SECRET` · ⚙`HEALTH_DATA_KEY` · ⚙`VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` · `RESEND_API_KEY` · `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` + `PLAY_PACKAGE_NAME` + `RTDN_SHARED_TOKEN` · `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/price IDs · `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` · `CRON_SECRET` · `NEXT_PUBLIC_APP_URL`.
**§3 Money:** Play $25 · Vercel Pro ~$20/mo · domain ~$12/yr · OpenAI usage · Neon/Resend/Plausible/Upstash tiers · Stripe fees · **counsel fees**.
**§4 Legal/counsel/compliance:** counsel sign-off per §7 B1 (claims, privacy, ToS, disclaimer, consent wording, reversal lines, insights-SaMD, refund policy) · OpenAI DPA executed · GDPR Art. 9 consent wording approved · trademark clearance "Revora" (2–4 wk — start early) · company entity confirmed (payouts/tax) · privacy policy + ToS live on prod domain · deletion URL declared in Play · tax/banking in the Play merchant profile (W-9/W-8 + payout bank) · CCPA stance recorded (US-only default).
**§5 Domain/DNS/email:** domain → Vercel + verify · Resend DNS (SPF/DKIM/DMARC) so magic links deliver · `/.well-known/assetlinks.json` reachable on the live domain (needs §7 fingerprint).
**§6 Play Console:** create app · internal-testing track + testers · **subscription products/base plans/prices** · license testers · forms: Data Safety, content rating, target audience (adults), health declarations, ads, export compliance, **account-deletion URL**, app-access reviewer login (seeded test account) · store listing assets (title/descriptions/feature graphic/screenshots/icon/privacy URL) · upload `.aab` · rollout internal → closed → production · respond to review.
**§7 Signing/packaging:** generate/own Play App Signing + upload keystore (Bubblewrap); safeguard passwords · first upload → copy SHA-256 into `assetlinks.json` · build & sign the `.aab`.
**§8 Hardware:** a physical Android device (emulators can't fully test Play Billing) · device Google account on the internal track with a license-tester payment method.
**§9 Cutover approvals:** provision prod secrets → approve the **production deploy** (P7) → approve the **Play submission/rollout** (P9).
**§10 Post-launch:** acquisition execution (r/prediabetes, SEO, ASO, doctor channel) · support ownership · monitoring/on-call · refunds/incident response.

---

## 11. Definition of Done — two milestone gates (completion gates, not go/no-go validation gates)

### Gate 1 — Heavy-Build DoD (closes at end of Phase 7)
- [ ] Accounts + server database live; history persists cross-device; backups on → **P4A/4B**
- [ ] Billing end-to-end (subscribe/renew/cancel/restore/refund) with server receipt verification; free-vs-paid entitlement enforced server-side → **P4D** (device-verified at P8)
- [ ] Three input affordances live: text + voice (photo deferred per §6.3) → **P1/P2**
- [ ] Decision card carries sequencing tip + post-meal action within the tone policy → **P1**
- [ ] Onboarding + daily loop + streak + week view + insight live; nudge fires reliably; progress/BAI computes weekly server-side → **P3/P4C/P5/P6**
- [ ] A1C + food encrypted at rest, access-controlled, scrubbed from logs/Sentry/analytics → **P4A/4B**
- [ ] Account + data deletion works end-to-end; public deletion URL live → **P4E**
- [ ] Privacy lockstep docs shipped in the same PR as server state → **P4B**
- [ ] All suites green incl. new stateful flows; axe zero-violation on every new page → **P0–P7**
- [ ] `lib/revora/` behavior unchanged — regression suite + evals prove it; consistency flip-rate measured & recorded → **P0/P7**
- [ ] Sentry (scrub-verified) + privacy-safe analytics live in production; health probe extended → **P7**
- [ ] Deployed to Vercel production on the real domain → **P7**

### Gate 2 — Fully-Fledged-App DoD (closes at end of Phase 10)
Everything in Gate 1, plus:
- [ ] Signed TWA `.aab`; `assetlinks.json` verified (no URL bar) → **P8**
- [ ] Full device QA passed on hardware incl. real Play purchase/restore → **P8**
- [ ] Live on Google Play; health-app policies passed → **P9**
- [ ] Listing/Data Safety/health declarations accurate and inside the claims boundary; deletion URL declared → **P9 + Track B**
- [ ] Counsel sign-off recorded (claims, privacy, ToS, disclaimer, consent, reversal lines) → **Track B/P9**
- [ ] Real users can find → install → onboard → return → pay; funnel instrumented (as measurement, not a gate) → **P10**
- [ ] Support + monitoring + incident response operating (refunds, bugs, deletion requests handled) → **P10**
- [ ] The 4 guardrails re-verified on every shipped surface: no calories; prediabetes-only; calm/permission-first/action-ending; decision-not-log → **P9/P10**

---

## 12. Risks & open decisions (pre-decided defaults — execution never stalls)

### Pre-decided defaults (deviate only with a `docs/adr/` note)

| Concern | Default |
|---|---|
| Database | **Neon Postgres** (Vercel Marketplace) + **Drizzle** migrations |
| Auth | **Auth.js v5** email magic-link + **Resend**; DB sessions |
| Billing | **Play Billing via Digital Goods API in the TWA** + server receipt verification (Play Developer API, no `googleapis` dep) + **Stripe web fallback**; unified `subscriptions` table. Epic-v-Google alternative-billing options: verify current policy with counsel before relying on them |
| Push | **Web Push (VAPID)** via `web-push` + Vercel hourly cron |
| Analytics | **Plausible**, typed no-PII event allowlist |
| Email | **Resend** |
| Field encryption | **AES-256-GCM via `node:crypto`**, env key; KMS is the upgrade path |
| Cron | **Vercel crons** (`vercel.json`) — needs Pro for hourly |
| Launch region | **US-only** (defers DPIA/consent-banner/SCCs) |
| Audience/age gate | **18+**, Play target audience = adults |
| Pricing | **$12.99/mo · $99.99/yr** (owner confirms SKUs; lifetime deferred post-launch) |
| Free tier | **5 result-checks/day**; free = checks + today view; premium = history + insights + progress + nudge + unlimited |
| Voice | Browser Web Speech API; keyboard-dictation fallback; no server audio |

### Top risks (owned, monitored — none block the build)

1. **Zero market validation before full spend** — accepted by the owner (§1, stated once). Mitigation that costs nothing: the funnel is instrumented from day 1, so evidence accumulates even though nothing gates on it.
2. **Play health-app review** — health apps get extra scrutiny; an accounts-app needs reviewer access, deletion URL, accurate Data Safety. Mitigation: Track B runs from day 1; every claim automated-audited; the informational-only posture is codified and counsel-signed.
3. **Insights/SaMD line** — longitudinal personalized insights sit closer to the device line than the one-shot check (adversarial finding). Mitigation: counsel Q5 asked explicitly; insights copy is rule-based, forward-permission, qualitative; if counsel flags it, the insight surface is feature-flagged (launch-controls) without touching the rest.
4. **Engine consistency in production** (~15% retest flip observed in the spike's setup) — measured at P7; determinism remediation path defined; verdict-history UX never re-judges a stored check.
5. **Push opt-in cliff** (two-step permission, 40–65 demographic, iOS PWA limits) — nudge is opt-in post-value, not onboarding; product works fully without it.
6. **Billing complexity** (RTDN, grace, restore, refunds across two providers) — unified entitlement table + verify-on-read backstop + device QA checklist covers the matrix.
7. **Competitive consolidation** (MyFitnessPal owns Cal AI; could ship a prediabetes mode) — standing trigger: revisit positioning within 30 days of such a launch; the durable defenses are the prediabetes-exclusive identity and the honesty position.
8. **Cost per check at scale** — free-tier cap + rate limit bound it; weekly cost line in ops review.
9. **Model drift** — evals re-run on any engine-adjacent change and quarterly; D5's eval (when built) re-runs quarterly by design.

### Open decisions awaiting the owner (defaults let work proceed)

Final domain · Play account type · SKU prices · free-tier count · support email · refund stance · US-only confirmation · brand-asset final approval. All in §10 §0.

---

## 13. Post-launch increment 1: CGM correlation — EXCLUDED from this release (specified for later; do not build)

**Decision & rationale (recorded so it is not re-litigated):** CGM correlation does not move the critical/high pains — it shows the spike *after* the meal (retrospective, in tension with guardrail #4's pre-meal decision framing) while Revora's value is the *pre-meal* decision; it serves only the small OTC-CGM secondary segment (~5–10%); it is the highest-cost, highest-risk item (Dexcom G7 / Abbott Libre 3 OAuth via an aggregator such as Terra, ongoing per-active-user cost ~$0.20–0.50/mo, real hardware prerequisite, added SaMD/privacy scrutiny — the audit's ISSUE-055 rated it 4–6 weeks minimum and recommended deferral); and it partly undercuts the core positioning of Revora as the honest, *cheaper alternative to a CGM*. It is **not** an input method — there are exactly three (§6).

**When built (post-launch), it must stay inside this boundary:** wellness/informational display of the user's own CGM readings + "here's how to eat so it doesn't spike" guidance through the existing qualitative engine framing — **never** device-grade accuracy claims, never diagnostic/alerting behavior, never dosing, never numeric prediction; premium-only, opt-in, with its own explicit consent and Data Safety update in lockstep. **External dependencies:** aggregator contract (Terra or equivalent), Dexcom/Abbott developer terms, counsel answer on whether displaying medical-device data alongside meal guidance shifts the SaMD analysis (ask as a dedicated question — do not reuse the imaging answer). **Pre-build artifacts required:** an ADR (provider, cost model), a counsel memo, a privacy-impact addendum, and an eval plan for correlation copy (the "your smoothie was followed by a rise" family must stay observational, never causal-diagnostic). Designed to bolt onto the existing history/coach layer (a `cgm_readings` table + a correlation view) with zero rework to the input methods or engine.

---

*Plan self-check: every feature in §4 has a phase home; both specified-not-built items are fenced (§6.3 deferred; §13 excluded); every phase names files/routes/tests/env/"done when"/human actions; the 4 guardrails, claims boundary, engine-unchanged rule, privacy lockstep, and compliant-BAI constraints are embedded as tests or PR rules, not intentions; the two DoD gates map every item to a phase; defaults are pre-decided; the accepted validation risk is stated exactly once.*
