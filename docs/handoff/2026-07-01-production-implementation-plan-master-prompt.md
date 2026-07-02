# Master Prompt — Generate the Definitive Production Implementation Plan (full build, ship everything now, defer only D5)

**Date:** 2026-07-01 · **Repo:** `/home/tefera/Desktop/Revora` · **Type:** plan-generation prompt (produces a plan; does not itself build).
**Supersedes for scope:** `docs/implementation-plan-to-play.md` (coach-first, kill-gated) and `docs/handoff/2026-06-30-execute-full-implementation-plan-handoff.md`. Absorb their solid parts (stack decisions, heavy-build/store/legal phases, human-action inventory, DoD checklists); **drop their kill-gates and their camera-fully-deferred posture.**

---

## ⚠️ Mission (3 lines)

Produce **one definitive, execution-ready implementation plan** that takes Revora from its current state (a stateless text-in food-risk checker) to a **fully-fledged, production-ready app on Google Play** — the real bar: *real people rely on it, it is a real business.* Build the **entire product now** — all three input methods (except D5, see below), the full coaching suite, food sequencing, progress, accounts, billing, store launch, ops, and compliance — **with no feature staged behind retention/adoption/willingness-to-pay gates.** The plan's output is a durable document another engineer (or agent) can execute top-to-bottom without re-deriving scope.

**This is a decision already made by the owner. Do not re-litigate it.** A prior validation doc (`docs/direction-validation-2026-07-01.md`) recommended an incremental, kill-gated rollout; the owner has chosen instead to build the complete product in one release. Your job is to plan that build excellently and honestly, not to reopen the sequencing question.

---

## The owner's scope decision (the frame you plan inside)

