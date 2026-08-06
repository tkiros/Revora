#!/usr/bin/env node
// Captures the landing page's right-column artwork from the running app.
//
// Owner instruction 2026-08-05: fill the landing's empty right columns with
// "fresh screenshots captured from the running app" rather than illustrations.
// These are REAL app routes at a phone viewport, not mockups.
//
// ⚠️ These PNGs go stale on every UI change and are versioned assets. Re-run
// this script whenever the captured routes change:
//   npm run build && npm run start &
//   node scripts/capture-landing-art.mjs
//
// Phone viewport at deviceScaleFactor 2 on purpose: the column renders around
// 390px wide, so a 1280px desktop capture scaled down would be illegible. A
// phone-shaped capture reads at 1:1 there and is retina-sharp.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3000";
const SHOTS = [
  // ?stay=1 defeats FirstRunGate's redirect to /onboarding, the same way the
  // e2e warmup does it. Without it a fresh context captures onboarding.
  // clipH lands in the GAP between the answer placeholder card (ends ~684) and
  // the "New here?" card (starts 716). Cutting a card mid-sentence reads as a
  // broken image, not a screenshot. Re-derive after any /check layout change.
  { path: "/check?stay=1", file: "public/landing/app-check.png", clipH: 700 }
];

await mkdir("public/landing", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2
});
for (const shot of SHOTS) {
  await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: shot.file,
    clip: { x: 0, y: 0, width: 390, height: shot.clipH }
  });
  console.log(`captured ${shot.file}`);
}
await browser.close();
