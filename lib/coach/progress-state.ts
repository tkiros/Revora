/**
 * Pure state resolver for the Progress / BAI page (plan §P2.5, §4.6, global
 * constraint 7: "a backend failure must never render as a paywall/upsell").
 *
 * The progress page previously collapsed EVERY failure — network error, 5xx,
 * malformed JSON, and 401 — into the "locked" Premium upsell. That renders an
 * outage as a sales pitch and tells a signed-out user to buy rather than sign
 * in. This resolver keeps the states honest and is unit-testable without any
 * component-render infrastructure: the component only owns the fetch + the
 * JSX; the ok|guest|error → state decision lives here.
 */

export type ProgressState =
  | "loading"
  | "unauthenticated"
  | "free"
  | "empty"
  | "ready"
  | "unavailable";

export type LatestBai = {
  weekStart: string;
  score: number;
  adherence: number;
  consistency: number;
  action: number;
  prompted: number;
};

/**
 * A normalized description of what the /api/coach fetch produced. `network`
 * means the fetch itself threw (offline / DNS / abort); `response` means an
 * HTTP response came back — `body` is the parsed JSON, or `null` when the body
 * could not be parsed (malformed / non-JSON).
 */
export type CoachFetchResult =
  | { outcome: "network" }
  | { outcome: "response"; ok: boolean; status: number; body: unknown };

export type ProgressResolution = {
  state: ProgressState;
  latestBai: LatestBai | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asLatestBai(value: unknown): LatestBai | null {
  if (!isRecord(value)) {
    return null;
  }
  const { weekStart, score, adherence, consistency, action, prompted } = value;
  if (
    typeof weekStart === "string" &&
    typeof score === "number" &&
    typeof adherence === "number" &&
    typeof consistency === "number" &&
    typeof action === "number" &&
    typeof prompted === "number"
  ) {
    return { weekStart, score, adherence, consistency, action, prompted };
  }
  return null;
}

/**
 * Map a coach fetch outcome to a page state. The cardinal rule: only a
 * successful (2xx, well-formed) response may ever produce free/empty/ready.
 * Anything else is unauthenticated (401) or unavailable — never an upsell.
 */
export function resolveProgressState(
  result: CoachFetchResult
): ProgressResolution {
  const unavailable: ProgressResolution = {
    state: "unavailable",
    latestBai: null
  };

  // fetch threw → the backend is unreachable, not "locked".
  if (result.outcome === "network") {
    return unavailable;
  }

  // Signed-out is its own state: prompt sign-in, never sell.
  if (result.status === 401) {
    return { state: "unauthenticated", latestBai: null };
  }

  // Any other non-2xx (5xx, and defensively 4xx like 403/404/500) is an
  // outage, not a paywall.
  if (!result.ok) {
    return unavailable;
  }

  // 2xx but the body could not be parsed / is not an object → malformed.
  if (!isRecord(result.body)) {
    return unavailable;
  }

  // A well-formed success response is the ONLY path that can produce the
  // honest upsell (free) or the data states (empty/ready).
  if (result.body.tier !== "premium") {
    return { state: "free", latestBai: null };
  }

  const latestBai = asLatestBai(result.body.latestBai);
  if (!latestBai) {
    return { state: "empty", latestBai: null };
  }

  return { state: "ready", latestBai };
}
