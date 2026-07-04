# Session Handoff — Revora Full Build (P0–P5 done, resume at P6)

**Date:** 2026-07-02 · **Branch:** `feat/full-build` (base `launch-hardening` @ `d4eb073`)
**Head commit:** `b649a5d` · **Tests:** 363 unit passing (47 files) + Playwright smoke green
**Plan of record:** `docs/production-implementation-plan-2026-07-01.md` (read §5 phase map + §11 DoD)
**Executing skill:** `superpowers:executing-plans` (this is a plan-execution session, TDD, commit per task)

---

## 0. What this project is (one paragraph)

Revora: the prediabetes-exclusive daily decision coach. At a meal it answers "should I eat this,
now?" with one calm card (Clear / Be careful / Hold off + one reason + one adjustment + one swap +
sequencing tip + post-meal action), never a number/calorie. Across days it remembers you (history,
streak, week view, one rule-based insight, a compliant behavioral progress view, one daily nudge).
We are taking it from a stateless anonymous text checker to a **fully-fledged production app on
Google Play** with accounts, encrypted server history, subscription billing, and store/legal
readiness. **Build everything now** — the owner disabled all validation/kill-gates (they are
ordinary build milestones). **Ship Text + Voice; specify-but-do-NOT-build Photo-assist (D5); CGM is
excluded.** Do not push to prod, spend money, create paid accounts, or submit to Play — those are
human actions.

---

## 1. Non-negotiable operating rules (carry into every remaining phase)

- **Never modify `lib/revora/` behavior.** All meal decisions flow through it unchanged. The Phase 0
  regression suite (`tests/unit/revora/engine-regression.test.ts`, 17 golden fixtures asserting exact
  `RevoraUserResponse`) + the two eval suites must stay green at every commit. The one sanctioned
  engine-adjacent change (determinism in `openai-client.ts`) only if the P7 consistency number demands
  it, and it must re-run `eval:revora:live`.
- **4 guardrails in every user-facing string:** (1) no calories ever; (2) prediabetes-only, A1C
  5.7–6.4% (out-of-range → boundary guidance, never a verdict); (3) calm/permission-first/action-ending
  copy, exactly one next action, never blame; (4) "should I eat this, now?" framing, not "log your day".
- **Claims boundary is LOCKED.** Informational, qualitative only. No GI/GL/carb grams/mg-dL/glucose-curve
  or future-A1C predictions surface to the user. Never "Revora reverses/treats/prevents/cures" (app as
  agent) — only the user-as-agent line: *"Reversal is achieved through your dietary choices — Revora
  gives you the clarity to make them."* No FDA/accuracy/"AI-powered" claims. A disclaimer never launders
  a stronger claim.
- **Progress/BAI is compliant-by-construction** — behavioral adherence, CDC-DPP-cited, **never a
  predicted A1C value** (`Revora_PRD_Amendments.md` Amendment 1 documents the original formula as a
  fabricated clinical claim). See §4 P6 below for the exact nuance.
- **TDD, green at every commit.** New stateful flows get tests **before** implementation. vitest + evals
  + Playwright + axe (zero-violation) stay green. Never weaken existing tests.
- **Atomic commits per task**, conventional messages, end every commit body with:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

## 2. Current status snapshot

**Completed & committed (P0 → P5):**

