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

test("subscribe page shows the soft paywall inside the claims boundary", async ({
  page
}) => {
  await page.goto("/subscribe");

  await expect(page.getByTestId("paywall-card")).toBeVisible();
  await expect(page.getByTestId("subscribe-monthly")).toContainText("$12.99");
  await expect(page.getByTestId("subscribe-annual")).toContainText("$99.99");
  // capability framing only — no outcome promises, no pressure
  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/revers|cure|treat|prevent|guarantee|lower your a1c/i);
  expect(text).toMatch(/cancel anytime/i);

  await expectNoSeriousViolations(page);
});

test("signed-out account page offers sign-in; deletion URL is public", async ({
  page
}) => {
  await page.goto("/account");
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();

  await page.goto("/account/delete");
  await expect(
    page.getByRole("heading", { name: /delete your account/i })
  ).toBeVisible();
  await expect(page.getByText(/no retention window/i)).toBeVisible();

  await expectNoSeriousViolations(page);
});

test("free-tier limit renders the calm upsell card", async ({ page }) => {
  await page.route("**/api/check", async (route) => {
    await route.fulfill({
      status: 402,
      contentType: "application/json",
      body: JSON.stringify({
        kind: "upsell",
        message:
          "You've used today's five free checks. Premium removes the daily limit and keeps your full history — or check back in with your first meal tomorrow.",
        disclaimer: "Not medical advice."
      })
    });
  });

  await page.goto("/");
  await page
    .getByLabel(/what are you thinking about eating/i)
    .fill("lentil soup");
  await page.getByLabel(/latest a1c/i).fill("6.1");
  await page.getByRole("button", { name: "Should I eat this?" }).click();

  const card = page.getByTestId("result-card");
  await expect(card).toHaveAttribute("data-kind", "upsell");
  await expect(card).toContainText(/five for today/i);
  await expect(
    card.getByRole("link", { name: /see what premium includes/i })
  ).toBeVisible();
  // calm, not scary
  await expect(card).not.toContainText(/warning|blocked|denied/i);
});
