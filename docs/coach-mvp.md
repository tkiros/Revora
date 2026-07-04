# Revora — Smallest First Version of the Coach

**Date:** 2026-06-29 · **Status:** proposal · Built on the existing text engine (`lib/revora/`) + existing PWA (`components/sw-register.tsx`)

## The one question this MVP exists to answer

> **Do people come back day after day, feel progress, and (eventually) pay — for a remembering companion, not a one-shot tool?**

If yes → build the real backend. If no → you learned it for almost nothing. Everything below is shaped to get that answer **cheaply** and **kill the idea fast if it's wrong.**

## The irreducible coaching loop (strip everything else)

1. **It remembers what you ate** (so it's not a stranger every visit).
2. **It gives you a reason to come back** (one gentle daily nudge).
3. **It notices something about *you*** (one insight from your own history).
4. **It shows you're doing this** (a streak + a simple week view).

That's the whole coach. No camera, no CGM, no AI chat, no score engine — yet.

## Build it in 4 increments — each one is a kill-gate

Each step ships on its own and answers one question. **If a step fails its gate, stop — don't build the next one.**

### Step 1 — Memory (lazy: on the phone, no backend)
- After each check, save `{food, risk, a1c, date}` to **localStorage** (device-only).
- Home screen now shows **today's checks** + a **streak** ("Day 3 of checking in").
- Reuse the existing form + answer engine **unchanged** — just write the result locally after it returns.
- Privacy copy update: *"Your history stays on your phone — it never leaves your device."* (Honest, and a selling point.)
- **Gate:** Do people return? Measure **D1 / D7 return rate** (anonymous event). No return = thesis dead, ~days of work spent.
- `ponytail: localStorage is a validation shortcut. Ceiling = device-local, fragile. Upgrade to server persistence at Step 4 (payment needs identity anyway).`

### Step 2 — A reason to come back (reuse the PWA you already have)
- Add **one** daily push notification via the existing service worker: *"Ready for today? Log your first meal."*
- One gentle, non-nagging nudge. Never guilt copy.
- **Gate:** Does the nudge lift D7 return? If a nudge can't pull people back, retention won't hold — stop.

### Step 3 — Make it feel like a coach (rule-based, from their own data)
- After ≥5 checks, show **one** insight computed from their history — e.g. *"Most of your 'be careful' meals were breakfast."*
- Plain rules over the saved checks. **No new model.** Mirror real user language (research): "where your spikes hide," not "you failed."
- **Gate:** Do people who see an insight stay longer than people who don't?

### Step 4 — Will they pay? (now, and only now, add a backend)
- Soft paywall after value is felt (≈day 5–7 or after N checks): *"Keep your history + daily coach."*
- **Run the price-ladder:** show $6.99 / $9.99 / $12.99 to matched groups. This is the first real willingness-to-pay number.
- Payment (Stripe) needs identity → **this is when you add a real account + server database** and migrate the local history up. Identity arrives exactly when it's needed, not before.
- **Gate:** pre-pay / subscribe rate at each price. This decides whether Revora is venture- or lifestyle-scale.

## Reuse map (what you already have)

| Existing asset | Role in the coach | Change |
|---|---|---|
| `lib/revora/` answer engine | Answers each meal (the "is this okay" brain) | **None** — keep as-is |
| `components/food-check-form.tsx` | Input + result | Save result to localStorage after success |
| `app/page.tsx` | Home | Add streak + today's list + insight slot |
| `sw-register.tsx` + PWA | Daily nudge | Wire one push notification |
| `app/privacy/page.tsx` | Trust | Update copy: history is on-device |

## What to NOT build yet (and why)

- **Camera / photo scoring** — commoditized + accuracy trap; text input already works.
- **CGM integration, BAI score, GL-budget calibration** — PRD complexity; streak + one insight already deliver "progress."
- **AI coaching chat** — rule-based insight is enough to test "feels like a coach."
- **Native app, social/community, PDF export, dietary-profile engine** — none of it tests the core question.
- **A backend before Step 4** — no persistence, no auth until payment forces it.

## Why this is the right small version

- It tests the **real differentiation** (the remembering relationship), not the crowded camera.
- It **reuses the safe answer engine** — the hardest, riskiest code is done.
- It's **honest by construction** — no accuracy claims, history on-device, gentle nudges.
- Each step is a **cheap kill-gate**, so you spend the least money to learn the most: retention first (Steps 1–2), "coach feel" second (Step 3), money last (Step 4).

## First move
Step 1 only. Ship localStorage memory + streak on top of today's app. Watch D7 return for ~2 weeks. That single number tells you whether the coach is worth building.
