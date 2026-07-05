# Master Prompt — Revora Launch-Readiness Implementation Plan

**Purpose:** paste this prompt into a capable coding/planning agent (Claude Code, `/gsd-plan-phase`, `/iplan-eng-review`, or equivalent) to produce a rigorous, surgical implementation plan that takes Revora's **web app** to launch readiness — where a real client can use the app end-to-end and pay for both the subscription and the Pantry Review.

**How to use:** run it from the repo root (`/home/tefera/Desktop/Revora`). The agent must READ the source-of-truth docs before planning. The output is a written implementation plan (a doc), not code — do not let it start editing source until the plan is approved.

---

## ⬇️ THE MASTER PROMPT (everything below the line) ⬇️

---

You are a staff-level product + platform engineer shipping **Revora** — a trust-first, claims-regulated prediabetes meal-decision app — to **web-app launch readiness**. Your job in this task is to produce a **surgical, additive, phased implementation plan**, not to write code. Do not modify source files until the plan is approved.

### 0. Source of truth (READ FIRST, in this order)
1. `docs/handoff/2026-07-05-paywall-pricing-pantry-strategy-handoff.md` — **the decisions and recommendations you are implementing. This wins on all product/pricing/positioning calls.**
2. `docs/safety/claims-boundary.md` + `docs/safety/copy-ledger.md` — the claims boundary. Non-negotiable.
3. `DESIGN.md` — the design system. Do not invent a new one; extend it.
4. `docs/coach-mvp.md`, `docs/product-marketing.md` — retention thesis and positioning context.
5. `docs/handoff/2026-07-04-pantry-review-pipeline-session-handoff.md` — pantry pipeline context.

If anything you plan contradicts doc #1 or #2, the docs win — flag the conflict, don't silently deviate.

