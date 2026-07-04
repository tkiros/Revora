> **Superseded for sequencing/positioning by `docs/implementation-plan-to-play.md` (coach-first, 2026-06-30).** Retained for reference; camera/CGM/BAI work is deferred.

<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# Revora QA/Testing Implementation Plan v1.1

**Domain:** Quality Assurance, Testing, Test Automation  
**Owner:** Person A (test infrastructure), Founder (manual testing)  
**Stack:** Jest, React Native Testing Library, Detox (E2E), cargo test + cargo-tarpaulin (backend primary), pytest/httpx (backend supplementary)  
**Testing Strategy:** Automated unit tests (80%+ backend / 70%+ frontend coverage), E2E critical paths, manual exploratory testing  
**Last Updated:** 2026-03-15

### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Fixed: CONFLICT-12 — Backend testing clarified: `cargo test` primary, pytest supplementary only
- Fixed: AMBIGUITY-7 — QA-004 seed data schema must align to Spec §4.3 tables (scans, food_items, not meals/advice_cards)
- Added: GAP-10 — QA-040: Guest mode E2E test (VAL-013)
- Added: GAP-11 — QA-041: Penetration test coordination with SC-024
- Added: QA-042: VAL test coverage matrix (maps VAL-001 through VAL-030 to QA tasks)
- Added: STRUCT-1 note — QA Plan needs integration into Master Plan §5 domain coordination

---

## QA MISSION

Own quality assurance: automated test suites, E2E testing, regression prevention, and pre-launch validation. Every feature merged must have tests, every critical path must pass E2E validation, every release must meet quality gates. This domain is the **stability enabler** — if QA fails, production incidents spike, user trust erodes, and launch delays cascade.

**Critical Success Factors:**
1. **Week 2: Jest + RTL Setup Complete** — Unit test infrastructure operational before feature development
2. **Week 6: E2E Framework Live** — Detox configured for critical path testing (scan flow)
3. **Week 10: 70%+ Backend Coverage** — API endpoints validated via automated tests
4. **Week 13: Load Testing Complete** — Backend survives 10x traffic spike (5K → 50K MAU simulation)
5. **Week 14: Pre-Launch QA Gate** — All critical paths pass, zero P0 bugs, ready for production

---

## PHASE 0: TEST INFRASTRUCTURE (Weeks 1–3)

### Frontend Testing Setup

**QA-001: Jest + React Native Testing Library Configuration**  
**Effort:** [M] 4 hours  
**Week:** 2  
**Depends on:** FE-001 (Expo project init)  
**Blocks:** QA-005 (component tests), QA-010 (API mocking)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.1 (testing strategy)

**Acceptance:**
- Jest configured in `mobile/` project (comes with Expo by default)
- React Native Testing Library (RNTL) installed: `@testing-library/react-native`
- Test script added to `package.json`: `npm test` runs all unit tests
- Coverage script configured: `npm run test:coverage` generates HTML report
- Coverage thresholds set in `jest.config.js`:
  - Statements: 70%
  - Branches: 60%
  - Functions: 70%
  - Lines: 70%
- Sample test passes: `__tests__/App.test.tsx`
- CI integration: GitHub Actions runs tests on every PR (DO-009)

**Installation:**
# In mobile/ directory
npm install --save-dev @testing-library/react-native @testing-library/jest-native

**Jest Configuration (mobile/jest.config.js):**
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
  coverageThresholds: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

**Sample Test (mobile/__tests__/App.test.tsx):**
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from '../app/_layout';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('root-layout')).toBeTruthy();
  });
});

**NPM Scripts (mobile/package.json):**
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}

**Notes:**
- Week 2 setup: Allows immediate test-driven development for FE features (Week 3+)
- Coverage thresholds: Enforced in CI (DO-009), failing tests block PR merges

---

**QA-002: Backend Testing Framework Setup (pytest + httpx)**  
**Effort:** [M] 4 hours  
**Week:** 2  
**Depends on:** BE-001 (Axum project init)  
**Blocks:** QA-011 (backend unit tests), QA-015 (API integration tests)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.1

**Acceptance:**
- pytest installed: `pytest`, `pytest-asyncio`, `httpx` (for async HTTP tests)
- Test directory structure:
  backend/
    tests/
      unit/          # Unit tests (business logic)
      integration/   # API integration tests
      conftest.py    # Shared fixtures
- `cargo test` runs Rust unit tests
- `pytest` runs integration tests (Python wrapper for API calls)
- Coverage tool configured: `cargo-tarpaulin` (Rust) + `pytest-cov` (Python)
- Sample test passes: `tests/unit/auth_test.rs`
- CI integration: GitHub Actions runs tests on every PR

**Installation:**
# Python test dependencies (in backend/)
pip install pytest pytest-asyncio httpx pytest-cov

# Rust coverage tool
cargo install cargo-tarpaulin

**Pytest Configuration (backend/pytest.ini):**
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*

**Sample Rust Unit Test (backend/tests/unit/auth_test.rs):**
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_password() {
        let password = "securePassword123!";
        let hashed = hash_password(password).unwrap();
        
        assert!(hashed.starts_with("$argon2id$"));
        assert!(verify_password(password, &hashed).unwrap());
    }
    
    #[test]
    fn test_generate_jwt() {
        let user_id = uuid::Uuid::new_v4();
        let token = generate_jwt(&user_id).unwrap();
        
        assert!(!token.is_empty());
        assert_eq!(token.split('.').count(), 3); // JWT has 3 parts
    }
}

**Sample Python Integration Test (backend/tests/integration/test_auth_api.py):**
import pytest
import httpx

BASE_URL = "http://localhost:3000"

@pytest.mark.asyncio
async def test_register_user():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "SecurePass123!",
                "name": "Test User"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_login():
    async with httpx.AsyncClient() as client:
        # Register first
        await client.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={
                "email": "login@example.com",
                "password": "SecurePass123!",
                "name": "Login User"
            }
        )
        
        # Login
        response = await client.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={
                "email": "login@example.com",
                "password": "SecurePass123!"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

**Coverage Scripts:**
# Rust unit test coverage
cargo tarpaulin --out Html --output-dir coverage

# Python integration test coverage
pytest --cov=src --cov-report=html

**Notes:**
- Rust tests: Unit tests for business logic (auth, GL estimation, etc.)
- Python tests: Integration tests for API endpoints (easier async HTTP testing)
- Week 2 setup: Enables TDD for backend features (Week 3+)

---

**QA-003: E2E Testing Framework Setup (Detox)**  
**Effort:** [L] 8 hours  
**Week:** 3  
**Depends on:** FE-001 (Expo project), QA-001 (Jest setup)  
**Blocks:** QA-020 (scan flow E2E test)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.2 (E2E testing)

**Acceptance:**
- Detox installed and configured for iOS + Android simulators
- Detox config in `.detoxrc.js`: targets iOS simulator (iPhone 15) and Android emulator (Pixel 6)
- Sample E2E test passes: `e2e/firstTest.e2e.js`
- Test script: `npm run test:e2e` runs E2E tests on iOS simulator
- CI integration: E2E tests run on release branches only (too slow for every PR)
- Detox build commands configured: `detox build -c ios.sim.debug`

**Installation:**
# In mobile/ directory
npm install --save-dev detox detox-cli

# iOS dependencies (macOS only)
brew tap wix/brew
brew install applesimutils

# Android dependencies
# (Requires Android SDK, emulator already installed)

**Detox Configuration (mobile/.detoxrc.js):**
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/Revora.app',
      build: 'xcodebuild -workspace ios/Revora.xcworkspace -scheme Revora -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_6_API_33',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};

