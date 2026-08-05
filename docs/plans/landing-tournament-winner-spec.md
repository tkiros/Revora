# Section 15 — Winner spec · `W — One Card Back`

**Phase 10A.** Build-ready specification for the Revora marketing landing `/`.
**Date:** 2026-08-05 · **Branch:** `fix/landing-followups` (HEAD `8c4c0e9`) · **Code changed: none.**

**Inputs:** the consolidated Phases 0–9 handoff, `docs/plans/landing-tournament-phase-9.md`
(the red-team, which amends Phase 8 in eleven places), `docs/plans/landing-tournament-phase-8.md`
(the winner). **Read against live source, not against the plan documents:** `app/page.tsx`,
`app/globals.css`, `components/demo-check-card.tsx`, `DESIGN.md`, `app/fonts.ts`.

> **This document supersedes Phase 8 §13.4 and the winner's estimated page metrics.**
> Everything below with a pixel number attached was measured in Chromium at 375×667 with the real
> `next/font` faces loaded, not estimated. Where a measurement contradicts a carried-forward
> estimate, the measurement wins and the contradiction is named.

---

## 0. How to use this document

§1 is the headline finding and the one thing that changes a decision. §§2–8 are the system: tokens,
type, shape, rhythm, colour, CTA, motion, a11y. §9 is the block-by-block build. §10 is the CSS
delta as an explicit add/change/delete list. §11 is the measured desert map and the one open
ruling this phase cannot take alone. §12 records what was verified against source. §13 is the
handoff to 10B and 10C.

**No vague phrases.** Every value is a token name, a literal, or a measured number. If something
below reads as a judgement call rather than a value, it is marked ⚖️ and routed to §13.

---

## 1. The measurement — and what it falsifies

C5's measurement discipline is the half of its organ the winner adopted. This is where it gets
spent. The method, so it can be re-run: load the real `/` route at 375×667 so `next/font`'s
self-hosted Plus Jakarta Sans and Source Sans 3 are the faces doing the layout, replace `<main>`
with the winner's markup, inject the spec CSS, lift the **real** `<DemoCheckCard />` out of the live
page into block 3, then read `getBoundingClientRect()`.

**Harness validated first.** Run against the untouched incumbent it returns **13,346px**, **7 CTAs**,
**5,228px longest desert**. The tournament's recorded baseline is 12,942px / 7 CTAs / 5,090px. Within
3% on both pixel figures and exact on the CTA count; the delta is content shipped since the baseline
was taken (`llms.txt`, the JSON-LD block, `/guides`). The harness is trustworthy.

### 1.1 The winner, measured

| | Estimated (Phase 8, carried through Phase 9) | **Measured** | Error |
|---|---|---|---|
| Page length at 375px | ~6,865px | **8,621px** | estimate is **20% low** |
| Screens at 667px | ~10.3 | **12.9** | |
| Longest CTA desert | 1,450px | **2,224px** | estimate is **35% low** |
| Deserts over the 1,460px budget | 0 of 5 | **3 of 5** | |

**Measured desert map, winner as specified:** 1,941 · 1,246 · **1,581** · **2,224** · 672.
**Estimated:** 1,300 · 1,390 · 1,380 · 1,450 · 490.

Not one of the five estimates was within 200px of its measurement, and the estimate's ranking of
which stretch is worst is also wrong: it named the fourth gap, the measurement names the fourth gap
at a different value and the first gap as a second failure the estimate had at 1,300px.

### 1.2 What this means

**C5's reachability rule — the one organ the tournament took from a killed contender specifically to
fix the desert problem — does not hold on the winner.** It fails in three places, worst by 764px.

This is not a rounding problem. §11 shows that no arrangement of the winner's six exits gets all
five gaps under 1,460px; the best measured arrangement still leaves two over, by 15px and 103px.
**The rule and the page are incompatible as specified**, and §11 puts the ruling to the owner rather
than quietly restating the number — restating a rule because the page failed it is §11.3 banned-list
item 2, and this document will not do it by default.

### 1.3 What the measurement confirms

Three carried-forward claims survive contact with the browser, and one is better than predicted.

- **Fix 5 is correct and sufficient.** The hero sub at **33 words renders 4 lines** at 375px
  (y 199–311, 112px). Phase 8's 44-word version renders **6 lines** (y 199–367, 168px). Phase 9
  predicted "5–6 lines" for the long version and 4 for the short. Exactly right.
- **The fold story is fixed, and Phase 8's version of it was indeed false.** Phase 9 suspected
  Phase 8's "deleting the eyebrow pulls the caption to the fold" was wrong. It was, in the reader's
  favour: with the 33-word sub the CTA caption's first line lands at **y = 399**, not the y ≈ 705
  Phase 9 computed for the 40-word version. It is **212px above** the 667px fold, not below it.
- **The whole hero argument clears the fold**, which nothing in the tournament claimed: H1 (117–181)
  · sub (199–311) · CTA (329–389) · caption (399–455) · **entire trust strip (477–605)** · and the
  **top 30px of the result card (637+)** breaking the fold line as a scroll cue. Verified in
  screenshot. The reader sees the category, the promise, the action, the price frame, the three
  de-risking facts, and the edge of the product's own artifact, without scrolling.
- **The pill rule holds, and Phase 9's estimate of it was pessimistic.** P7-2 measured the two
  closing filled pills 250px apart and expected fix 2 to widen it to ~490px. Measured: **672px**,
  which clears the 667px screenful — by 5px. It passes and it is knife-edge; §11.4 treats it as a
  standing hazard, not a solved problem.

---

## 2. Tokens and type

### 2.1 Tokens — no new ones

The landing introduces **zero** new custom properties. Everything below is `:root` in
`app/globals.css:1-34`, unchanged. `--landing-band` was removed 2026-07-27 and stays removed.

| Role | Token | Value |
|---|---|---|
| Page ground (the only plane) | `--page-bg` | `#f2f7f6` |
| Card material | `--surface` | `#ffffff` |
| Card border | `--border-soft` | `#e2e8f0` |
| Titles, verdict words | `--text-strong` | `#0f172a` |
| Body copy | `--text-body` | `#1e293b` |
| Labels, captions, the block-4 note | `--text-muted` | `#475569` |
| ⛔ **Banned page-wide** (fails AA on this plane, §5) | `--text-soft` | `#64748b` |
| Brand, CTA fill, focus ring | `--accent` | `#0d5f57` |
| CTA hover/pressed, link colour | `--accent-strong` | `#0a4a44` |
| CTA label | `--accent-contrast` | `#f8fafc` |
| Verdict sets (border + tint + text) | `--safe-*` `--moderate-*` `--high-*` | unchanged |
| Motion | `--dur-fast` `--dur` `--ease` | `150ms` `200ms` `cubic-bezier(0.22,0.61,0.36,1)` |

**`--accent-tint` (`#e6f2ef`) loses its landing role.** It carried `.landing-band`; the winner has
one plane, so on this surface the tint survives only inside `.result-card[data-risk="SAFE"]`'s own
token set. Do not reintroduce it as a section background.

### 2.2 The two faces — kept, and why the audit that tried to kill them was wrong

Contested item #1 is settled KEEP (Phase 8 Finding 3). The pairing is
**Plus Jakarta Sans (display) + Source Sans 3 (reading)** — a geometric/humanist contrast axis,
which is the pairing `impeccable` prescribes and the opposite of the "two similar sans" failure.

```
sans.className     → <body>            (app/layout.tsx)  — Plus Jakarta Sans, weights 400–800
reading.className  → the landing root  (app/page.tsx)    — Source Sans 3, weights 400/600/700
```

⛔ **`reading.className` stays on the landing root, never on `<body>`.** Two font classNames on
`<body>` race by stylesheet injection order and can flip the whole app's face. This is Tier A pin 6
(FINDING-030) and it is the pin both one-family proposals audited clean without addressing.

⛔ **Landing titles use 700, never 800.** Source Sans 3 loads 400/600/700 only; asking for 800
produces synthetic faux-bold. `app/globals.css:1728-1731` already caps `.landing .result-title` at
`22px / 700` for exactly this reason. Keep that rule and its comment.

### 2.3 The type scale — one body size, four steps

C2's graft is *one body size*, and it collapses C3's 16.5–17px **body** range. It does not flatten
the lede or the headings; a scale with no lede step loses the ≥1.25 hierarchy ratio.

