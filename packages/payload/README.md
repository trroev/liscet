# `@repo/payload`

Embedded [PayloadCMS 3](https://payloadcms.com) configuration for the starter:
collections, access control, hooks, the Payload config factory, and a Cloudinary
storage adapter wired to the `media` collection. Generated TS types
(`src/types/payload-types.ts`) are committed; regenerate with
`pnpm generate:types` from `apps/web` after editing collections.

**Layer position:** mid. Imports from foundation packages (`@repo/env`,
`@repo/logger`, `@repo/utils`, `@repo/types`); no imports from `ui` / `chrome` /
apps.

## Exports

| Subpath | Owns |
|---|---|
| `@repo/payload` | `createPayloadConfig`, `cloudinaryAdapter`, collection slugs |
| `@repo/payload/hooks/*` | Collection `afterChange` hooks (`revalidatePost`, `revalidateHomepage`) |

## ISR revalidation

Post pages are statically rendered and revalidated on demand. The `Posts`
collection's `afterChange` hook POSTs to the app's revalidation endpoint
whenever a post is published or updated.

`POST /api/revalidate`

- **Header:** `Authorization: Bearer $REVALIDATION_SECRET`
- **Body:** `{ "slug": "<post-slug>" }` or `{ "tag": "<cache-tag>" }`
- **Effect (slug):** revalidates `/`, `/posts`, `/posts/<slug>`, and the
  `post:<slug>` tag

Revalidation failures are logged via [`@repo/logger`](../logger/README.md) but
don't fail the Payload save — the page just stays on its old static copy until
the next time-based or manual revalidate. The hook itself is the in-repo
reference for Better Fetch's retry/timeout pattern; see
`src/hooks/revalidate-post/`.

## Media storage

Media defaults to **Payload's built-in local-disk storage**. With no
configuration, uploads to the `media` collection land in `apps/web/media/`
(ignored by git) and are served by Payload's static handler. This is the
zero-configuration path a fresh fork gets.

### Opting into Cloudinary

Set all three values in your environment (e.g. `apps/web/.env.development`):

```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

When all three are present, `createPayloadConfig` wires
`@payloadcms/plugin-cloud-storage` with the bundled `cloudinaryAdapter`,
sets `disableLocalStorage: true` on the `media` collection, and serves URLs
straight from Cloudinary's CDN. With any of the three missing, the plugin is
omitted entirely — local-disk storage is used.

Half-configured environments (e.g. only `CLOUDINARY_CLOUD_NAME` set) fall back
to local-disk; the env schema is `.optional()` on all three keys.

### Swapping in a different adapter

The bundled `cloudinaryAdapter` is intentionally small (~80 LOC at
`src/adapters/cloudinary/index.ts`) — it doubles as a working example of how to
write a Payload storage adapter against `@payloadcms/plugin-cloud-storage`. To
back the `media` collection with S3, Vercel Blob, UploadThing, GCS, or Azure
instead, replace the conditional `cloudStoragePlugin(...)` block in
`src/payload.config.ts` with the corresponding `@payloadcms/storage-*` package
and delete `src/adapters/cloudinary/` plus the `cloudinary` dependency and
`@repo/env/cloudinary` import.

## Decision log

- [#29 — Keep or replace the custom Cloudinary adapter?](../../docs/decisions/29-cloudinary.md)
