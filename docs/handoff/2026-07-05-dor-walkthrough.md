# Definition-of-Ready (DoR) Walkthrough — Trial Paywall + Pantry

**Branch:** `launch-readiness` · **Created:** 2026-07-05 · **HEAD at authoring:** `56a26d2eb9210f88d764ce3ad9fc368941bd98d5`

This is the manual release gate a human founder executes against a **preview deploy** with
**Stripe TEST mode** before ever flipping `PAYWALL_MODE=trial` in production. Prod stays `legacy`
until every step below is green with evidence captured.

Legend:
- `⏳ BLOCKED-ON-HUMAN (needs H23 test-mode Stripe + preview deploy)` — cannot be exercised by an
  automated agent; requires the preview environment and/or Stripe test-mode keys, test clocks, and
  real/stubbed email delivery. A human runs these.
- `✅ VERIFIED LOCALLY` — pre-checked against the repo at the HEAD sha above; evidence pasted inline.
- Each step has an **Evidence:** block. Fill it as you go — do not mark a step done without capturing
  the artifact named there (screenshot / log line / DB row).

---

## Prerequisites

Before Step 1, stand up a preview environment of **this branch** with the following. All of this is
`⏳ BLOCKED-ON-HUMAN (needs H23 test-mode Stripe + preview deploy)`.

- **Preview deploy** of the `launch-readiness` branch (Vercel preview URL — referred to below as
  `<preview>`, e.g. `https://revora-git-launch-readiness-<org>.vercel.app`).
- **Env vars on the preview deploy:**
  - `PAYWALL_MODE=trial` — flips pricing/entitlement to trial mode (read in `lib/server/pricing.ts`).
  - `TRIAL_PRICE_VARIANT=1299` — trial price variant tag; default is `1299` but set explicitly
    (read in `lib/server/pricing.ts`).
  - Test-mode Stripe **secret + publishable keys** (`sk_test_…`, `pk_test_…`) — **open human action H23**.
  - Test-mode **price IDs** for the trial ($12.99) and the pantry product — **H23** (these are the
    OQ-2 test-mode price IDs; they differ from live-mode IDs).
  - Test-mode **webhook signing secret** + a **test webhook endpoint** pointing at
    `<preview>/api/billing/stripe/webhook` (either a dashboard test-mode webhook, or `stripe listen
    --forward-to <preview>/api/billing/stripe/webhook`).
  - `AUTH_EMAIL_STUB_DIR=<dir>` to capture magic-link / transactional emails as files
    (read in `lib/server/email.ts`), **or** a Resend test key if you want real delivery.
  - `PANTRY_EXTRACT_STUB=1` — deterministic stub extractor for pantry photo uploads
    (read in `lib/pantry/extract.ts`).
  - `CRON_SECRET=<value>` — bearer token the pre-charge cron requires
    (checked in `app/api/cron/trial-precharge/route.ts`).
  - `AUTH_SECRET` — used to sign the one-tap cancel link the pre-charge sweep emits.
- **DB access** to the preview database (to inspect the `subscriptions` table and, in Step 4, to hand-edit
  `current_period_end` if you are not using Stripe test clocks).

**Reference facts (verified against the repo at HEAD, so the script below is exact):**
- Taster store: `lib/client/taster-store.ts` — localStorage key `revora.taster.v1`, shape
  `{ firstDay: string, used: number }`, `TASTER_LIMIT = 10`.
- Cron route: `app/api/cron/trial-precharge/route.ts` — a **GET** handler, gated on
  `Authorization: Bearer $CRON_SECRET`.
- `subscriptions` columns (see `lib/server/db/schema.ts`): `status` (enum
  `active | trialing | canceled | grace | expired | refunded`), `price_variant` (text),
  `current_period_end` (timestamp).
- Routes present: `app/trial/started/page.tsx`, `app/welcome/page.tsx`, `app/canceled/page.tsx`,
  `app/pantry/page.tsx`, `app/report/[id]/page.tsx`.

---

## Step 1: Preview env setup

`⏳ BLOCKED-ON-HUMAN (needs H23 test-mode Stripe + preview deploy)`

