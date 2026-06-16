import type { License, User } from "@repo/payload/payload-types"
import type { ProgressSummary } from "@repo/rules-engine/types/ProgressSummary"
import type { Payload } from "payload"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { captureException, sendEmail, summarizeLicenseFromRows } = vi.hoisted(
  () => ({
    captureException: vi.fn(),
    sendEmail: vi.fn(),
    summarizeLicenseFromRows: vi.fn(),
  })
)

vi.mock("server-only", () => ({}))

vi.mock("@repo/emails/send", () => ({ sendEmail }))

vi.mock("@repo/emails/templates/RenewalReminder", () => ({
  RenewalReminder: () => null,
  renewalSubject: (days: number) => `Your license expires in ${days} days`,
}))

vi.mock("@repo/emails/templates/CategoryShortfall", () => ({
  CategoryShortfallEmail: () => null,
  categoryShortfallSubject: () => "Some required CE categories are still short",
}))

vi.mock("@repo/emails/templates/CoTelehealthReminder", () => ({
  CoTelehealthReminder: () => null,
  coTelehealthSubject: (days: number) =>
    `Your Colorado telehealth registration expires in ${days} days`,
}))

vi.mock("@repo/payload/evaluation", () => ({ summarizeLicenseFromRows }))

vi.mock("@repo/payload/queries/practitioner-data", () => ({
  practitionerData: () => ({ creditsForLicense: async () => [] }),
}))

vi.mock("@sentry/nextjs", () => ({ captureException }))

vi.mock("@repo/logger", () => {
  const chain = {
    error: vi.fn(),
    info: vi.fn(),
    withError: () => chain,
    withMetadata: () => chain,
  }
  return { createLogger: () => chain }
})

import { dispatchRenewalNotifications } from "./dispatch"

const NOW = new Date("2026-06-15T13:00:00Z")
const EXPIRES_IN_90D = "2026-09-13T12:00:00Z"
const EXPIRES_IN_45D = "2026-07-30T12:00:00Z"
const EXPIRES_IN_200D = "2027-01-01T12:00:00Z"

const practitioner = (overrides: Partial<User> = {}): User =>
  ({
    createdAt: "2025-01-01T00:00:00Z",
    deletedAt: null,
    displayName: "Pat Practitioner",
    email: "pat@example.com",
    id: "user-1",
    updatedAt: "2025-01-01T00:00:00Z",
    ...overrides,
  }) as User

const license = (overrides: Partial<License> = {}): License =>
  ({
    createdAt: "2025-01-01T00:00:00Z",
    expiresAt: EXPIRES_IN_90D,
    id: "lic-1",
    issuedAt: "2024-01-01T00:00:00Z",
    licenseNumber: "L-1",
    licenseType: "LCSW",
    practitioner: practitioner(),
    state: "CA",
    status: "active",
    updatedAt: "2025-01-01T00:00:00Z",
    ...overrides,
  }) as License

const summaryWith = (
  categoryProgress: ProgressSummary["categoryProgress"]
): ProgressSummary => ({ categoryProgress }) as ProgressSummary

type FindResult = {
  readonly docs: ReadonlyArray<unknown>
  readonly hasNextPage: boolean
  readonly totalDocs: number
}

const page = (
  docs: ReadonlyArray<unknown>,
  hasNextPage = false
): FindResult => ({
  docs,
  hasNextPage,
  totalDocs: docs.length,
})

// A logged row is matched only when the query filters relationships with `in`,
// so a regression to `equals` resurfaces the duplicate-send bug as a failure.
const usesRelationshipInFilter = (where: {
  and?: ReadonlyArray<Record<string, { in?: ReadonlyArray<string> }>>
}): boolean =>
  Boolean(
    where.and?.some((clause) => Array.isArray(clause.license?.in)) &&
      where.and?.some((clause) => Array.isArray(clause.practitioner?.in))
  )

const fakePayload = ({
  create = vi.fn(),
  licensePages,
  logTotalDocs = 0,
}: {
  create?: ReturnType<typeof vi.fn>
  licensePages: ReadonlyArray<FindResult>
  logTotalDocs?: number
}): Payload => {
  const find = vi.fn(
    ({
      collection,
      page: pageNumber,
      where,
    }: {
      collection: string
      page: number
      where: Parameters<typeof usesRelationshipInFilter>[0]
    }) => {
      if (collection === "licenses") {
        return Promise.resolve(licensePages[pageNumber - 1] ?? page([]))
      }

      const found = logTotalDocs > 0 && usesRelationshipInFilter(where)
      return Promise.resolve(page(found ? [{ id: "log-1" }] : []))
    }
  )

  return { create, find } as unknown as Payload
}

