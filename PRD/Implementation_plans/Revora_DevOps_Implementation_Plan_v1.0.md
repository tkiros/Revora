> **Superseded for sequencing/positioning by `docs/implementation-plan-to-play.md` (coach-first, 2026-06-30).** Retained for reference; camera/CGM/BAI work is deferred.

<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# Revora DevOps Implementation Plan v1.1

**Domain:** DevOps & Infrastructure  
**Owner:** Person A (primary)  
**Stack:** GitHub Actions, Expo EAS Build, Railway.app, Cloudflare R2, PostgreSQL 16, Redis 7, Docker, Sentry, PostHog  
**Repo:** Monorepo (root-level infra configs, `.github/workflows/`, `docker-compose.yml`)  
**CI Files:** `.github/workflows/backend-ci.yml`, `.github/workflows/frontend-ci.yml`, `.github/workflows/e2e-ci.yml`  
**Last Updated:** 2026-03-15

### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Added: DO-042: Production deployment runbook (Week 14)
- Added: DO-043: Database backup strategy (Week 3)
- Updated: DO-007/DO-008 — CI compliance checks expanded to validate pricing constants

---

## DEVOPS MISSION

Own the foundation: repos, secrets, CI/CD, hosting, monitoring, backups, and scaling. Every backend feature and every mobile build depends on DevOps tasks completing first and staying operational. This is the **critical path enabler** — if DevOps slips, the entire project slips.

**Critical Success Factors:**
1. **Week 1: Foundation Complete** — Repos, secrets, Railway, R2, CI pipelines operational before any BE/FE code
2. **Zero Secrets in Git** — All keys in GitHub Secrets / Railway env vars, zero leaks tolerated
3. **BLK-012 Resolved by Week 2** — Expo camera spike complete, architecture decision documented
4. **BLK-014 Enforced by Week 3** — CI grep blocks reversal language in all PRs
5. **Load Test Gate Week 13** — All k6 scenarios pass or launch slips

---

## PHASE 0: FOUNDATION (Week 1)

### Repository & Environment Setup

**DO-001: GitHub Monorepo Structure Setup**  
**Effort:** [S] 2 hours  
**Week:** 1  
**Depends on:** None  
**Blocks:** DO-002, DO-003, DO-007, DO-008 (all CI tasks), BE-001, FE-001 (project init)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §6, PRD §7.1

**Acceptance:**
- GitHub repository `revora/revora` created
- Directory structure:
  backend/          ← Rust/Axum monolith
  mobile/           ← Expo React Native
  docs/             ← Specs, ADRs, runbooks
  prompts/          ← OpenAI prompt templates (versioned)
  migrations/       ← SQL migration files (sqlx)
  scripts/          ← Deploy, backup, testing scripts
  .github/
    workflows/      ← CI/CD pipelines
  docker-compose.yml ← Local dev environment
  README.md
  .gitignore
- `.gitignore` includes: `.env`, `.env.*`, `node_modules/`, `target/`, `*.log`, `*.key`, `*.pem`, Expo cache dirs
- `README.md` includes: project overview, setup instructions, architecture diagram link
- All team members have write access

**Implementation:**
# Initialize monorepo
git init revora
cd revora

mkdir -p backend mobile docs prompts migrations scripts .github/workflows

cat > .gitignore <<EOF
# Secrets
.env
.env.*
*.key
*.pem
secrets/

# Dependencies
node_modules/
target/

# Build outputs
*.log
dist/
build/
.expo/

# IDE
.vscode/
.idea/
EOF

cat > README.md <<EOF
# Revora

AI-powered meal scanning app for prediabetes GL management.

## Architecture
- **Backend:** Rust + Axum + PostgreSQL + Redis
- **Mobile:** React Native + Expo SDK 52
- **Infra:** Railway.app + Cloudflare R2

## Setup
See \`docs/SETUP.md\` for local development instructions.
EOF

git add .
git commit -m "Initial monorepo structure"
git remote add origin git@github.com:revora/revora.git
git push -u origin main

**Notes:**
- Use GitHub organization account (not personal) for team access control
- Enable branch protection on `main` in DO-002 before any code lands

---

**DO-002: Branch Protection Rules**  
**Effort:** [S] 1 hour  
**Week:** 1  
**Depends on:** DO-001  
**Blocks:** All future PRs  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §7.1

**Acceptance:**
- Branch protection enabled on `main`:
  - ☑ Require pull request before merging
  - ☑ Require 1 approval (solo: self-review checklist acceptable)
  - ☑ Require status checks to pass: `backend-ci`, `frontend-ci` (after DO-007, DO-008)
  - ☑ Require branches to be up to date before merging
  - ☑ Do not allow bypassing (even for admins)
- Direct pushes to `main` blocked
- Test: attempt direct push to `main` → rejected

**GitHub Settings Path:**  
`Settings → Branches → Branch protection rules → Add rule → Branch name pattern: main`

**Notes:**
- Solo founder: use PR self-review with mandatory checklist (create `.github/PULL_REQUEST_TEMPLATE.md`)
- If 2-person team: require 1 approval from other person

---

**DO-003: GitHub Secrets Configuration**  
**Effort:** [M] 4 hours  
**Week:** 1  
**Depends on:** DO-001, DO-005 (Railway provisioning), DO-006 (R2 setup)  
**Blocks:** DO-007 (backend CI needs `RAILWAY_TOKEN`), DO-008 (frontend CI needs EAS secrets), BLK-002 (OpenAI key)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-009), §9.2 (SC-001 through SC-004)

**Acceptance:**
- All secrets configured in GitHub Actions Secrets (`Settings → Secrets and variables → Actions`):
  - `OPENAI_API_KEY` (from OpenAI console after SC-001 DPA executed)
  - `RAILWAY_TOKEN` (from Railway.app project settings)
  - `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY` (from R2 bucket)
  - `REVENUECAT_SECRET_KEY` (from RevenueCat project settings after SC-003 DPA)
  - `DATABASE_URL` (from Railway PostgreSQL connection string)
  - `REDIS_URL` (from Railway Redis connection string)
  - `JWT_SECRET` (generate 64-char random: `openssl rand -hex 64`)
  - `A1C_ENCRYPTION_KEY` (generate 32-byte key: `openssl rand -hex 32`)
  - `SENTRY_DSN_BACKEND`, `SENTRY_DSN_FRONTEND` (from Sentry project settings after DO-012)
  - `POSTHOG_API_KEY` (from PostHog project settings after SC-004 DPA)
  - `EXPO_TOKEN` (from Expo dashboard for EAS Build)
- **Zero secrets committed to git** — verified with:
  git log --all --full-history -- "*secret*" "*key*" "*.env"  # returns empty
- All secrets documented in `docs/SECRETS.md` (key names only, not values)

**Implementation:**
# Generate secrets
export JWT_SECRET=$(openssl rand -hex 64)
export A1C_ENCRYPTION_KEY=$(openssl rand -hex 32)

echo "JWT_SECRET=$JWT_SECRET"
echo "A1C_ENCRYPTION_KEY=$A1C_ENCRYPTION_KEY"

# Add to GitHub via UI or gh CLI
gh secret set JWT_SECRET --body "$JWT_SECRET"
gh secret set A1C_ENCRYPTION_KEY --body "$A1C_ENCRYPTION_KEY"
# ... repeat for all secrets

**Security Checklist:**
- [ ] Secrets stored in GitHub Secrets (encrypted at rest)
- [ ] Secrets never logged in CI output (GitHub auto-masks secret values)
- [ ] Secrets never in `.env` files committed to git
- [ ] Secrets rotation procedure documented in `docs/SECRETS.md`

**Notes:**
- `JWT_SECRET`: Used for signing access tokens (BE-020)
- `A1C_ENCRYPTION_KEY`: Used for application-layer A1C encryption (BE-053)
- Railway secrets: Also set in Railway dashboard for runtime access
- **BLK-002 dependency**: `OPENAI_API_KEY` cannot be set until DPA executed (SC-001 complete)

---

**DO-004: .env.example Template**  
**Effort:** [S] 1 hour  
**Week:** 1  
**Depends on:** DO-001  
**Blocks:** BE-002 (backend env config), FE-005 (frontend API client)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §5 (environment variables)

**Acceptance:**
- `.env.example` file created in `backend/` and `mobile/` with all required variables documented
- **No actual secret values** — only placeholder text
- `.env` in `.gitignore` (confirmed in DO-001)
- Instructions in `README.md`: `cp backend/.env.example backend/.env` and fill values

**backend/.env.example:**
# Backend Environment Variables
# Copy to .env and fill with actual values

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/revora

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...

# Cloudflare R2
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=revora-photos
CLOUDFLARE_R2_ENDPOINT=https://...r2.cloudflarestorage.com

# Authentication
JWT_SECRET=generate-with-openssl-rand-hex-64
JWT_EXPIRY_SECONDS=900

# A1C Encryption
A1C_ENCRYPTION_KEY=generate-with-openssl-rand-hex-32

# RevenueCat
REVENUECAT_WEBHOOK_SECRET=...

# Observability
SENTRY_DSN=https://...@sentry.io/...
POSTHOG_API_KEY=...

# Environment
ENVIRONMENT=development  # development | staging | production
LOG_LEVEL=debug          # debug | info | warn | error

**mobile/.env.example:**
# Mobile Environment Variables
# Copy to .env and fill with actual values

EXPO_PUBLIC_API_URL=http://localhost:3000  # Backend API base URL
EXPO_PUBLIC_SENTRY_DSN=...
EXPO_PUBLIC_POSTHOG_KEY=...
EXPO_PUBLIC_REVENUECAT_API_KEY=...
EXPO_PUBLIC_ENV=development

**Notes:**
- `EXPO_PUBLIC_*` prefix required for Expo to bundle vars into app
- Separate `.env` files for `development`, `staging`, `production` managed via Railway env groups (DO-005)

---

**DO-005: Railway.app Project Setup**  
**Effort:** [M] 5 hours  
**Week:** 1  
**Depends on:** None  
**Blocks:** DO-003 (secrets need Railway URLs), DO-018 (env var injection per profile), BE-006 (DB migrations), BE-018 (Redis connection)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §3.2 (INF-001, INF-002, INF-003), PRD §10

**Acceptance:**
- Railway.app account created, billing configured (credit card, $20/month budget alert)
- Two Railway projects created:
  1. **revora-staging** (for dev/preview)
  2. **revora-production** (for prod)
- Each project has:
  - PostgreSQL 16 database provisioned (Railway Postgres plugin)
  - Redis 7 cache provisioned (Railway Redis plugin)
  - Backend service placeholder (GitHub deployment configured, deploys from `main` branch auto)
- Connection strings obtained:
  - `DATABASE_URL` (PostgreSQL)
  - `REDIS_URL` (Redis)
- Environment variable groups configured:
  - **Staging**: `ENVIRONMENT=staging`, `LOG_LEVEL=debug`, `API_BASE_URL=https://api-staging.revora.app`
  - **Production**: `ENVIRONMENT=production`, `LOG_LEVEL=info`, `API_BASE_URL=https://api.revora.app`
- Custom domains configured:
  - `api-staging.revora.app` → Railway staging project
  - `api.revora.app` → Railway production project (Week 15)
- Auto-deploy enabled: push to `main` → redeploy staging, manual trigger for production

**Railway.app UI Steps:**
1. New Project → Deploy from GitHub → select `revora/revora` repo
2. Add PostgreSQL plugin → note connection string
3. Add Redis plugin → note connection string
4. Add environment variables from DO-004 list (excluding secrets — add those in GitHub Secrets)
5. Set start command: `cd backend && cargo run --release`
6. Configure custom domain → add DNS CNAME

**DNS Configuration (Cloudflare or domain registrar):**
CNAME  api-staging  <railway-staging-url>.railway.app
CNAME  api          <railway-production-url>.railway.app  # Week 15

**Test:**
# After backend deployed (Week 2+)
curl https://api-staging.revora.app/health
# Expected: {"status":"ok"}

