# Revora product, value, and pricing review

  ## Executive verdict

  Revora addresses a real, frequent, emotionally important problem: “I am about to eat this—what should I do?” Its decision-first approach is more approachable than calorie
  logging.

  However, the current product is not yet differentiated or clinically robust enough for a broad launch at £/$12.99 per month. It often converts incomplete meal descriptions
  into overly definitive labels, while much of the supporting advice is generic. Its strongest future value is not AI food recognition; it is a carefully bounded,
  prediabetes-specific decision assistant that preserves familiar food and gives one practical next step.

  My recommendation is a conditional go:

  - Continue building and validating Revora.
  - Do not market it as knowing whether a meal is “safe” or what it will do to an individual’s glucose.
  - Complete the P0 safety, claims, and validation work before a broad paid launch.
  - Launch initially at approximately $9.99/month and $79.99/year, with localized UK pricing, a meaningful free allowance, and the current price retained as a later test.

  ### Required conclusions

  1. Overall verdict: Yes, potentially valuable enough to build and charge for—but not yet at the current promise, evidence level, and default price.
  2. Target user: Recently diagnosed adults with A1C 5.7–6.4 who are motivated but confused by everyday food choices, are not using insulin, and do not want full calorie
     tracking.

  3. Core differentiation: Fast, cautious, prediabetes-specific meal decisions with one practical adjustment—not exhaustive food logging.
  4. Pricing verdict: Restructure and initially lower. Test $9.99/month and $79.99/year after P0 work; keep $12.99/$99.99 as a later experiment.
  5. Main risks: False confidence, generic repeat advice, unvalidated recommendations, weak first-week personalization, AI skepticism, and charging before users experience
     pattern value.

  6. Top five changes: Calibrate verdicts; add clinical-risk routing; conduct dietitian/user validation; add reliable label/portion support; restructure the free-to-paid
     journey.

  7. Go-to-market message:
     “Revora turns a meal photo or description into one cautious, practical prediabetes next step—without calorie logging, and without pretending to predict your personal
     glucose response.”

  ———

  ## 1. Problem fit

  The problem is strong.

  People with prediabetes repeatedly report uncertainty, inconsistent professional guidance, difficulty translating diagnosis into daily actions, and a desire for practical
  and non-judgmental support. Qualitative studies also find confusion about what prediabetes means and what changes are realistically required. Patient experience study
  (https://pmc.ncbi.nlm.nih.gov/articles/PMC6970589/), prediabetes qualitative review (https://pubmed.ncbi.nlm.nih.gov/31012328/).

  Revora is correctly aimed at the decision moment, rather than asking users to:

  - Find the correct database entry.
  - Weigh every ingredient.
  - Enter calories and macros.
  - Interpret a nutrient dashboard.
  - Decide for themselves what the numbers mean.

  That is meaningfully easier than MyFitnessPal-style logging.

  But Revora currently solves only a narrow portion of the problem. It helps answer “How could I make this meal steadier?” It does not yet reliably solve:

  - Nutrition-label interpretation.
  - Hidden ingredients and recipes.
  - Accurate portion or carbohydrate estimation.
  - Individual glucose response.
  - Cravings and meal satisfaction.
  - Budget, culture, food availability, or household constraints.
  - Medication-related food decisions.
  - Proof that recommendations are helping this particular user.

  ### Better than calorie tracking?

  For users who hate logging and want an immediate choice, yes.

  For users who need precise carbohydrate counts, clinician-facing records, weight management, barcode data, or observed glucose correlations, no. Revora is currently
  narrower and less measurable.

  The product should embrace that narrowness: decision support, not comprehensive diabetes management.

  ———

  ## 2. What Revora genuinely delivers

  Revora has several strong design choices:

  - It restricts normal meal verdicts to A1C 5.7–6.4.
  - It avoids numeric glucose predictions.
  - Its prompt prohibits diagnosis, treatment, prevention, reversal, and exact glycemic claims.
  - Photo analysis transcribes only visible items, avoids hidden-ingredient guesses, marks uncertainty, and requires user confirmation. See lib/meal/photo-extract.ts:29.
  - It returns compact guidance rather than a large nutrition report.
  - It uses “enjoy it anyway” language and generally avoids moralising food.
  - It encrypts sensitive stored meal/A1C data, does not retain uploaded photos, and disables provider-side storage for model requests.
  - Out-of-range A1C values are routed away from ordinary verdicts.

  These controls make Revora safer than an unconstrained generic chatbot for ordinary meal questions.

  ### Where delivery falls short

   Promise or implication                       Actual capability                                               Assessment
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   “Should I eat this? Answered in seconds.”    A general-population heuristic based on a short description     Useful, but too definitive
                                                and one of three A1C bands
  ───────────────────────────────────────────  ──────────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────
   “Tuned to your A1C”                          Three conservatism bands within 5.7–6.4                         Technically true, but sounds more personalized than it is
  ───────────────────────────────────────────  ──────────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────
   Photo scanning                               Visible-food transcription with user confirmation               Trustworthy design, but not reliable nutrient or label
                                                                                                                analysis
  ───────────────────────────────────────────  ──────────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────
   Specific adjustment and swap                 Generated for flagged meals; “Clear” meals may receive          Marketing and result behavior are not fully aligned
                                                neither
  ───────────────────────────────────────────  ──────────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────
   Personal patterns                            Daypart and repeated-meal summaries based on prior app          Limited; not metabolic personalization
                                                verdicts
  ───────────────────────────────────────────  ──────────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────
   Research-grounded                            General dietary concepts have evidence                          Revora’s verdict system itself is not clinically validated
  ───────────────────────────────────────────  ──────────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────
   First day free                               Ten device-local checks                                         Copy should say “10 free checks,” not imply unlimited access

  The current landing-page framing appears in app/page.tsx:46, while the result UI turns risk classes into “Clear,” “Be careful,” and “Hold off” in components/result-
  card.tsx:34.

  ———

  ## 3. Safety and trust assessment

  ### The central safety problem: certainty

  Personal glucose responses vary substantially even between people eating the same food. Large meal-response studies have repeatedly demonstrated this variability. Zeevi et
  al. (https://pubmed.ncbi.nlm.nih.gov/26590418/), PREDICT study (https://www.nature.com/articles/s41591-020-0934-0).

  Therefore, “Clear” is too strong. It can be interpreted as:

  - Safe for me.
  - Unlikely to raise my glucose.
  - Appropriate regardless of portion.
  - Something I can eat freely.

  The fine print may say otherwise, but users remember the verdict.

  Better labels would be:

  - Usually a steadier pattern
  - Worth a small tweak
  - Likely higher-impact
  - Not enough information

  Each result should lead with:

  > Based on the foods and portion you described. This is not a prediction of your personal glucose response.

  ### Missing high-risk routing

  The deterministic precheck handles blank, long, non-food, ambiguous, and carbohydrate-only inputs. It does not contain dedicated handling for:

  - Urgent symptoms.
  - Suspected hypoglycaemia or ketoacidosis.
  - Insulin or medication dosing.
  - Pregnancy.
  - Kidney disease.
  - Eating disorders.
  - Serious food allergies.
  - Questions combining food with acute illness.

  See lib/revora/input-precheck.ts:114. The 48 evaluation cases cover general meal risks, ambiguity, adversarial inputs, and prompt injection, but not those clinical
  categories.

  That is a launch-blocking gap for a health-adjacent open-text interface. The app needs a deterministic medical-risk router before model processing, using clear
  emergency/clinician guidance from sources such as CDC ketoacidosis guidance (https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html) and NIDDK hypoglycaemia
  guidance (https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/low-blood-glucose-hypoglycemia).

  ### Photo accuracy

  Revora is right not to treat a photo as nutritional ground truth. Research on image-based dietary estimation still finds substantial error, especially for portion size,
  energy, and visually hidden ingredients. 2023 systematic assessment (https://pubmed.ncbi.nlm.nih.gov/38060823/), 2025 nutrient-agreement study
  (https://pubmed.ncbi.nlm.nih.gov/40004936/), LLM image-estimation study (https://pubmed.ncbi.nlm.nih.gov/41081011/).

  The confirmation screen is therefore an essential product feature, not friction to be removed.

  ### Advice quality

  The fixed vegetables/protein-first and 10–15 minute walk suggestions are plausible, but the supporting trials are small and often involve people with established type 2
  diabetes. Food-order trial (https://pubmed.ncbi.nlm.nih.gov/28989726/), post-meal walking trial (https://pubmed.ncbi.nlm.nih.gov/27747394/).

  They should be presented as optional general strategies, not automatically attached as though specifically selected for every meal.

  ### Incorrect or unsupported pattern claims

  Two current outputs need immediate correction:

  - Repeated meals are always described as a “steady choice,” even if the meal was repeatedly rated high risk. See lib/coach/insights.ts:88.
  - Check-in activity is said to match the “consistency profile” studied by the CDC Diabetes Prevention Program. The DPP studied an intensive, year-long lifestyle programme
    involving dietary change, activity, coaching, and weight-loss goals—not Revora check-ins. See lib/coach/bai.ts:127 and the CDC programme description
    (https://www.cdc.gov/diabetes-prevention/programs/what-is-the-national-dpp.html).

  The famous 58% result should not be placed near Revora in a way that implies the app reproduces the intervention.

  ### Would users be safer after using it?

  For routine meal questions: probably somewhat safer than using an unbounded chatbot.

  For unrestricted public use: not yet.

  The product can increase confidence, but the present labels risk increasing confidence more than the evidence warrants.

  ———

  ## 4. Differentiation

   Alternative                          Its advantage                                                       Revora’s possible advantage
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MyFitnessPal and calorie trackers    Huge databases, calories/macros, barcode and meal logging           Faster decision; no logging burden; prediabetes-specific
                                                                                                            explanation
  ───────────────────────────────────  ──────────────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────────
   SNAQ and photo nutrition apps        Photo-based carb/macro estimates, CGM support, established user     Less numerical false precision; simpler next action
                                        base
  ───────────────────────────────────  ──────────────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────────
   Levels                               AI logging, adaptive programmes, optional CGM/labs                  Lower complexity and potentially lower cost
  ───────────────────────────────────  ──────────────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────────
   Generic AI chatbot                   Free or already paid for; flexible                                  Consistent bounded format, safety rules, A1C scope, history
  ───────────────────────────────────  ──────────────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────────
   Free nutrition content               Credible and free                                                   Immediate application to the meal in front of the user
  ───────────────────────────────────  ──────────────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────────
   Diabetes-management apps             Glucose, medication, clinician and device workflows                 Simpler for people with prediabetes who do not need medical
                                                                                                            management

  Current comparison prices reinforce the challenge: Levels lists its app at $15/month or $80/year, including AI food logging, programmes, bloodwork uploads and habit
  tracking. Levels pricing (https://support.levels.com/article/720-levels-pricing-and-plans). SNAQ lists $60/year for photo logging, AI guidance and CGM integration. SNAQ
  pricing (https://www.snaq.ai/premium).

  ### Essential differentiation

  - A bounded prediabetes-only scope.
  - A decision in seconds.
  - Honest uncertainty.
  - User-confirmed photo interpretation.
  - One meal-preserving adjustment.
  - Patterns grounded in the user’s real decisions and feedback.

  ### Commodity features

  - Photo input by itself.
  - Voice input.
  - Streaks and reminders.
  - Generic protein/vegetable recommendations.
  - History.
  - AI-generated swaps.
  - A “walk after eating” tip.

  ### Strongest positioning

  Revora is the prediabetes meal-decision assistant for people who want one cautious next step, not another calorie diary.

  ———

  ## 5. Pricing verdict

  ### Current mathematics

   Plan                           Price    Effective monthly price
  ━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━
   Monthly                     £/$12.99                   £/$12.99
  ─────────────────────────  ───────────  ─────────────────────────
   Twelve monthly payments    £/$155.88                   £/$12.99
  ─────────────────────────  ───────────  ─────────────────────────
   Annual                      £/$99.99                    £/$8.33
  ─────────────────────────  ───────────  ─────────────────────────
   Annual saving               £/$55.89                     35.85%

  The annual discount is compelling and large enough to recommend. Annual subscriptions are also particularly important in Health & Fitness: RevenueCat reports that 68% of
  category subscription revenue comes from annual plans. 2026 subscription benchmarks (https://www.revenuecat.com/state-of-subscription-apps-2026-health-and-fitness/).

  But £/$12.99 and £/$99.99 are expensive for Revora’s current feature depth:

  - RevenueCat reports median Health & Fitness prices around $9.99 monthly and $39.94 annual.
  - Levels is $80/year.
  - SNAQ is $60/year.
  - Revora currently lacks nutrient databases, observed glucose integration, clinical validation, and meaningful personalization.

  ### Recommendation

  Launch pricing after P0 completion:

  - US: $9.99/month or $79.99/year.
  - UK: localize and test rather than using automatic £/$ parity.
  - Test $12.99/month only after retention and recommendation-quality evidence improves.
  - Make annual “Recommended” or “Best value.”
  - Remove “Most popular” from monthly unless actual purchasing data supports it.
  - Preserve the founder price for early users.

  The current implementation already supports several monthly test variants and a $99.99 annual plan in lib/server/pricing.ts:1.

  ### Trial and free tier

  The seven-day card-required trial is transparent and includes a pre-charge email, which is trust-positive. The problem is that users hit the wall on day two—before they
  can experience weekly insights.

  A better sequence:

  1. Seven no-card checks during onboarding and the first few days.
  2. Permanent free allowance of approximately three text checks per week.
  3. Two or three free photo checks during the first week.
  4. Premium trial offered after the user receives two useful recommendations.
  5. Premium unlocks photo volume, full history, reliable patterns, structured label mode and preferences.
  6. Optional 14-day web-purchase refund guarantee, clearly separated from app-store refund policies.

  RevenueCat reports Health & Fitness medians of 6.9% download-to-trial, 37.7% trial-to-paid, and 2.9% download-to-paid by day 35. It also reports materially better trial
  conversion for longer trials, although 5–9 days remains the most common Health & Fitness range. RevenueCat 2026
  (https://www.revenuecat.com/state-of-subscription-apps-2026-health-and-fitness/).

  ### Unit economics

  AI cost is unlikely to justify premium pricing by itself. At the repository’s approximate 1,000-input/200-output-token assumption:

  - GPT-5.4 mini is approximately $0.00165 per text check.
  - GPT-5.4 nano is approximately $0.00045.
  - Ten checks a day, using mini for the first ten and nano thereafter, is roughly $0.15/month in text-model cost before photo calls and infrastructure.

  Official prices are $0.75/$4.50 per million input/output tokens for mini and $0.20/$1.25 for nano. OpenAI pricing announcement
  (https://openai.com/index/introducing-gpt-5-4-mini-and-nano/).

  The business should sustain strong gross margin even after store fees; support, acquisition, refunds and churn will matter more than inference. Apple’s qualifying
  small-business commission is 15%. Apple programme (https://developer.apple.com/app-store/small-business-program/).

  More concerning is that the current route silently switches users from the stronger model to the less reliable nano model after ten stored checks. See app/api/check/
  route.ts:80. That saves cents while potentially degrading the trust-critical paid experience.

  ———

  ## 6. Demand and likely adoption

  These are planning ranges, not forecasts; Revora has no real cohort data yet.

   Funnel stage                         Current-product estimate    After P0/P1 work
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━
   Targeted visitor downloads/starts                      15–30%              20–35%
  ───────────────────────────────────  ──────────────────────────  ──────────────────
   Installer completes onboarding                         55–75%              65–80%
  ───────────────────────────────────  ──────────────────────────  ──────────────────
   Completes a useful first check                         45–65%              60–75%
  ───────────────────────────────────  ──────────────────────────  ──────────────────
   Returns during week one                                20–35%              30–45%
  ───────────────────────────────────  ──────────────────────────  ──────────────────
   Returns during month one                                8–18%              15–25%
  ───────────────────────────────────  ──────────────────────────  ──────────────────
   Starts trial                                             3–7%               6–12%
  ───────────────────────────────────  ──────────────────────────  ──────────────────
   Trial converts to paid                                 25–40%              35–50%
  ───────────────────────────────────  ──────────────────────────  ──────────────────
   Download-to-paid by day 35                               1–3%              2.5–5%

  Monthly subscription retention is a major risk. RevenueCat’s cross-category median year-one retention is approximately 8% for monthly subscriptions and 28% for annual
  subscriptions. AI apps reportedly monetize better initially but churn faster. RevenueCat 2026
  (https://www.revenuecat.com/state-of-subscription-apps-2026-health-and-fitness/).

  ### Biggest adoption barriers

  - Many people do not feel urgency after a prediabetes diagnosis.
  - Free chatbots can produce plausible advice.
  - “AI looked at my meal” is not sufficient proof.
  - Users cannot easily verify whether a recommendation was correct.
  - Photo clarification can remove the promised speed advantage.
  - The current output may become repetitive after a few meals.
  - Privacy sensitivity is elevated because A1C and eating behavior are health data.
  - Subscription fatigue is severe.
  - The user may expect medical or individualized glucose guidance that Revora deliberately cannot provide.

  ### First-session aha moment

  The user photographs or describes a real, ambiguous meal, corrects one uncertain component, and receives an adjustment that:

  - Explains why the meal composition matters.
  - Preserves most of the meal.
  - Fits what the user actually has available.
  - Takes less than one minute.
  - Clearly states what Revora cannot know.

  ### First-week aha moment

  Revora identifies a genuine repeated situation—such as breakfast drinks or late-afternoon snacks—and proposes two realistic alternatives based on what the user accepted or
  rejected during the week.

  It should then ask:

  - Did you make the change?
  - Was it practical?
  - Were you satisfied?
  - Would you choose it again?

  Those answers are more useful and honest than pretending a streak is a health outcome.

  ———

  ## 7. Prioritized improvements

   Priority    Recommendation                     User problem solved                Expected impact                          Effort        Evidence/reasoning
  ━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   P0          Replace “Clear / Be careful /      False confidence and shame         Very high trust and safety impact        Medium        Individual glucose responses
               Hold off” with calibrated meal-                                                                                              vary; present wording implies
               pattern language and foreground                                                                                              personal prediction
               uncertainty
  ──────────  ─────────────────────────────────  ─────────────────────────────────  ───────────────────────────────────────  ────────────  ──────────────────────────────────
   P0          Add deterministic medical-risk     Prevents harmful meal verdicts     Critical safety impact                   Medium        Current precheck and 48-case
               routing for symptoms, insulin,     on clinical questions                                                                     eval omit these scenarios
               medication, pregnancy,
               allergies, kidney disease and
               eating disorders
  ──────────  ─────────────────────────────────  ─────────────────────────────────  ───────────────────────────────────────  ────────────  ──────────────────────────────────
   P0          Run blinded dietitian              No evidence that Revora’s          Critical launch credibility              High          General nutrition evidence does
               validation across at least 150–    verdicts are consistently safe                                                            not validate this product’s
               200 representative meals           or useful                                                                                 classification system
  ──────────  ─────────────────────────────────  ─────────────────────────────────  ───────────────────────────────────────  ────────────  ──────────────────────────────────
   P0          Remove unsupported DPP, “steady    Misleading marketing and           High trust/regulatory impact             Low           Current copy overextends
               repeated meal,” “most popular,”    recommendations                                                                           external evidence
               and similar claims
  ──────────  ─────────────────────────────────  ─────────────────────────────────  ───────────────────────────────────────  ────────────  ──────────────────────────────────
   P0          Keep the stronger model for        Prevents paid-experience           High                                     Low–medium    Saving cents is not worth weaker
               paid decisions until nano          quality degradation                                                                       health-adjacent guidance
               passes a sufficiently broad
               safety and usefulness gate
  ──────────  ─────────────────────────────────  ─────────────────────────────────  ───────────────────────────────────────  ────────────  ──────────────────────────────────
   P1          Add a dedicated nutrition-         Label and carbohydrate             Very high differentiated value           High          This directly solves a stated
               label/barcode mode with            confusion                                                                                 user problem that photo
               serving-size and user-portion                                                                                                transcription does not
               confirmation
  ──────────  ─────────────────────────────────  ─────────────────────────────────  ───────────────────────────────────────  ────────────  ──────────────────────────────────
   P1          Capture preferences: culture,      Generic or unrealistic swaps       High usefulness and retention            Medium
               budget, allergies, appetite,
               food availability and disliked
               substitutions
  ──────────  ─────────────────────────────────  ─────────────────────────────────  ───────────────────────────────────────  ────────────  ──────────────────────────────────
   P1          Add “Was this practical?” and      Product cannot learn what helps    High personalization impact              Medium
               “Did you use this adjustment?”     the individual
               feedback
  ──────────  ─────────────────────────────────  ─────────────────────────────────  ───────────────────────────────────────  ────────────  ──────────────────────────────────
   P1          Build a seven-day onboarding       Weak first-week value              High conversion and retention            Medium
               journey around the user’s own
               recurring meals
  ──────────  ─────────────────────────────────  ─────────────────────────────────  ───────────────────────────────────────  ────────────  ──────────────────────────────────
   P1          Introduce a permanent limited      Users pay before seeing            High conversion impact                   Medium
               free tier and delay the trial      patterns
               wall until after demonstrated
               value
  ──────────  ─────────────────────────────────  ─────────────────────────────────  ───────────────────────────────────────  ────────────  ──────────────────────────────────
   P2          Add evidence pages and             AI skepticism                      Medium trust impact                      Medium
               dietitian-review status for
               recommendation classes
  ──────────  ─────────────────────────────────  ─────────────────────────────────  ───────────────────────────────────────  ────────────  ──────────────────────────────────
   P2          Offer optional DPP, registered-    Users needing more support         Medium safety/outcome impact             Medium
               dietitian and clinician
               referral resources
  ──────────  ─────────────────────────────────  ─────────────────────────────────  ───────────────────────────────────────  ────────────  ──────────────────────────────────
   P2          Add observed-response              Lack of individual proof           Potentially very high differentiation    High
               integrations only with strict
               separation between measured and
               estimated information
  ──────────  ─────────────────────────────────  ─────────────────────────────────  ───────────────────────────────────────  ────────────  ──────────────────────────────────
   P2          Reassess the Pantry Review as a    Funnel complexity                  Moderate conversion clarity              Low
               separate offer

  ———

  ## Final decision

  Revora is worth pursuing because the need is real and the interaction model is better suited to meal-time uncertainty than calorie logging.

  But its defensible product is not “AI tells you whether food is safe.” That promise is neither reliably knowable from a photograph nor unique. Its defensible product is:

  > A bounded, compassionate prediabetes assistant that notices uncertainty, understands the meal as described, and suggests the smallest realistic improvement.

  Before charging broadly, Revora should prove three things:

  1. Dietitians agree its recommendations are acceptably safe.
  2. Users regularly receive advice more specific than “add protein, vegetables, and walk.”
  3. A meaningful share of users act on its recommendations and return after the novelty of photo scanning disappears.

  Current technical verification was positive—110 automated test files completed with no failed files, 86 targeted safety/claims tests passed, and the selected 19 mobile
  smoke cases passed—but that proves implementation consistency, not clinical correctness or willingness to pay.

  Research basis: current Revora source and user-facing flows, automated verification, primary clinical research, official public-health guidance, official competitor
  pricing, and 2026 subscription benchmarks. No user interviews, production retention cohort, or independent clinical validation were available, so the commercial funnel
  estimates should be treated as hypotheses to test.

⚠ failed to parse hooks config /home/tefera/.codex/hooks.json: unknown field `SessionStart`, expected `description` or `hooks` at line 2 column 16


› continue


• I’ll continue with the implementation-ready layer: exact P0 changes, safer replacement copy, a validation protocol, pricing experiment design, and measurable go/no-go
  thresholds. I’m keeping this read-only because the original request was a review, not authorization to change the app.

• Ran rg -n --glob '*.{ts,tsx,md,json}' 'Should I eat this|Answered in seconds|Clear|Be careful|Hold off|58%|CDC DPP|consistency profile|week three|steady choice|Most
  │ popular|all checks|all your checks|tuned to|A1C|medical advice|glucose spike|blood sugar|blood-glucose|prevent|reverse|diagnos|treat' app components lib content docs
  │ PRODUCT.md 2>/dev/null | head -320
  └ PRODUCT.md:9:Recently-diagnosed "trying hard but flying blind" prediabetics — US adults, sweet spot 40–60, A1C 5.7–6.4% in the last ~6 months, handed vague "eat better,
    come back in six months" advice. Context of use: the moment of a meal decision (dinner table, grocery aisle, restaurant), phone in hand, anxious. The job: "should I eat
    … +324 lines (ctrl + t to view transcript)
    tonight. Watch." [P2 | simplicity | Dana]
    docs/archive/Revora_90-Day_Distribution_Strategy_v1-archived-20260707.md:336:8. "Your A1C is a starting line, not a verdict." [P2 | hope | all]

• Ran rg -n --glob '*.{ts,tsx,json}' 'Clear|Be careful|Hold off|Should I eat this|58%|consistency profile|week three|steady choice|Most popular|A1C range|tuned to|all
  │ checks|spike|safer swap' app components lib content 2>/dev/null
  └ lib/coach/insights.ts:108:    text: `${capitalize(repeated[0])} is one of your go-to meals — a steady choice you already know makes the daily decision easy.`
    lib/revora/launch-controls.ts:46: *  - A provider-failure spike has been detected (manual operator input)
    … +53 lines (ctrl + t to view transcript)
    app/api/profile/route.ts:18:  "Revora is designed for the prediabetes A1C range of 5.7% to 6.4%. This value sits below that range, so use a doctor or registered
    dietitian for guidance that is specific to you.";

⚠ Heads up, you have less than 5% of your 5h limit left. Run /status for a breakdown.

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• ## Phase 2: implementation-ready launch package

  A deeper copy sweep confirms that the problem is broader than a few landing-page sentences. “Clear / Be careful / Hold off” appears across results, history, onboarding,
  dashboard, store-listing material, and marketing strategy. The internal PRODUCT.md:13 also contains a “reversal” North Star that could keep reintroducing unsafe claims.

  The launch decision remains:

  > Do not broadly market or monetize Revora until the P0 claims, clinical routing, model-quality, and validation gates below pass.

  ## 1. Exact P0 engineering work

   Ticket    Change                                                Principal files                                       Acceptance test
  ━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   P0-01     Replace definitive verdict taxonomy everywhere        components/result-card.tsx:34, components/today-      No user-facing Clear, Be careful, or Hold off;
                                                                   list.tsx:4, dashboard, history, onboarding,           internal SAFE/MODERATE/HIGH may remain
                                                                   landing, demo
  ────────  ────────────────────────────────────────────────────  ────────────────────────────────────────────────────  ─────────────────────────────────────────────────────
   P0-02     Add a deterministic clinical-risk router before       lib/revora/input-precheck.ts:114, service, safety     Symptoms, medication, insulin, allergies and other
             the model                                             contract                                              clinical prompts never receive a meal verdict
  ────────  ────────────────────────────────────────────────────  ────────────────────────────────────────────────────  ─────────────────────────────────────────────────────
   P0-03     Expand the safety evaluation set                      tests/fixtures/revora-eval-cases.json:1               Every required high-risk category has multiple
                                                                                                                         paraphrases and adversarial combinations
  ────────  ────────────────────────────────────────────────────  ────────────────────────────────────────────────────  ─────────────────────────────────────────────────────
   P0-04     Remove unsupported DPP and behavioral claims          lib/coach/bai.ts:127, app/page.tsx:188, How It        DPP results are clearly attributed to the intensive
                                                                   Works                                                 DPP intervention, never Revora
  ────────  ────────────────────────────────────────────────────  ────────────────────────────────────────────────────  ─────────────────────────────────────────────────────
   P0-05     Fix repeated-meal insight                             lib/coach/insights.ts:88                              A repeated HIGH meal can never be called a “steady
                                                                                                                         choice”
  ────────  ────────────────────────────────────────────────────  ────────────────────────────────────────────────────  ─────────────────────────────────────────────────────
   P0-06     Remove unsupported popularity claims                  components/paywall-card.tsx:150                       No “Most popular” until purchasing data establishes
                                                                                                                         it
  ────────  ────────────────────────────────────────────────────  ────────────────────────────────────────────────────  ─────────────────────────────────────────────────────
   P0-07     Stop silently downgrading paid checks to the          app/api/check/route.ts:80                             Paid checks use the validated production model
             weaker model                                                                                                unless another model independently passes the full
                                                                                                                         gate
  ────────  ────────────────────────────────────────────────────  ────────────────────────────────────────────────────  ─────────────────────────────────────────────────────
   P0-08     Reconcile free-access copy with the ten-check         Landing, trial wall, lib/client/taster-store.ts:1     Users see the exact number, expiration and card
             implementation                                                                                              requirement before beginning
  ────────  ────────────────────────────────────────────────────  ────────────────────────────────────────────────────  ─────────────────────────────────────────────────────
   P0-09     Replace the internal “reversal” product North Star    PRODUCT.md:13, product marketing and store listing    Internal and external claims use the same approved
                                                                                                                         claim ledger
  ────────  ────────────────────────────────────────────────────  ────────────────────────────────────────────────────  ─────────────────────────────────────────────────────
   P0-10     Complete counsel review and remove legal              Terms, privacy, subscription and health-claim         Counsel approval recorded for every launch-market
             placeholders                                          documents                                             surface

  ## 2. Recommended verdict language

  Keep the internal risk classes for routing and testing, but change what users see:

   Internal class              Current       Recommended
  ━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SAFE                        Clear         Usually a steadier pattern
  ──────────────────────────  ────────────  ────────────────────────────
   MODERATE                    Be careful    Worth a small tweak
  ──────────────────────────  ────────────  ────────────────────────────
   HIGH                        Hold off      Likely higher-impact
  ──────────────────────────  ────────────  ────────────────────────────
   Insufficient information    Clarify       I need one more detail

  Every result should include a visible qualifier immediately below the heading:

  > Based on the foods and portion you described. This is general guidance for adults in the prediabetes A1C range—not a prediction of your glucose response.

  For photographs:

  > I can identify visible foods, but not hidden ingredients or the exact portion. Check the draft before using the guidance.

  “Likely higher-impact” should not automatically mean “do not eat.” It should lead to:

  1. Why the meal received that classification.
  2. The smallest practical adjustment.
  3. An optional alternative.
  4. A question when missing information could materially change the answer.

  ## 3. Safer landing-page copy

  ### Hero

  Current

  > Should I eat this? Answered in seconds.

  Recommended

  > Not sure what to eat? Start with the meal in front of you.

  Supporting copy:

  > Describe or photograph a meal. Revora explains what may make it steadier for adults in the prediabetes range and suggests one practical next step—without calorie logging
  > or pretending to predict your personal glucose response.

  CTA:

  > Check a meal free

  ### How it works

  > 1. Describe the meal or confirm what Revora can see.
  > 2. Get a cautious, plain-language assessment.
  > 3. Keep the meal and adjust what matters most.

  ### Evidence section

  Replace the current implied DPP association with:

  > Sustained eating, activity and weight changes reduced diabetes progression in the intensive Diabetes Prevention Program. Revora was not part of that study. Revora
  > focuses on one smaller job: helping you make a practical food decision when you need one.

  ### Pricing section

  > Try 10 meal checks on your first day. No account or card required.
  > Premium adds more checks, photo input, full history and weekly patterns.

  Only make that claim if those exact entitlements are consistently enforced across web and app.

  ## 4. Clinical-risk router

  The router should run before the meal model and return a non-generative approved response.

   Input class                                                                 Required behavior
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Insulin or medication dose/change                                           No meal verdict; direct user to prescribed plan, pharmacist or clinician
  ──────────────────────────────────────────────────────────────────────────  ───────────────────────────────────────────────────────────────────────────────────────────────
   Possible low blood glucose                                                  No ordinary food recommendation; tell user to follow their established urgent treatment plan
                                                                               and seek immediate help if severe
  ──────────────────────────────────────────────────────────────────────────  ───────────────────────────────────────────────────────────────────────────────────────────────
   Vomiting, confusion, breathing difficulty, inability to keep fluids down    Urgent-care response; local emergency-services language
  ──────────────────────────────────────────────────────────────────────────  ───────────────────────────────────────────────────────────────────────────────────────────────
   Pregnancy or gestational diabetes                                           Explain that individual clinical guidance is required
  ──────────────────────────────────────────────────────────────────────────  ───────────────────────────────────────────────────────────────────────────────────────────────
   Kidney, liver or serious cardiovascular disease                             Avoid generic high-protein, sodium or exercise advice
  ──────────────────────────────────────────────────────────────────────────  ───────────────────────────────────────────────────────────────────────────────────────────────
   Eating-disorder language                                                    No restriction-oriented verdict; compassionate professional-support routing
  ──────────────────────────────────────────────────────────────────────────  ───────────────────────────────────────────────────────────────────────────────────────────────
   Serious allergy or intolerance                                              State that photographs cannot confirm allergen safety
  ──────────────────────────────────────────────────────────────────────────  ───────────────────────────────────────────────────────────────────────────────────────────────
   Type 1 or established type 2 diabetes                                       Explain Revora’s current scope; do not imply the advice incorporates medication or glucose-
                                                                               monitor data
  ──────────────────────────────────────────────────────────────────────────  ───────────────────────────────────────────────────────────────────────────────────────────────
   Food plus medical question                                                  Medical routing takes precedence over meal classification

  Required gate: 100% correct routing across the clinical-risk test set, including misspellings, casual language and prompts containing both a valid meal and a medical
  concern.

  ## 5. Validation study

  Automated tests establish software consistency. They do not establish that the recommendations are nutritionally sound.

  ### Expert validation set

  Build a locked set of approximately 240 cases:

  - 80 ordinary typed meals.
  - 40 incomplete or ambiguous descriptions.
  - 40 meal photographs paired with verified ingredients.
  - 30 nutrition labels and serving-size cases.
  - 30 culturally varied mixed dishes.
  - 20 high-risk clinical or adversarial prompts.

  Use three independent reviewers:

  - Two registered dietitians.
  - At least one diabetes-specialist dietitian or CDCES.
  - Resolve disagreements through a predefined rubric, not informal consensus.

  ### Expert success gates

  - Zero dangerous false reassurance in high-risk cases.
  - 100% appropriate medical routing.
  - At least 85% agreement with the expert-majority recommendation direction.
  - At least 90% of adjustments judged safe and feasible.
  - Fewer than 15% of accepted answers judged generic enough to fit almost any meal.
  - At least 95% judged non-shaming.
  - No invented hidden ingredient stated as fact.
  - Every material uncertainty either clarified or visibly disclosed.

  ### Real-user validation

  Recruit 25–30 adults who:

  - Received an A1C of 5.7–6.4 within the previous six months.
  - Are not using insulin.
  - Regularly make their own food decisions.
  - Represent varied cultures, budgets and cooking habits.

  Run a seven-day study using users’ real meals.

  Measure:

  - Time to first useful result.
  - Whether the recommendation changed or confirmed the decision.
  - Whether the adjustment was practical.
  - Whether the user felt judged or restricted.
  - How often a result seemed generic.
  - How often the user disagreed with the photo draft.
  - Trust before and after uncertainty disclosure.
  - Return behavior without push notifications.
  - Willingness to pay after day one and day seven.

  ### Product-validation gates

  Do not expand paid acquisition until:

  - At least 60% reach a useful-result aha moment in session one.
  - At least 70% of rated checks are considered practically helpful.
  - At least 75% say the language increased clarity without increasing food anxiety.
  - At least 25% return during week one without researcher prompting.
  - Fewer than 5% report harmful, shaming or dangerously reassuring guidance.
  - No serious safety incident remains unresolved.

  ## 6. Pricing experiment

  ### Recommended initial offer

  - $9.99/month.
  - $79.99/year.
  - Annual selected by default and labelled “Best value.”
  - Ten no-card introductory checks.
  - Afterward, approximately three free text checks per week.
  - Premium photo allowance, full history and validated insights.
  - Seven- or fourteen-day Premium trial offered after the second helpful result.
  - Pre-charge email and one-tap cancellation retained.

  ### Experiment design

  After value and safety validation, randomize eligible new users:

   Variant    Monthly    Annual
  ━━━━━━━━━  ━━━━━━━━━  ━━━━━━━━
   A            $9.99    $79.99
  ─────────  ─────────  ────────
   B           $12.99    $99.99

  Keep onboarding, trial, annual selection, and feature entitlements identical.

  Primary metric:

  > Net day-35 revenue per eligible new user.

  Guardrails:

  - First-session completion.
  - Trial starts.
  - Trial-to-paid conversion.
  - Refund requests.
  - Day-zero and first-renewal cancellation.
  - Customer-support complaints.
  - Helpfulness score.
  - Annual-plan mix.
  - Payment failure.
  - Safety-related feedback.

  Do not declare the higher price the winner merely because it produces more initial revenue. It must not materially worsen first-renewal retention, refunds, or trust.

  ## 7. Product analytics required before launch

  Track privacy-preserving events for:

  - Onboarding started/completed.
  - First real meal entered.
  - Photo draft corrected.
  - Clarification requested.
  - Result delivered.
  - Result marked helpful/unhelpful.
  - Adjustment accepted/rejected.
  - User reports that result changed the decision.
  - Clinical router activated.
  - Trial shown/started.
  - Pre-charge reminder delivered.
  - Subscription started/cancelled/refunded.
  - Return on days 1, 3, 7 and 30.

  The north-star activation event should be:

  > A user receives a result, marks it helpful, and says the recommendation clarified or improved the meal decision.

  A check count or photo upload alone is not evidence of value.

  ## 8. Go/no-go launch gate

   Gate                      Launch requirement
  ━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Claims                    No unsupported reversal, personal-glucose, DPP-equivalence or popularity claims
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────
   Safety                    Clinical router passes all critical cases
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────
   Recommendation quality    Expert validation thresholds pass
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────
   User value                First-session aha and seven-day usefulness thresholds pass
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────
   Model quality             Production model passes the exact full-path evaluation
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────
   Pricing                   Users have experienced differentiated value before the card wall
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────
   Legal                     Terms, privacy, subscriptions and health claims approved
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────
   Trust                     Photo and nutritional uncertainty are visible before users act
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────
   Operations                Model/provider failure produces a safe response, not a confident fallback
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────
   Commercial                Paid conversion and early retention show credible acquisition economics

  The next logical execution phase is P0-01 through P0-09, beginning with the verdict taxonomy and clinical-risk router because they change both safety and every downstream
  marketing surface.

