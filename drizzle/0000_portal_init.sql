CREATE TYPE "public"."portal_actor_kind" AS ENUM('user', 'ingest');--> statement-breakpoint
CREATE TYPE "public"."portal_asset_kind" AS ENUM('slides_pdf', 'slide_image', 'audio', 'transcript', 'recap_audio', 'recap_video');--> statement-breakpoint
CREATE TYPE "public"."portal_item_kind" AS ENUM('task', 'next_time');--> statement-breakpoint
CREATE TYPE "public"."portal_role" AS ENUM('client', 'coach', 'admin');--> statement-breakpoint
CREATE TYPE "public"."portal_session_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_kind" "portal_actor_kind" NOT NULL,
	"actor_user_id" uuid,
	"action" text NOT NULL,
	"org_id" uuid,
	"session_id" uuid,
	"detail" jsonb,
	CONSTRAINT "audit_log_actor_pair" CHECK (("audit_log"."actor_kind" = 'user') = ("audit_log"."actor_user_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "auth_accounts" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "auth_accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "auth_verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "coaching_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"engagement_id" uuid NOT NULL,
	"number" integer NOT NULL,
	"scheduled_at" timestamp with time zone,
	"held_on" date,
	"title" text,
	"summary_md" text,
	"status" "portal_session_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"published_by" uuid,
	"ingest_hash" text,
	"last_ingested_at" timestamp with time zone,
	"edited_at" timestamp with time zone,
	"edited_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coaching_sessions_engagement_number_key" UNIQUE("engagement_id","number"),
	CONSTRAINT "coaching_sessions_id_org_key" UNIQUE("id","org_id"),
	CONSTRAINT "coaching_sessions_number_positive" CHECK ("coaching_sessions"."number" > 0),
	CONSTRAINT "coaching_sessions_published_gate" CHECK (("coaching_sessions"."status" = 'published') = ("coaching_sessions"."published_at" IS NOT NULL AND "coaching_sessions"."published_by" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "engagements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"program_id" uuid NOT NULL,
	"starts_on" date,
	CONSTRAINT "engagements_org_program_key" UNIQUE("org_id","program_id"),
	CONSTRAINT "engagements_id_org_key" UNIQUE("id","org_id")
);
--> statement-breakpoint
CREATE TABLE "organisations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organisations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"session_count" integer NOT NULL,
	CONSTRAINT "programs_slug_unique" UNIQUE("slug"),
	CONSTRAINT "programs_session_count_positive" CHECK ("programs"."session_count" > 0)
);
--> statement-breakpoint
CREATE TABLE "session_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"kind" "portal_asset_kind" NOT NULL,
	"position" integer NOT NULL,
	"blob_pathname" text NOT NULL,
	"content_type" text NOT NULL,
	"bytes" bigint NOT NULL,
	"sha256" text NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_assets_blob_pathname_unique" UNIQUE("blob_pathname")
);
--> statement-breakpoint
CREATE TABLE "session_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"kind" "portal_item_kind" NOT NULL,
	"position" integer NOT NULL,
	"text" text NOT NULL,
	"done_at" timestamp with time zone,
	"done_by" uuid,
	CONSTRAINT "session_items_done_pair" CHECK (("session_items"."done_at" IS NULL) = ("session_items"."done_by" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"email_verified" timestamp with time zone,
	"image" text,
	"role" "portal_role" NOT NULL,
	"org_id" uuid,
	"invited_by" uuid,
	"invited_at" timestamp with time zone,
	"disabled_at" timestamp with time zone,
	CONSTRAINT "users_email_lowercase" CHECK ("users"."email" = lower("users"."email")),
	CONSTRAINT "users_client_has_org" CHECK (("users"."role" = 'client') = ("users"."org_id" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_edited_by_users_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_engagement_org_fk" FOREIGN KEY ("engagement_id","org_id") REFERENCES "public"."engagements"("id","org_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_assets" ADD CONSTRAINT "session_assets_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_assets" ADD CONSTRAINT "session_assets_session_org_fk" FOREIGN KEY ("session_id","org_id") REFERENCES "public"."coaching_sessions"("id","org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_items" ADD CONSTRAINT "session_items_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_items" ADD CONSTRAINT "session_items_done_by_users_id_fk" FOREIGN KEY ("done_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_items" ADD CONSTRAINT "session_items_session_org_fk" FOREIGN KEY ("session_id","org_id") REFERENCES "public"."coaching_sessions"("id","org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_session_at_idx" ON "audit_log" USING btree ("session_id","at");--> statement-breakpoint
CREATE INDEX "auth_verification_tokens_identifier_expires_idx" ON "auth_verification_tokens" USING btree ("identifier","expires");--> statement-breakpoint
CREATE INDEX "session_assets_session_kind_position_idx" ON "session_assets" USING btree ("session_id","kind","position");--> statement-breakpoint
CREATE INDEX "session_items_session_kind_position_idx" ON "session_items" USING btree ("session_id","kind","position");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_key" ON "users" USING btree (lower("email"));