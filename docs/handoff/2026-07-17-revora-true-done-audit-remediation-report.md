# Revora true-done audit & remediation report — 2026-07-17

## 1. Executive verdict

**CONDITIONAL GO for the WTP demand test (Option A landing/waitlist and, at the
owner's already-recorded risk acceptance, Option B pre-order). NO-GO for real
end-user food guidance** — that verdict is unchanged and unchangeable by
engineering: W-05/F-06 (credentialed RD/CDCES panel) and the counsel gate are
open by design, deferred behind the WTP result per the owner's 2026-07-17
decision. Nothing in this session simulates, weakens, or relabels those gates;
`npm run review:dietitian:close` still fails closed (exit 1, verified).

What changed today: the repository is now in the strongest truthfully
defensible state for the WTP-first plan. All four engineering blockers that
gated the WTP test itself are closed with regression coverage — CI red on
main, missing attribution, missing link-preview/SEO basics, and the
landing-vs-paywall promise mismatch — plus a CSP bug that would have silently
blinded the WTP funnel's analytics, and three smaller security hardenings.
This verdict covers **local engineering evidence only**; production claims
remain tied to the owner actions in §11.

## 2. Scope, branch, dirty state, environments

- Repo `/home/tefera/Desktop/Revora`, branch `feat/photo-path-tier1`,
  HEAD `be2c441` (== `origin/main`). Node v24.10.0, npm 10.9.4.
- Pre-existing user-owned dirty files were preserved untouched:
  `docs/handoff/2026-07-12-unconditional-go-handoff.md` (M),
  `docs/qa/18-simulated-240-panel-2026-07-16.md` (M, cosmetic tabs), and the
  untracked 07-12/07-16/07-17 handoffs. The only user-owned file this session
  modified is the WTP-first handoff, via an **append-only dated correction**
  (stale gate semantics), documented in §4.
- Environments: local working tree (buckets 1–4); GitHub CI (bucket 5, red at
  HEAD pre-fix, fix unpushed); production revora-lovat.vercel.app / revora.bio
  (bucket 7, **not probed this session** — no authorized live checks were run);
  external gates (bucket 8). No live model calls, no Stripe writes, no email,
  no deploys were made. Secrets were never printed; `openr.md` was not read by
  value.

## 3. Markdown corpus

408 repository-owned Markdown files inventoried and read — 408/408 accounted,
0 unreadable (manifest: `docs/qa/21-md-corpus-manifest-2026-07-17.md`). Four
are misfiled foreign-project (bcb) handoffs. One contains apparent live
credential material (`openr.md`, OpenRouter — not echoed; rotation owed,
ledger R-005).

## 4. Contradictions resolved

| # | Sources | Conflict | Verified truth / action |
|---|---|---|---|
| C1 | WTP handoff §3 vs `gh pr list`/git | "#13–#16 unmerged" vs none open | Stack merged; `origin/main`=`be2c441`. Dated correction appended to the handoff. |
| C2 | WTP handoff §4C + env docs vs commit `8c30265` | `LEGAL_TERMS_FINAL=1` opens checkout (default-closed) vs open-by-default | Code truth: open unless exactly `0` (kill switch), at all 3 checkout entry points + `/api/health`, four W-04 gate tests updated by the owner commit, fifth (env.test) fixed today (R-001). `docs/ops/env-reference.md` row added; counsel status unchanged (`NOT CLEARED`). |
| C3 | `docs/qa/15` "W-05 remains a launch condition" vs 90-Day §0.2 (W-05 absent) | Which launches W-05 gates | Both true, resolved exactly as the WTP handoff §2 records: demand measurement engages no panel gate; delivering guidance to strangers does. Preserved verbatim in this report and the ledger. |
| C4 | production-plan §4 / E2E-03 "photo ON by default, shipped past gates" vs launch-audit §8 / env-reference / human-actions §2 | Photo-assist default | Code truth today: exact-`1` opt-in, default 404 (e2e-proven in the default candidate). Historical ON-drift was real (07-07→07-09) and was re-gated; prod env value = owner check. |
| C5 | counsel-unlock handoff "insights active, no gate" vs current tree | Insights gating | `lib/longitudinal-insights-flag.ts` exact-`1`, server-enforced, copy conditioned — the concern was fixed by the flag's introduction. |
| C6 | sdd G2 deploy truth "prod PAYWALL_MODE=legacy" vs price-test runbook intent "flip to trial" | Live paywall mode | Unverifiable from repo; the landing now renders from `paywallMode()` either way (R-003), so the promise cannot mismatch under either owner choice. Owner should still confirm the prod value when reading the WTP result. |
| C7 | Neon (production-plan §12, price-test §2.2) vs Railway (ADR hosting-hybrid, env-reference, data-flow) | Prod DB | Railway (`DATABASE_URL`) is the decided truth; stale references noted (P3). |
| C8 | Retired scorecards / old counts (663→819→1099→1268 tests; riskAccuracy 0.879→0.917→0.958→0.970) | Which numbers are current | Current local counts in §8; latest live-provider metric remains the 2026-07-16 OpenRouter run (97.0%, 0 harmful-SAFE, 0 retry cards) — OpenRouter evidence, expressly NOT OpenAI-direct proof (R-010). |
| C9 | video-engine linter FLAG-only treatment/prevention vs claims-boundary hard-fail | Marketing-lint leniency | Human-ratified divergence (2026-07-09, cure/reversal/diagnosis stay hard-fail) — recorded, not "fixed". |
| C10 | docs/qa/18 cauliflower-crust SAFE-impostor vs doc-19 unanimous MODERATE | Cross-panel disagreement | Parked for the human panel (do-not-fix list, R-030). |

## 5. Canonical issue ledger

`docs/qa/22-true-done-issue-ledger-2026-07-17.md` — 35 canonical rows:
9 fixed-this-session (§A), 8 confirmed-open external/human (§B), 8
accepted-risk residuals (§C), and a supersession table (§D) closing out every
stale documentary claim (old red gates, terms placeholders, photo-default
drift, phase-2 gap claims, test-count drift, etc.). Historical finding IDs
(W-xx, F-xx, N-xx, G-xx, SEC/NEW/BUG/E2E-xx, DR-xx) are cross-referenced on
their rows.

## 6. Route & user-journey matrix

25 page routes, 41 API handlers, 5 migrations, 14 tables (8 encrypted
columns) mapped file:line in the session code-map (route matrix retained in
QA session artifacts; verification highlights):

- Visitor → onboarding → consent/A1C → first check: e2e `onboarding.spec.ts`
  (now 6-step incl. attribution), `mobile-check.spec.ts`, `daily-loop.spec.ts`.
- Check pipeline: input caps → deterministic clinical routes (8 families,
  fail-through to model by governed design) → prompt → schema → postprocess
  floors → fail-closed retry fallback; disclaimers server-rendered everywhere
  (`disclaimer-presence` tests).
- Photo path: default 404 (`photo-check.spec.ts`); enabled path draft→confirm
  only, no photo persistence promises intact.
- Taster → wall → checkout → webhook → entitlement: `trial-wall.spec.ts`
  (:3101 trial server), `billing-pages.spec.ts` (:3100 legacy), webhook
  signature fail-closed, entitlement reads session-scoped (verified non-gaps).
- Pantry purchase → intake → report: guest checkout by design; submit now
  blob-origin-restricted (R-021); report route IDOR-checked (id+userId).
- Account/consent/deletion: welcome-page Art.9 consent before persistence;
  `DELETE /api/account/health-data`; deletion cascade blob-before-rows.
- Ops: health truthful (checkoutGate/upstash/db/crons), crons timing-safe
  (now including pantry/process, R-022), kill switches documented.

## 7. Fixes implemented this session (all with regression tests)

1. **R-001** stale W-04 gate expectation — `tests/unit/revora/env.test.ts`
   (assert `"open"`, hermetic `delete LEGAL_TERMS_FINAL`).
2. **R-002** link-sharing basics — `app/layout.tsx` (metadataBase, OG,
   Twitter), `app/opengraph-image.tsx`, `app/sitemap.ts`, `app/robots.ts`;
   test `tests/unit/revora/seo-meta.test.ts`.
3. **R-003** mode-aware landing pricing + single-sourced price —
   `app/page.tsx`; tests `tests/unit/revora/landing-paywall-copy.test.ts`,
   + runtime pins in `tests/smoke/billing-pages.spec.ts` and
   `tests/smoke/trial-wall.spec.ts`.
4. **R-004** attribution — `lib/client/attribution.ts`,
   `components/attribution-capture.tsx`, `app/layout.tsx` mount,
   `lib/client/analytics.ts` (`attribution` event inside the scanned union),
   onboarding step in `app/(app)/onboarding/page.tsx`; tests
   `tests/unit/client/attribution.test.ts`, analytics + onboarding-flow
   updates, `tests/smoke/onboarding.spec.ts` all four walks.
5. **R-020** CSP↔Umami — `next.config.ts`; test
   `tests/unit/server/csp-umami.test.ts`.
6. **R-021** pantry photo-URL allowlist — `app/api/pantry/submit/route.ts`;
   negative tests in `tests/unit/server/pantry-submit.test.ts`.
7. **R-022** timing-safe pantry process doorway —
   `app/api/pantry/process/route.ts`; new
   `tests/unit/server/pantry-process-route.test.ts`.
8. **R-023** de-polluted `tsconfig.json` include list (kept teardown-healed).
9. **R-008** doc corrections — `docs/ops/env-reference.md`
   `LEGAL_TERMS_FINAL` row; dated append-only correction in the WTP handoff.

## 8. Verification evidence (bucket 3 — local, this tree)

Mid-session chain (17:00–17:05, pre-final): lint 0 · typecheck 0 · unit 0
(119 files; CI-equivalent count 1270 passed) · contract 0 · eval:revora 0 ·
review:dietitian:validate 0 · build 0. `review:dietitian:close` exit 1 =
**correct fail-closed** (absent real signed reviews; blocked-human, not a
software failure). `npm audit --omit=dev`: 0 vulnerabilities (4 moderate
dev-only, drizzle-kit chain). `git diff --check`: clean. Secret scan of the
session diff: clean.

**Final clean-room chain (post-all-fixes, no concurrent edits):**

| Gate | Result |
|---|---|
| lint | exit 0 |
| typecheck | exit 0 |
| unit (vitest) | exit 0 — 1310 passed, 2 skipped, 0 failed (124 files: 123 passed, 1 env-conditional skip) |
| contract | exit 0 |
| eval:revora (deterministic) | exit 0 |
| review:dietitian:validate | exit 0 (close-gate separately exits 1, fail-closed, as required) |
| build (next) | exit 0 (62 s) |
| playwright e2e (chromium + Mobile Chrome + Mobile Safari, 2 dev servers legacy/trial) | **exit 0 — 136 passed, 2 flaky (Mobile Safari progress-upsell pair, green on retry — documented webkit flake class), 12 conditional skips, 0 failed (5.1 m)** |

Playwright run history, reported honestly: (a) a mid-session baseline
(3 failed/6 flaky) was contaminated by this session's own concurrent edits
hot-reloading the dev servers — discarded as evidence; (b) the first
post-fix clean run caught ONE real regression this session introduced — the
trial-wall spec's tour walk was missing the new attribution step (its serial
file then left 14 tests un-run) — fixed, and the targeted rerun passed 24/24
across all three projects (Safari daily-loop also green, confirming its
one-off failure was parallel-load flake); (c) the full-suite rerun above is
the authoritative final result. The 12 skips are the documented
DB/webkit-conditional skips.

