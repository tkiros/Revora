> ## ⛔ SUPERSEDED — 2026-08-05
> **Read `docs/plans/landing-implementation-plan.md` instead.** W1–W4 have shipped on the
> `landing/w1-w4` worktree branch (HEAD `5c30246`), which invalidates every line number below
> (`app/page.tsx` 929 → 927, `app/globals.css` 3,473 → 3,482), and the unified plan re-verified
> this file's claims against source and all three gates — including `npm run e2e` and
> `npm run contract`, which this file's §12 records as not run. Known corrections: the shared
> font-family group has 15 selectors, not 14 (§3.3); `landing-paywall-copy`, `forbidden-claims`
> and `disclaimer-presence` are confirmed non-breaking. Kept for the record only.

# Section 17 — Implementation plan · `W — One Card Back`

**Phase 10C.** How to ship the tournament winner to `app/page.tsx` and the `.landing-*` layer of
`app/globals.css`, in ordered, independently revertible work items.
**Date:** 2026-08-05 · **Branch:** `fix/landing-followups` (HEAD `8c4c0e9`) · **Code changed: none.**

**Inputs, in precedence order:** `DESIGN.md` (rewritten by 10B — it now carries the three rulings and
is the authority on rules), `docs/plans/landing-tournament-winner-spec.md` (10A, the build spec and
the browser measurement), `docs/plans/landing-tournament-phase-9.md` (the red-team), the consolidated
Phases 0–9 handoff. **Read against live source, not against the plan documents.**

> **Everything below with a line number was read from source on 2026-08-05.** Where this document
> disagrees with an earlier phase, the disagreement is named. Four such disagreements are in §3.3,
> §5.1, §6.2 and §8.

---

## 1. The baseline, and the two gates

✅ **`npm test` is GREEN at `8c4c0e9` with 10B's `DESIGN.md` rewrite in the working tree.**
Re-run 2026-08-05: **2,184 passed / 0 failed / 2 skipped · 186 files (1 skipped) · 155.34s.**
Identical to the handoff's recorded baseline, so **the `DESIGN.md` rewrite broke nothing** — confirmed
directly: no test or script in the repo reads `DESIGN.md` (`grep -rn "DESIGN\.md" tests/ scripts/`
returns nothing).

```bash
pkill -9 -f "[n]ext-server"   # the [n] matters: `pkill -f "next-server"` matches its own
                              # command line and kills the shell running it. That is not a
                              # hypothetical — it silently killed this phase's first test run.
npm test                      # vitest, tests/**/*.test.ts only. ~2.6 minutes.
npm run e2e                   # Playwright, testDir ./tests/smoke. SEPARATE GATE.
npm run contract              # validate-safety-contract, 9 validators. Gates every ledger edit.
```

⚠️ **Three gates, not one.** `vitest.config.ts` includes only `tests/**/*.test.ts`;
`tests/smoke/*.spec.ts` is Playwright. **A green `npm test` does not clear the landing** — work item
**W9** breaks an assertion that lives only in `npm run e2e`. Ledger edits are gated by neither and
need `npm run contract`.

Only ever run **one** `next dev`. Concurrent servers over one `.next` cause `ChunkLoadError` reload
loops: `pkill -9 -f "[n]ext-server"; rm -rf .next; npm run dev`.

---

## 2. Section-by-section diff against `app/page.tsx` (929 lines)

