# `@repo/ui`

Shared React component primitives — thin wrappers over [Base UI](https://base-ui.com),
styled with Tailwind v4 and `tailwind-variants`. Used by `@repo/chrome`,
`apps/web`, and `apps/storybook`.

**Layer position:** middle-foundation. May import from `@repo/utils` only. May
**not** import from `@repo/chrome`, `@repo/payload`, or any app.

## Exports

`@repo/ui/components/<Name>` for each component directory under `src/components/`:
`Avatar`, `Badge`, `Button`, `Card`, `Checkbox`, `Dialog`, `Field`, `Input`,
`Label`, `Menu`, `NavigationMenu`, `Pagination`, `RadioGroup`, `Select`,
`Separator`, `Skeleton`, `Spinner`, `Switch`, `Tabs`, `Textarea`, `Toggle`,
`ToggleGroup`, `Tooltip`.

Plus shared helpers:

| Subpath | Owns |
|---|---|
| `@repo/ui/utils/cn` | `cn(...)` — `clsx` + `twMerge` with the repo's tailwind-merge config |
| `@repo/ui/utils/tv` | `tv(...)` — `tailwind-variants` pre-configured |
| `@repo/ui/utils/twMergeConfig` | Shared `tailwind-merge` config |
| `@repo/ui/test/axe`, `@repo/ui/test/setup` | Vitest test helpers for component packages |

## Usage

```tsx
import { Button } from "@repo/ui/components/Button"
import { cn } from "@repo/ui/utils/cn"

<Button variant="primary" className={cn("w-full", className)}>
  Sign in
</Button>
```

## Conventions

- One component per PascalCase directory; files inside are kebab-case
  (`button.tsx`, `button.variants.ts`, `index.ts`). Variant configs live in
  `<name>.variants.ts` only when the component takes variants.
- Cross-directory imports use the package alias (`@repo/ui/utils/cn`); siblings
  inside the same directory use relative `./` imports.
