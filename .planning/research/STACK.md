# Stack Research

**Domain:** Text-only, mobile-first permission-first prediabetes AI food checker MVP
**Researched:** 2026-05-04
**Confidence:** HIGH

## Scope Boundary

This recommendation is for the Permission MVP only: a one-page public web app where a user enters a food description and A1C, then receives SAFE / MODERATE / HIGH guidance in under 5 seconds.

Explicitly out of scope for this stack:
- Photo scanning
- Native iOS or Android apps
- Authentication
- Database-backed profiles
- Payments
- RAG, vector databases, and agent frameworks

## Recommended Stack

Build Revora as a single Next.js app on Vercel, keep all OpenAI calls server-side, use structured outputs so the response shape is enforced, and stay stateless until the MVP proves demand. That is the current standard stack for a small public AI web MVP in this shape.

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Next.js | 16.2.4 | Full-stack web app framework | The boring default for this MVP. One repo gives UI, server routes, deployment, and preview environments. It keeps the OpenAI key off the client and matches the approved Vercel deployment path. | HIGH |
| React | 19.2.5 | UI runtime | Current stable React line paired with Next.js 16. Good fit for a single-screen mobile form and result card without extra frontend architecture. | HIGH |
| React DOM | 19.2.5 | Browser rendering | Keep aligned with React and Next.js. No reason to diverge in a greenfield MVP. | HIGH |
| TypeScript | 6.0.3 | Type safety across input, prompt contract, and result rendering | Health-adjacent input handling benefits from explicit contracts. Use strict typing so the UI, server validation, and model response schema stay aligned. | MEDIUM |
| Tailwind CSS | 4.2.4 | Mobile-first styling | Fastest way to ship a sharp one-page mobile UI without spending time on a component library. Tailwind v4 is the current line and fits greenfield Next.js work well. | HIGH |
| `@tailwindcss/postcss` | 4.2.4 | Tailwind v4 PostCSS integration | Use the matching Tailwind plugin version to avoid config drift. | HIGH |
| OpenAI Responses API via `openai` SDK | `openai@6.35.0` with model `gpt-5.4-mini` | Generate the SAFE / MODERATE / HIGH guidance | OpenAI’s current docs recommend `gpt-5.4-mini` for lower-latency, lower-cost workloads. It supports structured outputs, which is the right primitive for forcing a fixed schema in a public health-adjacent MVP. | HIGH |
| Vercel | Current platform | Hosting, serverless execution, previews, public deployment | Lowest-friction path from local repo to public URL for a Next.js MVP. It fits the 72-hour validation target better than a split frontend/backend deployment. | HIGH |

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| Zod | 4.4.3 | Validate request input and model output | Use on every server boundary. Validate the food text, A1C, and structured model response before rendering anything to the user. | HIGH |
| `@vercel/analytics` | 2.0.1 | Privacy-preserving traffic analytics | Use for pageviews, referrers, and coarse success events only. Do not send raw food descriptions or raw A1C as analytics payloads. | HIGH |
| `@upstash/ratelimit` | 2.0.8 | Abuse and cost control | Add only once the public link is getting meaningful traffic or abuse. This is not required on day one, but it is the simplest standard add-on if a Reddit post spikes usage. | MEDIUM |

### Development Tools

| Tool | Purpose | Notes | Confidence |
|------|---------|-------|------------|
| ESLint + `eslint-config-next` | Linting and framework-aware checks | Next.js 16 removed `next lint`; run ESLint directly. Keep the config strict but light so it protects quality without slowing the MVP down. | HIGH |
| Playwright | Mobile smoke tests | Add 2-4 end-to-end tests with mobile emulation: valid submission, out-of-range A1C handling, non-food input handling, and presence of the non-medical-advice footer. | HIGH |

## Recommended Architecture Pattern

Browser form -> Next.js server route or Server Action -> Zod input validation -> deterministic guardrails for obvious edge cases -> OpenAI Responses API with structured output -> Zod output validation -> render result card.

Implementation defaults:
- Keep the OpenAI API call on the server only.
- Use one structured schema with an enum for `SAFE`, `MODERATE`, and `HIGH`.
- Fail closed: if parsing fails, the app should return a safe retry state, not a guessed answer.
- Keep the result UI simple: label, brief rationale, one sequencing or adjustment tip, one swap when applicable, and the medical disclaimer footer.

## Privacy And Medical Boundary Defaults

These are part of the stack choice, not optional polish:

- Set `store: false` on OpenAI Responses requests. The Responses API defaults `store` to `true`, which is the wrong default for this MVP.
- Do not log raw food text or raw A1C to console, analytics, or error tracking.
- Do not add a database in the MVP just to collect prompts. If you need learning data later, design that privacy posture explicitly.
- Validate A1C server-side and branch safely for `<5.7`, `5.7-6.4`, and `>=6.5`.
- Always include the non-medical-advice footer in the rendered result, regardless of classification.
- Keep model output qualitative. Do not invent glycemic load numbers or clinical predictions.

## Installation

