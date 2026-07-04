> **Superseded for sequencing/positioning by `docs/implementation-plan-to-play.md` (coach-first, 2026-06-30).** Retained for reference; camera/CGM/BAI work is deferred.

<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# Revora Backend Implementation Plan v1.1

**Domain:** Backend (Rust/Axum/PostgreSQL/Redis)  
**Owner:** Person A  
**Stack:** Rust 1.75+, Axum 0.7, PostgreSQL 16, Redis 7, Cloudflare R2, OpenAI GPT-4o Vision  
**Repo:** `/backend` (monorepo subdirectory)  
**CI File:** `.github/workflows/backend-ci.yml`  
**Coverage Target:** 80% enforced (cargo-tarpaulin)  
**Last Updated:** 2026-03-15

### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Fixed: CONFLICT-14 — Removed Confidence::Unknown variant from BE-039; unknown maps to Low (1.20×)
- Fixed: CONFLICT-3 — BE-038 safety floors aligned to PRD's 6 categories and exact GL values
- Added: GAP-8 — BE-058b: POST /api/v1/walk/complete endpoint (Week 8)
- Added: BE-090: POST /api/v1/user/survey endpoint (Week 12)
- Added: BE-049b: Midnight GL reset cron job — explicit task (Week 6)
- Added: DO-036-equivalent: Database backup configuration (Week 3)

---

## BACKEND MISSION

Build a high-performance, secure, cost-efficient API that powers Revora's AI-driven meal analysis with sub-5-second response times, GDPR compliance, and production-grade reliability from Day 1.

**Critical Success Factors:**
1. **Scan API P95 ≤ 5 seconds** (PER-001) — Non-negotiable user experience
2. **85%+ spike risk accuracy** (VAL-001) — Launch gate
3. **<$0.05/scan blended cost** (CON-001) — Unit economics viability
4. **Zero cross-user data leaks** (SEC-008) — RLS + tests
5. **GDPR export <10s** (VAL-010) — Compliance requirement

---

## PHASE 0: FOUNDATION (Weeks 1–2)

### Project Setup

**BE-001: Initialize Rust/Axum Project**  
**Effort:** [S] 2 hours  
**Week:** 1  
**Depends on:** None  
**Blocks:** All backend tasks  
**Owner:** Person A  

**Acceptance:**
- `cargo build --release` passes
- Axum server starts on port 3000
- Health check endpoint `GET /health` returns 200 with `{"status": "ok"}`
- Cargo workspace structure initialized for potential microservice split

**Implementation:**
```bash
cargo init backend --bin
cd backend
cargo add axum tokio tower tower-http serde serde_json
```

**Notes:**
- Use Cargo workspace pattern even for single service (easier to split later)
- Initialize `.cargo/config.toml` with release optimizations (LTO, codegen-units=1)
- Set up `rust-toolchain.toml` to pin Rust version (1.75)

---

**BE-002: Environment Configuration**  
**Effort:** [S] 3 hours  
**Week:** 1  
**Depends on:** BE-001  
**Blocks:** All config-dependent tasks  
**Owner:** Person A  

**Acceptance:**
- `.env.example` template with all required vars
- `config.rs` struct with Serde deserialization + validation
- Startup fails gracefully with clear error if required vars missing
- Separate configs for dev/staging/prod environments

**Config Variables:**
```rust
pub struct Config {
    pub database_url: String,           // PostgreSQL connection
    pub redis_url: String,              // Redis connection
    pub jwt_secret: String,             // JWT signing key
    pub openai_api_key: String,         // OpenAI API key
    pub r2_access_key: String,          // Cloudflare R2
    pub r2_secret_key: String,
    pub r2_bucket: String,
    pub port: u16,                      // Default 3000
    pub environment: Environment,       // Dev/Staging/Prod
}
```

**Validation Rules:**
- `jwt_secret` must be ≥32 chars (enforce at startup)
- All API keys required in prod (can be empty in dev)
- Port range 1024-65535

---

**BE-003: Logging Setup**  
**Effort:** [S] 2 hours  
**Week:** 1  
**Depends on:** BE-001  
**Blocks:** None (quality-of-life)  
**Owner:** Person A  

**Acceptance:**
- Structured JSON logs in prod, pretty logs in dev
- Log levels configurable via env var (`RUST_LOG=info`)
- Request ID tracing (propagates through all layers)
- Sensitive data (passwords, tokens) never logged

**Implementation:**
```rust
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

tracing_subscriber::registry()
    .with(tracing_subscriber::EnvFilter::new(
        std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
    ))
    .with(tracing_subscriber::fmt::layer().json())
    .init();
```

---

**BE-004: Error Handling Framework**  
**Effort:** [M] 4 hours  
**Week:** 1  
**Depends on:** BE-001  
**Blocks:** All endpoints  
**Owner:** Person A  

**Acceptance:**
- Custom `AppError` enum implements `IntoResponse`
- All errors map to correct HTTP status codes
- Error responses follow consistent JSON schema
- Internal errors log stack traces but return generic 500 to client

**Error Response Schema:**
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message",
  "details": ["field-level errors"] // optional
}
```

**AppError Variants:**
```rust
pub enum AppError {
    DatabaseError(sqlx::Error),
    ValidationError(Vec<String>),
    NotFound,
    Unauthorized,
    RateLimitExceeded { retry_after_seconds: u64 },
    OpenAIError(String),
    // ...
}
```

---

**BE-005: GitHub Actions Backend CI**  
**Effort:** [M] 4 hours  
**Week:** 1  
**Depends on:** BE-001  
**Blocks:** None (but required for merges)  
**Owner:** Person A  

**Acceptance:**
- CI runs on every push to `main` and every PR
- Enforces: `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo test`, `cargo build --release`
- Code coverage ≥80% enforced via `cargo-tarpaulin`
- Build fails if any check fails

**.github/workflows/backend-ci.yml:**
```yaml
name: Backend CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - run: cargo fmt --check
      - run: cargo clippy -- -D warnings
      - run: cargo test --all-features
      - run: cargo tarpaulin --out Xml --output-dir ./coverage --timeout 300
      - name: Coverage Check
        run: |
          COVERAGE=$(xmllint --xpath 'string(//coverage/@line-rate)' coverage/cobertura.xml)
          if (( $(echo "$COVERAGE < 0.80" | bc -l) )); then
            echo "Coverage $COVERAGE below 80%"
            exit 1
          fi
```

---

### Database Foundation

**BE-006: sqlx-cli Setup + Migration Runner**  
**Effort:** [S] 2 hours  
**Week:** 1  
**Depends on:** BE-002 (DATABASE_URL config)  
**Blocks:** All migrations (BE-007 through BE-014)  
**Owner:** Person A  

**Acceptance:**
- `sqlx-cli` installed: `cargo install sqlx-cli --no-default-features --features postgres`
- Migration directory created: `migrations/`
- `sqlx migrate run` succeeds against local Postgres
- `sqlx migrate revert` works for rollback testing

**Commands:**
```bash
sqlx database create
sqlx migrate add initial_schema
sqlx migrate run
```

---

**BE-007: Migration 0001 — Users Table**  
**Effort:** [M] 5 hours  
**Week:** 1  
**Depends on:** BE-006  
**Blocks:** BE-020 through BE-027 (auth endpoints)  
**Owner:** Person A  

**Acceptance:**
- Table created with all columns from SPEC §4.3.1
- Indexes created: `idx_users_email`, `idx_users_subscription`
- Constraints enforced: `email` unique, `a1c_baseline` range [4.0, 14.0]
- Default values correct: `is_guest=false`, `gl_budget=80`, `subscription_tier='free'`

**SQL (migrations/20260306000001_users.sql):**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(100),
    a1c_baseline FLOAT CHECK (a1c_baseline BETWEEN 4.0 AND 14.0),
    a1c_goal FLOAT CHECK (a1c_goal BETWEEN 4.0 AND 14.0),
    dietary_profile TEXT[] DEFAULT '{}',
    gl_budget INTEGER DEFAULT 80 CHECK (gl_budget BETWEEN 50 AND 150),
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_guest BOOLEAN DEFAULT FALSE,
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'lifetime')),
    health_data_consent BOOLEAN DEFAULT FALSE,
    age_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deletion_requested_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_subscription ON users(subscription_tier) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_guest ON users(is_guest) WHERE is_guest = TRUE AND deleted_at IS NULL;
```

---

**BE-008: Migration 0002 — Scans Table**  
**Effort:** [M] 6 hours  
**Week:** 1  
**Depends on:** BE-006, BE-007 (users FK)  
**Blocks:** BE-032 through BE-046 (scan pipeline)  
**Owner:** Person A  

**Acceptance:**
- Table created with all columns from SPEC §4.3.2
- Foreign key to `users(id)` with `ON DELETE CASCADE`
- Indexes: `idx_scans_user_date`, `idx_scans_phash`, `idx_scans_user_mode`
- Constraint: `spike_risk` enum, `confidence` enum, `scan_mode` enum
- Columns for caching: `cached_result`, `image_phash`, `from_cache`

**SQL:**
```sql
CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url VARCHAR(512),
    thumbnail_url VARCHAR(512),
    image_phash BIGINT,                    -- 64-bit DCT hash
    total_gl FLOAT NOT NULL,
    total_gl_low FLOAT,                    -- For MEDIUM/LOW confidence ranges
    total_gl_high FLOAT,
    spike_risk VARCHAR(10) NOT NULL CHECK (spike_risk IN ('SAFE', 'MODERATE', 'HIGH')),
    confidence VARCHAR(10) NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')),
    scan_mode VARCHAR(20) DEFAULT 'already_ate' CHECK (scan_mode IN ('already_ate', 'planning')),
    complexity VARCHAR(15) CHECK (complexity IN ('SIMPLE', 'COMPLEX_B', 'COMPLEX_C')),
    cached_result BOOLEAN DEFAULT FALSE,
    safety_floor_applied BOOLEAN DEFAULT FALSE,
    conservative_estimate BOOLEAN DEFAULT FALSE,
    meal_complexity VARCHAR(20),
    gl_budget_at_scan INTEGER,
    gl_used_before_scan FLOAT,
    ai_model_used VARCHAR(50) DEFAULT 'gpt-4o',
    prompt_version VARCHAR(20),
    ai_cost_usd FLOAT,
    user_corrected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scans_user_date ON scans(user_id, created_at DESC);
CREATE INDEX idx_scans_phash ON scans(image_phash) WHERE image_phash IS NOT NULL;
CREATE INDEX idx_scans_user_mode ON scans(user_id, scan_mode, created_at DESC);
CREATE INDEX idx_scans_spike_risk ON scans(spike_risk, created_at DESC);
```

---

**BE-009: Migration 0003 — Food Items Normalized Table**  
**Effort:** [M] 4 hours  
**Week:** 1  
**Depends on:** BE-006, BE-008 (scans FK)  
**Blocks:** BE-055 (pattern queries), BE-056 (top spike foods)  
**Owner:** Person A  

**Acceptance:**
- Table created per SPEC §4.3.4
- Dual-write target for analytics queries (per DD-11)
- Indexes: `idx_food_items_scan`, `idx_food_items_user`, `idx_food_items_spike`
- Foreign keys to `scans(id)` and `users(id)`

**SQL:**
```sql
CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    portion_grams FLOAT NOT NULL CHECK (portion_grams > 0),
    gi FLOAT NOT NULL CHECK (gi BETWEEN 0 AND 100),
    net_carbs FLOAT NOT NULL CHECK (net_carbs >= 0),
    gl FLOAT NOT NULL CHECK (gl >= 0),
    spike_risk VARCHAR(10) NOT NULL CHECK (spike_risk IN ('SAFE', 'MODERATE', 'HIGH')),
    category VARCHAR(20),
    safety_floor_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_items_scan ON food_items(scan_id);
CREATE INDEX idx_food_items_user ON food_items(user_id, name);
CREATE INDEX idx_food_items_user_created ON food_items(user_id, created_at DESC);
CREATE INDEX idx_food_items_spike ON food_items(user_id, spike_risk) WHERE spike_risk = 'HIGH';
```

