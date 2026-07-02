import { NextResponse, type NextRequest } from "next/server"
import { unsealData } from "iron-session"

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
  const isAuthed = Boolean(session?.userId)
  const { pathname } = request.nextUrl

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
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
