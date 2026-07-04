# Session Handoff — Strategic Pivot (Coach-First), Marketing, Doc Alignment & Google Play Readiness

**Date:** 2026-06-29
**Branch:** launch-hardening
**Author:** previous session (strategy + codebase review)
**For:** the next session, which will execute Tasks 1–3 in Part 3

---

## ⚠️ READ THIS FIRST — three things that will trip you up

1. **A strategic direction was recommended but is NOT YET formally locked.** This session concluded Revora should reposition as an **honest, prediabetes-only daily "coach"** — with the **camera, CGM, and reversal-score (BAI) demoted to later/optional**, not hero features. This **conflicts with extensive existing PRD/brand docs** (`Revora_Brand_Positioning_v2.md`, `PRD/*`) that sell "point your camera at any meal" + the full reversal journey as core. **Before mass-editing any locked doc in Task 2, confirm with the user that the coach-first direction is the new source of truth.** Do not silently overwrite locked product decisions.

2. **The built app is far smaller than the PRD.** What exists is a **stateless, anonymous, text-input, single-shot food-risk checker** — no camera, no accounts, no database, no history (by deliberate design — it's a privacy selling point). Do not assume PRD features exist in code. See Part 1 → Current Status.

3. **Two inherited "facts" are wrong and must not be reintroduced anywhere:**
   - Prediabetes prevalence is **115.2M** (CDC 2026), **not 98M**.
   - **"First-mover" is REFUTED** — Glycemic Snap, LOGI, SNAQ, January AI already do photo→glycemic-load for prediabetics. Also drop the unverifiable "$8.81B→$15.1B TAM" and the unsourced "Cal AI 8–12% conversion." Corrected facts live in `docs/ICP.md` (evidence-basis header).

---

# PART 1 — Session Summary

## 1A. What we did (topics & decisions)

1. **Set up tooling:** authenticated Vercel CLI (user `tkiros`, team `tkiros-projects`); installed **crawl4ai 0.9.0 globally via pipx** (`~/.local/share/pipx/venvs/crawl4ai/bin/python`; CLI `crwl`). Used for real web/Reddit research (Reddit JSON 403s; crawl4ai's headless Chromium gets through).
2. **Built a real-data ICP** (`docs/ICP.md`) via 4 parallel research agents + a citation-verification gate (re-fetched a sample of quotes/prices to confirm verbatim before inclusion).
3. **Ran an adversarial investor red-team** (8 personas, 3 rounds) on business viability → `predict/260629-revora-viability/overview.md`.
4. **Reviewed the actual codebase** and mapped the real app flow → `docs/build-vs-recommendation.md`.
5. **Defined the smallest coach MVP** → `docs/coach-mvp.md`.
6. **Clarified positioning** repeatedly: the differentiation is NOT the camera/CGM/score; it's *decision-not-log + glucose-not-calories + prediabetes-only + calm-action-not-numbers + a daily companion*.

## 1B. What we found (codebase review — verified at commit d4eb073)

- **Architecture:** Next.js 16, React 19, OpenAI SDK (`openai 6.36.0`), zod, Upstash (rate-limit only), Vercel Edge Config, Sentry. **No database, no auth** in dependencies.
- **The whole app:** `app/page.tsx` ("Should I eat this?") → `components/food-check-form.tsx` → `POST /api/check` → `lib/revora/service.ts:checkFood()` → one OpenAI call → one result card.
- **Input:** typed `food` (string ≤160 chars) + `a1c` (number). **No image/photo/vision code exists** (grep-clean). Confirmed in `lib/revora/schemas.ts`.
- **Output:** one card — `risk` (SAFE/MODERATE/HIGH) + `reason` + `adjustment` + `swap` + `disclaimer`.
- **Stateless by design:** `app/privacy/page.tsx` states *"no account or login, no database, no saved history of your checks."*
- **Quality:** the `lib/revora/` answer engine is **high-quality and safety-hardened** — A1C band routing/out-of-scope, pre-model input classification (`input-precheck.ts`), a safety contract (`safety-contract.ts`), conservative bias, fail-closed retry (`fallback.ts`), Sentry PII scrub (`sentry-scrub.ts`), eval rubric (`eval-rubric.ts`). **This core is reusable and should be kept.**

## 1C. What we discussed (recommendations & gap analysis)

- **Three different products exist conceptually:** (a) **Built today** = one-shot text checker; (b) **Planned (PRD)** = photo scan + reversal journey + BAI + streaks + history + CGM (mostly NOT built); (c) **Recommended** = daily honest coach.
- **The build is smaller than both** the PRD dream and the coach recommendation. It is neither the photo-scanner nor the coach — it's the thinnest useful slice.
- **The single wall to coaching: no memory of the user** (deliberately excluded). Coaching requires continuity → needs identity + persistence + a daily loop + a progress view.
- **Closing the gap is mostly addition, not demolition** — keep the answer engine, add a stateful layer. Low-to-medium risk because the hard safety core is reusable.
- **Competitive truth:** can't out-feature the crowd (camera is commoditized + accuracy-capped + the place apps accidentally mislead users). The moat is **focus + voice + honesty + the daily relationship**, not features.
- **The "generic tracker" guardrail (4 lines never to cross):** no calories; no general/weight-loss/everyone audience; no neutral-number copy (keep calm, permission-first, action-ending voice); stay "should I eat *this*, now?" (decision) not "log your day" (tracking).
- **MVP discipline:** build the coach on the existing TEXT engine; do NOT build camera/CGM/BAI first (building the crowded, copyable features first makes you look *more* generic, not less).
- **Biggest unvalidated risk:** willingness-to-pay. $12.99/mo is the highest among photo→GL apps (LOGI $6.99, January AI $4.99–9.99) with zero paying users. Validate before heavy build.

## 1D. Current development status

| Area | Status |
|---|---|
| Core food-check (text → risk + swap) | ✅ Built, safety-hardened, tested (vitest + Playwright suites exist) |
| Safety/legal scaffolding | ✅ Strong — safety contract, A1C rubric, claims-boundary, copy-ledger, evidence-pack (`docs/safety/*`, `docs/legal/counsel-brief.md`) |
| PWA (manifest, icons, offline SW) | ✅ Built (`components/sw-register.tsx`); installable |
| Observability | ✅ Sentry server capture wired (needs prod DSN) |
| Rate limiting | ✅ Upstash (needs prod env vars) |
| Google Play (TWA) runbook | ✅ Doc exists (`docs/ops/play-twa-runbook.md`); **not executed**; no `/public/.well-known/assetlinks.json` yet |
| Camera / photo scan | ❌ Not built (and recommended to defer) |
| Accounts / database / history | ❌ Not built (deliberately) — **required for coach + payments** |
| Coaching loop (memory, nudge, insight, streak) | ❌ Not built — see `docs/coach-mvp.md` |
| Monetization (subscriptions) | ❌ Not built |
| Production deploy | ❌ Not yet deployed to Vercel production |

**Key docs produced this session:** `docs/ICP.md`, `predict/260629-revora-viability/overview.md`, `docs/build-vs-recommendation.md`, `docs/coach-mvp.md`. Raw research: `scratchpad/{voc,competitor,triggers,alternatives}-findings.md` (note: scratchpad is session-temp; copy anything you need to keep).

---

# PART 2 — Remaining Actions to Reach Google Play (specific, no steps skipped)

> Path: Next.js PWA → **Trusted Web Activity (TWA)** packaged as an Android App Bundle (.aab) via Bubblewrap/PWABuilder → Play Console. Runbook draft exists at `docs/ops/play-twa-runbook.md` — verify and execute it.

### A. Product completeness (decide scope first)
- [ ] **Decide MVP scope for v1 store release:** ship the current one-shot checker as-is, OR ship the coach MVP Step 1–3 (`docs/coach-mvp.md`). Recommendation: at least Step 1 (memory + streak) so the store app isn't a stateless tool. **User decision required.**
- [ ] If coach scope: implement memory/streak/daily-nudge/insight per `docs/coach-mvp.md`.

### B. Backend & data (only if going beyond stateless v1)
- [ ] Choose hosted Postgres (Vercel Postgres / Neon / Supabase — one-click on Vercel).
- [ ] Schema: `users`, `checks` (user_id, food, risk, a1c, created_at). zod already in stack for validation.
- [ ] Lightweight auth (magic-link email via Resend/Supabase) — needed for cross-device history + payments.
- [ ] Migrate the "history on device" privacy promise → update `app/privacy/page.tsx` + `docs/privacy/data-flow.md` in lockstep (legal-sensitive).

### C. Monetization (Play has a hard requirement here)
- [ ] **Google Play Billing is mandatory for digital subscriptions in-app** — you generally **cannot** use Stripe for in-app digital goods on Android. Plan for **Play Billing via the Digital Goods API in the TWA**, or a web-based purchase flow outside the app. **This is a real gotcha — resolve the billing architecture early.**
- [ ] Implement subscription tiers ($6.99/$9.99/$12.99 price-ladder test per ICP §12 — validate WTP).
- [ ] Restore-purchases, cancellation (frictionless, visible — anti-Klinio trust feature), receipt validation.

### D. PWA → TWA packaging
- [ ] Production HTTPS domain (TWA requires a verified origin). Configure on Vercel.
- [ ] Generate **`/public/.well-known/assetlinks.json`** with the app's SHA-256 signing-cert fingerprint (Digital Asset Links — currently MISSING).
- [ ] Build signed `.aab` via Bubblewrap or PWABuilder; manage the upload/signing keys (Play App Signing).
- [ ] Verify manifest completeness: name, icons (maskable), theme/background color, `start_url`, `display: standalone`, screenshots.

### E. Play Console setup & policy (health apps get extra scrutiny)
- [ ] Google Play Developer account ($25 one-time).
- [ ] Store listing: title, short/full description (use the new positioning — NOT "reverses prediabetes"), feature graphic, screenshots, icon.
- [ ] **Data Safety form** (what data is collected/shared — A1C is health data; be accurate).
- [ ] **Health apps declaration / content policies** — Google has specific health & medical policies; the app must not make disease-treatment claims. Align with `docs/safety/claims-boundary.md` and `docs/legal/counsel-brief.md`.
- [ ] Content rating questionnaire; target audience (adults; not children).
- [ ] Privacy policy URL (hosted — `/privacy` exists; confirm it's reachable on the prod domain).
- [ ] Medical disclaimer surfaced in-app + listing.

### F. Production infra & deploy
- [ ] Vercel production project + env vars: `OPENAI_API_KEY`, Upstash (`UPSTASH_REDIS_*`), `SENTRY_DSN`, Edge Config, any new DB/auth/billing secrets.
- [ ] Verify `maxDuration`/function limits vs Vercel plan (note in `app/api/check/route.ts`: Hobby may be too low; Pro may be required).
- [ ] Custom domain + DNS for Digital Asset Links.

### G. QA, accessibility, observability
- [ ] Run existing vitest + Playwright suites green on prod build; add tests for any new coach/persistence code.
- [ ] Accessibility gate (axe-core/playwright already in devDeps) — keep passing.
- [ ] Real-device testing of the TWA (install, offline, push, purchase flow).
- [ ] Sentry prod DSN; verify PII scrub on real traffic.
- [ ] Analytics for validation gates (D1/D7 return, paywall conversion) — privacy-safe.

### H. Legal/compliance final pass
- [ ] Counsel review of store copy + in-app claims (Sections flagged in `Revora_Brand_Positioning_v2.md` §6/§12/§13).
- [ ] Confirm "reversal" language uses user-as-agent framing everywhere; no FTC "reasonable consumer" exposure.
- [ ] Data-handling consistent across app, privacy page, Data Safety form, and `docs/privacy/data-flow.md`.

---

# PART 3 — Tasks for the New Session (execute in order)

## Task 1 — Create a Product Marketing Document

**Output:** `docs/product-marketing.md` (or a path the user prefers).
**Model after:** `/home/tefera/Documents/Carrier_Integrity/Final/0.Docs/product-marketing.md` (confirmed accessible — read it first for structure/section style).
**Base the content on:** `docs/ICP.md`, `predict/260629-revora-viability/overview.md`, `docs/build-vs-recommendation.md`, `docs/coach-mvp.md`, and `Revora_Brand_Positioning_v2.md`.
**Must include:**
- Positioning as the **honest prediabetes coach** (decision-not-log; glucose-not-calories; prediabetes-only; calm action; daily companion).
- **"What keeps Revora from becoming a generic tracker"** — the 4 guardrail lines never to cross (no calories; no general audience; no neutral-number copy; stay "should I eat this, now?").
- Real, corrected market facts (115.2M; first-mover refuted; competitor/price table from ICP §9).
- VOC language to mirror / phrases to avoid (ICP §10).
- Honest evidence basis (pain validated; WTP hypothesis-grade, pre-launch).
**Acceptance:** a marketer could write copy and a smoke test from it Monday morning; no "reverses prediabetes" claims; no reintroduced wrong facts.

## Task 2 — Align All Existing Documents

**Goal:** zero conflicting statements or ambiguous items across all docs.
**FIRST:** confirm with the user that the **coach-first / camera-demoted** direction is the locked source of truth (see Read-This-First #1). Do not rewrite locked PRD/brand decisions without that confirmation.
**Scope (the doc inventory):** all `*.md` under the repo except `node_modules/`, `.git/`, `agent/`, `.planning/` — notably `Revora_Brand_Positioning_v2.md`, `PRD/**`, `docs/safety/**`, `docs/legal/**`, `docs/privacy/**`, `docs/ops/**`, `Revora_PRD_Amendments.md`, `Revora_Traceability_Matrix.md`, and this session's new docs.
**Alignment rules:**
- Fix the wrong facts everywhere (115.2M not 98M; drop "first-mover"; drop unverifiable TAM; correct Cal AI conversion).
- Reconcile the **camera/CGM/BAI = later, not hero** decision with PRD/brand hero copy (flag conflicts; propose resolution; don't silently delete).
- Reconcile the **stateless "no database/history" privacy stance** with any coach/persistence plan (privacy + data-flow + Data Safety must agree).
- Keep the safety/legal claims-boundary consistent across every doc.
- Produce an **alignment report** listing every conflict found and how it was resolved (model after the existing `docs/audit/Revora_Alignment_Audit_*` files).
**Acceptance:** an alignment report + edits such that no two docs contradict on positioning, facts, feature scope, pricing, or data/privacy.

## Task 3 — Create an Implementation Plan

**Output:** a step-by-step plan (e.g. `docs/implementation-plan-to-play.md`) to take Revora from current state → built, tested, and live on Google Play for real users.
**Base on:** Part 2 of this handoff (turn it into a sequenced, dependency-ordered plan with phases, acceptance gates, and the validation kill-gates from `docs/coach-mvp.md`).
**Must:**
- Sequence the coach MVP steps (memory → nudge → insight → pay) as cheap kill-gates **before** heavy build.
- Resolve the **Play Billing vs web-purchase** decision early (it shapes the backend).
- Include the TWA packaging + assetlinks + Play Console + health-policy/legal steps from Part 2.
- Mark each phase with a clear "done when…" gate and the env/secrets it needs.
- Flag the WTP validation as the highest-priority early gate (don't build the full backend before a price-ladder signal).
- **Fold in the two Definition-of-Done checklists below — verbatim.** Structure the plan so its phases roll up to exactly these two gates: the **Heavy-Build DoD** closes the engineering phase, and the **Fully-Fledged-App DoD** closes the project. Every checklist item must map to at least one plan phase; no item left unowned.

### DoD Checklist 1 — Done with the Heavy Build *(engineering bar: "the software is built right")*
- [ ] Accounts + server database live; history persists across devices and is backed up
- [ ] Google Play Billing works end-to-end (subscribe / renew / cancel / restore / refund); free-vs-paid entitlement enforced
- [ ] Daily nudge fires reliably; streak + insight + progress computed server-side
- [ ] A1C/health data encrypted, access-controlled, scrubbed from logs
- [ ] Full automated tests green on the new stateful flows; accessibility gate passes
- [ ] Sentry + retention/conversion analytics live in production
- [ ] Deployed to Vercel production on the real domain
- [ ] Existing safe answer engine (`lib/revora/`) integrated, behavior unchanged

### DoD Checklist 2 — Done as the Complete, Fully-Fledged App *(real bar: "real people rely on it, it's a real business")*
Everything in Checklist 1, **plus:**
- [ ] Packaged as a signed TWA `.aab`; `/public/.well-known/assetlinks.json` verified
- [ ] Live on Google Play, passed review including the **health-app policies**
- [ ] Store listing complete with the correct positioning (no "reverses prediabetes" / no misleading accuracy claims); Data Safety form accurate
- [ ] Legal/counsel sign-off on claims + privacy + medical disclaimer
- [ ] Real users can find → install → onboard → return → pay
- [ ] Validation gates held **at scale** (retention + willingness-to-pay are real, not hoped)
- [ ] Support + monitoring + incident response in place (refunds, bugs, questions handled)
- [ ] The four guardrails still hold — still a prediabetes coach, not a generic tracker; nothing misleads users

**Acceptance:** a developer could execute it top-to-bottom without re-deriving scope; every Part 2 item appears, ordered, with gates; and both DoD checklists are embedded with every item mapped to a phase.

---

## Quick-start orientation for the new session
1. Read this handoff fully, then `docs/ICP.md` → `predict/260629-revora-viability/overview.md` → `docs/build-vs-recommendation.md` → `docs/coach-mvp.md` (in that order).
2. Confirm the strategic direction with the user (Read-This-First #1) before Task 2 edits.
3. Tooling available: Vercel CLI (authed as `tkiros`), crawl4ai (`~/.local/share/pipx/venvs/crawl4ai/bin/python`, CLI `crwl`) for any further real research.
4. Key code to keep & reuse: `lib/revora/` (the safe answer engine), `components/food-check-form.tsx`, the PWA service worker.
