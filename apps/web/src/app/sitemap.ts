import { env } from "@repo/env/app"
import type { MetadataRoute } from "next"
import { getPublishedPages } from "~/lib/queries/pages"

export const revalidate = 3600

type SitemapRoute = {
  readonly path: string
  readonly changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >
  readonly priority: number
}

// Routes not backed by the `Pages` collection. CMS-driven marketing pages
// (/about, /pricing, /contact, and any future ones) are enumerated below.
const STATIC_ROUTES = [
  { path: "/", changeFrequency: "monthly", priority: 1.0 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/subprocessors", changeFrequency: "yearly", priority: 0.3 },
] as const satisfies ReadonlyArray<SitemapRoute>

const toUrl = (path: string): string =>
  path === "/" ? env.BASE_URL : new URL(path, env.BASE_URL).toString()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getPublishedPages()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: toUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const pageEntries: MetadataRoute.Sitemap = pages.map((page) => ({
    url: toUrl(`/${page.slug}`),
    lastModified: new Date(page.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  return [...staticEntries, ...pageEntries]
}