**Notes:**
- Free tier: Railway offers $5 credit/month — sufficient for initial dev, upgrade to Hobby ($20/month) by Week 3
- Auto-scaling: enabled at DO-031 (CPU-based)
- Migration to Fly.io documented at DO-038 (trigger: 5K MAU or capacity limit)

---

**DO-006: Cloudflare R2 Bucket Setup**  
**Effort:** [M] 4 hours  
**Week:** 1  
**Depends on:** None (SC-002 DPA can be parallel)  
**Blocks:** DO-003 (R2 keys needed for GitHub Secrets), BE-035 (R2 upload), DO-022 (lifecycle rules)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §3.3 (SVC-003), §4.3 (meal photos storage), SEC-005

**Acceptance:**
- Cloudflare account created, R2 enabled
- Private bucket created: `revora-photos`
- CORS policy configured:
  - Allowed origins: `https://api.revora.app`, `https://api-staging.revora.app` (no wildcards)
  - Allowed methods: `GET`, `PUT`
  - Allowed headers: `Content-Type`, `Authorization`
- **Public access BLOCKED** — bucket is private, signed URLs only (SEC-005)
- R2 access credentials generated:
  - `CLOUDFLARE_R2_ACCESS_KEY_ID`
  - `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- Lifecycle rules configured (DO-022 — Week 2):
  - Delete objects with prefix `full/` after 90 days
  - Delete objects with prefix `temp/` after 1 hour
- Test: attempt unsigned access → 403

**Cloudflare R2 Dashboard Steps:**
1. R2 → Create Bucket → Name: `revora-photos`, Location: Auto
2. Settings → CORS Policy:
   [
     {
       "AllowedOrigins": ["https://api.revora.app", "https://api-staging.revora.app"],
       "AllowedMethods": ["GET", "PUT"],
       "AllowedHeaders": ["Content-Type", "Authorization"],
       "MaxAgeSeconds": 3600
     }
   ]
3. API Tokens → Create API Token → Permissions: Object Read & Write → Copy keys
4. Settings → Public Access: **Disabled**

**Security Verification:**
# Unsigned access should fail
curl https://<account-id>.r2.cloudflarestorage.com/revora-photos/test.jpg
# Expected: 403 Forbidden [REVIEW NEEDED: Replace restriction-framing with permission-first language]

**Notes:**
- Signed URLs generated server-side (BE-035) with 1-hour expiry
- Cost: $0.015/GB/month storage, zero egress fees (R2's key advantage over S3)
- Expected cost at 5K MAU: ~$5/month (assuming 100MB/user average)

---

### CI/CD Pipeline Setup

**DO-007: Backend CI Pipeline**  
**Effort:** [M] 6 hours  
**Week:** 1  
**Depends on:** DO-001, DO-002, DO-003 (needs secrets)  
**Blocks:** BE-001 (backend code can't merge without passing CI), BLK-014 (reversal grep)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §7.1, §11.4 (BLK-014 reversal grep)

**Acceptance:**
- `.github/workflows/backend-ci.yml` created
- CI runs on: push to `main`, pull request to `main`
- CI steps (all must pass):
  1. `cargo fmt --check` — code formatting enforced
  2. `cargo clippy -- -D warnings` — lints fail build
  3. `cargo test --all-features` — all tests pass
  4. `cargo build --release` — release build succeeds
  5. `cargo tarpaulin --out Xml --output-dir coverage` — 80% coverage gate enforced
  6. **Reversal language grep** — `grep -rn "reversal\|reverse\|cure\|treat" backend/src/` fails build if match found (BLK-014)
- Coverage report uploaded to Codecov or displayed in PR comment
- CI completes in <10 minutes (caching enabled)
- Badge in `README.md`: `![Backend CI](https://github.com/revora/revora/workflows/Backend%20CI/badge.svg)`

**Implementation (.github/workflows/backend-ci.yml):**
name: Backend CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  CARGO_TERM_COLOR: always

jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend

    steps:
      - uses: actions/checkout@v4

      - name: Install Rust toolchain
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          profile: minimal
          components: rustfmt, clippy
          override: true

      - name: Cache cargo registry
        uses: actions/cache@v3
        with:
          path: ~/.cargo/registry
          key: ${{ runner.os }}-cargo-registry-${{ hashFiles('**/Cargo.lock') }}

      - name: Cache cargo build
        uses: actions/cache@v3
        with:
          path: backend/target
          key: ${{ runner.os }}-cargo-build-${{ hashFiles('**/Cargo.lock') }}

      - name: Check formatting
        run: cargo fmt --check

      - name: Clippy lints
        run: cargo clippy -- -D warnings

      - name: Run tests
        run: cargo test --all-features
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret-key-do-not-use-in-production

      - name: Build release
        run: cargo build --release

      - name: Install tarpaulin
        run: cargo install cargo-tarpaulin

      - name: Generate coverage
        run: cargo tarpaulin --out Xml --output-dir coverage --all-features --line --ignore-tests

      - name: Check coverage threshold
        run: |
          COVERAGE=$(grep -oP 'line-rate="\K[^"]+' coverage/cobertura.xml | head -1)
          COVERAGE_PERCENT=$(echo "$COVERAGE * 100" | bc)
          echo "Coverage: ${COVERAGE_PERCENT}%"
          if (( $(echo "$COVERAGE_PERCENT < 80" | bc -l) )); then
            echo "Coverage ${COVERAGE_PERCENT}% is below 80% threshold"
            exit 1
          fi

      - name: Reversal language check (BLK-014)
        run: |
          if grep -rn "reversal\|reverse\|cure\|treat" src/; then
            echo "ERROR: Prohibited health claims language detected"
            echo "The following matches were found:"
            grep -rn "reversal\|reverse\|cure\|treat" src/ || true
            exit 1
          fi
          echo "✓ No prohibited language detected"

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/cobertura.xml
          flags: backend

**Notes:**
- Reversal grep: ignores comments with code context to allow technical discussion (e.g., "reverse proxy"), but flags any user-facing strings
- Coverage: 80% enforced per SPEC, build fails below
- Test DB: uses ephemeral PostgreSQL container in CI (add service in workflow if needed)

---

**DO-008: Frontend CI Pipeline**  
**Effort:** [M] 6 hours  
**Week:** 1  
**Depends on:** DO-001, DO-002, DO-003  
**Blocks:** FE-001 (frontend code can't merge without passing CI), BLK-014 (reversal grep)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §7.1, §11.4

**Acceptance:**
- `.github/workflows/frontend-ci.yml` created
- CI runs on: push to `main`, pull request to `main`
- CI steps (all must pass):
  1. `npm ci` — clean install
  2. `npx eslint .` — lint checks pass
  3. `npx tsc --noEmit` — TypeScript type checks pass
  4. `npx jest --coverage --coverageThreshold='{"global":{"lines":70}}'` — 70% coverage enforced
  5. `npx expo export --platform all` — app exports successfully (build validation)
  6. **Reversal language grep** — `grep -rn "reversal\|reverse\|cure\|treat" mobile/src/` fails if match
  7. **i18next lint** — `npx eslint . --rule 'i18next/no-literal-string: error'` ensures all strings externalized
- CI completes in <8 minutes
- Badge in `README.md`

**Implementation (.github/workflows/frontend-ci.yml):**
name: Frontend CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./mobile

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: mobile/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: ESLint
        run: npx eslint .

      - name: TypeScript type check
        run: npx tsc --noEmit

      - name: Run tests with coverage
        run: npx jest --coverage --coverageThreshold='{"global":{"lines":70}}'

      - name: Expo export validation
        run: npx expo export --platform all

      - name: Reversal language check (BLK-014)
        run: |
          if grep -rn "reversal\|reverse\|cure\|treat" src/; then
            echo "ERROR: Prohibited health claims language detected"
            grep -rn "reversal\|reverse\|cure\|treat" src/ || true
            exit 1
          fi
          echo "✓ No prohibited language detected"

      - name: i18next string externalization check
        run: |
          # Check for hard-coded strings in JSX
          if npx eslint . --rule 'i18next/no-literal-string: error' --quiet; then
            echo "✓ All strings externalized"
          else
            echo "ERROR: Hard-coded strings found in JSX"
            exit 1
          fi

**Notes:**
- Coverage: 70% enforced per SPEC (lower than backend due to UI component testing difficulty)
- Expo export: validates app can build, doesn't run full EAS Build (that's in DO-015)

---

**DO-009: E2E Test Pipeline (Placeholder)**  
**Effort:** [S] 2 hours  
**Week:** 1 (scaffold), Week 8 (full implementation)  
**Depends on:** DO-001, DO-007, DO-008  
**Blocks:** None (not required for merge until Week 13)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §7.1, §7.3

**Acceptance (Week 1 scaffold):**
- `.github/workflows/e2e-ci.yml` created with placeholder
- Workflow disabled initially (manual trigger only)
- README note: "E2E tests implemented Week 8"

**Acceptance (Week 8 full implementation):**
- E2E workflow runs on PR to `main` (required for merge)
- Steps:
  1. Start backend in test mode (`cargo run --features test-mode`)
  2. Start Expo dev server
  3. Run Detox tests (iOS simulator) or Maestro tests
  4. Screenshot regression comparison
- Critical paths tested:
  - Onboarding → first scan → dashboard update
  - Guest mode → 3 scans → conversion → data preserved
  - Free tier scan limit → paywall trigger
  - Premium unlock → advice cards visible
  - GDPR export → download available
- CI completes in <15 minutes
- Week 13: required check for all PRs

**Implementation (.github/workflows/e2e-ci.yml — Week 1 scaffold):**
name: E2E Tests

on:
  workflow_dispatch:  # Manual trigger only for now
  # pull_request:     # Enable Week 8
  #   branches: [main]

jobs:
  e2e:
    runs-on: macos-latest  # iOS simulator
    steps:
      - uses: actions/checkout@v4
      - name: Placeholder
        run: echo "E2E tests to be implemented Week 8"

**Notes:**
- Detox (React Native E2E framework) or Maestro (cloud device testing) — decision Week 7
- Week 13 gate: E2E tests must pass before beta launch

---

**DO-010: Dependency Security Scanning**  
**Effort:** [S] 2 hours  
**Week:** 1  
**Depends on:** DO-001  
**Blocks:** None (runs in background)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §7.1

**Acceptance:**
- GitHub Dependabot alerts enabled: `Settings → Security → Dependabot alerts → Enable`
- Dependabot security updates enabled: auto-creates PRs for vulnerabilities
- Backend: `cargo audit` added to CI (runs after `cargo test`)
- Frontend: `npm audit` added to CI (runs after `npm ci`)
- Alert notifications configured: email to Person A on Critical/High vulnerabilities
- Test: introduce known vulnerable dependency → Dependabot alert appears within 24 hours

**Backend CI addition (in DO-007 workflow):**
      - name: Cargo audit
        run: cargo install cargo-audit && cargo audit

**Frontend CI addition (in DO-008 workflow):**
      - name: NPM audit
        run: npm audit --audit-level=high

**Notes:**
- Fails build on High/Critical vulnerabilities — team must address before merge
- Medium/Low vulnerabilities: warning only, can defer to weekly review

---

**DO-011: OWASP ZAP Automated Scan**  
**Effort:** [M] 4 hours  
**Week:** 1 (setup), Monthly runs start Week 3  
**Depends on:** DO-005 (needs staging URL)  
**Blocks:** None (non-blocking scan)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §11.3, §9.2 (SC-024 penetration test prep)

**Acceptance:**
- OWASP ZAP Docker image configured in CI
- Monthly workflow `.github/workflows/owasp-scan.yml`:
  - Runs ZAP baseline scan against `https://api-staging.revora.app`
  - Generates HTML report
  - **Fails build on Critical/High findings** (blocks deploy to production)
  - Uploads report as CI artifact
- First scan: Week 3 (after backend deployed)
- Monthly schedule: 1st of each month at 2 AM UTC

**Implementation (.github/workflows/owasp-scan.yml):**
name: OWASP ZAP Security Scan

on:
  schedule:
    - cron: '0 2 1 * *'  # Monthly: 1st day at 2 AM UTC
  workflow_dispatch:

jobs:
  zap_scan:
    runs-on: ubuntu-latest
    steps:
      - name: ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'https://api-staging.revora.app'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'

      - name: Upload ZAP Report
        uses: actions/upload-artifact@v3
        with:
          name: zap-report
          path: report_html.html

      - name: Check for Critical/High findings
        run: |
          if grep -E "FAIL-NEW|FAIL-INPROG" report_html.html; then
            echo "Critical or High vulnerabilities detected"
            exit 1
          fi

**Notes:**
- Week 3: first manual run after backend deployed
- SC-024 (Week 13): professional penetration test supersedes automated scan for launch gate
- ZAP findings inform pen test scope (SC-025)

---

### Monitoring Setup

**DO-012: Sentry Configuration**  
**Effort:** [M] 5 hours  
**Week:** 1  
**Depends on:** DO-001, DO-005 (backend deployed to get traffic)  
**Blocks:** BE-003 (logging integration), FE-009 (frontend Sentry)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §3.2 (INF-007), §2.3 (PER-009 crash-free rate)

**Acceptance:**
- Sentry account created, two projects:
  1. **revora-backend** (Rust SDK)
  2. **revora-frontend** (React Native SDK)
- DSNs obtained and stored in GitHub Secrets (DO-003): `SENTRY_DSN_BACKEND`, `SENTRY_DSN_FRONTEND`
- Backend integration:
  - `sentry` crate added to `Cargo.toml`
  - `sentry::init()` in `main.rs` with `environment` tag (staging/production)
  - **Session replay: DISABLED** (health data privacy — SPEC INF-007)
  - Source maps uploaded: not applicable for Rust (native binary)
- Frontend integration:
  - `@sentry/react-native` installed
  - `Sentry.init()` in `app/_layout.tsx` with DSN from env var
  - **Session replay: DISABLED** (privacy)
  - Source maps uploaded on each EAS build (configured in `eas.json`)
- Test error sent from both backend and frontend → appears in Sentry dashboard
- Alert configured: email Person A on new error
- Crash-free rate dashboard created

**Backend Integration (backend/src/main.rs):**
use sentry;

#[tokio::main]
async fn main() {
    let _guard = sentry::init((
        std::env::var("SENTRY_DSN").expect("SENTRY_DSN must be set"),
        sentry::ClientOptions {
            release: Some(env!("CARGO_PKG_VERSION").into()),
            environment: Some(std::env::var("ENVIRONMENT").unwrap_or_else(|_| "development".into()).into()),
            session_mode: sentry::SessionMode::Request,  // Track sessions, not replays
            ..Default::default()
        },
    ));

    // Rest of app initialization...
}

**Frontend Integration (mobile/app/_layout.tsx):**
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableSessionReplay: false,  // DISABLED — health data privacy (SPEC INF-007)
  tracesSampleRate: 0.1,
  environment: process.env.EXPO_PUBLIC_ENV ?? 'development',
});

