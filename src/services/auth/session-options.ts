/**
 * No `next/headers` import here on purpose — this file must stay importable
 * from `middleware.ts` (Edge runtime), which can't use `getIronSession`/
 * `cookies()` and instead calls `unsealData` directly against the raw cookie.
 */

export interface SessionData {
  userId: string
}

interface SessionOptions {
  cookieName: string
  password: string
  ttl: number
  cookieOptions: { secure: boolean }
}

/** Lazy + validated on every call, matching the fail-fast style of `services/ai`. */
export function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters")
  }
  return {
    cookieName: "wr_session",
    password,
    ttl: 60 * 60 * 24 * 30,
    cookieOptions: { secure: process.env.NODE_ENV === "production" },
  }
}
