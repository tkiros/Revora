# Revora — What's Actually Built vs. The Plan vs. The Recommendation

**Date:** 2026-06-29 · **Reviewer:** code read of `app/`, `lib/revora/`, `components/` at commit d4eb073

## What the code actually is (verified)

A **stateless, anonymous, text-in, single-shot food-risk checker.**

- **Input:** a *typed* food description (`food: string`, max 160 chars) + a number (`a1c`). Confirmed in `lib/revora/schemas.ts`.
- **Flow:** `app/page.tsx` ("Should I eat this?") → `components/food-check-form.tsx` → `POST /api/check` → `lib/revora/service.ts:checkFood()` → one OpenAI call → one result.
- **Output:** one card — `risk` (SAFE/MODERATE/HIGH) + `reason` + `adjustment` + `swap` + `disclaimer`.
- **No photo/vision** — zero image/camera/upload code exists (grep clean).
- **No memory** — `app/privacy/page.tsx` states: *"no account or login, no database, no saved history of your checks."* Upstash Redis is used **only** for rate-limiting, not user data.
- **Engineering quality: high, but narrow.** `lib/revora/` is a heavily safety-hardened answer engine: A1C routing/out-of-scope, pre-model input classification, a safety contract, conservative bias, fail-closed retry, Sentry PII scrub, eval rubric. This core is solid and reusable.

## Three different products

| | What it is | Photo? | Memory of you? | Daily relationship? | Built? |
|---|---|---|---|---|---|
| **Built today** | One-shot text "should I eat this?" | No | No | No | ✅ (small MVP) |
| **Planned (PRD/brand)** | Photo scan → GL + reversal journey, BAI, streaks, history, CGM | Yes | Yes | Yes | ❌ mostly not built |
| **Recommended (coach)** | Daily "in your corner" relationship that remembers, notices patterns, encourages | optional | **Yes (required)** | **Yes (core)** | ❌ |

## The gap

- The built app is **smaller than both** the PRD dream and the coaching recommendation. It is neither the photo-scanner hero nor the coach — it's the thinnest useful slice: a careful one-shot Q&A.
- **The single wall to coaching:** the app has **no memory of the user** — by deliberate design ("no account, no database, no history"). A coach that forgets you every time cannot coach. Continuity is the prerequisite, and it's the one thing intentionally excluded.
- **Good news:** closing the gap is mostly **addition, not demolition.** The hard part — the safe, conservative "is this food okay" brain — already exists and stays. What's missing is a **stateful layer** on top: identity, saved history, a daily loop, and a progress view.

## What "coaching" requires architecturally (added on top of the existing engine)

1. **Lightweight identity** so it can remember a person.
2. **Persistence (a database)** for meals, A1C over time, patterns — the thing the app currently, deliberately, does not have.
3. **A daily loop** — check-ins, one small next action, gentle reminders.
4. **A progress view** — streaks, "your breakfasts are the problem," "you vs. last week."
5. **Keep** `lib/revora/` as the per-meal answer core.
6. *(Later, optional)* photo input, CGM correlation.

## Verdict on "can it be built on the current architecture?"

**Keep the engine; add a new layer.** The answer-engine is reusable and worth keeping. But coaching needs accounts + a database + stateful daily flows that the current app was explicitly built *without* (it's even sold as a privacy feature). That is a **major addition and a shift in the product's center of gravity** (from "one answer" to "ongoing relationship") — but a **low-to-medium-risk** one, because the hardest, safety-critical core does not need to be rewritten.

## Fair note
The current build is a clean, shippable, genuinely smart **first test** of one narrow question: *"do confused, stressed people value an instant, safe, judgment-free answer to 'should I eat this?'"* That directly serves the original problem (people miserable choosing food at the moment of decision). It is a good wedge — it just solves the *moment*, not the *relationship*, and won't retain users or justify a premium price on its own.
