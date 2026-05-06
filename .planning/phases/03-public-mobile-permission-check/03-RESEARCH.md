# Phase 3: Public Mobile Permission Check - Research

**Researched:** 2026-05-06
**Domain:** Mobile-first Next.js delivery shell for a public, health-adjacent AI check flow
**Confidence:** HIGH for stack, route/UI patterns, mobile input semantics, and accessibility baselines; MEDIUM for exact file shapes until Phase 2 is executed

## User Constraints

No Phase 3 `CONTEXT.md` exists. The research is therefore constrained by `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/PROJECT.md`, the approved design doc, project research, and the Phase 2 research/plan set.

### Locked Scope From Roadmap And Requirements

- Phase 3 must deliver one public, no-login, mobile-first page for the Revora check.
- The user must be able to enter a food description and a one-decimal A1C value from the same page.
- The primary CTA must be a large thumb-reachable button labeled exactly `Should I eat this?`
- Required food and A1C validation must happen before any model call.
- Mobile keyboard behavior must not be broken by page-load autofocus.
- The UI must show loading, still-running, and friendly retry states instead of raw errors.
- Under normal network conditions the user must receive a useful result, clarification, or safe error state within the 5-second acceptable ceiling.
- Result rendering must stay readable in bright mobile conditions.

### Dependency Constraints From Earlier Phases

- Phase 3 depends on Phase 2's single server-side inference path. Do not create a second classifier, a second API contract, or any client-side OpenAI call.
- The public page should call the Phase 2 `POST /api/check` route and render its typed response kinds.
- The Phase 2 plan set assumes these response kinds exist: `result`, `clarify`, `not_food`, `out_of_scope`, and `retry`.
- The Phase 2 plan set also assumes the API route is a thin adapter over `checkFood()`; Phase 3 should preserve that seam and focus only on the public shell.
- The repo is still planning-only right now. If Phase 2 has not actually produced the Next.js scaffold, route handler, schemas, and tests by execution time, Phase 3 execution must start by verifying that dependency rather than rebuilding it ad hoc.

### Local Document Conflict To Ignore

Older PRD and archive documents in this repo still describe scanner-heavy, native-mobile, or broader product shapes. For Phase 3 planning, those are stale relative to the current roadmap and project docs. The active scope is a one-page, text-only, public web flow.

### Out Of Scope For This Phase

- Scanner, barcode, OCR, camera permissions, or native mobile app work
- Authentication, saved history, profiles, payments, or database-backed personalization
- Rewriting the Phase 1 claims boundary or the Phase 2 inference/safety contract
- Privacy-minimal telemetry, abuse controls, WAF/rate limiting policy, and kill-switch operations beyond the friendly UI state for 429/failure cases
- Founder launch assets and manual production review loop work

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INPUT-01 | User can enter a food name or meal description without creating an account. | Use one public `app/page.tsx` screen with no auth gate, no modal flow, and one food text field wired directly to `/api/check`. |
| INPUT-02 | User can enter an A1C value as a numeric input that supports one decimal place. | Render a string-backed numeric field with `type="number"`, `inputMode="decimal"`, and `step="0.1"`, then parse/validate before POST. |
| INPUT-03 | The app validates required food and A1C inputs before calling the model. | Keep a tiny client validator that mirrors the Phase 2 request contract and blocks submit until both fields are valid. |
| GUIDE-08 | The app returns a useful result, clarification, or safe error state within a 5-second acceptable ceiling under normal network conditions. | Use immediate loading feedback, a 5-second slow-state timer, and a longer hard timeout mapped to friendly retry copy. |
| UX-01 | User can complete the entire check from a single mobile-first page with no modal, account wall, or navigation flow. | Keep one page, inline status/result areas, and no secondary route or modal state machine. |
| UX-02 | The food input and A1C input work with mobile keyboards without auto-focusing the page into an obscured state. | Avoid `autofocus`; use mobile keyboard hints (`inputMode`, `enterKeyHint`) instead of trying to force focus behavior. |
| UX-03 | The primary CTA is a large thumb-reachable button labeled `Should I eat this?` | Make the submit button the dominant bottom-of-form action with accessible target sizing and explicit text. |
| UX-04 | The submit button shows a loading state during the model request. | Drive button text/disabled state from the request status machine and keep double-submit prevention in the same logic. |
| UX-05 | If a model request exceeds 5 seconds, the UI tells the user the check is still running. | Start a 5-second timer on submit and swap the inline status copy without cancelling the request at that threshold. |
| UX-06 | If a request fails, times out, or is rate-limited, the UI shows friendly retry copy and never shows a raw error. | Normalize transport errors, `429`, and server `retry` responses into one user-safe retry surface. |
| UX-07 | Result text is high-contrast and readable on mobile in bright environments. | Use text-first cards, WCAG-level contrast, non-color-only status labels, and minimum body/result font sizes fit for outdoor viewing. |

