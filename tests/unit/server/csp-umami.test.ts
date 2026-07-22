import { afterEach, describe, expect, it } from "vitest";

import nextConfig from "../../../next.config";

const ORIGINAL = process.env.NEXT_PUBLIC_UMAMI_SRC;
const ORIGINAL_SENTRY = process.env.NEXT_PUBLIC_SENTRY_DSN;

afterEach(() => {
  if (ORIGINAL === undefined) {
    delete process.env.NEXT_PUBLIC_UMAMI_SRC;
  } else {
    process.env.NEXT_PUBLIC_UMAMI_SRC = ORIGINAL;
  }
  if (ORIGINAL_SENTRY === undefined) {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  } else {
    process.env.NEXT_PUBLIC_SENTRY_DSN = ORIGINAL_SENTRY;
  }
});

async function csp(): Promise<string> {
  const rules = await nextConfig.headers!();
  const header = rules[0].headers.find(
    (h) => h.key === "Content-Security-Policy"
  );
  return header?.value ?? "";
}

/**
 * app/layout.tsx embeds the Umami tracker when NEXT_PUBLIC_UMAMI_SRC is set.
 * The CSP must allow that origin for script-src (the tag) AND connect-src
 * (the beacon POSTs) — otherwise every WTP funnel event silently dies in the
 * browser while the page looks fine.
 */
describe("CSP ↔ Umami agreement", () => {
  it("allows the Umami origin when the layout would embed it", async () => {
    process.env.NEXT_PUBLIC_UMAMI_SRC = "https://stats.example.com/script.js";
    const value = await csp();
    const scriptSrc = value.split("; ").find((d) => d.startsWith("script-src"));
    const connectSrc = value
      .split("; ")
      .find((d) => d.startsWith("connect-src"));
    expect(scriptSrc).toContain("https://stats.example.com");
    expect(connectSrc).toContain("https://stats.example.com");
  });

  it("allows the Sentry ingest origin when the client DSN is set", async () => {
    // Regression (design-review 2026-07-21): the client DSN shipped while
    // connect-src blocked its envelope POSTs — Sentry armed but mute.
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      "https://abc123@o000.ingest.us.sentry.io/999";
    const value = await csp();
    const connectSrc = value
      .split("; ")
      .find((d) => d.startsWith("connect-src"));
    expect(connectSrc).toContain("https://o000.ingest.us.sentry.io");
  });

  it("stays strict when the Sentry DSN is unconfigured or malformed", async () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    expect(await csp()).not.toContain("ingest.us.sentry.io");

    process.env.NEXT_PUBLIC_SENTRY_DSN = "not a url";
    const value = await csp();
    expect(value).not.toContain("not a url");
    expect(value).not.toContain("ingest.us.sentry.io");
  });

  it("stays strict when Umami is unconfigured or malformed", async () => {
    delete process.env.NEXT_PUBLIC_UMAMI_SRC;
    expect(await csp()).not.toContain("stats.example.com");

    process.env.NEXT_PUBLIC_UMAMI_SRC = "not a url";
    const value = await csp();
    expect(value).toContain("script-src 'self' 'unsafe-inline'");
    expect(value).not.toContain("not a url");
  });
});
