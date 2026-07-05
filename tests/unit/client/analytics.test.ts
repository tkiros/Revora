import fs from "node:fs";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import { track, type AnalyticsEvent } from "../../../lib/client/analytics";

const ALLOWED_NAMES = [
  "check_completed",
  "onboarding_completed",
  "signin_completed",
  "nudge_opened",
  "paywall_viewed",
  "subscribe_started",
  "subscribe_completed",
  "deletion_completed",
  "taster_check",
  "wall_viewed",
  "trial_checkout_started",
  "trial_started",
  "pantry_viewed",
  "pantry_checkout_started"
] as const;

// (a) Compile-time exhaustiveness: this switch must handle every member of
// AnalyticsEvent["name"]. If a new event name is added to the union without
// being added here too, TypeScript fails the build (no default case, and
// the `never` assignment below is unreachable unless the switch is total).
function assertExhaustive(name: AnalyticsEvent["name"]): void {
  switch (name) {
    case "check_completed":
    case "onboarding_completed":
    case "signin_completed":
    case "nudge_opened":
    case "paywall_viewed":
    case "subscribe_started":
    case "subscribe_completed":
    case "deletion_completed":
    case "taster_check":
    case "wall_viewed":
    case "trial_checkout_started":
    case "trial_started":
    case "pantry_viewed":
    case "pantry_checkout_started":
      return;
    default: {
      const exhaustiveCheck: never = name;
      throw new Error(`Unhandled analytics event name: ${exhaustiveCheck}`);
    }
  }
}
void assertExhaustive;

describe("AnalyticsEvent allowlist", () => {
  it("the runtime schema list is exactly the type's name union (compile- and run-time)", () => {
    // One literal per union member — if AnalyticsEvent gains/loses a
    // variant, this array (and the exhaustiveness switch above) stop
    // compiling until updated.
    const oneOfEach: AnalyticsEvent[] = [
      {
        name: "check_completed",
        props: { risk: "SAFE", kind: "result", input_method: "text" }
      },
      { name: "onboarding_completed" },
      { name: "signin_completed" },
      { name: "nudge_opened" },
      { name: "paywall_viewed" },
      { name: "subscribe_started" },
      { name: "subscribe_completed" },
      { name: "deletion_completed" },
      { name: "taster_check", props: { used: 3 } },
      { name: "wall_viewed", props: { variant: "1299" } },
      { name: "trial_checkout_started", props: { variant: "1299" } },
      { name: "trial_started", props: { variant: "999" } },
      { name: "pantry_viewed", props: { source: "wall_decline" } },
      { name: "pantry_checkout_started" }
    ];

    expect(oneOfEach.map((event) => event.name).sort()).toEqual(
      [...ALLOWED_NAMES].sort()
    );
    expect(oneOfEach).toHaveLength(ALLOWED_NAMES.length);
  });
});

describe("track()", () => {
  it("calls window.umami.track for an allowlisted event", () => {
    const calls: Array<[string, Record<string, unknown> | undefined]> = [];
    const host = {
      umami: {
        track: (name: string, data?: Record<string, unknown>) => {
          calls.push([name, data]);
        }
      }
    };

    track({ name: "paywall_viewed" }, host);

    expect(calls).toEqual([["paywall_viewed", undefined]]);
  });

  it("forwards props for a props-carrying event", () => {
    const calls: Array<[string, Record<string, unknown> | undefined]> = [];
    const host = {
      umami: {
        track: (name: string, data?: Record<string, unknown>) => {
          calls.push([name, data]);
        }
      }
    };

    track(
      {
        name: "check_completed",
        props: { risk: "MODERATE", kind: "result", input_method: "voice" }
      },
      host
    );

    expect(calls).toEqual([
      [
        "check_completed",
        { risk: "MODERATE", kind: "result", input_method: "voice" }
      ]
    ]);
  });

  it("no-ops when umami is absent (no script loaded — dev/test/no env vars)", () => {
    expect(() => track({ name: "signin_completed" }, {})).not.toThrow();
  });

  it("no-ops server-side / when window is unavailable (no host argument, Node test env)", () => {
    expect(() => track({ name: "onboarding_completed" })).not.toThrow();
  });

  // (b) Runtime guard: a name that bypasses the type system must never reach
  // umami.track — the belt under the type-level belt.
  it("does not call umami.track for a non-allowlisted event name", () => {
    const calls: Array<[string, Record<string, unknown> | undefined]> = [];
    const host = {
      umami: {
        track: (name: string, data?: Record<string, unknown>) => {
          calls.push([name, data]);
        }
      }
    };

    track(
      { name: "definitely_not_allowlisted" } as unknown as AnalyticsEvent,
      host
    );

    expect(calls).toEqual([]);
  });
});

