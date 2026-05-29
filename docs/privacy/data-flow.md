# Revora Privacy-Minimal Data Flow

## Purpose

Revora's public MVP keeps health-adjacent data inside the live request path only. Raw food descriptions and raw A1C values exist only long enough to validate the request, build the server prompt, and return a response.

## Raw-input lifetime

1. The browser sends `food` and `a1c` to `POST /api/check`.
2. `app/api/check/route.ts` parses the request body and delegates to `checkFood()` in `lib/revora/service.ts`.
3. `checkFood()` validates the payload, runs deterministic safety checks, and builds one in-memory prompt.
4. `lib/revora/openai-client.ts` makes the single Responses API call with `store: false`.
5. The parsed Revora response is returned to the browser.
6. Raw food, raw A1C, prompt text, and full model output are not written to default storage, analytics payloads, saved history, auth records, or database tables.

## No-default-storage boundary

Revora's Phase 4 launch boundary is:

- No auth or account-linked health data
- No saved history
- No database persistence for raw food or raw A1C
- No raw request-body logging
- No prompt text logging
- No full model output logging
- No client-side OpenAI access
- No second model-call path outside `app/api/check/route.ts -> lib/revora/service.ts -> lib/revora/openai-client.ts`

If future work adds storage, analytics, or another provider path, it must preserve this document's allowlist or explicitly replace it with an approved contract.

## Provider storage posture

Every Revora Responses API call must go through `lib/revora/openai-client.ts` and must set `store: false`.

```ts
client.responses.create({
  model,
  instructions,
  input,
  store: false,
  text: { format: { type: "json_schema" } }
});
```

This avoids default application-state storage where the OpenAI Responses API supports opt-out. Revora does **not** overclaim zero retention: provider-side abuse-monitoring logs can still exist even when `store: false` is set.

## Telemetry allowlist

Telemetry is limited to coarse operational fields only:

- event name
- environment
- response kind
- risk class
- latency bucket
- coarse reason code

Telemetry must exclude:

- raw food text
- raw A1C
- prompt text
- full model output
- user identifiers
- account identifiers

## Preview and Production boundary

Preview and Production are separate Vercel environments.

- Preview uses Preview-scoped environment variables for safe verification.
- Production uses Production-scoped environment variables for the public MVP.
- `OPENAI_API_KEY` is required in each server environment.
- Future Edge Config launch controls may be configured separately from the OpenAI key.
- Environment-variable changes apply to new deployments, so Preview and Production must be validated independently.

## Safe health probe

`GET /api/health` is the launch-state probe for Preview checks and later rollback verification.

It may expose only minimal non-secret JSON such as:

- `ok`
- `environment`
- `launch`

The probe must not expose secrets, raw inputs, prompt text, or model output.