### 1. Locked decisions you MUST implement (do not re-litigate)
- **Web-first.** Build and validate on the Next.js PWA + Stripe. **Defer** Google Play / TWA billing (keep existing code, don't extend it).
- **Payment model = card-gated trial, no permanent free tier. HARD GATE ONLY — remove all soft gating.** Precisely:
  - **Day 1 (first calendar day of use):** up to **10 checks**, **no card, no account required**. This is the taster — 10 checks is deliberately enough to hit the healthy-food-betrayal aha. Nothing more.
  - **From Day 2 onward:** a **hard wall**. To use the app at all, the user must **start a 7-day free trial, card required**, which unlocks **unlimited everything**. No residual free checks, ever. No "come back tomorrow" soft path.
  - Trial **auto-converts to $12.99/mo** (final price set by the test in the handoff).
  - **Trust execution is mandatory and part of "done":** a **2-day-before-charge email** and **one-tap, visible cancellation**, positioned as the anti-Klinio proof.
- **Pricing ladder to support: $9.99 / $12.99 / $19.99** (not $6.99). The trial is the WTP instrument.
- **Clients must be able to pay for BOTH** the subscription (via the trial) **and** the Pantry Review (in-app, not just an external link) by launch.
- **"Enjoy it anyway" feature (Approach B):** enrich Be-careful/Hold-off results with two enjoyment-preserving DOs — keep-most (qualitative portion / set-a-component-aside) and swap. Qualitative only, DO-framed, never "skip/avoid."
- **All changes additive and reversible.** Every new user-facing string clears the claims-boundary CI test before merge.

### 2. TASK — produce three deliverables in one plan document

#### Part 1 — Deep codebase analysis (evidence-based, with `file:line`)
Inspect the repo and produce a **reuse map** that classifies every relevant area as **REUSE-AS-IS / MODIFY / BUILD-NEW**. At minimum, read and report on:
- **Entitlement & metering:** `lib/server/entitlement.ts` (`FREE_DAILY_CHECKS`, `getEntitlement`, `countChecksToday`), `app/api/check/route.ts` (metering, the 402 soft-upsell at ~`:55`, `deriveCoachOutputs` at ~`:156`), `app/api/entitlement/route.ts`.
- **Billing:** `app/api/billing/handlers.ts` (Stripe checkout, webhook, `applyPantryCheckout`, Play code), `app/api/billing/stripe/{checkout,portal,webhook}/route.ts`, `components/paywall-card.tsx`, `app/subscribe/page.tsx`, price env vars (`STRIPE_PRICE_*`).
- **Auth & profile:** `auth.ts` (Resend magic link), `middleware.ts`, `app/signin/*`, `app/welcome/page.tsx`, `app/api/profile/route.ts`.
- **Onboarding & core action:** `app/page.tsx`, `app/onboarding/page.tsx`, `components/food-check-form.tsx`, `components/daily-loop.tsx`, `components/result-card.tsx`, `lib/client/analytics.ts` (`track`), `lib/client/profile-store.ts`, the history/localStorage stores.
- **Result engine (do NOT change its safety behavior):** `lib/revora/*` — `coach-outputs.ts`, `postprocess.ts`, `schemas.ts`, `prompt.ts`, `a1c.ts`.
- **Pantry pipeline:** `app/pantry/{claim,intake}`, `app/api/pantry/*`, `app/api/cron/pantry-sweep/route.ts`, `lib/server/pantry/*`, `lib/pantry/extract.ts`, `components/pantry-*`, `app/report/[id]/page.tsx`, `app/admin/pantry/*`.
- **Data:** `lib/server/db/schema.ts`, `drizzle/` migrations.
- **Design & claims:** `DESIGN.md`, `app/globals.css`, `tests/unit/revora/claims-boundary-copy.test.ts`.
- **Instrumentation:** every existing `track()` call — enumerate what events exist today.

Output a table: Area → current behavior (with `file:line`) → REUSE/MODIFY/BUILD-NEW → note. Explicitly state what the handoff requires that **does not exist yet**.

#### Part 2 — Surgical implementation strategy (how, minimally)
For each change, define the **smallest additive path** and call out risk. Reuse before build (prefer stdlib/native/existing patterns; no new dependencies unless justified in one line). Cover explicitly:
- **The entitlement rewrite** — replace "5/day free forever + soft 402" with a **state machine**: `taster` (Day-1, ≤10 checks, anonymous, device-local) → `trialing` (card-on-file, unlimited) → `premium` → `lapsed`. No standing free tier. Define how "Day 1" is determined for an anonymous user (first-seen timestamp), the 10-check counter, and the hard-wall transition. **Name the ceiling:** device-local taster limit is gameable (clear storage = reset) — mark it `ponytail:` acceptable for a taster, with a server/fingerprint upgrade path if abuse appears.
- **Stripe trial** — `mode: subscription`, `trial_period_days: 7`, **card collected at trial start**; webhook handling for `trial_will_end`, `invoice.paid`, cancellations; entitlement transitions; idempotency. Reuse `handlers.ts` patterns.
- **The 2-day pre-charge email** — schedule off trial-end (cron or Stripe `trial_will_end`), reuse the Resend email infra; and **one-tap cancel** via the billing portal or a direct cancel action.
- **Account timing** — creation moves to **trial start** (card + email), earlier than the current `/welcome` flow. Reconcile with existing Resend magic-link auth and the profile/consent capture.
- **Onboarding first-run** — make the guided first check (with **oatmeal / banana / orange juice** chips) the default path inside the Day-1 taster; fix the orphaned `/onboarding`; single-source A1C so it isn't collected twice.
- **Pantry in-app payment** — add `app/pantry/page.tsx` (landing + sample report, `DESIGN.md` tokens) and an **in-app purchase path** (a `mode:"payment"` Stripe Checkout reusing billing infra, or the existing Payment Link as a stopgap — state the tradeoff). Wire the "catch on trial-wall decline" and "after Be-careful/Hold-off" entry points.
- **"Enjoy it anyway" (Approach B)** — likely a phrasebank enrichment of the existing adjustment/swap outputs, not a new card field. Specify the DO-framed, qualitative copy and the claims-audit checkpoint.
- **Instrumentation** — the events required to measure the funnel and the price test (taster-check, wall-hit, trial-start, trial→paid **new-only**, cancel, pantry-view/purchase). This is a first-class dependency — nothing in the plan is measurable without it.
- **Pricing-test harness** — how to serve $9.99/$12.99/$19.99 to matched cohorts (config/env-driven price IDs), without showing two prices to one community at once.
- **Design-system extensions** — the two `DESIGN.md` additions (selectable-chip pattern; calm Day-1/first-win treatment). Edit `DESIGN.md` first, per its own rule.
- **Migration & rollback** — DB migrations, feature-flagging the new paywall so it can be toggled, and how to revert without data loss. Note any backfill for existing profiles/subscriptions.

#### Part 3 — Phased implementation plan to readiness
Produce ordered phases. **Each phase must include:** goal, tasks, files touched, new/changed DB migrations, tests to add/update, a **claims-audit checkpoint** where copy changes, acceptance criteria, and a rollback note. Sequence so instrumentation lands before anything it must measure, and so the payment rework is feature-flagged.

Anchor the plan to this **Definition of Ready (the acceptance test for launch):**
> A brand-new visitor can, on the web app: (1) run the Day-1 taster (≤10 checks, no card) and hit the betrayal aha; (2) on Day 2 hit the hard wall and start a **7-day card-required free trial** unlocking unlimited everything; (3) receive a **2-day pre-charge email** and cancel in **one tap**; (4) be **auto-charged $12.99/mo** if they don't cancel; AND (5) separately **purchase a Pantry Review in-app**, upload photos, confirm the list, and **receive a report**. All copy passes the claims-boundary CI test. Play/TWA billing is untouched/deferred.

### 3. Output format (the plan document)
```
# Revora Launch-Readiness Implementation Plan
## 1. Codebase analysis — reuse map (REUSE/MODIFY/BUILD-NEW, with file:line)
## 2. Gaps vs. the handoff (what must be built/changed)
## 3. Architecture decisions (entitlement state machine, Stripe trial, email/cancel, account timing)
## 4. Phased plan
###   Phase N — <goal>
       - Tasks · Files · Migrations · Tests · Claims checkpoint · Acceptance criteria · Rollback
## 5. Data model & migrations
## 6. Instrumentation & pricing-test harness
## 7. Test & QA plan (unit, integration, e2e; the Definition-of-Ready walkthrough)
## 8. Risks, ceilings (ponytail:), and open questions
## 9. Definition of Ready — checklist mapped to phases
```

### 4. Hard constraints & guardrails
- **Claims boundary is absolute.** No exact GL/GI/mg-dL, no glucose/A1C prediction, no reversal-as-agent, no accuracy claims. Every new string clears `tests/unit/revora/claims-boundary-copy.test.ts` + the copy ledger. "Enjoy it anyway" portions stay **qualitative**; only on Be-careful/Hold-off.
- **The trial's transparency is part of "done," not a nice-to-have.** No 2-day email + no one-tap cancel = do not ship the trial.
- **Additive & reversible.** Feature-flag the new paywall; don't break existing users or the pantry pipeline.
- **Do not alter the result engine's safety behavior** (`lib/revora/*` floors, uncertainty, routing).
- **Reuse before build.** Prefer existing patterns/infra; justify any new dependency in one line.
- **Web-first.** Do not extend Play/TWA billing; keep it working, plan around it.

### 5. Explicitly OUT OF SCOPE (do not plan these now)
- Google Play / TWA billing work (deferred).
- Superwall integration (revisit post-launch at real traffic).
- TikTok-farming / multi-account distribution ops.
- Native widgets.
- Guilt / loss-aversion "stick" notifications (off-brand).
- The $6.99 price point.

### 6. Quality bar for the plan itself
The plan is good when an engineer could execute it phase by phase without asking what to do, every phase is independently shippable and reversible, the Definition of Ready is fully covered, and every copy-touching task names its claims checkpoint. Flag anything ambiguous as an open question rather than guessing. End with the Definition-of-Ready checklist mapped to the phases that satisfy each item.

---

## ⬆️ END OF MASTER PROMPT ⬆️

**Suggested run:** `/gsd-plan-phase` or `/iplan-eng-review` with this file as the brief, or paste the boxed section into a fresh Claude Code session at the repo root. Keep the agent in read-only/plan mode until the plan is approved.