</phase_requirements>

## Summary

Phase 3 should be planned as a thin delivery shell, not as a second product core. The stable architectural move is one public `app/page.tsx` and a few focused components layered on top of the Phase 2 `POST /api/check` route. All classification policy, disclaimer rules, A1C routing, and malformed-output handling stay in the Phase 2 server path. The public page only owns local validation, request orchestration, status rendering, and readable mobile presentation.

The highest-risk frontend detail is not styling; it is form and request behavior on real phones. A1C entry should be treated as a string-backed numeric field so the UI can handle empty and partial values cleanly, while still using native mobile hints like `inputMode="decimal"` and `step="0.1"`. The page should explicitly avoid `autofocus`, because current MDN guidance notes that autofocus can scroll the page on load and trigger the virtual keyboard on touch devices. For async behavior, the UI needs two time thresholds: immediate loading feedback and a separate 5-second "still checking" state before any later timeout/failure fallback.

The bright-environment requirement should be planned as an accessibility rule, not a design preference. WCAG 2.2 contrast guidance and use-of-color guidance point to a text-first result card with explicit `SAFE`, `MODERATE`, or `HIGH` labels, strong light-dark contrast, and no reliance on color alone. For planning purposes, Phase 3 is ready to execute once Phase 2 has actually produced the scaffold and route contract; until then, the exact response helpers and file imports remain a dependency risk rather than a frontend design choice.

**Primary recommendation:** Build Phase 3 as one Next.js App Router page plus a small client-side state machine over the Phase 2 `/api/check` route, with local validation, no autofocus, a 5-second slow-state message, and Playwright mobile smoke coverage.

## Standard Stack

### Core

| Library / Artifact | Version | Purpose | Why Standard |
|--------------------|---------|---------|--------------|
| Phase 2 `checkFood()` + `POST /api/check` | Phase 2 output | Single public inference boundary for the mobile page | The Phase 3 shell should reuse the proven server contract, not fork it. |
| Next.js App Router | 16.2.4 verified with `npm view` on 2026-05-06 | One public page plus one route handler in the same deployment | Matches the project's chosen web-only MVP architecture and current official route-handler guidance. |
| React | 19.2.5 verified with `npm view` on 2026-05-06 | Client form state, async status state, and result rendering | Enough built-in primitives exist for this two-field flow; no extra form framework is needed. |
| TypeScript | 6.0.3 verified with `npm view` on 2026-05-06 | Typed request/result contracts between page, fetch wrapper, and API route | The UI must not drift from the Phase 2 response contract. |
| Tailwind CSS | 4.2.4 verified with `npm view` on 2026-05-06 | Mobile-first spacing, contrast, and typography without a component library | Fastest way to keep visual rules explicit in a tiny app. |

### Supporting

