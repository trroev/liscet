import "server-only"

import { sendEmail } from "@repo/emails/send"
import {
  CategoryShortfallEmail,
  categoryShortfallSubject,
} from "@repo/emails/templates/CategoryShortfall"
import {
  RenewalReminder,
  renewalSubject,
} from "@repo/emails/templates/RenewalReminder"
import { createLogger } from "@repo/logger"
import { summarizeLicenseFromRows } from "@repo/payload/evaluation"
import type { License, User } from "@repo/payload/payload-types"
import { practitionerData } from "@repo/payload/queries/practitioner-data"
import { daysUntilExpiry } from "@repo/utils/daysUntilExpiry"
import {
  activeRenewalThreshold,
  renewalNotificationType,
} from "@repo/utils/renewalThreshold"
import { stateToTimezone } from "@repo/utils/stateToTimezone"
import { captureException } from "@sentry/nextjs"
import type { Payload } from "payload"

const SHORTFALL_WINDOW_DAYS = 60 as const

const PAGE_SIZE = 100 as const

type DispatchSummary = {
  readonly failed: number
  readonly scanned: number
  readonly sent: number
  readonly skipped: number
}

type DispatchInput = {
  readonly now: Date
  readonly payload: Payload
}

type ProcessInput = {
  readonly license: License
  readonly now: Date
  readonly payload: Payload
}

const log = createLogger({ name: "cron.notifications" })

const calendarDateInTimezone = (now: Date, timezone: string): string =>
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).format(now)

// The cron loads licenses at depth 1, so an undeleted practitioner is an
// embedded `User`; a string id means the relationship failed to populate.
const resolvePractitioner = (license: License): User | null =>
  typeof license.practitioner === "string" || license.practitioner.deletedAt
    ? null
    : license.practitioner

const processRenewal = async ({
  license,
  now,
  payload,
}: ProcessInput): Promise<"sent" | "skipped"> => {
  const practitioner = resolvePractitioner(license)

  if (practitioner === null) {
    return "skipped"
  }

  const timezone = stateToTimezone(license.state)
  const daysRemaining = daysUntilExpiry({
    expiresAt: license.expiresAt,
    now,
    timezone,
  })

  const threshold = activeRenewalThreshold(daysRemaining)
  if (threshold === null) {
    return "skipped"
  }

  const notificationType = renewalNotificationType(threshold)

  // Relationship fields must use `in`, not `equals`: under the Postgres/Drizzle
  // adapter with UUID keys, `equals` on a relationship never matches.
  const alreadyLogged = await payload.find({
    collection: "notification-log",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { practitioner: { in: [practitioner.id] } },
        { license: { in: [license.id] } },
        { notificationType: { equals: notificationType } },
      ],
    },
  })

  if (alreadyLogged.totalDocs > 0) {
    return "skipped"
  }

  const { error } = await sendEmail({
    react: (
      <RenewalReminder
        daysRemaining={daysRemaining}
        expiresAt={license.expiresAt}
        licenseNumber={license.licenseNumber}
        licenseType={license.licenseType}
        notificationType={notificationType}
        practitionerName={practitioner.displayName ?? "there"}
        state={license.state}
      />
    ),
    subject: renewalSubject(daysRemaining),
    to: practitioner.email,
  })

  // Resend signals failures in the returned tuple, not by throwing. Re-throw so
  // the license counts as failed and is not logged, keeping it eligible for the
  // next run rather than silently suppressed.
  if (error) {
    throw new Error(`Resend rejected the renewal email: ${error.message}`)
  }

  await payload.create({
    collection: "notification-log",
    data: {
      license: license.id,
      notificationType,
      practitioner: practitioner.id,
      sentAt: now.toISOString(),
      sentForDate: calendarDateInTimezone(now, timezone),
    },
    overrideAccess: true,
  })

  log
    .withMetadata({ daysRemaining, licenseId: license.id, notificationType })
    .info("sent renewal notification")

  return "sent"
}

// Secondary to the renewal reminder: runs after it, on its own daily
// idempotency key, so a practitioner inside the renewal window who is also
// short on a required category hears about both.
const processShortfall = async ({
  license,
  now,
  payload,
}: ProcessInput): Promise<"sent" | "skipped"> => {
  const practitioner = resolvePractitioner(license)

  if (practitioner === null) {
    return "skipped"
  }

  const timezone = stateToTimezone(license.state)
  const daysRemaining = daysUntilExpiry({
    expiresAt: license.expiresAt,
    now,
    timezone,
  })

  if (daysRemaining > SHORTFALL_WINDOW_DAYS) {
    return "skipped"
  }

  const creditRows = await practitionerData({
    payload,
    practitionerId: practitioner.id,
  }).creditsForLicense(license.id)

  const summary = summarizeLicenseFromRows({ creditRows, license, today: now })
  if (summary === null) {
    return "skipped"
  }

  const shortfalls = summary.categoryProgress.filter(
    (category) => category.credited < category.required
  )
  if (shortfalls.length === 0) {
    return "skipped"
  }

  const sentForDate = calendarDateInTimezone(now, timezone)

  // The `category-shortfall` key also filters on `sentForDate`, so the warning
  // resets daily — unlike renewal reminders, which fire once per threshold.
  const alreadyLogged = await payload.find({
    collection: "notification-log",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { practitioner: { in: [practitioner.id] } },
        { license: { in: [license.id] } },
        { notificationType: { equals: "category-shortfall" } },
        { sentForDate: { equals: sentForDate } },
      ],
    },
  })

  if (alreadyLogged.totalDocs > 0) {
    return "skipped"
  }

  const { error } = await sendEmail({
    react: (
      <CategoryShortfallEmail
        licenseType={license.licenseType}
        practitionerName={practitioner.displayName ?? "there"}
        renewalDate={license.expiresAt}
        shortfalls={shortfalls.map((category) => ({
          category: category.category,
          credited: category.credited,
          required: category.required,
        }))}
        state={license.state}
      />
    ),
    subject: categoryShortfallSubject(),
    to: practitioner.email,
  })

  if (error) {
    throw new Error(
      `Resend rejected the category shortfall email: ${error.message}`
    )
  }

  await payload.create({
    collection: "notification-log",
    data: {
      license: license.id,
      notificationType: "category-shortfall",
      practitioner: practitioner.id,
      sentAt: now.toISOString(),
      sentForDate,
    },
    overrideAccess: true,
  })

  log
    .withMetadata({ licenseId: license.id, shortfalls: shortfalls.length })
    .info("sent category shortfall notification")

  return "sent"
}

const dispatchRenewalNotifications = async ({
  now,
  payload,
}: DispatchInput): Promise<DispatchSummary> => {
  const summary = { failed: 0, scanned: 0, sent: 0, skipped: 0 }
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const result = await payload.find({
      collection: "licenses",
      depth: 1,
      limit: PAGE_SIZE,
      overrideAccess: true,
      page,
      where: { status: { equals: "active" } },
    })

    for (const license of result.docs) {
      summary.scanned += 1

      for (const process of [processRenewal, processShortfall]) {
        try {
          const outcome = await process({ license, now, payload })
          summary[outcome] += 1
        } catch (error) {
          summary.failed += 1
          log
            .withError(error)
            .withMetadata({ licenseId: license.id })
            .error("failed to process license for notification")
          captureException(error)
        }
      }
    }

    hasNextPage = result.hasNextPage
    page += 1
  }

  return summary
}

export type { DispatchSummary }
export { dispatchRenewalNotifications }
