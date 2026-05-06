# Phase 5: Community Launch and Founder Review Loop - Research

**Researched:** 2026-05-06
**Domain:** Trust-sensitive community launch, privacy-minimal demand measurement, founder safety review, and scanner-next validation gates
**Confidence:** MEDIUM

## User Constraints

No Phase 5 `CONTEXT.md` exists. Research is therefore constrained by `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/PROJECT.md`, and the Phase 4 privacy/ops research and plans.

### Locked Decisions

- Revora stays a text-only, no-login, prediabetes-only Permission MVP.
- Scanner, native mobile, authentication, saved history, and payments remain deferred unless Phase 5 launch evidence clears the expansion gate.
- Phase 5 depends on Phase 4. Do not weaken the Phase 4 privacy boundary: no default storage of raw food descriptions, raw A1C values, account-linked health data, prompt text, or full model output.
- Phase 5 must produce an evidence-aware, non-promotional launch artifact for `r/prediabetes` or an equivalent community channel.
- The founder must be able to track first-week query volume, organic shares, paid-version asks, and direct willingness-to-pay conversation outcomes.
- The founder must manually review the first 50 production results and spot-check at least 5 results per day for the first two weeks after launch.
- Real safety incidents must feed back into evals and rollback/kill-switch decisions.
- Scanner-next is gated by `3 of 5` direct WTP yeses at `$5/month` or `10+` organic shares within two weeks.

### Claude's Discretion

- Choose the smallest measurement architecture that can prove demand without collecting raw health-adjacent inputs.
- Define the community-launch approval workflow and fallback path if `r/prediabetes` moderators reject the post.
- Define how first-50 review can happen without turning Revora into a raw production-log collection system.
- Define validation files, tests, and manual evidence requirements that the planner can convert into two executable plans.

### Deferred Ideas (Out of Scope)

- Scanner implementation, native apps, auth, saved history, payments, Stripe links, user profiles, rich analytics, session replay, CRM automation, broad community growth automation, or any workflow that stores identifiable health data before explicit product expansion.

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GUARD-07 | Founder manually reviews the first 50 production results and spot-checks at least 5 results per day for the first two weeks after launch. | Use redacted review records, a founder checklist, daily sampling schedule, severity rubric, and incident-to-eval/rollback path. |
| VALID-01 | Founder can post a non-promotional, evidence-aware Revora link in `r/prediabetes` or an equivalent community channel. | Current `r/prediabetes` rules prohibit promotional content, direct medical advice, misinformation, and personal-information sharing; launch must be modmail-approved or moved to an equivalent channel. |
| VALID-02 | Founder can track whether the MVP receives at least 50 queries in the first week. | Use privacy-minimal aggregate counters by day/week; do not rely on Vercel runtime logs alone because retention can be as low as 1 hour on Hobby. |
| VALID-03 | Founder can track whether at least 5 people share the MVP with another prediabetic. | Track verified organic shares manually and keep share-intent clicks as a separate secondary metric. |
| VALID-04 | Founder can track whether at least 3 people ask if there is a paid version. | Use a redacted founder demand ledger with date, channel, signal type, and non-identifying evidence notes. |
| VALID-05 | Founder can run 5 direct WTP conversations asking whether engaged users would pay $5 for a month of the product. | Use a scripted WTP conversation workflow and capture only yes/no/maybe plus non-identifying rationale. |
| VALID-06 | The MVP has a documented scanner-next gate: 3 of 5 direct WTP yeses or 10+ organic shares within two weeks. | Implement a deterministic gate evaluator and a signed decision record that keeps scanner/native/auth/history/payments deferred unless the gate is met. |

</phase_requirements>

## Summary

Phase 5 should be planned as a launch-learning and safety-operations phase, not a growth phase. The current `r/prediabetes` rules are a hard constraint: the community disallows promotional material, direct medical advice, misinformation, personal-information sharing, and uncredible scientific claims. A founder post linking Revora is therefore not safe to plan as a normal "launch post." The standard path is: capture the current rules, write a non-promotional draft with clear founder affiliation and evidence boundaries, ask moderators via modmail, and post only if approved. If approval is denied or ignored, the requirement already allows an equivalent community channel.

Demand measurement must be more durable than Vercel runtime logs and more private than raw analytics. Vercel logs can retain only 1 hour of runtime logs on Hobby and 1 day on Pro, so weekly query volume should use aggregate-only counters keyed by day/week. The standard stack is a small Upstash Redis aggregate counter for query completions plus optional Vercel Web Analytics for anonymous pageviews/referrers. Organic shares, paid-version asks, and WTP outcomes are better captured in a founder-controlled redacted demand ledger because those signals happen in comments, DMs, and conversations rather than inside the app.

