# Private sharing — demand validation and design gates (Phase 5)

**Status: PENDING HUMAN EXECUTION** (product research + privacy + counsel).
Nothing in this document is a claim, a shipped feature, or an approval. It is a
human-run protocol. No sharing feature is built, and no real health data is sent,
until the validation below passes and the named reviewers sign off.

**Source of authority:** this document operationalizes §P5.1 (validate sharing
demand first) and §P5.2 (private sharing design) of
`docs/handoff/2026-07-18-revora-100-value-95-retention-validation-and-implementation-plan.md`.
The threat-model prerequisites are drawn verbatim-faithfully from §12.6 of the
same plan. Where this document quotes design constraints, it does not soften or
extend them; if any passage here conflicts with the plan, the plan governs.

**Not a clinical document.** No artifact discussed here is a clinical report,
diagnosis, or medical record. Any shared artifact is user history — the user's own
logged checks and memory — and must say so in plain language. This document makes
no clinical claim of any kind.

---

## 0. Why this exists — the premise we are testing, not assuming

The forensic report's Q4 finding is **confirmed** in the plan (§15,
"Public sharing/referral → Not a priority"; report-mapping row "Q4: current
virality is content-only → Confirmed"): **current virality is content-only. There
is no referral or share loop in the product today.**

Two things follow, and both are load-bearing:

1. **We do not assume sharing equals virality** (§P5.1). A user wanting to show one
   result to their spouse once is not evidence of a growth loop. Demand for private
   sharing and existence of a viral loop are different claims with different
   evidence bars. This protocol validates the first and says nothing about the
   second.
2. **We validate demand before we build.** We interview real users and prototype
   *without sending real health data*. We do not ship a sharing surface to "see if
   people use it," because shipping a health-data egress path is itself the risk we
   are trying to gate.

Public share cards and referral codes are explicitly **out of scope** for this
validation. Per §P5.2, they "are separate decisions. A generic referral may avoid
health-detail exposure, but it still needs abuse, attribution, and privacy review."
Those decisions get their own document and their own reviewers; they are not
unlocked by anything on this page. See §5 below.

---

## 1. Scope of the validation

**In scope:** whether real users have durable demand to privately share their own
Revora history/results with a specific person, and if so, exactly *what* they want
to share and *for how long*.

**Explicitly out of scope (separate decisions, separate reviews):**

- Public share cards (any artifact posted to or previewable on a public surface).
- Referral codes or invite loops of any kind.
- Anything that treats sharing as a growth mechanism.

**Method constraint (non-negotiable during validation):** prototypes are shown with
**synthetic / placeholder data only**. No real user's meal photos, A1C values,
memory, or check history leaves the app during validation. Interview probes may use
the participant's own history *on their own screen, in their own session*, but no
new egress path is created and nothing is transmitted to a third party.

---

## 2. Who we interview

Recruit across the four use contexts named in §P5.1 so we do not over-fit to one
relationship type:

1. **Spouse / partner** — sharing with someone in the same household.
2. **Caregiver** — an adult child, family member, or hired caregiver who helps
   manage day-to-day eating.
3. **Clinician** — a user who wants to show something to a doctor, RD, or
   diabetes educator. (Note: showing history to a clinician is a *history-display*
   use, not a clinical-report use. The interview must probe whether the user
   expects an authoritative document — and if they do, that is a
   **misexpectation to correct**, not demand to satisfy.)
4. **Personal record** — a user who wants their own copy/archive for themselves,
   with no recipient at all.

Target a small, deliberately mixed sample (proposal: **8–12 participants**, at least
2 per context, spanning the risk strata already used in the product's evaluation
work). This is qualitative demand discovery, not a powered study. Sample size and
composition are a **proposal for owner + product-research sign-off**, not a
precommitted statistic.

---

## 3. Interview guide

Semi-structured. Ask the participant to think about the last time they *actually*
wanted to share something, not a hypothetical. Do not lead. Do not pitch a feature.

1. **Past behavior.** In the last month, was there a moment you wanted to show
   someone something from an app like Revora — a meal result, your history, a
   pattern? Walk me through exactly what happened. (If "no," record that; absence of
   the impulse is data.)
2. **Recipient.** Who specifically would you share with, and why that person? Is it
   one person, or would it change week to week?
