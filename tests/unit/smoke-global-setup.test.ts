import { describe, expect, it } from "vitest";
import type { Page } from "@playwright/test";

import {
  DEFAULT_WARMUP_ROUTES,
  warmBrowserRoutes,
  warmRoutes,
  type WarmupClient,
  type WarmupResponse
} from "../smoke/global-setup";

function response(status: number): WarmupResponse {
  return {
    ok: () => status >= 200 && status < 300,
    status: () => status
  };
}

describe("smoke global setup", () => {
  it("covers each stable always-on route exactly once", () => {
    expect(new Set(DEFAULT_WARMUP_ROUTES).size).toBe(
      DEFAULT_WARMUP_ROUTES.length
    );
    expect(DEFAULT_WARMUP_ROUTES).toEqual(
      expect.arrayContaining([
        "/",
        "/check?stay=1",
        "/onboarding",
        "/home?stay=1",
        "/meals",
        "/journey",
        "/subscribe",
        "/account",
        "/signin",
        "/privacy",
        "/terms"
      ])
    );
  });

  it("warms routes serially with the supplied timeout", async () => {
    const calls: Array<{ route: string; timeout?: number }> = [];
    const client: WarmupClient = {
      async get(route, options) {
        calls.push({ route, timeout: options?.timeout });
        return response(200);
      }
    };

    await warmRoutes(client, ["/one", "/two"], 42_000);

    expect(calls).toEqual([
      { route: "/one", timeout: 42_000 },
      { route: "/two", timeout: 42_000 }
    ]);
  });

  it("fails on the first unhealthy route with a bounded diagnostic", async () => {
    const calls: string[] = [];
    const client: WarmupClient = {
      async get(route) {
        calls.push(route);
        return response(route === "/broken" ? 503 : 200);
      }
    };

    await expect(
      warmRoutes(client, ["/healthy", "/broken", "/never"])
    ).rejects.toThrow(
      "Playwright route warmup failed for /broken: HTTP 503"
    );
    expect(calls).toEqual(["/healthy", "/broken"]);
  });

  it("loads browser chunks serially and proves the check form hydrated", async () => {
    const calls: string[] = [];
    const waits: Array<{ state?: string; timeout?: number }> = [];
    const page = {
      async goto(route: string) {
        calls.push(route);
        return response(200);
      },
      getByRole(role: string, options: { name: string }) {
        expect({ role, options }).toEqual({
          role: "button",
          options: { name: "Check this meal" }
        });
        return {
          async waitFor(options: { state?: string; timeout?: number }) {
            waits.push(options);
          }
        };
      }
    } as unknown as Page;

    await warmBrowserRoutes(page, ["/one", "/two"], 54_000);

    expect(calls).toEqual(["/one", "/two", "/check?stay=1"]);
    expect(waits).toEqual([{ state: "visible", timeout: 54_000 }]);
  });

  it("fails browser warmup on a non-success response", async () => {
    const page = {
      async goto(route: string) {
        return response(route === "/broken" ? 503 : 200);
      }
    } as unknown as Page;

    await expect(
      warmBrowserRoutes(page, ["/healthy", "/broken", "/never"])
    ).rejects.toThrow(
      "Playwright browser warmup failed for /broken: HTTP 503"
    );
  });
});
