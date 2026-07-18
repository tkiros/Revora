# Session handoff — full launch under owner risk acceptance (2026-07-17)

**Use this file as the opening prompt of the next session.** It supersedes the
"No-go rules" framing of `docs/handoff/2026-07-17-revora-true-done-continuation-handoff.md`
and the launch-sequencing of the WTP-first handoff wherever they conflict.
Companion evidence: `docs/handoff/2026-07-17-revora-true-done-audit-remediation-report.md`,
ledger `docs/qa/22-true-done-issue-ledger-2026-07-17.md`,
corpus manifest `docs/qa/21-md-corpus-manifest-2026-07-17.md`.

---

## 1. The owner's decision, recorded (2026-07-17)

> "The below two issues must not be blocking gate what so ever. I am going to
> do them whenever it is convenient. So every part of the app should be active
> including the billing and any other blocked part of the app. The app should
> be fully functional and ready to serve customers and take payment as it is
> intended. I have taken all the necessary actions to make sure the app is
> safe and helpful. I am not going to worry about the below issues for the
> app nobody knows. I will take the full responsibility."
>
> — referring to (1) W-05/F-06, the credentialed RD/CDCES panel, and
> (2) the licensed-counsel gate (`COUNSEL GATE: NOT CLEARED`).

**What this changes:** the dietitian panel and counsel review are, by owner
decision, **post-launch quality tracks, not launch gates**. Nothing blocks
serving customers or taking payment on their account.

**What this does NOT change (truth labels stay exact — they cost nothing and
keep the record clean):**

- W-05/F-06 remains **factually OPEN** until real signed reviews make
  `npm run review:dietitian:close` pass. It is simply **non-blocking** now.
  Whenever the owner closes it, it closes only the authentic way — the
  validator is never simulated, backfilled, or weakened.
- `COUNSEL GATE: NOT CLEARED` remains the factual status until licensed
  counsel writes otherwise. Checkout being open is **owner-risk** (this
  decision + commit `8c30265`); `LEGAL_TERMS_FINAL=0` stays available as the
  instant kill switch. No artifact may say "counsel cleared" until counsel
  writes it.
- Panel/simulated artifacts keep their `SIMULATED — NON-CREDENTIALED` labels.
- Safety engineering stays fail-closed everywhere it is today (clinical
  routing, postprocess floors, retry fallback, disclaimers). None of that was
  ever the blocked part — it ships as-is.

Owner acceptance scope: full public operation of the web app (checks,
accounts, subscriptions/trial, Pantry Review payments) on the owner's stated
responsibility. Evidence basis at decision time: the 2026-07-17 audit (all
local gates green; live-provider evidence = OpenRouter 97.0% riskAccuracy,
0 harmful-SAFE, 0 retry cards, 2026-07-16; no credentialed clinical review;
counsel waived). This paragraph is the record the repo convention requires —
it amends `docs/legal/owner-risk-launch-decision-5f6abcb.md` in scope by this
later dated owner decision.

---

## 2. What has been done (state at handoff)

### The 2026-07-17 true-done audit session (all uncommitted in the working tree)

- Read all **408** repo Markdown files; reconciled every claim into the
  canonical ledger (35 rows) + contradiction table; mapped the full code
  surface (25 pages, 41 API routes, 5 migrations, 14 tables/8 encrypted cols).
- **Fixed, each with regression tests:**
  1. CI-red on main (stale `env.test.ts` checkout-gate expectation).
  2. Attribution — onboarding "Where did you hear about us?" step, closed-enum
     `attribution` analytics event, first-touch UTM→enum capture in layout.
  3. Link-sharing basics — OG/Twitter meta + `metadataBase`, branded
     1200×630 `app/opengraph-image.tsx`, `app/sitemap.ts`, `app/robots.ts`.
  4. Landing pricing now renders from `paywallMode()` +
     `resolvePriceVariant()` — copy can never mismatch the live funnel/price.
  5. CSP now allows the Umami origin (was silently killing all analytics).
  6. Pantry photo URLs restricted to the Vercel Blob store (no fetch relay).
  7. Timing-safe cron doorway on `/api/pantry/process`.
  8. De-polluted committed `tsconfig.json`; gate-doc corrections
     (`docs/ops/env-reference.md` LEGAL_TERMS_FINAL row; dated corrections in
     the WTP handoff).
