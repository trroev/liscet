# @repo/vitest-config

The shared Vitest defaults for the monorepo, in a dependency-free leaf package.

It declares no `workspace:*` dependencies so **any** package that runs Vitest —
including `@repo/testing` and `@repo/auth`, which sit upstream of the runtime
test helpers — can extend it without creating a workspace dependency cycle.

```ts
import { sharedConfig } from "@repo/vitest-config"
import { mergeConfig } from "vitest/config"

export default mergeConfig(sharedConfig, {
  test: { environment: "jsdom" },
})
```

`sharedConfig` sets the Node environment, globals, `passWithNoTests`, and a
valid `BASE_URL` placeholder (see `base-url-env.test.ts` for why). Runtime test
helpers — React render utilities, factories, MSW handlers — live in
`@repo/testing`, not here.
