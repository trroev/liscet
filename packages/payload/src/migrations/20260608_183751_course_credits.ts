import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "course_credits" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"course_id" uuid NOT NULL,
  	"license_id" uuid NOT NULL,
  	"credited_hours" numeric NOT NULL,
  	"evaluated_at" timestamp(3) with time zone NOT NULL,
  	"rule_set_version" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "course_credits_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "course_credits_id" uuid;
  ALTER TABLE "course_credits" ADD CONSTRAINT "course_credits_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_credits" ADD CONSTRAINT "course_credits_license_id_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."licenses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_credits_texts" ADD CONSTRAINT "course_credits_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."course_credits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "course_credits_course_idx" ON "course_credits" USING btree ("course_id");
  CREATE INDEX "course_credits_license_idx" ON "course_credits" USING btree ("license_id");
  CREATE INDEX "course_credits_updated_at_idx" ON "course_credits" USING btree ("updated_at");
  CREATE INDEX "course_credits_created_at_idx" ON "course_credits" USING btree ("created_at");
  CREATE UNIQUE INDEX "course_license_idx" ON "course_credits" USING btree ("course_id","license_id");
  CREATE INDEX "course_credits_texts_order_parent" ON "course_credits_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_credits_fk" FOREIGN KEY ("course_credits_id") REFERENCES "public"."course_credits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_course_credits_id_idx" ON "payload_locked_documents_rels" USING btree ("course_credits_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_credits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "course_credits_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "course_credits" CASCADE;
  DROP TABLE "course_credits_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_course_credits_fk";
  
  DROP INDEX "payload_locked_documents_rels_course_credits_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "course_credits_id";`)
}
