# @repo/emails

React Email templates and the typed Resend send helper.

## Layout

```
src/
  layouts/    base layout(s) shared by every email
  templates/  one PascalCase directory per email type (added in M6, #35)
  send.ts     typed Resend wrapper
  webhook.ts  Svix-verified Resend webhook parser
```

## Sending

`send.ts` validates the payload with a Zod schema before handing it to Resend's
`emails.send()`, so callers cannot send with a missing `to`, `subject`, or
`react` element. `from` is optional — it defaults to `RESEND_FROM_ADDRESS` and
can be overridden per call.

```ts
import { sendEmail } from "@repo/emails/send"
import { BaseLayout } from "@repo/emails/layouts/BaseLayout"

const { data, error } = await sendEmail({
  to: "user@example.com",
  subject: "Welcome",
  react: <BaseLayout previewText="Welcome">…</BaseLayout>,
})
```

The Resend client reads `RESEND_API_KEY` and `RESEND_FROM_ADDRESS` from
`@repo/env/email`.

The base layout wraps every email in a consistent shell: a Liscet wordmark
header (override via the `logo` prop), the body content, and a footer carrying
the state-board compliance disclaimer and an unsubscribe link (override via the
`unsubscribeUrl` prop).

## Webhooks

`webhook.ts` exposes `verifyResendWebhook` — it validates the Svix signature
headers Resend sends and returns the parsed event, throwing on an invalid
signature or unexpected shape. The app's handler lives at
`apps/web/src/app/api/resend/webhook/route.ts`; it logs hard bounces and
complaints (Resend maintains the suppression list automatically) and reads
`RESEND_WEBHOOK_SECRET` from `@repo/env/email`.

## Preview

```sh
pnpm email:preview          # from the repo root
pnpm --filter @repo/emails email:preview
```

Runs React Email's `email dev` server against `./src`. Each previewable email is
discovered by its **default export** — the repo-wide `noDefaultExport` Biome rule
is scoped off for `packages/emails/src/**` for exactly this reason.
