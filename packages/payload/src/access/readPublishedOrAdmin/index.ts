import type { Access } from "payload"

// Admins (any authenticated Payload user) read everything, including drafts.
// Anonymous callers are constrained to published docs via a query filter, so
// drafts on a versioned collection stay admin-only.
export const readPublishedOrAdmin: Access = ({ req: { user } }) =>
  user ? true : { _status: { equals: "published" } }
