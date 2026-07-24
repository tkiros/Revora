# Revora — Session Handoff: PR #25 CI unblocked + merged + deployed, umami CSP blackout found & fixed

**Written:** 2026-07-22 · **For:** the next session · **Branch at handoff:** repo root sits on `fix/umami-csp-ingest-origin` (merged) · **`main`:** `4b05844`
**PRs this session:** **#25 MERGED** (`dd9f6ba`) · **#26 MERGED** (`b3cd311`) · **#27 MERGED** (`4b05844`) · **no open PRs** · Working tree: only the owner's own uncommitted edits (see §E7).

Continues `docs/handoff/2026-07-22-post-c7-owner-unblock-design-review-ship-handoff.md`. That handoff's §B1 said "check PR #25 CI, then merge." CI was **red**, and the cause was not what it predicted. All of §B1–§B3 and §B5 are now done; §B4 is owner-only and still open.

---

## A. DONE this session (all verified, nothing taken on trust)

### A1. PR #25's red CI — root-caused, fixed, merged

**Symptom:** `tests/smoke/trial-wall.spec.ts:98` — `expect(page).toHaveURL(/\/onboarding$/)` timed out on Desktop Chrome + Mobile Chrome + Mobile Safari, **both attempts**, 123 polls across the full 60s. 192 passed / 3 failed / 21 did-not-run. Reproduced on a CI re-run (16m22s), so **not a flake**.

**The previous handoff's prime suspect was WRONG and is now refuted.** The A1C persistence rework (`78021ba` → `18d829a`) did **not** break `FirstRunGate`. Evidence gathered directly:
- `localStorage` is **empty** at failure time (dumped from the live failing page), so `isFirstRun(0, null, null, null)` correctly returns `true`.
- The server answers **`GET /onboarding 200`** in every failing run — `router.replace()` fires.
- A warm solo local run walks the entire first-run flow: `/check` → `/onboarding` → tour → back to `/check`.

**Actual root cause.** The assertion times Turbopack's **first compile** of both `/check` and `/onboarding` — server modules *and* the dev client chunks hydration blocks on — plus an RSC round-trip, inside one 60s window, with all three projects hammering the single `:3101` dev server. That window had already been widened once for exactly this (30s → 60s, commit `0fc5d70`). The branch's contribution was the **font fix**: before it, `var(--font-sans)` never resolved and the woff2 files were **never downloaded at all**; after it, all 4 files (5 weights, latin subset) are fetched on every page load in every context. Enough to tip an already-marginal window. CI wall time moved with it — `main` runs 7–10.6 min, the failing branch 12.3 and 14.4 min.

**The decisive experiment** (do this again if it recurs): cold cache + all 3 projects → fails on **the branch AND on `main`**; warm → passes 23/23. That local A/B is what proved the three candidate files innocent and pointed at compile timing instead.

**Fix — `d3225b4`, `tests/smoke/trial-wall.spec.ts`:** a `test.beforeAll` that warms `/check` and `/onboarding` with a **real browser navigation** (not `fetch` — the dev *client* chunks must compile too) on a throwaway context, with `testInfo.setTimeout(240_000)`. The product assertion is untouched. Result: **215 passed, 0 failed, 0 did-not-run** (the 23 trial-wall tests that serial mode used to skip now actually run).

Deliberately NOT done: reverting the font fix (it corrects a real user-facing bug) and bumping the timeout again (that already failed at 30s and 60s).

**Also fixed — `829df79`, `playwright.config.ts`:** the config set **no reporter**, so `ci.yml`'s `playwright-report/` upload always logged "No files were found" and every red CI run discarded its own evidence. Added `reporter: [["list"], ["html", { open: "never" }]]` and `use.trace: "retain-on-failure"`. This is why the failure had to be re-diagnosed by hand against a dev box that compiles ~10× slower than the runner.

**Three consecutive green playwright runs since:** 12m46s, 11m18s, 11m14s.

### A2. PR #25 merged + post-deploy verification (all PASS)

