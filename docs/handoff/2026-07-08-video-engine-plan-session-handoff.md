# Session Handoff — Short-Form Video Engine Plan

**Date:** 2026-07-08
**Session type:** Research + strategic architecture (planning only — no code written)
**Primary artifact produced:** `docs/Revora_Video_Engine_Plan.md` (466 lines, 15 sections + appendices)
**Continue by:** reading the primary artifact top-to-bottom, then §11 and §15 (they hold the build path).

---

## 1. What the session was asked to do

Original request (a `<master_prompt>`): conduct **deep research** and produce a **complete strategic + technical plan** for automating Revora's full short-form video marketing/distribution pipeline end-to-end — research → hooks → scripts → AI production → multi-platform publishing → analytics → learning loop — for a consumer health-adjacent app. It supplied an initial 5-agent structure to critique and improve, and demanded a 14-section deliverable (exec summary through final recommendation) at a "serious research-backed architecture" quality bar.

Follow-up asks in the same session (all completed):
1. Video length? All faceless? Are all formats suitable/persuasive for Revora? → folded into the plan as **§6.1**.
2. Compare the plan vs. the `docs/content_mate/` automation; which is better; can we combine them? → answered in chat + built into **§15**.
3. Can we do it **without n8n** and with **free ElevenLabs alternatives**? → built into **§15**.
4. This handoff.

---

## 2. What was done

### 2.1 Deep research (completed, verified)
Ran the `deep-research` workflow (background, 112 agents, ~17 min, ~3M subagent tokens). Method: 6 search angles → 29 sources fetched → 134 claims extracted → **25 adversarially verified** (3-vote; need 2/3 to kill) → 21 confirmed, 4 refuted.

**Load-bearing verified findings (drive the whole architecture):**
- **[H] TikTok API forbids this use case.** "A utility tool to help upload contents to accounts you/your team manages" and "an app that copies arbitrary contents from other platforms" are *explicitly listed unacceptable*. Unaudited clients = private-only (SELF_ONLY), 5 users/24h; audited = ~15 posts/day/creator, 6 req/min. → Fully-automated public TikTok posting from a self-built client is **out** for v1.
- **[H] FTC makes health claims a substantiation + disclosure problem.** Advertisers liable for testimonial/creator claims as if made directly; "results not typical" doesn't cure; disclosures in short video must be **dual-mode (audible+visual) and "unavoidable"** — a bio link doesn't count. 2024 fake-reviews rule (16 CFR 465) = ~$51,744/violation.
- **[H] Refuted claim to NOT repeat:** health claims do **not** "always require RCTs" (refuted 0-3). Standard is flexible "competent and reliable scientific evidence." Don't hard-code an RCT-only gate.
- **[H] Architecture:** each LLM agent owns **one task**; all deterministic ops (API calls, DB writes, render, publish) are **pure functions, never routed through an LLM** (arXiv 2512.08769). Spreadsheet-as-state + linear cron pipeline is a proven MVP shape.
- **[M] Meta 2026 AI moderation** wrongfully bans legit accounts → account death is a live risk; keep engine state platform-independent; email list + owned group = storm shelter.
- **[L] Analytics/experimentation** benchmarks (completion 80%/60%/50% by length, hook rate vs hold rate, share ≥2%, one-variable tests, ~10–15 posts/hypothesis) came from practitioner sources — **not adversarially verified**, marked [L] in the doc as priors to validate against Revora's own data.

Raw research output saved at: `/tmp/claude-1000/-home-tefera-Desktop-Revora/4f0be2d8-cda6-4f19-b3a1-c73745403049/tasks/w2r2t2bno.output` (may be cleaned up — the findings are distilled into §2 of the plan).

