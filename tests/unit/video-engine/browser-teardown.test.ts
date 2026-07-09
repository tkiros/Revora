import { describe, it, expect } from "vitest";
import { trackBrowser, untrackBrowser, closeTrackedBrowsers, _liveCount } from "../../../video-engine/browser-teardown";

// A crashed/killed detached render must not orphan Chromium: the parent unref()s the render
// child, so nothing else reaps it — the teardown path must close every still-live browser.
describe("browser teardown (orphaned-Chromium cleanup — the named critical gap)", () => {
  it("closes every tracked browser, but not one a finished render already untracked", () => {
    let closedLive = false, closedFinished = false;
    trackBrowser({ close: () => { closedLive = true; } });
    const finished = { close: () => { closedFinished = true; } };
    trackBrowser(finished);
    untrackBrowser(finished); // a normally-completed render removes its own handle

    closeTrackedBrowsers(); // the signal/crash-handler path

    expect(closedLive).toBe(true);      // the still-live browser is reaped → no orphan
    expect(closedFinished).toBe(false); // the finished one is not double-closed
    expect(_liveCount()).toBe(0);       // registry drained
  });

  it("a throwing close() does not stop the others from closing (best-effort teardown)", () => {
    let closedSecond = false;
    trackBrowser({ close: () => { throw new Error("browser already gone"); } });
    trackBrowser({ close: () => { closedSecond = true; } });
    expect(() => closeTrackedBrowsers()).not.toThrow();
    expect(closedSecond).toBe(true);
    expect(_liveCount()).toBe(0);
  });
});
