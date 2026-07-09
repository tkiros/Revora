# The Short-Form Video Engine — Research-Backed Architecture & Execution Plan

**Version:** 1.0 · **Date:** 2026-07-07
**Scope:** End-to-end automation of the short-form video marketing pipeline (research → hooks → scripts → production → publishing → analytics → learning) for Revora.
**Research basis:** 29 sources fetched, 134 claims extracted, 25 adversarially verified (21 confirmed 3-0 or 2-1, 4 refuted). Primary sources: TikTok developer docs, FTC Health Products Compliance Guidance, 16 CFR Part 255/465, arXiv 2512.08769 (production agentic workflows), n8n production templates, platform API docs.
**Subordinate to:** `docs/safety/claims-boundary.md` and the §3.2 compliance pre-flight in `docs/Revora_90-Day_Distribution_Strategy.md`. When this document and those disagree, they win.

---

## 1. Executive summary

The engine you sketched is **technically feasible today** — a chain of best-of-breed services (LLM scripts → ElevenLabs voiceover → Whisper captions → template renderer → publisher) runs idea-to-published-video on a daily schedule, and public production templates prove the exact chain works end-to-end ([n8n 3121](https://n8n.io/workflows/3121-ai-powered-short-form-video-generator-with-openai-flux-kling-and-elevenlabs/), [n8n 3442](https://n8n.io/workflows/3442-fully-automated-ai-video-generation-and-multi-platform-publishing/)).

**But the binding constraints are not technical. They are platform policy and law**, and they reshape the architecture:

1. **TikTok's API prohibits the naive version of this system.** "A utility tool to help upload contents to the account(s) you or your team manages" and "an app that copies arbitrary contents from other platforms" are *explicitly listed as unacceptable use cases* ([TikTok Content Sharing Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines)). Unaudited API clients can only post **private (SELF_ONLY)** content, capped at 5 users/24h; even audited clients get ~15 posts/day/creator and 6 requests/min ([Direct Post reference](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post)). Fully-automated public TikTok posting from a self-built client is off the table in v1.
2. **FTC rules make health-adjacent claims a substantiation-and-disclosure problem that cannot be automated away.** Advertisers are liable for claims made through testimonials/creators as if made directly; "results not typical" disclaimers don't cure anything; disclosures in short-form video must be **built into the medium** (audible + visual, "unavoidable" — a bio link doesn't count) ([FTC Health Products Guidance](https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance), [16 CFR 255](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255)). For Revora this lands on top of an already-strict internal claims boundary.
3. **Platform-side AI moderation is a live operational risk.** Meta escalated AI enforcement across Instagram in 2026 and wrongfully banned large numbers of legitimate accounts (corroborated by TechCrunch/Engadget coverage of Meta's own Oversight Board findings). Automated posting patterns raise that risk; the email list and owned group remain the storm shelter.

**The strategic recommendation** (detail in §14): build the engine as a **content operating system with a human publish gate**, not an auto-poster. Automate the parts where automation compounds — research mining, hook/script generation, compliance linting, asset production for one repeatable format, metrics ingestion, and the weekly learning report — and keep a human on the two steps where automation is either illegal-adjacent or brand-fatal: **claims sign-off and the publish button**. Sequence the build behind the 90-day plan's own gates: the engine scales a *winning* format; it cannot find one for you. Don't build the renderer before the W3–4 format tournament tells you what to render.

---

## 2. Key findings from research

Confidence: **[H]** = confirmed 3-0 against primary sources · **[M]** = confirmed with caveats or secondary sources · **[L]** = extracted from practitioner sources, not adversarially verified (directional, not load-bearing).

### Platform & API reality
- **[H]** TikTok Content Posting API: 6 req/min per user token; daily per-user post caps (`spam_risk_too_many_posts`); per-client active-user caps; ~15 posts/day/creator shared across **all** API clients on an account.
- **[H]** Unaudited TikTok clients → private-only posting, 5 users/24h, account must be private. Public automated posting requires passing TikTok's audit (reported 5–10 business days) — and the audit evaluates your *use case*, where "team upload utility" is explicitly unacceptable. Third-party aggregators (upload-post, Blotato, Buffer-class tools) hold their own audited access, which is why they work — but using one shifts rather than eliminates the ToS risk.
- **[M]** Instagram Graph API: ~100 API-published posts/24h per Business/Creator account; requires app review. YouTube Data API: 10,000 units/day default quota; each upload costs ~1,600 units → **~6 automated uploads/day** without a quota increase.
- **[M]** Platform biases differ: TikTok rewards raw completion on 15–34s clips; Reels penalizes TikTok watermarks; Shorts feeds viewers into long-form. Cross-posting needs per-platform re-rendering (clean exports — already a rule in the 90-day plan).
- **[M]** Meta's 2026 AI moderation wrongfully disables legitimate accounts without warning; appeals are slow. Assume any single account can die; never let the engine's state live in a platform account.

### Compliance (health-adjacent, on top of Revora's own boundary)
- **[H]** FTC truth-in-advertising applies fully to organic social/creator content — "advertising" explicitly includes social media and claims made through intermediaries.
- **[H]** Any performance/results claim (including in a testimonial or UGC-style video) requires **competent and reliable scientific evidence on file before it runs**; testimonials are not evidence; dramatic-results testimonials are deceptive even when literally true unless typical results are disclosed.
- **[H]** Material-connection disclosures (paid creators, free product, affiliates) must be clear and conspicuous; in video that means **dual-mode (audible + visual) and unavoidable**. The 2024 fake-reviews rule (16 CFR 465) carries ~$51,744/violation civil penalties for fake testimonials/engagement.
- **[H — refuted claim worth remembering]** The idea that health claims "always require RCTs" was refuted 0-3. The standard is flexible ("competent and reliable scientific evidence" appropriate to the claim). Don't hard-code an RCT-only gate; do keep a substantiation file per claim family (Revora already does: CDC DPP citation, meal-sequencing research, hedged).

### Architecture patterns
- **[H]** The strongest verified engineering guidance ([arXiv 2512.08769](https://arxiv.org/html/2512.08769v1)): **each LLM agent owns exactly one task** (monolithic multi-tool agents skip tools, mis-order tools, or call the wrong one), and **everything deterministic — API calls, DB writes, rendering, publishing — is a pure function executed by the workflow, never routed through an LLM** (cheaper, faster, testable, side-effect-controlled).
- **[H]** A spreadsheet-as-state-store, linear daily-scheduled pipeline is a proven MVP shape (idea row → assets → render → publish → write results back to the row). Graduate to a real DB when states multiply.
- **[M]** Prompts should be externalized (files in the repo, loaded at runtime) so they can be reviewed and iterated like copy — this *is* the governance layer for generated content.
- **[M]** A 60-second video renders end-to-end in ~3–8 minutes through these stacks; render APIs are FFmpeg-backed and have throughput caps that matter at batch scale.

### Analytics & experimentation (the least-verified area — treat as strong priors, validate against your own data)
- **[L]** Completion rate is the primary algorithmic distribution signal. Benchmarks: 80%+ completion for <15s, 60%+ for 15–30s, 50%+ for longer. Nearly half of viewers who survive 3 seconds watch to 30 — the first 3 seconds are the decisive gate (this matches the 90-day plan's ≥75–80% 3-sec retention gate).
- **[L]** Two distinct early metrics: **hook rate** (3-sec views ÷ impressions) and **hold rate** (completions ÷ 3-sec views). A video can have a great hook and a broken body — diagnose them separately.
- **[L]** Share rate ≥2% signals breakout content (10–100× distribution); saves signal buy-intent; follower count and likes are vanity.
- **[L]** Experimentation that works at organic scale: change **one variable per test** (hook, pacing, proof placement, CTA format); ~10–15 posts per hypothesis before judging; weekly cadence (audit → pattern analysis → briefs → production); a practitioner heuristic is "publish ~10 organic, put paid only behind the top 2." Statistical purity is unavailable under algorithmic distribution noise — use repeated wins across variants, not single-post p-values.
- **[L]** 80%+ of social video is watched muted → captions are mandatory, and the visual-text hook is a separate creative surface from the spoken hook (consistent with the STI framework in `docs/superpowers/plans/video_hooks_scripts_ideas.md`).

---

## 3. Critique and improvement of the initial model

The initial structure is directionally right — the five-agent decomposition, "structured video specifications, not just raw scripts," and "human approval before posting" all survive research contact. What follows is what's wrong, weak, or missing.

### What's wrong

**W1 — Agents 4 and 5 shouldn't be agents.** Production (voiceover, captions, render, crop) and publishing are deterministic API orchestration. Routing them through an LLM adds cost, latency, and non-determinism to steps that must be exactly repeatable [H]. Production is a **render service**; publishing is a **scheduler + adapters**; analytics *ingestion* is a **cron job**. Only analytics *interpretation* is agent work.

**W2 — "Publishing queue → platform-specific publishing flows" assumes API posting is a solved problem.** On TikTok it is approximately prohibited for this use case [H]. The publishing layer must be designed around three modes per platform (native API / aggregator / human-assisted), not one.

**W3 — The learning loop as sketched will overfit.** "Top hooks / dead hooks" from single organic posts is noise: distribution variance under the algorithm swamps creative quality at small n. The loop needs experiment structure (one variable, multiple posts per cell, cross-variant repetition) before its outputs are allowed to update anything.

### What's missing (each of these becomes a first-class component in §4)

**M1 — The compliance gate.** For a health-adjacent brand this is not a nice-to-have; it is the component the whole system exists downstream of. Every generated hook, script, caption, and on-screen text must pass (a) an automated linter encoding the claims boundary (banned-word/claim-family scan, agent-check, disclaimer presence, capability-truth check) and (b) a **human sign-off that never gets automated** for anything claim-adjacent. The FTC findings [H] plus Revora's own §3.2 pre-flight make this the one gate with no v∞ automation path.

**M2 — Brand memory / repetition control.** Simplistic pipelines converge on sameness — the LLM regenerates its own favorite hook forever, and the account reads as slop within three weeks. The system needs an embedding-similarity check of new hooks/scripts against everything published in the last N days, plus pillar/persona quotas per week.

**M3 — A substantiation file.** A registry mapping each approved claim family → its evidence + approved phrasings (Revora largely has this in `claims-boundary.md` and the copy ledger; the engine must consume it programmatically, not re-derive claims).

**M4 — The disclosure engine.** Deterministic injection of the disclaimer/disclosure into caption text, pinned-comment text, and (where a claim is spoken) on-screen text — enforced by the render template, not by prompt hope [H].

**M5 — Experiments as an entity.** The data model has content and metrics but no *hypothesis*. Without an Experiment table, the analytics agent has nothing to evaluate against and "next-week experiments" is vibes.

**M6 — Account safety & pacing.** Post-spacing (≥2h), per-platform daily caps, no delete-and-repost, warm-up schedules, strike-response (48h pause + audit per the 90-day decision rules). This is a scheduler policy module, not folklore in a doc.

**M7 — Cost & observability.** Per-video cost tracking (LLM + TTS + render + API), pipeline state visibility, dead-letter handling for failed renders/publishes. The n8n templates' known failure modes are exactly here: async polling on video-gen, render errors, rate limits [M].

**M8 — The human is a state, not an afterthought.** "Semi-automated with approval" fails in practice when the review surface is bad. Review must be a first-class pipeline state with a purpose-built surface (see §10) — otherwise the founder becomes the bottleneck and starts rubber-stamping, which is worse than manual.

**M9 — Format-capability honesty.** Of the five candidate formats, only some are automatable at all (see §6). UGC-style confession videos are founder-face content — an "AI UGC" version is both off-brand (trust posture) and FTC-risky. The engine must know which formats it owns and which it merely assists.

### What survives as-is
Research → positioning → scripting as three separate reasoning steps [H — matches single-task-agent guidance]; structured VideoSpecs; core services (orchestrator, DB, object storage, queue) as the skeleton; human approval before posting in v1.

---

## 4. Recommended system architecture

```
                        ┌─────────────────────────────────────────────┐
                        │   SYSTEM OF RECORD (sheet → Postgres later)  │
                        │ insights · angles · hooks · specs · assets · │
                        │ posts · metrics · experiments · learnings ·  │
                        │ compliance_reviews · substantiation registry │
                        └─────────────────────────────────────────────┘
       JOBS (cron)              AGENTS (single-task LLM)        SERVICES (pure functions)
┌─────────────────────┐   ┌───────────────────────────┐   ┌──────────────────────────────┐
│ VOC harvesters       │→ │ A1 Research Miner          │   │ P1 Voiceover (ElevenLabs)     │
│ (Reddit/comments/    │  │ A2 Angle & Hook Strategist │   │ P2 Captions (Whisper align)   │
│  FB questions dump)  │  │ A3 Spec Builder            │→  │ P3 Renderer (Remotion or      │
│ Metrics ingestion    │→ │ A4 Compliance Linter*      │   │    Creatomate template)       │
│ (platform APIs/CSV)  │  │ A5 Pattern Analyst         │   │ P4 Crop/re-render per platform│
└─────────────────────┘   └───────────────────────────┘   │ P5 Publisher adapters +       │
                                     │                     │    pacing policy              │
                                     ▼                     └──────────────────────────────┘
                          ┌───────────────────────────┐
                          │ HUMAN GATES (never removed │
                          │ for claim-adjacent output) │
                          │ G1 claims sign-off          │
                          │ G2 publish approval         │
                          └───────────────────────────┘
```
\* A4 is agent + deterministic wordlist/regex pass; its output is advisory — G1 is the decision.

**Design rules (from the verified engineering guidance):**
1. **Agents reason; services act.** No LLM ever calls a publish API or writes final state. Agents emit structured JSON into the system of record; the workflow validates it and moves the state machine.
2. **One agent, one job.** Five narrow agents with typed inputs/outputs, not one "content agent" with ten tools.
3. **Prompts are files in the repo** (`/prompts/*.md`), versioned, reviewed like copy. The prompt for A2 embeds the hook-psychology swipe file distillation; the prompt for A4 embeds the claims boundary. When the boundary doc changes, the prompt changes in the same PR.
4. **Everything has a state machine** (see §9). Every artifact is resumable; every failure lands in a dead-letter state a human can see.
5. **The orchestrator is boring.** MVP: a scheduled script (GitHub Actions cron or a Vercel cron — the app already lives on Vercel) walking rows through states. n8n is an acceptable alternative if you prefer visual debugging; do not build a custom queue before the sheet hurts. Graduate to Postgres + a real queue when (a) >2 formats are in production, (b) >30 assets/week, or (c) two people work the review queue.

**What each layer owns:**
- **Jobs** — anything on a clock with no judgment: harvest VOC dumps, pull metrics, snapshot analytics, retry failed renders, send the Friday report.
- **Agents** — anything requiring judgment with a checkable output: mine insights, generate angles/hooks, build specs, lint claims, find patterns.
- **Services** — anything with side effects: synthesize, render, crop, publish. Pure functions, unit-tested, no LLM in the call path.
- **Humans** — anything where being wrong is unrecoverable: claims, publish, brand.

---

## 5. Agent design and responsibilities

| Agent | Cadence | Input | Output (typed) | Never does |
|---|---|---|---|---|
| **A1 Research Miner** | Weekly (feeds the existing Sunday VOC session) | Raw dumps: new r/prediabetes + r/diabetes_t2 posts, own video/post comments, FB group questions, owned-group threads | `Insight` cards: verbatim quote, source link, pain theme, frequency count, suggested pillar | Scrape at volume against platform ToS; invent verbatims; touch competitor *content* (comment-section questions only) |
| **A2 Angle & Hook Strategist** | Weekly batch | Approved Insights + `Learning` records + hook-framework library (scenario injection, curiosity gap, attention anchor, STI visual-text, curiosity reloops — from the swipe file) | `Angle` cards + 5–10 `Hook` variants each: spoken hook, visual-text hook (3–7 words, per STI), format tag, persona tag, CTA type, pillar | Write claims not in the substantiation registry; reuse a hook >0.85 cosine-similar to last 30 days' output (M2 check runs on its output) |
| **A3 Spec Builder** | Per approved hook | Approved Hook + format template | `VideoSpec` JSON: hook (spoken + on-screen), beat-by-beat VO script with a curiosity reloop at the hook→body seam, shot/asset list, caption file text, CTA + placement (post-value, not end), disclosure block, target duration, platform variants | Mock product output (screen-recordings are always the real app — brand rule); place CTA in first 5 posts of a new account |
| **A4 Compliance Linter** | Per spec, pre-review | VideoSpec + claims-boundary + forbidden-word list + approved vocabulary | `ComplianceReport`: pass/flag per §3.2 checklist item, quoted offending spans, suggested compliant rewrite | Approve anything. It flags; the human gate decides. A hard-fail on banned families (reversal/cure/numbers-attributed-to-Revora) blocks the spec from even reaching review |
| **A5 Pattern Analyst** | Weekly (Friday) | Metrics snapshots joined to posts/hooks/experiments | `Learning` records (pattern, evidence, confidence, affected pillar/persona) + next-week `Experiment` proposals + the Friday report | Update A2's prompt directly (learnings flow through the system of record and a human reads the Friday report first); conclude from n=1 |

**Explicitly not agents:** production (P1–P4), publishing (P5), metrics ingestion. Per §3-W1.

**Human roles** (solo founder = all of them, which is why each is time-boxed): claims sign-off (G1, batched, ~15 min/day), publish approval + any manual posting (G2, batched with scheduling), on-camera work for founder-face formats, the Friday review (reads A5's report, approves next week's experiments).

---

## 6. Content generation and production workflow

### Format-capability matrix (which formats the engine can own)

| Format (from initial structure + 90-day plan pillars) | Automatable? | Production path |
|---|---|---|
| **Text-on-screen myth/label-trap videos** (P3/P4 pillars) | **Fully** — the beachhead format | Spec → TTS VO or music-only → Remotion/Creatomate template (brand fonts/colors, caption track, disclosure frame) → render |
| **Slideshow videos** (checklist, "3 levers," starter-pack) | **Fully** | Same template family, image cards instead of video track |
| **Screen-recording check demos** (P1 — the conversion workhorse) | **Semi** — the demo itself must be the real app, recorded honestly (never mocked) | Human records the check once (or a Playwright script drives the real live app and captures video — honest, since it *is* real product output); engine wraps it: hook card, captions, VO, end-card, per-platform crops |
| **Food "is this okay?" clips** | **Semi** | Stock/AI food b-roll + real check screen-recording + engine assembly. AI-generated food imagery is allowed; AI-generated *verdicts* are not — the card on screen is always a real check |
| **UGC-style confession / founder story** (P5) | **No** — assist only | Founder films; engine supplies script, captions, hook variants, crops, scheduling. AI-avatar "UGC" is ruled out: off-brand for a trust-led product and adjacent to fake-testimonial exposure [H] |

### 6.1 Format & Length Spec (enforced as VideoSpec fields)

Three decisions the engine hard-codes: how long each format runs, whether it's faceless, and — most important — which persuasion patterns are forbidden for this brand even though they go viral elsewhere.

#### Length bands (per-format, enforced as `duration_s` bounds)

The evidence converges on **15–35 seconds, sweet spot ~20–30s**; do not go longer in v1. TikTok is algorithmically tuned for **15–34s** clips and rewards raw completion; completion gates get harder with length (**80%+ for <15s, 60%+ for 15–30s, 50%+ for longer** [L]). A Facebook study found sub-15s is often **too short for the brain to process the payoff** (their sweet spot 25–45s) — so 15s is a floor, not a target. Your own three flagship scripts already sit at 20/25/30s — correct instinct.

| Format | Duration band | Face? |
|---|---|---|
| Check demos (P1) | **15–25s** | Faceless (screen + VO) |
| Myth-bust / label-trap (P3) | **20–30s** | Faceless (text-on-screen) |
| Slideshow / checklist / starter-pack (P2/P4) | **20–30s** | Faceless |
| Food "is this okay?" clips | **15–25s** | Faceless |
| Founder story / honesty (P5) | **up to 35–40s** — the one exception; trust content earns dwell time | **Face — required** |

The **first 3 seconds are the decisive gate** regardless of total length (nearly half who survive 3s watch to 30 [L]) — so the hook, not the runtime, is what the engine optimizes. A5's kill/scale decisions read completion *relative to the format's band*, never absolute seconds.

#### Faceless vs. face (mixed by design — not an accident)

The faceless formats (check demos, myth-busts, slideshows, food clips) are what the **engine mass-produces**. But a 100%-faceless account reads as exactly the overclaiming AI content farm this audience is pre-burned by — so **founder-face content is load-bearing**, especially the pinned P5 story. Split: engine drives volume on faceless formats; the founder films the trust/story pieces. **AI-avatar "UGC" stays permanently ruled out** — off-brand for a trust-led product *and* adjacent to fake-testimonial exposure [H].

#### Suitability — the forbidden-hooks list (A4 linter hard-fails these)

Not every persuasive pattern is suitable. Three of the swipe file's highest-performing viral patterns are **actively wrong** for Revora and the engine must never generate them:

| Forbidden pattern | Why it's banned here |
|---|---|
| **Polarizing / taboo / "controversial" hooks** (shock-value openers) | Violate trust-killers #1 (shame) and #2 (fear-porn); one kills a health community forever |
| **Fear / urgency / implied-danger pattern interrupts** ("do X *right now*", countdowns) | Banned by the plan: no fake urgency, no "before it's too late," no complications imagery |
| **Dramatic-results / testimonial hooks** ("this fixed my A1C") | FTC-fatal without substantiation + typical-results disclosure [H]; banned by the claims boundary |

**The distinction the engine encodes:** the swipe file is a library of *mechanisms* — scenario injection, curiosity gap, attention anchor, curiosity reloop, STI visual-text hook, CTA-after-value placement — **not a library of tones**. A2 may use the structures; A4 hard-fails any hook that imported a viral pattern's *aggression* along with its *structure*. For this ICP (the scared, recently-diagnosed searcher) the persuasion is **curiosity + relief + specificity, not shock** — a calm "watch what it says about your 'healthy' breakfast, and the fix keeps the food" out-converts any polarizing hook, because here the trust *is* the persuasion.

### The production pipeline (per spec, all deterministic)

```
VideoSpec (approved at G1)
  → P1 voiceover: ElevenLabs, fixed brand voice ID, per-beat audio files
  → P2 captions: Whisper alignment → styled caption track (≥80% watch muted [L])
  → P3 render: template(format) + assets + audio + caption track + disclosure frame
       – disclosure block is a template LAYER, not spec text: if spec.claims ≠ ∅,
         the disclaimer renders on-screen for ≥2s AND ships in the caption text (16 CFR 255.0(f) dual-mode [H])
  → P4 per-platform variants: 9:16 master → clean exports (no watermarks — Reels penalty [M]),
       platform-safe title/caption text, cover frame
  → assets to object storage; row → READY_FOR_REVIEW
```

**Renderer choice:** Remotion if you want it in-repo and code-reviewed (you're a TS/Next shop; templates live next to the app, CI-tested); Creatomate if you want zero render infra (JSON template API, ~$41/mo entry [M]). Start with **Creatomate** — no infra to babysit at MVP volume; move to Remotion if template flexibility becomes the constraint. FFmpeg direct is the fallback for crops/concats only.

**Volume targets:** the 90-day plan calls for 2 masters/day ×3 platforms at full cadence. The engine's job is to make a master cost ~10 founder-minutes (approve hook, approve spec, glance at render) instead of ~90. At ~3–8 min render time per video [M], the constraint is review attention, not compute — which is why G1/G2 surfaces matter more than render speed.

---

## 7. Distribution and publishing workflow

### Per-platform posture (v1)

| Platform | Mode | Mechanics | Constraint driving it |
|---|---|---|---|
| **YouTube Shorts** | **API auto-publish** (after G2 approval) | YouTube Data API, scheduled publish; ~6 uploads/day quota ceiling [M] — far above need | Most automation-friendly; API posting is normal here |
| **Instagram Reels** | **API scheduled** via Graph API (Business account, app review) or Meta's native scheduler | 100 posts/24h cap is irrelevant at our volume [M] | Main risk is Meta's moderation AI [M] → conservative pacing, no bursts |
| **TikTok** | **Human-assisted**: engine prepares the package (video file, caption, cover, pinned-comment text with link+disclaimer), founder posts via TikTok's native scheduler/app in one daily 15-min batch | Unaudited API = private-only [H]; our use case is a listed-unacceptable audit case [H] | Do not build a TikTok API client in v1. Revisit only via an established audited aggregator (§12) |
| **Facebook (page/groups)** | Manual (groups forbid links anyway per the 90-day plan) | Engine supplies text variants only | Community channel, not a publishing target |

**Aggregator question:** a single aggregator API (upload-post-class tools, Buffer, Blotato) does cover TikTok+IG+YT with one integration [H], because the vendor holds audited access. It's the pragmatic v2 path — but it *shifts* rather than removes ToS exposure, and a vendor losing its TikTok audit kills your pipe overnight. v1 doesn't need it: three platforms at ≤2 posts/day each is one founder batch session.

### Scheduler policy module (deterministic, enforced in P5)
- ≥2h spacing between posts on the same platform (existing hygiene rule); per-platform daily caps (default 2/day, hard 3); no delete-and-repost, ever.
- New-account warm-up profile: engage-only days, no-CTA first 5 posts (per 90-day §5.2) — encoded as scheduler states, not memory.
- **Strike response is automated:** any platform strike/flag → that platform's queue freezes for 48h, a compliance re-audit task on the last 10 posts is opened, resume at half volume (90-day decision rule 4, now enforced by the system).
- Every published post writes back: platform post ID, URL, publish time, UTM used — the join key for analytics.

**Approval:** in v1 **every post passes G2**. The founder approves in batches; approval means "scheduled," and the scheduler owns timing. §10 defines what could ever skip G2 (spoiler: less than you'd hope).

---

## 8. Analytics and learning loop

### Metric hierarchy (per platform, per post, snapshotted at 24h / 72h / 7d / 28d)

1. **Hook rate** = 3-sec views ÷ impressions — did the packaging work? Gate: ≥75–80% (existing plan threshold).
2. **Hold rate** = completions ÷ 3-sec views — did the body work? Benchmarks: 80%+ (<15s), 60%+ (15–30s) [L]. Diagnose hook and body **separately** — they fail independently [L].
3. **Buy-signals:** save rate (≥1.5% = buy-signal content — existing threshold), share rate (≥2% = breakout [L]), "what app?" comments (counted by a job scanning comments).
4. **Funnel:** profile/link CTR (UTM per platform per post) → landing → **first-checks attributed** (the onboarding attribution answer + UTM) → payers. First-checks remain the ⭐ metric; views are diagnostic, not the scoreboard.
5. **Vanity (ignored in decisions):** followers, likes [L].

**Ingestion:** platform analytics APIs where available (YouTube Analytics API is good; TikTok/IG organic analytics APIs are limited for non-Business/unaudited apps) — v1 fallback is a **weekly 20-minute manual CSV/screenshot entry** into the metrics table. Do not let missing APIs block the loop; the loop needs numbers, not elegance.

### The learning loop (weekly, matches the existing Friday review)

```
Mon–Thu: posts accumulate snapshots
Fri:  A5 Pattern Analyst runs →
      1. joins metrics to hooks/formats/personas/experiments
      2. evaluates ONLY structured experiments (≥4 posts per cell, one variable)
      3. emits Learning records + proposed next-week Experiments + the Friday report
Founder (30 min): reads report, accepts/edits experiments, kills/scales formats
      → accepted Learnings become retrieval context for A2 next Monday
      → decision rules (90-day §9.2) applied mechanically: ≥75% retention + ≥1% saves
        → 5 variants in 72h; <50% retention ×5 attempts → kill format, keep topic; etc.
```

### Experiment design (the guard against overfitting)
- **One variable per experiment** (hook family, format, persona, CTA type) [L]; everything else held constant.
- **≥4 posts per cell before judging; ~10–15 posts per hypothesis** [L]. Organic distribution is noisy — a "dead hook" verdict requires repeated failure across variants and (ideally) two platforms, not one flopped post.
- **The variant ladder:** when a video wins, A2/A3 generate 5–7 variations (new hook phrasing, new visual, same skeleton) [L] — this is the highest-ROI automation in the whole engine, and it's the existing plan's rule 1 made cheap.
- **Weekly, not real-time.** Reacting to daily numbers trains the system on noise. The cadence that compounds is the weekly audit → pattern → brief → produce rhythm [L].
- The 90-day W3–4 **format tournament and W4 hook tournament run through this machinery** — they are just the first two experiments in the table.

---

## 9. Data model and state management

MVP: these are tabs in one spreadsheet (proven pattern [H]). The columns below are the schema you keep when graduating to Postgres.

```
insight        (id, verbatim, source_url, theme, pillar, freq_count, status: NEW→APPROVED→USED)
angle          (id, insight_ids[], premise, enemy, persona, status)
hook           (id, angle_id, spoken_text, visual_text, framework_tag, cta_type,
                similarity_max_30d, status: DRAFT→APPROVED→SPECCED→RETIRED)
video_spec     (id, hook_id, format, beats_json, asset_list, caption_text, disclosure_block,
                claims_used[], duration_s,
                status: DRAFT→LINTED→IN_REVIEW→APPROVED→PRODUCING→READY→PUBLISHED→KILLED)
compliance_rev (id, spec_id, linter_report_json, human_verdict, reviewer, ts)   ← audit trail, kept forever
asset          (id, spec_id, kind: vo|captions|master|variant, platform, storage_url, cost_usd)
post           (id, spec_id, platform, scheduled_at, published_at, platform_post_id, url, utm)
metric_snap    (post_id, at: 24h|72h|7d|28d, impressions, views_3s, completions, saves,
                shares, comments, link_clicks, first_checks_attr)
experiment     (id, hypothesis, variable, cells_json, min_posts_per_cell, status, verdict, ts)
learning       (id, experiment_id?, pattern, evidence_post_ids[], confidence, active: bool)
claim_registry (id, claim_family, approved_phrasings[], evidence_source, counsel_status)   ← from claims-boundary.md
```

**State rules:**
- A spec cannot enter `IN_REVIEW` without a `LINTED` report; cannot enter `PRODUCING` without a human `compliance_rev.verdict = pass`; cannot enter `PUBLISHED` without G2. The state machine *is* the approval model.
- Every state transition is timestamped; anything stuck >48h in `PRODUCING`/`READY` appears in the daily digest (dead-letter visibility, §3-M7).
- `compliance_rev` and `claim_registry` are append-only — that's your defense file if a claim is ever challenged [H].
- Per-asset `cost_usd` accumulates to per-video and per-first-check cost — the number that decides channel allocation (90-day rule 8).

---

## 10. Human approval and quality control model

**Automate / semi-automate / never — the honest split:**

| Fully automate (now or soon) | Semi-automate (machine drafts, human approves) | Never automate |
|---|---|---|
| VOC dump collection; metrics ingestion; caption generation; rendering; per-platform crops; disclosure injection; post-spacing/pacing; variant generation of winners; similarity/repetition checks; cost tracking; Friday report assembly | Insight selection; hook/angle approval; spec approval; publish scheduling; comment-reply drafts (P7 pillar); experiment design | **Claims sign-off (G1)** — FTC liability + claims boundary [H]; **any testimonial/endorsement content**; **any new claim family** (goes to counsel, not to a prompt); **crisis/strike response**; founder-face content; anything touching the T3/T9 (ED/ARFID-adjacent) no-market gate |

**The two gates, operationally:**
- **G1 Claims sign-off** — a daily 15-minute batch. The surface shows: spec text with linter flags inline (offending spans highlighted, suggested rewrites), the §3.2 checklist pre-filled by A4, one approve/reject/edit action per spec. The linter makes review *fast*; it never makes it *optional*. Hard-fail families (reversal/cure/numbers/predictions) never reach the human — they bounce to A3 with the violation named.
- **G2 Publish approval** — batched with scheduling. Watch the render (at 2×), confirm the first frame reads as a hook (the money frame), confirm capability-truth (nothing promised that isn't live — 90-day trust-killer 7), schedule.

**Could G2 ever be skipped?** Only for the narrowest class: a variant of an already-approved winner, same claims set, same format template, similarity-checked — *maybe*, in month 3+, for text-on-screen posts only. Even then G1 stands. The research verdict is blunt: in health-adjacent content, the human gate is the product's trust posture expressed as process.

**Quality floors (enforced by linter + template, pre-G1):** caption track present; visual-text hook ≤7 words; disclaimer present when claims_used ≠ ∅; no forbidden vocabulary; similarity_max_30d ≤ 0.85; duration within format band; real-app-only rule for any product screen.

---

## 11. MVP plan

**Sequencing principle:** the engine scales what works; the 90-day plan discovers what works. Build in three slices, each gated on the distribution plan actually needing it. Total new build: ~2–3 weeks of part-time effort spread across the 90 days, not a quarter of infra up front.

### Slice 1 — "The script factory" (build now; ~3–4 days) → serves W1–W4
The highest-leverage, zero-risk piece: everything up to the render.
- One spreadsheet with the §9 tabs.
- A1 (research miner over the weekly VOC dump), A2 (hooks — prompt embeds the swipe-file frameworks), A3 (specs), A4 (linter — prompt embeds claims-boundary; hard-fail wordlist is a plain regex pass).
- G1 review = a formatted sheet view + 15 min/day. No renderer, no publisher — the founder still shoots/edits per the 90-day plan, but scripts, hooks, captions, and compliance pre-checks arrive done.
- **Value test:** hook/script prep time drops from ~hours to ~minutes/week, with zero §3.2 violations reaching a published asset. If A2's hooks lose to hand-written hooks in the W4 tournament, fix the prompt before building anything else.

### Slice 2 — "The renderer" (build when the W3–4 tournament crowns a format; ~4–5 days)
- One Creatomate template family for the **winning automatable format** (likely text-on-screen myth/label-trap or slideshow). ElevenLabs VO + Whisper captions + disclosure layer + per-platform crops.
- The variant ladder: one command turns a winner into 5–7 render-ready variants (decision rule 1, made cheap).
- If the tournament crowns the check-demo format instead: build the wrapper pipeline (hook card + captions + end-card around founder-recorded screen captures) — smaller, same slice.

### Slice 3 — "The loop" (build by W5–W6; ~3–4 days)
- Metrics tab + weekly ingestion (API where easy — YouTube; manual entry where not — 20 min/week).
- A5 Friday report + experiment table; publishing checklist surface for the daily TikTok batch; YouTube API scheduling if volume justifies it.

**Explicitly deferred from MVP:** TikTok API anything; aggregator integration; Postgres/queue; auto-variant-publish; comment-scanning job; paid-loop integration. **Smallest viable version with real strategic value = Slice 1.** It attacks the true bottleneck (solo-founder hours per asset) with zero platform or compliance exposure.

---

## 12. Advanced version roadmap (only if Day-90 verdict is "scale")

**Phase A (months 4–5) — throughput.** Postgres + real queue; aggregator integration (established audited vendor; TikTok scheduling finally automated — accepted, documented ToS risk); comment-scanning job feeding P7 reply-demos and "what app?" alerts; G2 fast-path for variant-class posts; second format template family.

**Phase B (months 5–7) — learning depth.** Learnings as retrieval corpus for A2 (RAG over your own wins/kills); persona-conditioned generation (segments 1–5 from the 90-day plan as first-class dimensions); paid creative-testing loop — publish ~10 organic, put spend behind the top 2 [L], with TikTok's ~50-optimization-event learning-phase rule for paid cells [L]; multi-account architecture (backup accounts warmed, engine state platform-independent — the Meta-moderation insurance [M]).

**Phase C (months 7+) — scale-out, each item behind its own gate.** Creator/affiliate pipeline (engine supplies briefs + FTC disclosure blocks; every creator post passes G1; 16 CFR 465 makes fake-anything a penalties matter [H]); localization/re-voicing of proven winners; long-form → shorts repurposing when long-form exists. **Permanently out at every phase:** AI-avatar testimonial content; auto-published claim-bearing content without G1; anything the claims boundary bans.

---

## 13. Risks, bottlenecks, and mitigations

| # | Risk | Likelihood / impact | Mitigation (built into the design) |
|---|---|---|---|
| 1 | **FTC exposure** — a generated asset implies outcomes; a testimonial slips through | Med / **fatal** | G1 human gate, never removed; hard-fail linter families; substantiation registry; append-only compliance audit trail; disclosure engine dual-mode [H] |
| 2 | **TikTok ToS** — building the prohibited "team upload utility" | Certain if built naively / high | v1 = human-assisted TikTok posting; API path only via established audited aggregator, later, eyes open [H] |
| 3 | **Platform account ban** (esp. Meta AI moderation) | Med / high | Conservative pacing module; no bursts; warmed backup accounts; engine state platform-independent; email list + owned group as unbannable storm shelter [M] |
| 4 | **Slop convergence** — engine output becomes repetitive, account reads as AI content farm | High if unmitigated / high (algorithmic + brand penalty) | Similarity checks (M2); pillar/persona weekly quotas; founder-face formats stay human; harvested-not-brainstormed insight supply keeps inputs fresh |
| 5 | **Review gate becomes the bottleneck / rubber-stamping** | High / med | Purpose-built batch review surfaces; linter pre-work; daily time-boxes; volume follows review capacity, never the reverse |
| 6 | **Learning loop overfits to noise** | High / med (silent — it *feels* like learning) | Experiment structure (§8): one variable, ≥4 posts/cell, weekly cadence, cross-platform repetition before any "dead hook" verdict |
| 7 | **Cost runaway** (LLM + TTS + render + video-gen APIs) | Med / low-med | Per-asset cost column from day 1; per-video budget alert; no image-to-video gen (Kling-class, the expensive step) in any v1 format |
| 8 | **Pipeline brittleness** — async render polling, API drift, rate limits (the documented n8n-template failure modes [M]) | High / low each, corrosive in sum | State machine + dead-letter visibility; retries in jobs; the sheet makes every stuck item visible; re-verify platform limits before each build slice (they drift within months) |
| 9 | **Engine outruns strategy** — building renderers before a format has won; volume before the Day-0 preflight clears | Med / high (opportunity cost + the 90-day plan's own risk 1) | Slice gating in §11; the engine ships nothing the 90-day gates haven't earned |
| 10 | **Mock-demo temptation** — automating "product" footage that isn't real product output | Low / **fatal to trust posture** | Real-app-only rule enforced at spec level; check demos always real checks (Playwright against the live app is acceptable — it's real) |

**The two structural bottlenecks to accept rather than solve:** (1) founder review attention — the engine's throughput ceiling is ~30 approved assets/week for one reviewer, and that's fine, because (2) TikTok publishing is a daily manual batch in v1 — 15 minutes that buys total policy safety.

---

## 14. Final recommendation

**Build a content operating system, not an auto-poster.** The research is unambiguous: full automation of this pipeline is illegal-adjacent at the publishing edge (TikTok ToS [H]), liability-bearing at the claims edge (FTC [H]), and brand-corrosive at the creative edge (slop convergence) — while being *enormously* valuable everywhere in between. The winning architecture is the one that automates the middle and keeps humans at both edges:

1. **Automate the middle aggressively:** VOC mining → hooks (armed with the swipe-file psychology) → specs → compliance linting → captions/VO/render for one proven format → scheduling packages → metrics → the Friday learning report. This turns ~90 founder-minutes per asset into ~10 and makes the 2-masters/day cadence sustainable for a solo founder — the actual constraint the 90-day plan names (solo burnout).
2. **Keep humans at the edges permanently:** claims sign-off (G1) and the publish decision (G2). For a brand whose *entire differentiation is trust posture*, the human gate isn't overhead — it's the marketing strategy expressed as process.
3. **Sequence behind the strategy's own gates:** Slice 1 (script factory) now; renderer only after the W3–4 tournament crowns a format; the loop by W6; everything advanced only after the Day-90 verdict. The engine must never manufacture volume for a message that hasn't proven it converts — that's risk 9, and it's the single most common failure mode of automated content pipelines: *getting smarter at producing, without getting smarter at learning.*
4. **Platform posture:** YouTube API-first, Instagram scheduled-conservative, TikTok human-assisted until an audited aggregator earns its place, Facebook manual. The email list and owned group remain the storm shelter no platform can take.

The system becomes "smarter, not louder" through exactly one mechanism: **the experiment table**. Everything else — agents, renderers, schedulers — exists to feed it cheap, compliant, on-brand attempts and to route what it learns back into next week's hooks. Protect that loop's integrity (one variable, enough posts, weekly cadence) and the engine compounds; skip it and you've built an expensive way to post more.

---

## 15. Lean build path — no n8n, free tools (the recommended MVP)

The reference automation in `docs/content_mate/` (an n8n "Content Mate" workflow — 105 nodes: scrape 33 X handles → OpenAI commentary → ElevenLabs voice → Replicate AI-avatar clone → FFmpeg assembly → Blotato 9-platform publish, self-hosted on Hostinger) is a **working body with the wrong brain for Revora**. Its defining choices are each a §13 fatal risk here: trend-scraping *is* the TikTok-prohibited "copies content from other platforms" pattern [H]; the AI-avatar clone is the one format §6.1 permanently bans; it has no compliance gate, no claims boundary, no disclosure engine, and no learning loop. **Do not adopt it as-is.** But its *plumbing* is exactly the deterministic service layer §4 specifies — already built and cheap — so we keep the plumbing pattern and transplant this plan's brain, while dropping the two things Revora doesn't need at MVP: **n8n itself** and **paid TTS**.

### 15.1 Why no n8n (for us specifically)
n8n is a visual wrapper around cron + HTTP + shell + a datastore — all of which Revora already runs as a TypeScript/Next/Vercel shop. A self-hosted n8n box is net-new infra to babysit, off to the side of the codebase, uncovered by CI. Everything it does becomes a handful of in-repo TS files that are code-reviewed like the rest of the app. This *is* §4's "the orchestrator is boring" and §11's Slice 1 — not a downgrade.

### 15.2 Keep / Cut / Add against Content Mate

| Content Mate node/layer | Verdict | Revora replacement |
|---|---|---|
| Self-hosted n8n on Hostinger ($18/mo) | **Cut** | Plain TS scripts on **Vercel Cron** (already deployed) or GitHub Actions cron. $0 |
| Airtable 23 nodes (state store) | **Keep pattern** | **Google Sheet** (free API) or Airtable free tier — the §9 schema |
| ⚙️ Setup node (one-place config) | **Keep — good idea** | One `config.ts` / one env group; all keys and IDs in one place |
| Scrape 33 X handles (`twitterapi.io`) | **Cut — the dangerous core** | **A1 VOC miner** over r/prediabetes + r/diabetes_t2 + FB questions + own comments (real demand, ToS-safe) |
| OpenAI "add commentary" (`Message a model`) | **Replace** | **A2 hook + A3 spec agents** (direct OpenAI/Claude calls), armed with the swipe-file mechanisms + claims registry |
| Replicate VEO3/Kling avatar clone (`clonevideo`, `HTTP LipSync`) | **Cut** — banned format, and VEO3 ≈ **$160 / 4-sec clip** | **No avatar.** Faceless text-on-screen / slideshow / real-app check-demo; founder films the P5 story |
| ElevenLabs voice (`Write Voice Full`) | **Replace with free** | §15.3 — often **no VO at all**; else Edge-TTS → Piper/Kokoro |
| ElevenLabs speech-to-text (`ElevenS2T`) | **Replace with free** | **Local Whisper** (`faster-whisper` / `whisper.cpp`) — free, offline, better |
| FFmpeg assembly (`executeCommand`, `Combine vids and music`, `Create Ass` captions) | **Keep** | **Remotion** (TS-native, in-repo, CI-tested) or `ffmpeg` via child_process — this is P1–P4 |
| Random music merge | **Keep** | Same; a small licensed/royalty-free library, picked per format |
| Blotato → 9 platforms, 3×/day auto | **Defer** | Human-assisted posting at MVP; YouTube Data API (free) when volume justifies; aggregator only in v2 behind the §13-risk-2 decision |
| Telegram publish pings | **Keep — cheap & nice** | ~20-line Telegram webhook for the daily digest / dead-letter alerts |
| Review = optional 5-min "schedule/no" | **Harden** | The `review` state becomes the **mandatory G1 claims gate** (§10) — never optional, runs the §3.2 pre-flight + disclosure injection |
| *(absent)* metrics + learning | **Add — the whole thesis** | Metrics tab + **A5 Friday loop + experiment table** (§8). Content Mate just posts; it never learns |

### 15.3 Voiceover — free, in priority order
First the lazy question: **the beachhead formats don't need VO.** Text-on-screen myth/label-traps and slideshows work on captions + music — ship those voice-free and the problem disappears for weeks. When you do want a voice:

1. **None** (text-on-screen + music) — $0, zero setup, and a large share of top faceless content works this way.
2. **Edge-TTS** (`edge-tts`) — free, **no API key**, Azure-quality neural voices. Uses Microsoft's online endpoint unofficially → fine now, ToS-gray at heavy commercial scale.
3. **Piper** (`rhasspy/piper`, MIT) or **Kokoro** (open-weight) — free, **local, unlimited, license-clean** — the permanent choice once a voice matters. Pick one fixed brand voice ID and never vary it (consistency = the account's "voice-face").

Captions are free regardless: **local Whisper**, not ElevenLabs S2T.

### 15.4 Minimal file layout (Slice 1 → Slice 2)

```
/video-engine
  config.ts                 # all keys/IDs in one place (the "setup node" idea)
  /prompts                  # externalized, versioned, reviewed like copy (§4 rule 3)
    a1-miner.md  a2-hooks.md  a3-spec.md  a4-linter.md  a5-analyst.md
  /agents                   # each = one prompted OpenAI/Claude call, one job (§5)
    miner.ts  hooks.ts  spec.ts  linter.ts  analyst.ts
  /services                 # pure functions, no LLM in the call path (§4 rule 1)
    tts.ts                  #  → 'none' | edge-tts | piper (swappable)
    captions.ts             #  faster-whisper
    render.ts               #  Remotion template(format) OR ffmpeg
    crop.ts                 #  per-platform 9:16 exports, clean (no watermark)
    disclosure.ts           #  inject disclaimer as render LAYER + caption text (dual-mode [H])
  sheet.ts                  # Google Sheet read/write = the state machine (§9)
  cron.ts                   # Vercel Cron entry: walk rows through states
  notify.ts                 # Telegram digest / dead-letter (optional)
```

**Build order (matches §11):**
- **Slice 1 (now, ~3–4 days):** `sheet.ts` + `config.ts` + `agents/*` + `prompts/*` + a formatted G1 review view. **No services yet** — founder still shoots/edits, but hooks, specs, captions-text, and compliance pre-checks arrive done. Zero platform/compliance exposure; attacks the real bottleneck (founder-hours/asset).
- **Slice 2 (after the W3–4 format tournament):** add `services/*` for the *winning* format only — `render.ts` (one Remotion template), `tts.ts` (start `'none'`, add Edge-TTS if needed), `captions.ts`, `disclosure.ts`, `crop.ts`.
- **Slice 3 (W5–6):** metrics tab + `analyst.ts` Friday report + experiment table; YouTube API publish if volume justifies.

### 15.5 Cost & the honest trade
Infra ≈ **$0** (Vercel Cron + Google Sheet + local Whisper + Edge-TTS/Piper + Remotion/OSS); running cost ≈ **LLM tokens only** — vs. Content Mate's Hostinger + Replicate ($160/avatar clip!) + ElevenLabs + Twitter API + Blotato. The one capability given up vs. Content Mate is **one-click 9-platform fan-out** — which §7/§13 already deferred behind the aggregator audit-risk decision, and which is moot at ≤3 platforms in a daily batch. Everything else transfers: the sheet-as-state, one-place config, FFmpeg assembly, and Telegram pings are kept as *patterns*, rebuilt in-repo, minus the server, the avatar, and the paid APIs.

---

### Appendix — open questions carried forward
1. TikTok audit viability for aggregators serving our use case → re-verify vendor audit status before any Phase-A integration (limits drift within months).
2. Exact analytics API access per platform at our account tier → resolve during Slice 3; manual entry is the bridge.
3. Counsel Q8 (reversal-family, user-as-agent phrasing) — unchanged; the linter treats the whole family as hard-fail until counsel says otherwise.
4. Whether A2-generated hooks beat founder-written hooks → the W4 tournament answers this empirically; the engine's value case partly rests on it.

### Appendix — key sources
Platform: [TikTok Direct Post API](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post) · [TikTok Content Sharing Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines) · Instagram Graph / YouTube Data API limits (secondary, verify at build).
Compliance: [FTC Health Products Compliance Guidance](https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance) · [16 CFR Part 255](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255) · [FTC Endorsements & Influencers](https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews) · 16 CFR Part 465 (fake reviews rule).
Architecture: [arXiv 2512.08769 — production agentic workflows](https://arxiv.org/html/2512.08769v1) · [n8n template 3121](https://n8n.io/workflows/3121-ai-powered-short-form-video-generator-with-openai-flux-kling-and-elevenlabs/) · [n8n template 3442](https://n8n.io/workflows/3442-fully-automated-ai-video-generation-and-multi-platform-publishing/) · Creatomate/ElevenLabs/Remotion vendor docs.
Analytics/experimentation (practitioner-grade, unverified): OpusClip TikTok analytics · Billo hook/hold-rate · TakeFlight creative-testing frameworks · Growth Rocket AI testing loops.
Internal: `docs/Revora_90-Day_Distribution_Strategy.md` · `docs/safety/claims-boundary.md` · `docs/superpowers/plans/video_hooks_scripts_ideas.md` (hook-psychology swipe file).