The founder review loop must not quietly introduce the storage that Phase 4 intentionally avoided. Store redacted review records, not raw food descriptions, raw A1C values, usernames, prompt text, or full model output. The durable record should preserve enough to audit launch safety: response kind, risk class, A1C band, coarse food category if already safely derived, policy-flag booleans, reviewer verdict, severity, and eval-backfill status. If an incident needs exact reproduction, capture the minimum sanitized case from a consented report or founder reproduction, add it to the eval suite, and use the Phase 4 kill switch for harmful SAFE or medical-claim incidents.

**Primary recommendation:** Plan Phase 5 as two slices: first, create the mod-approved launch artifact plus aggregate demand measurement; second, run the founder review loop, incident feedback process, and scanner-next gate with explicit evidence files.

## Standard Stack

### Core

| Library / Platform | Version | Purpose | Why Standard |
|--------------------|---------|---------|--------------|
| Existing Next.js App Router MVP | Inherited from Phases 2-4 | Public check flow and one `POST /api/check` path | Phase 5 must measure and review the existing MVP, not add a second product surface. |
| Existing Phase 4 telemetry seam | Inherited from Phase 4 | Coarse operational events and launch probes | Preserves the no-raw-food/no-raw-A1C telemetry boundary. |
| Existing Phase 4 Edge Config kill switch | Inherited from Phase 4 | Pause public checks during harmful guidance or abuse incidents | Incidents discovered in Phase 5 need an executable rollback path. |
| `@upstash/redis` | `1.38.0` verified with `npm view` on 2026-05-06 | Aggregate launch counters by day/week | HTTP-based Redis client designed for serverless/Next.js; reliable weekly counts without raw health data. |
| Markdown + CSV/JSON evidence files | Repo-native | Launch copy, modmail draft, demand ledger, review checklist, incident log, scanner gate decision | Keeps Phase 5 auditable without adding CRM or account storage. |
| Vitest | `4.1.5` verified with `npm view` on 2026-05-06 | Unit/static validation for launch copy, metrics schema, review record privacy, and gate logic | Matches prior phase validation stack. |
| Playwright | `1.59.1` verified with `npm view` on 2026-05-06 | Smoke tests for public launch link, share button, and friendly incident/pause states | Matches prior public-flow validation stack. |

### Supporting

| Library / Platform | Version | Purpose | When to Use |
|--------------------|---------|---------|-------------|
| `@vercel/analytics` | `2.0.1` verified with `npm view` on 2026-05-06 | Anonymous pageviews/referrer visibility | Use only for pageviews/referrers and only with sensitive URL/query redaction. Do not use for raw input or WTP notes. |
| Vercel Runtime Logs | Platform feature | Incident triage and same-day sanity checks | Use as supporting evidence only; not enough for weekly query-count validation on Hobby/Pro retention windows. |
| Web Share API | Browser API | Mobile-native share intent for the public link | Use for a privacy-safe share button; count as share intent, not proof that a human actually shared. |
| Zod | Inherited from Phase 2 | Runtime schema for `LaunchMetric`, `ReviewRecord`, and `ScannerGateInput` | Use if the earlier Zod dependency exists; otherwise use existing project schema pattern. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Upstash aggregate counters | Vercel Runtime Logs only | Logs are useful for incidents but retention is too short for reliable first-week query volume on lower plans. |
| Upstash aggregate counters | Vercel Web Analytics custom events | Custom event availability and privacy configuration are plan-dependent; aggregate counters are explicit and testable. |
| Redacted Markdown/CSV demand ledger | Airtable, Notion, HubSpot, or CRM | Third-party workspaces make it easier to leak usernames, health comments, or direct-message content before the privacy posture is ready. |
| Manual WTP ledger | Stripe checkout or payment link | Payments are explicitly deferred; Phase 5 measures willingness to pay before implementing billing. |
| Modmail-approved founder post | Automated Reddit outreach, reposting, or scraping | Automation increases spam risk and conflicts with trust-sensitive health-community norms. |

**Installation:**

```bash
# Only if Phase 5 implements aggregate counters and pageview analytics in code
npm install @upstash/redis@1.38.0 @vercel/analytics@2.0.1

# Validation stack, inherited if prior phases already installed it
npm install -D vitest@4.1.5 @playwright/test@1.59.1
```

## Architecture Patterns

### Recommended Project Structure

