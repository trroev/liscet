import { test } from "@playwright/test"
import { PostDetailPage } from "../page-objects/post-detail-page"
import { PostsListPage } from "../page-objects/posts-list-page"

const requireEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing ${key} — global setup did not seed a post.`)
  }
  return value
}

test("posts read: list and detail render the seeded post", async ({ page }) => {
  const title = requireEnv("E2E_SEEDED_POST_TITLE")
  const sectionHeading = requireEnv("E2E_SEEDED_POST_SECTION_HEADING")

  const list = new PostsListPage(page)
  await list.goto()
  await list.openPost(title)

  const detail = new PostDetailPage(page)
  await detail.expectVisible({ title, sectionHeading })
})
