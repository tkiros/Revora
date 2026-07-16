/**
 * Re-judge errored/missing verdicts in an existing panel output file, in place.
 * Personas, prompt, and judge model come from run-panel.mjs semantics — this
 * exists so a credit/provider outage mid-run costs a patch pass, not a re-run.
 *
 * Usage: OPENROUTER_API_KEY=... node scripts/dietitian-panel/rejudge-errors.mjs <live-outputs.json> <panel-file.json>
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [inFile, panelFile] = process.argv.slice(2);
if (!process.env.OPENROUTER_API_KEY || !inFile || !panelFile) {
  throw new Error("usage: OPENROUTER_API_KEY=... node rejudge-errors.mjs <live-outputs> <panel-file>");
}

const panel = JSON.parse(fs.readFileSync(panelFile, "utf8"));
const capture = JSON.parse(fs.readFileSync(inFile, "utf8"));

const PERSONA_IDS = ["rd-generalist", "rd-diabetes-specialist", "cdces"];
const gradedCaseIds = [...new Set(panel.results.map((r) => r.caseId))];
const missing = [];
for (const caseId of gradedCaseIds) {
  for (const persona of PERSONA_IDS) {
    const row = panel.results.find((r) => r.caseId === caseId && r.persona === persona);
    if (!row || row.error) missing.push({ caseId, persona });
  }
}
if (missing.length === 0) {
  console.log(`${panelFile}: no errored/missing verdicts`);
  process.exit(0);
}
console.log(`re-judging ${missing.length} verdicts in ${panelFile}`);

// Reuse run-panel.mjs by building a mini capture of only the affected cases and
// grading it into a temp file, then splicing the fresh verdicts back in.
const wanted = new Set(missing.map((m) => m.caseId));
const mini = { ...capture, rows: capture.rows.filter((r) => wanted.has(r.id)) };
const tmpIn = path.join(os.tmpdir(), `rejudge-in-${process.pid}.json`);
const tmpOut = path.join(os.tmpdir(), `rejudge-out-${process.pid}.json`);
fs.writeFileSync(tmpIn, JSON.stringify(mini));
execFileSync("node", [new URL("./run-panel.mjs", import.meta.url).pathname, tmpIn, tmpOut], {
  stdio: "inherit",
  env: process.env
});
const fresh = JSON.parse(fs.readFileSync(tmpOut, "utf8"));
let patched = 0;
for (const m of missing) {
  const f = fresh.results.find((r) => r.caseId === m.caseId && r.persona === m.persona);
  if (!f || f.error) { console.log(`still failing: ${m.caseId}/${m.persona}`); continue; }
  const idx = panel.results.findIndex((r) => r.caseId === m.caseId && r.persona === m.persona);
  if (idx >= 0) panel.results[idx] = f; else panel.results.push(f);
  patched += 1;
}
fs.rmSync(tmpIn); fs.rmSync(tmpOut);
fs.writeFileSync(panelFile, JSON.stringify(panel, null, 2));
console.log(`patched ${patched}/${missing.length} verdicts into ${panelFile}`);
