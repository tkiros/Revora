import { describe, expect, it } from "vitest";

import { showPantryEntry, upsellVariant } from "../../../components/result-card";

// The upsell branch renders the server's `message` verbatim; it only branches
// its own eyebrow/CTA/data-wall on whether that message mentions "free week"
// (the string sniff — the server message is the single source of truth). These
// tests lock the pure variant picker; the JSX renders `message` unchanged in
// both cases, so it needs no jsdom harness here.

// The real server strings (app/api/check/route.ts): the trial hard-wall body
// names "free week"; the legacy soft limit names "free checks".
const TRIAL_WALL_MESSAGE =
  "Your free taste of Revora was yesterday's checks. Start your free week — card required, unlimited everything, and we email you before any charge — to keep going.";
const FREE_LIMIT_MESSAGE =
  "You've used today's five free checks. Premium removes the daily limit and keeps your full history — or check back in with your first meal tomorrow.";

describe("upsellVariant", () => {
  it("renders the trial wall CTA when the message mentions the free week", () => {
    expect(upsellVariant(TRIAL_WALL_MESSAGE)).toEqual({
      wall: "trial",
      eyebrow: "Where the free taste ends",
      title: null,
      cta: "Start your free week"
    });
  });

  it("keeps the legacy daily-limit copy for the free-checks message", () => {
    expect(upsellVariant(FREE_LIMIT_MESSAGE)).toEqual({
      wall: null,
      eyebrow: "Daily limit reached",
      title: "That's five for today",
      cta: "See what Premium includes"
    });
  });

  it("only trips the trial variant on the exact 'free week' phrase", () => {
    // "free checks" (legacy) must NOT read as the trial wall.
    expect(upsellVariant("free checks left today").wall).toBeNull();
    expect(upsellVariant("start your free week today").wall).toBe("trial");
  });
});

// §6.3 post-verdict pantry entry. The line attaches ONLY to non-SAFE results
// ("Be careful" / "Hold off") — SAFE never piles on, and non-result kinds
// (upsell/clarify/not_food/out_of_scope/retry) never render it. The pure
// predicate is the single gate the result branch reads; the JSX renders one
// fixed line + `/pantry` link when it returns true, so no jsdom harness is
// needed here.
describe("showPantryEntry", () => {
  it("shows the pantry entry on a MODERATE (Be careful) result", () => {
    expect(showPantryEntry("result", "MODERATE")).toBe(true);
  });

  it("shows the pantry entry on a HIGH (Hold off) result", () => {
    expect(showPantryEntry("result", "HIGH")).toBe(true);
  });

  it("never piles on a SAFE (Clear) result", () => {
    expect(showPantryEntry("result", "SAFE")).toBe(false);
  });

  it("never shows on the upsell/wall kind", () => {
    expect(showPantryEntry("upsell")).toBe(false);
  });

  it("never shows on non-result guidance kinds", () => {
    for (const kind of ["clarify", "not_food", "out_of_scope", "retry"] as const) {
      expect(showPantryEntry(kind)).toBe(false);
    }
  });
});
