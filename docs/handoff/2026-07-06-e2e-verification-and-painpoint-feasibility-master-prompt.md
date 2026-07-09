# Master Prompt — End-to-End Verification + Pain-Point Feature Feasibility

**Purpose.** Paste this into a capable agent (Claude Code, or the project skills: `qa`, `investigate`, `office-hours`, `plan-eng-review`). It commissions **two** deliverables, each backed by **evidence, not confidence**:

- **Part A — Verify the app works flawlessly, end-to-end, and is genuinely ready for real paying users.** Map the codebase, then drive every user-facing flow to completion and prove it works (or list exactly what doesn't).
- **Part B — Decide, per pain point, whether it is *necessary* (important enough to build) AND *feasible* (buildable inside the claims boundary + current architecture) to fully integrate a feature that addresses it.** This is a product + engineering investigation, not an implementation task.

Do **not** silently "fix and move on." Report first; hand off fixes and feature builds as separate, reviewed steps. The only exception is a one-line, zero-risk correction (typo, dead link), which you may fix inline and must label as such.

**Skill routing (project convention — obey it):** product/feature-worth-building questions → invoke `office-hours` first. QA/testing the site → invoke `qa`. Bugs/500s/"why is this broken" → invoke `investigate`. Architecture/feasibility of a build → invoke `plan-eng-review`. Do not answer these ad-hoc when a skill exists.

---

## 0. Source of truth (read first, in this order)

1. `docs/handoff/2026-07-06-launch-audit-report.md` — **the current ground truth.** Its §8/§9 appendices record the 2026-07-06 remediation + provisioning session and the **one remaining production blocker**. Read it fully before touching anything.
2. `docs/safety/claims-boundary.md` and `docs/safety/copy-ledger.md` — the **non-negotiable** claims boundary. Every user-facing string and every proposed feature is checked against this. Banned families: diagnosis, treatment/prevention/cure/**reversal**, future-A1C prediction, glucose-curve prediction, exact mg/dL, exact GI/GL, FDA claims.
3. `docs/privacy/data-flow.md` — the privacy posture that must match what is deployed (stateful split: guests in-memory, signed-in AES-256-GCM at rest).
4. The three implementation plans: `docs/superpowers/plans/2026-07-05-launch-readiness-paywall-pantry.md`, `docs/superpowers/plans/2026-06-21-revora-launch-hardening.md`, `docs/production-implementation-plan-2026-07-01.md`.
5. `docs/superpowers/plans/2026-07-06-photo-assist-check-input.md` — D5 photo-assist; note it is **gated off in production** behind `NEXT_PUBLIC_PHOTO_INPUT` until its §6.3.4 binding gates clear (`lib/photo-input-flag.ts`).
6. `/home/tefera/Desktop/Various_files/target_audience_questions.md` — the **raw target-audience voice**. Part B extracts and re-confirms themes from this file directly, not from summaries. (If absent, say so and proceed from the report's §5 pain-point matrix.)
7. `package.json` scripts, `.env.example`, `docs/ops/env-reference.md` — how to run/build/test; the full env surface.

**Tie-break rule:** code wins for "what is," the plan/report wins for "what was intended," and the gap is itself a finding. **Never trust a `DONE` marker or a prior report's pass** — re-verify against code, tests, and the running app.

---

## 1. Known current state (2026-07-06 — verify, do not assume it still holds)

The prior session left production in this state. **Confirm each with your own commands**; flag drift.

- **Working in prod:** middleware/rate-limit crash fixed (`/api/check` returns 200, not `MIDDLEWARE_INVOCATION_FAILED`); `/api/health` → `upstash:"configured"`, `db:"ok"`, all crons `ok`; Railway `hourly-crons` scheduler runs on cadence; disclaimers present on all result surfaces; the banned "Reversal…" onboarding line removed; D5 photo-assist gated off in prod; GitHub connected to Vercel (pushes auto-deploy).
- **Provisioned:** `OPENAI_API_KEY` (valid, `gpt-5.4-mini` accessible), Upstash, live `STRIPE_SECRET_KEY` + webhook (`we_…`, 5 events) + `STRIPE_WEBHOOK_SECRET`, `SENTRY_DSN`, `AUTH_EMAIL_FROM=signin@revora.bio`, `SUPPORT_EMAIL`, fresh VAPID triple, `EDGE_CONFIG` kill-switch, `NEXT_PUBLIC_APP_URL=https://revora.bio`.
- **⚠ THE OPEN BLOCKER — the app cannot answer real checks:** the OpenAI account is on a **minimal/trial tier with no real billing.** Symptoms: `gpt-4o-mini` → `insufficient_quota`; `gpt-5.4-mini` works but is capped at **~50 requests / 100k tokens per ~6h window** and is deprioritized/slow, so prod checks hit fast `429`s and slow-call timeouts. **Fix is owner-only: fund the OpenAI account (platform.openai.com → Billing) and raise the tier.** Until then, every real check returns the calm `retry` fallback — Part A's core-flow verification will fail on this, and that is expected. **Report it, do not try to code around it.**
- **Pending human actions:** DNS `A revora.bio → 76.76.21.21` (domain + Stripe webhook go live once set); `PAYWALL_MODE` still `legacy` (locked business model dormant by design); counsel items (Q8 reversal line, Q9 SaMD imaging for D5, `/terms` placeholders); OpenAI billing (above).

---

## PART A — End-to-end verification & validation

**Goal:** prove the app works flawlessly for a real user, or produce the exact, evidence-cited list of what stands between here and that.

### A0. Map the codebase (do this first, keep it tight)
Produce a **one-page architecture map**: entry points (App Router routes under `app/`), the check pipeline (`middleware.ts` → `app/api/check/route.ts` → `lib/revora/service.ts` → engine), billing/entitlement (`app/api/billing/handlers.ts`, `lib/server/entitlement.ts`), auth/session, DB schema + migrations (`lib/server/db/`, `drizzle/`), coach/insights/BAI, crons (`app/api/cron/*` + Railway scheduler), PWA (`public/sw.js`, manifest), and the safety-frozen core (`lib/revora/postprocess.ts`, `service.ts`, `prompt.ts`, `schemas.ts`, `a1c.ts`). Note the trust boundaries (encryption at rest, claims boundary, rate-limit gate). This map orients everything below — do not skip it, do not let it sprawl.

### A1. Static verification (cheap, no side effects — do before running anything)
- `npm run typecheck` → report exit code + error count.
- `npx vitest run` → report **pass/fail/skip counts**. Any failure that passes in isolation is environmental (I/O-bound box) — say so; do not report it as a product defect.
- `npm run eval:revora` (offline, fixture-driven — confirm it does **not** spend real money before running) → report N/N.
- `npx playwright test tests/smoke/<changed-or-core>.spec.ts` on at least Mobile Chrome → report counts. Full Playwright under parallel load flakes on slow hardware; isolate to judge real failures.

### A2. Run it and drive every flow (state the environment per result)
Record an **Environments table** (`env → URL/port → commit → how reached`). Test locally (`npm run dev`) and against the live public alias (`revora-lovat.vercel.app`) where safe and read-only.

Walk each flow to completion; log every error, console warning, broken link, layout break, or claims-boundary violation:

- **Core check:** text → decision card (Clear/Be careful/Hold off); voice → transcript → result; (photo path is prod-gated — test locally with `NEXT_PUBLIC_PHOTO_INPUT=1`). Confirm the disclaimer renders **every** time, the **≤1-clarify** contract holds, and **no exact mg/dL, GI, or GL numbers** leak. **Note:** against prod this currently returns the `retry` fallback because of the OpenAI billing blocker (§1) — verify the *fallback* is calm and correct, and verify a *real* answer locally with a funded key if you have one, otherwise mark the live core-answer path `BLOCKED (OpenAI billing)`.
- **Onboarding:** first-run redirect, segmentation chips, guided first check, A1C captured **exactly once**, consent capture.
- **Taster → trial → paywall:** Day-1 taster cap, Day-2 hard wall, trial checkout (**Stripe test mode only — no live cards, no real spend**), `/trial/started`, 2-day pre-charge email path, one-tap cancel, `/canceled`. Remember prod runs `PAYWALL_MODE=legacy` — exercise trial mode locally.
- **Pantry Review:** landing, in-app purchase (test mode), post-verdict entry **only** on Be-careful/Hold-off, intake flow, sample-report claims audit.
- **Account/auth:** magic-link sign-in, `/welcome`, profile GET/POST/PATCH, guest-`localStorage`→server history migration on first sign-in.
- **Daily loop / history / streaks / insights / BAI:** data persists; **encrypted fields are actually ciphertext at rest — spot-check a real DB row, not just the code path**; progress copy stays inside the boundary.
- **Error/edge states:** rate-limited (429 + Retry-After), provider timeout, offline (PWA fallback incl. disclaimer), paused/kill-switch (flip the Edge Config `launch_mode`), malformed/non-food/out-of-scope input, expired session, canceled subscriber attempting a check.
- **Cross-cutting:** mobile viewport + touch targets, `axe` a11y pass, PWA installability, Sentry capture on a forced error (**confirm scrubbing — no raw food/A1C text in events**), `/api/health`.
- **Debt sweep:** grep `TODO`/`FIXME`, `console.log` of sensitive data, `NEXT_PUBLIC_` on any secret-sounding var.

### A3. Part A deliverable — bug/issue list (sorted, blockers first)

| ID | Area | Severity | Repro steps | Expected vs actual | Evidence (`file:line` / log / screenshot) |
|---|---|---|---|---|---|

Severity: `blocker` (prevents launch / loses money / violates claims-boundary or privacy) · `major` · `minor` · `cosmetic`. Do not fix anything non-trivial inline — list it.

---

## PART B — Pain-point feature necessity + feasibility investigation

**Goal:** for each pain point below, answer two independent questions with evidence, then a recommendation:

1. **Necessity / importance** — how central is this pain to the target user, by *volume and intensity* in their own words? (Cite `target_audience_questions.md` line refs and the report §5 matrix.) Is Revora's current coverage `strong` / `partial` / `not addressed` / `deliberately out of scope`?
2. **Feasibility** — can a feature that *fully* addresses it be built **inside the claims boundary and the current architecture**, without (a) crossing into diagnosis/prediction/CGM-replacement, (b) touching the safety-frozen engine files, or (c) creating a safety hazard for vulnerable users? What would it concretely cost (surfaces, data, model calls, new deps)?

**Invoke `office-hours` for the product framing and `plan-eng-review` for the buildability call.** Extract themes directly from `target_audience_questions.md` — the list below (from the launch-audit §5) is the starting set; confirm, sharpen, and add any others you find.

### Pain points to investigate (minimum set)

- **T1 — Unpredictable *individual* carb reactions.** *"oats are like a warm hug for my system, pasta feels like I've been mildly poisoned"* (L22); *"I can't have rice, full stop"* (L33). **The #1 theme by volume, and today a structural limitation:** Revora's verdict is population-level (food + A1C band), and CGM-style individualization is banned by the claims boundary. Feasibility hinges on: is there a *non-predictive, non-diagnostic* way to let a user record their own observed reactions (a personal food journal / "your notes on this food") that helps them **without** Revora claiming to predict their glucose? Weigh honestly against the boundary and the "flagship oatmeal example may contradict a user's lived experience" risk noted in §5.
- **T3 — Fear-of-food / orthorexia-adjacent.** *"this shit is giving me an eating disorder… afraid to eat"* (L221-231); *"I literally sit around hungry half the time"* (L239). **This is a safety pain, not a feature gap:** a "Hold off" verdict to an already food-fearful user can reinforce restriction. Investigate an ED-aware path (screening, de-escalation, a "food is not the enemy" off-ramp, permission-first framing) — necessity is high; feasibility requires **counsel + clinical input** and must not itself become medical advice. Flag which parts are eng vs. clinical.
- **T5 — Convenience pressure** (L75). Quick, on-the-go meals around work/school. Is the gap real given voice + photo input already lower friction, or is the missing piece quick meal-*ideas*/recipes (which the product currently does not do)? Feasibility of a lightweight "safer quick options" surface within the boundary.
- **T7 — Boredom with safe meals** (L218-219). Repetition fatigue. Today only reframed by the `repeat_meal` insight. Feasibility of a variety/idea surface without becoming a recipe engine or making nutrition claims.
- **T8 — Travel / "mental food break"** (L282-283). The wish to *stop* vigilant checking for a week directly conflicts with a per-meal checker. Is there a coherent, honest "travel mode" (e.g., gentler framing, no streak pressure) or is this deliberately out of scope? Decide, don't hand-wave.
- **T9 — Underweight / ARFID nuance** (L287-289). **Safety pain:** carb-restriction swaps are counter-indicated for underweight/ARFID users, and the app cannot detect them. Feasibility of a guardrail (onboarding context, a non-restrictive framing branch) — like T3, likely **clinical + counsel gated**; scope the eng vs. human split.
- **Any others you surface** from the file (e.g., T2 guilt/all-or-nothing, T4 overwhelm/conflicting advice, T6 confusing labs/doctor-distrust, T10 "is this specific ingredient OK?" label literacy). Include them if the evidence warrants.

### Part B deliverable — necessity × feasibility matrix + recommendations

| Pain point | Necessity (volume+intensity, evidence) | Current coverage | Feasible inside boundary? (how / blockers) | Est. cost (surfaces/data/model/deps) | Recommendation |
|---|---|---|---|---|---|

`Recommendation` ∈ {**Build now**, **Build after launch**, **Prototype/validate first**, **Decline — out of scope (state why)**, **Clinical/counsel-gated (name the gate)**}. For every "Build", sketch the smallest honest version (a `ponytail`-lean MVP), the claims-boundary check it must pass, and the copy-ledger rows it would add. For every "Decline", say plainly why (usually: crosses the boundary, or is a safety hazard the app can't safely own).

---

## Deliverables

Write **two** reports to `docs/handoff/` (use the actual run date):

1. `docs/handoff/<date>-e2e-verification-report.md` — Part A: architecture map, environments table, static-verification counts, flow-by-flow results, and the bug/issue list (blockers first). One-paragraph executive verdict up top: **ready for real users today? yes / no / conditionally**, with the top blockers.
2. `docs/handoff/<date>-painpoint-feasibility-report.md` — Part B: the necessity × feasibility matrix, per-theme write-ups, and a prioritized recommendation list split into **eng-buildable now** vs. **clinical/counsel-gated** vs. **decline (out of scope)**.

**Self-check before declaring done** (run `superpowers:verification-before-completion`):
- [ ] Every Part A result cites concrete evidence (`file:line`, command output, or the exact URL + observed response) and names the environment.
- [ ] Every test claim reports pass/fail/skip **counts**, not "tests exist / pass."
- [ ] The OpenAI billing blocker (§1) is reflected in the core-check verdict rather than worked around.
- [ ] Every Part B recommendation is justified against the **claims boundary** explicitly, and every "Build" names its copy-ledger rows + claims check.
- [ ] Nothing was deployed, pushed, Stripe-written, or emailed to real users; safety-frozen files untouched.

---

## Constraints (hard)

- **Do not modify** `lib/revora/postprocess.ts`, `service.ts`, `prompt.ts`, `schemas.ts`, `a1c.ts` — safety-frozen. Report on them; never touch them.
- **Claims boundary is absolute.** No proposed feature may diagnose, predict A1C/glucose, replace a CGM, or use banned language. A feature that requires crossing the boundary is a **Decline**, not a challenge to solve.
- **Vulnerable-user safety** (T3, T9) is not an eng-only call — route anything ED/ARFID-adjacent through counsel + clinical review; never ship an ED off-ramp as unreviewed product copy.
- **Stripe: read-only** inspection only; **test mode** for any checkout QA. No live charges, no real cards, no live object writes.
- **Do not** deploy, push to prod, submit to Play, spend real OpenAI/Stripe money, or send real emails. If something needs credentials or a decision you don't have (OpenAI billing, counsel sign-off, prod env), **say so in the report** — never guess a pass.
- Use `superpowers:systematic-debugging` for any bug you investigate in depth, `office-hours` for product-worth-building judgments, and `superpowers:verification-before-completion` before marking anything `DONE`.