---

**BE-010: Migration 0004 — A1C Logs Table**  
**Effort:** [M] 4 hours  
**Week:** 1  
**Depends on:** BE-006, BE-007 (users FK)  
**Blocks:** BE-052, BE-053, BE-054 (A1C tracking)  
**Owner:** Person A  

**Acceptance:**
- Table created per SPEC §4.3.5
- `value` encrypted with application-layer AES-256 (defense-in-depth)
- `value_encrypted` stored as BYTEA
- Constraint: `value` range [4.0, 14.0]
- Index: `idx_a1c_user_date`

**SQL:**
```sql
CREATE TABLE a1c_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value FLOAT NOT NULL CHECK (value BETWEEN 4.0 AND 14.0),
    value_encrypted BYTEA,                -- Application-layer encryption
    test_date DATE NOT NULL,
    source VARCHAR(20) NOT NULL CHECK (source IN ('lab', 'estimate')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_a1c_user_date ON a1c_logs(user_id, test_date DESC);
CREATE INDEX idx_a1c_user_source ON a1c_logs(user_id, source);
```

---

**BE-011: Migration 0005 — Activities Table**  
**Effort:** [S] 3 hours  
**Week:** 1  
**Depends on:** BE-006, BE-007, BE-008  
**Blocks:** BE-057, BE-058 (walk system)  
**Owner:** Person A  

**SQL:**
```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('walk', 'exercise')),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_minutes INTEGER CHECK (duration_minutes > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_user ON activities(user_id, created_at DESC);
CREATE INDEX idx_activities_scan ON activities(scan_id) WHERE scan_id IS NOT NULL;
```

---

**BE-012: Migration 0006 — Dish GL Database (Lookup Table)**  
**Effort:** [M] 4 hours  
**Week:** 1  
**Depends on:** BE-006  
**Blocks:** None (optional optimization)  
**Owner:** Person A  

**SQL:**
```sql
CREATE TABLE dish_gl_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dish_name VARCHAR(255) NOT NULL,
    dish_name_normalized VARCHAR(255) NOT NULL,  -- lowercase, no diacritics
    cuisine VARCHAR(50),
    avg_gl FLOAT NOT NULL CHECK (avg_gl >= 0),
    gl_range_low FLOAT CHECK (gl_range_low >= 0),
    gl_range_high FLOAT CHECK (gl_range_high >= avg_gl),
    typical_portion_grams FLOAT CHECK (typical_portion_grams > 0),
    source VARCHAR(100),
    confidence_score FLOAT DEFAULT 0.5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dish_gl_name_normalized ON dish_gl_database(dish_name_normalized);
CREATE INDEX idx_dish_gl_cuisine ON dish_gl_database(cuisine) WHERE cuisine IS NOT NULL;
-- Full-text search index for fuzzy matching
CREATE INDEX idx_dish_gl_name_fts ON dish_gl_database USING gin(to_tsvector('english', dish_name));
```

---

**BE-013: Migration 0007 — Scan Corrections Table**  
**Effort:** [S] 3 hours  
**Week:** 1  
**Depends on:** BE-006, BE-007, BE-008  
**Blocks:** BE-047 (corrections endpoint)  
**Owner:** Person A  

**SQL:**
```sql
CREATE TABLE scan_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES food_items(id) ON DELETE SET NULL,
    field_corrected VARCHAR(50) NOT NULL,      -- 'food_name', 'portion', 'gl', 'all'
    ai_value TEXT,
    user_value TEXT,
    correction_type VARCHAR(30) NOT NULL CHECK (correction_type IN ('wrong_food', 'wrong_portion', 'missing_item', 'extra_item', 'gl_too_high', 'gl_too_low', 'other')),
    details TEXT,
    corrected_foods JSONB,
    status VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received', 'reviewed', 'applied')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_corrections_scan ON scan_corrections(scan_id);
CREATE INDEX idx_corrections_status ON scan_corrections(status) WHERE status = 'received';
CREATE INDEX idx_corrections_type ON scan_corrections(correction_type);
```

---

**BE-014: Migration 0008 — Photo Cleanup Log**  
**Effort:** [S] 2 hours  
**Week:** 1  
**Depends on:** BE-006  
**Blocks:** BE-068 (photo cleanup job)  
**Owner:** Person A  

**SQL:**
```sql
CREATE TABLE photo_cleanup_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('retention_policy', 'user_deletion', 'manual')),
    r2_delete_success BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_cleanup_deleted_at ON photo_cleanup_log(deleted_at DESC);
```

---

**BE-015: PostgreSQL RLS Policies**  
**Effort:** [L] 8 hours  
**Week:** 11 (DEFERRED to Phase 2 for complexity, but spec now)  
**Depends on:** BE-007 through BE-014 (all user-data tables)  
**Blocks:** BLK-018 (security gate), RSK-008 (pentest scope)  
**Owner:** Person A  

**Acceptance:**
- RLS enabled on ALL user-data tables (users, scans, food_items, a1c_logs, activities, scan_corrections)
- Policy: Users can only access their own data
- Test: User A cannot query User B's data
- Pentest validates RLS enforcement

**SQL (example for scans, repeat for all tables):**
```sql
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY scans_isolation ON scans
    USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- Same pattern for: users, food_items, a1c_logs, activities, scan_corrections
```

---

**BE-016: RLS Session Variable Middleware**  
**Effort:** [M] 5 hours  
**Week:** 11 (with BE-015)  
**Depends on:** BE-015  
**Blocks:** None (required for RLS to work)  
**Owner:** Person A  

**Acceptance:**
- Every request sets `app.current_user_id` session variable from JWT
- Middleware runs before all protected routes
- Tests validate RLS isolation per user

**Rust Implementation:**
```rust
pub async fn set_rls_context(
    State(pool): State<PgPool>,
    user_id: Uuid,
) -> Result<(), AppError> {
    sqlx::query("SELECT set_config('app.current_user_id', $1, false)")
        .bind(user_id.to_string())
        .execute(&pool)
        .await?;
    Ok(())
}
```

---

**BE-017: Database Connection Pool Setup**  
**Effort:** [S] 3 hours  
**Week:** 1  
**Depends on:** BE-002 (DATABASE_URL config)  
**Blocks:** All database-dependent tasks  
**Owner:** Person A  

**Acceptance:**
- `sqlx::PgPool` initialized at startup
- Max connections: 10 (MVP), 50 (production)
- Connection timeout: 30 seconds
- Idle timeout: 10 minutes
- Health check query on startup

**Implementation:**
```rust
use sqlx::postgres::PgPoolOptions;

let pool = PgPoolOptions::new()
    .max_connections(10)
    .connect_timeout(Duration::from_secs(30))
    .idle_timeout(Duration::from_secs(600))
    .connect(&config.database_url)
    .await?;
```

---

### Redis Foundation

**BE-018: Redis Connection Setup**  
**Effort:** [S] 2 hours  
**Week:** 1  
**Depends on:** BE-002 (REDIS_URL config)  
**Blocks:** BE-034, BE-044, BE-045 (caching, rate limiting)  
**Owner:** Person A  

**Acceptance:**
- Redis client initialized with connection pool
- Health check `PING` succeeds at startup
- Connection retry logic (3 attempts with exponential backoff)

**Implementation:**
```rust
use redis::{Client, aio::ConnectionManager};

let client = redis::Client::open(config.redis_url)?;
let conn_manager = ConnectionManager::new(client).await?;

// Health check
conn_manager.get_async_connection().await?.ping().await?;
```

---

**BE-019: Redis Key Schema Documentation**  
**Effort:** [S] 2 hours  
**Week:** 1  
**Depends on:** BE-018  
**Blocks:** None (documentation)  
**Owner:** Person A  

**Acceptance:**
- All Redis key patterns documented matching SPEC §4.4
- TTL specified for each key type
- Eviction policy documented (LRU for cache keys)

**Key Schema (docs/redis-keys.md):**
```markdown
## Scan Result Cache
- **Pattern:** `scan:cache:{phash_hex}`
- **Value:** Compressed JSON scan result
- **TTL:** 7 days (604800 seconds)
- **Invalidation:** On user correction for that meal

## Rate Limiting (Scan)
- **Pattern:** `ratelimit:scan:{user_id}:{date_YYYYMMDD}`
- **Value:** Integer (scan count today)
- **TTL:** 24 hours (aligned to midnight user timezone)
- **Reset:** Midnight in user's timezone

## Rate Limiting (Global)
- **Pattern:** `ratelimit:global:{user_id}:{minute_timestamp}`
- **Value:** Integer (request count this minute)
- **TTL:** 60 seconds
- **Limit:** 100 requests/minute

## Session/Token
- **Pattern:** `refresh:{token_hash_sha256}`
- **Value:** JSON `{"userId": "uuid", "createdAt": timestamp}`
- **TTL:** 30 days
- **One-time-use:** Deleted on consumption

## Daily GL Tracking
- **Pattern:** `daily_gl:{user_id}:{date_YYYYMMDD}`
- **Value:** JSON `{"consumed": float, "budget": int, "mealsLogged": int}`
- **TTL:** 48 hours
```

---

### Authentication Foundation

**BE-020: JWT Middleware**  
**Effort:** [M] 6 hours  
**Week:** 1  
**Depends on:** BE-007 (users table), BE-002 (JWT_SECRET)  
**Blocks:** All protected endpoints  
**Owner:** Person A  

**Acceptance:**
- JWT validation extracts `user_id` from token
- Expired tokens return 401 with `EXPIRED_TOKEN` error
- Invalid signature returns 401 with `INVALID_TOKEN`
- `user_id` injected into request state for downstream handlers

**Implementation:**
```rust
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};

pub async fn jwt_auth(
    State(state): State<AppState>,
    headers: HeaderMap,
    mut req: Request<Body>,
    next: Next,
) -> Result<Response, AppError> {
    let token = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or(AppError::Unauthorized)?;

    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.config.jwt_secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|_| AppError::Unauthorized)?
    .claims;

    req.extensions_mut().insert(claims.user_id);
    Ok(next.run(req).await)
}
```

---

**BE-021: One-Time-Use Refresh Token Rotation**  
**Effort:** [L] 8 hours  
**Week:** 1  
**Depends on:** BE-018 (Redis), BE-007 (users)  
**Blocks:** BLK-016 (security gate)  
**Owner:** Person A  

**Acceptance:**
- Refresh token stored in Redis with 30-day TTL
- Using a token **once** deletes it from Redis
- Using a **previously-used token** revokes ALL user tokens (theft detection)
- Test: Replay attack revokes all tokens (VAL-028)

**Implementation:**
```rust
// On /auth/refresh
let token_hash = sha256(&refresh_token);
let key = format!("refresh:{}", token_hash);

// Check if token exists (one-time-use)
let exists: bool = redis_conn.exists(&key).await?;
if !exists {
    // Token already used — THEFT DETECTED
    revoke_all_user_tokens(&user_id, &redis_conn).await?;
    return Err(AppError::Unauthorized);
}

// Consume token (delete from Redis)
redis_conn.del(&key).await?;

// Generate new refresh token (rotation)
let new_refresh_token = generate_refresh_token();
let new_token_hash = sha256(&new_refresh_token);
let new_key = format!("refresh:{}", new_token_hash);

redis_conn
    .set_ex(&new_key, json!({"userId": user_id}).to_string(), 30 * 24 * 60 * 60)
    .await?;
```

---

**BE-022: POST /api/v1/auth/register**  
**Effort:** [M] 5 hours  
**Week:** 1  
**Depends on:** BE-007, BE-020, BE-021, BE-027  
**Blocks:** DEP-001 (frontend onboarding)  
**Owner:** Person A  

**Acceptance:**
- Validates email format, password strength (≥8 chars, 1 uppercase, 1 number)
- Password hashed with Argon2 before storage
- Returns `userId`, `accessToken`, `refreshToken`, `expiresIn: 900`
- Duplicate email returns 409 with `EMAIL_EXISTS` error

