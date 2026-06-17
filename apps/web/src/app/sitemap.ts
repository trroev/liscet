import { env } from "@repo/env/app"
import type { MetadataRoute } from "next"

export const revalidate = 3600

type SitemapRoute = {
  readonly path: string
  readonly changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >
  readonly priority: number
}

const PUBLIC_ROUTES = [
  { path: "/", changeFrequency: "monthly", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/subprocessors", changeFrequency: "yearly", priority: 0.3 },
] as const satisfies ReadonlyArray<SitemapRoute>

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url:
      route.path === "/"
        ? env.BASE_URL
        : new URL(route.path, env.BASE_URL).toString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
