// video-engine/render.ts
// Drives Remotion (headless Chromium, local). No LLM in the render path — a pure
// deterministic function of the approved spec. NEVER imported by a route (spawn-not-import):
// it pulls in the bundler + Chromium, which must never reach the serverless build.
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, ensureBrowser, openBrowser } from "@remotion/renderer";
import type { VideoSpec } from "./schema";
import { templateFor } from "./template";
import { trackBrowser, untrackBrowser, installBrowserTeardown } from "./browser-teardown";

const ENTRY = fileURLToPath(new URL("./remotion/index.ts", import.meta.url));

// Prefer a system Chrome (env override, then common paths) so a network-restricted host
// doesn't have to download one. Falls back to Remotion's managed Chromium via ensureBrowser().
function findChrome(): string | undefined {
  const candidates = [
    process.env.REMOTION_BROWSER_EXECUTABLE,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/opt/google/chrome/chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  return candidates.find((p): p is string => !!p && fs.existsSync(p));
}

// Bundle once per process, not per spec (§ render.ts: "built once and cached").
let bundlePromise: Promise<string> | null = null;
function getBundle(): Promise<string> {
  bundlePromise ??= bundle({ entryPoint: ENTRY });
  return bundlePromise;
}

/** Render one approved spec to a 9:16 H.264 master at `outFile`. Returns the path.
 *  Owns its Chromium instance (via openBrowser) so browser-teardown can reap it if this
 *  detached child is killed/crashes mid-render — otherwise the unref()'d parent orphans Chrome. */
export async function renderSpec(spec: VideoSpec, outFile: string): Promise<string> {
  const { compositionId, inputProps } = templateFor(spec);
  const browserExecutable = findChrome() ?? null;
  if (!browserExecutable) await ensureBrowser(); // no system Chrome → let Remotion fetch one
  const serveUrl = await getBundle();
  const chromiumOptions = { gl: "angle" as const };

  installBrowserTeardown();
  const browser = await openBrowser("chrome", { browserExecutable, chromiumOptions });
  trackBrowser(browser);
  try {
    const composition = await selectComposition({ serveUrl, id: compositionId, inputProps, puppeteerInstance: browser });
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: outFile,
      inputProps,
      puppeteerInstance: browser,
      chromiumOptions,
    });
    return outFile;
  } finally {
    untrackBrowser(browser);
    await browser.close({ silent: false });
  }
}
