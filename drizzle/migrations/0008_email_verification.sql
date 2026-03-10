ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" timestamp;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verification_token" varchar(255);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verification_token_expiry" timestamp;
