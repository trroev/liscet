import { findOrCreate } from "@repo/db-seed/findOrCreate"
import { SEED_PRACTITIONERS } from "@repo/db-seed/fixtures"
import type {
  SeedAuth,
  SeedCourse,
  SeedLicense,
  SeedPractitioner,
  SeedSummary,
} from "@repo/db-seed/types"
import { createLogger } from "@repo/logger"
import type { Payload } from "payload"

const log = createLogger({ name: "db-seed" })

type SeedArgs = {
  readonly payload: Payload
  readonly auth: SeedAuth
}

function assertNotProduction(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "db-seed must not run in production — refusing to execute against a production database."
    )
  }
}

type EnsurePractitionerResult = {
  readonly userId: string
  readonly created: boolean
}

async function ensurePractitioner({
  payload,
  auth,
  practitioner,
}: {
  readonly payload: Payload
  readonly auth: SeedAuth
  readonly practitioner: SeedPractitioner
}): Promise<EnsurePractitionerResult> {
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: practitioner.email } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })
  const [found] = existing.docs
  if (found !== undefined) {
    return { userId: String(found.id), created: false }
  }

  // signUpEmail fires the BetterAuth `databaseHooks.user.create.after` hook,
  // which mirrors the identity into the Payload `users` collection. The hook
  // is awaited, so by the time signUpEmail resolves the Payload user exists.
  await auth.api.signUpEmail({
    body: {
      email: practitioner.email,
      password: practitioner.password,
      name: practitioner.displayName,
    },
  })

  const synced = await payload.find({
    collection: "users",
    where: { email: { equals: practitioner.email } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })
  const [user] = synced.docs
  if (user === undefined) {
    throw new Error(
      `BetterAuth sign-up for ${practitioner.email} did not mirror to Payload users — check the auth.server databaseHooks.`
    )
  }

  // The auth hook does not carry timezone — set it directly on the Payload doc.
  await payload.update({
    collection: "users",
    id: user.id,
    data: { timezone: practitioner.timezone },
    overrideAccess: true,
  })

  return { userId: String(user.id), created: true }
}

async function ensureLicense({
  payload,
  userId,
  license,
}: {
  readonly payload: Payload
  readonly userId: string
  readonly license: SeedLicense
}): Promise<{ readonly created: boolean }> {
  const result = await findOrCreate({
    payload,
    collection: "licenses",
    where: {
      and: [
        { practitioner: { equals: userId } },
        { licenseNumber: { equals: license.licenseNumber } },
      ],
    },
    data: {
      practitioner: userId,
      state: license.state,
      licenseType: license.licenseType,
      licenseNumber: license.licenseNumber,
      status: license.status,
      issuedAt: license.issuedAt,
      expiresAt: license.expiresAt,
      renewalCycleMonths: license.renewalCycleMonths,
      ...(license.coTelehealth === undefined
        ? {}
        : {
            coTelehealthRegistration: {
              isRegistered: license.coTelehealth.isRegistered,
              registrationNumber: license.coTelehealth.registrationNumber,
              expiresAt: license.coTelehealth.expiresAt,
            },
          }),
    },
  })
  return { created: result.created }
}

async function ensureCourse({
  payload,
  userId,
  course,
}: {
  readonly payload: Payload
  readonly userId: string
  readonly course: SeedCourse
}): Promise<{ readonly created: boolean }> {
  const result = await findOrCreate({
    payload,
    collection: "courses",
    where: {
      and: [
        { practitioner: { equals: userId } },
        { title: { equals: course.title } },
        { completedAt: { equals: course.completedAt } },
      ],
    },
    data: {
      practitioner: userId,
      title: course.title,
      provider: course.provider,
      completedAt: course.completedAt,
      hours: course.hours,
      subjectCategories: [...course.subjectCategories],
      format: course.format,
      source: "manual",
    },
  })
  return { created: result.created }
}

export async function seed({ payload, auth }: SeedArgs): Promise<SeedSummary> {
  assertNotProduction()

  const summary = {
    practitionersCreated: 0,
    practitionersSkipped: 0,
    licensesCreated: 0,
    licensesSkipped: 0,
    coursesCreated: 0,
    coursesSkipped: 0,
  }

  for (const practitioner of SEED_PRACTITIONERS) {
    const { userId, created } = await ensurePractitioner({
      payload,
      auth,
      practitioner,
    })
    if (created) {
      summary.practitionersCreated += 1
    } else {
      summary.practitionersSkipped += 1
    }

    const licenseResult = await ensureLicense({
      payload,
      userId,
      license: practitioner.license,
    })
    if (licenseResult.created) {
      summary.licensesCreated += 1
    } else {
      summary.licensesSkipped += 1
    }

    for (const course of practitioner.courses) {
      const courseResult = await ensureCourse({ payload, userId, course })
      if (courseResult.created) {
        summary.coursesCreated += 1
      } else {
        summary.coursesSkipped += 1
      }
    }

    log
      .withMetadata({ email: practitioner.email, userId, created })
      .info("seeded practitioner")
  }

  return summary
}
