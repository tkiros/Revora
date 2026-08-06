# Landing reachability measurement — 2026-08-05

**What this is:** the measurement `DESIGN.md` §11.1 requires of every marketing layout change —
*"measured page length, exit count and desert map at 375px, in the browser, with the real fonts
loaded. An unmeasured desert claim does not count."* This is W13 of
`docs/plans/landing-implementation-plan.md`, and it is the first time that clause has been exercised
on real code.

> ⚠️ **This file has three runs in it, and only the last one is the page.**
> **For the current numbers, jump to [Re-measured after the pricing section was deleted](#re-measured-after-the-pricing-section-was-deleted--2026-08-05).**
>
> | Run | Page length | Worst desert | Why it was re-measured |
> |---|---|---|---|
> | W13, below | 9,262px | 1,913px | the original harness-validation run |
> | 18px body | 9,556px | 1,877px | owner read the body type as too small |
> | **pricing deleted** | **7,811px** | **1,877px** | owner deleted the pricing section |
>
> The earlier runs are kept in full: W13 is the harness-validation record and the evidence behind the
> two rulings in §"The two rulings this measurement settles". ⚠️ **Ruling 1 of those two is now
> MOOT** — it arranged a CTA around the cancel paragraph, and both were deleted with the pricing
> section. It is annotated in place rather than removed, because the reasoning is what a future offer
> block would need. Ruling 2 (block 2's CTA above the scope note) still holds and is still load-bearing.

**Reproduce it:**

```bash
pkill -9 -f "[n]ext-server"   # the [n] matters
npm run dev &
node scripts/measure-landing.mjs          # human report
node scripts/measure-landing.mjs --json   # machine record
```

Exit code is 1 if any desert is over budget, so this can gate a branch.

## Method, stated so a later run is comparable

| | |
|---|---|
| Browser | Chromium from the repo's own `node_modules/playwright`, headless |
| Viewport | 375 × 667, one `next dev` on :3000 |
| Fonts | `await document.fonts.ready` before any reading — a fallback face measures wrong |
| Positions | `getBoundingClientRect()` + `scrollY`, document coordinates |
| Animation | the page is scrolled top to bottom once first, so block 3's `IntersectionObserver` entrance has played and no element is still offset by its `translateY(8px)` |
| **Exit** | an `<a href="/check">` inside `<main>`. Links to `/pantry` are counted separately — a different offer, not a way to run a check |
| **Desert** | one exit's **bottom** to the next exit's **top**. Head = document top → first exit; tail = last exit → document bottom |
| **Budget** | no desert over three screenfuls = **2,001px** (`DESIGN.md` §11.1) |

## Harness validation — the incumbent, re-measured

The plan requires validating the harness against the incumbent before trusting it on the winner,
because the incumbent's figures were **⚠️ inherited from one Phase-10A run and never reproduced.**
The incumbent landing (`app/page.tsx` + `app/globals.css` at `8c4c0e9`) was checked out into the same
tree, measured, and restored.

| | Inherited (10A) | Measured here | |
|---|---|---|---|
| Page length | 13,346px | **13,346px** | ✅ exact |
| Exits to `/check` | 7 | **7** | ✅ exact |
| Worst desert | ~5,2xx px (5,228 recorded) | **5,228px** | ✅ exact |

All three reproduce to the pixel. The harness measures what the previous one measured.

## Result — the winner, as shipped

| | Incumbent | Winner | Change |
|---|---|---|---|
| Page length | 13,346px | **9,262px** | **−4,084px (−31%)** |
| Screenfuls | 20.0 | **13.9** | −6.1 |
| Exits to `/check` | 7 | **8** | +1 (block 3's dare link) |
| Worst desert | 5,228px (7.8 screenfuls) | **1,913px (2.9 screenfuls)** | **−3,315px** |
| Over budget | 3 deserts | **0** | ✅ |

### Block map

| Range | Height | Block |
|---|---|---|
| 0 → 81 | 81px | nav |
| 81 → 1,304 | 1,223px | block 1, hero |
| 1,304 → 2,612 | 1,308px | block 2, the gap |
| 2,612 → 3,718 | 1,106px | block 3, the pause |
| 3,718 → 5,929 | 2,211px | block 4, three answers |
| 5,929 → 7,586 | 1,657px | block 5, the offer |
| 7,586 → 8,114 | 528px | Fair questions |
| 8,114 → 8,385 | 271px | block 6, close |
| 8,385 → 9,262 | 877px | footer |

### Desert map

| Gap | From → to | |
|---|---|---|
| 18px | top → nav `Check a meal` | |
| 266px | nav → hero CTA | |
| **1,913px** | hero CTA → block 2 CTA | worst, 2.9 screenfuls |
| 1,256px | block 2 CTA → block 3 dare link | |
| 1,735px | dare link → block 4 CTA | |
| 1,522px | block 4 CTA → block 5 CTA | |
| 1,163px | block 5 CTA → final CTA | |
| 208px | final CTA → footer `Check a meal` | |
| 763px | footer link → bottom | |

## The two rulings this measurement settles

### 1. ⚖️ `DESIGN.md` §11.1's CTA ruling — **the copy wins, at no cost** — ⚠️ NOW MOOT

> ⚠️ **Superseded 2026-08-05.** The offer block, its CTA and the cancel paragraph this ruling
> arranged were all deleted (see the third run below). The ruling cannot be violated because none of
> its subjects exist. It is kept because the *method* is the reusable part: when a copy-grounded
> ruling and the desert budget appear to conflict, measure both arrangements before assuming the copy
> has to pay. Here it did not have to.

The ruling put the offer block's CTA *"immediately after the cancel paragraph, before the claims
list"* on copy grounds, and recorded that if that variant missed the budget, the measured
arrangement would be the fallback **and the cancel paragraph's price adjacency would be the price
paid** (plan §10.2, open since the tournament).

Measured, both ways:

| Offer-block arrangement | block 4 → block 5 desert | block 5 → final desert |
|---|---|---|
| CTA at the end of the block | 2,013px ⛔ **over** | 673px |
| **CTA after the cancel paragraph** (the ruling) | **1,522px** ✅ | 1,163px ✅ |

**The ruled position is also the one that fits.** §10.2 closes: the adjacency costs nothing, and
nothing is spent.

### 2. ⚠️ One desert that no offer-block arrangement touches — and the 140px that closed it

With the ruled arrangement in place, exactly one desert was still over: **hero CTA → block 2's CTA,
2,053px — 52px past budget.** It is upstream of the offer block, so neither the ruling nor its
fallback affects it.

Measured fix: block 2's CTA moved **above** the scope note instead of below it.

| Block 2 arrangement | worst desert | next desert |
|---|---|---|
| CTA below the scope note | 2,053px ⛔ **over by 52px** | 1,116px |
| **CTA above the scope note** | **1,913px** ✅ | 1,256px ✅ |

It costs no copy — the scope note is a qualifier, not a lead-in — and it keeps the CTA on the
recognition moment, which is where the note the code carries says it belongs. **This is the one
arrangement decision in W13 that no plan or ruling named**, so it is flagged here rather than
buried: reverting it is moving one JSX element, and it puts the page back 52px outside §11.1.

## Corrections to the record

1. **The winner is 9,262px, not the 8,621px the winner spec records** (+641px, +7.4%). The spec's
   per-block geometry was measured on a mock, not on this implementation. Every figure in
   winner-spec §9's block headings should be read as **superseded by this file**.
2. **Block 4 is the tallest block on the page at 2,211px**, against the spec's 2,160px — the only
   block within 100px of its predicted height. Blocks 2 and 5 both came in ~450px under, and block 1
   ~80px over.
3. **Eight exits, not six.** The spec's arrangements were computed over six; block 3's dare link and
   the footer's `Check a meal` are both real exits by the definition above.

---

## Re-measured after the 18px body — 2026-08-05

The owner previewed the built page and reported the body type as too small. The tournament spec's
`17px` had never been read at size, so it became **`18px / 1.65`**, with the scale neighbours moved
to keep their steps (lede `18.5 → 20px`, FAQ summary `18 → 19px`, nav link `16 → 17px`, ghost pill
`15 → 16px`; H1/H2 are clamped and did not move; the `16px` fineprint floor did not move).
`DESIGN.md` §11 was amended in the same commit.

**Type is a layout change**, so §11.1 applies and this is that measurement. Neither `npm test` nor
`npm run e2e` can see a desert going over budget — this is the only gate that can.

**Method delta from the W13 run:** measured against a **production build** (`npm run build && npm run
start`), not `next dev`, because defect 1 also had to be verified against production. Everything else
— viewport, font wait, scroll pass, exit and desert definitions — is unchanged.

| | W13 (17px) | Now (18px) | Change |
|---|---|---|---|
| Page length | 9,262px | **9,556px** | +294px (+3.2%) |
| Screenfuls | 13.9 | **14.3** | +0.4 |
| Exits to `/check` | 8 | **8** | — |
| Worst desert | 1,913px | **1,877px** | −36px |
| Over budget | 0 | **0** | ✅ |

### Desert map

| Gap | From → to | |
|---|---|---|
| 18px | top → nav `Check a meal` | |
| 430px | nav → hero CTA | was 266px; the trust strip moved above the button |
| **1,877px** | hero CTA → block 2 CTA | worst, 2.8 screenfuls |
| 1,267px | block 2 CTA → block 3 dare link | |
| 1,759px | dare link → block 4 CTA | |
| 1,608px | block 4 CTA → block 5 CTA | |
| 1,194px | block 5 CTA → final CTA | |
| 212px | final CTA → footer `Check a meal` | |
| 762px | footer link → bottom | |

### ⚠️ The arrangement call the type change forced

At 18px the page came back at **2,034px on the hero → block 2 stretch, 33px past budget**, and it was
the only desert over. Three candidates were measured in the browser before one was chosen:

| Candidate | Worst desert | |
|---|---|---|
| 18px body, no reorder | 2,034px | ⛔ over by 33px |
| Block 2's CTA above the pains list | ~2,040px | ⛔ relocates the overage: its next desert goes 1,267 → ~2,040px |
| Block 2's CTA drops its 32px `--spaced` margin | 2,002px | ⛔ over by 1px |
| **Hero trust strip above the hero CTA** | **1,877px** | ✅ 124px of headroom |

**The trust strip moved above the button.** It costs no copy, and it does not change the page length
by a single pixel — the three lines are inside `.landing-hero-copy`, so reordering within that block
leaves its height, and therefore the proof card's position, exactly as it was. The primary CTA moves
from y=337 to y=494 and its hint to y=625, both still inside the 667px first screenful.

This is the second arrangement decision on this branch that no plan or ruling named — W13's block-2
CTA move was the first — so it is flagged here rather than buried, and the JSX carries the same note.
Reverting it is moving one element and puts the page 33px outside §11.1.

**W13's two rulings are unaffected.** The offer-block CTA is still after the cancel paragraph and its
desert is 1,608px, well inside budget; block 2's CTA is still above the scope note.

---

## Re-measured after the pricing section was deleted — 2026-08-05

The owner ruled: *"the price should not be mentioned, only focus on free check."* Asked whether that
meant deleting block 5 or rewriting it without amounts, they chose **delete**. The whole `#pricing`
section went — three price tiles, the branch-aware H2, the cancel paragraph, one primary CTA, the
four subscription claims and the Pantry Review line — along with the nav's `Pricing` link, ~70 lines
of now-orphaned CSS, and the `resolvePriceVariant` / `resolveAnnualPrice` imports.

**Deleting copy is a layout change**, so §11.1 applies and this is that measurement. Method is
identical to the 18px run: production build, 375×667, fonts awaited, one scroll pass.

| | 18px run | Now | Change |
|---|---|---|---|
| Page length | 9,556px | **7,811px** | **−1,745px (−18.3%)** |
| Screenfuls | 14.3 | **11.7** | −2.6 |
| Exits to `/check` | 8 | **7** | −1 (block 5's CTA) |
| Exits to `/pantry` | 3 | **2** | −1 (the Pantry Review line) |
| Worst desert | 1,877px | **1,877px** | — (unchanged, and still the hero → block 2 stretch) |
| Over budget | 0 | **0** | ✅ |

### Block map

| Range | Height | Block |
|---|---|---|
| 0 → 82 | 82px | nav |
| 82 → 1,330 | 1,248px | block 1, hero |
| 1,330 → 2,753 | 1,423px | block 2, the gap |
| 2,753 → 3,863 | 1,110px | block 3, the pause |
| 3,863 → 6,122 | 2,259px | block 4, three answers |
| 6,122 → 6,657 | 535px | Fair questions |
| 6,657 → 6,934 | 277px | block 6, close |
| 6,934 → 7,811 | 877px | footer |

### Desert map

| Gap | From → to | |
|---|---|---|
| 18px | top → nav `Check a meal` | |
| 430px | nav → hero CTA | |
| **1,877px** | hero CTA → block 2 CTA | worst, 2.8 screenfuls |
| 1,267px | block 2 CTA → block 3 dare link | |
| 1,759px | dare link → block 4 CTA | |
| 1,118px | block 4 CTA → final CTA | spans the entire FAQ |
| 212px | final CTA → footer `Check a meal` | |
| 763px | footer link → bottom | |

### ⭐ Removing an exit made the desert map *better*, which is not the obvious result

The intuition is that deleting a CTA must lengthen some desert, because the reader now travels
further between exits. It did the opposite. The two deserts that block 5's CTA used to sit between
were **1,608px + 1,194px**; with the whole block gone — it accounts for the entire 1,745px the page
lost — the single desert that replaced them is **1,118px**, shorter than either of the two it merged.

The lesson generalises, and it is worth writing down before the "fill the sides" work starts: **an
exit only earns its place if the content it interrupts has to be there.** Block 5's CTA was buying
back reachability that block 5's own length was spending. Deleting the content is strictly better
than adding a button to survive it, and the same test applies to anything added to the empty right
columns — content added there costs page length, and page length is what the budget actually meters.

### What this run does *not* settle

⚠️ The worst desert did not move: **1,877px, hero CTA → block 2's CTA**, exactly as before. The
deletion happened entirely below it, so every arrangement note in the two runs above still governs
that stretch — the hero trust strip stays above the hero CTA, and block 2's CTA stays above the scope
note. Neither has any new headroom.

⚠️ **There is now 124px of headroom on the worst desert and 883px on the next-worst.** That is the
budget available to the "fill the sides" work (handoff §3.3) and to any copy the owner adds back. It
is not much: at 375px, a right-column image or a live product component becomes a *stacked* block,
and 124px is roughly three lines of body copy. **Re-measure before assuming anything fits.**
