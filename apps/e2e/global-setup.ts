import { seedPublishedPost } from "./src/fixtures/seed"
import { getOrInitTestEnv } from "./src/fixtures/test-env"

const globalSetup = async (): Promise<void> => {
  getOrInitTestEnv()
  const seeded = await seedPublishedPost()
  process.env.E2E_SEEDED_POST_SLUG = seeded.slug
  process.env.E2E_SEEDED_POST_TITLE = seeded.title
  process.env.E2E_SEEDED_POST_SECTION_HEADING = seeded.sectionHeading
  process.env.E2E_SEEDED_POST_SECTION_BODY = seeded.sectionBody
}

export default globalSetup