1. Deploy the `launch-readiness` branch to a preview environment.
2. Set every env var listed in **Prerequisites** on that deploy.
3. Point a test-mode Stripe webhook at `<preview>/api/billing/stripe/webhook` (dashboard test-mode endpoint,
   or `stripe listen --forward-to <preview>/api/billing/stripe/webhook`). Confirm the signing secret in the
   listener matches the `STRIPE_WEBHOOK_SECRET` (or equivalent) on the deploy.
4. Load `<preview>/` in a fresh browser (no cookies, empty localStorage) and confirm the app renders
   in trial mode (paywall wiring active).

**Evidence:**
- [ ] Screenshot: Vercel preview deploy showing the branch = `launch-readiness` and env vars set
      (`PAYWALL_MODE=trial`, `TRIAL_PRICE_VARIANT=1299`).
- [ ] Log line / screenshot: Stripe test-mode webhook endpoint healthy (200 on a test ping) pointing at
      `<preview>/api/billing/stripe/webhook`.
- [ ] Screenshot: `<preview>/` home rendering in a fresh browser.

---

## Step 2: Execute the DoR script and record evidence

Run each sub-step in order and capture the named evidence. Sub-steps 2.1–2.6 are
`⏳ BLOCKED-ON-HUMAN (needs H23 test-mode Stripe + preview deploy)`. Sub-steps 2.7–2.8 are the test
suites (Step 7 / Step 8 below), runnable off the preview but with the caveats noted.

### 2.1 — Taster runs, then wall on the 11th check

`⏳ BLOCKED-ON-HUMAN (needs H23 test-mode Stripe + preview deploy)`

1. Open `<preview>/` in a **fresh browser** (private window; localStorage empty).
2. Run product checks. Confirm the taster serves up to **10** checks (`TASTER_LIMIT = 10`), and that the
   "betrayal chip" aha moment appears within those checks.
3. In DevTools → Application → Local Storage, confirm the key `revora.taster.v1` exists and its `used`
   counter increments per check.
4. Trigger the **11th** check. Confirm the hard wall appears (no 11th result served).

**Evidence:**
- [ ] Screenshots: a taster result within the first 10 checks, including the betrayal-chip aha state.
- [ ] Screenshot: DevTools showing `revora.taster.v1` = `{"firstDay":"…","used":10}` after the 10th check.
- [ ] Screenshot: the wall shown on the 11th check attempt.

### 2.2 — Simulated Day 2: hard wall, no residual checks

`⏳ BLOCKED-ON-HUMAN (needs H23 test-mode Stripe + preview deploy)`

1. In the same browser, open DevTools → Application → Local Storage → key `revora.taster.v1`.
2. Edit the **`firstDay`** field to a **prior calendar date** (e.g. yesterday). This makes
   `tasterStore.status()` return `"expired"` (the store compares `firstDay` to today's local day).
3. Reload `<preview>/` and attempt a check. Confirm a **hard wall** with **no** residual free checks
   (Decision D: under `PAYWALL_MODE=trial` there are no leftover free checks the next day —
   see `app/api/check/route.ts`).

**Evidence:**
- [ ] Screenshot: edited `revora.taster.v1` with `firstDay` set to a prior date.
- [ ] Screenshot: hard wall on first check attempt after reload (no result served).

### 2.3 — Wall → email → test checkout → trial started → magic-link sign-in → unlimited

`⏳ BLOCKED-ON-HUMAN (needs H23 test-mode Stripe + preview deploy)`

1. From the wall, enter an email and proceed to Stripe **test** checkout.
2. Pay with the Stripe test card `4242 4242 4242 4242` (any future expiry, any CVC, any ZIP).
3. Confirm redirect to `<preview>/trial/started`.
4. Retrieve the **magic-link email** (from `AUTH_EMAIL_STUB_DIR` files, or the Resend test inbox) and
   open the link. Confirm sign-in lands on `<preview>/welcome` and that checks are now **unlimited**.
5. Inspect the preview DB `subscriptions` table for this user. Confirm the row has
   **`status = trialing`** and **`price_variant = 1299`**.

**Evidence:**
- [ ] Screenshot: Stripe test checkout with the `4242…` card.
- [ ] Screenshot: `<preview>/trial/started`.
- [ ] File/screenshot: the magic-link email (stub file path or Resend test message).
- [ ] Screenshot: `<preview>/welcome` + an unlimited check succeeding.
- [ ] DB row: `subscriptions` row showing `status=trialing`, `price_variant=1299`.

### 2.4 — Advance the trial clock → pre-charge email → one-tap cancel → `/canceled`

`⏳ BLOCKED-ON-HUMAN (needs H23 test-mode Stripe + preview deploy)`

1. Advance this subscription's trial toward its end, either:
   - via a **Stripe test clock** attached to the subscription, or
   - by setting the preview DB row's **`current_period_end`** to roughly **now + 36h** (the pre-charge
     sweep targets `trialing` rows whose `current_period_end` is within the pre-charge window and not
     yet stamped — see `lib/server/billing/precharge.ts`).