**Source Maps (mobile/eas.json):**
{
  "build": {
    "production": {
      "env": {
        "SENTRY_ORG": "revora",
        "SENTRY_PROJECT": "revora-frontend"
      },
      "postBuildHook": "sentry-expo-upload-sourcemaps"
    }
  }
}

**Notes:**
- Session replay disabled: prevents recording of sensitive health data (A1C values, meal photos)
- Crash-free rate target: ≥99.5% (SPEC PER-009, VAL-027)
- Week 15 launch gate: VAL-027 verified via Sentry dashboard

---

**DO-013: Railway.app Health Check Monitoring**  
**Effort:** [S] 2 hours  
**Week:** 1 (config), Week 2 (active after backend deployed)  
**Depends on:** DO-005, BE-001 (health endpoint must exist)  
**Blocks:** None  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §3.2

**Acceptance:**
- Railway health check configured:
  - Endpoint: `GET /health`
  - Interval: 30 seconds
  - Timeout: 5 seconds
  - Unhealthy threshold: 3 consecutive failures
- Railway restart policy: auto-restart on 3 consecutive failures
- Alert configured: email Person A on health check failure
- Test: stop backend process → Railway detects failure and restarts within 2 minutes

**Railway Dashboard Steps:**
1. Project Settings → Service → Health Check
2. Path: `/health`
3. Interval: 30s
4. Restart on failure: enabled
5. Alert: email on failure

**Backend Health Endpoint (BE-001 implements):**
// backend/src/routes/health.rs
async fn health() -> impl IntoResponse {
    Json(json!({
        "status": "ok",
        "timestamp": chrono::Utc::now().to_rfc3339(),
    }))
}

**Notes:**
- Health endpoint checks: app is running (doesn't check DB/Redis connectivity — that's in BE-006/BE-018)
- Railway auto-restart: typically <30 seconds from failure detection to new instance live

---

**DO-014: Uptime Monitoring (BetterUptime)**  
**Effort:** [S] 2 hours  
**Week:** 1 (setup), Week 2 (active)  
**Depends on:** DO-005 (staging URL), BE-001 (health endpoint)  
**Blocks:** None  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.3 (PER-008: 99.5% uptime target)

**Acceptance:**
- BetterUptime (or UptimeRobot) free tier account created
- Monitor configured:
  - URL: `https://api-staging.revora.app/health`
  - Interval: 60 seconds
  - Locations: 3 geographic regions (US, EU, Asia)
  - Alert threshold: 2-minute downtime (2 consecutive failures)
- Alert channels:
  - Email: Person A
  - SMS: Person A (optional, for production)
- Public status page: `https://status.revora.app` (optional, Week 15)
- Test: stop backend → alert received within 3 minutes

**BetterUptime Setup:**
1. Sign up at betteruptime.com (free tier: 10 monitors, 60s interval)
2. New Monitor → HTTP → URL: `https://api-staging.revora.app/health`
3. Expected status code: 200
4. Check frequency: 60 seconds
5. Alert policy: Email after 2 minutes downtime
6. Repeat for production URL (Week 15)

**Notes:**
- 99.5% uptime = max 3.6 hours downtime/month
- Week 15: production monitoring active, public status page optional

---

## PHASE 1: DEPLOYMENT & OPERATIONS (Weeks 2–8)

### EAS Build Configuration

**DO-015: EAS Build Setup**  
**Effort:** [M] 5 hours  
**Week:** 2  
**Depends on:** FE-001 (Expo project initialized), DO-003 (EXPO_TOKEN secret)  
**Blocks:** DO-016, DO-017, FE-066 (TestFlight), FE-082 (production submit)  
**Owner:** Person A (setup), Person B (builds)  
**SPEC/PRD Reference:** SPEC §7.1, PRD §11.3

**Acceptance:**
- `mobile/eas.json` created with 3 build profiles:
  1. **development** — internal development builds
  2. **preview** — internal testing (TestFlight, Play Internal Testing)
  3. **production** — App Store / Play Store release
- Build numbers auto-increment on each build
- Environment variables per profile:
  - `development` / `preview`: `EXPO_PUBLIC_API_URL=https://api-staging.revora.app`
  - `production`: `EXPO_PUBLIC_API_URL=https://api.revora.app`
- iOS bundle ID: `com.revora.app`
- Android package: `com.revora.app`
- `eas build --profile development --platform all` succeeds
- QR code generated for device installation

**Implementation (mobile/eas.json):**
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api-staging.revora.app",
        "EXPO_PUBLIC_ENV": "development"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api-staging.revora.app",
        "EXPO_PUBLIC_ENV": "staging"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.revora.app",
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "internal"
      }
    }
  }
}

**EAS CLI Commands:**
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
cd mobile
eas build:configure

# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Install on device via QR code

**Notes:**
- `developmentClient: true` — enables hot reload, debugging (development profile only)
- Cost: Expo EAS Build free tier (limited builds/month), upgrade to $29/month at Week 3
- Week 2 gate: development builds work on physical devices (BLK-012 Expo camera spike depends on this)

---

**DO-016: EAS Submit Configuration**  
**Effort:** [S] 3 hours  
**Week:** 2  
**Depends on:** DO-015  
**Blocks:** FE-066 (TestFlight upload), FE-082 (production submit)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §7.1

**Acceptance:**
- App Store Connect account configured:
  - Apple Developer account ($99/year)
  - App created: "Revora" with bundle ID `com.revora.app`
  - App Store Connect API key generated (for `eas submit`)
- Google Play Console account configured:
  - Google Play Developer account ($25 one-time)
  - App created: "Revora" with package `com.revora.app`
  - Service Account JSON key generated
- `mobile/google-play-key.json` stored securely (NOT in git — in GitHub Secrets as base64-encoded string)
- `eas.json` submit section configured (see DO-015)
- Test: `eas build --profile preview` → `eas submit --profile production --platform ios` uploads to App Store Connect

**App Store Connect Setup:**
1. developer.apple.com → Certificates, Identifiers & Profiles
2. Register App ID: `com.revora.app`
3. App Store Connect → My Apps → New App → iOS → "Revora"
4. Users and Access → Keys → Create API Key → Download `.p8` file
5. Note: Key ID, Issuer ID (for EAS)

**Google Play Console Setup:**
1. play.google.com/console → Create App → "Revora"
2. API Access → Create Service Account (Google Cloud Console)
3. Grant "Release Manager" role
4. Create JSON key → Download
5. Base64 encode: `base64 google-play-key.json > google-play-key.b64`
6. Store in GitHub Secret: `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY`

**Notes:**
- Week 13: TestFlight/Play Internal Testing configured (FE-066)
- Week 15: Production submit (FE-082)

---

**DO-017: Development Build Distribution**  
**Effort:** [S] 2 hours  
**Week:** 2  
**Depends on:** DO-015  
**Blocks:** BE-028 (Expo camera spike needs physical device testing), FE-028 (camera screen)  
**Owner:** Person A  
**SPEC/PRD Reference:** BLK-012

**Acceptance:**
- Development builds distributed via QR code (EAS Build output)
- Installation on physical devices:
  - iOS: 2 devices (Person A, Person B iPhones)
  - Android: 2 devices (Person A, Person B Android phones)
- Build installs successfully, app launches
- Expo Dev Tools accessible for hot reload

**Distribution Steps:**
# Build for iOS
eas build --profile development --platform ios

# EAS outputs QR code
# Scan QR with phone camera → installs build

# Repeat for Android
eas build --profile development --platform android

**Notes:**
- Critical for BLK-012 (Expo camera spike): need physical devices to test camera overlay
- Development builds expire after 30 days — rebuild as needed

---

**DO-018: Environment Variable Injection Per Profile**  
**Effort:** [S] 2 hours  
**Week:** 2  
**Depends on:** DO-015, DO-005 (Railway envs)  
**Blocks:** None (enables environment-specific configs)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §5

**Acceptance:**
- `eas.json` profiles inject correct env vars per environment (already configured in DO-015)
- Backend: Railway environment groups configured (already in DO-005)
- Verification:
  - Development build: `console.log(process.env.EXPO_PUBLIC_API_URL)` → `https://api-staging.revora.app`
  - Production build: same log → `https://api.revora.app`
- Backend staging: `echo $ENVIRONMENT` → `staging`
- Backend production: `echo $ENVIRONMENT` → `production`

**Test Script (mobile/scripts/verify-env.ts):**
console.log('Environment:', process.env.EXPO_PUBLIC_ENV);
console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('Sentry DSN:', process.env.EXPO_PUBLIC_SENTRY_DSN ? 'Set' : 'Missing');
console.log('PostHog Key:', process.env.EXPO_PUBLIC_POSTHOG_KEY ? 'Set' : 'Missing');

**Notes:**
- Ensures no accidental production API calls from dev builds
- Week 15: production environment fully isolated

---

### Database Operations

**DO-019: Railway PostgreSQL Backup Policy**  
**Effort:** [S] 2 hours  
**Week:** 2  
**Depends on:** DO-005 (Railway PostgreSQL provisioned)  
**Blocks:** None (safety net)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.4 (data retention)