| Step | Value | Used by |
|---|---|---|
| H1 | `clamp(1.9rem, 5.6vw, 2.9rem)` / `1.05` / `-0.02em` | the one H1 |
| H2 | `clamp(1.6rem, 4vw, 2.2rem)` / `1.1` / `-0.025em` | blocks 2–5, Fair questions |
| Card title | `22px / 700` | `.landing .result-title` (verdict word) |
| Lede | `18.5px / 1.6` | `.landing-section-lede` — one per block, max 62ch |
| FAQ summary | `18px / 700` | `.landing-faq summary` |
| **Body** | **`17px / 1.65`** | **everything else on the page** |
| Fineprint floor | `16px` | `.landing .result-disclaimer`, footer disclaimer |

**Measured:** H1 computes to **30.4px at 375px** and **46.4px at ≥518px** (the 2.9rem ceiling), and
renders **2 lines** at 375px. Body at 17px puts the hero sub at **4 lines**.

⚠️ **Tracking is size-specific, so the H1's changed.** The old `-0.03em` was tuned for the previous
`clamp(2.4rem, 6vw, 3.8rem)`, whose ceiling was 60.8px. The new ceiling is 46.4px — **24% smaller** —
and the floor is 30.4px, which is not display size at all. At 30.4px, `-0.03em` also compresses the
word spaces (`-0.91px` on a ~7.9px space, ~11% tighter) and the H1 visibly crowds. **Spec `-0.02em`**,
which is Apple's documented figure for large text and stays clear of `impeccable`'s `-0.04em` floor.

**Nothing on this page renders below 16px except tracked uppercase labels** — and the winner ships
**zero** eyebrows, so in practice nothing on this page renders below 16px at all. This is rail 10, it
is prose-only, and §13 routes it to 10C for a test.

```css
.landing { font-size: 17px; line-height: 1.65; }

.landing-h1 {
  margin: 0;
  font-size: clamp(1.9rem, 5.6vw, 2.9rem);
  line-height: 1.05;
  letter-spacing: -0.02em;   /* was -0.03em; retuned for the 24%-smaller ceiling */
  text-wrap: balance;
}

.landing-h2 {
  margin: 0;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

.landing-section-lede {
  margin: 0;
  max-width: 62ch;
  font-size: 18.5px;
  line-height: 1.6;
  color: var(--text-body);
  text-wrap: pretty;
}
```

`text-wrap: balance` on `h1, h2, h3` only. `text-wrap: pretty` on every prose block: `.landing-sub`,
`.landing-section-lede`, `.landing-pains li`, `.landing-card-caption`, `.landing-scope-note`,
`.landing-cancel`, `.landing-claims li`, `.landing-sources p`.

**Measure is `62ch` on every prose block**, replacing the incumbent's mix of 60ch / 68ch / unset.
`.landing-faq` keeps `max-width: 760px` (a container, not a measure).

### 2.4 One `font-size` per selector — a live pin

Tier A pin 7: **no `.landing*` selector may declare `font-size` twice.**
`landing-wiring-pins.test.ts` asserts it. The 2026-07-29 incident was an appended override block
that gave ~26 selectors two competing declarations resolved only by source order, which had already
silently defeated `.landing-cta--sm`. **Never re-append an override block.** Every value in §2.3
belongs in the selector's base rule.

---

## 3. The shape rule — corrected, in full

Phase 8 §13.4 states this rule as *"Outer surfaces 24px. Result cards 22px. The CTA pill 999px."*
and calls it "a documented rule followed everywhere." Both halves are wrong: the rule has five steps,
not three, and it is **not** followed everywhere.

`DESIGN.md:96`, verbatim:

> Radius scale: **24px** cards (`surface-card`) · **18px** inputs · **14px** nested cards ·
> **999px** buttons/pills/chips. Pick from the scale, never invent.

**The corrected rule, binding on 10A and 10B:**

> **Outer surfaces 24px · inputs 18px · nested cards 14px · result cards 22px · pills 999px.
> The landing chooses none of them — it renders the product's components and inherits whatever they
> are. `.result-card` nested inside `.surface-card` is the one place the product already violates
> its own scale, and the landing inherits the violation rather than papering over it.**

### 3.1 The violation, named precisely

`DemoCheckCard` (`components/demo-check-card.tsx:38-96`) renders `.surface-card` (**24px**,
`globals.css:115-120`) wrapping two `.result-card`s (**22px**, `globals.css:625-632`). The documented
nested-card value is **14px**. A 2px delta is the worst available answer: too different to read as
one surface, too similar to read as two.

⚠️ **Phase 8's Finding 2 misreads `DESIGN.md` and Phase 9 already withdrew it.** `DESIGN.md` does
**not** ban nested cards — line 96 gives them a radius and line 216 uses it (`--surface-muted` inset,
"14px radius, nested-card scale"). Line 357 bans *card mosaics on content pages*, a different rule.
`impeccable` bans nested cards; `DESIGN.md` does not. Do not restate a ban that does not exist.

⛔ **10A does not fix this.** Fixing it means editing `DemoCheckCard`, which three routes import, and
that is a product change, not a landing change. §13 routes it to 10C as a separate work item.

⛔ **The landing must not paper over it either.** No `.landing*` selector may declare
`border-radius` or `border` on `.result-card` or `.surface-card`. The page's central claim is *the
landing shows the product's card, unmodified*; a landing override would make that claim false while
appearing to improve the page. §13 routes the guard test to 10C.

### 3.2 What the landing does declare

Two card families, down from eight.

| Family | Recipe | Source |
|---|---|---|
| Result card | 22px radius, 2px verdict-or-`--border-strong` border, verdict tint | **inherited**, `.result-card` |
| Price tile | 24px radius, 2px `--border-soft`, `--surface`, the one shadow | `.landing-price-tile`, the `.surface-card` recipe |

**One shadow on the page:** `0 18px 40px rgba(15, 23, 42, 0.08)`. It is the only shadow in the
design system and the only `DESIGN.md` rule with an unqualified 7/7 endorsement. Nothing else casts
one. The FAQ `<details>` boxes, at 18px radius, carry a border and no shadow.

---

## 4. Rhythm and spacing

Three planes plus a hairline collapse to **one plane** (7/7 convergence). Sectioning is carried by
**air plus a hairline on the block**, which is C7's rider — the `<hr>` element goes.

```css
/* The one plane. White is card material, never a section background. */
.landing { background: var(--page-bg); color: var(--text-strong); }

.landing-frame { width: 100%; max-width: 1080px; margin: 0 auto; padding: 0 20px; }

/* Air does the sectioning. The hairline sits ON the block (C7's rider), not on an <hr>. */
.landing-section {
  padding: clamp(72px, 10vw, 128px) 0;
  border-top: 1px solid var(--border-soft);
}
.landing-section:first-of-type { border-top: 0; }

.landing-section-head {
  display: grid;
  gap: 12px;
  max-width: 640px;
  margin-bottom: 32px;
}
```

`clamp(72px, 10vw, 128px)` computes **72px at 375px** (10vw = 37.5px, below the floor), **72px
through 720px**, and reaches **128px at 1280px**. It replaces `clamp(52px, 7vw, 104px)` and the
`--tight` step; the winner has no short supporting sections left, so the second step has no subject.

**The spacing set — pick from it, do not invent:**

| Value | Use |
|---|---|
| `clamp(72px, 10vw, 128px)` | section padding, block 6 |
| `32px` | `.landing-section-head` bottom margin; `.landing-cta-stack--spaced` top margin |
| `28px` | between a block's body and its trailing prose (`.landing-scope-note`, `.landing-cancel`, `.landing-claims`, `.landing-sources`); row gap in `.landing-pains` |
| `22px` | `.landing-verdict-note` top margin |
| `18px` | `.landing-hero-copy` row gap |
| `16px` | card grid gaps; caption top margin |
| `12px` | `.landing-section-head` row gap |
| `10px` | `.landing-cta-stack` row gap; FAQ row gap |
| `8px` | trust-strip row gap |

**Hero padding stays `clamp(36px, 5vw, 64px) 0 clamp(52px, 7vw, 88px)`.** It is measured: the fold
result in §1.3 depends on the 36px top value at 375px. Raising it to the section clamp pushes the
trust strip's last line to y ≈ 641 and the card off the fold entirely. **Do not unify it with
`.landing-section` for tidiness.**

---

## 5. Colour and planes

- **One plane.** `--page-bg` throughout. `.landing-sheet` and `.landing-band` are deleted, along
  with the four-selector hairline-seam rule at `globals.css:1577-1583`.
- **White is card-only material.** If a region is white and is not a card, it is a bug.
- **Rail 14 is immutable this round: light surface, no dark bands.** Owner instruction 2026-07-27.
- **Verdict colour is information, never decoration.** It appears on `.result-card`'s border, its
  tint, and the verdict word. Nowhere else. No accent-tinted section, no coloured rule, no chip.
- **Verdict colour is never the sole channel.** Every verdict renders icon + word. That is rail 11,
  it currently ships without coverage, and §13 routes it to 10C.
