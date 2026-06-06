import { env } from "@repo/env/app"
import type { MetadataRoute } from "next"
import { getPublishedPosts } from "~/features/posts/api/published-posts"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts()

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${env.BASE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [
    {
      url: env.BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${env.BASE_URL}/posts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...postEntries,
  ]
}