```bash
# Bootstrap the app
npx create-next-app@16.2.4 revora --ts --eslint --tailwind --app --use-npm

cd revora

# Core runtime dependencies
npm install openai@6.35.0 zod@4.4.3 @vercel/analytics@2.0.1

# Optional launch-protection dependency
npm install @upstash/ratelimit@2.0.8

# Mobile smoke tests
npm install -D @playwright/test@1.59.1
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 16 on Vercel | Cloudflare Workers + Hono + Pages | Use this only if the team already operates in Cloudflare and wants an edge-first stack. It is not the fastest path for this MVP. |
| `gpt-5.4-mini` | `gpt-5.4-nano` | Use `nano` only after evals show it does not increase unsafe or unhelpful classifications. This app is health-adjacent, so the cheaper model should earn its way in. |
| Stateless MVP with no database | Supabase or Postgres with Prisma/Drizzle | Add a database only when you intentionally need reviewed outputs, explicit feedback capture, or user accounts. It should not be in MVP v1. |
| Tailwind CSS v4 | Component-library-heavy setup such as MUI or Chakra | Use a larger UI framework only if a pre-existing design system requires it. For a greenfield one-page MVP, it is unnecessary weight. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| React Native, Expo, or native mobile work for v1 | It validates the wrong thing and adds store-review and device-distribution friction. The MVP question is whether permission-first guidance resonates, not whether a native shell does. | Next.js web app on Vercel |
| Vision models or photo-scanner infrastructure in the MVP | Scanner accuracy is future-product scope. It will blur the signal by mixing commodity image recognition with the real question: whether the coaching and framing are valuable. | Text input only |
| Client-side calls to OpenAI | Exposes credentials and sends health-adjacent prompts from the browser. | Server route or Server Action only |
| Auth, profiles, and user accounts | Adds friction before the tool has proven usefulness and creates unnecessary health-data storage pressure. | Anonymous stateless flow |
| LangChain, agent frameworks, or multi-step orchestration | This product needs one constrained inference call, not an agent system. Extra abstraction makes debugging and safety harder. | Direct `openai` SDK + Zod |
| RAG or vector databases | The MVP does not need retrieval infrastructure. The guidance logic should come from the prompt, fixed rules, and conservative output structure. | Curated prompt + deterministic server-side checks |

## Stack Patterns by Variant

**If you are building the Permission MVP now:**
- Use one Next.js page plus one server endpoint.
- Keep the app stateless.
- Skip auth, database, payments, scanner logic, and native wrappers.
- Because the goal is public validation, not platform build-out.

**If public launch traffic spikes after posting in community channels:**
- Add `@upstash/ratelimit`.
- Add anonymous analytics only.
- Consider a minimal manual review log only after you have an explicit privacy decision.
- Because the main new risks become cost spikes and harmful outputs, not missing product surface area.

**If you later build the scanner/mobile product:**
- Keep the food-evaluation logic behind a dedicated server boundary so a future scanner client can reuse it.
- Add image ingestion, storage, auth, and mobile clients in a separate phase.
- Because scanner/mobile concerns are real, but they are not part of the permission MVP’s validation loop.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@16.2.4` | `react@19.2.5`, `react-dom@19.2.5` | Next.js 16 is the current stable line. Official docs note Node 20.9+ and TypeScript 5+ minimums. |
| `tailwindcss@4.2.4` | `@tailwindcss/postcss@4.2.4` | Keep these aligned to avoid Tailwind plugin mismatches. |
| `openai@6.35.0` | `zod@4.4.3` | OpenAI’s structured outputs docs show JavaScript schema integration with Zod. |
| `zod@4.4.3` | `typescript@6.0.3` | Zod docs state v4 is stable and tested against TypeScript 5.5 and later. |
| `eslint-config-next@16.2.4` | `eslint@10.3.0` | Keep lint config aligned with the framework version. |

## Sources

- Official docs: Next.js 16 release notes — https://nextjs.org/blog/next-16 — verified current major version and runtime requirements. `HIGH`
- Official docs: React 19 stable and React 19.2 — https://react.dev/blog/2024/12/05/react-19 and https://react.dev/blog/2025/10/01/react-19-2 — verified current stable React line. `HIGH`
- Official docs: Tailwind CSS v4 — https://tailwindcss.com/blog/tailwindcss-v4 — verified current Tailwind generation and setup direction. `HIGH`
- Official docs: Next.js on Vercel — https://vercel.com/docs/concepts/next.js/overview — verified Vercel fit for Next.js full-stack deployment. `HIGH`
- Official docs: Vercel Web Analytics — https://vercel.com/docs/analytics — verified anonymized, cookieless analytics. `HIGH`
- Official docs: Vercel rate limiting guide — https://vercel.com/kb/guide/add-rate-limiting-vercel — verified rate limiting is standard protection for public AI apps. `HIGH`
- Official docs: OpenAI models — https://developers.openai.com/api/docs/models and https://developers.openai.com/api/docs/models/gpt-5.4-mini — verified current low-latency model recommendation and pricing. `HIGH`
- Official docs: OpenAI structured outputs — https://developers.openai.com/api/docs/guides/structured-outputs — verified schema-constrained output and Zod integration. `HIGH`
- Official docs: OpenAI Responses API reference — https://platform.openai.com/docs/api-reference/responses/object?lang=node.js — verified `store` behavior and request defaults. `HIGH`
- Official docs: Zod docs and Zod 4 release notes — https://zod.dev/ and https://zod.dev/v4 — verified Zod 4 stability and TypeScript support. `HIGH`
- Official docs: Playwright intro — https://playwright.dev/docs/intro and https://playwright.dev/docs/next/intro — verified mobile emulation support for smoke tests. `HIGH`
- Exact patch versions were checked with `npm view` on 2026-05-04 for: `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`, `openai`, `zod`, `@vercel/analytics`, `@upstash/ratelimit`, `eslint`, `eslint-config-next`, and `@playwright/test`. `MEDIUM`

---
*Stack research for: Revora Permission MVP*
*Researched: 2026-05-04*
