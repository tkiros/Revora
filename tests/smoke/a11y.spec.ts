import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Gate: zero critical/serious WCAG A/AA violations on the real rendered pages.
async function blockingViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  return results.violations
    .filter((v) => v.impact === "critical" || v.impact === "serious")
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s)`);
}

test("home page has no critical or serious a11y violations", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Should I eat this?" })
  ).toBeVisible();

  expect(await blockingViolations(page)).toEqual([]);
});

test("privacy page has no critical or serious a11y violations", async ({
  page
}) => {
  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { name: /how revora handles your data/i })
  ).toBeVisible();

  expect(await blockingViolations(page)).toEqual([]);
});

test("terms page has no critical or serious a11y violations", async ({
  page
}) => {
  await page.goto("/terms");
  await expect(
    page.getByRole("heading", { name: /terms of service/i })
  ).toBeVisible();

  expect(await blockingViolations(page)).toEqual([]);
});

test("result state has no critical or serious a11y violations", async ({
  page
}) => {
  await page.route("**/api/check", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        kind: "result",
        risk: "MODERATE",
        reason: "This leans carb-heavy for your range.",
        adjustment: "Add protein or nonstarchy vegetables.",
        swap: "Swap to brown rice if you can.",
        disclaimer: "Not medical advice."
      })
    });
  });

  await page.goto("/");
  await page.getByLabel(/what are you thinking about eating/i).fill("white rice");
  await page.getByLabel(/latest a1c/i).fill("6.1");
  await page.getByRole("button", { name: "Should I eat this?" }).click();
  await expect(page.getByTestId("result-card")).toBeVisible();

  expect(await blockingViolations(page)).toEqual([]);
});

test("error/status surface has no critical or serious a11y violations", async ({
  page
}) => {
  // 500 routes to the RequestStatus error surface — the same component used for
  // the submitting/slow/paused/network states.
  await page.route("**/api/check", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        kind: "retry",
        message: "x",
        disclaimer: "Not medical advice."
      })
    });
  });

  await page.goto("/");
  await page.getByLabel(/what are you thinking about eating/i).fill("white rice");
  await page.getByLabel(/latest a1c/i).fill("6.1");
  await page.getByRole("button", { name: "Should I eat this?" }).click();
  await expect(page.getByTestId("request-status")).toBeVisible();

  expect(await blockingViolations(page)).toEqual([]);
});
