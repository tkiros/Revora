---
tool: iautoresearch-predict (Deep: 8 personas, 3 rounds) + chain debug,fix
mission: Revora E2E function + promise-delivery + safety + paid-retention audit
revision: abfa05800efa0213ef6b0a374e9fde4ab82322db
branch: feat/value-retention-plan-2026-07-18
worktree_state: DIRTY — 1 modified (docs/handoff/2026-07-18-...forensic-master-prompt.md, +14 lines user-owned), 1 untracked (docs/handoff/2026-07-20-...validation-master-prompt.md, user-owned)
node: v24.10.0  npm: 10.9.4
built_at_utc: 2026-07-20T15:31Z
recon_method: 6 parallel Explore subagents (routes, lib, data-ops, tests, docs, client)
---

# Revora — Consolidated Knowledge Base (recon synthesis)

## Denominators (published inventory)

| Dimension | Count | Source |
|---|---|---|
| Pages (page.tsx) | 27 | app/ |
| Layouts / error boundaries | 2 layout, 1 error | no not-found/loading/global-error |
| API route files | 54 | app/api/* + app/pantry/claim |
| HTTP methods exported | 63 | GET 26 / POST 30 / DELETE 5 / PATCH 2 |
| Handler-factory modules | 7 | billing, history, memory, journey, journey/weekly, feedback, admin/feedback |
| Components (.tsx) | 38 | components/ |
| lib modules | 92 | 22 revora, 24 server, 21 client, 4 journey, 5 coach, 5 flag, 9 misc |
| Exported symbols / functions | ~305 / ~215 | lib |
| DB tables | 19 | lib/server/db/schema.ts |
| Migrations | 13 (0000–0012) + 1 baseline stamp script | drizzle/ |
| Crons | 5 (1 in vercel.json, 4 on external Railway hourly-crons) | — |
| Webhooks | 3 (Stripe, Play RTDN, Push subscribe) | — |
| Feature flags / launch controls | 24 (3 Edge Config, 6 NEXT_PUBLIC build-time, 5 server-env, 10 implicit presence) | — |
| Client storage keys | 8 (6 LS, 2 SS; 3 carry health data; 1 dead) | — |
| External dependency classes | 11 | postgres, Upstash, Stripe, Play, OpenAI text+vision, Vercel Blob, Edge Config, Resend, web-push, Sentry, Umami |
| Env var names referenced in code | 67 (46 documented; 8 doc-only; 21 code-only) | — |
| Scripts | 15 (2 prod-mutating, 1 sandbox-unguarded, 4 live-paid, 8 local-only) | scripts/ |
| Test files | 169 (149 unit/integration, 4 eval, 16 smoke) | tests/ |
| Top-level tests | ~1,377 (smoke ×2 mobile projects) | — |
| Safety eval corpus | 159 cases, 10 categories + 10 real-world strata | tests/fixtures/revora-eval-cases.json |
| Playwright projects | 2 (Mobile Chrome, Mobile Safari) — NO desktop | playwright.config.ts |

## Flag state (verified in code, cross-checked to truth-index)

| Flag | Code default | Claimed prod | Kill-switch quality |
|---|---|---|---|
| MEAL_MEMORY_ENABLED / NEXT_PUBLIC_MEAL_MEMORY | off | OFF (fail-closed verified) | server twin ✅ |
| LEARNING_JOURNEY_ENABLED / NEXT_PUBLIC_LEARNING_JOURNEY | off | OFF (fail-closed verified) | server twin ✅ |
| NEXT_PUBLIC_PHOTO_INPUT | off | claimed ENABLED (pre-branch snapshot, unverified this branch) | build-time only, NO server twin — cannot flip off without redeploy |
| NEXT_PUBLIC_LONGITUDINAL_INSIGHTS | off | claimed ENABLED (same) | build-time only, NO server twin |
| NEXT_PUBLIC_PLAY_BILLING | off | off | server twin ✅ |
| launch_mode / public_checks_enabled (Edge Config) | normal/true | — | PRIMARY kill switch; resolves ENABLED when Edge Config unreachable/unset (fail-open) |
| LEGAL_TERMS_FINAL | open | — | checkout kill switch |

## Engine path ordering verdict (text meal check)
proxy rate-limit (fail-open on Redis err) → launch-mode pause (fail-OPEN when Edge Config unset) → [entitlement/quota block in ONE fail-open try/catch] trial wall / daily cap → clinical-risk FIRST → A1C route → input precheck (not_food/clarify/carbs_only) → buildRevoraPrompt → **model.generate (ONLY paid call, MAX_ATTEMPTS=1)** → postprocess (floors, claim boundary, one-sentence, grounding, componentMention FLAG-OFF) → telemetry (.strict) → persistCheck (encrypted snapshot, fail-soft). **All caps strictly upstream of paid call.** Clinical-before-A1C-before-model ordering is the medical-precedence guarantee.

## Entitlement verdict
getEntitlement: single query, JS-filtered; verify-on-read self-heal for Play (unconditional) + Stripe (rate-limited 1/hr/row, terminal-status guard, never-grant-on-guess). Stripe correctness DEPENDS on webhook+inbox; read-path heal is the recovery. Play RTDN is optimization only. capabilitiesFor = single matrix; PREMIUM_CAPABILITY_KEYS pinned by paywall-capability-truth test.

## Governance / gate state (from docs)
- 26 unexecuted human gates: 19 E-gates (RD/CDCES, counsel, privacy/DPIA, a11y all PENDING) + 5 deferred Phase-0 + 2 protocol executions (concierge study, retention cohort prereg).
- Owner-risk ACCEPTED 2026-07-12 with COUNSEL GATE NOT CLEARED.
- NO real cohort/payment/retention data. Umami never deployed (funnel blind). Zero share/referral code.
- Simulated dietitian panels exist but labeled SIMULATED / NON-CREDENTIALED.
- Promise registry: 3 promoted examples (OATMEAL/BANANA/ORANGE_JUICE), all lastLiveCaptureAt=null.

## Scope conflict for user (MUST surface)
07-18 forensic prompt §9 (user-appended) says "completely ignore" 5 Phase-0 residuals: no nameservers on revora.bio, Resend unverified (magic-link can't deliver), live Stripe webhook never added (payment succeeds but entitlement never flips), Umami never deployed, exposed keys unrotated (openr.md at repo root — "now also the prod model key"). The 07-20 master prompt (invoked) Rule 3 requires explicit renewal of any inherited ignore-list. → treated as IN-SCOPE for reporting (all external/infra, none locally fixable). openr.md = P0 secret-exposure finding; value NOT read.
