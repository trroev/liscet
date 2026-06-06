# `storybook`

[Storybook 10](https://storybook.js.org) workshop for the design system —
hosts stories for [`@repo/ui`](../../packages/ui/README.md) and
[`@repo/chrome`](../../packages/chrome/README.md) plus a couple of app-level
welcome/tokens stories living in `src/`. Wired up via
[`@repo/storybook-config`](../../packages/storybook-config/README.md).

## Run locally

From the repo root:

```sh
pnpm --filter storybook dev            # http://localhost:6006
```

Or from this directory:

```sh
pnpm dev
```

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Storybook dev server on `:6006` |
| `pnpm build` | Static build to `storybook-static/` |
| `pnpm typecheck` | `tsc --noEmit` |

## Adding a story

Stories live next to the component they exercise. Component stories live in
the component's package (e.g. `packages/ui/src/components/Button/button.stories.tsx`);
this app only hosts cross-package or app-level stories like `tokens.stories.tsx`
and `welcome.stories.tsx`.
