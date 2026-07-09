import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // E2E-only lever: lets tests/smoke/trial-wall.spec.ts run a second `next dev`
  // (PAYWALL_MODE=trial, port 3101) alongside the default legacy server by
  // isolating its build dir + dev lock (Next 16 forbids two dev servers sharing
  // one distDir). Inert in every normal run — NEXT_DIST_DIR is unset, so this is
  // exactly ".next".
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // The Video Engine dashboard's detached child writes run.json ~1×/s under
  // video-engine/output/. Keep that out of the dev file-watcher so status
  // writes don't churn Fast Refresh. (webpack-dev only; under Turbopack the
  // run is a detached child and survives HMR regardless — ponytail: cosmetic there.)
  webpack: (config) => {
    const ignored = config.watchOptions?.ignored;
    const extra = "**/video-engine/output/**";
    config.watchOptions = {
      ...config.watchOptions,
      ignored: Array.isArray(ignored) ? [...ignored, extra] : extra,
    };
    return config;
  }
};

export default nextConfig;
