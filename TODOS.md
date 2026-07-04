# TODOS

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