| Phase | Commit | What shipped |
|---|---|---|
| P0 | `2b2f2ac` | Clean baseline, `.gitignore`, engine-regression golden suite, `scripts/consistency-check.mjs`, 3 ADRs (`docs/adr/{billing,stack,launch-scope}.md`), human-action list seeded |
| P1 | `703218f` | Decision card v2: `lib/revora/coach-outputs.ts` (rule-derived sequencing tip + post-meal action, `CheckApiResponseSchema`), route wrap, card render, "Clear/Be careful/Hold off" verdict labels |
| P2 | `72ab7d3` | Voice input: `lib/client/speech.ts`, `components/voice-input-button.tsx`, same text path, iOS-Safari keyboard-dictation fallback |
| P3 | `fc21efc` | Onboarding (`app/onboarding`), on-device history (`lib/client/history-store.ts`), profile store, insights (`lib/coach/insights.ts`), daily loop + streak + week view (`app/history`), post-meal "I did it" ack |
| P4A | `cb5cdb1` | Neon/Drizzle schema + migration, AES-256-GCM (`lib/server/crypto.ts`), Auth.js v5 magic-link (`auth.ts`), Art. 9 consent, `/api/profile`, `/signin`, `/welcome` |
| P4B | `483711e` | Server history persistence + `/api/history{,/migrate,/action}` + **privacy-lockstep PR** (privacy page, data-flow.md, Play runbook Data Safety, counsel-brief Q5–Q9) + `privacy-stateful.test.ts` |
| P4C | `77ad3d9` | Server coach compute (`lib/coach/compute.ts` + `lib/coach/days.ts`), `/api/coach`, guest/server parity tests |
| P4D+E | `aa739bc` | Entitlement (`lib/server/entitlement.ts`), Play API (`lib/server/play-api.ts` RS256 JWT), billing routes (Play verify + RTDN + Stripe checkout/webhook/portal), free-tier 402 upsell, paywall, `/subscribe`, `/account`, account+data deletion + public `/account/delete` URL |
| P5 | `b649a5d` | Daily nudge: SW push handlers, `lib/server/nudge.ts` cron logic, `/api/cron/nudge`, `/api/push/subscribe`, two-step `components/nudge-opt-in.tsx`, `vercel.json` crons, PATCH `/api/profile` nudge prefs + account time picker |

**Remaining:** P6 (progress/BAI) → P7 (prod hardening, GATE 1) → P8 (TWA + device QA) → P9 (Play
submission drafts) → P10 (launch/support/incident, GATE 2). Plus Track B (legal/store drafts +
internal-doc corrections) and Track C (keep human-action list current).

**Deps added this session (in `package.json`):** `drizzle-orm`, `@neondatabase/serverless`,
`next-auth@beta`, `@auth/drizzle-adapter`, `stripe`, `web-push`; dev: `drizzle-kit`, `@types/web-push`,
`@electric-sql/pglite`.

---

## 3. Verify-green commands (run these first in the new session)

```bash
cd /home/tefera/Desktop/Revora
git branch --show-current          # must be feat/full-build
npm run typecheck                  # clean
npm run test                       # 363 passing (may need a warm box; hookTimeout=45s for PGlite)
npm run eval:revora                # 8 passing
npx playwright test tests/smoke --reporter=line   # all pass (retries:1 absorbs WebKit flake)
```

If a run shows PGlite server-test files "skipped" or failing under load, they pass in isolation
(`npx vitest run tests/unit/server/`) — it's beforeAll boot contention, already mitigated with
`hookTimeout: 45_000` in `vitest.config.ts`. Do not "fix" by weakening tests.

---

## 4. NEXT: Phase 6 — Progress / adherence view (the compliant BAI)

**Goal:** the motivation layer, compliant-by-construction. A **behavioral** adherence index with
CDC-DPP-cited qualitative copy — **never a predicted A1C value**.

### 4.1 ⚠ Critical nuance (read before writing copy)

`Revora_PRD_Amendments.md` Amendment 1 gives BAI band copy, BUT the literal strings contain
**banned/borderline language** that will fail the claims audit and violate the plan ceiling:

- Band "Excellent" copy `"...matches participants who reversed prediabetes..."` contains **"reversed"**
  → the `claims-boundary-copy.test.ts` banned pattern `\brevers(e|es|ed|ing|al|als)\b` catches it.
- Band "On Track" `"...associated with meaningful A1C improvement over 90 days"` drifts toward outcome
  prediction.

The plan §5 P6 says: progress copy stays qualitative; **the approved replacement framing "matching the
consistency profile of participants who…" is the CEILING**; no predicted/future A1C; no "on track to
reach X by day Y". **So you must adapt the band copy** to stay inside the boundary (e.g. "Your
check-in consistency this week matches the profile studied in the CDC Diabetes Prevention Program")
and add every produced string to the claims + banned-phrase audits. Cite CDC DPP 58% / Jenkins 2008 /
Imai 2023 as *evidence for the approach on `/how-it-works`*, never as the user's promised outcome.

