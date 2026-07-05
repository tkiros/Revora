import type { ReactElement, ReactNode } from "react";

import { afterEach, describe, expect, it, vi } from "vitest";

// The page is a static server component that reads NEXT_PUBLIC_WAITLIST_URL at
// render time (no build-time inlining under vitest), so we can drive the env
// var directly and inspect the returned element tree — no jsdom harness needed.
async function renderText(): Promise<string> {
  vi.resetModules();
  const mod = await import("../../../app/get-the-app/page");
  const tree = mod.default() as ReactElement;
  return collectText(tree);
}

function collectText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(collectText).join(" ");
  if (typeof node === "object" && "props" in node) {
    const props = (node as ReactElement).props as {
      children?: ReactNode;
      href?: string;
    };
    const href = props.href ? ` ${props.href} ` : "";
    return href + collectText(props.children);
  }
  return "";
}

describe("get-the-app page waitlist gating", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hides the waitlist section when NEXT_PUBLIC_WAITLIST_URL is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_WAITLIST_URL", "");
    const text = await renderText();
    // Install guidance always renders.
    expect(text).toContain("Revora already works on your phone");
    // Waitlist markers must be absent.
    expect(text).not.toContain("Prefer the store version?");
    expect(text).not.toContain("Tell me when it ships");
  });

  it("shows the waitlist section (with the form URL) when the env var is set", async () => {
    const url = "https://tally.so/r/revora-waitlist";
    vi.stubEnv("NEXT_PUBLIC_WAITLIST_URL", url);
    const text = await renderText();
    expect(text).toContain("Prefer the store version?");
    expect(text).toContain("Tell me when it ships");
    expect(text).toContain(url);
  });
});
