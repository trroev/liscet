import { env } from "@repo/env/app"
import { revalidatePath, revalidateTag } from "next/cache"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { match } from "ts-pattern"
import { z } from "zod"

const REVALIDATION_TAGS = ["homepage"] as const satisfies ReadonlyArray<string>

const revalidateBodySchema = z.union([
  z.object({ tag: z.enum(REVALIDATION_TAGS) }),
  z.object({ slug: z.string().min(1) }),
])

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (
    request.headers.get("authorization") !== `Bearer ${env.REVALIDATION_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rawBody: unknown = await request.json().catch(() => null)
  const parsed = revalidateBodySchema.safeParse(rawBody)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 }
    )
  }

  return match(parsed.data)
    .with({ tag: "homepage" }, ({ tag }) => {
      revalidateTag(tag, "default")
      revalidatePath("/")
      return NextResponse.json({ revalidated: true, tag })
    })
    .otherwise(({ slug }) => {
      revalidatePath("/")
      revalidatePath("/posts")
      revalidatePath(`/posts/${slug}`)
      revalidateTag(`post:${slug}`, "default")
      return NextResponse.json({ revalidated: true, slug })
    })
}
