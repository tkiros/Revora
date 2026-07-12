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

test("a new user walks welcome→segment→a1c→expectations→first_check into a guided check", async ({
  page
}) => {
  await page.goto("/onboarding");

  // Step 1: welcome. (The "Reversal…" North Star line was removed 2026-07-06
  // pending counsel Q8 — launch audit BUG-05; restore this assertion only with
  // an Approved copy-ledger row.)
  await expect(page.getByTestId("onboarding-step")).toHaveAttribute(
    "data-step",
    "welcome"
  );
  // W-09: the welcome step used to promise "one reason, one adjustment, and one
  // safer swap" unconditionally. A SAFE verdict is structurally forbidden from
  // carrying either an adjustment or a swap, so that promise was false for every
  // Clear result. The copy is now hedged and this assertion follows it.
  await expect(
    page.getByText(
      /one reason and, when appropriate, an adjustment and one practical alternative/
    )
  ).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.getByRole("button", { name: "Get started" }).click();

  // Step 2: segmentation — one tap advances, stored nowhere
  await expect(page.getByTestId("onboarding-step")).toHaveAttribute(
    "data-step",
    "segment"
  );
  await expect(
    page.getByRole("heading", { name: "What brought you here?" })
  ).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.getByRole("button", { name: "New A1C result" }).click();

  // Step 3: A1C entry (shown because no profile is seeded)
  await expect(page.getByTestId("onboarding-step")).toHaveAttribute(
    "data-step",
    "a1c"
  );
  await page.getByLabel("Latest A1C").fill("6.1");
  await expectNoSeriousViolations(page);
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 4: expectations — honesty line prepended + disclaimer
  await expect(page.getByTestId("onboarding-step")).toHaveAttribute(
    "data-step",
    "expectations"
  );
  await expect(
    page.getByText(/When we're unsure, we say so/)
  ).toBeVisible();
  await expect(page.locator(".result-disclaimer")).toContainText(
    /not medical advice/i
  );
  await expectNoSeriousViolations(page);
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 5: first check — three classics, no photo path
  await expect(page.getByTestId("onboarding-step")).toHaveAttribute(
    "data-step",
    "first_check"
  );
  await expect(
    page.getByText(/These three surprise almost everyone/)
  ).toBeVisible();
  await expect(page.getByText(/photo|snap|camera/i)).toHaveCount(0);
  await expectNoSeriousViolations(page);
  await page.getByRole("button", { name: "oatmeal", exact: true }).click();

  // Lands on home with the guided food prefilled and the A1C remembered
  await expect(page).toHaveURL(/\/check$/);
  await expect(page.getByLabel(/eating/i)).toHaveValue("oatmeal");
  await expect(page.getByLabel(/latest a1c/i)).toHaveValue("6.1");
});

test("a returning guest with a saved A1C skips the A1C step", async ({
  page
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "revora.profile.v1",
      JSON.stringify({ a1c: 6.1, onboardedAt: "2026-01-01T00:00:00.000Z" })
    );
  });

  await page.goto("/onboarding");
  await page.getByRole("button", { name: "Get started" }).click();

  await expect(page.getByTestId("onboarding-step")).toHaveAttribute(
    "data-step",
    "segment"
  );
  await page.getByRole("button", { name: "Just checking" }).click();

  // Single-source rule: the device already knows the A1C, so a1c is skipped.
  await expect(page.getByTestId("onboarding-step")).toHaveAttribute(
    "data-step",
    "expectations"
  );
  await expect(page.getByLabel("Latest A1C")).toHaveCount(0);
});

test("skip the tour leaves for the escape hatch, never looping back", async ({
  page
}) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "Skip setup and check a meal" }).click();

  // ?stay=1 is FirstRunGate's signal to stay on the check page instead of
  // bouncing back (the app moved from / to /check, 2026-07-07).
  await expect(page).toHaveURL(/\/check\?stay=1$/);
  await expect(page.getByTestId("onboarding-step")).toHaveCount(0);
});

test("invalid A1C shows a field error, not progress", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "Get started" }).click();
  await page.getByRole("button", { name: "New A1C result" }).click();

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
      await page.getByRole("button", { name: "New A1C result" }).click();
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
