import fs from "node:fs";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createCheckRouteHandler } from "../../../app/api/check/route";

const DISCLAIMER =
  "Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you.";

const PROJECT_ROOT = process.cwd();

function readProjectFile(relativePath: string) {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), "utf8");
}

function collectTsFiles(relativeDir: string): string[] {
  const absoluteDir = path.join(PROJECT_ROOT, relativeDir);

  return fs.readdirSync(absoluteDir, { recursive: true })
    .filter((entry) => typeof entry === "string")
    .map((entry) => path.join(relativeDir, entry))
    .filter((entry) => entry.endsWith(".ts") || entry.endsWith(".tsx"));
}

function createRequest(body: unknown) {
  return new Request("http://localhost/api/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

describe("privacy-minimal audit", () => {
  it("keeps one OpenAI wrapper, one route-to-service path, and no raw request logging", () => {
    const routeSource = readProjectFile("app/api/check/route.ts");
    const serviceSource = readProjectFile("lib/revora/service.ts");
    const wrapperSource = readProjectFile("lib/revora/openai-client.ts");
    const telemetrySource = readProjectFile("lib/revora/telemetry.ts");

    expect(routeSource).toMatch(/checkFood/);
    expect(routeSource).toMatch(/emitSafeEvent/);
    expect(routeSource).not.toMatch(/console\.(log|info|warn|error)/);
    expect(routeSource).not.toMatch(/body\s*[),]/);

    expect(serviceSource).toMatch(/from "\.\/openai-client"/);
    expect(serviceSource).not.toMatch(/responses\.create/);

    expect(wrapperSource).toMatch(/store:\s*false/);

    expect(telemetrySource).not.toMatch(/food:/);
    expect(telemetrySource).not.toMatch(/a1c:/i);
    expect(telemetrySource).not.toMatch(/promptText/);
    expect(telemetrySource).not.toMatch(/modelOutput/);

    const sdkImportsOutsideWrapper = [
      "app/page.tsx",
      "app/api/check/route.ts",
      "lib/revora/service.ts",
      ...collectTsFiles("components"),
      ...collectTsFiles("lib/client")
    ].filter((filePath) => {
      const source = readProjectFile(filePath);
      return /from ["']openai["']|new OpenAI\(/.test(source);
    });

    expect(sdkImportsOutsideWrapper).toEqual([]);
  });

  it("emits coarse completion telemetry after checkFood returns", async () => {
    const emitEvent = vi.fn();
    const model = { generate: vi.fn() };
    const checkFoodImpl = vi.fn().mockResolvedValue({
      kind: "result",
      risk: "SAFE",
      reason: "This looks balanced.",
      adjustment: null,
      swap: null,
      disclaimer: DISCLAIMER
    });

    const POST = createCheckRouteHandler({
      checkFoodImpl,
      emitEvent,
      modelFactory: () => model,
      now: vi.fn().mockReturnValueOnce(1_000).mockReturnValueOnce(2_500)
    });

    const response = await POST(
      createRequest({
        food: "lentil soup",
        a1c: 6.1
      })
    );

    expect(checkFoodImpl).toHaveBeenCalledWith(
      {
        food: "lentil soup",
        a1c: 6.1
      },
      { model }
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      kind: "result",
      risk: "SAFE"
    });
    expect(emitEvent).toHaveBeenCalledWith({
      name: "check_completed",
      environment: "test",
      responseKind: "result",
      risk: "SAFE",
      latencyBucket: "<2s"
    });
  });

  it("emits coarse failure telemetry and returns a safe retry response", async () => {
    const emitEvent = vi.fn();
    const model = { generate: vi.fn() };
    const checkFoodImpl = vi
      .fn()
      .mockRejectedValue(new Error("provider timeout for sweetened cereal"));

    const POST = createCheckRouteHandler({
      checkFoodImpl,
      emitEvent,
      modelFactory: () => model,
      now: vi.fn().mockReturnValueOnce(1_000).mockReturnValueOnce(9_000)
    });

    const response = await POST(
      createRequest({
        food: "sweetened cereal",
        a1c: 6.4
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      kind: "retry",
      disclaimer: DISCLAIMER
    });
    expect(emitEvent).toHaveBeenCalledWith({
      name: "check_failed",
      environment: "test",
      reasonCode: "provider_error",
      latencyBucket: "5-12s"
    });
  });
});
