import path from "node:path"
import { fileURLToPath } from "node:url"
import { mongooseAdapter } from "@payloadcms/db-mongodb"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage"
import { seoPlugin } from "@payloadcms/plugin-seo"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { env as cloudinaryEnv } from "@repo/env/cloudinary"
import { DB_DRIVERS, resolveDatabase } from "@repo/env/database"
import { env as payloadEnv } from "@repo/env/payload"
import { cloudinaryAdapter } from "@repo/payload/adapters/cloudinary"
import { Admins } from "@repo/payload/collections/Admins"
import { Media } from "@repo/payload/collections/Media"
import { Posts } from "@repo/payload/collections/Posts"
import { Users } from "@repo/payload/collections/Users"
import type { Post } from "@repo/payload/payload-types"
import { buildConfig } from "payload"
import { match } from "ts-pattern"

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
    collections: [Admins, Media, Posts, Users],
    db: match(resolveDatabase())
      .with({ driver: DB_DRIVERS.postgres }, ({ url }) =>
        // `idType: "uuid"` keeps document IDs string-typed, matching the
        // MongoDB backend so `payload-types.ts` is identical (and CI's
        // stale-type check stable) regardless of the selected database.
        // Migrations are colocated with the collections that define the schema;
        // `push` stays on its dev default (auto-sync in dev, off in prod).
        postgresAdapter({
          idType: "uuid",
          migrationDir: path.resolve(dirname, "migrations"),
          pool: { connectionString: url },
        })
      )
      .with({ driver: DB_DRIVERS.mongodb }, ({ url }) =>
        mongooseAdapter({ url })
      )
      .exhaustive(),
    editor: lexicalEditor(),
    plugins: [
      ...(cloudinaryConfig
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
        : []),
      seoPlugin({
        collections: ["posts"],
        generateDescription: ({ doc }) =>
          (doc as Post).description?.slice(0, 160) ?? "",
        generateImage: ({ doc }) => {
          const coverImage = (doc as Post).coverImage
          return typeof coverImage === "object" && coverImage !== null
            ? coverImage.id
            : (coverImage ?? "")
        },
        generateTitle: ({ doc }) => (doc as Post).title,
        tabbedUI: true,
        uploadsCollection: "media",
      }),
    ],
    secret: payloadEnv.PAYLOAD_SECRET,
    typescript: {
      outputFile: path.resolve(dirname, "types", "payload-types.ts"),
    },
  })
}
