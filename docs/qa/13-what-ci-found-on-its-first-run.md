# 13 — What CI found on its first run

**Date:** 2026-07-12 · **Branch:** `feat/video-engine-renderer` · **PR:** #7
**Trigger:** `.github/workflows/ci.yml` executed for the first time. Run
[29180291815](https://github.com/tkiros/Revora/actions/runs/29180291815) — 4/4 green.

> Before this branch, **this repository had never run a single GitHub Actions job.** Not a failing
> one. Not one. `docs/qa/05-known-risks-and-blockers.md` marked QA-01 ("no CI workflow") as *Fixed*
> against a file that had only ever existed untracked on one laptop.

Turning it on found five defects. None of them were CI plumbing. Every one had been sitting in a
suite that was reported green.

---

## 1. Why CI appeared not to run at all — and why that was the least interesting part

The first push produced **zero** workflow runs. Not a failure: nothing. Actions was enabled, quota
was fine (21 of 2,000 free minutes used, and a sibling repo runs Actions daily), the file was a
regular blob at the right path, the YAML parsed, and the `pull_request` trigger was correct. Vercel's
GitHub App reacted to the same events, so the event bus was alive.

**Cause:** `main` had moved. PR #5 and #6 merged while this branch was open, leaving PR #7
`CONFLICTING`. GitHub cannot compute `refs/pull/N/merge` for a conflicting PR, and without a merge
ref it does not run `pull_request` workflows. It says nothing about this.

The diagnostic that settled it: a throwaway branch carrying a three-line workflow ran in five
seconds. Same repo, same event, same token. That isolated the cause to PR #7 rather than the
workflow, the scopes, or the billing — all three of which had looked like plausible culprits.

**Worth keeping:** a repo with zero Actions history gives you no baseline to lose. There is no "CI
went red" signal when CI has never been green.

---

## 2. The P0 that came back through a clean merge (F-21)

`main` had merged **usage-keyed model tiering** (PR #5), commented *"owner decision 2026-07-11"*:

```js
export const PRIMARY_MODEL_CHECKS = 10;
const AFTER_PRIMARY_MODEL = "gpt-5.4-nano";
```

This is exactly what commit `6ce3ae7` deletes as **F-21 (P0)**, and the F-21 argument holds against
main's newer code unchanged: guests stay on the primary model, and every non-premium session is
402'd *upstream of the tiering line*. The only sessions that reach check #11 are **trialing and
paying** ones. The downgrade lands exclusively on customers — while the trial wall sells them
"unlimited everything".

Its stated mitigation — *"every output still passes the same fail-closed postprocess contract"* — is
the control **N-30 proved could not fire** (`docs/qa/12`). It was load-bearing for the decision and
it was broken when the decision was made.

Owner reaffirmed F-21 on merge: **no paid downgrade.**

### The part that matters more than the outcome

**Git re-merged the tiering cleanly. No conflict marker.**

This branch *deleted* those lines rather than editing them, and **a deletion is invisible to a
three-way merge**: main added lines where our side had nothing to disagree with. The import of
`countChecksTotal`, the `let checkModel` declaration, the `lifetimeChecks` block in `route.ts`, and
a `PRIMARY_MODEL_CHECKS` import in `check-persistence.test.ts` all came back under a green
"no conflicts". They had to be excised by hand.

> **A P0 closed by deletion is a P0 with no merge conflict guarding it.** If you close a finding by
> removing code, the diff that reintroduces it will merge silently. The only thing that catches it is
> a test that asserts the *absence* — which is why `6ce3ae7` inverted the pinned test rather than
> deleting it, and why that inverted test is the load-bearing artifact of F-21, not the deletion.

---

## 3. The fold test never tested the fold (A11Y-01, corrected)

The original finding, quoted verbatim from `05-known-risks-and-blockers.md`:

> `/check` CTA below the **720px fold** on iPhone 12 (y≈753)

**iPhone 12's viewport is 664px tall, not 720.** The number was wrong in the finding itself, and the
test inherited it:

```js
expect(box!.y).toBeLessThan(720);   // for BOTH projects
```

Pixel 5's viewport *is* 727, so the threshold was roughly right there. On iPhone 12 it sat **56px
below the fold it was meant to guard**. The remediation moved the CTA from y≈753 to y≈714, cleared
720, and was recorded as:

> A11Y-01 | Fixed | fold test passes on Mobile Chrome AND Mobile Safari

At y=714 in a 664px viewport, **the button was still off-screen.** The test could not go red until
the CTA was already 56px past invisible. It never once measured the fold.

CI's font metrics wrap the hero copy taller (90px vs 68px locally), which pushed it to 768 and
finally tripped the 720 line. **CI did not break this test. It revealed it.**

**Fixed:** assert against `page.viewportSize().height` so each project is measured against the
viewport it actually declares; drop the eyebrow and descriptive paragraph from the check hero at
≤430px, returning ~130px (CI Safari 768 → ~635 of 664).

**Deliberately not claimed:** that the *whole* button is visible. That needs ~695px of content in a
664px viewport and is unreachable on **both** devices without redesigning the form — Mobile Chrome
fails it too (674 + 56 > 727). The guarantee is the one the original assertion intended: the CTA's
top edge lands on the first screen. Full visibility is a form redesign (compact method chips, or a
stored A1C so it is not re-asked every meal) and is **not** done.

---

## 4. The privacy scan that failed on its own timestamp

`tests/unit/server/pantry-ciphertext.test.ts` — *"no plaintext health-adjacent string appears in any
pantry row"* — went red in CI on a row it had just inserted itself.

It dumps `SELECT *` (every column) and asserts no secret substring appears. `SECRETS.a1c` is
**`"6.1"`**. The row's `created_at` was `2026-07-12T04:36:0` **`6.1`** `77Z`.

The test was **clock-dependent**. It fails whenever an insert lands on a second/millisecond pair that
spells the A1C value, and it had been passing purely by luck of the wall clock.

**Fixed:** exclude `Date`-typed values from the scan. They come from `timestamptz` columns and cannot
physically hold health text, so nothing that could leak stops being checked.

**Verified it can still go red:** storing `SECRETS.portion` in plaintext instead of
`encryptField(...)` fails the assertion (`not to contain 'two boxes'`). A privacy check that cannot
fail is not a privacy check — and this one had been failing for a reason that had nothing to do with
privacy, which is the fastest way to get a real one waved through as "that flaky test again".

---

## 5. Two E2E specs asserted copy the branch had deliberately removed

The suite's **"62 passed, 0 failed"** was measured *before* the copy it asserts was changed, and
never re-measured. Both specs fail on a developer laptop too — CI did not introduce them.

- `onboarding.spec.ts` pinned the welcome step's *"one reason, one adjustment, and one safer swap"*.
  **W-09 hedged that copy** because a SAFE verdict is *structurally forbidden* from carrying an
  adjustment or a swap, so the promise was false for every Clear result.
  `claims-boundary-copy.test.ts` now lists the old string as a **banned claim**.

  > The unit suite and the E2E suite were asserting **opposite things about the same sentence**, and
  > only the unit one had been re-run.

- `mobile-check.spec.ts` pinned *"Eat it in this order:"* and *"After this meal:"*. **W-17 reframed
  both** ("A pattern that helps many people:", "A calm next step:") because the tips are general
  strategies, not a reading of the user's plate. The specs now assert the constant framing, not the
  tip text — W-17 rotates 6 audited variants per slot, so pinning one variant would be the same bug
  with a longer fuse.

---

## 6. The CI plumbing (the boring, real half)

| Job | Failed because | Fix |
|---|---|---|
| `e2e` | All 15 specs died on `MissingAdapter`. Both `next dev` servers inherit `DATABASE_URL`, and `auth.ts:21` only constructs the Auth.js adapter when it is set. **CI had no database.** | `postgres:16` service + `drizzle-kit migrate` |
| `e2e` | 110 Mobile Safari tests died at browser launch — the workflow installed **chromium only**, but `playwright.config.ts` runs Mobile Chrome *and* Mobile Safari | `playwright install chromium webkit` |
| `secrets` | gitleaks 403'd on `GET /pulls/7/commits` and exited **before scanning a single commit** — it was failing loudly while scanning nothing | `permissions: pull-requests: read` |
| flake | `nudge-opt-in` failed → passed → failed across three runs. `DailyLoop` returns `null` until `loadHistory()` resolves, which awaits `fetch("/api/history")`; under `next dev` that route compiles **on first request**, so a 5s assertion raced a cold compile | Wait on the response the component blocks on, rather than widening the timeout and hoping |

> E2E had only ever run on machines that happened to have a database. That is why nobody noticed the
> workflow never provisioned one.

**Known, unfixed:** E2E runs against `next dev`, which compiles routes on demand. That is the root of
the cold-start flake class (the `trial-wall` `/api/paywall` timeout is the same shape). A production
build would remove it, but `playwright.config.ts` uses dev deliberately — the `distDir` trick that
lets two servers coexist — so it is a larger change than this branch should carry.

---

## The lesson, restated

`docs/qa/12` ended with:

> Any safety check whose trigger condition is supplied by the component it is meant to backstop is
> not a safety check.

This round adds three more of the same family:

> **A gate that has never failed may never have run.** CI had zero runs. The riskAccuracy gate
> returned `null` for months. The banned-claims regexes were prompt labels. Each was reported as
> working.

> **A threshold is a claim.** `y < 720` on a 664px viewport is not a weaker test — it is a *false*
> one. It reports on a fold that does not exist. Check that the number in the assertion is the number
> in the world.

> **A green test proves the assertion held, not that it was still the right assertion.** Two suites
> asserted opposite things about one sentence for as long as only one of them was run.

And the new one, which is the sharpest:

> **A finding closed by deleting code has no merge conflict defending it.** Write the test that
> asserts the absence, or the next merge will quietly bring it back — green, with no conflict marker.