| Library / Artifact | Version | Purpose | When to Use |
|--------------------|---------|---------|-------------|
| Zod | 4.4.3 verified with `npm view` on 2026-05-06 | Mirror the request contract on the client and unit-test the validator | Use if Phase 2 already introduces Zod, which its plans do. |
| Playwright | 1.59.1 verified with `npm view` on 2026-05-06 | Mobile smoke tests for valid submit, slow response, retry, and readability checks | Use for public-flow regression coverage, not only for final manual QA. |
| Vitest | 4.1.5 verified with `npm view` on 2026-05-06 | Unit tests for client validation and request-state helpers | Use if the Phase 2 scaffold lands as planned. |
| Native Web APIs | current browser platform | `fetch`, `AbortController`, optional `AbortSignal.timeout`, and form attributes | Prefer built-ins for timeout and keyboard behavior before adding packages. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client `fetch('/api/check')` against the Phase 2 public route | React Server Actions with `useActionState` | React supports form actions, but a client fetch is more aligned with the Phase 2 route contract and easier to smoke-test as a true public API boundary. |
| Local state plus a tiny validator | React Hook Form / Formik | This form has two fields and one async submit. A form framework would add surface area without removing meaningful risk. |
| String-backed numeric field with `type="number"` + `inputMode="decimal"` + `step="0.1"` | Pure text field with regex-only validation | The numeric input preserves semantic intent while still allowing explicit one-decimal validation logic in code. |
| Tailwind utilities and a few focused components | A heavy UI kit or design system | A kit would slow down readability tuning and can introduce low-contrast defaults that conflict with the bright-light requirement. |

**Installation:**

```bash
# If the Phase 2 scaffold is still absent at execution time, install the shared app stack first.
npm install next@16.2.4 react@19.2.5 react-dom@19.2.5 tailwindcss@4.2.4 openai@6.36.0 zod@4.4.3
npm install -D typescript@6.0.3 vitest@4.1.5 playwright@1.59.1
npx playwright install
```

## Architecture Patterns

### Recommended Project Structure

```text
app/
├── layout.tsx                     # Minimal shell and metadata
├── page.tsx                       # Public single-screen mobile UI
└── api/
    └── check/
        └── route.ts               # Phase 2 adapter - do not rewrite policy here
components/
├── food-check-form.tsx            # Food + A1C fields, CTA, local validation
├── request-status.tsx             # Loading / still-running / retry copy
└── result-card.tsx                # Result, clarify, not-food, out-of-scope rendering
lib/
├── client/
│   ├── check.ts                   # Thin typed fetch wrapper to /api/check
│   ├── validation.ts             # Required-field and one-decimal parsing
│   └── ui-state.ts               # Request state machine helpers
└── revora/                        # Phase 2 server policy and service code
tests/
├── unit/
│   └── client/
│       └── validation.test.ts
└── smoke/
    └── mobile-check.spec.ts
```

### Pattern 1: Thin Public Shell Over One Server Contract

**What:** The public page submits to the existing `POST /api/check` route and renders the returned response kind. No prompt logic, safety logic, or model selection belongs in the page component.

**When to use:** Always. This is the main dependency boundary between Phase 2 and Phase 3.

**Example:**

```typescript
// Source: project architecture research, Phase 2 plans, and Next.js route-handler docs.
export async function submitCheck(input: { food: string; a1c: number }) {
  const response = await fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return response.json();
}
```

### Pattern 2: String-Backed A1C Input With Native Mobile Hints

**What:** Keep the A1C field value as a string in client state until submit, but render it as a numeric field with `inputMode="decimal"` and `step="0.1"`.

**When to use:** Always for `INPUT-02` and `INPUT-03`.

**Why this pattern:** Native numeric fields still expose string values to React, which lets the UI preserve empty or partial input without prematurely coercing the user's typing into `NaN`. This recommendation is an implementation inference from MDN input guidance and the repo's explicit mobile constraints.

**Example:**

```tsx
// Source: MDN inputmode, input/number, and the project design doc's mobile UX constraints.
<input
  id="a1c"
  name="a1c"
  type="number"
  inputMode="decimal"
  step="0.1"
  enterKeyHint="go"
  placeholder="6.1"
  value={a1c}
  onChange={(event) => setA1c(event.currentTarget.value)}
/>;
```

