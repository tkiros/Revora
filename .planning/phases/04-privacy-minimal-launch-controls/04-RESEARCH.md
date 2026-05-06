# Phase 4: Privacy-Minimal Launch Controls - Research

**Researched:** 2026-05-06
**Domain:** Privacy-minimal public deployment controls for a no-login Next.js + OpenAI MVP on Vercel
**Confidence:** MEDIUM

## User Constraints

No Phase 4 `CONTEXT.md` exists. Research is therefore constrained by `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/PROJECT.md`, the Phase 2 and Phase 3 dependency plans/research, and the current official OpenAI and Vercel docs checked on 2026-05-06.

### Locked Decisions

- Revora stays a no-login, text-only, prediabetes-only public MVP.
- Phase 4 must keep raw food descriptions, raw A1C values, and account-linked health data out of default storage.
- Phase 2 already chose one server-side OpenAI path and explicitly expects `store: false`; Phase 4 must harden that path rather than replace it.
- Phase 3 already chose one public page and one `POST /api/check` route; Phase 4 must add privacy and operational controls around that surface, not add auth, saved history, or a second backend path.
- Telemetry must stay privacy-minimal. Rich analytics is not part of the active MVP scope.
- The public deployment target is Vercel from the git repository.

### Claude's Discretion

- Choose the minimal Vercel-native control stack that enforces privacy, abuse response, and rollback well.
- Define the concrete rate-limit, kill-switch, and rollback thresholds/operators for launch.
- Decide whether app-layer quota storage is necessary, or whether Vercel-native controls are sufficient for MVP.
- Define a usable validation architecture even though this repo has not executed Phases 2 and 3 yet.

### Deferred Ideas (Out of Scope)

- Scanner, auth, saved history, database-backed personalization, payments, broader health tracking, or any feature that introduces durable health-data storage.
- Rich analytics pipelines, session replay, user identification, or customer-data export work.
- Older scanner-heavy, account-heavy, or PostHog-heavy archive documents in this repo. They are stale relative to the current roadmap and must not expand this phase.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PRIV-01 | The MVP does not store raw food descriptions, raw A1C values, or account-linked health data by default. | Keep the request path stateless, do not add auth/database/history, centralize logging/telemetry scrubbing, and forbid raw input persistence outside the live request. |
| PRIV-02 | OpenAI API calls are configured to avoid provider-side response storage where supported. | Use one server-only OpenAI client that sets `store: false` on every Responses API call and avoids stateful features unless explicitly approved. |
| PRIV-03 | Analytics and telemetry exclude raw food descriptions and raw A1C values. | Use allowlisted coarse telemetry fields only; never send raw food, raw A1C, prompt text, or full model output to analytics, logs, or metadata. |
| PRIV-04 | Any launch telemetry is privacy-minimal, such as pageviews, coarse result class counts, or redacted operational events. | Prefer first-party coarse events and sanitized server logs over rich client analytics SDKs. |
| OPS-01 | The app can be deployed publicly on Vercel from the git repository. | Plan explicit Preview vs Production env separation, Vercel build/deploy checks, and a pre-production verification path before promoting public traffic. |
| OPS-02 | The launch plan defines a cost/abuse threshold that triggers rate limiting or temporary shutdown. | Use Vercel WAF as the mandatory perimeter control, Edge Config as the fast kill switch, and the project's `~2,000 checks / 24h` constraint as the global cost threshold. |
| OPS-03 | The launch plan includes a rollback or kill-switch procedure for harmful guidance incidents. | Pause traffic first through Edge Config, then use Vercel rollback commands plus post-rollback verification because rollback alone does not prove the service is healthy. |

</phase_requirements>

## Summary

Phase 4 should be planned as a hardening layer over the single public request path chosen in Phases 2 and 3, not as a new subsystem. The critical privacy fact from current OpenAI docs is that API data is not used to train models by default, but that does not mean zero retention: abuse-monitoring logs may retain prompts/responses up to 30 days, and the Responses API stores application state for at least 30 days by default when `store` is left enabled. For Revora, that means Phase 4 must treat `store: false` as a mandatory invariant in one centralized server-only client and must also avoid logging or analytics that copy raw food or A1C values elsewhere.

