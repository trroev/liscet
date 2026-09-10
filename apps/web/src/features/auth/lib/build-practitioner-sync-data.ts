/**
 * The subset of a better-auth user needed to mirror profile fields into the
 * Payload `users` record.
 */
export type PractitionerSyncSource = {
  name?: string | null
  email: string
  image?: string | null
}

/**
 * Profile fields written to the Payload `users` record on create/update sync.
 * `imageUrl` is present only when the source carries one, so a user without an
 * OAuth image (e.g. email/password) is never overwritten with an empty value.
 */
export type PractitionerSyncData = {
  displayName: string
  email: string
  imageUrl?: string
}

/**
 * Maps a better-auth user onto the Payload profile fields, carrying the OAuth
 * avatar URL through when one is present. Null-safe: a missing or empty `image`
 * is omitted entirely rather than written as an empty string, so an existing
 * `imageUrl` is left intact on re-sync.
 */
export const buildPractitionerSyncData = ({
  user,
}: {
  user: PractitionerSyncSource
}): PractitionerSyncData => {
  const data: PractitionerSyncData = {
    displayName: user.name ?? "",
    email: user.email,
  }
  return user.image ? { ...data, imageUrl: user.image } : data
}
