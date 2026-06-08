import { isAdmin } from "@repo/payload/access/isAdmin"
import { cascadeDeleteUser } from "@repo/payload/hooks/cascadeDeleteUser"
import type { CollectionConfig, FieldAccess } from "payload"

const isAdminField: FieldAccess = ({ req: { user } }) => Boolean(user)

export const Users: CollectionConfig = {
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    useAsTitle: "email",
  },
  auth: false,
  fields: [
    {
      index: true,
      name: "email",
      required: true,
      type: "email",
      unique: true,
    },
    {
      admin: {
        description: "BetterAuth user ID. Set automatically on sign-up.",
        readOnly: true,
      },
      index: true,
      name: "betterAuthId",
      type: "text",
      unique: true,
    },
    {
      name: "displayName",
      type: "text",
    },
    {
      admin: {
        description:
          "IANA timezone string (e.g. America/New_York) for display.",
      },
      name: "timezone",
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
  hooks: {
    beforeDelete: [cascadeDeleteUser],
  },
  slug: "users",
}
