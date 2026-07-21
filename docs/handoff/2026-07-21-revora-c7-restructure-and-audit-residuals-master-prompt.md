# Revora — Session Handoff: §C7 Four-Jobs Restructure + Remaining Audit Residuals

**Written:** 2026-07-21 · **For:** the next execution session · **HEAD at handoff:** `74c6968` on `fix/domain-migration-revora-plus` · **Open PR:** https://github.com/tkiros/Revora/pull/23 (branch → `main`)

This is an executable continuation prompt. Read §A for what is already done (do NOT redo it), then execute §B in order, honoring the guardrails in §D and the gates in §E.

---

## A. State of the world (verified 2026-07-21, end of prior session)

### A1. Shipped in PR #23 (4 commits on `fix/domain-migration-revora-plus`)

The full record is `docs/handoff/2026-07-21-revora-phase0-billing-reliability-execution-report.md`. Summary:

- **All of the 07-20 audit's §C2 defects are FIXED with regression tests:** BC-1..BC-10 (cancel-confirm flow, `cancel_at_period_end` column + honest UI, webhook-independent checkout sync at `POST /api/billing/stripe/sync`, RTDN/heal guards, billing rate limits, inbox PII redaction + prune), RE-01..RE-10 (fail-closed trial wall, working Edge Config kill switch, telemetry safeParse, claim-before-send leases, build-stamped SW, CI drizzle drift gate, `persisted:false` honesty), PR-1..PR-6, HS-1, SA-12, AA-9, AA-10.
- **Verification at HEAD:** typecheck/lint/contract clean · `npm test` **1805 passed / 2 skipped** · `eval:revora` 11/11 · build PASS · `npm audit --omit=dev` 0 · full Playwright (3 projects × 2 servers) no deterministic failures (2 rotating machine-load flakes per run, all pass in isolation).
- **Migration pending deploy:** `drizzle/0013_cancel-at-period-end.sql` (adds `subscriptions.cancel_at_period_end`). Must be applied to prod DB as part of the deploy flow.

### A2. Infra completed by owner + prior session (do not redo)

| Item | State |
|---|---|
| Resend sending domain | **`contact.revora.plus`** verified — DKIM (`resend._domainkey.contact.revora.plus`) and SPF confirmed live in DNS. Code fallback + prod `AUTH_EMAIL_FROM` both `Revora <signin@contact.revora.plus>`. **The apex `revora.plus` is NOT the sending domain.** |
| `AUTH_EMAIL_FROM` (Vercel prod) | Was set-but-EMPTY (would have blanked every From); replaced with the correct value. Code also hardened (`|| fallback` on trimmed value). |
| Umami | `NEXT_PUBLIC_UMAMI_SRC=https://cloud.umami.is/script.js`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID=bc2160bc-c3d9-4866-9a93-eb768c1caace` set in Vercel **production + preview**. |
| Public surface | `https://revora.plus` serves the app HTTP 200, no Vercel SSO wall. Apex A → Vercel. |
| Sentry | Server `SENTRY_DSN` exists in prod. **`NEXT_PUBLIC_SENTRY_DSN` (client) is MISSING** — build warns (does not fail) until set. |

### A3. Infra still OPEN (blocking or near-blocking)

