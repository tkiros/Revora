import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { musicFor } from "../../../video-engine/music";

describe("musicFor (per-format track picker, fixed = consistent)", () => {
  let dir: string;
  beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), "ve-music-")); });

  it("returns the format's track when the file exists", () => {
    fs.writeFileSync(path.join(dir, "check_demo.mp3"), "x");
    expect(musicFor("check_demo", dir)).toBe(path.join(dir, "check_demo.mp3"));
  });

  it("degrades to null (silent) when no track is dropped in yet — never throws", () => {
    expect(musicFor("myth_label_trap", dir)).toBeNull();
  });
});