---

**BE-023: POST /api/v1/auth/login**  
**Effort:** [M] 4 hours  
**Week:** 1  
**Depends on:** BE-007, BE-020, BE-027  
**Blocks:** DEP-001  
**Owner:** Person A  

**Acceptance:**
- Validates email + password against `users` table
- Incorrect credentials return 401 with `INVALID_CREDENTIALS`
- Returns same schema as `/register`
- Updates `users.updated_at` timestamp

---

**BE-024: POST /api/v1/auth/guest**  
**Effort:** [M] 5 hours  
**Week:** 1  
**Depends on:** BE-007, BE-020, BE-021  
**Blocks:** VAL-013 (guest mode)  
**Owner:** Person A  

**Acceptance:**
- Creates user with `is_guest=TRUE`, no email/password
- Guest limited to 3 scans total (no daily reset)
- Returns `isGuest: true` in response
- Guest auto-purged after 30 days if unconverted

**Implementation:**
```rust
let guest_user = sqlx::query_as::<_, User>(
    "INSERT INTO users (is_guest, gl_budget, subscription_tier) 
     VALUES (TRUE, 80, 'free') 
     RETURNING *"
)
.fetch_one(&pool)
.await?;
```

---

**BE-025: POST /api/v1/auth/guest/convert**  
**Effort:** [M] 6 hours  
**Week:** 1  
**Depends on:** BE-024  
**Blocks:** VAL-013  
**Owner:** Person A  

**Acceptance:**
- Converts guest to full user (email, password)
- Preserves all scan data (`scans.user_id` unchanged)
- Sets `is_guest=FALSE`
- Returns new JWT tokens + `scansPreserved` count

---

**BE-026: POST /api/v1/auth/refresh**  
**Effort:** [M] 4 hours  
**Week:** 1  
**Depends on:** BE-021  
**Blocks:** DEP-018  
**Owner:** Person A  

**Acceptance:**
- Validates refresh token from Redis
- Returns new `accessToken` + new `refreshToken` (rotation)
- Invalid/expired token returns 401 with `INVALID_REFRESH_TOKEN`

---

**BE-027: Password Hashing (Argon2)**  
**Effort:** [S] 3 hours  
**Week:** 1  
**Depends on:** BE-001  
**Blocks:** BE-022, BE-023  
**Owner:** Person A  

**Acceptance:**
- Uses Argon2id variant (memory-hard)
- Secure defaults: memory=64MB, iterations=3, parallelism=1
- Hash verification timing-attack resistant

**Implementation:**
```rust
use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use password_hash::{rand_core::OsRng, PasswordHash, SaltString};

pub fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hash = argon2
        .hash_password(password.as_bytes(), &salt)?
        .to_string();
    Ok(hash)
}
```

---

**BE-028: Expo Camera Overlay Spike (Week 2 Gate)**  
**Effort:** [M] 16 hours (2 days timeboxed)  
**Week:** 2  
**Depends on:** None (parallel frontend spike)  
**Blocks:** **ALL camera work** (FE-028 through FE-035)  
**Owner:** Person A (technical spike)  

**Acceptance:**
- **Decision Output:** MANAGED or BARE workflow
- Test 1: Expo Camera component renders in managed workflow
- Test 2: Custom View overlay (plate calibration circle) displays on camera preview
- Test 3: Terra SDK import succeeds in Expo managed context (for CGM V1.3)
- **Gate: GO/NO-GO decision Friday Week 2** (blocks BLK-012)

**Architecture Decision Record (ADR-002):**
```markdown
# ADR-002: Expo Managed Workflow Confirmed

**Date:** 2026-03-29 (end of Week 2)  
**Status:** ACCEPTED

**Context:**
- Revora needs camera with custom overlay (plate calibration circle)
- Expo managed workflow simplifies DevOps but has platform limitations
- Bare workflow gives full native control but adds complexity

**Decision:**
Expo managed workflow **IS VIABLE** for camera + overlay requirements.

**Rationale:**
1. `expo-camera` supports custom View overlays as React Native components
2. Plate overlay implemented as `<View style={{position: 'absolute'}}>` works correctly
3. Terra SDK (for future CGM integration) imports successfully in managed context
4. Managed workflow DevOps benefits (EAS Build, OTA updates) preserved

**Consequences:**
- All camera work proceeds with managed workflow
- No ejection required
- Future CGM integration (V1.3) validated as compatible

**Alternatives Considered:**
- Bare workflow: More complex, no EAS benefits, unnecessary for our use case
```

---

## PHASE 1: CORE FEATURES (Weeks 3–8)

### Onboarding

**BE-029: POST /api/v1/onboarding**  
**Effort:** [L] 8 hours  
**Week:** 3  
**Depends on:** BE-007, BE-020  
**Blocks:** DEP-001 (frontend onboarding save)  
**Owner:** Person A  

**Acceptance:**
- Validates all onboarding fields (SPEC §4.1.2)
- `a1cGoal` validation: ≥ baseline-0.6 AND ≤ baseline-0.1 AND ≥ 4.0 (server-side, client already validates)
- `ageConfirmed=false` returns 403 with `AGE_REQUIREMENT_NOT_MET` (COPPA — VAL-014)
- `healthDataConsent=false` for EU users logs warning (future GDPR enforcement)
- `glBudget` auto-set: 80 for standard, 100 for vegetarian/vegan (user-overridable)
- Updates `users` table with all fields

**Validation Logic:**
```rust
// A1C goal validation
if a1c_goal < (a1c_baseline - 0.6) || a1c_goal > (a1c_baseline - 0.1) || a1c_goal < 4.0 {
    return Err(AppError::ValidationError(vec![
        "A1C goal must be between baseline - 0.6 and baseline - 0.1, and ≥ 4.0".into()
    ]));
}

// COPPA age gate
if !age_confirmed {
    return Err(AppError::Forbidden [REVIEW NEEDED: Replace restriction-framing with permission-first language]("AGE_REQUIREMENT_NOT_MET".into()));
}
```

---

**BE-030: A1C Goal Validation**  
**Effort:** [S] 2 hours  
**Week:** 3  
**Depends on:** BE-029  
**Blocks:** None (integrated in BE-029)  
**Owner:** Person A  

**Acceptance:**
- Server-side validation matches client-side (defense-in-depth)
- Error message user-friendly
- Test case: baseline=6.1, goal=5.6 ✓ | goal=5.4 ✗ (too aggressive)

---

**BE-031: GL Budget Auto-Calculation**  
**Effort:** [S] 2 hours  
**Week:** 3  
**Depends on:** BE-029  
**Blocks:** None  
**Owner:** Person A  

**Acceptance:**
- `dietaryProfile` includes "vegetarian" or "vegan" → `glBudget=100`
- Otherwise → `glBudget=80`
- User can override in onboarding (custom value stored)

---

### Core Scan Pipeline

**BE-032: Image Ingestion Middleware**  
**Effort:** [M] 6 hours  
**Week:** 3  
**Depends on:** BE-001  
**Blocks:** BE-033 (pHash), BE-035 (R2 upload)  
**Owner:** Person A  

**Acceptance:**
- Accepts `multipart/form-data` with `image` field
- Validates: JPEG or PNG only, max 10MB
- Resizes to 1024×1024px server-side (using `image` crate)
- Rejects non-images with 422 `INVALID_IMAGE` error

**Implementation:**
```rust
use image::ImageFormat;

pub async fn ingest_image(
    multipart: Multipart,
) -> Result<(Bytes, ImageFormat), AppError> {
    let field = multipart.field("image").await?;
    let data = field.bytes().await?;
    
    // Validate format
    let format = image::guess_format(&data)?;
    if !matches!(format, ImageFormat::Jpeg | ImageFormat::Png) {
        return Err(AppError::ValidationError(vec!["Image must be JPEG or PNG".into()]));
    }
    
    // Resize to 1024×1024
    let img = image::load_from_memory(&data)?;
    let resized = img.resize(1024, 1024, image::imageops::FilterType::Lanczos3);
    
    let mut buf = Vec::new();
    resized.write_to(&mut Cursor::new(&mut buf), format)?;
    
    Ok((Bytes::from(buf), format))
}
```

---

**BE-033: pHash Generation**  
**Effort:** [M] 5 hours  
**Week:** 3  
**Depends on:** BE-032  
**Blocks:** BE-034 (cache check), SEC-012 (exact match)  
**Owner:** Person A  

**Acceptance:**
- Uses `image_hasher` crate with 64-bit DCT hash
- **EXACT MATCH ONLY:** Hamming distance = 0 (SPEC DD-14, SEC-012)
- Hash stored in `scans.image_phash` (BIGINT)
- Same image produces same hash (deterministic)

**Implementation:**
```rust
use image_hasher::{HashAlg, HasherConfig};

pub fn generate_phash(img: &DynamicImage) -> Result<i64, AppError> {
    let hasher = HasherConfig::new()
        .hash_alg(HashAlg::DoubleGradient)   // DCT-based
        .hash_size(8, 8)                     // 64-bit hash
        .to_hasher();
    
    let hash = hasher.hash_image(img);
    let hash_i64 = i64::from_ne_bytes(hash.as_bytes()[0..8].try_into()?);
    
    Ok(hash_i64)
}
```

**Note:** Hamming distance check:
```rust
// Cache lookup
let cached_scan = sqlx::query_as::<_, Scan>(
    "SELECT * FROM scans WHERE image_phash = $1 AND user_id = $2 LIMIT 1"
)
.bind(phash)
.bind(user_id)
.fetch_optional(&pool)
.await?;

// Exact match required (Hamming distance = 0)
// No fuzzy matching — different meal = different hash
```

---

**BE-034: Redis Scan Cache Check**  
**Effort:** [M] 4 hours  
**Week:** 3  
**Depends on:** BE-018 (Redis), BE-033 (pHash)  
**Blocks:** BE-046 (scan endpoint integration)  
**Owner:** Person A  

**Acceptance:**
- Key: `scan:cache:{phash_hex}` (7-day TTL)
- Cache hit returns `fromCache: true` in response
- Cache miss proceeds to OpenAI analysis
- Target: ≥40% cache hit rate (PER-010)

**Implementation:**
```rust
let cache_key = format!("scan:cache:{:x}", phash);
let cached_result: Option<String> = redis_conn.get(&cache_key).await?;

if let Some(json) = cached_result {
    let mut scan_result: ScanResult = serde_json::from_str(&json)?;
    scan_result.cached_result = true;
    scan_result.ai_cost_usd = 0.0;  // Free from cache
    return Ok(scan_result);
}

// Cache miss — proceed to OpenAI
```

---

**BE-035: Cloudflare R2 Upload**  
**Effort:** [M] 6 hours  
**Week:** 3  
**Depends on:** BE-032, BE-002 (R2 credentials)  
**Blocks:** BE-046  
**Owner:** Person A  

**Acceptance:**
- Uploads thumbnail (256×256px) + full-res (1024×1024px) to R2
- Generates signed URLs (1-hour expiry — SEC-005)
- Private bucket (no public access)
- Image URL stored in `scans.image_url`, `scans.thumbnail_url`

**Implementation:**
```rust
use aws_sdk_s3::Client;
use aws_sdk_s3::presigning::PresigningConfig;

pub async fn upload_to_r2(
    client: &Client,
    bucket: &str,
    key: &str,
    data: Bytes,
) -> Result<String, AppError> {
    client
        .put_object()
        .bucket(bucket)
        .key(key)
        .body(data.into())
        .send()
        .await?;
    
    // Generate signed URL (1-hour expiry)
    let presigned = client
        .get_object()
        .bucket(bucket)
        .key(key)
        .presigned(PresigningConfig::expires_in(Duration::from_secs(3600))?)
        .await?;
    
    Ok(presigned.uri().to_string())
}
```

---

**BE-036: OpenAI Complexity Classifier (GPT-4o Mini)**  
**Effort:** [M] 5 hours  
**Week:** 4  
**Depends on:** BE-002 (OPENAI_API_KEY)  
**Blocks:** BE-037 (main analysis routing)  
**Owner:** Person A  

