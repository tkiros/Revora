# Session Handoff — Pantry Review Pipeline (Strategy → Reviews → Build Started)

**Date:** 2026-07-04 · **Branch:** `launch-hardening` · **HEAD at session:** `e37cf3e`
**Use as:** opening prompt/context for the next session. Read this file, then continue at "NEXT TASKS".

---

## 1. Strategic context (decided this session, do not relitigate)

Founder situation: <2 months runway, family dependent, debt. Employment/contract income **ruled out by founder** ("projects only", on record). Goal: first revenue + income visibility inside 45 days.

**Portfolio triage (office-hours session, all premises founder-approved):**
- **Revora = the only active project.**
- **bcb (trading bot, ~/Desktop/bcb): FROZEN**, not killed. 0 hours until Revora produces surplus.
- **Vendoval (~/Desktop/Vendoval): FROZEN until the first paid Stripe transaction**, then unlocks as timeboxed side project.

**The product being launched:** a **$49 one-time "Pantry Review" report** ($25 for first 10 pre-orders) as the front door, with the $12.99/mo app subscription alongside. Buyer pays via Stripe Payment Link → uploads pantry/meal photos → vision AI drafts an item list → **buyer confirms/edits the list** → each confirmed item runs through the existing safety-evaluated text engine → HTML report emailed.

