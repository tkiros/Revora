# Project Research Summary

**Project:** Revora
**Domain:** Permission-first prediabetes AI food checker MVP
**Researched:** 2026-05-04
**Confidence:** MEDIUM

## Executive Summary

Revora is not a general nutrition app, scanner platform, or diabetes management suite. The researched MVP is a narrow, text-only decision tool for people with prediabetes who want a fast answer to "Can I eat this?" Experts would build this as a small stateless web app with a single server-side AI call, strict schema validation, deterministic policy checks around A1C and ambiguity, and a UX that privileges clarity, speed, and reassurance over feature breadth.

The recommended approach is a boring monolith: Next.js on Vercel, React and TypeScript on the frontend, a single Node.js route for inference, OpenAI Responses API with structured outputs, and Zod on both request and response boundaries. MVP scope should stay fixed on one no-login flow: food description plus A1C in, SAFE / MODERATE / HIGH guidance out, with one short reason, one practical adjustment for MODERATE/HIGH, one swap for MODERATE/HIGH, and a non-medical-advice footer. Scanner, auth, saved history, device sync, and payments are future-product concerns and should not shape the MVP architecture.

The main risks are not scale or polish. They are medical-claim drift, harmful false SAFE classifications, false precision from overusing A1C, privacy leakage through logs or analytics, and a community launch that reads as hype instead of evidence-grounded support. The roadmap should therefore front-load claims boundaries, rubric design, structured-output guardrails, eval coverage, privacy constraints, and founder review loops before any expansion into future scanner/mobile scope.

## Key Findings

### Recommended Stack

The stack recommendation is prescriptive: use a single Next.js 16 app on Vercel with React 19, TypeScript, Tailwind CSS 4, and a server-only OpenAI integration. Keep the app stateless, keep all inference behind one Node.js route, and validate both incoming payloads and model outputs with Zod. This is the lowest-friction path that still gives Revora the right trust boundaries for a health-adjacent public MVP.

Avoid premature infrastructure. Do not add auth, a primary database, scanner ingestion, agent frameworks, or client-side model calls. Add Playwright smoke coverage early, start with pageviews only for analytics, and treat WAF or Upstash-backed rate limiting as launch-protection work once public traffic justifies it.

**Core technologies:**
- Next.js 16.2.4: full-stack web app framework and deployment seam for a one-page public MVP.
- React 19.2.5: UI runtime for the single-screen mobile form and result states.
- TypeScript 6.0.3: shared type safety across request schema, policy logic, and rendered result contract.
- Tailwind CSS 4.2.4: fast mobile-first styling without adding a heavy component system.
- OpenAI `openai@6.35.0` with `gpt-5.4-mini`: low-latency structured-output inference for the SAFE / MODERATE / HIGH contract.
- Zod 4.4.3: server boundary validation for user input and model output.
- Vercel: hosting, previews, and the simplest public deployment path for this stack.
- Playwright: mobile smoke coverage for valid submissions, edge cases, disclaimers, and failures.

### Expected Features

The research is consistent about what must exist at launch: instant no-login value, a single plain-English verdict, a short reason users can trust, and a practical next step when the answer is not SAFE. Revora's differentiator is not feature breadth. It is prediabetes-specific permission framing, A1C-calibrated risk bands, and guidance that feels calming rather than punitive.

The MVP must stay distinct from future scanner/mobile ambitions. The product should not absorb photo scanning, saved history, multi-condition support, open-ended coaching, or clinician workflows into v1. Those are common adjacent requests, but they weaken the actual validation question this MVP is supposed to answer.

**Must have (table stakes):**
- One-screen no-login food description plus A1C input for immediate public use.
- SAFE / MODERATE / HIGH verdict with a one-sentence rationale.
- One practical adjustment for MODERATE/HIGH, ideally sequencing or add protein/veg guidance.
- One realistic lower-glycemic swap for MODERATE/HIGH and no unnecessary swap for SAFE.
- Mobile-first loading, retry, and failure states that work in real-world contexts.
- Safe handling of ambiguous meals, non-food inputs, carbs-only meals, and A1C outside 5.7-6.4.
- A visible informational-only footer and explicit privacy boundary on every result.

**Should have (competitive):**
- Prediabetes-only A1C-calibrated rubric rather than generic wellness logic.
- Permission-first SAFE framing that feels enabling, not moralizing.
- Evidence-grounded sequencing and swap guidance based on validated patterns.
- Privacy-minimizing public usage with no default raw food or raw A1C storage.

