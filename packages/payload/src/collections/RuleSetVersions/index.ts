import { denyAll } from "@repo/payload/access/denyAll"
import { isAdmin } from "@repo/payload/access/isAdmin"
import { LICENSE_STATES } from "@repo/payload/fields/licenseStates"
import type { CollectionConfig } from "payload"

export const RuleSetVersions: CollectionConfig = {
  // Append-only: admins publish new versions; existing rows are never mutated
  // or removed so historical evaluations stay reproducible.
  access: {
    create: isAdmin,
    delete: denyAll,
    read: isAdmin,
    update: denyAll,
  },
  admin: {
    defaultColumns: ["state", "licenseType", "version", "publishedAt"],
    useAsTitle: "version",
  },
  fields: [
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
        description: "Semver string identifying this rule set version.",
      },
      name: "version",
      required: true,
      type: "text",
    },
    {
      name: "publishedAt",
      required: true,
      type: "date",
    },
    {
      admin: {
        description: "Snapshot of the rule config at publish time.",
      },
      name: "ruleSetJson",
      required: true,
      type: "json",
    },
  ],
  indexes: [{ fields: ["state", "licenseType", "version"], unique: true }],
  labels: {
    plural: "Rule Set Versions",
    singular: "Rule Set Version",
  },
  slug: "rule-set-versions",
}
