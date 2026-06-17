import type { Page } from "@repo/payload/payload-types"

export type SeedPage = {
  readonly slug: string
  readonly title: string
  readonly body: Page["body"]
  readonly meta?: {
    readonly title: string
    readonly description: string
  }
}
