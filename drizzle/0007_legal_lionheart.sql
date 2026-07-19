ALTER TABLE "checks" ADD COLUMN "card_ciphertext" text;--> statement-breakpoint
ALTER TABLE "checks" ADD COLUMN "route_type" text;--> statement-breakpoint
ALTER TABLE "checks" ADD COLUMN "clarify_question_ciphertext" text;--> statement-breakpoint
ALTER TABLE "checks" ADD COLUMN "clarify_answer_ciphertext" text;--> statement-breakpoint
ALTER TABLE "checks" ADD COLUMN "was_clarified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "checks" ADD COLUMN "prompt_version" text;--> statement-breakpoint
ALTER TABLE "checks" ADD COLUMN "contract_version" text;--> statement-breakpoint
ALTER TABLE "checks" ADD COLUMN "model_id" text;--> statement-breakpoint
ALTER TABLE "checks" ADD COLUMN "floor_applied" text;--> statement-breakpoint
ALTER TABLE "checks" ADD COLUMN "used_fallback" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "checks" ADD CONSTRAINT "checks_floor_applied_check" CHECK ("checks"."floor_applied" IS NULL OR "checks"."floor_applied" IN ('high_risk','carbs_only','borderline'));