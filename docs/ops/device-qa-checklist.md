# Revora — Physical-Device QA Checklist (P8)

Run this on a **physical Android device** (Play Billing cannot be fully
exercised on an emulator — `docs/handoff/human-actions-required.md` §8)
against the **internal-testing track** build, after `docs/ops/play-twa-runbook.md`
§9.3 produces a signed `.aab` and it is uploaded. This checklist is the
evidence artifact for Gate 2's "Full device QA passed on hardware incl. real
Play purchase/restore" line (`docs/production-implementation-plan-2026-07-01.md`
§11).

Each item: steps, then expected result. Check the box only when the expected
result is observed on-device, not from the browser dev-server.

## 1. Install

- [ ] **Install from the internal-testing track.** Steps: accept the tester
  invite on the device's Google account (`docs/handoff/human-actions-required.md`
  §8 — "device Google account on internal track"); open the Play Store link;
  install. **Expected:** app installs and launches **without a URL bar**
  (confirms `assetlinks.json` verified — `docs/ops/play-twa-runbook.md` §9.3;
  if the bar shows, stop and re-check the App Signing SHA-256, not the
  upload-key SHA-256).

## 2. Offline behavior

- [ ] **Kill connectivity, relaunch.** Steps: enable airplane mode; force-stop
  and relaunch the app. **Expected:** `offline.html` renders (calm, on-brand
  copy) — not a raw browser/Chromium error page.
- [ ] **Reconnect mid-session.** Steps: restore connectivity; return to the
  app. **Expected:** the app recovers to the normal home screen without a
  manual reload; no stale/cached `/api/check` response is served (open
  Chrome's `chrome://inspect` remote DevTools → Network to confirm, if
  available).

## 3. Onboarding

- [ ] **Art. 9 health-data consent checkbox.** Steps: create a new account
  through onboarding. **Expected:** the explicit-consent checkbox (marked
  `COUNSEL-DRAFT` — `app/welcome/page.tsx`) is presented before any A1C value
  is stored; declining/skipping does not silently store the value.
- [ ] **A1C boundary guidance.** Steps: enter an A1C below `5.7%`, then above
  `6.4%`, then inside the `5.7–6.4%` band. **Expected:** below/above-range
  values route to the out-of-scope clinician-referral copy
  (`docs/safety/claims-boundary.md`); in-range values proceed to the normal
  flow. No SAFE/MODERATE/HIGH result is ever shown for an out-of-range A1C.

## 4. Text check

- [ ] **Submit a plain-text meal description.** Steps: type a real meal (e.g.
  "two eggs and toast") into the check form; submit. **Expected:** a
  SAFE/MODERATE/HIGH result renders with the disclaimer footer present.

## 5. Voice check

- [ ] **Mic permission + dictation path.** Steps: tap the voice-input button;
  grant the Android microphone permission when prompted; speak a meal
  description. **Expected:** the transcribed text populates the check field
  before submission. *(Note: this is the Android mic-permission grant flow —
  the iOS-Safari dictation-fallback note in the design docs is N/A here; the
  TWA runs on Android only.)*
- [ ] **Mic permission denied.** Steps: deny the microphone permission when
  prompted (or revoke it in Android Settings → Apps → Revora → Permissions
  → Microphone, then retry). **Expected:** the app falls back to the text
  field with a calm explanation — no crash, no silent hang.

## 6. Magic-link sign-in

- [ ] **Sign in via device mail.** Steps: enter an email on `/signin`; open
  the device's mail app; tap the magic link. **Expected:** the link opens the
  TWA (not a separate browser tab, if the domain association is correct) and
  completes sign-in; `/signin/check-email` copy matches what actually
  happened (no dead-end).

## 7. History sync + local→server migration

- [ ] **Guest checks migrate on sign-up.** Steps: perform 1–2 checks as a
  guest (signed out); then create an account. **Expected:** the pre-signup
  checks appear in `/history` after account creation — local guest state
  migrates to the server, it is not discarded.
- [ ] **Cross-device sync.** Steps: sign in with the same account on a second
  device/browser. **Expected:** the same history appears — confirms
  server-side persistence, not device-local storage only.

## 8. Nudge opt-in (two-step) + delivery

- [ ] **Two-step opt-in.** Steps: locate the nudge opt-in control (account or
  onboarding surface); complete both steps (in-app preference + the browser/OS
  push-permission prompt). **Expected:** neither step alone enables delivery;
  both must complete.
