import "server-only"

import { cookies } from "next/headers"
import { getIronSession } from "iron-session"

import { getSessionOptions, type SessionData } from "./session-options"

export type { SessionData } from "./session-options"

async function ironSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions())
}

export async function getSession(): Promise<SessionData | null> {
  const session = await ironSession()
  return session.userId ? { userId: session.userId } : null
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
