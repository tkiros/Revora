# Revora Alignment Audit — Coach-First Pivot

**Date:** 2026-06-30
**Auditor:** Documentation alignment pass (coach-pivot)
**Trigger:** User locked the **coach-first** direction (camera/CGM/BAI demoted to later/optional) and chose **"amend + archive originals"** for conflicting locked docs.
**Scope:** All `*.md` under repo root except `node_modules/`, `.git/`, `agent/`, `.planning/`, `predict/`, and `docs/archive/`.

**Resolution policy (how each conflict class was handled):**
- **FACT** errors → corrected **in place** in every live doc.
- **POSITIONING** (camera/CGM/BAI as hero) in *authoritative locked* docs → **snapshot to `docs/archive/` + supersede banner** (body not gutted).
- **POSITIONING** in *subordinate* plans → single supersede **pointer** (git preserves history; no snapshot).
- **PRIVACY/STATELESS** promises → **kept** (still true through coach Step 3) + **forward lockstep note**.
- **CLAIMS/"reversal"** in marketing → **flagged for counsel**, not unilaterally rewritten.

**New source-of-truth hierarchy (coach-first):**
[1] `docs/product-marketing.md` (positioning & GTM) → [2] `docs/safety/claims-boundary.md` (claims/legal language, LOCKED) → [3] `docs/coach-mvp.md` + `docs/implementation-plan-to-play.md` (scope & sequencing) → [4] `docs/ICP.md` (market facts & evidence basis) → [5] amended PRD/brand docs (historical reference; superseded on positioning).

---

## Summary dashboard

| Category | Count | Resolution |
|---|---|---|
| Fact errors corrected (in place) | ~16 edits / 6 files | FIXED |
| Authoritative locked docs amended + archived | 6 | AMENDED + ARCHIVED (snapshot + banner) |
| Subordinate plans pointed | 8 | SUPERSEDE POINTER |
| Working-analysis docs reconciled (note + inline) | 2 | design doc + ICP |
| Privacy/stateless promises | 3 | KEPT + FUTURE-LOCKSTEP NOTE |
| Cross-doc contradictions (A–F) | 6 | RESOLVED |
| Marketing "reversal" lines | 3 | FLAGGED FOR COUNSEL |
| Intentionally retained / out-of-scope | 4 | DOCUMENTED (no edit) |

**Verification:** repo-wide grep confirms **no live doc asserts a banned fact as true** (115.2M not 98M/97.6M; no "first-mover"; no citable "$8.81B→$15.1B" TAM; Cal AI corrected). Remaining grep hits are correction-statements (ICP/handoff) or audit rows that quote-to-refute.

---

## Section 1 — FACT CORRECTIONS (fixed in place)

### FACT-1 | Prevalence "98 million" → "115.2 million" (CDC 2026)
- `PRD/Glucosnap_prd_v2.md` L17, L103 (also "CDC 2024"→"CDC 2026")
- `Revora_Brand_Positioning_v2.md` L255, L260
- `docs/revora-design-20260404-070350.md` L14
- `docs/audit/Revora_Feasibility_Analysis.md` L394 (external column), L407 + SAM funnel (L408–L412 recomputed: 23.0M / 19.6M / 6.9M / 1.7M; verdict "1.5M"→"~1.7M" SAM), L1260
**Source of truth:** CDC Diabetes Statistics, Feb 2026 (`docs/ICP.md` evidence header). **Resolution: FIXED.**

### FACT-2 | "First-mover" claim → removed (REFUTED)
- `PRD/Glucosnap_prd_v2.md` L1220 → moat reframed to "prediabetes-exclusive brand + honest daily coaching (photo→GL already commoditized — Glycemic Snap, LOGI, SNAQ, January AI)".
- `docs/audit/Revora_Feasibility_Analysis.md` L1260 → "no direct competitor owns…" softened to "uncrowded but **not** uncontested".
**Resolution: FIXED.**

