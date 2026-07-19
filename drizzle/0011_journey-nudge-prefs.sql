ALTER TABLE "profiles" ADD COLUMN "nudge_cadence" text DEFAULT 'daily' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "nudge_quiet_start" smallint;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "nudge_quiet_end" smallint;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_nudge_cadence_check" CHECK ("profiles"."nudge_cadence" IN ('daily','few_per_week','weekly'));--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_nudge_quiet_start_check" CHECK ("profiles"."nudge_quiet_start" IS NULL OR ("profiles"."nudge_quiet_start" >= 0 AND "profiles"."nudge_quiet_start" <= 23));--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_nudge_quiet_end_check" CHECK ("profiles"."nudge_quiet_end" IS NULL OR ("profiles"."nudge_quiet_end" >= 0 AND "profiles"."nudge_quiet_end" <= 23));