### Pattern 3: Explicit Request State Machine

**What:** Represent the public flow with a small state machine such as `idle -> invalid -> submitting -> slow -> success | failure`.

**When to use:** Always. Spinner-only UX is not enough for a 5-second ceiling requirement.

**Example:**

```typescript
// Source: React pending-state guidance plus the Phase 3 roadmap requirements.
type CheckUiState =
  | { kind: "idle" }
  | { kind: "invalid"; message: string }
  | { kind: "submitting" }
  | { kind: "slow" }
  | { kind: "success"; response: RevoraUserResponse }
  | { kind: "failure"; message: string };
```

### Pattern 4: Separate Slow-State Timer From Hard Failure

**What:** Show loading immediately, switch to a still-running message at 5 seconds, and only later convert to a retry state if the request truly fails or times out.

**When to use:** Always for `GUIDE-08`, `UX-04`, `UX-05`, and `UX-06`.

**Example:**

```tsx
// Source: project design doc plus MDN AbortSignal.timeout guidance.
const slowTimer = window.setTimeout(() => {
  setUiState({ kind: "slow" });
}, 5000);

try {
  const result = await fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12000),
  });
  // render typed result here
} catch {
  setUiState({
    kind: "failure",
    message: "Couldn't check this food right now. Try again in a moment.",
  });
} finally {
  window.clearTimeout(slowTimer);
}
```

### Pattern 5: Text-First, Not Color-Only, Result Rendering

**What:** Result cards should render explicit text labels such as `SAFE`, `MODERATE`, `HIGH`, `Need one detail`, or `Try again`, and they should pass contrast requirements independent of their badge colors.

**When to use:** Always for `UX-07`.

**Example:**

```tsx
// Source: WCAG 2.2 contrast and use-of-color guidance.
<section className="rounded-2xl border border-slate-300 bg-white p-4 text-slate-950">
  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
    MODERATE
  </p>
  <p className="mt-2 text-base leading-6">
    This meal is mostly fast carbs, so add protein or vegetables before the starch.
  </p>
</section>
```

### Anti-Patterns To Avoid

- **Client-side model calls:** The browser must never own OpenAI credentials or prompt logic.
- **Form-library overkill:** This phase does not justify React Hook Form, Formik, or a global store.
- **Page-load autofocus:** MDN explicitly warns that autofocus can scroll the page and trigger dynamic keyboards on touch devices.
- **Spinner-only slow handling:** A loading spinner without a 5-second copy change fails the roadmap's still-running requirement.
- **Color-only risk display:** `SAFE`/`MODERATE`/`HIGH` must still be understandable without reading the color.
- **Re-implementing Phase 2 logic in the page:** The page renders server outcomes; it does not classify foods.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mobile keyboard behavior | Custom key filtering and keyboard hacks | HTML `type`, `inputMode`, `step`, and `enterKeyHint` attributes | Browsers already expose the right virtual-keyboard hints. |
| Request-time UX orchestration | A bespoke polling engine or multi-step async workflow | One fetch wrapper, one 5-second slow timer, one hard-timeout path | The phase only needs one submit-response cycle. |
| Secondary inference seam | Server Action or client logic that bypasses `/api/check` | The Phase 2 route and `checkFood()` service | Safety and eval coverage depend on a single path. |
| Manual mobile QA only | Ad hoc phone tapping with no repeatable test | Playwright device emulation plus one real-device sanity pass | Public regressions should be caught before manual review. |
| Result semantics | Color chips or iconography with implicit meaning | Text labels and reasons, optionally styled with color secondarily | WCAG guidance says color must not be the only cue. |

**Key insight:** The complexity here is not the form markup. It is keeping the public shell behaviorally thin while still handling mobile keyboards, slow requests, retries, and bright-light readability with no cracks in the Phase 2 safety boundary.

## Common Pitfalls

### Pitfall 1: A1C Validation Blocks Legitimate Typing Or Accepts Bad Submit Values