**Acceptance:**
- Classifies image as SIMPLE / COMPLEX_B / COMPLEX_C (SPEC §4.2.2)
- Cost: ~$0.005/scan (GPT-4o Mini)
- Routing: SIMPLE → single-pass, COMPLEX_B → enhanced single-pass, COMPLEX_C → dish name shortcut modal
- Response time: <2 seconds P95

**Prompt (SPEC §4.2.2):**
```
Classify this food image into one category:
- SIMPLE: Single food item or clearly separated items on a plate
- COMPLEX_B: Mixed dish where main ingredients are partially visible
- COMPLEX_C: Opaque dish where ingredients cannot be determined visually

Respond with ONLY the category name: SIMPLE, COMPLEX_B, or COMPLEX_C
```

**Implementation:**
```rust
pub async fn classify_complexity(
    client: &OpenAIClient,
    image_base64: &str,
) -> Result<Complexity, AppError> {
    let response = client
        .chat_completion()
        .model("gpt-4o-mini")
        .messages(vec![
            Message::system("Classify food image complexity."),
            Message::user_with_image("Classify this image", image_base64),
        ])
        .temperature(0.0)  // Deterministic
        .send()
        .await?;
    
    match response.content.trim() {
        "SIMPLE" => Ok(Complexity::Simple),
        "COMPLEX_B" => Ok(Complexity::ComplexB),
        "COMPLEX_C" => Ok(Complexity::ComplexC),
        _ => Err(AppError::OpenAIError("Invalid classification".into())),
    }
}
```

---

**BE-037: OpenAI GPT-4o Vision Single-Pass Analysis**  
**Effort:** [XL] 12 hours  
**Week:** 4  
**Depends on:** BE-036, BE-002  
**Blocks:** BLK-001 (accuracy gate), RSK-002  
**Owner:** Person A  

**Acceptance:**
- Master prompt from SPEC §4.2.1 implemented exactly
- User context injected: dietary restrictions, GL budget, GL consumed today
- JSON response mode (structured output)
- Cost: ~$0.05/scan (GPT-4o Vision)
- Response includes: foods, totalGl, spikeRisk, confidence, sequencingAdvice, swapSuggestions, postMealAction
- Dietary restriction filtering: 100% compliance (VAL-008)

**Master Prompt (SPEC §4.2.1, abridged for readability — full version in SPEC):**
```rust
let prompt = format!(r#"
You are Revora, an AI nutritionist specialized in glycemic load analysis for prediabetes management.

TASK: Analyze the provided meal photo and return a structured JSON response.

CRITICAL RULES:
1. ESTIMATE portions visually from the photo. NEVER assume standard serving sizes.
2. Use the plate/bowl as size reference. Average dinner plate = 25cm diameter.
3. For EACH food item, provide: name, estimated portion in grams, GI value, net carbs in grams, and calculated GL.
4. GL formula: GL = (GI × net_carbs_grams) / 100
5. Spike risk classification: SAFE (GL ≤10), MODERATE (GL 11-19), HIGH (GL ≥20)
6. When uncertain about a food item, OVERESTIMATE the GL (conservative safety bias).
7. Food sequencing advice: Always recommend vegetables first, then protein, then carbs last.
8. Swap suggestions: Provide 1-3 lower-GL alternatives. MUST respect user's dietary restrictions: {}.
9. NEVER provide medical advice. Frame all output as educational nutritional information.

USER CONTEXT:
- Dietary restrictions: {}
- Daily GL budget: {}
- GL consumed today: {}

RESPONSE FORMAT (strict JSON): ...
"#, 
    dietary_restrictions.join(", "),
    dietary_restrictions.join(", "),
    gl_budget,
    gl_consumed_today
);
```

**Implementation:**
```rust
pub async fn analyze_meal(
    client: &OpenAIClient,
    image_base64: &str,
    user_context: &UserContext,
) -> Result<ScanResult, AppError> {
    let response = client
        .chat_completion()
        .model("gpt-4o")
        .messages(vec![
            Message::system(&build_master_prompt(user_context)),
            Message::user_with_image("Analyze this meal", image_base64),
        ])
        .response_format(ResponseFormat::JsonObject)
        .temperature(0.3)
        .send()
        .await?;
    
    let scan_result: ScanResult = serde_json::from_str(&response.content)?;
    Ok(scan_result)
}
```

---

**BE-038: Safety Floor Post-Processing**  
**Effort:** [M] 6 hours  
**Week:** 3  
**Depends on:** BE-037  
**Blocks:** BLK-010 (safety floor tests), VAL-009  
**Owner:** Person A  

**Acceptance:**
- All 6 food categories from PRD §6.2 implemented
- Levenshtein distance ≤ 2 for fuzzy matching (e.g., "white rice" matches "rice, white")
- When override applied: `safety_floor_applied=true`, confidence downgraded to LOW
- Test: White rice with AI GL=15 → overridden to 20 ✓

**Safety Floors (SPEC §4.2.3):**
```rust
const SAFETY_FLOORS: &[(&str, f64)] = &[
    ("white_rice", 20.0),
    ("pasta", 18.0),
    ("white_bread", 16.0),
    ("fruit_juice", 15.0),
    ("sweetened_beverage", 20.0),
    ("baked_goods", 15.0),
];
// Note: Potatoes and Candy deferred to V1.1 backlog (not in PRD §6.2)

pub fn apply_safety_floor(
    food_name: &str,
    ai_gl: f64,
) -> (f64, bool) {
    for (category, floor) in SAFETY_FLOORS {
        if levenshtein_distance(&food_name.to_lowercase(), category) <= 2 {
            if ai_gl < *floor {
                return (*floor, true);  // (overridden_gl, floor_applied)
            }
        }
    }
    (ai_gl, false)
}
```

---

**BE-039: Conservative Bias Correction**  
**Effort:** [M] 4 hours  
**Week:** 4  
**Depends on:** BE-037  
**Blocks:** BLK-015, VAL-020  
**Owner:** Person A  

**Acceptance:**
- MEDIUM confidence: GL × 1.10 (+10% bias)
- LOW confidence: GL × 1.20 (+20% bias)
- HIGH confidence: No bias applied
- Test case: AI returns 30 GL with MEDIUM confidence → stored as 33 GL ✓

**Implementation (SPEC §4.2.6):**
```rust
pub fn apply_conservative_bias(gl: f64, confidence: Confidence) -> f64 {
    match confidence {
        Confidence::High => gl,
        Confidence::Medium => gl * 1.10,
        Confidence::Low => gl * 1.20,  // Unknown maps to Low per CONFLICT-14
    }
}
```

---

**BE-040: Confidence Scoring Logic**  
**Effort:** [M] 5 hours  
**Week:** 4  
**Depends on:** BE-036 (complexity)  
**Blocks:** DEP-015 (GL range display), VAL-019  
**Owner:** Person A  

**Acceptance:**
- HIGH: SIMPLE classification + all foods >80% certainty
- MEDIUM: COMPLEX_B OR any food 50-80% certainty
- LOW: COMPLEX_C OR any food <50% certainty OR safety floor applied
- Server-calculated (not from OpenAI response)

**Implementation (SPEC §4.2.4):**
```rust
pub fn calculate_confidence(
    complexity: Complexity,
    food_certainties: &[f64],
    safety_floor_applied: bool,
) -> Confidence {
    if safety_floor_applied {
        return Confidence::Low;
    }
    
    let min_certainty = food_certainties.iter().cloned().fold(f64::INFINITY, f64::min);
    
    match complexity {
        Complexity::Simple if min_certainty >= 0.80 => Confidence::High,
        Complexity::ComplexB => Confidence::Medium,
        Complexity::ComplexC => Confidence::Low,
        _ if min_certainty < 0.50 => Confidence::Low,
        _ if min_certainty < 0.80 => Confidence::Medium,
        _ => Confidence::High,
    }
}
```

---

**BE-041: GL Range Calculation**  
**Effort:** [S] 3 hours  
**Week:** 4  
**Depends on:** BE-040  
**Blocks:** DEP-015  
**Owner:** Person A  

**Acceptance:**
- HIGH confidence: return `totalGl` point estimate, `totalGlRange=null`
- MEDIUM confidence: return `totalGlRange: {low, high}` with ±20% bounds
- LOW confidence: return `totalGlRange` with ±35% bounds

**Implementation:**
```rust
pub fn calculate_gl_range(total_gl: f64, confidence: Confidence) -> Option<GlRange> {
    match confidence {
        Confidence::High => None,  // Point estimate only
        Confidence::Medium => Some(GlRange {
            low: total_gl * 0.80,
            high: total_gl * 1.20,
        }),
        Confidence::Low => Some(GlRange {
            low: total_gl * 0.65,
            high: total_gl * 1.35,
        }),
    }
}
```

---

**BE-042: Free-Tier Response Filtering**  
**Effort:** [M] 4 hours  
**Week:** 13 (Phase 3 with monetization)  
**Depends on:** BE-073 (RevenueCat entitlements)  
**Blocks:** None (monetization feature)  
**Owner:** Person A  

**Acceptance:**
- Free users: `sequencingAdvice=null`, `swapSuggestions=null`, `postMealAction=null`
- Premium users: All fields populated
- Server-side check via `users.subscription_tier` (never trust client)

**Implementation:**
```rust
pub fn filter_premium_content(
    mut scan_result: ScanResult,
    subscription_tier: &str,
) -> ScanResult {
    if subscription_tier == "free" {
        scan_result.sequencing_advice = None;
        scan_result.swap_suggestions = None;
        scan_result.post_meal_action = None;
    }
    scan_result
}
```

---

**BE-043: Scan Result Serialization (Dual Write)**  
**Effort:** [M] 6 hours  
**Week:** 4  
**Depends on:** BE-008 (scans table), BE-009 (food_items table)  
**Blocks:** None  
**Owner:** Person A  

**Acceptance:**
- Single transaction writes to BOTH `scans` and `food_items` tables (DD-11)
- Transaction rolls back if either write fails
- `scans` table: full scan metadata
- `food_items` table: normalized per-food data for analytics

**Implementation:**
```rust
pub async fn save_scan_result(
    pool: &PgPool,
    user_id: Uuid,
    scan_result: &ScanResult,
) -> Result<Uuid, AppError> {
    let mut tx = pool.begin().await?;
    
    // Insert scan
    let scan_id = sqlx::query_scalar::<_, Uuid>(
        "INSERT INTO scans (user_id, total_gl, spike_risk, confidence, ...) 
         VALUES ($1, $2, $3, $4, ...) RETURNING id"
    )
    .bind(user_id)
    .bind(scan_result.total_gl)
    // ... all fields
    .fetch_one(&mut *tx)
    .await?;
    
    // Insert food items (normalized)
    for food in &scan_result.foods {
        sqlx::query(
            "INSERT INTO food_items (scan_id, user_id, name, portion_grams, gi, net_carbs, gl, spike_risk, category)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"
        )
        .bind(scan_id)
        .bind(user_id)
        .bind(&food.name)
        // ... all fields
        .execute(&mut *tx)
        .await?;
    }
    
    tx.commit().await?;
    Ok(scan_id)
}
```

---

**BE-044: Rate Limiting (Scan Endpoint)**  
**Effort:** [M] 5 hours  
**Week:** 9  
**Depends on:** BE-018 (Redis)  
**Blocks:** BLK-017, VAL-012, DEP-006  
**Owner:** Person A  

**Acceptance:**
- Free: 5 scans/day (key: `ratelimit:scan:{user_id}:{date}`, TTL 24h)
- Premium: 100 scans/day
- 6th free scan returns 429 with `{"error": "SCAN_LIMIT_REACHED", "retryAfterSeconds": X, "scansRemaining": 0, "limit": 5}`
- Midnight reset in user's timezone (uses `users.timezone` column)

