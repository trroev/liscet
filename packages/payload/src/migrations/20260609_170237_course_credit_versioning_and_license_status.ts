import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_licenses_status" AS ENUM('active', 'lapsed', 'suspended', 'revoked');
  ALTER TABLE "rule_set_versions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "rule_set_versions" CASCADE;
  ALTER TABLE "course_credits" DROP CONSTRAINT IF EXISTS "course_credits_rule_set_version_id_rule_set_versions_id_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_rule_set_versions_fk";

  DROP INDEX "course_credits_rule_set_version_idx";
  DROP INDEX "payload_locked_documents_rels_rule_set_versions_id_idx";
  ALTER TABLE "course_credits" ADD COLUMN "rule_set_key" varchar NOT NULL;
  ALTER TABLE "course_credits" ADD COLUMN "rule_set_version" numeric NOT NULL;
  ALTER TABLE "licenses" ADD COLUMN "status" "enum_licenses_status" DEFAULT 'active' NOT NULL;
  ALTER TABLE "course_credits" DROP COLUMN "rule_set_version_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "rule_set_versions_id";
  DROP TYPE "public"."enum_rule_set_versions_state";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_rule_set_versions_state" AS ENUM('CA', 'MA', 'MI', 'CT', 'CO');
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
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "rule_set_versions_id" uuid;
  CREATE INDEX "rule_set_versions_updated_at_idx" ON "rule_set_versions" USING btree ("updated_at");
  CREATE INDEX "rule_set_versions_created_at_idx" ON "rule_set_versions" USING btree ("created_at");
  CREATE UNIQUE INDEX "state_licenseType_version_idx" ON "rule_set_versions" USING btree ("state","license_type","version");
  ALTER TABLE "course_credits" ADD CONSTRAINT "course_credits_rule_set_version_id_rule_set_versions_id_fk" FOREIGN KEY ("rule_set_version_id") REFERENCES "public"."rule_set_versions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rule_set_versions_fk" FOREIGN KEY ("rule_set_versions_id") REFERENCES "public"."rule_set_versions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "course_credits_rule_set_version_idx" ON "course_credits" USING btree ("rule_set_version_id");
  CREATE INDEX "payload_locked_documents_rels_rule_set_versions_id_idx" ON "payload_locked_documents_rels" USING btree ("rule_set_versions_id");
  ALTER TABLE "course_credits" DROP COLUMN "rule_set_key";
  ALTER TABLE "course_credits" DROP COLUMN "rule_set_version";
  ALTER TABLE "licenses" DROP COLUMN "status";
  DROP TYPE "public"."enum_licenses_status";`)
}
