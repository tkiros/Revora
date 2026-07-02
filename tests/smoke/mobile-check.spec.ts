import { expect, test, type Page, type Route } from "@playwright/test";

type StubScenario =
  | { kind: "result" }
  | { kind: "moderate" }
  | { kind: "clarify" }
  | { kind: "retry" }
  | { kind: "not_food" }
  | { kind: "out_of_scope" }
  | { kind: "slow" }
  | { kind: "429" };

async function fulfillCheckRoute(route: Route, scenario: StubScenario) {
  if (scenario.kind === "slow") {
    await new Promise((resolve) => setTimeout(resolve, 6_500));
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
      sequencingTip: null,
      postMealAction: null,
      disclaimer: "Not medical advice."
    },
    moderate: {
      kind: "result",
      risk: "MODERATE",
      reason: "This leans heavily on refined carbs.",
      adjustment: "If practical, add protein or nonstarchy vegetables.",
      swap: "If you have the option, swap to a less refined version.",
      sequencingTip:
        "If practical, start with the vegetables or protein on your plate and save the carb-heavy part for last.",
      postMealAction:
        "A short 10–15 minute walk after this meal is a calm next step.",
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

async function fillValidForm(page: Page, overrides?: Partial<{ food: string; a1c: string }>) {
  await page
    .getByLabel(/what are you thinking about eating/i)
    .fill(overrides?.food ?? "lentil soup");
  await page.getByLabel(/latest a1c/i).fill(overrides?.a1c ?? "6.1");
}

test("public no-login form", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /should i eat this/i })).toBeVisible();
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

test("single screen flow", async ({ page }) => {
  await stubCheckRoute(page, { kind: "result" });
  await page.goto("/");
  await fillValidForm(page);

  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("result-card")).toBeVisible();
  await expect(page.getByRole("button", { name: "Should I eat this?" })).toHaveCount(1);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("decision card v2 blocks render for MODERATE and not for SAFE", async ({
  page
}) => {
  await stubCheckRoute(page, { kind: "moderate" });
  await page.goto("/");
  await fillValidForm(page);
  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByTestId("sequencing-tip")).toContainText(
    "Eat it in this order:"
  );
  await expect(page.getByTestId("post-meal-action")).toContainText(
    "After this meal:"
  );

  await page.unrouteAll();
  await stubCheckRoute(page, { kind: "result" });
  await fillValidForm(page, { food: "egg scramble with spinach" });
  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByTestId("result-card")).toBeVisible();
  await expect(page.getByTestId("sequencing-tip")).toHaveCount(0);
  await expect(page.getByTestId("post-meal-action")).toHaveCount(0);
});

test("loading state", async ({ page }) => {
  await stubCheckRoute(page, { kind: "slow" });
  await page.goto("/");
  await fillValidForm(page);

  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByRole("button", { name: "Checking..." })).toBeVisible();
  await expect(page.getByTestId("request-status")).toContainText("Checking your food");
});

test("slow state after five seconds", async ({ page }) => {
  await stubCheckRoute(page, { kind: "slow" });
  await page.goto("/");
  await fillValidForm(page);

  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByText(/still checking/i)).toBeVisible({ timeout: 7_000 });
  await expect(page.getByText(/taking a little longer/i)).toBeVisible();
});

test("friendly retry states", async ({ page }) => {
  await stubCheckRoute(page, { kind: "429" });
  await page.goto("/");
  await fillValidForm(page);

  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByText("Try again on this page")).toBeVisible();
  await expect(page.getByText(/a lot of people right now/i)).toBeVisible();
  await expect(page.getByText(/raw error/i)).toHaveCount(0);
});

test("offline submit short-circuits before any network call", async ({
  page
}) => {
  // If the synchronous navigator.onLine guard were removed, the submit would
  // fetch and this stub would render a SAFE result instead of the offline copy
  // — so apiCalls and the visible copy both distinguish guard-present from not.
  let apiCalls = 0;
  await page.route("**/api/check", async (route) => {
    apiCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        kind: "result",
        risk: "SAFE",
        reason: "This looks fine.",
        adjustment: null,
        swap: null,
        disclaimer: "Not medical advice."
      })
    });
  });

  // Report offline without simulating a dead network, so a missing guard would
  // actually reach the stub above.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false
    });
  });

  await page.goto("/");
  await fillValidForm(page);
  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByText(/check your connection/i)).toBeVisible();
  await expect(page.getByText("Clear", { exact: true })).toHaveCount(0);
  expect(apiCalls).toBe(0);
});

test("normal response before five seconds", async ({ page }) => {
  await stubCheckRoute(page, { kind: "result" });
  await page.goto("/");
  await fillValidForm(page);

  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByText("Clear", { exact: true })).toBeVisible();
  await expect(
    page.getByText("This looks balanced enough for your usual plan.")
  ).toBeVisible();
  await expect(page.getByText("Not medical advice.")).toBeVisible();
});

test("result readability", async ({ page }) => {
  await stubCheckRoute(page, { kind: "result" });
  await page.goto("/");
  await fillValidForm(page);

  await page.getByRole("button", { name: "Should I eat this?" }).click();

  const resultCard = page.getByTestId("result-card");
  const reason = page.getByText("This looks balanced enough for your usual plan.");

  await expect(resultCard).toBeVisible();
  await expect(resultCard).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(resultCard).toHaveCSS("border-top-width", "2px");
  await expect(reason).toHaveCSS("color", "rgb(30, 41, 59)");

  const reasonFontSize = await reason.evaluate((element) =>
    Number.parseFloat(window.getComputedStyle(element).fontSize)
  );
  expect(reasonFontSize).toBeGreaterThanOrEqual(16);
});

test("useful response states", async ({ page }) => {
  await stubCheckRoute(page, { kind: "clarify" });
  await page.goto("/");
  await fillValidForm(page);

  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(
    page.getByText("Can you share the main portion or sides?")
  ).toBeVisible();

  await page.unroute("**/api/check");
  await stubCheckRoute(page, { kind: "not_food" });
  await page.reload();
  await fillValidForm(page, { food: "glass vase" });
  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByText(/turkey sandwich/i)).toBeVisible();

  await page.unroute("**/api/check");
  await stubCheckRoute(page, { kind: "out_of_scope" });
  await page.reload();
  await fillValidForm(page, { a1c: "7.0" });
  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(
    page.getByText(/prediabetes-range a1c checks right now/i)
  ).toBeVisible();
  await expect(page.getByText("Not medical advice.")).toBeVisible();
});
