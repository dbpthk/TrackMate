CREATE TABLE IF NOT EXISTS "shared_personal_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"sharer_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"shared_at" timestamp DEFAULT now() NOT NULL,
	"records" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shared_personal_records" ADD CONSTRAINT "shared_personal_records_sharer_id_users_id_fk" FOREIGN KEY ("sharer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "shared_personal_records" ADD CONSTRAINT "shared_personal_records_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
