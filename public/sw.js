const CACHE = "revora-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  // No clients.claim(): claiming the current page mid-session makes WebKit hang on the
  // next navigation. The offline fallback only needs to run on reopen — a fresh
  // navigation the already-active SW controls without claiming.
});

// Daily nudge (P5): render the push payload and open the app on tap. One
// gentle reminder a day — the server enforces the cadence; the SW only
// displays what it's sent.
self.addEventListener("push", (event) => {
  let payload = {
    title: "Revora",
    body: "Ready for today? Check your first meal.",
    class: "generic",
    stage: "none"
  };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // keep the default copy on a malformed payload
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "revora-daily-nudge", // same tag: never stacks duplicates
      // Bounded routing metadata only (no health text) — read on click so the
      // app can emit nudge_opened {class, stage} (§10.1).
      data: { class: payload.class, stage: payload.stage }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const params = new URLSearchParams();
  params.set("nudge", typeof data.class === "string" ? data.class : "generic");
  params.set("stage", typeof data.stage === "string" ? data.stage : "none");
  const target = `/check?${params.toString()}`;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      // Focus an open tab and route it to the check page with the nudge params;
      // otherwise open a fresh window there.
      const existing = wins.find((w) => "focus" in w);
      if (existing) {
        if ("navigate" in existing) existing.navigate(target).catch(() => {});
        return existing.focus();
      }
      return clients.openWindow(target);
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never intercept POST /api/check
  if (request.mode !== "navigate") return; // only navigations get the offline fallback
  // Network-first: real page when online, cached offline page only when the fetch fails.
  event.respondWith(
    (async () => {
      try {
        return await fetch(request);
      } catch {
        const cache = await caches.open(CACHE);
        return (await cache.match(OFFLINE_URL)) || Response.error();
      }
    })()
  );
});
