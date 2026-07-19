# Revora Release Truth Index + Evidence Closure Checklist

**Document owner:** Engineering (branch `feat/value-retention-plan-2026-07-18`)
**Review date:** 2026-07-19
**Next review due:** before any broad-distribution decision, and on every change to a claim surface below
**Source plan:** `docs/handoff/2026-07-18-revora-100-value-95-retention-validation-and-implementation-plan.md`
**Shipped-evidence ledger:** `.superpowers/sdd/progress.md` (Tasks T1–T22, this branch)

## Status header

- **This index is engineering-authored.** It records what code shipped and what each public
  claim now maps to. It is not sign-off.
- **All human approvals are PENDING** — credentialed RD/CDCES review, function-specific counsel,
  privacy/DPIA, and accessibility audit have not run. No row below may be read as clinical, legal,
  or clearance evidence (plan §3.3).
- **Phase 0 is DEFERRED by user instruction.** DNS/TLS, auth email, analytics deployment,
  support/refund ops, and the source-of-truth quarantine (§P0.5) are not executed. The quarantine
  rows in the claims table are structured here but marked **BLOCKED-ON-PHASE-0**; this index is the
  §P0.5 "release truth index" artifact, created ahead of the quarantine pass it will later anchor.
- No readiness score in the plan is a measured user outcome. Do not publish the 60/100 or 31/100
  proxies (plan §5, §2.3).

---

## 1. Claims-to-truth table

Every public/claim surface → truth status after this branch → owner + disposition.

Disposition legend: **current** (truthful, shipped) · **superseded** (must be rewritten/quarantined; do
not treat as current) · **BLOCKED-ON-PHASE-0** (quarantine deferred) · **pending counsel** (claim needs
legal classification before it may stand) · **pending flag-on** (behavior built but gated off).

