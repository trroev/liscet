# `@repo/types`

Shared TypeScript types that don't belong to any one runtime package. One type
per PascalCase directory under `src/<TypeName>/index.ts`, imported as
`@repo/types/<TypeName>`. There is no barrel — `src/index.ts` is intentionally
empty to keep the package buildable while scaffolded.

**Layer position:** foundation. Types-only; no runtime code. No imports from
`ui`, `chrome`, `payload`, `auth`.

## Exports

| Subpath | Owns |
|---|---|
| `@repo/types/ActionResult` | `ActionResult<TData>` — discriminated union for server-action returns |
| `@repo/types/HeaderAuth` | Header-auth slot types for `@repo/chrome` |

## Usage

```ts
import type { ActionResult } from "@repo/types/ActionResult"

export const submitAction = async (input: FormData): Promise<ActionResult<Post>> => {
  // ...
}
```

## Adding a type

1. Create `src/<TypeName>/index.ts` with named `export type`s only.
2. Do **not** add it to `src/index.ts` — consumers import via the subpath.
