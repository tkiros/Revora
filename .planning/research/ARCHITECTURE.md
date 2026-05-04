# Architecture Research

**Domain:** Permission-first prediabetes AI food checker (text-only mobile-first MVP)
**Researched:** 2026-05-04
**Confidence:** HIGH

## Standard Architecture

### System Overview

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Browser / CDN Layer                                                 │
├──────────────────────────────────────────────────────────────────────┤
│  Next.js page            Result renderer        Optional pageviews   │
│  Mobile form             Loading/error states   Vercel Analytics     │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ HTTPS POST /api/check
┌───────────────────────────────▼──────────────────────────────────────┐
│ App Router API Layer (Vercel Function, Node.js runtime)             │
├──────────────────────────────────────────────────────────────────────┤
│  Request schema      Policy gate         Rate/abuse gate            │
│  A1C validation      Edge cases          WAF or middleware          │
│  Text normalization  Footer merge        Request IDs                │
└───────────────┬───────────────────────────────┬──────────────────────┘
                │                               │
                │                               │ optional async emit
┌───────────────▼─────────────────────┐  ┌──────▼──────────────────────┐
│ Inference Service                    │  │ Privacy-Preserving         │
├──────────────────────────────────────┤  │ Telemetry Sink             │
│ Prompt composer                      │  ├────────────────────────────┤
│ OpenAI Responses API call            │  │ Pageviews or enum-only     │
│ Structured JSON output               │  │ aggregates                 │
│ Output guardrail + fallback          │  │ No raw food / no raw A1C   │
└───────────────┬──────────────────────┘  └────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────────────┐
│ External AI Services                                                │
├──────────────────────────────────────────────────────────────────────┤
│ OpenAI Responses API          Optional OpenAI Moderation API         │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Mobile UI shell | Capture `food` + `a1c`, render result, loading, clarification, and failure states | Next.js App Router page with a small client component |
| Check API | Single public backend entrypoint for inference requests | `app/api/check/route.ts` `POST` handler |
| Validation and policy layer | Enforce payload shape, A1C bounds, input length, edge-case routing, disclaimer rules | Shared TypeScript module with schema validation and deterministic guards |
| Inference service | Compose prompt, call model, deserialize structured output | Server-only OpenAI client wrapper |
| Output guardrail | Reject malformed model output, apply conservative fallback, enforce SAFE/MODERATE/HIGH contract | Server-only post-processor |
| Telemetry boundary | Emit aggregate usage data without storing raw food text or raw A1C | Vercel pageviews, or enum-only server events to a small store |
| Rate/abuse control | Protect cost and uptime during spikes or misuse | Vercel WAF rule first, middleware/store-backed limiter second |
| Review loop | Catch false SAFE outputs before wider launch | Manual founder review plus fixture-based evals |

## Recommended Project Structure

```text
app/
├── layout.tsx                  # Shell, metadata, optional pageview analytics
├── page.tsx                    # Single-screen mobile UI
└── api/
    └── check/
        └── route.ts            # Public POST endpoint
components/
├── food-check-form.tsx         # Inputs, submit, local state
├── result-card.tsx             # SAFE / MODERATE / HIGH rendering
└── inline-error.tsx            # Friendly recoverable failures
lib/
├── env.ts                      # Required env vars and runtime config
├── schemas/
│   ├── check-request.ts        # Input contract
│   └── check-response.ts       # Structured output contract
├── revora/
│   ├── policy.ts               # A1C bands, edge-case rules, disclaimer rules
│   ├── prompt.ts               # Prompt text and examples
│   ├── service.ts              # Orchestrates validation -> model -> guardrail
│   └── fallback.ts             # Conservative fallback responses
├── openai/
│   ├── client.ts               # Server-side API client
│   └── moderation.ts           # Optional abuse screening hook
├── rate-limit/
│   └── limiter.ts              # No-op locally, pluggable in prod
└── telemetry/
    ├── events.ts               # Enum-only event names and payloads
    └── redact.ts               # Removes or buckets sensitive values
tests/
├── contract/                   # Route and schema tests
├── evals/                      # Known-food safety cases
└── fixtures/                   # Safe / borderline / high-risk examples
```

### Structure Rationale

