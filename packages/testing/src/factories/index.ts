import type { User as AuthUser } from "@repo/auth"

export type PostFixture = {
  id: string
  title: string
  slug: string
  generateSlug?: boolean | null
  description?: string | null
  author?: string | null
  authorUser?: string | null
  sections?: Array<{
    id?: string | null
    heading: string
    body: string
  }> | null
  publishedAt?: string | null
  _status?: "draft" | "published" | null
  createdAt: string
  updatedAt: string
}

let counter = 0

const nextId = (prefix: string): string => {
  counter += 1
  return `${prefix}_${counter.toString().padStart(4, "0")}`
}

export const resetFactoryCounter = (): void => {
  counter = 0
}

const FIXED_DATE = "2025-01-01T00:00:00.000Z"

export const buildUser = (overrides?: Partial<AuthUser>): AuthUser => {
  const id = overrides?.id ?? nextId("user")
  return {
    id,
    name: "Test User",
    email: `${id}@example.com`,
    emailVerified: true,
    image: null,
    createdAt: new Date(FIXED_DATE),
    updatedAt: new Date(FIXED_DATE),
    ...overrides,
  } as AuthUser
}

export const buildPost = (overrides?: Partial<PostFixture>): PostFixture => {
  const id = overrides?.id ?? nextId("post")
  return {
    id,
    title: "Test Post",
    slug: `test-post-${id}`,
    generateSlug: true,
    description: "A deterministic post used in tests.",
    author: "Test Author",
    authorUser: null,
    sections: [
      {
        id: nextId("section"),
        heading: "Introduction",
        body: "Lorem ipsum dolor sit amet.",
      },
    ],
    publishedAt: FIXED_DATE,
    _status: "published",
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...overrides,
  }
}
