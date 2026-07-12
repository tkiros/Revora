# 05 — Known Risks & Blockers (2026-07-10)

## Open findings by priority

### P1 (release requires owner + plan + sign-off)

| ID | Finding | Owner action |
|---|---|---|
| SEC-01 | Plaintext OpenRouter key in `openr.md` (now gitignored; key must be treated as exposed) | Rotate in OpenRouter dashboard; move to `.env`; delete file |
| SEC-02 | 5 provider keys live in git history commit `213ab8a` ("rotate later" still owed) | Rotate all 5 |
| SEC-03 | `next@16.2.4` high advisories incl. middleware/proxy bypass — `proxy.ts` is the pre-model cost gate | Upgrade to `next@>=16.2.10`; rerun `npm run test` + smoke |
| REL-02 / MODEL-C1 | Prompt doesn't state the postprocess contract → ~30–40% of model-reaching checks fail closed to retry (paid call wasted, user gets no verdict). Fix already specified in `docs/handoff/2026-07-09-openrouter-model-benchmark.md` | Implement prompt + schema + `max_output_tokens` fix as a reviewed safety-engine patch; rerun `eval:revora:live` + `eval:model-bakeoff:live` |

### P2

| ID | Finding |
|---|---|
| A11Y-01 | `/check` CTA below the 720px fold on iPhone 12 (y≈753; deterministic; regression scope of commit `c04d713` — was only verified on Chromium) |
| SEC-04 | No CSP/security headers configured |
| SEC-05 | Dev-dependency vulnerabilities (5 moderate, 2 high in full graph) |
| PRIV-01 | No user data-export flow (deletion exists). US launch: confirm CCPA position with counsel |
| REL-01 | Single-attempt model call turns connection blips into user-visible retries; no connection-level retry, no telemetry split between blip vs outage |
| REL-03 | `/api/check` `maxDuration=15` unverified against the active Vercel plan limit (code comment demands OPS check) |
| QA-01 | No lint config; no CI workflow found in repo (`.github/` absent) — test gates run only by hand |
| QA-02 | Bake-off mock mode labels model-path cases as "short-circuit" (cosmetic; mock client bypasses call recording) |

## Blocked / not executable in this environment

| Item | Why | Minimal unblock |
|---|---|---|
| Live Stripe/Play purchase, trial expiry, refund, restore-on-new-device | No sandbox credentials/devices provisioned in QA env | Stripe test-mode keys + Play internal-testing track; follow `docs/qa/launch-walkthrough-web.md` |
| VoiceOver/TalkBack, Dynamic Type | No devices/simulators on this box | Manual pass on iPhone + Android with checklist in report 08 |
| Production security headers/session checks | No authorized deployed target named | Point QA at a preview URL |
| Load/perf under concurrency, DB failover | No staging environment | k6 against preview + staging PG/Upstash |
| Live vision-extraction eval (meal/pantry photos) | Fixture corpus has 1 smoke image; extraction evals run mock-only without labeled photo set | Author labeled photo fixtures (consent-safe), run `eval:meal-photo` live |

## 2026-07-11 Remediation record

