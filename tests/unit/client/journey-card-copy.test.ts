import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  CANCEL_INDEPENDENCE_COPY,
  GRADUATION_BODY,
  GRADUATION_HEADING,
  JOURNEY_COMPLETION_COPY,
  OUTSIDE_SCOPE_COPY,
  OUTSIDE_SCOPE_HEADING
} from "../../../components/journey-card";

/**
 * Task 20 (plan §P4.4) — the graduation / pause / maintenance surface must be
 * HONEST: graduation is a SUCCESS, and none of the copy may guilt, pressure, or
 * hide the way out (global constraint §9). This test asserts the absence of a
 * small dark-pattern banned-phrase list across both the exported copy constants
 * AND the raw component source (to catch inline JSX strings too), and asserts
 * the cancellation-independence copy is present and points to the real cancel
 * flow rather than burying it.
 */

const SOURCE = fs.readFileSync(
  path.join(process.cwd(), "components/journey-card.tsx"),
  "utf8"
);

// Dark-pattern / guilt / false-urgency / punitive phrasing. Every one of these
// is a retention manipulation the plan forbids — the brief calls out
// "lose your progress" and "are you sure you want to abandon" specifically.
const BANNED_PHRASES: readonly RegExp[] = [
  /lose your/i,
  /you['’]ll lose/i,
  /lose (all|everything|progress|your progress)/i,
  /are you sure/i,
  /abandon/i,
  /give up/i,
  /don['’]t quit/i,
  /you (failed|['’]ve failed)/i,
  /wasted/i,
  /throw(ing)? (it )?away/i,
  /start over/i,
  /reset your/i,
  /last chance/i,
  /act now/i,
  /hurry/i,
  /now or never/i,
  /don['’]t miss/i,
  /streak/i
];

const COPY_VALUES = Object.values(JOURNEY_COMPLETION_COPY);

describe("journey completion copy — no dark patterns (global constraint §9)", () => {
  it.each(BANNED_PHRASES)(
    "exported completion copy never uses %s",
    (pattern) => {
      for (const value of COPY_VALUES) {
        expect(pattern.test(value)).toBe(false);
      }
    }
  );

  it.each(BANNED_PHRASES)(
    "the component source never uses %s in any inline string",
    (pattern) => {
      expect(pattern.test(SOURCE)).toBe(false);
    }
  );
});

describe("graduation is framed as a success", () => {
  it("the heading names graduation as an accomplishment", () => {
    expect(GRADUATION_HEADING.toLowerCase()).toContain("graduat");
    expect(GRADUATION_BODY.length).toBeGreaterThan(0);
  });
});

describe("cancellation independence (no retention dark pattern)", () => {
  it("says graduating does not change billing", () => {
    expect(CANCEL_INDEPENDENCE_COPY.toLowerCase()).toContain("cancel");
    expect(CANCEL_INDEPENDENCE_COPY.toLowerCase()).toContain("billing");
  });

  it("the component links to the real account/cancel flow, not a dead end", () => {
    expect(SOURCE).toContain('href="/account"');
  });
});

describe("the four honest paths are all wired", () => {
  it("exposes graduate, graduate-into-maintenance, pause, and outside-scope", () => {
    expect(SOURCE).toContain('data-testid="journey-graduate"');
    expect(SOURCE).toContain('data-testid="journey-graduate-maintenance"');
    expect(SOURCE).toContain('data-testid="journey-pause"');
    expect(SOURCE).toContain('data-testid="journey-outside-scope"');
  });

  it("take-your-playbook links BOTH existing exports", () => {
    expect(SOURCE).toContain('href="/api/memory/export"');
    expect(SOURCE).toContain('href="/api/history/export"');
  });
});

describe("outside-scope copy points to professional care, no new claims", () => {
  it("references a doctor or dietitian and stays informational", () => {
    const text = `${OUTSIDE_SCOPE_HEADING} ${OUTSIDE_SCOPE_COPY}`.toLowerCase();
    expect(text).toContain("doctor");
    expect(text).toContain("dietitian");
    expect(text).toContain("informational only");
  });
});
