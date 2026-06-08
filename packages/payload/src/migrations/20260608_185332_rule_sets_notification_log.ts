import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_notification_log_notification_type" AS ENUM('renewal-90d', 'renewal-60d', 'renewal-30d', 'renewal-7d', 'renewal-1d', 'category-shortfall');
  CREATE TYPE "public"."enum_rule_set_versions_state" AS ENUM('CA', 'MA', 'MI', 'CT', 'CO');
  CREATE TABLE "notification_log" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"practitioner_id" uuid NOT NULL,
  	"license_id" uuid NOT NULL,
  	"notification_type" "enum_notification_log_notification_type" NOT NULL,
  	"sent_at" timestamp(3) with time zone NOT NULL,
  	"sent_for_date" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rule_set_versions" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"state" "enum_rule_set_versions_state" NOT NULL,
  	"license_type" varchar NOT NULL,
  	"version" varchar NOT NULL,
  	"published_at" timestamp(3) with time zone NOT NULL,
  	"rule_set_json" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "course_credits" ADD COLUMN "rule_set_version_id" uuid NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "notification_log_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "rule_set_versions_id" uuid;
  ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_practitioner_id_users_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_license_id_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."licenses"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "notification_log_practitioner_idx" ON "notification_log" USING btree ("practitioner_id");
  CREATE INDEX "notification_log_license_idx" ON "notification_log" USING btree ("license_id");
  CREATE INDEX "notification_log_updated_at_idx" ON "notification_log" USING btree ("updated_at");
  CREATE INDEX "notification_log_created_at_idx" ON "notification_log" USING btree ("created_at");
  CREATE UNIQUE INDEX "practitioner_license_notificationType_sentForDate_idx" ON "notification_log" USING btree ("practitioner_id","license_id","notification_type","sent_for_date");
  CREATE INDEX "rule_set_versions_updated_at_idx" ON "rule_set_versions" USING btree ("updated_at");
  CREATE INDEX "rule_set_versions_created_at_idx" ON "rule_set_versions" USING btree ("created_at");
  CREATE UNIQUE INDEX "state_licenseType_version_idx" ON "rule_set_versions" USING btree ("state","license_type","version");
  ALTER TABLE "course_credits" ADD CONSTRAINT "course_credits_rule_set_version_id_rule_set_versions_id_fk" FOREIGN KEY ("rule_set_version_id") REFERENCES "public"."rule_set_versions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notification_log_fk" FOREIGN KEY ("notification_log_id") REFERENCES "public"."notification_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rule_set_versions_fk" FOREIGN KEY ("rule_set_versions_id") REFERENCES "public"."rule_set_versions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "course_credits_rule_set_version_idx" ON "course_credits" USING btree ("rule_set_version_id");
  CREATE INDEX "payload_locked_documents_rels_notification_log_id_idx" ON "payload_locked_documents_rels" USING btree ("notification_log_id");
  CREATE INDEX "payload_locked_documents_rels_rule_set_versions_id_idx" ON "payload_locked_documents_rels" USING btree ("rule_set_versions_id");
  ALTER TABLE "course_credits" DROP COLUMN "rule_set_version";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "notification_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rule_set_versions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "notification_log" CASCADE;
  DROP TABLE "rule_set_versions" CASCADE;
  ALTER TABLE "course_credits" DROP CONSTRAINT "course_credits_rule_set_version_id_rule_set_versions_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_notification_log_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_rule_set_versions_fk";
  
  DROP INDEX "course_credits_rule_set_version_idx";
  DROP INDEX "payload_locked_documents_rels_notification_log_id_idx";
  DROP INDEX "payload_locked_documents_rels_rule_set_versions_id_idx";
  ALTER TABLE "course_credits" ADD COLUMN "rule_set_version" varchar NOT NULL;
  ALTER TABLE "course_credits" DROP COLUMN "rule_set_version_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "notification_log_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "rule_set_versions_id";
  DROP TYPE "public"."enum_notification_log_notification_type";
  DROP TYPE "public"."enum_rule_set_versions_state";`)
}