**Implementation:**
```rust
pub async fn check_scan_rate_limit(
    redis_conn: &mut Connection,
    user_id: Uuid,
    subscription_tier: &str,
    timezone: &str,
) -> Result<(), AppError> {
    let now = Utc::now().with_timezone(&timezone.parse()?);
    let date_key = now.format("%Y%m%d").to_string();
    let key = format!("ratelimit:scan:{}:{}", user_id, date_key);
    
    let count: i64 = redis_conn.incr(&key, 1).await?;
    
    if count == 1 {
        // First scan today — set TTL to midnight
        let seconds_until_midnight = (86400 - now.num_seconds_from_midnight()) as usize;
        redis_conn.expire(&key, seconds_until_midnight).await?;
    }
    
    let limit = match subscription_tier {
        "free" => 5,
        "premium" | "lifetime" => 100,
        _ => 5,
    };
    
    if count > limit {
        return Err(AppError::RateLimitExceeded {
            retry_after_seconds: (86400 - now.num_seconds_from_midnight()) as u64,
            scans_remaining: 0,
            limit,
        });
    }
    
    Ok(())
}
```

---

**BE-045: Global API Rate Limiting**  
**Effort:** [M] 4 hours  
**Week:** 9  
**Depends on:** BE-018  
**Blocks:** None (abuse protection)  
**Owner:** Person A  

**Acceptance:**
- 100 requests/minute per user
- Key: `ratelimit:global:{user_id}:{minute_timestamp}`
- TTL: 60 seconds
- Returns 429 with `Retry-After` header

---

**BE-046: POST /api/v1/scan Complete Integration**  
**Effort:** [XL] 16 hours  
**Week:** 5  
**Depends on:** BE-032 through BE-045  
**Blocks:** DEP-002 (frontend scan UI), BLK-001 (accuracy gate)  
**Owner:** Person A  

**Acceptance:**
- Full pipeline: image upload → pHash → cache check → R2 upload → complexity classifier → GPT-4o → safety floor → bias correction → confidence scoring → dual write → response
- P95 latency ≤ 5 seconds (PER-001)
- Cache hit returns <1 second
- Response matches SPEC §4.1.3 exactly (camelCase JSON)
- Error handling: network timeout, OpenAI outage, invalid image

**Pipeline Overview:**
```
1. Validate image (BE-032)
2. Generate pHash (BE-033)
3. Check Redis cache (BE-034)
   └─ HIT: Return cached result (fromCache=true)
   └─ MISS: Continue
4. Upload to R2 (BE-035)
5. Classify complexity (BE-036)
6. Analyze with GPT-4o (BE-037)
7. Apply safety floors (BE-038)
8. Apply conservative bias (BE-039)
9. Calculate confidence (BE-040)
10. Calculate GL range if needed (BE-041)
11. Filter premium content if free user (BE-042)
12. Save to DB (dual write scans + food_items) (BE-043)
13. Cache result in Redis (7-day TTL)
14. Return response
```

---

**BE-047: POST /api/v1/scan/corrections**  
**Effort:** [M] 5 hours  
**Week:** 7  
**Depends on:** BE-013 (scan_corrections table)  
**Blocks:** VAL-026  
**Owner:** Person A  

**Acceptance:**
- Accepts correction data (scan_id, correction_type, details, corrected_foods)
- Invalidates pHash cache for that scan
- Returns `{"correctionId": "uuid", "status": "received", "message": "Thanks! ..."}`
- Logs to `scan_corrections` table for ML training pipeline (future)

---

### Dashboard

**BE-048: GET /api/v1/dashboard/today**  
**Effort:** [L] 8 hours  
**Week:** 6  
**Depends on:** BE-008 (scans), BE-050 (streak)  
**Blocks:** DEP-006 (frontend dashboard)  
**Owner:** Person A  

**Acceptance:**
- Returns: date, glBudget, glConsumed, glRemaining, dailyScore, dailyScorePercentage, meals[], streak{}
- Queries only `scan_mode='already_ate'` (excludes planning mode)
- Daily score: A (<75%), B (75-100%), C (100-125%), D (>125%)
- Response time: P95 < 1 second (PER-004)

**Implementation:**
```rust
pub async fn get_dashboard_today(
    pool: &PgPool,
    user_id: Uuid,
    timezone: &str,
) -> Result<DashboardResponse, AppError> {
    let now = Utc::now().with_timezone(&timezone.parse()?);
    let today = now.date_naive();
    
    // Get user GL budget
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    
    // Sum GL for today (only 'already_ate' mode)
    let gl_consumed: f64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(total_gl), 0) FROM scans 
         WHERE user_id = $1 AND DATE(created_at AT TIME ZONE $2) = $3 AND scan_mode = 'already_ate'"
    )
    .bind(user_id)
    .bind(timezone)
    .bind(today)
    .fetch_one(pool)
    .await?;
    
    let gl_remaining = user.gl_budget as f64 - gl_consumed;
    let daily_score_pct = (gl_consumed / user.gl_budget as f64) * 100.0;
    
    let daily_score = match daily_score_pct {
        x if x < 75.0 => "A",
        x if x < 100.0 => "B",
        x if x < 125.0 => "C",
        _ => "D",
    };
    
    // Get today's meals
    let meals = sqlx::query_as::<_, MealSummary>(
        "SELECT id as scan_id, created_at as time, total_gl, spike_risk, thumbnail_url
         FROM scans WHERE user_id = $1 AND DATE(created_at AT TIME ZONE $2) = $3 AND scan_mode = 'already_ate'
         ORDER BY created_at ASC"
    )
    .bind(user_id)
    .bind(timezone)
    .bind(today)
    .fetch_all(pool)
    .await?;
    
    // Get streak (separate query)
    let streak = get_streak(pool, user_id).await?;
    
    Ok(DashboardResponse {
        date: today.to_string(),
        gl_budget: user.gl_budget,
        gl_consumed,
        gl_remaining,
        daily_score: daily_score.into(),
        daily_score_percentage: daily_score_pct,
        meals,
        streak,
    })
}
```

---

**BE-049: Daily Score Calculation**  
**Effort:** [S] 2 hours  
**Week:** 6  
**Depends on:** BE-048  
**Blocks:** None (integrated in BE-048)  
**Owner:** Person A  

**Acceptance:**
- Percentage-based relative to user's `gl_budget` (not hardcoded 80)
- Grades: A <75%, B 75-100%, C 100-125%, D >125%
- Fair across dietary profiles (vegetarian with 100 GL budget gets same grade logic)

---

**BE-050: Streak Calculation**  
**Effort:** [M] 6 hours  
**Week:** 6  
**Depends on:** BE-007 (users), BE-008 (scans)  
**Blocks:** VAL-006, DEP-013  
**Owner:** Person A  

**Acceptance:**
- Streak increments ONLY when daily GL ≤ user's configured `gl_budget` (REQ-021, ISSUE-013)
- Uses `users.gl_budget` column (not hardcoded)
- Midnight reset in user's timezone (uses `users.timezone`)
- Stored in `users` table: `current_streak`, `longest_streak`, `last_streak_date`

**Implementation:**
```rust
pub async fn update_streak(
    pool: &PgPool,
    user_id: Uuid,
    timezone: &str,
) -> Result<(), AppError> {
    let now = Utc::now().with_timezone(&timezone.parse()?);
    let today = now.date_naive();
    let yesterday = today.pred_opt().unwrap();
    
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    
    // Check if streak already updated today
    if user.last_streak_date == Some(today) {
        return Ok(());
    }
    
    // Sum GL for yesterday
    let yesterday_gl: f64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(total_gl), 0) FROM scans 
         WHERE user_id = $1 AND DATE(created_at AT TIME ZONE $2) = $3 AND scan_mode = 'already_ate'"
    )
    .bind(user_id)
    .bind(timezone)
    .bind(yesterday)
    .fetch_one(pool)
    .await?;
    
    let mut current_streak = user.current_streak;
    let mut longest_streak = user.longest_streak;
    
    if yesterday_gl <= user.gl_budget as f64 {
        // Streak continues
        current_streak += 1;
        if current_streak > longest_streak {
            longest_streak = current_streak;
        }
    } else {
        // Streak broken
        current_streak = 0;
    }
    
    sqlx::query(
        "UPDATE users SET current_streak = $1, longest_streak = $2, last_streak_date = $3 
         WHERE id = $4"
    )
    .bind(current_streak)
    .bind(longest_streak)
    .bind(today)
    .bind(user_id)
    .execute(pool)
    .await?;
    
    Ok(())
}
```

---

**BE-051: Midnight GL Reset Background Job**  
**Effort:** [M] 6 hours  
**Week:** 6  
**Depends on:** BE-050  
**Blocks:** DEP-013, VAL-024  
**Owner:** Person A  

**Acceptance:**
- Cron job runs every minute, checks if midnight crossed in each user's timezone
- Triggers `update_streak()` for users who crossed midnight
- Logs execution (start time, users processed, errors)
- Handles DST transitions correctly

**Implementation:**
```rust
use tokio_cron_scheduler::{Job, JobScheduler};

pub async fn schedule_midnight_reset(pool: PgPool) -> Result<(), AppError> {
    let scheduler = JobScheduler::new().await?;
    
    scheduler.add(
        Job::new_async("0 * * * * *", move |_uuid, _l| {  // Every minute
            let pool = pool.clone();
            Box::pin(async move {
                let users = sqlx::query_as::<_, User>(
                    "SELECT id, timezone, last_streak_date FROM users WHERE deleted_at IS NULL"
                )
                .fetch_all(&pool)
                .await?;
                
                for user in users {
                    let now = Utc::now().with_timezone(&user.timezone.parse()?);
                    let today = now.date_naive();
                    
                    // Check if midnight crossed since last update
                    if user.last_streak_date != Some(today) {
                        update_streak(&pool, user.id, &user.timezone).await?;
                    }
                }
                
                Ok(())
            })
        })?
    ).await?;
    
    scheduler.start().await?;
    Ok(())
}
```

---

### A1C Tracking

**BE-052: POST /api/v1/a1c**  
**Effort:** [M] 6 hours  
**Week:** 7  
**Depends on:** BE-010 (a1c_logs table), BE-053 (encryption)  
**Blocks:** None  
**Owner:** Person A  

**Acceptance:**
- Accepts: value (4.0-14.0), testDate, source ('lab' or 'estimate')
- Encrypts `value` with AES-256 before storage (SEC-007, DD-12)
- Returns: id, value, testDate, source, previousValue, change, disclaimer

**Implementation:**
```rust
pub async fn log_a1c(
    pool: &PgPool,
    user_id: Uuid,
    value: f64,
    test_date: NaiveDate,
    source: A1cSource,
    encryption_key: &[u8],
) -> Result<A1cLog, AppError> {
    // Validate range
    if !(4.0..=14.0).contains(&value) {
        return Err(AppError::ValidationError(vec!["A1C must be between 4.0 and 14.0".into()]));
    }
    
    // Encrypt value
    let encrypted = aes_encrypt(value.to_string().as_bytes(), encryption_key)?;
    
    // Insert
    let log = sqlx::query_as::<_, A1cLog>(
        "INSERT INTO a1c_logs (user_id, value, value_encrypted, test_date, source)
         VALUES ($1, $2, $3, $4, $5) RETURNING *"
    )
    .bind(user_id)
    .bind(value)
    .bind(encrypted)
    .bind(test_date)
    .bind(source)
    .fetch_one(pool)
    .await?;
    
    // Get previous value
    let previous = sqlx::query_scalar::<_, Option<f64>>(
        "SELECT value FROM a1c_logs WHERE user_id = $1 AND test_date < $2 AND source = 'lab'
         ORDER BY test_date DESC LIMIT 1"
    )
    .bind(user_id)
    .bind(test_date)
    .fetch_optional(pool)
    .await?;
    
    Ok(A1cLogResponse {
        id: log.id,
        value: log.value,
        test_date: log.test_date,
        source: log.source,
        previous_value: previous,
        change: previous.map(|p| value - p),
        disclaimer: "Consult your healthcare provider about your A1C results.".into(),
    })
}
```

---