Live-provider, preview, and production checks were **not** run (unauthorized
this session); the latest live evidence remains the 2026-07-16 OpenRouter
gate artifact (97.0% riskAccuracy, 0 harmful-SAFE, 0 retry cards) — OpenRouter
≠ OpenAI-direct (R-010).

## 9. Security / privacy / billing / clinical / claims findings

- Security posture verified: session-scoped reads everywhere checked, no
  client-controlled amounts, webhook signature fail-closed, timing-safe
  secrets (now uniformly), CSP+headers present, flags server-enforced,
  fail-closed model fallback. Open items are external: key rotation (R-005),
  branch protection (R-026).
- Privacy: consent-before-persistence, purpose-bound consent, health-data
  erasure and account deletion verified in code+tests; encryption-at-rest
  exercised by real ciphertext test rows (PGlite). Export absent (R-027,
  counsel-scoped). Analytics remains a closed no-PII allowlist — extended, not
  weakened, by the attribution event (enum-only props; static no-free-text
  scans green).
- Billing: checkout open-by-default is an **owner-risk posture, not counsel
  clearance** — kill switch `LEGAL_TERMS_FINAL=0` verified at all three entry
  points and health. Trial lifecycle unit/e2e-proven; Stripe live webhook
  secret + test-mode mirror remain owner actions.
