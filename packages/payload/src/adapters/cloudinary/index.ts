import type {
  Adapter,
  GeneratedAdapter,
} from "@payloadcms/plugin-cloud-storage/types"
import { v2 as cloudinary } from "cloudinary"

type CloudinaryAdapterOptions = {
  readonly config: {
    readonly cloud_name: string
    readonly api_key: string
    readonly api_secret: string
  }
  readonly folder?: string
}

const EXTENSION_RE = /\.[^/.]+$/

const stripExtension = (filename: string): string =>
  filename.replace(EXTENSION_RE, "")

const buildPublicId = (
  filename: string,
  folder: string | undefined,
  prefix: string | undefined
): string =>
  [folder, prefix, stripExtension(filename)].filter(Boolean).join("/")

export function cloudinaryAdapter({
  config,
  folder,
}: CloudinaryAdapterOptions): Adapter {
  cloudinary.config(config)

  return ({ prefix: collectionPrefix }): GeneratedAdapter => ({
    name: "cloudinary",

    generateURL: ({ filename, prefix }) =>
      cloudinary.url(
        buildPublicId(filename, folder, prefix ?? collectionPrefix),
        {
          secure: true,
        }
      ),

    handleUpload: async ({ data, file }) => {
      const publicId = buildPublicId(file.filename, folder, collectionPrefix)
      await new Promise<void>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { public_id: publicId, overwrite: true, resource_type: "image" },
          (error) => {
            if (error) {
              reject(new Error(error.message))
            } else {
              resolve()
            }
          }
        )
        stream.end(file.buffer)
      })
      return data
    },

    handleDelete: async ({ doc: { prefix: docPrefix }, filename }) => {
      await cloudinary.uploader.destroy(
        buildPublicId(filename, folder, docPrefix)
      )
    },

    staticHandler: (_req, { params: { filename, prefix } }) => {
      const url = cloudinary.url(
        buildPublicId(filename, folder, prefix ?? collectionPrefix),
        {
          secure: true,
        }
      )
      return Response.redirect(url, 302)
    },
  })
}