```text
docs/
├── launch/
│   ├── community-rules-snapshot.md      # Current r/prediabetes/equivalent-channel rule snapshot
│   ├── modmail-request.md               # Permission request before posting
│   └── community-post.md                # Approved non-promotional launch artifact
├── validation/
│   ├── demand-ledger.md                 # Weekly query/share/paid-ask/WTP evidence ledger
│   ├── founder-review-loop.md           # First-50 and daily spot-check workflow
│   └── scanner-next-gate.md             # Final go/no-go decision record
└── ops/
    └── incident-feedback-loop.md         # Severity, eval backfill, and rollback rules
lib/
└── revora/
    ├── launch-metrics.ts                # Aggregate counters only
    ├── review-record.ts                 # Redacted review record schema
    └── scanner-gate.ts                  # Deterministic VALID-06 evaluator
scripts/
└── validate-community-launch.mjs         # Static docs/requirements validator
tests/
├── unit/
│   └── revora/
│       ├── launch-copy.test.ts
│       ├── launch-metrics.test.ts
│       ├── review-record.test.ts
│       └── scanner-gate.test.ts
└── smoke/
    └── community-launch.spec.ts
```

### Pattern 1: Modmail-First Community Launch

**What:** Treat `r/prediabetes` as a permissioned trust channel, not a free launch channel.

**When to use:** Always for `VALID-01`.

**Required sequence:**

1. Snapshot current `r/prediabetes/about/rules.json` into `docs/launch/community-rules-snapshot.md`.
2. Write `docs/launch/modmail-request.md` with founder affiliation, exact draft, evidence sources, and privacy posture.
3. Send modmail and record outcome as `approved`, `denied`, `no_response`, or `equivalent_channel_selected`.
4. Post only after approval. If denied or no response, use an equivalent community channel with its own rule snapshot.

**Example launch-post constraints:**

```markdown
<!-- Source: current r/prediabetes rules + FTC endorsement guidance -->
- Disclose: "I built Revora..."
- Ask for feedback, not sales.
- No treatment, reversal, cure, diagnosis, future-A1C, or exact glucose-spike claims.
- Cite CDC for A1C range or prevalence if those claims appear.
- Include "informational only; not medical advice; ask your doctor or registered dietitian."
- Do not ask users to post private A1C, diagnoses, medications, or screenshots in the thread.
```

### Pattern 2: Aggregate-Only Demand Metrics

**What:** Track query volume and share intent as aggregate counts, while tracking shares, paid-version asks, and WTP conversations in a redacted founder ledger.

**When to use:** Always for `VALID-02` through `VALID-05`.

**Metric taxonomy:**

| Metric | Source | Durable Fields | Do Not Store |
|--------|--------|----------------|--------------|
| `query_completed` | Server route after result/retry/clarify outcome | day, week, environment, response kind, risk class if applicable | raw food, raw A1C, prompt, model output, IP, user agent |
| `share_intent` | Share button/copy-link event | day, week, channel if known | recipient, message text, user identity |
| `verified_organic_share` | Founder-observed comment/DM/user report | date, channel, count, non-identifying note | usernames, links to private DMs, medical details |
| `paid_version_ask` | Founder-observed comment/DM | date, channel, count, non-identifying note | usernames, full message content |
| `wtp_conversation` | Direct founder conversation | date, channel, yes/no/maybe, short rationale | name, contact info, health history |

**Example:**

```typescript
// Source: Upstash TypeScript SDK docs, adapted to aggregate-only launch metrics.
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export type LaunchMetricName =
  | "query_completed"
  | "share_intent";

export async function incrementLaunchMetric(input: {
  name: LaunchMetricName;
  day: string; // YYYY-MM-DD in UTC
  environment: "preview" | "production";
}) {
  if (input.environment !== "production") return null;

  return redis.incr(`revora:launch:${input.day}:${input.name}`);
}
```

### Pattern 3: Separate Share Intent From Verified Organic Shares

**What:** A share-button click is useful product telemetry, but it does not prove that one prediabetic shared Revora with another prediabetic.

**When to use:** Always for `VALID-03`.

**Implementation guidance:** Add a lightweight "Share Revora" button only after the first result or on the landing/result surface, using Web Share API when available and copy-to-clipboard fallback when not. Count successful share/copy as `share_intent`. Count `verified_organic_share` only when a person reports sharing or the founder sees a public, non-private share.

**Example:**

```typescript
// Source: MDN Web Share API docs, adapted for a privacy-safe Revora link.
export async function shareRevora(url: string) {
  const payload = {
    title: "Revora",
    text: "A quick food check for people managing prediabetes.",
    url,
  };

  if (navigator.share) {
    await navigator.share(payload);
    return "native_share_started";
  }

  await navigator.clipboard.writeText(url);
  return "link_copied";
}
```

### Pattern 4: Redacted Founder Review Records

**What:** The founder reviews first-50 and daily production outcomes through a structured record that excludes raw inputs by default.

**When to use:** Always for `GUARD-07`.

**Durable review record:**

