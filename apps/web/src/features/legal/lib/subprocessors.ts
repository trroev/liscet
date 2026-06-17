export type Subprocessor = {
  name: string
  purpose: string
  location: string
}

export const SUBPROCESSORS = [
  {
    name: "Vercel",
    purpose: "Application hosting and content delivery",
    location: "United States",
  },
  {
    name: "Neon",
    purpose: "Managed Postgres database",
    location: "United States",
  },
  {
    name: "Resend",
    purpose: "Transactional email delivery",
    location: "United States",
  },
  {
    name: "Sentry",
    purpose: "Error monitoring and performance tracing",
    location: "United States",
  },
  {
    name: "PostHog",
    purpose: "Product analytics",
    location: "United States",
  },
  {
    name: "Axiom",
    purpose: "Log management and observability",
    location: "United States",
  },
] as const satisfies ReadonlyArray<Subprocessor>

export const SUBPROCESSORS_LAST_UPDATED = "June 17, 2026"
