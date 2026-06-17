import { isAdmin } from "@repo/payload/access/isAdmin"
import {
  createSlugValidator,
  isReservedUserSlug,
} from "@repo/payload/fields/reservedSlugs"
import { cascadeDeleteUser } from "@repo/payload/hooks/cascadeDeleteUser"
import type { CollectionConfig, FieldAccess } from "payload"

const isAdminField: FieldAccess = ({ req: { user } }) => Boolean(user)

const validateUserSlug = createSlugValidator({ isReserved: isReservedUserSlug })

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
          "URL slug — the first path segment of every authed screen (e.g. /{slug}). Set during onboarding and immutable thereafter; must be lowercase kebab-case and not reserved.",
      },
      index: true,
      name: "slug",
      type: "text",
      unique: true,
      validate: validateUserSlug,
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
    {
      admin: {
        description:
          "Soft-delete marker set when the practitioner requests account deletion. Hard delete happens 30 days later via cron (#36); cleared if the practitioner cancels.",
        readOnly: true,
      },
      index: true,
      name: "deletedAt",
      type: "date",
    },
  ],
  hooks: {
    beforeDelete: [cascadeDeleteUser],
  },
  slug: "users",
}
