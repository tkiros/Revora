# Human action required — running list (full-build execution)

**Started:** 2026-07-01 · **Maintained by:** the build session — appended as phases surface human-only steps.
Source inventory: `docs/production-implementation-plan-2026-07-01.md` §10. Status legend: ☐ open · ⏳ long-lead, start NOW · ✅ done.

Reconciled 2026-07-04 against docs/handoff/2026-07-04-unified-completion-plan.md Appendix A — that appendix is the deduplicated master list.

## ⚠ Longest-lead items — start these today

1. ⏳ **Counsel engagement** (Track B B1). Questions: the four in `docs/legal/counsel-brief.md` **plus** Q5 insights-SaMD, Q6 Art. 9 consent wording, Q7 refund adequacy, Q8 the 3 "reversal" lines (Brand Positioning L240/287/295), Q9 forward-looking imaging-SaMD (D5 gate), Q10 review of the `app/terms/page.tsx` draft (P9 — subscription/refund/liability/governing-law language and the two bracketed placeholders it still carries). Sign-off must be on file before Play submission (P9).
2. ⏳ **Google Play Developer account ($25)** — ID verification takes days. Decide **account type** (individual vs business) first.
3. ⏳ **Trademark clearance "Revora"** (2–4 weeks).
4. ⏳ **Domain decision + purchase** — everything in P7–P9 (DNS, Resend deliverability, assetlinks, deletion URL, listing URLs) hangs off the final domain.

## §0 Decisions before/at start (defaults let the build proceed)

- ☐ Confirm branch/commit/preview-deploy permission (Vercel authed)
- ☐ Final domain (record here: ______)
- ☐ Play account type (individual/business)
- ☐ Launch SKUs/prices — default **$12.99/mo · $99.99/yr**, lifetime deferred
- ☐ Free-tier daily check count — default **5**
- ☐ Support email — default `support@<domain>`
- ☐ Refund policy stance
- ☐ US-only vs EU launch — default **US-only**
- ☐ Approve app name/icon/brand as final

## §1 Accounts to create

- ☐ open — Railway (Postgres database; backups on — supersedes the earlier Neon
  plan, `docs/adr/hosting-hybrid.md`): CLI installed and logged in; **DB not yet
  provisioned — no `DATABASE_URL` exists**
- ☐ open — Resend (+ verified sending domain): signed up, API key in the
  environment file, CLI installed and authenticated; **domain verification
  unconfirmed**
- ✅ done — Upstash prod: signed up, API key set in environment file, CLI
  installed and authenticated
- ☐ open — Sentry prod: signed up, CLI installed and authenticated;
  **`SENTRY_DSN` in Vercel unconfirmed**
- ☐ open — Vercel Edge Config
- ☐ open — Umami: cloud account created; self-host on Railway **failing**
  (`git clone` + `pnpm install` erroring) — decide cloud-vs-self-host, see
  Appendix A H8 (`docs/handoff/2026-07-04-unified-completion-plan.md`)
  (self-hosted on Railway — supersedes the earlier Plausible plan,
  `docs/adr/analytics-umami.md`)
- ⏳ Google Play Developer ($25)
- ☐ Google Cloud project (Play Developer API enabled, service-account JSON, RTDN Pub/Sub topic)
- ☐ Vercel Pro (hourly crons + function limits)
- ☐ OpenAI prod key/quota (exists — confirm limits)
- ☐ Domain registrar
- ✅ done — Stripe (account, verification, bank): logged in, account live,
  MCP authenticated

## §2 Secrets to provision in Vercel (preview + prod; ⚙ = session generates, human stores)

