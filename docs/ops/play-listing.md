# Revora — Google Play Store Listing Draft (P9)

> **Claims boundary applies with FULL force to this file.** This is the public
> store listing — the text below will be pasted into Play Console verbatim.
> `docs/ops/play-twa-runbook.md` §9.4 lists the banned families this copy must
> avoid.
>
> **This file IS automated-audited now** (W-09, 2026-07-11). It used not to be,
> and the gap cost us: §4 shipped a free-tier promise ("five a day, every day")
> that contradicted the code by a factor the store would have read as a false
> claim (F-07). `tests/unit/revora/claims-boundary-copy.test.ts` now scans every
> region of this file fenced by `<!-- claims-audit:start -->` /
> `<!-- claims-audit:end -->` — i.e. exactly the text that gets pasted into Play
> Console, and nothing else. The un-fenced prose (this header, the rationale
> notes, §5's "avoid" list, §7's explanation) discusses the banned words on
> purpose and is deliberately out of scope; the test asserts the fences are
> present and balanced, so the audit cannot be silently switched off by deleting
> them.
>
> **The free-tier number is not a free variable.** It is `TASTER_LIMIT` in
> `lib/client/taster-store.ts` — day-1 only, device-local. The audit pins the
> number written in §4 to that constant. If the code changes, this file fails
> the test until it is corrected.
>
> No calories anywhere. No "reverse" in any inflection — the former North-Star
> carve-out line is **Rejected** in `docs/safety/copy-ledger.md`
> (`onboarding-reversal-line`, removed from onboarding 2026-07-06, counsel Q8
> pending) and must not appear here. No predicted/future A1C. No GI/GL/
> carb-gram numbers. No "AI-powered" lead. No accuracy percentages. No FDA or
> medical-device implication. Revora is never the agent of an outcome — only
> the user is. Coach-first framing throughout: "should I eat this, now?", not
> a scan/diagnosis tool. Prediabetes-only (A1C 5.7–6.4% band). Calm,
> permission-first tone — matches `app/how-it-works/page.tsx` and
> `app/progress/page.tsx`, the two most compliance-sensitive shipped surfaces.
>
> Placeholders use the `<...>` convention used throughout `docs/ops/`. Fill
> before paste-in.

---

## 1. App title (≤30 characters)

<!-- claims-audit:start -->
**Revora — Prediabetes Coach**  *(26 characters)*
<!-- claims-audit:end -->

Rationale: "Coach" (not "Reversal" or "Scan") matches the shipped coach-first
positioning (`docs/product-marketing.md`) and stays outside the `reverse`
family entirely.

## 2. Short description (≤80 characters)

<!-- claims-audit:start -->
**Should I eat this, now? A calm daily coach for prediabetes-range A1C.**
<!-- claims-audit:end -->
*(69 characters)*

## 3. Category

**Health & Fitness.**

## 4. Full description (≤4000 characters)

<!-- claims-audit:start -->
> Should I eat this, now?
>
> That's the question Revora answers — for the one moment it actually
> matters: right before you eat. Enter what you're about to have (type it or
> say it), and Revora gives you a calm, clear read in seconds: **Clear**, **Be
> careful**, or **Hold off** — plus, when there's one, a simple adjustment, a
> swap that fits your kitchen, and the order to eat things in. Coach-first,
> always: Revora tells you what to do with *this* meal, not a running tally
> of what you ate.
>
> **Built for one specific moment in one specific range**
> Revora is for people whose A1C falls in the prediabetes range (5.7–6.4%) —
> not general wellness, not diabetes management. Enter your A1C once; every
> check after that is calibrated to your range. Outside that range, Revora
> says so plainly and points you back to your clinician instead of guessing.
>
> **What a check gives you**
> - A clear, plain-language read: Clear / Be careful / Hold off
> - A short reason in plain English — never a raw number
> - A swap, when one helps, that works with what you actually have
> - The order to eat things in, when it changes the outcome
> - One small next step after the meal, when there is one
>
> **Free to try — no account, no card**
> You get 10 free checks on your first day, with no sign-up and nothing to
> enter but the meal. They live on your device, and today's checks stay
> visible right on the home screen. After that, Premium opens with a 7-day
> free trial — nothing is charged until it ends, and we email you before it
> does.
>
> **Premium — for building the habit, not just the moment**
> - Unlimited daily checks
> - Your full check history, synced across devices
> - A weekly insight drawn from your own recent meals
> - A weekly progress view — how consistently you checked in and followed
>   through, never a prediction about a future lab result
> - One gentle daily reminder, entirely optional and easy to turn off
>
> **Honest about what this is and isn't**
> Revora is informational only. It makes no medical determinations and
> offers no clinical guidance of its own — every check simply reflects your
> own choices back to you in plain language, and it never predicts your next
> A1C. The weekly progress view measures your own check-in behavior — never
> a guess about your lab results. Your dietary choices are yours — Revora
> gives you the clarity to make them. Always talk with your
> doctor or a registered dietitian about your own care; Revora is not a
> substitute for either.
>
> **Your data, your call**
> Sign in with just an email — no password to lose. Your A1C and meal notes
> are encrypted at rest, and you can permanently delete your account and
> everything in it, in-app, at any time.
<!-- claims-audit:end -->

