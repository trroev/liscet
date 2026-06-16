import type { Access } from "payload"

type MediaOwner = {
  readonly avatar?: string | { id: string } | null
}

const relationshipId = (
  value: string | { id: string } | null | undefined
): string | null => {
  if (!value) {
    return null
  }
  return typeof value === "object" ? value.id : value
}

/**
 * Read access for the `media` collection. Admins see everything; a practitioner
 * may only read media they own — their own avatar and the certificates attached
 * to their courses (walked via the Course → practitioner relationship). Anyone
 * unauthenticated is denied. Returning a `Where` keeps the gate enforceable as a
 * query constraint rather than a per-document boolean.
 */
export const canReadOwnMedia: Access = async ({ req }) => {
  const { user } = req
  if (!user) {
    return false
  }
  if (user.collection === "admins") {
    return true
  }

  const courses = await req.payload.find({
    collection: "courses",
    depth: 0,
    overrideAccess: true,
    pagination: false,
    req,
    where: { practitioner: { in: [user.id] } },
  })

  const ownedIds = courses.docs
    .map((course) => relationshipId(course.certificate))
    .filter((id): id is string => id !== null)

  const avatarId = relationshipId((user as MediaOwner).avatar)
  if (avatarId) {
    ownedIds.push(avatarId)
  }

  if (ownedIds.length === 0) {
    return false
  }

  return { id: { in: ownedIds } }
}
