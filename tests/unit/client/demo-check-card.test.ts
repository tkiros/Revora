import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// Vitest runs under the "node" environment (no jsdom), so a real render is not
// possible here. Instead we pin the demo card's SOURCE against the copy ledger:
// this catches silent copy drift between components/demo-check-card.tsx and the
// three ledgered lines (demo-check-reason / -adjustment / -swap) plus the
// verbatim result-footer disclaimer, and guards the "static fixture" contract —
// no form controls, no fetch. The claims boundary itself is audited separately
// by claims-boundary-copy.test.ts (the file is in COPY_FILES).
const SOURCE = fs.readFileSync(
  path.join(process.cwd(), "components/demo-check-card.tsx"),
  "utf8"
);

// JSX wraps long copy across lines, so match against whitespace-normalized
// source exactly as the claims audit does for its carve-out lines.
const NORMALIZED = SOURCE.replace(/\s+/g, " ");

describe("DemoCheckCard source (ledger + static-fixture contract)", () => {
  it("carries the MODERATE risk class and the example framing", () => {
    expect(NORMALIZED).toContain('data-risk="MODERATE"');
    expect(NORMALIZED).toContain('data-testid="demo-check-card"');
    expect(NORMALIZED).toContain("A real example");
    expect(NORMALIZED).toContain("Be careful");
  });

  it("renders the three ledgered lines verbatim (whitespace-normalized)", () => {
    expect(NORMALIZED).toContain(
      "Oatmeal on its own is a carb-heavy start, so it can have a higher blood-sugar impact than its healthy reputation suggests."
    );
    expect(NORMALIZED).toContain(
      "If practical, add protein — Greek yogurt, nuts, or eggs on the side — to make it easier to handle."
    );
    expect(NORMALIZED).toContain(
      "Steel-cut oats hold up steadier than instant packets."
    );
  });

  it("renders the shared result-footer disclaimer component (BUG-13 dedupe)", () => {
    // The verbatim string is pinned once, in components/disclaimer-line.tsx;
    // the demo card must render that shared component, not its own copy.
    expect(NORMALIZED).toContain("<DisclaimerLine />");
    expect(NORMALIZED).toContain('from "./disclaimer-line"');
  });

  it("is a static fixture: no form controls and no fetch", () => {
    expect(SOURCE).not.toMatch(/<input\b/);
    expect(SOURCE).not.toMatch(/<form\b/);
    expect(SOURCE).not.toMatch(/<button\b/);
    expect(SOURCE).not.toMatch(/\bfetch\s*\(/);
    expect(SOURCE).not.toMatch(/onClick/);
  });
});
