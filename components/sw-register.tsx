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
    navigator.serviceWorker
      .register(`/sw.js?v=${encodeURIComponent(BUILD_ID)}`)
      .then((registration) => {
        // Surface updates without a hard interrupt: when a new SW takes over
        // (skipWaiting in sw.js), soft-refresh once so the session runs the
        // current build instead of straddling two. The `refreshed` latch
        // prevents a reload loop on browsers that fire the event repeatedly.
        registration.addEventListener("updatefound", () => {
          let refreshed = false;
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (refreshed) return;
            refreshed = true;
            window.location.reload();
          });
        });
      })
      .catch(() => {});
  }, []);
  return null;
}