| Lines | Block | Fate |
|---|---|---|
| 1–21 | imports | **AMEND** — four become unused, §2.1 |
| 31–65 | `metadata` | keep |
| 67–84 | `LandingPrimaryCta` | **keep, untouched.** The one CTA assembly (`DESIGN.md` §14) |
| 86–100 | flags, prices | **AMEND** — `insightsEnabled`, `journeyEnabled` become dead |
| 104–131 | `faqs` array | **AMEND** — 3 answers reworded, 2 em dashes stripped (W12) |
| 139–177 | JSON-LD graph + `<script>` | **keep.** Consumes `faqs`; see §6.1 |
| 178–185 | skip link | **keep, outside `<main>`** |
| 188 | `<main className={`landing ${reading.className}`}>` | ⛔ **keep exactly.** Tier A pin 6 |
| 190 | `<div className="landing-sheet">` | **DELETE the wrapper**, keep `.landing-frame` (one plane) |
| 192–211 | nav | keep. Ghost CTA stays ghost |
| 215–269 | **hero** | rebuilt, §2.2 |
| 219–221 | `.landing-eyebrow` | ⛔ **DELETE.** Its seven words become the H1 |
| 222 | H1 `Stop guessing at dinner.` | **REPLACE** → `A meal checker built only for prediabetes.` |
| 223–235 | `.landing-sub` (44 words, photo-gated) | **REPLACE** → the 33-word sub |
| 236–238 | CTA + caption | keep verbatim (satisfies `copy-pins.test.ts:83`) |
| 243–249 | trust strip | ⛔ **keep verbatim.** Ledger `home-trust-strip` |
| 264–268 | `.landing-phone` → `<DemoCheckCard />` | **REPLACE** → `.landing-hero-proof` + `<ExampleResultCard variant="clear" withFineprint />` + caption. **`DemoCheckCard` moves to block 3** |
| 273–312 | at-a-glance strip | ⛔ **DELETE.** Breaks the e2e suite, §5 row 6 |
| 314–366 | the problem | → **block 2.** Band wrapper deleted, H2 + lede replaced, **pains list 328–350 kept verbatim** |
| 351–356 | `.landing-pains-note` | **REPLACE** → `.landing-scope-note`, dropping the three-negation clause |
| 360–363 | CTA | keep |
| — | — | ➕ **INSERT block 3, the pause** — all-new markup (W11) |
| 368–418 | how it works | ⛔ **DELETE.** Breaks 3 assertions, §5 rows 1–3 |
| 420–502 | three answers | → **block 4.** Sheet wrapper deleted, H2 + lede replaced |
| 437–494 | three `.landing-verdict` articles | **REPLACE** → three `<ExampleResultCard>` (W5) |
| 495–498 | `.landing-verdict-note` | keep copy; recolour `--text-soft` → `--text-muted` |
| 499 | CTA | keep |
| — | — | ➕ **INSERT the sources prose below the CTA** (from 681–692) |
| 504–619 | everything you get | ⛔ **DELETE.** Removes the landing's only journey-flag use, §5 row 5 |
| 621–665 | what changes | ⛔ **DELETE** |
| 667–732 | why trust it | ⛔ **DELETE the section.** 681–692 survives as block 4's sources prose |
| 678–694 | `.landing-proof-band` | ⛔ **DELETE.** Rail 7 discharged structurally |
| 734–809 | pricing | → **block 5.** H2 replaced; **lede 738–754 DELETED**, §5 row 4 |
| 756–807 | price tiles | **AMEND** both branches; `{FREE_DAILY_CHECKS}` stays interpolated |
| — | — | ➕ **INSERT** cancel paragraph · four claims · Pantry prose |
| 812–848 | Pantry section | ⛔ **DELETE.** Becomes three sentences in block 5 |
| 850–865 | FAQ | **MOVE** above the final CTA (free, §6.1) |
| 867–881 | final CTA | → **block 6.** Band wrapper, **H2 (871) and sub (872–875) DELETED** |
| 883–925 | footer | **keep.** Four columns, `Add to home screen — works today`, `BOUNDARY_DISCLAIMER` in full |

### 2.1 Imports that go dead, and the one that matters

| Import | Last use | Fate |
|---|---|---|
| `longitudinalInsightsEnabled` | `:412`, how-it-works step 3 | **remove** |
| `learningJourneyUiEnabled` | `:576`, the feature grid | **remove — and this is why §5 row 5 needs care** |
| `IconCheck` · `IconAlert` · `IconPause` · `IconHeart` · `IconArrowRight` | the verdict articles and pantry buckets | **remove from `page.tsx`** once W5 moves them into `<ExampleResultCard>` |
| `DemoCheckCard` | `:266` | **keep** — moves to block 3, pinned by `promise-registry.test.ts:183` |

