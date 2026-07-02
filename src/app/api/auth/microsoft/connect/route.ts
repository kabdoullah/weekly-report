import { randomUUID } from "node:crypto"

import { NextResponse, type NextRequest } from "next/server"

import { getMailProvider } from "@/services/mail"

const STATE_COOKIE = "ms_oauth_state"

/** Redirects to Microsoft's consent screen, with a CSRF `state` cookie. */
export async function GET(request: NextRequest) {
  const state = randomUUID()
  const authUrl = await getMailProvider().getAuthUrl(state)

  const response = NextResponse.redirect(authUrl)
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  })
  return response
}
