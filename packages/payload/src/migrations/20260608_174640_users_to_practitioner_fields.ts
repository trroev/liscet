import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" RENAME COLUMN "name" TO "display_name";
  DROP INDEX "users_better_auth_id_idx";
  ALTER TABLE "users" ADD COLUMN "timezone" varchar;
  CREATE UNIQUE INDEX "users_better_auth_id_idx" ON "users" USING btree ("better_auth_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" RENAME COLUMN "display_name" TO "name";
  DROP INDEX "users_better_auth_id_idx";
  CREATE INDEX "users_better_auth_id_idx" ON "users" USING btree ("better_auth_id");
  ALTER TABLE "users" DROP COLUMN "timezone";`)
}