**Non-negotiable guardrails (approved design doc):**
- **Day-2 first public ask** (Reddit/FB post w/ real scan demo + $25 pre-order Stripe Payment Link — dashboard link, no code needed). Selling never waits for the build.
- **8-day hard build cap** (amended from 3 after eng review found no photo engine exists). Whatever exists on day 9 ships; vision gaps → founder transcribes photos manually into the text engine (buyer can't tell).
- 10 asks/day distribution quota from day 2; communities only days 1–10; max 2 channels ever.
- **Kill-criterion:** 100 asks, zero paid → rework offer (not the run).
- **Day-45 gate:** <$500 collected → execute the pre-written fallback paragraph. FINAL.
- Weekly order cap: pause Payment Link when open orders ≥10.
- Counsel/trademark/Play = 2h/week admin block, never gates.

## 2. Key artifacts (read these)

| Artifact | Path |
|---|---|
| **Approved design doc** (strategy, premises, guardrails, UI design spec, GSTACK review report) | `~/.gstack/projects/Revora/tefera-launch-hardening-design-20260704-082028.md` |
| **Test plan** (consumed by /qa; 20 gaps, 1 CRITICAL regression, 1 E2E, 1 eval) | `~/.gstack/projects/Revora/tefera-launch-hardening-eng-review-test-plan-20260704.md` |
| **DESIGN.md** (canonical design system — NEW this session) | `DESIGN.md` (repo root) |
| **TODOS.md** (2 captured: in-app photo-assist; billing multi-product refactor) | `TODOS.md` (repo root) |
| Human actions checklist (founder reports MOST ITEMS NOW DONE — verify which remain at session start) | `docs/handoff/human-actions-required.md` |

## 3. Review status (all at HEAD e37cf3e)

- **Eng review (plan): CLEAR.** 31 issues resolved, 0 unresolved, 0 critical gaps. Codex outside voice ran (18 findings; 14 folded, 2 tensions resolved by founder).
- **Design review: CLEAR.** 4/10 → 9/10. Full UI spec written into the design doc; DESIGN.md created.

**Locked build decisions (founder-approved — build exactly this):**
1. **Vision = extractor only, never judge** + **confirm-before-verdict**: vision drafts items; buyer edits/confirms; existing `checkFood()` path (`lib/revora/service.ts:32` + `postprocess.ts`) makes ALL health judgments. Safety evals stay valid.
2. **Report = tokenless account-gated HTML page** `/report/[id]` with print stylesheet; "Save as PDF" = `window.print()`. NO PDF library.
3. **Payment = Stripe Payment Link + webhook branch** in `applyStripeEvent` (`app/api/billing/handlers.ts:344`): pantry price ID → create `pantry_orders` row → email intake link. Idempotent on `stripe_session_id`; store `payment_intent` for refunds; `charge.refunded` → canceled.
4. **Buyers must sign in** (existing magic-link) — but order binding is via **signed claim token in the intake email** (NOT email equality; aliases/relays break equality).
5. **Intake collects A1C band + Art. 9 consent** (Codex catch — buyers have no profile; `checkFood` requires a1c). Use existing `COUNSEL-DRAFT` consent wording pattern.
6. **v1 report = deterministic template + per-item judged outputs. ZERO free-form LLM narrative** (would be un-evaled health-advice surface).
7. Report items **NEVER written to `checks`** (would corrupt streaks/BAI/insights) — separate `pantry_orders`/`pantry_items`/`pantry_photos` tables (done).
8. Caps: ≤10 photos/order, ≤5MB each, client-side downscale ~1600px, ≤40 confirmed items, extraction endpoint Upstash-limited (`revora:pantry` prefix). Photos deleted from Blob on delivery.
9. Processing: route `maxDuration=300`, sequential, per-item status + 1 retry, continue-on-failure, clean exit ~280s, **lease column** (`processing_lease_until`) + cron sweep resumes; stuck >2h → founder alerted.
10. `/admin/pantry` founder-only ops page: order list, statuses, resend intake/report, mark-manual, re-run.
11. Vision eval: 8–10 hand-labeled founder pantry photos, ≥70% recall, zero hallucinations (`eval:pantry-extract`); real metric post-launch = buyer edit-rate.
12. All UI assembled from existing vocabulary per DESIGN.md + the UI Design Spec in the design doc (states table, journey, a11y, print CSS). Near-zero new CSS. Report opens with "Enjoy freely" (permission-first).

**Codebase facts (verified — do not assume otherwise):**
- Engine is TEXT+A1C only: `gpt-5.4-mini` via OpenAI Responses API, strict JSON, 10s timeout, `MAX_MODEL_ATTEMPTS=1`. No vision code, no blob storage, no PDF lib, no generic email sender exists yet (Resend used only in NextAuth magic links via raw fetch, `auth.ts:62`).
- Tests: Vitest + pglite (`tests/helpers/test-db.ts` applies real migrations), DI handler-factory pattern (`createXHandler(deps)`), Playwright smoke in `tests/smoke/` (port 3100).

## 4. Build progress (Lane plan from eng review)

| Lane | Step | Status |
|---|---|---|
| A1 | **Schema + migration** — `pantry_orders`, `pantry_photos`, `pantry_items` in `lib/server/db/schema.ts`; migration `drizzle/0001_pantry-review.sql`; tests `tests/unit/server/pantry-schema.test.ts` | ✅ **DONE — 12/12 tests green** (6 new + 6 existing schema tests) |
| A2 | Webhook branch + claim tokens | ⬜ NEXT |
| E | `lib/server/email.ts` (~20-line raw-fetch Resend util) + privacy copy update (`app/privacy/page.tsx` must mention photos/vision/OpenAI) | ⬜ |
| B | `/pantry/intake` (claim → photos ≤10 via native `<input type="file" accept="image/*" capture="environment" multiple>` → A1C band + consent) → confirm screen (editable item list) | ⬜ |
| C | Vision extraction module (`lib/pantry/`) + `eval:pantry-extract` fixtures | ⬜ |
| D | `/report/[id]` + `/admin/pantry` | ⬜ |
| A3 | Batch processor (`/api/pantry/process`) + cron sweep | ⬜ last (needs C) |

**Vercel Blob (`@vercel/blob`) is NOT installed yet** — needed for Lane B. Handle HEIC/EXIF. Verify `gpt-5.4-mini` image-input support at build time; if unsupported, use a vision-capable sibling ONLY for extraction.

## 5. NEXT TASKS (in order)

1. **Scrub `.env.example`** — the working tree copy contains LIVE keys (`RESEND_API_KEY=re_3sDy...`, `UPSTASH_API_KEY=bab7...`). Replace with placeholders BEFORE any commit; founder must rotate both keys in Resend/Upstash dashboards (they also passed through AI transcripts). **Blocks any `git add`.**
2. **First commit** of completed work once .env.example is clean: schema + migration + test + DESIGN.md + TODOS.md (+ this handoff).
3. **Lane A2 — webhook branch:** new branch in `applyStripeEvent` for `checkout.session.completed` with `mode=payment` + pantry price ID (env `STRIPE_PRICE_PANTRY`): create order (idempotent on session id), generate claim token (32-byte, timing-safe lookup), send intake email via new email util. Handle `charge.refunded` → canceled. **IRON RULE: regression test that existing subscription events through the modified webhook behave IDENTICALLY** (extend `tests/unit/server/billing-routes.test.ts` pattern) + portal handler unaffected.
4. Continue lanes E → B → C → D → A3 per table above, tests alongside per the test plan artifact (every gap listed there must have a test when its code lands).
5. `vercel.json`: add sweep cron; new routes set `export const maxDuration` explicitly (Vercel Pro assumed — founder says account items largely done; verify).

## 6. Founder-owned items (outrank all code)

- **Day-2 Reddit/FB post** with real scan demo + $25 pre-order Payment Link (create in Stripe dashboard — zero code). Read community self-promo rules first. THE actual launch.
- **Write the day-45 fallback paragraph** (design doc Open Questions Q1) — one paragraph, concrete action + start date.
- Rotate Resend + Upstash keys.
- Founder reports most of `docs/handoff/human-actions-required.md` is now DONE (accounts, domain, etc.) — **next session: re-read that file, confirm exactly what remains open** (counsel sign-off, Play submission timing, secrets in Vercel, OpenAI spend cap) and update it.
- Note: founder HAS prediabetes (April design doc) — his own pantry is the sample report for the post; his aunt is buyer-zero for a dry run.

## 7. Session learnings already persisted (gstack)

`verify-design-doc-claims` (pitfall, 9/10) · `revora-engine-text-only` (architecture, 9/10) · `design-system-canonical` (architecture, 9/10) · `no-sync-sales-projects-only` (preference, 10/10) · `avoidance-tell` (pattern, 8/10 — watch for "removes the need for communication" as justification; counter: schedule the public ask BEFORE the build).
