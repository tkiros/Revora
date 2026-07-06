# Revora — Paywall, Pricing, Pantry & Onboarding Strategy Handoff

**Date:** 2026-07-05 · **Status:** decisions locked, ready to plan/build · **Scope:** web app first
**Source:** strategy session (onboarding audit → paywall economics → payment model → pantry funnel → design system → "enjoy it anyway" feature → growth borrows).
**Reference docs:** `docs/product-marketing.md`, `docs/coach-mvp.md`, `docs/safety/claims-boundary.md`, `DESIGN.md`, `docs/handoff/2026-07-04-pantry-review-pipeline-session-handoff.md`.

> Every recommendation here is **additive and web-first**. All new copy must pass the claims-boundary CI test (`tests/unit/revora/claims-boundary-copy.test.ts`) before shipping. WTP/price numbers are hypotheses to validate, not facts.

---

## 0. Decisions locked (founder calls this session)

1. **Web app first.** Build and validate on the web (Next.js PWA + Stripe). Defer Play/TWA billing.
2. **Payment model = Decision D: card-gated trial, no permanent free.** Replaces the current "5 checks/day free forever + soft upsell" entirely.
3. **Hard gate only. No soft gating anywhere.** After the taster, access is a hard wall → trial → paid. Remove the calm "5 for today, come back tomorrow" soft path.
4. **Price ladder = $9.99 / $12.99 / $19.99** on the monthly subscription. **Not** $6.99/$9.99/$12.99 — $6.99 doesn't make sense against COGS, and the product delivers superior value.
5. **Trust execution is non-negotiable:** 2-day pre-charge email + one-tap visible cancel, framed as the anti-Klinio proof.

---

## 1. Current onboarding audit (baseline — what exists in code)

Revora's core action is a **text-in "Should I eat this?" check** → one calm verdict (**Clear / Be careful / Hold off**) + reason + adjustment + swap + sequencing tip + post-meal action. Verified surfaces:

| Screen | Route / file | State |
|---|---|---|
| Landing = the product | `/` · `app/page.tsx` | Guest check, no login. First value here. |
| Onboarding wizard | `/onboarding` · `app/onboarding/page.tsx` | 4-step tour (welcome→a1c→expectations→daily_loop). **Orphaned** — only linked from an empty-state; A1C saved to localStorage only, never server. |
| Sign in | `/signin` | Resend magic link, passwordless. |
| Save profile | `/welcome` | A1C re-asked + GDPR consent → encrypted `profiles` row. |
| Soft paywall | `/subscribe` | 5 free checks/day (`FREE_DAILY_CHECKS`), calm 402 upsell. **Being replaced — see §2.** |
| Daily nudge | `components/nudge-opt-in.tsx` | Premium-gated + prior-day check. |

**Key gaps found:** onboarding is orphaned (new users never enter it); A1C collected twice; no engineered first-run aha; nudge gating blocks the coach-MVP retention kill-gate; missing "Step 1 of 4" label; boundary screen dead-ends.

**Recommended onboarding (adapted to Decision D):**
1. First-run redirect — new visitor auto-enters first-run (fixes the orphan).
2. Welcome / belief — keep the legal North Star verbatim.
3. "What brought you here?" — one skippable segmentation tap.
4. Latest A1C — tuning + scope guard; out-of-range gets an optional "notify me if Revora expands" instead of a dead end.
5. Honesty / what to expect — lead with "when we're unsure, we say so."
6. **Guided first check (the aha)** — reuse the form + 3 chips: **oatmeal · banana · orange juice**. First win + "huh" in one screen. This runs inside the Day-1 taster.
7. **Day 1 moment** — "That's Day 1." Offer the daily nudge here.
8. Card-trial wall — see §2 (this is where monetization now sits).

---

## 2. Paywall flow + payment system — Decision D (card-gated trial, no permanent free)

