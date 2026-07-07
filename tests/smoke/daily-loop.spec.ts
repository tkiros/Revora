import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

function moderateResult(reason = "This leans heavily on refined carbs.") {
  return {
    kind: "result",
    risk: "MODERATE",
    reason,
    adjustment: "If practical, add protein or nonstarchy vegetables.",
    swap: "If you have the option, swap to a less refined version.",
    sequencingTip:
      "If practical, start with the vegetables or protein on your plate and save the carb-heavy part for last.",
    postMealAction:
      "A short 10–15 minute walk after this meal is a calm next step.",
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

async function runCheck(page: Page, food: string) {
  await page.getByLabel(/what are you thinking about eating/i).fill(food);
  await page.getByLabel(/latest a1c/i).fill("6.1");
  await page.getByRole("button", { name: "Should I eat this?" }).click();
  await expect(page.getByTestId("result-card")).toBeVisible();
}

test("checks build the on-device day: today list, streak, action ack", async ({
  page
}) => {
  await stubModerate(page);
  await page.goto("/?stay=1");

  // Fresh visitor: invitation to the tour, no loop yet
  await expect(page.getByTestId("daily-loop-empty")).toBeVisible();

  await runCheck(page, "white rice with beans");

  // Post-meal ack
  await page.getByTestId("action-done-button").click();
  await expect(page.getByTestId("action-done-note")).toBeVisible();

  // Reload: the daily loop renders from stored history
  await page.reload();
  await expect(page.getByTestId("daily-loop")).toBeVisible();
  await expect(page.getByTestId("today-list")).toContainText(
    "white rice with beans"
  );
  await expect(page.getByTestId("streak-chip")).toContainText("Day 1");

  const stored = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("revora.history.v1") ?? "[]")
  );
  expect(stored).toHaveLength(1);
  expect(stored[0].actionDoneAt).toBeTruthy();
  expect(stored[0].inputMethod).toBe("text");
});

test("history page shows the week strip and one-tap re-check prefills the form", async ({
  page
}) => {
  await stubModerate(page);
  await page.goto("/?stay=1");
  await runCheck(page, "plain bagel");

  await page.goto("/history");
  await expect(page.getByTestId("week-strip")).toBeVisible();
  await expect(page.getByTestId("history-list")).toContainText("plain bagel");
  await expect(page.getByText("Be careful")).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const serious = results.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact ?? "")
  );
  expect(serious).toEqual([]);

  await page.getByTestId("recheck-button").first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByLabel(/what are you thinking about eating/i)
  ).toHaveValue("plain bagel");
});

test("empty history page is calm and passes axe", async ({ page }) => {
  await page.goto("/history");

  await expect(page.getByTestId("history-empty")).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const serious = results.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact ?? "")
  );
  expect(serious).toEqual([]);
});

test("insight appears after five checks with a daypart pattern", async ({
  page
}) => {
  await page.goto("/?stay=1");

  // Seed history directly: three careful breakfasts + two safe meals.
  await page.evaluate(() => {
    const day = (offset: number, hour: number) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      d.setHours(hour, 0, 0, 0);
      return d.toISOString();
    };
    const entry = (
      id: string,
      food: string,
      risk: string,
      createdAt: string
    ) => ({
      clientId: id,
      food,
      risk,
      a1cBand: "prediabetes_60_62",
      inputMethod: "text",
      createdAt
    });
    window.localStorage.setItem(
      "revora.history.v1",
      JSON.stringify([
        entry("1", "bagel", "MODERATE", day(1, 8)),
        entry("2", "sweet cereal", "HIGH", day(2, 8)),
        entry("3", "toast and jam", "MODERATE", day(3, 9)),
        entry("4", "salad", "SAFE", day(1, 13)),
        entry("5", "salmon and greens", "SAFE", day(2, 19))
      ])
    );
  });

  await page.reload();

  await expect(page.getByTestId("insight-card")).toContainText("breakfast");
  await expect(page.getByTestId("insight-card")).toContainText("swap");
});
