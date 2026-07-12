import { beforeEach, describe, expect, it, vi } from "vitest";

import { deriveInsight } from "../../../lib/coach/insights";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_LONGITUDINAL_INSIGHTS", "1");
});
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
    expect(insight!.text.toLowerCase()).toContain("pattern");
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

/**
 * F-13 (P0). `deriveRepeatMealInsight` keyed only on `check.food` and never
 * read `check.risk` — so a user who checked orange juice three times (a HIGH
 * verdict, and one of the app's own onboarding examples) was congratulated:
 *
 *   "Orange juice is one of your go-to meals — a steady choice you already
 *    know makes the daily decision easy."
 *
 * The product affirmatively endorsing a habit it had just told the user to hold
 * off on. It passed every existing gate, because "steady choice" contains no
 * banned word.
 */
describe("F-13 — the repeat-meal insight must read the verdict", () => {
  function repeated(
    risk: StoredCheck["risk"],
    food = "orange juice"
  ): StoredCheck[] {
    // The three repeats are spread across breakfast/lunch/dinner on purpose.
    // The daypart rule is evaluated FIRST and would otherwise win on a
    // concentrated set, masking whatever the repeat rule does — so spreading
    // them (no daypart majority) is what makes these tests actually exercise
    // the rule they name.
    return [
      check({ food, risk, createdAt: atLocalHour(8, 1) }),
      check({ food, risk, createdAt: atLocalHour(13, 2) }),
      check({ food, risk, createdAt: atLocalHour(19, 3) }),
      check({ food: "lentil soup", risk: "SAFE", createdAt: atLocalHour(8, 5) }),
      check({ food: "tofu stir fry", risk: "SAFE", createdAt: atLocalHour(19, 6) })
    ];
  }

  it.each(["HIGH", "MODERATE"] as const)(
    "never calls a repeatedly-%s meal 'a steady choice'",
    (risk) => {
      const insight = deriveInsight(repeated(risk));

      expect(insight?.id).not.toBe("repeat_meal");
      expect(insight?.text ?? "").not.toMatch(/steady choice/i);
    }
  );

  it("still praises a repeatedly-SAFE meal", () => {
    const insight = deriveInsight(repeated("SAFE", "lentil soup"));

    expect(insight?.id).toBe("repeat_meal");
    expect(insight?.text).toMatch(/steady choice/i);
  });

  it("turns a repeatedly-flagged meal into the highest-leverage next step", () => {
    // The flagged repeat is the single most useful thing to say to this user —
    // it just must never be a compliment.
    const insight = deriveInsight(repeated("HIGH"));

    expect(insight?.id).toBe("repeat_meal_risk");
    expect(insight?.text).toMatch(/one swap pays off most/i);
    for (const pattern of BANNED_BACKWARD_JUDGMENT) {
      expect(insight?.text ?? "").not.toMatch(pattern);
    }
  });

  it("the daypart insight does not call HIGH meals merely 'be careful'", () => {
    // It counts MODERATE ∪ HIGH but used to label them all with the MODERATE
    // word, under-reporting its own severity.
    const checks = [
      check({ risk: "HIGH", food: "cake", createdAt: atLocalHour(19, 1) }),
      check({ risk: "HIGH", food: "soda", createdAt: atLocalHour(20, 2) }),
      check({ risk: "HIGH", food: "cookies", createdAt: atLocalHour(21, 3) }),
      check({ risk: "SAFE", food: "eggs", createdAt: atLocalHour(8, 4) }),
      check({ risk: "SAFE", food: "salad", createdAt: atLocalHour(13, 5) })
    ];

    const insight = deriveInsight(checks);

    expect(insight?.id).toBe("daypart");
    expect(insight?.text).toMatch(/hold off/i);
  });
});