**BE-053: AES-256 Encryption/Decryption Module**  
**Effort:** [M] 4 hours  
**Week:** 7  
**Depends on:** BE-002 (encryption key in config)  
**Blocks:** BE-052, BE-062 (GDPR export)  
**Owner:** Person A  

**Acceptance:**
- AES-256-GCM mode (authenticated encryption)
- Key from env var `A1C_ENCRYPTION_KEY` (32 bytes)
- Random nonce per encryption (stored with ciphertext)
- Test: encrypt + decrypt = original value

**Implementation:**
```rust
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, NewAead};

pub fn aes_encrypt(plaintext: &[u8], key: &[u8]) -> Result<Vec<u8>, AppError> {
    let cipher = Aes256Gcm::new(Key::from_slice(key));
    let nonce = Nonce::from_slice(&rand::random::<[u8; 12]>());
    
    let mut ciphertext = cipher.encrypt(nonce, plaintext)
        .map_err(|e| AppError::EncryptionError(e.to_string()))?;
    
    // Prepend nonce to ciphertext
    let mut result = nonce.to_vec();
    result.append(&mut ciphertext);
    
    Ok(result)
}

pub fn aes_decrypt(ciphertext_with_nonce: &[u8], key: &[u8]) -> Result<Vec<u8>, AppError> {
    if ciphertext_with_nonce.len() < 12 {
        return Err(AppError::EncryptionError("Invalid ciphertext".into()));
    }
    
    let (nonce_bytes, ciphertext) = ciphertext_with_nonce.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);
    
    let cipher = Aes256Gcm::new(Key::from_slice(key));
    let plaintext = cipher.decrypt(nonce, ciphertext)
        .map_err(|e| AppError::EncryptionError(e.to_string()))?;
    
    Ok(plaintext)
}
```

---

**BE-054: GET /api/v1/a1c/estimate**  
**Effort:** [L] 8 hours  
**Week:** 7  
**Depends on:** BE-052, BE-008 (scans for GL data)  
**Blocks:** DEP-014, VAL-007, BLK-013  
**Owner:** Person A  

**Acceptance:**
- A1C estimation algorithm from SPEC §4.2.5 implemented **exactly**
- Requires ≥14 days of GL data
- Returns: estimatedA1c, errorBound (±0.2), range {low, high}, basedOnDays, lastLabValue, lastLabDate, divergenceWarning, disclaimer
- Divergence warning when |estimated - lab| > 0.3

**Rust Implementation (SPEC §4.2.5):**
```rust
pub async fn estimate_a1c(
    pool: &PgPool,
    user_id: Uuid,
) -> Result<A1cEstimate, AppError> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    
    // Get 14-day rolling average GL
    let daily_gl_avgs: Vec<f64> = sqlx::query_scalar(
        "SELECT COALESCE(SUM(total_gl), 0) as daily_gl
         FROM scans
         WHERE user_id = $1 
           AND scan_mode = 'already_ate'
           AND created_at >= NOW() - INTERVAL '14 days'
         GROUP BY DATE(created_at)
         ORDER BY DATE(created_at) DESC"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    
    if daily_gl_avgs.len() < 14 {
        return Err(AppError::ValidationError(vec![
            "Insufficient data: requires at least 14 days of scans".into()
        ]));
    }
    
    let avg_14d = daily_gl_avgs.iter().sum::<f64>() / daily_gl_avgs.len() as f64;
    let adherence = avg_14d / user.gl_budget as f64;
    
    // 0.4 A1C points / 90 days = 0.00444/day at perfect adherence
    let daily_change = match adherence {
        a if a <= 0.75 => -0.00444,       // Excellent adherence (≤75% budget)
        a if a <= 1.0  => -0.00444 * 0.6, // Good adherence (75-100%)
        a if a <= 1.25 => 0.0,             // Neutral (100-125%)
        _              => 0.00444 * 0.3,   // Worsening (>125%)
    };
    
    let baseline = user.a1c_baseline.ok_or(AppError::ValidationError(vec![
        "A1C baseline not set".into()
    ]))?;
    
    let estimated_a1c = (baseline + daily_change * daily_gl_avgs.len() as f64).clamp(4.0, 14.0);
    
    // Get last lab value
    let last_lab = sqlx::query_as::<_, A1cLog>(
        "SELECT * FROM a1c_logs WHERE user_id = $1 AND source = 'lab' 
         ORDER BY test_date DESC LIMIT 1"
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;
    
    let divergence_warning = last_lab
        .as_ref()
        .map(|lab| (estimated_a1c - lab.value).abs() > 0.3)
        .unwrap_or(false);
    
    Ok(A1cEstimate {
        estimated_a1c,
        error_bound: 0.2,
        range: A1cRange {
            low: estimated_a1c - 0.2,
            high: estimated_a1c + 0.2,
        },
        based_on_days: daily_gl_avgs.len() as i32,
        last_lab_value: last_lab.as_ref().map(|l| l.value),
        last_lab_date: last_lab.as_ref().map(|l| l.test_date),
        divergence_warning,
        disclaimer: "Estimate only — verify with laboratory A1C test. This is not a medical measurement.".into(),
    })
}
```

---

### Weekly Insights

**BE-055: GET /api/v1/insights/weekly**  
**Effort:** [M] 6 hours  
**Week:** 11  
**Depends on:** BE-009 (food_items table), BE-008  
**Blocks:** None (Phase 2 feature)  
**Owner:** Person A  

**Acceptance:**
- Returns: weekStart, weekEnd, summary {totalScans, averageDailyGl, daysUnderBudget, topSpikeFood, bestMeal, streakDays}, trends {glTrend, glChangePercent}, insights[]
- Free: summary only, insights=[]
- Premium: full insights array with pattern detection

**Pattern Detection Queries:**
```sql
-- Top spike food
SELECT name, COUNT(*) as occurrences
FROM food_items
WHERE user_id = $1 
  AND spike_risk = 'HIGH'
  AND created_at >= $2 AND created_at < $3
GROUP BY name
ORDER BY occurrences DESC
LIMIT 1;

-- Meal-type breakdown (assuming meal_type added later via heuristics)
SELECT 
  CASE 
    WHEN EXTRACT(HOUR FROM created_at) BETWEEN 6 AND 10 THEN 'breakfast'
    WHEN EXTRACT(HOUR FROM created_at) BETWEEN 11 AND 14 THEN 'lunch'
    WHEN EXTRACT(HOUR FROM created_at) BETWEEN 17 AND 21 THEN 'dinner'
    ELSE 'snack'
  END as meal_type,
  SUM(total_gl) as total_gl_by_type
FROM scans
WHERE user_id = $1 AND created_at >= $2 AND created_at < $3
GROUP BY meal_type;
```

---

**BE-056: Pattern Detection Queries**  
**Effort:** [M] 4 hours  
**Week:** 11  
**Depends on:** BE-055  
**Blocks:** None  
**Owner:** Person A  

**Acceptance:**
- Top 5 spike foods using `food_items` indexes
- Meal-type breakdown (breakfast/lunch/dinner/snack)
- Weekly GL delta (trend)
- Requires ≥14 days data

---

### Post-Meal Actions

**BE-057: POST /api/v1/walk/start**  
**Effort:** [M] 4 hours  
**Week:** 8  
**Depends on:** BE-011 (activities table)  
**Blocks:** None  
**Owner:** Person A  

**Acceptance:**
- Accepts: scanId, startedAt
- Returns: walkId, scanId, startedAt, targetMinutes (15)
- Links walk to meal via `activities.scan_id`

---

**BE-058: POST /api/v1/walk/complete**  
**Effort:** [M] 4 hours  
**Week:** 8  
**Depends on:** BE-057  
**Blocks:** VAL-022  
**Owner:** Person A  

**Acceptance:**
- Accepts: walkId, completedAt, durationMinutes
- Updates `activities` record with completion data
- Returns: walkId, durationMinutes, congratulatory message

---

**BE-059: Push Notification Scheduler (5-Min Delay)**  
**Effort:** [M] 6 hours  
**Week:** 8  
**Depends on:** BE-057  
**Blocks:** VAL-021  
**Owner:** Person A  

**Acceptance:**
- Schedules push notification 5 minutes after MODERATE/HIGH meal logging
- Quiet hours enforcement: 10 PM – 7 AM user timezone (no notifications)
- Uses Expo Push Notifications API
- Notification payload: "A 15-minute walk now can reduce your glucose spike by up to 30%"

**Implementation:**
```rust
use tokio::time::{sleep, Duration};

pub async fn schedule_walk_notification(
    scan: &Scan,
    user_timezone: &str,
) -> Result<(), AppError> {
    if scan.spike_risk != "MODERATE" && scan.spike_risk != "HIGH" {
        return Ok(());  // Only for MODERATE/HIGH
    }
    
    sleep(Duration::from_secs(300)).await;  // 5 minutes
    
    // Check quiet hours
    let now = Utc::now().with_timezone(&user_timezone.parse()?);
    let hour = now.hour();
    if hour >= 22 || hour < 7 {
        return Ok(());  // Suppress during quiet hours
    }
    
    // Send push notification via Expo
    send_expo_push(
        &user.push_token,
        "Time for a walk!",
        "A 15-minute walk now can reduce your glucose spike by up to 30%",
    ).await?;
    
    Ok(())
}
```

---

### Educational Content

**BE-060: GET /api/v1/learn/articles**  
**Effort:** [M] 5 hours  
**Week:** 12  
**Depends on:** None (static data)  
**Blocks:** DEP-012  
**Owner:** Person A  

**Acceptance:**
- Returns paginated article list
- Free: only articles where `isPremium=false` (5 articles)
- Premium: full library (20+ articles)
- Query params: `page`, `limit`, `category` (optional filter)

---

**BE-061: Article Seed Data (20 Curated Articles)**  
**Effort:** [L] 16 hours (content curation + RD review)  
**Week:** 12  
**Depends on:** None  
**Blocks:** None  
**Owner:** Person A (coordinate with RD for review)  

**Acceptance:**
- 20 articles curated from reputable sources
- Categories: fundamentals, food sequencing, GL science, meal planning, lifestyle
- 5 articles marked `isPremium=false` for free tier
- All articles reviewed by Registered Dietitian (RD) for accuracy

**Article Structure:**
```json
{
  "id": "uuid",
  "title": "Understanding Glycemic Load",
  "category": "fundamentals",
  "content": "Markdown content...",
  "readTimeMinutes": 5,
  "isPremium": false,
  "citations": ["Harvard Health Publishing", "ADA 2024"],
  "thumbnailUrl": "https://..."
}
```

---

## PHASE 2: VALUE-ADD (Weeks 9–12)

### GDPR & Data Management

**BE-062: GET /api/v1/user/export**  
**Effort:** [L] 10 hours  
**Week:** 9  
**Depends on:** BE-007 through BE-011, BE-053 (A1C decryption)  
**Blocks:** BLK-008, VAL-010, DEP-005  
**Owner:** Person A  

**Acceptance:**
- Returns complete user data as JSON
- A1C values **decrypted** for user's own export
- Performance: <10 seconds for ≤1000 meals (PER-005, VAL-010)
- Includes: user profile, a1c_logs, scans, food_items, activities, streaks

**Implementation:**
```rust
pub async fn export_user_data(
    pool: &PgPool,
    user_id: Uuid,
    encryption_key: &[u8],
) -> Result<UserDataExport, AppError> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    
    let a1c_logs = sqlx::query_as::<_, A1cLog>(
        "SELECT * FROM a1c_logs WHERE user_id = $1 ORDER BY test_date DESC"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    
    // Decrypt A1C values
    let a1c_logs_decrypted: Vec<_> = a1c_logs.into_iter().map(|mut log| {
        if let Some(encrypted) = log.value_encrypted {
            let decrypted = aes_decrypt(&encrypted, encryption_key).ok();
            log.value = decrypted.and_then(|d| String::from_utf8(d).ok())
                .and_then(|s| s.parse().ok())
                .unwrap_or(log.value);
        }
        log
    }).collect();
    
    let scans = sqlx::query_as::<_, Scan>(
        "SELECT * FROM scans WHERE user_id = $1 ORDER BY created_at DESC"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    
    let food_items = sqlx::query_as::<_, FoodItem>(
        "SELECT * FROM food_items WHERE user_id = $1 ORDER BY created_at DESC"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    
    let activities = sqlx::query_as::<_, Activity>(
        "SELECT * FROM activities WHERE user_id = $1 ORDER BY created_at DESC"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    
    Ok(UserDataExport {
        export_date: Utc::now(),
        user,
        a1c_logs: a1c_logs_decrypted,
        scans,
        food_items,
        activities,
    })
}
```

