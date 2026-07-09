// video-engine/export.ts
// v1 export is a passthrough seam (eng review: master.mp4 only — all three platforms accept
// the same 9:16 H.264 master; per-platform re-encode is deferred). Its real job is assembling
// the compliant posting caption: the disclosure MUST ship in the caption when claims are used
// (16 CFR 255 dual-mode — the caption half; disclosure.ts renders the on-screen half).
import type { VideoSpec } from "./schema";
import { disclosureLayer } from "./disclosure";

export type PostingPackage = { masterPath: string; caption: string };

export function buildPostingPackage(spec: VideoSpec, masterPath: string): PostingPackage {
  const d = disclosureLayer(spec);
  const caption = d.required ? `${spec.caption_text}\n\n${d.captionText}` : spec.caption_text;
  return { masterPath, caption };
}