3. **Exact fields.** If you could share, what *exactly* would you want them to see —
   a single result, a week of history, your memory/patterns, a specific photo? What
   would you *not* want them to see? (§P5.1: "Ask what exact fields they want to
   share.")
4. **Duration.** For how long should they be able to see it — one viewing, a day, a
   week, until you turn it off? (§P5.1: "and for how long.") Would you want to take
   it back?
5. **Expectation of authority.** If you showed this to a doctor, what would you
   expect them to do with it? Do you think of it as *your record of what you ate* or
   as *a medical report about you*? (Probe for the misexpectation; the correct
   framing is user history, not a clinical report.)
6. **Failure feelings.** How would you feel if the person you shared with forwarded
   it, screenshotted it, or it showed up somewhere public? What would make you never
   use sharing again?
7. **Alternative today.** What do you do *right now* when you want to show someone —
   screenshot, tell them out loud, nothing? How well does that work? (If the
   screenshot already works fine, that is evidence *against* build.)
8. **Willingness to act.** If this existed today exactly as you described, would you
   set it up this week? For whom? (Stated intent is weak evidence; record it as
   stated intent, not behavior.)

Optional depth (ask when time allows):

9. **Revocation.** If you shared and then changed your mind, how quickly would you
   expect "turn it off" to actually work?
10. **Prototype reaction.** Show the synthetic-data prototype. Where did they expect
    to control who sees what? Where did the model of the feature break?

Record verbatim answers to Q3 and Q4 (exact fields, exact duration) — those two
answers are the design inputs and the go/no-go signal.

---

## 4. Decision rule — "validated" (PROPOSAL, owner sign-off required)

The following threshold is **precommitted before interviews start** and is written
here as a **proposal for owner + product-research + privacy sign-off**. It is not
self-executing; a human ratifies "validated / not validated" against it.

**Proposed threshold for "demand validated":**

- At least **6 of 8–12 participants** describe an *unprompted, specific past or
  imminent* sharing moment (not a hypothetical "sure, I guess"), **and**
- those participants converge on a **nameable field set and a bounded duration**
  (i.e., Q3/Q4 answers cluster into a designable default, rather than "everything,
  forever"), **and**
- **zero** participants require the artifact to function as an *authoritative
  clinical report* in a way we cannot correct with framing (if the core demand is
  "give my doctor an official medical document," that is **not validated** — it is a
  scope-of-practice and claims problem, escalate to counsel, do not build).

**If validated:** proceed to the §5 design constraints and §6 build-gates. Building
still requires privacy + counsel review; validation unlocks design, not shipping.

**If not validated (fewer than the threshold, or demand is "everything forever," or
the demand is really for a clinical report):** do **not** build private sharing.
Record the finding. The screenshot path may already be sufficient; say so. Revisit
only with new evidence. Do not treat "not validated" as a reason to build a
public/referral loop instead — that is a separate decision (§5) with its own bar.

**Anti-inference guard:** a validated *private-sharing* demand does **not** validate
virality, a referral loop, or public sharing. Do not carry this result forward into
a growth claim. (§P5.1: "Do not assume sharing equals virality.")

---

## 5. Public share cards and referral codes — separate decisions

Per §P5.2, verbatim-faithful: **"Public share cards and referral codes are separate
decisions. A generic referral may avoid health-detail exposure, but it still needs
abuse, attribution, and privacy review."**

Therefore:

- Nothing in §4 authorizes a public share card or a referral code.
- Any public/referral surface requires its **own** written decision reviewed for
  **abuse, attribution, and privacy** — three named review lenses — before it is
  designed, not after.
- A referral that carries *no* health detail is still not automatically approved; it
  still passes abuse + attribution + privacy review.

This document does not open that door; it names it and closes it here.

---

## 6. Design constraints (apply only IF validated) — verbatim-faithful from §P5.2

If and only if §4 returns "validated" and privacy + counsel sign off, the private
sharing design **must** satisfy every constraint below. These are drawn
verbatim-faithfully from §P5.2 of the plan; do not drop or soften any of them.

- **Explicit field selection** — the owner chooses exactly which fields are shared;
  nothing is shared by default.
- **Private recipient or unguessable scoped link** — sharing is to a named private
  recipient, or via a scoped link that is not guessable and not enumerable.
- **Expiration** — every share has an expiry.
- **Revocation** — the owner can revoke access, and revocation actually takes
  effect.
- **noindex and no social preview containing health content** — the artifact is not
  indexable and generates no link preview / social card that contains health
  content.
- **View log visible to the owner** — the owner can see who viewed the shared
  artifact and when.
- **No download by default** — downloading is not the default behavior.
- **Clear statement that the artifact is user history, not a clinical report** — the
  artifact itself states, in plain language, that it is the user's own history and
  **not** a clinical report.

Each constraint above is a hard acceptance criterion for the eventual build. A
design that omits any one of them is not approved.

---

## 7. Threat-model build-gates — verbatim-faithful from §12.6

§12.6 requires, before the feature is built:
**"Threat-model private-share token entropy, referrer leakage, screenshots/downloads,
revocation races, and cached pages before building the feature."**

Each of the five is a **build-gate** — a written, reviewed threat-model item that
must be resolved (or explicitly risk-accepted by the owner with privacy sign-off)
**before** any private-sharing code is merged:

1. **Token entropy** — scoped-link tokens have sufficient entropy to be
   non-guessable and non-enumerable; no sequential or low-entropy identifiers.
2. **Referrer leakage** — no health content or scoped token leaks via `Referer`
   headers, outbound links, or embedded third-party resources.
3. **Screenshots / downloads** — the design accounts for the fact that any recipient
   can screenshot; "no download by default" (§6) does not imply confidentiality
   after viewing, and the threat model states this honestly rather than promising
   what it cannot enforce.
4. **Revocation races** — revoking access is race-safe: a viewer loading the
   artifact at the moment of revocation cannot slip through; cached sessions do not
   outlive revocation.
5. **Cached pages** — shared artifacts are not retained by intermediary caches,
   CDNs, or browser history in a way that outlives expiration/revocation.

These gates compose with the broader §12.6 authorization requirements (a share path
is a new egress: prove one user cannot read, export, or share another user's data;
cover direct-object-reference attacks across every new ID). No private-sharing
feature ships until all five gates and the §6 constraints are met and privacy +
counsel have signed off.

---

## 8. Sign-off ledger (to be completed by humans)

| Reviewer / role | Question they answer | Decision | Date | Name |
|---|---|---|---|---|
| Product research | Is demand validated against §4 (threshold met, honestly, not led)? | | | |
| Owner | Do I ratify "validated / not validated"? Do I accept residual risk after §6/§7? | | | |
| Privacy | Do §6 constraints + §7 build-gates fully cover the data-egress risk? | | | |
| Counsel | Is "user history, not a clinical report" framing correct; any scope-of-practice concern from clinician-sharing? | | | |

No build begins until every row is signed. Validation unlocks design; it does not
unlock shipping.
