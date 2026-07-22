import fs from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

/**
 * P0.4 account surfaces E2E (C7 plan §11): the "Download your data" export
 * link and the help/refund round-trip — form → 201 case → confirmation with
 * case id → full-copy email to support@ (read from the AUTH_EMAIL_STUB_DIR
 * seam, exactly like auth.spec.ts reads magic links).
 *
 * Env-gated like auth.spec.ts: needs a real database + the email stub.
 *
 *   DATABASE_URL=... AUTH_EMAIL_STUB_DIR=/tmp/revora-mailbox \
 *     npx playwright test tests/smoke/account-support.spec.ts
 */

const STUB_DIR = process.env.AUTH_EMAIL_STUB_DIR;
const ENABLED = Boolean(process.env.DATABASE_URL && STUB_DIR);

test.skip(
  !ENABLED,
  "account-support E2E needs DATABASE_URL + AUTH_EMAIL_STUB_DIR (Railway dev database)"
);

async function signIn(page: Page): Promise<string> {
  const email = `e2e-support-${Date.now()}@revora.test`;

  await page.goto("/signin");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: /email me a sign-in link/i }).click();
  await expect(page).toHaveURL(/check-email/);

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
  return email;
}

test("account: export link + help/refund case round-trip lands the full-copy email", async ({
  page
}) => {
  await signIn(page);
  await page.goto("/account");

  // PR-5 residual: the export door is a plain link to the JSON export.
  await expect(page.getByTestId("account-export-link")).toHaveAttribute(
    "href",
    "/api/account/export"
  );
  const exportResponse = await page.request.get("/api/account/export");
  expect(exportResponse.ok()).toBe(true);
  const exported = await exportResponse.json();
  expect(exported).toHaveProperty("supportCases");

  // Refund kind surfaces the refund-window copy inline.
  const form = page.getByTestId("support-case-form");
  await expect(form).toBeVisible();
  await page.getByLabel("What do you need?").selectOption("refund");
  await expect(page.getByTestId("refund-window-hint")).toBeVisible();

  const message = `E2E refund probe ${Date.now()} — please disregard.`;
  await page.getByLabel("Your message").fill(message);
  const sentAt = Date.now();
  await page.getByTestId("support-case-submit").click();

  // Confirmation carries the case id; the form is replaced, not cleared.
  const done = page.getByTestId("support-case-done");
  await expect(done).toBeVisible();
  await expect(done).toContainText(/Case #[a-f0-9]{8}/);
  await expect(page.getByTestId("support-case-form")).toHaveCount(0);

  // The support inbox got the FULL message (eng-review D3), via the stub.
  await expect
    .poll(
      () => {
        const files = fs
          .readdirSync(STUB_DIR!)
          .filter((f) => f.startsWith("support@revora.plus-"))
          .map((f) => path.join(STUB_DIR!, f))
          .filter((f) => fs.statSync(f).mtimeMs >= sentAt - 1000);
        return files.some((f) =>
          (JSON.parse(fs.readFileSync(f, "utf8")) as { text: string }).text.includes(
            message
          )
        );
      },
      { timeout: 10_000 }
    )
    .toBe(true);

  // The case rides the data export too.
  const afterExport = await (await page.request.get("/api/account/export")).json();
  const cases = afterExport.supportCases as Array<{ message?: string }>;
  expect(JSON.stringify(cases)).toContain("refund");

  // "Send another message" restores the form.
  await page.getByRole("button", { name: /send another message/i }).click();
  await expect(page.getByTestId("support-case-form")).toBeVisible();
});
