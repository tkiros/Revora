"use client";

import { useEffect } from "react";

import { captureFirstTouchUtm } from "../lib/client/attribution";

// Mounted once in the root layout: records the first-touch UTM channel
// (already mapped to the closed enum — see lib/client/attribution.ts) no
// matter which page a shared link lands on. Renders nothing.
export function AttributionCapture() {
  useEffect(() => {
    captureFirstTouchUtm(window.location.search);
  }, []);

  return null;
}