- Clinical/claims: hard-safety criteria hold on the final local candidate
  (0 forbidden-claim leaks in gates; fail-closed on unsupported output;
  simulated-panel labeling intact everywhere). The panel gate is untouched and
  fails closed.

## 10. Truth buckets

| Bucket | State |
|---|---|
| Local source+config | All fixes in working tree, uncommitted by policy (owner commits/pushes) |
| Local tests/runtime | Green as §8 |
| CI | Red at `be2c441` (R-001); fix ready to push |
| Preview/staging | None exercised |
| Production | Last verified 2026-07-12 era docs; NOT re-probed; G2 cron staleness unresolved (R-025) |
| External | Panel open (fail-closed), counsel NOT CLEARED (owner-waived), keys unrotated, provider capacity capped |

## 11. Remaining human/external actions (owner)

1. Review + commit/push this session's changes → CI green on main (unblocks
   fast weekly shipping; strategy #5).
2. Rotate exposed keys: OpenRouter (`openr.md`) + the 5 in history `213ab8a`
   (OpenAI, Resend, Upstash×2, Blob); record an attestation (SEC-01/02).
3. WTP launch set: DNS `revora.bio → 76.76.21.21`; set
   `NEXT_PUBLIC_UMAMI_SRC`/`_WEBSITE_ID` (CSP now follows automatically);
   create Tally waitlist form (H25); put UTMs on every shared link; write the
   pass bar down before the test (Part 10 rules).