The critical deployment fact from current Vercel docs is that public launch controls should not depend on a redeploy during an incident. Edge Config is the best fit for Revora's kill switch because it can change runtime behavior without redeploying, while Vercel WAF rate limiting is available on all plans and can stop repeated `/api/check` abuse before it reaches OpenAI. Preview and Production must be configured separately, because Vercel environments are distinct and environment-variable changes apply only to new deployments. Rollback also needs explicit verification: Vercel's rollback docs are good, but a rollback is only a restoration step, not proof that the restored deployment, environment, and OpenAI path are safe.

The repo state matters here. As of 2026-05-06, this checkout is still planning-only: there is no `package.json`, no `app/`, no `lib/`, and no test scaffold from Phase 2 or Phase 3. So Phase 4 planning must start with a dependency gate: verify the actual Phase 2 and 3 artifacts exist before implementing privacy or ops controls. The right plan shape is therefore two slices: first, centralize privacy-minimal OpenAI, telemetry, and deploy configuration around the existing `/api/check` contract; second, add Vercel WAF thresholds, Edge Config kill-switch behavior, and a rollback drill with verification.

**Primary recommendation:** Plan Phase 4 as a thin hardening phase over the existing `/api/check` path: one audited OpenAI client with `store: false`, one allowlisted telemetry boundary, one Edge Config kill switch, one Vercel WAF rate-limit rule, and one rollback runbook that always verifies after restore.

## Standard Stack

### Core

| Library / Platform | Version | Purpose | Why Standard |
|--------------------|---------|---------|--------------|
| Next.js App Router | `16.2.4` verified with `npm view` on 2026-05-06 | Public page, API route, middleware, and Vercel-native deployment target | Matches the locked MVP stack from earlier phases and integrates cleanly with Vercel environments and middleware. |
| OpenAI Node SDK | `6.36.0` verified with `npm view` on 2026-05-06 | Server-only Responses API client behind the existing `checkFood()` path | One audited wrapper is the simplest way to enforce `store: false` everywhere. |
| OpenAI Responses API | Official docs checked 2026-05-06 | Structured model calls for the Revora check service | Current docs explicitly document `store`, retention behavior, and stateful features that Phase 4 must control. |
| Vercel Environments + Environment Variables | Docs updated 2026-02-23 and checked 2026-05-06 | Production / Preview separation and runtime configuration | This is the official deploy boundary and must be planned explicitly for privacy and rollback safety. |
| Vercel Edge Config + `@vercel/edge-config` | Platform docs checked 2026-05-06; package `1.4.3` verified with `npm view` | Fast kill switch and launch-mode flags without redeploy | Edge Config is on all plans, readable from Middleware and Functions, and is designed for frequently-read, infrequently-changed control data. |
| Vercel WAF Rate Limiting | Docs updated 2026-02-26 and checked 2026-05-06 | Perimeter rate limiting for `/api/check` | Available on all plans and cheaper than letting abusive traffic hit the OpenAI path first. |

### Supporting

| Library / Platform | Version | Purpose | When to Use |
|--------------------|---------|---------|-------------|
| Vitest | `4.1.5` verified with `npm view` on 2026-05-06 | Unit tests for `store: false`, telemetry allowlists, and launch-control helpers | Use once the Phase 2 scaffold exists. |
| Playwright | `1.59.1` verified with `npm view` on 2026-05-06 | Smoke tests for maintenance mode, friendly shutdown copy, and Preview verification | Use once the Phase 3 public shell exists. |
| Upstash Ratelimit | `2.0.8` verified with `npm view` on 2026-05-06 | Optional app-layer daily quotas or richer quota tests | Use only if Phase 4 needs code-level daily/global counters instead of relying on WAF plus operator thresholds. |
| Upstash Redis | `1.38.0` verified with `npm view` on 2026-05-06 | Optional counter storage for the app-layer quota path | Only required if Upstash Ratelimit is adopted. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Edge Config for launch-mode booleans | Vercel Flags `3.1.1` | Flags give richer targeting and environment controls, but Edge Config is the simpler and more stable fit for a single MVP kill switch. |
| Vercel WAF as the mandatory first rate limit | Upstash-only app limits | App-layer quotas are more testable, but WAF blocks bad traffic earlier and reduces waste before the request reaches OpenAI. |
| No client analytics SDK by default | PostHog, Amplitude, or Sentry SDKs | Richer observability increases privacy surface, implementation work, and the chance of leaking raw health-adjacent fields into third-party telemetry. |

**Installation:**

