import { NextResponse } from "next/server"

import { signupSchema } from "@/features/auth/types/auth.schema"
import { jsonError, parseBody } from "@/lib/api"
import { createSession, createUser, EmailTakenError } from "@/services/auth"

export async function POST(request: Request) {
  const parsed = await parseBody(request, signupSchema)
  if ("response" in parsed) return parsed.response

  try {
    const user = await createUser(parsed.data)
    await createSession(user.id)
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof EmailTakenError) {
      return jsonError("Email déjà utilisé", 409)
    }
    throw error
  }
}