⚠️ **The causal chain that decides the work order.** Deleting the feature grid removes the landing's
only call to `learningJourneyUiEnabled()`, which removes the flag's **only behavioural test**
(§5 row 5). That is banned-list item 6, *a rail passed by deletion is a rail with no subject* —
so **W6 must land before W9.**

### 2.2 The hero card swap is a component change, not a copy change

The incumbent renders `<DemoCheckCard />` **in the hero** (`:266`) and nothing in block 4's card row.
The winner inverts this: `<ExampleResultCard variant="clear">` in the hero, `<DemoCheckCard />` in
block 3. `promise-registry.test.ts:181-197` asserts `app/page.tsx` renders `<DemoCheckCard/>` and does
**not** hand-type the three flow strings. **Moving it satisfies both assertions; deleting it fails
them.** Verified against the test source.

---

## 3. The CSS delta — `app/globals.css` (3,473 lines; landing layer 1534–2570)

### 3.1 Delete

| Selector(s) | Line | Because |
|---|---|---|
| `.landing-sheet` · `.landing-band` · the 4-selector hairline seam | 1569, 1573, 1577–1583 | one plane |
| `.landing-eyebrow` own rule | 1775 | zero eyebrows |
| `.landing-phone` / `-inner` | 1861 | renamed, §3.2 |
| `.landing-proof-band` + `-stat` + `p` + `-note` | 1872–1920 | band deleted; content survives as prose |
| `.landing-section--tight` | 1930 | no short supporting sections remain |
| `.landing-grid-3` · `.landing-step` · `-num` · `h3`/`p` | 1956–1998 | how-it-works retired |
| `.landing-proof` · `.landing-proof-item` + children | 2000–2034 | trust cards retired |
| `.landing-pains-note` | 2193 | superseded by `.landing-scope-note` |
| `.landing-verdict*` (7 selectors) | 2218–2273 | replaced by the live `.result-card` |
| `.landing-features` · `.landing-feature` + children | 2302–2324 | feature grid retired |
| `.landing-pantry` · `-buckets` + risk variants | 2327–2385 | Pantry becomes prose |
| `.landing-glance` · `-fact` · `-label` | 2462–2507 | glance strip retired |
| `.landing-outcomes` · `.landing-outcome*` | 2509–2570 | before/after grid retired |

### 3.2 Rename

`.landing-phone` / `.landing-phone-inner` → **`.landing-hero-proof`**, one element. The bezel was
removed 2026-07-27; the class name has been lying since. No test reads it (verified).

### 3.3 ⚠️ The delete list every prior phase missed

**`globals.css:1551–1566` is a shared `font-family` group listing fourteen selectors**, and **seven of
them belong to blocks the winner deletes**:

```
.landing-eyebrow      .landing-step h3      .landing-step-num     .landing-feature h3
.landing-proof-item h3    .landing-glance-fact    .landing-verdict-meal
```

Deleting each block's *own* rule leaves these seven as dead selectors inside a live declaration. They
break nothing, and that is exactly the problem: this is the same class of rot that left
`.landing-phone` naming a bezel that no longer existed. **Prune all seven from the group in W9.** The
group's own comment (1539–1550) is the one-`font-size`-per-selector incident record and **stays**.

### 3.4 Change (edit the selector's existing base rule — never append)

`.landing` (+`font-size: 17px; line-height: 1.65`) · `.landing-h1` (clamp → `clamp(1.9rem, 5.6vw,
2.9rem)`, `-0.03em` → `-0.02em`, `text-wrap: balance`) · `.landing-h2` (+balance) · `.landing-sub`
(→`17px`, `1.65`, `62ch`, +pretty, drop dead `opacity:1`) · `.landing-section`
(→`clamp(72px,10vw,128px)`, +`border-top` and `:first-of-type` reset) · `.landing-section-head`
(`10px`→`12px`) · `.landing-section-lede` (+pretty) · `.landing-cta` (3-property shorthand →
`transition-property/duration/timing-function`, `--dur-press`, `--ease`) · `.landing-cta:active`
(+`scale(0.98)`) · `.landing-pains` (`14px`→`28px`, `68ch`→`62ch`, li→`17px`, `li strong` +`display:
block`) · `.landing-trust-strip li` (→`17px`/`1.65`) · `.landing-cta-hint` (→`17px`, +`1.65`) ·
`.landing-faq details > p` (`1.62`→`1.65`) · `.landing-final` (→section clamp, +`border-top`) ·
`.landing-verdict-note` (`68ch`→`62ch`, `1.6`→`1.65`, colour → `--text-muted`).