- **⛔ `--text-soft` is banned on this page, full stop — and the reason is stronger than the graft
  claimed.** C4 grafted a per-block ban (1, 2, 3, 5) to replace review-time judgement with a rule.
  **Computed, it is not a taste rule at all:**

  | `--text-soft` `#64748b` on | Ratio | AA (4.5:1) |
  |---|---|---|
  | `--surface` `#ffffff` | 4.76:1 | pass |
  | **`--page-bg` `#f2f7f6`** | **4.40:1** | **FAIL** |
  | `--accent-tint` `#e6f2ef` | 4.15:1 | FAIL |

  `DESIGN.md:32` annotates the token *"AA at 16px on white"*. That is true and it is misleading:
  **the landing's plane is `--page-bg`, not white**, and the winner collapses to that single plane,
  so **every** `--text-soft` text use on the winner would sit at 4.40:1 and fail AA.

  **Therefore the block-4 exemption is withdrawn.** The `Illustrated examples.` note carries the
  AUD-008 label and the informational-only line; setting it below AA is the fine-print pattern
  `FTC-HEALTH-COMPLIANCE` is about. It uses `--text-muted` (7.00:1). ⚖️ **10B should correct the
  token's annotation**; the incumbent landing escapes the bug only by accident, using `--text-soft`
  once as a decorative `background` (`globals.css:2546`) in a block the winner deletes.
- **Contrast, computed for every pair on the page** (sRGB, WCAG 2.x):

  | Pair | Ratio | |
  |---|---|---|
  | `--text-strong` on `--page-bg` | 16.50:1 | AAA |
  | `--text-body` on `--surface` | 14.63:1 | AAA |
  | `--text-body` on `--page-bg` | 13.52:1 | AAA |
  | `--accent-strong` on `--page-bg` (links, the dare) | 9.35:1 | AAA |
  | `--high-text` on `--high-bg` | 7.60:1 | AAA |
  | `--text-muted` on `--surface` | 7.58:1 | AAA |
  | `--safe-text` on `--safe-bg` | 7.29:1 | AAA |
  | `--accent-contrast` on `--accent` (the CTA) | 7.19:1 | AAA |
  | `--text-muted` on `--page-bg` | 7.00:1 | AAA, exactly on the line |
  | `--moderate-text` on `--moderate-bg` | 6.84:1 | AA |

  The `globals.css:1663` comment records the CTA pair as 7.2:1; computed 7.19:1. **Confirmed.**

  ⚠️ **`--text-muted` on `--page-bg` lands on 7.00:1 — the AAA threshold to the second decimal.**
  It carries the CTA captions, the block-4 note and the footer disclaimer. It passes, with no margin
  at all. Any future darkening of `--page-bg` or lightening of `--text-muted` drops it below AAA;
  axe tests AA and would not report it.

---

## 6. The CTA system

### 6.1 Assembly — one component, no hand-building

`LandingPrimaryCta` in `app/page.tsx:67-84` is the **only** way a primary CTA reaches the page. Five
hand-built copies had drifted into four different shapes before it existed; that is Tier A-adjacent
scar tissue and it holds.

```
<div class="landing-cta-stack [landing-cta-stack--spaced]">
  <Link class="landing-cta" href="/check">Check your first meal — free</Link>   ← ledger copy
  [<p class="landing-cta-hint">…</p>]
</div>
```

⚠️ **The label contains an em dash and it stays.** `Check your first meal — free` is approved ledger
copy pinned by `copy-pins.test.ts`. `taste-skill` bans em dashes outright; this one is not the
skill's to remove. **After Phase 9's fix 6 the page's em-dash count is a true 4 strings, all
unstrippable** — the CTA, and three in ledger-approved trust-strip and FAQ copy. Any new em dash is
a bug.

### 6.2 The press — pointer-down, not click

```css
.landing-cta {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 52px;
  border: 2px solid var(--accent);
  border-radius: 999px;
  padding: 14px 26px;
  background: var(--accent);
  color: var(--accent-contrast);
  font-size: 17px;
  font-weight: 700;
  text-decoration: none;
  /* Never `all`. Two properties, named. */
  transition-property: transform, background-color, border-color;
  transition-duration: 120ms;
  transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}

.landing-cta:active {
  transform: translateY(1px) scale(0.98);
}

.landing-cta:hover {
  background: var(--accent-strong);
  border-color: var(--accent-strong);
}
```

`:active` fires on pointer-**down**, which is the point — feedback at the moment the user is
watching most closely, not on release. 120ms with a strong ease-out curve; the built-in CSS easings
are too weak to read as intentional, and `ease-in` on a press feels sluggish at any duration.

⚠️ **`--dur-fast`/`--ease` are NOT used here.** The sanctioned motion layer's
`cubic-bezier(0.22, 0.61, 0.36, 1)` at 150ms is the app's curve. The landing press is 120ms on
`cubic-bezier(0.23, 1, 0.32, 1)`. **This is a real divergence from `DESIGN.md` §Motion and 10B must
either adopt the landing curve system-wide or document the split.** ⚖️ → §13.

**Ghost variant** (nav, and nothing else on this page): `background: transparent;
color: var(--accent-strong);` on the same border. **Nav CTA is persistent ≥ 880px**; below that the
nav is wordmark + ghost pill, and the link row is `display: none` (the 640px rule at
`globals.css:1621-1632` stays — wrapping produced a 136px two-row nav, and every hidden link repeats
in the footer).

### 6.3 Focus

```css
.landing-cta:focus-visible { outline: 3px solid rgba(13, 95, 87, 0.45); outline-offset: 3px; }

/* C7's rider: 2px offset on cards, so the ring clears a 22/24px radius without
   colliding with the border. */
.landing .result-card:focus-visible,
.landing .surface-card:focus-visible,
.landing-price-tile:focus-visible { outline: 3px solid rgba(13, 95, 87, 0.45); outline-offset: 2px; }

.landing .inline-link:focus-visible,
.landing .result-disclaimer-link:focus-visible,
.landing-dare:focus-visible { outline: 3px solid rgba(13, 95, 87, 0.45); outline-offset: 2px; border-radius: 6px; }
```

The 6px radius on inline-link rings is deliberate and stays off the card scale — a card radius on a
one-line text link looks bulbous. Never remove an outline.

### 6.4 Targets

Global `min-height: 44px` on `button/input/textarea` (`globals.css:89-93`) plus `min-height: 52px` on
`.landing-cta` and 44px on `.landing-cta--sm`. Nav links get `min-height: 44px` via
`display: inline-flex` without changing the nav's height.

⛔ **No invisible hit-area expansion on inline links.** WCAG 2.5.8's inline exception covers them,
an `inline-block` stops them wrapping inside the 420px card, and this repo already rejected the
technique once when negative margins made adjacent targets overlap. This is rail 9; C5's target test
is adopted regardless of winner and §13 routes it to 10C.

---

## 7. Motion — one animation on the page

**The pause, block 3.** When the demo card enters the viewport:

| Beat | Element | Property | Timing |
|---|---|---|---|
| 0ms | `You type: oatmeal` | already visible | — |
| 0ms | clarify block | `opacity 0→1`, `translateY(6px)→0` | 220ms `cubic-bezier(0.23, 1, 0.32, 1)` |
| **+520ms** | `You answer:` + result card | `opacity 0→1`, `translateY(6px)→0` | 240ms, same curve |

The 520ms gap **is** the content: the product's willingness to wait, made visible. Not a loading
simulation, not a typewriter effect. Nothing pretends to be computing.

**Non-negotiable constraints:**

1. ⛔ **The animation enhances an already-visible default.** The card ships rendered at
   `opacity: 1`; an `IntersectionObserver` adds a class that *replays* it. A headless render, a
   hidden tab, or a JS failure ships the complete card. Gating content visibility on a class-driven
   transition is how reveal animations ship blank sections, and this card is the page's proof.
2. `transform` and `opacity` only. Both composite; neither triggers layout or paint.
3. Runs **once** — `{ once: true }`, `amount: 0.4`. The card is ~784px tall at 375px (measured), so
   a higher threshold would never fire on a small screen.
4. **`prefers-reduced-motion: reduce` → the class is never added**, gated in **both** CSS and JS.
   The global reduce block at `globals.css:36-44` zeroes durations, which is the safety net, not the
   implementation.
5. **Exactly two CSS transitions exist site-wide on this page:** the CTA press and link colour.
6. ⛔ **No scroll reveals anywhere else.** 4/7 contenders shipped zero motion; nobody proposed
   section reveals. A uniform entrance on every block is the AI-grammar tell, not motion itself.

```css
@media (prefers-reduced-motion: reduce) {
  .landing-cta { transition: none; }
  .landing-cta:active { transform: none; }
  .landing-pause-step { opacity: 1; transform: none; transition: none; }
}
```

