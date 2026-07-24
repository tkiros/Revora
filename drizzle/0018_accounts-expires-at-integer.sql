ALTER TABLE "accounts" ALTER COLUMN "expires_at" SET DATA TYPE integer;--> statement-breakpoint
-- AUD-024 remediation (OA-3): invalidate every outstanding sign-in token at
-- the deploy that ships the patched normalizer. Magic links are short-lived;
-- affected users simply request a fresh one.
DELETE FROM "verification_tokens";
