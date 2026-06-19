/**
 * Guard the seeder against ever touching a production database.
 *
 * On Vercel, both production *and* preview builds run with `NODE_ENV=production`,
 * so `NODE_ENV` alone cannot distinguish them. `VERCEL_ENV` does: it is
 * `"production"` for the production deploy and `"preview"` for branch previews.
 *
 * The seeder is allowed when the environment is a Vercel preview (the
 * branch-per-PR databases this exists for), and refused when:
 *  - it is the real Vercel production deploy (`VERCEL_ENV === "production"`), or
 *  - `NODE_ENV` is `"production"` outside Vercel preview — a local safety net so
 *    a hand-run `NODE_ENV=production pnpm seed` still aborts.
 */
export function assertSeedable(): void {
  const vercelEnv = process.env.VERCEL_ENV
  const isVercelProduction = vercelEnv === "production"
  const isVercelPreview = vercelEnv === "preview"
  const isProductionNodeEnv = process.env.NODE_ENV === "production"

  if (isVercelProduction || (isProductionNodeEnv && !isVercelPreview)) {
    throw new Error(
      "db-seed must not run in production — refusing to execute against a production database."
    )
  }
}
