"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Block 3's entrance — the ONLY JS-driven motion on the landing page, and the
 * only client component on it.
 *
 * ⛔ The card ships rendered. This component never gates content: the server
 * markup is the complete, opaque card, and the hidden pre-state is written to
 * the DOM only after mount, only in a browser, and only when the reader has
 * not asked for reduced motion. A headless render, a crawler, a hidden tab, a
 * JS failure and a reduced-motion reader all get the finished card at
 * opacity 1 (DESIGN.md §6; plan §4.1). The animation re-presents what is
 * already there — it does not reveal anything.
 *
 * `transform` and `opacity` only, so nothing here can trigger layout.
 * prefers-reduced-motion is gated TWICE, here and in globals.css, because
 * either gate alone is one refactor away from being the last one.
 */

// useLayoutEffect writes the armed state before the browser paints, so the
// finished card never flashes and then hides. React logs a warning if it runs
// during server rendering, and Next renders this component on the server, so
// pick the effect the environment can actually run.
const useArmingEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function LandingPause({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useArmingEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    node.dataset.animate = "armed";

    // The spec asks for 40% of the block. A block taller than 2.5 viewports
    // can never BE 40% visible, and a threshold that can never be met would
    // leave the page's centrepiece at opacity 0 forever — the one failure
    // this component must not have. So 0.4 is a ceiling, not a constant:
    // below it, ask for as much of the block as the viewport could ever show.
    const height = node.getBoundingClientRect().height || 1;
    const threshold = Math.min(0.4, (window.innerHeight * 0.9) / height);

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        node.dataset.animate = "in";
        observer.disconnect();
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-pause-stage" ref={ref}>
      {children}
    </div>
  );
}
