import { SessionProvider } from "@repo/auth/session"
import { env } from "@repo/env/app"
import type { Metadata, Viewport } from "next"
import { ThemeProvider } from "next-themes"
import type React from "react"
import { FeedbackButton } from "~/components/FeedbackButton"
import { PostHogProvider } from "~/components/PostHogProvider"
import { QueryProvider } from "~/components/QueryProvider"
import { SentryUser } from "~/components/SentryUser"
import { geist, geistMono } from "~/fonts"
import { viewer } from "~/lib/queries/current-viewer"

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
  openGraph: {
    type: "website",
    siteName: "Liscet",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const current = await viewer()

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
          <SessionProvider initialUser={current?.session ?? null}>
            <QueryProvider>
              <SentryUser practitionerId={current?.user?.id ?? null} />
              {current ? (
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
