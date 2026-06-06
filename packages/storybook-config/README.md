# `@repo/storybook-config`

Shared [Storybook 10](https://storybook.js.org) preview configuration used by
`apps/storybook`. Wires the Tailwind preset, a dark-mode decorator driven by
the `theme` global, and Storybook's `controls` matchers.

**Layer position:** dev-time tooling. Imports [`@repo/tailwind`](../tailwind/README.md);
no other workspace dependencies.

## Exports

| Subpath | Owns |
|---|---|
| `@repo/storybook-config/preview` | `preview` — pass to `definePreview()` consumers |

## Usage

```ts
// apps/storybook/.storybook/preview.ts
export { preview as default } from "@repo/storybook-config/preview"
```

The exported `preview` toggles `<html class="dark">` based on the `theme`
global and applies the `font-sans` class so stories render with the repo's
font stack.
