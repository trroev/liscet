# Renovate (Mend cloud app) for dependency updates

We adopt **Renovate**, hosted via the Mend GitHub App, as the single tool for keeping both npm packages and GitHub Actions current — replacing the Actions-only `dependabot.yml`, which is deleted. The deciding factor is that most shared deps are versioned once in `pnpm-workspace.yaml` under `catalog:` / `catalogs.peers`, and Renovate has native pnpm-catalog support that Dependabot lacks; consolidating on one bot also gives a single dependency dashboard across the 19-package monorepo.

## Considered options

- **Dependabot** — already half-configured here, no new service, but effectively blind to the pnpm catalog, so it would leave the majority of shared deps unmanaged. Rejected on catalog support.
- **`taze`** (scheduled workflow) — catalog-aware and dead simple, but one bulk PR with no per-group automerge, no vulnerability alerts, and no dashboard. Rejected on control/visibility.
- **Renovate / Mend cloud app** — chosen.

## Consequences

- **Automerge requires a bot bypass on the review ruleset.** `main: review` requires 1 approving review, which a bot cannot self-supply. The Renovate app is therefore added as a `pull_request` bypass actor on **`main: review` only** (`.github/rulesets/main-review.json`). It is deliberately **not** added to `main: merge protection` — so the bot still cannot skip CI or signed commits. This extends the existing invariant: "an admin may merge solo but may never skip CI or signing" now also binds the bot. The bypass entry uses `actor_id: 2740` (the Mend Renovate GitHub App id on github.com) — verify this against the installed app before running `pnpm rulesets:apply`.
- **Signed commits are satisfied** because Mend commits through GitHub's API, which GitHub marks verified.
- **Automerge is scoped to what the suite can vouch for.** Testing tooling (minor/patch) and GitHub Actions (minor/patch) automerge; Storybook automerges patch-only (SB 10.3.6 has broken CSF factory globalTypes before). Everything that can change generated types, the DB schema, or runtime behavior — the `payload`/`@payloadcms/**` group, the `drizzle`/`pg` group, the React/Next peers, and runtime singles — always waits for a human, because a Payload bump can regenerate the committed `payload-types.ts` (failing the `git diff` gate) or require a migration.
