# next-payload-starter

A Turborepo monorepo starter for content-driven web apps. Bundles Next.js 16, PayloadCMS 3, better-auth, Postgres, Tailwind v4, Vitest, Storybook, and Biome — all wired up with the conventions, import boundaries, and CI scaffolding that make a fresh project usable in minutes instead of weeks.

The `posts` collection and `/posts` routes are a deliberately skeletal example demonstrating the feature-folder layout — adapt or replace per project.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| CMS | PayloadCMS 3 (embedded) + `@payloadcms/plugin-seo` + live preview |
| Database | Postgres (local Docker or hosted, e.g. Neon) |
| Auth | better-auth |
| Images | Cloudinary (optional, custom Payload storage adapter) |
| Styling | TailwindCSS v4 |
| Headless UI | Base UI |
| Forms | TanStack Form |
| Validation | Zod |
| Pattern matching | ts-pattern |
| Linting / formatting | Biome (via ultracite) |
| Component workshop | Storybook |
| Testing | Vitest, Playwright |
| Hosting | Vercel (single deployment, Payload embedded) |

---

## Getting started

Spin up a new repo from this template:

```sh
gh repo create my-app --template trroev/next-payload-starter --public
cd my-app
pnpm install
docker compose up -d postgres          # local Postgres on :5432
pnpm dev                               # first run trusts a local CA (sudo); app at https://liscet.localhost
```

