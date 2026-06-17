import type { SeedPage, SeedPractitioner } from "@repo/db-seed/types"

const SEED_PASSWORD = "seed-password-not-for-prod-9c2f"

export const SEED_PRACTITIONERS = [
  {
    email: "seed-ca@liscet.dev",
    password: SEED_PASSWORD,
    displayName: "Riley Adams (CA seed)",
    timezone: "America/Los_Angeles",
    license: {
      state: "CA",
      licenseType: "LCSW",
      licenseNumber: "CA-LCSW-100001",
      // CA license expiring within ~67 days of 2026-06-09 — exercises the
      // renewal-90d notification window in dev.
      issuedAt: "2024-08-15",
      expiresAt: "2026-08-15",
      status: "active",
      renewalCycleMonths: 24,
      coTelehealth: {
        isRegistered: true,
        registrationNumber: "CO-TH-2024-0042",
        expiresAt: "2027-08-15",
      },
    },
    courses: [
      {
        title: "Ethics and Boundaries in Clinical Practice",
        provider: "California Society for Clinical Social Work",
        completedAt: "2025-11-12",
        hours: 6,
        subjectCategories: ["Ethics", "Professional Conduct"],
        format: "live",
      },
      {
        title: "Suicide Risk Assessment Update",
        provider: "CE Learning Systems",
        completedAt: "2026-01-22",
        hours: 6,
        subjectCategories: ["Suicide Risk", "Clinical Practice"],
        format: "home-study",
      },
      {
        title: "Cultural Humility in Telehealth",
        provider: "NASW California",
        completedAt: "2026-04-08",
        hours: 3,
        subjectCategories: ["Cultural Competency", "Telehealth"],
        format: "live",
      },
    ],
  },
  {
    email: "seed-ma@liscet.dev",
    password: SEED_PASSWORD,
    displayName: "Jordan Chen (MA seed)",
    timezone: "America/New_York",
    license: {
      state: "MA",
      licenseType: "LICSW",
      licenseNumber: "MA-LICSW-200002",
      issuedAt: "2025-03-01",
      expiresAt: "2027-03-01",
      status: "active",
      renewalCycleMonths: 24,
    },
    courses: [
      {
        title: "Domestic Violence: Identification and Intervention",
        provider: "NASW Massachusetts",
        completedAt: "2025-09-30",
        hours: 4,
        subjectCategories: ["Domestic Violence", "Clinical Practice"],
        format: "live",
      },
      {
        title: "Electronic Records and HIPAA",
        provider: "Massachusetts CE Council",
        completedAt: "2025-12-04",
        hours: 3,
        subjectCategories: ["Ethics", "Technology"],
        format: "home-study",
      },
      {
        title: "Trauma-Informed Care Foundations",
        provider: "Boston Trauma Institute",
        completedAt: "2026-03-15",
        hours: 6,
        subjectCategories: ["Trauma", "Clinical Practice"],
        format: "in-person",
      },
    ],
  },
  {
    email: "seed-mi@liscet.dev",
    password: SEED_PASSWORD,
    displayName: "Sam Patel (MI seed)",
    timezone: "America/Detroit",
    license: {
      state: "MI",
      licenseType: "LMSW-C",
      licenseNumber: "MI-LMSWC-300003",
      issuedAt: "2025-06-01",
      expiresAt: "2028-06-01",
      status: "active",
      renewalCycleMonths: 36,
    },
    courses: [
      {
        title: "Pain Management and Opioid Awareness",
        provider: "Michigan Health Council",
        completedAt: "2025-10-10",
        hours: 2,
        subjectCategories: ["Substance Use", "Clinical Practice"],
        format: "home-study",
      },
      {
        title: "Implicit Bias in Clinical Decision Making",
        provider: "Michigan NASW",
        completedAt: "2026-02-18",
        hours: 2,
        subjectCategories: ["Implicit Bias", "Cultural Competency"],
        format: "live",
      },
      {
        title: "Human Trafficking Recognition",
        provider: "Michigan CE Bureau",
        completedAt: "2026-05-02",
        hours: 1,
        subjectCategories: ["Human Trafficking", "Ethics"],
        format: "live",
      },
    ],
  },
  {
    email: "seed-ct@liscet.dev",
    password: SEED_PASSWORD,
    displayName: "Avery Kim (CT seed)",
    timezone: "America/New_York",
    license: {
      state: "CT",
      licenseType: "LICSW",
      licenseNumber: "CT-LICSW-400004",
      issuedAt: "2025-09-01",
      expiresAt: "2027-09-01",
      status: "active",
      renewalCycleMonths: 24,
    },
    courses: [
      {
        title: "Cultural Competency Across the Lifespan",
        provider: "Connecticut NASW",
        completedAt: "2025-11-04",
        hours: 3,
        subjectCategories: ["Cultural Competency"],
        format: "home-study",
      },
      {
        title: "Mental Health First Aid",
        provider: "CT Behavioral Health Partnership",
        completedAt: "2026-01-19",
        hours: 8,
        subjectCategories: ["Crisis Intervention", "Clinical Practice"],
        format: "in-person",
      },
      {
        title: "Veterans and Military Families",
        provider: "CT Veterans Affairs CE",
        completedAt: "2026-04-22",
        hours: 3,
        subjectCategories: ["Veterans", "Clinical Practice"],
        format: "live",
      },
    ],
  },
] as const satisfies ReadonlyArray<SeedPractitioner>

