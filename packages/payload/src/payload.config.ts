import path from "node:path"
import { fileURLToPath } from "node:url"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { env as cloudinaryEnv } from "@repo/env/cloudinary"
import { env as databaseEnv } from "@repo/env/database"
import { env as payloadEnv } from "@repo/env/payload"
import { cloudinaryAdapter } from "@repo/payload/adapters/cloudinary"
import { Admins } from "@repo/payload/collections/Admins"
import { CourseCredits } from "@repo/payload/collections/CourseCredits"
import { Courses } from "@repo/payload/collections/Courses"
import { Licenses } from "@repo/payload/collections/Licenses"
import { Media } from "@repo/payload/collections/Media"
import { NotificationLog } from "@repo/payload/collections/NotificationLog"
import { RuleSetVersions } from "@repo/payload/collections/RuleSetVersions"
import { Users } from "@repo/payload/collections/Users"
import { buildConfig } from "payload"

const dirname = path.dirname(fileURLToPath(import.meta.url))

type CloudinaryConfig = {
  readonly cloud_name: string
  readonly api_key: string
  readonly api_secret: string
}

const resolveCloudinaryConfig = (): CloudinaryConfig | undefined => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    cloudinaryEnv
  if (!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)) {
    return
  }
  return {
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  }
}

type CreatePayloadConfigOptions = {
  readonly baseDir: string
}

export function createPayloadConfig({ baseDir }: CreatePayloadConfigOptions) {
  const cloudinaryConfig = resolveCloudinaryConfig()

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
      RuleSetVersions,
      Users,
    ],
    db: postgresAdapter({
      idType: "uuid",
      migrationDir: path.resolve(dirname, "migrations"),
      pool: { connectionString: databaseEnv.DATABASE_URL },
      tablesFilter: ["!user", "!session", "!account", "!verification"],
    }),
    editor: lexicalEditor(),
    plugins: cloudinaryConfig
      ? [
          cloudStoragePlugin({
            collections: {
              media: {
                adapter: cloudinaryAdapter({
                  config: cloudinaryConfig,
                  folder: "starter",
                }),
                disableLocalStorage: true,
                disablePayloadAccessControl: true,
              },
            },
          }),
        ]
      : [],
    secret: payloadEnv.PAYLOAD_SECRET,
    typescript: {
      outputFile: path.resolve(dirname, "types", "payload-types.ts"),
    },
  })
}
