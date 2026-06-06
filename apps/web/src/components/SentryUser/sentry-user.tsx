"use client"

import { useSession } from "@repo/auth/session"
import { setUser } from "@sentry/nextjs"
import { useEffect } from "react"

export const SentryUser = (): null => {
  const { user } = useSession()
  useEffect(() => {
    if (user) {
      setUser({ id: user.id })
      return
    }
    setUser(null)
  }, [user])
  return null
}
