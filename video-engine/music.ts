// video-engine/music.ts
// Per-format track picker. Fixed track per format = consistency (design §music.ts).
// Pure lookup: <musicRoot>/<format>.mp3 if present, else null (render stays silent).
// ponytail: v1 ships no royalty-free tracks in-repo (a content task, not code). Drop
// <format>.mp3 files into video-engine/assets/music/ and they light up automatically;
// wiring the <Audio> layer into the composition follows once real tracks exist.
import fs from "node:fs";
import path from "node:path";
import type { Format } from "./schema";

export function musicFor(format: Format, musicRoot: string): string | null {
  const track = path.join(musicRoot, `${format}.mp3`);
  return fs.existsSync(track) ? track : null;
}
