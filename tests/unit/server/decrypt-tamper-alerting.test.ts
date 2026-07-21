import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * PR-3 regression guard.
 *
 * The two highest-traffic health-data read paths (history + memory lists) must
 * decrypt through the shared `crypto.safeDecrypt`, which degrades a rotated-key
 * row quietly but reports a failing GCM auth tag (corruption or tampering) to
 * Sentry. Both handlers previously declared their own inline `safeDecrypt` with
 * a bare `catch { return "(unreadable entry)" }` that swallowed tamper silently
 * — the exact conflation `crypto.safeDecrypt` was written to fix. This is a
 * structural test in the same spirit as meal-memory-non-interference: it fails
 * if either handler reintroduces a local decrypt-swallowing shadow.
 */
const HANDLERS = [
  "app/api/history/handlers.ts",
  "app/api/memory/handlers.ts"
] as const;

describe("health-data read paths alert on decrypt tampering (PR-3)", () => {
  it.each(HANDLERS)("%s decrypts through the shared crypto.safeDecrypt", (rel) => {
    const src = readFileSync(path.join(process.cwd(), rel), "utf8");

    // Uses the shared helper (imported directly or aliased).
    expect(/\bsafeDecrypt\b/.test(src)).toBe(true);
    expect(/from "\.\.\/\.\.\/\.\.\/lib\/server\/crypto"/.test(src)).toBe(true);

    // No inline handler swallows a decrypt failure into the placeholder: the
    // placeholder string must live only in lib/server/crypto, never here.
    expect(src.includes("(unreadable entry)")).toBe(false);
  });
});
