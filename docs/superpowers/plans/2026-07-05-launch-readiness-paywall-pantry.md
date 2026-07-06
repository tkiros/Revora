# Revora Launch-Readiness Implementation Plan

> **NOTE 2026-07-06:** This plan does not scope D5 Photo-assist (its "photo" references are the Pantry Review upload, a separate surface). D5 meal-photo check input was built under `docs/superpowers/plans/2026-07-06-photo-assist-check-input.md`; no change to this plan's paywall/pantry scope is implied.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the web app to launch readiness: Day-1 anonymous taster (≤10 checks) → hard wall → 7-day card-required Stripe trial auto-converting to $12.99/mo (with 2-day pre-charge email + one-tap cancel), in-app Pantry Review purchase, guided first-run onboarding, "Enjoy it anyway" enrichment, and the instrumentation + price-test harness to measure all of it.

**Architecture:** Additive, feature-flagged (`PAYWALL_MODE=legacy|trial`) rework of the entitlement layer from "5/day free forever + soft 402" to a taster→trialing→premium→lapsed state machine. Stripe Checkout `mode:subscription` + `trial_period_days:7` reusing the existing `handlers.ts` DI-factory/webhook patterns; account creation moves to trial start (email-first, magic link sent at checkout). Trust rails (pre-charge email cron + HMAC one-tap cancel) ship BEFORE the wall can be enabled. Pantry gets a landing page + in-app `mode:"payment"` checkout that flows through the existing, unchanged `applyPantryCheckout` webhook branch.

**Tech Stack:** Next.js App Router (existing), Auth.js v5 + Resend magic links (existing), Drizzle/Postgres (existing), Stripe SDK (existing), Umami client analytics (existing), Vitest + pglite + Playwright (existing). **No new dependencies.**

## Global Constraints

- **Claims boundary is absolute** (`docs/safety/claims-boundary.md`): no exact GL/GI/mg-dL, no glucose/A1C prediction, no reversal-as-agent, no accuracy claims, no diagnosis/treatment/prevention/cure language. Every new user-facing string must be added to the copy ledger (`docs/safety/copy-ledger.md`) AND covered by `tests/unit/revora/claims-boundary-copy.test.ts` (add new files to its `COPY_FILES` list) and pass before merge.
- **Do not alter the result engine's safety behavior**: `lib/revora/postprocess.ts`, `lib/revora/service.ts`, `lib/revora/prompt.ts`, `lib/revora/schemas.ts` (engine schemas), `lib/revora/a1c.ts` are read-only in this plan. The only `lib/revora/` file modified is `coach-outputs.ts` (route-layer, deterministic phrasebank — explicitly designed as the additive seam).
- **Play/TWA billing untouched**: `lib/client/digital-goods.ts`, `lib/server/play-api.ts`, `app/api/billing/play/*`, the Play branches in `handlers.ts` and `paywall-card.tsx` must behave identically. Every task that touches `handlers.ts` or `entitlement.ts` re-runs the existing billing/entitlement test suites unchanged.
- **Trust execution is part of "done"**: the trial wall must never be enabled (`PAYWALL_MODE=trial` in production) before the pre-charge email cron and one-tap cancel are live and tested. Phase 3 is a hard prerequisite of flipping the Phase 4 flag.
- **Hard gate only**: under `PAYWALL_MODE=trial` there is no residual free tier — no "5/day", no "come back tomorrow". `FREE_DAILY_CHECKS` legacy path survives only behind `PAYWALL_MODE=legacy` for rollback.
- **Pricing ladder**: $9.99 / $12.99 / $19.99 (env-selected variant, one price visible per cohort). $12.99 is the default. $6.99 is out of scope.
- **Prices in copy**: the price shown on the wall must come from the server-resolved variant (single source), never hard-coded in two places.
- **All changes additive and reversible**: new columns are nullable, new enum values additive, new routes/pages are new files, modified files keep legacy behavior behind the flag.
- Commit style: existing repo convention (`feat(...)`, `fix(...)`, `test(...)`, `docs(...)`), frequent small commits, each task ends green (`npx vitest run` for touched suites).
- Test commands: unit `npx vitest run tests/unit/...`, all unit `npm test` (verify script name in `package.json` at execution; fall back to `npx vitest run`), smoke `npx playwright test tests/smoke/...`.

---

## 1. Codebase analysis — reuse map (REUSE / MODIFY / BUILD-NEW, with file:line)

### 1.1 Entitlement & metering

| Area | Current behavior (evidence) | Verdict | Note |
|---|---|---|---|
| `lib/server/entitlement.ts` | `FREE_DAILY_CHECKS = 5` (`:13`); `Entitlement = { tier: "free"\|"premium", source }` (`:15-18`); `PREMIUM_STATUSES = ["active","grace","canceled"]` (`:34`); `getEntitlement` scans `subscriptions` rows, honors `currentPeriodEnd > now`, heals stale Play rows (`:36-85`); `countChecksToday` buckets last 48h in profile tz (`:88-111`) | **MODIFY** | Add `"trialing"` to `PREMIUM_STATUSES`; extend `Entitlement` with `status: "trialing"\|"premium"\|"lapsed"\|"none"`. `countChecksToday` + `FREE_DAILY_CHECKS` stay for legacy mode. Play verify-on-read untouched. |
| `app/api/check/route.ts` | Server-side metering before model spend, signed-in only, fail-open (`:87-125`); `FREE_LIMIT_MESSAGE` soft 402 (`:54-55`, returned `:112-119`); guests metered only by IP rate limit (middleware); `deriveCoachOutputs` merged at `:156` and `:172`; `persistCheck` meal memory (`:179-216`) | **MODIFY** | Branch on `PAYWALL_MODE`: `trial` → any signed-in non-entitled user gets a hard-wall 402 (same `kind:"upsell"` JSON shape so the client path at `lib/client/check.ts:79-97` keeps working); `legacy` → existing behavior byte-for-byte. |
| `app/api/entitlement/route.ts` | 4-line wrapper → `createEntitlementHandler` (`handlers.ts:72-107`), returns `{tier, source, checksToday, freeDailyLimit}`; 401 for guests (`handlers.ts:80-82`) | **MODIFY** (handler) | Include the new `status` field. Guests still 401 — the taster is device-local; a separate public `/api/paywall` config endpoint (BUILD-NEW) serves mode+price to anonymous clients. |
| Guest metering | None server-side; Upstash IP rate limit + global daily cap in `middleware.ts:79-121` (matcher `/api/check` only, `:126`) | **REUSE-AS-IS** | This is the abuse backstop under the taster. `ponytail:` device-local taster is gameable (clear storage = reset); accepted for a taster, upgrade path = server/device-fingerprint enforcement if abuse appears in data. |
| Client 402 handling | `lib/client/check.ts:79-97` turns a 402 `{kind:"upsell", message, disclaimer}` into a normal response; rendered by `components/result-card.tsx:90-107` ("That's five for today" + `/subscribe` link) | **MODIFY** | Keep the transport shape; result-card upsell branch gets a trial-mode variant (wall CTA), legacy copy preserved behind mode. |

### 1.2 Billing

