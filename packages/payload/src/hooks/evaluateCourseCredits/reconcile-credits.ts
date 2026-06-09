import type { Payload, PayloadRequest, Where } from "payload"

export type CreditToPersist = {
  readonly courseId: string
  readonly licenseId: string
  readonly creditedHours: number
  readonly creditedCategories: ReadonlyArray<string>
  readonly evaluatedAt: Date
  readonly ruleSetKey: string
  readonly ruleSetVersion: number
}

type ReconcileCreditsArgs = {
  readonly payload: Payload
  readonly req: PayloadRequest
  readonly scope: Where
  readonly credits: ReadonlyArray<CreditToPersist>
}

const pairKey = (courseId: string, licenseId: string): string =>
  `${courseId}::${licenseId}`

const refId = (ref: string | { id: string }): string =>
  typeof ref === "string" ? ref : ref.id

export async function reconcileCredits({
  payload,
  req,
  scope,
  credits,
}: ReconcileCreditsArgs): Promise<void> {
  const existing = await payload.find({
    collection: "course-credits",
    depth: 0,
    overrideAccess: true,
    pagination: false,
    req,
    where: scope,
  })

  const desired = new Set(
    credits.map((credit) => pairKey(credit.courseId, credit.licenseId))
  )

  const staleRows = existing.docs.filter(
    (row) => !desired.has(pairKey(refId(row.course), refId(row.license)))
  )
  await Promise.all(
    staleRows.map((row) =>
      payload.delete({
        collection: "course-credits",
        id: row.id,
        overrideAccess: true,
        req,
      })
    )
  )

  await Promise.all(
    credits.map(async (credit) => {
      const data = {
        course: credit.courseId,
        creditedCategories: [...credit.creditedCategories],
        creditedHours: credit.creditedHours,
        evaluatedAt: credit.evaluatedAt.toISOString(),
        license: credit.licenseId,
        ruleSetKey: credit.ruleSetKey,
        ruleSetVersion: credit.ruleSetVersion,
      }
      const match = await payload.find({
        collection: "course-credits",
        depth: 0,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        req,
        where: {
          and: [
            { course: { equals: credit.courseId } },
            { license: { equals: credit.licenseId } },
          ],
        },
      })
      const found = match.docs[0]
      if (found) {
        await payload.update({
          collection: "course-credits",
          data,
          id: found.id,
          overrideAccess: true,
          req,
        })
        return
      }
      await payload.create({
        collection: "course-credits",
        data,
        overrideAccess: true,
        req,
      })
    })
  )
}
