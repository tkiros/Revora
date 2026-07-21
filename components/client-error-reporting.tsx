"use client";

import { useEffect } from "react";

// P0.3: client-side error visibility. @sentry/browser was a dependency that
// nothing imported — every client error was silent. Env-gated exactly like
// the server side; fully inert without the DSN. Dynamically imported so the
// SDK never enters the bundle-critical path.
const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function ClientErrorReporting() {
  useEffect(() => {
    if (!DSN) {
      return;
    }
    import("@sentry/browser")
      .then((Sentry) => {
        Sentry.init({
          dsn: DSN,
          // Health privacy, mirroring lib/revora/sentry-capture.ts: the error
          // TYPE and stack locations are the diagnostic payload; messages,
          // breadcrumbs, query strings, and user context are stripped so meal
          // text, lab values, or account state can never ride along.
          maxBreadcrumbs: 0,
          beforeSend(event) {
            if (event.request?.url) {
              event.request.url = event.request.url.split("?")[0];
            }
            if (event.message) {
              event.message = "[redacted]";
            }
            for (const exception of event.exception?.values ?? []) {
              exception.value = "[redacted]";
            }
            delete event.user;
            return event;
          }
        });
      })
      .catch(() => {
        // Observability must never break the page.
      });
  }, []);
  return null;
}