### FACT-3 | Unverifiable TAM "$8.81B → $15.1B" → removed/marked unverified
- `PRD/Glucosnap_prd_v2.md` L39 → structural market framing.
- `Revora_Brand_Positioning_v2.md` L324 → "large, underserved prediabetes market".
- `docs/audit/Revora_Feasibility_Analysis.md` L395 (verdict "Confirmed"→"**Unverified**"), L399 (TAM assessment).
- `docs/audit/Revora_Deep_Audit_Report.md` L614 → "$15.1B global market" → "a large global market".
**Resolution: FIXED.**

### FACT-4 | "Cal AI converts at 8–12%" → corrected (~20–25% *trial*, different metric)
- `Revora_Brand_Positioning_v2.md` L324
- `PRD/Glucosnap_prd_v2.md` L738
- `docs/audit/Revora_Feasibility_Analysis.md` L352
**Resolution: FIXED.** (Unrelated "8–12%" retention/churn benchmarks at Feasibility L515/L651 correctly left untouched.)

---

## Section 2 — POSITIONING (camera/CGM/BAI as hero) → amended + archived

Each authoritative locked doc received a verbatim snapshot at `docs/archive/<name>-pre-coach-pivot-20260630.md` and a top **`> STATUS: AMENDED — superseded on positioning (2026-06-30)`** banner (body unchanged except FACT fixes). Banner points readers to `docs/product-marketing.md` and this report.

| # | Doc | Snapshot | Banner add-on |
|---|---|---|---|
| POS-1 | `PRD/Glucosnap_prd_v2.md` | ✅ | — |
| POS-2 | `Revora_Brand_Positioning_v2.md` | ✅ | "reversal" lines flagged for counsel (see §5) |
| POS-3 | `Revora_Traceability_Matrix.md` | ✅ | — |
| POS-4 | `PRD/Revora_Technical_Specification_v2.md` | ✅ | photo/Vision/scan-history DB architecture deferred; server persistence returns at coach Step 4 |
| POS-5 | `PRD/Revora-Master-Implementation_Plan_v2.md` | ✅ | BLK-009 pricing demoted from "locked" to **hypothesis** pending WTP |
| POS-6 | `Revora_PRD_Amendments.md` | ✅ | Amendment 1 (BAI) + Amendment 5 (CGM at launch) **superseded** |
| POS-7 | `PRD/Implementation_plans/*.md` (8 files) | — (pointer only) | "Superseded for sequencing/positioning by `docs/implementation-plan-to-play.md`" |
| POS-8 | `docs/revora-design-20260404-070350.md` | — (pointer + fact-fix) | "Superseded (coach pivot). Current direction: `docs/product-marketing.md`" |
| POS-9 | `docs/ICP.md` | — (note + inline) | coach-pivot note; L3/L23/L31 reconciled (photo deferred, price → hypothesis) |

**Resolution: AMENDED + ARCHIVED.** Every change is reversible (snapshot + git history).

---

## Section 3 — PRIVACY / STATELESS → kept (still true) + future-lockstep note

