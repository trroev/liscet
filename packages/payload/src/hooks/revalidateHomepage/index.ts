import { revalidatePath } from "next/cache"
import type { GlobalAfterChangeHook } from "payload"

export const revalidateHomepage: GlobalAfterChangeHook = ({ doc }) => {
  revalidatePath("/")

  return doc
}