### 2.2 The plan — `docs/Revora_Video_Engine_Plan.md`
Full 15-section architecture. Section map:
- **§1–2** Exec summary + verified findings (with [H]/[M]/[L] confidence grades).
- **§3** Critique of the initial 5-agent model: production/publishing/analytics-ingestion are **not agents** (they're services/jobs); adds 9 missing components (compliance gate, brand-memory/repetition control, substantiation file, disclosure engine, Experiment entity, account-safety pacing, cost/observability, human-as-a-state, format-capability honesty).
- **§4** Architecture: Jobs (cron) / Agents (single-task LLM) / Services (pure functions) / Human gates. Boring orchestrator + sheet-as-state.
- **§5** 5 agents (A1 Research Miner, A2 Hook Strategist, A3 Spec Builder, A4 Compliance Linter, A5 Pattern Analyst) with typed I/O and "never does" lines.
- **§6** Production workflow + format-capability matrix. **§6.1 Format & Length Spec** — length bands (15–35s, sweet spot 20–30s), faceless-vs-face split, and the **forbidden-hooks list** (polarizing/taboo, fear/urgency, dramatic-results) as A4 hard-fails. Swipe file = library of *mechanisms, not tones*.
- **§7** Per-platform publishing posture: YouTube API-auto, IG scheduled-conservative, **TikTok human-assisted** (never a self-built API client in v1), FB manual.
- **§8** Analytics + learning loop: hook rate vs hold rate diagnosed separately; weekly experiment machinery (one variable, ≥4 posts/cell); the W3–4 format & W4 hook tournaments are the first two experiments.
- **§9** Data model (10 tables; MVP = sheet tabs; append-only compliance_rev + claim_registry as the defense file).
- **§10** Automate/semi/never split; the two gates (G1 claims sign-off — never automated; G2 publish).
- **§11** MVP in 3 slices (script factory → renderer → loop), each gated on the 90-day plan needing it. **Slice 1 = smallest viable version with real value.**
- **§12** Advanced roadmap (only if Day-90 verdict = scale).
- **§13** Risk register (10 risks) + 2 structural bottlenecks to accept.
- **§14** Final recommendation: build a **content operating system with a human publish gate, not an auto-poster**; sequence behind the strategy's gates; "smarter not louder" = the experiment table.
- **§15 Lean build path (no n8n, free tools)** — see 2.3.

### 2.3 Content Mate comparison → §15 (the current build direction)
Analyzed `docs/content_mate/` = a real n8n automation (105 nodes): scrape 33 X handles → OpenAI commentary → Replicate VEO3/Kling **AI-avatar clone** → ElevenLabs voice+S2T → FFmpeg assembly → **Blotato 9-platform publish**, self-hosted on Hostinger.

**Verdict:** working *body*, wrong *brain* for Revora — its core loop (trend-scrape + AI-clone + auto-publish) is each a §13 fatal risk (TikTok ToS, banned avatar format, no compliance gate, FTC exposure, slop). **Do not adopt as-is.** Keep the *plumbing pattern*, transplant this plan's brain, drop n8n + paid TTS.

**§15 delivers a Keep/Cut/Add table + free-tool stack + minimal file layout:**
- **No n8n** → TypeScript scripts on **Vercel Cron** (already deployed) + Google Sheet state.
- **Free TTS** → often **none** (text-on-screen + music); else **Edge-TTS** (free, no key; ToS-gray at scale) → **Piper/Kokoro** (local, unlimited, license-clean, the permanent choice).
- **Free captions** → local Whisper (`faster-whisper`), not ElevenLabs S2T.
- **Render** → Remotion (TS-native, in-repo) or ffmpeg.
- **Infra ≈ $0**, running cost ≈ LLM tokens only.
- File layout scaffold: `/video-engine/{config.ts, prompts/, agents/, services/, sheet.ts, cron.ts, notify.ts}` — mapped to Slice 1→2→3.

---

## 3. Key decisions locked this session (don't re-litigate)

1. **Content operating system with a human gate — NOT a full auto-poster.** The two human gates (G1 claims sign-off, G2 publish) are permanent for claim-adjacent output.
2. **No AI-avatar clones, ever.** Off-brand for a trust-led product + fake-testimonial FTC risk. Faceless = text-on-screen/slideshow/real-app check-demos; founder films the P5 story.
3. **No self-built TikTok API client in v1.** Human-assisted posting. Aggregator (Blotato-class) only in v2, eyes open on ToS/audit risk.
4. **No n8n for Revora.** In-repo TS + Vercel Cron instead.
5. **Free tooling for now:** VO-free where possible → Edge-TTS → Piper/Kokoro; local Whisper captions.
6. **Sequence the engine behind the 90-day plan's own gates.** Build Slice 2 (renderer) only *after* the W3–4 format tournament crowns a format. The engine scales a winner; it can't find one.
7. **The plan is subordinate to** `docs/safety/claims-boundary.md` and the §3.2 compliance pre-flight in `docs/Revora_90-Day_Distribution_Strategy.md`. When they disagree, those win.

---

## 4. Status: what should be done next

**Nothing is built yet — this session produced strategy only.** The distribution strategy's own Day-0 preflight (`docs/Revora_90-Day_Distribution_Strategy.md` §0.2) gates all distribution and is unresolved (OpenAI funding, /terms placeholders, domain DNS, attribution, etc.) — the video engine sits *behind* that, so confirm preflight status before investing build time.

### Immediate next actions (in order)
1. **Decide: build the engine now, or run Slice 0 manually first?** Recommendation: the 90-day plan runs **Reddit-first**; video ramps only after a demo format wins the W3–4 tournament. So **Slice 1 (script factory) is the only piece worth building before the tournament** — and even it can wait until Reddit warm-up is underway. Confirm the founder wants to invest ~3–4 build-days now.
2. **If yes → build Slice 1** (plan §11 + §15.4): `sheet.ts` (Google Sheet, §9 schema) + `config.ts` + `prompts/*` + `agents/{miner,hooks,spec,linter}.ts` + a formatted G1 review view. No rendering services yet. Uses existing OpenAI key. **This is a real coding task** — start it in the new session with `superpowers:brainstorming` then a written plan (`superpowers:writing-plans`), since it's multi-file.
3. **Write the A4 linter prompt against the actual claims boundary.** Read `docs/safety/claims-boundary.md` + `docs/safety/copy-ledger.md` + the §3.2 checklist and encode the banned-family hard-fails (reversal/cure/numbers-attributed-to-Revora/predictions) + forbidden vocabulary as a deterministic regex pass *plus* the LLM linter. This is the highest-risk-reduction, lowest-effort first build.
4. **Feed A2 the hook-mechanism library** from `docs/superpowers/plans/video_hooks_scripts_ideas.md` (scenario injection, curiosity gap, attention anchor, STI visual-text, curiosity reloops, CTA-after-value) — but *mechanisms only*, wired through §6.1's forbidden-hooks filter.
5. **Slice 2 & 3 are deferred** until the W3–4 tournament (Slice 2) and W5–6 (Slice 3). Do not build renderers before a format wins.

### Open questions carried forward (from plan appendix)
1. TikTok audit viability for aggregators serving our use case — re-verify vendor audit status before any v2 integration (limits drift within months).
2. Exact analytics API access per platform at Revora's account tier — resolve at Slice 3; manual CSV entry is the bridge.
3. Counsel Q8 (reversal-family, user-as-agent phrasing) — linter treats the whole family as hard-fail until counsel clears it.
4. Whether A2-generated hooks beat founder-written hooks — the W4 hook tournament answers this empirically; part of the engine's value case rests on it.
5. The [L]-graded analytics benchmarks (completion/hook-rate/share thresholds) — validate against Revora's own first cohorts, don't treat as ground truth.

---

## 5. Files & pointers

**Produced this session:**
- `docs/Revora_Video_Engine_Plan.md` — **the deliverable.** Read this first.
- `docs/handoff/2026-07-08-video-engine-plan-session-handoff.md` — this file.

**Consumed / reference:**
- `docs/Revora_90-Day_Distribution_Strategy.md` — parent strategy; §0.2 preflight, §5 video channel, §9.2 decision rules. The engine serves this.
- `docs/superpowers/plans/video_hooks_scripts_ideas.md` — hook-psychology swipe file (A2's mechanism library).
- `docs/content_mate/` — the reference n8n automation (`AI_Clone_content_Automation_yt.md` transcript + the v2.0.2 workflow JSON). Body-good/brain-wrong; §15 maps it.
- `docs/safety/claims-boundary.md`, `docs/safety/copy-ledger.md` — **the linter's source of truth** (not yet read in detail — do this before building A4).
- `docs/product-marketing.md`, `docs/ICP.md` — positioning + buyer (personas for A2).

**Git status:** working tree has the two new docs (untracked/modified). Nothing committed this session. Commit only if/when the founder asks; branch off `main` first if so.

**Notes for the next session:**
- Model/effort this session: mixed (Fable 5 default set mid-session). For the Slice-1 build, use a coding-capable model.
- `advisor` tool was unavailable this session.
- The deep-research raw output is in `/tmp/` (ephemeral) — everything durable is already in the plan's §2.
