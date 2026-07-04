#!/usr/bin/env node
// Captures the two web-manifest screenshots from the running dev server.
// Usage: npx next dev --port 3100 &  then  node scripts/capture-manifest-screenshots.mjs
import { chromium } from "@playwright/test";

const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3100";
const SHOTS = [
  { path: "/", file: "public/screenshot-check.png" },
  { path: "/how-it-works", file: "public/screenshot-result.png" }
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 750, height: 1334 } });
for (const shot of SHOTS) {
  await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: shot.file });
  console.log(`captured ${shot.file}`);
}
await browser.close();