### 4.2 BAI components (ADAPTED — there is no GL budget in this product)

Per plan §5 P6, NOT the Amendment's GL-budget version:
- **adherence 50%** = days with ≥1 check / 7
- **consistency 30%** = min(1, avg checks/day ÷ 3)
- **action 20%** = post-meal actions acknowledged ÷ prompted; **if no prompts that week, redistribute
  its weight to the other two** (renormalize adherence+consistency to 100%).
- Score 0–100; bands `excellent | on_track | building | getting_started`.

### 4.3 Exact files to create (TDD — tests first)

1. **`tests/unit/coach/bai.test.ts`** (write first): component math, the no-prompt redistribution,
   band edges (0/39/40/59/60/79/80/100), and a copy audit that every band string passes the banned-
   phrase + claims scan and contains NO predicted/future-A1C, no "reverse", no "reach X by day Y".
2. **`lib/coach/bai.ts`**:
   ```ts
   export function computeBai(
     weekChecks: { createdAt: Date; risk: RevoraRisk; actionDoneAt?: Date }[],
     tz: string
   ): { score: number; adherence: number; consistency: number; action: number;
        band: 'excellent'|'on_track'|'building'|'getting_started' }
   ```
   Use `lib/coach/days.ts` (`dayKeyInTimezone`) for tz-correct day bucketing — same helper 4C uses.
3. **`app/api/cron/bai-weekly/route.ts`**: Monday cron (already scheduled in `vercel.json` as
   `30 4 * * 1`), `Authorization: Bearer CRON_SECRET` (copy the auth pattern from
   `app/api/cron/nudge/route.ts`), computes each premium user's prior-week BAI into `bai_weekly`
   (schema table already exists). Factor the runnable logic into a `lib/server/bai-cron.ts` +
   `createBaiCronHandler({db, now})` so it's unit-testable with PGlite like the nudge cron.
4. **`app/progress/page.tsx`** (`"use client"`): reads `/api/coach` (`latestBai` is already returned
   and **already premium-gated** — free users get `latestBai: null`, `tier: 'free'`). Render current
   band + label, the three components as qualitative bars (NOT a number line chart), week-over-week as
   bands, and a link to `/how-it-works`. Non-premium → a soft prompt to `/subscribe`. axe clean.
