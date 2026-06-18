import path from "node:path"
import { fileURLToPath } from "node:url"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { seoPlugin } from "@payloadcms/plugin-seo"
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
import { Pages } from "@repo/payload/collections/Pages"
import { Users } from "@repo/payload/collections/Users"
import { Homepage } from "@repo/payload/globals/Homepage"
import { buildConfig, type Field } from "payload"

const dirname = path.dirname(fileURLToPath(import.meta.url))

const VERCEL_BLOB_TOKEN_RE = /^vercel_blob_rw_[a-z\d]+_[a-z\d]+$/i

const hasVercelBlobToken = VERCEL_BLOB_TOKEN_RE.test(
  blobEnv.BLOB_READ_WRITE_TOKEN
)

const SEO_DEFAULTS = {
  title: "Professional License & CEU Renewal Tracker",
  description:
    "Liscet tracks your professional licenses and continuing-education credits across every state and license type, so you always know exactly how many CEUs stand between you and your next renewal.",
} as const satisfies Record<string, string>

const SEO_KEYWORDS = [
  "professional license tracker",
  "CEU renewal tracker",
  "continuing education credit tracker",
  "license renewal reminders",
] as const satisfies ReadonlyArray<string>

const keywordsField: Field = {
  defaultValue: [...SEO_KEYWORDS],
  hasMany: true,
  name: "keywords",
  type: "text",
}

const withSeoDefault = (field: Field): Field => {
  if (field.type === "text" && field.name === "title") {
    return { ...field, defaultValue: SEO_DEFAULTS.title }
  }

  if (field.type === "textarea" && field.name === "description") {
    return { ...field, defaultValue: SEO_DEFAULTS.description }
  }

  return field
}

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
      Pages,
      Users,
    ],
    db: postgresAdapter({
      idType: "uuid",
      migrationDir: path.resolve(dirname, "migrations"),
      pool: { connectionString: databaseEnv.DATABASE_URL },
      tablesFilter: ["!user", "!session", "!account", "!verification"],
    }),
    editor: lexicalEditor(),
    globals: [Homepage],
    plugins: [
      vercelBlobStorage({
        collections: { media: true },
        enabled: hasVercelBlobToken,
        token: blobEnv.BLOB_READ_WRITE_TOKEN,
      }),
      seoPlugin({
        collections: [Pages.slug],
        fields: ({ defaultFields }) => [
          ...defaultFields.map(withSeoDefault),
          keywordsField,
        ],
        globals: [Homepage.slug],
        tabbedUI: true,
        uploadsCollection: "media",
      }),
    ],
    secret: payloadEnv.PAYLOAD_SECRET,
    typescript: {
      outputFile: path.resolve(dirname, "types", "payload-types.ts"),
    },
    upload: {
      abortOnLimit: true,
      limits: { fileSize: 10 * 1024 * 1024 },
    },
  })
}
