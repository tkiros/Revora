> **Superseded for sequencing/positioning by `docs/implementation-plan-to-play.md` (coach-first, 2026-06-30).** Retained for reference; camera/CGM/BAI work is deferred.

<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# Revora Frontend Implementation Plan v1.1

**Domain:** Frontend (React Native / Expo)  
**Owner:** Person B  
**Stack:** React Native, Expo SDK 52, Expo Router, Zustand, TanStack Query v5, Victory Native XL, RevenueCat SDK, Expo Camera  
**Repo:** `/mobile` (monorepo subdirectory)  
**CI File:** `.github/workflows/frontend-ci.yml`  
**Coverage Target:** 70% enforced (Jest)  
**Last Updated:** 2026-03-15

### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Fixed: CONFLICT-10 — Tab count reduced from 5 to 4 (removed Learn tab per PRD §8.2)
- Fixed: STRUCT-6 — Onboarding screens FE-015–FE-021 moved from Week 1 to Week 3
- Fixed: STRUCT-10 — PostHog paywall-annual-price default corrected from "79.99" to "99.99"
- Added: GAP-6 — FE-010b: EU analytics consent banner (Week 3)
- Added: GAP-5 — FE-090: CCPA "Do Not Sell" toggle in Profile settings (Week 10)
- Removed: SCOPE-5 — Price feature flags removed (hardcode PRD prices for MVP)

---

## FRONTEND MISSION

Build a fast, compliant, beautifully simple mobile UI that delivers Revora's AI-driven meal scanning experience on iOS and Android. Every screen answers ONE question, every result is paired with an action, and no health claims ever reach production.

**Critical Success Factors:**
1. **Cold start <2s** (VAL-029) — First impression
2. **Scan result visible ≤5s** (VAL-003) — Core UX promise
3. **A1C NEVER shown without ±0.2 bounds + disclaimer** (VAL-016) — Compliance gate
4. **Tokens in Keychain/EncryptedSharedPreferences only** (SEC-003) — Never AsyncStorage
5. **Zero reversal/cure/treat language in any JSX** (BLK-006) — App Store gate

---

## PHASE 0: FOUNDATION (Weeks 1–2)

### Project Setup

**FE-001: Expo SDK 52 Project Initialization**
**Effort:** [S] 3 hours
**Week:** 1
**Depends on:** None
**Blocks:** All frontend tasks
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §6.1, PRD §7.1

**Acceptance:**
- `npx create-expo-app revora --template` succeeds with SDK 52
- Expo Router file-based routing configured (`app/` directory structure)
- `npx expo start` launches on iOS simulator and Android emulator
- Directory structure matches SPEC §6.1 exactly:
  ```
  app/
    _layout.tsx          ← Root layout
    (auth)/
      login.tsx
      register.tsx
      guest.tsx
    (onboarding)/
      welcome.tsx
      a1c-entry.tsx
      goal.tsx
      dietary-profile.tsx
      gl-education.tsx
      age-consent.tsx
    (tabs)/
      index.tsx           ← Home/Dashboard
      scan.tsx            ← Camera FAB
      progress.tsx        ← A1C History
      profile.tsx         ← Settings
    scan/[id].tsx         ← Scan Results
    meal/[id].tsx         ← Meal Detail
    paywall.tsx
    export.tsx
  ```

**Notes:**
- Use `expo-router` v3 (bundled with SDK 52)
- Set `scheme: "revora"` in `app.json` for deep links
- Initialize TypeScript from Day 1 (`tsconfig.json` with `"strict": true`)

---

**FE-002: TypeScript Strict Mode + ESLint Health Claims Lint Rule**
**Effort:** [S] 3 hours
**Week:** 1
**Depends on:** FE-001
**Blocks:** FE-007 (CI enforcement), BLK-006, BLK-014
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §11.4, PRD §14

**Acceptance:**
- `tsconfig.json` has `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`
- ESLint configured with `@typescript-eslint/recommended`
- Custom lint rule: `grep -r "reversal\|reverse\|cure\|treat" src/` fails CI build
- `npx tsc --noEmit` passes with zero errors on fresh project
- `npx eslint .` passes with zero warnings

**ESLint Config (.eslintrc.js):**
```js
module.exports = {
  extends: [
    'expo',
    '@typescript-eslint/recommended',
    'plugin:i18next/recommended',
  ],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/reversal|reverse|cure|treat/i]',
        message: 'Health claim language is prohibited. See compliance guidelines.',
      },
    ],
  },
};
```

**Notes:**
- The `i18next/no-literal-string` rule enforces all strings go through `t()` — no hard-coded user-visible strings in JSX

---

**FE-003: Zustand Store Setup**
**Effort:** [M] 4 hours
**Week:** 1
**Depends on:** FE-001
**Blocks:** FE-021 (onboarding state), FE-026 (token storage), FE-036 (dashboard state)
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §6.2

**Acceptance:**
- Three stores created matching SPEC §6.2 interfaces exactly:
  - `stores/userStore.ts` — `userId`, `isGuest`, `a1cBaseline`, `a1cGoal`, `dietaryProfile`, `glBudget`, `subscriptionTier`, `timezone`
  - `stores/dashboardStore.ts` — `glConsumed`, `glBudget`, `meals`, `streak`, `dailyScore`
  - `stores/scanStore.ts` — `isScanning`, `currentScan`, `scanMode`, `scanHistory`
- All stores typed with TypeScript interfaces
- Zustand `persist` middleware configured with AsyncStorage for non-sensitive data only (tokens are NEVER stored here — see FE-026)

**Implementation:**
```typescript
// stores/userStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  userId: string | null;
  isGuest: boolean;
  a1cBaseline: number | null;
  a1cGoal: number | null;
  dietaryProfile: string[];
  glBudget: number;
  subscriptionTier: 'free' | 'premium' | 'lifetime';
  timezone: string;
  setUser: (user: Partial<UserState>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      isGuest: false,
      a1cBaseline: null,
      a1cGoal: null,
      dietaryProfile: [],
      glBudget: 80,
      subscriptionTier: 'free',
      timezone: 'UTC',
      setUser: (user) => set((state) => ({ ...state, ...user })),
      clearUser: () => set({ userId: null, isGuest: false }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // NEVER persist tokens here — tokens go to Keychain (FE-026)
    }
  )
);
```

---

**FE-004: TanStack Query v5 Setup**
**Effort:** [S] 3 hours
**Week:** 1
**Depends on:** FE-001
**Blocks:** FE-032 (scan API call), FE-041 (dashboard query), FE-042 (offline persistence)
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §6.3, REC-020

**Acceptance:**
- `QueryClient` initialized with:
  - `defaultOptions.queries.staleTime = 10_000` (10 seconds)
  - `defaultOptions.queries.retry = 2`
  - `defaultOptions.queries.gcTime = 1000 * 60 * 5` (5 minutes)
- Offline persistence via `@tanstack/query-async-storage-persister` + AsyncStorage
- `QueryClientProvider` wraps root `_layout.tsx`
- Test: `useDashboard` hook returns cached data when network offline

**Implementation (hooks/useDashboard.ts):**
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard', 'today'],
    queryFn: () => api.get('/dashboard/today'),
    refetchInterval: 30_000,   // 30s polling per SPEC 6.3, ISSUE-042
    staleTime: 10_000,
  });
```

---

**FE-005: API Client Setup**
**Effort:** [M] 5 hours
**Week:** 1
**Depends on:** FE-001, FE-026 (token storage)
**Blocks:** All API-calling tasks
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §6.3, DEP-009

**Acceptance:**
- Base URL configured from env var (`EXPO_PUBLIC_API_URL`)
- Auth header injected automatically: `Authorization: Bearer {accessToken}`
- 401 response triggers refresh token flow (FE-027) before retrying original request
- All request/response field names enforced as `camelCase` (DEP-009)
- Network errors surface a user-friendly message, not raw error objects
- Timeout: 15 seconds (scan endpoint allows up to 20s)

**Implementation (lib/api.ts):**
```typescript
import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const api: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL + '/api/v1',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401 refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshTokens();  // FE-027
        return api(originalRequest);
      } catch {
        await logout();  // Rotation failed — force logout
      }
    }
    return Promise.reject(error);
  }
);

export { api };
```

---

**FE-006: react-i18next Setup**
**Effort:** [S] 3 hours
**Week:** 1
**Depends on:** FE-001
**Blocks:** All screen tasks (strings must be externalized from Day 1)
**Owner:** Person B
**SPEC/PRD Reference:** REC-012

**Acceptance:**
- `i18next` + `react-i18next` configured
- `locales/en.json` file created with ALL user-visible strings
- ESLint rule `i18next/no-literal-string` blocks hard-coded strings in JSX
- `useTranslation` hook used in every component with user-visible text
- Test: `npx eslint .` fails if any JSX contains a hard-coded string

**locales/en.json (partial):**
```json
{
  "onboarding": {
    "welcome": {
      "headline": "Just diagnosed? We've got you.",
      "subtext": "Revora helps you understand exactly what to eat — one photo at a time.",
      "cta": "Let's get started",
      "skip": "Skip"
    },
    "a1cEntry": {
      "title": "What's your most recent A1C?",
      "dontKnow": "I don't know yet"
    }
  },
  "scan": {
    "disclaimer": "Estimate based on visual analysis — not medical advice.",
    "analyzing": "Analyzing your meal...",
    "cacheHit": "Instant result"
  },
  "a1c": {
    "disclaimer": "Estimate only — verify with laboratory A1C test. This is not a medical measurement.",
    "divergenceWarning": "Your lab results differ significantly from our estimate. Please consult your doctor."
  },
  "errors": {
    "network": "No connection. Showing cached data.",
    "scanTimeout": "Analysis is taking longer than expected. Please try again.",
    "invalidImage": "Please upload a JPEG or PNG image."
  }
}
```

---

**FE-007: GitHub Actions Frontend CI Pipeline**
**Effort:** [M] 4 hours
**Week:** 1
**Depends on:** FE-001, FE-002, FE-006
**Blocks:** All PRs to `main`
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §7.1

**Acceptance:**
- CI runs on every push to `main` and every PR
- Enforces: `eslint`, `tsc --noEmit`, `jest --coverage`, `expo export`
- Coverage gate: ≥70% (build fails below)
- Reversal language grep: `grep -r "reversal\|reverse\|cure\|treat" src/` fails build if matched
- `i18next/no-literal-string` lint check in CI

**.github/workflows/frontend-ci.yml:**
```yaml
name: Frontend CI
on: [push, pull_request]
jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx eslint .
      - run: npx tsc --noEmit
      - run: npx jest --coverage --coverageThreshold='{"global":{"lines":70}}'
      - run: npx expo export --platform all
      - name: Reversal Language Check
        run: |
          if grep -r "reversal\|reverse\|cure\|treat" src/; then
            echo "Health claim language detected in source code"
            exit 1
          fi