**Acceptance:**
- Railway automated backups enabled:
  - Frequency: Daily at 2 AM UTC
  - Retention: 7 days
- Backup verification: test restore procedure
  - Week 4: restore backup to test database
  - Verify data integrity (row counts match)
- Backup monitoring: weekly check that backups are succeeding
- Documented restore procedure in `docs/RUNBOOKS.md`

**Railway Dashboard Steps:**
1. Project → PostgreSQL → Settings → Backups
2. Enable automated backups: Daily, 2 AM UTC, 7-day retention
3. Test restore: Backups tab → Select backup → Restore to new service

**Restore Procedure (docs/RUNBOOKS.md):**
# Emergency restore procedure

## 1. Identify backup
railway project list
railway service logs postgresql  # Find last good timestamp

## 2. Create new database from backup
# Railway Dashboard → PostgreSQL → Backups → Restore

## 3. Update DATABASE_URL in Railway env vars

## 4. Restart backend service
railway service restart backend

## 5. Verify data integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

**Notes:**
- Week 4 test: validates restore procedure works before critical data exists
- Production: consider 30-day retention (Hobby plan)

---

**DO-020: Migration Deployment Procedure**  
**Effort:** [S] 2 hours  
**Week:** 2  
**Depends on:** BE-006 (sqlx-cli setup), DO-005 (Railway database)  
**Blocks:** All future migrations  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §4.3 (database schema)

**Acceptance:**
- Migrations run automatically on Railway deploy via start command
- Start command in Railway: `cd backend && sqlx migrate run && cargo run --release`
- Migrations are idempotent (re-running same migration is safe)
- Rollback procedure documented:
  - Create new migration file with `DOWN` logic
  - Never modify existing migrations
- Test: deploy with new migration → migration applies, app starts
- Migration log stored: Railway logs show `Applied migration 0001_users.sql`

**Railway Start Command Configuration:**
cd backend && sqlx database create || true && sqlx migrate run && cargo run --release

**Rollback Procedure (docs/RUNBOOKS.md):**
## Rolling Back a Migration

**NEVER modify existing migration files.** Instead:

1. Create a new migration that reverses changes:
   sqlx migrate add revert_feature_x

2. Write SQL to undo previous migration:
   -- migrations/XXXXXX_revert_feature_x.sql
   DROP TABLE IF EXISTS new_table;
   ALTER TABLE users DROP COLUMN IF EXISTS new_column;

3. Deploy new migration via normal process

Expected downtime: 0 (new migration applies, RLS policies prevent data access until rollback complete)

**Notes:**
- Idempotency: `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`
- Week 4 test: deploy with breaking migration → rollback → verify data intact

---

**DO-021: Database Connection String Rotation Procedure**  
**Effort:** [S] 2 hours  
**Week:** 2  
**Depends on:** DO-005 (Railway database)  
**Blocks:** None (documented procedure for emergencies)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-004)

**Acceptance:**
- Connection string rotation procedure documented in `docs/RUNBOOKS.md`
- Steps tested in staging:
  1. Generate new connection string (Railway → PostgreSQL → Settings → Reset Password)
  2. Update `DATABASE_URL` in Railway env vars
  3. Restart backend service
  4. Verify connectivity: health check returns 200
- Expected downtime: 0 (Railway restarts with graceful connection pool drain)
- Test: rotate staging DB password → backend reconnects without downtime

**Rotation Procedure (docs/RUNBOOKS.md):**
## Rotating Database Connection String

When: Suspected credential compromise, annual rotation, security audit requirement

1. **Generate new credentials**
   - Railway Dashboard → PostgreSQL → Settings → Reset Password
   - Copy new `DATABASE_URL`

2. **Update Railway environment variable**
   railway variables set DATABASE_URL="postgresql://..."

3. **Restart backend service**
   railway service restart backend

4. **Verify connectivity**
   curl https://api-staging.revora.app/health
   # Expected: {"status":"ok"}

5. **Monitor logs for connection errors**
   railway logs backend --tail

Expected downtime: <30 seconds (connection pool drain + restart)

**Notes:**
- Connection pool in backend (BE-017) handles graceful drain
- Test in staging before production rotation

---

### Cloudflare R2 Operations

**DO-022: R2 Lifecycle Rules**  
**Effort:** [S] 2 hours  
**Week:** 2  
**Depends on:** DO-006 (R2 bucket created)  
**Blocks:** None (cost optimization)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.4 (data retention)

**Acceptance:**
- R2 lifecycle rules configured:
  1. **Full-res photos**: Delete objects with prefix `full/` after 90 days
  2. **Temp uploads**: Delete objects with prefix `temp/` after 1 hour
- Thumbnails (prefix `thumb/`): retained indefinitely
- Rules active before first production scan (Week 15)
- Test: upload test object with prefix `temp/test.jpg` → verify deletion after 1 hour

**Cloudflare R2 Dashboard Steps:**
1. R2 → `revora-photos` bucket → Lifecycle Rules
2. Add Rule: "Delete full-res after 90 days"
   - Filter: Prefix `full/`
   - Action: Delete
   - Days: 90
3. Add Rule: "Delete temp uploads after 1 hour"
   - Filter: Prefix `temp/`
   - Action: Delete
   - Days: 0.042 (1 hour = 1/24 day)
4. Save rules

**Verification Script:**
# Upload test object
aws s3 cp test.jpg s3://revora-photos/temp/test.jpg \
  --endpoint-url https://<account-id>.r2.cloudflarestorage.com

# Check after 1 hour
aws s3 ls s3://revora-photos/temp/ \
  --endpoint-url https://<account-id>.r2.cloudflarestorage.com
# Expected: empty (object deleted)

**Notes:**
- Thumbnails retained indefinitely for meal history UI
- Full-res deletion coordinated with BE-068 (background cleanup job sets `image_url_full = NULL` in DB)

---

**DO-023: R2 Signed URL Generation Testing**  
**Effort:** [S] 2 hours  
**Week:** 3  
**Depends on:** DO-006, BE-035 (signed URL generation implemented)  
**Blocks:** None (security validation)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-005)

**Acceptance:**
- Signed URL generation tested:
  - Generate URL with 1-hour expiry
  - Access URL within 1 hour → 200 (image loads)
  - Wait 61 minutes → access URL → 403 (expired)
- Unsigned URL access tested:
  - Direct bucket URL (no signature) → 403 (blocked)
- Test cases documented in `backend/tests/r2_signed_urls.rs`

**Test Script (backend/tests/r2_signed_urls.rs):**
#[tokio::test]
async fn test_signed_url_expiry() {
    let url = generate_signed_url("test.jpg", 3600).await;  // 1 hour
    
    // Access immediately — should work
    let resp = reqwest::get(&url).await.unwrap();
    assert_eq!(resp.status(), 200);
    
    // Wait 61 minutes — should fail
    tokio::time::sleep(Duration::from_secs(3660)).await;
    let resp = reqwest::get(&url).await.unwrap();
    assert_eq!(resp.status(), 403);
}

#[tokio::test]
async fn test_unsigned_access_blocked() {
    let unsigned_url = "https://<account-id>.r2.cloudflarestorage.com/revora-photos/test.jpg";
    let resp = reqwest::get(unsigned_url).await.unwrap();
    assert_eq!(resp.status(), 403);
}

**Notes:**
- 1-hour expiry balances security (short-lived) vs. UX (user has time to view result)
- Week 5: first real scans generate signed URLs (BE-046 integration)

---

**DO-024: R2 CORS Policy**  
**Effort:** [S] 1 hour  
**Week:** 2  
**Depends on:** DO-006  
**Blocks:** None (already configured in DO-006, this is validation)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-005)

**Acceptance:**
- CORS policy configured (already done in DO-006):
  - Allowed origins: `https://api.revora.app`, `https://api-staging.revora.app` (no wildcards)
  - Allowed methods: `GET`, `PUT`
  - Allowed headers: `Content-Type`, `Authorization`
- Test: attempt cross-origin request from unauthorized origin → blocked
- Test: authorized origin → allowed

**CORS Test Script:**
# Authorized origin — should work
curl -H "Origin: https://api-staging.revora.app" \
     -H "Access-Control-Request-Method: PUT" \
     -X OPTIONS \
     https://<account-id>.r2.cloudflarestorage.com/revora-photos/test.jpg
# Expected: Access-Control-Allow-Origin: https://api-staging.revora.app

# Unauthorized origin — should fail
curl -H "Origin: https://evil.com" \
     -H "Access-Control-Request-Method: PUT" \
     -X OPTIONS \
     https://<account-id>.r2.cloudflarestorage.com/revora-photos/test.jpg
# Expected: No Access-Control-Allow-Origin header

**Notes:**
- No wildcard origins: prevents unauthorized apps from accessing bucket

---

## PHASE 2: COST & PERFORMANCE MONITORING (Weeks 6–12)

### Cost Monitoring Dashboard

**DO-025: OpenAI Cost Tracking**  
**Effort:** [M] 6 hours  
**Week:** 6  
**Depends on:** BE-037 (OpenAI integration), BE-043 (scan result storage)  
**Blocks:** None (observability)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.5 (CON-001), §11.5

**Acceptance:**
- Scan cost logged in `scans` table:
  - `prompt_tokens` (integer)
  - `completion_tokens` (integer)
  - `ai_model_used` (string, e.g., "gpt-4o-mini", "gpt-4o")
  - `cost_usd` (decimal, calculated: `prompt_tokens * $0.000150 + completion_tokens * $0.000600` for GPT-4o Vision)
- Daily blended cost calculation query:
  SELECT
    DATE(created_at) AS date,
    COUNT(*) AS scans,
    AVG(cost_usd) AS avg_cost_per_scan,
    SUM(cost_usd) AS total_cost
  FROM scans
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
- PostHog custom event: `scan_cost_logged` with properties `{ model, cost_usd, prompt_tokens, completion_tokens }`
- Alert: if 7-day rolling average blended cost > $0.05/scan → email Person A
- Weekly report generated: `scripts/cost-report.sh` outputs CSV

**Backend Implementation (backend/src/ai/mod.rs):**
pub async fn calculate_scan_cost(model: &str, prompt_tokens: u32, completion_tokens: u32) -> f64 {
    match model {
        "gpt-4o" => {
            let prompt_cost = (prompt_tokens as f64) * 0.000005;      // $0.000005/token
            let completion_cost = (completion_tokens as f64) * 0.000015;  // $0.000015/token
            prompt_cost + completion_cost
        },
        "gpt-4o-mini" => {
            let prompt_cost = (prompt_tokens as f64) * 0.00000015;   // $0.00000015/token
            let completion_cost = (completion_tokens as f64) * 0.0000006;  // $0.0000006/token
            prompt_cost + completion_cost
        },
        _ => 0.0,
    }
}

**Weekly Report Script (scripts/cost-report.sh):**
#!/bin/bash
psql $DATABASE_URL -c "
COPY (
  SELECT
    DATE(created_at) AS date,
    COUNT(*) AS scans,
    ROUND(AVG(cost_usd)::numeric, 4) AS avg_cost_per_scan,
    ROUND(SUM(cost_usd)::numeric, 2) AS total_cost
  FROM scans
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ORDER BY date DESC
) TO STDOUT WITH CSV HEADER
" > cost-report-$(date +%Y-%m-%d).csv

echo "Cost report generated: cost-report-$(date +%Y-%m-%d).csv"

**Notes:**
- Cost calculation uses OpenAI's published pricing (as of 2024, subject to change)
- Week 6 onward: daily monitoring via PostHog dashboard
- Week 13 load test: validates cost under scale

---

**DO-026: Infrastructure Cost Alert**  
**Effort:** [S] 2 hours  
**Week:** 6  
**Depends on:** DO-005 (Railway billing)  
**Blocks:** None (observability)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.5 (CON-002)

**Acceptance:**
- Railway billing webhook configured (if available) or manual monthly check
- Alert threshold: if projected monthly cost > $500 at 5K MAU → email Person A
- Calculation:
  - Railway base: $20/month
  - PostgreSQL: $10/month (Hobby tier)
  - Redis: included
  - Bandwidth: ~$5/month (estimate)
  - Auto-scaling: $10/instance/month (if triggered)
