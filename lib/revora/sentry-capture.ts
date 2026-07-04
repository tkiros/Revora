import * as Sentry from "@sentry/node";

/**
 * Single capture seam for Revora's two error-swallowing catch sites
 * (service.ts model catch, check route catch). Both swallow on purpose to return
 * calm retry copy, so the error is otherwise invisible.
 *
 * Tags are the ONLY diagnostic payload — PII-free by construction
 * (`errorClass` / `httpStatus`), which is why beforeSend can fully redact the
 * message.
 *
 * Two guarantees, because this runs on the request's LAST recovery path:
 *  - Never throws/rejects. A Sentry SDK fault must not break the calm-retry
 *    contract — all SDK work is wrapped and failures are swallowed.
 *  - Awaits flush. On Vercel the function can freeze the moment the response is
 *    sent, dropping un-flushed events; `flush(1000)` delivers before return. The
 *    1s ceiling is deliberate vs the request budget (openai-client 10s timeout,
 *    client abort 12s, route maxDuration 15s): on the model-error path the worst
 *    case is 10s + 1s = 11s, still under the 12s abort, and an event that can't
 *    flush in 1s won't in 2s. The browser already showed retry by 12s regardless.
 * Both `captureException` and `flush` are no-ops without `SENTRY_DSN` (no client
 * is configured), so dev/test and DSN-less prod pay nothing.
 */
export async function captureServerError(
  error: unknown,
  stage: "model" | "route"
): Promise<void> {
  try {
    const tags: Record<string, string> = {
      stage,
      errorClass:
        (error as { constructor?: { name?: string } })?.constructor?.name ??
        "Unknown"
    };
    const status = (error as { status?: unknown })?.status;
    if (typeof status === "number") {
      tags.httpStatus = String(status);
    }

    Sentry.captureException(error, { tags });
    await Sentry.flush(1000);
  } catch {
    // Observability must never break the request path — drop the event silently.
  }
}
