# Revora Design System

Canonical reference, extracted from `app/globals.css` + the permission-first
brand direction (`docs/revora-design-20260404-070350.md`, superseded but voice still applies,
and `docs/product-marketing.md`). All new UI calibrates against this file.
Created by /iplan-design-review 2026-07-04. Major revamp 2026-07-07: Plus
Jakarta Sans, deep-green brand accent, verdict tint/badge sets, sanctioned
motion + icon layers (see §Motion, §Icons).

## Voice — permission-first

Revora answers "Can I eat this?" for anxious prediabetics. Every screen either grants
calm permission or gives one clear next action. Rules:

- Lead with what the user CAN do/eat. "Enjoy freely" before "swap these". Never restriction-first.
- Utility language on app surfaces: orientation, status, action. No mood copy, no hype.
- Errors say what to do next, never what the user did wrong. Manual/slow paths are framed as service ("we'll review by hand"), not failure.
- Health information never in `--text-soft`; hints only.
- No emoji in headings. No exclamation marks near health verdicts.

## Tokens (`:root` in app/globals.css)

| Token | Value | Use |
|---|---|---|
| `--page-bg` | `#f2f7f6` | body background (pages add a soft top gradient via `.page-shell`) |
| `--surface` | `#ffffff` | cards |
| `--surface-muted` | `#f8fafc` | inset areas, secondary surfaces |
| `--border-strong` / `--border-soft` | `#cbd5e1` / `#e2e8f0` | inputs / card borders |
| `--text-strong` | `#0f172a` | titles, verdicts |
| `--text-body` | `#1e293b` | body copy |
| `--text-muted` | `#475569` | eyebrows, labels |
| `--text-soft` | `#64748b` | hints ONLY (AA at 16px on white; never health info) |
| `--accent` / `--accent-strong` / `--accent-contrast` / `--accent-tint` | `#0d5f57` / `#0a4a44` / `#f8fafc` / `#e6f2ef` | the ONE brand color (deep spruce green): primary buttons, focus rings, streak, trust icons; `-strong` is hover/pressed; `-tint` is selected/soft-brand fills |
| `--ink` | `#0f172a` | the old slate, kept for anything that must stay neutral-dark |
| `--danger` | `#b91c1c` | destructive/error text |
| `--safe-border` / `--safe-bg` / `--safe-text` / `--safe-badge` | `#0f766e` / `#ecfdf5` / `#065f46` / `#d1fae5` | SAFE verdict: border, card tint, text, badge fill |
| `--moderate-border` / `--moderate-bg` / `--moderate-text` / `--moderate-badge` | `#b45309` / `#fffbeb` / `#92400e` / `#fef3c7` | MODERATE verdict set |
| `--high-border` / `--high-bg` / `--high-text` / `--high-badge` | `#b91c1c` / `#fef2f2` / `#991b1b` / `#fee2e2` | HIGH verdict set |
| `--landing-band` | `#0c332e` | landing dark bands (deep green-slate) |

One brand accent (deep green, 2026-07-07 revamp — replaces the slate-only rule).
Risk colors are STILL semantic-only, but graduate from border-only to the full
verdict treatment: card tint (`-bg`), badge fill (`-badge`), and verdict text
(`-text`). All `-text`-on-`-bg`/-`badge` pairs clear WCAG AA. Never use risk
colors decoratively.

## Type

- Stack: `var(--font-sans), Arial, Helvetica, sans-serif` — Plus Jakarta Sans
  (variable 400–800) via `next/font` in `app/layout.tsx`, `display: swap`, Arial
  fallback so offline test runs never flash unstyled. One family, nothing else.
- Base 16px / 1.5. Body copy 1.65 line-height.
- Scale: 13px uppercase eyebrow (700, 0.08em tracking) · 14–15px hints/meta · 16px body + inputs · 18px subheads (700) · titles `clamp(2rem, 7vw, 2.6rem)` (tight -0.03em).
- Weights: 400 body, 600 secondary emphasis, 700 headings/CTAs. Nothing lighter or heavier.

## Shape & space

- Radius scale: **24px** cards (`surface-card`) · **18px** inputs · **14px** nested cards · **999px** buttons/pills/chips. Pick from the scale, never invent.
- Card shadow: `0 18px 40px rgba(15,23,42,0.08)` — the only shadow. Nothing else casts one.
- Layout: single column, `max-width: 480px` (`.page-frame`), 16px grid gap, 20px card padding, page padding `16px 12px 40px`. Mobile-first at 375px; the 480px frame IS the desktop design.
- Touch: global `min-height: 44px` on button/input/textarea (already enforced in globals.css). Keep it.

## Class vocabulary (reuse before writing CSS)

- Structure: `page-shell` → `page-frame` → `surface-card`
- Headers: `hero-eyebrow`/`status-eyebrow`/`result-eyebrow` + `page-title` + `page-copy`
- Forms: `form-card` · `form-grid` · `field-stack` · `field-label` · `text-input` · `field-hint` · `field-error` · `primary-button` · `voice-input-button`
- Feedback: `request-status` · `status-card` · `result-card` (+ risk border tokens) · `result-disclaimer` · `placeholder-card`
- Monetization: `paywall-card`
- Components: `components/` — `food-check-form`, `result-card`, `paywall-card`, `request-status`, `streak-chip`, `insight-card`, `today-list`, `voice-input-button`

