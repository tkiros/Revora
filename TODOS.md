# TODOS

## Delete the zombie Vercel project `revora-irj3` (owner, 1 min)
- **What:** a second Vercel project on the same repo, no custom domain (only `*.vercel.app` aliases; `revora.plus` lives on the `revora` project). Its production build has failed on EVERY merge to main since ~Jul 17 — it has no measurement env vars, so `next.config.ts`'s deliberate dark-launch gate kills the build in ~7s ("Production build without measurement…") and Vercel emails the owner an error each time. It also double-builds every PR preview.
- **Fix:** `vercel project rm revora-irj3` (or dashboard → project → Settings → Delete). Destructive, so owner's call; the alternative (`REVORA_ALLOW_NO_MEASUREMENT=1` on irj3) silences the emails but keeps paying the double-build tax for a project nothing uses.
- **Why it matters:** an error email on every merge trains the owner to ignore deploy failures — the day the REAL project fails, the notification looks like the usual noise.

## Umami: historical funnel data is missing, and the ADR describes the wrong install
- **What:** the CSP blackout itself is FIXED (`connect-src` now carries umami cloud's `gateway.umami.is` ingest origin; `next.config.ts` + `tests/unit/server/csp-umami.test.ts`). Two residuals: (1) every `track()` call before 2026-07-22 was CSP-refused, so there is NO client analytics history — any funnel figure quoted from umami to date is *missing*, not zero, and `onboarding_started` (the activation denominator) has no data at all; (2) `docs/adr/analytics-umami.md` describes a self-hosted Railway install, but production actually points at umami cloud — the ADR and reality disagree.
- **Why it matters:** decisions keyed on "the funnel looks flat" may have been reading a blackout. Re-baseline from the fix date rather than comparing across it.
- **Depends on / blocked by:** nothing; just needs the ADR reconciled and any funnel analysis re-dated.

## Design-system drift residuals (post-C7 /design-review, 2026-07-21)
- **What:** Structural findings from the post-deploy audit (Codex + Claude source passes, converging), each needing a design decision (amend DESIGN.md or change code), not a mechanical fix: (1) /meals still owns a LEGACY week strip (`.week-strip`, checked/unchecked dots, no verdict icons) while the compliant `<WeekStrip>` ships on /journey — two visual languages for the same data, and /check's "See your week" routes to /meals; delete the legacy strip, reuse the component, fix the routing; (2) three of four surfaces wrap in `.app-content--narrow` (640px, self-scoped to "prose/legal pages") so the §App shell 1000/1120px table describes only Home — decide which is truth; (3) /journey's "one document" nests shadowed cards in cards; /meals stacks five sibling cards; (4) spacing/radius/type drift across the shell: off-scale paddings (16/17/18/22/24), radii (6/8/9/22/40), font sizes (11/14.5/15.5/26), icon sizes bypassing --icon tokens, weight 800 on dash-greet-date; (5) off-token colors: #a9d2cb/#cfe4e0 invented for the Home hero (the ONE Committed moment — add tokens or use --accent-contrast), orange #f97316/#fff7ed error pair reads as a 4th verdict color, --moderate-* hexes pasted literally on .chip-uncertain; (6) /meals has zero aria-live across four async swaps; (7) `.check-hero` hides the orientation/boundary copy at ≤430px — DESIGN.md's own design width.
- **Why:** CONFIRMED against source 2026-07-21; deferred because each either re-litigates a shipped C7 decision or needs DESIGN.md amended first. The mechanical siblings (44px targets ×2, dead --text token, skip-link motion, heading order, Home h1, footer Home target, /meals + /journey tab titles, dead .app-topbar-account CSS) were fixed on `fix/design-review-post-c7`. Refuted from the audit: the tab bar's accent Check puck is NOT an icon-in-circle violation — §App shell explicitly sanctions "Check (the one accent-filled action)".
- **Depends on / blocked by:** a DESIGN.md decision per item; pair with the next /design-review round.

## Saved-meals section must be styled before MEAL_MEMORY flips on
- **What:** `components/saved-meals-section.tsx` references 13 CSS classes with ZERO definitions (memory-list, memory-item, risk-chip, field-label--inline, …) — the whole block renders as browser-default markup, and the unstyled `risk-chip` means SAFE/MODERATE/HIGH badges render as plain text, losing the mandated verdict treatment. Also: the `★` favorite marker is a hardcoded glyph on a bare span (not in components/icons.tsx per §Icons; aria-label on a span is unreliable in AT).
- **Why:** Post-C7 /design-review source pass 2026-07-21. Invisible today ONLY because `MEAL_MEMORY_*` flags are OFF in prod; the moment the flag flips this ships a broken-looking section with lost verdict semantics. Style it (reuse recheck-button/chip vocabulary), move ★ into icons.tsx, THEN flip.
- **Depends on / blocked by:** blocks the MEAL_MEMORY flag flip; nothing blocks doing it now.

## PlanBox can render without a billing date
- **What:** `lib/server/plan-box.ts` meta fallbacks ("Active", "Trial active", "Will not renew") can render a plan box with no date; DESIGN.md §App shell bans hiding the renewal/trial date from any rendered plan box. Guarantee a date in every meta branch or amend the rule for the no-date data states.
- **Why:** Codex source pass, post-C7 /design-review 2026-07-21. Needs billing-data plumbing (period-end read in every branch), not CSS.
- **Depends on / blocked by:** none — small, next billing touch.

## Post-hoc "I did it" affordance on the Today card
- **What:** Let a user mark a non-SAFE check's suggested step done AFTER leaving the result card — an `action-done-button` on Home's Today card rows (and/or /meals today rows). Guest: `historyStore.markActionDone(clientId)`; signed-in: existing fire-and-forget `POST /api/history/action` (both write paths already exist — result-card/food-check-form use them today).
- **Why:** C7 ship red-team (2026-07-21): Home's middle next-action branch originally said "Mark what you did" → /meals, but no post-check surface renders the mark control — a dead-end CTA. Shipped reworded ("Today's check suggested a step — did it happen?"); the real fix is the affordance, which also un-skews the recap's follow-through count for users who close the result card early.
- **Pros:** Both write paths exist and are tested; restores the plan's stronger "Mark what you did" line.
- **Cons:** TodayList is deliberately presentational and DashboardView is server-rendered — needs a small client wrapper; new surface = design-review pass (DESIGN.md §Progress surfaces posture).
- **Depends on / blocked by:** none — pair with a /design-review of the Today card.

## Support rate-limit keying: per-user instead of (or alongside) per-IP
- **What:** Key the `/api/support/case` limit on `session.userId` in the handler (the proxy runs pre-auth and can only see IP), and reconsider fail-closed vs fail-open for this specific door.
- **Why:** C7 ship adversarial review (2026-07-21): the current `support_ip` bucket is too loose against an authenticated attacker rotating egress IPs and too tight for users behind CGNAT sharing one 5/24h budget — and this is the refund door, the worst surface to silently lock out (a user who can't request a refund in-app files a chargeback instead). Fail-closed also 503s during a rate-store outage before the row is written, cutting against the handler's row-first never-lose-a-case design.
- **Pros:** Correct identity for an authenticated door; NAT users stop sharing a budget.
- **Cons:** Handler-level limiting is a second limiter path to maintain; the IP bucket still has value pre-auth. `getClientIp` first-XFF-entry trust is a shared pre-existing concern across all buckets.
- **Context:** IP bucket shipped as the C7 plan's CHANGED item (proxy-level, fail-closed); the form shows a direct-email fallback on failure, so lockout is recoverable today.
- **Depends on / blocked by:** none — small, do with the admin viewer or next support touch.

## Rate-limit or bound /api/account/export
- **What:** Add a modest per-user or per-IP budget to GET `/api/account/export` (and consider it for the other export GETs).
- **Why:** C7 ship adversarial review: authenticated user can loop the endpoint — four queries + full decrypt + serialize per hit; the proxy currently ignores GETs entirely. Pre-existing (this branch only added the supportCases query + an index for it).
- **Pros:** Cheap DoS-hardening on the most expensive read path.
- **Cons:** Export is a legal-right door (GDPR-ish posture) — limits must stay generous and the error must say "try again in a minute", never dead-end.
- **Depends on / blocked by:** none.

## Pre-existing HIGH coverage gaps (outside C7 scope)
- **What:** (1) `components/client-error-reporting.tsx` — untested `beforeSend` scrubber and it omits `defaultIntegrations: false` (Breadcrumbs/HttpContext stay ON — the exact health-data leak `instrumentation-client.ts` forbids; possible double-init); (2) `app/api/profile/route.ts` PATCH — sole writer of nudge-cadence/quiet-hours columns, zero tests; (3) `components/paywall-card.tsx` `restorePurchases()` — paid-recovery flow untested beyond its input gate.
- **Why:** C7 ship coverage audit (2026-07-21, 76% aggregate) flagged these as the only HIGH gaps; none of the three files is touched by the C7 branch, so fixing them there would have been scope creep. #1 is also a possible privacy bug, not just a test gap — inspect before writing tests.
- **Context:** `~/.gstack` ship coverage diagram, PR for `feat/c7-four-jobs-and-audit-residuals`.
- **Depends on / blocked by:** none — #1 first, it is the only one that might be leaking today.

## Admin support-case viewer
- **What:** `/admin/support` page listing `support_cases` (decrypt message, mark resolved), patterned on `components/admin-feedback-table.tsx` + its `reviewStatus` workflow.
- **Why:** P0.4 ships inbox-only triage (encrypted row + full-content email to support@); that stops scaling once ticket volume grows. The `status` column already exists for this.
- **Pros:** Existing admin pattern to copy; closes the loop on case status.
- **Cons:** Admin surface + decrypt path = security-review burden; pointless below ~5 tickets/week.
- **Context:** Decided during /plan-eng-review 2026-07-21 (C7 four-jobs plan, D5). Trigger condition: sustained ticket volume, not speculation.
- **Depends on / blocked by:** P0.4 shipped (C7 branch).

## Retire or re-purpose the BAI composite score
- **What:** Decide to drop the composite score/band from `lib/coach/bai.ts` + `bai_weekly` (KEEP the raw adherence/action/prompted fields — the /journey recap uses them), or formally re-purpose the score as internal-only S2 measurement.
- **Why:** After RV-3 (2026-07-21) the score is computed weekly but shown to no one. Computed-but-invisible scores invite accidental re-surfacing; the in-tree retirement note (`lib/server/bai-cron.ts:10-17`, T18) predates RV-3 and is stale.
- **Pros:** Prevents the usage-frequency score from quietly coming back; removes dead compute.
- **Cons:** Touches the S2 concierge-study measurement plan — needs the owner and the study protocol in the room.
- **Context:** Decided during /plan-eng-review 2026-07-21 (C7 plan, D6). RV-3's fix was presentation-level (non-scored recap); the pipeline was deliberately left running for S2 measurement.
- **Depends on / blocked by:** RV-3 shipped (C7 branch); S2 study decisions.

## In-app photo-assist for subscribers
- **What:** Reuse the Pantry Review pipeline's vision-extraction module + confirm-before-verdict screen inside the daily check flow (`checks.inputMethod = 'photo'` finally gets written).
- **Why:** Turns the one-off report build into the app's flagship retention feature; the confirm-screen pattern is already buyer-tested by then.
- **Pros:** Extraction module, eval fixtures, and confirm UI all exist after the pipeline ships; strongest possible reuse.
- **Cons:** Touches the safety-evaluated daily flow; needs its own QA round and eval extension before subscribers see it.
- **Context:** Decided during /iplan-eng-review 2026-07-04 (Pantry Review pipeline). Engine today is text+A1C only (`lib/revora/`); vision enters the codebase via the pipeline as an extractor that never judges. Start by lifting `lib/pantry/` extraction + `app/pantry/` confirm screen into the check flow behind a flag.
- **Depends on / blocked by:** Pipeline shipped; edit-rate data from first ~10 paid orders (the real extraction-quality metric).

## Billing module multi-product shape
- **What:** Refactor billing so subscriptions and one-time products are first-class; portal handler stops assuming first-subscription-row-per-user (`app/api/billing/handlers.ts:286`).
- **Why:** Pantry Review is product #2 wedged in via separate tables; product #3 will hurt without a real shape.
- **Pros:** Prevents entitlement bugs as SKUs multiply.
- **Cons:** Touches revenue code; zero user-visible value until a third SKU exists.
- **Context:** Codex outside-voice finding #17 during /iplan-eng-review 2026-07-04. Mitigated for now by keeping `pantry_orders` fully separate from `subscriptions` + a portal-handler regression test.
- **Depends on / blocked by:** A third SKU actually existing. Do not do speculatively.

## TWA .aab rebuild with dashboard startUrl
- **What:** Rebuild and publish the TWA `.aab` with `startUrl` pointing at the dashboard (currently `/check` in `twa-manifest.json`).
- **Why:** TWA startUrl is compiled into the Android app; until rebuilt, Play installs open on `/check` while PWA/web users get the dashboard.
- **Pros:** Consistent entry across install types; one `bubblewrap build` away.
- **Cons:** Play release ceremony (signing key, version bump); pointless before M1 ships.
- **Context:** Decided during /iplan-eng-review 2026-07-10 (dashboard start-URL change, design doc amendment #6). `/check` stays a working page, so interim state is inconsistency, not breakage. PWA identity pinned via `"id": "/check"` in manifest.webmanifest in the same M1 commit.
- **Depends on / blocked by:** Dashboard M1 shipped to production.

## Daily Letter dashboard evolution (Approach C)
- **What:** Generated prose "note about your week" (lab-letter style) as the dashboard's v2 presentation — worst-verdict dot strip embedded in a permission-first letter instead of (or above) widget cards.
- **Why:** Deeply on-brand ("document-not-dashboard" per DESIGN.md); emotionally stronger for anxious users; differentiated screenshots for marketing.
- **Pros:** Rides M1's data layer unchanged; pure presentation + copy-generation layer.
- **Cons:** LLM-generated copy near health claims needs its own eval suite extension; engine is text+A1C only today.
- **Context:** Explored as Approach C in the 2026-07-10 dashboard design doc (`~/.gstack/projects/Revora/tefera-feat-video-engine-renderer-design-20260710-020331.md`), deliberately deferred. Prerequisite signal: daypart/repeat_meal insights consistently landing well with real users (day-3 observation assignment).
- **Depends on / blocked by:** M1 shipped; real-user insight feedback; eval coverage for generated reassurance copy.