- **`app/`:** Keep the delivery surface tiny: one page and one API route.
- **`lib/revora/`:** Put domain rules outside React so prompt tuning does not bleed into UI code.
- **`lib/openai/`:** Preserve a clean seam for model/version swaps.
- **`lib/telemetry/`:** Make privacy handling explicit instead of hiding it in UI handlers.
- **`tests/evals/`:** Safety regressions matter more than component complexity for this MVP.

## Architectural Patterns

### Pattern 1: Thin BFF Monolith

**What:** One Next.js deployment owns both the mobile UI and the inference endpoint.
**When to use:** Greenfield MVP, no auth, no database-backed profiles, no background jobs.
**Trade-offs:** Fastest path to ship and easiest Vercel deployment; less reusable when the future scanner/mobile product needs image ingestion and persistent data.

**Example:**
```typescript
// app/api/check/route.ts
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json(await checkFood(body));
}
```

### Pattern 2: Schema-First AI Contract

**What:** Treat the model like a typed dependency, not a prose generator. The server requests structured output and validates it again before rendering.
**When to use:** Always for health-adjacent classification flows.
**Trade-offs:** Slightly more setup; much safer UI behavior and clearer fallbacks.

**Example:**
```typescript
const responseFormat = {
  type: 'json_schema',
  name: 'revora_result',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['kind'],
    properties: {
      kind: { enum: ['result', 'clarify', 'not_food', 'out_of_range'] },
      risk: { enum: ['SAFE', 'MODERATE', 'HIGH'] },
      message: { type: 'string' },
      tip: { type: 'string' },
      swap: { type: 'string' },
    },
  },
};
```

### Pattern 3: Guardrail Sandwich

**What:** Deterministic rules run before and after the model call.
**When to use:** Inputs can be noisy, but the response contract must stay conservative.
**Trade-offs:** More backend logic; lower risk of harmful SAFE classifications and broken UX.

**Instead of:** Sending raw input straight to the model and rendering whatever returns.

### Pattern 4: Telemetry Off the Critical Path

**What:** Inference succeeds even if analytics or counters fail.
**When to use:** Early-stage product where learning matters, but uptime and privacy matter more.
**Trade-offs:** Analytics may be incomplete; user-facing latency stays predictable.

## Data Flow

### Request Flow

```text
[User enters food text + A1C]
    ↓
[Client validation: required fields, numeric A1C, disable double submit]
    ↓ HTTPS POST JSON body
[app/api/check/route.ts]
    ↓
[Schema validation + policy gate]
    ↓
[Optional rate limit / optional moderation]
    ↓
[Prompt composer + OpenAI Responses API]
    ↓
[Structured JSON result]
    ↓
[Output validation + disclaimer merge + conservative fallback]
    ↓ JSON
[Browser renders result / clarify / safe failure]
```

### State Management

```text
[Local component state]
    ↓
[Form input, loading, result, error]
    ↺
[Submit action resets or replaces state]
```

Use local component state only. Do not add a client global store for this MVP.

### Key Data Flows

1. **Guidance flow:** Raw `food` text and `a1c` exist in browser memory, transit in a `POST` body, live briefly in function memory, and are discarded after the response unless the team later opts into explicit storage.
2. **Telemetry flow:** If enabled, the server emits only derived fields such as `risk`, `a1c_band`, `latency_bucket`, `error_type`, and maybe coarse `food_category`. Do not emit verbatim food text or exact A1C.
3. **Safety review flow:** Early production outputs feed a manual review checklist and test fixtures, not a user-facing database.

## Safety and Error Boundaries

| Boundary | What it owns | Notes |
|----------|--------------|-------|
| Client validation | Empty input, malformed A1C, duplicate submits | UX improvement only; not a trust boundary |
| API schema validation | Unsupported methods, bad JSON, oversized or malformed payloads | Use `POST` only; return typed `400/405` errors |
| Domain policy gate | A1C outside 5.7-6.4, obvious non-food text, ambiguous text, carbs-only cases | Deterministic short-circuit or explicit route into the prompt |
| Abuse/rate boundary | Traffic spikes, scraping, malicious input patterns | Use Vercel WAF first if traffic justifies it |
| Model contract boundary | Format drift, missing fields, over-generated prose | Structured outputs plus server parse/validate |
| Output guardrail | Unsafe SAFE result shape, missing disclaimer, invalid swap/tip combinations | Fall back to conservative copy rather than raw model text |
| User-facing failure boundary | Slow model, timeout, 429, provider error | Return friendly retryable copy, never raw stack traces |
| Human oversight boundary | Harmful classifications that escape automated checks | Manual review of first 50 results and ongoing spot checks |

