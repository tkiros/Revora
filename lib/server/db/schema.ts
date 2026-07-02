import { isNotNull, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * Plan §3.3. Exact A1C and food text are stored ONLY as AES-256-GCM
 * ciphertext (lib/server/crypto.ts). Coarse, query-needed fields (risk,
 * band, timestamps) stay plaintext so coach compute never decrypts.
 */

// ── Auth.js standard tables (@auth/drizzle-adapter shape) ──────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow()
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: smallint("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state")
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] })
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull()
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull()
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
);

// ── Revora stateful layer ───────────────────────────────────────────────────

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  a1cCiphertext: text("a1c_ciphertext").notNull(),
  a1cBand: text("a1c_band", {
    enum: ["prediabetes_57_59", "prediabetes_60_62", "prediabetes_63_64"]
  }).notNull(),
  timezone: text("timezone").notNull().default("America/New_York"),
  nudgeOptIn: boolean("nudge_opt_in").notNull().default(false),
  nudgeHour: smallint("nudge_hour").notNull().default(11),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  consentedAt: timestamp("consented_at", { withTimezone: true }).notNull()
});

export const checks = pgTable(
  "checks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    foodCiphertext: text("food_ciphertext").notNull(),
    risk: text("risk", { enum: ["SAFE", "MODERATE", "HIGH"] }).notNull(),
    responseKind: text("response_kind").notNull().default("result"),
    a1cBand: text("a1c_band").notNull(),
    inputMethod: text("input_method", {
      enum: ["text", "voice", "photo"]
    })
      .notNull()
      .default("text"),
    clientId: text("client_id"),
    actionDoneAt: timestamp("action_done_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index("checks_user_day").on(table.userId, table.createdAt.desc()),
    uniqueIndex("checks_migration_dedupe")
      .on(table.userId, table.clientId)
      .where(isNotNull(table.clientId)),
    check("checks_risk_check", sql`${table.risk} IN ('SAFE','MODERATE','HIGH')`),
    check(
      "checks_input_method_check",
      sql`${table.inputMethod} IN ('text','voice','photo')`
    )
  ]
);

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  lastNudgeDate: date("last_nudge_date"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow()
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider", { enum: ["play", "stripe"] }).notNull(),
    providerRef: text("provider_ref").notNull().unique(),
    productId: text("product_id").notNull(),
    status: text("status", {
      enum: ["active", "canceled", "grace", "expired", "refunded"]
    }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true
    }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index("subscriptions_user").on(table.userId, table.status),
    check(
      "subscriptions_provider_check",
      sql`${table.provider} IN ('play','stripe')`
    ),
    check(
      "subscriptions_status_check",
      sql`${table.status} IN ('active','canceled','grace','expired','refunded')`
    )
  ]
);

export const baiWeekly = pgTable(
  "bai_weekly",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weekStart: date("week_start").notNull(),
    score: smallint("score").notNull(),
    adherence: smallint("adherence").notNull(),
    consistency: smallint("consistency").notNull(),
    action: smallint("action").notNull(),
    // How many checks this week carried a post-meal action (risk !== SAFE),
    // i.e. computeBai's promptedCount (lib/coach/bai.ts). Lets the UI say
    // "no post-meal actions this week" instead of rendering a misleading 0%
    // Follow-through bar when nobody was prompted.
    prompted: smallint("prompted").notNull().default(0),
    computedAt: timestamp("computed_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [primaryKey({ columns: [table.userId, table.weekStart] })]
);

// Audit trail that retains no identity: user id is hashed before insert.
export const deletionLog = pgTable("deletion_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userIdHash: text("user_id_hash").notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull()
});

// P7 observability: one row per cron job, upserted at the end of a
// successful run. /api/health reads staleness off `lastRunAt` — no counts,
// no user data, just a liveness timestamp per job name ("nudge",
// "bai-weekly").
export const cronHeartbeat = pgTable("cron_heartbeat", {
  name: text("name").primaryKey(),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }).notNull()
});

