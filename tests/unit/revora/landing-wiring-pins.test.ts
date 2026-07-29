import fs from "node:fs";
import path from "node:path";

import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

// Same app-router shim copy-pins.test.ts uses — the rendered-output pins below
// only need anchor text, not real routing.
vi.mock("next/link", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ href, children }: { href?: unknown; children?: ReactNode }) =>
      createElement(
        "a",
        { href: typeof href === "string" ? href : undefined },
        children
      )
  };
});

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

afterEach(() => {
  vi.unstubAllEnvs();
});

async function renderLanding(env: Record<string, string> = {}): Promise<string> {
  vi.stubEnv("PAYWALL_MODE", "trial");
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  const page = await import("../../../app/page");
  return renderToStaticMarkup(page.default());
}

const text = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
const count = (haystack: string, needle: string) =>
  haystack.split(needle).length - 1;

/**
 * Landing wiring pins — the invariants the 2026-07-28 ship coverage audit
 * found unguarded. Three families:
 *
 *  1. FONT WIRING (FINDING-030). reading.className on the landing root is the
 *     SOLE source of the landing body face — the var-based CSS fallback was
 *     deliberately removed (a failed var cascade must not be able to pick a
 *     font). The font-google stub renders distinguishable markers so a deleted
 *     className goes red here instead of only in a production browser.
 *
 *  2. FLAG BRANCHES. NEXT_PUBLIC_PHOTO_INPUT is ON in production but blank in
 *     every test env, so the shipped branch of every photoEnabled conditional
 *     was never rendered by any test — including the "way-count must match
 *     Step 1's input list" invariant.
 *
 *  3. FEATURE-CARD SET. The origin/main merge dropped a duplicated card; pin
 *     that the set stays deduplicated in both journey-flag states.
 */

describe("landing font wiring (FINDING-030)", () => {
  it("the landing root carries the reading-face className", async () => {
    const html = await renderLanding();
    expect(html).toMatch(/<main[^>]*class="[^"]*__stub_source_sans_3[^"]*"/);
  });

  it("layout puts the brand className on <body> and its variable on <html>", () => {
    // RootLayout drags in next/script + client components, so it is pinned at
    // source level. sans.className on <body> is LOAD-BEARING: globals.css's
    // `body { font: inherit }` reset kills the elemental body font rule, so
    // deleting this class drops the app to the UA default face (FINDING-030).
    // reading is deliberately ABSENT here — it ships with the landing route
    // only (app/page.tsx), not with every app route.
    const src = read("app/layout.tsx");
    expect(src).toMatch(/<html[^>]*className=\{sans\.variable\}/);
    expect(src).toMatch(/<body className=\{sans\.className\}/);
    expect(src).not.toMatch(/reading\.(className|variable)/);
  });

  it("the reading face loads 700 — globals.css caps .landing .result-title at it", () => {
    // .landing .result-title { font-weight: 700 } exists BECAUSE Source Sans 3
    // ships 400/600/700 and nothing heavier. If either side moves, move both.
    const fonts = read("app/fonts.ts");
    const readingBlock = fonts.slice(fonts.indexOf("Source_Sans_3"));
    expect(readingBlock).toContain('"700"');
    expect(read("app/globals.css")).toMatch(
      /\.landing \.result-title \{\s*font-weight: 700;/
    );
  });
});

describe("photo-flag branches of the landing copy", () => {
  it("flag off: two ways in, and Step 1 lists two inputs", async () => {
    const t = text(await renderLanding());
    expect(t).toContain("Two ways in.");
    expect(t).not.toContain("Three ways in.");
    expect(t).toContain("Dictate it or type it.");
  });

  it("flag on: three ways in, and Step 1 gains the photo path", async () => {
    const t = text(await renderLanding({ NEXT_PUBLIC_PHOTO_INPUT: "1" }));
    expect(t).toContain("Three ways in.");
    expect(t).not.toContain("Two ways in.");
    expect(t).toContain("Snap a photo, dictate it, or type it.");
  });
});

describe("journey-flag branches keep the feature-card set deduplicated", () => {
  it("flag off: the recap card renders, each differentiator exactly once", async () => {
    const t = text(await renderLanding());
    expect(t).toContain("A weekly recap in sentences");
    expect(t).not.toContain("A 90-day journey, recapped weekly");
    expect(count(t, "A record you can actually show someone")).toBe(1);
    expect(count(t, "It asks before it guesses")).toBe(1);
  });

  it("flag on: the journey card replaces the recap, no card duplicated", async () => {
    const t = text(await renderLanding({ NEXT_PUBLIC_LEARNING_JOURNEY: "1" }));
    expect(t).toContain("A 90-day journey, recapped weekly");
    expect(t).not.toContain("A weekly recap in sentences");
    expect(count(t, "A record you can actually show someone")).toBe(1);
  });
});

describe("footer apps column never renders an inert promise", () => {
  // "coming soon" alone would false-positive on the what-you-get lede's own
  // promise sentence ("Nothing on this list is coming soon…") — pin the exact
  // inert store strings instead.
  it("no waitlist configured: the true today-story, no inert store lines", async () => {
    const t = text(await renderLanding());
    expect(t).toContain("Add to home screen — works today");
    expect(t).not.toContain("Google Play — coming soon");
    expect(t).not.toContain("App Store — coming soon");
    expect(t).not.toContain("join the waitlist");
  });

  it("waitlist configured: store links render as real links", async () => {
    const html = await renderLanding({
      NEXT_PUBLIC_WAITLIST_URL: "https://example.com/waitlist"
    });
    expect(html).toContain('href="https://example.com/waitlist?platform=android"');
    expect(html).toContain('href="https://example.com/waitlist?platform=ios"');
    expect(text(html)).not.toContain("Google Play — coming soon");
    expect(text(html)).not.toContain("App Store — coming soon");
  });
});