| # | Claim surface | Public claim (pre-branch) | Current truth after this branch | Owner | Disposition |
|---|---|---|---|---|---|
| C1 | Landing demo / demo card (`app/page.tsx`, `components/demo-check-card.tsx`) | Oatmeal produces an immediate "Be careful" card | **Now honest two-step** (T2). Registry-driven demo shows the clarify-then-answer flow: enter oatmeal → "plain or sweetened?" → answer → card. Deploy-blocking fixture test guards the promise registry. | Product / Eng | current |
| C2 | Onboarding tour (`app/onboarding/page.tsx`) | High-range clinical copy hardcoded in onboarding; oatmeal chip implies instant verdict | **Copy drift fixed** (T1): high-range/boundary copy now renders from one versioned source with a drift test; profile route drift corrected. First-check chips remain honest against registry. | Product / Safety | current |
| C3 | Paywall bullets — history (`components/*paywall*`, pricing) | "Full history, every device" | **Now true** (T9): keyset pagination, POST-body search (no meal text in URLs), export = all rows, owner-scoped delete, truthful copy + distinct error states. Replaces the old `loadHistory(7)` "last seven days on this device". | Eng / Billing | current |
| C4 | Paywall bullets — weekly insights (`lib/coach/insights.ts`, capability matrix) | "Weekly insights are Premium" | **Bullet removed pending T18 flag-on** (T10). `capabilitiesFor` is now the single source; thin longitudinal insight is free onboarding value; false weekly-insights Premium promises removed. Weekly learning artifact (T18) is the real Premium artifact but ships **flag-off** (see FF ledger). | Product / Eng | pending flag-on |
| C5 | Landing "weekly pattern" phrasing (`app/page.tsx:211`) | Flag-gated "weekly pattern" copy | Renders as free thin insight with the flag **off** (T10 minor). Reconcile wording when `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS` / T18 enablement is decided. | Product | pending flag-on |
| C6 | Terms of Service (`/terms`) | Refund → email support; counsel draft with 2 bracketed placeholders (entity, governing law) | Directs users to support and refund macros exist, but mailbox deliverability + in-account case/SLA path are **Phase 0** work. Placeholders remain (counsel Q10). | Counsel / Owner | pending counsel |
| C7 | Public "wellness tool, not a medical device" assertion (landing, distribution copy) | "Informational-only by design (wellness tool, not a medical device)" | **Overstated — must not stand** (K5, §16). Remove the public status assertion; counsel must classify intended use/labeling/each function vs current FDA guidance before any device-status wording. | Counsel | pending counsel |
| C8 | "Check any meal" / cultural-coverage copy | "Check any meal" | **Too broad** (§4.3). Replace "any" with supported truthful copy until credentialed strata pass. Ontology expansion (T6 corpus) is engineering evidence only. | Product / Safety | superseded |
| C9 | `docs/product-marketing.md` | Photo/insights described as unadvertised while flags + public copy are live (K7) | **Superseded** — reconcile after product/claims review. Mark passages promising unreviewed features / glucose-spike / DPP / regulatory status as superseded, not silently current. | Product / Counsel | BLOCKED-ON-PHASE-0 |
| C10 | `docs/ICP.md` | "spike", individualized-effect, DPP, regulatory-status language outside conservative boundary (§4.6) | **Superseded** — quarantine and reconcile before acquisition. | Product / Counsel | BLOCKED-ON-PHASE-0 |
| C11 | `docs/Revora_90-Day_Distribution_Strategy.md` — SCRIPT 1 + posts | SCRIPT 1 (~line 327) "card flips to **Be careful**", POST 2 betrayal post (~line 268), POST 1 (~line 225) all promote the **false immediate-oatmeal answer** — contradicts the honest two-step now shipped (C1). | **Superseded pending rewrite** (T2 finding). Rewrite scripts/posts to the real clarify-then-answer flow before any channel test; live-capture from current deployment (§5.3). | Product / Growth | superseded (BLOCKED-ON-PHASE-0 quarantine) |
| C12 | `docs/superpowers/plans/2026-07-05-launch-readiness-paywall-pantry.md` (oatmeal chip / first-check aha, ~lines 70, 1507, 1567, 1573) | First-check step promotes oatmeal/banana/OJ as instant "aha" verdict | **Superseded pending rewrite** (T2). Internal plan doc; align to two-step truth so it stops seeding the false promise into future work. | Product / Eng | superseded |
| C13 | `docs/superpowers/plans/2026-07-09-video-engine-slice-1.md` (hooks, ~lines 59, 247, 860) | "Watch what oatmeal does" / "Watch what it says about oatmeal" hooks imply instant verdict | **Superseded pending rewrite** (T2). Video-engine seed data must reflect clarify-then-answer. Note the doc's own `bad` fixture at :860 pairs against a banned "reversed my prediabetes" claim — keep as negative test, not promotion. | Product / Growth | superseded |
| C14 | Progress / outage surface (`app/progress`) | Fetch failures rendered as "locked" (outage → upsell) | **Now true** (T11): 6-state pure resolver; error never renders as upsell/empty; account + daily-loop fixed. | Eng | current |
| C15 | Photo history fidelity (remote history schema/API) | Photo input silently collapsed to text/voice in remote history | **Now preserved** (T4): photo survives all read paths via shared `normalizeInputMethod`; honest truncation/dedupe/empty states. | Eng | current |
| C16 | Result feedback (`components/*feedback*`, `check_feedback`) | Helpful/not-helpful sent only as anonymous aggregate, not result-linked | **Now result-linked** (T5): `check_feedback` table, ownership-gated API, admin safety queue at `/admin/feedback`, presence-only analytics. | Eng / Safety | current |
| C17 | Stripe entitlement recovery (billing handlers) | Charge could fail to grant access with no recovery; source comment over-generalized Play self-healing to Stripe (K6) | **Now self-healing** (T8): durable event inbox + dedupe, `FOR UPDATE` transactional reducer closing the refund-resurrection window, bounded charge scan, stale-gated heal, "syncing" UI, comment corrected. Live production proof + reconcile cron on Railway scheduler remain (T8 minor / Phase 0). | Eng / Billing | current (live proof pending) |
| C18 | Meal memory / journey copy (T14–T20 surfaces) | (No prior public claim — new surfaces) | Non-clinical copy verified vs real contract; no glucose inference; structural no-text-in-analytics. All ship **flag-off** pending Phase 2.6 discovery gate (see FF ledger). | Product / Safety | pending flag-on |

---

## 2. Feature-flag ledger

What each flag gates, its default state, and the enablement gate that may flip it on.

