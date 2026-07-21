# TODOS

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
