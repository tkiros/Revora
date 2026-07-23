import { request, type APIResponse } from "@playwright/test";

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

export default async function globalSetup(): Promise<void> {
  const client = await request.newContext({
    baseURL: "http://127.0.0.1:3100"
  });
  try {
    await warmRoutes(client);
  } finally {
    await client.dispose();
  }
}