| Flag (env var) | Layer | What it gates | Default | Enablement gate |
|---|---|---|---|---|
| `NEXT_PUBLIC_MEAL_MEMORY` | Client build | Meal-memory UI: recall panel, save controls, memory controls (T14–T16) | **off** (`!== "1"`) | **Phase 2.6 discovery gate** — ≥5 of 8 completing concierge participants independently recall the memory ≥twice and continue at disclosed price (plan §2.6). |
| `MEAL_MEMORY_ENABLED` | Server (not `NEXT_PUBLIC`) | `/api/memory/*` routes; 404 when off. Consumed by `lib/server/capabilities.ts` matrix | **off** | Same Phase 2.6 gate; both readers must be flipped together (matrix imports both). |
| `NEXT_PUBLIC_LEARNING_JOURNEY` | Client build | Journey UI (T17 state machine), weekly learning surface (T18), journey nudges UI (T19), graduation/maintenance (T20) | **off** (`!== "1"`) | **Phase 2.6 discovery gate**, then Phase 4 human approvals (cohort preregistration T21). |
| `LEARNING_JOURNEY_ENABLED` | Server (not `NEXT_PUBLIC`) | `/api/journey/*`, `/api/journey/weekly/*` routes; nudge triggers (`lib/server/nudge.ts`); coach route capability. Shared flag for journey + weekly learning + journey nudges (T17 minor: shared by design) | **off** | Same as above. Weekly-learning artifact is the Premium artifact only once this is on (unblocks C4). |
| `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS` | Client build | Thin longitudinal "weekly pattern" phrasing on landing/dashboard (T10) | **off** | RD review of eval-dependent phrasing + product decision on whether thin insight stays free vs replaced by weekly artifact (P2.4 / T10). |
| `NEXT_PUBLIC_PHOTO_INPUT` | Client build | Photo → draft-chip input path (`lib/photo-input-flag.ts`) | Enabled in production per plan §3.2; behavior hardened by T4 | Photo stratum in permanent eval + credentialed review (P1.5); keep confirmation-step explicit. |
| `NEXT_PUBLIC_PLAY_BILLING` | Client build | Google Play billing surfaces (`lib/play-billing-flag.ts`) | **off** (`!== "1"`) | Play listing / TWA readiness (separate track); byte-identical constraint holds. |

Notes:
- `NEXT_PUBLIC_*` flags are build-time inlined into a reviewed build; server flags gate the API and
  are the real authority (a client flag on with the server flag off yields 404s, not data).
- Enablement of memory/journey flags is a **discovery gate (Phase 2.6)** decision, not an
  engineering toggle. Enablement of insight/weekly phrasing is **RD-review-dependent**.

---

## 3. Evidence closure checklist (Phase 6)

Each row is a human/production gate from plan §Phase 6. **All are PENDING HUMAN.** Owner slots are
unfilled by design — engineering cannot self-assign these. The §13 gate each unblocks is named.

| # | Closure item | Status | Owner slot | §13 gate it unblocks |
|---|---|---|---|---|
| E1 | Credentialed RD/CDCES review — rubric, blinded sample, all dangerous outputs, all release regressions | **PENDING HUMAN** | RD/CDCES: ______ | Dangerous false reassurance (zero in corpus); First meaningful value quality |
| E2 | Function-specific counsel review — meal check | **PENDING HUMAN** | Counsel: ______ | Premium contract / claims accuracy; C7 device-status |
| E3 | Counsel review — meal memory | **PENDING HUMAN** | Counsel: ______ | Analytics privacy; non-clinical boundary |
| E4 | Counsel review — learning journey | **PENDING HUMAN** | Counsel: ______ | Premium contract; claims |
| E5 | Counsel review — insights | **PENDING HUMAN** | Counsel: ______ | Premium contract copy-accuracy (C4/C5) |
| E6 | Counsel review — nudges | **PENDING HUMAN** | Counsel: ______ | Ethical habit strength; analytics privacy |
| E7 | Counsel review — sharing | **PENDING HUMAN** | Counsel: ______ | (Phase 5) private-share privacy |
| E8 | Counsel review — Pantry Review | **PENDING HUMAN** | Counsel: ______ | Scope-of-practice; Pantry↔memory silo decision (§5.4) |
| E9 | Counsel review — analytics claims | **PENDING HUMAN** | Counsel: ______ | Analytics privacy |
| E10 | Counsel review — distribution claims | **PENDING HUMAN** | Counsel: ______ | Promoted examples reproduce; channel eligibility (C11–C13) |
| E11 | Privacy/security review + DPIA (data-protection impact assessment) | **PENDING HUMAN** | Privacy: ______ | Analytics privacy; History export/delete; support/refund data |
| E12 | Accessibility audit + target-user usability sessions | **PENDING HUMAN** | A11y: ______ | Accessibility (no open critical/serious on core + billing) |
| E13 | Staged rollout — internal | **PENDING HUMAN** | Owner/Ops: ______ | Public availability; request routing reliability |
| E14 | Staged rollout — seeded external | **PENDING HUMAN** | Owner/Ops: ______ | Email acceptance; first meaningful value |
| E15 | Staged rollout — small beta | **PENDING HUMAN** | Owner/Ops: ______ | Cohort value (≥80% rate first card useful) |
| E16 | Staged rollout — paid cohort | **PENDING HUMAN** | Owner/Ops: ______ | Billing entitlement; Day-30 new value |
| E17 | Staged rollout — broader release | **PENDING HUMAN** | Owner: ______ | All §13 gates + no open safety/privacy/billing/availability blocker |
| E18 | Daily release dashboard + weekly evidence review | **PENDING HUMAN** | Growth/Data: ______ | Cohort value; Day-30 new value (survivor-bias denominator) |
| E19 | Stop-the-line authority — safety, billing, privacy, availability regressions | **PENDING HUMAN** | Owner + each function: ______ | Backstops every §13 gate ("any miss blocks broad distribution") |

