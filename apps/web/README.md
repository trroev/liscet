# `web`

The Next.js 16 + PayloadCMS 3 application — the single deployable in this
monorepo. Payload is embedded (no separate server process) and exposes its
admin UI at `/admin`. Pages live under `src/app/`, feature modules under
`src/features/`, and shared chrome / UI come from
[`@repo/chrome`](../../packages/chrome/README.md) and
[`@repo/ui`](../../packages/ui/README.md).

For the full stack overview, getting-started flow, and env handling, see the
[repo root README](../../README.md).

## Run locally

From the repo root:

```sh
pnpm install
docker compose up -d                   # local MongoDB on :27017
pnpm dev                               # this app on :3000, admin at /admin
```

Or from this directory:

```sh
pnpm dev
```

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Next.js dev server with Turbopack |
| `pnpm build` | Production build (Next + Payload bundled together) |
| `pnpm start` | Run the production build |
| `pnpm typecheck` | `next typegen` then `tsc --noEmit` |
| `pnpm generate:types` | Regenerate `packages/payload/src/types/payload-types.ts` (commit the result) |
| `pnpm generate:importmap` | Regenerate Payload admin import map |
| `pnpm test` | Vitest |

`pnpm with-env <cmd>` is the shared wrapper for `dotenvx run
--convention=nextjs --`. The `postinstall` hook runs `generate:types` and
`generate:importmap` automatically when `.env.keys` is present and `$CI` is
unset.

## Layout

- `src/app/` — App Router routes, layouts, and the Payload admin mount.
- `src/features/<name>/` — Self-contained feature modules. Cross-feature
  imports are banned by Biome's `noRestrictedImports`; intra-feature imports
  use relative paths only.
- `src/components/` — Shared in-app components that don't fit a single feature.
- `src/lib/` — App-local helpers (server actions, auth glue).

## Deployment

This app deploys as a single Vercel project; see
[`vercel.json`](./vercel.json) and the root README's "Deployment" section. The
embedded-Payload architecture means no separate server.
