# Revora — End-to-End, Promise-Delivery & Paid-Retention Audit

**Revision under test:** `abfa05800efa0213ef6b0a374e9fde4ab82322db` (branch `feat/value-retention-plan-2026-07-18`)
**Candidate state:** DIRTY local candidate. Pre-existing user-owned changes preserved: 1 modified handoff doc (`2026-07-18-...forensic-master-prompt.md`, +14 lines) and 1 untracked handoff (`2026-07-20-...validation-master-prompt.md`). Audit-authored changes are listed in §7.
**Method:** 8-persona adversarial swarm (security, health-safety, billing, privacy, reliability, retention, architecture+a11y, devil's advocate) over a 6-agent source reconnaissance, each finding verified against current source (CONFIRMED / REFUTED / NEEDS-RUNTIME) and cross-checked by a synthesizer who independently re-verified the highest-severity items.
**Date:** 2026-07-20. Node v24.10.0, npm 10.9.4.

---

## Decision table

| Decision | Verdict | Confidence | Strongest evidence | Largest remaining gap | Exact next action |
|---|---|---:|---|---|---|
| Engineering E2E | **PARTIAL** | 70% | 1775/1777 unit+integration tests green on this revision; typecheck/contract/safety-eval clean; server authorization model verified sound (userId scoping on every private query, `flag 404 → 401 → 403` order) | Playwright E2E not run this pass; several confirmed money-path + reliability defects unfixed; core journeys never exercised in a real environment | Run `npm run e2e` on both paywall servers; apply the P1 billing + reliability fixes in §7 remaining-queue |
| Core promise delivery | **TECHNICALLY DEMONSTRATED (PARTIAL)** | 55% | The deterministic engine reproduces the promised routing (clinical-first, A1C bands, sugary/carb floors, banned-claims enforcement) through the real path for guests; promise-registry route shapes pinned by tests | No live-model eval this pass; no real-user evidence exists; all 3 promoted examples have `lastLiveCaptureAt: null`; sign-in likely non-functional in prod (DA-6) so no real user reaches the promise | Live-model eval of the safety corpus + a captured run of each promoted example on the real engine |
| Health/claims safety | **PASS-ENGINEERING / BLOCKED-HUMAN** | 60% | Deterministic enforcement verified sound: clinical routing has no `risk` field, `assertNoForbiddenClaims` runs on floored output, fail-closed on invalid model output, one-clarification cap never suppresses safety routing | RD/CDCES panel **never run** (W-05); every floor/threshold is engineering-derived; HS-1 routing defect (now fixed); FDA General Wellness framing question open (DA-NH-1) | Authentic credentialed RD/CDCES review + counsel intended-use determination; live-model harmful-SAFE corpus run |
| Long-term paid retention | **INSUFFICIENT EVIDENCE** (trending UNLIKELY at current framing) | 80% | Plan states verbatim (line 145): "There is no measured Revora user, payment, renewal, retention, WTP, or referral cohort." Umami undeployed (funnel blind); zero share/referral code | The compounding loop (memory, journey) is flag-off AND cannot compound by design — `checkFood` structurally cannot read history (verified); graduation ends the subscription rationale at day 90 | Execute the meal-memory concierge study (≥5/8 gate) at $9.99 **and** $12.99, after deploying Umami |
| Production readiness | **NO-GO** | 75% | Multiple external blockers converge: sign-in likely impossible in prod (magic-link-only + unverified Resend domain + `AUTH_EMAIL_FROM` default `revora.app` ≠ provisioned `revora.bio` + Vercel SSO); counsel not cleared; RD never run | These are infra + human gates, not code; UNVERIFIED from repo but corroborated across truth-index, human-actions-required, and a code-verifiable From-address mismatch | Provision DNS/Resend/verified domain, fix `AUTH_EMAIL_FROM`, remove SSO, deploy Umami; then counsel + RD gates |

**Headline:** Revora's code is materially better-engineered than a surface read suggests — the swarm **refuted 14 plausible-but-false alarms** (see §5) — but it is **not production-ready**, and the binding constraints are not code. The single most important finding (DA-6) is that no real user can currently sign in, which makes the paid-retention question **empirically unanswerable today** regardless of code quality.

---

## 1. Denominators (published inventory)

| Dimension | Count |
|---|---|
| Pages / layouts / error boundaries | 27 / 2 / 1 (no custom 404, loading, or global-error) |
| API route files / HTTP methods | 54 / 63 (GET 26, POST 30, DELETE 5, PATCH 2) |
| Handler-factory modules | 7 (hold logic for ~32 methods) |
| Components | 38 |
| `lib` modules / exported functions | 92 / ~215 |
| DB tables / migrations | 19 / 13 (+1 baseline stamp script) |
| Crons / webhooks | 5 (1 vercel.json, 4 Railway hourly-crons) / 3 (Stripe, Play RTDN, Push) |
| Feature flags / launch controls | 24 (3 Edge Config, 6 NEXT_PUBLIC build-time, 5 server-env, 10 presence-based) |
| Client storage keys | 8 (6 LS, 2 SS; 3 carry health data; 1 dead) |
| External dependency classes | 11 |
| Env var names in code / documented | 67 / 46 (8 doc-only, 21 code-only) |
| Scripts | 15 (2 prod-mutating, 1 sandbox-unguarded, 4 live-paid, 8 local-only) |
| Test files / top-level tests | 169 / ~1,377 (smoke ×2 mobile projects) |
| Safety eval corpus | 159 cases, 10 categories + 10 real-world strata |
| Playwright projects | 2 (Mobile Chrome, Mobile Safari) — **no desktop project** |

**Baseline verification (this revision, before audit fixes):** `typecheck` PASS · `contract` PASS (9 validators) · `eval:revora` 11/11 · `npm test` **1775 passed / 2 skipped** (152 files passed, 1 skipped), 591s. Not run this pass: `build`, `e2e`, live evals, `npm audit`, `review:dietitian:*` (the last is a human-evidence validator, correctly BLOCKED-HUMAN).

---

## 2. Consensus issue ledger (deduplicated, severity arbitrated)

Severity is the synthesizer's arbitration after weighing each specialist persona against the devil's advocate and the real Vercel+Railway topology. Evidence buckets: **CODE** = verified in current source; **RUNTIME** = requires prod/infra access; **HUMAN** = external approval. Fixability: **SAFE-LOCAL** = safely fixable in-repo; **GATE** = clinical/legal/product decision; **INFRA** = external provisioning.

### P1 — Major (fix before any real launch)

| ID | Finding | Bucket | Fix | Status |
|---|---|---|---|---|
| **HS-1** | Under `PAYWALL_MODE=trial` (prod default) a signed-in non-premium user is 402-walled **before** clinical routing — a user describing acute symptoms sees a subscribe prompt, not the "see a person" card | CODE | Hoist `classifyClinicalRisk` above the entitlement wall (deterministic, zero-spend) | **FIXED** (§7) |
| **BC-2** | A canceled-but-unexpired subscriber is shown "Renews {date}" — `cancel_at_period_end` is never persisted, so the UI states a future charge that will not occur (fabricated commercial claim; contradicts one-tap-cancel honesty elsewhere) | CODE | Persist `cancelAtPeriodEnd`; render "Access until X — will not renew" | Specified, not applied |
| **BC-1 / SA-8** | `GET /api/billing/cancel` mutates a Stripe sub from a URL token — mail safe-links (Proofpoint/Defender) issue the GET at delivery and silently cancel a trial before the human reads it. Token crypto is sound; the defect is the verb | CODE | GET renders a confirm page → POST performs the cancel | Specified, not applied |
| **BC-3** | With no registered live Stripe webhook, a first real purchase creates no `subscriptions` row, so **no local path can flip entitlement** (both heal branches iterate `rows`); the one-trial-ever gate also never trips → same card re-trials indefinitely. Logic verified airtight; webhook-registration premise is doc-only | RUNTIME + CODE | Register the live webhook (infra); AND server-side retrieve the Checkout session on the success-URL return and upsert (defense-in-depth) | Specified, not applied |
| **BC-8 / PR-1** | `billing_event_inbox.payload` retains full Stripe events (buyer email, name, address) with **no user FK**, so account deletion never reaches it; `failed`/`dead_letter` rows are retained forever. Directly contradicts the live privacy page ("we keep nothing after deletion") | CODE | Redact PII from `payload` when a row is marked `processed`; extend prune to `failed`/`dead_letter`; list the inbox in the privacy notice | Specified, not applied |
| **PR-2** | `HEALTH_DATA_KEYS_OLD` / `HEALTH_DATA_KEY_VERSION` — the entire key-rotation mechanism — appear in **no operator doc**; env-reference implies a single immutable key. A doc-driven rotation makes every `*_ciphertext` permanently undecryptable, silently (crypto fails quiet by design) | CODE | Document the two vars + the "never drop an in-use key" invariant; add `docs/runbooks/health-key-rotation.md` | Specified, not applied |
| **RE-04** | No per-user model-spend cap — all rate buckets are IP/email-keyed; one account rotating IPs can exhaust the global 2000/day and 429 everyone else. `REVORA_DAILY_CHECK_CAP` overrides only the **global** cap (docs describe it as per-user) | CODE | Add a `check_user` bucket keyed on `session.userId`; correct the two ops docs | Specified, not applied |

### P2 — Moderate (safe workaround exists)

| ID | Finding | Bucket | Fix | Status |
|---|---|---|---|---|
| **PR-3** | Two local `safeDecrypt` shadows on the history + memory read paths swallow GCM tamper failures with no Sentry, shadowing the canonical helper built to alert on exactly that | CODE | Delete shadows; route through `crypto.safeDecrypt` | **FIXED** (§7) |
| **AA-9** | Checkout error on `pantry-buy-button` has no live region → screen-reader user hears silence on a failed paid flow | CODE | `role="alert"` | **FIXED** (§7) |
| **RE-01** | The entire entitlement/quota block is one fail-open try/catch → a DB error bypasses the trial wall + daily cap into paid spend. Bounded on the normal path by the IP limit; teeth are the trial-wall bypass under partial DB degradation (down-arbitrated from persona P0: guests fall to the IP-metered path, per DA-1a) | CODE | Split the block; fail **closed** (retry card) for the trial wall, keep fail-open for the courtesy free cap | Specified, not applied |
| **RE-02** | Ops kill switch resolves to checks-**enabled** when Edge Config is unset/unreachable; the `// fail-closed` comment is factually inverted. For a health app, no working emergency brake (Edge Config account is unprovisioned per docs) | CODE | Correct the comment; fail closed when `EDGE_CONFIG` is set but the read throws; cache last-good | Specified, not applied |
| **RE-05** | `emitSafeEvent` uses throwing `.parse()` on a `.strict()` schema — a new engine response-kind not mirrored in the enum degrades a **successful** paid check to a retry card, logged as a model fault | CODE | `safeParse` + a `telemetry_schema_miss` counter; derive the enum from the response-kind union | Specified, not applied |
| **RE-03 / BC-10** | Pre-charge sweep is stamp-after-send, not lease-based → two overlapping runs double-send "you'll be charged" emails (repo already has the atomic-claim primitive in `pantry/process.ts`) | CODE | Claim-before-send: `UPDATE ... WHERE pre_charge_email_sent_at IS NULL RETURNING`; null the stamp on send failure | Specified, not applied |
| **RE-06** | Nudge cron is date-granularity stamped, no lease → duplicate push (mitigated on-device by SW `tag`) | CODE | Same claim-before-send pattern | Specified, not applied |
| **RE-07** | Service worker has no update flow and a hardcoded `revora-v1` cache name → a corrected `offline.html` never propagates without a manual cache bump | CODE | Build-stamped cache name (`revora-${BUILD_ID}`) + `updatefound`/`controllerchange` soft-refresh | Specified, not applied |
| **RE-08** | Prod schema was `push`-applied then journal-**stamped** (not `migrate`-verified); no `drizzle-kit check` in CI → hand-apply drift (e.g. missing `checks_migration_dedupe`) is permanently hidden | CODE + RUNTIME | Add a CI drift-diff job; one-time prod structural comparison vs `0012_snapshot.json` | Specified, not applied |
| **RE-10** | Persistence fail-soft shows the user a successful check while silently dropping the history row (and degrading result-linked feedback to anonymous) — retention-poison for a journaling product | CODE | Return `{persisted:false}`; client renders a quiet "shown, not saved" note | Specified, not applied |
| **BC-4** | Play RTDN handler: plain SELECT + blind UPDATE, no row lock, no ordering/terminal guard → a concurrent renewal/refund reorder leaves a refunded user premium | CODE | `db.transaction` + `SELECT ... FOR UPDATE` + `WHERE status NOT IN ('refunded','expired')` | Specified, not applied |
| **BC-5** | Verify-on-read / reconcile heal writes have no ordering guard → a heal fetched mid-renewal can clobber the new period end backwards (≥1h denied paid access) | CODE | Add `AND currentPeriodEnd <= row.currentPeriodEnd` monotonic guard (never move paid-through backwards) | Specified, not applied |
| **BC-6** | Play self-heal is neither rate-limited nor terminal-guarded (Stripe's is both) → quota burn + refund resurrection | CODE | Mirror the Stripe branch's `lastVerifiedAt` gate + terminal guard | Specified, not applied |
| **BC-7** | `pantry-checkout` is unauthenticated **and** outside the rate-limit matcher → scripted Stripe-session creation can 429 the real paid-conversion path | CODE | Add `/api/billing/:path*` to the proxy matcher with an abuse bucket | Specified, not applied |
| **SA-9** | `GET /pantry/claim` rebinds order ownership on navigation (hashed token + `isNull(userId)` guard limit blast radius) — a forwarded link / prefetch can transfer a paid order | CODE | Confirm page on GET → POST performs the rebind | Specified, not applied |
| **SA-10** | CSP allows `script-src 'unsafe-inline'` with no `report-uri`; HSTS lacks `preload`. Mitigated by React auto-escaping + locked `object-src`/`base-uri`/`frame-ancestors` | CODE | Add `report-uri` (needs an endpoint); schedule nonce migration. **Not** adding `preload` autonomously (one-way door) | Specified, not applied |
| **PR-4** | Unclaimed pantry orders (`userId NULL`) retain buyer email with no erasure path (corrected: email + Stripe IDs, **not** A1C/meal text — health fields require an authenticated claim) | CODE | Sweep phase: delete `userId IS NULL AND status='paid' AND createdAt < now-90d`; add claim-link expiry | Specified, not applied |
| **PR-5** | Erasure is **complete** (all 9 health tables + blob ordering verified); export is not — omits the exact A1C, weekly reflections, and the whole pantry corpus | CODE | Add `/api/account/export` bundling profile + reflections + pantry | Specified, not applied |
| **PR-6** | Analytics allowlist is clean of raw health text, but `risk` (health-derived) is sent, state-revealing URLs (`?health-data-deleted=1`) reach Umami pageviews, and there is no consent/opt-out gate | CODE | Strip flag params via `replaceState` before pageview; add an opt-out toggle; honor DNT; document `risk` | Specified, not applied |
| **AA-1** | `seed-reviewer-account.mjs` crypto has **already** desynced from canonical `encryptField` — omits the `v{version}:` prefix while its comment claims byte-for-byte parity (dev/reviewer account only) | CODE | Emit the version prefix; add a parity test | Specified, not applied |
| **AA-8** | Trial-wall plan selector is `<button role=radio>` with no roving tabindex/arrow handling — keyboard-reachable (not blocked) but a 4.1.2 name/role mismatch on the paid flow | CODE | Native `<input type=radio>` + styled label | Specified, not applied |
| **AA-10** | No desktop axe project despite a desktop sidebar → desktop-only a11y regressions ship unscanned | CODE + HUMAN | Add a chromium desktop project; manual AT testing remains a human gate | Specified, not applied |
| **HS-3** | `REVORA_ENFORCE_COMPONENT_MENTION` ships OFF — a model-authored adjustment can name a food not in the meal. **The naive fix is wrong**: flipping the flag retry-cards 100% of floored MODERATEs (executed, 4/4) and disproportionately harms non-Western dishes (equity). Grounding gap is real but narrow | CODE + GATE | Exempt floored/template drafts (use the `floorApplied` snapshot) **then** run one live-model eval to measure the retry-rate delta. Do **not** flip the flag | Specified, not applied |
| **HS-5** | The safety contract declares `uncertaintyFloors` (incl. `sugary_drink_or_dessert → HIGH`) that **no code reads** — enforced only incidentally by the hand-maintained token lists, which diverge from the declared policy | CODE | Drive floors from the fixture (map scenarioId → flag) or delete the unenforced clauses; add a drift test | Specified, not applied |
| **HS-6** | `knownGap` suppresses a case from 4 safety gates on one boolean, with no cap/expiry/owner — legitimate today (2 honest cases, verified) but an unbounded rubric-weakening valve | CODE | Add `expiresAt` + `owner`; assert `knownGapCount <= N`; narrow the outcome classifier | Specified, not applied |
| **HS-8** | `groundReason` does not run on SAFE results → a fabricated composition claim inside a SAFE reason is caught by nothing (the band where false reassurance does the most damage) | CODE | Extend `groundReason` to SAFE (replacement, not rejection — cannot lower a verdict) | Specified, not applied |

### P3 — Minor / dev-host / cosmetic

| ID | Finding | Status |
|---|---|---|
| **SA-12** | `pantry/upload` `request.json()` sat above its try → 500 instead of 400 on malformed body | **FIXED** (§7) |
| **SA-1 / SA-2** | Video-engine routes: unvalidated `date` → path traversal, and no auth/CSRF. **Dev-host only** — SA-3/DA-2 confirm the `VERCEL_ENV` + `NODE_ENV` double-lock 404s them in any real deploy | Specified (hoist the existing date regex; add origin check) |
| **BC-9** | `checkout.session.completed` guards `refunded` but not `expired`; sibling branch guards both — resurrection blocked only by second-granularity timestamps | Specified (extend guard to `expired`) |
| **AA-2 / HS-9** | `safety-contract.ts` reads the `tests/fixtures/` JSON at request time via `process.cwd()`. **Not** a live deploy break (build trace confirms all 5 files bundled) — fragility: any build excluding `tests/` breaks the check flow | Specified (move fixture to `lib/revora/`, `import` it) |
| **AA-6 / AA-7** | Dead `revora.segment.v1` write; 1,445-line billing god-module | Specified (delete; split by provider) |
| **HS-10** | `\btreat\b` banned-claim pattern over-blocks ("a sweet treat" → retry card) | Specified (require clinical context) |
| **SA-11** | `getClientIp` trusts first XFF hop — correct on Vercel, unasserted | Specified (comment naming the Vercel dependency) |

---

## 3. Clinical-gate items (W-05 — do NOT engineer closed)

Per Rule 4, these change clinical banding and require authentic RD/CDCES review, not engineering judgment. The safety persona verified each by executing the pure functions offline; the synthesizer confirmed the engine ordering.

- **HS-2 — PARTIALLY REFUTED.** The claim "the protein/veg buffer disables the sugary HIGH floor" is real (`orange juice and scrambled eggs` → no deterministic floor), but the buffer-gating is **intentional design**, not an oversight: the precheck test `"still honors a real protein buffer on the same base meal"` deliberately asserts `donut + scrambled eggs` is not force-floored, while spoofed buffers (protein *bar*, embedded protein words) correctly still floor. Whether buffered sugary *drinks* specifically should floor HIGH regardless of buffer is a clinical distinction reserved for W-05. **An audit change here was implemented, validated against the eval as an oracle, and reverted** when the unit test revealed the design was intentional.
- **HS-4** — vocabulary gaps (frappuccino is structurally dead: in `HIGH_RISK` but not `CARBS_ONLY`; lemonade/red bull/chocolate bar/pie absent). Adding foods to a risk floor is a dietary judgment.
- **HS-7** — both photo evals are permanently skipped in CI (only `labels.example.json` committed); the entire 159-case corpus replays fixture-authored model output, so it validates the deterministic layer but **cannot detect a model regression**. The model layer and every clinical threshold are UNVALIDATED. Requires a live-model corpus run + W-05 sign-off.

**Bottom line on safety:** the deterministic enforcement machinery is genuinely well-built and verified sound (clinical-first ordering, no `risk` field on the clinical schema, banned-claims on floored output, fail-closed on invalid output). But engineering evidence is **not** clinical validation, and the RD/CDCES panel has never run.

---

## 4. Promise-to-proof matrix (core families)

| Promise | Verdict | Evidence |
|---|---|---|
| First meal check is fast, understandable, cautious, actionable | **PARTIAL** | Deterministic path reproduces it for guests; no real-user evidence; ~10s single-attempt path (`MAX_MODEL_ATTEMPTS=1`) |
| Text & voice converge on the same reviewed path | **PROVEN (engineering)** | Voice transcript lands in the same `food` textarea → identical `/api/check`; `inputMethod` fidelity tested |
| Photo produces an editable draft, not a verdict | **PROVEN (engineering)**, flag-gated | `photo-draft-review` blocks confirm until every uncertain item is tapped; flag claimed prod-ON but only via a pre-branch snapshot (UNVERIFIED this branch) |
| `Clear`/`Be careful`/`Hold off` mean only general meal-pattern categories | **PROVEN (engineering)** | `assertNoForbiddenClaims` on floored output; clinical schema has no `risk` field; banned families enforced |
| Ambiguity → honest clarification, not fabricated certainty | **PROVEN (engineering)** | One-clarification cap never suppresses clinical/floor routing (verified) |
| Reason matches the food; adjustment matches the verdict | **PARTIAL** | Reason grounded on non-SAFE (HS-8: not on SAFE); adjustment grounding is flag-off (HS-3) |
| Encrypted history, cross-device, progress | **PROVEN (engineering)** | AES-256-GCM verified sound; keyset pagination; POST-body search keeps meal text out of URLs |
| Premium price/trial/cancel/refund from server authority | **PARTIAL** | Pricing authority verified clean (no client fallback price); but BC-1/BC-2/BC-3 defects + refund-path infra deferred |
| Deletion/export/consent match real data flows | **PARTIAL** | Deletion **complete** (all 9 tables); export incomplete (PR-5); billing-inbox PII survives deletion (BC-8/PR-1) |
| No launch surface reintroduces banned claims | **AT RISK** | DA-NH-1: public landing + OG name the prediabetes A1C range + directive "Hold off" — FDA General Wellness question routed to counsel; truth-index C7 already concedes "not a medical device" is "Overstated — must not stand" |

---

## 5. Refuted alarms (do NOT carry forward as defects)

The swarm's verification value is as much in what it killed as what it found. Fourteen plausible findings were refuted against source:

- **openr.md "committed secret P0"** → gitignored, never tracked in any commit (independently confirmed via `git log --all`). Local scratch file; rotate as hygiene only.
- **Video-engine "unauth RCE one env-var from prod"** → double-locked (`VERCEL_ENV` **and** `NODE_ENV`); unconditionally 404 on Vercel and on the Railway placeholder. Dev-host vector only.
- **reviewer-signin env-name mismatch** → code and doc both use `REVIEWER_TEST_SECRET`; constant-time compare; prod-blocked; target account is a module constant.
- **Client-only page gates = authz hole** → every private read/mutation re-gates server-side with `userId` scoping; client gating is cosmetic defense-in-depth.
- **Open redirect via `callbackUrl`** → double-sanitized (`startsWith("/") && !startsWith("//")`).
- **IP spoofing** → Vercel overwrites `x-forwarded-for`; correct for the deploy target.
- **`noUncheckedIndexedAccess` bug** → all 34 first-row destructures in money/health paths are guarded; tooling gap only.
- **Floating promises in money paths** → none found; tooling gap only.
- **Untested thin route wrappers** → the wrapped logic is factory-tested; wrappers are pure re-exports.
- **OAuth token columns plaintext** → no OAuth provider configured (magic-link only); columns never populated.
- **Pre-consent on-device health storage** → device-local, disclosed in the privacy notice, server-gated by explicit Art. 9 consent before any transmission.
- **Unpeppered deletion-log hash** → preimage is a random UUID (122 bits), not enumerable.
- **`a1cBand` in analytics** → sent by no event (verified against the full union + allowlist Set).
- **HS-2 sugary buffer** → intentional design (see §3).

---

## 6. Retention analysis (Phase 8)

**Verdict: INSUFFICIENT EVIDENCE**, trending **UNLIKELY WITHOUT MATERIAL CHANGE** at the current $12.99/mo indefinite-subscription framing.

- **Technical readiness of mechanisms:** high for what is built, low for what is live. All four journey modules are pure, IO-free, unit-tested; but 4 of 8 loop steps (memory save, recall, weekly learning, graduation) are flag-off in prod, and every *compounding* one is among them.
- **Strength of recurring value:** weak and front-loaded. The check engine accepts exactly `{food, a1c}` and a source-scanning test **structurally forbids** it from importing memory — so a verdict can never depend on history (verified). This non-interference is the correct safety choice, but it means `PRODUCT.md`'s "the moat is memory, patterns" is refuted by the architecture: memory is a user-owned log beside an unchanged answer, and the weekly artifact is a deterministic re-count of the user's own inputs from a 5-string bank.
- **Commercial evidence at current price:** **zero** — no cohort, payment, cancellation, interview, or funnel data. The plan concedes this at line 145.
- **Dark patterns:** none found across six probes (streak cannot break; nudges wind down, never win back; cancellation is one-tap with no retention screen; access runs to period end; all journey copy is pinned by the same banned-claims regexes as the LLM). The one tension: the BAI "progress" score is ~80% usage-frequency, so it **falls as the user's need falls** — pointing opposite to the graduation philosophy.
- **Which features create NEW value over time:** honestly only two — checking *genuinely novel* meals (travelers, the newly diagnosed) and calibrated clinical-risk routing a generic chatbot cannot replicate. Everything else reflects the user's own inputs back.
- **What should stay OFF:** `LEARNING_JOURNEY_ENABLED` until the concierge gate passes; `MEAL_MEMORY_ENABLED` only if framed as a private log, never "the app learns you."
- **Single next experiment:** the meal-memory concierge study exactly as written (≥5/8 achieving both ≥2 unprompted recalls AND continuation at the disclosed price), after deploying Umami, at both $9.99 and $12.99.

---

## 7. Fixes applied this pass

All fixes are safe-direction or pure-improvement, verified against the baseline. Each non-trivial one carries a regression test.

| ID | Change | Files | Test |
|---|---|---|---|
| **HS-1** | Clinical routing preempts the paywall: clinical-matching inputs skip the entitlement wall so `checkFood` returns the zero-cost "see a person" card instead of a 402 | `app/api/check/route.ts` | `tests/unit/server/check-clinical-preempt.test.ts` (new) |
| **PR-3** | Both health-data read paths now decrypt through the canonical `crypto.safeDecrypt`, which reports GCM tamper to Sentry instead of swallowing it | `app/api/history/handlers.ts`, `app/api/memory/handlers.ts` | `tests/unit/server/decrypt-tamper-alerting.test.ts` (new, source-scan guard) |
| **SA-12** | `pantry/upload` parses the body inside its try → 400 (not 500) on malformed JSON | `app/api/pantry/upload/route.ts` | typecheck + lint (behavior strictly safer) |
| **AA-9** | Checkout error announced via `role="alert"` on the paid flow | `components/pantry-buy-button.tsx` | `pantry-buy-button.test.ts` (existing, green) |

**Deliberately NOT auto-applied** and left as precise specs: all money-path billing fixes (BC-*, risk of subtle regression in live-money code warrants focused review), the fail-open reliability fixes (RE-01/RE-02 involve a product decision on the availability-vs-safety tradeoff), all clinical-gate items (HS-2/4/5/7, Rule 4), and the one-way-door / endpoint-dependent hardening (HSTS preload, CSP report-uri). The `AUTH_EMAIL_FROM` default mismatch (`revora.app` vs provisioned `revora.bio`) is flagged but not changed — the correct domain is an infra decision.

---

## 8. External & human blockers (the binding constraints)

These dominate the code findings for production readiness. All are UNVERIFIED from the repo (production/infra buckets) but corroborated across `truth-index.md`, `human-actions-required.md`, and — for the auth chain — a code-verifiable mismatch.

1. **Sign-in likely non-functional in prod (DA-6).** Magic-link is the sole ingress (no OAuth); Resend sending domain unverified; `AUTH_EMAIL_FROM` defaults to `revora.app` while the provisioned domain is `revora.bio`; Vercel SSO fronts the app. Each independently blocks a real account. **This makes paid-retention empirically unanswerable today.**
2. **FDA General Wellness framing (DA-NH-1).** Public surfaces name the prediabetes A1C range (5.7–6.4%), collect the user's A1C to tune output, and emit directive "Hold off" verdicts — the profile of a product **outside** the General Wellness safe harbor. Counsel intended-use determination required; safety-hardening makes the position *worse*, not better.
3. **Refund path absent (DA-NH-2).** Stripe can take money (live) but the monitored support/refund path (P0.4) is deferred → charged users who cannot sign in become chargebacks, not refunds → processor-termination risk. Composes with cron-drift (unverifiable Railway scheduling).
4. **Human gates open:** RD/CDCES panel never run (W-05); counsel waived-not-cleared; privacy/DPIA pending; representative-user usability pending.
5. **Observability dark:** Umami undeployed (funnel blind); `NEXT_PUBLIC_SENTRY_DSN` unconfirmed (client errors possibly silent).

**Scope note for the owner:** the 2026-07-18 forensic prompt's user-appended §9 ("completely ignore" the DNS/Resend/Stripe-webhook/Umami/key-rotation residuals) conflicts with the 2026-07-20 master prompt's Rule 3, which requires explicit renewal of any inherited exclusion. This audit treated those residuals as **in-scope for reporting** (they are all external/infra, none locally fixable). If you intend to keep them out of scope, please renew that exclusion explicitly.

---

## 9. Direct answers

- **Does Revora deliver its promise?** For a **guest** doing a first-day taster check, the deterministic engine reproduces the promised cautious, routed, floored, claim-bounded result — TECHNICALLY DEMONSTRATED. There is **no real-user evidence** that it is understandable and useful, and — pending the sign-in fix — no signed-in user can reach the account-based promises at all.
- **Can it keep paying users for 90/180/365 days?** Unknown and currently **unmeasurable.** No paid cohort exists; the compounding loop is off and cannot compound by design; the product's own graduation flow ends the subscription rationale at day 90. The honest floor is INSUFFICIENT EVIDENCE, and the code's own logic points toward UNLIKELY at the current price/framing.
- **What is proven vs inferred vs unknown?** *Proven (engineering):* deterministic safety enforcement, authorization model, crypto, deletion completeness, pricing authority, 1775 green tests. *Inferred:* the sign-in blocker (doc-corroborated + one code-verifiable mismatch). *Unknown:* clinical correctness (RD never run), live-model behavior, real-user value, all retention.

---

## 10. One prioritized next action

**Restore sign-in and deploy Umami** (fix `AUTH_EMAIL_FROM`, verify the Resend domain, remove SSO, provision DNS). Until a real user can create an account and be measured, every code fix in this report — however correct — moves the retention question, and the readiness question, not one inch. After that: counsel intended-use determination (DA-NH-1) and the RD/CDCES panel (W-05), then the concierge study.

## Final recommendation

**NO-GO** for production launch on this revision. **CONDITIONAL GO** for continued engineering: the codebase is fundamentally sound and honestly built, the safe P1 safety-routing and privacy defects fixed this pass are verified green, and the remaining defects have precise specified fixes. Do not represent Revora as ready, validated, clinically approved, legally cleared, or capable of retaining paying users — none of those gates is green, and the evidence for the last two does not yet exist.
