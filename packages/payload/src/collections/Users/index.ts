import type { CollectionConfig, FieldAccess } from "payload"

const isAdminField: FieldAccess = ({ req: { user } }) => Boolean(user)

export const Users: CollectionConfig = {
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "email",
      required: true,
      type: "email",
      unique: true,
    },
    {
      name: "name",
      type: "text",
    },
    {
      admin: {
        description: "BetterAuth user ID. Set automatically on sign-up.",
        readOnly: true,
      },
      index: true,
      name: "betterAuthId",
      type: "text",
    },
    {
      access: {
        create: isAdminField,
        update: isAdminField,
      },
      admin: {
        description:
          "Avatar image. Written by the uploadAvatar server action (overrides access) or by admins.",
      },
      filterOptions: {
        mimeType: { in: ["image/jpeg", "image/png", "image/webp"] },
      },
      name: "avatar",
      relationTo: "media",
      type: "upload",
    },
  ],
  slug: "users",
}
