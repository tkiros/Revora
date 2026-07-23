import { describe, expect, it } from "vitest";

import { includesTrialWall } from "../../scripts/e2e-spec-selection";
import {
  buildModesForArgs,
  stripE2ETypeIncludes
} from "../../scripts/run-playwright";

describe("E2E production-build selection", () => {
  it("builds both modes for full, ambiguous, and trial-wall runs", () => {
    expect(includesTrialWall([])).toBe(true);
    expect(includesTrialWall(["tests/smoke/"])).toBe(true);
    expect(includesTrialWall(["tests/smoke/trial-wall.spec.ts"])).toBe(true);
    expect(buildModesForArgs([])).toEqual(["legacy", "trial"]);
  });

  it("builds only legacy for concrete unrelated specs", () => {
    const args = [
      "tests/smoke/a11y.spec.ts",
      "--project=Mobile Chrome",
      "--workers=1"
    ];
    expect(includesTrialWall(args)).toBe(false);
    expect(buildModesForArgs(args)).toEqual(["legacy"]);
  });

  it("surgically removes generated E2E type globs", () => {
    const source = `${JSON.stringify(
      {
        compilerOptions: { strict: true },
        include: [
          "**/*.ts",
          ".next-e2e-legacy/types/**/*.ts",
          "custom/**/*.ts",
          ".next-e2e-trial/types/**/*.ts"
        ]
      },
      null,
      2
    )}\n`;

    expect(stripE2ETypeIncludes(source)).toBe(
      `${JSON.stringify(
        {
          compilerOptions: { strict: true },
          include: ["**/*.ts", "custom/**/*.ts"]
        },
        null,
        2
      )}\n`
    );
  });

  it("does not rewrite a tsconfig with no generated E2E globs", () => {
    expect(
      stripE2ETypeIncludes(
        `${JSON.stringify({ include: ["**/*.ts", ".next/types/**/*.ts"] })}\n`
      )
    ).toBeNull();
  });
});
