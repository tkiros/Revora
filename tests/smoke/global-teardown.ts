import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Undoes the dev-artifact rewrite the PAYWALL_MODE=trial server leaves behind.
 *
 * `next dev` regenerates two TRACKED files on boot — tsconfig.json (the
 * `include` globs) and next-env.d.ts (the generated-routes import) — to wire in
 * `${distDir}/...`. The trial server on :3101 runs with
 * NEXT_DIST_DIR=".next/e2e-trial" (see playwright.config.ts / next.config.ts),
 * so after a run that booted it those files carry a ".next/e2e-trial" segment
 * and the working tree is left dirty. On a test-only CI leg no default-distDir
 * `next dev` ever runs afterward to heal it, so a clean-tree gate or a tsc step
 * would fail, or the e2e-trial paths could be committed by accident.
 *
 * The two files are restored differently because `next dev` mutates them
 * differently, and each restore is SURGICAL — no `git checkout`, so it needs no
 * git (works in bare checkouts) and preserves any unrelated local edits:
 *
 *   - tsconfig.json — `next dev` ADDS its distDir's type-include globs to the
 *     `include` array without removing the other distDir's; a blind string
 *     substitution would leave duplicates. So we drop exactly the `include`
 *     entries that contain the marker, which leaves the committed set intact.
 *     JSON round-trip keeps commas/formatting valid.
 *   - next-env.d.ts — the routes import is a single line `next dev` OVERWRITES
 *     (not appends), so collapsing the ".next/e2e-trial" segment back to
 *     ".next" restores it exactly.
 *
 * Both restores are gated on the marker actually being present, so an unrelated
 * run (or one where the default server wrote last) is a no-op.
 */

const MARKER = ".next/e2e-trial";
const DEFAULT_DIST = ".next";

function restoreTsconfig(path: string): void {
  const before = readFileSync(path, "utf8");
  if (!before.includes(MARKER)) return;
  const cfg = JSON.parse(before) as { include?: unknown };
  if (Array.isArray(cfg.include)) {
    cfg.include = cfg.include.filter(
      (glob) => !(typeof glob === "string" && glob.includes(MARKER))
    );
  }
  const after = `${JSON.stringify(cfg, null, 2)}\n`;
  if (after !== before) writeFileSync(path, after);
}

function restoreNextEnv(path: string): void {
  const before = readFileSync(path, "utf8");
  if (!before.includes(MARKER)) return;
  const after = before.split(MARKER).join(DEFAULT_DIST);
  if (after !== before) writeFileSync(path, after);
}

export default function globalTeardown(): void {
  const tsconfig = join(process.cwd(), "tsconfig.json");
  const nextEnv = join(process.cwd(), "next-env.d.ts");
  if (existsSync(tsconfig)) restoreTsconfig(tsconfig);
  if (existsSync(nextEnv)) restoreNextEnv(nextEnv);
}
