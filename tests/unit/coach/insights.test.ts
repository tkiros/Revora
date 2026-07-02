import { describe, expect, it } from "vitest";

import { deriveInsight } from "../../../lib/coach/insights";
import type { StoredCheck } from "../../../lib/client/history-store";

function check(overrides: Partial<StoredCheck> = {}): StoredCheck {
  return {
    clientId: crypto.randomUUID(),
    food: "lentil soup",
    risk: "SAFE",
    a1cBand: "prediabetes_60_62",
    inputMethod: "text",
    createdAt: "2026-07-01T12:00:00.000Z",
    ...overrides
  };
}

function atLocalHour(hour: number, day = 1): string {
  return new Date(2026, 6, day, hour, 0, 0).toISOString();
}

// Backward-judgment family is banned outright (tone policy: forward
// permission only). Any insight string containing these fails.
const BANNED_BACKWARD_JUDGMENT = [
  /you failed/i,
  /you should have/i,
  /you shouldn't have/i,
  /too much/i,
  /you blew/i,
  /bad choice/i,
  /don't eat/i,
  /stop eating/i,
  /\bavoid\b/i,
  /\bnever\b/i,
  /disappoint/i
];

// The claims boundary applies to every generated string too.
const BANNED_CLAIMS = [
  /\brevers/i,
  /\bcur(?:e|es|ed|ing)\b/i,
  /\btreat/i,
  /\bprevent/i,
  /\bdiagnos/i,
  /\bcalorie/i,
  /\bgrams?\b/i,
  /mg\/?dl/i
];

function expectCompliant(text: string) {
  for (const pattern of [...BANNED_BACKWARD_JUDGMENT, ...BANNED_CLAIMS]) {
    expect(text).not.toMatch(pattern);
  }
}

describe("deriveInsight", () => {
  it("returns null under five checks — no premature patterns", () => {
    const checks = Array.from({ length: 4 }, () => check({ risk: "HIGH" }));

    expect(deriveInsight(checks)).toBeNull();
  });

  it("surfaces the most frequent daypart for MODERATE/HIGH meals with forward-permission copy", () => {
    const checks = [
      check({ risk: "MODERATE", createdAt: atLocalHour(7, 1) }),
      check({ risk: "HIGH", createdAt: atLocalHour(8, 2) }),
      check({ risk: "MODERATE", createdAt: atLocalHour(9, 3) }),
      check({ risk: "SAFE", createdAt: atLocalHour(13, 3) }),
      check({ risk: "SAFE", createdAt: atLocalHour(19, 4) })
    ];

    const insight = deriveInsight(checks);

    expect(insight).not.toBeNull();
    expect(insight!.text).toContain("breakfast");
    expect(insight!.text.toLowerCase()).toContain("swap");
    expectCompliant(insight!.text);
  });

  it("recognizes a repeated meal and frames it as a strength", () => {
    const checks = [
      check({ food: "Oatmeal with nuts", risk: "SAFE", createdAt: atLocalHour(8, 1) }),
      check({ food: "oatmeal with nuts", risk: "SAFE", createdAt: atLocalHour(8, 2) }),
      check({ food: "oatmeal with nuts ", risk: "SAFE", createdAt: atLocalHour(8, 3) }),
      check({ food: "salmon and greens", risk: "SAFE", createdAt: atLocalHour(19, 3) }),
      check({ food: "salad bowl", risk: "SAFE", createdAt: atLocalHour(13, 4) })
    ];

    const insight = deriveInsight(checks);

    expect(insight).not.toBeNull();
    expect(insight!.text.toLowerCase()).toContain("oatmeal with nuts");
    expectCompliant(insight!.text);
  });

  it("prefers the daypart insight when both patterns exist", () => {
    const checks = [
      check({ food: "bagel", risk: "MODERATE", createdAt: atLocalHour(8, 1) }),
      check({ food: "bagel", risk: "MODERATE", createdAt: atLocalHour(8, 2) }),
      check({ food: "bagel", risk: "MODERATE", createdAt: atLocalHour(8, 3) }),
      check({ food: "salad", risk: "SAFE", createdAt: atLocalHour(13, 3) }),
      check({ food: "salmon", risk: "SAFE", createdAt: atLocalHour(19, 4) })
    ];

    const insight = deriveInsight(checks);

    expect(insight).not.toBeNull();
    expect(insight!.id).toBe("daypart");
  });

  it("returns null when there is no pattern to speak to (all SAFE, no repeats)", () => {
    const checks = [
      check({ food: "salad", createdAt: atLocalHour(8, 1) }),
      check({ food: "salmon", createdAt: atLocalHour(13, 2) }),
      check({ food: "eggs", createdAt: atLocalHour(19, 3) }),
      check({ food: "soup", createdAt: atLocalHour(8, 4) }),
      check({ food: "tofu bowl", createdAt: atLocalHour(13, 5) })
    ];

    expect(deriveInsight(checks)).toBeNull();
  });

  it("every producible insight string passes the banned-phrase audit", () => {
    // Exercise both templates across all dayparts.
    for (const hour of [8, 13, 19]) {
      const checks = [
        check({ risk: "HIGH", createdAt: atLocalHour(hour, 1) }),
        check({ risk: "HIGH", createdAt: atLocalHour(hour, 2) }),
        check({ risk: "MODERATE", createdAt: atLocalHour(hour, 3) }),
        check({ risk: "SAFE", createdAt: atLocalHour(10, 4) }),
        check({ risk: "SAFE", createdAt: atLocalHour(14, 5) })
      ];
      const insight = deriveInsight(checks);
      expect(insight).not.toBeNull();
      expectCompliant(insight!.text);
    }
  });
});