```typescript
export type ReviewRecord = {
  reviewId: string;
  source: "first_50" | "daily_spot_check" | "incident_followup";
  createdDay: string;
  a1cBand: "5.7-5.9" | "6.0-6.2" | "6.3-6.4" | "out_of_scope" | "not_recorded";
  responseKind: "result" | "clarify" | "not_food" | "out_of_scope" | "retry";
  risk?: "SAFE" | "MODERATE" | "HIGH";
  coarseFoodCategory?: "mixed_meal" | "grain_starch" | "dessert" | "beverage" | "protein" | "vegetable" | "unknown";
  disclaimerPresent: boolean;
  prohibitedClaimFlags: string[];
  reviewerVerdict: "pass" | "needs_eval" | "incident";
  incidentSeverity?: "S0" | "S1" | "S2";
};
```

**Review rule:** If the founder needs exact food text to reproduce an issue, convert it into a sanitized eval fixture or obtain explicit consent through an incident report. Do not start storing raw production input by default in Phase 5.

### Pattern 5: Incident Feedback Into Evals And Rollback

**What:** Every real incident gets triaged, mapped to eval coverage, and tied to a rollback decision.

**When to use:** Always after launch.

**Severity rubric:**

| Severity | Trigger | Required Action |
|----------|---------|-----------------|
| `S0` | Harmful SAFE, direct medical advice, treatment/reversal claim, missing disclaimer on terminal result | Pause public checks with Phase 4 kill switch, write incident record, add eval fixture, rerun safety suite before reopening. |
| `S1` | Borderline unsafe tone, unsupported claim, wrong out-of-scope handling, confusing paid/scanner copy | Add eval fixture, patch copy/prompt/policy, spot-check 10 additional results before normal operation. |
| `S2` | Minor wording issue, typo, harmless telemetry mismatch | Fix in normal flow and record in daily review. |

**Example eval-backfill shape:**

```typescript
export function incidentRequiresRollback(severity: "S0" | "S1" | "S2") {
  return severity === "S0";
}

export function incidentRequiresEvalBackfill(severity: "S0" | "S1" | "S2") {
  return severity === "S0" || severity === "S1";
}
```

### Pattern 6: Deterministic Scanner-Next Gate

**What:** The scanner decision is a simple function of launch evidence, not founder excitement or anecdotal interest.

**When to use:** Always for `VALID-06`.

**Example:**

```typescript
export type ScannerGateInput = {
  daysSinceLaunch: number;
  directWtpConversations: number;
  directWtpYeses: number;
  organicShares: number;
};

export function evaluateScannerGate(input: ScannerGateInput) {
  const wtpGate =
    input.directWtpConversations >= 5 && input.directWtpYeses >= 3;
  const shareGate =
    input.daysSinceLaunch <= 14 && input.organicShares >= 10;

  return {
    scannerNextEarned: wtpGate || shareGate,
    reason: wtpGate ? "wtp_gate" : shareGate ? "share_gate" : "not_earned",
  };
}
```

### Anti-Patterns To Avoid

- **Posting the link before mod approval:** Current `r/prediabetes` rules prohibit promotional content and solicitations; removal is a product trust failure, not just a distribution miss.
- **Pretending founder affiliation is irrelevant:** The founder has a material connection to Revora. Put the relationship at the top of launch copy and modmail.
- **Using stale or stronger-than-needed health claims:** The old project statistic of 98 million is stale relative to current CDC material showing 115.2 million American adults with prediabetes. Safer default: omit prevalence unless needed.
- **Relying on runtime logs for weekly metrics:** Vercel log retention can be too short for first-week query validation.
- **Counting share clicks as organic shares:** Share intent is not proof of human-to-human sharing.
- **Storing raw review logs:** First-50 review does not justify raw food/A1C storage by default.
- **Letting the scanner gate drift:** No scanner, native app, auth, history, or payments unless the documented gate is met.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reddit/community launch compliance | Growth-hack playbook, automated posts, scraper-driven outreach | Modmail-first founder workflow and rules snapshot | Health communities are trust-sensitive and can reject promotional material. |
| Weekly query count | In-memory counters or ad hoc log grep | Upstash Redis aggregate `INCR` counters | Serverless memory is not shared, and Vercel logs may not retain a full week. |
| Share measurement | URL shortener with user-level tracking | Separate `share_intent` aggregate from manually verified organic shares | Avoids identity tracking and false proof. |
| WTP validation | Stripe checkout, subscriptions, or pricing page | Five direct `$5/month` WTP conversations and redacted ledger | Payments are explicitly deferred until demand is proven. |
| Founder review queue | Raw production-log storage or full transcript warehouse | Redacted `ReviewRecord` schema plus consented/sanitized incident fixtures | Preserves Phase 4 privacy while still creating safety evidence. |
| Incident handling | Slack-style freeform notes only | Severity rubric + eval backfill + Phase 4 kill switch | Incidents must change tests and rollback state, not just docs. |
| Scanner decision | Roadmap debate after launch | `evaluateScannerGate()` and signed decision record | Keeps expansion tied to evidence. |

