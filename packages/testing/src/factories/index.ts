import type { User as AuthUser } from "@repo/auth"

let counter = 0

const nextId = (prefix: string): string => {
  counter += 1
  return `${prefix}_${counter.toString().padStart(4, "0")}`
}

export const resetFactoryCounter = (): void => {
  counter = 0
}

const FIXED_DATE = "2025-01-01T00:00:00.000Z"

export const buildUser = (overrides?: Partial<AuthUser>): AuthUser => {
  const id = overrides?.id ?? nextId("user")
  return {
    id,
    name: "Test User",
    email: `${id}@example.com`,
    emailVerified: true,
    image: null,
    createdAt: new Date(FIXED_DATE),
    updatedAt: new Date(FIXED_DATE),
    ...overrides,
  } as AuthUser
}
