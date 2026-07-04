# Revora Unified Completion & Launch Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take Revora from its current state (P0–P10 merged, pantry schema done) to true done: a real, non-technical prediabetic can reach it publicly on web and as an installed Android app, use it safely, and pay — with support, monitoring, and incident response live.

**Architecture:** Next.js 16 App Router on Vercel (Fluid Compute) + Railway Postgres (`pg`/drizzle over TCP, `docs/adr/hosting-hybrid.md`) — that IS the "Vercel frontend / Railway backend" hybrid; there is no separate backend service. All health judgments flow through the one safety-evaluated engine `lib/revora/service.ts:checkFood()`. The Pantry Review pipeline adds: Stripe Payment Link webhook branch → claim-token intake → Vercel Blob photo upload → vision **extraction (never judgment)** → buyer confirm → sequential judging via `checkFood()` → tokenless HTML report + email.

**Tech Stack:** Next.js 16 / React 19 / TypeScript 6 / drizzle-orm / pg / PGlite (tests) / Vitest 4 / Playwright / axe / OpenAI Responses API (`gpt-5.4-mini`, `store:false`) / Stripe / Resend (raw fetch) / Upstash / `@vercel/blob` (to be installed) / hand-written CSS per `DESIGN.md`.

**Date:** 2026-07-04 · **Branch:** `launch-hardening` · **Repo:** `/home/tefera/Desktop/Revora`

---

## Authority hierarchy & conflict resolutions

Live handoff (`docs/handoff/2026-07-04-pantry-review-pipeline-session-handoff.md`) > approved design doc (`~/.gstack/projects/Revora/tefera-launch-hardening-design-20260704-082028.md`) > production plan (`docs/production-implementation-plan-2026-07-01.md`) > June-21 plan (`docs/superpowers/plans/2026-06-21-revora-launch-hardening.md`).

Conflicts resolved in this plan (newer/higher doc wins):

- Design doc says "GPT-4o" and implies a PDF report → **stale**. Current truth: judge model `gpt-5.4-mini` (`lib/revora/openai-client.ts:9`), report is a **tokenless account-gated HTML page** with `window.print()` "Save as PDF" — no PDF library (locked decision 2).
- June-21 plan's "text-only, no accounts, no DB, photo deferred" V1 posture → **superseded** by the merged P0–P10 build (commit `e37cf3e`). Use it only as reference for shipped rate-limit/PWA/observability patterns.
- Handoff lane order lists A2 before E, but A2's intake email needs E's util → this plan builds **E before A2** (one-line dependency fix; nothing else changes).
- `human-actions-required.md` §1 says "Neon" in one line → superseded by `docs/adr/hosting-hybrid.md` (Railway Postgres); the file itself already notes this.

## Superseded / already-done — do NOT re-plan

Merged at `e37cf3e` (verified via `git log` + tree inspection 2026-07-04): text + voice input, decision card v2, onboarding, magic-link accounts (Auth.js v5 + Resend), AES-256-GCM encrypted history, streaks/week-view, rule-based insights, BAI progress + weekly cron, subscription billing (Stripe web + Play Billing scaffolding, `app/api/billing/handlers.ts`), daily nudge (Web Push + hourly cron), PWA (manifest/icons/SW), per-IP + daily-cap rate limiting (`lib/revora/rate-limit.ts`, middleware fail-closed on public deploys), Sentry server capture, `/api/health`, terms/privacy drafts, reviewer test-login (preview-only), TWA packaging docs + device-QA checklist + Play listing drafts.

Already done in the **working tree but uncommitted** (blocked on Gate 0): pantry schema (`lib/server/db/schema.ts` — `pantry_orders`/`pantry_photos`/`pantry_items`), migration `drizzle/0001_pantry-review.sql` + journal entry, `tests/unit/server/pantry-schema.test.ts` (12/12 green), `DESIGN.md`, `TODOS.md`, session handoffs.

Explicitly OUT of scope (founder-locked): strategy/portfolio/pricing/day-45-gate decisions; photo-assist in the main scan flow (TODOS.md #1); CGM correlation (production plan §13); billing multi-product refactor (TODOS.md #2 — blocked on a third SKU); Tailwind or any new UI framework; analytics beyond Umami.

---

## Critical path (shortest chain to a real paying user on both surfaces)

| # | Step | Owner | Blocks |
|---|------|-------|--------|
| 0 | **Gate 0:** scrub `.env.example` live keys → first commit of done work; founder rotates Resend + Upstash keys | agent (scrub/commit) + human (rotate) | every `git add`; everything below |
| 1 | Founder: day-2 public ask — Stripe **Payment Link** ($25 pre-order, dashboard-only) + Reddit/FB demo post | **human** | nothing in code; revenue clock starts here — never waits for the build |
| 2 | Lane E: email util + privacy copy | agent | 3 |
| 3 | Lane A2: webhook pantry branch + claim tokens + **subscription-regression test** | agent | 5–9 |
| 4 | Human: create `STRIPE_PRICE_PANTRY` (from the Payment Link's price), `BLOB_READ_WRITE_TOKEN`, `ADMIN_EMAIL`, `CRON_SECRET` in Vercel; point Stripe webhook at the deploy | human | first live order flowing |
| 5 | Lane B: install `@vercel/blob`, claim → intake → upload | agent | 6 |
| 6 | Lane C: vision extraction module + stub seam + eval harness | agent (harness) + human (8–10 labeled photos, live key) | 7 |
| 7 | Lane B2: confirm screen + confirm API | agent | 8 |
| 8 | Lane A3: batch processor + cron sweep; Lane D: report + admin | agent | 9 |
| 9 | WS3 full gate: pantry E2E + regression + typecheck/test/eval/Playwright/axe green → release commit | agent | web "true done" Group A |
| 10 | WS4: both live eval gates recorded (judge + extraction) | human+agent | Group A sign-off |
| 11 | WS5(i): scripted web funnel walkthrough, punch-list triaged | agent (Playwright) + human (real phone) | web launch |
| 12 | Android surface: keystore → `.aab` → first upload → assetlinks → device QA → Play forms/counsel | **human** (docs all exist) | Play "true done" Group B |

Rows 1, 4, and 12 are human-only and run **in parallel** with the agent rows — the web paying-user chain is 0 → 2 → 3 → 5 → 6 → 7 → 8 → 9. The Android chain (12) shares no code dependency with the pantry build; it waits only on humans and hardware.

---

## Global Constraints

Every task below inherits these; violating one fails the task's review even if its own steps pass.

- **One engine, never bypassed:** all judgments run through `lib/revora/service.ts:checkFood()` + `postprocess.ts` floors. Vision is an **extractor only, never a judge**; the buyer **confirms/edits the item list before any verdict**. Do not modify `lib/revora/` engine files (`service.ts`, `postprocess.ts`, `prompt.ts`, `schemas.ts`, `a1c.ts`, `input-precheck.ts`, `fallback.ts`, `safety-contract.ts`).
- **Safety invariant:** zero harmful-SAFE across the eval set, always (`npm run eval:revora` green at every commit).
- **Claims boundary:** informational-only copy; banned families: diagnose/treat/cure/prevent/**reverse**/future-A1C/exact-numbers (`docs/safety/claims-boundary.md`); single contract disclaimer only. Report is a **deterministic template + per-item judged outputs — ZERO free-form LLM narrative** (locked decision 6).
- **Privacy:** health-adjacent fields (exact A1C, food/item text, notes, report payload) encrypted at rest via `encryptField` (AES-256-GCM, `HEALTH_DATA_KEY`, `lib/server/crypto.ts`); pantry photos deleted from Blob on delivery; `store: false` on every OpenAI call.
- **Report items NEVER written to `checks`** (would corrupt streaks/BAI/insights) — pantry tables only (locked decision 7).
- **Webhook regression is the highest-priority test:** every `applyStripeEvent` change must leave existing subscription events behaving **identically** (`tests/unit/server/billing-routes.test.ts` must pass unmodified).
- **Caps:** ≤10 photos/order, ≤5MB each, client downscale ~1600px, ≤40 confirmed items; extraction endpoint Upstash-limited with prefix `revora:pantry` (locked decision 8).
- **UI:** no new framework; hand-written CSS from `DESIGN.md` tokens/classes only; near-zero new CSS; permission-first voice; no emoji in headings; `aria-live="polite"` on status text; ≥44px tap targets; report print stylesheet.
- **TDD:** failing test first; vitest + Playwright + axe green at every commit; conventional commits; one atomic commit per task.
- **Consent:** intake collects A1C band + Art. 9 consent using the existing `COUNSEL-DRAFT` wording pattern (locked decision 5).
- **Test seams never in production:** any stub env (`AUTH_EMAIL_STUB_DIR`, `PANTRY_EXTRACT_STUB`) follows the existing pattern — inert/refused when `VERCEL_ENV=production`.
- **Never** push to production, spend money, submit to Play, rotate keys, or execute legal steps — those are human actions (Appendix A).
- **8-day hard build cap** (design doc guardrail): whatever exists on day 9 ships; vision gaps → founder transcribes photos manually into the text engine via `/admin/pantry` mark-manual. The day-2 public ask never waits for any task here.

---

## Definition of "true done" (release checklist)

### Group A — agent-completable (this plan's actual done bar)

- [ ] Non-technical user completes a scan on mobile web and gets a calm result in <~12s or a specific failure message (existing flow — re-verified in WS5 walkthrough).
- [ ] Sign-up → onboarding → encrypted history → daily nudge works for a real account end-to-end (existing flow — re-verified in WS5 walkthrough).
- [ ] Web Stripe subscription purchase enforces entitlement (server receipt verification — existing; regression-proved in Task 3.2).
- [ ] Pantry: pay via Payment Link → intake → confirm → report emailed; refund cancels; stuck orders self-heal (Phase 2 + Task 3.1 E2E).
- [ ] Both eval gates pass on the live model with recorded numbers (Phase 4).
- [ ] Abuse/cost controls hold: per-IP 429, daily cap, pantry-prefix limiter (existing + Task 2.7; OpenAI dashboard hard cap = Group B).
- [ ] Claims-boundary + disclaimer-presence + privacy-minimal tests green; health data encrypted at rest **verified as ciphertext in pglite** (Task 3.2).
- [ ] `npm run typecheck` / `npm test` / `npm run eval:revora` / Playwright smoke / axe all green on the release commit (Task 3.3).
- [ ] Human-simulated funnel walkthrough (web) produces zero blocking defects; punch-list triaged (Task 5.1).

### Group B — launch gates (human/hardware/ops — release owner's checklist, NOT this plan's completion target)

- [ ] OpenAI dashboard hard spend cap set; all §2 secrets provisioned in Vercel; Railway Postgres + Umami stood up; keys rotated (Gate 0).
- [ ] Play Billing purchase/restore verified on a **real device** (emulators can't test billing).
- [ ] Installed Android app launches with no URL bar (assetlinks validated after first `.aab` upload) and passes `docs/ops/device-qa-checklist.md`.
- [ ] Counsel sign-off Q1–Q10 on file; store listing + Data Safety submitted; support inbox + uptime monitor live.
- [ ] Operator can pause (<60s Edge Config) and roll back (<5min Vercel), both rehearsed (`docs/ops/launch-controls.md`).

Full consolidated human list: **Appendix A** (single source of "what only you can do").

---

# Phase 0 — Gate 0: secret scrub + first commit

**No `git add` of anything happens before Task 0.1 is complete.** Verified 2026-07-04: the working-tree `.env.example` is mostly placeholders, but its last two lines still carry live-looking values for `RESEND_API_KEY` (`re…`) and `UPSTASH_API_KEY` (`b…`).

### Task 0.1: Scrub `.env.example` and commit the finished pantry-schema work

**Files:**
- Modify: `.env.example` (last two lines)
- Commit (already written, currently untracked/modified): `lib/server/db/schema.ts`, `drizzle/0001_pantry-review.sql`, `drizzle/meta/0001_snapshot.json`, `drizzle/meta/_journal.json`, `tests/unit/server/pantry-schema.test.ts`, `DESIGN.md`, `TODOS.md`, `docs/handoff/2026-07-02-full-build-session-handoff.md`, `docs/handoff/2026-07-02-sgw-tew-audit-to-unconditional-GO-handoff.md`, `docs/handoff/2026-07-04-pantry-review-pipeline-session-handoff.md`, `docs/handoff/2026-07-04-unified-completion-plan-prompt.md`, `docs/handoff/2026-07-04-unified-completion-plan.md` (this file), `docs/handoff/human-actions-required.md`

**Interfaces:**
- Produces: a clean `.env.example` (placeholders only) and the committed pantry schema/migration every later task builds on.

- [ ] **Step 1: Scrub the two live values**

Open `.env.example`. Replace the final block (the two lines carrying real values) with:

```
# --- Transactional email (magic links + pantry intake/report emails) ---
RESEND_API_KEY=

# --- Upstash management API (CLI only; the app uses the REST URL/TOKEN above) ---
UPSTASH_API_KEY=
```

- [ ] **Step 2: Verify nothing key-shaped remains anywhere staged-able**

Run: `grep -nE "(re_[A-Za-z0-9]{8,}|sk-[A-Za-z0-9]{8,}|whsec_[A-Za-z0-9]{8,}|AKIA[A-Z0-9]{8,})" .env.example && echo LEAK || echo CLEAN`
Expected: `CLEAN`

Run: `git diff --cached 2>/dev/null | grep -cE "re_[A-Za-z0-9]{8,}" ; git status --short`
Expected: no key-shaped strings; status shows only the intended files.

- [ ] **Step 3: Confirm the baseline is green before committing**

Run: `npm run typecheck && npm test`
Expected: 0 type errors; full suite PASS (includes `pantry-schema.test.ts` 12/12).

- [ ] **Step 4: Commit the finished work**

```bash
git add .env.example lib/server/db/schema.ts drizzle/ tests/unit/server/pantry-schema.test.ts DESIGN.md TODOS.md docs/handoff/
git commit -m "feat(pantry): schema + migration for pantry review pipeline; scrub .env.example to placeholders

Includes DESIGN.md (canonical design system), TODOS.md (captured deferrals),
session handoffs, and the unified completion plan.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Flag the human action (do not perform it)**

Confirm Appendix A item H1 (rotate the Resend + Upstash keys — they passed through AI transcripts) is surfaced to the founder. **Agent must not rotate keys.**

**Owner:** agent (scrub/commit) + human (rotation) · **Effort:** S · **Verification:** `git show --stat HEAD` lists the files above; grep in Step 2 prints CLEAN; founder confirms rotation separately.

---

# Phase 1 — WS1: remaining agent-executable gaps outside the pantry

**WS1 acceptance criteria:** (a) the P8 manifest `screenshots` gap is closed with real assets and a test; (b) `docs/handoff/human-actions-required.md` is reconciled into the single deduplicated remaining-work list (Appendix A of this plan) with every item owner-tagged and verified rather than assumed — agent-executable items became tasks in this plan; human items carry a "done when".

### Task 1.1: `public/manifest.webmanifest` screenshots array + assets

P8 flagged this: maskable icons exist, `screenshots` does not. A `screenshots` array upgrades the browser-native install UI independent of Play's own listing assets.

**Files:**
- Create: `public/screenshot-check.png`, `public/screenshot-result.png` (captured below)
- Modify: `public/manifest.webmanifest`
- Test: `tests/unit/revora/pwa-assets.test.ts` (extend the existing file contract)

**Interfaces:**
- Consumes: the dev server (`npx next dev`) and existing pages `/` (check form) and `/how-it-works`.
- Produces: manifest with `screenshots: [{src, sizes, type, form_factor: "narrow"}]` — consumed by install UI and by the Play-listing screenshot workflow later (human retakes marketing shots per `docs/ops/play-listing.md` §9; these two are functional placeholders, honest screenshots of the real app, not mockups).

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/revora/pwa-assets.test.ts` (follow the file's existing read-and-assert style):

```ts
it("manifest declares narrow screenshots that exist on disk", () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public/manifest.webmanifest"), "utf8")
  ) as { screenshots?: { src: string; sizes: string; type: string; form_factor: string }[] };

  expect(manifest.screenshots?.length).toBeGreaterThanOrEqual(2);
  for (const shot of manifest.screenshots ?? []) {
    expect(shot.form_factor).toBe("narrow");
    expect(shot.type).toBe("image/png");
    expect(/^\d+x\d+$/.test(shot.sizes)).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), "public", shot.src.replace(/^\//, "")))).toBe(true);
  }
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/revora/pwa-assets.test.ts`
Expected: FAIL — `manifest.screenshots` is undefined.

- [ ] **Step 3: Capture the two screenshots with Playwright**

Write `scripts/capture-manifest-screenshots.mjs`:

```js
#!/usr/bin/env node
// Captures the two web-manifest screenshots from the running dev server.
// Usage: npx next dev --port 3100 &  then  node scripts/capture-manifest-screenshots.mjs
import { chromium } from "@playwright/test";

const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3100";
const SHOTS = [
  { path: "/", file: "public/screenshot-check.png" },
  { path: "/how-it-works", file: "public/screenshot-result.png" }
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 750, height: 1334 } });
for (const shot of SHOTS) {
  await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: shot.file });
  console.log(`captured ${shot.file}`);
}
await browser.close();
```

Run: `npx next dev --port 3100 &` … wait for ready … `node scripts/capture-manifest-screenshots.mjs` … then kill the dev server.
Expected: both PNGs exist, 750×1334.

- [ ] **Step 4: Add the screenshots array to the manifest**

In `public/manifest.webmanifest`, after `"icons": [...]` add:

```json
"screenshots": [
  { "src": "/screenshot-check.png", "sizes": "750x1334", "type": "image/png", "form_factor": "narrow" },
  { "src": "/screenshot-result.png", "sizes": "750x1334", "type": "image/png", "form_factor": "narrow" }
]
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run tests/unit/revora/pwa-assets.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add public/manifest.webmanifest public/screenshot-check.png public/screenshot-result.png scripts/capture-manifest-screenshots.mjs tests/unit/revora/pwa-assets.test.ts
git commit -m "feat(pwa): manifest screenshots array + captured assets (P8 gap)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent · **Effort:** S · **Verification:** test green; `npx next build` still succeeds.

### Task 1.2: Reconcile `docs/handoff/human-actions-required.md` against Appendix A

**Files:**
- Modify: `docs/handoff/human-actions-required.md`

**Interfaces:**
- Consumes: Appendix A of this plan (the reconciled single source).
- Produces: the running checklist updated so it and Appendix A agree — future sessions read either without contradiction.

- [ ] **Step 1: Apply the verified statuses**

Founder's inline notes (already in the file) verified 2026-07-04 and normalized: Railway CLI installed+logged in (DB **not yet provisioned** — no `DATABASE_URL` exists); Resend signed up + CLI authed (domain verification unconfirmed); Upstash prod created + CLI authed; Sentry account + CLI authed (`SENTRY_DSN` in Vercel unconfirmed); Umami cloud account created, self-host on Railway **failing** (pnpm errors) — decide cloud-vs-self-host, see Appendix A H8; Stripe account live + MCP authed; Play/Google Cloud/domain/counsel/trademark all still open.

Rewrite each touched line to `✅ done — <evidence>` or `☐ open — <what remains>`, and add one line at the top: `Reconciled 2026-07-04 against docs/handoff/2026-07-04-unified-completion-plan.md Appendix A — that appendix is the deduplicated master list.`

- [ ] **Step 2: Add the pantry-specific human items**

Append under "Appended during the build" the new section (copy verbatim from Appendix A items H1–H6: key rotation, Payment Link + `STRIPE_PRICE_PANTRY`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_EMAIL`, webhook endpoint on the deploy, 8–10 labeled founder photos).

- [ ] **Step 3: Commit**

```bash
git add docs/handoff/human-actions-required.md
git commit -m "docs(ops): reconcile human-actions checklist with unified plan appendix A

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** human+agent (agent edits; founder confirms each ✅ before relying on it) · **Effort:** S · **Verification:** no item appears in both files with contradicting status.

---

# Phase 2 — WS2: Pantry Review pipeline (lanes E → A2 → B → C → D → A3)

**WS2 acceptance criteria:** a buyer who pays the Payment Link receives an intake email; can claim, upload ≤10 photos, provide A1C band + Art. 9 consent; sees vision-drafted items and **confirms/edits them before any verdict**; every confirmed item is judged by `checkFood()` only; a deterministic HTML report is emailed and printable; refunds cancel; stuck orders self-heal via cron; the founder can operate everything from `/admin/pantry`; every test-plan gap has a test; existing subscription billing behaves identically (regression test green).

Task order here is dependency order (E before A2 because the webhook sends the intake email; extraction module before the intake submit route that calls it). Lane mapping: 2.1–2.2 = E, 2.3–2.4 = A2, 2.5–2.6 + 2.9–2.10 = B, 2.7–2.8 = C, 2.11–2.12 = A3, 2.13–2.14 = D. Baseline note (verified 2026-07-04): the full suite is green; under heavy machine load `createTestDb()` can exceed the 45s hook timeout — re-run the affected file standalone before treating a timeout as a failure.

### Task 2.1: Lane E — transactional email util (`lib/server/email.ts`)

~30-line raw-fetch Resend sender mirroring `auth.ts:62`, with the same `AUTH_EMAIL_STUB_DIR` test seam so Playwright can read pantry emails from disk exactly like magic links.

**Files:**
- Create: `lib/server/email.ts`
- Test: `tests/unit/server/email.test.ts`

**Interfaces:**
- Produces: `sendEmail(input: { to: string; subject: string; text: string }, deps?: { fetchImpl?: typeof fetch }): Promise<{ ok: true } | { ok: false; status: number }>` — consumed by Tasks 2.4 (intake email), 2.11 (report email, founder alert), 2.12 (sweep resends), 2.14 (admin resends).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/server/email.test.ts`:

```ts
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { sendEmail } from "../../../lib/server/email";

describe("sendEmail", () => {
  afterEach(() => {
    delete process.env.AUTH_EMAIL_STUB_DIR;
    delete process.env.RESEND_API_KEY;
  });

  it("POSTs to Resend with bearer auth and the message body", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });

    const result = await sendEmail(
      { to: "buyer@example.com", subject: "Hi", text: "Body" },
      { fetchImpl: fetchImpl as unknown as typeof fetch }
    );

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test_key");
    const body = JSON.parse(init.body);
    expect(body.to).toBe("buyer@example.com");
    expect(body.subject).toBe("Hi");
    expect(body.text).toBe("Body");
  });

  it("returns ok:false with the status on a Resend error", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 429 });

    const result = await sendEmail(
      { to: "b@e.com", subject: "s", text: "t" },
      { fetchImpl: fetchImpl as unknown as typeof fetch }
    );

    expect(result).toEqual({ ok: false, status: 429 });
  });

  it("writes to the stub dir instead of fetching when AUTH_EMAIL_STUB_DIR is set", async () => {
    const stubDir = fs.mkdtempSync(path.join(os.tmpdir(), "revora-mail-"));
    process.env.AUTH_EMAIL_STUB_DIR = stubDir;
    const fetchImpl = vi.fn();

    const result = await sendEmail(
      { to: "buyer@example.com", subject: "Report ready", text: "link" },
      { fetchImpl: fetchImpl as unknown as typeof fetch }
    );

    expect(result).toEqual({ ok: true });
    expect(fetchImpl).not.toHaveBeenCalled();
    const files = fs.readdirSync(stubDir);
    expect(files.length).toBe(1);
    const saved = JSON.parse(fs.readFileSync(path.join(stubDir, files[0]), "utf8"));
    expect(saved.subject).toBe("Report ready");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/server/email.test.ts`
Expected: FAIL — module `lib/server/email` not found.

- [ ] **Step 3: Implement**

Create `lib/server/email.ts`:

```ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * One transactional-email door for everything that is not a NextAuth magic
 * link (pantry intake, report delivery, founder alerts). Same raw-fetch
 * Resend call and the same AUTH_EMAIL_STUB_DIR test seam as auth.ts, so
 * Playwright reads these from disk exactly like magic links.
 * ponytail: raw fetch, no SDK; add the Resend SDK only if we ever need
 * attachments or templates.
 */

const EMAIL_FROM = process.env.AUTH_EMAIL_FROM ?? "Revora <signin@revora.app>";

export type SendEmailInput = { to: string; subject: string; text: string };
export type SendEmailResult = { ok: true } | { ok: false; status: number };
export type SendEmailDeps = { fetchImpl?: typeof fetch };

export async function sendEmail(
  input: SendEmailInput,
  deps: SendEmailDeps = {}
): Promise<SendEmailResult> {
  const stubDir = process.env.AUTH_EMAIL_STUB_DIR;
  if (stubDir && process.env.VERCEL_ENV !== "production") {
    await mkdir(stubDir, { recursive: true });
    const name = `${input.to.replace(/[^a-z0-9@.]/gi, "_")}-${Date.now()}.json`;
    await writeFile(path.join(stubDir, name), JSON.stringify(input));
    return { ok: true };
  }

  const fetchImpl = deps.fetchImpl ?? fetch;
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from: EMAIL_FROM, ...input })
  });

  return response.ok ? { ok: true } : { ok: false, status: response.status };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/server/email.test.ts`
Expected: PASS (3/3).

- [ ] **Step 5: Commit**

```bash
git add lib/server/email.ts tests/unit/server/email.test.ts
git commit -m "feat(pantry): transactional email util with stub-dir test seam (lane E)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent · **Effort:** S · **Verification:** 3/3 green; no engine files touched.

### Task 2.2: Lane E — privacy page covers photos, vision, and the pantry report

**Files:**
- Modify: `app/privacy/page.tsx` (new `<h2>` section between "Voice input" (line ~86) and "What Revora records about usage")
- Test: `tests/unit/revora/privacy-stateful.test.ts` (extend)

**Interfaces:**
- Consumes: nothing new. Produces: the privacy disclosure the intake consent checkbox links to (Task 2.9).

- [ ] **Step 1: Write the failing test**

Add to `tests/unit/revora/privacy-stateful.test.ts` (match the file's existing render/read style for page copy assertions):

```ts
it("privacy page discloses pantry photos, vision extraction, and deletion-on-delivery", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "app/privacy/page.tsx"),
    "utf8"
  );
  expect(source).toMatch(/Pantry Review/);
  expect(source).toMatch(/photos/i);
  expect(source).toMatch(/OpenAI/);
  expect(source).toMatch(/deleted/i);
  expect(source).toMatch(/encrypted/i);
});
```

(If the existing tests in that file render the component instead of reading source, follow that pattern — assert the same five facts on rendered text.)

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/revora/privacy-stateful.test.ts`
Expected: the new assertion FAILs (`Pantry Review` absent).

