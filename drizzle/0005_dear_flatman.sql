CREATE TABLE "check_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"check_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"helpful" boolean NOT NULL,
	"reason" text,
	"comment_ciphertext" text,
	"review_status" text DEFAULT 'none' NOT NULL,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "check_feedback_reason_check" CHECK ("check_feedback"."reason" IS NULL OR "check_feedback"."reason" IN ('too_vague','wrong_food','unsafe_feeling','confusing','other')),
	CONSTRAINT "check_feedback_review_status_check" CHECK ("check_feedback"."review_status" IN ('none','queued','reviewed'))
);
--> statement-breakpoint
ALTER TABLE "check_feedback" ADD CONSTRAINT "check_feedback_check_id_checks_id_fk" FOREIGN KEY ("check_id") REFERENCES "public"."checks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_feedback" ADD CONSTRAINT "check_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "check_feedback_check_user" ON "check_feedback" USING btree ("check_id","user_id");--> statement-breakpoint
CREATE INDEX "check_feedback_queue" ON "check_feedback" USING btree ("review_status","created_at");