<!-- Dependency-ordered plan: current app -> live on Google Play. Coach-first. Validate WTP before heavy build. -->

# Revora — Implementation Plan to Google Play

> **Direction (locked 2026-06-30):** honest, prediabetes-only **daily coach**. Camera/CGM/reversal-score (BAI) are deferred. Positioning source of truth: `docs/product-marketing.md`. Claims source of truth: `docs/safety/claims-boundary.md`.
>
> **Strategy in one line:** *validate willingness-to-pay before building the backend.* The biggest unvalidated risk is whether anyone pays a premium price (red-team: `predict/260629-revora-viability/overview.md`). So the plan front-loads cheap kill-gates and builds the heavy, stateful layer only after the signal holds.

This plan takes Revora from its current state to **built, tested, and live on Google Play for real users.** A developer can execute it top-to-bottom without re-deriving scope. Every phase has a **"done when"** gate and the **env/secrets** it needs. It rolls up to **two milestone gates**:
- **Gate 1 = end of Phase 6 = "Heavy-Build DoD complete"** (the software is built right).
- **Gate 2 = end of Phase 9 = "Fully-Fledged-App DoD complete"** (real people rely on it; it's a real business).

---

## Which plan is canonical — and what runs in parallel

**Execute only this file.** The repo has several older plans; here is how they relate, so there is no ambiguity:

| Doc | Role | Execute? |
|---|---|---|
| **`docs/implementation-plan-to-play.md`** (this) | The single go-forward plan | ✅ **Yes — this one** |
| `docs/coach-mvp.md` | Detailed spec for the coach steps | 📖 Reference while doing **P2–P5** |
| `PRD/Revora-Master-Implementation_Plan_v2.md` | Old 100-step camera-first master plan | ❌ Superseded (amended banner) |
| `PRD/Implementation_plans/*.md` (8 domain plans) | Domain plans for a **different stack** (Expo/React-Native + Rust/Axum on Railway + R2 + RevenueCat + camera) — **not** the shipped Next.js web app | ❌ Superseded reference; mine domain *concepts* (esp. Security/Compliance, billing economics), **not tasks** |
| `docs/superpowers/plans/2026-06-21-…launch-hardening.md` | The stateless build already shipped (PWA/Sentry/rate-limit) | ✅ Done — historical |
| `.planning/**` | GSD framework's own phase tracking | Separate tooling layer, not the execution plan |

**Critical path (sequential):**
`P0 → P2 → P3 → P4 → P5 → P6` ▶ **Gate 1** `→ P7 → P7.5 → P8 → P9` ▶ **Gate 2**

**Three side-tracks that run IN PARALLEL with the critical path** (start early; each only blocks at its merge point):
- **Billing decision (P1):** a decision/ADR, no build — do it anytime before **P5**.
- **Legal / counsel:** long lead time — **start now.** Covers the flagged "reversal" lines + store-copy/claims review; must land before **P8** (and before any P0 hero copy goes live).
- **Play Console admin prep:** $25 account, draft store listing + Data Safety form + assetlinks template — prepare anytime; finalize at **P7/P8** (the assetlinks SHA-256 only exists after the first upload).
- *Within P5:* DB+auth, billing integration, and the privacy/Data-Safety/counsel doc lockstep are independent workstreams that can be split across people.

**What must NOT be parallelized:** `P2 → P3 → P4` are sequential **kill-gates** — each measures retention lift over the previous step, so building ahead defeats the purpose. **P5** starts only after the P4 gate holds *and* P1 is decided. **P7 / P7.5 / P8** need the live production build from P6.

---

## Current state (verified at commit `d4eb073`)

The starting point is a **stateless, anonymous, text-in, single-shot food-risk checker** with a strong safety core. Do not assume anything beyond this exists.

- **Stack:** Next.js 16.2.4, React 19.2.5, `openai` 6.36.0, `zod` 4.4.3, `@upstash/ratelimit` + `@upstash/redis` (rate-limit only), `@sentry/node` 10.60.0, `@vercel/edge-config`. **No database client, no auth library** (verified clean).
- **Flow:** `app/page.tsx` → `components/food-check-form.tsx` → `POST /api/check` (`app/api/check/route.ts`, `runtime="nodejs"`, **`maxDuration=15`**) → `lib/revora/service.ts:checkFood()` → one OpenAI call → one decision card.
- **Input (`lib/revora/schemas.ts`):** `{ food: string≤160, a1c: number 0–20 }.strict()` — **no image/photo/vision field anywhere.**
- **Safety core (keep, reuse, don't rewrite):** `lib/revora/` (16 modules incl. `a1c.ts`, `input-precheck.ts`, `safety-contract.ts`, `fallback.ts`, `postprocess.ts`, `sentry-scrub.ts`, `eval-rubric.ts`, `rate-limit.ts`, `launch-controls.ts`).
- **Privacy stance (true today):** `app/privacy/page.tsx` — "no account or login, no database, no saved history."
- **PWA:** `public/manifest.webmanifest` (`display: standalone`), `public/sw.js`, `public/offline.html`, icons 192 / 512 / **maskable-512**; `components/sw-register.tsx`.
- **Observability/limits:** Sentry server-side via `lib/revora/sentry-capture.ts` (no-ops without `SENTRY_DSN`); Upstash sliding window 20 req/hr.
- **Tests:** vitest (`tests/unit/revora/` ~20 files, `tests/unit/client/`, `middleware.test.ts`), evals (`tests/evals/revora-graded-eval`, `revora-safety-eval`), Playwright smoke (`tests/smoke/`: `a11y`, `launch-controls`, `mobile-check`, `pwa-assets`); axe via `@axe-core/playwright`.
- **Play gap:** `public/.well-known/assetlinks.json` **MISSING**; `docs/ops/play-twa-runbook.md` exists but is **blocked** pending prod + counsel.

**The 4 guardrails (must hold through every phase):** no calories; prediabetes-only (A1C 5.7–6.4) audience; calm/permission-first/action-ending copy; "should I eat this, now?" not "log your day."

---

## Phases

### Phase 0 — Willingness-to-pay smoke test ⭐ (the #1 gate)
**Goal:** get a real pre-pay signal before building anything stateful.
**Do:** one landing page (reuse the Next app or a static page), **three hero variants** — *healthy-food betrayal* / *doctor sent you home* / *in-your-corner daily* (copy in `docs/product-marketing.md` → GTM) — each driving to a pre-order; run a **price ladder $6.99 / $9.99 / $12.99** to matched cohorts; measure **click → email → pre-pay.**
**Charge mechanic (decide up front, not a footnote):** refundable deposit / pre-authorization / fake-door ("reserve your spot," email only) vs. a real charge. A real charge for a not-yet-existing health subscription carries refund + consumer-protection exposure — if used, ship a clear refund policy under the same claims discipline as the app. Pre-order/checkout here is **web Stripe, outside any app**, so store-billing rules don't apply yet.
**Done when:** a hero wins on **email AND pre-pay**, and a price holds (does $12.99 survive vs $9.99?). **KILL if there is no pre-pay signal** — do not proceed to backend.
**Secrets/env:** privacy-safe analytics (see note below), Stripe (web pre-order).
**Closes:** foundation for DoD-2 "validation gates held at scale." **Handoff §A (scope), §C (price test).**

### Phase 1 — Billing architecture decision (early; shapes the backend)
**Goal:** resolve how money flows before designing identity/entitlement.
**Do:** choose **Play Billing via the Digital Goods API in the TWA** (the default for in-app digital subscriptions) **vs. a web-based purchase flow** outside the app. Note: recent **US Epic v. Google** court-ordered changes may permit alternative billing / external purchase links in the US Play Store — **verify current Play policy and confirm with counsel** before relying on it. Decide the **entitlement model** (how the app learns who paid) now.
**Done when:** billing path + entitlement model chosen and written down (one short ADR).
**Secrets/env:** none yet.
**Closes:** DoD-1 "Play Billing end-to-end" (decision half). **Handoff §C.**

### Phase 2 — Coach Step 1: Memory, on-device (kill-gate: D1/D7)
**Goal:** the smallest thing that makes Revora a coach, not a tool — without a backend.
**Do:** persist `{food, risk, a1c, date}` in **localStorage**; show today's checks + a streak ("Day 3 of checking in"); privacy copy "your history stays on your phone — it never leaves your device." **Reuse `lib/revora/` unchanged.**
**Done when:** deployed to prod; **D1/D7 return rate** measured and holds. No return → the coaching thesis is dead.
**Secrets/env:** analytics. **Privacy promise stays TRUE** (on-device only).
**Closes:** start of DoD-1 "daily nudge/streak/insight" + "answer engine integrated unchanged." **Handoff §A.**

### Phase 3 — Coach Step 2: Nudge (kill-gate: nudge lifts D7)
**Goal:** can a gentle reminder pull people back?
**Do:** one daily push via the **existing `public/sw.js`** service worker — *"Ready for today? Check your first meal."* **One nudge, never guilt copy.**
**Done when:** the nudge **measurably lifts D7 return** vs control. If a nudge can't pull people back, retention won't hold — stop here.
**Secrets/env:** Web Push (VAPID keys).
**Closes:** DoD-1 "daily nudge fires reliably." **Handoff §A.**

### Phase 4 — Coach Step 3: Insight (kill-gate: insight retains)
**Goal:** turn their own data into one useful observation.
**Do:** after 5+ checks, surface **one rule-based insight** from on-device history — *"most of your 'be careful' meals were breakfast"* (plain rules, no new model); mirror user language ("where your spikes hide," never "you failed").
**Done when:** the insight cohort **retains longer** than the no-insight cohort.
**Secrets/env:** none.
**Closes:** DoD-1 "insight computed." **Handoff §A.**

### Phase 5 — Coach Step 4: Pay + backend + identity (HEAVY BUILD begins)
**Goal:** only now — after value is proven — build the stateful, paid layer.
**Do:**
- **Database:** hosted Postgres via the **Vercel Marketplace (Neon or Supabase)** — note Vercel Postgres/KV are retired. Schema: `users`, `checks (user_id, food, risk, a1c, created_at)`; backups on. Validate with the `zod` already in-stack.
- **Auth:** lightweight **magic-link** (Resend/Supabase) — needed for cross-device history + payments.
- **Billing (per Phase 1):** subscribe / renew / **cancel / restore / refund**; receipt validation; **free-vs-paid entitlement enforced** server-side; soft paywall after value (~day 5–7 or N checks): *"Keep your history + daily coach."* Run the **live price ladder.**
- **Move streak/insight/progress server-side** (now that identity exists).
- **Health-data handling:** encrypt A1C at rest, access-control it, and **scrub it from logs** (extend `lib/revora/sentry-scrub.ts`).
- **Privacy lockstep (legal-sensitive — do together):** update `app/privacy/page.tsx`, `docs/privacy/data-flow.md`, the Play **Data Safety** answers in `docs/ops/play-twa-runbook.md`, and `docs/legal/counsel-brief.md` — the "no DB/no history" promise changes **here** and only here.
**Done when:** subscribe/renew/cancel/restore/refund work end-to-end; entitlement enforced; **pre-pay/subscribe rate at the chosen price holds.**
**Secrets/env:** `DATABASE_URL`, auth secret, billing keys, Resend key.
**Closes:** DoD-1 "accounts+DB," "Play Billing end-to-end (build half)," "health data encrypted/scrubbed," "server-side compute." **Handoff §B, §C.**

### Phase 6 — Production hardening + observability  →→ **GATE 1 (Heavy-Build DoD)**
**Goal:** make it production-grade and fully instrumented.
**Do:** Vercel **production** project + env: `OPENAI_API_KEY`, `UPSTASH_REDIS_*`, `SENTRY_DSN`, Edge Config, plus the new DB/auth/billing secrets. **Verify `maxDuration=15` vs the Vercel plan** (`app/api/check/route.ts` — Hobby may be too low; Pro may be required). Custom domain + DNS. **Prod Sentry DSN + verify PII scrub on real traffic.** Privacy-safe retention/conversion analytics live. **All suites green** (vitest, evals, Playwright, axe) **+ new tests for the stateful flows.**
**Done when:** deployed to Vercel production on the **real domain**; all tests green; observability live.
**Secrets/env:** all of the above.
**Closes:** DoD-1 "tests green + a11y," "Sentry+analytics in prod," "deployed to prod," "answer engine behavior unchanged (regression)." **Handoff §F, §G.**

### Phase 7 — TWA packaging
**Goal:** wrap the PWA as an Android App Bundle.
**Do:** confirm the **verified HTTPS origin**; generate **`/public/.well-known/assetlinks.json`** with the Play App Signing **SHA-256** fingerprint (template in `docs/ops/play-twa-runbook.md`; the file can't be finalized until the first Play upload produces the fingerprint); build a **signed `.aab`** via Bubblewrap/PWABuilder; add manifest **screenshots** (name/icons/maskable/theme/start_url/standalone already present).
**Done when:** signed `.aab` built; assetlinks verified (Digital Asset Links check passes).
**Secrets/env:** Play App Signing key.
**Closes:** DoD-2 "signed `.aab` + assetlinks verified." **Handoff §D.**

### Phase 7.5 — Real-device TWA QA
**Goal:** prove it actually works on hardware (a literal Part-2 item).
**Do:** install the signed `.aab` on a **physical Android device** via the Play **internal-testing track**; exercise **install, offline behavior, the daily push, and the full purchase/restore flow.**
**Done when:** install + offline + push + purchase/restore all verified on real hardware.
**Secrets/env:** test device, internal-testing track.
**Closes:** DoD-2 readiness for review. **Handoff §G (real-device testing).**

### Phase 8 — Play Console + policy + legal
**Goal:** pass review, including the extra scrutiny health apps get.
**Do:** Google Play Developer account ($25); **store listing in coach-first positioning** (no "reverses prediabetes," no misleading accuracy claims — use `docs/product-marketing.md`); **Data Safety form** accurate (A1C is health data — map 1:1 to `app/privacy/page.tsx` + `docs/privacy/data-flow.md`); **health-apps content declaration** aligned to `docs/safety/claims-boundary.md` + `docs/legal/counsel-brief.md`; content rating; target audience = adults; **privacy policy URL reachable on the prod domain**; medical disclaimer in-app **and** in listing; the user-as-agent reversal line present. **Counsel sign-off** on claims + privacy + disclaimer.
**Done when:** app passes review **including health-app policies**; counsel sign-off recorded.
**Secrets/env:** Play Console.
**Closes:** DoD-2 "live on Play / passed review," "listing+Data Safety correct," "counsel sign-off." **Handoff §E, §H.**

### Phase 9 — Launch, scale-validation, support  →→ **GATE 2 (Fully-Fledged-App DoD)**
**Goal:** real people find it, return, and pay — and you can support them.
**Do:** drive the funnel (organic r/prediabetes + SEO + ASO + doctor channel, per `docs/product-marketing.md`); confirm real users **find → install → onboard → return → pay**; confirm the validation gates hold **at scale** (retention + WTP are real, not hoped); stand up **support + monitoring + incident response** (refunds, bugs, questions); re-confirm the **4 guardrails** still hold and nothing misleads users.
**Done when:** DoD Checklist 2 fully satisfied.
**Secrets/env:** none new.
**Closes:** all remaining DoD-2 items. **Handoff §G, §H.**

---

## Phase notes (apply across phases)

- **Privacy-safe analytics:** no PII, no A1C or food strings in event payloads — counts/cohorts only (e.g. Plausible or self-hosted PostHog). On-brand for a privacy-positioned health app, and required to keep the Data Safety form accurate.
- **Kill-gate discipline:** Phases 0, 2, 3, 4 are cheap and each can stop the project. **Do not skip a gate to reach the build faster** — the whole point is to spend the heavy effort (Phase 5+) only after the cheap signals hold.
- **Top risks to keep visible (red-team):** no moat on photo→GL (commoditized); highest price in a cheaper field with zero validated WTP; accuracy may be unwinnable from a photo (never claim it); platform/consolidation (MyFitnessPal acquired Cal AI, Dec 2025); the true competitor is inertia.

---

## DoD Checklist 1 — Done with the Heavy Build *(engineering bar — closes at Gate 1 / end of Phase 6)*
- [ ] Accounts + server database live; history persists across devices and is backed up → **P5**
- [ ] Google Play Billing works end-to-end (subscribe / renew / cancel / restore / refund); free-vs-paid entitlement enforced → **P1 + P5**
- [ ] Daily nudge fires reliably; streak + insight + progress computed server-side → **P3, P4, P5**
- [ ] A1C/health data encrypted, access-controlled, scrubbed from logs → **P5**
- [ ] Full automated tests green on the new stateful flows; accessibility gate passes → **P6**
- [ ] Sentry + retention/conversion analytics live in production → **P6**
- [ ] Deployed to Vercel production on the real domain → **P6**
- [ ] Existing safe answer engine (`lib/revora/`) integrated, behavior unchanged → **P2–P5 (reused); regression in P6**

## DoD Checklist 2 — Done as the Complete, Fully-Fledged App *(real bar — closes at Gate 2 / end of Phase 9)*
Everything in Checklist 1, **plus:**
- [ ] Packaged as a signed TWA `.aab`; `/public/.well-known/assetlinks.json` verified → **P7**
- [ ] Live on Google Play, passed review including the **health-app policies** → **P8**
- [ ] Store listing complete with the correct positioning (no "reverses prediabetes" / no misleading accuracy claims); Data Safety form accurate → **P8**
- [ ] Legal/counsel sign-off on claims + privacy + medical disclaimer → **P8**
- [ ] Real users can find → install → onboard → return → pay → **P9**
- [ ] Validation gates held **at scale** (retention + willingness-to-pay are real, not hoped) → **P9 (built on P0, P2–P5)**
- [ ] Support + monitoring + incident response in place (refunds, bugs, questions handled) → **P9**
- [ ] The four guardrails still hold — still a prediabetes coach, not a generic tracker; nothing misleads users → **cross-cutting; verified P8 (listing) + P9**

---

## Dependency summary

```
P0 (WTP) ──gate──> P1 (billing decision) ──> P2 ─> P3 ─> P4  (each a kill-gate, on-device)
                                                     └─> P5 (heavy: backend/auth/pay) ─> P6 ▶ GATE 1
P6 ─> P7 (.aab + assetlinks) ─> P7.5 (real-device QA) ─> P8 (Play review + legal) ─> P9 ▶ GATE 2
```
P0 must precede any backend work. P1 must be decided before P5 (it shapes identity/entitlement). The privacy/Data-Safety/counsel lockstep happens in P5 and is re-verified in P8.

## Verification
- Every Part-2 handoff item (A–H) is mapped to a phase above (see the "Handoff §" tags).
- Both DoD checklists are embedded verbatim with every item mapped to a phase.
- P0 (WTP) precedes any backend phase; Gate 1 = end P6, Gate 2 = end P9.
- The 4 guardrails are stated up front and re-checked at P8/P9.
