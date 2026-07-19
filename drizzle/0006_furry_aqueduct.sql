CREATE TABLE "billing_event_inbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text DEFAULT 'stripe' NOT NULL,
	"provider_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"last_error" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "billing_event_inbox_provider_event_id_unique" UNIQUE("provider_event_id"),
	CONSTRAINT "billing_event_inbox_provider_check" CHECK ("billing_event_inbox"."provider" IN ('stripe')),
	CONSTRAINT "billing_event_inbox_status_check" CHECK ("billing_event_inbox"."status" IN ('pending','processed','failed','dead_letter'))
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "last_event_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "last_verified_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "billing_event_inbox_status" ON "billing_event_inbox" USING btree ("status","received_at");