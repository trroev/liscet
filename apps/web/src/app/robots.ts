import { env } from "@repo/env/app"
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    sitemap: `${env.BASE_URL}/sitemap.xml`,
  }
}
