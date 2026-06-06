# `@repo/tailwind`

Tailwind v4 preset for the monorepo: the base import, design-token theme,
custom utilities, and a `@source` glob that scans every workspace `src/` so
classes used in shared packages survive tree-shaking.

**Layer position:** foundation (asset-only). Imported as a CSS side-effect; no
runtime JS.

## Exports

| Subpath | Owns |
|---|---|
| `@repo/tailwind` | `tailwind.css` (default) — entry that pulls in `tailwind.theme.css` and `tailwind.utilities.css` |

## Usage

```ts
// apps/web/src/app/globals.css or storybook preview
import "@repo/tailwind"
```

That single import gives consumers:

- Tailwind v4's base layer
- The design-token theme (`--color-neutral-*`, `--color-accent-*`, `--color-sage-*`, semantic tokens)
- Repo-specific utilities defined in `tailwind.utilities.css`

## Constraints

- Color steps `50`–`900` for the `neutral`, `accent`, and `sage` scales are
  safelisted so `var(--color-accent-50)` etc. resolves even when not directly
  referenced. Add new scales to the `@source inline(...)` directive in
  `src/tailwind.css` to keep that guarantee.
- The `@source "../../**/src/**/**"` glob is relative to
  `packages/tailwind/src/` — moving this file requires updating the glob.