```bash
# Shared app stack once Phase 2/3 execution exists
npm install next@16.2.4 react@19.2.5 react-dom@19.2.5 openai@6.36.0 zod@4.4.3 @vercel/edge-config@1.4.3
npm install -D typescript@6.0.3 vitest@4.1.5 @playwright/test@1.59.1

# Optional only if Phase 4 chooses code-level quota counters in addition to WAF
npm install @upstash/ratelimit@2.0.8 @upstash/redis@1.38.0
```

## Architecture Patterns

### Recommended Project Structure

```text
app/
├── page.tsx                           # Existing public shell from Phase 3
├── api/
│   ├── check/
│   │   └── route.ts                   # Existing single inference route from Phase 2
│   └── health/
│       └── route.ts                   # Safe health / launch-state probe
middleware.ts                          # Edge Config launch gate / maintenance mode
lib/
├── revora/
│   ├── openai-client.ts               # Existing Phase 2 wrapper - Phase 4 hardens this
│   ├── telemetry.ts                   # Allowlisted coarse events only
│   ├── redaction.ts                   # Shared scrubbing helpers for logs/errors
│   ├── launch-controls.ts             # Edge Config reads, mode evaluation, operator thresholds
│   └── env.ts                         # Production / Preview env validation
tests/
├── unit/
│   └── revora/
│       ├── openai-client.test.ts
│       ├── telemetry.test.ts
│       ├── launch-controls.test.ts
│       └── env.test.ts
└── smoke/
    └── launch-controls.spec.ts
```

### Pattern 1: One Privacy Boundary on the Server

**What:** Raw food text and raw A1C should exist only inside the live request and the prompt input for the server-side model call. That boundary should be enforced in exactly one OpenAI client module and exactly one telemetry/logging module.

**When to use:** Always. This is the center of `PRIV-01`, `PRIV-02`, and `PRIV-03`.

**Example:**

```typescript
// Source: OpenAI data controls + Responses API docs, adapted to the Revora Phase 2 contract.
export async function createRevoraResponse(input: {
  food: string;
  a1c: number;
}) {
  return openai.responses.create({
    model: process.env.REVORA_MODEL ?? "gpt-5.4-mini",
    store: false,
    input: buildRevoraPrompt(input),
    text: {
      format: {
        type: "json_schema",
        name: "revora_output",
        schema: revoraModelJsonSchema,
        strict: true,
      },
    },
  });
}
```

### Pattern 2: Allowlist Telemetry Instead of Redacting After the Fact

**What:** Build telemetry payloads from a narrow TypeScript schema of safe fields. Do not create a rich event and then try to scrub it later.

**When to use:** Always for analytics, logging, incident events, and log drains.

**Example:**

```typescript
// Source: project privacy constraints plus Vercel log-drain field behavior.
export type SafeTelemetryEvent = {
  name: "check_completed" | "check_failed" | "launch_paused";
  risk?: "SAFE" | "MODERATE" | "HIGH";
  responseKind?: "result" | "clarify" | "not_food" | "out_of_scope" | "retry";
  latencyBucket?: "<2s" | "2-5s" | "5-12s" | ">12s";
  environment: "preview" | "production";
};

export function emitSafeEvent(event: SafeTelemetryEvent) {
  console.info(JSON.stringify(event));
}
```

### Pattern 3: Kill Switch Without Redeploy

**What:** Read a small launch-control document from Edge Config and gate the costly route before the OpenAI call.

**When to use:** Always for `OPS-02` and `OPS-03`.

**Recommended control keys:**

```json
{
  "launch_mode": "normal",
  "public_checks_enabled": true,
  "incident_message": "Revora is temporarily paused while we check a launch issue."
}
```

**Example:**

```typescript
// Source: Vercel Edge Config docs, adapted to the Revora check route.
import { get } from "@vercel/edge-config";

export async function evaluateLaunchMode() {
  const enabled = await get<boolean>("public_checks_enabled");

  if (enabled === false) {
    return {
      ok: false,
      status: 503,
      message: "Revora is temporarily paused while we check a launch issue.",
    };
  }

  return { ok: true as const };
}
```

### Pattern 4: Two-Layer Abuse And Cost Control

**What:** Use Vercel WAF as the mandatory first barrier and keep app-layer quota storage optional.

**When to use:** Always. The public, no-login check route needs an edge barrier before model spend.

