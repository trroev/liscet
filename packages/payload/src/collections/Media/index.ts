import { canReadOwnMedia } from "@repo/payload/access/canReadOwnMedia"
import type { CollectionConfig } from "payload"
import { deleteMediaBlob } from "../../hooks/deleteMediaBlob"
import { virusScan } from "../../hooks/virusScan"

export const Media: CollectionConfig = {
  access: {
    read: canReadOwnMedia,
  },
  fields: [
    {
      name: "alt",
      required: true,
      type: "text",
    },
    {
      admin: {
        description:
          "Pathname of the private Vercel Blob for certificate docs; empty for adapter-managed public media.",
        hidden: true,
      },
      name: "blobPathname",
      type: "text",
    },
  ],
  hooks: {
    beforeChange: [virusScan],
    beforeDelete: [deleteMediaBlob],
  },
  labels: {
    plural: "Media & Images",
    singular: "Media/Image",
  },
  orderable: true,
  slug: "media",
  upload: {
    bulkUpload: false,
    filesRequiredOnCreate: false,
    focalPoint: true,
    mimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  },
}
