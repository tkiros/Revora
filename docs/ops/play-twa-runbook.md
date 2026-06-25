# Revora — Google Play (TWA) Runbook

> **⛔ BLOCKED — do not execute yet.** Phase 9 is gated on two preconditions:
> 1. **The PWA is live and stable** on the production domain (Phase 8 go-live complete —
>    `docs/ops/launch-controls.md` §11). A TWA is a thin wrapper over the live PWA; there is
>    nothing to wrap until the PWA is deployed.
> 2. **Counsel has weighed in** (`docs/legal/counsel-brief.md`, task 4.4) on the
>    informational-only positioning and the health-app store declarations.
>
> This runbook is the executable plan ops/eng runs **once both gates clear**. Most steps are
> non-code (store account, policies, asset hosting). The one code artifact —
> `public/.well-known/assetlinks.json` — **cannot be created until ops generates the Play App
> Signing key** (it carries that key's SHA-256). A placeholder fingerprint in a hosted file
> fails validation or forges trust, so the file is **not** committed yet — only templated below.

The platform facts below shift; **verify current Play requirements** before acting.

---

## What makes a TWA "trusted" (read first)

A Trusted Web Activity launches the live PWA full-screen **without a URL bar** only when
**Digital Asset Links** verify the app owns the domain. That is a JSON statement hosted at
`https://<domain>/.well-known/assetlinks.json` binding the **Android package name** to the
**Play App Signing key SHA-256**. The service worker is *not* what enables the TWA — asset
links are. Bubblewrap/PWABuilder *generate* the assetlinks content; **you must host it on the
production domain.**

---

## 9.1 — Play Console account + policy prerequisites  *(owner: ops · non-code gate)*

1. Create a Google Play Console account ($25 one-time).
2. **Verify current Play requirements (they change):**
   - Personal accounts typically require a **closed-testing cohort** (~12+ testers, ~14 days)
     before production access.
   - Organisation accounts require a **D-U-N-S** number.
3. Complete the **health-app declarations** and **content rating** questionnaire. Revora is
   **informational only** — declare no diagnosis/treatment; mirror the claims boundary
   (`docs/safety/claims-boundary.md`).

**Acceptance:** account verified; testing requirement (if any) satisfied; declarations submitted.

---

## 9.2 — Play Data Safety form  *(owner: ops/legal · non-code gate)*

The Data Safety form must be **consistent with `/privacy` and `docs/privacy/data-flow.md`**
(same facts, different artifact). Source of truth → form mapping:

| Data Safety question | Answer (from data-flow.md / `/privacy`) |
|---|---|
| Is data collected/transferred? | **Transferred, not stored.** Meal text + A1C are sent off-device to process the check. |
| Data types | "Health info" (A1C value) + the free-text meal description. No name, email, account, or device IDs (there is no login / no DB). |
| Shared with third parties? | **Yes — OpenAI**, the model provider, to generate the check. |
| Stored/retained by Revora? | **No.** Every model call uses `store:false`; Revora has no auth, no database, no history, no raw request logging. |
| Provider retention | Note that the **provider may keep abuse-monitoring logs** on its side (outside Revora's control) — same caveat as `/privacy`. |
| Encrypted in transit? | Yes (HTTPS). |
| Can users request deletion? | N/A — nothing is stored to delete. |

**Acceptance:** form submitted; every answer traces to a line in `docs/privacy/data-flow.md`.

---

## 9.3 — Generate the TWA + host asset links  *(owner: eng/ops)*

### Generate the `.aab` and assetlinks
Use **Bubblewrap** (or PWABuilder) pointed at the live manifest:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://<domain>/manifest.webmanifest
# theme/background already match the manifest: #0f172a / #f3f7fb
bubblewrap build        # produces app-release-bundle.aab + a signing key
```

Upload the `.aab` to Play, and **enable Play App Signing** (Google holds the upload→app
signing key). After upload, copy the **app signing key SHA-256** from
**Play Console → Setup → App integrity → App signing key certificate**.

### Host the asset links
Create `public/.well-known/assetlinks.json` (Next serves `public/` verbatim, so it resolves
at `https://<domain>/.well-known/assetlinks.json`). **Template — fill the two placeholders
with the real values, then commit + deploy:**

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "__PACKAGE_NAME__",
      "sha256_cert_fingerprints": ["__PLAY_APP_SIGNING_SHA256__"]
    }
  }
]
```

- `__PACKAGE_NAME__` — the Android application id chosen in `bubblewrap init` (e.g. `app.revora.twa`).
- `__PLAY_APP_SIGNING_SHA256__` — the colon-separated SHA-256 from Play App Signing (**not** the
  upload key, **not** the local Bubblewrap key).

**Verification:**
- Google **Statement List Tester** validates `https://<domain>/.well-known/assetlinks.json`.
- Install the TWA from the closed track → it launches **without a URL bar** (if the bar shows,
  the fingerprint/package don't match — re-check the App Signing key, not the upload key).

---

## 9.4 — Store assets + submit  *(owner: ops/design)*

1. Assets: app icon, feature graphic, phone screenshots. Reuse the brand mark
   (`public/icon-512.png`); screenshots from the live PWA.
2. **Listing copy must stay inside the claims boundary** — audit every line against
   `docs/safety/claims-boundary.md`. Banned families (reject any copy that implies them):
   - [ ] No **diagnose / treat / cure / prevent / reverse** ("reverse prediabetes", "lower your A1C").
   - [ ] No **future prediction** ("will keep your blood sugar down").
   - [ ] No **exact clinical values / dosing**.
   - [ ] No **FDA-clearance / medical-device** implication.
   - [ ] Positioning is **informational only**; the disclaimer is visible in-app.
3. Privacy policy URL = **`https://<domain>/privacy`** (the existing `/privacy` page).
4. Submit for review.

**Acceptance:** listing passes review; copy signed off against `docs/safety/claims-boundary.md`.

---

## Out of scope here (human/ops)
Creating the Play account, the testing cohort, the actual `.aab` build + key generation,
hosting the real `assetlinks.json` (needs the live domain + signing key), and the store
assets. Engineering's only artifact is the templated `assetlinks.json` above, committed once
the real fingerprint exists.
