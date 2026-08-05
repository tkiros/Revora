# Revora Design System

Canonical for every Revora surface. From `app/globals.css`, `docs/product-marketing.md`, and the landing design & copy
tournament of 2026-08-04/05 (`docs/plans/landing-tournament-*.md`, which holds the evidence this file only cites).
Rewritten 2026-08-05 (Phase 10B): every rule states its derivation in one clause or names its test. Rules that could do
neither were accidents and were cut; §15 reports what went.

**How to read it.** §1 is the floor: sixteen rails, and breaking one is a defect, not a decision. Everything after is a
system to pick from; adding a colour, shadow, radius, breakpoint or font size means editing this file in the same commit,
with the reason. §13 is the banned list; §14 is scar tissue, each row naming its test. **"The guards pass" is not claim clearance (§1.1).**

## 1. The rails

| # | Rail | Held by | Real? |
|---|---|---|---|
| 1 | Revora is never the agent of a health outcome | `claims-boundary-copy.test.ts` | **TEST** |
| 2 | No fabricated ratings, user counts or testimonials | family `social-proof` | **TEST** |
| 3 | `SAFE`/`MODERATE`/`HIGH` never render as copy; labels come from `lib/revora/labels.ts` | `copy-pins.test.ts` | **TEST** |
| 4 | A Clear verdict carries no adjustment and no swap | `assertNoUnsafeSafeFields` (throws) + family `unconditional-swap` | **TEST + RUNTIME** |
| 5 | The disclaimer is visible with the result, never behind a disclosure | `disclaimer-presence.test.ts` (engine responses only) | **TEST in-app · PROSE on marketing** |
| 6 | Statistics trace to the evidence pack; the trial citation lives only on `/how-it-works` | family `study-association` + exemption guard | **TEST** |
| 7 | **No statistic-shaped slot exists on a marketing surface** (§1.2) | structure | **STRUCTURAL** |
| 8 | WCAG AA everywhere; health information never in `--text-soft` | `tests/smoke/landing-a11y.spec.ts` (axe) | **TEST (partial)** |
| 9 | 44px touch targets, 52px on the marketing CTA | CSS only; axe does not test target size at AA | **NOT ASSERTED** |
| 10 | Nothing below 16px on a marketing surface except tracked uppercase | two CSS comments | **PROSE** |
| 11 | Verdict colour is never the sole channel; every verdict renders icon + word | icons ship, uncovered | **PROSE** |
| 12 | `prefers-reduced-motion: reduce` zeroes all motion | `globals.css:36-44`, uncovered | **NOT ASSERTED** |
| 13 | Focus visible everywhere; outlines never removed | `:focus-visible` + axe | **CSS + TEST (partial)** |
| 14 | Marketing surfaces read light. No dark bands | owner instruction 2026-07-27 | **PROSE, immutable** |
| 15 | The landing is marketing; the app lives at `/check` | nothing structural | **PROSE** |
| 16 | **Every user-facing sentence must be fileable under a claim class** (§1.3) | nothing | **PROSE, new** |

Ranked by how quietly a redesign breaks one: **10 → 7 → 12 → 9 → 8.** Until 9 and 12 have tests, a change touching
motion or targets checks them by hand.

### 1.1 Three fences, not one

`claims-boundary-copy.test.ts` reads every `.tsx` under `app/` and `components/` and proves only that no **banned family**
appears. `validate-safety-contract.mjs` reads **only `docs/safety/*.md` plus a fixture, never a source file**, and proves
only that the ledger is self-consistent. The pin suites prove named strings. **Nothing connects the ledger to the source
in either direction:** a new sentence is opted *into* the banned-word scan automatically and *out of* the ledger entirely,
and nothing goes red. That is how an unledgered comparative claim survived four reviews at `app/page.tsx:523-524`.

### 1.2 Rail 7, rewritten

The old rail was a CSS comment asking nobody to put a number into a slot styled as a 3.6rem number well. **A component
whose primary affordance must be disabled for its content to be safe is the wrong component.** The band is deleted, so
no big-number affordance exists and the rail is discharged structurally. If a stat-shaped slot returns, so does the rail.

### 1.3 Rail 16, new