| Area | Current behavior (evidence) | Verdict | Note |
|---|---|---|---|
| `app/api/billing/handlers.ts` — Stripe checkout | `createStripeCheckoutHandler` (`:244-283`): 401 without session; `{plan: monthly\|annual}`; price from `STRIPE_PRICE_MONTHLY/ANNUAL` (`:259-262`); `mode:"subscription"`, `client_reference_id=userId`, `customer_email`, success `/account?subscribed=1` (`:272-279`) | **REUSE (pattern) + BUILD-NEW handler** | New `createTrialCheckoutHandler` (email-first, no session required, `trial_period_days:7`, variant price, `payment_method_collection:"always"`). Legacy handler untouched for rollback + Play parity. |
| `handlers.ts` — webhook | `applyStripeEvent` (`:357-448`): `checkout.session.completed` payment-mode → `applyPantryCheckout` (`:367-371`); subscription upsert hardcodes `status:"active"` (`:390-409`); `customer.subscription.updated/deleted` via `mapStripeStatus` (`:413-431`) which maps `trialing→"active"` (`:519-521`); `charge.refunded` → pantry cancel (`:434-447`) | **MODIFY** | Distinguish `trialing`; store `priceVariant`; add `invoice.paid` branch (trial→active = the conversion event); keep idempotency via `onConflictDoUpdate` on `providerRef` (`:406-409`). Pantry branch and Play handlers (`:111-236`) byte-identical. |
| `applyPantryCheckout` | `:450-508` — keys on `mode:"payment"` + `STRIPE_PRICE_PANTRY` line item, idempotent on `stripeSessionId` (`:489`), mints claim token, sends intake email | **REUSE-AS-IS** | An in-app `mode:"payment"` Checkout with the same price flows through this branch with **zero backend change**. |
| Stripe route wrappers | `app/api/billing/stripe/{checkout,portal,webhook}/route.ts` — 4-line wrappers | **REUSE (pattern)** | New wrappers follow the same 4-line shape. |
| `components/paywall-card.tsx` | Soft paywall; Play branch (`:27-68`); Stripe branch 401→`/signin` (`:76-79`); "Free keeps working: five checks a day" (`:103-107`); hardcoded `$12.99/mo`, `$99.99/yr` (`:118`, `:129`) | **REUSE-AS-IS (legacy mode only)** | Untouched. Rendered only when `PAYWALL_MODE=legacy`. Trial mode renders the new `TrialWall`. |
| `app/subscribe/page.tsx` | Static shell: "The check stays free, every day." (`:16-20`) + `<PaywallCard/>` | **MODIFY** | Becomes mode-aware: trial → multi-step `TrialWall` (value → proof → price, per handoff §8's multi-page-paywall borrow); legacy → existing content unchanged. |
| Price env vars | `STRIPE_PRICE_MONTHLY` (`handlers.ts:261`), `STRIPE_PRICE_ANNUAL` (`:262,397`), `STRIPE_PRICE_PANTRY` (`:457`) | **MODIFY (extend)** | Add `STRIPE_PRICE_MONTHLY_999/1299/1999` + `TRIAL_PRICE_VARIANT` + `PAYWALL_MODE`. **Finding: the connected Stripe account ("Vendoval", `acct_14W8GFKweWSWjefk`, livemode) contains NO Revora products/prices at all** — no monthly, no annual, no pantry. Provisioning is Phase 2 work (Stripe MCP), not configuration. |
| Billing portal / cancel | `createStripePortalHandler` (`:287-325`); account page "Manage or cancel billing" button (`app/account/page.tsx:161-168`) | **REUSE + BUILD-NEW** | Portal stays for card management. One-tap cancel = new direct `cancel_at_period_end` endpoint + HMAC-signed email token (portal is not "one tap" from an email). |
| Play/TWA billing | `lib/client/digital-goods.ts` (SKUs `:9-12`), `lib/server/play-api.ts`, `handlers.ts:111-236`, RTDN | **REUSE-AS-IS (frozen)** | Deferred per decision. Regression tests must keep passing unchanged. |

### 1.3 Auth & profile

| Area | Current behavior (evidence) | Verdict | Note |
|---|---|---|---|
| `auth.ts` | Auth.js v5, Resend magic link (`:40-81`), DB sessions (`:32`), DrizzleAdapter (`:20-27`), `AUTH_EMAIL_STUB_DIR` test seam (`:47-60`), pages `/signin` + `/signin/check-email` (`:39`) | **REUSE-AS-IS** | Trial start reuses `signIn("resend", {redirect:false, redirectTo})` from the new trial route — link arrives at trial start, doubling as the account-creation moment. |
| `middleware.ts` | NOT auth — abuse/cost gate on `POST /api/check` only (`:126`, `:74-121`) | **REUSE-AS-IS** | Stays the anonymous-taster abuse backstop. |
| `app/signin/*` | Email-only form; `redirectTo` default `/welcome`, open-redirect-sanitized (`page.tsx:20-23,42-48`) | **REUSE-AS-IS** | |
| `app/welcome/page.tsx` | First-sign-in profile completion: A1C (prefilled from `profileStore`, `:47`), blocking Art. 9 consent (`:172-191`), timezone (`:82-84`); POST `/api/profile` (`:76-86`); migrates local history (`:96-105`) | **REUSE-AS-IS** | Account timing change does NOT move consent/A1C — those stay at first sign-in. Trial users land here from the magic link (`redirectTo=/welcome`). |
| `app/api/profile/route.ts` | GET band/tz/nudge (`:40-61`); POST validates consent + in-scope A1C, encrypts (`:63-128`); PATCH nudge (`:139-167`) | **REUSE-AS-IS** | |
| `lib/server/session.ts` | `getSessionInfo(): {userId, email} \| null` | **REUSE-AS-IS** | |

### 1.4 Onboarding & core action

| Area | Current behavior (evidence) | Verdict | Note |
|---|---|---|---|
| `app/page.tsx` | Static server component; no first-run branching, no gating (`:6-34`); form + `<DailyLoop/>` | **MODIFY (one line)** | Mount a client `<FirstRunGate/>` that redirects brand-new visitors to `/onboarding`. |
| `app/onboarding/page.tsx` | 4-step tour (welcome→a1c→expectations→daily_loop, `Step` at `:21`); **orphaned** — only link is `components/daily-loop.tsx:77` in the empty state; `finish()` (`:56-62`) saves A1C to `profileStore` + `router.push("/")`; final button "Check my first meal" does NOT start a check (`:206-213`) | **MODIFY** | Becomes the real first-run: add skippable segmentation-chip step + guided-first-check step with **oatmeal / banana / orange juice** chips (hand off via the existing `revora.recheck` sessionStorage pattern, `food-check-form.tsx:45-47`). Carve-out for the North Star line already exists in the claims test (`claims-boundary-copy.test.ts:75-84`). |
| `components/food-check-form.tsx` | Textarea + A1C input; prefills A1C from `profileStore` (`:56`) and food from `revora.recheck` (`:45-47,54`); no chips exist anywhere (verified repo-wide) | **MODIFY** | Taster gate before submit (device-local); `taster_check` event after result; A1C already single-sourced via profileStore prefill. |
| `components/daily-loop.tsx` | First-run branching lives here: `!hasHistory` empty state (`:72-84`) with the only `/onboarding` link (`:77`) | **MODIFY** | Day-1 first-win treatment (calm, per new DESIGN.md pattern) after the first check. |
| `components/result-card.tsx` | `RISK_LABELS = {SAFE:"Clear", MODERATE:"Be careful", HIGH:"Hold off"}` (`:7-11`); renders `adjustment` (`:46`), `swap` (`:51`), `sequencingTip` (`:56`), `postMealAction` (`:61`); upsell branch (`:90-107`) | **MODIFY** | Render new `keepMost` line; trial-mode upsell copy; MODERATE/HIGH pantry entry-point link. |
| `lib/client/profile-store.ts` | `revora.profile.v1` = `{a1c, onboardedAt}` (`:6-11`) | **REUSE-AS-IS** | |
| `lib/client/history-store.ts` | `revora.history.v1`, 500-cap (`:28,:31`) | **REUSE-AS-IS** | `historyStore.all().length === 0` = first-run signal. |
| `lib/client/check.ts` | 402→upsell normalization (`:79-97`) | **REUSE-AS-IS** | Transport shape reused for the hard wall. |
| Taster state | **Does not exist** — no first-seen timestamp, no 10-check counter | **BUILD-NEW** | `lib/client/taster-store.ts` (`revora.taster.v1`), mirroring profile-store's shape. |

### 1.5 Result engine (safety-frozen)

| Area | Current behavior (evidence) | Verdict | Note |
|---|---|---|---|
| `lib/revora/coach-outputs.ts` | `CoachOutputs = {sequencingTip, postMealAction}` (`:20-23`); static phrasebank (`:25-29`); MODERATE/HIGH only, SAFE gets nothing (`:31-39`); route-layer `COACH_FIELDS`/`CheckApiResponseSchema` (`:43-56`) | **MODIFY (additive)** | The designed seam for "Enjoy it anyway": add deterministic `keepMost: string \| null`, same gating. Already in the claims-CI scan list (`claims-boundary-copy.test.ts:64`). |
| `lib/revora/postprocess.ts` | Floors, one-sentence asserts, SAFE guards, swap-shape checks (`:32-237`) | **REUSE-AS-IS (frozen)** | No changes. |
| `lib/revora/schemas.ts` | `risk ∈ SAFE\|MODERATE\|HIGH` (`:23`); singular nullable `adjustment`/`swap` (`:60-61`, `:163-164`) | **REUSE-AS-IS (frozen)** | `keepMost` lives in the route layer, NOT the engine schema. |
| `lib/revora/prompt.ts`, `a1c.ts`, `fallback.ts` | Prompt already requires one adjustment + one swap for MODERATE/HIGH (`prompt.ts:43`); `routeA1C` bands (`a1c.ts:40-83`) | **REUSE-AS-IS (frozen)** | |

### 1.6 Pantry pipeline

| Area | Current behavior (evidence) | Verdict | Note |
|---|---|---|---|
| Landing page | **`app/pantry/page.tsx` does not exist**; zero user-facing `/pantry` links anywhere (verified) | **BUILD-NEW** | Landing + sample report + CTA. The handoff calls this "the real missing piece" (§4). |
| Purchase path | External Stripe Payment Link only; **no pantry product/price exists in the Stripe account** (verified via Stripe API) — so today there is no working purchase path at all | **BUILD-NEW** | In-app `mode:"payment"` checkout handler + `/pantry/thanks` success page. Webhook side reused unchanged. |
| Claim/intake/confirm/process/report/sweep/admin | Fully built & tested: `app/pantry/claim/route.ts` (token possession binding `:33-51`), `app/pantry/intake/page.tsx`, `app/api/pantry/{submit,confirm,process,upload}`, `lib/server/pantry/*` (lease `:78-98`, sweep self-heal), `app/report/[id]/page.tsx` (owner-only), `app/admin/pantry/*` | **REUSE-AS-IS** | Do not touch. Entry: intake email → claim link. |
| Entry points | None from the main app | **BUILD-NEW** | (1) wall-decline catch on `/subscribe?declined=1`; (2) post Be-careful/Hold-off link in result-card. Never in onboarding or the A1C boundary screen (handoff §4). |
| `lib/server/pantry/emails.ts` | Intake + report templates (`:3-40`) | **REUSE-AS-IS** | Gap: not in the claims-CI `COPY_FILES` scan — add it (Phase 1). |

### 1.7 Data

| Area | Current behavior (evidence) | Verdict | Note |
|---|---|---|---|
| `lib/server/db/schema.ts` | `subscriptions.status ∈ active\|canceled\|grace\|expired\|refunded` (`:152-154`, check `:168-172`); `profiles`, `checks`, pantry tables | **MODIFY** | Migration 0002: add `'trialing'` to the status check, add nullable `pre_charge_email_sent_at`, `price_variant` columns. |
| `drizzle/` | Exactly 2 migrations: `0000_add-bai-prompted.sql`, `0001_pantry-review.sql` | **MODIFY (add 0002)** | Additive/nullable only → reversible. |

### 1.8 Design & claims

| Area | Current behavior (evidence) | Verdict | Note |
|---|---|---|---|
| `DESIGN.md` | Canonical; new patterns require editing it FIRST (`DESIGN.md:60`); no chip or first-win pattern exists (chips radius 999px exists in the radius scale `:46`) | **MODIFY** | Add §selectable-chip + §Day-1/first-win before any UI phase. |
| `app/globals.css` | Class vocabulary per DESIGN.md | **MODIFY (additive)** | `.chip-row`/`.selectable-chip` + `.first-win` styles, tokens only. |
| `tests/unit/revora/claims-boundary-copy.test.ts` | Scans `COPY_FILES` (`:37-68`) + carve-out for the North Star (`:75-84`); banned families `:14-25` | **MODIFY (extend)** | Every new user-facing file gets appended to `COPY_FILES`. This is the per-phase claims checkpoint mechanism. |

### 1.9 Instrumentation

| Area | Current behavior (evidence) | Verdict | Note |
|---|---|---|---|
| `lib/client/analytics.ts` | Umami via `window.umami.track` (`app/layout.tsx:39-46`); typed closed union + runtime allowlist (`:19-47`); bounded-enum props by design (`:3-13`) | **MODIFY (extend union)** | Add taster/wall/trial/pantry events. |
| Existing events (all call sites) | `check_completed` (`food-check-form.tsx:132`), `onboarding_completed` (`onboarding/page.tsx:60`), `signin_completed` (`welcome/page.tsx:108`), `paywall_viewed` (`paywall-card.tsx:25`), `subscribe_started` (`paywall-card.tsx:42`), `subscribe_completed` (`account/page.tsx:36`), `deletion_completed` (`account/page.tsx:114`); `nudge_opened` declared but never fired | **REUSE** | Trial→paid conversion cannot be a client event (webhook-side) → server telemetry. |
| `lib/revora/telemetry.ts` | `emitSafeEvent` → schema-validated `console.info` JSON (`:20-23`), queryable in Vercel logs | **REUSE (pattern) + BUILD-NEW** | New `lib/server/billing/telemetry.ts` with billing event names + `priceVariant` prop; same console-JSON transport. `ponytail:` log-based server metrics; upgrade to a real sink post-launch if log querying hurts. |
| Server events table | None (verified) | **skip** | Not needed for launch; subscriptions table + price_variant column is the conversion source of truth. |

## 2. Gaps vs. the handoff (what must be built/changed)

What the handoff requires that **does not exist today**:

1. **Taster state machine** — no first-seen timestamp, no 10-check counter, no `taster/trialing/premium/lapsed` states anywhere. Today: 5/day forever for signed-in free users; unlimited-ish for guests (IP rate limit only).
2. **Hard wall** — today's 402 is a soft "come back tomorrow" (`app/api/check/route.ts:54-55`) and only fires for signed-in users.
3. **Stripe trial** — no `trial_period_days` anywhere; webhook maps `trialing→active` losing the distinction (`handlers.ts:519-521`); no `invoice.paid` handling; no trial-conversion signal.
4. **Account at trial start** — today account creation happens at `/signin`→`/welcome`, decoupled from payment; checkout requires a session (`handlers.ts:249-251`).
5. **2-day pre-charge email** — no billing emails exist at all (only magic-link + pantry intake/report).
6. **One-tap cancel** — only the Stripe portal redirect (`account/page.tsx:161-168`); nothing reachable in one tap from an email.
7. **Pricing ladder / variants** — single hardcoded `$12.99` display (`paywall-card.tsx:118`) + one env price; no variant plumbing, no per-cohort assignment, no variant recorded on subscriptions.
8. **Stripe products/prices** — **none exist in the connected account** (verified live): `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_PANTRY` reference nothing. The documented pantry Payment Link cannot exist on this account either.
9. **Pantry landing + in-app purchase** — no `app/pantry/page.tsx`, no in-app checkout, zero entry links from the app.
10. **Guided first check with betrayal chips** — no chips exist; `/onboarding` is orphaned (single empty-state link, `daily-loop.tsx:77`); final tour button doesn't actually start a check.
11. **"Enjoy it anyway"** — no keep-most/set-aside output; `adjustment`/`swap` are singular LLM fields; the deterministic coach-outputs seam has only sequencing/post-meal phrases.
12. **Funnel instrumentation** — no taster/wall/trial/pantry events; no server-side conversion events; pantry funnel completely un-instrumented.
13. **Feature flag for the paywall** — no flag infra beyond the launch-mode kill switch (`lib/revora/launch-controls.ts`); `PAYWALL_MODE` must be introduced.
14. **DESIGN.md patterns** — selectable-chip and Day-1/first-win treatments don't exist yet and must be added to DESIGN.md first, per its own rule.

**Conflicts flagged (docs win, none silently deviated):**
- The 2026-07-04 handoff says a pantry Payment Link exists/was founder-created; the connected Stripe account has no such product. Treated as "must provision" (Phase 2) + open question OQ-1.
- `docs/adr/billing.md:28-30` documents the "5 checks/day free tier" — superseded by the 2026-07-05 handoff Decision D; ADR gets an amendment note in Phase 4 (docs task), not a rewrite.

## 3. Architecture decisions

### 3.1 Entitlement state machine

```
                    (device-local, anonymous)          (server-side, subscriptions table)
  first visit ──▶ taster: Day-1, ≤10 checks ──wall──▶ trialing (card on file, unlimited)
                        │                                   │ invoice.paid
                        │ Day 2+ or 11th check              ▼
                        └────────── HARD WALL          premium (active/grace)
                                                            │ expired/refunded/period end
                                                            ▼
                                                        lapsed ──▶ HARD WALL (re-subscribe)
```

- **Day 1 definition (anonymous):** first-seen **local calendar day**, stamped in `localStorage["revora.taster.v1"] = {firstDay: "YYYY-MM-DD", used: n}` on the first check. The taster is *available* iff `todayLocal() === firstDay && used < 10`. Day 2+ or the 11th check → wall. Local (not UTC) day matches the user's lived "Day 1".
- **Enforcement split:** anonymous = client-side only (`ponytail:` clear-storage = reset; accepted for a taster — the model spend is bounded by the existing Upstash IP rate limit + global daily cap in `middleware.ts`; upgrade path = server-side device fingerprint/first-seen cookie if abuse shows in data). Signed-in = server-side hard 402 in `/api/check` when not entitled (`trialing`/`premium`).
- **Server states** derive from the existing `subscriptions` table — no new table: `trialing` (new status, valid period) → `status:"trialing"`; `active/grace/canceled` with valid period → `"premium"`; rows exist but none valid → `"lapsed"`; no rows → `"none"`. `tier` stays (`trialing` ⇒ `tier:"premium"`) so every existing consumer keeps working.
- **Feature flag:** `PAYWALL_MODE` env (`legacy` default, `trial`). Server reads it directly; clients read it from the new public `GET /api/paywall` (single source — avoids `NEXT_PUBLIC_*` drift). Rollback = set `legacy`, redeploy. `ponytail:` env-var flag needs a redeploy to flip; Edge-Config flag (launch-controls pattern) is the upgrade if instant toggles are ever needed.

### 3.2 Stripe trial + account timing (email-first)

Wall → one inline email field → `POST /api/trial/start {email}`:
1. Find-or-create the `users` row by email (the DrizzleAdapter's `getUserByEmail` then finds it on magic-link sign-in — compatible with Auth.js's own `createUser`).
2. Send the magic link now via `signIn("resend", {email, redirect:false, redirectTo:"/welcome?trial=1"})` — reuses the exact existing auth path; the email doubles as account recovery if the card step is abandoned.
3. Create Checkout: `mode:"subscription"`, variant price, `subscription_data:{trial_period_days:7, metadata:{price_variant}}`, `payment_method_collection:"always"` (card required at trial start), `client_reference_id=userId` (the existing webhook already keys on this, `handlers.ts:374`), `customer_email=email`, `success_url=/trial/started`, `cancel_url=/subscribe?declined=1` (the pantry catch).
4. Webhook `checkout.session.completed` upserts the subscription with `status:"trialing"`, `currentPeriodEnd=trial_end`, `priceVariant`.
5. User returns to `/trial/started` ("Your free week is active — tap the sign-in link we emailed to unlock every device") → magic link → `/welcome` (existing consent + A1C, unchanged) → home, unlimited.

Why email-first (vs. account-on-webhook): reuses `signIn` in a normal request context (webhooks have no request context for Auth.js), keeps the webhook's user handling byte-identical, and gives the funnel a `trial_checkout_started` event with the variant attached. Risk (verify in Phase 2 task 2.6): `signIn(..., {redirect:false})` inside a route handler; fallback documented in that task (insert a `verification_tokens` row + build the callback URL by hand — same trust model).

**Webhook lifecycle:** `checkout.session.completed` → `trialing`; `invoice.paid` → `active` (+ server `trial_converted` event — this is the **new-only** conversion signal); `customer.subscription.updated` → map `trialing→trialing`, `past_due→grace`, `cancel_at_period_end` while trialing keeps `trialing` (entitled until period end) + emits `trial_canceled`; `customer.subscription.deleted` → `expired`. All idempotent: status upserts keyed on `providerRef`, telemetry events are log lines (duplicates tolerable).

### 3.3 Trust rails: 2-day pre-charge email + one-tap cancel

- **Email scheduling:** a new cron `GET /api/cron/trial-precharge` (hourly, `CRON_SECRET`-gated like the other three, `vercel.json`), selecting `status='trialing' AND pre_charge_email_sent_at IS NULL AND current_period_end BETWEEN now() AND now()+48h`. Deterministic, testable, independent of Stripe's `trial_will_end` timing (which fires at 3 days, not 2). Sends via the existing `lib/server/email.ts` `sendEmail`, stamps `pre_charge_email_sent_at`, upserts `cron_heartbeat("trial-precharge")`. Email states the exact date and amount and contains the one-tap cancel link.
- **One-tap cancel:** stateless HMAC token (`node:crypto`, no new column): `base64url(subRowId.exp).hmacSHA256(AUTH_SECRET)`. `GET /api/billing/cancel?token=...` verifies → `stripe.subscriptions.update(providerRef, {cancel_at_period_end: true})` → redirects to a calm public confirmation page `/canceled` ("You won't be charged. Your access runs to <date>."). Works signed-out, straight from the email — genuinely one tap. A signed-in `POST /api/billing/cancel` powers a visible cancel button on `/account` (no portal hop). Portal stays for card management. `ponytail:` the token's only power is cancel-at-period-end — worst case someone cancels a trial, never charges anyone; expiry = period end + 30 days.

### 3.4 Pricing-test harness

- `TRIAL_PRICE_VARIANT ∈ {999,1299,1999}` (default `1299`) + `STRIPE_PRICE_MONTHLY_999/1299/1999` env vars. One variant per deployment window = one price per community/cohort (matched-cohort requirement; no per-user randomization, so no two prices visible at once).
- Display price and Stripe price ID both resolve server-side from the variant (`lib/server/pricing.ts`); the wall fetches `GET /api/paywall` → `{mode, variant, priceDisplay}` — one source, no drift.
- The variant is stamped onto the subscription row (`price_variant` column) at webhook time and onto every wall/trial event, so **new-only** trial→paid conversion per cohort is a SQL query over `subscriptions` (rows with `price_variant=X`, started trialing in window, now `active`) — renewals never pollute it (a row converts once).

### 3.5 "Enjoy it anyway" (Approach B)

Deterministic route-layer enrichment — the engine is untouched. Add `keepMost: string | null` to `CoachOutputs` (`lib/revora/coach-outputs.ts`), derived exactly like `sequencingTip`: static claims-audited phrase, MODERATE/HIGH only, SAFE stays untouched ("no piling on"). Rendered in `result-card.tsx` as a DO-framed line alongside the existing swap. Copy is qualitative-only (no cups/grams/numbers), never "skip/avoid" (the coach-outputs tone tests already ban "must/never/don't/avoid" — extend them to the new field). The **claims-ledger assignment precedes any code** (Phase 7 task 7.1): 8–10 candidate phrases through `docs/safety/copy-ledger.md` + the CI scan; if none survive, the feature stops there (the handoff's stated feasibility gate).

### 3.6 Pantry in-app payment

New `createPantryCheckoutHandler` (`mode:"payment"`, `STRIPE_PRICE_PANTRY` line item, no session required — buyers may be anonymous; Checkout collects email). It lands in the **existing, unchanged** `applyPantryCheckout` webhook branch (keys on mode+price, idempotent on `stripeSessionId`, sends the intake email). In-app checkout > Payment Link stopgap because: same webhook either way, but in-app gives a `/pantry/thanks` success page, funnel events, and no dashboard dependency — for ~40 lines reusing the checkout pattern. The Payment Link remains a valid manual fallback for Reddit posts (dashboard-created, same price ID).

---

## 4. Phased plan

Phase ordering rationale: design-system rules first (Phase 0, DESIGN.md's own requirement), instrumentation before anything it must measure (Phase 1), Stripe/DB foundation while everything is still dormant (Phase 2), trust rails before the wall can exist (Phase 3 — hard prerequisite of Phase 4), then the wall (Phase 4, flag stays `legacy` in prod), then conversion-adjacent UX (Phases 5–7), then launch (Phase 8). Every phase is independently shippable and leaves production behavior unchanged until the Phase 8 flag flip.

---

### Phase 0 — DESIGN.md extensions (selectable-chip + Day-1/first-win)

**Goal:** the two new UI patterns exist in the canonical design system before any screen uses them (DESIGN.md's own rule: new patterns edit DESIGN.md first).

**Files:** Modify: `DESIGN.md`, `app/globals.css` · **Migrations:** none · **Claims checkpoint:** none (no user-facing strings; pattern docs only).

#### Task 0.1: Document the two patterns in DESIGN.md

**Files:**
- Modify: `DESIGN.md` (after the "Class vocabulary" section)

**Interfaces:**
- Produces: class names `.chip-row`, `.selectable-chip`, `.first-win` that Phases 4–5 consume.

- [ ] **Step 1: Add the two pattern sections to DESIGN.md**

Append after the "Class vocabulary (reuse before writing CSS)" section:

```markdown
## Selectable chips (added 2026-07-05, launch-readiness plan)

For one-tap choices: segmentation taps, meal-suggestion chips. Assembly:
`.chip-row` (flex, 8px gap, wraps) containing `<button type="button" class="selectable-chip">`.

- Shape: 999px radius (existing pill scale), 1px `--border-strong` border,
  `--surface` background, `--text-body` text, 16px, 44px min-height (touch rule).
- Selected state: `aria-pressed="true"` + `--accent` background,
  `--accent-contrast` text. Selection is a border/fill change ONLY — no icons,
  no checkmarks, no color beyond the accent (risk colors stay semantic).
- Chips are buttons, never divs. Focus ring inherits the global `:focus-visible`.
- Max one chip-row per screen section; chips carry 1–3 word labels, never sentences.

## Day-1 / first-win treatment (added 2026-07-05, launch-readiness plan)

The calm acknowledgment after a user's first completed check. Rules:

- It is typography, not a celebration: a `.first-win` block = one
  `status-eyebrow` ("Day 1") + one `page-copy` sentence. No confetti, no
  animation, no emoji, no exclamation marks (verdict-adjacent surface).
- Uses `--surface-muted` inset (14px radius, nested-card scale) inside the
  daily-loop card — it is part of the document flow, not a toast/modal.
- Appears at most once per day, only when the streak is new (streak === 1).
- The streak chip (`streak-chip`) remains the ONLY ongoing progress ornament.
```

- [ ] **Step 2: Add the CSS to `app/globals.css`** (tokens + radius scale only, one new shadowless pattern)

```css
/* Selectable chips (DESIGN.md §Selectable chips) */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selectable-chip {
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-body);
  font-size: 16px;
  padding: 10px 18px;
  min-height: 44px;
  cursor: pointer;
}

.selectable-chip[aria-pressed="true"] {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-contrast);
}

/* Day-1 / first-win treatment (DESIGN.md §Day-1) */
.first-win {
  background: var(--surface-muted);
  border-radius: 14px;
  padding: 14px 16px;
}
```

- [ ] **Step 3: Verify no visual regressions** — Run: `npx vitest run tests/unit` → all existing tests PASS (CSS is additive; no component uses the classes yet).

- [ ] **Step 4: Commit**

```bash
git add DESIGN.md app/globals.css
git commit -m "docs(design): selectable-chip + Day-1 first-win patterns (DESIGN.md first, per its rule)"
```

**Acceptance criteria:** DESIGN.md documents both patterns with the constraints above; the classes exist in globals.css; no component/behavior change.
**Rollback:** revert the commit — nothing consumes the classes yet.

---

### Phase 1 — Instrumentation plumbing (events land before what they measure)

**Goal:** every funnel event the launch must measure is *definable and type-safe* before the features exist: extended client event union, server-side billing telemetry, and the claims-CI scan extended to cover the files this plan will create.

**Files:** Modify: `lib/client/analytics.ts`, `tests/unit/client/analytics.test.ts` (or create if absent — check `tests/unit/` layout at execution), `tests/unit/revora/claims-boundary-copy.test.ts` · Create: `lib/server/billing/telemetry.ts`, `tests/unit/server/billing-telemetry.test.ts` · **Migrations:** none · **Claims checkpoint:** none (no user-facing strings — event names are not copy).

#### Task 1.1: Extend the client analytics union

**Files:**
- Modify: `lib/client/analytics.ts:19-47`
- Test: extend the existing analytics unit test (locate via `grep -r "ALLOWED_EVENT_NAMES\|analytics" tests/unit --include="*.test.ts" -l`; if none exists, create `tests/unit/client/analytics.test.ts`)

**Interfaces:**
- Produces (consumed by Phases 4–6): event names `taster_check` `{used: number}`, `wall_viewed` `{variant: PriceVariant}`, `trial_checkout_started` `{variant: PriceVariant}`, `trial_started` `{variant: PriceVariant}`, `pantry_viewed` `{source: "landing" | "wall_decline" | "result_card"}`, `pantry_checkout_started` — where `PriceVariant = "999" | "1299" | "1999"`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { track } from "../../../lib/client/analytics";

describe("launch funnel events", () => {
  it.each([
    [{ name: "taster_check", props: { used: 3 } }],
    [{ name: "wall_viewed", props: { variant: "1299" } }],
    [{ name: "trial_checkout_started", props: { variant: "1299" } }],
    [{ name: "trial_started", props: { variant: "999" } }],
    [{ name: "pantry_viewed", props: { source: "wall_decline" } }],
    [{ name: "pantry_checkout_started" }]
  ] as const)("forwards %j to umami", (event) => {
    const umami = { track: vi.fn() };
    track(event as never, { umami });
    expect(umami.track).toHaveBeenCalledWith(event.name, "props" in event ? event.props : undefined);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails** — Run: `npx vitest run tests/unit/client/analytics.test.ts` → FAIL (events dropped by the runtime allowlist / type error).

- [ ] **Step 3: Implement** — in `lib/client/analytics.ts`, extend the `AnalyticsEvent` union (after line 34) and `ALLOWED_EVENT_NAMES` (lines 38-47):

```ts
export type PriceVariant = "999" | "1299" | "1999";

// … appended to the AnalyticsEvent union:
  | { name: "taster_check"; props: { used: number } }
  | { name: "wall_viewed"; props: { variant: PriceVariant } }
  | { name: "trial_checkout_started"; props: { variant: PriceVariant } }
  | { name: "trial_started"; props: { variant: PriceVariant } }
  | { name: "pantry_viewed"; props: { source: "landing" | "wall_decline" | "result_card" } }
  | { name: "pantry_checkout_started" };
```

and add the six names to `ALLOWED_EVENT_NAMES`. Keep the file's bounded-props rule: numbers and closed string enums only, no free-form strings (the design note at `analytics.ts:3-13`).

- [ ] **Step 4: Run tests** — `npx vitest run tests/unit/client/analytics.test.ts` → PASS. Then `npx vitest run tests/unit` → all PASS.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(analytics): taster/wall/trial/pantry funnel events in the typed union"`

#### Task 1.2: Server-side billing telemetry (webhook-side events)

**Files:**
- Create: `lib/server/billing/telemetry.ts`
- Test: `tests/unit/server/billing-telemetry.test.ts`

**Interfaces:**
- Produces: `emitBillingEvent(event: BillingTelemetryEvent): void` with `name ∈ {"trial_started","trial_converted","trial_canceled","pantry_purchased","precharge_email_sent"}`, optional `priceVariant ∈ {"999","1299","1999"}`, `environment` derived like `app/api/check/route.ts:218-235`. Consumed by Phases 2, 3, 6 webhook/cron code.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { emitBillingEvent } from "../../../lib/server/billing/telemetry";

describe("emitBillingEvent", () => {
  it("logs schema-valid JSON to console.info", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    emitBillingEvent({ name: "trial_converted", priceVariant: "1299" });
    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged).toMatchObject({ name: "trial_converted", priceVariant: "1299" });
    expect(logged.environment).toBeDefined();
    spy.mockRestore();
  });

  it("rejects unknown event names", () => {
    expect(() =>
      emitBillingEvent({ name: "made_up" } as never)
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run to fail** — `npx vitest run tests/unit/server/billing-telemetry.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement** `lib/server/billing/telemetry.ts` — mirror `lib/revora/telemetry.ts:1-23` exactly (zod strict schema → `console.info(JSON.stringify(...))`):

```ts
import { z } from "zod";

// Same transport as lib/revora/telemetry.ts: schema-validated console JSON,
// queryable in Vercel logs. No PII by construction — names + bounded enums only.
// ponytail: log-based metrics; upgrade to a real sink post-launch if log
// querying becomes the bottleneck for the §3 price-test readouts.
const BillingTelemetryEventSchema = z
  .object({
    name: z.enum([
      "trial_started",
      "trial_converted",
      "trial_canceled",
      "pantry_purchased",
      "precharge_email_sent"
    ]),
    priceVariant: z.enum(["999", "1299", "1999"]).optional(),
    environment: z
      .enum(["preview", "production", "development", "test"])
      .optional()
  })
  .strict();

export type BillingTelemetryEvent = z.infer<typeof BillingTelemetryEventSchema>;

function currentEnvironment(): BillingTelemetryEvent["environment"] {
  if (process.env.NODE_ENV === "test") return "test";
  switch (process.env.VERCEL_ENV) {
    case "preview":
      return "preview";
    case "production":
      return "production";
    case "development":
      return "development";
    default:
      return process.env.NODE_ENV === "production" ? "production" : "development";
  }
}

export function emitBillingEvent(event: BillingTelemetryEvent): void {
  const safe = BillingTelemetryEventSchema.parse({
    environment: currentEnvironment(),
    ...event
  });
  console.info(JSON.stringify(safe));
}
```

- [ ] **Step 4: Run tests** — `npx vitest run tests/unit/server/billing-telemetry.test.ts` → PASS.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(telemetry): server-side billing events (trial/pantry funnel, console-JSON transport)"`

#### Task 1.3: Extend the claims-CI scan to the pantry email templates (existing gap)

**Files:**
- Modify: `tests/unit/revora/claims-boundary-copy.test.ts:37-68` (`COPY_FILES`)

- [ ] **Step 1: Add `"lib/server/pantry/emails.ts"` to `COPY_FILES`** (it emails user-facing copy today but is unscanned — found in the Phase-1 audit). Later phases append their own new files as they create them; this task establishes the precedent.

- [ ] **Step 2: Run** — `npx vitest run tests/unit/revora/claims-boundary-copy.test.ts` → PASS expected (templates use "Enjoy freely / Worth a tweak / Handle with care" language). If it FAILS, the failing string is a real pre-existing claims leak: fix the template copy minimally and add a ledger row before proceeding.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "test(claims): scan pantry email templates in the claims-boundary audit"`

**Phase 1 acceptance criteria:** the six client events + five server events compile, pass tests, and are documented here; claims scan covers pantry emails; zero user-visible change.
**Rollback:** revert commits — nothing consumes the new events yet.

---

### Phase 2 — Stripe & data foundation (dormant until the wall exists)

**Goal:** everything money-shaped exists and is tested — Stripe products/prices provisioned, DB migration, entitlement states, webhook trial lifecycle, pricing module, public paywall-config endpoint, and the trial-start route — with production behavior unchanged (no UI reaches any of it yet).

**Files:** see tasks · **Migrations:** `drizzle/0002_trial-billing.sql` · **Claims checkpoint:** Task 2.7 (`/trial/started` page copy → ledger + CI scan).

#### Task 2.1: Provision Stripe products, prices, and portal (Stripe MCP + human items)

**Files:** none (Stripe account state + Vercel env vars). Document results in `docs/handoff/human-actions-required.md`.

**Interfaces:**
- Produces: live price IDs for env vars `STRIPE_PRICE_MONTHLY_999`, `STRIPE_PRICE_MONTHLY_1299`, `STRIPE_PRICE_MONTHLY_1999`, `STRIPE_PRICE_PANTRY` (and `STRIPE_PRICE_MONTHLY` ← the 1299 ID for the legacy handler's 503 guard).

- [ ] **Step 1: Create the subscription product + 3 prices** (Stripe MCP `stripe_api_write`): product `Revora Premium` (`metadata: {app: "revora"}`, `statement_descriptor: "REVORA"`), then three recurring monthly USD prices: 999¢ (`lookup_key: revora_monthly_999`), 1299¢ (`revora_monthly_1299`), 1999¢ (`revora_monthly_1999`), each `metadata: {price_variant: "<n>"}`. **Do NOT set `trial_period_days` on the price** — the trial is set per-Checkout-Session (`subscription_data.trial_period_days: 7`) so legacy checkout stays trial-free.
- [ ] **Step 2: Create the pantry product + price**: product `Revora Pantry Review` (`statement_descriptor: "REVORA PANTRY"`), one-time USD price 4900¢ (`lookup_key: revora_pantry_49`). ($49 per the 2026-07-04 handoff; the $25 pre-order price is a founder dashboard action, out of code scope.)
- [ ] **Step 3: Configure the Billing Portal** (default configuration): cancellation enabled, mode `at_period_end`, no cancellation-reason requirement (one-tap principle), payment-method update enabled.
- [ ] **Step 4: Record the webhook contract as a human action** — the endpoint `https://<prod-domain>/api/billing/stripe/webhook` must subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `charge.refunded`; `STRIPE_WEBHOOK_SECRET` set in Vercel. (Cannot be completed until the production domain is final — log it in `docs/handoff/human-actions-required.md` with the exact event list.)
- [ ] **Step 5: Set env vars** (founder/`vercel env`): the four price IDs above + `PAYWALL_MODE=legacy` + `TRIAL_PRICE_VARIANT=1299`. **⚠ OQ-1 first** (§8): the connected account is the legacy "Vendoval" livemode account with unrelated products — founder must confirm using it (with the per-product statement descriptors above) vs. creating a clean Revora account before these IDs are burned into env. **⚠ OQ-2:** provision a *test-mode* mirror of the same products for QA; QA e2e runs against test keys.
- [ ] **Step 6: Commit the doc update** — `git add docs/handoff/human-actions-required.md && git commit -m "docs(billing): stripe provisioning record + webhook/env human actions"`

#### Task 2.2: Migration 0002 — trialing status + trial columns

**Files:**
- Modify: `lib/server/db/schema.ts:152-172` (subscriptions table)
- Create: `drizzle/0002_trial-billing.sql` (via `npx drizzle-kit generate`)
- Test: extend `tests/unit/server/` schema tests (pattern: `tests/unit/server/pantry-schema.test.ts`, pglite applies real migrations via `tests/helpers/test-db.ts`)

**Interfaces:**
- Produces: `subscriptions.status` accepts `'trialing'`; nullable columns `preChargeEmailSentAt: timestamp`, `priceVariant: text` — consumed by Tasks 2.3, 2.4, 3.1.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createTestDb } from "../../helpers/test-db"; // match existing helper import style
import { schema } from "../../../lib/server/db";

describe("subscriptions trial columns (0002)", () => {
  it("accepts a trialing row with price variant", async () => {
    const db = await createTestDb();
    const [user] = await db.insert(schema.users).values({ email: "t@example.com" }).returning();
    const [row] = await db
      .insert(schema.subscriptions)
      .values({
        userId: user.id,
        provider: "stripe",
        providerRef: "sub_test_1",
        productId: "premium_monthly",
        status: "trialing",
        priceVariant: "1299",
        currentPeriodEnd: new Date(Date.now() + 7 * 86400_000),
        updatedAt: new Date()
      })
      .returning();
    expect(row.status).toBe("trialing");
    expect(row.preChargeEmailSentAt).toBeNull();
  });
});
```

- [ ] **Step 2: Run to fail** — `npx vitest run tests/unit/server/trial-schema.test.ts` → FAIL (enum/columns missing).
- [ ] **Step 3: Update `schema.ts`** — status enum becomes `["active", "trialing", "canceled", "grace", "expired", "refunded"]` (and the mirrored `check` constraint sql at `:168-172`); add:

```ts
    priceVariant: text("price_variant"),
    preChargeEmailSentAt: timestamp("pre_charge_email_sent_at", {
      withTimezone: true
    }),
```

- [ ] **Step 4: Generate the migration** — `npx drizzle-kit generate --name trial-billing`; inspect `drizzle/0002_trial-billing.sql` — it must contain ONLY: drop+re-add of `subscriptions_status_check` (now including `'trialing'`) and the two nullable `ADD COLUMN`s. Nothing destructive.
- [ ] **Step 5: Run tests** — `npx vitest run tests/unit/server` → PASS (pglite applies 0002 automatically via the helper).
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat(db): trialing status + pre-charge/price-variant columns (migration 0002, additive)"`

#### Task 2.3: Entitlement states (trialing/premium/lapsed/none)

**Files:**
- Modify: `lib/server/entitlement.ts:15-34` (type + statuses), `app/api/billing/handlers.ts:72-107` (entitlement handler response)
- Test: extend the existing entitlement unit tests (locate: `grep -rl "getEntitlement" tests/unit`)

**Interfaces:**
- Produces: `Entitlement = { tier: "free"|"premium"; source: "play"|"stripe"|null; status: "trialing"|"premium"|"lapsed"|"none" }`. `trialing` ⇒ `tier:"premium"` (unlimited). Consumed by the check route (Task 4.4) and `/api/entitlement` consumers (`app/account/page.tsx`).

- [ ] **Step 1: Write the failing tests** (extend the existing suite's fixtures):

```ts
it("returns status trialing (tier premium) for a valid trialing row", async () => {
  // insert subscriptions row: status "trialing", currentPeriodEnd = now + 5d
  const e = await getEntitlement(db, userId);
  expect(e).toMatchObject({ tier: "premium", status: "trialing", source: "stripe" });
});

it("returns status lapsed when rows exist but none valid", async () => {
  // insert row: status "expired", currentPeriodEnd in the past
  expect((await getEntitlement(db, userId)).status).toBe("lapsed");
});

it("returns status none with no rows", async () => {
  expect((await getEntitlement(db, freshUserId)).status).toBe("none");
});
```

- [ ] **Step 2: Run to fail.**
- [ ] **Step 3: Implement** in `lib/server/entitlement.ts`:
  - `PREMIUM_STATUSES = ["active", "trialing", "grace", "canceled"]` (`:34`).
  - Extend the type: `status: "trialing" | "premium" | "lapsed" | "none"`.
  - In `getEntitlement`: on the first valid row (`currentPeriodEnd > now`), return `{ tier: "premium", source: row.provider, status: row.status === "trialing" ? "trialing" : "premium" }`. Track whether *any* row was seen (`const hadRows = rows.length > 0`, but also count rows outside `PREMIUM_STATUSES`: change the query to select ALL rows for the user and filter in JS — the table is tiny per-user; keeps one query). Fall through to `{ tier: "free", source: null, status: hadRows ? "lapsed" : "none" }`. Play verify-on-read block stays byte-identical.
  - In `createEntitlementHandler` (`handlers.ts:101-105`): the spread `...entitlement` already forwards the new field — verify only.
- [ ] **Step 4: Run** — `npx vitest run tests/unit/server` → all PASS **including every pre-existing entitlement/Play test unchanged** (the do-not-break gate).
- [ ] **Step 5: Commit** — `git commit -am "feat(entitlement): trialing/premium/lapsed/none status alongside legacy tier"`

#### Task 2.4: Webhook trial lifecycle

**Files:**
- Modify: `app/api/billing/handlers.ts` — `applyStripeEvent` (`:357-448`), `mapStripeStatus` (`:510-529`)
- Test: extend `tests/unit/server/billing-routes.test.ts` (the `applyStripeEvent` direct-call pattern) — **plus the IRON RULE regression asserts: every existing subscription/pantry/Play webhook test passes unchanged.**

**Interfaces:**
- Consumes: `emitBillingEvent` (Task 1.2), migration 0002 columns.
- Produces: subscriptions rows that carry `status:"trialing"`→`"active"` transitions + `priceVariant`; `trial_started`/`trial_converted`/`trial_canceled` telemetry.

- [ ] **Step 1: Write the failing tests**

```ts
it("checkout.session.completed with a trialing subscription stores status trialing + variant", async () => {
  // stripe stub: subscriptions.retrieve → { status: "trialing", trial_end: <epoch>,
  //   items: { data: [{ price: { id: "price_1299" }, current_period_end: <epoch> }] },
  //   metadata: { price_variant: "1299" } }
  await applyStripeEvent(db, checkoutCompletedEvent, now, stripeStub);
  const [row] = await db.select().from(schema.subscriptions);
  expect(row.status).toBe("trialing");
  expect(row.priceVariant).toBe("1299");
});

it("invoice.paid flips trialing → active and emits trial_converted once", async () => { /* … */ });

it("subscription.updated with cancel_at_period_end during trial keeps status trialing and emits trial_canceled", async () => { /* … */ });

it("REGRESSION: legacy active checkout + pantry payment-mode + play verify behave identically", async () => { /* unchanged existing assertions */ });
```

- [ ] **Step 2: Run to fail.**
- [ ] **Step 3: Implement** in `applyStripeEvent`:
  - `checkout.session.completed` (subscription branch, `:390-409`): replace hardcoded `status:"active"` with `status: subscription?.status === "trialing" ? "trialing" : "active"`; `currentPeriodEnd`: prefer `subscription.trial_end` (×1000) when trialing, else the existing `item.current_period_end` logic; add `priceVariant: subscription?.metadata?.price_variant ?? null` to both insert values and the `onConflictDoUpdate` set; after insert, `emitBillingEvent({ name: "trial_started", priceVariant })` when trialing.
  - New `invoice.paid` branch: resolve `subscriptionId` from `invoice.parent?.subscription_details?.subscription ?? invoice.subscription` (**verify the field against the installed SDK version at execution** — the Stripe SDK in `package.json` decides; write the test against the stub shape that matches); load the row by `providerRef`; if `row.status === "trialing"` → update to `active`, bump `currentPeriodEnd` from the subscription item, `emitBillingEvent({ name: "trial_converted", priceVariant: row.priceVariant ?? undefined })`. If already `active` → period-end refresh only (renewals are NOT conversions — the new-only rule).
  - `customer.subscription.updated` (`:413-431`): `mapStripeStatus` gains `trialing → "trialing"` (replacing the collapse at `:519-521`); when the event object has `cancel_at_period_end === true` and the stored row didn't → `emitBillingEvent({ name: "trial_canceled", ... })` if the row was trialing. Status value for a canceled-but-running trial stays `"trialing"` (entitled until period end; `PREMIUM_STATUSES` covers it).
  - `customer.subscription.deleted` → `"expired"` (unchanged).
- [ ] **Step 4: Run the FULL billing suite** — `npx vitest run tests/unit/server` → all PASS, zero modifications to pre-existing test expectations.
- [ ] **Step 5: Commit** — `git commit -am "feat(billing): trial lifecycle in stripe webhook (trialing status, invoice.paid conversion, cancel telemetry)"`

#### Task 2.5: Pricing module + public paywall-config endpoint

**Files:**
- Create: `lib/server/pricing.ts`, `app/api/paywall/route.ts`
- Test: `tests/unit/server/pricing.test.ts`

**Interfaces:**
- Produces: `resolvePriceVariant(env?): { variant: "999"|"1299"|"1999"; priceId: string | null; display: "$9.99"|"$12.99"|"$19.99" }`; `GET /api/paywall → { mode: "legacy"|"trial", variant, priceDisplay }` (public, no session). Consumed by the wall (4.2), trial start (2.6), check route (4.4).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { resolvePriceVariant } from "../../../lib/server/pricing";

describe("resolvePriceVariant", () => {
  it("defaults to 1299", () => {
    expect(resolvePriceVariant({}).variant).toBe("1299");
    expect(resolvePriceVariant({}).display).toBe("$12.99");
  });
  it("resolves the env-selected variant and its price id", () => {
    const r = resolvePriceVariant({
      TRIAL_PRICE_VARIANT: "1999",
      STRIPE_PRICE_MONTHLY_1999: "price_x"
    });
    expect(r).toEqual({ variant: "1999", priceId: "price_x", display: "$19.99" });
  });
  it("falls back to 1299 on an unknown variant value", () => {
    expect(resolvePriceVariant({ TRIAL_PRICE_VARIANT: "699" }).variant).toBe("1299");
  });
});
```

- [ ] **Step 2: Run to fail.** — **Step 3: Implement** `lib/server/pricing.ts`:

```ts
const VARIANTS = {
  "999": { display: "$9.99", envKey: "STRIPE_PRICE_MONTHLY_999" },
  "1299": { display: "$12.99", envKey: "STRIPE_PRICE_MONTHLY_1299" },
  "1999": { display: "$19.99", envKey: "STRIPE_PRICE_MONTHLY_1999" }
} as const;

export type PriceVariant = keyof typeof VARIANTS;

// One price per deployment window (matched cohorts — never two prices to one
// community at once). The variant is an env var; display + Stripe price ID both
// derive from it here, so the wall can never show a price checkout won't charge.
export function resolvePriceVariant(
  env: NodeJS.ProcessEnv = process.env
): { variant: PriceVariant; priceId: string | null; display: string } {
  const raw = env.TRIAL_PRICE_VARIANT ?? "1299";
  const variant: PriceVariant = raw in VARIANTS ? (raw as PriceVariant) : "1299";
  return {
    variant,
    priceId: env[VARIANTS[variant].envKey] ?? null,
    display: VARIANTS[variant].display
  };
}

export function paywallMode(env: NodeJS.ProcessEnv = process.env): "legacy" | "trial" {
  return env.PAYWALL_MODE === "trial" ? "trial" : "legacy";
}
```

and `app/api/paywall/route.ts`:

```ts
import { NextResponse } from "next/server";
import { paywallMode, resolvePriceVariant } from "../../../lib/server/pricing";

export const runtime = "nodejs";

export async function GET() {
  const { variant, display } = resolvePriceVariant();
  return NextResponse.json({
    mode: paywallMode(),
    variant,
    priceDisplay: display
  });
}
```

- [ ] **Step 4: Run** — `npx vitest run tests/unit/server/pricing.test.ts` → PASS. — **Step 5: Commit** — `git commit -am "feat(pricing): env-driven price-variant resolution + public /api/paywall config"`

#### Task 2.6: Trial-start route (email-first account creation + trial checkout)

**Files:**
- Create: `app/api/trial/start/route.ts` (handler factory in `app/api/billing/handlers.ts` per house pattern: `createTrialCheckoutHandler`)
- Modify: `app/api/billing/handlers.ts` (append the new factory — legacy handlers untouched)
- Test: `tests/unit/server/trial-start.test.ts` (DI pattern: inject db/stripe/signIn stubs)

**Interfaces:**
- Consumes: `resolvePriceVariant` (2.5), `signIn` from `auth.ts`.
- Produces: `POST /api/trial/start {email} → {url}` (Stripe Checkout URL). Consumed by the wall (Task 4.2).

- [ ] **Step 1: Write the failing test**

```ts
it("creates the user, sends the magic link, and returns a trial checkout url", async () => {
  const stripeStub = { checkout: { sessions: { create: vi.fn().mockResolvedValue({ url: "https://stripe/x" }) } } };
  const sendMagicLink = vi.fn().mockResolvedValue(undefined);
  const handler = createTrialCheckoutHandler({
    db: () => db, stripeClient: () => stripeStub as never, sendMagicLink,
    env: { STRIPE_PRICE_MONTHLY_1299: "price_1299", TRIAL_PRICE_VARIANT: "1299", NEXT_PUBLIC_APP_URL: "https://app" }
  });
  const res = await handler(jsonRequest({ email: "new@example.com" }));
  expect((await res.json()).url).toBe("https://stripe/x");
  const [user] = await db.select().from(schema.users);
  expect(user.email).toBe("new@example.com");
  expect(sendMagicLink).toHaveBeenCalledWith("new@example.com");
  const call = stripeStub.checkout.sessions.create.mock.calls[0][0];
  expect(call).toMatchObject({
    mode: "subscription",
    payment_method_collection: "always",
    client_reference_id: user.id,
    customer_email: "new@example.com",
    subscription_data: { trial_period_days: 7, metadata: { price_variant: "1299" } }
  });
});

it("is idempotent for an existing user (no duplicate users row)", async () => { /* … */ });
it("400s on an invalid email; 503s when the variant price env is unset", async () => { /* … */ });
```

- [ ] **Step 2: Run to fail.** — **Step 3: Implement** `createTrialCheckoutHandler` in `handlers.ts` (appended; deps extend `BillingDeps` with `sendMagicLink?: (email: string) => Promise<void>` and `env?`):

```ts
const TrialStartSchema = z
  .object({ email: z.string().trim().toLowerCase().email().max(254) })
  .strict();

export function createTrialCheckoutHandler(
  deps: BillingDeps & {
    sendMagicLink?: (email: string) => Promise<void>;
    env?: NodeJS.ProcessEnv;
  } = {}
) {
  const db = deps.db ?? getDb;
  const stripe = deps.stripeClient ?? defaultStripe;
  const env = deps.env ?? process.env;
  const sendMagicLink =
    deps.sendMagicLink ??
    (async (email: string) => {
      // Reuses the exact existing magic-link path; the email doubles as
      // account recovery if the card step is abandoned.
      const { signIn } = await import("../../../auth");
      await signIn("resend", { email, redirect: false, redirectTo: "/welcome?trial=1" });
    });

  return async function POST(request: Request) {
    const parsed = TrialStartSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    const { variant, priceId } = resolvePriceVariant(env);
    if (!priceId) {
      return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
    }

    const email = parsed.data.email;
    // Find-or-create: the DrizzleAdapter's magic-link sign-in resolves this
    // same row via getUserByEmail, so account creation moves to trial start
    // without forking the auth model.
    const [user] =
      (await db().select().from(schema.users).where(eq(schema.users.email, email))).length > 0
        ? await db().select().from(schema.users).where(eq(schema.users.email, email))
        : await db().insert(schema.users).values({ email }).returning();

    try {
      await sendMagicLink(email);
    } catch {
      // Non-fatal: /trial/started offers a resend; checkout must not block on email.
    }

    const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const checkout = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_collection: "always",
      subscription_data: {
        trial_period_days: 7,
        metadata: { price_variant: variant }
      },
      client_reference_id: user.id,
      customer_email: email,
      success_url: `${appUrl}/trial/started`,
      cancel_url: `${appUrl}/subscribe?declined=1`
    });

    return NextResponse.json({ url: checkout.url });
  };
}
```

Route wrapper `app/api/trial/start/route.ts` = the standard 4 lines. Import `resolvePriceVariant` at the top of `handlers.ts`.

- [ ] **Step 4: Verify the `signIn` server-call assumption** — add a dev-only manual check to the task log: run `npm run dev`, `curl -X POST localhost:3000/api/trial/start -d '{"email":"you@example.com"}' -H 'content-type: application/json'` with `AUTH_EMAIL_STUB_DIR` set; confirm a stub email JSON lands on disk (the `auth.ts:47-60` seam). **If `signIn` throws outside a server-action context**, switch `sendMagicLink`'s default to the documented fallback: insert a `verification_tokens` row (`crypto.randomBytes(32)`, hashed exactly as Auth.js Resend provider does) and send the callback URL via `lib/server/email.ts` — same possession trust model; keep the DI seam so tests don't change.
- [ ] **Step 5: Run** — `npx vitest run tests/unit/server/trial-start.test.ts` → PASS; full server suite → PASS.
- [ ] **Step 6: Commit** — `git commit -am "feat(billing): email-first trial checkout (card-gated 7-day trial, account at trial start)"`

#### Task 2.7: `/trial/started` success page

**Files:**
- Create: `app/trial/started/page.tsx`
- Modify: `tests/unit/revora/claims-boundary-copy.test.ts` (`COPY_FILES` += `"app/trial/started/page.tsx"`)

**Interfaces:** consumes `track({name:"trial_started"})` (1.1) + `GET /api/paywall` for the variant prop.

- [ ] **Step 1: Implement the page** — client component, DESIGN.md assembly (`page-shell → page-frame → surface-card`):

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { track } from "../../../lib/client/analytics";
import type { PriceVariant } from "../../../lib/client/analytics";

export default function TrialStartedPage() {
  const [resent, setResent] = useState(false);

  useEffect(() => {
    fetch("/api/paywall")
      .then((r) => r.json())
      .then((cfg: { variant: PriceVariant }) =>
        track({ name: "trial_started", props: { variant: cfg.variant } })
      )
      .catch(() => {});
  }, []);

  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Your free week</p>
          <h1 className="page-title">Your free week is active</h1>
          <p className="page-copy">
            We emailed you a sign-in link — tap it to unlock unlimited checks
            on this and every device.
          </p>
          <p className="page-copy">
            Two days before your trial ends, we&apos;ll email you a reminder
            with the exact date and amount — and a one-tap cancel link. Cancel
            any time from your account page, too.
          </p>
          <p className="field-hint">
            No email after a minute? Check spam, or{" "}
            <Link className="inline-link" href="/signin">
              request a fresh link
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
```

(`resent` state reserved for a later inline resend; the `/signin` link covers it today — remove the unused state if lint complains.)

- [ ] **Step 2: Claims checkpoint** — add the file to `COPY_FILES`; run `npx vitest run tests/unit/revora/claims-boundary-copy.test.ts` → PASS. Add a ledger row (`docs/safety/copy-ledger.md`): Copy ID `trial-started-page`, Surface `Product`, Class `product-role`, the two body sentences, note "billing transparency copy — no health claims."
- [ ] **Step 3: Commit** — `git commit -am "feat(trial): /trial/started success page (claims-audited)"`

**Phase 2 acceptance criteria:** all new suites green + every pre-existing billing/entitlement/pantry/Play test green unchanged; Stripe account holds the 4 products/prices; `POST /api/trial/start` returns a live Checkout URL in dev (test mode); production behavior unchanged (`PAYWALL_MODE=legacy`, no UI links to any of this).
**Rollback:** revert commits; migration 0002 is additive/nullable — leave it applied (harmless) or `DROP COLUMN` + restore the old check constraint if a full revert is demanded. Stripe products can be archived (never delete — price IDs may be referenced by test subscriptions).

---

### Phase 3 — Trust rails: 2-day pre-charge email + one-tap cancel (hard prerequisite of Phase 4)

**Goal:** the anti-Klinio proof exists and is tested before any trial can be sold. No email + no one-tap cancel ⇒ `PAYWALL_MODE=trial` must never be set.

**Files:** see tasks · **Migrations:** none (0002 already added `pre_charge_email_sent_at`) · **Claims checkpoint:** Tasks 3.2/3.3 (cancel page + email copy → ledger + CI).

#### Task 3.1: Stateless cancel token (`node:crypto`, no new deps, no new columns)

**Files:**
- Create: `lib/server/billing/cancel-token.ts`
- Test: `tests/unit/server/cancel-token.test.ts`

**Interfaces:**
- Produces: `createCancelToken(subRowId: string, expiresAtMs: number, secret?: string): string` and `verifyCancelToken(token: string, now?: number, secret?: string): { subRowId: string } | null`. Consumed by 3.2 (endpoint) and 3.3 (email link).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createCancelToken, verifyCancelToken } from "../../../lib/server/billing/cancel-token";

const SECRET = "test-secret";

describe("cancel token", () => {
  it("round-trips", () => {
    const t = createCancelToken("row-1", Date.now() + 60_000, SECRET);
    expect(verifyCancelToken(t, Date.now(), SECRET)).toEqual({ subRowId: "row-1" });
  });
  it("rejects expiry, tamper, and wrong secret", () => {
    const t = createCancelToken("row-1", Date.now() - 1, SECRET);
    expect(verifyCancelToken(t, Date.now(), SECRET)).toBeNull();
    const good = createCancelToken("row-1", Date.now() + 60_000, SECRET);
    expect(verifyCancelToken(good.slice(0, -2) + "xx", Date.now(), SECRET)).toBeNull();
    expect(verifyCancelToken(good, Date.now(), "other")).toBeNull();
  });
});
```

- [ ] **Step 2: Run to fail.** — **Step 3: Implement:**

```ts
import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless one-tap cancel link auth. The token's ONLY power is
// cancel-at-period-end on one subscription row — it can never charge, read,
// or extend anything. ponytail: worst-case misuse cancels a trial early;
// acceptable, no column or table needed.
function secretOrThrow(secret?: string): string {
  const value = secret ?? process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set.");
  return value;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createCancelToken(
  subRowId: string,
  expiresAtMs: number,
  secret?: string
): string {
  const payload = `${subRowId}.${expiresAtMs}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload, secretOrThrow(secret))}`;
}

export function verifyCancelToken(
  token: string,
  now: number = Date.now(),
  secret?: string
): { subRowId: string } | null {
  const [encoded, mac] = token.split(".");
  if (!encoded || !mac) return null;
  const payload = Buffer.from(encoded, "base64url").toString("utf8");
  const expected = sign(payload, secretOrThrow(secret));
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const dot = payload.lastIndexOf(".");
  const subRowId = payload.slice(0, dot);
  const expiresAt = Number(payload.slice(dot + 1));
  if (!subRowId || !Number.isFinite(expiresAt) || expiresAt < now) return null;
  return { subRowId };
}
```

- [ ] **Step 4: Run** → PASS. — **Step 5: Commit** — `git commit -am "feat(billing): stateless HMAC cancel token (one-tap cancel auth)"`

#### Task 3.2: Cancel endpoints + `/canceled` page + visible account cancel

**Files:**
- Create: `app/api/billing/cancel/route.ts` (factory `createCancelHandlers` in `handlers.ts`), `app/canceled/page.tsx`
- Modify: `app/api/billing/handlers.ts` (append factory), `app/account/page.tsx` (one-tap cancel button beside the portal button, `:161-168`), `tests/unit/revora/claims-boundary-copy.test.ts` (`COPY_FILES` += `"app/canceled/page.tsx"`; `app/account/page.tsx` already scanned)
- Test: `tests/unit/server/cancel-route.test.ts`

**Interfaces:**
- Consumes: `verifyCancelToken` (3.1), `emitBillingEvent` (1.2).
- Produces: `GET /api/billing/cancel?token=…` (signed-out, from email) → 303 redirect to `/canceled`; `POST /api/billing/cancel` (session) → `{ok: true, accessUntil}` — consumed by the account page and Phase 4 wall copy ("cancel in one tap").

- [ ] **Step 1: Write the failing tests**

```ts
it("GET with a valid token sets cancel_at_period_end and redirects to /canceled", async () => {
  // seed: user + stripe subscription row (status trialing, providerRef "sub_1")
  const stripeStub = { subscriptions: { update: vi.fn().mockResolvedValue({}) } };
  const token = createCancelToken(row.id, Date.now() + 86400_000, "test-secret");
  const res = await handlers.GET(new Request(`https://app/api/billing/cancel?token=${token}`));
  expect(stripeStub.subscriptions.update).toHaveBeenCalledWith("sub_1", { cancel_at_period_end: true });
  expect(res.status).toBe(303);
  expect(res.headers.get("location")).toContain("/canceled");
});

it("GET with a bad/expired token redirects to /canceled?invalid=1 and touches nothing", async () => { /* … */ });

it("POST cancels the signed-in user's own stripe subscription (one tap, no portal)", async () => { /* … */ });

it("POST 404s when the user has only a Play subscription (deep-link copy handles Play)", async () => { /* … */ });
```

- [ ] **Step 2: Run to fail.** — **Step 3: Implement** `createCancelHandlers(deps)` in `handlers.ts` (GET: verify token → load row by id → if provider `stripe` and status in `("trialing","active","grace")` → `stripe().subscriptions.update(row.providerRef, {cancel_at_period_end: true})`, `emitBillingEvent({name:"trial_canceled", priceVariant})` when trialing → 303 `/canceled`; invalid → 303 `/canceled?invalid=1`; idempotent — a second click re-runs the same update harmlessly. POST: `getSessionInfo()` 401-guard → load the user's stripe row → same update → JSON `{ok, accessUntil: row.currentPeriodEnd}`). Route file exports both. Follow the portal handler's row-loading shape (`handlers.ts:287-325`).
- [ ] **Step 4: `/canceled` page** — static, DESIGN.md assembly:

```tsx
export const metadata = { title: "Canceled — Revora" };

export default function CanceledPage({
  searchParams
}: {
  searchParams: { invalid?: string };
}) {
  const invalid = searchParams?.invalid === "1";
  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Billing</p>
          <h1 className="page-title">
            {invalid ? "That link has expired" : "You're canceled — no charge coming"}
          </h1>
          <p className="page-copy">
            {invalid
              ? "For your security this cancel link has expired. You can still cancel in one tap from your account page."
              : "Your card will not be charged. Anything left of your free week keeps working until it ends, and you can restart whenever you like."}
          </p>
          <a className="primary-button link-button" href="/account">
            Go to your account
          </a>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Account page cancel button** — in `app/account/page.tsx`, beside "Manage or cancel billing" (`:161-168`), add for stripe-sourced premium/trialing users a `recheck-button` "Cancel — one tap, effective at period end" that `POST /api/billing/cancel` and on `{ok}` shows `"Canceled. Access until {accessUntil date}. No charge coming."` inline (aria-live, per DESIGN.md). Keep the portal button (card management).
- [ ] **Step 6: Claims checkpoint** — `COPY_FILES` += `app/canceled/page.tsx`; run the claims test → PASS; ledger rows `cancel-page`, `account-cancel-button` (class `product-role`, note "billing transparency — anti-Klinio proof").
- [ ] **Step 7: Run all** — `npx vitest run tests/unit` → PASS. — **Step 8: Commit** — `git commit -am "feat(billing): one-tap cancel (email token GET + account POST) with calm /canceled page"`

#### Task 3.3: Pre-charge email + hourly cron

**Files:**
- Create: `lib/server/billing/emails.ts`, `app/api/cron/trial-precharge/route.ts`, `lib/server/billing/precharge.ts`
- Modify: `vercel.json` (add cron), `tests/unit/revora/claims-boundary-copy.test.ts` (`COPY_FILES` += `"lib/server/billing/emails.ts"`)
- Test: `tests/unit/server/trial-precharge.test.ts`

**Interfaces:**
- Consumes: `sendEmail` (`lib/server/email.ts:19`), `createCancelToken` (3.1), `emitBillingEvent` (1.2), heartbeat pattern (`lib/server/heartbeat.ts`, as used by the other crons).
- Produces: `runPrechargeSweep(deps): Promise<{sent: number}>` — invoked by the cron route; `prechargeEmailText(appUrl, amountDisplay, chargeDate, cancelToken)`.

- [ ] **Step 1: Write the failing tests**

```ts
it("emails exactly the trialing rows ending within 48h that were not yet emailed, then stamps them", async () => {
  // seed rows: A trial ends in 36h (target), B in 5d (skip), C in 36h but
  // pre_charge_email_sent_at set (skip), D status active ends in 36h (skip)
  const email = { send: vi.fn().mockResolvedValue({ ok: true }) };
  const result = await runPrechargeSweep({ db: () => db, email, now: () => NOW, secret: "test-secret" });
  expect(result.sent).toBe(1);
  expect(email.send).toHaveBeenCalledTimes(1);
  const sentTo = email.send.mock.calls[0][0];
  expect(sentTo.text).toContain("/api/billing/cancel?token=");
  const [rowA] = await db.select().from(schema.subscriptions).where(eq(schema.subscriptions.providerRef, "sub_A"));
  expect(rowA.preChargeEmailSentAt).not.toBeNull();
});

it("is idempotent: a second run sends nothing", async () => { /* … */ });
it("does not stamp when the send fails (retried next hour)", async () => { /* … */ });
```

- [ ] **Step 2: Run to fail.** — **Step 3: Implement.** `lib/server/billing/emails.ts` (subject + body must state the exact amount and date — transparency IS the feature):

```ts
export function prechargeEmailText(
  appUrl: string,
  amountDisplay: string,
  chargeDateText: string,
  cancelToken: string
): { subject: string; text: string } {
  const cancelUrl = `${appUrl}/api/billing/cancel?token=${cancelToken}`;
  return {
    subject: "Your Revora trial ends in about 2 days",
    text: [
      "A heads-up, as promised:",
      "",
      `Your free week ends on ${chargeDateText}. If you do nothing, your card will be charged ${amountDisplay}/month starting that day.`,
      "",
      "Want to keep going? You don't need to do anything.",
      "",
      `Want to stop? One tap, no questions, no retention screens: ${cancelUrl}`,
      "",
      "You can also cancel any time from your account page:",
      `${appUrl}/account`,
      "",
      "— Revora"
    ].join("\n")
  };
}
```

`lib/server/billing/precharge.ts` — `runPrechargeSweep(deps)`: select `status='trialing' AND pre_charge_email_sent_at IS NULL AND current_period_end > now AND current_period_end <= now+48h`; join `users` for the email; amount from the row's `priceVariant` via a `{999:"$9.99",1299:"$12.99",1999:"$19.99"}` map (fallback `$12.99`); `chargeDateText` = `currentPeriodEnd.toLocaleDateString("en-US", {month:"long", day:"numeric"})`; cancel token expiry = `currentPeriodEnd + 30d`; send → on `ok` stamp `preChargeEmailSentAt` + `emitBillingEvent({name:"precharge_email_sent", priceVariant})`. Cron route: copy the `CRON_SECRET` + heartbeat shape of `app/api/cron/pantry-sweep/route.ts` verbatim, heartbeat name `"trial-precharge"`.

- [ ] **Step 4: `vercel.json`** — add `{ "path": "/api/cron/trial-precharge", "schedule": "45 * * * *" }` (hourly ⇒ the "2 days before" window is honored to ±1h; the copy says "about 2 days").
- [ ] **Step 5: Claims checkpoint** — `COPY_FILES` += `lib/server/billing/emails.ts`; run claims test → PASS ("charged" is not a banned family; no health language). Ledger row `precharge-email` (class `product-role`).
- [ ] **Step 6: Run all** — `npx vitest run tests/unit` → PASS. — **Step 7: Commit** — `git commit -am "feat(billing): 2-day pre-charge email cron with one-tap cancel link"`

**Phase 3 acceptance criteria:** with a seeded trialing row ending in <48h, one cron pass sends exactly one email containing a working one-tap cancel URL; clicking it (dev) flips `cancel_at_period_end` and lands on `/canceled`; the account page shows a visible one-tap cancel; all copy in ledger + CI; second cron pass sends nothing.
**Rollback:** remove the cron entry from `vercel.json` (emails stop), revert commits. No schema change in this phase.

---

### Phase 4 — Day-1 taster + hard wall (feature-flagged; prod stays `legacy`)

**Goal:** the full taster→wall→trial loop works end-to-end behind `PAYWALL_MODE=trial` (preview/QA only). Legacy behavior is byte-identical when the flag is `legacy`.

**Files:** see tasks · **Migrations:** none · **Claims checkpoint:** Tasks 4.2/4.4/4.5 (wall + 402 message + upsell-card copy → ledger + CI).

#### Task 4.1: Taster store (device-local Day-1 state)

**Files:**
- Create: `lib/client/taster-store.ts`
- Test: `tests/unit/client/taster-store.test.ts` (jsdom/localStorage, same setup as the history-store tests — locate via `grep -rl "history-store" tests/unit`)

**Interfaces:**
- Produces: `TASTER_LIMIT = 10`; `tasterStore.status(now?): "available" | "exhausted" | "expired"`; `tasterStore.recordCheck(): number` (returns used count); `tasterStore.get()`, `tasterStore.clear()`. Consumed by 4.3 (form gate) and 5.x (first-run).

- [ ] **Step 1: Write the failing test**

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { tasterStore, TASTER_LIMIT } from "../../../lib/client/taster-store";

describe("tasterStore", () => {
  beforeEach(() => localStorage.clear());

  it("is available with 0 used before first check, stamps firstDay on first record", () => {
    expect(tasterStore.status()).toBe("available");
    expect(tasterStore.recordCheck()).toBe(1);
    expect(tasterStore.get()?.firstDay).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("exhausts at the 10th check on Day 1", () => {
    for (let i = 0; i < TASTER_LIMIT; i++) tasterStore.recordCheck();
    expect(tasterStore.status()).toBe("exhausted");
  });

  it("expires on Day 2 regardless of remaining checks", () => {
    tasterStore.recordCheck();
    const tomorrow = new Date(Date.now() + 26 * 3600_000);
    expect(tasterStore.status(tomorrow)).toBe("expired");
  });
});
```

- [ ] **Step 2: Run to fail.** — **Step 3: Implement** (mirror `profile-store.ts`'s guarded-localStorage shape):

```ts
const STORAGE_KEY = "revora.taster.v1";
export const TASTER_LIMIT = 10;

export type TasterState = { firstDay: string; used: number };

// Day 1 = the user's LOCAL calendar day of first use.
function dayLocal(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function read(): TasterState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TasterState;
    return typeof parsed.firstDay === "string" && typeof parsed.used === "number"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function write(state: TasterState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable: taster silently un-metered client-side; the
    // server IP rate limit remains the backstop.
  }
}

// ponytail: device-local taster — clear storage = reset. Accepted for a
// taster (model spend bounded by the middleware IP limit); upgrade path is
// a server-side first-seen cookie/fingerprint if abuse shows in the data.
export const tasterStore = {
  get: read,
  clear(): void {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
  status(now: Date = new Date()): "available" | "exhausted" | "expired" {
    const state = read();
    if (!state) return "available";
    if (state.firstDay !== dayLocal(now)) return "expired";
    return state.used >= TASTER_LIMIT ? "exhausted" : "available";
  },
  recordCheck(now: Date = new Date()): number {
    const state = read() ?? { firstDay: dayLocal(now), used: 0 };
    const next = { ...state, used: state.used + 1 };
    write(next);
    return next.used;
  }
};
```

- [ ] **Step 4: Run** → PASS. — **Step 5: Commit** — `git commit -am "feat(taster): device-local Day-1 taster store (10-check cap, local calendar day)"`

#### Task 4.2: TrialWall component + mode-aware `/subscribe`

**Files:**
- Create: `components/trial-wall.tsx`
- Modify: `app/subscribe/page.tsx` (server component reads `paywallMode()` and renders `TrialWall` vs. the existing content), `tests/unit/revora/claims-boundary-copy.test.ts` (`COPY_FILES` += `"components/trial-wall.tsx"`)
- Test: `tests/unit/client/trial-wall.test.tsx` if a component-test setup exists (check `tests/unit` for existing `.tsx` tests; if none, cover via the Phase 8 smoke test and unit-test only the fetch/submit logic extracted into a helper)

**Interfaces:**
- Consumes: `GET /api/paywall` (2.5), `POST /api/trial/start` (2.6), `track` events `wall_viewed`/`trial_checkout_started` (1.1).
- Produces: `<TrialWall declined={bool} />` — also consumed by the check-route upsell CTA (4.5) via `/subscribe`.

- [ ] **Step 1: Implement** — a small three-step client flow (per handoff §8: value → proof → price, multi-step beats one dense card), all one component, no routing:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { track, type PriceVariant } from "../lib/client/analytics";

type Config = { variant: PriceVariant; priceDisplay: string };
type Step = "value" | "proof" | "start";

export function TrialWall({ declined = false }: { declined?: boolean }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [step, setStep] = useState<Step>("value");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/paywall")
      .then((r) => r.json())
      .then((cfg: Config & { mode: string }) => {
        setConfig(cfg);
        track({ name: "wall_viewed", props: { variant: cfg.variant } });
      })
      .catch(() => setConfig({ variant: "1299", priceDisplay: "$12.99" }));
  }, []);

  async function startTrial(event: React.FormEvent) {
    event.preventDefault();
    if (!config) return;
    setBusy(true);
    setError(null);
    track({ name: "trial_checkout_started", props: { variant: config.variant } });
    try {
      const response = await fetch("/api/trial/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email })
      });
      const body = (await response.json()) as { url?: string; error?: string };
      if (body.url) {
        window.location.assign(body.url);
      } else {
        setError(body.error ?? "Something went wrong — you have not been charged.");
      }
    } catch {
      setError("Something went wrong — you have not been charged.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface-card" data-testid="trial-wall">
      {step === "value" ? (
        <>
          <p className="hero-eyebrow">Day 2 with Revora</p>
          <h1 className="page-title">Yesterday was the free taste</h1>
          <p className="page-copy">
            From here, Revora is a paid companion: unlimited checks, your full
            history on every device, weekly patterns from your own meals, and
            one gentle daily reminder.
          </p>
          <button type="button" className="primary-button" onClick={() => setStep("proof")}>
            See how the trial works
          </button>
        </>
      ) : step === "proof" ? (
        <>
          <p className="hero-eyebrow">How the trial works</p>
          <h1 className="page-title">Seven days free, and we remind you before any charge</h1>
          <ul className="page-copy expectation-list">
            <li>Start today with a card — nothing is charged for 7 days.</li>
            <li>Two days before the trial ends, we email you the exact date and amount.</li>
            <li>Cancel in one tap — from that email or your account page. No retention screens.</li>
          </ul>
          <button type="button" className="primary-button" onClick={() => setStep("start")}>
            Start my free week
          </button>
        </>
      ) : (
        <form onSubmit={startTrial} className="field-stack">
          <p className="hero-eyebrow">Start your free week</p>
          <h1 className="page-title">{config?.priceDisplay ?? "$12.99"}/month after 7 free days</h1>
          <p className="page-copy">
            Card required to start. We email you before it is ever charged, and
            cancel is one tap.
          </p>
          <label className="field-label" htmlFor="trial-email">Your email</label>
          <input
            id="trial-email"
            className="text-input"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="primary-button" disabled={busy}>
            {busy ? "Opening…" : "Continue to secure checkout"}
          </button>
          {error ? <p className="field-error">{error}</p> : null}
        </form>
      )}
      {declined ? (
        <p className="field-hint" data-testid="pantry-catch">
          Not ready for a subscription? There&apos;s a one-time option:{" "}
          <Link className="inline-link" href="/pantry">
            the Pantry Review
          </Link>
          . One payment, nothing renews.
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Mode-aware `/subscribe`** — `app/subscribe/page.tsx` becomes:

```tsx
import Link from "next/link";

import { PaywallCard } from "../../components/paywall-card";
import { TrialWall } from "../../components/trial-wall";
import { paywallMode } from "../../lib/server/pricing";

export const metadata = { title: "Premium — Revora" };

export default function SubscribePage({
  searchParams
}: {
  searchParams: { declined?: string };
}) {
  const trial = paywallMode() === "trial";
  return (
    <main className="page-shell">
      <div className="page-frame">
        {trial ? (
          <TrialWall declined={searchParams?.declined === "1"} />
        ) : (
          <section className="surface-card hero-card">
            {/* existing legacy content, unchanged, verbatim from today's file */}
            <p className="hero-eyebrow">Revora Premium</p>
            <h1 className="page-title">Keep your history and your daily coach</h1>
            <p className="page-copy">
              The check stays free, every day. Premium is the memory around it —
              your history everywhere, the weekly patterns, and progress you can
              see.
            </p>
            <PaywallCard />
          </section>
        )}
        <footer className="page-footer">
          <Link href="/">Home</Link>
          <Link href="/account">Account</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </footer>
      </div>
    </main>
  );
}
```

(The `/pantry` link in the decline catch 404s until Phase 6 — acceptable in preview-only; Phase 6 lands before any flag flip, enforced by the Phase 8 checklist.)

- [ ] **Step 3: Claims checkpoint** — `COPY_FILES` += `components/trial-wall.tsx`; run claims test → PASS (wall copy is capability/billing framing; no health-outcome language; note "Yesterday was the free taste" contains no banned family). Ledger rows: `trial-wall-value`, `trial-wall-proof`, `trial-wall-start`, `pantry-catch-line` (class `product-role`).
- [ ] **Step 4: Run all unit tests** → PASS. — **Step 5: Commit** — `git commit -am "feat(wall): multi-step card-gated trial wall behind PAYWALL_MODE (legacy /subscribe unchanged)"`

#### Task 4.3: Client taster gate in the check form

**Files:**
- Modify: `components/food-check-form.tsx` (`handleSubmit` at `:63`, result handling at `:121-138`)
- Test: extend the food-check-form tests (locate via `grep -rl "food-check-form" tests/unit`)

**Interfaces:** consumes `tasterStore` (4.1), `track` `taster_check` (1.1), paywall mode via a module-level `fetch("/api/paywall")` cached in state on mount.

- [ ] **Step 1: Write the failing tests** — (a) in trial mode, an anonymous user with `tasterStore.status() !== "available"` who submits is redirected to `/subscribe` without calling `/api/check`; (b) in trial mode, a successful `kind:"result"` for an anonymous taster increments the store and fires `taster_check {used}`; (c) in legacy mode, behavior is byte-identical to today (no store writes, no redirect, existing `check_completed` event only).
- [ ] **Step 2: Run to fail.** — **Step 3: Implement:**
  - On mount (new `useEffect`): `fetch("/api/paywall")` → keep `{mode}` in state (default `"legacy"` on failure — fail-open to legacy, never to a wall).
  - Signed-in detection: reuse what the component already has; if it has no session awareness (it doesn't — it is session-agnostic), gate on the *server's* 402 for signed-in users and on the taster store for everyone: at the top of `handleSubmit`, `if (mode === "trial" && tasterStore.status() !== "available" ) { window.location.assign("/subscribe"); return; }`. Signed-in entitled users never hit this because Task 5.4 clears the taster store after sign-in (and even if it fires spuriously for an entitled user, `/subscribe` in trial mode shows the wall which links onward — acceptable preview-only rough edge; note it in the task log if observed).
  - After a successful `kind:"result"` (`:121-138`), when `mode === "trial"` and the user is anonymous (no better signal exists client-side than "taster store active": `tasterStore.get() !== null || sessionless`), call `const used = tasterStore.recordCheck()` and `track({ name: "taster_check", props: { used } })`. Record BEFORE rendering the result so a reload can't double-spend.
- [ ] **Step 4: Run** → PASS (including the legacy byte-identical test). — **Step 5: Commit** — `git commit -am "feat(taster): client-side Day-1 gate + taster_check event in the check form"`

#### Task 4.4: Server hard wall in `/api/check` (flagged)

**Files:**
- Modify: `app/api/check/route.ts:52-125`
- Test: extend `tests/unit/` check-route tests (locate via `grep -rl "createCheckRouteHandler" tests`)

**Interfaces:** consumes `paywallMode` (2.5), `getEntitlement` status (2.3). The 402 body keeps `{kind:"upsell", message, disclaimer}` so `lib/client/check.ts:79-97` needs zero changes.

- [ ] **Step 1: Write the failing tests**

```ts
it("trial mode: signed-in user with status lapsed/none gets a hard 402 regardless of checks used", async () => {
  // deps: getSession → user; entitlement rows absent; env PAYWALL_MODE=trial (inject via deps)
  const res = await POST(requestWithFood());
  expect(res.status).toBe(402);
  expect((await res.json()).message).toContain("free week");
});

it("trial mode: trialing and premium users pass with no metering query", async () => { /* … */ });
it("legacy mode: 5/day soft limit behaves byte-identically (existing tests unchanged)", async () => { /* … */ });
it("anonymous requests are untouched in both modes (IP limit is the middleware's job)", async () => { /* … */ });
```

- [ ] **Step 2: Run to fail.** — **Step 3: Implement** — add `paywallMode?: () => "legacy"|"trial"` to `CheckRouteDeps` (default `() => paywallMode()`); inside the metering block (`:87-125`):

```ts
const mode = paywallModeDep();
if (session) {
  const entitlement = await getEntitlement(db(), session.userId, {
    refreshPlaySubscription: (token) => playLookup(token)
  });

  if (mode === "trial") {
    if (entitlement.tier !== "premium") {
      emitEvent({ name: "check_failed", environment, reasonCode: "daily_cap",
        latencyBucket: getLatencyBucket(now() - startedAt) });
      return NextResponse.json(
        { kind: "upsell", message: TRIAL_WALL_MESSAGE,
          disclaimer: loadSafetyContract().copy.disclaimer },
        { status: 402 }
      );
    }
  } else if (entitlement.tier === "free") {
    // existing 5/day block, unchanged
  }
}
```

with

```ts
// Hard wall (Decision D): no residual free checks. The client renders this
// as the wall CTA; the copy stays calm and names the exact next step.
const TRIAL_WALL_MESSAGE =
  "Your free taste of Revora was yesterday's checks. Start your free week — card required, unlimited everything, and we email you before any charge — to keep going.";
```

Keep the whole block inside the existing fail-open `try/catch` (`:87-125`) — metering must never take the product down. `reasonCode: "daily_cap"` is reused (adding an enum value to `SafeTelemetryEvent` is allowed but unnecessary — `ponytail:` reuse the existing code, the mode is distinguishable from the paywall config in analysis).

- [ ] **Step 4: Claims checkpoint** — `TRIAL_WALL_MESSAGE` lives in `app/api/check/route.ts`, which is NOT in `COPY_FILES`; add `"app/api/check/route.ts"` to `COPY_FILES` (the existing `FREE_LIMIT_MESSAGE` must also pass — it does: no banned families). Run claims test → PASS. Ledger row `trial-wall-402` (class `product-role`).
- [ ] **Step 5: Run the full check-route suite** → PASS with legacy tests unchanged. — **Step 6: Commit** — `git commit -am "feat(wall): hard 402 for non-entitled signed-in users under PAYWALL_MODE=trial"`

#### Task 4.5: Trial-mode upsell card variant

**Files:**
- Modify: `components/result-card.tsx:90-107` (upsell branch)
- Test: extend the result-card tests (locate via `grep -rl "result-card" tests/unit`)

- [ ] **Step 1: Failing test** — the upsell branch renders the server's `message` verbatim with eyebrow "Where the free taste ends" and CTA "Start your free week" linking `/subscribe` when the message mentions "free week", else today's legacy copy ("Daily limit reached" / "That's five for today").
- [ ] **Step 2: Implement** — branch on `response.message.includes("free week")` (`ponytail:` string sniff over prop-drilling a mode flag through a presentational component; the server message is the single source of truth; revisit only if a third mode ever appears). Keep `data-kind="upsell"`; add `data-wall="trial"` when the trial branch renders.
- [ ] **Step 3: Claims checkpoint** — `result-card.tsx` is already scanned (`claims-boundary-copy.test.ts:44`); run → PASS. Ledger row `upsell-card-trial`.
- [ ] **Step 4: Run all** → PASS. — **Step 5: Commit** — `git commit -am "feat(wall): trial-mode upsell card renders the wall CTA"`

#### Task 4.6: ADR amendment note

- [ ] **Step 1:** Append to `docs/adr/billing.md`: a dated "Amendment 2026-07-05" paragraph — free tier replaced by Decision D (taster → card-gated trial, `PAYWALL_MODE` flag; legacy path retained for rollback), pointing at the 2026-07-05 handoff and this plan. Do not rewrite the ADR body.
- [ ] **Step 2: Commit** — `git commit -am "docs(adr): billing amendment — Decision D card-gated trial supersedes the free tier"`

**Phase 4 acceptance criteria:** with `PAYWALL_MODE=trial` in a preview env: an anonymous browser gets ≤10 checks on Day 1 (11th → wall), a clock-forward/localStorage-dated Day-2 visit → wall, wall → email → Stripe test-mode checkout with card → webhook writes `trialing` row → magic link → `/welcome` → unlimited checks; with `PAYWALL_MODE=legacy` (or unset) every pre-existing test and behavior is unchanged. All new copy in ledger + CI green.
**Rollback:** set `PAYWALL_MODE=legacy` (or unset) — the entire phase goes dormant. Code revert optional.

---

### Phase 5 — First-run onboarding: guided first check with betrayal chips

**Goal:** a brand-new visitor auto-enters the first-run, taps oatmeal/banana/orange juice into a real first check inside the Day-1 taster, and sees a calm Day-1 moment. The orphaned `/onboarding` becomes the actual front door. A1C stays single-sourced.

**Files:** see tasks · **Migrations:** none · **Claims checkpoint:** Tasks 5.2, 5.5, 5.6 (onboarding strings, landing demo/trust strip, get-the-app page; the onboarding page already has the North Star carve-out at `claims-boundary-copy.test.ts:75-84`).

#### Task 5.1: FirstRunGate on the home page

**Files:**
- Create: `components/first-run-gate.tsx`
- Modify: `app/page.tsx` (one added line)
- Test: `tests/unit/client/first-run-gate.test.tsx` (or fold into daily-loop's test setup)

**Interfaces:** consumes `historyStore` (`revora.history.v1`), `profileStore` (`revora.profile.v1`), `tasterStore` (4.1).

- [ ] **Step 1: Failing test** — redirects to `/onboarding` only when ALL of: no history, no guest profile, no taster state, and no `?stay=1` escape param; otherwise renders nothing.
- [ ] **Step 2: Implement:**

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { historyStore } from "../lib/client/history-store";
import { profileStore } from "../lib/client/profile-store";
import { tasterStore } from "../lib/client/taster-store";

// First-run redirect (handoff §1): a brand-new visitor auto-enters the tour.
// Any prior signal (a check, a saved A1C, a started taster) means "not new".
export function FirstRunGate() {
  const router = useRouter();

  useEffect(() => {
    const isNew =
      historyStore.all().length === 0 &&
      profileStore.get() === null &&
      tasterStore.get() === null;
    const stay = new URLSearchParams(window.location.search).get("stay") === "1";
    if (isNew && !stay) {
      router.replace("/onboarding");
    }
  }, [router]);

  return null;
}
```

Add `<FirstRunGate />` as the first child inside `app/page.tsx`'s `page-frame`. (`?stay=1` is the deliberate escape hatch the onboarding "skip" uses so skipping doesn't loop.)

- [ ] **Step 3: Run** → PASS. — **Step 4: Commit** — `git commit -am "feat(onboarding): first-run auto-redirect (fixes the orphaned tour)"`

#### Task 5.2: Extend the onboarding tour — segmentation chips + guided first check

**Files:**
- Modify: `app/onboarding/page.tsx` (`Step` type `:21`, `finish()` `:56-62`, step renderers)
- Test: extend `tests/smoke/onboarding.spec.ts` + unit-test the chip handoff helper

**Interfaces:**
- Consumes: DESIGN.md chip pattern (0.1), `revora.recheck` sessionStorage handoff (read at `food-check-form.tsx:45-47`), `profileStore`.
- Produces: the guided-first-check entry into the taster.

- [ ] **Step 1: Failing smoke assertions** — the tour now walks `welcome → segment → a1c → expectations → first_check`; the a1c step is SKIPPED when `profileStore` already has a value; tapping the "oatmeal" chip lands on `/` with the food field prefilled "oatmeal" and focus in the form; "skip the tour" goes to `/?stay=1`.
- [ ] **Step 2: Implement:**
  - `Step` type gains `"segment"` and `"first_check"` (replacing `daily_loop` as the terminal step; keep `boundary`).
  - **Segment step** (skippable, one tap, stored nowhere server-side): eyebrow "One quick question", title "What brought you here?", `.chip-row` of `selectable-chip`s — `New A1C result` / `Doctor's advice` / `Family history` / `Just checking` — each tap (or "Skip") advances. Fire no new analytics event (`onboarding_completed` already exists; segmentation analytics can be added post-launch — YAGNI).
  - **A1C step**: unchanged, but on entry `if (profileStore.get()) { setStep("expectations"); }` — single-source rule: never re-ask what the device already knows.
  - **Expectations step**: prepend the honesty line as the first list item: `"When we're unsure, we say so — you'll see it in the result."`
  - **First-check step** (the aha): eyebrow "Your first check", title "Try one of the classics", copy `"These three surprise almost everyone. Tap one — the check runs right on the home screen."`, `.chip-row` with **oatmeal / banana / orange juice**; tapping runs:

```ts
function startGuidedCheck(food: string) {
  try {
    window.sessionStorage.setItem("revora.recheck", food);
  } catch {
    // storage unavailable — land on the form without a prefill
  }
  if (a1cValue !== null) {
    profileStore.set({ a1c: a1cValue, onboardedAt: new Date().toISOString() });
  }
  track({ name: "onboarding_completed" });
  router.push("/");
}
```

  (This reuses the existing `revora.recheck` prefill path verbatim — `food-check-form.tsx:45-47` consumes and clears it. No form changes needed.)
  - A quiet "Skip the tour" `inline-link` on every step → `router.push("/?stay=1")` (pairs with 5.1's escape hatch).
  - Keep the North Star line VERBATIM wherever the welcome step renders it — the claims test hard-fails if it drifts (`claims-boundary-copy.test.ts:106-110`).
- [ ] **Step 3: Claims checkpoint** — `app/onboarding/page.tsx` is already scanned (as a carve-out file); run the claims test → PASS. New ledger rows: `onboarding-segment`, `onboarding-first-check` (class `prompt-scope` for the A1C-adjacent strings, `product-role` for the rest). Verify none of the new strings use "prevent/reverse/treat/diagnose" families — the chip labels and copy above are clean by construction.
- [ ] **Step 4: Run** — `npx vitest run tests/unit` + `npx playwright test tests/smoke/onboarding.spec.ts` → PASS. — **Step 5: Commit** — `git commit -am "feat(onboarding): segmentation + guided first check with oatmeal/banana/orange-juice chips"`

#### Task 5.3: Day-1 first-win treatment in the daily loop

**Files:**
- Modify: `components/daily-loop.tsx` (returning-user card, `:86-101`)
- Test: extend the daily-loop tests

- [ ] **Step 1: Failing test** — when `streak === 1` and today has ≥1 check, the card shows a `.first-win` block: eyebrow "Day 1", copy `"That's Day 1. One honest check a day is the whole habit."`; at `streak > 1` it does not render.
- [ ] **Step 2: Implement** per the DESIGN.md pattern (0.1): typography only, inside the existing card above `<TodayList/>`; `<NudgeOptIn/>` already renders below it — the Day-1 moment and the nudge offer land together (handoff §1 step 7), no new nudge code.
- [ ] **Step 3: Claims checkpoint** — `daily-loop.tsx` already scanned; run → PASS. Ledger row `day1-first-win`.
- [ ] **Step 4: Run** → PASS. — **Step 5: Commit** — `git commit -am "feat(onboarding): calm Day-1 first-win treatment in the daily loop"`

#### Task 5.4: Taster cleanup after sign-in

**Files:**
- Modify: `app/welcome/page.tsx` (success path, after `:96-105`)

- [ ] **Step 1:** In the post-profile-save success path (where local history migrates), add `tasterStore.clear()` — a signed-in user's entitlement is server-truth; a stale device taster must never gate them (Task 4.3's gate checks the store).
- [ ] **Step 2:** Extend the welcome-page test to assert the store is cleared. Run → PASS.
- [ ] **Step 3: Commit** — `git commit -am "fix(taster): clear device taster state once an account takes over"`

#### Task 5.5: Landing demo card + trust strip (the betrayal-aha demo on `/`)

**Files:**
- Create: `components/demo-check-card.tsx`
- Modify: `app/page.tsx` (mount the demo card + trust strip below the form/daily-loop), `tests/unit/revora/claims-boundary-copy.test.ts` (`COPY_FILES` += `"components/demo-check-card.tsx"`)
- Test: `tests/unit/client/demo-check-card.test.tsx` (render assertions) or fold into an existing page test

**Interfaces:** none consumed at runtime — the card is static fixture markup using the real result-card classes (always pixel-true to the product, crawlable for SEO, and visible to tour-skippers; `FirstRunGate` (5.1) is client-side, so crawlers and returning visitors still see the full page).

- [ ] **Step 1: Ledger the demo copy FIRST** — add three rows to `docs/safety/copy-ledger.md` before writing the component:
  - `demo-check-reason` (class `result-qualitative-impact`): "Oatmeal on its own is a carb-heavy start, so it can have a higher blood-sugar impact than its healthy reputation suggests."
  - `demo-check-adjustment` (class `result-adjustment`): "If practical, add protein — Greek yogurt, nuts, or eggs on the side — to make it easier to handle."
  - `demo-check-swap` (class `result-adjustment`): "Steel-cut oats hold up steadier than instant packets."
  Verify each against the banned families (`claims-boundary-copy.test.ts:14-25`) and the qualitative-only rule ("carb-heavy" is explicitly allowed language, `claims-boundary.md` `result-qualitative-impact`). Evidence rows: `CDC-HEALTHY-CARBS, CDC-MEAL-PLANNING`.
- [ ] **Step 2: Write the failing test** — the card renders `data-risk="MODERATE"`, the label "A real example", the verdict "Be careful", all three ledgered lines, and the verbatim `result-footer` disclaimer; it renders NO form controls and fires no fetch.
- [ ] **Step 3: Implement `components/demo-check-card.tsx`** (server component, static):

```tsx
/**
 * The betrayal-aha demo (handoff §7): the product in action, as static
 * fixture markup using the REAL result-card classes — always pixel-true,
 * crawlable, and claims-audited via the copy ledger. No live check runs here.
 */
export function DemoCheckCard() {
  return (
    <section className="surface-card" aria-label="Example check" data-testid="demo-check-card">
      <p className="status-eyebrow">A real example</p>
      <p className="page-copy">
        You type: <strong>oatmeal</strong>
      </p>
      <div className="result-card" data-risk="MODERATE">
        <p className="result-eyebrow">Revora answers</p>
        <h2 className="page-title">Be careful</h2>
        <p className="page-copy">
          Oatmeal on its own is a carb-heavy start, so it can have a higher
          blood-sugar impact than its healthy reputation suggests.
        </p>
        <div className="result-list">
          <p className="page-copy">
            <strong>Adjustment:</strong> If practical, add protein — Greek
            yogurt, nuts, or eggs on the side — to make it easier to handle.
          </p>
          <p className="page-copy">
            <strong>Swap:</strong> Steel-cut oats hold up steadier than
            instant packets.
          </p>
        </div>
        <p className="result-disclaimer">
          Revora is informational only and is not medical advice. Talk with a
          doctor or registered dietitian for guidance that is specific to you.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Mount on `app/page.tsx`** — below the daily loop: `<DemoCheckCard />`, then the trust strip inside the existing hero/footer area:

```tsx
<ul className="page-copy expectation-list" data-testid="trust-strip">
  <li>No login for your first checks.</li>
  <li>When we&apos;re unsure, we say so.</li>
  <li>If you ever subscribe, cancel is one tap — not an email.</li>
</ul>
```

- [ ] **Step 5: Claims checkpoint** — `COPY_FILES` += `components/demo-check-card.tsx` (`app/page.tsx` is already scanned); run the claims test → PASS. Ledger row `home-trust-strip` (class `product-role`).
- [ ] **Step 6: Run** → PASS. — **Step 7: Commit** — `git commit -am "feat(landing): static betrayal-aha demo card + trust strip on the home page"`

#### Task 5.6: PWA install page + store-intent waitlist (never a deflection)

**Files:**
- Create: `app/get-the-app/page.tsx`
- Modify: `app/page.tsx` footer (+ `Get the app` link), `app/trial/started/page.tsx` (one sentence pointing at it), `tests/unit/revora/claims-boundary-copy.test.ts` (`COPY_FILES` += `"app/get-the-app/page.tsx"`)
- Test: render test — waitlist section hidden when `NEXT_PUBLIC_WAITLIST_URL` is unset

**Interfaces:** consumes `NEXT_PUBLIC_WAITLIST_URL` (Tally form URL; section hidden without it).

- [ ] **Step 1: Human/MCP step — create the Tally waitlist form** (Tally MCP is connected): fields = email (required) + platform (Android / iPhone, required) + a one-line purpose statement ("Only used to tell you when the store version ships."). Set `NEXT_PUBLIC_WAITLIST_URL` in Vercel. `ponytail:` Tally-hosted = zero code, zero DB, zero GDPR surface of our own; build the native table/route only if the off-domain hop measurably hurts signups.
- [ ] **Step 2: Implement `app/get-the-app/page.tsx`** (static server component):

```tsx
export const metadata = { title: "Get Revora on your phone — Revora" };

export default function GetTheAppPage() {
  const waitlistUrl = process.env.NEXT_PUBLIC_WAITLIST_URL;
  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">On your phone</p>
          <h1 className="page-title">Revora already works on your phone</h1>
          <p className="page-copy">
            The web app installs to your home screen and works like an app —
            no store, no download, same checks.
          </p>
          <h2 className="section-title">Android (Chrome)</h2>
          <p className="page-copy">
            Open Revora in Chrome, tap the menu (⋮), then &quot;Add to Home
            screen&quot;, then Add.
          </p>
          <h2 className="section-title">iPhone (Safari)</h2>
          <p className="page-copy">
            Open Revora in Safari, tap Share, then &quot;Add to Home
            Screen&quot;, then Add.
          </p>
          {waitlistUrl ? (
            <>
              <h2 className="section-title">Prefer the store version?</h2>
              <p className="page-copy">
                Leave your email and we&apos;ll tell you when the Play Store or
                App Store version ships. Nothing else, ever.
              </p>
              <a className="primary-button link-button" href={waitlistUrl}>
                Tell me when it ships
              </a>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Wire the two quiet entry points** — home footer link `Get the app`; on `/trial/started`, append to the second paragraph: `"On your phone, Revora installs straight to your home screen — see how."` linking `/get-the-app`. **Placement rule (enforced in review): footer-tier only.** Never on the wall, never in onboarding — the ask priority is check food > start trial > pantry > waitlist.
- [ ] **Step 4: Claims checkpoint** — `COPY_FILES` += the page; run → PASS ("works like an app" is capability framing; no health language). Ledger rows `get-the-app-page`, `waitlist-cta` (class `product-role`).
- [ ] **Step 5: Run** → PASS. — **Step 6: Commit** — `git commit -am "feat(pwa): get-the-app install page + store-intent waitlist (footer-tier)"`

**Phase 5 acceptance criteria:** fresh browser → `/` auto-redirects to the tour → chips → prefilled first check → result → Day-1 treatment; skipping never loops; A1C is asked at most once per device before `/welcome`; the landing (for crawlers, skippers, and returning guests) shows the demo card + trust strip; `/get-the-app` renders with the waitlist section env-gated; all smoke + unit tests green; claims CI green.
**Rollback:** remove `<FirstRunGate />` from `app/page.tsx` (one line) — the tour returns to opt-in; demo card, trust strip, and get-the-app page are pure additions (revert their commits independently).

---

### Phase 6 — Pantry: landing page + in-app purchase + entry points

**Goal:** a visitor can discover, understand (sample report), and buy the Pantry Review entirely in-app; the wall-decline and post-verdict catches are live. The intake→report pipeline is reused untouched.

**Files:** see tasks · **Migrations:** none · **Claims checkpoint:** Tasks 6.2/6.3 (landing + entry-point copy → ledger + CI).

#### Task 6.1: In-app pantry checkout + thanks page

**Files:**
- Create: `app/api/billing/stripe/pantry-checkout/route.ts` (factory `createPantryCheckoutSessionHandler` in `handlers.ts`), `app/pantry/thanks/page.tsx`
- Modify: `app/api/billing/handlers.ts` (append factory), `tests/unit/revora/claims-boundary-copy.test.ts` (`COPY_FILES` += `"app/pantry/thanks/page.tsx"`)
- Test: `tests/unit/server/pantry-checkout.test.ts`

**Interfaces:**
- Consumes: `STRIPE_PRICE_PANTRY` (provisioned in 2.1). The response flows through the EXISTING `applyPantryCheckout` webhook branch unchanged (`handlers.ts:450-508` keys on `mode:"payment"` + the price ID, idempotent on `stripeSessionId`, sends the intake email).
- Produces: `POST /api/billing/stripe/pantry-checkout → {url}` (no session required — buyers may be anonymous; Checkout collects email).

- [ ] **Step 1: Failing tests** — (a) returns a checkout URL with `mode:"payment"`, the pantry price, `success_url` `/pantry/thanks`, `cancel_url` `/pantry`; (b) 503 when `STRIPE_PRICE_PANTRY` unset; (c) **REGRESSION: a completed session from this handler's shape drives `applyPantryCheckout` to create an order + intake email exactly like the Payment Link path** (reuse the fixtures from `tests/unit/server/pantry-webhook.test.ts`).
- [ ] **Step 2: Implement** the factory (≈25 lines, mirrors `createStripeCheckoutHandler` minus the session gate):

```ts
export function createPantryCheckoutSessionHandler(deps: BillingDeps = {}) {
  const stripe = deps.stripeClient ?? defaultStripe;

  return async function POST() {
    const price = process.env.STRIPE_PRICE_PANTRY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    if (!price) {
      return NextResponse.json({ error: "The Pantry Review is not available right now." }, { status: 503 });
    }
    // No session gate: buyers may be anonymous. Checkout collects the email;
    // order binding stays possession-of-claim-token, exactly like the
    // Payment Link path (applyPantryCheckout is reused byte-identically).
    const checkout = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${appUrl}/pantry/thanks`,
      cancel_url: `${appUrl}/pantry`
    });
    return NextResponse.json({ url: checkout.url });
  };
}
```

- [ ] **Step 3: `/pantry/thanks`** — static page, DESIGN.md assembly: eyebrow "Pantry Review", title "Paid — check your email", copy `"Your setup link is on its way to the email you used at checkout. It signs you in and walks you through the photo upload. Nothing else to do here."` + support-email hint (reuse the `SUPPORT_EMAIL` pattern from the intake page's empty state, `app/pantry/intake/page.tsx:45-62`).
- [ ] **Step 4: `pantry_purchased` telemetry** — in `applyPantryCheckout` (`handlers.ts:492-494`), immediately after the `inserted.length === 0` early-return (i.e., only on the FIRST delivery of the webhook), add `emitBillingEvent({ name: "pantry_purchased" })`. Extend the webhook test: the event is emitted exactly once across a duplicate webhook delivery.
- [ ] **Step 5: Claims checkpoint** — `COPY_FILES` += thanks page; run → PASS; ledger row `pantry-thanks` (class `product-role`).
- [ ] **Step 6: Run all server tests** → PASS including all pre-existing pantry webhook tests unchanged. — **Step 7: Commit** — `git commit -am "feat(pantry): in-app one-time checkout through the existing webhook branch"`

#### Task 6.2: `/pantry` landing page with sample report

**Files:**
- Create: `app/pantry/page.tsx`, `components/pantry-buy-button.tsx`
- Modify: `tests/unit/revora/claims-boundary-copy.test.ts` (`COPY_FILES` += both new files)
- Test: smoke assertions in Phase 8's walkthrough spec; unit-test the buy button's fetch/redirect

**Interfaces:** consumes `POST /api/billing/stripe/pantry-checkout` (6.1), `track` `pantry_viewed`/`pantry_checkout_started` (1.1).

- [ ] **Step 1: Implement `components/pantry-buy-button.tsx`** (client; the landing page itself stays a server component):

```tsx
"use client";

import { useEffect, useState } from "react";

import { track } from "../lib/client/analytics";

export function PantryBuyButton({ source }: { source: "landing" | "wall_decline" | "result_card" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track({ name: "pantry_viewed", props: { source } });
  }, [source]);

  async function buy() {
    setBusy(true);
    setError(null);
    track({ name: "pantry_checkout_started" });
    try {
      const response = await fetch("/api/billing/stripe/pantry-checkout", { method: "POST" });
      const body = (await response.json()) as { url?: string; error?: string };
      if (body.url) window.location.assign(body.url);
      else setError(body.error ?? "Checkout isn't available right now.");
    } catch {
      setError("Something went wrong — you have not been charged.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field-stack">
      <button type="button" className="primary-button" disabled={busy} onClick={buy} data-testid="pantry-buy">
        {busy ? "Opening…" : "Get your Pantry Review — one payment, nothing renews"}
      </button>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
```

- [ ] **Step 2: Implement `app/pantry/page.tsx`** — server component following the handoff §4 copy framework (position → psychology → pain → outcome → mechanism → CTA), document-not-dashboard:
  - Hero: eyebrow "Pantry Review", title `"Your whole kitchen, sorted in one report"`, copy `"Send us photos of your pantry and fridge. You confirm the item list, and the same careful engine behind Revora's meal check groups everything into a calm, printable report. One payment. Nothing renews."`
  - **Sample report section** (the conversion asset): a static, clearly-labeled fictional excerpt (`"A sample, from a fictional kitchen"`) rendered with the REAL report row classes from `app/report/[id]/page.tsx:89-135` — three short sections "Enjoy freely" (e.g. plain Greek yogurt — one line), "Worth a tweak" (instant oatmeal packets + one swap line), "Handle with care" (sweetened juice + one swap line), each row carrying its semantic risk border. Every judged line reuses ledger-approved result phrasing patterns (`result-moderate-example` / `result-high-example` shapes) — qualitative only.
  - Honesty block: `"How it works"` — photos → you confirm the list → report by email; `"Photos are deleted after your report is delivered."`; the standard informational-only disclaimer footer (`result-disclaimer` class, verbatim ledger `result-footer` text).
  - `<PantryBuyButton source="landing" />` + a `field-hint` price line reading the display from `process.env` — `ponytail:` price display for pantry is a build-time constant `"$49"` in this page until a pantry variant test exists; single call-out comment in code.
  - `robots: noindex` NOT set (this page is the cold-traffic front door — it must be indexable).
- [ ] **Step 3: Claims checkpoint** — the sample-report copy is the risky surface: run the claims CI → PASS; add ledger rows `pantry-landing-hero`, `pantry-landing-sample-*` (class `result-qualitative-impact` / `result-adjustment` for the sample rows, `product-role` for the hero/CTA). Manually verify the sample rows against the banned families list (no numbers, no GI/GL, no outcome promises).
- [ ] **Step 4: Run** → PASS. — **Step 5: Commit** — `git commit -am "feat(pantry): landing page with claims-audited sample report + in-app buy"`

#### Task 6.3: Entry points (post-verdict + wall decline)

**Files:**
- Modify: `components/result-card.tsx` (result branch, after the disclaimer), `components/trial-wall.tsx` (already done in 4.2 — verify the `/pantry` link resolves now)
- Test: extend result-card tests

- [ ] **Step 1: Failing test** — MODERATE/HIGH results render a `field-hint` line `"Want your whole kitchen checked once? See the Pantry Review — one payment, nothing renews."` linking `/pantry`; SAFE and non-result kinds render nothing (no piling on; and never in onboarding or the boundary screen — those surfaces don't render result cards' pantry line because the line only attaches to MODERATE/HIGH results).
- [ ] **Step 2: Implement** (3 lines in the result branch, gated `response.risk !== "SAFE"`). — **Step 3: Claims checkpoint** — result-card already scanned; run → PASS; ledger row `pantry-entry-result-card`. — **Step 4: Run** → PASS. — **Step 5: Commit** — `git commit -am "feat(pantry): post-verdict entry point (Be careful / Hold off only)"`

**Phase 6 acceptance criteria:** `/pantry` renders the landing + sample; the buy button opens a live (test-mode) `mode:"payment"` checkout; completing it creates a `pantry_orders` row and sends the intake email via the UNTOUCHED webhook branch; wall-decline and post-verdict links resolve; pantry funnel events fire; claims CI green.
**Rollback:** the landing page and entry links are pure additions — revert the commits; the pipeline and Payment-Link path are unaffected.

---

### Phase 7 — "Enjoy it anyway" (Approach B): keep-most enrichment

**Goal:** Be-careful/Hold-off cards present two enjoyment-preserving DOs — keep-most (qualitative) + the existing swap — via the deterministic coach-outputs seam. The engine's safety behavior is untouched.

**Files:** see tasks · **Migrations:** none · **Claims checkpoint:** Task 7.1 IS the checkpoint — it gates the whole phase.

#### Task 7.1: Claims-ledger assignment FIRST (the feasibility gate — no code before this passes)

**Files:**
- Modify: `docs/safety/copy-ledger.md`

- [ ] **Step 1: Draft 8–10 candidate keep-most / set-aside phrases.** Requirements: DO-framed (never "skip"/"avoid"/"don't"), qualitative only (no cups/grams/numbers/percentages), one sentence, enjoyment-preserving, generic enough to be true for any MODERATE/HIGH meal (the derivation is deterministic — it cannot see components). Starting candidates:
  1. "You can still enjoy this — a smaller serving of the carb-heavy part keeps most of the pleasure."
  2. "Enjoy a smaller portion now and set the rest aside for later — same food, gentler pace."
  3. "Keep the parts you love and go lighter on the most refined part of the plate."
  4. "Have it, and let the sweetest component be a few good bites instead of the whole thing."
  5. "Enjoy it with the richest part scaled back a little — the taste stays, the load eases."
  6. "Set a portion of the carb-heavy part aside for tomorrow and enjoy the rest now."
  7. "A more modest serving of the starchy part still gives you the meal you wanted."
  8. "Keep the meal — make the refined-carb part the smallest thing on the plate."
- [ ] **Step 2: Audit each against the ledger + boundary** — for every candidate: run it through the `BANNED` regexes of `claims-boundary-copy.test.ts:14-25` (a quick local script or careful read), the copy-ledger notes discipline (no diagnosis/treatment/reversal/future-A1C/exact numbers), and the coach-outputs tone tests' rules (`tests/unit/revora/coach-outputs.test.ts:92-106`: one sentence, no "must/never/don't/avoid", no backward judgment, no glycemic numbers). Record every candidate in the ledger as a row (`Status: Draft`), then flip the survivors to `Approved` with `Allowed Claim Class: result-adjustment` and evidence rows `CDC-MEAL-PLANNING, CDC-HEALTHY-CARBS` (matching `result-high-example`'s pattern).
- [ ] **Step 3: Pick ONE approved phrase** as the launch `KEEP_MOST` constant (deterministic, like `SEQUENCING_TIP`). **If zero candidates survive the audit, STOP the phase here and report** — that outcome is the gate working, per the handoff.
- [ ] **Step 4: Commit** — `git add docs/safety/copy-ledger.md && git commit -m "docs(claims): enjoy-it-anyway keep-most phrasebank, ledger-audited (Approach B gate)"`

#### Task 7.2: `keepMost` in coach outputs

**Files:**
- Modify: `lib/revora/coach-outputs.ts:20-56`, `lib/client/ui-state.ts` (result variant), `lib/client/check.ts` (result normalization, `:167-187`)
- Test: extend `tests/unit/revora/coach-outputs.test.ts`

**Interfaces:**
- Produces: `CoachOutputs = { sequencingTip; postMealAction; keepMost: string | null }`; `keepMost` non-null iff `kind === "result" && risk !== "SAFE"` — exactly the existing gating. Consumed by 7.3.

- [ ] **Step 1: Write the failing tests**

```ts
it("keepMost is the approved phrase for MODERATE and HIGH", () => {
  expect(deriveCoachOutputs(moderateResult).keepMost).toBe(KEEP_MOST);
  expect(deriveCoachOutputs(highResult).keepMost).toBeTruthy();
});
it("keepMost is null for SAFE and every non-result kind", () => { /* mirrors existing null tests */ });
it("keepMost obeys the tone rules", () => {
  // reuse the file's existing tone assertions: one sentence, no must/never/don't/avoid/skip,
  // no digits, no backward judgment — add "skip" to the banned list for this field.
});
it("CheckApiResponseSchema requires keepMost on result kinds", () => { /* extend the schema tests */ });
```

- [ ] **Step 2: Run to fail.** — **Step 3: Implement** — in `coach-outputs.ts`: add the constant (the Task 7.1 winner, e.g.)

```ts
// "Enjoy it anyway" (Approach B, 2026-07-05 handoff §6): the promise is
// addressing the pain WITHOUT losing food enjoyment. Qualitative only,
// DO-framed, MODERATE/HIGH only — SAFE gets nothing (no piling on).
const KEEP_MOST =
  "You can still enjoy this — a smaller serving of the carb-heavy part keeps most of the pleasure.";
```

extend the type, the derivation (`keepMost: KEEP_MOST` beside the other two, null in the early return), and `COACH_FIELDS` (`keepMost: z.string().nullable()`). In `lib/client/ui-state.ts` add `keepMost: string | null` to the result variant; in `lib/client/check.ts` add `keepMost: asNullableString(response.keepMost)` beside `sequencingTip` (`:183`) — tolerant of absence, same as the other coach fields.

- [ ] **Step 4: Run** — `npx vitest run tests/unit/revora` → PASS, including the claims scan (coach-outputs.ts is already in `COPY_FILES`) and ALL untouched postprocess/engine tests. — **Step 5: Commit** — `git commit -am "feat(coach): deterministic keepMost output (enjoy-it-anyway, claims-gated)"`

#### Task 7.3: Render the enjoyment frame on the card

**Files:**
- Modify: `components/result-card.tsx:45-84` (result-list)
- Test: extend result-card tests

- [ ] **Step 1: Failing test** — MODERATE/HIGH cards render, in order: reason → `Enjoy it anyway: {keepMost}` → `Swap: {swap}` → `Adjustment: {adjustment}` → sequencing → post-meal; SAFE renders none of the enjoyment lines (unchanged).
- [ ] **Step 2: Implement** — one new conditional block in the result-list, same shape as the sequencingTip block (`:56-60`), `data-testid="keep-most"`, label text `Enjoy it anyway:`. Reordering swap above adjustment is presentation-only (JSX order), no data change.
- [ ] **Step 3: Claims checkpoint** — result-card already scanned; run → PASS; ledger row `keep-most-label`.
- [ ] **Step 4: Run all + smoke** → PASS. — **Step 5: Commit** — `git commit -am "feat(coach): render enjoy-it-anyway keep-most line on Be-careful/Hold-off cards"`

**Phase 7 acceptance criteria:** MODERATE/HIGH cards show the two enjoyment DOs (keep-most + swap); SAFE untouched; every phrase ledger-approved BEFORE code landed; engine tests byte-identical; claims CI green.
**Rollback:** revert 7.2/7.3 commits — the field is additive; older clients already tolerate its absence (check.ts normalization).

---

### Phase 8 — Launch readiness: QA walkthrough, price-test runbook, flag flip

**Goal:** the Definition of Ready demonstrably passes end-to-end in a preview environment with `PAYWALL_MODE=trial` + Stripe test mode; the flip procedure, price-test runbook, and rollback are written down; production flips only after the walkthrough is green.

**Files:** see tasks · **Migrations:** none (verify 0002 applied in prod before flip) · **Claims checkpoint:** full-suite run (`npx vitest run tests/unit/revora/claims-boundary-copy.test.ts`) as a release gate.

#### Task 8.1: Definition-of-Ready smoke spec

**Files:**
- Create: `tests/smoke/trial-wall.spec.ts` (Playwright, port-3100 pattern from `tests/smoke/`)

- [ ] **Step 1: Write the spec** (runs with `PAYWALL_MODE=trial`, `AUTH_EMAIL_STUB_DIR` set, Stripe stubbed at the fetch boundary or test-mode):
  - **Taster:** fresh context → `/` redirects to `/onboarding` → tap "oatmeal" chip → form prefilled → submit (stub engine per existing smoke patterns) → result renders → `localStorage["revora.taster.v1"].used === 1`.
  - **Exhaustion:** seed `revora.taster.v1 = {firstDay: today, used: 10}` → submit → lands on `/subscribe` → `[data-testid="trial-wall"]` visible.
  - **Day 2:** seed `{firstDay: "2020-01-01", used: 2}` → submit → wall.
  - **Wall → checkout:** walk value → proof → start, enter email, assert `POST /api/trial/start` fires and navigation goes to the (stubbed) checkout URL.
  - **Decline catch:** `/subscribe?declined=1` shows `[data-testid="pantry-catch"]` linking `/pantry`.
  - **Pantry:** `/pantry` renders the sample report sections + `[data-testid="pantry-buy"]`.
  - **Legacy guard:** with `PAYWALL_MODE=legacy`, `/subscribe` shows `[data-testid="paywall-card"]` and `/` does NOT redirect a seeded returning user.
- [ ] **Step 2: Run** — `npx playwright test tests/smoke/trial-wall.spec.ts` → PASS. — **Step 3: Commit** — `git commit -am "test(smoke): definition-of-ready trial wall + taster + pantry walkthrough"`

#### Task 8.2: Manual DoR walkthrough (preview env, Stripe test mode) — the release gate

- [ ] **Step 1: Preview env setup** — deploy the branch; set `PAYWALL_MODE=trial`, `TRIAL_PRICE_VARIANT=1299`, test-mode Stripe keys + the test-mode price IDs (OQ-2), test webhook endpoint (`stripe listen` or a test-mode webhook pointing at the preview URL).
- [ ] **Step 2: Execute the DoR script and record evidence** (screenshots/log lines per step) in `docs/handoff/2026-07-05-dor-walkthrough.md`:
  1. Fresh browser: taster runs, ≤10 checks, betrayal chip aha; 11th check → wall.
  2. Simulated Day 2 (edit `firstDay` in devtools): hard wall, no residual checks.
  3. Wall → email → Stripe test checkout with `4242…` card → `/trial/started`; magic-link email (stub dir or real Resend test) signs in → `/welcome` → unlimited checks; `subscriptions` row `status=trialing`, `price_variant=1299`.
  4. Advance the trial clock (Stripe test clocks, or set the row's `current_period_end` to +36h in the preview DB) → run the cron once (`curl -H "Authorization: Bearer $CRON_SECRET" <preview>/api/cron/trial-precharge`) → pre-charge email received with exact date + amount → **one tap on the cancel link** → `/canceled` → Stripe shows `cancel_at_period_end=true`. Second cron run sends nothing.
  5. Separate trial WITHOUT cancel: with a Stripe **test clock** advanced past trial end, `invoice.paid` arrives → row flips `active` → `trial_converted` in logs — the auto-charge at $12.99 is proven (test mode).
  6. Pantry: `/pantry` → buy → test checkout → intake email → claim → upload photos (stub extractor `PANTRY_EXTRACT_STUB=1`) → confirm list → report ready at `/report/[id]` + report email.
  7. `npx vitest run tests/unit` fully green (claims scan included); `npx playwright test` green.
  8. Play/TWA untouched: `npx vitest run tests/unit/server` Play tests green; `paywall-card.tsx` diff-free this branch except none (verify `git log --oneline -- components/paywall-card.tsx` shows no commits from this plan).
- [ ] **Step 3: Commit the evidence doc.**

#### Task 8.3: Price-test runbook + flip procedure

**Files:**
- Create: `docs/runbooks/price-test.md`

- [ ] **Step 1: Write the runbook** (content, not placeholder):
  - **Cohorting:** one variant per traffic window/community: set `TRIAL_PRICE_VARIANT` (and redeploy) per window; never run two variants while one community (e.g. r/prediabetes) is actively linked. Log window start/end + source in the runbook table.
  - **Metrics (per §3 of the handoff):** trial-start rate = `trial_started` (Umami) ÷ `wall_viewed`; trial→paid NEW-ONLY = SQL `SELECT price_variant, COUNT(*) FILTER (WHERE status='active') AS converted, COUNT(*) AS started FROM subscriptions WHERE provider='stripe' AND price_variant IS NOT NULL GROUP BY 1` (a row converts exactly once — renewals cannot pollute it); margin/user = Stripe revenue minus taster+trial OpenAI spend (from the OpenAI usage dashboard over the window — manual for now).
  - **Guardrails:** taster→wall→trial-start drop-off (wall too scary?), refund/chargeback count (Stripe), community sentiment (manual).
  - **Decision rule:** pre-commit ~2 weeks or ~100 activated users per arm; promote on margin-per-user without cratering trial-start; only "paid" counts (card-abandon happens at the form).
  - **Flip procedure (prod):** verify 0002 applied → verify all four Stripe env price IDs + `STRIPE_WEBHOOK_SECRET` (live) + webhook events list (2.1 step 4) → verify Phase 3 cron in `vercel.json` deployed and heartbeat row appears → set `PAYWALL_MODE=trial`, `TRIAL_PRICE_VARIANT=1299` → deploy → immediately run one real card end-to-end (founder card, then one-tap cancel) → watch logs for `trial_started`.
  - **Rollback:** set `PAYWALL_MODE=legacy` → redeploy. Existing trialing/premium rows keep working in legacy mode (`PREMIUM_STATUSES` includes trialing); nobody loses paid access. Data loss: none (all new columns nullable).
  - **Existing-user note:** at flip, previously signed-in free users hit the hard wall on their next check (status `lapsed`/`none`). This is Decision D by design ("no residual free checks, ever") — the wall is their trial offer. No backfill required.
- [ ] **Step 2: Commit** — `git commit -am "docs(launch): price-test runbook + flag-flip/rollback procedure"`

#### Task 8.4: Marketing-asset pipeline — `/demo` fixtures route + screenshot capture + asset rules

**Files:**
- Create: `app/demo/page.tsx`, `scripts/capture-marketing-shots.mjs`, `docs/runbooks/marketing-assets.md`
- Modify: `tests/unit/revora/claims-boundary-copy.test.ts` (`COPY_FILES` += `"app/demo/page.tsx"`)

**Interfaces:** consumes `<ResultCard/>` (presentational — accepts fixture responses), `<DemoCheckCard/>` (5.5), the `.first-win` block markup (5.3). Produces `marketing/screenshots/*.png` (gitignored or committed — founder's call at execution) reused for Reddit posts, `/subscribe` proof imagery, and the future Play listing.

- [ ] **Step 1: Implement `app/demo/page.tsx`** — `robots: noindex`, a single column of `data-shot`-tagged sections rendering ONLY ledger-approved fixture content: (a) `<DemoCheckCard/>`; (b) `<ResultCard/>` with a SAFE fixture (ledger `result-safe-example` text), a MODERATE fixture (`result-moderate-example` + the Phase 7 `keepMost` phrase + the coach phrasebank strings verbatim), and a HIGH fixture (`result-high-example`); (c) the clarify state (`result-clarification-example`) — the honesty screenshot is a differentiator, show it proudly; (d) the Day-1 `.first-win` block. Every string is copied verbatim from `docs/safety/copy-ledger.md` / `lib/revora/coach-outputs.ts` — the page invents NO copy, and the claims scan enforces it once the file is in `COPY_FILES`.

```tsx
export const metadata = {
  title: "Demo fixtures — Revora",
  robots: { index: false, follow: false }
};
```

- [ ] **Step 2: Implement `scripts/capture-marketing-shots.mjs`** (manual-run only, never in CI — Playwright is already installed):

```js
// node scripts/capture-marketing-shots.mjs  (dev server must be running on :3000)
import { chromium } from "playwright";

const VIEWPORTS = [
  { name: "phone", width: 375, height: 812, deviceScaleFactor: 3 },
  { name: "store", width: 1080, height: 2340, deviceScaleFactor: 1 }
];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: vp.deviceScaleFactor });
  await page.goto("http://localhost:3000/demo");
  for (const section of await page.locator("[data-shot]").all()) {
    const name = await section.getAttribute("data-shot");
    await section.screenshot({ path: `marketing/screenshots/${name}-${vp.name}.png` });
  }
  await page.close();
}
await browser.close();
console.log("done → marketing/screenshots/");
```

- [ ] **Step 3: Write `docs/runbooks/marketing-assets.md`** (real content, the asset rules): the outcome principle (show the *moment of relief* — kitchen question → calm answer — never the interface for its own sake); the caption formula `[user's moment] → [Revora's answer]`; per-surface guidance (landing/`/subscribe` render live components, off-site surfaces use `/demo` captures; pantry assets = the sample report opening on "Enjoy freely", founder's real pantry for the Reddit post; store listing = 3–4 shot daily-relationship narrative with the North Star line VERBATIM per `docs/product-marketing.md`); the hard bans (no numbers/graphs/trajectories, no outcome testimonials — "reversal" family, no fabricated precision, no scarcity framing); and the ledger rule: **every caption written for any asset gets a `launch-informational` ledger row before publication.** Regeneration: rerun the script after any UI/copy change; assets must never lag the shipped product.
- [ ] **Step 4: Claims checkpoint** — `COPY_FILES` += `app/demo/page.tsx`; run → PASS (the page only re-uses approved strings, so any drift fails loudly).
- [ ] **Step 5: Run the script once** against the dev server; verify `marketing/screenshots/` contains each `data-shot` at both viewports. — **Step 6: Commit** — `git commit -am "feat(marketing): /demo fixtures route + screenshot capture script + asset rules runbook"`

`ponytail:` for the day-2 Reddit post, manual 375px devtools screenshots are fine — this task exists because assets get regenerated every UI iteration during the price test; if that stops being true, stop rerunning the script, not the plan.

**Phase 8 acceptance criteria:** smoke spec green in CI; the manual DoR walkthrough documented with evidence and every step passing; runbooks (price-test + marketing-assets) exist; `/demo` captures generate at both viewports with only ledger-approved copy; production still `legacy` until the founder executes the flip per the runbook.
**Rollback:** N/A (this phase only proves + documents; the flip itself carries the runbook's rollback; `/demo` is noindex and inert).

## 5. Data model & migrations

**One migration for the whole plan** — `drizzle/0002_trial-billing.sql` (Phase 2, Task 2.2):

| Change | Detail | Reversible? |
|---|---|---|
| `subscriptions.status` check constraint | `+ 'trialing'` (drop + re-add the check; the column is `text`, so this is metadata-only, no table rewrite) | Yes — restore the old check after updating any trialing rows |
| `subscriptions.price_variant` | `text`, nullable — the WTP cohort stamp ("999"/"1299"/"1999") | Yes — nullable, drop-safe |
| `subscriptions.pre_charge_email_sent_at` | `timestamptz`, nullable — pre-charge idempotency stamp | Yes — nullable, drop-safe |

**No new tables.** The taster is device-local (`localStorage["revora.taster.v1"]`), trial state is the existing `subscriptions` table, pantry tables are untouched, and there is no events table (server events are log lines; conversions are derivable from `subscriptions`).

**Backfill:** none required. Existing rows: `active/canceled/grace/expired/refunded` all remain valid; `price_variant` stays NULL for pre-plan subscriptions (excluded from price-test SQL by `price_variant IS NOT NULL`). Existing *free* users get no row — they resolve to `status:"none"` and hit the wall at flip (intended, Decision D).

**Existing localStorage keys** (unchanged): `revora.profile.v1`, `revora.history.v1`, `revora.recheck` (sessionStorage). **New:** `revora.taster.v1`.

## 6. Instrumentation & pricing-test harness

**Client events (Umami, typed union in `lib/client/analytics.ts`)** — bounded props only, no free-form strings:

| Event | Props | Fires at | Phase |
|---|---|---|---|
| `taster_check` | `{used: 1–10}` | anonymous result under trial mode (`food-check-form`) | 4.3 |
| `wall_viewed` | `{variant}` | TrialWall mount | 4.2 |
| `trial_checkout_started` | `{variant}` | wall email-form submit | 4.2 |
| `trial_started` | `{variant}` | `/trial/started` mount | 2.7 |
| `pantry_viewed` | `{source: landing\|wall_decline\|result_card}` | PantryBuyButton mount | 6.2 |
| `pantry_checkout_started` | — | pantry buy click | 6.2 |
| existing 8 events | — | unchanged | — |

**Server events (`lib/server/billing/telemetry.ts` → console JSON in Vercel logs):** `trial_started` (webhook, trialing upsert), `trial_converted` (`invoice.paid`, trialing→active — the **new-only** conversion), `trial_canceled` (cancel_at_period_end or one-tap), `pantry_purchased` (add one line in `applyPantryCheckout` post-insert — Phase 6.1 step 5 covers it via test), `precharge_email_sent` (cron). All carry `priceVariant` where known.

**Source of truth for the price test:** the `subscriptions` table (`price_variant` + status), not analytics — events measure the funnel shape; the table measures money. Funnel: `wall_viewed → trial_checkout_started → trial_started → trial_converted`, per variant, per window.

**Harness mechanics:** `TRIAL_PRICE_VARIANT` env selects the single active price per deployment window; `lib/server/pricing.ts` maps variant → Stripe price ID + display; `GET /api/paywall` is the one client-visible source (no `NEXT_PUBLIC_*` price drift possible). Cohort discipline (one community, one price, one window) is procedural — `docs/runbooks/price-test.md` (8.3).

## 7. Test & QA plan

**Unit (Vitest + pglite, DI factories — house pattern):**
- New suites: `billing-telemetry`, `trial-schema`, `pricing`, `trial-start`, `cancel-token`, `cancel-route`, `trial-precharge`, `taster-store`, `pantry-checkout`, analytics-union, first-run-gate.
- Extended suites: entitlement (trialing/lapsed/none), `billing-routes` (trial lifecycle + IRON-RULE regressions: legacy checkout, pantry webhook, Play verify/RTDN unchanged), check-route (hard 402 under flag + legacy byte-identical), coach-outputs (`keepMost` + tone), result-card (upsell variant, keep-most, pantry link), daily-loop (first-win), welcome (taster clear).
- **Claims (release gate, every phase):** `tests/unit/revora/claims-boundary-copy.test.ts` with `COPY_FILES` grown to include: `lib/server/pantry/emails.ts`, `app/trial/started/page.tsx`, `app/canceled/page.tsx`, `lib/server/billing/emails.ts`, `components/trial-wall.tsx`, `app/api/check/route.ts`, `app/pantry/page.tsx`, `app/pantry/thanks/page.tsx`, `components/pantry-buy-button.tsx`, `components/demo-check-card.tsx`, `app/get-the-app/page.tsx`, `app/demo/page.tsx`. Plus a copy-ledger row for every new user-facing string (enumerated per task).
- **Do-not-break gates run at every phase:** full `tests/unit/server` (billing/Play/pantry), full `tests/unit/revora` (engine, postprocess, floors — zero expectation changes allowed).

**Integration/E2E (Playwright smoke, port 3100):** existing `tests/smoke/onboarding.spec.ts` extended (5.2); new `tests/smoke/trial-wall.spec.ts` (8.1) covering taster → exhaustion → Day-2 wall → checkout handoff → decline catch → pantry landing → legacy-mode guard.

**Manual DoR walkthrough (8.2)** — the release gate, in a preview env with `PAYWALL_MODE=trial` + Stripe **test mode** + test clocks: the five DoR clauses executed and evidenced, including a real auto-conversion via test clock and a real one-tap cancel from the actual email.

**A11y:** the existing axe suite (see repo commits `724315e`/`cdc4c28`) must stay green; new pages (`/pantry`, `/pantry/thanks`, `/trial/started`, `/canceled`, `/get-the-app`, the wall) get added to its route list if it enumerates routes — verify at execution. (`/demo` is a noindex asset page — exclude it.)

## 8. Risks, ceilings (`ponytail:`), and open questions

**Ceilings (deliberate, marked in code):**
- `ponytail:` **Device-local taster** — clear storage/incognito = fresh 10 checks. Accepted: it's a taster; marginal spend bounded by the Upstash IP limit + global daily cap (`middleware.ts`). Upgrade path: server-side first-seen cookie or fingerprint, only if abuse shows in the data.
- `ponytail:` **Log-based server metrics** — billing events are console JSON in Vercel logs. Fine at launch volume; upgrade to a real sink when weekly readouts hurt.
- `ponytail:` **Env-var feature flag** — flipping `PAYWALL_MODE` needs a redeploy. Edge-Config flag (launch-controls pattern) is the instant-toggle upgrade.
- `ponytail:` **Cancel-token misuse** — worst case, someone with the email cancels that trial at period end. No charge, no data exposure. Accepted.
- `ponytail:` **Pantry price display** — hardcoded "$49" on the landing until a pantry price test exists.
- `ponytail:` **`keepMost` is one static phrase** — deterministic like `SEQUENCING_TIP`. Rotation/variants only after the concept earns it.

**Risks:**
- **`signIn("resend", {redirect:false})` inside a route handler** (Task 2.6) — verified empirically in-phase; documented fallback (manual `verification_tokens` insert + `sendEmail`) behind the same DI seam.
- **Stripe SDK field drift** (`invoice.subscription` vs `parent.subscription_details`, `items.data[0].current_period_end`) — Task 2.4 pins tests to the installed SDK's shapes at execution time; the existing handler already reads `item.current_period_end` (`handlers.ts:401`), so the codebase's SDK is the reference.
- **Trial without profile consent:** a trial user who never clicks the magic link has a card on file but no profile/consent — fine (consent gates *health-data storage*, not billing), but their checks stay device-only until they sign in; the `/trial/started` copy pushes the link click.
- **Grandfathering shock:** existing free users hit the wall at flip. Intended (Decision D), but worth a founder heads-up post in the community — noted in the runbook.
- **Two Stripe modes in one webhook:** in-app pantry checkout + subscription checkout + (possibly) a dashboard Payment Link all hit the same endpoint — covered by the existing mode+price discrimination and idempotency; regression-tested each phase.

**Open questions (flagged, not guessed):**
- **OQ-1 — Stripe account identity:** the authenticated account is the legacy "Vendoval" livemode account (`acct_14W8GFKweWSWjefk`) full of unrelated products (dental-clinic plans, Vendoval records). A scam-wary 40–60 audience reads statement descriptors: ship Revora on this account (with per-product `statement_descriptor: REVORA`) or open a dedicated Revora account? **Founder decision before Task 2.1 step 5.** (Also explains why no pantry Payment Link exists here despite the 2026-07-04 handoff.)
- **OQ-2 — Test-mode provisioning:** QA needs test-mode keys + mirrored products. Confirm the founder can provide test-mode API keys for the chosen account.
- **OQ-3 — Annual plan on the wall:** the wall sells monthly-only (the trial converts to monthly per the handoff). Legacy `$99.99/yr` remains purchasable only via the legacy paywall. Keep annual off the wall for v1? (Plan assumes yes — one price, one decision.)
- **OQ-4 — `AUTH_SECRET` presence:** cancel tokens sign with `AUTH_SECRET`. Auth.js requires it in prod, but verify it's set in Vercel before Phase 3 ships.
- **OQ-5 — Pre-charge email for future non-trial renewals:** out of scope (only trials get the 2-day email). Confirm that matches the trust promise (the handoff scopes it to the trial).

## 9. Definition of Ready — checklist mapped to phases

| # | DoR clause | Proven by | Phases |
|---|---|---|---|
| 1 | Day-1 taster: ≤10 checks, no card, no account; betrayal aha via guided first check | taster store + client gate + chips + smoke `trial-wall.spec.ts` (taster/exhaustion) | 4.1, 4.3, 5.1, 5.2, 8.1 |
| 2 | Day 2: hard wall → 7-day card-required trial → unlimited everything | wall + `/api/trial/start` + webhook trialing + entitlement + hard 402; DoR walkthrough steps 2–3 | 2.2–2.7, 4.2, 4.4, 4.5, 8.2 |
| 3 | 2-day pre-charge email + one-tap cancel | precharge cron + cancel token/endpoints/page + account button; DoR walkthrough step 4 | 3.1–3.3, 8.2 |
| 4 | Auto-charge $12.99/mo absent cancel | `TRIAL_PRICE_VARIANT=1299` default + `invoice.paid`→active + test-clock conversion in walkthrough step 5 | 2.1, 2.4, 2.5, 8.2 |
| 5 | Pantry Review purchasable in-app → photos → confirm → report | landing + in-app checkout through the untouched webhook/pipeline; walkthrough step 6 | 6.1–6.3, 8.2 |
| — | All copy passes claims-boundary CI | `COPY_FILES` grown per task + ledger rows; full-suite release gate | every copy task; 8.2 step 7 |
| — | Play/TWA billing untouched/deferred | zero diffs to Play code paths; regression suites green; walkthrough step 8 | all phases (gate) |
| — | Instrumentation measures the funnel + price test | typed events + server telemetry + `price_variant` column + runbook SQL | 1.1–1.2, 2.4, 8.3 |
| — | Additive & reversible; paywall feature-flagged | `PAYWALL_MODE` legacy default; nullable-only migration; per-phase rollback notes | 2.2, 4.x, 8.3 |

**Execution order:** 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Phases 5–7 are mutually independent after Phase 4 (parallelizable), but 6 must land before any production flip (the wall's decline path links `/pantry`). The production flip itself is a founder action per the Phase 8.3 runbook, never part of a code phase.
