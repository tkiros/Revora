# G1 Review — 2026-07-09

## To review (4)

### `vs-002` — check_demo — 20s
- **Spoken hook:** There's one thing about a totally normal bowl of oatmeal that keeps blood sugar elevated way longer than the oats themselves.
- **Visual hook:** It's not the oats
- **Framework:** curiosity-gap · **pillar:** P3
- **Caption:** It's not the oats. The toppings you stir in can matter more than the oatmeal itself. Comment GUIDE for the breakdown.
  - ⚠️ FLAG `result-qualitative-impact` — "keeps blood sugar elevated way longer than the oats themselves" → keeps blood sugar elevated more than the oats themselves
  - ⚠️ FLAG `result-qualitative-impact` — "The verdict flags the added sugar and dried fruit as the reason blood sugar stays elevated longer than the oats alone would cause." → The verdict flags the added sugar and dried fruit as a likely bigger driver of blood sugar impact than the oats alone.
  - ⚠️ FLAG `result-adjustment` — "is the lever that actually changes the outcome" → is one adjustment that can help, not a guaranteed fix
- [ ] approve `vs-002`   - [ ] reject `vs-002`

### `vs-016` — check_demo — 21s
- **Spoken hook:** This is the one breakfast question to ask instead of trying to memorize every food rule at once.
- **Visual hook:** One question beats every rule
- **Framework:** attention-anchor · **pillar:** P2
- **Caption:** Stop trying to memorize every food rule. Ask one question instead: does this have protein or fiber with it? Follow for more one-question swaps.
  - ⚠️ FLAG `prompt-scope` — "Stop trying to memorize every food rule. Ask one question instead: does this have protein or fiber with it? Follow for more one-question swaps." → Stop guessing at breakfast. Run it through Revora and see if adding protein or fiber changes the read. Follow for more real checks.
- [ ] approve `vs-016`   - [ ] reject `vs-016`

### `vs-hk-019-01` — myth_label_trap — 26s
- **Spoken hook:** You flip the bread over, sugars: 0.4g per slice, looks fine. Then you check two lines down.
- **Visual hook:** 0.4g sugar. Then you look down.
- **Framework:** scenario-injection · **pillar:** P3
- **Caption:** 0.4g sugar looked fine—until we checked the serving size two lines down. Always read the whole label. #FoodLabels #LabelLiteracy #Revora
  - ⚠️ FLAG `prompt-scope` — "Follow for more real label checks before you trust what's printed up top." → Follow for more real checks like this — Revora reads food labels for people in the prediabetes A1C range (5.7%–6.4%).
- [ ] approve `vs-hk-019-01`   - [ ] reject `vs-hk-019-01`

### `vs-022` — myth_label_trap — 25s
- **Spoken hook:** By the end of this you'll know exactly which line on the label to read first, and it's not the one you think.
- **Visual hook:** Read this line first
- **Framework:** attention-anchor · **pillar:** P3
- **Caption:** The line everyone skips on a nutrition label — and it changes every number below it. Which line do you check first? 👇 #labelreading #nutritionfacts #foodlabels
- [ ] approve `vs-022`   - [ ] reject `vs-022`

## Bounced — hard-fail, fix and re-run (1)

### `vs-006` — check_demo
- Hook: Two people eat the same bowl of oatmeal. One stays steady. One doesn't. The oats aren't the difference.
  - ❌ `Banned Claim Family: Glucose-curve prediction / unsupported clinical-outcome guarantee claim` — "Two people eat the same bowl of oatmeal. One stays steady. One doesn't. The oats aren't the difference." → Two people scan the same bowl of oatmeal in Revora. One gets a lower-impact result. One doesn't. The oats alone aren't what decided it.
  - ❌ `Banned Claim Family: Glucose-curve prediction (implies the app measured a real physiological outcome, not a food classification)` — "two people ate this exact bowl and had two different results" → the same bowl of oatmeal can classify two different ways in Revora
