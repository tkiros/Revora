import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // E2E-only lever: lets tests/smoke/trial-wall.spec.ts run a second `next dev`
  // (PAYWALL_MODE=trial, port 3101) alongside the default legacy server by
  // isolating its build dir + dev lock (Next 16 forbids two dev servers sharing
  // one distDir). Inert in every normal run — NEXT_DIST_DIR is unset, so this is
  // exactly ".next".
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // A stray ~/package-lock.json (unrelated home-dir tooling) makes Next infer
  // the wrong workspace root and warn about multiple lockfiles (E2E-08).
  // Pin the root to this repo.
  turbopack: { root: __dirname },
  // SEC-04 (QA round 2026-07-10): baseline security headers. CSP notes:
  // - script/style 'unsafe-inline' is required by Next's inline runtime unless
  //   we move to nonce-based CSP via middleware.
  // - Umami is the ONE third-party script we embed (app/layout.tsx, env-gated).
  //   Its origin is derived from the SAME env var the layout reads, for both
  //   the script tag and the tracker's POST beacons — without it the WTP
  //   funnel's analytics silently die under this CSP.
  // - connect-src includes Vercel Blob because pantry photos upload directly
  //   from the browser (@vercel/blob/client, components/pantry-intake-flow.tsx).
  // - camera/microphone stay self-allowed: photo check input + voice input.
  headers: async () => {
    let umamiOrigin: string | null = null;
    try {
      umamiOrigin = process.env.NEXT_PUBLIC_UMAMI_SRC
        ? new URL(process.env.NEXT_PUBLIC_UMAMI_SRC).origin
        : null;
    } catch {
      umamiOrigin = null;
    }
    const umami = umamiOrigin ? ` ${umamiOrigin}` : "";
    return [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            `script-src 'self' 'unsafe-inline'${umami}`,
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' blob: data: https://*.blob.vercel-storage.com https://*.public.blob.vercel-storage.com",
            "font-src 'self' data:",
            `connect-src 'self' https://*.blob.vercel-storage.com https://blob.vercel-storage.com${umami}`,
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'"
          ].join("; ")
        },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(self), microphone=(self), geolocation=()"
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains"
        }
      ]
    }
  ];
  }
  // Note: the Video Engine dashboard's run.json writes (~1×/s under
  // video-engine/output/) can churn Fast Refresh, but the run is a DETACHED
  // child and survives HMR regardless, so churn is cosmetic. A webpack
  // watchOptions.ignored was tried but Next 16 defaults to Turbopack (a webpack
  // config is a hard build error). Revisit with a turbopack-native ignore only
  // if the churn actually annoys.
};

export default nextConfig;
