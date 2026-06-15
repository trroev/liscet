import "server-only"

import { sendEmail } from "@repo/emails/send"
import {
  RenewalReminder,
  renewalSubject,
} from "@repo/emails/templates/RenewalReminder"
import { createLogger } from "@repo/logger"
import type { License } from "@repo/payload/payload-types"
import { daysUntilExpiry } from "@repo/utils/daysUntilExpiry"
import {
  activeRenewalThreshold,
  renewalNotificationType,
} from "@repo/utils/renewalThreshold"
import { stateToTimezone } from "@repo/utils/stateToTimezone"
import { captureException } from "@sentry/nextjs"
import type { Payload } from "payload"

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

// Decide and dispatch the due renewal reminder for a single license. Returns
// "skipped" when no window is active, the practitioner is unreachable, or the
// reminder has already been logged; "sent" when an email goes out.
const processLicense = async ({
  license,
  now,
  payload,
}: ProcessInput): Promise<"sent" | "skipped"> => {
  const practitioner = license.practitioner

  // depth: 1 populates the relationship; a bare id means a broken reference,
  // and a soft-deleted practitioner should not receive mail.
  if (typeof practitioner === "string" || practitioner.deletedAt) {
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

  // Relationship fields are filtered with `in` rather than `equals`: against
  // the Postgres/Drizzle adapter with UUID primary keys, `equals` on a
  // relationship field does not match, whereas `in` does. The `notificationType`
  // select field matches with `equals` as normal.
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

  await sendEmail({
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

  // Logged after a successful send so the idempotency record reflects mail that
  // actually went out. The collection's unique index on
  // (practitioner, license, notificationType, sentForDate) is the backstop
  // against a same-day double run.
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

// Paginate active licenses and dispatch any due renewal reminders. A single
// license failure is captured and counted but never aborts the batch.
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

      try {
        const outcome = await processLicense({ license, now, payload })
        summary[outcome] += 1
      } catch (error) {
        summary.failed += 1
        log
          .withError(error)
          .withMetadata({ licenseId: license.id })
          .error("failed to process license for renewal notification")
        captureException(error)
      }
    }

    hasNextPage = result.hasNextPage
    page += 1
  }

  return summary
}

export type { DispatchSummary }
export { dispatchRenewalNotifications }
