import type { License, User } from "@repo/payload/payload-types"
import type { Payload } from "payload"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { captureException, sendEmail } = vi.hoisted(() => ({
  captureException: vi.fn(),
  sendEmail: vi.fn(),
}))

vi.mock("server-only", () => ({}))

vi.mock("@repo/emails/send", () => ({ sendEmail }))

vi.mock("@repo/emails/templates/RenewalReminder", () => ({
  RenewalReminder: () => null,
  renewalSubject: (days: number) => `Your license expires in ${days} days`,
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

describe("dispatchRenewalNotifications", () => {
  beforeEach(() => {
    captureException.mockReset()
    sendEmail.mockReset()
    sendEmail.mockResolvedValue({ data: { id: "email-default" }, error: null })
  })

  it("sends and logs a due reminder that has not been sent", async () => {
    const create = vi.fn()
    const payload = fakePayload({ create, licensePages: [page([license()])] })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 1, skipped: 0 })
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

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 0, skipped: 1 })
    expect(sendEmail).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it("skips a license outside every reminder window", async () => {
    const payload = fakePayload({
      licensePages: [page([license({ expiresAt: EXPIRES_IN_200D })])],
    })

    const summary = await dispatchRenewalNotifications({ now: NOW, payload })

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 0, skipped: 1 })
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

    expect(summary).toEqual({ failed: 0, scanned: 1, sent: 0, skipped: 1 })
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

    expect(summary).toEqual({ failed: 0, scanned: 2, sent: 2, skipped: 0 })
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

    expect(summary).toEqual({ failed: 1, scanned: 2, sent: 1, skipped: 0 })
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

    expect(summary).toEqual({ failed: 1, scanned: 1, sent: 0, skipped: 0 })
    expect(create).not.toHaveBeenCalled()
    expect(captureException).toHaveBeenCalledOnce()
  })
})
