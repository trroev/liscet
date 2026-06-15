import config from "@payload-config"
import { createLogger } from "@repo/logger"
import { creditCourseForLicense } from "@repo/payload/evaluation"
import {
  type CreditToPersist,
  reconcileCredits,
} from "@repo/payload/hooks/evaluateCourseCredits/reconcile-credits"
import { RULE_SETS, type RuleSetKey } from "@repo/rules-engine/rule-sets"
import { getPayload } from "payload"

const log = createLogger({ name: "scripts.reevaluate" })

const LICENSE_PAGE_SIZE = 100

type CliArgs = {
  readonly state: string
  readonly licenseType: string
  readonly toVersion: number
  readonly dryRun: boolean
}

const refId = (ref: string | { id: string }): string =>
  typeof ref === "string" ? ref : ref.id

/**
 * Parse `--key=value` / `--flag` tokens. `payload run` forwards everything
 * after a standalone `--` into the script's argv, so a bare `--` token may
 * lead the list and is ignored here.
 */
function parseArgs(argv: ReadonlyArray<string>): CliArgs {
  const flags = new Map<string, string | boolean>()
  for (const token of argv) {
    if (token === "--" || !token.startsWith("--")) {
      continue
    }
    const body = token.slice(2)
    const eq = body.indexOf("=")
    if (eq === -1) {
      flags.set(body, true)
    } else {
      flags.set(body.slice(0, eq), body.slice(eq + 1))
    }
  }

  const state = flags.get("state")
  const licenseType = flags.get("license-type")
  const toVersionRaw = flags.get("to-version")

  if (typeof state !== "string" || typeof licenseType !== "string") {
    throw new Error(
      "Usage: rules:reevaluate -- --state=CA --license-type=LCSW --to-version=1 [--dry-run]"
    )
  }
  const toVersion = Number(toVersionRaw)
  if (typeof toVersionRaw !== "string" || !Number.isInteger(toVersion)) {
    throw new Error("--to-version must be an integer (e.g. --to-version=1)")
  }

  return {
    dryRun: flags.get("dry-run") === true,
    licenseType,
    state,
    toVersion,
  }
}

async function reevaluate(args: CliArgs): Promise<void> {
  const key = `${args.state}-${args.licenseType}`
  if (!(key in RULE_SETS)) {
    throw new Error(
      `No rule set found for "${key}". Known: ${Object.keys(RULE_SETS).join(", ")}`
    )
  }
  const ruleSet = RULE_SETS[key as RuleSetKey]
  if (ruleSet.version !== args.toVersion) {
    throw new Error(
      `--to-version=${args.toVersion} does not match the deployed ${key} rule set (version ${ruleSet.version}). Deploy the intended rule set first.`
    )
  }

  const payload = await getPayload({ config })
  const evaluatedAt = new Date()
  const totals = { created: 0, credits: 0, deleted: 0, licenses: 0, updated: 0 }

  let page = 1
  for (;;) {
    const licenses = await payload.find({
      collection: "licenses",
      depth: 0,
      limit: LICENSE_PAGE_SIZE,
      overrideAccess: true,
      page,
      where: {
        and: [
          { state: { equals: args.state } },
          { licenseType: { equals: args.licenseType } },
        ],
      },
    })

    for (const license of licenses.docs) {
      const courses = await payload.find({
        collection: "courses",
        depth: 0,
        overrideAccess: true,
        pagination: false,
        where: { practitioner: { equals: refId(license.practitioner) } },
      })
      const credits = courses.docs
        .map((course) =>
          creditCourseForLicense({ course, evaluatedAt, license })
        )
        .filter((credit): credit is CreditToPersist => credit !== null)
      const summary = await reconcileCredits({
        credits,
        dryRun: args.dryRun,
        payload,
        scope: { license: { equals: license.id } },
      })
      totals.created += summary.created
      totals.updated += summary.updated
      totals.deleted += summary.deleted
      totals.credits += credits.length
      totals.licenses += 1
    }

    if (!licenses.hasNextPage) {
      break
    }
    page += 1
  }

  log
    .withMetadata({ dryRun: args.dryRun, key, ...totals })
    .info(
      args.dryRun
        ? "Dry run complete — no changes written"
        : "Re-evaluation complete"
    )
}

try {
  await reevaluate(parseArgs(process.argv.slice(2)))
} catch (err) {
  log.withError(err).error("rules:reevaluate failed")
  process.exit(1)
}