---

## 8. Accessibility

- **Skip link** `.app-skip` → `#landing-hero`, outside `<main>`, the first focusable. It must stay
  outside the landmark it skips within, or it is announced as main content.
- `#landing-hero` keeps `tabIndex={-1}` so the skip link **moves focus**, not just scroll.
- `<nav aria-label="Main">`. One `Main` landmark.
- **Every list that looks like a list carries `role="list"`.** `list-style: none` strips list
  semantics in Safari/VoiceOver. Applies to `.landing-trust-strip`, `.landing-pains`,
  `.landing-claims`.
- Icons are `aria-hidden` and always sit next to text. Restated rule: an icon never carries meaning
  alone **unless** it is a redundant channel for text in the accessible name.
- `.landing-faq` uses native `<details>/<summary>`. The chevron is a rotated border, no icon import,
  and its transition is disabled under reduced motion.
- ⚠️ **The disclaimer is never behind a disclosure.** Rail 5. `disclaimer-presence.test.ts` covers
  engine responses only, so on this surface the rail is prose. It holds structurally here: the hero
  card renders `<DisclaimerLine />` inline, block 4 states it once in visible prose, and the footer
  renders `BOUNDARY_DISCLAIMER` in full. **None of the three is inside a `<details>`.**

---

## 9. The build, block by block

Copy is the Phase 9 amended deck, verbatim. `{TASTER_LIMIT}`, `{monthlyPrice}` and
`{FREE_DAILY_CHECKS}` are **interpolated, never typed**. *(ledger)* marks approved rows that must
not be edited.

Measured geometry is given per block at 375px so 10C can predict its own diffs.

### Block 1 — Hero · measured 81→1,221 (1,141px)

```
nav        .landing-nav          Revora · [How it works · Pricing · Pantry Review ≥640px] · ghost "Check a meal"
section    .landing-hero #landing-hero tabIndex={-1}
  div      .landing-hero-copy
    h1     .landing-h1           A meal checker built only for prediabetes.
    p      .landing-sub          33 words, see below
    div    .landing-cta-stack    CTA + caption
    ul     .landing-trust-strip  role="list", 3 items (ledger home-trust-strip, verbatim)
  div      .landing-hero-proof   ← renamed from .landing-phone
    <ExampleResultCard variant="clear" withFineprint />
    p      .landing-card-caption
```

- ⛔ **No eyebrow.** Its seven words are now the H1. This is de-duplication, **not** C7's
  delete-on-principle — C7 deleted the eyebrow and left a headline about a competitor as the only
  thing above the fold, and died on Category 3.00, the only unanimous score in 420.
- **H1:** `A meal checker built only for prediabetes.`
- **Sub (33 words):** `Describe the plate in front of you. One card back: where it lands, why, and a change worth making when there is one. For an A1C of 5.7% to 6.4%. Nothing to log.`

  ⛔ **`the plate in front of you` is load-bearing and may not be cut for pixels.** The H1 reads
  *categorised*, not *recognised* — `only` is C4's market-shrinking move and C4 died at Emo 2.83.
  What rescues it is the second-person, present-tense, concrete object in the next line. The H1
  cannot absorb its loss. Measured cost of keeping it: **4 lines, 112px**. Affordable.

  ⚠️ **Accepted deviation, now measured.** 33 words is 1.65× `taste-skill` §4.7's 20-word hard
  ceiling. Both clauses that would close the gap are load-bearing: the A1C range is C4's graft
  (Category 8.67) and `a change worth making when there is one` is rail 4 written as a sentence —
  the Clear card structurally cannot carry an adjustment, because
  `postprocess.ts assertNoUnsafeSafeFields` throws. **The deviation is accepted and the measurement
  that justifies it is §1.3.**
- **CTA:** `Check your first meal — free` *(ledger)* · caption
  `{TASTER_LIMIT} free checks on your first day, then you decide.`
- **The card:** a real result card at Clear, in the live classes.

  | Slot | Value |
  |---|---|
  | Label | ⛔ **rendered from `demoExampleEyebrow(null)`, never typed** → `An illustrated example` |
  | Meal | `Grilled chicken, brown rice, and a side salad` *(ledger, `landing-three-answers`)* |
  | Verdict | `Clear` — icon + label, the only tinted row |
  | Why | `This looks like a reasonable fit. The meal already has protein and vegetables, so it looks more balanced than a fast-carb-heavy option.` *(ledger, `result-safe-example`)* |
  | Fineprint | `{BOUNDARY_DISCLAIMER}` via `<DisclaimerLine />`, never retyped |
  | Adjustment / Swap | ⛔ **none.** Rail 4 |

  ⚠️ **The label is Phase 8's Finding 5 reproduced.** The hero's hand-typed `An illustrated example`
  is character-for-character `demoExampleEyebrow(null)` (`demo-check-card.tsx:24-33`). Finding 5
  caught this in block 3's caption and the winner then reproduced it in block 1. When an authorised
  live capture exists the function returns `A real check, captured <date>` and a hand-typed literal
  silently becomes a **false claim**. This makes the `<ExampleResultCard>` extraction load-bearing,
  not a nicety. → §13.
- **Caption:** `This is the whole screen. No score, no dashboard, no change to make: this meal already looks balanced, so that is the whole answer.`
- **Trust strip** *(ledger `home-trust-strip`, verbatim)*: `No login for your first checks.` ·
  `When we're unsure, we say so.` · `If you ever subscribe, cancel is one tap — not an email.`

```css
.landing-hero { display: grid; gap: clamp(32px, 5vw, 56px);
  padding: clamp(36px, 5vw, 64px) 0 clamp(52px, 7vw, 88px); align-items: center; }
@media (min-width: 880px) { .landing-hero { grid-template-columns: 1.05fr 0.95fr; } }
.landing-hero-copy { display: grid; gap: 18px; justify-items: start; }
.landing-sub { margin: 0; max-width: 62ch; font-size: 17px; line-height: 1.65;
  color: var(--text-body); text-wrap: pretty; }
.landing-cta-stack { display: grid; justify-items: start; gap: 10px; }
.landing-cta-stack--spaced { margin-top: 32px; }
.landing-cta-hint { margin: 0; font-size: 17px; line-height: 1.65; color: var(--text-muted); }
.landing-hero-proof { justify-self: center; width: 100%; max-width: 420px; }
.landing-card-caption { margin: 16px 0 0; max-width: 62ch; font-size: 17px; line-height: 1.65;
  color: var(--text-body); text-wrap: pretty; }
```

### Block 2 — The gap · measured 1,221→2,500 (1,279px)

H2 `Six months is a long time to guess.` · lede · four items · scope note · CTA.

The four items are a **plain `<ul>` with bold lead-ins** — no card, no border, `28px` row gap. The
pains list is right and its container was wrong (6/7 keep the words, 4 change the format). Boxing
three sentences about the reader's last six months makes them look like features.

⛔ **`Not a general nutrition app, not a calorie counter, not built for everyone.` is deleted.**
It is listed **in the Brief's own objection table under "What only sounds like it does"** — every
calorie counter says it is not a calorie counter, and `ICP.md` §8 has MyFitnessPal-is-free as the #1
deal-killer. Three negations in a row, four lines above the highest-intent pre-pricing exit. The
hero already answered objection 1 the correct way, by showing one card.

Scope note keeps only the half that works:
`Revora exists for that gap and nothing else. If your A1C sits outside 5.7% to 6.4%, it says so plainly and points you to a clinician instead of pretending.`

⚠️ **Recorded trade-off, not fixable here.** Block 2 has no reassuring object on screen for
**1,109px** (measured, head→CTA). The only remedy is a rendered card, the only cards available are
verdict cards, and putting a verdict next to a description of the reader's failures breaks the
spine's white-means-product rule. **Rejected and recorded.** The sandwich Phase 8 described — hero
card above, block 3's demo below — does not exist in the viewport: the hero card is off-screen
before block 2's H2, and the demo is 1,543px (measured) below it.

```css
.landing-pains { display: grid; gap: 28px; max-width: 62ch; margin: 0; padding: 0; list-style: none; }
.landing-pains li { color: var(--text-body); font-size: 17px; line-height: 1.65; text-wrap: pretty; }
.landing-pains li strong { display: block; color: var(--text-strong); }
.landing-scope-note { max-width: 62ch; margin: 28px 0 0; color: var(--text-body);
  font-size: 17px; line-height: 1.65; }
```

### Block 3 — The pause · measured 2,500→3,736 (1,236px)

H2 `It asks before it guesses` *(Tier B pin, kept)* · lede · `<DemoCheckCard />` · caption · dare link.