⛔ **Appending a second declaration fails Tier A pin 7** (`landing-wiring-pins.test.ts:98`, *"no
landing selector declares font-size twice"*).

### 3.5 Add

`.landing-hero-proof` · `.landing-card-caption` · `.landing-scope-note` · `.landing-dare` ·
`.landing-sources` · `.landing-cancel` · `.landing-claims` · the card focus-offset rule · the
reduced-motion additions · `.landing-pause-step` (W11).

### 3.6 The source-order comment — and what 10A did not know was already there

`.landing .result-disclaimer` (16px) is at **`:2281`**, and `.result-fineprint .result-disclaimer`
(13px) is at **`:778`**. Identical specificity (0,2,0); the landing wins **only by file position.**
Confirmed.

⚠️ **A comment already exists at `:2275–2280` and it does not say this.** It explains *why* 16px
(`DESIGN.md` §Type, the landing's larger scale) and says nothing about the ordering. It also names the
instances as *"the demo result card and the footer"*, which **goes stale** the moment the hero card
becomes the first instance. **W3 amends that comment; it does not replace it.**

```css
/*  … keep the existing paragraph …
    ⚠️ SOURCE-ORDER DEPENDENCY. This rule and `.result-fineprint .result-disclaimer` (L778, 13px)
    have IDENTICAL specificity (0,2,0). This one wins only because it is LATER IN THIS FILE.
    Moving either block, or reordering the file, silently drops the landing's compliance line to
    13px and breaks rail 10. The duplicate-font-size pin cannot catch it: it counts declarations
    per selector and sees exactly one on each. DO NOT MOVE THIS BLOCK ABOVE L778. */
```

⛔ **No work item may move this block above `:778`.**

---

## 4. What must not change, and the test that catches it

| Invariant | Caught by |
|---|---|
| `reading.className` on the landing root, never `<body>` | `landing-wiring-pins.test.ts` |
| No `.landing*` selector declares `font-size` twice | `landing-wiring-pins.test.ts:98` |
| `.landing .result-title` capped at `22px / 700` | `landing-wiring-pins.test.ts:78` |
| `<DemoCheckCard/>` rendered; the 3 flow strings never retyped | `promise-registry.test.ts:181-197` |
| `TASTER_LIMIT` interpolated in 4 named phrases | `copy-pins.test.ts:80-88` |
| `FREE_DAILY_CHECKS` interpolated in the legacy tile **and** the legacy FAQ | `copy-pins.test.ts:97-113` |
| `RISK_LABELS` interpolated; the raw class words never render | `copy-pins.test.ts` |
| No literal `$9.99\|$12.99\|$19.99` in source | `copy-pins.test.ts` |
| Both `paywallMode()` branches present | `copy-pins.test.ts` |
| Banned source phrases stay banned | `copy-pins.test.ts` |
| No banned claim family in any `.tsx` | `claims-boundary-copy.test.ts` |
| Footer apps column renders no inert promise | `landing-wiring-pins.test.ts:164-181` |
| **A Clear card never carries an adjustment or swap** | `assertNoUnsafeSafeFields` **throws** |
| `.landing .result-disclaimer` stays below `globals.css:778` | ⛔ **nothing. §3.6** |
| `.landing*` never overrides `.result-card`'s radius or border | ⛔ **nothing. W4 adds it** |
| The `faqs` array has one declaration and two consumers | ⛔ **nothing. W4 adds it** |
| 44px targets · reduced motion · single-CTA assembly | ⛔ **nothing. W4 adds them** |

---

## 5. The breakage set — six assertions, verified against the green baseline

| # | Assertion | Site | Cause | Fix |
|---|---|---|---|---|
| 1 | `toContain("Two ways in.")` / `not.toContain("Three ways in.")` | `landing-wiring-pins.test.ts:134-135` | block deleted | delete the `photo-flag branches` describe (both `it`s) |
| 2 | `toContain("Dictate it or type it.")` | `:136` | block deleted | same describe |
| 3 | **`toContain("Snap a photo, dictate it, or type it.")`** | **`:143`** | block deleted | same describe. **Was on no prior Tier B list** |
| 4 | `toContain("{TASTER_LIMIT} free checks on day one")` | `copy-pins.test.ts:84` | pricing lede deleted | drop that one `expect`; the other three TASTER_LIMIT pins survive unchanged |
| 5 | `toContain("A 90-day journey, recapped weekly")` + `not.toContain("A weekly recap in sentences")` | `landing-wiring-pins.test.ts:158-159` | feature grid deleted | ⚠️ **MOVE, do not delete. §5.1** |
| 6 | `Revora at a glance` heading + `ul.landing-glance` role | `tests/smoke/landing-a11y.spec.ts:69-76` | glance strip deleted | ⚠️ **RETARGET, do not delete. §5.2. In `npm run e2e` only** |

✅ **Verified to still pass on the amended deck**, so no fix is owed: `copy-pins.test.ts:83, 85, 88`
(the three surviving `TASTER_LIMIT` phrases), `:105` and `:111` (both `FREE_DAILY_CHECKS` sites,
character-for-character), and **the `journey-flag` flag-OFF test at `:148-154`** — the winner renders
`A weekly recap in sentences`, omits the 90-day string, and keeps `A record you can actually show
someone` and `It asks before it guesses` at exactly 1 each.

### 5.1 ⚠️ Row 5: the flag's coverage, and where it actually has to go

The handoff says move the branch assertion "to whichever surface still renders it." **Traced to
source, that surface exists and is better than the landing was.** `learningJourneyUiEnabled()` has
**three** consumers:

```
app/page.tsx:94                  ← deleted by W9
app/(app)/journey/page.tsx:51    ← survives, ZERO flag-branch coverage
components/journey-card.tsx:171  ← survives, ZERO flag-branch coverage
```

And it has exactly **one** behavioural test: `landing-wiring-pins.test.ts`. (`next-config-twin-guard.
test.ts` matches the env name but only asserts the variable is declared in both Next configs — it
never renders a branch.) So today the flag's only rendered-output coverage is on the surface we are
deleting, while its two real consumers are untested.

> **W6: add flag-on/flag-off branch tests against `components/journey-card.tsx`.** They pass on the
> current tree, so W6 lands green and standalone. **Net coverage after W9 is higher than before**, on
> the consumer that actually ships the feature. This is the honest reading of banned-list item 6.

### 5.2 ⚠️ Row 6: retarget the e2e assertion, do not delete it

`landing landmarks and list semantics stay intact` exists to prove one thing: **`list-style: none`
strips list semantics in Safari/VoiceOver, so landing lists carry an explicit `role="list"`.** The
glance strip was merely its example. The winner ships two lists with `role="list"` —
`.landing-trust-strip` (in the hero, above the fold) and `.landing-pains` (block 2).

> Retarget to `ul.landing-trust-strip`. Drop the `Revora at a glance` heading assertion, whose subject
> is genuinely gone. The nav landmark assertions are untouched and keep passing.

---

## 6. Two invariants that are free today and will not stay free

### 6.1 The FAQ move costs nothing, and three contenders were wrong about why

`app/page.tsx:104` declares `faqs` **once**; both consumers map that same array — `mainEntity` at
`:161` and the visible `<details>` at `:857`. **A visible/JSON-LD mismatch is impossible by
construction, today, at any position in the document.** Three contenders flagged a defect they would
have introduced by hand-authoring one of the two.

The invariant is currently guaranteed by a code comment (`:101-103`). **W4 pins it:** assert
`app/page.tsx` contains exactly one `faqs` declaration and that both `mainEntity` and the `<details>`
map originate from it.

### 6.2 ⚠️ The `--text-soft` audit is clean, and it is clean by luck

`DESIGN.md` §3.1 now restricts the token to `--surface` and `--surface-muted`. Audited: all four uses
in `globals.css` sit on a passing plane (`:198`, `:2673`, `:3148` as text; `:2546` as a decorative
`background` inside a block W9 deletes). **The landing escapes the bug only because its one text use
was never text.** Nothing enforces the restriction. Not scheduled here — flagged so the next surface
that reaches for the token on `--page-bg` is caught by review rather than by a user.

---

## 7. Ledger work — and why "two new rows" was an undercount

`docs/safety/copy-ledger.md` has **77 rows, of which exactly four are `landing-*`**:
`landing-hero-moment` · `landing-audience-pains` · `landing-three-answers` · `landing-what-you-get`,
plus `home-trust-strip`, `product-home-hero`, and the `result-*` / `demo-check-*` families the cards
render from.

| Row | Action | Why |
|---|---|---|
| `landing-hero-moment` | **AMEND** | Its Copy column describes a hero (*"Dinner is on the table…"*) that `git log -S` shows **never shipped**. It is fiction today and the winner replaces the real hero anyway. Amending it also closes Phase 9's finding B |
| `landing-audience-pains` | **AMEND** | Its Copy contains `Not a general nutrition app, not a calorie counter, not a tracker for everybody.` — the exact sentence fix 3 deletes. The four pain items are kept verbatim and need no change |
| `landing-three-answers` | **AMEND** | Covers the three meal names and `Illustrated examples.` (both survive). The lede gains fix 4's sentence |
| `landing-what-you-get` | **AMEND or RETIRE + new row** | The feature grid is deleted; four of its claims survive rewritten into block 5 |
| — | ➕ **NEW** | hero card caption (`This is the whole screen…`) |
| — | ➕ **NEW** | block 3: H2 + lede + caption + the dare link |
| — | ➕ **NEW** | block 4's two sources paragraphs |
| — | ➕ **NEW** | block 5's cancel paragraph (`…no retention screen…`) |

⚠️ **The spec's "two new ledger rows, not four" undercounts. It is four amendments and four new rows.**
The two it missed are the cancel paragraph — new landing copy whose only existing coverage
(`cancel-page`, `account-cancel-button`) is for **app** surfaces — and block 5's claims list.

⚠️ **A pre-existing rail 16 gap the winner inherits: the FAQ is entirely unledgered.** Grepping the
ledger for `Is Revora medical advice`, `Fair questions` and `How do I cancel` returns **zero**. Five
answers ship today under no row. That is not caused by this rebuild and should not block it, but rail
16 is now written and this is its first real subject. **Route it with the governance items (§10).**

✅ **Every card *body* on the winner is already-approved `result-*` copy.** The winner invents no new
card body copy at all. Confirmed against `result-safe-example` (`copy-ledger.md:26`), which the hero
card and block-4 card 1 both render verbatim.

---

## 8. The work items

Smallest-shippable-first. **Each is independently revertible and leaves all three gates green.** The
ordering principle: **guards and coverage first, deletions late** — a test added before the change it
protects lands green on the current tree, and is then doing its job during the risky commits.

| # | Item | Files | Gate | Risk |
|---|---|---|---|---|
| **W1** | **Motion tokens.** `--ease` → `cubic-bezier(0.23, 1, 0.32, 1)`; add `--dur-press: 120ms` | `globals.css:29-31` | `npm test` | app-wide feel change, one line, instantly revertible. `DESIGN.md` §6 |
| **W2** | **Rename** `.landing-phone`/`-inner` → `.landing-hero-proof` | `globals.css`, `page.tsx:264-268` | `npm test` | none. No test reads it |
| **W3** | **Source-order comment** amended onto `.landing .result-disclaimer` | `globals.css:2275-2283` | none | none. Comment only. **Must precede any CSS reorder** |
| **W4** | **Five guard tests, all passing on today's tree:** card-recipe override · `faqs` single-declaration · 44/48px targets · `prefers-reduced-motion` · single-CTA assembly | `tests/unit/revora/`, `tests/smoke/` | `npm test` + `npm run e2e` | none. Adds coverage, changes nothing |
| **W5** | **Extract `<ExampleResultCard>`**, refactor block 4's three articles onto it with **identical rendered markup**. Label from `demoExampleEyebrow(null)` | new component, `page.tsx:437-494` | `npm test` | markup-equivalence refactor; screenshot-diff it |
| **W6** | **Move journey-flag coverage** to `components/journey-card.tsx` | `tests/unit/` | `npm test` | none. §5.1. ⛔ **Must precede W9** |
| **W7** | **Ledger: 4 amendments + 4 new rows** | `docs/safety/copy-ledger.md` | **`npm run contract`** | docs only. ⛔ **Must precede W10** |
| **W8** | **One-plane visual pass.** Delete `.landing-sheet`/`.landing-band`/hairline seam and unwrap the three band divs; section padding + `border-top`; type scale; `62ch`; focus offsets; `--text-soft` removal | `globals.css`, `page.tsx` wrappers | `npm test` + `npm run e2e` | **largest CSS diff, lowest copy risk.** No block deleted, no string changed |
| **W9** | **Delete the six retired blocks** + the seven dead selectors in the shared font group (§3.3) + dead imports, **with breakage fixes 1, 2, 3, 5, 6 in the same commit** | `page.tsx`, `globals.css`, 2 test files | `npm test` + **`npm run e2e`** | the breaking commit. Everything above exists to make it safe |
| **W10** | **The new copy deck** — H1, sub, captions, block 2 scope note, block 4 lede, block 5 H2/tiles/cancel/claims/Pantry prose, **and the pricing-lede deletion with breakage fix 4** | `page.tsx`, 1 test file | `npm test` + `npm run contract` | needs W7's rows |
| **W11** | **Block 3, the pause.** Move `<DemoCheckCard/>`, add the caption, the dare link, and the one `IntersectionObserver` animation | `page.tsx`, `globals.css`, small client component | `npm test` + `npm run e2e` | the only new JS. §8.1 |
| **W12** | **FAQ move above the final CTA**, strip 2 em dashes in both branches, delete block 6's H2 and sub | `page.tsx:104-131, 850-881` | `npm test` | low |
| **W13** | **Measure and report** the desert map at 375px against `DESIGN.md` §11.1's three-screenful budget, including the CTA-position variant | none (a measurement) | — | §8.2 |

⚠️ **W9 is the only commit that can leave the tree red if run alone.** Its test edits are not optional
follow-ups; they are part of the same commit or the revert is not clean.

### 8.1 W11's non-negotiables

The card ships rendered at `opacity: 1` and an `IntersectionObserver` adds a class that **replays**
the entrance. A headless render, a hidden tab or a JS failure ships the complete card — this card is
the page's proof, and a visibility-gated reveal is how proof sections ship blank to a crawler.
`transform` and `opacity` only · `{ once: true }`, `amount: 0.4` (the card measures ~784px at 375px) ·
`prefers-reduced-motion: reduce` gated in **both** CSS and JS, because the global reduce block only
shortens what already ran. ⛔ `You type: oatmeal` must never become an `<input>`: static text,
non-focusable, no caret.

### 8.2 W13 is a gate, not a report

`DESIGN.md` §11.1: *"every marketing layout change reports its measured page length, exit count and
desert map at 375px, in the browser, with the real fonts loaded. An unmeasured desert claim does not
count."* W13 is that clause's first exercise.

It must measure **the CTA-after-cancel-paragraph variant**, which `DESIGN.md` §11.1 rules for on copy
grounds and which **no phase has measured**. If it clears 2,001px, ship it. If it does not, the
measured arrangement (CTA immediately after the tiles) is the fallback and the cancel paragraph's
adjacency to the price is the recorded cost. **Do not estimate this.** Tournament estimates ran 20%
low on page length and 35% low on the worst desert, and not one of five estimated gaps landed within
200px of its measurement.

**Harness:** one `next dev`; load `/` at 375×667 in Chromium from the repo's own
`node_modules/playwright`; `await document.fonts.ready`; read `getBoundingClientRect()`. **Validate
against the incumbent first** — it returns ~13,3xx px, 7 CTAs, ~5,2xx px longest desert.

---

## 9. Product-level items — separate from the landing, separate PRs

1. **Un-card `DemoCheckCard`'s wrapper** (`DESIGN.md` §5). `components/demo-check-card.tsx:38` renders
   `<section className="surface-card hero-card">` around two `.result-card`s — 24px around 22px, where
   the documented nested value is 14px. The ruling is that **the wrapper is not a card**: it is a
   labeled sequence (`aria-label="Example check"`), so it drops `surface-card` and becomes an
   unbordered labeled region. **Three routes import it** — `app/page.tsx`, `app/(app)/check/page.tsx:68`,
   `app/(app)/demo/page.tsx:88` — so all three need a visual check. ⛔ Do **not** re-radius the inner
   `.result-card`s: that would make them render differently on the landing than on `/check` and break
   the page's central claim.
2. **Add `--dur-press` consumers in the app layer** once W1 lands, so press feedback is one behaviour
   system-wide rather than a landing exception.
3. **Instrument the block-3 dare link separately** as the page's most important non-primary CTA. It is
   the only real answer to the strongest criticism the winner will get — *"three example cards is not a
   demo; $12.99/mo after ten checks is a lot of trust to extend to a page where every card is labelled
   'illustrated example'."* Four of five cards are fixtures; this link is the one place the reader can
   make the product do the thing. If it converts, the fixture objection is answered by the product
   instead of by more copy.

---

## 10. Governance items — independent of ship or no-ship

1. ⚠️ **Route `app/page.tsx:523-524` to counsel.** It ships
   `Most apps would just pick one and sound confident.` — a comparative-confidence claim that is
   **unledgered** (`grep -c "Most apps" docs/safety/copy-ledger.md` → 0) and **outside the schema**:
   `claims-boundary.md` defines nine claim classes and every one is about Revora, so no class exists
   under which a statement about a third party can be filed. **W9 deletes the block it lives in, so
   shipping the winner fixes it incidentally — and not shipping the winner leaves it in place.** Do not
   let a redesign silently discharge a governance item.
2. **Ledger the FAQ** (§7). Five answers ship today under no row. Rail 16's first real subject.
3. **Close the ledger/source gap, or accept it explicitly.** Nothing connects `copy-ledger.md` to the
   source in either direction (`DESIGN.md` §1.1). That is how item 1 survived four review phases: no
   test could have gone red. A row-id-to-source-file check is cheap and would have caught it.

---

## 11. Open for the owner

1. **W1 changes app-wide motion feel** on one token. `DESIGN.md` §6 rules for it and the migration is
   one line, but it is the only item here that touches surfaces outside the landing's scope. Ship it
   with the landing, or split it into its own PR?
2. **W13's outcome may cost the cancel paragraph its adjacency to the price** (§8.2). `DESIGN.md`
   §11.1 already ranks the copy above the pixels; this is the point where that ruling gets tested
   against a real number.
3. **`landing-what-you-get`: amend or retire?** (§7). Amending keeps one row's history; retiring and
   writing a fresh row makes the block-5 claims easier to audit. Either is defensible; the ledger's
   own convention has no precedent for a row whose section was deleted.

---

## 12. Status

**Section 17 complete.** Section 18 (the decision memo) remains.

No code changed. No commits. `npm test` **run and green** (2,184 / 0 / 2, 155s, with 10B's
`DESIGN.md` in tree). `npm run e2e` **not run** — W9's breakage in that suite is located by source
reading, not by execution, and the first person to run it should do so before W9 rather than after.
