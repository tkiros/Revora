# Photo-Assist Check Input (D5) + Disclaimer Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third check-input method — snap a meal photo → AI drafts an editable description (chips) → user confirms → the confirmed TEXT goes through the existing trusted `/api/check` engine — and close the two disclaimer gaps (`/history`, `/progress`).

**Architecture:** D5 "photo-assist, confirm-before-verdict." The camera never produces a verdict. A new vision extractor (`lib/meal/photo-extract.ts`, modeled 1:1 on the existing `lib/pantry/extract.ts` transcribe-only pattern) turns a photo into a draft `{dish, items[], uncertain flags}`. A new gated route `/api/check/photo-draft` serves it. The client composes the confirmed draft into the existing food textarea (same posture as voice: "the transcript lands in the same textarea; the user reviews, edits, and submits their own words"), then the untouched `/api/check` path decides. Photos are processed in-memory as base64 data URLs and never stored anywhere.

**Tech Stack:** Next.js App Router (nodejs runtime routes), OpenAI Responses API (`gpt-5.4-mini` vision, strict JSON schema, `store: false`), Drizzle/Postgres (schema already permits `'photo'`), Vitest unit tests, Playwright smoke tests.

## Global Constraints

- **The draft never judges.** No risk words, no health commentary, no numbers (no carbs, no GL, no calories) anywhere in extractor output or UI. Verdicts remain exclusively `Clear` / `Be careful` / `Hold off` from the existing engine.
- **Verdict path untouched.** No changes to `lib/revora/service.ts`, `prompt.ts`, `schemas.ts`, `postprocess.ts`, or the `/api/check` decision flow (only an exported const and a one-word `persistCheck` coercion change in `route.ts`).
- **No photo persistence.** No Blob upload, no DB rows, no logging of image data. Base64 in request → model → discarded.
- **Model spend is gated before it happens** (matches existing posture): middleware IP rate-limit + launch pause extended to the new path; trial-mode hard wall for signed-in non-premium users.
- Disclaimer copy is the **verbatim approved ledger row `result-footer`** (docs/safety/copy-ledger.md): `Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you.` Never introduce unapproved variants (e.g. "Revora can make mistakes" is NOT in the ledger — the uncertainty chip copy below goes through the ledger instead).
- Forbidden words (brand): "avoid", "forbidden", "don't eat", "warning", "danger", "our AI".
- Vision model configurable via `REVORA_VISION_MODEL` (default `gpt-5.4-mini`), same env var the pantry extractor already uses.
- Stub seam `MEAL_EXTRACT_STUB=1` (never active when `VERCEL_ENV === "production"`), mirroring `PANTRY_EXTRACT_STUB`.
- All new user-facing strings get rows in `docs/safety/copy-ledger.md` (status Pending until reviewed).
- Commit style: existing repo convention (`feat:`, `fix:`, `test:` prefixes).

---

### Task 1: Meal photo extractor (`lib/meal/photo-extract.ts`)

**Files:**
- Create: `lib/meal/photo-extract.ts`
- Test: `tests/unit/meal/photo-extract.test.ts`

**Interfaces:**
- Consumes: nothing from other tasks. Deliberately imports nothing from `lib/revora/` or `lib/pantry/` (same isolation stance as the pantry extractor).
- Produces (used by Tasks 2, 4, 5):
  ```ts
  export type MealDraftItem = { name: string; portion: string | null; uncertain: boolean };
  export type MealDraft = { dish: string | null; items: MealDraftItem[] };
  export interface MealVisionClient { draftFromPhoto(imageDataUrl: string): Promise<MealDraft>; }
  export function createMealVisionClient(options?: {
    apiKey?: string; model?: string; client?: MealVisionTransport;
  }): MealVisionClient;
  export const MAX_DRAFT_ITEMS = 20;
  export const STUB_DRAFT: MealDraft; // the MEAL_EXTRACT_STUB payload
  ```

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/meal/photo-extract.test.ts
import { describe, expect, it } from "vitest";

import {
  createMealVisionClient,
  MAX_DRAFT_ITEMS,
  STUB_DRAFT,
  type MealVisionTransport
} from "../../../lib/meal/photo-extract";

const DATA_URL = "data:image/jpeg;base64,AAAA";

function fakeTransport(outputText: string | undefined): MealVisionTransport {
  return {
    responses: {
      create: async () => ({ output_text: outputText })
    }
  };
}

