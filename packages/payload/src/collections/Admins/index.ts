import type { CollectionConfig } from "payload"

export const Admins: CollectionConfig = {
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [],
  slug: "admins",
}