**Recommended launch thresholds:**

- **Per-IP WAF rule:** Start with `10 requests / 10 minutes / IP` on `/api/check` in Production.
- **Global operator threshold:** If total checks exceed `2,000 / 24h`, or if provider/runtime failures spike, switch `public_checks_enabled` to `false` and review before reopening.
- **Harmful-guidance incident:** Pause immediately through Edge Config first. Rollback is secondary.

**Why these numbers:** The `~2,000 queries in 24 hours` threshold is already present in `.planning/PROJECT.md` as the MVP cost concern. The per-IP WAF limit is a conservative MVP default for a single-user meal-check flow, not a high-throughput API.

### Pattern 5: Preview-First Deployment And Verified Rollback

**What:** Preview and Production must be treated as separate operational surfaces. Validate kill switch, env vars, and privacy guards in Preview before promoting public traffic. During an incident, pause first, rollback second, verify third.

**When to use:** Always for `OPS-01` and `OPS-03`.

**Operational sequence:**

```bash
# Source: Vercel rollback production docs, adapted to the Revora runbook.
vercel logs --environment production --status-code 5xx --since 30m
vercel rollback
vercel rollback status
vercel logs --environment production --status-code 5xx --since 5m
```

**Important inference from official docs:** Vercel says environment-variable changes apply only to new deployments. Because rollback re-activates an older deployment, Phase 4 must verify that the restored deployment still has the expected env shape and privacy behavior before calling the incident resolved.

### Anti-Patterns To Avoid

- **Logging raw request bodies:** `console.log(req.json())`, prompt dumps, raw error serialization, or replay payload logging will leak health-adjacent data into Vercel logs and any downstream drains.
- **Scattered `store: false` usage:** Putting the flag on some calls but not all makes the privacy claim unauditable.
- **Using stateful Responses features casually:** `conversation`, `previous_response_id`, `background`, or hosted tools can introduce retention or state behavior that violates the MVP posture if added without review.
- **Client-only throttling:** A disabled button is not abuse protection.
- **Preview using production keys:** This collapses environment isolation and makes incident drills unsafe.
- **Rollback without verification:** Restoration is not proof; logs, env assumptions, and `/api/check` behavior still need to be checked.
- **Planning Phase 4 against imaginary code:** This repo does not yet contain the Phase 2 or 3 implementation artifacts, so execution must begin with a dependency check.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OpenAI storage opt-out | Ad hoc per-call flags spread across the app | One server-only OpenAI wrapper with `store: false` | Easy to audit and test; avoids one forgotten call reintroducing provider-side storage. |
| Emergency kill switch | DB-backed settings service or manual git revert | Edge Config | Works without adding a database and does not require waiting for a redeploy. |
| Perimeter rate limiting | Custom IP parsing and counters at the route edge | Vercel WAF Rate Limiting | Stops abusive traffic earlier and uses the platform's official edge control path. |
| Telemetry scrubbing | Regex-based cleanup after events are built | Allowlisted safe event schema | Safer and simpler than trying to scrub arbitrary rich payloads. |
| Rollback workflow | Ad hoc branch resets or redeploy guesses | Vercel rollback commands plus verification | Faster restoration path and consistent operator procedure. |
| Daily/global quota storage | In-memory counters on serverless functions | Upstash counters, if code-level quotas are actually needed | Serverless memory is not durable or shared. |

**Key insight:** In this phase, the dangerous custom work is not UI; it is inventing privacy and ops plumbing when the platform already provides the edge controls. Hand-rolled logging, flags, or rate limits are more likely to leak health-adjacent data or fail open under load.

## Common Pitfalls

### Pitfall 1: Treating "Not Used To Train" As The Whole Privacy Story

**What goes wrong:** Teams hear "API data is not used to train by default" and then assume there is no retention problem left to solve.

**Why it happens:** Training use, abuse-monitoring retention, and application-state retention are separate controls in OpenAI's docs.

**How to avoid:** Document both layers explicitly in Phase 4. Keep `store: false` on Responses calls and avoid adding features that persist state unintentionally.

**Warning signs:** Privacy docs say "not used to train" but never mention abuse-monitoring logs or Responses application state.

### Pitfall 2: Forgetting That Responses Store State By Default

**What goes wrong:** A new code path calls `responses.create()` without `store: false`, or adds `background` / `previous_response_id` during debugging.