> **Every user-facing sentence must be fileable under a claim class in `docs/safety/claims-boundary.md`. A sentence that
> is neither approved nor banned is not therefore permitted.**

All nine classes are *about Revora*. **There is no class for a statement about another company's product**, so
comparative copy is unavailable at any scale: outside the schema, not merely unapproved. Creating a class is a decision
for counsel, not a copy decision.

## 2. Voice: permission-first

- **Lead with what the user CAN do or eat.** Never restriction-first: the rule the landing broke by opening on a loss.
- **Utility language on app surfaces:** orientation, status, action. No mood copy, no hype, no emoji in headings, no
  exclamation marks near a verdict.
- **Errors say what to do next, never what the user did wrong.** Manual and slow paths are service, not failure.
- **Never claim the page is calm** — a surface that has to say it is calm is not. **Marketing may name the reader's
  situation in their own words;** that licence does not extend to making a claim.

## 3. Tokens

`:root` in `app/globals.css`. There are no others; a new one needs a row here in the same commit.

| Token | Value | Use |
|---|---|---|
| `--page-bg` | `#f2f7f6` | body and marketing ground |
| `--surface` / `--surface-muted` | `#ffffff` / `#f8fafc` | cards, and only cards / insets, chips |
| `--border-strong` / `--border-soft` | `#cbd5e1` / `#e2e8f0` | inputs / card borders |
| `--text-strong` · `--text-body` · `--text-muted` | `#0f172a` · `#1e293b` · `#475569` | titles and verdicts · body · labels, captions, fine print |
| `--text-soft` | `#64748b` | **plane-restricted, §3.1** |
| `--accent` · `--accent-strong` · `--accent-contrast` · `--accent-tint` | `#0d5f57` · `#0a4a44` · `#f8fafc` · `#e6f2ef` | the one brand colour. `-strong` is hover/pressed and link text; `-tint` is a selected or soft-brand fill |
| `--ink` / `--danger` | `#0f172a` / `#b91c1c` | anything that must stay neutral-dark / destructive text |
| `--safe-*` · `--moderate-*` · `--high-*` | `globals.css:16-27` | the three verdict sets: border, tint, text, badge |
| `--dur-press` · `--dur-fast` · `--dur` · `--ease` | §6 | motion |
| `--icon-sm` / `--icon` | `16px` / `20px` | icon sizes |

`--landing-band` was removed 2026-07-27 with the dark bands; do not reintroduce it (rail 14). **One brand accent.** Risk
colours are semantic-only, graduate from border to the full verdict treatment, and every `-text`-on-`-bg`/`-badge` pair
clears AA. **Never use a risk colour decoratively.**

### 3.1 `--text-soft` is plane-restricted, and this is accessibility, not taste

| `--text-soft` `#64748b` on | `--surface` | `--surface-muted` | `--page-bg` | `--accent-tint` |
|---|---|---|---|---|
| Ratio | **4.76:1** pass | **4.55:1** pass, no margin | **4.40:1 FAIL** | **4.15:1 FAIL** |

> **Text colour on `--surface` and `--surface-muted` only, for hints only, never health information. Banned on
> `--page-bg` and `--accent-tint`.** The old annotation, "AA at 16px on white," was true on white and misleading
> everywhere else the product renders.

**All four in-repo uses audited 2026-08-05 and all pass, none with margin:** `:198` and `:3148`, both placeholders on an
input's own `--surface`; `:2673` `.chip-remove` on `--surface-muted`; `:2546` a decorative `background`, not text.
Separately `--text-muted` on `--page-bg` is **7.00:1**, AAA to the second decimal, and it carries captions and the footer
disclaimer; axe tests AA and would not report a drop.

## 4. Type

- **Two faces on a contrast axis.** `var(--font-sans)` is **Plus Jakarta Sans** (variable 400–800, `app/fonts.ts`) for
  display, wordmark, buttons and labels; `var(--font-body)` is **Source Sans 3** (400/600/700) for reading, on marketing
  only, because a geometric sans at 14–15px is the wrong tool for body copy read by 40–60-year-olds on a phone. **The app
  UI stays single-family.** Two proposals to collapse to one face were rejected: both audited clean without addressing
  the pin they land on (§14 row 2). **Marketing titles use 700, never 800** — Source Sans 3 loads 400/600/700 and 800
  renders faux-bold, so `globals.css:1728-1731` caps `.landing .result-title` at `22px / 700`.
