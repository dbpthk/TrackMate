-- Add indexes only. Tables already exist. Using IF NOT EXISTS for safety.
CREATE INDEX IF NOT EXISTS "workouts_user_date_type_idx" ON "workouts" USING btree ("user_id","date","type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "exercises_workout_id_idx" ON "exercises" USING btree ("workout_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shared_pr_recipient_idx" ON "shared_personal_records" USING btree ("recipient_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shared_pr_sharer_idx" ON "shared_personal_records" USING btree ("sharer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "buddy_requests_recipient_status_idx" ON "buddy_requests" USING btree ("recipient_id","status");