---

## 4. Deferred-Phase-0 register

Deferred by explicit user instruction. Each row lists its §P0 pass criteria; none are executed.

| # | Phase 0 item | Deferred | §P0 pass criteria |
|---|---|---|---|
| P0.1 | DNS/TLS + domain (`revora.bio`, `www`) | DEFERRED (user) | Public HTTPS usable from two networks; canonical redirects; valid TLS; synthetic green 24h. (Current: DNS returned no usable chain, TLS failed, Vercel URL redirects to SSO — §3.2.) |
| P0.2 | Authentication email (Resend domain, From address) | DEFERRED (user) | ≥99% test sends accepted; seeded Gmail + Outlook receive links; every failure state (resend/expired/reused/wrong-device/changed-email) recoverable. |
| P0.3 | Minimized first-party analytics deployment (Umami) | DEFERRED (user) | Production events arrive with zero prohibited fields (no meal text, photo, A1C, email, notes, rationale); privacy review approves data map; env validation fails deploy when measurement expected but unconfigured. (Current: Umami env absent, analytics dark — §3.2.) |
| P0.4 | Support + refund operations | DEFERRED (user) | Deliverable, monitored support address; in-account authenticated "Request help or refund" with case ID; case ledger (time/provider/charge/eligibility/status/owner/resolution); published + monitored SLA; seeded request traverses user→ledger→provider→confirmation. |
| P0.5 | Source-of-truth quarantine | DEFERRED (user) | Stale passages in `docs/product-marketing.md`, `docs/ICP.md`, `docs/Revora_90-Day_Distribution_Strategy.md` marked superseded where they promise unreviewed features / glucose-spike / DPP / regulatory status; this release truth index links claims/flags/pricing/support/privacy/safety/authorization; owner + review date on each launch-critical source. No active launch document conflicts with deployed behavior. (This index is the linking artifact; claims rows C9–C13 are pre-staged as **BLOCKED-ON-PHASE-0**.) |

---

## 5. Cross-references

- Plan gates: §13 (SLOs and release gates), §16 (Do not build or claim), §17 (Definition of done).
- Shipped-code evidence: `.superpowers/sdd/progress.md` — Tasks T1–T22 (this branch, base `a5424b1`).
- Concierge discovery protocol (Phase 2.6): T12 doc (commit `0944104`) — PENDING HUMAN EXECUTION.
- Cohort preregistration (P4.5/4.6): T21 doc (commit `4710027`) — PENDING HUMAN EXECUTION.
- Growth / sharing + distribution prerequisites (Phase 5): T22 doc (commit `54c5891`) — PENDING HUMAN EXECUTION.

> Reminder (§16): no glucose-spike prediction, A1C-improvement/prevention claim, DPP equivalence,
> public "not a medical device" assertion without counsel wording, "check any meal" until coverage
> proven, or health data in third-party analytics/pixels/logs/URLs/previews.