**Key insight:** Phase 5's risk is not that the founder lacks metrics; it is that collecting richer metrics quietly turns the MVP into a health-data product before Revora has earned that complexity.

## Common Pitfalls

### Pitfall 1: Treating `r/prediabetes` As A Normal Launch Channel

**What goes wrong:** The founder posts a product link that moderators or members read as advertising, a study solicitation, or medical advice.

**Why it happens:** The roadmap says `r/prediabetes or equivalent`, but the current subreddit rules explicitly disallow promotional content and require credible sourcing for scientific claims.

**How to avoid:** Make modmail approval a pre-launch gate. If approval is not granted, switch to an equivalent channel and document why.

**Warning signs:** Launch copy says "try my app" without mod permission, asks users to share A1C in comments, or includes no source links.

### Pitfall 2: Weak Or Hidden Disclosure

**What goes wrong:** The post reads as if a neutral user found Revora, or the founder hides the product relationship until the comments.

**Why it happens:** Founders often soften disclosure because they fear a post will look promotional.

**How to avoid:** Put "I built Revora" or equivalent in the first lines of both modmail and post draft. Use short, clear disclosure in every repost.

**Warning signs:** Copy says "I came across this" or "someone made this" when the founder is the maker.

### Pitfall 3: Launch Copy Drifts Into Medical Claims

**What goes wrong:** The artifact promises reversal, treatment, prevention, glucose prediction, exact GI/GL, or personalized medical advice.

**Why it happens:** Community members ask high-stakes health questions, and the product's value can be overstated under pressure.

**How to avoid:** Reuse Phase 1 claims language exactly. Link only to credible sources for public health facts, and keep Revora framed as informational food guidance.

**Warning signs:** "Reverse prediabetes," "will lower your A1C," "prevents diabetes," or "safe for you" appears in launch copy.

### Pitfall 4: Weekly Demand Metrics Depend On Ephemeral Logs

**What goes wrong:** After a week, the founder cannot prove whether 50 queries happened because logs expired.

**Why it happens:** Runtime logs feel like analytics during testing, but Vercel retention varies by plan and can be short.

**How to avoid:** Increment daily aggregate counters at request time and produce a weekly snapshot in the demand ledger.

**Warning signs:** The plan says "check Vercel logs next week" without any durable aggregate counter.

### Pitfall 5: First-50 Review Becomes Raw Health-Data Collection

**What goes wrong:** To make review easier, the app starts storing raw food text, exact A1C, user identifiers, or full model outputs.

**Why it happens:** Safety review and privacy minimization pull in opposite directions unless the review schema is designed upfront.

**How to avoid:** Store redacted review records by default. Use sanitized eval fixtures for reproducible incidents.

**Warning signs:** `food`, `a1c`, `prompt`, `output_text`, `username`, `ip`, or `userAgent` fields appear in durable review storage.

### Pitfall 6: Incidents Do Not Change The Eval Suite

**What goes wrong:** A real harmful or misleading result is fixed manually but never becomes a regression test.

**Why it happens:** Incident response is documented as an ops task instead of a safety-learning loop.

**How to avoid:** Require `evalBackfilled: true` or `evalBackfillNotNeededReason` on every `S0`/`S1` incident before reopening the launch.

**Warning signs:** Incident log has "fixed" rows with no linked test or fixture.

### Pitfall 7: The Scanner Decision Becomes Anecdotal

**What goes wrong:** The team starts scanner/native/auth/payment work because users liked the concept, even though WTP/share thresholds were not met.

**Why it happens:** Launch comments feel more compelling than a hard gate.

**How to avoid:** Put the gate evaluator and decision record in the repo before launch starts.

**Warning signs:** "Several people seemed interested" is used as a scanner-next rationale.

## Code Examples

Verified patterns from official sources and project constraints:

### Community Launch Copy Checklist

```markdown
<!-- Source: r/prediabetes rules snapshot + FTC endorsement guidance -->
- [ ] Founder affiliation disclosed in the first paragraph.
- [ ] Moderator approval recorded, or equivalent-channel rationale recorded.
- [ ] No treatment, prevention, cure, reversal, diagnosis, future-A1C, exact GI/GL, or glucose-spike claims.
- [ ] CDC source linked if A1C range or prevalence is mentioned.
- [ ] Informational-only doctor/RD disclaimer included.
- [ ] No request for users to share private A1C, medication, diagnosis, or screenshots in public comments.
- [ ] Feedback ask is narrow: usefulness, clarity, anxiety/tone, whether they would share/pay.
```

### Aggregate Daily Query Counter

