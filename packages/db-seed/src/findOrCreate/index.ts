import type {
  CollectionSlug,
  Payload,
  RequiredDataFromCollectionSlug,
  Where,
} from "payload"

type FindOrCreateArgs<TSlug extends CollectionSlug> = {
  readonly payload: Payload
  readonly collection: TSlug
  readonly where: Where
  readonly data: RequiredDataFromCollectionSlug<TSlug>
}

type FindOrCreateResult = {
  readonly created: boolean
  readonly id: string
}

/**
 * Idempotent "check, then create" for seed scripts: looks the doc up by the
 * supplied `where` filter and returns it if it exists, otherwise creates it
 * and returns the new record. Always runs with `overrideAccess: true` since
 * the seeder is a system-level CLI.
 *
 * Required because the seed AC forbids catching unique-constraint errors —
 * the check has to happen explicitly before insert.
 */
export async function findOrCreate<TSlug extends CollectionSlug>({
  payload,
  collection,
  where,
  data,
}: FindOrCreateArgs<TSlug>): Promise<FindOrCreateResult> {
  const existing = await payload.find({
    collection,
    where,
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })
  const [found] = existing.docs
  if (found !== undefined) {
    return { created: false, id: String(found.id) }
  }
  const created = await payload.create({
    collection,
    data,
    overrideAccess: true,
  })
  return { created: true, id: String(created.id) }
}