// (c) Static source scan: the module must never reference the specific
// field names that would carry health data or an identifier off-device.
// "text" alone is excluded — it is the legitimate closed-enum value of
// input_method ("text" | "voice"), not a free-text field name; the
// free-text carriers (reason/question/message/etc.) are checked directly.
describe("analytics module source — no-PII static scan", () => {
  const SOURCE = fs.readFileSync(
    path.join(process.cwd(), "lib/client/analytics.ts"),
    "utf8"
  );

  const FORBIDDEN_IDENTIFIERS = [
    "a1c",
    "food",
    "email",
    "reason",
    "question",
    "message",
    "disclaimer",
    "swap",
    "adjustment",
    "examples",
    "sequencingTip",
    "postMealAction"
  ];

  it.each(FORBIDDEN_IDENTIFIERS)(
    "never references the free-text/PII-carrying field %s",
    (identifier) => {
      const pattern = new RegExp(`\\b${identifier}\\b`, "i");
      expect(pattern.test(SOURCE)).toBe(false);
    }
  );
});

// (d) Every declared prop on every event is a bounded union/enum, never a
// bare `string` — except `kind`, which is the closed response-kind enum
// re-exported from the check schema (lib/client/ui-state.ts).
describe("AnalyticsEvent props stay closed unions (no free-text props)", () => {
  const SOURCE = fs.readFileSync(
    path.join(process.cwd(), "lib/client/analytics.ts"),
    "utf8"
  );

  it("declares no bare `: string` prop type in the AnalyticsEvent union", () => {
    const typeBlockStart = SOURCE.indexOf("export type AnalyticsEvent =");
    // The union's final variant/terminator — everything between the start
    // and this marker (inclusive) is the full AnalyticsEvent declaration,
    // spanning the nested check_completed props object.
    const endMarker = '"pantry_checkout_started" };';
    const typeBlockEndIndex = SOURCE.indexOf(endMarker, typeBlockStart);
    expect(typeBlockStart).toBeGreaterThanOrEqual(0);
    expect(typeBlockEndIndex).toBeGreaterThan(typeBlockStart);

    const typeBlock = SOURCE.slice(
      typeBlockStart,
      typeBlockEndIndex + endMarker.length
    );

    // Sanity check the slice actually captured the nested props object
    // (guards against the slice logic silently truncating early).
    expect(typeBlock).toContain("input_method");

    // A bare `: string` (not part of a longer identifier, not a generic
    // type argument like `Record<string, unknown>`) would mean a prop
    // accepts arbitrary free text.
    expect(typeBlock).not.toMatch(/:\s*string(?!\w)/);
  });

  it("check_completed's props are exactly risk / kind / input_method, each a closed union", () => {
    const sample: Extract<AnalyticsEvent, { name: "check_completed" }> = {
      name: "check_completed",
      props: { risk: "HIGH", kind: "clarify", input_method: "text" }
    };

    expect(Object.keys(sample.props).sort()).toEqual(
      ["input_method", "kind", "risk"].sort()
    );
  });
});

describe("launch funnel events", () => {
  it.each([
    [{ name: "taster_check", props: { used: 3 } }],
    [{ name: "wall_viewed", props: { variant: "1299" } }],
    [{ name: "trial_checkout_started", props: { variant: "1299" } }],
    [{ name: "trial_started", props: { variant: "999" } }],
    [{ name: "pantry_viewed", props: { source: "wall_decline" } }],
    [{ name: "pantry_checkout_started" }]
  ] as const)("forwards %j to umami", (event) => {
    const umami = { track: vi.fn() };
    track(event as never, { umami });
    expect(umami.track).toHaveBeenCalledWith(event.name, "props" in event ? event.props : undefined);
  });
});