describe("createMealVisionClient", () => {
  it("parses a valid draft and clamps items to MAX_DRAFT_ITEMS", async () => {
    const items = Array.from({ length: MAX_DRAFT_ITEMS + 5 }, (_, i) => ({
      name: `item ${i}`,
      portion: null,
      uncertain: false
    }));
    const client = createMealVisionClient({
      apiKey: "test",
      client: fakeTransport(JSON.stringify({ dish: "rice bowl", items }))
    });

    const draft = await client.draftFromPhoto(DATA_URL);

    expect(draft.dish).toBe("rice bowl");
    expect(draft.items).toHaveLength(MAX_DRAFT_ITEMS);
    expect(draft.items[0]).toEqual({ name: "item 0", portion: null, uncertain: false });
  });

  it("throws when output_text is missing", async () => {
    const client = createMealVisionClient({ apiKey: "test", client: fakeTransport(undefined) });
    await expect(client.draftFromPhoto(DATA_URL)).rejects.toThrow(/output_text/);
  });

  it("throws when output_text is not the draft shape", async () => {
    const client = createMealVisionClient({
      apiKey: "test",
      client: fakeTransport(JSON.stringify({ nope: true }))
    });
    await expect(client.draftFromPhoto(DATA_URL)).rejects.toThrow();
  });

  it("returns STUB_DRAFT under MEAL_EXTRACT_STUB=1 outside production", async () => {
    process.env.MEAL_EXTRACT_STUB = "1";
    try {
      const client = createMealVisionClient({ apiKey: "test", client: fakeTransport(undefined) });
      await expect(client.draftFromPhoto(DATA_URL)).resolves.toEqual(STUB_DRAFT);
    } finally {
      delete process.env.MEAL_EXTRACT_STUB;
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/meal/photo-extract.test.ts`
Expected: FAIL — `Cannot find module '../../../lib/meal/photo-extract'`

- [ ] **Step 3: Write the implementation**

```ts
// lib/meal/photo-extract.ts
import OpenAI from "openai";
import { z } from "zod";

/**
 * Vision DRAFTER for the D5 photo-assist check input. It transcribes a meal
 * photo into an editable text draft and does nothing else — it never judges,
 * never advises, never sees the user's A1C. The health verdict happens later
 * in the Revora engine via /api/check on the user-CONFIRMED text (same locked
 * decision as the Pantry extractor, lib/pantry/extract.ts). This module
 * deliberately imports nothing from lib/revora/ or lib/pantry/.
 */

export const DEFAULT_VISION_MODEL = "gpt-5.4-mini";
export const MAX_DRAFT_ITEMS = 20;

export type MealDraftItem = { name: string; portion: string | null; uncertain: boolean };
export type MealDraft = { dish: string | null; items: MealDraftItem[] };

export interface MealVisionClient {
  draftFromPhoto(imageDataUrl: string): Promise<MealDraft>;
}

export type MealVisionTransport = {
  responses: {
    create(params: Record<string, unknown>): Promise<{ output_text?: string }>;
  };
};

const DRAFT_PROMPT = [
  "You are a meal transcriber. Describe the food in this photo of a single",
  "meal or plate so the eater can confirm or correct your draft.",
  "Rules:",
  "- dish: your best short guess at the overall dish name (like \"chicken",
  "  burrito bowl\"); null when the photo is not clearly a meal or dish.",
  "- items: the distinct visible foods/components. Transcribe only what is",
  "  visibly present. Never guess brands, never infer hidden ingredients.",
  "- portion: a rough visible amount only when apparent (like \"1 cup\",",
  "  \"2 slices\"); otherwise null. Never estimate grams, carbs, or calories.",
  "- uncertain: true when you are not confident about that item's identity or",
  "  preparation (for example, a white grain that could be rice or couscous, a",
  "  dressing or sauce you cannot identify, a drink that may be sweetened).",
  "- No advice, no health judgments, no risk words, no numbers other than",
  "  visible portions, no commentary of any kind.",
  "If nothing food-like is clearly identifiable, return dish: null and an",
  "empty items list."
].join("\n");

const draftJsonSchema = {
  type: "object",
  properties: {
    dish: { type: ["string", "null"] },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          portion: { type: ["string", "null"] },
          uncertain: { type: "boolean" }
        },
        required: ["name", "portion", "uncertain"],
        additionalProperties: false
      }
    }
  },
  required: ["dish", "items"],
  additionalProperties: false
} as const;

const MealDraftSchema = z.object({
  dish: z.string().trim().min(1).max(80).nullable(),
  items: z.array(
    z.object({
      name: z.string().trim().min(1).max(80),
      portion: z.string().trim().min(1).max(80).nullable(),
      uncertain: z.boolean()
    })
  )
});

export const STUB_DRAFT: MealDraft = {
  dish: "chicken and rice bowl",
  items: [
    { name: "grilled chicken", portion: null, uncertain: false },
    { name: "white rice", portion: "1 cup", uncertain: true },
    { name: "mixed salad", portion: null, uncertain: false }
  ]
};

export function createMealVisionClient(options?: {
  apiKey?: string;
  model?: string;
  client?: MealVisionTransport;
}): MealVisionClient {
  return {
    async draftFromPhoto(imageDataUrl) {
      // Test/E2E seam — never active in production (same posture as
      // PANTRY_EXTRACT_STUB).
      if (
        process.env.MEAL_EXTRACT_STUB === "1" &&
        process.env.VERCEL_ENV !== "production"
      ) {
        return STUB_DRAFT;
      }

      const model =
        options?.model ?? process.env.REVORA_VISION_MODEL ?? DEFAULT_VISION_MODEL;
      const transport =
        options?.client ?? createTransport(options?.apiKey ?? process.env.OPENAI_API_KEY);

      const response = await transport.responses.create({
        model,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: DRAFT_PROMPT },
              { type: "input_image", image_url: imageDataUrl, detail: "auto" }
            ]
          }
        ],
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: "meal_photo_draft",
            schema: draftJsonSchema,
            strict: true
          }
        }
      });

      const outputText = response.output_text?.trim();
      if (!outputText) {
        throw new Error("Meal photo draft returned no output_text.");
      }

      const parsed = MealDraftSchema.parse(JSON.parse(outputText));
      return { dish: parsed.dish, items: parsed.items.slice(0, MAX_DRAFT_ITEMS) };
    }
  };
}

function createTransport(apiKey: string | undefined): MealVisionTransport {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for meal photo drafts.");
  }
  // 25s: vision is slower than the text judge but this is an interactive
  // request (user is watching a spinner) — well under the route's maxDuration
  // (Task 3) and far under the pantry batch budget. maxRetries 0 — one paid
  // attempt; the user can retake.
  return new OpenAI({ apiKey, timeout: 25_000, maxRetries: 0 });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/meal/photo-extract.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/meal/photo-extract.ts tests/unit/meal/photo-extract.test.ts
git commit -m "feat: meal photo vision drafter (D5 transcribe-only, no judgments)"
```

---

### Task 2: Live extraction-quality eval — the go/no-go gate

**Files:**
- Create: `tests/evals/meal-photo-eval.test.ts`
- Create: `tests/fixtures/meal-photos/labels.json` (+ founder's own meal photos in the same dir)
- Modify: `package.json` (scripts block, after line 12 `"eval:pantry-extract"`)

**Interfaces:**
- Consumes: `createMealVisionClient` from Task 1.
- Produces: a pass/fail quality bar. **This is the go/no-go gate for the rest of the plan:** if drafts on real photos are unusable, stop before building UI.

- [ ] **Step 1: Collect fixtures**

Take 20–30 phone photos of real meals (home plates, restaurant, takeout, mixed cuisines — include 3–4 hard cases: sauces, stews, mixed bowls). Save as `tests/fixtures/meal-photos/meal-01.jpg` … Create `labels.json` listing every clearly visible component per photo (mirror `tests/fixtures/pantry-photos/labels.json` format):

```json
{
  "meal-01.jpg": ["grilled chicken", "white rice", "salad"],
  "meal-02.jpg": ["spaghetti", "tomato sauce", "parmesan"]
}
```

- [ ] **Step 2: Write the eval (mirrors `tests/evals/pantry-extract-eval.test.ts`)**

```ts
// tests/evals/meal-photo-eval.test.ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { createMealVisionClient } from "../../lib/meal/photo-extract";
import { normalizeItemName } from "../../lib/pantry/extract";