**What goes wrong:** The field either rejects normal partial typing (`6.`) too early or allows malformed submit values such as blank strings, multi-decimal values, or non-numeric input to hit the route.

**Why it happens:** Teams conflate the live input state with the submitted numeric contract.

**How to avoid:** Keep the field string-backed in React, allow normal typing, and validate only on submit or blur against the exact one-decimal rule.

**Warning signs:** State is stored as a `number` from the first keystroke, or the UI sends `NaN`, `""`, or `6.12`.

### Pitfall 2: Client Validation And Server Validation Drift

**What goes wrong:** The client blocks cases the server is supposed to short-circuit safely, or the client allows shapes that the server rejects.

**Why it happens:** The UI invents its own rules instead of mirroring the Phase 2 request contract.

**How to avoid:** Keep the client validator minimal: required food, parsable one-decimal A1C, and duplicate-submit prevention only. Let the server own scope routing and policy.

**Warning signs:** The page rejects `5.6` or `6.5` as invalid instead of letting the server return safe out-of-scope guidance.

### Pitfall 3: Slow Requests Collapse Into Generic Failure

**What goes wrong:** The user sees one spinner for too long, then a raw fetch error or blank card.

**Why it happens:** There is no explicit timer threshold and no normalized error mapping.

**How to avoid:** Model the UI with separate `submitting`, `slow`, and `failure` states, and map `429`, timeout, network failure, and server `retry` into friendly copy.

**Warning signs:** The only async state is `isLoading`, or error rendering depends on `error.message`.

### Pitfall 4: Result Readability Depends On Pastel Color Chips

**What goes wrong:** The result card technically renders, but it washes out in bright light or becomes ambiguous for users with color-vision limitations.

**Why it happens:** Visual styling treats `SAFE`/`MODERATE`/`HIGH` like decorative badges instead of primary information.

**How to avoid:** Use explicit text labels, high light-dark contrast, strong border/background separation, and avoid using color as the only meaning carrier.

**Warning signs:** The badge is readable only because it is green, amber, or red; body text sits on low-contrast tinted backgrounds.

### Pitfall 5: Phase 3 Quietly Rebuilds Phase 2

**What goes wrong:** The page starts importing prompt/model code directly, or a new route/action bypasses the eval-covered service.

**Why it happens:** The team treats the UI phase as a chance to "simplify" the backend contract.

**How to avoid:** Treat `/api/check` as a hard integration boundary and verify Phase 2 artifacts before starting UI execution.

**Warning signs:** `app/page.tsx` imports `openai`, prompt helpers, or policy modules that should remain server-only.

## Code Examples

Verified patterns from official sources and local phase constraints:

### Public Submit Handler With Local Validation And Slow-State Copy

```tsx
// Source: React docs for pending UI, MDN input docs, and the Phase 3 roadmap.
"use client";

import { useState, useTransition } from "react";

type UiState =
  | { kind: "idle" }
  | { kind: "invalid"; message: string }
  | { kind: "submitting" }
  | { kind: "slow" }
  | { kind: "done"; response: RevoraUserResponse }
  | { kind: "error"; message: string };

export function FoodCheckForm() {
  const [food, setFood] = useState("");
  const [a1c, setA1c] = useState("");
  const [ui, setUi] = useState<UiState>({ kind: "idle" });
  const [, startTransition] = useTransition();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedFood = food.trim();
    const trimmedA1c = a1c.trim();
    if (!trimmedFood) {
      setUi({ kind: "invalid", message: "Enter a food or meal first." });
      return;
    }
    if (!/^\d+(\.\d)?$/.test(trimmedA1c)) {
      setUi({ kind: "invalid", message: "Enter A1C with one decimal place, like 6.1." });
      return;
    }

    setUi({ kind: "submitting" });
    const slowTimer = window.setTimeout(() => setUi({ kind: "slow" }), 5000);

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food: trimmedFood, a1c: Number(trimmedA1c) }),
        signal: AbortSignal.timeout(12000),
      });

      const payload = await response.json();
      startTransition(() => {
        setUi({ kind: "done", response: payload });
      });
    } catch {
      setUi({
        kind: "error",
        message: "Couldn't check this food right now. Try again in a moment.",
      });
    } finally {
      window.clearTimeout(slowTimer);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {/* inputs and result rendering */}
    </form>
  );
}
```