- [ ] **Step 3: Add the section**

In `app/privacy/page.tsx`, after the "Voice input" block, add:

```tsx
<h2>Pantry Review photos</h2>
<p>
  If you buy a Pantry Review, the photos you upload are stored privately
  while your report is prepared and are deleted when it is delivered. A
  vision model (via OpenAI&apos;s API, with <code>store: false</code>) is
  used only to read the food items in your photos into a list — you
  review and correct that list yourself before anything is assessed. The
  item names, any notes you add, your A1C range, and the finished report
  are stored encrypted, the same way as your checks, and are removed if
  you delete your account.
</p>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/revora/privacy-stateful.test.ts tests/unit/revora/claims-boundary-copy.test.ts`
Expected: PASS — including the claims-boundary scan over the new copy (no banned families used).

- [ ] **Step 5: Commit**

```bash
git add app/privacy/page.tsx tests/unit/revora/privacy-stateful.test.ts
git commit -m "docs(privacy): disclose pantry photos, vision extraction, deletion-on-delivery (lane E)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent · **Effort:** S · **Verification:** both copy-audit suites green.

### Task 2.3: Lane A2 — claim-token module

Tokens bind orders by **possession, not email equality** (locked decision 4). The DB stores only a SHA-256 hash: lookups hash the presented token first (constant-time by construction — no secret-dependent comparison on attacker input), and a database leak exposes no usable claim links.

**Files:**
- Create: `lib/server/pantry/claims.ts`
- Test: `tests/unit/server/pantry-claims.test.ts`

**Interfaces:**
- Produces: `generateClaimToken(): { token: string; tokenHash: string }` (token = 32 random bytes base64url — goes in the email; tokenHash — goes in `pantry_orders.claim_token`) and `hashClaimToken(token: string): string`. Consumed by Tasks 2.4 (webhook) and 2.6 (claim route).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/server/pantry-claims.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  generateClaimToken,
  hashClaimToken
} from "../../../lib/server/pantry/claims";

describe("pantry claim tokens", () => {
  it("generates a 32-byte base64url token whose hash round-trips", () => {
    const { token, tokenHash } = generateClaimToken();
    expect(Buffer.from(token, "base64url").length).toBe(32);
    expect(tokenHash).toBe(hashClaimToken(token));
    expect(tokenHash).not.toContain(token);
    expect(/^[a-f0-9]{64}$/.test(tokenHash)).toBe(true);
  });

  it("is unique per call", () => {
    const seen = new Set(
      Array.from({ length: 50 }, () => generateClaimToken().token)
    );
    expect(seen.size).toBe(50);
  });

  it("hashing is deterministic and input-sensitive", () => {
    expect(hashClaimToken("abc")).toBe(hashClaimToken("abc"));
    expect(hashClaimToken("abc")).not.toBe(hashClaimToken("abd"));
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/server/pantry-claims.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `lib/server/pantry/claims.ts`:

```ts
import { createHash, randomBytes } from "node:crypto";

/**
 * Order binding is by POSSESSION of the emailed claim token — the same trust
 * model as the magic link itself — never by email equality (aliases, relays,
 * and typos break equality; design doc locked decision 4). The DB stores only
 * sha256(token): a leaked table cannot mint claim links, and lookups hash the
 * presented token before the indexed comparison, so no secret-dependent
 * branching happens on attacker-controlled input.
 */

export function hashClaimToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateClaimToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashClaimToken(token) };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/server/pantry-claims.test.ts`
Expected: PASS (3/3).

- [ ] **Step 5: Commit**

```bash
git add lib/server/pantry/claims.ts tests/unit/server/pantry-claims.test.ts
git commit -m "feat(pantry): claim tokens — possession binding, hashed at rest (lane A2)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent · **Effort:** S · **Verification:** 3/3 green.

### Task 2.4: Lane A2 — Stripe webhook pantry branch (THE critical-regression task)

Payment Links complete as `checkout.session.completed` with `mode: "payment"` and **no** `subscription` id — today's code already ignores them (early return at `handlers.ts:358`). The new branch keys on `mode === "payment"` **before** that path, verifies the line item is `STRIPE_PRICE_PANTRY` via `checkout.sessions.listLineItems`, inserts the order idempotently on `stripe_session_id`, and emails the claim link. `charge.refunded` cancels by `payment_intent`. **Existing subscription events must behave identically — `tests/unit/server/billing-routes.test.ts` passes unmodified.**

**Files:**
- Modify: `app/api/billing/handlers.ts` (extend `BillingDeps`, `applyStripeEvent`, `createStripeWebhookHandler`)
- Test: `tests/unit/server/pantry-webhook.test.ts` (new — same pglite + DI pattern as `billing-routes.test.ts`, which stays untouched as the regression proof)

**Interfaces:**
- Consumes: `sendEmail` (Task 2.1), `generateClaimToken`/`hashClaimToken` (Task 2.3), `schema.pantryOrders` (committed in Gate 0).
- Produces: `applyStripeEvent(db, event, now, stripe?, emailSender?)` — 5th param optional, defaulting to `sendEmail`, so every existing call site compiles unchanged. New env: `STRIPE_PRICE_PANTRY` (add to `.env.example` with an empty value). Orders created with `status: "paid"`, `claimToken` = hash, `intakeEmailSentAt` set only when the email send returns ok (a null value is the sweep's retry signal, Task 2.12). Claim URL shape: `${NEXT_PUBLIC_APP_URL}/pantry/claim?token=<raw token>`.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/server/pantry-webhook.test.ts`:

```ts
import type Stripe from "stripe";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { applyStripeEvent } from "../../../app/api/billing/handlers";
import { hashClaimToken } from "../../../lib/server/pantry/claims";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const NOW = new Date("2026-07-05T10:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 7).toString("base64");
  process.env.STRIPE_PRICE_PANTRY = "price_pantry_25";
  process.env.NEXT_PUBLIC_APP_URL = "https://revora.test";
  testDb = await createTestDb();
});

afterAll(async () => {
  delete process.env.STRIPE_PRICE_PANTRY;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pantryOrders);
  await testDb.db.delete(schema.subscriptions);
});

function paymentSessionEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_pantry_1",
        mode: "payment",
        payment_intent: "pi_123",
        customer_details: { email: "buyer@example.com" },
        subscription: null,
        client_reference_id: null,
        ...overrides
      }
    }
  } as unknown as Stripe.Event;
}

function stripeWithLineItems(priceId: string) {
  return () =>
    ({
      checkout: {
        sessions: {
          listLineItems: vi.fn().mockResolvedValue({
            data: [{ price: { id: priceId } }]
          })
        }
      }
    }) as unknown as Stripe;
}

describe("applyStripeEvent — pantry branch", () => {
  it("creates a paid order and emails a claim link whose token hashes to the stored value", async () => {
    const send = vi.fn().mockResolvedValue({ ok: true });

    await applyStripeEvent(
      testDb.db,
      paymentSessionEvent(),
      NOW,
      stripeWithLineItems("price_pantry_25"),
      { send }
    );

    const [order] = await testDb.db.select().from(schema.pantryOrders);
    expect(order.status).toBe("paid");
    expect(order.email).toBe("buyer@example.com");
    expect(order.stripeSessionId).toBe("cs_pantry_1");
    expect(order.stripePaymentIntent).toBe("pi_123");
    expect(order.userId).toBeNull();
    expect(order.intakeEmailSentAt?.toISOString()).toBe(NOW.toISOString());

    expect(send).toHaveBeenCalledTimes(1);
    const message = send.mock.calls[0][0];
    expect(message.to).toBe("buyer@example.com");
    const token = /token=([A-Za-z0-9_-]+)/.exec(message.text)?.[1] ?? "";
    expect(hashClaimToken(token)).toBe(order.claimToken);
  });

  it("is idempotent on the session id — duplicate delivery makes one order, one email", async () => {
    const send = vi.fn().mockResolvedValue({ ok: true });
    const stripe = stripeWithLineItems("price_pantry_25");

    await applyStripeEvent(testDb.db, paymentSessionEvent(), NOW, stripe, { send });
    await applyStripeEvent(testDb.db, paymentSessionEvent(), NOW, stripe, { send });

    expect(await testDb.db.select().from(schema.pantryOrders)).toHaveLength(1);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("ignores payment-mode sessions for other products", async () => {
    const send = vi.fn();

    await applyStripeEvent(
      testDb.db,
      paymentSessionEvent({ id: "cs_other" }),
      NOW,
      stripeWithLineItems("price_something_else"),
      { send }
    );

    expect(await testDb.db.select().from(schema.pantryOrders)).toHaveLength(0);
    expect(send).not.toHaveBeenCalled();
  });

  it("does nothing when STRIPE_PRICE_PANTRY is unset", async () => {
    delete process.env.STRIPE_PRICE_PANTRY;
    const send = vi.fn();

    await applyStripeEvent(
      testDb.db,
      paymentSessionEvent(),
      NOW,
      stripeWithLineItems("price_pantry_25"),
      { send }
    );

    expect(await testDb.db.select().from(schema.pantryOrders)).toHaveLength(0);
    process.env.STRIPE_PRICE_PANTRY = "price_pantry_25";
  });

  it("keeps the order but leaves intakeEmailSentAt null when the email send fails", async () => {
    const send = vi.fn().mockResolvedValue({ ok: false, status: 500 });

    await applyStripeEvent(
      testDb.db,
      paymentSessionEvent(),
      NOW,
      stripeWithLineItems("price_pantry_25"),
      { send }
    );

    const [order] = await testDb.db.select().from(schema.pantryOrders);
    expect(order.status).toBe("paid");
    expect(order.intakeEmailSentAt).toBeNull();
  });

  it("charge.refunded cancels the matching order and ignores unknown intents", async () => {
    const send = vi.fn().mockResolvedValue({ ok: true });
    await applyStripeEvent(
      testDb.db,
      paymentSessionEvent(),
      NOW,
      stripeWithLineItems("price_pantry_25"),
      { send }
    );

    await applyStripeEvent(
      testDb.db,
      {
        type: "charge.refunded",
        data: { object: { payment_intent: "pi_unknown" } }
      } as unknown as Stripe.Event,
      NOW
    );
    let [order] = await testDb.db.select().from(schema.pantryOrders);
    expect(order.status).toBe("paid");

    await applyStripeEvent(
      testDb.db,
      {
        type: "charge.refunded",
        data: { object: { payment_intent: "pi_123" } }
      } as unknown as Stripe.Event,
      NOW
    );
    [order] = await testDb.db.select().from(schema.pantryOrders);
    expect(order.status).toBe("canceled");
  });

  it("REGRESSION: a subscription checkout still creates a subscription and NO pantry order", async () => {
    const send = vi.fn();
    const stripeClient = {
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          items: {
            data: [
              {
                price: { id: "price_monthly" },
                current_period_end: Math.floor(NOW.getTime() / 1000) + 86400
              }
            ]
          }
        })
      }
    } as unknown as Stripe;
    const [user] = await testDb.db
      .insert(schema.users)
      .values({ email: `sub-${Date.now()}@test.dev` })
      .returning();

    await applyStripeEvent(
      testDb.db,
      {
        type: "checkout.session.completed",
        data: {
          object: {
            mode: "subscription",
            client_reference_id: user.id,
            subscription: "sub_reg_1"
          }
        }
      } as unknown as Stripe.Event,
      NOW,
      () => stripeClient,
      { send }
    );

    expect(await testDb.db.select().from(schema.subscriptions)).toHaveLength(1);
    expect(await testDb.db.select().from(schema.pantryOrders)).toHaveLength(0);
    expect(send).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify the new tests fail and the old ones pass**

Run: `npx vitest run tests/unit/server/pantry-webhook.test.ts tests/unit/server/billing-routes.test.ts`
Expected: pantry-webhook FAILs (no pantry branch yet); billing-routes PASSes (baseline).

- [ ] **Step 3: Implement the branch**

In `app/api/billing/handlers.ts`:

(a) add imports:

```ts
import { generateClaimToken } from "../../../lib/server/pantry/claims";
import { sendEmail, type SendEmailResult } from "../../../lib/server/email";
```

(b) extend `BillingDeps`:

```ts
export type BillingDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  playLookup?: typeof fetchPlaySubscription;
  stripeClient?: () => Stripe;
  now?: () => Date;
  email?: PantryEmailSender;
};

export type PantryEmailSender = {
  send: (input: {
    to: string;
    subject: string;
    text: string;
  }) => Promise<SendEmailResult>;
};
```

(c) in `createStripeWebhookHandler`, thread it through:

```ts
export function createStripeWebhookHandler(deps: BillingDeps = {}) {
  const db = deps.db ?? getDb;
  const stripe = deps.stripeClient ?? defaultStripe;
  const now = deps.now ?? (() => new Date());
  const email = deps.email ?? { send: sendEmail };
  // ... unchanged body until:
    await applyStripeEvent(db(), event, now(), stripe, email);
```

(d) in `applyStripeEvent`, add the optional 5th param and the two branches. The pantry checkout branch goes at the **top** of the `checkout.session.completed` block, keyed on `mode === "payment"`, so the existing subscription path below it is byte-for-byte unchanged:

```ts
export async function applyStripeEvent(
  db: Db,
  event: Stripe.Event,
  now: Date,
  stripe?: () => Stripe,
  email?: PantryEmailSender
): Promise<void> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === "payment") {
      // Pantry Review Payment Link (one-time). Anything else in payment
      // mode is not ours — verify the price before touching the DB.
      await applyPantryCheckout(db, session, now, stripe, email);
      return;
    }

    // ... existing subscription path, unchanged ...
```

(e) add after `applyStripeEvent`:

```ts
async function applyPantryCheckout(
  db: Db,
  session: Stripe.Checkout.Session,
  now: Date,
  stripe?: () => Stripe,
  email?: PantryEmailSender
): Promise<void> {
  const pantryPrice = process.env.STRIPE_PRICE_PANTRY;
  if (!pantryPrice || !stripe) {
    return;
  }

  const lineItems = await stripe().checkout.sessions.listLineItems(
    session.id,
    { limit: 10 }
  );
  if (!lineItems.data.some((item) => item.price?.id === pantryPrice)) {
    return;
  }

  const buyerEmail =
    session.customer_details?.email ?? session.customer_email;
  if (!buyerEmail) {
    return; // Payment Links always collect email; belt-and-suspenders.
  }

  const { token, tokenHash } = generateClaimToken();
  const inserted = await db
    .insert(schema.pantryOrders)
    .values({
      email: buyerEmail,
      stripeSessionId: session.id,
      stripePaymentIntent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
      claimToken: tokenHash,
      updatedAt: now
    })
    .onConflictDoNothing({ target: schema.pantryOrders.stripeSessionId })
    .returning();

  if (inserted.length === 0) {
    return; // Duplicate webhook delivery — the first one already emailed.
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const result = await (email?.send ?? sendEmail)({
    to: buyerEmail,
    subject: "Your Pantry Review is paid for — let's set it up",
    text: [
      "Thanks — your Pantry Review is paid for.",
      "",
      "Set it up here (sign-in takes one tap, no password):",
      `${appUrl}/pantry/claim?token=${token}`,
      "",
      "You'll add photos of your pantry or typical meals, confirm what we",
      "saw, and get your report by email within 7 days.",
      "",
      `Questions? Reply to this email or write to ${process.env.SUPPORT_EMAIL ?? "support@revora.app"}.`
    ].join("\n")
  });

  if (result.ok) {
    await db
      .update(schema.pantryOrders)
      .set({ intakeEmailSentAt: now, updatedAt: now })
      .where(eq(schema.pantryOrders.id, inserted[0].id));
  }
}
```

(f) add the refund branch at the end of `applyStripeEvent` (after the subscription-update block):

```ts
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntent =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;
    if (!paymentIntent) {
      return;
    }
    await db
      .update(schema.pantryOrders)
      .set({ status: "canceled", updatedAt: now })
      .where(eq(schema.pantryOrders.stripePaymentIntent, paymentIntent));
  }
```

(g) add to `.env.example` under the Stripe block (names only):

```
# Pantry Review one-time product (price behind the Payment Link)
STRIPE_PRICE_PANTRY=
```

- [ ] **Step 4: Run the full regression gate**

Run: `npx vitest run tests/unit/server/pantry-webhook.test.ts tests/unit/server/billing-routes.test.ts`
Expected: BOTH files fully PASS — `billing-routes.test.ts` **unmodified** is the regression proof. Also run `npm run typecheck`.

- [ ] **Step 5: Commit**

```bash
git add app/api/billing/handlers.ts tests/unit/server/pantry-webhook.test.ts .env.example
git commit -m "feat(pantry): payment-link webhook branch — idempotent order + claim email; charge.refunded cancels (lane A2)

Existing subscription events verified byte-identical (billing-routes suite unmodified).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent · **Effort:** M · **Verification:** Step 4 both-green; `git diff HEAD~1 -- tests/unit/server/billing-routes.test.ts` is empty.

### Task 2.5: Lane B — install `@vercel/blob` + client-upload token route

Photos go **client → Blob directly** (`@vercel/blob/client`): Vercel functions cap request bodies at ~4.5MB, so proxying 5MB photos through a route is not an option. The route only mints scoped upload tokens after auth + ownership + size/type checks. Photo rows are recorded at submit (Task 2.9) because `onUploadCompleted` does not fire on localhost; the ≤10-photo hard cap is enforced at submit server-side (and in the picker client-side).

**Files:**
- Modify: `package.json` (`npm install @vercel/blob`)
- Create: `lib/server/pantry/upload-auth.ts`, `app/api/pantry/upload/route.ts`
- Test: `tests/unit/server/pantry-upload-auth.test.ts`

**Interfaces:**
- Consumes: `schema.pantryOrders` / `schema.pantryPhotos`, `getSessionInfo`.
- Produces: `authorizePantryUpload(db, session, clientPayload)` → token options `{ allowedContentTypes, maximumSizeInBytes, addRandomSuffix: true, tokenPayload }` or throws; `POST /api/pantry/upload` (the `handleUpload` wrapper) — consumed by the intake form's `upload()` call (Task 2.9). New env consumed implicitly by the SDK: `BLOB_READ_WRITE_TOKEN` (human provisions — Appendix A H3; add the name to `.env.example`).

- [ ] **Step 1: Install and record the dependency**

Run: `npm install @vercel/blob`
Expected: `package.json` gains `"@vercel/blob"`; lockfile updated. Add to `.env.example`:

```
# Vercel Blob (pantry photo uploads; token from Vercel → Storage → Blob)
BLOB_READ_WRITE_TOKEN=
```

- [ ] **Step 2: Write the failing test**

Create `tests/unit/server/pantry-upload-auth.test.ts`:

```ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { authorizePantryUpload } from "../../../lib/server/pantry/upload-auth";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;
let otherUserId: string;

beforeAll(async () => {
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "up@test.dev" })
    .returning();
  const [other] = await testDb.db
    .insert(schema.users)
    .values({ email: "other@test.dev" })
    .returning();
  userId = user.id;
  otherUserId = other.id;
});

afterAll(async () => {
  await testDb.close();
});

async function makeOrder(overrides: Partial<typeof schema.pantryOrders.$inferInsert> = {}) {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "up@test.dev",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: `hash_${Math.random().toString(36).slice(2)}`,
      userId,
      status: "claimed",
      ...overrides
    })
    .returning();
  return order;
}

describe("authorizePantryUpload", () => {
  it("returns scoped token options for the order owner", async () => {
    const order = await makeOrder();
    const options = await authorizePantryUpload(
      testDb.db,
      { userId, email: "up@test.dev" },
      order.id
    );
    expect(options.maximumSizeInBytes).toBe(5 * 1024 * 1024);
    expect(options.allowedContentTypes).toEqual([
      "image/jpeg",
      "image/png",
      "image/webp"
    ]);
    expect(options.tokenPayload).toBe(order.id);
  });

  it("rejects another user's order", async () => {
    const order = await makeOrder({ userId: otherUserId });
    await expect(
      authorizePantryUpload(testDb.db, { userId, email: "up@test.dev" }, order.id)
    ).rejects.toThrow(/no open pantry order/i);
  });

  it("rejects orders not in an uploadable state", async () => {
    const order = await makeOrder({ status: "ready" });
    await expect(
      authorizePantryUpload(testDb.db, { userId, email: "up@test.dev" }, order.id)
    ).rejects.toThrow(/no open pantry order/i);
  });

  it("rejects a garbage order id without throwing a database error", async () => {
    await expect(
      authorizePantryUpload(testDb.db, { userId, email: "up@test.dev" }, "not-a-uuid")
    ).rejects.toThrow(/no open pantry order/i);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run tests/unit/server/pantry-upload-auth.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement**

Create `lib/server/pantry/upload-auth.ts`:

```ts
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { schema, type Db } from "../db";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const UPLOADABLE_STATUSES = ["claimed", "submitted"] as const;

export type UploadTokenOptions = {
  allowedContentTypes: string[];
  maximumSizeInBytes: number;
  addRandomSuffix: true;
  tokenPayload: string;
};

/** Pure token-authorization logic, unit-testable without Blob network calls. */
export async function authorizePantryUpload(
  db: Db,
  session: { userId: string; email: string },
  clientPayload: string | null | undefined
): Promise<UploadTokenOptions> {
  const parsedId = z.string().uuid().safeParse(clientPayload);
  if (!parsedId.success) {
    throw new Error("No open pantry order for this upload.");
  }

  const [order] = await db
    .select()
    .from(schema.pantryOrders)
    .where(
      and(
        eq(schema.pantryOrders.id, parsedId.data),
        eq(schema.pantryOrders.userId, session.userId),
        inArray(schema.pantryOrders.status, [...UPLOADABLE_STATUSES])
      )
    );
  if (!order) {
    throw new Error("No open pantry order for this upload.");
  }

  return {
    allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
    maximumSizeInBytes: MAX_PHOTO_BYTES,
    addRandomSuffix: true,
    tokenPayload: order.id
  };
}
```

Create `app/api/pantry/upload/route.ts`:

```ts
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { authorizePantryUpload } from "../../../../lib/server/pantry/upload-auth";
import { getDb, type Db } from "../../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

export const runtime = "nodejs";

type Deps = { db?: () => Db; getSession?: () => Promise<SessionInfo> };

export function createPantryUploadHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;

  return async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    const body = (await request.json()) as HandleUploadBody;
    try {
      const json = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: (_pathname, clientPayload) =>
          authorizePantryUpload(db(), session, clientPayload),
        // Photo rows are recorded at submit (/api/pantry/submit) — this
        // callback does not fire on localhost, so nothing may depend on it.
        onUploadCompleted: async () => {}
      });
      return NextResponse.json(json);
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }
  };
}

export const POST = createPantryUploadHandler();
```

- [ ] **Step 5: Run tests + typecheck**

Run: `npx vitest run tests/unit/server/pantry-upload-auth.test.ts && npm run typecheck`
Expected: PASS (4/4); 0 type errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/server/pantry/upload-auth.ts app/api/pantry/upload/route.ts tests/unit/server/pantry-upload-auth.test.ts .env.example
git commit -m "feat(pantry): vercel blob client-upload token route with ownership + size/type caps (lane B)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent (human provisions `BLOB_READ_WRITE_TOKEN` — Appendix A H3) · **Effort:** M · **Verification:** 4/4 green; typecheck clean.

### Task 2.6: Lane B — claim route + signin `callbackUrl` passthrough

Binds an order to the first signed-in visitor presenting the token (possession model). `app/signin/page.tsx` currently hard-codes `redirectTo: "/welcome"` — it needs a validated relative-path `callbackUrl` passthrough or the buyer lands on the wrong page after sign-in.

**Files:**
- Create: `app/pantry/claim/route.ts`
- Modify: `app/signin/page.tsx` (accept `?callbackUrl=` — relative paths only)
- Test: `tests/unit/server/pantry-claim-route.test.ts`

**Interfaces:**
- Consumes: `hashClaimToken` (2.3), `schema.pantryOrders`, `getSessionInfo`.
- Produces: `GET /pantry/claim?token=<raw>` → signs the visitor in if needed, binds the order (`userId`, `status: "claimed"`, `claimedAt`), redirects to `/pantry/intake`. Signin page honors `callbackUrl` beginning with a single `/`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/server/pantry-claim-route.test.ts`:

