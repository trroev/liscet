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
- The design-token theme: color scales (`--color-neutral-*`, `--color-accent-*`, `--color-sage-*`) and the semantic token set (`background`, `surface`, `surface-raised`, `border`, `border-strong`, `text-primary/secondary/muted`, `accent` + `-hover` + `-foreground`, `secondary` + `-hover` + `-foreground`, and status colors `success` / `warning` / `info` / `destructive` each with `-hover` + `-foreground`)
- Repo-specific utilities defined in `tailwind.utilities.css`

## Dark mode

Semantic tokens resolve via two themes: `:root` (light, default) and
`[data-theme="dark"]`. Toggle by setting the attribute on any ancestor (the
app wires this through `next-themes` configured with `attribute="data-theme"`).

## Constraints

- Color steps `50`–`900` for the `neutral`, `accent`, and `sage` scales are
  safelisted so `var(--color-accent-50)` etc. resolves even when not directly
  referenced. Add new scales to the `@source inline(...)` directive in
  `src/tailwind.css` to keep that guarantee.
- The `@source "../../**/src/**/**"` glob is relative to
  `packages/tailwind/src/` — moving this file requires updating the glob.