// Resolves notification-log idempotency by notification type, so a test can put
// the renewal reminder out of the way (already logged) and isolate the
// secondary shortfall warning.
const shortfallPayload = ({
  create = vi.fn(),
  licensePages,
  shortfallLogged = false,
}: {
  create?: ReturnType<typeof vi.fn>
  licensePages: ReadonlyArray<FindResult>
  shortfallLogged?: boolean
}): Payload => {
  const find = vi.fn(
    ({
      collection,
      page: pageNumber,
      where,
    }: {
      collection: string
      page: number
      where: {
        and?: ReadonlyArray<{ notificationType?: { equals?: string } }>
      }
    }) => {
      if (collection === "licenses") {
        return Promise.resolve(licensePages[pageNumber - 1] ?? page([]))
      }
      if (collection === "course-credits") {
        return Promise.resolve(page([]))
      }

      const type = where.and?.find((clause) => clause.notificationType)
        ?.notificationType?.equals
      if (type === "category-shortfall") {
        return Promise.resolve(page(shortfallLogged ? [{ id: "log-1" }] : []))
      }

      // Renewal reminders are treated as already sent so these tests exercise
      // only the shortfall path.
      return Promise.resolve(page([{ id: "renewal-log" }]))
    }
  )

  return { create, find } as unknown as Payload
}

// Resolves notification-log idempotency by notification type so the CO
// telehealth track can be isolated: renewal/shortfall types report as already
// logged, while the co-telehealth-* types are configurable per test.
const coTelehealthPayload = ({
  create = vi.fn(),
  coLogged = false,
  licensePages,
  renewalLogged = true,
}: {
  create?: ReturnType<typeof vi.fn>
  coLogged?: boolean
  licensePages: ReadonlyArray<FindResult>
  renewalLogged?: boolean
}): Payload => {
  const find = vi.fn(
    ({
      collection,
      page: pageNumber,
      where,
    }: {
      collection: string
      page: number
      where: {
        and?: ReadonlyArray<{ notificationType?: { equals?: string } }>
      }
    }) => {
      if (collection === "licenses") {
        return Promise.resolve(licensePages[pageNumber - 1] ?? page([]))
      }
      if (collection === "course-credits") {
        return Promise.resolve(page([]))
      }

      const type = where.and?.find((clause) => clause.notificationType)
        ?.notificationType?.equals
      if (typeof type === "string" && type.startsWith("co-telehealth")) {
        return Promise.resolve(page(coLogged ? [{ id: "co-log" }] : []))
      }

      return Promise.resolve(page(renewalLogged ? [{ id: "renewal-log" }] : []))
    }
  )

  return { create, find } as unknown as Payload
}

const registeredLicense = (
  coTelehealthRegistration: {
    expiresAt?: string
    isRegistered?: boolean
    registrationNumber?: string
  },
  overrides: Partial<License> = {}
): License =>
  license({ coTelehealthRegistration, ...overrides } as Partial<License>)