```ts
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createPantryClaimHandler } from "../../../app/pantry/claim/route";
import {
  generateClaimToken,
  hashClaimToken
} from "../../../lib/server/pantry/claims";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const NOW = new Date("2026-07-05T12:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;
let strangerId: string;

beforeAll(async () => {
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "claimer@test.dev" })
    .returning();
  const [stranger] = await testDb.db
    .insert(schema.users)
    .values({ email: "stranger@test.dev" })
    .returning();
  userId = user.id;
  strangerId = stranger.id;
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pantryOrders);
});

async function makePaidOrder(token: string) {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "buyer@example.com",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: hashClaimToken(token)
    })
    .returning();
  return order;
}

const deps = (uid: string | null) => ({
  db: () => testDb.db,
  getSession: async () =>
    uid ? { userId: uid, email: "claimer@test.dev" } : null,
  now: () => NOW
});

describe("GET /pantry/claim", () => {
  it("redirects an anonymous visitor to signin with a callback back to the claim", async () => {
    const GET = createPantryClaimHandler(deps(null));
    const response = await GET(
      new Request("https://revora.test/pantry/claim?token=abc")
    );
    expect(response.status).toBeGreaterThanOrEqual(302);
    const location = response.headers.get("location") ?? "";
    expect(location).toContain("/signin");
    expect(decodeURIComponent(location)).toContain("/pantry/claim?token=abc");
  });

  it("binds an unclaimed order to the signed-in visitor by token possession", async () => {
    const { token } = generateClaimToken();
    const order = await makePaidOrder(token);
    const GET = createPantryClaimHandler(deps(userId));

    const response = await GET(
      new Request(`https://revora.test/pantry/claim?token=${token}`)
    );

    expect(response.headers.get("location")).toContain("/pantry/intake");
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.userId).toBe(userId);
    expect(updated.status).toBe("claimed");
    expect(updated.claimedAt?.toISOString()).toBe(NOW.toISOString());
  });

  it("never rebinds an order already claimed by someone else", async () => {
    const { token } = generateClaimToken();
    const order = await makePaidOrder(token);
    await testDb.db
      .update(schema.pantryOrders)
      .set({ userId: strangerId, status: "claimed" })
      .where(eq(schema.pantryOrders.id, order.id));

    const GET = createPantryClaimHandler(deps(userId));
    await GET(new Request(`https://revora.test/pantry/claim?token=${token}`));

    const [after] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(after.userId).toBe(strangerId);
  });

  it("a wrong token is a harmless redirect to intake (empty state handles it)", async () => {
    const GET = createPantryClaimHandler(deps(userId));
    const response = await GET(
      new Request("https://revora.test/pantry/claim?token=wrong")
    );
    expect(response.headers.get("location")).toContain("/pantry/intake");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/server/pantry-claim-route.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the route**

Create `app/pantry/claim/route.ts`:

```ts
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { hashClaimToken } from "../../../lib/server/pantry/claims";
import { getDb, schema, type Db } from "../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../lib/server/session";

export const runtime = "nodejs";

type Deps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  now?: () => Date;
};

export function createPantryClaimHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const now = deps.now ?? (() => new Date());

  return async function GET(request: Request) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") ?? "";

    const session = await getSession();
    if (!session) {
      const callback = `/pantry/claim?token=${encodeURIComponent(token)}`;
      return NextResponse.redirect(
        new URL(`/signin?callbackUrl=${encodeURIComponent(callback)}`, url)
      );
    }

    if (token) {
      // Possession binds: first signed-in visitor with the token owns the
      // order. Already-claimed orders (userId set) are never rebound.
      await db()
        .update(schema.pantryOrders)
        .set({
          userId: session.userId,
          status: "claimed",
          claimedAt: now(),
          updatedAt: now()
        })
        .where(
          and(
            eq(schema.pantryOrders.claimToken, hashClaimToken(token)),
            isNull(schema.pantryOrders.userId),
            eq(schema.pantryOrders.status, "paid")
          )
        );
    }

    // Wrong/expired token or already claimed: intake's empty state carries
    // the "Paid with a different email?" support escape hatch.
    return NextResponse.redirect(new URL("/pantry/intake", url));
  };
}

export const GET = createPantryClaimHandler();
```

- [ ] **Step 4: Add the signin callback passthrough**

In `app/signin/page.tsx`, change the component signature and the `signIn` call:

```tsx
export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  // Relative, single-slash paths only — never an open redirect.
  const redirectTo =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/welcome";
```

…and inside the form action, replace `redirectTo: "/welcome"` with `redirectTo` (capture the variable before the `"use server"` closure by passing it through a hidden input or binding — simplest: `<input type="hidden" name="callbackUrl" value={redirectTo} />` and in the action re-validate: `const raw = String(formData.get("callbackUrl") ?? ""); const target = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/welcome";` then `redirectTo: target`). Re-validating inside the action is mandatory — the hidden input is client-tamperable.

- [ ] **Step 5: Run tests + typecheck + the existing auth smoke assertions**

Run: `npx vitest run tests/unit/server/pantry-claim-route.test.ts && npm run typecheck`
Expected: PASS (4/4); 0 errors.

- [ ] **Step 6: Commit**

```bash
git add app/pantry/claim/route.ts app/signin/page.tsx tests/unit/server/pantry-claim-route.test.ts
git commit -m "feat(pantry): claim route binds order by token possession; signin honors relative callbackUrl (lane B)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent · **Effort:** M · **Verification:** 4/4 green; manual check that `/signin?callbackUrl=https://evil.example` still lands on `/welcome`.

### Task 2.7: Lane C — vision extraction module (extractor, never judge)

One Responses API call **per photo** (per-photo failure isolation drives the design-spec partial states), strict JSON schema, `store: false`, 60s timeout, no retries at this layer. Model: `REVORA_VISION_MODEL` env override, default `gpt-5.4-mini`. A `PANTRY_EXTRACT_STUB` seam (refused in production, like every other test seam) lets unit tests and the E2E run with zero OpenAI traffic.

**Files:**
- Create: `lib/pantry/extract.ts`
- Test: `tests/unit/server/pantry-extract.test.ts`

**Interfaces:**
- Consumes: `openai` SDK (already installed). Does NOT import anything from `lib/revora/` — the engine stays untouched.
- Produces:
  - `type ExtractedItem = { name: string; portion: string | null }`
  - `interface PantryVisionClient { extractFromPhoto(photoUrl: string): Promise<ExtractedItem[]> }`
  - `createPantryVisionClient(options?: { apiKey?: string; model?: string; client?: PantryVisionTransport }): PantryVisionClient`
  - `normalizeItemName(name: string): string` (lowercase/trim/collapse-spaces — used for dedupe in Task 2.9 and matching in Task 2.8)
  - `MAX_ITEMS_PER_ORDER = 40`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/server/pantry-extract.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createPantryVisionClient,
  normalizeItemName,
  MAX_ITEMS_PER_ORDER
} from "../../../lib/pantry/extract";

function transportReturning(payload: unknown) {
  return {
    responses: {
      create: vi.fn().mockResolvedValue({ output_text: JSON.stringify(payload) })
    }
  };
}

describe("pantry vision extraction", () => {
  afterEach(() => {
    delete process.env.PANTRY_EXTRACT_STUB;
    delete process.env.VERCEL_ENV;
  });

  it("parses items from the model and passes store:false + the photo url", async () => {
    const transport = transportReturning({
      items: [
        { name: "Rolled oats", portion: "1 canister" },
        { name: "Orange juice", portion: null }
      ]
    });
    const client = createPantryVisionClient({ client: transport });

    const items = await client.extractFromPhoto("https://blob.test/p1.jpg");

    expect(items).toEqual([
      { name: "Rolled oats", portion: "1 canister" },
      { name: "Orange juice", portion: null }
    ]);
    const params = transport.responses.create.mock.calls[0][0];
    expect(params.store).toBe(false);
    expect(JSON.stringify(params.input)).toContain("https://blob.test/p1.jpg");
    expect(params.text.format.type).toBe("json_schema");
  });

  it("throws on non-JSON output (caller marks the photo failed)", async () => {
    const client = createPantryVisionClient({
      client: {
        responses: { create: vi.fn().mockResolvedValue({ output_text: "nope" }) }
      }
    });
    await expect(client.extractFromPhoto("https://blob.test/x.jpg")).rejects.toThrow();
  });

  it("caps a runaway item list at MAX_ITEMS_PER_ORDER", async () => {
    const many = Array.from({ length: 60 }, (_, index) => ({
      name: `item ${index}`,
      portion: null
    }));
    const client = createPantryVisionClient({
      client: transportReturning({ items: many })
    });
    const items = await client.extractFromPhoto("https://blob.test/y.jpg");
    expect(items).toHaveLength(MAX_ITEMS_PER_ORDER);
  });

  it("stub seam returns fixture items without any transport", async () => {
    process.env.PANTRY_EXTRACT_STUB = "1";
    const client = createPantryVisionClient();
    const items = await client.extractFromPhoto("ignored");
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].name).toBe("rolled oats");
  });

  it("stub seam is refused in production", async () => {
    process.env.PANTRY_EXTRACT_STUB = "1";
    process.env.VERCEL_ENV = "production";
    const client = createPantryVisionClient();
    // Without a transport or api key the live path must throw — proving the
    // stub did NOT activate in production.
    await expect(client.extractFromPhoto("ignored")).rejects.toThrow();
  });

  it("normalizeItemName lowercases, trims, and collapses spaces", () => {
    expect(normalizeItemName("  Rolled   OATS ")).toBe("rolled oats");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/server/pantry-extract.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `lib/pantry/extract.ts`:

```ts
import OpenAI from "openai";
import { z } from "zod";

/**
 * Vision EXTRACTOR for the Pantry Review pipeline. It transcribes food items
 * from a photo into text and does nothing else — it never judges, never
 * advises, never sees the buyer's A1C. All health judgments happen later in
 * lib/revora/service.ts:checkFood() on the buyer-CONFIRMED list (design doc
 * locked decision 1). This module deliberately imports nothing from
 * lib/revora/.
 */

export const DEFAULT_VISION_MODEL = "gpt-5.4-mini";
export const MAX_ITEMS_PER_ORDER = 40;

export type ExtractedItem = { name: string; portion: string | null };

export interface PantryVisionClient {
  extractFromPhoto(photoUrl: string): Promise<ExtractedItem[]>;
}

export type PantryVisionTransport = {
  responses: {
    create(params: Record<string, unknown>): Promise<{ output_text?: string }>;
  };
};

const EXTRACT_PROMPT = [
  "You are an inventory transcriber. List the distinct food and drink items",
  "you can clearly identify in this photo of a home pantry, fridge, or meal.",
  "Rules:",
  "- Transcribe only what is visibly present. Never guess brands, never infer",
  "  items that might be nearby, never add items you are not sure about.",
  "- If you can read a label, use its product name.",
  "- Include a rough portion or package size only when it is visible",
  '  (for example "12 oz box", "half loaf"); otherwise use null.',
  "- Ignore non-food objects, people, and any text that is not a food label.",
  "- No advice, no health judgments, no commentary of any kind.",
  "If nothing is clearly identifiable, return an empty list."
].join("\n");

const extractJsonSchema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          portion: { type: ["string", "null"] }
        },
        required: ["name", "portion"],
        additionalProperties: false
      }
    }
  },
  required: ["items"],
  additionalProperties: false
} as const;

const ExtractedItemsSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().trim().min(1).max(80),
      portion: z.string().trim().min(1).max(80).nullable()
    })
  )
});

export function normalizeItemName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

const STUB_ITEMS: ExtractedItem[] = [
  { name: "rolled oats", portion: "1 canister" },
  { name: "orange juice", portion: "64 oz bottle" },
  { name: "white rice", portion: "5 lb bag" }
];

export function createPantryVisionClient(options?: {
  apiKey?: string;
  model?: string;
  client?: PantryVisionTransport;
}): PantryVisionClient {
  return {
    async extractFromPhoto(photoUrl) {
      // Test/E2E seam — never active in production (same posture as
      // reviewer-signin and AUTH_EMAIL_STUB_DIR).
      if (
        process.env.PANTRY_EXTRACT_STUB === "1" &&
        process.env.VERCEL_ENV !== "production"
      ) {
        return STUB_ITEMS;
      }

      const model =
        options?.model ?? process.env.REVORA_VISION_MODEL ?? DEFAULT_VISION_MODEL;
      const transport =
        options?.client ?? createTransport(options?.apiKey ?? process.env.OPENAI_API_KEY);

      const response = await transport.responses.create({
        model,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: EXTRACT_PROMPT },
              { type: "input_image", image_url: photoUrl, detail: "auto" }
            ]
          }
        ],
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: "pantry_extracted_items",
            schema: extractJsonSchema,
            strict: true
          }
        }
      });

      const outputText = response.output_text?.trim();
      if (!outputText) {
        throw new Error("Vision extraction returned no output_text.");
      }

      const parsed = ExtractedItemsSchema.parse(JSON.parse(outputText));
      return parsed.items.slice(0, MAX_ITEMS_PER_ORDER);
    }
  };
}

function createTransport(apiKey: string | undefined): PantryVisionTransport {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for pantry vision extraction.");
  }
  // 60s per photo (vision is slower than the text judge); the batch route's
  // own budget (Task 2.11) is the real ceiling. maxRetries 0 — the caller
  // owns retry policy per photo.
  return new OpenAI({ apiKey, timeout: 60_000, maxRetries: 0 });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/server/pantry-extract.test.ts`
Expected: PASS (6/6).

- [ ] **Step 5: Commit**

```bash
git add lib/pantry/extract.ts tests/unit/server/pantry-extract.test.ts
git commit -m "feat(pantry): vision extraction module — extractor only, per-photo, stubbed seam (lane C)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent · **Effort:** M · **Verification:** 6/6 green; `grep -r "lib/revora" lib/pantry/` returns nothing.

### Task 2.8: Lane C — `eval:pantry-extract` harness + vision-model probe

The harness is agent-buildable now; the **fixtures are human**: 8–10 of the founder's own pantry/fridge photos, each with an exhaustive hand-labeled item list (Appendix A H6). Gate: **≥70% recall, zero hallucinations** (locked decision 11). Mock-live switch mirrors `eval:revora:live` (`REVORA_LIVE_EVAL=1`). Also ships the build-time probe for `gpt-5.4-mini` image-input support with the documented `REVORA_VISION_MODEL` fallback.

**Files:**
- Create: `tests/evals/pantry-extract-eval.test.ts`, `tests/fixtures/pantry-photos/labels.example.json`, `scripts/verify-vision-model.mjs`
- Modify: `package.json` (script), `.env.example` (`REVORA_VISION_MODEL=` name)
- Human later adds: `tests/fixtures/pantry-photos/*.jpg` + `labels.json`

**Interfaces:**
- Consumes: `createPantryVisionClient`, `normalizeItemName` (2.7).
- Produces: `npm run eval:pantry-extract` — SETUP_BLOCKED-style skip when fixtures or `REVORA_LIVE_EVAL=1`+key are absent; prints per-photo recall + hallucination table for the Phase 4 verdict doc.

- [ ] **Step 1: Write the eval (it self-skips until fixtures exist — that IS its failing state)**

Create `tests/fixtures/pantry-photos/labels.example.json`:

```json
[
  {
    "file": "pantry-01.jpg",
    "items": ["rolled oats", "peanut butter", "white rice", "olive oil"]
  }
]
```

Create `tests/evals/pantry-extract-eval.test.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  createPantryVisionClient,
  normalizeItemName
} from "../../lib/pantry/extract";

/**
 * Live extraction-quality gate (design doc locked decision 11):
 *   recall >= 0.70 across all labeled photos, hallucinations == 0.
 * Fixtures are the FOUNDER'S OWN photos with exhaustive labels
 * (labels.json lists every clearly visible food item per photo — an
 * extracted item matching no label counts as a hallucination).
 * Mirrors eval:revora:live gating: runs only with REVORA_LIVE_EVAL=1.
 */

const FIXTURES = path.join(process.cwd(), "tests/fixtures/pantry-photos");
const LABELS = path.join(FIXTURES, "labels.json");
const LIVE = process.env.REVORA_LIVE_EVAL === "1" && !!process.env.OPENAI_API_KEY;
const READY = LIVE && fs.existsSync(LABELS);

const RECALL_FLOOR = 0.7;

function matches(label: string, extracted: string): boolean {
  const a = normalizeItemName(label);
  const b = normalizeItemName(extracted);
  return a.includes(b) || b.includes(a);
}

describe.skipIf(!READY)("eval:pantry-extract (live)", () => {
  it("meets the recall floor with zero hallucinations", { timeout: 600_000 }, async () => {
    const cases = JSON.parse(fs.readFileSync(LABELS, "utf8")) as {
      file: string;
      items: string[];
    }[];
    expect(cases.length).toBeGreaterThanOrEqual(8);

    const client = createPantryVisionClient();
    let labelsTotal = 0;
    let labelsFound = 0;
    const hallucinations: string[] = [];

    for (const testCase of cases) {
      const image = fs.readFileSync(path.join(FIXTURES, testCase.file));
      const dataUrl = `data:image/jpeg;base64,${image.toString("base64")}`;
      const extracted = await client.extractFromPhoto(dataUrl);

      const found = testCase.items.filter((label) =>
        extracted.some((item) => matches(label, item.name))
      );
      const extra = extracted.filter(
        (item) => !testCase.items.some((label) => matches(label, item.name))
      );

      labelsTotal += testCase.items.length;
      labelsFound += found.length;
      hallucinations.push(...extra.map((item) => `${testCase.file}: ${item.name}`));

      console.log(
        `${testCase.file}: recall ${found.length}/${testCase.items.length}, ` +
          `hallucinations ${extra.length}`
      );
    }

    const recall = labelsFound / labelsTotal;
    console.log(`TOTAL recall=${recall.toFixed(3)} hallucinations=${hallucinations.length}`);
    console.log(hallucinations.join("\n"));

    expect(recall).toBeGreaterThanOrEqual(RECALL_FLOOR);
    expect(hallucinations).toEqual([]);
  });
});

describe.skipIf(READY)("eval:pantry-extract (setup)", () => {
  it("explains what is missing", () => {
    console.log(
      "SETUP_BLOCKED: eval:pantry-extract needs (1) REVORA_LIVE_EVAL=1, " +
        "(2) OPENAI_API_KEY, (3) 8-10 founder photos in tests/fixtures/pantry-photos/ " +
        "with an exhaustive labels.json (see labels.example.json). Skipping."
    );
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Add the script and run the skip path**

In `package.json` scripts add:

```json
"eval:pantry-extract": "vitest run tests/evals/pantry-extract-eval.test.ts"
```

Run: `npm run eval:pantry-extract`
Expected: PASS with the SETUP_BLOCKED message (fixtures absent) — the live path is exercised in Phase 4.

- [ ] **Step 3: Write the vision-model probe**

Create `scripts/verify-vision-model.mjs`:

```js
#!/usr/bin/env node
// Build-time check that the configured vision model accepts image input.
// Usage: OPENAI_API_KEY=... node scripts/verify-vision-model.mjs
// On failure: set REVORA_VISION_MODEL to a vision-capable sibling — it is
// used ONLY for extraction; the judge model is untouched (locked decision 1).
import OpenAI from "openai";

const model = process.env.REVORA_VISION_MODEL ?? "gpt-5.4-mini";
if (!process.env.OPENAI_API_KEY) {
  console.log("SETUP_BLOCKED: export OPENAI_API_KEY and rerun.");
  process.exit(0);
}

// 1x1 white PNG.
const pixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==";

const client = new OpenAI({ timeout: 30_000, maxRetries: 0 });
try {
  await client.responses.create({
    model,
    store: false,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: "Reply with the single word: ok" },
          { type: "input_image", image_url: pixel, detail: "low" }
        ]
      }
    ]
  });
  console.log(`OK: ${model} accepts image input.`);
} catch (error) {
  console.error(`FAIL: ${model} rejected image input: ${error.message}`);
  console.error(
    "Set REVORA_VISION_MODEL to a vision-capable sibling (extraction only) and rerun."
  );
  process.exit(1);
}
```

Add to `.env.example` under model tuning:

```
# Vision model for pantry photo EXTRACTION only (never judging). Default: gpt-5.4-mini.
REVORA_VISION_MODEL=
```

- [ ] **Step 4: Typecheck + commit**

Run: `npm run typecheck`
Expected: clean.

```bash
git add tests/evals/pantry-extract-eval.test.ts tests/fixtures/pantry-photos/labels.example.json scripts/verify-vision-model.mjs package.json .env.example
git commit -m "test(pantry): eval:pantry-extract harness (recall>=70%, zero hallucinations) + vision-model probe (lane C)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent (harness) + human (photos + labels + live key, Appendix A H6) · **Effort:** M · **Verification:** skip path green now; live numbers recorded in Phase 4.

### Task 2.9: Lane B — intake page, photo upload UI, submit + extraction API

The status hub: `/pantry/intake` renders whichever state the buyer's order is in (form → extract wait → confirm → processing → ready-redirect → needs-manual), per the design doc's states table. Single-page, no stepper. This task delivers the form, submit API (which runs extraction synchronously inside its 300s budget), and every non-confirm state; Task 2.10 adds the editable confirm list.

**Files:**
- Create: `app/pantry/intake/page.tsx`, `components/pantry-intake-flow.tsx`, `lib/client/downscale.ts`, `lib/server/pantry/band.ts`, `app/api/pantry/submit/route.ts`
- Test: `tests/unit/server/pantry-submit.test.ts`, `tests/unit/server/pantry-band.test.ts`, `tests/unit/client/downscale.test.ts`

**Interfaces:**
- Consumes: `upload` from `@vercel/blob/client` → `POST /api/pantry/upload` (2.5); `createPantryVisionClient`, `normalizeItemName`, `MAX_ITEMS_PER_ORDER` (2.7); `encryptField`/`decryptField`; `sendEmail` (2.1); `evaluateRateLimit` + `@upstash/ratelimit` (existing).
- Produces:
  - `bandRepresentativeA1c(band): number` — `{ prediabetes_57_59: 5.8, prediabetes_60_62: 6.1, prediabetes_63_64: 6.4 }` (each value routes to the band's correct `conservativeLevel` in `routeA1C`; consumed again by the processor, Task 2.11).
  - `POST /api/pantry/submit` body `{ orderId, photoUrls[1..10], a1cBand, notes?, consent: true }` → `{ status: "awaiting_confirm", items: [{id,name,portion}], failedPhotos: number }` or `{ status: "needs_manual" }`.
  - `fitWithin(width, height, maxDim): { width, height }` pure resize math.
  - The `PantryIntakeFlow` client component with a `confirm` state slot Task 2.10 fills.

- [ ] **Step 1: Write the failing band + downscale tests**

Create `tests/unit/server/pantry-band.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { routeA1C } from "../../../lib/revora/a1c";
import { bandRepresentativeA1c } from "../../../lib/server/pantry/band";

describe("bandRepresentativeA1c", () => {
  it.each([
    ["prediabetes_57_59", "standard"],
    ["prediabetes_60_62", "elevated"],
    ["prediabetes_63_64", "high"]
  ] as const)("%s routes to conservativeLevel=%s", (band, level) => {
    const route = routeA1C(bandRepresentativeA1c(band));
    expect(route.kind).toBe("in_scope");
    if (route.kind === "in_scope") {
      expect(route.band).toBe(band);
      expect(route.conservativeLevel).toBe(level);
    }
  });
});
```

Create `tests/unit/client/downscale.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { fitWithin } from "../../../lib/client/downscale";

describe("fitWithin", () => {
  it("never upscales", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
  it("scales the long edge to maxDim preserving aspect", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });
});
```

Run: `npx vitest run tests/unit/server/pantry-band.test.ts tests/unit/client/downscale.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 2: Implement the two small modules**

Create `lib/server/pantry/band.ts`:

```ts
import type { schema } from "../db";

type PantryBand = NonNullable<
  (typeof schema.pantryOrders.$inferSelect)["a1cBand"]
>;

/**
 * Buyers give a BAND at intake (no profile; locked decision 5), but
 * checkFood() takes a number. Each representative value lands squarely
 * inside its band's window in routeA1C, so the judge applies the band's own
 * conservative level — never a neighboring band's.
 */
const BAND_A1C: Record<PantryBand, number> = {
  prediabetes_57_59: 5.8,
  prediabetes_60_62: 6.1,
  prediabetes_63_64: 6.4
};

export function bandRepresentativeA1c(band: PantryBand): number {
  return BAND_A1C[band];
}
```

Create `lib/client/downscale.ts`:

```ts
/**
 * Client-side photo prep: decode (browser applies EXIF orientation; Safari
 * decodes HEIC natively), downscale to ~1600px, re-encode as JPEG. This is
 * the whole HEIC/EXIF strategy — the server only ever sees oriented JPEGs
 * ≤5MB. A file the browser cannot decode (e.g. HEIC on desktop Chrome)
 * rejects, and the picker shows a per-photo field-error with retry.
 */

export function fitWithin(
  width: number,
  height: number,
  maxDim: number
): { width: number; height: number } {
  const scale = Math.min(1, maxDim / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export async function downscaleToJpeg(file: File, maxDim = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image"
  });
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxDim);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable.");
  context.drawImage(bitmap, 0, 0, width, height);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encode failed."))),
      "image/jpeg",
      0.85
    );
  });
}
```

Run: `npx vitest run tests/unit/server/pantry-band.test.ts tests/unit/client/downscale.test.ts`
Expected: PASS.

- [ ] **Step 3: Write the failing submit-route tests**

Create `tests/unit/server/pantry-submit.test.ts`:

```ts
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createPantrySubmitHandler } from "../../../app/api/pantry/submit/route";
import { decryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const NOW = new Date("2026-07-06T09:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 8).toString("base64");
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "submit@test.dev" })
    .returning();
  userId = user.id;
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pantryOrders);
});

async function makeClaimedOrder() {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "submit@test.dev",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: `hash_${Math.random().toString(36).slice(2)}`,
      userId,
      status: "claimed"
    })
    .returning();
  return order;
}

const visionOk = {
  extractFromPhoto: vi.fn().mockResolvedValue([
    { name: "rolled oats", portion: "1 canister" },
    { name: "orange juice", portion: null }
  ])
};

function makeDeps(overrides: Record<string, unknown> = {}) {
  return {
    db: () => testDb.db,
    getSession: async () => ({ userId, email: "submit@test.dev" }),
    vision: () => visionOk,
    email: { send: vi.fn().mockResolvedValue({ ok: true }) },
    rateLimit: async () => ({ ok: true }) as const,
    now: () => NOW,
    ...overrides
  };
}

function submitRequest(body: unknown) {
  return new Request("http://t/api/pantry/submit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

function validBody(orderId: string, overrides: Record<string, unknown> = {}) {
  return {
    orderId,
    photoUrls: ["https://blob.test/a.jpg", "https://blob.test/b.jpg"],
    a1cBand: "prediabetes_60_62",
    notes: "mostly breakfast stuff",
    consent: true,
    ...overrides
  };
}

describe("POST /api/pantry/submit", () => {
  it("stores photos + encrypted intake fields, extracts drafts, moves to awaiting_confirm", async () => {
    const order = await makeClaimedOrder();
    const POST = createPantrySubmitHandler(makeDeps());

    const response = await POST(submitRequest(validBody(order.id)));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("awaiting_confirm");
    // Two photos, two calls, deduped item names across photos.
    expect(body.items.map((item: { name: string }) => item.name)).toEqual([
      "rolled oats",
      "orange juice"
    ]);

    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.status).toBe("awaiting_confirm");
    expect(updated.a1cBand).toBe("prediabetes_60_62");
    expect(updated.consentedAt?.toISOString()).toBe(NOW.toISOString());
    expect(updated.a1cCiphertext).not.toBeNull();
    expect(decryptField(updated.a1cCiphertext!)).toBe("6.1");
    expect(updated.notesCiphertext).not.toContain("breakfast");
    expect(decryptField(updated.notesCiphertext!)).toBe("mostly breakfast stuff");

    const photos = await testDb.db
      .select()
      .from(schema.pantryPhotos)
      .where(eq(schema.pantryPhotos.orderId, order.id));
    expect(photos).toHaveLength(2);
    expect(photos.every((photo) => photo.status === "extracted")).toBe(true);

    const items = await testDb.db
      .select()
      .from(schema.pantryItems)
      .where(eq(schema.pantryItems.orderId, order.id));
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.status === "draft")).toBe(true);
    expect(items.every((item) => item.source === "vision")).toBe(true);
    expect(decryptField(items[0].nameCiphertext)).toBe("rolled oats");
  });

  it("rejects an 11th photo server-side", async () => {
    const order = await makeClaimedOrder();
    const POST = createPantrySubmitHandler(makeDeps());
    const response = await POST(
      submitRequest(
        validBody(order.id, {
          photoUrls: Array.from({ length: 11 }, (_, i) => `https://blob.test/${i}.jpg`)
        })
      )
    );
    expect(response.status).toBe(400);
  });

  it("rejects a submit without consent", async () => {
    const order = await makeClaimedOrder();
    const POST = createPantrySubmitHandler(makeDeps());
    const response = await POST(
      submitRequest(validBody(order.id, { consent: false }))
    );
    expect(response.status).toBe(400);
  });

  it("404s another user's order (wrong-user access)", async () => {
    const order = await makeClaimedOrder();
    const POST = createPantrySubmitHandler(
      makeDeps({
        getSession: async () => ({ userId: crypto.randomUUID(), email: "x@y.z" })
      })
    );
    const response = await POST(submitRequest(validBody(order.id)));
    expect(response.status).toBe(404);
  });

  it("429s when the pantry rate limit trips", async () => {
    const order = await makeClaimedOrder();
    const POST = createPantrySubmitHandler(
      makeDeps({
        rateLimit: async () => ({ ok: false, retryAfterSeconds: 60 }) as const
      })
    );
    const response = await POST(submitRequest(validBody(order.id)));
    expect(response.status).toBe(429);
  });

  it("partial extraction: a failed photo is marked, the rest still draft items", async () => {
    const order = await makeClaimedOrder();
    const flaky = {
      extractFromPhoto: vi
        .fn()
        .mockResolvedValueOnce([{ name: "rolled oats", portion: null }])
        .mockRejectedValueOnce(new Error("vision down"))
    };
    const POST = createPantrySubmitHandler(makeDeps({ vision: () => flaky }));

    const response = await POST(submitRequest(validBody(order.id)));
    const body = await response.json();

    expect(body.status).toBe("awaiting_confirm");
    expect(body.failedPhotos).toBe(1);
    const photos = await testDb.db
      .select()
      .from(schema.pantryPhotos)
      .where(eq(schema.pantryPhotos.orderId, order.id));
    expect(photos.map((photo) => photo.status).sort()).toEqual([
      "extracted",
      "failed"
    ]);
  });

  it("total extraction failure: needs_manual + founder alerted, buyer sees the service state", async () => {
    const order = await makeClaimedOrder();
    const dead = {
      extractFromPhoto: vi.fn().mockRejectedValue(new Error("vision down"))
    };
    const email = { send: vi.fn().mockResolvedValue({ ok: true }) };
    const POST = createPantrySubmitHandler(makeDeps({ vision: () => dead, email }));

    const response = await POST(submitRequest(validBody(order.id)));
    const body = await response.json();

    expect(body.status).toBe("needs_manual");
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.status).toBe("needs_manual");
    expect(email.send).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 4: Run to verify it fails, then implement the submit route**

Run: `npx vitest run tests/unit/server/pantry-submit.test.ts` → FAIL (module not found).

Create `app/api/pantry/submit/route.ts`:

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createPantryVisionClient,
  normalizeItemName,
  MAX_ITEMS_PER_ORDER,
  type PantryVisionClient
} from "../../../../lib/pantry/extract";
import { captureServerError } from "../../../../lib/revora/sentry-capture";
import { encryptField } from "../../../../lib/server/crypto";
import { getDb, schema, type Db } from "../../../../lib/server/db";
import { sendEmail, type SendEmailResult } from "../../../../lib/server/email";
import { bandRepresentativeA1c } from "../../../../lib/server/pantry/band";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

export const runtime = "nodejs";
// Extraction runs inside this request (≤10 photos × ≤60s worst case);
// OPS: requires the Vercel plan's 300s function ceiling (Pro default).
export const maxDuration = 300;

const SubmitSchema = z
  .object({
    orderId: z.string().uuid(),
    photoUrls: z.array(z.string().url().max(2048)).min(1).max(10),
    a1cBand: z.enum([
      "prediabetes_57_59",
      "prediabetes_60_62",
      "prediabetes_63_64"
    ]),
    notes: z.string().trim().max(500).optional(),
    consent: z.literal(true)
  })
  .strict();

type PantryRateLimit = (
  userId: string
) => Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }>;

