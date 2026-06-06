import type { Access } from "payload"

// Only Admins collection users can authenticate with Payload, so any
// authenticated req.user is an admin by definition.
export const isAdmin: Access = ({ req: { user } }) => Boolean(user)
