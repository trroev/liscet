import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_notification_log_notification_type" ADD VALUE 'co-telehealth-90d';
  ALTER TYPE "public"."enum_notification_log_notification_type" ADD VALUE 'co-telehealth-60d';
  ALTER TYPE "public"."enum_notification_log_notification_type" ADD VALUE 'co-telehealth-30d';
  ALTER TYPE "public"."enum_notification_log_notification_type" ADD VALUE 'co-telehealth-7d';
  ALTER TYPE "public"."enum_notification_log_notification_type" ADD VALUE 'co-telehealth-1d';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "notification_log" ALTER COLUMN "notification_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_notification_log_notification_type";
  CREATE TYPE "public"."enum_notification_log_notification_type" AS ENUM('renewal-90d', 'renewal-60d', 'renewal-30d', 'renewal-7d', 'renewal-1d', 'category-shortfall');
  ALTER TABLE "notification_log" ALTER COLUMN "notification_type" SET DATA TYPE "public"."enum_notification_log_notification_type" USING "notification_type"::"public"."enum_notification_log_notification_type";`)
}