- **Base `16px / 1.5`, in force** (re-verified 2026-08-05: `body` is out of the `font: inherit` control reset,
  `globals.css:83-87`). Body copy runs `1.65`. **Weights 400 / 600 / 700, nothing else.**
- **App scale:** 13px tracked uppercase eyebrow (700, `0.08em`) · 14–15px hints and meta · 16px body and inputs · 18px
  subheads (700) · titles `clamp(2rem, 7vw, 2.6rem)` at `-0.03em`.
- **Tracking is size-specific; one `letter-spacing` across a clamp is wrong at one end of it.** Tighten as size grows
  (`-0.02em` at display, `0` near body), and move line-height inversely.
- **Measure caps at 62ch on prose.** `text-wrap: balance` on `h1`–`h3`, `pretty` on prose.

## 5. Shape and space

> **Radius scale: outer surfaces 24px · inputs 18px · nested cards 14px · result cards 22px · pills, buttons and chips
> 999px. Pick from the scale, never invent.**

`22px` is a member, not an exception: `.result-card` is the product's most-seen surface, ships at 22px on three routes,
and the scale predates it. **The one place the product violates the scale** is `DemoCheckCard`
(`components/demo-check-card.tsx:38`), which wraps two `.result-card`s (22px) in a `.surface-card` (24px). A 2px delta is
the worst available answer: too different to read as one surface, too similar to read as two.

> **Ruling: the wrapper is not a card.** It is a labeled sequence (`aria-label="Example check"`), and this file's own
> rule is *cards earn existence*. The wrapper drops `surface-card` and becomes an unbordered labeled region carrying the
> eyebrow and the two typed lines; the two `.result-card`s stay untouched at 22px. That removes the nesting, the delta
> and the mosaic without editing the card the marketing page exists to show. **Product work item; three routes import it.**

⛔ **Do not restate a nested-card ban. This file has never had one** — the previous version gave nested cards a radius
and used it. `impeccable` bans them; this file does not. The rule above is about one 2px delta, not a category.

- **Card shadow `0 18px 40px rgba(15,23,42,0.08)`, the only shadow in the system.** Nothing else casts one.
- **Cards earn existence.** Not interactive and not semantically bounded means it is typography. Boxing three sentences
  about the reader's situation makes them look like features.
- **Touch:** global `min-height: 44px` on `button`/`input`/`textarea` (`globals.css:89-93`). ⛔ **No invisible hit-area
  expansion on inline links** — WCAG 2.5.8's inline exception covers them, and negative margins overlapped adjacent
  targets when this repo tried it.
- **Layout:** mobile-first at 375px, app pages in the `(app)` shell (§8). 16px grid gap, 20px card padding.

## 6. Motion

| Token | Value | Job |
|---|---|---|
| `--ease` | `cubic-bezier(0.23, 1, 0.32, 1)` | **the** ease. Strong ease-out |
| `--dur-press` · `--dur-fast` · `--dur` | `120ms` · `150ms` · `200ms` | pointer-down feedback · hover, colour, small state change · entrance |

> **⚖️ Ruling (10B): the curve split is closed.** The app ran `cubic-bezier(0.22, 0.61, 0.36, 1)` (easeOutCubic) while
> the marketing spec specified `cubic-bezier(0.23, 1, 0.32, 1)` (easeOutQuint) at 120ms for the press. Two curves this
> close, in a system with one shadow and one accent, is unearned duplication. **The stronger curve wins and becomes the
> system's only ease** — both `emil-design-eng` and `impeccable` prescribe it, and 120ms sits inside the 100–160ms press
> window Apple and Emil give independently. **This is a one-line token change:** all 24 consumers read `var(--ease)` and
> none hardcodes the curve. Ship it as its own revertible commit with a before/after on the result-card entrance.

- **Press feedback is on pointer-down (`:active`), never release** — the press is the moment the user watches most
  closely. `translateY(1px) scale(0.98)` at `--dur-press`. **Name the properties; never `transition: all`.**
- **Two sanctioned keyframes:** `revora-rise` (6px fade-up, once, result-card entrance) and `revora-skeleton` (shimmer,
  loading placeholders only). No other looping animation anywhere.