New screens are assembly jobs. If a screen needs a genuinely new class, it takes tokens + the radius scale + existing patterns; adding a new color or shadow requires editing THIS file first.

## Selectable chips (added 2026-07-05, launch-readiness plan)

For one-tap choices: segmentation taps, meal-suggestion chips. Assembly:
`.chip-row` (flex, 8px gap, wraps) containing `<button type="button" class="selectable-chip">`.

- Shape: 999px radius (existing pill scale), 1px `--border-strong` border,
  `--surface` background, `--text-body` text, 16px, 44px min-height (touch rule).
- Selected state: `aria-pressed="true"` + `--accent` background,
  `--accent-contrast` text. Selection is a border/fill change ONLY — no icons,
  no checkmarks, no color beyond the accent (risk colors stay semantic).
- Chips are buttons, never divs. Focus ring inherits the global `:focus-visible`.
- Max one chip-row per screen section; chips carry 1–3 word labels, never sentences.

## Marketing landing `/` (added 2026-07-07)

The root is a marketing surface (Cal AI-style structure), the app lives at
`/check`. The landing keeps every token (colors, radius scale, the one card
shadow, the type stack) but relaxes two app rules, on this surface ONLY:

- Width: `.landing-frame` is `max-width: 1080px` with responsive two-column
  grids — the 480px `.page-frame` rule stays app-only.
- Dark bands: `.landing-dark` sections use `--landing-band` (#0c332e,
  deep green-slate) as a BACKGROUND with `--accent-contrast` text — the
  hero, and the closing CTA. Inside dark bands the primary CTA inverts
  (`.landing-cta` — white pill, dark text). Risk colors remain
  semantic-only, even here.

Credibility is honesty, not decoration: no fabricated ratings, user counts,
or testimonials. The proof points are the disclaimer, the research
disclosure (/how-it-works), the `.landing-proof-band` (CDC DPP citation,
hedged and attributed — never a promise about the user's numbers),
encrypted-at-rest + one-tap delete, and the pre-charge email promise. All
landing copy is claims-audited like app copy.

## Input-method row (added 2026-07-07, three-way meal input)

The check form leads with the three input methods — Type it / Say your meal /
Snap a photo — in one `.chip-row` ABOVE the food textarea, so users see all
three ways before they start typing. Assembly reuses existing pieces: a
`selectable-chip` for "Type it" (aria-pressed mirrors the active method,
click focuses the textarea) plus the existing `voice-input-button` and
`secondary-button` photo pill. No new classes, colors, or shadows. All three
methods land in the same reviewed text path — voice and photo never bypass it.

## Day-1 / first-win treatment (added 2026-07-05, launch-readiness plan)

The calm acknowledgment after a user's first completed check. Rules:

- It is typography, not a celebration: a `.first-win` block = one
  `status-eyebrow` ("Day 1") + one `page-copy` sentence. No confetti, no
  animation, no emoji, no exclamation marks (verdict-adjacent surface).
- Uses `--surface-muted` inset (14px radius, nested-card scale) inside the
  daily-loop card — it is part of the document flow, not a toast/modal.
- Appears at most once per day, only when the streak is new (streak === 1).
- The streak chip (`streak-chip`) remains the ONLY ongoing progress ornament.

## Motion (added 2026-07-07 revamp)

A small sanctioned layer — CSS only, no animation libraries:

- Tokens: `--dur-fast: 150ms`, `--dur: 200ms`, `--ease: cubic-bezier(0.22,0.61,0.36,1)`.
- Buttons/chips/CTAs transition background/border/transform on hover/active
  (`translateY(1px)` press, nothing bouncier).
- `revora-rise` (6px fade-up) is the only keyframe; it plays once on result-card
  entrance. No looping animation anywhere.
- A global `prefers-reduced-motion: reduce` block zeroes ALL animation and
  transition durations — mandatory, never remove it.

## Icons (added 2026-07-07 revamp)

`components/icons.tsx` is the entire icon vocabulary: Check, Alert, Pause
(verdicts) · Keyboard, Mic, Camera (input methods) · Lock, Leaf, Heart, EyeOff
(trust) · ArrowRight. Hand-written 24-viewbox strokes, `stroke: currentColor`,
sized by `--icon-sm` (16px) / `--icon` (20px). Icons always sit next to text,
never alone, never decorative-only, always `aria-hidden`. Adding a glyph means
editing that file and this list — no icon libraries.

## Interaction rules

- Focus: themed `:focus-visible` on inputs/buttons (globals.css) — never remove outlines.
- Status text updates use `aria-live="polite"`; progress = text count first, spinner optional.
- Motion only from the sanctioned layer above; respect `prefers-reduced-motion`.
- Empty states are features: warmth + one primary action + context. "No X found." alone is banned.
- Never dead-end a paid or signed-in user: every error state names the next step (retry, support email, or "we'll email you").
- Print (reports): `@media print` hides nav/buttons/paywall; black-on-white; `break-inside: avoid` on item rows.

## App-UI guardrails (anti-slop)

Document-not-dashboard for content pages. No icon-in-circle decoration, no centered-everything,
no card mosaics, no decorative gradients beyond `.page-shell`'s background. Colored fills and
borders only from the semantic verdict token sets or the brand accent. Icons only from the
sanctioned set (§Icons), always paired with text. Cards earn existence: if it isn't interactive
or semantically bounded, it's typography, not a card.
