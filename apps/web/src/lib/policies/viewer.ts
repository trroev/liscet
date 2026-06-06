import type { Admin, User } from "@repo/payload/payload-types"

export type Viewer =
  | { kind: "admin"; admin: Admin }
  | { kind: "user"; user: User }
  | null
