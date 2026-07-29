import { Plus_Jakarta_Sans, Source_Sans_3 } from "next/font/google";

// Brand typeface (DESIGN.md §Type). Applied via sans.className on <body>,
// and that class is LOAD-BEARING: globals.css declares `body { font: inherit }`
// (L75-80) right after the body font-family block, which kills the elemental
// rule at equal specificity — the className is the only thing between the app
// and the UA default face (the FINDING-030 Times New Roman incident; the
// original diagnosis blamed the var() cascade, but the reset is the mechanism
// — see TODOS "body font reset"). next/font's metric-adjusted local fallback
// keeps offline test runs (Playwright, no network) flicker-safe.
export const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"]
});

// Reading face (added 2026-07-27). Plus Jakarta Sans was carrying headlines AND
// body copy; it is a geometric sans, and geometric sans at 14–15px is the wrong
// tool for paragraphs read by 40–60-year-olds on a phone. Source Sans 3 has a
// larger x-height and open apertures, so it stays legible small and at low
// contrast. Headlines, the wordmark, and buttons keep Plus Jakarta Sans — the
// pairing is deliberate contrast (geometric display + humanist text), not two
// fonts doing the same job.
//
// reading.className goes on the LANDING ROOT (app/page.tsx), not <body>: two
// font classNames on <body> would race by stylesheet injection order and could
// flip the whole app's face. On the landing root it is the single, literal
// (var-free) source of the landing body family — the same class-over-cascade
// protection sans.className gives the app. Imported ONLY by app/page.tsx, so
// Source Sans 3's @font-face + preloads ship with the landing route, not with
// every app route. Nothing reads var(--font-body); the variable stays declared
// only so a future consumer doesn't silently get an undefined var.
export const reading = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "600", "700"]
});
