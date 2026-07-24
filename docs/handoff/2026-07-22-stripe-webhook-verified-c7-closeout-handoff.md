# Revora — Session Handoff: Stripe webhook PROVEN end-to-end, C7 cycle near-closed

**Written:** 2026-07-22 (late) · **For:** the next session · **Branch at handoff:** repo root sits on `fix/umami-csp-ingest-origin` (already merged as PR #27) · **`main`:** `4b05844`
**Open PRs:** none. **Working tree:** only the owner's own uncommitted edits (see §E8) — *do not `git add -A`*.

Continues `docs/handoff/2026-07-22-pr25-ci-unblock-merge-deploy-umami-csp-handoff.md`. **That handoff's §B1 (the Stripe test round-trip) is now DONE** — and the instructions it gave for doing it were wrong in a way worth reading before you touch Stripe (§C1).

This session ran in parallel with the one that merged PR #25/#26/#27; that session's handoff covers the CI unblock and the umami CSP blackout. This document covers the owner-unblock work, the C7 deploy, the design review that produced PR #25, and the Stripe verification that closed it out.

---

## A. DONE this session (all verified with fresh evidence)

### A1. Owner-blocked items — both closed

| Item | Status | Evidence |
|---|---|---|
| **Sentry client DSN** | ✅ DONE | `NEXT_PUBLIC_SENTRY_DSN` set in Vercel **Production + Preview** via CLI. Verified live in two shipped JS chunks on revora.plus. |
| **Stripe webhook** | ✅ **PROVEN end-to-end** | Endpoint already existed and was Active; owner added the missing 6th event. Signature path proven both directions — see §A4. |

The Stripe MCP OAuth completed this session (`mcp__stripe__authenticate` → account `acct_14W8GFKweWSWjefk` "Vendoval", confirmed by the live Revora Premium + Pantry Review products carrying `app: revora` metadata). **The MCP allowlist has no webhook-endpoint operations** — that part of the prior handoff's warning is correct and still stands.

### A2. Prod migrations + PR #24 (C7 four jobs)

- Migrations **0014 + 0015 applied to prod Railway**. Journal 14 → **16 rows**; composite index `support_cases_user` on `(user_id, created_at DESC)` confirmed present and matching `drizzle/0015_support-cases-user-index.sql`.
- **PR #24 merged** (`23387cf`), deployed, verified: `/api/health` ok · `/home` `/meals` `/journey` 200 · legacy `/progress` `/history` `/memory` → **308** to the right targets · both navs render (`app-nav` + `app-tabbar-nav`) · `/api/support/case` correctly 401s unauthenticated.

### A3. `/design-review` of the four C7 surfaces → PR #25 (merged by the parallel session as `dd9f6ba`)

Live audit (browse against production) + two source-audit outside voices (Codex, and a Claude consistency subagent that returned 29 findings). **Design Score B+ · AI Slop Score A.** Full report + 13 screenshots: `~/.gstack/projects/Revora/designs/design-audit-20260721/`.

**Two user-reported bugs, both run to ground:**

1. **The whole app rendered in Times New Roman.** The `var(--font-sans)` indirection silently failed to cascade in production Chromium — served CSS was byte-correct and the variable resolved, yet computed `body` font-family was the browser default and the font files never downloaded (`document.fonts.check()` false). A byte-identical rule injected via CSSOM applied fine, which isolated it to the built-stylesheet var() path. **Fix:** `sans.className` on `<body>` (next/font's primary documented pattern). **Verified live at time of writing:** computed `body` font is `"Plus Jakarta Sans", "Plus Jakarta Sans Fallback"`.
2. **A1C asked twice.** `profileStore.set` only ran on the step-6 classic tap, so entering an A1C and leaving via "Skip setup and check a meal" dropped it and `/check` re-asked — breaking step 4's own "It stays on this device" promise. **Fix (post-adversarial-review design):** persist on the two *intentional* exits (`skipTour` + `startGuidedCheck`), never mid-tour. Playwright regression pins the exact reported path.
3. **"No voice input" — NOT a bug.** `voice-input-button.tsx:45` hides "Say your meal" on browsers without the Web Speech API (iOS Safari, Firefox) and shows a dictation hint instead. Working as designed; the reporter was on an unsupported browser.

**Also fixed in PR #25:** Sentry `connect-src` (see §A4) · 44px touch-target floor on `.recheck-button` / `.action-done-button` / `.plan-box-link` (were 40px) · undefined `var(--text)` token ×3 → `--text-body` (invalid declarations, silently inherited) · Home gets its `h1` (visible title was a styled `<p>`) · Home error card heading order + its title is now the `h1` · `/meals` footer "Home" no longer exits to the marketing landing · `/meals` + `/journey` document titles (were bare "Revora") · step-6 copy now matches actual behavior · skip-link layout animation removed · 18 lines of dead `.app-topbar-account` CSS deleted · DESIGN.md amendments (skeleton shimmer sanctioned, `dash-cta-button` rename, font-mechanism note).

**Adversarial review caught a real flaw in my own first fix** (Claude + Codex converged, P1): persisting the A1C at step-4 validation would have marked tab-close abandoners as onboarded *forever*, since `FirstRunGate` keys on a non-null profile. That is why the fix moved to intentional-exit-only. Worth remembering as a pattern: the obvious place to persist was the wrong one.

### A4. Sentry CSP — a second instance of the same bug class

`NEXT_PUBLIC_SENTRY_DSN` shipped, but CSP `connect-src` had no Sentry ingest origin, so **every envelope POST was CSP-blocked** (observed live in the browser console). Fixed by deriving the origin from the DSN env var. The parallel session then found the *identical* bug for umami (`gateway.umami.is` ≠ `cloud.umami.is`) — see their handoff §C1 for the analytics-blackout consequences.

**Current live CSP `connect-src` (verified this session):**
```
connect-src 'self' https://*.blob.vercel-storage.com https://blob.vercel-storage.com
            https://cloud.umami.is https://gateway.umami.is
            https://o4511672801820672.ingest.us.sentry.io
```
Both third-party observability paths are now unblocked. The shared helper is https-only (`originFromEnv` in `next.config.ts`) — non-special schemes yield the literal origin `"null"`, and `http:` would be mixed-content-blocked anyway.

### A5. Stripe webhook — verified in three layers

| Layer | Method | Result |
|---|---|---|
| Logic | 6 test suites, all Stripe-related | **113/113 pass** — all 6 event types, ordering guards, terminal-status guards, partial-vs-full refund, replayed/expired checkout, photo cleanup on refund, plus the route wrapper's signature check / 400 / self-healing retry |
| Rejects forgeries | `stripe listen --forward-to` production + `stripe trigger charge.refunded` | **400** — correct. The CLI signs with its own ephemeral secret, so a 400 proves the deployed endpoint really validates signatures |
| Accepts the real secret | Hand-signed payload with the endpoint's **live** signing secret (§C1 method) | **200** · `{"received":true,"outcome":"processed"}` |

**Cleanup done:** the local secret file was deleted, and the one audit row the test wrote to `billing_event_inbox` in production was located and removed (`evt_manual_test_1784726540`, status `processed`, 1 row deleted). No entitlement, subscription, or order data was ever touched — the fabricated charge has `invoice: null` and a `payment_intent` matching nothing, both of which the handler no-ops on by design.

---

## B. IMMEDIATE next actions — the exact path to DONE

No outstanding code work. No red CI. No open PRs. Everything below is an owner action or a decision.

### B1. Owner-only: support-case round-trip (5 min, browser) — *the last functional unknown*
1. Go to `https://revora.plus/account` and sign in. **The login wall IS the flow** — enter your email, click the magic link it sends you. There is no password to create. (The owner attempted this and stopped at the login wall; that wall is the intended first step, not a blocker.)
2. Submit a help case from the account page.
3. **Pass =** the email lands in `support@` **and** a case id renders in the UI.

### B2. Confirm a Sentry envelope actually arrives (needs a real error)
Sentry is **armed, initialising, and now CSP-unblocked — but no envelope has been observed delivered end to end.** To close honestly: either wait for a genuine production error and confirm it appears in the Sentry issue stream, or have the owner deliberately trigger one on a throwaway route. **Do not force an error against production without the owner's say-so.** Once seen, update the "NOT yet observed" sentence in `docs/release/truth-index.md`.

### B3. Decide the `next-env.d.ts` question (TODOS entry) — 10 min decision, then a small PR
It dirties the tree on every `npm run dev` **and** every Playwright run. I hit it again this session (had to `git checkout next-env.d.ts` before pushing). Pick one of the three options in the TODOS entry.

### B4. Re-baseline analytics expectations (no code)
Tell whoever reads funnel numbers that **umami has no history before 2026-07-22** — every `track()` call was CSP-refused until then. Figures to date are *missing, not zero*. Do not compare across that date.

### B5. Post-deploy design-review round 2 (optional, when there's appetite)
The structural findings deferred from this session's audit are in TODOS (§Design-system drift residuals). They need a DESIGN.md decision each, not a mechanical fix. Highest-leverage first: the two competing week strips (`/meals` legacy `.week-strip` vs the compliant `<WeekStrip>` on `/journey` — one fails the colorblind rule DESIGN.md wrote specifically for it).

---

## C. Corrections to prior guidance (read before touching Stripe)

### C1. ⚠ The prior handoff's Stripe instructions do not work — here is what does

Prior handoff §B1 said: *"⋯ → Send test event → `charge.refunded`. The dashboard is the only path."* **Both halves are wrong on the current Stripe UI.**

- The endpoint detail page's **⋯ menu contains only Delete / Roll secret / Disable.** There is no "Send test event" anywhere on the page, the Overview tab, or the Event deliveries tab.
- **`stripe trigger` is blocked in live mode:** `"stripe trigger is disabled in live mode. Switch to testmode to run stripe trigger."`
- This is deliberate on Stripe's part — synthetic events are not injectable into a live event stream.

**The method that actually works** (used this session, produced the 200): hand-sign a payload with the endpoint's live secret and POST it directly.

1. Dashboard → the endpoint → **Signing secret** → eye icon to reveal. **Never paste it into an agent chat** (it would persist in the session transcript) and don't use `! <command>` for the same reason. In a *separate* terminal: `nano ~/.stripe_whsec_temp`, paste, save.
2. Run the script below. It reads the secret at runtime and prints only the status and response — never the secret.
3. Delete `~/.stripe_whsec_temp` afterward, and delete the audit row it writes (see step 4).

```bash
#!/bin/bash
set -euo pipefail
SECRET_FILE="$HOME/.stripe_whsec_temp"
URL="https://revora.plus/api/billing/stripe/webhook"
SECRET=$(tr -d '[:space:]' < "$SECRET_FILE")
TS=$(date +%s); EVENT_ID="evt_manual_test_$(date +%s)"
PAYLOAD=$(jq -nc --arg ts "$TS" --arg eid "$EVENT_ID" '{
  id:$eid, object:"event", api_version:"2025-03-31.basil", created:($ts|tonumber),
  data:{object:{id:"ch_manual_test_001", object:"charge", amount:100, amount_captured:100,
    amount_refunded:100, currency:"usd", customer:null, invoice:null, livemode:true,
    payment_intent:"pi_manual_test_001", refunded:true, metadata:{}}},
  livemode:true, pending_webhooks:0, request:{id:null,idempotency_key:null},
  type:"charge.refunded"}')
SIG=$(printf '%s' "${TS}.${PAYLOAD}" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.*= //')
curl -s -w '\nHTTP_STATUS=%{http_code}\n' -X POST "$URL" \
  -H "Content-Type: application/json" -H "Stripe-Signature: t=${TS},v1=${SIG}" \
  --data-binary "$PAYLOAD"
echo "EVENT_ID=$EVENT_ID"
```

4. **Clean up the audit row** (store-then-process writes one to `billing_event_inbox` before the handler runs):
```bash
DATABASE_URL=$(railway variables --service Postgres --json | jq -r .DATABASE_PUBLIC_URL) \
node -e "const{Client}=require('pg');const c=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
c.connect().then(async()=>{const d=await c.query(\"delete from billing_event_inbox where provider_event_id='<EVENT_ID>'\");console.log('deleted:',d.rowCount);await c.end()})"
```

**Expected pass:** `200` + `{"received":true,"outcome":"processed"}`. A `400` would mean Vercel's `STRIPE_WEBHOOK_SECRET` no longer matches this endpoint — **do not rotate the signing secret** to "fix" it; update the Vercel env var to match instead.

### C2. Where the browse tool lies to you
Confirmed again this session, twice. A probe returning `document.body.className === ""`, no headings, `document.head.innerHTML === ""`, or 0 stylesheets means **the tab is a corpse, not a broken app.** It made a working production font fix look like a total regression. Restart browse (`$B stop` then re-`goto`) and re-probe before believing any negative reading. This cost real time in both this session and the parallel one.

---

## D. OWNER-BLOCKED / OUT OF SCOPE (unchanged)

1. `/api/health` crons `nudge` / `trialPrecharge` / `pantrySweep` / `stripeReconcile` still **STALE** — only `bai-weekly` is in `vercel.json`. Confirmed still stale at the end of this session. Flagged across four handoffs now; it either needs a decision or should be moved off the "open" list.
2. `docs/adr/analytics-umami.md` describes a **self-hosted Railway umami install that production does not use** (production points at umami cloud). `env-reference.md` was corrected; the ADR was not. Tracked in TODOS.

---

## E. Operational facts (carried forward + new)

1. **gstack lives at `~/.claude/skills/igstack/`** on this machine, not `~/.claude/skills/gstack/`. The browse binary is `~/.claude/skills/igstack/browse/dist/browse`; it can only write screenshots under `/tmp` or the repo root.
2. **Never run `npm run build` / `npm run typecheck` while Playwright dev servers are up** — `typecheck` starts with `rm -rf .next/dev/types .next/types` and deletes state the running servers need. Doing this mid-session produced **22 phantom e2e failures**; a clean rerun after `rm -rf .next` was green. Kill strays with the bracket trick `pkill -f "next de[v]"` — plain `pkill -f "next dev"` matches its own command line and kills your shell (**exit 144**, observed this session).
3. **`vercel env pull` decrypts sensitive values as empty**, including `STRIPE_SECRET_KEY` and `DATABASE_URL` in some environments. Don't plan around reading secrets that way. The Vercel *REST API* with the CLI token returned `"Not authorized"` for env writes — **use `vercel env add` via the CLI instead**, which works.
4. **Railway:** the private `DATABASE_URL` is unreachable from outside Railway (`ECONNREFUSED 127.0.0.1:5432`). Always use `railway variables --service Postgres --json | jq -r .DATABASE_PUBLIC_URL`.
5. **The repo root cannot `git checkout main`** — `main` is checked out at `.claude/worktrees/counsel-gate-candidate`. Branch from `origin/main`: `git checkout -b X origin/main`.
6. **E2E:** never pipe to `tail` (it eats the exit code) — write to a file and `echo EXIT=$?`. Playwright projects here are `"Mobile Chrome"`, `"Mobile Safari"`, `"Desktop Chrome"` — there is no `chromium` project. Expect ~1–3 machine-load flakes per full run; rerun in isolation before believing a failure.
7. **This box compiles ~10× slower than CI**, so a local cold run is harsher than CI and does not discriminate branch from main.
8. **Owner's uncommitted edits are in the tree and were deliberately left alone:** `docs/handoff/2026-07-21-c7-shipped-pr24-deploy-and-residuals-handoff.md` (contains the pasted Sentry client DSN — public by design, but don't commit it casually) and `docs/retention_flow.md` (whitespace reflow). **Do not `git add -A`.**
9. **Stripe CLI is now installed and logged in** (v1.44.0, account `acct_14W8GFKweWSWjefk`). `stripe listen` + `stripe trigger` work in **test mode only**; see §C1 for live mode.

---

## F. Definition of done — ledger

| # | Item | Status |
|---|---|---|
| 1 | www redirect · RE-08 | ✅ |
| 2 | Stripe webhook registered, 6 events, signature verified **both directions** | ✅ **closed this session** |
| 3 | Sentry client DSN set + shipped + CSP-unblocked | ✅ |
| 4 | Sentry envelope *observed* arriving | ⏳ **§B2** (needs a real error) |
| 5 | C7 four job surfaces built, reviewed, shipped, deployed, verified | ✅ |
| 6 | Post-deploy design review (plan §B4) | ✅ — PR #25 merged; residuals in TODOS |
| 7 | Font renders as Plus Jakarta Sans in production | ✅ verified live |
| 8 | Migrations 0014 + 0015 on prod | ✅ journal at 16 |
| 9 | umami CSP unblocked (analytics finally recording) | ✅ (PR #27, parallel session) |
| 10 | Support-case round-trip | ⏳ **§B1 — owner, 5 min** |
| 11 | `next-env.d.ts` decision | ⏳ **§B3** |
| 12 | Crons `nudge`/`trialPrecharge`/`pantrySweep`/`stripeReconcile` | ⏳ owner, §D1 (long-standing) |
| 13 | Analytics re-baseline comms | ⏳ **§B4** (not engineering) |

**One prioritized next action:** **§B1** — the owner signs in at `/account` via magic link and submits one help case. That is the only remaining *functional* unknown in the C7 cycle; everything else open is a decision, a comms item, or waiting on a naturally-occurring error.

---

## G. Do NOT touch (unchanged)

HS-2/4/5 clinical banding · HSTS preload · CSP `report-uri` · **the Stripe webhook signing secret (do not rotate)** · `MEAL_MEMORY_*` / `LEARNING_JOURNEY_*` stay **OFF** — and note that **saved-meals styling now gates the `MEAL_MEMORY` flip**: `components/saved-meals-section.tsx` references 13 CSS classes with zero definitions, so the section would ship unstyled with `risk-chip` verdict badges rendering as plain text (TODOS §Saved-meals) · pricing numbers · DA-NH-1 counsel · human-evidence validators · `REVORA_ENFORCE_COMPONENT_MENTION` stays OFF · BAI cron/table keep running (S2 measurement).
