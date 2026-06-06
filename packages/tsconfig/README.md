# `@repo/tsconfig`

Shared TypeScript base configurations. Every workspace package extends one of
these so compiler options (target, module resolution, strictness, JSX) are
owned in a single place.

**Layer position:** foundation (config-only). No runtime code.

## Exports

| Subpath | Use for |
|---|---|
| `@repo/tsconfig/base.json` | Library code with no DOM / JSX (utils, env, types) |
| `@repo/tsconfig/library.json` | Library code with React (`ui`, `chrome`, `testing`) |
| `@repo/tsconfig/nextjs.json` | Next.js apps (`apps/web`) |

## Usage

```jsonc
// packages/<name>/tsconfig.json
{
  "extends": "@repo/tsconfig/library.json",
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```
