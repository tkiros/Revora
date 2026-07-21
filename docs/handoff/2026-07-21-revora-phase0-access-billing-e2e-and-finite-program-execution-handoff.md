# Revora — Session Handoff: Phase 0 Access, Billing/Reliability, E2E, and the Finite-Program Restructure

**Written:** 2026-07-21 · **For:** the next execution session · **Prior audit revision:** `abfa058` · **Current HEAD at handoff:** `fbe0d271` on branch `fix/domain-migration-revora-plus`

This is an executable continuation prompt. Read §A–§B for context, then execute §C in the stated order, honoring the guardrails in §D and the acceptance gates in §E. Do **not** skip the human/clinical gates.

---

## A. What has been done (prior session)

A Deep 8-persona adversarial audit (over a 6-agent source reconnaissance) established the end-to-end, promise-delivery, safety, and paid-retention state of Revora, and applied a focused set of safe fixes. The full record is in:

- **`docs/handoff/2026-07-20-revora-e2e-promise-retention-audit-report.md`** — decision table, full issue ledger (every finding with severity/evidence-bucket/fixability/status), promise-to-proof matrix, refutations, retention analysis, verdicts. **This is the canonical reference for every finding ID cited below.**
- `predict/260720-1531-revora-e2e-promise-retention/` — knowledge base, component clusters, swarm overview.

### Verdicts (unchanged; re-confirm against current HEAD)
| Decision | Verdict |
|---|---|
| Engineering E2E | PARTIAL (1778 tests green; browser E2E not yet run) |
| Core promise | TECHNICALLY DEMONSTRATED (no real-user evidence) |
| Health/claims safety | PASS-ENGINEERING / BLOCKED-HUMAN (RD panel never run) |
| Paid retention | INSUFFICIENT EVIDENCE (trending unlikely at indefinite-subscription framing) |
| Production readiness | **NO-GO** — binding blocker is that no real user can currently sign in |

### Fixes already applied (uncommitted in the working tree; verified green)
| ID | Change | Files | Test |
|---|---|---|---|
| HS-1 | Clinical/emergency routing now preempts the paywall (a signed-in non-premium user describing acute symptoms gets the "see a person" card, not a 402) | `app/api/check/route.ts` | `tests/unit/server/check-clinical-preempt.test.ts` |
| PR-3 | History + memory read paths decrypt through canonical `crypto.safeDecrypt`, which reports GCM tamper to Sentry (the local shadows swallowed it silently) | `app/api/history/handlers.ts`, `app/api/memory/handlers.ts` | `tests/unit/server/decrypt-tamper-alerting.test.ts` |
| SA-12 | `pantry/upload` returns 400, not 500, on a malformed body | `app/api/pantry/upload/route.ts` | typecheck + lint |
| AA-9 | Checkout error announced via `role="alert"` on the paid flow | `components/pantry-buy-button.tsx` | existing pantry-buy-button test |

**Verification at time of audit (revision `abfa058` + these fixes):** `typecheck` PASS · `contract` PASS · `eval:revora` 11/11 · `npm test` **1778 passed / 2 skipped** · `git diff --check` clean.

### Two findings that were investigated and deliberately NOT changed (important)
- **HS-2 (sugary-floor buffer)** — a change was implemented, validated against the safety eval, and **reverted**: the precheck test `"still honors a real protein buffer on the same base meal"` proves the buffer-gating is *intentional clinical design*, not a bug. Whether buffered sugary *drinks* should floor HIGH is a **W-05 (RD/CDCES) decision**, not an engineering one.
- **HS-3 (componentMention flag)** — do **NOT** flip `REVORA_ENFORCE_COMPONENT_MENTION` on: it retry-cards 100% of floored MODERATEs (executed, 4/4) and disproportionately harms non-Western dishes. Fix is to exempt floored drafts first, then measure — not flip the flag.

---

## B. Current repo state & how to resume