Merged `dd9f6ba` (merge-commit convention). Verified on revora.plus **after** the production deploy:

| Check | Result |
|---|---|
| **Font** | `getComputedStyle(document.body).fontFamily` = `"Plus Jakarta Sans", "Plus Jakarta Sans Fallback"`; `document.fonts.check('16px "Plus Jakarta Sans"')` **true**; confirmed visually in a screenshot (sidebar, teal hero, correct type) |
| **Sentry CSP** | `connect-src` carries `https://o4511672801820672.ingest.us.sentry.io`; SDK initialises (`window.__SENTRY__` present, client live); no CSP violations for it |
| **Titles** | `/meals` → `"My meals — Revora"`, `/journey` → `"My journey — Revora"` |
| **A1C skip** | fresh device → walkthrough → enter 6.1 at step 4 → "Skip setup and check a meal" → `/check?stay=1` with **6.1 prefilled** |
| **Legacy routes** | `/progress`→`/journey`, `/history`→`/meals`, `/memory`→`/meals`, all **308** |
| **Health** | `ok` · db ok · upstash configured · checkout open |

### A3. PR #26 — truth-index closed honestly

`docs/release/truth-index.md` still read "Still open on owner: … the Sentry client DSN." Rewritten to record that the DSN is set, ships, initialises, and is CSP-unblocked — while stating plainly what is **not** proven: **no envelope has been observed delivered end to end**, because that needs a real error and none was forced against production. Also records the Stripe endpoint state.

### A4. PR #27 — umami CSP blackout (found during A2, pre-existing, now fixed AND proven)

**This is the most consequential find of the session.** Umami cloud serves the tracker from `cloud.umami.is` but that build hardcodes a **different** host as its send target. Straight from the served script (only host in the whole 4.6 KB file):

```js
K = `${(x || "https://gateway.umami.is").replace(/\/$/,"")}/api/send`
```

`connect-src` derived its umami token from `NEXT_PUBLIC_UMAMI_SRC` — the **script** URL — so the gateway was never allowed and the browser refused every beacon:

```
Connecting to 'https://gateway.umami.is/api/send' violates the following
Content Security Policy directive: "connect-src …"
```

**Every client `track()` call was silently dropped.** Same shape as the Sentry bug #25 fixed (script origin allowed, ingest origin not). **Pre-existing** — #25's https-only `originFromEnv` rewrite is behaviour-identical for that URL.

**The test was actively hiding it.** `tests/unit/server/csp-umami.test.ts`'s own docstring asserted the beacon POSTs go to the script origin — true for a self-hosted install, false for umami cloud — so it stayed green against broken production. Corrected, plus 4 new tests. **The two positive ones were verified to fail without the fix** by reverting `next.config.ts`.

**Fix:** `connect-src` gains the ingest origin, defaulting to the gateway **only when the script origin is exactly `https://cloud.umami.is`** (exact match, not substring — `cloud.umami.is.example.com` must not match), overridable via new optional `NEXT_PUBLIC_UMAMI_HOST_URL`. A self-hosted install is deliberately **not** widened to a third party, and the ingest host stays out of `script-src`. **No Vercel env change was needed.**

**Verified live after deploy — this is the proof that counts:** 3 × `POST https://gateway.umami.is/api/send` → **200**, zero CSP violations. (One `FAIL` in the same capture was the local network, not CSP — see §E4.)

Also corrected `docs/ops/env-reference.md`, which described umami as "self-hosted on Railway" while production points at umami cloud.

### A5. Gates run this session (fresh, on the final tree)

`typecheck` 0 · `lint` 0 errors (19 pre-existing warnings) · `contract` 0 · `npm test` **1867 passed / 2 skipped (165 files)** · production `build` clean · e2e green on CI ×3.

---

## B. IMMEDIATE next actions — the exact path to DONE

Everything remaining is either an owner browser action or a decision. **There is no outstanding code work and no red CI.**