- **A reveal enhances an already-visible default.** Ship content at `opacity: 1` and let an `IntersectionObserver`
  *replay* it; transitions pause on hidden tabs and never fire headless, so a visibility-gated reveal ships the section
  blank, including to a crawler.
- **`prefers-reduced-motion: reduce` zeroes all durations** (`globals.css:36-44`); never remove it. That block is a
  safety net, so a JS-driven reveal must **also** gate the class in JS: the net only shortens what already ran.
- **Animate `transform` and `opacity` only**, and use a spring library where a gesture must be interruptible rather than
  fighting keyframes. ⛔ **No scroll reveals as section scaffolding** — a uniform entrance on every block is the tell,
  not motion; stagger inside one list is legitimate.

## 7. Icons

`components/icons.tsx` is the entire vocabulary: Check, Alert, Pause (verdicts) · Keyboard, Mic, Camera (input) · Lock,
Leaf, Heart, EyeOff (trust) · ArrowRight · Home, Person, CheckCircle, Bookmark, Compass (shell nav). Hand-written
24-viewbox strokes, `stroke: currentColor`, sized by `--icon-sm`/`--icon`, always `aria-hidden`. **No icon libraries;**
adding a glyph edits that file and this list.

**Restated:** an icon never carries meaning alone **unless it is a redundant channel for text already in the accessible
name.** The old absolute contradicted §9, where the verdict icon inside a week-strip mark is exactly that channel.

## 8. App shell

| Range | Content column | Navigation | Grid |
|---|---|---|---|
| < 1024px (designed at 375) | `app-content` max 520px | bottom tab bar, five slots: Home · My meals · Check (the one accent-filled action) · My journey · Account. Top bar is brand only, no hamburger | single column |
| ≥ 1024px | max 1000px + 280px fixed sidebar | sidebar, same five + `plan-box` | single column |
| ≥ 1440px | max 1120px | same | same |

- **The nav flips at exactly 1024px** and the inactive wrapper is `display: none`, so exactly one `Main` landmark exists
  at a time. `<nav aria-label="Main">`, `aria-current="page"` on the active link, 44px+ targets, `app-skip` first.
- **The plan box shows the plan name AND the billing date.** Hiding the renewal date from an active subscriber is banned,
  and that ban binds every rendered plan box. Home renders it only when it carries actionable billing truth; the sidebar
  and `/account` always render it in full.
- **The check CTA is the one Committed colour moment**, and at <768px the first interactive element above the fold: the
  dashboard never adds friction before the core action. **Day-0 empty state is the default design, not a fallback:** one
  CTA plus the Today card's warmth, no fake data, no guilt copy.

## 9. Progress surfaces: reassurance, not gamification

Users are anxious by definition, so progress UI manufactures reassurance and never streak pressure.

- **Additive framing only.** Counts that grow, nothing that can visually break, no loss aversion, no "streak at risk"
  state ever. **Unchecked days render neutral** (dashed `--border-strong` on `--surface-muted`), never red, never "missed".
- **Verdict colour on the week strip is information:** each day shows its most careful verdict
  (`lib/coach/days.ts verdictWeekView`) with the verdict *icon* inside the mark, so shape carries the signal, plus a
  per-day `sr-only` sentence.
- **Illustrative data is always labeled.** `demoExampleEyebrow()` (AUD-008) computes the label from the evidence state
  and swaps to `A real check, captured <date>` when a capture is authorised. ⛔ **Never hand-type it** — a literal
  becomes a false claim the day a capture lands.
- **The weekly view is the non-scored recap** (`lib/coach/recap.ts`, `/journey`): plain counts, no composite score, no
  band words, no percentages, because a more-confident user who checks less must never read "progress declined".

## 10. Component recipes

- **Result anatomy** (`.result-anatomy`) is a labeled document, not a poster: permission-first header on `--accent-tint`
  leading with the most practical action (adjustment → swap → keepMost), then rows Meal · **Signal** (verdict icon +
  label, the ONLY tinted row) · Why · Try. Card surface stays white, verdict colour appears on the border and Signal row
  only, boundary copy stays in the fineprint, visible with the result.
