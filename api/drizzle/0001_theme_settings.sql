CREATE TABLE "site_theme" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"palette" text DEFAULT 'indigo' NOT NULL,
	"custom_accent" text,
	"default_mode" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
