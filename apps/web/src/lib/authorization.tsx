import type { ReactNode } from "react"
import { match, P } from "ts-pattern"
import type { Viewer } from "./policies/viewer"

type Role = "admin" | "user"

type AuthorizationProps =
  | {
      children: ReactNode
      forbiddenFallback?: ReactNode
      allowedRoles: ReadonlyArray<Role>
      viewer: Viewer
    }
  | {
      children: ReactNode
      forbiddenFallback?: ReactNode
      policyCheck: boolean
    }

/**
 * Server-side authorization gate. Accepts either a `policyCheck` boolean
 * (typically the return value of a function from `lib/policies`) or an
 * `allowedRoles` list paired with the current `viewer`.
 *
 * Renders `children` when authorized, otherwise renders `forbiddenFallback`
 * (defaulting to `null`).
 */
export const Authorization = (props: AuthorizationProps): ReactNode => {
  const isAllowed = match(props)
    .with({ policyCheck: P.boolean }, ({ policyCheck }) => policyCheck)
    .with(
      { allowedRoles: P.array(), viewer: P.not(null) },
      ({ allowedRoles, viewer }) =>
        allowedRoles.some((role) => role === viewer.kind)
    )
    .otherwise(() => false)
  return isAllowed ? props.children : (props.forbiddenFallback ?? null)
}
