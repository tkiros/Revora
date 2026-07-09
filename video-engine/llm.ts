// video-engine/llm.ts
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { ZodType } from "zod";
import { MODEL } from "./config";

export type ClaudeRunner = (prompt: string) => Promise<string>;

/** Preflight: is an executable `claude` resolvable on PATH? (avoid a mid-run ENOENT). */
export function claudeOnPath(pathEnv: string = process.env.PATH ?? ""): boolean {
  return pathEnv.split(path.delimiter).filter(Boolean).some((dir) => {
    try {
      fs.accessSync(path.join(dir, "claude"), fs.constants.X_OK);
      return true;
    } catch {
      return false;
    }
  });
}

// Default runner: pipe the prompt to `claude -p` via STDIN (never argv — ARG_MAX).
const defaultRunner: ClaudeRunner = (prompt) =>
  new Promise((resolve, reject) => {
    const args = ["-p", "--output-format", "json", ...(MODEL ? ["--model", MODEL] : [])];
    const child = spawn("claude", args, { stdio: ["pipe", "pipe", "pipe"] });
    let out = "", err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(`claude exited ${code}: ${err}`));
      try {
        const env = JSON.parse(out);
        resolve(typeof env.result === "string" ? env.result : out);
      } catch {
        resolve(out); // envelope wasn't JSON; hand raw text to extractJson
      }
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });

export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : text).trim();
  try {
    return JSON.parse(body);
  } catch {
    const starts = ["{", "["].map((c) => body.indexOf(c)).filter((i) => i >= 0);
    const first = starts.length ? Math.min(...starts) : -1;
    const last = Math.max(body.lastIndexOf("}"), body.lastIndexOf("]"));
    if (first < 0 || last < 0) throw new Error("no JSON found in model output");
    return JSON.parse(body.slice(first, last + 1));
  }
}

export async function llm<T>(
  prompt: string,
  schema: ZodType<T>,
  opts?: { runner?: ClaudeRunner },
): Promise<T> {
  const runner = opts?.runner ?? defaultRunner;
  const attempt = async (p: string) => schema.parse(extractJson(await runner(p)));
  try {
    return await attempt(prompt);
  } catch (e) {
    // one retry that feeds the ACTUAL failure back so the model can self-correct
    // (the A2/A3 contract bugs from the real run would both have auto-fixed here);
    // a second failure throws (dead-letter).
    const why = e instanceof Error ? e.message : String(e);
    return attempt(`${prompt}\n\nYour previous output was invalid and failed validation:\n${why}\n\nFix exactly those problems and return ONLY the corrected JSON object matching the schema — no prose, no code fences.`);
  }
}
