# Revora — 90-Day Distribution Strategy

**Version:** 2.0 · **Date:** July 7, 2026 (Day 0 = the day the §0.2 preflight clears; targets below assume Day 0 ≤ July 13)
**Owner:** Founder (solo; ~25 hrs/wk on distribution)
**Supersedes:** v1.0 (archived at `docs/archive/Revora_90-Day_Distribution_Strategy_v1-archived-20260707.md`). v1 was written against an idealized product (photo-scan hero, GL numbers on screen, reversal-framed copy, trial funnel live, app-store presence). None of that is what's shipped. This version is written against the code on `main` and the verification reports of 2026-07-06.
**Positioning source of truth:** `docs/product-marketing.md` · **Claims source of truth:** `docs/safety/claims-boundary.md` (it wins over every line in this document — including any line you're tempted to keep from v1).

---

# PART 0 — What This Strategy Is Built On (and the gate before Day 0)

## 0.1 Product ground truth (as shipped, verified 2026-07-06/07)

What a stranger actually gets when they click a Revora link today:

- **A web app** at `revora-lovat.vercel.app` (custom domain `revora.bio` pending one DNS record). Installable PWA. **No native app in any store** — Play/App Store buttons on the landing page are waitlist links marked "coming soon."
- **A marketing landing at `/`** (shipped 2026-07-07): "Should I eat this? Answered in seconds." The app lives at `/check`.
- **The check:** you **type, dictate, or photograph** a meal (photo-assist was flag-flipped ON 2026-07-07 — photo → editable draft chips → *you confirm the text* → the engine decides; photos never stored; **verify it works on the live deploy before marketing it**, since the 07-06 e2e ran against the flag-off state and the photo path sits behind the same OpenAI blocker), enter your A1C once, and in ~5 seconds get one calm **decision card**: a verdict in plain words — **Clear / Be careful / Hold off** — one reason, one adjustment, one safer swap, and the disclaimer. **Never a number.** No glycemic-load score, no calories, no mg/dL. That's not a limitation to apologize for; it's the claims boundary and the brand ("no numbers to decode").
- **A1C-gated:** built only for 5.7–6.4%. Below or above, Revora says so plainly and routes to a clinician — verified live, byte-identical to the approved wording.
- **A coach layer (built and live):** first-run tour, guest history on-device, signed-in history, streaks without streak-guilt, weekly patterns, a behavioral weekly progress score ("counts what you did, never a lab prediction"), one gentle daily nudge.
- **Monetization, live mode:** freemium **legacy** — 5 free checks/day, **Premium $12.99/mo** (unlimited checks, history everywhere, weekly patterns, reminder; one-tap cancel; a $99.99/yr plan exists in code). A full **7-day card-gated trial funnel** (free Day-1 taste → trial → $12.99) is built and A/B-hardened (Today→Day-5→Day-7 timeline wall, "$0 due today" button, goal-gradient onboarding, endowment note) but **dormant behind `PAYWALL_MODE`** — and the landing page already describes the *trial* funnel. Price variants $9.99/$12.99/$19.99 exist in code for a ladder test.
- **Pantry Review:** a **$49 one-time** whole-kitchen report — everything you own sorted into *enjoy freely / worth a tweak / handle with care*, printable, **nothing renews**. This is the second product and the fastest honest revenue motion we have.
- **Trust engineering that is genuinely unusual for this category:** uncertainty admitted out loud ("when we're unsure, we say so"), conservative floors, A1C and meal text encrypted at rest, one-tap delete, pre-charge email two days before any trial charge, one-tap cancel on the account page, the CDC DPP 58% figure presented explicitly as *"a citation for the approach — not a result from Revora's users."*
- **Business reality:** solo founder, short runway, **zero users, zero revenue**. Standing kill-criterion from the 2026-07-04 design doc: **no payment after 100 direct asks → stop.**

## 0.2 The Day-0 preflight (nothing in Parts 5–10 starts until these clear)

Distribution pointed at a product that can't answer is worse than no distribution — it burns the only warm audiences we'll ever get for free.

| # | Blocker | Why it gates everything | Owner action |
|---|---|---|---|
| 1 | **OpenAI account unfunded** — every real check in production currently returns the calm `retry` fallback. The product cannot produce its core answer. | A Reddit user who tries the app and gets "try again later" three times is gone forever, and says so in the thread. | Fund the account, raise the tier (platform.openai.com → Billing). No code change. Then verify one real prod check returns a verdict. |
| 2 | **`/terms` renders bracketed placeholders** ("[Revora's operating entity — counsel to confirm]") in production. | Cannot take a stranger's card with placeholder terms. | Counsel/owner fills them. |
| 3 | **Custom domain** — links currently say `revora-lovat.vercel.app`. | A `.vercel.app` link in a health subreddit reads as a weekend project; `revora.bio` reads as a product. | Add the DNS A record → 76.76.21.21. |
| 4 | **Landing copy vs. live config mismatch:** the landing describes the 7-day trial funnel while the paywall runs legacy (5 free checks/day). Photo copy now matches code (flag flipped ON 2026-07-07) — but **verify one real photo→draft→verdict on the live deploy** before any asset shows it. | First-session promise-breaking is the one unforced error this audience never forgives (they're pre-burned by overclaiming apps). | Decide the paywall each way — flip the mode **or** edit the landing pricing copy. Either is fine; mismatch is not. Recommendation: launch with **legacy** (simpler, no card friction for week-1 strangers); flip to trial mode at the Part 10 W5 CRO point. |
| 5 | **Release gates red on `main`** (2 stale vitest expectations; ~20 Playwright failures from one test-infra race). | Not user-facing, but we will be shipping copy and funnel changes weekly — we need green gates to ship fast without fear. | Fix the two test files (already diagnosed: NEW-01, NEW-02). |
| 6 | **Attribution** — one question in onboarding ("Where did you hear about us?" — distinct from the existing "What brought you here?" segment step) + UTMs on every surface link. | Every Part 10 decision rule reads this. Without it the whole plan flies blind. | Small build task; ship before first post. |
| 7 | **Link-sharing basics missing** — no OpenGraph/Twitter meta, no `og:image`, no sitemap, no robots.txt. A Revora link pasted into Reddit, FB, or a DM renders bare. | Every channel in this plan is link-sharing; a bare preview card costs clicks on every single post for 90 days. | Small build task: OG/Twitter tags + one branded og:image (the verdict card mockup is the obvious image) + sitemap/robots. Ship in W1. |

**The Day-0 rule:** #1, #2, #4, #6 are hard gates. #3, #5, and #7 are strongly recommended but can trail by a few days.

---

# PART 1 — Positioning & Strategic Foundation

## 1.1 What Revora is (say it the same way everywhere)

> **Revora is the calm daily companion for the prediabetes window (A1C 5.7–6.4%). Describe any meal and in seconds you get one plain-words answer — Clear, Be careful, or Hold off — with the reason, one adjustment, and one safer swap. Never a calorie count, never a lecture, and when it's unsure, it says so.**

Category: the **prediabetes-only meal-decision coach**. Not a photo scanner. Not a glycemic-load calculator. Not a tracker, not a diabetes app, not a diet app.

**Compared against** (deliberately): MyFitnessPal ("counts calories; calories don't answer 'should I eat this'"), $89/mo CGMs ("shows you the spike after; Revora helps you decide before — and it's a complement, not a rival"), the pamphlet-and-a-shrug status quo.
**Never compared against:** medical care, dietitians, the DPP. We cite their science and serve the moment they can't: the decision at the plate.

## 1.2 The three planks (repeated in every asset)

1. **One calm answer, at the meal.** The enemy is the 40-minute Google spiral at 7pm. Revora's whole job is to end it in five seconds with plain words — "no numbers to decode."
2. **Prediabetes-only, and honest about it.** Built only for the 5.7–6.4 window. If your number is outside it, Revora says so and points you to a clinician instead of pretending. Specificity is the credibility.
3. **Honesty is the feature.** When it's unsure, it asks instead of guessing. It errs careful. Cancel is one tap on the account page. It emails you before it ever charges you. In a category poisoned by overclaiming AI apps, billing-scam trackers, and supplement grifters, *the trust posture is the differentiation* — lead with it, don't footnote it.

## 1.3 What changed from v1, strategically (read once, then never look back)

- **The reversal narrative is gone.** v1's master line — "Reversal is achieved through your dietary choices — Revora gives you the clarity to make them" — belongs to a banned claim family in `docs/safety/claims-boundary.md` and was already stripped from the product (BUG-05). It does not come back in distribution copy in any phrasing, user-as-agent or otherwise, unless counsel explicitly clears it (open item Q8). Hope is expressed the way the landing page does it: *you caught it early, the window is when consistent food decisions matter most, and here's the CDC DPP citation for the approach — not a promise about your numbers.*
- **The "money shot" changed.** v1's video engine was "point camera at plate → GL number reveal." There is no number, ever — and the photo path that now exists is deliberately humbler than a "scan": photo → draft you confirm → the same calm card. The demonstrable moment is still strong: **show Revora the meal (type it, or photograph it and confirm the draft) → a calm card says "Be careful," explains why in one sentence, and hands you the fix.** The money shot is the *healthy-food betrayal answered kindly* — the oatmeal moment — not a number.
- **Channel priority inverted for Phase 1.** v1 put short-form video first (45%) on the strength of a scan-with-number demo that doesn't exist. The product's highest-intent audience posts *text questions* daily, and the honest demos (typed check; photo→confirm→card) are unproven formats. **Reddit leads now**; video ramps as soon as a demo format wins the W3–4 tournament.
- **Pantry Review enters the strategy.** v1 never mentioned the $49 one-time product. It is the cleanest first-revenue motion for a trust-sensitive audience ("one payment, nothing renews") and the standing office-hours doc names it the revenue wedge with a 100-direct-asks kill gate. It gets its own motion in Part 9.
- **Targets are honest.** v1 promised 100 payers/$1.3k MRR by Day 90 off ~400 trials. We have zero users and an unvalidated price. The Day-90 bar is redefined in Part 10 around what we must *learn* (hook, WTP, retention) and what we must *earn* (first real payers), with the 100-ask kill gate wired in.

## 1.4 The wedge: the recently-diagnosed searcher

**Primary ICP (unchanged from `docs/ICP.md`, because it's the one evidence-backed thing v1 got right):** the **recently-diagnosed, "trying hard but flying blind" prediabetic** — US adult, sweet spot 40–60, A1C 5.7–6.4 in the last ~6 months, handed "eat better, come back in six months," now actively searching "prediabetes what to eat" and posting "just diagnosed, where do I start?" in r/prediabetes.

Why them first: acute pain + fresh trigger + *active search behavior* + self-serve price all co-occur only here. The doctor already wrote our problem statement. Buyer = user = card-holder; the first session is the entire sales process.

**Explicitly not chased:** diagnosed T2 (≥6.5 — the product itself routes them out), the 80% undiagnosed (no trigger, unreachable), biohacker/Levels optimizers (novelty churners), weight-loss-primary users (wrong metric, wrong brand).

## 1.5 The transformation narrative (what every asset sells)

**From:** the 2am Google spiral → "I don't even know where to start" → afraid of the grocery store → guilt after every meal → a "healthy" breakfast that was quietly the worst meal of the day.
**To:** one typed sentence → one calm answer → one small adjustment → a week you can actually see → *"I know what to do at my own table again."*

Rules:
- The *before* is told in the audience's own verified words ("scared to eat oatmeal," "what am I doing wrong," "nobody in my corner," "I don't even know where to start").
- The *after* is always **calm + agency at the meal** — never a lab number, never a timeline, never an outcome promise.
- The bridge is always one small unit: this meal, one question, one adjustment.
- Hope rides on the diagnosis timing ("you caught it early — that's the advantage") and on cited third-party science about *behavior*, framed exactly like the landing's proof band: a citation for the approach, never a result from Revora.

## 1.6 Enemies (the villain is never a food, a person, or the user)

1. **The information vacuum after diagnosis** — the 12-minute appointment, the pamphlet, "just eat better."
2. **Diet-culture noise** — the contradictory lists, the fear-mongering, the all-or-nothing spiral that costs more than any single meal.
3. **The "healthy" label** — marketing that betrays this audience specifically (the oatmeal/granola/"zero sugar"-maltodextrin traps).
4. **Overclaiming health apps** — the calorie counter that logged a candy bar at 27 million calories, the subscription that takes an email chain to cancel. We define ourselves against them *by behavior* (uncertainty admitted, one-tap cancel), not by trash-talk.

## 1.7 The hooks (three to A/B from Day 1 — per `docs/product-marketing.md`, unresolved by data yet)

1. **Betrayal (lead candidate):** "Oatmeal has a 'healthy' reputation. For the prediabetes window, it's often the sneakiest meal of the day. Here's the 5-second way I check."
2. **Doctor dismissal:** "Your doctor said 'eat better' and sent you home. Here's what that actually means — one meal at a time."
3. **In your corner:** "You don't have a willpower problem. You've just never had anyone in your corner at the moment you're actually deciding."

The winning hook (by saves/clicks/first-checks, Part 10 W4 gate) becomes the landing hero, the pinned video, and the bio line. Until then all three run.

---

# PART 2 — Audience Psychology

## 2.1 Segments (evidence-graded; primary first)

### 1) The Blindsided Searcher — primary wedge
40–60, A1C in range within ~6 months, dismissed by the doctor ("vague non-issue"), self-educating tonight. Fear: becoming the parent who ignored it. Verbatim: *"I went to the grocery store, tried picking healthy foods, and almost broke down. I don't even know where to start."* Objection: "another calorie counter that shames me, or a scammy blood-sugar thing." Converts on: someone calmly answering *this meal, right now* — and an app that admits what it doesn't know.

### 2) The Guilt-Spiral Perfectionist
30–50, already trying hard (lost weight, meal-preps), spirals after one restaurant meal. Verbatim: *"Now I'm feeling so bad and guilty… I'm spiralling."* Converts on: permission with evidence + a product that judges **weeks, not meals** (the progress score exists for exactly her). Trust-killer: red warning screens, streak guilt — which Revora deliberately doesn't have. Say so.

### 3) The Women's-Metabolic Cluster
35–55: PCOS, post-gestational-diabetes, perimenopause. "Same meals, new numbers, and nobody warned me." Converts on: *this is biology, not failure* + per-meal awareness instead of quarterly-lab judgment. Underserved; needs segment-specific copy; strong in r/PCOS and r/Menopause and midlife FB groups.

### 4) The "I Did Everything Right"
Thin, active, blindsided. Verbatim: *"WHAT AM I DOING WRONG?!?!"* Converts on: validation (genetics are real) + a tool that finds the specific meals that matter for *them*. Bonus: they post about the diagnosis — the most naturally viral segment.

### 5) The CGM Reveal-Moment Owner (small, loud, valuable)
Just put on a Stelo/Lingo, watched a "healthy" smoothie spike. Highest willingness-to-pay signal, ~5–10% of volume. Message: *complement, not competitor* — "your sensor shows the spike after; Revora helps you decide before."

**Reached, not targeted:** the young convenience-bound just-diagnosed (real in VOC, but adjacent to the ED/ARFID safety themes T3/T9 — those populations get **no targeted marketing** until the clinical/counsel gate in the painpoint report clears; meet them with zero-shame convenience content only). Cultural-plate eaters (rice/roti/tortilla households) are served through content and the swap-that-fits framing, not a separate campaign.

## 2.2 Psychological levers (each with its ethical line)

| Lever | How Revora uses it | The line |
|---|---|---|
| **Permission / relief** (master lever) | Every asset gives something back: a food, a meal, dignity. "Keep the bread — here's the adjustment." | Permission is earned by the mechanism (pairing, portioning, what-to-eat-first), never asserted. |
| **Specificity** | 5 seconds · 5.7–6.4 · 5 free checks a day · $49 once, nothing renews · one answer, one reason, one swap. | Only real, checkable numbers. No invented stats, no user-count theater while we have no users. |
| **Cited hope** | "You caught it early. In the CDC's DPP trial, sustained diet/activity change cut progression 58%." | Always behavior-as-subject, always "citation for the approach," disclaimer adjacent. Never app-as-cause, never "reverse." |
| **Anti-shame** | Name the guilt loop and side with the reader against it. "One meal doesn't erase a week — your week is what counts, and Revora counts weeks." | Anti-shame never becomes anti-effort; always end on one next action. |
| **Identity** | "The person who caught it early and acted." | Offered, never imposed; never "prediabetics" as a label for a person. |
| **Loss-aversion** | The *opportunity* narrows, never doom: "the window is the one stage where food decisions matter most." | No complications imagery, no countdowns, no "before it's too late." |
| **You're not alone** | Quote the community's patterns ("someone wrote 'I almost broke down in the grocery store' — if that's you…"). | Patterns, not identifiable people; never dunk, never diagnose. |

## 2.3 Trust-killers (this audience specifically; violate one and the channel is gone)

1. Shame in any costume — "you should know better," bad-food language, red screens.
2. Fear-porn — complications imagery, "silent killer," countdown-to-diabetes.
3. **False precision** — invented stats, implied accuracy, "AI-powered" as the lead (they've been burned by exactly that).
4. Salesy energy — hard CTAs at cold audiences, discount theatrics, urgency timers.
5. Cure/treatment/**reversal** language with the app anywhere near the sentence.
6. Undisclosed founder posting. Discovered every time; fatal in the exact communities we need.
7. **Promising features that aren't live** — a "trial" while the paywall runs legacy, apps "in the store," or any input method not verified on the live deploy. The funnel must tell the truth the product tells.

---

# PART 3 — Voice & Compliance (the style bible)

## 3.1 Voice

**The knowledgeable friend who did the research — and shows their work.** Calm, warm, specific, a little indignant at the system (never at people), allergic to shame, quick to admit uncertainty. Distribution voice = in-app voice with the volume up one notch, never two.

Fingerprints: short declarative openers ("Nobody tells you this part."), second person, one citation per science claim, one next action per asset, warmth in the close.

## 3.2 The compliance pre-flight (every asset, every channel; one "no" = rewrite)

Derived from `docs/safety/claims-boundary.md` — which governs **founder and community copy too** (`launch-informational` class), not just the app.

1. ☐ **Banned-family scan:** no diagnosis/screening claims · no treatment/prevention/cure/**reversal** claims (any phrasing, any agent — pending counsel Q8) · no future-A1C or glucose-curve prediction · no exact GI/GL/mg/dL numbers attributed to Revora · no FDA/clinical-proof implications · no outcome guarantees.
2. ☐ **App-capability truth check:** does every product statement match what's live *today*? (Text/voice in; no photo unless the flag is on; verdict words are Clear / Be careful / Hold off; 5 free checks/day unless trial mode is live.)
3. ☐ **Citation check:** every science claim names its source (CDC DPP/NEJM 2002; food-order studies cited as "published research on meal sequencing," hedged "in study conditions" — and always about *behavior*, never about Revora's output).
4. ☐ **Forbidden-word scan:** avoid · forbidden · don't eat · warning/danger (about foods) · cure · treat · reverse/reversal · manage your condition · guaranteed · clinically proven · AI-powered (as lead) · "prediabetic" as a person-label.
5. ☐ **Agent check:** in any outcome-adjacent sentence, the subject is the person or the published science — never Revora.
6. ☐ **Disclaimer:** where guidance could read as medical, the product's actual line rides along: *"Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you."*
7. ☐ **Disclosure:** founder status disclosed wherever Revora is named by us or anyone we've compensated (FTC).
8. ☐ **Tone:** knowledgeable friend? Zero shame, zero fear, zero clinical chill, zero hype?
9. ☐ **Platform check:** no health-claim trigger phrases in captions/on-screen text; the specific community's rules re-read this week.

## 3.3 Approved vocabulary (use liberally)

one calm answer · should I eat this? · Clear / Be careful / Hold off · the window (5.7–6.4) · plain words, no numbers to decode · one reason, one adjustment, one safer swap · the moment of the meal · your week, not one meal · when we're unsure, we say so · nothing renews (Pantry) · cancel is one tap · you caught it early · citation for the approach · better, not perfect · nothing here is banned.

**The five lines to memorize (verbatim, everywhere):**
1. *"Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you."* (the one true disclaimer)
2. *"One calm answer — Clear, Be careful, or Hold off — with one reason, one adjustment, and one safer swap."* (the product, one breath)
3. *"Built only for the prediabetes A1C range, 5.7 to 6.4. Outside it, Revora says so and points you to a clinician instead of pretending."* (the focus plank)
4. *"When it's unsure, it asks instead of guessing — and it errs on the careful side."* (the honesty plank)
5. *"You caught it early — that's the advantage. The CDC's DPP trial saw a 58% reduction in progression from sustained diet and activity change. That's a citation for the approach, not a promise about your numbers."* (hope, done legally)

---

# PART 4 — CHANNEL 1: Reddit (~40% of effort) — the lead channel

## 4.1 Why Reddit leads now

The product is text-in; the highest-intent audience is text-out. r/prediabetes (~48k) receives daily posts that are literally our funnel's first line ("just diagnosed, where do I start," "is sourdough okay," "doctor gave me nothing"). Someone typing that question is 100× closer to a first check than a video scroller — and answering it well costs a solo founder 10 minutes, not a shoot day. Value posts rank in Google for years ("prediabetes what to eat reddit" is real search behavior). Cost: $0.

**The iron law stands from v1: 90/10.** At most ~10% of activity is ever promotional; every mention is founder-disclosed; every post survives with the product deleted from it.

## 4.2 Account setup & warm-up (unchanged mechanics from v1 — they were correct)

- Primary founder-identity account, human handle. Bio: "Diagnosed in the prediabetes window. I post what I've learned about deciding what to eat, with sources. Building Revora (prediabetes-only meal checker) — happy to answer anything." Profile pinned post = founder story + link (the profile is the landing page in strict subs). **No "reversed my numbers" claims in the bio** — that's v1 copy and it's banned-family.
- Warm-up: Days 0–14 daily genuine use, 15–20 helpful comments/week, zero mentions, 200–500 karma. Day 15+ value posts. Day 21+ first soft mentions where invited. Backup account created Day 0, warmed gently, never in the same thread.
- Filters: no links in comments for the first weeks; never paste the same text twice; read each sub's rules before every post; one polite modmail per removal, never repost over one.
- Keyword alerts (F5Bot/GummySearch): "prediabetes," "prediabetic," "just diagnosed," "A1C 5.", "should I eat," "blood sugar spike." Answer fresh threads in the first 2 hours.

## 4.3 Target subs (trimmed to what a solo founder can actually work)

**Home:** r/prediabetes (daily comments; 1 value post/wk from Week 3).
**Core adjacent:** r/diabetes_t2 (many 5.7–6.4 lurkers; extra sensitivity — they live with T2), r/PCOS, r/Menopause (segment 3), r/CGM + r/Biohackers (tool-friendly; disclosed product talk tolerated — the *complement* framing lives here).
**Listen-only VOC mines (never promote):** r/AskDocs, r/HealthAnxiety, r/loseit, r/nutrition.
**Launch-week only:** r/SideProject, r/alphaandbetausers (builders and testers, not patients — one honest launch post each, then leave).

## 4.4 Post archetypes (rewritten for the real product)

1. **The week-one guide** (evergreen Google-ranker): "What I wish someone handed me the day I was diagnosed." Numbered, cited, zero product until a disclosed final line.
2. **The label-trap / betrayal post:** "The 'healthy' breakfast that was quietly my worst meal of the day." One insight, deeply explained. No mention.
3. **The tool-agnostic resource guide** (the strict-sub workaround): "Every way I found to judge a meal before eating it — GI tables, glucometer, CGM, meal-checker apps — costs and tradeoffs." Revora listed as one option among five, disclosed.
4. **The honest-builder post** (r/CGM / r/Biohackers / r/SideProject only): full disclosure up front; what it does, what it deliberately doesn't (no numbers, no predictions, asks when unsure), what feedback you want. In this culture, *the safety architecture is the interesting content.*
5. **The discussion starter:** "Anyone else find carbs weirdly individual — fine with oats, wrecked by pasta?" (the community's favorite topic; mirrors the T1 theme). Zero mention; farms relationships and content ideas.

**Plug placement:** never in the title, never in the first half, once per post max, always disclosed, and in strict subs — zero in the post; profile only.

## 4.5 Six ready-to-post Reddit posts

**POST 1 — r/prediabetes — week-one guide**
**Title:** "Newly diagnosed? The 'first two weeks' guide I wish someone handed me at the doctor's office."
**Body:** "Seeing several 'just got the call, where do I start' posts this week — this is for you. 1) **Breathe: catching it at this stage is the good news.** In the CDC's Diabetes Prevention Program trial, people who made sustained diet and activity changes saw a 58% reduction in progression to type 2 (NEJM 2002). That's a citation about behavior, not a promise — but it's why this stage rewards action. 2) **Don't crash-diet.** The restrict→binge→guilt spiral shows up in this sub weekly and costs more than any single food. Better beats perfect. 3) **Carbs never go out alone.** Pairing carbs with protein or fat changes how the same food lands — the cheapest upgrade there is. 4) **Stop drinking your carbs** — juice, sweet coffees, and 'zero sugar' mixes with maltodextrin (the sneakiest label trap I know). 5) **A short walk after your biggest meal** is the most underrated free habit in the research. 6) **Judge your week, never one meal.** 7) **Your A1C is a starting line, not a verdict.** Ask me anything below — I've been where you are. (Disclosure, since mods rightly care: after my own diagnosis I built a small meal-checking tool in this space — it's in my profile. Everything above needs no app.)"

**POST 2 — r/prediabetes — the betrayal post (no mention)**
**Title:** "The 'healthy' breakfast that turned out to be my sneakiest meal of the day."
**Body:** "Instant oatmeal, banana, orange juice — the textbook 'doing everything right' breakfast. Then I started actually paying attention and learned what many of you already know: for people in this window, that plate is basically carbs drinking a sugar chaser. Three things that fixed my mornings without giving anything up: savory-first (eggs + veg, toast on the side, not the star), fruit *with* protein instead of alone (banana + peanut butter is a different event than banana + juice), and keeping oats but dressing them (nuts, Greek yogurt) instead of eating them naked. The bigger lesson: 'healthy' on a label was written for a different audience. What's the food that surprised you most after diagnosis?"

**POST 3 — r/CGM — the honest-builder post (disclosed up front)**
**Title:** "I built a no-hardware meal checker for the prediabetes window — here's what it deliberately refuses to do (feedback wanted)"
**Body:** "Full disclosure: my build. After my own prediabetes-range result I built Revora — you type (or dictate) a meal, give it your A1C once, and it returns one plain-words verdict (Clear / Be careful / Hold off), a one-sentence reason, and a fix — an adjustment plus a safer swap on 'Be careful', swap only on 'Hold off' (it deliberately won't tell you how to keep a 'Hold off' item). The part this sub might find interesting is what it *won't* do, on purpose: no glucose predictions, no GI/GL numbers, no calorie counts, and when the meal description is ambiguous it asks one clarifying question instead of guessing — then errs on the careful side. It's informational-only by design (wellness tool, not a medical device) and it routes anyone outside 5.7–6.4 to a clinician instead of answering. A CGM tells you what happened; this is aimed at the decision *before*, for people who don't have $89/mo. Web app, first day free, no login. Tear it apart — especially where a conservative answer would annoy you as a data person."

**POST 4 — r/Menopause — segment 3 (soft, disclosed)**
**Title:** "Blood sugar creeping up mid-life despite doing everything 'right'? What helped me stop guessing."
**Body:** "Perimenopause changed how the same meals landed for me and nobody warned me — creeping numbers that made me feel like a failure. Three things that helped: (1) learning this is *biology, not failure* — hormonal shifts genuinely change post-meal responses; (2) judging my week instead of any single meal (the spiral after one dinner did more damage than the dinner); (3) getting *per-meal* feedback instead of waiting for the quarterly lab number to judge me — a meter, a CGM, or a meal-checking app all work; the point is deciding with information instead of dread. Happy to share specifics. (Disclosure: I build a tool in this space — it's in my profile — the advice above stands without it.)"

**POST 5 — r/PCOS — insulin-resistance angle (no mention)**
**Title:** "For the IR crowd: the three cheapest levers I found for calmer meals (with sources)"
**Body:** [Skeleton: pairing (carbs never alone), what-you-eat-first within the meal — cited hedged as "published meal-sequencing research," portion-as-side-character; explicitly notes PCOS+IR often rides with prediabetes-range A1C and it's worth asking for the number; invites discussion; profile only.]

**POST 6 — r/SideProject — launch post (promo-friendly)**
**Title:** "My doctor gave me a pamphlet. I built the thing I actually needed: a prediabetes-only meal checker that admits when it's unsure. Looking for honest testers."
**Body:** "Diagnosed in the prediabetes A1C window, told to 'eat better,' handed nothing. Built Revora: type, dictate, or photograph any meal (the photo makes a draft *you* confirm — it never skips your judgment) → one calm verdict (Clear / Be careful / Hold off), one reason, one adjustment, one safer swap, ~5 seconds. Deliberate choices: no calorie counts ever, nothing 'forbidden,' prediabetes window only (5.7–6.4 — outside it, it tells you to see a clinician instead of answering), and when it's unsure it asks instead of guessing. It's an informational wellness tool, not a medical device. Web app, PWA, first day free with no login. There's also a one-time $49 whole-kitchen review (nothing renews) for people who want their pantry triaged once. Looking for ~20 testers in (or near) the window: brutal feedback on answer quality, onboarding, and anywhere the copy over-promises. Ask me anything, including business questions."

## 4.6 Comment strategy — twelve templates (mapped to the real recurring questions; tiers: [—] no mention · [soft] disclosed one-liner · [full] link when directly asked)

1. **"Just diagnosed, where do I start?"** [soft] — condensed POST 1 + "ask me anything"; disclosure line at the end.
2. **"Is sourdough okay?"** [—] "Three levers matter more than the yes/no: what's on it (fat/protein changes how bread lands), what else is in the meal, and the portion's role — side character, not lead. And responses are genuinely individual, so treat any blanket internet verdict (including this one) as a starting point. Dressed, not naked — and enjoy the bread."
3. **"Why do I react fine to oats but terribly to pasta?"** [—] "Totally normal and maybe the most-repeated frustration in this sub — responses are individual (microbiome, muscle mass, sleep, timing). Population tables are averages; you're an n of 1. Keep the foods your body has earned."
4. **"I cheated and feel terrible."** [—] "The guilt is doing more damage than the meal did. One dinner is a rounding error in a decent week — and the week is the unit your body actually lives in. The next meal is the only one you control now. Be as kind to yourself as you'd be to anyone else posting this."
5. **"What's a safe breakfast?"** [—] savory-first pattern + the instant-oatmeal-and-juice trap + "test your version — breakfasts are individual."
6. **"'Zero sugar' has maltodextrin?!"** [—] "The front of the package is marketing; the ingredient list is the truth. 'Sugar-free' regulates the word *sugar*, not the starch. You did nothing wrong — the label did."
7. **"My doctor just said 'lose weight' and nothing else."** [—] fuller free version (pairing, drinkable carbs, walk, judge weeks) + "ask about a covered DPP referral — the CDC program is real and often insured."
8. **"Is a CGM worth it for prediabetes?"** [soft] "Two honest weeks teaches you your personal weird carbs — real value if you'll act on it. But the durable 80% is behavioral and free: pairing, portions, post-meal walks. Day-to-day I use a meal-checking approach for the 'what do I do with THIS plate' moment (disclosure: I build a tool there — profile). I'd try the free mechanics for two weeks before buying hardware."
9. **"Is [rice/fruit/potatoes] forbidden now?"** [—] "Nothing's forbidden — that framing is where the spiral starts. Whole > juiced, paired > naked, side character > lead. The goal is a way of eating you can run forever; bans have terrible retention."
10. **"My family doesn't take it seriously."** [—] quiet visible changes + "you don't need their permission to take yourself seriously. This sub takes you seriously."
11. **Win posts ("A1C came back down!")** [—] "This is the post someone three days past diagnosis needed tonight. You did that. What's the one habit you'd tell day-one you to start first?" *(Celebrate + farm VOC. Never mention the product on someone's win.)*
12. **"What app do you use?" (the invited moment)** [full] "Disclosure: the one I use is mine — I built Revora after my own diagnosis. You type or dictate the meal, it gives one calm verdict — Clear, Be careful, or Hold off — with one reason, one adjustment, and a safer swap. Deliberately: no calorie counts, no glucose predictions, nothing 'forbidden,' prediabetes window only, and when it's unsure it asks instead of guessing. Informational only — not medical advice, and it says so on every answer. First day is free with no login: [link]. Happy to answer what it does badly, too — it's careful on purpose, and that sometimes reads as cautious."

## 4.7 Cadence & metrics

Comments 15–20/wk (→25 by W4), value posts 1/wk from W3 (→2–3/wk across all subs from W5, max 1 per sub per 10–14 days, always rewritten). Winning post = ≥85% upvote ratio + 20+ comments + unprompted "what tool?" questions + UTM profile-link clicks. Track per post: sub, archetype, upvotes, ratio, removed?, profile clicks, first-checks attributed (onboarding attribution question). A winning archetype repeats in a sibling sub 7–10 days later.

---

# PART 5 — CHANNEL 2: Short-form video (TikTok / Reels / Shorts, ~30% of effort)

## 5.1 The honest demo (what replaced the scan money-shot)

The product's on-camera moment is real, just different: **show Revora the meal and let the calm card land.** The reveal is the *verdict in plain words* — especially on a food the audience believes is healthy. "I typed 'instant oatmeal with banana and orange juice' — watch what it says" is a genuine curiosity gap, and the answer (a flat **Hold off** — the juice forces the strictest verdict, swap only — with the 'Be careful' + keep-the-food fix appearing only once the juice is dropped; see SCRIPT 1) is the brand in eight seconds.

**The photo demo is now available too** (flag flipped 2026-07-07): photograph the plate → the draft chips appear → confirm → the card. Film it honestly, confirm-step included — "it drafts, *you* confirm, then it answers" is on-brand (the photo never skips your judgment) and it inoculates against the accuracy-gotcha comments that killed photo-calorie apps' trust. Both demos (typed and photo) enter the W3–4 format tournament as separate formats; do not film photo demos until one real photo→draft→verdict has been verified on the live deploy (§0.2 #4).

Format notes: screen-record the real app (never mock results), captions on, the verdict card is the money frame, phone-vertical.

## 5.2 Account setup

One founder-face account per platform (TikTok primary, cross-post to Reels/Shorts), same handle and bio:
> Prediabetes window only (5.7–6.4). Type any meal → one calm answer in 5 sec. First day free, no login ↓

One direct link (UTM per platform), no Linktree. Warm-up: 2 days engage-only, then 1 post/day for a week, then ramp. No CTA in the first 5 posts. All v1 shadowban hygiene rules carry over (no claim-trigger phrases on screen, clean exports, ≥2h spacing, no delete-and-repost loops).

## 5.3 Content pillars (7)

| # | Pillar | Job |
|---|---|---|
| P1 | **Check demos ("Should I eat this?")** — type a real meal, read the card | Product demand; the conversion workhorse |
| P2 | **Newly-diagnosed starter pack** — day-1 empathy + first moves | Wedge capture; highest saves |
| P3 | **Myth-busts & label traps** — "zero sugar," healthy-breakfast betrayal, GI-table folklore | Authority + comment engine |
| P4 | **Permission posts** — "nothing here is banned; here's the adjustment" | The brand's soul; anti-diet-culture |
| P5 | **Founder story / honesty story** — "I built the app that says 'I'm not sure'" | Trust depth; pinned video |
| P6 | **Hot takes (compliant)** — "calorie counting is the wrong homework for this window" | Reach spikes |
| P7 | **Comment-reply demos** — every "what about X?" becomes tomorrow's check demo | Cheapest retention+reach tool; daily habit from W3 |

## 5.4 Twenty hooks (rebuilt; all pass the §3.2 pre-flight)

**Empathy / newly diagnosed:** 
1. "Your doctor said 'prediabetic,' handed you a pamphlet, and sent you home. Here's what the 12-minute appointment didn't cover." 
2. "Three things I wish someone told me the day my lab report came back in the prediabetes range." 
3. "The grocery store almost made me cry after my diagnosis. Now I do this instead." 
4. "'Try to eat better.' That's it. That's the plan they gave me." 
5. "If you were just diagnosed and you're afraid to eat anything — this video is your permission to eat dinner."

**Betrayal / myth-bust:** 
6. "The 'healthiest' breakfast in America is quietly the sneakiest meal of the day for people in the prediabetes window." 
7. "That 'zero sugar' drink mix? Read the next ingredient." 
8. "Sourdough: half the internet says it's fine, half says it's sugar in a beret. Here's what actually matters." 
9. "Oats are fine for me. Pasta wrecks me. Turns out that's normal — carbs are personal." 
10. "The most confusing aisle in the grocery store is the one labeled 'healthy.'"

**Check demos:** 
11. "I typed my exact dinner into this and got one word back. Watch." 
12. "POV: it's 7pm, you're tired, and you have no idea what's 'safe' to cook. Five seconds. Watch." 
13. "Chipotle order, prediabetes edition — guess the verdict before I show you." 
14. "'Is sushi okay?' 'Is fruit okay?' 'What about my mom's rice?' Same move every time: check it, then decide. Watch." 
15. "This app just told me it wasn't sure — and that's exactly why I trust it."

**Permission / anti-shame:** 
16. "Cake at your kid's birthday when you're in the window: here's exactly how I'd handle it — and 'skip the party' isn't on the list." 
17. "The guilt after one 'bad' meal does more damage than the meal. Here's the reframe that saved me." 
18. "You don't have a willpower problem. You have an information problem."

**Hot takes:** 
19. "Calorie counting is the wrong homework for the prediabetes window." 
20. "Fear is a terrible meal planner."

## 5.5 Three flagship scripts

**SCRIPT 1 — "The oatmeal check" (P1×P3, 25s).** Hook text: "'Healthy' breakfast. Watch." VO: "Instant oatmeal, banana, orange juice — the breakfast everyone told you was the responsible choice. I typed it into Revora—" [screen-record: card shows **Hold off**] "—'Hold off.' Not even 'be careful' — hold off. One sentence why: it reads as mostly sugary or refined carbs. The juice is what tips it. So I retyped it without the juice—" [screen-record: retype "instant oatmeal, banana" → card shows **Be careful** with an add-protein adjustment] "—and now it's 'Be careful': add some protein, keep the oats. Nothing banned. The juice was the whole problem." CTA: "It's built only for the prediabetes window. First day's free, no login — bio." *(Pinned-comment carries the link + disclaimer. Engine note: "juice" carries a deterministic carbs_only + high_risk floor — the full breakfast is always HIGH/"Hold off", and HIGH cards are swap-led with no adjustment, so never script an "add protein, keep the juice" beat. The juice-free retype passes the precheck clean and reads MODERATE per the registered oatmeal promise. Record real cards, both beats.)*

**SCRIPT 2 — "The app that says 'I'm not sure'" (P5, 30s).** Hook text: "I built an app that admits doubt." VO: "Every health app I tried after my diagnosis pretended to be certain. So when I built mine, I made one rule: when it's not sure, it says so — it asks one question instead of guessing, and it errs careful. No glucose predictions, no scores, no calorie counts. One calm answer and a swap. Turns out 'I'm not sure, tell me more' is the most trustworthy sentence in health tech." CTA: "Revora. Prediabetes window only. Bio."

**SCRIPT 3 — "7pm, tired, no plan" (P1, 20s).** Hook text: "7pm. Tired. Prediabetes. No plan." VO: "This used to be a panic moment. Now:" [types leftovers into the check] "'Clear.' Eat the chicken and broccoli, potatoes as the side character, done. The scariest part of the diagnosis was the not-knowing. This is the knowing." CTA: "Bio. First day free."

## 5.6 Metrics gate (unchanged from v1 — the thresholds were sound)

3-sec retention ≥75–80% → format is viral-capable, 5 variants within 72h. <50% across 5 posts → kill the format, keep the topic. Save rate ≥1.5% = buy-signal content. Likes-high/saves-zero = view trap → kill. Every "what app is this?" answered within 2 hours. Cadence: 1/day Days 3–9 → 2 masters/day from W3 (each cross-posted ×3), floor 1/day, zero-post days not allowed once started.

---

# PART 6 — CHANNEL 3: Facebook groups (~25% of effort)

The core demographic (45–65) does its health talk in private FB groups. All v1 mechanics carry over intact — they were channel-correct: **profile-as-funnel** (cover line, disclosed founder bio, featured link post — with "reversed my numbers" copy REMOVED; the compliant cover line is *"One calm answer at every meal. I share what I learned after my own prediabetes-range result."*), staggered joins (2–3/wk across prediabetes-support, reverse-searches, T2-support, insulin-resistance, PCOS, menopause/midlife, healthy-eating-over-50, caregiver, and local groups), admin-vetting (leave any group whose admin sells cures), answer-posts as 70% of effort, no links in groups ever, checklist free-offer posts where admins allow ("comment CHECKLIST and I'll message it"), and the owned group from Day 30–45 ("Prediabetes: What to Eat — Newly Diagnosed Support") with membership questions feeding email capture and the VOC backlog.

**Copy corrections applied to every v1 FB asset:** strip reversal claims and "~30%" study numbers as delivered facts (keep "published research on meal order and pairing" hedged); strip scan/photo references (say "I check meals with a tool I built — you type the meal in"); the invited-moment answer (template 15) becomes the §4.6-12 wording. The ten v1 post skeletons (grocery-store story, guilt-spiral, label-trap PSA, cultural plates, menopause shift, plate photo, answer-post-as-post) remain usable **after** running each through the §3.2 pre-flight — the emotional structure was right; the claims weren't.

**The gratitude/milestone post (v1 POST 10) is retired** — it's a first-person A1C-outcome testimonial ("my numbers came back in the normal range"), which is exactly the implied-outcome content the boundary exists to prevent. Replace with a builder-milestone post ("six months ago I was the scared one posting here; this week the tool I built for that version of me got its first hundred users — here's what they taught me").

**Lead capture:** checklist DMs (value first, one human question, one soft close with the UTM link, one follow-up max, ever) → lightweight weekly plain-text email (checklist → label traps → judge-weeks-not-meals reframe → founder story + invitation; disclaimer in every footer).

---

# PART 7 — Content Engine

Unchanged in shape from v1 (it was sound): the backlog is **harvested, never brainstormed** — Sunday 45-min VOC mining (r/prediabetes + r/diabetes_t2 new posts, own comments, FB questions, owned-group answers, Creator Search Insights content-gap tab); **one question → five assets** (video hook → Reddit comment → FB answer → landing FAQ → email topic); weekly batch production (Sun mine+script · Mon shoot 8–10 masters · Tue/Wed edit+schedule · daily 45-min Reddit sweep · daily 30-min FB · Fri metrics review); one spreadsheet, calendar tab + results tab, verdict (scale/keep/kill) mandatory per post.

The flywheel: Reddit/FB questions prove demand before filming → videos feed the bio link → video comments feed Reddit answers → user questions (with permission, anonymized) feed story content → owned group feeds email → email feeds conversions during content droughts.

**One addition:** every recurring "does it handle X?" question also gets checked against the product *that week* — if Revora's answer to a common food is weak or over-cautious, that's a product bug report, not just content. The content engine is also the QA engine.

---

# PART 8 — Funnel & Monetization

## 8.1 The funnel as it actually exists

```
Post/comment → bio/profile link (UTM) → revora.bio landing → /check
→ first check (no login, no card) → 5 free checks/day (legacy mode)
→ sign-in (magic link) for history/streaks → /subscribe · $12.99/mo (one-tap cancel)
                                └→ /pantry · $49 one-time Pantry Review
```

- **The first session is the entire sales process.** The activation event is the **first completed check** — specifically one that produces a "huh, I didn't know that" (the betrayal aha). Everything upstream optimizes time-to-first-check; nothing (login, card, tour friction) may stand in front of it. This is already true in the product — keep it true.
- **Web-first is correct and stays.** Stripe (~3%) vs store 15–30%, full-funnel analytics, email before any store hop. The store waitlist buttons stay as intent capture; Play/TWA ships post-Day-90 per `docs/implementation-plan-to-play.md`.
- **Paywall mode:** launch in **legacy** (5 free checks/day) for W1–4 — no card friction while we're begging strangers for a first try. Flip to **trial mode** (Day-1 taste → 7-day card trial with the timeline wall, "$0 due today," pre-charge email) as the W5 CRO experiment *after* first-check volume exists to measure it — and update the landing pricing section to match whichever mode is live (§0.2 #4). The trial funnel's honesty features (exact-date-and-amount email, endowment note, one-tap cancel) are selling points; say them out loud in copy.
- **Pricing is a hypothesis, not a fact.** $12.99 would be the most expensive app in the field. The 999/1299/1999 variants exist in code: run the ladder on `/subscribe` traffic from W3. If $12.99 craters vs $9.99, reprice without ceremony.

## 8.2 The Pantry Review motion (new in v2 — the first-revenue engine)

The $49 one-time report is the trust-matched offer for this audience: **one payment, nothing renews, a concrete deliverable** ("your whole kitchen, sorted into enjoy freely / worth a tweak / handle with care — a calm, printable report"). It monetizes the exact moment the wedge persona is in (staring at their own cupboards after diagnosis) without asking a burned audience to trust a subscription on Day 1.

- **The 100-ask discipline (standing kill gate):** from W1, the founder personally offers Pantry Review in every earned 1:1 context — checklist DMs, invited mentions, tester conversations, personal-network announcement. Log every ask. **100 direct asks with zero payments → stop and rethink the offer** (per the 2026-07-04 design doc). This is not spam: an ask only happens inside a conversation the other person started.
- **Copy:** "If the cupboard is the scary part, there's a one-time option: I go through everything you've got and send back a calm, printable report — what to enjoy freely, what's worth a tweak, what to handle with care. $49 once. Nothing renews. Informational only, not medical advice."
- **Content:** one "pantry walkthrough" video format (P1-adjacent) and one FB free-offer variant ("comment PANTRY and I'll send a sample page").
- Subscription remains the compounding business; Pantry Review is the honest cash and the WTP signal while the subscription funnel finds its feet.

## 8.3 Offer rules

- Price stated proudly; "less than one takeout meal a month." **No public discounts, ever** — trial-extension (when trial mode is live) or pause are the only save offers.
- No fake urgency; the honest urgency is real: "your next lab is in ~90 days — the stretch between now and then is where food decisions live."
- Social proof: **none invented.** Until real users exist, the proof is the honesty architecture (§1.2 plank 3) and the cited science band. Permissioned user quotes come in W6+ and are curated to *clarity/confidence* language — never outcomes, never numbers.
- Attribution question stays in onboarding forever.

---

# PART 9 — The 90-Day Execution Plan

**Phases:** Days 0–14 Foundation (preflight + warm-up + first assets) · Days 15–45 Volume & Signal (find the hook, find the format, run the asks) · Days 46–90 Double-Down & Monetize (scale the winner, flip the trial, decide the price).

## Phase 1 — Foundation (Days 0–14)

| Week | Actions | Ship | Gate |
|---|---|---|---|
| **W1** | **§0.2 preflight closes** (OpenAI funded + verified live · terms filled · landing copy reconciled · attribution + UTMs live · domain DNS · release gates green). Reddit primary+backup accounts live, 10 value comments, zero mentions, alerts on. FB profile-as-funnel built; join 4 groups. Video accounts created, engage-only, then first 3 posts (no CTA). "First Two Weeks" checklist PDF written (the lead magnet). Personal-network announcement drafted. | Preflight ✔ · 3 videos · 10 comments · checklist | **Hard gate: a real prod check returns a real verdict, and a stranger can go link→check→answer in <60s on a phone.** No → nothing else starts. |
| **W2** | Personal-network announcement posts (the diagnosis story + "if someone you love is in the 5.7–6.4 window, send them this"). r/SideProject + r/alphaandbetausers launch posts (POST 6) → recruit 20 testers → 5 founder onboarding calls. Video 1/day (hooks 1–10 tested). Reddit 15 comments. FB: join 4 more groups, 5 answers. **First Pantry Review asks begin in earned conversations (log every ask).** | 7 videos · 2 launch posts · 20 testers · ask-log started | ≥25 first-checks total and ≥1 video >60% hook retention → proceed. Below → hook autopsy before volume. |

## Phase 2 — Volume & Signal (Days 15–45)

| Week | Actions | Gate |
|---|---|---|
| **W3** | Full cadence: video 2 masters/day ×7 (cross-posted ×3), first comment-reply demos. Reddit: first value post (POST 1 → r/prediabetes), 15–20 comments. FB: 10 groups active, daily answers. **Price-ladder test live on /subscribe.** | ≥75 cumulative first-checks. |
| **W4** | **Hook tournament:** the three §1.7 hooks each carried by ≥4 assets across channels; judge on saves + link CTR + first-checks. Reddit POST 2 + 3. FB story post ×2 groups. | **Gate: a winning hook exists** (≥1.5× the others on first-checks). It takes the landing hero + pinned video + bios in W5. |
| **W5** | Double the winner (≥50% of output in winning hook/format). Reddit POST 4 + 5. Owned FB group prep. **Flip PAYWALL_MODE→trial + landing pricing update** (the W5 CRO experiment) if first-check volume ≥50/wk; else hold legacy and keep filling top-of-funnel. | **First-payer gate (Day ~35): ≥3 payers across any SKU** (subscription or Pantry). 0 payers from 150+ first-checks *and* 50+ logged asks → funnel autopsy before more traffic. |
| **W6** | "Found signal" week: 5 variants of best video; Reddit winning archetype repeated in sibling sub; owned group launches (seed: testers, checklist list); first permissioned user quotes collected (clarity-language only). | **Day-45 SIGNAL GATE (hard):** (a) one repeatable format ≥75% retention, (b) ≥300 cumulative first-checks, (c) ≥8 payers, (d) one channel clearly cheapest per first-check, (e) **ask-log ≥60 with ≥2 Pantry payments**. ≥3 of 5 → Phase 3. 2 → repeat W6 two weeks. ≤1 → the message needs revision, not volume: re-interview 5 users, re-run the hook tournament. **Ask-log at 100 with zero payments anywhere → the standing kill-criterion fires: stop, rethink the offer, do not scale.** |

## Phase 3 — Double-Down & Monetize (Days 46–90)

| Week | Actions | Gate |
|---|---|---|
| **W7–8** | Reallocate effort by cost-per-first-check. CRO sprint on the live paywall mode (trial-wall copy variants, onboarding length). Video 2–3/day ≥60% proven formats. Reddit 2 posts/wk. Owned-group cadence daily. | Weekly first-checks ≥120 · landing→first-check ≥40% · (if trial live) trial→paid ≥25%, <20% → autopsy rule. |
| **W9–10** | Social-proof layer: 10 permissioned quotes into landing v2 + testimonial-style videos (clarity language, §3.2-checked). Reddit r/CGM honest-builder post (POST 3) once there's real usage data to share honestly. **Price-ladder decision: commit the price.** Creator experiment only if a proven format + ≥$500 MRR exist (3 micro-creators, FTC clause in writing); else skip without guilt. | ≥25 cumulative payers by Day 65. |
| **W11–12** | Compounding: refresh 3 evergreen winners; Reddit mega-guide v2 (the Google ranker); owned group ≥250 push; if the photo demo won its formats, brief it as the default P1 style. | Weekly first-checks ≥200 · MRR trend up 3 weeks straight. |
| **W13** | Final push: reply-video blitz, AMA in owned group + r/prediabetes. Write the Days 91–180 plan from the KPI sheet (double the #1 channel; Play/TWA decision; ASO). | **Day-90 verdict:** ≥40 paying customers *and* a committed price *and* a proven hook+format → scale plan. 15–39 → working; tune, don't pivot. <15 with the ask-log ≥100 → channel-market fit unproven; Days 91+ are about message/product, not volume. |

## 9.1 KPI dashboard (Friday review; one sheet)

| Metric | W2 → W6 → W10 → W13 target |
|---|---|
| **First-checks / week** ⭐ (the activation metric) | 25 → 100 → 150 → 200 |
| Landing → first-check CVR | 25% → 35% → 40% → 45% |
| D7 return rate (signed-in cohorts) | — → 20% → 25% → 30% |
| Paying customers, cumulative (all SKUs) | 0 → 8 → 25 → 40+ |
| Pantry ask-log (asks / payments) | 10/0 → 60/2 → 100/5 → — |
| MRR + one-time revenue | $0 → ~$150 → ~$400 → ~$700+ |
| 3-sec hook retention (weekly avg) | 60% → 75% → 78% → 80% |
| Reddit: karma ↑, removals ~0, invited mentions/wk | trust proxies |
| Email list + owned-group members | 0 → 80 → 200 → 350 |

*(Why first-checks and not "trials": in legacy mode there is no trial; the check is the aha and the honest top of funnel. If/when trial mode flips, trial starts join the sheet without replacing first-checks.)*

## 9.2 Decision rules (if/then, no debates)

1. Video ≥75% 3-sec retention AND ≥1% saves → 5 variants in 72h; format takes +20% of next week's mix.
2. Format <50% retention across 5 attempts → kill format, keep topic. All formats <50% for 2 weeks → the hooks are the problem: rewrite against §5.4 patterns, study 10 live niche winners.
3. Views >50k, link CTR <0.3%, zero "what app?" comments → view trap; add problem-framing or kill.
4. Any account strike → 48h pause, compliance re-audit of last 10 posts, resume half-volume. Backup activates only on death.
5. Subreddit post ≥85% ratio + tool questions → repeat archetype there every 10–14 days + port to sibling sub.
6. (Trial live) trial→paid <20% on a 2-week cohort → stop scaling traffic 1 week; autopsy onboarding drop-off, wall copy, expectation mismatch (interview 5 non-converters).
7. Landing→first-check <25% for 2 weeks → rewrite hero to mirror the winning hook verbatim; check mobile time-to-check.
8. Channel cost-per-first-check >3× best channel for 3 weeks → cut to maintenance floor (video 1/day, Reddit 30 min, FB 30 min), reallocate.
9. FB answer produces ≥3 DMs → that question becomes a video in 72h.
10. **Product answer quality complaint recurs 3× on any food/format → file it as a product issue that week** (the content engine is the QA engine).
11. Ask-log hits 100 with zero payments across all SKUs → **stop. The kill-criterion is real.** Re-run the office-hours questions before spending week 8+.
12. MRR ≥$800 before Day 75 → green-light a $30/day search-ads test ("prediabetes what to eat" intent terms), kill at <1.0 ROAS after $300. Paid never substitutes for organic in the first 180 days.

---

# PART 10 — Risks & The Never List

| Risk | How it happens | Countermeasure |
|---|---|---|
| **Distribution outruns the product** | Posts go up while OpenAI is starved or copy promises photo/trial features that are off | §0.2 preflight is a hard gate; §3.2 item 2 (capability truth check) on every asset |
| **Claims drift** | An enthusiastic caption promises outcomes; a tester's quote implies an A1C result; old v1 copy gets pasted | The §3.2 pre-flight on every asset; v1 swipe copy is **not** approved source material — everything from v1 re-passes the checklist before use; quarterly copy audit |
| **Platform bans / shadowbans** | Claim-adjacent captions, burst posting, watermark cross-posts | Wellness vocabulary, warm-ups, clean exports, rule 4, backup accounts warmed |
| **Community blowback** | Undisclosed founder posting, copy-paste comments, pitching in support threads | Permanent disclosure, 90/10, never promotional in listen-only subs, value-first templates only |
| **Solo burnout** | 2 masters/day + two community channels for 13 weeks | Batch production, harvested backlog, daily time-boxes, floors not zeroes, Day-45 consolidation decision |
| **The view trap** | A comparison video pops; followers soar; first-checks don't move | Saves/profile-clicks/first-checks are the scoreboard; Friday review reads the results tab only |
| **Message drift toward "glucose hacks" general audience** | Bigger audience, easier views | The wedge test every Friday: "would the just-diagnosed searcher feel this was made for them?" 3 winners failing it = growing the wrong audience |
| **Single-channel fragility** | TikTok reach collapses | Three channels by design; email list + owned group are the unbannable storm shelter, built from Day 30 |

**The Never List (print it):**
1. Never claim, imply, or let a testimonial imply that Revora (or its user, in our copy) **reverses, treats, prevents, or cures** anything — pending counsel, the whole reversal family is off-limits in every phrasing.
2. Never attribute a **number** to Revora's output — no GL, GI, mg/dL, calories, percentages, predictions.
3. Never promise features that aren't live (photo, trial, apps in stores).
4. Never use "avoid / forbidden / don't eat / warning / danger" about any food.
5. Never fake: reviews, testimonials, user counts, demo results, statistics.
6. Never post in a health community without disclosed founder status when Revora comes up; never DM anyone who didn't engage first; one follow-up max.
7. Never give medical advice — meds, symptoms, labs, diagnoses get "that's a doctor conversation" every time (the product's own out-of-scope behavior is the model).
8. Never market to the ED/ARFID-adjacent themes (T3/T9) before the clinical/counsel gate clears.
9. Never discount in public; never run fake urgency.
10. Never trash competitors, CGMs, dietitians, or doctors — the villain is confusion, never people or tools.
11. Never ship an asset that skipped the §3.2 pre-flight. No exceptions on deadlines.
12. Never let this document out-claim `docs/safety/claims-boundary.md`. When they disagree, the boundary wins and this file gets edited.

---

# Appendix A — Tool stack (unchanged where v1 was right, trimmed)

Phone + tripod + CapCut (free) · TikTok/Meta/YT native schedulers · F5Bot (free) / GummySearch · Beehiiv/ConvertKit free tier · Google Sheets (calendar/results/ask-log) · UTMs + the onboarding attribution question · PostHog or the existing Umami for funnel events · Stripe (live) · RevenueCat only if/when store billing ships. Core stack <$60/mo.

# Appendix B — Sources

Product ground truth: live code on `main` (landing `app/page.tsx`, check `app/check/page.tsx`, pricing `lib/server/pricing.ts` variants 999/1299/1999, paywall/entitlement, pantry routes) · `docs/handoff/2026-07-06-e2e-verification-report.md` (what works, what's blocked) · `docs/handoff/2026-07-06-painpoint-feasibility-report.md` (theme evidence, T3/T9 gates, "the gap is distribution, not product") · `docs/safety/claims-boundary.md` + `docs/safety/copy-ledger.md` (what may be said) · `docs/product-marketing.md` (positioning SoT) · `docs/ICP.md` (evidence-graded buyer; VOC verbatims spot-checked) · office-hours design doc 2026-07-04 (runway, kill-criterion, Pantry wedge).
Channel mechanics inherited from v1 Appendix D research (retention benchmarks, Reddit 90/10 norms, FB group dynamics, FTC endorsement guides, platform health-content policies) — still valid; v1's *copy* is superseded, its *plumbing* research stands.

---

*Day 0 is the day the preflight clears. The first Reddit comment goes out the same afternoon. Nothing ships without the pre-flight checklist, and nothing in this file outranks the claims boundary.*
