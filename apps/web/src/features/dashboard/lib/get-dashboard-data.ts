import "server-only"

import type { CourseCredit, License } from "@repo/payload/payload-types"
import { summarizeLicense } from "@repo/rules-engine/evaluators/summarizeLicense"
import { RULE_SETS, type RuleSetKey } from "@repo/rules-engine/rule-sets"
import type { CourseCreditResult } from "@repo/rules-engine/types/CourseCreditResult"
import type {
  ApprovingBody,
  CourseFormat,
  SubjectCategory,
} from "@repo/rules-engine/types/RuleSet"
import { getPayload } from "payload"
import config from "~/payload.config"
import type { DashboardData, LicenseSummaryView } from "./types"

const DEFAULT_RENEWAL_CYCLE_MONTHS = 24

const refId = (ref: string | { id: string }): string =>
  typeof ref === "string" ? ref : ref.id

const ruleSetKeyFor = (license: License): RuleSetKey | null => {
  const key = `${license.state}-${license.licenseType}`
  return key in RULE_SETS ? (key as RuleSetKey) : null
}

// CourseCredits are written by the rules engine with validated union values;
// the persisted columns widen to string, so narrow them back to the engine's
// types when reconstructing the result it expects.
const toCreditResult = (row: CourseCredit): CourseCreditResult => ({
  approvingBody: (row.approvingBody ?? null) as ApprovingBody | null,
  completedAt: new Date(row.completedAt),
  courseId: refId(row.course),
  creditedCategories: (row.creditedCategories ??
    []) as ReadonlyArray<SubjectCategory>,
  creditedHours: row.creditedHours,
  evaluatedAt: new Date(row.evaluatedAt),
  format: row.format as CourseFormat,
  licenseId: refId(row.license),
  ruleSetVersion: row.ruleSetVersion,
})

/**
 * Aggregate a practitioner's active licenses into per-license progress
 * summaries for the dashboard. For each license, reconstructs its persisted
 * CourseCredits into the rules engine's result shape and runs
 * `summarizeLicense`. `summary` is null when no rule set ships for the
 * license's state + type.
 */
export const getDashboardData = async (
  practitionerId: string,
  today: Date
): Promise<DashboardData> => {
  const payload = await getPayload({ config })
  const licensesResult = await payload.find({
    collection: "licenses",
    depth: 0,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { practitioner: { equals: practitionerId } },
        { status: { equals: "active" } },
      ],
    },
  })

  const licenses = await Promise.all(
    licensesResult.docs.map(async (license): Promise<LicenseSummaryView> => {
      const key = ruleSetKeyFor(license)
      const creditsResult = await payload.find({
        collection: "course-credits",
        depth: 0,
        overrideAccess: true,
        pagination: false,
        where: { license: { equals: license.id } },
      })
      const summary =
        key === null
          ? null
          : summarizeLicense({
              credits: creditsResult.docs.map(toCreditResult),
              license: {
                id: license.id,
                issuedAt: new Date(license.issuedAt),
                reactivationDate: license.reactivationDate
                  ? new Date(license.reactivationDate)
                  : null,
                renewalCycleMonths:
                  license.renewalCycleMonths ?? DEFAULT_RENEWAL_CYCLE_MONTHS,
              },
              ruleSet: RULE_SETS[key],
              today,
            })
      return {
        id: license.id,
        licenseNumber: license.licenseNumber,
        licenseType: license.licenseType,
        state: license.state,
        summary,
      }
    })
  )

  return { licenses }
}