type Deps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  vision?: () => PantryVisionClient;
  email?: { send: (input: { to: string; subject: string; text: string }) => Promise<SendEmailResult> };
  rateLimit?: PantryRateLimit;
  now?: () => Date;
};

// Extraction endpoint limiter (locked decision 8): revora:pantry prefix,
// keyed by user (buyers are always signed in here). Fail-open on store
// errors, same posture as lib/revora/rate-limit.ts.
let limiter: Ratelimit | null | undefined;
async function defaultRateLimit(userId: string) {
  if (limiter === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    limiter =
      url && token
        ? new Ratelimit({
            redis: new Redis({ url, token }),
            limiter: Ratelimit.slidingWindow(5, "1 h"),
            prefix: "revora:pantry",
            analytics: false
          })
        : null;
  }
  if (!limiter) return { ok: true } as const;
  try {
    const result = await limiter.limit(userId);
    return result.success
      ? ({ ok: true } as const)
      : ({
          ok: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((result.reset - Date.now()) / 1000)
          )
        } as const);
  } catch {
    return { ok: true } as const;
  }
}

export function createPantrySubmitHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const vision = deps.vision ?? (() => createPantryVisionClient());
  const email = deps.email ?? { send: sendEmail };
  const rateLimit = deps.rateLimit ?? defaultRateLimit;
  const now = deps.now ?? (() => new Date());

  return async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    let parsed;
    try {
      parsed = SubmitSchema.safeParse(await request.json());
    } catch {
      parsed = SubmitSchema.safeParse(null);
    }
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const input = parsed.data;

    const limit = await rateLimit(session.userId);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Please try again in a little while." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) }
        }
      );
    }

    const [order] = await db()
      .select()
      .from(schema.pantryOrders)
      .where(
        and(
          eq(schema.pantryOrders.id, input.orderId),
          eq(schema.pantryOrders.userId, session.userId),
          inArray(schema.pantryOrders.status, ["claimed", "submitted"])
        )
      );
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Record intake: photos + encrypted health-adjacent fields + consent.
    const photoRows = await db()
      .insert(schema.pantryPhotos)
      .values(
        input.photoUrls.map((blobUrl) => ({ orderId: order.id, blobUrl }))
      )
      .returning();

    await db()
      .update(schema.pantryOrders)
      .set({
        a1cBand: input.a1cBand,
        a1cCiphertext: encryptField(
          bandRepresentativeA1c(input.a1cBand).toFixed(1)
        ),
        notesCiphertext: input.notes ? encryptField(input.notes) : null,
        consentedAt: now(),
        status: "extracting",
        updatedAt: now()
      })
      .where(eq(schema.pantryOrders.id, order.id));

    // Extract per photo — failure isolation feeds the designed partial state.
    const client = vision();
    const seen = new Set<string>();
    const drafts: { name: string; portion: string | null }[] = [];
    let failedPhotos = 0;

    for (const photo of photoRows) {
      try {
        const extracted = await client.extractFromPhoto(photo.blobUrl);
        for (const item of extracted) {
          const key = normalizeItemName(item.name);
          if (!seen.has(key) && drafts.length < MAX_ITEMS_PER_ORDER) {
            seen.add(key);
            drafts.push(item);
          }
        }
        await db()
          .update(schema.pantryPhotos)
          .set({ status: "extracted" })
          .where(eq(schema.pantryPhotos.id, photo.id));
      } catch (error) {
        failedPhotos += 1;
        await captureServerError(error, "pantry-extract");
        await db()
          .update(schema.pantryPhotos)
          .set({ status: "failed" })
          .where(eq(schema.pantryPhotos.id, photo.id));
      }
    }

    if (drafts.length === 0) {
      // Manual fallback is a designed service state, not an error apology.
      await db()
        .update(schema.pantryOrders)
        .set({ status: "needs_manual", updatedAt: now() })
        .where(eq(schema.pantryOrders.id, order.id));
      await email.send({
        to: process.env.SUPPORT_EMAIL ?? "support@revora.app",
        subject: `Pantry order needs manual review: ${order.id}`,
        text: `Extraction produced zero items for order ${order.id} (${failedPhotos} photo(s) failed). Handle via /admin/pantry.`
      });
      return NextResponse.json({ status: "needs_manual" });
    }

    const inserted = await db()
      .insert(schema.pantryItems)
      .values(
        drafts.map((draft, position) => ({
          orderId: order.id,
          position,
          nameCiphertext: encryptField(draft.name),
          portionCiphertext: draft.portion ? encryptField(draft.portion) : null,
          source: "vision" as const,
          status: "draft" as const,
          updatedAt: now()
        }))
      )
      .returning();

    await db()
      .update(schema.pantryOrders)
      .set({ status: "awaiting_confirm", updatedAt: now() })
      .where(eq(schema.pantryOrders.id, order.id));

    return NextResponse.json({
      status: "awaiting_confirm",
      failedPhotos,
      items: inserted.map((item, index) => ({
        id: item.id,
        name: drafts[index].name,
        portion: drafts[index].portion
      }))
    });
  };
}

export const POST = createPantrySubmitHandler();
```

Run: `npx vitest run tests/unit/server/pantry-submit.test.ts`
Expected: PASS (7/7).

- [ ] **Step 5: Build the page + client flow**

Create `app/pantry/intake/page.tsx`:

```tsx
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";

import { PantryIntakeFlow } from "../../../components/pantry-intake-flow";
import { decryptField } from "../../../lib/server/crypto";
import { getDb, schema } from "../../../lib/server/db";
import { getSessionInfo } from "../../../lib/server/session";

export const metadata = {
  title: "Your Pantry Review — Revora",
  robots: { index: false, follow: false }
};

const OPEN_STATUSES = [
  "claimed",
  "submitted",
  "extracting",
  "awaiting_confirm",
  "processing",
  "needs_manual",
  "ready"
] as const;

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@revora.app";

export default async function PantryIntakePage() {
  const session = await getSessionInfo();
  if (!session) {
    redirect(`/signin?callbackUrl=${encodeURIComponent("/pantry/intake")}`);
  }

  const db = getDb();
  const [order] = await db
    .select()
    .from(schema.pantryOrders)
    .where(
      and(
        eq(schema.pantryOrders.userId, session.userId),
        inArray(schema.pantryOrders.status, [...OPEN_STATUSES])
      )
    )
    .orderBy(desc(schema.pantryOrders.createdAt))
    .limit(1);

  if (!order) {
    return (
      <main className="page-shell">
        <div className="page-frame">
          <section className="surface-card hero-card">
            <p className="hero-eyebrow">Pantry Review</p>
            <h1 className="page-title">No review waiting here yet</h1>
            <p className="page-copy">
              If you just paid, use the setup link from your email — it
              connects the purchase to this account. Paid with a different
              email? Write to {SUPPORT_EMAIL} and we&apos;ll connect it for
              you.
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (order.status === "ready") {
    redirect(`/report/${order.id}`);
  }

  const items =
    order.status === "awaiting_confirm"
      ? (
          await db
            .select()
            .from(schema.pantryItems)
            .where(eq(schema.pantryItems.orderId, order.id))
            .orderBy(asc(schema.pantryItems.position))
        ).map((item) => ({
          id: item.id,
          name: decryptField(item.nameCiphertext),
          portion: item.portionCiphertext
            ? decryptField(item.portionCiphertext)
            : ""
        }))
      : [];

  return (
    <PantryIntakeFlow
      orderId={order.id}
      initialStatus={order.status}
      initialItems={items}
      supportEmail={SUPPORT_EMAIL}
    />
  );
}
```

Create `components/pantry-intake-flow.tsx` — client component implementing the states table (assembled entirely from `DESIGN.md` vocabulary: `page-shell`/`page-frame`/`surface-card`/`form-card`/`field-stack`/`field-label`/`text-input`/`field-hint`/`field-error`/`primary-button`/`request-status`). Structure (complete file; the `confirm` branch renders the read-only count now and is replaced by Task 2.10's editable list):

```tsx
"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

import { downscaleToJpeg } from "../lib/client/downscale";

type Item = { id: string; name: string; portion: string | null };
type Phase =
  | "form"
  | "uploading"
  | "extracting"
  | "confirm"
  | "processing"
  | "needs_manual";

type PhotoSlot = {
  file: File;
  previewUrl: string;
  blobUrl: string | null;
  error: string | null;
};

const MAX_PHOTOS = 10;
const MAX_BYTES = 5 * 1024 * 1024;

const BAND_OPTIONS = [
  { value: "prediabetes_57_59", label: "5.7% – 5.9%" },
  { value: "prediabetes_60_62", label: "6.0% – 6.2%" },
  { value: "prediabetes_63_64", label: "6.3% – 6.4%" }
] as const;

const START_PHASE: Record<string, Phase> = {
  claimed: "form",
  submitted: "form",
  extracting: "extracting",
  awaiting_confirm: "confirm",
  processing: "processing",
  needs_manual: "needs_manual"
};

export function PantryIntakeFlow({
  orderId,
  initialStatus,
  initialItems,
  supportEmail
}: {
  orderId: string;
  initialStatus: string;
  initialItems: Item[];
  supportEmail: string;
}) {
  const [phase, setPhase] = useState<Phase>(START_PHASE[initialStatus] ?? "form");
  const [photos, setPhotos] = useState<PhotoSlot[]>([]);
  const [band, setBand] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [consented, setConsented] = useState(false);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [failedPhotos, setFailedPhotos] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  async function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list).slice(0, MAX_PHOTOS - photos.length);
    for (const file of incoming) {
      const slot: PhotoSlot = {
        file,
        previewUrl: URL.createObjectURL(file),
        blobUrl: null,
        error: null
      };
      setPhotos((current) => [...current, slot]);
      try {
        const jpeg = await downscaleToJpeg(file);
        if (jpeg.size > MAX_BYTES) {
          throw new Error("That photo is too large even after resizing.");
        }
        const result = await upload(`pantry/${orderId}/photo.jpg`, jpeg, {
          access: "public",
          handleUploadUrl: "/api/pantry/upload",
          clientPayload: orderId,
          contentType: "image/jpeg"
        });
        setPhotos((current) =>
          current.map((entry) =>
            entry === slot ? { ...entry, blobUrl: result.url } : entry
          )
        );
      } catch {
        setPhotos((current) =>
          current.map((entry) =>
            entry === slot
              ? {
                  ...entry,
                  error:
                    "We couldn't read this photo — try a different one, or screenshot it first."
                }
              : entry
          )
        );
      }
    }
  }

  async function submit() {
    setFormError(null);
    const blobUrls = photos
      .map((photo) => photo.blobUrl)
      .filter((url): url is string => Boolean(url));
    if (blobUrls.length === 0) {
      setFormError("Add at least one photo of your pantry or a typical meal.");
      return;
    }
    if (!band) {
      setFormError("Pick the A1C range from your last lab result.");
      return;
    }
    if (!consented) {
      setFormError("The consent box above the button is needed to continue.");
      return;
    }
    setPhase("extracting");
    const response = await fetch("/api/pantry/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderId,
        photoUrls: blobUrls,
        a1cBand: band,
        notes: notes.trim() || undefined,
        consent: true
      })
    });
    if (!response.ok) {
      setPhase("form");
      setFormError(
        response.status === 429
          ? "A lot of photos are being read right now — try again in a few minutes."
          : "Something went wrong sending your photos. Nothing was lost — try again."
      );
      return;
    }
    const body = (await response.json()) as {
      status: string;
      items?: Item[];
      failedPhotos?: number;
    };
    if (body.status === "needs_manual") {
      setPhase("needs_manual");
      return;
    }
    setItems(body.items ?? []);
    setFailedPhotos(body.failedPhotos ?? 0);
    setPhase("confirm");
  }

  return (
    <main className="page-shell">
      <div className="page-frame">
        {phase === "form" || phase === "uploading" ? (
          <section className="surface-card form-card">
            <p className="hero-eyebrow">Pantry Review</p>
            <h1 className="page-title">Your Pantry Review</h1>
            <p className="page-copy">
              Add photos of your pantry, fridge, or typical meals — we read
              the items, you check the list, and your report arrives by
              email.
            </p>
            <div className="field-stack">
              <label htmlFor="photos" className="field-label">
                Photos ({photos.filter((photo) => photo.blobUrl).length} of {MAX_PHOTOS})
              </label>
              <input
                id="photos"
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="text-input"
                onChange={(event) => void addFiles(event.target.files)}
                disabled={photos.length >= MAX_PHOTOS}
              />
              <p className="field-hint">
                Real kitchens only — mess is normal, we only look at the food.
              </p>
              <ul className="pantry-thumb-row">
                {photos.map((photo, index) => (
                  <li key={index}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.previewUrl} alt={`Photo ${index + 1}`} width={64} height={64} />
                    {photo.error ? (
                      <p className="field-error">{photo.error}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
            <div className="field-stack">
              <label htmlFor="band" className="field-label">
                Your A1C range (from your last lab result)
              </label>
              <select
                id="band"
                className="text-input"
                value={band}
                onChange={(event) => setBand(event.target.value)}
              >
                <option value="">Choose a range</option>
                {BAND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-stack">
              <label htmlFor="notes" className="field-label">
                Anything we should know? (optional)
              </label>
              <textarea
                id="notes"
                className="text-input"
                maxLength={500}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
            <div className="field-stack">
              <label className="field-label pantry-consent">
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={(event) => setConsented(event.target.checked)}
                />{" "}
                I consent to Revora storing my A1C range, my food details, and
                my pantry photos to prepare my Pantry Review. Photos are
                deleted when the report is delivered.{" "}
                <a href="/privacy">How Revora handles health data</a>.
              </label>
            </div>
            {formError ? <p className="field-error">{formError}</p> : null}
            <button type="button" className="primary-button" onClick={() => void submit()}>
              Send photos for review
            </button>
          </section>
        ) : null}

        {phase === "extracting" ? (
          <section className="surface-card">
            <p className="request-status" aria-live="polite">
              Reading your photos… this usually takes under a minute. Keep
              this page open.
            </p>
          </section>
        ) : null}

        {phase === "confirm" ? (
          <section className="surface-card form-card">
            <p className="hero-eyebrow">Check the list</p>
            <h1 className="page-title">Here&apos;s what we saw</h1>
            {failedPhotos > 0 ? (
              <p className="field-hint" aria-live="polite">
                {failedPhotos} photo{failedPhotos > 1 ? "s" : ""} couldn&apos;t
                be read — everything below came from the rest.
              </p>
            ) : null}
            {/* Task 2.10 replaces this block with the editable confirm list. */}
            <p className="page-copy">{items.length} items found.</p>
          </section>
        ) : null}

        {phase === "processing" ? (
          <section className="surface-card">
            <p className="request-status" aria-live="polite">
              Your items are being reviewed. You&apos;ll get an email when the
              report is ready — it&apos;s safe to close this page.
            </p>
          </section>
        ) : null}

        {phase === "needs_manual" ? (
          <section className="surface-card">
            <p className="hero-eyebrow">Pantry Review</p>
            <h1 className="page-title">We&apos;ll take it from here</h1>
            <p className="page-copy">
              We couldn&apos;t read these photos automatically, so a person
              will review them by hand. Your report will arrive by email
              within 24 hours. Questions? {supportEmail}
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
```

Add the two tiny CSS classes to `app/globals.css` (thumbnail row + consent label — tokens/radius from `DESIGN.md`, no new colors/shadows):

```css
.pantry-thumb-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
}
.pantry-thumb-row img {
  border-radius: 14px;
  object-fit: cover;
}
.pantry-consent {
  font-weight: 400;
  line-height: 1.5;
}
```

- [ ] **Step 6: Full check + commit**

Run: `npm run typecheck && npx vitest run tests/unit/server/pantry-submit.test.ts tests/unit/server/pantry-band.test.ts tests/unit/client/downscale.test.ts`
Expected: all green.

```bash
git add app/pantry/intake/page.tsx components/pantry-intake-flow.tsx lib/client/downscale.ts lib/server/pantry/band.ts app/api/pantry/submit/route.ts app/globals.css tests/unit/server/pantry-submit.test.ts tests/unit/server/pantry-band.test.ts tests/unit/client/downscale.test.ts
git commit -m "feat(pantry): intake flow — photos, A1C band, Art. 9 consent, synchronous extraction (lanes B+C)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent · **Effort:** L · **Verification:** submit suite 7/7; band representative values proven against `routeA1C`; consent copy carries the COUNSEL-DRAFT posture (Appendix A H10 tracks counsel approval).

### Task 2.10: Lane B — confirm screen (editable list) + confirm API

The buyer's edit IS the safety boundary: **what they confirm is exactly what the judge receives** (locked decision 1). Editable rows (name, portion), delete, add; "Review N items" button; ≤40 enforced both sides; double-confirm guarded by a conditional status transition.

**Files:**
- Create: `app/api/pantry/confirm/route.ts`, `components/pantry-confirm-list.tsx`
- Modify: `components/pantry-intake-flow.tsx` (replace the Task 2.9 placeholder block)
- Test: `tests/unit/server/pantry-confirm.test.ts`

**Interfaces:**
- Consumes: order in `awaiting_confirm`, draft items from 2.9.
- Produces: `POST /api/pantry/confirm` body `{ orderId, items: [{ name: string(1..160), portion?: string(..80) | null }] (1..40) }` → replaces all items with `source:"buyer"`,`status:"confirmed"` rows and moves the order to `processing` → returns `{ ok: true }`; the client then fires `POST /api/pantry/process` (Task 2.11) and shows the processing state. Item text is capped at 160 chars because that is `checkFood()`'s `FOOD_MAX_LENGTH`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/server/pantry-confirm.test.ts`:

```ts
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createPantryConfirmHandler } from "../../../app/api/pantry/confirm/route";
import { decryptField, encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const NOW = new Date("2026-07-06T10:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 9).toString("base64");
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "confirm@test.dev" })
    .returning();
  userId = user.id;
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pantryOrders);
});

async function makeAwaitingOrder() {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "confirm@test.dev",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: `hash_${Math.random().toString(36).slice(2)}`,
      userId,
      status: "awaiting_confirm"
    })
    .returning();
  await testDb.db.insert(schema.pantryItems).values({
    orderId: order.id,
    position: 0,
    nameCiphertext: encryptField("draft item"),
    source: "vision",
    status: "draft"
  });
  return order;
}

const deps = (uid = userId) => ({
  db: () => testDb.db,
  getSession: async () => ({ userId: uid, email: "confirm@test.dev" }),
  now: () => NOW
});

function confirmRequest(body: unknown) {
  return new Request("http://t/api/pantry/confirm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("POST /api/pantry/confirm", () => {
  it("replaces drafts with the buyer's confirmed list and moves to processing", async () => {
    const order = await makeAwaitingOrder();
    const POST = createPantryConfirmHandler(deps());

    const response = await POST(
      confirmRequest({
        orderId: order.id,
        items: [
          { name: "steel cut oats", portion: "1 canister" },
          { name: "white bread", portion: null }
        ]
      })
    );

    expect(response.status).toBe(200);
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.status).toBe("processing");

    const items = await testDb.db
      .select()
      .from(schema.pantryItems)
      .where(eq(schema.pantryItems.orderId, order.id));
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.source === "buyer")).toBe(true);
    expect(items.every((item) => item.status === "confirmed")).toBe(true);
    expect(decryptField(items[0].nameCiphertext)).toBe("steel cut oats");
  });

  it("rejects a 41st item", async () => {
    const order = await makeAwaitingOrder();
    const POST = createPantryConfirmHandler(deps());
    const response = await POST(
      confirmRequest({
        orderId: order.id,
        items: Array.from({ length: 41 }, (_, index) => ({
          name: `item ${index}`,
          portion: null
        }))
      })
    );
    expect(response.status).toBe(400);
  });

  it("rejects an empty list", async () => {
    const order = await makeAwaitingOrder();
    const POST = createPantryConfirmHandler(deps());
    const response = await POST(confirmRequest({ orderId: order.id, items: [] }));
    expect(response.status).toBe(400);
  });

  it("404s another user's order", async () => {
    const order = await makeAwaitingOrder();
    const POST = createPantryConfirmHandler(deps(crypto.randomUUID()));
    const response = await POST(
      confirmRequest({ orderId: order.id, items: [{ name: "x", portion: null }] })
    );
    expect(response.status).toBe(404);
  });

  it("double-confirm: second call is a 409 and does not duplicate items", async () => {
    const order = await makeAwaitingOrder();
    const POST = createPantryConfirmHandler(deps());
    const body = {
      orderId: order.id,
      items: [{ name: "steel cut oats", portion: null }]
    };

    await POST(confirmRequest(body));
    const second = await POST(confirmRequest(body));

    expect(second.status).toBe(409);
    const items = await testDb.db
      .select()
      .from(schema.pantryItems)
      .where(eq(schema.pantryItems.orderId, order.id));
    expect(items).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/server/pantry-confirm.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement the API**

Create `app/api/pantry/confirm/route.ts`:

```ts
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { encryptField } from "../../../../lib/server/crypto";
import { getDb, schema, type Db } from "../../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

export const runtime = "nodejs";

// 160 = checkFood()'s FOOD_MAX_LENGTH — anything longer would be rejected
// by the judge later, so reject it at the door instead.
const ConfirmSchema = z
  .object({
    orderId: z.string().uuid(),
    items: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(160),
          portion: z.string().trim().min(1).max(80).nullable().optional()
        })
      )
      .min(1)
      .max(40)
  })
  .strict();

type Deps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  now?: () => Date;
};

export function createPantryConfirmHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const now = deps.now ?? (() => new Date());

  return async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    let parsed;
    try {
      parsed = ConfirmSchema.safeParse(await request.json());
    } catch {
      parsed = ConfirmSchema.safeParse(null);
    }
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const input = parsed.data;

    const [order] = await db()
      .select()
      .from(schema.pantryOrders)
      .where(
        and(
          eq(schema.pantryOrders.id, input.orderId),
          eq(schema.pantryOrders.userId, session.userId)
        )
      );
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Conditional transition = the double-confirm guard: only ONE request
    // can win awaiting_confirm -> processing.
    const transitioned = await db()
      .update(schema.pantryOrders)
      .set({ status: "processing", updatedAt: now() })
      .where(
        and(
          eq(schema.pantryOrders.id, order.id),
          eq(schema.pantryOrders.status, "awaiting_confirm")
        )
      )
      .returning();
    if (transitioned.length === 0) {
      return NextResponse.json(
        { error: "Already confirmed." },
        { status: 409 }
      );
    }

    // The confirmed list REPLACES the drafts — what the buyer approved is
    // exactly what the judge will see (locked decision 1).
    await db()
      .delete(schema.pantryItems)
      .where(eq(schema.pantryItems.orderId, order.id));
    await db()
      .insert(schema.pantryItems)
      .values(
        input.items.map((item, position) => ({
          orderId: order.id,
          position,
          nameCiphertext: encryptField(item.name),
          portionCiphertext: item.portion ? encryptField(item.portion) : null,
          source: "buyer" as const,
          status: "confirmed" as const,
          updatedAt: now()
        }))
      );

    return NextResponse.json({ ok: true });
  };
}

export const POST = createPantryConfirmHandler();
```

- [ ] **Step 4: Build the editable list and wire it into the flow**

Create `components/pantry-confirm-list.tsx`:

```tsx
"use client";

import { useState } from "react";

export type ConfirmItem = { name: string; portion: string };

export function PantryConfirmList({
  initialItems,
  onConfirm
}: {
  initialItems: ConfirmItem[];
  onConfirm: (items: ConfirmItem[]) => Promise<void>;
}) {
  const [rows, setRows] = useState<ConfirmItem[]>(initialItems);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(index: number, patch: Partial<ConfirmItem>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  const valid = rows.filter((row) => row.name.trim().length > 0);

  return (
    <div className="field-stack">
      <ul className="pantry-confirm-rows">
        {rows.map((row, index) => (
          <li key={index}>
            <label className="field-label" htmlFor={`item-name-${index}`}>
              Item {index + 1}
            </label>
            <input
              id={`item-name-${index}`}
              className="text-input"
              value={row.name}
              maxLength={160}
              onChange={(event) => update(index, { name: event.target.value })}
            />
            <input
              aria-label={`Portion for item ${index + 1}`}
              className="text-input"
              placeholder="Portion (optional)"
              value={row.portion}
              maxLength={80}
              onChange={(event) => update(index, { portion: event.target.value })}
            />
            <button
              type="button"
              className="pantry-row-delete"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {rows.length < 40 ? (
        <button
          type="button"
          className="primary-button pantry-add-row"
          onClick={() => setRows((current) => [...current, { name: "", portion: "" }])}
        >
          Add an item we missed
        </button>
      ) : (
        <p className="field-hint">That&apos;s the 40-item maximum for one review.</p>
      )}
      {error ? <p className="field-error">{error}</p> : null}
      <button
        type="button"
        className="primary-button"
        disabled={busy || valid.length === 0}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await onConfirm(valid);
          } catch {
            setError("Saving didn't go through — your edits are still here. Try again.");
            setBusy(false);
          }
        }}
      >
        Review {valid.length} item{valid.length === 1 ? "" : "s"}
      </button>
    </div>
  );
}
```

In `components/pantry-intake-flow.tsx`, replace the Task 2.9 placeholder (`<p className="page-copy">{items.length} items found.</p>`) with:

```tsx
<PantryConfirmList
  initialItems={items.map((item) => ({ name: item.name, portion: item.portion ?? "" }))}
  onConfirm={async (confirmed) => {
    const response = await fetch("/api/pantry/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderId,
        items: confirmed.map((item) => ({
          name: item.name.trim(),
          portion: item.portion.trim() || null
        }))
      })
    });
    if (!response.ok && response.status !== 409) {
      throw new Error("confirm failed");
    }
    // Kick processing; the order also self-heals via the sweep if this
    // request dies with the tab (Task 2.12).
    void fetch("/api/pantry/process", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId })
    });
    setPhase("processing");
  }}
