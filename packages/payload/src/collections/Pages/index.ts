import { isAdmin } from "@repo/payload/access/isAdmin"
import { readPublishedOrAdmin } from "@repo/payload/access/readPublishedOrAdmin"
import {
  createSlugValidator,
  isReservedSlug,
} from "@repo/payload/fields/reservedSlugs"
import { richTextField } from "@repo/payload/fields/richTextField"
import { revalidatePage } from "@repo/payload/hooks/revalidatePage"
import { stampPublishedAt } from "@repo/payload/hooks/stampPublishedAt"
import { type CollectionConfig, slugField } from "payload"

const validatePageSlug = createSlugValidator({ isReserved: isReservedSlug })

export const Pages: CollectionConfig = {
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: readPublishedOrAdmin,
    update: isAdmin,
  },
  admin: {
    description:
      "CMS-editable marketing pages served from fixed literal routes (e.g. /about). The slug must match the route segment.",
    useAsTitle: "title",
  },
  fields: [
    {
      tabs: [
        {
          fields: [
            {
              name: "title",
              required: true,
              type: "text",
            },
            richTextField({ name: "body", required: true }),
          ],
          label: "Content",
        },
      ],
      type: "tabs",
    },
    slugField({
      useAsSlug: "title",
      overrides: (field) => {
        const slugInput = field.fields.find(
          (inner) => inner.type === "text" && inner.name === "slug"
        )
        if (slugInput?.type === "text") {
          slugInput.validate = validatePageSlug
        }
        return field
      },
    }),
    {
      admin: {
        description: "Set automatically the first time the page is published.",
        position: "sidebar",
        readOnly: true,
      },
      name: "publishedAt",
      type: "date",
    },
  ],
  hooks: {
    afterChange: [
      revalidatePage<{ slug: string }>({
        resolvePaths: (doc) => [`/${doc.slug}`, "/sitemap.xml"],
      }),
    ],
    beforeChange: [stampPublishedAt],
  },
  slug: "pages",
  versions: {
    drafts: true,
  },
}
