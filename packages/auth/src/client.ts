import { captureException } from "@repo/observability"
import { createAuthClient } from "better-auth/react"
import { friendlyAuthMessage, GENERIC_AUTH_ERROR_MESSAGE } from "./errors"

const rawAuthClient = createAuthClient()

export type AuthResult<TData> =
  | { status: "ok"; data: TData }
  | { status: "error"; code: string; friendlyMessage: string }

type BetterAuthResponse<TData> = {
  data: TData | null
  error: { code?: string; message?: string; status?: number } | null
}

const toAuthResult = async <TData>(
  request: Promise<BetterAuthResponse<TData>>
): Promise<AuthResult<TData>> => {
  try {
    const { data, error } = await request
    if (error) {
      return {
        status: "error",
        code: error.code ?? "UNKNOWN_ERROR",
        friendlyMessage: friendlyAuthMessage({
          code: error.code,
          fallback: error.message,
        }),
      }
    }
    return { status: "ok", data: data as TData }
  } catch (cause) {
    captureException(cause)
    return {
      status: "error",
      code: "NETWORK_ERROR",
      friendlyMessage: GENERIC_AUTH_ERROR_MESSAGE,
    }
  }
}

type SignInEmailParams = {
  email: string
  password: string
}

type SignUpEmailParams = {
  name: string
  email: string
  password: string
}

type SignInEmailData = Awaited<
  ReturnType<typeof rawAuthClient.signIn.email>
>["data"]

type SignUpEmailData = Awaited<
  ReturnType<typeof rawAuthClient.signUp.email>
>["data"]

export const authClient = {
  useSession: rawAuthClient.useSession,
  signIn: {
    email: (params: SignInEmailParams): Promise<AuthResult<SignInEmailData>> =>
      toAuthResult(rawAuthClient.signIn.email(params)),
  },
  signUp: {
    email: (params: SignUpEmailParams): Promise<AuthResult<SignUpEmailData>> =>
      toAuthResult(rawAuthClient.signUp.email(params)),
  },
}
