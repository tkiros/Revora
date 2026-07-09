import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // E2E-only lever: lets tests/smoke/trial-wall.spec.ts run a second `next dev`
  // (PAYWALL_MODE=trial, port 3101) alongside the default legacy server by
  // isolating its build dir + dev lock (Next 16 forbids two dev servers sharing
  // one distDir). Inert in every normal run — NEXT_DIST_DIR is unset, so this is
  // exactly ".next".
  distDir: process.env.NEXT_DIST_DIR || ".next"
  // Note: the Video Engine dashboard's run.json writes (~1×/s under
  // video-engine/output/) can churn Fast Refresh, but the run is a DETACHED
  // child and survives HMR regardless, so churn is cosmetic. A webpack
  // watchOptions.ignored was tried but Next 16 defaults to Turbopack (a webpack
  // config is a hard build error). Revisit with a turbopack-native ignore only
  // if the churn actually annoys.
};

export default nextConfig;
