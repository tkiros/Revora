import { useEffect, useState } from "react";
import { z } from "zod";

/**
 * Task 7 (P2.1) — the commercial contract is server-authoritative.
 *
 * The server resolves the paywall mode and prices in lib/server/pricing.ts and
 * serves them at GET /api/paywall. The client renders a price, plan, or mode
 * ONLY from a successfully-parsed instance of this schema — never a hard-coded
 * fallback ladder. If the config request fails, times out, or comes back
 * malformed, the surface shows a neutral pending/retry state and NO commercial
 * numbers, so the wall can never show a price or a mode the server did not
 * authorize (global constraints §6/§7: paid capabilities render from the server
 * response; a backend failure is an explicit unavailable state, never a
 * silently-different contract).
 */
// strictObject: an unknown extra field fails the parse, so the route contract
// test trips the moment the server body drifts from this exact shape.
export const PaywallConfigSchema = z.strictObject({
  mode: z.enum(["legacy", "trial"]),
  variant: z.enum(["999", "1299", "1999"]),
  priceDisplay: z.string().min(1),
  // Annual is offered only when its Stripe price is configured — the server
  // sends null (not a guessed price) when it is not.
  annualDisplay: z.string().min(1).nullable(),
  annualMonthlyEquivalent: z.string().min(1).nullable(),
  // AUD-009: server-resolved "this session is Premium/trialing" — the check
  // form skips the device-local taster gate/meter when true. Guests and any
  // resolution failure are false (the server wall remains the authority).
  entitled: z.boolean()
});

export type PaywallConfig = z.infer<typeof PaywallConfigSchema>;

export type PaywallConfigState =
  | { status: "pending" }
  | { status: "error" }
  | { status: "ready"; config: PaywallConfig };

// Authority must answer within this bound or the surface shows retry rather
// than a guessed contract. Exported so the timeout is testable with fake timers.
export const PAYWALL_CONFIG_TIMEOUT_MS = 8_000;

/**
 * Zod-parse an /api/paywall body. Returns the validated config, or null for any
 * malformed/partial body so the caller falls back to the pending/retry state
 * rather than a default price.
 */
export function parsePaywallConfig(json: unknown): PaywallConfig | null {
  const parsed = PaywallConfigSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

/**
 * Fetch the server commercial contract with a bounded timeout and validate it.
 * Never resolves to a default — the only success outcome carries a config that
 * passed the zod schema; everything else (non-OK, malformed, network, timeout)
 * is `{ status: "error" }`.
 */
export async function loadPaywallConfig(
  deps: { fetchImpl?: typeof fetch; timeoutMs?: number } = {}
): Promise<Extract<PaywallConfigState, { status: "ready" | "error" }>> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const timeoutMs = deps.timeoutMs ?? PAYWALL_CONFIG_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl("/api/paywall", {
      signal: controller.signal
    });
    if (!response.ok) {
      return { status: "error" };
    }
    const json: unknown = await response.json();
    const config = parsePaywallConfig(json);
    return config ? { status: "ready", config } : { status: "error" };
  } catch {
    return { status: "error" };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Hook wrapper: starts in `pending`, resolves to `ready`/`error`, and exposes a
 * `retry()` that re-runs the fetch (used by the neutral retry button). Consuming
 * components render prices only from `state.config` when `status === "ready"`.
 */
export function usePaywallConfig(): {
  state: PaywallConfigState;
  retry: () => void;
} {
  const [state, setState] = useState<PaywallConfigState>({ status: "pending" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void loadPaywallConfig().then((next) => {
      if (!cancelled) {
        setState(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return {
    state,
    // Reset to pending here (not in the effect) so a retry shows the neutral
    // loading state again before the refetch resolves.
    retry: () => {
      setState({ status: "pending" });
      setAttempt((n) => n + 1);
    }
  };
}