## Deployment and Runtime Implications

- **Use one Vercel project.** Static assets and the single page go through the CDN; inference runs in one App Router route handler.
- **Keep the check route on the Node.js runtime.** Next.js route handlers default to Node.js, and the Edge runtime has a more limited API surface. That makes Node.js the lower-risk default for the server-side OpenAI integration.
- **Prefer a single US function region for the MVP.** Vercel functions default to `iad1` (Washington, D.C.). That is a good starting point for a US-first launch and simpler than multi-region behavior.
- **Do not use query parameters for food text or A1C.** Keep inputs in a `POST` body so they do not leak into URLs, referrers, or analytics.
- **Keep the OpenAI key server-side only.** The browser never calls the model provider directly.
- **Set the Responses API call to a non-persistent mode.** OpenAI’s data controls docs show that API data is not used for training by default, but abuse-monitoring logs can be retained up to 30 days, and Responses API application state can also be retained unless retention controls are configured. For Revora’s MVP, explicitly avoid additional storage behavior and do not rely on Zero Data Retention unless it is actually approved and configured.
- **Telemetry plan depends on Vercel plan.** Vercel pageviews are privacy-friendly on all plans, but Vercel custom events are documented as Pro/Enterprise only. On Hobby, richer telemetry needs a separate lightweight sink.
- **Redact or disable analytics on sensitive paths.** If Vercel Analytics is enabled, use its redaction/`beforeSend` hooks or full opt-out path so food text and A1C never ride in URLs or custom event payloads.
- **Replace old `Vercel KV` assumptions.** Current Vercel storage guidance routes KV/Redis needs through Marketplace providers such as Upstash. Do not anchor the MVP architecture to older first-party KV assumptions.

## Suggested Build Order

1. **Define the contract first**
   - Create request/response schemas, A1C bands, edge-case categories, and conservative fallback copy.
   - Dependency reason: UI and API should both target the same contract before prompt iteration starts.

2. **Build the inference core second**
   - Implement prompt composition, structured output parsing, disclaimer merge, and conservative fallback behavior.
   - Dependency reason: this is the product logic and should exist before polishing transport or visuals.

3. **Wrap the core in the public API route**
   - Add `POST /api/check`, typed errors, request IDs, optional moderation hook, and method guards.
   - Dependency reason: manual testing and Vercel deployment both depend on a stable endpoint.

4. **Build the mobile UI shell**
   - Create the single-screen form, loading state, clarification state, and friendly error copy.
   - Dependency reason: the UI is simple once the response contract is stable.

5. **Add cost and abuse controls**
   - Enable WAF rate limiting if traffic starts spiking, or add a small middleware-backed limiter with Marketplace storage.
   - Dependency reason: not needed to validate a tiny launch, but needed before a viral post or broader sharing.

6. **Add optional privacy-preserving telemetry**
   - Start with Vercel pageviews. If richer insight is required, add enum-only aggregates in a small server-side store.
   - Dependency reason: learning matters, but analytics should not block shipping the guidance loop.

7. **Run safety review before broader distribution**
   - Test the first 20-50 foods, then manually review the first production outputs against the SAFE false-positive risk.
   - Dependency reason: this MVP is trust-sensitive; review is part of the architecture, not just QA.

## MVP Boundary vs Future Product

### MVP Scope

- Text input only
- One-shot guidance request
- No auth
- No user history
- No image upload
- No background jobs
- No primary database required

### Future Scanner / Mobile Product Scope

- Camera or image ingestion pipeline
- Auth and user profiles
- Meal history and persistent storage
- Push notifications and background processing
- CGM integrations
- Admin/review tooling beyond manual founder review

