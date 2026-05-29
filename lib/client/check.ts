import type { CheckRequest } from "../revora/schemas";
import type { CheckFailureCode, RevoraUserResponse } from "./ui-state";

type ServerResponse =
  | {
      kind: "result";
      risk: "SAFE" | "MODERATE" | "HIGH";
      reason: string;
      adjustment: string | null;
      swap: string | null;
      disclaimer: string;
    }
  | {
      kind: "clarify";
      question: string;
      disclaimer: string;
    }
  | {
      kind: "not_food";
      examples: string[];
      disclaimer: string;
    }
  | {
      kind: "out_of_scope";
      reason: string;
      disclaimer: string;
    }
  | {
      kind: "retry";
      message: string;
      disclaimer: string;
    };

class CheckRequestError extends Error {
  code: CheckFailureCode;

  constructor(code: CheckFailureCode) {
    super(code);
    this.code = code;
  }
}

export async function submitCheck(
  input: CheckRequest,
  init?: { signal?: AbortSignal }
): Promise<RevoraUserResponse> {
  let response: Response;

  try {
    response = await fetch("/api/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new CheckRequestError("invalid_response");
  }

  if (!response.ok) {
    throw new CheckRequestError("server");
  }

  return normalizeResponse(payload);
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

function isRisk(value: unknown): value is "SAFE" | "MODERATE" | "HIGH" {
  return value === "SAFE" || value === "MODERATE" || value === "HIGH";
}