const CONTACT_EMAIL = "hello@liscet.com"

type LexicalNode = {
  type: string
  version: number
  [key: string]: unknown
}

const textNode = (text: string): LexicalNode => ({
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text,
  type: "text",
  version: 1,
})

const linkNode = ({
  url,
  text,
}: {
  url: string
  text: string
}): LexicalNode => ({
  children: [textNode(text)],
  direction: "ltr",
  fields: { linkType: "custom", newTab: false, url },
  format: "",
  indent: 0,
  type: "link",
  version: 3,
})

const paragraphNode = (children: ReadonlyArray<LexicalNode>): LexicalNode => ({
  children: [...children],
  direction: "ltr",
  format: "",
  indent: 0,
  textFormat: 0,
  type: "paragraph",
  version: 1,
})

const headingNode = ({
  tag,
  text,
}: {
  tag: string
  text: string
}): LexicalNode => ({
  children: [textNode(text)],
  direction: "ltr",
  format: "",
  indent: 0,
  tag,
  type: "heading",
  version: 1,
})

const richTextBody = (
  children: ReadonlyArray<LexicalNode>
): SeedPage["body"] => ({
  root: {
    children: [...children],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
})

export const SEED_PAGES: ReadonlyArray<SeedPage> = [
  {
    slug: "about",
    title: "About Liscet",
    body: richTextBody([
      paragraphNode([
        textNode(
          "Renewing a professional license should be the easy part of your career. Liscet keeps every license, renewal date, and continuing-education requirement in one place, so you always know exactly where you stand."
        ),
      ]),
      paragraphNode([
        textNode(
          "We built Liscet for practitioners who juggle credentials across states and license types — and who would rather spend their time on their work than on spreadsheets."
        ),
      ]),
    ]),
    meta: {
      title: "About",
      description:
        "Liscet is a license and continuing-education tracker built to take the guesswork out of staying renewed.",
    },
  },
  {
    slug: "pricing",
    title: "Pricing",
    body: richTextBody([
      headingNode({ tag: "h2", text: "Liscet is free in v1." }),
      paragraphNode([
        textNode(
          "Every feature is available at no cost while we are in version 1. Track as many licenses and continuing-education credits as you need — there is nothing to pay and no card to enter."
        ),
      ]),
    ]),
    meta: {
      title: "Pricing",
      description:
        "Liscet is completely free while in version 1 — track your licenses and continuing-education credits at no cost.",
    },
  },
  {
    slug: "contact",
    title: "Contact",
    body: richTextBody([
      paragraphNode([
        textNode(
          "Questions, feedback, or trouble with your account? Email us and we will get back to you."
        ),
      ]),
      paragraphNode([
        linkNode({ url: `mailto:${CONTACT_EMAIL}`, text: CONTACT_EMAIL }),
      ]),
    ]),
    meta: {
      title: "Contact",
      description: `Get in touch with the Liscet team at ${CONTACT_EMAIL}.`,
    },
  },
]
