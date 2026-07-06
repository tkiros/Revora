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
      enum: ["active", "trialing", "canceled", "grace", "expired", "refunded"]
    }).notNull(),
    priceVariant: text("price_variant"),
    preChargeEmailSentAt: timestamp("pre_charge_email_sent_at", {
      withTimezone: true
    }),
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
      sql`${table.status} IN ('active','trialing','canceled','grace','expired','refunded')`
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

// ── Pantry Review pipeline (design doc 2026-07-04, eng review same day) ─────
//
// One-time paid report product, fully separate from `subscriptions` and
// `checks` (report items must NEVER land in `checks` — they would corrupt
// streaks/BAI/insights). Food names, portions, notes, and the report payload
// are health-adjacent → AES-256-GCM ciphertext, same standard as `checks`.
//
// Order state machine (one direction, sweep can re-enter processing):
//
//   paid ──▶ claimed ──▶ submitted ──▶ extracting ──▶ awaiting_confirm
//                                          │                 │
//                                          ▼                 ▼
//                                    needs_manual ◀──── processing ──▶ ready
//   (canceled reachable from any state via charge.refunded)
//
// `userId` is null until the buyer clicks the claim link and signs in —
// binding is by possession of `claimToken` (same trust model as magic-link
// auth), NOT by email equality (aliases/relays/typos break equality).

export const pantryOrders = pgTable(
  "pantry_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(), // Stripe customer_details at purchase
    stripeSessionId: text("stripe_session_id").notNull().unique(), // webhook idempotency
    stripePaymentIntent: text("stripe_payment_intent"), // refund matching
    claimToken: text("claim_token").notNull().unique(),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    status: text("status", {
      enum: [
        "paid",
        "claimed",
        "submitted",
        "extracting",
        "awaiting_confirm",
        "processing",
        "ready",
        "needs_manual",
        "canceled"
      ]
    })
      .notNull()
      .default("paid"),
    // Buyer provides at intake (no profile requirement) — same bands as profiles.
    a1cBand: text("a1c_band", {
      enum: ["prediabetes_57_59", "prediabetes_60_62", "prediabetes_63_64"]
    }),
    a1cCiphertext: text("a1c_ciphertext"),
    consentedAt: timestamp("consented_at", { withTimezone: true }), // Art. 9, at intake
    notesCiphertext: text("notes_ciphertext"),
    reportCiphertext: text("report_ciphertext"),
    // Processing lease: sweep may resume only after lease expiry; the
    // processor extends it while alive. Prevents double-runs (browser retry
    // vs cron overlap) without a queue.
    processingLeaseUntil: timestamp("processing_lease_until", {
      withTimezone: true
    }),
    intakeEmailSentAt: timestamp("intake_email_sent_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index("pantry_orders_user").on(table.userId),
    // Sweep scans non-terminal orders by age.
    index("pantry_orders_sweep").on(table.status, table.updatedAt),
    check(
      "pantry_orders_status_check",
      sql`${table.status} IN ('paid','claimed','submitted','extracting','awaiting_confirm','processing','ready','needs_manual','canceled')`
    )
  ]
);

export const pantryPhotos = pgTable(
  "pantry_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => pantryOrders.id, { onDelete: "cascade" }),
    blobUrl: text("blob_url").notNull(),
    status: text("status", {
      enum: ["uploaded", "extracted", "failed", "deleted"]
    })
      .notNull()
      .default("uploaded"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index("pantry_photos_order").on(table.orderId),
    check(
      "pantry_photos_status_check",
      sql`${table.status} IN ('uploaded','extracted','failed','deleted')`
    )
  ]
);

export const pantryItems = pgTable(
  "pantry_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => pantryOrders.id, { onDelete: "cascade" }),
    position: smallint("position").notNull().default(0),
    nameCiphertext: text("name_ciphertext").notNull(),
    portionCiphertext: text("portion_ciphertext"),
    source: text("source", { enum: ["vision", "buyer"] })
      .notNull()
      .default("vision"),
    status: text("status", {
      enum: ["draft", "confirmed", "judged", "failed"]
    })
      .notNull()
      .default("draft"),
    // Plaintext like checks.risk so the report summary strip aggregates
    // without decrypting; the full judged output stays ciphertext.
    risk: text("risk", { enum: ["SAFE", "MODERATE", "HIGH"] }),
    resultCiphertext: text("result_ciphertext"),
    attempts: smallint("attempts").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index("pantry_items_order").on(table.orderId, table.position),
    check(
      "pantry_items_source_check",
      sql`${table.source} IN ('vision','buyer')`
    ),
    check(
      "pantry_items_status_check",
      sql`${table.status} IN ('draft','confirmed','judged','failed')`
    ),
    check(
      "pantry_items_risk_check",
      sql`${table.risk} IS NULL OR ${table.risk} IN ('SAFE','MODERATE','HIGH')`
    )
  ]
);

