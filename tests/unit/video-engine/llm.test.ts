// tests/unit/video-engine/llm.test.ts
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { extractJson, llm } from "../../../video-engine/llm";

const S = z.object({ a: z.number() });

describe("extractJson", () => {
  it("parses bare JSON", () => { expect(extractJson('{"a":1}')).toEqual({ a: 1 }); });
  it("parses fenced JSON with prose around it", () => {
    expect(extractJson('Sure:\n```json\n{"a":1}\n```\ndone')).toEqual({ a: 1 });
  });
  it("parses a top-level array", () => { expect(extractJson("[1,2]")).toEqual([1, 2]); });
});

describe("llm", () => {
  it("validates a good response", async () => {
    const out = await llm("p", S, { runner: async () => '{"a":1}' });
    expect(out).toEqual({ a: 1 });
  });

  it("retries once on invalid JSON then succeeds", async () => {
    let n = 0;
    const runner = async () => (n++ === 0 ? "not json" : '{"a":2}');
    expect(await llm("p", S, { runner })).toEqual({ a: 2 });
    expect(n).toBe(2);
  });

  it("throws after a second failure", async () => {
    await expect(llm("p", S, { runner: async () => "nope" })).rejects.toThrow();
  });
});
