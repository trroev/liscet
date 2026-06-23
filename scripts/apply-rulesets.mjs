#!/usr/bin/env node

//
// Apply the committed branch/tag protection rulesets to the GitHub repo as code.
// #86 adopted a trunk-based flow: `main` is the single long-lived branch, feature
// branches are short-lived and PR straight into it, and releases are cut as tags.
// Click-ops protection is invisible in a fork and lost on re-clone, so the rulesets
// live as JSON under `.github/rulesets/` and this script reconciles them via the
// GitHub REST API (`gh api`, so it reuses the operator's existing auth — no token
// wiring). It is idempotent: rulesets are matched by `name`, created when missing
// and updated in place otherwise, so re-running never duplicates.
//
// Because GitHub ruleset bypass is all-or-nothing per ruleset, "an admin may merge
// solo but may never skip CI or signing" needs two rulesets on `main`: a
// non-bypassable merge-protection ruleset (binds admins too) and a review ruleset
// that repo admins may bypass for pull requests. See CLAUDE.md → "Branch protection".
//
// The script also pins the repo's merge settings to squash-only so the merge button
// can never produce a merge commit that the required-linear-history rule would
// reject at push time. Pass `--dry-run` to print the planned actions without writing.
//
// Unknown rulesets already on the repo are left untouched (not deleted), so a fork
// may layer its own rulesets on top without this script tearing them down.

import { spawnSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const rulesetsDir = join(repoRoot, ".github", "rulesets")
const isDryRun = process.argv.includes("--dry-run")

const MERGE_SETTINGS = {
  allow_squash_merge: true,
  allow_merge_commit: false,
  allow_rebase_merge: false,
  delete_branch_on_merge: true,
}

/**
 * Run `gh` and return stdout, failing loudly on a non-zero exit. A JSON body is
 * passed on stdin via `--input -` so payloads never hit the shell.
 */
const gh = ({ args, input }) => {
  const result = spawnSync("gh", args, {
    input: input ? JSON.stringify(input) : undefined,
    encoding: "utf8",
  })
  if (result.status !== 0) {
    process.stderr.write(`gh ${args.join(" ")} failed:\n${result.stderr}\n`)
    process.exit(result.status ?? 1)
  }
  return result.stdout
}

/** Resolve the target repo from the current gh context so a fork needs no edit. */
const resolveRepo = () =>
  gh({
    args: ["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"],
  }).trim()

/** Read every committed ruleset definition under `.github/rulesets/`. */
const readLocalRulesets = () =>
  readdirSync(rulesetsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(readFileSync(join(rulesetsDir, file), "utf8")))

/** Map existing ruleset name → id for the repo (paginated). */
const readRemoteRulesets = ({ repo }) => {
  const rulesets = JSON.parse(
    gh({ args: ["api", "--paginate", `/repos/${repo}/rulesets`] })
  )
  return new Map(rulesets.map((ruleset) => [ruleset.name, ruleset.id]))
}

const main = () => {
  const repo = resolveRepo()
  const local = readLocalRulesets()
  const remote = readRemoteRulesets({ repo })

  process.stdout.write(`Applying ${local.length} rulesets to ${repo}\n`)
  if (isDryRun) {
    process.stdout.write("(dry run — no changes will be written)\n")
  }

  for (const ruleset of local) {
    const existingId = remote.get(ruleset.name)
    const action = existingId ? "update" : "create"
    process.stdout.write(`  ${action}: ${ruleset.name}\n`)

    if (isDryRun) {
      continue
    }

    const args = existingId
      ? [
          "api",
          "--method",
          "PUT",
          `/repos/${repo}/rulesets/${existingId}`,
          "--input",
          "-",
        ]
      : ["api", "--method", "POST", `/repos/${repo}/rulesets`, "--input", "-"]
    gh({ args, input: ruleset })
  }

  process.stdout.write("Pinning merge settings to squash-only\n")
  if (!isDryRun) {
    gh({
      args: ["api", "--method", "PATCH", `/repos/${repo}`, "--input", "-"],
      input: MERGE_SETTINGS,
    })
  }

  process.stdout.write("Done.\n")
}

main()
