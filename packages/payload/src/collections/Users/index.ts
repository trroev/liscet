import { isAdmin } from "@repo/payload/access/isAdmin"
import { isReservedSlug } from "@repo/payload/fields/reservedSlugs"
import { cascadeDeleteUser } from "@repo/payload/hooks/cascadeDeleteUser"
import type {
  CollectionConfig,
  FieldAccess,
  TextFieldSingleValidation,
} from "payload"

const isAdminField: FieldAccess = ({ req: { user } }) => Boolean(user)

const SLUG_FORMAT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SLUG_MIN_LENGTH = 2
const SLUG_MAX_LENGTH = 40

const validateUserSlug: TextFieldSingleValidation = (value): string | true => {
  if (value === undefined || value === null || value === "") {
    return true
  }
  if (typeof value !== "string") {
    return "Slug must be a string."
  }
  if (value.length < SLUG_MIN_LENGTH || value.length > SLUG_MAX_LENGTH) {
    return `Slug must be ${SLUG_MIN_LENGTH}-${SLUG_MAX_LENGTH} characters.`
  }
  if (!SLUG_FORMAT_RE.test(value)) {
    return "Slug must be lowercase letters, numbers, and single hyphens only."
  }
  if (isReservedSlug(value)) {
    return "That slug is reserved. Please choose another."
  }
  return true
}

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
  ],
  hooks: {
    beforeDelete: [cascadeDeleteUser],
  },
  slug: "users",
}
