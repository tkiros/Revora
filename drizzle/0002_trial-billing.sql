ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_status_check";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "price_variant" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "pre_charge_email_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_status_check" CHECK ("subscriptions"."status" IN ('active','trialing','canceled','grace','expired','refunded'));