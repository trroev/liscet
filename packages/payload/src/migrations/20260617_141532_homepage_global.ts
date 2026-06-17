import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "homepage_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"hero_title" varchar DEFAULT 'Professional License & CEU Renewal Tracker' NOT NULL,
  	"hero_subtitle" varchar DEFAULT 'Liscet tracks your professional licenses and continuing-education credits across every state and license type, so you always know exactly how many CEUs stand between you and your next renewal.' NOT NULL,
  	"hero_cta_label" varchar DEFAULT 'Start tracking free' NOT NULL,
  	"hero_cta_href" varchar DEFAULT '/sign-up' NOT NULL,
  	"features_heading" varchar DEFAULT 'Built for renewal season' NOT NULL,
  	"meta_title" varchar DEFAULT 'Professional License & CEU Renewal Tracker',
  	"meta_description" varchar DEFAULT 'Liscet tracks your professional licenses and continuing-education credits across every state and license type, so you always know exactly how many CEUs stand between you and your next renewal.',
  	"meta_image_id" uuid,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "homepage_features" ADD CONSTRAINT "homepage_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_texts" ADD CONSTRAINT "homepage_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_features_order_idx" ON "homepage_features" USING btree ("_order");
  CREATE INDEX "homepage_features_parent_id_idx" ON "homepage_features" USING btree ("_parent_id");
  CREATE INDEX "homepage_meta_meta_image_idx" ON "homepage" USING btree ("meta_image_id");
  CREATE INDEX "homepage_texts_order_parent" ON "homepage_texts" USING btree ("order","parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "homepage_features" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_texts" CASCADE;`)
}