describe("dispatchRenewalNotifications", () => {
  beforeEach(() => {
    captureException.mockReset()
    sendEmail.mockReset()
    sendEmail.mockResolvedValue({ data: { id: "email-default" }, error: null })
    summarizeLicenseFromRows.mockReset()
    summarizeLicenseFromRows.mockReturnValue(null)
  })

  it("sends and logs a due reminder that has not been sent", async () => {
    const create = vi.fn()
    const payload = fakePayload({ create, licensePages: [page([license()])] })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 1, skipped: 2 })
    expect(sendEmail).toHaveBeenCalledOnce()
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "notification-log",
        data: expect.objectContaining({
          license: "lic-1",
          notificationType: "renewal-90d",
          practitioner: "user-1",
        }),
      })
    )
  })

  it("skips a reminder already recorded in the log", async () => {
    const create = vi.fn()
    const payload = fakePayload({
      create,
      licensePages: [page([license()])],
      logTotalDocs: 1,
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 0, skipped: 3 })
    expect(sendEmail).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it("skips a license outside every reminder window", async () => {
    const payload = fakePayload({
      licensePages: [page([license({ expiresAt: EXPIRES_IN_200D })])],
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 0, skipped: 3 })
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("skips a soft-deleted practitioner", async () => {
    const payload = fakePayload({
      licensePages: [
        page([
          license({
            practitioner: practitioner({ deletedAt: "2026-01-01T00:00:00Z" }),
          }),
        ]),
      ],
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 0, skipped: 3 })
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("processes every page without a full-table scan", async () => {
    const payload = fakePayload({
      licensePages: [
        page([license({ id: "lic-1" })], true),
        page([license({ id: "lic-2" })]),
      ],
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 2, sent: 2, skipped: 4 })
    expect(sendEmail).toHaveBeenCalledTimes(2)
  })

  it("isolates a single license failure and continues the batch", async () => {
    sendEmail
      .mockRejectedValueOnce(new Error("resend down"))
      .mockResolvedValueOnce({ data: { id: "email-2" }, error: null })

    const payload = fakePayload({
      licensePages: [
        page([license({ id: "lic-1" }), license({ id: "lic-2" })]),
      ],
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 1, scanned: 2, sent: 1, skipped: 4 })
    expect(captureException).toHaveBeenCalledOnce()
  })

  it("treats a Resend error tuple as a failure and does not log it", async () => {
    sendEmail.mockResolvedValueOnce({
      data: null,
      error: { message: "API key is invalid", name: "validation_error" },
    })
    const create = vi.fn()
    const payload = fakePayload({ create, licensePages: [page([license()])] })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 1, scanned: 1, sent: 0, skipped: 2 })
    expect(create).not.toHaveBeenCalled()
    expect(captureException).toHaveBeenCalledOnce()
  })

  it("sends and logs a category shortfall inside the renewal window", async () => {
    summarizeLicenseFromRows.mockReturnValue(
      summaryWith([
        { category: "law-and-ethics", credited: 2, required: 6 },
        { category: "general", credited: 20, required: 20 },
      ])
    )
    const create = vi.fn()
    const payload = shortfallPayload({
      create,
      licensePages: [page([license({ expiresAt: EXPIRES_IN_45D })])],
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 1, skipped: 2 })
    expect(sendEmail).toHaveBeenCalledOnce()
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "notification-log",
        data: expect.objectContaining({
          license: "lic-1",
          notificationType: "category-shortfall",
          practitioner: "user-1",
        }),
      })
    )
  })

  it("does not send a shortfall when every category is met", async () => {
    summarizeLicenseFromRows.mockReturnValue(
      summaryWith([{ category: "general", credited: 20, required: 20 }])
    )
    const create = vi.fn()
    const payload = shortfallPayload({
      create,
      licensePages: [page([license({ expiresAt: EXPIRES_IN_45D })])],
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 0, skipped: 3 })
    expect(sendEmail).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it("does not repeat a shortfall already logged for the day", async () => {
    summarizeLicenseFromRows.mockReturnValue(
      summaryWith([{ category: "law-and-ethics", credited: 2, required: 6 }])
    )
    const create = vi.fn()
    const payload = shortfallPayload({
      create,
      licensePages: [page([license({ expiresAt: EXPIRES_IN_45D })])],
      shortfallLogged: true,
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 0, skipped: 3 })
    expect(sendEmail).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it("does not send a shortfall outside the 60-day window", async () => {
    summarizeLicenseFromRows.mockReturnValue(
      summaryWith([{ category: "law-and-ethics", credited: 2, required: 6 }])
    )
    const payload = shortfallPayload({
      licensePages: [page([license({ expiresAt: EXPIRES_IN_90D })])],
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 0, skipped: 3 })
    expect(sendEmail).not.toHaveBeenCalled()
    expect(summarizeLicenseFromRows).not.toHaveBeenCalled()
  })

  it("skips the shortfall when no rule set ships for the license", async () => {
    summarizeLicenseFromRows.mockReturnValue(null)
    const payload = shortfallPayload({
      licensePages: [page([license({ expiresAt: EXPIRES_IN_45D })])],
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 0, skipped: 3 })
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("sends and logs a CO telehealth reminder for a registered license in a window", async () => {
    const create = vi.fn()
    const payload = coTelehealthPayload({
      create,
      licensePages: [
        page([
          registeredLicense({
            expiresAt: EXPIRES_IN_90D,
            isRegistered: true,
            registrationNumber: "CO-1",
          }),
        ]),
      ],
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 1, skipped: 2 })
    expect(sendEmail).toHaveBeenCalledOnce()
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "notification-log",
        data: expect.objectContaining({
          license: "lic-1",
          notificationType: "co-telehealth-90d",
          practitioner: "user-1",
        }),
      })
    )
  })

  it("sends the CO reminder independently of an already-sent renewal reminder", async () => {
    const create = vi.fn()
    const payload = coTelehealthPayload({
      create,
      licensePages: [
        page([
          registeredLicense({
            expiresAt: EXPIRES_IN_90D,
            isRegistered: true,
          }),
        ]),
      ],
      renewalLogged: false,
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 2, skipped: 1 })
    expect(sendEmail).toHaveBeenCalledTimes(2)
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ notificationType: "renewal-90d" }),
      })
    )
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notificationType: "co-telehealth-90d",
        }),
      })
    )
  })

  it("does not send a CO reminder when the license is not registered", async () => {
    const create = vi.fn()
    const payload = coTelehealthPayload({
      create,
      licensePages: [
        page([
          registeredLicense({
            expiresAt: EXPIRES_IN_90D,
            isRegistered: false,
          }),
        ]),
      ],
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 0, skipped: 3 })
    expect(sendEmail).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it("does not send a CO reminder when no CO expiry is set", async () => {
    const create = vi.fn()
    const payload = coTelehealthPayload({
      create,
      licensePages: [page([registeredLicense({ isRegistered: true })])],
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 0, skipped: 3 })
    expect(sendEmail).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it("does not repeat a CO reminder already recorded in the log", async () => {
    const create = vi.fn()
    const payload = coTelehealthPayload({
      coLogged: true,
      create,
      licensePages: [
        page([
          registeredLicense({
            expiresAt: EXPIRES_IN_90D,
            isRegistered: true,
          }),
        ]),
      ],
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 0, skipped: 3 })
    expect(sendEmail).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })
})