- The component renders **its own** `An illustrated example` label (AUD-008). ⛔ Nothing here repeats it.
- **Caption:** `Without that one question, Revora would have been guessing.`
  Replaces `Most apps take the same four letters and return a confident number.` on two independent
  grounds that landed on the same string: **P4** — the comparative family has no claim class (§12.2);
  **P6** — the old line tells the reader the moral of a scene they just watched, which is the one
  place on the page the reader feels *managed*.
- **Exit: a text link on its own line, not a pill.** `Type "oatmeal" and see what it asks you.` → `/check`
- ⛔ **No filled CTA under the pause.** The absence is the argument.

⚠️ **This link is the page's most important non-primary CTA.** It is the only real answer to the
strongest criticism the winner will receive: *"Three example cards is not a demo. $12.99/mo after ten
checks is a lot of trust to extend to a page where every card is labelled 'illustrated example'."*
Four of five cards are fixtures; this link is the one place the reader can make the product do the
thing. **Instrument it separately.** → §13.

⛔ **`You type: oatmeal` must never be an `<input>`.** It looks like one. Static text,
non-focusable, no caret. Still live — the demo card renders that line.

```css
.landing-dare { display: inline-block; margin: 16px 0 0; font-size: 17px; line-height: 1.65;
  color: var(--accent-strong); }
```

### Block 4 — Three answers · measured 3,736→5,896 (2,160px)

H2 `The same card, three times.` · lede · three cards · note · CTA · sources.

**Lede** (fix 4 folded in): `One layout, whatever the answer is. The first card is the one from the top of this page, next to the two you have not seen. The Clear card carries no change to make, because when a meal already looks balanced Revora says so and stops. It does not invent a correction to look useful.`

That second sentence exists because the hero card and card 1 are **byte-identical** — same meal, same
`result-safe-example` row — under an H2 reading `The same card, three times.` A page whose central
diagnosis was a duplication census reintroduced a verbatim duplicate of its own centrepiece. The
lede converts the duplicate into evidence for free; a fourth meal fixture would cost two ledger rows.

| # | Meal | Verdict | Extra | Measured h |
|---|---|---|---|---|
| 1 | `Grilled chicken, brown rice, and a side salad` | `Clear` | ⛔ **none** | 284px |
| 2 | `A bagel with jam and a glass of orange juice` | `Be careful` | `Adjustment:` | 350px |
| 3 | `A large soda with fries on the side` | `Hold off` | `Swap:` | 324px |

⛔ **Do not give the Clear card an adjustment or a swap.** `assertNoUnsafeSafeFields` throws on it in
the engine. The layout has to survive a card with nothing in that slot; that survival **is** the
argument.

- **Note:** `Illustrated examples. Every card ends with the same line: Revora is informational only and is not medical advice.` — **`--text-muted` (7.00:1), not `--text-soft`.** This is the one place C4's graft permitted `--text-soft`; §5 withdraws the exemption, because on this page's single plane that token measures 4.40:1 and fails AA, and this note carries the AUD-008 label and the informational-only line.

  ⚠️ **Correction to my own first measurement.** The three cards do **not** each render
  `<DisclaimerLine />`; the copy deck gives them meal / verdict / why / (adjustment|swap) and states
  the disclaimer once, here. Rendering it four times inflated block 4 by 645px in the first run and
  is also a rail-5 misreading — the note satisfies visibility, and four copies of a 24-word legal
  line would be the fine-print pattern `FTC-HEALTH-COMPLIANCE` is about, at volume.
- **CTA:** `Check your first meal — free`
- **Then the sources, as the block's closing footnote** *(C4's copy, verbatim)*, below the CTA:
  - `Revora's general meal-planning principles map to public-health guidance and cited nutrition research — that carbs raise blood sugar, that pairing them with protein, fibre or nonstarchy vegetables can slow the rise, and that less-refined carbs generally land more gently than highly refined ones.`
  - `Those sources support narrow educational statements about food. They are not evidence that Revora produces a particular health result, and nothing on this page claims otherwise.`
  - Link: `Read the sources and the limits` → `/how-it-works`

⛔ **`.landing-proof-band` is deleted.** 6/7 contenders deleted it; C4 kept it only by neutering the
left column. **A component whose primary affordance must be disabled for the content to be safe is
the wrong component.** Rail 7's purpose is now discharged *structurally* — no stat-strip affordance
exists to put a number into — rather than by a CSS comment asking nobody to.

⛔ **The DPP statistic stays off this page.** Rail 6, family `study-association`. The trial citation
lives only on `/how-it-works` and is pinned there.

```css
.landing-verdicts { display: grid; gap: 16px; align-items: start; }
@media (min-width: 880px) { .landing-verdicts { grid-template-columns: repeat(3, 1fr); } }
.landing-verdict-note { max-width: 62ch; margin: 22px 0 0; color: var(--text-muted);
  font-size: 17px; line-height: 1.65; }
.landing-sources { max-width: 62ch; margin: 28px 0 0; display: grid; gap: 12px;
  font-size: 17px; line-height: 1.65; color: var(--text-body); }
```

### Block 5 — The offer · measured 5,896→7,661 (1,765px)

H2 `Ten free checks, then a week, then a decision.` · three tiles · cancel paragraph · four claims ·
Pantry · CTA.

⛔ **Both funnel branches must be present.** Tier A pin 3. Tiles render from `paywallMode()` and
`resolvePriceVariant()`; no literal `$9.99|$12.99|$19.99` may appear in source.

**Trial branch** (live default):

| Tile | Head | Body |
|---|---|---|
| `Day 1` | `{TASTER_LIMIT} free checks` | `Check up to {TASTER_LIMIT} meals on your first day, no login and no card. They live on this device.` |
| `Days 2–8` | `7 days free` | `Card required, nothing charged. Day 5, we email you the exact date and the exact amount, with a one-tap cancel link in it.` |
| `After your free week` | `{monthlyPrice}/month` | `Or $99.99 a year, which is $8.33 a month. Cancel in one tap, effective at the end of the period.` |

**Legacy branch:** `Day 1` / `{TASTER_LIMIT} free checks` (same body) · `Every day` /
`A free account` / `No card. A free account still includes {FREE_DAILY_CHECKS} free checks a day, still no card, with your history saved to your account.` · `Premium` / `{monthlyPrice}/month` (same body as trial tile 3).

⛔ **`{FREE_DAILY_CHECKS}` is interpolated, never typed.** Tier A pin **10**, added by Phase 9.
`copy-pins.test.ts:97-113` asserts it in **both** the legacy tile and the legacy FAQ answer. The copy
deck typed the numeral `5` in both places and no phase before 9 listed this constant.

⚠️ **The tiles are a reason, not an excuse.** They are the most template-shaped structure left on the
page and they survive because the middle tile carries the least portable sentence on it:
`Day 5, we email you the exact date and the exact amount…`. **Falsifiable test: if that sentence ever
leaves the tile, the tiles become the generic thing and should go.**

- **Cancel paragraph, at the same weight as the price** *(C6, verbatim)*:
  `Stopping is one tap on your account page, effective at the end of the period. No retention screen, no "are you sure", no email you have to write. We know why you are reading this paragraph carefully.`
- **Four claims**, one line each, most-asked first, no numerals:
  - `A record you can actually show someone: unlimited checks, every one saved, on every device.`

    ⚠️ **This ordering is deliberate and fixes a grammar break.** The Phase 8 form was
    `Unlimited checks, and A record you can actually show someone: …` — a capital `A` mid-clause,
    because lowercasing it would fail `landing-wiring-pins.test.ts`'s pin. Leading with the pin
    keeps the assertion and the sentence.
  - `A weekly recap in sentences. Never a grade, never a lab prediction.`
  - `One optional reminder a day, off by default. Skip a day and nothing turns red. Blank days are just blank.`
  - `Your A1C and meal text encrypted at rest, deleted in one tap, account included.`
- **Pantry:** `Or check the whole kitchen, once. The Pantry Review sorts what you already own into one printable report. $49, one payment, nothing renews.` · link `See a sample report`
- **CTA:** `Check your first meal — free`

```css
.landing-price-tiles { display: grid; gap: 16px; }
@media (min-width: 720px) { .landing-price-tiles { grid-template-columns: repeat(3, 1fr); } }
.landing-price-tile { display: grid; gap: 8px; align-content: start;
  background: var(--surface); border: 2px solid var(--border-soft); border-radius: 24px;
  padding: 22px; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08); }
.landing-price-day  { margin: 0; font-size: 17px; font-weight: 700; color: var(--text-muted); }
.landing-price-what { margin: 0; font-size: 22px; font-weight: 700; }
.landing-price-tile p { margin: 0; font-size: 17px; line-height: 1.65; color: var(--text-body); }
.landing-cancel { max-width: 62ch; margin: 28px 0 0; font-size: 17px; line-height: 1.65;
  color: var(--text-body); }
.landing-claims { display: grid; gap: 14px; max-width: 62ch; margin: 28px 0 0; padding: 0;
  list-style: none; font-size: 17px; line-height: 1.65; color: var(--text-body); }
```