**Defer (v2+):**
- Photo scanning, barcode scanning, and OCR.
- Accounts, saved history, favorites, streaks, and broader tracking.
- CGM sync, clinician reports, and healthcare-provider workflows.
- Payments, recurring personalization, and mobile apps.
- Multi-condition support and open-ended nutrition chat.

### Architecture Approach

The architecture recommendation is a thin BFF monolith with a schema-first AI contract and a guardrail sandwich. Requests should flow from a small mobile UI into a single `POST /api/check` endpoint, through deterministic validation and policy gates, into one server-side OpenAI call, then back through output validation, disclaimer merge, and conservative fallback handling before anything is rendered. Telemetry and rate limiting should stay off the critical path and should not distort the MVP's stateless privacy posture.

**Major components:**
1. Mobile UI shell: collects `food` and `a1c`, renders loading, result, clarification, and error states.
2. Check API: the single public backend entrypoint for inference requests.
3. Validation and policy layer: enforces payload shape, A1C bands, ambiguity handling, and out-of-scope routing.
4. Inference service: composes the prompt, calls OpenAI, and requests structured output.
5. Output guardrail: validates result shape, applies disclaimers, and falls back conservatively on malformed or unsafe output.
6. Optional launch controls: privacy-minimal telemetry, WAF/rate limiting, and a kill-switch path for incidents.

### Critical Pitfalls

1. **Medical-claim drift** - Ban diagnosis, treatment, prevention, reversal, and exact prediction language before implementation; review prompt, UI, landing copy, and launch copy together.
2. **Unsafe SAFE classifications from hallucinated meal assumptions** - Treat ambiguity as a first-class outcome, add deterministic prechecks, and gate launch on a harmful-SAFE eval set plus manual founder review.
3. **Treating A1C as full personalization** - Use A1C only as a coarse band, keep output qualitative, and ask one clarifying question or classify conservatively when the meal description is too vague.
4. **Privacy theater around health-adjacent data** - Default to stateless handling, disable request-body logging, redact identifiers, and do not add broad analytics or replay tooling to result flows.
5. **Community launch that feels promotional or increases anxiety** - Prepare an evidence-backed, transparent launch plan, validate tone with target users, and review current subreddit rules before posting.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Claims Boundary and Safety Contract
**Rationale:** The MVP is health-adjacent, so allowed claims, banned claims, tone rules, A1C bands, and edge-case behavior must exist before prompt tuning or UI work.
**Delivers:** Allowed/banned claims list, evidence pack, A1C policy, request/response schemas, fallback copy, and a first-pass result rubric.
**Addresses:** A1C validation, permission-first SAFE framing, explicit medical boundaries, out-of-range handling.
**Avoids:** Medical-claim drift, false precision from overusing A1C, anxiety-inducing tone.

### Phase 2: Guardrailed Inference Core and Eval Harness
**Rationale:** Revora's product logic lives in the server-side contract, not in the page shell. Build and test the classification engine before wrapping it in polished UI.
**Delivers:** Prompt composer, structured-output model call, deterministic policy gates, conservative fallback behavior, and harmful-SAFE regression fixtures.
**Uses:** OpenAI Responses API, Zod, TypeScript, Node.js route-compatible service code.
**Implements:** Validation layer, inference service, output guardrail.
**Avoids:** Unsafe SAFE classifications, free-form model drift, unsupported precision.

### Phase 3: Public MVP Shell
**Rationale:** Once the response contract is stable, the rest of the MVP should be a thin delivery shell around it, not an expansion of scope.
**Delivers:** Single-screen mobile-first page, `POST /api/check`, result card, loading and failure states, clarification flow, and visible disclaimer footer.
**Addresses:** No-login public access, under-5-second usability, mobile readability, one practical action and swap on non-SAFE results.
**Avoids:** Scanner/mobile scope creep, client-side model calls, overbuilt frontend architecture.

### Phase 4: Privacy-Minimal Launch Controls
**Rationale:** Public sharing should not happen until cost, telemetry, logging, and abuse boundaries are explicit and conservative.
**Delivers:** Request-body logging review, enum-only telemetry or pageviews, WAF/rate limiting, request IDs, incident rollback/kill-switch procedure.
**Uses:** Vercel deployment controls, privacy redaction logic, optional Upstash-backed limits if needed.
**Implements:** Telemetry boundary and abuse/cost controls without changing the stateless MVP.
**Avoids:** Privacy leakage, analytics sprawl, cost spikes, operational surprises during launch.

