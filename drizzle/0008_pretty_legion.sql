CREATE TABLE "meal_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"check_id" uuid NOT NULL,
	"choice_ciphertext" text,
	"would_repeat" boolean,
	"ease_reflection" text,
	"note_ciphertext" text,
	"favorite" boolean DEFAULT false NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meal_memories_ease_check" CHECK ("meal_memories"."ease_reflection" IS NULL OR "meal_memories"."ease_reflection" IN ('easy','okay','hard')),
	CONSTRAINT "meal_memories_label_check" CHECK ("meal_memories"."label" IS NULL OR "meal_memories"."label" IN ('breakfast','lunch','dinner','snack','restaurant','travel','family_meal','other'))
);
--> statement-breakpoint
ALTER TABLE "meal_memories" ADD CONSTRAINT "meal_memories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_memories" ADD CONSTRAINT "meal_memories_check_id_checks_id_fk" FOREIGN KEY ("check_id") REFERENCES "public"."checks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "meal_memories_user_check" ON "meal_memories" USING btree ("user_id","check_id");--> statement-breakpoint
CREATE INDEX "meal_memories_user" ON "meal_memories" USING btree ("user_id","created_at" DESC NULLS LAST);