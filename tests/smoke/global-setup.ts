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
 * An API request proves the route responds but does not execute browser chunks.
 * Visit the same routes in a real browser before the release gate starts. The
 * final check-page assertion proves the optimized build actually hydrates
 * instead of merely returning a healthy-looking server-rendered shell.
 *
 * This is a fail-fast probe, not a cache-warming substitute for assertions:
 * every test still gets its own isolated browser context.
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
