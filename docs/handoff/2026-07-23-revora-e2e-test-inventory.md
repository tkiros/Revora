# Revora test and evidence denominator

> Source snapshot:
> `b5c03f4666ea793923482b08fd53c45c037467e7`. Production changes one
> accessibility spec but retains the same 17-spec and 79-logical-test
> Playwright denominator.

## Test-source denominator

| Class | Files | Static test call sites / resolved cases |
|---|---:|---:|
| Vitest unit/integration | 175 | 1,447 direct `it`/`test` call sites before `.each` expansion |
| Deterministic/live eval | 4 | Collected counts come from execution evidence |
| Playwright browser | 17 | 79 logical tests, 237 project cases |
| **Total source files** | **196** | Execution totals are recorded in run evidence |

The 175 Vitest files split into: API 1, client 24, coach 7, components 1,
journey 4, meal 1, Revora engine/contracts 49, server/data/integrations 65,
video engine 16, and unit-root/config 7.

Playwright runs three projects: Mobile Chrome, Mobile Safari, and Desktop
Chrome. The harness uses one worker, optimized `next start` builds, retained
failure traces, and HTML reporting.

## Playwright logical denominator — 79

| Spec | Logical tests | Project cases |
|---|---:|---:|
| `a11y.spec.ts` | 10 | 30 |
| `account-support.spec.ts` | 1 | 3 |
| `auth.spec.ts` | 2 | 6 |
| `billing-pages.spec.ts` | 4 | 12 |
| `daily-loop.spec.ts` | 4 | 12 |
| `dashboard.spec.ts` | 5 | 15 |
| `journey.spec.ts` | 8 | 24 |
| `launch.spec.ts` | 3 | 9 |
| `legal-placeholders.spec.ts` | 2 | 6 |
| `mobile-check.spec.ts` | 13 | 39 |
| `nudge-opt-in.spec.ts` | 2 | 6 |
| `onboarding.spec.ts` | 7 | 21 |
| `pantry.spec.ts` | 2 | 6 |
| `photo-input.spec.ts` | 1 | 3 |
| `pwa.spec.ts` | 4 | 12 |
| `trial-wall.spec.ts` | 8 | 24 |
| `voice-input.spec.ts` | 3 | 9 |
| **Total** | **79** | **237** |

This refresh supersedes the authoring-time “about 80” statement. It is a suite
denominator, not a complete product denominator.

## Conditional skips and hidden retries

- `eval:meal-photo` is a live provider suite and self-skips unless both a
  private labels file and `OPENAI_API_KEY` exist. Unlike the Pantry eval, it
  has no explicit live-eval switch. The audit intentionally leaves it skipped
  because no live-call budget or authorization was provided.
- `eval:pantry-extract` runs live only with `REVORA_LIVE_EVAL=1`, a key, and
  the labeled founder-photo corpus. Otherwise a setup test passes while the
  actual live suite is skipped.
- Auth and account-support browser cases require a disposable loopback
  Postgres database and mailbox. The audit provisions those locally.
- Pantry browser and signed-in Pantry axe cases additionally require a private
  Blob token; the isolated default harness explicitly blanks that token.
  Report generation also needs a live model judge. Those cases therefore skip
  in the safe default gate.
- Service workers are blocked for all Playwright projects. Unit tests inspect
  the service-worker file, but browser offline/cache/update behavior is not
  exercised.
- Global `retries: 0` is overridden by `dashboard.spec.ts` and
  `legal-placeholders.spec.ts`, each with `retries: 2`. Seven logical tests,
  or 21 project cases, are therefore retry-enabled despite the config's
  no-retry claim.

## Material coverage gaps

| Capability/state | Existing evidence | Missing direct evidence |
|---|---|---|
| Premium unlimited checks | Server entitlement and isolated taster helper tests | Signed-in trial/monthly/annual user in trial mode through check 11; current composition is broken |
| Meal Memory | Extensive handler/unit tests | Flag-on browser path, cross-device use, asymmetric twins, flag-off export after use |
| 90-day Learning Journey | State/handler/nudge/weekly unit tests; recap browser spec | Actual flag-on browser state machine, rollback after pause, true initial-start concurrency |
| Photo assist | Route unit tests and flag-off browser assertion | Flag-on draft/review/edit/discard/provider/storage journey; entitlement-read failure; quality corpus |
| Stripe/Play | Rich mocked reducers and a separate manual Stripe test-mode script | Safe default composed provider lifecycle, Play RTDN/restore device path, deployed binding proof |
| Pantry | Handler and state-machine unit tests | Safe default skips provider-backed lifecycle; submit/confirm concurrency and partial-commit recovery |
| Account deletion/health withdrawal | Handler tests | Browser workflow and complete post-delete/export denominator |
| Export completeness | Handler response tests | Schema-to-export inventory proving every user-owned category is present or disclosed |
| Offline/PWA | Static manifest/SW and limited PWA browser assertions | Offline launch/check/history, cache boundaries, update and reconnect with service worker enabled |
| Accessibility | Axe critical/serious scans on selected states | Complete WCAG 2.2 AA scan, keyboard/screen-reader/focus restoration, 200% zoom, large text, touch targets |
| Console/network/server cleanliness | Individual visible assertions | Suite-wide fail-on-console/network/hydration/unhandled-error collector |
| Production first promise | Health/config and earlier provider probes | Exact deployed `/api/check` end-user journey after the prior observed fallback failure |

## Evidence interpretation

- A passing Vitest suite largely proves deterministic, mocked, or PGlite-backed
  behavior.
- A passing default Playwright suite proves selected optimized local paths with
  stubbed model responses and provider isolation.
- Conditional skips are blockers, never passes.
- Retry-enabled cases remain flaky until first-attempt evidence is established.
- Neither class proves deployed provider bindings, real-user usefulness, or
  paid retention.
