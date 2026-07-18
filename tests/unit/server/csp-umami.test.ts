import { afterEach, describe, expect, it } from "vitest";

import nextConfig from "../../../next.config";

const ORIGINAL = process.env.NEXT_PUBLIC_UMAMI_SRC;

afterEach(() => {
  if (ORIGINAL === undefined) {
    delete process.env.NEXT_PUBLIC_UMAMI_SRC;
  } else {
    process.env.NEXT_PUBLIC_UMAMI_SRC = ORIGINAL;
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

  it("stays strict when Umami is unconfigured or malformed", async () => {
    delete process.env.NEXT_PUBLIC_UMAMI_SRC;
    expect(await csp()).not.toContain("stats.example.com");

    process.env.NEXT_PUBLIC_UMAMI_SRC = "not a url";
    const value = await csp();
    expect(value).toContain("script-src 'self' 'unsafe-inline'");
    expect(value).not.toContain("not a url");
  });
});