**Architectural rule:** do not build scanner-era abstractions into the Permission MVP. The future product will need a different ingestion layer and persistent data model, but that should be introduced only after the permission-first text flow has proven demand.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single Vercel project, one route handler, no database, pageview analytics only |
| 1k-25k users | Add WAF rate limiting, richer redacted telemetry, stronger eval coverage, possible aggregate store |
| 25k+ users or scanner transition | Split persistent backend concerns from the web shell, add auth/profile storage, add image/object storage, add review/ops tooling |

### Scaling Priorities

1. **First bottleneck:** Safety quality, not compute. Prompt drift or unsafe SAFE calls are more dangerous than raw function limits.
2. **Second bottleneck:** Abuse and cost spikes. Solve with rate limiting before introducing broader infrastructure.

## Anti-Patterns

### Anti-Pattern 1: Building the Scanner Architecture Now

**What people do:** Add upload flows, object storage, auth, and mobile-app abstractions before validating the text product.
**Why it's wrong:** It burns the 72-hour budget on the wrong uncertainty.
**Do this instead:** Keep the MVP text-only and stateless.

### Anti-Pattern 2: Letting the Browser Talk to OpenAI Directly

**What people do:** Call the model provider from client code to move faster.
**Why it's wrong:** Exposes secrets, removes policy control, and makes rate limiting harder.
**Do this instead:** Route all inference through one server endpoint.

### Anti-Pattern 3: Logging Raw Food Text or Exact A1C

**What people do:** Ship query analytics or raw request logging by default.
**Why it's wrong:** Health-adjacent data leaks into logs and third-party tooling unnecessarily.
**Do this instead:** Store only redacted buckets or derived enums, and keep telemetry optional.

### Anti-Pattern 4: Rendering Unvalidated Model Prose

**What people do:** Render whatever the model returns as markdown or plain text.
**Why it's wrong:** Breaks UX consistency and weakens safety boundaries.
**Do this instead:** Require structured output, then validate and normalize it server-side.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| OpenAI Responses API | Server-to-server call with structured output contract | Configure explicit non-persistent behavior; keep prompt versioned |
| OpenAI Moderation API | Optional preflight screening for abusive or clearly unsafe misuse | Useful for abuse control, not a substitute for domain policy |
| Vercel Functions | Single Node.js route handler | Good fit for I/O-bound AI calls; region can be pinned |
| Vercel Web Analytics | Pageview analytics on all plans | Privacy-friendly; custom events require Pro/Enterprise; use redaction hooks if enabled |
| Vercel WAF | Project-level rate limiting when traffic justifies it | Available on all plans |
| Upstash / Neon / Supabase | Optional aggregate counters or telemetry sink | Only if richer telemetry is needed beyond pageviews |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| UI ↔ API | JSON over HTTP | UI must not import server prompt or policy code |
| API ↔ inference service | Direct function call | Keeps route thin and testable |
| Inference service ↔ telemetry | Fire-and-forget async call | Telemetry failure must not fail inference |
| MVP ↔ future scanner/mobile | Separate product phase boundary | Avoid fake extensibility for features not being built |

## Sources

- Local context: `.planning/PROJECT.md`
- Local context: `docs/revora-design-20260404-070350.md`
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Next.js runtime config: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
- Next.js Edge runtime caveats: https://nextjs.org/docs/pages/api-reference/edge
- OpenAI Structured Outputs: https://developers.openai.com/api/docs/guides/structured-outputs
- OpenAI data controls: https://developers.openai.com/api/docs/guides/your-data
- OpenAI Responses create reference: https://developers.openai.com/api/reference/resources/responses/methods/create
- OpenAI Moderations reference: https://developers.openai.com/api/reference/resources/moderations
- OpenAI safety best practices: https://platform.openai.com/docs/guides/safety-best-practices
- Vercel Functions: https://vercel.com/docs/functions
- Vercel function regions: https://vercel.com/docs/functions/configuring-functions/region
- Vercel WAF rate limiting: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- Vercel Web Analytics: https://vercel.com/docs/analytics
- Vercel custom events: https://vercel.com/docs/analytics/custom-events
- Vercel analytics redaction: https://vercel.com/docs/analytics/redacting-sensitive-data
- Vercel storage overview: https://vercel.com/docs/storage
- Vercel Marketplace KV landing page: https://vercel.com/kv

---
*Architecture research for: Revora Permission MVP*
*Researched: 2026-05-04*
