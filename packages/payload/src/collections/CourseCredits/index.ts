import { denyAll } from "@repo/payload/access/denyAll"
import { isAdmin } from "@repo/payload/access/isAdmin"
import type { CollectionConfig } from "payload"

export const CourseCredits: CollectionConfig = {
  // Write-protected: the rules engine writes via the Local API with
  // overrideAccess; practitioner-scoped reads are enforced in server actions.
  access: {
    create: denyAll,
    delete: denyAll,
    read: isAdmin,
    update: denyAll,
  },
  admin: {
    defaultColumns: ["course", "license", "creditedHours", "evaluatedAt"],
    hidden: true,
  },
  fields: [
    {
      admin: {
        description: "The course that produced this credit.",
      },
      name: "course",
      relationTo: "courses",
      required: true,
      type: "relationship",
    },
    {
      admin: {
        description: "The license the course was credited against.",
      },
      name: "license",
      relationTo: "licenses",
      required: true,
      type: "relationship",
    },
    {
      name: "creditedHours",
      required: true,
      type: "number",
    },
    {
      admin: {
        description: "Subject categories the rules engine credited.",
      },
      hasMany: true,
      name: "creditedCategories",
      type: "text",
    },
    {
      admin: {
        description:
          "Course completion date, denormalized from the course — buckets the credit into a recurrence window when summarized.",
      },
      name: "completedAt",
      required: true,
      type: "date",
    },
    {
      admin: {
        description:
          "Delivery format, denormalized from the course for aggregate format-constraint checks.",
      },
      name: "format",
      required: true,
      type: "text",
    },
    {
      admin: {
        description:
          "Approving body for aggregate provider-cap checks; null when the provider is unrecognized.",
      },
      name: "approvingBody",
      type: "text",
    },
    {
      name: "evaluatedAt",
      required: true,
      type: "date",
    },
    {
      admin: {
        description:
          "Rule set applied, keyed as state-licenseType (e.g. CA-LCSW).",
      },
      name: "ruleSetKey",
      required: true,
      type: "text",
    },
    {
      admin: {
        description:
          "Version of the rule set config used for this evaluation. Code is the source of truth; this is a denormalized snapshot for reproducibility.",
      },
      name: "ruleSetVersion",
      required: true,
      type: "number",
    },
  ],
  indexes: [{ fields: ["course", "license"], unique: true }],
  labels: {
    plural: "Course Credits",
    singular: "Course Credit",
  },
  slug: "course-credits",
}
