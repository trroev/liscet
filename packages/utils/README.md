# `@repo/utils`

Pure helper functions — no React, no I/O, no env access. One utility per
camelCase directory under `src/<name>/index.ts`, imported as
`@repo/utils/<name>`. There is no barrel.

**Layer position:** foundation. No imports from `ui`, `chrome`, `payload`,
`auth`.

## Exports

| Subpath | Owns |
|---|---|
| `@repo/utils/formatDuration` | `formatDuration(minutes: number): string` |
| `@repo/utils/validateExternalUrl` | URL validator for outbound link fields |

## Usage

```ts
import { formatDuration } from "@repo/utils/formatDuration"

formatDuration(75) // "1 hr 15 min"
```

## Adding a utility

1. Create `src/<utilName>/index.ts` and a sibling `src/<utilName>/index.test.ts`.
2. Use named exports only.
3. Prefer [`ts-pattern`](https://github.com/gvergnaud/ts-pattern) over chained
   `if`/`switch` so exhaustiveness is checked at compile time.
