"use client";

import { useEffect } from "react";

// RE-07: registering with the build id in the URL makes every deploy a new SW
// registration, so the offline page is re-cached (the SW derives its cache
// name from ?v=). NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA is inlined at build time
// on Vercel; "dev" locally, where staleness doesn't matter.
const BUILD_ID = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "dev";

export function SwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    // Production only. In dev the script is served no-store, so every page
    // load's update check yields a "new" worker; sw.js skipWaiting()s straight
    // into control, controllerchange fires, the handler below reloads, and the
    // fresh load registers again — an unbreakable ~5 reloads/second loop that
    // reads as the whole page flickering. The SW exists for the offline
    // fallback and push, neither of which dev needs.
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    // Surface updates without a hard interrupt: when a new SW takes over
    // (skipWaiting in sw.js), soft-refresh once so the session runs the
    // current build instead of straddling two.
    //
    // The latch and the listener are BOTH outside `updatefound` on purpose.
    // They used to live inside it, which meant every update installed another
    // controllerchange listener carrying its own fresh `refreshed = false` —
    // so the latch could never actually latch, and any browser that fired
    // updatefound more than once reloaded once per listener. One listener, one
    // latch, one reload per page lifetime.
    //
    // Wrapped because hoisting the listener out of register()'s promise chain
    // also hoisted it out of that chain's .catch(). Every call here used to be
    // async and best-effort by construction; a synchronous throw now lands in
    // the effect body and would take the whole page down with it. Registering
    // a service worker is a progressive enhancement — it must never be able to
    // break the page it is enhancing.
    try {
      let refreshed = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshed) return;
        refreshed = true;
        window.location.reload();
      });

      navigator.serviceWorker
        .register(`/sw.js?v=${encodeURIComponent(BUILD_ID)}`)
        .catch(() => {});
    } catch {
      // Stubbed or non-standard ServiceWorkerContainer: skip the offline
      // fallback and the soft refresh, keep the page alive.
    }
  }, []);
  return null;
}
