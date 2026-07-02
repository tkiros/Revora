# Human action required — running list (full-build execution)

**Started:** 2026-07-01 · **Maintained by:** the build session — appended as phases surface human-only steps.
Source inventory: `docs/production-implementation-plan-2026-07-01.md` §10. Status legend: ☐ open · ⏳ long-lead, start NOW · ✅ done.

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

- ☐ Railway (Postgres database; backups on — supersedes the earlier Neon
  plan, `docs/adr/hosting-hybrid.md`)
- ☐ Resend (+ verified sending domain)
- ☐ Upstash prod · ☐ Sentry prod · ☐ Vercel Edge Config · ☐ Umami
  (self-hosted on Railway — supersedes the earlier Plausible plan,
  `docs/adr/analytics-umami.md`)
- ⏳ Google Play Developer ($25)
- ☐ Google Cloud project (Play Developer API enabled, service-account JSON, RTDN Pub/Sub topic)
- ☐ Vercel Pro (hourly crons + function limits)
- ☐ OpenAI prod key/quota (exists — confirm limits)
- ☐ Domain registrar
- ☐ Stripe (account, verification, bank)

## §2 Secrets to provision in Vercel (preview + prod; ⚙ = session generates, human stores)

`OPENAI_API_KEY` · `UPSTASH_REDIS_REST_URL`/`_TOKEN` · `SENTRY_DSN` · Edge Config · `DATABASE_URL` (Railway Postgres) · ⚙`AUTH_SECRET` · ⚙`HEALTH_DATA_KEY` · ⚙`VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` · `RESEND_API_KEY` · `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` + `PLAY_PACKAGE_NAME` + `RTDN_SHARED_TOKEN` · `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/price IDs · `NEXT_PUBLIC_UMAMI_SRC`/`NEXT_PUBLIC_UMAMI_WEBSITE_ID` · `CRON_SECRET` · `NEXT_PUBLIC_APP_URL` · ⚙`REVIEWER_TEST_SECRET` (**preview only**) · `NEXT_PUBLIC_REVIEWER_MODE` (**preview only, never production**)

## §3 Money

Play $25 · Vercel Pro ~$20/mo · domain ~$12/yr · OpenAI usage · Railway/Resend/Umami-hosting/Upstash tiers · Stripe fees · counsel fees

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