- **Final clean-room verification (local, this tree):** lint 0 · typecheck 0 ·
  **unit 1310 passed / 2 skipped / 0 failed (124 files)** · contract 0 ·
  eval:revora 0 · build 0 · **Playwright exit 0: 136 passed / 2 Safari
  retry-flakes / 12 conditional skips / 0 failed** (chromium + Mobile Chrome +
  Mobile Safari, legacy :3100 + trial :3101 servers) ·
  `npm audit --omit=dev` 0 vulns · secret scan clean.
- `review:dietitian:close` exit 1 = correct fail-closed (now non-blocking).

### Changed files awaiting commit

`app/layout.tsx`, `app/page.tsx`, `app/(app)/onboarding/page.tsx`,
`app/opengraph-image.tsx`*, `app/robots.ts`*, `app/sitemap.ts`*,
`app/api/pantry/{submit,process}/route.ts`,
`components/attribution-capture.tsx`*, `lib/client/attribution.ts`*,
`lib/client/analytics.ts`, `next.config.ts`, `tsconfig.json`,
`tests/unit/revora/{env,seo-meta*,landing-paywall-copy*}.test.ts`,
`tests/unit/client/{analytics,onboarding-flow,attribution*}.test.ts`,
`tests/unit/server/{pantry-submit,csp-umami*,pantry-process-route*}.test.ts`,
`tests/smoke/{onboarding,billing-pages,trial-wall}.spec.ts`,
`docs/ops/env-reference.md`, `docs/qa/21*`, `docs/qa/22*`, the audit report,
both continuation handoffs, this file. (*new files.*)
Pre-existing user dirty files were preserved
(`2026-07-12-unconditional-go-handoff.md`, `docs/qa/18…`, earlier untracked
handoffs). `next-env.d.ts` flips dev/build flavor with the last tool run —
benign.

---

## 3. Exact path to TRUE DONE (fully live, serving customers, taking payment)

Order matters. Steps 1–6 are the only things between this tree and customers.

### Step 1 — Ship the tree (owner, ~10 min)

```bash
cd /home/tefera/Desktop/Revora
git add -A && git status          # review the list against §2 above
git commit -m "audit batch 2026-07-17: WTP surface (attribution+OG+sitemap), mode-aware landing, CSP/Umami, hardening, CI fix"
git push origin feat/photo-path-tier1
# open PR → merge to main (main auto-deploys production)
```
Verify: GitHub Actions green on main (the env.test fix makes it green);
Vercel deploy healthy; `/api/health` 200.

### Step 2 — Model capacity: the ONE real functional blocker (owner)

The direct-OpenAI org key is capped **50 requests/day** — the app cannot
serve real traffic on it. Pick one, today:
- **(a)** platform.openai.com → Billing: fund + raise tier; or
- **(b)** route production through OpenRouter: set
  `OPENAI_BASE_URL=https://openrouter.ai/api/v1` + OpenRouter key in Vercel
  (engine already supports it; all live gates ran this path), and top up
  credits (balance was ~$3.19).
Then run the production-path confirmation (~$0.05):
```bash
export OPENAI_API_KEY=<the production key>
unset OPENAI_BASE_URL REVORA_MODEL        # (a) only; for (b) set the base URL
npm run eval:revora:live                  # expect: passed, 0 harmful-SAFE, 0 retry cards
```
Save the artifact under `artifacts/qa/` (`git add -f` — dir is gitignored).

### Step 3 — Payment rails actually wired (owner, Stripe dashboard + Vercel)

Money already CAN be taken (checkout open by default). For entitlements to
flip and lifecycles to run, finish:
- **H21**: create the live webhook endpoint → set `STRIPE_WEBHOOK_SECRET` in
  Vercel prod.
- **H20**: configure the billing portal (cancel/manage).
- **H24**: pin webhook API version (`2025-03-31.basil`+).
- **H23** (recommended): test-mode mirror keys in preview → run one full
  test-mode checkout→webhook→entitlement→cancel pass before announcing.
- Confirm price IDs present: `STRIPE_PRICE_MONTHLY_{999,1299,1999}`,
  `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_PANTRY`.
- Decide `PAYWALL_MODE` in Vercel prod: unset/`trial` = card-gated 7-day
  trial; `legacy` = 5/day free tier. **Landing copy now auto-matches either.**

### Step 4 — Production ops unstick (owner)

- **Railway crons (G2)**: `trialPrecharge` + `pantrySweep` were STALE in prod
  — with trial mode + payments live, the pre-charge email is a promise the
  app makes. Fix the Railway scheduler, then verify `/api/health` shows all
  four crons `ok`.
- DNS: `A revora.bio → 76.76.21.21` (links say revora-lovat.vercel.app until
  then). Update `NEXT_PUBLIC_APP_URL` to the final origin (feeds OG URLs,
  sitemap, Stripe return URLs).