**Why it happens:** The Responses API default is storage-enabled, and later feature additions often bypass the original wrapper.

**How to avoid:** Keep all model access behind one audited module and test for `store: false` explicitly.

**Warning signs:** More than one file imports the OpenAI SDK, or tests only validate happy-path JSON parsing and not request options.

### Pitfall 3: Leaking Raw Inputs Into Vercel Logs Or Log Drains

**What goes wrong:** Operators log raw request bodies, prompt text, or serialized exceptions. That data then lands in Vercel logs and any configured drain destination.

**Why it happens:** Console logging feels harmless in MVP code, but Vercel logs and drains preserve `message` fields and request metadata.

**How to avoid:** Log only allowlisted coarse events and scrub exception objects before logging.

**Warning signs:** `console.log(body)`, `console.error(error, input)`, or generic logger middleware around `/api/check`.

### Pitfall 4: Environment Drift Between Preview, Production, And Rollback

**What goes wrong:** Preview accidentally uses production keys, or a rollback re-activates an older deployment whose env assumptions no longer match the current operator expectation.

**Why it happens:** Vercel environments are separate, and env var changes only affect new deployments.

**How to avoid:** Create explicit Preview and Production env matrices, validate envs in code at startup, and verify env-sensitive behavior after rollback.

**Warning signs:** One `.env` shape copied everywhere, or rollback runbooks that do not include an env verification step.

### Pitfall 5: Making The Kill Switch Depend On A Redeploy

**What goes wrong:** The app can only be paused by editing env vars or shipping a new commit, which is too slow during an incident.

**Why it happens:** Env vars are the first configuration tool teams reach for, but they do not change old deployments and require a new deployment to take effect.

**How to avoid:** Use Edge Config for runtime kill-switch decisions and keep env vars for slower-moving secrets/config only.

**Warning signs:** The incident runbook starts with "change env vars and redeploy."

### Pitfall 6: Starting Phase 4 Before Phase 2 And 3 Exist

**What goes wrong:** The plan assumes files like `app/api/check/route.ts` or `lib/revora/openai-client.ts` exist, then Phase 4 work silently grows into rebuilding earlier phases.

**Why it happens:** The roadmap is sequential, but this checkout has not executed the earlier phases yet.

**How to avoid:** Make the first Phase 4 task a dependency gate that verifies the Phase 2 and 3 artifacts are real before editing them.

**Warning signs:** The repo has no `package.json`, no `app/`, and no `tests/`, but the implementation plan still assigns direct hardening edits to those paths.

## Code Examples

Verified patterns from official sources and the current project constraints:

### Explicit `store: false` On The Only OpenAI Path

```typescript
// Source: https://developers.openai.com/api/docs/guides/your-data
// and https://platform.openai.com/docs/api-reference/responses/retrieve
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createCheckResponse(payload: string) {
  return openai.responses.create({
    model: process.env.REVORA_MODEL ?? "gpt-5.4-mini",
    input: payload,
    store: false,
  });
}
```

### Safe Telemetry Builder

```typescript
// Source: project privacy constraints + Vercel log behavior docs.
type SafeRevoraEvent =
  | {
      name: "check_completed";
      resultKind: "result" | "clarify" | "not_food" | "out_of_scope" | "retry";
      risk?: "SAFE" | "MODERATE" | "HIGH";
      latencyBucket: "<2s" | "2-5s" | "5-12s" | ">12s";
      environment: "preview" | "production";
    }
  | {
      name: "launch_paused";
      reason: "abuse_threshold" | "cost_threshold" | "guidance_incident";
      environment: "preview" | "production";
    };

export function logSafeEvent(event: SafeRevoraEvent) {
  console.info(JSON.stringify(event));
}
```

### Edge Config Kill Switch Around `/api/check`

```typescript
// Source: https://vercel.com/docs/edge-config
import { NextResponse } from "next/server";
import { get } from "@vercel/edge-config";

export async function enforceLaunchMode() {
  const enabled = await get<boolean>("public_checks_enabled");

  if (enabled === false) {
    return NextResponse.json(
      {
        kind: "retry",
        message: "Revora is temporarily paused while we check a launch issue.",
      },
      { status: 503 },
    );
  }

  return null;
}
```

### Verified Rollback Sequence