### The model
- **Day 1 — no-card taster, 10-check limit.** Open access, no account, capped at ~10 checks (effectively unlimited for a day's meals). Purpose: hit the healthy-food-betrayal aha and let the daily-relationship value begin to land. **No permanent free tier after this.**
- **After the taster — HARD wall.** To continue, the user must start the trial. No soft "come back tomorrow," no residual free checks. Hard gate only.
- **7-day free trial, card required** → **auto-converts to $12.99/mo** (the middle price; final price set by the §4 test).
- **Trust execution (mandatory):** a **2-day-before-charge email** and **one-tap, visible cancellation**. Make transparent cancellation a headline selling point — the anti-Klinio proof.
- **Web / Stripe first** to dodge store-billing cuts and store trial constraints.

### Why this model (rationale carried from the session)
The old model gave away Revora's costliest asset (the LLM-backed check) free forever, with no ads to offset COGS, and charged only for "memory" — the weakest willingness-to-pay driver. Decision D fixes both problems: it **bounds free inference to a single day** and **forces the purchase decision**. The trial itself becomes the real WTP instrument.

### Benchmark context
- **Duolingo:** free-forever works only because content is ~$0 marginal cost and ads monetize free users. Neither is true for Revora.
- **Cal AI:** card-gated trial, exactly this pattern — it bounds COGS and forces the decision. Decision D = Cal AI's mechanic, softened with the no-card Day-1 taster so value lands before the card ask.

### What changes in code (implications — for planning, not prescriptive)
- Replace `FREE_DAILY_CHECKS = 5`-forever (`lib/server/entitlement.ts:13`) and the 402 soft-upsell copy (`app/api/check/route.ts:55`) with taster→trial→paid states.
- Entitlement states become roughly: `taster` (bounded, anonymous) → `trialing` → `premium` → `lapsed`. No standing "free" tier.
- Day-1 taster limit is enforced device-locally (localStorage) since there's no account yet.
  `ponytail:` device-local taster cap is gameable (clear storage = reset). Acceptable for a taster; upgrade to server/device-fingerprint enforcement only if abuse shows up in the data.
- Account creation moves **earlier** — to trial start (card + email via Stripe + Resend), not deferred to `/welcome`.
- Stripe: `mode: "subscription"`, `trial_period_days: 7`, card collected at trial start; schedule the 2-day pre-charge email off the trial-end timestamp; expose one-tap cancel via the existing billing portal or a direct cancel action.

### Trust guardrails (do not skip)
Card-gated auto-converting trials are the exact pattern this scam-wary audience fears (Klinio 1.2★, mass unauthorized-charge complaints, a named deal-killer in `product-marketing.md`). This model is only safe with radically transparent cancellation. **Ship the transparency or don't ship the trial.**

---

## 3. Pricing test — $9.99 / $12.99 / $19.99 ladder

**Decision:** test **$9.99 / $12.99 / $19.99** (not the old $6.99/$9.99/$12.99). $6.99 is below what COGS justifies and undersells the product.

- **Default / anchor:** $12.99/mo (trial auto-convert price).
- **The trial is the WTP test.** Read **trial-start rate** and **trial→paid conversion** at each price. No separate pre-order test needed.
- **Primary metrics:** trial-start rate, trial→paid conversion (count **new** conversions per cohort — not renewals; a real pitfall to avoid, per the Flame interview), and **gross margin per active user** (revenue − taster/trial COGS).
- **Guardrail metrics:** taster→trial-start rate (does the hard wall scare too many off?), refund/chargeback rate, r/prediabetes sentiment.
- **Low-traffic decision rule:** pre-commit ~2 weeks or ~100 activated users per arm. Promote a price only if it beats the alternative on **margin per user** without cratering trial-start. Nests inside the existing Day-45 <$500 kill-gate.
- **Avoid:** two prices visible to one community at once; changing price and positioning in the same cell; judging on trial-starts alone (card-abandon happens at the form — only "paid" counts); pooling Reddit and SEO traffic.
- **$19.99 note:** if it holds trial→paid anywhere near $12.99, margin-per-user jumps and it reframes Revora as a premium coach vs. a cheap tracker. That's the upside worth testing given the "superior value" thesis.

---

## 4. Pantry offer — funnel audit + recommended flow

### What already exists (verified — ~90% built, tested, automated)
The **Pantry Review** is a built, tested paid product: upload ≤10 photos → confirm the extracted item list → emailed + in-app report grouping items into **Enjoy freely / Worth a tweak / Handle with care**.

| Stage | Exists? | Where |
|---|---|---|
| Landing page + copy | ❌ **Missing** | No `app/pantry/page.tsx`; no marketing surface anywhere |
| Payment | ⚠️ External | Stripe Payment Link. Webhook handling built: `app/api/billing/handlers.ts` (`applyPantryCheckout`, `STRIPE_PRICE_PANTRY`) |
| Claim/bind | ✅ | `app/pantry/claim/route.ts` (requires sign-in) |
| Upload/intake | ✅ | `app/pantry/intake/page.tsx` + `components/pantry-intake-flow.tsx` + `app/api/pantry/upload/route.ts` |
| Extract (vision) | ✅ | `lib/pantry/extract.ts` (extractor only, never judges) |
| Confirm | ✅ | `components/pantry-confirm-list.tsx` + `app/api/pantry/confirm/route.ts` |
| Judge + report | ✅ | `app/api/pantry/process/route.ts` + `lib/server/pantry/process.ts` (reuses `checkFood`) |
| Delivery | ✅ | Report email + `app/report/[id]/page.tsx` |
| Cron backstop | ✅ | `app/api/cron/pantry-sweep/route.ts` |
| Admin/manual | ✅ | `app/admin/pantry/page.tsx` (`resend_intake / resend_report / mark_manual / rerun`) |

### The gaps to build
1. **Landing page (the real missing piece):** `app/pantry/page.tsx` using `DESIGN.md` tokens, with a **sample report** (redacted/fictional) — seeing the deliverable before paying is what converts a scam-wary buyer. Ship today with the CTA pointing at the existing Stripe Payment Link; upgrade to an in-app `mode:"payment"` checkout later.
2. **Optional:** auto-reminder email at +48h for unclaimed orders (admin `resend_intake` exists; wire it into the cron sweep).

### Positioning & placement
- **Angle:** *the one-time, no-subscription kitchen review.* "Your whole kitchen, sorted in one report. One payment. Nothing renews." This weaponizes the same anti-subscription anxiety and **complements** the trial — it's the graceful catch for people who bounce at the card wall.
- **Placement:** (1) cold-traffic front door = the `/pantry` landing page (Reddit/FB destination); (2) warm triggers = after a first Be-careful/Hold-off verdict, and on trial-wall decline ("Not ready for a subscription? There's a one-time option").
- **Never** inside onboarding or on the out-of-range boundary screen.
- **Price:** currently env-driven (`STRIPE_PRICE_PANTRY`); the $49 / $25-preorder figures live only in docs. Test as its own thing later.

### Copy framework (claims-safe, DO-framed, honest about the confirm step)
Position → no-subscription kitchen review · Psychology → disarm false-precision + scam fear · Pain → healthy-food betrayal · Outcome → whole kitchen sorted · Mechanism → photos → you confirm the list → same careful engine → grouped report + one swap each · CTA → "one payment, nothing renews" + photos deleted after report + informational-only disclaimer.

---

## 5. Design system — you already have one, don't rebuild it

`DESIGN.md` is canonical, extracted from `app/globals.css`. It's a **cool, clinical, calm** system built for anxious health users:
- Cool blue-white ground (`#f3f7fb`), white cards, **dark-slate accent `#0f172a` (a near-black, not a color)**.
- **Risk colors are the only color** — teal/amber/red as *semantic left-borders only*, never decoration.
- System font stack (zero-flash), fixed radius scale (24/18/14/999), exactly one shadow, single column `max-width: 480px`.
- Permission-first voice + anti-slop guardrails (document-not-dashboard, no icon-in-circles, no decorative gradients).

**Recommendation: do NOT create a new design system.** It exists and is enforced. Do not port the strategy-artifact palette (warm green/clay) into the app — that was for read-only documents. For the new work, extend `DESIGN.md` by **two small patterns** (edit `DESIGN.md` first, per its own rule):
1. A **selectable-chip** pattern (segmentation taps + meal-suggestion chips).
2. A calm **"Day 1" / first-win** treatment (hierarchy + streak, no confetti, no exclamation marks near verdicts).

Superwall etc. are **not** a design system and won't give you a trustworthy one — your brand trust is hand-built and CI-guarded. Keep it.

---

## 6. Feature — "Enjoy it anyway" (Approach B, recommended)

**Goal:** deliver Revora's promise — address the pain **without losing food enjoyment** — which is a named Pull in the JTBD ("keep my comfort foods instead of being told to quit them").

**Approach B:** reframe the Be-careful/Hold-off card around the promise, presenting two enjoyment-preserving moves:
- **Keep-most** — smaller portion of the risky component / set a component aside (e.g., "enjoy the burger without the bun this time"). **Qualitative only.**
- **Swap** — the existing swap.

**Hard constraints (claims boundary + brand):**
- **Never label it "skip" / "avoid"** — brand-banned, and the rule is *every result ends in one concrete DO, not a DON'T.* Reframe the mechanic as an enjoyment DO.
- **Portions stay qualitative** — no cups/grams/numbers (bans on exact GL/GI/mg-dL).
- Only on **Be-careful / Hold-off** (SAFE gets nothing — the "no piling on" tone rule).
- Every phrase must pass the **claims-boundary CI test** + copy ledger.

**Leanest path:** this may not need a new card field — it's an enrichment of the existing adjustment/swap phrasebank. **Assignment before any code:** write 8–10 candidate keep-most / set-aside phrases, run them through `docs/safety/copy-ledger.md`, confirm they clear CI. That's the real feasibility gate.

**Synergy:** strengthens the Day-1 taster aha ("you can still enjoy it"), which helps trial conversion.

---

## 7. Growth borrows from `full_app_guide_yt.md` (Flame / Superwall podcast)

**Recommendation: borrow some. One thing is important and implementable now; ignore the flashy part.**

**Already have it:** the retention machine (daily trigger + streak + one insight + one gentle nudge) — Revora's `coach-mvp.md` already specifies exactly this. Nothing to do but finish shipping.

**Borrow now (important):**
- **Content-conversion insight → build the betrayal-aha demo.** "Type oatmeal → Be careful, here's why" is your product-in-action and highest-converting asset. Put it at the center of the pantry landing page, `/subscribe`, store screenshots, and Reddit posts.
- **VSC "convertible" filter** — optimize content for "makes them want the product," not views.
- **AI content-playbook + daily-tracking flywheel** — for your *real* channels (r/prediabetes, SEO), not TikTok.
- **Conversion-math fix** — count new free→paid per cohort, not renewals (already folded into §3 metrics).

**Ignore (wrong for Revora):**
- **The entire TikTok-farming operation** — wrong audience (40–60 search-intent prediabetics, not TikTok), and a gray-hat op (fake accounts, proxies, ban evasion, unvetted AI health content) that collides head-on with a trust-first, claims-regulated brand + FTC exposure + a 2-month runway.
- **The guilt "stick" notifications** — off-brand; Revora is "gentle, never guilt." Keep the carrot, skip the stick.
- **Widgets** — a native-app advantage; you're web-first.

---

## 8. Superwall — recommendation

**Not now; revisit post-launch.** Superwall (remote paywall config, A/B/n price tests, entitlement infra; free under $10k/mo; now supports Web SDK + Stripe) is genuinely good, but:
- A/B testing needs traffic you don't have pre-launch (below significance, it's a solution without its input).
- It would duplicate the billing you already built (`lib/server/entitlement.ts` + Stripe + Play).
- It doesn't solve your actual bottleneck (landing page, first-run, instrumentation).