---

**BE-063: DELETE /api/v1/user/account**  
**Effort:** [M] 6 hours  
**Week:** 10  
**Depends on:** BE-007  
**Blocks:** BLK-008, VAL-011, DEP-005  
**Owner:** Person A  

**Acceptance:**
- Soft-delete: sets `deleted_at` timestamp, anonymizes email (e.g., `deleted_{uuid}@deleted.com`)
- Revokes all refresh tokens (clear from Redis)
- 30-day grace period before permanent purge
- Returns: status='scheduled', softDeletedAt, permanentDeletionAt, message

**Implementation:**
```rust
pub async fn soft_delete_account(
    pool: &PgPool,
    redis_conn: &mut Connection,
    user_id: Uuid,
    confirm_email: &str,
) -> Result<DeletionResponse, AppError> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    
    // Confirm email
    if user.email.as_deref() != Some(confirm_email) {
        return Err(AppError::ValidationError(vec!["Email mismatch".into()]));
    }
    
    let now = Utc::now();
    let permanent_deletion_at = now + Duration::days(30);
    
    // Soft-delete
    sqlx::query(
        "UPDATE users 
         SET deleted_at = $1, 
             deletion_requested_at = $1,
             email = $2,
             password_hash = NULL
         WHERE id = $3"
    )
    .bind(now)
    .bind(format!("deleted_{}@deleted.com", user_id))
    .bind(user_id)
    .execute(pool)
    .await?;
    
    // Revoke all refresh tokens
    let keys: Vec<String> = redis_conn.keys(format!("refresh:*")).await?;
    for key in keys {
        let data: String = redis_conn.get(&key).await?;
        if data.contains(&user_id.to_string()) {
            redis_conn.del(&key).await?;
        }
    }
    
    Ok(DeletionResponse {
        status: "scheduled".into(),
        soft_deleted_at: now,
        permanent_deletion_at,
        message: "Your account has been scheduled for deletion. You have 30 days to reactivate.".into(),
    })
}
```

---

**BE-064: Background Purge Job (30-Day Grace Period)**  
**Effort:** [M] 6 hours  
**Week:** 10  
**Depends on:** BE-063  
**Blocks:** VAL-011  
**Owner:** Person A  

**Acceptance:**
- Runs daily (cron)
- Hard-deletes all user data + R2 photos for accounts where `deleted_at` < NOW() - 30 days
- Cascading delete via FK constraints handles `scans`, `food_items`, `a1c_logs`, `activities`
- Logs to audit trail (who, when, what)

**Implementation:**
```rust
pub async fn purge_deleted_accounts(
    pool: &PgPool,
    r2_client: &Client,
) -> Result<usize, AppError> {
    let cutoff_date = Utc::now() - Duration::days(30);
    
    let deleted_users = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE deleted_at < $1"
    )
    .bind(cutoff_date)
    .fetch_all(pool)
    .await?;
    
    let mut purged_count = 0;
    
    for user in deleted_users {
        // Delete R2 photos
        let scans = sqlx::query_as::<_, Scan>(
            "SELECT * FROM scans WHERE user_id = $1"
        )
        .bind(user.id)
        .fetch_all(pool)
        .await?;
        
        for scan in scans {
            if let Some(image_url) = scan.image_url {
                delete_from_r2(r2_client, &image_url).await?;
            }
            if let Some(thumbnail_url) = scan.thumbnail_url {
                delete_from_r2(r2_client, &thumbnail_url).await?;
            }
        }
        
        // Hard-delete user (CASCADE deletes all related data)
        sqlx::query("DELETE FROM users WHERE id = $1")
            .bind(user.id)
            .execute(pool)
            .await?;
        
        // Log to audit trail
        sqlx::query(
            "INSERT INTO audit_log (action, user_id, timestamp, details)
             VALUES ('ACCOUNT_PURGED', $1, $2, $3)"
        )
        .bind(user.id)
        .bind(Utc::now())
        .bind(format!("Purged after 30-day grace period (deleted_at: {})", user.deleted_at.unwrap()))
        .execute(pool)
        .await?;
        
        purged_count += 1;
    }
    
    Ok(purged_count)
}
```

---

### Security Hardening

**BE-065: Password Change Endpoint**  
**Effort:** [M] 5 hours  
**Week:** 10  
**Depends on:** BE-021 (token rotation), BE-027 (password hashing)  
**Blocks:** None (security feature)  
**Owner:** Person A  

**Acceptance:**
- POST `/api/v1/auth/password-change`
- Requires current password validation (prevent account takeover)
- Revokes ALL active refresh tokens on password change (SEC-004)
- Returns new JWT tokens

---

**BE-066: A1C Encryption Key Rotation Procedure**  
**Effort:** [M] 4 hours  
**Week:** 10  
**Depends on:** BE-053  
**Blocks:** None (documentation + test)  
**Owner:** Person A  

**Acceptance:**
- Documented procedure for rotating AES-256 key
- Test script: decrypt with old key, re-encrypt with new key, verify
- Stored in `docs/key-rotation.md`

---

**BE-067: SQL Injection Protection Audit**  
**Effort:** [M] 5 hours  
**Week:** 10  
**Depends on:** All query-writing tasks  
**Blocks:** BLK-004 (pentest)  
**Owner:** Person A  

**Acceptance:**
- Verify **all** queries use sqlx parameterized queries (no raw SQL string construction)
- CI test: `grep -r "format!" backend/src/**/*.rs | grep "SELECT\|INSERT\|UPDATE\|DELETE"` returns zero matches
- Add to CI pipeline as automated check

---

### Photo Cleanup

**BE-068: Photo Cleanup Background Job**  
**Effort:** [M] 6 hours  
**Week:** 10  
**Depends on:** BE-014 (photo_cleanup_log), BE-035 (R2 client)  
**Blocks:** None (cost optimization)  
**Owner:** Person A  

**Acceptance:**
- Nightly cron job
- Deletes full-res photos (image_url) >90 days old from R2
- Sets `scans.image_url = NULL` (thumbnail preserved)
- Logs to `photo_cleanup_log` table

**Implementation:**
```rust
pub async fn cleanup_old_photos(
    pool: &PgPool,
    r2_client: &Client,
) -> Result<usize, AppError> {
    let cutoff_date = Utc::now() - Duration::days(90);
    
    let old_scans = sqlx::query_as::<_, Scan>(
        "SELECT * FROM scans WHERE created_at < $1 AND image_url IS NOT NULL"
    )
    .bind(cutoff_date)
    .fetch_all(pool)
    .await?;
    
    let mut deleted_count = 0;
    
    for scan in old_scans {
        if let Some(image_url) = &scan.image_url {
            // Delete from R2
            let r2_success = delete_from_r2(r2_client, image_url).await.is_ok();
            
            // Update database
            sqlx::query("UPDATE scans SET image_url = NULL WHERE id = $1")
                .bind(scan.id)
                .execute(pool)
                .await?;
            
            // Log cleanup
            sqlx::query(
                "INSERT INTO photo_cleanup_log (scan_id, image_url, reason, r2_delete_success)
                 VALUES ($1, $2, 'retention_policy', $3)"
            )
            .bind(scan.id)
            .bind(image_url)
            .bind(r2_success)
            .execute(pool)
            .await?;
            
            deleted_count += 1;
        }
    }
    
    Ok(deleted_count)
}
```

---

**BE-069: Original Upload Cleanup**  
**Effort:** [S] 3 hours  
**Week:** 10  
**Depends on:** BE-035  
**Blocks:** None (REC-025)  
**Owner:** Person A  

**Acceptance:**
- Deletes raw upload from temp storage within 1 hour of processing completion
- Uses R2 lifecycle policy OR background job
- Prevents temp storage bloat

---

### Milestone System

**BE-070: Milestone Detection Service**  
**Effort:** [M] 5 hours  
**Week:** 11  
**Depends on:** BE-050 (streak), BE-052 (A1C logs)  
**Blocks:** None (engagement feature)  
**Owner:** Person A  

**Acceptance:**
- Detects milestones: streak 3/7/14/30/60/90 days, first SAFE meal, A1C log entry
- Triggers push notification + in-app modal
- Prevents duplicate triggers for same milestone

---

**BE-071: Milestone Table/Tracking**  
**Effort:** [S] 3 hours  
**Week:** 11  
**Depends on:** BE-070  
**Blocks:** None  
**Owner:** Person A  

**SQL:**
```sql
CREATE TABLE milestones_achieved (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL CHECK (milestone_type IN ('streak_3', 'streak_7', 'streak_14', 'streak_30', 'streak_60', 'streak_90', 'first_safe_meal', 'first_a1c_log')),
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, milestone_type)
);
```

---

### Survey API

**BE-072: POST /api/v1/user/survey**  
**Effort:** [M] 4 hours  
**Week:** 11  
**Depends on:** BE-013 (surveys table, if created; otherwise create now)  
**Blocks:** None  
**Owner:** Person A  

**Acceptance:**
- Accepts: surveyType, responses (JSONB)
- Stores in database for analytics
- Returns: surveyId, thanksMessage

---

## PHASE 3: MONETIZATION & POLISH (Weeks 13–14)

### RevenueCat Integration

**BE-073: RevenueCat Webhook Endpoint**  
**Effort:** [L] 8 hours  
**Week:** 13  
**Depends on:** BE-007 (users)  
**Blocks:** BLK-011, VAL-027, DEP-004, DEP-017  
**Owner:** Person A  

**Acceptance:**
- POST `/webhooks/revenuecat` (no auth — RevenueCat signs requests)
- Handles events: `subscription.purchased`, `subscription.renewed`, `subscription.cancelled`, `subscription.expired`
- Updates `users.subscription_tier` within 60 seconds (VAL-027)
- Logs all events for debugging

**Implementation:**
```rust
pub async fn handle_revenuecat_webhook(
    pool: &PgPool,
    payload: RevenueCatWebhook,
) -> Result<(), AppError> {
    match payload.event_type.as_str() {
        "subscription.purchased" | "subscription.renewed" => {
            let product_id = &payload.product_id;
            let tier = match product_id.as_str() {
                "revora_monthly" | "revora_annual" => "premium",
                "revora_lifetime" => "lifetime",
                _ => "free",
            };
            
            sqlx::query(
                "UPDATE users SET subscription_tier = $1, updated_at = NOW() WHERE id = $2"
            )
            .bind(tier)
            .bind(payload.user_id)
            .execute(pool)
            .await?;
        },
        "subscription.cancelled" | "subscription.expired" => {
            // Grace period logic: wait 7 days before downgrading
            // (RevenueCat webhook fires immediately on cancel, but subscription still active until period end)
            // Actual downgrade happens at expiration event
            if payload.event_type == "subscription.expired" {
                sqlx::query(
                    "UPDATE users SET subscription_tier = 'free', updated_at = NOW() WHERE id = $1"
                )
                .bind(payload.user_id)
                .execute(pool)
                .await?;
            }
        },
        _ => {
            // Unknown event type — log and ignore
            tracing::warn!("Unknown RevenueCat event type: {}", payload.event_type);
        }
    }
    
    // Log event
    sqlx::query(
        "INSERT INTO revenuecat_events (user_id, event_type, product_id, payload, received_at)
         VALUES ($1, $2, $3, $4, NOW())"
    )
    .bind(payload.user_id)
    .bind(payload.event_type)
    .bind(payload.product_id)
    .bind(serde_json::to_value(&payload)?)
    .execute(pool)
    .await?;
    
    Ok(())
}
```

