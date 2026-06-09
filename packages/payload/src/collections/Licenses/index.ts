import { isAdmin } from "@repo/payload/access/isAdmin"
import { LICENSE_STATES } from "@repo/payload/fields/licenseStates"
import { evaluateCourseCreditsOnLicenseChange } from "@repo/payload/hooks/evaluateCourseCredits"
import type { CollectionConfig } from "payload"
import { validateCoTelehealthRegistration } from "./validate-co-telehealth-registration"

const LICENSE_STATUSES = [
  { label: "Active", value: "active" },
  { label: "Lapsed", value: "lapsed" },
  { label: "Suspended", value: "suspended" },
  { label: "Revoked", value: "revoked" },
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
      admin: {
        description:
          "Only `active` licenses accrue course credit. Lapsed/suspended/revoked licenses are excluded from evaluation.",
      },
      defaultValue: "active",
      name: "status",
      options: [...LICENSE_STATUSES],
      required: true,
      type: "select",
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
    {
      admin: {
        // Telehealth-into-CO is an attribute of a non-CO (home-state) license;
        // hide it entirely on CO licenses, where it is contradictory.
        condition: (data) => data?.state !== "CO",
        description:
          "Out-of-state telehealth registration into Colorado (C.R.S. § 12-30-124). Creates no CO CE requirement — courses still evaluate under the home-state rule set.",
      },
      fields: [
        {
          admin: {
            description: "Registered for telehealth into Colorado.",
          },
          defaultValue: false,
          name: "isRegistered",
          type: "checkbox",
          validate: validateCoTelehealthRegistration,
        },
        {
          admin: {
            condition: (_data, siblingData) =>
              siblingData?.isRegistered === true,
          },
          name: "registrationNumber",
          type: "text",
        },
        {
          admin: {
            condition: (_data, siblingData) =>
              siblingData?.isRegistered === true,
            description:
              "CO telehealth registration expiry (stored for the practitioner's reference and renewal reminders).",
          },
          name: "expiresAt",
          type: "date",
        },
      ],
      name: "coTelehealthRegistration",
      type: "group",
    },
  ],
  hooks: {
    afterChange: [evaluateCourseCreditsOnLicenseChange],
  },
  indexes: [{ fields: ["practitioner", "state", "licenseType"] }],
  labels: {
    plural: "Licenses",
    singular: "License",
  },
  slug: "licenses",
}
