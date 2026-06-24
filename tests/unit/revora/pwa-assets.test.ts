/**
 * Unit tests for Phase 7 PWA assets (manifest, icons, offline page, service worker).
 *
 * Node-env file-shape checks — no jsdom/browser. The install/offline behaviour itself is
 * a browser concern folded into Phase 8.1 cross-device QA; here we pin the static
 * contracts and the privacy invariant (the SW must never cache /api/check responses).
 */

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const DISCLAIMER =
  "Revora is informational only and is not medical advice. Talk with a doctor or " +
  "registered dietitian for guidance that is specific to you.";

describe("Phase 7 — web manifest", () => {
  const manifest = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));

  it("declares the installability fields", () => {
    expect(manifest.name).toBe("Revora");
    expect(manifest.short_name).toBe("Revora");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#0f172a");
    expect(manifest.background_color).toBe("#f3f7fb");
  });

  it("lists 192 + 512 icons and a maskable variant", () => {
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBe(true);
  });

  it("points every icon src at a real PNG file", () => {
    for (const icon of manifest.icons as { src: string }[]) {
      const bytes = readFileSync(`public${icon.src}`);
      expect(bytes.length).toBeGreaterThan(0);
      expect(bytes.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);
    }
  });
});

describe("Phase 7 — offline page", () => {
  it("includes the canonical disclaimer", () => {
    const html = readFileSync("public/offline.html", "utf8").replace(/\s+/g, " ");
    expect(html).toContain(DISCLAIMER);
  });
});

describe("Phase 7 — service worker privacy invariant", () => {
  const sw = readFileSync("public/sw.js", "utf8");

  it("short-circuits non-GET requests (never intercepts POST /api/check)", () => {
    expect(sw).toContain('request.method !== "GET"');
  });

  it("only intercepts navigations", () => {
    expect(sw).toContain('request.mode === "navigate"');
  });

  it("never writes responses to the cache (so no API response is ever cached)", () => {
    expect(sw).not.toMatch(/\.put\s*\(/);
  });
});
