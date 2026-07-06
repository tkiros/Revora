import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // E2E-only lever: lets tests/smoke/trial-wall.spec.ts run a second `next dev`
  // (PAYWALL_MODE=trial, port 3101) alongside the default legacy server by
  // isolating its build dir + dev lock (Next 16 forbids two dev servers sharing
  // one distDir). Inert in every normal run — NEXT_DIST_DIR is unset, so this is
  // exactly ".next".
  distDir: process.env.NEXT_DIST_DIR || ".next"
};

export default nextConfig;