1. **Build and ship the whole product now.** Every intended feature for a complete, general-audience app-store launch is in this release.
2. **No feature is deferred, gated, or held for "later," and nothing waits on a metric.** There are **no** WTP smoke-test gates, **no** D1/D7 retention gates, **no** "measure then decide" checkpoints. Kill-gates from the older plan become ordinary build milestones. (One-line consequence, stated once so it is not re-argued: this trades market validation for completeness and speed — the full paid backend and store release are built before any proof that users will pay. That is the owner's accepted risk. Plan the build.)
3. **Exactly one feature is deferred: Photo-assist (D5).** It must be **fully specified in the plan** (design, UX, data contract, build steps, pre-ship eval, ship criteria) **but explicitly marked "deferred — do not build or launch in this release."** Everything else ships.

### The three input methods (the plan must specify all three; ship two, defer one)

The app presents the user **three clearly labeled ways to log a meal, each with a one-line in-product description**:

1. **Text (D1) — "Type your meal."** The user types a short meal description; it goes to the existing hardened decision engine (`lib/revora/`) and returns one decision card (SAFE / MODERATE / HIGH + reason + one adjustment + one swap + sequencing tip). **Build and ship.**
2. **Voice (D1) — "Say your meal."** The user speaks the meal; speech is transcribed to text (browser Web Speech API / on-device dictation) and routed through **the identical text path and engine** — voice is an input convenience, not a separate brain. Handle transcription errors with the engine's existing one-clarify contract. **Build and ship.**
3. **Photo-assist, confirm-before-verdict (D5) — "Snap your meal, confirm the details, get your answer."** The user photographs the meal; a vision model produces a **draft description (dish, ingredients, portion) — never a verdict**; the user confirms or corrects it in one tap/edit; the **confirmed** description is submitted to the same text engine, which renders the verdict. The verdict never rests on unconfirmed perception. **Fully specify. Mark DEFERRED. Do NOT build in this release.**

All three converge on the one safety-hardened engine. State this convergence explicitly in the plan's architecture section — it is the reason adding input methods does not multiply safety risk.

---

## Hard constraints that bind EVERY feature (non-negotiable — carry into every phase)

These are not style preferences; several are health-harm, FTC, and FDA boundaries with primary-source backing. Any feature that cannot be built within them is built differently, not built loosely.

- **The 4 guardrails, in every user-facing string and feature:** (1) **no calories, ever**; (2) **prediabetes-only** audience, A1C 5.7–6.4% (out-of-range routes to boundary guidance, never a verdict); (3) **calm, permission-first, action-ending** copy — every result ends in exactly one concrete next action, never blame/restriction language ("avoid," "forbidden," "you shouldn't," "danger"); (4) **"should I eat this, now?"** decision framing, **not** "log your day" retrospective tracking. Source of truth: `docs/product-marketing.md`.
- **Claims boundary is LOCKED** (`docs/safety/claims-boundary.md`): informational-only, qualitative-only. **No exact GI/GL numbers, no carb grams, no mg/dL, no glucose-curve or future-A1C predictions** surface to the user, from any input method. **Never** "Revora reverses/treats/prevents/cures prediabetes" (app as agent); use the user-as-agent line ("Reversal is achieved through your dietary choices — Revora gives you the clarity to make them"). No FDA-approval/clearance claims. A disclaimer never licenses a stronger claim.
- **No accuracy marketing and no "AI-powered" lead.** Never "most accurate," "precise," "clinically proven," or "our AI calculates." An accuracy claim is an FTC-substantiation liability you cannot support. Honesty is the moat; the camera (when it later ships) is "the fast way to fill in the form," never "AI that reads your meal."
- **Reuse the engine, do not rewrite it.** All meal decisions — text, voice, and later D5 — flow through `lib/revora/` unchanged. Regression-test it; do not alter its behavior. Its conservative floors (ambiguous → MODERATE minimum; upper-band + uncertain carbs → never SAFE; ≤1 clarifying question; carbs-only → add protein/veg) are the safety contract every input method inherits.
- **The progress/motivation feature is compliant-by-construction.** Build progress, streaks, and adherence — but the "reversal score / BAI" must be the **behavioral-adherence index tied to CDC DPP citations** (adherence, scan consistency, post-meal action), **never a predicted A1C value** (`Revora_PRD_Amendments.md` Amendment 1 documents the original formula as a fabricated, uncited clinical claim — an FTC landmine). Progress copy stays qualitative and defers clinical interpretation to a clinician.
- **D5's honesty contract (when specified):** the vision model outputs a draft, never a verdict; **confirmation is unconditional** (no confidence threshold ever skips it); **portions are confirmed or the ambiguity floor governs — never silently guessed**; any chip the model flags as class-changing (sweetened-or-not, which-noodle, portion on a carb-dense dish) must be explicitly resolved, not swept through on an accept-all tap (anti-rubber-stamp). No numeric output surfaces. Full design in `docs/direction-validation-2026-07-01.md` §4.2 and pre-ship eval in §6.2 — the plan's D5 section must reproduce and build on those.
- **Privacy lockstep the moment state appears.** The current "no account, no database, no saved history" promise (`app/privacy/page.tsx`) changes the instant accounts/server history land. When that phase runs, update — in the same PR — `app/privacy/page.tsx`, `docs/privacy/data-flow.md`, the Play Data Safety answers in `docs/ops/play-twa-runbook.md`, and `docs/legal/counsel-brief.md`. A1C is GDPR Art. 9 special-category health data: encrypt at rest, access-control, and scrub from logs (extend `lib/revora/sentry-scrub.ts`).

---

## What you must produce

A single, durable, execution-ready plan at **`docs/production-implementation-plan-2026-07-01.md`**, written so a developer executes it top-to-bottom without re-deriving scope. It must contain, in this order:

1. **Executive summary + target definition.** The two-sentence product, the "fully-fledged / real business" bar, and the explicit statement: full build now, only D5 deferred.
2. **Current-state baseline** (verified; see below) — the exact starting point, stack, what to reuse unchanged, what's missing.
3. **Target architecture.** How the three input methods converge on the one engine; the new stateful layer (identity, DB, server history, coaching compute, billing, entitlement); the PWA→TWA packaging; where D5 slots in later without rework. Include a component/data-flow diagram (ASCII is fine) and the DB schema.
4. **Complete feature inventory** (the checklist of everything shipping — see the enumerated list below; nothing on it may be silently dropped). Two items are specified-but-not-built, and they are distinct categories: **D5 photo-assist = the single DEFERRED input method** (part of the roadmap, built in a later release), and **CGM correlation = EXCLUDED from launch scope, specified as post-launch increment 1**. Everything else ships in this release.
5. **Dependency-ordered phases.** Each phase: goal · exact build steps (files/modules/routes) · **"done when"** criterion · env/secrets it needs · tests to write (TDD) · which human-only actions it surfaces. Order by true technical dependency, **not** by validation gating. Group the heavy build so related work ships together (e.g., accounts + history + coaching-server + billing are one coherent backend push, not four staged gates).
6. **The three input methods — full specs.** Text, Voice (build); Photo-assist / D5 (fully specified, boldly marked deferred, with its own "when we later build this" sub-plan, data contract, pre-ship eval, and ship criteria).
7. **Compliance, legal, and store-launch workstream.** Claims/counsel review (incl. the flagged "reversal" lines), Data Safety mapping, health-app declarations, privacy/ToS, account/data-deletion flow + declared URL, GDPR/CCPA posture — as a parallel track with its own dependencies and long-lead items.
8. **Testing & quality strategy.** Unit/eval/Playwright/axe coverage for every new stateful flow; regression proof that `lib/revora/` behavior is unchanged; the engine consistency check (identical description → stable class); a11y bar.
9. **Ops, observability, and support.** Sentry + PII-scrub verification, privacy-safe analytics (no PII/A1C/food strings), monitoring/on-call, refund/support/incident-response scaffolding.
10. **Human-action inventory (exhaustive).** Everything requiring a person/money/credential/hardware/counsel — accounts, secrets, paid commitments, legal, domain/DNS, Play Console, signing/packaging, device testing, production cutover approvals. (Reuse and update the exhaustive list already in the 2026-06-30 handoff §0–§10.)
11. **Definition of Done** — two milestone gates (Heavy-Build DoD; Fully-Fledged-App DoD), every item mapped to a phase. These are completion gates, **not** go/no-go validation gates.
12. **Risks & open decisions**, with pre-decided defaults so execution never stalls (DB, auth, billing, push, analytics, email — see the defaults table in the 2026-06-30 handoff and carry them forward).

---

## The complete feature inventory the plan must cover (nothing here may be dropped)

Everything below **ships in this release** unless marked DEFERRED. This is the coverage checklist for §4 of the plan.

**Input & decisioning**
- Text input (D1) → engine → decision card. *(reuse existing form/route/engine; extend output)*
- Voice input (D1) → transcription → same text path. *(new)*
- **Photo-assist (D5) — DEFERRED (specified, not built).**
- The decision card: risk (SAFE/MODERATE/HIGH) + one qualitative reason + one adjustment + one lower-glycemic **swap**.
- **Food-sequencing coach** — "what to eat first" (fiber/protein/veg before refined carbs), grounded in the engine's guidance; a first-class output, not a hidden tip. *(new; PP-03)*
- **Post-meal actions** — one calm next step after a higher-impact meal (e.g., a short walk), within the action-ending guardrail. *(new; PP-06)*

**Coaching & relationship (build the full suite now — no gates)**
- Onboarding (A1C entry, prediabetes scoping, expectation-setting, honest framing).
- Meal **memory / history** (server-backed once identity exists; the coach remembers you across devices).
- **Daily loop + one gentle push nudge** (never guilt copy).
- **Streaks** and a simple week view.
- **Rule-based insights** from the user's own history ("most of your 'be careful' meals are breakfast" — forward-permission framing, never backward-judgment/surveillance tone).
- **Progress / adherence** view — the compliant behavioral-adherence index (see hard constraints), qualitative, CDC-DPP-grounded, never a predicted A1C.

**Accounts, data, and money**
- Lightweight identity/auth (magic-link).
- Hosted Postgres + schema + migrations + backups; A1C encrypted/access-controlled/log-scrubbed.
- Subscription billing end-to-end (subscribe / renew / cancel / restore / refund) with server-side receipt verification and enforced free-vs-paid entitlement; free tier + premium tier(s); paywall copy within the guardrails.
- Account + data-deletion flow with a declared deletion URL.

**Platform, store, ops, compliance**
- Production deploy on the real domain; env/secrets wired; `maxDuration` verified against the Vercel plan.
- PWA→TWA packaging (signed `.aab`, `assetlinks.json`), real-device QA.
- Play Console listing (correct positioning), Data Safety form, health-app declarations, content rating, privacy policy + ToS + in-app medical disclaimer.
- Sentry + PII-scrub, privacy-safe analytics, monitoring, support, incident response.

**Excluded from this release — the first post-launch increment (specify, do not build):**
- **CGM correlation (premium) — EXCLUDED from this release; planned as the first post-launch increment.** Do not build it in this release and do not treat it as a fourth input method (there are exactly three). Rationale (state it in the plan so it is not re-litigated): CGM does **not** move the critical/high pains — it shows the spike *after* the meal (retrospective, in tension with guardrail #4's "should I eat this, now?" decision framing), whereas Revora's value is the *pre-meal* decision; it serves only the small OTC-CGM secondary segment (~5–10%); it is the highest-cost, highest-risk item (Dexcom/Abbott OAuth via an aggregator, ongoing per-user cost, real hardware prerequisite, added SaMD/privacy scrutiny — the audit's `ISSUE-055` rated it 4–6 weeks minimum and recommended deferral); and it partly undercuts the core positioning of Revora as the honest, *cheaper alternative to a CGM*. The plan must include a short **"Post-launch increment 1: CGM correlation"** section that specifies it for later: the wellness/informational boundary it must stay within (display + "here's how to eat so it doesn't spike," **never** device-grade or diagnostic claims), its external dependencies and counsel/SaMD question, and its premium/opt-in framing — so it is plannable later with zero rework, but explicitly **not** part of the launch build.

---

## Evidence you must read before writing the plan (in order)

1. `docs/product-marketing.md` — positioning, voice, the 4 guardrails, store-copy source of truth.
2. `docs/safety/claims-boundary.md` (LOCKED) + `docs/safety/tone-uncertainty-policy.md` + `docs/safety/a1c-band-rubric.md` — the exact claims/tone/uncertainty contract every feature inherits.
3. `docs/direction-validation-2026-07-01.md` — the D5 confirm-before-verdict spec (§4.2), the pre-ship eval and kill-criteria for D5 (§6.2–6.3), and the input-model analysis; also the internal-doc corrections in §7.4 to fix before external use.
4. `docs/coach-mvp.md` — detailed coach-step specs (memory, nudge, insight, progress).
5. `docs/implementation-plan-to-play.md` and `docs/handoff/2026-06-30-execute-full-implementation-plan-handoff.md` — **mine the heavy-build/store/legal phases, the pre-decided defaults, the secrets list, and the exhaustive human-action inventory; discard their kill-gates and camera-fully-deferred stance.**
6. `Revora_PRD_Amendments.md` (esp. Amendments 1, 4, 6, 8) and `PRD/Glucosnap_prd_v2.md` §6 — the intended feature set and the specific fabricated-claim/FDA-trigger corrections to honor.
7. `docs/legal/counsel-brief.md` + `docs/ops/play-twa-runbook.md` + `docs/privacy/data-flow.md` — the compliance surface and the privacy-lockstep targets.
8. The codebase itself — confirm current state before planning (grep for image/camera/db/auth to verify what does and does not exist).

Read, then **verify** — do not rubber-stamp prior conclusions; §7.4 of the validation doc lists live inconsistencies (PP taxonomy mismatch, "96M vs 115.2M," unlinked accuracy citations, unresolved "reversal" lines) the plan should fix or flag.

---

## Current-state baseline (verified — the plan's starting point)

A **stateless, anonymous, text-in, single-shot food-risk checker** with a strong safety core. Assume nothing beyond this exists.

- **Stack:** Next.js 16.2.4, React 19.2.5, `openai` 6.36.0, `zod` 4.4.3, `@upstash/ratelimit` + `@upstash/redis` (rate-limit only), `@sentry/node` 10.60.0, `@vercel/edge-config`. **No DB client, no auth library** (verified clean). Test tooling: `vitest` 4.1.5, `@playwright/test`, `@axe-core/playwright`; scripts `typecheck`/`build`/`test`/`test:revora`/`eval:revora`.
- **Flow:** `app/page.tsx` → `components/food-check-form.tsx` → `POST /api/check` (`app/api/check/route.ts`, `runtime="nodejs"`, `maxDuration=15`) → `lib/revora/service.ts:checkFood()` → one OpenAI call → one decision card.
- **Input contract (`lib/revora/schemas.ts`):** `{ food: string ≤160, a1c: number 0–20 }.strict()` — no image field.
- **Reuse unchanged — `lib/revora/`** (~16 modules): A1C routing/out-of-scope, input-precheck, safety-contract, conservative floors, fallback, postprocess, sentry-scrub, eval-rubric, rate-limit, launch-controls. This is the reusable brain for all input methods.
- **PWA:** `public/manifest.webmanifest` (standalone), `public/sw.js`, `public/offline.html`, icons 192/512/maskable-512, `components/sw-register.tsx`.
- **Privacy (true today):** "no account, no database, no saved history" — changes at the backend phase (lockstep).
- **Play gap:** `public/.well-known/assetlinks.json` MISSING; `docs/ops/play-twa-runbook.md` exists but blocked pending prod + counsel.

---

## Method & rules for writing the plan

- **Dependency-ordered, not gate-ordered.** Sequence phases by what technically must precede what (identity before server history before billing before store submission). Where the old plan inserted a "measure retention, then decide" gate, replace it with a build milestone. Keep the genuinely sequential platform dependencies (prod build before TWA packaging before device QA before Play review).
- **Every phase carries:** goal · concrete steps (name the files/routes/modules) · "done when" · env/secrets · tests-first · human-action items surfaced.
- **TDD and green-at-every-commit.** New stateful flows get tests before implementation; vitest + Playwright + axe stay green; `lib/revora/` gets a regression guard proving behavior is unchanged.
- **Pre-decide the gray areas** (DB = Neon Postgres + Drizzle; Auth = Auth.js v5 magic-link + Resend; Billing = Play Billing/Digital Goods in the TWA with a web fallback + server receipt verification; Push = Web Push/VAPID; Analytics = Plausible/PostHog, no PII; Email = Resend) so execution never stalls; record any deviation in a short `docs/adr/` note. Carry these forward from the 2026-06-30 handoff's defaults table.
- **Surface, don't block, on human-only work.** For every account/secret/payment/keystore/device/counsel dependency, the plan builds everything up to it, mocks/dev-paths where possible, and logs it in the human-action inventory — it never silently assumes the human step is done.
- **D5 gets a complete but clearly-fenced section:** full design, the confirm-before-verdict data contract, the ≥100-meal pre-ship eval (zero under-warned confirmed verdicts, draft-accept ≥60%, dish-family ID ≥90%, silent-error-passthrough ≈0 on class-critical chips), the counsel SaMD question, and a bold **"DEFERRED — do not build in this release"** banner. It must be plannable later with zero rework because the three input methods already converge on one engine.

---

## What NOT to do

- **Do not reintroduce validation/kill-gates** (WTP smoke test, D1/D7, retention checkpoints) as go/no-go gates. The owner disabled them; they become build milestones.
- **Do not build D5 photo-assist** in this release — specify it fully, mark it deferred.
- **Do not add a fourth input method.** Exactly three: Text, Voice, Photo-assist(deferred). CGM is a premium correlation feature, not an input method — and it is **excluded from this release** (post-launch increment 1); do not build it.
- **Do not weaken the engine or its floors**, and do not let any input method (voice transcription, later D5) bypass the conservative floors or the ≤1-clarify contract.
- **Do not emit numeric glycemic claims** (GI/GL/carbs/mg-dL/future-A1C) from any surface, or make accuracy/"AI-powered"/reversal-by-app claims. Do not let a disclaimer launder a stronger claim.
- **Do not ship the backend without the privacy lockstep** doc updates in the same PR, or A1C without encryption/scrub.
- **Do not push, deploy to production, create paid accounts, spend money, or submit to Play** as part of planning — the plan documents these as human-action items.
- **Do not produce a vague plan.** Name files, routes, schema, tests, env, and "done when" for every phase. Comprehensiveness is the explicit bar here.

## First moves

1. Read the evidence docs (order above) and verify current state in the codebase (grep for image/camera/db/auth). 2. Draft the target architecture + DB schema + the three-methods-converge-on-one-engine diagram. 3. Build the complete feature inventory (§4) and confirm every item has a home in a phase. 4. Write the dependency-ordered phases with done-when/env/tests/human-actions. 5. Write the full D5 spec and fence it as deferred. 6. Write the compliance/store/ops workstreams, the exhaustive human-action inventory, the two DoD gates, and the risks/defaults. 7. Save the plan to `docs/production-implementation-plan-2026-07-01.md` and report a one-screen summary: phase list, what ships, the single deferred item, and the top human-action blockers.
