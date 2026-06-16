import type { CollectionConfig } from "payload"
import { virusScan } from "../../hooks/virusScan"

export const Media: CollectionConfig = {
  access: {},
  fields: [
    {
      name: "alt",
      required: true,
      type: "text",
    },
  ],
  hooks: {
    beforeChange: [virusScan],
  },
  labels: {
    plural: "Media & Images",
    singular: "Media/Image",
  },
  orderable: true,
  slug: "media",
  upload: {
    bulkUpload: false,
    focalPoint: true,
  },
}