/>
```

…and add the import plus the intro copy `"Here's what we saw — fix anything we got wrong."` above the list. Add row CSS to `app/globals.css` (existing tokens, 44px targets):

```css
.pantry-confirm-rows {
  display: grid;
  gap: 12px;
  list-style: none;
  padding: 0;
}
.pantry-confirm-rows li {
  display: grid;
  gap: 8px;
}
.pantry-row-delete {
  min-height: 44px;
  background: none;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  color: var(--danger);
}
.pantry-add-row {
  background: var(--surface-muted);
  color: var(--text-strong);
}
```

- [ ] **Step 5: Run tests + typecheck**

Run: `npx vitest run tests/unit/server/pantry-confirm.test.ts && npm run typecheck`
Expected: PASS (5/5); clean.

- [ ] **Step 6: Commit**

```bash
git add app/api/pantry/confirm/route.ts components/pantry-confirm-list.tsx components/pantry-intake-flow.tsx app/globals.css tests/unit/server/pantry-confirm.test.ts
git commit -m "feat(pantry): confirm screen — buyer-edited list is what the judge receives (lane B)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent · **Effort:** M · **Verification:** 5/5 green; double-confirm returns 409 with exactly one item set.

### Task 2.11: Lane A3 — batch processor (lease, sequential judging, report assembly, delivery)

The only place pantry items meet the engine — and they meet it **only** through `checkFood()`. Sequential, per-item status, 1 retry, continue-on-failure, atomic lease claim (no queue), clean exit inside a 280s budget with lease release so the sweep or a client re-invoke resumes. Report = deterministic template from judged outputs; email → `deliveredAt` → **photos deleted from Blob**.

**Files:**
- Create: `lib/server/pantry/emails.ts`, `lib/server/pantry/process.ts`, `app/api/pantry/process/route.ts`
- Test: `tests/unit/server/pantry-process.test.ts`

**Interfaces:**
- Consumes: `checkFood` (engine, read-only), `createOpenAIRevoraModelClient`, `bandRepresentativeA1c` (2.9), `encryptField`/`decryptField`, `sendEmail` (2.1), `del` from `@vercel/blob`.
- Produces:
  - `intakeEmailText(appUrl: string, token: string): { subject: string; text: string }` and `reportEmailText(appUrl: string, orderId: string): { subject: string; text: string }` (consumed by 2.12/2.14).
  - `processPantryOrder(deps: ProcessDeps, orderId: string, budgetMs?: number): Promise<{ done: boolean; reason?: string }>` with `type ProcessDeps = { db: Db; model: RevoraModelClient; email: { send: typeof sendEmail }; deleteBlobs: (urls: string[]) => Promise<void>; now: () => Date }`.
  - `type PantryReport = { generatedAt: string; a1cBand: string; counts: { safe: number; moderate: number; high: number; failed: number }; sections: { safe: ReportItem[]; moderate: ReportItem[]; high: ReportItem[]; failed: { name: string }[] }; disclaimer: string }` with `type ReportItem = { name: string; portion: string | null; reason: string; adjustment: string | null; swap: string | null }` — consumed by the report page (2.13).
  - `POST /api/pantry/process` `{ orderId }` — owner session **or** `Authorization: Bearer ${CRON_SECRET}`; `maxDuration = 300`.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/server/pantry-process.test.ts`:

```ts
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { RevoraModelClient } from "../../../lib/revora/openai-client";
import { decryptField, encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import {
  processPantryOrder,
  type PantryReport
} from "../../../lib/server/pantry/process";
import { createTestDb } from "../../helpers/test-db";

const NOW = new Date("2026-07-07T08:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 11).toString("base64");
  process.env.NEXT_PUBLIC_APP_URL = "https://revora.test";
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "proc@test.dev" })
    .returning();
  userId = user.id;
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pantryOrders);
  await testDb.db.delete(schema.checks);
});

/** Model stub speaking the engine's own output contract — the processor only
 *  ever sees checkFood()'s response, so this exercises the REAL postprocess
 *  floors on the way through. */
function modelReturning(risk: "SAFE" | "MODERATE" | "HIGH"): RevoraModelClient {
  return {
    generate: vi.fn().mockResolvedValue({
      kind: "result",
      risk,
      reason: "Steady choice for most meals.",
      adjustment: risk === "SAFE" ? null : "Have it after protein.",
      swap: risk === "SAFE" ? null : "Try the smaller portion first.",
      question: null,
      examples: [],
      policy_flags: risk === "SAFE" ? ["safe_food"] : ["borderline"]
    })
  };
}

const failingModel: RevoraModelClient = {
  generate: vi.fn().mockRejectedValue(new Error("model down"))
};

async function makeProcessingOrder(itemNames: string[]) {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "buyer@example.com",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: `hash_${Math.random().toString(36).slice(2)}`,
      userId,
      status: "processing",
      a1cBand: "prediabetes_60_62",
      consentedAt: NOW
    })
    .returning();
  await testDb.db.insert(schema.pantryItems).values(
    itemNames.map((name, position) => ({
      orderId: order.id,
      position,
      nameCiphertext: encryptField(name),
      source: "buyer" as const,
      status: "confirmed" as const
    }))
  );
  await testDb.db.insert(schema.pantryPhotos).values({
    orderId: order.id,
    blobUrl: "https://blob.test/photo1.jpg",
    status: "extracted"
  });
  return order;
}

function makeDeps(model: RevoraModelClient) {
  return {
    db: testDb.db,
    model,
    email: { send: vi.fn().mockResolvedValue({ ok: true }) },
    deleteBlobs: vi.fn().mockResolvedValue(undefined),
    now: () => NOW
  };
}

