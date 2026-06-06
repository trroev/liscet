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
| `@repo/auth/client` | `authClient`, `signIn*`, `signUp*`, `signOut`, `AuthResult<T>` |
| `@repo/auth/session` | `<SessionProvider>` (client), `useSession()` |

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

- `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` are validated by
  [`@repo/env/auth`](../env/README.md). Importing this package eagerly opens a
  Mongo client — Node-only.
- Server actions invoked from the client rely on Next.js 16's same-origin /
  `Origin`-header CSRF check; no custom CSRF token layer.
