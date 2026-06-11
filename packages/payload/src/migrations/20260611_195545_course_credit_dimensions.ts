import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_credits" ADD COLUMN "completed_at" timestamp(3) with time zone NOT NULL;
  ALTER TABLE "course_credits" ADD COLUMN "format" varchar NOT NULL;
  ALTER TABLE "course_credits" ADD COLUMN "approving_body" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_credits" DROP COLUMN "completed_at";
  ALTER TABLE "course_credits" DROP COLUMN "format";
  ALTER TABLE "course_credits" DROP COLUMN "approving_body";`)
}
