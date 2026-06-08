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
      name: "evaluatedAt",
      required: true,
      type: "date",
    },
    {
      admin: {
        description:
          "Semver of the RuleSetVersions document used for this evaluation.",
      },
      name: "ruleSetVersion",
      required: true,
      type: "text",
    },
  ],
  indexes: [{ fields: ["course", "license"], unique: true }],
  labels: {
    plural: "Course Credits",
    singular: "Course Credit",
  },
  slug: "course-credits",
}