`OPENAI_API_KEY` 
· `UPSTASH_REDIS_REST_URL`/`_TOKEN` 
· `SENTRY_DSN` · Edge Config 
· `DATABASE_URL` (Railway Postgres) 
· ⚙`AUTH_SECRET` · ⚙`HEALTH_DATA_KEY` 
· ⚙`VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` 
· `RESEND_API_KEY` 
· `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` + `PLAY_PACKAGE_NAME` + `RTDN_SHARED_TOKEN` 
· `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/price IDs 
· `NEXT_PUBLIC_UMAMI_SRC`/`NEXT_PUBLIC_UMAMI_WEBSITE_ID` 
· `CRON_SECRET` 
· `NEXT_PUBLIC_APP_URL` 
· ⚙`REVIEWER_TEST_SECRET` (**preview only**) 
· `NEXT_PUBLIC_REVIEWER_MODE` (**preview only, never production**)

## §3 Money

. Play $25 
· Vercel Pro ~$20/mo 
· domain ~$12/yr 
· OpenAI usage 
· Railway/Resend/Umami-hosting/Upstash tiers 
· Stripe fees 
· counsel fees

## §4 Legal / counsel / compliance

- ⏳ Counsel sign-off per Track B B1 (see top)
- ☐ OpenAI DPA executed
- ☐ GDPR Art. 9 consent wording approved (blocks 4A sign-up copy finalization; build uses draft wording marked `COUNSEL-DRAFT`)
- ⏳ Trademark clearance "Revora"
- ☐ Company entity confirmed (payouts/tax)
- ☐ Privacy policy + ToS live on prod domain
- ☐ Deletion URL declared in Play
- ☐ Tax/banking in Play merchant profile (W-9/W-8 + payout bank)
- ☐ CCPA stance recorded (US-only default: no sale/share)

## §5 Domain / DNS / email

- ☐ Domain → Vercel + verify
- ☐ Resend DNS (SPF/DKIM/DMARC) so magic links deliver
- ☐ `/.well-known/assetlinks.json` reachable on the live domain (needs §7 fingerprint)

## §6 Play Console

- ☐ Create app · internal-testing track + testers
- ☐ Subscription products/base plans/prices (after §0 SKU confirmation)
- ☐ License testers
- ☐ Forms: Data Safety, content rating, target audience (adults), health declarations, ads=none, export compliance, account-deletion URL, app-access reviewer login — code is in place (`app/api/auth/reviewer-signin/route.ts`, `/signin`'s "Reviewer access" form); enter `reviewer@revora.test` + the `REVIEWER_TEST_SECRET` value in the Play Console "App access" form (see the P9 entry below for the setup steps)
- ☐ Store listing assets (title/descriptions/feature graphic/screenshots/icon/privacy URL)
- ☐ Upload `.aab` · rollout internal → closed → production · respond to review

## §7 Signing / packaging

- ☐ Play App Signing + upload keystore (Bubblewrap); safeguard passwords
- ☐ First upload → copy App Signing SHA-256 into `public/.well-known/assetlinks.json`
- ☐ Build & sign the `.aab`

## §8 Hardware

- ☐ Physical Android device (emulators can't fully test Play Billing)
- ☐ Device Google account on internal track + license-tester payment method

## §9 Cutover approvals

- ☐ Provision prod secrets → ☐ approve production deploy (P7) → ☐ approve Play submission/rollout (P9)

## §10 Post-launch

- ☐ Acquisition execution (r/prediabetes, SEO, ASO, doctor channel)
- ☐ Support ownership · ☐ monitoring/on-call · ☐ refunds/incident response

---

## Appended during the build

*(phase-stamped additions land here)*

### P7 — Production hardening + observability (2026-07-02)

Two owner infra decisions are implemented in code and waiting on
provisioning (`docs/adr/hosting-hybrid.md`, `docs/adr/analytics-umami.md`):

- ☐ **Provision Railway Postgres** and set `DATABASE_URL` in Vercel
  (preview + production). The app already speaks plain Postgres over TCP
  (`pg` / `drizzle-orm/node-postgres`, `lib/server/db/index.ts`) — no code
  change needed once the URL is set. Run `npx drizzle-kit migrate` against
  it once provisioned (`docs/ops/env-reference.md`).
- ☐ **Deploy/self-host Umami** (on Railway, per the ADR) and set
  `NEXT_PUBLIC_UMAMI_SRC` + `NEXT_PUBLIC_UMAMI_WEBSITE_ID` in Vercel
  (preview + production). Analytics stays fully inert (no script tag, no
  tracking calls) until both are set.
- ☐ **Sentry canary verification** — trigger one real error on a deployed
  preview and confirm it lands in Sentry (`SENTRY_DSN` is already wired
  through `captureServerError`; this task only verifies live delivery,
  which can't be done from this environment).
- ☐ **Run `scripts/consistency-check.mjs` N=50 against a real preview
  deploy** and record the flip rate in `docs/ops/launch-controls.md` —
  target **≥95% modal class**. Needs a deployed preview URL + live
  `OPENAI_API_KEY` traffic, neither available in this build environment.
- ☐ **Human skim of the P6 BAI band strings + `/how-it-works` citations**
  (compliance surface) — `lib/coach/bai.ts`'s `BAI_BAND_COPY` and the CDC
  DPP citation on `/how-it-works` are claims-boundary-tested (no predicted
  A1C, no "reverse," calm tone) but haven't had a human compliance read.
- ☐ **`nudge_sent` send-counts**: Umami is client-script-based, so the
  server-side send event isn't tracked there by design (see
  `docs/adr/analytics-umami.md`). Until a server-side metrics pipeline
  exists, read send/prune/skip counts from cron logs, or from
  `/api/health`'s `crons.nudge` / `crons.baiWeekly` staleness probe
  (`ok`/`stale`/`never`) for a coarse liveness signal.

### P9 — Terms of Service + reviewer test-login (2026-07-02)

Both Play-submission-readiness artifacts are implemented and tested; three
manual steps remain before Play review can use them:

- ☐ **Counsel review of the `/terms` draft** — folded into item 1 (Q10)
  above. The page is marked `COUNSEL-DRAFT` in-app and carries a visible
  "Last updated" date; it has two bracketed placeholders (operating-entity
  name, governing law/venue) that need a real answer before this is final.
- ☐ **Run the reviewer-account seed script against the preview database**
  once Railway Postgres is provisioned (§1):
  `DATABASE_URL=<preview-url> HEALTH_DATA_KEY=<preview-key> node
  scripts/seed-reviewer-account.mjs`. Idempotent — safe to re-run. Creates
  `reviewer@revora.test`, fully onboarded/consented, Premium.
- ☐ **Set `REVIEWER_TEST_SECRET` and `NEXT_PUBLIC_REVIEWER_MODE=1` in
  Vercel — Preview environment only, never Production** (`docs/ops/env-reference.md`).
  The bypass route (`app/api/auth/reviewer-signin/route.ts`) additionally
  hard-404s whenever `VERCEL_ENV=production`, independent of these two
  vars, so this is a belt-and-suspenders setting, not the only lock.
- ☐ **Enter the reviewer credentials in the Play Console "App access"
  form**: email `reviewer@revora.test`, and the `REVIEWER_TEST_SECRET`
  value as the access code, plus a one-line note that the sign-in form is
  the small "Reviewer access" disclosure at the bottom of `/signin` (only
  visible on preview builds).

### P8 — TWA packaging + physical-device QA (2026-07-02)

Autonomous artifacts landed: `twa-manifest.json` (repo root, Bubblewrap
config template), `docs/ops/device-qa-checklist.md` (13-section physical-
device QA script), and a §9.3 note in `docs/ops/play-twa-runbook.md`
pointing at the manifest file. Everything below needs hands, hardware, or a
Play Console session:

- ☐ **Generate the Play App Signing keystore** and safeguard the signing
  key + passwords (§7 above) — needed before `bubblewrap build` can produce
  a real, submittable `.aab`.
- ☐ **Fill `twa-manifest.json`'s human-fill fields** once the domain is
  final: `host`, `webManifestUrl`/`iconUrl`/`maskableIconUrl`/
  `fullScopeUrl` (`<domain>` → the real production domain), and
  `signingKey.path`/`signingKey.alias` (never commit the actual keystore or
  its password).
- ☐ **First internal-testing-track upload** of the signed `.aab` to Play
  Console.
- ☐ **Copy the Play App Signing SHA-256** (Play Console → Setup → App
  integrity → App signing key certificate, available only after the first
  upload) and use it to fill + commit + deploy
  `public/.well-known/assetlinks.json` from the template in
  `docs/ops/play-twa-runbook.md` §9.3 — this file must **not** be created
  before the real fingerprint exists (placeholder fingerprints fail
  validation or forge trust).
- ☐ **Create a license-tester account** on the device's Google account
  (§8 above) so Play Billing purchases in QA don't charge a real card.
- ☐ **Run the full `docs/ops/device-qa-checklist.md`** on a physical
  Android device against the internal-testing build — this is the Gate 2
  evidence artifact for "Full device QA passed on hardware incl. real Play
  purchase/restore" (`docs/production-implementation-plan-2026-07-01.md`
  §11). Needs the keystore, the upload, assetlinks live on the production
  domain, and the license-tester account above, in that order.
- ⚠ **`public/manifest.webmanifest` gap found during this pass:** P8 asks
  for a `screenshots` array and maskable icons on the web manifest. Maskable
  icons are already present (`icon-maskable-512.png`), but there is **no
  `screenshots` array** — this is a small code change (editing
  `public/manifest.webmanifest`, which this docs/config-only task is not
  scoped to touch), not a human/ops action. Flagging here so it isn't lost;
  hand to an implementation pass before the P8 device-QA/Play-listing
  screenshots work, since a manifest `screenshots` array also improves the
  browser-native "install" UI richness independent of the Play listing's own
  screenshot assets (`docs/ops/play-listing.md` §9).

### P10 — Launch, support, incident response (2026-07-02)

Autonomous artifacts landed: `docs/ops/support-playbook.md` (response
macros + escalation ladder), `docs/ops/launch-checklist.md` (ordered go-live
list), and three stateful incident scenarios appended to
`docs/ops/launch-controls.md` §10.5 (DB down, billing-webhook gap, push
misfire). Everything below needs hands, a Play Console session, or a
business decision:

- ☐ **Paste the store listing into Play Console** from
  `docs/ops/play-listing.md` (title, descriptions, tags, content-rating
  answers, health-apps declaration, Data Safety form per
  `docs/ops/play-twa-runbook.md` §9.2) once the domain, `<...>` placeholders,
  and counsel sign-off (next item) are resolved.
- ☐ **Capture the screenshots** per `docs/ops/play-listing.md` §9's
  shot-list, signed in as the seeded `reviewer@revora.test` account so no
  real user's data appears in a public store asset.
- ⏳ **Counsel sign-offs Q1–Q10** (`docs/legal/counsel-brief.md`) —
  including Q10 (the `/terms` draft) and Q8 specifically (the three
  "reversal" lines in `Revora_Brand_Positioning_v2.md` — now softened
  toward the user-as-agent North-Star framing and marked inline
  `<!-- counsel Q8: pending confirmation -->` at the App Store subtitle
  tagline row (§11) and both Screen 1/Screen 3 onboarding lines (§13); still
  needs an actual counsel answer, not just the softened wording). Must be
  on file before Play submission and before any benefit-implying marketing
  (Gate 2, `docs/production-implementation-plan-2026-07-01.md` §11).
- ☐ **Create the `support@<domain>` inbox** and route it to whoever owns
  Tier 1/2 in `docs/ops/support-playbook.md`'s escalation ladder.
- ☐ **Stand up an uptime monitor** against `https://<domain>/api/health`
  (`docs/ops/launch-checklist.md` §7) — alert on non-200 or `ok:false`.
