// video-engine/browser-teardown.ts
// Orphaned-Chromium cleanup. The /render route spawns run.ts DETACHED and unref()s it, so if the
// render child is killed (SIGTERM/SIGINT) or crashes (uncaughtException) mid-render, nothing reaps
// the headless Chromium it launched — it orphans. We own the browser handles and close them on the
// way out. Pure (no Remotion import) so it's unit-testable without launching Chrome.
// Loose over Remotion's HeadlessBrowser (its .close requires a { silent } arg). any is the
// right call for a 3rd-party adapter; we pass { silent } below and fakes ignore it.
type Closeable = { close: (...args: any[]) => unknown };

const live = new Set<Closeable>();
let installed = false;

export function trackBrowser(b: Closeable): void { live.add(b); }
export function untrackBrowser(b: Closeable): void { live.delete(b); }

/** Close every still-live browser, best-effort (one bad handle must not block the rest). */
export function closeTrackedBrowsers(): void {
  for (const b of [...live]) {
    try { b.close({ silent: true }); } catch { /* browser may already be gone — keep reaping */ }
    live.delete(b);
  }
}

/** Register signal/crash handlers ONCE so a killed/crashed detached render leaves no orphan Chrome.
 *  Kept out of trackBrowser so tests exercise the registry without wiring process signals. */
export function installBrowserTeardown(): void {
  if (installed) return;
  installed = true;
  const bail = (code: number) => () => { closeTrackedBrowsers(); process.exit(code); };
  process.once("SIGTERM", bail(1));
  process.once("SIGINT", bail(1));
  process.once("uncaughtException", (e) => { console.error("[video-engine] render crashed:", e); closeTrackedBrowsers(); process.exit(1); });
  process.once("exit", closeTrackedBrowsers); // normal exit safety net
}

/** test seam */
export function _liveCount(): number { return live.size; }