1. **Stripe live webhook is NOT registered** (BC-3's infra half; the in-code sync endpoint is defense-in-depth only). The Stripe MCP server is installed but **needs a per-session OAuth**: call `mcp__stripe__authenticate`, have the owner open the URL, then `mcp__stripe__complete_authentication` with the callback URL. Then create a webhook endpoint:
   - URL: `https://revora.plus/api/billing/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`
   - Put the returned signing secret into Vercel: `printf '<whsec_...>' | vercel env add STRIPE_WEBHOOK_SECRET production` (the CLI is linked + authed as `tkiros`). Check first whether one already exists (`vercel env ls production`).
2. **`www.revora.plus` has no DNS record** — add CNAME → Vercel + canonical redirect (P0.1 pass criterion).
3. **`NEXT_PUBLIC_SENTRY_DSN`** — provision a client DSN, add to Vercel prod+preview.
4. **P0.4 support/refund ops** — `support@revora.plus` forwards via Namecheap, but there is no monitored ticket path, no in-account "Request help or refund" flow, no case ledger, no published SLAs. Partially a CODE item (see B3).
5. **RE-08 one-time prod structural comparison** vs `drizzle/meta/0013_snapshot.json` (needs prod `DATABASE_URL`).
6. **DMARC** on the sending path is `p=none` at the apex; after a week of clean sending, tighten per the launch checklist.

### A4. First actions on resume (before any changes)

```bash
cd /home/tefera/Desktop/Revora
git status --short --branch          # expect clean; PR #23 may be merged or still open
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run typecheck
env -u REVORA_MODEL -u OPENAI_BASE_URL npm test    # baseline to beat: 1805 passed / 2 skipped
```
If PR #23 is merged, branch from fresh `main`. If not, ask the owner whether to continue stacking on this branch or wait for the merge.

---

## B. Execution plan (in order)

### B1 — Close the infra gaps that need only tools you have

Stripe webhook via MCP (A3.1) → `www` DNS cannot be done from CLI (owner does it in Namecheap; Vercel side: `vercel domains` / project settings can add www + redirect — try `vercel` first) → confirm `STRIPE_WEBHOOK_SECRET` set. Verify end-to-end with a Stripe test event if the dashboard/MCP allows sending one.

### B2 — §C7: the four-user-jobs restructure (the main build of this session)

Restructure the UI around four jobs. **Engine/billing behavior unchanged.** Map to existing routes/components. Full spec in `docs/handoff/2026-07-21-revora-phase0-access-billing-e2e-and-finite-program-execution-handoff.md` §C7; condensed:

1. **Home — "Help me decide now" (`/home`)**: one main action (Check a meal — text/voice/authorized photo), today's recent decision, ONE relevant next action. Remove competing clutter (history dumps, scores, Pantry promos, billing messages, journey cards all fighting).
2. **My Meals — "Help me remember what worked" (merge `/history` + `/memory` UX)**: recent checks + saved meals + favorites + search + edit notes + check-again + export + delete. May stay separate technically; must FEEL like one area. History = automatic record; Memory = user-curated.
3. **My Journey — "Show me what I'm learning" (`/progress` → journey)**: current stage, weekly practical brief, saved defaults, remaining uncertainty, one next experiment, pause/graduate/maintenance. **Avoid a usage-frequency-dominated score** — see the BAI fix below.
4. **Account — "Let me control everything" (`/account`, `/account/delete`)**: reminders, quiet hours, subscription/cancel, support/refunds, privacy/consent, export (link the new `/api/account/export`), health-data deletion, account deletion. Mostly exists; tidy into the four-jobs frame.

Boundaries: Pantry Review stays a separate one-time product; admin/crons/video-engine stay invisible.

**Design gates for this work:** run `/design-consultation` or `/plan-eng-review` + `/plan-design-review` before implementing; this is a large UI restructure and the repo has design-review skills wired. Keep all copy inside the claims boundary (`npm run contract` must stay green).

### B3 — Remaining 07-20 audit residuals (fix what is fixable without human gates)

Everything below is still OPEN in `docs/handoff/2026-07-20-revora-e2e-promise-retention-audit-report.md`. Work through them:

| ID | What | Constraint |
|---|---|---|
| **RV-3 (BAI weighting)** | Progress score falls when usage falls. Cap the consistency/frequency contribution once a floor is met, or replace the scored band with a non-scored recap. A more-confident user who checks less must never see "progress declined". | CODE — do it as part of B2 job 3. Blocks S2. |
| **RV-6** | Weekly artifact is a re-count of the user's own inputs — make the brief genuinely useful (one practical experiment, one uncertainty to close) without new clinical claims. | CODE + copy through claims boundary. |
| **Server-twin flags** | `NEXT_PUBLIC_PHOTO_INPUT` and `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS` are build-time only — cannot be killed without redeploy. Add server twins before treating either as an incident control (pattern: `MEAL_MEMORY_ENABLED` + `NEXT_PUBLIC_MEAL_MEMORY`). | CODE. |
| **HS-3** | Do NOT flip `REVORA_ENFORCE_COMPONENT_MENTION`. The fix is: exempt floored drafts from the retry-card path first, then measure. Implementing the exemption is in scope; flipping the flag is not. | CODE (exemption only). |
| **P0.4 code half** | In-account "Request help or refund" flow producing an authenticated case (store a row, email support@, show case id + SLA copy to the user). Simplest honest version; no ticket SaaS needed. | CODE. |
| **P0.5** | Verify the truth-index still matches deployed behavior after PR #23 (it changed cancel flow, export, analytics). Update `docs/*truth-index*` / quarantine notes where superseded. | DOCS. |
| **DA-NH-2** | Refund path: with P0.4's case flow + BC-1/2/3 landed, document the operator refund runbook (Stripe dashboard steps + `charge.refunded` handling is already correct in code). | DOCS/runbook. |
| **E2E 16 journeys** | The smoke suite passes but does not cover all 16 required journeys from the master prompt (first-promise, identity, feedback, Meal Memory, Learning Journey, Stripe/Play sandbox, Pantry, data-rights, install/offline, admin). Author the missing specs incrementally; screenshots/traces for critical states. | TESTS. |

### B4 — Do NOT touch (unchanged gates, Rule 4)

- **HS-2 / HS-4 / HS-5 / HS-7**: clinical banding/floor changes — W-05 RD/CDCES panel has never run. No change without authentic credentialed review.
- **HSTS `preload`** (one-way door), **CSP `report-uri`** (needs an endpoint first).
- **S1/S2 flag flips** (`MEAL_MEMORY_*`, `LEARNING_JOURNEY_*`): gated on the concierge study + privacy review + RD copy review + RV-3 fix. Building the S2 preconditions (RV-3, RV-6) is in scope; flipping flags is not.
- **Pricing numbers**: the program/maintenance STRUCTURE (C6) may be wired, but price points come from the concierge study's disclosed-price step, not hard-set.
- **DA-NH-1**: counsel intended-use determination is still open; no new claims/copy outside the claims boundary.
- Human-evidence validators (`review:dietitian:validate` / `:close`) stay BLOCKED-HUMAN — never fabricate.

---

## C. Key facts the next session will otherwise rediscover slowly

- **Sending domain is `contact.revora.plus`**, not the apex. Anything email-related must respect that split (apex MX = Namecheap forwarding for support@).
- `vercel` CLI: linked to project `revora` (`prj_rF6Fef4OQpldRQgKhrw9aNn5WaQC`), authed as `tkiros`. `vercel env pull` masks sensitive values as `""` — do not conclude a var is empty from a pull.
- Stripe MCP requires fresh per-session OAuth (`mcp__stripe__authenticate` → user opens URL → `mcp__stripe__complete_authentication`).
- Test commands must run with `env -u REVORA_MODEL -u OPENAI_BASE_URL` (a shell profile exports those).
- The E2E suite has ~2 rotating machine-load flakes per full run on this box; a "failure" that passes in isolation and in the other run is load, not regression. `0fc5d70` already widened the worst window.
- CI now fails if `lib/server/db/schema.ts` drifts from `drizzle/` (RE-08 gate) — generate a migration with `npx drizzle-kit generate --name <slug>` whenever the schema changes.
- The production build FAILS without the Umami env (set) and WARNS without `NEXT_PUBLIC_SENTRY_DSN` (unset). Escape hatch: `REVORA_ALLOW_NO_MEASUREMENT=1`.

## D. Acceptance gates (unchanged)

```bash
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run lint
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run typecheck
env -u REVORA_MODEL -u OPENAI_BASE_URL npm test          # beat 1805 passed / 2 skipped
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run contract
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run eval:revora
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run build
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run e2e
npm audit --omit=dev
git diff --check
```
Every fix adds a regression test. New surfaces (B2) need E2E coverage on all three Playwright projects.

## E. Definition of done for this handoff

1. Stripe live webhook registered + `STRIPE_WEBHOOK_SECRET` in Vercel; a test event round-trips.
2. The four job surfaces (Home / My Meals / My Journey / Account) are live, coherent, and pass design + eng review skills.
3. RV-3 is fixed (progress never declines from checking less), RV-6 brief is genuinely useful, server-twin flags exist, HS-3 exemption implemented (flag still off), P0.4 in-account help/refund flow exists.
4. Truth-index and runbooks updated; all gates in §D green; changes shipped via `/ship` with the same evidence discipline as PR #23.

**One prioritized next action:** register the Stripe live webhook (B1) — it is the last piece standing between a real first purchase and a flipped entitlement arriving through the front door instead of the fallback.
