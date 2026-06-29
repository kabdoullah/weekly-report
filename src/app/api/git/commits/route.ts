import { NextResponse } from "next/server"

import { gitCommitsRequestSchema } from "@/features/git/types"
import { jsonError, parseBody } from "@/lib/api"
import { getCommitSubjects } from "@/services/git/log"

export async function POST(request: Request) {
  const parsed = await parseBody(request, gitCommitsRequestSchema)
  if ("response" in parsed) return parsed.response

  try {
    const commits = await getCommitSubjects(parsed.data)
    return NextResponse.json({ commits })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec git"
    return jsonError(message, 400)
  }
}