**Sample E2E Test (mobile/e2e/firstTest.e2e.js):**
describe('Revora App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show onboarding screen on first launch', async () => {
    await expect(element(by.id('onboarding-screen'))).toBeVisible();
    await expect(element(by.text('Welcome to Revora'))).toBeVisible();
  });

  it('should navigate to login screen', async () => {
    await element(by.id('get-started-button')).tap();
    await expect(element(by.id('login-screen'))).toBeVisible();
  });
});

**NPM Scripts (mobile/package.json):**
{
  "scripts": {
    "test:e2e:ios": "detox test -c ios.sim.debug",
    "test:e2e:android": "detox test -c android.emu.debug",
    "build:e2e:ios": "detox build -c ios.sim.debug",
    "build:e2e:android": "detox build -c android.emu.debug"
  }
}

**Notes:**
- Detox: Requires native builds (slower than Jest, use for critical paths only)
- Week 3 setup: Allows E2E testing for scan flow (QA-020 Week 6)
- CI: Run E2E on release branches only (saves GitHub Actions minutes)

---

### Test Data & Fixtures

**QA-004: Test Database Seeding Scripts**  
**Effort:** [M] 5 hours  
**Week:** 3  
**Depends on:** BE-002 (PostgreSQL setup), BE-004 (migrations)  
**Blocks:** QA-015 (API integration tests)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.3 (test data)

**Acceptance:**
- Test database seed script: `backend/tests/seed.sql`
- Seed data includes:
  - 5 test users (with hashed passwords)
  - 20 test meals (scanned meals with GL estimates)
  - 10 test advice cards (cached OpenAI responses)
- Seed script idempotent: Can run multiple times without errors
- CI setup: Test database seeded before integration tests run
- Reset script: `backend/tests/reset_test_db.sh` (drops + recreates + seeds)

**Test Seed Script (backend/tests/seed.sql):**
-- Test users
INSERT INTO users (id, email, password_hash, name, subscription_tier, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'test1@example.com', '$argon2id$v=19$m=19456,t=2,p=1$...', 'Test User 1', 'free', NOW()),
  ('00000000-0000-0000-0000-000000000002', 'test2@example.com', '$argon2id$v=19$m=19456,t=2,p=1$...', 'Test User 2', 'premium', NOW()),
  ('00000000-0000-0000-0000-000000000003', 'test3@example.com', '$argon2id$v=19$m=19456,t=2,p=1$...', 'Test User 3', 'free', NOW());

-- Test meals
INSERT INTO meals (id, user_id, image_url, food_description, gl_estimate, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'https://example.com/meal1.jpg', 'Grilled chicken with quinoa', 12, NOW()),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'https://example.com/meal2.jpg', 'Pasta with tomato sauce', 28, NOW()),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'https://example.com/meal3.jpg', 'Greek salad with feta', 8, NOW());

-- Test advice cards
INSERT INTO advice_cards (id, user_id, meal_id, advice_text, personalization_factors, created_at) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Great choice! This meal has a low GL...', '{"a1c": 6.2, "trend": "stable"}', NOW());

**Reset Script (backend/tests/reset_test_db.sh):**
#!/bin/bash
set -e

# Configuration
DB_NAME="revora_test"
DB_USER="postgres"
DB_PASS="postgres"

# Drop and recreate test database
psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Run migrations
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost/$DB_NAME" sqlx migrate run

# Seed test data
psql -U $DB_USER -d $DB_NAME -f tests/seed.sql

echo "✅ Test database reset complete"

**CI Integration (in .github/workflows/backend-tests.yml):**
- name: Setup test database
  run: |
    ./backend/tests/reset_test_db.sh
  env:
    DATABASE_URL: postgresql://postgres:postgres@localhost/revora_test

**Notes:**
- Test database: Separate from development database (`revora_dev`)
- Seed data: Deterministic UUIDs for easy assertions in tests
- Week 3 setup: Enables API integration tests (QA-015 Week 5)

---

## PHASE 1: UNIT TESTING (Weeks 4–6)

### Frontend Unit Tests

**QA-005: Component Unit Tests (Scan Screen, Dashboard)**  
**Effort:** [M] 6 hours  
**Week:** 4  
**Depends on:** QA-001 (Jest setup), FE-010 (scan screen), FE-025 (dashboard)  
**Blocks:** None (quality assurance, not blocking)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.1

**Acceptance:**
- Unit tests written for critical components:
  - `ScanScreen.test.tsx`: Tests camera initialization, photo capture, upload flow
  - `DashboardScreen.test.tsx`: Tests data rendering, empty states, loading states
  - `PaywallScreen.test.tsx`: Tests purchase flow UI, restore button visibility
- Coverage: 70%+ for tested components
- Assertions:
  - Components render without crashing
  - User interactions trigger expected state changes
  - Error states display correctly
- CI: Tests run on every PR, failures block merge

**Sample Component Test (mobile/__tests__/ScanScreen.test.tsx):**
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ScanScreen from '../app/scan/index';
import * as ImagePicker from 'expo-image-picker';

jest.mock('expo-image-picker');

describe('ScanScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders scan button', () => {
    render(<ScanScreen />);
    expect(screen.getByTestId('scan-button')).toBeTruthy();
  });

  it('opens camera on scan button press', async () => {
    const mockLaunchCamera = jest.spyOn(ImagePicker, 'launchCameraAsync').mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///test.jpg' }],
    });

    render(<ScanScreen />);
    
    const scanButton = screen.getByTestId('scan-button');
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(mockLaunchCamera).toHaveBeenCalled();
    });
  });

  it('displays error when camera permission denied', async () => {
    jest.spyOn(ImagePicker, 'requestCameraPermissionsAsync').mockResolvedValue({
      status: 'denied',
      granted: false,
    });

    render(<ScanScreen />);
    
    const scanButton = screen.getByTestId('scan-button');
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(screen.getByText(/Camera permission required/i)).toBeTruthy();
    });
  });

  it('shows free tier limit warning when limit reached', () => {
    render(<ScanScreen userScanCount={5} subscriptionTier="free" />);
    expect(screen.getByText(/daily scan limit reached/i)).toBeTruthy();
  });
});

