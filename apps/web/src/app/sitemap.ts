import { env } from "@repo/env/app"
import type { MetadataRoute } from "next"

export const revalidate = 3600

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: env.BASE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: new URL("/about", env.BASE_URL).toString(),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: new URL("/pricing", env.BASE_URL).toString(),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: new URL("/contact", env.BASE_URL).toString(),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]
}
