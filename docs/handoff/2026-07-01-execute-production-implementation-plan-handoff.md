# Master Prompt — Execute the Production Implementation Plan (full build, ship everything now, defer only D5)

**Date:** 2026-07-01 · **Repo:** `/home/tefera/Desktop/Revora` · **Type:** execution handoff (builds the product; does not re-plan it).
**Branch base:** `launch-hardening` (commit `d4eb073`) → do your work on `feat/full-build`.
**The plan you are executing:** `docs/production-implementation-plan-2026-07-01.md` — read it in full before writing any code. It is execution-ready: every phase names files, routes, "done when", env, tests-first, and the human-only actions it surfaces. This handoff is the operating manual *for executing that plan*; the plan itself is the source of truth for scope.

---

## ⚠️ Mission (3 lines)

Take Revora from its current state — a stateless, anonymous, text-in food-risk checker — to a **fully-fledged, production-ready app on Google Play**: real people rely on it, it is a real business. Build the **entire product now** (all features in the plan's §4 inventory), **ship two of three input methods** (Text, Voice), and **fully specify but do NOT build** the third (Photo-assist / D5). Build every line of code, config, test, and store/legal draft you can; **stop and hand back** only the steps that require a human (paid accounts, production secrets, signing keys, counsel sign-off, a physical Android device, real users).

---

## The scope decision (already made by the owner — do NOT re-litigate)

1. **Build and ship the whole product now.** Every feature in the plan's §4 inventory is in this release. There are **no** WTP smoke-test gates, **no** D1/D7 retention gates, **no** "measure then decide" checkpoints. The old plan's kill-gates are ordinary build milestones here. *(One-line consequence, stated once so it is not re-argued: this trades market validation for completeness and speed — the full paid backend and store release are built before any proof that users will pay. That is the owner's accepted risk. Build it.)*
2. **Exactly one feature is deferred: Photo-assist (D5).** It is fully specified in the plan (§6.3) and marked "DEFERRED — do not build or launch in this release." Do not write vision code, camera UI, or photo marketing. Its counsel + eval ship-gates stand for the later release.
3. **CGM correlation is excluded** from launch scope (plan §13, post-launch increment 1). It is **not** an input method — there are exactly three (Text, Voice, Photo-assist-deferred). Do not build it, do not add it as a fourth input method.

If you find yourself about to reintroduce a validation gate, build D5, or add a fourth input method — stop; that is out of scope by owner decision.

---

## First moves (in this order)

1. **Read the plan** `docs/production-implementation-plan-2026-07-01.md` end-to-end, then these constraint docs (they bind every phase): `docs/product-marketing.md` (the 4 guardrails, positioning, store-copy voice), `docs/safety/claims-boundary.md` (LOCKED — banned claim families), `docs/safety/tone-uncertainty-policy.md`, `docs/safety/a1c-band-rubric.md`, `docs/coach-mvp.md`, `docs/direction-validation-2026-07-01.md` (the binding D5 spec + pre-ship eval).
2. **Verify the baseline** before touching anything: `grep -riE "image|camera|photo|vision|drizzle|prisma|next-auth|postgres" app/ components/ lib/` should confirm none exist; `ls public/.well-known` should 404. Read `lib/revora/schemas.ts` and `lib/revora/service.ts` so you know the exact request/response contract you must not break.
3. **Establish a clean, green baseline (Phase 0).** Commit the uncommitted coach-pivot doc set on `launch-hardening`; revert or commit the stray `next-env.d.ts`/`tsconfig.json` edits; branch `feat/full-build`. Run `npm run typecheck && npm run test && npm run eval:revora` and the Playwright smoke suite — confirm all green **before** any new work.
4. **Write the Phase 0 deliverables:** the engine-regression golden-fixture suite (`tests/unit/revora/engine-regression.test.ts`), the consistency-check harness (`scripts/consistency-check.mjs`), and the 3 ADRs (`docs/adr/billing.md`, `stack.md`, `launch-scope.md`).
5. **Kick off the parallel tracks (Track B legal, Track C human/admin) on day 1** by appending their long-lead items to the "Human action required" running list (template below) — counsel engagement and Play account ID-verification are the longest leads; surface them immediately.
6. **Then execute Track A phase-by-phase**, in dependency order, committing per task.

---

## Operating rules (non-negotiable — carry into every phase)

- **Reuse the engine, never rewrite it.** All meal decisions — text, voice, and later D5 — flow through `lib/revora/` unchanged. The Phase 0 regression suite + the two eval suites must stay green at every commit; any diff to `lib/revora/` that changes behavior is a bug. The one sanctioned engine-adjacent change (determinism settings in `openai-client.ts`, only if the P7 consistency number demands it) must re-run `eval:revora:live` before merge.
- **The 4 guardrails in every user-facing string:** (1) no calories, ever; (2) prediabetes-only audience, A1C 5.7–6.4% (out-of-range → boundary guidance, never a verdict); (3) calm, permission-first, action-ending copy — every result ends in exactly one concrete next action, never blame/restriction language; (4) "should I eat this, now?" decision framing, not "log your day."
- **Claims boundary is LOCKED.** Informational-only, qualitative-only. **No** exact GI/GL numbers, carb grams, mg/dL, glucose-curve or future-A1C predictions surface to the user from any input method. **Never** "Revora reverses/treats/prevents/cures prediabetes" (app as agent) — use the user-as-agent line: *"Reversal is achieved through your dietary choices — Revora gives you the clarity to make them."* No FDA-approval/clearance claims. No accuracy marketing, no "AI-powered" lead. A disclaimer never licenses a stronger claim.
- **The progress feature is compliant-by-construction.** The adherence index is the **behavioral** BAI tied to CDC-DPP citations (adherence, scan consistency, post-meal action) — **never a predicted A1C value** (`Revora_PRD_Amendments.md` Amendment 1 documents the original formula as a fabricated clinical claim). Progress copy stays qualitative; defer clinical interpretation to a clinician.
- **Privacy lockstep the moment state appears (Phase 4B).** The "no account / no database / no saved history" promise changes the instant server history lands. In the **same PR**: rewrite `app/privacy/page.tsx`, update `docs/privacy/data-flow.md`, update the Play Data Safety answers in `docs/ops/play-twa-runbook.md`, and update `docs/legal/counsel-brief.md`. A1C is GDPR Art. 9 special-category health data: encrypt at rest (AES-256-GCM, `lib/server/crypto.ts`), access-control it, and scrub it from logs/Sentry/analytics (extend `lib/revora/sentry-scrub.ts`).
- **TDD, green at every commit.** New stateful flows get tests **before** implementation. vitest + evals + Playwright + axe stay green; axe is zero-violation on every new page/state. Add tests for new code; never weaken existing ones.
- **Branch + atomic commits per task** (conventional commits, e.g. `feat(p4a-auth): magic-link sign-in`, `test(p1): coach-outputs phrase-bank audit`). End every commit message with:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- **Do NOT** push to production, deploy to prod, create paid accounts, spend money, or submit to Play. **Do NOT** re-add validation gates, build D5, or add a fourth input method. Open a PR at the end.

---

## Pre-decided defaults (so you never stall — deviate only with a `docs/adr/` note)

| Concern | Default |
|---|---|
| Database | Neon Postgres (Vercel Marketplace) + Drizzle migrations |
| Auth | Auth.js v5 email magic-link + Resend; DB sessions |
| Billing | Play Billing via Digital Goods API in the TWA + server receipt verification (Play Developer API via RS256 JWT + `fetch`, no `googleapis` dep) + Stripe web fallback; unified `subscriptions` table |
| Push | Web Push (VAPID) via `web-push` + hourly Vercel cron |
| Analytics | Plausible, typed no-PII event allowlist |
| Email | Resend |
| Field encryption | AES-256-GCM via `node:crypto`, env key `HEALTH_DATA_KEY`; KMS is the upgrade path |
| Launch region | US-only (defers DPIA/consent-banner/SCCs) |
| Audience | 18+, Play target audience = adults |
| Pricing | $12.99/mo · $99.99/yr (owner confirms SKUs; lifetime deferred) |
| Free tier | 5 result-checks/day; premium = history + insights + progress + nudge + unlimited |
| Voice | Browser Web Speech API; keyboard-dictation fallback; no server audio |

---

## Phase execution map (build-through, no gates) — full detail is in the plan

**Track A (code, sequential unless noted):**
- **P0** — Clean baseline · engine-regression suite · consistency harness · 3 ADRs. *Autonomous. Done when:* suites green on the new branch, deliverables committed.
- **P1** — Decision card v2: `lib/revora/coach-outputs.ts` derives `sequencingTip` + `postMealAction` deterministically (SAFE → both null); `app/api/check/route.ts` wraps the engine response; `components/result-card.tsx` renders the two blocks. Engine untouched. *Autonomous.*
- **P2** — Voice input: `lib/client/speech.ts`, `components/voice-input-button.tsx` → transcript into the same textarea → same `/api/check`. Feature-detected; keyboard-dictation hint on unsupported browsers. *Autonomous.*
- **P3** — Onboarding + guest coach shell (on-device): `lib/client/history-store.ts` (localStorage now, the seam for server later), `app/onboarding/page.tsx` (North Star line, A1C entry, expectations — **no goal-setting, no target A1C**), home daily loop, `app/history/page.tsx` week view, `lib/coach/insights.ts` (forward-permission only). Privacy promise stays true. *Autonomous.*
- **P4** — The backend push (one coherent phase; strict sub-order): **4A** identity + Neon/Drizzle + Auth.js magic-link + `lib/server/crypto.ts` + Art. 9 consent; **4B** server history + sync + **privacy-lockstep PR** + scrub extension; **4C** server-side coach compute; **4D** billing (Play + Stripe) + entitlement + free-tier + paywall + frictionless cancel; **4E** account + data deletion + public deletion URL. *Autonomous code + tests against dev/preview Neon + sandbox billing;* **human:** accounts/secrets, Play products, service account, Stripe, SKU decision.
- **P5** — Daily nudge: `public/sw.js` push handlers, opt-in UI, `push_subscriptions`, `GET /api/cron/nudge` (hourly, timezone-correct, one/day), `vercel.json` crons. *Autonomous code;* **human:** VAPID keys (you generate, human stores), Vercel Pro.
- **P6** — Progress/BAI: `lib/coach/bai.ts` (behavioral components, CDC-DPP-cited bands, never predicted A1C), `GET /api/cron/bai-weekly`, `app/progress/page.tsx`, `app/how-it-works/page.tsx`. *Autonomous.*
- **P7** — Production hardening + observability → **GATE 1.** Env wiring, verify `maxDuration`, extend `/api/health`, Sentry scrub verified on real traffic, Plausible live with the payload allowlist, run the consistency check N=50 and record the flip rate, all suites green. *Autonomous: config/code/tests/preview deploy;* **human:** prod secrets, domain+DNS, Vercel Pro, the production deploy.
- **P8** — TWA packaging + real-device QA: Bubblewrap `.aab`, fill `public/.well-known/assetlinks.json` from the real SHA-256 after first upload, manifest screenshots, `docs/ops/device-qa-checklist.md`. *Autonomous: config/template/scripts + checklist;* **human:** keystore, upload, physical device, license-tester purchase/restore.
- **P9** — Play Console submission (Track B merges): finalize listing/Data Safety/health declarations/deletion URL/reviewer login. *Autonomous: all drafts in `docs/ops/`;* **human:** $25 account, counsel sign-off, the submission.
- **P10** — Launch, support, incident response → **GATE 2.** *Autonomous:* support playbook, monitoring/incident scaffolding, launch checklist; **human:** acquisition, support ownership, on-call, refunds.

**Track B (legal/store, parallel, start day 1):** counsel engagement (the four counsel-brief questions **plus** the new ones in plan §7 B1: insights-SaMD, Art. 9 consent wording, refund adequacy, the 3 "reversal" lines, and the forward-looking D5 imaging-SaMD question); privacy/ToS drafts; Data Safety + health-declaration mapping; store listing copy; the internal-doc corrections in plan §7 B5 (PP-taxonomy reconciliation, purge remaining "96M" → 115.2M, mark PRD §7.8 accuracy figures unverified).

**Track C (human/admin, parallel, start day 1):** the exhaustive inventory in plan §10 — accounts, secrets, domain, Play Console, keystore, device, money, counsel.

---

## When you hit a human-only step

Do everything up to it (mock/dev-path where possible — dev Neon branch, Resend dev key, Stripe test mode, Play sandbox, seeded test accounts), log it in the running "Human action required" list, and **keep moving to the next autonomous task** instead of blocking. The only truly un-mockable cluster is Play + legal + physical device (P8–P9).

### Human action required — running list (append as you go; seed from plan §10)

**§0 Before start:** confirm branch/commit/preview-deploy permission · decide & record: final domain · Play account type (ID verification takes days — start now) · launch SKUs/prices · free-tier count · support email · refund stance · US-only vs EU · approve brand assets.
**§1 Accounts:** Neon · Resend (+ verified domain) · Upstash prod · Sentry prod · Edge Config · Plausible · Google Play Developer ($25) · Google Cloud (Play Developer API + service account + RTDN topic) · Vercel Pro · OpenAI (exists) · domain registrar · Stripe.
**§2 Secrets (Vercel preview+prod; ⚙ = session generates, human stores):** `OPENAI_API_KEY` · `UPSTASH_REDIS_REST_URL/_TOKEN` · `SENTRY_DSN` · Edge Config · `DATABASE_URL` · ⚙`AUTH_SECRET` · ⚙`HEALTH_DATA_KEY` · ⚙`VAPID_PUBLIC_KEY`/`_PRIVATE_KEY` · `RESEND_API_KEY` · `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` + `PLAY_PACKAGE_NAME` + `RTDN_SHARED_TOKEN` · `STRIPE_SECRET_KEY`/`_WEBHOOK_SECRET`/price IDs · `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` · `CRON_SECRET` · `NEXT_PUBLIC_APP_URL`.
**§3 Money:** Play $25 · Vercel Pro · domain · OpenAI usage · Neon/Resend/Plausible/Upstash tiers · Stripe fees · counsel fees.
**§4 Legal/counsel:** sign-off per plan §7 B1 · OpenAI DPA · Art. 9 consent wording · trademark "Revora" · company entity · privacy+ToS live · deletion URL declared · tax/banking in Play merchant profile · CCPA stance.
**§5 Domain/DNS/email:** domain → Vercel · Resend DNS (SPF/DKIM/DMARC) · assetlinks reachable on live domain.
**§6 Play Console:** app · internal track + testers · subscription products/prices · license testers · all forms (Data Safety, content rating, adults, health, ads, export, deletion URL, reviewer login) · listing assets · upload `.aab` · rollout · review responses.
**§7 Signing:** Play App Signing + upload keystore · first upload → SHA-256 into assetlinks · build & sign `.aab`.
**§8 Hardware:** physical Android device · device Google account on internal track + license-tester payment method.
**§9 Cutover approvals:** provision prod secrets → approve production deploy (P7) → approve Play submission (P9).
**§10 Post-launch:** acquisition · support owner · monitoring/on-call · refunds/incident response.

---

## Definition of Done (completion gates, not go/no-go validation gates)

**Gate 1 — Heavy Build (end of P7):** accounts + server DB live & backed up · history persists cross-device · billing end-to-end (subscribe/renew/cancel/restore/refund) + server receipt verification + entitlement enforced · text + voice input live (photo deferred) · card carries sequencing + post-meal action · onboarding + daily loop + streak + week view + insight + nudge + weekly BAI · A1C + food encrypted/access-controlled/scrubbed · account+data deletion + public URL · privacy lockstep docs shipped in the same PR as state · all suites green + axe zero-violation · `lib/revora/` behavior unchanged (regression + evals prove it) + consistency flip-rate recorded · Sentry (scrub-verified) + privacy-safe analytics in prod · deployed to Vercel prod on the real domain.

**Gate 2 — Fully-Fledged App (end of P10):** everything in Gate 1, plus — signed TWA `.aab` + assetlinks verified · full device QA incl. real Play purchase/restore · live on Play (health-app policies passed) · listing/Data Safety/health declarations accurate & inside the claims boundary + deletion URL declared · counsel sign-off recorded · real users can find→install→onboard→return→pay (funnel instrumented as measurement, not a gate) · support + monitoring + incident response operating · the 4 guardrails re-verified on every shipped surface.

---

## Do NOT

- Reintroduce validation/kill-gates (WTP smoke test, D1/D7, retention checkpoints) as go/no-go gates — the owner disabled them; they are build milestones.
- Build D5 photo-assist — specify-only is done in the plan; do not write vision/camera code or photo marketing.
- Add a fourth input method. Exactly three: Text, Voice, Photo-assist (deferred). CGM is excluded, not an input method.
- Weaken the engine or its floors, or let voice transcription (or later D5) bypass the conservative floors or the ≤1-clarify contract.
- Emit numeric glycemic claims (GI/GL/carbs/mg-dL/future-A1C) from any surface, or make accuracy / "AI-powered" / reversal-by-app claims, or let a disclaimer launder a stronger claim.
- Ship the backend without the privacy-lockstep doc updates in the same PR, or store A1C without encryption + scrub.
- Push, deploy to production, create paid accounts, spend money, or submit to Play without the user.

## First move (do this now)

Read `docs/production-implementation-plan-2026-07-01.md` in full → verify the baseline → establish the clean green branch (Phase 0) → write the regression suite + consistency harness + 3 ADRs → seed the "Human action required" list and kick off Tracks B and C → start Phase 1. Work phase by phase, commit per task, keep every suite green, and append to "Human action required" as you hit external steps.