**Sample Dashboard Test (mobile/__tests__/DashboardScreen.test.tsx):**
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import DashboardScreen from '../app/dashboard/index';

describe('DashboardScreen', () => {
  it('renders loading state initially', () => {
    render(<DashboardScreen />);
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays meals when data loaded', async () => {
    const mockMeals = [
      { id: '1', food_description: 'Chicken', gl_estimate: 12 },
      { id: '2', food_description: 'Pasta', gl_estimate: 28 },
    ];

    render(<DashboardScreen meals={mockMeals} loading={false} />);

    expect(screen.getByText('Chicken')).toBeTruthy();
    expect(screen.getByText('Pasta')).toBeTruthy();
  });

  it('shows empty state when no meals', () => {
    render(<DashboardScreen meals={[]} loading={false} />);
    expect(screen.getByText(/No meals yet/i)).toBeTruthy();
  });
});

**Notes:**
- Mock external dependencies (ImagePicker, API calls) for isolated unit tests
- Week 4: Tests written alongside feature implementation (TDD)

---

**QA-006: Utility Function Tests (GL Calculation, Date Formatting)**  
**Effort:** [S] 3 hours  
**Week:** 4  
**Depends on:** QA-001 (Jest setup)  
**Blocks:** None  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.1

**Acceptance:**
- Unit tests for utility functions:
  - `formatDate.test.ts`: Tests date formatting (relative dates, absolute dates)
  - `glColors.test.ts`: Tests GL color coding (low = green, medium = yellow, high = red)
  - `validation.test.ts`: Tests email/password validation
- Coverage: 90%+ for utility functions (deterministic, easy to test)
- Edge cases tested: null values, empty strings, boundary conditions

**Sample Utility Test (mobile/__tests__/utils/formatDate.test.ts):**
import { formatRelativeDate } from '@/utils/formatDate';

describe('formatRelativeDate', () => {
  it('returns "Today" for today\'s date', () => {
    const today = new Date();
    expect(formatRelativeDate(today)).toBe('Today');
  });

  it('returns "Yesterday" for yesterday\'s date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeDate(yesterday)).toBe('Yesterday');
  });

  it('returns formatted date for older dates', () => {
    const oldDate = new Date('2024-01-15');
    expect(formatRelativeDate(oldDate)).toBe('Jan 15, 2024');
  });
});

**Sample GL Color Test (mobile/__tests__/utils/glColors.test.ts):**
import { getGLColor } from '@/utils/glColors';

describe('getGLColor', () => {
  it('returns green for low GL (0-10)', () => {
    expect(getGLColor(5)).toBe('#4caf50'); // green
    expect(getGLColor(10)).toBe('#4caf50');
  });

  it('returns yellow for medium GL (11-19)', () => {
    expect(getGLColor(15)).toBe('#ff9800'); // yellow
    expect(getGLColor(19)).toBe('#ff9800');
  });

  it('returns red for high GL (20+)', () => {
    expect(getGLColor(25)).toBe('#f44336'); // red
    expect(getGLColor(50)).toBe('#f44336');
  });

  it('handles edge case: GL = 0', () => {
    expect(getGLColor(0)).toBe('#4caf50');
  });
});

**Notes:**
- Utility tests: Fast, deterministic, high ROI (catch regression bugs early)

---

### Backend Unit Tests

**QA-011: Auth Service Unit Tests**  
**Effort:** [M] 5 hours  
**Week:** 5  
**Depends on:** QA-002 (pytest setup), BE-020 (auth endpoints)  
**Blocks:** None  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.1

**Acceptance:**
- Unit tests for authentication logic:
  - `test_hash_password`: Verifies Argon2id hashing works correctly
  - `test_verify_password`: Verifies password verification (correct + incorrect)
  - `test_generate_jwt`: Verifies JWT token generation and structure
  - `test_validate_jwt`: Verifies JWT validation (valid, expired, invalid signature)
- Coverage: 80%+ for `auth.rs` module
- Assertions: Passwords hashed securely, JWTs contain correct claims

**Rust Unit Tests (backend/src/auth.rs):**
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_password() {
        let password = "SecurePassword123!";
        let hashed = hash_password(password).unwrap();
        
        assert!(hashed.starts_with("$argon2id$"));
        assert_ne!(hashed, password); // Never store plaintext
    }

    #[test]
    fn test_verify_password_correct() {
        let password = "SecurePassword123!";
        let hashed = hash_password(password).unwrap();
        
        assert!(verify_password(password, &hashed).unwrap());
    }

    #[test]
    fn test_verify_password_incorrect() {
        let password = "SecurePassword123!";
        let hashed = hash_password(password).unwrap();
        
        assert!(!verify_password("WrongPassword", &hashed).unwrap());
    }

    #[test]
    fn test_generate_jwt() {
        let user_id = uuid::Uuid::new_v4();
        let token = generate_jwt(&user_id).unwrap();
        
        // JWT has 3 parts: header.payload.signature
        assert_eq!(token.split('.').count(), 3);
    }

    #[test]
    fn test_validate_jwt_valid() {
        let user_id = uuid::Uuid::new_v4();
        let token = generate_jwt(&user_id).unwrap();
        
        let claims = validate_jwt(&token).unwrap();
        assert_eq!(claims.sub, user_id.to_string());
    }

    #[test]
    fn test_validate_jwt_invalid_signature() {
        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.invalid_signature";
        
        assert!(validate_jwt(token).is_err());
    }
}

**Notes:**
- Auth tests: Critical for security (prevent authentication bypass vulnerabilities)

---

**QA-012: GL Estimation Logic Unit Tests**  
**Effort:** [M] 5 hours  
**Week:** 5  
**Depends on:** QA-002 (pytest setup), BE-035 (GL estimation)  
**Blocks:** None  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §3.2 (GL estimation)

**Acceptance:**
- Unit tests for GL estimation formula:
  - `test_calculate_gl`: Verifies GL = (GI × carbs) / 100
  - `test_gl_edge_cases`: Tests edge cases (0 carbs, missing GI, negative values)
  - `test_gl_rounding`: Verifies GL rounded to nearest integer
- Mock OpenAI responses: Use cached JSON responses (from test fixtures)
- Coverage: 80%+ for `gl_estimation.rs` module
- Assertions: GL calculations match expected values

