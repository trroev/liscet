# `@repo/auth`

[better-auth](https://www.better-auth.com) configuration for the starter. Wraps
the server-side `betterAuth(...)` factory, exposes a typed React client with a
friendlier `{ status, ... }` result shape, and ships a thin `SessionProvider` /
`useSession` pair seeded by the server.

**Layer position:** mid. Imports from foundation packages only (`@repo/env`).
Consumed by `apps/web` and `@repo/testing` (for `renderWithProviders`).

## Exports

| Subpath | Owns |
|---|---|
| `@repo/auth` | `createAuth(extraOptions?)`, the shared `auth` singleton, `Session` / `User` types |
| `@repo/auth/client` | `authClient` (`signIn.email`, `signIn.social`, `signUp.email`), `AuthResult<T>` |
| `@repo/auth/session` | `<SessionProvider>` (client), `useSession()` |
| `@repo/auth/social-providers` | `SOCIAL_PROVIDERS`, `SocialProvider` — the OAuth providers enabled and trusted for linking |

## Usage

```ts
// Server: validate a session in a Server Component / route handler
import { auth } from "@repo/auth"

const session = await auth.api.getSession({ headers })
```

```ts
// Client: typed wrapper that returns { status, ... } instead of throwing
import { signInEmail } from "@repo/auth/client"

const result = await signInEmail({ email, password })
if (result.status === "error") setFormError(result.friendlyMessage)
```

```tsx
// Hydrate session context from the server on every request
import { SessionProvider } from "@repo/auth/session"

<SessionProvider initialUser={user}>{children}</SessionProvider>
```

## Constraints

- `DATABASE_URL` is validated by [`@repo/env/database`](../env/README.md) and
  `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` / `GOOGLE_CLIENT_ID` /
  `GOOGLE_CLIENT_SECRET` by [`@repo/env/auth`](../env/README.md).
  Importing this package eagerly opens a Postgres pool — Node-only.
- Google is the only social provider. `account.accountLinking` is enabled with
  `trustedProviders: SOCIAL_PROVIDERS`, so a Google sign-in whose **verified**
  email matches an existing email/password user links to that user instead of
  creating a duplicate. Only add providers that guarantee a verified-email
  claim to `SOCIAL_PROVIDERS`.
- Server actions invoked from the client rely on Next.js 16's same-origin /
  `Origin`-header CSRF check; no custom CSRF token layer.
