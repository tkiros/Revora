import { expect, test, type Page } from "@playwright/test";

/**
 * Nudge opt-in smoke (plan P5): permission + SW mocked; asserts the two-step
 * pattern — our calm ask first, subscription POSTed only after an explicit
 * yes — and that fresh users never see the prompt.
 */

async function mockPushEnvironment(page: Page) {
  await page.addInitScript(() => {
    const fakeSubscription = {
      toJSON: () => ({
        endpoint: "https://push.example/e2e",
        keys: { p256dh: "k", auth: "a" }
      }),
      unsubscribe: async () => true
    };
    const pushManager = {
      getSubscription: async () => null,
      subscribe: async () => fakeSubscription
    };
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: async () => ({}),
        ready: Promise.resolve({ pushManager })
      }
    });
    (window as unknown as Record<string, unknown>).PushManager = function () {
      /* feature-detect only */
    };
    (window as unknown as Record<string, unknown>).Notification = {
      permission: "default",
      requestPermission: async () => "granted"
    };
  });
}

async function seedPriorDayHistory(page: Page) {
  await page.addInitScript(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    window.localStorage.setItem(
      "revora.history.v1",
      JSON.stringify([
        {
          clientId: "prior-1",
          food: "lentil soup",
          risk: "SAFE",
          a1cBand: "prediabetes_60_62",
          inputMethod: "text",
          createdAt: yesterday.toISOString()
        }
      ])
    );
  });
}

test("premium user with a prior-day check gets the two-step opt-in", async ({
  page
}) => {
  await mockPushEnvironment(page);
  await seedPriorDayHistory(page);

  await page.route("**/api/entitlement", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        tier: "premium",
        source: "stripe",
        checksToday: 0,
        freeDailyLimit: 5
      })
    });
  });
  await page.route("**/api/history**", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: "{}" });
  });

  let subscribeCalls = 0;
  await page.route("**/api/push/subscribe", async (route) => {
    subscribeCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true })
    });
  });

  await page.goto("/check");
  await expect(page.getByTestId("nudge-opt-in")).toBeVisible();
  // step 1 shown; nothing subscribed yet
  expect(subscribeCalls).toBe(0);

  await page.getByTestId("nudge-enable").click();
  await expect(page.getByTestId("nudge-enabled")).toBeVisible();
  expect(subscribeCalls).toBe(1);
});

test("fresh users and guests never see the nudge ask", async ({ page }) => {
  await mockPushEnvironment(page);
  await page.route("**/api/entitlement", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: "{}" });
  });

  await page.goto("/check");
  await expect(page.getByTestId("daily-loop-empty")).toBeVisible();
  await expect(page.getByTestId("nudge-opt-in")).toHaveCount(0);
});