/**
 * Live draft-quality gate for the D5 photo-assist input (go/no-go for the
 * feature): recall >= 0.70 across all labeled photos, hallucinations == 0
 * among NON-uncertain items (an uncertain:true item that matches no label is
 * the model correctly flagging its own doubt — that is the design working).
 */
const FIXTURES = path.join(process.cwd(), "tests/fixtures/meal-photos");
const READY = fs.existsSync(path.join(FIXTURES, "labels.json")) && !!process.env.OPENAI_API_KEY;

function toDataUrl(file: string): string {
  const buffer = fs.readFileSync(path.join(FIXTURES, file));
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

function matches(label: string, extracted: string): boolean {
  const a = normalizeItemName(label);
  const b = normalizeItemName(extracted);
  return a.includes(b) || b.includes(a);
}

describe.skipIf(!READY)("eval:meal-photo (live)", () => {
  it("meets recall >= 0.70 with zero confident hallucinations", async () => {
    const labels: Record<string, string[]> = JSON.parse(
      fs.readFileSync(path.join(FIXTURES, "labels.json"), "utf8")
    );
    const client = createMealVisionClient();

    let found = 0;
    let expected = 0;
    let confidentHallucinations = 0;

    for (const [file, labelList] of Object.entries(labels)) {
      const draft = await client.draftFromPhoto(toDataUrl(file));
      expected += labelList.length;
      for (const label of labelList) {
        if (draft.items.some((item) => matches(label, item.name))) found += 1;
      }
      for (const item of draft.items) {
        if (!item.uncertain && !labelList.some((label) => matches(label, item.name))) {
          confidentHallucinations += 1;
          console.error(`confident hallucination in ${file}: "${item.name}"`);
        }
      }
    }

    console.log(`meal-photo eval: recall ${(found / expected).toFixed(2)}, confident hallucinations ${confidentHallucinations}`);
    expect(found / expected).toBeGreaterThanOrEqual(0.7);
    expect(confidentHallucinations).toBe(0);
  }, 600_000);
});
```

- [ ] **Step 3: Add the script to `package.json`** (after the `"eval:pantry-extract"` line):

```json
    "eval:meal-photo": "vitest run tests/evals/meal-photo-eval.test.ts",
```

- [ ] **Step 4: Run the eval live**

Run: `OPENAI_API_KEY=... npm run eval:meal-photo`
Expected: PASS with logged recall ≥ 0.70 and 0 confident hallucinations.

**GO/NO-GO:** If it fails after one round of `DRAFT_PROMPT` iteration (adjust wording in Task 1, re-run), STOP the plan and report findings — do not build UI on a drafter users will always have to correct.

- [ ] **Step 5: Commit**

```bash
git add tests/evals/meal-photo-eval.test.ts tests/fixtures/meal-photos package.json
git commit -m "test: live meal-photo draft quality eval (go/no-go gate)"
```

---

### Task 3: `/api/check/photo-draft` route + middleware extension

**Files:**
- Create: `app/api/check/photo-draft/route.ts`
- Modify: `app/api/check/route.ts:62-63` (export `TRIAL_WALL_MESSAGE`)
- Modify: `middleware.ts:74-77` (path match) and `middleware.ts:126` (matcher)
- Test: `tests/unit/api/photo-draft-route.test.ts`

**Interfaces:**
- Consumes: `createMealVisionClient`, `type MealVisionClient`, `type MealDraft` (Task 1); existing `getSessionInfo`, `getEntitlement`, `paywallMode`, `loadSafetyContract`, `captureServerError`, `getDb`.
- Produces (used by Task 4's client):
  - `POST /api/check/photo-draft` body `{ image: string }` (data URL, jpeg/png/webp, ≤ 4,500,000 chars).
  - `200 → { kind: "draft", dish: string | null, items: MealDraftItem[] }`
  - `400 → { kind: "invalid" }` · `402 → { kind: "upsell", message, disclaimer }` (trial wall) · `429/503` from middleware (same bodies as `/api/check`).
  - `export function createPhotoDraftHandler(deps?: PhotoDraftDeps)` for tests.

- [ ] **Step 1: Export the wall message from the check route**

In `app/api/check/route.ts` line 62, change `const TRIAL_WALL_MESSAGE =` to `export const TRIAL_WALL_MESSAGE =`.

- [ ] **Step 2: Write the failing route test**

```ts
// tests/unit/api/photo-draft-route.test.ts
import { describe, expect, it } from "vitest";

import { createPhotoDraftHandler } from "../../../app/api/check/photo-draft/route";
import { STUB_DRAFT } from "../../../lib/meal/photo-extract";

const GOOD_BODY = JSON.stringify({ image: "data:image/jpeg;base64,AAAA" });

function post(body: string) {
  return new Request("http://localhost/api/check/photo-draft", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body
  });
}

const visionOk = { draftFromPhoto: async () => STUB_DRAFT };

