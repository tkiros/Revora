// Manual marketing-asset capture (Task 8.4). NOT a test — never runs in CI.
// Run it by hand after any UI/copy change so the assets never lag the product:
//
//   npx next dev           # dev server must be up on :3000
//   node scripts/capture-marketing-shots.mjs
//
// It opens /demo (a noindex fixtures page rendering the real components with
// ledger-approved copy) and screenshots every [data-shot] section at a phone
// and a store-listing viewport into marketing/screenshots/.
import { chromium } from "playwright";

const BASE_URL = process.env.DEMO_URL ?? "http://localhost:3000/demo";
const OUT_DIR = "marketing/screenshots";

const VIEWPORTS = [
  { name: "phone", width: 375, height: 812, deviceScaleFactor: 3 },
  { name: "store", width: 1080, height: 2340, deviceScaleFactor: 1 }
];

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  for (const section of await page.locator("[data-shot]").all()) {
    const name = await section.getAttribute("data-shot");
    await section.screenshot({ path: `${OUT_DIR}/${name}-${vp.name}.png` });
    console.log(`captured ${name}-${vp.name}.png`);
  }

  await page.close();
}

await browser.close();
console.log(`done → ${OUT_DIR}/`);