> `pnpm dev` serves over HTTPS on `.localhost` domains via [portless](#local-dev-domains-portless). To stay on plain `http://localhost:3000`, run `PORTLESS=0 pnpm dev`.

### Prerequisites

- Node.js ≥ 24
- pnpm (managed via corepack — `corepack enable`)
- Docker (for local Postgres)

### Environment

Env loading goes through [dotenvx](https://dotenvx.com) (`--convention=nextjs`). The committed `apps/web/.env.development` ships **working dummy defaults** — a local Postgres URL, dev-only secrets — so a fresh clone runs `pnpm dev` with no env setup. Override anything per-machine in the gitignored `apps/web/.env.development.local` (or `.env.local`); those win over the committed defaults.

The dev-only `PAYLOAD_SECRET` / `BETTER_AUTH_SECRET` are placeholders — **replace them before deploying anywhere real.** For shared or production secrets, put real values in `apps/web/.env.production` (or `.env.development`) and encrypt them in place:

```sh
cd apps/web
dotenvx encrypt -f .env.production
```

This generates `apps/web/.env.keys` (the private decryption key, gitignored) and rewrites the env file with encrypted ciphertext. Commit the encrypted file; **never commit `.env.keys`** — keep it in your password manager. To add or update a secret later:

```sh
dotenvx set SOME_SECRET "value" -f .env.production
```

Each `@repo/env/<subsystem>` module validates only the keys it owns; see [`packages/env/README.md`](./packages/env/README.md) for the subpath map.

### Local dev domains (portless)

`pnpm dev` and `pnpm storybook` serve over HTTPS on stable `.localhost` domains via [portless](https://portless.sh) — a catalogued dev dependency, so `pnpm install` is all the setup required (no global install):

| App           | URL                              |
| ------------- | -------------------------------- |
| web           | <https://liscet.localhost>       |
| Payload admin | <https://liscet.localhost/admin> |
| Storybook     | <https://storybook.localhost>    |

portless runs a reverse proxy on `:443`. The root `predev`/`prestorybook` hooks start it automatically; on first run it generates and trusts a local CA (prompts for `sudo` on macOS to bind `:443`) so there are no browser warnings. Requires Node 24+ (already the floor).

To stay on plain `http://localhost:3000` instead — e.g. if you can't trust the CA — bypass portless:

```sh
PORTLESS=0 pnpm dev
```

In bypass mode the app serves on `localhost:3000`; for auth flows there, override `BASE_URL` / `BETTER_AUTH_URL` to match in `apps/web/.env.development.local`.

### Database (Postgres)

Payload and Better Auth share one Postgres connection, configured via `DATABASE_URL` in the env files. `docker-compose.yml` ships a local `postgres` service (`:5432`) — start it with `docker compose up -d postgres`. Production deploys point at a managed Postgres (e.g. a Neon database).

### Migrations

The model is **auto-push in dev, versioned migrations in production**:

- **Local dev** — Payload auto-pushes its schema on boot; sync the Better Auth tables once with:

  ```sh
  pnpm dotenvx run -f apps/web/.env.development -- pnpm --filter @repo/auth exec drizzle-kit push
  ```

  The `dotenvx run -f apps/web/.env.development` wrapper is required: `drizzle-kit` invoked standalone doesn't read the app env file the way the Next.js dev server does, so without it `DATABASE_URL` is empty, the command silently no-ops, and sign-in then fails with Postgres `relation "user" does not exist`. (The bare `db:push`/`db:migrate` scripts only work if `DATABASE_URL` is already exported in your shell.)
- **Production** — `pnpm migrate` applies pending Payload *and* Better Auth migrations. `apps/web/vercel.json` runs it ahead of the build, so a deploy migrates before serving traffic. There `DATABASE_URL` comes from the platform env, so the root dotenvx wrapper finding no local file is fine.

Initial migrations are committed in `packages/payload/src/migrations` and `packages/auth/drizzle`. After changing a collection or the auth schema, regenerate and commit:

```sh
pnpm --filter web migrate:create <name>            # Payload (Postgres)
pnpm --filter @repo/auth exec drizzle-kit generate # Better Auth
```

> **Preview deploys run the build command too.** Point each preview at its own database (e.g. a Neon branch) so a preview build never migrates the production schema.

---

## Repository structure

```
next-payload-starter/
├── apps/
│   ├── web/                  # Next.js 16 + PayloadCMS — the deployable
│   ├── storybook/            # Component workshop
│   └── e2e/                  # Playwright suite driving apps/web
├── packages/
│   ├── auth/                 # better-auth configuration
│   ├── chrome/               # App shell (header, nav, user menu)
│   ├── env/                  # Per-subsystem env validation
│   ├── logger/               # Structured logger (pino via LogLayer)
│   ├── payload/              # Payload collections, hooks, adapters
│   ├── storybook-config/     # Shared Storybook preview
│   ├── tailwind/             # Tailwind v4 preset + design tokens
│   ├── testing/              # Vitest config, MSW handlers, factories
│   ├── tsconfig/             # Shared TypeScript configs
│   ├── types/                # Shared TypeScript types
│   ├── ui/                   # Base UI–wrapped component library
│   └── utils/                # Pure helpers
├── tooling/
│   └── github/               # Composite GitHub Actions
└── docs/
    ├── north-star.md
    └── decisions/            # Investigation outcomes (#27, #28, #29, …)
```

Per-package READMEs:

- Apps — [`web`](./apps/web/README.md), [`storybook`](./apps/storybook/README.md), [`e2e`](./apps/e2e/README.md)
- Packages — [`auth`](./packages/auth/README.md), [`chrome`](./packages/chrome/README.md), [`env`](./packages/env/README.md), [`logger`](./packages/logger/README.md), [`payload`](./packages/payload/README.md), [`storybook-config`](./packages/storybook-config/README.md), [`tailwind`](./packages/tailwind/README.md), [`testing`](./packages/testing/README.md), [`tsconfig`](./packages/tsconfig/README.md), [`types`](./packages/types/README.md), [`ui`](./packages/ui/README.md), [`utils`](./packages/utils/README.md)
- CI — [`tooling/github`](./tooling/github/README.md)

### Import boundaries

Layered dependencies are enforced by Biome's `noRestrictedImports` rule in `biome.json`:

- `packages/{utils,types,env,logger}` may not import from `packages/{ui,chrome,payload,auth}`
- `packages/ui` may not import from `packages/{chrome,payload}` or any app
- `packages/chrome` may not import from any app
- `apps/web/src/features/**` may not import via the `~/features/*` alias at all (cross-feature imports are banned, and intra-feature imports must use relative paths) and may not import from `~/app/**`

**Adding a new feature requires no `biome.json` edits** — the single `apps/web/src/features/**` override applies to every feature.

`pnpm boundaries` (Turborepo's `turbo boundaries`, run in the CI lint job) complements Biome by catching imports of packages **not declared** in a `package.json`. See [`tooling/github/README.md`](./tooling/github/README.md) for the full CI layout.

---

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start all apps in watch mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Check linting and formatting (Biome via ultracite) |
| `pnpm lint:fix` | Auto-fix lint and formatting issues |
| `pnpm format` | Check formatting only |
| `pnpm format:fix` | Auto-fix formatting |
| `pnpm typecheck` | Type-check all packages |
| `pnpm test` | Run test suite |
| `pnpm coverage` | Run tests with coverage |
| `pnpm boundaries` | `turbo boundaries` — undeclared-dep check |
| `pnpm catalog:check` | Fail if a `package.json` pins a catalogued dep |
| `pnpm generate:types` | Regenerate Payload-generated TS types |

---

## Logging

`@repo/logger` is the sanctioned logging primitive; `console.*` is banned by Biome's `noConsole` rule. See [`packages/logger/README.md`](./packages/logger/README.md).

## ISR revalidation

Post pages are statically rendered and revalidated on demand via a Payload `afterChange` hook. See [`packages/payload/README.md`](./packages/payload/README.md#isr-revalidation) for the request shape and retry behavior.

---

## CI

`.github/workflows/ci.yml` runs on every PR and on pushes to `main`. The composite actions in `tooling/github/ci/` enforce:

- Clean lockfile (`pnpm install --frozen-lockfile`)
- Fresh Payload types (`payload generate:types` + `git diff --exit-code`)
- Lint, type-check, tests, and a successful build
- Codecov upload — patch coverage gate at 80% (configured in `codecov.yml`)

`SKIP_ENV_VALIDATION=true` is set for the steps that touch the Payload config so they don't require real credentials. See [`tooling/github/README.md`](./tooling/github/README.md) for per-action detail.

### Remote caching (optional)

CI and local builds can share a Turborepo cache via [Vercel Remote Cache](https://turborepo.com/docs/core-concepts/remote-caching). It's **off by default** — the template ships without a Vercel project, so `ci.yml` reads `TURBO_TOKEN` / `TURBO_TEAM` that don't exist yet and turbo simply logs `Remote caching disabled` and falls back to local caching. CI still passes.

To enable it in your fork:

1. Get your Vercel **team slug** (Vercel → Settings → General) — this is `TURBO_TEAM`. A team is enough; you don't need a deployed project.
2. Create a token: `npx turbo login && npx turbo link`, or Vercel → Account Settings → Tokens.
3. In GitHub → Settings → Secrets and variables → Actions, add:
   - Secret `TURBO_TOKEN` = the token
   - Variable `TURBO_TEAM` = the team slug
4. Push, let CI run once to seed the cache, then push again — the lint/type-check/test/coverage jobs should show remote cache hits.

---

## Deployment

The app deploys as a single Vercel project. Payload's embedded architecture means no separate server process.

```sh
turbo run build --filter=web
```

See `apps/web/vercel.json` for the build command Vercel uses. That file also sets `ignoreCommand` to `npx turbo-ignore web`, so Vercel skips the build whenever a push doesn't touch `web` or anything in its dependency graph — no dashboard configuration required. `turbo-ignore` is pinned as a root devDependency for deterministic builds.
