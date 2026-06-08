import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_licenses_state" AS ENUM('CA', 'MA', 'MI', 'CT', 'CO');
  CREATE TABLE "licenses" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"practitioner_id" uuid NOT NULL,
  	"state" "enum_licenses_state" NOT NULL,
  	"license_type" varchar NOT NULL,
  	"license_number" varchar NOT NULL,
  	"issued_at" timestamp(3) with time zone NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"renewal_cycle_months" numeric DEFAULT 24,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "licenses_id" uuid;
  ALTER TABLE "licenses" ADD CONSTRAINT "licenses_practitioner_id_users_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "licenses_practitioner_idx" ON "licenses" USING btree ("practitioner_id");
  CREATE INDEX "licenses_updated_at_idx" ON "licenses" USING btree ("updated_at");
  CREATE INDEX "licenses_created_at_idx" ON "licenses" USING btree ("created_at");
  CREATE INDEX "practitioner_state_licenseType_idx" ON "licenses" USING btree ("practitioner_id","state","license_type");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_licenses_fk" FOREIGN KEY ("licenses_id") REFERENCES "public"."licenses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_licenses_id_idx" ON "payload_locked_documents_rels" USING btree ("licenses_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "licenses" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "licenses" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_licenses_fk";
  
  DROP INDEX "payload_locked_documents_rels_licenses_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "licenses_id";
  DROP TYPE "public"."enum_licenses_state";`)
}
