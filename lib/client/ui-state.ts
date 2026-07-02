export type RevoraRisk = "SAFE" | "MODERATE" | "HIGH";

export type RevoraUserResponse =
  | {
      kind: "result";
      risk: RevoraRisk;
      reason: string;
      adjustment: string | null;
      swap: string | null;
      sequencingTip: string | null;
      postMealAction: string | null;
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
    }
  | {
      // 4D free-tier limit reached — calm upsell, rendered like a card
      kind: "upsell";
      message: string;
      disclaimer: string;
    };

export type CheckUiState =
  | { kind: "idle" }
  | { kind: "invalid"; message: string }
  | { kind: "submitting" }
  | { kind: "slow" }
  | { kind: "done"; response: RevoraUserResponse }
  | { kind: "error"; message: string };

export type CheckFailureCode =
  | "timeout"
  | "rate_limited"
  | "paused"
  | "network"
  | "retry"
  | "server"
  | "invalid_response";

export type CheckFailure = {
  code: CheckFailureCode;
};

const SLOW_THRESHOLD_MS = 5_000;

export function isSlowThresholdReached(
  startedAt: number,
  now: number = Date.now()
) {
  return now - startedAt >= SLOW_THRESHOLD_MS;
}

export function mapCheckFailure(failure: unknown) {
  const code = getFailureCode(failure);

  switch (code) {
    case "timeout":
      return "This check took longer than expected. Please try again.";
    case "rate_limited":
      return "Revora is helping a lot of people right now. Please try again in a moment.";
    case "paused":
      return "Revora checks are paused for maintenance right now. Please try again in a few minutes.";
    case "network":
      return "We couldn't reach Revora just now. Please check your connection and try again.";
    case "retry":
    case "server":
    case "invalid_response":
    default:
      return "Revora couldn't finish that check. Please try again.";
  }
}

function getFailureCode(failure: unknown): CheckFailureCode | null {
  if (!failure || typeof failure !== "object") {
    return null;
  }

  const maybeCode = "code" in failure ? failure.code : null;

  if (typeof maybeCode !== "string") {
    return null;
  }

  switch (maybeCode) {
    case "timeout":
    case "rate_limited":
    case "paused":
    case "network":
    case "retry":
    case "server":
    case "invalid_response":
      return maybeCode;
    default:
      return null;
  }
}