```typescript
// Source: Upstash TypeScript SDK INCR docs.
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function recordQueryCompleted(day: string) {
  return redis.incr(`revora:launch:${day}:query_completed`);
}
```

### Redacted Demand Ledger Row

```typescript
export type DemandLedgerRow = {
  date: string;
  channel: "reddit" | "direct_dm" | "in_person" | "other";
  signal:
    | "verified_organic_share"
    | "paid_version_ask"
    | "wtp_yes"
    | "wtp_no"
    | "wtp_maybe";
  count: number;
  evidenceNote: string; // non-identifying summary only
};
```

### Scanner Gate Evaluator

```typescript
export function scannerGateStatus(input: {
  directWtpConversations: number;
  directWtpYeses: number;
  organicSharesWithinTwoWeeks: number;
}) {
  if (input.directWtpConversations >= 5 && input.directWtpYeses >= 3) {
    return "earned_by_wtp";
  }

  if (input.organicSharesWithinTwoWeeks >= 10) {
    return "earned_by_shares";
  }

  return "not_earned";
}
```

## State of the Art

| Old Approach | Current Approach | When Changed / Verified | Impact |
|--------------|------------------|-------------------------|--------|
| Post product link directly into niche subreddit | Ask moderators first and follow community-specific rules | `r/prediabetes` rules checked 2026-05-06 | Direct launch post is risky unless approved. |
| Hide or soften founder/product affiliation | Clear disclosure in each launch artifact | FTC endorsement guidance checked 2026-05-06 | Disclosure is part of trust and consumer-protection posture. |
| Use 98 million prediabetes prevalence number from older docs | Use current CDC 115.2 million number or omit prevalence | CDC page updated 2026-02-17 | Prevents stale evidence in launch copy. |
| Rely on server logs for weekly query metrics | Use aggregate counters plus manual weekly snapshot | Vercel runtime-log retention checked 2026-05-06 | Avoids losing first-week validation evidence. |
| Build scanner after qualitative interest | Build scanner only after `3/5` WTP yeses or `10+` organic shares | Active requirements | Keeps expansion evidence-gated. |
| Store raw production transcripts for review | Redacted review records and sanitized incident fixtures | Phase 4 privacy posture | Preserves trust and avoids accidental health-data product expansion. |

**Deprecated/outdated:**

- Any archived Revora/Glucosnap plan that assumes scanner, account, saved history, payments, PostHog-heavy analytics, or shareable health cards is out of scope for Phase 5.
- Reversal-oriented copy is out of scope even if the community itself uses "reverse" language.
- Runtime logs are not a reliable weekly analytics system for this phase.

## Open Questions

1. **Will `r/prediabetes` moderators approve any founder-built product link?**
   - What we know: Current rules prohibit promotional content and solicitations, but the roadmap allows an equivalent community.
   - What's unclear: Whether moderators will make an exception for a transparent feedback post.
   - Recommendation: Make modmail approval a launch gate and prepare an equivalent-channel fallback.

2. **How much production context is necessary for first-50 review?**
   - What we know: Raw food/A1C storage is outside the Phase 4 privacy boundary by default.
   - What's unclear: Whether redacted output review plus coarse category is sufficient for the founder's safety bar.
   - Recommendation: Start with redacted review records. If raw input review is required, create an explicit consented incident-report path and update the privacy posture before collecting it.

3. **Will the project use Upstash for aggregate counters?**
   - What we know: Vercel logs alone are too ephemeral for weekly validation on common plans.
   - What's unclear: Whether the founder wants a new provider setup for only aggregate metrics.
   - Recommendation: Use Upstash Redis for aggregate production query counts. If provider setup is blocked, require daily manual snapshots and mark metric confidence lower.

4. **What qualifies as an organic share?**
   - What we know: The requirement asks for people sharing the MVP with another prediabetic, not just clicking a share button.
   - What's unclear: Whether self-reported private shares count.
   - Recommendation: Count public shares and self-reported shares as verified if the founder records a non-identifying evidence note; keep share-intent clicks separate.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `4.1.5` + Playwright `1.59.1` + static Markdown validator |
