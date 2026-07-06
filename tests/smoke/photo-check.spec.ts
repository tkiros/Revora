import path from "node:path";
import { expect, test } from "@playwright/test";

import { STUB_DRAFT } from "../../lib/meal/photo-extract";

// Photo-assist (D5) smoke. The draft route is stubbed at the network layer
// (same posture as mobile-check.spec.ts stubbing /api/check) — no OpenAI
// traffic. Covers: photo → draft chips → uncertain item must be confirmed →
// confirmed text lands in the textarea with data-input-method="photo". The
// verdict submit itself is covered by mobile-check.spec.ts — this spec stops
// at the composed textarea.
test("photo draft flows into the food textarea after confirmation", async ({ page }) => {
  await page.route("**/api/check/photo-draft", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ kind: "draft", ...STUB_DRAFT })
    });
  });

  // ?stay=1: the first-run gate's escape hatch — a brand-new visitor is
  // otherwise bounced to /onboarding before the form mounts.
  await page.goto("/?stay=1");

  await page
    .getByTestId("photo-file-input")
    .setInputFiles(path.join(__dirname, "../fixtures/meal-photos/smoke-meal.jpg"));

  const review = page.getByTestId("photo-draft-review");
  await expect(review).toBeVisible();

  // Confirm button is gated while an uncertain chip remains.
  const confirm = page.getByTestId("draft-confirm-button");
  await expect(confirm).toBeDisabled();

  // dispatchEvent instead of click: WebKit intermittently reports the chip
  // as detached while the dev-overlay re-renders; the handler itself is what
  // we're testing (uncertain → confirmed), not pointer physics.
  await page
    .getByTestId("chip-uncertain")
    .getByRole("button")
    .first()
    .dispatchEvent("click");
  await expect(confirm).toBeEnabled();
  await confirm.click();

  const textarea = page.locator("#food");
  await expect(textarea).toHaveValue(/chicken and rice bowl: .*white rice \(1 cup\)/);
  await expect(page.locator("form.form-grid")).toHaveAttribute(
    "data-input-method",
    "photo"
  );
});
