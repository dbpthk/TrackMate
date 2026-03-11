CREATE TABLE "home_completions" (
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	CONSTRAINT "home_completions_user_id_date_pk" PRIMARY KEY("user_id","date")
);
--> statement-breakpoint
ALTER TABLE "home_completions" ADD CONSTRAINT "home_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "home_completions_user_idx" ON "home_completions" USING btree ("user_id");