describe("POST /api/check/photo-draft", () => {
  it("returns the draft for a valid image (guest)", async () => {
    const handler = createPhotoDraftHandler({
      vision: () => visionOk,
      getSession: async () => null,
      paywallMode: () => "legacy"
    });
    const response = await handler(post(GOOD_BODY));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ kind: "draft", ...STUB_DRAFT });
  });

  it("rejects a non-image payload with 400 and no model call", async () => {
    let called = 0;
    const handler = createPhotoDraftHandler({
      vision: () => ({ draftFromPhoto: async () => ((called += 1), STUB_DRAFT) }),
      getSession: async () => null,
      paywallMode: () => "legacy"
    });
    const response = await handler(post(JSON.stringify({ image: "data:text/html;base64,AAAA" })));
    expect(response.status).toBe(400);
    expect(called).toBe(0);
  });

  it("rejects an oversized image with 400 and no model call", async () => {
    let called = 0;
    const handler = createPhotoDraftHandler({
      vision: () => ({ draftFromPhoto: async () => ((called += 1), STUB_DRAFT) }),
      getSession: async () => null,
      paywallMode: () => "legacy"
    });
    const oversized = `data:image/jpeg;base64,${"A".repeat(4_500_001)}`;
    const response = await handler(post(JSON.stringify({ image: oversized })));
    expect(response.status).toBe(400);
    expect(called).toBe(0);
  });

  it("walls a signed-in non-premium user in trial mode BEFORE model spend", async () => {
    let called = 0;
    const handler = createPhotoDraftHandler({
      vision: () => ({ draftFromPhoto: async () => ((called += 1), STUB_DRAFT) }),
      getSession: async () => ({ userId: "u1", email: "t@example.com" } as never),
      getEntitlementImpl: async () => ({ tier: "free" }) as never,
      paywallMode: () => "trial"
    });
    const response = await handler(post(GOOD_BODY));
    expect(response.status).toBe(402);
    expect((await response.json()).kind).toBe("upsell");
    expect(called).toBe(0);
  });

  it("returns a calm 502 retry body when the model call throws", async () => {
    const handler = createPhotoDraftHandler({
      vision: () => ({ draftFromPhoto: async () => { throw new Error("boom"); } }),
      getSession: async () => null,
      paywallMode: () => "legacy"
    });
    const response = await handler(post(GOOD_BODY));
    expect(response.status).toBe(502);
    expect((await response.json()).kind).toBe("retry");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/api/photo-draft-route.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Write the route**

```ts
// app/api/check/photo-draft/route.ts
import { NextResponse } from "next/server";

import {
  createMealVisionClient,
  type MealVisionClient
} from "../../../../lib/meal/photo-extract";
import { loadSafetyContract } from "../../../../lib/revora/safety-contract";
import { captureServerError } from "../../../../lib/revora/sentry-capture";
import { getDb, type Db } from "../../../../lib/server/db";
import { getEntitlement } from "../../../../lib/server/entitlement";
import { fetchPlaySubscription } from "../../../../lib/server/play-api";
import { paywallMode } from "../../../../lib/server/pricing";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";
import { TRIAL_WALL_MESSAGE } from "../route";

export const runtime = "nodejs";
// Vision is slower than the text judge; 30s sits above the extractor's 25s
// OpenAI timeout so a slow call is cut by the SDK, not the platform. Same OPS
// caveat as /api/check maxDuration: verify against the active Vercel plan.
export const maxDuration = 30;

// ~3.3MB of image after base64 — far above the client's ≤1024px JPEG
// (Task 4, typically <300KB) but under Vercel's ~4.5MB body ceiling.
const MAX_IMAGE_DATA_URL_CHARS = 4_500_000;
const IMAGE_PREFIX = /^data:image\/(jpeg|png|webp);base64,/;

const RETRY_MESSAGE =
  "The photo didn't come through this time. You can retake it, or just type or dictate the meal instead.";

type PhotoDraftDeps = {
  vision?: () => MealVisionClient;
  db?: () => Db;
  getSession?: () => Promise<SessionInfo | null>;
  getEntitlementImpl?: typeof getEntitlement;
  playLookup?: typeof fetchPlaySubscription;
  paywallMode?: () => "legacy" | "trial";
};

let vision: MealVisionClient | null = null;

function getVisionClient() {
  vision ??= createMealVisionClient();
  return vision;
}

export function createPhotoDraftHandler(deps: PhotoDraftDeps = {}) {
  const visionFactory = deps.vision ?? getVisionClient;
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const getEntitlementImpl = deps.getEntitlementImpl ?? getEntitlement;
  const playLookup = deps.playLookup ?? fetchPlaySubscription;
  const paywallModeDep = deps.paywallMode ?? (() => paywallMode());

  return async function POST(request: Request) {
    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }

    const image =
      body && typeof body === "object" && "image" in body
        ? (body as { image: unknown }).image
        : null;

    if (
      typeof image !== "string" ||
      image.length > MAX_IMAGE_DATA_URL_CHARS ||
      !IMAGE_PREFIX.test(image)
    ) {
      return NextResponse.json({ kind: "invalid" }, { status: 400 });
    }

    // Trial-mode hard wall, mirrored from /api/check: a signed-in user without
    // an active entitlement never triggers model spend. Guests pass (the
    // middleware IP rate limit + global cap is their gate, exactly as for
    // /api/check). Fail-open on lookup errors — metering must never take the
    // product down.
    try {
      const session = await getSession();
      if (session && paywallModeDep() === "trial") {
        const entitlement = await getEntitlementImpl(db(), session.userId, {
          refreshPlaySubscription: (token) => playLookup(token)
        });
        if (entitlement.tier !== "premium") {
          return NextResponse.json(
            {
              kind: "upsell",
              message: TRIAL_WALL_MESSAGE,
              disclaimer: loadSafetyContract().copy.disclaimer
            },
            { status: 402 }
          );
        }
      }
    } catch (error) {
      await captureServerError(error, "route");
    }

    try {
      const draft = await visionFactory().draftFromPhoto(image);
      // The image string goes out of scope here — never stored, never logged.
      return NextResponse.json({ kind: "draft", ...draft });
    } catch (error) {
      await captureServerError(error, "route");
      return NextResponse.json(
        { kind: "retry", message: RETRY_MESSAGE },
        { status: 502 }
      );
    }
  };
}

export const POST = createPhotoDraftHandler();
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/api/photo-draft-route.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 6: Extend the middleware to cover the new path**

In `middleware.ts`:
- Line ~75, change the guard from `if (pathname !== CHECK_PATH || request.method !== "POST")` to:

```ts
  if (!pathname.startsWith(CHECK_PATH) || request.method !== "POST") {
```

- Line 126, change the matcher to:

```ts
export const config = { matcher: ["/api/check", "/api/check/photo-draft"] };
```

- Update the file's header comment first line to `Intercepts POST /api/check and /api/check/photo-draft and runs, in order, BEFORE any model spend:`.

- [ ] **Step 7: Run the full unit suite to catch middleware/route regressions**

Run: `npm run test`
Expected: PASS (all existing tests still green)

- [ ] **Step 8: Commit**

```bash
git add app/api/check/photo-draft/route.ts app/api/check/route.ts middleware.ts tests/unit/api/photo-draft-route.test.ts
git commit -m "feat: gated /api/check/photo-draft route (rate-limited, trial-walled, no photo persistence)"
```

---

### Task 4: Client — photo capture, downscale, chips review, textarea handoff

**Files:**
- Create: `lib/client/image.ts`
- Create: `lib/client/photo-draft.ts`
- Create: `components/photo-input-button.tsx`
- Create: `components/photo-draft-review.tsx`
- Modify: `components/food-check-form.tsx` (lines 53, 217-231, 251-278 region)
- Modify: `app/globals.css` (append chip styles)
- Test: `tests/unit/client/photo-draft.test.ts`

**Interfaces:**
- Consumes: `POST /api/check/photo-draft` (Task 3 contract); `MealDraft`/`MealDraftItem` types (Task 1, type-only import is fine client-side); existing `shouldGateSubmit`, `tasterStore`, `track`.
- Produces:
  ```ts
  // lib/client/image.ts
  export async function fileToDataUrl(file: File, maxEdgePx?: number): Promise<string>; // canvas downscale → JPEG data URL
  export function targetDimensions(w: number, h: number, maxEdge: number): { width: number; height: number }; // pure, tested
  // lib/client/photo-draft.ts
  export async function requestPhotoDraft(imageDataUrl: string): Promise<PhotoDraftResult>;
  export type PhotoDraftResult =
    | { kind: "draft"; dish: string | null; items: MealDraftItem[] }
    | { kind: "upsell"; message: string }
    | { kind: "error"; message: string };
  export function composeDraftText(dish: string | null, items: MealDraftItem[]): string; // pure, tested
  ```
- UX contract (mirrors voice, §6.2): the confirmed draft **lands in the same food textarea**; the user reviews, edits, and submits through the untouched form path with `inputMethod === "photo"`.

- [ ] **Step 1: Write failing tests for the pure helpers**

```ts
// tests/unit/client/photo-draft.test.ts
import { describe, expect, it } from "vitest";

import { targetDimensions } from "../../../lib/client/image";
import { composeDraftText } from "../../../lib/client/photo-draft";

describe("targetDimensions", () => {
  it("caps the long edge and keeps aspect ratio", () => {
    expect(targetDimensions(4000, 3000, 1024)).toEqual({ width: 1024, height: 768 });
    expect(targetDimensions(3000, 4000, 1024)).toEqual({ width: 768, height: 1024 });
  });
  it("never upscales", () => {
    expect(targetDimensions(800, 600, 1024)).toEqual({ width: 800, height: 600 });
  });
});

describe("composeDraftText", () => {
  it("joins dish and items with visible portions", () => {
    expect(
      composeDraftText("chicken bowl", [
        { name: "grilled chicken", portion: null, uncertain: false },
        { name: "white rice", portion: "1 cup", uncertain: false }
      ])
    ).toBe("chicken bowl: grilled chicken, white rice (1 cup)");
  });
  it("works without a dish and without items", () => {
    expect(
      composeDraftText(null, [{ name: "apple", portion: null, uncertain: false }])
    ).toBe("apple");
    expect(composeDraftText("soup", [])).toBe("soup");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/client/photo-draft.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the two client libs**

```ts
// lib/client/image.ts
const DEFAULT_MAX_EDGE = 1024;
const JPEG_QUALITY = 0.8;

export function targetDimensions(
  width: number,
  height: number,
  maxEdge: number
): { width: number; height: number } {
  const longEdge = Math.max(width, height);
  if (longEdge <= maxEdge) {
    return { width, height };
  }
  const scale = maxEdge / longEdge;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** Downscale a camera File to a JPEG data URL (≤ maxEdgePx on the long edge).
 *  Keeps request bodies small and vision token cost bounded. Browser-only. */
export async function fileToDataUrl(
  file: File,
  maxEdgePx: number = DEFAULT_MAX_EDGE
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = targetDimensions(bitmap.width, bitmap.height, maxEdgePx);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas 2D context unavailable.");
    }
    context.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
```

```ts
// lib/client/photo-draft.ts
import type { MealDraftItem } from "../meal/photo-extract";

export type PhotoDraftResult =
  | { kind: "draft"; dish: string | null; items: MealDraftItem[] }
  | { kind: "upsell"; message: string }
  | { kind: "error"; message: string };

const GENERIC_ERROR =
  "The photo didn't come through this time. You can retake it, or just type or dictate the meal instead.";

export function composeDraftText(
  dish: string | null,
  items: MealDraftItem[]
): string {
  const list = items
    .map((item) => (item.portion ? `${item.name} (${item.portion})` : item.name))
    .join(", ");
  if (dish && list) return `${dish}: ${list}`;
  return dish ?? list;
}

export async function requestPhotoDraft(
  imageDataUrl: string
): Promise<PhotoDraftResult> {
  let response: Response;
  try {
    response = await fetch("/api/check/photo-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageDataUrl }),
      signal: AbortSignal.timeout(30_000)
    });
  } catch {
    return { kind: "error", message: GENERIC_ERROR };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { kind: "error", message: GENERIC_ERROR };
  }
  const body = (payload ?? {}) as Record<string, unknown>;

  if (response.status === 402 && typeof body.message === "string") {
    return { kind: "upsell", message: body.message };
  }
  if (
    response.ok &&
    body.kind === "draft" &&
    Array.isArray(body.items)
  ) {
    return {
      kind: "draft",
      dish: typeof body.dish === "string" ? body.dish : null,
      items: (body.items as MealDraftItem[]).filter(
        (item) => typeof item?.name === "string"
      )
    };
  }
  return {
    kind: "error",
    message: typeof body.message === "string" ? body.message : GENERIC_ERROR
  };
}
```

- [ ] **Step 4: Run helper tests to verify they pass**

Run: `npx vitest run tests/unit/client/photo-draft.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Build the two components**

```tsx
// components/photo-input-button.tsx
"use client";

import { useRef, useState } from "react";

import { fileToDataUrl } from "../lib/client/image";
import { requestPhotoDraft, type PhotoDraftResult } from "../lib/client/photo-draft";

/** D5 photo-assist entry point. Native capture input — no camera library.
 *  The result is a DRAFT the user must review (photo-draft-review.tsx);
 *  this component never touches the verdict path. */
export function PhotoInputButton({
  onDraft,
  onBlocked,
  disabled
}: {
  onDraft: (result: PhotoDraftResult) => void;
  onBlocked: () => void; // trial-mode taster wall — parent redirects
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setIsDrafting(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      onDraft(await requestPhotoDraft(dataUrl));
    } catch {
      onDraft({
        kind: "error",
        message:
          "That photo couldn't be read. You can retake it, or just type or dictate the meal instead."
      });
    } finally {
      setIsDrafting(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        data-testid="photo-file-input"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <button
        type="button"
        className="secondary-button"
        data-testid="photo-input-button"
        disabled={disabled || isDrafting}
        onClick={() => {
          if (disabled || isDrafting) return;
          onBlocked(); // parent decides: gate → redirect, else it calls open()
        }}
      >
        {isDrafting ? "Reading your photo..." : "Snap a photo instead"}
      </button>
    </>
  );
}
```

*(Wiring note for the implementer: expose the file-input open via a prop callback rather than the onBlocked overload above — concretely, give the component an `onRequestOpen?: () => boolean` prop: the parent returns `false` when `shouldGateSubmit(mode, tasterStore.status())` is true (and does `window.location.assign("/subscribe")` itself, mirroring `handleSubmit` at `food-check-form.tsx:115`), `true` to proceed, and the button opens `inputRef.current?.click()` only on `true`. Keep whichever shape is cleanest, but the gate MUST run before the file picker opens so a walled taster never spends a draft call.)*

```tsx
// components/photo-draft-review.tsx
"use client";

import { useState } from "react";

import type { MealDraftItem } from "../lib/meal/photo-extract";
import { composeDraftText } from "../lib/client/photo-draft";

/** D5 confirm-before-verdict review card. Uncertain chips must be tapped
 *  (confirm) or removed before the draft can be used — no blanket accept of
 *  flagged doubts. Confirming composes plain text into the food textarea;
 *  the existing form and engine take it from there. */
export function PhotoDraftReview({
  dish,
  items,
  onConfirm,
  onDiscard
}: {
  dish: string | null;
  items: MealDraftItem[];
  onConfirm: (text: string) => void;
  onDiscard: () => void;
}) {
  const [draftDish, setDraftDish] = useState(dish ?? "");
  const [draftItems, setDraftItems] = useState<MealDraftItem[]>(items);
  const [newItem, setNewItem] = useState("");

  const unresolved = draftItems.filter((item) => item.uncertain).length;
  const isEmpty = draftDish.trim() === "" && draftItems.length === 0;

  return (
    <section className="draft-card" data-testid="photo-draft-review">
      <p className="result-eyebrow">Check the draft</p>
      <p className="field-hint">
        This is Revora&apos;s best guess from your photo. Fix anything that&apos;s
        off — tap the highlighted items to confirm them.
      </p>
      <label htmlFor="draft-dish" className="field-label">
        Dish
      </label>
      <input
        id="draft-dish"
        className="text-input"
        value={draftDish}
        placeholder="What is this meal?"
        onChange={(event) => setDraftDish(event.target.value)}
      />
      <ul className="chip-list">
        {draftItems.map((item, index) => (
          <li
            key={`${item.name}-${index}`}
            className={item.uncertain ? "chip chip-uncertain" : "chip"}
            data-testid={item.uncertain ? "chip-uncertain" : "chip"}
          >
            <button
              type="button"
              className="chip-label"
              title={item.uncertain ? "Tap to confirm this item" : undefined}
              onClick={() =>
                setDraftItems((current) =>
                  current.map((entry, i) =>
                    i === index ? { ...entry, uncertain: false } : entry
                  )
                )
              }
            >
              {item.portion ? `${item.name} (${item.portion})` : item.name}
              {item.uncertain ? " — not sure, tap to confirm" : ""}
            </button>
            <button
              type="button"
              className="chip-remove"
              aria-label={`Remove ${item.name}`}
              onClick={() =>
                setDraftItems((current) => current.filter((_, i) => i !== index))
              }
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="chip-add-row">
        <input
          className="text-input"
          value={newItem}
          placeholder="Add something it missed"
          onChange={(event) => setNewItem(event.target.value)}
        />
        <button
          type="button"
          className="secondary-button"
          disabled={newItem.trim() === ""}
          onClick={() => {
            setDraftItems((current) => [
              ...current,
              { name: newItem.trim(), portion: null, uncertain: false }
            ]);
            setNewItem("");
          }}
        >
          Add
        </button>
      </div>
      <button
        type="button"
        className="primary-button"
        data-testid="draft-confirm-button"
        disabled={unresolved > 0 || isEmpty}
        onClick={() =>
          onConfirm(composeDraftText(draftDish.trim() || null, draftItems))
        }
      >
        {unresolved > 0
          ? `Confirm ${unresolved} highlighted item${unresolved === 1 ? "" : "s"} first`
          : "Use this description"}
      </button>
      <button type="button" className="link-button-plain" onClick={onDiscard}>
        Discard and type instead
      </button>
    </section>
  );
}
```

- [ ] **Step 6: Wire into `components/food-check-form.tsx`**

Changes (keep every existing behavior intact):
1. Line 53: `useState<"text" | "voice" | "photo">("text")`.
2. Add state: `const [photoDraft, setPhotoDraft] = useState<{ dish: string | null; items: MealDraftItem[] } | null>(null);` and `const [photoNotice, setPhotoNotice] = useState<string | null>(null);`
3. Below the `VoiceInputButton` (line 274-277), render `PhotoInputButton` with:
   - open-gate callback mirroring `handleSubmit`'s taster gate (`shouldGateSubmit(mode, tasterStore.status())` → `window.location.assign("/subscribe")`, return false);
   - `onDraft`: `draft` → `setPhotoDraft({dish, items})`, `track({ name: "photo_draft", props: { items: items.length, uncertain: items.filter(i => i.uncertain).length } })`; `upsell` → `window.location.assign("/subscribe")`; `error` → `setPhotoNotice(message)`.
4. Render `photoNotice` as a `field-hint` line when set; clear it on any input change.
5. When `photoDraft` is set, render `<PhotoDraftReview dish={...} items={...} onConfirm={(text) => { handleChange("food", text); setInputMethod("photo"); setPhotoDraft(null); }} onDiscard={() => setPhotoDraft(null)} />` directly under the food field.
6. Extend `handleTypedFoodChange` comment/behavior: an emptied field still resets to `"text"` (existing line 228-230 already does this — photo behaves exactly like voice here, no code change needed beyond the type).

- [ ] **Step 7: Append chip styles to `app/globals.css`** (match existing custom-property palette; amber highlight for `.chip-uncertain`; `.draft-card` mirrors `.result-card` spacing). Follow the visual language of `.result-card`/`.field-hint` — no new colors outside the existing tokens except one amber for uncertainty.

- [ ] **Step 8: Type-check and full unit suite**

Run: `npx tsc --noEmit && npm run test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add lib/client/image.ts lib/client/photo-draft.ts components/photo-input-button.tsx components/photo-draft-review.tsx components/food-check-form.tsx app/globals.css tests/unit/client/photo-draft.test.ts
git commit -m "feat: photo-assist check input — draft chips, confirm-before-verdict (D5)"
```

---

### Task 5: `inputMethod: "photo"` plumbing (client → server → history)

**Files:**
- Modify: `lib/client/check.ts` (`submitCheck` init type, ~line 55)
- Modify: `lib/client/history-store.ts:17`
- Modify: `app/api/check/route.ts:233-245` (`persistCheck` coercion)
- Test: extend the existing check-route unit test file (find it: `grep -rl "persistCheck\|createCheckRouteHandler" tests/unit`) with one persistence case; if none tests persistCheck, add the assertion to `tests/unit/api/photo-draft-route.test.ts`'s sibling new test file `tests/unit/api/check-input-method.test.ts`.

**Interfaces:**
- Consumes: nothing new.
- Produces: `submitCheck(input, { inputMethod: "text" | "voice" | "photo" })`; DB rows persist `input_method = 'photo'` (constraint at `lib/server/db/schema.ts:123` already allows it — no migration needed).

- [ ] **Step 1: Widen the client types**

In `lib/client/check.ts` change `inputMethod?: "text" | "voice";` to `inputMethod?: "text" | "voice" | "photo";`.
In `lib/client/history-store.ts:17` change `inputMethod: "text" | "voice";` to `inputMethod: "text" | "voice" | "photo";`.

- [ ] **Step 2: Fix the server coercion (currently silently rewrites photo→text)**

In `app/api/check/route.ts` `persistCheck` (line ~244), change:

```ts
      inputMethod: methodHeader === "voice" ? "voice" : "text",
```

to:

```ts
      inputMethod:
        methodHeader === "voice" || methodHeader === "photo"
          ? methodHeader
          : "text",
```

- [ ] **Step 3: Write the test**

```ts
// tests/unit/api/check-input-method.test.ts
import { describe, expect, it } from "vitest";

// Test through the exported handler with injected deps (pattern used across
// tests/unit/api): a fake db captures the inserted row; assert the
// x-revora-input-method: photo header persists as inputMethod "photo", and an
// unknown header value falls back to "text".
```

Follow the existing check-route test file's fake-db/deps pattern exactly (find it via `grep -rl "createCheckRouteHandler" tests/`); assert `values()` received `inputMethod: "photo"` for header `photo`, and `"text"` for header `gibberish`.

- [ ] **Step 4: Run**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/client/check.ts lib/client/history-store.ts app/api/check/route.ts tests/unit/api/check-input-method.test.ts
git commit -m "feat: persist input_method=photo end to end (schema already allowed it)"
```

---

### Task 6: Disclaimer coverage — shared component + `/history` + `/progress`

**Files:**
- Create: `components/disclaimer-line.tsx`
- Modify: `components/result-card.tsx:52-61` (replace local `DisclaimerLine`)
- Modify: `components/demo-check-card.tsx:32-36` (use shared component)
- Modify: `app/history/page.tsx` (page footer region — before `<footer className="page-footer">`)
- Modify: `app/progress/page.tsx` (same position)
- Test: `tests/unit/components/disclaimer-line.test.ts` (string export only — no component harness exists in this repo)

**Context for the implementer:** the approved disclaimer ALREADY renders on every check result (all response kinds in `result-card.tsx`, demo page, pantry report `app/report/[id]/page.tsx:137`). The gaps are the two pages that display past results/aggregates: `/history` and `/progress`. Copy is governed: use the ledger row `result-footer` VERBATIM (docs/safety/copy-ledger.md line 31); `docs/safety/claims-boundary.md:47` mandates "one result-footer disclaimer across active result surfaces."

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/components/disclaimer-line.test.ts
import { describe, expect, it } from "vitest";

import { RESULT_FOOTER_DISCLAIMER } from "../../../components/disclaimer-line";

describe("RESULT_FOOTER_DISCLAIMER", () => {
  it("is the verbatim approved copy-ledger result-footer row", () => {
    expect(RESULT_FOOTER_DISCLAIMER).toBe(
      "Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you."
    );
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/components/disclaimer-line.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the shared component**

```tsx
// components/disclaimer-line.tsx
import Link from "next/link";

// Verbatim `result-footer` ledger row (docs/safety/copy-ledger.md) — the one
// stable disclaimer across active result surfaces (claims-boundary.md §"one
// result-footer disclaimer"). Server responses carry their own copy of this
// string; static pages import the constant.
export const RESULT_FOOTER_DISCLAIMER =
  "Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you.";

export function DisclaimerLine({
  disclaimer = RESULT_FOOTER_DISCLAIMER
}: {
  disclaimer?: string;
}) {
  return (
    <p className="result-disclaimer">
      {disclaimer}{" "}
      <Link className="result-disclaimer-link" href="/privacy">
        Privacy
      </Link>
    </p>
  );
}
```

- [ ] **Step 4: Swap the duplicates and add the two page footers**

1. `components/result-card.tsx`: delete the local `DisclaimerLine` function (lines 52-61), add `import { DisclaimerLine } from "./disclaimer-line";` — all call sites keep passing `disclaimer={response.disclaimer}` (server string remains the source of truth on live results).
2. `components/demo-check-card.tsx`: replace its inline disclaimer `<p>` (lines 32-36) with `<DisclaimerLine />`.
3. `app/history/page.tsx`: immediately before `<footer className="page-footer">`, add `<DisclaimerLine />` (import it).
4. `app/progress/page.tsx`: same insertion, same position.

- [ ] **Step 5: Run tests + typecheck; eyeball both pages**

Run: `npx vitest run tests/unit/components/disclaimer-line.test.ts && npx tsc --noEmit && npm run test`
Expected: PASS. Then `npm run dev`, open `/history` and `/progress`, confirm the line renders above the footer on both.

- [ ] **Step 6: Commit**

```bash
git add components/disclaimer-line.tsx components/result-card.tsx components/demo-check-card.tsx app/history/page.tsx app/progress/page.tsx tests/unit/components/disclaimer-line.test.ts
git commit -m "feat: shared result-footer disclaimer; close /history and /progress gaps"
```

---

### Task 7: Copy ledger, privacy page, env docs

**Files:**
- Modify: `docs/safety/copy-ledger.md` (append rows)
- Modify: `app/privacy/page.tsx` (photos section — it already discusses pantry photos; add the meal-photo sentence beside it)
- Modify: `.env.example` (document `MEAL_EXTRACT_STUB`; confirm `REVORA_VISION_MODEL` is already documented — it is used by `lib/pantry/extract.ts:98`)

- [ ] **Step 1: Append to the copy ledger** (status Pending until human review — do not mark Approved):

| id | Surface | Status | copy |
|---|---|---|---|
| `photo-draft-hint` | Photo draft review card | Pending | This is Revora's best guess from your photo. Fix anything that's off — tap the highlighted items to confirm them. |
| `photo-draft-uncertain` | Uncertain chip suffix | Pending | — not sure, tap to confirm |
| `photo-draft-retry` | Photo draft failure | Pending | The photo didn't come through this time. You can retake it, or just type or dictate the meal instead. |
| `photo-input-button` | Check form | Pending | Snap a photo instead |

(Use the file's actual column format — open it and mirror row 31's columns, citing FDA-GENERAL-WELLNESS/FTC-HEALTH-COMPLIANCE notes: the draft copy makes no claims, shows no numbers, and flags model uncertainty honestly.)

- [ ] **Step 2: Privacy page** — in the section that covers pantry photos, add one sentence (adapt to surrounding voice):

> Meal photos you snap for a check are processed in memory to draft your description and are never stored — not on our servers, not in your history. Only the text you confirm is checked and (when you're signed in) saved.

- [ ] **Step 3: `.env.example`** — under the existing pantry/vision entries add:

```bash
# Meal photo draft (D5): serve a fixed stub draft in tests/E2E. Never active in production.
# MEAL_EXTRACT_STUB=1
```

- [ ] **Step 4: Commit**

```bash
git add docs/safety/copy-ledger.md app/privacy/page.tsx .env.example
git commit -m "docs: ledger rows, privacy note, env docs for photo-assist input"
```

---

### Task 8: Playwright smoke test (stubbed end-to-end)

**Files:**
- Create: `tests/smoke/photo-check.spec.ts`
- Create: `tests/fixtures/meal-photos/smoke-meal.jpg` (any small JPEG; reuse one eval fixture)
- Modify: `playwright.config.ts` ONLY if the webServer env block doesn't already pass through custom env — set `MEAL_EXTRACT_STUB=1` the same way existing smoke specs stub the engine (inspect `tests/smoke/mobile-check.spec.ts` and the config first; mirror exactly).

**Interfaces:**
- Consumes: `STUB_DRAFT` (Task 1) — the stub has one `uncertain: true` item ("white rice"), which lets the smoke assert the confirm-gate.

- [ ] **Step 1: Write the spec**

```ts
// tests/smoke/photo-check.spec.ts
import path from "node:path";
import { expect, test } from "@playwright/test";

// Requires MEAL_EXTRACT_STUB=1 on the web server (see playwright config /
// existing engine-stub pattern). Covers: photo → draft chips → uncertain item
// must be confirmed → confirmed text lands in the textarea with
// data-input-method="photo". The verdict submit itself is covered by
// mobile-check.spec.ts — this spec stops at the composed textarea.
test("photo draft flows into the food textarea after confirmation", async ({ page }) => {
  await page.goto("/");

  await page
    .getByTestId("photo-file-input")
    .setInputFiles(path.join(__dirname, "../fixtures/meal-photos/smoke-meal.jpg"));

  const review = page.getByTestId("photo-draft-review");
  await expect(review).toBeVisible();

  // Confirm button is gated while an uncertain chip remains.
  const confirm = page.getByTestId("draft-confirm-button");
  await expect(confirm).toBeDisabled();

  await page.getByTestId("chip-uncertain").getByRole("button").first().click();
  await expect(confirm).toBeEnabled();
  await confirm.click();

  const textarea = page.locator("#food");
  await expect(textarea).toHaveValue(/chicken and rice bowl: .*white rice \(1 cup\)/);
  await expect(page.locator("form.form-grid")).toHaveAttribute(
    "data-input-method",
    "photo"
  );
});
```

*(Implementer note: `setInputFiles` on the hidden input bypasses the gate-check in the button click handler — that's fine for the smoke; the gate has its own unit coverage via `shouldGateSubmit`. If the hidden input is unreachable, temporarily reveal it via `data-testid` locator force — Playwright sets files on hidden inputs without force by default.)*

- [ ] **Step 2: Run the smoke suite**

Run: `npx playwright test tests/smoke/photo-check.spec.ts`
Expected: PASS.

- [ ] **Step 3: Full gate before finishing**

Run: `npx tsc --noEmit && npm run test && npx playwright test tests/smoke`
Expected: everything green.

- [ ] **Step 4: Commit**

```bash
git add tests/smoke/photo-check.spec.ts tests/fixtures/meal-photos/smoke-meal.jpg playwright.config.ts
git commit -m "test: photo-assist smoke — draft chips to confirmed textarea"
```

---

## Out of scope (explicitly)

- No changes to the verdict engine, prompts, safety contract, or eval rubric.
- No Blob storage, no photo history, no "re-scan from history."
- No count of photo drafts against the legacy free-tier daily check cap (drafts are IP-rate-limited + trial-walled; revisit only if draft-spend shows up in the OpenAI dashboard as material).
- No dedicated camera UI/library — native `capture="environment"` file input only.
- No marketing-copy changes (the distribution strategy doc's scan-demo language becomes filmable once this ships; that doc is updated separately).

## Self-review notes

- **Spec coverage:** D5 requirements → draft-not-verdict (Task 1 prompt + Task 4 flow), editable chips (Task 4), self-flagged doubts blocking blanket accept (Task 4 confirm gate + Task 8 assertion), confirmed text to the trusted engine (Task 4 handoff, Task 5 header), no numbers on screen (Task 1 prompt rules + global constraints). Disclaimer request → Task 6 (already-covered surfaces documented; the two real gaps closed; approved ledger copy chosen over the ad-hoc phrasings).
- **Type consistency:** `MealDraftItem`/`MealDraft`/`MealVisionTransport` (Task 1) are the only shared types; Tasks 2–4 and 8 consume them by those exact names. `createPhotoDraftHandler` deps mirror `createCheckRouteHandler`'s injection pattern.
- **Order matters:** Task 2 (eval) is deliberately before any UI — it is the go/no-go gate.

## Launch gate decision (added 2026-07-10, reconciling E2E-03)

**Status: LIVE by default in production.** Owner green-light given 2026-07-07:
photo is one of the three first-class input methods (text, voice, camera), so
`lib/photo-input-flag.ts` defaults photo input ON. `NEXT_PUBLIC_PHOTO_INPUT=0`
is the post-launch kill-switch if the eval/counsel gates (launch audit BUG-10)
surface a problem. This section is the source-of-truth record the 2026-07-09
E2E verification report (E2E-03) found missing — the code and this doc now
agree.
