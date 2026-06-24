import type { ErrorEvent } from "@sentry/node";

/**
 * beforeSend scrubber — the last line of defense before any error event leaves
 * the box. Revora's non-negotiable invariant: no raw `food` / `a1c` / prompt /
 * model `output_text` (and no IP) may ever reach a third party.
 *
 * The init config (sentry.server.config.ts) already disables the dangerous
 * integrations at the source (`defaultIntegrations: false`), so request bodies,
 * console/http breadcrumbs, and local-variable capture never load. This function
 * is belt-and-suspenders over the two vectors that survive a naive denylist:
 *   - stacktrace frame `vars` — the `prompt` local at the service throw site
 *     holds food + a1c.
 *   - the exception `value` (message) — a ZodError on model output can echo
 *     `output_text`.
 * The message is fully redacted; triage granularity comes from the PII-free tags
 * (`stage` / `errorClass` / `httpStatus`) set at the capture sites instead.
 */
export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  delete event.request; // body (food/a1c) / headers / cookies / query
  delete event.user; // ip
  delete event.server_name; // hostname
  delete event.extra; // we never set PII extra; belt
  delete event.contexts; // belt: any future setContext() can't become a leak
  delete event.message; // belt: any future captureMessage() can't become a leak
  delete event.breadcrumbs; // console/http breadcrumbs

  for (const ex of event.exception?.values ?? []) {
    if (ex.value !== undefined) {
      ex.value = "[redacted]"; // a message (even "") can echo model output_text
    }
    for (const frame of ex.stacktrace?.frames ?? []) {
      delete frame.vars; // local vars: the prompt = food + a1c
    }
  }

  return event;
}
