import { scopeSentry } from "@repo/observability"
import type { CollectionBeforeDeleteHook } from "payload"

// FKs are ON DELETE set null, so child rows must be deleted explicitly here
// rather than left orphaned when the user is removed.
export const cascadeDeleteUser: CollectionBeforeDeleteHook = async ({
  id,
  req,
}): Promise<void> => {
  scopeSentry({ practitionerId: String(id) })
  for (const collection of ["licenses", "courses"] as const) {
    await req.payload.delete({
      collection,
      overrideAccess: true,
      req,
      where: { practitioner: { equals: id } },
    })
  }
}
