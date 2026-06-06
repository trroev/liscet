# `@repo/chrome`

App-shell components used by `apps/web` and `apps/storybook`: the top-level
`AppShell`, the responsive `MobileNav` and `MobileAuth` drawers, the `UserMenu`
dropdown, and small Cloudinary-URL utilities. Built on top of
[`@repo/ui`](../ui/README.md) primitives.

**Layer position:** upper. May import from `@repo/ui`, `@repo/payload`,
`@repo/types`, `@repo/utils`. May **not** import from any app — Biome's
`noRestrictedImports` enforces this.

## Exports

| Subpath | Owns |
|---|---|
| `@repo/chrome/components/AppShell` | `<AppShell>` |
| `@repo/chrome/components/MobileNav` | `<MobileNav>` |
| `@repo/chrome/components/MobileAuth` | `<MobileAuth>` |
| `@repo/chrome/components/UserMenu` | `<UserMenu>` |
| `@repo/chrome/utils/transformCloudinary` | `transformCloudinary(url, opts)` |

## Usage

```tsx
import { AppShell } from "@repo/chrome/components/AppShell"

export default function RootLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
```

## Constraints

- Chrome components assume Tailwind tokens from
  [`@repo/tailwind`](../tailwind/README.md) are loaded by the consuming app.
- Importing this package pulls in [`@repo/payload`](../payload/README.md)'s
  collection types — Node/SSR friendly, not edge-runtime tested.