5. **`app/how-it-works/page.tsx`**: BAI methodology disclosure + citation foundation (CDC DPP 58%;
   Jenkins 2008; Imai 2023 — as evidence, never as the user's outcome) + honest-uncertainty statement.
6. Add both new pages to the `COPY_FILES` list in
   `tests/unit/revora/claims-boundary-copy.test.ts` and add the BAI band strings to the audited surfaces.
7. Playwright `tests/smoke/progress.spec.ts`: premium sees bands; free sees the upsell; axe clean.

**Done when:** weekly BAI computes for seeded fixtures; progress page renders compliant bands; claims +
banned-phrase audits cover every progress string; axe green. Commit: `feat(p6): ...`.

---

## 5. Then: P7–P10 (exact scope; details in plan §5)

### P7 — Production hardening + observability → **GATE 1** (autonomous parts)
- Extend `GET /api/health` with `db` (SELECT 1) + `cron-heartbeat` probes (no secrets).
- `lib/client/analytics.ts`: typed no-PII Plausible event allowlist
  (`check_completed{risk,kind,input_method}`, `onboarding_completed`, `signin_completed`,
  `nudge_sent/opened`, `paywall_viewed`, `subscribe_started/completed`, `deletion_completed`) + a unit
  test asserting the payload types carry no PII/A1C/food. Wire the Plausible `<script>` (not a dep).
- Verify `maxDuration=15` in `app/api/check/route.ts` is fine (Vercel default ceiling is now 300s).
- Confirm Sentry scrub on a real preview event (canary throw) — the scrubber already covers the new
  fields (`privacy-stateful.test.ts` proves it structurally).
- `scripts/consistency-check.mjs` exists; run N=50 against preview in P7 and record the flip rate in
  `docs/ops/launch-controls.md` (target ≥95% modal class).
- **Human:** prod secrets, domain+DNS, Vercel Pro, the production deploy. All suites green + axe zero.

### P8 — TWA packaging + device QA (autonomous: config/scripts/checklist)
- Bubblewrap config against the live manifest; `public/.well-known/assetlinks.json` gets the real
  SHA-256 **after** first Play upload (never a placeholder). Produce `docs/ops/device-qa-checklist.md`
  (install/offline/onboarding/text+voice/magic-link/history-sync/nudge/**Play purchase+restore**/deletion).
  **Human:** keystore, upload, physical device, license tester.

### P9 — Play submission (Track B merges; autonomous = drafts in `docs/ops/`)
- `docs/ops/play-listing.md` (coach-first, user-as-agent line, zero banned claims, no "AI-powered"/accuracy).
- Data Safety already mapped in `docs/ops/play-twa-runbook.md` §9.2 (updated in 4B).
- Reviewer test-login path: seed a test account + a preview-only magic-link-bypass flag.
- Deletion URL `https://<domain>/account/delete` already built. **Human:** $25 account, counsel sign-off,
  the submission.

### P10 — Launch/support/incident → **GATE 2** (autonomous scaffolding)
- `docs/ops/support-playbook.md` (refunds/deletion/billing/medical-question-deflection macros),
  `docs/ops/launch-checklist.md`, extend the incident runbook with stateful scenarios (DB down → guests
  still answered, history fails soft; billing webhook gap → verify-on-read; push misfire → skip never
  double-send). **Human:** acquisition, support ownership, on-call, refunds.

### Track B (legal/store — mostly drafts, some done)
- **Done:** counsel-brief Q5–Q9 added; privacy/data-flow/Data-Safety updated (4B lockstep).
- **Remaining:** `app/terms/page.tsx` (ToS) — must exist + be live before submission; `docs/ops/play-listing.md`;
  **B5 internal-doc corrections** (plan §7 B5): reconcile the two PP taxonomies (add banner to
  `Revora_Traceability_Matrix.md` declaring PRD §3.2 canonical), purge remaining "96M" → 115.2M in
  `Revora_Brand_Positioning_v2.md` §14, mark PRD §7.8 accuracy figures unverified, resolve the 3
  reversal lines (Brand Positioning L240/287/295) per counsel Q8.

### Track C — keep `docs/handoff/human-actions-required.md` current (append per phase).

---

## 6. Architecture & conventions the new session MUST follow (learned this session)

- **Route handler pattern for testability:** every server route exports a `createXHandler({db, getSession,
  now, ...deps})` factory with real defaults, then `export const POST = createXHandler()`. Tests inject
  PGlite `db` + a fake `getSession`. Follow this for all new routes. See
  `app/api/history/handlers.ts`, `app/api/billing/handlers.ts`, `app/api/profile/route.ts`.
- **Test DB:** `tests/helpers/test-db.ts` boots PGlite and applies the real `drizzle/*.sql` migrations.
  Use `createTestDb()` in `beforeAll`, `close()` in `afterAll`. Set `process.env.HEALTH_DATA_KEY =
  Buffer.alloc(32, N).toString("base64")` in tests that touch crypto.
- **Regenerate migrations** after any `lib/server/db/schema.ts` change:
  `rm -rf drizzle && npx drizzle-kit generate --name <name>`. CHECK constraints are declared via
  `check(...)` in the schema (drizzle-kit emits them).
- **`vitest.config.ts` gotchas (already set, don't remove):** `resolve.alias { "next/server":
  "next/server.js" }` + `server.deps.inline: ["next-auth","@auth/core","@auth/drizzle-adapter"]` (next-auth
  imports bare `next/server`); `hookTimeout: 45_000` (PGlite boot under load).
- **`auth.ts`:** the Drizzle adapter is constructed only when `DATABASE_URL` is set, so importing the
  module is build/test-safe without a DB. Session shape carries `user.id` via the session callback.
- **Encryption:** exact A1C + food text stored ONLY as ciphertext via `lib/server/crypto.ts`. Coarse
  fields (risk, band, timestamps, input_method) plaintext. `privacy-stateful.test.ts` enforces this
  (encryptField-only writes, no plaintext columns, scrubber kills all PII vectors).
- **Shared coach math:** `lib/coach/days.ts` (`dayKeyLocal`, `dayKeyInTimezone`, `hourInTimezone`,
  `computeStreak`, `weekView`) is used by BOTH the client store (local tz) and server compute (profile
  tz) — parity by construction. Reuse it in P6's BAI, do not re-derive day math.
- **Claims audit carve-out:** `tests/unit/revora/claims-boundary-copy.test.ts` scans all user-facing
  surfaces; the ONLY approved "reversal" use is the North Star line, carved out via
  `CARVE_OUT_FILES` with whitespace-normalized exact-match removal. Add every new page/component to
  `COPY_FILES`.
- **Playwright:** `serviceWorkers: "block"` (WebKit SW hang). `playwright.config.ts` webServer sets
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY` for the nudge flow. Mock `navigator.serviceWorker.register` in any
  spec that needs SW (the layout registers it). `retries: 1` absorbs WebKit flake.
- **Client meal-memory seam:** `historyStore` (localStorage) for guests; `lib/client/remote-history.ts`
  loads server when signed in, local fallback. `submitCheck` sends `x-revora-client-id` +
  `x-revora-input-method` headers so local and server rows dedupe on migration.
- **Free-tier enforcement** is server-side in `/api/check` BEFORE model spend → 402 `{kind:"upsell"}`;
  premium unlimited; guests use the existing IP rate limit; fail-open on metering errors.

---

## 7. Human-action status (full list: `docs/handoff/human-actions-required.md`)

Nothing is blocked — everything is mocked/dev-pathed. Long-lead items to nag on day 1: **counsel
engagement** (Q1–Q9), **Google Play Developer account** (ID verification takes days), **trademark
"Revora"**, **domain purchase**. All secrets documented in `docs/ops/env-reference.md`
(⚙ = session generates: AUTH_SECRET, HEALTH_DATA_KEY, VAPID keys, RTDN_SHARED_TOKEN, CRON_SECRET;
note VAPID public key must ALSO be exposed as `NEXT_PUBLIC_VAPID_PUBLIC_KEY`).

---

## 8. Do NOT (owner-locked)

- Reintroduce validation/kill-gates (WTP, D1/D7) as go/no-go.
- Build D5 photo-assist (vision/camera code, photo marketing) — specify-only is done in the plan §6.3.
- Add a fourth input method. Exactly three: Text, Voice, Photo-assist(deferred). CGM excluded.
- Emit numeric glycemic claims or predicted A1C from any surface; make accuracy/"AI-powered"/reversal-
  by-app claims; let a disclaimer launder a stronger claim.
- Modify `lib/revora/` behavior (regression + evals prove it unchanged).
- Push to prod, deploy to prod, create paid accounts, spend money, or submit to Play without the user.

---

## 9. First moves for the new session

1. `git branch --show-current` (feat/full-build), run the §3 verify-green commands.
2. Re-read plan §5 P6 + `Revora_PRD_Amendments.md` Amendment 1 (BAI) + §4.1 nuance above.
3. Execute P6 TDD: `bai.test.ts` → `lib/coach/bai.ts` → cron route + handler → `progress` +
   `how-it-works` pages → claims audit extension → progress smoke. Commit `feat(p6): ...`.
4. Continue P7 → P10 + finish Track B drafts, appending to the human-action list as items surface.
5. Keep every suite green + axe zero-violation at every commit. Open a PR at the very end (P10),
   don't push earlier.
   
***
## P.S. Decision 

1. Use Hybride of Vercel and Railway
    Vercel handles what users see (fast, pretty, reliable)
    Railway handles what users don't see (database, heavy lifting, savings)
    
2. use Umami instead of plausible for analytics 
