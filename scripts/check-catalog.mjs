#!/usr/bin/env node
//
// Enforce the pnpm catalog convention: any dep that the catalog owns must be
// referenced as `catalog:` / `catalog:peers` in a workspace package.json, never
// pinned to a literal version. #22 centralized the most-shared external deps
// into a catalog so their versions live in one place; without this check a new
// package (or a careless edit) could re-declare `"react": "^19.2.0"` and
// silently reintroduce the per-package drift the catalog exists to eliminate —
// and it would pass CI today.
//
// The set of catalogued dep names is read straight from pnpm-workspace.yaml via
// the `yaml` package, so the check tracks catalog changes automatically. pnpm's
// native `catalogMode: strict` is deliberately not used: it would force *every*
// dep into a catalog, where the convention targets only the catalog's own keys.

import { globSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { parse as parseYaml } from "yaml"

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..")

// A `catalog:` reference is the bare protocol; a named catalog adds the catalog
// name (e.g. `catalog:peers`). Both are valid; a literal semver string is not.
const CATALOG_REFERENCE = /^catalog:/

/**
 * Collect every dep name owned by the catalog from pnpm-workspace.yaml — the
 * union of the default `catalog` map and every named map under `catalogs`.
 */
const readCatalogDepNames = () => {
  const doc = parseYaml(
    readFileSync(join(repoRoot, "pnpm-workspace.yaml"), "utf8")
  )

  const names = new Set(Object.keys(doc.catalog ?? {}))
  for (const group of Object.values(doc.catalogs ?? {})) {
    for (const dep of Object.keys(group ?? {})) {
      names.add(dep)
    }
  }
  return names
}

const DEP_FIELDS = ["dependencies", "devDependencies", "peerDependencies"]

const main = () => {
  const catalogDeps = readCatalogDepNames()

  const packageFiles = globSync("**/package.json", {
    cwd: repoRoot,
    exclude: (path) => path.includes("node_modules"),
  })

  const violations = []

  for (const relativePath of packageFiles) {
    const pkg = JSON.parse(readFileSync(join(repoRoot, relativePath), "utf8"))
    const name = pkg.name ?? relativePath

    for (const field of DEP_FIELDS) {
      const deps = pkg[field]
      if (!deps) {
        continue
      }

      for (const [dep, version] of Object.entries(deps)) {
        if (catalogDeps.has(dep) && !CATALOG_REFERENCE.test(version)) {
          violations.push({ name, field, dep, version })
        }
      }
    }
  }

  if (violations.length > 0) {
    for (const { name, field, dep, version } of violations) {
      process.stderr.write(
        `${name}: "${dep}": "${version}" in ${field} must be "catalog:" (or "catalog:<name>")\n`
      )
    }
    process.stderr.write(
      `\n${violations.length} catalog violation(s) found. Replace the literal version with a catalog reference.\n`
    )
    process.exit(1)
  }

  process.stdout.write(
    `Catalog check passed: ${catalogDeps.size} catalogued dep(s), no literal overrides.\n`
  )
}

main()
