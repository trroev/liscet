import { SessionProvider } from "@repo/auth/session"
import { env } from "@repo/env/app"
import type { Metadata, Viewport } from "next"
import { headers } from "next/headers"
import { ThemeProvider } from "next-themes"
import type React from "react"
import { FeedbackButton } from "~/components/FeedbackButton"
import { PostHogProvider } from "~/components/PostHogProvider"
import { QueryProvider } from "~/components/QueryProvider"
import { SentryUser } from "~/components/SentryUser"
import { auth } from "~/features/auth/auth.server"
import { geist, geistMono } from "~/fonts"

import "../globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(env.BASE_URL),
  title: { template: "%s | Liscet", default: "Liscet" },
  description:
    "Track professional licenses and continuing-education credits toward renewal.",
}

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <html
      className={`${geist.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col font-sans">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <SessionProvider initialUser={session?.user ?? null}>
            <QueryProvider>
              <SentryUser />
              {session ? (
                <PostHogProvider>
                  {children}
                  <FeedbackButton />
                </PostHogProvider>
              ) : (
                children
              )}
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
