# Human action required — running list (full-build execution)

**Started:** 2026-07-01 · **Maintained by:** the build session — appended as phases surface human-only steps.
Source inventory: `docs/production-implementation-plan-2026-07-01.md` §10. Status legend: ☐ open · ⏳ long-lead, start NOW · ✅ done.

## ⚠ Longest-lead items — start these today

1. ⏳ **Counsel engagement** (Track B B1). Questions: the four in `docs/legal/counsel-brief.md` **plus** Q5 insights-SaMD, Q6 Art. 9 consent wording, Q7 refund adequacy, Q8 the 3 "reversal" lines (Brand Positioning L240/287/295), Q9 forward-looking imaging-SaMD (D5 gate). Sign-off must be on file before Play submission (P9).
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

- ☐ Neon (dev/preview/prod branches; backups on)
- ☐ Resend (+ verified sending domain)
- ☐ Upstash prod · ☐ Sentry prod · ☐ Vercel Edge Config · ☐ Plausible
- ⏳ Google Play Developer ($25)
- ☐ Google Cloud project (Play Developer API enabled, service-account JSON, RTDN Pub/Sub topic)
- ☐ Vercel Pro (hourly crons + function limits)
- ☐ OpenAI prod key/quota (exists — confirm limits)
- ☐ Domain registrar
- ☐ Stripe (account, verification, bank)

## §2 Secrets to provision in Vercel (preview + prod; ⚙ = session generates, human stores)

`OPENAI_API_KEY` · `UPSTASH_REDIS_REST_URL`/`_TOKEN` · `SENTRY_DSN` · Edge Config · `DATABASE_URL` (pooled + direct) · ⚙`AUTH_SECRET` · ⚙`HEALTH_DATA_KEY` · ⚙`VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` · `RESEND_API_KEY` · `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` + `PLAY_PACKAGE_NAME` + `RTDN_SHARED_TOKEN` · `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/price IDs · `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` · `CRON_SECRET` · `NEXT_PUBLIC_APP_URL`

## §3 Money

Play $25 · Vercel Pro ~$20/mo · domain ~$12/yr · OpenAI usage · Neon/Resend/Plausible/Upstash tiers · Stripe fees · counsel fees

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
- ☐ Forms: Data Safety, content rating, target audience (adults), health declarations, ads=none, export compliance, account-deletion URL, app-access reviewer login (seeded test account)
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
