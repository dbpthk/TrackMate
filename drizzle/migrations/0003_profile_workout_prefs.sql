ALTER TABLE "users" ADD COLUMN "body_fat" integer;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "training_split" varchar(100);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "preferred_days" varchar(255);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "units" varchar(20);
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "fitness_goal";