```bash
# Source: https://vercel.com/docs/deployments/rollback-production-deployment
vercel logs --environment production --status-code 5xx --since 30m
vercel rollback
vercel rollback status
vercel logs --environment production --status-code 5xx --since 5m
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Treat "API data is not used to train" as the whole privacy answer | Separate training policy, abuse-monitoring retention, and application-state retention | Documented in OpenAI data-controls docs current on 2026-05-06 | Phase 4 must explicitly guard provider-side storage and not just training use. |
| Leave Responses storage defaults alone | Set `store: false` explicitly on every Responses call | Documented in current Responses API reference on 2026-05-06 | The MVP cannot make privacy-minimal claims if `store` is left implicit. |
| Redeploy to flip maintenance mode | Read launch controls from Edge Config at runtime | Documented in current Vercel Edge Config docs on 2026-05-06 | Kill switch becomes fast enough for a public AI incident. |
| App-only rate limiting | Put the first rate limit at the Vercel WAF edge | Documented in current Vercel WAF docs on 2026-05-06 | Reduces provider cost and blocks abuse earlier. |
| Roll back and assume the problem is fixed | Roll back, then verify logs and env-sensitive behavior | Documented in current Vercel rollback docs on 2026-05-06 | Prevents false recovery claims after a restore. |

**Deprecated/outdated:**

- Archived Revora docs that assume auth, saved history, A1C logging, or richer analytics are out of scope for this roadmap and should not drive Phase 4.
- "Log raw payloads for debugging" is incompatible with the active MVP privacy posture.

## Open Questions

1. **Should Phase 4 stop at Vercel-native controls, or add code-level daily quotas?**
   - What we know: Vercel WAF rate limiting is available on all plans, and the active project constraint already says to add rate limiting if usage exceeds roughly `2,000` queries in `24h`.
   - What's unclear: whether the founder wants that global threshold to be operator-driven from Vercel/OpenAI dashboards, or automatically enforced inside the app.
   - Recommendation: Make Vercel WAF + Edge Config mandatory. Add Upstash only if automated daily/global quotas are required in code.

2. **Does the MVP need any client analytics SDK at all?**
   - What we know: The active requirements only call for privacy-minimal telemetry such as pageviews, coarse result-class counts, or redacted operational events.
   - What's unclear: whether the founder wants more than lightweight operational visibility before Phase 5 community launch work.
   - Recommendation: Default to no client analytics SDK. If telemetry is needed, start with server-side coarse events only.

3. **Should Preview hit live OpenAI during Phase 4 verification?**
   - What we know: Preview is the right place to verify deploy behavior before public traffic, but using production keys in Preview weakens incident isolation.
   - What's unclear: whether a separate Preview key/project will exist by the time Phase 4 executes.
   - Recommendation: Plan a distinct Preview key or safe mock path. Do not let Preview share the same live key and controls as Production.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `4.1.5` + Playwright `1.59.1` |
| Config file | `vitest.config.ts`, `playwright.config.ts` - none exist yet, see Wave 0 |
| Quick run command | `npx vitest run tests/unit/revora/openai-client.test.ts tests/unit/revora/telemetry.test.ts tests/unit/revora/launch-controls.test.ts -x` |
| Full suite command | `npm run typecheck && npx vitest run tests/unit/revora tests/smoke && npx playwright test` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PRIV-01 | Raw food and raw A1C are not persisted outside the live request path by default | unit + integration | `npx vitest run tests/unit/revora/privacy-minimal.test.ts -x` | ❌ Wave 0 |
| PRIV-02 | Every OpenAI Responses call sets `store: false` | unit | `npx vitest run tests/unit/revora/openai-client.test.ts -t "store false" -x` | ❌ Wave 0 |
| PRIV-03 | Telemetry payloads reject raw food, raw A1C, prompt text, and model output | unit | `npx vitest run tests/unit/revora/telemetry.test.ts -x` | ❌ Wave 0 |
| PRIV-04 | Launch telemetry stays coarse and redacted | unit + smoke | `npx vitest run tests/unit/revora/telemetry.test.ts -t "coarse" -x` | ❌ Wave 0 |
| OPS-01 | App builds and deploy config is valid for Vercel Preview/Production | build smoke + manual deploy | `npm run build && npx vercel build` | ❌ Wave 0 |
| OPS-02 | WAF / launch-mode logic rate-limits or pauses traffic at the defined thresholds | unit + smoke | `npx vitest run tests/unit/revora/launch-controls.test.ts -x && npx playwright test tests/smoke/launch-controls.spec.ts -g "rate limit|maintenance mode"` | ❌ Wave 0 |
| OPS-03 | Kill-switch and rollback path is executable and verified | smoke + manual-only | `npx playwright test tests/smoke/launch-controls.spec.ts -g "maintenance mode"` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/unit/revora/openai-client.test.ts tests/unit/revora/telemetry.test.ts tests/unit/revora/launch-controls.test.ts -x`
- **Per wave merge:** `npm run typecheck && npx vitest run tests/unit/revora tests/smoke`
- **Phase gate:** Full suite green, Preview deployment verified, Production kill-switch drill performed, and rollback commands rehearsed before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `package.json` - required to install the locked Next/OpenAI/test stack
- [ ] `app/api/check/route.ts` - Phase 2 dependency must exist before Phase 4 can harden it
- [ ] `lib/revora/openai-client.ts` - Phase 2 dependency must exist before Phase 4 can enforce the no-store invariant
- [ ] `middleware.ts` - required for Edge Config launch gating if the kill switch is implemented at the request edge
- [ ] `tests/unit/revora/openai-client.test.ts` - proves `store: false`
- [ ] `tests/unit/revora/telemetry.test.ts` - proves raw fields never reach telemetry
- [ ] `tests/unit/revora/launch-controls.test.ts` - proves pause/rate-limit behavior
- [ ] `tests/smoke/launch-controls.spec.ts` - proves maintenance-mode UX and Preview behavior
- [ ] `vitest.config.ts` and `playwright.config.ts` - required test harness files
- [ ] `vercel` CLI setup and project link - required for local Preview/build validation

