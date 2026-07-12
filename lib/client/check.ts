import type { CheckRequest } from "../revora/schemas";
import { nextCoachRotation } from "./coach-rotation";
import type {
  CheckFailureCode,
  ClinicalRoute,
  RevoraUserResponse
} from "./ui-state";

// Everything the check endpoint itself can return: the UI union minus the
// `upsell` card, which the 402 path constructs rather than normalizing.
//
// Derived, not re-declared. This was previously a hand-copy of the same union,
// which is how a new response kind could be added to the engine and silently
// fail to reach the card — the normalizer below throws on any kind this type
// does not admit, and that throw surfaces as a retry card.
type ServerResponse = Exclude<RevoraUserResponse, { kind: "upsell" }>;

class CheckRequestError extends Error {
  code: CheckFailureCode;

  constructor(code: CheckFailureCode) {
    super(code);
    this.code = code;
  }
}

export async function submitCheck(
  input: CheckRequest,
  init?: {
    signal?: AbortSignal;
    // 4B: server-side meal memory metadata — never part of the engine request
    // body, so the engine contract stays untouched.
    clientId?: string;
    inputMethod?: "text" | "voice" | "photo";
  }
): Promise<RevoraUserResponse> {
  let response: Response;
  const rotation = nextCoachRotation();

  try {
    response = await fetch("/api/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(init?.clientId ? { "x-revora-client-id": init.clientId } : {}),
        ...(init?.inputMethod
          ? { "x-revora-input-method": init.inputMethod }
          : {}),
        // W-17: cycles the server's audited coach phrase bank so a daily user
        // is not shown the same three sentences every day.
        ...(rotation !== undefined
          ? { "x-revora-coach-rotation": String(rotation) }
          : {})
      },
      body: JSON.stringify(input),
      signal: getRequestSignal(init?.signal)
    });
  } catch (error) {
    throw normalizeFetchError(error);
  }

  if (response.status === 429) {
    throw new CheckRequestError("rate_limited");
  }

  // 402: the free-tier daily limit — a calm upsell body, not an error.
  if (response.status === 402) {
    try {
      const payload = (await response.json()) as Record<string, unknown>;
      if (
        payload.kind === "upsell" &&
        typeof payload.message === "string" &&
        typeof payload.disclaimer === "string"
      ) {
        return {
          kind: "upsell",
          upsellKind:
            payload.upsellKind === "trial" || payload.upsellKind === "legacy"
              ? payload.upsellKind
              : undefined,
          message: payload.message,
          disclaimer: payload.disclaimer
        };
      }
    } catch {
      // fall through to the generic error below
    }
    throw new CheckRequestError("server");
  }

  // Read the body defensively — a paused deploy may answer 503 with HTML (a CDN
  // maintenance page) or an empty body, which must not surface as a hard error.
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  // Fail closed on 503 (paused / unavailable): render the server's calm retry
  // copy only when it is a well-formed retry payload, otherwise generic pause
  // copy. Never a risk classification, never a raw error.
  if (response.status === 503) {
    const retry = asRetryResponse(payload);
    if (retry) {
      return retry;
    }
    throw new CheckRequestError("paused");
  }

  if (!response.ok) {
    throw new CheckRequestError("server");
  }

  if (payload === undefined) {
    throw new CheckRequestError("invalid_response");
  }

  return normalizeResponse(payload);
}

/**
 * Fail-closed extractor for the 503 path: returns the payload as a retry
 * response only when it is a well-formed `kind:"retry"` body. Anything else
 * (a risk result, malformed JSON, missing fields) yields null so the caller
 * shows generic pause copy instead of leaking a classification.
 */
function asRetryResponse(
  payload: unknown
): Extract<RevoraUserResponse, { kind: "retry" }> | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Record<string, unknown>;
  if (
    candidate.kind === "retry" &&
    typeof candidate.message === "string" &&
    typeof candidate.disclaimer === "string"
  ) {
    return {
      kind: "retry",
      message: candidate.message,
      disclaimer: candidate.disclaimer
    };
  }

  return null;
}

function normalizeResponse(payload: unknown): RevoraUserResponse {
  if (!payload || typeof payload !== "object" || !("kind" in payload)) {
    throw new CheckRequestError("invalid_response");
  }

  const response = payload as Record<string, unknown>;

  switch (response.kind) {
    case "result":
      if (
        isRisk(response.risk) &&
        typeof response.reason === "string" &&
        (typeof response.adjustment === "string" || response.adjustment === null) &&
        (typeof response.swap === "string" || response.swap === null) &&
        typeof response.disclaimer === "string"
      ) {
        return {
          kind: "result",
          risk: response.risk,
          reason: response.reason,
          adjustment: response.adjustment,
          swap: response.swap,
          // Coach outputs are additive card content — tolerate their absence
          // (older cached responses) instead of failing the whole check.
          sequencingTip: asNullableString(response.sequencingTip),
          postMealAction: asNullableString(response.postMealAction),
          keepMost: asNullableString(response.keepMost),
          disclaimer: response.disclaimer
        } satisfies ServerResponse;
      }
      break;
    case "clarify":
      if (
        typeof response.question === "string" &&
        typeof response.disclaimer === "string"
      ) {
        return {
          kind: "clarify",
          question: response.question,
          disclaimer: response.disclaimer
        } satisfies ServerResponse;
      }
      break;
    case "not_food":
      if (
        Array.isArray(response.examples) &&
        response.examples.every((example) => typeof example === "string") &&
        typeof response.disclaimer === "string"
      ) {
        return {
          kind: "not_food",
          examples: response.examples,
          disclaimer: response.disclaimer
        } satisfies ServerResponse;
      }
      break;
    case "out_of_scope":
      if (
        typeof response.message === "string" &&
        typeof response.disclaimer === "string"
      ) {
        return {
          kind: "out_of_scope",
          reason: response.message,
          disclaimer: response.disclaimer
        } satisfies ServerResponse;
      }
      break;
    case "clinical":
      // A clinical route that fails to normalize would fall through to the
      // throw below and surface as a retry card — i.e. the user in a medical
      // situation would be invited to rephrase their meal. Validate only what
      // the card needs to render, and keep an unrecognised `route` renderable
      // rather than fatal.
      if (
        typeof response.message === "string" &&
        typeof response.route === "string" &&
        typeof response.disclaimer === "string"
      ) {
        return {
          kind: "clinical",
          route: response.route as ClinicalRoute,
          message: response.message,
          disclaimer: response.disclaimer
        } satisfies ServerResponse;
      }
      break;
    case "retry":
      if (
        typeof response.message === "string" &&
        typeof response.disclaimer === "string"
      ) {
        return {
          kind: "retry",
          message: response.message,
          disclaimer: response.disclaimer
        } satisfies ServerResponse;
      }
      break;
  }

  throw new CheckRequestError("invalid_response");
}

function getRequestSignal(signal?: AbortSignal) {
  const timeoutSignal = AbortSignal.timeout(12_000);

  if (!signal) {
    return timeoutSignal;
  }

  return AbortSignal.any([signal, timeoutSignal]);
}

function normalizeFetchError(error: unknown) {
  if (
    error instanceof DOMException &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  ) {
    return new CheckRequestError("timeout");
  }

  if (error instanceof Error && error.name === "TimeoutError") {
    return new CheckRequestError("timeout");
  }

  if (error instanceof TypeError) {
    return new CheckRequestError("network");
  }

  return new CheckRequestError("server");
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function isRisk(value: unknown): value is "SAFE" | "MODERATE" | "HIGH" {
  return value === "SAFE" || value === "MODERATE" || value === "HIGH";
}
