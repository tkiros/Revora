import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// Vitest runs under node (no jsdom), so — like demo-check-card.test.ts — this
// pins the nav's SOURCE. Runtime aria-current behavior is asserted in
// tests/smoke/dashboard.spec.ts; this guards the C7 design-review D4 contract:
// five slots (four jobs + the accent Check action), exact-match active state,
// and /subscribe lighting Account.
const SOURCE = fs.readFileSync(
  path.join(process.cwd(), "components/app-nav.tsx"),
  "utf8"
);
const NORMALIZED = SOURCE.replace(/\s+/g, " ");

describe("AppNav source (C7 five-slot contract)", () => {
  it("declares exactly the five links, in order", () => {
    const hrefs = [...SOURCE.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(["/home", "/meals", "/check", "/journey", "/account"]);
  });

  it("Check is the one action slot, with the sidebar long label", () => {
    expect(NORMALIZED).toContain('sidebarLabel: "Check a meal"');
    expect(SOURCE.match(/action:\s*true/g)).toHaveLength(1);
  });

  it("active state is exact match, plus /subscribe lighting Account", () => {
    expect(NORMALIZED).toContain("pathname === href");
    expect(NORMALIZED).toContain('href === "/account" && pathname === "/subscribe"');
    // aria-current only ever renders "page" or nothing.
    expect(NORMALIZED).toContain('aria-current={isActive(href, pathname) ? "page" : undefined}');
  });

  it("renders as one nav landmark per variant", () => {
    expect(SOURCE.match(/<nav/g)).toHaveLength(1);
    expect(NORMALIZED).toContain('aria-label="Main"');
  });
});