- Monthly review: first week of each month, check Railway dashboard → Billing

**Railway Cost Breakdown (5K MAU projection):**
Base Hobby Plan:        $20/month
PostgreSQL (16GB RAM):  $10/month
Redis (1GB):            Included
Bandwidth (50GB):       $5/month
Auto-scaling (1 extra): $10/month (if triggered)
--------------------------------
Total:                  $45/month (within $500 threshold)

**Alert Setup:**
1. Railway Dashboard → Billing → Usage Alerts
2. Set threshold: $100/month (early warning)
3. Alert email: Person A

**Notes:**
- $500 threshold: based on SPEC CON-002
- Migration trigger (DO-038): if cost approaches $500 or performance insufficient → migrate to Fly.io

---

**DO-027: Free User API Cost Monitoring**  
**Effort:** [M] 4 hours  
**Week:** 6  
**Depends on:** BE-044 (rate limiting distinguishes free vs. premium), DO-025 (cost tracking)  
**Blocks:** None (observability for circuit breaker decision)  
**Owner:** Person A  
**SPEC/PRD Reference:** PRD §9.5 (free tier circuit breaker), SPEC CON-001

**Acceptance:**
- Free user scan cost tracked separately:
  - Query: `SELECT SUM(cost_usd) FROM scans WHERE user_id IN (SELECT id FROM users WHERE subscription_tier = 'free')`
- Weekly dashboard: free user total cost, free user scan volume
- Alert: if free user monthly cost burden > $20,000/month → email Founder (circuit breaker trigger — reduce free tier limit from 5 → 3 scans/day)
- PostHog custom metric: `free_user_scan_cost_monthly`

**Query (scripts/free-user-cost.sh):**
#!/bin/bash
psql $DATABASE_URL -c "
SELECT
  DATE_TRUNC('month', s.created_at) AS month,
  COUNT(s.id) AS free_scans,
  ROUND(SUM(s.cost_usd)::numeric, 2) AS total_cost,
  ROUND(AVG(s.cost_usd)::numeric, 4) AS avg_cost_per_scan
FROM scans s
JOIN users u ON s.user_id = u.id
WHERE u.subscription_tier = 'free'
  AND s.created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('month', s.created_at)
ORDER BY month DESC;
"

**Circuit Breaker Logic (PRD §9.5):**
IF (free_user_monthly_cost > $20,000 AND free_to_paid_conversion < 5%)
THEN reduce free tier from 5 → 3 scans/day via PostHog feature flag

**Notes:**
- $20,000 threshold: based on PRD §9.5 (assumes $0.02/scan blended, 1M free scans/month = unsustainable)
- Week 12: circuit breaker decision evaluated based on beta data

---

**DO-028: Redis Cache Hit Rate Dashboard**  
**Effort:** [S] 3 hours  
**Week:** 6  
**Depends on:** BE-034 (Redis scan cache implemented)  
**Blocks:** None (observability for cache tuning)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.3 (PER-010: 40% hit rate target)

**Acceptance:**
- Redis cache hit/miss counter implemented in backend:
  - On cache check: increment `scan_cache:hit` or `scan_cache:miss` (Redis INCR)
- Daily hit rate calculation:
  hit_rate = hits / (hits + misses) * 100
- PostHog custom metric: `cache_hit_rate_daily`
- Alert: if hit rate drops below 30% for 3 consecutive days → email Person A (cache TTL tuning needed)
- Dashboard query:
  redis-cli GET scan_cache:hit
  redis-cli GET scan_cache:miss

**Backend Implementation (backend/src/cache/mod.rs):**
pub async fn check_cache(redis: &RedisPool, phash: &str) -> Option<ScanResult> {
    let key = format!("scan:cache:{}", phash);
    match redis.get::<_, String>(&key).await {
        Ok(cached) => {
            redis.incr("scan_cache:hit", 1).await.ok();
            Some(serde_json::from_str(&cached).unwrap())
        },
        Err(_) => {
            redis.incr("scan_cache:miss", 1).await.ok();
            None
        },
    }
}

**Daily Report Script (scripts/cache-hit-rate.sh):**
#!/bin/bash
HITS=$(redis-cli GET scan_cache:hit)
MISSES=$(redis-cli GET scan_cache:miss)
TOTAL=$((HITS + MISSES))
HIT_RATE=$(echo "scale=2; $HITS / $TOTAL * 100" | bc)

echo "Cache Hit Rate: ${HIT_RATE}%"
echo "Hits: $HITS, Misses: $MISSES, Total: $TOTAL"

# Reset counters daily
redis-cli SET scan_cache:hit 0
redis-cli SET scan_cache:miss 0

**Notes:**
- 40% target: based on SPEC PER-010 (realistic for meal diversity)
- <30% hit rate: indicates cache TTL too short or pHash collisions (tune at BE-078)

---

### Performance Monitoring

**DO-029: Scan API Latency Tracking**  
**Effort:** [S] 3 hours  
**Week:** 6  
**Depends on:** BE-046 (scan API complete)  
**Blocks:** None (observability)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.3 (PER-001: P95 ≤5s), VAL-003

**Acceptance:**
- Scan API latency logged:
  - Start timestamp: request received
  - End timestamp: response sent
  - Duration: `end - start` (milliseconds)
- Railway logs parsed for latency metrics:
  railway logs backend | grep "POST /api/v1/scan" | awk '{print $NF}'
- PostHog custom event: `scan_latency` with property `{ duration_ms }`
- Alert: if P95 > 6 seconds for 5% of requests in any 10-minute window → email Person A
- Dashboard: P50, P95, P99 latency over time

**Backend Logging (backend/src/routes/scan.rs):**
use std::time::Instant;

pub async fn scan_meal(/* ... */) -> Result<Json<ScanResponse>, AppError> {
    let start = Instant::now();
    
    // ... scan logic ...
    
    let duration = start.elapsed().as_millis();
    tracing::info!(
        target: "scan_latency",
        duration_ms = duration,
        user_id = %user_id,
        "Scan completed"
    );
    
    // PostHog event
    posthog::capture("scan_latency", json!({ "duration_ms": duration }));
    
    Ok(Json(response))
}

**Alert Query (PostHog or custom script):**
-- P95 latency over last 10 minutes
SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms)
FROM scan_latency_events
WHERE timestamp >= NOW() - INTERVAL '10 minutes';

**Notes:**
- VAL-003 gate (Week 13): P95 ≤5s validated via load test (DO-035)
- Week 8: first production scans generate real latency data

---

**DO-030: Dashboard Query Performance Monitoring**  
**Effort:** [S] 2 hours  
**Week:** 6  
**Depends on:** BE-048 (dashboard endpoint)  
**Blocks:** None (observability)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.3 (PER-004: ≤1s)

**Acceptance:**
- Dashboard query slow query logging enabled in PostgreSQL:
  - `log_min_duration_statement = 500` (log queries >500ms)
- Railway logs capture slow queries automatically
- Alert: if any dashboard query takes >1 second → email Person A with `EXPLAIN ANALYZE` output
- PostHog custom metric: `dashboard_query_duration_ms`

**PostgreSQL Configuration (Railway dashboard or `psql`):**
ALTER SYSTEM SET log_min_duration_statement = 500;
SELECT pg_reload_conf();

**Slow Query Alert Script (runs in backend on query completion):**
let start = Instant::now();
let dashboard_data = query_dashboard(&pool, user_id).await?;
let duration = start.elapsed().as_millis();

if duration > 1000 {
    tracing::warn!(
        target: "slow_query",
        duration_ms = duration,
        query = "dashboard",
        "Dashboard query exceeded 1s threshold"
    );
    // Trigger EXPLAIN ANALYZE logging
}

**Notes:**
- Week 7: BE-077 (query optimization pass) uses slow query logs to identify bottlenecks
- Dashboard loads 30s polling (FE-040): slow queries impact UX

---

**DO-031: Railway Auto-Scaling Configuration**  
**Effort:** [S] 2 hours  
**Week:** 6  
**Depends on:** DO-005 (Railway project)  
**Blocks:** None (performance scaling)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.3 (PER-006: 100 concurrent scans MVP)

**Acceptance:**
- Railway auto-scaling enabled:
  - Trigger: CPU > 70% for 2 minutes
  - Max instances: 3 (MVP), 10 (V1.1 post-launch)
  - Scale-down: CPU < 30% for 5 minutes
- Scale-out test procedure documented in `docs/RUNBOOKS.md`:
  - Use k6 to generate 100 concurrent scan requests
  - Verify Railway spawns 2nd instance
  - Verify load balanced across instances
- Test: Week 13 load test (DO-035) validates auto-scaling

**Railway Dashboard Configuration:**
1. Project → Backend Service → Settings → Autoscaling
2. Enable: ☑ Autoscaling
3. Min replicas: 1
4. Max replicas: 3 (MVP), 10 (post-launch)
5. CPU threshold: 70%
6. Memory threshold: 80%

**Scale-Out Test (docs/RUNBOOKS.md):**
## Testing Auto-Scaling

1. **Generate load**
   k6 run --vus 100 --duration 5m scripts/load-test-scan.js

2. **Monitor Railway dashboard**
   - Metrics → CPU Usage
   - Expect: CPU > 70% → 2nd replica spawns within 2 minutes

3. **Verify load balancing**
   # Check logs from multiple replicas
   railway logs backend --tail
   # Expect: requests distributed across replica-1 and replica-2

4. **Scale down**
   - Stop k6 load
   - Expect: CPU < 30% for 5 min → replica-2 terminates

**Notes:**
- 3 instances MVP: sufficient for 300 concurrent scans (100 per instance)
- Week 13: load test validates 100 concurrent scans (SPEC PER-006)
- Post-launch: increase max to 10 instances if traffic exceeds capacity

---

## PHASE 3: PRE-LAUNCH HARDENING (Weeks 13–14)

### Security Validation

**DO-032: Production Secrets Audit**  
**Effort:** [M] 4 hours  
**Week:** 13  
**Depends on:** All prior DO tasks (audit entire setup)  
**Blocks:** None (security gate)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-009), BLK-002

**Acceptance:**
- No secrets in git history:
  git log --all --full-history -- "*secret*" "*key*" "*.env" "*.pem" | wc -l
  # Expected: 0
- Tools used:
  - `git-secrets` (AWS open-source tool)
  - `truffleHog` (scans git history for high-entropy strings)
- All secrets stored in GitHub Secrets or Railway env vars (verified via checklist)
- Any potentially exposed secrets rotated:
  - If any commit ever contained a secret → rotate immediately
  - Example: `JWT_SECRET` rotation (generate new, update Railway, deploy)
- Documentation: `docs/SECRETS.md` updated with all secret names and rotation procedures

**Audit Commands:**
# Install tools
brew install git-secrets
pip install truffleHog

# Scan repository
git secrets --scan-history
truffleHog --regex --entropy=True https://github.com/revora/revora.git

# Check for common patterns
grep -r "sk-" .          # OpenAI keys
grep -r "AKIA" .         # AWS keys
grep -r "ghp_" .         # GitHub tokens
grep -r "password" .     # Hardcoded passwords

**Secrets Checklist:**
- [ ] `OPENAI_API_KEY` — in GitHub Secrets + Railway (not in git)
- [ ] `JWT_SECRET` — in GitHub Secrets + Railway (not in git)
- [ ] `A1C_ENCRYPTION_KEY` — in GitHub Secrets + Railway (not in git)
- [ ] `DATABASE_URL` — in Railway env vars only (not in git)
- [ ] `REDIS_URL` — in Railway env vars only (not in git)
- [ ] `CLOUDFLARE_R2_SECRET_ACCESS_KEY` — in GitHub Secrets + Railway (not in git)
- [ ] `REVENUECAT_SECRET_KEY` — in GitHub Secrets + Railway (not in git)
- [ ] `SENTRY_DSN_BACKEND` — in GitHub Secrets + Railway (acceptable to be public, but best practice to protect)
- [ ] `EXPO_TOKEN` — in GitHub Secrets only (not in git)

