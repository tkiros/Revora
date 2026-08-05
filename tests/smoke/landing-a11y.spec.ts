import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// The marketing landing "/" was the one owned route the a11y gate never
// scanned: a11y.spec.ts's "home page" test navigates to /check?stay=1, so the
// whole landing surface — and every a11y fix shipped in the 2026-07-28
// design-review round — sat outside the axe gate. This file closes that gap.
// It is a separate spec on purpose: a11y.spec.ts covers the signed-out app
// shell and its signed-in describe block, and its fixtures do not apply here.

// Same gate as a11y.spec.ts: zero critical/serious WCAG A/AA violations.
async function blockingViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  return results.violations
    .filter((v) => v.impact === "critical" || v.impact === "serious")
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s)`);
}

test("landing page has no critical or serious a11y violations", async ({
  page
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Check your first meal — free" }).first()
  ).toBeVisible();

  expect(await blockingViolations(page)).toEqual([]);
});

// The skip link's whole job is MOVING FOCUS, not scrolling. An href alone
// scrolls and leaves focus on <body>, so the next Tab returns the user to the
// top of the page — the exact trap the link exists to avoid. That failure is
// invisible to axe and to jsdom (no layout, no real focus model), so it can
// only be pinned in a browser. Regression guard for 92bf229 (tabIndex={-1} on
// the target) and 55fc2ab (the link moved outside <main>).
test("landing skip link moves focus to the hero, not just scroll", async ({
  page
}) => {
  await page.goto("/");

  const skip = page.locator("a.app-skip");
  await expect(skip).toHaveAttribute("href", "#landing-hero");

  // A skip link inside the landmark it skips is announced as main content.
  expect(
    await skip.evaluate((el) => el.closest("main") !== null)
  ).toBe(false);

  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("#landing-hero")).toBeFocused();
});

// Semantics axe cannot assert: axe checks that landmarks are labelled, not that
// this particular footer is a navigation landmark, and role="list" survives the
// list-style-none flattening Safari applies. Both were shipped in 35b6366.
test("landing landmarks and list semantics stay intact", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Footer" })).toBeVisible();

  // The hero trust strip is still a list to AT with list-style stripped. This
  // assertion targeted `ul.landing-glance` until 2026-08-05, when the glance
  // strip was deleted; the invariant it proves is about the CSS flattening, not
  // about that one list, so it was retargeted rather than dropped.
  await expect(page.locator("ul.landing-trust-strip")).toHaveAttribute(
    "role",
    "list"
  );
});
