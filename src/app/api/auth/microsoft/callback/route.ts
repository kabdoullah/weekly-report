import { NextResponse, type NextRequest } from "next/server"

import { saveMicrosoftTokens } from "@/services/storage/token-store"
import { getMailProvider } from "@/services/mail"

const STATE_COOKIE = "ms_oauth_state"

/** Exchanges the authorization code, stores the encrypted token set, redirects to /settings. */
export async function GET(request: NextRequest) {
  const settingsUrl = new URL("/settings", request.url)
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const expectedState = request.cookies.get(STATE_COOKIE)?.value

  if (!code || !state || !expectedState || state !== expectedState) {
    settingsUrl.searchParams.set("error", "invalid_state")
    const response = NextResponse.redirect(settingsUrl)
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  try {
    const provider = getMailProvider()
    const tokens = await provider.exchangeCode(code)
    const profile = await provider.getProfile(tokens.accessToken)
    await saveMicrosoftTokens(tokens, profile.email)

    settingsUrl.searchParams.set("connected", "1")
    const response = NextResponse.redirect(settingsUrl)
    response.cookies.delete(STATE_COOKIE)
    return response
  } catch {
    settingsUrl.searchParams.set("error", "connect_failed")
    const response = NextResponse.redirect(settingsUrl)
    response.cookies.delete(STATE_COOKIE)
    return response
  }
}