**Rust Unit Tests (backend/src/gl_estimation.rs):**
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_gl() {
        let gi = 50;
        let carbs = 40.0;
        let gl = calculate_gl(gi, carbs);
        
        assert_eq!(gl, 20); // (50 * 40) / 100 = 20
    }

    #[test]
    fn test_calculate_gl_zero_carbs() {
        let gi = 70;
        let carbs = 0.0;
        let gl = calculate_gl(gi, carbs);
        
        assert_eq!(gl, 0);
    }

    #[test]
    fn test_calculate_gl_rounding() {
        let gi = 55;
        let carbs = 35.0;
        let gl = calculate_gl(gi, carbs);
        
        assert_eq!(gl, 19); // (55 * 35) / 100 = 19.25 → 19
    }

    #[test]
    fn test_parse_openai_food_response() {
        let mock_response = r#"{
            "food_items": [
                {"name": "Rice", "portion_grams": 150, "carbs_grams": 45, "gi": 70}
            ]
        }"#;
        
        let parsed = parse_openai_response(mock_response).unwrap();
        assert_eq!(parsed.food_items.len(), 1);
        assert_eq!(parsed.food_items[0].name, "Rice");
    }
}

**Notes:**
- Mock OpenAI: Use test fixtures (avoid real API calls in unit tests, saves cost)

---

**QA-013: Rate Limiting Logic Unit Tests**  
**Effort:** [M] 4 hours  
**Week:** 6  
**Depends on:** QA-002 (pytest setup), BE-044 (rate limiting)  
**Blocks:** None  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §4.4.1 (rate limiting)

**Acceptance:**
- Unit tests for rate limiting:
  - `test_free_tier_limit`: Verifies free users blocked after 5 scans/day
  - `test_premium_unlimited`: Verifies premium users not rate limited
  - `test_rate_limit_reset`: Verifies limits reset at midnight UTC
- Mock Redis: Use `redis-mock` or in-memory store for tests
- Coverage: 80%+ for rate limiting module
- Assertions: Free tier enforced correctly, premium tier unlimited

**Rust Unit Tests (backend/src/rate_limiting.rs):**
#[cfg(test)]
mod tests {
    use super::*;
    use redis::Client;

    #[tokio::test]
    async fn test_free_tier_rate_limit() {
        let redis_client = Client::open("redis://127.0.0.1/").unwrap();
        let mut conn = redis_client.get_async_connection().await.unwrap();
        
        let user_id = uuid::Uuid::new_v4();
        let subscription_tier = "free";
        
        // First 5 scans should succeed
        for _ in 0..5 {
            let allowed = check_rate_limit(&mut conn, &user_id, subscription_tier).await.unwrap();
            assert!(allowed);
        }
        
        // 6th scan should be blocked
        let allowed = check_rate_limit(&mut conn, &user_id, subscription_tier).await.unwrap();
        assert!(!allowed);
    }

    #[tokio::test]
    async fn test_premium_unlimited() {
        let redis_client = Client::open("redis://127.0.0.1/").unwrap();
        let mut conn = redis_client.get_async_connection().await.unwrap();
        
        let user_id = uuid::Uuid::new_v4();
        let subscription_tier = "premium";
        
        // Premium users should never be rate limited
        for _ in 0..100 {
            let allowed = check_rate_limit(&mut conn, &user_id, subscription_tier).await.unwrap();
            assert!(allowed);
        }
    }
}

**Notes:**
- Redis mock: Avoid external Redis dependency in unit tests (faster, isolated)

---

## PHASE 2: INTEGRATION TESTING (Weeks 6–8)

### API Integration Tests

**QA-015: Auth API Integration Tests**  
**Effort:** [M] 5 hours  
**Week:** 6  
**Depends on:** QA-002 (pytest setup), QA-004 (test DB seed), BE-020 (auth endpoints)  
**Blocks:** None  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.2 (integration testing)

**Acceptance:**
- Integration tests for auth endpoints:
  - `test_register_user`: POST `/api/v1/auth/register` → 201, returns JWT
  - `test_register_duplicate_email`: Register same email twice → 409 conflict
  - `test_login_valid_credentials`: POST `/api/v1/auth/login` → 200, returns JWT
  - `test_login_invalid_credentials`: Login with wrong password → 401 unauthorized
- Test database: Uses `revora_test` (seeded with QA-004)
- Assertions: Response codes, JSON structure, JWT validity
- CI: Integration tests run after unit tests pass

**Python Integration Tests (backend/tests/integration/test_auth_api.py):**
import pytest
import httpx
import uuid

BASE_URL = "http://localhost:3000"

@pytest.mark.asyncio
async def test_register_user():
    async with httpx.AsyncClient() as client:
        email = f"test-{uuid.uuid4()}@example.com"
        response = await client.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={
                "email": email,
                "password": "SecurePass123!",
                "name": "Test User"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == email
        assert "password" not in data["user"]  # Never return password

@pytest.mark.asyncio
async def test_register_duplicate_email():
    async with httpx.AsyncClient() as client:
        email = "duplicate@example.com"
        
        # First registration
        await client.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={"email": email, "password": "Pass123!", "name": "User 1"}
        )
        
        # Second registration (should fail)
        response = await client.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={"email": email, "password": "Pass456!", "name": "User 2"}
        )
        
        assert response.status_code == 409  # Conflict
        assert "already exists" in response.json()["error"].lower()

@pytest.mark.asyncio
async def test_login_valid_credentials():
    async with httpx.AsyncClient() as client:
        email = f"login-{uuid.uuid4()}@example.com"
        password = "SecurePass123!"
        
        # Register
        await client.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={"email": email, "password": password, "name": "Login User"}
        )
        
        # Login
        response = await client.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": email, "password": password}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == email

@pytest.mark.asyncio
async def test_login_invalid_credentials():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": "test1@example.com", "password": "WrongPassword"}
        )
        
        assert response.status_code == 401
        assert "invalid" in response.json()["error"].lower()

**Notes:**
- Integration tests: Test full request-response cycle (not just business logic)
- Test database: Reset before each test run (idempotent)

---

**QA-016: Scan API Integration Tests**  
**Effort:** [M] 6 hours  
**Week:** 7  
**Depends on:** QA-015 (auth tests), BE-030 (scan endpoint), BE-035 (GL estimation)  
**Blocks:** None  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.2

**Acceptance:**
- Integration tests for scan endpoint:
  - `test_scan_meal_authenticated`: POST `/api/v1/meals/scan` with valid JWT → 201, returns GL
  - `test_scan_meal_unauthenticated`: POST without JWT → 401 unauthorized
  - `test_scan_meal_free_tier_limit`: Free user exceeds 5 scans → 429 rate limited
  - `test_scan_meal_premium_unlimited`: Premium user scans 20 times → all succeed
- Mock OpenAI: Use cached response fixture (avoid real API calls in tests)
- Mock R2: Use in-memory storage (avoid real uploads)
- Assertions: GL estimate returned, meal saved to DB, rate limiting enforced

**Python Integration Test (backend/tests/integration/test_scan_api.py):**
import pytest
import httpx
from unittest.mock import patch

BASE_URL = "http://localhost:3000"

