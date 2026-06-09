import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "licenses" ADD COLUMN "co_telehealth_registration_is_registered" boolean DEFAULT false;
  ALTER TABLE "licenses" ADD COLUMN "co_telehealth_registration_registration_number" varchar;
  ALTER TABLE "licenses" ADD COLUMN "co_telehealth_registration_expires_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "licenses" DROP COLUMN "co_telehealth_registration_is_registered";
  ALTER TABLE "licenses" DROP COLUMN "co_telehealth_registration_registration_number";
  ALTER TABLE "licenses" DROP COLUMN "co_telehealth_registration_expires_at";`)
}
