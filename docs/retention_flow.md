 ## My recommended product model
 
 
  Using a CEO-review lens, I compared three approaches:
 
 
   Approach                                    Verdict                Why
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Keep the indefinite subscription            Not recommended now    Easy technically, but the recurring value is too weak after users learn their common meals
  ──────────────────────────────────────────  ─────────────────────  ─────────────────────────────────────────────────────────────────────────────────────────────────
   90-day program plus optional maintenance    Recommended            Fits the natural user journey, existing graduation architecture, and honest value curve
  ──────────────────────────────────────────  ─────────────────────  ─────────────────────────────────────────────────────────────────────────────────────────────────
   Build a continuously adaptive AI coach      Consider later         Potentially stronger recurring value, but much more safety, privacy, clinical, and product risk


 The recommended model is:
 
 
  > Revora is a 90-day meal-confidence program that helps users build a personal meal playbook, followed by an optional lighter maintenance service.
 
 
  Do not promise that it changes health outcomes. The outcome is clearer meal decisions and a usable personal library.
 
 
  ## Recommended app structure
 
 
  Do not try to expose every feature equally. That creates a “feature warehouse.” Structure everything around four user jobs.
 
 
  ### 1. Home — “Help me decide now”
 
 
  Show:
 
 
  - One main action: Check a meal
  - Text, voice, and authorized photo input
  - Today’s recent decision
  - One relevant next action
 
 
  Do not fill Home with history, scores, Pantry promotions, billing messages, and journey cards competing for attention.
 
 
  ### 2. My Meals — “Help me remember what worked for me”
 
 
Combine the mental model of History and Meal Memory:
 
 
  - Recent checks
  - Saved meals
  - Favorite/default meals
  - Search
  - Edit notes
  - Check again
  - Export and delete
 
 
  History is the automatic record. Memory is the user-curated version. They can remain separate technically, but should feel like one understandable area to users.
 
 
  ### 3. My Journey — “Show me what I am learning”
 
 
  Show:
 
 
  - Current program stage
  - Weekly practical brief
  - Saved defaults
  - Remaining uncertainty
  - One useful next experiment
  - Pause, graduate, or move into maintenance
 
 
  Avoid a score dominated by usage frequency. If a user becomes more confident and checks less often, the product should celebrate that—not imply their progress has
  declined.
 
 
  ### 4. Account — “Let me control everything”

Keep here:
 
 
  - Reminder preferences
  - Quiet hours
  - Subscription and cancellation
  - Support and refunds
  - Privacy and consent
  - Export
  - Health-data deletion
  - Account deletion
 
 
  Pantry Review should remain a separate one-time product. Admin tools, crons, analytics, and the video engine should remain invisible to ordinary users.
 
 
  ## Recommended lifecycle
 
 
   Period                User experience                                                             Success signal
  ━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   First five minutes    Complete one useful check before heavy onboarding                           User says the result helped with a real decision
  ────────────────────  ──────────────────────────────────────────────────────────────────────────  ───────────────────────────────────────────────────────────
   Days 1–7              Check genuinely uncertain meals and save one useful choice                  At least one saved meal and a second meaningful use
  ────────────────────  ──────────────────────────────────────────────────────────────────────────  ───────────────────────────────────────────────────────────
   Weeks 2–4             Build a small library of reliable choices                                   User independently returns to a saved meal
  ────────────────────  ──────────────────────────────────────────────────────────────────────────  ───────────────────────────────────────────────────────────
   Months 2–3            Receive a useful weekly decision brief and complete missing contexts        Weekly brief causes a useful action
  ────────────────────  ──────────────────────────────────────────────────────────────────────────  ───────────────────────────────────────────────────────────
   Day 90                Export or keep the meal playbook; graduate, pause, or choose maintenance    Graduation is treated as success
  ────────────────────  ──────────────────────────────────────────────────────────────────────────  ───────────────────────────────────────────────────────────
   Months 4–6            Use Revora for novel meals, travel, restaurants, or occasional refreshes    Maintenance users receive new value and renew voluntarily
 
 
  ## Pricing recommendation

Do not promote the annual plan yet. The current product-marketing document still advertises $12.99/month and $99.99/year, while admitting price acceptance remains
  unvalidated. docs/product-marketing.md:92
 
 
  For the first study:
 
 
  - Use one disclosed price, not two.
  - My preference would be $9.99/month for the first formative cohort.
  - Require at least eight completers.
  - Pass only if at least five independently recall/use Meal Memory twice and agree to continue paying.
  - If it passes, test $12.99 in a separate preregistered cohort.
  - Do not offer annual billing until real Day-365 and renewal evidence exists.
 
 
  The first study only proves that the idea deserves a larger test. It does not prove three- or six-month retention.
 
 
  The existing retention protocol correctly separates the 90-day program from maintenance: D7/D30/D60/D90 for the main journey, then D180/D365 for maintenance. docs/
  research/retention-cohort-preregistration.md:79
 
 



*****************************************


## Required order of operations
 
 
  1. Fix access and measurement first.
 
 
     Users must be able to reach the app, sign in, receive email, get support, and generate trustworthy analytics.
 
 
  2. Fix unresolved billing and reliability defects.
 
 
     Do not charge beta users while cancellation, webhook, entitlement, refund, or support paths remain unreliable.
 
 
  3. Run complete browser E2E testing.
 
 
     Automated unit tests are strong, but the real multi-page journey still needs mobile and browser proof.
 
 
  4. Complete the privacy and human approval gates.
 
 
     Meal Memory and Journey touch health-adjacent data and behavior. Privacy, RD/CDCES, counsel, accessibility, and target-user review remain separate requirements.
 
 
  5. Run the single-price concierge study.
 
 
     Do not enable the new journey broadly before this passes.
 
 
  6. Run a small paid 90-day cohort.
 
     Measure actual usefulness, cancellations, refunds, D30/D60/D90 retention, and graduation.
 
 
  7. Offer maintenance only after Day 90.
 
 
     Then measure it as a separate product rather than disguising graduation as churn.
 
 
  ## Final recommendation
 
 
  Choose the 90-day program plus optional maintenance model.
 
 
  But change the goal from:
 
 
  > “Make everyone remain subscribed for six months.”
 
 
  to:
 
 
  > “Help users complete a valuable 90-day journey, then earn voluntary maintenance payment from the smaller group that continues receiving new value.”


