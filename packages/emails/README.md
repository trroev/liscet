# @repo/emails

React Email templates and the typed Resend send helper.

## Layout

```
src/
  layouts/    base layout(s) shared by every email
  templates/  one PascalCase directory per email type (added in M6, #35)
  send.ts     typed Resend wrapper
```

## Sending

`send.ts` validates the payload with a Zod schema before handing it to Resend's
`emails.send()`, so callers cannot send with a missing `from`, `to`, `subject`,
or `react` element.

```ts
import { sendEmail } from "@repo/emails/send"
import { BaseLayout } from "@repo/emails/layouts/BaseLayout"

const { data, error } = await sendEmail({
  from: "noreply@example.com",
  to: "user@example.com",
  subject: "Welcome",
  react: <BaseLayout previewText="Welcome">…</BaseLayout>,
})
```

The Resend client reads `RESEND_API_KEY` from `@repo/env/email`.

## Preview

```sh
pnpm email:preview          # from the repo root
pnpm --filter @repo/emails email:preview
```

Runs React Email's `email dev` server against `./src`. Each previewable email is
discovered by its **default export** — the repo-wide `noDefaultExport` Biome rule
is scoped off for `packages/emails/src/**` for exactly this reason.