```

---

**FE-008: EAS Build Configuration**
**Effort:** [S] 3 hours
**Week:** 1
**Depends on:** FE-001
**Blocks:** FE-066 (TestFlight), FE-067 (Play Console), FE-082 (production submit)
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §7.1, DO-015, DO-016

**Acceptance:**
- `eas.json` created with 3 build profiles
- iOS bundle ID: `com.revora.app`
- Android package: `com.revora.app`
- `EXPO_PUBLIC_API_URL` set per environment: staging for dev/preview, production for production
- `eas build --profile development` succeeds and installs on physical device

**eas.json:**
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_API_URL": "https://api-staging.revora.app" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_API_URL": "https://api-staging.revora.app" }
    },
    "production": {
      "env": { "EXPO_PUBLIC_API_URL": "https://api.revora.app" }
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "your@apple.id", "ascAppId": "YOUR_APP_ID" },
      "android": { "serviceAccountKeyPath": "./google-play-key.json" }
    }
  }
}
```

---

**FE-009: Sentry React Native SDK Integration**
**Effort:** [S] 3 hours
**Week:** 1
**Depends on:** FE-001
**Blocks:** None (observability)
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §INF-007, DO-012

**Acceptance:**
- `@sentry/react-native` installed and initialized in `_layout.tsx`
- DSN from env var `EXPO_PUBLIC_SENTRY_DSN`
- Session replay: **DISABLED** (user health data privacy — SPEC §INF-007)
- Source maps uploaded on each EAS production build
- Test: throw a test error in dev — verify it appears in Sentry dashboard

**Implementation:**
```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableSessionReplay: false,    // DISABLED — health data privacy
  tracesSampleRate: 0.1,
  environment: process.env.EXPO_PUBLIC_ENV ?? 'development',
});
```

---

**FE-010: PostHog React Native SDK + Feature Flags**
**Effort:** [M] 5 hours
**Week:** 1
**Depends on:** FE-001
**Blocks:** FE-035 (scan limit UX), FE-060 (paywall), FE-061 (paywall triggers)
**Owner:** Person B
**SPEC/PRD Reference:** REQ-029, REC-011, MO-007

**Acceptance:**
- `posthog-react-native` installed and initialized
- All **6 required feature flags** configured (server-side evaluation for price flags):
  1. `paywall-monthly-price` — default: `"12.99"`
  2. `paywall-annual-price` — default: `"99.99"`
  3. `paywall-trigger-context` — default: `"scan_limit"`
  4. `onboarding-social-proof` — default: `"Join thousands tracking their blood sugar wellness"`
  5. `free-scan-limit` — default: `5`
  6. `scan-results-collapsed` — default: `true`
- `identify()` called after login with `userId`
- All feature flags checked via `useFeatureFlag()` hook before use, not hardcoded

**Implementation:**
```typescript
// lib/posthog.ts
import PostHog from 'posthog-react-native';

export const posthog = new PostHog(
  process.env.EXPO_PUBLIC_POSTHOG_KEY!,
  { host: 'https://app.posthog.com' }
);

// Usage — ALWAYS check flag before use, never hardcode values:
const freeScanLimit = posthog.getFeatureFlag('free-scan-limit') ?? 5;
```

---

**FE-010b: EU Analytics Consent Banner**
**Effort:** [M] 6 hours
**Week:** 3
**Depends on:** FE-010 (PostHog setup)
**Blocks:** GDPR compliance for EU users
**Owner:** Person B

