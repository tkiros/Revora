import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Dashboard smoke (M1): FirstRunGate regression, guest day-0, guest with
// data, and the >=1024px shell. Both configured projects are mobile devices,
// so desktop assertions set the viewport explicitly.

// Same cold-compile shield as a11y.spec.ts: warm the routes serially first.
test.describe.configure({ retries: 2 });

test.beforeAll(async ({ playwright }) => {
  const request = await playwright.request.newContext({
    baseURL: "http://127.0.0.1:3100"
  });
  try {
    for (const route of ["/home", "/check", "/onboarding"]) {
      await request.get(route, { timeout: 90_000 }).catch(() => {});
    }
  } finally {
    await request.dispose();
  }
});

function moderateResult() {
  return {
    kind: "result",
    risk: "MODERATE",
    reason: "This leans heavily on refined carbs.",
    adjustment: "If practical, add protein or nonstarchy vegetables.",
    swap: "If you have the option, swap to a less refined version.",
    disclaimer: "Not medical advice."
  };
}

async function stubModerate(page: Page) {
  await page.route("**/api/check", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(moderateResult())
    });
  });
}

test("CRITICAL REGRESSION: brand-new visitor at /home is routed to onboarding", async ({
  page
}) => {
  // Empty localStorage = no checks, no profile, no taster → FirstRunGate fires.
  await page.goto("/home");
  await expect(page).toHaveURL(/\/onboarding/);
});

test("guest day-0 dashboard: preview note, CTA above the fold, top bar only", async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/home?stay=1");

  await expect(page.getByTestId("dash-day0-note")).toBeVisible();
  const cta = page.getByTestId("dash-check-cta");
  await expect(cta).toBeVisible();

  // Decision #8: at <768px the check CTA is the first interactive element
  // above the fold.
  const box = await cta.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(667);

  await expect(page.locator(".app-topbar")).toBeVisible();
  await expect(page.locator(".app-tabbar")).toBeVisible();
  await expect(page.locator(".app-sidebar")).toBeHidden();

  // C7 four-jobs: five tab slots, the accent Check action among them.
  await expect(page.locator(".app-tabbar .app-tab")).toHaveCount(5);
  await expect(page.locator(".app-tabbar .app-tab-action")).toHaveText(/Check/);
});

test("guest dashboard fills in from on-device history", async ({ page }) => {
  await stubModerate(page);
  await page.goto("/check?stay=1");
  await page
    .getByLabel(/what are you thinking about eating/i)
    .fill("white rice with beans");
  await page.getByLabel(/latest a1c/i).fill("6.1");
  await page.getByRole("button", { name: "Check this meal" }).click();
  await expect(page.getByTestId("result-card")).toBeVisible();

  await page.goto("/home?stay=1");
  await expect(page.getByTestId("dash-summary")).toContainText(
    "1 meal checked this week."
  );
  await expect(page.getByTestId("today-list")).toContainText(
    "white rice with beans"
  );

  // C7: Home is "help me decide now" — exactly one next-action line, and the
  // week strip / insight / progress surfaces live on /journey, not here.
  await expect(page.getByTestId("next-action")).toHaveCount(1);
  await expect(page.getByTestId("dash-week")).toHaveCount(0);
  await expect(page.getByTestId("dash-insight")).toHaveCount(0);
  await expect(page.getByTestId("dash-progress")).toHaveCount(0);

  // RV-3: no score/band/percent language on Home.
  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/%/);
  expect(text).not.toMatch(/excellent|on track|building|getting started/i);
});

test("desktop shell: sidebar nav with aria-current, skip link focuses content", async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/home?stay=1");

  await expect(page.locator(".app-sidebar")).toBeVisible();
  await expect(page.locator(".app-topbar")).toBeHidden();

  const home = page.locator('.app-sidebar .app-navlink[aria-current="page"]');
  await expect(home).toHaveText(/Home/);

  // Skip link is the shell's first focusable.
  await page.keyboard.press("Tab");
  await expect(page.locator(".app-skip")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#app-content")).toBeFocused();
});

test("dashboard has no critical or serious a11y violations at both shell widths", async ({
  page
}) => {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/home?stay=1");
    await expect(page.getByTestId("dashboard")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = results.violations
      .filter((v) => v.impact === "critical" || v.impact === "serious")
      .map((v) => `${width}px: ${v.id} (${v.impact}): ${v.nodes.length} node(s)`);
    expect(serious).toEqual([]);
  }
});
