"use client"

import { env } from "@repo/env/app"
import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import type { ReactNode } from "react"
import { useEffect } from "react"

export const PostHogProvider = ({
  children,
}: {
  children: ReactNode
}): ReactNode => {
  useEffect(() => {
    if (!env.NEXT_PUBLIC_POSTHOG_KEY) {
      return
    }
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: true,
      capture_pageleave: true,
      person_profiles: "identified_only",
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "[data-ph-mask]",
      },
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
