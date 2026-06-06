import type { Metadata } from "next"
import Link from "next/link"
import { getPublishedPosts } from "~/features/posts/api/published-posts"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Posts",
  description: "Browse the latest posts.",
}

export default async function PostsPage() {
  const posts = await getPublishedPosts()

  return (
    <section className="constrainer flex flex-col space-y-8 py-10">
      <h1 className="font-display text-heading-xl text-text-primary">Posts</h1>
      {posts.length === 0 ? (
        <p className="text-body text-text-secondary">
          No posts yet. Create one in the{" "}
          <Link className="underline" href="/admin">
            admin panel
          </Link>
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                className="text-body-lg text-text-primary hover:underline"
                href={`/posts/${post.slug}`}
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