describe("processPantryOrder", () => {
  it("judges every confirmed item through checkFood, assembles the report, delivers, deletes photos", async () => {
    const order = await makeProcessingOrder(["steel cut oats", "white bread"]);
    const deps = makeDeps(modelReturning("MODERATE"));

    const result = await processPantryOrder(deps, order.id);

    expect(result.done).toBe(true);
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.status).toBe("ready");
    expect(updated.deliveredAt?.toISOString()).toBe(NOW.toISOString());

    const report = JSON.parse(
      decryptField(updated.reportCiphertext!)
    ) as PantryReport;
    expect(report.counts.moderate).toBe(2);
    expect(report.sections.moderate[0].name).toBe("steel cut oats");
    expect(report.disclaimer.length).toBeGreaterThan(0);

    const items = await testDb.db
      .select()
      .from(schema.pantryItems)
      .where(eq(schema.pantryItems.orderId, order.id));
    expect(items.every((item) => item.status === "judged")).toBe(true);
    expect(items.every((item) => item.risk === "MODERATE")).toBe(true);

    expect(deps.email.send).toHaveBeenCalledTimes(1);
    expect(deps.email.send.mock.calls[0][0].to).toBe("buyer@example.com");
    expect(deps.email.send.mock.calls[0][0].text).toContain(`/report/${order.id}`);
    expect(deps.deleteBlobs).toHaveBeenCalledWith(["https://blob.test/photo1.jpg"]);

    const photos = await testDb.db
      .select()
      .from(schema.pantryPhotos)
      .where(eq(schema.pantryPhotos.orderId, order.id));
    expect(photos.every((photo) => photo.status === "deleted")).toBe(true);
  });

  it("NEVER writes pantry judgments into the checks table", async () => {
    const order = await makeProcessingOrder(["steel cut oats"]);
    await processPantryOrder(makeDeps(modelReturning("SAFE")), order.id);
    expect(await testDb.db.select().from(schema.checks)).toHaveLength(0);
  });

  it("continue-on-failure: a twice-failing item is marked failed, the report still ships", async () => {
    const order = await makeProcessingOrder(["good item", "bad item"]);
    const model: RevoraModelClient = {
      generate: vi.fn().mockImplementation(async (prompt: { input: string }) => {
        if (JSON.stringify(prompt).includes("bad item")) {
          throw new Error("model down");
        }
        return {
          kind: "result",
          risk: "SAFE",
          reason: "Steady choice.",
          adjustment: null,
          swap: null,
          question: null,
          examples: [],
          policy_flags: ["safe_food"]
        };
      })
    };
    const deps = makeDeps(model);

    const result = await processPantryOrder(deps, order.id);

    expect(result.done).toBe(true);
    const items = await testDb.db
      .select()
      .from(schema.pantryItems)
      .where(eq(schema.pantryItems.orderId, order.id));
    const statuses = items.map((item) => item.status).sort();
    expect(statuses).toEqual(["failed", "judged"]);
    const failed = items.find((item) => item.status === "failed");
    expect(failed?.attempts).toBe(2); // exactly one retry
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    const report = JSON.parse(decryptField(updated.reportCiphertext!)) as PantryReport;
    expect(report.counts.failed).toBe(1);
    expect(report.sections.failed[0].name).toBe("bad item");
  });

  it("ALL items failing → needs_manual, founder alerted, NO buyer email", async () => {
    const order = await makeProcessingOrder(["only item"]);
    const deps = makeDeps(failingModel);

    const result = await processPantryOrder(deps, order.id);

    expect(result.done).toBe(true);
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.status).toBe("needs_manual");
    expect(updated.deliveredAt).toBeNull();
    expect(deps.email.send).toHaveBeenCalledTimes(1);
    expect(deps.email.send.mock.calls[0][0].to).not.toBe("buyer@example.com");
    expect(deps.deleteBlobs).not.toHaveBeenCalled();
  });

  it("lease contention: a live lease blocks a second run (no double-processing)", async () => {
    const order = await makeProcessingOrder(["item"]);
    await testDb.db
      .update(schema.pantryOrders)
      .set({ processingLeaseUntil: new Date(NOW.getTime() + 300_000) })
      .where(eq(schema.pantryOrders.id, order.id));
    const deps = makeDeps(modelReturning("SAFE"));

    const result = await processPantryOrder(deps, order.id);

    expect(result.done).toBe(false);
    expect(deps.email.send).not.toHaveBeenCalled();
  });

  it("an EXPIRED lease is claimable (sweep resume path)", async () => {
    const order = await makeProcessingOrder(["item"]);
    await testDb.db
      .update(schema.pantryOrders)
      .set({ processingLeaseUntil: new Date(NOW.getTime() - 1000) })
      .where(eq(schema.pantryOrders.id, order.id));

    const result = await processPantryOrder(makeDeps(modelReturning("SAFE")), order.id);
    expect(result.done).toBe(true);
  });

  it("budget exhaustion: exits cleanly, releases the lease, items stay confirmed", async () => {
    const order = await makeProcessingOrder(["item a", "item b"]);
    const deps = makeDeps(modelReturning("SAFE"));

    const result = await processPantryOrder(deps, order.id, 0);

    expect(result.done).toBe(false);
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.status).toBe("processing");
    expect(updated.processingLeaseUntil).toBeNull();
    const items = await testDb.db
      .select()
      .from(schema.pantryItems)
      .where(eq(schema.pantryItems.orderId, order.id));
    expect(items.every((item) => item.status === "confirmed")).toBe(true);
  });

  it("report-email failure: order is ready but NOT delivered; photos kept for the sweep retry", async () => {
    const order = await makeProcessingOrder(["item"]);
    const deps = {
      ...makeDeps(modelReturning("SAFE")),
      email: { send: vi.fn().mockResolvedValue({ ok: false, status: 500 }) }
    };

    await processPantryOrder(deps, order.id);

    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.status).toBe("ready");
    expect(updated.deliveredAt).toBeNull();
    expect(deps.deleteBlobs).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/unit/server/pantry-process.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement emails + processor**

Create `lib/server/pantry/emails.ts`:

```ts
/** Email copy in one place so webhook/sweep/admin never drift apart. */

export function intakeEmailText(
  appUrl: string,
  token: string
): { subject: string; text: string } {
  return {
    subject: "Your Pantry Review is paid for — let's set it up",
    text: [
      "Thanks — your Pantry Review is paid for.",
      "",
      "Set it up here (sign-in takes one tap, no password):",
      `${appUrl}/pantry/claim?token=${token}`,
      "",
      "You'll add photos of your pantry or typical meals, confirm what we",
      "saw, and get your report by email within 7 days.",
      "",
      `Questions? Reply to this email or write to ${process.env.SUPPORT_EMAIL ?? "support@revora.app"}.`
    ].join("\n")
  };
}

export function reportEmailText(
  appUrl: string,
  orderId: string
): { subject: string; text: string } {
  return {
    subject: "Your Pantry Review is ready",
    text: [
      "Your Pantry Review is ready — starting with what you can enjoy freely.",
      "",
      `Read it here: ${appUrl}/report/${orderId}`,
      "",
      "It stays in your account, and the page prints cleanly if you want a",
      'paper copy ("Save as PDF").',
      "",
      `Questions? Reply to this email or write to ${process.env.SUPPORT_EMAIL ?? "support@revora.app"}.`
    ].join("\n")
  };
}
```

Create `lib/server/pantry/process.ts`:

```ts
import { and, asc, eq, isNull, lt, or } from "drizzle-orm";

import { createOpenAIRevoraModelClient, type RevoraModelClient } from "../../revora/openai-client";
import { checkFood } from "../../revora/service";
import { captureServerError } from "../../revora/sentry-capture";
import { decryptField, encryptField } from "../crypto";
import { schema, type Db } from "../db";
import { sendEmail, type SendEmailResult } from "../email";
import { bandRepresentativeA1c } from "./band";
import { reportEmailText } from "./emails";

/**
 * The ONLY place pantry items are judged — and they are judged exclusively by
 * checkFood() (locked decision 1; the engine is never modified or bypassed).
 * No queue: an atomic lease claim on pantry_orders.processing_lease_until
 * prevents double-runs (browser re-invoke vs cron sweep), and a clean exit
 * inside the budget releases the lease so the next caller resumes.
 */

const LEASE_MS = 5 * 60 * 1000;
const DEFAULT_BUDGET_MS = 280_000; // clean exit before the route's 300s cap
const MAX_ATTEMPTS = 2; // one retry per item
const FOOD_MAX_LENGTH = 160; // checkFood()'s input cap

export type ReportItem = {
  name: string;
  portion: string | null;
  reason: string;
  adjustment: string | null;
  swap: string | null;
};

export type PantryReport = {
  generatedAt: string;
  a1cBand: string;
  counts: { safe: number; moderate: number; high: number; failed: number };
  sections: {
    safe: ReportItem[];
    moderate: ReportItem[];
    high: ReportItem[];
    failed: { name: string }[];
  };
  disclaimer: string;
};

export type ProcessDeps = {
  db: Db;
  model: RevoraModelClient;
  email: {
    send: (input: { to: string; subject: string; text: string }) => Promise<SendEmailResult>;
  };
  deleteBlobs: (urls: string[]) => Promise<void>;
  now: () => Date;
};

export function defaultProcessDeps(db: Db): ProcessDeps {
  return {
    db,
    model: createOpenAIRevoraModelClient(),
    email: { send: sendEmail },
    deleteBlobs: async (urls) => {
      const { del } = await import("@vercel/blob");
      await del(urls);
    },
    now: () => new Date()
  };
}

export async function processPantryOrder(
  deps: ProcessDeps,
  orderId: string,
  budgetMs: number = DEFAULT_BUDGET_MS
): Promise<{ done: boolean; reason?: string }> {
  const startedAt = Date.now();
  const now = deps.now();

  // Atomic lease claim — exactly one runner wins.
  const claimed = await deps.db
    .update(schema.pantryOrders)
    .set({
      processingLeaseUntil: new Date(now.getTime() + LEASE_MS),
      updatedAt: now
    })
    .where(
      and(
        eq(schema.pantryOrders.id, orderId),
        eq(schema.pantryOrders.status, "processing"),
        or(
          isNull(schema.pantryOrders.processingLeaseUntil),
          lt(schema.pantryOrders.processingLeaseUntil, now)
        )
      )
    )
    .returning();
  if (claimed.length === 0) {
    return { done: false, reason: "not_claimable" };
  }
  const order = claimed[0];

  if (!order.a1cBand) {
    await finishNeedsManual(deps, order.id, "missing a1c band");
    return { done: true, reason: "needs_manual" };
  }
  const a1c = bandRepresentativeA1c(order.a1cBand);

  const releaseLease = () =>
    deps.db
      .update(schema.pantryOrders)
      .set({ processingLeaseUntil: null, updatedAt: deps.now() })
      .where(eq(schema.pantryOrders.id, order.id));

  // Sequential judging: confirmed items, position order, 1 retry each,
  // continue on failure, honor the budget.
  const items = await deps.db
    .select()
    .from(schema.pantryItems)
    .where(
      and(
        eq(schema.pantryItems.orderId, order.id),
        eq(schema.pantryItems.status, "confirmed")
      )
    )
    .orderBy(asc(schema.pantryItems.position));

  for (const item of items) {
    // >= so a zero budget exits before judging anything (testable boundary).
    if (Date.now() - startedAt >= budgetMs) {
      await releaseLease();
      return { done: false, reason: "budget" };
    }

    const name = decryptField(item.nameCiphertext);
    const portion = item.portionCiphertext
      ? decryptField(item.portionCiphertext)
      : null;
    const food = (portion ? `${name} (${portion})` : name).slice(
      0,
      FOOD_MAX_LENGTH
    );

    let attempts = item.attempts;
    let judged = false;
    while (attempts < MAX_ATTEMPTS && !judged) {
      attempts += 1;
      try {
        const response = await checkFood({ food, a1c }, { model: deps.model });
        if (response.kind === "result") {
          await deps.db
            .update(schema.pantryItems)
            .set({
              status: "judged",
              risk: response.risk,
              resultCiphertext: encryptField(JSON.stringify(response)),
              attempts,
              updatedAt: deps.now()
            })
            .where(eq(schema.pantryItems.id, item.id));
          judged = true;
        }
        // Non-result kinds (retry/clarify/not_food) count as an attempt —
        // checkFood already failed closed; loop once more, then mark failed.
      } catch (error) {
        await captureServerError(error, "pantry-process");
      }
    }
    if (!judged) {
      await deps.db
        .update(schema.pantryItems)
        .set({ status: "failed", attempts, updatedAt: deps.now() })
        .where(eq(schema.pantryItems.id, item.id));
    }
    // Keep the lease alive while we work.
    await deps.db
      .update(schema.pantryOrders)
      .set({ processingLeaseUntil: new Date(Date.now() + LEASE_MS) })
      .where(eq(schema.pantryOrders.id, order.id));
  }

  // Every item terminal — assemble.
  const finalItems = await deps.db
    .select()
    .from(schema.pantryItems)
    .where(eq(schema.pantryItems.orderId, order.id))
    .orderBy(asc(schema.pantryItems.position));

  const judgedItems = finalItems.filter((item) => item.status === "judged");
  if (judgedItems.length === 0) {
    await finishNeedsManual(deps, order.id, "all items failed judging");
    return { done: true, reason: "needs_manual" };
  }

  const report = buildPantryReport(order.a1cBand, finalItems, deps.now());
  await deps.db
    .update(schema.pantryOrders)
    .set({
      status: "ready",
      reportCiphertext: encryptField(JSON.stringify(report)),
      processingLeaseUntil: null,
      updatedAt: deps.now()
    })
    .where(eq(schema.pantryOrders.id, order.id));

  await deliverReport(deps, { id: order.id, email: order.email });
  return { done: true, reason: "ready" };
}

/** Send the report email; on success stamp deliveredAt and delete photos
 *  from Blob (privacy: photos live only until delivery). Reused by the sweep
 *  and admin resend. */
export async function deliverReport(
  deps: ProcessDeps,
  order: { id: string; email: string }
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const message = reportEmailText(appUrl, order.id);
  const result = await deps.email.send({ to: order.email, ...message });
  if (!result.ok) {
    return false; // deliveredAt stays null — the sweep retries.
  }

  await deps.db
    .update(schema.pantryOrders)
    .set({ deliveredAt: deps.now(), updatedAt: deps.now() })
    .where(eq(schema.pantryOrders.id, order.id));

  const photos = await deps.db
    .select()
    .from(schema.pantryPhotos)
    .where(eq(schema.pantryPhotos.orderId, order.id));
  const urls = photos
    .filter((photo) => photo.status !== "deleted")
    .map((photo) => photo.blobUrl);
  if (urls.length > 0) {
    try {
      await deps.deleteBlobs(urls);
    } catch (error) {
      await captureServerError(error, "pantry-blob-delete");
    }
    await deps.db
      .update(schema.pantryPhotos)
      .set({ status: "deleted" })
      .where(eq(schema.pantryPhotos.orderId, order.id));
  }
  return true;
}

async function finishNeedsManual(
  deps: ProcessDeps,
  orderId: string,
  why: string
): Promise<void> {
  await deps.db
    .update(schema.pantryOrders)
    .set({
      status: "needs_manual",
      processingLeaseUntil: null,
      updatedAt: deps.now()
    })
    .where(eq(schema.pantryOrders.id, orderId));
  await deps.email.send({
    to: process.env.SUPPORT_EMAIL ?? "support@revora.app",
    subject: `Pantry order needs manual review: ${orderId}`,
    text: `Order ${orderId}: ${why}. Handle via /admin/pantry.`
  });
}

function buildPantryReport(
  a1cBand: string,
  items: (typeof schema.pantryItems.$inferSelect)[],
  generatedAt: Date
): PantryReport {
  const sections: PantryReport["sections"] = {
    safe: [],
    moderate: [],
    high: [],
    failed: []
  };
  let disclaimer = "";

  for (const item of items) {
    const name = decryptField(item.nameCiphertext);
    const portion = item.portionCiphertext
      ? decryptField(item.portionCiphertext)
      : null;

    if (item.status !== "judged" || !item.resultCiphertext || !item.risk) {
      sections.failed.push({ name });
      continue;
    }
    const result = JSON.parse(decryptField(item.resultCiphertext)) as {
      reason?: string;
      adjustment?: string | null;
      swap?: string | null;
      disclaimer?: string;
    };
    disclaimer = result.disclaimer ?? disclaimer;
    const entry: ReportItem = {
      name,
      portion,
      reason: result.reason ?? "",
      adjustment: result.adjustment ?? null,
      swap: result.swap ?? null
    };
    if (item.risk === "SAFE") sections.safe.push(entry);
    else if (item.risk === "MODERATE") sections.moderate.push(entry);
    else sections.high.push(entry);
  }

  return {
    generatedAt: generatedAt.toISOString(),
    a1cBand,
    counts: {
      safe: sections.safe.length,
      moderate: sections.moderate.length,
      high: sections.high.length,
      failed: sections.failed.length
    },
    sections,
    disclaimer
  };
}
```

Create `app/api/pantry/process/route.ts`:

```ts
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb, schema, type Db } from "../../../../lib/server/db";
import {
  defaultProcessDeps,
  processPantryOrder,
  type ProcessDeps
} from "../../../../lib/server/pantry/process";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

export const runtime = "nodejs";
// Judging ≤40 items sequentially needs the plan's 300s ceiling (Vercel Pro).
export const maxDuration = 300;

const BodySchema = z.object({ orderId: z.string().uuid() }).strict();

type Deps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  makeProcessDeps?: (db: Db) => ProcessDeps;
};

export function createPantryProcessHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const makeProcessDeps = deps.makeProcessDeps ?? defaultProcessDeps;

  return async function POST(request: Request) {
    const cronSecret = process.env.CRON_SECRET;
    const isCron =
      !!cronSecret &&
      request.headers.get("authorization") === `Bearer ${cronSecret}`;

    let parsed;
    try {
      parsed = BodySchema.safeParse(await request.json());
    } catch {
      parsed = BodySchema.safeParse(null);
    }
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (!isCron) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Sign in first." }, { status: 401 });
      }
      const [order] = await db()
        .select({ id: schema.pantryOrders.id })
        .from(schema.pantryOrders)
        .where(
          and(
            eq(schema.pantryOrders.id, parsed.data.orderId),
            eq(schema.pantryOrders.userId, session.userId)
          )
        );
      if (!order) {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }
    }

    const result = await processPantryOrder(
      makeProcessDeps(db()),
      parsed.data.orderId
    );
    return NextResponse.json(result, { status: 202 });
  };
}

export const POST = createPantryProcessHandler();
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/unit/server/pantry-process.test.ts && npm run typecheck`
Expected: PASS (8/8); clean. Also run `npm run eval:revora` — the engine was consumed, not changed; the safety gate must still be green.

- [ ] **Step 5: Commit**

```bash
git add lib/server/pantry/emails.ts lib/server/pantry/process.ts app/api/pantry/process/route.ts tests/unit/server/pantry-process.test.ts
git commit -m "feat(pantry): lease-based batch processor — checkFood-only judging, deterministic report, delivery + photo deletion (lane A3)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent · **Effort:** L · **Verification:** 8/8 green incl. the checks-table-untouched and lease-contention proofs; `eval:revora` green.

### Task 2.12: Lane A3 — cron sweep (self-healing) + `vercel.json`

Hourly sweep, `CRON_SECRET`-authed like the existing crons: (1) re-sends failed intake emails with a **freshly minted claim token** (the original raw token is unrecoverable by design — only its hash is stored); (2) resumes `processing` orders whose lease expired; (3) marks `extracting` orders older than 15min `needs_manual` (a submit request died mid-extraction); (4) re-delivers `ready` orders with `deliveredAt` null (and then deletes photos); (5) alerts the founder once per order stuck >2h (window check — alert fires in the hour it crosses 2h); (6) writes the `pantry-sweep` heartbeat row `/api/health` can report on.

**Files:**
- Create: `lib/server/pantry/sweep.ts`, `app/api/cron/pantry-sweep/route.ts`
- Modify: `vercel.json`, `app/api/billing/handlers.ts` (swap the inline intake email copy for `intakeEmailText` — DRY, guarded by the 2.4 suites)
- Test: `tests/unit/server/pantry-sweep.test.ts`

**Interfaces:**
- Consumes: `generateClaimToken` (2.3), `intakeEmailText` (2.11), `processPantryOrder`/`deliverReport` (2.11), `schema.cronHeartbeat` (existing).
- Produces: `runPantrySweep(deps: SweepDeps): Promise<{ intakeResent: number; resumed: number; redelivered: number; alerted: number }>` with `type SweepDeps = ProcessDeps & { processOrder?: typeof processPantryOrder }`; `GET /api/cron/pantry-sweep` (Bearer `CRON_SECRET`, `maxDuration = 300`).

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/server/pantry-sweep.test.ts`:

```ts
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { hashClaimToken } from "../../../lib/server/pantry/claims";
import { runPantrySweep } from "../../../lib/server/pantry/sweep";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const NOW = new Date("2026-07-08T12:00:00.000Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000);

let testDb: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 12).toString("base64");
  process.env.NEXT_PUBLIC_APP_URL = "https://revora.test";
  testDb = await createTestDb();
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pantryOrders);
  await testDb.db.delete(schema.cronHeartbeat);
});

async function makeOrder(overrides: Partial<typeof schema.pantryOrders.$inferInsert>) {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "buyer@example.com",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: `hash_${Math.random().toString(36).slice(2)}`,
      ...overrides
    })
    .returning();
  return order;
}

function makeDeps() {
  return {
    db: testDb.db,
    model: { generate: vi.fn() },
    email: { send: vi.fn().mockResolvedValue({ ok: true }) },
    deleteBlobs: vi.fn().mockResolvedValue(undefined),
    now: () => NOW,
    processOrder: vi.fn().mockResolvedValue({ done: true })
  };
}

describe("runPantrySweep", () => {
  it("re-sends a failed intake email with a freshly minted token", async () => {
    const order = await makeOrder({ status: "paid", intakeEmailSentAt: null });
    const deps = makeDeps();

    const result = await runPantrySweep(deps);

    expect(result.intakeResent).toBe(1);
    const message = deps.email.send.mock.calls[0][0];
    const token = /token=([A-Za-z0-9_-]+)/.exec(message.text)?.[1] ?? "";
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.claimToken).toBe(hashClaimToken(token));
    expect(updated.claimToken).not.toBe(order.claimToken);
    expect(updated.intakeEmailSentAt?.toISOString()).toBe(NOW.toISOString());
  });

  it("resumes processing orders whose lease expired", async () => {
    const order = await makeOrder({
      status: "processing",
      processingLeaseUntil: hoursAgo(1)
    });
    const deps = makeDeps();

    const result = await runPantrySweep(deps);

    expect(result.resumed).toBe(1);
    expect(deps.processOrder).toHaveBeenCalledWith(
      expect.anything(),
      order.id,
      expect.any(Number)
    );
  });

  it("marks a dead mid-extraction order needs_manual", async () => {
    const order = await makeOrder({ status: "extracting", updatedAt: hoursAgo(1) });
    await runPantrySweep(makeDeps());
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.status).toBe("needs_manual");
  });

  it("re-delivers ready-but-undelivered reports", async () => {
    await makeOrder({
      status: "ready",
      reportCiphertext: "ct",
      deliveredAt: null
    });
    const deps = makeDeps();
    const result = await runPantrySweep(deps);
    expect(result.redelivered).toBe(1);
    expect(deps.email.send).toHaveBeenCalled();
  });

  it("alerts the founder exactly in the hour an order crosses 2h stuck", async () => {
    await makeOrder({ status: "submitted", updatedAt: hoursAgo(2.5) });
    const inWindow = await runPantrySweep(makeDeps());
    expect(inWindow.alerted).toBe(1);

    await testDb.db.delete(schema.pantryOrders);
    await makeOrder({ status: "submitted", updatedAt: hoursAgo(6) });
    const outOfWindow = await runPantrySweep(makeDeps());
    expect(outOfWindow.alerted).toBe(0);
  });

  it("writes the pantry-sweep heartbeat", async () => {
    await runPantrySweep(makeDeps());
    const [beat] = await testDb.db
      .select()
      .from(schema.cronHeartbeat)
      .where(eq(schema.cronHeartbeat.name, "pantry-sweep"));
    expect(beat.lastRunAt.toISOString()).toBe(NOW.toISOString());
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/unit/server/pantry-sweep.test.ts` → FAIL.

- [ ] **Step 3: Implement**

Create `lib/server/pantry/sweep.ts`:

```ts
import { and, eq, gte, inArray, isNull, lt, or } from "drizzle-orm";

import { schema } from "../db";
import { generateClaimToken } from "./claims";
import { intakeEmailText } from "./emails";
import {
  deliverReport,
  processPantryOrder,
  type ProcessDeps
} from "./process";

/**
 * Self-healing pass (locked decision 9). Runs hourly; every action is
 * idempotent, so overlapping runs are merely wasteful, never wrong.
 * Founder alerting uses a window check (2h..3h stuck) instead of an
 * alerted_at column — with an hourly cron each order alerts exactly once.
 * ponytail: window-based alert-once; add an alerted_at column if the cron
 * cadence ever changes.
 */

const EXTRACT_DEAD_MS = 15 * 60 * 1000;
const STUCK_MS = 2 * 60 * 60 * 1000;
const ALERT_WINDOW_MS = 60 * 60 * 1000; // one cron interval
const RESUME_BUDGET_MS = 240_000;

export type SweepDeps = ProcessDeps & {
  processOrder?: typeof processPantryOrder;
};

export async function runPantrySweep(deps: SweepDeps): Promise<{
  intakeResent: number;
  resumed: number;
  redelivered: number;
  alerted: number;
}> {
  const now = deps.now();
  const processOrder = deps.processOrder ?? processPantryOrder;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let intakeResent = 0;
  let resumed = 0;
  let redelivered = 0;
  let alerted = 0;

  // 1. Intake emails that never went out. The raw token only ever existed in
  // the original email attempt — mint a new one (the old hash dies with it).
  const unsent = await deps.db
    .select()
    .from(schema.pantryOrders)
    .where(
      and(
        eq(schema.pantryOrders.status, "paid"),
        isNull(schema.pantryOrders.intakeEmailSentAt)
      )
    );
  for (const order of unsent) {
    const { token, tokenHash } = generateClaimToken();
    await deps.db
      .update(schema.pantryOrders)
      .set({ claimToken: tokenHash, updatedAt: now })
      .where(eq(schema.pantryOrders.id, order.id));
    const message = intakeEmailText(appUrl, token);
    const result = await deps.email.send({ to: order.email, ...message });
    if (result.ok) {
      await deps.db
        .update(schema.pantryOrders)
        .set({ intakeEmailSentAt: now, updatedAt: now })
        .where(eq(schema.pantryOrders.id, order.id));
      intakeResent += 1;
    }
  }

  // 2. Resume processing orders with an expired (or absent) lease.
  const resumable = await deps.db
    .select({ id: schema.pantryOrders.id })
    .from(schema.pantryOrders)
    .where(
      and(
        eq(schema.pantryOrders.status, "processing"),
        or(
          isNull(schema.pantryOrders.processingLeaseUntil),
          lt(schema.pantryOrders.processingLeaseUntil, now)
        )
      )
    );
  for (const order of resumable) {
    await processOrder(deps, order.id, RESUME_BUDGET_MS);
    resumed += 1;
  }

  // 3. A submit request that died mid-extraction leaves "extracting" behind.
  await deps.db
    .update(schema.pantryOrders)
    .set({ status: "needs_manual", updatedAt: now })
    .where(
      and(
        eq(schema.pantryOrders.status, "extracting"),
        lt(schema.pantryOrders.updatedAt, new Date(now.getTime() - EXTRACT_DEAD_MS))
      )
    );

  // 4. Ready but never delivered (email failed at process time).
  const undelivered = await deps.db
    .select()
    .from(schema.pantryOrders)
    .where(
      and(
        eq(schema.pantryOrders.status, "ready"),
        isNull(schema.pantryOrders.deliveredAt)
      )
    );
  for (const order of undelivered) {
    const ok = await deliverReport(deps, { id: order.id, email: order.email });
    if (ok) redelivered += 1;
  }

  // 5. Founder alert for anything stuck >2h (once, via the window check).
  const stuck = await deps.db
    .select()
    .from(schema.pantryOrders)
    .where(
      and(
        inArray(schema.pantryOrders.status, [
          "submitted",
          "extracting",
          "processing",
          "awaiting_confirm"
        ]),
        lt(schema.pantryOrders.updatedAt, new Date(now.getTime() - STUCK_MS)),
        gte(
          schema.pantryOrders.updatedAt,
          new Date(now.getTime() - STUCK_MS - ALERT_WINDOW_MS)
        )
      )
    );
  if (stuck.length > 0) {
    await deps.email.send({
      to: process.env.SUPPORT_EMAIL ?? "support@revora.app",
      subject: `Pantry orders stuck >2h: ${stuck.length}`,
      text: stuck
        .map((order) => `${order.id} — ${order.status} since ${order.updatedAt.toISOString()}`)
        .join("\n") + "\n\nHandle via /admin/pantry."
    });
    alerted = stuck.length;
  }

  // 6. Liveness heartbeat for /api/health.
  await deps.db
    .insert(schema.cronHeartbeat)
    .values({ name: "pantry-sweep", lastRunAt: now })
    .onConflictDoUpdate({
      target: schema.cronHeartbeat.name,
      set: { lastRunAt: now }
    });

  return { intakeResent, resumed, redelivered, alerted };
}
```

Create `app/api/cron/pantry-sweep/route.ts` (mirror the nudge cron's auth exactly):

```ts
import { NextResponse } from "next/server";

import { captureServerError } from "../../../../lib/revora/sentry-capture";
import { getDb, type Db } from "../../../../lib/server/db";
import { defaultProcessDeps } from "../../../../lib/server/pantry/process";
import { runPantrySweep } from "../../../../lib/server/pantry/sweep";

export const runtime = "nodejs";
export const maxDuration = 300;

type Deps = { db?: () => Db; sweep?: typeof runPantrySweep };

export function createPantrySweepHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const sweep = deps.sweep ?? runPantrySweep;

  return async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get("authorization");
    if (!secret || auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    try {
      const result = await sweep(defaultProcessDeps(db()));
      return NextResponse.json({ ok: true, ...result });
    } catch (error) {
      await captureServerError(error, "pantry-sweep");
      return NextResponse.json({ error: "sweep failed" }, { status: 500 });
    }
  };
}

export const GET = createPantrySweepHandler();
```

Add the cron to `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/nudge", "schedule": "0 * * * *" },
    { "path": "/api/cron/bai-weekly", "schedule": "30 4 * * 1" },
    { "path": "/api/cron/pantry-sweep", "schedule": "15 * * * *" }
  ]
}
```

DRY refactor: in `app/api/billing/handlers.ts`, replace the inline subject/text in `applyPantryCheckout` with `intakeEmailText(appUrl, token)` (import from `../../../lib/server/pantry/emails`) — behavior-identical, proven by the Task 2.4 suite.

- [ ] **Step 4: Run everything the change touches**

Run: `npx vitest run tests/unit/server/pantry-sweep.test.ts tests/unit/server/pantry-webhook.test.ts tests/unit/server/billing-routes.test.ts tests/unit/server/health.test.ts && npm run typecheck`
Expected: all PASS (health probe tolerates unknown heartbeat names; if it asserts an exhaustive cron list, extend it for `pantry-sweep` in this task).

- [ ] **Step 5: Commit**

```bash
git add lib/server/pantry/sweep.ts app/api/cron/pantry-sweep/route.ts vercel.json app/api/billing/handlers.ts tests/unit/server/pantry-sweep.test.ts
git commit -m "feat(pantry): hourly self-healing sweep — intake/report retries, lease resume, stuck alerts, heartbeat (lane A3)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent · **Effort:** M · **Verification:** 6/6 sweep tests + webhook + billing suites green.

### Task 2.13: Lane D — `/report/[id]` — the product

A **document, not a dashboard** (design spec Pass 4): summary strip → "Enjoy freely" FIRST (the permission moment IS the product) → "Swap these" (moderate) → "Handle with care" (high) → failed items marked honestly → contract disclaimer + support → ONE `paywall-card`, after value. Owner-only; processing state instead of a 404, always. `noindex`. Print stylesheet; "Save as PDF" = `window.print()`.

**Files:**
- Create: `lib/server/pantry/report-view.ts`, `app/report/[id]/page.tsx`, `components/print-button.tsx`
- Modify: `app/globals.css` (print block + report classes)
- Test: `tests/unit/server/pantry-report-view.test.ts`

**Interfaces:**
- Consumes: `PantryReport` (2.11), `decryptField`, `getSessionInfo`.
- Produces: `loadReportForUser(db, userId, orderId): Promise<{ kind: "not_found" } | { kind: "processing" } | { kind: "ready"; report: PantryReport }>` — the page is a thin renderer over this testable core.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/server/pantry-report-view.test.ts`:

```ts
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { loadReportForUser } from "../../../lib/server/pantry/report-view";
import { createTestDb } from "../../helpers/test-db";

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;
let strangerId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 13).toString("base64");
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "report@test.dev" })
    .returning();
  const [stranger] = await testDb.db
    .insert(schema.users)
    .values({ email: "stranger2@test.dev" })
    .returning();
  userId = user.id;
  strangerId = stranger.id;
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pantryOrders);
});

const REPORT = {
  generatedAt: "2026-07-08T12:00:00.000Z",
  a1cBand: "prediabetes_60_62",
  counts: { safe: 1, moderate: 0, high: 0, failed: 0 },
  sections: {
    safe: [{ name: "eggs", portion: null, reason: "r", adjustment: null, swap: null }],
    moderate: [],
    high: [],
    failed: []
  },
  disclaimer: "Not medical advice."
};

async function makeOrder(overrides: Partial<typeof schema.pantryOrders.$inferInsert>) {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "report@test.dev",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: `hash_${Math.random().toString(36).slice(2)}`,
      userId,
      ...overrides
    })
    .returning();
  return order;
}

describe("loadReportForUser", () => {
  it("returns the decrypted report for the owner of a ready order", async () => {
    const order = await makeOrder({
      status: "ready",
      reportCiphertext: encryptField(JSON.stringify(REPORT))
    });
    const view = await loadReportForUser(testDb.db, userId, order.id);
    expect(view.kind).toBe("ready");
    if (view.kind === "ready") {
      expect(view.report.sections.safe[0].name).toBe("eggs");
    }
  });

  it("returns processing (never a 404) for the owner while any pre-ready status", async () => {
    const order = await makeOrder({ status: "processing" });
    const view = await loadReportForUser(testDb.db, userId, order.id);
    expect(view.kind).toBe("processing");
  });

  it("returns not_found for a non-owner (wrong-user access)", async () => {
    const order = await makeOrder({ status: "ready", reportCiphertext: encryptField("{}") });
    const view = await loadReportForUser(testDb.db, strangerId, order.id);
    expect(view.kind).toBe("not_found");
  });

  it("returns not_found for a garbage id without throwing", async () => {
    const view = await loadReportForUser(testDb.db, userId, "not-a-uuid");
    expect(view.kind).toBe("not_found");
  });

  it("returns not_found for canceled (refunded) orders", async () => {
    const order = await makeOrder({ status: "canceled" });
    const view = await loadReportForUser(testDb.db, userId, order.id);
    expect(view.kind).toBe("not_found");
  });
});
```

- [ ] **Step 2: Run to verify it fails, then implement the core**

Run: `npx vitest run tests/unit/server/pantry-report-view.test.ts` → FAIL.

Create `lib/server/pantry/report-view.ts`:

```ts
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { decryptField } from "../crypto";
import { schema, type Db } from "../db";
import type { PantryReport } from "./process";

export type ReportView =
  | { kind: "not_found" }
  | { kind: "processing" }
  | { kind: "ready"; report: PantryReport };

export async function loadReportForUser(
  db: Db,
  userId: string,
  orderId: string
): Promise<ReportView> {
  if (!z.string().uuid().safeParse(orderId).success) {
    return { kind: "not_found" };
  }
  const [order] = await db
    .select()
    .from(schema.pantryOrders)
    .where(
      and(
        eq(schema.pantryOrders.id, orderId),
        eq(schema.pantryOrders.userId, userId)
      )
    );
  if (!order || order.status === "canceled") {
    return { kind: "not_found" };
  }
  if (order.status !== "ready" || !order.reportCiphertext) {
    // The owner NEVER sees a 404 for an in-flight order (design spec).
    return { kind: "processing" };
  }
  return {
    kind: "ready",
    report: JSON.parse(decryptField(order.reportCiphertext)) as PantryReport
  };
}
```

Run: `npx vitest run tests/unit/server/pantry-report-view.test.ts` → PASS (5/5).

- [ ] **Step 3: Render the document**

Create `components/print-button.tsx`:

```tsx
"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      className="primary-button report-actions"
      onClick={() => window.print()}
    >
      Save as PDF
    </button>
  );
}
```

Create `app/report/[id]/page.tsx`:

```tsx
import { notFound, redirect } from "next/navigation";

import { PrintButton } from "../../../components/print-button";
import { getDb } from "../../../lib/server/db";
import {
  loadReportForUser
} from "../../../lib/server/pantry/report-view";
import type { ReportItem } from "../../../lib/server/pantry/process";
import { getSessionInfo } from "../../../lib/server/session";

export const metadata = {
  title: "Your Pantry Review — Revora",
  robots: { index: false, follow: false }
};

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@revora.app";

const BAND_LABEL: Record<string, string> = {
  prediabetes_57_59: "5.7% – 5.9%",
  prediabetes_60_62: "6.0% – 6.2%",
  prediabetes_63_64: "6.3% – 6.4%"
};

function ItemRow({ item, tone }: { item: ReportItem; tone: "safe" | "moderate" | "high" }) {
  return (
    <div className={`result-card report-item report-item--${tone}`}>
      <p className="report-item-name">
        {item.name}
        {item.portion ? <span className="report-item-portion"> · {item.portion}</span> : null}
      </p>
      <p className="report-item-reason">{item.reason}</p>
      {item.swap ? <p className="report-item-tip">Swap idea: {item.swap}</p> : null}
      {item.adjustment ? <p className="report-item-tip">Timing tip: {item.adjustment}</p> : null}
    </div>
  );
}

export default async function ReportPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionInfo();
  if (!session) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(`/report/${id}`)}`);
  }

  const view = await loadReportForUser(getDb(), session.userId, id);
  if (view.kind === "not_found") {
    notFound();
  }
  if (view.kind === "processing") {
    return (
      <main className="page-shell">
        <div className="page-frame">
          <section className="surface-card">
            <p className="hero-eyebrow">Pantry Review</p>
            <h1 className="page-title">Almost there</h1>
            <p className="request-status" aria-live="polite">
              Your items are still being reviewed. You&apos;ll get an email the
              moment the report is ready — it&apos;s safe to close this page.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const { report } = view;
  return (
    <main className="page-shell">
      <div className="page-frame report-frame">
        <section className="surface-card">
          <p className="hero-eyebrow">Pantry Review</p>
          <h1 className="page-title">Your Pantry Review</h1>
          <p className="page-copy">
            Based on the {report.counts.safe + report.counts.moderate + report.counts.high}{" "}
            items you confirmed and an A1C range of {BAND_LABEL[report.a1cBand] ?? report.a1cBand}.
          </p>
          <p className="report-summary-strip">
            {report.counts.safe} enjoy freely · {report.counts.moderate} worth a
            tweak · {report.counts.high} handle with care
            {report.counts.failed > 0 ? ` · ${report.counts.failed} still being reviewed` : ""}
          </p>
          <PrintButton />
        </section>

        {report.sections.safe.length > 0 ? (
          <section className="surface-card">
            <h2>Enjoy freely</h2>
            <p className="page-copy">
              These fit your range as they are — no changes needed.
            </p>
            {report.sections.safe.map((item, index) => (
              <ItemRow key={`safe-${index}`} item={item} tone="safe" />
            ))}
          </section>
        ) : null}

        {report.sections.moderate.length > 0 ? (
          <section className="surface-card">
            <h2>Swap these</h2>
            <p className="page-copy">
              Small upgrades — a portion, a pairing, or a timing change makes
              each of these work better for you.
            </p>
            {report.sections.moderate.map((item, index) => (
              <ItemRow key={`moderate-${index}`} item={item} tone="moderate" />
            ))}
          </section>
        ) : null}

        {report.sections.high.length > 0 ? (
          <section className="surface-card">
            <h2>Handle with care</h2>
            {report.sections.high.map((item, index) => (
              <ItemRow key={`high-${index}`} item={item} tone="high" />
            ))}
          </section>
        ) : null}

        {report.sections.failed.length > 0 ? (
          <section className="surface-card">
            <h2>What we saw</h2>
            <p className="page-copy">
              We&apos;ll update these items shortly — they needed another look:
            </p>
            <ul>
              {report.sections.failed.map((item) => (
                <li key={item.name}>{item.name}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="result-disclaimer">{report.disclaimer}</p>
        <p className="page-copy">Questions about your report? {SUPPORT_EMAIL}</p>

        <section className="paywall-card">
          <h2>Keep checking daily meals</h2>
          <p>
            The same review, one meal at a time — type or say any food and get
            a calm answer in seconds. Premium removes the daily limit.
          </p>
          <a className="primary-button" href="/subscribe">
            See Premium
          </a>
        </section>
      </div>
    </main>
  );
}
```

Add to `app/globals.css` (semantic risk borders reuse the existing tokens; print block per design spec):

```css
.report-summary-strip {
  font-weight: 700;
  color: var(--text-strong);
}
.report-item { margin-top: 12px; }
.report-item--safe { border-left: 4px solid var(--safe-border); }
.report-item--moderate { border-left: 4px solid var(--moderate-border); }
.report-item--high { border-left: 4px solid var(--high-border); }
.report-item-name { font-weight: 700; color: var(--text-strong); }
.report-item-portion { font-weight: 400; color: var(--text-muted); }

@media print {
  .report-actions,
  .paywall-card,
  nav,
  footer {
    display: none !important;
  }
  body,
  .page-shell {
    background: #fff !important;
  }
  .surface-card {
    box-shadow: none !important;
    border: none !important;
  }
  .report-item {
    break-inside: avoid;
  }
}
```

- [ ] **Step 4: Verify + commit**

Run: `npx vitest run tests/unit/server/pantry-report-view.test.ts tests/unit/revora/claims-boundary-copy.test.ts && npm run typecheck`
Expected: all green — the claims-boundary scan must clear the new report copy (note: "no changes needed", "fit your range" — permission-first, no banned families).

```bash
git add lib/server/pantry/report-view.ts app/report/ components/print-button.tsx app/globals.css tests/unit/server/pantry-report-view.test.ts
git commit -m "feat(pantry): report page — permission-first document, owner-only, print stylesheet, noindex (lane D)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent · **Effort:** M · **Verification:** 5/5 view tests; claims-boundary green; manual print-preview shows no paywall/buttons.

### Task 2.14: Lane D — `/admin/pantry` founder ops page

Plain table, zero decoration (design spec): order · status · age · actions (resend intake, resend report, mark-manual, re-run). Gate: session email must equal `ADMIN_EMAIL` — page and API both hard-404 otherwise (absence of the env means nobody is admin).

**Files:**
- Create: `lib/server/admin.ts`, `app/admin/pantry/page.tsx`, `components/admin-pantry-table.tsx`, `app/api/admin/pantry/route.ts`
- Test: `tests/unit/server/admin-pantry.test.ts`

**Interfaces:**
- Consumes: `generateClaimToken` + `intakeEmailText` (2.3/2.11), `deliverReport` + `processPantryOrder` + `defaultProcessDeps` (2.11).
- Produces: `isAdmin(session: SessionInfo): boolean`; `POST /api/admin/pantry` `{ orderId, action: "resend_intake" | "resend_report" | "mark_manual" | "rerun" }` → `{ ok: true }` or 404/400. New env: `ADMIN_EMAIL` (add name to `.env.example`; human sets it — Appendix A H4).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/server/admin-pantry.test.ts`:

```ts
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminPantryHandler } from "../../../app/api/admin/pantry/route";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const NOW = new Date("2026-07-09T09:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 14).toString("base64");
  process.env.ADMIN_EMAIL = "founder@revora.app";
  process.env.NEXT_PUBLIC_APP_URL = "https://revora.test";
  testDb = await createTestDb();
});

afterAll(async () => {
  delete process.env.ADMIN_EMAIL;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pantryOrders);
});

async function makeOrder(overrides: Partial<typeof schema.pantryOrders.$inferInsert> = {}) {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "buyer@example.com",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: `hash_${Math.random().toString(36).slice(2)}`,
      status: "paid",
      ...overrides
    })
    .returning();
  return order;
}

function makeDeps(sessionEmail = "founder@revora.app") {
  return {
    db: () => testDb.db,
    getSession: async () =>
      sessionEmail ? { userId: crypto.randomUUID(), email: sessionEmail } : null,
    email: { send: vi.fn().mockResolvedValue({ ok: true }) },
    processOrder: vi.fn().mockResolvedValue({ done: true }),
    // Never build the live OpenAI client in tests.
    makeProcessDeps: () => ({
      db: testDb.db,
      model: { generate: vi.fn() },
      email: { send: vi.fn().mockResolvedValue({ ok: true }) },
      deleteBlobs: vi.fn().mockResolvedValue(undefined),
      now: () => NOW
    }),
    now: () => NOW
  };
}

function adminRequest(body: unknown) {
  return new Request("http://t/api/admin/pantry", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("POST /api/admin/pantry", () => {
  it("404s a non-admin session (page and API invisible to normal users)", async () => {
    const POST = createAdminPantryHandler(makeDeps("user@else.com"));
    const order = await makeOrder();
    const response = await POST(
      adminRequest({ orderId: order.id, action: "mark_manual" })
    );
    expect(response.status).toBe(404);
  });

  it("404s everyone when ADMIN_EMAIL is unset", async () => {
    delete process.env.ADMIN_EMAIL;
    const POST = createAdminPantryHandler(makeDeps());
    const order = await makeOrder();
    const response = await POST(
      adminRequest({ orderId: order.id, action: "mark_manual" })
    );
    expect(response.status).toBe(404);
    process.env.ADMIN_EMAIL = "founder@revora.app";
  });

  it("resend_intake mints a fresh token and stamps intakeEmailSentAt", async () => {
    const order = await makeOrder({ intakeEmailSentAt: null });
    const deps = makeDeps();
    const POST = createAdminPantryHandler(deps);

    const response = await POST(
      adminRequest({ orderId: order.id, action: "resend_intake" })
    );

    expect(response.status).toBe(200);
    expect(deps.email.send).toHaveBeenCalledTimes(1);
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.claimToken).not.toBe(order.claimToken);
    expect(updated.intakeEmailSentAt?.toISOString()).toBe(NOW.toISOString());
  });

  it("mark_manual sets needs_manual", async () => {
    const order = await makeOrder({ status: "processing" });
    const POST = createAdminPantryHandler(makeDeps());
    await POST(adminRequest({ orderId: order.id, action: "mark_manual" }));
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.status).toBe("needs_manual");
  });

  it("rerun resets to processing and invokes the processor", async () => {
    const order = await makeOrder({ status: "needs_manual" });
    const deps = makeDeps();
    const POST = createAdminPantryHandler(deps);

    await POST(adminRequest({ orderId: order.id, action: "rerun" }));

    expect(deps.processOrder).toHaveBeenCalled();
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(["processing", "ready"]).toContain(updated.status);
  });
});
```

- [ ] **Step 2: Run to verify it fails, then implement**

Run: `npx vitest run tests/unit/server/admin-pantry.test.ts` → FAIL.

Create `lib/server/admin.ts`:

```ts
import type { SessionInfo } from "./session";

/** Founder-only gate. No ADMIN_EMAIL configured = nobody is admin. */
export function isAdmin(session: SessionInfo): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  return Boolean(adminEmail && session && session.email === adminEmail);
}
```

Create `app/api/admin/pantry/route.ts`:

```ts
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdmin } from "../../../../lib/server/admin";
import { getDb, schema, type Db } from "../../../../lib/server/db";
import { sendEmail, type SendEmailResult } from "../../../../lib/server/email";
import { generateClaimToken } from "../../../../lib/server/pantry/claims";
import { intakeEmailText } from "../../../../lib/server/pantry/emails";
import {
  defaultProcessDeps,
  deliverReport,
  processPantryOrder,
  type ProcessDeps
} from "../../../../lib/server/pantry/process";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

