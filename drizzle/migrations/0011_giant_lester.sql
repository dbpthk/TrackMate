CREATE TABLE "notification_viewed" (
	"user_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	CONSTRAINT "notification_viewed_user_id_recipient_id_pk" PRIMARY KEY("user_id","recipient_id")
);
--> statement-breakpoint
ALTER TABLE "notification_viewed" ADD CONSTRAINT "notification_viewed_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_viewed" ADD CONSTRAINT "notification_viewed_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_viewed_user_idx" ON "notification_viewed" USING btree ("user_id");