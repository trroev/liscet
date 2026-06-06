#!/usr/bin/env bash
#
# Remove every node_modules directory in the monorepo (root + all workspaces).
#
# This is the deliberate exception to the "package tasks, not root tasks" rule:
# Turborepo runs *from* node_modules and cannot reliably delete its own runtime,
# so node_modules removal must happen outside turbo. Build outputs and local
# caches are cleaned separately by `turbo run clean` (see each package's `clean`
# script); this script intentionally depends on neither turbo nor node_modules
# being importable, so it can be run directly to recover a poisoned install.
#
# It must NEVER use `git clean -xdf`, which would also delete untracked files
# such as .env / .env.* — it targets only node_modules. `rm -rf` is a no-op on
# absent paths, so the script is idempotent and safe to re-run.
set -euo pipefail

# Resolve the repo root from this script's location so it works from any cwd.
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

# Remove node_modules in every workspace package. pnpm discovers packages from
# pnpm-workspace.yaml and the pnpm binary itself does not live in node_modules,
# so this works even when a workspace's node_modules is broken or missing. Each
# command runs with cwd set to its package, so `node_modules` is package-local.
pnpm -r exec rm -rf node_modules

# Remove the root node_modules last (pnpm -r exec does not touch the root).
rm -rf node_modules

echo "Removed all node_modules. Run 'pnpm install' to reconstruct the workspace."
