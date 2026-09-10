/**
 * The subset of a better-auth user needed to mirror profile fields into the
 * Payload `users` record.
 */
type PractitionerSyncSource = {
  name?: string | null
  email: string
  image?: string | null
}

/**
 * Profile fields written to the Payload `users` record on create/update sync.
 */
type PractitionerSyncData = {
  displayName: string
  email: string
  imageUrl?: string | null
}

/**
 * Maps a better-auth user onto the Payload profile fields, carrying the OAuth
 * avatar URL through to `imageUrl`.
 *
 * `image` follows the source's null/undefined semantics. `undefined` means the
 * field was not part of this sync, so `imageUrl` is omitted and any stored value
 * is left intact. `null` (or an empty string) means the OAuth image was
 * intentionally cleared, so `null` is written to drop the now-stale URL rather
 * than letting it persist indefinitely.
 */
export const buildPractitionerSyncData = ({
  user,
}: {
  user: Readonly<PractitionerSyncSource>
}): PractitionerSyncData => {
  const data: PractitionerSyncData = {
    displayName: user.name ?? "",
    email: user.email,
  }
  if (user.image === undefined) {
    return data
  }
  return { ...data, imageUrl: user.image || null }
}
