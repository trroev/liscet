"use client"

import { createContext, type ReactNode, useContext } from "react"
import { authClient } from "./client"
import type { User } from "./index"

type SessionContextValue = {
  initialUser: User | null
}

const SessionContext = createContext<SessionContextValue>({ initialUser: null })

type SessionProviderProps = {
  initialUser: User | null
  children: ReactNode
}

export const SessionProvider = ({
  initialUser,
  children,
}: SessionProviderProps) => (
  <SessionContext.Provider value={{ initialUser }}>
    {children}
  </SessionContext.Provider>
)

type UseSessionResult = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export const useSession = (): UseSessionResult => {
  const { initialUser } = useContext(SessionContext)
  const { data, isPending } = authClient.useSession()
  const clientUser = (data?.user as User | null | undefined) ?? null
  const user = isPending ? initialUser : clientUser

  return {
    user,
    isLoading: isPending && initialUser === null,
    isAuthenticated: user !== null,
  }
}