### B1. Owner-only: Stripe test round-trip (5 min, browser)
1. Stripe Dashboard → account **`acct_14W8GFKweWSWjefk`** ("Vendoval") → Developers → Webhooks.
2. Open endpoint **`we_1TqNZLKweWSWjefk1MkEUChd`** (→ `https://revora.plus/api/billing/stripe/webhook`, Active, all 6 events bound).
3. **⋯ → Send test event → `charge.refunded`.**
4. **Pass = 2xx delivery** in the endpoint's event log. If non-2xx, capture the response body before changing anything — do **not** rotate the signing secret (handoff rule, unchanged).

⚠ The Stripe MCP allowlist has **no** webhook-endpoint operations. The dashboard is the only path. Do not burn time re-checking this.

### B2. Owner-only: support-case round-trip (5 min, browser)
1. Sign in at `https://revora.plus/account` — magic-link email, **the login wall IS the flow**, there is no password.
2. Submit a help case.
3. **Pass =** the email lands in `support@` **and** a case id renders in the UI.

### B3. Confirm a Sentry envelope actually arrives (needs a real error)
Currently Sentry is **armed and unblocked, not observed delivering**. To close it honestly, either wait for a genuine production error and confirm it appears in the Sentry issue stream, or have the owner trigger one deliberately on a throwaway route. **Do not force an error against production without the owner's say-so.** Once an envelope is seen, update the "NOT yet observed" sentence in `docs/release/truth-index.md` (§Production ops update).

### B4. Decide the `next-env.d.ts` question (§D2) — 10 min decision, then a small PR
Pick one of the three options in the TODOS entry and implement it. It dirties the tree on every `npm run dev` **and** every Playwright run today.

### B5. Re-baseline analytics expectations (no code)
Tell whoever reads the funnel numbers that **umami has no history before 2026-07-22**. See §C1 — this is a data-interpretation action, not an engineering one.

---

## C. Consequences worth surfacing (not bugs — decisions/context)

1. **There is NO umami analytics history before 2026-07-22.** Every `track()` call was CSP-refused for as long as umami cloud has been configured. Any funnel figure quoted to date is **missing, not zero** — `onboarding_started`, which `app/(app)/onboarding/page.tsx` calls the denominator without which onboarding drop-off "was not computable at all", has no data at all. If a past decision rested on "the funnel looks flat," it was reading a blackout. **Re-baseline from 2026-07-22 forward; do not compare across that date.**
2. **`docs/adr/analytics-umami.md` describes a self-hosted Railway install** that production does not use (it points at umami cloud). `env-reference.md` is corrected; the ADR is not. Tracked in TODOS.
3. **Sentry:** armed, initialising, CSP-unblocked — envelope delivery unproven. Stated as such in truth-index; don't upgrade that claim without evidence.

## D. OWNER-BLOCKED / OUT OF SCOPE (unchanged)

1. `/api/health` crons `nudge` / `trialPrecharge` / `pantrySweep` / `stripeReconcile` still **STALE** — only `bai-weekly` is in `vercel.json`. Flagged across several handoffs; still open. Confirmed still stale at end of this session.
2. Master-prompt ledger: everything else ✅. Stripe webhook + Sentry DSN are now ✅ except the two owner round-trips in §B1/§B2.

## E. Operational facts (read before touching anything)

