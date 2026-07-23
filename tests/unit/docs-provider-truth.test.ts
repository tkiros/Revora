import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const CURRENT_TRUTH_DOCS = [
  "docs/adr/analytics-umami.md",
  "docs/adr/hosting-hybrid.md",
  "docs/adr/stack.md",
  "docs/ops/launch-checklist.md",
  "docs/handoff/human-actions-required.md",
];

describe("authoritative provider documentation", () => {
  it.each(CURRENT_TRUTH_DOCS)(
    "%s does not instruct launch operators to self-host Umami on Railway",
    (path) => {
      const contents = readFileSync(resolve(process.cwd(), path), "utf8");

      expect(contents).not.toMatch(
        /(?:deploy|host|hosted|hosting)[^\n]{0,80}umami[^\n]{0,80}railway|umami[^\n]{0,80}(?:deploy|host|hosted|hosting)[^\n]{0,80}railway/i,
      );
    },
  );

  it("names only the dedicated private Pantry Blob credential in operator templates", () => {
    const envExample = readFileSync(
      resolve(process.cwd(), ".env.example"),
      "utf8",
    );
    const humanActions = readFileSync(
      resolve(process.cwd(), "docs/handoff/human-actions-required.md"),
      "utf8",
    );

    expect(envExample).toContain("PANTRY_BLOB_READ_WRITE_TOKEN=");
    expect(envExample).not.toMatch(/^BLOB_READ_WRITE_TOKEN=/m);
    expect(humanActions).toContain("PANTRY_BLOB_READ_WRITE_TOKEN");
    expect(humanActions).toContain("dedicated private Vercel Blob store");
  });
});
