CREATE TABLE "email_delivery_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_message_id" text,
	"idempotency_key" text NOT NULL,
	"recipient_hash" text NOT NULL,
	"category" text DEFAULT 'transactional' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"last_error_code" text,
	"accepted_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"last_event_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "email_delivery_attempts_provider_message_id_unique" UNIQUE("provider_message_id"),
	CONSTRAINT "email_delivery_attempts_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "email_delivery_category_check" CHECK ("email_delivery_attempts"."category" IN ('unknown','transactional','auth_magic_link','pantry_intake','pantry_report','pantry_alert','trial_precharge','payment_failed','support_case')),
	CONSTRAINT "email_delivery_status_check" CHECK ("email_delivery_attempts"."status" IN ('pending','accepted','sent','delivered','delayed','bounced','complained','suppressed','failed','rejected','rate_limited','transport_failed'))
);
--> statement-breakpoint
CREATE TABLE "email_suppressions" (
	"recipient_hash" text PRIMARY KEY NOT NULL,
	"reason" text NOT NULL,
	"provider_message_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_suppression_reason_check" CHECK ("email_suppressions"."reason" IN ('bounced','complained','suppressed'))
);
--> statement-breakpoint
CREATE INDEX "email_delivery_status" ON "email_delivery_attempts" USING btree ("status","updated_at");--> statement-breakpoint
CREATE INDEX "email_delivery_expiry" ON "email_delivery_attempts" USING btree ("expires_at");