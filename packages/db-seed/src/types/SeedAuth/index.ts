/**
 * Structural type for the subset of BetterAuth used by the seeder. Captured
 * structurally so the db-seed package does not depend on better-auth at the
 * type level — the CLI passes its real `auth` instance and TS checks shape.
 */
export type SeedAuth = {
  readonly api: {
    readonly signUpEmail: (input: {
      body: {
        readonly email: string
        readonly password: string
        readonly name: string
      }
    }) => Promise<unknown>
  }
}