**Acceptance:**
- Detect EU user by timezone (Europe/* timezones)
- Show consent banner before PostHog initializes
- Banner: "We use analytics to improve Revora. [Accept] [Decline]"
- Accept → initialize PostHog, store consent in AsyncStorage
- Decline → PostHog never initializes, analytics disabled
- Per PRD §10.3: "Analytics consent banner for EU users (conditionally load PostHog)"

---

### Navigation Structure

**FE-011: Expo Router Layout Files**
**Effort:** [M] 4 hours
**Week:** 1
**Depends on:** FE-001, FE-013 (auth guard)
**Blocks:** All screen tasks
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §6.1

**Acceptance:**
- Root `_layout.tsx`: wraps app with `QueryClientProvider`, `PostHogProvider`, Zustand hydration
- Auth stack `(auth)/_layout.tsx`: Stack navigator for login/register/guest
- Onboarding stack `(onboarding)/_layout.tsx`: Stack with `gestureEnabled: false` (no back swipe through consent)
- Tab layout `(tabs)/_layout.tsx`: Bottom tabs (see FE-012)
- Deep link handling: `revora://scan/:id` opens scan result screen

---

**FE-012: Bottom Tab Navigator**
**Effort:** [S] 3 hours
**Week:** 1
**Depends on:** FE-011
**Blocks:** All tab screens
**Owner:** Person B
**SPEC/PRD Reference:** PRD §8.2

**Acceptance:**
- 4 tabs: **Today**, **Scan** (FAB), **Progress**, **Learn**, **Profile**
- Scan FAB: centered, 56×56px, primary color (`#4CAF50`), camera icon, elevated shadow
- Active tab indicator matches brand palette
- Tab labels: "Today", "Progress", "Learn", "Profile" (Scan has no label — FAB only)
- Badge on Today tab when daily score is D (red badge)

**Implementation:**
```typescript
// app/(tabs)/_layout.tsx
<Tabs screenOptions={{ tabBarActiveTintColor: '#4CAF50' }}>
  <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ... }} />
  <Tabs.Screen
    name="scan"
    options={{
      title: '',
      tabBarButton: () => <ScanFAB />,  // Custom 56px FAB
    }}
  />
  <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: ... }} />
  <Tabs.Screen name="learn" options={{ title: 'Learn', tabBarIcon: ... }} />
  <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ... }} />
</Tabs>
```

---

**FE-013: Auth Guard**
**Effort:** [S] 3 hours
**Week:** 1
**Depends on:** FE-011, FE-026 (token check)
**Blocks:** All protected routes
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §6.1

**Acceptance:**
- No token → redirect to `/(onboarding)/welcome`
- Token exists + `isGuest=true` + `profileComplete=false` → redirect to `/(onboarding)/welcome`
- Token valid → allow through to tabs
- Deep link to protected route while unauthenticated → redirect to login, then resume deep link after auth
- Auth check happens in root `_layout.tsx` before rendering any tab content

---

**FE-014: Loading / Splash Screen**
**Effort:** [S] 2 hours
**Week:** 1
**Depends on:** FE-001
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §8, VAL-029

**Acceptance:**
- Splash screen shows brand colors (`#4CAF50` green on white)
- Revora wordmark centered
- **Zero health claims** on splash screen
- `expo-splash-screen` `preventAutoHideAsync()` used — hidden after Zustand hydration completes
- Cold start to interactive: target ≤2s (VAL-029)

---

### Onboarding Flow (6 Screens)

**FE-015: Screen 1 — Welcome / Emotional Acknowledgment**
**Effort:** [S] 3 hours
**Week:** 3
**Depends on:** FE-011, FE-006
**Blocks:** FE-016
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.1, Screen 1

**Acceptance:**
- Headline: `"Just diagnosed? We've got you."` (from `en.json`, NOT hard-coded)
- Subtext: `"Revora helps you understand exactly what to eat — one photo at a time."`
- CTA: `"Let's get started"` → navigates to FE-016
- Skip link → `"Skip"` → navigates to guest flow (FE-023)
- **Zero reversal or cure language** (CI lint enforces)
- Warm food imagery background (no clinical imagery)

---

**FE-016: Screen 2 — A1C Entry**
**Effort:** [M] 5 hours
**Week:** 3
**Depends on:** FE-015, FE-021 (Zustand persistence)
**Blocks:** FE-017
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.1, Screen 2

**Acceptance:**
- Title: `"What's your most recent A1C?"`
- Slider: range 4.0–14.0, step 0.1, default 5.8
- Manual number input also available (tap slider value to type)
- Skip path: `"I don't know yet"` → sets `a1cBaseline=null`, uses default range 5.7–6.0 for goal calculation
- Zod validation: value must be in [4.0, 14.0] or null
- Value persisted to Zustand `userStore.a1cBaseline` on "Next"

---

**FE-017: Screen 3 — Goal Setting**
**Effort:** [M] 5 hours
**Week:** 3
**Depends on:** FE-016
**Blocks:** FE-018
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.1, Screen 3, ISSUE-050

**Acceptance:**
- Goal auto-populated: `a1cBaseline - 0.3` (midpoint of valid range)
- User can adjust goal; **Zod validation** enforces: `goal >= baseline - 0.6` AND `goal <= baseline - 0.1` AND `goal >= 4.0`
- Motivational copy: `"Research shows consistent GL management can support healthy blood sugar levels over time. Individual results vary based on diet, activity, and other factors."` — compliant language only
- **ZERO instances** of "reverse", "reversal", "cure", "treat" (CI lint blocks)
- Validation error shown inline: `"Goal should be between X and Y"`
- "Next" disabled until valid goal set

---

**FE-018: Screen 4 — Dietary Profile**
**Effort:** [M] 4 hours
**Week:** 3
**Depends on:** FE-017
**Blocks:** FE-019
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.1, Screen 4

**Acceptance:**
- Multi-select chips: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Halal, Kosher, Nut-Free, None
- Selecting "None" deselects all others; selecting any other deselects "None"
- GL budget auto-display below chips:
  - Default: `80 GL/day`
  - Vegetarian or Vegan selected: `100 GL/day`
- Rationale tooltip on `(?)` next to vegetarian: `"Plant-based proteins carry more carbohydrates. Your budget is adjusted accordingly."`
- Selection persisted to Zustand `userStore.dietaryProfile` and `userStore.glBudget`

---

**FE-019: Screen 5 — GL Budget Education**
**Effort:** [M] 4 hours
**Week:** 3
**Depends on:** FE-018
**Blocks:** FE-020
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.1, Screen 5

**Acceptance:**
- Animated circular gauge showing user's daily GL budget (from FE-018)
- Three color zones explained: SAFE (green, GL ≤10), MODERATE (amber, GL 11–19), HIGH (red, GL ≥20)
- Simple educational copy: `"Each meal has a Glycemic Load. Your daily budget is X GL."`
- Animation: gauge fills to 100% then resets (illustrative — not real data)
- "Next" advances to Screen 6

---

**FE-020: Screen 6 — Age Gate + Health Data Consent**
**Effort:** [L] 8 hours
**Week:** 3
**Depends on:** FE-019, BE-029 (server-side validation)
**Blocks:** FE-022 (onboarding submit), BLK-007 (COPPA gate)
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.1, Screen 6, SPEC §4.1.2, VAL-014, VAL-015

**Acceptance:**
- Age gate text: `"By continuing, you confirm you are 13 years of age or older."`
- **Under-13 block:** If user indicates they are under 13 → account creation blocked, zero data collected, screen shows `"Revora is for users 13 and older."` and navigation stops (VAL-014)
- Health data consent checkbox (GDPR Art. 9): `"I consent to Revora processing my health data (A1C values, dietary information, meal logs) to provide personalized guidance."`
- Checkbox **unchecked by default** (active opt-in)
- Links to Privacy Policy (opens in-app browser) and Terms of Service
- "Get Started" button disabled until consent checkbox checked AND age confirmed
- `ageConfirmed=true` and `healthDataConsent=true` stored in Zustand before submit

**Notes:**
- Server at BE-029 also enforces `ageConfirmed=false` → 403 (defense-in-depth)
- EU users identified by timezone — GDPR consent text shown with explicit "health data" language

---

**FE-021: Onboarding State Management**
**Effort:** [S] 3 hours
**Week:** 3
**Depends on:** FE-003 (Zustand), FE-015
**Blocks:** FE-022
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §6.2

**Acceptance:**
- Onboarding progress persisted to AsyncStorage via Zustand `persist` middleware
- On app reopen mid-onboarding: user resumes from last completed screen (not restarted)
- `onboardingStep` integer (0–5) stored in `userStore`
- Completed flag `onboardingComplete: boolean` set after FE-022 succeeds
- Test: kill app on Screen 3 → reopen → lands on Screen 3

---

**FE-022: POST /api/v1/onboarding Integration**
**Effort:** [M] 5 hours
**Week:** 3
**Depends on:** FE-020, FE-021, BE-029
**Blocks:** DEP-001 resolution
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.1.2, DEP-001

**Acceptance:**
- On Screen 6 "Get Started" tap: POST all onboarding data to `/api/v1/onboarding`
- Loading state shown during request (spinner replaces button)
- Server validation errors displayed inline on relevant screen:
  - `AGE_REQUIREMENT_NOT_MET` → screen 6 error
  - `A1C_GOAL_INVALID` → navigate back to screen 3 with error
- On success: `onboardingComplete=true` in Zustand, navigate to `/(tabs)/index`
- `accessToken` + `refreshToken` stored via FE-026 (Keychain)

---

**FE-023: Skip / Guest Mode Flow**
**Effort:** [M] 5 hours
**Week:** 2
**Depends on:** FE-015, BE-024
**Blocks:** VAL-013
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.1, SPEC §4.1.1, VAL-013

**Acceptance:**
- "Skip" on Screen 1 → calls `POST /api/v1/auth/guest`
- Guest token stored in Keychain (FE-026)
- `isGuest=true` set in Zustand `userStore`
- Guest scan counter displayed: `"X of 3 free scans used"`
- After 3rd guest scan: upgrade nudge modal — `"Create a free account to keep your scan history and unlock more scans."`
- Guest → register: all scan data preserved (server handles via BE-025)

---

### Authentication Screens

**FE-024: Login Screen**
**Effort:** [M] 4 hours
**Week:** 2
**Depends on:** FE-011, FE-026, BE-023
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.1.1

**Acceptance:**
- Email + password fields with Zod validation (email format, password not empty)
- `POST /api/v1/auth/login` on submit
- Error: `INVALID_CREDENTIALS` → `"Email or password is incorrect."` (no field-specific hint — security)
- Success: tokens stored in Keychain, navigate to `/(tabs)/index` or deep link destination
- Google / Apple OAuth: **stub buttons** rendered but disabled, labeled `"Coming soon"` (V1.1)
- "Forgot password?" link — stub for V1.1

---

**FE-025: Registration Screen**
**Effort:** [M] 4 hours
**Week:** 2
**Depends on:** FE-011, FE-026, BE-022
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.1.1

**Acceptance:**
- Email, password, confirm password fields
- Zod: email format, password ≥8 chars, 1 uppercase, 1 number, passwords match
- `POST /api/v1/auth/register` on submit
- Error: `EMAIL_EXISTS` → `"An account with this email already exists."`
- Privacy Policy and Terms of Service links (in-app browser)
- Success: tokens stored, navigate to `/(onboarding)/welcome`

---

**FE-026: Secure Token Storage**
**Effort:** [M] 5 hours
**Week:** 1
**Depends on:** FE-001
**Blocks:** FE-005 (API client), FE-013 (auth guard), FE-027 (refresh)
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §SEC-003

**Acceptance:**
- `expo-secure-store` used for **all token storage** (iOS Keychain, Android EncryptedSharedPreferences)
- `accessToken` stored at key `"accessToken"`
- `refreshToken` stored at key `"refreshToken"`
- **ZERO tokens ever stored in AsyncStorage** — this is tested in CI (jest test verifies no `AsyncStorage.setItem` calls with token keys)
- `clearTokens()` utility deletes both keys on logout

**Implementation:**
```typescript
// lib/tokenStorage.ts
import * as SecureStore from 'expo-secure-store';

export const tokenStorage = {
  async saveTokens(access: string, refresh: string) {
    await SecureStore.setItemAsync('accessToken', access);
    await SecureStore.setItemAsync('refreshToken', refresh);
  },
  async getAccessToken() {
    return SecureStore.getItemAsync('accessToken');
  },
  async getRefreshToken() {
    return SecureStore.getItemAsync('refreshToken');
  },
  async clearTokens() {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  },
};
```

---

**FE-027: Refresh Token Rotation Auto-Flow**
**Effort:** [M] 5 hours
**Week:** 2
**Depends on:** FE-026, BE-026
**Blocks:** FE-005 (completes interceptor)
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §SEC-003, VAL-028

**Acceptance:**
- On 401 response: automatically call `POST /api/v1/auth/refresh` with stored refresh token
- New `accessToken` + `refreshToken` stored (rotation)
- Original request retried with new access token
- On refresh failure (token invalid/expired/already-used): `clearTokens()` + redirect to login
- **Replay attack detection:** if server returns 401 on refresh → all tokens cleared (theft scenario)
- Test: simulate 401 → verify refresh called → verify original request retried successfully

---

## PHASE 1: CORE FEATURES (Weeks 3–8)

### Camera & Scan

**FE-028: Camera Screen**
**Effort:** [L] 10 hours
**Week:** 3
**Depends on:** BE-028 (Expo spike — BLK-012 must be resolved first), FE-011
**Blocks:** FE-029, FE-030, FE-031, FE-032
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.2, SPEC §6.4

**Acceptance:**
- Expo Camera component renders full-screen viewfinder
- Plate calibration overlay (FE-029) rendered as `<View style={{position: 'absolute'}}>` over camera
- Scan mode toggle (FE-030) visible at top
- Capture button: circular white button, 72px, bottom center
- Camera permissions requested via `expo-camera` — if denied: show `"Camera access is required to scan meals"` with Settings deep link
- **Gate: only starts if BE-028 Expo spike confirmed MANAGED workflow** (BLK-012)

**Notes:**
- Uses `expo-camera` v14 (bundled with SDK 52)
- `CameraView` component (new API replacing `Camera`)
- Save photo to temp file with `takePictureAsync({ quality: 0.9, skipProcessing: false })`

---

**FE-029: Plate Calibration Overlay**
**Effort:** [S] 3 hours
**Week:** 3
**Depends on:** FE-028
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §11.2, PRD §6.2

**Acceptance:**
- Semi-transparent white circle: 70% of screen width, centered in camera view
- Stroke: 2px white, dashed, 50% opacity
- Label below circle: `"Align plate within circle for best results"`
- **Auto-hides after 10 successful scans** (count stored in AsyncStorage)
- Toggle in Settings screen: `"Show plate guide"` (re-enables if hidden)
- Does NOT affect captured image (overlay is UI-only, not composited into photo)

---

**FE-030: Scan Mode Toggle UI**
**Effort:** [S] 2 hours
**Week:** 3
**Depends on:** FE-028
**Blocks:** FE-032 (scan API call, `scanMode` param)
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.2

**Acceptance:**
- Segmented control at top of camera screen: `"Already ate"` | `"Planning to eat"`
- Default: `"Already ate"`
- Mode stored in `scanStore.scanMode`
- Planning mode: same scan pipeline, but result shows `"Done"` (not `"Log This Meal"`) — suppresses GL logging
- Visual distinction: planning mode shows a clock icon on badge

---

**FE-031: Client-Side Image Compression**
**Effort:** [S] 3 hours
**Week:** 3
**Depends on:** FE-028
**Blocks:** FE-032
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.2

**Acceptance:**
- `expo-image-manipulator` resizes captured photo to 1024×1024px before upload
- JPEG quality: 85 (balances size vs. AI recognition accuracy)
- Resize done **before** upload (not on server) to reduce upload bandwidth
- Result size: ≤500KB for typical meal photo
- Test: capture image, verify upload payload is ≤500KB

**Implementation:**
```typescript
import * as ImageManipulator from 'expo-image-manipulator';

export async function compressForUpload(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024, height: 1024 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}
```

---

**FE-032: Scan API Call + Loading States**
**Effort:** [L] 10 hours
**Week:** 4
**Depends on:** FE-031, FE-004 (TanStack Query), BE-046
**Blocks:** FE-033 (scan results)
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.1.3, PRD §6.2

**Acceptance:**
- `useMutation` from TanStack Query, `mutationFn` posts `multipart/form-data` with `image` field
- Loading states shown at specific time intervals (SPEC §4.1.3 timing UX):
  - t=0s: `"Analyzing your meal..."`
  - t=2s: `"Identifying ingredients..."`
  - t=5s: `"Calculating glycemic load..."`
  - t=8s: `"Preparing your results..."`
  - t=12s: `"Almost there..."`
- On success: `scanStore.currentScan` updated, navigate to `scan/[id]`
- On timeout (>15s): show retry screen (FE-034)
- `X-Scans-Remaining` header parsed and stored in `userStore`

**Implementation:**
```typescript
// hooks/useScan.ts
export const useScan = () =>
  useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 20_000,  // Scan endpoint gets extra time
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'today'] });
    },
  });
```

---

**FE-033: Scan Results Sheet**
**Effort:** [XL] 20 hours
**Week:** 5–6
**Depends on:** FE-032, BE-046, BE-042 (premium filtering), BE-047 (corrections)
**Blocks:** DEP-002 resolution, BLK-001 (accuracy gate visible to user)
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.2, SPEC §4.1.3, VAL-016 through VAL-026

> ⚠️ **SPIKE — broken into sub-tasks below:**

**FE-033a: GL Score Banner**
**Effort:** [M] 6 hours
**Week:** 5

**Acceptance:**
- Large GL number (HIGH confidence) OR GL range e.g. `"22–30"` (MEDIUM/LOW confidence)
- Spike risk badge: SAFE (green `#4CAF50`), MODERATE (amber `#FF9800`), HIGH (red `#F44336`)
- Confidence indicator: `HIGH` = solid badge, `MEDIUM` = `~` prefix on number, `LOW` = range with disclaimer
- Remaining daily GL budget: `"38 GL remaining today"`
- `fromCache: true` → show `"⚡ Instant result"` badge in top-right corner

---

**FE-033b: Progressive Disclosure (Default Collapsed)**
**Effort:** [M] 5 hours
**Week:** 5

**Acceptance:**
- Default state (feature flag `scan-results-collapsed=true`): shows only GL Score Banner + `"Log This Meal"` button
- `"See full guidance ▼"` expand control: reveals food breakdown + advice cards
- Collapse animation: `react-native-reanimated` smooth expand/collapse
- If `scan-results-collapsed=false` (feature flag off): sheet opens fully expanded
- Test: verify default is collapsed, expand works, re-collapse works

---

**FE-033c: Food Breakdown Cards**
**Effort:** [M] 6 hours
**Week:** 5

**Acceptance:**
- Per-food card: name, portion estimate (grams), GL, spike risk badge
- Editable portion slider: three anchor points — half fist (80g), tennis ball (150g), two fists (250g)
- Slider changes portion → GL recalculated in real-time ≤500ms (VAL-025)
- Recalculation is client-side: `gl = (gi * net_carbs * new_portion_ratio) / 100` using AI-provided GI
- Portion change does NOT re-call OpenAI (client math only)

---

**FE-033d: Advice Cards (Premium Gated)**
**Effort:** [M] 6 hours
**Week:** 6

**Acceptance:**
- Three advice cards: Sequencing, Swap, Post-Meal Action
- **Free users**: cards rendered but **blurred** (`blur intensity: 10`) with lock icon overlay
- Blur overlay tap: `"Unlock with Premium"` → triggers paywall (FE-061 T2)
- **Premium users**: full cards visible, unblurred
- Sequencing card: numbered steps, scientific citation (`"Shukla et al. 2019"`) on every card
- Swap card: format `"Replace [Current] GL X → [Swap] GL Y — GL Saved Z. Taste tip: ..."` — all swaps respect dietary restrictions (VAL-008)
- Post-meal action card: walk recommendation for MODERATE/HIGH only
- `sequencingAdvice`, `swapSuggestions`, `postMealAction` all come from server — `null` for free users (never trust client-only)

---

**FE-033e: Disclaimer + Action Bar**
**Effort:** [S] 3 hours
**Week:** 6

**Acceptance:**
- Inline disclaimer: `"Estimate based on visual analysis — not medical advice."` in 12sp gray, on **every** scan result, **always visible** (not collapsible) — VAL-017
- Action bar: `"Log This Meal"` (already_ate mode) OR `"Done"` (planning mode)
- `"Report Inaccurate Result"` button: always visible, every result — VAL-026
- `"Report Inaccurate Result"` tap: opens correction modal (calls BE-047)

---

**FE-034: Scan Error Handling**
**Effort:** [M] 4 hours
**Week:** 6
**Depends on:** FE-032
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.2 error codes

**Acceptance:**
- **Network offline:** `"No internet connection. Please try again when online."` + retry button
- **Content policy violation** (OpenAI rejects image): `"Unable to analyze this image. Please try a different photo."`
- **Timeout** (>15s): `"Analysis is taking longer than usual. Please try again."` + retry
- **Invalid image** (422): `"Please upload a JPEG or PNG photo of a meal."`
- **Rate limit** (429): display scans remaining badge (FE-035), trigger paywall if 0 remaining
- All error states have a single CTA — no dead ends

---

**FE-035: Free Tier Scan Limit UX**
**Effort:** [M] 5 hours
**Week:** 9
**Depends on:** FE-032, BE-044, FE-010 (PostHog `free-scan-limit` flag)
**Blocks:** FE-061 (paywall T1)
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.4.2, VAL-012, ISSUE-030, DEP-006

**Acceptance:**
- `X-Scans-Remaining` header read from every scan response
- Display remaining count on camera screen: `"3 of 5 free scans used today"`
- At 1 remaining: amber warning `"1 free scan remaining today"`
- At 0 remaining (429 response): paywall triggered (FE-061 T1) — `"You've used all your free scans today. Upgrade for unlimited scans."`
- Limit from PostHog flag `free-scan-limit` (default 5) — NOT hardcoded
- Resets visually at midnight in user's timezone

---

### Today Dashboard

**FE-036: Daily GL Gauge**
**Effort:** [M] 6 hours
**Week:** 6
**Depends on:** FE-041 (API integration), FE-004 (TanStack Query)
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.3

**Acceptance:**
- Circular progress gauge, animated fill on meal log
- Three color zones: green 0–75%, amber 75–100%, red >100% of `glBudget`
- Center text: `"32 GL"` consumed + `"48 GL left"` remaining
- Budget reference: uses `users.glBudget` (from userStore) — **not hardcoded 80** (ISSUE-012)
- Animation: smooth arc sweep using `react-native-reanimated` when GL value changes

---

**FE-037: Meal Timeline**
**Effort:** [M] 5 hours
**Week:** 6
**Depends on:** FE-041
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.3

**Acceptance:**
- Chronological list of today's meals (already_ate mode only)
- Each card: thumbnail image (from `scan.thumbnailUrl`), time (e.g., `"12:34 PM"`), total GL, spike risk badge
- GL bar: horizontal bar proportional to total GL (max bar = `glBudget`)
- Tap meal card → navigate to `meal/[id]` (meal detail screen)
- Empty state: `"No meals logged yet today"` with camera icon CTA

---

**FE-038: Daily Score Grade Badge**
**Effort:** [S] 3 hours
**Week:** 6
**Depends on:** FE-036
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.3, ISSUE-012

**Acceptance:**
- Grade badge: A (green), B (teal), C (amber), D (red)
- Based on `dailyScorePercentage` from API: A <75%, B 75–100%, C 100–125%, D >125%
- Percentage is relative to user's `glBudget` — fair across dietary profiles (ISSUE-012)
- Tooltip on tap: `"Your GL today is X% of your daily budget."` with brief explanation
- Grade A: green checkmark celebration animation (first time only)

---

**FE-039: Streak Counter + Milestone Animations**
**Effort:** [M] 6 hours
**Week:** 7
**Depends on:** FE-041, BE-050
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.3, VAL-006, DEP-013

**Acceptance:**
- Streak count displayed: `"🔥 7-day streak"`
- Streak uses `users.glBudget` threshold — **not hardcoded 80** (ISSUE-013)
- Celebration modal triggered at: 7, 14, 30, 60, 90-day milestones
- Celebration copy example: `"7-day streak! You've been managing your GL for a full week."` — progress language only, zero reversal
- Modal dismisses on tap, `"Share"` button (stub for V1.1 shareable cards)
- Milestone already shown? → skip animation (prevents repeat on app reopen)

---

**FE-040: 30-Second Dashboard Polling**
**Effort:** [S] 2 hours
**Week:** 6
**Depends on:** FE-004 (TanStack Query refetchInterval)
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §6.3, ISSUE-042

**Acceptance:**
- `refetchInterval: 30_000` on `useDashboard` query (already in FE-004 implementation)
- Polling pauses when app is backgrounded (`AppState` listener)
- Polling resumes when app returns to foreground
- No visible loading spinner during background refresh (stale data shown until fresh arrives)

---

**FE-041: GET /api/v1/dashboard/today Integration**
**Effort:** [S] 2 hours
**Week:** 6
**Depends on:** FE-004, BE-048
**Blocks:** FE-036, FE-037, FE-038, FE-039
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.1.4, DEP-006

**Acceptance:**
- `useDashboard` hook returns full dashboard response (see BE-048 response shape)
- Response fields mapped to Zustand `dashboardStore`: `glConsumed`, `glBudget`, `meals`, `streak`, `dailyScore`
- TypeScript type for response matches backend camelCase schema exactly
- Test: mock API returns known data → verify all UI components render correct values

---

**FE-042: Offline-First Dashboard**
**Effort:** [M] 4 hours
**Week:** 7
**Depends on:** FE-004 (AsyncStorage persister), FE-041
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** REC-020

**Acceptance:**
- Cached dashboard data shown immediately on load (stale-while-revalidate)
- When offline: `"Last updated X min ago"` badge shown at top of dashboard
- Badge color: gray (offline) vs. transparent (online fresh data)
- `@tanstack/query-async-storage-persister` configured in root `_layout.tsx`
- Test: disable network → open app → verify cached data renders → badge appears

---

### Walk System

**FE-043: Post-Meal Walk Notification Handler**
**Effort:** [S] 3 hours
**Week:** 8
**Depends on:** BE-059 (push notification scheduler)
**Blocks:** FE-044
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.8, VAL-021

**Acceptance:**
- `expo-notifications` notification listener configured in `_layout.tsx`
- Walk notification tapped → app navigates to walk timer screen (FE-044) with `scanId` from notification payload
- Notification only received for MODERATE/HIGH meals (server handles logic — FE-043 only handles tap)
- Deep link from notification: `revora://walk?scanId=UUID`

---

**FE-044: Walk Timer Screen**
**Effort:** [M] 6 hours
**Week:** 8
**Depends on:** FE-043, BE-057, BE-058
**Blocks:** VAL-022
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.8, SPEC §4.1.7, VAL-021, VAL-022

**Acceptance:**
- MM:SS timer display, large font, centered
- Start/Stop button: green "Start Walk" → red "Stop Walk" on tap
- Walk linked to meal: `scanId` from notification or deep link
- On Start: `POST /api/v1/walk/start` with `{ scanId, startedAt }`
- On Stop: `POST /api/v1/walk/complete` with `{ walkId, completedAt, durationMinutes }`
- Completion celebration: confetti animation + `"Great job! Walking after meals helps manage glucose levels."`
- Duration accuracy: ≤5 seconds drift over 15 minutes (VAL-022)
- Background timer: uses `expo-task-manager` to keep timer running if app backgrounded

---

### A1C Progress Tracker

**FE-045: A1C Progress Screen**
**Effort:** [L] 10 hours
**Week:** 7
**Depends on:** FE-046, BE-054
**Blocks:** BLK-013
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.4, SPEC §4.1.5

**Acceptance:**
- Victory Native XL line chart with three series:
  1. **Baseline** — horizontal dashed line at `a1cBaseline` value
  2. **Estimated A1C** — solid blue line (daily points over 14-day window)
  3. **Goal** — horizontal green dashed line at `a1cGoal`
- Lab-tested values: distinct markers (filled circle, different color) vs. estimated (hollow circle)
- X-axis: dates; Y-axis: A1C values (4.0–14.0 range)
- Chart scrollable horizontally for history >30 days

---

**FE-046: Estimated A1C Display with Bounds**
**Effort:** [M] 6 hours
**Week:** 7
**Depends on:** BE-054, FE-045
**Blocks:** BLK-013 (VAL-007, VAL-016)
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.2.5, VAL-007, VAL-016, VAL-018

**Acceptance:**
- **NEVER display a single A1C number** — ALWAYS show as range: `"5.8 – 6.2"` (VAL-016)
- Error bound: ±0.2 (from API `errorBound` field)
- Disclaimer text (12sp gray, always adjacent, never collapsible): `"Estimate only — verify with laboratory A1C test. This is not a medical measurement."` (VAL-016)
- Divergence warning: if `divergenceWarning=true` from API → show amber banner: `"Your lab results differ significantly from our estimate. Please consult your doctor."` (VAL-018)
- <14 days data: show `"Days on Track"` progress bar instead of estimate (FE-048)
- Test: render with `estimatedA1c=6.0, errorBound=0.2` → verify display shows `"5.8 – 6.2"`, NOT `"6.0"`

---

**FE-047: Manual A1C Log Entry Form**
**Effort:** [M] 5 hours
**Week:** 7
**Depends on:** BE-052
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.1.5

**Acceptance:**
- Date picker: default today, max today (no future dates)
- Value input: numeric, range [4.0, 14.0], step 0.1, Zod validation
- Source selector: `"Lab test"` (default) or `"Estimate"`
- Confirmation screen before submit: shows value + date + disclaimer
- Disclaimer on confirmation: `"This will be recorded as a lab value and used in your A1C tracker."`
- On success: chart updates, previous value shown with change delta (e.g., `"▼ 0.2 from last lab"`—neutral language only)

---

**FE-048: Days on Track Progress Bar**
**Effort:** [S] 3 hours
**Week:** 7
**Depends on:** FE-041 (streak data)
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.4

**Acceptance:**
- Shown when user has <14 days of scan data (replaces estimated A1C)
- Horizontal progress bar: `"X of 14 days tracked"`
- Copy: `"Keep logging meals to unlock your A1C estimate."`
- Disappears and replaced by FE-046 once 14-day threshold reached

---

**FE-049: A1C Milestone Modals**
**Effort:** [S] 3 hours
**Week:** 7
**Depends on:** FE-047 (A1C log triggers milestone check via BE-070)
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.4, ISSUE-051

**Acceptance:**
- Triggered when new A1C lab value shows improvement vs. previous lab value
- Copy: `"Your A1C went from X to Y. Discuss this with your healthcare provider."` — compliant progress language only
- **Zero reversal claims** (e.g., "reversed diabetes" is PROHIBITED — CI lint blocks)
- Dismiss on tap, "Log Another Reading" CTA
- Modal only shows once per A1C log improvement (not on same-value re-entry)

---

**FE-050: Weekly Report Summary Card**
**Effort:** [M] 4 hours
**Week:** 11
**Depends on:** BE-055 (weekly insights API)
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.4, SPEC §4.1.6

**Acceptance:**
- Free users: summary card shows `totalScans`, `averageDailyGl`, `daysUnderBudget`, `topSpikeFood`
- Premium users: full insights array with pattern cards (FE-053)
- "View Full Insights" CTA for free users → paywall trigger T3 (FE-061)
- Card refreshes on Monday (start of new week)

---

### Meal History

**FE-051: Meal History List**
**Effort:** [M] 6 hours
**Week:** 8
**Depends on:** BE-055
**Blocks:** FE-052
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.7

**Acceptance:**
- Paginated list (20 meals per page), infinite scroll
- Each row: thumbnail, meal time, total GL, spike risk badge
- Search bar: filter by food name (client-side filtering on loaded data)
- Filter chips: `"All"`, `"HIGH"`, `"MODERATE"`, `"SAFE"`, date range picker
- Tap row: navigate to `meal/[id]` (meal detail)
- Empty state: `"No meals logged yet"` with camera CTA

---

**FE-052: Free Tier 7-Day History Wall**
**Effort:** [M] 5 hours
**Week:** 9
**Depends on:** FE-051, BE-055 (server returns 7-day limit for free), FE-062
**Blocks:** VAL-023
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.7, VAL-023, ISSUE-030

**Acceptance:**
- Free users: meals beyond 7 days rendered as **blurred cards** with upgrade overlay
- Blur: `react-native-blur` or semi-transparent overlay (80% opacity) with lock icon
- Overlay CTA: `"Unlock full history with Premium"`
- **Server enforces** 7-day limit — free users only receive 7 days of data from API (client gate is UX only, not security)
- Premium users: full history with no wall
- Tap blurred card → paywall T3 (FE-061)

---

**FE-053: Pattern Insight Cards**
**Effort:** [M] 4 hours
**Week:** 11
**Depends on:** BE-056 (pattern detection queries), FE-052
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.7

**Acceptance:**
- Shown after ≥14 days of data
- Example cards: `"Your breakfasts cause 60% of your GL spend"`, `"White rice appears in 8 of your HIGH-spike meals"`
- Premium users only — free users see teaser with blur
- Cards displayed above meal list as horizontal scroll
- Tap card → filters meal list by relevant criteria

---

### Educational Content

**FE-054: Learn Tab — Article Grid**
**Effort:** [M] 5 hours
**Week:** 12
**Depends on:** FE-056 (API integration), BE-060
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.9, SPEC §4.1.8

**Acceptance:**
- Article grid: 2 columns, thumbnail + title + read time + category badge
- Category filter chips: `"All"`, `"Fundamentals"`, `"Food Sequencing"`, `"GL Science"`, `"Meal Planning"`, `"Lifestyle"`
- Free articles: full access; premium articles: lock icon overlay, tap → paywall T2
- `isPremium=false` articles (5 total): fully accessible to all users
- Loading skeleton shown while fetching

---

**FE-055: Article Reader Screen**
**Effort:** [M] 5 hours
**Week:** 12
**Depends on:** FE-054
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §6.9, REC-020

**Acceptance:**
- Markdown renderer (`react-native-markdown-display`) for article content
- Article cached offline via TanStack Query persister (available without network after first load)
- Citations rendered as tappable links (open external browser)
- Read time shown in header: `"5 min read"`
- Share button: deep link to article (V1.1 feature — stub for now)

---

**FE-056: GET /api/v1/learn/articles Integration**
**Effort:** [S] 2 hours
**Week:** 12
**Depends on:** FE-004, BE-060
**Blocks:** FE-054
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.1.8

**Acceptance:**
- `useArticles(category?)` hook with pagination support
- `staleTime: 1000 * 60 * 60` (1 hour — articles are static)
- Free tier: API returns only `isPremium=false` articles (server-enforced)
- Premium tier: full 20-article library

---

### GDPR UI

**FE-057: Data Export Button**
**Effort:** [M] 5 hours
**Week:** 9
**Depends on:** BE-062
**Blocks:** BLK-008 (partial), VAL-010
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.1.9, PRD §6, DEP-005

**Acceptance:**
- Located in Profile → `"Download My Data"` button
- On tap: `GET /api/v1/user/export` triggered
- Polling indicator: `"Preparing your data..."` with progress spinner
- On completion: `"Your data is ready. Tap to download."` link
- Download opens in-app browser for JSON file download
- Export includes all user data (profile, scans, A1C logs, activities) — A1C values decrypted (server handles)
- Response time target: <10s for ≤1000 meals (VAL-010)

---

**FE-058: Account Deletion Flow**
**Effort:** [M] 6 hours
**Week:** 10
**Depends on:** BE-063
**Blocks:** BLK-008, VAL-011
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.1.9, DEP-005

**Acceptance:**
- Located in Profile → Settings → `"Delete Account"`
- Step 1: Warning screen — `"This will permanently delete your account and all data after 30 days."`
- Step 2: Email confirmation input — `"Enter your email to confirm"` (matches account email)
- Step 3: Final confirmation — `"Schedule Account Deletion"` red button
- Success screen: `"Your account is scheduled for deletion. You have 30 days to change your mind by logging back in."`
- Cancel link: `"Changed your mind? Email us at support@revora.app"`
- On success: tokens cleared, navigate to welcome screen

---

**FE-090: CCPA "Do Not Sell" Toggle**
**Effort:** [S] 3 hours
**Week:** 10
**Depends on:** FE-058 (Settings screen), SC-032 (CCPA compliance)
**Blocks:** None
**Owner:** Person B

**Acceptance:**
- Toggle in Profile → Settings → Privacy: "Do Not Sell My Personal Information"
- Default: OFF (data sharing allowed)
- When ON: PostHog analytics disabled, no data shared with third parties
- Persist preference to AsyncStorage + sync to backend user preferences
- Per PRD §10.3 CCPA requirement

---

## PHASE 2: VALUE-ADD (Weeks 9–12)

### RevenueCat Integration

**FE-059: RevenueCat SDK Initialization**
**Effort:** [M] 4 hours
**Week:** 9
**Depends on:** FE-003 (Zustand userStore)
**Blocks:** FE-060, FE-062, FE-063, FE-064
**Owner:** Person B
**SPEC/PRD Reference:** PRD §9, SPEC §4.1.11

**Acceptance:**
- `react-native-purchases` installed and configured with RevenueCat API key
- `Purchases.configure({ apiKey: RC_API_KEY })` called on app start
- User ID synced on login: `Purchases.logIn(userId)` after auth
- Guest users: `Purchases.logIn(guestUserId)` (preserves purchase history on conversion)
- `Purchases.logOut()` on account logout

**Implementation:**
```typescript
// lib/revenueCat.ts
import Purchases from 'react-native-purchases';

export const initRevenueCat = async (userId: string) => {
  Purchases.configure({
    apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY!,
  });
  await Purchases.logIn(userId);
};
```

---

**FE-060: Paywall Modal**
**Effort:** [L] 10 hours
**Week:** 12
**Depends on:** FE-059, BE-073
**Blocks:** FE-061, FE-062, DEP-004
**Owner:** Person B
**SPEC/PRD Reference:** PRD §9.3, MO-012

**Acceptance:**
- Three pricing cards:
  1. Monthly: `$12.99/month` (from PostHog flag `paywall-monthly-price`)
  2. Annual: `$99.99/year` (from PostHog flag `paywall-annual-price`) — highlighted `"Most Popular"` badge
  3. Lifetime: `$249.99`
- 7-day free trial badge on annual plan: `"Try free for 7 days"`
- Social proof (FTC-compliant): from PostHog flag `onboarding-social-proof` — e.g. `"Join thousands of people tracking their blood sugar wellness with Revora. Individual results vary."`
- **ZERO** reversal, cure, treat, or disease claims
- Feature list: `"Unlimited scans"`, `"Food sequencing tips"`, `"Safer swap engine"`, `"Full A1C tracker"`, `"Unlimited meal history"`, `"Weekly reports"`
- `"Restore Purchases"` link — prominent placement (App Store requirement)
- `"Privacy Policy"` and `"Terms"` links visible

---

**FE-061: Paywall Trigger Logic**
**Effort:** [M] 5 hours
**Week:** 12
**Depends on:** FE-060, FE-010 (PostHog flags)
**Blocks:** BLK-011
**Owner:** Person B
**SPEC/PRD Reference:** PRD §9.5, §11.7, MO-013 through MO-016

**Acceptance:**
Four trigger points (all show same paywall modal):

- **T1 — Scan limit hit:** 429 response + `scansRemaining=0` → show paywall with context copy `"You've used all your free scans today. Upgrade for unlimited scans."` (MO-013)
- **T2 — Locked advice card tap:** blur overlay tap → paywall with `"Unlock food sequencing tips, safer swaps, and more."` (MO-014)
- **T3 — History 7-day wall:** scroll past 7-day blur → paywall with `"Full meal history is a Premium feature."` (MO-015)
- **T4 — Day 7 active user:** PostHog cohort check → on Day 7 first app open → paywall with `"You've been tracking for 7 days. See what Premium unlocks."` (MO-016)

All triggers tracked as PostHog events: `paywall_viewed` with `trigger_context` property.

---

**FE-062: Feature Gating UI**
**Effort:** [M] 4 hours
**Week:** 12
**Depends on:** FE-059, FE-061
**Blocks:** VAL-023
**Owner:** Person B
**SPEC/PRD Reference:** PRD §9, VAL-023

**Acceptance:**
- Gated features: advice cards, full meal history (>7 days), weekly insights, premium articles
- Free users: gated elements rendered with blur (`react-native-blur` or 80% opacity overlay) + lock icon
- Tap any blurred element → paywall modal (FE-060) with appropriate context (FE-061)
- Premium users: all elements unblurred, no lock icons
- **Server-side enforcement**: client blur is UX only — server NEVER returns premium data to free users (VAL-023)
- Subscription tier stored in Zustand `userStore.subscriptionTier` (`'free'` | `'premium'` | `'lifetime'`)

---

**FE-063: Purchase Flow + Webhooks**
**Effort:** [L] 8 hours
**Week:** 12
**Depends on:** FE-060, BE-072, BE-073, BE-075
**Blocks:** BLK-011
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.1.11, PRD §9.6, DO-012

**Acceptance:**
- On plan selection: `Purchases.purchasePackage(package)` called
- Loading state: modal shows spinner with `"Completing purchase..."`
- Success: RevenueCat webhook fires (BE-073) → backend updates `subscriptionTier` → local `userStore` synced via `GET /api/v1/subscription/status`
- On purchase success: celebratory modal `"Welcome to Premium!"` with confetti animation, then close paywall
- On error: display user-friendly message — `"Purchase failed. Please try again."` (log raw error to Sentry, don't show to user)
- Restore purchases: `Purchases.restorePurchases()` → same webhook sync flow
- Grace period: if webhook delayed >5s, optimistically update local state, revalidate in 30s

---

**FE-064: Subscription Status Sync**
**Effort:** [M] 4 hours
**Week:** 12
**Depends on:** FE-063, BE-074
**Blocks:** FE-062 (feature gating depends on accurate tier)
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §4.1.11, MO-011

**Acceptance:**
- On app foreground: check `Purchases.getCustomerInfo()` for latest entitlement
- If entitlement changed: call `GET /api/v1/subscription/status` to sync backend state
- Store result in Zustand `userStore.subscriptionTier`
- Handles all lifecycle events: trial start, trial expiry, subscription active, subscription expired, cancellation
- Test: purchase on Device A → open app on Device B → verify premium features unlock within 30s

---

**FE-065: Subscription Management Screen**
**Effort:** [M] 5 hours
**Week:** 12
**Depends on:** FE-064
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §9.7

**Acceptance:**
- Located in Profile → `"Manage Subscription"`
- Premium users: display current plan, renewal date, `"Manage in App Store"` button (deep link to App Store subscriptions)
- Free users: CTA `"Upgrade to Premium"` → paywall
- Lifetime users: display `"Lifetime Premium"` badge
- Cancel instructions: `"To cancel, tap Manage in App Store"`
- Email support link: `support@revora.app`

---

## PHASE 3: BETA + POLISH (Weeks 13–14)

### Testing Infrastructure

**FE-066: TestFlight Build Pipeline**
**Effort:** [M] 4 hours
**Week:** 13
**Depends on:** FE-008 (EAS Build), DO-015
**Blocks:** FE-070 (alpha validation)
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §7.1, DO-015

**Acceptance:**
- `eas build --profile preview --platform ios` builds and auto-submits to TestFlight via `eas submit`
- Build number auto-increments on each build
- TestFlight tester group "Alpha" (10 internal testers) configured
- Build notes auto-populated from git commit log
- External testers added after alpha validation passes (Week 14)

---

**FE-067: Google Play Internal Testing Track**
**Effort:** [M] 4 hours
**Week:** 13
**Depends on:** FE-008, DO-016
**Blocks:** FE-070
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §7.1, DO-016

**Acceptance:**
- `eas build --profile preview --platform android` builds AAB
- `eas submit --platform android` uploads to Internal Testing track
- Version code auto-increments
- Internal testing list: 10 Google accounts added
- Release notes auto-populated

---

**FE-068: Sentry Crash Monitoring + Session Replay Disabled**
**Effort:** [S] 2 hours
**Week:** 13
**Depends on:** FE-009
**Blocks:** VAL-027
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §INF-007, DO-012

**Acceptance:**
- Crash-free rate tracked in Sentry dashboard
- **Session replay: DISABLED** (health data privacy — confirmed in FE-009)
- Breadcrumbs: navigation events, API calls, user actions logged
- User context attached: `userId`, `subscriptionTier` (NO health data — A1C, GL, meal details excluded)
- Test: force crash → verify appears in Sentry with breadcrumbs

---

**FE-069: PostHog Event Tracking**
**Effort:** [M] 5 hours
**Week:** 13
**Depends on:** FE-010
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** REC-011

**Acceptance:**
- Key events tracked:
  - `onboarding_started`, `onboarding_completed`, `onboarding_abandoned` (with `step` property)
  - `scan_initiated`, `scan_completed`, `scan_failed`, `scan_from_cache`
  - `meal_logged`, `meal_viewed`
  - `paywall_viewed` (with `trigger_context`), `purchase_initiated`, `purchase_completed`, `purchase_failed`
  - `a1c_logged`, `walk_started`, `walk_completed`
- All events include: `userId`, `isGuest`, `subscriptionTier`
- **NO health data tracked** (A1C values, GL values, meal details excluded — REC-011, ISSUE-060)
- Test: perform action → verify event in PostHog dashboard with correct properties

---

**FE-070: Alpha Validation Checklist**
**Effort:** [M] 6 hours
**Week:** 13
**Depends on:** FE-066, FE-067, FE-068
**Blocks:** BLK-005 (App Store pre-submission), BLK-011 (RevenueCat testing)
**Owner:** Person B + Founder
**SPEC/PRD Reference:** SPEC §10, VAL-013 through VAL-030

**Acceptance:**
Manual testing on 10 TestFlight devices (5 iOS, 5 Android):

- [ ] **VAL-013:** Guest mode → 3 scans → upgrade nudge → conversion preserves data
- [ ] **VAL-002:** Onboarding → all 6 screens → data persists → POST /onboarding succeeds
- [ ] **VAL-003:** Scan → result visible ≤5s (95th percentile on WiFi)
- [ ] **VAL-016:** A1C NEVER shown as single number — always range with ±0.2 + disclaimer
- [ ] **VAL-017:** Disclaimer present on EVERY scan result, never hidden
- [ ] **VAL-021:** Walk notification received 30 min after MODERATE/HIGH meal
- [ ] **VAL-023:** Free tier: 7-day history wall enforced, server returns 7 days max
- [ ] **VAL-027:** Crash-free rate ≥99.5% (check Sentry)
- [ ] **VAL-029:** Cold start <2s on iPhone 12 / Pixel 5
- [ ] **BLK-006:** Zero reversal language — grep confirms
- [ ] **BLK-011:** RevenueCat purchase → webhook fires → tier updated in backend + frontend

**Crash Severity Definitions:**
- **P0 (launch blocker):** App won't launch, auth broken, scan crashes every time, payment broken
- **P1 (must fix before beta):** Paywall doesn't show, A1C disclaimer missing, data loss on logout
- **P2 (fix if time):** UI alignment issues, slow animations, minor text errors

---

**FE-071: Beta User Onboarding Email Sequence (Copy Only)**
**Effort:** [S] 2 hours
**Week:** 13
**Depends on:** None
**Blocks:** None
**Owner:** Founder
**SPEC/PRD Reference:** PRD §11.2

**Acceptance:**
- Email 1 (Day 0): Welcome, TestFlight link, what to expect
- Email 2 (Day 3): "How's it going?" check-in, feedback form link
- Email 3 (Day 7): Week 1 summary, new features unlocked
- All emails: plain text, from Founder, warm tone, link to Discord/Slack for feedback
- **Zero health claims** in any email copy

---

**FE-072: Beta Feedback Modal**
**Effort:** [S] 3 hours
**Week:** 14
**Depends on:** None
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §11.2

**Acceptance:**
- In-app feedback button: Profile → `"Send Feedback"`
- Modal: text area + optional screenshot attachment + submit button
- On submit: POST to backend `/api/v1/feedback` (BE-077) OR direct email via `expo-mail-composer`
- Auto-attach: app version, platform (iOS/Android), device model, user ID
- Confirmation: `"Thanks for your feedback!"`

---

### Polish

**FE-073: Loading Skeleton Screens**
**Effort:** [M] 4 hours
**Week:** 13
**Depends on:** FE-041 (dashboard), FE-051 (meal history), FE-054 (learn tab)
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §8.2

**Acceptance:**
- Dashboard: skeleton circular gauge + 3 skeleton meal cards
- Meal history: skeleton list rows (20 rows)
- Learn tab: skeleton article grid (2 columns × 5 rows)
- Skeleton animation: subtle shimmer effect using `react-native-reanimated`
- Replaces `"Loading..."` text spinners

---

**FE-074: Empty State Illustrations**
**Effort:** [S] 3 hours
**Week:** 13
**Depends on:** None
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §8.2

**Acceptance:**
- Dashboard empty: `"No meals logged yet today"` + camera icon + `"Scan Your First Meal"` CTA
- Meal history empty: `"Your meal history will appear here"` + illustration
- A1C progress empty: `"Log your first A1C reading to track progress"` + CTA
- All illustrations: warm, non-clinical, consistent style

---

**FE-075: Haptic Feedback**
**Effort:** [S] 2 hours
**Week:** 13
**Depends on:** None
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** PRD §8.2

**Acceptance:**
- Button taps: light haptic (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`)
- Scan complete: success haptic (`Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`)
- Error states: error haptic (`Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)`)
- Milestone celebration: heavy haptic (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)`)
- Android: uses `react-native-haptic-feedback` (Expo doesn't support Android haptics)

---

**FE-076: Accessibility Audit**
**Effort:** [M] 6 hours
**Week:** 14
**Depends on:** All screens complete
**Blocks:** BLK-005
**Owner:** Person B
**SPEC/PRD Reference:** REC-009

**Acceptance:**
- All interactive elements: `accessibilityLabel` and `accessibilityHint` present
- All images: `accessibilityLabel` or `accessible={false}` (decorative)
- Form inputs: `accessibilityLabel` matches visible label
- Color contrast: 4.5:1 minimum for text, 3:1 for large text (WCAG AA)
- VoiceOver (iOS) and TalkBack (Android) navigation tested on all critical flows
- Font scaling: app usable at 200% text size (iOS Dynamic Type, Android font scale)

---

**FE-077: Internationalization Prep (Strings Only)**
**Effort:** [S] 2 hours
**Week:** 14
**Depends on:** FE-006 (i18next setup)
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** REC-012

**Acceptance:**
- All user-visible strings externalized to `locales/en.json` (enforced by ESLint)
- Pluralization rules configured for: `"X scan(s) remaining"`, `"X day(s)"`
- Number formatting: commas for thousands, locale-aware decimal separators
- Date formatting: `date-fns` with locale support
- **V1 ships English only** — Spanish, French stubs prepared for V1.1

---

**FE-078: Performance Profiling**
**Effort:** [M] 4 hours
**Week:** 14
**Depends on:** All features complete
**Blocks:** VAL-029
**Owner:** Person B
**SPEC/PRD Reference:** VAL-029

**Acceptance:**
- React DevTools Profiler: identify slow renders, optimize with `React.memo` or `useMemo`
- Hermes enabled (default in Expo SDK 52) — verify bundle size <10MB
- Image optimization: all images use `expo-image` with caching
- FlatList optimization: `removeClippedSubviews={true}`, `maxToRenderPerBatch={10}`
- Cold start measured on 5 devices: target ≤2s (VAL-029)

---

**FE-079: Dark Mode (V1.1 Prep)**
**Effort:** [S] 2 hours
**Week:** 14
**Depends on:** None
**Blocks:** None
**Owner:** Person B
**SPEC/PRD Reference:** REC-010

**Acceptance:**
- Color tokens defined in theme file: `colors.light` and `colors.dark`
- `useColorScheme` hook from React Native detects system preference
- **V1 ships light mode only** — dark mode toggle stubbed in Settings, feature flag gated
- All color references use theme tokens, NOT hard-coded hex values

---

## PHASE 4: LAUNCH (Week 15)

**FE-080: App Store Screenshots**
**Effort:** [M] 4 hours
**Week:** 15
**Depends on:** All features complete
**Blocks:** FE-082
**Owner:** Person B + Founder
**SPEC/PRD Reference:** PRD §11.3, DO-015

**Acceptance:**
- 5 screenshots per platform (iOS 6.7", 6.5", 5.5"; Android 1080×1920)
- Screenshot copy: headlines highlighting key features — **zero health claims**
- Screenshots show: onboarding, scan results, dashboard, A1C tracker, paywall
- Compliance review: Founder + legal advisor confirm no prohibited language
- Export from Figma → annotated in Photoshop → uploaded to App Store Connect / Play Console

---

**FE-081: App Store Copy + Compliance Review**
**Effort:** [M] 6 hours
**Week:** 15
**Depends on:** None
**Blocks:** FE-082
**Owner:** Founder + Legal Advisor
**SPEC/PRD Reference:** PRD §14, BLK-005

**Acceptance:**
- App title: `"Revora - Blood Sugar Tracker"`
- Subtitle: `"Meal scanner for diabetes wellness"`
- Description: full copy in `locales/app-store-description.md`, reviewed by legal
- Keywords: `"diabetes, blood sugar, A1C, glycemic load, meal tracker, glucose"`
- **Zero instances** of: reverse, reversal, cure, treat, diagnose, prescription
- Privacy nutrition label: data types declared (health, contact info, identifiers)
- Age rating: 12+ (medical/treatment info)
- Category: Health & Fitness
- Support URL: `https://revora.app/support`

---

**FE-082: Production EAS Submit**
**Effort:** [S] 2 hours
**Week:** 15
**Depends on:** FE-080, FE-081, BLK-005 (checklist complete)
**Blocks:** LAUNCH
**Owner:** Person B
**SPEC/PRD Reference:** SPEC §7.1, DO-015, DO-016

**Acceptance:**
- `eas build --profile production --platform all` succeeds
- `eas submit --platform ios` uploads to App Store Connect for review
- `eas submit --platform android` uploads to Play Console for review
- App Store: `"Pending Review"` status
- Play Console: `"Pending Publication"` status
- Rollout: initial 5% staged rollout on Android, 100% on iOS (App Store default)

---

**FE-083: Launch Day Monitoring**
**Effort:** [S] 2 hours
**Week:** 15
**Depends on:** FE-082 (app live)
**Blocks:** None
**Owner:** Person B + Founder
**SPEC/PRD Reference:** PRD §11.3

**Acceptance:**
- Sentry dashboard open: monitor crash-free rate target ≥99.5%
- PostHog dashboard: monitor `app_opened`, `onboarding_started`, `scan_completed` events
- RevenueCat dashboard: monitor purchase events
- Critical alert: PagerDuty (or email) if crash-free rate drops below 98%
- Manual testing: download from App Store / Play Store → full onboarding + scan flow on production backend

---

## CROSS-DOMAIN DEPENDENCIES (Frontend → Backend)

| Dep ID | Frontend Task | Backend Task | Risk if Late |
|--------|---------------|--------------|--------------|
| **DEP-001** | FE-022: Onboarding submit | BE-029: POST /onboarding endpoint | Onboarding flow broken |
| **DEP-002** | FE-033: Scan results UI | BE-046: POST /scan response schema | Can't render results |
| **DEP-003** | FE-033d: Advice cards | BE-042: Premium filtering logic | Free users see premium data (security) |
| **DEP-004** | FE-060: Paywall pricing | BE-073: RevenueCat webhook | Purchase doesn't unlock features |
| **DEP-005** | FE-057, FE-058: GDPR UI | BE-062, BE-063: Export/delete endpoints | GDPR non-compliance |
| **DEP-006** | FE-035: Scan limit UX | BE-044: Rate limiting headers | Free tier unenforceable |
| **DEP-007** | FE-041: Dashboard query | BE-048: GET /dashboard/today | Dashboard shows stale/wrong data |
| **DEP-008** | FE-032: Scan API call | BE-032: Image upload + R2 | Scan broken |
| **DEP-009** | FE-005: API client | BE-001: Field naming (camelCase) | API calls fail |
| **DEP-010** | FE-046: A1C display | BE-054: Estimation algorithm | A1C estimation broken |
| **DEP-011** | FE-044: Walk timer | BE-057, BE-058: Walk endpoints | Walk logging broken |
| **DEP-012** | FE-063: Purchase flow | BE-072, BE-073: RevenueCat webhooks | Purchases don't sync |
| **DEP-013** | FE-039: Streak logic | BE-050: Streak calculation | Streak counter wrong |

---

## LAUNCH BLOCKERS (Frontend-Specific)

| ID | Blocker | Owner | Target Week | Status |
|----|---------|-------|-------------|--------|
| **BLK-001** | VAL-001 accuracy gate (85% on 100 meals) visible to user in scan results | Person B | W14 | NOT STARTED |
| **BLK-005** | App Store pre-submission checklist complete | Founder | W14 | NOT STARTED |
| **BLK-006** | Zero reversal language in JSX (CI grep enforced) | Person B | W2 | NOT STARTED |
| **BLK-007** | Age gate (COPPA) implemented and tested (VAL-014) | Person B | W2 | NOT STARTED |
| **BLK-011** | RevenueCat subscription lifecycle tested (purchase → cancel → expire) | Person B | W13 | NOT STARTED |
| **BLK-012** | Expo camera spike resolved (managed vs. bare workflow decision) | Person B | W2 | NOT STARTED |
| **BLK-013** | A1C ALWAYS shown with ±0.2 bounds + disclaimer (VAL-007, VAL-016) | Person B | W12 | NOT STARTED |

---

## RISK REGISTER (Frontend-Specific)

| Risk ID | Description | Probability | Impact | Mitigation | Status |
|---------|-------------|-------------|--------|------------|--------|
| **RSK-001** | Expo camera requires ejection to bare workflow | MEDIUM | HIGH | Week 2 spike (BE-028, FE-028) — 2-day proto validates managed workflow camera overlay before architecture commit | OPEN |
| **RSK-003** | Frontend blocked waiting for backend APIs | HIGH | HIGH | Every API endpoint has a **mock/stub** delivered 1 week before live backend (e.g., FE-032 uses mock while BE-046 in progress) | OPEN |
| **RSK-005** | App Store rejection for health claims | HIGH | CRITICAL | ESLint lint rule blocks reversal language (FE-002), legal review Week 14 (FE-081), CI grep enforcement | OPEN |
| **RSK-006** | RevenueCat webhook latency causes tier mismatch | MEDIUM | MEDIUM | Grace period: optimistic local state update, revalidate after 30s (FE-063) | OPEN |
| **RSK-011** | Cold start >2s on older devices (VAL-029) | MEDIUM | MEDIUM | Hermes enabled, bundle size monitored, profiling at Week 14 (FE-078) | OPEN |
| **RSK-012** | Beta testers don't provide actionable feedback | MEDIUM | LOW | Feedback modal (FE-072), structured survey questions, incentive ($25 Amazon gift card for 10 detailed reports) | OPEN |
| **RSK-013** | TestFlight/Play Console review delays launch | LOW | HIGH | Submit internal builds by Week 13 to identify issues early (FE-066, FE-067) | OPEN |

---

## WEEKLY FRONTEND DELIVERABLES

| Week | Phase | Primary Deliverable | Milestone / Gate |
|------|-------|---------------------|------------------|
| **1** | P0 | Project scaffolding: Expo SDK 52, Zustand, TanStack Query, i18next, ESLint health claims rule, CI pipeline | Foundation complete |
| **2** | P0 | Auth screens (login, register, guest), token storage, onboarding Screens 1-6, **Expo camera spike (BLK-012)** | Expo spike gate |
| **3** | P1 | Camera screen, plate overlay, scan mode toggle, onboarding submit API integration | First camera render |
| **4** | P1 | Scan API call, loading states, image compression | First scan completes |
| **5** | P1 | Scan results sheet: GL banner, progressive disclosure, food breakdown | Scan results visible |
| **6** | P1 | Scan results: advice cards (premium gating), dashboard (GL gauge, meal timeline, score badge), A1C progress screen | First end-to-end flow working |
| **7** | P1 | A1C features complete: manual log, estimated A1C with bounds, days-on-track, milestone modals, walk timer | A1C tracker functional |
| **8** | P1 | Meal history list, free tier 7-day wall, walk notification handler | Core features code-complete |
| **9** | P2 | RevenueCat SDK init, free tier scan limit UX, GDPR export button | Monetization foundation |
| **10** | P2 | GDPR deletion flow, offline-first dashboard caching | Compliance ready |
| **11** | P2 | Learn tab (article grid, reader), pattern insight cards, weekly report summary | Education content live |
| **12** | P2 | **Paywall modal, triggers (T1-T4), purchase flow, subscription management** | Monetization complete, **Week 12 gate** |
| **13** | P3 | TestFlight + Play Console builds, alpha validation (VAL-013–VAL-030), Sentry monitoring, PostHog events, polish (skeletons, empty states, haptics) | Alpha gate — zero P0 crashes |
| **14** | P3 | Beta feedback, accessibility audit, performance profiling, compliance review, **VAL-001 accuracy gate visible to user** | **Week 14 gate** — App Store pre-submission checklist complete |
| **15** | P4 | App Store screenshots, copy, production EAS submit, launch monitoring | **LAUNCH** |

---

## CRITICAL PATH (Frontend)

**Any slip here → launch slips:**

1. **Week 1:** FE-001 (Expo project init) → FE-002 (ESLint health claims rule) → FE-003 (Zustand) → FE-005 (API client) → FE-007 (CI pipeline)
2. **Week 2:** FE-020 (Age gate + consent — **BLK-007**) → FE-028 (**Expo camera spike gate — BLK-012**)
3. **Week 3:** FE-022 (Onboarding submit — **DEP-001**) → FE-028 (Camera screen) → FE-032 (Scan API call)
4. **Week 5:** FE-033 (Scan results sheet — **DEP-002**)
5. **Week 6:** FE-036 (Dashboard GL gauge) → FE-041 (Dashboard API — **DEP-007**) → FE-045 (A1C progress)
6. **Week 7:** FE-046 (A1C display with bounds — **BLK-013**)
7. **Week 12:** FE-060 (Paywall modal) → FE-063 (Purchase flow — **DEP-004**, **BLK-011**)
8. **Week 13:** FE-070 (Alpha validation — zero P0 crashes)
9. **Week 14:** FE-081 (App Store copy compliance review — **BLK-005**)
10. **Week 15:** FE-082 (Production submit — **LAUNCH**)

---

## ACCEPTANCE TESTING CHECKLIST (Pre-Launch)

**Person B executes, Founder reviews:**

### Onboarding & Auth
- [ ] VAL-002: Complete onboarding 6 screens → data persists → API call succeeds
- [ ] VAL-013: Guest mode → 3 scans → upgrade → data preserved after conversion
- [ ] VAL-014: Age gate enforced — under-13 blocked, zero data collected

### Scan Flow
- [ ] VAL-003: Scan result visible ≤5s (WiFi, 95th percentile)
- [ ] VAL-004: Image compression ≤500KB before upload
- [ ] VAL-016: **A1C NEVER shown as single number** — always range with ±0.2
- [ ] VAL-017: Disclaimer present on EVERY scan result, always visible
- [ ] BLK-006: Zero reversal language — `grep -r "reversal\|reverse\|cure\|treat" src/` returns no matches

### Dashboard
- [ ] VAL-006: Streak uses correct `glBudget` (not hardcoded 80)
- [ ] Dashboard polling: 30s interval, pauses when backgrounded

### Premium & Monetization
- [ ] VAL-012: Free tier scan limit enforced (5 scans/day default from PostHog)
- [ ] VAL-023: Free tier 7-day history wall enforced, server returns 7 days max
- [ ] BLK-011: RevenueCat purchase → webhook fires → tier updated in backend + frontend
- [ ] Paywall triggers: T1 (scan limit), T2 (advice tap), T3 (history wall), T4 (Day 7)

### Walks & Activities
- [ ] VAL-021: Walk notification received 30 min after MODERATE/HIGH meal
- [ ] VAL-022: Walk timer duration accurate ≤5s drift over 15 min

### GDPR & Privacy
- [ ] VAL-010: Data export completes ≤10s for ≤1000 meals
- [ ] VAL-011: Account deletion → 30-day grace period → data purged
- [ ] BLK-008: GDPR endpoints functional

### Performance & Reliability
- [ ] VAL-027: Crash-free rate ≥99.5% (Sentry dashboard)
- [ ] VAL-029: Cold start <2s on iPhone 12 / Pixel 5
- [ ] Offline mode: cached dashboard data shown with "Last updated" badge

### Compliance & Launch Blockers
- [ ] BLK-005: App Store pre-submission checklist complete
- [ ] BLK-007: Age gate + COPPA compliance tested
- [ ] BLK-013: A1C always shown with ±0.2 bounds + disclaimer
- [ ] FE-081: App Store copy legal review complete — zero health claims

---

## NOTES & CONVENTIONS

### Code Style
- **TypeScript strict mode** — zero `any`, all types explicit
- **Functional components** — no class components
- **Hooks** — custom hooks in `hooks/`, prefix `use*`
- **Async/await** — no raw Promises or `.then()` chains

### File Structure
```
mobile/
  app/                      ← Expo Router screens
    (auth)/
    (onboarding)/
    (tabs)/
    scan/
    meal/
  components/               ← Reusable UI components
    Button.tsx
    Card.tsx
    Input.tsx
  hooks/                    ← Custom hooks
    useDashboard.ts
    useScan.ts
  lib/                      ← Utilities
    api.ts
    posthog.ts
    revenueCat.ts
    tokenStorage.ts
  stores/                   ← Zustand stores
    userStore.ts
    dashboardStore.ts
    scanStore.ts
  locales/                  ← i18next translation files
    en.json
```

### Testing Strategy
- **Unit tests:** Jest for utility functions, Zustand stores
- **Integration tests:** Mock API calls with MSW
- **E2E tests:** Detox (V1.1 — not Week 1-15 scope)
- **Manual testing:** Alpha validation checklist (FE-070)

### Git Workflow
- Branch naming: `feature/FE-XXX-short-description`
- Commit messages: `[FE-XXX] Description`
- PR template: links to SPEC/PRD, screenshots, test coverage
- Squash merge to `main`

---

## HANDOFF TO BACKEND

**Person B delivers to Person A (weekly):**

### Week 1 Handoff
- API client `lib/api.ts` with base URL + auth interceptor
- TypeScript interfaces for all request/response types (matching SPEC camelCase exactly)
- Mock API responses for: `/auth/register`, `/auth/login`, `/auth/guest`, `/onboarding`

### Week 3 Handoff
- Scan request schema: `FormData` with `image` field (JPEG, 1024×1024, ≤500KB)
- Expected scan response TypeScript interface (SPEC §4.1.3 full shape)

### Week 6 Handoff
- Dashboard API expected response shape (GL consumed, budget, meals array, streak, score)
- A1C API expected response shape (estimated A1C, error bound, divergence warning)

### Week 12 Handoff
- RevenueCat webhook test events (purchase, cancel, expire) for backend integration testing
- Subscription status polling requirements (every 30s after purchase)

---

## SUCCESS METRICS (Frontend-Specific)

**Tracked in PostHog:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Onboarding completion rate** | ≥60% | `onboarding_completed` / `onboarding_started` |
| **Guest-to-registered conversion** | ≥40% | `guest_converted` / `guest_created` |
| **Average scans per day (active users)** | ≥2 scans/day | `scan_completed` events / DAU |
| **Free-to-premium conversion** | ≥5% | `purchase_completed` / `paywall_viewed` |
| **7-day retention** | ≥50% | Users returning Day 7 / signups |
| **Crash-free rate** | ≥99.5% | Sentry dashboard |
| **Cold start time** | ≤2s (median) | Sentry performance monitoring |

---

## END OF FRONTEND PLAN

**Version:** 1.0  
**Status:** ACTIVE  
**Next Review:** Week 1 end (2026-03-13)  
**Owner:** Person B  
**Approver:** Founder/PM

**This document is your daily working map. Update task statuses weekly. Any blocker or risk status change → escalate immediately.**
```

# CANVAS_DESCRIPTION
I've created the **Revora Frontend Implementation Plan v1.0** — a comprehensive, actionable document covering all 83 frontend tasks across Weeks 1–15, from Expo project initialization through App Store launch.

**Key sections included:**
- Phase 0 (Weeks 1-2): Foundation — project setup, navigation, TypeScript, ESLint health claims rule, Zustand/TanStack Query, CI pipeline, Expo camera spike gate (BLK-012)
- Phase 1 (Weeks 3-8): Core Features — camera/scan flow, dashboard, A1C tracker, meal history, walks
- Phase 2 (Weeks 9-12): Value-Add — RevenueCat integration, paywall (4 triggers), GDPR UI, Learn tab
- Phase 3 (Weeks 13-14): Beta + Polish — TestFlight/Play Console, alpha validation, accessibility, performance profiling
- Phase 4 (Week 15): Launch — App Store submission, monitoring

**Critical gates flagged:**
- Week 2: Expo camera spike (BLK-012)
- Week 12: Monetization complete (paywall + RevenueCat)
- Week 13: Alpha validation — zero P0 crashes
- Week 14: VAL-016 A1C bounds, App Store pre-submission checklist (BLK-005)

**Cross-domain dependencies**, **risk register**, **weekly deliverables**, **critical path**, and **acceptance checklist** all included for Person B's daily execution.
