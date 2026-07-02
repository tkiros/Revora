import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const serious = results.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact ?? "")
  );
  expect(serious).toEqual([]);
}

test("a new user completes all four onboarding steps and lands on the home loop", async ({
  page
}) => {
  await page.goto("/onboarding");

  // Step 1: welcome + the North Star line
  await expect(page.getByTestId("onboarding-step")).toHaveAttribute(
    "data-step",
    "welcome"
  );
  await expect(
    page.getByText(/Reversal is achieved through your dietary choices/)
  ).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.getByRole("button", { name: "Get started" }).click();

  // Step 2: A1C entry
  await expect(page.getByTestId("onboarding-step")).toHaveAttribute(
    "data-step",
    "a1c"
  );
  await page.getByLabel("Latest A1C").fill("6.1");
  await expectNoSeriousViolations(page);
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 3: expectations — honest framing + disclaimer
  await expect(page.getByTestId("onboarding-step")).toHaveAttribute(
    "data-step",
    "expectations"
  );
  await expect(page.locator(".result-disclaimer")).toContainText(
    /not medical advice/i
  );
  await expectNoSeriousViolations(page);
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 4: daily loop — exactly two input methods, no photo
  await expect(page.getByTestId("onboarding-step")).toHaveAttribute(
    "data-step",
    "daily_loop"
  );
  await expect(page.getByText("Type your meal.")).toBeVisible();
  await expect(page.getByText("Say your meal.")).toBeVisible();
  await expect(page.getByText(/photo|snap|camera/i)).toHaveCount(0);
  await expectNoSeriousViolations(page);
  await page.getByTestId("onboarding-finish").click();

  // Lands on home with the A1C remembered in the form
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByLabel(/latest a1c/i)).toHaveValue("6.1");
});

test("invalid A1C shows a field error, not progress", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "Get started" }).click();

  // Empty submit (number inputs refuse non-numeric text entirely)
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText(/one decimal, like 6.1/i)).toBeVisible();
  await expect(page.getByTestId("onboarding-step")).toHaveAttribute(
    "data-step",
    "a1c"
  );
});

test.describe("out-of-range A1C ends at boundary guidance, never a verdict", () => {
  for (const [value, expected] of [
    ["5.2", /below that range/i],
    ["7.1", /range used for diabetes/i]
  ] as const) {
    test(`A1C ${value}`, async ({ page }) => {
      await page.goto("/onboarding");
      await page.getByRole("button", { name: "Get started" }).click();
      await page.getByLabel("Latest A1C").fill(value);
      await page.getByRole("button", { name: "Continue" }).click();

      await expect(page.getByTestId("onboarding-step")).toHaveAttribute(
        "data-step",
        "boundary"
      );
      await expect(page.getByTestId("boundary-message")).toContainText(expected);
      // No verdict language, no way to continue the tour
      await expect(page.getByText(/clear|be careful|hold off/i)).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Continue" })).toHaveCount(0);
      await expectNoSeriousViolations(page);
    });
  }
});
