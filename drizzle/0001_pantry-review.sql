CREATE TABLE "pantry_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	"name_ciphertext" text NOT NULL,
	"portion_ciphertext" text,
	"source" text DEFAULT 'vision' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"risk" text,
	"result_ciphertext" text,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pantry_items_source_check" CHECK ("pantry_items"."source" IN ('vision','buyer')),
	CONSTRAINT "pantry_items_status_check" CHECK ("pantry_items"."status" IN ('draft','confirmed','judged','failed')),
	CONSTRAINT "pantry_items_risk_check" CHECK ("pantry_items"."risk" IS NULL OR "pantry_items"."risk" IN ('SAFE','MODERATE','HIGH'))
);
--> statement-breakpoint
CREATE TABLE "pantry_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" text NOT NULL,
	"stripe_session_id" text NOT NULL,
	"stripe_payment_intent" text,
	"claim_token" text NOT NULL,
	"claimed_at" timestamp with time zone,
	"status" text DEFAULT 'paid' NOT NULL,
	"a1c_band" text,
	"a1c_ciphertext" text,
	"consented_at" timestamp with time zone,
	"notes_ciphertext" text,
	"report_ciphertext" text,
	"processing_lease_until" timestamp with time zone,
	"intake_email_sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pantry_orders_stripe_session_id_unique" UNIQUE("stripe_session_id"),
	CONSTRAINT "pantry_orders_claim_token_unique" UNIQUE("claim_token"),
	CONSTRAINT "pantry_orders_status_check" CHECK ("pantry_orders"."status" IN ('paid','claimed','submitted','extracting','awaiting_confirm','processing','ready','needs_manual','canceled'))
);
--> statement-breakpoint
CREATE TABLE "pantry_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"blob_url" text NOT NULL,
	"status" text DEFAULT 'uploaded' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pantry_photos_status_check" CHECK ("pantry_photos"."status" IN ('uploaded','extracted','failed','deleted'))
);
--> statement-breakpoint
ALTER TABLE "pantry_items" ADD CONSTRAINT "pantry_items_order_id_pantry_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."pantry_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pantry_orders" ADD CONSTRAINT "pantry_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pantry_photos" ADD CONSTRAINT "pantry_photos_order_id_pantry_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."pantry_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pantry_items_order" ON "pantry_items" USING btree ("order_id","position");--> statement-breakpoint
CREATE INDEX "pantry_orders_user" ON "pantry_orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pantry_orders_sweep" ON "pantry_orders" USING btree ("status","updated_at");--> statement-breakpoint
CREATE INDEX "pantry_photos_order" ON "pantry_photos" USING btree ("order_id");