import { describe, expect, it } from "vitest";

import { upsellVariant } from "../../../components/result-card";

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