**Trigger to revisit:** post-launch, a few hundred conversions/week. Borrow one finding for free now: **multi-page paywalls convert ~37% better than single-page** — structure the trial wall and `/subscribe` as a short multi-step flow (value → sample/proof → price), not one dense card.

---

## 9. Domains — recommendation

`.com/.net/.org/.ai` are taken. For a **40–60, scam-wary** audience, `.com` trust and brand-exactness dominate.

| Rank | Domain | Verdict |
|---|---|---|
| 1 | **revora.bio** | Safest brand-exact pick, health-connoting, depends on no one else. |
| 2 | **yourrevora.com** | The only `.com` (big for this audience). Score depends entirely on what `revora.com` serves. |
| 3 | revora.plus | "Plus" collides with your paid tier name. |
| 4 | revora.living | Long, lifestyle-blog feel, weak type-in. |
| 5 | revora.food | Fights the "not a food tracker" positioning. |
| 6 | revorax.com | Changes the brand to "Revorax"; techy/crypto tone. |

**Recommendation:** register **revora.bio** as the primary now (safe regardless). **Also register yourrevora.com** to catch `.com` type-ins — but **first check what `revora.com` currently serves** (couldn't verify from here). If it's a competitor/scam page, do not lean on `yourrevora.com` (drop-the-"your" leaks trust to a stranger); if it's benign, `yourrevora.com` becomes a strong primary.

---

## 10. Implementation priorities (web-first, all additive)

1. **Payment model D** — taster (Day-1, 10-check, no card) → hard wall → 7-day card trial → $12.99, with 2-day pre-charge email + one-tap cancel. Rework entitlement + Stripe trial. *(Biggest change; the core of this handoff.)*
2. **First-run onboarding + guided first check with betrayal chips** — runs inside the taster; fixes the orphaned wizard.
3. **`/pantry` landing page + sample report** — unblocks the pantry front door and the catch-on-trial-decline.
4. **Betrayal-aha demo asset** — the highest-leverage marketing artifact (§7).
5. **Funnel instrumentation** — taster-check, wall-hit, trial-start, trial→paid (new-only), cancel, pantry views. Nothing in §3 is measurable without this.
6. **"Enjoy it anyway" phrasebank (Approach B)** — after the claims-ledger check.
7. **Pricing test $9.99/$12.99/$19.99** — via the trial; needs #5 live first.
8. **Domains** — register revora.bio (+ verify revora.com before yourrevora.com).

**Cross-cutting guardrail:** every new user-facing string (payment, pantry, enjoy-it-anyway, marketing) must clear the claims-boundary CI test and copy ledger. The trial's transparency (pre-charge email + one-tap cancel) is not optional — it's what keeps Decision D from becoming the scam this audience is built to distrust.