- **Selectable chips:** `.chip-row` (flex, 8px, wraps) of `<button class="selectable-chip">` at 999px, 1px
  `--border-strong`, `--surface`, 16px, 44px min-height. Selected is `aria-pressed="true"` plus an `--accent` fill —
  **a fill change only**, no icons or checkmarks. Buttons, never divs; one row per section, 1–3 word labels.
- **Input-method row** on `/check`: the available methods in one `.chip-row` above the textarea, so users see every way
  in before typing, and **all methods land in the same reviewed text path.** ⚠️ `photoInputEnabled()` is **false**, so
  the row ships two methods; copy naming three is wrong today.
- **Day-1 / first-win** is typography, not celebration: one `status-eyebrow` plus one `page-copy` sentence in a
  `--surface-muted` inset at the 14px nested scale, inside the daily-loop card. No confetti, animation, emoji or
  exclamation marks; at most once a day, only when `streak === 1`.
- **Home meal-check hero** (`.meal-hero`) is the dashboard's one accent-filled card and a **hand-off, not a second check
  surface**: the typed meal rides the `revora.recheck` prefill into `/check`, the one place a check runs.

## 11. Marketing surfaces

`/` is marketing; the app lives at `/check` (rail 15). Marketing keeps every token, the one shadow and the radius scale,
and relaxes exactly three app rules here only: a wider frame (`max-width: 1080px`), a larger type scale, and the reading
face. The system below is the tournament winner, **`W — One Card Back`** (`docs/plans/landing-tournament-winner-spec.md`),
whose thesis is that **the page's unit of composition is the product's own artifact**, rendered in the live classes.

- **One plane.** `--page-bg` throughout; **white is card material, never a section background**, so a white region that
  is not a card is a bug. **Sectioning is air plus a hairline on the block**, never an `<hr>`:
  `padding: clamp(72px, 10vw, 128px) 0` with `border-top: 1px solid var(--border-soft)`, reset on `:first-of-type`. Hero
  padding is deliberately smaller and **measured** — unifying it with the section clamp pushes the proof card off the fold.
- **Two card families, down from eight:** the **result card, inherited and unmodified**, and the price tile (24px, 2px
  `--border-soft`, `--surface`, the one shadow). ⛔ **No `.landing*` selector may declare `border-radius` or `border` on
  `.result-card` or `.surface-card`** — the page's central claim is *marketing shows the product's card, unmodified*, and
  an override makes it false while appearing to improve the page. The claim has no test and owes one.
- **Zero eyebrows**, because the hero's eyebrow words became the H1 — **de-duplication, not deletion on principle**. The
  contender that deleted the eyebrow on principle left a headline about a competitor as the only thing above the fold and
  took the tournament's worst score.
- **Type: one body size.** `18px / 1.65` for everything except H1 `clamp(1.9rem, 5.6vw, 2.9rem)` / `1.05` / `-0.02em` ·
  H2 `clamp(1.6rem, 4vw, 2.2rem)` / `1.1` / `-0.025em` · card title `22px / 700` · lede `20px / 1.6` · FAQ summary
  `19px / 700` · nav link `17px` · fineprint floor `16px`. Measure `62ch`. This replaces the old "16.5–17px" range,
  which needed a reason per value and had none; the lede step stays, because a scale without one loses the hierarchy
  ratio. ⚖️ **The body was `17px` until 2026-08-05, when the owner previewed the built page and read it as too small.**
  The tournament spec's figure was never read at size; one step up is the whole change, and H1/H2 are clamped so the
  display scale is untouched. **The fineprint floor stays `16px`, and the result card's own copy stays app-layer `16px`**
  — the card is the unit of composition, and it does not get a `.landing`-layer type override for reading smaller than
  the prose wrapped around it.
  ⛔ **`--text-soft` is banned here entirely** (§3.1) — the plane is `--page-bg`, where it fails AA. No per-block exemption.
- **Breakpoints 640 / 720 / 880:** footer two-column, three-up grids, full desktop step. Collapsed from eight ad-hoc
  values 2026-07-29; **a new one needs a reason recorded here.** The shell keeps its own set (§8).
