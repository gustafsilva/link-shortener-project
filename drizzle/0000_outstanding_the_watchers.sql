CREATE TABLE "short_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"original_url" text NOT NULL,
	"short_code" varchar(7) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "short_links_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "short_links" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "short_code_idx" ON "short_links" USING btree ("short_code");