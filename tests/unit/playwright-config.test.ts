import { describe, expect, it } from "vitest";

import config from "../../playwright.config";

function configuredServers() {
  const servers = config.webServer;
  if (!servers) return [];
  return Array.isArray(servers) ? servers : [servers];
}

describe("Playwright release-gate configuration", () => {
  it("runs immutable production servers for both paywall modes", () => {
    const servers = configuredServers();

    expect(servers).toHaveLength(2);
    expect(servers.map((server) => server.command)).toEqual([
      "npx next start --hostname 127.0.0.1 --port 3100",
      "npx next start --hostname 127.0.0.1 --port 3101"
    ]);
    expect(servers.map((server) => server.env?.PAYWALL_MODE)).toEqual([
      "legacy",
      "trial"
    ]);
    expect(servers.map((server) => server.env?.NEXT_DIST_DIR)).toEqual([
      ".next-e2e-legacy",
      ".next-e2e-trial"
    ]);
    expect(servers.map((server) => server.env?.VERCEL_ENV)).toEqual([
      "development",
      "development"
    ]);
    expect(
      servers.every(
        (server) =>
          server.env?.OPENAI_API_KEY === "" &&
          server.env?.RESEND_API_KEY === "" &&
          server.env?.UPSTASH_REDIS_REST_URL === "" &&
          server.env?.STRIPE_SECRET_KEY === ""
      )
    ).toBe(true);
  });

  it("does not mask a release-gate failure with an automatic retry", () => {
    expect(config.retries).toBe(0);
    expect(config.workers).toBe(1);
  });

  it("no spec smuggles a per-suite retry override past the global retries:0 (WS-7)", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const smokeDir = path.join(process.cwd(), "tests", "smoke");
    for (const file of fs.readdirSync(smokeDir)) {
      if (!file.endsWith(".spec.ts")) continue;
      const source = fs.readFileSync(path.join(smokeDir, file), "utf8");
      expect(
        /describe\.configure\(\s*\{[^}]*retries\s*:/.test(source),
        `${file} overrides retries — the release gate runs optimized servers, so retries only hide real flakes`
      ).toBe(false);
    }
  });

  it("does not use a teardown to rewrite tracked source after the run", () => {
    expect(config.globalTeardown).toBeUndefined();
  });
});
