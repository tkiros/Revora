import { expect, test } from "@playwright/test";

test("photo assist is absent and its route is 404 in the default candidate", async ({
  page
}) => {
  await page.goto("/check?stay=1");

  await expect(page.getByTestId("photo-input-button")).toHaveCount(0);
  await expect(page.getByText(/snap a photo/i)).toHaveCount(0);

  const status = await page.evaluate(async () => {
    const response = await fetch("/api/check/photo-draft", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ image: "data:image/jpeg;base64,AAAA" })
    });
    return response.status;
  });
  expect(status).toBe(404);
});
