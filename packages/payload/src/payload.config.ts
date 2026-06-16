import path from "node:path"
import { fileURLToPath } from "node:url"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob"
import { env as blobEnv } from "@repo/env/blob"
import { env as databaseEnv } from "@repo/env/database"
import { env as payloadEnv } from "@repo/env/payload"
import { Admins } from "@repo/payload/collections/Admins"
import { CourseCredits } from "@repo/payload/collections/CourseCredits"
import { Courses } from "@repo/payload/collections/Courses"
import { Licenses } from "@repo/payload/collections/Licenses"
import { Media } from "@repo/payload/collections/Media"
import { NotificationLog } from "@repo/payload/collections/NotificationLog"
import { Users } from "@repo/payload/collections/Users"
import { buildConfig } from "payload"

const dirname = path.dirname(fileURLToPath(import.meta.url))

const VERCEL_BLOB_TOKEN_RE = /^vercel_blob_rw_[a-z\d]+_[a-z\d]+$/i

const hasVercelBlobToken = VERCEL_BLOB_TOKEN_RE.test(
  blobEnv.BLOB_READ_WRITE_TOKEN
)

type CreatePayloadConfigOptions = {
  readonly baseDir: string
}

export function createPayloadConfig({ baseDir }: CreatePayloadConfigOptions) {
  return buildConfig({
    admin: {
      autoLogin:
        payloadEnv.PAYLOAD_ADMIN_EMAIL && payloadEnv.PAYLOAD_ADMIN_PASSWORD
          ? {
              email: payloadEnv.PAYLOAD_ADMIN_EMAIL,
              password: payloadEnv.PAYLOAD_ADMIN_PASSWORD,
              prefillOnly: payloadEnv.PAYLOAD_ADMIN_PREFILL_ONLY,
            }
          : undefined,
      avatar: "gravatar",
      importMap: {
        baseDir,
      },
      meta: {
        titleSuffix: " | Starter",
      },
      user: Admins.slug,
    },
    collections: [
      Admins,
      CourseCredits,
      Courses,
      Licenses,
      Media,
      NotificationLog,
      Users,
    ],
    db: postgresAdapter({
      idType: "uuid",
      migrationDir: path.resolve(dirname, "migrations"),
      pool: { connectionString: databaseEnv.DATABASE_URL },
      tablesFilter: ["!user", "!session", "!account", "!verification"],
    }),
    editor: lexicalEditor(),
    plugins: [
      vercelBlobStorage({
        collections: { media: true },
        enabled: hasVercelBlobToken,
        token: blobEnv.BLOB_READ_WRITE_TOKEN,
      }),
    ],
    secret: payloadEnv.PAYLOAD_SECRET,
    typescript: {
      outputFile: path.resolve(dirname, "types", "payload-types.ts"),
    },
  })
}