---

**BE-074: Subscription Entitlement Verification**  
**Effort:** [M] 5 hours  
**Week:** 13  
**Depends on:** BE-073  
**Blocks:** DEP-019  
**Owner:** Person A  

**Acceptance:**
- Server-side check on scan endpoint and advice card responses
- Never trust client-side only (SEC-009)
- Free users get GL + spike risk only (advice cards, A1C tracker, history >7 days locked)

**Implementation:**
```rust
pub fn check_premium_access(subscription_tier: &str, feature: Feature) -> Result<(), AppError> {
    match feature {
        Feature::AdviceCards | Feature::A1cTracker | Feature::UnlimitedHistory => {
            if subscription_tier == "free" {
                return Err(AppError::Forbidden [REVIEW NEEDED: Replace restriction-framing with permission-first language]("Premium feature requires subscription".into()));
            }
        },
        Feature::BasicScan => {
            // All tiers have access
        }
    }
    Ok(())
}
```

---

**BE-075: Grace Period Logic**  
**Effort:** [M] 4 hours  
**Week:** 13  
**Depends on:** BE-073  
**Blocks:** None (user experience)  
**Owner:** Person A  

**Acceptance:**
- Brief grace period on subscription lapse before hard downgrade to free
- iOS: 16-day grace period (Apple policy)
- Android: 7-day grace period (Google policy)
- User sees "Your subscription has expired. Renew to continue premium access."

---

### Performance Hardening

**BE-076: k6 Load Test Execution**  
**Effort:** [M] 6 hours  
**Week:** 13  
**Depends on:** All API endpoints  
**Blocks:** BLK-001 (performance gate), RSK-009  
**Owner:** Person A  

**Acceptance:**
- k6 test scripts for scenarios from SPEC §7.2
- Scan endpoint: 100 VUs for 5 min → P95 ≤ 5s, 0 errors (PER-001)
- Dashboard: 200 VUs for 5 min → P95 ≤ 1s (PER-004)
- Auth flow: 50 VUs for 3 min → P95 ≤ 500ms
- GDPR export: 20 VUs for 3 min → P95 ≤ 10s (PER-005)

**k6 Script Example:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 },  // Ramp-up
    { duration: '5m', target: 100 },  // Sustained load
    { duration: '1m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],  // P95 < 5s
    http_req_failed: ['rate<0.01'],     // Error rate < 1%
  },
};

export default function () {
  let formData = {
    image: http.file(open('meal.jpg', 'b'), 'meal.jpg'),
    scanMode: 'already_ate',
  };
  
  let res = http.post('http://localhost:3000/api/v1/scan', formData, {
    headers: {
      'Authorization': `Bearer ${__ENV.TEST_JWT}`,
    },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });
  
  sleep(1);
}
```

---

**BE-077: Query Optimization Pass**  
**Effort:** [M] 6 hours  
**Week:** 13  
**Depends on:** BE-076 (load test identifies bottlenecks)  
**Blocks:** None (performance improvement)  
**Owner:** Person A  

**Acceptance:**
- Run `EXPLAIN ANALYZE` on all critical-path queries
- Add missing indexes identified during load test
- Optimize N+1 queries (especially `food_items` pattern queries)

---

**BE-078: Redis Cache Tuning**  
**Effort:** [M] 4 hours  
**Week:** 13  
**Depends on:** BE-034 (cache implementation)  
**Blocks:** None (cost optimization)  
**Owner:** Person A  

**Acceptance:**
- Monitor cache hit rate (target ≥40% — PER-010)
- Adjust TTLs if needed (7-day default for scan cache)
- Add cache warming for common meals (optional optimization)

---

### Referral Program

**BE-079: Referral Code Generation**  
**Effort:** [M] 4 hours  
**Week:** 13  
**Depends on:** BE-007 (users)  
**Blocks:** None (growth feature)  
**Owner:** Person A  

**Acceptance:**
- 8-char alphanumeric referral code generated on account creation
- Unique index on `users.referral_code`
- Code stored in `users` table

**Implementation:**
```rust
use rand::Rng;

pub fn generate_referral_code() -> String {
    const CHARSET: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";  // No ambiguous chars
    let mut rng = rand::thread_rng();
    (0..8)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}
```

---

**BE-080: Referral Tracking Endpoint**  
**Effort:** [M] 5 hours  
**Week:** 13  
**Depends on:** BE-079  
**Blocks:** None  
**Owner:** Person A  

**Acceptance:**
- POST `/api/v1/referral/apply?code=ABCD1234`
- Records `referred_by_user_id` on conversion
- Applies RevenueCat promotional offer for referrer reward

---

### Shareable Cards (V1.1 Stub)

**BE-081: GET /api/v1/share/weekly-card Stub**  
**Effort:** [S] 2 hours  
**Week:** 13  
**Depends on:** None  
**Blocks:** None (V1.1 feature stub)  
**Owner:** Person A  

**Acceptance:**
- Returns placeholder response: `{"cardUrl": "https://r2.../placeholder.png", "message": "Shareable cards coming in V1.1"}`
- Full SVG→PNG implementation deferred to V1.1 (Week 16+)

---

## PHASE 4: LAUNCH WEEK (Week 15)

**BE-082: Production Environment Variables Configured**  
**Effort:** [S] 2 hours  
**Week:** 15  
**Depends on:** BE-002  
**Blocks:** None (launch task)  
**Owner:** Person A  

**Acceptance:**
- All secrets configured in Railway dashboard
- Verified: DATABASE_URL, REDIS_URL, OPENAI_API_KEY, R2 credentials, JWT_SECRET
- No secrets in Git repo

---

**BE-083: Database Connection Pool Tuned for Production**  
**Effort:** [S] 2 hours  
**Week:** 15  
**Depends on:** BE-017  
**Blocks:** None  
**Owner:** Person A  

**Acceptance:**
- Max connections: 50 (up from 10 MVP)
- Verified: connection timeout, idle timeout, query timeout settings

---

**BE-084: Final Migration Dry-Run on Production Clone**  
**Effort:** [M] 3 hours  
**Week:** 15  
**Depends on:** All migrations  
**Blocks:** Launch  
**Owner:** Person A  

**Acceptance:**
- Run all migrations on production-like database
- Verify schema matches expected
- Test rollback (`sqlx migrate revert`)

---

**BE-085: Hotfix Deployment Procedure Documented**  
**Effort:** [S] 2 hours  
**Week:** 15  
**Depends on:** None  
**Blocks:** None (runbook)  
**Owner:** Person A  

**Acceptance:**
- Document: `docs/hotfix-procedure.md`
- Steps: branch → fix → test → deploy → verify
- Target cycle time: <30 minutes

---

**BE-086: Rollback Procedure Documented**  
**Effort:** [S] 2 hours  
**Week:** 15  
**Depends on:** None  
**Blocks:** None (runbook)  
**Owner:** Person A  

**Acceptance:**
- Document: `docs/rollback-procedure.md`
- Steps: identify previous Docker image → redeploy → verify → rollback DB migration if needed

---

**BE-087: API Rate Limit Monitoring Alerts**  
**Effort:** [S] 3 hours  
**Week:** 15  
**Depends on:** BE-044, BE-045  
**Blocks:** None (monitoring)  
**Owner:** Person A  

**Acceptance:**
- PagerDuty/email alert on 429 spike (>100 rate limit errors in 5 min)
- Slack notification on sustained high rate limiting

---

**BE-088: AI Cost Monitoring Alert**  
**Effort:** [S] 3 hours  
**Week:** 15  
**Depends on:** BE-037 (AI cost tracking)  
**Blocks:** None (cost protection)  
**Owner:** Person A  

**Acceptance:**
- PostHog custom event tracks AI spend per scan
- Alert: if blended cost/scan > $0.05 for 24 hours
- Dashboard visualizes daily/weekly AI spend

---

## BACKEND TESTING REQUIREMENTS

### Unit Test Requirements (80% Coverage Minimum)

**Safety Floor Logic:** 100% coverage of all 6 food categories (PRD §6.2)
```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_safety_floor_white_rice() {
        let (gl, applied) = apply_safety_floor("white rice", 15.0);
        assert_eq!(gl, 20.0);
        assert!(applied);
    }
    
    #[test]
    fn test_safety_floor_not_applied_above_threshold() {
        let (gl, applied) = apply_safety_floor("white rice", 25.0);
        assert_eq!(gl, 25.0);
        assert!(!applied);
    }
    
    // ... tests for all 6 categories (white rice, pasta, white bread, fruit juice, sweetened beverage, baked goods)
}
```

**A1C Estimation Algorithm:** Test all 4 adherence tiers, boundary values (4.0, 14.0)
```rust
#[test]
fn test_a1c_estimation_excellent_adherence() {
    let baseline = 6.1;
    let daily_gls = vec![60.0; 14];  // 60 GL/day with 80 budget = 75% adherence
    let gl_budget = 80.0;
    
    let estimated = estimate_a1c_internal(baseline, &daily_gls, gl_budget);
    
    // 14 days × -0.00444/day = -0.062 change
    let expected = baseline - 0.062;
    assert!((estimated - expected).abs() < 0.01);
}
```

**Conservative Bias Correction:** Test MEDIUM (×1.10) and LOW (×1.20) paths
**Confidence Scoring:** Test all decision branches
**Rate Limiting:** Test free tier (5/day limit, 6th scan = 429), premium (100/day)
**Refresh Token Rotation:** Test single-use enforcement, replay = all tokens revoked
**JWT Middleware:** Test expired token, missing token, invalid signature
**COPPA Gate:** Test `age_confirmed=false` returns 403 with `AGE_REQUIREMENT_NOT_MET`
**GL Daily Score:** Test all 4 grade thresholds with different `glBudget` values
**Streak Calculation:** Test streak increments only when `gl_used ≤ glBudget`

---

### Integration Test Requirements

**Full Scan Pipeline:**
- Image upload → classifier → GPT-4o → safety floor → dual write → response
- End-to-end test with real image (not mocked OpenAI)
- Verify: `scans` row created, `food_items` rows created, cache populated

**Auth Flow:**
- Register → login → refresh → refresh reuse → revocation
- Test: replay attack revokes all tokens

**GDPR Export:**
- Create user + scans → export → verify all data present (including decrypted A1C)

**GDPR Deletion:**
- Request deletion → soft-delete → 30-day purge job → verify zero rows

**Rate Limit Bypass Attempt:**
- 6 scan attempts as free user → 5 succeed, 6th returns 429

**Guest Mode:**
- Scan without account → convert → verify data preserved

---

### Load Test (k6, Week 13)

- **Scan endpoint:** 100 VUs for 5 min → P95 ≤ 5s, 0 errors
- **Dashboard:** 200 VUs for 5 min → P95 ≤ 1s
- **Auth flow:** 50 VUs for 3 min → P95 ≤ 500ms
- **GDPR export:** 20 VUs for 3 min → P95 ≤ 10s

---

## APPENDIX: QUICK REFERENCE

### Critical Metrics (Track Daily)
- **AI cost per scan:** Blended average (target ≤$0.02 with caching)
- **Cache hit rate:** Redis scan cache (target ≥40%)
- **Scan P95 latency:** Production (target ≤5s)
- **Error rate:** 5xx responses (target <0.1%)
- **Database query P95:** Slow query log (target <500ms)

### Emergency Contacts
- **OpenAI outage:** Check status.openai.com, implement queue
- **Database connection exhaustion:** Scale Railway Postgres plan
- **Rate limit abuse:** Investigate user_id, temporary ban if malicious
- **Cost spike:** Check AI cost dashboard, pause free signups if needed

### Tool URLs
- **Backend Repo:** `backend/`
- **CI Pipeline:** `.github/workflows/backend-ci.yml`
- **API Docs:** Auto-generated OpenAPI spec at `/api/docs`
- **Load Test Scripts:** `backend/tests/load/`

---

**END OF BACKEND PLAN — Revora v1.0**

*Last Updated: 2026-03-06 | Owner: Person A | Coverage Target: 80%*