- **The CTA is assembled once, by `LandingPrimaryCta`** — five hand-built copies had drifted into four shapes.
  Accent-filled pill (`--accent` on `--accent-contrast`, computed **7.19:1**), 52px, 999px; `.landing-cta--ghost` is the
  nav variant so the hero owns the only filled pill above the fold. **One filled pill per screenful** ⚠️ **is not
  enforced in code** — the previous version of this file claimed it was, and no such assertion exists. The two closing
  pills clear a screenful by **5px**. **Pre-specified fallback:** make the final exit a text link, not more distance.
- **Credibility is honesty, not decoration.** No fabricated ratings, counts or testimonials (rail 2). The proof points
  are the disclaimer, the research disclosure, encrypted-at-rest plus one-tap delete, and the pre-charge email promise —
  **each attached to a rendered object.** The disclosure ships as prose, not a band (§1.2); the DPP statistic stays off
  marketing entirely (rail 6); rail 16 binds every sentence here.

### 11.1 ⚖️ The reachability budget: a rule change, named as one

The tournament grafted a rule from a killed contender: *no stretch may exceed 1,460px at 375px.* **Measured in a browser
the winner fails it in three places, worst by 764px, and no arrangement of its six exits satisfies it** — the best still
misses by 15px and 103px. The figure came from a *different* contender's page, transplanted unchecked onto an 8,621px one.

> **Ruling: restated in screenfuls, and this is a rule change, not a measurement result.** A pixel distance is not what
> the reader experiences; the number of screenfuls between deciding and being able to act is. **No stretch between exits
> may exceed three screenfuls, 2,001px at 375×667.** Measured worst on the winner's best free arrangement: **1,941px**;
> on the incumbent, **5,228px, or 7.8 screenfuls**. The rule still bites hard and is no longer unachievable.
>
> **The half with real teeth is the measurement: every marketing layout change reports its measured page length, exit
> count and desert map at 375px, in the browser, with the real fonts loaded. An unmeasured desert claim does not count.**
> Estimates here ran 20% low on page length and 35% low on the worst desert.

⚖️ **Related ruling: CTA position in the offer block.** The measured reorder that buys the budget puts a button between
the price tiles and the cancel paragraph, whose power is its **adjacency to the price**, and a 661px pixel win does not
outrank a scored copy graft. **The CTA moves to the first position that does not break the adjacency: immediately after
the cancel paragraph, before the claims list.** That variant is unmeasured, so implementation measures and reports; if it
misses the budget, the measured arrangement is the fallback and the adjacency is what gets spent — a known cost, recorded.

## 12. Interaction rules

- **Focus:** themed `:focus-visible`, never removed. `3px` ring at `rgba(13, 95, 87, 0.45)`; **2px offset on cards** so
  the ring clears a 22/24px radius without colliding with the border; 6px radius on inline-link rings, deliberately off
  the card scale, because a card radius on a one-line text link looks bulbous.
- **Status updates use `aria-live="polite"`.** Progress is a text count first; a spinner is optional.
- **`list-style: none` strips list semantics in Safari/VoiceOver**, so any list that looks like a list carries `role="list"`.
- **Empty states are features:** warmth, one primary action, context. `"No X found."` alone is banned, and **no paid or
  signed-in user is ever dead-ended** — every error names the next step.
- **Print:** `@media print` hides nav, buttons and paywall; black on white; `break-inside: avoid` on item rows.

## 13. The banned list

1. **The winning organ and the killing defect must not be the same object.** True of all three killed contenders, of no survivor.
2. **A named defect is not a mitigated defect.** All three killed contenders predicted their killing score in writing.
3. **No dimension below 5.** A surface is scored on its floor; the two highest single scores both belong to corpses.
4. **Emotional fit below 5 is fatal on its own.** Its distribution has a 2.83-point void: taken or refused, not a dial.
5. **A diagnostic is not a design brief.** Three contenders built from an instrument, passed it, and lost the reader.
6. **A rail passed by deletion is a rail with no subject.** Move the coverage; deleting copy *and* its test discharges it.
7. **A ledger row that records a section's intent is not a pin.** `result-*` rows are verbatim and test-pinned;
   `landing-*` rows record intent, and one describes a hero that never shipped. Never cite the genres interchangeably.
