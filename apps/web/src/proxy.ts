import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

const PROTECTED_PATHS = ["/submit", "/profile"] as const

const isProtectedPath = (pathname: string): boolean =>
  PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  const sessionCookie = getSessionCookie(request)
  if (sessionCookie) {
    return NextResponse.next()
  }

  const signInUrl = new URL("/sign-in", request.url)
  signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`)
  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: ["/submit/:path*", "/profile/:path*"],
}