**Rotation Procedure (if secret found in git):**
# Example: JWT_SECRET was accidentally committed

# 1. Generate new secret
NEW_JWT_SECRET=$(openssl rand -hex 64)

# 2. Update GitHub Secret
gh secret set JWT_SECRET --body "$NEW_JWT_SECRET"

# 3. Update Railway
railway variables set JWT_SECRET="$NEW_JWT_SECRET"

# 4. Restart backend
railway service restart backend

# 5. Revoke all existing user tokens (they're signed with old secret, will be invalid)
# No action needed — tokens auto-invalidated

**Notes:**
- Week 13 gate: audit must pass before beta launch
- BLK-002 verified: OpenAI DPA executed, key secured

---

**DO-033: TLS Configuration Verification**  
**Effort:** [S] 2 hours  
**Week:** 13  
**Depends on:** DO-005 (Railway custom domains)  
**Blocks:** None (security validation)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-001)

**Acceptance:**
- Railway serves TLS 1.3 minimum (TLS 1.2 acceptable, 1.0/1.1 forbidden [REVIEW NEEDED: Replace restriction-framing with permission-first language])
- SSL Labs scan: `https://www.ssllabs.com/ssltest/analyze.html?d=api-staging.revora.app`
  - Grade: A or A+ target
- HSTS header enabled: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- Test: attempt HTTP connection → redirects to HTTPS

**SSL Labs Test:**
1. Visit https://www.ssllabs.com/ssltest/
2. Enter domain: `api-staging.revora.app`
3. Wait for scan (5-10 minutes)
4. Verify:
   - Overall Rating: A or A+
   - Protocol Support: TLS 1.3, TLS 1.2 (no TLS 1.0/1.1)
   - Certificate: Valid, not expired
   - HSTS: Enabled

**HSTS Configuration (Railway auto-enables, verify in response headers):**
curl -I https://api-staging.revora.app/health
# Expected header:
# Strict-Transport-Security: max-age=31536000; includeSubDomains

**HTTP → HTTPS Redirect Test:**
curl -I http://api-staging.revora.app/health
# Expected: 301 Moved Permanently
# Location: https://api-staging.revora.app/health

**Notes:**
- Railway auto-configures TLS via Let's Encrypt (free, auto-renewing)
- A+ rating: requires perfect configuration (HSTS preload, OCSP stapling)

---

**DO-034: Rate Limiting Stress Test**  
**Effort:** [M] 4 hours  
**Week:** 13  
**Depends on:** BE-044 (rate limiting implemented), BE-045 (global rate limiting)  
**Blocks:** VAL-012 (rate limiting acceptance)  
**Owner:** Person A  
**SPEC/PRD Reference:** VAL-012, SPEC §4.4.2

**Acceptance:**
- Free tier rate limit test:
  - Script: 6 scan attempts from single free user in <1 minute
  - Expected: 5 succeed (200), 6th returns 429 with headers:
    X-Scans-Remaining: 0
    Retry-After: 43200  (12 hours in seconds)
- Global rate limit test:
  - Script: 200 requests/minute from single user
  - Expected: first 100 succeed, 101st returns 429
- Automated test added to CI (runs in DO-009 E2E pipeline Week 13+)

**Test Script (scripts/rate-limit-test.sh):**
#!/bin/bash
set -e

echo "=== Free Tier Scan Limit Test ==="

# Create test user (free tier)
USER_TOKEN=$(curl -s -X POST https://api-staging.revora.app/api/v1/auth/guest | jq -r '.accessToken')

# Attempt 6 scans
for i in {1..6}; do
  echo "Scan attempt $i"
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST https://api-staging.revora.app/api/v1/scan \
    -H "Authorization: Bearer $USER_TOKEN" \
    -F "image=@test-meal.jpg")
  
  STATUS=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -n -1)
  
  if [ $i -le 5 ]; then
    # First 5 should succeed
    [ "$STATUS" = "200" ] || { echo "FAIL: Expected 200, got $STATUS"; exit 1; }
  else
    # 6th should be rate limited
    [ "$STATUS" = "429" ] || { echo "FAIL: Expected 429, got $STATUS"; exit 1; }
    SCANS_REMAINING=$(echo "$BODY" | jq -r '.scansRemaining')
    [ "$SCANS_REMAINING" = "0" ] || { echo "FAIL: Expected scansRemaining=0"; exit 1; }
  fi
done

echo "✓ Free tier rate limiting works correctly"

echo "=== Global Rate Limit Test ==="

# Create premium user (for testing global 100 req/min limit)
PREMIUM_TOKEN=$(curl -s -X POST https://api-staging.revora.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"premium@test.com","password":"test123","name":"Premium User"}' \
  | jq -r '.accessToken')

# Attempt 105 requests in 30 seconds
for i in {1..105}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X GET https://api-staging.revora.app/api/v1/dashboard/today \
    -H "Authorization: Bearer $PREMIUM_TOKEN")
  
  if [ $i -le 100 ]; then
    [ "$STATUS" = "200" ] || { echo "FAIL: Request $i expected 200, got $STATUS"; exit 1; }
  else
    [ "$STATUS" = "429" ] || { echo "FAIL: Request $i expected 429, got $STATUS"; exit 1; }
  fi
done

echo "✓ Global rate limiting works correctly"

**Notes:**
- VAL-012 acceptance: this test passing = gate met
- Week 13: run before beta launch

---

**DO-035: k6 Load Test Execution**  
**Effort:** [L] 10 hours  
**Week:** 13  
**Depends on:** All backend endpoints complete, DO-005 (staging environment)  
**Blocks:** Pre-launch gate (all tests must pass)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §7.2, §2.3 (PER-001 through PER-007)

**Acceptance:**
- All k6 scenarios from SPEC §7.2 pass:
  1. **Scan endpoint stress**: 100 VUs for 5 min → P95 ≤5s, 0 errors
  2. **Dashboard load**: 200 VUs for 5 min → P95 ≤1s
  3. **Auth flow**: 50 VUs for 3 min → P95 ≤500ms
  4. **GDPR export**: 20 VUs for 3 min → P95 ≤10s
- Results documented in `docs/load-test-results-YYYY-MM-DD.md`
- Any failures: root cause identified, fixed, re-tested
- Week 15 gate: all tests must pass before production launch

**k6 Test Scripts (scripts/load-test-*.js):**

**Scan Endpoint Stress (scripts/load-test-scan.js):**
import http from 'k6/http';
import { check, sleep } from 'k6';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

export let options = {
  vus: 100,
  duration: '5m',
  thresholds: {
    'http_req_duration{endpoint:scan}': ['p(95)<5000'],  // P95 < 5s
    'http_req_failed{endpoint:scan}': ['rate<0.01'],     // < 1% errors
  },
};

export default function () {
  const url = 'https://api-staging.revora.app/api/v1/scan';
  const formData = new FormData();
  formData.append('image', http.file(open('test-meal.jpg', 'b'), 'meal.jpg'));
  
  const res = http.post(url, formData.body(), {
    headers: {
      'Authorization': `Bearer ${__ENV.TEST_USER_TOKEN}`,
      'Content-Type': `multipart/form-data; boundary=${formData.boundary}`,
    },
    tags: { endpoint: 'scan' },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has scanId': (r) => JSON.parse(r.body).scanId !== undefined,
  });
  
  sleep(1);
}

**Dashboard Load (scripts/load-test-dashboard.js):**
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 200,
  duration: '5m',
  thresholds: {
    'http_req_duration{endpoint:dashboard}': ['p(95)<1000'],  // P95 < 1s
  },
};

export default function () {
  const res = http.get('https://api-staging.revora.app/api/v1/dashboard/today', {
    headers: { 'Authorization': `Bearer ${__ENV.TEST_USER_TOKEN}` },
    tags: { endpoint: 'dashboard' },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has glConsumed': (r) => JSON.parse(r.body).glConsumed !== undefined,
  });
  
  sleep(0.5);
}