4. Confirm prod `PAYWALL_MODE` value (landing now auto-matches either way);
   decide the WTP instrument (A now, B after — B takes money under the
   owner-risk record with counsel deferred, and `LEGAL_TERMS_FINAL=0` is the
   instant off switch).
5. Fix Railway crons (G2 stale `trialPrecharge`/`pantrySweep`), re-probe
   `/api/health`.
6. Model capacity: raise OpenAI tier or decide OpenRouter-in-prod; then run
   the one production-path `eval:revora:live` confirmation (~$0.05) with a
   clean env.
7. Stripe: H21 webhook secret, H23 test-mode mirror, H20 portal, H24 API
   version pin.
8. The day WTP passes: start RD/CDCES panel recruitment (calendar long pole)
   + in-app QA-consent Tier-2 photo capture; counsel packet when in scope.
9. P3 hygiene at leisure: delete 4 bcb handoffs + gmgn agent files + railway
   scratch dirs; tombstone reversal-era PRD amendments/traceability + 90-Day
   master prompt; strip `nexxt_steps` crypto tail.

## 12. Residual risks & recommendation

The engine's clinical calibration rests on SIMULATED panel evidence plus
OpenRouter live gates — strong engineering signal, zero clinical authority;
that is exactly why W-05 stays the launch condition for guidance-to-strangers.
The WTP test as specified (no guidance delivered) engages none of that risk.
Recommendation: ship the WTP demand surface now (everything engineering-side
is ready and green), read the result against the pre-written bar, and let the
result decide whether the expensive gates ever need to close.