*(Draft length: well under the 4000-character Play limit — counted at
paste-in, since Markdown formatting characters above don't ship as typed.)*

**Free-tier note (F-07, 2026-07-11):** §4 previously read "**Free, every day** —
the check itself is free, five a day, no account required". Every clause of that
was wrong against the shipped code: the free tier is `TASTER_LIMIT` (=10) checks
on the **first day only**, held in device-local storage
(`lib/client/taster-store.ts`), not five a day forever. The "five" came from
`FREE_DAILY_CHECKS` in `lib/server/entitlement.ts`, which is the **legacy**
paywall path (`PAYWALL_MODE=legacy`) and is not what a store user would get.
Shipping the old text would have been a false claim in a public store listing.
The number above is now pinned to `TASTER_LIMIT` by the copy audit.

**Reversal-family note:** the former North-Star line ("Reversal is achieved
through your dietary choices…") is **Rejected** in `docs/safety/copy-ledger.md`
(`onboarding-reversal-line`) — removed from `app/onboarding/page.tsx` on
2026-07-06 (launch audit BUG-05), pending counsel Q8. Do not use any
"reverse/reversal/reversing" language in this listing unless that ledger row
is changed to Approved with counsel sign-off recorded.

## 5. Tags / keywords

<!-- claims-audit:start -->
`prediabetes` · `A1C` · `blood sugar` · `food coach` · `meal check` ·
`glucose-friendly eating` · `health coach` · `prediabetes diet`
<!-- claims-audit:end -->

Avoid: `diagnosis`, `treatment`, `cure`, `AI`, `scan` (implies a photo feature
Revora doesn't ship), `CGM`, `glycemic index`/`GI`/`GL` (numeric claim risk).

Also dropped, 2026-07-11: `diabetes prevention program`. Keywords are pasted
into Play Console as public store text, so they are claim surface, not just a
lookup hint — and §7 below commits this listing to avoiding the Banned Claim
Families *vocabulary itself*, not merely its affirmative sense. A health app
whose store keywords include "prevention" is asserting the thing the rest of
this listing carefully does not. `prediabetes diet` carries the same search
intent with none of the exposure. (The keyword list is inside the audit fence,
so this can't creep back in unnoticed.)

## 6. Content rating questionnaire — answers

- **Target age:** 18+ (adults only — matches
  `docs/handoff/human-actions-required.md` §0 "Approve app name/icon/brand as
  final" and the plan's pre-decided default audience).
- **Category:** Health & Fitness / informational reference tool.
- **Medical claims:** None declared. Revora makes no medical determinations
  and offers no clinical care of its own; it does not provide medical
  advice.
- **User-generated content:** None (no public posts, no social features).
- **Data collection:** Yes — see §8 (Data Safety cross-reference) below.

## 7. Health-apps declaration text

<!-- claims-audit:start -->
> Revora is an informational wellness tool for people with a prediabetes-
> range A1C (5.7–6.4%), self-reported by the user. It offers plain-language,
> non-numeric guidance about individual meals and tracks the user's own
> check-in behavior. Revora makes no medical determinations, offers no
> clinical care of its own, and never forecasts future lab results; it is
> not a substitute for professional medical advice. Every result and every
> progress view carries an in-app reminder to consult a doctor or registered
> dietitian.
<!-- claims-audit:end -->

Deliberately avoids the Banned Claim Families vocabulary itself (reverse/
cure/treat/prevent/diagnose/FDA/guarantee/future-prediction —
`docs/safety/claims-boundary.md`), not just their affirmative sense. The
in-app contract disclaimer and prompt text negate those words directly
("does not diagnose, treat, prevent, cure, or reverse") because
`claims-boundary-copy.test.ts` excludes prompt-internal snippets from its
scan; this listing text has no such exclusion once pasted into Play
Console, so it uses different words entirely rather than relying on
negation to survive a naive word-boundary scan.

## 8. Data Safety form

**Do not duplicate the mapping here.** The authoritative Data Safety
question-by-question answers live in `docs/ops/play-twa-runbook.md` §9.2 —
fill the Play Console Data Safety form directly from that table (it is kept
in lockstep with `/privacy` and `docs/privacy/data-flow.md` by the project's
"lockstep rule"). If the two ever disagree, §9.2 of the runbook is the one to
trust and this listing should be corrected to match, not the other way
around.

## 9. Screenshots shot-list

Capture every screenshot **signed in as the seeded reviewer account**
(`reviewer@revora.test`, `scripts/seed-reviewer-account.mjs`) so no real
user's PII, food history, or A1C ever appears in a store asset. Use a clean
device frame; no debug banners, no `COUNSEL-DRAFT` badges visible if
avoidable (acceptable if unavoidable pre-counsel-signoff, but prefer to
re-shoot after sign-off lands).

| # | Screen | State to capture | Notes |
|---|--------|-------------------|-------|
| 1 | `/` (home, food-check form) | Empty state, ready to type/say a meal | Leads with "Should I eat this?" — the core loop |
| 2 | `/` result card | A **Clear** (SAFE) result with a sequencing tip | Shows the plain-language verdict, not a number |
| 3 | `/` result card | A **Be careful** (MODERATE) result with a swap suggestion | Shows the swap feature |
| 4 | `/` today view | 2–3 checks logged today | Shows the free daily-check experience |
| 5 | `/history` | A short history list (reviewer's seeded data only) | Premium feature — full history |
| 6 | `/progress` | A populated BAI band view (e.g. "Building" or "On track") | Premium — behavioral progress, not a lab prediction |
| 7 | `/how-it-works` | Top of page | Shows the transparency/evidence section, builds trust with reviewers |
| 8 | `/subscribe` | Paywall card with both SKUs visible | Shows pricing transparently |

Feature graphic: reuse the brand mark (`public/icon-512.png`) per
`docs/ops/play-twa-runbook.md` §9.4 item 1 — no new asset generation needed
beyond composing it into the 1024×500 feature-graphic template.

## 10. App access instructions (Play reviewer login)

Play Console's "App access" form needs a working reviewer login. Enter:

- **Login method:** email magic-link via the "Reviewer access" disclosure at
  the bottom of `/signin` (only rendered when `NEXT_PUBLIC_REVIEWER_MODE=1`,
  which is set on the **preview** environment used for review — see
  `docs/ops/env-reference.md`).
- **Email:** `reviewer@revora.test`
- **Access code / secret:** `<REVIEWER_TEST_SECRET value — human enters from the Vercel preview env>`
- **One-line reviewer note (paste verbatim into the Play Console notes
  field):** "Tap 'Reviewer access' at the bottom of the sign-in page, enter
  the email and code above, and you'll be signed in as a fully-onboarded
  Premium test account — no real purchase needed to review Premium
  screens."

This path is preview-only by design (`app/api/auth/reviewer-signin/route.ts`
hard-404s whenever `VERCEL_ENV=production`) — it is not present on the public
production build reviewers would otherwise install from the store listing
itself; it exists solely so the Play reviewer can reach gated screens during
review. See `docs/ops/device-qa-checklist.md` §13 for the corresponding
"absent on production" verification.

## 11. Data-deletion URL declaration

`https://<domain>/account/delete`

## 12. Privacy policy URL

`https://<domain>/privacy`

## 13. Terms of Service URL

`https://<domain>/terms`

> Note: `/terms` is currently a `COUNSEL-DRAFT` (see
> `docs/legal/counsel-brief.md` Q10) with two bracketed placeholders
> (operating-entity name, governing-law/venue). Do not submit for Play review
> until counsel sign-off lands and the placeholders are resolved.

---

**Everything above is a draft awaiting:** final domain (`<domain>`
throughout), `REVIEWER_TEST_SECRET` value, counsel sign-off on `/terms` and
the claims audit (Q1–Q10, `docs/legal/counsel-brief.md`), and a human
paste-in + review pass against the live Play Console form (form fields and
character limits drift over time — reverify against the current Play
Console UI before submitting).
