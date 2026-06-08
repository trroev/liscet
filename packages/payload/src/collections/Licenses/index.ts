import { isAdmin } from "@repo/payload/access/isAdmin"
import type { CollectionConfig } from "payload"

const LICENSE_STATES = [
  { label: "California", value: "CA" },
  { label: "Massachusetts", value: "MA" },
  { label: "Michigan", value: "MI" },
  { label: "Connecticut", value: "CT" },
  { label: "Colorado", value: "CO" },
] as const satisfies ReadonlyArray<{ label: string; value: string }>

export const Licenses: CollectionConfig = {
  // Admin-or-deny; practitioner ownership is enforced in server actions.
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["licenseNumber", "state", "licenseType", "expiresAt"],
    useAsTitle: "licenseNumber",
  },
  fields: [
    {
      admin: {
        description: "The practitioner who holds this license.",
      },
      name: "practitioner",
      relationTo: "users",
      required: true,
      type: "relationship",
    },
    {
      name: "state",
      options: [...LICENSE_STATES],
      required: true,
      type: "select",
    },
    {
      name: "licenseType",
      required: true,
      type: "text",
    },
    {
      name: "licenseNumber",
      required: true,
      type: "text",
    },
    {
      name: "issuedAt",
      required: true,
      type: "date",
    },
    {
      name: "expiresAt",
      required: true,
      type: "date",
    },
    {
      admin: {
        description: "Months between renewals. Defaults to 24.",
      },
      defaultValue: 24,
      name: "renewalCycleMonths",
      type: "number",
    },
  ],
  indexes: [{ fields: ["practitioner", "state", "licenseType"] }],
  labels: {
    plural: "Licenses",
    singular: "License",
  },
  slug: "licenses",
}
