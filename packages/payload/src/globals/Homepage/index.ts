import { everyone } from "@repo/payload/access/everyone"
import { isAdmin } from "@repo/payload/access/isAdmin"
import { revalidatePage } from "@repo/payload/hooks/revalidatePage"
import type { GlobalConfig } from "payload"

const HERO_DEFAULTS = {
  title: "Professional License & CEU Renewal Tracker",
  subtitle:
    "Liscet tracks your professional licenses and continuing-education credits across every state and license type, so you always know exactly how many CEUs stand between you and your next renewal.",
  ctaLabel: "Start tracking free",
  ctaHref: "/sign-up",
} as const satisfies Record<string, string>

const FEATURES_HEADING_DEFAULT = "Built for renewal season"

const FEATURE_DEFAULTS = [
  {
    title: "Every license in one place",
    description:
      "Add licenses from any state and license type, each with its own renewal cycle and CEU requirements.",
  },
  {
    title: "Automatic CEU math",
    description:
      "Log a course once and Liscet credits it against the right category, counting down the hours you still owe.",
  },
  {
    title: "Renewal reminders that land early",
    description:
      "Get notified well before a deadline — never scramble to earn credits the week your license expires.",
  },
] as const satisfies ReadonlyArray<{ title: string; description: string }>

export const Homepage: GlobalConfig = {
  access: {
    read: everyone,
    update: isAdmin,
  },
  admin: {
    description: "Marketing copy for the public home page.",
  },
  fields: [
    {
      fields: [
        {
          defaultValue: HERO_DEFAULTS.title,
          name: "title",
          required: true,
          type: "text",
        },
        {
          defaultValue: HERO_DEFAULTS.subtitle,
          name: "subtitle",
          required: true,
          type: "textarea",
        },
        {
          defaultValue: HERO_DEFAULTS.ctaLabel,
          name: "ctaLabel",
          required: true,
          type: "text",
        },
        {
          admin: {
            description: "Relative path or absolute URL for the hero CTA.",
          },
          defaultValue: HERO_DEFAULTS.ctaHref,
          name: "ctaHref",
          required: true,
          type: "text",
        },
      ],
      name: "hero",
      type: "group",
    },
    {
      defaultValue: FEATURES_HEADING_DEFAULT,
      name: "featuresHeading",
      required: true,
      type: "text",
    },
    {
      defaultValue: [...FEATURE_DEFAULTS],
      fields: [
        {
          name: "title",
          required: true,
          type: "text",
        },
        {
          name: "description",
          required: true,
          type: "textarea",
        },
      ],
      labels: {
        plural: "Features",
        singular: "Feature",
      },
      minRows: 1,
      name: "features",
      type: "array",
    },
  ],
  hooks: {
    afterChange: [revalidatePage({ resolvePaths: () => ["/"] })],
  },
  label: "Homepage",
  slug: "homepage",
}
