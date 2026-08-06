#!/usr/bin/env node
// Captures the two web-manifest screenshots from the running dev server.
// Usage: npx next dev --port 3100 &  then  node scripts/capture-manifest-screenshots.mjs
import { chromium } from "@playwright/test";

const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3100";
// ⛔ The second shot was `/how-it-works` until 2026-08-05 and MUST NOT go back.
// That page carries the CDC DPP trial and its 58% figure — legitimately, it is
// the one surface exempt from the `study-association` ban (DESIGN.md rail 6).
// But a manifest screenshot is not that surface: it renders inside browser
// install prompts and app-store-style listings, which are marketing. The
// capture put a banned statistic on a marketing surface by way of a PNG, where
// no copy audit can see it — `claims-boundary-copy.test.ts` scans source, not
// pixels. `/check` is the app itself, needs no session (taster mode), and is
// what an install prompt should show anyway.
const SHOTS = [
  { path: "/", file: "public/screenshot-check.png" },
  { path: "/check?stay=1", file: "public/screenshot-result.png" }
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 750, height: 1334 } });
for (const shot of SHOTS) {
  await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: shot.file });
  console.log(`captured ${shot.file}`);
}
await browser.close();