8. **Confirmed anti-patterns.** Eight card families (0/7 defend) · three planes plus a hairline (7/7 collapse) · `Step N`
   eyebrows (7/7) · an eyebrow above every section (7/7) · a how-it-works block selling typing and talking as the
   mechanism (7/7) · a fixed conversion element held across a whole page · deleting the category answer to dodge a trope
   · replacing recognition with definitions · side-stripe borders · gradient text · decorative glassmorphism · the
   hero-metric template · identical card grids · numbered section markers as scaffolding.

**NOT banned, and you will be tempted:** three price tiles (4/7 keep, surviving because the middle tile carries the least
portable sentence on the page — **if that sentence ever leaves the tile, the tiles become the generic thing and should
go**) and the 24px card radius (no convergence; inherited, §5).

## 14. Scar tissue

| Rule | Why it exists | Held by |
|---|---|---|
| `sans.className` stays on `<body>` | FINDING-030: the `font: inherit` control reset used to include `body` and killed the elemental font rules at equal specificity | `landing-wiring-pins.test.ts`, *"landing font wiring (FINDING-030)"* |
| `reading.className` goes on the landing **root**, never `<body>` | two font classNames on `<body>` race by injection order and can flip the whole app's face | `landing-wiring-pins.test.ts` |
| No `.landing*` selector declares `font-size` twice | an appended override block gave ~26 selectors two competing declarations resolved only by source order. **Never re-append an override block** | `landing-wiring-pins.test.ts`, *"no landing selector declares font-size twice"* |
| The primary CTA is assembled once | five hand-built copies drifted into four shapes | **`LandingPrimaryCta` in `app/page.tsx`. No test. Owed** |
| The DPP citation lives only on `/how-it-works` | rail 6, family `study-association` | `claims-boundary-copy.test.ts` + exemption guard |

**One live hazard with no test and no incident yet.** `.landing .result-disclaimer` (16px) and
`.result-fineprint .result-disclaimer` (13px) have **identical specificity (0,2,0)**; the landing wins only by being
**later in `globals.css`**. Moving either block silently drops the marketing compliance line to 13px and breaks rail 10,
and the duplicate-`font-size` pin cannot catch it: it counts declarations per selector and sees one on each. **The
comment belongs on the rule in `globals.css`, not only here.**

## 15. What this rewrite changed

**361 lines → 360**, while adding the rails table, the banned list, the scar-tissue table and four rulings that
existed nowhere before. ⚠️ **Word count went 3,309 → 4,657: this file is denser, not lighter.** The tournament plan
docs hold the evidence; what stays here is the rule plus one clause of derivation.

**Cut as accidents**, being rules that could not derive themselves: **§Class vocabulary**, an index half stale — it listed
`request-status`, which has **zero** rules in `globals.css`, and named 8 of the 41 files in `components/`. **"CSS only, no
animation libraries,"** a dependency policy wearing a design rule's clothes. **The 480px `.page-frame` legacy note**,
because migration status is the roadmap's business. **The scope clause "for content pages"** in §App-UI guardrails, which
is what let marketing become a card mosaic while a rule banning card mosaics sat in the same file. And **three retellings
of one font incident**, now §14.

**Corrected as false:** `--text-soft` "AA at 16px on white" (fails on two of four planes, §3.1) · "one filled pill per
viewport, now enforced in code" (enforced nowhere, §11) · rail 7 as a CSS comment (structural now, §1.2) · the radius
scale as three steps (five, and violated once, §5) · "landing body 16.5–17px" (one value, §11). **Re-verified, not
trusted:** base `16px / 1.5` is live, `body` being out of the `font: inherit` reset at `globals.css:83-87`.

**New rulings:** the reachability budget in screenfuls plus the measurement discipline that gives it teeth, and
CTA-versus-cancel-paragraph priority (§11.1) · one system ease with a named press duration (§6) · the `DemoCheckCard`
wrapper un-carded (§5) · rails 7 and 16 · banned-list item 7.

**Owed, tracked in the implementation plan:** tests for rails 9 and 12 · the card-recipe override guard (§11) · a test for
single-CTA assembly (§14) · the source-order comment written onto the `.landing .result-disclaimer` rule (§14) · the
`DemoCheckCard` wrapper change across three routes (§5) · the `--ease` token change as its own commit (§6).
