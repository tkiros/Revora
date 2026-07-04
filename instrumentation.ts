/**
 * Next.js server bootstrap hook (stable in Next 16 — no config flag needed).
 * Initializes Sentry on the Node runtime ONLY, so the SDK never loads on the
 * Edge middleware or in the browser. daily_cap / rate_limited fire on the edge
 * and stay log-only signals by design (see docs/ops/launch-controls.md).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      await import("./sentry.server.config");
    } catch (error) {
      // Observability is optional — a Sentry init failure must never crash the
      // server bootstrap. Log and continue without error capture.
      console.warn("Sentry init skipped:", error);
    }
  }
}
