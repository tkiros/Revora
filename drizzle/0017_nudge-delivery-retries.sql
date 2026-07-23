ALTER TABLE "push_subscriptions" ADD COLUMN "nudge_attempt_date" date;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD COLUMN "nudge_attempt_count" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD COLUMN "nudge_retry_after" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD COLUMN "nudge_lease_token" uuid;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD COLUMN "nudge_lease_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_nudge_attempt_count_check" CHECK ("push_subscriptions"."nudge_attempt_count" BETWEEN 0 AND 3);--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_nudge_attempt_state_check" CHECK (("push_subscriptions"."nudge_attempt_date" IS NULL AND "push_subscriptions"."nudge_attempt_count" = 0) OR ("push_subscriptions"."nudge_attempt_date" IS NOT NULL AND "push_subscriptions"."nudge_attempt_count" BETWEEN 1 AND 3));--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_nudge_lease_pair_check" CHECK (("push_subscriptions"."nudge_lease_token" IS NULL) = ("push_subscriptions"."nudge_lease_until" IS NULL));--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_nudge_retry_state_check" CHECK ("push_subscriptions"."nudge_retry_after" IS NULL OR ("push_subscriptions"."nudge_attempt_date" IS NOT NULL AND "push_subscriptions"."nudge_lease_token" IS NULL));