### Fair questions · measured 7,661→8,188 (528px) — **above the final CTA**

Four `<details>` rows. The copy is the amended deck; both funnel branches present.

⚠️ **The move is free, and Phase 8's stated reason for fearing it was wrong.** Phase 8 flagged a
FAQ/JSON-LD mismatch risk from moving the block. Placement is irrelevant: `app/page.tsx:104` declares
`faqs` **once** and both consumers map the same array — the visible `<details>` at :857 and
`mainEntity` at :161. **The mismatch is impossible by construction, in the incumbent, today.** Three
contenders flagged a defect they would have *introduced*. The invariant is currently guaranteed by a
code comment; §13 routes the pin to 10C.

⛔ **Strip the two uncounted em dashes** from the FAQ answers in **both** branches (fix 6). Neither is
pinned, and the winner already stripped a third from the adjacent answer — an oversight, not a policy.
After this the page's em-dash metric is true.

### Block 6 — Close · measured 8,188→8,460 (271px)

⛔ **H2 and sub deleted.** Four elements, every one a restatement of the hero, no object, proving
nothing — the most generic surviving structure on the page, ahead of the price tiles.

- CTA `Check your first meal — free` · caption `No login. No card. {TASTER_LIMIT} free checks on your first day.`

```css
.landing-final { display: grid; gap: 18px; justify-items: start;
  padding: clamp(72px, 10vw, 128px) 0; border-top: 1px solid var(--border-soft); }
```

### Footer · measured 8,460→8,621 (162px)

Four columns (Product / Learn / Legal / Apps), `Add to home screen — works today` *(Tier B, kept)*,
and `{BOUNDARY_DISCLAIMER}` rendered **in full**. Breakpoints 640 (two-column) and 880 (four-column).

---

## 10. The CSS delta

Landing layer is `app/globals.css:1534-2570`. Breakpoints stay **640 / 720 / 880** — a new one needs
a reason recorded in `DESIGN.md`.

### 10.1 Delete

| Selector(s) | Lines | Because |
|---|---|---|
| `.landing-sheet` · `.landing-band` · the 4-selector hairline seam | 1569-1583 | one plane (7/7) |
| `.landing-eyebrow` | 1775-1782 | zero eyebrows |
| `.landing-proof-band` + `.landing-proof-stat` + `p` + `.landing-proof-note` | 1872-1920 | band deleted; content survives as prose in block 4 |
| `.landing-grid-3` · `.landing-step` · `.landing-step-num` · `.landing-step h3/p` | 1956-1998 | how-it-works retired (7/7) |
| `.landing-proof` · `.landing-proof-item` + children | 2000-2034 | trust cards retired |
| `.landing-verdict*` (7 selectors) | 2218-2273 | replaced by the live `.result-card` |
| `.landing-features` · `.landing-feature` + children | 2302-2324 | feature grid retired |
| `.landing-pantry` · `.landing-pantry-buckets` + risk variants | 2327-2385 | Pantry becomes prose |
| `.landing-glance` · `.landing-glance-fact` · `.landing-glance-label` | 2462-2507 | glance strip retired |
| `.landing-outcomes` · `.landing-outcome*` | 2509-2570 | before/after grid retired |
| `.landing-section--tight` | 1930-1932 | no short supporting sections remain |
| `.landing-pains-note` | 2193-2199 | superseded by `.landing-scope-note` |

⚠️ **Deleting `.landing-glance-fact` incidentally fixes an unflagged inconsistency.** It renders
`10 seconds` unhedged while the hero says "about ten seconds." No test family catches it — it is a
latency claim, not a health claim, so no fence reads it.

⛔ **But deleting the glance strip breaks a test in the OTHER suite, and no phase has listed it.**
`tests/smoke/landing-a11y.spec.ts:62-77` (`landing landmarks and list semantics stay intact`) asserts
`getByRole("heading", { name: "Revora at a glance" })` and
`locator("ul.landing-glance").toHaveAttribute("role", "list")`. Both vanish with the strip.

**This matters because it is invisible to `npm test`.** `vitest.config.ts` includes only
`tests/**/*.test.ts`; `tests/smoke/*.spec.ts` is Playwright (`playwright.config.ts testDir:
"./tests/smoke"`), run by `npm run e2e`. **A green `npm test` does not clear the landing.** → §13.

### 10.2 Rename

| From | To | Because |
|---|---|---|
| `.landing-phone` / `.landing-phone-inner` | **`.landing-hero-proof`** (one element) | the bezel was removed 2026-07-27; the class name has been lying since |

### 10.3 Change

| Selector | Change |
|---|---|
| `.landing` | add `font-size: 17px; line-height: 1.65;` |
| `.landing-h1` | `clamp(2.4rem, 6vw, 3.8rem)` → `clamp(1.9rem, 5.6vw, 2.9rem)`; `-0.03em` → `-0.02em`; add `text-wrap: balance` |
| `.landing-h2` | add `text-wrap: balance` |
| `.landing-sub` | `clamp(1.15rem, 2.1vw, 1.4rem)` → `17px`; `1.6` → `1.65`; `60ch` → `62ch`; add `text-wrap: pretty`; drop the dead `opacity: 1` |
| `.landing-section` | `clamp(52px, 7vw, 104px)` → `clamp(72px, 10vw, 128px)`; add `border-top: 1px solid var(--border-soft)` + `:first-of-type` reset |
| `.landing-section-head` | `gap: 10px` → `12px` |
| `.landing-section-lede` | add `text-wrap: pretty` |
| `.landing-cta` | replace the 3-property `transition` shorthand with `transition-property/duration/timing-function`, 120ms, `cubic-bezier(0.23, 1, 0.32, 1)` |
| `.landing-cta:active` | `translateY(1px)` → `translateY(1px) scale(0.98)` |
| `.landing-pains` | `gap: 14px` → `28px`; `68ch` → `62ch`; `li` size `clamp(1.05rem, 1.9vw, 1.25rem)` → `17px`; `li strong` gains `display: block` |
| `.landing-trust-strip li` | `16.5px` → `17px`; `1.55` → `1.65` |
| `.landing-cta-hint` | `16px` → `17px`, add `line-height: 1.65` |
| `.landing-faq details > p` | `1.62` → `1.65` |
| `.landing-final` | `clamp(52px, 6vw, 88px)` → `clamp(72px, 10vw, 128px)`; add `border-top` |
| `.landing-verdict-note` | `68ch` → `62ch`; `1.6` → `1.65` |

⛔ **Every one of these is an edit to the selector's existing base rule.** Appending a second
declaration is Tier A pin 7 and `landing-wiring-pins.test.ts` fails on it.

### 10.4 Add

`.landing-hero-proof` · `.landing-card-caption` · `.landing-scope-note` · `.landing-dare` ·
`.landing-sources` · `.landing-cancel` · `.landing-claims` · `.landing-price-tiles` /
`.landing-price-tile` / `.landing-price-day` / `.landing-price-what` (restyled from the existing
2036-2078 block) · the card focus-offset rule · the reduced-motion additions.

### 10.5 The source-order comment — write it ON the rule

Phase 8 Finding 4. `.landing .result-disclaimer` and `.result-fineprint .result-disclaimer` have
**identical specificity (0,2,0)**. The landing's 16px wins over the app's 13px **only because it is
later in the file** — verified: `globals.css:778` vs `globals.css:2281`. Correct, fragile, and
invisible to the duplicate-`font-size` pin, which counts declarations per selector and sees one each.

The spec is not the place this has to live. **The comment goes on the rule**, in `globals.css`:

```css
/* `.result-disclaimer` sits in the shared 14px hints/meta group (DESIGN.md §Type). The landing runs
   the larger scale — nothing below 16px except tracked uppercase — and both landing instances (the
   hero card and the footer) carry the informational-only disclaimer.

   ⚠️ SOURCE-ORDER DEPENDENCY. This rule and `.result-fineprint .result-disclaimer` (L778, 13px)
   have IDENTICAL specificity (0,2,0). This one wins only because it is LATER IN THIS FILE. Moving
   either block, or reordering the file, silently drops the landing's compliance line to 13px and
   breaks the 16px floor (rail 10). The duplicate-font-size pin cannot catch it: it counts
   declarations per selector and sees exactly one on each. DO NOT MOVE THIS BLOCK ABOVE L778. */
.landing .result-disclaimer { font-size: 16px; }
```