| Config file | `vitest.config.ts`, `playwright.config.ts`; none exist in this checkout yet, see Wave 0 |
| Quick run command | `node scripts/validate-community-launch.mjs && npx vitest run tests/unit/revora/launch-copy.test.ts tests/unit/revora/launch-metrics.test.ts tests/unit/revora/review-record.test.ts tests/unit/revora/scanner-gate.test.ts -x` |
| Full suite command | `npm run typecheck && npm run build && npx vitest run tests/unit/revora && npx playwright test tests/smoke/community-launch.spec.ts --project="Mobile Chrome" && node scripts/validate-community-launch.mjs` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| GUARD-07 | First 50 production results and 5/day for 14 days are represented in review checklist, review schema, and incident workflow | unit + static + manual evidence | `npx vitest run tests/unit/revora/review-record.test.ts -x && node scripts/validate-community-launch.mjs --section founder-review` | ❌ Wave 0 |
| VALID-01 | Launch artifact is non-promotional, disclosed, evidence-aware, moderator-gated, and claims-safe | static + unit | `npx vitest run tests/unit/revora/launch-copy.test.ts -x && node scripts/validate-community-launch.mjs --section launch-copy` | ❌ Wave 0 |
| VALID-02 | Weekly query volume can prove whether 50+ first-week queries happened without raw data | unit + manual evidence | `npx vitest run tests/unit/revora/launch-metrics.test.ts -t "query_completed" -x` | ❌ Wave 0 |
| VALID-03 | Organic shares are tracked separately from share-intent clicks | unit + static + manual evidence | `npx vitest run tests/unit/revora/launch-metrics.test.ts -t "organic share" -x && node scripts/validate-community-launch.mjs --section demand-ledger` | ❌ Wave 0 |
| VALID-04 | Paid-version asks can be counted from redacted demand ledger entries | static + manual evidence | `node scripts/validate-community-launch.mjs --section paid-asks` | ❌ Wave 0 |
| VALID-05 | Five direct WTP conversations at `$5/month` can be recorded as yes/no/maybe without PII | static + manual evidence | `node scripts/validate-community-launch.mjs --section wtp` | ❌ Wave 0 |
| VALID-06 | Scanner-next decision returns earned only for `3/5` WTP yeses or `10+` organic shares within two weeks | unit + static | `npx vitest run tests/unit/revora/scanner-gate.test.ts -x && node scripts/validate-community-launch.mjs --section scanner-gate` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** Run the relevant Vitest file plus `node scripts/validate-community-launch.mjs` for touched docs.
- **Per wave merge:** Run the quick command and inspect the demand/review docs for empty evidence slots.
- **Phase gate:** Full suite green, modmail/equivalent-channel evidence recorded, weekly query counter snapshot recorded, first-50 review completed or explicitly blocked before public expansion, incident log reconciled with eval backfill, and scanner-next decision record signed.

### Wave 0 Gaps

- [ ] Phase 4 dependency artifacts: `docs/privacy/data-flow.md`, `docs/ops/launch-controls.md`, `lib/revora/telemetry.ts`, `lib/revora/launch-controls.ts`, `app/api/check/route.ts`, and `app/api/health/route.ts`
- [ ] App/test scaffold: `package.json`, `vitest.config.ts`, `playwright.config.ts`, `app/page.tsx`, and prior Phase 2/3/4 tests
- [ ] `docs/launch/community-rules-snapshot.md` - current `r/prediabetes` or equivalent-channel rules
- [ ] `docs/launch/modmail-request.md` - moderator permission request and outcome slot
- [ ] `docs/launch/community-post.md` - evidence-aware launch artifact
- [ ] `docs/validation/demand-ledger.md` - weekly query, share, paid-ask, and WTP tracking
- [ ] `docs/validation/founder-review-loop.md` - first-50 and daily spot-check checklist
- [ ] `docs/validation/scanner-next-gate.md` - decision record and threshold proof
- [ ] `docs/ops/incident-feedback-loop.md` - severity rubric, eval backfill, rollback trigger
- [ ] `lib/revora/launch-metrics.ts` - aggregate counters with no raw health data
- [ ] `lib/revora/review-record.ts` - redacted review schema
- [ ] `lib/revora/scanner-gate.ts` - deterministic gate logic
- [ ] `scripts/validate-community-launch.mjs` - static validator for launch/review/gate artifacts
- [ ] `tests/unit/revora/launch-copy.test.ts` - claims, disclosure, and community-rule checks
- [ ] `tests/unit/revora/launch-metrics.test.ts` - aggregate-only counter checks
- [ ] `tests/unit/revora/review-record.test.ts` - no raw food/A1C/prompt/output fields
- [ ] `tests/unit/revora/scanner-gate.test.ts` - `VALID-06` thresholds
- [ ] `tests/smoke/community-launch.spec.ts` - public launch link, share button, pause/incident UX
- [ ] Provider setup if aggregate counters are adopted: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

### Manual-Only Verifications

