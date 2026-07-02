import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

/**
 * Magic-link auth E2E (plan 4A). Needs a real database and the email stub:
 *
 *   DATABASE_URL=<railway dev database> \
 *   AUTH_SECRET=<any> HEALTH_DATA_KEY=<32B base64> \
 *   AUTH_EMAIL_STUB_DIR=/tmp/revora-mailbox \
 *   npx playwright test tests/smoke/auth.spec.ts
 *
 * Skipped automatically when the environment isn't provisioned (see
 * docs/handoff/human-actions-required.md §1 — Railway Postgres).
 */

const STUB_DIR = process.env.AUTH_EMAIL_STUB_DIR;
const ENABLED = Boolean(process.env.DATABASE_URL && STUB_DIR);

test.skip(
  !ENABLED,
  "auth E2E needs DATABASE_URL + AUTH_EMAIL_STUB_DIR (Railway dev database)"
);

test("magic-link round trip: email → link → session → consent → profile", async ({
  page
}) => {
  const email = `e2e-${Date.now()}@revora.test`;

  await page.goto("/signin");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: /email me a sign-in link/i }).click();

  await expect(page).toHaveURL(/check-email/);

  // Read the magic link from the stubbed mailbox.
  const mailboxFile = path.join(
    STUB_DIR!,
    `${email.replace(/[^a-z0-9@.]/gi, "_")}.json`
  );
  await expect
    .poll(() => fs.existsSync(mailboxFile), { timeout: 10_000 })
    .toBe(true);
  const { url } = JSON.parse(fs.readFileSync(mailboxFile, "utf8")) as {
    url: string;
  };

  await page.goto(url);

  // Landed signed-in on /welcome: consent gate blocks until checked.
  await page.goto("/welcome");
  await expect(page.getByTestId("welcome-save")).toBeDisabled();

  await page.getByLabel("Latest A1C").fill("6.1");
  await page.getByLabel(/I consent to Revora storing/).check();
  await page.getByTestId("welcome-save").click();

  await expect(page).toHaveURL(/\/$/);

  // Session survives a reload; profile exists.
  const profile = await page.evaluate(async () => {
    const response = await fetch("/api/profile");
    return response.json();
  });
  expect(profile).toMatchObject({
    hasProfile: true,
    a1cBand: "prediabetes_60_62"
  });
});
