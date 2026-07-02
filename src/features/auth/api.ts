import {
  userSchema,
  type LoginInput,
  type SignupInput,
  type User,
} from "./types/auth.schema"

/**
 * Typed client for the auth API. Mirrors `features/report/api.ts`.
 */

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* keep default message */
    }
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function signup(input: SignupInput): Promise<User> {
  const data = await request<unknown>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  })
  return userSchema.parse(data)
}

export async function login(input: LoginInput): Promise<User> {
  const data = await request<unknown>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  })
  return userSchema.parse(data)
}

export async function logout(): Promise<void> {
  await request<void>("/api/auth/logout", { method: "POST" })
}
