# 23 — Launch execution + live smoke — 2026-07-18

Executes §3 of `docs/handoff/2026-07-17-owner-risk-full-launch-session-handoff.md`
on the owner's explicit in-session instruction (2026-07-18): "Execute all the
actions below and complete any outstanding items" — steps 1–6, including the
merge to main.

## Step 1 — Shipped

- PR #17 (`feat/photo-path-tier1` → `main`), squash-merged 2026-07-18T04:02Z.
  Includes the 2026-07-17 audit batch (39 files) + the production-path eval
  artifact commit.
- **Main CI: green** (run 29629872144, 8m23s) — first green main since the
  stale `env.test.ts` fix.
- Production deploy: Ready (`revora-j0mkqhr5b…`), `/api/health` 200.

## Step 2 — Model capacity: DONE (OpenRouter path, option b)

Vercel production env now carries:
`OPENAI_BASE_URL=https://openrouter.ai/api/v1`, `OPENAI_API_KEY=<OpenRouter
key>`, `REVORA_MODEL=openai/gpt-5.4-mini`, `REVORA_VISION_MODEL=openai/gpt-5.4-mini`.

- Production-path confirmation (local, exact prod config):
  `artifacts/qa/graded-eval-live-2026-07-18T03-50-43-950Z.json` — **33/33
  calls, 0 modelFailures, 0 harmful-SAFE, riskAccuracy 97.0%, passed** (on
  main via PR #17). LABEL: OpenRouter path — this IS the production path now,
  so N-19 (path mismatch) is closed by construction.
- Live prod `/api/check` returned a real verdict (`kind:"result"`, MODERATE,
  full reason/adjustment/swap/disclaimer) — not the retry fallback.
- ⚠️ OpenRouter balance at execution time: **~$3.13** ($21 credits, $17.87
  used). OWNER: top up at openrouter.ai — the only spend meter left.

## Step 3 — Stripe

- **Live checkout wire VERIFIED on prod**: `POST /api/trial/start` returned a
  real `cs_live_…` Checkout URL (live key valid, live price IDs resolve,
  checkout gate open, HTTPS return URL passes). No payment was made.
- **H23 test-mode lifecycle (E2E-06)**: see result section below. Harness was
  repaired for three drifts that postdate its last green run (2026-07-11):
  the PR #11 HTTPS return-URL gate, the `termsAccepted`/`termsVersion` fields
  now required by `TrialStartSchema`, and Checkout-page selector churn.
- **Still OWNER (live-mode dashboard, ~15 min)** — the live secret key exists
  only as a sealed Vercel var, so the agent could not do these:
  - H21: dashboard.stripe.com → Developers → Webhooks → Add endpoint
    `https://revora.bio/api/billing/stripe/webhook` (after DNS; until then
    `https://revora-lovat.vercel.app/api/billing/stripe/webhook`), events:
    `checkout.session.completed`, `customer.subscription.updated`,
    `customer.subscription.deleted`, `invoice.paid`,
    `invoice.payment_failed`, `charge.refunded`; API version
    `2025-03-31.basil`+ (H24) → copy the signing secret → update
    `STRIPE_WEBHOOK_SECRET` in Vercel prod → redeploy. Without this a live
    payment succeeds but the entitlement never flips.
  - H20: Settings → Billing → Customer portal → Save a default live-mode
    configuration (test mode already has one; the portal route uses the
    account default).

## Step 4 — Ops

- **Crons: already healthy.** `/api/health` shows all four
  (`nudge`, `baiWeekly`, `trialPrecharge`, `pantrySweep`) `ok` — the G2
  staleness is gone; no Railway cron service exists (Railway hosts only the
  two Postgres instances), so no action was needed.
- **DNS: OWNER, registrar-side.** `revora.bio` currently has NO nameservers
  (does not resolve). At the registrar set nameservers to
  `ns1.vercel-dns.com` + `ns2.vercel-dns.com` (recommended — everything below
  is pre-staged on Vercel DNS) or set `A revora.bio → 76.76.21.21`.
  `NEXT_PUBLIC_APP_URL` is already `https://revora.bio`, so OG image URLs,
  sitemap entries, and Stripe return URLs point at the final origin — **link
  previews and post-checkout redirects are broken until DNS resolves.**
- **Resend: pre-staged, verification pending DNS.** Domain `revora.bio`
  created in Resend (id `a0913c02-954d-485f-bd0b-a3dc82aafb59`); its DKIM
  TXT, SPF TXT and MX records are already entered in Vercel DNS. After the
  nameserver switch: press Verify in Resend, then set `AUTH_EMAIL_FROM` to a
  `@revora.bio` sender. **Until then customer magic-link email does not
  deliver** (Resend had zero verified domains).
- **Umami: OWNER choice still needed.** No Umami instance exists anywhere
  (Railway has only the databases; CLI template deploy requires an
  interactive TTY). One-click "Umami" template from the Railway dashboard →
  then set `NEXT_PUBLIC_UMAMI_SRC` + `NEXT_PUBLIC_UMAMI_WEBSITE_ID` in Vercel
  prod → redeploy. CSP follows automatically. Funnel is blind until then.
- **Key rotation (overdue hygiene, OWNER consoles):** OpenRouter key in
  `openr.md` (now also production's model key — rotate then update the Vercel
  var), plus OpenAI/Resend/Upstash×2/Blob from history `213ab8a`.
- **Stray project:** Vercel project `revora-irj3` duplicates every deploy of
  this repo without production env. Recommend deleting it in the Vercel
  dashboard (agent did not delete infrastructure unasked).

## Step 5 — Flags: DONE

`NEXT_PUBLIC_PHOTO_INPUT=1` and `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS=1` set in
Vercel prod before the merge, so the production deploy carries them. Verified
live: photo copy renders on the landing/check surfaces and
`POST /api/check/photo-draft` answers (400 on empty body = alive and
validating). `NEXT_PUBLIC_PLAY_BILLING` and `LEGAL_TERMS_FINAL` left unset
per the handoff (kill switch remains `LEGAL_TERMS_FINAL=0`).

## Step 6 — Live smoke on the deployed revision (2026-07-18, agent)

| Surface | Result |
|---|---|
| `/api/health` | 200 — launch ready, checkout open, db ok, 4/4 crons ok |
| Pages `/ /check /subscribe /how-it-works /pantry /privacy /terms /onboarding /history /progress /account /trial/started /canceled /get-the-app` | all 200 |
| Real check (`POST /api/check`, oatmeal case, a1c 5.9) | real MODERATE verdict via OpenRouter — not retry fallback |
| Photo path | flag copy live; `/api/check/photo-draft` alive |
| Live checkout | `cs_live_…` session URL returned |
| `robots.txt` / `sitemap.xml` | live; sitemap URLs on `https://revora.bio` |
| OG meta + `/opengraph-image` | meta present; image 200 `image/png` on the deploy origin; `og:image` URL resolves only after DNS |
| Magic-link sign-in, entitlement flip, cancel | **deferred to post-DNS/Resend** — cannot deliver email to a real inbox until the sending domain verifies; test-mode lifecycle covers the mechanics (below) |

## E2E-06 test-mode lifecycle result — ALL STEPS PASSED

Run `artifacts/qa/e2e06-2026-07-18T04-18-35-314Z.json` (Stripe TEST mode,
throwaway local Postgres, emails to disk): checkout URL → hosted Checkout
completed with the 4242 card (session `complete`) → signed
`checkout.session.completed` webhook accepted → subscriptions row `trialing`
(variant 1299) → magic-link session → `/api/entitlement` premium/trialing →
pre-charge email written with cancel link → `pre_charge_email_sent_at`
stamped → one-tap cancel flips `cancel_at_period_end` on Stripe → row stays
trialing until period end → portal session created → subscription deletion
lapses the row to free. 12/12 steps green.

## Residual owner checklist (the only things between here and fully-lit)

1. Registrar: nameservers → `ns1/ns2.vercel-dns.com` (unblocks domain, OG
   cards, Stripe return URLs on the final origin, Resend).
2. Resend: Verify `revora.bio`, set `AUTH_EMAIL_FROM` accordingly.
3. Stripe dashboard: live webhook endpoint (+ signing secret into Vercel) —
   H21/H24; default live portal config — H20.
4. OpenRouter: top up credits.
5. Railway dashboard: deploy Umami template; set the two Umami vars in
   Vercel.
6. Rotate exposed keys (openr.md + history 213ab8a).
7. Optional cleanup: delete stray Vercel project `revora-irj3`.
