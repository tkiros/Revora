# Distribution prerequisites, channel gates, and the 14-day test protocol (Phase 5)

**Status: PENDING HUMAN EXECUTION.**
This is a human-run protocol, not a shipped growth plan and not an approval. No
channel test starts until every prerequisite gate below is green and every named
human has signed off. Nothing here is a marketing claim.

**Source of authority:** this document operationalizes §P5.3 (distribution
prerequisites), §P5.4 (channel tests), and the §15 recommendation-mapping
dispositions of
`docs/handoff/2026-07-18-revora-100-value-95-retention-validation-and-implementation-plan.md`.
Where it quotes channel rules and outcome branches, it is verbatim-faithful to the
plan; if any passage here conflicts with the plan, the plan governs. No claim in
this document is clinical.

**Ordering premise (§15, "Run Reddit test → Reordered"):** we do **not** run a
channel test first and fix the product later. First fix domain, measurement,
support, promoted fixtures, and claims; *then* run a falsifiable test. A channel
test on a broken base is not a test — it is an incident. (§16: "No distribution
scale while the public domain, support, measurement, billing, or promoted examples
are broken.")

---

## 1. Prerequisite gate checklist — ALL green before ANY channel test

Every row must be independently verified green and dated. A single red row blocks
all channel activity. Drawn from §P5.3.

| # | Gate | Green means | Verified (date / name) |
|---|---|---|---|
| 1 | **Domain** | Public domain resolves, valid TLS, two external probes passing (§13). | |
| 2 | **Check** | First-check path works end to end in production; promise fixtures reproduce. | |
| 3 | **Email** | Provider acceptance proven on non-suppressed seed recipients; inbox evidence captured (§13). | |
| 4 | **Analytics** | Events fire; zero unapproved sensitive/free-text fields; consent/notice/retention/deletion tests pass (§13). | |
| 5 | **Support** | Acknowledge within one business day; refund/processor path within published policy (§13). | |
| 6 | **Billing** | Entitlement 99.9% correct within 60s; no charged-without-access case open (§13). | |
| 7 | **Promoted examples LIVE-captured** | Every promoted example is generated from or checked against the **current deployment** — not a mockup, not a stale capture. 100% reproduce route and approved meaning (§13, §P5.3). | |
| 8 | **UTM + first-check attribution** | A tagged link produces a measurable, attributable first check; attribution verified end to end **before** spend (§P5.3). | |
| 9 | **Rollback / stop owner on call** | A named human can stop any test immediately and is reachable for the full test window (§P5.3). | |
| 10 | **Counsel-approved claims + platform content matrix** | Counsel has approved the exact claims, and a platform-by-platform content matrix (what may/may not be said where) exists (§P5.3). | |

**No test starts with any row red.** Re-verify gate 7 (promoted examples) against the
deployment on the day the test begins — a capture that was live last week is not
necessarily live today.

---

## 2. Recorded owner ratification of softened prohibitions (REQUIRED)

§P5.3 requires "a recorded owner decision [that] ratifies every channel disposition
where this plan softened a report prohibition (Instagram cold-start testing, TikTok
sponsored content)." §15 states each softening and the evidence it overrides. The
owner must sign the slots below **before** the relevant activity. These are not
pre-approved by this document; the document names the evidence and forces an
explicit human acknowledgement.

### 2.1 Instagram cold-start / discovery testing

- **Report prohibition (softened):** "Never use Instagram cold-start."
- **Plan disposition (§15):** "**Rejected as categorical:** verify eligibility and
  test exact content; do not rely on it. Because this softens an evidence-cited
  report prohibition (Meta Recommendations Guidelines excluding health-commercial
  content), a recorded owner ratification acknowledging that evidence is required
  before any Instagram discovery test."
- **Evidence the owner must acknowledge:** Meta Recommendations Guidelines exclude
  health-commercial content from recommendation surfaces. Instagram discovery is
  therefore not something to rely on; any test must verify current account
  eligibility and the exact content classification first.

  **Owner ratification (sign before any Instagram discovery test):**
  I acknowledge the Meta Recommendations Guidelines evidence above and accept an
  eligibility-verified, content-classified Instagram discovery **test** that does
  not rely on cold-start reach.
  Name: ____________________  Date: ____________  Signature: ____________________

### 2.2 TikTok sponsored / branded content

- **Report prohibition (softened):** "Never use TikTok creator partnerships."
- **Plan disposition (§15):** "**Changed:** no sponsored content until
  platform/counsel classification; organic founder content is separately testable.
  Because this softens the report's cut-not-gate prohibition (TikTok Branded Content
  Policy, April 2026, naming healthcare and weight-loss categories), a recorded
  owner ratification is required in addition to the platform/counsel classification
  before any sponsored content."
- **Evidence the owner must acknowledge:** TikTok Branded Content Policy (April
  2026) names healthcare and weight-loss categories. Sponsored/branded content is
  gated behind both platform and counsel classification **and** this ratification.
  Organic founder content is a separate, separately-testable track and does not
  require this slot.

  **Owner ratification (sign before any TikTok sponsored/branded content):**
  I acknowledge the TikTok Branded Content Policy (April 2026) evidence above and
  accept sponsored content only after platform + counsel classification is complete.
  Name: ____________________  Date: ____________  Signature: ____________________

