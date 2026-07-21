import type { NextConfig } from "next";

// P0.3: a production deploy without measurement is a silent analytics outage —
// the funnel reads as zero and nobody notices. Fail the BUILD when production
// is missing the analytics env, unless the owner explicitly waives it
// (REVORA_ALLOW_NO_MEASUREMENT=1) for a deliberate dark launch. The Sentry
// client DSN is warn-only until one is provisioned — client error reporting
// missing is bad, but not worth blocking a deploy the analytics gate allows.
if (
  process.env.VERCEL_ENV === "production" &&
  process.env.REVORA_ALLOW_NO_MEASUREMENT !== "1"
) {
  const missing = [
    !process.env.NEXT_PUBLIC_UMAMI_SRC && "NEXT_PUBLIC_UMAMI_SRC",
    !process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && "NEXT_PUBLIC_UMAMI_WEBSITE_ID"
  ].filter((v): v is string => Boolean(v));
  if (missing.length > 0) {
    throw new Error(
      `Production build without measurement: set ${missing.join(", ")} ` +
        "(or REVORA_ALLOW_NO_MEASUREMENT=1 to deploy dark deliberately)."
    );
  }
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn(
      "⚠ NEXT_PUBLIC_SENTRY_DSN is not set — client-side errors will be " +
        "invisible in production. Provision a Sentry DSN and add it to Vercel."
    );
  }
  // Flag server twins: a NEXT_PUBLIC flag baked ON with its runtime twin unset
  // means the feature ships with a kill switch that does nothing. Fail the
  // build so the mismatch can never ship silently.
  const twinMismatch = [
    process.env.NEXT_PUBLIC_PHOTO_INPUT === "1" &&
      process.env.PHOTO_INPUT_ENABLED !== "1" &&
      "PHOTO_INPUT_ENABLED",
    process.env.NEXT_PUBLIC_LONGITUDINAL_INSIGHTS === "1" &&
      process.env.LONGITUDINAL_INSIGHTS_ENABLED !== "1" &&
      "LONGITUDINAL_INSIGHTS_ENABLED"
  ].filter((v): v is string => Boolean(v));
  if (twinMismatch.length > 0) {
    throw new Error(
      `NEXT_PUBLIC flag is "1" but its server twin is unset: set ${twinMismatch.join(", ")}=1 ` +
        "(the server twin is the runtime kill switch; without it the flag cannot be turned off without a rebuild)."
    );
  }
}

const nextConfig: NextConfig = {
  // E2E-only lever: lets tests/smoke/trial-wall.spec.ts run a second `next dev`
  // (PAYWALL_MODE=trial, port 3101) alongside the default legacy server by
  // isolating its build dir + dev lock (Next 16 forbids two dev servers sharing
  // one distDir). Inert in every normal run — NEXT_DIST_DIR is unset, so this is
  // exactly ".next".
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // C7 four-jobs restructure (2026-07-21): old bookmarks and deep links keep
  // working. /memory folded into /meals as its "Saved meals" section.
  redirects: async () => [
    { source: "/history", destination: "/meals", permanent: true },
    { source: "/memory", destination: "/meals", permanent: true },
    { source: "/progress", destination: "/journey", permanent: true }
  ],
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