⛔ **10C must not move this block.**

---

## 11. The measured desert map, and the one open ruling

### 11.1 The rule under test

C5's organ, restated by Phase 7 at the level it holds:

> No stretch may exceed **1,460px at 375px** — the shortest longest-desert any contender achieved
> without a fixed element (C1, the IA winner). Deserts are measured in pixels, at 375px, and reported
> in the spec.

C5's *literal* rule (no stretch over 667px without a reachable primary action) entails eleven exits
on this page and there is exactly one way to get eleven exits: a fixed element. **C5's rule entails
C5's bar**, and the bar is what killed C5 at Craft 3.33. So the restatement was necessary. The
question is whether the restated number is achievable.

### 11.2 Measured — four arrangements

| Arrangement | Page | cta1→cta2 | →dare | →cta4 | →cta5 | →cta6 | Longest |
|---|---|---|---|---|---|---|---|
| **Winner as specified** | 8,621px | **1,941** | 1,246 | **1,581** | **2,224** | 672 | **2,224** ✗ |
| A · block-4 CTA above the cards | 8,589px | **1,941** | 1,246 | 454 | **3,319** | 672 | **3,319** ✗ |
| B · block-3 dare becomes a pill | 8,697px | **1,941** | 1,262 | **1,581** | **2,224** | 673 | **2,224** ✗ |
| **C · block-4 CTA before the note + block-5 CTA after the tiles** | 8,621px | **1,941** | 1,246 | **1,475** | **1,563** | 1,439 | **1,941** ✗ |
| D · C + a text-link exit under the hero caption | 8,694px | 796 / 1,161 | 1,246 | **1,475** | **1,563** | 1,440 | **1,563** ✗ |

**Nothing clears 1,460px.** The best arrangement in the winner's own vocabulary (D) still misses by
**15px** in one gap and **103px** in another. Arrangement A — which is the shape the handoff's
prescribed remedy gestures at — makes the worst gap **49% worse**. Arrangement B (promoting the dare
link to a pill) changes **nothing** that matters: it costs block 3 the absence that is its whole
argument and buys 0px on any failing gap.

⚠️ **The handoff's prescribed remedy was already applied and is not the lever.** §13 of the
consolidated handoff says: *"If the 1,450px stretch comes back over budget, the remedy is to move
block 4's sources paragraphs below the CTA (recovers 180px)."* The sources are **already** below the
CTA in the spec measurement above, and the binding gap is 764px over. The remedy addresses ~24% of
the shortfall in the gap it targets and 0% of the worst one.

### 11.3 Why it cannot be arranged away

The winner has **6 exits over 8,621px** = one per **1,437px average** — already at the budget, before
spacing. And the spacing is not free: each block's exit sits where its **argument** ends, not on a
pixel grid. Every long block therefore contributes its full height to one gap.

The two grafted rules are in direct tension:

- **C5's reachability rule** wants more exits (≥ 7 at this length, well-spaced).
- **The restated pill rule** ("one filled pill per screenful", 5/7) caps how many you can add.

Phase 9 found this collision at the page's foot (P7-2) and treated it as local. **It is global.** The
budget was derived from C1's page and transplanted onto a page that measures 8,621px; the transplant
was never checked, in any phase, because the tournament ran on paper.

### 11.4 The knife-edge

The two closing pills clear the 667px screenful by **5px** (672px measured) in the specified
arrangement. Any copy growth in the FAQ or block 6 puts two filled pills in one viewport and breaks
the restated pill rule. Arrangement C incidentally widens this to **1,439px**, which is the single
strongest practical argument for it.

**Fallback if it ever breaks, already specified:** make block 6's exit a text link on block 3's
pattern.

### 11.5 ⚖️ The open ruling — for the owner, not for this document

Three options. All are measured; none is free.

| Option | What it costs | What it buys |
|---|---|---|
| **1 · Ship arrangement C, restate the budget to a derived number** | Restating a rule the page failed. Must be named as such, not slipped in | Max desert **1,941px**, longest-pill gap 1,439px, no new copy, no new ledger row. A **63% improvement** on the incumbent's 5,228px |
| **2 · Ship arrangement D** | One new sentence under the hero caption → one new ledger row, one new claim-class filing, and a second exit inside the hero | Max desert **1,563px**. Closest to the rule anyone can get |
| **3 · Hold the 1,460px rule literally** | Requires cutting ~1,000px of copy or adding a 7th filled pill that breaks the pill rule | The rule as written |

**Recommendation: option 1**, with the budget restated to a *derived* figure and the derivation
shown — **no desert may exceed 3 screenfuls (2,001px) at 375px** — plus arrangement C's reorder,
which is free and fixes the two worst gaps.

⚠️ **And it must be recorded as a rule change, not a measurement result.** §11.3 banned-list item 2
is *"a named defect is not a mitigated defect"*, and item 5 is *"a diagnostic is not a design
brief."* Moving a number because the page missed it is the failure mode both items describe.
**This document declines to make that change unilaterally.** → §13, 10B.

⚠️ **Option 1's reorder has a copy cost that must be weighed, not assumed.** It puts the CTA between
the price tiles and C6's cancel paragraph, and that paragraph's power is its **adjacency to the
price** — "at the same weight as the price" is how the graft was specified. A button between them is
a real intrusion. The pixel win is 661px; the copy cost is one graft's adjacency. ⚖️ **Owner's call.**

### 11.6 What is true regardless of the ruling

