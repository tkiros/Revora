/**
 * Launch-control contracts and threshold helpers for Revora (Plan 04-02)
 *
 * Reads Edge Config keys `launch_mode`, `public_checks_enabled`, and
 * `incident_message` when EDGE_CONFIG is present. Falls back to safe defaults
 * (normal mode, checks enabled) without invoking the SDK when EDGE_CONFIG is
 * absent.
 *
 * Non-production override seam: set REVORA_LAUNCH_MODE_OVERRIDE=paused to
 * simulate incidents in unit and smoke tests without mutating live Edge Config.
 * The override is deliberately NOT honoured when NODE_ENV is "production" or
 * VERCEL_ENV is "production".
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LaunchMode = "normal" | "paused";

export type LaunchControls = {
  launchMode: LaunchMode;
  publicChecksEnabled: boolean;
  incidentMessage: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_INCIDENT_MESSAGE =
  "Revora checks are temporarily paused. Please try again later.";

const PAUSE_COPY =
  "Revora checks are paused right now. Please try again in a few minutes.";

// ---------------------------------------------------------------------------
// Threshold helper
// ---------------------------------------------------------------------------

/**
 * shouldPauseForOps — operator-driven threshold helper.
 *
 * Returns true when any of the following conditions are met:
 *  - A harmful-guidance incident has been flagged (manual operator input)
 *  - A provider-failure spike has been detected (manual operator input)
 *  - Checks in the last 24 hours have reached or exceeded 2,000 (manual
 *    operator pause threshold)
 *
 * The middleware enforces the automatic Upstash-backed daily cap before model
 * spend. This helper remains for manual operator decisions, drills, and
 * dashboards that need to decide whether to flip Edge Config pause controls.
 */
export function shouldPauseForOps(input: {
  checksLast24h: number;
  harmfulGuidanceIncident: boolean;
  providerFailureSpike: boolean;
}): boolean {
  return (
    input.harmfulGuidanceIncident ||
    input.providerFailureSpike ||
    input.checksLast24h >= 2_000
  );
}

// ---------------------------------------------------------------------------
// Non-production override seam
// ---------------------------------------------------------------------------

function isProductionEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

function getOverrideMode(): LaunchMode | null {
  // Never honour the override in production to prevent accidental ops mistakes
  if (isProductionEnvironment()) {
    return null;
  }

  const override = process.env.REVORA_LAUNCH_MODE_OVERRIDE?.trim().toLowerCase();
  if (override === "paused") {
    return "paused";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Edge Config reader (fail-closed)
// ---------------------------------------------------------------------------

async function readEdgeConfigControls(): Promise<LaunchControls | null> {
  // Skip Edge Config entirely when connection string is absent
  if (!process.env.EDGE_CONFIG?.trim()) {
    return null;
  }

  try {
    // Dynamic import avoids a hard dependency on the SDK in environments
    // where EDGE_CONFIG is not configured (e.g. local dev, unit tests).
    const { get } = await import("@vercel/edge-config");

    const [launchModeRaw, publicChecksEnabledRaw, incidentMessageRaw] =
      await Promise.all([
        get<string>("launch_mode").catch(() => null),
        get<boolean>("public_checks_enabled").catch(() => null),
        get<string>("incident_message").catch(() => null)
      ]);

    // Interpret Edge Config values; any null falls back to safe default
    const launchMode: LaunchMode =
      launchModeRaw === "paused" ? "paused" : "normal";

    // public_checks_enabled defaults to true unless explicitly set to false
    const publicChecksEnabled =
      publicChecksEnabledRaw === false ? false : true;

    const incidentMessage =
      typeof incidentMessageRaw === "string" && incidentMessageRaw.trim()
        ? incidentMessageRaw.trim()
        : DEFAULT_INCIDENT_MESSAGE;

    return { launchMode, publicChecksEnabled, incidentMessage };
  } catch {
    // Provider errors (network, SDK bugs, auth) → fail closed to safe defaults
    // Do NOT propagate raw error text or stack traces
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * getLaunchControls — primary entry point.
 *
 * Resolution order:
 *  1. Non-production REVORA_LAUNCH_MODE_OVERRIDE (test / dev only)
 *  2. Edge Config (when EDGE_CONFIG is set and accessible)
 *  3. Safe defaults: normal mode, checks enabled, empty incident message
 *
 * Never throws. Errors from the Edge Config SDK are swallowed and the caller
 * receives safe defaults.
 */
export async function getLaunchControls(): Promise<LaunchControls> {
  // 1. Test/dev override seam
  const overrideMode = getOverrideMode();
  if (overrideMode !== null) {
    return {
      launchMode: overrideMode,
      publicChecksEnabled: overrideMode === "normal",
      incidentMessage: DEFAULT_INCIDENT_MESSAGE
    };
  }

  // 2. Edge Config (optional; fail closed)
  const edgeControls = await readEdgeConfigControls();
  if (edgeControls !== null) {
    return edgeControls;
  }

  // 3. Safe defaults
  return {
    launchMode: "normal",
    publicChecksEnabled: true,
    incidentMessage: ""
  };
}

/**
 * evaluateLaunchMode — used by middleware and the health probe.
 *
 * Returns:
 *  { ok: true,  controls }                              — normal mode
 *  { ok: false, status: 503, message, controls }        — paused mode
 *
 * The pause `message` is always safe, human-readable copy — never a raw
 * provider error, stack trace, or prompt/food text.
 */
export async function evaluateLaunchMode(): Promise<
  | { ok: true; controls: LaunchControls }
  | { ok: false; status: 503; message: string; controls: LaunchControls }
> {
  const controls = await getLaunchControls();

  if (controls.launchMode === "paused" || !controls.publicChecksEnabled) {
    const message =
      controls.incidentMessage?.trim() || PAUSE_COPY;

    return {
      ok: false,
      status: 503,
      message,
      controls
    };
  }

  return { ok: true, controls };
}