### Playwright Mobile Smoke Coverage

```typescript
// Source: Playwright emulation docs and the Phase 3 requirement set.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/smoke",
  projects: [
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 13"] },
    },
  ],
});
```

## State Of The Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router API routes or separate frontend/backend repos | App Router page plus `app/api/check/route.ts` in one Next.js deployment | Standardized by Next.js App Router; current official docs updated March 31, 2026 | Keeps the public shell and the server contract in one deployable unit. |
| Spinner-only async feedback | Explicit loading, slow, and retry states | Locked in Revora's 2026-05-04 design and roadmap docs | Makes the 5-second ceiling visible and user-friendly. |
| Color-only severity chips | Text-first labels with contrast-safe styling and color as secondary reinforcement | Current WCAG 2.2 accessibility guidance | Improves bright-light readability and avoids color-only meaning. |
| Manual phone-only QA | Playwright mobile emulation plus targeted real-device sanity check | Current Playwright 1.59 docs | Gives repeatable coverage for thumb, viewport, and slow-state regressions. |

**Outdated for this phase:**

- Autofocusing the first input on mobile landing pages
- Multi-step or modal-based check flows
- Client-side model calls or alternate route contracts that bypass the Phase 2 service

## Open Questions

1. **Have Phase 2 execution artifacts been created yet?**
   - What we know: the plan set expects a Next.js scaffold, `app/api/check/route.ts`, and typed response schemas.
   - What's unclear: the repo does not contain those files yet.
   - Recommendation: make Phase 2 artifact verification the first Wave 0 step of Phase 3 execution.

2. **Should localized comma decimals be accepted in the A1C field?**
   - What we know: MDN says `inputMode="decimal"` presents the locale decimal separator.
   - What's unclear: whether Revora wants `6,1` normalized silently or rejected with explicit guidance.
   - Recommendation: accept both `.` and `,` in client parsing, normalize to a number, and keep the server contract numeric.

3. **Should the user be able to cancel and resubmit while the 5-second slow state is showing?**
   - What we know: the roadmap requires a still-running state at 5 seconds and a friendly retry state on actual failure.
   - What's unclear: whether the UX should expose a second action before hard failure.
   - Recommendation: keep the 5-second state passive first; introduce cancel/retry only if manual testing shows users are double-submitting.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright 1.59.1 for mobile smoke coverage; Vitest 4.1.5 for client validation/state helpers if the Phase 2 scaffold exists |
