CREATE TABLE "weekly_reflections" (
	"user_id" uuid NOT NULL,
	"week_start" date NOT NULL,
	"version" text NOT NULL,
	"artifact_ciphertext" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_reflections_user_id_week_start_pk" PRIMARY KEY("user_id","week_start")
);
--> statement-breakpoint
ALTER TABLE "weekly_reflections" ADD CONSTRAINT "weekly_reflections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;