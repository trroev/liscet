import "server-only"

import { auth } from "~/features/auth/auth.server"

type VerifyUserPasswordInput = {
  betterAuthId: string
  password: string
}

export type VerifyUserPasswordOutcome = "valid" | "invalid" | "unavailable"

/**
 * Checks a plaintext password against the BetterAuth credential account for
 * the given user, using BetterAuth's own hasher (never a raw DB comparison).
 * Returns "unavailable" when the user has no password-based credential
 * account to verify against.
 */
export const verifyUserPassword = async ({
  betterAuthId,
  password,
}: VerifyUserPasswordInput): Promise<VerifyUserPasswordOutcome> => {
  const ctx = await auth.$context
  const accounts = await ctx.internalAdapter.findAccounts(betterAuthId)
  const credentialAccount = accounts.find(
    (account) => account.providerId === "credential"
  )
  if (!credentialAccount?.password) {
    return "unavailable"
  }

  const isPasswordValid = await ctx.password.verify({
    hash: credentialAccount.password,
    password,
  })
  return isPasswordValid ? "valid" : "invalid"
}