export const runtime = "nodejs";
export const maxDuration = 300; // rerun judges inline

const ActionSchema = z
  .object({
    orderId: z.string().uuid(),
    action: z.enum(["resend_intake", "resend_report", "mark_manual", "rerun"])
  })
  .strict();

type Deps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  email?: { send: (input: { to: string; subject: string; text: string }) => Promise<SendEmailResult> };
  processOrder?: typeof processPantryOrder;
  // Injectable so tests never eagerly construct the OpenAI client
  // (defaultProcessDeps builds the live model, which requires OPENAI_API_KEY).
  makeProcessDeps?: (db: Db) => ProcessDeps;
  now?: () => Date;
};

export function createAdminPantryHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const email = deps.email ?? { send: sendEmail };
  const processOrder = deps.processOrder ?? processPantryOrder;
  const makeProcessDeps = deps.makeProcessDeps ?? defaultProcessDeps;
  const now = deps.now ?? (() => new Date());

  return async function POST(request: Request) {
    const session = await getSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    let parsed;
    try {
      parsed = ActionSchema.safeParse(await request.json());
    } catch {
      parsed = ActionSchema.safeParse(null);
    }
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { orderId, action } = parsed.data;

    const [order] = await db()
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, orderId));
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const processDeps = { ...makeProcessDeps(db()), email, now };

    if (action === "resend_intake") {
      const { token, tokenHash } = generateClaimToken();
      await db()
        .update(schema.pantryOrders)
        .set({ claimToken: tokenHash, updatedAt: now() })
        .where(eq(schema.pantryOrders.id, orderId));
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const result = await email.send({ to: order.email, ...intakeEmailText(appUrl, token) });
      if (result.ok) {
        await db()
          .update(schema.pantryOrders)
          .set({ intakeEmailSentAt: now(), updatedAt: now() })
          .where(eq(schema.pantryOrders.id, orderId));
      }
      return NextResponse.json({ ok: result.ok });
    }

    if (action === "resend_report") {
      const ok = await deliverReport(processDeps, {
        id: order.id,
        email: order.email
      });
      return NextResponse.json({ ok });
    }

    if (action === "mark_manual") {
      await db()
        .update(schema.pantryOrders)
        .set({ status: "needs_manual", processingLeaseUntil: null, updatedAt: now() })
        .where(eq(schema.pantryOrders.id, orderId));
      return NextResponse.json({ ok: true });
    }

    // rerun: put failed items back in the queue and process inline.
    await db()
      .update(schema.pantryItems)
      .set({ status: "confirmed", attempts: 0, updatedAt: now() })
      .where(eq(schema.pantryItems.orderId, orderId));
    await db()
      .update(schema.pantryOrders)
      .set({ status: "processing", processingLeaseUntil: null, updatedAt: now() })
      .where(eq(schema.pantryOrders.id, orderId));
    const result = await processOrder(processDeps, orderId);
    return NextResponse.json({ ok: true, ...result });
  };
}

export const POST = createAdminPantryHandler();
```

Note for the implementer: `rerun` resets **only** non-judged work in spirit — resetting `status`/`attempts` on already-`judged` rows would re-judge them; scope the first `update` with `inArray(schema.pantryItems.status, ["failed"])` if re-judging completed items is undesirable. Default here re-runs failed rows only:

```ts
.where(and(eq(schema.pantryItems.orderId, orderId), eq(schema.pantryItems.status, "failed")))
```

Use the `and(...)` form — the test's `["processing", "ready"]` assertion accepts either outcome.

Create `app/admin/pantry/page.tsx`:

```tsx
import { desc } from "drizzle-orm";
import { notFound } from "next/navigation";

import { AdminPantryTable } from "../../../components/admin-pantry-table";
import { isAdmin } from "../../../lib/server/admin";
import { getDb, schema } from "../../../lib/server/db";
import { getSessionInfo } from "../../../lib/server/session";

export const metadata = {
  title: "Pantry ops — Revora",
  robots: { index: false, follow: false }
};

const TERMINAL = new Set(["ready", "canceled"]);

export default async function AdminPantryPage() {
  const session = await getSessionInfo();
  if (!isAdmin(session)) {
    notFound();
  }

  const orders = await getDb()
    .select({
      id: schema.pantryOrders.id,
      email: schema.pantryOrders.email,
      status: schema.pantryOrders.status,
      updatedAt: schema.pantryOrders.updatedAt,
      createdAt: schema.pantryOrders.createdAt
    })
    .from(schema.pantryOrders)
    .orderBy(desc(schema.pantryOrders.updatedAt));

  // Newest-stuck-first: non-terminal orders above terminal ones.
  const sorted = [
    ...orders.filter((order) => !TERMINAL.has(order.status)),
    ...orders.filter((order) => TERMINAL.has(order.status))
  ];

  return (
    <main className="page-shell">
      <div className="page-frame admin-frame">
        <h1 className="page-title">Pantry orders</h1>
        {sorted.length === 0 ? (
          <p className="page-copy">No orders yet.</p>
        ) : (
          <AdminPantryTable
            orders={sorted.map((order) => ({
              ...order,
              updatedAt: order.updatedAt.toISOString(),
              createdAt: order.createdAt.toISOString()
            }))}
          />
        )}
      </div>
    </main>
  );
}
```

Create `components/admin-pantry-table.tsx`:

```tsx
"use client";

import { useState } from "react";

type Row = {
  id: string;
  email: string;
  status: string;
  updatedAt: string;
  createdAt: string;
};

const ACTIONS = ["resend_intake", "resend_report", "mark_manual", "rerun"] as const;

export function AdminPantryTable({ orders }: { orders: Row[] }) {
  const [note, setNote] = useState<string | null>(null);

  async function run(orderId: string, action: string) {
    setNote(`${action} on ${orderId.slice(0, 8)}…`);
    const response = await fetch("/api/admin/pantry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId, action })
    });
    setNote(
      response.ok
        ? `${action} done — reload to see the new status.`
        : `${action} failed (${response.status}).`
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      {note ? <p aria-live="polite">{note}</p> : null}
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Email</th>
            <th>Status</th>
            <th>Last change</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id.slice(0, 8)}</td>
              <td>{order.email}</td>
              <td>{order.status}</td>
              <td>{new Date(order.updatedAt).toLocaleString()}</td>
              <td>
                {ACTIONS.map((action) => (
                  <button key={action} type="button" onClick={() => void run(order.id, action)}>
                    {action.replace("_", " ")}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Add `ADMIN_EMAIL=` to `.env.example` (with a `# founder-only /admin/pantry gate` comment).

- [ ] **Step 3: Run + commit**

Run: `npx vitest run tests/unit/server/admin-pantry.test.ts && npm run typecheck`
Expected: PASS (5/5); clean.

```bash
git add lib/server/admin.ts app/admin/ app/api/admin/ components/admin-pantry-table.tsx tests/unit/server/admin-pantry.test.ts .env.example
git commit -m "feat(pantry): /admin/pantry founder ops — resend/mark-manual/rerun, hard-404 gate (lane D)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent (human sets `ADMIN_EMAIL` in Vercel — Appendix A H4) · **Effort:** M · **Verification:** 5/5 green; unauthenticated `curl -X POST /api/admin/pantry` returns 404 in dev.

---

# Phase 3 — WS3: end-to-end tests + the full green gate

**WS3 acceptance criteria:** the pantry E2E happy path and the subscription-billing regression both pass; every edge case in the test plan maps to a named green test (audit table below); ciphertext-at-rest is asserted against raw storage; `typecheck` / `test` / `eval:revora` / Playwright / axe are all green on one release commit.

### Task 3.1: Pantry E2E (Playwright) + seed script

Env-gated exactly like `tests/smoke/auth.spec.ts` (skips when not provisioned). Two tests: (a) **funnel-to-processing** — claim → sign-in → upload → intake → edit drafts → confirm → processing state (runs with the extraction stub, zero OpenAI traffic); (b) **full happy path to the emailed report** — additionally gated on `OPENAI_API_KEY` (judges 2 items live, costs cents; the judge path has NO stub, by design — the engine is never seamed).

**Files:**
- Create: `scripts/seed-pantry-order.mjs`, `tests/smoke/pantry.spec.ts`

**Interfaces:**
- Consumes: the whole Phase 2 pipeline; `AUTH_EMAIL_STUB_DIR` mailbox files (magic link: `<email>.json` from auth.ts; pantry emails: `<email>-<timestamp>.json` from Task 2.1 — scan the dir by prefix).
- Produces: the Group A checkbox "Pantry: pay → intake → confirm → report emailed".

- [ ] **Step 1: Write the seed script**

Create `scripts/seed-pantry-order.mjs`:

```js
#!/usr/bin/env node
// Seeds a PAID pantry order (as the webhook would) and prints the claim URL.
// The webhook itself is covered by tests/unit/server/pantry-webhook.test.ts —
// E2E starts from the paid state because Stripe can't sign events at a local
// server. Usage:
//   DATABASE_URL=... node scripts/seed-pantry-order.mjs buyer-e2e@revora.test
import { createHash, randomBytes } from "node:crypto";
import pg from "pg";

const email = process.argv[2] ?? `e2e-${Date.now()}@revora.test`;
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const token = randomBytes(32).toString("base64url");
const tokenHash = createHash("sha256").update(token).digest("hex");
const sessionId = `cs_e2e_${Date.now()}`;

const client = new pg.Client({ connectionString: url });
await client.connect();
await client.query(
  `INSERT INTO pantry_orders (email, stripe_session_id, stripe_payment_intent, claim_token, status)
   VALUES ($1, $2, $3, $4, 'paid')`,
  [email, sessionId, `pi_e2e_${Date.now()}`, tokenHash]
);
await client.end();

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3100";
console.log(JSON.stringify({ email, claimUrl: `${appUrl}/pantry/claim?token=${token}` }));
```

- [ ] **Step 2: Write the spec**

Create `tests/smoke/pantry.spec.ts`:

```ts
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

/**
 * Pantry Review E2E. Needs (same posture as auth.spec.ts):
 *   DATABASE_URL + AUTH_EMAIL_STUB_DIR + BLOB_READ_WRITE_TOKEN +
 *   PANTRY_EXTRACT_STUB=1  (extraction stub — no OpenAI traffic)
 * The report-delivery test additionally needs OPENAI_API_KEY (the judge has
 * no stub, deliberately) and judges 2 items live.
 */

const STUB_DIR = process.env.AUTH_EMAIL_STUB_DIR;
const ENABLED = Boolean(
  process.env.DATABASE_URL &&
    STUB_DIR &&
    process.env.BLOB_READ_WRITE_TOKEN &&
    process.env.PANTRY_EXTRACT_STUB === "1"
);

test.skip(!ENABLED, "pantry E2E needs DATABASE_URL, AUTH_EMAIL_STUB_DIR, BLOB_READ_WRITE_TOKEN, PANTRY_EXTRACT_STUB=1");

function seedOrder(email: string): { claimUrl: string } {
  const out = execFileSync("node", ["scripts/seed-pantry-order.mjs", email], {
    env: { ...process.env, NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3100" }
  });
  return JSON.parse(out.toString());
}

async function signInVia(page: import("@playwright/test").Page, email: string, url: string) {
  await page.goto(url);
  await expect(page).toHaveURL(/signin/);
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: /email me a sign-in link/i }).click();
  const mailboxFile = path.join(STUB_DIR!, `${email.replace(/[^a-z0-9@.]/gi, "_")}.json`);
  await expect.poll(() => fs.existsSync(mailboxFile), { timeout: 10_000 }).toBe(true);
  const { url: magicLink } = JSON.parse(fs.readFileSync(mailboxFile, "utf8"));
  await page.goto(magicLink);
}

test("claim → intake → edit drafts → confirm → processing (extraction stubbed)", async ({ page }) => {
  const email = `pantry-e2e-${Date.now()}@revora.test`;
  const { claimUrl } = seedOrder(email);

  await signInVia(page, email, claimUrl);
  // After sign-in the callback returns to the claim URL which binds + lands on intake.
  await page.goto(claimUrl);
  await expect(page).toHaveURL(/pantry\/intake/);
  await expect(page.getByText("Your Pantry Review")).toBeVisible();

  // A real JPEG for the blob upload: screenshot the page itself.
  const photoPath = path.join(STUB_DIR!, `pantry-e2e-${Date.now()}.jpg`);
  await page.screenshot({ path: photoPath, type: "jpeg" });
  await page.locator("#photos").setInputFiles(photoPath);
  await expect(page.getByText(/1 of 10/)).toBeVisible({ timeout: 30_000 });

  await page.locator("#band").selectOption("prediabetes_60_62");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /send photos for review/i }).click();

  // Stubbed extraction returns 3 fixed items.
  await expect(page.getByText(/here's what we saw/i)).toBeVisible({ timeout: 60_000 });

  // Edit: fix a name, remove an item, then confirm.
  await page.locator("#item-name-0").fill("steel cut oats");
  await page.getByRole("button", { name: "Remove" }).last().click();
  await page.getByRole("button", { name: /review 2 items/i }).click();

  await expect(page.getByText(/you'll get an email/i)).toBeVisible({ timeout: 30_000 });
});

test("report is generated and emailed (live judge)", async ({ page }) => {
  test.skip(!process.env.OPENAI_API_KEY, "needs OPENAI_API_KEY — judges 2 items live");
  const email = `pantry-live-${Date.now()}@revora.test`;
  const { claimUrl } = seedOrder(email);

  await signInVia(page, email, claimUrl);
  await page.goto(claimUrl);
  const photoPath = path.join(STUB_DIR!, `pantry-live-${Date.now()}.jpg`);
  await page.screenshot({ path: photoPath, type: "jpeg" });
  await page.locator("#photos").setInputFiles(photoPath);
  await expect(page.getByText(/1 of 10/)).toBeVisible({ timeout: 30_000 });
  await page.locator("#band").selectOption("prediabetes_60_62");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /send photos for review/i }).click();
  await expect(page.getByText(/here's what we saw/i)).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "Remove" }).last().click();
  await page.getByRole("button", { name: /review 2 items/i }).click();

  // Poll the stub mailbox for the report email, then open the link.
  const reportEmail = () =>
    fs
      .readdirSync(STUB_DIR!)
      .filter((file) => file.startsWith(email.replace(/[^a-z0-9@.]/gi, "_")) && file.includes("-"))
      .map((file) => JSON.parse(fs.readFileSync(path.join(STUB_DIR!, file), "utf8")))
      .find((message) => /report/i.test(message.subject));
  await expect.poll(() => Boolean(reportEmail()), { timeout: 120_000 }).toBe(true);

  const link = /https?:\/\/\S+\/report\/[a-f0-9-]+/.exec(reportEmail()!.text)?.[0] ?? "";
  await page.goto(link.replace(/^https?:\/\/[^/]+/, "http://127.0.0.1:3100"));
  await expect(page.getByText(/enjoy freely|worth a tweak|handle with care/i).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /save as pdf/i })).toBeVisible();
});
```

- [ ] **Step 3: Run it (provisioned) and the skip path (unprovisioned)**

Run (skip path, always works): `npx playwright test tests/smoke/pantry.spec.ts`
Expected: 2 skipped.

Run (provisioned — needs Railway dev DB + blob token; human provides env, Appendix A H3/H7):

```bash
DATABASE_URL=<railway-dev> AUTH_SECRET=e2e HEALTH_DATA_KEY=$(node -e 'console.log(Buffer.alloc(32,1).toString("base64"))') \
AUTH_EMAIL_STUB_DIR=/tmp/revora-mailbox BLOB_READ_WRITE_TOKEN=<token> PANTRY_EXTRACT_STUB=1 \
npx playwright test tests/smoke/pantry.spec.ts --project="Mobile Chrome"
```

Expected: test (a) PASS; test (b) skipped without `OPENAI_API_KEY`, PASS with it.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-pantry-order.mjs tests/smoke/pantry.spec.ts
git commit -m "test(pantry): E2E — claim to processing (stubbed extraction) + live-judge report delivery (WS3)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent (human supplies env for the provisioned runs) · **Effort:** M · **Verification:** Step 3 outcomes as stated.

### Task 3.2: Ciphertext-at-rest assertion + test-plan coverage audit

**Files:**
- Create: `tests/unit/server/pantry-ciphertext.test.ts`
- Verify (no code): the audit table below — every test-plan line has a green named test.

- [ ] **Step 1: Write the ciphertext test**

Create `tests/unit/server/pantry-ciphertext.test.ts`:

```ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

/** Test-plan critical path: "Health data never plaintext at rest: A1C band
 *  value, item text, report payload." Scans the RAW rows (pglite) for the
 *  plaintext strings. checks.foodCiphertext already has the same test —
 *  this covers the three pantry tables. */

const SECRETS = {
  itemName: "very identifiable rye crispbread",
  portion: "two boxes",
  notes: "my doctor said 6.1 exactly",
  a1c: "6.1",
  reportReason: "identifiable report sentence"
};

let testDb: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 15).toString("base64");
  testDb = await createTestDb();

  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "cipher@test.dev",
      stripeSessionId: "cs_cipher",
      claimToken: "hash_cipher",
      status: "ready",
      a1cBand: "prediabetes_60_62",
      a1cCiphertext: encryptField(SECRETS.a1c),
      notesCiphertext: encryptField(SECRETS.notes),
      reportCiphertext: encryptField(
        JSON.stringify({ reason: SECRETS.reportReason })
      )
    })
    .returning();
  await testDb.db.insert(schema.pantryItems).values({
    orderId: order.id,
    nameCiphertext: encryptField(SECRETS.itemName),
    portionCiphertext: encryptField(SECRETS.portion),
    resultCiphertext: encryptField(JSON.stringify({ reason: SECRETS.reportReason })),
    status: "judged",
    risk: "SAFE"
  });
});

