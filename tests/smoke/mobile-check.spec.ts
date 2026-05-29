import { expect, test, type Page, type Route } from "@playwright/test";

type StubScenario =
  | { kind: "result" }
  | { kind: "clarify" }
  | { kind: "retry" }
  | { kind: "not_food" }
  | { kind: "out_of_scope" }
  | { kind: "slow" }
  | { kind: "429" };

async function fulfillCheckRoute(route: Route, scenario: StubScenario) {
  if (scenario.kind === "slow") {
    await new Promise((resolve) => setTimeout(resolve, 5_200));
  }

  if (scenario.kind === "429") {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        kind: "retry",
        message: "Too many requests right now.",
        disclaimer: "Not medical advice."
      })
    });
    return;
  }

  const bodyByScenario = {
    result: {
      kind: "result",
      risk: "SAFE",
      reason: "This looks balanced enough for your usual plan.",
      adjustment: "Keep the rice portion moderate.",
      swap: null,
      disclaimer: "Not medical advice."
    },
    clarify: {
      kind: "clarify",
      question: "Can you share the main portion or sides?",
      examples: ["breaded chicken", "large fries"],
      disclaimer: "Not medical advice."
    },
    retry: {
      kind: "retry",
      message: "Please try again in a moment.",
      disclaimer: "Not medical advice."
    },
    not_food: {
      kind: "not_food",
      message: "That does not sound like a food item yet.",
      examples: ["turkey sandwich", "apple with peanut butter"],
      disclaimer: "Not medical advice."
    },
    out_of_scope: {
      kind: "out_of_scope",
      route: "diabetes_range_out_of_scope",
      message: "Revora only supports prediabetes-range A1C checks right now.",
      disclaimer: "Not medical advice."
    },
    slow: {
      kind: "result",
      risk: "MODERATE",
      reason: "This is a slower mocked response.",
      adjustment: "Pair it with protein.",
      swap: null,
      disclaimer: "Not medical advice."
    }
  } as const;

  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(bodyByScenario[scenario.kind])
  });
}

async function stubCheckRoute(page: Page, scenario: StubScenario) {
  await page.route("**/api/check", async (route) => {
    await fulfillCheckRoute(route, scenario);
  });
}

async function fillValidForm(page: Page) {
  await page.getByLabel(/what are you thinking about eating/i).fill("lentil soup");
  await page.getByLabel(/latest a1c/i).fill("6.1");
}

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

test("loading state", async ({ page }) => {
  await stubCheckRoute(page, { kind: "slow" });
  await page.goto("/");
  await fillValidForm(page);

  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByRole("button", { name: "Checking..." })).toBeVisible();
});

test("slow state after five seconds", async ({ page }) => {
  await stubCheckRoute(page, { kind: "slow" });
  await page.goto("/");
  await fillValidForm(page);

  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByText(/still checking/i)).toBeVisible();
  await expect(page.getByText(/takes a little longer/i)).toBeVisible();
});

test("friendly retry states", async ({ page }) => {
  await stubCheckRoute(page, { kind: "429" });
  await page.goto("/");
  await fillValidForm(page);

  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByText(/try again/i)).toBeVisible();
  await expect(page.getByText(/raw error/i)).toHaveCount(0);
});

test("normal response before five seconds", async ({ page }) => {
  await stubCheckRoute(page, { kind: "result" });
  await page.goto("/");
  await fillValidForm(page);

  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByText("SAFE")).toBeVisible();
  await expect(
    page.getByText("This looks balanced enough for your usual plan.")
  ).toBeVisible();
  await expect(page.getByText("Not medical advice.")).toBeVisible();
});

test("useful response states", async ({ page }) => {
  await stubCheckRoute(page, { kind: "clarify" });
  await page.goto("/");
  await fillValidForm(page);

  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(
    page.getByText("Can you share the main portion or sides?")
  ).toBeVisible();
  await expect(page.getByText("Not medical advice.")).toBeVisible();
});