The "no account / no server database / no saved history" promise **remains TRUE** for the current app and through coach **Steps 1–3** (history is on-device localStorage only). It changes **only at Step 4 (Pay → backend + identity + server-side history)**. A forward note was prepended to:
- `docs/privacy/data-flow.md` (LOCKED Phase-4 boundary)
- `docs/ops/play-twa-runbook.md` (Play **Data Safety** answers — highest risk if changed without updating the store form)
- `docs/legal/counsel-brief.md` (counsel's risk basis)

Each note says: when Step 4 lands, this doc + in-app privacy copy + the Play Data Safety form must update **in lockstep**. Captured as a hard dependency in `docs/implementation-plan-to-play.md` Phase 5. **Resolution: KEPT + LOCKSTEP-FLAGGED.**

---

## Section 4 — CROSS-DOC CONTRADICTIONS (A–F) → resolved

- **A | Camera vs Coach** (PRD/brand sell "point your camera"; code is text-only; coach docs say don't build camera first). **Resolved:** coach-first locked; camera deferred; §2 banners reconcile the locked docs; `docs/product-marketing.md` is the positioning truth.
- **B | "reversal" in marketing vs PRD §10 ban** (`Glucosnap_prd_v2` §10 bans the word in marketing; brand uses it as north star). **Resolved:** align to `docs/safety/claims-boundary.md` + user-as-agent safeguard line; risky brand lines flagged for counsel (§5).
- **C | Stateless promise vs full DB architecture** (privacy docs say no DB; Tech Spec/Master Plan specify Postgres + scan history). **Resolved:** statelessness holds through coach Step 3 (on-device); server DB returns at Step 4 with the §3 lockstep update; Tech Spec banner notes the deferral.
- **D | Price locked vs price tested** (Master Plan BLK-009 "$12.99 locked" vs coach-mvp price-ladder). **Resolved:** $12.99 demoted to **hypothesis pending WTP**; Master Plan banner (POS-5) records it; marketing doc labels pricing `[L]`; ICP L23 reconciled (price now a hypothesis, was "locked").
- **E | CGM at launch vs deferred** (PRD Amendment 5 "CGM beta Day 0" vs Deep Audit REC-014 "defer to V1.3"; handoff "don't build CGM first"). **Resolved:** CGM deferred; PRD_Amendments banner (POS-6) supersedes Amendment 5.
- **F | "98M" in locked docs vs corrected in working docs.** **Resolved:** FACT-1 corrected the locked docs in place; banners note "wrong facts corrected inline."

---

## Section 5 — CLAIMS / "reversal" → flagged for counsel (not unilaterally rewritten)

`Revora_Brand_Positioning_v2.md` uses "reversal" as the brand north star, conflicting with `PRD/Glucosnap_prd_v2.md` §10's blanket ban on the word in marketing/App-Store copy. Residual-risk lines:
- L240 — *"One photo. One step. One reversal."* (video ad copy)
- L287 — CTA *"Start my reversal"* (App Store)
- L295 — *"Most people reverse prediabetes in under a year."* (population stat, borderline)

**Resolution: FLAGGED FOR COUNSEL.** The brand-doc banner records the conflict. Proposed direction: align to `docs/safety/claims-boundary.md` and lead with the safeguard line *"Reversal is achieved through your dietary choices — Revora gives you the clarity to make them."* Final marketing/store copy must pass counsel (`docs/legal/counsel-brief.md`) before external use.

---

## Section 6 — Intentionally retained / out-of-scope (documented, no edit)

1. **`docs/audit/Revora_Feasibility_Analysis.md` L394** — "88 million (PRD §2.1)" retained as the **audited historical PRD claim**; the row's external column + assessment were corrected to 115.2M ("PRD figure conservative"), so the row is internally consistent and clearly framed. Editing the "claim" cell would misrepresent what the audit reviewed.
2. **`docs/ICP.md`, `docs/handoff/2026-06-29-…`** — contain the old figures only inside **correction statements** ("98M → 115.2M"); the authority for the corrections, not violations. (Note: `docs/ICP.md`'s camera-first/price-locked framing was separately **reconciled** — see POS-9.)
3. **`predict/260629-revora-viability/overview.md`** — "first-mover is refuted" is a **critique** (and `predict/` is out of scope).
4. **`.planning/PROJECT.md` L48** ("98 million") — `.planning/` is **out of scope**. Optional future cleanup; not a live product doc.

---

## Verification

- Repo-wide grep (excluding `archive/`, `.planning/`, `agent/`): **no live doc asserts a banned fact as true.** Remaining hits are correction-statements or quote-to-refute audit rows (enumerated in §6).
- Artifacts confirmed: **6** archive snapshots, **6** supersede banners, **3** privacy lockstep notes, **8** subordinate-plan pointers.
- New positioning docs verified banned-fact-clean: `docs/product-marketing.md`, `docs/implementation-plan-to-play.md`.

## Residual open items (not blockers)
- **Counsel review** of the three "reversal" marketing lines (§5) before any external copy.
- **Optional:** `.planning/PROJECT.md` 98M cleanup if planning files are ever surfaced externally.
- **At coach Step 4:** execute the §3 privacy/Data-Safety/counsel lockstep update (owned by `docs/implementation-plan-to-play.md` Phase 5).
