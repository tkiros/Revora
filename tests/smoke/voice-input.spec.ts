import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Voice input smoke (plan P2): inject a fake SpeechRecognition, assert
 * transcript → textarea → submit through the unchanged /api/check, the
 * listening state passes axe, and unsupported browsers get the
 * keyboard-dictation hint with the mic hidden.
 */

async function injectFakeSpeechRecognition(page: Page) {
  await page.addInitScript(() => {
    class FakeSpeechRecognition {
      lang = "";
      interimResults = false;
      continuous = true;
      onresult: ((event: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;

      start() {
        // Deliver an interim then a final transcript asynchronously, like a
        // real recognizer.
        setTimeout(() => {
          this.onresult?.({
            results: [{ 0: { transcript: "grilled chicken" }, isFinal: false, length: 1 }]
          });
        }, 50);
        setTimeout(() => {
          this.onresult?.({
            results: [
              {
                0: { transcript: "grilled chicken with rice and salad" },
                isFinal: true,
                length: 1
              }
            ]
          });
          this.onend?.();
        }, 150);
      }

      stop() {
        this.onend?.();
      }
    }

    (window as unknown as Record<string, unknown>).SpeechRecognition =
      FakeSpeechRecognition;
  });
}

async function removeSpeechRecognition(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as Record<string, unknown>;
    delete w.SpeechRecognition;
    delete w.webkitSpeechRecognition;
    Object.defineProperty(window, "webkitSpeechRecognition", {
      configurable: true,
      get: () => undefined
    });
  });
}

test("spoken meal lands in the textarea, is editable, and submits", async ({
  page
}) => {
  await injectFakeSpeechRecognition(page);
  await page.route("**/api/check", async (route) => {
    const body = route.request().postDataJSON() as { food: string };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        kind: "result",
        risk: "MODERATE",
        reason: `You told me: ${body.food}.`,
        adjustment: "If practical, add protein.",
        swap: "If you have the option, swap to a less refined version.",
        sequencingTip: null,
        postMealAction: null,
        disclaimer: "Not medical advice."
      })
    });
  });

  await page.goto("/?stay=1");

  const micButton = page.getByTestId("voice-input-button");
  await expect(micButton).toBeVisible();
  await micButton.click();

  const foodField = page.getByLabel(/what are you thinking about eating/i);
  await expect(foodField).toHaveValue("grilled chicken with rice and salad");
  await expect(page.locator("form")).toHaveAttribute(
    "data-input-method",
    "voice"
  );

  // The transcript is the user's own reviewable text — edit it before submit.
  await foodField.fill("grilled chicken with rice and salad, small portion");
  await page.getByLabel(/latest a1c/i).fill("6.1");
  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByTestId("result-card")).toContainText(
    "grilled chicken with rice and salad, small portion"
  );
});

test("listening state is announced and passes axe", async ({ page }) => {
  await injectFakeSpeechRecognition(page);
  await page.goto("/?stay=1");

  await page.getByTestId("voice-input-button").click();

  // The fake recognizer ends itself after 150ms; assert the status live
  // region announced and re-scan for violations right away.
  await expect(page.getByTestId("voice-input-status")).toHaveAttribute(
    "aria-live",
    "polite"
  );

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const serious = results.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact ?? "")
  );
  expect(serious).toEqual([]);
});

test("unsupported browsers hide the mic and show the keyboard-dictation hint", async ({
  page
}) => {
  await removeSpeechRecognition(page);
  await page.goto("/?stay=1");

  await expect(page.getByTestId("voice-dictation-hint")).toContainText(
    /keyboard.+mic to dictate/i
  );
  await expect(page.getByTestId("voice-input-button")).toHaveCount(0);

  // Nothing is lost: the plain text path still works.
  await page.route("**/api/check", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        kind: "result",
        risk: "SAFE",
        reason: "This looks balanced.",
        adjustment: null,
        swap: null,
        sequencingTip: null,
        postMealAction: null,
        disclaimer: "Not medical advice."
      })
    });
  });
  await page
    .getByLabel(/what are you thinking about eating/i)
    .fill("egg scramble with spinach");
  await page.getByLabel(/latest a1c/i).fill("6.1");
  await page.getByRole("button", { name: "Should I eat this?" }).click();

  await expect(page.getByTestId("result-card")).toBeVisible();
});
