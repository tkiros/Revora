import { afterEach, describe, expect, it } from "vitest";

import nextConfig from "../../../next.config";

const ORIGINAL = process.env.NEXT_PUBLIC_UMAMI_SRC;
const ORIGINAL_SENTRY = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ORIGINAL_UMAMI_HOST = process.env.NEXT_PUBLIC_UMAMI_HOST_URL;

afterEach(() => {
  if (ORIGINAL === undefined) {
    delete process.env.NEXT_PUBLIC_UMAMI_SRC;
  } else {
    process.env.NEXT_PUBLIC_UMAMI_SRC = ORIGINAL;
  }
  if (ORIGINAL_UMAMI_HOST === undefined) {
    delete process.env.NEXT_PUBLIC_UMAMI_HOST_URL;
  } else {
    process.env.NEXT_PUBLIC_UMAMI_HOST_URL = ORIGINAL_UMAMI_HOST;
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
 * script-src must allow the origin the TAG loads from; connect-src must allow
 * the origin the tracker POSTs events TO — otherwise every WTP funnel event
 * silently dies in the browser while the page looks fine.
 *
 * Those two are NOT always the same host, which is what this file used to
 * assume. A self-hosted install serves both from one origin. Umami cloud does
 * not: the script comes from cloud.umami.is and the build hardcodes
 * `https://gateway.umami.is/api/send` as its ingest default. That gap shipped
 * to production — connect-src allowed only cloud.umami.is, so every track()
 * call was refused and the activation funnel recorded nothing (found in the
 * post-PR#25 live verification, 2026-07-22).
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

  it("allows vercel.com so private-store pantry uploads are not CSP-refused", async () => {
    // @vercel/blob/client with access "private" exchanges tokens and uploads
    // through vercel.com/api/blob, not *.blob.vercel-storage.com. Caught live
    // 2026-07-23: every paid Pantry photo upload failed under the old policy.
    const connectSrc = (await csp())
      .split("; ")
      .find((d) => d.startsWith("connect-src"));
    expect(connectSrc).toContain("https://vercel.com");
  });

  it("allows umami cloud's separate ingest host, not just the script host", async () => {
    process.env.NEXT_PUBLIC_UMAMI_SRC = "https://cloud.umami.is/script.js";
    delete process.env.NEXT_PUBLIC_UMAMI_HOST_URL;
    const connectSrc = (await csp())
      .split("; ")
      .find((d) => d.startsWith("connect-src"));
    expect(connectSrc).toContain("https://cloud.umami.is");
    expect(connectSrc).toContain("https://gateway.umami.is");
  });

  it("does not widen a self-hosted install to umami's cloud gateway", async () => {
    process.env.NEXT_PUBLIC_UMAMI_SRC = "https://stats.example.com/script.js";
    delete process.env.NEXT_PUBLIC_UMAMI_HOST_URL;
    expect(await csp()).not.toContain("gateway.umami.is");
  });

  it("lets NEXT_PUBLIC_UMAMI_HOST_URL override the ingest origin", async () => {
    process.env.NEXT_PUBLIC_UMAMI_SRC = "https://cloud.umami.is/script.js";
    process.env.NEXT_PUBLIC_UMAMI_HOST_URL = "https://ingest.example.net";
    const connectSrc = (await csp())
      .split("; ")
      .find((d) => d.startsWith("connect-src"));
    expect(connectSrc).toContain("https://ingest.example.net");
    expect(connectSrc).not.toContain("gateway.umami.is");
  });

  it("keeps the ingest host out of script-src — it only receives POSTs", async () => {
    process.env.NEXT_PUBLIC_UMAMI_SRC = "https://cloud.umami.is/script.js";
    const scriptSrc = (await csp())
      .split("; ")
      .find((d) => d.startsWith("script-src"));
    expect(scriptSrc).not.toContain("gateway.umami.is");
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
