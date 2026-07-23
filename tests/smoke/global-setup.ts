import {
  chromium,
  request,
  type APIResponse,
  type Page
} from "@playwright/test";

export const DEFAULT_WARMUP_ROUTES = [
  "/",
  "/check?stay=1",
  "/onboarding",
  "/home?stay=1",
  "/meals",
  "/journey",
  "/subscribe",
  "/account",
  "/account/delete",
  "/signin",
  "/signin/check-email",
  "/welcome",
  "/privacy",
  "/terms",
  "/pantry",
  "/pantry/intake",
  "/how-it-works",
  "/history",
  "/memory",
  "/progress"
] as const;

export type WarmupResponse = Pick<APIResponse, "ok" | "status">;

export type WarmupClient = {
  get(
    route: string,
    options?: { timeout?: number }
  ): Promise<WarmupResponse>;
};

export async function warmRoutes(
  client: WarmupClient,
  routes: readonly string[] = DEFAULT_WARMUP_ROUTES,
  timeoutMs = 120_000
): Promise<void> {
  for (const route of routes) {
    const response = await client.get(route, { timeout: timeoutMs });
    if (!response.ok()) {
      throw new Error(
        `Playwright route warmup failed for ${route}: HTTP ${response.status()}`
      );
    }
  }
}

/**
 * A document request compiles the server route, but it does not request or
 * execute that route's browser chunks. With `next dev`, the first real browser
 * could therefore trigger a client-bundle rebuild while the parallel workers
 * were already navigating. Chromium then observed `net::ERR_NETWORK_CHANGED`
 * for a core chunk and the page remained permanently on its SSR loading shell.
 *
 * Visit the same routes in one real browser before workers start. The final
 * check-page assertion proves React actually hydrated instead of merely
 * returning HTML; a failed client chunk makes setup fail immediately.
 */
export async function warmBrowserRoutes(
  page: Page,
  routes: readonly string[] = DEFAULT_WARMUP_ROUTES,
  timeoutMs = 120_000
): Promise<void> {
  for (const route of routes) {
    const response = await page.goto(route, {
      waitUntil: "load",
      timeout: timeoutMs
    });
    if (!response?.ok()) {
      throw new Error(
        `Playwright browser warmup failed for ${route}: HTTP ${response?.status() ?? "no response"}`
      );
    }
  }

  await page.goto("/check?stay=1", {
    waitUntil: "load",
    timeout: timeoutMs
  });
  await page
    .getByRole("button", { name: "Check this meal" })
    .waitFor({ state: "visible", timeout: timeoutMs });
}

export default async function globalSetup(): Promise<void> {
  const client = await request.newContext({
    baseURL: "http://127.0.0.1:3100"
  });
  const browser = await chromium.launch();
  try {
    await warmRoutes(client);
    const page = await browser.newPage({
      baseURL: "http://127.0.0.1:3100",
      serviceWorkers: "block"
    });
    await warmBrowserRoutes(page);
  } finally {
    await browser.close();
    await client.dispose();
  }
}