- [ ] **Receives at the set hour.** Steps: set a nudge hour a few minutes in
  the future in the device's local timezone; wait for the hourly cron to
  fire (`app/api/cron/nudge/route.ts`). **Expected:** a push notification
  arrives at the configured local hour, not UTC — confirms timezone
  conversion is correct.
- [ ] **No double-send.** Steps: check again after the nudge above has fired
  once. **Expected:** no second notification arrives later the same day —
  `lib/server/nudge.ts` stamps `lastNudgeDate` so the cron skips
  already-notified users on subsequent hourly runs.

## 9. Play Billing purchase → entitlement → progress → cancel → grace → restore

Use a **license-tester account** (`docs/handoff/human-actions-required.md` §8)
so purchases don't charge a real card.

- [ ] **Purchase.** Steps: trigger the paywall (exhaust the free daily check
  count, or open `/subscribe`); complete a Play Billing purchase with the
  license-tester payment method. **Expected:** the purchase sheet completes;
  the app calls `/api/billing/play/verify` and shows a premium confirmation.
- [ ] **Entitlement flips.** Steps: reload `/account`. **Expected:**
  `entitlement.tier` reads `"premium"`, `source: "play"` (`lib/server/entitlement.ts`).
- [ ] **Progress unlocks.** Steps: open `/progress`. **Expected:** the BAI
  band view renders (previously gated for free tier).
- [ ] **Cancel.** Steps: cancel the subscription from Google Play (Menu →
  Payments & subscriptions). **Expected:** access remains active through the
  paid-through date (`status: "canceled"` still counts as premium until
  `currentPeriodEnd` — `lib/server/entitlement.ts` `PREMIUM_STATUSES`).
- [ ] **Grace period.** Steps: if a license-tester grace-period scenario is
  configurable in Play Console, force one (e.g. a failed renewal on a test
  card); otherwise verify by code review that `status: "grace"` is included
  in `PREMIUM_STATUSES`. **Expected:** access does not drop during grace.
- [ ] **Restore / re-verify after a stale row.** Steps: reinstall the app (or
  sign out/in) after the subscription has lapsed past `currentPeriodEnd`.
  **Expected:** the verify-on-read path (`getEntitlement`) calls
  `refreshPlaySubscription` and correctly resolves to `free` once truly
  expired, or heals back to `premium` if Play still reports active — no
  manual re-purchase needed for a merely-stale local row.

## 10. Free-tier 402 upsell

- [ ] **Exhaust the free daily limit.** Steps: as a signed-in free-tier user,
  submit checks until the daily cap (`FREE_DAILY_CHECKS`, currently 5) is
  reached, then submit one more. **Expected:** the request is rejected with
  the upsell/paywall surface — a calm capability-framed prompt, not a raw
  error — and no further model spend occurs for that request.

## 11. Account deletion

- [ ] **Delete via `/account/delete`.** Steps: sign in; navigate to
  `/account/delete`; follow the in-app deletion flow. **Expected:** profile,
  A1C, meal-check history, push registrations, and subscription rows are all
  removed.
- [ ] **Sign-in is dead afterward.** Steps: attempt to sign in again with the
  same email immediately after deletion. **Expected:** no account is found —
  a fresh onboarding flow starts; no residual data (history, streak) reappears.

## 12. Legal pages reachable

- [ ] **`/terms` reachable, signed out.** Steps: navigate to `/terms` without
  signing in. **Expected:** page loads; "Last updated" date visible;
  `COUNSEL-DRAFT` marker visible (until counsel sign-off lands).
- [ ] **`/privacy` reachable, signed out.** Steps: navigate to `/privacy`
  without signing in. **Expected:** page loads with the current data-flow
  description.

## 13. Reviewer-signin form absent on production build

- [ ] **No "Reviewer access" disclosure on `/signin`.** Steps: on the
  **production** build only (not preview — the form is intentionally visible
  on preview per `NEXT_PUBLIC_REVIEWER_MODE=1`), open `/signin` and inspect
  the page (view source or DOM inspector). **Expected:** no "Reviewer access"
  `<details>` element renders at all — `NEXT_PUBLIC_REVIEWER_MODE` is a
  build-time constant left unset in production, so the markup is absent from
  the bundle, not merely hidden by CSS (`docs/ops/env-reference.md`).
