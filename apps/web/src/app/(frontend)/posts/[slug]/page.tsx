import {
  type InternalDocResolvers,
  RichText,
} from "@repo/payload/components/RichText"
import type { Metadata } from "next"
import { draftMode } from "next/headers"
import { notFound } from "next/navigation"
import { match, P } from "ts-pattern"
import {
  getDraftPostBySlug,
  getPostBySlug,
} from "~/features/posts/api/post-by-slug"

const resolvePostHref = (doc: unknown): string | undefined =>
  match(doc)
    .with({ slug: P.string }, ({ slug }) => `/posts/${slug}`)
    .otherwise(() => undefined)

const internalDocResolvers: InternalDocResolvers = {
  posts: resolvePostHref,
}

type PostPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) {
    return {}
  }
  return {
    title: post.title,
    description: post.description ?? undefined,
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const post = isDraft
    ? await getDraftPostBySlug(slug)
    : await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="constrainer flex flex-col space-y-6 py-10">
      <header className="space-y-3">
        <h1 className="font-display text-heading-xl text-text-primary">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-body-lg text-text-secondary">{post.description}</p>
        )}
      </header>

      {post.sections?.map((section) => (
        <section className="space-y-2" key={section.id}>
          {section.heading && (
            <h2 className="font-display text-heading-md text-text-primary">
              {section.heading}
            </h2>
          )}
          <RichText
            data={section.body}
            internalDocResolvers={internalDocResolvers}
          />
        </section>
      ))}
    </article>
  )
}
