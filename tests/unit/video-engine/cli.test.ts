import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "../../../video-engine/run";
import { claudeOnPath } from "../../../video-engine/llm";

describe("parseArgs", () => {
  it("bare date → full batch (no phase)", () => {
    expect(parseArgs(["2026-07-09"])).toMatchObject({ date: "2026-07-09", phase: undefined });
  });
  it("parses --phase specs --selected --maxHooks", () => {
    expect(parseArgs(["2026-07-09", "--phase", "specs", "--selected", "h1,h3", "--maxHooks", "5"]))
      .toMatchObject({ date: "2026-07-09", phase: "specs", selected: ["h1", "h3"], maxHooks: 5 });
  });
  it("--phase hooks needs no selection", () => {
    expect(parseArgs(["2026-07-09", "--phase", "hooks"])).toMatchObject({ phase: "hooks" });
  });
  it("leading flag → date defaults to today (YYYY-MM-DD)", () => {
    expect(parseArgs(["--phase", "hooks"]).date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("claudeOnPath", () => {
  it("false when PATH has no claude", () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), "ve-nopath-"));
    expect(claudeOnPath(empty)).toBe(false);
  });
  it("true when an executable claude is on PATH", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ve-path-"));
    const bin = path.join(dir, "claude");
    fs.writeFileSync(bin, "#!/bin/sh\n");
    fs.chmodSync(bin, 0o755);
    expect(claudeOnPath(dir)).toBe(true);
  });
});
