"use client";

import { useEffect, useRef, type ReactNode } from "react";

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

export function LandingPause({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ⛔ Never arm something the reader can already see. Hydration runs long
    // after the server HTML has painted, so arming an on-screen card yanks a
    // settled, opaque card to opacity 0 and fades it back in — the flicker the
    // owner reported, and once per HMR remount in `next dev`. No effect can fix
    // that by ordering (useLayoutEffect precedes the NEXT paint, not the
    // FIRST): the fix is to arm only what is off-screen, which makes arming
    // invisible by construction. Block 3 starts at ~2,600px, so the entrance
    // still plays as designed on any normal load.
    const box = node.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;

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
