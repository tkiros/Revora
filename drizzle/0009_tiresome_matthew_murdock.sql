CREATE TABLE "learning_journeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"state" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"paused_at" timestamp with time zone,
	"accumulated_pause_ms" bigint DEFAULT 0 NOT NULL,
	"graduated_at" timestamp with time zone,
	"maintenance_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learning_journeys_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "learning_journeys_state_check" CHECK ("learning_journeys"."state" IN ('active','paused','graduated','maintenance'))
);
--> statement-breakpoint
ALTER TABLE "learning_journeys" ADD CONSTRAINT "learning_journeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;