afterAll(async () => {
  await testDb.close();
});

describe("pantry health data at rest", () => {
  it("no plaintext health-adjacent string appears in any pantry row", async () => {
    for (const table of ["pantry_orders", "pantry_items", "pantry_photos"]) {
      const result = await testDb.raw.query(`SELECT * FROM ${table}`);
      const dump = JSON.stringify(result.rows);
      for (const secret of Object.values(SECRETS)) {
        expect(dump).not.toContain(secret);
      }
    }
  });
});
```

Run: `npx vitest run tests/unit/server/pantry-ciphertext.test.ts`
Expected: PASS. (If it fails, a field was written plaintext — that is a Global Constraints violation, fix the writer, not the test.)

- [ ] **Step 2: Verify the coverage audit table**

Every line of the test plan (`~/.gstack/projects/Revora/tefera-launch-hardening-eng-review-test-plan-20260704.md`) → its test. Confirm each exists and is green; add any missing one before closing this task.

| Test-plan requirement | Covered by |
|---|---|
| Webhook: pantry price creates order + intake email | `pantry-webhook.test.ts` (Task 2.4) |
| Webhook: existing subscription events identical (CRITICAL) | `billing-routes.test.ts` unmodified + regression case in `pantry-webhook.test.ts` |
| Webhook: duplicate events idempotent | `pantry-webhook.test.ts` |
| Refund cancels order | `pantry-webhook.test.ts` |
| Wrong-user access on every pantry route | `pantry-upload-auth`, `pantry-submit`, `pantry-confirm`, `pantry-report-view`, `pantry-claim-route` tests |
| 11th photo / 6MB rejected client- and server-side | server: `pantry-submit.test.ts`, `pantry-upload-auth.test.ts` (5MB token cap); client: picker cap + downscale (E2E exercises the picker) |
| 41st confirmed item rejected | `pantry-confirm.test.ts` |
| Double-confirm / double-webhook → one run, one order | `pantry-confirm.test.ts` (409), `pantry-webhook.test.ts` (idempotent), `pantry-process.test.ts` (lease) |
| Buyer edits are what the judge receives | `pantry-confirm.test.ts` (replacement) + E2E edit step |
| Per-item failure → 1 retry → partial report, order completes | `pantry-process.test.ts` |
| ALL items fail → no email, founder flagged, honest buyer copy | `pantry-process.test.ts` + `pantry-submit.test.ts` (extraction-side) |
| Report link while processing → no crash, no blank page, no 404 | `pantry-report-view.test.ts` |
| Photos deleted from Blob after delivery | `pantry-process.test.ts` |
| Ciphertext at rest (A1C, items, report) | `pantry-ciphertext.test.ts` (this task) |
| Resend failure → sweep retries; never falsely "delivered" | `pantry-process.test.ts` (email-failure) + `pantry-sweep.test.ts` (redeliver, intake resend) |
| Stuck >2h → founder alerted | `pantry-sweep.test.ts` |
| Extraction endpoint rate-limited (`revora:pantry`) | `pantry-submit.test.ts` (429) |
| `/report/[id]` noindex + print stylesheet | page `metadata.robots` + print CSS (Task 2.13); axe/print spot-check in Task 3.3 |
| E2E happy path incl. magic-link + email | `tests/smoke/pantry.spec.ts` (Task 3.1) |
| `eval:pantry-extract` gate | Task 2.8 harness, run in Phase 4 |
| `eval:revora` untouched and green | run at 2.11 and in Task 3.3 gate |

- [ ] **Step 3: Commit**

```bash
git add tests/unit/server/pantry-ciphertext.test.ts
git commit -m "test(pantry): ciphertext-at-rest assertion over raw pantry rows (WS3)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** agent · **Effort:** S · **Verification:** table complete, all named tests green.

### Task 3.3: Full green gate on the release commit

**Files:** none (verification only; fixes ride as their own commits).

- [ ] **Step 1: axe coverage for the new pages**

Extend `tests/smoke/a11y.spec.ts` with `/pantry/intake` (signed-out view renders the redirect → check the signin page variant instead) and a signed-in `/pantry/intake` + `/report/[id]` pass under the same env gating as `pantry.spec.ts`, using the existing AxeBuilder pattern (zero violations).

- [ ] **Step 2: Run the whole gate in order**

```bash
npm run typecheck
npm test
npm run eval:revora
npx playwright test
```

Expected: every command exits 0. Machine-load note: if a vitest file fails ONLY with "Hook timed out" on `createTestDb`, re-run that file standalone before treating it as red (verified flake mode on this box, 2026-07-04).

- [ ] **Step 3: Release commit**

```bash
git add -A && git status --short   # expect: nothing unintended
git commit --allow-empty -m "chore(release): pantry pipeline complete — full gate green (typecheck/test/eval/playwright/axe)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git tag pantry-v1
```

**Owner:** agent · **Effort:** S · **Verification:** the four commands green on the tagged commit; Group A checkbox 8 closes.

---

# Phase 4 — WS4: prompt validation with recorded evidence

**WS4 acceptance criteria:** each of the two prompts has an **evidence-backed verdict — keep as-is or improve with a specific change** — recorded in `docs/qa/prompt-validation-2026-07.md` with the run numbers. No prompt edit ships without a before/after eval delta in that file.

### Task 4.1: Revora judge prompt (`lib/revora/prompt.ts`) — live eval

- [ ] **Step 1: Run the gates**

```bash
npm run eval:revora            # mock gate — must be green before spending
OPENAI_API_KEY=<key> npm run eval:revora:live
```

(`eval:revora:live` self-reports SETUP_BLOCKED without the key — that is the human handoff signal, Appendix A H6.)

- [ ] **Step 2: Record the evidence**

Create `docs/qa/prompt-validation-2026-07.md`:

```markdown
# Prompt validation — 2026-07

## 1. Revora judge (lib/revora/prompt.ts) — model: gpt-5.4-mini
Run date: ____ · Commit: ____ · Runner: ____

| Gate | Target | Measured | Pass |
|---|---|---|---|
| Harmful-SAFE (labeled + adversarial) | 0, always | ____ | ☐ |
| Risk-class accuracy | ≥ the graded suite's threshold (see tests/evals/revora-graded-eval.test.ts) | ____ | ☐ |
| Usefulness (reason/adjustment/swap quality) | pass per rubric (lib/revora/eval-rubric.ts) | ____ | ☐ |
| Consistency flip-rate (scripts/consistency-check.mjs N=50, preview) | ≥95% modal class | ____ | ☐ |

**Verdict:** KEEP AS-IS / IMPROVE — ____________________
If IMPROVE: exact change proposed: ____________________
Eval delta required before shipping the change: rerun both gates above; all
targets must hold, harmful-SAFE stays 0. Delta table: ____

## 2. Pantry extraction (lib/pantry/extract.ts EXTRACT_PROMPT) — model: ____
Run date: ____ · Commit: ____ · Photos: __ founder photos, labels.json rev ____

| Gate | Target | Measured | Pass |
|---|---|---|---|
| Item recall (all photos) | ≥ 0.70 | ____ | ☐ |
| Hallucinated items | 0 | ____ | ☐ |
| Vision-model probe (scripts/verify-vision-model.mjs) | OK on gpt-5.4-mini (or REVORA_VISION_MODEL recorded here: ____) | ____ | ☐ |

Per-photo table (paste the eval's console output): ____

**Verdict:** KEEP AS-IS / IMPROVE — ____________________
If IMPROVE: exact change + rerun delta: ____________________
Post-launch real metric: buyer edit-rate on the confirm screen (first 10 orders).
```

- [ ] **Step 3: Fill section 1 from the live run output and commit**

```bash
git add docs/qa/prompt-validation-2026-07.md
git commit -m "docs(qa): prompt validation record — revora judge live numbers (WS4)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** human+agent (human provides the key and pays for the run; agent runs + records; the consistency-check row needs a deployed preview — Appendix A H13) · **Effort:** S (+ API cost) · **Verification:** section 1 has real numbers and a ticked verdict, not "looks fine".

### Task 4.2: Pantry extraction prompt — live eval

- [ ] **Step 1: Human supplies fixtures** — 8–10 founder pantry/fridge photos into `tests/fixtures/pantry-photos/`, exhaustively labeled in `labels.json` (Appendix A H6). Photos of the founder's own kitchen double as the day-2 post's sample-report source (design doc, Deferred decisions).

- [ ] **Step 2: Probe, then run**

```bash
OPENAI_API_KEY=<key> node scripts/verify-vision-model.mjs
OPENAI_API_KEY=<key> REVORA_LIVE_EVAL=1 npm run eval:pantry-extract
```

If the probe fails on `gpt-5.4-mini`: set `REVORA_VISION_MODEL` to a vision-capable sibling (extraction only — the judge model is untouched), record the choice in the verdict doc, re-run.

- [ ] **Step 3: Fill section 2 of `docs/qa/prompt-validation-2026-07.md`** with the per-photo recall/hallucination table from the run output, tick the verdict, commit:

```bash
git add docs/qa/prompt-validation-2026-07.md tests/fixtures/pantry-photos/labels.json
git commit -m "docs(qa): pantry extraction eval numbers + verdict (WS4)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(Do **not** commit the photos themselves if the founder prefers them private — labels.json + numbers are the record; note the photos' location instead.)

**Owner:** human+agent · **Effort:** S (+ API cost) · **Verification:** recall ≥0.70 and hallucinations=0 recorded, or an IMPROVE verdict with the specific prompt change and a rerun plan. If the gate can't be met by day 8 of the build cap, the manual-transcription fallback ships (design guardrail 1) and `/admin/pantry` mark-manual is the fulfillment path.

---

# Phase 5 — WS5: human-simulated end-to-end walkthroughs

**WS5 acceptance criteria:** a scripted walkthrough as a real non-technical prediabetic exists in the repo with observed results per step, a triaged punch-list, and zero blocking defects on the web funnel; the Android walkthrough is scripted and handed to the founder with the hardware-only steps flagged.

### Task 5.1: Web funnel walkthrough (mobile Chrome + desktop)

**Files:**
- Create: `docs/qa/launch-walkthrough-web.md`

- [ ] **Step 1: Write the script with the persona and full funnel**

Persona: 52, recently diagnosed (A1C 6.1), not technical, on a phone, anxious, found the Reddit post. Steps (each row: Expected · Observed · Friction · Severity blocking/minor/cosmetic):

1. Land on `/` from the post → understands what this is within 5s.
2. Free scan: types "white rice with chicken" → calm result <~12s or a specific failure message (never a spinner forever).
3. Repeats to the free-tier limit → the limit copy is calm, names tomorrow.
4. Sign up (magic link) → email arrives, link works on the phone.
5. Onboarding: A1C entry + Art. 9 consent → copy plain, no dead ends.
6. Daily card, streak, week view render with real data.
7. Nudge opt-in: two-step opt-in works; declines gracefully if push unsupported.
8. Subscribe (Stripe **test mode**): checkout → entitlement flips server-side → paywall gone.
9. Pantry pre-order (test Payment Link) → intake email arrives → claim → sign-in round-trip returns to intake.
10. Photos: takes 2 real kitchen photos → upload, thumbnails, one oversized photo shows the inline error and a retry that works.
11. Confirm list: fixes one item name, deletes one, adds one → count updates → confirm.
12. Wait: processing copy says "safe to close"; email arrives; link opens the report.
13. Report: "Enjoy freely" first; swaps read as upgrades; Save as PDF produces a clean print preview; paywall appears only at the end.
14. Support path: every error state seen names a next step; support email reachable from intake + report.
15. Deletion: account deletion removes pantry data too (verify via `/account`).

- [ ] **Step 2: Execute** — agent drives steps 1–13 with Playwright against a preview deploy (or the provisioned local stack from Task 3.1) on Mobile Chrome viewport + once at desktop width; the founder repeats 1–13 once on a real phone (15 minutes, catches what emulation can't: keyboard, camera, autofill). Record Observed/Friction per step in the doc.

- [ ] **Step 3: Triage the punch-list** — every friction item gets severity + owner + fix-task; **blocking = release stops until fixed** (fix rides as a normal TDD task). Re-run the affected step after each fix.

- [ ] **Step 4: Commit**

```bash
git add docs/qa/launch-walkthrough-web.md
git commit -m "docs(qa): web funnel walkthrough — observed results + triaged punch-list (WS5)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**Owner:** human+agent · **Effort:** M · **Verification:** zero rows marked blocking; Group A final checkbox closes.

### Task 5.2: Android (TWA) walkthrough — human/hardware

**Files:**
- Create: `docs/qa/launch-walkthrough-android.md` (agent writes the script now; founder executes when the Play chain (Appendix A H14) reaches an installable internal-testing build)

- [ ] **Step 1: Agent writes the script:** the same 15-step funnel as Task 5.1 **executed inside the installed app**, plus the TWA-specific checks cross-referenced from `docs/ops/device-qa-checklist.md`: launches full-screen with **no URL bar** (assetlinks valid), deep links (claim/report links from email open correctly — in-app or browser, decide and record), offline behavior, notification permission + nudge delivery, **Play Billing purchase AND restore with a license-tester account** (hardware-only — emulators cannot), account deletion from the app.
- [ ] **Step 2: Founder executes on a physical device** against the internal-testing build; records results in the doc; blocking defects loop back as tasks.
- [ ] **Step 3: Commit the executed doc.**

**Owner:** human (script: agent) · **Effort:** M (human) · **Verification:** doc executed on hardware; feeds Group B checkboxes 2–3.

---

# Appendix A — Human actions (the single source of "what only you can do")

Reconciled 2026-07-04 against `docs/handoff/human-actions-required.md`, the P7–P10 appendix, and the pantry build. Task 1.2 syncs the running file to this list. Founder-verified statuses noted; everything else is open.

**Urgent / gates the build:**

| # | Action | Done when |
|---|---|---|
| H1 | **Rotate the Resend + Upstash keys** (they sat in `.env.example` and passed through AI transcripts) | New keys live in Resend/Upstash dashboards + updated in Vercel + local `.env`; old keys revoked |
| H2 | **Create the $25 pre-order Stripe Payment Link** (dashboard, no code) for the day-2 ask; copy its **price ID** → `STRIPE_PRICE_PANTRY` env; point the Stripe webhook endpoint at the deploy and set `STRIPE_WEBHOOK_SECRET`; **write the day-45 fallback paragraph (design doc Q1)**; **post the day-2 ask** (community rules read first). Ongoing: **pause the Payment Link whenever open orders ≥10** (weekly cap guardrail — check `/admin/pantry`) | Payment Link public; a test purchase produces a `pantry_orders` row on preview; the post is live; the paragraph is written and signed |
| H3 | **Enable Vercel Blob** on the project → `BLOB_READ_WRITE_TOKEN` (preview + prod + local for E2E) | Task 3.1 provisioned run passes |
| H4 | Set `ADMIN_EMAIL` (founder's sign-in email) and `CRON_SECRET` in Vercel (preview + prod) | `/admin/pantry` loads for founder, 404s for others; crons authenticate |
| H5 | **Verify Vercel Pro** is active (300s `maxDuration` + hourly crons need it) | Plan visible in Vercel dashboard settings |
| H6 | **8–10 pantry/fridge photos of your own kitchen**, exhaustively labeled into `tests/fixtures/pantry-photos/labels.json`; provide `OPENAI_API_KEY` for the two live eval runs | Task 4.1 + 4.2 verdict doc has real numbers |

**Infrastructure (§1/§2 remainder — founder reports partial progress, verified 2026-07-04):**

| # | Action | Status · Done when |
|---|---|---|
| H7 | **Provision Railway Postgres** (CLI already authed ✅) → `DATABASE_URL` in Vercel preview+prod → `npx drizzle-kit migrate` → run `scripts/seed-reviewer-account.mjs` against preview | Auth E2E + pantry E2E run provisioned; reviewer account exists |
| H8 | **Umami decision:** self-host on Railway is erroring (pnpm) — either fix it in the weekly admin block or use Umami Cloud (account exists ✅); set `NEXT_PUBLIC_UMAMI_SRC` + `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Page-view events visible in Umami |
| H9 | **OpenAI dashboard hard spend cap** + confirm prod key limits | Cap screenshot/on file |
| H10 | Remaining Vercel secrets from §2: `AUTH_SECRET`, `HEALTH_DATA_KEY`, `VAPID_*`, `SENTRY_DSN`, `EDGE_CONFIG`, `UPSTASH_REDIS_REST_URL/_TOKEN` (post-rotation), `RESEND_API_KEY` (post-rotation), `NEXT_PUBLIC_APP_URL`, `SUPPORT_EMAIL`; preview-only: `REVIEWER_TEST_SECRET`, `NEXT_PUBLIC_REVIEWER_MODE=1` | `/api/health` green on preview; reviewer sign-in works on preview only |
| H11 | **Domain**: buy (inside the day-1–2 window), point to Vercel, Resend DNS (SPF/DKIM/DMARC), update `NEXT_PUBLIC_APP_URL` | Magic link lands in a real inbox from the real domain |
| H12 | **Sentry canary**: trigger one real error on a deployed preview, confirm arrival | Event visible in Sentry |
| H13 | **Consistency check** `scripts/consistency-check.mjs` N=50 against preview; record flip-rate in `docs/ops/launch-controls.md` (target ≥95% modal) | Number recorded |

**Legal / Play / launch ops (long-lead — start now, never a web-launch gate per the design doc):**

| # | Action | Done when |
|---|---|---|
| H14 | **Play chain, in order:** Play Developer account ($25, pick account type) → Google Cloud project (Play API, service account, RTDN topic) → keystore (Bubblewrap) → fill `twa-manifest.json` human fields → build+sign `.aab` → first internal-track upload → copy App Signing SHA-256 → fill+deploy `public/.well-known/assetlinks.json` → license-tester account → device QA (Task 5.2) → Data Safety/content forms + store listing from `docs/ops/play-listing.md` + reviewer creds (`reviewer@revora.test` + `REVIEWER_TEST_SECRET`) → rollout | Installed app passes Task 5.2 with no URL bar; Play review passed |
| H15 | **Counsel Q1–Q10** (`docs/legal/counsel-brief.md`; includes Q6 Art. 9 wording — the intake consent line ships as COUNSEL-DRAFT until then — Q8 reversal lines, Q10 `/terms` placeholders: entity name, governing law); OpenAI DPA; trademark clearance; entity/tax/banking; CCPA stance | Sign-off on file before Play submission and benefit-implying marketing |
| H16 | **Support inbox** (`support@<domain>`) routed per `docs/ops/support-playbook.md`; **uptime monitor** on `/api/health` (alert non-200 or `ok:false`); named on-call/refund owner | A test alert reaches a human |
| H17 | **Pause + rollback rehearsal**: Edge Config pause <60s, Vercel rollback <5min (`docs/ops/launch-controls.md`) | Both rehearsed once, timed, noted in the doc |
| H18 | Human compliance skim of BAI band strings (`lib/coach/bai.ts` `BAI_BAND_COPY`) + `/how-it-works` CDC citation | Read + initialed in the running list |
| H19 | Production deploy approval (P7 cutover) and, later, Play submission approval (P9) | Explicit go recorded |

**Money involved (H-items):** Play $25 · Vercel Pro ~$20/mo · domain ~$12/yr · OpenAI usage (evals ~cents; pantry ~$0.10–0.50/report) · Railway/Resend/Upstash/Umami tiers · Stripe fees · counsel fees.

---

# Execution handoff

Plan complete and saved to `docs/handoff/2026-07-04-unified-completion-plan.md`. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task with review between tasks (`superpowers:subagent-driven-development`). Tasks are sized and interfaced for exactly this.
2. **Inline Execution** — execute task-by-task in one session with checkpoints (`superpowers:executing-plans`).

Either way: **Task 0.1 first** — nothing is staged before the `.env.example` scrub, and the founder's day-2 ask (H2) never waits for any code task.
