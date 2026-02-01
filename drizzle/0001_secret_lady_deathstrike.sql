ALTER TABLE "short_links" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "short_links" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "short_links" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;