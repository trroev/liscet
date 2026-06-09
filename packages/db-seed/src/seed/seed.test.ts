import { SEED_PRACTITIONERS } from "@repo/db-seed/fixtures"
import type { SeedAuth } from "@repo/db-seed/types"
import type { Payload } from "payload"
import { afterEach, describe, expect, it, vi } from "vitest"
import { seed } from "./index"

const PRODUCTION_ABORT_PATTERN = /must not run in production/i

type Doc = { readonly id: string; readonly collection?: string }
type Store = Map<string, Array<Doc & Record<string, unknown>>>

const buildPayload = ({
  startEmpty = true,
}: {
  readonly startEmpty?: boolean
} = {}): {
  payload: Payload
  store: Store
} => {
  const store: Store = new Map()
  store.set("users", [])
  store.set("licenses", [])
  store.set("courses", [])

  if (!startEmpty) {
    // Seed the store with existing matching docs to exercise the skip branch.
    for (const practitioner of SEED_PRACTITIONERS) {
      const userId = `user-${practitioner.email}`
      store.get("users")?.push({
        id: userId,
        email: practitioner.email,
        displayName: practitioner.displayName,
      })
      store.get("licenses")?.push({
        id: `lic-${practitioner.license.licenseNumber}`,
        practitioner: userId,
        licenseNumber: practitioner.license.licenseNumber,
      })
      for (const course of practitioner.courses) {
        store.get("courses")?.push({
          id: `course-${userId}-${course.title}`,
          practitioner: userId,
          title: course.title,
          completedAt: course.completedAt,
        })
      }
    }
  }

  const matchesWhere = (
    doc: Record<string, unknown>,
    where: Record<string, unknown> | undefined
  ): boolean => {
    if (where === undefined) {
      return true
    }
    const and = (where.and as ReadonlyArray<Record<string, unknown>>) ?? [where]
    for (const clause of and) {
      for (const [field, condition] of Object.entries(clause)) {
        const equalsValue = (condition as { equals?: unknown }).equals
        if (doc[field] !== equalsValue) {
          return false
        }
      }
    }
    return true
  }

  const find = vi.fn(({ collection, where }: Record<string, unknown>) => {
    const docs = store.get(collection as string) ?? []
    const matches = docs.filter((d) =>
      matchesWhere(d, where as Record<string, unknown> | undefined)
    )
    return Promise.resolve({ docs: matches })
  })

  let nextId = 0
  const create = vi.fn(({ collection, data }: Record<string, unknown>) => {
    nextId += 1
    const doc = {
      id: `gen-${collection}-${nextId}`,
      ...(data as Record<string, unknown>),
    }
    store.get(collection as string)?.push(doc)
    return Promise.resolve(doc)
  })

  const update = vi.fn(({ collection, id, data }: Record<string, unknown>) => {
    const docs = store.get(collection as string) ?? []
    const idx = docs.findIndex((d) => d.id === id)
    if (idx !== -1) {
      docs[idx] = {
        ...docs[idx],
        ...(data as Record<string, unknown>),
      } as Doc
    }
    return Promise.resolve(docs[idx])
  })

  return {
    payload: { find, create, update } as unknown as Payload,
    store,
  }
}

const buildAuth = ({ payload }: { readonly payload: Payload }): SeedAuth => ({
  api: {
    signUpEmail: vi.fn(async ({ body }) => {
      // Mimic the after-create hook by inserting a Payload users row.
      await payload.create({
        collection: "users",
        data: {
          email: body.email,
          displayName: body.name,
          betterAuthId: `auth-${body.email}`,
        },
        overrideAccess: true,
      })
      return { user: { id: `auth-${body.email}`, email: body.email } }
    }),
  },
})

describe("seed", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("hard-aborts with a clear error when NODE_ENV is production", async () => {
    vi.stubEnv("NODE_ENV", "production")
    const { payload } = buildPayload()
    const auth = buildAuth({ payload })

    await expect(seed({ payload, auth })).rejects.toThrow(
      PRODUCTION_ABORT_PATTERN
    )
    expect(auth.api.signUpEmail).not.toHaveBeenCalled()
  })

  it("creates one practitioner, license, and three courses per fixture on a clean DB", async () => {
    const { payload } = buildPayload()
    const auth = buildAuth({ payload })

    const summary = await seed({ payload, auth })

    expect(summary.practitionersCreated).toBe(SEED_PRACTITIONERS.length)
    expect(summary.practitionersSkipped).toBe(0)
    expect(summary.licensesCreated).toBe(SEED_PRACTITIONERS.length)
    expect(summary.licensesSkipped).toBe(0)
    expect(summary.coursesCreated).toBe(
      SEED_PRACTITIONERS.reduce((sum, p) => sum + p.courses.length, 0)
    )
    expect(summary.coursesSkipped).toBe(0)
    expect(auth.api.signUpEmail).toHaveBeenCalledTimes(
      SEED_PRACTITIONERS.length
    )
  })

  it("is idempotent: a second run creates nothing", async () => {
    const { payload } = buildPayload()
    const auth = buildAuth({ payload })

    await seed({ payload, auth })
    vi.mocked(auth.api.signUpEmail).mockClear()
    const second = await seed({ payload, auth })

    expect(second.practitionersCreated).toBe(0)
    expect(second.practitionersSkipped).toBe(SEED_PRACTITIONERS.length)
    expect(second.licensesCreated).toBe(0)
    expect(second.licensesSkipped).toBe(SEED_PRACTITIONERS.length)
    expect(second.coursesCreated).toBe(0)
    expect(second.coursesSkipped).toBe(
      SEED_PRACTITIONERS.reduce((sum, p) => sum + p.courses.length, 0)
    )
    expect(auth.api.signUpEmail).not.toHaveBeenCalled()
  })

  it("does not call signUpEmail when the Payload user already exists", async () => {
    const { payload } = buildPayload({ startEmpty: false })
    const auth = buildAuth({ payload })

    const summary = await seed({ payload, auth })

    expect(auth.api.signUpEmail).not.toHaveBeenCalled()
    expect(summary.practitionersCreated).toBe(0)
  })
})