- ☐ **Assign on-call/refund ownership** as a named person or rotation
  (`docs/ops/support-playbook.md` §1 escalation ladder; §10 of the earlier
  running list already flags this as open).

### WS2 — Pantry Review pipeline, urgent/gates-the-build items (2026-07-04)

Copied verbatim from `docs/handoff/2026-07-04-unified-completion-plan.md`
Appendix A, items H1–H6 (the deduplicated master list):

| # | Action | Done when |
|---|---|---|
| H1 | **Rotate the Resend + Upstash keys** (they sat in `.env.example` and passed through AI transcripts) | New keys live in Resend/Upstash dashboards + updated in Vercel + local `.env`; old keys revoked |
| H2 | **Create the $25 pre-order Stripe Payment Link** (dashboard, no code) for the day-2 ask; copy its **price ID** → `STRIPE_PRICE_PANTRY` env; point the Stripe webhook endpoint at the deploy and set `STRIPE_WEBHOOK_SECRET`; **write the day-45 fallback paragraph (design doc Q1)**; **post the day-2 ask** (community rules read first). Ongoing: **pause the Payment Link whenever open orders ≥10** (weekly cap guardrail — check `/admin/pantry`) | Payment Link public; a test purchase produces a `pantry_orders` row on preview; the post is live; the paragraph is written and signed |
| H3 | **Enable Vercel Blob** on the project → `BLOB_READ_WRITE_TOKEN` (preview + prod + local for E2E) | Task 3.1 provisioned run passes |
| H4 | Set `ADMIN_EMAIL` (founder's sign-in email) and `CRON_SECRET` in Vercel (preview + prod) | `/admin/pantry` loads for founder, 404s for others; crons authenticate |
| H5 | **Verify Vercel Pro** is active (300s `maxDuration` + hourly crons need it) | Plan visible in Vercel dashboard settings |
| H6 | **8–10 pantry/fridge photos of your own kitchen**, exhaustively labeled into `tests/fixtures/pantry-photos/labels.json`; provide `OPENAI_API_KEY` for the two live eval runs | Task 4.1 + 4.2 verdict doc has real numbers |