**Execution Commands:**
# Generate test user tokens
export TEST_USER_TOKEN=$(curl -s -X POST https://api-staging.revora.app/api/v1/auth/guest | jq -r '.accessToken')

# Run all tests
k6 run scripts/load-test-scan.js
k6 run scripts/load-test-dashboard.js
k6 run scripts/load-test-auth.js
k6 run scripts/load-test-gdpr-export.js

# Generate HTML report
k6 run --out json=results.json scripts/load-test-scan.js
k6-reporter results.json --output report.html

**Acceptance Criteria:**
- [ ] Scan: P95 ≤5s (PER-001, VAL-003)
- [ ] Dashboard: P95 ≤1s (PER-004)
- [ ] Auth: P95 ≤500ms
- [ ] GDPR export: P95 ≤10s (PER-005, VAL-010)
- [ ] Zero errors (success rate ≥99%)

**Notes:**
- Week 13 gate: all tests pass before beta launch
- If any test fails: root cause → fix → re-test before launch
- Results inform DO-038 migration decision (if Railway insufficient capacity)

---

**DO-036: Hotfix Deployment Procedure**  
**Effort:** [S] 3 hours  
**Week:** 13  
**Depends on:** DO-005 (Railway auto-deploy), DO-002 (branch protection)  
**Blocks:** None (documented procedure for emergencies)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §7.1

**Acceptance:**
- Hotfix procedure documented in `docs/RUNBOOKS.md`
- Procedure tested in staging:
  1. Create hotfix branch from `main`
  2. Apply fix
  3. Open PR, get approval (or self-review with checklist)
  4. CI passes
  5. Merge to `main`
  6. Railway auto-deploys within 5 minutes
- Expected hotfix cycle time: <30 minutes from identification to deployed
- Tested with simulated critical bug (e.g., intentional 500 error → fix → deploy)

**Hotfix Procedure (docs/RUNBOOKS.md):**
## Hotfix Deployment Procedure

**When:** Critical production bug (P0: service down, data loss, security breach)

### Steps

1. **Create hotfix branch**
   git checkout main
   git pull
   git checkout -b hotfix/describe-issue

2. **Apply fix**
   - Make minimal changes (only fix critical issue, no features)
   - Write test that reproduces bug, verify fix resolves it
   - Update CHANGELOG.md with hotfix note

3. **Open PR**
   git add .
   git commit -m "[HOTFIX] Fix critical issue X"
   git push origin hotfix/describe-issue
   gh pr create --title "[HOTFIX] Fix critical issue X" --body "Root cause: ..."

4. **Review & merge**
   - If 2-person team: request review from other person
   - If solo: self-review with checklist:
     - [ ] Fix is minimal (only addresses critical issue)
     - [ ] Tests pass locally
     - [ ] No new secrets introduced
     - [ ] No reversal language
   - Merge to `main` immediately after approval

5. **Deploy**
   - Railway auto-deploys from `main` within 5 minutes
   - Monitor logs: `railway logs backend --tail`
   - Verify fix: test the bug scenario → should be resolved

6. **Verify & communicate**
   - Check Sentry: error rate should drop
   - Update status page (if outage)
   - Post in team Slack / notify users if needed

### Expected Timing
- Fix implementation: 10-15 minutes
- CI pipeline: 5-10 minutes
- Railway deploy: 5 minutes
- **Total: <30 minutes**

**Test Scenario (Week 13):**
# Simulate critical bug
# In backend code, intentionally return 500 on /health
git checkout -b hotfix/test-health-500
# Edit backend/src/routes/health.rs → return 500
git commit -m "[TEST] Simulate 500 error"
git push

# Open PR, merge
gh pr create --title "[TEST] Hotfix test" --body "Testing hotfix procedure"
gh pr merge --auto --squash

# Verify Railway deploys within 5 minutes
railway logs backend --tail

# Revert test
git revert HEAD
git push

**Notes:**
- Bypass branch protection only for true emergencies (service down)
- All hotfixes must still pass CI (no exceptions)

---

**DO-037: Rollback Procedure Test**  
**Effort:** [S] 3 hours  
**Week:** 13  
**Depends on:** DO-005 (Railway deployments)  
**Blocks:** None (documented procedure)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §7.1

**Acceptance:**
- Rollback procedure documented in `docs/RUNBOOKS.md`
- Rollback tested in staging:
  1. Deploy intentional breaking change
  2. Identify issue
  3. Rollback to previous Railway deployment
  4. Verify app functional
- Expected rollback time: <5 minutes
- Database migrations: rollback procedure in DO-020 (new migration with DOWN logic)

**Rollback Procedure (docs/RUNBOOKS.md):**
## Rollback Procedure

**When:** Recent deployment causes critical issue, hotfix not immediately available

### Application Rollback (Railway)

1. **Identify previous good deployment**
   railway logs backend --tail 100
   # Find timestamp of last good deployment

2. **Rollback in Railway dashboard**
   - Railway Dashboard → Backend Service → Deployments
   - Find previous successful deployment
   - Click "Redeploy"
   - Confirm rollback

3. **Verify rollback**
   curl https://api-staging.revora.app/health
   # Expected: {"status":"ok"}

4. **Monitor logs**
   railway logs backend --tail
   # Verify no errors

**Expected time:** <5 minutes

### Database Migration Rollback

**NEVER manually reverse migrations.** Instead:

1. **Create new migration**
   sqlx migrate add revert_feature_x

2. **Write DOWN logic**
   -- migrations/XXXXXX_revert_feature_x.sql
   DROP TABLE IF EXISTS new_table;
   ALTER TABLE users DROP COLUMN IF EXISTS new_column;

3. **Deploy new migration**
   git add migrations/
   git commit -m "[ROLLBACK] Revert feature X migration"
   git push
   # Railway auto-deploys and applies migration

**Expected time:** 10-15 minutes (includes PR review)

### Docker Image Rollback (if using Docker instead of Railway)

1. **Identify previous image**
   docker images revora-backend
   # Find previous tag (e.g., v1.2.3)

2. **Deploy previous image**
   docker pull revora-backend:v1.2.3
   docker stop revora-backend
   docker run -d --name revora-backend revora-backend:v1.2.3

3. **Verify**
   docker logs -f revora-backend
   curl http://localhost:3000/health

**Test Scenario (Week 13):**
# Deploy breaking change
echo "BREAKING CHANGE" > backend/BREAKING.txt
git add backend/BREAKING.txt
git commit -m "[TEST] Breaking change"
git push
# Wait for Railway deploy

# Verify break
curl https://api-staging.revora.app/health
# Expected: error (if BREAKING.txt causes startup failure)

# Rollback via Railway dashboard
# Railway → Backend → Deployments → Previous deployment → Redeploy

# Verify rollback success
curl https://api-staging.revora.app/health
# Expected: {"status":"ok"}

# Clean up
git revert HEAD
git push

**Notes:**
- Rollback = redeploy previous Docker image (no code changes)
- Database migrations: cannot be rolled back directly (use new DOWN migration)
- Expected downtime: <5 minutes

---

## PHASE 4: LAUNCH (Week 15)

### Final Pre-Launch Checks

**DO-038: Railway → Fly.io Migration Documentation**  
**Effort:** [S] 3 hours  
**Week:** 13 (document), trigger TBD (when 5K MAU or capacity hit)  
**Depends on:** DO-005 (Railway current setup)  
**Blocks:** None (future migration plan)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §9.1 (RSK-009)

**Acceptance:**
- Migration trigger criteria documented:
  1. **5,000 MAU reached** (Railway $500/month cost threshold)
  2. **Peak concurrent scans ≥80% of Railway 100-cap** for 3 consecutive days
  3. **P95 latency >6s** on scan endpoint consistently
- Pre-written migration runbook in `docs/MIGRATION-FLY-IO.md`:
  - Railway PostgreSQL export procedure
  - Fly.io setup steps (Dockerfile, fly.toml)
  - DNS migration (CNAME update)
  - Health check verification
  - Estimated downtime: <5 minutes (blue-green deployment)
- Migration tested in isolated Fly.io staging environment (optional, do when trigger imminent)

**Migration Trigger Decision Matrix:**
IF (MAU >= 5000 OR concurrent_scans >= 80 OR p95_latency > 6s)
THEN review migration runbook and execute within 1 week

**Migration Runbook (docs/MIGRATION-FLY-IO.md — excerpt):**
## Railway → Fly.io Migration Runbook

### Pre-Migration Checklist
- [ ] Fly.io account created
- [ ] Dockerfile tested locally
- [ ] `fly.toml` configured
- [ ] PostgreSQL backup verified (DO-019)
- [ ] DNS TTL reduced to 60 seconds (24 hours before migration)

### Steps

1. **Export PostgreSQL database**
   railway run pg_dump $DATABASE_URL > backup.sql

2. **Provision Fly.io Postgres**
   fly postgres create revora-db --region sjc
   fly postgres attach revora-db --app revora-backend

3. **Import database**
   psql $FLY_DATABASE_URL < backup.sql

4. **Deploy backend to Fly.io**
   fly deploy

5. **Verify health check**
   curl https://revora-backend.fly.dev/health
   # Expected: {"status":"ok"}

6. **Update DNS (blue-green cutover)**
   CNAME  api-staging  revora-backend.fly.dev

7. **Monitor traffic**
   - Fly.io metrics dashboard
   - Sentry error rate

8. **Decommission Railway**
   - After 48 hours of stable Fly.io operation
   - Export final Railway logs
   - Cancel Railway subscription

**Estimated downtime:** <5 minutes (DNS propagation)

**Notes:**
- Migration is **optional** for MVP (Railway sufficient for <5K MAU)
- Trigger: monitor Week 13 load test results + post-launch growth
- Fly.io advantages: better scaling, global edge network, comparable cost

---

**DO-039: Production Deployment Final Check**  
**Effort:** [M] 4 hours  
**Week:** 15  
**Depends on:** All prior DevOps tasks, BE-082 (production env vars), FE-082 (production build)  
**Blocks:** Launch gate  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §7.1, PRD §11.3

**Acceptance:**
- **Pre-deployment checklist** (all must pass):
  - [ ] All environment variables verified in Railway production (DO-003)
  - [ ] Database migrations applied to production DB (DO-020)
  - [ ] Health check endpoint responding: `curl https://api.revora.app/health` → 200
  - [ ] Sentry receiving test events (DO-012)
  - [ ] PostHog tracking test events (SC-004)
  - [ ] Rate limiting active (DO-034 test passed)
  - [ ] CORS policy configured (DO-024)
  - [ ] R2 lifecycle rules active (DO-022)
  - [ ] TLS configuration verified (DO-033)
  - [ ] Secrets audit passed (DO-032)
  - [ ] Load tests passed (DO-035)
  - [ ] Rollback procedure tested (DO-037)
  - [ ] BLK-002, BLK-006, BLK-014 resolved (OpenAI DPA, reversal language, CI grep)
- Production deploy executed:
  - Backend: merge to `main` → Railway auto-deploys production
  - Frontend: `eas build --profile production` → `eas submit --platform all`
- Post-deploy smoke test:
  - Register new user → complete onboarding → scan meal → dashboard updates
  - Full flow works end-to-end

**Pre-Deployment Checklist (docs/LAUNCH-CHECKLIST.md):**
## Revora Production Launch Checklist

**Date:** Week 15  
**Owner:** Person A  
**Reviewer:** Founder

### Infrastructure
- [ ] Railway production project configured
- [ ] PostgreSQL database provisioned and migrated
- [ ] Redis cache provisioned
- [ ] Cloudflare R2 bucket configured with lifecycle rules
- [ ] Custom domain `api.revora.app` pointing to Railway
- [ ] TLS certificate active (SSL Labs grade A)

### Secrets & Security
- [ ] All secrets in GitHub Secrets + Railway env vars
- [ ] No secrets in git history (audit passed — DO-032)
- [ ] OpenAI DPA executed (BLK-002)
- [ ] RevenueCat DPA executed (SC-003)
- [ ] Cloudflare DPA executed (SC-002)
- [ ] PostHog DPA executed (SC-004)

### CI/CD & Monitoring
- [ ] Backend CI passing (DO-007)
- [ ] Frontend CI passing (DO-008)
- [ ] Reversal language grep in CI (BLK-014)
- [ ] Sentry configured for both backend + frontend (DO-012)
- [ ] Railway health check active (DO-013)
- [ ] BetterUptime monitoring active (DO-014)

### Testing & Validation
- [ ] k6 load tests passed (DO-035)
- [ ] Rate limiting stress test passed (DO-034)
- [ ] Alpha validation checklist complete (FE-070)
- [ ] VAL-001 accuracy gate met (BLK-001)
- [ ] Penetration test complete, CriticalHigh resolved (SC-027, BLK-004)

### Compliance
- [ ] Privacy Policy live at revora.com/privacy (SC-009)
- [ ] Terms of Service live at revora.com/terms (SC-010)
- [ ] App Store pre-submission checklist complete (FE-081, BLK-005)
- [ ] FTC attorney final sign-off (SC-022)
- [ ] GDPR DPIA documented (SC-013, BLK-003)

### Mobile App
- [ ] EAS production build successful (FE-082)
- [ ] App submitted to App Store Connect (FE-082)
- [ ] App submitted to Google Play Console (FE-082)
- [ ] App Store listing approved
- [ ] Google Play listing approved

### Post-Launch Monitoring
- [ ] Go-live monitoring rotation scheduled (DO-040)
- [ ] Sentry alerts configured (email + SMS)
- [ ] PostHog real-time dashboard open
- [ ] Railway metrics dashboard open
- [ ] First 72 hours: Person A on-call

### Sign-Off
- [ ] Person A: All checks passed
- [ ] Founder: Approved for launch
- [ ] Date/Time: _______________

**Notes:**
- Checklist reviewed in Week 14 sync (identify any missing items early)
- Week 15: final verification, then launch

---

**DO-040: Go-Live Monitoring Rotation**  
**Effort:** [L] 12 hours (spread over 72 hours)  
**Week:** 15 (first 72 hours post-launch)  
**Depends on:** DO-039 (production deployed)  
**Blocks:** None (ongoing monitoring)  
**Owner:** Person A  
**SPEC/PRD Reference:** PRD §11.3

**Acceptance:**
- Monitoring rotation: Person A checks metrics every 2 hours for first 72 hours post-launch
- Dashboards monitored:
  1. **Railway metrics**: CPU, memory, request rate, error rate
  2. **Sentry**: crash-free rate, new errors
  3. **PostHog**: real-time DAU, scan volume, paywall conversions
  4. **k6 smoke test**: run every 4 hours to verify service health
- Alert channels active:
  - Email: Person A (all alerts)
  - SMS: Person A (P0 only: service down, crash-free rate <95%)
- Incident log: any issues documented in `docs/INCIDENTS.md`

**Monitoring Schedule (first 72 hours):**
Day 1 (Launch Day):
- 8 AM:  Initial deploy, smoke test
- 10 AM: Check dashboards
- 12 PM: Check dashboards
- 2 PM:  Check dashboards
- 4 PM:  Check dashboards
- 6 PM:  Check dashboards
- 8 PM:  Check dashboards
- 10 PM: Check dashboards (last check before sleep)

Day 2-3:
- Every 2 hours during waking hours (8 AM - 10 PM)
- Alerts configured for overnight (auto-wake on P0)

After 72 hours:
- Transition to normal monitoring (alerts only)

**Metrics Targets:**
- Crash-free rate: ≥99.5% (VAL-027)
- Error rate: <1% of requests
- P95 scan latency: ≤5s (VAL-003)
- Uptime: 100% (PER-008 target 99.5% over month)

**Smoke Test Script (runs every 4 hours):**
#!/bin/bash
# scripts/smoke-test-production.sh

echo "=== Revora Production Smoke Test ==="
echo "Timestamp: $(date)"

# 1. Health check
echo "1. Health check..."
HEALTH=$(curl -s https://api.revora.app/health | jq -r '.status')
[ "$HEALTH" = "ok" ] || { echo "FAIL: Health check failed"; exit 1; }
echo "✓ Health check passed"

# 2. Register new user
echo "2. Register test user..."
USER_EMAIL="smoke-test-$(date +%s)@revora.app"
REGISTER_RESP=$(curl -s -X POST https://api.revora.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"Test123!\",\"name\":\"Smoke Test\"}")
USER_TOKEN=$(echo "$REGISTER_RESP" | jq -r '.accessToken')
[ -n "$USER_TOKEN" ] || { echo "FAIL: Registration failed"; exit 1; }
echo "✓ Registration passed"

# 3. Complete onboarding
echo "3. Complete onboarding..."
curl -s -X POST https://api.revora.app/api/v1/onboarding \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"a1cBaseline":6.1,"a1cGoal":5.6,"dietaryProfile":[],"ageConfirmed":true,"healthDataConsent":true,"timezone":"America/New_York"}' \
  > /dev/null
echo "✓ Onboarding passed"

# 4. Scan meal
echo "4. Scan meal..."
SCAN_RESP=$(curl -s -X POST https://api.revora.app/api/v1/scan \
  -H "Authorization: Bearer $USER_TOKEN" \
  -F "image=@test-meal.jpg")
SCAN_ID=$(echo "$SCAN_RESP" | jq -r '.scanId')
[ -n "$SCAN_ID" ] || { echo "FAIL: Scan failed"; exit 1; }
echo "✓ Scan passed (ID: $SCAN_ID)"

# 5. Dashboard query
echo "5. Dashboard query..."
DASHBOARD=$(curl -s https://api.revora.app/api/v1/dashboard/today \
  -H "Authorization: Bearer $USER_TOKEN")
GL_CONSUMED=$(echo "$DASHBOARD" | jq -r '.glConsumed')
[ -n "$GL_CONSUMED" ] || { echo "FAIL: Dashboard query failed"; exit 1; }
echo "✓ Dashboard query passed (GL consumed: $GL_CONSUMED)"

echo "=== All smoke tests passed ==="

**Incident Response (if issues detected):**
1. **Service down (P0)**: Execute rollback procedure (DO-037)
2. **High error rate**: Check Sentry for new error patterns → hotfix (DO-036)
3. **Slow performance**: Check Railway CPU/memory → scale up or investigate slow queries
4. **Security issue**: Execute incident response plan (SC-020)

**Notes:**
- After 72 hours: transition to alerts-only monitoring (no manual 2-hour checks)
- Week 16+: weekly review of metrics, no active monitoring rotation

---

**DO-041: App Store / Play Store Build Submission**  
**Effort:** [S] 2 hours  
**Week:** 15  
**Depends on:** FE-080 (screenshots), FE-081 (store copy), DO-016 (EAS Submit config)  
**Blocks:** Launch  
**Owner:** Person A (submission), Founder (store listing content)  
**SPEC/PRD Reference:** PRD §11.3, SPEC §7.1

**Acceptance:**
- Production build submitted via EAS Submit:
  eas build --profile production --platform all
  eas submit --profile production --platform ios
  eas submit --profile production --platform android
- App Store Connect status: "Waiting for Review" (then "In Review" → "Ready for Sale")
- Google Play Console status: "Pending Publication" (internal testing track → production)
- Submission checklist complete (FE-081)
- Expected review time: 2-5 days (iOS), 1-3 days (Android)

**App Store Submission Steps:**
1. EAS Build production → generates IPA file
2. EAS Submit uploads to App Store Connect
3. App Store Connect → My Apps → Revora → Submit for Review
4. Answer App Store questionnaires:
   - Uses encryption? Yes (HTTPS)
   - Health data? Yes (prediabetes management)
   - Age rating: 12+ (medical/treatment info)
   - Export compliance: No
5. Submit

**Google Play Submission Steps:**
1. EAS Build production → generates AAB file
2. EAS Submit uploads to Play Console
3. Play Console → Revora → Release → Production → Review Release
4. Internal testing track → promote to Production
5. Submit for review

**Notes:**
- Week 15: submission early in week, allows time for review + potential rejection iteration
- BLK-005 (App Store pre-submission checklist) must be complete before submit

---

**DO-042: Production Deployment Runbook**  
**Effort:** [M] 4 hours  
**Week:** 14  
**Depends on:** DO-039 (production deploy procedure)  
**Blocks:** None (reference document)  
**Owner:** Person A

**Deliverable:** Create `docs/DEPLOYMENT-RUNBOOK.md` covering:
- Pre-deployment checklist (all tests pass, staging validated, secrets rotated)
- Step-by-step production deploy procedure (Railway + EAS)
- Rollback procedure (DO-037 reference)
- Post-deployment smoke test commands
- Incident escalation contacts and procedures
- Database migration rollback steps

**Acceptance:**
- Runbook documented, reviewed by Founder, tested in staging

---

**DO-043: Database Backup Strategy**  
**Effort:** [S] 3 hours  
**Week:** 3  
**Depends on:** DO-005 (Railway PostgreSQL)  
**Blocks:** None (operational safety)  
**Owner:** Person A

**Tasks:**
- Configure Railway automated daily backups (PostgreSQL point-in-time recovery)
- Document manual backup procedure (`pg_dump` via Railway CLI)
- Test restore procedure: backup → restore to staging → verify data integrity
- Set retention: 7 daily + 4 weekly + 3 monthly backups

**Acceptance:**
- Daily backups running, restore tested successfully, documented in `docs/BACKUP-STRATEGY.md`

---

## CROSS-DOMAIN DEPENDENCIES (DevOps-Specific)

| Dep ID | Producing Task (DevOps) | Consuming Task (Other Domain) | Risk if Late |
|--------|------------------------|-------------------------------|--------------|
| **DEP-011** | DO-001: Monorepo structure | BE-001: Backend init, FE-001: Frontend init | Cannot start coding |
| **DEP-012** | DO-003: GitHub Secrets | BE-002: Backend env config, BE-037: OpenAI integration | Secrets missing, API calls fail |
| **DEP-013** | DO-005: Railway PostgreSQL | BE-006: DB migrations, BE-007: Users table | Cannot run migrations |
| **DEP-014** | DO-006: Cloudflare R2 bucket | BE-035: R2 upload, FE-032: Scan image upload | Photo storage broken |
| **DEP-015** | DO-007: Backend CI | BE-001+: All backend tasks | Cannot merge backend code |
| **DEP-016** | DO-008: Frontend CI | FE-001+: All frontend tasks | Cannot merge frontend code |
| **DEP-017** | DO-015: EAS Build config | FE-028: Camera screen, BE-028: Expo spike | Cannot test on physical devices |
| **DEP-018** | DO-032: Secrets audit | BLK-002 resolution | Launch blocked if secrets leaked |
| **DEP-019** | DO-035: k6 load tests pass | Launch gate | Performance not validated |

---

## LAUNCH BLOCKERS (DevOps-Specific)

| ID | Blocker | Owner | Target Week | Status |
|----|---------|-------|-------------|--------|
| **BLK-012** | Expo camera spike — managed vs. bare workflow decision confirmed | Person A | W2 | NOT STARTED |
| **BLK-014** | CI pipeline enforces no reversal language (grep lint) | Person A | W3 | NOT STARTED |

---

## RISK REGISTER (DevOps-Specific)

| Risk ID | Description | Probability | Impact | Mitigation | Status |
|---------|-------------|-------------|--------|------------|--------|
| **RSK-001** | Expo camera requires ejection to bare workflow | MEDIUM | HIGH | Week 2 spike (DO-017, BE-028) — 2-day proto validates managed workflow before architecture commit | OPEN |
| **RSK-009** | Railway.app performance insufficient at beta load | LOW | MEDIUM | k6 load test at Week 13 (DO-035), migration plan to Fly.io pre-documented (DO-038) | OPEN |
| **RSK-014** | Production secrets leaked in git history | LOW | CRITICAL | Secrets audit Week 13 (DO-032), git-secrets + truffleHog scan, rotation procedure documented | OPEN |
| **RSK-015** | Railway outage during launch week | LOW | HIGH | Uptime monitoring (DO-014) with 2-minute alerting, rollback procedure tested (DO-037), Fly.io migration plan ready (DO-038) | OPEN |

---

## WEEKLY DEVOPS DELIVERABLES

| Week | Phase | Primary Deliverable | Milestone / Gate |
|------|-------|---------------------|------------------|
| **1** | P0 | Monorepo, secrets, Railway, R2, CI pipelines (backend, frontend), monitoring (Sentry, Uptime) | **Foundation complete** — all infra ready for BE/FE code |
| **2** | P0 | EAS Build config, dev build distribution, database backups, R2 lifecycle rules, **Expo camera spike (BLK-012)** | **Week 2 gate** — Expo spike resolves architecture decision |
| **3** | P1 | E2E test scaffold, OWASP scan setup, **reversal grep in CI (BLK-014)** | Reversal language CI enforcement active |
| **4** | P1 | Database backup restore test, migration rollback test | Disaster recovery procedures validated |
| **6** | P2 | Cost monitoring (OpenAI, infra, free users), performance monitoring (scan latency, dashboard), auto-scaling config | Observability complete |
| **7** | P2 | Cache hit rate dashboard, Redis tuning | Cost optimization active |
| **13** | P3 | **Load tests (DO-035 — gate)**, secrets audit (DO-032), TLS verification, rate limit stress test, hotfix + rollback tests | **Week 13 gate** — all performance + security tests pass |
| **14** | P3 | Pre-launch checklist review, Fly.io migration docs (DO-038), final staging validation | Launch readiness confirmed |
| **15** | P4 | **Production deployment (DO-039 — gate)**, go-live monitoring rotation, App Store/Play Store submission | **LAUNCH** |

---

## CRITICAL PATH (DevOps)

**Any slip here → launch slips:**

1. **Week 1:** DO-001 (monorepo) → DO-003 (secrets) → DO-005 (Railway) → DO-006 (R2) → DO-007 (backend CI) → DO-008 (frontend CI)
2. **Week 2:** DO-015 (EAS Build) → DO-017 (dev builds) → **BE-028 + FE-028 (Expo camera spike — BLK-012)**
3. **Week 3:** DO-007 updated with reversal grep (**BLK-014**)
4. **Week 13:** DO-035 (**k6 load test gate**) → DO-032 (secrets audit) → DO-034 (rate limit test)
5. **Week 15:** DO-039 (**production deploy gate**) → DO-041 (App Store submit) → **LAUNCH**

---

## SUCCESS METRICS (DevOps-Specific)

**Tracked via Railway, Sentry, BetterUptime:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API uptime** | ≥99.5% | BetterUptime dashboard (SPEC PER-008) |
| **Crash-free rate** | ≥99.5% | Sentry dashboard (SPEC PER-009, VAL-027) |
| **Scan API P95 latency** | ≤5s | Railway logs + PostHog custom events (SPEC PER-001, VAL-003) |
| **Dashboard P95 latency** | ≤1s | Railway logs (SPEC PER-004) |
| **GDPR export P95** | ≤10s | Backend logging (SPEC PER-005, VAL-010) |
| **OpenAI cost/scan (blended)** | ≤$0.05 | PostgreSQL query on `scans.cost_usd` (SPEC CON-001) |
| **Monthly infra cost (5K MAU)** | ≤$500 | Railway billing dashboard (SPEC CON-002) |
| **Redis cache hit rate** | ≥40% | Redis counters (SPEC PER-010) |
| **Deployment frequency** | 2-3x/week | GitHub Actions logs |
| **Mean time to recovery (MTTR)** | <30 min | Incident log (DO-040) |

---

## END OF DEVOPS PLAN

**Version:** 1.0  
**Status:** ACTIVE  
**Next Review:** Week 1 end (2026-03-13)  
**Owner:** Person A  
**Approver:** Founder/PM

**This document is your daily infrastructure checklist. Update task statuses weekly. Any blocker or production incident → escalate immediately. DevOps is the critical path enabler — if these tasks slip, the entire project slips.**

