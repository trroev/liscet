# `@repo/testing`

Shared [Vitest](https://vitest.dev) configuration, MSW handlers, fixture
factories, and a `renderWithProviders` helper that wraps components in
`SessionProvider` from [`@repo/auth`](../auth/README.md).

**Layer position:** dev-time tooling. May import from `@repo/auth` (to wire
`SessionProvider`); not consumed by any production runtime.

## Exports

| Subpath | Owns |
|---|---|
| `@repo/testing/vitest.shared` | Base Vitest config; spread into per-package `vitest.config.ts` |
| `@repo/testing/render` | `renderWithProviders(ui, options)`, `userEvent`, Next.js navigation factories |
| `@repo/testing/factories` | Typed fixture factories (`postFixture`, `userFixture`, …) |
| `@repo/testing/msw` | Shared MSW request handlers |
| `@repo/testing/msw/setup` | MSW server setup for Vitest |

## Usage

```ts
// vitest.config.ts in a consuming package
import { defineConfig, mergeConfig } from "vitest/config"
import shared from "@repo/testing/vitest.shared"

export default mergeConfig(shared, defineConfig({
  test: { environment: "jsdom" },
}))
```

```tsx
import { renderWithProviders, userEvent } from "@repo/testing/render"

const { getByRole } = renderWithProviders(<SignInForm />, {
  initialUser: null,
})
```

## Constraints

- `@repo/auth` is a runtime dep, so this package pulls in MongoDB transitively.
  That is fine in test environments; do not import it from production code.
- `vitest` is a peer dep — install it in the consuming package.