2. Run the pre-charge cron **once** (it is a GET; the route lives at
   `app/api/cron/trial-precharge/route.ts`):
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" <preview>/api/cron/trial-precharge
   ```
   Expect a JSON `{ "ok": true, ... }` response. (A missing/wrong secret returns `401 unauthorized`.)
3. Confirm the **pre-charge email** arrives with the exact **date** and **amount** ($12.99).
4. Click the **one-tap cancel link** in that email **once**. Confirm redirect to `<preview>/canceled`.
5. In Stripe (test mode), confirm the subscription now shows **`cancel_at_period_end = true`**.
   Note: the DB `subscriptions.status` intentionally **stays `trialing`** (the user remains entitled
   until the paid period lapses); do **not** expect a `canceled` DB row at this moment — cancel is
   surfaced via Stripe's `cancel_at_period_end` (see `app/api/billing/handlers.ts`).
6. Run the cron a **second** time (same curl). Confirm it sends **no** new pre-charge email for this row
   (already stamped / now cancel-pending).

**Evidence:**
- [ ] Note: which clock method used (Stripe test clock vs. DB `current_period_end = now+36h`).
- [ ] Terminal output: first `curl` cron run returning `{ "ok": true, ... }`.
- [ ] File/screenshot: pre-charge email with exact date + `$12.99` amount.
- [ ] Screenshot: `<preview>/canceled` after one tap.
- [ ] Screenshot: Stripe subscription showing `cancel_at_period_end=true`.
- [ ] Terminal output: second `curl` cron run — confirm no second email sent.

### 2.5 — Separate trial WITHOUT cancel: auto-charge converts at $12.99

`⏳ BLOCKED-ON-HUMAN (needs H23 test-mode Stripe + preview deploy)`

1. Start a **fresh** trial (new user/email) via the wall → checkout → `4242…` flow, and do **not** cancel.
2. Attach a **Stripe test clock** and advance it **past the trial end**.
3. Confirm the `invoice.paid` webhook arrives at `<preview>/api/billing/stripe/webhook`.
4. Confirm the `subscriptions` row flips **`status = active`** (conversion path in
   `app/api/billing/handlers.ts` sets `active` on `invoice.paid` for a `trialing` row).
5. Confirm a **`trial_converted`** telemetry event is logged — proving the $12.99 auto-charge in test mode.

**Evidence:**
- [ ] Note: Stripe test clock advanced past trial end.
- [ ] Screenshot/log: `invoice.paid` webhook received.
- [ ] DB row: `subscriptions` row now `status=active` (was `trialing`).
- [ ] Log line: `trial_converted` telemetry event.

### 2.6 — Pantry: buy → intake → claim → upload (stub) → report ready

`⏳ BLOCKED-ON-HUMAN (needs H23 test-mode Stripe + preview deploy)`

1. Go to `<preview>/pantry`. Buy the pantry product via Stripe **test** checkout (`4242…`).
2. Confirm the **intake email** arrives (stub dir or Resend test).
3. Follow the **claim** link from that email.
4. Upload photos. With `PANTRY_EXTRACT_STUB=1` the extractor is deterministic, so uploads resolve to a
   stub item list without real OCR.
5. Confirm the extracted list, then confirm the **report is ready** at `<preview>/report/[id]` and that a
   **report email** is sent.

**Evidence:**
- [ ] Screenshot: pantry test checkout (`4242…`).
- [ ] File/screenshot: intake email + claim link.
- [ ] Screenshot: photo upload + confirmed stub item list.
- [ ] Screenshot: `<preview>/report/<id>` report ready.
- [ ] File/screenshot: report email.

### 2.7 — Unit + E2E suites green

See **Step 7** below (environmental caveat applies). This is the full-suite gate.

### 2.8 — Play/TWA untouched + engine frozen

See **Step 8** below. Locally pre-verified at HEAD — see evidence pasted there.

---

## Step 7: Test suites

**Environmental caveat (read before running — do not misread it as a regression):**
The full `npx vitest run tests/unit` suite is known to **melt down on the dev machine under
contention** — it throws mass **45s hook timeouts inside `createTestDb`**. That is an **environmental**
symptom (resource contention on this workstation), **not** a regression signal. Therefore:

- Run the full unit suite on a machine or **CI** where the full suite is viable, **or** run it
  **per-file** locally.
- **Hook-timeout storms are environmental. SQL errors (and assertion failures) are real** — triage those.

Commands:
```bash
# Full unit suite (run on CI or a non-contended machine); includes the claims scan
npx vitest run tests/unit

