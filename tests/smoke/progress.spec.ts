import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Progress/BAI smoke (plan P6). `/api/coach` is mocked directly with
 * page.route (same approach as tests/smoke/a11y.spec.ts and
 * billing-pages.spec.ts) — no real session/DB needed to exercise the three
 * page states: premium-with-data, premium-empty, and locked (free/guest).
 */

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const serious = results.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact ?? "")
  );
  expect(serious).toEqual([]);
}

test("premium user with a computed week sees the band and qualitative bars", async ({
  page
}) => {
  await page.route("**/api/coach", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        streak: 3,
        weekView: [],
        insight: null,
        tier: "premium",
        latestBai: {
          weekStart: "2026-06-29",
          score: 72,
          adherence: 71,
          consistency: 60,
          action: 100,
          prompted: 5
        }
      })
    });
  });

  await page.goto("/progress");

  await expect(page.getByTestId("progress-bands")).toBeVisible();
  await expect(page.getByTestId("progress-bands")).toContainText("On track");
  await expect(page.getByText("Check-in days")).toBeVisible();
  await expect(page.getByText("Check-in rhythm")).toBeVisible();
  await expect(page.getByText("Follow-through")).toBeVisible();
  await expect(page.getByTestId("bai-no-prompts")).toHaveCount(0);

  // claims boundary: no banned words rendered on the page
  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/revers|cure|treat|prevent|guarantee|FDA/i);

  await expectNoSeriousViolations(page);
});

test("premium user with zero risky checks this week sees calm no-prompts copy, not a misleading 0% bar", async ({
  page
}) => {
  await page.route("**/api/coach", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        streak: 5,
        weekView: [],
        insight: null,
        tier: "premium",
        latestBai: {
          weekStart: "2026-06-29",
          score: 88,
          adherence: 100,
          consistency: 90,
          action: 0,
          prompted: 0
        }
      })
    });
  });

  await page.goto("/progress");

  await expect(page.getByTestId("progress-bands")).toBeVisible();
  await expect(page.getByTestId("bai-no-prompts")).toBeVisible();
  await expect(page.getByTestId("bai-no-prompts")).toContainText(
    "No follow-up prompts this week"
  );
  // The old misleading "Just starting" 0% qualitative label must not appear
  // for the Follow-through row when there was nothing to follow through on.
  await expect(page.getByTestId("bai-no-prompts")).not.toContainText(
    "Just starting"
  );

  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/revers|cure|treat|prevent|guarantee|FDA/i);

  await expectNoSeriousViolations(page);
});

test("premium user with no computed week yet sees the calm waiting state", async ({
  page
}) => {
  await page.route("**/api/coach", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        streak: 0,
        weekView: [],
        insight: null,
        tier: "premium",
        latestBai: null
      })
    });
  });

  await page.goto("/progress");

  await expect(page.getByTestId("progress-empty")).toBeVisible();
  await expect(page.getByTestId("progress-bands")).toHaveCount(0);

  await expectNoSeriousViolations(page);
});

test("free-tier user sees the calm upsell prompt, not the bands", async ({
  page
}) => {
  await page.route("**/api/coach", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        streak: 2,
        weekView: [],
        insight: null,
        tier: "free",
        latestBai: null
      })
    });
  });

  await page.goto("/progress");

  await expect(page.getByTestId("progress-locked")).toBeVisible();
  await expect(page.getByTestId("progress-bands")).toHaveCount(0);
  await expect(
    page.getByTestId("progress-subscribe-link")
  ).toHaveAttribute("href", "/subscribe");

  await expectNoSeriousViolations(page);
});

test("guest (signed out) sees a sign-in prompt, not the Premium upsell", async ({
  page
}) => {
  await page.route("**/api/coach", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "Sign in first." })
    });
  });

  await page.goto("/progress");

  // Error-state truth: 401 is unauthenticated, never the outage-as-upsell.
  await expect(page.getByTestId("progress-unauthenticated")).toBeVisible();
  await expect(page.getByTestId("progress-signin-link")).toHaveAttribute(
    "href",
    "/signin"
  );
  await expect(page.getByTestId("progress-locked")).toHaveCount(0);

  await expectNoSeriousViolations(page);
});

test("a backend outage renders unavailable + retry, never the upsell", async ({
  page
}) => {
  let calls = 0;
  await page.route("**/api/coach", async (route) => {
    calls += 1;
    if (calls === 1) {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "boom" })
      });
      return;
    }
    // The manual retry recovers to a premium-with-data response.
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        streak: 3,
        weekView: [],
        insight: null,
        tier: "premium",
        latestBai: {
          weekStart: "2026-06-29",
          score: 72,
          adherence: 71,
          consistency: 60,
          action: 100,
          prompted: 5
        }
      })
    });
  });

  await page.goto("/progress");

  // The 500 must not become the Premium upsell.
  await expect(page.getByTestId("progress-unavailable")).toBeVisible();
  await expect(page.getByTestId("progress-locked")).toHaveCount(0);
  await expect(page.getByTestId("progress-bands")).toHaveCount(0);

  // Bounded manual retry recovers the page.
  await page.getByTestId("progress-retry").click();
  await expect(page.getByTestId("progress-bands")).toBeVisible();

  await expectNoSeriousViolations(page);
});

test("how-it-works page discloses methodology and has no a11y violations", async ({
  page
}) => {
  await page.goto("/how-it-works");

  await expect(
    page.getByRole("heading", { name: /what the progress view measures/i })
  ).toBeVisible();
  await expect(page.getByText(/CDC DPP/)).toBeVisible();
  await expect(page.getByText(/individual results vary/i)).toBeVisible();

  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/revers|cure|treat|prevent|guarantee|FDA/i);

  await expectNoSeriousViolations(page);
});
