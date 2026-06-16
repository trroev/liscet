import { denyAll } from "@repo/payload/access/denyAll"
import { isAdmin } from "@repo/payload/access/isAdmin"
import type { CollectionConfig } from "payload"

const NOTIFICATION_TYPES = [
  { label: "Renewal — 90 days", value: "renewal-90d" },
  { label: "Renewal — 60 days", value: "renewal-60d" },
  { label: "Renewal — 30 days", value: "renewal-30d" },
  { label: "Renewal — 7 days", value: "renewal-7d" },
  { label: "Renewal — 1 day", value: "renewal-1d" },
  { label: "Category shortfall", value: "category-shortfall" },
  { label: "CO telehealth — 90 days", value: "co-telehealth-90d" },
  { label: "CO telehealth — 60 days", value: "co-telehealth-60d" },
  { label: "CO telehealth — 30 days", value: "co-telehealth-30d" },
  { label: "CO telehealth — 7 days", value: "co-telehealth-7d" },
  { label: "CO telehealth — 1 day", value: "co-telehealth-1d" },
] as const satisfies ReadonlyArray<{ label: string; value: string }>

export const NotificationLog: CollectionConfig = {
  // Idempotency record written only by the daily cron via the Local API with
  // overrideAccess; rows are never mutated. Admins read it for auditing.
  access: {
    create: denyAll,
    delete: denyAll,
    read: isAdmin,
    update: denyAll,
  },
  admin: {
    defaultColumns: [
      "practitioner",
      "license",
      "notificationType",
      "sentForDate",
      "sentAt",
    ],
  },
  fields: [
    {
      name: "practitioner",
      relationTo: "users",
      required: true,
      type: "relationship",
    },
    {
      name: "license",
      relationTo: "licenses",
      required: true,
      type: "relationship",
    },
    {
      name: "notificationType",
      options: [...NOTIFICATION_TYPES],
      required: true,
      type: "select",
    },
    {
      name: "sentAt",
      required: true,
      type: "date",
    },
    {
      admin: {
        description: "The calendar date the cron ran.",
      },
      name: "sentForDate",
      required: true,
      type: "date",
    },
  ],
  indexes: [
    {
      fields: ["practitioner", "license", "notificationType", "sentForDate"],
      unique: true,
    },
  ],
  labels: {
    plural: "Notification Logs",
    singular: "Notification Log",
  },
  slug: "notification-log",
}
