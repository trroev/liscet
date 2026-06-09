import { isAdmin } from "@repo/payload/access/isAdmin"
import { evaluateCourseCreditsOnCourseChange } from "@repo/payload/hooks/evaluateCourseCredits"
import type { CollectionConfig } from "payload"

const COURSE_FORMATS = [
  { label: "Live", value: "live" },
  { label: "Home Study", value: "home-study" },
  { label: "In Person", value: "in-person" },
] as const satisfies ReadonlyArray<{ label: string; value: string }>

const COURSE_SOURCES = [
  { label: "Manual", value: "manual" },
  { label: "Catalog", value: "catalog" },
] as const satisfies ReadonlyArray<{ label: string; value: string }>

export const Courses: CollectionConfig = {
  // Admin-or-deny; practitioner ownership is enforced in server actions.
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["title", "provider", "completedAt", "hours", "format"],
    useAsTitle: "title",
  },
  fields: [
    {
      admin: {
        description: "The practitioner who completed this course.",
      },
      name: "practitioner",
      relationTo: "users",
      required: true,
      type: "relationship",
    },
    {
      name: "title",
      required: true,
      type: "text",
    },
    {
      name: "provider",
      type: "text",
    },
    {
      name: "completedAt",
      required: true,
      type: "date",
    },
    {
      min: 0.25,
      name: "hours",
      required: true,
      type: "number",
    },
    {
      admin: {
        description:
          "Free-form subject tags. Free-text only — no clinical context.",
      },
      hasMany: true,
      name: "subjectCategories",
      type: "text",
    },
    {
      name: "format",
      options: [...COURSE_FORMATS],
      required: true,
      type: "select",
    },
    {
      admin: {
        description: "Certificate of completion document.",
      },
      name: "certificate",
      relationTo: "media",
      type: "upload",
    },
    {
      defaultValue: "manual",
      name: "source",
      options: [...COURSE_SOURCES],
      type: "select",
    },
  ],
  hooks: {
    afterChange: [evaluateCourseCreditsOnCourseChange],
  },
  indexes: [{ fields: ["practitioner", "completedAt"] }],
  labels: {
    plural: "Courses",
    singular: "Course",
  },
  slug: "courses",
}
