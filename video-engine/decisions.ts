// video-engine/decisions.ts — the G1/G2 decision log (append-only audit trail).
// Extracted so ONE reader owns the gate-discriminator backfill: both the route lib
// (lib/video-engine/dashboard) and the engine's render phase filter on it. Pure fs —
// no claude/git, safe to import anywhere.
import fs from "node:fs";
import path from "node:path";

/** gate: "g1" = script approval (render-eligible), "g2" = rendered-asset approval. */
export type Decision = { specId: string; verdict: "approve" | "reject"; gate: "g1" | "g2"; ts: string; reportRef?: string };

export function appendDecision(date: string, d: Decision, videoEngineRoot: string): void {
  const dir = path.join(videoEngineRoot, "output", date);
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(path.join(dir, "decisions.jsonl"), JSON.stringify(d) + "\n");
}

export function readDecisions(date: string, videoEngineRoot: string): Decision[] {
  try {
    return fs.readFileSync(path.join(videoEngineRoot, "output", date, "decisions.jsonl"), "utf8")
      // backfill legacy rows (written before the gate field) as g1 — they were all script approvals.
      .split("\n").filter(Boolean).map((l) => ({ gate: "g1", ...JSON.parse(l) } as Decision));
  } catch {
    return [];
  }
}

/** Spec ids that are G1-approved (render-eligible). The one place render-eligibility is
 *  decided. Append-only log → last G1 verdict per spec wins (a later reject un-approves). */
export function approvedSpecIds(date: string, videoEngineRoot: string): Set<string> {
  const latest = new Map<string, "approve" | "reject">();
  for (const d of readDecisions(date, videoEngineRoot)) if (d.gate === "g1") latest.set(d.specId, d.verdict);
  return new Set([...latest].filter(([, v]) => v === "approve").map(([id]) => id));
}