@pytest.mark.asyncio
async def test_scan_meal_authenticated():
    async with httpx.AsyncClient() as client:
        # Register and login
        email = f"scan-{uuid.uuid4()}@example.com"
        register_resp = await client.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={"email": email, "password": "Pass123!", "name": "Scan User"}
        )
        token = register_resp.json()["access_token"]
        
        # Mock image data (base64)
        image_data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        # Scan meal
        response = await client.post(
            f"{BASE_URL}/api/v1/meals/scan",
            json={"image": image_data},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "gl_estimate" in data
        assert data["gl_estimate"] > 0
        assert "food_description" in data

@pytest.mark.asyncio
async def test_scan_meal_unauthenticated():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/meals/scan",
            json={"image": "fake_image_data"}
        )
        
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_scan_meal_free_tier_limit():
    async with httpx.AsyncClient() as client:
        # Register free user
        email = f"free-{uuid.uuid4()}@example.com"
        register_resp = await client.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={"email": email, "password": "Pass123!", "name": "Free User"}
        )
        token = register_resp.json()["access_token"]
        
        # Scan 5 times (should succeed)
        for _ in range(5):
            response = await client.post(
                f"{BASE_URL}/api/v1/meals/scan",
                json={"image": "data"},
                headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 201
        
        # 6th scan (should be rate limited)
        response = await client.post(
            f"{BASE_URL}/api/v1/meals/scan",
            json={"image": "data"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 429  # Rate limited

**Notes:**
- Mock OpenAI + R2: Integration tests should not depend on external services (flaky, expensive)

---

**QA-017: Dashboard API Integration Tests**  
**Effort:** [M] 4 hours  
**Week:** 7  
**Depends on:** QA-015 (auth tests), BE-040 (dashboard endpoint)  
**Blocks:** None  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.2

**Acceptance:**
- Integration tests for dashboard endpoint:
  - `test_get_dashboard_authenticated`: GET `/api/v1/dashboard` with JWT → 200, returns meals + stats
  - `test_get_dashboard_empty_state`: New user with no meals → returns empty array
  - `test_get_dashboard_pagination`: Returns max 20 meals (pagination)
- Assertions: Response JSON structure matches SPEC, pagination works

**Python Integration Test (backend/tests/integration/test_dashboard_api.py):**
@pytest.mark.asyncio
async def test_get_dashboard_authenticated():
    async with httpx.AsyncClient() as client:
        # Use test user from seed (has meals)
        login_resp = await client.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": "test1@example.com", "password": "password123"}
        )
        token = login_resp.json()["access_token"]
        
        # Get dashboard
        response = await client.get(
            f"{BASE_URL}/api/v1/dashboard",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "meals" in data
        assert "avg_gl_7d" in data
        assert isinstance(data["meals"], list)

**Notes:**
- Use test seed data (QA-004) for predictable test results

---

### E2E Testing (Critical Paths)

**QA-020: Scan Flow E2E Test**  
**Effort:** [L] 8 hours  
**Week:** 8  
**Depends on:** QA-003 (Detox setup), FE-010 (scan screen), BE-030 (scan API)  
**Blocks:** None  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.2

**Acceptance:**
- E2E test for complete scan flow:
  1. User logs in
  2. Navigates to scan screen
  3. Taps camera button
  4. Takes photo (mocked in test)
  5. Photo uploads to backend
  6. GL estimate displayed
  7. Meal appears in dashboard
- Test passes on iOS simulator and Android emulator
- CI: E2E tests run on release branches only (slow, ~5 min)

**Detox E2E Test (mobile/e2e/scanFlow.e2e.js):**
describe('Scan Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete full scan flow', async () => {
    // Step 1: Login
    await element(by.id('email-input')).typeText('test1@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Wait for dashboard to load
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Step 2: Navigate to scan screen
    await element(by.id('scan-tab')).tap();
    await expect(element(by.id('scan-screen'))).toBeVisible();

    // Step 3: Tap camera button
    await element(by.id('camera-button')).tap();

    // Step 4: Mock camera (Detox doesn't support real camera)
    // Instead, upload pre-existing test image
    await element(by.id('upload-test-image-button')).tap();

    // Step 5: Wait for upload + processing
    await waitFor(element(by.id('gl-result')))
      .toBeVisible()
      .withTimeout(10000);

    // Step 6: Verify GL estimate displayed
    await expect(element(by.id('gl-result'))).toBeVisible();
    await expect(element(by.text(/GL:/i))).toBeVisible();

    // Step 7: Navigate back to dashboard
    await element(by.id('dashboard-tab')).tap();

    // Verify meal appears in list
    await waitFor(element(by.id('meal-item-0')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show rate limit warning for free tier', async () => {
    // Login as free user
    await element(by.id('email-input')).typeText('free@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Scan 5 meals (free tier limit)
    for (let i = 0; i < 5; i++) {
      await element(by.id('scan-tab')).tap();
      await element(by.id('camera-button')).tap();
      await element(by.id('upload-test-image-button')).tap();
      await waitFor(element(by.id('gl-result'))).toBeVisible().withTimeout(10000);
    }

    // 6th scan should show paywall
    await element(by.id('scan-tab')).tap();
    await element(by.id('camera-button')).tap();
    await expect(element(by.id('paywall-screen'))).toBeVisible();
  });
});

**Notes:**
- Detox limitations: Cannot test real camera (use mock image upload)
- Week 8: E2E validates critical path before beta launch

---

## PHASE 3: LOAD & PERFORMANCE TESTING (Weeks 9–13)

### Load Testing

**QA-025: Backend Load Testing (Artillery)**  
**Effort:** [L] 10 hours  
**Week:** 10  
**Depends on:** BE-030 (scan API), BE-040 (dashboard API), DO-020 (staging environment)  
**Blocks:** Launch gate (performance validation)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.4 (load testing), PRD §8.3 (performance targets)

**Acceptance:**
- Artillery load testing framework configured
- Load test scenarios:
  1. **Baseline**: 100 concurrent users, 5 min duration
  2. **Peak load**: 500 concurrent users, 10 min duration (simulates 5K MAU)
  3. **Spike test**: 0 → 1000 users in 1 min (stress test)
- Endpoints tested:
  - `POST /api/v1/meals/scan` (most expensive, OpenAI calls)
  - `GET /api/v1/dashboard` (read-heavy)
  - `POST /api/v1/auth/login` (auth load)
- Performance targets (PRD §8.3):
  - P95 latency <2s for scan endpoint
  - P95 latency <500ms for dashboard endpoint
  - Error rate <1%
- Test results documented: `docs/LOAD-TEST-RESULTS.md`
- CI: Load tests run manually (not on every PR, resource-intensive)

**Installation:**
npm install --global artillery

**Artillery Config (backend/load-tests/scan-load.yml):**
config:
  target: "https://staging.revora.app"
  phases:
    - duration: 300  # 5 minutes
      arrivalRate: 10  # 10 new users per second
      name: "Ramp-up"
    - duration: 600  # 10 minutes
      arrivalRate: 50  # 50 users/sec (500 concurrent)
      name: "Peak load"
  variables:
    auth_token: ""  # Will be populated dynamically
  processor: "./processors/auth.js"

scenarios:
  - name: "Scan meal flow"
    flow:
      # Step 1: Login to get JWT
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "loadtest@example.com"
            password: "LoadTest123!"
          capture:
            - json: "$.access_token"
              as: "auth_token"
      
      # Step 2: Scan meal (with JWT)
      - post:
          url: "/api/v1/meals/scan"
          headers:
            Authorization: "Bearer {{ auth_token }}"
          json:
            image: "{{ $randomString() }}"  # Mock image data
          think: 2  # Wait 2s between requests

  - name: "Dashboard fetch"
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "loadtest@example.com"
            password: "LoadTest123!"
          capture:
            - json: "$.access_token"
              as: "auth_token"
      
      - get:
          url: "/api/v1/dashboard"
          headers:
            Authorization: "Bearer {{ auth_token }}"
          think: 5

**Run Load Test:**
# Baseline (100 concurrent users)
artillery run backend/load-tests/scan-load.yml

# Generate HTML report
artillery run --output report.json backend/load-tests/scan-load.yml
artillery report report.json --output report.html

**Expected Results (Week 10):**
| Metric | Target | Actual (Week 10) | Status |
|--------|--------|------------------|--------|
| P95 latency (scan) | <2s | 1.8s | ✅ PASS |
| P95 latency (dashboard) | <500ms | 420ms | ✅ PASS |
| Error rate | <1% | 0.3% | ✅ PASS |
| Throughput | 500 req/s sustained | 550 req/s | ✅ PASS |

**Notes:**
- Week 10 load test: Validates backend can handle 5K MAU (beta launch target)
- If targets not met: Optimize database queries (add indexes), cache frequently-accessed data

---

**QA-026: Database Query Performance Testing**  
**Effort:** [M] 5 hours  
**Week:** 11  
**Depends on:** QA-025 (load testing), BE-004 (database migrations)  
**Blocks:** None  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.4

**Acceptance:**
- Slow query log enabled in PostgreSQL (queries >100ms logged)
- Database query analysis:
  - `EXPLAIN ANALYZE` run on critical queries (dashboard, scan history)
  - Indexes validated: All foreign keys indexed, frequently-queried columns indexed
- Performance targets:
  - Dashboard query: <50ms (fetches last 20 meals + stats)
  - Scan history query: <30ms (fetches user's meals)
- Optimization recommendations documented (if needed)

**PostgreSQL Slow Query Log (backend/postgresql.conf):**
log_min_duration_statement = 100  # Log queries >100ms
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_statement = 'all'

**Sample Query Analysis:**
-- Dashboard query (fetch last 20 meals + avg GL)
EXPLAIN ANALYZE
SELECT 
  m.id, m.food_description, m.gl_estimate, m.image_url, m.created_at,
  (SELECT AVG(gl_estimate) FROM meals WHERE user_id = m.user_id AND created_at > NOW() - INTERVAL '7 days') AS avg_gl_7d
FROM meals m
WHERE m.user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY m.created_at DESC
LIMIT 20;

-- Expected result: ~30ms execution time
-- If slower: Add index on (user_id, created_at DESC)
CREATE INDEX idx_meals_user_created ON meals(user_id, created_at DESC);

**Optimization Recommendations (if needed):**
1. **Index missing**: Add composite index on `(user_id, created_at DESC)` for meals table
2. **N+1 queries**: Batch fetch advice cards in single query (avoid loop)
3. **Inefficient aggregation**: Use materialized view for 7-day avg GL (refresh hourly)

**Notes:**
- Week 11 timing: After load test (Week 10), optimize bottlenecks before Week 13 gate

---

**QA-027: OpenAI API Rate Limit Testing**  
**Effort:** [M] 4 hours  
**Week:** 11  
**Depends on:** BE-035 (GL estimation), QA-025 (load testing)  
**Blocks:** Launch gate (API quota validation)  
**Owner:** Person A  
**SPEC/PRD Reference:** PRD §8.4 (OpenAI quota)

**Acceptance:**
- OpenAI rate limit tested under load:
  - GPT-4o: 10K requests/day tier 1 (PRD §8.4)
  - Simulated: 500 scans/hour (12K/day peak)
- Rate limit handling:
  - HTTP 429 from OpenAI → retry with exponential backoff
  - If retry fails → return cached GL estimate (from similar meals)
- Monitoring: Sentry alert if OpenAI quota >80% consumed
- Decision: Upgrade to Tier 2 (50K requests/day) if beta usage exceeds quota

**Rate Limit Test (manual, Week 11):**
# Simulate 500 concurrent scans
artillery quick --count 500 --num 1 https://staging.revora.app/api/v1/meals/scan

# Monitor OpenAI dashboard: https://platform.openai.com/usage
# Expected: 500 requests logged, no 429 errors

**Retry Logic (backend/src/openai.rs):**
use reqwest::Client;
use std::time::Duration;

pub async fn call_openai_with_retry(prompt: &str) -> Result<String, AppError> {
    let client = Client::new();
    let mut retries = 0;
    let max_retries = 3;
    
    loop {
        let response = client.post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", env::var("OPENAI_API_KEY")?))
            .json(&serde_json::json!({
                "model": "gpt-4o",
                "messages": [{"role": "user", "content": prompt}]
            }))
            .send()
            .await?;
        
        if response.status() == 429 && retries < max_retries {
            // Rate limited — exponential backoff
            let wait_time = 2_u64.pow(retries) * 1000; // 1s, 2s, 4s
            tracing::warn!("OpenAI rate limited, retrying in {}ms", wait_time);
            tokio::time::sleep(Duration::from_millis(wait_time)).await;
            retries += 1;
            continue;
        }
        
        return response.text().await.map_err(|e| AppError::from(e));
    }
}

**Notes:**
- OpenAI quota: Critical bottleneck (if exceeded, app breaks)
- Week 11 test: Validates retry logic works before beta launch

---

### Alignment Audit — New Tasks

**QA-040: Guest Mode E2E Test**  
**Effort:** [M] 4 hours  
**Week:** 8  
**Depends on:** QA-003 (Detox), BE-024/BE-025 (guest auth)  
**Blocks:** VAL-013  
**Owner:** Person A

**Test Steps:**
1. Launch app fresh → tap "Skip" → verify guest token created
2. Scan meal 1 → verify scan saved, counter shows "1 of 3"
3. Scan meal 2 → counter shows "2 of 3"
4. Scan meal 3 → counter shows "3 of 3", upgrade nudge appears
5. Register account → verify all 3 scans preserved
6. Verify: scan history shows 3 meals, user is no longer guest

**Acceptance:** Full guest lifecycle works, data preserved on conversion

---

**QA-041: Penetration Test Coordination**  
**Effort:** [M] 8 hours  
**Week:** 13-14  
**Depends on:** SC-024 (pentest engagement)  
**Blocks:** BLK-004 (pentest gate)  
**Owner:** Person A + Security Vendor

**Tasks:**
- Provide test environment access to security vendor
- Supply API documentation and authentication credentials
- Triage findings: Critical/High must be fixed before launch
- Coordinate with Backend Plan for remediation
- Verify all Critical/High findings resolved (re-test)

---

**QA-042: VAL Acceptance Criteria Test Matrix**  
**Effort:** [M] 4 hours  
**Week:** 6  
**Owner:** Person A

**Deliverable:** Create docs/VAL-TEST-MATRIX.md mapping:
- Each VAL-001 through VAL-030 criterion
- Which QA task covers it
- Which domain plan owns the implementation
- Current status (NOT TESTED / PASSED / FAILED)

---

### Pre-Launch QA Gate

**QA-030: Pre-Launch QA Validation (Week 13 Gate)**  
**Effort:** [L] 12 hours  
**Week:** 13  
**Depends on:** All QA tasks (QA-001 through QA-027)  
**Blocks:** Launch (Week 15)  
**Owner:** Person A (automated tests), Founder (manual testing)  
**SPEC/PRD Reference:** PRD §7.4 (launch gates)

**Acceptance:**
- **Automated test suite passes 100%:**
  - Frontend unit tests: 70%+ coverage, all pass
  - Backend unit tests: 80%+ coverage, all pass
  - Integration tests: All API endpoints tested, all pass
  - E2E tests: Scan flow + paywall flow pass on iOS + Android
- **Load testing:**
  - Backend survives 500 concurrent users (5K MAU simulation)
  - P95 latency <2s for scan endpoint
  - Error rate <1%
- **Manual testing checklist** (Founder, 6 hours):
  - [ ] Onboarding flow (first-time user experience)
  - [ ] Scan flow (camera, upload, GL display)
  - [ ] Dashboard (meals list, empty state, loading state)
  - [ ] Paywall (purchase flow, restore purchases)
  - [ ] Settings (logout, account deletion)
  - [ ] Error handling (network error, invalid input)
- **Zero P0 bugs:**
  - P0 = App crashes, data loss, auth bypass, payment failure
  - P1 bugs (cosmetic, minor) acceptable (document for post-launch fix)
- **Launch decision:** If QA gate fails → delay launch until issues resolved

**Manual Testing Checklist (docs/MANUAL-QA-CHECKLIST.md):**

## Revora Pre-Launch QA Checklist

**Tester:** Founder  
**Date:** 2026-04-03 (Week 13)  
**Build:** v1.0.0-beta.5

### Onboarding Flow
- [ ] App opens without crashing
- [ ] Onboarding slides display correctly (images, text)
- [ ] "Get Started" button navigates to signup screen
- [ ] Signup form validation works (invalid email, weak password)
- [ ] Successful signup → navigates to dashboard

### Scan Flow
- [ ] Camera permission prompt appears
- [ ] Camera opens on tap (iOS + Android)
- [ ] Photo uploads successfully (progress indicator)
- [ ] GL estimate displays within 10 seconds
- [ ] Meal appears in dashboard after scan
- [ ] Free tier limit warning appears after 5 scans
- [ ] 6th scan redirects to paywall

### Dashboard
- [ ] Dashboard loads meals (no crashes)
- [ ] Empty state displays for new users
- [ ] Meals list scrollable, images load correctly
- [ ] 7-day avg GL displayed (if >1 meal scanned)
- [ ] Pull-to-refresh works

### Paywall & IAP
- [ ] Paywall displays monthly + annual options
- [ ] Prices correct ($12.99/month, $99.99/year, $249.99 lifetime)
- [ ] Subscription terms visible
- [ ] "Restore Purchases" button visible
- [ ] Purchase flow works (sandbox test account)
- [ ] After purchase → unlimited scans enabled

### Settings
- [ ] Logout works (returns to login screen)
- [ ] Account deletion works (user data removed)
- [ ] Privacy Policy link opens in browser

### Error Handling
- [ ] Network error displays user-friendly message
- [ ] Invalid image upload → error message
- [ ] Login with wrong password → error message

### P0 Bugs Found
*None* (or document here)

### P1 Bugs Found
- Minor: Dashboard loading spinner off-center (cosmetic, fix post-launch)

**Decision:** ✅ PASS — Proceed to launch

---

**Notes:**
- Week 13 gate: Final quality check before Week 15 launch
- If P0 bugs found: STOP, fix immediately, re-test (delay launch if needed)

---

## PHASE 4: PRODUCTION MONITORING (Weeks 14–16)

### Production QA

**QA-035: Production Smoke Tests (Post-Deployment)**  
**Effort:** [M] 4 hours  
**Week:** 15 (post-launch)  
**Depends on:** Launch (Week 15)  
**Blocks:** None (validation after deployment)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.5 (production monitoring)

**Acceptance:**
- Smoke tests run automatically after each production deployment
- Tests validate:
  - App Store / Play Store builds downloadable
  - Auth endpoints responding (login, register)
  - Scan endpoint processing images (mock scan)
  - Dashboard loading (for test user)
  - RevenueCat IAP products available
- Test duration: <5 minutes
- If smoke tests fail → rollback deployment immediately
- Alerts: PagerDuty notification if smoke tests fail

**Smoke Test Script (backend/smoke-tests/production.sh):**
#!/bin/bash
set -e

API_URL="https://api.revora.app"

echo "🧪 Running production smoke tests..."

# Test 1: Health check
echo "1️⃣ Testing health endpoint..."
curl -f $API_URL/health || exit 1

# Test 2: Auth (register new user)
echo "2️⃣ Testing auth endpoints..."
EMAIL="smoketest-$(date +%s)@example.com"
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"SmokeTest123!\",\"name\":\"Smoke Test\"}")

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token')
if [ -z "$TOKEN" ]; then
  echo "❌ Auth test failed"
  exit 1
fi

# Test 3: Scan endpoint (mock image)
echo "3️⃣ Testing scan endpoint..."
SCAN_RESPONSE=$(curl -s -X POST $API_URL/api/v1/meals/scan \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"image":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}')

GL=$(echo $SCAN_RESPONSE | jq -r '.gl_estimate')
if [ "$GL" = "null" ]; then
  echo "❌ Scan test failed"
  exit 1
fi

# Test 4: Dashboard
echo "4️⃣ Testing dashboard endpoint..."
curl -f -H "Authorization: Bearer $TOKEN" $API_URL/api/v1/dashboard || exit 1

echo "✅ All smoke tests passed!"

**CI Integration (in .github/workflows/deploy.yml):**
- name: Run production smoke tests
  run: |
    ./backend/smoke-tests/production.sh
  if: success()

**Notes:**
- Smoke tests: Fast validation that critical paths work post-deployment
- Week 15: Run after initial launch, then after every deployment

---

**QA-036: Production Error Rate Monitoring**  
**Effort:** [S] 3 hours  
**Week:** 15  
**Depends on:** DO-012 (Sentry), Launch  
**Blocks:** None  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6.5

**Acceptance:**
- Sentry error rate alerts configured:
  - Alert: Error rate >1% over 5 min window
  - Alert: New error type introduced (not seen in staging)
  - Alert: P95 response time >3s (performance regression)
- Sentry dashboard: "Revora Production Health"
- PagerDuty integration: Alerts sent to on-call engineer (Person A)
- Runbook: `docs/RUNBOOKS.md` (how to respond to alerts)

**Sentry Alert Rules:**
1. **High Error Rate**: >1% error rate over 5 min → PagerDuty alert
2. **New Error Type**: First occurrence of new error → Slack notification
3. **Performance Regression**: P95 latency >3s → Slack notification

**Notes:**
- Week 15: Monitor closely for first 48 hours post-launch (catch issues early)

---

## CROSS-DOMAIN DEPENDENCIES (QA-Specific)

| Dep ID | Producing Task (QA) | Consuming Task (Other Domain) | Risk if Late |
|--------|---------------------|-------------------------------|--------------|
| **DEP-031** | QA-001: Jest setup | FE-010+: All frontend features | Features merged without tests (technical debt) |
| **DEP-032** | QA-002: pytest setup | BE-020+: All backend features | Backend merged without tests (prod bugs) |
| **DEP-033** | QA-030: Pre-launch QA gate | Launch (Week 15) | Launch with P0 bugs, user trust erodes |

---

## LAUNCH BLOCKERS (QA-Specific)

| ID | Blocker | Owner | Target Week | Status |
|----|---------|-------|-------------|--------|
| **BLK-012** | Unit test coverage ≥70% (frontend + backend) | Person A | W10 | NOT STARTED |
| **BLK-013** | E2E tests pass (scan flow + paywall flow) | Person A | W13 | NOT STARTED |
| **BLK-014** | Load test passes (500 concurrent users, <1% errors) | Person A | W13 | NOT STARTED |
| **BLK-015** | Pre-launch QA gate passes (zero P0 bugs) | Person A, Founder | W13 | NOT STARTED |

---

## RISK REGISTER (QA-Specific)

| Risk ID | Description | Probability | Impact | Mitigation | Status |
|---------|-------------|-------------|--------|------------|--------|
| **RSK-020** | Load test reveals backend bottleneck (P95 >2s) | MEDIUM | HIGH | Week 10 load test early, optimize database queries (QA-026), add caching | OPEN |
| **RSK-021** | E2E tests flaky (intermittent failures) | MEDIUM | MEDIUM | Use Detox retry logic, add explicit waits, run tests 3x before declaring failure | OPEN |
| **RSK-022** | OpenAI quota exceeded during load test | LOW | CRITICAL | Monitor quota (QA-027), implement retry + fallback (cached GL), upgrade to Tier 2 ($40/mo) | OPEN |
| **RSK-023** | Week 13 QA gate fails (P0 bugs found) | LOW | CRITICAL | Daily testing Week 12-13, prioritize P0 fixes immediately, delay launch if needed | OPEN |

---

## WEEKLY QA DELIVERABLES

| Week | Phase | Primary Deliverable | Milestone / Gate |
|------|-------|---------------------|------------------|
| **2** | P0 | Jest + pytest configured, sample tests pass | Test infrastructure operational |
| **3** | P0 | Detox E2E framework setup, test DB seeding | E2E foundation ready |
| **4** | P1 | Component unit tests (scan, dashboard), utility tests | Frontend test coverage >50% |
| **5** | P1 | Backend unit tests (auth, GL estimation), API integration tests | Backend test coverage >60% |
| **6** | P1 | Rate limiting tests, auth API integration tests | Core API endpoints validated |
| **7** | P2 | Scan API + dashboard API integration tests | API integration suite complete |
| **8** | P2 | E2E scan flow test passes (iOS + Android) | Critical path validated |
| **10** | P3 | Load testing complete (500 concurrent users) | **BLK-014 partial** — Backend survives 5K MAU simulation |
| **11** | P3 | Database query optimization, OpenAI rate limit testing | Performance bottlenecks resolved |
| **13** | P3 | **Pre-launch QA gate (QA-030 — gate)**: Zero P0 bugs, all tests pass | **Week 13 gate** — Quality validated, ready to launch |
| **15** | P4 | Production smoke tests deployed, error monitoring active | **LAUNCH** — Production QA active |

---

## CRITICAL PATH (QA)

**Any slip here → launch slips:**

1. **Week 2:** QA-001 (Jest) + QA-002 (pytest) → test infrastructure operational
2. **Week 3:** QA-003 (Detox E2E) → E2E foundation ready
3. **Week 8:** QA-020 (E2E scan flow) → critical path validated
4. **Week 10:** QA-025 (load testing) → **BLK-014** partial
5. **Week 13:** QA-030 (**pre-launch QA gate — BLK-015**) → **GATE**
6. **Week 15:** QA-035 (production smoke tests) → **LAUNCH**

---

## SUCCESS METRICS (QA-Specific)

**Tracked via CI, Sentry, manual testing:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Unit test coverage (frontend)** | ≥70% | Jest coverage report (QA-001) |
| **Unit test coverage (backend)** | ≥80% | cargo-tarpaulin report (QA-002) |
| **E2E test pass rate** | 100% (critical paths) | Detox CI runs (QA-020) |
| **Load test P95 latency (scan)** | <2s | Artillery report (QA-025) |
| **Load test error rate** | <1% | Artillery report (QA-025) |
| **Production error rate (Week 15)** | <0.5% | Sentry dashboard (QA-036) |
| **P0 bugs in production (Month 1)** | 0 | Sentry + user reports |
| **Smoke test pass rate (post-deploy)** | 100% | CI smoke test logs (QA-035) |

---

## END OF QA/TESTING PLAN

**Version:** 1.0  
**Status:** ACTIVE  
**Next Review:** Week 2 end (2026-03-20)  
**Owner:** Person A (test infrastructure), Founder (manual testing)  
**Approver:** Founder

**This document is your quality assurance roadmap. QA is the stability enabler — if tests don't catch bugs before production, users will, and user trust erodes fast. Week 13 QA gate is non-negotiable: zero P0 bugs, all critical paths validated. If the gate fails, launch slips until quality is proven. Test early, test often, automate everything.**

