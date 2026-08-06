import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

// Same app-router shim the landing pins use — these assertions need rendered
// output, not real routing.
vi.mock("next/link", async () => {
  const { createElement: h } = await import("react");
  return {
    default: ({ href, children }: { href?: unknown; children?: ReactNode }) =>
      h("a", { href: typeof href === "string" ? href : undefined }, children)
  };
});

/**
 * NEXT_PUBLIC_LEARNING_JOURNEY — behavioural coverage on the surface that
 * SHIPS it.
 *
 * Until now the flag's only behavioural test rendered the marketing page's
 * feature grid (`landing-wiring-pins.test.ts`, the journey-flag describe): a
 * block the landing rebuild deletes. Deleting it first would have left the
 * flag's two shipping consumers — this card and `/journey` — with no branch
 * coverage at all, so this lands BEFORE that deletion, not after.
 *
 * `learningJourneyUiEnabled()` reads `process.env` at call time, so stubEnv is
 * enough; no module-cache dance.
 */

afterEach(() => {
  vi.unstubAllEnvs();
});

async function renderJourneyCard(flag?: string): Promise<string> {
  if (flag === undefined) {
    vi.stubEnv("NEXT_PUBLIC_LEARNING_JOURNEY", "");
  } else {
    vi.stubEnv("NEXT_PUBLIC_LEARNING_JOURNEY", flag);
  }
  const { JourneyCard } = await import("../../../components/journey-card");
  return renderToStaticMarkup(createElement(JourneyCard));
}

describe("JourneyCard is gated by NEXT_PUBLIC_LEARNING_JOURNEY", () => {
  it("flag off: the surface does not exist — not an empty shell, not a paywall", async () => {
    const html = await renderJourneyCard();

    // Nothing at all. A rendered-but-empty card would still take layout space
    // on the progress page and still announce a heading to a screen reader.
    expect(html).toBe("");
    expect(html).not.toContain("journey-card");
    expect(html).not.toContain("Learning journey");
  });

  it("flag on: the card renders its own surface and starts in loading", async () => {
    const html = await renderJourneyCard("1");

    expect(html).toContain('data-testid="journey-card"');
    expect(html).toContain("Learning journey");
    // useEffect never fires in a static render, so the first paint IS the
    // loading state — which is exactly what a real first paint shows.
    expect(html).toContain("Loading your journey");
    // ⛔ Never a paywall here: premium gating belongs to the page, and an
    // unavailable journey renders nothing (global constraint §7).
    expect(html).not.toMatch(/upgrade|premium|subscribe/i);
  });

  it("only '1' turns it on — any other value is off", async () => {
    expect(await renderJourneyCard("0")).toBe("");
    expect(await renderJourneyCard("true")).toBe("");
    expect(await renderJourneyCard("yes")).toBe("");
  });
});

/**
 * The flag's second shipping consumer. `/journey` is a client page whose flag
 * branches only appear in the `ready` state, behind two fetches — reaching them
 * from a static render would need a mock farm worth more than the coverage. So
 * this pins at source that both branches still exist, and says plainly that it
 * is a source pin, not a behavioural one.
 */
describe("/journey keeps both flag branches", () => {
  it("renders LearningSummary only when the flag is on, and the recap when it is not", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const src = fs.readFileSync(
      path.join(process.cwd(), "app/(app)/journey/page.tsx"),
      "utf8"
    );

    expect(src).toContain("const learningEnabled = learningJourneyUiEnabled()");
    expect(src).toMatch(/\{learningEnabled \? \(\s*<LearningSummary/);
    // The generic "Try this next" line is the honest fallback when the
    // flag-on artifact experiment is not rendering.
    expect(src).toContain("!learningEnabled || !learningShown");
  });
});