1. **gstack lives at `~/.claude/skills/igstack/`** on this machine (NOT `~/.claude/skills/gstack/`). Learnings binary rejects `type: "investigation"` — only the 6 documented types (`pattern`/`pitfall`/`preference`/`architecture`/`tool`/`operational`) are accepted; it exits 1 **silently**.
2. **Never run `npm run build` or `npm run typecheck` while Playwright's dev servers are up.** `typecheck` is `rm -rf .next/dev/types .next/types && tsc --noEmit` — it deletes state the running servers rely on. Kill with the bracket trick `pkill -f "next de[v]"` (plain `pkill -f "next dev"` matches its own command line and kills your shell, exit 144).
3. **This dev box compiles ~10× slower than the CI runner** (43–67s cold `/check` locally vs ~4s on CI). A local cold + 3-project run is therefore **harsher than CI and does NOT discriminate branch from main** — both fail. Use warm-vs-cold as the diagnostic axis, not branch-vs-main-under-cold.
4. **The local network drops connections intermittently** (`net::ERR_NETWORK_CHANGED`). It killed a stylesheet fetch and produced a screenshot of a completely **unstyled** production page — which looked like a catastrophic regression and was not. Per the standing rule: *if a page probe returns nonsense (0 stylesheets, empty head), the tab is a corpse.* Re-probe before believing anything. Always retry live checks 3–5× and assert on a health signal (`document.styleSheets.length > 0`, `rules > 50`) before trusting a reading.
5. **GitHub purges job logs once a run is re-run.** Grab `gh run view <id> --log --job <jobid>` **before** `gh run rerun`. Learned the hard way.
6. **Vercel:** preview deployments are behind SSO — anonymous `curl` gets a 302, so preview CSP can't be checked from the shell; verify on production after merge. `vercel env pull` decrypts values as **empty**, including `NEXT_PUBLIC_*`. `vercel ls` can take >2 min; prefer `gh api repos/tkiros/Revora/deployments` + `/statuses` to get a deployment URL.
7. **The repo root cannot `git checkout main`** — `main` is checked out at `.claude/worktrees/counsel-gate-candidate`. Branch from `origin/main` instead (`git checkout -b X origin/main`). The root is currently on the merged `fix/umami-csp-ingest-origin`; that's harmless, just branch off `origin/main` for new work.
8. **Owner's uncommitted edits are in the tree and were deliberately left alone:** `docs/handoff/2026-07-21-c7-shipped-pr24-deploy-and-residuals-handoff.md` (contains the pasted Sentry client DSN — public by design, but don't commit it casually) and `docs/retention_flow.md` (whitespace reflow). **Do not `git add -A`.**
9. **E2E flake discipline:** `retries: 1` exists for WebKit-under-parallel-load. The one remaining flaky is Mobile Safari on `trial-wall.spec.ts` first-run — fails once, passes on retry. The warm-up took that test from 3 hard failures to 1 retry-absorbed flake; further hardening is diminishing returns. Never pipe e2e to `tail`; write to a file and `echo EXIT=$?`.
10. **CI failures now preserve evidence** (html report + trace, uploaded by the existing `ci.yml` step). Read the trace before reproducing locally.

## F. Do NOT touch (unchanged)

HS-2/4/5 clinical banding · HSTS preload · CSP `report-uri` · `MEAL_MEMORY_*` / `LEARNING_JOURNEY_*` stay **OFF** (and saved-meals styling **gates** the MEAL_MEMORY flip — TODOS §Saved-meals) · pricing numbers · DA-NH-1 counsel · human-evidence validators · `REVORA_ENFORCE_COMPONENT_MENTION` stays OFF · BAI cron/table keep running (S2 measurement) · the Stripe webhook signing secret (do not rotate).

## G. Definition of done

| # | Item | Status |
|---|---|---|
| 1 | PR #25 CI green → merged → deployed | ✅ `dd9f6ba` |
| 2 | Post-deploy: font, Sentry CSP, titles, A1C skip, 308s, health | ✅ all verified live |
| 3 | truth-index Sentry line updated | ✅ PR #26 `b3cd311` |
| 4 | umami CSP blackout fixed + proven (200s from the gateway) | ✅ PR #27 `4b05844` |
| 5 | Stripe `charge.refunded` test event → 2xx | ⏳ **owner, §B1** |
| 6 | Support-case round-trip (email + case id) | ⏳ **owner, §B2** |
| 7 | Sentry envelope observed end to end | ⏳ **§B3** |
| 8 | `next-env.d.ts` decision | ⏳ **§B4** |
| 9 | Crons `nudge`/`trialPrecharge`/`pantrySweep`/`stripeReconcile` | ⏳ owner, §D1 (long-standing) |

**One prioritized next action:** §B1 — owner sends the Stripe `charge.refunded` test event and confirms 2xx. Items 5–7 are the only things standing between here and a fully closed C7 cycle, and none of them need a code change.
