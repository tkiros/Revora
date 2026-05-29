import { expect, test } from "@playwright/test";

test("public no-login form", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /revora/i })).toBeVisible();
  await expect(
    page.getByLabel(/what are you thinking about eating/i)
  ).toBeVisible();
  await expect(page.getByLabel(/latest a1c/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Should I eat this?" })
  ).toBeVisible();
});

test("invalid submit does not POST", async ({ page }) => {
  let requestCount = 0;

  await page.route("**/api/check", async (route) => {
    requestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ kind: "retry", message: "retry", disclaimer: "disc" })
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByText("Enter a food or meal.")).toBeVisible();
  await expect(page.getByText("Enter your A1C with one decimal.")).toBeVisible();
  expect(requestCount).toBe(0);
});

test("cta label and position", async ({ page }) => {
  await page.goto("/");

  const button = page.getByRole("button", { name: "Should I eat this?" });
  await expect(button).toBeVisible();

  const box = await button.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeLessThan(720);
});

test("no autofocus mobile inputs", async ({ page }) => {
  await page.goto("/");

  const activeTag = await page.evaluate(() => document.activeElement?.tagName ?? null);
  const activeId = await page.evaluate(() => document.activeElement?.id ?? null);

  expect(activeTag).not.toBe("INPUT");
  expect(activeTag).not.toBe("TEXTAREA");
  expect(activeId).not.toBe("food");
  expect(activeId).not.toBe("a1c");
});
