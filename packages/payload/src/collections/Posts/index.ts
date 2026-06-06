import { env as appEnv } from "@repo/env/app"
import { everyone } from "@repo/payload/access/everyone"
import { isAdmin } from "@repo/payload/access/isAdmin"
import { richTextField } from "@repo/payload/fields/richTextField"
import { revalidatePost } from "@repo/payload/hooks/revalidatePost"
import { stampPublishedAt } from "@repo/payload/hooks/stampPublishedAt"
import { type CollectionConfig, slugField } from "payload"

const LIVE_PREVIEW_BREAKPOINTS = [
  { name: "mobile", label: "Mobile", width: 375, height: 667 },
  { name: "tablet", label: "Tablet", width: 768, height: 1024 },
  { name: "desktop", label: "Desktop", width: 1440, height: 900 },
] as const satisfies ReadonlyArray<{
  name: string
  label: string
  width: number
  height: number
}>

export const Posts: CollectionConfig = {
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: everyone,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["title", "_status", "publishedAt"],
    livePreview: {
      breakpoints: [...LIVE_PREVIEW_BREAKPOINTS],
      url: ({ data }) => {
        const slug = typeof data?.slug === "string" ? data.slug : ""
        return `${appEnv.BASE_URL}/posts/${slug}?preview=draft`
      },
    },
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      required: true,
      type: "text",
    },
    slugField(),
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "coverImage",
      relationTo: "media",
      type: "upload",
    },
    {
      admin: {
        description:
          "Author display name. Used in JSON-LD structured data. Prefer linking via `authorUser` for registered users.",
      },
      name: "author",
      type: "text",
    },
    {
      admin: {
        description: "Link to the registered user who authored this post.",
      },
      name: "authorUser",
      relationTo: "users",
      type: "relationship",
    },
    {
      admin: {
        description:
          "Group post content into logical sections. Drag to reorder.",
        initCollapsed: false,
      },
      fields: [
        {
          name: "heading",
          type: "text",
        },
        richTextField({ name: "body", required: true }),
      ],
      name: "sections",
      type: "array",
    },
    {
      admin: {
        date: { pickerAppearance: "dayAndTime" },
        description: "Set automatically the first time the post is published.",
        position: "sidebar",
        readOnly: true,
      },
      name: "publishedAt",
      type: "date",
    },
  ],
  hooks: {
    afterChange: [revalidatePost],
    beforeChange: [stampPublishedAt],
  },
  labels: {
    plural: "Posts",
    singular: "Post",
  },
  slug: "posts",
  versions: {
    drafts: true,
  },
}