If either slot is unsigned, the corresponding activity does not run. Organic,
disclosed founder content on either platform is governed by §3, not by these slots.

---

## 3. Channel rules — verbatim-faithful from §P5.4

Each channel below carries the plan's rule. Do not soften.

### 3.1 Reddit

Founder-disclosed, community-specific, value-first participation. **No mass posting,
fake accounts, backup-account ban evasion, or undisclosed promotion.** (§15: "Do not
use backup Reddit accounts → Accepted.") Participate as a disclosed founder in
specific communities, offering value first; a link is earned by the participation,
not spammed.

### 3.2 TikTok / Instagram

Separate **organic founder content** from **paid/branded content**. Verify current
account eligibility and the exact product/content classification **before spend**.
Before committing production budget to any single format, run a small **format
tournament** across the report's **five ranked content moments** (all live-captured
from the current deployment — see gate 7) with **precommitted per-format metrics**,
and **drop formats that miss**:

- **3-second retention at or above 75%**
- **save rate at or above 1.5%**
- **comment sentiment** (reviewed, not just counted)

A format that misses the retention or save threshold is dropped before any budget
scales behind it. Paid/branded content additionally requires the §2 ratification and
platform/counsel classification.

### 3.3 Facebook groups

Obey each group's rules. **Do not cold-DM health lead magnets.** (§15: "Do not
cold-DM Facebook health leads → Accepted pending exact group rules; value-first
public participation only.") Public, value-first participation only; no direct
messages pushing a health lead magnet.

### 3.4 Paid ads / third-party pixels

**No third-party pixels until the consumer-health-data review approves the exact
data flow.** (§15: "Do not add third-party pixels before privacy review → Accepted:
first-party minimization now; exact counsel/data-flow review before pixels." §16:
"No health data in third-party analytics, ad pixels, logs, error trackers, URLs,
notification previews, or social previews.") First-party minimization now; the exact
data flow is reviewed and approved before any pixel is added.

### 3.5 Pantry Review

**No expanded promotion until a written scope-of-practice and operational review
exists and an explicit product decision is recorded.** (§P5.4; §15: "Counsel review
of Pantry Review → Accepted: do not expand promotion until written scope/operations
decision.")

Additionally, record an **explicit product decision on Pantry Review's relationship
to Personal Meal Memory**. Choose one, deliberately and in writing:

- **(a)** surface purchased reports in the buyer's Meal Memory as **display-only
  records**, or
- **(b)** keep the current two-way silo **on purpose**.

Per §P5.4, "the silo must be a documented choice, not an accident preserved
silently." An unrecorded silo is a defect; a recorded choice is acceptable. Do not
expand Pantry Review promotion until both the scope/operations review and this
Pantry ↔ Meal Memory decision are written down.

---

## 4. The 14-day test protocol — THREE precommitted branches (verbatim-faithful, §P5.4)

Precommit all three outcome branches **before** the test starts, so the result stays
falsifiable. **30 attributed first checks in 14 days is a test threshold, not proof
of a path to 5,000.** Recompute the funnel only from measured impressions, visits,
starts, completions, registrations, and retained value events — never from assumed
rates.

1. **At least 30 attributed first checks, zero moderator actions:** proceed to the
   next growth gate.
2. **10–29 attributed first checks:** revise hook and format **once** and run **one
   more 14-day cycle**; **do not add channels.**
3. **Fewer than 10 attributed first checks and zero unprompted product questions:**
   stop spending founder time on the channel. Treat the result as a **message,
   product, or positioning** signal — **do not switch to a different channel until
   positioning is revisited.**

The three branches are recorded before day 1. The outcome is read against them
mechanically; branches are not renegotiated mid-test to protect a preferred
conclusion.

---

## 5. Growth gates 1–4 — verbatim-faithful (§P5.4)

Use explicit growth gates. Each gate validates only what it measures; passing gate N
does not grant gate N+1's claim.

1. The first **30 attributed checks** validate only **message/channel signal**.
2. The first **100 activated users** validate **first meaningful value, D7 behavior,
   safety reports, and support load.**
3. Growth into the **hundreds** requires a **passing D30 cohort and stable
   billing/operations.**
4. A deliberate push toward **5,000** requires a **passing D90 paid cohort, support
   capacity, acceptable unit economics, and no unresolved safety/privacy/billing
   incident.**

**Do not infer retention from traffic or activation.** (§P5.4.) Traffic is not
activation; activation is not retention; retention is not paid retention. Each is a
separately measured claim. Any safety, privacy, billing, or public-availability miss
blocks broad distribution regardless of aggregate score (§13).

---

## 6. Sign-off ledger (to be completed by humans)

| Reviewer / role | Question they answer | Decision | Date | Name |
|---|---|---|---|---|
| Engineering / ops | Are gates 1–9 green and re-verified on test day? | | | |
| Counsel | Are claims approved and is the platform content matrix (gate 10) complete? | | | |
| Owner | Are the §2 ratification slots signed where applicable? Am I the reachable stop owner? | | | |
| Privacy | Is first-party minimization in place and are third-party pixels blocked pending data-flow review (§3.4)? | | | |
| Product | Is the Pantry ↔ Meal Memory decision (§3.5) recorded as a deliberate choice? | | | |

No channel test begins until every applicable row is signed. Prerequisites unlock a
falsifiable test; a test does not unlock scale.