- Resend sending domain verified (magic-link + pantry + pre-charge emails).
- Analytics: set `NEXT_PUBLIC_UMAMI_SRC` + `NEXT_PUBLIC_UMAMI_WEBSITE_ID`
  (CSP follows automatically now). Without it the funnel is blind.
- Rotate the exposed keys (OpenRouter in `openr.md`; OpenAI/Resend/Upstash×2/
  Blob in history `213ab8a`) — not a launch gate, but overdue security
  hygiene; ~30 min at the provider consoles.

### Step 5 — Activate the remaining flagged features (owner env choice)

Per this decision "every part of the app should be active." These are
build-time env vars in Vercel (set → redeploy). This decision is the written
owner approval the docs required:
- `NEXT_PUBLIC_PHOTO_INPUT=1` — meal-photo assist (Tier-1 engineering-proven:
  40/40 clean, draft→confirm only, photos never persisted).
- `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS=1` — weekly pattern insight surfaces.
- Leave `NEXT_PUBLIC_PLAY_BILLING` unset (Play chain isn't built out —
  separate track, web payments unaffected).
- Leave `LEGAL_TERMS_FINAL` unset (checkout open; `0` = instant kill switch).
After the redeploy, spot-check: photo control renders on /check and
`/api/check/photo-draft` answers; landing/how-it-works copy auto-shows the
photo + insights lines (they key off the same flags).

### Step 6 — Live smoke on the deployed revision (next session, ~30 min)

From a fresh browser against production: landing → onboarding (6 steps incl.
attribution) → first check returns a REAL verdict (not the retry fallback) →
sign-in magic link → history/progress → paywall per live mode → (test-mode or
real per owner) checkout → entitlement flips → cancel works → pantry purchase
path → `/api/health` all green → link paste into a chat/DM shows the OG card.
Record results in a dated QA doc. Any failure: fix → re-verify → redeploy.

**Definition of TRUE DONE (this decision's terms):** Steps 1–6 verified on the
deployed revision = the app is fully functional, serving customers, taking
payment, with every feature active. Panel + counsel proceed "whenever
convenient" (§4) and their labels stay truthful until then.

---

## 4. Non-blocking quality tracks (owner, whenever convenient)

- **RD/CDCES panel (W-05/F-06):** recruit per
  `docs/qa/dietitian-review/recruitment-one-pager.md` (3 reviewers, ≥2 RDN,
  ≥1 CDCES, registry-verified, paid, blinded; ~2–4 weeks calendar). Packet is
  ready (docs 17/18/19/20, ontology v2026-07-16.1, portion-convention's 4
  questions, 9 parked band calls). Closes ONLY via signed
  `panel-review.json` → `npm run review:dietitian:close` green.
- **Licensed counsel:** packet at `docs/legal/counsel-packet/5f6abcb/` +
  `owner-input-required.md` blanks (entity, jurisdiction, refund owner).
  Until written clearance, the status line stays `NOT CLEARED`.
- **Tier-2 consent-clean photos:** cheapest via the in-app QA-consent checkbox
  once real users exist → completes 240/240 coverage for the panel.
- P3 hygiene list: ledger `docs/qa/22…` §C R-035 (bcb strays, gmgn agent
  files, railway stubs, reversal-era tombstones, doc cruft).

---

## 5. Standing rules for the next session (still in force)


- Clean env for tests: `env -u REVORA_MODEL -u OPENAI_BASE_URL npm test` /
  `npx playwright test`.
- OpenRouter evidence ≠ OpenAI-direct evidence — label which path any live
  run used.
- `artifacts/` is gitignored — QA evidence is force-added (`git add -f`).
- Agent never merges to main unless the owner says so in-session (main
  auto-deploys and costs real money). This handoff's Step 1 is written for
  the owner; an agent may execute it only on explicit instruction.
- Retry cards: never guess the cause — reproduce with the instrumented
  harness (`buildRevoraPrompt` → model → `postprocessModelOutput`).
- Risk-raising token lists are substring-matched on purpose; fix collisions
  via pre-strip exclusions, never by tightening the match.
- Preserve user-owned dirty files; append dated corrections, never rewrite
  history docs.

## 6. First commands, next session

```bash
cd /home/tefera/Desktop/Revora
git status --short && git log --oneline -5     # confirm what shipped
env -u REVORA_MODEL -u OPENAI_BASE_URL npm test
env -u REVORA_MODEL -u OPENAI_BASE_URL npx playwright test
gh run list --branch main --limit 3            # CI truth on main
# then execute §3 from wherever the owner has gotten to
```
