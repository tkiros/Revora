// video-engine/store.ts
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./config";
import type { VideoSpec, Hook, ComplianceReport } from "./schema";

const outDir = (date: string, root: string) => path.resolve(root, "output", date);
const inPath = (date: string, root: string) => path.resolve(root, "input", `${date}-voc-dump.md`);

export function loadDump(date: string, root: string = ROOT): string {
  const p = inPath(date, root);
  if (!fs.existsSync(p)) throw new Error(`No VOC dump at ${p} — paste this week's material there first.`);
  const text = fs.readFileSync(p, "utf8").trim();
  if (!text) throw new Error(`VOC dump at ${p} is empty.`);
  return text;
}

/** temp-file + rename so a crash mid-write can't leave truncated output. */
function writeAtomic(dir: string, name: string, body: string): void {
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, name);
  const tmp = `${dest}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, body);
  fs.renameSync(tmp, dest);
}

export function writeJson(date: string, name: string, data: unknown, root: string = ROOT): void {
  writeAtomic(outDir(date, root), name, JSON.stringify(data, null, 2));
}

export function readJson<T>(date: string, name: string, root: string = ROOT): T {
  return JSON.parse(fs.readFileSync(path.join(outDir(date, root), name), "utf8")) as T;
}

export function writeText(date: string, name: string, text: string, root: string = ROOT): void {
  writeAtomic(outDir(date, root), name, text);
}

export function renderReview(
  date: string,
  specs: VideoSpec[],
  hooks: Hook[],
  reports: ComplianceReport[],
): string {
  const hookById = new Map(hooks.map((h) => [h.id, h]));
  const reportBySpec = new Map(reports.map((r) => [r.spec_id, r]));
  const lines: string[] = [`# G1 Review — ${date}`, ""];

  const reviewable = specs.filter((s) => reportBySpec.get(s.id)?.verdict !== "hard_fail");
  const bounced = specs.filter((s) => reportBySpec.get(s.id)?.verdict === "hard_fail");

  lines.push(`## To review (${reviewable.length})`, "");
  for (const s of reviewable) {
    const r = reportBySpec.get(s.id);
    const h = hookById.get(s.hook_id);
    lines.push(`### \`${s.id}\` — ${s.format} — ${s.duration_s}s`);
    lines.push(`- **Spoken hook:** ${s.spoken_hook}`);
    lines.push(`- **Visual hook:** ${s.visual_hook}`);
    if (h) lines.push(`- **Framework:** ${h.framework_tag} · **pillar:** ${h.pillar}`);
    lines.push(`- **Caption:** ${s.caption_text}`);
    for (const it of r?.items ?? []) {
      lines.push(`  - ⚠️ FLAG \`${it.rule}\` — "${it.span}"${it.suggestion ? ` → ${it.suggestion}` : ""}`);
    }
    lines.push(`- [ ] approve \`${s.id}\`   - [ ] reject \`${s.id}\``, "");
  }

  lines.push(`## Bounced — hard-fail, fix and re-run (${bounced.length})`, "");
  for (const s of bounced) {
    const r = reportBySpec.get(s.id);
    lines.push(`### \`${s.id}\` — ${s.format}`);
    lines.push(`- Hook: ${s.spoken_hook}`);
    for (const it of r?.items.filter((i) => i.severity === "hard_fail") ?? []) {
      lines.push(`  - ❌ \`${it.rule}\` — "${it.span}"${it.suggestion ? ` → ${it.suggestion}` : ""}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
