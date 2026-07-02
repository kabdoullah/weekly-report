import { NextResponse, type NextRequest } from "next/server"
import { unsealData } from "iron-session"

import { findUserById } from "@/services/auth/user-store"
import {
  getSessionOptions,
  type SessionData,
} from "@/services/auth/session-options"

const PUBLIC_PAGES = ["/login", "/signup"]

export async function proxy(request: NextRequest) {
  const sessionOptions = getSessionOptions()
  const cookie = request.cookies.get(sessionOptions.cookieName)?.value
  const session = cookie
    ? await unsealData<SessionData>(cookie, {
        password: sessionOptions.password,
      }).catch(() => null)
    : null
  // Validate the cookie's userId still exists: a stale session (e.g. after a
  // dev DB reset) must read as logged-out, otherwise /login and protected
  // pages disagree and redirect each other in a loop.
  const user = session?.userId ? await findUserById(session.userId) : null
  const isAuthed = Boolean(user)
  const isStale = Boolean(session?.userId) && !user
  const { pathname } = request.nextUrl

  const response = ((): NextResponse => {
    if (pathname.startsWith("/api/reports")) {
      return isAuthed
        ? NextResponse.next()
        : NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (PUBLIC_PAGES.includes(pathname)) {
      return isAuthed
        ? NextResponse.redirect(new URL("/", request.url))
        : NextResponse.next()
    }

    return isAuthed
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url))
  })()

  if (isStale) response.cookies.delete(sessionOptions.cookieName)
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