| ID | Status | Evidence |
|---|---|---|
| SEC-01 | Code-side done; **rotation still owed (owner)** | `openr.md` deleted; key must be rotated in the OpenRouter dashboard |
| SEC-02 | **Open — owner action** | 5 keys in git history commit `213ab8a`; rotate all in provider dashboards |
| SEC-03 | Fixed | `next@16.2.10`; full suite 819 passed, mobile smoke green |
| REL-02 | **CORRECTED 2026-07-11 — code fixed; "live-verified" was false** | The prompt/schema/cap patch (PR #5, cap 1024) is real and verified in the tree. The **"bakeoff live passed" claim is contradicted by its own artifact**: the only post-fix live run, `artifacts/qa/2026-07-11T18-37-40-939Z/`, records **24/24 provider failures and 0 tokens** — it ran without credentials and proved nothing (N-02). No passing live artifact exists on disk. Re-validation is tracked as W-07; the delivered-result rate remains unproven against its 58–70% baseline. |
| A11Y-01 | **CORRECTED 2026-07-12 — "Fixed" was measured against a fold that does not exist** | The finding itself says "below the **720px fold** on iPhone 12". **iPhone 12's viewport is 664px, not 720.** The test inherited the wrong number (`expect(cta.y).toBeLessThan(720)` for *both* projects — Pixel 5 is 727, so it was roughly right there and 56px too generous on Safari). The remediation moved the CTA from y≈753 to y≈714, cleared 720, and was recorded as passing on both devices — **with the button still off-screen**. The test could not go red until the CTA was already 56px past invisible. Closed properly 2026-07-12: assertion now measures `page.viewportSize().height` per project, and the check hero sheds its eyebrow + paragraph at ≤430px (~130px back; CI Safari 768 → ~635 of 664). **Not claimed:** full button visibility — that needs ~695px in a 664px viewport and fails on *both* devices without a form redesign. See `docs/qa/13`. |
| SEC-04 | Fixed | Security headers incl. CSP in `next.config.ts` |
| SEC-05 | Fixed | `postcss` override `^8.5.10`; `npm audit` 0 vulnerabilities (full graph) |
| PRIV-01 | **Open — counsel decision** | Data-export/CCPA position unchanged |
| REL-01 | Fixed | One connection-level retry (timeouts/HTTP excluded, single-paid-attempt kept); `connection_blip` telemetry reason split from `provider_error` |
| REL-03 | Verified | Hobby plan (Fluid, 300s limit) accepts `maxDuration=15` — production builds and serves |
| QA-01 | **CORRECTED 2026-07-11 — was marked Fixed against a file that had never been committed** | `.github/workflows/ci.yml` existed only as an **untracked local file** (`git ls-tree origin/main` → no `.github/`), so GitHub had never executed it: the original finding's condition ("test gates run only by hand") was still literally true on every branch, including main. The second half of QA-01 — "no lint config" — was never addressed at all: there was no eslint config and eslint was not even a devDependency. Both are closed under W-08, which also adds the missing `build`, secret-scan, and Playwright gates. **CLOSED AND PROVEN 2026-07-12:** CI has now actually executed — run [29180291815](https://github.com/tkiros/Revora/actions/runs/29180291815), 4/4 green, the first successful GitHub Actions run in this repository's history. Its first runs found five real defects that every local suite had reported green (`docs/qa/13`). |
| QA-02 | Open (cosmetic) | Mock-mode labeling unchanged |
| E2E-01 | Already fixed (`e58e753`) | `.env.example` placeholders only |
| E2E-02 | Closed | Live production `/api/check` returned a real SAFE result, 2026-07-11 |
| E2E-03 | **Open — owner decision** | Photo input defaults on vs. gated-off docs; needs product reconciliation |
| E2E-04 | Not reproducible | Full `npm run test`: 819 passed, 0 failed under load |
| E2E-05 | Superseded | Magic-link auth E2E proven by the E2E-06 harness (stubbed mailbox → session cookie) |
| E2E-06 | Closed | `docs/qa/11-e2e06-stripe-lifecycle-proof.md` — 12/12 steps passed |
| E2E-07 | No change needed | The flagged lines are the anti-reversal prohibitions themselves; user-facing copy is clean |
| E2E-08 | Already fixed | `middleware.ts`→`proxy.ts` rename done; lockfile warning pinned via `turbopack.root` |

## Risks accepted by design (documented, not defects)

- Engine is text+A1C only; photo is extraction-with-confirmation (TODOS.md roadmap).
- Rate-limit fails OPEN on transient Redis errors (OpenAI dashboard cap is the ceiling).
- Metering fails open on errors ("metering must never take the product down").
