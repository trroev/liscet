import type { CollectionConfig } from "payload"

export const Media: CollectionConfig = {
  access: {},
  fields: [
    {
      name: "alt",
      required: true,
      type: "text",
    },
  ],
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