## Sources

### Primary (HIGH confidence)

- `.planning/STATE.md` - active roadmap decisions and current blocker language
- `.planning/ROADMAP.md` - Phase 4 goal, success criteria, and two-plan breakdown
- `.planning/REQUIREMENTS.md` - `PRIV-01` through `PRIV-04` and `OPS-01` through `OPS-03`
- `.planning/PROJECT.md` - MVP scope, no-login/stateless posture, and `~2,000 queries / 24h` cost concern
- `.planning/phases/03-public-mobile-permission-check/03-RESEARCH.md` - existing single-page public shell assumptions and stale-doc warning
- `.planning/phases/02-guardrailed-inference-core-and-eval-harness/02-01-PLAN.md` - single server-side OpenAI path and existing `store: false` expectation
- https://developers.openai.com/api/docs/guides/your-data - training, abuse-monitoring retention, and Responses application-state retention
- https://platform.openai.com/docs/api-reference/responses/retrieve - Responses API `store` parameter default
- https://vercel.com/docs/deployments/environments - Preview vs Production behavior
- https://vercel.com/docs/environment-variables - env changes apply only to new deployments
- https://vercel.com/docs/deployments/rollback-production-deployment - verified rollback sequence and post-rollback checks
- https://vercel.com/docs/instant-rollback - rollback side effects such as production auto-assignment pause
- https://vercel.com/docs/edge-config - no-redeploy runtime control path
- https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting - all-plan WAF rate limiting, default window/limit behavior, and production publish flow
- https://vercel.com/docs/drains/reference/logs - log-drain payload shape and the need to avoid raw message leakage

### Secondary (MEDIUM confidence)

- `npm view next version` - `16.2.4`
- `npm view openai version` - `6.36.0`
- `npm view typescript version` - `6.0.3`
- `npm view zod version` - `4.4.3`
- `npm view vitest version` - `4.1.5`
- `npm view @playwright/test version` - `1.59.1`
- `npm view @vercel/edge-config version` - `1.4.3`
- `npm view @upstash/ratelimit version` - `2.0.8`
- `npm view @upstash/redis version` - `1.38.0`

### Tertiary (LOW confidence)

- None

## Metadata

**Confidence breakdown:**

- Standard stack: MEDIUM - current docs and package versions are verified, but the repo has not yet executed the prerequisite phases that would host these controls.
- Architecture: MEDIUM - the privacy and ops patterns are solid, but exact file touch-points remain dependency-bound until Phase 2 and 3 exist in code.
- Pitfalls: HIGH - directly supported by current OpenAI and Vercel docs plus the active MVP scope docs.

**Research date:** 2026-05-06
**Valid until:** 2026-05-13
