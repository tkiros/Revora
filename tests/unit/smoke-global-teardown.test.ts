import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import globalTeardown from "../smoke/global-teardown";

// The teardown is the only thing keeping the tracked tsconfig.json clean after
// an e2e run boots the :3101 trial server (NEXT_DIST_DIR=.next-e2e-trial). It
// operates on process.cwd(), so each test runs it inside a temp directory.

const COMMITTED_INCLUDE = [
  "next-env.d.ts",
  "**/*.ts",
  "**/*.tsx",
  ".next/types/**/*.ts",
  ".next/dev/types/**/*.ts",
];

let dir: string;
let originalCwd: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "teardown-test-"));
  originalCwd = process.cwd();
  process.chdir(dir);
});

afterEach(() => {
  process.chdir(originalCwd);
  rmSync(dir, { recursive: true, force: true });
});

function writeTsconfig(include: string[]): void {
  writeFileSync(
    join(dir, "tsconfig.json"),
    `${JSON.stringify({ compilerOptions: { strict: true }, include }, null, 2)}\n`
  );
}

function readInclude(): string[] {
  return JSON.parse(readFileSync(join(dir, "tsconfig.json"), "utf8")).include;
}

describe("smoke global-teardown", () => {
  it("drops exactly the e2e-trial include globs the trial server added", () => {
    writeTsconfig([
      ...COMMITTED_INCLUDE,
      ".next-e2e-trial/types/**/*.ts",
      ".next-e2e-trial/dev/types/**/*.ts",
    ]);
    globalTeardown();
    expect(readInclude()).toEqual(COMMITTED_INCLUDE);
  });

  it("is a no-op when no marker is present", () => {
    writeTsconfig(COMMITTED_INCLUDE);
    const before = readFileSync(join(dir, "tsconfig.json"), "utf8");
    globalTeardown();
    expect(readFileSync(join(dir, "tsconfig.json"), "utf8")).toBe(before);
  });

  it("is idempotent across repeated runs", () => {
    writeTsconfig([...COMMITTED_INCLUDE, ".next-e2e-trial/types/**/*.ts"]);
    globalTeardown();
    const healed = readFileSync(join(dir, "tsconfig.json"), "utf8");
    globalTeardown();
    expect(readFileSync(join(dir, "tsconfig.json"), "utf8")).toBe(healed);
  });

  it("does not crash when tsconfig.json is absent", () => {
    expect(() => globalTeardown()).not.toThrow();
  });
});
