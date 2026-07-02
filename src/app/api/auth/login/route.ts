import { NextResponse } from "next/server"

import { loginSchema } from "@/features/auth/types/auth.schema"
import { jsonError, parseBody } from "@/lib/api"
import { createSession, findUserByEmail, verifyPassword } from "@/services/auth"

export async function POST(request: Request) {
  const parsed = await parseBody(request, loginSchema)
  if ("response" in parsed) return parsed.response

  const user = await findUserByEmail(parsed.data.email)
  const valid = user
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : false

  if (!user || !valid) {
    return jsonError("Email ou mot de passe incorrect", 401)
  }

  await createSession(user.id)
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  })
}
