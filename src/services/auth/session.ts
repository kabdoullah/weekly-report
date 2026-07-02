import "server-only"

import { cookies } from "next/headers"
import { getIronSession } from "iron-session"

import { getSessionOptions, type SessionData } from "./session-options"
import { findUserById } from "./user-store"

export type { SessionData } from "./session-options"

async function ironSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions())
}

/**
 * Validates the cookie's userId against the user store so a stale session
 * (e.g. a dev DB reset) reads as logged-out everywhere instead of callers
 * disagreeing — without mutating cookies here, since this runs from plain
 * Server Components (layout, pages) where cookie writes are disallowed.
 */
export async function getSession(): Promise<SessionData | null> {
  const session = await ironSession()
  if (!session.userId) return null

  const user = await findUserById(session.userId)
  if (!user) return null

  return { userId: session.userId }
}

export async function createSession(userId: string): Promise<void> {
  const session = await ironSession()
  session.userId = userId
  await session.save()
}

export async function destroySession(): Promise<void> {
  const session = await ironSession()
  session.destroy()
}

export async function requireSession(): Promise<SessionData> {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}
