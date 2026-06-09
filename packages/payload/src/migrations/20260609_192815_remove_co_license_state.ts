import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "licenses" ALTER COLUMN "state" SET DATA TYPE text;
  DROP TYPE "public"."enum_licenses_state";
  CREATE TYPE "public"."enum_licenses_state" AS ENUM('CA', 'MA', 'MI', 'CT');
  ALTER TABLE "licenses" ALTER COLUMN "state" SET DATA TYPE "public"."enum_licenses_state" USING "state"::"public"."enum_licenses_state";
  ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "reactivation_date" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_licenses_state" ADD VALUE 'CO';
  ALTER TABLE "licenses" DROP COLUMN IF EXISTS "reactivation_date";`)
}
