# #29 — Keep or replace the custom Cloudinary adapter?

Investigation that produced the current Cloudinary wiring in [`@repo/payload`](../../packages/payload/README.md).

## Decision

**Default to Payload's local-disk storage; keep the custom Cloudinary adapter as an opt-in example wired only when `CLOUDINARY_*` env is set.**

Concretely:

- `@repo/env/cloudinary` declares all three `CLOUDINARY_*` vars as `z.string().optional()` so the env module no longer throws on a fresh fork.
- `createPayloadConfig` calls `resolveCloudinaryConfig()`; when it returns `undefined` the `cloudStoragePlugin(...)` entry is omitted from the plugins array and Payload's built-in local-disk storage takes over.
- The adapter file at `src/adapters/cloudinary/index.ts` stays put as the canonical "how to write a Payload storage adapter" reference for forkers.

## Rationale

1. **Starter onboarding.** A `git clone && pnpm dev` flow that requires provisioning a Cloudinary account before the app boots is a poor default for a "skip the first two weeks" starter. Local disk gets a forker to a working admin upload in zero steps; Cloudinary is a paste-three-env-vars upgrade.
2. **Payload has no official Cloudinary adapter.** Of the `@payloadcms/storage-*` family — S3, Vercel Blob, UploadThing, GCS, Azure — none target Cloudinary. Swapping our ~80-line adapter for a community package would trade auditable in-tree code for an external dependency without a clear upgrade in surface area. Keeping it in-tree preserves the illustrative value of a real adapter implementation.
3. **The adapter is small and self-contained.** `buildPublicId`, the `upload_stream` Promise wrapper, and the `staticHandler` redirect total under 80 lines and have not needed maintenance since they were written.

## Out of scope

The `CLOUDINARY_URL: ''` workaround in `tooling/github/ci/generate-types/action.yml` is tracked separately in #34 and was not removed by #29.
