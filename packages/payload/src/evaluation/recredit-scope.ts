import {
  type CreditToPersist,
  type ReconcileSummary,
  reconcileCredits,
} from "@repo/payload/hooks/evaluateCourseCredits/reconcile-credits"
import type { Course, License } from "@repo/payload/payload-types"
import { practitionerData } from "@repo/payload/queries/practitioner-data"
import type { Payload, PayloadRequest, Where } from "payload"
import { match } from "ts-pattern"
import { creditCourseForLicense } from "./credit-course-for-license"
import { ruleSetKeyFor } from "./rule-set-key"

/**
 * The two re-credit scopes. A `course` scope re-credits one course across the
 * practitioner's active licenses; a `license` scope re-credits one license
 * across all of the practitioner's courses. The discriminant is what each
 * caller supplies — the hooks name their side, the CLI iterates licenses.
 */
export type RecreditScope =
  | { readonly type: "course"; readonly course: Course }
  | { readonly type: "license"; readonly license: License }

type RecreditScopeArgs = {
  readonly payload: Payload
  /**
   * Pass the hook's `req` so reads/writes run inside the same transaction as
   * the mutation that triggered them. Omitted by the CLI.
   */
  readonly req?: PayloadRequest
  readonly scope: RecreditScope
  /**
   * Timestamp stamped onto every credit. Defaults to now; the CLI passes a
   * single batch timestamp so a whole re-evaluation shares one `evaluatedAt`.
   */
  readonly evaluatedAt?: Date
  /**
   * When true, compute the plan and report it without writing. Forwarded to
   * `reconcileCredits` for the `rules:reevaluate` CLI's `--dry-run`.
   */
  readonly dryRun?: boolean
}

const refId = (ref: string | { id: string }): string =>
  typeof ref === "string" ? ref : ref.id

type ReconcilePlan = {
  readonly credits: ReadonlyArray<CreditToPersist>
  readonly where: Where
}

/**
 * The deep module that owns the fetch → map → reconcile chain end to end. The
 * `afterChange` hooks and the `rules:reevaluate` CLI all route through here so
 * no caller re-implements the chain, and the inactive-license / no-rule-set
 * short-circuit (reconcile to empty credits) lives in exactly one place — the
 * `license` branch below.
 */
export async function recreditScope({
  payload,
  req,
  scope,
  evaluatedAt = new Date(),
  dryRun = false,
}: RecreditScopeArgs): Promise<ReconcileSummary> {
  const plan = await match(scope)
    .with({ type: "course" }, async ({ course }): Promise<ReconcilePlan> => {
      const licenses = await practitionerData({
        payload,
        practitionerId: refId(course.practitioner),
        req,
      }).activeLicenses()
      const credits = licenses
        .map((license) =>
          creditCourseForLicense({ course, evaluatedAt, license })
        )
        .filter((credit): credit is CreditToPersist => credit !== null)
      return { credits, where: { course: { equals: course.id } } }
    })
    .with({ type: "license" }, async ({ license }): Promise<ReconcilePlan> => {
      const where: Where = { license: { equals: license.id } }
      if (license.status !== "active" || ruleSetKeyFor(license) === null) {
        return { credits: [], where }
      }
      const courses = await practitionerData({
        payload,
        practitionerId: refId(license.practitioner),
        req,
      }).courses()
      const credits = courses
        .map((course) =>
          creditCourseForLicense({ course, evaluatedAt, license })
        )
        .filter((credit): credit is CreditToPersist => credit !== null)
      return { credits, where }
    })
    .exhaustive()

  return reconcileCredits({
    credits: plan.credits,
    dryRun,
    payload,
    req,
    scope: plan.where,
  })
}