# E2E
npx playwright test
```

The unit suite includes the **claims scan** (e.g. `tests/unit/revora/claims-boundary-copy.test.ts`,
`tests/unit/revora/disclaimer-presence.test.ts`, `tests/unit/server/pantry-claims.test.ts`). Confirm
those are green.

**Evidence:**
- [ ] Log: `npx vitest run tests/unit` fully green (from CI or per-file), claims scan included.
- [ ] Log: `npx playwright test` green.
- [ ] If any failure: note whether it was a hook-timeout storm (environmental — rerun elsewhere) or a
      real SQL/assertion failure (regression — must fix before the gate passes).

---

## Step 8: Play/TWA untouched + engine frozen

Two guarantees: (a) the Play/TWA path is not disturbed by this branch, and (b) the review engine is
frozen. The diff checks below were run **locally on 2026-07-05 at HEAD
`56a26d2eb9210f88d764ce3ad9fc368941bd98d5`** and are pre-filled. The Play unit test must still be run
(per Step 7 caveat).

1. Play unit tests green (`tests/unit/server/play-api.test.ts`):
   ```bash
   npx vitest run tests/unit/server
   ```
2. `paywall-card.tsx` untouched on this branch:
   ```bash
   git log --oneline main..HEAD -- components/paywall-card.tsx
   ```
3. Review engine frozen (no commits on this branch):
   ```bash
   git log --oneline main..HEAD -- lib/revora/postprocess.ts lib/revora/service.ts \
     lib/revora/prompt.ts lib/revora/schemas.ts lib/revora/a1c.ts
   ```

**Evidence:**
- `✅ VERIFIED LOCALLY` (2026-07-05, HEAD `56a26d2eb9210f88d764ce3ad9fc368941bd98d5`) —
  `git log --oneline main..HEAD -- components/paywall-card.tsx` → **empty** (no commits; `paywall-card.tsx`
  is diff-free on this branch, matching the "untouched, except none" expectation).
- `✅ VERIFIED LOCALLY` (2026-07-05, HEAD `56a26d2eb9210f88d764ce3ad9fc368941bd98d5`) —
  `git log --oneline main..HEAD -- lib/revora/postprocess.ts lib/revora/service.ts lib/revora/prompt.ts
  lib/revora/schemas.ts lib/revora/a1c.ts` → **empty** (engine frozen; zero commits touch these files
  on `launch-readiness`).
- [ ] `⏳` Log: `npx vitest run tests/unit/server` — `play-api.test.ts` green (run on CI / per-file per the
      Step 7 caveat).

---

## Step 3: Commit the evidence doc

Once every step above is green with evidence captured, commit **this file only** (do not stage the other
dirty files in `docs/handoff/`):
```bash
git add docs/handoff/2026-07-05-dor-walkthrough.md
git commit -m "docs(launch): DoR walkthrough evidence captured"
```

---

## Gate decision

The gate **passes** — and `PAYWALL_MODE=trial` may be flipped in production — only when **all** of the
following hold:
- Steps 2.1–2.6 green with evidence (taster→wall, Day-2 hard wall, checkout→trial→magic-link→unlimited,
  pre-charge→one-tap cancel, no-cancel auto-convert at $12.99, pantry end-to-end).
- Step 7 suites green (real failures triaged; hook-timeout storms discounted as environmental).
- Step 8 diffs empty (pre-verified above) and Play unit test green.

Until then, **prod stays `legacy`**.
