"use client"

import { Button } from "@repo/ui/components/Button"
import { useTransition } from "react"
import { signOutAction } from "../../actions/sign-out"

export const SignOutButton = () => {
  const [isPending, startTransition] = useTransition()

  const handleSignOut = (): void => {
    startTransition(async () => {
      await signOutAction()
    })
  }

  return (
    <Button disabled={isPending} onClick={handleSignOut} variant="secondary">
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  )
}