- The checkout **moved** since the audit: HEAD is now `fbe0d271` on `fix/domain-migration-revora-plus` (someone is already working the P0.1 domain/access item — the branch name suggests a domain migration, likely off `revora.bio`). The audit fixes above carried over cleanly and are still present as uncommitted changes.
- **User-owned files to preserve untouched:** `docs/handoff/2026-07-18-...forensic-master-prompt.md` (§9 residual list), `docs/handoff/2026-07-20-...validation-master-prompt.md`, and `docs/retention_flow.md` (concurrent work).
- **First action on resume:** because the base moved, re-establish the baseline on the current HEAD before making changes:
  ```bash
  cd /home/tefera/Desktop/Revora
  git status --short --branch
  env -u REVORA_MODEL -u OPENAI_BASE_URL npm run typecheck
  env -u REVORA_MODEL -u OPENAI_BASE_URL npm run contract
  env -u REVORA_MODEL -u OPENAI_BASE_URL npm test
  ```
  Record the pass/fail counts. If the domain-migration work changed billing/auth code, re-verify the four applied fixes still hold.

---

## C. Execution plan (do these in order)

### Required order of operations (non-negotiable sequence)
1. **Fix access and measurement first.** Users must be able to reach the app, sign in, receive email, get support, and generate trustworthy analytics.
2. **Fix unresolved billing and reliability defects.** Do **not** charge beta users while cancellation, webhook, entitlement, refund, or support paths remain unreliable.
3. **Run complete browser E2E testing.** Automated unit tests are strong; the real multi-page mobile+browser journey still needs proof.

The recurring theme of the audit: **the binding constraints are infra + human gates, not code.** Fixing every code defect moves readiness zero inches until access (step 1) works.

---

### C1 — STEP 1: Access & measurement (Phase 0 of the plan)

Execute **Phase 0** as documented in `docs/handoff/2026-07-18-revora-100-value-95-retention-validation-and-implementation-plan.md` §Phase 0 (lines 352–403). Its outcome: *"a stranger can reach Revora, receive a sign-in email, get support, and generate measurable events."*

