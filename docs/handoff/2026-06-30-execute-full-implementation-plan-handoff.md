# Session Handoff — Execute the FULL Implementation Plan (gates disabled)

**Date:** 2026-06-30 · **Repo:** `/home/tefera/Desktop/Revora` · **Suggested branch:** `feat/coach-full-build` (off `launch-hardening`)
**Owner directive:** build the whole thing and get it shipped — **do not stop for validation gates.**

---

## ⚠️ READ THIS FIRST (3 things)

1. **Your mission:** execute **`docs/implementation-plan-to-play.md`** end-to-end — build the full prediabetes **coach** app and take it as far toward Google Play as is possible in-session.
2. **The WTP / retention kill-gates are DELIBERATELY DISABLED.** The plan front-loads cheap "stop if no signal" gates (P0 willingness-to-pay, P2/P3/P4 retention). The owner has chosen to **build through all of them** — do **not** pause to measure D1/D7/retention/pre-pay or wait for signals. Treat every "gate" as a build milestone, not a go/no-go. *(One-line consequence, stated once so you don't re-litigate it: this trades market validation for speed — the full paid backend + store release get built before any proof users will pay. That's the owner's accepted risk. Proceed.)*
3. **You cannot do all of it autonomously.** Build every line of **code, config, tests, and store/legal drafts** you can. **Stop and hand back** the steps that need a human: paid accounts, production secrets, signing keys, counsel sign-off, a physical Android device, real users. Keep a running **"Human action required"** list (template at the end) and keep moving to the next autonomous task instead of blocking.

---

## Orientation — read these first, in order

1. `docs/implementation-plan-to-play.md` — **the plan you are executing** (Phases 0–9, the canonical/only plan; see its "Which plan is canonical" section — ignore the superseded `PRD/Implementation_plans/*`).
2. `docs/coach-mvp.md` — detailed spec for the coach steps (P2–P5).
3. `docs/product-marketing.md` — positioning, voice, the **4 guardrails**, store-copy source of truth.
4. `docs/safety/claims-boundary.md` — **claims/legal language you must not cross** (LOCKED).
5. `docs/audit/Revora_Alignment_Audit_CoachPivot_20260630.md` — what was reconciled in the coach pivot (don't reintroduce camera-as-hero or the banned facts).

---

## Current state (verified at commit `d4eb073`) — your starting point

A **stateless, anonymous, text-in, single-shot food-risk checker** with a strong safety core. Assume nothing beyond this exists.

- **Stack:** Next.js 16.2.4, React 19.2.5, `openai` 6.36.0, `zod` 4.4.3, `@upstash/ratelimit`+`redis` (rate-limit only), `@sentry/node` 10.60.0, `@vercel/edge-config`. **No DB, no auth.**
- **Flow:** `app/page.tsx` → `components/food-check-form.tsx` → `POST /api/check` (`app/api/check/route.ts`, `runtime="nodejs"`, `maxDuration=15`) → `lib/revora/service.ts:checkFood()` → one OpenAI call → one decision card.
- **Input (`lib/revora/schemas.ts`):** `{ food: string≤160, a1c: number 0–20 }.strict()` — no image field.
- **KEEP & REUSE UNCHANGED — `lib/revora/`** (16 modules): the safety-hardened answer engine (A1C routing, input-precheck, safety-contract, conservative bias, fallback, postprocess, sentry-scrub, eval-rubric, rate-limit). Regression-test it; do not alter its behavior.
- **PWA:** `public/manifest.webmanifest` (standalone), `public/sw.js`, `public/offline.html`, icons 192/512/maskable-512, `components/sw-register.tsx`.
- **Privacy (true today):** `app/privacy/page.tsx` — "no account, no database, no saved history." (Stays true through P4; changes at P5 — see lockstep below.)
- **Tests:** vitest (`tests/unit/**`), evals (`tests/evals/**`), Playwright smoke (`tests/smoke/**`: a11y/launch-controls/mobile-check/pwa-assets), axe via `@axe-core/playwright`.
- **Play gap:** `public/.well-known/assetlinks.json` MISSING; `docs/ops/play-twa-runbook.md` exists (blocked pending prod + counsel).

**Before you start:** ensure a clean baseline — the coach-pivot doc set may be uncommitted on `launch-hardening`. Commit (or confirm committed) the docs, then branch `feat/coach-full-build`. Run the existing suites once to confirm green.

---

## Operating rules

- **Branch + atomic commits per phase/sub-step** (conventional commits, e.g. `feat(p5-auth): magic-link sign-in`). End commit messages with the repo trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. **Do not push, deploy to production, or submit to Play** without the user. Open a PR at the end.
- **TDD:** for every new stateful flow write/extend tests first; keep vitest + Playwright + axe **green** at every commit. Add tests for the new code, don't weaken existing ones.
- **Reuse the engine:** all meal decisions still go through `lib/revora/` unchanged.
- **Hold the 4 guardrails** (no calories; prediabetes-only A1C 5.7–6.4; calm/permission-first/action-ending copy; "should I eat this, now?" not "log your day") and `claims-boundary.md` in **all** user-facing strings. No "reverses prediabetes" (app as agent); use the user-as-agent safeguard line.
- **Don't stall on gray areas** — the defaults below are pre-decided so you can proceed. Record any deviation in a short `docs/adr/` note. When you hit a **human-only** step, do everything up to it, log it in "Human action required," and continue.
- **Privacy lockstep (P5):** the moment you add accounts/server history, update `app/privacy/page.tsx`, `docs/privacy/data-flow.md`, the Data Safety answers in `docs/ops/play-twa-runbook.md`, and `docs/legal/counsel-brief.md` **together**, in the same PR.

---

## Pre-decided defaults (so you don't block — change only with reason)

| Concern | Default | Notes |
|---|---|---|
| **Database** | **Neon Postgres** (Vercel Marketplace) | Vercel Postgres/KV are retired. Schema via **Drizzle** (typed + migrations) or plain parameterized SQL — keep it minimal. |
| **Auth** | **Auth.js v5 (NextAuth) email magic-link + Resend** | Sessions table in Neon. (Alt: Supabase for DB+Auth in one — pick ONE, record in ADR, don't block.) |
| **Billing** | **Google Play Billing via the Digital Goods API in the TWA** | Mandatory for in-app digital subs. Note the recent US Epic-v-Google alternative-billing/external-link option — **verify current policy + counsel before relying on it.** Build a clean entitlement model + server-side receipt verification; a web-purchase fallback is acceptable scaffolding. |
| **Analytics** | **Plausible** (or self-hosted PostHog) | **Privacy-safe: no PII, no A1C or food strings in events** — counts/cohorts only. |
| **Email** | **Resend** | magic-link + transactional. |
| **Push (P3)** | **Web Push (VAPID)** via the existing `public/sw.js` | one daily nudge, never guilt copy. |
| **Schema** | `users`, `checks(user_id, food, risk, a1c, created_at)`, `sessions`, `subscriptions(user_id, status, tier, renews_at)` | encrypt A1C at rest; access-control; scrub from logs (extend `lib/revora/sentry-scrub.ts`). |

---

## Execution directives by phase

> Full detail is in `docs/implementation-plan-to-play.md`. Below is the **build-through-the-gates** restatement: what's autonomous, what needs the human, and "done when."

- **P0 — WTP smoke test → SKIP THE GATE.** Do **not** run a validation smoke test or gate on pre-pay. *(Optional: a simple marketing landing page can be built later for launch; it is not on the critical path. Proceed straight to P2.)*
- **P1 — Billing architecture → DECIDE NOW (default above) + write a one-page ADR** (`docs/adr/billing.md`): Play Billing/Digital Goods in TWA, entitlement model, web fallback. *Autonomous.* **Done when:** ADR committed.
- **P2 — Memory (on-device).** localStorage `{food,risk,a1c,date}`, today's checks + streak, "history stays on your phone" copy. Reuse engine. Instrument analytics (no gating). *Autonomous.* **Done when:** built + tested + works in preview.
- **P3 — Nudge.** One daily Web Push via the service worker. *Autonomous code;* **human:** generate/provide VAPID keys (or you generate and the user installs as secrets). **Done when:** push fires locally/preview.
- **P4 — Insight.** Rule-based, from on-device history ("most of your 'be careful' meals are breakfast"); mirror user language. *Autonomous.* **Done when:** built + tested.
- **P5 — Pay + backend + identity (HEAVY BUILD).** Neon + Drizzle schema + migrations; Auth.js magic-link (Resend); server-side history + backup; move streak/insight server-side; billing per the ADR (subscribe/renew/cancel/restore/refund + receipt validation + entitlement enforcement); soft paywall copy; **A1C encryption + access control + log scrub**; **privacy lockstep doc updates**. *Autonomous code + tests;* **human:** create Neon/Resend/Play-billing accounts + provide secrets; real payment testing needs a Play account + signed app. **Done when:** full flow works end-to-end against a dev DB + sandbox billing; tests green.
- **P6 — Production hardening → GATE 1 (Heavy-Build DoD).** Env wiring for all secrets; verify `maxDuration=15` vs the Vercel plan (Hobby may force Pro); prod Sentry + PII-scrub verify; analytics live; **all suites green + new stateful tests**. *Autonomous: config, code, tests, a preview deploy.* **human:** provision prod env vars/secrets in Vercel, custom domain + DNS, the actual **production** deploy. **Done when:** Gate-1 checklist met; preview green; prod deploy handed to user.
- **P7 — TWA packaging.** Generate `public/.well-known/assetlinks.json` (template; real SHA-256 comes from the first Play upload), Bubblewrap/PWABuilder config, manifest screenshots. *Autonomous: config + template + scripts.* **human:** Play App Signing key, build/sign the `.aab`. **Done when:** packaging config + assetlinks template committed; build script ready.
- **P7.5 — Real-device QA.** *Human:* install the signed `.aab` on a physical Android device; verify install/offline/push/purchase-restore. Produce a test checklist for the user.
- **P8 — Play Console + policy + legal.** *Autonomous:* draft store listing (coach-first, no "reverses prediabetes"/no accuracy claims — from `product-marketing.md`), Data Safety form mapping, health-declaration mapping to `claims-boundary.md`, content-rating answers, medical disclaimer copy. **human:** $25 Play account, **counsel sign-off** on claims/privacy/disclaimer + the flagged "reversal" lines, actual submission. **Done when:** all drafts ready in `docs/ops/`; submission handed to user.
- **P9 — Launch, scale, support → GATE 2 (Fully-Fledged DoD).** *Mostly human:* real users, monitoring, support/refunds/incident response. *Autonomous:* set up the support/monitoring scaffolding and a launch checklist. **Done when:** Gate-2 checklist met.

---

## Secrets / env to provision (collect for the user)

`OPENAI_API_KEY` (exists) · `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` · `SENTRY_DSN` · Edge Config · `DATABASE_URL` (Neon) · `AUTH_SECRET` · `RESEND_API_KEY` · `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` · Play Billing service-account / license key · `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (or PostHog key) · (web-purchase fallback only) `STRIPE_*`.

---

## Human action required — EXHAUSTIVE (front-load these so nothing blocks)

> Do the **§0 "Before start"** bundle first. If a service isn't ready, the session falls back to a **dev/mock** path for that piece and flags it — only the **Play + legal + device** cluster (P7.5–P8) is truly un-mockable. The session will append anything new it finds.

### §0 — Before the session starts (unblocks the most)
- [ ] Confirm it may **branch, commit, and run `vercel` preview deploys** (Vercel authed as `tkiros`).
- [ ] Decide & record: **final domain name**; **Play account type** (individual vs business); **launch subscription price(s)** + **free-tier limit** (you must pick SKUs to ship billing even with validation off); **support email**; **refund policy** stance.
- [ ] Approve **app name / icon / brand assets** as final (icons exist) or supply replacements.
- [ ] Decide **EU-targeted vs US-only at launch** (drives DPIA + analytics-consent + SCC work).

### §1 — Accounts to create
- [ ] **Neon** (Postgres) → project + dev/preview/prod branches → `DATABASE_URL`(s); enable backups. *(P5)*
- [ ] **Resend** (email) → API key + **verified sending domain**. *(P5 auth)*
- [ ] **Upstash** (Redis) → prod REST URL + token. *(P6)*
- [ ] **Sentry** → prod project → `SENTRY_DSN`. *(P6)*
- [ ] **Vercel Edge Config** → store + token (launch-controls uses it). *(P6)*
- [ ] **Analytics** → Plausible site **or** PostHog project. *(P2+)*
- [ ] **Google Play Developer** ($25; **ID verification can take days — start now**; D-U-N-S if business). *(P8)*
- [ ] **Google Cloud** project → enable **Play Developer API** → **service-account JSON** (server-side purchase verification). *(P5 billing)*
- [ ] **Vercel Pro** decision (Hobby may be under the function/`maxDuration` ceiling). *(P6)*
- [ ] **OpenAI** → confirm prod key + billing/quota (key exists). *(already)*
- [ ] **Domain registrar** → own the chosen domain.
- [ ] *(web-purchase fallback only)* **Stripe** → account + verification + bank.

### §2 — Secrets to set in Vercel (preview + production)  *(⚙ = session generates, you store)*
- [ ] `OPENAI_API_KEY` (exists) · `UPSTASH_REDIS_REST_URL`/`_TOKEN` · `SENTRY_DSN` · Edge Config connection
- [ ] `DATABASE_URL` (Neon; pooled + direct)
- [ ] ⚙ `AUTH_SECRET` · ⚙ `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`
- [ ] `RESEND_API_KEY`
- [ ] Play billing **service-account JSON** + app **license public key**
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (or PostHog key)
- [ ] *(fallback)* `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / price IDs

### §3 — Money / paid commitments
- [ ] Play **$25** one-time · Vercel **Pro** (~$20/mo if needed) · domain (~$12/yr) · ongoing OpenAI usage · Neon/Resend/Plausible tiers at scale · **counsel fees**.

### §4 — Legal / counsel / compliance
- [ ] **Counsel sign-off**: claims-boundary, store copy, in-app **medical disclaimer**, privacy policy, **ToS**, and the **3 flagged "reversal" lines** (`Revora_Brand_Positioning_v2.md` L240/287/295; alignment report §5).
- [ ] **OpenAI DPA** executed (GDPR Art. 28; self-serve in console).
- [ ] **Explicit consent** for processing **health data (A1C)** (GDPR Art. 9 special category) — counsel-reviewed wording.
- [ ] **Trademark** clearance for "Revora" (2–4 wk lead — start early).
- [ ] **Company entity** formed (payouts/agreements/tax) — confirm status.
- [ ] **Privacy Policy** + **ToS** live on the prod domain.
- [ ] **Account/data-deletion** flow (session builds in-app) + a **data-deletion URL** you declare in Play (Google requires it for apps with accounts).
- [ ] If EU: **DPIA** + **analytics consent banner** + **SCCs** with processors (OpenAI/Neon/etc.). If US: **CCPA "Do Not Sell"** decision.
- [ ] **Tax/banking** in the Play **payments/merchant profile** (W-9/W-8 + payout bank).

### §5 — Domain / DNS / email
- [ ] App **domain → Vercel** (A/CNAME) + verify.
- [ ] **Resend domain DNS** (SPF/DKIM/DMARC) so magic-link emails deliver.
- [ ] Confirm `/.well-known/assetlinks.json` reachable on the live domain (session writes the file; needs domain live + the §7 fingerprint).

### §6 — Google Play Console  *(P8)*
- [ ] Create the app; set **internal-testing track** + tester emails.
- [ ] Create **subscription products / base plans / prices** (per country) — console or via the service-account API.
- [ ] Add **license testers** (test purchases without real charges).
- [ ] Complete forms: **Data Safety**, **content rating**, **target audience** (adults), **health/medical declarations**, **ads** declaration, **export-compliance**, **account-deletion URL**, **app access → reviewer test login** (the app now has auth).
- [ ] Store listing: title, short + full description, feature graphic, screenshots, icon, **privacy policy URL**.
- [ ] Upload the signed `.aab`; roll out internal → closed → production; respond to review.

### §7 — App signing / packaging  *(P7)*
- [ ] Generate/own the **Play App Signing** + upload **keystore** (Bubblewrap); safeguard passwords.
- [ ] First upload → copy the **SHA-256** into `public/.well-known/assetlinks.json`.
- [ ] Build & sign the **`.aab`** (Bubblewrap/PWABuilder) with the keystore.

### §8 — Hardware / device testing  *(P7.5)*
- [ ] A **physical Android device** (or cloud device farm) for install / offline / **push** / **purchase + restore** (emulators can't fully test Play Billing).
- [ ] A Google account on the device on the internal track + a **license-tester** payment method.

### §9 — Production cutover approvals
- [ ] Provision all secrets in Vercel; approve the **production deploy** to the real domain *(P6)*.
- [ ] Approve the **Play submission** / production rollout *(P8)*.

### §10 — P9 / ongoing (post-launch)
- [ ] **User acquisition** (r/prediabetes, SEO, ASO, doctor channel — per `product-marketing.md`).
- [ ] **Support** owner (questions/refunds) · **monitoring/on-call** · **incident response**.

---

## Definition of Done

**Gate 1 — Heavy Build (end of P6):** accounts + server DB live & backed up · Play Billing end-to-end (subscribe/renew/cancel/restore/refund) + entitlement enforced · daily nudge + streak/insight/progress server-side · A1C encrypted/access-controlled/scrubbed · full tests green + a11y · Sentry + analytics in prod · deployed to Vercel prod · `lib/revora/` integrated unchanged.

**Gate 2 — Fully-Fledged App (end of P9):** everything in Gate 1, plus signed TWA `.aab` + assetlinks verified · live on Play (passed health-app review) · store listing correct positioning + Data Safety accurate · counsel sign-off · real users can find→install→onboard→return→pay · support + monitoring + incident response · the 4 guardrails still hold.

---

## Do NOT

- Reintroduce **camera/CGM/BAI as hero**, or any **banned fact** (115.2M not 98M; no "first-mover"; no citable TAM; Cal AI ≈20–25% *trial*).
- Make any claim outside `claims-boundary.md`; never "Revora reverses prediabetes."
- Cross the 4 guardrails (no calories; prediabetes-only; calm/action-ending copy; decision-not-log).
- Push, deploy to production, create paid accounts, spend money, or submit to Play **without the user**.
- Re-run or re-add the validation gates — the owner disabled them on purpose.

## First move
Read the 5 orientation docs → confirm clean baseline + branch → run the suites green → write the P1 billing ADR → start P2. Work phase by phase, commit per step, keep tests green, and append to "Human action required" as you hit external steps.
