import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_format" AS ENUM('live', 'home-study', 'in-person');
  CREATE TYPE "public"."enum_courses_source" AS ENUM('manual', 'catalog');
  CREATE TABLE "courses" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"practitioner_id" uuid NOT NULL,
  	"title" varchar NOT NULL,
  	"provider" varchar,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"hours" numeric NOT NULL,
  	"format" "enum_courses_format" NOT NULL,
  	"certificate_id" uuid,
  	"source" "enum_courses_source" DEFAULT 'manual',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "courses_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "courses_id" uuid;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_practitioner_id_users_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_certificate_id_media_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_texts" ADD CONSTRAINT "courses_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_practitioner_idx" ON "courses" USING btree ("practitioner_id");
  CREATE INDEX "courses_certificate_idx" ON "courses" USING btree ("certificate_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE INDEX "practitioner_completedAt_idx" ON "courses" USING btree ("practitioner_id","completed_at");
  CREATE INDEX "courses_texts_order_parent" ON "courses_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "courses_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_courses_fk";
  
  DROP INDEX "payload_locked_documents_rels_courses_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "courses_id";
  DROP TYPE "public"."enum_courses_format";
  DROP TYPE "public"."enum_courses_source";`)
}