| Sub-phase | Task | Audit cross-reference |
|---|---|---|
| **P0.1 DNS/TLS/domain** | Authoritative nameservers + A/AAAA/CNAME for the production domain and `www`; confirm Vercel ownership; **remove Vercel SSO/deployment-protection from the public surface**; MX/SPF/DKIM/DMARC; synthetic monitoring; capture proof from a clean network with no Vercel session. **Pass:** public HTTPS usable from two networks, canonical redirects, valid TLS, green synthetic for 24h. | DA-6 (SSO fronts the app) |
| **P0.2 Authentication email** | Verify sending domain **and From address** — the code default `AUTH_EMAIL_FROM` was `signin@revora.app`, which must match the *provisioned* domain (the `revora-plus` branch implies a new one; reconcile `auth.ts:19` + `lib/server/email.ts:15`). Test initial/resend/expired/used/wrong-device/changed-email. Rate-limit + abuse telemetry with **no email in product analytics**. Visible fallback + staffed support. **Pass:** ≥99% sends accepted; seeded Gmail+Outlook receive links; every failure state recoverable. | **DA-6 (the dominant blocker: magic-link is the sole ingress; From-address mismatch is code-verifiable)** |
| **P0.3 First-party measurement** | Deploy Umami (or remove claims it is operational). Closed event allowlist; **never** send meal text, photo, A1C, email, notes, rationale, or report contents. Add env validation that **fails deployment** when measurement is expected but unconfigured. Also confirm `NEXT_PUBLIC_SENTRY_DSN` is set (client errors were possibly silent). **Pass:** production events arrive with no prohibited fields; privacy review approves the data map. | PR-6 (add opt-out gate + strip state-revealing URL params `?health-data-deleted=1` before pageview) |
| **P0.4 Support & refund ops** | Deliverable, monitored support address; in-account "Request help or refund" with authenticated case ID; case ledger (time, provider, charge, eligibility, status, owner, resolution); published SLAs. **Pass:** a seeded request travels user→ledger→provider→confirmation with no unread-mailbox dependency. | DA-NH-2 (refund path absent → charged-but-can't-sign-in becomes chargebacks → processor-termination risk) |
| **P0.5 Source-of-truth quarantine** | Mark stale `product-marketing.md` / `ICP.md` / `Revora_90-Day_Distribution_Strategy.md` passages superseded where they promise unreviewed features, glucose/spike prediction, DPP equivalence, or regulatory status; one release truth index; owner + review date on each launch-critical source. **Pass:** no active launch doc conflicts with deployed behavior or uses unreviewed clinical/regulatory claims. | DA-NH-3 (doc corpus is an unreliable narrator; truth-index is canonical) |

---

### C2 — STEP 2: Billing & reliability defects (fix before charging any beta user)

All defects below are CONFIRMED in source with precise fixes in the audit report §2. Fix at the shared enforcement point, add a regression test each, retest.

**Billing (money paths — highest priority before any charge):**
- **BC-2 (P1):** persist `cancel_at_period_end`; render "Access until X — will not renew" (currently a canceled subscriber is shown a fabricated "Renews {date}").
- **BC-1 / SA-8 (P1):** `GET /api/billing/cancel` → make the emailed link render a confirm page, move the mutation to POST (mail safe-links currently auto-cancel trials silently).
- **BC-3 (P1):** register the live Stripe webhook (infra) **and** add a server-side Checkout-session retrieve+upsert on the success-URL return (without it, a first live purchase never flips entitlement, and the one-trial-ever gate never trips).
- **BC-4/5/6 (P2):** add `SELECT ... FOR UPDATE` + terminal guard (`status NOT IN ('refunded','expired')`) + monotonic-period guard to the Play RTDN handler and both self-heal writes; add the `lastVerifiedAt` rate-limit to the Play heal.
- **BC-7 (P2):** add `/api/billing/:path*` to the proxy rate-limit matcher (pantry-checkout is unauthenticated and unlimited).
- **BC-8 / PR-1 (P1):** redact buyer PII from `billing_event_inbox.payload` when a row is marked `processed`; extend the prune to `failed`/`dead_letter`; list the inbox in the privacy notice (currently survives account deletion, contradicting the live privacy page).
- **BC-9 (P3):** extend the `checkout.session.completed` terminal guard to include `expired`.
- **RE-03 / BC-10 (P2):** pre-charge sweep → claim-before-send (`UPDATE ... WHERE pre_charge_email_sent_at IS NULL RETURNING`); the atomic-claim pattern already exists in `pantry/process.ts`.

**Reliability:**
- **RE-01 (P2):** split the entitlement/quota try/catch — fail **closed** (retry card) for the trial wall, keep fail-open only for the courtesy free cap.
- **RE-02 (P2):** correct the inverted "fail-closed" comment in `launch-controls.ts` and fail closed when `EDGE_CONFIG` is set but the read throws (the ops kill switch is currently inert — no working emergency brake).
- **RE-04 (P1):** add a per-user model-spend bucket keyed on `session.userId`; correct the two ops docs that describe `REVORA_DAILY_CHECK_CAP` as per-user (it overrides only the global cap).
- **RE-05 (P2):** make `emitSafeEvent` non-throwing (`safeParse` + a `telemetry_schema_miss` counter) so a new response-kind can't degrade a successful paid check to a retry card.
- **RE-06 (P2):** nudge cron → claim-before-send lease.
- **RE-07 (P2):** service worker → build-stamped cache name + `updatefound`/`controllerchange` soft-refresh.
- **RE-08 (P2):** add a `drizzle-kit check`/diff CI job; one-time prod structural comparison vs `0012_snapshot.json` (prod schema was stamped, not migrate-verified).
- **RE-10 (P2):** persistence fail-soft should return `{persisted:false}` and the client should show a quiet "shown, not saved" note (currently silently drops history rows while showing success — retention-poison).

**Privacy (data-rights):**
- **PR-2 (P1):** document `HEALTH_DATA_KEYS_OLD` + `HEALTH_DATA_KEY_VERSION` and the "never drop an in-use key" invariant; add `docs/runbooks/health-key-rotation.md` (a doc-driven rotation currently destroys all health ciphertext silently).
- **PR-4 (P2):** sweep unclaimed pantry orders (`userId IS NULL AND status='paid' AND createdAt < now-90d`) + claim-link expiry.
- **PR-5 (P2):** add `/api/account/export` bundling profile A1C + weekly reflections + pantry (export currently omits the exact A1C).

**Do NOT auto-flip / must go through gates:** HS-2/HS-4/HS-5/HS-7 (clinical, W-05), HS-3 (componentMention), HSTS `preload` (one-way door), CSP `report-uri` (needs an endpoint).

---

### C3 — STEP 3: Complete browser E2E

- Run `npm run e2e` (Playwright) on **both** paywall web servers (legacy `:3100`, trial `:3101`), Mobile Chrome + Mobile Safari.
- **AA-10:** add a desktop chromium project (there is currently none, despite a desktop sidebar).
- Exercise all 16 required journeys from the master prompt (first-promise, text/voice/photo check, identity, history, feedback, dashboard/progress, Meal Memory, Learning Journey, trial/paywall, Stripe/Play sandbox, Pantry Review, account/data-rights, install/offline/recovery, admin/internal).
- Capture screenshots/traces for the critical states. A visible assertion passing while the page logs a relevant unhandled error is **not** a pass.

---

## C4 — The recommended model (Path A) and why

Three approaches were compared:

| Approach | Verdict | Why |
|---|---|---|
| Keep the indefinite subscription | Not recommended now | Recurring value is too weak after users learn their common meals |
| **90-day program + optional maintenance** | **Recommended** | Fits the natural user journey, the existing graduation architecture, and the honest value curve |
| Continuously adaptive AI coach | Consider later | Potentially stronger recurring value, but much more safety/privacy/clinical/product risk |

**Recommended positioning (use this copy as the north star; route all new copy through the claims boundary + counsel gate):**

> Revora is a 90-day meal-confidence program that helps users build a personal meal playbook, followed by an optional lighter maintenance service.

**Do not promise it changes health outcomes.** The promised outcome is *clearer meal decisions and a usable personal library* — nothing about glucose, A1C, or disease. This aligns with the finite-program reframe the retention analysis recommended (the app already graduates users at day 90; sell that arc instead of fighting it).

---

## C5 — Concrete stage-by-stage flag rollout (implement the structure; test the numbers)

Feature flags today (all fail-closed): `MEAL_MEMORY_ENABLED` + `NEXT_PUBLIC_MEAL_MEMORY`, `LEARNING_JOURNEY_ENABLED` + `NEXT_PUBLIC_LEARNING_JOURNEY`, `NEXT_PUBLIC_PHOTO_INPUT`, `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS`, `NEXT_PUBLIC_PLAY_BILLING`, `PAYWALL_MODE`.

**Rollout is gated, not a flip.** Enable in this order, each stage blocked by its gate:

| Stage | Flags to enable | Precondition gate (do not enable without it) |
|---|---|---|
| **S0 — now (Phase 0)** | none | Complete C1 (access/measurement) + C2 (billing/reliability) + C3 (E2E). No feature flag flips until the funnel is measurable and billing is safe. |
| **S1 — Meal Memory** (My Meals) | `MEAL_MEMORY_ENABLED`, `NEXT_PUBLIC_MEAL_MEMORY` | Concierge study passes (≥5/8 recall value twice **and** continue at the disclosed price, `docs/research/meal-memory-concierge-protocol.md`) **AND** privacy review. Frame as **"a private log you own,"** never "the app learns you" (the engine is stateless by design; the latter claim is false and invites the "is this predicting my glucose?" misread). |
| **S2 — Learning Journey** (My Journey) | `LEARNING_JOURNEY_ENABLED`, `NEXT_PUBLIC_LEARNING_JOURNEY` | Weekly artifact made genuinely valuable (not a re-count of the user's own inputs — RV-6) **AND** RD/clinical review of stage copy **AND** the BAI-weighting fix below **AND** graduation/maintenance copy review. |
| **BAI fix (blocks S2)** | — | Fix the progress score so it does **not** fall as usage falls (RV-3): cap the consistency/frequency contribution once a floor is met, or replace the scored "index/band" with a non-scored recap. A user who becomes more confident and checks *less* must not see "progress declined." |
| **Server-twin fix (before relying on any NEXT_PUBLIC flag as a kill switch)** | — | `NEXT_PUBLIC_PHOTO_INPUT` and `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS` are build-time only with no server twin — they cannot be turned off without a redeploy. Add server twins before treating them as incident controls. |

---

## C6 — Pricing structure for Path A (structure fixed; price points tested)

Reframe from indefinite `$12.99/mo` to a **program + maintenance** shape using the existing `paywallMode()` / `resolvePriceVariant()` / price-ladder infra (`STRIPE_PRICE_MONTHLY_*`, `STRIPE_PRICE_ANNUAL`):

- **On-ramp:** keep the existing 7-day trial as the entry to the program (card required, pre-charge email — the honesty mechanics already exist).
- **Core:** a **90-day program** priced as a one-time fee **or** 3 monthly installments. Anchor candidates: the existing ladder (`999`/`1299`/`1999`) → a program total near 3× a monthly (~`$29–$39`). **Test the actual number** ($9.99 vs $12.99 monthly-equivalent) inside the concierge study's disclosed-price step — do not hard-set it.
- **Maintenance:** an **optional lighter tier** after day 90 for novel-meal checks + occasional refresh — a lower monthly (~`$4.99`) or the existing annual (`STRIPE_PRICE_ANNUAL`) repurposed as the maintenance annual.
- **Truthful billing is a hard precondition:** implement C2's BC-1/BC-2/BC-3 first. Selling a "90-day program" while the UI says "Renews {date}" (BC-2) or a live purchase can't flip entitlement (BC-3) is a commercial-truth failure.

Note the existing tension the audit flagged: an **annual** plan is in direct conflict with a 90-day-graduation product — do not sell 12 months of a product designed to graduate the user at month 3 unless it is explicitly the maintenance tier.

---

## C7 — Recommended app structure: four user jobs (all four active and ready for end users)

Restructure the UI around four jobs. Map to existing routes/components; keep engine/billing behavior unchanged.

### 1. Home — "Help me decide now" (`/home`)
- One main action: **Check a meal** (text, voice, authorized photo).
- Today's recent decision + one relevant next action.
- **Remove** competing clutter: do not fill Home with history, scores, Pantry promotions, billing messages, and journey cards fighting for attention.

### 2. My Meals — "Help me remember what worked for me" (merge `/history` + `/memory` UX)
- Recent checks + saved meals + favorite/default meals + search + edit notes + check-again + export + delete.
- History is the automatic record; Memory is the user-curated version. They may stay separate technically, but should feel like **one understandable area**.

### 3. My Journey — "Show me what I am learning" (`/progress` → journey)
- Current program stage + weekly practical brief + saved defaults + remaining uncertainty + one useful next experiment + pause/graduate/maintenance.
- **Avoid a usage-frequency-dominated score** (see the BAI fix in C5). Celebrate a more-confident user who checks less — do not imply their progress declined.

### 4. Account — "Let me control everything" (`/account`, `/account/delete`)
- Reminder preferences, quiet hours, subscription/cancellation, support/refunds, privacy/consent, export, health-data deletion, account deletion.

**Boundaries:** Pantry Review stays a separate one-time product. Admin tools, crons, analytics, and the video engine stay invisible to ordinary users (verified server-gated; video-engine is dev-host-only).

---

## C8 — Recommended lifecycle (the retention arc to build toward)

| Period | User experience | Success signal |
|---|---|---|
| First 5 minutes | Complete one useful check before heavy onboarding | User says the result helped a real decision |
| Days 1–7 | Check genuinely uncertain meals and save one useful choice | ≥1 saved meal and a second meaningful use |
| Weeks 2–4 | Build a small library of reliable choices | User independently returns to a saved meal |
| Months 2–3 | Receive a useful weekly decision brief and complete missing contexts | The weekly brief causes a useful action |
| Day 90 | Export or keep the meal playbook; graduate, pause, or choose maintenance | Graduation is treated as success |
| Months 4–6 | Use Revora for novel meals, travel, restaurants, occasional refreshes | Maintenance users receive new value and renew voluntarily |

---

## D. Guardrails — do NOT engineer these closed (Rule 4)

- **RD/CDCES panel (W-05) has never run.** Every floor/threshold is engineering-derived. No clinical-banding change (HS-2/HS-4/HS-5) ships without authentic credentialed review.
- **Counsel intended-use determination (FDA General Wellness, DA-NH-1)** is open and may invalidate the framing: the public surface names the prediabetes A1C range + collects A1C + emits directive "Hold off." Counsel must clear the finite-program positioning before launch. Truth-index C7 already concedes "not a medical device" is "Overstated — must not stand."
- **Retention is empirical.** Do not enable Meal Memory / Learning Journey in production because the code works or the flow is designed — honor their discovery/clinical/privacy gates. Only the concierge study + a real paid cohort can raise the retention verdict.
- **No feature is "validated," "ready," "clinically approved," or "legally cleared"** until its specific human gate is genuinely green.
- **Scope note:** the 07-18 §9 "ignore these residuals" list (DNS/Resend/webhook/Umami/keys) conflicts with the 07-20 master prompt's renewal rule. This handoff treats them as in-scope (they are Phase 0). If the owner wants them out of scope, that exclusion must be renewed explicitly.

---

## E. Acceptance gates & exact commands

Run before declaring any stage done (on the current HEAD):
```bash
cd /home/tefera/Desktop/Revora
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run lint
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run typecheck
env -u REVORA_MODEL -u OPENAI_BASE_URL npm test
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run contract
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run eval:revora
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run build
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run e2e        # STEP 3 — both paywall servers, both mobile projects
npm audit --omit=dev
git diff --check
```
- Baseline to beat: **1778 passed / 2 skipped** (unit/integration), typecheck/contract/eval green. Every new fix adds a regression test.
- Human-evidence validators (`review:dietitian:validate` / `:close`) are BLOCKED-HUMAN — a missing signature is not a software failure and not a pass; never fabricate or weaken it.

### Definition of done for this handoff
- **Step 1 (access):** a stranger on a clean network can reach the app over HTTPS, request and receive a sign-in email, sign in, and produce a measurable (health-data-free) analytics event; support/refund path is deliverable and monitored.
- **Step 2 (billing/reliability):** BC-1/BC-2/BC-3 + the RE-01/RE-02/RE-04 reliability fixes are implemented, tested, and green; no beta user is charged while any cancellation/webhook/entitlement/refund/support path is unreliable.
- **Step 3 (E2E):** all 16 journeys pass on Mobile Chrome + Mobile Safari + desktop, with no unhandled console/network/server/hydration/a11y errors.
- **Restructure:** the four user-jobs surfaces (Home, My Meals, My Journey, Account) are live and coherent; the finite-program pricing structure is wired (numbers pending the concierge test); flag rollout stages S1/S2 remain OFF until their gates pass.

**One prioritized next action:** finish P0.2 (authentication email) — reconcile `AUTH_EMAIL_FROM` with the migrated domain and verify the Resend sending domain. Until a real user can sign in, nothing else is measurable.
