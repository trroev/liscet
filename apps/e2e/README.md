# `@repo/e2e`

[Playwright](https://playwright.dev) end-to-end suite that drives
[`apps/web`](../web/README.md). The Playwright config boots `apps/web` via
`pnpm build && pnpm start`, provisions a per-run Postgres database (creating
the schema by replaying the production migrations), and tears it down on exit.

## Run locally

```sh
pnpm --filter @repo/e2e e2e            # headless
pnpm --filter @repo/e2e e2e:ui         # Playwright UI mode
```

The first run downloads browsers. Tests assume Docker Postgres is up
(`docker compose up -d postgres` from the repo root) — `playwright.config.ts`
creates a uniquely-named scratch database against `DATABASE_URL`'s host and
runs migrations into it before launching the web server.

## Scripts

| Script | Description |
|---|---|
| `pnpm e2e` | Run the suite (headless) |
| `pnpm e2e:ui` | Run with Playwright's UI runner |
| `pnpm typecheck` | `tsc --noEmit` |

## Layout

- `src/e2e/` — Test specs.
- `src/page-objects/` — Page-object wrappers around the app's screens.
- `src/fixtures/` — Per-run Postgres provisioning, env resolution, seed factories.
- `global-setup.ts` / `global-teardown.ts` — One-time provisioning hooks
  referenced by `playwright.config.ts`.

CI runs this suite via `tooling/github/ci/e2e/action.yml`.
