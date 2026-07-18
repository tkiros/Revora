# Canonical issue ledger — true-done audit 2026-07-17

Companion to `docs/handoff/2026-07-17-revora-true-done-audit-remediation-report.md`
and `docs/qa/21-md-corpus-manifest-2026-07-17.md`. Every issue reported anywhere
in the 408-file Markdown corpus maps to one row here (older finding IDs are
cross-referenced). Statuses use the audit vocabulary: `confirmed-open`,
`fixed-and-currently-proven`, `fixed-but-not-runtime-proven`, `regressed`,
`superseded-with-reason`, `accepted-risk-with-owner/date/scope`, `blocked-human`,
`blocked-external`, `not-reproducible-with-evidence`, `unverifiable-with-exact-unblock`.

Evidence buckets are kept separate: **local** (this working tree, gates re-run
2026-07-17), **CI** (GitHub, head SHA), **prod** (revora-lovat.vercel.app /
revora.bio — NOT probed this session), **external** (counsel, panel, providers).

## A. Fixed this session (all with regression tests; see report §7 for files)

| ID | Sev | Issue | Cross-refs | Status / evidence |
|---|---|---|---|---|
| R-001 | P1 | CI red on `main` `be2c441`: commit `8c30265` inverted `checkoutGate` (open unless `LEGAL_TERMS_FINAL=0`) but missed `tests/unit/revora/env.test.ts` (still expected `"closed"`). | GH run 29611942623 (1 failed/1270 passed) | fixed-and-currently-proven (local): env test 4/4 isolated + full suite green. CI proof requires owner push. |
| R-002 | P1 | WTP Day-0 #7 link-sharing basics MISSING: no OG/Twitter meta, no `og:image`, no sitemap, no robots. | 90-Day §0.2 #7; WTP handoff §4B | fixed-and-currently-proven: `app/layout.tsx` metadataBase+OG+Twitter, `app/opengraph-image.tsx` (1200×630, governed copy, RISK_LABELS-derived), `app/sitemap.ts`, `app/robots.ts`; `tests/unit/revora/seo-meta.test.ts` 7/7 incl. sitemap↔robots cross-invariant. |
| R-003 | P1 | Landing pricing hard-coded the trial funnel while prod runs `PAYWALL_MODE=legacy` (promise mismatch, 90-Day §0.2 #4) AND hard-coded `$12.99/month` against the pricing single-source rule (variant ladder 999/1299/1999). | §0.2 #4; adr/billing; sdd G2 deploy truth | fixed-and-currently-proven: landing pricing lede/tiles/FAQ now render from `paywallMode()` + `resolvePriceVariant().display`. Unit pins `tests/unit/revora/landing-paywall-copy.test.ts` 3/3; runtime pins added to both mode-pinned e2e servers (`billing-pages.spec.ts` legacy :3100, `trial-wall.spec.ts` trial :3101); copy-pins 65/65 preserved. |
| R-004 | P1 | WTP Day-0 #6 attribution MISSING (hard gate: "without it you cannot read the result"). | 90-Day §0.2 #6; Part 10 rules | fixed-and-currently-proven: onboarding "Where did you hear about us?" step (closed-enum chips + skip), `attribution` analytics event (closed enums only; no-PII scans green), first-touch UTM→enum capture (`lib/client/attribution.ts`, `components/attribution-capture.tsx`, mounted in layout). Tests: `attribution.test.ts` (mapping/first-touch/tamper), analytics allowlist tests, onboarding-flow tests, onboarding e2e updated for the 6-step tour. |
| R-020 | P1 | CSP omitted the Umami origin: with `NEXT_PUBLIC_UMAMI_SRC` set to an external host, `script-src 'self'` blocks the tracker → the entire WTP funnel records nothing while pages look fine. | code-map; adr/analytics-umami | fixed-and-currently-proven: `next.config.ts` derives the Umami origin from the same env the layout reads, appends to script-src+connect-src only when set; `tests/unit/server/csp-umami.test.ts` 2/2 (set/unset/malformed). |
| R-021 | P2 | `/api/pantry/submit` accepted ANY https URL in `photoUrls`, forwarded to the vision provider's fetcher (arbitrary-fetch relay for signed-in buyers). | code-map #3 | fixed-and-currently-proven: zod refine restricts to `*.blob.vercel-storage.com` https URLs; negative tests incl. suffix-spoof `blob.vercel-storage.com.evil.example` and http downgrade; pantry-submit suite green. |
| R-022 | P2 | `/api/pantry/process` cron doorway used a non-constant-time `===` secret compare (the one non-timing-safe secret check in the tree). | code-map #8 | fixed-and-currently-proven: now `isAuthorizedCron()` (same doorway as `app/api/cron/*`); new `pantry-process-route.test.ts` 5/5 (exact bearer skips session; wrong/missing/non-bearer/unset-secret all fall through to 401). |
| R-023 | P2 | Committed `tsconfig.json` contained the `.next/e2e-trial` include lines the Playwright teardown exists to prevent (committed by an earlier session). | trial-wall.spec header warning | fixed (working tree now holds the clean include list; teardown-healed state kept). |
| R-008 | P2 | Stale gate docs after `8c30265`: `LEGAL_TERMS_FINAL` absent from `docs/ops/env-reference.md`; WTP handoff §4C still said "default-blocked 503"; §0.2 #2 terms-placeholder claim superseded. | corpus-C | fixed (docs): env-reference row added with inverted semantics + counsel-status caveat; dated correction appended to the WTP handoff (append-only). §0.2 stale rows listed in report §4 as superseded, source doc left as historical record. |

## B. Confirmed-open — external/human owners (cannot be closed by engineering)

| ID | Sev | Issue | Cross-refs | Status |
|---|---|---|---|---|
| R-011 | P0 (for real-user guidance) | W-05/F-06: no credentialed RD/CDCES has ever reviewed a Revora verdict. `npm run review:dietitian:close` exits 1 (missing signed `panel-review.json`) — correct fail-closed. All panel artifacts remain `SIMULATED — NON-CREDENTIALED`. Owner decision 2026-07-17: deferred behind WTP test — deferred ≠ closed. | W-05, F-06, DR-01..09, docs 17/18/19 | blocked-human (panel recruitment ~2–4 wk calendar; start day WTP passes) |
| R-024 | P0 (for real-user guidance) | Counsel gate NOT CLEARED — `COUNSEL REVIEW: WAIVED BY OWNER` / `COUNSEL GATE: NOT CLEARED` / owner-risk ACCEPTED (5f6abcb, 2026-07-12) is the controlling record. Checkout now open by owner decision without counsel sign-off (commit `8c30265`) — an owner-risk posture, not clearance. Entity/address/jurisdiction blank (`owner-input-required.md`). | W-04, F-26, counsel-brief, R-016/F-25 reversal-line Q8 | blocked-human (licensed counsel) — deferred per WTP-first directive |
| R-005 | P1 | Exposed keys: `openr.md` (OpenRouter, committed at root) + 5 provider keys in git history commit `213ab8a` (OpenAI/Resend/Upstash×2/Blob) + old values retained in `.superpowers/sdd/task-0.1-report.md`. No rotation attestation exists. Values never echoed by this audit. | SEC-01/SEC-02, W-14 | blocked-external (owner rotates at each provider; ~30 min; overdue since 07-10) |
| R-010 | P1 | Production model path unproven: all live evals ran OpenRouter (`gpt-5.4-mini`, best 97.0% riskAccuracy / 0 harmful-SAFE / 0 retry cards, 2026-07-16); prod calls OpenAI-direct (N-19/W-07) where the org key is capped 50 req/day — incompatible with any real traffic. OpenRouter balance ~$3.19. | W-07, N-19, G4 | blocked-external (owner: fund/raise tier or decide routing; then one ~$0.05 `eval:revora:live` run per WTP handoff §Phase-2) |
| R-025 | P0-ops (if trial mode live) | G2: production crons reported `trialPrecharge: stale` + `pantrySweep: stale` on live `/api/health` (2026-07-12 doc 16) → pre-charge emails not sent, blob GC not running. Railway-side; no in-repo fix. Not re-probed this session. | G2, doc 16 §4/§6 | blocked-external (owner: Railway scheduler; re-probe /api/health) |
| R-012 | P1 | Provisioning/ops set still open: Stripe live webhook secret (H21) + test-mode mirror (H23) + portal config (H20) + API-version pin (H24); Resend sending domain; `revora.bio` DNS A record; Tally waitlist form (H25); Vercel Edge-Config kill-switch drill + WAF rate rule + rollback drill (04-UAT); Play/TWA chain incl. `.aab` rebuild (startUrl), assetlinks; uptime monitor/alerting (N-14); support ownership; OpenAI DPA (N-28); trademark; entity. | human-actions-required.md; 04-UAT; G1/G2 | blocked-external (each named to owner in report §11) |
| R-026 | P2 | Branch protection unavailable (private repo, free plan) — W-08 partially unmeetable; a P0 once re-entered `main` via clean merge. | W-08, doc 13/16 | blocked-external (GitHub Pro or public repo) |
| R-027 | P2 | PRIV-01 data export absent (deletion exists; export posture documented as counsel question). | PRIV-01 | blocked-human (counsel scope) — deferred per WTP-first |

## C. Accepted-risk / residual (documented, monitored — not silently open)

| ID | Sev | Issue | Status |
|---|---|---|---|
| R-028 | P2 | Metering + per-IP rate limit fail OPEN on datastore outage (documented posture; compensating ceiling = provider spend cap — cap itself unconfirmed, part of R-010). | accepted-risk-with-owner (launch-controls) |
| R-029 | P2 | Clinical routing is deterministic-regex for 8 route families and intentionally falls through to the model+postprocess floors otherwise; widening is RD/CDCES-governed (portion-convention/ontology PENDING ratification). 240-case rehearsal: 0 harmful-SAFE at final calibration (SIMULATED evidence). | accepted-risk pending W-05 ratification |
| R-030 | P3 | Cultural-staple carb ontology is a token list (`CARB_FORWARD_TOKENS`); 9/202 rejected bands remain, all in panel-parked buckets. Do not "fix" ahead of the human panel. | accepted-risk (parked for panel) |
| R-031 | P3 | Stripe webhook has per-handler structural idempotency, no event.id table; `trial_canceled` may re-emit (telemetry only). `charge.refunded` handles pantry only (sub refunds manual per policy). | accepted-risk (ADR billing) |
| R-032 | P3 | Pantry `$49` display is a build-time constant (ponytail-commented) vs `STRIPE_PRICE_PANTRY`; trial upsell "free week" sniff is the documented FALLBACK behind the kind discriminator (pinned by tests). Photo-draft text is length-validated only (transcription-only path, user-confirmed, flag OFF). | accepted-risk (each documented in code) |
| R-033 | P3 | video-engine dashboard is local-dev-only by env gate (`VERCEL_ENV` set → 404; `next start` sets NODE_ENV=production → disabled). Exposure requires publicly serving `next dev`. | not-reproducible-with-evidence (gate correct as designed) |
| R-034 | P3 | 4 moderate npm advisories, dev-only (`drizzle-kit` chain, esbuild). `npm audit --omit=dev`: 0. | accepted-risk (dev-only) |
| R-035 | P3 | Repo hygiene: 4 misfiled bcb handoffs; `agent/agents/bcb-temp.gmgn-*`; stale railway skill + 2 tracked `.railway-config-pull-*` stubs; `nexxt_steps_phase2_gaps.md` trailing crypto-prompt junk; `[REVIEW NEEDED:…]` markers corrupting archived plan code snippets; `sol_deep_analysis.md` embedded session cruft; stale `Revora_90-Day_Distribution_Strategy_Master_Prompt.md` (reversal-era); `Revora_PRD_Amendments.md`/`Revora_Traceability_Matrix.md` carry banned-claim copy under superseded banners (tombstone like Brand_Positioning_v2). | confirmed-open (P3 cleanup list for owner; deletion of tracked files left to owner) |

## D. Superseded / disproven documentary claims (verified against current code this session)

| Claim (source) | Current verified truth |
|---|---|
| "PRs #13–#16 all CI-green, all unmerged" (WTP handoff §3) | Stack merged; `origin/main` = `be2c441`; CI red there until R-001 (fix in tree). |
| "Release gates RED on main: 2 stale vitest + ~20 Playwright failures" (90-Day §0.2 #5, NEW-01/02/03) | Superseded: unit 119 files green locally; the single red was R-001. Playwright: see report §8 final counts. |
| "/terms renders bracketed placeholders in prod" (§0.2 #2, NEW-05, F-26) | Superseded: placeholders removed; `tests/smoke/legal-placeholders.spec.ts` asserts placeholder-free; checkout gate inverted by owner (R-008/R-024 caveats stand). |
| "OpenAI account unfunded → every check returns retry" (§0.2 #1, BUG-01 era) | Superseded in part: funded but capped 50 req/day (R-010). Prod behavior not re-probed this session. |
| "Photo assist LIVE by default / shipped past gates" (production-plan §4, E2E-03) | Superseded: `NEXT_PUBLIC_PHOTO_INPUT` only exact `1` enables; default candidate 404s (e2e-verified); human-actions §2 keeps it unset pending owner approval. Prod env state = owner check. |
| "Longitudinal insights active with no production gate" (counsel-unlock handoff) | Superseded: `lib/longitudinal-insights-flag.ts` exact-`1` gate, server-enforced, copy conditioned (landing verified). |
| "Phase 2 gaps: non-food not deterministically refused; carbs-only weak" (nexxt_steps_phase2_gaps.md) | Superseded: deterministic `not_food` short-circuit (input-precheck.ts:313 + non-food-short-circuit.test.ts); unconditional `carbs_only` floor (postprocess.ts:338–383). |
| ".test.tsx files silently not run" (sdd G1) | Moot: no `.test.tsx` files exist; include is `tests/**/*.test.ts`. |
| "No lint script/eslint config" (sdd G1) | Superseded: `npm run lint` green (eslint 9). |
| "Full suite never green / createTestDb meltdown" (sdd era) | Superseded: full unit suite green twice today (173 s / 119 files). |
| "Heartbeat CronName union missing trial-precharge/pantry-sweep" (sdd 3.3) | Superseded: `/api/health` reports all four cron keys (env.test.ts). |
| "No CSP" (sdd progress) | Superseded: SEC-04 headers in `next.config.ts` (now Umami-aware, R-020). |
| "landing page `app/pantry/page.tsx` missing" (07-05 strategy) | Superseded: built + tested. |
| "prod DB = Neon" (production-plan §12, price-test §2.2) | ADR hosting-hybrid: Railway Postgres via `DATABASE_URL` is the winner; price-test doc reference is stale (P3 note). |
| Retired scorecards (`docs/qa/03`, `internal-green-verification` counts, baseline §7 "no CI") | Marked historical; current gate numbers are in report §8. |

Contradictions that required an owner-visible resolution (not just supersession)
are tabulated in report §4.