| Config file | none currently - Wave 0 should add `playwright.config.ts` and reuse/create `vitest.config.ts` |
| Quick run command | `npx playwright test tests/smoke/mobile-check.spec.ts --project="Mobile Chrome"` |
| Full suite command | `npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INPUT-01 | Public user can open one page and enter food without login | smoke | `npx playwright test tests/smoke/mobile-check.spec.ts -g "public no-login form"` | ❌ Wave 0 |
| INPUT-02 | A1C field accepts one-decimal numeric entry | unit + smoke | `npx vitest run tests/unit/client/validation.test.ts -t "a1c one decimal"` | ❌ Wave 0 |
| INPUT-03 | Invalid food/A1C blocks network submit | integration | `npx playwright test tests/smoke/mobile-check.spec.ts -g "invalid submit does not POST"` | ❌ Wave 0 |
| GUIDE-08 | User gets a useful result, clarification, or safe error within the acceptable UX ceiling | smoke | `npx playwright test tests/smoke/mobile-check.spec.ts -g "useful response states"` | ❌ Wave 0 |
| UX-01 | Flow stays on one page with no modal/account/nav requirement | smoke | `npx playwright test tests/smoke/mobile-check.spec.ts -g "single screen flow"` | ❌ Wave 0 |
| UX-02 | No autofocus keyboard jump; mobile keyboard hints remain usable | smoke + manual | `npx playwright test tests/smoke/mobile-check.spec.ts -g "no autofocus mobile inputs"` | ❌ Wave 0 |
| UX-03 | CTA is labeled `Should I eat this?` and remains thumb-reachable | smoke | `npx playwright test tests/smoke/mobile-check.spec.ts -g "cta label and position"` | ❌ Wave 0 |
| UX-04 | Submit button shows loading state | smoke | `npx playwright test tests/smoke/mobile-check.spec.ts -g "loading state"` | ❌ Wave 0 |
| UX-05 | UI shows still-running copy after 5 seconds | integration | `npx playwright test tests/smoke/mobile-check.spec.ts -g "slow state after five seconds"` | ❌ Wave 0 |
| UX-06 | Failures, timeouts, and 429s render friendly retry copy | integration | `npx playwright test tests/smoke/mobile-check.spec.ts -g "friendly retry states"` | ❌ Wave 0 |
| UX-07 | Result card is readable, high-contrast, and not color-only | integration + manual | `npx playwright test tests/smoke/mobile-check.spec.ts -g "result readability"` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx playwright test tests/smoke/mobile-check.spec.ts --project="Mobile Chrome"`
- **Per wave merge:** `npx playwright test`
- **Phase gate:** Public mobile smoke suite green, plus one manual real-device check for keyboard and bright-light readability before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] Phase 2 execution proof: verify `app/api/check/route.ts`, the typed response contract, and the shared Next.js scaffold actually exist
- [ ] `package.json` and app/test dependencies if the Phase 2 scaffold is still absent
- [ ] `playwright.config.ts` with at least `Mobile Chrome` and `Mobile Safari` projects
- [ ] `tests/smoke/mobile-check.spec.ts` covering valid submit, invalid submit, slow response, timeout, 429, and readability assertions
- [ ] `tests/unit/client/validation.test.ts` for food/A1C parsing and one-decimal validation
- [ ] `lib/client/check.ts` and `lib/client/validation.ts` as explicit non-React seams for testability
- [ ] `npx playwright install` during setup if browsers are not already installed

## Sources

### Primary (HIGH confidence)

- Project docs: `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`
- Approved design doc: `docs/revora-design-20260404-070350.md`
- Phase 2 artifacts: `.planning/phases/02-guardrailed-inference-core-and-eval-harness/02-RESEARCH.md`, `02-01-PLAN.md`, `02-02-PLAN.md`, `02-03-PLAN.md`
- Next.js route handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Next.js route segment config: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
- React `useTransition`: https://react.dev/reference/react/useTransition
- React `useActionState`: https://react.dev/reference/react/useActionState
- MDN `inputmode`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode
- MDN `input type="number"`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number
- MDN `autofocus`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/autofocus
- MDN `enterkeyhint`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/enterkeyhint
- MDN `AbortSignal.timeout()`: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static
- WCAG 2.2 contrast minimum: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- WCAG 2.2 use of color: https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
- WCAG 2.2 target size minimum: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Playwright emulation: https://playwright.dev/docs/emulation

### Secondary (MEDIUM confidence)

- `npm view` registry checks run on 2026-05-06 for `next`, `react`, `tailwindcss`, `openai`, `zod`, `vitest`, `playwright`, and `typescript`

### Tertiary (LOW confidence)

- None material. The main recommendations come from project docs plus official platform documentation.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - local project research, Phase 2 plans, and current official docs all align on a small Next.js App Router app
- Architecture: HIGH - the roadmap, design doc, and Next.js route-handler model point to the same thin-shell pattern
- Pitfalls: MEDIUM - mobile input/readability pitfalls are well supported by MDN and WCAG, but the exact field implementation is still an engineering recommendation rather than a platform requirement

**Research date:** 2026-05-06
**Valid until:** 2026-06-05