### Phase 5: Community Launch and Founder Review Loop
**Rationale:** Revora's first distribution channel is trust-sensitive. Launch behavior and post-launch review are part of the product, not just marketing.
**Delivers:** Moderator-aware launch copy, evidence FAQ, founder review checklist, sampled SAFE audits, and a feedback-to-evals loop.
**Addresses:** Shareability, trust, manual safety review, willingness-to-pay signal collection.
**Avoids:** Promotional backlash, misinformation concerns, unnoticed tone regressions in the wild.

### Phase Ordering Rationale

- Claims, rubric, and evidence come first because they constrain every later prompt, UI, and launch decision.
- The inference core comes before the public shell because Revora's real product is the SAFE / MODERATE / HIGH contract plus its guardrails.
- The public shell stays intentionally small because the research consistently says to validate permission framing, not scanner convenience or retention mechanics.
- Privacy and launch controls come before broad community distribution because trust failures matter more than missing polish at this stage.
- Scanner/mobile, auth, storage, and payments should not appear on the MVP roadmap until the text-only wedge proves demand, trust, and willingness to pay.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Claims boundary and evidence pack need careful review because medical-adjacent wording, escalation rules, and source usage constrain the whole product.
- **Phase 4:** Privacy/telemetry decisions need more research if Revora stores anything beyond pageviews or redacted aggregates, especially around health-adjacent data handling.
- **Phase 5:** Community launch should re-check current subreddit and platform rules at planning time because moderation norms and allowed posting formats can change.

Phases with standard patterns (skip research-phase):
- **Phase 2:** Server-side OpenAI structured outputs plus Zod validation is a documented implementation pattern; the custom work is eval design, not ecosystem research.
- **Phase 3:** Next.js App Router plus a single Vercel route handler is a standard path for this class of MVP.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Based mostly on official Next.js, Vercel, OpenAI, Zod, and Playwright documentation with current versions checked. |
| Features | MEDIUM | Strongly grounded in project context and competitor/product research, but launch-value assumptions still need user validation. |
| Architecture | HIGH | Thin monolith, schema-first contracts, and server-side inference are well-documented patterns for this MVP shape. |
| Pitfalls | MEDIUM | Risks are credible and well-supported, but several roadmap constraints are informed by inference from scope, trust, and regulatory posture rather than a single authoritative source. |

**Overall confidence:** MEDIUM

### Gaps to Address

- Exact SAFE / MODERATE / HIGH rubric boundaries still need explicit product rules and example fixtures before implementation starts.
- The threshold for asking one clarifying question versus conservatively classifying higher needs to be decided in planning.
- Claims-safe launch copy, disclaimer wording, and evidence note should be reviewed as a single system, not in isolated files.
- Privacy posture is clear for a stateless MVP, but telemetry scope beyond pageviews still needs a concrete vendor and data-flow decision.
- Tone validation with real target users is still missing; internal agreement is not enough to prove the permission-first experience works.

## Sources

### Primary (HIGH confidence)
- `.planning/PROJECT.md` - project scope, constraints, success metrics, and MVP boundaries.
- `docs/revora-design-20260404-070350.md` - approved product direction and design choices referenced across the research set.
- Next.js official docs and release notes - App Router, route handlers, runtime defaults, and current framework version.
- OpenAI official docs - model selection, Responses API, structured outputs, moderation, and data controls.
- Vercel official docs - deployment model, functions, regions, analytics, redaction, WAF, and storage guidance.
- CDC and NIDDK guidance - prediabetes framing and scope boundaries for the target population.
- Imai et al. 2023 and Shukla et al. - evidence base for sequencing-style practical guidance.

### Secondary (MEDIUM confidence)
- Competitor product pages and App Store listings for Glycemic Snap, GluKee, ZOE, Lumo AI, and Blume - feature expectations and category norms.
- mHealth review of prediabetes apps in the DACH region - supporting evidence that tracking-heavy apps are common but not Revora's required MVP shape.

### Tertiary (LOW confidence)
- None material to the roadmap recommendation; the summary does not depend on single-source speculative claims.

---
*Research completed: 2026-05-04*
*Ready for roadmap: yes*