| Behavior | Requirement | Why Manual | Evidence Required |
|----------|-------------|------------|-------------------|
| Moderator approval or equivalent-channel selection | VALID-01 | Depends on community moderators | Modmail timestamp/outcome, approved post URL, or fallback-channel rationale |
| First-week query volume | VALID-02 | Requires production traffic | Daily aggregate counter snapshots and first-week total |
| Verified organic shares | VALID-03 | Human-to-human sharing may happen outside app telemetry | Redacted evidence notes with count and channel |
| Paid-version asks | VALID-04 | Happens in comments/DMs/conversations | Redacted demand-ledger rows |
| Five WTP conversations | VALID-05 | Direct founder conversations | Yes/no/maybe outcomes with non-identifying rationale |
| First-50 and daily review completion | GUARD-07 | Requires founder review judgment | Completed checklist, incident links, eval backfill status |
| Scanner-next decision | VALID-06 | Product decision, not only code | Signed `docs/validation/scanner-next-gate.md` with counts and final decision |

## Sources

### Primary (HIGH confidence)

- `.planning/STATE.md` - active Phase 5 decision to defer scanner/auth/history/payments unless expansion gate clears.
- `.planning/ROADMAP.md` - Phase 5 goal, dependencies, success criteria, and two-plan breakdown.
- `.planning/REQUIREMENTS.md` - `GUARD-07` and `VALID-01` through `VALID-06`.
- `.planning/PROJECT.md` - Permission MVP scope, launch targets, WTP signals, and deferred features.
- `.planning/phases/04-privacy-minimal-launch-controls/04-RESEARCH.md` - privacy-minimal telemetry, no raw storage, kill-switch, and Vercel constraints.
- `.planning/phases/04-privacy-minimal-launch-controls/04-01-PLAN.md` - privacy boundary, telemetry allowlist, `store: false`, and safe health probe expectations.
- `.planning/phases/04-privacy-minimal-launch-controls/04-02-PLAN.md` - Edge Config, WAF thresholds, and rollback/kill-switch runbook expectations.
- https://www.reddit.com/r/prediabetes/about/rules.json - current `r/prediabetes` rules checked 2026-05-06.
- https://www.reddit.com/r/prediabetes/about.json - current community description/subreddit metadata checked 2026-05-06.
- https://support.reddithelp.com/hc/en-us/articles/28012014962580-How-do-I-keep-spam-out-of-my-community - Reddit spam and self-promotion guidance checked 2026-05-06.
- https://support.reddithelp.com/hc/en-us/articles/360043043792-How-do-I-contact-the-moderators-of-a-community - Reddit modmail guidance checked 2026-05-06.
- https://consumer.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking - FTC endorsement/disclosure guidance checked 2026-05-06.
- https://www.ftc.gov/business-guidance/resources/mobile-health-app-developers-ftc-best-practices - FTC health-app privacy/security best practices checked 2026-05-06.
- https://www.ftc.gov/business-guidance/resources/collecting-using-or-sharing-consumer-health-information-look-hipaa-ftc-act-health-breach - FTC health-information privacy guidance checked 2026-05-06.
- https://www.cdc.gov/diabetes/communication-resources/prediabetes-statistics.html - current CDC prediabetes prevalence page checked 2026-05-06.
- https://www.cdc.gov/diabetes/diabetes-testing/prediabetes-a1c-test.html - CDC A1C range page checked 2026-05-06.
- https://vercel.com/docs/logs/runtime - Vercel runtime-log retention limits checked 2026-05-06.
- https://vercel.com/docs/analytics/privacy-policy - Vercel Web Analytics privacy posture checked 2026-05-06.
- https://vercel.com/docs/analytics/quickstart - Vercel Web Analytics setup and custom-event note checked 2026-05-06.
- https://upstash.com/docs/redis/sdks/ts/overview - Upstash TypeScript SDK serverless fit checked 2026-05-06.
- https://upstash.com/docs/redis/sdks/ts/commands/string/incr - Upstash `INCR` counter behavior checked 2026-05-06.
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share - Web Share API behavior checked 2026-05-06.

### Secondary (MEDIUM confidence)

- `npm view @upstash/redis version` - `1.38.0`.
- `npm view @vercel/analytics version` - `2.0.1`.
- `npm view vitest version` - `4.1.5`.
- `npm view @playwright/test version` - `1.59.1`.

### Tertiary (LOW confidence)

- None.

## Metadata

**Confidence breakdown:**

- Standard stack: MEDIUM - package versions and official docs are current, but this checkout is still planning-only and prior implementation artifacts do not exist locally yet.
- Architecture: MEDIUM - launch/review/gate patterns are well supported by project constraints and official sources, but the exact storage choice for aggregate counters requires provider setup.
- Community constraints: HIGH - current `r/prediabetes` rules were retrieved from Reddit's JSON endpoint, but subreddit rules can change quickly.
- Pitfalls: HIGH - directly supported by active project constraints, Phase 4 privacy posture, Reddit rules, FTC guidance, and Vercel retention docs.

**Research date:** 2026-05-06
**Valid until:** 2026-05-13 for community rules and platform docs; 2026-06-05 for architecture patterns if package/provider versions remain compatible.