| | Incumbent (measured today) | Winner (measured) |
|---|---|---|
| Content blocks | 13 | **6** |
| 375px length | 13,346px · 20.0 screens | **8,621px · 12.9 screens** |
| Longest CTA desert | 5,228px | **2,224px** (spec) / **1,941px** (C) |
| Exits | 7 | 6 |
| Card families | 8 | **2** |
| Eyebrows | 4 | **0** |
| Background planes | 3 + hairline | **1** |
| Em dashes | 42 recorded | **4 strings, all unstrippable** |
| Rails with tests | 8 of 15 | **10 of 16** (after 10C adopts C5's two) |

**The page gets 35% shorter and its worst dead stretch gets 58–63% shorter.** That is the win, and it
survives the ruling either way. What does not survive is the claim that the winner *satisfies* C5's
rule — it does not, and no document should say it does.

---

## 12. Verified against source

Phase 9's standing lesson is that every document in this repository is as unverified as the code was.
This phase re-checked the load-bearing claims it depends on.

### 12.1 Confirmed true

| Claim | Evidence |
|---|---|
| `Most apps would just pick one and sound confident.` ships today, unledgered | `app/page.tsx:523-524`, read directly |
| Finding 4's source-order dependency is real | `globals.css:778` (13px) vs `:2281` (16px), identical specificity (0,2,0) |
| The hero label duplicates a computed string | `demo-check-card.tsx:24-33` returns `An illustrated example` character-for-character |
| `DemoCheckCard` nests `.result-card` (22px) in `.surface-card` (24px) | `demo-check-card.tsx:38-96` · `globals.css:115-120`, `625-632` |
| `DESIGN.md` does **not** ban nested cards | `DESIGN.md:96` gives them 14px; `:216` uses it; `:357` bans card *mosaics* |
| The `faqs` array has one declaration and two consumers | `app/page.tsx:104`, `:161`, `:857` |
| The one-`font-size`-per-selector pin is live | `globals.css:1539-1550` records the incident; the pin is asserted |
| Landing breakpoints are 640/720/880 | confirmed across the landing layer |

### 12.2 The comparative-confidence ruling — cited, not reopened

**Unavailable at any scale.** `docs/safety/claims-boundary.md` defines nine claim classes and every
one is about Revora: `product-role`, `prompt-scope`, `prompt-policy`, `result-qualitative-impact`,
`result-adjustment`, `clarification-route`, `refusal-route`, `out-of-scope-routing`,
`disclaimer-footer`. **There is no class under which a statement about another company's product can
be filed**, and `validate-safety-contract --claims-boundary` rejects a row whose class does not
resolve. The sentence is neither approved nor banned; it is **outside the schema**.

Cite the reason, never a vote. Creating a class is a governance decision for counsel.

⚠️ **The shipped instance is a governance item independent of ship/no-ship.** The winner deletes the
block it lives in, so shipping the winner *incidentally* fixes it — **and not shipping the winner
leaves it in place.** Do not let a redesign silently discharge it. → §13.

### 12.3 The three fences — do not conflate them

"It passes the guards" was treated as clearance for four phases. It is not.

| Fence | Reads | Proves |
|---|---|---|
| `claims-boundary-copy.test.ts` | every `.tsx` under `app/` and `components/` | no **banned family** appears |
| `scripts/validate-safety-contract.mjs` | **only `docs/safety/*.md` + a JSON fixture. No source file, ever** | the ledger is internally consistent |
| `copy-pins` · `landing-wiring-pins` · `promise-registry` | named strings, rendered output | specific pins hold |

**Nothing connects the ledger to the source in either direction.** A new landing sentence is opted
*into* the banned-word scan automatically and *out of* the ledger entirely, and nothing goes red.
That is how §12.1's first row survived four phases.

**Rail 16, which 10B writes:** *every user-facing sentence must be fileable under a claim class in
`claims-boundary.md`; a sentence that is neither approved nor banned is not therefore permitted.*

### 12.4 Corrections this phase makes to the tournament record

1. **The winner's page metrics were 20% low and its desert map 35% low.** §1.1.
2. **C5's reachability rule is not satisfied by the winner.** §11. Every phase from 7 onward stated
   or implied it was.
3. **Block 4's three cards do not each carry the disclaimer.** My own first measurement assumed they
   did and inflated block 4 by 645px. The copy deck states it once, in the note.
4. **The H1's letter-spacing needed retuning with its clamp.** Carried through unchanged at `-0.03em`
   from a ceiling 24% larger. §2.3.
5. **The handoff's prescribed desert remedy is already applied in the spec and is not the lever.** §11.2.
6. **C4's `--text-soft` graft was scoped as a taste rule and is actually an accessibility one.** §5.
   On the winner's single `--page-bg` plane the token measures **4.40:1 and fails WCAG AA**. The
   graft's per-block scope (1/2/3/5) and its block-4 exemption both become incoherent once the page
   has one plane; the ban is page-wide. `DESIGN.md:32`'s *"AA at 16px on white"* is true on white and
   misleading everywhere the product actually renders.

---

## 13. Handoff

### To 10B (`DESIGN.md` rewrite) — ⚖️ items this phase would not decide alone

1. **⚖️ The reachability budget.** §11.5. Restate to a derived figure with the derivation shown, or
   hold the rule and cut copy. **Record it as a rule change.** Do not let it read as a measurement.
2. **⚖️ The motion-curve split.** The landing press is 120ms `cubic-bezier(0.23, 1, 0.32, 1)`; the
   sanctioned app layer is 150ms `cubic-bezier(0.22, 0.61, 0.36, 1)`. Adopt one system-wide or
   document the split. §6.2.
3. **⚖️ Block 5's CTA position**, if option 1 is taken: the pixel win is 661px, the cost is C6's
   cancel-paragraph adjacency to the price. §11.5.
4. **Write rail 16.** §12.3.
5. **Write the corrected shape rule** (§3) and **reconcile the radius scale with `DemoCheckCard`** in
   one direction or the other. ⛔ Do not restate a nested-card ban — there is none.
6. **Rewrite rail 7:** its purpose is discharged structurally now, not by deletion.
7. **Fix the documented-but-false §Type claim.** `DESIGN.md:78-82` says base `16px/1.5` is "now
   actually in force." Verified: `body` is out of the `font: inherit` reset (`globals.css:83-87`), so
   this one **is** now true. The claim to re-check is §Marketing landing's "landing body 16.5–17px,
   ledes 18.5px" — the winner replaces it with one body value.
8. **Add to the banned list:** *a ledger row that records a section's intent is not a pin.*
9. **Correct the `--text-soft` token annotation.** §5. `DESIGN.md:32` reads *"hints ONLY (AA at 16px
   on white; never health info)"*. It is **4.40:1 on `--page-bg`** and **4.15:1 on `--accent-tint`** —
   below AA on both. State the ratio per plane, or restrict the token to `--surface` in the
   annotation itself. ⚠️ **Check the app surfaces too:** `globals.css:2673` and `:3148` set it as a
   text colour outside the landing layer, and this phase did not audit which plane those sit on.

### To 10C (implementation plan) — requires a green `npm test` baseline first

- **The exact breakage set, located and verified against a green baseline** (2,184 passed / 0 failed
  / 2 skipped, 186 files, 2026-08-05). **Tier B has a fifth string no phase listed.**

  | # | Assertion | Site | Fate |
  |---|---|---|---|
  | 1 | `Two ways in.` / `Three ways in.` | `landing-wiring-pins.test.ts:134,135,141,142` | block deleted → **fails** |
  | 2 | `Dictate it or type it.` | `:136` | block deleted → **fails** |
  | **3** | **`Snap a photo, dictate it, or type it.`** | **`:143`** | **block deleted → fails. NOT on any Tier B list.** |
  | 4 | `{TASTER_LIMIT} free checks on day one` | `copy-pins.test.ts:84` | no pricing lede → **fails** |
  | 5 | `A 90-day journey, recapped weekly` + `not.toContain("A weekly recap in sentences")` | `landing-wiring-pins.test.ts:158,159` | **flag-ON test fails both** |
  | 6 | `Revora at a glance` heading + `ul.landing-glance` role | `tests/smoke/landing-a11y.spec.ts:69-76` | glance strip deleted → **fails, in the e2e suite** |

  **Four broken `it` blocks in `npm test`** (both `photo-flag branches` tests, the `journey-flag`
  flag-ON test, and `copy-pins`' import test), **plus one in `npm run e2e`.**
  ✅ **The `journey-flag` flag-OFF test PASSES unchanged** — the winner renders
  `A weekly recap in sentences`, omits the 90-day string, and keeps both counted phrases at exactly 1.
  ✅ `copy-pins.test.ts:83, 85, 88` all pass on the amended deck, and **Phase 9's fix 7 is verified
  sufficient**: the deck's legacy tile and legacy FAQ match `:105` and `:111` character-for-character.
- **Journey-branch coverage must be MOVED, not deleted** — deleting the copy *and* its test
  discharges the flag's only coverage by deletion (banned-list item 6). The test builds the flag-on
  state via `renderLanding({ NEXT_PUBLIC_LEARNING_JOURNEY: "1" })`, so the branch must survive
  somewhere renderable.
- **Two new ledger rows, not four:** the hero card caption, and the block-3 caption + dare link. (The
  two sources paragraphs need their own row.) **Every card *body* on the winner is already-approved
  `result-*` copy — the winner invents no new card body copy at all.**
- **Extract `<ExampleResultCard>`.** §9 block 1. Load-bearing, not a nicety: it is the only thing
  that stops the hero's label from silently becoming a false claim the day a live capture is
  authorised.
- **Guard test: no `.landing*` selector may declare `border-radius` or `border` on `.result-card` or
  `.surface-card`.** The page's central claim has no test. §3.1.
- **Pin the `faqs` shared-consumer invariant.** Cheap, high value, currently a code comment.
- **Adopt C5's two tests:** 44/48px targets, `prefers-reduced-motion`.
- **Instrument the block-3 dare link separately** as the page's most important non-primary CTA. If it
  converts, the fixture objection is answered by the product rather than by more copy. §9 block 3.
- **Separate product-level work item:** un-nest or re-radius `DemoCheckCard` (three routes).
- ⛔ **Do not move the `.landing .result-disclaimer` block above `globals.css:778`.** §10.5.
- **Governance item, independent of ship/no-ship:** route `app/page.tsx:523-524` to counsel.
- Delete `.landing-proof-band`; rename `.landing-phone` → `.landing-hero-proof`.

### Reproducing the measurement

The harness is in the session scratchpad, not the repo. To rebuild it: launch one `next dev`
(`pkill -9 -f "next-server"` first — concurrent servers over one `.next` cause `ChunkLoadError`
reload loops), load `/` at 375×667 in Chromium from the repo's own `node_modules/playwright`, await
`document.fonts.ready`, lift `[data-testid="demo-check-card"]` out of the live DOM, replace
`main.landing`'s contents with the winner markup, inject the §§2–9 CSS, and read
`getBoundingClientRect()`. **Validate against the incumbent first**; it should return ~13,3xx px,
7 CTAs, ~5,2xx px longest desert.

✅ **`npm test` is GREEN at `8c4c0e9`, 2026-08-05: 2,184 passed / 0 failed / 2 skipped, 186 files
(1 skipped), 164s.** The six-session debt is cleared and the breakage table above is measured against
it. **The suite takes ~2.7 minutes, not the ~26 the handoffs have claimed for five sessions** — the
old figure is stale and was deterring the run that turned out to cost three minutes.

⚠️ **`npm test` is not the whole gate.** It is `vitest run` over `tests/**/*.test.ts` only. The
Playwright smoke suite (`npm run e2e`, `testDir: ./tests/smoke`) is separate and holds breakage #6.
**10C must run both.**

---

## 14. Status

**Section 15 complete.** Sections 16 (10B, `DESIGN.md`), 17 (10C, implementation plan) and 18
(decision memo) remain.

No code changed. No commits. No `DESIGN.md` edits. `npm test` not run.
