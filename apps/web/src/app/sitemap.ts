import { env } from "@repo/env/app"
import type { MetadataRoute } from "next"

export const revalidate = 3600

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: env.BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
  ]
}
