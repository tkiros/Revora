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
  });

  it("does not mask a release-gate failure with an automatic retry", () => {
    expect(config.retries).toBe(0);
    expect(config.workers).toBe(1);
  });

  it("does not use a teardown to rewrite tracked source after the run", () => {
    expect(config.globalTeardown).toBeUndefined();
  });
});
