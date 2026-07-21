---
commit_hash: abfa05800efa0213ef6b0a374e9fde4ab82322db
---
# Component Clusters → Risk Areas (persona seed map)

Each cluster lists the seed hypotheses recon surfaced. Personas must CONFIRM or REFUTE against current source with file:line — recon is a lead, not a verdict.

## C1 — Meal-check engine & safety (lib/revora/*, app/api/check)
- postprocess.ts:127/281 REVORA_ENFORCE_COMPONENT_MENTION ships OFF → adjustment may name food not in the meal.
- safety-contract.ts:131 reads tests/fixtures/safety-contract.json at RUNTIME → test fixture is a prod dependency; missing file throws pre-model.
- service.ts:36 MAX_MODEL_ATTEMPTS=1 → transient blip = user retry card.
- Clinical-before-A1C-before-precheck-before-model ordering = medical precedence; clinical schema has no risk field (can't emit verdict).
- input-precheck.ts CARB_FORWARD_TOKENS lists ARE the sugary-floor; token gap = model-only grading.
- knownGap allowlist in revora-safety-eval silently excludes cases from the zero-harmful-SAFE hard gate.
- Photo/meal-photo evals permanently skipped in CI (only labels.example.json committed). Risk labels engineering-derived, not clinical (W-05 dietitian panel never run).

## C2 — Auth, authorization & secrets (proxy, session, admin, video-engine, reviewer-signin)
- 8 video-engine routes gated by env (VERCEL_ENV/NODE_ENV) NOT auth; 3 spawn detached child procs, 1 runs git commit. One env misconfig from unauth RCE-over-HTTP. Railway configs in-repo.
- reviewer-signin hand-mints session cookie; guarded only by NEXT_PUBLIC_REVIEWER_MODE + shared secret. Doc/code name mismatch (REVIEWER_TEST_SECRET vs code) on an auth door.
- Several pages client-only gated (/account, /history, /memory, /progress, /onboarding, /welcome) — server routes claimed to re-gate (memory/journey 404). VERIFY server-side object-level authz on every private read/mutation.
- openr.md committed secret at repo root (P0). CSP allows 'unsafe-inline' script+style; no report-uri. HSTS no preload.
- getClientIp trusts first x-forwarded-for hop (spoofable if platform doesn't overwrite).

## C3 — Billing, entitlements & commercial truth (lib/server/billing, entitlement, pricing, Stripe/Play)
- GET /api/billing/cancel mutates Stripe sub (cancels) via token-in-URL — prefetch/scanner triggerable.
- GET /pantry/claim does DB UPDATE (rebinds order ownership) via token-in-URL.
- /api/billing/stripe/pantry-checkout: no session, not proxy-rate-limited, creates Stripe Checkout sessions.
- Stripe inbox = strongest component (store-then-process, unique providerEventId, tx+FOR UPDATE, post-commit email, refund terminality). Play RTDN has NO replay guard (mitigated by re-fetch-truth). Token in query string (access-log leak).
- Prices from server authority (paywallMode/resolvePriceVariant); paywall-capability-truth pinned. Verify no client price fallback (paywall-card).
- Cron scheduling split: 4 crons on Railway hourly-crons (NOT vercel.json) → liveness UNVERIFIABLE without Railway access; health reads cron_heartbeat staleness. trial-precharge/stripe-reconcile firing = UNVERIFIED, not broken.
- Residual: live Stripe webhook endpoint claimed never added (07-18 §9) → live payment succeeds, entitlement never flips.

## C4 — Privacy, data-rights & crypto (crypto.ts, deletion/export, schema, analytics)
- billing_event_inbox.payload (jsonb) retains full Stripe events incl. customer email, NO user FK → survives account deletion (GDPR).
- pantry_orders.email plaintext + userId nullable → unclaimed paid order un-erasable by account-delete path.
- accounts OAuth tokens (refresh/access/id) plaintext in same DB as encrypted health data.
- crypto.ts sound (AES-256-GCM, fresh IV, keyring rotation, terminal guard). loadKeyring re-parses env every call (per-field cost on list pages). HEALTH_DATA_KEYS_OLD rotation mechanism UNDOCUMENTED → rotation from ops doc alone = permanent health-data loss.
- A1C in localStorage (revora.profile.v1) with NO consent gate on /onboarding (consent only on /welcome for server storage). Meal text in LS (history.v1) + SS (recheck) plaintext for guests pre-consent.
- Analytics = disciplined allowlist, no meal/A1C text. Residual: risk + a1cBand are health-derived low-cardinality signals leaving to Umami. No consent/opt-out gate on analytics load.
- POST-body search keeps meal text out of URLs ✅. But ?heal/?subscribed/?restored/?deleted state-revealing params in nav URLs (Umami records query strings).

## C5 — Reliability & failure paths (fail-open/closed, crons, idempotency, recovery, PWA)
- check/route.ts:231 entitlement/quota block ONE fail-open try/catch → DB blip bypasses trial wall + daily cap into paid spend.
- launch-controls.ts:166 kill switch resolves ENABLED when Edge Config unreachable/unset (fail-OPEN despite "fail-closed" comment).
- rate-limit.ts:135 evaluateRateLimit fails OPEN on Redis error. No per-user cost cap (all buckets IP/email-keyed); REVORA_DAILY_CHECK_CAP documented but unreferenced.
- Cron idempotency stamp-based not lease-based (except pantry-sweep) — trial-precharge/nudge concurrency double-send risk; verify SELECT FOR UPDATE in precharge.
- SW: no update flow (no updatefound/controllerchange/registration.update), skipWaiting without clients.claim, hardcoded cache name revora-v1 → new SW activates only on cold nav.
- prod schema stamped-not-verified (baseline-drizzle-journal) → hidden drift; no drizzle-kit check in CI.
- telemetry.ts:66 unknown responseKind throws → successful check silently degraded to retry card.

## C6 — Retention & product value (journey, memory, coach, cohort evidence)
- Recurring-value loop: uncertain meal → check → action → memory → recall → weekly learning → nudge → progress → graduation. Memory+journey FLAGS OFF in prod → loop NOT live.
- PRODUCT.md "moat is the daily relationship: memory, patterns" → forensic says NOT DELIVERED; zero code paths make a verdict depend on past checks. VERIFY meal-memory-non-interference (memory must never influence engine).
- NO cohort/payment/retention data exists. Concierge study + retention prereg PENDING HUMAN. Verdict floor = INSUFFICIENT EVIDENCE.
- Nudges: additive-only streak (no loss-aversion), quiet hours, inactivity stop 14d — check for dark patterns vs genuine value.
- Counterfactual: after users learn common meals, what new value next month? Does value survive novelty loss without more logging?

## C7 — Architecture & maintainability (cross-cutting)
- 7 handler-factory modules hold logic for 32 methods; route.ts wrappers thin, some never imported by tests (thin-wrapper coverage gap).
- tsconfig missing noUncheckedIndexedAccess (money+health `const [row]=` destructures typed non-undefined but can be undefined). No @typescript-eslint plugin → no no-floating-promises in async-heavy billing/cron paths.
- eslint bootstrapped 2026-07-11 (didn't exist before despite QA "lint Fixed"). Ignores .claude/** (stale repo copy).
- seed-reviewer-account.mjs re-implements encryptField by hand → silent desync; no parity test.

## C8 — Devil's advocate / non-code (challenge everything)
- Challenge: are the "fail-open" findings actually reachable in the real hosting topology? (Vercel overwrites x-forwarded-for; Edge Config presence in prod; Railway crons actually scheduled?)
- Challenge whether client-only page gates are real vulns (server routes may fully re-gate → defense in depth, not a hole).
- Non-code hypotheses: the real launch blockers are INFRA (DNS, Resend, Stripe webhook, Umami) + HUMAN GATES (counsel, RD/CDCES), not code. Is the code actually the binding constraint on readiness?
- Question the highest-consensus finding each round.
